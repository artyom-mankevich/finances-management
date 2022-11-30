import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Wallet } from 'src/app/models/wallet';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';
import { WalletModalModes } from 'src/app/enums/walletModalModes';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { Currency } from 'src/app/models/currency';
import { getCurrencySymbol } from '@angular/common';

@Component({
  selector: 'app-add-wallet-modal',
  templateUrl: './add-wallet-modal.component.html',
  styleUrls: ['./add-wallet-modal.component.css']
})

export class AddWalletModalComponent implements OnInit {
  wallet: Wallet = {
    id: null,
    userId: '',
    currency: 'USD',
    balance: 0,
    name: 'Name',
    color: '#7A3EF8',
    lastUpdated: Date.now()
  }

  form: FormGroup;

  modalMode: WalletModalModes = WalletModalModes.Create;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,  private fb: FormBuilder, private ds: DataService, private dialogRef: MatDialogRef<AddWalletModalComponent>, public dss: DataStorageService) {
    
    this.form = this.fb.group({
      name: [, [Validators.required, Validators.maxLength(50)]],
      currency: [, Validators.required],
      balance: [, [Validators.required, Validators.max(99999999999999999), Validators.min(-99999999999999999)]],
      goal: []
    })

    if (this.data) {
      this.wallet = data.wallet;
      this.modalMode = WalletModalModes.Update;
      this.updateAllFormFields();
    }

    if (this.data) {
      this.wallet = data.wallet;
    }

    this.form.controls['name'].valueChanges.subscribe(val => {
      this.wallet.name = val;
    })

    this.form.controls['currency'].valueChanges.subscribe(val => {
      if (this.dss.currencies.map(c => c.code).includes(val)) {
        this.wallet.currency = val;
      }
    })

    this.form.controls['balance'].valueChanges.subscribe(val => {
      if (isNaN(val) && val?.toString() !== '-') {
        this.form.patchValue({ balance: 0 });
        return;
      }
      if (val?.toString().length > 17) {
        this.form.patchValue({ balance: Number.parseFloat(val.toString().slice(0, 17)) })
        return;
      }
      if (typeof val === 'number') {
        this.wallet.balance = val;
      }
      else {
        this.wallet.balance = 0;
      }
    })

    this.form.controls['goal'].valueChanges.subscribe(val => {
      if (isNaN(val) && val?.toString() !== '-') {
        this.form.patchValue({ goal: 0 });
        return;
      }
      if (val?.toString().length > 17) {
        this.form.patchValue({ goal: Number.parseFloat(val.toString().slice(0, 17)) })
        return;
      }
      if (typeof val === 'number') {
        this.wallet.goal = val;
      }
    })

   
  }


  updateAllFormFields() {
    this.form.patchValue({
      name : this.wallet.name,
      currency: this.wallet.currency,
      balance: this.wallet.balance,
      goal: this.wallet.goal
    })
  }

  modifyWallet(): void {
    if (this.modalMode === WalletModalModes.Create){
      this.ds.createWallet(this.wallet).subscribe();
    }
    else if (this.modalMode === WalletModalModes.Update){
       this.ds.updateWallet(this.wallet).subscribe();
    }
    this.dialogRef.close();
  }

  changeBackgroundColor(color: string): void {
    this.wallet.color = color;
  }

  ngOnInit(): void {
  }

}
