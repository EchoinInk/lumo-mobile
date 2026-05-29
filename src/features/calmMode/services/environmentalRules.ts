/**
 * Environmental Rules
 *
 * Maps environmental intensity preferences to reusable UI behavior.
 * These rules define how the interface should behave at different intensity levels.
 */

import type {
  EnvironmentalIntensity,
  EnvironmentalSofteningProfile,
} from "../types/calmMode.types";

/**
 * Get the environmental softening profile for a given intensity level.
 *
 * soft:
 * - reduced gradients
 * - minimal glow
 * - reduced motion
 * - fewer decorative overlays
 * - softened borders
 * - calmer contrast transitions
 *
 * balanced:
 * - moderate atmosphere
 * - restrained motion
 * - subtle gradients
 *
 * cinematic:
 * - existing default visual richness
 */
export function getEnvironmentalProfile(
  intensity: EnvironmentalIntensity,
): EnvironmentalSofteningProfile {
  switch (intensity) {
    case "soft":
      return {
        reduceMotion: true,
        reduceGlowIntensity: true,
        reduceDecorativeElements: true,
        reduceGradientContrast: true,
        reduceAnimationDuration: true,
        simplifyAtmospheres: true,
        softenSurfaceBorders: true,
        lowerVisualNoise: true,
      };

    case "balanced":
      return {
        reduceMotion: false,
        reduceGlowIntensity: false,
        reduceDecorativeElements: false,
        reduceGradientContrast: true,
        reduceAnimationDuration: true,
        simplifyAtmospheres: false,
        softenSurfaceBorders: true,
        lowerVisualNoise: false,
      };

    case "cinematic":
      return {
        reduceMotion: false,
        reduceGlowIntensity: false,
        reduceDecorativeElements: false,
        reduceGradientContrast: false,
        reduceAnimationDuration: false,
        simplifyAtmospheres: false,
        softenSurfaceBorders: false,
        lowerVisualNoise: false,
      };

    default:
      return getEnvironmentalProfile("balanced");
  }
}

/**
 * Get recommended intensity based on time of day or user context.
 * This is a placeholder for future smart recommendations.
 */
export function getRecommendedIntensity(): EnvironmentalIntensity {
  const hour = new Date().getHours();

  // Evening hours (8pm - 10pm) suggest soft intensity
  if (hour >= 20 && hour <= 22) {
    return "soft";
  }

  // Morning hours (6am - 9am) suggest balanced intensity
  if (hour >= 6 && hour <= 9) {
    return "balanced";
  }

  // Default to cinematic for peak hours
  return "cinematic";
}

/**
 * Calculate animation duration multiplier based on profile.
 * Returns a multiplier (e.g., 0.5 for faster, 1.0 for normal).
 */
export function getAnimationDurationMultiplier(
  profile: EnvironmentalSofteningProfile,
): number {
  return profile.reduceAnimationDuration ? 0.5 : 1.0;
}

/**
 * Calculate glow opacity multiplier based on profile.
 * Returns a multiplier (e.g., 0.3 for reduced, 1.0 for normal).
 */
export function getGlowOpacityMultiplier(
  profile: EnvironmentalSofteningProfile,
): number {
  return profile.reduceGlowIntensity ? 0.3 : 1.0;
}

/**
 * Calculate gradient contrast multiplier based on profile.
 * Returns a multiplier (e.g., 0.6 for reduced, 1.0 for normal).
 */
export function getGradientContrastMultiplier(
  profile: EnvironmentalSofteningProfile,
): number {
  return profile.reduceGradientContrast ? 0.6 : 1.0;
}
