import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Stock } from 'src/app/models/stock';
import { StockModalComponent } from '../stock-modal/stock-modal.component';

@Component({
  selector: 'app-stock [stock]',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  @Input()
  stock!: Stock;
  
  constructor(private dialog: MatDialog) { }

  editStock() {
    this.dialog.open(StockModalComponent, {
      data: {
        stock: {...this.stock}
      },
      width: '350px',
      height:'300px'
    })
  }
  deleteStock() { }
  ngOnInit(): void {
  }

}
