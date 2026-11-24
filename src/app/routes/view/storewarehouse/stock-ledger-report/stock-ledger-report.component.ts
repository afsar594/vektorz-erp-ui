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
import { ConfirmationService, MessageService } from 'primeng/api';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { interval } from 'rxjs';
// import * as $ from 'jquery';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { GlobalSerivceService } from 'src/app/routes/service/stock-api/global-serivce.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

type SheetData = any[][];

@Component({
  selector: 'app-stock-ledger-report',
  templateUrl: './stock-ledger-report.component.html',
  styleUrls: ['./stock-ledger-report.component.scss'],
})
export class StockLedgerReportComponent implements OnInit {
  ScreenId: number;
  Permission: any;

  constructor(
    private router: Router,
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private masterApi: MasterApiService,
    private stockApi: StockApiService,
    private utilityService: UtilityService,

    private fileSaverService: FileSaverService,
    private permission: PermissionsService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  response: any;
  btnFlag: {
    edit: boolean;
    cancel: boolean;
    save: boolean;
    new: boolean;
    delete: boolean;
    list: boolean;
  };
  itemIds = [];
  itemNames = [];
  units = [];
  openQty = [];
  openAmount = [];
  SinQty = [];
  SinAmount = [];
  SoutQty = [];
  SoutAmount = [];
  BalQty = [];
  BalAmount = [];
  locationList: any;
  jobList: any;
  brandList: any;
  title: string;
  dataset: any;
  payload: any;
  subtitle: string;
  gridHeader: string;
  displayMaximizable: boolean;
  itemGroupList: any;
  showItemGroupList: boolean;
  showItemList: boolean;
  showLocationList: boolean;
  showJobList: boolean;
  showBrandList: boolean;
  itemList: any;
  selectedItem: item;
  breadcumbmodel: MenuItem[];
  btnlabel: string = 'Submit';
  data: SheetData;
  fileName: string = '';
  ItemFormGroup: FormGroup;
  licensekey: string;
  cols: Array<any>;
  jobCols: Array<any>;
  brandCols: Array<any>;
  datedFrom: any;
  datedTo: any;
  selectedLocation: any;
  selectedJob: any;
  user: any;
  moveToStockMovement: boolean;
  hotid = 'stockLedgerReport';
  private hotRegisterer = new HotTableRegisterer();
  stockLedgerReport: Handsontable.GridSettings;
  stockLedgerFormGroup: FormGroup;

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
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title; //////  Setting Title of the page
      this.subtitle = data.title; //////  Setting Sub-Title of the page
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k })); //////  Setting BreadCrumb of the page
    this.gridHeader = 'No Data';
    this.selectedItem = {
      Item_Master_Item_ID: '',
      Item_Master_Item_Name: '',
    };
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: true,
      new: true,
      delete: true,
      list: false,
    }; //////  Setting Button Flags of the page
    this.showLocationList = false;
    this.showJobList = false;
    this.showBrandList = false;
    this.moveToStockMovement = false;
    this.initializeControls();
    this.ItemFormGroup = new FormGroup({
      //////   Item Form Group
      ItemGroup: new FormControl('', Validators.required),
      ItemName: new FormControl('', Validators.required),
      DateFrom: new FormControl('', Validators.required),
      DateTo: new FormControl('', Validators.required),
      DateFormat: new FormControl('', Validators.required),
      Brand: new FormControl('', Validators.required),
      Location: new FormControl('', Validators.required),
      Job: new FormControl('', Validators.required),
      DetailsType: new FormControl('Details', Validators.required),
      DateType: new FormControl('Monthly', Validators.required),
    });
    this.cols = [
      //////   Setting Table Cols and Titles
      { field: 'item_Master_Item_ID', header: 'Item Code' },
      { field: 'item_Master_Item_Name', header: 'Item Name' },
      { field: 'item_Master_Bar_Code', header: 'Bar Code' },
      { field: 'item_Master_Part_No', header: 'Part No.' },
      { field: 'item_Master_Stock', header: 'Stock' },
    ];
    this.jobCols = [
      { field: 'Name', header: 'Job Name' },
      { field: 'JobNumber', header: 'Job No.' },
    ];
    this.brandCols = [
      { field: 'Name', header: 'Code' },
      { field: 'Name', header: 'Brand Name' },
    ];
    this.datedFrom = new Date(
      new Date().setFullYear(new Date().getFullYear() - 5)
    ); /////   Setting Defaults for Date
    this.datedTo = new Date();
    this.getCompanyDetails();
  }
  showItemGroups() {
    this.showItemGroupList = true;
    this.itemGroupList = [
      { itemId: '851', itemName: 'Diesel', checked: false },
      { itemId: '311', itemName: 'Garnet', checked: false },
      { itemId: '127', itemName: 'General', checked: false },
      { itemId: '472', itemName: 'Paints', checked: false },
    ];
  }
  showItems() {
    this.stockApi.getAllItemsList().subscribe((data) => {
      this.itemList = data;
    });
    this.showItemList = true;
  }
  toggleActive(itemId) {
    this.itemGroupList.forEach((element) => {
      if (element.itemId === itemId) element.checked = !element.checked;
    });
  }
  toggleActiveLoc(itemId, selectedItemName) {
    this.locationList.forEach((element) => {
      // $("#" + element.locationMasterLocationId).removeClass('selected');
    });
    // $("#" + itemId).addClass('selected');
    this.selectedLocation = selectedItemName;
    this.showLocationList = false;
  }
  selectJob(jobName) {
    this.selectedJob = jobName;
    this.showJobList = false;
  }
  clearForm() {
    this.ItemFormGroup.controls['ItemGroup'].setValue('');
    this.ItemFormGroup.controls['ItemName'].setValue('');
    this.ItemFormGroup.controls['DateFrom'].setValue('');
    this.ItemFormGroup.controls['DateTo'].setValue('');
    this.ItemFormGroup.controls['DateFormat'].setValue('');
    this.ItemFormGroup.controls['Brand'].setValue('');
    this.ItemFormGroup.controls['Location'].setValue('');
    this.ItemFormGroup.controls['Job'].setValue('');
    this.ItemFormGroup.controls['DetailsType'].setValue('');
    this.ItemFormGroup.controls['DateType'].setValue('');
  }
  //done
  getStockLedgerRpt() {
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      new: false,
      delete: false,
      list: false,
    };
    this.stockApi.getStockLedgerReport().subscribe(
      (data) => {
        this.dataset = data;
        this.hotRegisterer
          .getInstance(this.hotid)
          .updateSettings({ data: this.dataset });
        this.gridHeader = 'Showing All Data';
        this.calculateTotal();
      },
      (error) => {}
    );
  }
  //done
  getFilteredStockLedgerRpt() {
    if (
      this.f.ItemGroup.invalid ||
      this.f.ItemName.invalid ||
      this.f.DateFrom.invalid ||
      this.f.DateTo.invalid ||
      this.f.Brand.invalid ||
      this.f.Location.invalid ||
      this.f.DetailsType.invalid
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill all the required feilds.!',
      });
      return;
    }
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      new: false,
      delete: false,
      list: false,
    };
    this.payload = {
      itemGroup: new String(this.ItemFormGroup.value.ItemGroup),
      itemName: this.ItemFormGroup.value.ItemName,
      dateFrom: this.ItemFormGroup.value.DateFrom,
      dateTo: this.ItemFormGroup.value.DateTo,
      brand: this.ItemFormGroup.value.Brand,
      location: this.ItemFormGroup.value.Location,
      job: this.ItemFormGroup.value.Job,
      detailsType: this.ItemFormGroup.value.DetailsType,
      dateType: this.ItemFormGroup.value.DateType,
    };
    this.stockApi.getFilteredStockLedgerRpt(this.payload).subscribe(
      (data) => {
        this.response = data;
        this.dataset = this.response.Stock_Register;
        this.gridHeader = 'Showing Filtered Data';
      },
      (error) => {}
    );
  }
  getAllLocations() {
    this.masterApi.GetAllLocation().subscribe((data) => {
      this.locationList = data;
    });
    this.showLocationList = true;
  }
  getAllJobs() {
    this.masterApi.GetAllJob().subscribe((data) => {
      this.jobList = data;
    });
    this.showJobList = true;
  }
  // Not clear
  getAllBrands() {
    this.masterApi.GetAllBrand().subscribe((data) => {
      this.brandList = data;
    });
    this.showBrandList = true;
  }
  getDetailsByItem(item_Id: any) {
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      new: false,
      delete: false,
      list: false,
    };
    this.payload = {
      ItemMasterItemId: Number(item_Id),
      itemName: this.ItemFormGroup.value.ItemName,
      dateFrom: this.ItemFormGroup.value.DateFrom,
      dateTo: this.ItemFormGroup.value.DateTo,
      brand: this.ItemFormGroup.value.Brand,
      location: this.ItemFormGroup.value.Location,
      job: this.ItemFormGroup.value.Job,
      detailsType: this.ItemFormGroup.value.DetailsType,
      dateType: this.ItemFormGroup.value.DateType,
    };
    let itemDetails: any;
    this.stockApi.getDetailsByItem(this.payload).subscribe(
      (data) => {
        this.showItemList = false;
        this.response = data;
        this.dataset = data;
        localStorage.setItem('itemList', JSON.stringify(data));
        this.router.navigateByUrl('/storewarehouse/stockmovementreport');
      },
      (error) => {}
    );
  }
  selectItem(item: any) {
    this.selectedItem = item;
    this.ItemFormGroup.controls['ItemGroup'].setValue(item.itemMasterItemID);
    this.ItemFormGroup.controls['ItemName'].setValue(item.itemMasterItemName);
    this.showItemList = false;
  }

  selectedBrand: any;
  selectBrand(item: any) {
    this.showBrandList = false;
    this.ItemFormGroup.controls['Brand'].setValue(item.vendorMasterVendorName);
  }

  onCancel() {
    this.dataset = [];
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: true,
      new: true,
      delete: true,
      list: false,
    };
  }
  saveStockLedgerReport() {
    this.displayMaximizable = true;
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to save Receipt?',
      accept: () => {
        this.userTrackingLog('Insert');
        this.messageService.add({
          severity: 'success',
          summary: 'Alert',
          detail: 'Stock Ledger Report Saved Succesfully',
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Report Not Saved!',
        });
      },
    });
  }
  initializeControls() {
    this.stockLedgerReport = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [20, 35, 15, 20, 20, 20, 20, 20, 18, 20, 20],
      minRows: 3,
      width: '100%',
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      afterOnCellMouseDown: (event, coords, TD) => {
        if (this.moveToStockMovement) {
          this.getDetailsByItem(TD.innerText);
        }
        this.moveToStockMovement = true;
        setTimeout(() => {
          this.moveToStockMovement = false;
        }, 1000);
      },
      data: [],
      //minSpareRows: 1,
      allowInsertRow: true,
      // allowInsertColumn: false,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
      columns: [
        {
          data: 'item_Id',
          type: 'text',
        },
        {
          data: 'item_Name',
          type: 'text',
        },
        {
          data: 'stock_Register_Unit_ID',
          type: 'text',
        },
        {
          data: 'openQty',
          type: 'text',
        },
        {
          data: 'openQtyAmount',
          type: 'text',
        },
        {
          data: 'stockIn',
          type: 'text',
        },
        {
          data: 'stockInAmount',
          type: 'text',
        },
        {
          data: 'stockOut',
          type: 'text',
        },
        {
          data: 'stockOutAmount',
          type: 'text',
        },
        {
          data: 'totalBal',
          type: 'text',
        },
        {
          data: 'totalBalAmount',
          type: 'text',
        },
      ],
      nestedHeaders: [
        [
          { label: this.translate.instant('Item Id') },
          { label: this.translate.instant('Item Name') },
          { label: this.translate.instant('Unit') },
          { label: this.translate.instant('Open Qty'), colspan: 2 },
          { label: this.translate.instant('Open Amt'), colspan: 2 },
          { label: this.translate.instant('Sin Qty'), colspan: 2 },
          { label: this.translate.instant('Sin Amt'), colspan: 2 },
          { label: this.translate.instant('Sout Qty'), colspan: 2 },
          { label: this.translate.instant('Sout Amt'), colspan: 2 },
          { label: this.translate.instant('Balance Qty'), colspan: 2 },
          { label: this.translate.instant('Balance Amt'), colspan: 2 },
        ],
        [
          this.translate.instant('Quantity'),
          this.translate.instant('Amount'),
          this.translate.instant('Quantity'),
          this.translate.instant('Amount'),
          this.translate.instant('Quantity'),
          this.translate.instant('Amount'),
          this.translate.instant('Quantity'),
          this.translate.instant('Amount'),
          this.translate.instant('Quantity'),
          this.translate.instant('Amount'),
          this.translate.instant('Quantity'),
          this.translate.instant('Amount'),
          this.translate.instant('Quantity'),
          this.translate.instant('Amount'),
        ],
      ],

      // colHeaders: [

      //   this.translate.instant('Item Name'),
      //   this.translate.instant('Unit'),

      //   this.translate.instant('Open Qty'),

      //   this.translate.instant('Open Amt'),
      //   this.translate.instant('Sin Qty'),
      //   this.translate.instant('Sin Amt'),
      //   this.translate.instant('Sout Qty'),
      //   this.translate.instant('Sout Amt'),
      //   this.translate.instant('Balance Qty'),
      //   this.translate.instant('Balance Amt'),
      // ],
    };

    this.stockLedgerReport.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.stockLedgerReport.afterRemoveRow = (index: number, amount: number) => {
      this.ColumnSum();
    };

    // this.stockLedgerReport.afterValidate = (isValid, value, row, prop) => {
    //   if (!isValid) {
    //     this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Invalid entry' });
    //   }

    // };
  }

  displayPrintPreview: boolean = false;
  displayPrint() {
    this.displayPrintPreview = true;
    this.getCompanyDetails();
    this.calculateTotal();
  }

  companyDetailsArray: Array<StationMaster> = [];
  companyDetails: StationMaster = {};
  getCompanyDetails() {
    this.masterApi.getCompanyDetails().subscribe((response: any) => {
      this.companyDetailsArray = response;
      this.companyDetails = this.companyDetailsArray[0];
    });
  }
  printAsPDF() {
    let htmlDesign: any = document.getElementById('printPDF');
    this.fileSaverService.saveAsPDF(
      htmlDesign,
      'Stock_Ledger_Report_' + String(this.datedTo)
    );
  }

  userTrackingLog(type) {
    let req = {
      page: 'StockLedgerReport',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.ItemFormGroup.get('').value,
      vpType: 'StockLedgerReport',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  totalOpenQty: number = 0;
  totalOpenValue: number = 0;
  totalRcvdQty: number = 0;
  totalRcvdValue: number = 0;
  totalIssuedQty: number = 0;
  totalIssuedValue: number = 0;
  totalClosedQty: number = 0;
  totalClosedValue: number = 0;
  totalBalance: number = 0;
  calculateTotal() {
    this.dataset?.forEach((element) => {
      this.totalOpenQty += element.openQty;
      this.totalOpenValue += element.openQtyAmount;
      this.totalRcvdQty += element.stockIn;
      this.totalRcvdValue += element.stockInAmount;
      this.totalIssuedQty += element.stockOut;
      this.totalIssuedValue += element.stockOutAmount;
      this.totalClosedQty = this.totalOpenQty - this.totalIssuedQty;
      this.totalClosedValue += this.totalOpenValue - this.totalIssuedValue;
      this.totalBalance += element.totalBal;
    });
  }

  ColumnSum() {
    // if (this.stockLedgerReport.data.length > 0) {
    //   const sum1 = this.stockLedgerReport.data?.filter(item => item.hasOwnProperty('credit'))
    //     .reduce((sum, current) => sum + current.credit, 0);
    //   this.stockLedgerFormGroup.controls.ReceiptVoucherMasterDrAmount.setValue(sum1);
    // }
  }
  get f() {
    return this.ItemFormGroup.controls;
  }
}
interface item {
  Item_Master_Item_ID: string;
  Item_Master_Item_Name: string;
}
