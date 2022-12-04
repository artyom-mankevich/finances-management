import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { ApiEndpoints, environment } from 'src/environments/environment';
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
  // private _tr: BehaviorSubject<TransactionRequest>;
  constructor(private http: HttpClient) {
    this._wallets = new BehaviorSubject<Wallet[]>([]);
    this._categories = new BehaviorSubject<TransactionCategory[]>([]);
    this._icons = new BehaviorSubject<Icon[]>([])
    this._transactions = new BehaviorSubject<Transaction[]>([]);
    this.getAvailableIcons();
  }

  private _getUserWallets(): void {
    this.http.get<Wallet[]>(`${this.url}${ApiEndpoints.wallets}`).subscribe(wallets => this._wallets.next(wallets.map(w => {
      if (w.lastUpdated) {
        w.lastUpdated *= 1000
      }
      return w;
    })));
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
    return this.http.post(`${this.url}${ApiEndpoints.transactionCategories}`, category).pipe(tap(() => this.getUserCategories()))
  }

  updateTransactionCategory(category: TransactionCategory) {
    return this.http.patch(`${this.url}${ApiEndpoints.transactionCategories}${category.id}/`, category).pipe(tap(() => this.getUserCategories()));
  }

  getUserTransactions() {
    this.http.get<TransactionRequest>(`${this.url}${ApiEndpoints.transactions}`).subscribe(tr => this._transactions.next(tr.results));
    return this._transactions.asObservable();
  }

  createTransaction(transaction: PostTransaction) {
    return this.http.post(`${this.url}${ApiEndpoints.transactions}`, transaction).pipe(tap(() => this.getUserTransactions()))
  }

  getUserWallets(): Observable<Wallet[]> {
    this._getUserWallets();
    return this._wallets.asObservable();

  }
}
