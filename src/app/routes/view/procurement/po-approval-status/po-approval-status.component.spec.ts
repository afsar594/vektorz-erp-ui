import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoApprovalStatusComponent } from './po-approval-status.component';

describe('PoApprovalStatusComponent', () => {
  let component: PoApprovalStatusComponent;
  let fixture: ComponentFixture<PoApprovalStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoApprovalStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoApprovalStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
