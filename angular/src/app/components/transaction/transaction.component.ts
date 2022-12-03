import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Transaction } from 'src/app/models/transaction';
import { TransactionModalComponent } from '../transaction-modal/transaction-modal.component';

@Component({
  selector: 'app-transaction [transaction]',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  @Input()
  transaction! : Transaction;
  constructor(private dialog: MatDialog) { }

  openTransactionModal() {
    this.dialog.open(TransactionModalComponent,  { data: {transaction: {...this.transaction}}, panelClass: 'transaction-dialog'})
  }

  ngOnInit(): void {
  }

}
