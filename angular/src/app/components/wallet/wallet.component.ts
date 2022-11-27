import { Component, Input, OnInit } from '@angular/core';
import { Wallet } from 'src/app/models/wallet';

@Component({
  selector: 'app-wallet [wallet]',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  constructor() { }
  @Input()
  wallet!: Wallet;

  @Input()
  selected: boolean = false;
  ngOnInit(): void {
  }

}
