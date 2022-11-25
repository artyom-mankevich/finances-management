import { TransactionType } from "./transactionType";

export interface Transaction {
    id: string | null,
    userId: string,
    created_at: number,
    type: TransactionType,
    caterogry: string,
    amount: string,
    currency: string,
    sourceWallet: string,
    targetWallet: string,
    description: string
}
