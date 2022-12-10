import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CryptoTransferModalComponent } from '../crypto-transfer-modal/crypto-transfer-modal.component';
import { CryptoWalletModalComponent } from '../crypto-wallet-modal/crypto-wallet-modal.component';

@Component({
  selector: 'app-crypto-page',
  templateUrl: './crypto-page.component.html',
  styleUrls: ['./crypto-page.component.css']
})
export class CryptoPageComponent implements OnInit {

  constructor(private dialog: MatDialog) { }


  openWalletDialog() {
    this.dialog.open(CryptoWalletModalComponent)
  }

  openTransferDialog() {
    this.dialog.open(CryptoTransferModalComponent)
  }
  ngOnInit(): void {
  }

}
