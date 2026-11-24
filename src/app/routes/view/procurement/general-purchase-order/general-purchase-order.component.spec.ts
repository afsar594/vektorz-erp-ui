import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralPurchaseOrderComponent } from './general-purchase-order.component';

describe('GeneralPurchaseOrderComponent', () => {
  let component: GeneralPurchaseOrderComponent;
  let fixture: ComponentFixture<GeneralPurchaseOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralPurchaseOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralPurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
