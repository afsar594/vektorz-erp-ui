import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
// import { EntityResponse } from 'src/app/routes/domain/EntityResponse';
import { SalesServiceService } from 'src/app/routes/service/sales-services/sales-service.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-item-master-list',
  templateUrl: './item-master-list.component.html',
  styleUrls: ['./item-master-list.component.scss'],
})
export class ItemMasterListComponent implements OnInit, AfterViewInit {
  passEntry: any;
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
  search: any = 'hello';
  filter: any;
  constructor(
    private saleService: SalesServiceService,
    private translate: TranslateService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.licensekey = defaults.hotlicensekey;
    this.GetGridListData(null);
    this.initializeControls();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const hot = this.hotRegisterer.getInstance(this.hotid);
      if (hot) {
        hot.render();
      }
    }, 150);
  }
  hotid: any = 'ItemMasterList';

  private hotRegisterer = new HotTableRegisterer();
  ItemMasterList: Handsontable.GridSettings;

  initializeControls() {
    this.ItemMasterList = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [80, 220, 110, 100, 100, 100, 80],
      minRows: 3,
      width: '100%',
      height: 380,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords && coords.row >= 0) {
          const hot = this.hotRegisterer.getInstance(this.hotid);
          if (hot) {
            const data = hot.getDataAtRow(coords.row);
            if (data && data[0] != null) {
              this.CloseModel(data);
            }
          }
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
          data: 'itemMasterItemId',
          type: 'numeric',
        },
        {
          data: 'itemMasterItemName',
          type: 'text',
        },
        {
          data: 'itemMasterMaterialCode',
          type: 'text',
        },
        {
          data: 'itemMasterPartNo',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'itemMasterAccountNo',
          type: 'numeric',
        },
        {
          data: 'itemMasterBatchCode',
          type: 'text',
        },
        {
          data: 'itemMasterUnitPrice',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
        },
      ],
      colHeaders: [
        this.translate.instant('Item Id'),
        this.translate.instant('Item Name'),
        this.translate.instant('Material Code'),
        this.translate.instant('Part No'),
        this.translate.instant('Account No'),
        this.translate.instant('Batch Code'),
        this.translate.instant('Price'),
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
    this.saleService.GetItemMasterList().subscribe((response: any) => {
      if (response.valid && response.result?.data?.length > 0) {
        this.dataset = response.result.data;
        setTimeout(() => {
          const hot = this.hotRegisterer.getInstance(this.hotid);
          if (hot) {
            hot.render();
          }
        }, 50);
      }
    });
  }
}
