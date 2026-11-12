# Institute Football League Platform

# ARCHITECTURE.md

> **Document status:** Planning baseline\
> **Purpose:** Define the technical architecture before application
> development begins.\
> **Implementation status:** Not started. This document describes the
> agreed architecture and explicitly marks unresolved decisions.

------------------------------------------------------------------------

## 1. Architecture Overview

The Institute Football League Platform is a mobile-first web application
for presenting and managing an institute football tournament.

The platform will use a **single React application** with separate
public, Super Admin, Manager, and Referee route groups and layouts.
Supabase will provide the complete backend platform, including
authentication, PostgreSQL database, storage, realtime communication,
database functions, and Edge Functions.

The frontend will use Redux Toolkit for global client-side state and
TanStack Query for server state. Supabase Realtime events will
synchronize relevant TanStack Query caches.

### 1.1 Architecture principles

-   Keep the application in one frontend codebase and one deployment.
-   Organize frontend code by feature, not only by technical layer.
-   Keep UI components separate from database operations.
-   Use TanStack Query as the owner of server-state caching.
-   Use Redux Toolkit only for global client-side state, including
    authentication representation.
-   Treat Supabase PostgreSQL and Row Level Security (RLS) as the
    authoritative data and authorization boundary.
-   Validate important business rules in the database, not only in the
    browser.
-   Keep code readable, direct, and maintainable.
-   Avoid unnecessary abstractions, excessive folder nesting, and
    oversized files.
-   Do not introduce a separate backend or external infrastructure where
    Supabase already provides the required capability.

------------------------------------------------------------------------

## 2. Confirmed Product Configuration

The tournament configuration relevant to the architecture is:

  Item                          Configuration
  --------------------------- ---------------
  Teams                                     3
  Managers                                  3
  Goalkeepers                               3
  Outfield players                         12
  Total players                            15
  Players per team                          5
  Goalkeepers per team                      1
  Outfield players per team                 4

Managers are separate from the player pool and are not counted as
players.

Player positions:

-   GK
-   CB
-   MF
-   FW

### 2.1 Player allocation workflow

-   Goalkeepers and outfield players use two independent spin wheels.
-   The wheel randomly selects a player.
-   The Super Admin manually chooses the receiving team.
-   There is no bidding, auction, budget, or automatic team selection.
-   Each team must finish with exactly one goalkeeper and four outfield
    players.
-   Goalkeeper allocation is separate from outfield allocation.
-   Allocation must be validated and committed transactionally at
    database level.
-   A player must not be assigned more than once.
-   The database must prevent a team from exceeding its permitted
    allocation.

The exact allocation history, undo/reversal rules, and concurrency
behavior remain **TBD** and must be specified in the relevant
requirements/database documentation.

------------------------------------------------------------------------

## 3. Technology Stack

### 3.1 Frontend

  -----------------------------------------------------------------------
  Technology              Responsibility          Status
  ----------------------- ----------------------- -----------------------
  React                   UI framework            CONFIRMED

  Vite                    Development server and  CONFIRMED
                          build tooling           

  JavaScript              Application language;   CONFIRMED
                          TypeScript is not to be 
                          used                    

  Tailwind CSS            Styling and responsive  CONFIRMED
                          design                  

  React Router DOM        Client-side routing     CONFIRMED

  Redux Toolkit           Global client-side      CONFIRMED
                          state                   

  TanStack Query          Server-state fetching,  CONFIRMED
                          caching, and mutations  

  Supabase JavaScript     Frontend communication  CONFIRMED
  Client                  with Supabase           
  -----------------------------------------------------------------------

### 3.2 Backend

Supabase is the entire backend platform.

  -----------------------------------------------------------------------
  Supabase capability     Responsibility          Status
  ----------------------- ----------------------- -----------------------
  PostgreSQL              Primary relational      CONFIRMED
                          database                

  Supabase Auth           Management              CONFIRMED
                          authentication and      
                          session authority       

  Supabase Storage        File and image storage  CONFIRMED

  Supabase Realtime       Live data               CONFIRMED
                          synchronization         

  Edge Functions          Server-side operations  CONFIRMED
                          where required          

  PostgreSQL Functions    Transactional and       CONFIRMED
                          database-side business  
                          operations              

  Database Triggers       Database reactions and  CONFIRMED
                          integrity-related       
                          automation where        
                          required                

  Row Level Security      Database authorization  CONFIRMED
                          boundary                

  Database Migrations     Version-controlled      CONFIRMED
                          database schema changes 
  -----------------------------------------------------------------------

### 3.3 Deployment

  Part       Platform   Status
  ---------- ---------- -----------
  Frontend   Vercel     CONFIRMED
  Backend    Supabase   CONFIRMED

------------------------------------------------------------------------

## 4. High-Level System Architecture

``` text
                    Visitors and Management Users
                                |
                                v
                     React + Vite Application
                                |
             +------------------+------------------+
             |                  |                  |
             v                  v                  v
        Public Routes      Admin Routes       Manager Routes
                              |                  |
                              +--------+---------+
                                       |
                                  Referee Routes
                                       |
                                       v
                          Shared Application Services
                                       |
                 +---------------------+---------------------+
                 |                     |                     |
                 v                     v                     v
            Redux Toolkit        TanStack Query        Supabase Client
          Client-side state       Server state                |
                                                               v
                                                        Supabase Platform
                                                               |
                  +-------------------+------------------------+------------------+
                  |                   |                        |                  |
                  v                   v                        v                  v
              PostgreSQL          Supabase Auth          Supabase Storage    Realtime
                  |
          +-------+---------+
          |                 |
          v                 v
    PostgreSQL Functions   Triggers
          |
          v
    Database integrity and transactional business rules

        Supabase Edge Functions: server-side workflows when required
```

### 4.1 Main communication rules

-   React components use feature hooks for server data.
-   Feature hooks use TanStack Query.
-   Query functions and mutation functions call feature API/service
    modules.
-   API/service modules use the centralized Supabase client.
-   Supabase PostgreSQL is the persistent source of truth.
-   Redux Toolkit does not duplicate ordinary database records.
-   Supabase Realtime events update or invalidate affected TanStack
    Query caches.
-   PostgreSQL constraints, functions, and RLS enforce database
    integrity and access control.

------------------------------------------------------------------------

## 5. Frontend Application Architecture

### 5.1 Single React application

**Status: CONFIRMED**

The entire platform will use one React + Vite application.

There will not be separate frontend applications for public visitors,
Super Admins, Managers, or Referees.

The application will share:

-   Supabase client and service layer.
-   Authentication/session handling.
-   Design system and reusable UI components.
-   Feature modules where functionality is shared.
-   Routing infrastructure.
-   Global providers and error handling.

Separate route groups and layouts will provide role-specific
experiences.

### 5.2 Feature-based organization

**Status: CONFIRMED**

Frontend code will be organized primarily around features.

Each feature may contain its own components, hooks, API operations, and
related logic. Shared UI and cross-feature functionality belong in
shared locations.

Expected feature areas include:

-   Authentication
-   Players
-   Teams
-   Managers
-   Allocation
-   Fixtures
-   Matches
-   Standings
-   Statistics
-   Announcements

The final feature list may be adjusted as the requirements and feature
documentation are finalized.

### 5.3 Proposed application structure

This is the architectural direction. Exact files and folders may be
refined during implementation.

``` text
src/
├── app/
│   ├── App.jsx
│   ├── router.jsx
│   └── providers/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── features/
│   ├── auth/
│   ├── players/
│   ├── teams/
│   ├── managers/
│   ├── allocation/
│   ├── fixtures/
│   ├── matches/
│   ├── standings/
│   ├── statistics/
│   └── announcements/
│
├── layouts/
│   ├── PublicLayout.jsx
│   ├── AdminLayout.jsx
│   ├── ManagerLayout.jsx
│   └── RefereeLayout.jsx
│
├── pages/
│   ├── public/
│   ├── admin/
│   ├── manager/
│   └── referee/
│
├── hooks/
│
├── store/
│   ├── store.js
│   └── slices/
│
├── services/
│   ├── supabase/
│   │   └── client.js
│   └── api/
│
├── lib/
│
└── utils/
```

Organization rules:

-   Keep feature-specific logic inside its feature where practical.
-   Keep shared components in `components/shared` or `components/ui`.
-   Keep reusable infrastructure in `services`, `lib`, and `app`.
-   Avoid deep nesting for small features.
-   Avoid creating a folder for every small component.
-   Do not create oversized components or service files.
-   Do not put database queries directly inside presentational
    components.

------------------------------------------------------------------------

## 6. Entry Experience and Routing Architecture

### 6.1 Initial landing page

**Status: CONFIRMED**

When a visitor opens the website, the first page will be a landing page.

The landing page will provide:

-   A simple **Continue** action that takes the visitor into the normal
    public tournament experience.
-   An options/settings icon in the top corner.
-   A management-login option accessible through that icon.

The management option is not the primary public call to action.

### 6.2 Public experience

After selecting Continue, visitors enter the normal public-facing
tournament pages.

Public pages may include tournament information, teams, players,
fixtures, standings, and other information approved for public viewing.

The exact public page list and whether any public actions require an
account are **TBD** in the requirements.

### 6.3 Management login entry

The options icon exposes a **Management Login** option.

Selecting it takes the user to a shared management login page. Super
Admins, Managers, and Referees use this same login entry point.

After successful authentication and role retrieval, the application
redirects the user to the dashboard permitted for their role.

There will be no public role selector that allows a user to choose or
assign their own role.

### 6.4 Routing library

**Status: CONFIRMED --- React Router DOM**

React Router DOM will handle:

-   Route definitions.
-   Nested routes.
-   Layout routes.
-   Protected routes.
-   Role-based route checks.
-   Route-level loading and error boundaries where appropriate.

### 6.5 Route organization

**Status: CONFIRMED --- separate nested route groups**

Conceptual route organization:

``` text
/
├── Landing Page
├── Management Login
│
├── Public Experience
│   ├── Tournament
│   ├── Teams
│   ├── Players
│   ├── Fixtures
│   ├── Standings
│   └── Match Details
│
├── /admin/*
│   └── AdminLayout
│
├── /manager/*
│   └── ManagerLayout
│
└── /referee/*
    └── RefereeLayout
```

The exact URL paths for individual pages are **TBD**.

### 6.6 Dashboard layouts

**Status: CONFIRMED --- separate layouts**

The application will have separate layouts:

-   `PublicLayout`
-   `AdminLayout`
-   `ManagerLayout`
-   `RefereeLayout`

Each management layout can have its own navigation, header, sidebar, and
role-specific page structure.

Shared UI components may be reused without forcing all dashboards into
one generic layout.

### 6.7 Protected routes

**Status: CONFIRMED --- centralized protection**

A centralized protected-route mechanism will check whether the user has
an authenticated session and the required role before rendering a
management route.

The route guard improves navigation and user experience. It is not the
security boundary. Database access must still be protected by RLS and
appropriate database-side checks.

Unauthorized users should be redirected to an appropriate page. Exact
redirect destinations and handling of authenticated users who visit the
wrong dashboard are **TBD**.

------------------------------------------------------------------------

## 7. Authentication Architecture

### 7.1 Authentication authority

**Status: CONFIRMED**

Supabase Auth is the authentication authority.

It is responsible for:

-   Credential authentication.
-   Session creation.
-   Session persistence.
-   Session refresh.
-   Logout.
-   Authentication state change events.

The application must not implement a separate password system or
separate authentication backend.

### 7.2 State responsibilities

  -----------------------------------------------------------------------
  Technology                          Responsibility
  ----------------------------------- -----------------------------------
  Supabase Auth                       Authoritative session and identity

  Redux Toolkit                       Frontend authentication
                                      representation and current auth
                                      status

  TanStack Query                      Fetching and caching the user's
                                      application profile

  PostgreSQL                          Persisting application profile and
                                      role information
  -----------------------------------------------------------------------

Redux state is a frontend representation. It must not be treated as
proof of identity or permission.

### 7.3 Login flow

1.  User opens Management Login.
2.  User submits login credentials.
3.  Supabase Auth authenticates the credentials.
4.  Supabase creates or restores the authenticated session.
5.  The application updates its Redux authentication representation.
6.  The application retrieves the user's application profile and
    assigned role.
7.  The application checks the role for navigation purposes.
8.  The user is redirected to the matching dashboard.
9.  Database requests remain subject to RLS.

### 7.4 Session restoration

When the application starts or reloads:

1.  The application checks/restores the Supabase Auth session.
2.  Redux authentication state is initialized from the auth result.
3.  If a valid session exists, the application retrieves the user's
    profile and role.
4.  Protected routes wait until the required authentication/profile
    state is resolved.
5.  If no valid session exists, management routes remain inaccessible.

The application must avoid briefly rendering protected content while
session restoration is still in progress.

### 7.5 Logout

Logout will be performed through Supabase Auth. The frontend must then
clear or reset the relevant authentication representation and
user-specific cached data so that information from one account is not
shown to another.

### 7.6 Account provisioning

**Status: CONFIRMED**

Management accounts are controlled by the Super Admin. There will not be
public self-registration for management roles.

The exact account creation, invitation, password reset, and account
recovery workflows are **TBD**.

------------------------------------------------------------------------

## 8. Authorization Architecture

### 8.1 Authorization model

**Status: PROVISIONAL --- role-based access control with database
enforcement**

The application will use role-based access control for management areas.

Expected roles:

-   Super Admin
-   Manager
-   Referee
-   Public visitor (unauthenticated public access, not necessarily an
    authenticated database role)

### 8.2 Role responsibilities

  -----------------------------------------------------------------------
  Role                                Intended access
  ----------------------------------- -----------------------------------
  Super Admin                         Full tournament administration and
                                      management

  Manager                             Information and actions restricted
                                      to the manager's assigned team

  Referee                             Information and actions restricted
                                      to matches assigned to the referee

  Public visitor                      Read-only access to information
                                      explicitly made public
  -----------------------------------------------------------------------

Detailed permissions for every feature and operation belong in
`SECURITY.md` and `REQUIREMENTS.md`, not duplicated here.

### 8.3 Frontend authorization

-   Centralized route guards protect management route groups.
-   Role-aware navigation displays only relevant sections.
-   UI actions may be hidden or disabled when the role does not have
    permission.
-   Feature-level checks may improve user experience for sensitive
    actions.

These frontend checks are not sufficient to secure data.

### 8.4 PostgreSQL RLS

**Status: CONFIRMED --- required security boundary**

RLS must enforce access at the database level.

Examples of intended boundaries:

-   A Manager must only access data and perform permitted actions for
    their assigned team.
-   A Referee must only access data and perform permitted actions for
    matches assigned to them.
-   Public users must only read records and fields intended for public
    access.
-   Super Admin operations must require a trusted Super Admin identity
    and appropriate database permissions.

The database must not trust a role, team ID, match ID, or user ID merely
because the frontend submitted it.

Exact policy definitions, role storage, policy helper functions, and
permission matrices are **TBD** and belong in `SECURITY.md` and
`DATABASE.md`.

------------------------------------------------------------------------

## 9. State Management Architecture

**Status: CONFIRMED --- Redux Toolkit + TanStack Query**

The application will use separate tools for client state and server
state.

### 9.1 Redux Toolkit

Use Redux Toolkit for global client-side state, such as:

-   Authentication representation.
-   Current user/authentication status.
-   Global UI state when genuinely shared across routes or features.
-   Other cross-feature client state that does not represent
    server-owned records.

Redux should not become a second cache of the Supabase database.

### 9.2 TanStack Query

Use TanStack Query for server state, including:

-   Fetching data from Supabase.
-   Query caching.
-   Cache freshness and refetching.
-   Mutations.
-   Loading and error state for server operations.
-   Cache invalidation and targeted cache updates.
-   Pagination or infinite queries where required.

### 9.3 React component state

Use React `useState` and related component-level state for local UI
behavior, such as:

-   Open/closed dialogs.
-   Temporary form input.
-   Dropdown state.
-   Local filters that do not need to be global.
-   Component-specific interactions.

### 9.4 State ownership rule

  -----------------------------------------------------------------------
  Data                                Owner
  ----------------------------------- -----------------------------------
  Supabase records                    PostgreSQL

  Cached server data                  TanStack Query

  Authentication representation and   Redux Toolkit
  global client state                 

  Local component interaction state   React state

  Live change events                  Supabase Realtime, synchronized
                                      into TanStack Query
  -----------------------------------------------------------------------

Do not copy every query result into Redux. That creates two competing
caches and unnecessary synchronization problems.

------------------------------------------------------------------------

## 10. Supabase Integration Architecture

### 10.1 Centralized client

**Status: CONFIRMED**

Initialize the Supabase JavaScript client once in a centralized module,
expected at:

``` text
src/services/supabase/client.js
```

Application features should import this shared client rather than
creating independent clients.

Environment configuration must be handled through Vite environment
variables. Only public client configuration may be exposed to the
browser. Service-role credentials must never be included in frontend
code or Vite-exposed environment variables.

### 10.2 Feature-based API/service modules

**Status: CONFIRMED**

Database operations will be organized by feature in service/API modules.

Illustrative organization:

``` text
src/
└── services/
    ├── supabase/
    │   └── client.js
    └── api/
        ├── players.api.js
        ├── teams.api.js
        ├── managers.api.js
        ├── allocation.api.js
        ├── fixtures.api.js
        ├── matches.api.js
        └── standings.api.js
```

The exact split may be adjusted as features are implemented.

### 10.3 Query hooks

Feature-specific TanStack Query hooks will call the corresponding
API/service functions.

Illustrative organization:

``` text
features/
└── players/
    ├── components/
    ├── hooks/
    │   ├── usePlayers.js
    │   └── usePlayer.js
    └── pages/
```

Components should consume hooks rather than contain raw Supabase
queries.

### 10.4 Mutations

Mutations will be implemented through TanStack Query mutation hooks and
feature API/service functions.

After a successful mutation:

-   Update the affected cache directly when the resulting data is known
    and safe to apply; or
-   Invalidate the relevant query keys so TanStack Query can refetch
    authoritative data.

Mutation errors must be returned to the feature/UI layer in a consistent
way.

### 10.5 Error handling

Supabase errors should be handled at the service or query/mutation
boundary and exposed in a predictable form to the UI.

Do not silently swallow database errors or show success messages when
the operation failed.

The complete error strategy is **TBD** in Section 17.

------------------------------------------------------------------------

## 11. Realtime Architecture

### 11.1 Realtime platform

**Status: CONFIRMED --- Supabase Realtime**

Supabase Realtime will be used for live synchronization. No external
WebSocket service will be introduced.

### 11.2 Expected realtime use cases

Potential realtime-enabled areas include:

-   Player allocation updates.
-   Live allocation visibility.
-   Match score updates.
-   Match event updates.
-   Standings or other derived tournament data when required.

The exact publication/table configuration and which screens require live
updates are **TBD**.

### 11.3 Cache synchronization

Realtime events should update or invalidate the relevant TanStack Query
cache.

Conceptual flow:

``` text
PostgreSQL change
      |
      v
Supabase Realtime event
      |
      v
Feature subscription handler
      |
      v
Update or invalidate relevant query key
      |
      v
TanStack Query refreshes affected UI
```

Realtime should not become a second independent server-state store in
Redux.

### 11.4 Subscription lifecycle

Subscriptions must be created only while the relevant feature or screen
needs them and must be cleaned up when no longer needed.

Avoid duplicate subscriptions, unnecessary table-wide listeners, and
subscriptions that remain active after navigation.

Detailed channel design, filters, event handling, reconnect behavior,
and fallback refetch strategy are **TBD**.

------------------------------------------------------------------------

## 12. Backend Processing Architecture

### 12.1 General rule

Supabase is the backend. Backend processing should use the simplest
suitable Supabase capability while keeping security and transactional
integrity at the database boundary.

### 12.2 Direct Supabase client operations

Direct client operations may be used for straightforward reads and
writes when:

-   RLS safely authorizes the operation.
-   Database constraints protect data integrity.
-   No multi-step transaction or privileged server-only workflow is
    required.

### 12.3 PostgreSQL Functions

Use PostgreSQL functions for database-side operations that need atomic
execution, validation, or coordinated updates.

**Player allocation must be transactional and validated at database
level.**

The allocation operation must validate relevant rules and commit the
assignment as one transaction. It must prevent duplicate player
assignment and enforce team composition limits even if multiple requests
occur close together.

The exact function signature, locking strategy, allocation history, and
reversal behavior are **TBD** in `DATABASE.md` and `FEATURES.md`.

### 12.4 Database Triggers

Use triggers only when a database-level reaction is necessary to
preserve consistency or maintain derived data.

Avoid triggers for logic that is clearer and safer in an explicit
database function or application workflow.

Exact trigger use is **TBD**.

### 12.5 Supabase Edge Functions

Use Edge Functions when a workflow requires server-side execution that
should not run in the browser, such as an operation involving a
protected secret or an external service.

Do not create Edge Functions merely to proxy every ordinary database
query. Use PostgreSQL functions for transactional database work where
appropriate.

Exact Edge Function use cases are **TBD**.

### 12.6 Privileged credentials

The Supabase service-role key must never be exposed to the browser. Any
privileged operation must run in a trusted server-side environment and
must validate the caller and requested action.

------------------------------------------------------------------------

## 13. Data Flow Architecture

### 13.1 Standard read flow

``` text
React component
      |
      v
Feature TanStack Query hook
      |
      v
Feature API/service function
      |
      v
Centralized Supabase client
      |
      v
PostgreSQL + RLS
      |
      v
Query result
      |
      v
TanStack Query cache
      |
      v
React component renders data
```

### 13.2 Standard write flow

``` text
User action
    |
    v
React component
    |
    v
Feature mutation hook
    |
    v
Feature API/service function
    |
    v
Supabase client
    |
    v
PostgreSQL validation, RLS and constraints
    |
    v
Committed result or error
    |
    v
TanStack Query cache update/invalidation
    |
    v
Updated UI
```

### 13.3 Realtime flow

``` text
PostgreSQL change
    |
    v
Supabase Realtime
    |
    v
Feature subscription
    |
    v
TanStack Query cache update/invalidation
    |
    v
React UI refresh
```

### 13.4 Authentication flow

``` text
Management Login
      |
      v
Supabase Auth
      |
      v
Authenticated session
      |
      +------> Redux authentication representation
      |
      v
Retrieve application profile and role
      |
      v
Role-aware route navigation
      |
      v
Database requests independently checked by RLS
```

------------------------------------------------------------------------

## 14. Loading, Caching, and UI State Architecture

### 14.1 Server loading states

TanStack Query will provide server-query and mutation state.

Features should render appropriate states for:

-   Initial loading.
-   Background refetching.
-   Successful data.
-   Empty results.
-   Query errors.
-   Mutation pending state.
-   Mutation success or failure.

### 14.2 UI loading patterns

Use suitable loading patterns for the context:

-   Skeletons for page or content regions where layout is known.
-   Small inline indicators for local actions.
-   Disabled submit/action controls while a mutation is pending.
-   Clear empty states when a successful query returns no records.

Do not display a full-page loader for every small background refetch.

### 14.3 Query caching

TanStack Query owns server-data caching.

Query keys should be organized consistently by feature and resource.
Mutations and Realtime handlers must update or invalidate the relevant
keys.

Exact `staleTime`, `gcTime`, refetch behavior, retry policy, and
persistence strategy are **TBD**.

------------------------------------------------------------------------

## 15. Performance Architecture

### 15.1 General approach

The application should be mobile-first and avoid loading unnecessary
code or data.

### 15.2 Planned techniques

-   Route-based code splitting and lazy loading where useful.
-   Avoid loading management-only features in the initial public
    experience when they are not needed.
-   Use TanStack Query caching to avoid unnecessary repeated requests.
-   Paginate or limit large data sets when required.
-   Select only the database fields needed by a screen.
-   Optimize images and use suitable image sizes.
-   Avoid unnecessary Realtime subscriptions.
-   Keep components focused and avoid unnecessary rerenders.
-   Monitor production bundle size and remove unused dependencies.

### 15.3 Decisions still TBD

-   Exact lazy-loading boundaries.
-   Image transformation and delivery strategy.
-   Pagination approach per feature.
-   Query cache timings.
-   Performance budgets and measurement tooling.
-   Whether any expensive statistics need database-side aggregation or
    materialized views.

------------------------------------------------------------------------

## 16. PWA Architecture

**Status: TBD**

The platform is intended to be mobile-first. Whether it will be
delivered as an installable Progressive Web App, and the required
offline behavior, have not yet been finalized.

The following decisions remain open:

-   Service worker implementation.
-   Installation support and install prompt behavior.
-   Offline support requirements.
-   Which assets or pages may be cached.
-   Whether tournament data should be available offline.
-   Cache invalidation and stale-data behavior.
-   Push notification requirements and delivery mechanism.

Do not assume full offline functionality or push notifications until
those requirements are explicitly confirmed.

------------------------------------------------------------------------

## 17. Error and Failure Handling Architecture

**Status: TBD --- strategy to be finalized**

The implementation should distinguish between:

-   Authentication errors.
-   Authorization/RLS errors.
-   Validation errors.
-   Database/network errors.
-   Realtime connection errors.
-   Unexpected application errors.

Expected architectural direction:

-   Service and query/mutation boundaries should expose useful errors.
-   Feature pages should show errors relevant to the failed operation.
-   A shared error boundary should catch unexpected React rendering
    errors.
-   Retry should be used only where retrying is safe and useful.
-   Failed mutations must not be presented as successful.
-   Network failures should leave the user with a clear state and a safe
    recovery path.
-   Realtime disconnection should not silently imply that displayed data
    is current.

Exact error message conventions, logging, monitoring, retry policy, and
global error UI are **TBD**.

------------------------------------------------------------------------

## 18. Security Boundaries

### 18.1 Frontend is not a security boundary

Route guards, hidden buttons, disabled controls, and Redux role values
are user-experience mechanisms. They do not authorize database access.

### 18.2 Database enforcement

-   Enable and configure RLS for tables exposed to the client.
-   Define policies based on trusted authenticated identity and database
    relationships.
-   Enforce manager-to-team restrictions in the database.
-   Enforce referee-to-match restrictions in the database.
-   Restrict public reads to explicitly public information.
-   Validate critical business rules in PostgreSQL.
-   Use constraints and transactional functions for allocation
    integrity.

### 18.3 Secret management

-   Never expose the Supabase service-role key in frontend code.
-   Never use a privileged secret in a `VITE_` environment variable.
-   Keep server-only secrets in trusted server-side environments such as
    Edge Function secrets.
-   Do not rely on client-submitted role or ownership identifiers as
    proof of permission.

### 18.4 Security documentation boundary

The complete permission matrix, RLS policy definitions, table-by-table
access rules, and security test cases belong in `SECURITY.md`.
Database-specific constraints and schema details belong in
`DATABASE.md`.

------------------------------------------------------------------------

## 19. Architectural Restrictions

The following are prohibited unless the project architecture is
explicitly revised.

  -----------------------------------------------------------------------
  Prohibited technology or approach   Reason
  ----------------------------------- -----------------------------------
  Express                             Supabase is the backend

  Separate Node.js backend            Not part of the selected
                                      architecture

  Firebase                            Supabase is the selected backend
                                      platform

  MongoDB                             PostgreSQL is the selected database

  JSON Server                         Not suitable as the production
                                      backend

  Prisma                              Not part of the selected database
                                      access architecture

  Separate authentication service     Supabase Auth is the authentication
                                      authority

  Separate storage service            Supabase Storage is selected

  External WebSocket infrastructure   Supabase Realtime is selected

  TypeScript                          Project is JavaScript

  Duplicating server records in Redux TanStack Query owns server-state
                                      caching

  UI-only enforcement of permissions  Database RLS and validation are
                                      required
  -----------------------------------------------------------------------

Do not add libraries or infrastructure without a concrete requirement
and an explicit architecture decision.

------------------------------------------------------------------------

## 20. Outstanding Architectural Decisions

The following items remain unresolved. They must be decided before the
relevant implementation work begins.

  -----------------------------------------------------------------------
  Area                    Outstanding decision    Status
  ----------------------- ----------------------- -----------------------
  Route design            Exact public and        TBD
                          dashboard URL paths     

  Authentication          Login method and        TBD
                          credential format       

  Authentication          Password reset and      TBD
                          account recovery flow   

  Authentication          Session expiry and      TBD
                          invalid-session UX      

  Authorization           Complete                TBD
                          role/feature/action     
                          permission matrix       

  Authorization           Exact role/profile      TBD
                          schema and trusted role 
                          lookup                  

  Authorization           Detailed RLS policies   TBD
                          and helper functions    

  Supabase integration    Exact API module        PROVISIONAL
                          boundaries as features  
                          are finalized           

  Realtime                Tables, events,         TBD
                          filters, and screens    
                          requiring subscriptions 

  Realtime                Reconnect and fallback  TBD
                          refetch behavior        

  Backend processing      Exact PostgreSQL        TBD
                          functions and triggers  

  Backend processing      Edge Function use cases TBD

  Allocation              Undo/reversal and       TBD
                          allocation history      
                          behavior                

  Error handling          Global and              TBD
                          feature-level error UI  

  Error handling          Retry, logging, and     TBD
                          monitoring strategy     

  Performance             Query cache timings and TBD
                          pagination rules        

  Performance             Image optimization and  TBD
                          performance budgets     

  PWA                     Service worker and      TBD
                          installation            
                          requirements            

  PWA                     Offline and push        TBD
                          notification            
                          requirements            
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 21. Related Documentation Boundaries

This file defines the technical architecture. It should not become a
duplicate of every project document.

  -----------------------------------------------------------------------
  Document                            Owns
  ----------------------------------- -----------------------------------
  `PROJECT_OVERVIEW.md`               Project purpose, scope, audience,
                                      and high-level context

  `REQUIREMENTS.md`                   Functional and non-functional
                                      requirements

  `FEATURES.md`                       Detailed feature behavior and
                                      workflows

  `DATABASE.md`                       Tables, columns, relationships,
                                      constraints, indexes, functions,
                                      triggers, and migrations

  `SECURITY.md`                       Permission matrix, RLS policies,
                                      security rules, and security
                                      testing

  `ARCHITECTURE.md`                   System structure, technology
                                      responsibilities, boundaries, and
                                      data flow
  -----------------------------------------------------------------------

When a detail belongs to another document, this file should describe the
architectural responsibility and refer to that document rather than
duplicating its full specification.

------------------------------------------------------------------------

## 22. Architecture Decision Summary

### Confirmed

1.  One React + Vite application.
2.  JavaScript, not TypeScript.
3.  Tailwind CSS.
4.  React Router DOM.
5.  Separate nested public, Super Admin, Manager, and Referee route
    groups.
6.  Separate layouts for public visitors and each management role.
7.  Centralized protected routes with role-based route checks.
8.  Redux Toolkit for global client-side state.
9.  TanStack Query for server state, fetching, caching, and mutations.
10. Supabase as the complete backend platform.
11. Supabase Auth as the authentication authority.
12. A centralized Supabase client.
13. Feature-based API/service modules and TanStack Query hooks.
14. Supabase Realtime for live synchronization.
15. PostgreSQL and RLS as the database security boundary.
16. Management login accessed through an options icon on the landing
    page.
17. Continue from the landing page opens the public tournament
    experience.
18. One shared management login entry for Super Admins, Managers, and
    Referees.
19. Management accounts are controlled by the Super Admin; no public
    management self-registration.
20. Player allocation must be transactional and validated at database
    level.
21. Vercel frontend deployment and Supabase backend deployment.

### Provisional

1.  Exact API/service module boundaries may be refined as features are
    finalized.
2.  Detailed role permissions and database authorization policies
    require the security specification.
3.  Specific PostgreSQL functions, triggers, and Edge Functions will be
    selected based on concrete workflows.

### TBD

All unresolved decisions are listed in Section 20.

------------------------------------------------------------------------

## 23. Implementation Gate

Application development should begin only after the architecture and
supporting project documents contain enough detail to implement each
feature safely.

Before implementation:

-   Resolve architecture decisions that affect the first development
    milestones.
-   Finalize the database schema and relationships in `DATABASE.md`.
-   Finalize functional behavior in `REQUIREMENTS.md` and `FEATURES.md`.
-   Finalize permissions and RLS policies in `SECURITY.md`.
-   Create and review database migrations.
-   Verify that critical operations, especially player allocation, are
    enforced transactionally in PostgreSQL.

**This document is the agreed architecture baseline, not permission to
begin coding before the remaining required planning decisions are
addressed.**
