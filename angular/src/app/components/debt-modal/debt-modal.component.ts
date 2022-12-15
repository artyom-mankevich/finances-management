import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WalletModalModes } from 'src/app/enums/walletModalModes';
import { Debt } from 'src/app/models/debt';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { CurrencyValidator } from 'src/app/validators/currency.validator';

@Component({
  selector: 'app-debt-modal',
  templateUrl: './debt-modal.component.html',
  styleUrls: ['./debt-modal.component.css'],
  providers: [CurrencyValidator]
})

export class DebtModalComponent implements OnInit {
  ableToSubmit: boolean = true;
  debt: Debt = {
    id: null,
    userId: null,
    currency: '',
    balance: 0,
    name: '',
    goal: 0,
    expiresAt: 0
  }
  modalMode = WalletModalModes.Create;

  form: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dss: DataStorageService, private ds: DataService, private fb: FormBuilder, private cv: CurrencyValidator, private dialogRef: MatDialogRef<DebtModalComponent>, private vs: ValidatorService) {
    this.form = this.fb.group({
      name: [, Validators.required],
      currency: [, [Validators.required, this.cv.allowedCurrency.bind(this.cv)]],
      balance: [],
      goal: [, [Validators.required]],
      expiresAt: [, Validators.required]
    });
    if (this.data) {
      this.debt = data.debt;
      this.modalMode = WalletModalModes.Update;
      this.updateFormValues();
    }
    this.form.controls['goal'].valueChanges.subscribe(() => vs.cutOffNumber(this.form.controls['goal']));
    this.form.controls['balance'].valueChanges.subscribe(() => vs.cutOffNumber(this.form.controls['balance']));

  }

  updateFormValues() {
    this.form.patchValue({
      name: this.debt.name,
      currency: this.debt.currency,
      balance: this.debt.balance,
      goal: this.debt.goal,
      expiresAt: this.formatDate(this.debt.expiresAt)
    })
  }

  private formatDate(date: number) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }
  
  modifyWallet() {
    this.debt.name = this.form.controls['name'].value;
    this.debt.currency = this.form.controls['currency'].value;
    this.debt.balance = this.form.controls['balance'].value ? this.form.controls['balance'].value : 0;
    this.debt.goal = this.form.controls['goal'].value;
    this.debt.expiresAt = new Date(this.form.controls['expiresAt'].value).getTime();
    this.ableToSubmit = false;
    if (this.modalMode === WalletModalModes.Create) {
      this.ds.createDebt(this.debt).subscribe(() => this.dialogRef.close(), errror => this.ableToSubmit = true);
    }
    else if (this.modalMode === WalletModalModes.Update) {
      this.ds.updateDebt(this.debt).subscribe(() => this.dialogRef.close(), errror => this.ableToSubmit = true);
    }
  }

  deleteDebt() {
    this.ableToSubmit = false;
    this.ds.deleteDebt(this.debt).subscribe(() => this.dialogRef.close(), error=> this.ableToSubmit = true);
  }

  ngOnInit(): void {
  }
}
