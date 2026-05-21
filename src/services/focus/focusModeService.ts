/**
 * Focus Mode Service
 * 
 * Service for managing focus mode logic and transitions.
 * Coordinates between focus mode manager and UI state.
 */

import { focusModeManager } from '@/accessibility';
import type { FocusMode, SingleTaskConfig, DistractionFreeConfig, TodayOnlyConfig, CalmModeConfig } from '@/types/focusModes';

export class FocusModeService {
  /**
   * Enter single task mode
   */
  enterSingleTaskMode(config: SingleTaskConfig): void {
    focusModeManager.setFocusMode('single-task');
    focusModeManager.setActiveTask(config.taskId);
  }

  /**
   * Enter distraction free mode
   */
  enterDistractionFreeMode(config: DistractionFreeConfig): void {
    focusModeManager.setFocusMode('distraction-free');
  }

  /**
   * Enter today only mode
   */
  enterTodayOnlyMode(config: TodayOnlyConfig): void {
    focusModeManager.setFocusMode('today-only');
  }

  /**
   * Enter calm mode
   */
  enterCalmMode(config: CalmModeConfig): void {
    focusModeManager.setFocusMode('calm');
  }

  /**
   * Exit current focus mode
   */
  exitFocusMode(): void {
    focusModeManager.exitFocusMode();
  }

  /**
   * Get current focus mode
   */
  getCurrentMode(): FocusMode {
    return focusModeManager.getState().currentMode;
  }

  /**
   * Check if focus mode is active
   */
  isFocusModeActive(): boolean {
    return focusModeManager.getState().isFocusModeActive;
  }

  /**
   * Get active task ID
   */
  getActiveTaskId(): string | null {
    return focusModeManager.getState().activeTaskId;
  }

  /**
   * Get focus session duration
   */
  getSessionDuration(): number | null {
    const state = focusModeManager.getState();
    if (state.startTime && state.isFocusModeActive) {
      return Date.now() - state.startTime;
    }
    return state.duration;
  }
}

export const focusModeService = new FocusModeService();
