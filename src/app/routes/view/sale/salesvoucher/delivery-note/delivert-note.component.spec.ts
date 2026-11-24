import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelivertNoteComponent } from './delivert-note.component';

describe('DelivertNoteComponent', () => {
  let component: DelivertNoteComponent;
  let fixture: ComponentFixture<DelivertNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelivertNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DelivertNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
