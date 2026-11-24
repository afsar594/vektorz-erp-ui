import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { FormBuilder, FormGroup } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import {
  SelectItem,
  MessageService,
  ConfirmationService,
  TreeNode,
} from 'primeng/api';
import { PurchaseRequisition } from 'src/app/routes/domain/Procurements//PurchaseRequisition';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map } from 'rxjs/operators';
import { timer } from 'rxjs';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { PreviousRouteService } from 'src/app/routes/service/common/previous-route.service';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ImportApiService } from 'src/app/routes/service/import-api.service';
//  import { Console } from 'console';
import * as XLSX from 'xlsx';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { DecimalConfigService } from 'src/app/routes/service/decimal-config.service';
import { CustQuatationComponent } from './cust-quatation/cust-quatation.component';
import { DialogService } from 'primeng';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
@Component({
  selector: 'app-purchaserequisition',
  templateUrl: './purchaserequisition.component.html',
  styleUrls: ['./purchaserequisition.component.scss'],
})
export class PurchaserequisitionComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;

  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  displayMaximizable1: boolean;
  loading = false;

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  lookupGridColumns = [];
  dataList: Array<any> = [];
  showProcurementsLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;
  brosBtn: boolean = false;
  hideComp: boolean;
  showSalesLookUp: boolean = false;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  brandArry: VendorMaster[] = [];

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];
  selectedCustomers = []; // Array to hold selected customers

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];
  isSelect: false;
  unitAry: any;
  unitListt: any;
  units: any;
  PIList: any;

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArrayByName: any = null;
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

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];
  width = `40%`;

  StatusArray: CostCenterMaster[] = [];
  StatusList: SelectItem[] = [];
  StatusArry: string[] = [];
  Permission: any;
  ScreenId: number;
  accountTransactionList: AccountsTransactions[] = [];
  purchaseRequisitionarry: PurchaseRequisition[] = [];
  // savedPurchaseRequisitionGridData: GridData[] = [];
  savedPurchaseRequisition: PurchaseRequisition;

  PurchaseRequisitionPrint: any;

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;
  JOBCOST: Boolean = false;
  isHideTable: boolean = true;
  generalSettingsLoaded: boolean = false;
  v_typeList: SelectItem[];
  v_OPENCLOSE: SelectItem[];
  v_RoundoffList: SelectItem[];
  displayPrintPreview: boolean = false;
  selectedRow: [];
  Arraylist: any[] = [];
  lastexportArray: any[] = [];
  filterArray: any;
  filterArrayListListBoq: any;
  aproveStaus: any;
  user: any;
  vNo: any;
  userlist: any;
  pdfSource: string;
  LOCKlOCATION: boolean = false;
  selectedjob: any;
  ProgramSetting: any;
  uploadedjobDocs: any;
  uploadedDocs: Object;
  pagedRequest: PagedRequest;
  isServerSearch = false;

  files: TreeNode[] = [];
  selectedFile: TreeNode | null = null;
  itemList = [];
  clickedRowColumn = { row: -1, column: -1 };
  decimals: number = 2;

  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.v_typeList = [
      { label: 'CASH', value: { name: 'CASH' } },
      { label: 'CREDIT', value: { name: 'CREDIT' } },
    ];
    this.v_OPENCLOSE = [
      { label: '', value: '' },
      { label: 'OPEN', value: 'OPEN' },
      { label: 'CLOSE', value: 'CLOSE' },
    ];
    this.v_RoundoffList = [
      { label: '+', value: { name: '+' } },
      { label: '-', value: { name: '-' } },
    ];
  }
  printbtn: MenuItem[];
  uploadedFiles: any[] = [];
  hiddenColumns: any = [
    1, 4, 5, 9, 10, 11, 12, 13, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28
  ];


  showEstiamtionAndCost : Boolean = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private utilityService: UtilityService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private procurementapi: ProcurementApiService,
    private previousRouteService: PreviousRouteService,
    public permission: PermissionsService,
    public crystalReportService: CrystalReportService,
    private printService: FileSaverService,
    private api: ImportApiService,
    private sanitizer: DomSanitizer,
    private decimalConfig: DecimalConfigService,
    private dialogService: DialogService,
    private stockApi: StockApiService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.printbtn = [
      {
        label: 'PDF',
        command: () => {
          this.crystalReport('pdf');
        },
      },
      {
        label: 'Excel',
        command: () => {
          this.crystalReport('excel');
        },
      },
    ];
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'purchaserequisition_HotEntry';
  purchaserequisition_entry: Handsontable.GridSettings;
  purchaseRequisitionFormGroup: FormGroup;
  purchaseRequisitionFilterForm: FormGroup;
  BoqListFilterForm: FormGroup;

  purchaserequisition_entryDataset = [];
  // accountTransactionDataset = [];
  cols;
  cols1;
  ngAfterViewInit() {}

  navigateBack(): void {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

 loadData(jobId: number) {
  this.stockApi.getItemsByJobId(jobId).subscribe({
    next: (items) => {
      console.log('Items:', items);
      // Handle items data
    },
    error: (err) => console.error(err)
  });


//   this.stockApi.getAllJobs().subscribe({
//   next: (jobs) => {
//     console.log(jobs);
//     // Assign to a local variable, e.g., this.jobsList = jobs;
//   },
//   error: (err) => {
//     console.error(err);
//   }
// });


  // this.stockApi.getCostEstDescByItemId(qtnItemId).subscribe({
  //   next: (costEst) => {
  //     console.log('Cost Estimate:', costEst);
  //     // Handle cost estimate data
  //   },
  //   error: (err) => console.error(err)
  // });
}

  ngOnInit(): void {
  

    this.GetGeneralSettingbyKey();

    this.decimals = this.decimalConfig.getDecimal();

    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.vNo = params['vNo'];
      this.aproveStaus = params['s'];

      this.lastexportArray = [];
      this.stationmasterObj = this.permission.getStation();
      this.user = this.permission.getUser();
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
    this.FILL_COMBO();
    this.initializeControls();
    this.cols = [
      { field: 'purchaseRequisitionNo', header: 'Voucher No' },
      { field: 'purchaseRequisitionDate', header: 'Date' },
      // { field: 'purchaseRequisitionPartyId', header: 'Party' },
      // { field: 'purchaseRequisitionCurrencyId', header: 'Currency' },
      { field: 'jobname', header: 'Job Name' },
      { field: 'purchaseRequisitionDescription', header: 'Remarks' },
      // { field: 'purchaseRequisitionTotalGrossAmount', header: 'Gross.Amt' },
      // { field: 'purchaseRequisitionTotalDisAmount', header: 'Disc.Amt' },
      // { field: 'purchaseRequisitionVatAmt', header: 'Vat.Amt' },
      // { field: 'purchaseRequisitionVatRoundSign', header: 'Round.Sign' },
      // { field: 'purchaseRequisitionVatRountAmt', header: 'Round.Amt' },
      // { field: 'purchaseRequisitionNetAmount', header: 'Net.Amt' },
      { field: 'action', header: 'Action' },
    ];
    this.cols1 = [
      // { field: 'action', header: 'Mark' },
      { field: 'billofqtyNo', header: 'BOQ No' },
      { field: 'date', header: 'BOQ Date' },
      { field: 'customerEnqId', header: 'JOB Name' },
      { field: 'itemCode', header: 'Item Name' },
      { field: 'unitCode', header: 'Unit' },
      { field: 'qty', header: 'Qty' },
      { field: 'receivedQty', header: 'Rcvd Qty' },
      { field: 'balanceQty', header: 'Bal Qty' },
    ];
    this.activeRow = { row: 0, column: 0 };

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };

    this.purchaseRequisitionFormGroup = this.fb.group({
      purchaseRequisitionId: [0],
      purchaseRequisitionNo: [{ value: '', disabled: true }],
      purchaseRequisitionDate: [{ value: null, disabled: true }],

      purchaseRequisitionRefNo: [{ value: '', disabled: true }],
      purchaseRequisitionSupInvNo: [{ value: '', disabled: true }],
      purchaseRequisitionCurrencyId: [-1, [DropDownValidator]],
      purchaseRequisitionExcludeVat: [{ value: false, disabled: true }],
      purchaseRequisitionStatus: [{ value: '', disabled: true }],
      purchaseRequisitionType: [-1],
      purchaseRequisitionApproveEnable: [{ value: null, disabled: true }],
      purchaseRequisitionApproveUserId: [{ value: null, disabled: true }],
      purchaseRequisitionPartyId: [{ value: null, disabled: true }], /// change later
      purchaseRequisitionPartyName: [{ value: '', disabled: true }],
      purchaseRequisitionPartyAddress: [{ value: '', disabled: true }],
      purchaseRequisitionPartyVatNo: [{ value: '', disabled: true }],
      purchaseRequisitionDescription: [{ value: '', disabled: true }],

      purchaseRequisitionGrno: [{ value: null, disabled: true }],
      purchaseRequisitionGrdate: [{ value: null, disabled: true }],
      purchaseRequisitionLpono: [{ value: null, disabled: true }],
      purchaseRequisitionLpodate: [{ value: null, disabled: true }],
      purchaseRequisitionQtnNo: [{ value: null, disabled: true }],
      purchaseRequisitionQtnDate: [{ value: null, disabled: true }],
      purchaseRequisitionPono: [{ value: null, disabled: true }],
      purchaseRequisitionBatchCode: [{ value: null, disabled: true }],
      purchaseRequisitionDayBookNo: [{ value: null, disabled: true }],
      purchaseRequisitionJobId: [-1],
      purchaseRequisitionLocationId: [-1, [DropDownValidator]],

      purchaseRequisitionTotalGrossAmount: [{ value: [0], disabled: true }],
      purchaseRequisitionTotalItemDisAmount: [{ value: [0], disabled: true }],
      purchaseRequisitionTotalDisPer: [{ value: [0], disabled: true }],
      purchaseRequisitionTotalDisAmount: [{ value: [0], disabled: true }],
      purchaseRequisitionVatPer: [{ value: [5], disabled: true }],
      purchaseRequisitionVatAmt: [{ value: [0], disabled: true }],
      purchaseRequisitionTotalActualAmount: [{ value: [0], disabled: true }],
      purchaseRequisitionVatRoundSign: [{ value: '-', disabled: true }],
      purchaseRequisitionVatRountAmt: [{ value: [0], disabled: true }],
      purchaseRequisitionNetAmount: [{ value: [0], disabled: true }],
      purchaseRequisitionApproveUser: [{ value: '', disabled: true }],
      deliveryterms: [{ value: '', disabled: true }],
      deliveryatsite: [{ value: '', disabled: true }],
      confirmationemaildetails: [{ value: '', disabled: true }],
      paymentTerms: [{ value: '', disabled: true }],
    });
    this.purchaseRequisitionFilterForm = this.fb.group({
      filterCurrency: [null],
      filterjob: [null],
      isDate: [],
      filterVoucherNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.BoqListFilterForm = this.fb.group({
      boqNo: [null],
      isDate: [],
      JobName: [null],
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
    this.LoadLocationDDL();
    this.getalluser();
    this.bykeys();
  }
  getalluser() {
    this.masterapi.GetAllUser().subscribe((res: any) => {
      this.userlist = res.resultSet.result;
    });
    this.LoadJobDDL();
  }

  get f() {
    return this.purchaseRequisitionFormGroup.controls;
  }
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
  hidesupplierDetail: boolean = false;
  hideRateAndAmount: boolean = false;
  hideJobCostGeneralSetting: boolean = false;
  hideSupplierGeneralSetting: boolean = false;
  hideCostCenterGeneralSetting: boolean = false;
  hideSupplierInPurchaseRequisition: boolean = false;
  bykeys() {
    this.utilityService
      .getProgramSettings(
        'Hide_Job_Detail,Hide_CostCenter_Detail,Hide_Supplier_Detail,Hide_RateAndAmount_in_PR,HIDE_SUPPLIER_IN_PURCHASE_REQUISITION'
      )
      ?.subscribe((res: any) => {
        const jobSetting = res?.find(
          (x: any) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        const costCenterSetting = res?.find(
          (x: any) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        );
        const suppliersetting = res?.find(
          (x: any) => x.programSettingsKeyValue === 'Hide_Supplier_Detail'
        );

        const hideRateAndAmount = res?.find(
          (x: any) => x.programSettingsKeyValue === 'Hide_RateAndAmount_in_PR'
        );

        const hideSupplierInPR = res?.find(
          (x: any) =>
            x.programSettingsKeyValue ===
            'HIDE_SUPPLIER_IN_PURCHASE_REQUISITION'
        );

        this.hidesupplierDetail =
          suppliersetting?.programSettingsBoolValue ?? false;
        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;
        this.hideRateAndAmount =
          hideRateAndAmount?.programSettingsBoolValue ?? false;
        if (hideSupplierInPR) {
          const val =
            hideSupplierInPR.programSettingsBoolValue ??
            hideSupplierInPR.programSettingsNumValue ??
            hideSupplierInPR.programSettingsTextValue;
          this.hideSupplierInPurchaseRequisition =
            val === true || val === 1 || val === '1' || val === 'true';
        }

        console.log('>>> [PR Debug] bykeys ProgramSettings response:', res);
        console.log('>>> [PR Debug] Hide_Supplier_Detail (for Handsontable Col 15):', {
          raw: suppliersetting,
          hidesupplierDetail: this.hidesupplierDetail,
        });
        console.log('>>> [PR Debug] HIDE_SUPPLIER_IN_PURCHASE_REQUISITION (for Header Input):', {
          raw: hideSupplierInPR,
          hideSupplierInPurchaseRequisition: this.hideSupplierInPurchaseRequisition,
        });

        this.updateTableConfigurationIfJobCostEnabled();
      });

    this.loadGeneralColumnSettings();
  }

  updateTableConfiguration() {
    const hiddenColumns = [
      1, 9, 10, 11, 12, 13, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29
    ];

    if (!this.showEstiamtionAndCost) {
      hiddenColumns.push(4, 5);
    }

    if (this.hideRateAndAmount) {
      hiddenColumns.push(7, 8);
    }

    if (this.hideJobDetail || this.isHideTable) {
      hiddenColumns.push(14);
    }

    if (this.hidesupplierDetail || this.isHideTable) {
      hiddenColumns.push(15);
    }

    if (this.hideCostCenterDetail || this.isHideTable) {
      hiddenColumns.push(17);
    }

    this.hiddenColumns = [...new Set(hiddenColumns)];

    console.log('>>> [PR Debug] updateTableConfiguration:', {
      hidesupplierDetail: this.hidesupplierDetail,
      isHideTable: this.isHideTable,
      isSupplierColumn15Hidden: this.hiddenColumns.includes(15),
      hiddenColumns: this.hiddenColumns,
    });

    this.hotRegisterer.getInstance(this.hotid)?.updateSettings({
      hiddenColumns: {
        columns: this.hiddenColumns,
        indicators: true,
      },
    });
  }

  loadGeneralColumnSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m: any) => {
      const generalSettings = m?.resultSet?.generalSettings ?? [];
      this.applyGeneralColumnSettings(generalSettings);
      this.isHideTable = this.getPrHideTableColumnsValue(generalSettings);
      this.JOBCOST =
        generalSettings?.find(
          (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
        )?.generalSettingsBoolValue ?? false;
      this.generalSettingsLoaded = true;

      console.log('>>> [PR Debug] loadGeneralColumnSettings:', {
        generalSettings,
        isHideTable: this.isHideTable,
        hideSupplierGeneralSetting: this.hideSupplierGeneralSetting,
        hideSupplierInPurchaseRequisition: this.hideSupplierInPurchaseRequisition,
      });

      this.updateTableConfigurationIfJobCostEnabled();
    });
  }

  applyGeneralColumnSettings(list: any[]) {
    const HIDE_JOBCOST = list?.find(
      (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
    );
    const HIDE_SUPPLIER = list?.find(
      (a) => a.generalSettingsKeyValue == 'HIDE_SUPPLIER'
    );
    const HIDE_COSTCENTER = list?.find(
      (a) => a.generalSettingsKeyValue == 'HIDE_COSTCENTER'
    );
    const HIDE_SUPPLIER_PR = list?.find(
      (a) =>
        a.generalSettingsKeyValue == 'HIDE_SUPPLIER_IN_PURCHASE_REQUISITION'
    );

    this.hideJobCostGeneralSetting =
      HIDE_JOBCOST?.generalSettingsBoolValue ?? false;
    this.hideSupplierGeneralSetting =
      HIDE_SUPPLIER?.generalSettingsBoolValue ?? false;
    this.hideCostCenterGeneralSetting =
      HIDE_COSTCENTER?.generalSettingsBoolValue ?? false;
    if (HIDE_SUPPLIER_PR) {
      const val =
        HIDE_SUPPLIER_PR.generalSettingsBoolValue ??
        HIDE_SUPPLIER_PR.generalSettingsNumValue ??
        HIDE_SUPPLIER_PR.generalSettingsTextValue;
      this.hideSupplierInPurchaseRequisition =
        val === true || val === 1 || val === '1' || val === 'true';
    }
  }

  private getPrHideTableColumnsValue(list: any[]): boolean {
    return (
      list?.find(
        (a) =>
          a.generalSettingsKeyValue == 'PR-hidetable-columns' ||
          a.generalSettingsKeyValue == 'PR_HIDETABLE_COLUMNS'
      )?.generalSettingsBoolValue ?? false
    );
  }

  private updateTableConfigurationIfJobCostEnabled() {
    if (this.generalSettingsLoaded) {
      this.updateTableConfiguration();
    }
  }

  initializeControls() {
    if (this.vNo) {
      this.callDropdowns();
    }

    this.purchaserequisition_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      this.hiddenColumns
    );

    // Apply visibility only after grid config has been initialized.
    this.updateTableConfigurationIfJobCostEnabled();

    this.purchaserequisition_entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
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
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      if (column === 0 && this.purchaserequisition_entry.readOnly === false) {
        console.log('ia m in');
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item', 'ItemID'];
        this.dataList = this.itemSetLookup;
        hotInstance.deselectCell();
        this.onSearch('');
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 3 &&
        this.purchaserequisition_entry.readOnly === false
      ) {
        this.lookupGridColumns = ['Unit', 'Unit ID'];

        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.masterapi.GetUnitDetails(data[0]).subscribe((res) => {
          this.unitArray = res.result;
          this.dataList = this.unitSetLookup;
          hotInstance.deselectCell();
          this.formControlLookUp = true;
          this.unitArry = res.result.map((ar) =>
            ar.unitMasterUnitShortName?.trim()
          );
        });
        this.dataList = this.unitSetLookup;
        this.formControlLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 14 &&
        this.purchaserequisition_entry.readOnly === false
      ) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        hotInstance.deselectCell();
        this.formControlLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 15 &&
        this.purchaserequisition_entry.readOnly === false
      ) {
        this.lookupGridColumns = ['Supplier', 'Supplier ID'];
        this.dataList = this.supplierLookup;
        hotInstance.deselectCell();
        this.formControlLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 4 &&
        this.purchaserequisition_entry.readOnly === false
      ) {
        const jobId = this.purchaseRequisitionFormGroup.value.purchaseRequisitionJobId;
        if (jobId && jobId !== -1) {
          this.stockApi.getItemsByJobId(jobId).subscribe((res: any) => {
            const items = res.resultSet || res;
            this.lookupGridColumns = ['Item ID','Item Name'];
            this.dataList = items.map((x: any) => ({
                itemId: x.qtnItemId || x.QtnItemId,
                itemName: x.qtnItemName || x.QtnItemName,
              //  C_QtnId: x.qtnId || x.QtnId || null
            }));
            hotInstance.deselectCell();
            this.formControlLookUp = true;
            this.activeRow = { row, column };
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Notice',
            detail: 'Please select a Job first',
          });
        }
      } else if (
        column === 5 &&
        this.purchaserequisition_entry.readOnly === false
      ) {
        const qtnItemId = hotInstance.getDataAtCell(row, 27);
        const qtnId = hotInstance.getDataAtCell(row, 29);
        if (qtnItemId) {
          this.stockApi.getCostEstDescByItemId(qtnItemId, qtnId).subscribe((res: any) => {
            const estItems = res.resultSet || res;
            // Keep item id in payload mapping, but hide it from lookup display.
            this.lookupGridColumns = ['Description', 'Rate'];
            this.dataList = estItems.map((x: any) => {
              const row = {
                A_EstItemDesc: x.itemDescription || x.ItemDescription,
                B_EstRate: x.rate ?? x.Rate ?? 0,
              };
              Object.defineProperty(row, '__meta', {
                value: {
                  estItemId: x.estItemId || x.EstItemId,
                  qtnId: x.qtnId || x.QtnId || x.qtnID || null,
                },
                enumerable: false,
              });
              return row;
            });
            hotInstance.deselectCell();
            this.formControlLookUp = true;
            this.activeRow = { row, column };
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Notice',
            detail: 'Please select a Quotation Item first',
          });
        }
      } else if (column === 17) {
        this.lookupGridColumns = ['CostCenter ', 'CostCenter ID'];
        this.dataList = this.costCenterLookup;
        hotInstance.deselectCell();
        this.formControlLookUp = true;
        this.activeRow = { row, column };
      } else {
        this.formControlLookUp = false;
        this.showProcurementsLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.procurements == x);
      } else {
        this.selectItem = {};
      }
    };

    this.purchaserequisition_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showProcurementsLookUp = false;
      if (change[0][1] === 0) {
        this.showProcurementsLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };
    this.purchaserequisition_entry.afterChange = (changes, source) => {
      if (changes != null) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(changes[0][0]);
        changes?.forEach(([row, prop, oldValue, newValue]) => {
          if (
            data[6] != null &&
            data[23] != null &&
            data[22] != null &&
            data[22] != 0 &&
            prop == 'qty'
          ) {
            if (data[6] > data[23]) {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: `PR Quantity Cannot Exceeds BOQ Quantity (${data[23]})`,
              });
              this.hotRegisterer
                .getInstance(this.hotid)
                .setDataAtCell(changes[0][0], 6, 0);
            }
            return;
          }
        });
      }
    };
    this.purchaserequisition_entry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);

        if (data[6] != null && data[7] != null && change[0][1] != 'amt') {
          //&& data[7] != null
          // let data4 = data[4] * (data[16] ? data[16] : 1)
          var sum = data[6] * data[7];
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 8, sum);
        }
      }
      this.ColumnSum();

      // this.GetTotal();
    };
    this.purchaserequisition_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.itemList.splice(index, 1);
      this.ColumnSum();
      // this.GetTotal();
    };
  }
  get jobSetLookup() {
    return this.jobArray.map((kl) => ({
      job: kl.jobMasterJobName,
      jobId: kl.jobMasterJobId,
    }));
  }
  get supplierLookup() {
    return this.SupplierMasterList?.map((kl) => ({
      SupplierLabel: kl.label,
      SupplierId: kl.value,
    }));
  }
  get costCenterLookup() {
    return this.costcenterList?.map((kl) => ({
      costCenterLabel: kl.label,
      costCenterId: kl.value,
    }));
  }

  ColumnSum() {
    var disc = 0;
    this.purchaserequisition_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.disc) {
        disc += elemt.disc;
      }
    });
    disc = parseFloat(disc.toFixed(this.decimals));
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionTotalItemDisAmount.setValue(
      disc
    );
    var netAmt = 0;
    this.purchaserequisition_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.amt) {
        netAmt += elemt.amt;
      }
    });
    netAmt = parseFloat(netAmt.toFixed(this.decimals));
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionNetAmount.setValue(
      netAmt
    );

    // this.GetTotal();
  }
GetGeneralSettingbyKey() {
    this.masterapi
      .GetProgramSettingbyKey('Show_Estimation_in_PR')
      .subscribe({
        next: (res: any) => {
          console.log("Raw API response:", res);
          
          if (res && res.result && res.result.length > 0) {
            // Updated property name to match the API response
            this.showEstiamtionAndCost = res.result[0].programSettingsBoolValue; 
            console.log("showEstiamtionAndCost value:", this.showEstiamtionAndCost);
          } else {
            this.showEstiamtionAndCost = false; // Fallback value
            console.log("The API returned an empty or invalid result array");
          }

          this.updateTableConfigurationIfJobCostEnabled();
        },
        error: (err) => {
          console.error("The API call failed:", err);
        }
      });
  }

  CalcDiscFromPer() {
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionTotalDisAmount.setValue(
      parseFloat(
        (
          (this.purchaseRequisitionFormGroup.value
            .purchaseRequisitionTotalGrossAmount *
            this.purchaseRequisitionFormGroup.value
              .purchaseRequisitionTotalDisPer) /
          100
        ).toFixed(this.decimals)
      )
    );
    // this.GetTotal();
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    return Math.max(0, 10 - salesVoucherDetailsLength);
  }

  CalcDiscFromAmt() {
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionTotalDisPer.setValue(
      parseFloat(
        (
          (this.purchaseRequisitionFormGroup.value
            .purchaseRequisitionTotalDisAmount *
            100) /
          this.purchaseRequisitionFormGroup.value
            .purchaseRequisitionTotalGrossAmount
        ).toFixed(this.decimals)
      )
    );
    // this.GetTotal();
  }
  GetTotal($event = null) {
    // console.log('change',$event);

    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionTotalActualAmount.setValue(
      parseFloat(
        (
          this.purchaseRequisitionFormGroup.value
            .purchaseRequisitionTotalGrossAmount -
          this.purchaseRequisitionFormGroup.value
            .purchaseRequisitionTotalDisAmount
        ).toFixed(this.decimals)
      )
    );

    // console.log(this.purchaseRequisitionFormGroup.value.purchaseRequisitionVatRoundSign)
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionVatAmt.setValue(
      parseFloat(
        (
          (this.purchaseRequisitionFormGroup.value
            .purchaseRequisitionTotalActualAmount *
            this.purchaseRequisitionFormGroup.value.purchaseRequisitionVatPer) /
          100
        ).toFixed(this.decimals)
      )
    );

    if (
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionVatRoundSign ==
      '+'
    ) {
      this.purchaseRequisitionFormGroup.controls.purchaseRequisitionNetAmount.setValue(
        parseFloat(
          (
            this.purchaseRequisitionFormGroup.value
              .purchaseRequisitionTotalActualAmount +
            this.purchaseRequisitionFormGroup.value.purchaseRequisitionVatAmt +
            Number(
              this.purchaseRequisitionFormGroup.value
                .purchaseRequisitionVatRountAmt
            )
          ).toFixed(this.decimals)
        )
      );
    } else {
      this.purchaseRequisitionFormGroup.controls.purchaseRequisitionNetAmount.setValue(
        parseFloat(
          (
            this.purchaseRequisitionFormGroup.value
              .purchaseRequisitionTotalActualAmount +
            this.purchaseRequisitionFormGroup.value.purchaseRequisitionVatAmt -
            this.purchaseRequisitionFormGroup.value
              .purchaseRequisitionVatRountAmt
          ).toFixed(this.decimals)
        )
      );
    }
  }

  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((r: any) => {
      this.jobArray = r.resultSet.jobMasters;
      this.jobList = r.resultSet.jobMasters.map((kl: any) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,

        // label: kl.jobMasterJobName + " -- " +  kl.jobMasterJobNumber,
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

  LoadAccountSettingDDL() {
    this.utilityService.LoadDropdownaccountsSettings().subscribe((r: any) => {
      this.accountArray = r.resultSet.masterAccountsTables;
      this.accountList = r.resultSet.masterAccountsTables?.map((kl: any) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList?.unshift({ label: '--Select Account--', value: -1 });
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

  // LoadItemDDL() {
  //   this.accountapi.LoadDropdownItemMaster().subscribe((r) => {
  //     this.ItemMasterArray = r.resultSet.itemMaster;
  //     this.ItemMasterList = r.resultSet.itemMaster?.map((kl) => ({
  //       label: kl.itemMasterItemName,
  //       value: kl.itemMasterItemId,
  //     }));
  //   });
  // }

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
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationLocked = this.utilityService.applyLocationLock(
        this.purchaseRequisitionFormGroup,
        'purchaseRequisitionLocationId'
      );
      if (this.locationLocked) {
        this.LOCKlOCATION = true;
      }
    });
  }

  LoadCurrencyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((r: any) => {
      this.currArry = r.resultSet.currencyMasters;
      this.currencyList = r.resultSet.currencyMasters?.map((kl: any) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
    });
  }

  getAllStatus() {
    this.masterapi.GetAllCostCenter().subscribe((k) => {
      this.StatusArray = k;
      this.StatusList = k.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.StatusArry = k.map((ar) =>
        ar.costCenterMasterCostCenterName?.trim()
      );
    });
  }

  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl.itemMasterItemName,
      procurementsId: kl.itemMasterItemId,
      barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
      // size: kl?.itemMasterItemSize,
      // brand: this.brandArry?.find(
      //   (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
      // )?.vendorMasterVendorName,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      procurements: kl.unitMasterUnitShortName,
      procurementsId: kl.unitMasterUnitId,
    }));
  }

  onsave() {
    const savedData: any = this.purchaserequisition_entry.data?.filter((k) =>
      k.hasOwnProperty('itemname')
    );
    const purchaseRequisition_Save: PurchaseRequisition = this
      .purchaseRequisitionFormGroup.value as PurchaseRequisition;

    purchaseRequisition_Save.purchaseRequisitionId = Number(
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionId
    );

    purchaseRequisition_Save.purchaseRequisitionNo =
      this.purchaseRequisitionFormGroup.getRawValue().purchaseRequisitionNo;
    purchaseRequisition_Save.purchaseRequisitionDate =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionDate;
    purchaseRequisition_Save.purchaseRequisitionRefNo =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionRefNo;
    purchaseRequisition_Save.purchaseRequisitionSupInvNo =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionSupInvNo;
    purchaseRequisition_Save.purchaseRequisitionCurrencyId =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionCurrencyId;
    //  purchaseRequisition_Save.purchaseRequisitionExcludeVat = this.purchaseRequisitionFormGroup.value.purchaseRequisitionExcludeVat;
    purchaseRequisition_Save.purchaseRequisitionExcludeVat = true;

    purchaseRequisition_Save.purchaseRequisitionType =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionType;
    purchaseRequisition_Save.purchaseRequisitionStatus =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionStatus;

    purchaseRequisition_Save.purchaseRequisitionPartyId =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionPartyId;
    purchaseRequisition_Save.purchaseRequisitionPartyName =
      this.SupplierMasterArray?.find(
        (j) =>
          j.suppliersMasterSupplierId ===
          this.purchaseRequisitionFormGroup.value.purchaseRequisitionPartyId
      )?.suppliersMasterSupplierName;
    // this.purchaseRequisitionFormGroup.value.purchaseRequisitionPartyName;

    purchaseRequisition_Save.purchaseRequisitionPartyAddress =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionPartyAddress;
    purchaseRequisition_Save.purchaseRequisitionPartyVatNo =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionPartyVatNo;
    purchaseRequisition_Save.purchaseRequisitionDescription =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionDescription;

    purchaseRequisition_Save.purchaseRequisitionGrno =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionGrno;
    purchaseRequisition_Save.purchaseRequisitionGrdate =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionGrdate;
    purchaseRequisition_Save.purchaseRequisitionLpono =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionLpono;
    purchaseRequisition_Save.purchaseRequisitionLpodate =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionLpodate;
    purchaseRequisition_Save.purchaseRequisitionQtnNo =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionQtnNo;
    purchaseRequisition_Save.purchaseRequisitionQtnDate =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionQtnDate;

    purchaseRequisition_Save.purchaseRequisitionPono =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionPono;
    purchaseRequisition_Save.purchaseRequisitionBatchCode =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionBatchCode;
    purchaseRequisition_Save.purchaseRequisitionDayBookNo =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionDayBookNo;
    purchaseRequisition_Save.purchaseRequisitionLocationId =
      this.purchaseRequisitionFormGroup.get('purchaseRequisitionLocationId')
        ?.value;
    purchaseRequisition_Save.purchaseRequisitionJobId =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionJobId ?? -1;

    purchaseRequisition_Save.purchaseRequisitionTotalGrossAmount = Number(
      this.purchaseRequisitionFormGroup.value
        .purchaseRequisitionTotalGrossAmount
    );
    purchaseRequisition_Save.purchaseRequisitionTotalItemDisAmount = Number(
      this.purchaseRequisitionFormGroup.value
        .purchaseRequisitionTotalItemDisAmount
    );
    purchaseRequisition_Save.purchaseRequisitionTotalDisPer = Number(
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionTotalDisPer
    );
    purchaseRequisition_Save.purchaseRequisitionTotalDisAmount = Number(
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionTotalDisAmount
    );
    purchaseRequisition_Save.purchaseRequisitionVatPer = Number(
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionVatPer
    );
    purchaseRequisition_Save.purchaseRequisitionVatAmt = Number(
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionVatAmt
    );
    purchaseRequisition_Save.purchaseRequisitionTotalActualAmount = Number(
      this.purchaseRequisitionFormGroup.value
        .purchaseRequisitionTotalActualAmount
    );
    purchaseRequisition_Save.purchaseRequisitionVatRoundSign =
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionVatRoundSign;
    //purchaseRequisition_Save.purchaseRequisitionVatRoundSign = '-';
    purchaseRequisition_Save.purchaseRequisitionVatRountAmt = Number(
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionVatRountAmt
    );
    purchaseRequisition_Save.purchaseRequisitionNetAmount = Number(
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionNetAmount
    );
    purchaseRequisition_Save.paymentTerms =
      this.purchaseRequisitionFormGroup.value.paymentTerms;
    purchaseRequisition_Save.deliveryatsite =
      this.purchaseRequisitionFormGroup.value.deliveryatsite;
    purchaseRequisition_Save.deliveryterms =
      this.purchaseRequisitionFormGroup.value.deliveryterms;
    purchaseRequisition_Save.confirmationemaildetails =
      this.purchaseRequisitionFormGroup.value.confirmationemaildetails;
    purchaseRequisition_Save.accountsTransactions = [];

    purchaseRequisition_Save.purchaseRequisitionDetails = savedData
      ?.filter((k) => k.itemname != null && k.qty != null)
      .map((k: any) => {
        return {
          purchaseRequisitionDetailsId: k.id != null ? k.id : 0,
          purchaseRequisitionDetailsNo:
            this.purchaseRequisitionFormGroup.getRawValue()
              .purchaseRequisitionNo,

          purchaseRequisitionId: 0,
          purchaseRequisitionDetailsMatId: k.itemId,
          purchaseRequisitionDetailsItemName: k.itemname,
          purchaseRequisitionDetailsQuantity: k.qty,
          purchaseRequisitionDetailsDiscAmount: k.disc,
          purchaseRequisitionDetailsRate: k.rate,
          PurchaseRequisitionDetailsActualAmount: k.amt,
          purchaseRequisitionDetailsNetAmt: k.netAmt,
          purchaseRequisitionDetailsGrossAmount: 0,
          purchaseRequisitionDetailsRemarks: k.narration,
          purchaseRequisitionDetailsSno: 0,
          purchaseRequisitionDetailsJobId:
            k.jobname != null && k.jobname !== ''
              ? this.jobArray?.find(
                  (j) => j.jobMasterJobName?.trim() === k.jobname?.trim()
                )?.jobMasterJobId
              : null,
          purchaseRequisitionDetailsSupplierId: k.supplierId,
          boqdId: k.dId ?? 0,
          customerQuotationDetailsId: k.customerQuotationDetailsId ?? 0,
          purchaseRequisitionDetailsBalQty:
            k.qty <= k.balQTY ? k.balQTY - k.qty : 0,
          purchaseRequisitionDetailsCostCenter:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                  (j) =>
                    j.costCenterMasterCostCenterName?.trim() ===
                    k.costcenter?.trim()
                ).costCenterMasterCostCenterId
              : -1,
          purchaseRequisitionDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                  (j) => j.unitMasterUnitShortName?.trim() === k.unit?.trim()
                ).unitMasterUnitId
              : null,
          purchaseRequisitionDetailsReqDate: new Date(
            +k.reqDate?.toString().split('/')[2],
            +k.reqDate?.toString().split('/')[1] - 1,
            +k.reqDate?.toString().split('/')[0]
          ),

          purchaseRequisitionDetailsDelStatus: false,

          // Quotation & Estimation Item fields
          QtnItemID: k.qtnItemId ?? null,
          QtnId: k.qtnId ?? null,
          purchaseRequisitionDetailsQtnId: k.qtnId ?? null,
          QtnItemName: k.quotationItem ?? null,
          EstItemId: k.estItemId ?? null,
          EstItemName: k.estimationItem ?? null,
        };
      });

    if (this.btnFlag.save) {
      this.saveVoucher(purchaseRequisition_Save);
    } else {
      this.updateVoucher(purchaseRequisition_Save);
    }
  }

  showtest: boolean = false;

  savePurchaseRequisition() {
    this.purchaseRequisitionFormGroup.markAllAsTouched();
    if (this.purchaseRequisitionFormGroup.invalid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Fill the Mendatory Fields',
      });
      return;
    }
    if (
      !this.JOBCOST ||
      this.purchaseRequisitionFormGroup.value.purchaseRequisitionJobId == null
    ) {
      this.onsave();
    } else {
      this.procurementapi
        .GetBalanceAmount(
          this.purchaseRequisitionFormGroup.value.purchaseRequisitionJobId
        )
        .subscribe((res: any) => {
          var data = res.resultSet?.balanceAmount;
          if (
            data <
            this.purchaseRequisitionFormGroup.value.purchaseRequisitionNetAmount
          ) {
            this.messageService.add({
              severity: 'info',
              summary: 'Alert',
              detail: 'Purchase Requisition is exceeding Job Budget',
            });
            this.showtest = true;
          } else {
            this.onsave();
          }
        });
    }
  }

  onConfirm() {
    this.showtest = false;
    this.onsave();
  }

  onCancel() {
    this.showtest = false;
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);

    hotInstance.setDataAtCell(this.activeRow.row, 6, null);
    hotInstance.setDataAtCell(this.activeRow.row, 8, null);
    this.GetTotal();
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  printAsPDF() {
    let html: any = document.getElementById('print');
    this.printService.saveAsPDF(html);
    this.userTrackingLog('PDf');
  }

  saveVoucher(purchaseRequisition_Save: PurchaseRequisition) {
    if (this.purchaseRequisitionFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.procurementapi
            .InsertPurchaseRequisition(purchaseRequisition_Save)
            .subscribe(
              (data) => {
                if (
                  data.message ==
                  'Approver Or Job not found for PurchaseRequisition'
                ) {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail: data.message,
                  });
                  return;
                }
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedPurchaseRequisition = data.result;
                this.userTrackingLog(
                  'Insert',
                  data.result?.purchaseRequisitionNo
                );

                this.savedPurchaseRequisition = data.result;
                this.PurchaseRequisitionPrint = data.result;
                this.updateFormGrid(data.result);
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
                  detail: 'Save Failed',
                });
              }
            );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.purchaseRequisitionFormGroup.markAllAsTouched();
      this.purchaseRequisitionFormGroup.markAsDirty();
    }
  }
  updateVoucher(purchaseRequisition_Save: PurchaseRequisition) {
    if (this.purchaseRequisitionFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.procurementapi
            .UpdatePurchaseRequisition(purchaseRequisition_Save)
            .subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedPurchaseRequisition = data.result;
                this.userTrackingLog(
                  'Update',
                  data.result?.purchaseRequisitionNo
                );

                this.updateFormGrid(data.result);
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Purchase Requisition Updated Succesfully',
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Purchase Requisition Update Failed',
                });
              }
            );
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
      this.purchaseRequisitionFormGroup.markAllAsTouched();
      this.purchaseRequisitionFormGroup.markAsDirty();
    }
  }
  browseQuatation() {
    const ref = this.dialogService.open(CustQuatationComponent, {
      header: 'Customer Quotation',
      width: '70%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {},
      baseZIndex: 1,
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        const changes: any[] = [];

        const dataArray = res?.filter((o) => o.isSelect);

        dataArray.forEach((k) => {
          const r = this.activeRow.row;

          changes.push([r, 0, k?.itemId]);
          changes.push([r, 2, k?.itemName]);
          changes.push([r, 3, k.unitName]);
          changes.push([r, 6, k?.itemQty]);
          changes.push([r, 7, k?.rate]);
          changes.push([r, 8, k?.itemQty * k?.rate]);
          changes.push([r, 10, k?.grossAmount]);
          changes.push([r, 13, k?.itemQty * k?.rate]);
          changes.push([r, 26, k?.quotationDetailsId]);
          this.activeRow.row += 1;
          this.lastexportArray.push(k.dId);
        });

        // Apply all changes at once
        hotInstance.setDataAtCell(changes);
      }
    });
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllPurchaseRequisition() {
    this.procurementapi.GetPurchaseRequisition().subscribe((data) => {
      this.purchaseRequisitionarry = data.result.map((i) => {
        i.jobname = this.getJobName(i.purchaseRequisitionJobId);
        return i;
      });
      this.filterArray = data.result;
    });
  }

  rptFilter: ReportFilterModel;
  crystalReport(type) {
    this.rptFilter = {
      ReportName: 'PurchaseRequisition',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_PurchaseRequisition where purchaserequisitionid ='${
          this.purchaseRequisitionFormGroup.getRawValue().purchaseRequisitionId
        }'`,
      ],
      SP_Queries: [],
      ExportType:
        type === 'pdf'
          ? ExportFormatType.PortableDocFormat
          : ExportFormatType.ExcelWorkbook,
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        if (type === 'pdf') {
          const blob = new Blob([response], { type: 'application/pdf' });
          this.pdfSource = URL.createObjectURL(blob);
          window.open(this.pdfSource);
        } else {
          const excelBlob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const reader = new FileReader();

          reader.onload = (e: ProgressEvent<FileReader>) => {
            const data = new Uint8Array(e.target!.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const htmlContent = XLSX.utils.sheet_to_html(worksheet);

            const fileUrl = URL.createObjectURL(excelBlob);
            const filename = `${this.rptFilter.ReportName}.xlsx`;

            const previewWindow = window.open('', '_blank');
            if (previewWindow) {
              previewWindow.document.write(`
                      <html>
                        <head>
                          <title>Excel Preview - ${filename}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            button {
                              padding: 10px 20px;
                              margin-bottom: 20px;
                              background-color: #007bff;
                              color: white;
                              border: none;
                              border-radius: 4px;
                              cursor: pointer;
                            }
                            button:hover {
                              background-color: #0056b3;
                            }
                            table { border-collapse: collapse; width: 100%; }
                            td, th { border: 1px solid #ccc; padding: 8px; }
                          </style>
                        </head>
                        <body>
                          <button onclick="downloadExcel()">Download Excel</button>
                          ${htmlContent}
                          <script>
                            function downloadExcel() {
                              const link = document.createElement('a');
                              link.href = '${fileUrl}';
                              link.download = '${filename}';
                              link.click();
                            }
                          </script>
                        </body>
                      </html>
                    `);
              previewWindow.document.close();
            } else {
              console.error('Failed to open preview window (popup blocker?)');
            }
          };

          reader.readAsArrayBuffer(excelBlob);
        }
      });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    )?.itemMasterItemName;
  }
  public getJobName(Id: number): string {
    return this.jobList?.find((j) => j.value === Id)?.label;
  }

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }

  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();

    this.LoadJobDDL();
    this.LoadUnitDDL();
    this.LoadCurrencyDDL();
    this.LoadLocationDDL();
    this.LoadSupplierDDL();
    this.LoadCostCentreDDL();
    if (this.vNo) {
      setTimeout(() => {
        this.GetSavedPurchaseRequisitionDetails(this.vNo);
      }, 2000);
    }
  }

  new() {
    this.itemList = [];
    this.callDropdowns();
    this.lastexportArray = [];
    this.purchaseRequisitionFormGroup.reset();
    this.purchaserequisition_entry.data = [];
    this.purchaserequisition_entry.readOnly = false;
    this.files = [];
    this.selectedCustomers = [];
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionVatRoundSign.setValue(
      '-'
    );
    this.activeRow = { row: 0, column: 0 };
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionType.setValue(
      'CREDIT'
    );
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionStatus.setValue(
      'OPEN'
    );

    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionVatPer.setValue(
      5
    );

    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.purchaserequisition_entry);
    this.updateTableConfigurationIfJobCostEnabled();
    this.accountTransactionList = [];
    this.purchaseRequisitionFormGroup
      .get('purchaseRequisitionId')
      .setValue(null);

    this.purchaseRequisitionFormGroup
      .get('purchaseRequisitionApproveEnable')
      .setValue(false);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.brosBtn = true;
    this.purchaseRequisitionFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseRequisitionFormGroup,
      'purchaseRequisitionLocationId',
      this.locationLocked
    );
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.purchaseRequisitionFormGroup,
        'purchaseRequisitionLocationId'
      );
    }
    this.f.purchaseRequisitionNo.clearValidators();
    this.purchaseRequisitionFormGroup.updateValueAndValidity();
    this.GetDefaultSettings();
    this.f.purchaseRequisitionDate.setValue(new Date());
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m: any) => {
      let list = m.resultSet.generalSettings;
      // currency
      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.purchaseRequisitionCurrencyId.setValue(
            Number(this.DefCurrency)
          );
        }
      }
      //location - now auto-selected from login localStorage
      // var DEFAULT_LOCATION = list?.filter(
      //   (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      // );

      // if (DEFAULT_LOCATION != null) {
      //   this.DefLocCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
      //   if (this.DefLocCheck !== null) {
      //     const splitText = this.DefLocCheck.split('::');
      //     this.DefLocid = splitText[1]?.trim();
      //   }
      // }
      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      this.JOBCOST = HIDE_JOBCOST[0]?.generalSettingsBoolValue ?? false;

      this.isHideTable = this.getPrHideTableColumnsValue(list);

      this.generalSettingsLoaded = true;
      this.applyGeneralColumnSettings(list);
      this.updateTableConfigurationIfJobCostEnabled();

      // USER_LOCK_LOCATION - now handled by LoadLocationDDL
      // var userLocation = list?.filter(
      //   (a) => a.generalSettingsKeyValue == 'USER_LOCK_LOCATION'
      // );
      // this.LOCKlOCATION = userLocation[0]?.generalSettingsBoolValue;
      // this.f.purchaseRequisitionLocationId.setValue(
      //   Number(this.LOCKlOCATION ? this.user.locationId : this.DefLocid)
      // );
    });
  }

  showMaximizableDialog() {
    this.callDropdowns();
    this.getAllPurchaseRequisition();
    this.displayMaximizable = true;
  }
  isPrintEnabled = false;
  isEditEnabled = false;
  updateFormGrid(purchaserequisition_update: PurchaseRequisition) {
    this.isPrintEnabled = purchaserequisition_update?.isPrintEnabled;
    this.isEditEnabled = purchaserequisition_update?.isEditEnabled;
    this.purchaseRequisitionFormGroup.patchValue({
      purchaseRequisitionId: purchaserequisition_update.purchaseRequisitionId,
      purchaseRequisitionNo: purchaserequisition_update.purchaseRequisitionNo,
      purchaseRequisitionDate: new Date(
        purchaserequisition_update.purchaseRequisitionDate
      ),
      purchaseRequisitionRefNo:
        purchaserequisition_update.purchaseRequisitionRefNo,
      purchaseRequisitionSupInvNo:
        purchaserequisition_update.purchaseRequisitionSupInvNo,
      purchaseRequisitionCurrencyId:
        purchaserequisition_update.purchaseRequisitionCurrencyId,
      // purchaseRequisitionExcludeVat: purchaserequisition_update.purchaseRequisitionExcludeVat,
      purchaseRequisitionStatus:
        purchaserequisition_update.purchaseRequisitionStatus,
      purchaseRequisitionType:
        purchaserequisition_update.purchaseRequisitionType,
      purchaseRequisitionPartyId:
        purchaserequisition_update.purchaseRequisitionPartyId,
      purchaseRequisitionPartyName:
        purchaserequisition_update.purchaseRequisitionPartyName,
      purchaseRequisitionPartyAddress:
        purchaserequisition_update.purchaseRequisitionPartyAddress,
      purchaseRequisitionPartyVatNo:
        purchaserequisition_update.purchaseRequisitionPartyVatNo,
      purchaseRequisitionDescription:
        purchaserequisition_update.purchaseRequisitionDescription,

      purchaseRequisitionGrno:
        purchaserequisition_update.purchaseRequisitionGrno,
      purchaseRequisitionGrdate: new Date(
        purchaserequisition_update.purchaseRequisitionGrdate
      ),
      purchaseRequisitionLpono:
        purchaserequisition_update.purchaseRequisitionLpono,
      purchaseRequisitionLpodate: new Date(
        purchaserequisition_update.purchaseRequisitionLpodate
      ),
      purchaseRequisitionQtnNo:
        purchaserequisition_update.purchaseRequisitionQtnNo,
      purchaseRequisitionQtnDate: new Date(
        purchaserequisition_update.purchaseRequisitionQtnDate
      ),

      purchaseRequisitionPono:
        purchaserequisition_update.purchaseRequisitionPono,
      purchaseRequisitionBatchCode:
        purchaserequisition_update.purchaseRequisitionBatchCode,
      purchaseRequisitionDayBookNo:
        purchaserequisition_update.purchaseRequisitionDayBookNo,
      purchaseRequisitionLocationId:
        purchaserequisition_update.purchaseRequisitionLocationId,
      purchaseRequisitionJobId:
        purchaserequisition_update.purchaseRequisitionJobId,

      purchaseRequisitionTotalGrossAmount:
        purchaserequisition_update.purchaseRequisitionTotalGrossAmount,
      purchaseRequisitionTotalItemDisAmount:
        purchaserequisition_update.purchaseRequisitionTotalItemDisAmount,
      purchaseRequisitionTotalDisPer:
        purchaserequisition_update.purchaseRequisitionTotalDisPer,
      purchaseRequisitionTotalDisAmount:
        purchaserequisition_update.purchaseRequisitionTotalDisAmount,
      purchaseRequisitionVatPer:
        purchaserequisition_update.purchaseRequisitionVatPer,
      purchaseRequisitionVatAmt:
        purchaserequisition_update.purchaseRequisitionVatAmt,
      purchaseRequisitionTotalActualAmount:
        purchaserequisition_update.purchaseRequisitionTotalActualAmount,
      purchaseRequisitionVatRoundSign:
        purchaserequisition_update.purchaseRequisitionVatRoundSign,
      purchaseRequisitionVatRountAmt:
        purchaserequisition_update.purchaseRequisitionVatRountAmt,
      purchaseRequisitionNetAmount:
        purchaserequisition_update.purchaseRequisitionNetAmount,
      purchaseRequisitionApproveEnable:
        purchaserequisition_update.purchaseRequisitionApproveEnable,
      purchaseRequisitionApproveUserId:
        purchaserequisition_update.purchaseRequisitionApprovedBy,
      purchaseRequisitionApproveUser: this.userlist?.find(
        (n) =>
          n.userId == purchaserequisition_update.purchaseRequisitionApprovedBy
      )?.userName,

      deliveryterms: purchaserequisition_update.deliveryterms,
      deliveryatsite: purchaserequisition_update.deliveryatsite,
      confirmationemaildetails:
        purchaserequisition_update.confirmationemaildetails,
      paymentTerms: purchaserequisition_update.paymentTerms,
    });

    this.accountTransactionList =
      purchaserequisition_update.accountsTransactions;
    // this.jobArray?.find(j => j.jobMasterJobName?.trim()  === k.jobname?.trim()).jobMasterId,
    const gridData: GridData[] =
      purchaserequisition_update.purchaseRequisitionDetails.map((k, i) => {
        const ItemId: string =
          k.purchaseRequisitionDetailsMatId != null
            ? this.ItemMasterArray?.find(
                (l) => l.itemMasterItemId == k.purchaseRequisitionDetailsMatId
              )?.itemMasterItemName
            : null;

        var UnitId: any = this.units?.find(
          (l) => l.unitMasterUnitId == k?.purchaseRequisitionDetailsUnitId
        );
        let supplier = this.SupplierMasterList?.find(
          (res) => res.value == k.purchaseRequisitionDetailsSupplierId
        )?.label;
        this.lastexportArray.push(k.boqdId ? k.boqdId : 0);
        this.activeRow.row = i + 1;
        const getValue = (value) => value ?? 0;

        let ballanceQTY =
          getValue(k.purchaseRequisitionDetailsBalQty) +
          getValue(k.purchaseRequisitionDetailsQuantity);
        return {
          Supplier: supplier,
          supplierId: k.purchaseRequisitionDetailsSupplierId,
          itemname: k.purchaseRequisitionDetailsItemName
            ? k.purchaseRequisitionDetailsItemName
            : ItemId,
          unit: UnitId?.unitMasterUnitShortName,
          conversionType: UnitId?.unitDetailsConversionType,
          qty: k.purchaseRequisitionDetailsQuantity,
          rate: k.purchaseRequisitionDetailsRate,
          disc: k.purchaseRequisitionDetailsDiscAmount,
          netAmt: k.purchaseRequisitionDetailsNetAmt,
          amt: k.purchaseRequisitionDetailsActualAmount,
          dId: k.boqdId ?? 0,

          jobname:
            k.purchaseRequisitionDetailsJobId != null
              ? this.jobList?.find(
                  (l) => l.value == k?.purchaseRequisitionDetailsJobId
                )?.label
              : null,
          balQTY: ballanceQTY,

          costcenter:
            k.purchaseRequisitionDetailsCostCenter != null
              ? this.costcenterArray?.find(
                  (l) =>
                    l.costCenterMasterCostCenterId ==
                    k?.purchaseRequisitionDetailsCostCenter
                )?.costCenterMasterCostCenterName
              : null,
          itemId: k.purchaseRequisitionDetailsMatId,
          narration: k.purchaseRequisitionDetailsRemarks,
          reqDate: new Date(
            k.purchaseRequisitionDetailsReqDate
          ).toLocaleDateString(),
          reqStatus: k.purchaseRequisitionDetailsReqStatus,
          id: k.purchaseRequisitionDetailsId,
          customerQuotationDetailsId: k.customerQuotationDetailsId,

          // Quotation & Estimation Item fields restored from backend
          quotationItem: k.qtnItemName ?? k.QtnItemName ?? null,
          qtnItemId: k.qtnItemID ?? null,
          estimationItem: k.estItemName ?? null,
          estItemId: k.estItemId ?? null,
        };
      });

    this.purchaserequisition_entry.data = gridData;
    this.purchaserequisition_entry.readOnly = true;
    this.purchaserequisition_entry.contextMenu = false;

    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.purchaseRequisitionFormGroup.disable();
    this.brosBtn = false;
    this.f.purchaseRequisitionNo.clearValidators();
    this.purchaseRequisitionFormGroup.updateValueAndValidity();
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  fileAttachmentDialogVisibility: boolean = false;
  customUploadHandler(event: any): void {
    const id = this.savedPurchaseRequisition?.purchaseRequisitionId;
    if (!id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing ID',
        detail: 'ID is required.',
      });
      return;
    }

    const formData = new FormData();

    for (const file of event.files) {
      formData.append('files', file); // Matches .NET controller's List<IFormFile> parameter
    }

    this.api.uploadDOCs(formData, id, 'PR').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Document saved successfully.',
        });
        this.fetchDocumentTree(id);
        this.fileAttachmentDialogVisibility = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'An error occurred while uploading.',
        });
      },
    });
  }

  handleChange(e) {
    if (e.index == 0) {
      requestAnimationFrame(() => {
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);

        if (hotInstance) {
          hotInstance.render();
        }
      });
    } else if (e.index == 2 && this.btnFlag.edit) {
      this.fetchDocumentTree(
        this.savedPurchaseRequisition?.purchaseRequisitionId
      );
    }
  }

  GetSavedPurchaseRequisitionDetails(id: string) {
    this.index = 0;

    // this.callDropdowns();

    this.procurementapi.GetSavedPurchaseRequisitionDetails(id).subscribe(
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
          this.savedPurchaseRequisition = data.result;
          this.PurchaseRequisitionPrint = data.result;
          this.purchaseRequisitionFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Purchase Requisition not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.purchaseRequisitionFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.procurementapi
          .DeletePurchaseRequisition(this.savedPurchaseRequisition)
          .subscribe(
            (data: any) => {
              this.userTrackingLog(
                'Delete',
                data.result?.purchaseRequisitionNo
              );
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Purchase Requisition Deleted Succesfully',
              });
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
    this.new();
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.purchaseRequisitionNo.clearValidators();
    this.brosBtn = true;
    this.purchaserequisition_entry.contextMenu = true;
    this.purchaserequisition_entry.readOnly = false;

    this.purchaseRequisitionFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseRequisitionFormGroup,
      'purchaseRequisitionLocationId',
      this.locationLocked
    );
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionNo.disable();
    this.purchaseRequisitionFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
    };
    this.updateTableConfigurationIfJobCostEnabled();
  }

  public get IsValidGrid(): boolean {
    if (this.purchaserequisition_entry.data.length > 0) {
      return Object.values(this.purchaserequisition_entry.data).some(
        (k: GridData) => k.itemname != null && k.qty != null
      );
    }
    return false;
  }

  selectprocurements(evt) {
    if (evt.job) {
      this.selectedjob = evt.job;
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 12, evt.job);
    } else if (evt.costCenterId) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 17, evt.costCenterLabel);
    } else if (evt.SupplierLabel) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 15, evt.SupplierLabel);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 24, evt.SupplierId);
      this.purchaseRequisitionFormGroup.controls.purchaseRequisitionPartyId.setValue(
        evt.SupplierId
      );
    } else if (evt.itemId !== undefined || evt.itemName !== undefined) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 4, evt.itemName);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 27, evt.itemId);
      if (evt.C_QtnId !== undefined) {
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 29, evt.C_QtnId);
      }
    } else if (evt.A_EstItemDesc !== undefined) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 5, evt.A_EstItemDesc);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 7, evt.B_EstRate ?? null);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 28, evt.__meta?.estItemId ?? null);
      if (evt.__meta?.qtnId !== undefined) {
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 29, evt.__meta?.qtnId);
      }
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
        unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
      );
      if (includesPcs && this.unitArray.length != 0) {
        var UnitId: any = this.unitArray?.find(
          (l) => l.unitMasterUnitId == evt.procurementsId
        );
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            3,
            UnitId?.unitMasterUnitShortName
          );
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            21,
            UnitId?.unitDetailsConversionType
          );
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 7, UnitId?.unitDetailsRate);
      } else {
        this.masterapi
          .GetItemMasterById({ id: evt.procurementsId, customerId: 0 })
          .subscribe((k) => {
            this.ItemMasterArrayByName = k.resultSet?.itemMaster;
            const hotInstance = this.hotRegisterer.getInstance(this.hotid);
            hotInstance.setDataAtCell(
              this.activeRow.row,
              2,
              this.ItemMasterArrayByName?.itemMasterItemName
            );

            if (this.ItemMasterArrayByName.unitDetails) {
              const unitId =
                this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
              hotInstance.setDataAtCell(
                this.activeRow.row,
                3,
                this.ItemMasterArrayByName.unitDetails
                  ?.unitDetailsConversionType
              );
              const UnitId: string =
                unitId != null
                  ? this.unitListt?.find((l) => l.value == unitId)?.label
                  : null;
              hotInstance.setDataAtCell(
                this.activeRow.row,
                0,
                this.ItemMasterArrayByName.itemMasterItemId
              );

              hotInstance.setDataAtCell(this.activeRow.row, 3, UnitId);
              hotInstance.setDataAtCell(
                this.activeRow.row,
                7,
                this.ItemMasterArrayByName.unitDetails?.unitDetailsRate
              );
              hotInstance.setDataAtCell(
                this.activeRow.row,
                21,
                this.ItemMasterArrayByName.unitDetails
                  ?.unitDetailsConversionType
              );

              // this.hotRegisterer.getInstance(this.hotid).selectCell(this.activeRow.row, 4)
            }
            const supID =
              this.purchaseRequisitionFormGroup.controls
                .purchaseRequisitionPartyId.value;

            if (supID != null || supID != -1) {
              hotInstance.setDataAtCell(
                this.activeRow.row,
                13,
                this.purchaseRequisitionFormGroup.controls
                  .purchaseRequisitionPartyName.value
              );
              hotInstance.setDataAtCell(
                this.activeRow.row,
                23,
                this.purchaseRequisitionFormGroup.controls
                  .purchaseRequisitionPartyId.value
              );
            }

            this.funitid =
              this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
            // const UnitId: string = this.funitid != null ? this.unitList?.find(l => l.value == this.funitid).label : null;
            const UnitId = this.unitArray[0]?.unitMasterUnitShortName;
            this.hotRegisterer
              .getInstance(this.hotid)
              .setDataAtCell(this.activeRow.row, 3, UnitId);
            this.hotRegisterer
              .getInstance(this.hotid)
              .setDataAtCell(this.activeRow.row, 14, this.selectedjob);
          });
      }
    }

    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
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
  }

  hide(evt: boolean) {
    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
  }

  getPIReport() {
    const fileName = String(new Date().valueOf());
    var css: string = `

    h5{
      margin-top: 0%;
    }
    .w60{
    width: 60px;
    }
    .w80{
    width: 130px;
    text-align: left;
    }
    .page-footer {
    position: running(footer);
    bottom: 0;
    width: 100%;
    visibility: visible;
    position: relative;
    height: 200px;
    margin-top: -200px; */
    }


    .border {
      border: 1px #b1aeae solid;
      border-radius: 5px;
      margin-bottom: 5px;
      padding: 15px;
    }
    .left {
      font-size: 16px;
      text-align: left;
    }

    .right {
      font-size: 16px;
      text-align: right;

    }
    #Voucher {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
      font-size: 12px;
    }

    #Voucher td, #Voucher th {
      border: 1px solid #ddd;
      padding: 8px;

    }



    #Voucher th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      color: rgb(0, 0, 0);
      text-align: center;

    }


    #payment {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;

    }

    #payment td, #payment th {
      border: 1px solid #ddd;
      padding: 8px;

    }



    #payment th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      color: rgb(0, 0, 0);
      text-align: center;
    }
    .page{
      padding-left: 15px;
      text-align: center;
    }


    .end {
      text-align: end;
    }

.center {
  text-align: center !important;
}
.w-100 {
  width: 100% !important;
}
.wp-50{
  width: 50% !important;
}

.flexcol {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.flexrow {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: start;
}
    .rounded-table{
       border: 2.5px solid rgb(86, 87, 87);
    border-collapse:separate;
    width: 88%;
    margin-left: 8%;
    margin-top: 5px;
    border-radius: 10px;
    }
  `;
    var data = document.getElementById('print');
    // let html: any = document.getElementById('print');
    // this.printService.saveAsPDF(data, 'saleVoucherPDF');
    this.printService.PrintPDF('print', css);
  }

  userTrackingLog(type, vno?: any) {
    let req = {
      page: 'Purchase Reguisition',
      // section: this.savedPurchaseRequisition,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: vno,
      vpType: 'Purchase Reguisition',
      vpUserId: this.permission.getUser()?.userId,
    };

    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  browsboq() {
    let jobVale = this.purchaseRequisitionFormGroup.get(
      'purchaseRequisitionJobId'
    ).value
      ? this.purchaseRequisitionFormGroup.get('purchaseRequisitionJobId').value
      : 0;

    this.getBoqList(jobVale);
    this.displayMaximizable1 = true;
  }

  close() {
    this.displayMaximizable1 = false;
  }

  getItemNameById(id) {
    let item = this.ItemMasterList?.find((l) => l.value == id);
    return item?.label;
  }

  GetUnitById(id) {
    let unit = this.units?.find((l) => l.unitMasterUnitId == id);
    return unit?.unitMasterUnitShortName?.trim();
  }

  getJobNameById(id) {
    let job = this.jobList?.find((l) => l.value == id);
    return job?.label;
  }

  onSelectAll() {
    if (this.isSelect) {
      this.Arraylist.map((o) => (o.isSelect = true));
    } else {
      this.Arraylist.map((o) => (o.isSelect = false));
    }
  }

  getBoqList(jobid) {
    this.Arraylist = [];
    this.BoqListFilterForm.get('JobName').setValue(jobid);
    this.procurementapi.getBoqlist(jobid).subscribe((res: any) => {
      res.resultSet.result.forEach((e) => {
        if (!this.lastexportArray.includes(e.dId)) {
          this.Arraylist.push(e);
          this.filterArrayListListBoq = res.resultSet.result;
        }
      });
    });
  }

  onJobChange(event: any) {
    this.purchaseRequisitionFormGroup
      .get('purchaseRequisitionJobId')
      .setValue(event.value);
    this.getBoqList(event.value);
  }
  export() {
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    const changes: any[] = [];

    const dataArray = this.Arraylist?.filter((o) => o.isSelect);

    dataArray.forEach((k) => {
      if (!this.lastexportArray.includes(k.dId)) {
        const unitLabel = this.unitListt?.find(
          (l) => l.value === k.unitCode
        )?.label;
        const SupplierId = this.SupplierMasterList?.find(
          (i) => i.value == k.supplierId && k.supplierId != -1
        )?.label;

        const r = this.activeRow.row;

        changes.push([r, 0, k?.itemCode]);
        changes.push([r, 2, k?.itemName]);
        changes.push([r, 3, unitLabel]);
        changes.push([r, 6, k?.balanceQty]);
        changes.push([r, 22, k?.id]);
        changes.push([r, 15, SupplierId]);
        changes.push([r, 7, k?.rate]);
        changes.push([r, 23, k?.balanceQty]);
        changes.push([r, 24, k?.supplierId]);
        changes.push([r, 8, k?.amount]);

        this.activeRow.row += 1;
        this.lastexportArray.push(k.dId);
      }
    });

    // Apply all changes at once
    hotInstance.setDataAtCell(changes);

    // Clean up Arraylist outside loop
    this.Arraylist = this.Arraylist?.filter(
      (x) => !this.lastexportArray.includes(x.dId)
    );
    this.purchaseRequisitionFormGroup
      .get('purchaseRequisitionJobId')
      .setValue(dataArray[0].customerEnqId);
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionPartyName.setValue(
      this.SupplierMasterList?.find(
        (i) =>
          i.value == dataArray[0].supplierId && dataArray[0].supplierId != -1
      )?.label
    );
    this.purchaseRequisitionFormGroup.controls.purchaseRequisitionPartyId.setValue(
      dataArray[0].supplierId
    );
    this.displayMaximizable1 = false;
  }

  filter() {
    let filteredArray = this.filterArray;
    if (this.purchaseRequisitionFilterForm.value.filterVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.purchaseRequisitionNo ===
          this.purchaseRequisitionFilterForm.value.filterVoucherNo.toUpperCase()
      );
    }
    // this.currencyList

    if (this.purchaseRequisitionFilterForm.value.filterjob != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.purchaseRequisitionJobId ===
          this.purchaseRequisitionFilterForm.value.filterjob
      );
    }

    if (this.purchaseRequisitionFilterForm.value.isDate) {
      const fromDateStr = this.purchaseRequisitionFilterForm.value.fromDate;
      const toDateStr = this.purchaseRequisitionFilterForm.value.toDate;

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      // Check for valid dates
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        console.error('Invalid date(s) provided:', fromDateStr, toDateStr);
        return; // Exit if dates are invalid
      }

      // Set hours to 0 for comparison
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.purchaseRequisitionDate);
        voucherDate.setHours(0, 0, 0, 0);

        console.log('Voucher Date:', voucherDate);
        console.log('From Date:', fromDate);
        console.log('To Date:', toDate);

        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.purchaseRequisitionarry = filteredArray;
    }

    this.purchaseRequisitionarry = filteredArray;
  }

  ClearFilter() {
    this.purchaseRequisitionFilterForm.reset();
    this.purchaseRequisitionarry = this.filterArray;
    this.purchaseRequisitionFilterForm.get('fromDate').setValue(new Date());
    this.purchaseRequisitionFilterForm.get('toDate').setValue(new Date());
  }
  get jobsLookup() {
    return this.jobList.map((kl) => ({
      job: kl.label,
      jobId: kl.value,
    }));
  }

  filterBOQ() {
    let filteredArray = this.filterArrayListListBoq;
    if (this.BoqListFilterForm.value.boqNo != null) {
      const boqNoValue = this.BoqListFilterForm.value.boqNo.toUpperCase();
      filteredArray = filteredArray?.filter((res) =>
        res.billofqtyNo?.toUpperCase().includes(boqNoValue)
      );
    }

    if (this.BoqListFilterForm.value.isDate) {
      const fromDateStr = this.BoqListFilterForm.value.fromDate;
      const toDateStr = this.BoqListFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.date);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });
      // this.Arraylist = filteredArray;
    }
    this.Arraylist = filteredArray;
  }

  ClearFilterBOQ() {
    this.itemList = [];
    this.BoqListFilterForm.reset();
    this.isSelect = false;
    this.Arraylist = this.filterArrayListListBoq;
    this.Arraylist.map((o) => (o.isSelect = false));
    this.BoqListFilterForm.get('fromDate').setValue(new Date());
    this.BoqListFilterForm.get('toDate').setValue(new Date());
  }

  onSearch(term: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        sales: kl?.itemMasterItemName,
        salesId: kl?.itemMasterItemId,
        barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
        size: kl?.itemMasterItemSize,
        brand: this.brandArry?.find(
          (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
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
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
    });
  }

  previewUrl: SafeResourceUrl | null = null;
  onNodeSelect(event: any): void {
    const fileUrl = event.node.data;
    if (fileUrl && event.node.key !== 0 && event.node.key !== '0') {
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        fileUrl + '#navpanes=0&scrollbar=0'
      );
    }
  }
  isChildNode(node: TreeNode): boolean {
    return this.files.some((parent) =>
      parent.children?.some((child) => child === node)
    );
  }

  onDeleteNode(node: TreeNode) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete existing Document?',
      accept: () => {
        const id: number = Number(node.key?.split('-')[1]);
        this.api.DeleteDocument(id).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Deleted Succesfully',
            });
            this.fetchDocumentTree(
              this.savedPurchaseRequisition.purchaseRequisitionId
            );
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: ' Failed',
            });
          }
        );
      },
    });
  }

  attachmentsToUploaded: any[] = [];
  showFileAttachmentDialog() {
    this.fileAttachmentDialogVisibility = true;
  }

  onUpload(event: UploadEvent) {
    for (let file of event.files) {
      this.attachmentsToUploaded.push(file);
    }
    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: '',
    });
  }

  downloadAllDocuments() {
    const jobId = this.purchaseRequisitionFormGroup.value.purchaseRequisitionId;
    this.api
      .downloadAllFilesAsOnePdf(jobId, 'PR', {
        responseType: 'blob',
        observe: 'response' as 'body',
      })
      .subscribe((response: any) => {
        const blob = new Blob([response.body], { type: response.body.type });

        // Extract filename from content-disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${this.purchaseRequisitionFormGroup.value.purchaseRequisitionNo}`;

        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
            contentDisposition
          );
          if (matches && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  fetchDocumentTree(jobId: any): void {
    this.previewUrl = '';
    this.masterapi.GetDocumentTree(jobId, 'PR').subscribe((res) => {
      if (res?.valid && res?.result) {
        this.files = [];
        const ports = environment.apiRootURL?.replace('api', 'pdfs');
        const documentNodes: TreeNode[] = res?.result?.map(
          (doc: any, index: number) => {
            return {
              key: `0-${doc.fileId}`,
              label: doc.fileName,
              data: `${ports}${doc.filePath}`,
              icon: 'pi pi-file-pdf',
            };
          }
        );

        this.files = [
          {
            key: '0',
            label: 'Documents',
            data: 'Documents Folder',
            icon: 'pi pi-fw pi-folder',
            children: documentNodes,
          },
        ];
      }
    });
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
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}
interface GridData {
  dId?: any;
  itemId?: any;
  partNo?: string;
  itemname?: string;
  unit?: string;
  quotationItem?: string;
  estimationItem?: string;
  qty?: number;
  rate?: number;
  amt?: number;
  disc?: number;
  conversionType?: number;
  grossAmt?: number;
  vatPer?: number;
  vatAmt?: number;
  netAmt?: number;
  narration?: string;

  jobname?: string;
  costcenter?: string;

  id?: number;
  reqDate?: string;
  reqStatus?: string;
  job?: string;
  qtnItemId?: number;
  estItemId?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const columnDetailList = (component: PurchaserequisitionComponent) => [
  {
    data: 'itemId',
    type: 'numeric',
    label: 'Item Id',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
  },
  {
    data: 'itemname',
    type: 'autocomplete',
    label: 'Item',
    source: component.ItemMasterArry,
    strict: false,
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    source: component.unitArry,
    strict: false,
  },
  {
    data: 'quotationItem',
    type: 'text',
    label: 'Quotation Item',
    readOnly: false,
  },
  {
    data: 'estimationItem',
    type: 'text',
    label: 'Estimation Item',
    readOnly: false,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Qty',
    readOnly: false,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    readOnly: false,
  },
  {
    data: 'amt',
    type: 'numeric',
    label: 'Amt',
  },
  {
    data: 'disc',
    type: 'numeric',
    label: 'Disc.',
    readOnly: false,
  },
  {
    data: 'grossAmt',
    type: 'numeric',
    label: 'Gross Amt',
  },
  {
    data: 'vatPer',
    type: 'numeric',
    label: 'VAT%.',
  },
  {
    data: 'vatAmt',
    type: 'numeric',
    label: 'VAT.Amt',
  },
  {
    data: 'netAmt',
    type: 'numeric',
    label: 'Net.Amt',
  },
  {
    data: 'jobname',
    type: 'dropdown',
    label: 'Job Name',
    source: component.jobArry,
  },
  {
    data: 'Supplier',
    type: 'dropdown',
    label: 'Supplier',
    source: component.SupplierMasterArry,
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Remarks',
    readOnly: false,
  },
  {
    data: 'costcenter',
    type: 'dropdown',
    label: 'Cost Center',
    source: component.costcenterArry,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
  },
  {
    data: 'reqDate',
    type: 'date',
    label: 'Req Date',
    dateFormat: 'DD/MM/YYYY',
  },
  {
    data: 'reqStatus',
    type: 'dropdown',
    label: 'Req Status',
    source: ['', 'OPEN', 'CLOSE'],
  },
  {
    data: 'conversionType',
    type: 'numeric',
    label: 'Conversion Type',
  },
  {
    data: 'dId',
    type: 'numeric',
    label: 'BOQ Detail ID',
  },
  {
    data: 'balQTY',
    type: 'numeric',
    label: 'Balance Qty',
  },
  {
    data: 'supplierId',
    type: 'numeric',
    label: 'Supplier ID',
  },
  {
    data: 'placeholder',
    type: 'text',
    label: 'Placeholder',
  },
  {
    data: 'customerQuotationDetailsId',
    type: 'numeric',
    label: 'Customer Quotation Details ID',
  },
  {
    data: 'qtnItemId',
    type: 'numeric',
    label: 'QtnItemId',
  },
  {
    data: 'estItemId',
    type: 'numeric',
    label: 'EstItemId',
  },
  {
    data: 'qtnId',
    type: 'numeric',
    label: 'QtnId',
  },
];
