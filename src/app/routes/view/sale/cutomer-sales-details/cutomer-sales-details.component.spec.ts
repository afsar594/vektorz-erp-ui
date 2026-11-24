import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CutomerSalesDetailsComponent } from './cutomer-sales-details.component';

describe('CutomerSalesDetailsComponent', () => {
  let component: CutomerSalesDetailsComponent;
  let fixture: ComponentFixture<CutomerSalesDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CutomerSalesDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CutomerSalesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
