import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuevoucherComponent } from './issuevoucher.component';

describe('IssuevoucherComponent', () => {
  let component: IssuevoucherComponent;
  let fixture: ComponentFixture<IssuevoucherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuevoucherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuevoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
