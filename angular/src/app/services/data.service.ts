import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { ApiEndpoints, environment } from 'src/environments/environment';
import { Color } from '../models/color';
import { Currency } from '../models/currency';
import { Wallet } from '../models/wallet';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private url: string = environment.baseUrl;
  private _wallets: BehaviorSubject<Wallet[]>;

 
  constructor(private http: HttpClient) {
    this._wallets = new BehaviorSubject<Wallet[]>([]);
  }

  private _getUserWallets(): void {
    this.http.get<Wallet[]>(`${this.url}${ApiEndpoints.wallets}`).subscribe(wallets => this._wallets.next(wallets));
  }

  createWallet(wallet: Wallet) {
    return this.http.post(`${this.url}${ApiEndpoints.wallets}`, wallet).pipe(tap(() => this._getUserWallets()));
  }

  getWalletColors(): Observable<string[]> {
    return this.http.get<Color[]>(`${this.url}${ApiEndpoints.colors}`).pipe(map(colors => colors.map((color) => color.hex_code)));
  }

  getCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.url}${ApiEndpoints.currencies}`);
  }

  updateWallet(wallet: Wallet) {
    return this.http.patch(`${this.url}${ApiEndpoints.wallets}${wallet.id}/`, wallet).pipe(tap(() => this._getUserWallets()));
  }

  getUserWallets(): Observable<Wallet[]>{
    this._getUserWallets();
    return this._wallets.asObservable();

  }
}
