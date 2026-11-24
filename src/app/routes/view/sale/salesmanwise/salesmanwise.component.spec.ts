import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesmanwiseComponent } from './salesmanwise.component';

describe('SalesmanwiseComponent', () => {
  let component: SalesmanwiseComponent;
  let fixture: ComponentFixture<SalesmanwiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesmanwiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesmanwiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
