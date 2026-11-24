import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng';
import { AccountApiService } from 'src/app/routes/service/account.api.service';

@Component({
  selector: 'app-borwse-pr',
  templateUrl: './borwse-pr.component.html',
  styleUrls: ['./borwse-pr.component.scss']
})
export class BorwsePRComponent implements OnInit {

  PRform: FormGroup;
  PRarry: any[] = [];
  constructor(private accountapi: AccountApiService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.cols = [
      { field: 'paymentRequestSno', header: 'SR NO' },
      { field: 'paymentRequestVoucherNo', header: 'Voucher No' },
      { field: 'paymentRequestDate', header: 'Date' },
      { field: 'paymentRequestDbAmount', header: 'Amount' },
      { field: 'paymentRequestNarration', header: 'Narration' }
    ];
  }

  ngOnInit(): void {
    this.PRform = new FormGroup({
      voucherNo: new FormControl(''),
      toDate: new FormControl(new Date()),
      fromDate: new FormControl(new Date()),
      isDate: new FormControl(false),
    });
    this.show()
  }

  toggleSelection(data: any) {
    this.ref.close(data);
  }

  cols: any;
  close() {
    this.ref.close();
  }

  clearfilter() {
    this.PRform.reset();
  }

  show() {
    this.accountapi.getbrowsePR(this.PRform.value).subscribe((res: any) => {
      this.PRarry = res.result;
    });
  }



}
