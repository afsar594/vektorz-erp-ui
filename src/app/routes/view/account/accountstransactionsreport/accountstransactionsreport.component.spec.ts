import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountstransactionsreportComponent } from './accountstransactionsreport.component';

describe('AccountstransactionsreportComponent', () => {
  let component: AccountstransactionsreportComponent;
  let fixture: ComponentFixture<AccountstransactionsreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountstransactionsreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountstransactionsreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
