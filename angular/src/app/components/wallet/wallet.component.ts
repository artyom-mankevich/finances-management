import { Component, Input, OnInit } from '@angular/core';
import { Wallet } from 'src/app/models/wallet';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddWalletModalComponent } from '../add-wallet-modal/add-wallet-modal.component';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-wallet [wallet]',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  constructor(private dialog: MatDialog, private ds: DataService) { }
  @Input()
  wallet!: Wallet;

  @Input()
  selected: boolean = false;

  @Input()
  displayOnly: boolean = false;

  userSettings$ = this.ds.getUserSettings();
  openWalletEditor() {
    if (!this.displayOnly) {
      this.dialog.open(AddWalletModalComponent, { data: { wallet: { ...this.wallet } } })
    }
  }

  ngOnInit(): void {
  }

}
