export interface Stock {
    id: string | null,
    userId: string | null,
    amount: number,
    ticker: string,
    price: number | null
}


export interface StockRequest {
    count: number, 
    next: string | null,
    previous: string | null,
    results: Stock[]
}