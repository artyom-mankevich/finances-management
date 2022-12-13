import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoWalletComponent } from './crypto-wallet.component';

describe('CryptoWalletComponent', () => {
  let component: CryptoWalletComponent;
  let fixture: ComponentFixture<CryptoWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CryptoWalletComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CryptoWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
