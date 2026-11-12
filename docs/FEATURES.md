# FEATURES
**Institute Football League Platform**

## 1. OVERVIEW

This document defines the functional features and capabilities of the Institute Football League Platform.

The platform is designed to manage the complete lifecycle of an institute-level football tournament, from tournament initialization and player allocation to match management, live score updates, standings, and final results.

It provides four distinct user experiences:

1. **Public:** Fans and players can follow the tournament, teams, fixtures, live matches, and statistics.
2. **Super Admin:** Organizers can configure and manage tournaments, teams, players, allocations, and fixtures.
3. **Referee:** Match officials can control match clocks, record events, and finalize match results.
4. **Manager:** Team managers can monitor their assigned squads, player statistics, fixtures, and team performance.

The platform must maintain a centralized data source, consistent tournament logic, secure role-based permissions, and real-time synchronization across all interfaces.

---

# 2. PUBLIC FEATURES
**Fans & Players**

The public interface is designed around a premium sports broadcasting experience using the Graphite Dark Theme.

No authentication should be required to access publicly available tournament information.

## 2.1 Tournament Homepage

The homepage serves as the central information hub for the tournament.

Features:

- **Tournament Overview:** Display tournament name, logo, current status, and relevant tournament information.
- **Live Match Highlight:** Prominently display currently active matches with live scores and match clocks.
- **Today's Matches:** Show scheduled matches for the current day.
- **Recent Results:** Display recently completed matches and their scores.
- **Upcoming Fixtures:** Highlight upcoming matches.
- **Current Standings:** Display a compact version of the tournament points table.
- **Top Performers:** Highlight leading goalscorers and other player statistics.
- **Tournament Progress:** Display the current tournament stage and matchday.

## 2.2 Live Match Center

A dedicated experience for following matches in real time.

### Live Scoreboard
- Display both participating teams, logos, and current scores.
- Automatically synchronize score changes through Supabase Realtime.
- Clearly indicate the current match status.

### Match Clock
- Display the current match minute and elapsed time.
- Synchronize with the official match clock controlled by the referee.
- Display appropriate match states such as First Half, Half-Time, Second Half, and Full-Time.
- Display additional time when recorded.

### Live Match Timeline
Display match events chronologically.

Supported events:

- Goals.
- Yellow Cards.
- Red Cards.
- Match start.
- Half-time.
- Second-half start.
- Full-time.

Each event should display:
- Player name.
- Team.
- Event type.
- Match minute.

### Match Details
- Participating team information.
- Current score.
- Match status.
- Complete event timeline.
- Final result after completion.

## 2.3 Fixtures & Results

A centralized section for tournament scheduling and historical match information.

Features:

- **Today's Matches:** Matches scheduled for the current date.
- **Upcoming Fixtures:** All future scheduled matches.
- **Matchday Filtering:** Filter matches by matchday.
- **Stage Filtering:** Filter by tournament stage, where applicable.
- **Match Status Filtering:** Scheduled, Live, and Completed.
- **Match Results:** Display completed matches with final scores.
- **Match Details:** Open individual matches to view their complete information and event timelines.

## 2.4 Tournament Standings

An automatically calculated league table.

Display:

| Statistic | Description |
|---|---|
| MP | Matches Played |
| W | Wins |
| D | Draws |
| L | Losses |
| GF | Goals For |
| GA | Goals Against |
| GD | Goal Difference |
| PTS | Total Points |

Calculation rules:

- Win: 3 points.
- Draw: 1 point.
- Loss: 0 points.
- Goal Difference = Goals For - Goals Against.
- Points are calculated automatically from completed matches.
- Standings must update whenever an authorized match result is finalized or corrected.

The standings should follow the tournament's configured tie-breaking rules.

## 2.5 Team Profiles

Each participating team receives a dedicated public profile.

Features:

- Team name and logo.
- Team identity and colors.
- Complete assigned squad.
- Goalkeeper and outfield player information.
- Upcoming fixtures.
- Previous match results.
- Recent form (W-D-L).
- Team performance statistics.

## 2.6 Player Profiles & Leaderboards

Provide individual player information and tournament statistics.

### Player Information
- Player name.
- Assigned team.
- Player category (Goalkeeper or Outfield Player).
- Individual tournament statistics.

### Leaderboards
- Top Goalscorers.
- Most Yellow Cards.
- Most Red Cards.

Leaderboards must update automatically based on recorded match events.

---

# 3. SUPER ADMIN FEATURES
**Tournament Organizer**

The Super Admin has complete administrative control over tournament configuration and execution.

The management interface uses the Soft Grey Light Dashboard Theme.

## 3.1 Admin Dashboard

A centralized overview of tournament operations.

Display:

- Total participating teams.
- Total registered players.
- Total allocated players.
- Unassigned players.
- Total scheduled matches.
- Completed matches.
- Live matches.
- Upcoming matches.
- Tournament progress.
- Recent administrative activity.

The dashboard should provide quick access to the most frequently used management operations.

## 3.2 Tournament Management

Allow the Super Admin to initialize and manage tournament information.

Features:

- Create a new tournament.
- Configure tournament name and basic information.
- Set tournament dates.
- Configure participating team count.
- Manage tournament status.
- View tournament history.
- Archive completed tournaments.

Tournament statuses:

- Draft.
- Upcoming.
- Active.
- Completed.
- Archived.

Only one tournament should be active at a time unless multi-tournament operation is explicitly introduced later.

## 3.3 Team Management

Manage all participating teams.

Features:

- Create teams.
- Edit team information.
- Assign team names and logos.
- Configure team colors.
- Generate and assign Manager accounts.
- View each team's allocated squad.
- View team statistics.
- Activate or deactivate teams where necessary.

Each team must have its own identifiable roster and assigned manager.

## 3.4 Player Pool Management

Centralized management of all registered tournament players.

### Player Registration

Players can be added through:

- Manual registration.
- Bulk upload.

### Player Information

Each player should contain:

- Full name.
- Player category.
- Optional profile image.
- Registration information.
- Allocation status.

### Player Categories

Players must be categorized into exactly two categories:

1. Goalkeeper (GK).
2. Outfield Player.

### Player Management Operations

- Add players.
- Edit player information.
- Remove players before allocation.
- Search and filter players.
- Filter by player category.
- View allocated and unassigned players.
- Prevent duplicate player registration where possible.

Player category must determine which allocation draft the player participates in.

## 3.5 Player Allocation Draft System

A dedicated digital spin-wheel system for randomly distributing registered players among participating teams.

The allocation process is divided into two independent draft modes.

### A. Goalkeeper Draft

- A dedicated spin wheel exclusively for registered goalkeepers.
- Display all eligible goalkeepers.
- Randomly select a goalkeeper during each spin.
- Allocate the selected goalkeeper to a team.
- Display allocation results immediately.
- Prevent an already allocated goalkeeper from being selected again.

**Special Goalkeeper Rules:**

- The tournament data is expected to contain a maximum of three goalkeepers.
- Each team should receive exactly one goalkeeper when three goalkeepers and three teams are available.
- If fewer goalkeepers are registered than teams, the remaining teams will have no assigned goalkeeper.
- Goalkeepers must never be included in the outfield player draft.

### B. Outfield Player Draft

- A separate spin wheel exclusively for registered outfield players.
- Display eligible outfield players.
- Randomly select one player per spin.
- Allocate the selected player to a team.
- Remove allocated players from subsequent selections.
- Display updated allocation results immediately.

### C. Team Allocation Logic

- Player allocation must follow the configured team distribution rules.
- Each team should receive a fair and balanced number of outfield players.
- Teams must not receive duplicate player assignments.
- Already allocated players must not participate in another spin.
- The system must maintain a complete allocation history.

### D. Draft Board

A centralized visual overview of the allocation process.

Display:

- All participating teams.
- Assigned goalkeepers.
- Assigned outfield players.
- Total allocated players per team.
- Remaining unassigned players.
- Draft progress.

### E. Draft Controls

- Start draft.
- Spin wheel.
- View allocation results.
- Undo the most recent allocation when permitted.
- Manually correct an allocation.
- Complete and lock the draft.

Allocation changes after draft completion must require administrative authorization.

## 3.6 Fixture Management

Create and manage all tournament matches.

Features:

- Create individual fixtures.
- Select participating teams.
- Assign match dates.
- Assign kickoff times.
- Assign matchday or tournament stage.
- Edit scheduled fixtures.
- Cancel or reschedule matches.
- View fixture history.

### Match Status Management

Each match follows a controlled lifecycle:

- Scheduled.
- Live.
- Completed.
- Postponed.
- Cancelled.

The system must prevent invalid match transitions and conflicting live match operations.

## 3.7 Match Administration & Overrides

Provide administrative tools for correcting match information.

Features:

- Manually correct match scores.
- Correct incorrectly assigned goals.
- Correct yellow and red card records.
- Remove incorrect match events.
- Correct player attribution.
- Modify match status when necessary.
- Recalculate tournament standings after corrections.

All administrative corrections should be recorded in an audit history, including the action performed and its timestamp.

## 3.8 Tournament Archiving & Reset

Allow the Super Admin to close a completed tournament and prepare the platform for future events.

Features:

- Archive tournament information.
- Preserve historical teams, players, fixtures, results, and statistics.
- View previous tournament records.
- Initialize a new tournament.
- Reset active tournament configuration without destroying historical data.

A global reset must never silently delete archived tournament information.

---

# 4. REFEREE FEATURES
**Match Official**

The Referee interface is designed primarily for mobile devices.

It uses the Soft Grey Light Dashboard Theme, with large touch targets, minimal navigation, and quick-access match controls.

## 4.1 Referee Dashboard

Display:

- Today's scheduled matches.
- Upcoming assigned matches, if referee assignment is implemented.
- Currently active match.
- Recently completed matches.
- Quick access to match control.

## 4.2 Match Selection

- View available matches.
- Select a scheduled match.
- View participating teams.
- View team rosters.
- Verify match information before kickoff.
- Initiate the selected match.

A match must not be started if it is cancelled, already completed, or otherwise in an invalid state.

## 4.3 Match Clock Control

The referee controls the official match clock.

### Clock Operations

- Start First Half.
- Pause Clock.
- Resume Clock.
- End First Half.
- Start Second Half.
- End Match (Full-Time).

### Clock Requirements

- Display elapsed match time.
- Synchronize match time with the public interface.
- Maintain accurate elapsed time when paused and resumed.
- Preserve clock state during page refreshes or temporary disconnections.
- Prevent unauthorized or conflicting clock operations.

The clock should be based on stored timestamps and elapsed-time calculations rather than relying exclusively on a continuously running browser timer.

## 4.4 Real-Time Match Event Logging

The referee can record match events through a simple action-based interface.

### Goal Recording

Workflow:

1. Tap Goal.
2. Select the scoring team.
3. Select the player.
4. Confirm the event.
5. Save the goal and update the scoreboard.

The system must immediately update:

- Match score.
- Live match timeline.
- Player goal statistics.
- Public scoreboard.

### Yellow Card Recording

Workflow:

1. Tap Yellow Card.
2. Select the player.
3. Confirm the event.

### Red Card Recording

Workflow:

1. Tap Red Card.
2. Select the player.
3. Confirm the event.

All events must be associated with the correct match, team, player, and match minute.

## 4.5 Undo & Event Correction

A quick-undo mechanism is essential for preventing incorrect match records.

Features:

- Undo the most recent event.
- Correct an incorrectly selected player.
- Correct the assigned team.
- Remove an incorrectly recorded event.
- Update the scoreboard and statistics automatically after corrections.

Corrections must also update the public match timeline.

## 4.6 Match Sign-Off

After the match ends:

- Record the Full-Time status.
- Display the final score.
- Preserve the complete event timeline.
- Finalize the match result.
- Automatically update tournament standings.
- Update player and team statistics.
- Lock normal match editing.

Once finalized, further changes must require an authorized administrative correction.

---

# 5. MANAGER FEATURES
**Team Leaders**

The Manager interface provides a read-only analytical view of their assigned team.

Managers cannot modify tournament information, player allocations, match scores, or official match events.

The interface uses the Soft Grey Light Dashboard Theme.

## 5.1 Manager Dashboard

Display:

- Assigned team information.
- Total squad members.
- Goalkeeper information.
- Outfield player count.
- Upcoming matches.
- Recent results.
- Current team standings.
- Recent team performance.

## 5.2 Squad Management View

Managers can view their complete assigned squad.

Features:

- View player names and profile information.
- View player categories.
- Identify the assigned goalkeeper.
- View individual player statistics.
- Search and filter squad members.

Managers cannot add, remove, or reassign players.

## 5.3 Player Statistics

Display individual performance statistics for players belonging to their team.

Statistics include:

- Goals scored.
- Yellow cards.
- Red cards.
- Match participation, where supported.

## 5.4 Team Fixtures & Results

- View upcoming team fixtures.
- View completed matches.
- View previous match scores.
- Open individual match details.
- View recorded match events.

## 5.5 Team Performance & Form

Display the team's recent performance.

Features:

- Recent form (W-D-L).
- Matches played.
- Wins, draws, and losses.
- Goals scored.
- Goals conceded.
- Goal difference.
- Current tournament points.
- Current league position.

All information is calculated from official match records.

---

# 6. CORE SYSTEM FEATURES

These capabilities support the functionality, security, reliability, and performance of the entire platform.

## 6.1 Authentication & Role-Based Access Control

Implement secure authentication and role-based authorization.

Supported roles:

- Super Admin.
- Referee.
- Manager.
- Public (Unauthenticated).

### Permission Principles

| Capability | Super Admin | Referee | Manager | Public |
|---|---|---|---|---|
| View public information | Yes | Yes | Yes | Yes |
| Manage tournament | Yes | No | No | No |
| Manage teams | Yes | No | No | No |
| Manage players | Yes | No | No | No |
| Allocate players | Yes | No | No | No |
| Manage fixtures | Yes | No | No | No |
| Control match clock | No | Yes | No | No |
| Record match events | Override only | Yes | No | No |
| Finalize match | Override only | Yes | No | No |
| View assigned squad | Yes | As needed | Yes | Yes |
| View statistics | Yes | Yes | Yes | Yes |
| Correct official records | Yes | Limited undo | No | No |

Authorization must be enforced on the backend through Supabase Row Level Security (RLS), not merely by hiding frontend buttons.

## 6.2 Real-Time Synchronization

Powered by Supabase Realtime.

The system must synchronize relevant data across connected interfaces.

Examples:

- Referee records a goal → Public scoreboard updates.
- Referee records a card → Public timeline updates.
- Match clock changes → Public match clock synchronizes.
- Match finalized → Standings and statistics update.
- Player allocation completed → Admin draft board reflects the updated roster.

The interface should update without requiring manual page refreshes.

## 6.3 Centralized Tournament Calculations

All tournament statistics must be calculated consistently from authoritative match and player records.

Supported calculations:

- League points.
- Matches played.
- Wins, draws, and losses.
- Goals for and against.
- Goal difference.
- Player goals.
- Yellow and red card totals.
- Team form.
- League positions.
- Player leaderboards.

Avoid maintaining independently editable copies of calculated statistics.

Corrections to official match events must propagate to all dependent calculations.

## 6.4 Data Integrity & Validation

The platform must enforce essential tournament rules.

Examples:

- A player cannot belong to multiple teams within the same tournament.
- A player cannot be allocated through the wrong draft category.
- A goal must reference a valid player and participating team.
- A match cannot contain invalid duplicate team assignments.
- A completed match cannot be modified through normal referee operations.
- An archived tournament must preserve its historical records.
- Invalid role permissions must be rejected at the database level.

## 6.5 Audit History

Maintain a record of important administrative and match-related operations.

Track:

- Tournament creation and updates.
- Team changes.
- Player registration and allocation.
- Draft corrections.
- Fixture changes.
- Match event corrections.
- Score overrides.
- Match finalization.
- Tournament archiving.

Each audit record should contain the action, responsible user, timestamp, and relevant affected record.

## 6.6 Hybrid UI/UX System

The platform follows a consistent hybrid design system.

### Public Interface
- Graphite Dark Theme.
- Premium sports broadcasting aesthetic.
- Strong visual hierarchy.
- High-contrast scoreboards.
- Dynamic match information.

### Management Interface
- Soft Grey Light Theme.
- Clean administrative dashboard.
- Consistent cards, tables, forms, and navigation.
- Accessible typography and controls.
- Responsive layouts.

The interface must adapt to desktop, tablet, and mobile devices.

## 6.7 Responsive Design

Provide optimized layouts for different screen sizes.

- Desktop: Full navigation and dashboard layouts.
- Tablet: Adaptive navigation and content layouts.
- Mobile: Compact navigation and touch-friendly controls.

The referee interface receives particular attention because match operations must remain fast and reliable on mobile devices.

## 6.8 Progressive Web App (PWA)

**Optional but recommended.**

Provide PWA capabilities, particularly for referee operations.

Potential capabilities:

- Install the application on supported devices.
- App-like full-screen experience.
- Application icon and splash screen.
- Basic application-shell caching.
- Improved loading experience.

Offline match-event recording and automatic synchronization should only be introduced if a reliable conflict-resolution and data-recovery mechanism is implemented.

---

# 7. SYSTEM-WIDE FUNCTIONAL REQUIREMENTS

The following principles apply across all user roles and platform modules.

### Accuracy
Official match scores, events, and standings must remain consistent across the platform.

### Security
Users must only access operations authorized for their assigned roles.

### Reliability
Important operations must not silently fail or produce duplicate records.

### Responsiveness
Match controls and frequently accessed information must remain usable on mobile devices.

### Data Preservation
Historical tournament information must survive future tournament initialization and resets.

### Reusability
The platform must support future tournaments without requiring the application to be rebuilt or its database manually cleared.

### Maintainability
Features should be organized into clear, independent modules to make future enhancements and debugging easier.

---

# 8. FEATURES OUTSIDE THE INITIAL SCOPE

The following capabilities are not part of the initial platform scope unless explicitly approved later:

- Player bidding or auction system.
- Team auction budgets.
- Financial transactions and payments.
- Public player registration.
- Manager-controlled player transfers.
- Spectator accounts and social interactions.
- Video streaming or live match broadcasting.
- Automated referee decision-making.
- Offline event synchronization without a dedicated conflict-resolution system.

These features may be considered for future versions without complicating the initial implementation.

---

# 9. FEATURE DEVELOPMENT PRIORITY

Development should follow a dependency-based sequence.

| Priority | Modules |
|---|---|
| Phase 1 | Authentication, RBAC, Tournament Setup, Team Management |
| Phase 2 | Player Pool, Player Categories, Allocation Draft |
| Phase 3 | Fixture Management, Match Clock, Event Logging |
| Phase 4 | Live Scoreboard, Match Timeline, Standings, Statistics |
| Phase 5 | Public Pages, Team Profiles, Manager Dashboard |
| Phase 6 | Audit History, Administrative Overrides, Tournament Archiving |
| Phase 7 | PWA, Performance Optimization, Final Testing |

The sequence is intended to establish the underlying data and business logic before building the interfaces that depend on them.

---

**END OF FEATURES DOCUMENT**