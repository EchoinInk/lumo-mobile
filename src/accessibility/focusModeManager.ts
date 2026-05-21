/**
 * Focus Mode Manager
 * 
 * Centralized focus mode management and state transitions.
 */

import type { FocusMode, FocusModeConfig, FocusModeState } from '@/types/focusModes';
import { FOCUS_MODE_CONSTANTS } from '@/constants/focusModes';

export class FocusModeManager {
  private state: FocusModeState = {
    currentMode: 'none',
    isFocusModeActive: false,
    activeTaskId: null,
    startTime: null,
    duration: null,
  };

  private listeners: Set<(state: FocusModeState) => void> = new Set();

  /**
   * Get current focus mode state
   */
  getState(): FocusModeState {
    return { ...this.state };
  }

  /**
   * Set focus mode
   */
  setFocusMode(mode: FocusMode, config?: Partial<FocusModeConfig>): void {
    const previousMode = this.state.currentMode;
    
    this.state = {
      currentMode: mode,
      isFocusModeActive: mode !== 'none',
      activeTaskId: config?.activeTaskId || null,
      startTime: mode !== 'none' && previousMode === 'none' ? Date.now() : this.state.startTime,
      duration: null,
    };

    this.notifyListeners();
  }

  /**
   * Exit focus mode
   */
  exitFocusMode(): void {
    const duration = this.state.startTime ? Date.now() - this.state.startTime : null;
    
    this.state = {
      currentMode: 'none',
      isFocusModeActive: false,
      activeTaskId: null,
      startTime: null,
      duration,
    };

    this.notifyListeners();
  }

  /**
   * Set active task for single task mode
   */
  setActiveTask(taskId: string): void {
    if (this.state.currentMode === 'single-task') {
      this.state.activeTaskId = taskId;
      this.notifyListeners();
    }
  }

  /**
   * Get focus mode configuration
   */
  getModeConfig(mode: FocusMode): FocusModeConfig {
    switch (mode) {
      case 'single-task':
        return {
          mode,
          hideSecondaryUI: true,
          reduceNotifications: true,
          simplifyDashboard: true,
        };
      case 'distraction-free':
        return {
          mode,
          hideSecondaryUI: true,
          reduceNotifications: true,
          simplifyDashboard: true,
        };
      case 'today-only':
        return {
          mode,
          hideSecondaryUI: false,
          reduceNotifications: false,
          simplifyDashboard: true,
        };
      case 'calm':
        return {
          mode,
          hideSecondaryUI: false,
          reduceNotifications: true,
          simplifyDashboard: false,
        };
      default:
        return {
          mode: 'none',
          hideSecondaryUI: false,
          reduceNotifications: false,
          simplifyDashboard: false,
        };
    }
  }

  /**
   * Subscribe to focus mode changes
   */
  subscribe(listener: (state: FocusModeState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
}

// Singleton instance
export const focusModeManager = new FocusModeManager();
