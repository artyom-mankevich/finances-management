import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtPaymentModalComponent } from './debt-payment-modal.component';

describe('DebtPaymentModalComponent', () => {
  let component: DebtPaymentModalComponent;
  let fixture: ComponentFixture<DebtPaymentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtPaymentModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebtPaymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
