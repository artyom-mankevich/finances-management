export interface Investment {
    id: string | null,
    userId: string | null,
    balance: number,
    currency: string,
    percent: number,
    color: string,
    name: string,
    description: string,
    createdAt: number | null
}
