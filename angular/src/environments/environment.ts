// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  authDomain: 'dev-16fr5mnt2b0eess4.us.auth0.com',
  authClientId: 'Wur3VjLXBn65LDBssrSiug7h0hWDFf1H',
  authAudience: 'https://finances-be.com/',
  baseUrl: 'http://localhost:8087/v2/'
};

export enum ApiEndpoints  {
  wallets = 'wallets/',
  colors = 'colors/',
  currencies = 'currencies/',
  transactionCategories = 'transaction-categories/',
  icons = 'icons/',
  transactions = 'transactions/',
  stocks = 'stocks/',
  newsFilter = 'news-filters/',
  availableNewsLanguages = 'news-languages/',
  news = 'news/',
  stockChartData ='stocks/chart-data/'
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
