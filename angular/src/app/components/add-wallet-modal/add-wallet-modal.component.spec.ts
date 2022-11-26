import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWalletModalComponent } from './add-wallet-modal.component';

describe('AddWalletModalComponent', () => {
  let component: AddWalletModalComponent;
  let fixture: ComponentFixture<AddWalletModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddWalletModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWalletModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
