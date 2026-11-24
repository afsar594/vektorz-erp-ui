import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgeingreportComponent } from './ageingreport.component';

describe('AgeingreportComponent', () => {
  let component: AgeingreportComponent;
  let fixture: ComponentFixture<AgeingreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgeingreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgeingreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
