import type { Result } from "@/types/result";
import { err, ok } from "@/types/result";

export function createMockRepository<T extends { id: string }>(
  initialItems: T[] = [],
) {
  const items = new Map(initialItems.map((item) => [item.id, item]));

  return {
    getAll: async (): Promise<Result<T[]>> => ok(Array.from(items.values())),
    getById: async (id: string): Promise<Result<T | null>> =>
      ok(items.get(id) ?? null),
    create: async (item: T): Promise<Result<T>> => {
      if (items.has(item.id)) {
        return err(`Duplicate item ${item.id}`);
      }
      items.set(item.id, item);
      return ok(item);
    },
    update: async (id: string, updates: Partial<T>): Promise<Result<T>> => {
      const item = items.get(id);
      if (!item) {
        return err(`Missing item ${id}`);
      }
      const updated = { ...item, ...updates };
      items.set(id, updated);
      return ok(updated);
    },
    delete: async (id: string): Promise<Result<boolean>> => {
      items.delete(id);
      return ok(true);
    },
  };
}
