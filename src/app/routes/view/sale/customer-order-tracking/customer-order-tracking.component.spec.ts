import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerOrderTrackingComponent } from './customer-order-tracking.component';

describe('CustomerOrderTrackingComponent', () => {
  let component: CustomerOrderTrackingComponent;
  let fixture: ComponentFixture<CustomerOrderTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerOrderTrackingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerOrderTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
