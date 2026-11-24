import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramsettingsComponent } from './programsettings.component';

describe('ProgramsettingsComponent', () => {
  let component: ProgramsettingsComponent;
  let fixture: ComponentFixture<ProgramsettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramsettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
