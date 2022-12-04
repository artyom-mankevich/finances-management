import { TransactionCategory } from "./transactionCategory";
import { TransactionType } from "./transactionType";
import { Wallet } from "./wallet";

export interface Transaction {
    id: string | null,
    userId: string,
    createdAt: number,
    category: TransactionCategory,
    sourceAmount?: number,
    targetAmount?: number | null,
    currency: string,
    sourceWallet: Wallet | null,
    targetWallet: Wallet | null,
    description?: string
}

export interface TransactionRequest {
    count: number,
    next: string | null,
    previous: string | null,
    result: Transaction[]
}

export interface PostTransaction {
    sourceAmount?: number | null,
    targetAmount?: number | null, 
    souceWallet?: string | null,
    targetWallet?: string | null,
    description?: string
}
