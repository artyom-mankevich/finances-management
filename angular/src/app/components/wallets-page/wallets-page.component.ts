import { Component, OnInit } from '@angular/core';
import { Wallet } from 'src/app/models/wallet';

@Component({
  selector: 'app-wallets-page',
  templateUrl: './wallets-page.component.html',
  styleUrls: ['./wallets-page.component.css']
})
export class WalletsPageComponent implements OnInit {
  wallets: Wallet[] = []
  constructor() { }

  ngOnInit(): void {
  }

}
