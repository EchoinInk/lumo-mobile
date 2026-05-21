/**
 * useFocusMode Hook
 * 
 * React hook for focus mode state and management.
 * Provides focus mode status and control functions.
 */

import { useEffect } from 'react';
import { useFocusModeStore } from '@/store/useFocusModeStore';
import { focusModeManager } from '@/accessibility';

export function useFocusMode() {
  const { currentMode, isFocusModeActive, activeTaskId, setFocusMode, exitFocusMode, setActiveTask } = useFocusModeStore();

  useEffect(() => {
    // Sync store with manager
    const unsubscribe = focusModeManager.subscribe((state) => {
      // Store is the source of truth, manager is for coordination
      // This allows for future cross-component coordination
    });

    return unsubscribe;
  }, []);

  return {
    currentMode,
    isFocusModeActive,
    activeTaskId,
    setFocusMode,
    exitFocusMode,
    setActiveTask,
    
    // Convenience methods
    enterSingleTaskMode: (taskId: string) => {
      setActiveTask(taskId);
      setFocusMode('single-task');
    },
    
    enterDistractionFreeMode: () => {
      setFocusMode('distraction-free');
    },
    
    enterTodayOnlyMode: () => {
      setFocusMode('today-only');
    },
    
    enterCalmMode: () => {
      setFocusMode('calm');
    },
  };
}
