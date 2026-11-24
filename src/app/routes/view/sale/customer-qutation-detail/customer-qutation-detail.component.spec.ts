import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerQutationDetailComponent } from './customer-qutation-detail.component';

describe('CustomerQutationDetailComponent', () => {
  let component: CustomerQutationDetailComponent;
  let fixture: ComponentFixture<CustomerQutationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerQutationDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerQutationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
