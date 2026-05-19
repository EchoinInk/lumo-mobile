# Changelog

## Phase 8 — Performance Architecture

### Added
- FlashList infrastructure with AppFlashList wrapper component
- Reusable list primitives (ListEmptyState, ListLoadingState, ListSeparator, MemoizedListItem)
- Memoization utilities (useStableCallback, useMemoizedValue, useListOptimization hooks)
- Optimized task list architecture using AppFlashList
- Performance hooks for stable callbacks and list optimization
- Rendering guidelines documentation (docs/performance-guidelines.md)

### Improved
- Scalable rendering architecture with FlashList standardization
- Virtualization defaults with estimatedItemSize and removeClippedSubviews
- List rendering stability through memoized components and stable callbacks
- Screen composition standards with thin orchestration pattern
- TaskRow component with React.memo and custom comparison function

### Fixed
- Excessive inline callback rendering risks through useStableCallback
- Potential large-list re-render bottlenecks with FlashList virtualization
- Oversized screen component structures through component extraction

## [SWE-1.6] - UX & Accessibility Foundation

### Added
- UX constraint system (src/constants/ux.ts) with token-backed values for touch targets, animation durations, spacing rhythm, content constraints, hierarchy depth, card density, form constraints, reduced motion defaults, interaction timing, focus behavior, and typography constraints
- Accessibility utility helpers (src/utils/accessibility.ts) with functions for touch target sizing, accessible labels, semantic roles, reduced motion detection, screen reader detection, accessibility props creation, font scaling, focus management, announcements, animation duration handling, press state styling, label validation, heading structure, and platform-specific adjustments
- Motion token system (src/theme/motion.ts) with duration values, easing curves, reduced motion variants, scale values, opacity values, and transition priorities
- Reduced motion hook (src/hooks/useReducedMotion.ts) for detecting and responding to system reduced motion preferences
- Form UX primitives (src/components/forms/FormSection.tsx, FormField.tsx) with accessible form section wrapper and accessible text input with error states
- Neurodivergent UX guidelines (docs/UX_GUIDELINES.md) documenting spacing rules, interaction rules, accessibility standards, motion rules, hierarchy rules, form design standards, dashboard density rules, and navigation simplicity rules

### Updated
- Screen component (src/components/ui/Screen.tsx) with centered variant, keyboardShouldPersistTaps, accessibility props, content width constraint from UX tokens, and improved accessibility behavior
- Button component (src/components/ui/Button.tsx) with accessibilityRole, accessibilityLabel and accessibilityHint support, reduced motion support, minimum 44x44 touch targets for all sizes, improved pressed states, proper accessibility state for disabled and loading states, and accessible loading indicator
- Card component (src/components/ui/Card.tsx) with new interactive and compact variants, accessibility labels, reduced motion support, improved press states, and accessibilityRole for pressable cards

### Accessibility
- Minimum 44x44 touch targets enforced across all interactive components
- Semantic accessibility roles (button, header, text, adjustable) implemented
- Reduced motion handling integrated with useReducedMotion hook and motion token system
- Predictable focus behavior with keyboardShouldPersistTaps and logical focus order
- Improved screen reader support with proper accessibilityLabel, accessibilityHint, and accessibilityState props
- Accessible form components with clear labels, error states, and keyboard behavior
- Focus ring styling defined in UX constraints for clear visual feedback

### Architecture
- All UX values are token-backed using existing design token system
- Accessibility helpers provide reusable utilities for consistent implementation
- Motion system prioritizes state clarity (P0) over delight (P1)
- Form components follow neurodivergent-first principles with calm spacing and clear hierarchy
- Reduced motion support is integrated at the component level with hook-based detection

## [Phase 6] - Local-First Data Architecture

### Added
- Repository pattern with shared contracts (IRepository.ts)
- Task repository interface (ITaskRepository)
- MMKV storage layer with proper initialization (mmkv.ts)
- Task local repository with MMKV persistence (taskLocalRepository.ts)
- Feature-level task Zustand store with repository integration
- Task hooks for UI integration (useTasks.ts)
- Task utility helpers (taskHelpers.ts)
- Repository factory for centralized ownership
- Neurodivergent-friendly seed data with realistic examples
- Enhanced task types (TaskStatus, CreateTaskInput, UpdateTaskInput)
- Storage keys constants for namespaced MMKV storage

### Changed
- Refactored task architecture to repository pattern
- Migrated task store from global to feature-level (src/features/tasks/store/)
- Migrated persistence ownership from components to repository layer
- Refactored TasksScreen to thin orchestration with hooks
- Replaced direct store access with hook abstraction
- Updated mock data to be neurodivergent-friendly
- Isolated MMKV storage operations to dedicated service layer

### Architecture
- Adopted local-first data strategy with MMKV persistence
- Established scalable repository abstraction for future backend migration
- Isolated persistence layer from UI components
- Implemented feature-first domain structure with clear boundaries
- Separated concerns: repositories (data), stores (state), hooks (UI), screens (orchestration)
- Created reusable generic repository interface for all domains
- Centralized repository ownership via factory pattern

### Performance
- Optimized for FlashList usage with stable callbacks
- Memoized task filtering and sorting operations
- Isolated re-renders through feature-level stores
- Prepared architecture for scalable task lists

### Notes
- Tasks feature is now fully local-first with MMKV persistence
- Future backend migration requires minimal UI changes (swap repository in factory)
- All components follow strict separation of concerns
- No backend integration added (as per Phase 6 requirements)
- Architecture scales cleanly for habits, meals, budget, and other features

## [Phase 5 - Step 2: Task Feature Foundation]

### Added
- Created task type definitions (Task, TaskPriority, TaskFilter) in features/tasks/types/task.ts
- Created TaskRow component with custom checkbox, priority badges, and completion styling
- Created TaskList component using FlashList for performant rendering
- Created TaskFilterPills component with horizontal scroll for filtering tasks
- Created TaskSection component as reusable section wrapper with subtitle support
- Created AddTaskButton component using FloatingActionButton with lucide-react-native Plus icon
- Created EmptyTasks component with contextual empty states based on filter
- Refactored TasksScreen to orchestrate modular task components
- Integrated useTaskStore for task state management
- Added mock data initialization from mockTasks

### Changed
- TasksScreen now uses composition pattern with dedicated task components
- Replaced inline task rendering with TaskRow and TaskList components
- Simplified TasksScreen from 132 lines to 83 lines through component extraction
- Added filtering logic (all, active, completed, high, medium, low)
- Added task completion toggle functionality
- Improved separation of concerns - screen orchestrates, components render

### Architecture Decisions
- Task components follow feature-first organization in features/tasks/components/
- Type definitions centralized in features/tasks/types/task.ts
- Custom checkbox implementation using TouchableOpacity to avoid missing UI primitive
- FlashList used for scalable task list performance
- Local component state for filter selection (UI state pattern)
- Store state for task data (domain state pattern)
- Mock data seeding on mount for development
- Token-backed styling maintained throughout all new components

### Fixed
- Fixed FlashList prop error by removing unsupported estimatedItemSize
- Fixed TaskSection to properly wrap children content

## [Phase 5 - Step 1: Dashboard Implementation]

### Added
- Created DashboardHeader component with greeting and avatar
- Created TodayFocusCard component wrapping FocusCard for dashboard-specific focus display
- Created QuickActions component with lucide-react-native icons (Plus, Clock, CheckCircle, FileText)
- Created WeeklyProgress component wrapping ProgressCard for weekly goals display
- Created DashboardSection component as a reusable section wrapper with SectionHeader integration
- Refactored DashboardScreen to orchestrate modular dashboard components

### Changed
- DashboardScreen now uses composition pattern with dedicated dashboard components
- Removed inline mock icons in favor of lucide-react-native icons
- Simplified DashboardScreen from 123 lines to 73 lines through component extraction
- Improved separation of concerns - screen orchestrates, components render

### Architecture Decisions
- Dashboard components follow feature-first organization in features/dashboard/components/
- Thin screen architecture - DashboardScreen only orchestrates, no rendering logic
- Static mock data only - no business logic or state management yet
- Component composition over monolithic screen files
- Token-backed styling maintained throughout all new components

## [Foundation Setup]

### Completed

- Configured Expo Router with Stack navigation
- Updated root layout with hidden headers and calm background (#F8F7FC)
- Created production folder structure (app, components, features, hooks, services, store, theme, types, utils, constants)
- Configured NativeWind with tailwind.config.js, babel.config.js, and nativewind-env.d.ts
- Created design token system (colors, spacing, radius, shadows, typography, tokens)
- Configured Tailwind theme extensions with token-backed values
- Created core UI primitive structure (Screen, Card, Button, IconButton, Text, Input, EmptyState, SectionHeader, ProgressBar, Avatar, FloatingActionButton, BottomSheet)
- Added utility helpers (cn.ts with clsx and tailwind-merge)
- Created initial tab route structure (Dashboard, Tasks, Calendar, Health, More)
- Established feature-first organization with modular subdirectories

### Notes

- No feature screens implemented yet (only placeholders)
- No backend integration yet
- Design tokens follow calm, cinematic, breathable, premium aesthetic
- Primary gradient direction: #89fffd → #ef32d9
- All architecture follows feature-first, local-first, and modular state principles

## [State Architecture + MMKV Persistence]

### Completed

- Configured MMKV storage layer with createMMKV() for react-native-mmkv v4+
- Created reusable storage utilities (getItem, setItem, removeItem, hasItem, clearAll, getAllKeys)
- Implemented shared persist helper (createPersistStorage.ts) bridging MMKV with Zustand persist middleware
- Built production-ready Zustand stores following strict domain isolation:
  - useTaskStore with typed CRUD operations (no persistence - transient data)
  - useHabitStore with typed CRUD operations and MMKV persistence
  - useMealStore with typed CRUD operations (no persistence - transient data)
  - useBudgetStore with typed CRUD operations for transactions and budgets (no persistence)
  - useSettingsStore with MMKV persistence for app preferences and onboarding state
- Applied consistent store pattern: State type, Actions type, Store = State & Actions
- Created mock seed data for tasks (8 realistic tasks) and habits (8 realistic habits)
- Implemented repository layer foundations with local-first architecture:
  - taskRepository with async CRUD methods
  - habitRepository with async CRUD and frequency/date filtering
  - mealRepository with async CRUD and nutrition calculation
  - budgetRepository with async CRUD and budget status checking
- Created comprehensive state architecture documentation (docs/state-architecture.md)
- Documented persistence rules (persist: habits, settings, preferences; don't persist: UI state, modals, filters)
- Documented domain isolation principles and anti-patterns to avoid
- Updated existing MMKV service placeholder to use proper createMMKV() initialization

### Architecture Decisions

- Domain-driven state ownership: each domain (tasks, habits, meals, budget, settings) owns isolated state
- No monolithic global store: split by domain, not by screen or feature
- Typed actions: all stores use TypeScript with explicit State, Actions, and Store types
- Strategic persistence: only persist domain data that should survive app restarts (habits, settings)
- UI state in components: modal visibility, filters, form state use React useState
- Repository pattern: abstracts storage ownership for future backend integration without UI changes
- Thin stores: stores focus on state management, repositories handle business logic
- Granular subscriptions: use selectors to avoid unnecessary rerenders

### Persistence Configuration

- Habits: persisted with MMKV (user's habit tracking data)
- Settings: persisted with MMKV (theme, language, notifications, onboarding state)
- Tasks: not persisted (transient, can be re-fetched from backend)
- Meals: not persisted (transient, can be re-fetched from backend)
- Budget: not persisted (transient, can be re-fetched from backend)

### Notes

- MMKV properly initialized with createMMKV() for react-native-mmkv v4.3.1
- All stores follow the pattern: type State = {}, type Actions = {}, type Store = State & Actions
- Repository classes are backend-ready with async methods for future API integration
- Mock data available for development and testing without backend dependency
- No direct MMKV usage in UI components - all storage abstracted through stores/repositories
