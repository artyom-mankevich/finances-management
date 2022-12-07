import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StocksChartComponent } from './stocks-chart.component';

describe('StocksChartComponent', () => {
  let component: StocksChartComponent;
  let fixture: ComponentFixture<StocksChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StocksChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StocksChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
