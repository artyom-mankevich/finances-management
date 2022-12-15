import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { EthereumTransfer } from 'src/app/models/ethereumTransfer';
import { EthereumWallet } from 'src/app/models/ethereumWallet';
import { DataService } from 'src/app/services/data.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-crypto-transfer-modal',
  templateUrl: './crypto-transfer-modal.component.html',
  styleUrls: ['./crypto-transfer-modal.component.css']
})

export class CryptoTransferModalComponent implements OnInit {
  form: FormGroup;
  wallets$: Observable<EthereumWallet[]> = this.ds.getusersCryptoWallets();
  transfer: EthereumTransfer | undefined;
  ableToTransfer: boolean = true;

  constructor(private fb: FormBuilder,private vs: ValidatorService, private ds: DataService, private dialogRef: MatDialogRef<CryptoTransferModalComponent>) {
    this.form = this.fb.group({
      sourceWallet: [, Validators.required],
      amount: [, Validators.required],
      targetAddress: [, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      password: [, Validators.required]
    })
    this.form.controls['amount'].valueChanges.subscribe(() => this.vs.cutOffNumber(this.form.controls['amount']))
  }

  ngOnInit(): void {
  }

  makeTransfer() {
    this.transfer = {
      ethKeysId: this.form.controls['sourceWallet'].value.id,
      amount:  this.form.controls['amount'].value,
      toAddress:  this.form.controls['targetAddress'].value,
      password:  this.form.controls['password'].value
    }
    this.ableToTransfer = false;

    this.ds.makeEthTransfer(this.transfer).subscribe(() => this.dialogRef.close(), error => this.ableToTransfer = true);
  }


}
