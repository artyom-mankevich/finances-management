export interface Wallet {
    id: string | null,
    userId: string,
    currency: string,
    balance: string,
    name: string,
    description: string,
    color: string,
    goal: string
}
