import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentsPageComponent } from './investments-page.component';

describe('InvestmentsPageComponent', () => {
  let component: InvestmentsPageComponent;
  let fixture: ComponentFixture<InvestmentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestmentsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
