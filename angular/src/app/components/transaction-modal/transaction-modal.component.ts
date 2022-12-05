import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TransactionModalModes } from 'src/app/enums/transactionModalModes';
import { TransactionTypes } from 'src/app/enums/transactionTypes';
import { PostTransaction, Transaction } from 'src/app/models/transaction';
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
  transactionModalModes = TransactionModalModes;
  transactionTypes = TransactionTypes;
  selectedType: TransactionTypes = TransactionTypes.Income;
  wallets$: Observable<Wallet[]> = this.ds.getUserWallets();
  categories$: Observable<TransactionCategory[]> = this.ds.getUserCategories();
  color: string = '#7A3EF8'
  transaction: Transaction = {
    id: null,
    userId: '',
    createdAt: Date.now(),
    sourceAmount: null,
    targetAmount: null,
    sourceWallet: null,
    targetWallet: null,
    description: '',
    category: null
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
      this.transaction = this.data.transaction;
      this.selectedType = this.getTransactionType(this.transaction);
      this.updateFormValues();
    }
    this.form.controls['sourceAmount'].valueChanges.subscribe(x => {
      this.transaction.sourceAmount = x;
      if (this.selectedType === TransactionTypes.Transfer) {
        this.fillTargetAmount(x)
      }
    })
    this.form.controls['category'].valueChanges.subscribe(val => {
      if (val) {
        this.transaction.category = val;
      }
      if (val?.color) {
        this.color = val?.color
      }
    });
    this.selectType(this.selectedType);
    this.form.controls['targetAmount'].valueChanges.subscribe(val => this.transaction.targetAmount = val);
    this.form.controls['sourceWallet'].valueChanges.subscribe(val => {
      this.transaction.sourceWallet = val;
      if (this.selectedType === TransactionTypes.Transfer && this.transaction.sourceAmount) {
        this.fillTargetAmount(this.transaction.sourceAmount);
      }
    })
    this.form.controls['targetWallet'].valueChanges.subscribe(val => {
      this.transaction.targetWallet = val
      if (this.selectedType === TransactionTypes.Transfer && this.transaction.sourceAmount) {
        this.fillTargetAmount(this.transaction.sourceAmount);
      }
    })
    this.form.controls['description'].valueChanges.subscribe(val => this.transaction.description = val);
  }

  compare(val1: any, val2: any) {
    if (val1?.id && val2?.id) {
      return val1.id === val2.id
    }
    return false;
  }

  updateFormValues(): void {
    this.form.patchValue({
      sourceAmount: this.transaction.sourceAmount,
      targetAmount: this.transaction.targetAmount,
      category: this.transaction.category,
      sourceWallet: this.transaction.sourceWallet,
      targetWallet: this.transaction.targetWallet,
      description: this.transaction.description
    })
    if (this.transaction.category) {
      this.color = this.transaction.category.color;
    }
  }

  changeColor(color: string): void {
    if (this.transaction.category) {
      this.transaction.category.color = color;
    }
  }

  selectType(newType: TransactionTypes) {
    if (newType !== this.selectedType) {
      this.form.reset();
    }
    this.selectedType = newType;
    for (const key in this.form.controls) {
      this.form.controls[key].removeValidators(Validators.required);
      this.form.controls[key].updateValueAndValidity();
    }
    if (this.selectedType === TransactionTypes.Transfer) {
      this.form.controls['sourceAmount'].setValidators([Validators.required])
      this.form.controls['targetAmount'].setValidators([Validators.required])
      this.form.controls['sourceWallet'].setValidators([Validators.required])
      this.form.controls['targetWallet'].setValidators([Validators.required])
    }
    if (this.selectedType === TransactionTypes.Income) {
      this.form.controls['targetAmount'].setValidators([Validators.required])
      this.form.controls['category'].setValidators([Validators.required])
      this.form.controls['targetWallet'].setValidators([Validators.required])
    }
    if (this.selectedType === TransactionTypes.Expense) {
      this.form.controls['sourceAmount'].setValidators([Validators.required])
      this.form.controls['category'].setValidators([Validators.required])
      this.form.controls['sourceWallet'].setValidators([Validators.required])
    }
    for (const key in this.form.controls) {
      this.form.controls[key].updateValueAndValidity();
    }
  }

  private fillTargetAmount(val: number) {
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

  private getTransactionType(transaction: Transaction): TransactionTypes {
    if (transaction.sourceWallet && !transaction.targetWallet) return TransactionTypes.Expense;
    if (!transaction.sourceWallet && transaction.targetWallet) return TransactionTypes.Income;
    return TransactionTypes.Transfer;
  }

  modifyTransaction() {
    let postTransaction: PostTransaction = {
      sourceAmount: this.transaction.sourceAmount,
      targetAmount: this.transaction.targetAmount,
      sourceWallet: this.transaction.sourceWallet?.id ?? null,
      targetWallet: this.transaction.targetWallet?.id ?? null,
      description: this.transaction.description ?? null,
      category: this.transaction.category?.id ?? null,
      id: this.transaction.id
    }
    if (this.modalMode === TransactionModalModes.Create) {
      this.ds.createTransaction(postTransaction).subscribe();
    }
    else if (this.modalMode === TransactionModalModes.Update) {
      this.ds.updateTransaction(postTransaction).subscribe();
    }
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }
}
