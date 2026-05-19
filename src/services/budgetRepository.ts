import { Transaction, Budget } from '@/store/useBudgetStore';

/**
 * Budget Repository
 * 
 * Abstracts budget and transaction data operations and storage.
 * This provides a clean separation between UI components and data storage.
 * 
 * Future: Can be extended to include backend API calls while maintaining
 * the same interface for UI components.
 */
export class BudgetRepository {
  /**
   * Get all transactions
   * @returns Promise resolving to array of transactions
   */
  async getAllTransactions(): Promise<Transaction[]> {
    // Future: Fetch from backend API
    // Current: Return from store or local storage
    return [];
  }

  /**
   * Get all budgets
   * @returns Promise resolving to array of budgets
   */
  async getAllBudgets(): Promise<Budget[]> {
    // Future: Fetch from backend API
    // Current: Return from store or local storage
    return [];
  }

  /**
   * Get a transaction by ID
   * @param id - Transaction ID
   * @returns Promise resolving to transaction or null if not found
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    // Future: Fetch from backend API
    return null;
  }

  /**
   * Get a budget by ID
   * @param id - Budget ID
   * @returns Promise resolving to budget or null if not found
   */
  async getBudgetById(id: string): Promise<Budget | null> {
    // Future: Fetch from backend API
    return null;
  }

  /**
   * Create a new transaction
   * @param transaction - Transaction data without id, createdAt, updatedAt
   * @returns Promise resolving to created transaction
   */
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    // Future: POST to backend API
    // Current: Create locally with generated ID
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newTransaction;
  }

  /**
   * Create a new budget
   * @param budget - Budget data without id, createdAt, updatedAt
   * @returns Promise resolving to created budget
   */
  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    // Future: POST to backend API
    // Current: Create locally with generated ID
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newBudget;
  }

  /**
   * Update an existing transaction
   * @param id - Transaction ID
   * @param updates - Partial transaction data to update
   * @returns Promise resolving to updated transaction
   */
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    // Future: PUT/PATCH to backend API
    // Current: Update locally
    return {} as Transaction;
  }

  /**
   * Update an existing budget
   * @param id - Budget ID
   * @param updates - Partial budget data to update
   * @returns Promise resolving to updated budget
   */
  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    // Future: PUT/PATCH to backend API
    // Current: Update locally
    return {} as Budget;
  }

  /**
   * Delete a transaction
   * @param id - Transaction ID
   * @returns Promise resolving to boolean indicating success
   */
  async deleteTransaction(id: string): Promise<boolean> {
    // Future: DELETE to backend API
    // Current: Delete locally
    return true;
  }

  /**
   * Delete a budget
   * @param id - Budget ID
   * @returns Promise resolving to boolean indicating success
   */
  async deleteBudget(id: string): Promise<boolean> {
    // Future: DELETE to backend API
    // Current: Delete locally
    return true;
  }

  /**
   * Get transactions by date range
   * @param startDate - Start date string in ISO format
   * @param endDate - End date string in ISO format
   * @returns Promise resolving to array of transactions
   */
  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    // Future: Implement filtering on backend
    return [];
  }

  /**
   * Get transactions by category
   * @param category - Category name
   * @returns Promise resolving to array of transactions
   */
  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    // Future: Implement filtering on backend
    return [];
  }

  /**
   * Calculate budget summary for a period
   * @param period - Period type (weekly, monthly, yearly)
   * @returns Promise resolving to budget summary
   */
  async getBudgetSummary(period: 'weekly' | 'monthly' | 'yearly'): Promise<{
    totalIncome: number;
    totalExpenses: number;
    remaining: number;
    categoryBreakdown: Record<string, number>;
  }> {
    // Future: Calculate on backend
    return {
      totalIncome: 0,
      totalExpenses: 0,
      remaining: 0,
      categoryBreakdown: {},
    };
  }

  /**
   * Check if budget is exceeded for a category
   * @param categoryId - Category ID or name
   * @param period - Period type
   * @returns Promise resolving to budget status
   */
  async checkBudgetStatus(categoryId: string, period: 'weekly' | 'monthly' | 'yearly'): Promise<{
    isExceeded: boolean;
    spent: number;
    limit: number;
    remaining: number;
    percentage: number;
  }> {
    // Future: Calculate on backend
    return {
      isExceeded: false,
      spent: 0,
      limit: 0,
      remaining: 0,
      percentage: 0,
    };
  }
}

// Export singleton instance
export const budgetRepository = new BudgetRepository();
