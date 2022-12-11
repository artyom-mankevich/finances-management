export interface WalletsBalanceChart {
    currentBalancesSum: number,
    data: {
        dates: string[],
        balances: number[],
        predicted: boolean[]
    }
}