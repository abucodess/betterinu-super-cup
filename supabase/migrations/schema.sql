-- ============================================================================
-- INSTITUTE FOOTBALL LEAGUE PLATFORM — COMPLETE SUPABASE DATABASE SCHEMA
-- Confirmed Architecture Decisions DB-001 through DB-021
-- Target Environment: Supabase PostgreSQL (Run in Supabase Dashboard SQL Editor)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'manager', 'referee')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically populate public.profiles on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'manager')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'allocation', 'in_progress', 'completed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TEAMS TABLE (Exactly 3 teams, 1:1 manager mapping)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  short_code TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  color_code TEXT DEFAULT '#B8F34A',
  manager_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PLAYERS TABLE (15 total: 3 GK, 12 outfield)
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  jersey_number INT,
  position TEXT NOT NULL CHECK (position IN ('GK', 'CB', 'MF', 'FW')),
  is_goalkeeper BOOLEAN GENERATED ALWAYS AS (position = 'GK') STORED,
  photo_url TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ALLOCATION HISTORY TABLE (Audit log of spin-wheel drafts)
CREATE TABLE IF NOT EXISTS public.allocation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  allocated_by UUID NOT NULL REFERENCES public.profiles(id),
  action_type TEXT NOT NULL DEFAULT 'ALLOCATE' CHECK (action_type IN ('ALLOCATE', 'REASSIGN', 'RELEASE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MATCHES TABLE (Fixtures and live match tracking)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_number INT NOT NULL,
  home_team_id UUID NOT NULL REFERENCES public.teams(id),
  away_team_id UUID NOT NULL REFERENCES public.teams(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  venue TEXT DEFAULT 'Main Institute Ground',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'half_time', 'completed', 'cancelled')),
  current_minute INT DEFAULT 0,
  home_score INT NOT NULL DEFAULT 0,
  away_score INT NOT NULL DEFAULT 0,
  referee_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_different_teams CHECK (home_team_id <> away_team_id)
);

-- 8. MATCH EVENTS TABLE (Goals, cards, match milestones)
CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id),
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('GOAL', 'YELLOW_CARD', 'RED_CARD', 'PERIOD_START', 'PERIOD_END')),
  minute INT NOT NULL CHECK (minute >= 0),
  extra_info TEXT,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TRANSACTIONAL DATABASE FUNCTIONS
-- ============================================================================

-- Function 1: Transactional Player Allocation (Enforces 1 GK + 4 Outfield = 5 Total per team)
CREATE OR REPLACE FUNCTION public.allocate_player_transaction(
  p_player_id UUID,
  p_team_id UUID,
  p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_is_gk BOOLEAN;
  v_current_total INT;
  v_current_gk INT;
  v_current_outfield INT;
BEGIN
  -- Verify player exists
  SELECT is_goalkeeper INTO v_is_gk FROM public.players WHERE id = p_player_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player not found.';
  END IF;

  -- Count squad distribution
  SELECT COUNT(*), 
         COUNT(*) FILTER (WHERE is_goalkeeper = TRUE),
         COUNT(*) FILTER (WHERE is_goalkeeper = FALSE)
  INTO v_current_total, v_current_gk, v_current_outfield
  FROM public.players
  WHERE team_id = p_team_id;

  -- Enforce strict allocation limits
  IF v_current_total >= 5 THEN
    RAISE EXCEPTION 'Team already has the maximum permitted squad size of 5 players.';
  END IF;

  IF v_is_gk AND v_current_gk >= 1 THEN
    RAISE EXCEPTION 'Team already has an assigned Goalkeeper (maximum 1 GK).';
  END IF;

  IF NOT v_is_gk AND v_current_outfield >= 4 THEN
    RAISE EXCEPTION 'Team already has 4 assigned Outfield Players (maximum 4 Outfield).';
  END IF;

  -- Execute assignment
  UPDATE public.players SET team_id = p_team_id, updated_at = NOW() WHERE id = p_player_id;

  -- Audit log
  INSERT INTO public.allocation_history (player_id, team_id, allocated_by, action_type)
  VALUES (p_player_id, p_team_id, p_admin_id, 'ALLOCATE');

  RETURN jsonb_build_object('success', true, 'message', 'Player successfully allocated.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Atomic Match Event Recording
CREATE OR REPLACE FUNCTION public.record_match_event(
  p_match_id UUID,
  p_team_id UUID,
  p_player_id UUID,
  p_event_type TEXT,
  p_minute INT,
  p_recorded_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_match public.matches%ROWTYPE;
  v_new_home_score INT;
  v_new_away_score INT;
BEGIN
  SELECT * INTO v_match FROM public.matches WHERE id = p_match_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found.';
  END IF;

  INSERT INTO public.match_events (match_id, team_id, player_id, event_type, minute, recorded_by)
  VALUES (p_match_id, p_team_id, p_player_id, p_event_type, p_minute, p_recorded_by);

  v_new_home_score := v_match.home_score;
  v_new_away_score := v_match.away_score;

  IF p_event_type = 'GOAL' THEN
    IF p_team_id = v_match.home_team_id THEN
      v_new_home_score := v_new_home_score + 1;
    ELSIF p_team_id = v_match.away_team_id THEN
      v_new_away_score := v_new_away_score + 1;
    ELSE
      RAISE EXCEPTION 'Team does not belong to this match.';
    END IF;

    UPDATE public.matches
    SET home_score = v_new_home_score,
        away_score = v_new_away_score,
        updated_at = NOW()
    WHERE id = p_match_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'home_score', v_new_home_score,
    'away_score', v_new_away_score
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Atomic Event Undo
CREATE OR REPLACE FUNCTION public.undo_last_match_event(
  p_match_id UUID,
  p_recorded_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_last_event public.match_events%ROWTYPE;
  v_match public.matches%ROWTYPE;
BEGIN
  SELECT * INTO v_last_event
  FROM public.match_events
  WHERE match_id = p_match_id
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'No events to undo.');
  END IF;

  SELECT * INTO v_match FROM public.matches WHERE id = p_match_id FOR UPDATE;

  IF v_last_event.event_type = 'GOAL' THEN
    IF v_last_event.team_id = v_match.home_team_id AND v_match.home_score > 0 THEN
      UPDATE public.matches SET home_score = home_score - 1, updated_at = NOW() WHERE id = p_match_id;
    ELSIF v_last_event.team_id = v_match.away_team_id AND v_match.away_score > 0 THEN
      UPDATE public.matches SET away_score = away_score - 1, updated_at = NOW() WHERE id = p_match_id;
    END IF;
  END IF;

  DELETE FROM public.match_events WHERE id = v_last_event.id;

  RETURN jsonb_build_object('success', true, 'undone_event_type', v_last_event.event_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DYNAMIC VIEWS FOR STANDINGS & PLAYER STATISTICS
-- ============================================================================

CREATE OR REPLACE VIEW public.standings_view AS
WITH team_matches AS (
  SELECT 
    t.id AS team_id,
    t.name AS team_name,
    t.short_code,
    t.logo_url,
    m.id AS match_id,
    CASE 
      WHEN m.home_team_id = t.id THEN m.home_score
      ELSE m.away_score
    END AS goals_for,
    CASE 
      WHEN m.home_team_id = t.id THEN m.away_score
      ELSE m.home_score
    END AS goals_against,
    CASE
      WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) OR 
           (m.away_team_id = t.id AND m.away_score > m.home_score) THEN 3
      WHEN m.home_score = m.away_score THEN 1
      ELSE 0
    END AS points,
    CASE
      WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) OR 
           (m.away_team_id = t.id AND m.away_score > m.home_score) THEN 1
      ELSE 0
    END AS won,
    CASE
      WHEN m.home_score = m.away_score THEN 1
      ELSE 0
    END AS drawn,
    CASE
      WHEN (m.home_team_id = t.id AND m.home_score < m.away_score) OR 
           (m.away_team_id = t.id AND m.away_score < m.home_score) THEN 1
      ELSE 0
    END AS lost
  FROM public.teams t
  LEFT JOIN public.matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id) AND m.status = 'completed'
)
SELECT 
  team_id,
  team_name,
  short_code,
  logo_url,
  COUNT(match_id) AS matches_played,
  COALESCE(SUM(won), 0)::INT AS won,
  COALESCE(SUM(drawn), 0)::INT AS drawn,
  COALESCE(SUM(lost), 0)::INT AS lost,
  COALESCE(SUM(goals_for), 0)::INT AS goals_for,
  COALESCE(SUM(goals_against), 0)::INT AS goals_against,
  (COALESCE(SUM(goals_for), 0) - COALESCE(SUM(goals_against), 0))::INT AS goal_difference,
  COALESCE(SUM(points), 0)::INT AS points
FROM team_matches
GROUP BY team_id, team_name, short_code, logo_url
ORDER BY points DESC, goal_difference DESC, goals_for DESC, team_name ASC;

CREATE OR REPLACE VIEW public.player_stats_view AS
SELECT 
  p.id AS player_id,
  p.name AS player_name,
  p.position,
  p.team_id,
  t.name AS team_name,
  t.short_code AS team_code,
  COUNT(me.id) FILTER (WHERE me.event_type = 'GOAL')::INT AS goals,
  COUNT(me.id) FILTER (WHERE me.event_type = 'YELLOW_CARD')::INT AS yellow_cards,
  COUNT(me.id) FILTER (WHERE me.event_type = 'RED_CARD')::INT AS red_cards
FROM public.players p
LEFT JOIN public.teams t ON t.id = p.team_id
LEFT JOIN public.match_events me ON me.player_id = p.id
GROUP BY p.id, p.name, p.position, p.team_id, t.name, t.short_code
ORDER BY goals DESC, player_name ASC;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Super admin manages profiles" ON public.profiles FOR ALL USING (public.get_auth_role() = 'super_admin');

-- Tournaments Policies
CREATE POLICY "Tournaments are publicly readable" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Super admin manages tournaments" ON public.tournaments FOR ALL USING (public.get_auth_role() = 'super_admin');

-- Teams Policies
CREATE POLICY "Teams are publicly readable" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Super admin manages teams" ON public.teams FOR ALL USING (public.get_auth_role() = 'super_admin');

-- Players Policies
CREATE POLICY "Players are publicly readable" ON public.players FOR SELECT USING (true);
CREATE POLICY "Super admin manages players" ON public.players FOR ALL USING (public.get_auth_role() = 'super_admin');

-- Allocation History Policies
CREATE POLICY "Allocation history viewable by authenticated" ON public.allocation_history FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Super admin manages allocation history" ON public.allocation_history FOR ALL USING (public.get_auth_role() = 'super_admin');

-- Matches Policies
CREATE POLICY "Matches are publicly readable" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Super admin manages all matches" ON public.matches FOR ALL USING (public.get_auth_role() = 'super_admin');
CREATE POLICY "Referee updates assigned match" ON public.matches FOR UPDATE USING (referee_id = auth.uid() AND public.get_auth_role() = 'referee');

-- Match Events Policies
CREATE POLICY "Match events are publicly readable" ON public.match_events FOR SELECT USING (true);
CREATE POLICY "Super admin manages match events" ON public.match_events FOR ALL USING (public.get_auth_role() = 'super_admin');
CREATE POLICY "Referee records match events" ON public.match_events FOR INSERT WITH CHECK (recorded_by = auth.uid() AND public.get_auth_role() = 'referee');

-- Announcements Policies
CREATE POLICY "Announcements are publicly readable" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Super admin manages announcements" ON public.announcements FOR ALL USING (public.get_auth_role() = 'super_admin');

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'match_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
  END IF;
END $$;

