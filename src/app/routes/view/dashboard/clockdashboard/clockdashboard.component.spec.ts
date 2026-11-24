import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockdashboardComponent } from './clockdashboard.component';

describe('ClockdashboardComponent', () => {
  let component: ClockdashboardComponent;
  let fixture: ComponentFixture<ClockdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClockdashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClockdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
