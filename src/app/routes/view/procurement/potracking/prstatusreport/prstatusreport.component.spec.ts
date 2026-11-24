import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PRstatusreportComponent } from './prstatusreport.component';

describe('PRstatusreportComponent', () => {
  let component: PRstatusreportComponent;
  let fixture: ComponentFixture<PRstatusreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PRstatusreportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PRstatusreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
