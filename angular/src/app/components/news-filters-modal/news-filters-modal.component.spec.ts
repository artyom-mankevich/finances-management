import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsFiltersModalComponent } from './news-filters-modal.component';

describe('NewsFiltersModalComponent', () => {
  let component: NewsFiltersModalComponent;
  let fixture: ComponentFixture<NewsFiltersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewsFiltersModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsFiltersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
