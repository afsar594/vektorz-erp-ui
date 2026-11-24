import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportpurchaseorderComponent } from './reportpurchaseorder.component';

describe('ReportpurchaseorderComponent', () => {
  let component: ReportpurchaseorderComponent;
  let fixture: ComponentFixture<ReportpurchaseorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportpurchaseorderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportpurchaseorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
