import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionSettingComponent } from './option-setting.component';

describe('OptionSettingComponent', () => {
  let component: OptionSettingComponent;
  let fixture: ComponentFixture<OptionSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
