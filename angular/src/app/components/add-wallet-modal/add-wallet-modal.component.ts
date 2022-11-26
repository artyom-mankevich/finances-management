import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Wallet } from 'src/app/models/wallet';

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
    goal: 15000,
    lastUpdate: Date.now()
  }
  colors: string[] = ['#F6BA1B', '#7A3EF8']
  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = fb.group({
      name: [this.wallet.name, Validators.required],
      currency: [this.wallet.currency, Validators.required],
      balance: [this.wallet.balance, Validators.required],
      goal: [this.wallet.goal]
    })
    this.form.valueChanges.subscribe(val => {
      if (val.balance?.toString().length > 17) {
        this.form.patchValue({ balance: Number.parseFloat(val.balance.toString().slice(0, 17)) })
      }
      if (val.goal?.toString().length > 17) {
        this.form.patchValue({ goal: Number.parseFloat(val.goal.toString().slice(0, 17)) })
      }
      this.wallet.name = val.name;
      this.wallet.currency = val.currency;
      if (typeof val.balance === 'number') {
        this.wallet.balance = val.balance;
      }
      else {
        this.wallet.balance = 0;
      }
      if (typeof val.goal === 'number') {
        this.wallet.goal = val.goal;
      }
    })
  }

  changeBackgroundColor(color: string) {
    this.wallet.color = color;
  }
  ngOnInit(): void {
  }

}
