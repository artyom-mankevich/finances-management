export interface Wallet {
    id: string | null,
    userId: string,
    currency: string,
    balance: number,
    name: string,
    description: string,
    color: string,
    goal: number,
    lastUpdate: number | null
}
