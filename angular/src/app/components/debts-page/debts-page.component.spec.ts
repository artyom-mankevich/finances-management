import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtsPageComponent } from './debts-page.component';

describe('DebtsPageComponent', () => {
  let component: DebtsPageComponent;
  let fixture: ComponentFixture<DebtsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebtsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
