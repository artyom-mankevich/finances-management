import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsAmountChartComponent } from './transactions-amount-chart.component';

describe('TransactionsAmountChartComponent', () => {
  let component: TransactionsAmountChartComponent;
  let fixture: ComponentFixture<TransactionsAmountChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionsAmountChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsAmountChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
