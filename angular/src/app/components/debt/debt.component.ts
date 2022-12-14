import { Component, OnInit } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-debt',
  templateUrl: './debt.component.html',
  styleUrls: ['./debt.component.css']
})
export class DebtComponent implements OnInit {
  chartData: ChartDataset<'doughnut'>[] = [
    {
      label: 'Value',
      data: [3000, 7000],
      backgroundColor: ['#F6BA1B', '#D9D9D9'],
      borderColor: 'transparent', 
      hoverBackgroundColor: ['#F6BA1B', '#D9D9D9'],
      hoverBorderColor: ['#F6BA1B', '#D9D9D9'],
      borderWidth: 2
    },
  ];
 
  chartLabels = {
    labels:  ['']
  }

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
  constructor() { }

  ngOnInit(): void {
  }

}
