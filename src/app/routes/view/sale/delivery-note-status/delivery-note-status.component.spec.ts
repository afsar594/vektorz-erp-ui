import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryNoteStatusComponent } from './delivery-note-status.component';

describe('DeliveryNoteStatusComponent', () => {
  let component: DeliveryNoteStatusComponent;
  let fixture: ComponentFixture<DeliveryNoteStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryNoteStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryNoteStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
