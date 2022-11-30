import { Component, Input, OnInit } from '@angular/core';
import { Wallet } from 'src/app/models/wallet';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddWalletModalComponent } from '../add-wallet-modal/add-wallet-modal.component';

@Component({
  selector: 'app-wallet [wallet]',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  constructor(private dialog: MatDialog) { }
  @Input()
  wallet!: Wallet;

  @Input()
  selected: boolean = false;

  @Input()
  displayOnly: boolean = false;

  openWalletEditor() {
    if (!this.displayOnly) {
      this.dialog.open(AddWalletModalComponent, { data: { wallet: { ...this.wallet } } })
    }
  }

  ngOnInit(): void {
  }

}
