-- ============================================================================
-- INSTITUTE FOOTBALL LEAGUE PLATFORM — SAFE DEMONSTRATION SEED DATA
-- Target Environment: Supabase PostgreSQL (Run in Supabase Dashboard SQL Editor)
-- Note: Contains NO passwords, secret keys, or service-role credentials.
-- ============================================================================

-- 1. Create Tournament
INSERT INTO public.tournaments (id, name, description, status, start_date, end_date)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Institute Football League 2026',
  'Official annual institute inter-departmental championship.',
  'draft',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '14 days'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the 3 Participating Teams
INSERT INTO public.teams (id, tournament_id, name, short_code, color_code)
VALUES 
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Team Alpha', 'ALP', '#B8F34A'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Team Beta', 'BET', '#3B82F6'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Team Gamma', 'GAM', '#F59E0B')
ON CONFLICT (name) DO NOTHING;

-- 3. Register the 15 Tournament Players (3 Goalkeepers + 12 Outfield Players)
-- All initially unassigned (team_id IS NULL) ready for Super Admin dual spin-wheel draft
INSERT INTO public.players (tournament_id, name, jersey_number, position)
VALUES
  -- 3 Goalkeepers
  ('11111111-1111-1111-1111-111111111111', 'David De Gea', 1, 'GK'),
  ('11111111-1111-1111-1111-111111111111', 'Manuel Neuer', 12, 'GK'),
  ('11111111-1111-1111-1111-111111111111', 'Thibaut Courtois', 13, 'GK'),
  -- 12 Outfield Players
  ('11111111-1111-1111-1111-111111111111', 'Virgil van Dijk', 4, 'CB'),
  ('11111111-1111-1111-1111-111111111111', 'Sergio Ramos', 5, 'CB'),
  ('11111111-1111-1111-1111-111111111111', 'Ruben Dias', 3, 'CB'),
  ('11111111-1111-1111-1111-111111111111', 'Kevin De Bruyne', 7, 'MF'),
  ('11111111-1111-1111-1111-111111111111', 'Luka Modric', 10, 'MF'),
  ('11111111-1111-1111-1111-111111111111', 'Rodri Hernandez', 16, 'MF'),
  ('11111111-1111-1111-1111-111111111111', 'Jude Bellingham', 8, 'MF'),
  ('11111111-1111-1111-1111-111111111111', 'Erling Haaland', 9, 'FW'),
  ('11111111-1111-1111-1111-111111111111', 'Kylian Mbappe', 11, 'FW'),
  ('11111111-1111-1111-1111-111111111111', 'Vinicius Junior', 77, 'FW'),
  ('11111111-1111-1111-1111-111111111111', 'Bukayo Saka', 20, 'FW'),
  ('11111111-1111-1111-1111-111111111111', 'Phil Foden', 47, 'FW');

-- 4. Initial Scheduled Tournament Matches (Round Robin)
INSERT INTO public.matches (tournament_id, match_number, home_team_id, away_team_id, scheduled_at, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 1, '22222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', NOW() + INTERVAL '1 day', 'scheduled'),
  ('11111111-1111-1111-1111-111111111111', 2, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222223', NOW() + INTERVAL '2 days', 'scheduled'),
  ('11111111-1111-1111-1111-111111111111', 3, '22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222221', NOW() + INTERVAL '3 days', 'scheduled');

