import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { ReportSalesVoucher } from 'src/app/routes/domain/Sales/ReportSalesVoucher';
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
import { SalesVoucherReportParameters } from 'src/app/routes/domain/Sales/SalesVoucherReportParameters';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { DatePipe } from '@angular/common';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';

@Component({
  selector: 'app-report-sales-voucher',
  templateUrl: './report-sales-voucher.component.html',
  styleUrls: ['./report-sales-voucher.component.scss'],
})
export class ReportSalesVoucherComponent implements OnInit {
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

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  reportSalesVoucher: ReportSalesVoucher[] = [];

  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  displayPrintPreview: boolean = false;

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
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private datepipes: DatePipe,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private masterApi: MasterApiService,
    private accountapi: AccountApiService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'reportsalesvoucher_HotEntry';
  reportsalesvoucher_entry: Handsontable.GridSettings;

  reportSalesVoucherFormGroup: FormGroup;
  reportsalesvoucher_entryDataset = [];
  // accountTransactionDataset = [];
  cols;
  ngOnInit(): void {
    this.FILL_COMBO();

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.reportSalesVoucherFormGroup = this.fb.group({
      rptSummary: [{ value: false, disabled: true }],
      rptDetails: [{ value: true, disabled: true }],
      rptDateRange: [{ value: false, disabled: true }],
      rptDtpFrom: [{ value: [null], disabled: true }],
      rptDtpTo: [{ value: [null], disabled: true }],
      rptZeroVat: [{ value: true, disabled: true }],
      rptJob: [{ value: [-1], disabled: true }],
      rptLocation: [{ value: [-1], disabled: true }],
      rptCustomer: [{ value: [-1], disabled: true }],
      rptBrand: [{ value: [-1], disabled: true }],
      rptItemGroup: [{ value: [-1], disabled: true }],
      rptItem: [{ value: [-1], disabled: true }],
      rptDpt: [{ value: [-1], disabled: true }],
      rptSalesMan: [{ value: [-1], disabled: true }],
      rptInvoiceType: [{ value: 'ALL', disabled: true }],

      rptNetAmt: [{ value: [null], disabled: true }],
      rptDiscAmt: [{ value: [null], disabled: true }],
    });
    this.new();
    // this.breadcumbmodel = this.router.url.slice(1).split('/').map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }
  get f() {
    return this.reportSalesVoucherFormGroup.controls;
  }

  initializeControls() {
    this.getAllVendorMaster();
    this.getAllItemMaster_Group();
    this.getAllDepartmentMaster();
    this.getAllCustomerMaster();
    this.getAllSalesManMaster();
    this.getAllJobs();
    this.getAllCostCenter();
    this.getAllAccount();
    this.getAllUnit();

    this.getAllItemMaster();
    this.getAllSupplierMaster();
    this.getAllV_TYPE();
    this.getAllCurrency();
    this.getAllLocation();

    const hiddenColumns = [
      3, 4, 5, 6, 7, 8, 9, 10, 17, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      31, 32, 33, 34, 35, 36, 37, 38, 39,
    ]; // Customer, Gross.Amt., Item.Disc., Net.Disc, Total.Disc, VAT.Amt., Round.Amt., Net.Amt, Gross.Amt., Ref #, CostCenter, Against, VAT #, VAT Amt, Cheq #, Cheq Date, LPO #, Job, Department, Location, FcDebit, FcCredit, AllocDebit, AllocCredit, AllocBalance, FcAllocDebit, FcAllocCredit, FcAllocBalance, TimeStamp

    this.reportsalesvoucher_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns
    );

    this.reportsalesvoucher_entry.beforeChangeRender = (change, source) => {
      index: Number;
      this.index = Number(change[0]);

      debitMinusCredit: Number;
      PrevRunningBal: Number;
      CurrRunningBal: Number;
      // const PrevRunningBal= Number(this.reportsalesvoucher_entry.data[ this.index].salesVoucherQtnNo);
      // const debitMinusCredit= Number(this.reportsalesvoucher_entry.data[ this.index].salesVoucherTotalGrossAmount)
      // -Number(this.reportsalesvoucher_entry.data[ this.index].salesVoucherTotalDisAmount);
      // this.CurrRunningBal=this.PrevRunningBal+this.debitMinusCredit;

      // this.reportsalesvoucher_entry.data[ this.index].salesVoucherQtnNo =this.CurrRunningBal;

      // this.reportsalesvoucher_entry.data[ this.index].netAmt =
      // (Number(this.reportsalesvoucher_entry.data[ this.index].qty)* Number(this.reportsalesvoucher_entry.data[ this.index].rate))-
      // Number(this.reportsalesvoucher_entry.data[ this.index].disc);

      this.ColumnSum();

      // this.GetTotal();
    };

    this.reportsalesvoucher_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.reportsalesvoucher_entry.afterValidate = (
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
      this.reportsalesvoucher_entry.data.forEach((elemt: any) => {
        if (elemt && elemt.salesVoucherDetailsNetAmt) {
          sum1 += elemt.salesVoucherDetailsNetAmt;
        }
      });
      this.reportSalesVoucherFormGroup.controls.rptNetAmt.setValue(sum1);

      var sum2 = 0;
      this.reportsalesvoucher_entry.data.forEach((elemt: any) => {
        if (elemt && elemt.salesVoucherDetailsDiscAmount) {
          sum2 += elemt.salesVoucherDetailsDiscAmount;
        }
      });
      this.reportSalesVoucherFormGroup.controls.rptDiscAmt.setValue(sum1);

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
      this.reportsalesvoucher_entry.data.forEach((elemt: any) => {
        if (elemt && elemt.salesVoucherNetAmount) {
          sum01 += elemt.salesVoucherNetAmount;
        }
      });
      this.reportSalesVoucherFormGroup.controls.rptNetAmt.setValue(sum01);

      var sum02 = 0;
      this.reportsalesvoucher_entry.data.forEach((elemt: any) => {
        if (elemt && elemt.salesVoucherTotalDisAmount) {
          sum02 += elemt.salesVoucherTotalDisAmount;
        }
      });
      this.reportSalesVoucherFormGroup.controls.rptDiscAmt.setValue(sum01);

      const CreditDebitDiff = sum1 - sum2;

      if (Number(CreditDebitDiff) == 0) {
        this.TotRunningBalanceCreditDebit = '0 Balance';
      } else if (Number(CreditDebitDiff) < 0) {
        this.TotRunningBalanceCreditDebit =
          'Credit Balance ' + CreditDebitDiff * -1;
      } else {
        this.TotRunningBalanceCreditDebit = 'Debit Balance ' + CreditDebitDiff;
      }
      this.reportSalesVoucherFormGroup.controls.rptTotRunningBalanceCreditDebit.setValue(
        CreditDebitDiff
      );
    }
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = k.map((ar) => ar.currencyMasterCurrencyName?.trim());
    });
  }

  getAllJobs() {
    this.masterapi.GetAllJobMaster().subscribe((k) => {
      this.jobArray = k.result;
      this.jobList = k.result.map((kl) => ({
        label: kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = k.result.map((ar) => ar.jobMasterJobName?.trim());
    });
  }

  getAllSalesManMaster() {
    this.masterapi.GetAllSalesman().subscribe((k) => {
      this.SalesManMasterArray = k;
      this.SalesManMasterList = k.map((kl) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.SalesManMasterList.unshift({
        label: '--Select Sales Man--',
        value: -1,
      });
      this.SalesManMasterArry = k.map(
        (ar) =>
          ar.salesManMasterSalesManName?.trim() +
          '|' +
          ar.salesManMasterSalesManId
      );
    });
  }

  getAllCustomerMaster() {
    this.masterapi.GetAllCustomers().subscribe((k) => {
      this.CustomerMasterArray = k.result;
      this.CustomerMasterList = k.result.map((kl) => ({
        label: kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({
        label: '--Select Customer--',
        value: -1,
      });
      this.CustomerMasterArry = k.result.map(
        (ar) =>
          ar.customerMasterCustomerName?.trim() +
          '|' +
          ar.customerMasterCustomerNo
      );
    });
  }

  getAllVendorMaster() {
    this.masterapi.GetAllItem().subscribe((k) => {
      this.VendorMasterArray = k.result;
      this.VendorMasterList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.VendorMasterList.unshift({ label: '--Select Brand--', value: -1 });
      this.VendorMasterArry = k.result.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
      );
    });
  }

  getAllItemMaster_Group() {
    this.masterapi.GetAllItem().subscribe((k) => {
      this.ItemMasterGroupArray = k.result;
      this.ItemMasterGroupList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterGroupList.unshift({
        label: '--Select Item Group--',
        value: -1,
      });
      this.ItemMasterGroupArry = k.result.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
      );
    });
  }

  getAllDepartmentMaster() {
    this.masterapi.GetAllDepartment().subscribe((k) => {
      this.DepartmentMasterArray = k;
      this.DepartmentMasterList = k.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentId,
      }));
      this.DepartmentMasterList.unshift({ label: '--Select Dpt--', value: -1 });
      this.DepartmentMasterArry = k.map(
        (ar) =>
          ar.departmentMasterDepartmentName?.trim() +
          '|' +
          ar.departmentMasterDepartmentId
      );
    });
  }

  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      this.locationArray = k;
      this.locationList = k.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = k.map((ar) => ar.locationMasterLocationName?.trim());
    });
  }

  getAllCostCenter() {
    this.masterapi.GetAllCostCenter().subscribe((k) => {
      this.costcenterArray = k;
      this.costcenterList = k.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterList.unshift({
        label: '--Select Cost Center--',
        value: -1,
      });
      this.costcenterArry = k.map((ar) =>
        ar.costCenterMasterCostCenterName?.trim()
      );
    });
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
      this.acctArry = k.result.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
    });
  }

  getAllItemMaster() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k.result.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
      );
    });
  }

  getAllSupplierMaster() {
    this.masterapi.GetAllSupplier().subscribe((k) => {
      this.SupplierMasterArray = k;
      this.SupplierMasterList = k.map((kl) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.SupplierMasterList.unshift({
        label: '--Select Supplier--',
        value: -1,
      });
      this.SupplierMasterArry = k.map(
        (ar) =>
          ar.suppliersMasterSupplierName?.trim() +
          '|' +
          ar.suppliersMasterSupplierId
      );
    });
  }

  getAllV_TYPE() {
    this.accountapi
      .MainReport_GetAccountsTransactions_VoucherType()
      .subscribe((k) => {
        this.V_TYPEArray = k;
        this.V_TYPEList = k.map((kl) => ({
          label: kl.accountsTransactionsVoucherType,
          value: kl.accountsTransactionsVoucherType,
        }));
        // this.V_TYPEList.unshift({label : '--Select Voucher Type--', value: -1});
        this.V_TYPEArry = k.map(
          (ar) =>
            ar.accountsTransactionsVoucherType?.trim() +
            '|' +
            ar.accountsTransactionsVoucherType
        );
      });
  }

  getAllUnit() {
    this.masterapi.GetAllUnit().subscribe((k) => {
      this.unitArray = k;
      this.unitList = k.map((kl) => ({
        label: kl.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitList.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = k.map(
        (ar) => ar.unitMasterUnitShortName?.trim() + '|' + ar.unitMasterUnitId
      );
    });
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
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

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    // this.f.purchaseVoucherNo.clearValidators();
    this.reportSalesVoucherFormGroup.enable();
    // this.reportSalesVoucherFormGroup.controls.purchaseVoucherNo.disable();
    this.reportSalesVoucherFormGroup.updateValueAndValidity();
  }

  new() {
    this.reportSalesVoucherFormGroup.reset();
    this.reportsalesvoucher_entry.data = [];
    this.reportsalesvoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      ?.updateSettings(this.reportsalesvoucher_entry);

    this.reportSalesVoucherFormGroup.get('rptSummary').setValue(false);
    this.reportSalesVoucherFormGroup.get('rptDetails').setValue(true);
    this.reportSalesVoucherFormGroup.get('rptDateRange').setValue(false);
    this.reportSalesVoucherFormGroup.get('rptDtpFrom').setValue(new Date());
    this.reportSalesVoucherFormGroup.get('rptDtpTo').setValue(new Date());
    this.reportSalesVoucherFormGroup.get('rptZeroVat').setValue(false);
    this.reportSalesVoucherFormGroup.get('rptJob').setValue(-1);
    this.reportSalesVoucherFormGroup.get('rptCustomer').setValue(-1);
    this.reportSalesVoucherFormGroup.get('rptLocation').setValue(-1);

    this.reportSalesVoucherFormGroup.get('rptBrand').setValue(-1);
    this.reportSalesVoucherFormGroup.get('rptItemGroup').setValue(-1);
    this.reportSalesVoucherFormGroup.get('rptItem').setValue(-1);
    this.reportSalesVoucherFormGroup.get('rptDpt').setValue(-1);
    this.reportSalesVoucherFormGroup.get('rptSalesMan').setValue(-1);
    this.reportSalesVoucherFormGroup.get('rptInvoiceType').setValue('ALL');
    this.reportSalesVoucherFormGroup.get('rptNetAmt').setValue(null);
    this.reportSalesVoucherFormGroup.get('rptDiscAmt').setValue(null);
    this.reportSalesVoucherFormGroup.get('rptDetails').setValue(true);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.reportSalesVoucherFormGroup.enable();
    //  this.f.purchaseVoucherNo.clearValidators();
    this.reportSalesVoucherFormGroup.updateValueAndValidity();
  }

  cancel() {}

  ZeroVatOnly: boolean = false;
  ChangeZeroVatOnly() {
    if (this.ZeroVatOnly == false) {
      this.ZeroVatOnly = true;
    } else {
      this.ZeroVatOnly = false;
    }
  }

  currentDate: Date = new Date();

  Details: boolean = true;
  Summary: boolean = false;

  makeDetailsTrue(type) {
    this.reportsalesvoucher_entry.data = [];
    this.reportsalesvoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.reportsalesvoucher_entry);
    if (type == 'detail') {
      this.Details = true;
      this.Summary = false;
    } else {
      this.Summary = true;

      this.Details = false;
    }
  }

  AsOnDate: boolean = true;
  DateRange: boolean = false;

  makeAsOnDateTrue() {
    this.AsOnDate = true;
    this.DateRange = false;
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

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  validateDate(): boolean {
    if (this.DateRange == true) {
      if (this.reportSalesVoucherFormGroup.getRawValue().rptDtpFrom == null) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No From Date',
        });
        return false;
      }
      if (this.reportSalesVoucherFormGroup.getRawValue().rptDtpTo == null) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No To Date',
        });
        return false;
      }
      if (
        this.reportSalesVoucherFormGroup.getRawValue().rptDtpTo <
        this.reportSalesVoucherFormGroup.getRawValue().rptDtpFrom
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'To Date Less Than From Date',
        });
        return false;
      }
    }

    // if(this.AsOnDate ==true  ){
    //   if(  this.reportSalesVoucherFormGroup.getRawValue().rptDtpAson==null){
    //   this.messageService.add({severity: 'error', summary: 'Alert', detail: 'No As On Date'});
    //   return false;
    // }

    // }

    return true;
  }

  Print_API_CALL() {
    const salesVoucherReportParameters_Save: SalesVoucherReportParameters = this
      .reportSalesVoucherFormGroup.value as SalesVoucherReportParameters;

    salesVoucherReportParameters_Save.rptSummary = this.Summary;
    salesVoucherReportParameters_Save.rptDetails = this.Details;
    salesVoucherReportParameters_Save.rptDateRange = this.DateRange;
    salesVoucherReportParameters_Save.rptDtpFrom =
      this.reportSalesVoucherFormGroup.value.rptDtpFrom;
    salesVoucherReportParameters_Save.rptDtpTo =
      this.reportSalesVoucherFormGroup.value.rptDtpTo;
    salesVoucherReportParameters_Save.rptZeroVat = this.ZeroVatOnly;
    salesVoucherReportParameters_Save.rptJob =
      this.reportSalesVoucherFormGroup.value.rptJob;
    salesVoucherReportParameters_Save.rptCustomer =
      this.reportSalesVoucherFormGroup.value.rptCustomer;
    salesVoucherReportParameters_Save.rptLocation =
      this.reportSalesVoucherFormGroup.value.rptLocation;

    salesVoucherReportParameters_Save.rptBrand =
      this.reportSalesVoucherFormGroup.value.rptBrand;
    salesVoucherReportParameters_Save.rptItemGroup =
      this.reportSalesVoucherFormGroup.value.rptItemGroup;
    salesVoucherReportParameters_Save.rptItem =
      this.reportSalesVoucherFormGroup.value.rptItem;
    // salesVoucherReportParameters_Save.rptInvoiceType = this.reportSalesVoucherFormGroup.value.rptInvoiceType;
    salesVoucherReportParameters_Save.rptInvoiceType = 'ALL';
    salesVoucherReportParameters_Save.rptSalesMan =
      this.reportSalesVoucherFormGroup.value.rptSalesMan;
    salesVoucherReportParameters_Save.rptDpt =
      this.reportSalesVoucherFormGroup.value.rptDpt;

    salesVoucherReportParameters_Save.viewStockTransferType = [];

    this.messageService.add({
      severity: 'error',
      summary: 'Alert',
      detail: 'Print API CALL',
    });
  }
  excel() {}

  Print_REPORT() {
    if (true) {
      if (this.validateDate()) {
        this.List_REPORT();
        this.Print_API_CALL();
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.reportSalesVoucherFormGroup.markAllAsTouched();
      this.reportSalesVoucherFormGroup.markAsDirty();
    }
  }

  List_REPORT() {
    //if (this.reportSalesVoucherFormGroup.valid  ) {
    //if(this.validateDate()){
    if (true) {
      if (this.validateDate()) {
        const salesVoucherReportParameters_Save: SalesVoucherReportParameters =
          this.reportSalesVoucherFormGroup
            .value as SalesVoucherReportParameters;

        salesVoucherReportParameters_Save.rptSummary = this.Summary;
        salesVoucherReportParameters_Save.rptDetails = this.Details;
        salesVoucherReportParameters_Save.rptDateRange = this.DateRange;
        salesVoucherReportParameters_Save.rptDtpFrom =
          this.reportSalesVoucherFormGroup.value.rptDtpFrom;
        salesVoucherReportParameters_Save.rptDtpTo =
          this.reportSalesVoucherFormGroup.value.rptDtpTo;
        salesVoucherReportParameters_Save.rptZeroVat = this.ZeroVatOnly;
        salesVoucherReportParameters_Save.rptJob =
          this.reportSalesVoucherFormGroup.value.rptJob;
        salesVoucherReportParameters_Save.rptCustomer =
          this.reportSalesVoucherFormGroup.value.rptCustomer;
        salesVoucherReportParameters_Save.rptLocation =
          this.reportSalesVoucherFormGroup.value.rptLocation;

        salesVoucherReportParameters_Save.rptBrand =
          this.reportSalesVoucherFormGroup.value.rptBrand;
        salesVoucherReportParameters_Save.rptItemGroup =
          this.reportSalesVoucherFormGroup.value.rptItemGroup;
        salesVoucherReportParameters_Save.rptItem =
          this.reportSalesVoucherFormGroup.value.rptItem;
        salesVoucherReportParameters_Save.rptDpt =
          this.reportSalesVoucherFormGroup.value.rptDpt;
        salesVoucherReportParameters_Save.rptSalesMan =
          this.reportSalesVoucherFormGroup.value.rptSalesMan;
        //  salesVoucherReportParameters_Save.rptInvoiceType = this.reportSalesVoucherFormGroup.value.rptInvoiceType;
        salesVoucherReportParameters_Save.rptInvoiceType = 'ALL';

        salesVoucherReportParameters_Save.viewStockTransferType = [];

        this.accountapi
          .MainReport_GetReportSalesVoucher_PARAM_CLASS(
            salesVoucherReportParameters_Save
          )
          .subscribe((data) => {
            this.reportSalesVoucher = data.result;
            this.updateHot_Report(data.result);
          });

        this.ColumnSum();
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.reportSalesVoucherFormGroup.markAllAsTouched();
      this.reportSalesVoucherFormGroup.markAsDirty();
    }
  }

  RunningBal: number;
  CalcRunningBal(DiffAmt: number) {
    this.RunningBal = this.RunningBal + DiffAmt;
    return this.RunningBal;
  }
  updateHot_Report(reportSalesVoucher_update: ReportSalesVoucher[]) {
    this.RunningBal = 0;
    // this.updateHot_Report(data.result);

    const gridData: GridData[] = reportSalesVoucher_update.map((k) => {
      return {
        salesVoucherEnqNo: k.salesVoucherEnqNo,

        salesVoucherId: k.salesVoucherId,
        salesVoucherRefNo: k.salesVoucherRefNo,
        salesVoucherContPerson: k.salesVoucherContPerson,
        salesVoucherDlvNo: k.salesVoucherDlvNo,
        salesVoucherShippinAddress: k.salesVoucherShippinAddress,
        salesVoucherDate: this.datepipes.transform(
          k.salesVoucherDate,
          'dd/MM/yyyy'
        ), // k.salesVoucherDate,
        salesVoucherType: k.salesVoucherType,
        salesVoucherNo: k.salesVoucherNo,
        salesVoucherTotalGrossAmount: k.salesVoucherTotalGrossAmount,
        salesVoucherTotalDisAmount: k.salesVoucherTotalDisAmount,
        salesVoucherDescription: k.salesVoucherDescription,
        customerMasterCustomerVatNo: k.customerMasterCustomerVatNo,
        salesVoucherVatAmt: k.salesVoucherVatAmt,
        salesVoucherVatRountAmt: k.salesVoucherVatRountAmt,
        salesVoucherQtnNo: k.salesVoucherQtnNo,
        salesVoucherNetAmount: k.salesVoucherNetAmount,
        salesVoucherTotalItemDisAmount: k.salesVoucherTotalItemDisAmount,
        salesVoucherNetDisAmount: k.salesVoucherNetDisAmount,
        salesVoucherDetailsMatId: k.salesVoucherDetailsMatId,
        salesVoucherDetailsGrossAmount: k.salesVoucherDetailsGrossAmount,
        salesVoucherDetailsDiscAmount: k.salesVoucherDetailsDiscAmount,
        customerMasterCustomerName: k.customerMasterCustomerName,
        salesVoucherPartyName: k.salesVoucherPartyName,
        salesVoucherPartyAddress: k.salesVoucherPartyAddress,
        itemBrandName: k.itemBrandName,
        salesVoucherDetailsQuantity: k.salesVoucherDetailsQuantity,
        itemGroupName: k.itemGroupName,
        salesVoucherExcludeVat: k.salesVoucherExcludeVat,
        departmentMasterDepartmentName: k.departmentMasterDepartmentName,
        locationMasterLocationName: k.locationMasterLocationName,
        itemMasterItemName: k.itemMasterItemName,
        unitMasterUnitShortName: k.unitMasterUnitShortName,
        currencyMasterCurrencyName: k.currencyMasterCurrencyName,
        salesVoucherDetailsRate: k.salesVoucherDetailsRate,
        salesManMasterSalesManName: k.salesManMasterSalesManName,
        itemMasterPartNo: k.itemMasterPartNo,
        salesVoucherStatus: k.salesVoucherStatus,
        salesVoucherSono: k.salesVoucherSono,
        salesVoucherPartyVatNo: k.salesVoucherPartyVatNo,
        salesVoucherDetailsVatPer: k.salesVoucherDetailsVatPer,
        salesVoucherDetailsVatAmt: k.salesVoucherDetailsVatAmt,
        salesVoucherFsno: k.salesVoucherFsno,
        accountsTransactionsUserId: k.itemGroupId,
        itemGroupId: k.itemGroupId,
        itemBrandId: k.itemBrandId,
        salesVoucherLocationId: k.salesVoucherDetailsVatAmt,
        salesVoucherJobId: k.salesVoucherJobId,
        salesVoucherUserId: k.salesVoucherUserId,
        salesVoucherCompanyId: k.salesVoucherCompanyId,
        salesVoucherDptId: k.salesVoucherDptId,
        salesVoucherDelStatus: k.salesVoucherDelStatus,
        salesVoucherDetailsNetAmt: k.salesVoucherDetailsNetAmt,
      };
    });

    this.reportsalesvoucher_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.reportSalesVoucherFormGroup.disable();
    this.reportSalesVoucherFormGroup.updateValueAndValidity();
    this.edit();
    this.ColumnSum();

    if (this.Details) {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [],
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
            //     3,  this.translate.instant('Customer'),
            //    4,   this.translate.instant('Gross.Amt.'),
            //     5,  this.translate.instant('Item.Disc.'),
            //    6,  this.translate.instant('Net.Disc'),
            7, // this.translate.instant('Total.Disc'),
            //    8, this.translate.instant('VAT.Amt.'),
            //  9, this.translate.instant('Round.Amt.'),
            //    10,   this.translate.instant('Net.Amt'),
            11, //this.translate.instant( 'Item.Id'),
            12, //  this.translate.instant( 'Part No.'),
            13, //  this.translate.instant('Item'),
            14, // this.translate.instant('Unit'),
            15, // this.translate.instant( 'Qty'),
            16, // this.translate.instant('Rate'),
            17, //    this.translate.instant('Gross.Amt.'),
            18, // this.translate.instant('Disc Amt.'),
            19, //   this.translate.instant('Net.Amt.'),

            20, //       this.translate.instant('Ref #'),
            21, //       this.translate.instant('CostCenter'),
            22, //       this.translate.instant('Against'),
            23, //       this.translate.instant( 'VAT #'),
            24, //       this.translate.instant( 'VAT Amt'),
            25, //       this.translate.instant('Cheq #'),
            26, //       this.translate.instant('Cheq Date'),
            27, //      this.translate.instant('LPO #'),
            28, //       this.translate.instant( 'Job'),
            29, //            this.translate.instant('Department'),
            30, //            this.translate.instant( 'Location'),
            31, // this.translate.instant('FcDebit'),
            32, //     this.translate.instant('FcCredit'),
            33, //     this.translate.instant('AllocDebit'),
            34, //     this.translate.instant('AllocCredit'),
            35, //     this.translate.instant('AllocBalance'),
            36, //     this.translate.instant('FcAllocDebit'),
            37, //     this.translate.instant( 'FcAllocCredit'),
            38, //     this.translate.instant( 'FcAllocBalance'),
            39, //     this.translate.instant( 'TimeStamp'),
          ],
          indicators: false,
        },
      });
    }
  }

  userTrackingLog(type) {
    let req = {
      page: 'Sales Voucher Report Print',
      // section: this.,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: '',
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      // console.log('Response:', res);
    });
  }

  printAsPDF() {
    // let html: any = document.getElementById('print');
    // this.printService.saveAsPDF(html);
    const fileName = String(new Date().valueOf());
    var css: string = ` `;
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  getAllStationMaster() {
    this.masterApi.getAllStationMaster().subscribe((response) => {
      this.stationmasterObj = response[0];
      // console.log(this.stationmasterObj);
    });
  }
}

interface GridData {
  salesVoucherDetailsNetAmt?: number;
  salesVoucherEnqNo?: string;
  salesVoucherQtnNo?: string;
  salesVoucherId?: number;
  salesVoucherRefNo?: string;
  salesVoucherContPerson?: string;
  salesVoucherDlvNo?: string;
  salesVoucherShippinAddress?: string;
  salesVoucherDate?: string;
  salesVoucherType?: string;
  salesVoucherNo?: string;
  salesVoucherTotalGrossAmount?: number;
  salesVoucherTotalDisAmount?: number;
  salesVoucherDescription?: string;
  customerMasterCustomerVatNo?: string;
  salesVoucherVatAmt?: number;
  salesVoucherVatRountAmt?: number;
  salesVoucherNetAmount?: number;
  salesVoucherTotalItemDisAmount?: number;
  salesVoucherNetDisAmount?: number;
  salesVoucherDetailsMatId?: number;
  salesVoucherDetailsGrossAmount?: number;
  salesVoucherDetailsDiscAmount?: number;
  customerMasterCustomerName?: string;
  salesVoucherPartyName?: string;
  salesVoucherPartyAddress?: string;
  itemBrandName?: string;
  salesVoucherDetailsQuantity?: number;
  itemGroupName?: string;
  salesVoucherExcludeVat?: boolean;
  departmentMasterDepartmentName?: string;
  locationMasterLocationName?: string;
  itemMasterItemName?: string;
  unitMasterUnitShortName?: string;
  currencyMasterCurrencyName?: string;
  salesVoucherDetailsRate?: number;
  salesManMasterSalesManName?: string;
  itemMasterPartNo?: string;
  salesVoucherSono?: string;
  salesVoucherPartyVatNo?: string;
  salesVoucherDetailsVatPer?: number;
  salesVoucherDetailsVatAmt?: number;
  salesVoucherFsno?: number;
  accountsTransactionsUserId?: number;
  itemGroupId?: number;
  itemBrandId?: number;
  salesVoucherLocationId?: number;
  salesVoucherJobId?: number;
  salesVoucherUserId?: number;
  salesVoucherCompanyId?: number;
  salesVoucherDptId?: number;
  salesVoucherDelStatus?: boolean;
  salesVoucherStatus?: string;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const columnDetailList = (component: ReportSalesVoucherComponent) => [
  {
    data: 'salesVoucherNo',
    type: 'text',
    label: 'Voucher No 12312',
    toolTip: 'Sales Voucher Number',
  },
  {
    data: 'salesVoucherDate',
    type: 'date',
    label: 'Date',
    toolTip: 'Transaction Date',
  },
  {
    data: 'salesVoucherType',
    type: 'text',
    label: 'Type',
    toolTip: 'Voucher Type',
  },
  {
    data: 'customerMasterCustomerName',
    type: 'text',
    label: 'Customer',
    toolTip: 'Customer Name',
  },
  {
    data: 'salesVoucherTotalGrossAmount',
    type: 'numeric',
    label: 'Gross.Amt.',
    toolTip: 'Total Gross Amount',
  },
  {
    data: 'salesVoucherTotalItemDisAmount',
    type: 'numeric',
    label: 'Item.Disc.',
    toolTip: 'Item Discount Amount',
  },
  {
    data: 'salesVoucherTotalDisAmount',
    type: 'numeric',
    label: 'Net.Disc',
    toolTip: 'Net Discount Amount',
  },
  {
    data: 'salesVoucherNetDisAmount',
    type: 'numeric',
    label: 'Total.Disc',
    toolTip: 'Total Discount Amount',
  },
  {
    data: 'salesVoucherVatAmt',
    type: 'numeric',
    label: 'VAT.Amt.',
    toolTip: 'VAT Amount',
  },
  {
    data: 'salesVoucherVatRountAmt',
    type: 'numeric',
    label: 'Round.Amt.',
    toolTip: 'Rounding Amount',
  },
  {
    data: 'salesVoucherNetAmount',
    type: 'numeric',
    label: 'Net.Amt',
    toolTip: 'Net Amount',
  },
  {
    data: 'salesVoucherDetailsMatId',
    type: 'numeric',
    label: 'Item.Id',
    toolTip: 'Item ID',
  },
  {
    data: 'itemMasterPartNo',
    type: 'text',
    label: 'Part No.',
    toolTip: 'Part Number',
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
    data: 'salesVoucherDetailsQuantity',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
    readOnly: false,
  },
  {
    data: 'salesVoucherDetailsRate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Unit Rate',
    readOnly: false,
  },
  {
    data: 'salesVoucherDetailsGrossAmount',
    type: 'numeric',
    label: 'Gross.Amt.',
    toolTip: 'Line Gross Amount',
  },
  {
    data: 'salesVoucherDetailsDiscAmount',
    type: 'numeric',
    label: 'Disc Amt.',
    toolTip: 'Line Discount Amount',
  },
  {
    data: 'salesVoucherDetailsNetAmt',
    type: 'numeric',
    label: 'Net.Amt.',
    toolTip: 'Line Net Amount',
  },
  {
    data: 'salesVoucherId',
    type: 'numeric',
    label: 'Ref #',
    toolTip: 'Reference Number',
  },
  {
    data: 'salesVoucherRefNo',
    type: 'text',
    label: 'CostCenter',
    toolTip: 'Cost Center',
  },
  {
    data: 'salesVoucherContPerson',
    type: 'text',
    label: 'Against',
    toolTip: 'Contact Person',
  },
  {
    data: 'salesVoucherDlvNo',
    type: 'text',
    label: 'VAT #',
    toolTip: 'Delivery Number',
  },
  {
    data: 'salesVoucherShippinAddress',
    type: 'text',
    label: 'VAT Amt',
    toolTip: 'Shipping Address',
  },
  {
    data: 'salesVoucherPartyName',
    type: 'text',
    label: 'Cheq #',
    toolTip: 'Party Name',
  },
  {
    data: 'salesVoucherPartyAddress',
    type: 'text',
    label: 'Cheq Date',
    toolTip: 'Party Address',
  },
  {
    data: 'currencyMasterCurrencyName',
    type: 'text',
    label: 'LPO #',
    toolTip: 'Currency',
  },
  {
    data: 'salesVoucherStatus',
    type: 'date',
    label: 'Job',
    toolTip: 'Voucher Status',
  },
  {
    data: 'salesVoucherDescription',
    type: 'text',
    label: 'Department',
    toolTip: 'Description',
  },
  {
    data: 'customerMasterCustomerVatNo',
    type: 'text',
    label: 'Location',
    toolTip: 'Customer VAT Number',
  },
  {
    data: 'salesVoucherQtnNo',
    type: 'text',
    label: 'FcDebit',
    toolTip: 'Quotation Number',
  },
  {
    data: 'salesManMasterSalesManName',
    type: 'text',
    label: 'FcCredit',
    toolTip: 'Salesman Name',
  },
  {
    data: 'salesVoucherEnqNo',
    type: 'text',
    label: 'AllocDebit',
    toolTip: 'Enquiry Number',
  },
  {
    data: 'itemBrandName',
    type: 'text',
    label: 'AllocCredit',
    toolTip: 'Brand Name',
  },
  {
    data: 'itemGroupName',
    type: 'text',
    label: 'AllocBalance',
    toolTip: 'Item Group',
  },
  {
    data: 'salesVoucherExcludeVat',
    type: 'text',
    label: 'FcAllocDebit',
    toolTip: 'Exclude VAT',
  },
  {
    data: 'departmentMasterDepartmentName',
    type: 'text',
    label: 'FcAllocCredit',
    toolTip: 'Department',
  },
  {
    data: 'locationMasterLocationName',
    type: 'text',
    label: 'FcAllocBalance',
    toolTip: 'Location',
  },
  {
    data: 'salesVoucherPartyVatNo',
    type: 'text',
    label: 'TimeStamp',
    toolTip: 'Party VAT Number',
  },
];
