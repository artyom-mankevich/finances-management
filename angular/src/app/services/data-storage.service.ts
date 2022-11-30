import { Injectable } from '@angular/core';
import { Currency } from '../models/currency';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  colors: string[] = [];
  currencies: Currency[] = []
  constructor(private ds: DataService) {
    this.ds.getWalletColors().subscribe(c => this.colors = c);
    this.ds.getCurrencies().subscribe(c => this.currencies = c);
  }
}
