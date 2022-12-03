import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TransactionModalModes } from 'src/app/enums/transactionModalModes';
import { TransactionTypes } from 'src/app/enums/transactionTypes';
import { Transaction } from 'src/app/models/transaction';
import { Wallet } from 'src/app/models/wallet';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';
import { ExchangeRateService } from 'src/app/services/exchange-rate.service';

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.css']
})
export class TransactionModalComponent implements OnInit {
  modalMode: TransactionModalModes = TransactionModalModes.Create;
  transactionTypes = TransactionTypes;
  selectedType: TransactionTypes = TransactionTypes.Income;
  wallets$: Observable<Wallet[]> = this.ds.getUserWallets();

  transaction: Transaction = {
    id: null,
    userId: '',
    createdAt: Date.now(),
    type: {
      id: '',
      income: true,
      icon: 'arrow_upwards'
    },
    category: {
      id: null,
      userId: '',
      name: 'House',
      icon: 'cottage',
      color: '#7A3EF8'
    },
    amount: 0,
    currency: 'USD',
    sourceWallet: null,
    targetWallet: null,
    description: 'Description'
  }

  form: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, public dss: DataStorageService, public ds: DataService, private ers: ExchangeRateService) {
    this.form = this.fb.group({
      amount: [],
      category: [],
      targetAmount: [],
      sourceWallet: [],
      targetWallet: [],
      description: []
    })

    if (this.data) {
      this.modalMode = TransactionModalModes.Update;
      this.transaction = data.transaction;
      this.updateFormValues();
    }
    this.form.controls['amount'].valueChanges.subscribe(x => {
      if (this.selectedType === TransactionTypes.Transfer) {
        this.fillTargetAmount(x)
      }
    })
    this.form.controls['sourceWallet'].valueChanges.subscribe(val =>  this.transaction.sourceWallet = val)
    this.form.controls['targetWallet'].valueChanges.subscribe(val =>  this.transaction.targetWallet = val)
  }

  updateFormValues(): void {
    this.form.patchValue({
      amount: this.transaction.amount,
      category: this.transaction.category.name,
      sourceWallet: this.transaction.sourceWallet?.name,
      targetWallet: this.transaction.targetWallet?.name,
      description: this.transaction.description
    })
  }

  changeColor(color: string): void {
    this.transaction.category.color = color;
  }

  selectType(newType: TransactionTypes) {
    this.selectedType = newType;
  }

  fillTargetAmount(val: number) {
    if (this.transaction.sourceWallet?.currency && this.transaction.targetWallet?.currency) {
      this.ers.getExchange(val, this.transaction.sourceWallet?.currency, this.transaction.targetWallet?.currency).subscribe(result => {
        this.form.patchValue({
          targetAmount: Number.parseFloat(JSON.parse(JSON.stringify(result))['result'])
        })
      })
    }
  

  }

  modifyTransaction() { }
  ngOnInit(): void {
  }

}
