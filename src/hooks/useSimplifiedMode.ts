/**
 * useSimplifiedMode Hook
 *
 * Foundation hook for simplified UI mode.
 * Returns boolean indicating whether simplified mode is enabled.
 * Future: Can be used to conditionally render simplified UI components.
 */

import { useSettingsStore } from '@/store/useSettingsStore';

export function useSimplifiedMode() {
  const simplifiedMode = useSettingsStore((state) => state.settings.simplifiedMode);
  return simplifiedMode;
}
