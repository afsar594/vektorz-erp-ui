import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherAllocationListComponent } from './voucher-allocation-list.component';

describe('VoucherAllocationListComponent', () => {
  let component: VoucherAllocationListComponent;
  let fixture: ComponentFixture<VoucherAllocationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoucherAllocationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoucherAllocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
