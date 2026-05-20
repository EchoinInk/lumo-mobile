# Retry Lifecycle Documentation

## Overview

Lumo's retry system is designed to be patient, calm, and respectful. It never aggressively retries or creates retry storms.

## Philosophy

- **Patient Retry**: Exponential backoff, not immediate spam
- **Offline Aware**: Respects network state
- **Safe Cancellation**: Can be cancelled without side effects
- **Progress Feedback**: Shows attempt count without pressure
- **Configurable**: Max retries, delay, and callbacks

## Retry Architecture

### useRetry Hook

Main retry hook for async operations.

```typescript
import { useRetry } from '@/hooks/useRetry';

const { retry, isLoading, error, attempt, reset } = useRetry(
  async () => {
    return await fetchData();
  },
  {
    maxRetries: 3,
    retryDelay: 1000,
    onSuccess: () => console.log('Success'),
    onFailure: (error) => console.log('Failed', error),
  }
);

// Trigger retry
await retry();

// Reset state
reset();
```

### useRetry Options

- `maxRetries`: Maximum retry attempts (default: 3)
- `retryDelay`: Base delay in milliseconds (default: 1000)
- `onSuccess`: Callback on successful completion
- `onFailure`: Callback on all retries exhausted
- `onRetry`: Callback on each retry attempt

### useRetry Return Values

- `retry`: Function to trigger retry
- `isLoading`: Current loading state
- `error`: Error if all retries failed
- `attempt`: Current attempt number
- `reset`: Function to reset state

## Exponential Backoff

### Delay Progression

Retry delays follow exponential backoff:

- **Attempt 1**: 1 second (1000ms)
- **Attempt 2**: 2 seconds (2000ms)
- **Attempt 3**: 4 seconds (4000ms)
- **Attempt 4**: 8 seconds (8000ms)

### Calculation

```typescript
delay = retryDelay * Math.pow(2, attempt - 1)
```

### Example Configuration

```typescript
{
  maxRetries: 3,
  retryDelay: 1000, // 1s, 2s, 4s
}
```

## Retry Flow

### Lifecycle

1. **Start**: User triggers retry or auto-retry
2. **Attempt 1**: Execute function immediately
3. **Success**: Return result, reset state
4. **Failure**: Classify error, check retryable
5. **Backoff**: Wait exponential delay
6. **Attempt N**: Execute function again
7. **Repeat**: Until success or max retries
8. **Exhausted**: Call onFailure, set error state

### Error Classification

Only retryable errors trigger retry:

- **Network Errors**: Retry enabled
- **Sync Errors**: Retry enabled
- **Storage Errors**: Retry enabled
- **Auth Errors**: Retry disabled (use reset)
- **Validation Errors**: Retry disabled (use ignore)
- **Unknown Errors**: Retry enabled

## Offline Awareness

### Integration with useOfflineState

Retry hooks should respect offline state:

```typescript
import { useRetry } from '@/hooks/useRetry';
import { useOfflineState } from '@/hooks/useOfflineState';

const { isOffline } = useOfflineState();
const { retry, isLoading } = useRetry(fetchData);

// Don't retry if offline
const handleRetry = () => {
  if (!isOffline) {
    retry();
  }
};
```

### Offline Behavior

- **When Offline**: Don't trigger retry
- **When Online**: Allow retry
- **State Change**: Listen to network changes
- **User Feedback**: Show offline message

## Retry UI Components

### RetryView

Reusable retry interface with gentle feedback.

```typescript
import { RetryView } from '@/components/feedback/RetryView';

<RetryView
  retryKey="network"
  title="Let's try again"
  description="Connection should be stable now."
  onRetry={() => retry()}
  isLoading={isLoading}
  actionLabel="Retry"
/>
```

### RetryView Props

- `retryKey`: Predefined retry message key
- `title`: Custom title
- `description`: Custom description
- `onRetry`: Retry callback
- `isLoading`: Loading state
- `actionLabel`: Custom action button label
- `testID`: Test identifier

## Retry Patterns

### Manual Retry

User-initiated retry with button.

```typescript
const { retry, isLoading, error } = useRetry(fetchData);

<RetryView
  onRetry={retry}
  isLoading={isLoading}
/>
```

### Auto Retry

Automatic retry on component mount.

```typescript
const { retry } = useRetry(fetchData);

useEffect(() => {
  retry();
}, []);
```

### Conditional Retry

Retry based on specific conditions.

```typescript
const { retry } = useRetry(fetchData);

useEffect(() => {
  if (shouldRetry) {
    retry();
  }
}, [shouldRetry]);
```

### Retry with Polling

Periodic retry for status checks.

```typescript
const { retry } = useRetry(checkStatus);

useEffect(() => {
  const interval = setInterval(() => {
    retry();
  }, 5000);

  return () => clearInterval(interval);
}, []);
```

## Retry Best Practices

### When to Use Retry

**Good**:
- Network requests
- API calls
- Data fetching
- Sync operations
- Status checks

**Bad**:
- User input validation
- Authentication (use reset)
- Non-retryable errors
- Idempotent operations
- User actions

### Retry Configuration

```typescript
// Fast retry for quick operations
{ maxRetries: 2, retryDelay: 500 }

// Standard retry for API calls
{ maxRetries: 3, retryDelay: 1000 }

// Patient retry for slow operations
{ maxRetries: 5, retryDelay: 2000 }

// No retry for user input
{ maxRetries: 0 }
```

### Retry Feedback

**Good**:
- Show attempt count
- Show loading state
- Provide cancel option
- Explain why retrying
- Show progress

**Bad**:
- No feedback
- Aggressive retry
- No cancel option
- No explanation
- Infinite retry

## Error Recovery Integration

### withRetry Function

Lower-level retry function for direct use.

```typescript
import { withRetry } from '@/services/error/errorRecovery';

const result = await withRetry(
  async () => await fetchData(),
  {
    maxRetries: 3,
    retryDelay: 1000,
    onRetry: (attempt) => {
      console.log(`Attempt ${attempt}`);
    },
    onFailure: (error) => {
      console.error('All retries failed', error);
    },
  }
);
```

### withFallback Function

Fallback to alternative data source.

```typescript
import { withFallback } from '@/services/error/errorRecovery';

const result = await withFallback(
  async () => await fetchData(),
  () => getCachedData()
);
```

### withGracefulFailure Function

Return default value on failure.

```typescript
import { withGracefulFailure } from '@/services/error/errorRecovery';

const result = await withGracefulFailure(
  async () => await fetchData(),
  defaultValue
);
```

## Testing

### Test Cases

1. Retry executes function immediately on first attempt
2. Retry follows exponential backoff
3. Retry respects maxRetries limit
4. Retry calls onFailure when exhausted
5. Retry calls onSuccess on success
6. Retry resets state on reset()
7. Retry shows correct attempt count
8. Retry respects offline state

### Manual Testing Checklist

- [ ] Retry attempts follow exponential backoff
- [ ] Max retries limit is respected
- [ ] Loading state updates correctly
- [ ] Error state is set on failure
- [ ] Attempt count increments correctly
- [ ] Reset clears all state
- [ ] Offline state is respected
- [ ] Callbacks fire at correct times

## Troubleshooting

### Retry Not Triggering

1. Check if function is callable
2. Verify error is retryable
3. Check maxRetries configuration
4. Verify retry is being called
5. Check network state

### Retry Not Backing Off

1. Verify retryDelay is set
2. Check exponential backoff calculation
3. Verify attempt count increments
4. Check for concurrent retries
5. Verify no immediate retry loops

### Retry State Not Updating

1. Check if retry is awaited
2. Verify state setters are called
3. Check for state batching issues
4. Verify hook dependencies
5. Check for stale closures

### Retry Never Succeeds

1. Check if error is actually retryable
2. Verify function logic is correct
3. Check network connectivity
4. Verify maxRetries is sufficient
5. Check for persistent error conditions
