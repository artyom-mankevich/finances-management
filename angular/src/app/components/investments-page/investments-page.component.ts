import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InvestmentModalComponent } from '../investment-modal/investment-modal.component';

@Component({
  selector: 'app-investments-page',
  templateUrl: './investments-page.component.html',
  styleUrls: ['./investments-page.component.css']
})
export class InvestmentsPageComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openInvestmentDialog() {
    this.dialog.open(InvestmentModalComponent);
  }

}
