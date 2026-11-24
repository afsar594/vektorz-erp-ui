import { Component, OnInit } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-account-master-list',
  templateUrl: './account-master-list.component.html',
  styleUrls: ['./account-master-list.component.scss'],
})
export class AccountMasterListComponent implements OnInit {
  passEntry: any = 1;
  dataset: any;
  licensekey: any;
  state: {
    Dir: string;
    Field: any;
    Skip: any;
    Take: any;
    Search: any;
    Filter: any;
  };
  search: any;
  filter: any;

  constructor(
    private saleService: AccountstatementService,
    private translate: TranslateService,
    // private config: DynamicDialogConfig,
    private ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.licensekey = defaults.hotlicensekey;
    this.GetGridListData(null);
    this.initializeControls();
  }
  hotid: any = 'CustomerSalesOrderList';
  private hotRegisterer = new HotTableRegisterer();
  CustomerSalesOrder: Handsontable.GridSettings;

  initializeControls() {
    this.CustomerSalesOrder = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [30, 30, 90, 30, 30, 30, 30, 30],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords.col.valueOf() === 0) {
          const hot = this.hotRegisterer.getInstance(this.hotid);
          var data = hot.getDataAtRow(coords.row);

          this.CloseModel(data);
          // const hot = new Handsontable(document.getElementById('CustomerSalesOrder'), this.CustomerSalesOrder);
          //  var data = hot.getDataAtRow(coords.row);
          // hot.alter('insert_row', 2);
          // hot.alter("remove_row", [[0, 1]]);
          //  hot.setDataAtCell(0, 3,   'g');
          //this.newEntry();
        } else if (coords.col.valueOf() === 3) {
          // this.unitListing = true;
        } else if (coords.col.valueOf() === 5) {
        }
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,

      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'value',
          type: 'text',
        },
        {
          data: 'name',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('Account No '),
        this.translate.instant('Account Name'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }
  CloseModel(data) {
    this.passEntry = data;
    //this.passEntry.emit(0);
    this.ref.close();
  }

  GetGridListData(event: any) {
    this.state = {
      Dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
      Field:
        event != null
          ? event.sortField != null && event.sortField != ''
            ? event.sortField
            : 'AccountsTransactions_TransSno'
          : 'AccountsTransactions_TransSno',
      Skip: event != null ? (event.first != null ? event.first : 0) : 0,
      Take: event != null ? (event.rows != null ? event.rows : 0) : 10000,
      Search: this.search,
      Filter: this.filter,
    };
    this.saleService
      .GetAccountMasterDropdown()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.dataset = response.result.filter((x) => x.value != '');
        }
      });
  }
}
