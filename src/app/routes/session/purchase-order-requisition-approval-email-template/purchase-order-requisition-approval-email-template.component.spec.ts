import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderRequisitionApprovalEmailTemplateComponent } from './purchase-order-requisition-approval-email-template.component';

describe('PurchaseOrderRequisitionApprovalEmailTemplateComponent', () => {
  let component: PurchaseOrderRequisitionApprovalEmailTemplateComponent;
  let fixture: ComponentFixture<PurchaseOrderRequisitionApprovalEmailTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseOrderRequisitionApprovalEmailTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderRequisitionApprovalEmailTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
