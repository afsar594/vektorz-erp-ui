import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api/menuitem';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HotTableRegisterer } from '@handsontable/angular';
import { defaults } from 'src/app/shared/service/settings';
import Handsontable from 'handsontable';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { StorewarehousesApiService } from 'src/app/routes/service/storewarehouse.api.services';

type SheetData = any[][];
@Component({
  selector: 'app-stock-ageing-report',
  templateUrl: './stock-ageing-report.component.html',
  styleUrls: ['./stock-ageing-report.component.scss'],
})
export class StockAgeingReportComponent implements OnInit {
  location: any;
  dataset: any;
  ScreenId: number;
  Permission: any;
  itemGroupList: any[] = [];
  itemList: any[] = [];
  mainItemList: any[] = [];
  locationList: any[] = [];
  showItemsWithStock = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private messageService: MessageService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private storewarehouseapi: StorewarehousesApiService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  title: string;
  subtitle: string;
  breadcumbmodel: MenuItem[];
  btnlabel: string = 'Submit';
  cols: any;
  dataJson: string;
  data: SheetData;
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = '';
  ItemFormGroup: FormGroup;
  licensekey: string;
  tempVar: string = 'Eldon Base for stackable storage shelf, platinum';

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      if (rights) {
        var res = rights[0];
        this.Permission = {
          Allow: res?.workGroupPermissionsUallow,
          Add: res?.workGroupPermissionsUadd,
          Delete: res?.workGroupPermissionsUdelete,
          Edit: res?.workGroupPermissionsUedit,
          Print: res?.workGroupPermissionsUprint,
          View: res?.workGroupPermissionsUview,
        };
      }
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
    });
    this.cols = [];
    this.initializeControls();
    this.ItemFormGroup = this.fb.group({
      ItemGroup: [-1],
      ItemName: [-1],
      DateFrom: [new Date()],
      DateTo: '',
      DateFormat: '',
      Brand: '',
      Location: [-1],
      Job: '',
      ShowItemsWithStock: [false],
    });
    this.loadDropdowns();
  }

  loadDropdowns(): void {
    this.storewarehouseapi.StockLedger_LoadDropdown().subscribe(
      (response: any) => {
        const result = response?.resultSet;
        this.itemGroupList = (result?.itemMasterGroup || []).map((item: any) => ({
          label: item.itemMasterItemName,
          value: item.itemMasterItemId,
        }));
        this.itemGroupList.unshift({ label: '--Select Item Group--', value: -1 });

        this.mainItemList = (result?.itemMaster || []).map((item: any) => ({
          label: item.itemMasterItemName,
          value: item.itemMasterItemId,
          groupId: item.itemMasterAccountNo,
        }));
        this.itemList = this.mainItemList.slice();
        this.itemList.unshift({ label: '--Select Item--', value: -1 });

        this.locationList = (result?.LocationMaster || [])
          .filter((location: any) => location.locationMasterLocationStatus != false)
          .map((location: any) => ({
            label: location.locationMasterLocationName,
            value: location.locationMasterLocationId,
          }));
        this.locationList.unshift({ label: '--Select Location--', value: -1 });
      },
      (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Stock Ageing',
          detail: error?.error?.message || 'Unable to load report filters.',
        });
      }
    );
  }

  onItemGroupChange(event: any): void {
    const groupId = event?.value;
    this.ItemFormGroup.controls.ItemName.setValue(-1);
    this.itemList = groupId > 0
      ? this.mainItemList.filter((item: any) => item.groupId == groupId)
      : this.mainItemList.slice();
    this.itemList.unshift({ label: '--Select Item--', value: -1 });
  }

  listStockAgeingReport(): void {
    const formValue = this.ItemFormGroup.value;
    const payload = {
      IsDateChecked: true,
      fromDate: formValue.DateFrom,
      toDate: formValue.DateFrom,
      ItemId: formValue.ItemName,
      ItemGroupId: formValue.ItemGroup,
      LocationId: formValue.Location,
      ExcludeZeroBalance: !!this.showItemsWithStock,
      ExcludeZeroOpeningBalance: false,
      PartNo: null,
    };

    this.storewarehouseapi.StockAgeingReport(payload).subscribe(
      (response: any) => {
        const result = response?.result || response?.Result || [];
        this.dataset = (result || []).map((row: any) => ({
          Itemid: row.itemId,
          partno: row.partNo,
          Itemname: row.itemName,
          '[0-30]': row.days0To30,
          '[31-60]': row.days31To60,
          '[61-90]': row.days61To90,
          '[91-180]': row.days91To180,
          '[181-360]': row.days181To360,
          OV360: row.over360,
        }));
        this.hotRegisterer
          .getInstance(this.hotid)
          .updateSettings({ data: this.dataset });
      },
      (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Stock Ageing',
          detail: error?.error?.message || 'Unable to generate stock ageing report.',
        });
      }
    );
  }

  clearStockAgeingReport(): void {
    this.ItemFormGroup.patchValue({
      ItemGroup: -1,
      ItemName: -1,
      DateFrom: new Date(),
      Location: -1,
      ShowItemsWithStock: false,
    });
    this.itemList = this.mainItemList.slice();
    this.itemList.unshift({ label: '--Select Item--', value: -1 });
    this.dataset = [];
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: [] });
  }

  exportStockAgeingReport(): void {
    if (!this.dataset || this.dataset.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Stock Ageing',
        detail: 'No report data to export.',
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(this.dataset);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Ageing');
    XLSX.writeFile(workbook, 'Stock-Ageing-Report.xlsx');
  }

  onFileChange(evt: any) {
    this.exceltoJsonConverter(evt);
    // /* wire up file reader */
    // const target: DataTransfer = <DataTransfer>(evt.target);
    // if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    // const reader: FileReader = new FileReader();
    // reader.onload = (e: any) => {
    //   /* read workbook */
    //   const bstr: string = e.target.result;
    //   const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

    //   /* grab first sheet */
    //   const wsname: string = wb.SheetNames[0];
    //   const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    //   /* save data */
    //   this.data = <SheetData>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
    //   console.log(this.data);
    //   //this.dataJson = JSON.stringify(this.data);
    //   //console.log(this.dataJson);
    // };
    // reader.readAsBinaryString(target.files[0]);
  }

  hotid = 'stockLedgerReport';
  private hotRegisterer = new HotTableRegisterer();
  stockLedgerReport: Handsontable.GridSettings;
  stockLedgerFormGroup: FormGroup;

  initializeControls() {
    this.stockLedgerReport = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      width: '100%',
      height: 150,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      // allowInsertColumn: false,
      allowInsertRow: true,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      stretchH: 'all',
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      manualRowResize: true,
      manualColumnResize: true,
      hiddenColumns: {
        columns: [5],
        indicators: false,
      },
      // rowHeaders: true,
      columns: [
        {
          data: 'Itemid',
          type: 'autocomplete',
          source: (query, callback) => {
            callback(this.exceltoarray);
          },
          allowInvalid: false,
          strict: false,
        },
        {
          data: 'partno',
          type: 'numeric',
        },
        {
          data: 'Itemname',
          type: 'autocomplete',
          source: (query, callback) => {
            callback(this.exceltoarray);
          },
          allowInvalid: false,
          strict: false,
        },
        {
          data: '[0-30]',
          type: 'dropdown',
          source: (query, callback) => {
            callback(this.exceltoarray);
          },
        },
        {
          data: '[31-60]',
          type: 'text',
        },
        {
          data: '[61-90]',
          type: 'numeric',
        },
        {
          data: '[91-180]',
          type: 'text',
        },
        {
          data: '[181-360]',
          type: 'numeric',
        },
        {
          data: 'OV360',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Item Id'),
        this.translate.instant('Part No'),
        this.translate.instant('Item Name'),
        this.translate.instant('[0-30]'),
        this.translate.instant('[31-60]'),
        this.translate.instant('[61-90]'),
        this.translate.instant('[91-180]'),
        this.translate.instant('[181-360]'),
        this.translate.instant('OV360'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    this.stockLedgerReport = this.utilityService.getTableConfig(
      stockAgeingReportColumnObjList(this),
      []
    );

    this.stockLedgerReport.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.stockLedgerReport.afterRemoveRow = (index: number, amount: number) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.stockLedgerReport.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }
  ColumnSum() {
    if (!this.stockLedgerFormGroup) {
      return;
    }
    if (this.stockLedgerReport.data.length > 0) {
      const sum1 = this.stockLedgerReport.data
        ?.filter((item) => item.hasOwnProperty('credit'))
        .reduce((sum, current: any) => sum + current.credit, [0]);
      this.stockLedgerFormGroup.controls.ReceiptVoucherMasterDrAmount.setValue(
        sum1
      );
    }
  }

  export(): void {
    var i = 0,
      result = [];

    while (i < Object.keys(this.exceltoJson.sheet1).length) {
      result.push([]);
      for (var key in this.exceltoJson.sheet1[i].fields) {
        result[result.length - 1].push(this.exceltoJson.sheet1[i].fields[key]);
      }
      i++;
    }
    this.data = result;
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

  exceltoJson = { sheet1: {} };
  exceltoarray: Array<string> = [];

  exceltoJsonConverter(event: any) {
    this.exceltoJson = { sheet1: {} };
    let headerJson = {};
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>event.target;
    // if (target.files.length !== 1) {
    //   throw new Error('Cannot use multiple files');
    // }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    console.log('filename', target.files[0].name);
    this.exceltoJson['filename'] = target.files[0].name;
    reader.onload = (e: any) => {
      /* create workbook */
      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
      for (var i = 0; i < wb.SheetNames.length; ++i) {
        const wsname: string = wb.SheetNames[i];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
        this.exceltoJson[`sheet${i + 1}`] = data;
        this.exceltoarray.push[`sheet${i + 1}`] = data.toString();
        const headers = this.get_header_row(ws);
        headerJson[`header${i + 1}`] = headers;
        this.cols.push(headers);
        //  console.log("json",headers);
      }
      this.exceltoJson['headers'] = headerJson;
      console.log(this.cols);
    };
  }

  get_header_row(sheet) {
    var headers = [];
    var range = XLSX.utils.decode_range(sheet['!ref']);
    var C,
      R = range.s.r; /* start in the first row */
    /* walk every column in the range */
    for (C = range.s.c; C <= range.e.c; ++C) {
      var cell =
        sheet[
          XLSX.utils.encode_cell({ c: C, r: R })
        ]; /* find the cell in the first row */
      // console.log("cell",cell)
      var hdr = 'UNKNOWN ' + C; // <-- replace with your desired default
      if (cell && cell.t) {
        hdr = XLSX.utils.format_cell(cell);
        headers.push(hdr);
      }
    }
    return headers;
  }

  get f() {
    return this.ItemFormGroup.controls;
  }
}
export const stockAgeingReportColumnObjList = (
  component: StockAgeingReportComponent
) => [
  {
    data: 'Itemid',
    type: 'autocomplete',
    label: 'Item Id',
    toolTip: 'Item ID',
    source: component.exceltoarray,
  },
  {
    data: 'partno',
    type: 'numeric',
    label: 'Part No',
    toolTip: 'Part Number',
  },
  {
    data: 'Itemname',
    type: 'autocomplete',
    label: 'Item Name',
    toolTip: 'Item Name',
    source: component.exceltoarray,
  },
  {
    data: '[0-30]',
    type: 'dropdown',
    label: '[0-30]',
    toolTip: '0 to 30 days',
    source: component.exceltoarray,
  },
  {
    data: '[31-60]',
    type: 'text',
    label: '[31-60]',
    toolTip: '31 to 60 days',
  },
  {
    data: '[61-90]',
    type: 'numeric',
    label: '[61-90]',
    toolTip: '61 to 90 days',
  },
  {
    data: '[91-180]',
    type: 'text',
    label: '[91-180]',
    toolTip: '91 to 180 days',
  },
  {
    data: '[181-360]',
    type: 'numeric',
    label: '[181-360]',
    toolTip: '181 to 360 days',
  },
  {
    data: 'OV360',
    type: 'numeric',
    label: 'OV360',
    toolTip: 'Over 360 days',
  },
];
