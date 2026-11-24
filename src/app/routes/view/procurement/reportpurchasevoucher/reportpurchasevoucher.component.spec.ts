import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportpurchasevoucherComponent } from './reportpurchasevoucher.component';

describe('ReportpurchasevoucherComponent', () => {
  let component: ReportpurchasevoucherComponent;
  let fixture: ComponentFixture<ReportpurchasevoucherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportpurchasevoucherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportpurchasevoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
