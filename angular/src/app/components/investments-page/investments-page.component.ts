import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AccountSettings } from 'src/app/models/accountSettings';
import { Investment } from 'src/app/models/investment';
import { DataService } from 'src/app/services/data.service';
import { InvestmentModalComponent } from '../investment-modal/investment-modal.component';

@Component({
  selector: 'app-investments-page',
  templateUrl: './investments-page.component.html',
  styleUrls: ['./investments-page.component.css']
})
export class InvestmentsPageComponent implements OnInit {
  userSettings$: Observable<AccountSettings | undefined> = this.ds.getUserSettings();
  investments$: Observable<Investment[]> = this.ds.getUsersInvestments();
  constructor(private dialog: MatDialog, private ds: DataService) { }

  ngOnInit(): void {
  }

  openInvestmentDialog() {
    this.dialog.open(InvestmentModalComponent);
  }

  openEditDialog(investment: Investment) {
    this.dialog.open(InvestmentModalComponent, {
      data: {investment: investment}
    });
  }

  deleteInvestment(investment: Investment) {
    this.ds.deleteInvestment(investment).subscribe();
  }

}
