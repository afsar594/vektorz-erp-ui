import { Component, OnInit } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { defaults } from 'src/app/shared/service/settings';
 

@Component({
  selector: 'app-voucher-allocation-list',
  templateUrl: './voucher-allocation-list.component.html',
  styleUrls: ['./voucher-allocation-list.component.scss']
})
export class VoucherAllocationListComponent implements OnInit {
  totalRecords:number=0;
  passEntry: any=1;
  dataset: any;
  licensekey: any;
  state: { Dir: string; Field: any; Skip: any; Take: any; Search: any; Filter: any; };
  search: any;
  filter: any;

  constructor(private saleService: AccountstatementService, 
    private translate: TranslateService, 
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
    ) { }

  ngOnInit(): void {
    this.licensekey = defaults.hotlicensekey;
    this.GetGridListData(null);
  }
  hotid: any = 'CustomerSalesOrderList';

  private hotRegisterer = new HotTableRegisterer();
  CustomerSalesOrder: Handsontable.GridSettings;

  CloseModel(id) {
    this.passEntry = id;
    this.ref.close(id)
   }
  GetGridListData(event: any) {
    this.state = {
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter
    }
    this.saleService.GetVoucherAllocationsGridList(this.state).subscribe((response: ApiResponse<any>) => {
      this.dataset = response.result.data;
    })
  }
  onselect(id){
    this.ref.close(id)
  }
}
