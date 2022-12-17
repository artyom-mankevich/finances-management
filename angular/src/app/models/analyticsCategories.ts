export interface AnalyticsCategoires {
    incomes: {
        data: Category[],
        total: number | null
    }
    expenses: {
        data: Category[],
        total: number | null
    }
}

interface Category {
    id: string,
    userId: string,
    name: string,
    icon: string, 
    color: string
    total: number
}