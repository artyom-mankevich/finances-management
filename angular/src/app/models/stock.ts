export interface Stock {
    id: string | null,
    userId: string,
    amount: string,
    currency: string,
    sourceWallet: string,
    targetWallet: string,
    description: string
}
