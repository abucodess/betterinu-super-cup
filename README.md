# Institute Football League Platform

A full-stack, real-time football tournament management and broadcasting web application built for institute-level tournaments.

## Tech Stack

* **Frontend:** React + Vite (JavaScript ES6+, **Strictly NO TypeScript**)
* **Styling:** Tailwind CSS with Unified Premium Dark Sports Design System
* **Icons:** Lucide React
* **State Management:** Redux Toolkit (client UI/auth) + TanStack Query (server state)
* **Backend:** Supabase (PostgreSQL, Supabase Auth, Storage, Realtime, Database Functions, RLS)
* **Deployment:** Vercel (Frontend) & Supabase (Backend)

---

## Key Features

1. **Four Dedicated Role Experiences:**
   * **Super Admin:** Centralized tournament control, team/player management, fixture generation, error overrides, and dual spin-wheel draft operation.
   * **Team Manager:** Dedicated workspace scoped to the manager's assigned team (viewing squad, match schedule, player statistics).
   * **Referee:** Mobile-optimized pitch control panel for live matches (clock timers, goal/card event logging, atomic undo).
   * **Public Visitors:** Broadcast-style match center, live scoreboard, upcoming fixtures, dynamic standings table, team profiles, and player leaderboards.

2. **Dual Spin-Wheel Player Allocation:**
   * Independent spin wheels for **Goalkeepers (3)** and **Outfield Players (12)**.
   * Enforces squad composition rules at the database level: exactly 1 GK and 4 Outfield players per team (5 players total).
   * **Zero bidding / budgets:** Strictly randomized drafting with Super Admin team selection.

3. **Dynamic Standings & Real-Time Sync:**
   * Points table (MP, W, D, L, GF, GA, GD, PTS) dynamically computed via PostgreSQL views (`standings_view` and `player_stats_view`).
   * Supabase Realtime synchronization for active match scoreboards and event feeds.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Setup Supabase Database
1. Go to your **Supabase Project Dashboard** $\rightarrow$ **SQL Editor**.
2. Run [`supabase/migrations/schema.sql`](./supabase/migrations/schema.sql) to create tables, functions, views, and RLS policies.
3. (Optional) Run [`supabase/seed/seed.sql`](./supabase/seed/seed.sql) to load initial teams and 15 tournament players ready for drafting.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
```

---

## Management Account Conventions

* **Super Admin:** `admin@supercup.com`
* **Team Manager 1:** `manager1@supercup.com`
* **Team Manager 2:** `manager2@supercup.com`
* **Team Manager 3:** `manager3@supercup.com`
* **Referee:** `referee@supercup.com`

