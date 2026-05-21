/**
 * Focus Mode Type Definitions
 * 
 * Type definitions for focus modes and adaptive UI states.
 */

export type FocusMode = 'none' | 'single-task' | 'distraction-free' | 'today-only' | 'calm';

export interface FocusModeConfig {
  mode: FocusMode;
  activeTaskId?: string;
  hideSecondaryUI: boolean;
  reduceNotifications: boolean;
  simplifyDashboard: boolean;
}

export interface FocusModeState {
  currentMode: FocusMode;
  isFocusModeActive: boolean;
  activeTaskId: string | null;
  startTime: number | null;
  duration: number | null;
}

export interface SingleTaskConfig {
  taskId: string;
  hideAllOtherTasks: boolean;
  showProgressOnly: boolean;
  minimizeActions: boolean;
}

export interface DistractionFreeConfig {
  hideSecondaryModules: boolean;
  minimizeVisualNoise: boolean;
  reduceColorIntensity: boolean;
  suppressNotifications: boolean;
}

export interface TodayOnlyConfig {
  showTodayOnly: boolean;
  hideFutureTasks: boolean;
  hideCompletedTasks: boolean;
  minimizePlanningUI: boolean;
}

export interface CalmModeConfig {
  softenVisuals: boolean;
  reduceMotion: boolean;
  reduceNotifications: boolean;
  lowerInteractionDensity: boolean;
}
