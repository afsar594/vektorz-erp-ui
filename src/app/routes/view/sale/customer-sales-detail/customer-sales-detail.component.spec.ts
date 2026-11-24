import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSalesDetailComponent } from './customer-sales-detail.component';

describe('CustomerSalesDetailComponent', () => {
  let component: CustomerSalesDetailComponent;
  let fixture: ComponentFixture<CustomerSalesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerSalesDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSalesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
