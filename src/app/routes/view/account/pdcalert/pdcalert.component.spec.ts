import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdcalertComponent } from './pdcalert.component';

describe('PdcalertComponent', () => {
  let component: PdcalertComponent;
  let fixture: ComponentFixture<PdcalertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdcalertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdcalertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
