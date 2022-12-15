import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Debt } from 'src/app/models/debt';
import { DataService } from 'src/app/services/data.service';
import { DebtModalComponent } from '../debt-modal/debt-modal.component';
import { DebtPaymentModalComponent } from '../debt-payment-modal/debt-payment-modal.component';

@Component({
  selector: 'app-debts-page',
  templateUrl: './debts-page.component.html',
  styleUrls: ['./debts-page.component.css']
})
export class DebtsPageComponent implements OnInit {
  debts$ = this.ds.getUsersDebts();
  constructor(private dialog: MatDialog, private ds: DataService) { }

  ngOnInit(): void {
  }

  openDebtDialog() {
    this.dialog.open(DebtModalComponent);
  }

  openDebtPaymentDialog() {
    this.dialog.open(DebtPaymentModalComponent);
  }

}
