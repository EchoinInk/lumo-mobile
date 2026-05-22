import { create } from "zustand";

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description?: string;
  type: "income" | "expense";
  date: string;
  createdAt: string;
  updatedAt: string;
  /** Soft delete timestamp for sync — null if not deleted */
  deletedAt?: string | null;
  /** Sync status: pending = local changes not synced, synced = confirmed on server, failed = sync failed */
  syncStatus?: "pending" | "synced" | "failed";
  /** Monotonically increasing version for conflict detection */
  version?: number;
  /** ISO timestamp of last successful sync for this entity */
  lastSyncedAt?: string;
  /** True when entity has unsynced local changes */
  pendingSync?: boolean;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: "weekly" | "monthly" | "yearly";
  createdAt: string;
  updatedAt: string;
  /** Soft delete timestamp for sync — null if not deleted */
  deletedAt?: string | null;
  /** Sync status: pending = local changes not synced, synced = confirmed on server, failed = sync failed */
  syncStatus?: "pending" | "synced" | "failed";
  /** Monotonically increasing version for conflict detection */
  version?: number;
  /** ISO timestamp of last successful sync for this entity */
  lastSyncedAt?: string;
  /** True when entity has unsynced local changes */
  pendingSync?: boolean;
}

type BudgetState = {
  transactions: Transaction[];
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
};

type BudgetActions = {
  addTransaction: (
    transaction: Omit<
      Transaction,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "syncStatus"
      | "version"
      | "lastSyncedAt"
      | "pendingSync"
    >,
  ) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
  clearTransactions: () => void;
  addBudget: (
    budget: Omit<
      Budget,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "syncStatus"
      | "version"
      | "lastSyncedAt"
      | "pendingSync"
    >,
  ) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  setBudgets: (budgets: Budget[]) => void;
  clearBudgets: () => void;
  setError: (error: string | null) => void;
};

type BudgetStore = BudgetState & BudgetActions;

export const useBudgetStore = create<BudgetStore>((set) => ({
  transactions: [],
  budgets: [],
  isLoading: false,
  error: null,

  addTransaction: (transactionData) =>
    set((state) => ({
      transactions: [
        ...state.transactions,
        {
          ...transactionData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          pendingSync: true,
        },
      ],
    })),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              ...updates,
              updatedAt: new Date().toISOString(),
              version: (transaction.version ?? 0) + 1,
              pendingSync: true,
            }
          : transaction,
      ),
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter(
        (transaction) => transaction.id !== id,
      ),
    })),

  setTransactions: (transactions) => set({ transactions }),

  clearTransactions: () => set({ transactions: [] }),

  addBudget: (budgetData) =>
    set((state) => ({
      budgets: [
        ...state.budgets,
        {
          ...budgetData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          pendingSync: true,
        },
      ],
    })),

  updateBudget: (id, updates) =>
    set((state) => ({
      budgets: state.budgets.map((budget) =>
        budget.id === id
          ? {
              ...budget,
              ...updates,
              updatedAt: new Date().toISOString(),
              version: (budget.version ?? 0) + 1,
              pendingSync: true,
            }
          : budget,
      ),
    })),

  deleteBudget: (id) =>
    set((state) => ({
      budgets: state.budgets.filter((budget) => budget.id !== id),
    })),

  setBudgets: (budgets) => set({ budgets }),

  clearBudgets: () => set({ budgets: [] }),

  setError: (error) => set({ error }),
}));
