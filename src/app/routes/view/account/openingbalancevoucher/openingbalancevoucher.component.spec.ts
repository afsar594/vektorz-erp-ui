import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningbalancevoucherComponent } from './openingbalancevoucher.component';

describe('OpeningbalancevoucherComponent', () => {
  let component: OpeningbalancevoucherComponent;
  let fixture: ComponentFixture<OpeningbalancevoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpeningbalancevoucherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpeningbalancevoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
