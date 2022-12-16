import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Debt } from 'src/app/models/debt';
import { DataService } from 'src/app/services/data.service';
import { DebtModalComponent } from '../debt-modal/debt-modal.component';

@Component({
  selector: 'app-debt [debt]',
  templateUrl: './debt.component.html',
  styleUrls: ['./debt.component.css']
})
export class DebtComponent implements OnInit {
  @ViewChild( BaseChartDirective ) chart: BaseChartDirective | undefined;
  userSettings$ = this.ds.getUserSettings();

  @Input()
  debt!: Debt;
  chartData: ChartDataset<'doughnut'>[] = [
    {
      label: 'Value',
      data: [],
      backgroundColor: ['#F6BA1B', '#D9D9D9'],
      borderColor: 'transparent', 
      hoverBackgroundColor: ['#F6BA1B', '#D9D9D9'],
      hoverBorderColor: ['#F6BA1B', '#D9D9D9'],
      borderWidth: 2
    },
  ];

  chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: 85,
    scales: {
      y: {
        display: false
      },
      x: {
        display: false
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      
      tooltip: {
        
        backgroundColor: 'white',
        displayColors: false, 
        
        titleColor: '#2D2F33',
        titleFont: {
          size: 18
        },
        bodyColor: '#2D2F33',
        bodyFont: {
          size: 13
        }
      }
    }
  };

  constructor(private dialog: MatDialog, private ds: DataService) {
   
  }

  ngOnInit(): void {
    let upaidAmount = this.debt.goal - this.debt.balance > 0 ? this.debt.goal - this.debt.balance : 0;
    this.chartData[0].data = [this.debt.balance, upaidAmount];
    this.chart?.update();
  }

  openDebtEditModal() {
    this.dialog.open(DebtModalComponent, {data: {
      debt: {...this.debt}
    }})
  }

}
