Lumo Project Rules

Stack

* Expo
* Expo Router
* React Native
* TypeScript
* NativeWind
* Zustand
* MMKV

⸻

Architecture Rules

ALWAYS use:

* modular feature-first architecture
* reusable UI primitives
* thin screens
* repository pattern
* local-first state

NEVER:

* create giant files
* create giant Zustand stores
* hardcode colors or spacing
* place business logic directly inside screens
* use inline styling excessively

⸻

Folder Structure

src/
├── app/
├── components/
├── features/
├── hooks/
├── services/
├── store/
├── theme/
├── types/
├── utils/
└── constants/

⸻

Navigation Rules

Use Expo Router.

Primary tabs only:

* Dashboard
* Tasks
* Calendar
* Health
* More

Avoid excessive top-level navigation.

⸻

UI Rules

All styling must:

* use NativeWind
* use theme tokens
* preserve spacing consistency
* preserve visual calmness

Design language:

* cinematic
* premium
* soft gradients
* breathable layouts
* minimal
* low cognitive load

⸻

Component Rules

Prefer:

* composition
* reusable primitives
* modular sections

Avoid:

* giant reusable “super components”
* massive JSX files
* duplicated UI patterns

⸻

State Rules

Separate stores by domain.

GOOD:

useTaskStore
useHabitStore
useBudgetStore

BAD:

useAppStore

Use local state for:

* forms
* toggles
* modal visibility
* temporary UI state

⸻

Screen Rules

Screens should orchestrate components only.

GOOD:

<DashboardHeader />
<TodayFocus />
<WeeklyProgress />

BAD:

800+ lines of JSX and logic

⸻

Performance Rules

Use FlashList for scalable lists.

Memoize list items properly.

Avoid unnecessary re-renders.

⸻

UX Priorities

Prioritize:

* low cognitive load
* predictable layouts
* visible actions
* progressive disclosure
* calm spacing
* focused interactions

Avoid:

* clutter
* modal overload
* hidden gestures
* dense dashboards
* deep nesting

⸻

Development Workflow

Build order:

1. architecture
2. theme system
3. UI primitives
4. shell screens
5. feature logic
6. persistence
7. backend later

DO NOT build backend yet.
DO NOT build auth yet.
DO NOT optimize prematurely.