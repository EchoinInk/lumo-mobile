import { create } from 'zustand';

interface BudgetState {
  budget: null;
  // Add budget-related state and actions here
}

export const useBudgetStore = create<BudgetState>(() => ({
  budget: null,
}));
