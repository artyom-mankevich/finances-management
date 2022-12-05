import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  constructor(private http: HttpClient) { }

  getExchange(amount: number, sourceCurrency: string, targetCurrency: string): Observable<string> {
    return this.http.get<string>(`https://api.exchangerate.host/convert?from=${sourceCurrency}&to=${targetCurrency}&amount=${amount}`)
  }
}
