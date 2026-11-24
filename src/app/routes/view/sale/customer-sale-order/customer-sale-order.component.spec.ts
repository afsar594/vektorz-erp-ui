import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSaleOrderComponent } from './customer-sale-order.component';

describe('CustomerSaleOrderComponent', () => {
  let component: CustomerSaleOrderComponent;
  let fixture: ComponentFixture<CustomerSaleOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerSaleOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSaleOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
