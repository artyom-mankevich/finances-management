export interface AccountSettings {
    userId: string | null
    dateFormat: string,
    currencyFormat: string, // left || right
    startingPage: string,
    firstDay: number, // monday || saturday
    mainCurrency: string // code
}
