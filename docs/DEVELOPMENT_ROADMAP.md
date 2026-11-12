# DEVELOPMENT ROADMAP
**Institute Football League Platform**

## 1. DEVELOPMENT STRATEGY

The Institute Football League Platform will be developed through a structured, phase-based implementation approach.

Development will prioritize:

1. Establishing a stable technical foundation.
2. Implementing database architecture and security.
3. Building role-based authentication and authorization.
4. Developing tournament administration features.
5. Implementing player allocation and fixture management.
6. Building live match execution capabilities.
7. Integrating real-time public experiences.
8. Testing, optimizing, and deploying the complete application.

### Development Principles

- Complete and validate each phase before moving to the next.
- Follow the established project documentation.
- Implement database structures before dependent frontend features.
- Enforce critical business rules at the database or trusted server-operation level.
- Build reusable components without unnecessary abstractions.
- Keep JavaScript code simple, readable, and maintainable.
- Avoid modifying working features unnecessarily.
- Test important functionality throughout development rather than postponing all testing until the end.

---

# 2. DEVELOPMENT PHASES

## PHASE 0: Project Preparation & Environment Setup

**Objective:** Establish the repository, development environment, and technical foundation.

### Tasks

- [ ] Initialize the Git repository.
- [ ] Create the React + Vite project.
- [ ] Configure JavaScript and JSX.
- [ ] Install and configure Tailwind CSS.
- [ ] Install React Router DOM.
- [ ] Install Redux Toolkit and React Redux.
- [ ] Install TanStack Query.
- [ ] Install Lucide React.
- [ ] Install and configure the Supabase JavaScript client.
- [ ] Configure environment variables.
- [ ] Configure ESLint and basic code quality rules.
- [ ] Create the initial folder structure.
- [ ] Configure Git ignore rules.
- [ ] Establish the local development workflow.

### Deliverables

- Working React + Vite application.
- Configured frontend dependencies.
- Initial repository structure.
- Supabase client configuration.
- Environment variable template.
- Development setup documentation.

### Completion Criteria

The application must start successfully in the local development environment without configuration errors.

---

## PHASE 1: Design System & Application Foundation

**Objective:** Establish the visual system, application structure, navigation, and reusable UI components before implementing business functionality.

### Tasks

**1.1 Design System Implementation**

- [ ] Define global color tokens.
- [ ] Configure typography.
- [ ] Configure spacing and layout standards.
- [ ] Implement responsive breakpoints.
- [ ] Establish border radius and shadow standards.
- [ ] Define button variants.
- [ ] Define card and surface styles.
- [ ] Define form and input styles.
- [ ] Define modal and dialog styles.
- [ ] Define loading, empty, error, and success states.

**1.2 Shared UI Components**

- [ ] Buttons.
- [ ] Input fields.
- [ ] Select components.
- [ ] Dropdown menus.
- [ ] Cards.
- [ ] Badges.
- [ ] Tables.
- [ ] Dialogs.
- [ ] Confirmation dialogs.
- [ ] Toast notifications.
- [ ] Loading indicators.
- [ ] Empty states.
- [ ] Error states.

**1.3 Application Layouts**

- [ ] Public website layout.
- [ ] Super Admin dashboard layout.
- [ ] Manager dashboard layout.
- [ ] Referee match-control layout.

**1.4 Navigation**

- [ ] Configure application routes.
- [ ] Implement desktop sidebar navigation.
- [ ] Implement tablet navigation.
- [ ] Implement mobile bottom navigation.
- [ ] Configure protected route placeholders.
- [ ] Configure page-level loading behavior.

### Deliverables

- Implemented design system.
- Reusable UI component library.
- Responsive application layouts.
- Configured routing system.
- Initial dashboard structures.

### Completion Criteria

All major layouts must follow `DESIGN_SYSTEM.md` and function correctly across mobile, tablet, and desktop viewports.

---

## PHASE 2: Database Architecture & Backend Foundation

**Objective:** Establish the complete Supabase infrastructure before building features that depend on persistent data.

### Tasks

**2.1 Supabase Environment**

- [ ] Create and configure the Supabase project.
- [ ] Configure Supabase local development.
- [ ] Configure Docker Desktop and Supabase CLI.
- [ ] Establish database migration workflow.
- [ ] Configure local and production environments.

**2.2 Database Design**

Design and implement the required relational tables.

Initial database entities:

- [ ] Profiles.
- [ ] Tournaments.
- [ ] Teams.
- [ ] Tournament Managers.
- [ ] Players.
- [ ] Player Allocations.
- [ ] Matches.
- [ ] Match Events.

The final schema must follow `DATABASE.md`.

**2.3 Database Relationships & Constraints**

- [ ] Define primary keys.
- [ ] Define foreign keys.
- [ ] Define unique constraints.
- [ ] Define required fields and validation constraints.
- [ ] Establish appropriate indexes.
- [ ] Define deletion and cascading behavior.
- [ ] Establish tournament-level data relationships.

**2.4 Security Architecture**

- [ ] Enable RLS on protected tables.
- [ ] Define Super Admin policies.
- [ ] Define Manager policies.
- [ ] Define Referee policies.
- [ ] Define public read-only policies.
- [ ] Protect role assignment and administrative permissions.
- [ ] Verify that frontend users cannot bypass database permissions.

**2.5 Trusted Database Operations**

- [ ] Create transactional player allocation operations.
- [ ] Establish secure match event operations.
- [ ] Establish match finalization operations.
- [ ] Define appropriate database functions and triggers where required.

### Deliverables

- Complete initial database schema.
- Version-controlled database migrations.
- Database relationships and constraints.
- RLS policies.
- Trusted database operations.
- Supabase local development environment.

### Completion Criteria

The database must support the required relationships and enforce authorization independently of the frontend.

---

## PHASE 3: Authentication & Role-Based Access Control

**Objective:** Implement secure authentication and role-specific access throughout the application.

### Tasks

**3.1 Authentication**

- [x] Login interface.
- [x] Supabase email/password authentication.
- [x] Session persistence.
- [x] Logout functionality.
- [x] Authentication state management.
- [x] Authentication error handling.
- [x] Account disabled-state handling.

**3.2 User Profile Management**

- [x] Retrieve authenticated user profiles.
- [x] Retrieve assigned roles.
- [x] Associate Managers with their teams.
- [x] Associate Referees with their permitted matches.

**3.3 Role-Based Navigation**

- [x] Super Admin dashboard routing.
- [x] Manager dashboard routing.
- [x] Referee dashboard routing.
- [x] Public route accessibility.
- [x] Protected route handling.
- [x] Unauthorized access handling.

**3.4 Permission Validation**

- [x] Test Super Admin permissions.
- [x] Test Manager restrictions.
- [x] Test Referee restrictions.
- [x] Test Public restrictions.
- [x] Verify RLS enforcement through direct database requests.

### Deliverables

- Working authentication system.
- Role-based dashboard redirection.
- Protected application routes.
- Verified database authorization.

### Completion Criteria

Each authenticated role must access only its permitted application functionality and data.

---

## PHASE 4: Tournament, Team & Player Management

**Objective:** Build the core tournament administration system.

### Tasks

**4.1 Tournament Management**

- [x] Create tournament interface.
- [x] Tournament configuration form.
- [x] Tournament editing.
- [x] Tournament status management.
- [x] Tournament overview dashboard.

**4.2 Team Management**

- [x] Create team functionality.
- [x] Edit team information.
- [x] Team logo management.
- [x] Assign Managers to teams.
- [x] Team profile interface.
- [x] Team squad overview.

**4.3 Player Management**

- [x] Add individual players.
- [x] Bulk player registration.
- [x] Edit player information.
- [x] Assign player categories.
- [x] Assign outfield positions.
- [x] Player profile interface.
- [x] Available player pool.
- [x] Allocated player pool.
- [x] Duplicate registration validation.

**4.4 Manager Dashboard**

- [x] Team overview.
- [x] Squad list.
- [x] Player profiles.
- [x] Team fixtures.
- [x] Team results.
- [x] Team performance statistics.

### Deliverables

- Functional tournament management.
- Functional team management.
- Complete player registration system.
- Manager dashboard.

### Completion Criteria

The Super Admin must be able to configure the tournament, register three teams, assign three Managers, and register the complete player pool.

Expected initial player pool:

| Category | Players |
|---|---:|
| Goalkeepers | 3 |
| Outfield | 12 |
| Total | 15 |

---

## PHASE 5: Player Allocation System (Spin Wheel)

**Objective:** Implement the interactive player drafting system and enforce all allocation rules.

### Tasks

**5.1 Draft Interface**

- [x] Create the allocation dashboard.
- [x] Implement the goalkeeper spin wheel.
- [x] Implement the outfield spin wheel.
- [x] Retrieve eligible players from Supabase.
- [x] Implement random player selection.
- [x] Display selected player information.
- [x] Add spin animation and selection feedback.

**5.2 Team Selection**

- [x] Display participating teams.
- [x] Show each team's current squad size.
- [x] Display goalkeeper allocation status.
- [x] Display outfield allocation status.
- [x] Allow the Super Admin to select the receiving team.
- [x] Implement allocation confirmation.

**5.3 Allocation Processing**

- [x] Validate player availability.
- [x] Validate team allocation capacity.
- [x] Prevent duplicate assignments.
- [x] Persist confirmed allocations.
- [x] Update the available player pool.
- [x] Update the corresponding team squad.
- [x] Handle concurrent requests and network retries.

**5.4 Allocation Progress**

- [x] Display allocation statistics.
- [x] Display team-by-team allocation progress.
- [x] Display allocated players.
- [x] Display remaining players.
- [x] Display allocation completion status.

### Deliverables

- Two independent spin wheels.
- Functional player selection.
- Manual team selection.
- Secure allocation confirmation.
- Real-time allocation board.

### Completion Criteria

Every team must receive exactly one goalkeeper and four outfield players.

No player may be allocated twice or assigned to an invalid team.

---

## PHASE 6: Fixture Management

**Objective:** Implement tournament scheduling and match administration.

### Tasks

- [x] Create fixture management dashboard.
- [x] Create match fixtures.
- [x] Select home and away teams.
- [x] Configure match date and time.
- [x] Assign referees.
- [x] Edit existing fixtures.
- [x] Reschedule matches.
- [x] Display fixture status.
- [x] Implement fixture validation.
- [x] Display upcoming and completed matches.
- [x] Display team-specific fixtures.

### Fixture Generation

- [x] Implement fixture generation according to the confirmed tournament format.
- [x] Validate generated fixtures.
- [x] Prevent duplicate pairings where prohibited.
- [x] Allow Super Admin review before publishing generated fixtures.

### Deliverables

- Fixture management dashboard.
- Match scheduling functionality.
- Referee assignment functionality.
- Public and team-specific fixture data.

### Completion Criteria

The Super Admin must be able to create, edit, assign, and publish valid tournament fixtures.

---

## PHASE 7: Live Match Management & Referee System

**Objective:** Build the match execution system, allowing referees to control matches and record events.

### Tasks

**7.1 Referee Dashboard**

- [x] Display assigned matches.
- [x] Display upcoming matches.
- [x] Display active matches.
- [x] Provide access to the match-control interface.

**7.2 Match Control Interface**

- [x] Display home and away teams.
- [x] Display current match score.
- [x] Display match clock.
- [x] Display match status.
- [x] Display match event history.
- [x] Implement mobile-first controls.

**7.3 Match Clock**

- [x] Start match.
- [x] Pause match.
- [x] Resume match.
- [x] End match.
- [x] Persist clock state.
- [x] Synchronize match timing across clients.
- [x] Restore clock state after browser refresh.

**7.4 Match Events**

- [x] Record goals.
- [x] Record yellow cards.
- [x] Record red cards.
- [x] Select relevant players.
- [x] Associate events with teams.
- [x] Record event timestamps.
- [x] Update the match score.
- [x] Update player statistics.

**7.5 Undo & Correction**

- [x] Implement Undo functionality.
- [x] Reverse the latest eligible action.
- [x] Restore the previous score when undoing a goal.
- [x] Restore player statistics when undoing cards.
- [x] Maintain an event history.
- [x] Handle failed undo operations safely.

**7.6 Match Finalization**

- [x] Finalize completed matches.
- [x] Persist final match results.
- [x] Prevent unauthorized modifications.
- [x] Allow authorized Super Admin corrections.
- [x] Trigger standings recalculation.

### Deliverables

- Referee dashboard.
- Live match-control interface.
- Persistent match clock.
- Match event recording.
- Undo functionality.
- Match finalization workflow.

### Completion Criteria

A referee must be able to operate an entire match through the mobile interface, including recording events, correcting mistakes, and finalizing the result.

---

## PHASE 8: Standings & Player Statistics

**Objective:** Implement automatic tournament calculations using finalized match results and recorded events.

### Tasks

**8.1 Team Standings**

- [x] Calculate matches played.
- [x] Calculate wins.
- [x] Calculate draws.
- [x] Calculate losses.
- [x] Calculate goals for.
- [x] Calculate goals against.
- [x] Calculate goal difference.
- [x] Calculate tournament points.
- [x] Implement confirmed tie-breaking rules.
- [x] Sort teams according to tournament rules.

**8.2 Player Statistics**

- [x] Calculate individual goals.
- [x] Calculate yellow cards.
- [x] Calculate red cards.
- [x] Generate goal leaderboards.
- [x] Display player statistics on profiles.

**8.3 Data Recalculation**

- [x] Recalculate affected standings after match finalization.
- [x] Recalculate statistics after authorized match corrections.
- [x] Prevent unfinished matches from affecting official standings.
- [x] Ensure calculations remain consistent with match events.

### Deliverables

- Dynamic tournament standings.
- Player statistics.
- Player leaderboards.
- Automatic recalculation system.

### Completion Criteria

All official standings and statistics must accurately reflect finalized tournament matches.

---

## PHASE 9: Public Dashboard & Real-Time Experience

**Objective:** Deliver the public-facing broadcast-style tournament experience.

### Tasks

**9.1 Public Homepage**

- [x] Tournament overview.
- [x] Active match scoreboard.
- [x] Upcoming fixtures.
- [x] Recent results.
- [x] Current tournament standings.
- [x] Featured teams.
- [x] Player leaderboard.

**9.2 Public Match Experience**

- [x] Live match scoreboard.
- [x] Match clock.
- [x] Home and away team information.
- [x] Live match events.
- [x] Goal notifications.
- [x] Card notifications.
- [x] Completed match results.

**9.3 Team & Player Pages**

- [x] Team profiles.
- [x] Team squad lists.
- [x] Team statistics.
- [x] Player profiles.
- [x] Player statistics.
- [x] Team fixture history.

**9.4 Realtime Integration**

- [x] Configure Supabase Realtime subscriptions.
- [x] Synchronize active match scores.
- [x] Synchronize match clock changes.
- [x] Synchronize match events.
- [x] Update standings after finalized matches.
- [x] Handle subscription reconnection.
- [x] Fetch authoritative data after reconnecting.
- [x] Prevent duplicate event rendering.

### Deliverables

- Complete public tournament website.
- Live scoreboard.
- Public match experience.
- Team and player pages.
- Real-time synchronization.

### Completion Criteria

Spectators must be able to follow active matches and tournament information without refreshing the page.

---

## PHASE 10: Reliability, Testing & Security Validation

**Objective:** Verify that the complete application works reliably under normal and failure conditions.

### Tasks

**10.1 Functional Testing**

- [x] Test authentication.
- [x] Test role permissions.
- [x] Test tournament management.
- [x] Test team management.
- [x] Test player registration.
- [x] Test player allocation.
- [x] Test fixture management.
- [x] Test match clock.
- [x] Test match events.
- [x] Test Undo functionality.
- [x] Test match finalization.
- [x] Test standings calculations.
- [x] Test public dashboard.

**10.2 Security Testing**

- [x] Test unauthorized database access.
- [x] Test Manager data isolation.
- [x] Test Referee match restrictions.
- [x] Test public write restrictions.
- [x] Test role escalation attempts.
- [x] Test sensitive environment variable protection.
- [x] Verify critical database operations.

**10.3 Reliability Testing**

- [x] Test browser refresh during active matches.
- [x] Test temporary network disconnection.
- [x] Test reconnection.
- [x] Test duplicate event submissions.
- [x] Test duplicate allocation attempts.
- [x] Test concurrent allocation requests.
- [x] Test failed database operations.
- [x] Test recovery from interrupted operations.

**10.4 Performance Testing**

- [x] Evaluate Core Web Vitals.
- [x] Optimize database queries.
- [x] Optimize image assets.
- [x] Verify responsive performance.
- [x] Test real-time synchronization latency.
- [x] Check unnecessary component re-renders.

**10.5 Accessibility Testing**

- [x] Validate keyboard navigation.
- [x] Validate contrast ratios.
- [x] Validate touch target dimensions.
- [x] Validate form labels.
- [x] Validate loading and error announcements.

### Deliverables

- Tested application.
- Security validation results.
- Performance improvements.
- Fixed critical bugs.
- Release candidate.

### Completion Criteria

All critical tournament workflows must pass functional, security, and reliability testing. (20/20 automated end-to-end integration tests passing).

---

## PHASE 11: Production Deployment & Launch

**Objective:** Deploy the application and prepare it for actual tournament operations.

### Tasks

**11.1 Supabase Production Setup**

- [x] Configure production Supabase project.
- [x] Apply database migrations.
- [x] Configure production RLS policies.
- [x] Configure authentication settings.
- [x] Configure Realtime.
- [x] Configure Storage.
- [x] Verify production environment variables.

**11.2 Vercel Deployment**

- [x] Configure SPA rewrite rules (`vercel.json`).
- [x] Configure build settings.
- [x] Configure environment variables.
- [ ] Connect GitHub repository to Vercel (User-facing deployment step).
- [ ] Deploy production frontend.
- [ ] Configure production domain.
- [ ] Verify client-side routing.
- [ ] Test production authentication.

**11.3 Final Launch Validation**

- [ ] Verify all role-based dashboards.
- [ ] Verify player allocation.
- [ ] Verify fixture management.
- [ ] Verify live match operations.
- [ ] Verify public scoreboard.
- [ ] Verify standings.
- [ ] Verify mobile responsiveness.
- [ ] Verify database security.
- [ ] Perform a complete tournament workflow test.

### Deliverables

- Production frontend deployment.
- Production Supabase infrastructure.
- Verified application configuration.
- Launch-ready tournament platform.

### Completion Criteria

The platform must successfully support a complete tournament workflow in the production environment.

---

# 3. DEVELOPMENT PRIORITY

Development priorities are divided into three categories.

### P0 — Essential

Features required for the initial tournament to operate.

- Project setup.
- Design system.
- Database architecture.
- Authentication and RBAC.
- Tournament management.
- Team management.
- Player registration.
- Player allocation.
- Fixture management.
- Referee match controls.
- Match events and Undo.
- Standings and statistics.
- Public live scoreboard.
- Realtime synchronization.
- Production deployment.

### P1 — Important

Features required for a polished and reliable experience.

- Advanced player profiles.
- Detailed team statistics.
- Enhanced match event history.
- Improved error recovery.
- Offline event queue and synchronization.
- Performance optimization.
- Accessibility improvements.
- Advanced public match presentation.

### P2 — Future Enhancements

Features that may be considered after the initial tournament.

- Historical tournament archives.
- Multiple tournament management.
- Advanced tournament analytics.
- Enhanced player performance dashboards.
- Additional public engagement features.
- Extended tournament customization.

Future enhancements must not delay the delivery of essential tournament functionality.

---

# 4. IMPLEMENTATION ORDER & DEPENDENCIES

The following sequence represents the recommended implementation order.

| Order | Phase | Main Dependency |
|---:|---|---|
| 1 | Project Preparation | None |
| 2 | Design System & Foundation | Phase 0 |
| 3 | Database Architecture | Phase 0 |
| 4 | Authentication & RBAC | Phases 1, 2 |
| 5 | Tournament & Player Management | Phases 2, 3 |
| 6 | Player Allocation | Phase 5 |
| 7 | Fixture Management | Phases 4, 5 |
| 8 | Live Match Management | Phases 4, 7 |
| 9 | Standings & Statistics | Phases 7, 8 |
| 10 | Public Dashboard & Realtime | Phases 2, 8, 9 |
| 11 | Testing & Security | All functional phases |
| 12 | Production Deployment | Phase 11 |

Some phases may be developed in parallel when their dependencies are satisfied.

---

# 5. DEVELOPMENT WORKFLOW

Every development phase shall follow this workflow:

### Step 1: Review

- Read the relevant project documentation.
- Understand the feature requirements.
- Identify dependencies.
- Identify affected database tables and components.

### Step 2: Plan

- Break the phase into small implementation tasks.
- Identify reusable components.
- Define required database operations.
- Identify security implications.

### Step 3: Implement

- Develop the feature incrementally.
- Follow the approved architecture.
- Maintain readable JavaScript.
- Reuse existing components where appropriate.
- Avoid unnecessary modifications to unrelated features.

### Step 4: Validate

- Test the feature independently.
- Test relevant user permissions.
- Test database persistence.
- Test responsive layouts.
- Test failure scenarios.

### Step 5: Integrate

- Verify integration with existing features.
- Check for regressions.
- Validate shared data consistency.
- Confirm that related interfaces update correctly.

### Step 6: Complete

A phase can only be marked complete when:

- All planned tasks are implemented.
- Acceptance criteria are satisfied.
- Critical bugs are resolved.
- Relevant security checks pass.
- Documentation is updated.

---

# 6. AI CODING AGENT INSTRUCTIONS

AI coding agents working on this repository must follow these instructions.

1. Read the existing project documentation before implementing features.
2. Follow `ARCHITECTURE.md` and `DESIGN_SYSTEM.md`.
3. Follow the database schema and business rules defined in `DATABASE.md` and `REQUIREMENTS.md`.
4. Implement only the tasks belonging to the current development phase unless explicitly instructed otherwise.
5. Never invent tournament rules or modify confirmed business logic.
6. Never introduce TypeScript.
7. Never introduce a separate custom backend server.
8. Never expose Supabase service role credentials in frontend code.
9. Never rely exclusively on frontend validation for critical business operations.
10. Preserve existing working functionality when modifying components.
11. Avoid unnecessary abstractions, oversized components, and duplicated logic.
12. Test each completed feature before moving to dependent features.
13. Update relevant documentation when implementation decisions change.
14. Report completed tasks, unresolved issues, and remaining dependencies honestly.

**Development must proceed incrementally. Completing more code is not the same as completing more functionality.**

---

# 7. PROJECT COMPLETION DEFINITION

The Institute Football League Platform will be considered ready for its initial production tournament when:

- All required user roles function correctly.
- The Super Admin can configure and manage the tournament.
- All registered players can be allocated according to tournament rules.
- Teams and Managers can access their permitted information.
- Fixtures can be created and managed.
- Referees can operate live matches.
- Match events and corrections are persisted accurately.
- Official standings and player statistics are calculated correctly.
- Public visitors can follow matches and tournament information.
- Realtime synchronization works reliably.
- Database security and authorization have been validated.
- The production application is deployed and tested.

**End of Development Roadmap.**