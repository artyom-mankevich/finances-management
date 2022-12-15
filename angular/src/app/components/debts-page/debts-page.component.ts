import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Debt } from 'src/app/models/debt';
import { DebtModalComponent } from '../debt-modal/debt-modal.component';
import { DebtPaymentModalComponent } from '../debt-payment-modal/debt-payment-modal.component';

@Component({
  selector: 'app-debts-page',
  templateUrl: './debts-page.component.html',
  styleUrls: ['./debts-page.component.css']
})
export class DebtsPageComponent implements OnInit {
  debts: Debt[] = []
  constructor(private dialog: MatDialog) {
    for (let i = 0; i < 15; i++) {
      this.debts.push({
        id: null,
        userId: null,
        currency: 'USD',
        balance: Math.random() * 10000,
        name: 'Debt ' + i,
        goal: 10000,
        expiresAt: Date.now() * 1.003
      })
    }
  }

  ngOnInit(): void {
  }

  openDebtDialog() {
    this.dialog.open(DebtModalComponent);
  }

  openDebtPaymentDialog() {
    this.dialog.open(DebtPaymentModalComponent);
  }

}
