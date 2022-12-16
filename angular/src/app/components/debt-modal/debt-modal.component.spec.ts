import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtModalComponent } from './debt-modal.component';

describe('DebtModalComponent', () => {
  let component: DebtModalComponent;
  let fixture: ComponentFixture<DebtModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebtModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
