import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressiveInvoiceComponent } from './progressive-invoice.component';

describe('ProgressiveInvoiceComponent', () => {
  let component: ProgressiveInvoiceComponent;
  let fixture: ComponentFixture<ProgressiveInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressiveInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressiveInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
