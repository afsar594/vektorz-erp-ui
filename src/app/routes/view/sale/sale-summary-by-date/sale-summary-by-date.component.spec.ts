import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleSummaryByDateComponent } from './sale-summary-by-date.component';

describe('SaleSummaryByDateComponent', () => {
  let component: SaleSummaryByDateComponent;
  let fixture: ComponentFixture<SaleSummaryByDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaleSummaryByDateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleSummaryByDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
