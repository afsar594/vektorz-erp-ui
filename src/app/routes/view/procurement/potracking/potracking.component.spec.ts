import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PotrackingComponent } from './potracking.component';

describe('PotrackingComponent', () => {
  let component: PotrackingComponent;
  let fixture: ComponentFixture<PotrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PotrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PotrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
