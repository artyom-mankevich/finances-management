export interface StockChartData {
    data: {
        dates: [string],
        values: [number]
    }
    averagePrice: number
}