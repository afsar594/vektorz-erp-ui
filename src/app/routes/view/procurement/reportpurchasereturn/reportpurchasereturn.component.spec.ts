import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportpurchasereturnComponent } from './reportpurchasereturn.component';

describe('ReportpurchasereturnComponent', () => {
  let component: ReportpurchasereturnComponent;
  let fixture: ComponentFixture<ReportpurchasereturnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportpurchasereturnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportpurchasereturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
