import { DatePipe } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import { log } from 'console';
import Handsontable from 'handsontable';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  SelectItem,
} from 'primeng';
import {
  ChartofAccounts,
  DepartmentMaster,
  ItemMaster,
} from 'src/app/routes/domain';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { ViewAccountsTransactionsVoucherType } from 'src/app/routes/domain/Accounts/ViewAccountsTransactionsVoucherType';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { PurchaseOrderReportParameters } from 'src/app/routes/domain/Procurements/PurchaseOrderReportParameters';
import { ReportPurchaseOrder } from 'src/app/routes/domain/Procurements/ReportPurchaseOrder';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { DatefilterComponent } from 'src/app/shared/component/datefilter/datefilter.component';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { defaults } from 'src/app/shared/service/settings';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';

@Component({
  selector: 'app-reportpurchaseorder',
  templateUrl: './reportpurchaseorder.component.html',
  styleUrls: ['./reportpurchaseorder.component.scss'],
})
export class ReportpurchaseorderComponent implements OnInit {
  @ViewChild(DatefilterComponent) datefilterComponent!: DatefilterComponent;
  confirmDropDatabaseDialogVisible = false;

  TotRunningBalanceCreditDebit: string;
  rptFilter: ReportFilterModel;
  pdfSource: any;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];

  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];

  DepartmentMasterArray: DepartmentMaster[] = [];
  DepartmentMasterArry: string[] = [];
  DepartmentMasterList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  V_TYPEArray: ViewAccountsTransactionsVoucherType[] = [];
  V_TYPEArry: string[] = [];
  V_TYPEList: SelectItem[];

  VendorMasterArray: ItemMaster[] = [];
  VendorMasterArry: string[] = [];
  VendorMasterList: SelectItem[];

  ItemMasterGroupArray: ItemMaster[] = [];
  ItemMasterGroupArry: string[] = [];
  ItemMasterGroupList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  locationLocked: boolean = false;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [
    // { label: '--Select Job--', value: -1 },
    // { label: 'JOB-001 - Building A', value: 1 },
    // { label: 'JOB-002 - Warehouse Expansion', value: 2 },
    // { label: 'JOB-003 - Maintenance Work', value: 3 },
  ];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  reportSalesVoucher: ReportPurchaseOrder[] = [];
  Permission: any;
  ScreenId: number;
  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  MainItemMasterList: any[];
  initialControlLoaded = false;

  FILL_COMBO() {
    this.v_typeList = [
      { label: 'ALL', value: { name: 'ALL' } },
      { label: 'CASH', value: { name: 'CASH' } },
      { label: 'CREDIT', value: { name: 'CREDIT' } },
    ];
    this.v_RoundoffList = [
      { label: '+', value: { name: '+' } },
      { label: '-', value: { name: '-' } },
    ];
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router,

    private formatDateService: ReportDateFormatService,
    private datepipes: DatePipe,
    private permission: PermissionsService,
    private accountapi: AccountApiService,
  private utilityService: UtilityService,
  private crystalReportService: CrystalReportService,
  private storage: LocalStorageService
) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'reportpurchaseorder_HotEntry';
  reportpurchaseorder_entry: Handsontable.GridSettings;
  reportPurchaseOrderFormGroup: FormGroup;
  // locationLocked = false;
  reportpurchaseorder_entryDataset = [];
  cols;
  stationmasterObj: StationMaster;

  ngOnInit(): void {
    console.log(" this is report purchase order");
          this.stationmasterObj = this.permission.getStation();

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
    this.FILL_COMBO();

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };

    this.initializeControls();
    this.reportPurchaseOrderFormGroup = this.fb.group({
      rptSummary: [{ value: false, disabled: true }],
      rptDetails: [{ value: true, disabled: true }],
      rptDateRange: [{ value: false, disabled: true }],
      rptDtpFrom: [{ value: [null], disabled: true }],
      rptDtpTo: [{ value: [null], disabled: true }],
      rptPrintGroupByItem: [{ value: true, disabled: true }],
      rptJob: [{ value: [-1], disabled: true }],
      rptLocation: [{ value: [-1], disabled: true }],
      rptSupplier: [{ value: [-1], disabled: true }],
      rptBrand: [{ value: [-1], disabled: true }],
      rptItemGroup: [{ value: [-1], disabled: true }],
      rptItem: [{ value: [-1], disabled: true }],
      rptCurrency: [{ value: [-1], disabled: true }],
      rptSalesMan: [{ value: [-1], disabled: true }],
      rptInvoiceType: [{ value: 'ALL', disabled: true }],

      rptNetAmt: [{ value: [null], disabled: true }],
      rptDiscAmt: [{ value: [null], disabled: true }],
      rptSuppInvNo: [{ value: [''], disabled: true }],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });

    this.new();

    this.reportPurchaseOrderFormGroup.disable();
    this.reportPurchaseOrderFormGroup.get('rptDtpFrom').setValue(new Date());
    this.reportPurchaseOrderFormGroup.get('rptDtpTo').setValue(new Date());
  }
showPrint() {
  let isDate = this.enableDate;

  let currency = this.reportPurchaseOrderFormGroup.get('rptCurrency')?.value;
  let item = this.reportPurchaseOrderFormGroup.get('rptItem')?.value;
  let rptSuppInvNo =
    this.reportPurchaseOrderFormGroup.get('rptSuppInvNo')?.value;
  let supplier = this.reportPurchaseOrderFormGroup.get('rptSupplier')?.value;
  let location = this.reportPurchaseOrderFormGroup.get('rptLocation')?.value;
  let job = this.reportPurchaseOrderFormGroup.get('rptJob')?.value;

  let rawInvoiceType =
    this.reportPurchaseOrderFormGroup.get('rptInvoiceType')?.value;

  let invoiceType = rawInvoiceType?.name
    ? rawInvoiceType.name
    : rawInvoiceType;

  const { fromDate, toDate } =
    this.datefilterComponent.onApplyDateFilter();

  const formatPayloadDate = (value: any, fallbackValue: any) => {
    if (typeof value === 'string' && value.includes('T')) {
      return value.split('T')[0].replace(/-/g, '/');
    }

    if (typeof value === 'string' && value.includes('-')) {
      return value.split(' ')[0].replace(/-/g, '/');
    }

    return this.datepipes.transform(fallbackValue, 'yyyy/MM/dd');
  };

  const startDate = formatPayloadDate(
    fromDate,
    this.reportPurchaseOrderFormGroup.get('rptDtpFrom')?.value ?? new Date()
  );

  const endDate = formatPayloadDate(
    toDate,
    this.reportPurchaseOrderFormGroup.get('rptDtpTo')?.value ?? new Date()
  );

  const ponoValue =
    rptSuppInvNo && rptSuppInvNo.trim() !== ''
      ? rptSuppInvNo.trim()
      : 'All';

  const supplierIdValue =
    supplier && supplier != -1 ? String(supplier) : 'All';

  const locationIdValue =
    location && location != -1 ? String(location) : 'All';

  const jobIdValue =
    job && job != -1 ? String(job) : 'All';

  const startDateValue = isDate ? startDate : 'All';
  const endDateValue = isDate ? endDate : 'All';

  const reportCriteria =
    isDate && startDate && endDate
      ? `From ${startDate} To ${endDate}`
      : 'All';

  // =========================================================
  // BUILD CRYSTAL REPORT SELECTION FORMULA
  // =========================================================

  let selectionFormula = '';
  const selectionFormulaSource ='vw_po'
    this.Summary
      // ? 'GetPurchaseOrderSummaryReport;1'
      // : 'vw_po';

  // Date
  if (isDate) {
    selectionFormula +=
      `{${selectionFormulaSource}.PurchaseOrderDate} >= DateTime(${new Date(startDate).getFullYear()}, ${new Date(startDate).getMonth() + 1}, ${new Date(startDate).getDate()}, 0, 0, 0)`;

    selectionFormula +=
      ` AND {${selectionFormulaSource}.PurchaseOrderDate} <= DateTime(${new Date(endDate).getFullYear()}, ${new Date(endDate).getMonth() + 1}, ${new Date(endDate).getDate()}, 23, 59, 59)`;
  }

  // Currency
  if (currency && currency != -1) {
    selectionFormula +=
      `${selectionFormula ? ' AND ' : ''}{${selectionFormulaSource}.PurchaseOrderCurrencyId} = ${currency}`;
  }

  // Supplier
  if (supplier && supplier != -1) {
    selectionFormula +=
      `${selectionFormula ? ' AND ' : ''}{${selectionFormulaSource}.PurchaseOrderPartyId} = ${supplier}`;
  }

  // Supplier Invoice No
  if (rptSuppInvNo && rptSuppInvNo.trim() !== '') {
    const escapedInvoiceNo = rptSuppInvNo
      .trim()
      .replace(/'/g, "''");

    selectionFormula +=
      `${selectionFormula ? ' AND ' : ''}{${selectionFormulaSource}.PurchaseOrderSupInvNo} = '${escapedInvoiceNo}'`;
  }

  // Item
  if (item && item != -1) {
    selectionFormula +=
      `${selectionFormula ? ' AND ' : ''}{${selectionFormulaSource}.Item_Master_Item_ID} = ${item}`;
  }

  // Location
  if (location && location != -1) {
    selectionFormula +=
      `${selectionFormula ? ' AND ' : ''}{${selectionFormulaSource}.PurchaseOrderLocationID} = ${location}`;
  }

  // Job
  if (job && job != -1) {
    selectionFormula +=
      `${selectionFormula ? ' AND ' : ''}{${selectionFormulaSource}.job_master_job_id} = ${job}`;
  }

  // Invoice Type
  if (invoiceType && invoiceType !== 'ALL') {
    const escapedInvoiceType = invoiceType.replace(/'/g, "''");

    selectionFormula +=
      `${selectionFormula ? ' AND ' : ''}{${selectionFormulaSource}.PurchaseOrderType} = '${escapedInvoiceType}'`;
  }

  // =========================================================
  // REPORT FILTER
  // =========================================================

  this.rptFilter = {
    ReportName: this.Summary
      ? 'PurchaseOrderReportSummary'
      : 'CrpPurchaseOrderReportDetails',

    SelectionFormula: selectionFormula,

    Parameters: this.Summary
      ? [
          // {
          //   Key: '@PONO',
          //   Value: ponoValue,
          // },
          // {
          //   Key: '@StartDate',
          //   Value: startDateValue,
          // },
          // {
          //   Key: '@EndDate',
          //   Value: endDateValue,
          // },
          // {
          //   Key: '@SupplierId',
          //   Value: supplierIdValue,
          // },
          // {
          //   Key: '@LocationId',
          //   Value: locationIdValue,
          // },
           {
            Key: 'CompanyName',
            Value: this.stationmasterObj.stationMasterStationName,
          },
          {
            Key: 'ReportCriteria',
            Value: reportCriteria,
          },
          // {
          //   Key: '@JobID',
          //   Value: jobIdValue,
          // },
        ]
      : [
          {
            Key: 'CompanyName',
            Value: this.stationmasterObj.stationMasterStationName,
          },
          {
            Key: 'ReportCriteria',
            Value: reportCriteria,
          },
        ],

    // ❌ Query removed
    Queries: [],

     SP_Queries   : [],
    //  this.Summary
    //   ? [
    //       {
    //         SP_Name: 'GetPurchaseOrderSummaryReport',
    //         Parameters: [
    //           {
    //             Key: '@PONO',
    //             Value: ponoValue,
    //           },
    //           {
    //             Key: '@StartDate',
    //             Value: startDateValue,
    //           },
    //           {
    //             Key: '@EndDate',
    //             Value: endDateValue,
    //           },
    //           {
    //             Key: '@SupplierId',
    //             Value: supplierIdValue,
    //           },
    //           {
    //             Key: '@LocationId',
    //             Value: locationIdValue,
    //           },
    //           {
    //             Key: '@JobID',
    //             Value: jobIdValue,
    //           },
    //         ],
    //       },
    //     ]
    
  };
  this.crystalReportService
    .getReportPrint(this.rptFilter, false)
    .subscribe((response) => {
      const blob = new Blob([response], {
        type: 'application/pdf',
      });

      this.pdfSource = URL.createObjectURL(blob);

      window.open(this.pdfSource);
    });
}
  // showPrint() {
  //   let isDate = this.enableDate;
  //   let currency = this.reportPurchaseOrderFormGroup.get('rptCurrency')?.value;
  //   let item = this.reportPurchaseOrderFormGroup.get('rptItem')?.value;
  //   let rptSuppInvNo =
  //     this.reportPurchaseOrderFormGroup.get('rptSuppInvNo')?.value;
  //   let supplier = this.reportPurchaseOrderFormGroup.get('rptSupplier')?.value;
  //   let location = this.reportPurchaseOrderFormGroup.get('rptLocation')?.value;
  //   let job = this.reportPurchaseOrderFormGroup.get('rptJob')?.value;
  //   let rawInvoiceType = this.reportPurchaseOrderFormGroup.get('rptInvoiceType')?.value;
  //   let invoiceType = rawInvoiceType?.name ? rawInvoiceType.name : rawInvoiceType;
  //   const { fromDate, toDate } = this.datefilterComponent.onApplyDateFilter();
  //   const formatPayloadDate = (value: any, fallbackValue: any) => {
  //     if (typeof value === 'string' && value.includes('T')) {
  //       return value.split('T')[0].replace(/-/g, '/');
  //     }
  //     if (typeof value === 'string' && value.includes('-')) {
  //       return value.split(' ')[0].replace(/-/g, '/');
  //     }
  //     return this.datepipes.transform(fallbackValue, 'yyyy/MM/dd');
  //   };

  //   const startDate = formatPayloadDate(
  //     fromDate,
  //     this.reportPurchaseOrderFormGroup.get('rptDtpFrom')?.value ?? new Date()
  //   );
  //   const endDate = formatPayloadDate(
  //     toDate,
  //     this.reportPurchaseOrderFormGroup.get('rptDtpTo')?.value ?? new Date()
  //   );
  //   const ponoValue =
  //     rptSuppInvNo && rptSuppInvNo.trim() !== '' ? rptSuppInvNo.trim() : 'All';
  //   const supplierIdValue = supplier && supplier != -1 ? String(supplier) : 'All';
  //   const locationIdValue = location && location != -1 ? String(location) : 'All';
  //   const jobIdValue = job && job != -1 ? String(job) : 'All';
  //   const startDateValue = isDate ? startDate : 'All';
  //   const endDateValue = isDate ? endDate : 'All';
  //   const reportCriteria =
  //     isDate && startDate && endDate ? `From ${startDate} To ${endDate}` : 'All';
  //   let query = 'select * from vw_po where 1 = 1';

  //   // ✅ Apply filters dynamically (all scenarios)
  //   if (isDate) {
  //     query += ` AND PurchaseOrderDate BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'`;
  //   }

  //   if (currency && currency != -1) {
  //     query += ` AND PurchaseOrderCurrency = ${currency}`;
  //   }

  //   if (supplier && supplier != -1) {
  //     query += ` AND PurchaseOrderSupplierId = ${supplier}`;
  //   }

  //   if (rptSuppInvNo && rptSuppInvNo.trim() !== '') {
  //     query += ` AND SupplierInvoiceNo = '${rptSuppInvNo}'`;
  //   }

  //   if (item && item != -1) {
  //     query += ` AND ItemId = ${item}`;
  //   }

  //   if (location && location != -1) {
  //     query += ` AND PurchaseOrderLocationId = ${location}`;
  //   }

  //   if (job && job != -1) {
  //     query += ` AND PurchaseOrderJobId = ${job}`;
  //   }

  //  if (invoiceType && invoiceType !== 'ALL') {
  //     query += ` AND PurchaseOrderType = '${invoiceType}'`;
  //   }

  //   this.rptFilter = {
  //     ReportName: this.Summary
  //       ? 'PurchaseOrderReportSummary'
  //       : 'CrpPurchaseOrderReportDetails',
  //     SelectionFormula: '',
  //     Parameters: this.Summary
  //       ? [
  //           {
  //             Key: '@PONO',
  //             Value: ponoValue,
  //           },
  //           {
  //             Key: '@StartDate',
  //             Value: startDateValue,
  //           },
  //           {
  //             Key: '@EndDate',
  //             Value: endDateValue,
  //           },
  //           {
  //             Key: '@SupplierId',
  //             Value: supplierIdValue,
  //           },
  //           {
  //             Key: '@LocationId',
  //             Value: locationIdValue,
  //           },
  //           {
  //             Key: 'CompanyName',
  //             Value: this.stationmasterObj.stationMasterStationName,
  //           },
  //           {
  //             Key: 'ReportCriteria',
  //             Value: reportCriteria,
  //           },
  //           {
  //             Key: '@JobID',
  //             Value: jobIdValue,
  //           },
  //         ]
  //       : [
  //           {
  //             Key: 'CompanyName',
  //             Value: this.stationmasterObj.stationMasterStationName,
  //           },
  //           {
  //             Key: 'ReportCriteria',
  //             Value: reportCriteria,
  //           },
  //         ],
  //     Queries: this.Summary ? [] : [query],
  //     SP_Queries: this.Summary
  //       ? [
  //           {
  //             SP_Name: 'GetPurchaseOrderSummaryReport',
  //             Parameters: [
  //               {
  //                 Key: '@PONO',
  //                 Value: ponoValue,
  //               },
  //               {
  //                 Key: '@StartDate',
  //                 Value: startDateValue,
  //               },
  //               {
  //                 Key: '@EndDate',
  //                 Value: endDateValue,
  //               },
  //               {
  //                 Key: '@SupplierId',
  //                 Value: supplierIdValue,
  //               },
  //               {
  //                 Key: '@LocationId',
  //                 Value: locationIdValue,
  //               },
  //               {
  //                 Key: '@JobID',
  //                 Value: jobIdValue,
  //               },
  //             ],
  //           },
  //         ]
  //       : [],
  //   };

  //   this.crystalReportService
  //     .getReportPrint(this.rptFilter, false)
  //     .subscribe((response) => {
  //       const blob = new Blob([response], { type: 'application/pdf' });
  //       this.pdfSource = URL.createObjectURL(blob);
  //       window.open(this.pdfSource);
  //     });
  // }

  get f() {
    return this.reportPurchaseOrderFormGroup.controls;
  }

  initializeControls() {
    if (this.initialControlLoaded) {
      if (this.locationLocked) {
        this.utilityService.applyLocationLock(
          this.reportPurchaseOrderFormGroup,
          'rptLocation'
        );
      }
      return;
    }

    this.accountapi.PurchaseLoadDropdown().subscribe((m) => {
      this.initialControlLoaded = true;
      //supplier
      this.SupplierMasterArray = m.resultSet.suppliersMaster;
      this.SupplierMasterList = m.resultSet.suppliersMaster?.map((kl) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.SupplierMasterList.unshift({
        label: '--Select Supplier--',
        value: -1,
      });
      //currency
      this.currArry = m.resultSet.currencyMasters;
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      //job (dummy list shown intentionally for now)
      this.jobArray = m.resultSet.jobMasters
      this.jobList = m.resultSet.jobMasters.map((kl) => ({
          label: `${kl.jobMasterJobNumber} - ${kl.jobMasterJobName}`,
          value: kl.jobMasterJobId,
        }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });


      //location
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationLocked = this.utilityService.applyLocationLock(
        this.reportPurchaseOrderFormGroup,
        'rptLocation'
      );
      //item
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
        partNo: kl.itemMasterPartNo,
        //stock: kl.itemMasterStockType,
        //barcode: kl.itemMasterBarcode,
        AccNo: kl.itemMasterAccountNo,
      }));
      this.MainItemMasterList = this.ItemMasterList;
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      //item group
      this.ItemMasterGroupArray = m.resultSet.itemMasterGroup;
      this.ItemMasterGroupList = m.resultSet.itemMasterGroup?.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterGroupList.unshift({
        label: '--Select Item Group--',
        value: -1,
      });
      //unit
      this.unitArray = m.resultSet.unitMasters;
      this.unitList = m.resultSet.unitMasters?.map((kl) => ({
        label: kl.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      //voucher type
      this.V_TYPEArray = m.resultSet.vouchers;
      this.V_TYPEList = m.resultSet.vouchers?.map((kl) => ({
        label: kl.accountsTransactionsVoucherType,
        value: kl.accountsTransactionsVoucherType,
      }));
    });

    this.reportpurchaseorder_entry = this.utilityService.getTableConfig(
      purchaseOrderColumnObjList(this),
      []
    );

    this.reportpurchaseorder_entry.beforeChangeRender = (change, source) => {
      //this.ColumnSum();

      index: Number;
      this.index = Number(change[0]);

      debitMinusCredit: Number;
      PrevRunningBal: Number;
      CurrRunningBal: Number;
    };

    this.reportpurchaseorder_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.reportpurchaseorder_entry.afterValidate = (
      isValid,
      value,
      row,
      prop
    ) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };

    // Load dimension setting and apply hidden columns as soon as the table renders
    this.reportpurchaseorder_entry.afterInit = () => {
      this.loadDimensionSetting();
    };
  }

  ColumnSum() {
    if (this.Details) {
      const sum1 = (this.reportpurchaseorder_entry.data as PurchaseOrder[])
        ?.filter((item) => item.purchaseOrderDetailsNetAmt != null)
        .reduce((sum, current) => sum + current.purchaseOrderDetailsNetAmt, 0);

      this.reportPurchaseOrderFormGroup.controls.rptNetAmt.setValue(
        Number(sum1)
      );

      const sum2 = (this.reportpurchaseorder_entry.data as PurchaseOrder[])
        ?.filter((item) => item.purchaseOrderDetailsDiscAmount != null)
        .reduce(
          (sum, current) => sum + current.purchaseOrderDetailsDiscAmount,
          0
        );
      this.reportPurchaseOrderFormGroup.controls.rptDiscAmt.setValue(sum2);
      const CreditDebitDiff = sum1 - sum2;

      if (Number(CreditDebitDiff) == 0) {
        this.TotRunningBalanceCreditDebit = '0 Balance';
      } else if (Number(CreditDebitDiff) < 0) {
        this.TotRunningBalanceCreditDebit =
          'Credit Balance ' + CreditDebitDiff * -1;
      } else {
        this.TotRunningBalanceCreditDebit = 'Debit Balance ' + CreditDebitDiff;
      }

      // this.reportPurchaseVoucherFormGroup.controls.rptTotRunningBalanceCreditDebit.setValue(CreditDebitDiff);
    } else {
      const sum1 = (this.reportpurchaseorder_entry.data as PurchaseOrder[])
        ?.filter((item) => item.purchaseOrderNetAmount != null)
        .reduce((sum, current) => sum + current.purchaseOrderNetAmount, 0);

      this.reportPurchaseOrderFormGroup.controls.rptNetAmt.setValue(
        Number(sum1)
      );
      const sum2 = (this.reportpurchaseorder_entry.data as PurchaseOrder[])
        ?.filter((item) => item.purchaseOrderDetailsDiscAmount != null)
        .reduce(
          (sum, current) => sum + current.purchaseOrderDetailsDiscAmount,
          0
        );
      this.reportPurchaseOrderFormGroup.controls.rptDiscAmt.setValue(sum2);

      const CreditDebitDiff = sum1 - sum2;

      if (Number(CreditDebitDiff) == 0) {
        this.TotRunningBalanceCreditDebit = '0 Balance';
      } else if (Number(CreditDebitDiff) < 0) {
        this.TotRunningBalanceCreditDebit =
          'Credit Balance ' + CreditDebitDiff * -1;
      } else {
        this.TotRunningBalanceCreditDebit = 'Debit Balance ' + CreditDebitDiff;
      }
    }
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.reportPurchaseOrderFormGroup.enable();
    this.utilityService.reapplyLocationLock(this.reportPurchaseOrderFormGroup, 'rptLocation', this.locationLocked);
    this.reportPurchaseOrderFormGroup.updateValueAndValidity();
  }

  new() {
    this.enableDate = false;
    this.reportPurchaseOrderFormGroup.reset();
    this.initializeControls();
    if (this.reportpurchaseorder_entry) {
      this.reportpurchaseorder_entry.data = [];
      this.reportpurchaseorder_entry.readOnly = false;
    }
    this.reportPurchaseOrderFormGroup.get('rptSummary').setValue(false);
    this.reportPurchaseOrderFormGroup.get('rptDetails').setValue(true);
    this.Details = true;
    this.Summary = false;
    this.reportPurchaseOrderFormGroup.get('rptDateRange').setValue(false);
    this.reportPurchaseOrderFormGroup.get('rptDtpFrom').setValue(new Date());
    this.reportPurchaseOrderFormGroup.get('rptDtpTo').setValue(new Date());
    this.reportPurchaseOrderFormGroup
      .get('rptPrintGroupByItem')
      .setValue(false);
    this.reportPurchaseOrderFormGroup.get('rptJob').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptSupplier').setValue(-1);
    if (!this.locationLocked) {
      this.reportPurchaseOrderFormGroup.get('rptLocation').setValue(-1);
    }
    this.reportPurchaseOrderFormGroup.get('rptBrand').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptItemGroup').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptItem').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptCurrency').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptSalesMan').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptInvoiceType').setValue('ALL');
    this.reportPurchaseOrderFormGroup.get('rptNetAmt').setValue(null);
    this.reportPurchaseOrderFormGroup.get('rptDiscAmt').setValue(null);
    this.reportPurchaseOrderFormGroup.get('rptDetails').setValue(true);
    this.reportPurchaseOrderFormGroup.get('rptSuppInvNo').setValue('');

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.reportPurchaseOrderFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.reportPurchaseOrderFormGroup,
      'rptLocation',
      this.locationLocked
    );
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.reportPurchaseOrderFormGroup,
        'rptLocation'
      );
    }
    //  this.f.purchaseVoucherNo.clearValidators();
    this.reportPurchaseOrderFormGroup.updateValueAndValidity();
    this.reportPurchaseOrderFormGroup.get('rptDtpFrom').disable();
    this.reportPurchaseOrderFormGroup.get('rptDtpTo').disable();
    this.applyHiddenColumns();
  }

  showDimensions: boolean = false;

loadDimensionSetting() {
  console.log('[DimensionSetting] Method initiated. Fetching settings...');

  this.utilityService
    .getProgramSettings('Show_Dimension_in_PurchaseOrdeReport')
    .subscribe({
      next: (res: any) => {
        console.log('[DimensionSetting] API Response received:', res);

        const setting = res?.find(
          (x: any) => x?.programSettingsKeyValue === 'Show_Dimension_in_PurchaseOrdeReport'
        );
        console.log('[DimensionSetting] Matched setting object:', setting);

        this.showDimensions = setting?.programSettingsBoolValue ?? false;
        console.log('[DimensionSetting] Resolved showDimensions value:', this.showDimensions);

        console.log('[DimensionSetting] Calling applyHiddenColumns()...');
        this.applyHiddenColumns();
      },
      error: (err: any) => {
        console.error('[DimensionSetting] API Error encountered:', err);
      }
    });
}

  ZeroVatOnly: boolean = false;
  ChangeZeroVatOnly() {
    if (this.ZeroVatOnly == false) {
      this.ZeroVatOnly = true;
    } else {
      this.ZeroVatOnly = false;
    }
  }
  Details: boolean = true;
  Summary: boolean = false;

  makeDetailsTrue() {
    this.Details = true;
    this.Summary = false;
    this.applyHiddenColumns();
    this.List_REPORT();
  }

  makeSummaryTrue() {
    this.Summary = true;
    this.Details = false;
    this.applyHiddenColumns();
    this.List_REPORT();
  }

  AsOnDate: boolean = true;
  enableDate: boolean = false;
  PrintGroupByItem: boolean = false;
  makeAsOnDateTrue() {
    this.AsOnDate = true;
    this.enableDate = false;
  }

  makePrintGroupByItemTrue() {
    if (this.PrintGroupByItem == true) {
      this.PrintGroupByItem = false;
    } else {
      this.PrintGroupByItem = true;
    }
    //  this.enableDate == true;
    //   this.AsOnDate = false;
  }

  makeDateRangeTrue() {
    if (this.enableDate == true) {
      this.enableDate = false;
      this.reportPurchaseOrderFormGroup.get('rptDtpFrom').disable();
      this.reportPurchaseOrderFormGroup.get('rptDtpTo').disable();
    } else {
      this.enableDate = true;

      this.reportPurchaseOrderFormGroup.get('rptDtpFrom').enable();
      this.reportPurchaseOrderFormGroup.get('rptDtpTo').enable();
    }
    this.reportPurchaseOrderFormGroup.get('rptDtpFrom').setValue(new Date());
    this.reportPurchaseOrderFormGroup.get('rptDtpTo').setValue(new Date());
    //  this.enableDate == true;
    //   this.AsOnDate = false;
  }

  validateDate(): boolean {
    if (this.enableDate == true) {
      if (this.reportPurchaseOrderFormGroup.getRawValue().rptDtpFrom == null) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No From Date',
        });
        return false;
      }
      if (this.reportPurchaseOrderFormGroup.getRawValue().rptDtpTo == null) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No To Date',
        });
        return false;
      }
      if (
        this.reportPurchaseOrderFormGroup.getRawValue().rptDtpTo <
        this.reportPurchaseOrderFormGroup.getRawValue().rptDtpFrom
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'To Date Less Than From Date',
        });
        return false;
      }
    }

    return true;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  List_REPORT() {
    const { fromDate, toDate } = this.datefilterComponent.onApplyDateFilter();

    if (this.validateDate()) {
      const purchaseVoucherReportParameters_Save: PurchaseOrderReportParameters =
        this.reportPurchaseOrderFormGroup
          .value as PurchaseOrderReportParameters;

      purchaseVoucherReportParameters_Save.rptSummary = this.Summary;
      purchaseVoucherReportParameters_Save.rptDetails = this.Details;
      purchaseVoucherReportParameters_Save.rptDateRange = this.enableDate;
      purchaseVoucherReportParameters_Save.rptDtpFrom = fromDate;
      purchaseVoucherReportParameters_Save.rptDtpTo = toDate;
      purchaseVoucherReportParameters_Save.rptPrintGroupByItem =
        this.PrintGroupByItem;
      purchaseVoucherReportParameters_Save.rptJob =
        this.reportPurchaseOrderFormGroup.value.rptJob;
      purchaseVoucherReportParameters_Save.rptSupplier =
        this.reportPurchaseOrderFormGroup.value.rptSupplier;
      purchaseVoucherReportParameters_Save.rptLocation =
        this.reportPurchaseOrderFormGroup.get('rptLocation')?.value;

      purchaseVoucherReportParameters_Save.rptBrand = -1; // this.reportPurchaseVoucherFormGroup.value.rptBrand;
      purchaseVoucherReportParameters_Save.rptItemGroup =
        this.reportPurchaseOrderFormGroup.value.rptItemGroup;
      purchaseVoucherReportParameters_Save.rptItem =
        this.reportPurchaseOrderFormGroup.value.rptItem;
      purchaseVoucherReportParameters_Save.rptCurrency =
        this.reportPurchaseOrderFormGroup.value.rptCurrency;
      purchaseVoucherReportParameters_Save.rptSalesMan = -1; //this.reportPurchaseVoucherFormGroup.value.rptSalesMan;
      purchaseVoucherReportParameters_Save.rptDpt = -1; //this.reportPurchaseVoucherFormGroup.value.rptDpt;
      purchaseVoucherReportParameters_Save.rptInvoiceType =
        this.reportPurchaseOrderFormGroup.value.rptInvoiceType.name !=
          undefined ||
          this.reportPurchaseOrderFormGroup.value.rptInvoiceType.name != null
          ? this.reportPurchaseOrderFormGroup.value.rptInvoiceType.name
          : 'ALL';
      //purchaseVoucherReportParameters_Save.rptInvoiceType = "ALL";
      purchaseVoucherReportParameters_Save.rptSuppInvNo =
        this.reportPurchaseOrderFormGroup.value.rptSuppInvNo;

      purchaseVoucherReportParameters_Save.viewStockTransferType = [];
      const reportRequest = this.Summary
        ? this.accountapi.ReportPurchaseOrderSummary(
            purchaseVoucherReportParameters_Save
          )
        : this.accountapi.MainReport_GetReportPurchaseOrder_PARAM_CLASS(
            purchaseVoucherReportParameters_Save
          );

      reportRequest
        .subscribe((data) => {
          this.reportSalesVoucher = data.result;
          this.updateHot_Report(data.result);
          this.ColumnSum();
        });
    }
  }

  updateHot_Report(reportSalesVoucher_update: ReportPurchaseOrder[]) {
    const gridData: GridData[] = reportSalesVoucher_update.map((k) => {
      return {
        purchaseOrderId: k.purchaseOrderId,
        purchaseOrderNo: k.purchaseOrderNo,
        purchaseOrderDate: this.datepipes.transform(
          k.purchaseOrderDate,
          'dd/MM/yyyy'
        ),
        purchaseOrderType: k.purchaseOrderType,
        purchaseOrderTotalGrossAmount: k.purchaseOrderTotalGrossAmount,
        purchaseOrderTotalDisAmount: k.purchaseOrderTotalDisAmount,
        purchaseOrderSupInvNo: k.purchaseOrderSupInvNo,
        purchaseOrderVatAmt: k.purchaseOrderVatAmt,
        purchaseOrderVatRountAmt: k.purchaseOrderVatRountAmt,
        purchaseOrderTotalItemDisAmount:
          k.purchaseOrderTotalItemDisAmount != null
            ? k.purchaseOrderTotalItemDisAmount
            : 0,
        purchaseOrderNetDisAmount: k.purchaseOrderNetDisAmount,
        itemMasterItemId: k.itemMasterItemId,
        ///purchaseOrderDetailsNetAmt: k.purchaseOrderDetailsNetAmt,
        //  purchaseVoucherDetailsDiscAmount: k.purchaseOrderTotalItemDisAmount != null ? k.purchaseOrderTotalItemDisAmount : 0,// k.purchaseVoucherDetailsDiscAmount !=null ? k.purchaseVoucherDetailsDiscAmount :0,

        suppliersMasterSupplierName: k.suppliersMasterSupplierName,
        summaryGrossAmount: k.purchaseOrderTotalGrossAmount ?? 0,
        summaryVatAmount: k.purchaseOrderVatAmt ?? 0,
        summaryNetAmount: k.purchaseOrderNetAmount ?? 0,
        purchaseOrderpartyName: k.purchaseOrderpartyName,
        purchaseOrderpartyAddress: k.purchaseOrderpartyAddress,

        // itemBrandName: k.itemBrandName,
        purchaseOrderDetailsQuantity: k.purchaseOrderDetailsQuantity,
        // itemGroupName: k.itemGroupName,
        // salesVoucherExcludeVat: k.salesVoucherExcludeVat,
        //  departmentMasterDepartmentName: k.departmentMasterDepartmentName,
        locationName: k.locationName,
        itemMasterItemName: k.matDesc,
        unitMasterUnitShortName: k.unitName,
        currencyName: k.currencyName,
        purchaseOrderDetailsRate: k.purchaseOrderDetailsRate,
        //  salesManMasterSalesManName: k.salesManMasterSalesManName,
        partno: k.partno,
        //  purchaseOrderSupInvNo: k.purchaseOrderSupInvNo,

        //  purchaseVoucherPono: k.purchaseOrderNo,
        purchaseOrderpartyVatNo: k.purchaseOrderpartyVatNo,
        purchaseOrderDetailsMatId: k.itemMasterItemId,
        purchaseOrderVatper: k.purchaseOrderVatper,
        //// purchaseOrderVatAmt: k.purchaseOrderVatAmt,

        purchaseOrderFsno: k.purchaseOrderFsno,
        purchaseOrderLocationId: k.purchaseOrderLocationId,
        purchaseOrderDelStatus: k.purchaseOrderDelStatus,
        purchaseOrderDetailsGrossAmount:
          k.purchaseOrderDetailsQuantity * k.purchaseOrderDetailsRate,
        purchaseOrderDetailsDiscAmount:
          k.purchaseOrderDetailsDiscAmount != null
            ? k.purchaseOrderDetailsDiscAmount
            : 0,

        purchaseOrderDetailsNetAmt:
          k.purchaseOrderDetailsNetAmt != null
            ? k.purchaseOrderDetailsNetAmt
            : 0,

        purchaseOrderNetAmount:
          k.purchaseOrderDetailsNetAmt + k.purchaseOrderVatAmt,

        // Dimension columns (optional – shown via checkbox)
        iLength: k.iLength ?? null,
        iWidth: k.iWidth ?? null,
        squareMeter: k.squareMeter ?? null,
      };
    });

    this.reportpurchaseorder_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.reportPurchaseOrderFormGroup.disable();
    // this.f.purchaseVoucherNo.clearValidators();
    this.reportPurchaseOrderFormGroup.updateValueAndValidity();

    this.edit();
    this.ColumnSum();

    this.applyHiddenColumns();
  }

  /**
   * Applies the correct hidden-columns configuration based on the current
   * Details/Summary mode and the showDimensions checkbox state.
   *
   * Column index map (dimension cols placed after Qty):
   *  0  purchaseOrderNo
   *  1  purchaseOrderDate
   *  2  purchaseOrderType
   *  3  purchaseOrderSupInvNo
   *  4  locationName
   *  5  suppliersMasterSupplierName
   *  6  summaryGrossAmount         ← summary only
   *  7  summaryVatAmount           ← summary only
   *  8  summaryNetAmount           ← summary only
   *  9  purchaseOrderDetailsMatId  (Item.Id)
   * 10  partno
   * 11  itemMasterItemName
   * 12  unitMasterUnitShortName
   * 13  purchaseOrderDetailsQuantity (Qty)
   * 14  iLength                    ← dimension
   * 15  iWidth                     ← dimension
   * 16  squareMeter                ← dimension
   * 17  purchaseOrderDetailsRate
   * 18  purchaseOrderDetailsGrossAmount
   * 19  purchaseOrderDetailsDiscAmount
   * 20  purchaseOrderVatAmt        ← hidden in Details
   * 21  purchaseOrderDetailsNetAmt ← hidden in Details
   */
  applyHiddenColumns() {
    // Dimension columns are indices 14, 15, 16 — shown only when program setting is true
    const dimensionCols = this.showDimensions ? [] : [14, 15, 16];

    let hiddenCols: number[];
    if (this.Details) {
      // In Details mode hide: SupInvNo (3), summaryGross (6), summaryVat (7), summaryNet (8), Item.Id (9), partno (10), VAT.Amt (20), Net.Amt (21)
      hiddenCols = [3, 6, 7, 8, 9, 10, 20, 21, ...dimensionCols];
    } else {
      // In Summary mode: hide Type (2), Location (4), and all detail-level columns (9–21)
      hiddenCols = [2, 3, 4, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    }

    this.reportpurchaseorder_entry.hiddenColumns = { columns: hiddenCols, indicators: false };
    setTimeout(() => {
      const hot = this.hotRegisterer.getInstance(this.hotid);
      if (!hot) return;
      hot.updateSettings({
        hiddenColumns: { columns: hiddenCols, indicators: false },
      });
    }, 300);
  }
}

interface PurchaseOrder {
  purchaseOrderDetailsNetAmt?: number;
  purchaseOrderDetailsDiscAmount: number;
  purchaseOrderNetAmount: number;
}

interface GridData {
  purchaseOrderId?: number;
  purchaseOrderNo?: string;
  purchaseOrderDate?: string;
  purchaseOrderType?: string;
  ///purchaseOrderpartyId?:number;
  purchaseOrderpartyName?: string;
  purchaseOrderpartyAddress?: string;
  purchaseOrderpartyVatNo?: string;
  purchaseOrderRefNo?: string;
  purchaseOrderSupInvNo?: string;
  purchaseOrderGrno?: string;
  purchaseOrderGrdate?: Date;
  purchaseOrderLpono?: string;
  purchaseOrderLpodate?: Date;
  purchaseOrderQtnNo?: string;
  purchaseOrderQtnDate?: Date;
  purchaseOrderDescription?: string;
  purchaseOrderExcludeVat?: Boolean;
  purchaseOrderpono?: string;
  purchaseOrderBatchCode?: string;
  purchaseOrderDayBookNo?: string;
  purchaseOrderLocationId?: number;
  purchaseOrderUserId?: number;
  purchaseOrderCurrencyId?: number;
  purchaseOrderCompanyId?: number;
  purchaseOrderJobId?: number;
  purchaseOrderFsno?: number;
  purchaseOrderFcRate?: number;
  purchaseOrderStatus?: string;
  purchaseOrderTotalGrossAmount?: number;
  purchaseOrderTotalItemDisAmount?: number;
  purchaseOrderTotalActualAmount?: number;
  purchaseOrderTotalDisper?: number;
  purchaseOrderTotalDisAmount?: number;
  purchaseOrderVatAmt?: number;
  purchaseOrderVatper?: number;
  purchaseOrderVatRoundSign?: string;
  purchaseOrderVatRountAmt?: number;
  purchaseOrderNetDisAmount?: number;
  purchaseOrderNetAmount?: number;
  purchaseOrderTransportCost?: number;
  purchaseOrderHandlingcharges?: number;
  purchaseOrderIssueId?: string;
  purchaseOrderJobDirectpur?: Boolean;
  purchaseOrderDelStatus?: Boolean;
  purchaseOrderIndentNo?: string;
  purchaseOrderContperson?: string;
  purchaseOrderpreparedBy?: string;
  purchaseOrderRecommendedBy?: string;
  purchaseOrderApproveEnable?: Boolean;
  purchaseOrderApproveDate?: Date;
  purchaseOrderApproveStatus?: string;
  purchaseOrderApproveUserId?: number;
  purchaseOrderHeader?: string;
  purchaseOrderDelivery?: string;
  purchaseOrderNotes?: string;
  purchaseOrderFooter?: string;
  purchaseOrderpaymentTerms?: string;
  purchaseOrderSubject?: string;
  purchaseOrderContent?: string;
  purchaseOrderRemarks1?: string;
  purchaseOrderRemarks2?: string;
  purchaseOrderRemarks3?: string;
  purchaseOrderDelivFromDate?: Date;
  purchaseOrderDelivToDate?: Date;
  purchaseOrderDelivStatus?: string;
  purchaseOrderDelivplace?: string;
  SuppliersMasterSupplierName?: string;
  summaryGrossAmount?: number;
  summaryVatAmount?: number;
  summaryNetAmount?: number;
  JobMasterJobName?: string;
  partno?: string;
  matDesc?: string;
  itemMasterItemId?: number;
  purchaseOrderDetailsQuantity?: number;
  purchaseOrderDetailsRate?: number;
  purchaseOrderDetailsDiscAmount?: number;
  purchaseOrderDetailsNetAmt?: number;
  locationName?: string;
  unitname?: string;
  currencyName?: string;
  iLength?: number;
  iWidth?: number;
  squareMeter?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const purchaseOrderColumnObjList = (
  component: ReportpurchaseorderComponent
) => [
    {
      data: 'purchaseOrderNo',
      type: 'text',
      label: 'VoucherNo',
      toolTip: 'Purchase Order Number',
      // width: '100%',
    },
    {
      data: 'purchaseOrderDate',
      type: 'date',
      label: 'Date',
      toolTip: 'Order Date',
    },
    {
      data: 'purchaseOrderType',
      type: 'text',
      label: 'Type',
      toolTip: 'Order Type',
    },
    {
      data: 'purchaseOrderSupInvNo',
      type: 'text',
      label: 'Supp. Inv. #',
      toolTip: 'Supplier Invoice Number',
    },
    {
      data: 'locationName',
      type: 'text',
      label: 'Location',
      toolTip: 'Location Name',
    },
    {
      data: 'suppliersMasterSupplierName',
      type: 'text',
      label: 'Supplier',
      toolTip: 'Supplier Name',
    },
    {
      data: 'summaryGrossAmount',
      type: 'numeric',
      label: 'Gross Amt.',
      toolTip: 'Total Gross Amount',
    },
    {
      data: 'summaryVatAmount',
      type: 'numeric',
      label: 'VAT Amt.',
      toolTip: 'Total VAT Amount',
    },
    {
      data: 'summaryNetAmount',
      type: 'numeric',
      label: 'Net Amt.',
      toolTip: 'Total Net Amount',
    },
    {
      data: 'purchaseOrderDetailsMatId',
      type: 'numeric',
      label: 'Item.Id',
      toolTip: 'Item ID',
    },
    {
      data: 'partno',
      type: 'text',
      label: 'Part No.',
      toolTip: 'Item Part Number',
    },
    {
      data: 'itemMasterItemName',
      type: 'text',
      label: 'Item',
      toolTip: 'Item Name',
    },
    {
      data: 'unitMasterUnitShortName',
      type: 'text',
      label: 'Unit',
      toolTip: 'Unit of Measurement',
    },
    {
      data: 'purchaseOrderDetailsQuantity',
      type: 'numeric',
      label: 'Qty',
      toolTip: 'Quantity',
    },
    {
      data: 'iLength',
      type: 'numeric',
      label: 'Length',
      toolTip: 'Item Length',
    },
    {
      data: 'iWidth',
      type: 'numeric',
      label: 'Width',
      toolTip: 'Item Width',
    },
    {
      data: 'squareMeter',
      type: 'numeric',
      label: 'Sq. Meter',
      toolTip: 'Square Meter',
    },
    {
      data: 'purchaseOrderDetailsRate',
      type: 'numeric',
      label: 'Rate',
      toolTip: 'Item Rate',
    },
    {
      data: 'purchaseOrderDetailsGrossAmount',
      type: 'numeric',
      label: 'Gross.Amt.',
      toolTip: 'Gross Amount',
    },
    {
      data: 'purchaseOrderDetailsDiscAmount',
      type: 'numeric',
      label: 'Disc Amt.',
      toolTip: 'Discount Amount',
    },
    {
      data: 'purchaseOrderVatAmt',
      type: 'numeric',
      label: 'VAT.Amt.',
      toolTip: 'VAT Amount',
    },
    {
      data: 'purchaseOrderDetailsNetAmt',
      type: 'numeric',
      label: 'Net.Amt.',
      toolTip: 'Net Amount',
    },

    // {
    //   data: 'purchaseOrderVatRountAmt',
    //   type: 'numeric',
    //   label: 'Round.Amt.',
    //   toolTip: 'Round Amount',
    // },
    // {
    //   data: 'purchaseOrderNetAmount',
    //   type: 'numeric',
    //   label: 'Total Amt',
    //   toolTip: 'Total Amount',
    // },
  ];
