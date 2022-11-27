import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Wallet } from 'src/app/models/wallet';
import { MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-add-wallet-modal',
  templateUrl: './add-wallet-modal.component.html',
  styleUrls: ['./add-wallet-modal.component.css']
})
export class AddWalletModalComponent implements OnInit {
  wallet: Wallet = {
    id: null,
    userId: '',
    currency: '$',
    balance: 10035.45,
    name: 'Name',
    color: '#7A3EF8',
    goal: null,
    lastUpdate: Date.now()
  }
  colors: string[] = ['#F6BA1B', '#7A3EF8', '#3E68D1', '#3EB5E8', '#EB4A82', '#555994'];
  currencies = ['$', '€'];
  form: FormGroup;
  constructor(private fb: FormBuilder, private ds: DataService, private dialogRef: MatDialogRef<AddWalletModalComponent>) {
    this.form = fb.group({
      name: [, [Validators.required, Validators.maxLength(50)]],
      currency: [, Validators.required],
      balance: [, [Validators.required, Validators.max(99999999999999999)]],
      goal: []
    })

    this.form.controls['name'].valueChanges.subscribe(val => {
      this.wallet.name = val;
    })

    this.form.controls['currency'].valueChanges.subscribe(val => {
      if (this.currencies.includes(val)) {
        this.wallet.currency = val;
      }
    })

    this.form.controls['balance'].valueChanges.subscribe(val => {
      if (isNaN(val) && val?.toString() !== '-'){
        this.form.patchValue({ balance: 0});
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
      if (isNaN(val) && val?.toString() !== '-'){
        this.form.patchValue({ goal: 0});
        return;
      }
      if (val?.toString().length >17) {
        this.form.patchValue({ goal: Number.parseFloat(val.toString().slice(0, 17)) })
        return;
      }
      if (typeof val === 'number') {
        this.wallet.goal = val;
      }
    })
  }

  createWallet() {
    this.ds.createWallet(this.wallet).subscribe();
    this.dialogRef.close();
  }

  changeBackgroundColor(color: string) {
    this.wallet.color = color;
  }
  
  ngOnInit(): void {
  }

}
