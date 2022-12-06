import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { config } from 'process';
import { Stock } from 'src/app/models/stock';
import { NewsFiltersModalComponent } from '../news-filters-modal/news-filters-modal.component';
import { StockModalComponent } from '../stock-modal/stock-modal.component';

@Component({
  selector: 'app-investments-page',
  templateUrl: './investments-page.component.html',
  styleUrls: ['./investments-page.component.css']
})
export class InvestmentsPageComponent implements OnInit {

  stocks: Stock[] = []

  constructor(private dialog: MatDialog) {
    for (let i = 0; i < 15; i++) {
      this.stocks.push({
        id: null,
        userId: null,
        amount: 1500,
        ticker: 'AAPL',
        price: 15000
      });
    }
  }

  openStockDialog() {
    this.dialog.open(StockModalComponent, {
      width: '300px',
      height: '300px'
    });
  }

  openNewsFilterDialog() {
    this.dialog.open(NewsFiltersModalComponent);
  }

  loadNextStocks() {

  }

  loadPreviousStocks() {
    
  }


  ngOnInit(): void {
  }

}
