# Analytics Philosophy Documentation

## Overview

Lumo's analytics system is designed to provide behavioral insight without surveillance. It tracks meaningful events for UX understanding, not for manipulation.

## Philosophy

- **Behavioral Insight**: Track task completion, onboarding drop-off, feature adoption
- **NOT Surveillance**: No personal behavioral profiling, no session reconstruction
- **Opt-Out Support**: Users can disable analytics anytime
- **Offline-Safe**: Queue events locally, flush when online
- **Lightweight Payloads**: Minimal data, no bloat
- **Batched Delivery**: Efficient event flushing

## What We Track

### App Lifecycle
- App open
- App close
- App foreground
- App background

### Onboarding
- Onboarding start
- Onboarding step complete
- Onboarding complete

### Feature Usage
- Task create
- Task complete
- Task delete
- Habit create
- Habit complete
- Meal log
- Budget transaction

### Errors
- Error occurrence (type only, no stack traces)

### Sync
- Sync start
- Sync complete
- Sync failed

### Settings
- Theme change
- Accessibility change

## What We Don't Track

### Personal Data
- User names
- Email addresses
- Phone numbers
- Personal identifiers

### Behavioral Profiling
- Session reconstruction
- Detailed user journeys
- Time spent per screen
- Click patterns
- Scroll behavior

### Surveillance
- Location data
- Device fingerprinting
- Cross-app tracking
- Third-party sharing
- Ad targeting

### Excessive Events
- Every button tap
- Every scroll
- Every interaction
- Every render
- Every state change

## Analytics Architecture

### Event Flow

```
Feature Component
→ Analytics Service
→ Event Queue
→ Provider (Future)
```

### Abstraction Layer

Analytics is abstracted from providers:

- **No Vendor Lock-In**: Easy to switch providers
- **Future Providers**: PostHog, Mixpanel, custom backend
- **Consistent API**: Same interface regardless of provider
- **Type Safety**: Full TypeScript coverage

### Event Batching

Events are batched for efficiency:

- **Batch Size**: 10 events
- **Flush Interval**: 30 seconds
- **Queue Persistence**: MMKV storage
- **Max Queue Size**: 100 events
- **Eviction**: FIFO (oldest first)

## Analytics Service

### Initialization

```typescript
import { analyticsService } from '@/services/analytics';

analyticsService.initialize({
  enabled: true,
});
```

### Tracking Events

```typescript
// Track predefined event
analyticsService.trackTaskCreate({
  taskId: '123',
  category: 'personal',
});

// Track custom event
analyticsService.track('TASK_CREATE' as any, {
  customProperty: 'value',
});
```

### Feature-Specific Events

```typescript
// Task events
analyticsService.trackTaskCreate(properties);
analyticsService.trackTaskComplete(properties);
analyticsService.trackTaskDelete(properties);

// Habit events
analyticsService.trackHabitCreate(properties);
analyticsService.trackHabitComplete(properties);

// Meal events
analyticsService.trackMealLog(properties);

// Budget events
analyticsService.trackBudgetTransaction(properties);
```

### Lifecycle Events

```typescript
// App lifecycle
analyticsService.trackAppOpen();
analyticsService.trackAppClose();

// Onboarding
analyticsService.trackOnboardingStart();
analyticsService.trackOnboardingStepComplete(step);
analyticsService.trackOnboardingComplete();

// Sync
analyticsService.trackSyncStart();
analyticsService.trackSyncComplete(properties);
analyticsService.trackSyncFailed(properties);
```

### Settings Events

```typescript
// Theme
analyticsService.trackThemeChange('dark');

// Accessibility
analyticsService.trackAccessibilityChange('reduced_motion');
```

## Analytics Queue

### Queue Management

```typescript
import { analyticsQueue } from '@/services/analytics/analyticsQueue';

// Initialize queue
analyticsQueue.initialize({
  enabled: true,
  batchSize: 10,
  flushInterval: 30000,
  maxQueueSize: 100,
});

// Add event to queue
analyticsQueue.add(event);

// Flush queue
await analyticsQueue.flush();

// Get queue size
const size = analyticsQueue.size();

// Clear queue
analyticsQueue.clear();

// Enable/disable queue
analyticsQueue.setEnabled(false);
```

### Queue Persistence

Events persist across app restarts:

- **Storage**: MMKV
- **Key**: analytics-queue
- **Format**: JSON array
- **Retention**: Until flushed or evicted

### Offline Behavior

- **When Offline**: Events queue locally
- **When Online**: Auto-flush queue
- **Flush Trigger**: Batch size or interval
- **Retry Logic**: 3 retry attempts per event

## Analytics Store

### User Preferences

```typescript
import { useAnalyticsStore } from '@/features/analytics/store/useAnalyticsStore';

const { enabled, hasOptedOut, setEnabled, optOut, optIn } = useAnalyticsStore();

// Check if enabled
if (enabled && !hasOptedOut) {
  analyticsService.trackEvent();
}

// Opt out
optOut();

// Opt in
optIn();

// Set enabled
setEnabled(false);
```

### Persistence

Analytics preferences persist via MMKV:

- **Storage Key**: analytics-storage
- **Fields**: enabled, hasOptedOut, optOutTimestamp
- **Hydration**: Automatic on app start
- **Sync**: Immediate write on change

## Analytics Feature Service

### Feature-Level Tracking

```typescript
import { analyticsFeatureService } from '@/features/analytics/services/analyticsFeatureService';

// Track feature event
analyticsFeatureService.trackFeatureEvent('tasks', 'create', {
  taskId: '123',
});

// Track feature view
analyticsFeatureService.trackFeatureView('tasks');

// Track feature interaction
analyticsFeatureService.trackFeatureInteraction('tasks', 'swipe', {
  direction: 'left',
});
```

### Helper Functions

```typescript
import { isAnalyticsEnabled, hasUserOptedOut, formatEventProperties } from '@/features/analytics/utils/analyticsHelpers';

// Check if enabled
if (isAnalyticsEnabled()) {
  analyticsService.trackEvent();
}

// Check opt-out status
if (hasUserOptedOut()) {
  // Don't track
}

// Format properties
const formatted = formatEventProperties({
  stringProp: 'value',
  numberProp: 123,
  booleanProp: true,
  // Other types filtered out
});
```

## Event Properties

### Allowed Types

Only primitive types are allowed:

- `string`
- `number`
- `boolean`

### Filtering

Non-primitive types are filtered:

```typescript
const properties = {
  stringProp: 'value', // ✓ Included
  numberProp: 123, // ✓ Included
  booleanProp: true, // ✓ Included
  objectProp: {}, // ✗ Filtered
  arrayProp: [], // ✗ Filtered
  nullProp: null, // ✗ Filtered
  undefinedProp: undefined, // ✗ Filtered
};
```

## Opt-Out Support

### User Control

Users can opt out anytime:

```typescript
import { useAnalyticsStore } from '@/features/analytics/store/useAnalyticsStore';

const { optOut } = useAnalyticsStore();

// User opts out
optOut();
```

### Opt-Out Behavior

- **Immediate**: No events tracked after opt-out
- **Persistent**: Opt-out saved to MMKV
- **Respected**: All event calls check opt-out
- **Reversible**: User can opt-in again

### Opt-In

```typescript
const { optIn } = useAnalyticsStore();

// User opts in
optIn();
```

## Best Practices

### When to Track

**Good**:
- Task completion
- Onboarding milestones
- Feature adoption
- Error occurrences (type only)
- Sync events

**Bad**:
- Every button tap
- Every scroll
- Every render
- Personal data
- Sensitive information

### Event Properties

**Good**:
- Minimal, relevant data
- Primitive types only
- No personal identifiers
- No sensitive information
- Clear purpose

**Bad**:
- Excessive properties
- Complex objects
- Personal identifiers
- Sensitive information
- Unclear purpose

### Event Frequency

**Good**:
- Batched delivery
- Meaningful events only
- No spam
- Respectful frequency
- Offline-safe

**Bad**:
- Every interaction
- Excessive events
- Spam
- Aggressive frequency
- Blocking UI

## Testing

### Test Cases

1. Events are queued correctly
2. Queue flushes on batch size
3. Queue flushes on interval
4. Queue persists across restarts
5. Opt-out prevents tracking
6. Opt-in enables tracking
7. Offline queues events
8. Online flushes queue

### Manual Testing Checklist

- [ ] Events are tracked when enabled
- [ ] Events are not tracked when disabled
- [ ] Queue flushes at batch size
- [ ] Queue flushes at interval
- [ ] Queue persists across restarts
- [ ] Opt-out prevents tracking
- [ ] Opt-in enables tracking
- [ ] Offline queues events
- [ ] Online flushes queue

## Troubleshooting

### Events Not Tracking

1. Check if analytics is enabled
2. Check if user has opted out
3. Verify event is being called
4. Check network connectivity
5. Verify queue initialization

### Queue Not Flushing

1. Check flush interval
2. Check batch size
3. Verify network connectivity
4. Check queue size
5. Verify flush is being called

### Opt-Out Not Working

1. Check store persistence
2. Verify opt-out is being called
3. Check event calls respect opt-out
4. Verify store is being used
5. Check MMKV storage

### Events Not Persisting

1. Check MMKV storage
2. Verify queue initialization
3. Check storage key
4. Verify queue is being added to
5. Check for storage errors
