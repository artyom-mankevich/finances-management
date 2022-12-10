import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoWalletModalComponent } from './crypto-wallet-modal.component';

describe('CryptoWalletModalComponent', () => {
  let component: CryptoWalletModalComponent;
  let fixture: ComponentFixture<CryptoWalletModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CryptoWalletModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CryptoWalletModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
