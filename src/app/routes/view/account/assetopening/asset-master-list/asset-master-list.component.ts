import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-asset-master-list',
  templateUrl: './asset-master-list.component.html',
  styleUrls: ['./asset-master-list.component.scss'],
})
export class AssetMasterListComponent implements OnInit {
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
    private datePipe: DatePipe,
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
      width: 'auto',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords.col.valueOf() === 7) {
          const hot = this.hotRegisterer.getInstance(this.hotid);
          var data = hot.getDataAtRow(coords.row);

          this.CloseModel(data);
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
          data: 'assetMasterAssetCode',
          type: 'text',
        },
        {
          data: 'assetMasterAssetAccountNo',
          type: 'text',
        },
        {
          data: 'assetMasterAssetName',
          type: 'text',
        },
        {
          data: 'assetMasterAssetDepLibAccount',
          type: 'text',
        },
        {
          data: 'assetMasterAssetDepExpAccount',
          type: 'text',
        },
        {
          data: 'assetMasterAssetType',
          type: 'text',
        },
        {
          data: 'assetMasterAssetCreatedDate',
          type: 'text', // Use text type to display formatted date

          renderer: this.dateRenderer.bind(this),
          readOnly: true,
        },
        {
          data: null,
          renderer: this.buttonRenderer.bind(this),
          className: 'htCenter',
        },
      ],
      colHeaders: [
        this.translate.instant('Code '),
        this.translate.instant('Acc No'),
        this.translate.instant('Account Name'),

        this.translate.instant('Lib.Acc no'),
        this.translate.instant('Exp.Acc no'),
        this.translate.instant('Type'),
        this.translate.instant('Date'),
        this.translate.instant('Action'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';

    const button = document.createElement('a');
    button.className = 'iconbton';
    button.innerHTML = '<i class="pi pi-pencil" ></i>';

    td.appendChild(button);
    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }

  dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      td.innerText = formattedDate ? formattedDate : '';
    } else {
      td.innerText = '';
    }
  }

  CloseModel(data) {
    this.ref.close(data);
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
      .GetAssetMaster()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.dataset = response.result?.filter((x) => x.value != '');
        }
      });
  }
}
