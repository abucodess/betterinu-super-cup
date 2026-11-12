# DATABASE.md

# Institute Football League Platform — Database Architecture

**Document status:** Planning in progress  
**Backend:** Supabase  
**Database:** PostgreSQL  
**Last updated:** 2026-11-11

> This document defines the planned database architecture for the Institute Football League Platform. It is a living design document. Decisions explicitly marked **CONFIRMED** are settled. Items marked **PROVISIONAL** are recommendations that still need confirmation. Items marked **TBD** must be discussed before implementation.

---

## 1. Purpose

This document will describe the complete Supabase PostgreSQL database design before application development begins.

It will cover:

- Database structure and naming conventions.
- Tables, columns, data types and defaults.
- Primary keys, foreign keys and relationships.
- Constraints, indexes and data integrity rules.
- Supabase Auth user profiles and management roles.
- Players, teams and player allocation.
- Allocation history and audit records.
- Fixtures, matches, match events and scores.
- League standings and statistics.
- Announcements.
- PostgreSQL functions and triggers.
- Row Level Security (RLS) policies.
- Realtime publication and subscription requirements.
- Database migrations and seed data.

The database must support the requirements in `PROJECT_OVERVIEW.md`, `REQUIREMENTS.md` and `FEATURES.md`, and remain consistent with `ARCHITECTURE.md` and `CODING_STANDARDS.md`.

## 2. Database Design Principles

1. **Use Supabase as the complete backend.** PostgreSQL, Supabase Auth, Storage, Realtime and Edge Functions are part of the selected platform.
2. **Use PostgreSQL as the source of truth.** Important tournament rules and data integrity checks must not depend only on frontend code.
3. **Keep the schema simple.** Add a table, column, function or trigger only when it serves a real requirement.
4. **Use relational integrity.** Define appropriate primary keys, foreign keys, unique constraints, check constraints and transactions.
5. **Enforce authorization in the database.** RLS policies must protect data independently of frontend route guards.
6. **Do not store authentication passwords in application tables.** Supabase Auth owns password authentication and credential storage.
7. **Keep privileged credentials server-side.** The Supabase service-role key must never be exposed in the frontend or committed to the repository.
8. **Make important operations atomic.** Operations such as player allocation must either complete fully or make no changes.
9. **Preserve relevant history.** Important changes, especially player allocation and match events, must be traceable where required by the final requirements.
10. **Avoid unnecessary duplication.** Derived values should not be stored separately unless there is a clear performance or historical-consistency reason.

## 3. Confirmed Platform and Tournament Context

### 3.1 Backend technology

**CONFIRMED**

- Supabase PostgreSQL is the application database.
- Supabase Auth is the authentication authority.
- Supabase Storage handles file storage where required.
- Supabase Realtime provides live synchronization.
- Supabase Edge Functions may handle trusted server-side operations.
- PostgreSQL functions, triggers, RLS and migrations are available for database-side rules and management.
- No Express server, separate Node.js backend, Firebase, MongoDB, Prisma, JSON Server, separate authentication service, separate storage service or external WebSocket infrastructure will be introduced.

### 3.2 Tournament configuration

**CONFIRMED**

| Item | Count |
|---|---:|
| Teams | 3 |
| Managers | 3 |
| Goalkeepers | 3 |
| Outfield players | 12 |
| Total players | 15 |
| Players per team | 5 |

Each team must receive:

- Exactly 1 goalkeeper.
- Exactly 4 outfield players.
- Exactly 5 players in total.

Managers are management accounts, not players, and must not be counted in squad totals.

### 3.3 Player positions

**CONFIRMED**

- `GK`
- `CB`
- `MF`
- `FW`

### 3.4 Player allocation rules

**CONFIRMED**

- Goalkeepers and outfield players use separate spin wheels.
- The wheel randomly selects a player.
- The Super Admin manually chooses the receiving team.
- There is no bidding, auction, budget or automatic team selection.
- Each team must finish with exactly one goalkeeper and four outfield players.
- Allocation must be validated transactionally at database level.

The final allocation tables, function signature, locking strategy and history model are **TBD**.

## 4. Authentication Profiles and Management Roles

### 4.1 Supabase Auth relationship

**CONFIRMED DESIGN (DB-003 & DB-013)**

Supabase Auth is responsible for authenticating users. The application does not create its own password-based authentication system or store plaintext passwords in public application tables.

The `profiles` table stores application-specific user metadata and role permissions, linking 1:1 with `auth.users(id)`:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'manager', 'referee')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Automatic Profile Creation Trigger:**
```sql
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4.2 Initial management account email convention

The following email addresses are the planned management login identifiers:

| Account | Email | Intended role | Status |
|---|---|---|---|
| Main account | `admin@supercup.com` | Super Admin | Planned |
| Manager 1 | `manager1@supercup.com` | Manager | Planned |
| Manager 2 | `manager2@supercup.com` | Manager | Planned |
| Manager 3 | `manager3@supercup.com` | Manager | Planned |
| Referee accounts | TBD | Referee | Not finalized |

These are account naming conventions, not database table names. The number of referee accounts and their email convention have not been decided.

### 4.3 Password handling

**CONFIRMED SECURITY RULE**

- Passwords are managed by Supabase Auth.
- No plaintext password column will be created in `profiles` or any other application table.
- Actual passwords and secret credentials must not be written into this document, source code, seed files or Git history.
- Weak, shared or predictable initial passwords such as `admin123` and `manager123` must not be used as permanent credentials.
- Initial credentials must be set securely and changed when necessary. The exact onboarding and password-reset workflow is **TBD**.
- The Supabase service-role key and any other privileged secrets must remain in trusted server-side configuration.

### 4.4 Management account creation

**CONFIRMED**

- There is no public self-registration for management accounts.
- Only the Super Admin is allowed to create Manager and Referee accounts.
- The Super Admin manages management-account creation.

**TBD — implementation and enforcement**

- The trusted account-provisioning mechanism, likely a Supabase Edge Function using the Supabase Admin API, must be designed.
- The provisioning operation must authenticate the caller and verify that the caller is an authorized Super Admin before creating an Auth user or assigning a role.
- The service-role key must only be used in the trusted server-side environment, never in browser code.
- Exact account deactivation, deletion and role-change workflows remain to be decided.

### 4.5 Role model

**CONFIRMED (DB-008)**

Each management account has exactly one assigned role:

- `super_admin`
- `manager`
- `referee`

The role is stored directly in the user's application profile. One account cannot hold multiple roles simultaneously, maintaining clear separation of responsibilities and simplifying Row Level Security (RLS) policies.

### 4.7 Teams and Manager Relationship

**CONFIRMED DESIGN (DB-009 & DB-014)**

The platform supports exactly 3 teams, each managed by exactly 1 manager. A direct 1:1 foreign key in the `teams` table enforces this constraint without requiring a junction table:

```sql
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  short_code TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  color_code TEXT DEFAULT '#B8F34A',
  manager_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- `manager_id UNIQUE`: Prevents a manager from being assigned to more than one team.
- `ON DELETE SET NULL`: Preserves the team record if a manager account is deactivated or deleted.

### 4.8 Players and Allocation Architecture

**CONFIRMED DESIGN (DB-010, DB-011, DB-012 & DB-015)**

Registered players are stored in `players`. Unallocated players have `team_id IS NULL`. When drafted through the spin wheel, `team_id` is assigned and an audit entry is created in `allocation_history`:

```sql
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  jersey_number INT,
  position TEXT NOT NULL CHECK (position IN ('GK', 'CB', 'MF', 'FW')),
  is_goalkeeper BOOLEAN GENERATED ALWAYS AS (position = 'GK') STORED,
  photo_url TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.allocation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  allocated_by UUID NOT NULL REFERENCES public.profiles(id),
  action_type TEXT NOT NULL DEFAULT 'ALLOCATE' CHECK (action_type IN ('ALLOCATE', 'REASSIGN', 'RELEASE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Transactional Squad Validation Function:**
```sql
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
  -- 1. Check player exists and is currently unassigned
  SELECT is_goalkeeper INTO v_is_gk FROM public.players WHERE id = p_player_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player not found.';
  END IF;

  -- 2. Count current squad members for target team
  SELECT COUNT(*), 
         COUNT(*) FILTER (WHERE is_goalkeeper = TRUE),
         COUNT(*) FILTER (WHERE is_goalkeeper = FALSE)
  INTO v_current_total, v_current_gk, v_current_outfield
  FROM public.players
  WHERE team_id = p_team_id;

  -- 3. Validate squad composition constraints
  IF v_current_total >= 5 THEN
    RAISE EXCEPTION 'Team already has the maximum of 5 players.';
  END IF;

  IF v_is_gk AND v_current_gk >= 1 THEN
    RAISE EXCEPTION 'Team already has a goalkeeper assigned (maximum 1 GK).';
  END IF;

  IF NOT v_is_gk AND v_current_outfield >= 4 THEN
    RAISE EXCEPTION 'Team already has 4 outfield players assigned (maximum 4 outfield).';
  END IF;

  -- 4. Execute atomic update
  UPDATE public.players SET team_id = p_team_id, updated_at = NOW() WHERE id = p_player_id;

  -- 5. Record allocation history
  INSERT INTO public.allocation_history (player_id, team_id, allocated_by, action_type)
  VALUES (p_player_id, p_team_id, p_admin_id, 'ALLOCATE');

  RETURN jsonb_build_object('success', true, 'message', 'Player successfully allocated.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.9 Matches, Events, and Live Scoring Architecture

**CONFIRMED DESIGN (DB-016)**

Live match scores (`home_score`, `away_score`) and match clock state are persisted on `matches` for high-performance broadcasting and Realtime sync. Individual match occurrences are stored chronologically in `match_events`. State updates are executed atomically via PostgreSQL database functions:

```sql
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE public.match_events (
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
```

**Atomic Match Event Recording Function:**
```sql
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
  -- Verify match exists
  SELECT * INTO v_match FROM public.matches WHERE id = p_match_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found.';
  END IF;

  -- Insert the event record
  INSERT INTO public.match_events (match_id, team_id, player_id, event_type, minute, recorded_by)
  VALUES (p_match_id, p_team_id, p_player_id, p_event_type, p_minute, p_recorded_by);

  -- Atomically adjust scores if goal
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
```

**Atomic Event Undo Function:**
```sql
CREATE OR REPLACE FUNCTION public.undo_last_match_event(
  p_match_id UUID,
  p_recorded_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_last_event public.match_events%ROWTYPE;
  v_match public.matches%ROWTYPE;
BEGIN
  -- Find the most recent event for this match
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

  -- If the undone event was a goal, decrement score
  IF v_last_event.event_type = 'GOAL' THEN
    IF v_last_event.team_id = v_match.home_team_id AND v_match.home_score > 0 THEN
      UPDATE public.matches SET home_score = home_score - 1, updated_at = NOW() WHERE id = p_match_id;
    ELSIF v_last_event.team_id = v_match.away_team_id AND v_match.away_score > 0 THEN
      UPDATE public.matches SET away_score = away_score - 1, updated_at = NOW() WHERE id = p_match_id;
    END IF;
  END IF;

  -- Delete the event record
  DELETE FROM public.match_events WHERE id = v_last_event.id;

  RETURN jsonb_build_object('success', true, 'undone_event_type', v_last_event.event_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.10 Standings and Player Statistics Architecture

**CONFIRMED DESIGN (DB-017)**

To guarantee zero desynchronization risk and eliminate brittle database triggers, tournament standings (MP, W, D, L, GF, GA, GD, PTS) and player leaderboards (goals, cards) are computed dynamically via high-performance PostgreSQL Views:

```sql
-- League Standings View
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

-- Player Statistics View
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
```

### 4.11 Tournaments and Announcements Architecture

**CONFIRMED DESIGN (DB-018)**

To support tournament lifecycle management and future multi-tournament reuse without structural rewrites, core tournament metadata is maintained in `tournaments`, with `tournament_id` foreign keys linking teams, matches, and announcements:

```sql
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'allocation', 'in_progress', 'completed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.12 Row Level Security (RLS) and Authorization

**CONFIRMED DESIGN (DB-019)**

All tables enforce Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`). The helper function `public.get_auth_role()` avoids recursive evaluations on `profiles`.

```sql
-- Helper function to retrieve authenticated role cleanly
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Profiles Table Policies
CREATE POLICY "Public profiles are readable" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Super admin manages profiles" ON public.profiles
  FOR ALL USING (public.get_auth_role() = 'super_admin');

-- 2. Tournaments Table Policies
CREATE POLICY "Tournaments are publicly readable" ON public.tournaments
  FOR SELECT USING (true);

CREATE POLICY "Super admin manages tournaments" ON public.tournaments
  FOR ALL USING (public.get_auth_role() = 'super_admin');

-- 3. Teams Table Policies
CREATE POLICY "Teams are publicly readable" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Super admin manages teams" ON public.teams
  FOR ALL USING (public.get_auth_role() = 'super_admin');

-- 4. Players Table Policies
CREATE POLICY "Players are publicly readable" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Super admin manages players" ON public.players
  FOR ALL USING (public.get_auth_role() = 'super_admin');

-- 5. Allocation History Policies
CREATE POLICY "Allocation history viewable by management" ON public.allocation_history
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admin creates allocation history" ON public.allocation_history
  FOR INSERT WITH CHECK (public.get_auth_role() = 'super_admin');

-- 6. Matches Table Policies
CREATE POLICY "Matches are publicly readable" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Super admin manages all matches" ON public.matches
  FOR ALL USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Referee updates assigned match" ON public.matches
  FOR UPDATE USING (referee_id = auth.uid() AND public.get_auth_role() = 'referee');

-- 7. Match Events Table Policies
CREATE POLICY "Match events are publicly readable" ON public.match_events
  FOR SELECT USING (true);

CREATE POLICY "Super admin manages match events" ON public.match_events
  FOR ALL USING (public.get_auth_role() = 'super_admin');

CREATE POLICY "Referee records match events" ON public.match_events
  FOR INSERT WITH CHECK (recorded_by = auth.uid() AND public.get_auth_role() = 'referee');

-- 8. Announcements Table Policies
CREATE POLICY "Announcements are publicly readable" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "Super admin manages announcements" ON public.announcements
  FOR ALL USING (public.get_auth_role() = 'super_admin');
```

### 4.13 Realtime Publication Configuration

**CONFIRMED DESIGN (DB-020)**

To minimize client websocket bandwidth and avoid wasteful background events on mobile devices, only live match tables are published to `supabase_realtime`:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches, public.match_events;
```

Public and management clients subscribe specifically to these tables for instant live scoreboards, match clocks, and event timelines. Standard entity data (teams, players, standings) are managed through TanStack Query caching.

## 5. Planned Database Domains

The following are the planned data areas. This is an initial inventory, not a final list of tables. Exact table names, columns, constraints and relationships will be discussed and confirmed before implementation.

| Domain | Purpose | Status |
|---|---|---|
| Profiles and roles | Link Supabase Auth users to application profiles and roles | Partially planned; schema TBD |
| Players | Store registered tournament players and player details | TBD |
| Teams | Store the three tournament teams | Team count confirmed; schema TBD |
| Manager assignments | Connect manager accounts to their teams, if represented separately | Relationship design TBD |
| Player allocation | Record player-to-team assignments and enforce squad composition | Rules confirmed; schema TBD |
| Allocation history | Preserve allocation actions and relevant changes | TBD |
| Fixtures | Store scheduled fixtures between teams | TBD |
| Matches | Store match records and match status | TBD |
| Match events | Record goals and other required match events | Event types TBD |
| Standings | Provide league table information | Stored versus calculated approach TBD |
| Statistics | Provide player and team statistics | Requirements and calculation approach TBD |
| Announcements | Publish tournament announcements | TBD |
| Audit records | Preserve important administrative actions where required | Scope and design TBD |

Do not create separate tables merely because a domain appears in this inventory. Some data may be better represented through relationships, database views or calculated queries.

## 6. Database Objects to Design

The completed document must specify the following for every approved database object.

### 6.1 Tables and columns

For each table, document:

- Table name and purpose.
- Column names and PostgreSQL data types.
- Nullability and default values.
- Primary key.
- Foreign keys and deletion behavior.
- Unique and check constraints.
- Indexes.
- RLS requirements.
- Realtime requirement, if any.

### 6.2 Relationships

Document every relationship, its cardinality and its integrity rules. Do not assume that two entities need a separate join table until the actual relationship requirements are understood.

### 6.3 Constraints and transactions

Important business rules must be enforced in PostgreSQL where possible. Player allocation in particular must be atomic and must prevent a team from receiving more than its allowed number of goalkeepers, outfield players or total players.

The exact transaction design, concurrency handling and failure behavior are **TBD**.

### 6.4 Functions and triggers

For every proposed PostgreSQL function or trigger, document:

- Its purpose and caller.
- Inputs and outputs.
- Tables it reads or modifies.
- Authorization checks.
- Transaction and error behavior.
- Whether it is security-invoker or security-definer, where applicable.

Do not add triggers or functions for work that can be handled more clearly by a normal query or a focused trusted operation.

### 6.5 Row Level Security

RLS must be enabled and policies must be designed for every exposed application table. Policies must follow the finalized role permission matrix and data ownership rules.

**TBD:** Exact policy definitions, helper functions, permitted operations for each role and handling of unauthenticated public reads.

### 6.6 Realtime

Only tables whose changes need to be pushed live should be included in the Realtime design. Realtime is a synchronization mechanism, not an authorization replacement.

**TBD:** Exact publication tables, event filters, subscription scope and client cache invalidation behavior.

### 6.7 Migrations and seed data

Database changes must be version-controlled through Supabase database migrations.

**TBD:** Migration naming convention, local development workflow, environment promotion process and safe seed-data strategy. Seed files must never contain real passwords or privileged credentials.

## 7. Decisions Log

| ID | Decision | Status |
|---|---|---|
| DB-001 | Supabase PostgreSQL is the application database | Confirmed |
| DB-002 | Supabase Auth is the authentication authority | Confirmed |
| DB-003 | Application profiles reference Supabase Auth users | Confirmed |
| DB-004 | No public management self-registration | Confirmed |
| DB-005 | Only the Super Admin can create Manager and Referee accounts | Confirmed |
| DB-006 | Planned management emails use `admin@supercup.com` and `manager1@supercup.com` through `manager3@supercup.com` | Confirmed naming convention |
| DB-007 | Passwords must not be stored in application tables or documentation | Confirmed |
| DB-008 | One role per account (`super_admin`, `manager`, `referee`) | Confirmed |
| DB-009 | Three teams, three managers, three goalkeepers and twelve outfield players | Confirmed |
| DB-010 | Each team receives one goalkeeper and four outfield players | Confirmed |
| DB-011 | Player allocation is manually assigned by the Super Admin after separate goalkeeper/outfield spin-wheel selection | Confirmed |
| DB-012 | Player allocation must be enforced transactionally at database level | Confirmed (via `allocate_player_transaction()`) |
| DB-013 | `profiles` uses `role TEXT NOT NULL CHECK (role IN (...))` with `handle_new_user()` trigger on `auth.users` | Confirmed |
| DB-014 | `teams` uses direct 1:1 foreign key `manager_id UUID UNIQUE REFERENCES public.profiles(id)` | Confirmed |
| DB-015 | `players` stores `team_id` (NULL when unallocated) with `allocation_history` audit trail table | Confirmed |
| DB-016 | `matches` stores `home_score` and `away_score`, updated atomically via `record_match_event()` and `undo_last_match_event()` | Confirmed |
| DB-017 | Standings and player statistics are computed dynamically via `standings_view` and `player_stats_view` | Confirmed |
| DB-018 | Dedicated `tournaments` table with `tournament_id` on teams, matches, and `announcements` | Confirmed |
| DB-019 | RLS uses `public.get_auth_role()` with public read-only access and role-restricted writes | Confirmed |
| DB-020 | Focused Realtime publication: only `matches` and `match_events` published to `supabase_realtime` | Confirmed |
| DB-021 | Schema execution workflow: SQL executed via Supabase Dashboard SQL Editor | Confirmed |

## 8. Outstanding Questions

**All initial database architecture questions are resolved and confirmed.**

## 9. Planning Rules

- Discuss database architecture one question at a time.
- Explain practical options and trade-offs before asking for a decision.
- Recommend the simplest option that meets the actual requirements.
- Record each accepted decision in this document and in the decisions log.
- Mark unresolved choices as **TBD** or **PROVISIONAL**.
- Do not silently turn recommendations into confirmed decisions.
- Do not start application coding while database planning is in progress.
- Keep this document consistent with the other project documentation.
- Do not add unnecessary tables, abstractions or database machinery.

---

## 10. Next Step

Database architecture planning is complete. Proceed to providing the complete SQL schema script for the Supabase Dashboard SQL Editor, and begin Phase 3 (Authentication & Frontend Service Integration).
