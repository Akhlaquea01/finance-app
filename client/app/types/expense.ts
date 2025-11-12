export interface ExpenseData {
    month: string
    year: string
    Groceries: number
    Rent: number
    Utilities: number
    Entertainment: number
    Transportation: number
}

export interface ExpenseChartData {
    monthly: ExpenseData[]
    yearly: ExpenseData[]
}