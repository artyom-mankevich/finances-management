import { Wallet } from "./wallet";

export interface Debt { 
    id: string | null,
    userId: string,
    wallet: Wallet,
    expiresAt: number
}
