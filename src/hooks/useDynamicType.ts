/**
 * useDynamicType Hook
 * 
 * React hook for dynamic font scaling.
 * Respects system font scaling and accessibility preferences.
 */

import { PixelRatio } from 'react-native';
import { useEffect, useState } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { accessibilityConfig } from '@/accessibility';
import type { FontScale } from '@/types/accessibility';

export function useDynamicType() {
  const { preferences } = useAccessibilityStore();
  const [fontScale, setFontScale] = useState<FontScale>('medium');
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  useEffect(() => {
    // Determine font scale based on preferences
    const scale = preferences.largeText ? 'large' : 'medium';
    setFontScale(scale);
    
    // Get scale multiplier
    const multiplier = accessibilityConfig.getFontScaleMultiplier(scale);
    setScaleMultiplier(multiplier);
  }, [preferences.largeText]);

  // Listen to system font size changes
  useEffect(() => {
    const updateFromSystem = () => {
      const pixelRatio = PixelRatio.getFontScale();
      // Adjust based on system font scale
      if (pixelRatio > 1.2 && !preferences.largeText) {
        setFontScale('large');
        setScaleMultiplier(accessibilityConfig.getFontScaleMultiplier('large'));
      }
    };

    // Check initially
    updateFromSystem();

    // Listen for pixel ratio changes if supported
    // Note: React Native doesn't have a direct event for this
    // This is a placeholder for future implementation
  }, [preferences.largeText]);

  return {
    fontScale,
    scaleMultiplier,
    shouldScale: preferences.largeText || scaleMultiplier > 1,
  };
}
