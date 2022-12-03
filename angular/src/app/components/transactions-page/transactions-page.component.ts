import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TransactionFilters } from 'src/app/enums/transactionFilters';
import { Transaction } from 'src/app/models/transaction';
import { TransactionCategory } from 'src/app/models/transactionCategory';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { CategoryModalComponent } from '../category-modal/category-modal.component';
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
  categories: TransactionCategory[] = [];
  maxCategories: number = 5;
  showAllCategories: boolean = false;
  showAllText: string = 'Show All';
  
  selectFilter(filter: TransactionFilters) {
    this.selectedFilter = filter;
  }
  constructor(private dialog: MatDialog, private dss: DataStorageService) { 
    for (let i = 0; i < 15; i++){
      this.transactions.push({
        id: null,
        userId: '',
        createdAt: Date.now(),
        type: {
          id: '',
          income: true,
          icon: 'arrow_upwards'},
        category: { 
          id: null,
          userId: '', 
          name: 'House',
          icon: 'cottage',
          color: dss.colors[Math.floor(Math.random() * dss.colors.length)]},
        amount: 1000,
        currency: 'USD',
        sourceWallet: null,
        targetWallet: null,
        description: 'Renovation'
      })
      this.categories.push({
        id: null,
        userId: '',
        name: Math.random().toString(36).slice(2, 7),
        icon: 'cottage',
        color:  dss.colors[Math.floor(Math.random() * dss.colors.length)]
      })
    }
  }
  ngOnInit(): void {
  }

  openCategoryModal(category?: TransactionCategory) {
    if (category) {
      this.dialog.open(CategoryModalComponent, { data: { category: { ...category } }});
      return;
    }
    this.dialog.open(CategoryModalComponent);

  }

  showAllCateogires() {
    if (this.showAllCategories) {
      this.maxCategories = 5;
      this.showAllText = 'Show All'
    }
    else {
      this.maxCategories = this.categories.length;
      this.showAllText = 'Hide'

    }
    this.showAllCategories = !this.showAllCategories;
  }
  
  openModal() {
    this.dialog.open(TransactionModalComponent, {panelClass: 'transaction-dialog'});
  }

}
