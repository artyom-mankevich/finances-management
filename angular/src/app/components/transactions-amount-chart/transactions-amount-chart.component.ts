import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-transactions-amount-chart',
  templateUrl: './transactions-amount-chart.component.html',
  styleUrls: ['./transactions-amount-chart.component.css']
})
export class TransactionsAmountChartComponent implements OnInit {
  @ViewChild( BaseChartDirective ) chart: BaseChartDirective | undefined;
  
  constructor(private ds: DataService) {
    this.ds.getUsersTransactionsData().subscribe(val => {
      if (val && Object.keys(val).length === 0) {
        this.chartData.datasets[0].data = [];
        this.chartData.datasets[1].data = [];
        this.chartLabels.labels.length = 0;
        this.chart?.update();
        return;
      }
      if (val?.incomes){
        this.chartData.datasets[0].data = val?.incomes;       
      }
      if (val?.expenses){
        this.chartData.datasets[1].data = val?.expenses;
      }
      if (val){
        this.chartLabels.labels.length = 0;
        for (let label of val.dates) {
          this.chartLabels.labels.push(label);
        }
        this.chart?.update();
      }
     
    })
    };
  
  chartData: ChartConfiguration['data']= {
    datasets: [
      {
        label: 'Income',
        data: [],
        backgroundColor: '#7A3EF8',
        pointRadius: 5,
        borderColor: '#7A3EF8', 
        pointBackgroundColor: '#7A3EF8',
        tension: 0.3, 
        hoverBackgroundColor: '#F6BA1B'
      },
      {
        label: 'Expenses',
        data: [],
        backgroundColor: '#EB4A82',
        borderColor: '#EB4A82',
        pointBackgroundColor: '#EB4A82',
        pointRadius: 5,
        tension: 0.3, 
        hoverBackgroundColor: '#F6BA1B'
      },
    ]
  };
 
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
  
  ngOnInit(): void {
  }

}
