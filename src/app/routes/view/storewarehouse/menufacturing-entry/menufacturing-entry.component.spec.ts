import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenufacturingEntryComponent } from './menufacturing-entry.component';

describe('MenufacturingEntryComponent', () => {
  let component: MenufacturingEntryComponent;
  let fixture: ComponentFixture<MenufacturingEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenufacturingEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenufacturingEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
