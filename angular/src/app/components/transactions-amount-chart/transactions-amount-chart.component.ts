import { Component, OnInit } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-transactions-amount-chart',
  templateUrl: './transactions-amount-chart.component.html',
  styleUrls: ['./transactions-amount-chart.component.css']
})
export class TransactionsAmountChartComponent implements OnInit {

  constructor() { }
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
  
  ngOnInit(): void {
  }

}
