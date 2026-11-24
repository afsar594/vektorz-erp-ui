import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankGuaranteeComponent } from './bankguarantee.component';

describe('BankguaranteeComponent', () => {
  let component: BankGuaranteeComponent;
  let fixture: ComponentFixture<BankGuaranteeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankGuaranteeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankGuaranteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
