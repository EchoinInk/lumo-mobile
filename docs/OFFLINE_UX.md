# Offline UX Documentation

## Overview

Lumo is local-first. Offline states should feel safe, expected, and non-destructive. The app should never punish users for being offline.

## Philosophy

- **Safe Messaging**: Emphasize data safety, not loss
- **Expected Behavior**: Offline feels normal, not exceptional
- **Non-Destructive**: Data is always safe locally
- **Retry Awareness**: Clear when sync will happen
- **Graceful Degradation**: Features work when possible

## Offline Detection

### useOfflineState Hook

Detects offline state and connection type.

```typescript
import { useOfflineState } from '@/hooks/useOfflineState';

const { isOffline, isConnected, connectionType } = useOfflineState();

if (isOffline) {
  // Show offline UI
}
```

### Return Values

- `isOffline`: Currently offline
- `isConnected`: Has network connection
- `connectionType`: Connection type (wifi, cellular, none)

### Network Events

Hook listens to network changes:

- **Online → Offline**: Update state immediately
- **Offline → Online**: Update state immediately
- **Connection Change**: Update connection type

## Offline Messaging

### Message Philosophy

**Good**:
- "Offline for now — your progress is still safe."
- "Changes will sync when you're back online."
- "Feature unavailable offline."

**Bad**:
- "Connection lost. Data may be lost."
- "You are offline. Please reconnect."
- "Error: No internet connection."

### Message Constants

```typescript
import { getOfflineMessage } from '@/constants/feedbackMessages';

const message = getOfflineMessage('default');
// Returns: { title, description }
```

### Message Keys

- `default`: General offline message
- `syncPending`: Sync pending message
- `featureUnavailable`: Feature unavailable message

## Offline Components

### OfflineView

Reusable offline state component.

```typescript
import { OfflineView } from '@/components/feedback/OfflineView';

<OfflineView
  offlineKey="default"
  title="Offline for now"
  description="Your progress is still safe here."
/>
```

### OfflineView Props

- `offlineKey`: Predefined offline message key
- `title`: Custom title
- `description`: Custom description
- `testID`: Test identifier

## Offline State Handling

### Detect Offline State

```typescript
import { useOfflineState } from '@/hooks/useOfflineState';

function MyComponent() {
  const { isOffline } = useOfflineState();

  if (isOffline) {
    return <OfflineView />;
  }

  return <OnlineContent />;
}
```

### Disable Features Offline

```typescript
function MyComponent() {
  const { isOffline } = useOfflineState();

  return (
    <Button
      disabled={isOffline}
      onPress={handleAction}
    >
      {isOffline ? 'Unavailable offline' : 'Save'}
    </Button>
  );
}
```

### Show Offline Indicator

```typescript
function MyComponent() {
  const { isOffline } = useOfflineState();

  return (
    <View>
      {isOffline && <OfflineIndicator />}
      <Content />
    </View>
  );
}
```

## Offline Data Safety

### Local Storage

All data is stored locally first:

- **Tasks**: MMKV storage
- **Habits**: MMKV storage
- **Meals**: MMKV storage
- **Budget**: MMKV storage
- **Settings**: MMKV storage

### Sync Queue

Changes queue for later sync:

- **Offline**: Queue changes locally
- **Online**: Auto-sync queued changes
- **Persistence**: Queue survives restarts
- **Retry**: Failed syncs retry automatically

### Data Integrity

- **Never Lost**: Data always safe locally
- **No Conflicts**: Optimistic updates
- **Merge Strategy**: Last write wins
- **Conflict Resolution**: Manual if needed

## Offline Feature Behavior

### Tasks

- **Offline**: Create, complete, delete tasks locally
- **Sync**: Queue changes, sync when online
- **UI**: Full functionality, show sync status

### Habits

- **Offline**: Create, complete habits locally
- **Sync**: Queue changes, sync when online
- **UI**: Full functionality, show sync status

### Meals

- **Offline**: Log meals locally
- **Sync**: Queue changes, sync when online
- **UI**: Full functionality, show sync status

### Budget

- **Offline**: Add transactions locally
- **Sync**: Queue changes, sync when online
- **UI**: Full functionality, show sync status

### Settings

- **Offline**: Change settings locally
- **Sync**: Queue changes, sync when online
- **UI**: Full functionality, immediate effect

## Offline Sync

### Sync Queue

Changes queue for offline sync:

```typescript
import { syncQueue } from '@/services/sync';

// Queue change
syncQueue.add({
  type: 'create',
  entity: 'task',
  data: taskData,
});
```

### Sync Trigger

Sync triggers automatically:

- **Online**: Auto-trigger sync
- **Interval**: Periodic sync check
- **Manual**: User-triggered sync
- **App Start**: Sync on foreground

### Sync Feedback

Show sync status to users:

```typescript
function SyncIndicator() {
  const { isOffline, syncStatus } = useSyncState();

  if (isOffline) {
    return <Text>Changes saved locally</Text>;
  }

  if (syncStatus === 'syncing') {
    return <Text>Syncing...</Text>;
  }

  if (syncStatus === 'error') {
    return <Text>Sync paused</Text>;
  }

  return <Text>Synced</Text>;
}
```

## Offline UI Patterns

### Full Offline Screen

```typescript
function OfflineScreen() {
  return (
    <OfflineView
      offlineKey="default"
      title="Offline for now"
      description="Your progress is still safe here."
    />
  );
}
```

### Offline Banner

```typescript
function OfflineBanner() {
  const { isOffline } = useOfflineState();

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text>Offline — changes saved locally</Text>
    </View>
  );
}
```

### Offline Indicator

```typescript
function OfflineIndicator() {
  const { isOffline } = useOfflineState();

  if (!isOffline) return null;

  return (
    <View style={[styles.indicator, { backgroundColor: Colors.warning }]} />
  );
}
```

### Offline Button State

```typescript
function OfflineButton({ onPress, children }) {
  const { isOffline } = useOfflineState();

  return (
    <Button
      disabled={isOffline}
      onPress={onPress}
      style={isOffline ? styles.disabled : null}
    >
      {children}
    </Button>
  );
}
```

## Offline Best Practices

### Messaging

**Good**:
- Emphasize data safety
- Explain behavior clearly
- Provide next steps
- Keep it calm
- Be reassuring

**Bad**:
- Alarm users
- Threaten data loss
- Use technical terms
- Be vague
- Create panic

### UI Behavior

**Good**:
- Show offline state clearly
- Disable unavailable features
- Show sync status
- Provide retry option
- Keep functionality where possible

**Bad**:
- Hide offline state
- Break functionality
- No sync feedback
- No retry option
- Dead ends

### Data Handling

**Good**:
- Store locally first
- Queue changes for sync
- Never lose data
- Optimistic updates
- Clear sync status

**Bad**:
- Require online for basic features
- Lose data on offline
- No sync queue
- Pessimistic updates
- No sync feedback

## Testing

### Test Cases

1. Offline state is detected correctly
2. Offline message displays correctly
3. Offline features work correctly
4. Data is saved locally offline
5. Changes sync when online
6. Sync queue persists across restarts
7. Sync errors are handled gracefully
8. Offline indicators display correctly

### Manual Testing Checklist

- [ ] Offline state detected on network loss
- [ ] Online state detected on network restore
- [ ] Offline message displays correctly
- [ ] Offline features work correctly
- [ ] Data is saved locally offline
- [ ] Changes sync when online
- [ ] Sync queue persists across restarts
- [ ] Sync errors are handled gracefully
- [ ] Offline indicators display correctly
- [ ] Sync status displays correctly

## Troubleshooting

### Offline State Not Detected

1. Check NetInfo installation
2. Verify hook is being used
3. Check network permissions
4. Verify network changes trigger updates
5. Check for emulator/simulator issues

### Data Not Saving Offline

1. Check MMKV storage
2. Verify storage permissions
3. Check storage keys
4. Verify data is being written
5. Check for storage errors

### Sync Not Triggering

1. Check sync queue initialization
2. Verify network state
3. Check sync trigger conditions
4. Verify sync function is called
5. Check for sync errors

### Offline Message Not Showing

1. Check component rendering
2. Verify offline state
3. Check message constants
4. Verify message key
5. Check component props
