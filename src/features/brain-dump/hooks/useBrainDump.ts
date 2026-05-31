import { useEffect, useMemo } from "react";
import { useBrainDumpStore } from "../store/useBrainDumpStore";

export function useBrainDump() {
  const store = useBrainDumpStore();

  useEffect(() => {
    store.hydrate();
  }, [store.hydrate]);

  const openEntries = useMemo(
    () => store.entries.filter((entry) => entry.status === "open"),
    [store.entries],
  );

  return {
    ...store,
    openEntries,
  };
}
