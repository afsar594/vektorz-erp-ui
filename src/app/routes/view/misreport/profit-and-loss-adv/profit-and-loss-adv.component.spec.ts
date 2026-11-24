import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitAndLossAdvComponent } from './profit-and-loss-adv.component';

describe('ProfitAndLossAdvComponent', () => {
  let component: ProfitAndLossAdvComponent;
  let fixture: ComponentFixture<ProfitAndLossAdvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfitAndLossAdvComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfitAndLossAdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
