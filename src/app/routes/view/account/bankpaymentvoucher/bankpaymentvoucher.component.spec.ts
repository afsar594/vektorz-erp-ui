import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankPaymentvoucherComponent } from './bankpaymentvoucher.component';

describe('BankpaymentvoucherComponent', () => {
  let component: BankPaymentvoucherComponent;
  let fixture: ComponentFixture<BankPaymentvoucherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankPaymentvoucherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankPaymentvoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
