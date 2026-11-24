import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRequisitionStatusComponent } from './purchase-requisition-status.component';

describe('PurchaseRequisitionStatusComponent', () => {
  let component: PurchaseRequisitionStatusComponent;
  let fixture: ComponentFixture<PurchaseRequisitionStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseRequisitionStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseRequisitionStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
