import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialPeriodClosingComponent } from './financial-period-closing.component';

describe('FinancialPeriodClosingComponent', () => {
  let component: FinancialPeriodClosingComponent;
  let fixture: ComponentFixture<FinancialPeriodClosingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialPeriodClosingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialPeriodClosingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
