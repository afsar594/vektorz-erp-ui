import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradingProfitNLossComponent } from './trading-profit-nloss.component';

describe('TradingProfitNLossComponent', () => {
  let component: TradingProfitNLossComponent;
  let fixture: ComponentFixture<TradingProfitNLossComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradingProfitNLossComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradingProfitNLossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
