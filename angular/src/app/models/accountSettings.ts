export interface AccountSettings {
    id: string | null,
    userId: string | null,
    dateFormat: string,
    currencyFormat: string, // left || right
    startPage: string,
    mainCurrency: string // code
}
