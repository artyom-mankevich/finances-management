import { Component, OnInit } from '@angular/core';
import { Wallet } from 'src/app/models/wallet';
import { AddWalletModalComponent } from '../add-wallet-modal/add-wallet-modal.component';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';

@Component({
  selector: 'app-wallets-page',
  templateUrl: './wallets-page.component.html',
  styleUrls: ['./wallets-page.component.css']
})
export class WalletsPageComponent implements OnInit {
  wallets: Wallet[] = []
  constructor(private dialog: MatDialog) { }

  openModal() {
    this.dialog.open(AddWalletModalComponent)
  }
  
  ngOnInit(): void {
  }

}
