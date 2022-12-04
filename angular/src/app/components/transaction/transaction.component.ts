import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TransactionTypes } from 'src/app/enums/transactionTypes';
import { Transaction } from 'src/app/models/transaction';
import { DataService } from 'src/app/services/data.service';
import { TransactionModalComponent } from '../transaction-modal/transaction-modal.component';

@Component({
  selector: 'app-transaction [transaction]',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  @Input()
  transaction! : Transaction;
  transactionType: TransactionTypes = TransactionTypes.Income;
  transactionTypes = TransactionTypes;
  constructor(private dialog: MatDialog, private ds: DataService) { 
  
  }

  openTransactionModal() {
    this.dialog.open(TransactionModalComponent,  { data: {transaction: {...this.transaction}}, panelClass: 'transaction-dialog'})
  }

  deleteTransaction() {
    if (this.transaction.id) {
      this.ds.deleteTransaction(this.transaction.id).subscribe();
    }
  }
  

  ngOnInit(): void {
    if (this.transaction.sourceWallet && this.transaction.targetWallet) {
      this.transactionType = TransactionTypes.Transfer;
    }
    else {
      this.transactionType  = this.transaction.sourceWallet ? TransactionTypes.Expense : TransactionTypes.Income;
    }
  }

}
