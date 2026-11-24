import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportpurchaserequisitionComponent } from './reportpurchaserequisition.component';

describe('ReportpurchaserequisitionComponent', () => {
  let component: ReportpurchaserequisitionComponent;
  let fixture: ComponentFixture<ReportpurchaserequisitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportpurchaserequisitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportpurchaserequisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
