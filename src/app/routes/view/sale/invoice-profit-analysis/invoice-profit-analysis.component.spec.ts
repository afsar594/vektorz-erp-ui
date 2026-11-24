import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceProfitAnalysisComponent } from './invoice-profit-analysis.component';

describe('InvoiceProfitAnalysisComponent', () => {
  let component: InvoiceProfitAnalysisComponent;
  let fixture: ComponentFixture<InvoiceProfitAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceProfitAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceProfitAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
