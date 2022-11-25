export interface Investment {
    id: string | null,
    userId: string,
    wallet: string,
    percent: number,
    name: string,
    description: string,
    color: string,
    currency: string
}
