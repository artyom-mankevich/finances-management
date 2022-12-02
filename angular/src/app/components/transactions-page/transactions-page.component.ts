import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TransactionFilters } from 'src/app/enums/transactionFilters';
import { Transaction } from 'src/app/models/transaction';
import { TransactionModalComponent } from '../transaction-modal/transaction-modal.component';

@Component({
  selector: 'app-transactions-page',
  templateUrl: './transactions-page.component.html',
  styleUrls: ['./transactions-page.component.css']
})
export class TransactionsPageComponent implements OnInit {
  transactionFilters = TransactionFilters;
  transactionFiltersValues = Object.keys(this.transactionFilters);
  selectedFilter: TransactionFilters = TransactionFilters.All;
  transactions: Transaction[] = []
  selectFilter(filter: TransactionFilters) {
    this.selectedFilter = filter;
  }
  constructor(private dialog: MatDialog) { 
    for (let i = 0; i < 15; i++){
      this.transactions.push({
        id: null,
        userId: '',
        createdAt: Date.now(),
        type: {
          id: '',
          income: true,
          icon: 'house'},
        category: { 
          id: null,
          userId: '', 
          name: 'House',
          icon: 'string',
          color: '#3E68D1'},
        amount: 1000,
        currency: 'USD',
        sourceWallet: null,
        targetWallet: null,
        description: 'Renovation'
      })
    }
  }
  ngOnInit(): void {
  }

  openModal() {
    this.dialog.open(TransactionModalComponent);
  }

}
