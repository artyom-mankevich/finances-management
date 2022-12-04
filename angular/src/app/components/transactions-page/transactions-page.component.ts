import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TransactionFilters } from 'src/app/enums/transactionFilters';
import { Transaction } from 'src/app/models/transaction';
import { TransactionCategory } from 'src/app/models/transactionCategory';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';
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
  transactions$: Observable<Transaction[]> = this.ds.getUserTransactions();
  categories$: Observable<TransactionCategory[]> = this.ds.getUserCategories();
  maxCategories: number = 5;
  showAllCategories: boolean = false;
  showAllText: string = 'Show All';
  
  selectFilter(filter: TransactionFilters) {
    this.selectedFilter = filter;
  }
  constructor(private dialog: MatDialog, private dss: DataStorageService, private ds: DataService) { 
  }
  ngOnInit(): void {
    console.log(this.transactions$);
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
      this.maxCategories = Infinity
      this.showAllText = 'Hide'

    }
    this.showAllCategories = !this.showAllCategories;
  }
  
  openModal() {
    this.dialog.open(TransactionModalComponent, {panelClass: 'transaction-dialog'});
  }

}
