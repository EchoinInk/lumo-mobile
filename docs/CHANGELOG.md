# Changelog

---

## 2026-05-20

### Phase 2: UI Foundation + Static App Shells

#### Added

**Theme Tokens**
- Enhanced color tokens with dark mode support (DarkColors)
- Added gradient colors (gradientBlue, gradientPurple, gradientWarm)
- Added semantic color variants (successSoft, warningSoft, dangerSoft, infoSoft)
- Added overlay colors for backdrops
- Expanded spacing scale (5xl, 6xl) for cinematic feel
- Added Padding presets for consistent spacing
- Enhanced shadows with cinematic variants (soft, glow, 2xl)
- Added typography variants (title, bodyLarge, label)
- Added letter spacing to typography for better readability

**Core UI Primitives**
- Enhanced Screen component with SafeArea, scrolling, keyboard avoidance, padding presets
- Enhanced Card component with variants (default, elevated, gradient, outlined, glass), pressable state
- Enhanced Button component with variants (primary, secondary, ghost, danger), loading, disabled, haptic feedback
- Enhanced IconButton component with shape variants (circular/square), size presets, haptic feedback
- Enhanced Text component with full typography token consumption, custom color/textAlign
- Enhanced Input component with label, error, helper text, left/right icons, focus states
- Enhanced EmptyState component with optional action button
- Enhanced SectionHeader component with subtitle, optional action button
- Enhanced ProgressBar component with animated width, gradient variant, label support
- Enhanced Avatar component with proper size variants (xs, sm, md, lg, xl, 2xl), accessibility
- Enhanced FloatingActionButton component with safe area awareness, position variants, size presets
- Enhanced BottomSheet component with gesture-ready structure, animations, backdrop

**Shared Mock Components**
- Created StatCard for displaying statistics with change indicators
- Created ProgressCard for showing progress with labels
- Created FocusCard for highlighting important items with gradient
- Created QuickActionCard for quick action buttons

**Static Shell Screens**
- Created DashboardScreen with stats grid, focus card, progress tracking, quick actions
- Created TasksScreen with task cards, priority badges, progress bars, FAB
- Created HabitsScreen with habit tracking, streak display, weekly summary
- Created BudgetScreen with budget overview, category breakdown, spending tracking

**Navigation Structure**
- Updated tab navigation with Dashboard, Tasks, Calendar, Health, More
- Created nested routes for Budget and Habits (not in main tabs)
- Connected shell screens to tab navigation

#### Changed

- Refactored all UI primitives to consume theme tokens
- Standardized typography hierarchy across all components
- Moved reusable layout logic into UI primitives
- Updated spacing to use token-based system
- Enhanced accessibility with proper labels and tap targets

#### Architecture

- Introduced composable card system with multiple variants
- Standardized typography variants with letter spacing
- Implemented haptic feedback architecture across interactive components
- Created gesture-ready bottom sheet structure
- Established safe area awareness pattern for floating elements
- Built modular screen shell architecture for validation

#### Notes

- No business logic introduced
- Static shell implementation only
- All components use theme tokens for consistency
- Dark mode architecture prepared with DarkColors
- Navigation structure validated with shell screens
- Spacing rhythm standardized across all components

---

## 2026-05-20

### Initial Project Setup

- Created Expo Router project structure
- Set up TypeScript configuration
- Configured NativeWind for styling
- Installed required dependencies (expo-haptics, expo-linear-gradient, etc.)
