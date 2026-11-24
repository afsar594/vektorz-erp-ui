import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsOutstandingComponent } from './accounts-outstanding.component';

describe('AccountsOutstandingComponent', () => {
  let component: AccountsOutstandingComponent;
  let fixture: ComponentFixture<AccountsOutstandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountsOutstandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsOutstandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
