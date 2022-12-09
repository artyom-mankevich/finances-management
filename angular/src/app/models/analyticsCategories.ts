import { TransactionCategory } from "./transactionCategory"

export interface AnalyticsCategoires {
    incomes: {
        data: TransactionCategory[],
        total: number | null
    }
    expenses: {
        data: TransactionCategory[],
        total: number | null
    }
}