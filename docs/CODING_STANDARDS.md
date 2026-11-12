# Institute Football League Platform

# CODING_STANDARDS.md

> **Document status:** Initial coding standards baseline\
> **Purpose:** Keep the codebase consistent, readable, secure, and
> maintainable.\
> **Applies to:** The React + Vite frontend and Supabase backend code,
> including SQL migrations and Edge Functions where used.

------------------------------------------------------------------------

## 1. Core Principles

All code in this project should follow these principles:

1.  **Readability first.** Code should be easy for another developer to
    understand without decoding clever tricks.
2.  **Keep it simple.** Prefer straightforward solutions over
    unnecessary abstractions, patterns, or dependencies.
3.  **One clear responsibility.** Components, hooks, services, and
    functions should have focused responsibilities.
4.  **Avoid duplication.** Reuse logic when it genuinely improves
    consistency, but do not create abstractions for one-off code without
    a clear benefit.
5.  **Protect working functionality.** Changes should be focused and
    should not rewrite unrelated working features.
6.  **Validate important rules at the database boundary.** Frontend
    validation improves UX but does not replace database constraints,
    transactions, or RLS.
7.  **Keep server state and client state separate.** TanStack Query owns
    server-state caching; Redux Toolkit owns global client-side state.
8.  **Use clear names.** Names should explain purpose rather than force
    readers to infer it.
9.  **Handle failure deliberately.** Do not silently ignore errors or
    report failed operations as successful.
10. **Follow existing project patterns.** Before introducing a new
    pattern, inspect how the same problem is already handled elsewhere.

The goal is maintainable production code, not the shortest possible code
or the most complicated architecture available.

------------------------------------------------------------------------

## 2. Technology and Language Rules

  Area                  Standard
  --------------------- ------------------
  UI                    React
  Build tooling         Vite
  Language              JavaScript
  Styling               Tailwind CSS
  Routing               React Router DOM
  Global client state   Redux Toolkit
  Server state          TanStack Query
  Backend               Supabase
  Database              PostgreSQL
  Authentication        Supabase Auth

### 2.1 JavaScript only

-   Use JavaScript files (`.js` and `.jsx`).
-   Do not introduce TypeScript (`.ts` or `.tsx`).
-   Do not add TypeScript configuration or type-generation workflows
    unless the project architecture is explicitly changed.
-   Use modern JavaScript features when they improve clarity and are
    supported by the project's tooling.
-   Avoid obscure syntax when a simple equivalent is easier to read.

### 2.2 Module conventions

-   Use ES module `import` and `export` syntax.
-   Prefer named exports for reusable components, hooks, utilities, and
    service functions.
-   Use default exports where they make sense for route-level page
    components or where required by the existing project convention.
-   Keep imports organized and remove unused imports.

------------------------------------------------------------------------

## 3. Formatting and Code Quality

### 3.1 Formatting rules

-   Use consistent indentation throughout the project.
-   Use semicolons consistently.
-   Use single quotes for JavaScript strings unless escaping makes
    double quotes clearer.
-   Include trailing commas in multiline objects, arrays, and function
    arguments where supported by the formatter.
-   Keep lines reasonably short; split long expressions when it improves
    readability.
-   Use parentheses and intermediate variables when they make complex
    conditions easier to understand.
-   Do not compress multiple unrelated statements into one line.

### 3.2 Automated tools

**Recommended baseline: ESLint + Prettier. Status: PROVISIONAL until
configured in the project.**

-   ESLint should detect common JavaScript and React mistakes.
-   Prettier should apply consistent formatting.
-   Formatting and lint rules should be shared through project
    configuration.
-   Do not disable a lint rule globally just to silence an inconvenient
    warning.
-   If a rule must be disabled for a specific line or file, provide a
    clear reason.

Exact ESLint configuration, Prettier options, and scripts are to be
finalized when the project tooling is initialized.

### 3.3 Clean code requirements

-   Remove unused variables, imports, commented-out code, and temporary
    debugging statements before committing.
-   Do not leave `console.log` debugging output in production code.
-   Do not use placeholder values or fake success responses in completed
    features.
-   Avoid deeply nested conditional logic; use early returns when they
    make the flow clearer.
-   Avoid unexplained magic numbers and strings. Use named constants
    when a value has business meaning or is reused.
-   Do not create generic helper functions that obscure a simple
    operation.

------------------------------------------------------------------------

## 4. Naming Conventions

Use descriptive names that communicate purpose.

  ----------------------------------------------------------------------------
  Item                    Convention              Example
  ----------------------- ----------------------- ----------------------------
  React components        PascalCase              `PlayerCard.jsx`

  Page components         PascalCase with clear   `PlayerManagementPage.jsx`
                          page name               

  Custom hooks            camelCase beginning     `usePlayers.js`
                          with `use`              

  Utility files           camelCase               `formatDate.js`

  API/service files       feature name plus       `players.api.js`
                          `.api.js`               

  Redux slices            feature name plus       `auth.slice.js`
                          `.slice.js`             

  Constants               camelCase file;         `MAX_TEAM_SIZE`
                          UPPER_SNAKE_CASE values 
                          where appropriate       

  Variables and functions camelCase               `getPlayerById`

  Classes                 PascalCase, only when   `ApiError`
                          needed                  

  Boolean variables       clear boolean wording   `isLoading`, `hasPermission`

  Event handlers          `handle` prefix         `handleSubmit`

  Query keys              centralized, consistent `playerKeys.list()`
                          feature keys            
  ----------------------------------------------------------------------------

Additional rules:

-   Avoid vague names such as `data`, `item`, `thing`, `temp`, or
    `value` when a more meaningful name is available.
-   Short names such as `id`, `i`, or `e` are acceptable in small,
    obvious scopes.
-   Use domain terms consistently. For example, do not use `teamOwner`,
    `manager`, and `captain` interchangeably if they represent different
    concepts.
-   Match database field names when mapping records unless there is a
    clear reason to transform them.

------------------------------------------------------------------------

## 5. React Component Standards

### 5.1 Component responsibilities

-   Components should have one clear UI responsibility.
-   Keep page components focused on composing feature components and
    coordinating page-level behavior.
-   Move reusable UI into focused components.
-   Move reusable stateful behavior into custom hooks.
-   Move database operations into API/service modules.
-   Avoid components that contain the entire feature's UI, data
    fetching, validation, and business logic in one large file.

### 5.2 Component size

There is no arbitrary line limit. Split a component when it becomes
difficult to understand, test, or change.

Consider splitting when:

-   The component handles several unrelated sections.
-   The same UI is repeated in multiple places.
-   It contains substantial data transformation or business logic.
-   A section has its own meaningful state and behavior.
-   Small changes repeatedly risk breaking unrelated parts.

Do not split every few lines into a new component. Excessive
fragmentation makes code harder to follow too.

### 5.3 Props

-   Pass only the props a component needs.
-   Use clear prop names.
-   Prefer explicit props over passing an entire large object when only
    one or two fields are required.
-   Use sensible defaults where appropriate.
-   Do not mutate props.
-   Avoid passing many unrelated boolean props that create a large
    number of component modes. Use a clear variant or separate
    components when appropriate.

### 5.4 Rendering

-   Use stable keys when rendering lists.
-   Prefer meaningful IDs as keys; avoid array indexes when items can be
    inserted, removed, or reordered.
-   Do not use array indexes as database identifiers.
-   Avoid unnecessary state for values that can be calculated from
    existing props or state.
-   Avoid unnecessary effects. Derive values during render when
    possible.
-   Keep conditional rendering readable.

### 5.5 Forms

-   Keep form state and validation understandable.
-   Validate user input before submitting for a good user experience.
-   Show field-level errors where useful.
-   Disable or otherwise protect submit actions while a request is
    pending.
-   Prevent accidental duplicate submissions.
-   Treat server/database validation as authoritative even when the
    frontend has validated the same input.

------------------------------------------------------------------------

## 6. Hooks and Reusable Logic

-   Custom hooks must start with `use`.
-   Call React hooks only at the top level of React components or custom
    hooks.
-   Do not call hooks conditionally, inside loops, or inside nested
    functions.
-   Keep hooks focused on one coherent responsibility.
-   Do not create a custom hook merely to wrap one trivial line unless
    it improves reuse or clarity.
-   Keep data-fetching hooks near their feature.
-   Keep generic hooks in the shared hooks location only when multiple
    features genuinely use them.
-   Clean up subscriptions, event listeners, and other external
    resources in effects.

------------------------------------------------------------------------

## 7. State Management Standards

### 7.1 TanStack Query: server state

TanStack Query is the owner of server-state caching.

Use it for:

-   Data fetched from Supabase.
-   Server-backed lists and detail records.
-   Query loading and error states.
-   Server mutations.
-   Cache invalidation and updates.
-   Pagination and refetching where needed.

Rules:

-   Use consistent query keys.
-   Keep query functions in feature API/service modules or feature
    hooks, not scattered across presentational components.
-   Invalidate or update affected query keys after successful mutations.
-   Do not copy ordinary query results into Redux.
-   Do not manually create a second server-data cache in component
    state.
-   Handle query and mutation errors explicitly.

### 7.2 Redux Toolkit: global client state

Use Redux Toolkit for state that is genuinely global and client-owned,
including:

-   Authentication representation and current authentication status.
-   Shared global UI state when needed.
-   Other cross-feature client state that cannot reasonably remain
    local.

Rules:

-   Keep slices focused.
-   Use Redux Toolkit's built-in reducer patterns.
-   Do not store passwords, service-role keys, or other secrets in
    Redux.
-   Do not treat Redux role data as database authorization.
-   Avoid adding a slice for data that TanStack Query already owns.

### 7.3 React local state

Use component state for local UI behavior such as:

-   Dialog visibility.
-   Dropdown state.
-   Temporary form values.
-   Local tabs and view toggles.
-   Small interactions used by one component.

Do not move every state value into Redux.

------------------------------------------------------------------------

## 8. Supabase and Database Access Standards

### 8.1 Centralized client

-   Import the shared Supabase client from the centralized client
    module.
-   Do not initialize a new Supabase client in individual components or
    feature files.
-   Keep public environment configuration in the appropriate Vite
    environment variables.
-   Never expose the Supabase service-role key in frontend code or any
    `VITE_` variable.

### 8.2 API/service layer

-   Organize database operations by feature.
-   Use clear function names such as `getPlayers`, `getPlayerById`,
    `createPlayer`, and `updatePlayer`.
-   Keep raw Supabase queries out of presentational components.
-   Return useful results and errors to the calling query or mutation.
-   Do not silently swallow Supabase errors.
-   Avoid creating a generic database abstraction that hides the actual
    query without providing meaningful value.

### 8.3 Database validation and integrity

-   Frontend validation is for user experience, not security.
-   Enforce important rules with PostgreSQL constraints, RLS, and
    database functions.
-   Use transactions for operations that must succeed or fail as a unit.
-   Do not rely on a sequence of separate browser requests for an
    operation that must be atomic.
-   Do not trust IDs, roles, team ownership, or match assignments
    supplied by the client without database-side authorization.

### 8.4 Player allocation

Player allocation is a critical operation and must follow these rules:

-   The browser may run the spin-wheel presentation and let the Super
    Admin choose a team.
-   The database must validate the selected player, player position,
    receiving team, and current allocation state.
-   The database must prevent duplicate assignment.
-   The database must enforce team composition limits.
-   The assignment must be committed transactionally.
-   The UI must show success only after the database confirms the
    operation.
-   The frontend must not be treated as the authority for allocation
    validity.

The detailed allocation workflow and database function contract belong
in `FEATURES.md` and `DATABASE.md`.

------------------------------------------------------------------------

## 9. Authentication and Authorization Standards

-   Use Supabase Auth for authentication.
-   Do not implement a separate password or session system.
-   Restore the Supabase session before rendering protected management
    content.
-   Keep Redux authentication state synchronized with Supabase Auth
    events.
-   Retrieve the application profile and role from the trusted database
    source.
-   Do not allow users to select or assign their own management role
    through the login form.
-   Use centralized route protection for management route groups.
-   Treat route protection as navigation control, not database security.
-   Enforce permissions with PostgreSQL RLS and database-side checks.
-   Managers must not access another team's restricted data.
-   Referees must not access matches outside their permitted
    assignments.
-   Clear user-specific query caches when logging out or changing
    accounts.

Detailed permissions and RLS policies belong in `SECURITY.md`.

------------------------------------------------------------------------

## 10. Styling and Responsive Design

### 10.1 Tailwind CSS

-   Use Tailwind utility classes for application styling.
-   Follow the project's shared design tokens and theme conventions.
-   Reuse shared UI components for repeated patterns.
-   Avoid adding arbitrary one-off values when a shared design token
    already exists.
-   Keep class lists readable.
-   Extract repeated styling into a shared component or a suitable
    abstraction when it improves maintainability.
-   Do not introduce a second styling framework without an explicit
    decision.

### 10.2 Mobile-first layout

-   Design for small screens first.
-   Add tablet and desktop layouts progressively.
-   Ensure navigation, forms, tables, dialogs, and dashboards remain
    usable on mobile.
-   Do not solve mobile layout issues by hiding important functionality
    without an approved alternative.
-   Avoid fixed widths that cause horizontal overflow on small screens.
-   Test touch targets and spacing on mobile-sized viewports.

Exact breakpoints and design tokens should be defined in the design
system or project documentation.

### 10.3 Accessibility

-   Use semantic HTML elements.
-   Use buttons for actions and links for navigation.
-   Provide labels for form controls.
-   Ensure keyboard users can reach and operate interactive controls.
-   Provide visible focus states.
-   Do not communicate status using color alone.
-   Give meaningful images appropriate alternative text; decorative
    images should not create unnecessary screen-reader noise.
-   Use accessible dialog and menu behavior.

------------------------------------------------------------------------

## 11. Error Handling and User Feedback

-   Handle errors at the layer where useful context is available.
-   Show clear, user-friendly messages rather than raw database error
    objects.
-   Preserve useful technical details for development diagnostics
    without exposing secrets or sensitive data to users.
-   Do not display success notifications before a mutation succeeds.
-   Keep loading, empty, error, and success states distinct.
-   Retry only operations where retrying is safe.
-   Avoid automatically retrying non-idempotent actions in a way that
    could create duplicate records.
-   Make destructive actions clear and require appropriate confirmation.
-   Do not leave rejected promises or failed operations unhandled.

The global error boundary, logging, monitoring, and exact retry strategy
are defined separately in the architecture/error-handling decisions.

------------------------------------------------------------------------

## 12. Realtime Standards

-   Use Supabase Realtime only for features that need live
    synchronization.
-   Subscribe to the smallest relevant set of events and records.
-   Keep subscription setup and cleanup in a clear feature-level
    location or custom hook.
-   Prevent duplicate subscriptions.
-   Remove subscriptions when the relevant screen or feature no longer
    needs them.
-   Update or invalidate TanStack Query caches in response to relevant
    events.
-   Do not duplicate Realtime server data in Redux.
-   Do not assume a connected UI is always current; handle disconnects
    and reconnects deliberately.
-   Use a refetch or reconciliation strategy when events may have been
    missed.

------------------------------------------------------------------------

## 13. Security and Environment Variables

-   Commit an `.env.example` containing variable names and safe
    placeholders, never real secrets.
-   Keep real environment files out of version control.
-   Validate required environment configuration during application
    setup.
-   Only expose values intended for browser use through Vite's public
    environment-variable mechanism.
-   Never commit passwords, access tokens, private keys, service-role
    keys, or production credentials.
-   Do not log authentication tokens or sensitive personal information.
-   Keep privileged operations in trusted server-side environments.
-   Review RLS and database permissions whenever a new table or
    client-accessible operation is added.

------------------------------------------------------------------------

## 14. SQL, Migrations, and Database Code

-   Make database schema changes through version-controlled Supabase
    migrations.
-   Do not rely on undocumented manual production database edits.
-   Use clear, ordered migration filenames.
-   Keep each migration focused on a coherent schema or policy change.
-   Include required constraints, indexes, RLS enablement, and policies
    in the appropriate migrations.
-   Review the impact of migrations on existing data.
-   Avoid destructive schema changes without an explicit migration plan.
-   Make database functions readable and document non-obvious business
    rules.
-   Use transactions for multi-step operations requiring atomicity.
-   Test RLS policies using representative roles, not only the
    privileged project owner.

Exact SQL formatting and migration naming details may be finalized when
the first migration is created.

------------------------------------------------------------------------

## 15. File and Folder Organization

-   Follow the feature-based structure defined in `ARCHITECTURE.md`.
-   Keep feature-specific components, hooks, and API logic together
    where practical.
-   Put genuinely reusable UI in shared component folders.
-   Keep global providers and app initialization in the app layer.
-   Keep the Supabase client centralized.
-   Keep Redux store configuration and slices in the store layer.
-   Avoid circular imports between features.
-   Avoid dumping unrelated functions into generic files such as
    `helpers.js` or `common.js`.
-   Do not create folders solely to make the tree look more elaborate.

------------------------------------------------------------------------

## 16. Comments and Documentation

-   Write code that explains itself through good naming and clear
    structure.
-   Add comments to explain why a non-obvious decision exists, not to
    repeat what the next line does.
-   Document important business rules and security assumptions.
-   Explain unusual workarounds and constraints.
-   Remove outdated comments when code changes.
-   Keep README and project documentation aligned with actual
    implementation.
-   Do not leave TODO comments without enough context to understand the
    remaining work.

For important TODOs, include what remains and, where useful, the related
issue or documentation section.

------------------------------------------------------------------------

## 17. Dependencies and Abstractions

-   Prefer existing project dependencies when they already solve the
    problem.
-   Add a new dependency only when it provides clear value.
-   Avoid multiple libraries that solve the same problem.
-   Check compatibility with the existing React, Vite, and Tailwind
    setup before adding packages.
-   Avoid unnecessary UI libraries, state libraries, API clients, or
    backend frameworks.
-   Do not introduce Express, Firebase, MongoDB, Prisma, JSON Server, a
    separate auth service, a separate storage service, or external
    WebSocket infrastructure under the current architecture.
-   Avoid building a custom abstraction around a library unless it
    removes real duplication or centralizes an important project rule.

------------------------------------------------------------------------

## 18. Git and Change Management

### 18.1 Branches and commits

**Recommended baseline; exact branch protection and release workflow are
TBD.**

-   Keep commits focused on one logical change.
-   Use descriptive commit messages.
-   Avoid committing generated build output, local environment files, or
    temporary debugging artifacts.
-   Do not mix unrelated refactoring with feature changes unless
    necessary.
-   Review the changed files before committing.

Suggested commit message format:

``` text
type: short description
```

Examples:

``` text
feat: add player registration
fix: prevent duplicate player allocation
refactor: simplify team query hooks
style: improve mobile dashboard spacing
docs: update database architecture
```

Common types:

-   `feat`
-   `fix`
-   `refactor`
-   `style`
-   `docs`
-   `test`
-   `chore`

### 18.2 Safe modification rules

When modifying existing code:

1.  Inspect the relevant files and their callers first.
2.  Understand the existing behavior before changing it.
3.  Make the smallest change that correctly solves the problem.
4.  Do not rewrite unrelated working features.
5.  Check imports, routes, query keys, and shared components affected by
    the change.
6.  Run the available lint, build, and relevant tests.
7.  Summarize what changed and identify any remaining limitations.

------------------------------------------------------------------------

## 19. Testing Standards

**Status: PROVISIONAL --- exact testing tools and coverage targets are
TBD.**

Testing should be added around important behavior, especially:

-   Authentication and session restoration.
-   Role-based route access.
-   Manager-to-team restrictions.
-   Referee-to-match restrictions.
-   Player allocation validation and duplicate prevention.
-   Transactional database functions.
-   RLS policies.
-   Important form validation.
-   Critical public and management workflows.

Testing rules:

-   Test behavior and outcomes rather than implementation details.
-   Include failure and unauthorized cases, not only successful cases.
-   Test database rules at the database boundary.
-   Do not rely only on frontend tests to prove RLS or transactional
    integrity.
-   Avoid claiming a feature is tested when only its UI has been
    manually opened.

The test framework, test directory structure, CI integration, and
coverage targets are **TBD**.

------------------------------------------------------------------------

## 20. Definition of Done

A code change is not complete merely because it appears to work once on
the developer's machine.

Before considering a change complete:

-   [ ] The change meets the relevant requirement.
-   [ ] Code follows this document's naming and organization
    conventions.
-   [ ] No unrelated working functionality was removed or changed.
-   [ ] Loading, empty, success, and error states are handled where
    relevant.
-   [ ] Input is validated appropriately.
-   [ ] Database constraints, RLS, and transactional rules are respected
    where relevant.
-   [ ] Server state remains in TanStack Query rather than being
    duplicated in Redux.
-   [ ] Realtime subscriptions are cleaned up where applicable.
-   [ ] The UI works on mobile and desktop layouts.
-   [ ] Accessibility basics are respected.
-   [ ] Relevant tests have been run or the missing test coverage is
    stated.
-   [ ] Lint and production build pass when configured.
-   [ ] No secrets, debug output, or temporary code are committed.
-   [ ] Related documentation is updated when architecture or behavior
    changes.

------------------------------------------------------------------------

## 21. AI-Assisted Development Rules

AI coding tools and agents working on this repository must follow these
rules:

1.  Read `PROJECT_OVERVIEW.md`, `REQUIREMENTS.md`, `FEATURES.md`,
    `ARCHITECTURE.md`, `DATABASE.md`, and `SECURITY.md` when they are
    relevant to the task and available.
2.  Treat confirmed project decisions as constraints, not suggestions.
3.  Do not change the technology stack or introduce prohibited
    infrastructure without approval.
4.  Use JavaScript, not TypeScript.
5.  Keep code straightforward, readable, and appropriate for a
    maintainable React application.
6.  Do not over-engineer simple features or introduce unnecessary
    abstractions.
7.  Do not rewrite large parts of the application to fix a small issue.
8.  Inspect existing implementation before editing it.
9.  Preserve existing working behavior unless the requirement explicitly
    changes it.
10. Do not invent database tables, fields, routes, roles, or business
    rules. Check the project documentation and current schema first.
11. Never bypass RLS or expose privileged Supabase credentials to make a
    feature work.
12. Do not claim that code was tested, built, or deployed unless that
    action was actually performed successfully.
13. Explain important changes and list files modified.
14. If a requirement is ambiguous or conflicts with the documentation,
    identify the conflict and ask for clarification instead of silently
    making a risky assumption.

------------------------------------------------------------------------

## 22. Decisions to Finalize During Project Setup

  Decision                                                  Status
  --------------------------------------------------------- -------------
  ESLint configuration and exact rules                      PROVISIONAL
  Prettier configuration and exact options                  PROVISIONAL
  Exact formatting and lint scripts                         TBD
  Test framework and test utilities                         TBD
  Unit, integration, and end-to-end test coverage targets   TBD
  CI checks and branch protection                           TBD
  SQL formatting and migration naming details               TBD
  Logging and error monitoring tools                        TBD

------------------------------------------------------------------------

## 23. Related Documentation

  -----------------------------------------------------------------------
  Document                            Responsibility
  ----------------------------------- -----------------------------------
  `PROJECT_OVERVIEW.md`               Project purpose and context

  `REQUIREMENTS.md`                   Functional and non-functional
                                      requirements

  `FEATURES.md`                       Feature behavior and workflows

  `ARCHITECTURE.md`                   System architecture and technical
                                      boundaries

  `DATABASE.md`                       Database schema, relationships,
                                      constraints, and functions

  `SECURITY.md`                       Permissions, RLS, and security
                                      requirements

  `CODING_STANDARDS.md`               Code style, organization,
                                      implementation, and review rules
  -----------------------------------------------------------------------

**Final rule:** Prefer code that is simple to read, safe to change, and
consistent with the agreed architecture. Complexity must solve a real
problem; it is not a measure of code quality.
