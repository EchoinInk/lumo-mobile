/**
 * Focus Mode Types
 *
 * Type definitions for the Focus Mode and Cognitive Load Reduction Layer.
 * This layer provides reusable cognitive-load control for screens.
 */

export type CognitiveDensity = "minimal" | "comfortable" | "standard";

export type FocusSectionKey =
  | "today"
  | "habits"
  | "calendar"
  | "quickActions"
  | "progress"
  | "suggestions";

export interface CognitiveLoadProfile {
  density: CognitiveDensity;
  showSecondaryActions: boolean;
  showDecorativeElements: boolean;
  maxVisibleCards: number;
  preferSinglePrimaryAction: boolean;
  reduceMotion: boolean;
}

export interface FocusModeState {
  isFocusModeEnabled: boolean;
  activeFocusTaskId: string | null;
  hiddenSections: FocusSectionKey[];
  densityPreference: CognitiveDensity;
  reducedStimulusEnabled: boolean;
  lastEnabledAt: string | null;
}
