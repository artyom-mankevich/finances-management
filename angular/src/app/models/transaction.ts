import { TransactionCategory } from "./transactionCategory";
import { TransactionType } from "./transactionType";
import { Wallet } from "./wallet";

export interface Transaction {
    id: string | null,
    userId: string,
    createdAt: number,
    category: TransactionCategory | null,
    sourceAmount: number | null,
    targetAmount: number | null,
    sourceWallet: Wallet | null,
    targetWallet: Wallet | null,
    description: string | null
}

export interface TransactionRequest {
    count: number,
    next: string | null,
    previous: string | null,
    results: Transaction[]
}

export interface PostTransaction {
    id: string | null,
    sourceAmount: number | null,
    targetAmount: number | null, 
    sourceWallet: string | null,
    targetWallet: string | null,
    description: string | null,
    category: string | null
}
