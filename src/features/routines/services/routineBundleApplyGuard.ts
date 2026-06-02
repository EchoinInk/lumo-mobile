export function createRoutineBundleApplyGuard() {
  const lockedBundleIds = new Set<string>();

  return {
    begin(bundleId: string): boolean {
      if (lockedBundleIds.has(bundleId)) {
        return false;
      }

      lockedBundleIds.add(bundleId);
      return true;
    },
    release(bundleId: string): void {
      lockedBundleIds.delete(bundleId);
    },
    isLocked(bundleId: string): boolean {
      return lockedBundleIds.has(bundleId);
    },
  };
}
