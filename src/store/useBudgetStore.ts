import { create } from 'zustand';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description?: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

type BudgetState = {
  transactions: Transaction[];
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
};

type BudgetActions = {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
  clearTransactions: () => void;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
        },
      ],
    })),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((transaction) =>
        transaction.id === id
          ? { ...transaction, ...updates, updatedAt: new Date().toISOString() }
          : transaction
      ),
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((transaction) => transaction.id !== id),
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
        },
      ],
    })),

  updateBudget: (id, updates) =>
    set((state) => ({
      budgets: state.budgets.map((budget) =>
        budget.id === id
          ? { ...budget, ...updates, updatedAt: new Date().toISOString() }
          : budget
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
