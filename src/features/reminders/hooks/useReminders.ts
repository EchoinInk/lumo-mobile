import { useEffect } from "react";
import { useReminderStore } from "../store/useReminderStore";

export function useReminders() {
  const store = useReminderStore();

  useEffect(() => {
    store.hydrate();
  }, [store.hydrate]);

  return store;
}
