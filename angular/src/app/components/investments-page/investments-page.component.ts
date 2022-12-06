import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { StockRequest } from 'src/app/models/stock';
import { DataService } from 'src/app/services/data.service';
import { NewsFiltersModalComponent } from '../news-filters-modal/news-filters-modal.component';
import { StockModalComponent } from '../stock-modal/stock-modal.component';

@Component({
  selector: 'app-investments-page',
  templateUrl: './investments-page.component.html',
  styleUrls: ['./investments-page.component.css']
})
export class InvestmentsPageComponent implements OnInit {

  stocks$: Observable<StockRequest | undefined> = this.ds.getUserStocks();

  constructor(private dialog: MatDialog, private ds: DataService) { }

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
    this.ds.getUserStocksNext();
  }

  loadPreviousStocks() {
    this.ds.getUserStocksPrevious();
  }

  ngOnInit(): void {
  }

}
