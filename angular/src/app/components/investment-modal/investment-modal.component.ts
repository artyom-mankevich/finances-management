import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WalletModalModes } from 'src/app/enums/walletModalModes';
import { Investment } from 'src/app/models/investment';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';
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
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dss: DataStorageService, private ds: DataService, private fb: FormBuilder, private cv: CurrencyValidator, private dialogRef: MatDialogRef<InvestmentModalComponent>) {
    this.form = this.fb.group({
      name: [, Validators.required],
      description: [],
      balance: [, Validators.required],
      currency: [, [Validators.required, this.cv.allowedCurrency.bind(this.cv)]],
      mpy: [, Validators.required]
    })

    if (this.data) {
      this.investment = data.investment;
      this.modalMode = WalletModalModes.Update;
      this.updateForm();
    }
  }
  changeBackgroundColor(color: string): void {
    this.investment.color = color;
  }

  modifyInvestment() {
    this.ableToSubmit = false;
    this.investment.balance = this.form.controls['balance'].value;
    this.investment.name = this.form.controls['name'].value;
    this.investment.description = this.form.controls['description'].value;
    this.investment.percent = this.form.controls['mpy'].value;
    this.investment.currency = this.form.controls['currency'].value;


    if (this.modalMode === WalletModalModes.Create) {
      this.ds.createInvestment(this.investment).subscribe(() => this.dialogRef.close(), error => this.ableToSubmit = true);
    }
    if (this.modalMode === WalletModalModes.Update) {
      this.ds.updateInvestment(this.investment).subscribe(() => this.dialogRef.close(), error => this.ableToSubmit = true); 
    }
  }

  updateForm() {
    this.form.patchValue({
      name: this.investment.name,
      description: this.investment.description,
      balance: this.investment.balance,
      currency: this.investment.currency,
      mpy: this.investment.percent
    })
  }

  ngOnInit(): void {
  }

}
