import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WalletModalModes } from 'src/app/enums/walletModalModes';
import { Debt } from 'src/app/models/debt';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';
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
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dss: DataStorageService, private ds: DataService, private fb: FormBuilder, private cv: CurrencyValidator, private dialogRef: MatDialogRef<DebtModalComponent>) {
    this.form = this.fb.group({
      name: [, Validators.required],
      currency: [, [Validators.required, this.cv.allowedCurrency.bind(this.cv)]],
      balance: [],
      goal: [, Validators.required],
      expiresAt: [, Validators.required]
    });
    if (this.data) {
      this.debt = data.debt;
      this.modalMode = WalletModalModes.Update;
      this.updateFormValues();
    }
  }

  updateFormValues() {
    this.form.patchValue({
      name: this.debt.name,
      currency: this.debt.currency,
      balance: this.debt.balance,
      goal: this.debt.goal,
      expiresAt: this.debt.expiresAt
    })
  }

  modifyWallet() {
    this.ableToSubmit = false;
    if (this.modalMode === WalletModalModes.Create) {
      this.ds.createDebt(this.debt).subscribe(() => this.dialogRef.close(), errror => this.ableToSubmit = true);
    }
    else if (this.modalMode === WalletModalModes.Update) {
      this.ds.updateDebt(this.debt).subscribe(() => this.dialogRef.close(), errror => this.ableToSubmit = true);
    }
  }

  ngOnInit(): void {
  }

}
