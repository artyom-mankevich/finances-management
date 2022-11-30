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
  selectedWallet: Wallet | undefined;
  colors: string[] = ['#F6BA1B', '#7A3EF8', '#3E68D1', '#3EB5E8', '#EB4A82', '#555994']
  
  constructor(private dialog: MatDialog) { 
    for(let i = 0; i< 15; i++){
      this.wallets.push({
        id: null,
        userId: '',
        currency: 'USD',
        balance: 10035.45,
        name: 'Name',
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        goal: null,
        lastUpdate: Date.now()
      });
    }
  }

  openModal() {
    this.dialog.open(AddWalletModalComponent)
  }

  selectWallet(wallet: Wallet) {
    this.selectedWallet = wallet;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnInit(): void {
    this.selectedWallet = this.wallets[0];
  }

}
