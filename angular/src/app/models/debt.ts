import { Wallet } from "./wallet";

export interface Debt { 
    id: string | null,
    userId: string | null,
    currency: string,
    balance: number,
    name: string,
    goal: number,
    expiresAt: number
}

export interface DebtPayment {
    debt: string,
    amount: number
}