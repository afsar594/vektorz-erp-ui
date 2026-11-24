import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerquotatonAceComponent } from './customerquotaton-ace.component';

describe('CustomerquotatonAceComponent', () => {
  let component: CustomerquotatonAceComponent;
  let fixture: ComponentFixture<CustomerquotatonAceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerquotatonAceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerquotatonAceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
