export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
    | 'Groceries'
    | 'Rent'
    | 'Utilities'
    | 'Entertainment'
    | 'Transportation'
    | 'Salary'
    | 'Investment'
    | 'Other';

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    description: string;
    date: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionFilters {
    startDate?: string;
    endDate?: string;
    type?: TransactionType;
    category?: TransactionCategory;
    search?: string;
}

export interface TransactionStats {
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    categoryBreakdown: Record<TransactionCategory, number>;
}