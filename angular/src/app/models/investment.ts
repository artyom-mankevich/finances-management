import { Wallet } from "./wallet";

export interface Investment {
    id: string | null,
    userId: string,
    wallet: Wallet,
    percent: number,
    name: string,
    description: string,
    color: string,
    currency: string
}
