export interface Wallet {
    id: string | null,
    userId: string,
    currency: string,
    balance: number,
    name: string,
    color: string,
    goal: number | null,
    lastUpdate: number | null
}
