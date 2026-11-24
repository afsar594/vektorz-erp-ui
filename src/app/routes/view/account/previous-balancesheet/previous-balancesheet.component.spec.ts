import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousBalancesheetComponent } from './previous-balancesheet.component';

describe('PreviousBalancesheetComponent', () => {
  let component: PreviousBalancesheetComponent;
  let fixture: ComponentFixture<PreviousBalancesheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviousBalancesheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviousBalancesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
