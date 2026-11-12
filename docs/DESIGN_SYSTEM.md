# INSTITUTE FOOTBALL LEAGUE PLATFORM — DESIGN SYSTEM

**Document Status:** Confirmed Planning & Specification  
**Target Stage:** Pre-Development Design System Handoff  
**Related Documents:** `PROJECT_OVERVIEW.md`, `REQUIREMENTS.md`, `FEATURES.md`, `ARCHITECTURE.md`, `CODING_STANDARDS.md`, `DATABASE.md`

---

## 1. OVERVIEW & OVERALL DESIGN DIRECTION

### Confirmed Direction: Unified Premium Dark Sports UI

The Institute Football League Platform uses a **Unified Premium Dark Sports Theme** across every user role. The interface draws inspiration from professional football broadcasting platforms, modern sports applications, and premium analytics dashboards.

The entire application must maintain one consistent visual identity, regardless of user role.

**Visual Characteristics:**
- Pure graphite black backgrounds.
- Elevated dark surfaces with subtle borders.
- Electric Lime Green for important actions and selected states.
- Strong typography and clear information hierarchy.
- Large, prominent match scores and statistics.
- Minimal shadows and purposeful visual depth.
- Clean, compact, data-focused layouts.
- Mobile-first responsive design.
- Consistent components and interaction patterns across all roles.

### 1.1 Theme Application (CONFIRMED)

The Unified Premium Dark Theme applies to:

| User Role | Theme | Primary Interface |
|---|---|---|
| Public | Premium Dark Sports | Tournament website and live match broadcasting |
| Super Admin | Premium Dark Sports | Tournament management and control centre |
| Manager | Premium Dark Sports | Team management dashboard |
| Referee | Premium Dark Sports | Live match control and event management |

**Strict Theme Rules:**
- Every page must use the unified dark palette.
- Never generate white backgrounds or light-mode dashboards.
- Never introduce separate visual themes for different roles.
- Maintain consistent cards, buttons, inputs, typography, and navigation across the application.
- Role-specific differences must come from information hierarchy and functionality, not different color themes.

---

## 2. COLOR SYSTEM & DESIGN TOKENS

### 2.1 Brand Accent Color (CONFIRMED)

| Token | Hex Value | Usage |
|---|---|---|
| `brand-accent` | `#B8F34A` | Primary buttons, active navigation, selected tabs, important statistics, progress indicators and interactive highlights |

**Brand Accent Rules:**
- Use Electric Lime Green selectively for important visual emphasis.
- Do not apply lime to every element.
- Always use dark text (`#090909` or `#172019`) on lime-filled buttons.
- Never use lime as the default semantic success color.
- Maintain consistent accent usage across all user roles.

### 2.2 Unified Dark Theme Palette (CONFIRMED)

| Token | Hex Value | Role / Surface |
|---|---|---|
| `app-bg-main` | `#090909` | Main application background |
| `app-bg-card` | `#141414` | Standard cards, panels and containers |
| `app-bg-secondary` | `#202020` | Inputs, inner surfaces, dropdowns and secondary elements |
| `app-border` | `#303030` | Borders, dividers and component boundaries |
| `app-text-primary` | `#F4F7F2` | Primary headings, body text, team names and scores |
| `app-text-secondary` | `#9AA69B` | Supporting text, timestamps, labels and metadata |
| `app-accent` | `#B8F34A` | Electric Lime Green brand accent |
| `app-live` | `#FF414D` | Live match indicators, active match clocks and live badges |

### 2.3 Semantic Status Colors (CONFIRMED)

| Status | Token | Hex Value | Application |
|---|---|---|---|
| Success | `status-success` | `#22C55E` | Completed, approved, saved and available |
| Warning | `status-warning` | `#F59E0B` | Pending actions and attention required |
| Error | `status-error` | `#EF4444` | Rejected, failed and destructive actions |
| Information | `status-info` | `#3B82F6` | Informational notices and neutral messages |
| Live | `status-live` | `#FF414D` | Currently running matches |
| Brand | `status-brand` | `#B8F34A` | Primary actions and selected interface states |

**Semantic Color Rules:**
- Never communicate status through color alone.
- Pair status colors with readable text labels or Lucide icons.
- Use subtle tinted backgrounds for status badges.
- Verify text contrast against the dark card surface (`#141414`).
- Maintain clear visual distinction between success, warning, error and live states.

### 2.4 Standard Component Color Applications

**Cards:**
- Background: `#141414`
- Border: `#303030`
- Text: `#F4F7F2`

**Inputs:**
- Background: `#202020`
- Border: `#303030`
- Text: `#F4F7F2`
- Placeholder: `#9AA69B`

**Primary Buttons:**
- Background: `#B8F34A`
- Text: `#090909`

**Secondary Buttons:**
- Background: `#202020`
- Border: `#303030`
- Text: `#F4F7F2`

---

## 3. TYPOGRAPHY

### Confirmed Font Family: Inter

Use `Inter` throughout the entire application.

### 3.1 Typography Scale

| Element | Size Range | Weight | Usage |
|---|---|---|---|
| Display Headings | `36px–48px` | 700 | Hero scores and tournament banners |
| Page Headings (H1) | `28px–32px` | 600–700 | Main screen titles |
| Section Headings (H2) | `20px–24px` | 600 | Dashboard sections and major panels |
| Card Headings (H3) | `16px–18px` | 500–600 | Individual card titles |
| Body Text | `14px–16px` | 400–500 | Interface copy, tables and inputs |
| Supporting Text | `12px–14px` | 400–500 | Captions, timestamps and helper text |

### 3.2 Typography Rules

- Allowed font weights: Regular (`400`), Medium (`500`), Semibold (`600`) and Bold (`700`).
- Load only the four specified weights.
- Apply `tabular-nums` to live scores, match clocks, timers, standings and player statistics.
- Use uppercase, letter-spaced supporting headings for compact dashboard section labels.
- Maintain readable line heights and avoid unnecessarily small text.
- Scale headings responsively for mobile and desktop.

**Important Tailwind conventions:**

- Page titles: `text-2xl font-bold text-[#F4F7F2]`
- Section labels: `text-xs font-bold tracking-wider text-[#9AA69B] uppercase`
- Body text: `text-sm text-[#F4F7F2]`
- Supporting text: `text-xs text-[#9AA69B]`
- Match scores: `font-bold tabular-nums`

---

## 4. SPACING SYSTEM

### Confirmed Scale: 4px Base Unit

| Token | Value | Tailwind Equivalent |
|---|---|---|
| `space-1` | `4px` | `p-1`, `gap-1` |
| `space-2` | `8px` | `p-2`, `gap-2` |
| `space-3` | `12px` | `p-3`, `gap-3` |
| `space-4` | `16px` | `p-4`, `gap-4` |
| `space-5` | `20px` | `p-5`, `gap-5` |
| `space-6` | `24px` | `p-6`, `gap-6` |
| `space-8` | `32px` | `p-8`, `gap-8` |
| `space-10` | `40px` | `p-10`, `gap-10` |
| `space-12` | `48px` | `p-12`, `gap-12` |
| `space-16` | `64px` | `p-16`, `gap-16` |

**Spacing Rules:**
- Prefer `8px`, `12px` and `16px` for compact mobile interfaces.
- Use `16px` card padding as the standard.
- Use consistent `gap-3` or `gap-4` inside cards.
- Avoid unnecessarily large empty spaces in management dashboards.
- Never shrink interactive touch targets below `44 × 44px`.
- Avoid arbitrary spacing values outside the defined scale unless genuinely necessary.

---

## 5. RESPONSIVE DESIGN & BREAKPOINTS

### 5.1 Confirmed Breakpoints (Mobile-First)

| Device Tier | Width | Layout Behavior |
|---|---|---|
| Mobile | `< 640px` | Single-column layouts, touch-friendly controls and fixed bottom navigation |
| Tablet | `640px–1023px` | Adaptive two-column layouts and collapsible navigation |
| Desktop | `1024px–1279px` | Full dashboard layouts with persistent sidebar |
| Wide Desktop | `>= 1280px` | Expanded control centres and broadcast layouts |

### 5.2 Responsive Design Rules

Never simply shrink desktop layouts to fit smaller screens. Adapt the component hierarchy and information density.

**Public Home:**
- Mobile: Stacked tournament sections and compact match cards.
- Desktop: Multi-column broadcast layout featuring live matches, fixtures and standings.

**Public Live Match:**
- Mobile: Compact scoreboard, stacked events and accessible match statistics.
- Desktop: Expanded scoreboard with side-by-side event timeline and statistics.

**Referee Controls:**
- Mobile: Large touch-friendly match controls and simplified event history.
- Desktop: Wider control panel with full event history and player selection.

**Manager Dashboard:**
- Mobile: Stacked match summary, statistics and squad information.
- Desktop: Multi-panel dashboard with wider tables and statistics.

**Super Admin:**
- Mobile: Prioritized action cards and simplified management workflows.
- Desktop: Full control centre with allocation wheels, fixture matrices and administrative panels.

---

## 6. NAVIGATION SYSTEM

### 6.1 Hybrid Navigation Architecture (CONFIRMED)

The navigation structure remains role-specific and responsive. The visual appearance of every navigation component must follow the unified dark theme.

**Desktop (`>= 1024px`):**
- Persistent left sidebar.
- Persistent top navigation bar.
- Main scrollable content area.
- Sidebar displays primary role navigation.
- Top bar displays page context, notifications and account controls.

**Tablet (`640px–1023px`):**
- Collapsible sidebar or drawer.
- Persistent top navigation bar.
- Main content adapts to available width.

**Mobile (`< 640px`):**
- Compact top navigation bar.
- Fixed bottom navigation.
- Maximum five primary navigation destinations.
- Support `env(safe-area-inset-bottom)`.
- Main application content must include sufficient bottom padding to prevent overlap with navigation (`pb-24` as the default mobile utility).

### 6.2 Navigation Visual Specifications

**Bottom Navigation:**
- Position: `fixed bottom-0 w-full z-50`
- Background: `#090909`
- Top border: `#303030`
- Active icon and label: `#B8F34A`
- Inactive icon and label: `#9AA69B`
- Icons: `lucide-react`, normally `20px–24px`.

**Sidebar:**
- Background: `#090909`
- Border: `#303030`
- Active navigation item: subtle lime-tinted background with lime icon and text.
- Inactive navigation item: muted text and icons.
- Clear grouping of primary and secondary destinations.

### 6.3 Role-Specific Mobile Bottom Navigation (CONFIRMED)

| Role | Slot 1 | Slot 2 | Slot 3 | Slot 4 | Slot 5 |
|---|---|---|---|---|---|
| Super Admin | Home | Players | Teams | Matches | More |
| Manager | Home | Squad | Matches | Statistics | More |
| Referee | Match | Events | History | More | — |

**Navigation Rules:**
- These are UI navigation structures, not security permissions.
- Actual access must be enforced through Supabase authentication, application authorization and RLS.
- Secondary destinations should be grouped under More.
- Prioritize the referee's active match workflow.

---

## 7. ICONOGRAPHY, BORDER RADIUS & SHADOWS

### 7.1 Icon Library: Lucide React (CONFIRMED)

Use `lucide-react` exclusively.

| Usage | Icon Size |
|---|---|
| Compact controls and inline badges | `16px` |
| Standard buttons, inputs and controls | `18px–20px` |
| Sidebar and bottom navigation | `20px–22px` |
| Large feature and empty-state icons | `24px–32px` |

**Icon Rules:**
- Never mix multiple icon libraries.
- Never use emojis as functional interface icons.
- Maintain consistent stroke width (`1.75px–2px`).
- Provide accessible labels for icon-only buttons.
- Import only the icons required by individual components.

### 7.2 Border Radius: Modern Balanced (CONFIRMED)

| Component | Radius | Tailwind Equivalent |
|---|---|---|
| Modals | `16px` | `rounded-2xl` |
| Cards | `12px` | `rounded-xl` |
| Buttons | `8px` | `rounded-lg` |
| Inputs and Selects | `8px` | `rounded-lg` |
| Dropdown Menus | `8px` | `rounded-lg` |
| Small Elements and Tags | `6px` | `rounded-md` |
| Badges and Pills | Fully rounded | `rounded-full` |

### 7.3 Shadow System: Minimal Elevation (CONFIRMED)

The interface must rely primarily on background differences and subtle borders rather than heavy shadows.

| Component | Visual Treatment |
|---|---|
| Standard Cards | `#141414` background + `#303030` border |
| Inner Surfaces | `#202020` background |
| Hovered Cards | Subtle background or border transition |
| Dropdowns | Subtle elevation where necessary |
| Modals | Controlled shadow with clear surface separation |

**Rules:**
- Avoid excessive drop shadows.
- Avoid glowing lime effects around ordinary components.
- Use borders and surface contrast to establish hierarchy.
- Reserve stronger shadows for important overlays only.

---

## 8. MOTION, ANIMATION & PERFORMANCE

### 8.1 Animation Timing

| Interaction | Duration |
|---|---|
| Button Hover / Press | `120ms–160ms` |
| Navigation Transitions | `150ms–200ms` |
| Dropdowns and Popovers | `150ms–200ms` |
| Card Interactions | `180ms–220ms` |
| Modal Entrance / Exit | `180ms–240ms` |
| Page Transitions | `180ms–250ms` |

### 8.2 Animation Rules

- Prefer `transform` and `opacity` animations.
- Avoid repeatedly animating layout properties.
- Avoid unnecessary decorative animations.
- Use a restrained pulse animation for the live match indicator.
- Avoid heavy backdrop blur effects.
- Respect `prefers-reduced-motion`.
- Referee and administrative controls must remain immediately responsive during visual transitions.

### 8.3 Performance Standards

**Core Web Vitals Targets:**

| Metric | Target |
|---|---|
| LCP | `<= 2.5 seconds` |
| INP | `<= 200ms` |
| CLS | `<= 0.1` |

**Rendering and State Management:**
- Use TanStack Query for server-state fetching, caching and synchronization.
- Use Redux Toolkit for appropriate shared client state.
- Isolate Supabase Realtime subscriptions for live scores, clocks and match events.
- Avoid unnecessary parent component re-renders.
- Lazy-load route-level components using React.lazy and Suspense.
- Explicitly define image dimensions or aspect ratios to prevent layout shifts.
- Import individual Lucide icons rather than unnecessary library modules.

---

## 9. ACCESSIBILITY STANDARDS (WCAG 2.2 LEVEL AA)

### Confirmed Requirements

**Text Contrast:**
- Minimum `4.5:1` for normal text.
- Minimum `3:1` for large text.

**Non-Text Contrast:**
- Minimum `3:1` for meaningful UI boundaries and graphical controls.

**Touch Targets:**
- Minimum `44 × 44px` interactive hit areas.
- Maintain adequate spacing between adjacent controls.

**Keyboard and Focus:**
- All interactive elements must be keyboard accessible.
- Support `Tab` and `Shift+Tab`.
- Provide visible `:focus-visible` indicators.
- Use `#B8F34A` focus indicators on dark surfaces with adequate contrast.

**Forms and Semantics:**
- Use semantic HTML landmarks.
- Every input must have a persistent associated label.
- Associate validation messages using `aria-describedby`.
- Use `aria-invalid` for invalid fields.
- Maintain accessible modal focus management.

**Important:** The lime accent is not automatically suitable for every text or background combination. Verify actual contrast ratios instead of assuming the brand color magically solves accessibility.

---

## 10. STANDARD COMPONENT SPECIFICATIONS

### 10.1 Cards

**Standard Style:**

`bg-[#141414] border border-[#303030] rounded-xl p-4`

Specifications:
- Standard radius: `12px`.
- Standard padding: `16px`.
- Consistent internal spacing: `gap-3` or `gap-4`.
- Primary text: `#F4F7F2`.
- Supporting text: `#9AA69B`.

**Nesting Rules:**
- Avoid excessive nested cards.
- Use background differences to distinguish inner sections.
- Keep component hierarchy visually flat and readable.

### 10.2 Buttons

**Primary Button:**

`bg-[#B8F34A] text-[#090909] font-semibold rounded-lg px-4 py-2`

**Secondary Button:**

`bg-[#202020] text-[#F4F7F2] border border-[#303030] rounded-lg px-4 py-2`

**Destructive Button:**

`bg-transparent border border-[#FF414D] text-[#FF414D] rounded-lg`

**Button Rules:**
- Primary actions use Electric Lime Green.
- Secondary actions use elevated dark surfaces.
- Destructive actions use clear error styling.
- Irreversible operations require confirmation.
- Use subtle hover and pressed states.
- Disabled buttons use reduced opacity.
- Loading states must prevent duplicate submissions.

### 10.3 Status Badges

**Live:**
- Red indicator dot (`#FF414D`).
- Red text.
- Restrained pulse animation.

**Pending:**
- Background: `#F59E0B` at approximately 10% opacity.
- Text: `#F59E0B`.

**Unassigned:**
- Background: `#FF414D` at approximately 10% opacity.
- Text: `#FF414D`.

**Completed:**
- Background: `#202020`.
- Border: `#303030`.
- Text: `#B8F34A`.

**Standard Badge:**

`px-2 py-1 rounded text-xs font-bold`

### 10.4 Forms and Inputs

- Background: `#202020`.
- Border: `#303030`.
- Text: `#F4F7F2`.
- Radius: `8px`.
- Minimum mobile height: `44px`.
- Persistent labels above inputs.
- Clear focus and validation states.
- Error borders: `#EF4444`.
- Disabled fields must have distinguishable styling.

### 10.5 Tables

- Use consistent column alignment.
- Left-align player names and team names.
- Right-align or center-align numerical values.
- Apply `tabular-nums` to statistical columns.
- Use subtle row separators.
- Maintain consistent row heights.
- Use horizontally scrollable containers or structured summary cards on mobile.
- Avoid excessive borders and unnecessary visual decoration.

### 10.6 Modals and Dropdowns

**Modals:**
- Radius: `16px`.
- Background: `#141414`.
- Border: `#303030`.
- Controlled shadow.
- Keyboard focus trap.
- Escape key support where appropriate.
- Clear primary and secondary actions.

**Dropdowns:**
- Background: `#202020`.
- Border: `#303030`.
- Radius: `8px`.
- Keyboard navigation support.
- Clear hover and selected states.

### 10.7 Mandatory Interface Feedback States

Every data-driven screen and component must explicitly handle:

1. Loading — Skeletons or appropriate loading indicators.
2. Empty — Clear explanation and next action where applicable.
3. Success — Confirmation of completed operations.
4. Warning — Pending actions and important notices.
5. Error — Human-readable explanation and recovery action.
6. Disabled / Unavailable — Clear indication that an action cannot currently be performed.
7. Offline / Reconnecting — Connection status, especially on referee and live match screens.

---

## 11. ROLE-SPECIFIC INTERFACE & INFORMATION HIERARCHY

All roles use the same Premium Dark Sports visual language. Their layouts and information priorities differ according to their responsibilities.

### 11.1 Public Home

**Theme:** Premium Dark Sports.

Information priority:

1. Tournament branding and identity.
2. Public navigation.
3. Live match highlight with prominent scoreboard and red LIVE indicator.
4. Today's fixtures.
5. Group standings with tabular numerical alignment.
6. Teams and players directory.

### 11.2 Public Live Match

**Theme:** Premium Dark Sports.

Information priority:

1. Match status badge (`LIVE`, `HT`, `FT` or scheduled time).
2. Team names and crests.
3. Prominent live score (`36px–48px`).
4. Match clock and period indicator.
5. Chronological match events timeline.
6. Match statistics comparison.

### 11.3 Referee Match Control

**Theme:** Premium Dark Sports.

Information priority:

1. Assigned match header and connection status.
2. Large, touch-friendly score controls.
3. Match clock and period controls.
4. Goal and card event logging triggers.
5. Fast player selection workflow.
6. Chronological event history with edit/undo capability.
7. Save progress action.
8. Finish match action with confirmation.

**Critical UI Requirements:**
- Match controls must be immediately accessible.
- Prioritize active match information over secondary statistics.
- Goal and card controls must have minimum `44 × 44px` hit areas.
- Prevent accidental duplicate event submissions.
- Make connection and synchronization states clearly visible.

### 11.4 Manager Dashboard

**Theme:** Premium Dark Sports.

Information priority:

1. Team identity header.
2. Next match summary card.
3. Previous result summary.
4. Season form indicator.
5. Team statistics overview.
6. Squad information and player roster table.

**Critical UI Requirements:**
- Make team identity immediately recognizable.
- Prioritize upcoming matches.
- Present squad information in an easily readable layout.
- Keep team statistics compact and accessible.

### 11.5 Super Admin Control Centre

**Theme:** Premium Dark Sports.

Information priority:

1. Tournament overview metrics.
2. Pending administrative actions and alerts.
3. Player allocation progress tracker.
4. Goalkeeper spin wheel workflow.
5. Outfield player spin wheel workflow.
6. Fixture management matrix and scheduling controls.
7. Global administrative and system controls.

**Critical UI Requirements:**
- Keep goalkeeper and outfield player allocation workflows strictly separated.
- Present important administrative actions prominently.
- Make tournament progress immediately visible.
- Maintain clear distinctions between completed, pending and unassigned states.
- Avoid overcrowding the dashboard with unnecessary cards.

---

## 12. DATA VISUALIZATION & INTERFACE WRITING

### 12.1 Data Visualization Rules

- Always provide meaningful chart labels and units.
- Never rely exclusively on color to distinguish data.
- Use legends, direct value labels or other visual distinctions.
- Keep critical statistics visible without requiring hover.
- Simplify charts on mobile (`< 640px`).
- Remove purely decorative charts that do not provide useful information.
- Use consistent numerical formatting.

### 12.2 Interface Writing Rules

Use concise, descriptive labels and action-oriented buttons.

**Preferred Examples:**
- `Record Goal`
- `Allocate Goalkeeper`
- `Publish Fixtures`
- `Save Match Progress`
- `Finish Match`

Avoid vague labels such as:
- `Submit`
- `OK`
- `Click Here`

Maintain consistent terminology across all roles and follow the naming conventions established in `REQUIREMENTS.md` and `DATABASE.md`.

Error messages must explain:
1. What went wrong.
2. Why it happened when known.
3. How the user can resolve it.

---

## 13. TECHNICAL STACK ALIGNMENT (STRICT CONSTRAINTS)

All design system implementations must operate within the confirmed technical stack.

**Frontend:**
- React
- Vite
- JavaScript (ES6+)
- Tailwind CSS
- React Router DOM
- Redux Toolkit
- TanStack Query
- Supabase JS
- Lucide React

**Backend and Platform:**
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions
- PostgreSQL Functions and Triggers
- Row Level Security (RLS)

**Deployment:**
- Frontend: Vercel
- Backend and database: Supabase

### 13.1 Strict Implementation Rules

1. JavaScript only. Never introduce TypeScript.
2. Use Tailwind utility classes for component styling.
3. Do not create separate custom CSS files unless explicitly required.
4. Avoid heavy third-party UI libraries that conflict with the design system.
5. Use Lucide React exclusively for interface icons.
6. Do not introduce Express, Firebase, MongoDB or Prisma.
7. Do not introduce a separate custom backend.
8. Preserve the existing Supabase architecture.
9. Prefer reusable, small and maintainable React components.
10. Keep styling consistent through reusable component patterns and shared design tokens.

### 13.2 Antigravity AI Implementation Instructions

When generating or modifying frontend components:

- Follow this `DESIGN_SYSTEM.md` strictly.
- Use the Premium Dark Sports theme for every role.
- Never generate white backgrounds or light-mode dashboards.
- Use the specified hexadecimal colors instead of unrelated default Tailwind colors.
- Follow the established card, button, badge, input and navigation specifications.
- Use consistent spacing and border radii.
- Avoid unnecessary nested containers and cards.
- Ensure all layouts are responsive.
- Maintain consistent row alignment in tables, fixtures and player lists.
- Preserve existing working functionality when modifying components.
- Do not introduce unnecessary abstractions or oversized components.
- Do not modify backend functionality when the task only concerns UI.
- Prioritize readability, maintainability, accessibility and performance.

**Styling Reference:**

Standard card:

`bg-[#141414] border border-[#303030] rounded-xl p-4`

Standard primary button:

`bg-[#B8F34A] text-[#090909] font-semibold rounded-lg px-4 py-2`

Standard secondary button:

`bg-[#202020] text-[#F4F7F2] border border-[#303030] rounded-lg px-4 py-2`

Standard page background:

`bg-[#090909]`

---

## 14. FINAL DECISION REGISTER & ADJUSTABLE VALUES

### 14.1 Confirmed Decisions Register

| Decision Area | Specification | Status |
|---|---|---|
| Theme Architecture | Unified Premium Dark Sports UI across all roles | CONFIRMED |
| Public Theme | Pure Graphite Dark (`#090909`, `#141414`, `#202020`, `#303030`) | CONFIRMED |
| Super Admin Theme | Same Unified Premium Dark Theme | CONFIRMED |
| Manager Theme | Same Unified Premium Dark Theme | CONFIRMED |
| Referee Theme | Same Unified Premium Dark Theme | CONFIRMED |
| Brand Accent | Electric Lime Green (`#B8F34A`) | CONFIRMED |
| Primary Text | Off-White (`#F4F7F2`) | CONFIRMED |
| Secondary Text | Light Gray (`#9AA69B`) | CONFIRMED |
| Live Indicator | Crimson Red (`#FF414D`) | CONFIRMED |
| Semantic Colors | Success, Warning, Error, Info and Live | CONFIRMED |
| Typography | Inter, weights 400, 500, 600 and 700 | CONFIRMED |
| Numerical Typography | `tabular-nums` for scores and statistics | CONFIRMED |
| Spacing System | 4px-based spacing scale | CONFIRMED |
| Responsive System | Mobile-first: 640px, 1024px and 1280px | CONFIRMED |
| Desktop Navigation | Persistent Left Sidebar + Top Bar | CONFIRMED |
| Tablet Navigation | Collapsible Sidebar/Drawer + Top Bar | CONFIRMED |
| Mobile Navigation | Fixed Bottom Navigation + Compact Top Bar | CONFIRMED |
| Icon Library | Lucide React exclusively | CONFIRMED |
| Border Radius | Modern Balanced: Cards 12px, Buttons 8px, Modals 16px | CONFIRMED |
| Shadow Direction | Minimal shadows, subtle borders and surface contrast | CONFIRMED |
| Motion Direction | Restrained animations, 120ms–250ms | CONFIRMED |
| Accessibility | WCAG 2.2 Level AA target | CONFIRMED |
| Touch Targets | Minimum 44 × 44px | CONFIRMED |
| Core Web Vitals | LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 | CONFIRMED |
| Component Styling | Tailwind utility classes | CONFIRMED |

### 14.2 Adjustable Implementation Values

The following values may be fine-tuned during frontend implementation without changing the confirmed visual direction:

1. Exact CSS shadow values for exceptional overlay components.
2. Exact animation easing curves within the confirmed duration ranges.
3. Responsive typography scaling within the established font-size ranges.
4. Page-specific maximum container widths (`1280px`, `1440px` or other appropriate values).
5. Exact responsive grid column counts for individual screens.
6. Component-specific internal spacing where usability requires adjustment.

Any adjustment must preserve the unified Premium Dark Sports identity.

---

## 15. FINAL DESIGN PRINCIPLE

The Institute Football League Platform must feel like one professionally designed sports application, not four unrelated dashboards.

Every role shares the same visual identity, colors, typography, component styling and interaction patterns.

The difference between Public, Super Admin, Manager and Referee interfaces must come from their responsibilities, information hierarchy and available functionality.

**One Platform. One Design Language. Four Role-Specific Experiences.**