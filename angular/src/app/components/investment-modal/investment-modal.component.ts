import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { WalletModalModes } from 'src/app/enums/walletModalModes';
import { Investment } from 'src/app/models/investment';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { CurrencyValidator } from 'src/app/validators/currency.validator';

@Component({
  selector: 'app-investment-modal',
  templateUrl: './investment-modal.component.html',
  styleUrls: ['./investment-modal.component.css'],
  providers: [CurrencyValidator]
})
export class InvestmentModalComponent implements OnInit {
  ableToSubmit: boolean = true;
  modalMode: WalletModalModes = WalletModalModes.Create;
  investment: Investment = {
    id: null,
    userId: null,
    percent: 0,
    name: '',
    description: '',
    color: '#555994',
    currency: 'USD',
    createdAt: null,
    balance: 0
  }

  form: FormGroup;
  constructor(public dss: DataStorageService, private fb: FormBuilder, private cv: CurrencyValidator, private dialogRef: MatDialogRef<InvestmentModalComponent>) {
    this.form = this.fb.group({
      name: [, Validators.required],
      description: [],
      amount: [, Validators.required],
      currency: [, [Validators.required, this.cv.allowedCurrency.bind(this.cv)]],
      mpy: [, Validators.required]
    })
  }
  changeBackgroundColor(color: string): void {
    this.investment.color = color;
  }

  modifyInvestment() {
    this.ableToSubmit = false;
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}
