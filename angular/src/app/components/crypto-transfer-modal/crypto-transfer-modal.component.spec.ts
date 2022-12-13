import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoTransferModalComponent } from './crypto-transfer-modal.component';

describe('CryptoTransferModalComponent', () => {
  let component: CryptoTransferModalComponent;
  let fixture: ComponentFixture<CryptoTransferModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CryptoTransferModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CryptoTransferModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
