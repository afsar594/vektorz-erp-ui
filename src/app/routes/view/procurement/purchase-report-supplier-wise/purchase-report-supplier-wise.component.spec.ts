import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReportSupplierWiseComponent } from './purchase-report-supplier-wise.component';

describe('PurchaseReportSupplierWiseComponent', () => {
  let component: PurchaseReportSupplierWiseComponent;
  let fixture: ComponentFixture<PurchaseReportSupplierWiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseReportSupplierWiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseReportSupplierWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
