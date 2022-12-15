import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DebtPayment } from 'src/app/models/debt';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-debt-payment-modal',
  templateUrl: './debt-payment-modal.component.html',
  styleUrls: ['./debt-payment-modal.component.css']
})
export class DebtPaymentModalComponent implements OnInit {

  form: FormGroup;
  payment: DebtPayment = {
    debt: '',
    amount: 0
  }
  ableToSubmit: boolean = true;
  debts$ = this.ds.getUsersDebts();
  constructor(private fb: FormBuilder, private ds: DataService, private dialogRef: MatDialogRef<DebtPaymentModalComponent>) {
    this.form = this.fb.group({
      debt: [, Validators.required],
      amount: [ , [Validators.required, Validators.min(0)]]
    })
  }
  
  createPayment() {
    this.ableToSubmit = false;
    this.payment.debt = this.form.controls['debt'].value.id;
    this.payment.amount = this.form.controls['amount'].value;
    this.ds.createDebtPayment(this.payment).subscribe(() => this.dialogRef.close(), error => this.ableToSubmit = true);
  }
  ngOnInit(): void {
  }

}
