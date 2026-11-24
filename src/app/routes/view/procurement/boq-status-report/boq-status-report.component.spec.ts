import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoqStatusReportComponent } from './boq-status-report.component';

describe('BoqStatusReportComponent', () => {
  let component: BoqStatusReportComponent;
  let fixture: ComponentFixture<BoqStatusReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoqStatusReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoqStatusReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
