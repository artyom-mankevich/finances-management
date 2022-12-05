import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { ApiEndpoints, environment } from 'src/environments/environment';
import { TransactionFilters } from '../enums/transactionFilters';
import { TransactionTypes } from '../enums/transactionTypes';
import { Color } from '../models/color';
import { Currency } from '../models/currency';
import { Icon } from '../models/icon';
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
  private _transactionsRequest: BehaviorSubject<TransactionRequest | undefined>;

  transactionFilter: TransactionFilters = TransactionFilters.All;
  moreTransactions: boolean = false;
  constructor(private http: HttpClient) {
    this._wallets = new BehaviorSubject<Wallet[]>([]);
    this._categories = new BehaviorSubject<TransactionCategory[]>([]);
    this._icons = new BehaviorSubject<Icon[]>([])
    this._transactions = new BehaviorSubject<Transaction[]>([]);
    this._transactionsRequest = new BehaviorSubject<TransactionRequest | undefined>(undefined);
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
    this.http.get<Icon[]>(`${this.url}${ApiEndpoints.icons}`).subscribe(icons => this._icons.next(icons))
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
    return this.http.patch(`${this.url}${ApiEndpoints.wallets}${wallet.id}/`, wallet).pipe(tap(() => this._getUserWallets()));
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

  getUserTransactions(filter: TransactionFilters ) {
    if (this._transactions.value.length === 0 || filter !== this.transactionFilter) {
      this.transactionFilter = filter;
      let httpParams: HttpParams = new HttpParams();
      if (this.transactionFilter !== TransactionFilters.All){
        httpParams = httpParams.append('type', filter.toLowerCase());
      }
      this.http.get<TransactionRequest>(`${this.url}${ApiEndpoints.transactions}`, {params: httpParams}).subscribe(tr => {
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
    return this.http.post<Transaction>(`${this.url}${ApiEndpoints.transactions}`, transaction).pipe(tap((transaction: Transaction) =>  { 
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

  getTransactionsRequest() {
    return this._transactionsRequest.asObservable();
  }
}
