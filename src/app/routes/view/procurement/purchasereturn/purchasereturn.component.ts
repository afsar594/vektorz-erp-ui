import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { FormBuilder, FormGroup } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { PurchaseReturn } from 'src/app/routes/domain/Procurements/PurchaseReturn';
import { PurchaseReturnDetails } from 'src/app/routes/domain/Procurements/PurchaseReturnDetails';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { timer, Observable } from 'rxjs';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { PurchaseOrder } from 'src/app/routes/domain/Procurements/PurchaseOrder';
import { debug } from 'console';
import { LoginService } from 'src/app/routes/service/login.service';
import { PurchaseVoucher } from 'src/app/routes/domain/PurchaseVoucher';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';

@Component({
  selector: 'app-purchasereturn',
  templateUrl: './purchasereturn.component.html',
  styleUrls: ['./purchasereturn.component.scss'],
})
export class PurchasereturnComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('suppCtrl', { static: false }) supplierCtrol: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;
  PurchasereturnFormGroup: FormGroup;
  PurchasereturnFilterForm: FormGroup;
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
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];
  Selectedpurchasevoucher: PurchaseVoucher;
  unitArry: string[] = [];
  unitAry: any;
  unitListt: any;
  units: any;
  width = `50%`;
  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;
  SupplierMasterArrayById: SuppliersMaster = null;

  ItemMasterArrayByName: ItemMaster = null;
  funitid: number;

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  locationLocked = false;

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];

  CustomerMasterList: SelectItem[] = [];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  purchaseReturnarry: PurchaseReturn[] = [];
  purchaseVoucherarry: PurchaseReturn[] = [];
  // savedPurchaseReturnGridData: GridData[] = [];
  savedPurchaseReturn: PurchaseReturn;

  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  displayPrintPreview: boolean = false;

  displayPurchaseOrder: boolean = false;
  // purchaseVoucherarry: PurchaseVoucher[] = [];
  PurchaseOrderDetailsByMasterNoArray: any[];
  purchaseOrder_entryDataset: any[];

  purchaseOrderQuanity: number = 0;
  purchaeOrderRate: number;
  purchaseOrderNetAmt: number;
  userId: number;
  purchaseReturnAccount: string;
  payableVatAccount: string;
  Permission: any;
  ScreenId: number;
  filterArray: any;
  cashAccount: any;
  RoundOffAccount: any;
  voucherId: any;
  defaultLocationID = -1;
  // locationLocked: boolean = false;
  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.v_typeList = [
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
    ];
    this.v_RoundoffList = [
      { label: '+', value: '+' },
      { label: '-', value: '-' },
    ];
  }

  currentPage = this.utilityService.defaultPagination.currentPage;
  pageSize = this.utilityService.defaultPagination.pageSize;
  pageOption = this.utilityService.defaultPagination.pageOption;
  totalRecords: number = 0;
  totalPages = 0;
  pageDataSet = [];
  sortPurchaseVoucherColumn = '';
  sortPurchaseReturnColumn = '';
  sortOrder: { [key: string]: 'asc' | 'desc' } = {};
  state: any;
  PurchaseVoucherConfig: Handsontable.GridSettings;
  PurchaseReturnConfig: Handsontable.GridSettings;

  globalPurchaseVoucherSearch = '';
  globalPurchaseReturnSearch = '';
  purchaseVoucherfilter = '';
  purchaseVoucherFromDate = null;
  purchaseVoucherToDate = null;
  purchaseReturnFromDate = null;
  purchaseReturnToDate = null;
  purchaseReturnfilter = '';
  hotidPV = 'PurchaseVoucherHot';
  hotidPR = 'PurchaseReturnHot';

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private procurementapi: ProcurementApiService,
    private loginUser: LoginService,
    private permission: PermissionsService,
    private storage: LocalStorageService,
    private ngZone: NgZone
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.defaultLocationID = this.utilityService.getLockedLocationId();
    this.locationLocked = this.defaultLocationID > 0;
  }

  private hotRegisterer = new HotTableRegisterer();
  hotid = 'purchasereturn_HotEntry';
  purchasereturn_entry: Handsontable.GridSettings;
  purchaseReturnFormGroup: FormGroup;
  purchasereturn_entryDataset = [];
  // accountTransactionDataset = [];

  ngAfterViewInit() {}
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.stationmasterObj = this.permission.getStation();
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
    this.activatedroute.queryParams.subscribe((params) => {
      this.voucherId = params['id'];
      if (this.voucherId) {
        this.GetSavedPurchaseReturnDetails(this.voucherId);
      }
    });

    this.FILL_COMBO();

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.initializePurchaseVoucherControls();
    this.initializePurchaseReturnControls();
    //this.LoadLocationDDL();
    //this.getDefaultLocation();
    this.purchaseReturnFormGroup = this.fb.group({
      purchaseReturnId: [0],
      purchaseReturnNo: [{ value: '', disabled: true }],
      purchaseReturnDate: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      purchaseReturnRefNo: [{ value: '', disabled: true }],
      purchaseReturnSupInvNo: [{ value: '', disabled: true }],
      purchaseReturnCurrencyId: [-1],
      purchaseReturnExcludeVat: [{ value: false, disabled: true }],

      purchaseReturnType: [-1, [DropDownValidator]],
      purchaseReturnPartyId: [-1, [DropDownValidator]],
      purchaseReturnPartyName: [{ value: '', disabled: true }],
      purchaseReturnPartyAddress: [{ value: '', disabled: true }],
      purchaseReturnPartyVatNo: [{ value: '', disabled: true }],
      purchaseReturnDescription: [
        { value: '', disabled: true },
        [Validators.required],
      ],

      purchaseReturnGrno: [{ value: null, disabled: true }],
      purchaseReturnGrdate: [{ value: null, disabled: true }],
      purchaseReturnLpono: [{ value: null, disabled: true }],
      purchaseReturnLpodate: [{ value: null, disabled: true }],
      purchaseReturnQtnNo: [{ value: null, disabled: true }],
      purchaseReturnQtnDate: [{ value: null, disabled: true }],
      purchaseReturnPono: [{ value: null, disabled: true }],
      purchaseReturnBatchCode: [{ value: null, disabled: true }],
      purchaseReturnDayBookNo: [{ value: null, disabled: true }],
      purchaseReturnJobId: [-1],
      purchaseReturnLocationId: [this.defaultLocationID, [DropDownValidator]],

      purchaseReturnTotalGrossAmount: [{ value: [0], disabled: true }],
      purchaseReturnTotalItemDisAmount: [{ value: [0], disabled: true }],
      purchaseReturnTotalDisPer: [{ value: [0], disabled: true }],
      purchaseReturnTotalDisAmount: [{ value: [0], disabled: true }],
      purchaseReturnVatPer: [{ value: [5], disabled: true }],
      purchaseReturnVatAmt: [{ value: [0], disabled: true }],
      purchaseReturnTotalActualAmount: [{ value: [0], disabled: true }],
      purchaseReturnVatRoundSign: [{ value: '-', disabled: true }],
      purchaseReturnVatRountAmt: [{ value: [0], disabled: true }],
      purchaseReturnNetAmount: [{ value: [0], disabled: true }],
    });
    this.PurchasereturnFilterForm = this.fb.group({
      purchaseReturnVoucherNo: [null],
      purchaseReturnType: [null],
      isDate: [],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });

    this.userId = this.loginUser.GetCredentialData().userId;
    this.LoadLocationDDL();
    this.bykeys();
  }

  get f() {
    return this.purchaseReturnFormGroup.controls;
  }
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;

  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail')
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        // const costCenterSetting = res?.find(
        //   (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        // );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        // this.hideCostCenterDetail =
        //   costCenterSetting?.programSettingsBoolValue ?? false;
        this.updateTableConfiguration();
      });
  }

  updateTableConfiguration() {
    const hiddenColumns = [9, 10, 11, 13, 14];
    if (this.hideJobDetail) {
      hiddenColumns.push(12);
    }
    // if (this.hideCostCenterDetail) {
    //   hiddenColumns.push(14);
    // }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }
  initializeControls() {
    const hiddenColumns = [9, 10, 11, 12, 13, 14]; // Hide vatAmt, netAmt, narration, jobname, conversionType, id
    this.purchasereturn_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns
    );
    this.purchasereturn_entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);

      if (column === 0 && this.purchasereturn_entry.readOnly === false) {
        this.lookupGridColumns = ['Item ID', 'Item Name'];
        this.dataList = this.itemIDSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 2 && this.purchasereturn_entry.readOnly === false) {
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      } else {
        this.showProcurementsLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.procurements == x);
      } else {
        this.selectItem = {};
      }
    };

    this.purchasereturn_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showProcurementsLookUp = false;
      if (change[0][1] === 0) {
        this.showProcurementsLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.purchasereturn_entry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (change != null && change.length > 0) {
        var data = hotinstance.getDataAtRow(change[0][0]);
        if (data[3] != null && data[6] != null && change[0][1] != 'amount' && change[0][1] != 8) {
          const purchaseQty = Number(data[3]) || 0;
          const returnQtyTill = Number(data[4]) || 0;
          const returnQty = Number(data[6]) || 0;
          const price = Number(data[7]) || 0;

          if (purchaseQty >= returnQty) {
            if (returnQtyTill + returnQty > purchaseQty) {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail:
                  'You cannot return this amount because of ReturnQty[Till] Exceeds',
              });
              this.hotRegisterer
                .getInstance(this.hotid)
                .setDataAtCell(change[0][0], 6, 0);
            } else {
              var netAmount = returnQty * price;
              this.hotRegisterer
                .getInstance(this.hotid)
                .setDataAtCell(change[0][0], 8, netAmount);
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Return Qty must be less than net Purchase Qty',
            });
            this.hotRegisterer
              .getInstance(this.hotid)
              .setDataAtCell(change[0][0], 6, 0);
          }
        }
      }
      this.ColumnSum();

      this.GetTotal();
    };
    this.purchasereturn_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum();
      this.GetTotal();
    };

    this.purchasereturn_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }
  initializePurchaseVoucherControls() {
    this.PurchaseVoucherConfig = {
      ...this.utilityService.getTableConfig(purchaseVoucherColumns(this), [3], {
        height: '300px',
      }),
      beforeColumnSort: (currentSort: any[], destinationSort: any[]) => {
        if (destinationSort.length > 0) {
          this.pageDataSet = [];
          const sortConfig = destinationSort[0];
          const colIndex = sortConfig.column;
          const columnName = purchaseVoucherColumns(this)[colIndex]?.data;

          if (!this.sortOrder[columnName]) {
            this.sortOrder[columnName] = 'desc';
          } else {
            this.sortOrder[columnName] =
              this.sortOrder[columnName] === 'asc' ? 'desc' : 'asc';
          }

          this.sortPurchaseVoucherColumn = columnName;
          this.ApplyPurchaseVoucherFilter();
          return false;
        }
      },
    };
  }
  initializePurchaseReturnControls() {
    this.PurchaseReturnConfig = {
      ...this.utilityService.getTableConfig(
        purchaseReturnColumns(this),
        [8, 9],
        {
          height: '300px',
        }
      ),
      beforeColumnSort: (currentSort: any[], destinationSort: any[]) => {
        if (destinationSort.length > 0) {
          this.pageDataSet = [];
          const sortConfig = destinationSort[0];
          const colIndex = sortConfig.column;
          const columnName = purchaseReturnColumns(this)[colIndex]?.data;

          if (!this.sortOrder[columnName]) {
            this.sortOrder[columnName] = 'desc';
          } else {
            this.sortOrder[columnName] =
              this.sortOrder[columnName] === 'asc' ? 'desc' : 'asc';
          }

          this.sortPurchaseReturnColumn = columnName;
          this.GetPurchaseReturnListModel();
          return false;
        }
      },
    };
  }
  globalSearchPurchaseReturn() {
    this.pageDataSet = [];
    this.currentPage = 1;
    this.GetPurchaseReturnListModel();
  }
  GetPurchaseReturnListModel() {
    this.state = {
      Dir: this.sortOrder[this.sortPurchaseReturnColumn] || 'desc',
      Field: this.sortPurchaseReturnColumn || '',
      Skip: this.pageSize * (this.currentPage - 1),
      Take: this.pageSize,
      Search: this.globalPurchaseReturnSearch,
      Filter: this.purchaseReturnfilter,
      FromDate: this.purchaseReturnFromDate,
      ToDate: this.purchaseReturnToDate,
    };

    this.callDropdowns();
    this.procurementapi.GetPurchaseReturnListModel(this.state).subscribe({
      next: (res: any) => {
        // this.Selectedpurchasevoucher = null;
        if (res.valid) {
          this.purchaseReturnarry = res.result.data;
          if (res.result.data.length > 0) {
            this.totalRecords = res.result.total;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            this.pageDataSet[this.currentPage] = res.result.data;
          } else {
            this.totalRecords = res.result.total;
          }

          this.displayMaximizable = true;
        } else {
          this.displayPurchaseOrder = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Failed to load sales return list. Please try again.',
          });
        }
      },
      error: (err) => {
        console.error('API error:', err);
        this.displayPurchaseOrder = false;
        this.purchaseReturnarry = [];
        this.filterArray = [];
        this.totalRecords = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed to load sales return list. Please try again.',
        });
      },
      complete: () => {
        console.log('API call completed');
      },
    });
  }
  globalSearchPurchaseVocuher() {
    this.pageDataSet = [];
    this.currentPage = 1;
    this.ApplyPurchaseVoucherFilter();
  }

  onClickPurchaseVoucherList() {
    this.clearPagination();
    this.ApplyPurchaseVoucherFilter();
  }

  ApplyPurchaseVoucherFilter() {
    this.purchaseVoucherFromDate = null;
    this.purchaseVoucherToDate = null;
    const voucherNo =
      this.PurchasereturnFilterForm.controls.purchaseReturnVoucherNo.value;
    const VoucherType =
      this.PurchasereturnFilterForm.controls.purchaseReturnType.value;
    const isDate = this.PurchasereturnFilterForm.controls.isDate.value;
    const fromDate = this.PurchasereturnFilterForm.controls.fromDate.value;
    const toDate = this.PurchasereturnFilterForm.controls.toDate.value;

    let filters: string[] = [];

    // Voucher filter
    if (voucherNo) {
      filters.push(`purchaseVoucherVoucherNo.Contains(\"${voucherNo}\")`);
    }
    // Customer filter
    if (VoucherType) {
      filters.push(`purchaseVoucherPurchaseType == \"${VoucherType}\"`);
    }

    // Date range filter
    if (isDate && fromDate && toDate) {
      this.purchaseVoucherFromDate = this.utilityService.fromAndToDateformater(
        fromDate,
        'from'
      );
      this.purchaseVoucherToDate = this.utilityService.fromAndToDateformater(
        toDate,
        'to'
      );
    } else {
      this.purchaseVoucherFromDate = null;
      this.purchaseVoucherToDate = null;
    }

    // Combine with AND
    this.purchaseVoucherfilter = filters.join(' AND ');
    this.GetPurchaseVoucherList();
  }
  openCurrency() {
    this.control = this.f.purchaseReturnCurrencyId;
    this.elementReference = this.currencyCtrol;
    this.lookupGridColumns = ['Currency', 'Currency ID'];
    this.formControlLookUp = true;
    this.selectItem = {
      procurements: this.currencyCtrol.nativeElement.value,
      procurementsId: this.f.purchaseReturnCurrencyId.value,
    };
    this.dataList = this.currencyLookup;
  }

  ///// Khadim
  selectprocurements(evt) {
    this.showProcurementsLookUp = false;
  }

  exit(evt) {
    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
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

    this.masterapi.GetAllSupplierById(evt.procurementsId).subscribe((k) => {
      this.SupplierMasterArrayById = k.result;
      this.PurchasereturnFormGroup.controls.purchaseVoucherPartyName.setValue(
        this.SupplierMasterArrayById.suppliersMasterSupplierName
      );
      this.PurchasereturnFormGroup.controls.purchaseVoucherPartyAddress.setValue(
        this.SupplierMasterArrayById?.suppliersMasterSupplierAddress
          ? this.SupplierMasterArrayById?.suppliersMasterSupplierAddress
          : ''
        // (
        //   this.SupplierMasterArrayById.suppliersMasterSupplierPoBox +
        //   ' ,' +
        //   this.SupplierMasterArrayById?.suppliersMasterSupplierTel1 +
        //   ',' +
        //   this.SupplierMasterArrayById.suppliersMasterSupplierMobile
        // ).toString()
      );
      this.PurchasereturnFormGroup.controls.purchaseVoucherPartyVatNo.setValue(
        this.SupplierMasterArrayById.suppliersMasterSupplierVatNo
      );
    });
  }
  hide(evt: boolean) {
    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
  }

  public getSalesManName(id: number): string {
    return this.SalesManMasterArray?.find(
      (j) => j?.salesManMasterSalesManId === id
    )?.salesManMasterSalesManName;
  }

  public getLocationName(id: number): string {
    return this.locationArray?.find((j) => j?.locationMasterLocationId === id)
      ?.locationMasterLocationName;
  }

  openJobs() {
    this.control = this.f.purchaseReturnJobId;
    this.elementReference = this.jobCtrol;
    this.lookupGridColumns = ['Job', 'Job ID'];
    this.formControlLookUp = true;
    this.selectItem = {
      procurements: this.jobCtrol.nativeElement.value,
      procurementsId: this.f.purchaseReturnJobId.value,
    };
    this.dataList = this.jobsLookup;
  }

  openLocation() {
    this.control = this.f.purchaseReturnLocationId;
    this.elementReference = this.locationCtrol;
    this.lookupGridColumns = ['Location', 'Location ID'];
    this.formControlLookUp = true;
    this.selectItem = {
      procurements: this.locationCtrol.nativeElement.value,
      procurementsId: this.f.purchaseReturnLocationId.value,
    };
    this.dataList = this.locationLookup;
  }

  onRowSelect(id) {
    this.displayPurchaseOrder = false;
    this.SetPurchaseOrderDetails(id);
  }

  openSupplier() {
    this.control = this.f.purchaseReturnPartyId;
    this.elementReference = this.supplierCtrol;
    this.lookupGridColumns = ['Supplier', 'Supplier ID'];
    this.formControlLookUp = true;
    this.selectItem = {
      procurements: '',
      procurementsId: this.f.purchaseReturnPartyId.value,
    };
    this.dataList = this.supplierLookup;
  }

  ColumnSum() {
    var disc = 0;
    this.purchasereturn_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.disc) {
        disc += elemt.disc;
      }
    });
    disc = parseFloat(disc.toFixed(2));
    this.purchaseReturnFormGroup.controls.purchaseReturnTotalItemDisAmount.setValue(
      disc
    );
    var value = 0;
    this.purchasereturn_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.amount) {
        value += elemt.amount;
      }
    });
    value = parseFloat(value.toFixed(2));
    this.purchaseReturnFormGroup.controls.purchaseReturnTotalGrossAmount.setValue(
      value
    );
    this.GetTotal();
  }

  CalcDiscFromPer() {
    this.purchaseReturnFormGroup.controls.purchaseReturnTotalDisAmount.setValue(
      parseFloat(
        (
          (Number(
            this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount
          ) *
            Number(
              this.purchaseReturnFormGroup.value.purchaseReturnTotalDisPer
            )) /
          100
        ).toFixed(2)
      )
    );
    this.GetTotal();
  }

  CalcDiscFromAmt() {
    this.purchaseReturnFormGroup.controls.purchaseReturnTotalDisPer.setValue(
      parseFloat(
        (
          (Number(
            this.purchaseReturnFormGroup.value.purchaseReturnTotalDisAmount
          ) *
            100) /
          Number(
            this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount
          )
        ).toFixed(2)
      )
    );
    this.GetTotal();
  }

  GetTotal($event = null) {
    if (this.purchaseReturnFormGroup.value.purchaseReturnExcludeVat == true) {
      this.purchaseReturnFormGroup.value.purchaseReturnVatPer = 0;
    } else {
      this.purchaseReturnFormGroup.value.purchaseReturnVatPer = 5;
    }

    this.purchaseReturnFormGroup.controls.purchaseReturnTotalActualAmount.setValue(
      parseFloat(
        (
          Number(
            this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount
          ) -
          Number(
            this.purchaseReturnFormGroup.value.purchaseReturnTotalDisAmount
          )
        ).toFixed(2)
      )
    );

    this.purchaseReturnFormGroup.controls.purchaseReturnVatAmt.setValue(
      parseFloat(
        (
          (Number(
            this.purchaseReturnFormGroup.value.purchaseReturnTotalActualAmount
          ) *
            Number(this.purchaseReturnFormGroup.value.purchaseReturnVatPer)) /
          100
        ).toFixed(2)
      )
    );

    if (this.purchaseReturnFormGroup.value.purchaseReturnVatRoundSign == '+') {
      this.purchaseReturnFormGroup.controls.purchaseReturnNetAmount.setValue(
        parseFloat(
          (
            Number(
              this.purchaseReturnFormGroup.value.purchaseReturnTotalActualAmount
            ) +
            Number(this.purchaseReturnFormGroup.value.purchaseReturnVatAmt) +
            Number(this.purchaseReturnFormGroup.value.purchaseReturnVatRountAmt)
          ).toFixed(2)
        )
      );
    } else if (
      this.purchaseReturnFormGroup.value.purchaseReturnVatRoundSign == '-'
    ) {
      this.purchaseReturnFormGroup.controls.purchaseReturnNetAmount.setValue(
        parseFloat(
          (
            Number(
              this.purchaseReturnFormGroup.value.purchaseReturnTotalActualAmount
            ) +
            Number(this.purchaseReturnFormGroup.value.purchaseReturnVatAmt) -
            Number(this.purchaseReturnFormGroup.value.purchaseReturnVatRountAmt)
          ).toFixed(2)
        )
      );
    } else {
      this.purchaseReturnFormGroup.value.purchaseReturnVatRoundSign = '-';
    }
  }
  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((r: any) => {
      this.jobArray = r.resultSet.jobMasters;
      this.jobList = r.resultSet.jobMasters.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
    });
  }
  LoadCostCentreDDL() {
    this.utilityService.LoadDropdowncostcenterMasters().subscribe((m: any) => {
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl: any) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
    });
  }
  LoadChartofAccountDDL() {
    this.utilityService.LoadDropdowchartofAccounts().subscribe((r: any) => {
      this.accountArray = r.resultSet.masterAccountsTables;
      this.accountList = r.resultSet.masterAccountsTables?.map((kl: any) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
    });
  }
  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((r: any) => {
      this.units = r.resultSet.unitMasters;
      this.unitListt = r.resultSet.unitMasters?.map((kl: any) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
    });
  }
  LoadItemDDL() {
    this.accountapi.LoadDropdownItemMaster().subscribe((r: any) => {
      this.ItemMasterArray = r.resultSet.itemMaster;
      this.ItemMasterList = r.resultSet.itemMaster?.map((kl: any) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
    });
  }
  LoadSupplierDDL() {
    this.utilityService.LoadDropdownSuppliersMaster().subscribe((r: any) => {
      this.SupplierMasterArray = r.resultSet.suppliersMaster;
      this.SupplierMasterList = r.resultSet.suppliersMaster?.map((kl: any) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.SupplierMasterList.unshift({
        label: '--Select Supplier--',
        value: -1,
      });
    });
  }
  LoadLocationDDL() {
    this.utilityService.LoadDropdownLocationMaster().subscribe((r: any) => {
      const list = r?.resultSet?.locationMaster ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationLocked = this.utilityService.applyLocationLock(
        this.purchaseReturnFormGroup,
        'purchaseReturnLocationId'
      );
    });
  }
  LoadCurrancyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((r: any) => {
      this.currArry = r.resultSet.suppliersMaster;
      this.currencyList = r.resultSet.suppliersMaster?.map((kl: any) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
    });
  }
  LoadAccountSettingDDL() {
    this.utilityService.LoadDropdownaccountsSettings().subscribe((r: any) => {
      var res = r.resultSet.accountsSettings;
      const splitText = res?.find(
        (x: any) =>
          x.accountSettingsAccountDescription == 'Purchase Return Account'
      )?.accountSettingsAccountTextValue;
      const parts = splitText.split('::');
      this.purchaseReturnAccount = parts[1]?.trim();

      const splitText1 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Vat Input'
      )?.accountSettingsAccountTextValue;
      const parts1 = splitText1.split('::');
      this.payableVatAccount = parts1[1]?.trim();

      const splitText12 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Cash Account'
      )?.accountSettingsAccountTextValue;
      const parts12 = splitText12.split('::');
      this.cashAccount = parts12[1]?.trim();

      const splitText5 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Round Off'
      )?.accountSettingsAccountTextValue;
      const parts5 = splitText5.split('::');
      this.RoundOffAccount = parts5[1]?.trim();
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  get currencyLookup() {
    return this.currencyList.map((kl) => ({
      procurements: kl.label,
      procurementsId: kl.value,
    }));
  }
  get jobsLookup() {
    return this.jobList.map((kl) => ({
      procurements: kl.label,
      procurementsId: kl.value,
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
  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl.itemMasterItemName,
      procurementsId: kl.itemMasterItemId,
    }));
  }

  get itemIDSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl.itemMasterItemName,
      procurementsId: kl.itemMasterItemId,
    }));
  }

  get unitSetLookup() {
    return this.units.map((kl) => ({
      procurements: kl?.unitMasterUnitShortName,
      procurementsId: kl.unitMasterUnitId,
    }));
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
    // this.dataset
  }

  userTrackingLog(type, vno?: any) {
    let req = {
      page: ' Purchase Return ',
      // section: this.savedPurchaseReturn,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: vno,
      vpType: ' Purchase Return ',
      vpUserId: this.permission.getUser()?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  printAsPDF() {
    // let html: any = document.getElementById('print');
    var css: string = `

      .middle {
        padding-left: 150px;

    }

    .heading {
        text-align: center;
        color: brown;
    }

    .w-100 {
        width: 100%;
    }

    .w-80 {
        width: 90%;
    }

    .flex {
        display: flex;
        margin-bottom: 5px;
        gap: 2px;
        /* Adjusted the gap value here */
    }

    .contain1 {
        width: 19.5%;
        border-radius: 1px;
        padding: 8px;
    }

    .contain2 {
        width: 79.5%;
        border-radius: 1px;
        padding-bottom: 0%;
        padding: 8px;
    }

    .bank2 {
        border: 2.5px solid rgb(201, 204, 204);
        width: 49.5%;
        margin-bottom: 5px;
        border-radius: 1px;
        padding: 8px;
        box-shadow: 5px 5px rgb(201, 204, 204);
    }

    .w70 {
        width: 220px;
    }

    .bank1 {
        border: 2.5px solid rgb(201, 204, 204);
        width: 49%;
        margin-bottom: 5px;
        border-radius: 1px;
        padding: 8px;
        padding-bottom: 0%;
        box-shadow: 5px 5px rgb(201, 204, 204);
    }

      .p-1 {
          padding: 7px;
      }



      .f-r {
          float: right;
      }



      #customers {
          font-family: Arial, Helvetica, sans-serif;
          border-collapse: collapse;
          width: 100%;
          border: 1px solid rgb(212, 212, 212);
      }

      #customers td {
          border-bottom: 1px solid rgb(212, 212, 212);
          padding: 8px;
      }

      #customers th {
          border: 1px solid rgb(212, 212, 212);
          padding: 8px;
          background-color: #d9cece;

      }

      .info {

          margin: auto;
          border-bottom: 2px solid;
          display: flex;
          justify-content: center;
          gap: 5px;
          margin: 3px;
      }

      .header {

          margin: auto;
          display: block;
          text-align: center;
      }

      .border {
          border: 1px solid  rgb(212, 212, 212);
          margin-bottom: 5px;

      }

      .tableLR {
          display: flex;
          flex-direction: column;
          gap: 5px;
      }
                .rectImg {
            height: 140px;
            width: 217px;
           }

    .squreImg {
          height: 145px;
          width: 145px;
        }

      .checkby {
          display: flex;
          gap: 70px;

      }

      .sn {
          min-width: 150px;
          border-top: dotted;
          text-align: center;
      }

@media print {
  body * {
      display: block;
  }

  #print {
      display: block;
      font-size: 11px
  }
}

    `;
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
  }

  getEmptyRowCount(length): number {
    const DetailsLength = length || 0;
    return Math.max(0, 10 - DetailsLength);
  }
  savePurchaseReturn() {
    this.purchaseReturnFormGroup.markAllAsTouched();

    const savedData: any = this.purchasereturn_entry.data;
    const purchaseReturn_Save: PurchaseReturn = this.purchaseReturnFormGroup
      .value as PurchaseReturn;
    purchaseReturn_Save.purchaseReturnId = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnId
    );

    purchaseReturn_Save.purchaseReturnNo =
      this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo;
    purchaseReturn_Save.purchaseReturnDate =
      this.purchaseReturnFormGroup.value.purchaseReturnDate;
    purchaseReturn_Save.purchaseReturnRefNo =
      this.purchaseReturnFormGroup.value.purchaseReturnRefNo;
    purchaseReturn_Save.purchaseReturnSupInvNo =
      this.purchaseReturnFormGroup.value.purchaseReturnSupInvNo;
    purchaseReturn_Save.purchaseReturnCurrencyId =
      this.purchaseReturnFormGroup.value.purchaseReturnCurrencyId;
    purchaseReturn_Save.purchaseReturnExcludeVat =
      this.purchaseReturnFormGroup.value.purchaseReturnExcludeVat;
    //purchaseReturn_Save.purchaseReturnExcludeVat = true;

    purchaseReturn_Save.purchaseReturnType =
      this.purchaseReturnFormGroup.value.purchaseReturnType;
    //purchaseReturn_Save.purchaseReturnType = 'CASH';

    purchaseReturn_Save.purchaseReturnPartyId =
      this.purchaseReturnFormGroup.value.purchaseReturnPartyId;
    //  purchaseReturn_Save.purchaseReturnPartyName = this.purchaseReturnFormGroup.value.purchaseReturnPartyName;
    purchaseReturn_Save.purchaseReturnPartyName =
      this.purchaseReturnFormGroup.value.purchaseReturnPartyName;
    purchaseReturn_Save.purchaseReturnPartyAddress =
      this.purchaseReturnFormGroup.value.purchaseReturnPartyAddress;
    purchaseReturn_Save.purchaseReturnPartyVatNo =
      this.purchaseReturnFormGroup.value.purchaseReturnPartyVatNo;
    purchaseReturn_Save.purchaseReturnDescription =
      this.purchaseReturnFormGroup.value.purchaseReturnDescription;

    purchaseReturn_Save.purchaseReturnGrno =
      this.purchaseReturnFormGroup.value.purchaseReturnGrno;
    purchaseReturn_Save.purchaseReturnGrdate =
      this.purchaseReturnFormGroup.value.purchaseReturnGrdate;
    purchaseReturn_Save.purchaseReturnLpono =
      this.purchaseReturnFormGroup.value.purchaseReturnLpono;
    purchaseReturn_Save.purchaseReturnLpodate =
      this.purchaseReturnFormGroup.value.purchaseReturnLpodate;
    purchaseReturn_Save.purchaseReturnQtnNo =
      this.purchaseReturnFormGroup.value.purchaseReturnQtnNo;
    purchaseReturn_Save.purchaseReturnQtnDate =
      this.purchaseReturnFormGroup.value.purchaseReturnQtnDate;

    purchaseReturn_Save.purchaseReturnPono = String(
      this.purchaseReturnFormGroup.value.purchaseReturnPono
    );
    purchaseReturn_Save.purchaseReturnBatchCode =
      this.purchaseReturnFormGroup.value.purchaseReturnBatchCode;
    purchaseReturn_Save.purchaseReturnDayBookNo =
      this.purchaseReturnFormGroup.value.purchaseReturnDayBookNo;
    purchaseReturn_Save.purchaseReturnLocationId =
      this.purchaseReturnFormGroup.get('purchaseReturnLocationId')?.value;
    purchaseReturn_Save.purchaseReturnJobId =
      this.purchaseReturnFormGroup.value.purchaseReturnJobId;

    purchaseReturn_Save.purchaseReturnTotalGrossAmount = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount
    );
    purchaseReturn_Save.purchaseReturnTotalItemDisAmount = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalItemDisAmount
    );
    purchaseReturn_Save.purchaseReturnTotalDisPer = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalDisPer
    );
    purchaseReturn_Save.purchaseReturnTotalDisAmount = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalDisAmount
    );
    purchaseReturn_Save.purchaseReturnVatPer = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnVatPer
    );
    purchaseReturn_Save.purchaseReturnVatAmt = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnVatAmt
    );
    purchaseReturn_Save.purchaseReturnTotalActualAmount = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalActualAmount
    );
    purchaseReturn_Save.purchaseReturnVatRoundSign =
      this.purchaseReturnFormGroup.value.purchaseReturnVatRoundSign;
    //purchaseReturn_Save.purchaseReturnVatRoundSign = '-';
    purchaseReturn_Save.purchaseReturnVatRountAmt = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnVatRountAmt
    );
    purchaseReturn_Save.purchaseReturnNetAmount = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnNetAmount
    );

    purchaseReturn_Save.purchaseReturnDetails = savedData
      ?.filter((k) => k.id != null)
      ?.map((k: any) => {
        // console.log('k', k);
        return {
          purchaseReturnDetailsId: k.id != null ? k.id : 0,
          purchaseReturnId: this.purchaseReturnFormGroup.value.purchaseReturnId
            ? this.purchaseReturnFormGroup.value.purchaseReturnId
            : 0,
          purchaseReturnDetailsNo:
            this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo,
          purchaseReturnDetailsMatId:
            k.materialName != null && k.materialName !== ''
              ? this.ItemMasterArray?.find(
                  (j) =>
                    j?.itemMasterItemName?.trim() === k.materialName?.trim()
                )?.itemMasterItemId
              : null,
          purchaseReturnDetailsItemName: k.materialName,
          purchaseReturnDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                  (j) => j?.unitMasterUnitShortName?.trim() === k.unit?.trim()
                )?.unitMasterUnitId
              : null,

          purchaseReturnDetailsQuantity: k.returnQty,
          purchaseReturnDetailsRate: k.price,
          purchaseReturnDetailsDiscAmount: k.amount,
          purchaseReturnDetailsNetAmt: k.netAmt,
          purchaseOrderPurchaseQTY: k.purchaseQty,
          purchaseReturnNetStock: k.netStock,
          purchaseReturnQtyTill: k.returnQtyTill,
        };

        // return {
        //   purchaseReturnDetailsId: k.id != null ? k.id : 0,
        //   purchaseReturnDetailsNo: this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo,

        //   purchaseReturnId: this.purchaseReturnFormGroup.value.purchaseReturnId? this.purchaseReturnFormGroup.value.purchaseReturnId:0,
        //   // purchaseReturnDetailsMatId: k.code,
        //     purchaseReturnDetailsMatId: k.materialName != null && k.materialName !== '' ? this.ItemMasterArray
        //     ?.find(j => j?.itemMasterItemName?.trim() === k.materialName?.trim())?.itemMasterItemId : null,
        //   purchaseReturnDetailsQuantity: k.returnQty,
        //   purchaseReturnDetailsDiscAmount: k.amount,
        //   purchaseReturnDetailsRate: k.price,
        //   purchaseReturnDetailsNetAmt: k.netAmt,
        //   // purchaseReturnDetailsGrossAmount: 0,
        //   purchaseReturnDetailsNetAmount: k.amount,
        //   // purchaseReturnDetailsJobNo: k.jobname != null && k.jobname !== '' ? this.jobArray
        //   // ?.find(j => j.jobMasterJobName?.trim()  === k.jobname?.trim()).jobMasterId : null,
        //   // purchaseReturnDetailsCostCenterId: k.costcenter != null && k.costcenter !== '' ? this.costcenterArray
        //   // ?.find(j => j.costCenterMasterCostCenterName?.trim()  === k.costcenter?.trim()).costCenterMasterCostCenterId : null,
        //   purchaseReturnDetailsRemarks: k.narration,
        //   purchaseReturnDetailsSno: 0,

        //   purchaseReturnDetailsUnitId: k.unit != null && k.unit !== '' ? this.unitArray
        //     ?.find(j => j?.unitMasterUnitShortName?.trim() === k.unit?.trim())?.unitMasterUnitId : null,

        //   // purchaseReturnDetailsUnitId: this.unitListt?.find(l => l.label == k.unit)?.value,

        //   purchaseReturnDetailsDelStatus: false
        // };
      });

    // if (this.btnFlag.update) {
    //   // purchaseReturn_Save.purchaseReturnDetails = this.savedPurchaseReturn.purchaseReturnDetails;
    //   deletedGridData = this.savedPurchaseReturn.purchaseReturnDetails?.filter(
    //     (k) => {
    //       if (
    //         !purchaseReturn_Save.purchaseReturnDetails.some(
    //           (l) => l.purchaseReturnDetailsId === k.purchaseReturnDetailsId
    //         )
    //       ) {
    //         k.purchaseReturnDetailsDelStatus = true;
    //         return k;
    //       }
    //     }
    //   );
    //   if (deletedGridData.length > 0) {
    //     purchaseReturn_Save.purchaseReturnDetails.push(...deletedGridData);
    //   }
    // }
    purchaseReturn_Save.accountsTransactions = [];

    //supplier

    const creditData: AccountsTransactions = {
      accountsTransactionsAccNo:
        this.purchaseReturnFormGroup.value.purchaseReturnType == 'CASH'
          ? this.cashAccount
          : this.SupplierMasterArray?.find(
              (o) =>
                o.suppliersMasterSupplierId ===
                this.purchaseReturnFormGroup.value.purchaseReturnPartyId
            )?.suppliersMasterSupplierReffAcNo,
      accountsTransactionsTransDate: this.f.purchaseReturnDate.value,
      accountsTransactionsParticulars: '', //this.purchaseReturnFormGroup.value.purchaseReturnDescription,
      accountsTransactionsDebit: Number(
        this.purchaseReturnFormGroup.value.purchaseReturnNetAmount
      ),
      accountsTransactionsFcDebit: Number(
        this.purchaseReturnFormGroup.value.purchaseReturnNetAmount
      ),
      accountsTransactionsAllocBalance:
        this.purchaseReturnFormGroup.value.purchaseReturnNetAmount,
      accountsTransactionsFcAllocBalance: Number(
        this.purchaseReturnFormGroup.value.purchaseReturnNetAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo,
      accountsTransactionsDescription: '',
      // this.purchaseReturnFormGroup.value.purchaseReturnDescription,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
    };
    purchaseReturn_Save.accountsTransactions.push(creditData);
    ///purchase
    const debitData: AccountsTransactions = {
      accountsTransactionsAccNo: this.purchaseReturnAccount,
      accountsTransactionsTransDate: this.f.purchaseReturnDate.value,
      accountsTransactionsParticulars: '', //this.purchaseReturnFormGroup.value.purchaseReturnDescription,
      accountsTransactionsCredit: Number(
        this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount
      ),
      accountsTransactionsFcCredit: Number(
        this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount
      ),
      accountsTransactionsAllocBalance:
        this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount,
      accountsTransactionsFcAllocBalance: Number(
        this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo,
      accountsTransactionsDescription: '', //this.purchaseReturnFormGroup.value.purchaseReturnDescription,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,

      accountsTransactionsUserId: this.userId,
    };
    purchaseReturn_Save.accountsTransactions.push(debitData);
    //vat
    const VatData: AccountsTransactions = {
      accountsTransactionsAccNo: this.payableVatAccount,
      accountsTransactionsTransDate: this.f.purchaseReturnDate.value,
      accountsTransactionsParticulars: '',
      // this.purchaseReturnFormGroup.value.purchaseReturnDescription,
      accountsTransactionsCredit: Number(
        this.purchaseReturnFormGroup.value.purchaseReturnVatAmt
      ),
      accountsTransactionsFcCredit: Number(
        this.purchaseReturnFormGroup.value.purchaseReturnVatAmt
      ),
      accountsTransactionsAllocBalance:
        this.purchaseReturnFormGroup.value.purchaseReturnVatAmt,
      accountsTransactionsFcAllocBalance: Number(
        this.purchaseReturnFormGroup.value.purchaseReturnVatAmt
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo,
      accountsTransactionsDescription: '',
      //this.purchaseReturnFormGroup.value.purchaseReturnDescription,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
    };
    purchaseReturn_Save.accountsTransactions.push(VatData);

    if (this.btnFlag.save) {
      this.saveVoucher(purchaseReturn_Save);
    } else {
      // deletedAccountTrans =
      //   this.savedPurchaseReturn.accountsTransactions?.filter((k) => {
      //     k.accountstransactionsDelStatus = true;
      //     return k;
      //   });
      // if (deletedAccountTrans.length > 0) {
      //   purchaseReturn_Save.accountsTransactions.push(...deletedAccountTrans);
      // }

      // purchaseReturn_Save.accountsTransactions?.filter((x) => x.accountsTransactionsTransSno != 0)
      //   .forEach((element, index, arry) => {
      //     arry[index].accountstransactionsDelStatus = true;
      //   });
      this.updateVoucher(purchaseReturn_Save);
    }
  }

  validateTotalDrCrAmounts(): boolean {
    if (
      this.purchaseReturnFormGroup.getRawValue()
        .purchaseReturnTotalGrossAmount == 0 &&
      this.purchaseReturnFormGroup.getRawValue()
        .purchaseReturnTotalItemDisAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    if (
      this.purchaseReturnFormGroup.getRawValue()
        .purchaseReturnTotalGrossAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total  Gross Amount Is Zero',
      });
      return false;
    }

    return true;
  }

  saveVoucher(purchaseReturn_Save: PurchaseReturn) {
    //console.log('save value', purchaseReturn_Save);
    if (this.purchaseReturnFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.procurementapi
              .InsertPurchaseReturn(purchaseReturn_Save)
              .subscribe(
                (data) => {
                  this.btnFlag = {
                    edit: true,
                    cancel: false,
                    save: false,
                    update: true,
                    delete: true,
                  };
                  this.savedPurchaseReturn = data.result;
                  this.updateFormGrid(data.result);
                  this.userTrackingLog('Update', data.result?.purchaseReturnNo);

                  if (data.valid) {
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Alert',
                      detail: data.message,
                    });
                  } else if (data.error) {
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Alert',
                      detail:
                        data.message != null && data.message?.trim() !== ''
                          ? data.message
                          : data.exception,
                    });
                  }
                },
                (err) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail: 'Payment Voucher Save Failed',
                  });
                }
              );
          }
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.purchaseReturnFormGroup.markAllAsTouched();
      this.purchaseReturnFormGroup.markAsDirty();
    }
  }

  updateVoucher(purchaseReturn_Save: PurchaseReturn) {
    if (this.purchaseReturnFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.procurementapi
              .UpdatePurchaseReturn(purchaseReturn_Save)
              .subscribe(
                (data) => {
                  this.btnFlag = {
                    edit: true,
                    cancel: false,
                    save: false,
                    update: true,
                    delete: true,
                  };
                  this.updateFormGrid(data.result);
                  this.userTrackingLog('Update', data.result?.purchaseReturnNo);
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Alert',
                    detail: 'Purchase Return Updated Succesfully',
                  });
                },
                (err) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail: 'Purchase Return Update Failed',
                  });
                }
              );
          }
        },
      });
    } else {
      // const msg1 = 'Please fill mandatory fields';
      // const msg2 = 'Please fill Empyt Debit account details';
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.purchaseReturnFormGroup.markAllAsTouched();
      this.purchaseReturnFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAccountSetting() {
    this.masterapi.getAccountSetting().subscribe((res: any) => {
      const splitText = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Purchase Return Account'
      )?.accountSettingsAccountTextValue;
      const parts = splitText.split('::');
      this.purchaseReturnAccount = parts[1]?.trim();

      const splitText1 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Vat Input'
      )?.accountSettingsAccountTextValue;
      const parts1 = splitText1.split('::');
      this.payableVatAccount = parts1[1]?.trim();
    });
  }

  getAllPurchaseReturn() {
    this.purchaseReturnarry = [];
    this.procurementapi.GetPurchaseReturn().subscribe((data) => {
      this.purchaseReturnarry = data.result;
      this.displayMaximizable = true;
    });
  }

  getDefaultCurrency() {
    this.utilityService
      .GetGeneralSettingbyKey('DEFAULTCURRENCY')
      .subscribe((data: any) => {
        if (data !== null) {
          this.DefCurCheck = data.result[0].generalSettingsTextValue;
          if (this.DefCurCheck !== null) {
            const splitText = this.DefCurCheck.split('::');
            this.DefCurrency = splitText[1]?.trim();
            this.f.purchaseReturnCurrencyId.setValue(Number(this.DefCurrency));
          }
        }
      });
  }

  getDefaultLocation() {
    this.utilityService
      .GetGeneralSettingbyKey('DEFAULT_LOCATION')
      .subscribe((data: any) => {
        if (data !== null) {
          this.DefLocCheck = data.result[0].generalSettingsTextValue;
          if (this.DefLocCheck !== null) {
            const splitText = this.DefLocCheck.split('::');
            this.DefLocid = splitText[1]?.trim();
            // this.f.purchaseReturnLocationId.setValue(Number(this.DefLocid));
            if (!this.locationLocked) {
              this.f.purchaseReturnLocationId.setValue(this.defaultLocationID);
            }
          }
        }
      });
  }

  DisplayPurchaseOrder1() {
    this.purchaseVoucherarry = [];
    this.procurementapi.GetPurchaseVoucher().subscribe((data: any) => {
      this.Selectedpurchasevoucher = null;
      this.purchaseVoucherarry = data.result;
      this.filterArray = data.result;
      this.displayPurchaseOrder = true;
    });
  }

  GetPurchaseVoucherList() {
    this.state = {
      Dir: this.sortOrder[this.sortPurchaseVoucherColumn] || 'desc',
      Field: this.sortPurchaseVoucherColumn || '',
      Skip: this.pageSize * (this.currentPage - 1),
      Take: this.pageSize,
      Search: this.globalPurchaseVoucherSearch,
      Filter: this.purchaseVoucherfilter,
      FromDate: this.purchaseVoucherFromDate,
      ToDate: this.purchaseVoucherToDate,
    };
    this.procurementapi.GetPurchaseVoucherList(this.state).subscribe({
      next: (res: any) => {
        if (res.valid) {
          this.purchaseVoucherarry = res.result.data;
          this.filterArray = res.result.data;
          if (res.result.data.length > 0) {
            this.totalRecords = res.result.total;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            this.pageDataSet[this.currentPage] = res.result.data;
          } else {
            this.totalRecords = res.result.total;
          }
          this.displayPurchaseOrder = true;
        } else {
          this.displayPurchaseOrder = false;
          this.purchaseVoucherarry = [];
          this.filterArray = [];
          this.totalRecords = 0;
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Failed to load sales voucher list. Please try again.',
          });
        }
      },
      error: (err) => {
        console.error('API error:', err);
        this.purchaseVoucherarry = [];
        this.filterArray = [];
        this.totalRecords = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed to load sales voucher list. Please try again.',
        });
      },
      complete: () => {
        console.log('API call completed');
      },
    });
  }
  SetPurchaseOrderDetails(voucherNo: string) {
    this.procurementapi.GetSavedPurchaseVoucherDetails(voucherNo).subscribe(
      (data: any) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: true,
            update: false,
            delete: true,
          };
          this.accountTransactionList = data.result.accountsTransactions;
          this.updateFormGrid1(data.result);
          // this.displayPurchaseOrder = false;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Purchase  not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed'),
        });
        this.purchaseReturnFormGroup.updateValueAndValidity();
      }
    );
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j?.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j?.itemMasterItemId === itemMasterItemId
    )?.itemMasterItemName;
  }

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }

  new() {
    this.callDropdowns();
    this.purchaseReturnFormGroup.reset();
    this.purchasereturn_entry.data = [];
    this.purchasereturn_entry.readOnly = false;
    (this.supplierCtrol.nativeElement.value = ''),
      this.purchaseReturnFormGroup.controls.purchaseReturnVatRoundSign.setValue(
        '-'
      );
    this.purchaseReturnFormGroup.controls.purchaseReturnType.setValue('CREDIT');

    this.purchaseReturnFormGroup.controls.purchaseReturnVatPer.setValue(5);
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.purchasereturn_entry);
    this.accountTransactionList = [];
    this.purchaseReturnFormGroup.get('purchaseReturnId').setValue(null);
    this.purchaseReturnFormGroup.get('purchaseReturnPartyId').setValue(-1);
    this.purchaseReturnFormGroup.get('purchaseReturnJobId').setValue(-1);
    this.purchaseReturnFormGroup.get('purchaseReturnCurrencyId').setValue(-1);
    this.purchaseReturnFormGroup
      .get('purchaseReturnLocationId')
      .setValue(this.defaultLocationID);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.getDefaultCurrency();
    this.getDefaultLocation();
    this.index = 0;
    this.purchaseReturnFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseReturnFormGroup,
      'purchaseReturnLocationId',
      this.locationLocked
    );
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.purchaseReturnFormGroup,
        'purchaseReturnLocationId'
      );
    }
    this.f.purchaseReturnNo.clearValidators();
    this.purchaseReturnFormGroup.updateValueAndValidity();
  }

  showMaximizableDialog() {
    this.getAllPurchaseReturn();
  }

  updateFormGrid(purchasereturn_update: PurchaseReturn) {
    this.purchaseReturnFormGroup.patchValue({
      purchaseReturnId: purchasereturn_update.purchaseReturnId,
      purchaseReturnNo: purchasereturn_update.purchaseReturnNo,
      purchaseReturnDate: new Date(purchasereturn_update.purchaseReturnDate),
      purchaseReturnRefNo: purchasereturn_update.purchaseReturnRefNo,
      purchaseReturnSupInvNo: purchasereturn_update.purchaseReturnSupInvNo,
      purchaseReturnCurrencyId: purchasereturn_update.purchaseReturnCurrencyId,
      purchaseReturnExcludeVat: purchasereturn_update.purchaseReturnExcludeVat,

      purchaseReturnType: purchasereturn_update.purchaseReturnType,
      purchaseReturnPartyId: purchasereturn_update.purchaseReturnPartyId,
      purchaseReturnPartyName: purchasereturn_update.purchaseReturnPartyName,
      purchaseReturnPartyAddress:
        purchasereturn_update.purchaseReturnPartyAddress,
      purchaseReturnPartyVatNo: purchasereturn_update.purchaseReturnPartyVatNo,
      purchaseReturnDescription:
        purchasereturn_update.purchaseReturnDescription,

      purchaseReturnGrno: purchasereturn_update.purchaseReturnGrno,
      purchaseReturnGrdate:
        purchasereturn_update.purchaseReturnGrdate != null
          ? new Date(purchasereturn_update.purchaseReturnGrdate)
          : null,
      purchaseReturnLpono: purchasereturn_update.purchaseReturnLpono,
      purchaseReturnLpodate:
        purchasereturn_update.purchaseReturnLpodate != null
          ? new Date(purchasereturn_update.purchaseReturnLpodate)
          : null,
      purchaseReturnQtnNo: purchasereturn_update.purchaseReturnQtnNo,
      purchaseReturnQtnDate:
        purchasereturn_update.purchaseReturnQtnDate != null
          ? new Date(purchasereturn_update.purchaseReturnQtnDate)
          : null,

      purchaseReturnPono: purchasereturn_update.purchaseVoucherPONo,
      purchaseReturnBatchCode: purchasereturn_update.purchaseReturnBatchCode,
      purchaseReturnDayBookNo: purchasereturn_update.purchaseReturnDayBookNo,
      purchaseReturnLocationId: this.defaultLocationID,
      purchaseReturnJobId: purchasereturn_update.purchaseReturnJobId,

      purchaseReturnTotalGrossAmount:
        purchasereturn_update.purchaseReturnTotalGrossAmount,
      purchaseReturnTotalItemDisAmount:
        purchasereturn_update.purchaseReturnTotalItemDisAmount,
      purchaseReturnTotalDisPer:
        purchasereturn_update.purchaseReturnTotalDisPer,
      purchaseReturnTotalDisAmount:
        purchasereturn_update.purchaseReturnTotalDisAmount,
      purchaseReturnVatPer: purchasereturn_update.purchaseReturnVatPer,
      purchaseReturnVatAmt: purchasereturn_update.purchaseReturnVatAmt,
      purchaseReturnTotalActualAmount:
        purchasereturn_update.purchaseReturnTotalActualAmount,
      purchaseReturnVatRoundSign:
        purchasereturn_update.purchaseReturnVatRoundSign,
      purchaseReturnVatRountAmt:
        purchasereturn_update.purchaseReturnVatRountAmt,
      purchaseReturnNetAmount: purchasereturn_update.purchaseReturnNetAmount,
    });
    this.supplierCtrol.nativeElement.value = this.SupplierMasterList?.find(
      (k) => k.value === purchasereturn_update.purchaseReturnPartyId
    )?.label;

    this.accountTransactionList = purchasereturn_update.accountsTransactions;
    const gridData: GridData[] =
      purchasereturn_update.purchaseReturnDetails.map((k) => {
        const ItemId: string =
          k.purchaseReturnDetailsMatId != null
            ? this.ItemMasterList?.find(
                (l) => l.value == k.purchaseReturnDetailsMatId
              )?.label
            : null;
        var UnitId: any = this.units?.find(
          (l) => l.unitMasterUnitId == k.purchaseReturnDetailsUnitId
        );
        this.purchaseOrderQuanity = k.purchaseReturnDetailsQuantity;
        this.purchaeOrderRate = k.purchaseReturnDetailsRate;
        this.purchaseOrderNetAmt = k.purchaseReturnDetailsNetAmt;

        return {
          code: k?.purchaseReturnDetailsId
            ? k.purchaseReturnDetailsId.toString()
            : '',
          materialName: ItemId,
          unit: UnitId?.unitMasterUnitShortName,
          conversionType: UnitId?.unitDetailsConversionType,
          purchaseQty: k.purchaseOrderPurchaseQTY,
          returnQtyTill: k.purchaseReturnQtyTill | 0,
          netStock: k.purchaseReturnNetStock,
          returnQty: k.purchaseReturnDetailsQuantity
            ? k.purchaseReturnDetailsQuantity
            : 0,
          price: k.purchaseReturnDetailsRate,
          amount: purchasereturn_update.purchaseReturnTotalGrossAmount,
          jobname: null,
          costcenter: null,
          narration: k.purchaseReturnDetailsRemarks,
          id: k.purchaseReturnDetailsId,
        };
      });

    this.purchasereturn_entry.data = gridData;
    this.purchasereturn_entry.readOnly = true;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.purchaseReturnFormGroup.disable();
    this.f.purchaseReturnNo.clearValidators();
    this.purchaseReturnFormGroup.updateValueAndValidity();
  }

  updateFormGrid1(purchasereturn_update: any) {
    this.purchaseReturnFormGroup.patchValue({
      purchaseReturnId: purchasereturn_update.purchaseVoucherPurID,
      //purchaseReturnNo: purchasereturn_update.purchaseOrderNo,
      purchaseReturnDate: new Date(
        purchasereturn_update.purchaseVoucherPurchaseDate
      ),
      purchaseReturnRefNo: purchasereturn_update.purchaseVoucherPurchaseRef,
      purchaseReturnSupInvNo:
        purchasereturn_update.purchaseVoucherSupplyInvoiceNo,
      purchaseReturnCurrencyId: purchasereturn_update.purchaseVoucherCurrencyID,
      purchaseReturnExcludeVat: purchasereturn_update.purchaseVoucherExcludeVAT,

      purchaseReturnType: purchasereturn_update.purchaseVoucherPurchaseType,
      purchaseReturnPartyId: purchasereturn_update.purchaseVoucherPartyID,
      purchaseReturnPartyName: purchasereturn_update.purchaseVoucherPartyName,
      purchaseReturnPartyAddress:
        purchasereturn_update.purchaseVoucherPartyAddress,
      purchaseReturnPartyVatNo: purchasereturn_update.purchaseVoucherPartyVatNo,
      purchaseReturnDescription:
        purchasereturn_update.purchaseVoucherDescription,

      purchaseReturnGrno: purchasereturn_update.purchaseVoucherVoucherNo,
      purchaseReturnGrdate:
        purchasereturn_update.purchaseVoucherGRDate != null
          ? new Date(purchasereturn_update.purchaseVoucherGRDate)
          : null,
      purchaseReturnLpono: purchasereturn_update.purchaseVoucherLPONo,
      purchaseReturnLpodate:
        purchasereturn_update.purchaseVoucherLPODate != null
          ? new Date(purchasereturn_update.purchaseVoucherLPODate)
          : null,
      purchaseReturnQtnNo: purchasereturn_update.purchaseVoucherQuatationNo,
      purchaseReturnQtnDate:
        purchasereturn_update.purchaseVoucherQuatationDate != null
          ? new Date(purchasereturn_update.purchaseVoucherQuatationDate)
          : null,

      purchaseReturnPono: purchasereturn_update.purchaseVoucherPONo,
      purchaseReturnBatchCode: purchasereturn_update.purchaseVoucherBatchCode,
      purchaseReturnDayBookNo: purchasereturn_update.purchaseVoucherDayBookno,
      purchaseReturnLocationId: this.defaultLocationID,
      purchaseReturnJobId: purchasereturn_update.purchaseVoucherJobID,

      purchaseReturnTotalGrossAmount: 0,
      purchaseReturnTotalItemDisAmount: 0,
      purchaseReturnTotalDisPer: 0,
      purchaseReturnTotalDisAmount: 0,
      purchaseReturnVatPer: purchasereturn_update.purchaseVoucherVATPercentage,
      purchaseReturnVatAmt: 0,
      purchaseReturnTotalActualAmount: 0,
      purchaseReturnVatRoundSign:
        purchasereturn_update.purchaseVoucherVATRoundSign,
      purchaseReturnVatRountAmt: 0,
      purchaseReturnNetAmount: 0,
    });

    if (purchasereturn_update.purchaseVoucherPartyID) {
      this.supplierCtrol.nativeElement.value =
        this.SupplierMasterList?.find(
          (k) => k.value === purchasereturn_update.purchaseVoucherPartyID
        )?.label || '';
    }

    this.accountTransactionList = purchasereturn_update.accountsTransactions;

    const gridData: GridData2[] =
      purchasereturn_update.purchaseVoucherDetails.map((k) => {
        const ItemId: string =
          k.purchaseVoucherDetailsMaterialId != null
            ? this.ItemMasterList?.find(
                (l) => l.value == k.purchaseVoucherDetailsMaterialId
              )?.label
            : null;
        var UnitId: any = this.units?.find(
          (l) => l.unitMasterUnitId == k.purchaseVoucherDetailsUnitId
        );

        return {
          code: k?.purchaseVoucherDetailsMaterialId
            ? k.purchaseVoucherDetailsMaterialId.toString()
            : '',
          materialName: ItemId,
          unit: UnitId?.unitMasterUnitShortName,
          conversionType: UnitId?.unitDetailsConversionType,
          purchaseQty: k.purchaseVoucherDetailsQuantity,
          returnQtyTill: k?.purchaseReturnQtyTill
            ? Number(k.purchaseReturnQtyTill)
            : 0,
          netStock: k.purchaseOrderNetStock | 0,
          returnQty: 0,
          price: k.purchaseVoucherDetailsRate,
          amount: 0,
          jobname: null,
          costcenter: null,

          narration: k.purchaseVoucherDetailsRemarks,
          id: k.purchaseVoucherDetailsPurcahseDetailsId,
        };
      });
    this.purchasereturn_entry.data = gridData;
    this.purchasereturn_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: false });
    this.purchaseReturnFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseReturnFormGroup,
      'purchaseReturnLocationId',
      this.locationLocked
    );
    this.f.purchaseReturnNo.clearValidators();
    this.utilityService.reapplyLocationLock(this.purchaseReturnFormGroup, 'purchaseReturnLocationId', this.locationLocked);
    this.purchaseReturnFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  GetSavedPurchaseReturnDetails(id: string) {
    //console.log('id', id);
    this.index = 0;
    this.procurementapi.GetSavedPurchaseReturnDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.accountTransactionList = data.result.accountsTransactions;
          this.updateFormGrid(data.result);
          this.savedPurchaseReturn = data.result;
          this.purchaseReturnFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Purchase Return not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.purchaseReturnFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.procurementapi
          .DeletePurchaseReturn(this.savedPurchaseReturn)
          .subscribe(
            (data: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Purchase Return Deleted Succesfully',
              });
              this.userTrackingLog('Delete', data.result?.purchaseReturnNo);

              this.new();
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Failed',
              });
            }
          );
      },
    });
  }

  cancel() {
    this.GetSavedPurchaseReturnDetails(
      this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo
    );
  }

  edit() {
    this.purchasereturn_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.purchaseReturnNo.clearValidators();
    this.purchaseReturnFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseReturnFormGroup,
      'purchaseReturnLocationId',
      this.locationLocked
    );
    this.purchaseReturnFormGroup.controls.purchaseReturnNo.disable();
    this.purchaseReturnFormGroup.updateValueAndValidity();
  }

  public get IsValidGrid(): boolean {
    if (this.purchasereturn_entry.data.length > 0) {
      return Object.values(this.purchasereturn_entry.data).some(
        (k: GridData) =>
          k.unit != null && k.amount != null && !(k.price == null)
      );
    }
    return false;
  }
  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();

    this.LoadJobDDL();
    this.LoadUnitDDL();
    this.LoadItemDDL()
    this.LoadCurrancyDDL();
    this.LoadLocationDDL();
    this.LoadSupplierDDL();
    this.LoadCostCentreDDL();
    this.LoadAccountSettingDDL();
    this.LoadChartofAccountDDL();
  }

  filter() {
    let filteredArray = this.filterArray;
    if (this.PurchasereturnFilterForm.value.purchaseReturnVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.purchaseVoucherVoucherNo ===
          this.PurchasereturnFilterForm.value.purchaseReturnVoucherNo.toUpperCase()
      );
    }

    if (this.PurchasereturnFilterForm.value.purchaseReturnType) {
      // const customerObj = this.CustomerMasterList?.find(o => o.value === this.PurchasereturnFilterForm.value.purchaseReturnType);
      // if (customerObj) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res?.purchaseVoucherPurchaseType ===
          this.PurchasereturnFilterForm.value.purchaseReturnType
      );
      // }
    }

    if (this.PurchasereturnFilterForm.value.isDate) {
      const fromDateStr = this.PurchasereturnFilterForm.value.fromDate;
      const toDateStr = this.PurchasereturnFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      // filteredArray = filteredArray?.filter((res) => {
      //   const voucherDate = new Date(res.purchaseVoucherPurchaseDate);

      //   voucherDate.setHours(0, 0, 0, 0);
      //   fromDate.setHours(0, 0, 0, 0);

      //   return voucherDate.getTime() >= fromDate.getTime() && voucherDate.getTime() <= toDate.getTime() || voucherDate.getTime() === fromDate.getTime();;
      // });
      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.purchaseVoucherPurchaseDate);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.purchaseVoucherarry = filteredArray;
    }
    this.purchaseVoucherarry = filteredArray;
  }

  ClearFilter() {
    this.PurchasereturnFilterForm.reset();
    this.purchaseVoucherarry = this.filterArray;
    this.PurchasereturnFilterForm.get('fromDate').setValue(new Date());
    this.PurchasereturnFilterForm.get('toDate').setValue(new Date());
  }
  getPartiNameById(id) {
    return this.SupplierMasterList?.find((res) => res.value == id)?.label;
  }
  onPageSizeChange(type: 'voucherList' | 'returnList') {
    this.pageDataSet = [];
    this.currentPage = 1;
    if (type == 'voucherList') this.ApplyPurchaseVoucherFilter();
    else this.GetPurchaseReturnListModel();
  }
  nextPage(type: 'voucherList' | 'returnList') {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.pageDataSet[this.currentPage]) {
        if (type === 'voucherList') {
          this.purchaseVoucherarry = this.pageDataSet[this.currentPage];
        } else if (type === 'returnList') {
          this.purchaseReturnarry = this.pageDataSet[this.currentPage];
        }
      } else {
        if (type == 'voucherList') this.ApplyPurchaseVoucherFilter();
        else this.GetPurchaseReturnListModel();
      }
    }
  }

  previousPage(type: 'voucherList' | 'returnList') {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.pageDataSet[this.currentPage]) {
        if (type === 'voucherList') {
          this.purchaseVoucherarry = this.pageDataSet[this.currentPage];
        } else {
          this.purchaseReturnarry = this.pageDataSet[this.currentPage];
        }
      } else {
        if (type == 'voucherList') this.ApplyPurchaseVoucherFilter();
        else this.GetPurchaseReturnListModel();
      }
    }
  }
  clearPagination() {
    this.pageSize = this.utilityService.pageOption[0];
    this.sortPurchaseReturnColumn = '';
    this.sortPurchaseVoucherColumn = '';
    this.globalPurchaseVoucherSearch = '';
    this.globalPurchaseReturnSearch = '';
    this.purchaseVoucherFromDate = null;
    this.purchaseVoucherToDate = null;
    this.purchaseReturnFromDate = null;
    this.purchaseReturnToDate = null;
    this.pageDataSet = [];
    this.sortOrder = {};
    this.totalPages = 0;
    this.totalRecords = 0;
    this.currentPage = 1;
  }
  PurchaseBtnRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';

    const rowData = instance.getSourceDataAtRow(row);
    if (
      rowData.purchaseVoucherPurID != null ||
      rowData.purchaseReturnId != null
    ) {
      // Create the button element
      const button = document.createElement('a');
      button.className = 'iconbton';
      button.innerHTML = '<i class="pi pi-pencil" ></i>';
      button.addEventListener('click', () => {
        this.ngZone.run(() => {
          if (rowData.purchaseVoucherPurID != null) {
            this.displayPurchaseOrder = false;
            this.onRowSelect(rowData.purchaseVoucherPurID);
          } else if (rowData.purchaseReturnId != null) {
            this.displayMaximizable = false; // now Angular sees this
            this.GetSavedPurchaseReturnDetails(rowData.purchaseReturnId);
          }
          this.clearPagination();
        });
      });

      // Append the button to the cell
      td.appendChild(button);
    }
    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }
}

export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value?.trim() !== '') {
      return timer(time).pipe(
        switchMap(() => acctService.CheckVnoExist(input.value)),
        map((res) => {
          return res.result === false ? null : { Exist: true };
        })
      );
    }
  };
};

interface GridData {
  code?: string;
  materialName?: string;
  itemname?: string;
  unit?: string;
  purchaseQty?: number;
  returnQtyTill?: number;
  netStock?: number;
  returnQty?: number;
  conversionType?: number;
  price?: number;
  amount?: number;
  vatAmt?: number;
  netAmt?: number;
  narration?: string;
  jobname?: string;
  costcenter?: string;

  id?: number;
}
interface GridData2 {
  code?: string;
  materialName?: string;
  itemname?: string;
  unit?: string;
  purchaseQty?: number;
  returnQtyTill?: number;
  netStock?: number;
  returnQty?: number;

  price?: number;
  amount?: number;
  vatAmt?: number;
  netAmt?: number;
  narration?: string;
  jobname?: string;
  costcenter?: string;

  id?: number;
}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const columnDetailList = (component: PurchasereturnComponent) => [
  {
    data: 'code',
    type: 'text',
    label: 'Code',
  },
  {
    data: 'materialName',
    type: 'text',
    label: 'Material Name',
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    source: component.unitArry,
    readOnly: true,
    allowInvalid: false,
  },
  {
    data: 'purchaseQty',
    type: 'numeric',
    label: 'Purchase Qty',
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'returnQtyTill',
    type: 'numeric',
    label: 'Return Qty[Till]',
    numericFormat: { pattern: '0,0.00' },
    readOnly: false,
  },
  {
    data: 'netStock',
    type: 'numeric',
    label: 'Net Stock',
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'returnQty',
    type: 'numeric',
    label: 'Return Qty',
    numericFormat: { pattern: '0,0.00' },
    readOnly: false,
  },
  {
    data: 'price',
    type: 'numeric',
    label: 'Price',
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'amount',
    type: 'numeric',
    label: 'Amount',
    numericFormat: { pattern: '0,0.00' },
    readOnly: false,
  },
  {
    data: 'vatAmt',
    type: 'numeric',
    label: 'Vat Amt',
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'netAmt',
    type: 'numeric',
    label: 'Net Amt',
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    readOnly: false,
  },
  {
    data: 'jobname',
    type: 'dropdown',
    label: 'Job',
    source: component.jobArry,
  },
  {
    data: 'conversionType',
    type: 'numeric',
    label: 'Conversion Type',
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
  },
  // {
  //   data: 'costcenter',
  //   type: 'numeric',
  //   label: 'Cost center',
  // },
  // {
  //   data: 'costcenterid',
  //   type: 'numeric',
  //   label: 'ID',
  // },
];
export const purchaseVoucherColumns = (component: PurchasereturnComponent) => [
  {
    data: 'purchaseVoucherPurID',
    type: 'text',
    label: 'ID',
    toolTip: 'Purchase Voucher ID',
  },
  {
    data: 'purchaseVoucherVoucherNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Voucher Number',
  },
  {
    data: 'purchaseVoucherPurchaseDate',
    type: 'date',
    label: 'Date',
    toolTip: 'Purchase Date',
  },
  {
    data: 'purchaseVoucherPurchaseType',
    type: 'text',
    label: 'Voucher Type',
    toolTip: 'Voucher Type',
  },
  {
    data: 'purchaseVoucherPartyName',
    type: 'text',
    label: 'Party Name',
    toolTip: 'Supplier/Party Name',
  },
  {
    data: 'action',
    label: 'Action',
    renderer: component.PurchaseBtnRenderer?.bind(component),
  },
];

export const purchaseReturnColumns = (component: PurchasereturnComponent) => [
  {
    data: 'purchaseReturnNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Purchase Return Voucher Number',
    width: '120px',
  },
  {
    data: 'purchaseReturnDate',
    type: 'date',
    label: 'Date',
    toolTip: 'Purchase Return Date',
    width: '100px',
  },
  {
    data: 'purchaseReturnPartyName',
    type: 'text',
    label: 'Party',
    toolTip: 'Supplier/Party',
    width: '150px',
  },
  {
    data: 'currencyMasterCurrencyName',
    type: 'text',
    label: 'Currency',
    toolTip: 'Currency Type',
    width: '100px',
  },
  {
    data: 'purchaseReturnDescription',
    type: 'text',
    label: 'Narration',
    toolTip: 'Description/Narration',
    width: '200px',
  },
  {
    data: 'purchaseReturnTotalGrossAmount',
    type: 'numeric',
    label: 'Gross Amt',
    toolTip: 'Gross Amount',
    width: '100px',
    format: '0,0.00',
  },
  {
    data: 'purchaseReturnTotalDisAmount',
    type: 'numeric',
    label: 'Disc Amt',
    toolTip: 'Discount Amount',
    width: '100px',
    format: '0,0.00',
  },
  {
    data: 'purchaseReturnVatAmt',
    type: 'numeric',
    label: 'Vat Amt',
    toolTip: 'VAT Amount',
    width: '100px',
    format: '0,0.00',
  },
  {
    data: 'purchaseReturnVatRoundSign',
    type: 'text',
    label: 'Round Sign',
    toolTip: 'Round Sign (+/-)',
    width: '80px',
  },
  {
    data: 'purchaseReturnVatRountAmt',
    type: 'numeric',
    label: 'Round Amt',
    toolTip: 'Round Amount',
    width: '100px',
    format: '0,0.00',
  },
  {
    data: 'purchaseReturnNetAmount',
    type: 'numeric',
    label: 'Net Amt',
    toolTip: 'Net Amount',
    width: '100px',
    format: '0,0.00',
  },
  {
    data: 'action',
    label: 'Action',
    renderer: component.PurchaseBtnRenderer?.bind(component),
    width: '120px',
    sortable: false,
  },
];
