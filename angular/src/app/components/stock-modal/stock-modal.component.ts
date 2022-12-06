import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TransactionModalModes } from 'src/app/enums/transactionModalModes';
import { Stock } from 'src/app/models/stock';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-stock-modal',
  templateUrl: './stock-modal.component.html',
  styleUrls: ['./stock-modal.component.css']
})
export class StockModalComponent implements OnInit {

  stock: Stock = {
    id: null,
    userId: null,
    amount: 0,
    ticker: '',
    price: null
  }
  form: FormGroup;
  modalModes = TransactionModalModes;
  modalMode: TransactionModalModes = TransactionModalModes.Create;
  constructor(private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, private ds: DataService) {
    this.form = this.fb.group({
      ticker: [null, Validators.required],
      amount: [null, Validators.required]
    })
    if (this.data) {
      this.stock = this.data.stock;
      this.form.patchValue({
        ticker: this.stock.ticker,
        amount: this.stock.amount
      })
      this.modalMode = TransactionModalModes.Update;
    }
  }

  modifyStock(): void{
    this.stock.amount = this.form.controls['amount'].value;
    this.stock.ticker = this.form.controls['ticker'].value;

    if (this.modalMode === TransactionModalModes.Create) {
      this.ds.createStock(this.stock).subscribe();
    }
    else {
      this.ds.updateStock(this.stock).subscribe();
    }
  }

  deleteStock(): void {

  }
  ngOnInit(): void {
  }

}
