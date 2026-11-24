import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  ViewChildren,
  QueryList,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { PurchaseVoucher } from 'src/app/routes/domain/PurchaseVoucher';
import {
  ChartofAccounts,
  CurrencyMaster,
  ItemMaster,
} from 'src/app/routes/domain';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { ProcurementService } from 'src/app/routes/service/procurement/procurement.service';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { timer } from 'rxjs';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { LoginService } from 'src/app/routes/service/login.service';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { DecimalConfigService } from 'src/app/routes/service/decimal-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-grn',
  templateUrl: './grn.component.html',
  styleUrls: ['./grn.component.scss'],
  providers: [DatePipe],
})
export class GRNComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('suppCtrl', { static: false }) supplierCtrol: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;
  @ViewChildren('autoInput') autoInputs!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  lookupGridColumns = [];
  dataList: Array<any> = [];
  showProcurementsLookUp: boolean = false;
  formControlLookUp: boolean = false;
  btnFlag: ButtonFlag = {
    edit: false,
    cancel: false,
    save: true,
    update: false,
    delete: false,
  };
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;
  isCallDDLs: boolean = false;
  //btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;
  SupplierMasterArrayById: SuppliersMaster = null;

  showSalesLookUp: boolean = false;
  showUnitLookUp: boolean = false;
  ItemMasterArrayByName: any = null;
  funitid: number;

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  jobArray: any;
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];
  user: any;
  accountTransactionList: AccountsTransactions[] = [];
  purchaseVoucherarry: Array<PurchaseVoucher> = [];
  savedPurchaseVoucher: PurchaseVoucher;
  pagedRequest: PagedRequest;
  brandArry: VendorMaster[] = [];

  v_typeList: SelectItem[];
  PurchaseAccount: SelectItem[] = [];
  v_RoundoffList: SelectItem[];
  GridDataList: any[] = [];
  displayPOList: boolean = false;
  displayMaximizableItems: boolean = false;
  displayMaximizableUnits: boolean = false;
  purchaseOrderList: Array<any> = [];
  supplierCols: Array<any> = [];
  unitCols: Array<any> = [];
  itemCols: Array<any> = [];
  displayMaximizable2: boolean = false;
  poListCols: Array<any> = [
    { field: '', header: '::' },
    { field: 'purchaseVoucherVoucherNo', header: 'PO No' },
    { field: 'purchaseVoucherVoucherNo', header: 'Date' },
    { field: 'purchaseVoucherVoucherNo', header: 'Supplier' },
    { field: 'purchaseVoucherVoucherNo', header: 'PO Qty' },
    { field: 'purchaseVoucherVoucherNo', header: 'Delivery Qty' },
    { field: 'purchaseVoucherVoucherNo', header: 'Material' },
    { field: 'purchaseVoucherVoucherNo', header: 'Rate' },
    { field: 'purchaseVoucherVoucherNo', header: 'Balance' },
    { field: 'purchaseVoucherVoucherNo', header: 'Issue Qty' },
    { field: 'purchaseVoucherVoucherNo', header: 'Actions' },
  ];
  userTrackingList: any;
  PODataList: any[];
  isSelect: boolean = false;
  JOBCOST: Boolean = false;
  units: any[];
  unitListt: any;
  ScreenId: number;
  Permission: any;
  POForGRNList: any[] = [];
  selectedSupplierId: any;
  loadList: any;
  filterArray: any;
  companyDetails: StationMaster;
  filterPOlist: any[] = [];
  originalPODataList: any[];
  VatAccount: any;
  stockAccount: any;
  cashAccount: any;
  RoundOffAccount: any;
  userId: number;
  VatCalculation: boolean = false;
  currentRow: number;
  lastexportArray: any[] = [];
  jobDirectPurchase: boolean = false;
  pdfSource: string;
  vatvalue: number;
  defaultLocationID = -1;
  locationLocked = false;
  isServerSearch = false;
  browseBTN: boolean = false;

  selectedItem?: ItemMaster = null;
  selectedUnit?: ItemMaster = null;
  savedGRNList = new Array();
  gridDataArray: Array<GridData>;
  gridIterator: number = 0;
  GRNListing: any;
  SalesVoucherGRN: any;
  displayPreview: boolean = false;
  itemList = [];
  clickedRowColumn = { row: -1, column: -1 };

  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];
  selectedSalesVoucherGRN = [];
  selectedVoucher = -1;
  decimals: number;
  browseSalesVoucherInGRN: boolean = false;

  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.v_typeList = [
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
    ];
    this.PurchaseAccount = [
      { label: 'Cash Purchase', value: 'CashPurchase' },
      { label: 'Purchase Account', value: 'PurchaseAccount' },
      { label: 'Registered Purchases', value: 'RegisteredPurchases' },
      { label: 'Un-Registered Purchases', value: 'UnRegisteredPurchases' },
      { label: 'Import Purchase', value: 'ImportPurchase' },
    ];
    this.v_RoundoffList = [
      { label: '+', value: '+' },
      { label: '-', value: '-' },
    ];
  }

  rptFilter: ReportFilterModel;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,  
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private stockApi: StockApiService,
    private Procurementapi: ProcurementService,
    private accountapi: AccountApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private loginser: LoginService,
    private datePipe: DatePipe,
    private storage: LocalStorageService,
    public salesapi: SalesApiService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private decimalConfig: DecimalConfigService,

    private crystalReportService: CrystalReportService,
    private permission: PermissionsService,
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.defaultLocationID = this.utilityService.getLockedLocationId();
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'purchasevoucher_HotEntry';
  purchasevoucher_entry: Handsontable.GridSettings;

  purchasevoucher_entryDataset = [];
  purchaseVoucherFormGroup: FormGroup;
  purchaseVoucherFilterForm: FormGroup;
  salesVoucherFilterForm: FormGroup;
  PoFilterForm: FormGroup;
  cols: any;
  salesVoucherCols: any;

  ngAfterViewInit() {
    this.autoInputs.forEach((input) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            input.nativeElement.focus();
          }
        });
      });
      observer.observe(input.nativeElement);
    });
  }

  ngOnInit(): void {
    this.decimals = this.decimalConfig.getDecimal() ?? 2;

    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
      var rights = this.permission.getById(this.ScreenId);
      this.companyDetails = this.permission.getStation();
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
    this.activeRow = { row: 0, column: 0 };
    this.userId = this.loginser.GetCredentialData().userId;
    this.FILL_COMBO();
    this.getReportType();
    this.cols = [
      { field: 'purchaseVoucherGRNNo', header: 'GRN No' },

      { field: 'purchaseVoucherVoucherNo', header: 'Voucher No' },
      { field: 'purchaseVoucherPurchaseDate', header: 'Date' },
      { field: 'jobname', header: 'Job' },
      { field: 'suppliername', header: 'Supplier' },

      // { field: 'purchaseVoucherTotalGrossAmt', header: 'Gross.Amt' },
      // { field: 'purchaseVoucherTotalDisAmount', header: 'Disc.Amt' },
      // { field: 'purchaseVoucherVatAmount', header: 'Disc.%' },
      { field: 'purchaseVoucherVatRoundSign', header: 'Net.Amt' },
      { field: 'actions', header: 'Actions' },
    ];
    this.supplierCols = [
      { field: 'suppliersMasterSupplierId', header: 'Supplier Code' },
      { field: 'suppliersMasterSupplierName', header: 'Supplier Name' },
    ];
    this.itemCols = [
      { field: 'itemMasterItemId', header: 'Item Code' },
      { field: 'itemMasterItemName', header: 'Item Name' },
    ];
    this.unitCols = [
      { field: 'unitMasterUnitId', header: 'Unit Code' },
      { field: 'unitMasterUnitFullName', header: 'Unit Full Name' },
    ];
    this.salesVoucherCols = [
      { field: 'voucherNo', header: 'SV. No' },
      { field: 'voucherDate', header: 'Date' },
      // { field: 'unit', header: 'Unit' },
      { field: 'customerName', header: 'Customer Name' },
      // { field: 'itemName', header: 'Item Name' },
      // { field: 'quantity', header: 'Qty' },
      { field: 'locationName', header: 'Location' },
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
    this.initializeControls();
    this.purchaseVoucherFormGroup = this.fb.group({
      purchaseVoucherPurId: [0],
      purchaseVoucherVoucherNo: [{ value: '', disabled: false }],
      purchaseVoucherPurchaseDate: [
        { value: null, disabled: false },
        [Validators.required],
      ],
      purchaseVoucherPurchaseRef: [{ value: '', disabled: true }],
      purchaseVoucherSupplyInvoiceNo: [{ value: '', disabled: true }],
      purchaseVoucherCurrencyId: [-1],
      purchaseVoucherExcludeVat: [{ value: false, disabled: true }],

      purchaseVoucherPurchaseType: [null],
      purchaseVoucherPartyId: [-1, [DropDownValidator]],
      purchaseVoucherPartyName: [{ value: '', disabled: true }],
      purchaseVoucherPartyAddress: [{ value: '', disabled: true }],
      purchaseVoucherPartyVatNo: [{ value: '', disabled: true }],
      purchaseVoucherDescription: [{ value: '', disabled: true }],
      purchaseVoucherGrNo: [{ value: null, disabled: true }],
      purchaseVoucherGrDate: [{ value: null, disabled: true }],
      purchaseVoucherLpoNo: [{ value: null, disabled: true }],
      purchaseVoucherLpoDate: [{ value: null, disabled: true }],
      purchaseVoucherQuatationNo: [{ value: null, disabled: true }],
      purchaseVoucherQuatationDate: [{ value: null, disabled: true }],
      purchaseVoucherPoNo: [{ value: null, disabled: true }],
      purchaseVoucherBatchCode: [{ value: null, disabled: true }],
      purchaseVoucherDayBookNo: [{ value: null, disabled: true }],
      purchaseVoucherJobId: [-1],
      purchaseVoucherLocationId: [-1, [DropDownValidator]],
      purchaseVoucherTotalGrossAmt: [{ value: [0], disabled: true }],
      purchaseVoucherTotalItemDisAmount: [{ value: [0], disabled: true }],
      purchaseVoucherDiscountPercentage: [{ value: [0], disabled: true }],
      purchaseVoucherTotalDiscountAmt: [{ value: [0], disabled: true }],
      purchaseVoucherVatPercentage: [{ value: [5], disabled: true }],
      purchaseVoucherVatAmount: [{ value: [0], disabled: true }],
      purchaseVoucherActualAmount: [{ value: [0], disabled: true }],
      purchaseVoucherVatRoundSign: [{ value: '-', disabled: true }],
      purchaseVoucherVatRoundAmount: [{ value: [0], disabled: true }],
      purchaseVoucherNetAmount: [{ value: [0], disabled: true }],
      purchaseVoucherSupplier: [
        { value: '', disabled: false },
        [Validators.required],
      ],
      PurchaseVoucherJobDirectPurchase: [{ value: null, disabled: false }],
      isDate: [{ value: false, disabled: false }],
      fromDate: [{ value: null, disabled: true }],
      toDate: [{ value: null, disabled: true }],
    });
    this.purchaseVoucherFilterForm = this.fb.group({
      isDate: [],
      purchaseVoucherNo: [null],
      purchaseGRNNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.PoFilterForm = this.fb.group({
      isPoDate: [],
      PONo: [null],
      PofromDate: [new Date()],
      PotoDate: [new Date()],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.salesVoucherFilterForm = this.fb.group({
      isDate: [{ value: false, disabled: false }],
      salesVoucherCustomer: [null],
      salesVoucherLocation: [null],
      fromDate: [{ value: new Date(), disabled: true }],
      toDate: [{ value: new Date(), disabled: true }],
    });
    this.bykeys();
    this.LoadLocationDDL();
  }

  BrowsSalesForm() {
    let filter = '';
    let customerValue =
      this.salesVoucherFilterForm.controls.salesVoucherCustomer.value;
    let locationValue =
      this.salesVoucherFilterForm.controls.salesVoucherLocation.value;

    if (
      (customerValue !== null &&
        customerValue !== undefined &&
        customerValue >= 0) ||
      (locationValue !== null &&
        locationValue !== undefined &&
        locationValue >= 0)
    ) {
      const conditions: string[] = [];

      if (
        customerValue !== null &&
        customerValue !== undefined &&
        customerValue >= 0
      ) {
        conditions.push(`cm.Customer_Master_Customer_No = ${customerValue}`);
      }

      if (
        locationValue !== null &&
        locationValue !== undefined &&
        locationValue >= 0
      ) {
        conditions.push(`lm.Location_Master_Location_ID = ${locationValue}`);
      }

      if (conditions.length > 0) {
        filter = `and ${conditions.join(' and ')}`;
      }
    }

    // filter will be empty string if both values are empty/null/undefined/negative
    if (this.CustomerMasterArray && this.CustomerMasterArray?.length <= 0)
      this.LoadCustomerDDL();
    if (this.locationArry && this.locationArry?.length <= 0)
      this.LoadLocationDDL();
    const fromDate = this.salesVoucherFilterForm.controls.fromDate.value;

    const toDate = this.salesVoucherFilterForm.controls.toDate.value;

    const params = {
      filter,
      isDate: this.salesVoucherFilterForm.value.isDate,
      fromDate: fromDate,
      toDate: toDate,
    };

    this.salesapi.GetSalesVoucherForGRN(params).subscribe(
      (data) => {
        this.displayMaximizable2 = true;
        this.SalesVoucherGRN = data.result;
        console.log('this.SalesVoucherGRN = ', this.SalesVoucherGRN);
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed to load data'),
        });
      },
    );
  }

  exportSalesVoucherGRN(id: any) {
    this.resetBrowsSalesForm();
    this.displayMaximizable2 = false;
    this.salesapi.GetSalesVoucherById(id).subscribe((data) => {
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      const changes: any[] = [];

      data.result.forEach((k) => {
        const r = this.activeRow.row;

        changes.push([r, 0, k?.itemId ?? '']);
        changes.push([r, 2, k?.itemName ?? '']);
        changes.push([r, 3, k?.unitName ?? '']);
        changes.push([r, 4, k?.quantity ?? 0]);
        changes.push([r, 5, k?.rate ?? 0]);
        changes.push([r, 6, k?.quantity * k?.rate]);
        changes.push([r, 8, k?.quantity * k?.rate]);
        changes.push([r, 18, k?.id]);
        this.activeRow.row += 1;
      });

      // apply all cell updates in one go
      if (changes.length) {
        hotInstance.suspendRender();
        hotInstance.setDataAtCell(changes);
        hotInstance.resumeRender();
      }

      // recalc only once
      this.ColumnSum();
    });
    this.selectedVoucher = -1;
    this.selectedSalesVoucherGRN = [];
  }

  zerovat() {
    if (this.f.purchaseVoucherExcludeVat.value) {
      this.purchaseVoucherFormGroup.controls.purchaseVoucherVatPercentage.setValue(
        0,
      );
      this.GetTotal();
    } else {
      this.purchaseVoucherFormGroup.controls.purchaseVoucherVatPercentage.setValue(
        this.vatvalue,
      );
      this.GetTotal();
    }
  }

  get f() {
    return this.purchaseVoucherFormGroup.controls;
  }

  eventdetails: any;
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
  bykeys() {
    this.utilityService
      .getProgramSettings(
        'Hide_Job_Detail,Hide_CostCenter_Detail,Browse_Sales_Voucher_IN_GRN',
      )
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail',
        );
        const costCenterSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail',
        );
        const browseSalesVoucherSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Browse_Sales_Voucher_IN_GRN',
        );
        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;
        this.browseSalesVoucherInGRN =
          browseSalesVoucherSetting?.programSettingsBoolValue ?? false;
        setTimeout(() => {
          this.updateTableConfiguration();
        }, 1000);
      });
  }
  updateTableConfiguration() {
    const hiddenColumns = [6, 7, 9, 11, 10, 12, 15, 16, 17, 18];
    // if (this.JOBCOST) {
    //   hiddenColumns.push(3);
    // }
    if (this.hideJobDetail) {
      hiddenColumns.push(13);
    }
    if (this.hideCostCenterDetail) {
      hiddenColumns.push(14);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }
  get costSetLookup() {
    return this.costcenterArray?.map((kl) => ({
      cost: kl.costCenterMasterCostCenterName,
      costId: kl.costCenterMasterCostCenterId,
    }));
  }
  initializeControls() {
    this.GetProgramSettingbyKey();

    const hiddenColumns = [6, 7, 9, 11, 10, 12, 13, 14, 15, 16, 17, 18];
    this.purchasevoucher_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns,
    );

    this.purchasevoucher_entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel,
    ) => {
      this.clickedRowColumn = { row, column };
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      if (this.utilityService.isRowDisabled(row, hotInstance)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Notice',
          detail: 'Please fill the previous row first',
        });
        return;
      }

      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      this.currentRow = row;

      if (column === 0 && this.purchasevoucher_entry.readOnly === false) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item Name', 'Item ID'];
        hotInstance.deselectCell();
        this.onSearch('');
        this.dataList = this.itemSetLookup;
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 3 &&
        this.purchasevoucher_entry.readOnly === false
      ) {
        this.isServerSearch = false;
        var data = hotInstance.getDataAtRow(row);
        this.dataList = [];
        this.getUnitByItemId(data[0]);
        hotInstance.deselectCell();
        this.showUnitLookUp = true;
        this.lookupGridColumns = ['Unit', 'Unit ID'];

        this.activeRow = { row, column };
      } else {
        this.showProcurementsLookUp = false;
        this.activeRow = { row, column };
      }

      if (column === 13 && this.purchasevoucher_entry.readOnly === false) {
        this.isServerSearch = false;
        this.lookupGridColumns = ['Job', 'Job ID'];
        hotInstance.deselectCell();
        this.dataList = this.jobSetLookup;
        this.showSalesLookUp = true;

        this.activeRow = { row, column };
      } else if (column === 14) {
        this.lookupGridColumns = ['Cost Center', 'Cost Center ID'];
        this.dataList = this.costSetLookup;
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      }

      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.procurements == x);
      } else {
        this.selectItem = {};
      }
    };

    this.purchasevoucher_entry.beforeChange = (
      change: Handsontable.CellChange[],
    ) => {
      // setting if prevent scrolling after selection
      this.showProcurementsLookUp = false;
      this.enforcePOQtyLimit(change);
      if (change[0][1] === 0) {
        this.showProcurementsLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.purchasevoucher_entry.beforeChangeRender = (
      changes: any[],
      source: string,
    ) => {
      if (source === 'edit') {
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);

        // Get hidden columns safely
        const settings = hotInstance.getSettings();
        const hiddenColumns = (settings as any).hiddenColumns?.columns || [];

        changes.forEach(([row, prop, oldValue, newValue]) => {
          try {
            // Get row data with proper typing
            const rowData: GridRowData = {
              ...hotInstance.getSourceDataAtRow(row),
            };

            // Skip if qty or rate are missing
            if (
              rowData.qty == null ||
              rowData.rate == null ||
              prop === 'netAmt'
            ) {
              return;
            }

            // Calculate values with proper type safety
            const qty = Number(rowData.qty) || 0;
            const rate = Number(rowData.rate) || 0;
            const discPercent = Number(rowData.disc) || 0;

            const grossAmt = qty * rate;
            const discAmt = discPercent * qty || 0;
            const netBeforeVat = grossAmt - discAmt;
            const vatAmt = this.VatCalculation
              ? netBeforeVat * (this.vatvalue / 100)
              : 0;
            const netAmt = netBeforeVat + vatAmt;

            // Update row data
            const updatedRow: GridRowData = {
              ...rowData,
              grossAmt: parseFloat(grossAmt.toFixed(this.decimals)),
              disc: parseFloat(discAmt.toFixed(this.decimals)),
              netAmt: parseFloat(netAmt.toFixed(this.decimals)),
              vatAmt: parseFloat(vatAmt.toFixed(this.decimals)),
            };

            // Update dataset
            this.purchasevoucher_entryDataset =
              this.purchasevoucher_entryDataset.map((item, index) =>
                index === row ? updatedRow : item,
              );

            // Update visible cells
            Object.keys(updatedRow).forEach((key) => {
              if (!hiddenColumns.includes(this.getColumnIndexByProp(key))) {
                hotInstance.setDataAtRowProp(row, key, updatedRow[key]);
              }
            });
          } catch (error) {
            console.error('Error processing cell change:', error);
          }
        });
      }
      this.ColumnSum();
    };

    // Helper function to get column index by property name

    this.purchasevoucher_entry.afterChange = (changes, source) => {
      if (changes) {
        // Get the current data from Handsontable
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        this.purchasevoucher_entryDataset = hotInstance.getSourceData();
      }
    };
    this.purchasevoucher_entry.afterRemoveRow = (
      index: number,
      amount: number,
    ) => {
      this.itemList.splice(index, 1);
      this.ColumnSum();
      this.GetTotal();
    };

    this.purchasevoucher_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  private poMaxQtyByPodId: { [podId: string]: number } = {};

  private enforcePOQtyLimit(change: Handsontable.CellChange[]) {
    const hot = this.hotRegisterer.getInstance(this.hotid);
    (change || []).forEach((c: any) => {
      const [row, prop, oldValue, newValue] = c;
      if (prop !== 'qty' && prop !== 4) return;
      const podId = hot?.getDataAtRowProp(row, 'podId');
      const max = podId != null ? this.poMaxQtyByPodId[podId] : undefined;
      if (max == null || isNaN(max)) return;
      if (Number(newValue) > max) {
        c[3] = oldValue;
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid Quantity',
          detail: `Quantity cannot exceed the PO quantity of ${max}.`,
        });
      }
    });
  }

  getColumnIndexByProp(prop: string): number {
    try {
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      const columns = hotInstance.getSettings().columns;

      if (Array.isArray(columns)) {
        return columns?.findIndex((col: any) => col?.data === prop);
      }
      return -1;
    } catch (error) {
      console.error('Error finding column index:', error);
      return -1;
    }
  }
  onSelectionChange(event: any) {
    if (
      this.purchaseVoucherFormGroup.controls.salesVoucherType.value === 'CREDIT'
    ) {
      const selectedCustomer = this.CustomerMasterArray?.find(
        (o) => o.customerMasterCustomerNo === event.value,
      );

      if (
        !selectedCustomer ||
        !selectedCustomer.customerMasterCustomerReffAcNo
      ) {
        this.purchaseVoucherFormGroup.controls.salesVoucherPartyId.setValue(-1);

        this.messageService.add({
          severity: 'warn',
          summary: 'Alert',
          detail: `Selected Customer didn't have an Account No.`,
        });
        return;
      }
    }
    const custDetails = this.CustomerMasterArray?.find(
      (j) => j.customerMasterCustomerNo === event.value,
    );
    this.purchaseVoucherFormGroup.controls.salesVoucherPartyVatNo.setValue(
      custDetails.customerMasterCustomerVatNo,
    );
    this.purchaseVoucherFormGroup.controls.salesVoucherContPerson.setValue(
      custDetails.customerMasterCustomerContactPerson,
    );
  }

  LoadCustomerDDL() {
    this.accountapi.LoadCustomerDropdown().subscribe((m: any) => {
      this.CustomerMasterArray = m.resultSet.customerMasters;
      this.CustomerMasterList = m.resultSet.customerMasters?.map((kl: any) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
              ' -- ' +
              kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({
        label: '--Select Customer--',
        value: -1,
      });
    });
  }

  openSupplier() {
    this.control = this.f.purchaseVoucherPartyId;
    this.elementReference = this.supplierCtrol;
    this.lookupGridColumns = ['Supplier', 'Supplier ID'];
    this.formControlLookUp = true;
    this.selectItem = {
      procurements: this.supplierCtrol.nativeElement.value,
      procurementsId: this.f.purchaseVoucherPartyId.value,
    };
    this.dataList = this.supplierLookup;
  }

  GetProgramSettingbyKey() {
    this.utilityService
      .GetProgramSettingbyKey('CREATE_ISSUEVOUCHER_AGAINST_GRN')
      .subscribe((res: any) => {
        this.jobDirectPurchase = res.result[0].programSettingsBoolValue;
      });
  }

  LoadLocationDDL() {
    this.utilityService.LoadDropdownLocationMaster().subscribe((r: any) => {
      const list = r?.resultSet?.locationMaster ?? [];
      this.loadList = r?.resultSet;
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({
        label: '--Select Location--',
        value: -1,
      });
      this.locationArry = list.map((ar: any) =>
        ar.locationMasterLocationName?.trim(),
      );
      this.locationLocked = this.utilityService.applyLocationLock(
        this.purchaseVoucherFormGroup,
        'purchaseVoucherLocationId',
      );
    });
  }

  LoadCurrancyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.currencyMasters) {
        this.currencyArray = this.loadList.currencyMasters;
        this.currencyList = this.loadList.currencyMasters.map((kl: any) => ({
          label: kl.currencyMasterCurrencyName,
          value: kl.currencyMasterCurrencyId,
        }));
        this.currencyList.unshift({
          label: '--Select Currency--',
          value: -1,
        });
        this.currArry = this.loadList.currencyMasters.map((ar: any) =>
          ar.currencyMasterCurrencyName?.trim(),
        );
      }
    });
  }

  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.jobMasters) {
        this.jobArray = this.loadList.jobMasters;
        this.jobList = this.loadList.jobMasters.map((kl) => ({
          label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
          value: kl.jobMasterJobId,
        }));
        this.jobList.unshift({ label: '--Select Job--', value: -1 });
        this.jobArry = this.loadList.jobMasters.map((ar) =>
          ar.jobMasterJobName?.trim(),
        );
      }
    });
  }
  onSearch(term: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi
      .LoadFilteredItemMaster(this.pagedRequest)
      .subscribe((m: any) => {
        this.ItemMasterArray = m.resultSet.itemMaster;
        this.ItemMasterList = m.resultSet.itemMaster?.map((kl: any) => ({
          sales: kl?.itemMasterItemName,
          salesId: kl?.itemMasterItemId,
          barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
          size: kl?.itemMasterItemSize,
          brand: this.brandArry?.find(
            (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId,
          )?.vendorMasterVendorName,
        }));
        this.dataList = this.itemSetLookup;
      });
  }
  LoadItemDDL() {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: '',
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi
      .LoadFilteredItemMaster(this.pagedRequest)
      .subscribe((m: any) => {
        this.ItemMasterArray = m.resultSet.itemMaster;
        this.ItemMasterList = m.resultSet.itemMaster?.map((kl: any) => ({
          label: kl?.itemMasterItemName,
          value: kl?.itemMasterItemId,
        }));
      });
  }

  LoadSupplierDDL() {
    this.utilityService.LoadDropdownSuppliersMaster().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.suppliersMaster) {
        this.SupplierMasterArray = this.loadList.suppliersMaster;

        this.SupplierMasterList = this.loadList.suppliersMaster.map(
          (kl: any) => ({
            label: kl.suppliersMasterSupplierName,
            value: kl.suppliersMasterSupplierId,
          }),
        );
        this.SupplierMasterList.unshift({
          label: '--Select Supplier--',
          value: -1,
        });
        this.SupplierMasterArry = this.loadList.suppliersMaster.map(
          (ar) =>
            ar.suppliersMasterSupplierName?.trim() +
            '|' +
            ar.suppliersMasterSupplierId,
        );
      }
    });
  }

  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.unitMasters) {
        this.units = this.loadList.unitMasters;
        this.unitList = this.loadList.unitMasters;
        this.unitListt = this.loadList.unitMasters.map((kl) => ({
          label: kl?.unitMasterUnitShortName,
          value: kl.unitMasterUnitId,
        }));
        this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
        this.unitArry = this.loadList.unitMasters.map((ar) =>
          ar?.unitMasterUnitShortName?.trim(),
        );
      }
    });
  }

  LoadAccountSettingDDL() {
    this.utilityService.LoadDropdownaccountsSettings().subscribe((r: any) => {
      this.loadList = r.resultSet;
      var res = this.loadList.accountsSettings;
      const splitText1 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Vat Input',
      )?.accountSettingsAccountTextValue;
      const parts1 = splitText1.split('::');
      this.VatAccount = parts1[1]?.trim();

      const splitText2 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Stock Account',
      )?.accountSettingsAccountTextValue;
      const parts2 = splitText2.split('::');
      this.stockAccount = parts2[1]?.trim();
      const splitText12 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Cash Account',
      )?.accountSettingsAccountTextValue;
      const parts12 = splitText12.split('::');
      this.cashAccount = parts12[1]?.trim();

      const splitText5 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Round Off',
      )?.accountSettingsAccountTextValue;
      const parts5 = splitText5.split('::');
      this.RoundOffAccount = parts5[1]?.trim();
    });
  }

  GetTotal($event = null) {
    const formValues = this.purchaseVoucherFormGroup.value;
    const grossAmount = Number(formValues.purchaseVoucherTotalGrossAmt);
    const discountAmount = Number(formValues.purchaseVoucherTotalDiscountAmt);
    const vatPercentage = formValues.purchaseVoucherVatPercentage;

    formValues.purchaseVoucherVatPercentage = vatPercentage;

    const actualAmount = grossAmount - discountAmount;
    this.purchaseVoucherFormGroup.controls.purchaseVoucherActualAmount.setValue(
      actualAmount.toFixed(this.decimals),
    );

    const vatAmount = this.VatCalculation
      ? (actualAmount * vatPercentage) / 100
      : 0;
    this.purchaseVoucherFormGroup.controls.purchaseVoucherVatAmount.setValue(
      vatAmount.toFixed(this.decimals),
    );

    const roundSign = formValues.purchaseVoucherVatRoundSign || '-';
    const roundAmount = Number(formValues.purchaseVoucherVatRoundAmount);
    const totalItemDiscount = Number(
      formValues.purchaseVoucherTotalItemDisAmount,
    );

    let netAmount = actualAmount + vatAmount - totalItemDiscount;

    if (roundSign === '+') {
      netAmount += roundAmount;
    } else if (roundSign === '-') {
      netAmount -= roundAmount;
    } else {
      formValues.purchaseVoucherVatRoundSign = '-'; // Default to '-'
    }

    this.purchaseVoucherFormGroup.controls.purchaseVoucherNetAmount.setValue(
      netAmount.toFixed(this.decimals),
    );
  }

  // GetTotal($event = null) {
  //   if (this.purchaseVoucherFormGroup.value.purchaseVoucherExcludeVat == true) {
  //     this.purchaseVoucherFormGroup.value.purchaseVoucherVatPercentage = 0;
  //   } else {
  //     this.purchaseVoucherFormGroup.value.purchaseVoucherVatPercentage = 5;
  //   }
  //   if (this.VatCalculation == true) {
  //     this.purchaseVoucherFormGroup.controls.purchaseVoucherActualAmount.setValue(
  //       Number(
  //         this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt
  //       ).toFixed(this.decimals)
  //     );
  //     this.purchaseVoucherFormGroup.controls.purchaseVoucherVatAmount.setValue(
  //       (
  //         (Number(
  //           this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt
  //         ) *
  //           Number(this.purchaseVoucherFormGroup.value.purchaseVoucherVatPercentage)) /
  //         100
  //       ).toFixed(this.decimals)
  //     );

  //     if (this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundSign == '+') {
  //       this.purchaseVoucherFormGroup.controls.purchaseVoucherNetAmount.setValue(
  //         (
  //           Number(
  //             this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount
  //           ) +
  //           Number(this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount) -
  //           Number(
  //             this.purchaseVoucherFormGroup.value.purchaseVoucherTotalDiscountAmt
  //           ) +
  //           Number(this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundAmount)
  //         ).toFixed(this.decimals)
  //       );
  //     } else if (
  //       this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundSign == '-'
  //     ) {
  //       this.purchaseVoucherFormGroup.controls.purchaseVoucherNetAmount.setValue(
  //         (
  //           Number(
  //             this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount
  //           ) +
  //           Number(this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount) -
  //           Number(
  //             this.purchaseVoucherFormGroup.value.purchaseVoucherTotalDiscountAmt
  //           ) -
  //           Number(this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundAmount)
  //         ).toFixed(this.decimals)
  //       );
  //     } else {
  //       this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundSign = '-';
  //     }
  //   }
  //   this.purchaseVoucherFormGroup.controls.purchaseVoucherActualAmount.setValue(
  //     Number(this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt) -
  //     Number(
  //       this.purchaseVoucherFormGroup.value.purchaseVoucherTotalDiscountAmt
  //     )
  //   );

  //   // this.purchaseVoucherFormGroup.controls.purchaseVoucherVATAmount.setValue(
  //   //   (
  //   //     Number(this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount)
  //   //     *
  //   //     Number(this.purchaseVoucherFormGroup.value.purchaseVoucherVatPercentage)
  //   //   ) / 100);

  //   if (
  //     this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundSign == '+'
  //   ) {
  //     this.purchaseVoucherFormGroup.controls.purchaseVoucherNetAmount.setValue(
  //       (
  //         Number(
  //           this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount
  //         ) +
  //         Number(this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount) +
  //         Number(
  //           this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundAmount
  //         ) -
  //         Number(
  //           this.purchaseVoucherFormGroup.value
  //             .purchaseVoucherTotalItemDisAmount
  //         )
  //       ).toFixed(this.decimals)
  //     );
  //   } else if (
  //     this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundSign == '-'
  //   ) {
  //     this.purchaseVoucherFormGroup.controls.purchaseVoucherNetAmount.setValue(
  //       (
  //         Number(
  //           this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount
  //         ) +
  //         Number(this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount) -
  //         Number(
  //           this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundAmount
  //         ) -
  //         Number(
  //           this.purchaseVoucherFormGroup.value.purchaseVoucherTotalItemDisAmount
  //         )
  //       ).toFixed(this.decimals)
  //     );
  //   } else {
  //     this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundSign = '-';
  //   }
  // }

  currencyArray: Array<CurrencyMaster> = [];

  getAllSupplierMaster() {
    this.displaySupplierList = true;
  }

  public getAccountName(acctnumber: string): string {
    try {
      return this.accountArray?.find(
        (j) => j?.maAccNo?.trim() === acctnumber?.trim(),
      )?.maAccName;
    } catch (error) {}
  }

  get currencyLookup() {
    return this.currencyList.map((kl) => ({
      procurements: kl.label,
      procurementsId: kl.value,
    }));
  }

  get jobSetLookup() {
    return this.jobList.map((kl) => ({
      job: kl.label,
      jobId: kl.value,
    }));
  }

  get locationLookup() {
    return this.locationList.map((kl) => ({
      procurements: kl.label,
      procurementsId: kl.value,
    }));
  }

  get supplierLookup() {
    return this.SupplierMasterList.map((kl) => ({
      procurements: kl.label,
      procurementsId: kl.value,
    }));
  }
  get unitLookup() {
    return this.unitList.map((kl: any) => ({
      procurements: kl.unitMasterUnitShortName,
      procurementsId: kl.unitMasterUnitId,
    }));
  }
  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl.itemMasterItemName,
      procurementsId: kl?.itemMasterItemId,
      barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
      // size: kl?.itemMasterItemSize,
      // brand: this.brandArry?.find(
      //   (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
      // )?.vendorMasterVendorName,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      procurements: kl.unitMasterUnitShortName?.trim(),
      procurementsId: kl.unitMasterUnitId,
    }));
  }

  savePurchaseVoucher() {
    this.purchaseVoucherFormGroup.markAllAsTouched();

    for (const k of this.purchasevoucher_entryDataset || []) {
      if (k.itemId || (k.itemname && String(k.itemname).trim() !== '')) {
        let missing = [];
        if (!k.unit || String(k.unit).trim() === '') missing.push('Unit');
        if (k.qty == null || k.qty === '' || Number(k.qty) <= 0) missing.push('Qty');
        if (k.rate == null || k.rate === '' || Number(k.rate) <= 0) missing.push('Rate');
        
        if (missing.length > 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: `User missed ${missing.join(', ')} for item: ${k.itemname || k.itemId}`,
          });
          return;
        }
      }
    }

    const savedData: any = this.purchasevoucher_entryDataset?.filter(
      (k: any) => k.itemname != null && k.qty > 0,
    );
    const purchaseVoucher_Save: any = this.purchaseVoucherFormGroup
      .value as any;

    purchaseVoucher_Save.purchaseVoucherPurID = this.savedPurchaseVoucher
      ? this.savedPurchaseVoucher.purchaseVoucherPurID
      : 0;

    purchaseVoucher_Save.purchaseVoucherVoucherNo =
      this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherVoucherNo;
    purchaseVoucher_Save.purchaseVoucherPurchaseDate =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseDate;
    purchaseVoucher_Save.purchaseVoucherPurchaseRef =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef;
    purchaseVoucher_Save.purchaseVoucherSupplyInvoiceNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherSupplyInvoiceNo;
    purchaseVoucher_Save.purchaseVoucherCurrencyID =
      this.purchaseVoucherFormGroup.value.purchaseVoucherCurrencyId;
    purchaseVoucher_Save.purchaseVoucherExcludeVat =
      this.purchaseVoucherFormGroup.value.purchaseVoucherExcludeVat;
    purchaseVoucher_Save.purchaseVoucherPurchaseType =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseType;
    purchaseVoucher_Save.purchaseVoucherPartyID =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPartyId;
    purchaseVoucher_Save.purchaseVoucherPartyName =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPartyName;
    purchaseVoucher_Save.purchaseVoucherPartyAddress =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPartyAddress;
    purchaseVoucher_Save.purchaseVoucherPartyVatNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPartyVatNo;
    purchaseVoucher_Save.purchaseVoucherGrNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherGrNo;
    purchaseVoucher_Save.purchaseVoucherGrDate =
      this.purchaseVoucherFormGroup.value.purchaseVoucherGrDate;
    purchaseVoucher_Save.purchaseVoucherLpoNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherLpoNo;
    purchaseVoucher_Save.purchaseVoucherLpoDate =
      this.purchaseVoucherFormGroup.value.purchaseVoucherLpoDate;
    purchaseVoucher_Save.purchaseVoucherQuatationNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherQuatationNo;
    purchaseVoucher_Save.purchaseVoucherQuatationDate =
      this.purchaseVoucherFormGroup.value.purchaseVoucherQuatationDate;
    purchaseVoucher_Save.purchaseVoucherPoNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPoNo;
    purchaseVoucher_Save.purchaseVoucherBatchCode =
      this.purchaseVoucherFormGroup.value.purchaseVoucherBatchCode;
    purchaseVoucher_Save.purchaseVoucherDayBookNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherDayBookNo;
    purchaseVoucher_Save.purchaseVoucherLocationID = this.defaultLocationID;
    purchaseVoucher_Save.purchaseVoucherJobID =
      this.purchaseVoucherFormGroup.value.purchaseVoucherJobId;
    purchaseVoucher_Save.purchaseVoucherVatAmount = Number(this.getVatAmount());
    purchaseVoucher_Save.PurchaseVoucherJobDirectPurchase =
      this.purchaseVoucherFormGroup.value.PurchaseVoucherJobDirectPurchase;

    purchaseVoucher_Save.purchaseVoucherTotalGrossAmt = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt,
    );
    purchaseVoucher_Save.purchaseVoucherTotalItemDisAmount = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherTotalItemDisAmount,
    );
    purchaseVoucher_Save.purchaseVoucherDiscountPercentage = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherDiscountPercentage,
    );
    purchaseVoucher_Save.purchaseVoucherTotalDiscountAmt = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherTotalDiscountAmt,
    );
    purchaseVoucher_Save.purchaseVoucherVatPercentage = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherVatPercentage,
    );
    // purchaseVoucher_Save.purchaseVoucherVATAmount = Number(
    //   this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount
    // );
    purchaseVoucher_Save.purchaseVoucherActualAmount = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount,
    );
    purchaseVoucher_Save.purchaseVoucherVatRoundSign =
      this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundSign;
    //purchaseVoucher_Save.purchaseVoucherVatRoundSign = '-';
    purchaseVoucher_Save.purchaseVoucherVatRoundAmount = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundAmount,
    );
    purchaseVoucher_Save.purchaseVoucherNetAmount = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherNetAmount,
    );

    purchaseVoucher_Save.accountsTransactions = [];

    purchaseVoucher_Save.purchaseVoucherDetails = savedData
      ?.filter((k) => k.itemId != null)
      .map((k: any) => {
        return {
          purchaseVoucherDetailsId: k.id != null ? k.id : 0,
          purchaseVoucherDetailsNo:
            this.purchaseVoucherFormGroup.getRawValue()
              .purchaseVoucherVoucherNo,

          purchaseVoucherId: 0,
          purchaseVoucherDetailsMaterialId:
            k.itemId ??
            (k.itemname != null && k.itemname !== ''
              ? this.ItemMasterArray?.find(
                  (j) => j.itemMasterItemName?.trim() === k.itemname?.trim(),
                )?.itemMasterItemId
              : null),
          purchaseVoucherDetailsItemName: k.itemname,

          purchaseVoucherDetailsQuantity: k.qty,
          purchaseVoucherDetailsDiscountAmoutPurchase: k.disc ? k.disc : 0,
          purchaseVoucherDetailsRate: k.rate,
          purchaseVoucherDetailsNetAmount: k.netAmt,
          purchaseVoucherDetailsGrossAmount: k.grossAmt,
          purchaseVoucherDetailsVatAmount: k.vatAmt, // 0,
          purchaseVoucherDetailsRemarks: k.narration,
          purchaseVoucherDetailsSno: k.id, // 0,
          purchaseVoucherDetailsJobID:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                  ?.value
              : null,
          purchaseVoucherDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                  (x) => x.unitMasterUnitShortName?.trim() === k.unit?.trim(),
                )?.unitMasterUnitId
              : null,
          purchaseVoucherDetailsFsno: 1,
          purchaseVoucherDetailsLoacationId: this.defaultLocationID,
          purchaseVoucherDetailsAmount: k.qty * k.rate,
          purchaseVoucherDetailsFcAmount: k.qty * k.rate,
          purchaseVoucherDetailsDelStatus: false,
          purchaseVoucherDetailsPoId: k.poId,
          purchaseVoucherDetailsPodId: k.podId,
          purchaseVoucherDetailsSVID: k.svId,
        };
      });
    const creditData: AccountsTransactions = {
      accountsTransactionsAccNo:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseType ==
        'CASH'
          ? this.cashAccount
          : this.SupplierMasterArray?.find(
              (o) =>
                o.suppliersMasterSupplierId ==
                this.purchaseVoucherFormGroup.value.purchaseVoucherPartyId,
            )?.suppliersMasterSupplierReffAcNo,
      accountsTransactionsTransDate: this.f.purchaseVoucherPurchaseDate.value,
      accountsTransactionsParticulars:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsCredit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherNetAmount,
      ),
      accountsTransactionsFcCredit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherNetAmount,
      ),
      accountsTransactionsAllocBalance: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherNetAmount,
      ),
      accountsTransactionsFcAllocBalance: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherNetAmount,
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherVoucherNo,
      accountsTransactionsDescription:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsJobNo:
        this.purchaseVoucherFormGroup.value.purchaseVoucherJobId ?? -1,
      accountsTransactionsCurrencyId:
        this.purchaseVoucherFormGroup.value.purchaseVoucherCurrencyID,
    };
    purchaseVoucher_Save.accountsTransactions.push(creditData);
    ///vat
    const receivableVat: AccountsTransactions = {
      accountsTransactionsAccNo: this.VatAccount,
      accountsTransactionsTransDate: this.f.purchaseVoucherPurchaseDate.value,
      accountsTransactionsParticulars:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsDebit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount
          ? this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount
          : 0,
      ),
      accountsTransactionsFcDebit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount
          ? this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount
          : 0,
      ),
      accountsTransactionsAllocBalance: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount,
      ),
      accountsTransactionsFcAllocBalance: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherVatAmount,
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherVoucherNo,
      accountsTransactionsDescription:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsCurrencyId:
        this.purchaseVoucherFormGroup.value.purchaseVoucherCurrencyID,
    };
    purchaseVoucher_Save.accountsTransactions.push(receivableVat);
    /// purchse
    const debitData: AccountsTransactions = {
      accountsTransactionsAccNo: this.stockAccount,
      accountsTransactionsTransDate: this.f.purchaseVoucherPurchaseDate.value,
      accountsTransactionsParticulars:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsDebit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt,
      ),
      accountsTransactionsFcDebit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt,
      ),
      accountsTransactionsAllocBalance:
        this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt,
      accountsTransactionsFcAllocBalance: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt,
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherVoucherNo,
      accountsTransactionsDescription:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsCurrencyId:
        this.purchaseVoucherFormGroup.value.purchaseVoucherCurrencyID,
    };
    purchaseVoucher_Save.accountsTransactions.push(debitData);

    if (this.btnFlag.save) {
      this.saveVoucher(purchaseVoucher_Save);
    } else {
      this.updateVoucher(purchaseVoucher_Save);
    }
  }
  resetBrowsSalesForm() {
    this.salesVoucherFilterForm.reset();
    this.salesVoucherFilterForm.controls.isDate.setValue(false);
  }

  saveVoucher(purchaseVoucher_Save: PurchaseVoucher) {
    if (this.purchaseVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.userTrackingLog('Insert');
          this.Procurementapi.InsertPurchaseVoucher(
            purchaseVoucher_Save,
          ).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.savedPurchaseVoucher = data.result;
              this.updateFormGrid(data.result);

              this.purchaseVoucherFormGroup.disable();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Saved Successfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('GRN Voucher Save Failed'),
              });
            },
          );
          // }
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.purchaseVoucherFormGroup.markAllAsTouched();
      this.purchaseVoucherFormGroup.markAsDirty();
    }
  }

  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();

    this.LoadJobDDL();
    this.LoadUnitDDL();
    this.LoadCurrancyDDL();
    this.LoadLocationDDL();
    this.LoadSupplierDDL();
    this.LoadAccountSettingDDL();
    // this.GetDefaultSettings();
  }
  getGRNByID(id: string) {
    // this.callDropdowns();
    this.browseBTN = true;
    this.itemList = [];
    this.purchaseVoucherFormGroup.disable();
    this.accountapi.GetGRNByID(id).subscribe((data: any) => {
      this.btnFlag = {
        edit: true,
        cancel: true,
        save: false,
        update: true,
        delete: true,
        new: true,
      };

      this.updateFormGrid(data);
      this.savedPurchaseVoucher = data;
      this.userTrackingList = data.userTrackingData;
      this.accountTransactionList = data.accountsTransactions;
      this.savedPurchaseVoucher = data;
      this.GetDefaultSettings();
    });
  }

  updateVoucher(purchaseVoucher_Save: PurchaseVoucher) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant(
        'Do you want to update existing voucher?',
      ),
      accept: () => {
        this.Procurementapi.updateGRN(purchaseVoucher_Save).subscribe(
          (data) => {
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
              new: true,
            };
            this.updateFormGrid(data.result);
            this.userTrackingLog('Update');

            this.purchaseVoucherFormGroup.disable();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Updated Successfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: this.translate.instant('GRN Voucher Update Failed'),
            });
          },
        );
      },
    });
  }

  getAllGetGRNList() {
    this.purchaseVoucherarry = new Array<PurchaseVoucher>();
    this.accountapi.GetAllGRN().subscribe((data: any) => {
      data.map((i) => {
        i.jobname =
          i.purchaseVoucherJobID == -1
            ? ''
            : this.getJobName(i.purchaseVoucherJobID);
        return i;
      });
      this.GRNListing = data;
      this.filterArray = data;
      this.displayMaximizable = true;
    });
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId,
    )?.itemMasterItemName;
  }

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }

  public getitemName(id: number): string {
    return this.ItemMasterArray?.find((j) => j.itemMasterItemId === id)
      ?.itemMasterItemName;
  }
  public getSuppliersName(id: number): string {
    return this.SupplierMasterList?.find((k) => k?.value === id)?.label;
  }
  getEmptyRowCount(length): number {
    const DetailsLength = length || 0;
    if (length < 12) {
      return Math.max(0, 12 - DetailsLength);
    } else {
      return;
    }
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  new() {
    this.browseBTN = true;
    this.itemList = [];
    this.savedPurchaseVoucher = null;
    this.GridDataList = [];
    this.purchaseVoucherFormGroup.reset();
    this.purchasevoucher_entry.data = [];
    this.activeRow = { row: 0, column: 0 };
    this.purchasevoucher_entryDataset = [];
    this.purchasevoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.purchasevoucher_entry);
    this.purchaseVoucherFormGroup.controls.purchaseVoucherVatRoundSign.setValue(
      '-',
    );
    this.purchaseVoucherFormGroup.controls.purchaseVoucherPurchaseType.setValue(
      'CREDIT',
    );

    this.purchaseVoucherFormGroup.controls.purchaseVoucherVatPercentage.setValue(
      5,
    );
    this.purchaseVoucherFormGroup.controls.PurchaseVoucherJobDirectPurchase.setValue(
      false,
    );

    this.accountTransactionList = [];
    this.purchaseVoucherFormGroup.get('purchaseVoucherPurId').setValue(0);
    this.purchaseVoucherFormGroup.get('purchaseVoucherPartyId').setValue(0);
    this.purchaseVoucherFormGroup.get('purchaseVoucherJobId').setValue(-1);
    this.purchaseVoucherFormGroup.get('isDate').setValue(false);
    this.purchaseVoucherFormGroup
      .get('purchaseVoucherLocationId')
      .setValue(this.defaultLocationID);
    this.GetDefaultSettings();

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.index = 0;
    this.purchaseVoucherFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseVoucherFormGroup,
      'purchaseVoucherLocationId',
      this.locationLocked,
    );

    this.purchaseVoucherFormGroup.controls.purchaseVoucherLocationId.disable();
    this.f.purchaseVoucherPurchaseDate.setValue(new Date());
    this.f.purchaseVoucherVoucherNo.clearValidators();
    this.purchaseVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
    this.callDropdowns(false);
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m: any) => {
      let list = m.resultSet.generalSettings;
      let optionSettings = m.resultSet.optionSettings;
      // currency

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY',
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.purchaseVoucherCurrencyId.setValue(Number(this.DefCurrency));
        }
      }
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION',
      );
      if (DEFAULT_LOCATION != null) {
        this.DefLocCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocCheck !== null) {
          const splitText = this.DefLocCheck.split('::');
          this.DefLocid = splitText[1]?.trim();
          if (!this.locationLocked) {
            this.f.purchaseVoucherLocationId.setValue(Number(this.DefLocid));
          }
        }
      }

      // if (this.DefLocCheck !== null) {
      //   const splitText = this.DefLocCheck.split('::');
      //   this.DefLocid = splitText[1]?.trim();
      //   this.f.purchaseVoucherLocationId.setValue(Number(this.DefLocid));
      // }
      const regex = /([a-zA-Z\s]+)(\d+)%?/;

      const match = optionSettings.optionsMasterType.match(regex);

      this.vatvalue = parseInt(match[2], 10);
      if (this.hideJobDetail) {
        this.updateTableConfiguration();
      }
      var VAT_Calculation = list?.filter(
        (a) => a.generalSettingsKeyValue == 'VAT_Calculation',
      );
      var vatcal = VAT_Calculation[0]?.generalSettingsBoolValue;

      this.VatCalculation = vatcal == true ? true : false;
      this.purchaseVoucherFormGroup.controls.purchaseVoucherVatPercentage.setValue(
        this.VatCalculation ? this.vatvalue : 0,
      );
    });
  }

  initializeHandsontable(columns, colHeaders) {
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      columns: columns,
      colHeaders: colHeaders,
    });
  }

  showMaximizableDialog() {
    this.callDropdowns(false);
    this.getAllGetGRNList();
  }

  showPrintPreview() {
    this.displayPreview = true;
  }
  printbtn: MenuItem[];
  getReportType() {
    this.masterapi.General('GRN').subscribe((res: any) => {
      this.printbtn = res.map((r: any) => ({
        label: r.reportTypeDescription,
        command: () => this.showPrint(r.reportTypeFileName),
      }));
    });
  }
  showPrint(type) {
    this.rptFilter = {
      ReportName: type,
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_grn  where purchase_voucher_pur_id=${
          this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherPurId
        }`,
      ],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  updateFormGrid(purchasevoucher_update: any) {
    this.purchaseVoucherFormGroup.patchValue({
      purchaseVoucherPurId: purchasevoucher_update.purchaseVoucherPurID,
      purchaseVoucherVoucherNo: purchasevoucher_update.purchaseVoucherVoucherNo,
      purchaseVoucherPurchaseDate: new Date(
        purchasevoucher_update.purchaseVoucherPurchaseDate,
      ),
      purchaseVoucherPurchaseRef:
        purchasevoucher_update.purchaseVoucherPurchaseRef,
      purchaseVoucherSupplyInvoiceNo:
        purchasevoucher_update.purchaseVoucherSupplyInvoiceNo,
      purchaseVoucherCurrencyId:
        purchasevoucher_update.purchaseVoucherCurrencyID,
      purchaseVoucherExcludeVat:
        purchasevoucher_update.purchaseVoucherExcludeVat,

      purchaseVoucherPurchaseType:
        purchasevoucher_update.purchaseVoucherPurchaseType,
      purchaseVoucherPartyId: purchasevoucher_update.purchaseVoucherPartyID,
      purchaseVoucherPartyName: purchasevoucher_update.purchaseVoucherPartyName,
      purchaseVoucherPartyAddress:
        purchasevoucher_update.purchaseVoucherPartyAddress,
      purchaseVoucherPartyVatNo:
        purchasevoucher_update.purchaseVoucherPartyVatNo,
      purchaseVoucherDescription:
        purchasevoucher_update.purchaseVoucherDescription,

      purchaseVoucherGrNo: purchasevoucher_update.purchaseVoucherGrNo,
      purchaseVoucherGrDate:
        purchasevoucher_update.purchaseVoucherGrDate != null
          ? new Date(purchasevoucher_update.purchaseVoucherGrDate)
          : null,
      purchaseVoucherLpoNo: purchasevoucher_update.purchaseVoucherLpoNo,
      purchaseVoucherLpoDate:
        purchasevoucher_update.purchaseVoucherLpoDate != null
          ? new Date(purchasevoucher_update.purchaseVoucherLpoDate)
          : null,
      purchaseVoucherQuatationNo:
        purchasevoucher_update.purchaseVoucherQuatationNo,
      purchaseVoucherQuatationDate:
        purchasevoucher_update.purchaseVoucherQuatationDate != null
          ? new Date(purchasevoucher_update.purchaseVoucherQuatationDate)
          : null,
      purchaseVoucherPoNo: purchasevoucher_update.purchaseVoucherPoNo,
      purchaseVoucherBatchCode: purchasevoucher_update.purchaseVoucherBatchCode,
      purchaseVoucherDayBookNo: purchasevoucher_update.purchaseVoucherDayBookNo,
      purchaseVoucherLocationId: this.defaultLocationID,
      purchaseVoucherJobId: purchasevoucher_update.purchaseVoucherJobID,
      purchaseVoucherTotalGrossAmt:
        purchasevoucher_update.purchaseVoucherTotalGrossAmt,
      purchaseVoucherTotalItemDisAmount:
        purchasevoucher_update.purchaseVoucherTotalItemDisAmount,
      purchaseVoucherDiscountPercentage:
        purchasevoucher_update.purchaseVoucherDiscountPercentage,
      purchaseVoucherTotalDiscountAmt:
        purchasevoucher_update.purchaseVoucherTotalDiscountAmt,
      purchaseVoucherVatPercentage:
        purchasevoucher_update.purchaseVoucherVATPercentage,
      purchaseVoucherVatAmount: purchasevoucher_update.purchaseVoucherVATAmount,
      purchaseVoucherActualAmount:
        purchasevoucher_update.purchaseVoucherActualAmount,
      purchaseVoucherVatRoundSign:
        purchasevoucher_update.purchaseVoucherVATRoundSign,
      purchaseVoucherVatRoundAmount:
        purchasevoucher_update.purchaseVoucherVATRoundAmount,
      purchaseVoucherNetAmount: purchasevoucher_update.purchaseVoucherNetAmount,
      PurchaseVoucherJobDirectPurchase:
        purchasevoucher_update.purchaseVoucherJobDirectPurchase
          ? purchasevoucher_update.purchaseVoucherJobDirectPurchase
          : false,
      purchaseVoucherSupplier: this.SupplierMasterArray?.find(
        (I) =>
          I.suppliersMasterSupplierId ==
          purchasevoucher_update.purchaseVoucherPartyID,
      )?.suppliersMasterSupplierName,
    });
    this.purchaseVoucherFormGroup.disable();
    if (this.supplierCtrol && this.supplierCtrol.nativeElement) {
      this.supplierCtrol.nativeElement.value = this.SupplierMasterList?.find(
        (k) => k?.value === purchasevoucher_update?.purchaseVoucherPartyID,
      )?.label;
    }
    this.GridDataList = [];
    this.accountTransactionList = purchasevoucher_update.accountsTransactions;

    const gridData: GridData[] =
      purchasevoucher_update.purchaseVoucherDetails.map((k) => {
        const ItemId: string = this.ItemMasterArray?.find(
          (l) => l.itemMasterItemId == k.purchaseVoucherDetailsMaterialId,
        )?.itemMasterItemName;
        const UnitId: string = this.unitListt?.find(
          (l) => l.value == k.purchaseVoucherDetailsUnitId,
        )?.label;
        return {
          itemId: k.purchaseVoucherDetailsMaterialId,
          // itemname: ItemId,
          unit: UnitId,
          itemname: k.purchaseVoucherDetailsItemName ?? ItemId,
          qty: k.purchaseVoucherDetailsQuantity,
          rate: k.purchaseVoucherDetailsRate,
          disc: k.purchaseVoucherDetailsDiscountAmoutPurchase,
          netAmt: k.purchaseVoucherDetailsNetAmount,
          vatAmt: k.purchaseVoucherDetailsVatAmount,
          grossAmt: k.purchaseVoucherDetailsGrossAmount,
          jobname:
            k.purchaseVoucherDetailsJobID != null
              ? this.jobList?.find(
                  (l) => l.value == k?.purchaseVoucherDetailsJobID,
                )?.label
              : null,
          costcenter: null,
          narration: k.purchaseVoucherDetailsRemarks,
          id: k.purchaseVoucherDetailsPurcahseDetailsId,
          poId: k?.purchaseVoucherDetailsPoId,
          podId: k?.purchaseVoucherDetailsPodId,
          svId: k?.purchaseVoucherDetailsSVID,
        };
      });

    this.purchasevoucher_entryDataset = gridData;

    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    hotInstance.updateSettings({ data: gridData, readOnly: true });
    hotInstance.selectCell(0, 4);

    this.purchasevoucher_entry.readOnly = true;
    this.purchaseVoucherFormGroup.disable();
    this.f.purchaseVoucherVoucherNo.clearValidators();
    this.purchaseVoucherFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to delete voucher?'),
      accept: () => {
        this.userTrackingLog('Delete');
        this.Procurementapi.DeleteGRN(this.savedPurchaseVoucher).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: this.translate.instant(
                'Purchase Voucher Deleted Succesfully',
              ),
            });
            this.new();
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: this.translate.instant('Failed'),
            });
          },
        );
      },
    });
  }
  cancel() {
    // this.GetSavedPurchaseVoucherDetails(this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherVoucherNo);
  }

  edit() {
    this.purchasevoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.purchaseVoucherVoucherNo.clearValidators();
    this.purchaseVoucherFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseVoucherFormGroup,
      'purchaseVoucherLocationId',
      this.locationLocked,
    );
    this.purchaseVoucherFormGroup.controls.purchaseVoucherLocationId.disable();
    this.purchaseVoucherFormGroup.controls.purchaseVoucherVoucherNo.disable();
    this.purchaseVoucherFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.purchasevoucher_entryDataset.length > 0) {
      // this.purchasevoucher_entry.data.forEach((value: GridData, index, arry) => {
      //
      return Object.values(this.purchasevoucher_entryDataset).some(
        (k: GridData) => k.itemname != null,
      );
      // });
    }
    return false;
  }

  exit(evt) {
    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
    this.showSalesLookUp = false;
  }

  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      // this.elementReference.nativeElement.value ="";
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(evt.cell.row, evt.cell.column, null);
    }
    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
  }

  selectControl(evt) {
    this.control.setValue(evt.procurementsId);
    this.elementReference.nativeElement.value = evt.procurements;
    this.formControlLookUp = false;
  }

  hide(evt: boolean) {
    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
  }

  POList: Array<any> = [];
  selectedGrn: any;
  selectedVoucherNo: any;
  selectedVoucherPOId: any;

  okForEdit() {
    this.displayPOList = false;
  }

  cancelEdit() {
    this.displayPOList = false;
    this.gridDataArray = new Array<GridData>();
    this.gridIterator = 0;
    this.new();
  }

  selectedSupplier?: SuppliersMaster = null;
  displaySupplierList: boolean = false;

  selectSupplier(supplier: any) {
    this.PODataList = [];
    this.lastexportArray = [];
    this.displaySupplierList = false;
    this.selectedSupplierId = supplier.suppliersMasterSupplierId;
    this.selectedSupplier = supplier;
    this.purchaseVoucherFormGroup.controls['purchaseVoucherPartyId'].setValue(
      supplier.suppliersMasterSupplierId,
    );
    this.purchaseVoucherFormGroup.controls['purchaseVoucherSupplier'].setValue(
      supplier.suppliersMasterSupplierName,
    );
    this.purchaseVoucherFormGroup.controls[
      'purchaseVoucherPartyVatNo'
    ].setValue(supplier.suppliersMasterSupplierVatNo);
    this.stockApi.GetGRMPOs(this.selectedSupplierId).subscribe((res: any) => {
      var PODataArray = res.result;
      PODataArray.forEach((element: any) => {
        this.PODataList.push({
          supplierName: element?.supplierName,
          PONo: element?.poNo,
          materialName: element.itemName,
          itemId: element.itemId,
          poQty: element.quantity,
          unitName: element.unitName,
          isSelect: false,
          price: element.rate,
          poId: element.poId,
          date: element.poDate,
          podId: element.podId,
          bQty: element.balanceQuantity,
          dQty: element.deliveredQuantity,
        });
      });
      this.originalPODataList = [...this.PODataList];
    });
  }

  selectsales(evt) {
    if (evt.job) {
      // const jobname = evt.job.split(' -- ')
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 13, evt.job);
    } else {
      if (this.clickedRowColumn.column == 0) {
        if (this.itemList.includes(evt.procurementsId)) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Duplicate Entry',
            detail: `${evt.procurements} is already exists in this table`,
          });
          return;
        }

        this.itemList[this.clickedRowColumn.row] = evt.procurementsId;
      }
      let trimmedSales = evt.procurements?.trim();
      const includesPcs = this.units.some((unit) =>
        unit.unitMasterUnitShortName?.trim().includes(trimmedSales),
      );
      if (includesPcs && this.unitArray.length != 0) {
        var UnitId: any = this.unitArray?.find(
          (l) => l.unitMasterUnitId == evt.procurementsId,
        );
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);

        hotInstance.setDataAtCell(
          this.activeRow.row,
          3,
          UnitId?.unitMasterUnitShortName,
        );
        hotInstance.setDataAtCell(
          this.activeRow.row,
          5,
          UnitId?.unitDetailsRate,
        );
      } else {
        this.masterapi
          .GetItemMasterById({ id: evt.procurementsId })
          .subscribe((k) => {
            this.ItemMasterArrayByName = k.resultSet?.itemMaster;
            const hotInstance = this.hotRegisterer.getInstance(this.hotid);

            if (this.ItemMasterArrayByName.unitDetails) {
              const unitId =
                this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
              hotInstance.setDataAtCell(
                this.activeRow.row,
                0,
                this.ItemMasterArrayByName?.itemMasterItemId,
              );
              hotInstance.setDataAtCell(
                this.activeRow.row,
                3,
                this.ItemMasterArrayByName.unitDetails
                  ?.unitDetailsConversionType,
              );
              const UnitId: string =
                unitId != null
                  ? this.unitListt?.find((l) => l.value == unitId)?.label
                  : null;

              hotInstance.setDataAtCell(this.activeRow.row, 3, UnitId);
              hotInstance.setDataAtCell(
                this.activeRow.row,
                5,
                this.ItemMasterArrayByName.unitDetails?.unitDetailsRate,
              );
              // hotInstance.setDataAtCell(
              //   this.activeRow.row,
              //   16,
              //   this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType
              // );
            }
            hotInstance.setDataAtCell(
              this.activeRow.row,
              2,
              this.ItemMasterArrayByName.itemMasterItemName,
            );
          });
      }
    }
    this.showSalesLookUp = false;
    const hot = this.hotRegisterer.getInstance(this.hotid);
    hot.selectCell(this.activeRow.row, 4);
  }

  selectUnits(evt) {
    if (evt.procurements) {
      var UnitId: any = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.procurementsId,
      );
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);

      hotInstance.setDataAtCell(
        this.activeRow.row,
        3,
        UnitId?.unitMasterUnitShortName,
      );
      hotInstance.setDataAtCell(this.activeRow.row, 5, UnitId?.unitDetailsRate);
    }
    this.showUnitLookUp = false;
  }

  getUnitByItemId(id) {
    this.masterapi.GetUnitDetails(id).subscribe((res) => {
      this.unitArray = res.result;
      this.dataList = this.unitSetLookup;
      this.unitArry = res.result.map((ar) =>
        ar.unitMasterUnitShortName?.trim(),
      );
      this.showSalesLookUp = true;
    });
  }

  totalGrossAmt: number = 0;
  totalNetAmt: number = 0;
  totalDiscAmt: number = 0;
  totalDiscPer: number = 0;
  totalVatableAmt: number = 0;
  totalVatAmt: number = 0;
  totalAmountInWords: string = '';

  ColumnSum() {
    var discountTotal = 0;
    var disc = 0;
    this.purchasevoucher_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.disc && elemt && elemt.qty) {
        discountTotal += elemt.disc * elemt.qty;
      }
    });
    disc += discountTotal;
    this.purchaseVoucherFormGroup.controls.purchaseVoucherTotalItemDisAmount.setValue(
      parseFloat(disc.toFixed(this.decimals)),
    );
    var netAmt = 0;
    this.purchasevoucher_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.netAmt) {
        netAmt += elemt.netAmt;
      }
    });
    this.purchaseVoucherFormGroup.controls.purchaseVoucherNetAmount.setValue(
      parseFloat(netAmt.toFixed(this.decimals)),
    );
    var value = 0;
    this.purchasevoucher_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.grossAmt) {
        value += elemt.grossAmt;
      }
    });
    this.purchaseVoucherFormGroup.controls.purchaseVoucherTotalGrossAmt.setValue(
      parseFloat(value.toFixed(this.decimals)),
    );

    var vatAmount = 0;
    this.purchasevoucher_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.vatAmt) {
        vatAmount += elemt.vatAmt;
      }
    });
    this.purchaseVoucherFormGroup.controls.purchaseVoucherVatAmount.setValue(
      parseFloat(vatAmount.toFixed(this.decimals)),
    );

    this.GetTotal();
  }

  CalcDiscFromPer() {
    this.purchaseVoucherFormGroup.controls.purchaseVoucherTotalDiscountAmt.setValue(
      parseFloat(
        (
          (Number(
            this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt,
          ) *
            Number(
              this.purchaseVoucherFormGroup.value
                .purchaseVoucherDiscountPercentage,
            )) /
          100
        ).toFixed(this.decimals),
      ),
    );
    this.GetTotal();
  }

  CalcDiscFromAmt() {
    this.purchaseVoucherFormGroup.controls.purchaseVoucherDiscountPercentage.setValue(
      parseFloat(
        (
          Number(
            this.purchaseVoucherFormGroup.value
              .purchaseVoucherTotalDiscountAmt * 100,
          ) /
          Number(
            this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt,
          )
        ).toFixed(this.decimals),
      ),
    );
    this.GetTotal();
  }

  getVatAmount() {
    var vatAmount: any = 0;
    if (this.f.purchaseVoucherTotalGrossAmt.value > 0 && this.VatCalculation) {
      vatAmount = Number(
        ((this.f.purchaseVoucherTotalGrossAmt.value / 100) * 5).toFixed(
          this.decimals,
        ),
      );
      this.f.purchaseVoucherVatAmount.setValue(vatAmount);
    } else {
      this.f.purchaseVoucherVatAmount.setValue(0);
    }
    this.GetTotal();
    return vatAmount;
  }

  onSelectAll() {
    if (this.isSelect) {
      this.PODataList.map((o) => (o.isSelect = true));
    } else {
      this.PODataList.map((o) => (o.isSelect = false));
    }
  }

  onClickExport() {
    var dataArray = this.PODataList?.filter((o) => o.isSelect == true);

    dataArray.forEach((k: any) => {
      let job = this.jobList?.find((l) => l.value == k?.jobid)?.label;
      if (!this.lastexportArray.includes(k.podId)) {
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        hotInstance.setDataAtCell(this.activeRow.row, 17, k?.podId);
        if (k?.bQty != null && !isNaN(Number(k.bQty))) {
          this.poMaxQtyByPodId[k.podId] = Number(k.bQty);
        }
        hotInstance.setDataAtCell(this.activeRow.row, 0, k?.itemId);
        hotInstance.setDataAtCell(this.activeRow.row, 2, k?.materialName);
        hotInstance.setDataAtCell(this.activeRow.row, 3, k?.unitName);
        hotInstance.setDataAtCell(this.activeRow.row, 4, k?.bQty);
        hotInstance.setDataAtCell(this.activeRow.row, 5, k?.price);
        hotInstance.setDataAtCell(
          this.activeRow.row,
          6,
          Number(k.poQty) * Number(k.price),
        );
        hotInstance.setDataAtCell(
          this.activeRow.row,
          8,
          Number(k.poQty) * Number(k.price),
        );
        hotInstance.setDataAtCell(this.activeRow.row, 16, k?.poId);
        hotInstance.setDataAtCell(this.activeRow.row, 13, job);

        this.activeRow.row += 1;
        this.lastexportArray.push(k.podId);
      }
      this.PODataList = this.PODataList?.filter((x) => x.podId != k.podId);
    });
    this.displayPOList = false;
    this.ColumnSum();
  }

  onClickLoadPO() {
    if (
      this.f.purchaseVoucherSupplier.value == null ||
      this.f.purchaseVoucherSupplier.value == ''
    ) {
      this.displayPOList = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Select Supplier',
      });
      return;
    } else {
      this.displayPOList = true;
    }
  }

  dateToday: Date = new Date();

  userTrackingLog(type) {
    let req = {
      page: 'GRN Print',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.purchaseVoucherFormGroup.get('purchaseVoucherVoucherNo').value,
      vpType: 'GRN Print',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  printAsPDF() {
    const fileName = String(new Date().valueOf());
    var css: string = `
.inputGroup {
      margin: 2px 0;
    }

    .date {
      width: 32%;
    }
    .address{
      padding-top: 10px;
      padding-bottom: 10px;
      padding-left: 20px;
    }
    .w-100 {
      width: 100%;
    }
    .flex {
      display: flex;
      margin-bottom: 5px;
      gap: 4px; /* Adjusted the gap value here */
     }
     h2{
      margin: 0;
     }
     h3{
      margin: 0;
     }
    .contain1{
     width: 25%;
    border-radius: 1px;
    padding-bottom: 0%;
    padding: 8px;
    text-align: end;
    }
      .contain2{
        width: 74%;
        border-radius: 1px;
        padding-bottom: 0%;
      }
     .bank2 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49.5%;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
      padding: 8px;
      box-shadow: 5px 5px rgb(201, 204, 204);
     }
    .w70{
      width: 220px;
    }
    .bank1 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49%;
      margin-bottom: 5px;
      border-radius: 1px;
      padding: 8px;
      margin-top: 5px;
       padding-bottom: 0%;
        box-shadow: 5px 5px rgb(201, 204, 204);
    }
    .p-0 {
      padding: 0;
    }

    .grid {
      max-height: 500px;
      overflow: auto;
    }

    .f-r {
      float: right;
    }

    .min-panel {
      min-height: 106px !important;
    }

    :host ::ng-deep .ui-table .ui-table-thead>tr>th {
      position: -webkit-sticky;
      position: sticky;
      top: -8px;
      box-shadow: 1px 3px 6px 0 rgba(32, 33, 36, 0.10);
    }

    @media screen and (max-width: 64em) {
      :host ::ng-deep .ui-table .ui-table-thead>tr>th {
        top: -8px;
      }
    }

    .ui-dropdown {
      min-width: 50% !important;
    }


    .end {
      text-align: end;
    }
.center {
  text-align: center !important;
}
    .print {
      height: 100vh;
      width: 90%;
      margin: auto !important;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .borderP {
      border: .5px solid rgb(201, 204, 204);
      border-radius: 2px;
      margin-bottom: 10px;
      padding: 20px;
      margin-top: -17px;;
      box-shadow: 5px 5px rgb(201, 204, 204);
    }
    #customers {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 5px;
    }
    #customers td,
    #customers th {
      border: 1px solid #ddd;
      padding: 8px;

    }
    #customers tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    #customers tr:hover {
      background-color: #ddd;
    }
    #customers th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #bcc0bf;
      color: rgb(0, 0, 0);
      text-align: center;
    }
    .SvTotal{
      justify-content: end;
      margin: 5px;
      padding: 5px;
      display: flex;
      background-color: #fff;
      gap: 30px;
      width: 84%;
    }
    .SvTotalC{
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      text-align: start;
      gap: 10px;
    }
      .flexcol{
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
    }
    .signature-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .customer-signature {
        order: 1;
        /* Specifies the order of the flex items */
      }

    .authorized-signature {
        order: 2;
        /* Specifies the order of the flex items */
      }
    .flexrow{
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: start;
    }
    .border{
        border: 1px #b1aeae solid;
        border-radius: 5px ;
        margin-bottom: 5px;
        padding: 15px;
    }
    .rowgap{
        gap: 111px;
    }
    .flexSpaceBetween{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-bottom: 20px;

    }

    @media print {
      thead {display: table-header-group;}
      tfoot {display: table-footer-group;}
      table { page-break-inside:auto ;
        font-size: 11px;}
      tr { page-break-inside:avoid; page-break-after:auto }

      body {margin: 0;}

      // img {
      //     width: 140px;
      //     height: 100px;
      // }
      .rectImg {
height: 140px;
    width: 217px;
}

.squreImg {
  height: 145px;
  width: 145px;
}
      .gaprow{
        gap: 50px;
      }
      .print.page {
        page-break-after: always; /* Force page break after content */
        font-size: 12px;
      }

      @page :last {
        .page-footer {
           position: fixed;
          bottom: 0;
          width: 100%;
        }
      }
.conditions {
  margin-left: 0%;
  margin-top: 10px;
}
  .row {
  display: flex;
  margin-left: 0%;
  gap: 0px;
}
  .col1 {
  border: 1px solid #ccc;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  width: 49.5%;
  padding-left: 10px;
}
  .col2 {
  border: 1px solid #ccc;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  width: 50.5%;
  padding-left: 10px;
}



    }

    `;
    this.printService.PrintPDF('printPDF', css);
    this.userTrackingLog('PDF'); // this.fileSaverService.saveAsPDF(data, 'GRN_Report_' + String(this.dateToday));
  }

filter() {
    let filteredArray = this.filterArray;

    // 1. GRN No Filter
    if (
      this.purchaseVoucherFilterForm.value.purchaseGRNNo != null &&
      this.purchaseVoucherFilterForm.value.purchaseGRNNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.purchaseVoucherPurID ===
          Number(this.purchaseVoucherFilterForm.value.purchaseGRNNo),
      );
    }

    // 2. Voucher No Filter
    if (
      this.purchaseVoucherFilterForm.value.purchaseVoucherNo != null &&
      this.purchaseVoucherFilterForm.value.purchaseVoucherNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.purchaseVoucherVoucherNo ===
          this.purchaseVoucherFilterForm.value.purchaseVoucherNo,
      );
    }

    // 3. Supplier Filter (Newly Added)
    if (
      this.purchaseVoucherFilterForm.value.supplier != null &&
      this.purchaseVoucherFilterForm.value.supplier !== '' &&
      this.purchaseVoucherFilterForm.value.supplier !== -1 
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.purchaseVoucherPartyID === 
          Number(this.purchaseVoucherFilterForm.value.supplier)
      );
    }

    // 4. Date Filter
    if (this.purchaseVoucherFilterForm.value.isDate) {
      const fromDateStr = this.purchaseVoucherFilterForm.value.fromDate;
      const toDateStr = this.purchaseVoucherFilterForm.value.toDate; 

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.purchaseVoucherPurchaseDate);
        const fromDate = new Date(fromDateStr); 
        const toDate = new Date(toDateStr);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });
    }

    // Assign final filtered results to the table listing
    this.GRNListing = filteredArray;
  }
  filterPO() {
    const formData = this.PoFilterForm.value;

    console.log('formData = ', formData);
    console.log('PODataList = ', this.PODataList);
    const filteredData = this.originalPODataList?.filter((item) => {
      let isMatch = true;

      if (formData.isPoDate && formData.PofromDate && formData.PotoDate) {
        // Handle both Date objects and ISO strings
        const getDatePart = (date: Date | string) => {
          const d = date instanceof Date ? date : new Date(date);
          return d.toISOString().split('T')[0];
        };

        const fromDate = getDatePart(formData.PofromDate);
        const toDate = getDatePart(formData.PotoDate);
        const itemDate = getDatePart(item.date);

        if (fromDate === toDate) {
          isMatch = isMatch && itemDate === toDate;
        } else {
          isMatch = isMatch && itemDate >= fromDate && itemDate <= toDate;
        }
      }

      // PONo filter
      if (formData.PONo) {
        // Assuming PONo is a string in item and formData.PONo
        isMatch =
          isMatch &&
          item.PONo.toLowerCase().includes(formData.PONo.toLowerCase());
      }

      // Add more filter conditions as needed

      return isMatch;
    });

    this.PODataList = filteredData;
  }

  ClearFilterPO() {
    this.PODataList = this.originalPODataList; // assuming originalPODataList is the original data
    this.PoFilterForm.reset();
    this.PoFilterForm.get('PofromDate').setValue(new Date());
    this.PoFilterForm.get('PotoDate').setValue(new Date());
  }

  ClearFilter() {
    this.purchaseVoucherFilterForm.reset();
    this.GRNListing = this.filterArray;
    this.purchaseVoucherFilterForm.get('fromDate').setValue(new Date());
    this.purchaseVoucherFilterForm.get('toDate').setValue(new Date());
  }
  public getJobName(unit: number): string {
    return this.jobList?.find((j) => j?.value === unit)?.label;
  }
  GetSupplierNameById(id) {
    let dateail = this.SupplierMasterArray?.find(
      (I) => I.suppliersMasterSupplierId == id,
    );
    return dateail;
  }
}

export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800,
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value?.trim() !== '') {
      return timer(time).pipe(
        switchMap(() => acctService.CheckVnoExist(input.value)),
        map((res) => {
          return res.result === false ? null : { Exist: true };
        }),
      );
    }
  };
};

interface GridData {
  podId?: number;
  conversionType?: number;
  itemId?: string;
  partNo?: string;
  itemname?: string;
  unit?: string;
  unitId?: string;
  price?: number;
  qty?: number;
  issue_qty?: number;
  rate?: number;
  amt?: number;
  disc?: number;
  grossAmt?: number;
  vatPer?: number;
  vatAmt?: number;
  netAmt?: number;
  narration?: string;
  jobname?: string;
  costcenter?: string;
  poId?: number;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}

export const columnDetailList = (component: GRNComponent) => [
  {
    data: 'itemId',
    type: 'numeric',
    label: 'Item Id',
    toolTip: 'Item Id',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
  },
  {
    data: 'itemname',
    type: 'text',
    label: 'Item',
    toolTip: 'Item Name',
    source: component.ItemMasterArry,
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    toolTip: 'Unit Name',
    source: component.unitArry,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
    readOnly: false,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Rate',
    readOnly: false,
  },
  {
    data: 'amt',
    type: 'numeric',
    label: 'Amt',
    toolTip: 'Amount',
  },
  {
    data: 'disc',
    type: 'numeric',
    label: 'Disc.',
    toolTip: 'Discount',
    readOnly: false,
  },
  {
    data: 'grossAmt',
    type: 'numeric',
    label: 'Gross Amt',
    toolTip: 'Gross Amount',
    readOnly: false,
  },
  {
    data: 'vatPer',
    type: 'numeric',
    label: 'VAT%.',
    toolTip: 'VAT Percentage',
  },
  {
    data: 'vatAmt',
    type: 'numeric',
    label: 'VAT.Amt',
    toolTip: 'VAT Amount',
  },
  {
    data: 'netAmt',
    type: 'numeric',
    label: 'Net.Amt',
    toolTip: 'Net Amount',
    readOnly: false,
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    toolTip: 'Narration',
    readOnly: false,
  },
  {
    data: 'jobname',
    type: 'text',
    label: 'Job Name',
    toolTip: 'Job Name',
  },
  {
    data: 'costcenter',
    type: 'dropdown',
    label: 'Cost Center',
    toolTip: 'Cost Center',
    source: component.costcenterArry,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
    toolTip: 'Purchase Voucher Detail ID',
  },
  {
    data: 'poId',
    type: 'numeric',
    label: 'PO ID',
    toolTip: 'Purchase Order ID',
  },
  {
    data: 'podId',
    type: 'numeric',
    label: 'POD ID',
    toolTip: 'Purchase Order Detail ID',
  },
  {
    data: 'svId',
    type: 'numeric',
    label: 'SV ID',
    toolTip: 'Sales Voucher ID',
  },
];
interface GridRowData {
  itemId?: number;
  partNo?: string;
  itemname?: string;
  unit?: string;
  qty?: number;
  rate?: number;
  amt?: number;
  disc?: number;
  grossAmt?: number;
  vatPer?: number;
  vatAmt?: number;
  netAmt?: number;
  narration?: string;
  jobname?: string;
  costcenter?: string;
  id?: number;
  poId?: number;
  podId?: number;
  svId?: number;
  [key: string]: any; // Index signature for dynamic properties
}
