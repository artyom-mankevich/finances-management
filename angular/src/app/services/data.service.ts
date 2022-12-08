import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { ApiEndpoints, environment } from 'src/environments/environment';
import { ChartDateOptions } from '../enums/chartDateOptions';
import { TransactionFilters } from '../enums/transactionFilters';
import { TransactionTypes } from '../enums/transactionTypes';
import { Color } from '../models/color';
import { Currency } from '../models/currency';
import { Icon } from '../models/icon';
import { News } from '../models/news';
import { NewsFilter } from '../models/newsFilter';
import { NewsLanguage } from '../models/newsLanguages';
import { Stock, StockRequest } from '../models/stock';
import { StockChartData } from '../models/stockChartData';
import { PostTransaction, Transaction, TransactionRequest } from '../models/transaction';
import { TransactionCategory } from '../models/transactionCategory';
import { Wallet } from '../models/wallet';

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
  private stockChartPeriod: ChartDateOptions = ChartDateOptions.Week;
  transactionFilter: TransactionFilters = TransactionFilters.All;
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
    this.getAvailableIcons();
  }

  private getTransactionType(transaction: Transaction): TransactionTypes {
    if (transaction.sourceWallet && !transaction.targetWallet) return TransactionTypes.Expense;
    if (!transaction.sourceWallet && transaction.targetWallet) return TransactionTypes.Income;
    return TransactionTypes.Transfer;
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
    return this.http.post(`${this.url}${ApiEndpoints.wallets}`, wallet).pipe(tap(() => this._getUserWallets()));
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
    return this.http.delete(`${this.url}${ApiEndpoints.transactions}${transactionId}/`).pipe(tap(() => this._transactions.next(this._transactions.value.filter(transaction => transaction.id !== transactionId))));
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
      if (this.getTransactionType(transaction).toString() === this.transactionFilter || this.transactionFilter === TransactionFilters.All) {
        this._transactions.next([transaction, ...this._transactions.value]);
      }
    }));
  }

  updateTransaction(transaction: PostTransaction) {
    return this.http.put<Transaction>(`${this.url}${ApiEndpoints.transactions}${transaction.id}/`, transaction).pipe(tap((transaction: Transaction) => {
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
    }))
  }

  createStock(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>(`${this.url}${ApiEndpoints.stocks}`, stock).pipe(tap(() => this.getUserStocks(true)));
  }

  updateStock(stock: Stock) {
    return this.http.put<Stock>(`${this.url}${ApiEndpoints.stocks}${stock.id}/`, stock).pipe(tap((stock: Stock) => {
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
    return this.http.delete(`${this.url}${ApiEndpoints.stocks}${stockId}/`).pipe(tap(() => this.getUserStocks(true)));
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

  getUserNews(): Observable<News[]> {
    if (this._news.value.length === 0) {
      this.http.get<News[]>(`${this.url}${ApiEndpoints.news}`).subscribe(news => this._news.next(news));
    }
    return this._news.asObservable();
  }

  getUserStockChart(period: ChartDateOptions) {
    if (!this._stockChartData.value || period !== this.stockChartPeriod) {
      this.stockChartPeriod = period;
      let httpParams: HttpParams = new HttpParams().set('period', '7d');
      if (this.stockChartPeriod === ChartDateOptions.Month) httpParams = httpParams.set('period', '1mo');
      if (this.stockChartPeriod === ChartDateOptions.ThreeMonths) httpParams = httpParams.set('period', '3mo');
      if (this.stockChartPeriod === ChartDateOptions.Year) httpParams = httpParams.set('period', '1y');

      this.http.get<StockChartData>(`${this.url}${ApiEndpoints.stockChartData}`, { params: httpParams }).pipe(map(response => ({ averagePrice: response.averagePrice, data: new Map(Object.entries(response.data)) }))).subscribe(val => this._stockChartData.next(val));
    }
    return this._stockChartData.asObservable();
  }
}
