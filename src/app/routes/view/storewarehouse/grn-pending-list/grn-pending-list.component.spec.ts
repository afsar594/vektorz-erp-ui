import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrnPendingListComponent } from './grn-pending-list.component';

describe('GrnPendingListComponent', () => {
  let component: GrnPendingListComponent;
  let fixture: ComponentFixture<GrnPendingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrnPendingListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrnPendingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
