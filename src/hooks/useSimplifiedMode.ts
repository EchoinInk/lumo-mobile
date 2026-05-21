/**
 * useSimplifiedMode Hook
 * 
 * React hook for simplified mode state and management.
 * Provides simplified mode status and control functions.
 */

import { useEffect } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { simplifiedModeManager } from '@/accessibility';
import type { SimplifiedModeConfig } from '@/accessibility/simplifiedMode';

export function useSimplifiedMode() {
  const { preferences, updatePreferences } = useAccessibilityStore();

  const enableSimplifiedMode = () => {
    simplifiedModeManager.enableSimplifiedMode();
    updatePreferences({ simplifiedMode: true });
  };

  const disableSimplifiedMode = () => {
    simplifiedModeManager.disableSimplifiedMode();
    updatePreferences({ simplifiedMode: false });
  };

  const toggleSimplifiedMode = () => {
    if (preferences.simplifiedMode) {
      disableSimplifiedMode();
    } else {
      enableSimplifiedMode();
    }
  };

  const updateCognitiveLoad = (level: 'low' | 'medium' | 'high' | 'overwhelmed') => {
    simplifiedModeManager.updateCognitiveLoad(level);
  };

  useEffect(() => {
    // Sync with manager
    const unsubscribe = simplifiedModeManager.subscribe((config) => {
      // Store is the source of truth
      if (config.enabled !== preferences.simplifiedMode) {
        updatePreferences({ simplifiedMode: config.enabled });
      }
    });

    return unsubscribe;
  }, [preferences.simplifiedMode, updatePreferences]);

  return {
    isEnabled: preferences.simplifiedMode,
    config: simplifiedModeManager.getConfig(),
    enableSimplifiedMode,
    disableSimplifiedMode,
    toggleSimplifiedMode,
    updateCognitiveLoad,
    
    // Convenience methods
    shouldShowElement: (priority: 'primary' | 'secondary' | 'tertiary') => {
      return simplifiedModeManager.shouldShowElement(priority);
    },
    
    getVisibleItemCount: () => {
      return simplifiedModeManager.getVisibleItemCount();
    },
  };
}
