BEGIN;

CREATE TABLE public.public_match_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('fixture', 'schedule', 'status', 'score', 'result')),
  slot text CHECK (slot IS NULL OR slot = kind),
  status text NOT NULL,
  home_team_id uuid NOT NULL,
  away_team_id uuid NOT NULL,
  home_team_name text NOT NULL,
  away_team_name text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  venue text,
  home_score integer NOT NULL,
  away_score integer NOT NULL,
  published_at timestamptz NOT NULL DEFAULT statement_timestamp(),
  revision integer NOT NULL DEFAULT 1,
  UNIQUE (match_id, slot)
);

CREATE INDEX public_match_notifications_tournament_activity
  ON public.public_match_notifications (tournament_id, published_at DESC, id DESC);

ALTER TABLE public.public_match_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_match_notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_match_notifications TO anon, authenticated;

CREATE POLICY "Read activity for publicly visible matches"
ON public.public_match_notifications FOR SELECT TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM public.matches AS m
  WHERE m.id = public_match_notifications.match_id
    AND m.tournament_id IS NOT DISTINCT FROM public_match_notifications.tournament_id
    AND m.status IN ('scheduled', 'live', 'half_time', 'completed', 'cancelled', 'postponed')
    AND (kind <> 'result' OR m.status = 'completed')
    AND (kind <> 'score' OR m.status IN ('live', 'half_time'))
));

CREATE FUNCTION public.write_public_match_notification(
  fixture public.matches,
  activity_kind text,
  activity_slot text
)
RETURNS void
LANGUAGE sql
SET search_path = pg_catalog, public
AS $$
  INSERT INTO public.public_match_notifications AS n (
    tournament_id, match_id, kind, slot, status, home_team_id, away_team_id, home_team_name, away_team_name,
    scheduled_at, venue, home_score, away_score
  ) VALUES (
    fixture.tournament_id, fixture.id, activity_kind, activity_slot, fixture.status,
    fixture.home_team_id, fixture.away_team_id,
    (SELECT name FROM public.teams WHERE id = fixture.home_team_id),
    (SELECT name FROM public.teams WHERE id = fixture.away_team_id),
    fixture.scheduled_at, fixture.venue,
    fixture.home_score, fixture.away_score
  )
  ON CONFLICT (match_id, slot) DO UPDATE SET
    tournament_id = EXCLUDED.tournament_id,
    status = EXCLUDED.status,
    home_team_id = EXCLUDED.home_team_id,
    away_team_id = EXCLUDED.away_team_id,
    home_team_name = EXCLUDED.home_team_name,
    away_team_name = EXCLUDED.away_team_name,
    scheduled_at = EXCLUDED.scheduled_at,
    venue = EXCLUDED.venue,
    home_score = EXCLUDED.home_score,
    away_score = EXCLUDED.away_score,
    published_at = EXCLUDED.published_at,
    revision = n.revision + 1;
$$;

CREATE FUNCTION public.capture_public_match_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  was_public boolean := false;
  participants_changed boolean := false;
  score_changed boolean := false;
BEGIN
  IF NEW.status NOT IN ('scheduled', 'live', 'half_time', 'completed', 'cancelled', 'postponed') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    was_public := OLD.status IN ('scheduled', 'live', 'half_time', 'completed', 'cancelled', 'postponed')
      AND OLD.tournament_id IS NOT DISTINCT FROM NEW.tournament_id;
    participants_changed := (OLD.home_team_id, OLD.away_team_id)
      IS DISTINCT FROM (NEW.home_team_id, NEW.away_team_id);
    score_changed := (OLD.home_score, OLD.away_score)
      IS DISTINCT FROM (NEW.home_score, NEW.away_score);
  END IF;

  IF NOT was_public THEN
    PERFORM public.write_public_match_notification(NEW, 'fixture', 'fixture');
  ELSIF participants_changed OR (OLD.scheduled_at, OLD.venue) IS DISTINCT FROM (NEW.scheduled_at, NEW.venue) THEN
    PERFORM public.write_public_match_notification(NEW, 'schedule', NULL);
  END IF;

  IF NEW.status = 'completed' THEN
    IF NOT was_public OR OLD.status IS DISTINCT FROM NEW.status OR score_changed OR participants_changed THEN
      PERFORM public.write_public_match_notification(NEW, 'result', 'result');
    END IF;
  ELSE
    IF (NOT was_public AND NEW.status <> 'scheduled') OR (was_public AND OLD.status IS DISTINCT FROM NEW.status) THEN
      PERFORM public.write_public_match_notification(NEW, 'status', NULL);
    END IF;

    IF NEW.status IN ('live', 'half_time') THEN
      IF score_changed OR participants_changed OR (
        (NOT was_public OR OLD.status NOT IN ('live', 'half_time'))
        AND (NEW.home_score <> 0 OR NEW.away_score <> 0)
      ) THEN
        PERFORM public.write_public_match_notification(NEW, 'score', 'score');
      ELSIF was_public AND OLD.status NOT IN ('live', 'half_time') THEN
        DELETE FROM public.public_match_notifications WHERE match_id = NEW.id AND slot = 'score';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.write_public_match_notification(public.matches, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.capture_public_match_activity()
  FROM PUBLIC, anon, authenticated;

-- The source rows can establish a publication, current status or result.
-- Older reschedule and score transitions cannot be reconstructed.
INSERT INTO public.public_match_notifications (
  tournament_id, match_id, kind, slot, status, home_team_id, away_team_id, home_team_name, away_team_name,
  scheduled_at, venue, home_score, away_score, published_at
)
SELECT m.tournament_id, m.id, activity.kind, activity.slot, m.status, m.home_team_id, m.away_team_id, home.name, away.name,
       m.scheduled_at, m.venue, m.home_score, m.away_score, activity.published_at
FROM public.matches AS m
JOIN public.teams AS home ON home.id = m.home_team_id
JOIN public.teams AS away ON away.id = m.away_team_id
CROSS JOIN LATERAL (VALUES
  ('fixture', 'fixture', m.created_at, true),
  ('status', NULL, m.updated_at, m.status IN ('live', 'half_time', 'cancelled', 'postponed')),
  ('score', 'score', m.updated_at, m.status IN ('live', 'half_time') AND (m.home_score <> 0 OR m.away_score <> 0)),
  ('result', 'result', m.updated_at, m.status = 'completed')
) AS activity(kind, slot, published_at, include)
WHERE activity.include
  AND activity.published_at IS NOT NULL
  AND m.status IN ('scheduled', 'live', 'half_time', 'completed', 'cancelled', 'postponed');

CREATE TRIGGER capture_public_match_activity
AFTER INSERT OR UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.capture_public_match_activity();

COMMIT;
