import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { EthKeys } from 'src/app/models/ethKeys';
import { DataService } from 'src/app/services/data.service';
import { AES, lib, enc } from 'crypto-js';
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
      address: ['',Validators.required],
      privateKey: ['',Validators.required],
      password: ['',Validators.required]
    })
  }

  ngOnInit(): void {
  }
  encrypt(msg: string, key: string) {
    var iv = lib.WordArray.random(16);
    var encrypted = AES.encrypt(msg, key, {
        iv: iv
    });
    return iv.concat(encrypted.ciphertext).toString(enc.Base64);
}
  addWallet() {
    this. ethKeys = {
      id: null,
      userId: null,
      address: this.form.controls['address'].value,
      privateKey: this.encrypt(this.form.controls['privateKey'].value, this.form.controls['password'].value),
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
