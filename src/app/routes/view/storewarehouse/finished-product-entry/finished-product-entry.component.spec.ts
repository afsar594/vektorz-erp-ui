import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishedProductEntryComponent } from './finished-product-entry.component';

describe('FinishedProductEntryComponent', () => {
  let component: FinishedProductEntryComponent;
  let fixture: ComponentFixture<FinishedProductEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinishedProductEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinishedProductEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
