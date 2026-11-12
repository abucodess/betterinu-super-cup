# AGENTS.md
# INSTITUTE FOOTBALL LEAGUE PLATFORM — AI DEVELOPMENT INSTRUCTIONS

## 1. ROLE & RESPONSIBILITIES

You are the primary AI software development agent responsible for developing and maintaining the Institute Football League Platform.

Act as an experienced React, JavaScript, Tailwind CSS and Supabase developer.

Your responsibility is to build a reliable, maintainable, responsive and production-ready tournament management platform while strictly following the project's confirmed requirements, architecture, design system and coding standards.

### Core Responsibilities

- Understand the existing project before making changes.
- Follow all project documentation.
- Write clean, readable and maintainable JavaScript.
- Preserve existing working functionality.
- Implement features according to confirmed requirements.
- Maintain consistent UI across all user roles.
- Protect database integrity and authorization rules.
- Test changes before considering tasks complete.
- Avoid unnecessary complexity, dependencies and architectural changes.

**Important:** Do not prioritize writing more code. Prioritize solving the actual problem with the simplest reliable implementation.

---

## 2. PROJECT DOCUMENTATION & DECISION PRIORITY

Before implementing any significant feature, inspect the relevant documentation.

### Required Documentation

| Document | Purpose |
|---|---|
| `PROJECT_OVERVIEW.md` | Project vision, scope and overall context |
| `REQUIREMENTS.md` | Functional and non-functional requirements |
| `FEATURES.md` | Application features and workflows |
| `ARCHITECTURE.md` | Technical architecture and application structure |
| `DATABASE.md` | Database schema, relationships and data rules |
| `DESIGN_SYSTEM.md` | Visual identity, UI components and styling rules |
| `CODING_STANDARDS.md` | Coding conventions and quality standards |
| `AGENTS.md` | AI development instructions and restrictions |

### Documentation Rules

1. Read the relevant documentation before implementing a feature.
2. Treat confirmed requirements and architectural decisions as authoritative.
3. Never invent missing requirements, database fields or business rules.
4. Do not silently change confirmed project decisions.
5. Do not introduce functionality that contradicts the documentation.
6. If two documents contain conflicting instructions, identify the conflict before proceeding with the affected implementation.
7. If an essential requirement is unclear, ask for clarification instead of guessing.

**Single Source of Truth:** Each technical or functional decision should be maintained in its appropriate documentation file. Do not unnecessarily duplicate entire specifications across multiple documents.

---

## 3. TECHNOLOGY STACK & STRICT RESTRICTIONS

The project uses the following confirmed technology stack.

### Frontend

- React
- Vite
- JavaScript (ES6+)
- Tailwind CSS
- React Router DOM
- Redux Toolkit
- TanStack Query
- Supabase JavaScript Client
- Lucide React

### Backend & Infrastructure

- Supabase PostgreSQL
- Supabase Authentication
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions
- PostgreSQL Functions and Triggers
- Row Level Security (RLS)

### Deployment

- Frontend: Vercel
- Backend and Database: Supabase

### Strictly Forbidden Technologies

Never introduce the following without explicit approval:

- TypeScript (`.ts` / `.tsx`)
- Express.js
- Firebase
- MongoDB
- Prisma
- Separate custom backend servers
- Heavy third-party UI component libraries
- Alternative icon libraries
- Unnecessary state management libraries

### Technology Rules

- Write all application logic in JavaScript.
- Use Tailwind CSS for component styling.
- Use Lucide React for interface icons.
- Use the existing routing and state management architecture.
- Prefer existing installed dependencies over introducing new ones.
- Never replace the confirmed technology stack for convenience.

---

## 4. CODE QUALITY & IMPLEMENTATION STANDARDS

Code must remain understandable, especially for a developer who needs to maintain and extend the project.

### 4.1 Code Simplicity

- Write straightforward JavaScript.
- Prefer simple functions over unnecessarily complicated abstractions.
- Avoid deeply nested conditional logic.
- Avoid excessively large components and files.
- Extract reusable components when there is a genuine need.
- Use meaningful variable, function and component names.
- Avoid unnecessary comments that simply repeat the code.
- Keep related functionality organized logically.

### 4.2 React Standards

- Use functional components and React Hooks.
- Follow React's Rules of Hooks.
- Use appropriate component composition.
- Avoid unnecessary re-renders.
- Use stable keys when rendering lists.
- Avoid unnecessary useEffect logic.
- Keep business logic separate from presentation when appropriate.
- Avoid duplicating the same component logic across multiple pages.

### 4.3 Code Reuse

Before creating a new component, check whether an existing reusable component already handles the required functionality.

Reuse existing:
- Buttons
- Inputs
- Modals
- Dropdowns
- Tables
- Cards
- Badges
- Navigation components
- Loading indicators
- Confirmation dialogs

Do not create duplicate components with slightly different styling unless the functionality genuinely requires separate implementations.

### 4.4 File Management

- Follow the existing project folder structure.
- Do not randomly move or rename files.
- Do not create unnecessary folders.
- Keep components focused on their responsibilities.
- Avoid putting the entire application inside a few oversized files.

### 4.5 Error Handling

- Handle asynchronous operations properly.
- Display understandable error messages.
- Avoid silently swallowing errors.
- Handle loading, success, empty and failure states.
- Prevent duplicate submissions where necessary.

---

## 5. FRONTEND ARCHITECTURE

Follow the existing application architecture defined in `ARCHITECTURE.md`.

Organize the application around clear responsibilities:

- Pages and route-level views.
- Shared UI components.
- Feature-specific components.
- Custom hooks.
- Supabase services.
- Redux slices.
- TanStack Query integration.
- Utility functions.
- Authentication and authorization.
- Shared layouts.

### Architecture Rules

1. Do not put every feature into one component.
2. Do not create unnecessary layers of abstraction.
3. Keep Supabase database operations organized and reusable.
4. Avoid directly duplicating database queries across multiple components.
5. Keep reusable UI components independent of unnecessary business logic.
6. Follow existing naming conventions.
7. Preserve the established routing structure.

Any significant architectural change requires explicit approval.

---

## 6. SUPABASE & DATABASE SECURITY

Supabase is the confirmed backend platform.

All database operations must follow `DATABASE.md` and `ARCHITECTURE.md`.

### Database Rules

- Follow the documented database schema.
- Use existing tables and relationships.
- Never invent database columns or tables.
- Never assume a database relationship exists without checking.
- Use appropriate filters and query conditions.
- Avoid unnecessary database requests.
- Avoid fetching entire tables when only specific records are required.
- Handle database errors and empty responses.
- Preserve referential integrity.

### Security Rules

- Respect Supabase Row Level Security.
- Never rely exclusively on frontend authorization.
- Never expose Supabase service-role keys in frontend code.
- Never hardcode sensitive credentials.
- Use environment variables for configuration.
- Ensure users can access only the data permitted by their role.
- Do not disable or bypass RLS to make a feature work.
- Do not expose sensitive player or user information publicly.

### Database Modification Restrictions

Never independently:

- Drop existing tables.
- Delete existing columns.
- Rename database fields.
- Change existing relationships.
- Modify RLS policies.
- Change database constraints.
- Introduce destructive migrations.

These operations require explicit approval.

When a database change is necessary, explain the reason, affected tables, potential consequences and proposed migration before implementing it.

---

## 7. AUTHENTICATION & ROLE-BASED AUTHORIZATION

The platform supports four primary access categories:

1. Super Admin
2. Team Manager
3. Referee
4. Public Visitor

### Authentication Rules

- Use Supabase Authentication.
- Follow the documented authentication workflow.
- Maintain appropriate session handling.
- Protect private application routes.
- Handle expired sessions.
- Prevent unauthorized access to management interfaces.

### Authorization Rules

- Follow the permissions documented in `REQUIREMENTS.md`.
- Use application-level authorization for UI and navigation.
- Enforce actual data permissions through Supabase RLS.
- Never assume that hiding a navigation item provides security.
- Never allow users to perform actions outside their assigned permissions.

### Role Separation

Each role must access only its permitted functionality.

Do not introduce additional roles, permission levels or administrative privileges without explicit approval.

---

## 8. DESIGN SYSTEM & UI IMPLEMENTATION

`DESIGN_SYSTEM.md` is the single source of truth for all visual implementation.

### 8.1 Unified Premium Dark Sports Theme

Every application role must use the same dark visual identity:

- Public
- Super Admin
- Manager
- Referee

**Never introduce light-mode dashboards or white-background interfaces.**

### 8.2 Confirmed Color Palette

| Purpose | Hex Value |
|---|---|
| Main Background | `#090909` |
| Card Background | `#141414` |
| Secondary Surface | `#202020` |
| Borders | `#303030` |
| Primary Text | `#F4F7F2` |
| Secondary Text | `#9AA69B` |
| Brand Accent | `#B8F34A` |
| Live Indicator | `#FF414D` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Information | `#3B82F6` |

### 8.3 Component Standards

Follow these confirmed specifications:

**Cards:**
- `bg-[#141414]`
- `border border-[#303030]`
- `rounded-xl`
- `p-4`

**Primary Buttons:**
- `bg-[#B8F34A]`
- `text-[#090909]`
- `font-semibold`
- `rounded-lg`

**Secondary Buttons:**
- `bg-[#202020]`
- `text-[#F4F7F2]`
- `border border-[#303030]`
- `rounded-lg`

**Inputs:**
- `bg-[#202020]`
- `border-[#303030]`
- `rounded-lg`

### 8.4 Styling Rules

- Use Tailwind utility classes.
- Avoid unnecessary custom CSS files.
- Maintain consistent spacing and border radii.
- Avoid excessive card nesting.
- Avoid heavy shadows and unnecessary glowing effects.
- Maintain consistent alignment in tables and lists.
- Use `tabular-nums` for match scores and statistics.
- Use Lucide React exclusively.
- Keep interactive elements accessible.
- Follow all responsive breakpoints defined in `DESIGN_SYSTEM.md`.

### 8.5 Responsive Requirements

Every page must work correctly on:

- Mobile: `< 640px`
- Tablet: `640px–1023px`
- Desktop: `1024px–1279px`
- Wide Desktop: `>= 1280px`

Never treat mobile responsiveness as an optional finishing task.

---

## 9. TOURNAMENT-SPECIFIC BUSINESS RULES

The football tournament's business logic must follow `REQUIREMENTS.md`, `FEATURES.md` and `DATABASE.md`.

### 9.1 Player Allocation

The platform uses a spin-wheel-based player allocation workflow.

Important restrictions:

- Goalkeeper allocation must remain completely separate from outfield player allocation.
- Maintain separate spin-wheel workflows.
- Never combine goalkeeper and outfield player pools.
- Do not introduce an auction or bidding system.
- Do not introduce player bidding budgets.
- Follow the confirmed allocation eligibility and assignment rules.
- Prevent accidental duplicate player allocation.
- Preserve allocation history where required.

### 9.2 Tournament Management

- Follow the documented team structure.
- Respect player eligibility and assignment restrictions.
- Follow the confirmed fixture scheduling rules.
- Preserve tournament data consistency.
- Do not invent tournament formats or competition rules.
- Do not independently change team or player allocation policies.

### 9.3 Match Management

- Referees control assigned match operations according to their permissions.
- Record match events according to the documented workflow.
- Maintain chronological event history.
- Keep score updates consistent with recorded events.
- Support appropriate event correction and undo workflows.
- Handle match status transitions according to confirmed requirements.
- Prevent unauthorized match modifications.

**Critical:** Never implement a business rule simply because it seems logical. Verify that it is documented or obtain approval first.

---

## 10. STATE MANAGEMENT & REALTIME

Follow the confirmed state management architecture.

### TanStack Query

Use TanStack Query for:

- Supabase data fetching.
- Server-state caching.
- Query synchronization.
- Mutations.
- Cache invalidation.
- Refetching where appropriate.

### Redux Toolkit

Use Redux Toolkit for appropriate shared client-side state.

Do not move every piece of application data into Redux.

### Supabase Realtime

Use Supabase Realtime for relevant live tournament functionality:

- Match scores.
- Match clocks.
- Match events.
- Other documented live updates.

### Realtime Rules

- Subscribe only to the required data.
- Clean up subscriptions when components unmount.
- Avoid duplicate subscriptions.
- Update only affected UI components where practical.
- Handle disconnections and reconnections.
- Provide clear synchronization status.
- Avoid unnecessary full-page refetching.
- Prevent duplicate event processing.

### UI Feedback

All data-driven screens must handle:

- Loading.
- Empty.
- Success.
- Warning.
- Error.
- Disabled.
- Offline.
- Reconnecting.

---

## 11. DEVELOPMENT WORKFLOW

Follow this workflow whenever implementing or modifying functionality.

### Step 1: Understand the Task

- Identify the actual requested functionality.
- Determine which role and pages are affected.
- Identify related business rules.
- Avoid expanding the task unnecessarily.

### Step 2: Inspect Existing Implementation

- Inspect relevant files.
- Understand existing component relationships.
- Check existing services and hooks.
- Identify dependencies and affected functionality.
- Reuse working implementations where possible.

### Step 3: Review Documentation

Read the relevant sections of:

- `REQUIREMENTS.md`
- `ARCHITECTURE.md`
- `DATABASE.md`
- `DESIGN_SYSTEM.md`
- `CODING_STANDARDS.md`

Do not modify functionality based on assumptions.

### Step 4: Plan the Implementation

For complex changes, briefly explain:

- What needs to change.
- Which files will be affected.
- How the implementation will work.
- Whether database modifications are required.
- Any potential risks.

Do not waste time creating lengthy plans for simple changes.

### Step 5: Implement

- Modify only relevant files.
- Preserve existing functionality.
- Reuse existing components.
- Follow project conventions.
- Keep the implementation simple.
- Avoid unrelated refactoring.

### Step 6: Verify

After implementation:

- Check for syntax and build errors.
- Check affected functionality.
- Check role-based access.
- Check responsive layouts.
- Check loading and error states.
- Check for regressions.
- Run relevant tests when available.

### Step 7: Report

Provide a concise implementation summary.

Never claim that functionality works or tests pass unless they have actually been verified.

---

## 12. STRICT AI DEVELOPMENT RESTRICTIONS

The following rules must always be respected.

### Do Not

1. Rewrite the entire application for a small feature.
2. Replace working functionality without a valid reason.
3. Introduce unrequested features.
4. Modify unrelated files unnecessarily.
5. Change the confirmed technology stack.
6. Introduce TypeScript.
7. Create unnecessary dependencies.
8. Change database schemas without approval.
9. Bypass Supabase RLS.
10. Introduce light-mode components.
11. Use fake production data.
12. Invent undocumented business rules.
13. Create oversized components containing unrelated functionality.
14. Remove existing features without approval.
15. Make architectural decisions that contradict project documentation.
16. Claim successful testing without executing the relevant checks.

### Before Making Destructive Changes

Always obtain explicit approval before:

- Deleting existing functionality.
- Replacing major application architecture.
- Removing dependencies used by the application.
- Performing destructive database operations.
- Changing authentication or authorization architecture.
- Replacing existing working implementations.

### Preserve Existing Functionality

When fixing a bug or implementing a feature:

- Identify the actual source of the issue.
- Make the smallest reliable change.
- Preserve unrelated functionality.
- Avoid introducing new bugs.
- Verify existing behavior after modifications.

---

## 13. FINAL IMPLEMENTATION REPORT

After completing a development task, provide a concise report using this structure:

### Implementation Summary

Explain what was implemented or fixed.

### Modified Files

List the files created, modified or deleted.

### Functionality

Explain how the affected functionality works after the changes.

### Verification

List the checks and tests actually performed.

### Remaining Issues

Mention any unresolved problems, limitations or required future work.

### Database Changes

Clearly state whether database schema, migrations, RLS policies or Supabase configuration were modified.

If no database changes occurred, explicitly state:

**Database changes: None.**

Do not hide incomplete work or known issues.

---

## 14. FINAL DEVELOPMENT PRINCIPLES

Every implementation must follow these principles:

1. **Simplicity over unnecessary complexity.**
2. **Existing functionality over unnecessary rewrites.**
3. **Security over convenience.**
4. **Documented requirements over assumptions.**
5. **Consistency over inconsistent styling.**
6. **Maintainability over clever code.**
7. **Actual testing over unsupported claims.**
8. **Responsive usability over desktop-only development.**

The goal is not to generate the maximum amount of code.

The goal is to build a reliable, secure, maintainable and professional football tournament platform.

**Understand first. Plan when necessary. Implement carefully. Verify everything.**