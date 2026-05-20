# Error Handling Documentation

## Overview

Lumo's error handling system is designed to be emotionally safe, calm, and forgiving. Errors should feel recoverable, not punishing.

## Philosophy

- **Emotionally Safe**: Errors feel reassuring, not alarming
- **No Technical Jargon**: Use plain language users understand
- **Forgiving**: Users are never punished for failures
- **Calm Recovery**: Gentle retry, no aggressive loops
- **Graceful Degradation**: Offline states feel safe

## Error Classification

Errors are classified by type to determine appropriate recovery strategies:

### Network Errors
- **Detection**: Connection, timeout, fetch, offline keywords
- **Severity**: Medium
- **Recovery Strategy**: Retry
- **User Message**: "Connection issue. Let's try again."

### Storage Errors
- **Detection**: Storage, disk, write, save, persist keywords
- **Severity**: High
- **Recovery Strategy**: Fallback
- **User Message**: "Something went wrong saving your data. It's safe to try again."

### Auth Errors
- **Detection**: Auth, unauthorized, forbidden, token, session keywords
- **Severity**: High
- **Recovery Strategy**: Reset
- **User Message**: "Please sign in again to continue."

### Validation Errors
- **Detection**: Validation, invalid, required, format, schema keywords
- **Severity**: Low
- **Recovery Strategy**: Ignore
- **User Message**: "Please check your input and try again."

### Sync Errors
- **Detection**: Sync, upload, download, conflict keywords
- **Severity**: Medium
- **Recovery Strategy**: Retry
- **User Message**: "Sync paused. Your changes are saved locally."

### Unknown Errors
- **Detection**: Fallback for unclassified errors
- **Severity**: Medium
- **Recovery Strategy**: Notify
- **User Message**: "Something didn't work. Let's try that again."

## Error Services

### errorClassifier

Classifies errors by category, severity, and recovery strategy.

```typescript
import { classifyError } from '@/services/error/errorClassifier';

const classification = classifyError(error);
// Returns: { category, severity, recoveryStrategy, userMessage, retryable }
```

### errorLogger

Logs errors for debugging without overwhelming users.

```typescript
import { errorLogger } from '@/services/error/errorLogger';

errorLogger.log(error, context);

// Get recent logs
const recentLogs = errorLogger.getRecentLogs(10);

// Get logs by severity
const highSeverityLogs = errorLogger.getLogsBySeverity('high');

// Get statistics
const stats = errorLogger.getStats();
```

### errorRecovery

Provides graceful error recovery with exponential backoff.

```typescript
import { withRetry, withFallback, withGracefulFailure } from '@/services/error/errorRecovery';

// Retry with exponential backoff
const result = await withRetry(async () => {
  return await fetchData();
}, {
  maxRetries: 3,
  retryDelay: 1000,
  onRetry: (attempt) => console.log(`Attempt ${attempt}`),
});

// Fallback on error
const result = await withFallback(
  async () => await fetchData(),
  () => getCachedData()
);

// Graceful failure with default
const result = await withGracefulFailure(
  async () => await fetchData(),
  defaultValue
);
```

## Error Boundaries

### ErrorBoundary Component

Screen-level error boundary for React trees.

```typescript
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
  }}
  fallback={<CustomFallback />}
>
  <YourComponent />
</ErrorBoundary>
```

### ErrorBoundaryState

State management for error boundaries.

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}
```

## Error State Components

### ErrorState

Reusable error state component with calm messaging.

```typescript
import { ErrorState } from '@/components/feedback/ErrorState';

<ErrorState
  errorKey="network"
  title="Connection issue"
  description="Let's try again."
  onRetry={() => retry()}
  actionLabel="Retry"
/>
```

### ErrorState Props

- `errorKey`: Predefined error message key
- `title`: Custom title
- `description`: Custom description
- `onRetry`: Retry callback
- `actionLabel`: Custom action button label
- `testID`: Test identifier

## Error Recovery Strategies

### Retry
- **Use Case**: Network errors, sync errors
- **Behavior**: Exponential backoff (1s, 2s, 4s)
- **Max Attempts**: 3 (configurable)
- **User Feedback**: Shows attempt count

### Ignore
- **Use Case**: Validation errors
- **Behavior**: Don't retry, show validation message
- **User Feedback**: Clear input guidance

### Fallback
- **Use Case**: Storage errors
- **Behavior**: Use alternative data source
- **User Feedback**: Explain gracefully

### Reset
- **Use Case**: Auth errors
- **Behavior**: Reset state, require re-auth
- **User Feedback**: Clear sign-in prompt

### Notify
- **Use Case**: Unknown errors
- **Behavior**: Log and notify user
- **User Feedback**: General retry option

## Error Logging

### Log Structure

```typescript
interface ErrorLog {
  id: string;
  error: AppError;
  stackTrace?: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
}
```

### Log Retention

- **Max Logs**: 100 entries
- **Eviction**: FIFO (oldest first)
- **Persistence**: In-memory only (session-based)

### Log Statistics

```typescript
const stats = errorLogger.getStats();
// Returns: { total, byCategory, bySeverity }
```

## Best Practices

### When to Use Error Boundaries

- **Screen-level**: Wrap each screen in an ErrorBoundary
- **Feature-level**: Wrap complex features
- **Async operations**: Use useAsyncBoundary hook
- **Not needed**: Simple components with local state

### Error Message Guidelines

**Good**:
- "Something didn't load properly. Let's try again."
- "Offline for now — your progress is still safe."
- "Please check your input and try again."

**Bad**:
- "Fatal exception occurred."
- "Application crashed."
- "Unexpected runtime error."

### Retry Guidelines

**Good**:
- Network requests
- Sync operations
- Data fetching
- API calls

**Bad**:
- Validation errors
- User input errors
- Auth failures (use reset instead)
- Non-retryable errors

### Error Recovery Flow

1. **Classify error**: Determine category and strategy
2. **Log error**: Store for debugging (development only)
3. **Show feedback**: Display calm, appropriate message
4. **Offer recovery**: Provide retry or alternative action
5. **Preserve state**: Don't lose user data

## Testing

### Test Cases

1. Network error triggers retry
2. Storage error triggers fallback
3. Auth error triggers reset
4. Validation error shows guidance
5. Error boundary catches React errors
6. Error logger stores logs correctly
7. Error recovery respects max retries
8. Error messages are calm and clear

### Manual Testing Checklist

- [ ] Network errors show retry option
- [ ] Storage errors show fallback message
- [ ] Auth errors trigger sign-in flow
- [ ] Validation errors show input guidance
- [ ] Error boundaries prevent app crashes
- [ ] Error logs are stored correctly
- [ ] Retry attempts follow exponential backoff
- [ ] Error messages are emotionally safe

## Troubleshooting

### Error Not Logging

1. Check if errorLogger is imported correctly
2. Verify error is being passed to log function
3. Check development mode (logs only in dev)
4. Verify log retention limit

### Retry Not Working

1. Check if error is classified as retryable
2. Verify maxRetries configuration
3. Check network state (useOfflineState)
4. Verify retryDelay is appropriate

### Error Boundary Not Catching

1. Verify ErrorBoundary is wrapping component
2. Check for async errors (use useAsyncBoundary)
3. Verify error is a React error
4. Check for error in fallback rendering
