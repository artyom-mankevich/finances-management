import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TransactionModalModes } from 'src/app/enums/transactionModalModes';
import { TransactionTypes } from 'src/app/enums/transactionTypes';
import { Transaction } from 'src/app/models/transaction';
import { DataStorageService } from 'src/app/services/data-storage.service';

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.css']
})
export class TransactionModalComponent implements OnInit {
  modalMode: TransactionModalModes = TransactionModalModes.Create;
  transactionTypes = TransactionTypes;
  selectedType: TransactionTypes = TransactionTypes.Income;

  transaction: Transaction = {
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
      color: '#7A3EF8'},
    amount: 0,
    currency: 'USD',
    sourceWallet: null,
    targetWallet: null,
    description: 'Description'
  }

  form: FormGroup;
  constructor(private fb: FormBuilder, public dss: DataStorageService) {
    this.form = this.fb.group({

    })
  }

  changeColor(color: string): void {
    this.transaction.category.color = color;
  }

  selectType(newType: TransactionTypes) {
    this.selectedType = newType;
  }
  modifyTransaction() {}
  ngOnInit(): void {
  }

}
