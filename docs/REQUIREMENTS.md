# REQUIREMENTS
**Institute Football League Platform**

## 1. INTRODUCTION & PROJECT SCOPE

### 1.1 Purpose

The Institute Football League Platform is a full-stack web application designed to manage institute-level football tournaments while providing spectators with a professional, real-time sports viewing experience.

The platform centralizes tournament administration, team management, player allocation, fixture management, match execution, and public tournament information within a single system.

It serves four primary user groups:

- **Super Admin:** Organizes and manages the entire tournament.
- **Manager:** Monitors their assigned team's squad and performance.
- **Referee:** Controls live matches and records match events.
- **Public:** Follows matches, standings, fixtures, teams, and player statistics without authentication.

### 1.2 Project Scope

The application must provide two interconnected experiences:

1. **Management Platform:** A role-based administrative environment for organizing tournaments, managing teams, allocating players, generating fixtures, and controlling matches.
2. **Public Platform:** A broadcast-style interface for spectators to follow tournament activities, live scores, match events, standings, and team information.

### 1.3 Architectural Scope

The platform shall follow a Backend-as-a-Service (BaaS) architecture using Supabase.

There shall be no separately maintained custom backend server.

Supabase will provide:

- PostgreSQL database and relational data management.
- Authentication and session management.
- Row Level Security (RLS) and authorization.
- Realtime database subscriptions.
- File storage where required.
- Edge Functions for trusted server-side operations where necessary.

The frontend will communicate directly with Supabase through its official JavaScript client.

---

## 2. TOURNAMENT CONFIGURATION & BUSINESS RULES

This section defines the confirmed tournament-specific rules that the system must enforce.

### 2.1 Initial Tournament Structure

The initial tournament configuration consists of:

| Item | Quantity |
|---|---:|
| Participating Teams | 3 |
| Team Managers | 3 |
| Goalkeepers | 3 |
| Outfield Players | 12 |
| Total Players | 15 |
| Players Per Team | 5 |
| Goalkeepers Per Team | 1 |
| Outfield Players Per Team | 4 |

Each participating team must receive exactly:

- 1 Goalkeeper.
- 4 Outfield Players.

Managers are separate from the player pool and must never be treated as tournament players.

### 2.2 Player Categories

Players must be categorized into two allocation groups:

**Goalkeeper (GK)**
- Players registered specifically as goalkeepers.
- Allocated through the dedicated goalkeeper spin wheel.

**Outfield Players**
- Players registered with one of the following positions:
  - Centre Back (CB)
  - Midfielder (MF)
  - Forward (FW)

All outfield positions share the same allocation pool.

### 2.3 Core Business Rules

- Every player must have a unique identity within the tournament.
- A player can belong to only one team.
- A player cannot be allocated more than once.
- Each team must satisfy its goalkeeper and outfield allocation requirements.
- The Super Admin controls the receiving team during player allocation.
- Player selection and team assignment are separate operations.
- The system must validate allocation limits before confirming an assignment.
- Confirmed allocations must be persisted and reflected throughout the platform.
- Managers must only access information belonging to their assigned teams.

These rules must be enforced at the database or trusted server-operation level, not merely through frontend validation.

---

## 3. USER ROLES & AUTHORIZATION

The platform shall implement strict Role-Based Access Control (RBAC).

All protected operations must be authorized through Supabase authentication and database-level RLS policies.

### 3.1 Super Admin

**Access Level:** Full tournament administration.

The Super Admin is responsible for:

- Initializing and configuring tournaments.
- Creating and managing team records.
- Creating and managing Manager and Referee accounts.
- Registering and managing the player pool.
- Managing player categories and positions.
- Executing the player allocation draft.
- Manually selecting the receiving team during allocation.
- Managing tournament fixtures.
- Assigning referees to matches.
- Monitoring all matches.
- Overriding match results and correcting match events when necessary.
- Managing tournament standings and statistics.
- Accessing all administrative dashboards.

The Super Admin must have complete administrative authority over tournament data.

### 3.2 Manager

**Access Level:** Read-only, team-scoped access.

Each Manager must be assigned to exactly one team.

Managers can:

- View their assigned team's dashboard.
- View their complete squad.
- View individual player profiles and positions.
- View team match fixtures and results.
- Monitor team standings and tournament performance.
- View player statistics, including goals and disciplinary cards.
- View historical match information.

Managers cannot:

- Modify tournament settings.
- Add, edit, or remove players.
- Allocate players to teams.
- Execute or modify the draft.
- Modify fixtures.
- Control live matches.
- Modify match events or results.
- Access another team's private management dashboard.

Manager accounts must only receive access to their assigned team's information.

### 3.3 Referee

**Access Level:** Match-specific operational permissions.

Referees are responsible for controlling assigned matches.

They can:

- View their assigned matches.
- Access the dedicated live match control panel.
- Start, pause, resume, and end the match clock.
- Record goals.
- Record yellow cards.
- Record red cards.
- Undo their most recent action.
- View the current match score and event history.

Referees cannot:

- Modify tournament configurations.
- Manage teams or players.
- Execute player allocation.
- Modify fixtures.
- Control matches assigned to other referees.
- Directly modify tournament standings.
- Override finalized match results.

The Super Admin retains authority to correct or override referee-recorded information.

### 3.4 Public / Unauthenticated Users

**Access Level:** Public read-only access.

Public visitors must be able to access tournament information without creating an account.

They can:

- View the tournament homepage.
- View live match scoreboards.
- Follow match clocks and match events.
- View tournament fixtures.
- View completed match results.
- View tournament standings.
- Explore team profiles and squads.
- View player profiles and statistics.
- View player leaderboards.

Public users must never have permission to modify tournament data or access protected management information.

### 3.5 Permission Matrix

| Capability | Super Admin | Manager | Referee | Public |
|---|:---:|:---:|:---:|:---:|
| View Public Tournament | Yes | Yes | Yes | Yes |
| Manage Tournament | Yes | No | No | No |
| Manage Teams | Yes | No | No | No |
| Manage Players | Yes | No | No | No |
| Execute Player Draft | Yes | No | No | No |
| Generate Fixtures | Yes | No | No | No |
| View Assigned Team | Yes | Yes | No | Yes |
| View All Teams | Yes | No | No | Yes |
| Control Assigned Match | Override | No | Yes | No |
| Record Match Events | Override | No | Yes | No |
| Modify Final Results | Yes | No | No | No |
| View Standings | Yes | Yes | Yes | Yes |

---

## 4. FUNCTIONAL REQUIREMENTS

### FR1. Authentication & Account Management

**FR1.1:** The system shall use Supabase Auth for authenticated users.

**FR1.2:** Super Admin, Manager, and Referee accounts shall authenticate using email and password.

**FR1.3:** Public visitors shall be able to access public tournament pages without authentication.

**FR1.4:** Each authenticated user shall have an associated application profile containing their assigned role and relevant account information.

**FR1.5:** The system shall redirect authenticated users to their appropriate role-based dashboard.

**FR1.6:** Unauthorized users attempting to access protected routes shall be denied access.

**FR1.7:** User roles shall be validated through trusted authorization data and must not rely on editable frontend state.

**FR1.8:** Only the Super Admin shall be authorized to create and manage Manager and Referee accounts.

**FR1.9:** The system shall support secure logout and session expiration handling.

**FR1.10:** Disabled accounts shall not be allowed to perform authenticated operations.

### FR2. Tournament Management

**FR2.1:** The Super Admin shall be able to create and configure a tournament.

**FR2.2:** Tournament configuration shall include:

- Tournament name.
- Tournament start date.
- Participating teams.
- Tournament status.

**FR2.3:** The Super Admin shall be able to edit tournament information.

**FR2.4:** The system shall maintain tournament information consistently across administrative and public interfaces.

**FR2.5:** The system shall support tournament states such as Upcoming, Ongoing, and Completed.

**FR2.6:** Tournament-related records shall maintain their association with the appropriate tournament.

### FR3. Team Management

**FR3.1:** The Super Admin shall be able to create, edit, and manage participating teams.

**FR3.2:** Each team shall have its own profile containing its name, logo, assigned manager, and squad information.

**FR3.3:** Each team shall be associated with one Manager account.

**FR3.4:** The system shall prevent a Manager from accessing another team's restricted management information.

**FR3.5:** The system shall automatically reflect confirmed player allocations in the respective team squads.

**FR3.6:** Team profiles shall be accessible through the public interface.

### FR4. Player Pool Management

**FR4.1:** The Super Admin shall be able to register players individually or through bulk upload.

**FR4.2:** Each player record shall support the following information:

- Player name.
- Player category.
- Playing position.
- Optional profile image.
- Allocation status.

**FR4.3:** Player categories shall be restricted to Goalkeeper and Outfield.

**FR4.4:** Outfield players shall have one of the following positions: CB, MF, or FW.

**FR4.5:** The system shall distinguish between available and allocated players.

**FR4.6:** Allocated players shall not appear in the available selection pool.

**FR4.7:** The Super Admin shall be able to correct player information before or after allocation, subject to the relevant data integrity rules.

**FR4.8:** The system shall prevent duplicate player registration within the same tournament.

### FR5. Player Allocation Draft (Spin Wheel)

The platform shall provide a digital player allocation system controlled exclusively by the Super Admin.

#### 5.1 Independent Spin Wheels

**FR5.1.1:** The system shall provide two independent spin wheels:

- Goalkeeper Spin Wheel.
- Outfield Player Spin Wheel.

**FR5.1.2:** Each wheel shall retrieve players exclusively from its corresponding available player pool.

**FR5.1.3:** Allocated players shall automatically be excluded from subsequent spins.

**FR5.1.4:** The system shall randomly select one eligible player when the Super Admin initiates a spin.

#### 5.2 Team Selection

**FR5.2.1:** After a player is selected, the Super Admin shall manually choose the receiving team.

**FR5.2.2:** The system shall display the eligible teams and their current allocation status.

**FR5.2.3:** The system shall validate the selected team's available allocation capacity.

**FR5.2.4:** The Super Admin must explicitly confirm the allocation before it is finalized.

**FR5.2.5:** No player shall be automatically assigned to a team based solely on the spin result.

#### 5.3 Allocation Validation

**FR5.3.1:** Each team shall receive exactly one goalkeeper and four outfield players.

**FR5.3.2:** The system shall prevent assigning multiple goalkeepers to the same team.

**FR5.3.3:** The system shall prevent assigning more than four outfield players to the same team.

**FR5.3.4:** The system shall prevent duplicate allocation of any player.

**FR5.3.5:** Allocation confirmation shall be processed atomically to prevent duplicate assignments caused by simultaneous requests or network retries.

**FR5.3.6:** Once confirmed, the allocation shall immediately update the player pool, team squad, and allocation board.

#### 5.4 Allocation Dashboard

**FR5.4.1:** The draft interface shall display:

- Total registered goalkeepers.
- Available goalkeepers.
- Allocated goalkeepers.
- Total registered outfield players.
- Available outfield players.
- Allocated outfield players.
- Current squad size for each team.
- Players allocated to each team.

**FR5.4.2:** The interface shall visually distinguish between completed and pending team allocations.

**FR5.4.3:** The system shall clearly indicate when the allocation process is complete.

### FR6. Fixture Management

**FR6.1:** The Super Admin shall be able to create and manage tournament fixtures.

**FR6.2:** Each fixture shall contain:

- Home team.
- Away team.
- Match date.
- Match time.
- Match status.
- Assigned referee.

**FR6.3:** The Super Admin shall be able to edit or reschedule fixtures.

**FR6.4:** The system shall prevent a team from being scheduled against itself.

**FR6.5:** The system shall prevent invalid or duplicate fixture records.

**FR6.6:** Managers shall be able to view fixtures involving their assigned teams.

**FR6.7:** Public visitors shall be able to view the complete tournament schedule.

### FR7. Match Management & Referee Controls

#### 7.1 Live Match Interface

**FR7.1.1:** The Referee shall have access to a dedicated mobile-optimized match control interface.

**FR7.1.2:** The interface shall display:

- Home and away teams.
- Current score.
- Match clock.
- Match status.
- Match event history.
- Player selection controls.
- Match event controls.

**FR7.1.3:** Interactive controls shall use large, clearly identifiable touch targets suitable for mobile operation.

#### 7.2 Match Clock

**FR7.2.1:** The Referee shall be able to start the match clock.

**FR7.2.2:** The Referee shall be able to pause the clock.

**FR7.2.3:** The Referee shall be able to resume a paused clock.

**FR7.2.4:** The Referee shall be able to end the match.

**FR7.2.5:** Match clock state shall persist across browser refreshes and temporary connection interruptions.

**FR7.2.6:** The displayed clock shall remain synchronized with the persisted match timing state rather than relying exclusively on a continuously running client-side timer.

#### 7.3 Match Event Management

**FR7.3.1:** The Referee shall be able to record the following events:

- Goal.
- Yellow Card.
- Red Card.

**FR7.3.2:** Each event shall be associated with the relevant match and player.

**FR7.3.3:** Goal events shall update the corresponding team's score.

**FR7.3.4:** Card events shall update the relevant player's disciplinary statistics.

**FR7.3.5:** Each event shall record its event type, player, team, match time, and creation timestamp.

**FR7.3.6:** Recorded events shall immediately update the referee interface and public match information.

#### 7.4 Undo & Correction

**FR7.4.1:** The Referee shall have an Undo control for reversing their most recent eligible match action.

**FR7.4.2:** Undo shall reverse the original event and its associated score or statistical changes.

**FR7.4.3:** Undo operations shall be processed safely to prevent accidental deletion of unrelated events.

**FR7.4.4:** Corrected events shall be reflected in the public interface and statistical records.

**FR7.4.5:** The Super Admin shall have the ability to review and correct match records when required.

#### 7.5 Match Completion

**FR7.5.1:** The Referee shall be able to finalize an active match.

**FR7.5.2:** Once finalized, the match shall be marked as completed.

**FR7.5.3:** Finalized match information shall be used to update tournament standings and player statistics.

**FR7.5.4:** Only authorized users shall be able to make corrections to finalized match records.

### FR8. Tournament Standings & Statistics

**FR8.1:** The system shall maintain a dynamic tournament points table.

**FR8.2:** The standings shall display:

- Position.
- Team name.
- Matches played (MP).
- Wins (W).
- Draws (D).
- Losses (L).
- Goals for (GF).
- Goals against (GA).
- Goal difference (GD).
- Points (PTS).

**FR8.3:** The system shall calculate goal difference using:

GD = GF - GA

**FR8.4:** The system shall automatically update standings using finalized match results.

**FR8.5:** The system shall maintain player statistics, including goals, yellow cards, and red cards.

**FR8.6:** The platform shall provide player leaderboards based on available tournament statistics.

**FR8.7:** Match corrections shall trigger recalculation of all affected standings and statistics.

**FR8.8:** Unfinalized matches shall not affect official tournament standings.

### FR9. Public Tournament Dashboard

**FR9.1:** The public homepage shall provide an overview of the tournament.

**FR9.2:** The homepage shall display active matches prominently.

**FR9.3:** Live match information shall include team names, scores, match clock, and current status.

**FR9.4:** Public visitors shall be able to explore tournament fixtures and completed results.

**FR9.5:** Public visitors shall be able to access team profiles and player information.

**FR9.6:** Public visitors shall be able to view the current standings.

**FR9.7:** Public visitors shall be able to view player statistics and leaderboards.

**FR9.8:** Public pages shall be accessible without authentication.

### FR10. Real-Time Synchronization

**FR10.1:** The platform shall use Supabase Realtime to synchronize relevant database changes.

**FR10.2:** Referee-recorded match events shall be reflected on the public scoreboard without requiring a page refresh.

**FR10.3:** Score changes shall synchronize across connected clients.

**FR10.4:** Match clock state changes shall synchronize across connected clients.

**FR10.5:** Tournament standings and player statistics shall update following relevant finalized match changes.

**FR10.6:** The frontend shall handle Realtime subscription connection and disconnection states.

**FR10.7:** When a client reconnects, it shall retrieve the latest authoritative database state rather than assuming that no updates occurred while disconnected.

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### NFR1. Performance & Responsiveness

**NFR1.1:** Referee-to-public match event synchronization should achieve sub-second latency under normal network conditions.

**NFR1.2:** The application shall target the following Core Web Vitals:

| Metric | Target |
|---|---:|
| Largest Contentful Paint (LCP) | ≤ 2.5 seconds |
| Interaction to Next Paint (INP) | ≤ 200 ms |
| Cumulative Layout Shift (CLS) | ≤ 0.1 |

**NFR1.3:** The application shall minimize unnecessary component re-renders during live match updates.

**NFR1.4:** The frontend shall implement route-level code splitting and lazy loading where beneficial.

**NFR1.5:** Images and other media assets shall be optimized for efficient loading.

**NFR1.6:** Frequently accessed data shall use appropriate caching and invalidation strategies.

### NFR2. UI/UX & Design Standards

**NFR2.1:** The application shall follow the approved Premium Dark Sports design system.

**NFR2.2:** The primary visual theme shall use:

- Background: Pure Graphite (`#090909`).
- Primary Accent: Electric Lime Green (`#B8F34A`).
- Supporting surfaces, text colors, borders, and other tokens: As defined in `DESIGN_SYSTEM.md`.

**NFR2.3:** The interface shall maintain consistent visual components, typography, spacing, and interaction patterns across all user roles.

**NFR2.4:** The application shall follow a mobile-first responsive design approach.

**NFR2.5:** Public and management dashboards shall adapt to mobile, tablet, and desktop screen sizes.

**NFR2.6:** Mobile management navigation shall use the approved bottom navigation pattern for primary destinations, while desktop navigation shall use the approved sidebar and top-bar layout.

**NFR2.7:** The referee interface shall prioritize usability during live match operations, with minimal navigation and clearly accessible controls.

**NFR2.8:** Interactive elements shall provide appropriate hover, focus, active, disabled, loading, and error states.

### NFR3. Accessibility

**NFR3.1:** The application shall target WCAG 2.2 Level AA accessibility standards.

**NFR3.2:** Interactive elements shall provide minimum touch target dimensions of 44 × 44 CSS pixels, subject to applicable WCAG exceptions.

**NFR3.3:** Text and interactive elements shall maintain sufficient color contrast.

**NFR3.4:** All important interactive controls shall support keyboard navigation.

**NFR3.5:** Form fields shall include accessible labels and appropriate validation messages.

**NFR3.6:** Important status changes shall not rely exclusively on color to communicate information.

### NFR4. Security & Data Protection

**NFR4.1:** Supabase RLS policies shall enforce authorization at the database level.

**NFR4.2:** Public users shall only be able to read explicitly permitted public tournament data.

**NFR4.3:** Managers shall only be able to access information associated with their assigned teams.

**NFR4.4:** Referees shall only be able to perform permitted operations on their assigned matches.

**NFR4.5:** Super Admin permissions shall be enforced through trusted authorization mechanisms.

**NFR4.6:** The Supabase service role key shall never be exposed in frontend code.

**NFR4.7:** Sensitive operations, including player allocation and match finalization, shall use trusted database transactions or server-side functions where necessary.

**NFR4.8:** The application shall validate user input before database operations.

**NFR4.9:** Database authorization shall not depend solely on frontend route protection or hidden UI elements.

### NFR5. Reliability & Data Integrity

**NFR5.1:** The database shall enforce appropriate primary keys, foreign keys, unique constraints, and validation constraints.

**NFR5.2:** Referential integrity shall be maintained between tournaments, teams, players, matches, and match events.

**NFR5.3:** Deletion of records referenced by important tournament data shall be restricted or handled through explicitly defined cascading rules.

**NFR5.4:** Critical operations shall be atomic to prevent partially completed database updates.

**NFR5.5:** The application shall prevent duplicate player allocations and duplicate event submissions.

**NFR5.6:** The application shall handle temporary network interruptions without silently losing match actions.

**NFR5.7:** Pending referee actions shall have a clear synchronization status, including pending, synchronized, and failed states.

**NFR5.8:** Reconnection shall trigger synchronization with the latest database state.

**NFR5.9:** Failed operations shall provide clear error feedback and shall not be displayed as successfully completed.

### NFR6. Maintainability & Code Quality

**NFR6.1:** The codebase shall follow a modular and feature-oriented architecture.

**NFR6.2:** Components shall have clear and limited responsibilities.

**NFR6.3:** Shared UI components shall be reusable across appropriate application areas.

**NFR6.4:** Business logic shall remain separate from presentation components wherever practical.

**NFR6.5:** Database operations and Supabase interactions shall be organized into maintainable service or feature modules.

**NFR6.6:** The application shall use consistent naming conventions and coding patterns.

**NFR6.7:** Complex business operations shall include meaningful documentation.

**NFR6.8:** The implementation shall prioritize readable, maintainable JavaScript over unnecessary abstractions or premature optimization.

---

## 6. TECHNICAL & ENVIRONMENT CONSTRAINTS

### 6.1 Frontend Technology

The application shall use the following technologies:

| Technology | Responsibility |
|---|---|
| React | Component-based frontend |
| Vite | Development server and build tooling |
| JavaScript | Application programming language |
| Tailwind CSS | Styling and responsive layouts |
| React Router DOM | Client-side routing |
| Redux Toolkit | Client-side application state |
| TanStack Query | Server-state caching and synchronization |
| Lucide React | Icon library |
| Supabase JS | Frontend-to-Supabase communication |

**Important:** TypeScript shall not be used. The entire frontend application must be implemented in JavaScript (`.js` and `.jsx`).

### 6.2 Backend & Database

The platform shall use Supabase as its complete backend infrastructure.

| Supabase Service | Responsibility |
|---|---|
| PostgreSQL | Relational database |
| Supabase Auth | Authentication and sessions |
| Row Level Security | Database authorization |
| Supabase Realtime | Live data synchronization |
| Supabase Storage | File and image storage |
| Edge Functions | Trusted server-side operations when required |

No separate Express.js, Node.js, or other custom backend server shall be introduced.

Database functions, triggers, constraints, and Edge Functions may be used where appropriate.

### 6.3 State Management

The application shall use separate strategies for client state and server state.

**Redux Toolkit:**
- Authentication-related client state.
- UI state.
- Navigation state.
- Temporary interaction state.
- Other shared client-side state where appropriate.

**TanStack Query:**
- Tournament data.
- Teams and player records.
- Fixtures and match results.
- Standings and statistics.
- Database queries and mutation management.
- Server-state caching and invalidation.

Supabase Realtime shall be integrated with the relevant server-state synchronization strategy.

The same server data should not be unnecessarily duplicated across Redux and TanStack Query.

### 6.4 Development Environment

The project shall support development on:

- Windows 10.
- Windows Subsystem for Linux 2 (WSL 2).
- Docker Desktop.
- Supabase CLI.
- Local Supabase development environment.

The repository shall include the necessary configuration and setup documentation for local development.

Database schema changes and migrations shall be version-controlled.

### 6.5 Deployment Environment

**Frontend Hosting:** Vercel.

**Backend Infrastructure:** Production Supabase project.

The application shall support:

- Production environment variables.
- Secure Supabase configuration.
- Production database migrations.
- Vercel deployment and build processes.
- Separate development and production configurations.

Sensitive environment variables and credentials must not be committed to the public repository.

### 6.6 AI-Assisted Development Compatibility

The repository shall maintain a structure suitable for AI-assisted development using tools such as:

- Antigravity AI.
- Cursor.
- Lovable.
- Other compatible LLM coding agents.

The codebase shall prioritize:

- Predictable folder organization.
- Clear component responsibilities.
- Consistent naming conventions.
- Documented business rules.
- Modular database operations.
- Explicit technical constraints.
- Small, maintainable implementation units.

AI-generated changes must preserve existing architecture, business rules, and working functionality.

---

## 7. SYSTEM-WIDE REQUIREMENTS

### 7.1 Data Consistency

All tournament information displayed across public and authenticated interfaces must originate from the authoritative Supabase database.

### 7.2 Authorization Consistency

Frontend route protection and UI-level permissions shall complement, but never replace, database-level authorization.

### 7.3 Error Handling

The application shall provide meaningful error messages for:

- Authentication failures.
- Unauthorized operations.
- Invalid form submissions.
- Failed database operations.
- Realtime connection failures.
- Network interruptions.
- Invalid player allocations.
- Failed match event submissions.

### 7.4 Loading & Empty States

All data-driven pages shall provide appropriate:

- Loading indicators.
- Empty states.
- Error states.
- Success feedback.

### 7.5 Responsive Behavior

All major application features shall remain usable across supported mobile, tablet, and desktop viewports.

---

## 8. REQUIREMENTS VALIDATION & ACCEPTANCE CRITERIA

The platform shall be considered functionally ready for its initial tournament when the following conditions are satisfied.

### 8.1 Authentication & Authorization

- [ ] Super Admin, Manager, and Referee can authenticate.
- [ ] Each role receives the correct dashboard.
- [ ] Managers cannot access another team's restricted data.
- [ ] Referees cannot control unassigned matches.
- [ ] Public visitors cannot perform protected operations.
- [ ] RLS policies independently enforce permissions.

### 8.2 Tournament & Player Allocation

- [ ] The Super Admin can configure the tournament.
- [ ] Three teams and their managers can be registered.
- [ ] Three goalkeepers and twelve outfield players can be registered.
- [ ] The goalkeeper and outfield spin wheels operate independently.
- [ ] The Super Admin manually selects the receiving team.
- [ ] Each team receives exactly one goalkeeper and four outfield players.
- [ ] Duplicate player allocation is prevented.
- [ ] Allocation changes persist in Supabase.

### 8.3 Fixtures & Matches

- [ ] Fixtures can be created and managed.
- [ ] Referees can access their assigned matches.
- [ ] The match clock supports start, pause, resume, and end.
- [ ] Goals and cards can be recorded.
- [ ] Undo correctly reverses the most recent eligible action.
- [ ] Match information persists after browser refreshes.

### 8.4 Public Experience & Statistics

- [ ] Public visitors can access tournament information without authentication.
- [ ] Live scores synchronize without page refreshes.
- [ ] Match events appear on the public interface.
- [ ] Completed matches update tournament standings.
- [ ] Player statistics reflect recorded match events.
- [ ] Public team profiles and fixtures display accurate information.

### 8.5 Reliability & Security

- [ ] Database constraints prevent invalid relationships.
- [ ] Critical operations are transactionally safe.
- [ ] Failed network operations are clearly identified.
- [ ] Reconnection restores the latest authoritative state.
- [ ] Sensitive credentials remain protected.
- [ ] Role permissions are enforced at the database level.

---

## 9. DOCUMENTATION & REQUIREMENT BOUNDARIES

This document defines what the platform must accomplish and the rules it must follow.

It does not prescribe every implementation detail or duplicate the responsibilities of other technical documentation.

The following documents define their respective areas:

| Document | Responsibility |
|---|---|
| `PROJECT_OVERVIEW.md` | Project vision, objectives, and scope |
| `REQUIREMENTS.md` | Functional requirements, business rules, and constraints |
| `FEATURES.md` | Detailed feature descriptions by user role |
| `ARCHITECTURE.md` | Application architecture and technical organization |
| `DATABASE.md` | Database schema, relationships, constraints, and RLS policies |
| `DESIGN_SYSTEM.md` | Colors, typography, spacing, components, and visual standards |

All implementation decisions must remain consistent with these documents.

Where a requirement has not yet been explicitly defined, implementation agents must not invent business rules or assume behavior. Such decisions must be documented and confirmed before implementation.

**End of Requirements Document.**