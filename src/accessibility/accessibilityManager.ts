/**
 * Accessibility Manager
 * 
 * Centralized accessibility management and coordination.
 */

import type { AccessibilityPreferences, HapticPattern } from '@/types/accessibility';
import { accessibilityConfig } from './accessibilityConfig';
import { focusModeManager } from './focusModeManager';
import { simplifiedModeManager } from './simplifiedMode';

export class AccessibilityManager {
  private preferences: AccessibilityPreferences = { ...accessibilityConfig.preferences };

  private listeners: Set<(preferences: AccessibilityPreferences) => void> = new Set();

  /**
   * Get current accessibility preferences
   */
  getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  /**
   * Update accessibility preferences
   */
  updatePreferences(updates: Partial<AccessibilityPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    
    // Update simplified mode if adaptive complexity is enabled
    if (updates.adaptiveComplexity !== undefined && !updates.adaptiveComplexity) {
      simplifiedModeManager.disableSimplifiedMode();
    }
    
    this.notifyListeners();
  }

  /**
   * Reset to default preferences
   */
  resetPreferences(): void {
    this.preferences = { ...accessibilityConfig.preferences };
    this.notifyListeners();
  }

  /**
   * Trigger haptic feedback
   */
  triggerHaptic(pattern: HapticPattern): void {
    if (!this.preferences.hapticFeedbackEnabled) return;
    
    // Implementation would use React Native Haptics
    // This is a placeholder for the actual implementation
    console.log('Haptic feedback:', pattern);
  }

  /**
   * Check if reduced motion is enabled
   */
  isReducedMotionEnabled(): boolean {
    return accessibilityConfig.shouldReduceMotion(this.preferences);
  }

  /**
   * Check if simplified mode is enabled
   */
  isSimplifiedModeEnabled(): boolean {
    return this.preferences.simplifiedMode;
  }

  /**
   * Subscribe to preference changes
   */
  subscribe(listener: (preferences: AccessibilityPreferences) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of preference change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getPreferences()));
  }

  /**
   * Get focus mode manager
   */
  getFocusModeManager() {
    return focusModeManager;
  }

  /**
   * Get simplified mode manager
   */
  getSimplifiedModeManager() {
    return simplifiedModeManager;
  }
}

// Singleton instance
export const accessibilityManager = new AccessibilityManager();
