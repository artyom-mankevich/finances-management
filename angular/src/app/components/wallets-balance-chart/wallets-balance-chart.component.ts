import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Observable } from 'rxjs';
import { ChartDateOptions } from 'src/app/enums/chartDateOptions';
import { WalletsBalanceChart } from 'src/app/models/walletsBalanceChart';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-wallets-balance-chart',
  templateUrl: './wallets-balance-chart.component.html',
  styleUrls: ['./wallets-balance-chart.component.css']
})
export class WalletsBalanceChartComponent implements OnInit {
  selectedOption: ChartDateOptions = this.ds.stockChartPeriod;
  chartDateOptions = ChartDateOptions;
  @ViewChild( BaseChartDirective ) chart: BaseChartDirective | undefined;
  totalBalance:number  = 0;
  walletsBalance$: Observable<WalletsBalanceChart | undefined> = this.ds.getUsersWalletsData(this.selectedOption);
  chartData: ChartDataset[] = [
    {
      label: 'Value',
      data: [],
      backgroundColor: '#3E68D1',
      pointRadius: 2,
      borderColor: 'transparent', 
      tension: 0.3, 
      hoverBackgroundColor: '#F6BA1B'
    },
  ];
 
  chartLabels = {
    labels:  ['']
  }

  chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        grid: {
          display: false
        }
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
  constructor(private ds: DataService) { 
    this.walletsBalance$.subscribe(val => {
      this.totalBalance = val?.currentBalancesSum ? val?.currentBalancesSum : 0;
      if (val && Object.keys(val).length === 0) {
        this.chartData[0].data = [];
        this.chartLabels.labels.length = 0;
        this.chart?.update();
        return;
      }
      if (val?.data){
        this.chartData[0].data = val?.data.balances;
        this.chartLabels.labels.length = 0;
        for (let label of val.data.dates) {
          this.chartLabels.labels.push(label);
        }
        this.chart?.update();
      }
    })
  }

  ngOnInit(): void {
  }

  selectOptions(newOption: ChartDateOptions): void {
    this.selectedOption = newOption;
    this.ds.getUsersWalletsData(this.selectedOption);
  }
 
  // function to preserve original order of ChartDateOptions after keyvalue pipe
  sortNull() {
    return 0;
  }

}
