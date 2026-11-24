import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingstatementComponent } from './outstandingstatement.component';

describe('OutstandingstatementComponent', () => {
  let component: OutstandingstatementComponent;
  let fixture: ComponentFixture<OutstandingstatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutstandingstatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingstatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
