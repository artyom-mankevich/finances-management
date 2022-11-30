import { Component, OnInit } from '@angular/core';
import { Wallet } from 'src/app/models/wallet';
import { AddWalletModalComponent } from '../add-wallet-modal/add-wallet-modal.component';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-wallets-page',
  templateUrl: './wallets-page.component.html',
  styleUrls: ['./wallets-page.component.css']
})
export class WalletsPageComponent implements OnInit {
  wallets$: Observable<Wallet[]> = this.ds.getUserWallets();
  selectedWallet: Wallet | undefined;
  
  constructor(private dialog: MatDialog, public ds: DataService) { 
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
    this.ds.getUserWallets().subscribe(x => console.log(x));
  }

}
