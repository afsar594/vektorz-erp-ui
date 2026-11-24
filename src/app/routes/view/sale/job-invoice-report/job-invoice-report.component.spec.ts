import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobInvoiceReportComponent } from './job-invoice-report.component';

describe('JobInvoiceReportComponent', () => {
  let component: JobInvoiceReportComponent;
  let fixture: ComponentFixture<JobInvoiceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobInvoiceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobInvoiceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
