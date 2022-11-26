import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletsPageComponent } from './wallets-page.component';

describe('WalletsPageComponent', () => {
  let component: WalletsPageComponent;
  let fixture: ComponentFixture<WalletsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
