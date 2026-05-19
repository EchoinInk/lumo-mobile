import React from 'react';

interface MemoizedListItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function MemoizedListItem<T>({ item, index, renderItem }: MemoizedListItemProps<T>) {
  return <>{renderItem(item, index)}</>;
}

// Example usage pattern:
// const TaskItem = React.memo(({ task, onPress, onComplete }) => {
//   const handlePress = useStableCallback(() => onPress(task.id));
//   const handleComplete = useStableCallback(() => onComplete(task.id));
//
//   return (
//     <TouchableOpacity onPress={handlePress} style={styles.container}>
//       <Text>{task.title}</Text>
//       <Button onPress={handleComplete}>Complete</Button>
//     </TouchableOpacity>
//   );
// }, (prevProps, nextProps) => {
//   return (
//     prevProps.task.id === nextProps.task.id &&
//     prevProps.task.title === nextProps.task.title &&
//     prevProps.task.completed === nextProps.task.completed
//   );
// });
