/**
 * Calm Mode Types
 *
 * Type definitions for the Calm Mode and Environmental Softening Layer.
 * This layer provides reusable sensory-load control for screens.
 */

export type EnvironmentalIntensity = "soft" | "balanced" | "cinematic";

export interface EnvironmentalSofteningProfile {
  reduceMotion: boolean;
  reduceGlowIntensity: boolean;
  reduceDecorativeElements: boolean;
  reduceGradientContrast: boolean;
  reduceAnimationDuration: boolean;
  simplifyAtmospheres: boolean;
  softenSurfaceBorders: boolean;
  lowerVisualNoise: boolean;
}

export interface CalmModeState {
  isCalmModeEnabled: boolean;
  reducedMotionEnabled: boolean;
  softenedGradientsEnabled: boolean;
  reducedDecorativeElements: boolean;
  reducedContrastMode: boolean;
  environmentalIntensity: EnvironmentalIntensity;
  lastEnabledAt: string | null;
}
