import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';

@Component({
  selector: 'app-transaction [transaction]',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  @Input()
  transaction! : Transaction;
  constructor() { }

  ngOnInit(): void {
  }

}
