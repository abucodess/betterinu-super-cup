# PROJECT OVERVIEW
# Institute Football League Platform

## 1. PROJECT VISION

The **Institute Football League Platform** is a modern, full-stack web application designed to digitize, manage, and present institute-level football tournaments through a centralized platform.

The system brings together tournament administration, player management, team allocation, match execution, live score updates, and public engagement into one unified application.

The primary objective is to provide tournament organizers with an efficient management system while delivering players, managers, and spectators a professional football league experience.

Although the initial implementation is designed around a specific institute tournament, the platform should follow a reusable and modular architecture that allows it to support future tournaments and similar sporting events with minimal structural changes.

The platform consists of four primary user experiences:

- **Super Admin Dashboard:** Centralized tournament administration and complete system control.
- **Manager Dashboard:** Team-specific information and squad management access.
- **Referee Panel:** Mobile-friendly interface for controlling live matches and recording match events.
- **Public Website:** A professional football-focused interface for spectators and players to follow the tournament.

---

## 2. CORE OBJECTIVES

### 2.1 Professional Tournament Experience

Deliver a professional digital experience inspired by modern football leagues.

The platform should provide:

- Live match scoreboards.
- Real-time match events and updates.
- Tournament fixtures and results.
- Team standings and league tables.
- Team profiles and player information.
- Top scorer and individual player statistics.
- A polished, responsive public interface.

### 2.2 Centralized Tournament Administration

Eliminate manual tournament management wherever possible by providing the Super Admin with a centralized control system.

The organizer should be able to:

- Configure and manage the tournament.
- Register and manage players.
- Create teams and assign managers.
- Conduct player allocation through digital spin wheels.
- Generate and manage match fixtures.
- Monitor tournament progress.
- Manage match results and correct administrative errors.

### 2.3 Real-Time Match Execution

Provide the referee with a dedicated match control interface that can be operated easily during an actual football match.

The system should support:

- Starting, pausing, and ending match timers.
- Recording goals and assigning them to players.
- Recording yellow and red cards.
- Maintaining accurate match scores.
- Synchronizing match events with the public scoreboard.

Match updates should propagate through Supabase Realtime so spectators can follow ongoing matches without repeatedly refreshing the website.

### 2.4 Fair and Transparent Player Allocation

Implement a randomized player allocation system controlled exclusively by the Super Admin.

The allocation process uses separate spin wheels for:

- Goalkeepers.
- Outfield players.

The system should ensure that player allocation is transparent, controlled, and consistent with the tournament's team configuration.

---

## 3. USER ROLES AND PERMISSIONS

The application follows a role-based access control (RBAC) system with four distinct user roles.

Each role has a dedicated interface and a clearly defined set of permissions.

### 3.1 Super Admin

**Role:** Primary tournament organizer.

**Access:** Complete administrative control over the tournament.

**Responsibilities and capabilities:**

- Access the Super Admin dashboard.
- Configure tournament settings.
- Register, edit, and manage players.
- Create and manage the three participating teams.
- Create manager accounts and assign managers to teams.
- Access and operate the goalkeeper and outfield player spin wheels.
- Control player allocation and team assignments.
- Generate and manage tournament fixtures.
- View and monitor all tournament matches.
- Override match results and correct match event records when necessary.
- Manage tournament information and administrative settings.

The Super Admin is the highest-authority user and has access to all administrative functionality.

### 3.2 Manager

**Role:** Individual team representative.

**Access:** Restricted to the manager's assigned team.

**Responsibilities and capabilities:**

- Access a dedicated Manager dashboard.
- View the assigned team's profile and squad.
- View individual player information and statistics.
- Track upcoming fixtures.
- View previous match results.
- Monitor team performance and league standings.
- Access relevant tournament information.

Managers cannot operate the player allocation system, modify other teams, control live matches, or access Super Admin functionality.

### 3.3 Referee

**Role:** Official responsible for live match execution.

**Account Limit:** Exactly one shared Referee account.

**Access:** Dedicated match control panel.

**Responsibilities and capabilities:**

- View matches assigned for officiating.
- Access the mobile-optimized match control interface.
- Start, pause, resume, and end match timers.
- Record goals and associate them with the correct players.
- Record yellow and red cards.
- Monitor the current match score and match status.
- Submit match events and updates.
- Ensure that recorded match information is synchronized with the public interface.

The Referee controls live match execution but cannot access tournament-wide administrative functionality or modify player allocations.

### 3.4 Public Users

**Role:** Spectators, players, and general visitors.

**Access:** Unauthenticated, read-only access.

**Responsibilities and capabilities:**

- View the tournament homepage.
- Follow currently running matches.
- View live scores and match events.
- Browse today's fixtures and upcoming matches.
- Explore completed matches and historical results.
- View team profiles and squad information.
- Check league standings.
- View player statistics and top scorer rankings.

Public users do not require accounts and cannot modify tournament information.

---

## 4. CORE SYSTEM MODULES

The application is divided into independent but interconnected functional modules.

### 4.1 Tournament Management System

The central administrative module responsible for managing the tournament lifecycle.

It handles:

- Tournament configuration.
- Team creation and management.
- Player registration.
- Manager account assignment.
- Tournament status and information.
- Fixture administration.

### 4.2 Player Allocation Engine

A randomized drafting system used by the Super Admin to distribute registered players across the three participating teams.

The system maintains two independent player pools:

**Goalkeeper Allocation:**
- Uses a dedicated goalkeeper spin wheel.
- Handles the three registered goalkeeper positions.
- Keeps goalkeeper allocation separate from the outfield player allocation process.

**Outfield Player Allocation:**
- Uses a separate spin wheel.
- Randomly selects eligible outfield players.
- Assigns selected players to participating teams.

The allocation process must prevent duplicate assignments and maintain accurate player-to-team relationships.

There is no bidding, auction, or monetary budget system involved in player allocation.

### 4.3 Live Match Engine

The Live Match Engine handles match execution, event recording, score calculation, and live data synchronization.

It connects the Referee panel with the public website through Supabase Realtime.

**Primary responsibilities:**

- Match clock management.
- Goal recording.
- Card management.
- Player-specific match events.
- Live score updates.
- Match status management.
- Event history and match records.

The system should maintain a reliable match event history so that scores and statistics remain consistent.

### 4.4 Fixture and Results Management

This module handles the tournament's match schedule and completed results.

It provides:

- Fixture creation and editing.
- Match scheduling.
- Team matchup information.
- Upcoming match listings.
- Completed match records.
- Match result management.
- Fixture status tracking.

### 4.5 Statistics and Standings Engine

This module calculates and presents tournament and player statistics using recorded match data.

It includes:

- League standings.
- Matches played.
- Wins, draws, and losses.
- Goals scored and conceded.
- Goal difference.
- Points.
- Player goals.
- Top scorer rankings.
- Yellow and red card statistics.

Statistics should be derived from reliable match records rather than maintained as unrelated manual values.

### 4.6 Public Football Interface

The public-facing website is designed to deliver a modern football viewing experience.

Its primary focus is:

- Live match visibility.
- Tournament information.
- Team and player discovery.
- Fixtures and results.
- League standings.
- Player statistics.

The interface should prioritize visual clarity, fast navigation, responsive layouts, and easy access to important match information.

---

## 5. DESIGN DIRECTION

The platform follows a **Hybrid UI Design System**, using different visual approaches for public engagement and administrative productivity.

### 5.1 Public Interface: Dark Sports Theme

The public website uses a dark, modern sports-inspired visual identity.

Design characteristics:

- Pure graphite and near-black backgrounds.
- Electric Lime Green (`#B8F34A`) as the primary accent.
- High-contrast typography.
- Prominent scoreboards and match information.
- Modern football-inspired visual elements.
- Cinematic match presentation.
- Responsive layouts for desktop, tablet, and mobile.

The objective is to create an engaging football league experience rather than a conventional administrative website.

### 5.2 Management Interface: Light Dashboard Theme

The Super Admin, Manager, and Referee interfaces use a clean, professional light theme.

Design characteristics:

- Soft grey and light neutral backgrounds.
- Clear typography and readable data.
- Consistent spacing and component layouts.
- Structured tables, forms, and dashboards.
- Subtle borders and component separation.
- Lime green accents for important actions and statuses.

The objective is to prioritize usability, readability, and efficient daily operations.

### 5.3 Responsive Design

All interfaces must be responsive and usable across desktop, tablet, and mobile devices.

The management navigation follows a hybrid responsive structure:

- **Desktop:** Left sidebar with a top navigation bar.
- **Tablet:** Collapsed sidebar or drawer with a top navigation bar.
- **Mobile:** Bottom navigation for primary destinations, with a top navigation bar.

The Referee panel receives particular attention for mobile usability because it will be operated during live matches.

Detailed visual rules, colors, typography, component specifications, and responsive behavior are documented in `DESIGN_SYSTEM.md`.

---

## 6. TECHNICAL FOUNDATION

The application follows a modern frontend architecture supported by Supabase as its Backend-as-a-Service platform.

The technology stack is intentionally selected to provide maintainability, responsive performance, real-time capabilities, and straightforward deployment.

### 6.1 Frontend

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| Vite | Development server and build tooling |
| JavaScript | Primary programming language |
| Tailwind CSS | Utility-first styling |

**Important:** The frontend must use JavaScript, not TypeScript.

### 6.2 State Management and Data Fetching

| Technology | Purpose |
|---|---|
| Redux Toolkit | Client-side global state management |
| TanStack Query | Server-state management, caching, and synchronization |

Redux Toolkit and TanStack Query should have clearly separated responsibilities to avoid unnecessary duplication of application state.

### 6.3 Backend and Database

**Supabase** provides the backend infrastructure.

Its primary services include:

| Service | Purpose |
|---|---|
| PostgreSQL | Relational database |
| Supabase Auth | Authentication and user sessions |
| Supabase Realtime | Live match and data synchronization |
| Supabase Storage | Image and media storage |
| Row Level Security (RLS) | Database-level access control |
| Database Functions | Server-side database operations and business logic |

Database access must follow the defined role permissions and security policies.

### 6.4 Deployment

| Platform | Responsibility |
|---|---|
| Vercel | Frontend hosting and deployment |
| Supabase | Backend services, authentication, database, and storage |

The application should support environment-based configuration so development and production environments can be managed independently.

---

## 7. ARCHITECTURAL PRINCIPLES

The project must follow these principles throughout development.

1. **Modular Architecture:** Separate application modules according to their responsibilities.
2. **Role-Based Access Control:** Enforce permissions at both the application and database levels.
3. **Single Source of Truth:** Store authoritative tournament and match data in Supabase.
4. **Real-Time Synchronization:** Use Supabase Realtime for relevant live updates.
5. **Data Consistency:** Prevent duplicate player assignments, invalid match events, and inconsistent statistics.
6. **Reusable Components:** Build shared UI components instead of duplicating functionality.
7. **Responsive Design:** Ensure every user interface works across supported screen sizes.
8. **Maintainable Code:** Prioritize readable JavaScript, clear naming, and simple implementation.
9. **Security First:** Never rely exclusively on frontend restrictions to protect sensitive operations.
10. **Scalable Structure:** Keep the architecture modular enough to accommodate future tournaments and additional functionality.

---

## 8. PROJECT DOCUMENTATION STRUCTURE

The project uses a documentation-first development approach.

All major implementation decisions, functional requirements, technical constraints, and design rules must be documented before application development begins.

The documentation is organized as follows:

| Document | Responsibility |
|---|---|
| `PROJECT_OVERVIEW.md` | Overall vision, scope, roles, and technical direction |
| `REQUIREMENTS.md` | Functional and non-functional requirements |
| `FEATURES.md` | Detailed feature descriptions and user workflows |
| `ARCHITECTURE.md` | Application architecture, modules, and data flow |
| `CODING_STANDARDS.md` | JavaScript, React, Tailwind, and coding conventions |
| `DATABASE.md` | Supabase schema, relationships, RLS policies, and database functions |
| `DESIGN_SYSTEM.md` | UI/UX guidelines, colors, typography, spacing, and components |

Each document has a specific responsibility and should complement the others without unnecessarily duplicating information.

If a technical implementation decision conflicts with an established project requirement, the documentation must be reviewed before implementation.

---

## 9. DEVELOPMENT GUIDELINES FOR AI CODING AGENTS

AI coding agents working on this project must follow these rules.

- Read the relevant project documentation before implementing features.
- Treat the documentation as the primary source of project requirements.
- Do not introduce technologies outside the approved stack without justification and approval.
- Use JavaScript exclusively for frontend development.
- Follow the established design system consistently.
- Respect the defined user roles and permissions.
- Never expose privileged database operations or sensitive credentials to the frontend.
- Use Supabase RLS to enforce database-level authorization.
- Avoid unnecessary dependencies and overengineering.
- Prefer simple, readable, beginner-friendly implementations.
- Preserve existing working functionality when modifying code.
- Do not modify unrelated modules while implementing a requested feature.
- Do not invent features or business rules that are not documented or approved.
- Update relevant documentation when an approved architectural or functional decision changes.

**Development must follow a structured process: understand requirements, plan implementation, build the feature, test functionality, and update documentation.**

---

## 10. PROJECT SUCCESS CRITERIA

The platform will be considered successful when it can reliably support the complete tournament workflow:

1. The Super Admin configures the tournament and registers players.
2. Three participating teams are created and manager accounts are assigned.
3. Registered goalkeepers and outfield players are allocated through their respective spin wheels.
4. The Super Admin manages tournament fixtures.
5. The Referee operates live matches and records match events.
6. Match scores and events synchronize with the public website.
7. Spectators can follow fixtures, live matches, results, standings, teams, and player statistics.
8. Managers can monitor their assigned teams through their dedicated dashboards.
9. Tournament data remains accurate, secure, and consistent throughout the competition.

**The ultimate goal is to deliver a complete, reliable, and reusable football tournament management platform that combines efficient administration with a professional public football experience.**