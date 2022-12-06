import { Component, Input, OnInit } from '@angular/core';
import { Stock } from 'src/app/models/stock';

@Component({
  selector: 'app-stock [stock]',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  @Input()
  stock!: Stock;
  
  constructor() { }

  editStock() { }
  deleteStock() { }
  ngOnInit(): void {
  }

}
