import { Component, OnInit } from '@angular/core';
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

import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';

import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';

import { HotTableRegisterer } from '@handsontable/angular';
import { StockLedgerParameters } from 'src/app/routes/domain/Store/StockLedgerParameters';
import { StorewarehousesApiService } from 'src/app/routes/service/storewarehouse.api.services';
import { ViewStockTransferType } from 'src/app/routes/domain/Store/ViewStockTransferType';
import { ReportStockBaseUnit } from 'src/app/routes/domain/Store/ReportStockBaseUnit';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-reportstockledger',
  templateUrl: './reportstockledger.component.html',
  styleUrls: ['./reportstockledger.component.scss'],
})
export class ReportstockledgerComponent implements OnInit {
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

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  ItemMasterGroupArray: ItemMaster[] = [];
  ItemMasterGroupArry: string[] = [];
  ItemMasterGroupList: SelectItem[];

  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  // V_TYPEArray: SuppliersMaster[] = [];
  // V_TYPEArry: string[] = [];
  // V_TYPEList: SelectItem[];

  V_TYPEArray: ViewStockTransferType[] = [];
  V_TYPEArry: string[] = [];
  V_TYPEList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  reportStockBaseUnitarry: ReportStockBaseUnit[] = [];
  // savedPurchaseVoucherGridData: GridData[] = [];
  // savedPurchaseVoucher: PurchaseVoucher;

  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];

  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.v_typeList = [
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
    private storewarehouseapi: StorewarehousesApiService,
    private accountapi: AccountApiService,
    private utilityService: UtilityService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'reportaccountstransactions_HotEntry';
  reportaccountstransactions_entry: Handsontable.GridSettings;
  stockLedgerReportFormGroup: FormGroup;
  reportaccountstransactions_entryDataset = [];
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
    this.stockLedgerReportFormGroup = this.fb.group({
      rptSummary: [{ value: false, disabled: true }],
      rptDetails: [{ value: true, disabled: true }],
      rptDateRange: [{ value: false, disabled: true }],
      rptAsOnDate: [{ value: true, disabled: true }],
      rptPrintWithRef: [{ value: true, disabled: true }],
      rptPrintWithCheq: [{ value: true, disabled: true }],
      rptPrintWithAlloc: [{ value: true, disabled: true }],
      rptPrintWithAgainstAcc: [{ value: true, disabled: true }],
      rptPrintWithRelatedAccTrans: [{ value: true, disabled: true }],
      rptHideZero: [{ value: true, disabled: true }],
      rptItemGroup: [{ value: [-1], disabled: true }],
      rptJob: [{ value: [-1], disabled: true }],
      rptItem: [{ value: [-1], disabled: true }, [DropDownValidator]],
      rptLocation: [{ value: [-1], disabled: true }],
      rptPartNo: [{ value: '', disabled: true }],
      rptNarration: [{ value: [''], disabled: true }],
      rptDtpAson: [{ value: [null], disabled: true }],
      rptDtpFrom: [{ value: [null], disabled: true }],
      rptDtpTo: [{ value: [null], disabled: true }],
      rptTotDebit: [{ value: [null], disabled: true }],
      rptTotCredit: [{ value: [null], disabled: true }],
      rptTotRunningBalanceCreditDebit: [{ value: [null], disabled: true }],
      // rptType: [{ value: [null], disabled: true }],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });

    this.new();
  }

  get f() {
    return this.stockLedgerReportFormGroup.controls;
  }

  initializeControls() {
    this.getAllJobs();
    this.getAllCostCenter();
    this.getAllAccount();
    this.getAllUnit();
    this.getAllItemMaster_Group();
    this.getAllItemMaster();
    this.getAllSupplierMaster();
    this.getAllV_TYPE();

    this.getAllCurrency();

    this.getAllLocation();

    const hiddenColumns = [0, 1, 2, 3, 4, 5, 7, 10, 11];
    this.reportaccountstransactions_entry = this.utilityService.getTableConfig(
      reportStockLedgerColumnObjList(this),
      hiddenColumns
    );

    this.reportaccountstransactions_entry.beforeChangeRender = (
      change,
      source
    ) => {
      index: Number;
      this.index = Number(change[0]);

      debitMinusCredit: Number;
      PrevRunningBal: Number;
      CurrRunningBal: Number;
      // const PrevRunningBal= Number(this.reportaccountstransactions_entry.data[ this.index].accountsTransactionsRunningBalance);
      // const debitMinusCredit= Number(this.reportaccountstransactions_entry.data[ this.index].Stock)
      // -Number(this.reportaccountstransactions_entry.data[ this.index].StockRegisterRate);
      // this.CurrRunningBal=this.PrevRunningBal+this.debitMinusCredit;

      // this.reportaccountstransactions_entry.data[ this.index].accountsTransactionsRunningBalance =this.CurrRunningBal;

      // this.reportaccountstransactions_entry.data[ this.index].netAmt =
      // (Number(this.reportaccountstransactions_entry.data[ this.index].qty)* Number(this.reportaccountstransactions_entry.data[ this.index].rate))-
      // Number(this.reportaccountstransactions_entry.data[ this.index].disc);

      this.ColumnSum();

      // this.GetTotal();
    };

    this.reportaccountstransactions_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.reportaccountstransactions_entry.afterValidate = (
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
    //   const sum1 = this.reportaccountstransactions_entry.data?.filter(item => item.hasOwnProperty('Stock'))
    //   .reduce((sum, current) => sum + current.Stock, 0);
    //   this.stockLedgerReportFormGroup.controls.rptTotDebit.setValue(sum1);
    //   const sum2 = this.reportaccountstransactions_entry.data?.filter(item => item.hasOwnProperty('StockRegisterRate'))
    //   .reduce((sum, current) => sum + current.StockRegisterRate, 0);
    //   this.stockLedgerReportFormGroup.controls.rptTotCredit.setValue(sum2);
    //   const CreditDebitDiff =sum1-sum2;
    //  if (Number(CreditDebitDiff) ==0)
    //   {
    //     this.TotRunningBalanceCreditDebit='0 Balance';
    // }
    // else if (Number(CreditDebitDiff) <0)
    //  {
    //   this.TotRunningBalanceCreditDebit='Credit Balance ' +CreditDebitDiff*-1 ;
    // }
    // else
    //  {
    //   this.TotRunningBalanceCreditDebit='Debit Balance ' +CreditDebitDiff ;
    // }
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = k.map((ar) => ar.currencyMasterCurrencyName.trim());
    });
  }
  getAllJobs() {
    this.masterapi.GetAllJob().subscribe((k) => {
      this.jobArray = k;
      this.jobList = k.map((kl) => ({
        label: kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = k.map((ar) => ar.jobMasterJobName.trim());
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
      this.locationArry = k.map((ar) => ar.locationMasterLocationName.trim());
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
        ar.costCenterMasterCostCenterName.trim()
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
        (ar) => ar.maAccName.trim() + '|' + ar.maAccNo
      );
    });
  }
  getAllItemMaster() {
    this.masterapi.GetAllItem().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k.result.map(
        (ar) => ar.itemMasterItemName.trim() + '|' + ar.itemMasterItemId
      );
    });
  }

  getAllItemMaster_Group() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
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
        (ar) => ar.itemMasterItemName.trim() + '|' + ar.itemMasterItemId
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
          ar.suppliersMasterSupplierName.trim() +
          '|' +
          ar.suppliersMasterSupplierId
      );
    });
  }

  // getAllV_TYPE() {
  //   this.accountapi.PurchaseVoucher_GetAllSuppliersMaster().subscribe(k => {
  //     this.V_TYPEArray = k;
  //     this.V_TYPEList = k
  //     .map((kl) => ({ label: kl.suppliersMasterSupplierName, value: kl.suppliersMasterSupplierId }));
  //     this.V_TYPEList.unshift({label : '--Select Supplier--', value: -1});
  //     this.V_TYPEArry = k.map(ar => ar.suppliersMasterSupplierName.trim() + '|' + ar.suppliersMasterSupplierId);
  //   });
  // }

  getAllV_TYPE() {
    // this.accountapi.MainReport_GetViewStockTransferType().subscribe(k => {
    //   this.V_TYPEArray = k;
    //   this.V_TYPEList = k
    //   .map((kl) => ({ label: kl.stockTransferType, value: kl.stockTransferType }));
    //   // this.V_TYPEList.unshift({label : '--Select Voucher Type--', value: -1});
    //   this.V_TYPEArry = k.map(ar => ar.stockTransferType.trim() + '|' + ar.stockTransferType);
    // });
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
        (ar) => ar.unitMasterUnitShortName.trim() + '|' + ar.unitMasterUnitId
      );
    });
  }
  getAllAccountTransaction() {
    // this.accountapi.GetAllAcountTransactions().subscribe((data) => {
    //   this.accountTransactionList = data.result;
    // });
  }
  // AccNo: string,  Location : number,   Job : number,   CostCenter : number,  FromDate : Date,   ToDate : Date,
  //  HideOpeningBal : boolean,  Narration : string,   Description : string
  getGetReportAccountsTransactions() {
    // this.accountapi.MainReport_GetReportAccountsTransactions(
    //   this.stockLedgerReportFormGroup.value.rptItem,
    //   Number(this.stockLedgerReportFormGroup.value.rptLocation),
    //   Number(this.stockLedgerReportFormGroup.value.rptJob),
    //   Number(this.stockLedgerReportFormGroup.value.rptItemGroup),
    //   new Date(),
    //   new Date() ,
    //   true,
    //   '',
    //   '',
    //   ''
    //   ).subscribe((data) => {
    //   this.reportStockBaseUnitarry = data.result;
    //   this.updateHot_Report(data.result);
    // });

    // this.accountapi.MainReport_GetReportAccountsTransactions(
    //   this.stockLedgerReportFormGroup.value.rptItem,
    //     Number(this.stockLedgerReportFormGroup.value.rptLocation),
    //     Number(this.stockLedgerReportFormGroup.value.rptJob),
    //     Number(this.stockLedgerReportFormGroup.value.rptItemGroup)
    //   ).subscribe((data) => {
    //   this.reportStockBaseUnitarry = data.result;
    //   this.updateHot_Report(data.result);
    // });

    this.ColumnSum();
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo.trim() === acctnumber.trim()
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
    this.stockLedgerReportFormGroup.enable();
    // this.stockLedgerReportFormGroup.controls.purchaseVoucherNo.disable();
    this.stockLedgerReportFormGroup.updateValueAndValidity();
  }

  new() {
    this.stockLedgerReportFormGroup.reset();
    this.reportaccountstransactions_entry.data = [];
    this.reportaccountstransactions_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.reportaccountstransactions_entry);
    //  this.hotRegisterer.getInstance(this.hotid).selectAll();
    //  this.hotRegisterer.getInstance(this.hotid).destroyEditor(false, true);
    //  this.hotRegisterer.getInstance(this.hotid).clear();
    //  this.hotRegisterer.getInstance(this.hotid).selectCell(0, 0);

    //  this.accountTransactionList = [];

    this.stockLedgerReportFormGroup.get('rptSummary').setValue(false);
    this.stockLedgerReportFormGroup.get('rptDetails').setValue(true);
    this.stockLedgerReportFormGroup.get('rptDateRange').setValue(false);
    this.stockLedgerReportFormGroup.get('rptAsOnDate').setValue(true);
    this.stockLedgerReportFormGroup.get('rptPrintWithRef').setValue(true);
    this.stockLedgerReportFormGroup.get('rptPrintWithCheq').setValue(false);
    this.stockLedgerReportFormGroup.get('rptPrintWithAlloc').setValue(false);
    this.stockLedgerReportFormGroup
      .get('rptPrintWithAgainstAcc')
      .setValue(false);
    this.stockLedgerReportFormGroup
      .get('rptPrintWithRelatedAccTrans')
      .setValue(false);
    this.stockLedgerReportFormGroup.get('rptHideZero').setValue(false);
    this.stockLedgerReportFormGroup.get('rptItemGroup').setValue(-1);
    this.stockLedgerReportFormGroup.get('rptJob').setValue(-1);
    this.stockLedgerReportFormGroup.get('rptItem').setValue(-1);
    this.stockLedgerReportFormGroup.get('rptLocation').setValue(-1);
    this.stockLedgerReportFormGroup.get('rptPartNo').setValue('');
    this.stockLedgerReportFormGroup.get('rptNarration').setValue('');
    this.stockLedgerReportFormGroup.get('rptDtpAson').setValue(null);
    this.stockLedgerReportFormGroup.get('rptDtpFrom').setValue(null);
    this.stockLedgerReportFormGroup.get('rptDtpTo').setValue(null);
    this.stockLedgerReportFormGroup.get('rptTotDebit').setValue(null);
    this.stockLedgerReportFormGroup.get('rptTotCredit').setValue(null);
    this.stockLedgerReportFormGroup
      .get('rptTotRunningBalanceCreditDebit')
      .setValue(null);
    // this.stockLedgerReportFormGroup.get('rptType').setValue(-1);

    this.stockLedgerReportFormGroup.get('rptDetails').setValue(true);

    this.stockLedgerReportFormGroup.get('rptAsOnDate').setValue(true);
    this.stockLedgerReportFormGroup.get('rptPrintWithRef').setValue(true);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.stockLedgerReportFormGroup.enable();
    //  this.f.purchaseVoucherNo.clearValidators();
    this.stockLedgerReportFormGroup.updateValueAndValidity();
  }
  AsOnDateDateRange() {
    //  if (this.stockLedgerReportFormGroup.value.rptDateRange ==true)
    //   {
    //     this.stockLedgerReportFormGroup.get('rptAsOnDate').setValue(true);
    // }
    // else
    //  {
    //   this.stockLedgerReportFormGroup.get('rptDateRange').setValue(false);
    // }
  }

  SummaryDetails() {
    //   if (this.stockLedgerReportFormGroup.value.rptSummary ==true)
    //   {
    //     // this.stockLedgerReportFormGroup.get('rptDetails').setValue(true);
    //     this.stockLedgerReportFormGroup.controls.rptSummary.setValue(true);
    // }
    // else
    //  {
    //   // this.stockLedgerReportFormGroup.get('rptSummary').setValue(false);
    //   this.stockLedgerReportFormGroup.controls.rptSummary.setValue(true);
    // }
  }

  PrintCheckBox() {
    //   if (this.stockLedgerReportFormGroup.value.rptPrintWithRef ==true)
    //   {
    //     this.stockLedgerReportFormGroup.get('rptPrintWithRef').setValue(true);
    //     this.stockLedgerReportFormGroup.get('rptPrintWithCheq').setValue(false);
    //     this.stockLedgerReportFormGroup.get('rptPrintWithAlloc').setValue(false);
    //     this.stockLedgerReportFormGroup.get('rptPrintWithAgainstAcc').setValue(false);
    //     this.stockLedgerReportFormGroup.get('rptPrintWithRelatedAccTrans').setValue(false);
    // }
    // else
    //  {
    //   this.stockLedgerReportFormGroup.get('rptPrintWithRef').setValue(false);
    //    this.stockLedgerReportFormGroup.get('rptPrintWithCheq').setValue(false);
    //    this.stockLedgerReportFormGroup.get('rptPrintWithAlloc').setValue(false);
    //    this.stockLedgerReportFormGroup.get('rptPrintWithAgainstAcc').setValue(false);
    //    this.stockLedgerReportFormGroup.get('rptPrintWithRelatedAccTrans').setValue(false);
    // }
  }
  cancel() {}
  saveVoucher(stockLedgerParameters_Save: StockLedgerParameters) {
    if (this.stockLedgerReportFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {},
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      // this.stockLedgerParameters_Save: CreditNote.markAllAsTouched();
      this.stockLedgerReportFormGroup.markAsDirty();
    }
  }

  HideOpeningBalance: boolean = false;
  ChangeHideOpeningBalance() {
    if (this.HideOpeningBalance == false) {
      this.HideOpeningBalance = true;
    } else {
      this.HideOpeningBalance = false;
    }
  }

  Details: boolean = true;
  Summary: boolean = false;

  makeDetailsTrue() {
    this.Details = true;
    this.Summary = false;
  }

  makeSummaryTrue() {
    this.Summary = true;
    this.Details = false;
  }

  AsOnDate: boolean = true;
  DateRange: boolean = false;

  makeAsOnDateTrue() {
    this.AsOnDate = true;
    this.DateRange = false;
  }

  makeDateRangeTrue() {
    this.DateRange = true;
    this.AsOnDate = false;
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
      if (this.stockLedgerReportFormGroup.getRawValue().rptDtpFrom == null) {
        // this.messageService.add({severity: 'error', summary: 'Alert', detail: 'No From Date'});
        // return false;
      }
      if (this.stockLedgerReportFormGroup.getRawValue().rptDtpTo == null) {
        // this.messageService.add({severity: 'error', summary: 'Alert', detail: 'No To Date'});
        // return false;
      }
      if (
        this.stockLedgerReportFormGroup.getRawValue().rptDtpTo <
        this.stockLedgerReportFormGroup.getRawValue().rptDtpFrom
      ) {
        // this.messageService.add({severity: 'error', summary: 'Alert', detail: 'To Date Less Than From Date'});
        // return false;
      }
    }

    if (this.AsOnDate == true) {
      if (this.stockLedgerReportFormGroup.getRawValue().rptDtpAson == null) {
        // this.messageService.add({severity: 'error', summary: 'Alert', detail: 'No As On Date'});
        // return false;
      }
    }
    return true;
  }
  Print_API_CALL() {
    const stockLedgerParameters_Save: StockLedgerParameters = this
      .stockLedgerReportFormGroup.value as StockLedgerParameters;

    //   stockLedgerParameters_Save.rptSummary = this.stockLedgerReportFormGroup.value.rptSummary;
    //  stockLedgerParameters_Save.rptDetails = this.stockLedgerReportFormGroup.value.rptDetails;
    //   stockLedgerParameters_Save.rptDateRange = this.stockLedgerReportFormGroup.value.rptDateRange;
    //    stockLedgerParameters_Save.rptAsOnDate = this.stockLedgerReportFormGroup.value.rptAsOnDate;
    stockLedgerParameters_Save.rptSummary = this.Summary;
    stockLedgerParameters_Save.rptDetails = this.Details;
    stockLedgerParameters_Save.rptDateRange = this.DateRange;
    stockLedgerParameters_Save.rptAsOnDate = this.AsOnDate;

    // stockLedgerParameters_Save.rptPrintWithRef = this.stockLedgerReportFormGroup.value.rptPrintWithRef;
    // stockLedgerParameters_Save.rptPrintWithCheq = this.stockLedgerReportFormGroup.value.rptPrintWithCheq;
    // stockLedgerParameters_Save.rptPrintWithAlloc = this.stockLedgerReportFormGroup.value.rptPrintWithAlloc;
    // stockLedgerParameters_Save.rptPrintWithAgainstAcc = this.stockLedgerReportFormGroup.value.rptPrintWithAgainstAcc;
    // stockLedgerParameters_Save.rptPrintWithRelatedAccTrans = this.stockLedgerReportFormGroup.value.rptPrintWithRelatedAccTrans;

    stockLedgerParameters_Save.rptPrintWithRef = this.PrintWithRef;
    stockLedgerParameters_Save.rptPrintWithCheq = this.PrintWithCheq;
    stockLedgerParameters_Save.rptPrintWithAlloc = this.PrintWithAlloc;
    stockLedgerParameters_Save.rptPrintWithAgainstAcc =
      this.PrintWithAgainstAcc;
    stockLedgerParameters_Save.rptPrintWithRelatedAccTrans =
      this.PrintWithRelatedAccTrans;

    // stockLedgerParameters_Save.rptHideZero = this.stockLedgerReportFormGroup.value.rptHideZero;

    stockLedgerParameters_Save.rptHideZero = this.HideOpeningBalance;

    stockLedgerParameters_Save.rptItemGroup =
      this.stockLedgerReportFormGroup.value.rptItemGroup;
    stockLedgerParameters_Save.rptJob =
      this.stockLedgerReportFormGroup.value.rptJob;
    stockLedgerParameters_Save.rptItem =
      this.stockLedgerReportFormGroup.value.rptItem;
    stockLedgerParameters_Save.rptLocation =
      this.stockLedgerReportFormGroup.value.rptLocation;
    stockLedgerParameters_Save.rptPartNo =
      this.stockLedgerReportFormGroup.value.rptPartNo;
    stockLedgerParameters_Save.rptNarration =
      this.stockLedgerReportFormGroup.value.rptNarration;
    stockLedgerParameters_Save.rptDtpAson =
      this.stockLedgerReportFormGroup.value.rptDtpAson;

    stockLedgerParameters_Save.rptDtpFrom =
      this.stockLedgerReportFormGroup.value.rptDtpFrom;
    stockLedgerParameters_Save.rptDtpTo =
      this.stockLedgerReportFormGroup.value.rptDtpTo;
    stockLedgerParameters_Save.rptTotDebit =
      this.stockLedgerReportFormGroup.value.rptTotDebit;
    stockLedgerParameters_Save.rptTotCredit =
      this.stockLedgerReportFormGroup.value.rptTotCredit;
    stockLedgerParameters_Save.rptTotRunningBalanceCreditDebit =
      this.stockLedgerReportFormGroup.value.rptTotRunningBalanceCreditDebit;

    stockLedgerParameters_Save.viewStockTransferType = [];

    // stockLedgerParameters_Save.viewStockTransferType = savedData?.filter(k => k.itemname != null
    //    &&   k.netAmt  !=null  )
    // .map( (k: GridData) => {
    //   return  {
    //               purchaseOrderDetailsId: k.id != null ? k.id : 0,
    //               purchaseOrderDetailsNo: this.stockLedgerReportFormGroup.getRawValue().purchaseOrderNo,

    //               purchaseOrderId: 0,
    //               purchaseOrderDetailsMatId: Number(k.itemname.trim().split('|')[1]) ,
    //               purchaseOrderDetailsQuantity: k.qty,
    //               purchaseOrderDetailsDiscAmount: k.disc,
    //               purchaseOrderDetailsRate: k.rate,
    //               purchaseOrderDetailsNetAmt: k.netAmt,
    //               purchaseOrderDetailsGrossAmount:  0,
    //               // purchaseOrderDetailsJobNo: k.jobname != null && k.jobname !== '' ? this.jobArray
    //               // ?.find(j => j.jobMasterJobName.trim()  === k.jobname.trim()).jobMasterId : null,
    //               // purchaseOrderDetailsCostCenterId: k.costcenter != null && k.costcenter !== '' ? this.costcenterArray
    //               // ?.find(j => j.costCenterMasterCostCenterName.trim()  === k.costcenter.trim()).costCenterMasterCostCenterId : null,
    //               purchaseOrderDetailsRemarks: k.narration,
    //               purchaseOrderDetailsSno: 0,
    //               purchaseOrderDetailsUnitId: Number(k.unit.trim().split('|')[1]),
    //               purchaseOrderDetailsDelStatus: false
    //       };

    // this.accountapi.MainReport_GetReportAccountsTransactions_PARAM_CLASS( stockLedgerParameters_Save ).subscribe((data) => {
    //   this.reportStockBaseUnitarry = data.result;
    //   this.updateHot_Report(data.result);
    // });

    this.messageService.add({
      severity: 'error',
      summary: 'Alert',
      detail: 'Print API CALL',
    });
  }
  Print_REPORT() {
    // if (this.stockLedgerReportFormGroup.valid  ) {
    //   if(this.validateDate()){
    if (true) {
      if (true) {
        this.List_REPORT();
        this.Print_API_CALL();
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.stockLedgerReportFormGroup.markAllAsTouched();
      this.stockLedgerReportFormGroup.markAsDirty();
    }
  }

  List_REPORT() {
    // if (this.stockLedgerReportFormGroup.valid  ) {
    //   if(this.validateDate()){
    if (true) {
      if (true) {
        // const savedData: Array<GridData> = this.purchaseorder_entry.data?.filter( k => k.hasOwnProperty('itemname'));
        const stockLedgerParameters_Save: StockLedgerParameters = this
          .stockLedgerReportFormGroup.value as StockLedgerParameters;

        //   stockLedgerParameters_Save.rptSummary = this.stockLedgerReportFormGroup.value.rptSummary;
        //  stockLedgerParameters_Save.rptDetails = this.stockLedgerReportFormGroup.value.rptDetails;
        //   stockLedgerParameters_Save.rptDateRange = this.stockLedgerReportFormGroup.value.rptDateRange;
        //    stockLedgerParameters_Save.rptAsOnDate = this.stockLedgerReportFormGroup.value.rptAsOnDate;

        stockLedgerParameters_Save.rptSummary = this.Summary;
        stockLedgerParameters_Save.rptDetails = this.Details;
        stockLedgerParameters_Save.rptDateRange = this.DateRange;
        stockLedgerParameters_Save.rptAsOnDate = this.AsOnDate;

        // stockLedgerParameters_Save.rptPrintWithRef = this.stockLedgerReportFormGroup.value.rptPrintWithRef;
        // stockLedgerParameters_Save.rptPrintWithCheq = this.stockLedgerReportFormGroup.value.rptPrintWithCheq;
        // stockLedgerParameters_Save.rptPrintWithAlloc = this.stockLedgerReportFormGroup.value.rptPrintWithAlloc;
        // stockLedgerParameters_Save.rptPrintWithAgainstAcc = this.stockLedgerReportFormGroup.value.rptPrintWithAgainstAcc;
        // stockLedgerParameters_Save.rptPrintWithRelatedAccTrans = this.stockLedgerReportFormGroup.value.rptPrintWithRelatedAccTrans;

        stockLedgerParameters_Save.rptPrintWithRef = this.PrintWithRef;
        stockLedgerParameters_Save.rptPrintWithCheq = this.PrintWithCheq;
        stockLedgerParameters_Save.rptPrintWithAlloc = this.PrintWithAlloc;
        stockLedgerParameters_Save.rptPrintWithAgainstAcc =
          this.PrintWithAgainstAcc;
        stockLedgerParameters_Save.rptPrintWithRelatedAccTrans =
          this.PrintWithRelatedAccTrans;

        // stockLedgerParameters_Save.rptHideZero = this.stockLedgerReportFormGroup.value.rptHideZero;

        stockLedgerParameters_Save.rptHideZero = this.HideOpeningBalance;

        stockLedgerParameters_Save.rptItemGroup =
          this.stockLedgerReportFormGroup.value.rptItemGroup;
        stockLedgerParameters_Save.rptJob =
          this.stockLedgerReportFormGroup.value.rptJob;
        stockLedgerParameters_Save.rptItem =
          this.stockLedgerReportFormGroup.value.rptItem;
        stockLedgerParameters_Save.rptLocation =
          this.stockLedgerReportFormGroup.value.rptLocation;
        stockLedgerParameters_Save.rptPartNo =
          this.stockLedgerReportFormGroup.value.rptPartNo;
        stockLedgerParameters_Save.rptNarration =
          this.stockLedgerReportFormGroup.value.rptNarration;
        stockLedgerParameters_Save.rptDtpAson =
          this.stockLedgerReportFormGroup.value.rptDtpAson;

        stockLedgerParameters_Save.rptDtpFrom =
          this.stockLedgerReportFormGroup.value.rptDtpFrom;
        stockLedgerParameters_Save.rptDtpTo =
          this.stockLedgerReportFormGroup.value.rptDtpTo;
        stockLedgerParameters_Save.rptTotDebit =
          this.stockLedgerReportFormGroup.value.rptTotDebit;
        stockLedgerParameters_Save.rptTotCredit =
          this.stockLedgerReportFormGroup.value.rptTotCredit;
        stockLedgerParameters_Save.rptTotRunningBalanceCreditDebit =
          this.stockLedgerReportFormGroup.value.rptTotRunningBalanceCreditDebit;

        stockLedgerParameters_Save.viewStockTransferType = [];

        // stockLedgerParameters_Save.viewStockTransferType = savedData?.filter(k => k.itemname != null
        //    &&   k.netAmt  !=null  )
        // .map( (k: GridData) => {
        //   return  {
        //               purchaseOrderDetailsId: k.id != null ? k.id : 0,
        //               purchaseOrderDetailsNo: this.stockLedgerReportFormGroup.getRawValue().purchaseOrderNo,

        //               purchaseOrderId: 0,
        //               purchaseOrderDetailsMatId: Number(k.itemname.trim().split('|')[1]) ,
        //               purchaseOrderDetailsQuantity: k.qty,
        //               purchaseOrderDetailsDiscAmount: k.disc,
        //               purchaseOrderDetailsRate: k.rate,
        //               purchaseOrderDetailsNetAmt: k.netAmt,
        //               purchaseOrderDetailsGrossAmount:  0,
        //               // purchaseOrderDetailsJobNo: k.jobname != null && k.jobname !== '' ? this.jobArray
        //               // ?.find(j => j.jobMasterJobName.trim()  === k.jobname.trim()).jobMasterId : null,
        //               // purchaseOrderDetailsCostCenterId: k.costcenter != null && k.costcenter !== '' ? this.costcenterArray
        //               // ?.find(j => j.costCenterMasterCostCenterName.trim()  === k.costcenter.trim()).costCenterMasterCostCenterId : null,
        //               purchaseOrderDetailsRemarks: k.narration,
        //               purchaseOrderDetailsSno: 0,
        //               purchaseOrderDetailsUnitId: Number(k.unit.trim().split('|')[1]),
        //               purchaseOrderDetailsDelStatus: false
        //       };

        this.storewarehouseapi
          .MainReport_GetReportStockLedger_PARAM_CLASS(
            stockLedgerParameters_Save
          )
          .subscribe((data) => {
            this.reportStockBaseUnitarry = data.result;
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
      this.stockLedgerReportFormGroup.markAllAsTouched();
      this.stockLedgerReportFormGroup.markAsDirty();
    }
  }

  RunningBal: number;
  CalcRunningBal(DiffAmt: number) {
    this.RunningBal = this.RunningBal + DiffAmt;
    return this.RunningBal;
  }
  updateHot_Report(reportAccountsTransactions_update: ReportStockBaseUnit[]) {
    this.RunningBal = 0;
    // this.updateHot_Report(data.result);

    const gridData: GridData[] = reportAccountsTransactions_update.map((k) => {
      return {
        stockRegisterLocationId: k.stockRegisterLocationId,
        locationMasterLocationName: k.locationMasterLocationName,
        itemGroupNo: k.itemGroupNo,
        itemGroupName: k.itemGroupName,
        stockRegisterMatId: k.stockRegisterMatId,
        itemMasterPartNo: k.itemMasterPartNo,
        itemMasterItemName: k.itemMasterItemName,
        stockRegisterUnitId: k.stockRegisterUnitId,
        unitMasterUnitShortName: k.unitMasterUnitShortName,
        stock: k.stock,
        stockRegisterRate: k.stockRegisterRate,
        stockRegisterAmount: k.stockRegisterAmount,
      };
    });

    this.reportaccountstransactions_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.stockLedgerReportFormGroup.disable();
    // this.f.purchaseVoucherNo.clearValidators();
    this.stockLedgerReportFormGroup.updateValueAndValidity();

    this.edit();
    this.ColumnSum();

    if (this.Details) {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [
            0,
            1, // this.translate.instant( 'Loc. Name'),
            2,
            3, //       this.translate.instant('Group.Name'),
            4, //  this.translate.instant( 'Item.Id'),

            5, //   this.translate.instant('Part.No'),
            //   this.translate.instant('Item.Name'),
            7,

            // this.translate.instant('Unit.Name'),
            // this.translate.instant('Stock'),
            // this.translate.instant('Rate'),

            // this.translate.instant('Amount')
          ],
          indicators: false,
        },
      });
    } else {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [
            0,
            1, // this.translate.instant( 'Loc. Name'),
            2,
            3, //       this.translate.instant('Group.Name'),
            //  this.translate.instant( 'Item.Id'),
            //   this.translate.instant('Part.No'),
            //   this.translate.instant('Item.Name'),
            7,
            // this.translate.instant('Unit.Name'),
            // this.translate.instant('Stock'),
            10,
            11,
          ],
          indicators: false,
        },
      });
    }
  }
}

interface GridData {
  itemGroupNo?: number;
  itemGroupName?: string;
  stockRegisterMatId?: number;
  itemMasterPartNo?: string;
  itemMasterItemName?: string;
  stockRegisterLocationId?: number;
  locationMasterLocationName?: string;
  stockRegisterUnitId?: number;
  unitMasterUnitShortName?: string;
  stock?: number;
  stockRegisterRate?: number;
  stockRegisterAmount?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const reportStockLedgerColumnObjList = (
  component: ReportstockledgerComponent
) => [
  {
    data: 'stockRegisterLocationId',
    type: 'text',
    label: 'Loc.Id',
    toolTip: 'Location ID',
  },
  {
    data: 'locationMasterLocationName',
    type: 'text',
    label: 'Loc. Name',
    toolTip: 'Location Name',
  },
  {
    data: 'itemGroupNo',
    type: 'text',
    label: 'Group.Id',
    toolTip: 'Item Group ID',
  },
  {
    data: 'itemGroupName',
    type: 'text',
    label: 'Group.Name',
    toolTip: 'Item Group Name',
  },
  {
    data: 'stockRegisterMatId',
    type: 'text',
    label: 'Item ID',
    toolTip: 'Item ID',
  },
  {
    data: 'itemMasterPartNo',
    type: 'text',
    label: 'PartNo',
    toolTip: 'Part Number',
  },
  {
    data: 'itemMasterItemName',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
  },
  {
    data: 'stockRegisterUnitId',
    type: 'text',
    label: 'Unit.Id',
    toolTip: 'Unit ID',
  },
  {
    data: 'unitMasterUnitShortName',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit Name',
  },
  {
    data: 'stock',
    type: 'numeric',
    label: 'Stock',
    toolTip: 'Stock Quantity',
  },
  {
    data: 'stockRegisterRate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Item Rate',
  },
  {
    data: 'stockRegisterAmount',
    type: 'numeric',
    label: 'Amount',
    toolTip: 'Total Amount',
  },
];
