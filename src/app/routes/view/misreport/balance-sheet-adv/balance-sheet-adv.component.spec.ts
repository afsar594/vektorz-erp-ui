import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceSheetAdvComponent } from './balance-sheet-adv.component';

describe('BalanceSheetAdvComponent', () => {
  let component: BalanceSheetAdvComponent;
  let fixture: ComponentFixture<BalanceSheetAdvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceSheetAdvComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceSheetAdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
