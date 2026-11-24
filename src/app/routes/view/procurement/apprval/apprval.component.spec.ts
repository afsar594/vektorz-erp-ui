import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprvalComponent } from './apprval.component';

describe('ApprvalComponent', () => {
  let component: ApprvalComponent;
  let fixture: ComponentFixture<ApprvalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprvalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprvalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
