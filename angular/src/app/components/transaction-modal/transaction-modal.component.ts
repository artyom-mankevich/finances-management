import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TransactionModalModes } from 'src/app/enums/transactionModalModes';
import { TransactionTypes } from 'src/app/enums/transactionTypes';
import { Transaction } from 'src/app/models/transaction';
import { TransactionCategory } from 'src/app/models/transactionCategory';
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
  categories$: Observable<TransactionCategory[]> = this.ds.getUserCategories();
  transaction: Transaction = {
    id: null,
    userId: '',
    createdAt: Date.now(),
    category: {
      id: null,
      userId: '',
      name: 'House',
      icon: 'cottage',
      color: '#7A3EF8'
    },
    sourceAmount: null,
    targetAmount: null,
    currency: 'USD',
    sourceWallet: null,
    targetWallet: null,
    description: 'Description'
  }

  form: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, public dss: DataStorageService, public ds: DataService, private ers: ExchangeRateService, private dialogRef: MatDialogRef<TransactionModalComponent>) {
    this.form = this.fb.group({
      sourceAmount: [],
      targetAmount: [],
      category: [],
      sourceWallet: [],
      targetWallet: [],
      description: []
    })

    if (this.data) {
      this.modalMode = TransactionModalModes.Update;
      this.transaction = data.transaction;
      this.updateFormValues();
    }
    this.form.controls['sourceAmount'].valueChanges.subscribe(x => {
      this.transaction.sourceAmount = x;
      if (this.selectedType === TransactionTypes.Transfer) {
        this.fillTargetAmount(x)
      }
    })
    this.form.controls['category'].valueChanges.subscribe(val => this.transaction.category = val);
    this.form.controls['targetAmount'].valueChanges.subscribe(val => this.transaction.targetAmount = val);
    this.form.controls['sourceWallet'].valueChanges.subscribe(val =>  { console.log(val); this.transaction.sourceWallet = val })
    this.form.controls['targetWallet'].valueChanges.subscribe(val =>  this.transaction.targetWallet = val)
    this.form.controls['description'].valueChanges.subscribe(val =>  this.transaction.description = val)
    
  }

  updateFormValues(): void {
    this.form.patchValue({
      amount: this.transaction.sourceAmount,
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
        val = Number.parseFloat(JSON.parse(JSON.stringify(result))['result']);
        this.transaction.targetAmount = val;
        this.form.patchValue({
          targetAmount: val
        })
      })
    }
  

  }

  modifyTransaction() {
    if (this.modalMode === TransactionModalModes.Create) {
      this.ds.createTransaction({
        sourceAmount: this.transaction.sourceAmount,
        targetAmount: this.transaction.targetAmount,
        sourceWallet: this.transaction.sourceWallet?.id,
        targetWallet: this.transaction.targetWallet?.id,
        description: this.transaction.description,
        category: this.transaction.category.id!
      }).subscribe();
    }
    this.dialogRef.close();
  }
  ngOnInit(): void {
  }

}
