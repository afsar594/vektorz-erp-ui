import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import { ProformaInvoiceService } from '../routes/service/proformaInvoice/proforma-invoice.service';

@Component({
  selector: 'app-proforma-invoice-status',
  templateUrl: './proforma-invoice-status.component.html',
  styleUrls: ['./proforma-invoice-status.component.scss']
})
export class ProformaInvoiceStatusComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  @Input() displayProformaModal: boolean = false;
  @Output() displayProformaModalChange = new EventEmitter<boolean>();
  @Output() onItemSelected = new EventEmitter<any>();

  SalesOrderStatus!: FormGroup;
  customers: any[] = [];
  filterArray: any[] = [];

  constructor(
    private fb: FormBuilder,
    public proformaInvoiceService: ProformaInvoiceService,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.show();
  }

  initForm(): void {
    this.SalesOrderStatus = this.fb.group({
      DateTO: [new Date()],
      DateFrom: [new Date(new Date().setFullYear(new Date().getFullYear() - 5))],
      isDate: [false]
    });
  }

  show(): void {
    this.proformaInvoiceService.GetAllProformaInvoicesData().subscribe((response: any) => {
      const rawData = Array.isArray(response) ? response : (response.result || []);
      const masterRecords: any[] = [];

      rawData.forEach((masterRecord: any) => {
        const header = masterRecord.proformaInvoice || {};
        masterRecords.push({
          voucherNo: header.proformaInvoiceVoucherno,
          date: header.proformaInvoiceDate,
          locationId: header.proformaInvoiceLocationId,
          originalPayload: masterRecord // Storing the full raw data for export mapping
        });
      });

      this.filterArray = masterRecords;
      this.filter();
    });
  }

  filter(): void {
    let filteredArray = this.filterArray;
    const formVals = this.SalesOrderStatus.value;

    if (formVals.isDate) {
      const fromDate = new Date(formVals.DateFrom).toISOString().split('T')[0];
      const toDate = new Date(formVals.DateTO).toISOString().split('T')[0];

      filteredArray = filteredArray?.filter((res) => {
        if (!res.date) return false;
        const voucherDate = new Date(res.date).toISOString().split('T')[0];
        return voucherDate >= fromDate && voucherDate <= toDate;
      });
    }

    this.customers = filteredArray;
    if (this.dt) this.dt.reset();
  }

  clearfilter(): void {
    this.SalesOrderStatus.patchValue({
      DateFrom: new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
      DateTO: new Date(),
      isDate: false
    });
    this.filter();
  }

  // Fallback for earlier HTML template iteration
  onProformaExported(event: any): void {
    this.processAndEmit(event.data);
  }

  // Fixes the TS2339 compilation error from your current HTML template
  selectRow(rowData: any): void {
    this.processAndEmit(rowData);
  }

  // Core formatting logic: Flattens the master record back into the required line-item array
  private processAndEmit(rowData: any): void {
    if (!rowData || !rowData.originalPayload) return;

    const masterRecord = rowData.originalPayload;
    const header = masterRecord.proformaInvoice || {};
    const details = masterRecord.proformaInvoiceDetails || [];

    const exportedItems: any[] = [];

    // Map exact columns the parent component originally expected
    details.forEach((child: any) => {
      exportedItems.push({
        voucherNo: header.proformaInvoiceVoucherno,
        date: header.proformaInvoiceDate,
        lpoNo: header.proformaInvoiceLpoNo,
        customerCode: header.proformaInvoiceCustCode,
        matDes: child.proformaInvoiceDetailsDescription,
        unitId: child.proformaInvoiceDetailsUnitId,
        quantity: child.proformaInvoiceDetailsQty,
        unitPrice: child.proformaInvoiceDetailsUnitPrice,
        amount: child.proformaInvoiceDetailsAmount,

        customer: header.proformaInvoiceCustCode,
        itemId: child.proformaInvoiceDetailsItemId,
        locationId: header.proformaInvoiceLocationId,
        cpoDate: header.proformaInvoiceDate
      });
    });

    // Fire export payload and auto-close immediately
    this.onItemSelected.emit(exportedItems);
    this.closeModal();
  }

  closeModal(): void {
    this.displayProformaModal = false;
    this.displayProformaModalChange.emit(this.displayProformaModal);
  }
}