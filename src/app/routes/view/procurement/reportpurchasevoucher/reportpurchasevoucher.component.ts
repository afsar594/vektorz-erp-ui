import { Component, OnInit, AfterViewInit } from '@angular/core';
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
import { ReportPurchaseVoucher } from 'src/app/routes/domain/Procurements/ReportPurchaseVoucher';
import { PurchaseVoucher } from 'src/app/routes/domain/PurchaseVoucher';
import { PurchaseVoucherDetails } from 'src/app/routes/domain/PurchaseVoucherDetails';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { ViewAccountsTransactionsVoucherType } from 'src/app/routes/domain/Accounts/ViewAccountsTransactionsVoucherType';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { DepartmentMaster } from 'src/app/routes/domain/Masters/DepartmentMaster';

import { PurchaseVoucherReportParameters } from 'src/app/routes/domain/Procurements/PurchaseVoucherReportParameters';

import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { timer, Observable } from 'rxjs';

import { DatePipe } from '@angular/common';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';

@Component({
  selector: 'app-reportpurchasevoucher',
  templateUrl: './reportpurchasevoucher.component.html',
  styleUrls: ['./reportpurchasevoucher.component.scss'],
})
export class ReportpurchasevoucherComponent implements OnInit, AfterViewInit {
  confirmDropDatabaseDialogVisible = false;

  TotRunningBalanceCreditDebit: string;

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
  Permission: any;
  ScreenId: number;

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
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  reportSalesVoucher: ReportPurchaseVoucher[] = [];
  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  MainItemMasterList: any[];
  pdfSource: string;
  reportActionsEnabled = false;

  FILL_COMBO() {
    //SelectItem API with label-value pairs
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
    private translate: TranslateService,
    private router: Router,
    private datepipes: DatePipe,
    private permission: PermissionsService,
  private accountapi: AccountApiService,
  private utilityService: UtilityService,
  private storage: LocalStorageService,
  private crystalReportService: CrystalReportService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'reportpurchasevoucher_HotEntry';
  reportpurchasevoucher_entry: Handsontable.GridSettings;
  reportpurchasevoucher_entryDataset = [];

  hotidDetail = 'reportpurchasevoucher_HotEntry';
  reportpurchasevoucher_entryDetail: Handsontable.GridSettings;
  reportpurchasevoucher_entryDatasetDetail: any;
  stationmasterObj: StationMaster;

  reportPurchaseVoucherFormGroup: FormGroup;
  // locationLocked = false;
  // accountTransactionDataset = [];
  cols;
  ngOnInit(): void {
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
    this.reportPurchaseVoucherFormGroup = this.fb.group({
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

      rptNetAmt: [{ value: 0, disabled: true }],
      rptDiscAmt: [{ value: 0, disabled: true }],
      rptSuppInvNo: [{ value: [''], disabled: true }],
    });
    this.DateRange = false;
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.reportPurchaseVoucherFormGroup.disable();
    // this.new();
  }

  ngAfterViewInit(): void {
    this.new();
    this.DateRange = false;
    this.reportPurchaseVoucherFormGroup.get('rptDateRange')?.setValue(false);
    this.List_REPORT();
  }

  get f() {
    return this.reportPurchaseVoucherFormGroup.controls;
  }

  initializeControls() {
    this.accountapi.PurchaseLoadDropdown().subscribe((m) => {
      //job
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber
          ? kl.jobMasterJobNumber
          : '' + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
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
      this.currencyList = m.resultSet.currencyMasters.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      //location
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster?.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationLocked = this.utilityService.applyLocationLock(
        this.reportPurchaseVoucherFormGroup,
        'rptLocation'
      );
      //unit
      this.unitArray = m.resultSet.unitMasters;
      this.unitList = m.resultSet.unitMasters?.map((kl) => ({
        label: kl.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      //item
      this.ItemMasterArray = m.resultSet.itemMaster;
      //this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({ label: kl.itemMasterItemName, value: kl.itemMasterItemId }));
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
      //voucher
      this.V_TYPEArray = m.resultSet.vouchers;
      this.V_TYPEList = m.resultSet.vouchers?.map((kl) => ({
        label: kl.accountsTransactionsVoucherType,
        value: kl.accountsTransactionsVoucherType,
      }));
    });
    const hiddenColumns = [2, 3, 4, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    this.reportpurchasevoucher_entry = this.utilityService.getTableConfig(
      purchaseVoucherColumnObjList(this),
      hiddenColumns
    );

    this.reportpurchasevoucher_entryDetail = this.utilityService.getTableConfig(
      purchaseVoucherDetailColumnObjList(this),
      [6, 11]
    );

    this.reportpurchasevoucher_entry.beforeChangeRender = (change, source) => {
      this.index = Number(change[0]);
    };
    this.reportpurchasevoucher_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum();
    };
    this.reportpurchasevoucher_entry.afterValidate = (
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
  }

  ColumnSum() {
    if (this.Details) {
      var sum1 = 0;
      this.reportpurchasevoucher_entry.data.forEach((elemt: any) => {
        if (elemt && elemt.purchaseVoucherDetailsNetAmt) {
          sum1 += elemt.purchaseVoucherDetailsNetAmt;
        }
      });
      this.reportPurchaseVoucherFormGroup.controls.rptNetAmt.setValue(
        sum1.toFixed(2)
      );
      var sum2 = 0;
      this.reportpurchasevoucher_entry.data.forEach((elemt: any) => {
        if (elemt && elemt.purchaseVoucherDetailsDiscAmount) {
          sum1 += elemt.purchaseVoucherDetailsDiscAmount;
        }
      });
      this.reportPurchaseVoucherFormGroup.controls.rptDiscAmt.setValue(sum2);

      const CreditDebitDiff = sum1 - sum2;

      if (Number(CreditDebitDiff) == 0) {
        this.TotRunningBalanceCreditDebit = '0 Balance';
      } else if (Number(CreditDebitDiff) < 0) {
        this.TotRunningBalanceCreditDebit =
          'Credit Balance ' + CreditDebitDiff * -1;
      } else {
        this.TotRunningBalanceCreditDebit = 'Debit Balance ' + CreditDebitDiff;
      }
    } else {
      var sum01 = 0;
      this.reportpurchasevoucher_entry.data.forEach((elemt: any) => {
        if (elemt && elemt.purchaseVoucherDetailsDiscAmount) {
          sum01 += elemt.purchaseVoucherDetailsDiscAmount;
        }
      });

      this.reportPurchaseVoucherFormGroup.controls.rptDiscAmt.setValue(
        sum01.toFixed(2)
      );

      var sum02 = 0;
      this.reportpurchasevoucher_entry.data.forEach((elemt: any) => {
        if (elemt && elemt.purchaseVoucherNetAmount) {
          sum02 += elemt.purchaseVoucherNetAmount;
        }
      });
      this.reportPurchaseVoucherFormGroup.controls.rptNetAmt.setValue(
        sum02.toFixed(2)
      );

      const CreditDebitDiff = sum01 - sum02;

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

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    ).maAccName;
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    ).itemMasterItemName;
  }

  public getUnitName(unit: number): string {
    return this.unitArray?.find((j) => j.unitMasterUnitId === unit)
      .unitMasterUnitShortName;
  }

  onItemGroupChange(event: any): void {
    const selectedValue = event.value;
    if (selectedValue > 0) {
      this.ItemMasterList = this.MainItemMasterList?.filter(
        (x) => x.AccNo == selectedValue
      );
    } else {
      this.ItemMasterList = this.MainItemMasterList;
    }
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    // this.f.purchaseVoucherNo.clearValidators();
    this.reportPurchaseVoucherFormGroup.enable();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.reportPurchaseVoucherFormGroup,
        'rptLocation'
      );
    }
    // this.reportPurchaseVoucherFormGroup.controls.purchaseVoucherNo.disable();
    this.reportPurchaseVoucherFormGroup.updateValueAndValidity();
  }

  new() {
    this.reportActionsEnabled = true;
    this.reportPurchaseVoucherFormGroup.enable();
    this.utilityService.reapplyLocationLock(this.reportPurchaseVoucherFormGroup, 'rptLocation', this.locationLocked);
    this.reportpurchasevoucher_entryDetail.data = [];
    this.reportpurchasevoucher_entryDetail.readOnly = false;
    this.reportpurchasevoucher_entry.data = [];
    this.reportpurchasevoucher_entryDataset = [];
    this.reportpurchasevoucher_entry.readOnly = false;

    // Set to true if you want the UI to actually show the date range filter as active
    this.DateRange = true;

    this.reportPurchaseVoucherFormGroup.get('rptSummary').setValue(false);
    this.reportPurchaseVoucherFormGroup.get('rptDetails').setValue(true);
    this.reportPurchaseVoucherFormGroup.get('rptDateRange').setValue(true);

    // Grab today's system date and patch it to both fields
    const today = new Date();
    this.reportPurchaseVoucherFormGroup.get('rptDtpFrom').patchValue(today);
    this.reportPurchaseVoucherFormGroup.get('rptDtpTo').patchValue(today);

    this.reportPurchaseVoucherFormGroup.get('rptPrintGroupByItem').setValue(false);
    this.reportPurchaseVoucherFormGroup.get('rptJob').setValue(-1);
    this.reportPurchaseVoucherFormGroup.get('rptSupplier').setValue(-1);
    if (!this.locationLocked) {
      this.reportPurchaseVoucherFormGroup.get('rptLocation').setValue(-1);
    }
    this.reportPurchaseVoucherFormGroup.get('rptBrand').setValue(-1);
    this.reportPurchaseVoucherFormGroup.get('rptItemGroup').setValue(-1);
    this.reportPurchaseVoucherFormGroup.get('rptItem').setValue(-1);
    this.reportPurchaseVoucherFormGroup.get('rptCurrency').setValue(-1);
    this.reportPurchaseVoucherFormGroup.get('rptSalesMan').setValue(-1);
    this.reportPurchaseVoucherFormGroup.get('rptInvoiceType').setValue('ALL');
    this.reportPurchaseVoucherFormGroup.get('rptNetAmt').setValue(null);
    this.reportPurchaseVoucherFormGroup.get('rptDiscAmt').setValue(null);
    this.reportPurchaseVoucherFormGroup.get('rptSuppInvNo').setValue('');

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;

    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.reportPurchaseVoucherFormGroup,
        'rptLocation'
      );
    }
    this.reportPurchaseVoucherFormGroup.updateValueAndValidity();
  }
  AsOnDateDateRange() { }

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
    this.List_REPORT();
  }

  makeSummaryTrue() {
    this.Summary = true;
    this.Details = false;
    this.List_REPORT();
  }

  AsOnDate: boolean = true;
  DateRange: boolean = false;
  PrintGroupByItem: boolean = false;
  makeAsOnDateTrue() {
    this.AsOnDate = true;
    this.DateRange = false;
  }

  makePrintGroupByItemTrue() {
    if (this.PrintGroupByItem == true) {
      this.PrintGroupByItem = false;
    } else {
      this.PrintGroupByItem = true;
    }
  }

  makeDateRangeTrue() {
    if (this.DateRange == true) {
      this.DateRange = false;
    } else {
      this.DateRange = true;
    }
  }

  PrintWithRef: boolean = true;
  PrintWithCheq: boolean = false;
  PrintWithAlloc: boolean = false;
  PrintWithAgainstAcc: boolean = false;
  PrintWithRelatedAccTrans: boolean = false;

  makePrintWithRefTrue() {
    this.PrintWithRef = true;
    this.PrintWithCheq = false;
    this.PrintWithAlloc = false;
    this.PrintWithAgainstAcc = false;
    this.PrintWithRelatedAccTrans = false;
  }

  makePrintWithCheqTrue() {
    this.PrintWithRef = false;
    this.PrintWithCheq = true;
    this.PrintWithAlloc = false;
    this.PrintWithAgainstAcc = false;
    this.PrintWithRelatedAccTrans = false;
  }

  makePrintWithAllocTrue() {
    this.PrintWithRef = false;
    this.PrintWithCheq = false;
    this.PrintWithAlloc = true;
    this.PrintWithAgainstAcc = false;
    this.PrintWithRelatedAccTrans = false;
  }

  makePrintWithAgainstAccTrue() {
    this.PrintWithRef = false;
    this.PrintWithCheq = false;
    this.PrintWithAlloc = false;
    this.PrintWithAgainstAcc = true;
    this.PrintWithRelatedAccTrans = false;
  }

  makePrintWithRelatedAccTransTrue() {
    this.PrintWithRef = false;
    this.PrintWithCheq = false;
    this.PrintWithAlloc = false;
    this.PrintWithAgainstAcc = false;
    this.PrintWithRelatedAccTrans = true;
  }

  validateDate(): boolean {
    if (this.DateRange == true) {
      if (
        this.reportPurchaseVoucherFormGroup.getRawValue().rptDtpFrom == null
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No From Date',
        });
        return false;
      }
      if (this.reportPurchaseVoucherFormGroup.getRawValue().rptDtpTo == null) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No To Date',
        });
        return false;
      }
      if (
        this.reportPurchaseVoucherFormGroup.getRawValue().rptDtpTo <
        this.reportPurchaseVoucherFormGroup.getRawValue().rptDtpFrom
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

  Print_API_CALL() {
    const purchaseVoucherReportParameters_Save: PurchaseVoucherReportParameters =
      this.reportPurchaseVoucherFormGroup
        .value as PurchaseVoucherReportParameters;

    purchaseVoucherReportParameters_Save.rptSummary = this.Summary;
    purchaseVoucherReportParameters_Save.rptDetails = this.Details;
    purchaseVoucherReportParameters_Save.rptDateRange = this.DateRange;
    purchaseVoucherReportParameters_Save.rptDtpFrom =
      this.reportPurchaseVoucherFormGroup.value.rptDtpFrom;
    purchaseVoucherReportParameters_Save.rptDtpTo =
      this.reportPurchaseVoucherFormGroup.value.rptDtpTo;
    purchaseVoucherReportParameters_Save.rptPrintGroupByItem =
      this.PrintGroupByItem;
    purchaseVoucherReportParameters_Save.rptJob =
      this.reportPurchaseVoucherFormGroup.value.rptJob;
    purchaseVoucherReportParameters_Save.rptSupplier =
      this.reportPurchaseVoucherFormGroup.value.rptSupplier;
    purchaseVoucherReportParameters_Save.rptLocation =
      this.reportPurchaseVoucherFormGroup.get('rptLocation')?.value;

    purchaseVoucherReportParameters_Save.rptBrand = -1; //this.reportPurchaseVoucherFormGroup.value.rptBrand;
    purchaseVoucherReportParameters_Save.rptItemGroup =
      this.reportPurchaseVoucherFormGroup.value.rptItemGroup;
    purchaseVoucherReportParameters_Save.rptItem =
      this.reportPurchaseVoucherFormGroup.value.rptItem;
    // purchaseVoucherReportParameters_Save.rptInvoiceType = this.reportPurchaseVoucherFormGroup.value.rptInvoiceType;
    purchaseVoucherReportParameters_Save.rptInvoiceType = 'ALL';
    purchaseVoucherReportParameters_Save.rptSalesMan = -1; //this.reportPurchaseVoucherFormGroup.value.rptSalesMan;
    purchaseVoucherReportParameters_Save.rptDpt = -1; //this.reportPurchaseVoucherFormGroup.value.rptDpt;
    purchaseVoucherReportParameters_Save.rptCurrency =
      this.reportPurchaseVoucherFormGroup.value.rptCurrency;
    purchaseVoucherReportParameters_Save.rptSuppInvNo =
      this.reportPurchaseVoucherFormGroup.value.rptSuppInvNo;

    purchaseVoucherReportParameters_Save.viewStockTransferType = [];

    this.messageService.add({
      severity: 'error',
      summary: 'Alert',
      detail: 'Print API CALL',
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  Print_REPORT() {
    if (true) {
      if (this.validateDate()) {
        // this.List_REPORT();
        // this.Print_API_CALL();
        this.showPrint()
      }
    }
  }

  List_REPORT() {
    if (true) {
      if (this.validateDate()) {
        const purchaseVoucherReportParameters_Save: PurchaseVoucherReportParameters =
          this.reportPurchaseVoucherFormGroup
            .value as PurchaseVoucherReportParameters;
        purchaseVoucherReportParameters_Save.rptSummary = this.Summary;
        purchaseVoucherReportParameters_Save.rptDetails = this.Details;
        purchaseVoucherReportParameters_Save.rptDateRange = this.DateRange;
        purchaseVoucherReportParameters_Save.rptDtpFrom =
          this.reportPurchaseVoucherFormGroup.value.rptDtpFrom ?? null;
        purchaseVoucherReportParameters_Save.rptDtpTo =
          this.reportPurchaseVoucherFormGroup.value.rptDtpTo ?? null;

        purchaseVoucherReportParameters_Save.rptPrintGroupByItem =
          this.PrintGroupByItem;
        purchaseVoucherReportParameters_Save.rptJob =
          this.reportPurchaseVoucherFormGroup.value.rptJob;
        purchaseVoucherReportParameters_Save.rptSupplier =
          this.reportPurchaseVoucherFormGroup.value.rptSupplier;
        purchaseVoucherReportParameters_Save.rptLocation =
          this.reportPurchaseVoucherFormGroup.get('rptLocation')?.value;
        purchaseVoucherReportParameters_Save.rptBrand =
          this.reportPurchaseVoucherFormGroup.value.rptBrand;
        purchaseVoucherReportParameters_Save.rptItemGroup =
          this.reportPurchaseVoucherFormGroup.value.rptItemGroup;
        purchaseVoucherReportParameters_Save.rptItem =
          this.reportPurchaseVoucherFormGroup.value.rptItem;
        purchaseVoucherReportParameters_Save.rptCurrency =
          this.reportPurchaseVoucherFormGroup.value.rptCurrency;
        purchaseVoucherReportParameters_Save.rptSalesMan =
          this.reportPurchaseVoucherFormGroup.value.rptSalesMan;
        purchaseVoucherReportParameters_Save.rptDpt =
          this.reportPurchaseVoucherFormGroup.value.rptDpt;
        purchaseVoucherReportParameters_Save.rptInvoiceType = this
          .reportPurchaseVoucherFormGroup.value.rptInvoiceType.name
          ? this.reportPurchaseVoucherFormGroup.value.rptInvoiceType.name
          : 'ALL';
        // purchaseVoucherReportParameters_Save.rptInvoiceType = "ALL";
        purchaseVoucherReportParameters_Save.rptSuppInvNo =
          this.reportPurchaseVoucherFormGroup.value.rptSuppInvNo;

        purchaseVoucherReportParameters_Save.viewStockTransferType = [];
        this.accountapi
          .MainReport_GetReportPurchaseVoucher_PARAM_CLASS(
            purchaseVoucherReportParameters_Save
          )
          .subscribe((data) => {
            this.reportSalesVoucher = data.result;
            let summery = this.reportSalesVoucher.some(
              (res) => res.purchaseVoucherDetailsSummery
            );
            if (summery) {
              this.summerGrid(data.result);
            } else {
              this.detailGrid(data.result);
            }
            //this.updateHot_Report(data.result);
          });

        // this.ColumnSum();
      }
    }
  }

  summerGrid(obj) {
    this.reportpurchasevoucher_entryDataset = obj.map((res) => {
      return {
        purchaseVoucherNo: res.purchaseVoucherVoucherNo || null,
        purchaseVoucherDate: res.purchaseVoucherPurchaseDate || null,
        purchaseVoucherType: res.purchaseVoucherPurchaseType || null,
        locationMasterLocationName: res.locationMasterLocationName || null,
        purchaseVoucherSupInvNo: res.purchaseVoucherSupplyInvoiceNo || null,
        suppliersMasterSupplierName: res.suppliersMasterSupplierName || null,
        purchaseVoucherTotalGrossAmt:
          res.purchaseVoucherTotalGrossAmt || null,
        purchaseVoucherTotalDiscountAmt:
          res.purchaseVoucherTotalDiscountAmt ?? 0,
        purchaseVoucherNetDisAmount: null,
        purchaseVoucherNetAmount: res.purchaseVoucherNetAmount || null,
        purchaseVoucherVatAmount: res.purchaseVoucherVatAmount || null,


      };
    });
    let totalNetAmount = this.calculateTotalNetAmount(
      this.reportpurchasevoucher_entryDataset
    );
    let totalDisAmount = this.calculateTotalDisAmount(
      this.reportpurchasevoucher_entryDataset
    );
    this.reportPurchaseVoucherFormGroup.controls['rptNetAmt'].setValue(
      totalNetAmount?.toFixed(2)
    );
    this.reportPurchaseVoucherFormGroup.controls['rptDiscAmt'].setValue(
      totalDisAmount?.toFixed(2)
    );
    return this.reportpurchasevoucher_entryDataset;
  }

  detailGrid(obj) {
    this.reportpurchasevoucher_entryDatasetDetail = obj.map((res) => {
      let item = this.ItemMasterList?.find(
        (r) => r?.value == res?.purchaseVoucherDetailsMaterialId
      )?.label;
      return {
        voucherNo: res.purchaseVoucherVoucherNo || null,
        voucherDate: res.purchaseVoucherPurchaseDate || null,
        partNo: res.partNo || null,
        matDes: item || null,
        unitDes: res.unitMasterUnitShortName || null,
        QuantitySold: res.purchaseVoucherDetailsQuantity || null,
        baseUnit: res.baseUnit || null,
        unitPrice: res.purchaseVoucherDetailsRate || null,
        grossAmt: res.purchaseVoucherDetailsGrossAmount || null,
        discount: res.discount || null,
        netAmount: res.purchaseVoucherDetailsNetAmount || null,
      };
    });

    let totalNetAmount = this.calculateTotalNetAmount(
      this.reportpurchasevoucher_entryDatasetDetail
    );
    this.reportPurchaseVoucherFormGroup.controls['rptNetAmt'].setValue(
      totalNetAmount?.toFixed(2)
    );
    return this.reportpurchasevoucher_entryDatasetDetail;
  }

  calculateTotalNetAmount(data) {
    return data.reduce(
      (sum, item) =>
        sum +
        (item.netAmount ? item.netAmount : item.purchaseVoucherNetAmount || 0),
      0
    );
  }
  calculateTotalDisAmount(data) {
    return data.reduce(
      (sum, item) =>
        sum +
        (item.purchaseVoucherTotalDiscountAmt ? item.purchaseVoucherTotalDiscountAmt : item.purchaseVoucherTotalDiscountAmt || 0),
      0
    );
  }

  RunningBal: number;

  CalcRunningBal(DiffAmt: number) {
    this.RunningBal = this.RunningBal + DiffAmt;
    return this.RunningBal;
  }

  updateHot_Report(reportSalesVoucher_update: ReportPurchaseVoucher[]) {
    this.RunningBal = 0;

    const gridData: GridData[] = reportSalesVoucher_update.map((k) => {
      return {
        // salesVoucherEnqNo: k.salesVoucherEnqNo,

        purchaseVoucherId: k.purchaseVoucherPurId,
        purchaseVoucherRefNo: k.purchaseVoucherRefNo,
        purchaseVoucherDate: this.datepipes.transform(
          k.purchaseVoucherPurchaseDate,
          'dd/MM/yyyy'
        ),
        purchaseVoucherType: k.purchaseVoucherPurchaseType,
        purchaseVoucherNo: k.purchaseVoucherVoucherNo,
        purchaseVoucherTotalGrossAmount: k.purchaseVoucherTotalGrossAmt
          ? k.purchaseVoucherTotalGrossAmt
          : k.purchaseVoucherDetailsGrossAmount,
        purchaseVoucherTotalDisAmount: k.purchaseVoucherTotalDiscountAmt,
        suppliersMasterSupplierVatNo: k.suppliersMasterSupplierVatNo,
        purchaseVoucherVatAmt: k.purchaseVoucherVatAmt,
        purchaseVoucherVatRountAmt: k.purchaseVoucherVatRountAmt,
        purchaseVoucherNetAmount: k.purchaseVoucherNetAmount,
        purchaseVoucherTotalItemDisAmount:
          k.purchaseVoucherTotalItemDisAmount != null
            ? k.purchaseVoucherTotalItemDisAmount
            : 0,
        purchaseVoucherNetDisAmount: k.purchaseVoucherNetDisAmount,
        purchaseVoucherDetailsMatId: k.purchaseVoucherDetailsMaterialId,
        purchaseVoucherDetailsGrossAmount: k.purchaseVoucherDetailsGrossAmount,
        purchaseVoucherDetailsDiscAmount:
          k.purchaseVoucherTotalItemDisAmount != null
            ? k.purchaseVoucherTotalItemDisAmount
            : 0, // k.purchaseVoucherDetailsDiscAmount !=null ? k.purchaseVoucherDetailsDiscAmount :0,

        suppliersMasterSupplierName: k.suppliersMasterSupplierName,
        purchaseVoucherPartyName: k.purchaseVoucherPartyName,
        purchaseVoucherPartyAddress: k.purchaseVoucherPartyAddress,
        purchaseVoucherDetailsQuantity: k.purchaseVoucherDetailsQuantity,
        locationMasterLocationName: k.locationMasterLocationName,
        itemMasterItemName: k.itemMasterItemName,
        unitMasterUnitShortName: k.unitMasterUnitShortName,
        currencyMasterCurrencyName: k.currencyMasterCurrencyName,
        purchaseVoucherDetailsRate: k.purchaseVoucherDetailsRate,
        itemMasterPartNo: k.itemMasterPartNo,
        purchaseVoucherSupInvNo: k.purchaseVoucherSupplyInvoiceNo,

        purchaseVoucherPono: k.purchaseVoucherPono,
        purchaseVoucherPartyVatNo: k.purchaseVoucherPartyVatNo,

        purchaseVoucherDetailsVatPer: k.purchaseVoucherDetailsVatPer,
        purchaseVoucherDetailsVatAmt: k.purchaseVoucherDetailsVatAmt,

        purchaseVoucherFsno: k.purchaseVoucherFsno,
        salesVoucherLocationId: k.purchaseVoucherDetailsVatAmt,
        purchaseVoucherDelStatus: k.purchaseVoucherDelStatus,

        purchaseVoucherDetailsNetAmt:
          k.purchaseVoucherDetailsNetAmount != null
            ? k.purchaseVoucherDetailsNetAmount
            : 0,
      };
    });

    this.reportpurchasevoucher_entry.data = gridData;
    this.reportpurchasevoucher_entryDetail.data = gridData;

    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });

    this.hotRegisterer
      .getInstance(this.hotidDetail)
      .updateSettings({ data: gridData, readOnly: true });
    this.reportPurchaseVoucherFormGroup.disable();
    // this.f.purchaseVoucherNo.clearValidators();
    this.reportPurchaseVoucherFormGroup.updateValueAndValidity();

    this.edit();
    this.ColumnSum();

    if (this.Details) {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [
            //      0, this.translate.instant('VoucherNo'),
            //      1, this.translate.instant('Date'),
            2, //this.translate.instant( 'Type'),
            // 3, this.translate.instant('Supp. Inv. #'),
            4, //this.translate.instant( 'Location'),
            5, // this.translate.instant('Customer'),
            6, //   this.translate.instant('Gross.Amt.'),
            7, //  this.translate.instant('Item.Disc.'),
            8, //   this.translate.instant('Net.Disc'),
            9, //  this.translate.instant('Total.Disc'),
            10, // this.translate.instant('VAT.Amt.'),
            11, //this.translate.instant('Round.Amt.'),
            12, //  this.translate.instant('Net.Amt'),
            13, //  13,this.translate.instant( 'Item.Id'),
            14, //  14,     this.translate.instant( 'Part No.'),
            //   15,    this.translate.instant('Item'),
            //    16,   this.translate.instant('Unit'),
            // 17, this.translate.instant( 'Qty'),
            //  18,   this.translate.instant('Rate'),
            19, // this.translate.instant('Gross.Amt.'),
            // 20, this.translate.instant('Disc Amt.'),
            //  21,     this.translate.instant('Net.Amt.'),
          ],
          indicators: false,
        },
      });
    } else {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [
            //      0, this.translate.instant('VoucherNo'),
            //      1, this.translate.instant('Date'),
            //     2,  this.translate.instant( 'Type'),
            // 3, this.translate.instant('Supp. Inv. #'),
            4,
            this.translate.instant('Location'),
            //     5,  this.translate.instant('Customer'),
            //    6,   this.translate.instant('Gross.Amt.'),
            //    7,  this.translate.instant('Item.Disc.'),
            //    8,  this.translate.instant('Net.Disc'),
            9, // this.translate.instant('Total.Disc'),
            //    10, this.translate.instant('VAT.Amt.'),
            //  11, this.translate.instant('Round.Amt.'),
            //    12,   this.translate.instant('Net.Amt'),
            13, //this.translate.instant( 'Item.Id'),
            14, //  this.translate.instant( 'Part No.'),
            15, //  this.translate.instant('Item'),
            16, // this.translate.instant('Unit'),
            17, // this.translate.instant( 'Qty'),
            18, // this.translate.instant('Rate'),
            19, //    this.translate.instant('Gross.Amt.'),
            20, // this.translate.instant('Disc Amt.'),
            21, //   this.translate.instant('Net.Amt.'),
          ],
          indicators: false,
        },
      });
    }
  }

  rptFilter: ReportFilterModel;

  showPrint() {
    const normalizeFilterValue = (value: any) =>
      Array.isArray(value) ? value[0] : value;
    const isDate =
      this.reportPurchaseVoucherFormGroup.get('rptDateRange')?.value === true;

    const rawInvoiceType =
      this.reportPurchaseVoucherFormGroup.get('rptInvoiceType')?.value;
    const invoiceTypeRaw = rawInvoiceType?.name
      ? rawInvoiceType.name
      : rawInvoiceType;
    const invoiceType = normalizeFilterValue(invoiceTypeRaw);

    const supplier = normalizeFilterValue(
      this.reportPurchaseVoucherFormGroup.get('rptSupplier')?.value
    );
    const suppInvNo = this.reportPurchaseVoucherFormGroup.get('rptSuppInvNo')
      ?.value;
    const currency = normalizeFilterValue(
      this.reportPurchaseVoucherFormGroup.get('rptCurrency')?.value
    );
    const itemGroup = normalizeFilterValue(
      this.reportPurchaseVoucherFormGroup.get('rptItemGroup')?.value
    );
    const item = normalizeFilterValue(
      this.reportPurchaseVoucherFormGroup.get('rptItem')?.value
    );
    const location = normalizeFilterValue(
      this.reportPurchaseVoucherFormGroup.get('rptLocation')?.value
    );
    const job = normalizeFilterValue(
      this.reportPurchaseVoucherFormGroup.get('rptJob')?.value
    );
    const fromDate = this.utilityService.fromAndToDateformater(
      this.reportPurchaseVoucherFormGroup.get('rptDtpFrom')?.value,
      'from'
    );
    const toDate = this.utilityService.fromAndToDateformater(
      this.reportPurchaseVoucherFormGroup.get('rptDtpTo')?.value,
      'to'
    );
    const fromDateDisplay = this.datepipes.transform(
      this.reportPurchaseVoucherFormGroup.get('rptDtpFrom')?.value,
      'dd/MM/yyyy'
    );
    const toDateDisplay = this.datepipes.transform(
      this.reportPurchaseVoucherFormGroup.get('rptDtpTo')?.value,
      'dd/MM/yyyy'
    );

    let query = '';
    const escapedSuppInvNo = (suppInvNo || '').replace(/'/g, "''");
    const escapedInvoiceType = (invoiceType || '').replace(/'/g, "''");

    if (isDate && fromDate && toDate) {
      query 
      //+= ` AND Purchase_Voucher_Purchase_Date BETWEEN '${ this.formatDateOnly(fromDate)}' AND '${this.formatDateOnly(toDate) }'`;
    }

    if (supplier && supplier !== -1) {
      query += ` AND Suppliers_Master_Supplier_ID = ${supplier}`;
    }

    if (suppInvNo && suppInvNo.trim() !== '') {
      query += ` AND SupplierInvoiceNo = '${escapedSuppInvNo}'`;
    }

    if (currency && currency !== -1) {
      query += ` AND PurchaseOrderCurrency = ${currency}`;
    }

    if (itemGroup && itemGroup !== -1) {
      query += ` AND ItemGroupId = ${itemGroup}`;
    }

    if (item && item !== -1) {
      query += ` AND ItemId = ${item}`;
    }

    if (location && location !== -1) {
      query += ` AND PurchaseOrderLocationId = ${location}`;
    }

    if (job && job !== -1) {
      query += ` AND PurchaseOrderJobId = ${job}`;
    }

    if (invoiceType && invoiceType !== 'ALL') {
      query += ` AND Purchase_Voucher_Purchase_Type = '${escapedInvoiceType}'`;
    }

    const hasDateRange = isDate && fromDate && toDate;
    const selectionFilters: string[] = [];
    const escapeCrystalString = (value: string) =>
      value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  if (hasDateRange) {
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);

  const fromYear = startDate.getFullYear();
  const fromMonth = startDate.getMonth() + 1;
  const fromDay = startDate.getDate();
  const fromHour = startDate.getHours();
  const fromMinute = startDate.getMinutes();
  const fromSecond = startDate.getSeconds();

  const toYear = endDate.getFullYear();
  const toMonth = endDate.getMonth() + 1;
  const toDay = endDate.getDate();
  const toHour = endDate.getHours();
  const toMinute = endDate.getMinutes();
  const toSecond = endDate.getSeconds();

  //const selectionFormula =
    // `{vw_purchase.Purchase_Voucher_Purchase_Date} >= ` +
    // `DateTime(${fromYear}, ${fromMonth}, ${fromDay}, ${fromHour}, ${fromMinute}, ${fromSecond}) AND ` +
    // `{vw_purchase.Purchase_Voucher_Purchase_Date} <= ` +
    // `DateTime(${toYear}, ${toMonth}, ${toDay}, ${0}, ${0}, ${0})`;
   const selectionFormula =
  `{vw_purchase.Purchase_Voucher_Purchase_Date} in ` +
  `DateTime (${fromYear}, ${String(fromMonth).padStart(2, '0')}, ${String(fromDay).padStart(2, '0')}, 00, 00, 00) ` +
  `to ` +
  `DateTime (${toYear}, ${String(toMonth).padStart(2, '0')}, ${String(toDay).padStart(2, '0')}, 00, 00, 00)`;

  selectionFilters.push(selectionFormula);
}

    if (supplier && supplier !== -1) {
      selectionFilters.push(`{vw_purchase.Suppliers_Master_Supplier_ID} = ${supplier}`);
    }

    if (suppInvNo && suppInvNo.trim() !== '') {
      selectionFilters.push(
        `{vw_purchase.SupplierInvoiceNo} = "${escapeCrystalString(suppInvNo)}"`
      );
    }

    if (currency && currency !== -1) {
      selectionFilters.push(`{vw_purchase.Purchase_Voucher_Currency_ID} = ${currency}`);
    }

    if (itemGroup && itemGroup !== -1) {
      selectionFilters.push(`{vw_purchase.ItemGroupId} = ${itemGroup}`);
    }

    if (item && item !== -1) {
      selectionFilters.push(`{vw_purchase.Item_Master_Item_ID} = ${item}`);
    }

    if (location && location !== -1) {
      selectionFilters.push(`{vw_purchase.Purchase_Voucher_Location_ID} = ${location}`);
    }

    if (job && job !== -1) {
      selectionFilters.push(`{vw_purchase.Purchase_Voucher_Job_ID} = ${job}`);
    }

    if (invoiceType && invoiceType !== 'ALL') {
      selectionFilters.push(
        `{vw_purchase.Purchase_Voucher_Purchase_Type} = "${escapeCrystalString(invoiceType)}"`
      );
    }

     query = `SELECT * FROM vw_purchase WHERE 1=1 ${query}`;




    const parameters = [
      {
        Key: 'CompanyName',
        Value: this.stationmasterObj.stationMasterStationName,
      },
      {
        Key: 'ReportCriteria',
        Value:
          hasDateRange && fromDateDisplay && toDateDisplay
            ? `For the period from ${fromDateDisplay} To ${toDateDisplay}`
            : 'All Dates',
      },
    ];

    if (hasDateRange) {
      parameters.push(
        { Key: '@StartDate', Value: fromDate },
        { Key: '@EndDate', Value: toDate }
      );
    }

    this.rptFilter = {
      ReportName: this.Summary
        ? 'crptPurchaseVoucherSummary'
        : 'PurchaseOrderReportDetails',
      SelectionFormula: selectionFilters.join(' AND '),
      Parameters: parameters,
      Queries: [
        query,
      ],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, false)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }
 formatDateOnly(dateString: string): string {
  return dateString.split('T')[0];
}
}

interface GridData {
  purchaseVoucherDetailsNetAmt?: number;
  salesVoucherEnqNo?: string;
  salesVoucherQtnNo?: string;
  purchaseVoucherPurId?: number;
  purchaseVoucherRefNo?: string;
  salesVoucherContPerson?: string;
  salesVoucherDlvNo?: string;
  salesVoucherShippinAddress?: string;
  purchaseVoucherDate?: string;
  purchaseVoucherPurchaseType?: string;
  purchaseVoucherVoucherNo?: string;
  purchaseVoucherTotalGrossAmt?: number;
  purchaseVoucherTotalDiscountAmt?: number;
  salesVoucherDescription?: string;
  suppliersMasterSupplierVatNo?: string;
  purchaseVoucherVatAmt?: number;
  purchaseVoucherVatRoundAmt?: number;
  purchaseVoucherNetAmount?: number;
  purchaseVoucherTotalItemDisAmount?: number;
  purchaseVoucherNetDisAmount?: number;
  purchaseVoucherDetailsMaterialId?: number;
  purchaseVoucherDetailsGrossAmount?: number;
  purchaseVoucherDetailsDiscAmount?: number;
  suppliersMasterSupplierName?: string;
  purchaseVoucherPartyName?: string;
  purchaseVoucherPartyAddress?: string;
  itemBrandName?: string;
  purchaseVoucherDetailsQuantity?: number;
  itemGroupName?: string;
  salesVoucherExcludeVat?: boolean;
  departmentMasterDepartmentName?: string;
  locationMasterLocationName?: string;
  itemMasterItemName?: string;
  unitMasterUnitShortName?: string;
  currencyMasterCurrencyName?: string;
  purchaseVoucherDetailsRate?: number;
  salesManMasterSalesManName?: string;
  itemMasterPartNo?: string;
  purchaseVoucherPono?: string;
  purchaseVoucherPartyVatNo?: string;
  purchaseVoucherDetailsVatPer?: number;
  purchaseVoucherDetailsVatAmt?: number;
  purchaseVoucherFsno?: number;
  accountsTransactionsUserId?: number;
  itemGroupId?: number;
  itemBrandId?: number;
  salesVoucherLocationId?: number;
  salesVoucherJobId?: number;
  salesVoucherUserId?: number;
  salesVoucherCompanyId?: number;
  salesVoucherDptId?: number;
  purchaseVoucherDelStatus?: boolean;
  salesVoucherStatus?: string;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}

export const purchaseVoucherColumnObjList = (
  component: ReportpurchasevoucherComponent
) => [
    {
      data: 'purchaseVoucherNo',
      type: 'text',
      label: 'VoucherNo',
      toolTip: 'Purchase Voucher Number',
    },
    {
      data: 'purchaseVoucherDate',
      type: 'date',
      label: 'Date',
      toolTip: 'Voucher Date',
      dateFormat: 'DD-MMM-YYYY',
    },
    {
      data: 'purchaseVoucherType',
      type: 'text',
      label: 'Type',
      toolTip: 'Voucher Type',
    },
    {
      data: 'purchaseVoucherSupInvNo',
      type: 'text',
      label: 'Supp. Inv. #',
      toolTip: 'Supplier Invoice Number',
    },
    {
      data: 'locationMasterLocationName',
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
      data: 'purchaseVoucherTotalGrossAmt',
      type: 'numeric',
      label: 'Gross.Amt.',
      toolTip: 'Total Gross Amount',
    },
    // {
    //   data: 'purchaseVoucherTotalItemDisAmount',
    //   type: 'numeric',
    //   label: 'Item.Disc.',
    //   toolTip: 'Item Discount Amount',
    // },
    {
      data: 'purchaseVoucherTotalDiscountAmt',
      type: 'numeric',
      label: 'Discount Amount',
      toolTip: 'Discount Amount',
    },
    // {
    //   data: 'purchaseVoucherTotalDiscountAmt',
    //   type: 'numeric',
    //   label: 'Total.Disc',
    //   toolTip: 'Total Discount',
    // },
    {
      data: 'purchaseVoucherVatAmount',
      type: 'numeric',
      label: 'VAT.Amt.',
      toolTip: 'VAT Amount',
    },
    {
      data: 'purchaseVoucherNetAmount',
      type: 'numeric',
      label: 'Net.Amt',
      toolTip: 'Net Amount',
    },
    // {
    //   data: 'purchaseVoucherDetailsMaterialId',
    //   type: 'numeric',
    //   label: 'Item.Id',
    //   toolTip: 'Item ID',
    //   readOnly: false,
    // },
    // {
    //   data: 'itemMasterPartNo',
    //   type: 'text',
    //   label: 'Part No.',
    //   toolTip: 'Item Part Number',
    // },
    // {
    //   data: 'purchaseVoucherDetailsItemName',
    //   type: 'text',
    //   label: 'Item',
    //   toolTip: 'Item Name',
    // },
    // {
    //   data: 'unitMasterUnitShortName',
    //   type: 'text',
    //   label: 'Unit',
    //   toolTip: 'Unit of Measurement',
    // },
    // {
    //   data: 'purchaseVoucherDetailsQuantity',
    //   type: 'numeric',
    //   label: 'Qty',
    //   toolTip: 'Quantity',
    //   readOnly: false,
    // },
    // {
    //   data: 'purchaseVoucherDetailsRate',
    //   type: 'numeric',
    //   label: 'Rate',
    //   toolTip: 'Rate',
    //   readOnly: false,
    // },
    // {
    //   data: 'purchaseVoucherDetailsGrossAmount',
    //   type: 'numeric',
    //   label: 'Gross.Amt.',
    //   toolTip: 'Gross Amount',
    // },
    // {
    //   data: 'purchaseVoucherDetailsDiscountAmoutPurchase',
    //   type: 'numeric',
    //   label: 'Disc Amt.',
    //   toolTip: 'Discount Amount',
    //   readOnly: false,
    // },
    // {
    //   data: 'purchaseVoucherDetailsNetAmount',
    //   type: 'numeric',
    //   label: 'Net.Amt.',
    //   toolTip: 'Net Amount',
    //   readOnly: false,
    // },
  ];

export const purchaseVoucherDetailColumnObjList = (
  component: ReportpurchasevoucherComponent
) => [
    {
      data: 'voucherNo',
      type: 'text',
      label: 'Voucher No',
      toolTip: 'Purchase Voucher Number',
    },
    {
      data: 'voucherDate',
      type: 'date',
      label: 'Date',
      toolTip: 'Purchase Voucher Date',
    },
    {
      data: 'partNo',
      type: 'text',
      label: 'Part No',
      toolTip: 'Part Number',
    },
    {
      data: 'matDes',
      type: 'text',
      label: 'Description',
      toolTip: 'Material Description',
    },
    {
      data: 'unitDes',
      type: 'text',
      label: 'Unit Description',
      toolTip: 'Quantity Sold',
    },
    {
      data: 'QuantitySold',
      type: 'numeric',
      label: 'Qty',
      toolTip: 'Quantity',
    },
    {
      data: 'baseUnit',
      type: 'text',
      label: 'Base Unit',
      toolTip: 'Base Unit',
    },
    {
      data: 'unitPrice',
      type: 'numeric',
      label: 'Unit Price',
      toolTip: 'Unit Price',
    },
    {
      readOnly: true,
      data: 'grossAmt',
      type: 'numeric',
      label: 'Gross Amount',
      toolTip: 'Gross Amount',
    },
    {
      data: 'discount',
      type: 'numeric',
      label: 'Discount',
      toolTip: 'Discount',
    },
    {
      data: 'netAmount',
      type: 'numeric',
      label: 'Net Amount',
      toolTip: 'Net Amount',
    },
    {
      data: 'Print',
      type: 'numeric',
      label: 'Print',
      toolTip: 'Print',
    },
  ];
