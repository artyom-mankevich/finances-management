import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { EthKeys } from 'src/app/models/ethKeys';
import { DataService } from 'src/app/services/data.service';
@Component({
  selector: 'app-crypto-wallet-modal',
  templateUrl: './crypto-wallet-modal.component.html',
  styleUrls: ['./crypto-wallet-modal.component.css']
})
export class CryptoWalletModalComponent implements OnInit {
  form: FormGroup;
  ethKeys: EthKeys | undefined;
  allowSubmit: boolean = true;
  constructor(private fb: FormBuilder, private ds: DataService, private dialogRef: MatDialogRef<CryptoWalletModalComponent>) {
    this.form = this.fb.group({
      address: ['', [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      privateKey: ['',Validators.required],
      password: ['',Validators.required]
    })
  }

  ngOnInit(): void {
  }

  addWallet() {
    this. ethKeys = {
      id: null,
      userId: null,
      address: this.form.controls['address'].value,
      privateKey: this.form.controls['privateKey'].value,
      password: this.form.controls['password'].value
    }
    this.allowSubmit = false;
    this.ds.addCryptoWallet(this.ethKeys).subscribe(() => { 
      this.dialogRef.close();
    }, error => {
      console.log(error);
      this.allowSubmit = true;
    });
  }

}
