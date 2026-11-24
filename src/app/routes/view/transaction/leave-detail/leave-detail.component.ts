import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
 import { defaults } from 'src/app/shared/service/settings';
 import { PageHeaderComponent } from 'src/app/shared/component/page-header/page-header.component';

@Component({
  selector: 'app-leave-detail',
  templateUrl: './leave-detail.component.html',
  styleUrls: ['./leave-detail.component.scss']
})
export class LeaveDetailComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  Date: Date;
  location: Array<string>;
  licensekey: any;
   gridHeader: string;
   index: number = 0;
   leaveDetail_list:any;
  handleChange(e) {
   this.index = e.index;
 }

 
 
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private trnslateservice:TranslateService,

   ) { 
  
  }
  ngOnInit(): void {  
    this.cols = [
      { field: 'leaveDetailCode', header: 'Code' },
      { field: 'leaveDetailVoucherNo', header: 'Voucher No' },
      { field: 'leaveDetailVoucherType', header: 'Voucher Type' },
      { field: 'leaveDetailCreatedDate', header: 'Created Date' },
      { field: 'leaveDetailUpdatedDate', header: 'Updated Date' },
      { field: 'leaveDetailStatus', header: 'Status' },
       { field: 'leaveDetailCreatedBy', header: 'Created By' },
      { field: 'leaveDetailLocation', header: 'Location' },
      { field: 'leaveDetailAction', header: 'Action' },
 
     ];
       this.leaveDetail_list=[
        {
            leaveDetailCode: 'asdf',
            leaveDetailVoucherNo:88,
      leaveDetailVoucherType: 22, // Assuming date format
      leaveDetailCreatedDate:0,// Assuming party ID is a number
      leaveDetailUpdatedDate:0,// Assuming currency ID is a number
      leaveDetailStatus: 'asdf',
      leaveDetailCreatedBy: 0,
      leaveDetailLocation: 0,
      leaveDetailAction: 0,
      
       
        },
        {
          leaveDetailCode: 'asdf',
          leaveDetailVoucherNo:88,
          leaveDetailVoucherType: 22, // Assuming date format
          leaveDetailCreatedDate:0,// Assuming party ID is a number
          leaveDetailUpdatedDate:0,// Assuming currency ID is a number
          leaveDetailStatus: 'asdf',
          leaveDetailCreatedBy: 0,
          leaveDetailLocation: 0,
          leaveDetailAction: 0,
        },
        // ... add more rows as needed
      ],
 
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";
      
    });
   }
  

}
interface leaveDetail_list {
  leaveDetailVoucherNo: string;
  leaveDetailPurchaseDate: Date; // Assuming date format
  leaveDetailPartyId: number; // Assuming party ID is a number
  leaveDetailCurrencyId: number; // Assuming currency ID is a number
  leaveDetailDescription: string;
  leaveDetailTotalGrossAmt: number;
  leaveDetailTotalDisAmount: number;
  leaveDetailVatAmount: number;
  leaveDetailVatRoundSign: string;
  leaveDetailVatRoundAmount: number;
  leaveDetailNetAmount: number;
  action: string;
}
