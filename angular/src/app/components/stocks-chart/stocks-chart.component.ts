import { Component, OnInit } from '@angular/core';
import { Chart, ChartDataset, ChartOptions } from 'chart.js';
import { ChartDateOptions } from 'src/app/enums/chartDateOptions';

@Component({
  selector: 'app-stocks-chart',
  templateUrl: './stocks-chart.component.html',
  styleUrls: ['./stocks-chart.component.css']
})
export class StocksChartComponent implements OnInit {

  chartDateOptions = ChartDateOptions;
  selectedOption: ChartDateOptions = ChartDateOptions.Week;
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
  expData: ChartDataset[] = [
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
    labels:  [ ]
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
  
  constructor() { }

  selectOptions(newOption: ChartDateOptions): void {
    this.selectedOption = newOption;
  }
  ngOnInit(): void {
  }

  // function to preserve original order of ChartDateOptions after keyvalue pipe
  sortNull() {
    return 0;
  }

}
