import { Component, OnInit } from '@angular/core';
import { Wallet } from 'src/app/models/wallet';
import { AddWalletModalComponent } from '../add-wallet-modal/add-wallet-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';
import { Observable } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-wallets-page',
  templateUrl: './wallets-page.component.html',
  styleUrls: ['./wallets-page.component.css'],
  animations: [trigger('fadeIn', [transition(':enter', [
    style({
      opacity: 0
    }),
    animate('50ms ease-in'), style({ opacity: 1 }),
  ])])]
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

  ngOnInit(): void {
  }

}
