import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { EthKeys } from 'src/app/models/ethKeys';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-crypto-transfer-modal',
  templateUrl: './crypto-transfer-modal.component.html',
  styleUrls: ['./crypto-transfer-modal.component.css']
})
export class CryptoTransferModalComponent implements OnInit {
  form: FormGroup;
  wallets$: Observable<EthKeys[]> = this.ds.getusersCryptoWallets();
  constructor(private fb: FormBuilder, private ds: DataService) {
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
