import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletsBalanceChartComponent } from './wallets-balance-chart.component';

describe('WalletsBalanceChartComponent', () => {
  let component: WalletsBalanceChartComponent;
  let fixture: ComponentFixture<WalletsBalanceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletsBalanceChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletsBalanceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
