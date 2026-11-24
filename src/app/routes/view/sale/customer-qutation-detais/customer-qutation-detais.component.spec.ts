import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerQutationDetaisComponent } from './customer-qutation-detais.component';

describe('CustomerQutationDetaisComponent', () => {
  let component: CustomerQutationDetaisComponent;
  let fixture: ComponentFixture<CustomerQutationDetaisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerQutationDetaisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerQutationDetaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
