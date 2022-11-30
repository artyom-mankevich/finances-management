import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiEndpoints, environment } from 'src/environments/environment';
import { Color } from '../models/color';
import { Currency } from '../models/currency';
import { Wallet } from '../models/wallet';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private url: string = environment.baseUrl;


 
  constructor(private http: HttpClient) {
  }

  createWallet(wallet: Wallet) {
    return this.http.post(`${this.url}${ApiEndpoints.wallets}`, wallet)
  }

  getWalletColors(): Observable<string[]> {
    return this.http.get<Color[]>(`${this.url}${ApiEndpoints.colors}`).pipe(map(colors => colors.map((color) => color.hex_code)));
  }

  getCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.url}${ApiEndpoints.currencies}`);
  }
}
