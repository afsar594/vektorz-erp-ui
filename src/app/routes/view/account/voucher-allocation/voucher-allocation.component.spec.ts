import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherAllocationComponent } from './voucher-allocation.component';

describe('VoucherAllocationComponent', () => {
  let component: VoucherAllocationComponent;
  let fixture: ComponentFixture<VoucherAllocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoucherAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoucherAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
