import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetopeningComponent } from './assetopening.component';

describe('AssetopeningComponent', () => {
  let component: AssetopeningComponent;
  let fixture: ComponentFixture<AssetopeningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetopeningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetopeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
