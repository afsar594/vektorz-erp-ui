import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRequisitionStatusReportComponent } from './purchase-requisition-status-report.component';

describe('PurchaseRequisitionStatusReportComponent', () => {
  let component: PurchaseRequisitionStatusReportComponent;
  let fixture: ComponentFixture<PurchaseRequisitionStatusReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseRequisitionStatusReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseRequisitionStatusReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
