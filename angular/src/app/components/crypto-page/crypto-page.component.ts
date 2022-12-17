import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { EthereumTransferDisplay } from 'src/app/models/ethereumTransfer';
import { EthereumWallet } from 'src/app/models/ethereumWallet';
import { DataService } from 'src/app/services/data.service';
import { CryptoTransferModalComponent } from '../crypto-transfer-modal/crypto-transfer-modal.component';
import { CryptoWalletModalComponent } from '../crypto-wallet-modal/crypto-wallet-modal.component';

@Component({
  selector: 'app-crypto-page',
  templateUrl: './crypto-page.component.html',
  styleUrls: ['./crypto-page.component.css']
})
export class CryptoPageComponent implements OnInit {

  constructor(private dialog: MatDialog, private ds: DataService) { }
  wallets$: Observable<EthereumWallet[]> = this.ds.getusersCryptoWallets();
  transfers$: Observable<EthereumTransferDisplay[]> = this.ds.getUsersEtheremTransactions();
  userSettings$ = this.ds.getUserSettings();

  openWalletDialog() {
    this.dialog.open(CryptoWalletModalComponent)
  }

  openTransferDialog() {
    this.dialog.open(CryptoTransferModalComponent)
  }
  ngOnInit(): void {
  }

}
