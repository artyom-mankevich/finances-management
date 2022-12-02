import { TransactionCategory } from "./transactionCategory";
import { TransactionType } from "./transactionType";
import { Wallet } from "./wallet";

export interface Transaction {
    id: string | null,
    userId: string,
    createdAt: number,
    type: TransactionType,
    category: TransactionCategory,
    amount: number,
    currency: string,
    sourceWallet: Wallet | null,
    targetWallet: Wallet | null,
    description?: string
}
