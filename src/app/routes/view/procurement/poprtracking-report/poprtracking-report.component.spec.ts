import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POPRtrackingReportComponent } from './poprtracking-report.component';

describe('POPRtrackingReportComponent', () => {
  let component: POPRtrackingReportComponent;
  let fixture: ComponentFixture<POPRtrackingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ POPRtrackingReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(POPRtrackingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
