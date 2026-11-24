import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProformaInvoiceStatusComponent } from './proforma-invoice-status.component';

describe('ProformaInvoiceStatusComponent', () => {
  let component: ProformaInvoiceStatusComponent;
  let fixture: ComponentFixture<ProformaInvoiceStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProformaInvoiceStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProformaInvoiceStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
