import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobmasterComponent } from './jobmaster.component';

describe('JobmasterComponent', () => {
  let component: JobmasterComponent;
  let fixture: ComponentFixture<JobmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
