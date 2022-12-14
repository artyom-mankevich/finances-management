import { Component, Input, OnInit } from '@angular/core';
import { EthereumWallet } from 'src/app/models/ethereumWallet';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-crypto-wallet [ethereumWallet]',
  templateUrl: './crypto-wallet.component.html',
  styleUrls: ['./crypto-wallet.component.css']
})
export class CryptoWalletComponent implements OnInit {
  @Input()
  ethereumWallet: EthereumWallet = {
    id: '',
    userId: '',
    address: '',
    balance: 0
  }
  constructor(private ds: DataService) { }


  deleteWallet() {
    this.ds.deleteCryptoWallet(this.ethereumWallet).subscribe();
  }
  ngOnInit(): void {
  }

}
