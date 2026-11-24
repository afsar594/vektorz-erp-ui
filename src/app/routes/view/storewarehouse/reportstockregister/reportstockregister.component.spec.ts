import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportstockregisterComponent } from './reportstockregister.component';

describe('ReportstockregisterComponent', () => {
  let component: ReportstockregisterComponent;
  let fixture: ComponentFixture<ReportstockregisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportstockregisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportstockregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
