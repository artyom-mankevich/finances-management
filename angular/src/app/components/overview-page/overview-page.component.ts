import { Component, OnInit } from '@angular/core';
import { TransactionFilters } from 'src/app/enums/transactionFilters';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.css']
})
export class OverviewPageComponent implements OnInit {
  wallets$ = this.ds.getUserWallets();
  transactions$ = this.ds.getUserTransactions(TransactionFilters.All);
  constructor(private ds: DataService) { }

  ngOnInit(): void {
  }

}
