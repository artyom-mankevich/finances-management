import { TransactionCategory } from "./transactionCategory";
import { TransactionType } from "./transactionType";
import { Wallet } from "./wallet";

export interface Transaction {
    id: string | null,
    userId: string,
    createdAt: number,
    category: TransactionCategory,
    sourceAmount?: number | null,
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
    results: Transaction[]
}

export interface PostTransaction {
    sourceAmount?: number | null,
    targetAmount?: number | null, 
    sourceWallet?: string | null,
    targetWallet?: string | null,
    description?: string,
    category: string
}
