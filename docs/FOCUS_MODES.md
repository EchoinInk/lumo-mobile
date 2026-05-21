# Focus Modes Documentation

## Overview

Lumo's focus modes provide adaptive systems for reducing cognitive load and supporting inconsistent energy. Each mode creates a calmer, simpler interface tailored to different productivity needs.

## Focus Mode Types

### Single Task Mode

**Purpose**: Isolate one task for deep focus

**Behavior**:
- Shows only the active task
- Hides all other tasks
- Removes surrounding distractions
- Simplifies visible actions
- Shows progress only

**Use Case**: Deep work on a single priority

**Configuration**:
```typescript
{
  taskId: string;
  hideAllOtherTasks: true;
  showProgressOnly: true;
  minimizeActions: true;
}
```

### Distraction-Free Mode

**Purpose**: Minimize visual noise and interruptions

**Behavior**:
- Hides secondary modules
- Minimizes visual noise
- Reduces color intensity
- Suppresses notifications
- Reduces dashboard density

**Use Case**: Reduced stimulation work sessions

**Configuration**:
```typescript
{
  hideSecondaryModules: true;
  minimizeVisualNoise: true;
  reduceColorIntensity: true;
  suppressNotifications: true;
}
```

### Today Only Dashboard

**Purpose**: Focus on today's priorities only

**Behavior**:
- Shows only today's tasks
- Hides future tasks
- Minimizes planning UI
- Reduces long-term cognitive pressure
- Shows habits for today

**Use Case**: Daily focus without future overwhelm

**Configuration**:
```typescript
{
  showTodayOnly: true;
  hideFutureTasks: true;
  hideCompletedTasks: false;
  minimizePlanningUI: true;
}
```

### Calm Mode

**Purpose**: Soften the entire interface

**Behavior**:
- Softens visuals
- Reduces motion
- Reduces notifications
- Lowers interaction density
- Calmer color palette

**Use Case**: Low-energy states or sensory overload

**Configuration**:
```typescript
{
  softenVisuals: true;
  reduceMotion: true;
  reduceNotifications: true;
  lowerInteractionDensity: true;
}
```

## Focus Mode Architecture

```
UI
↓
Focus Mode Components (FocusModeOverlay, SingleTaskView, etc.)
↓
useFocusMode Hook
↓
focusModeManager
↓
useFocusModeStore
↓
MMKV Persistence
```

## Focus Mode Manager

### State Management

```typescript
{
  currentMode: FocusMode;
  isFocusModeActive: boolean;
  activeTaskId: string | null;
  startTime: number | null;
  duration: number | null;
}
```

### Mode Transitions

- **Enter**: Set mode with optional configuration
- **Exit**: Return to normal mode, record duration
- **Switch**: Transition between modes
- **Auto-exit**: Optional timeout-based exit

## Focus Mode Service

### Service Methods

```typescript
focusModeService.enterSingleTaskMode(config);
focusModeService.enterDistractionFreeMode(config);
focusModeService.enterTodayOnlyMode(config);
focusModeService.enterCalmMode(config);
focusModeService.exitFocusMode();
```

### Session Tracking

- Start time recording
- Duration calculation
- Active task management
- Mode history

## Dashboard Filtering

### Filtering Logic

Tasks are filtered based on:
- Current focus mode
- Simplified mode status
- Cognitive load level
- Date (today-only mode)
- Priority (distraction-free mode)

### Filtering Service

```typescript
dashboardFilteringService.filterTasks(tasks, config);
dashboardFilteringService.filterHabits(habits, config);
```

### Density Levels

- **minimal**: 2 cards, 1 action per card
- **normal**: 4 cards, 2 actions per card
- **dense**: 6 cards, 3 actions per card

## Focus Mode Components

### FocusModeOverlay

Overlay showing current focus mode status:
- Mode label
- Exit button
- Animated appearance
- Reduced motion support

### SingleTaskView

Isolated single task view:
- Task details
- Progress indicator
- Minimal actions
- Distraction-free layout

### TodayOnlyDashboard

Today-focused dashboard:
- Today's tasks only
- Today's habits only
- No future planning
- Reduced density

### CalmModeView

Softened interface view:
- Calmer colors
- Reduced motion
- Lower density
- Supportive messaging

### DistractionFreeLayout

Minimized noise layout:
- Hidden secondary modules
- Reduced visual elements
- Suppressed notifications
- Clean interface

## Cognitive Load Integration

### Load Estimation

Cognitive load estimated from:
- Visible action count
- Dashboard density
- Interaction frequency
- Time spent in app

### Adaptive Adjustment

Load level triggers UI changes:
- **low**: Normal density
- **medium**: Slight reduction
- **high**: Significant reduction
- **overwhelmed**: Minimal interface

### Cognitive Load Manager

```typescript
cognitiveLoadManager.estimateCognitiveLoad();
cognitiveLoadManager.trackInteraction();
cognitiveLoadManager.updateVisibleActionCount(count);
cognitiveLoadManager.getRecommendedActionLimit();
```

## Best Practices

### Do

- Provide clear exit paths
- Show mode status visibly
- Respect user preferences
- Track session duration
- Adapt to cognitive load

### Don't

- Trap users in focus modes
- Hide essential information
- Force mode transitions
- Ignore user feedback
- Over-simplify to unusability

## UX Philosophy

Focus modes should feel:
- **Supportive**: Help, don't pressure
- **Optional**: User-controlled
- **Transparent**: Clear what's happening
- **Respectful**: Honor user energy
- **Calm**: No urgency, no guilt

## Performance

Focus mode systems remain lightweight:
- Efficient filtering
- Memoized calculations
- No layout thrashing
- Minimal state updates
