import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap } from 'rxjs';
import { ApiEndpoints, environment } from 'src/environments/environment';
import { ChartDateOptions } from '../enums/chartDateOptions';
import { TransactionFilters } from '../enums/transactionFilters';
import { TransactionTypes } from '../enums/transactionTypes';
import { AccountSettings } from '../models/accountSettings';
import { AnalyticsCategoires } from '../models/analyticsCategories';
import { Color } from '../models/color';
import { Currency } from '../models/currency';
import { Debt, DebtPayment } from '../models/debt';
import { EthereumTransfer, EthereumTransferDisplay } from '../models/ethereumTransfer';
import { EthereumWallet } from '../models/ethereumWallet';
import { EthKeys } from '../models/ethKeys';
import { Icon } from '../models/icon';
import { News } from '../models/news';
import { NewsFilter } from '../models/newsFilter';
import { NewsLanguage } from '../models/newsLanguages';
import { Stock, StockRequest } from '../models/stock';
import { StockChartData } from '../models/stockChartData';
import { PostTransaction, Transaction, TransactionRequest } from '../models/transaction';
import { TransactionCategory } from '../models/transactionCategory';
import { TransactionsChart } from '../models/transactionsChart';
import { Wallet } from '../models/wallet';
import { WalletsBalanceChart } from '../models/walletsBalanceChart';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private url: string = environment.baseUrl;
  private _wallets: BehaviorSubject<Wallet[]>;
  private _categories: BehaviorSubject<TransactionCategory[]>;
  private _icons: BehaviorSubject<Icon[]>;
  private _transactions: BehaviorSubject<Transaction[]>;
  private _stockRequest: BehaviorSubject<StockRequest | undefined>;
  private _newsLanguages: BehaviorSubject<NewsLanguage[]>;
  private _transactionsRequest: BehaviorSubject<TransactionRequest | undefined>;
  private _newsFilter: BehaviorSubject<NewsFilter | undefined>;
  private _news: BehaviorSubject<News[]>;
  private _stockChartData: BehaviorSubject<StockChartData | undefined>;
  private _analyticsCategories: BehaviorSubject<AnalyticsCategoires | undefined>;
  private _walletsBalanceChart: BehaviorSubject<WalletsBalanceChart | undefined>;
  private _transactionsAmountChart: BehaviorSubject<TransactionsChart | undefined>;
  private _cryptoWallets: BehaviorSubject<EthereumWallet[]>;
  private _ethereumTransactions: BehaviorSubject<EthereumTransferDisplay[]>
  private _debts: BehaviorSubject<Debt[]>;
  private _userSettings: BehaviorSubject<AccountSettings | undefined>
  stockChartPeriod: ChartDateOptions = ChartDateOptions.Week;
  transactionFilter: TransactionFilters = TransactionFilters.All;
  walletsChartPeriod: ChartDateOptions = ChartDateOptions.Week;
  moreTransactions: boolean = false;
  constructor(private http: HttpClient) {
    this._wallets = new BehaviorSubject<Wallet[]>([]);
    this._categories = new BehaviorSubject<TransactionCategory[]>([]);
    this._icons = new BehaviorSubject<Icon[]>([])
    this._transactions = new BehaviorSubject<Transaction[]>([]);
    this._transactionsRequest = new BehaviorSubject<TransactionRequest | undefined>(undefined);
    this._newsFilter = new BehaviorSubject<NewsFilter | undefined>(undefined);
    this._stockRequest = new BehaviorSubject<StockRequest | undefined>(undefined);
    this._newsLanguages = new BehaviorSubject<NewsLanguage[]>([]);
    this._news = new BehaviorSubject<News[]>([]);
    this._stockChartData = new BehaviorSubject<StockChartData | undefined>(undefined);
    this._analyticsCategories = new BehaviorSubject<AnalyticsCategoires | undefined>(undefined);
    this._walletsBalanceChart = new BehaviorSubject<WalletsBalanceChart | undefined>(undefined);
    this._transactionsAmountChart = new BehaviorSubject<TransactionsChart | undefined>(undefined);
    this._ethereumTransactions = new BehaviorSubject<EthereumTransferDisplay[]>([]);
    this._cryptoWallets = new BehaviorSubject<EthereumWallet[]>([]);
    this._debts = new BehaviorSubject<Debt[]>([]);
    this._userSettings = new BehaviorSubject<AccountSettings | undefined>(undefined);
    this.getAvailableIcons();
    this._prefetchData();
  }

  private getTransactionType(transaction: Transaction): TransactionTypes {
    if (transaction.sourceWallet && !transaction.targetWallet) return TransactionTypes.Expense;
    if (!transaction.sourceWallet && transaction.targetWallet) return TransactionTypes.Income;
    return TransactionTypes.Transfer;
  }

  private _prefetchData() {
    this.getUserSettings();
    this.getUserWallets();
    this.getUserCategories();
    this.getUserTransactions(this.transactionFilter);
    this.getUserNews();
    this.getUserStocks();
    this.getUserNewsFilter()
    this.getAvailableNewsLanguages();
    this.getUserStockChart(this.stockChartPeriod);
    this.getUsersTopCategories();
    this.getUsersWalletsData(this.walletsChartPeriod);
    this.getUsersTransactionsData();
    this.getusersCryptoWallets();
    this.getUsersEtheremTransactions();
  }

  private _getUserWallets(): void {
    this.http.get<Wallet[]>(`${this.url}${ApiEndpoints.wallets}`).subscribe(wallets => this._wallets.next(wallets))
  }

  getAvailableIcons(): Observable<Icon[]> {
    if (this._icons.value.length === 0) {
      this.http.get<Icon[]>(`${this.url}${ApiEndpoints.icons}`).subscribe(icons => this._icons.next(icons))
    }
    return this._icons.asObservable();
  }

  createWallet(wallet: Wallet) {
    return this.http.post(`${this.url}${ApiEndpoints.wallets}`, wallet).pipe(tap(() => {
      this._getUserWallets();
      this.getUsersWalletsData(this.walletsChartPeriod, true);
    }));
  }

  getWalletColors(): Observable<string[]> {
    return this.http.get<Color[]>(`${this.url}${ApiEndpoints.colors}`).pipe(map(colors => colors.map((color) => color.hexCode)));
  }

  getCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.url}${ApiEndpoints.currencies}`);
  }

  updateWallet(wallet: Wallet) {
    return this.http.patch(`${this.url}${ApiEndpoints.wallets}${wallet.id}/`, wallet).pipe(tap(() => {
      this._getUserWallets();
      this.getUserTransactions(this.transactionFilter, true);
      this.getUsersWalletsData(this.walletsChartPeriod, true);
      this.getUsersTransactionsData(true);
    }));
  }

  getUserCategories(): Observable<TransactionCategory[]> {
    this.http.get<TransactionCategory[]>(`${this.url}${ApiEndpoints.transactionCategories}`).subscribe(cateogires => this._categories.next(cateogires));
    return this._categories.asObservable();
  }

  createTransactionCategory(category: TransactionCategory) {
    return this.http.post<TransactionCategory>(`${this.url}${ApiEndpoints.transactionCategories}`, category).pipe(tap((category: TransactionCategory) => this._categories.next([category, ...this._categories.value])))
  }

  deleteTransaction(transactionId: string) {
    return this.http.delete(`${this.url}${ApiEndpoints.transactions}${transactionId}/`).pipe(tap(() => {
      this._transactions.next(this._transactions.value.filter(transaction => transaction.id !== transactionId))
      this.getUsersTransactionsData(true);
      this.getUsersTopCategories(true);
      this.getUsersWalletsData(this.walletsChartPeriod, true);

    }));
  }

  updateTransactionCategory(category: TransactionCategory) {
    return this.http.patch<TransactionCategory>(`${this.url}${ApiEndpoints.transactionCategories}${category.id}/`, category).pipe(tap((category: TransactionCategory) => {
      this._categories.next(this._categories.value.map((cat: TransactionCategory) => cat.id === category.id ? category : cat));
      this._transactions.next(
        this._transactions.value.map((tr: Transaction) => {
          if (tr.category?.id === category.id) tr.category = category;
          return tr;
        })
      );
    }));
  }

  getUserTransactions(filter: TransactionFilters, force: boolean = false) {
    if (this._transactions.value.length === 0 || filter !== this.transactionFilter || force) {
      this.transactionFilter = filter;
      let httpParams: HttpParams = new HttpParams();
      if (this.transactionFilter !== TransactionFilters.All) {
        httpParams = httpParams.append('type', filter.toLowerCase());
      }
      this.http.get<TransactionRequest>(`${this.url}${ApiEndpoints.transactions}`, { params: httpParams }).subscribe(tr => {
        this._transactions.next(tr.results);
        this.moreTransactions = tr.next ? true : false;
        this._transactionsRequest?.next(tr);
      });
    }

    return this._transactions.asObservable();
  }

  getMoreTransactions() {
    if (this._transactionsRequest.value && this._transactionsRequest.value.next) {
      this.http.get<TransactionRequest>(this._transactionsRequest.value.next).subscribe(tr => {
        this._transactionsRequest.next(tr);
        this.moreTransactions = tr.next ? true : false;
        this._transactions.next([...this._transactions.value, ...tr.results]);
      });
    }
  }

  createTransaction(transaction: PostTransaction) {
    return this.http.post<Transaction>(`${this.url}${ApiEndpoints.transactions}`, transaction).pipe(tap((transaction: Transaction) => {
      this.getUsersTransactionsData(true);
      this.getUsersTopCategories(true);
      this.getUsersWalletsData(this.walletsChartPeriod, true);
      if (this.getTransactionType(transaction).toString() === this.transactionFilter || this.transactionFilter === TransactionFilters.All) {
        this._transactions.next([transaction, ...this._transactions.value]);
      }
    }));
  }

  updateTransaction(transaction: PostTransaction) {
    return this.http.put<Transaction>(`${this.url}${ApiEndpoints.transactions}${transaction.id}/`, transaction).pipe(tap((transaction: Transaction) => {
      this.getUsersTransactionsData(true);
      this.getUsersTopCategories(true);
      this.getUsersWalletsData(this.walletsChartPeriod, true);
      this._transactions.next(
        this._transactions.value.map((tr: Transaction) => tr.id === transaction.id ? transaction : tr)
      )
    }));
  }

  getUserWallets(): Observable<Wallet[]> {
    this._getUserWallets();
    return this._wallets.asObservable();
  }

  deleteWallet(walletId: string) {
    return this.http.delete(`${this.url}${ApiEndpoints.wallets}${walletId}/`).pipe(tap(() => {
      this.getUserWallets();
      this.getUserTransactions(this.transactionFilter, true);
      this.getUsersWalletsData(this.walletsChartPeriod, true);
    }))
  }

  getTransactionsRequest() {
    return this._transactionsRequest.asObservable();
  }

  getNumberOfCategories() {
    return this._categories.value.length;
  }

  deleteCategory(categoryId: string) {
    return this.http.delete(`${this.url}${ApiEndpoints.transactionCategories}${categoryId}/`).pipe(tap(() => {
      this.getUserCategories();
      this.getUserTransactions(this.transactionFilter, true);
      this.getUsersTransactionsData(true);
    }))
  }

  createStock(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>(`${this.url}${ApiEndpoints.stocks}`, stock).pipe(tap(() => {
      this.getUserNews(true);
      this.getUserStocks(true);
      this.getUserStockChart(this.stockChartPeriod, true);
    }));
  }

  updateStock(stock: Stock) {
    return this.http.put<Stock>(`${this.url}${ApiEndpoints.stocks}${stock.id}/`, stock).pipe(tap((stock: Stock) => {
      this.getUserStockChart(this.stockChartPeriod, true);
      this.getUserNews(true);
      let stockResults = this._stockRequest.value?.results.map((st: Stock) => {
        if (st.id === stock.id) st = stock;
        return st;
      })
      let val = this._stockRequest.value;
      if (val?.results && stockResults) {
        val.results = stockResults;
        this._stockRequest.next(val);
      }
    }))
  }

  deleteStock(stockId: string) {
    return this.http.delete(`${this.url}${ApiEndpoints.stocks}${stockId}/`).pipe(tap(() => {
      this.getUserStocks(true);
      this.getUserNews(true);
      this.getUserStockChart(this.stockChartPeriod, true);
    }));
  }

  _getUserNewsFilter() {
    this.http.get<NewsFilter>(`${this.url}${ApiEndpoints.newsFilter}`).subscribe(nf => this._newsFilter.next(nf));
  }

  getAvailableNewsLanguages(): Observable<NewsLanguage[]> {
    this.http.get<NewsLanguage[]>(`${this.url}${ApiEndpoints.availableNewsLanguages}`).subscribe(result => this._newsLanguages.next(result));
    return this._newsLanguages.asObservable();
  }
  getUserNewsFilter() {
    this._getUserNewsFilter();
    return this._newsFilter.asObservable();
  }

  _getUserStocks(url: string) {
    this.http.get<StockRequest>(url).subscribe(result => this._stockRequest.next(result));
  }

  getUserStocks(force: boolean = false): Observable<StockRequest | undefined> {
    if (!this._stockRequest.value || force) {
      this._getUserStocks(`${this.url}${ApiEndpoints.stocks}`);
    }
    return this._stockRequest.asObservable();
  }

  getUserStocksNext(): Observable<StockRequest | undefined> {
    if (this._stockRequest.value && this._stockRequest.value.next) {
      this._getUserStocks(this._stockRequest.value.next)
    }
    return this._stockRequest.asObservable();
  }

  getUserStocksPrevious(): Observable<StockRequest | undefined> {
    if (this._stockRequest.value && this._stockRequest.value.previous) {
      this._getUserStocks(this._stockRequest.value.previous)
    }
    return this._stockRequest.asObservable();
  }

  getUserNews(force: boolean = false): Observable<News[]> {
    if (this._news.value.length === 0 || force) {
      this.http.get<News[]>(`${this.url}${ApiEndpoints.news}`).subscribe(news => this._news.next(news));
    }
    return this._news.asObservable();
  }

  getUserStockChart(period: ChartDateOptions, force: boolean = false) {
    if (!this._stockChartData.value || period !== this.stockChartPeriod || force) {
      this.stockChartPeriod = period;
      let httpParams: HttpParams = new HttpParams().set('period', '7d');
      if (this.stockChartPeriod === ChartDateOptions.Month) httpParams = httpParams.set('period', '1mo');
      if (this.stockChartPeriod === ChartDateOptions.ThreeMonths) httpParams = httpParams.set('period', '3mo');
      if (this.stockChartPeriod === ChartDateOptions.Year) httpParams = httpParams.set('period', '1y');

      this.http.get<StockChartData>(`${this.url}${ApiEndpoints.stockChartData}`, { params: httpParams }).subscribe(val => this._stockChartData.next(val));
    }
    return this._stockChartData.asObservable();
  }

  addLanguageFilter(code: string) {
    let filter: NewsFilter | undefined = this._newsFilter.value;
    if (filter && !filter?.languages) {
      filter.languages = []
    }
    filter?.languages.push(code);
    this._newsFilter.next(filter);
  }

  removeLanguageFilter(code: string) {
    let filter: NewsFilter | undefined = this._newsFilter.value;
    if (filter && filter.languages) {
      filter.languages = filter.languages.filter(val => {
        return val !== code;
      })
      this._newsFilter.next(filter);
    }
  }

  updateNewsFilter() {
    return this.http.put(`${this.url}${ApiEndpoints.newsFilter}${this._newsFilter.value?.id}/`, this._newsFilter.value).pipe(tap(() => this.getUserNews(true)));
  }

  getUsersTopCategories(force: boolean = false): Observable<AnalyticsCategoires | undefined> {
    if (!this._analyticsCategories.value || force) {
      this.http.get<AnalyticsCategoires>(`${this.url}${ApiEndpoints.topCategories}`).subscribe(val => this._analyticsCategories.next(val));
    }
    return this._analyticsCategories.asObservable();
  }

  getUsersWalletsData(period: ChartDateOptions, force: boolean = false): Observable<WalletsBalanceChart | undefined> {

    if (force || !this._walletsBalanceChart.value || period !== this.walletsChartPeriod) {
      this.walletsChartPeriod = period;
      let httpParams: HttpParams = new HttpParams().set('period', '7d');
      if (period === ChartDateOptions.Month) httpParams = httpParams.set('period', '1mo');
      if (period === ChartDateOptions.ThreeMonths) httpParams = httpParams.set('period', '3mo');
      if (period === ChartDateOptions.Year) httpParams = httpParams.set('period', '1y');
      this.http.get<WalletsBalanceChart>(`${this.url}${ApiEndpoints.walletsBalance}`, { params: httpParams }).subscribe(val => this._walletsBalanceChart.next(val));
    }
    return this._walletsBalanceChart.asObservable();
  }

  getUsersTransactionsData(force: boolean = false) {
    if (!this._transactionsAmountChart.value || force) {
      this.http.get<TransactionsChart>(`${this.url}${ApiEndpoints.transactionsAmount}`).subscribe(val => this._transactionsAmountChart.next(val));
    }
    return this._transactionsAmountChart.asObservable();
  }
  addCryptoWallet(ethKeys: EthKeys) {
    return this.http.post<EthereumWallet>(`${this.url}${ApiEndpoints.ethKeys}`, ethKeys).pipe(tap((ew) => this._cryptoWallets.next([...this._cryptoWallets.value, ew])))
  }

  getusersCryptoWallets(force: boolean = false): Observable<EthereumWallet[]> {
    if (this._cryptoWallets.value.length === 0 || force) {
      this.http.get<EthereumWallet[]>(`${this.url}${ApiEndpoints.ethKeys}`).subscribe(val => this._cryptoWallets.next(val));
    }
    return this._cryptoWallets.asObservable();
  }

  deleteCryptoWallet(wallet: EthereumWallet) {
    this._cryptoWallets.next(this._cryptoWallets.value.filter(ew => ew.id !== wallet.id));

    return this.http.delete(`${this.url}${ApiEndpoints.ethKeys}${wallet.id}/`).pipe(catchError((err: any) => {
      this._cryptoWallets.next([...this._cryptoWallets.value, wallet]);
      return err;
    }))
  }

  makeEthTransfer(transfer: EthereumTransfer) {
    return this.http.post(`${this.url}${ApiEndpoints.ethereumTransfer}`, transfer);
  }

  getUsersEtheremTransactions(force: boolean = false) {
    if (force || this._ethereumTransactions.value.length === 0) {
      this.http.get<EthereumTransferDisplay[]>(`${this.url}${ApiEndpoints.ethereumtransactions}`).subscribe(val => this._ethereumTransactions.next(val));
    }
    return this._ethereumTransactions.asObservable();
  }

  getUsersDebts(force: boolean = false) {
    if (this._debts.value.length === 0 || force) {
      this.http.get<Debt[]>(`${this.url}${ApiEndpoints.debts}`).subscribe(debts => this._debts.next(debts));
    }
    return this._debts.asObservable();
  }

  createDebt(debt: Debt) {
    return this.http.post<Debt>(`${this.url}${ApiEndpoints.debts}`, debt).pipe(tap((debt) => this._debts.next([debt, ...this._debts.value])))
  }

  updateDebt(debt: Debt) {
    return this.http.put<Debt>(`${this.url}${ApiEndpoints.debts}${debt.id}/`, debt).pipe(tap((debt) => {
      this._debts.next(this._debts.value.map((d: Debt) => d.id === debt.id ? debt : d))
    }))
  }

  createDebtPayment(payment: DebtPayment) {
    return this.http.post<Debt>(`${this.url}${ApiEndpoints.debtPayment}`, payment).pipe(tap((debt) => {
      this._debts.next(this._debts.value.map((d: Debt) => d.id === debt.id ? debt : d))
    }));
  }

  deleteDebt(debt: Debt) {
    return this.http.delete(`${this.url}${ApiEndpoints.debts}${debt.id}/`).pipe(tap(() => this._debts.next(this._debts.value.filter(d => d.id !== debt.id))))
  }

  saveUserSettings(accountSettings: AccountSettings) {
    return this.http.post<AccountSettings>(`${this.url}${ApiEndpoints.userSettings}`, accountSettings).pipe(tap(val => this._userSettings.next(val)));
  }

  getUserSettings(): Observable<AccountSettings | undefined> {
    if (!this._userSettings.value) {
      this.http.get<AccountSettings>(`${this.url}${ApiEndpoints.userSettings}`).subscribe(val => this._userSettings.next(val));
    }
    return this._userSettings.asObservable();
  }

  getUserSettingsValue() {
    return this._userSettings.value;
  }
}
