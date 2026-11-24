import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';

@Component({
  selector: 'app-cust-quatation',
  templateUrl: './cust-quatation.component.html',
  styleUrls: ['./cust-quatation.component.scss'],
})
export class CustQuatationComponent implements OnInit {
  quotaionNo: any;
  isDate: boolean = false;
  fromDate: Date = new Date();
  toDate: Date = new Date();
  Data: any[] = [];
  cols: any;
  selectedqotation: any[] = [];

  constructor(
    private procurementapi: ProcurementApiService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.cols = [
      { field: '', header: 'Select' },
      { field: 'quotationNo', header: 'Quotation No' },
      { field: 'itemName', header: 'Item Name' },
      { field: 'unitName', header: 'Unit' },
      { field: 'itemQty', header: 'Quantity' },
      { field: 'rate', header: 'Rate' },
      { field: 'totalAmount', header: 'Total Amount' },
      { field: 'grossAmount', header: 'Gross Amount' },
    ];
    this.getData();
  }

  clearfilter() {
    this.quotaionNo = null;
    this.isDate = false;
    this.fromDate = null;
    this.toDate = null;
  }

  getData() {
    const req = {
      isdate: this.isDate ? true : false,
      fromDate: this.isDate ? this.fromDate : null,
      toDate: this.isDate ? this.toDate : null,
      quotaionNo: this.quotaionNo,
    };
    this.procurementapi
      .GetCustomerQuotationItemToPr(req)
      .subscribe((res: any) => {
        this.Data = res.result.map((k: any) => {
          k.isSelect = false;
          return k;
        });
      });
  }
  isSelected(data: any): boolean {
    return this.selectedqotation.includes(data);
  }

  toggleSelection(data: any) {
    const index = this.selectedqotation.indexOf(data);
    if (index === -1) {
      this.selectedqotation.push(data);
      data.isSelect = true;
    } else {
      this.selectedqotation.splice(index, 1);
      data.isSelect = false;
    }
  }

  export() {
    this.ref.close(this.selectedqotation);
  }
}
