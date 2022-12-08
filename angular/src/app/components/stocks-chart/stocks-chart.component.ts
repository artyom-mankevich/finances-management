import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartDataset, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartDateOptions } from 'src/app/enums/chartDateOptions';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-stocks-chart',
  templateUrl: './stocks-chart.component.html',
  styleUrls: ['./stocks-chart.component.css']
})
export class StocksChartComponent implements OnInit {
  @ViewChild( BaseChartDirective ) chart: BaseChartDirective | undefined;

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

    this.ds.getUserStockChart(this.selectedOption).subscribe(x => {
      if (x?.data){
        this.chartData[0].data = new Array(...x?.data).map(pairs => pairs[1])
        this.chartLabels.labels.length = 0;
        for (let label of x.data.keys()) {
          this.chartLabels.labels.push(label);
        }
        // let a = new Array(...x?.data).map(pairs => pairs[0]);
        // this.chartLabels.labels.push[...a]; 
        this.chart?.update();

      }
    });
   }

  selectOptions(newOption: ChartDateOptions): void {
    this.selectedOption = newOption;
    this.ds.getUserStockChart(this.selectedOption);
  }
  ngOnInit(): void {
  }

  // function to preserve original order of ChartDateOptions after keyvalue pipe
  sortNull() {
    return 0;
  }

}
