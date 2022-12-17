import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AccountSettings } from 'src/app/models/accountSettings';
import { Stock } from 'src/app/models/stock';
import { DataService } from 'src/app/services/data.service';
import { StockModalComponent } from '../stock-modal/stock-modal.component';

@Component({
  selector: 'app-stock [stock]',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  @Input()
  stock!: Stock;
  
  constructor(private dialog: MatDialog, private ds: DataService) { }
  userSettings$ :Observable<AccountSettings | undefined> = this.ds.getUserSettings();
  editStock() {
    this.dialog.open(StockModalComponent, {
      data: {
        stock: {...this.stock}
      },
      width: '350px',
      height:'300px'
    })
  }
  deleteStock(): void {
    if (this.stock.id) {
      this.ds.deleteStock(this.stock.id).subscribe();
    }
  }
  ngOnInit(): void {
  }

}
