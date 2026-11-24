import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralsetttingsComponent } from './generalsetttings.component';

describe('GeneralsetttingsComponent', () => {
  let component: GeneralsetttingsComponent;
  let fixture: ComponentFixture<GeneralsetttingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralsetttingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralsetttingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
