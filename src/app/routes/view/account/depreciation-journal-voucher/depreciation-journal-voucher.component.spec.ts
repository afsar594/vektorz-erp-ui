import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepreciationJournalVoucherComponent } from './depreciation-journal-voucher.component';

describe('DepreciationJournalVoucherComponent', () => {
  let component: DepreciationJournalVoucherComponent;
  let fixture: ComponentFixture<DepreciationJournalVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepreciationJournalVoucherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepreciationJournalVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
