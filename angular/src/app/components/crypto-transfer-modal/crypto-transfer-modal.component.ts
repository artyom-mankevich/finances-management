import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-crypto-transfer-modal',
  templateUrl: './crypto-transfer-modal.component.html',
  styleUrls: ['./crypto-transfer-modal.component.css']
})
export class CryptoTransferModalComponent implements OnInit {
  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = fb.group({
      sourceWallet: [, Validators.required],
      amount: [, Validators.required],
      targetAddress: [, Validators.required],
      password: [, Validators.required]
    })
   }

  ngOnInit(): void {
  }

}
