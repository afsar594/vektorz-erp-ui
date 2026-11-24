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
import { REPORTPurchaseRequisition } from 'src/app/routes/domain/Procurements/REPORTPurchaseRequisition';
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

import { PurchaseRequisitionReportParameters } from 'src/app/routes/domain/Procurements/PurchaseRequisitionReportParameters';

import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { DatePipe } from '@angular/common';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';

@Component({
  selector: 'app-reportpurchaserequisition',
  templateUrl: './reportpurchaserequisition.component.html',
  styleUrls: ['./reportpurchaserequisition.component.scss'],
})
export class ReportpurchaserequisitionComponent implements OnInit {
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
  locationLocked: boolean = false;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  Permission: any;
  ScreenId: number;
  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  reportSalesVoucher: REPORTPurchaseRequisition[] = [];
  // savedPurchaseRequisitionGridData: GridData[] = [];
  // savedPurchaseRequisition: PurchaseRequisition;

  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];

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
    private datepipes: DatePipe,
    private masterapi: MasterApiService,
    private permission: PermissionsService,
  private accountapi: AccountApiService,
  private utilityService: UtilityService,
  private storage: LocalStorageService
) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'reportpurchaserequisition_HotEntry';
  reportpurchaserequisition_entry: Handsontable.GridSettings;
  reportPurchaseRequisitionFormGroup: FormGroup;
 // locationLocked = false;
  reportpurchaserequisition_entryDataset = [];
  // accountTransactionDataset = [];
  cols;
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
    this.FILL_COMBO();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.initializeControls();
    this.reportPurchaseRequisitionFormGroup = this.fb.group({
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

      // rptAsOnDate: [{ value: true, disabled: true }],
      // rptPrintWithRef: [{ value: true, disabled: true }],
      // rptPrintWithCheq: [{ value: true, disabled: true }],
      // rptPrintWithAlloc: [{ value: true, disabled: true }],
      // rptPrintWithAgainstAcc: [{ value: true, disabled: true }],
      // rptPrintWithRelatedAccTrans: [{ value: true, disabled: true }],

      // rptCostCenter: [{ value: [-1], disabled: true }],

      // rptDescription: [{ value: '', disabled: true }],
      //
      // rptDtpAson: [{ value: [null], disabled: true }],

      // rptTotRunningBalanceCreditDebit: [{ value: [null], disabled: true }],
      // // rptType: [{ value: [null], disabled: true }],
    });
    this.reportPurchaseRequisitionFormGroup.patchValue({
      rptDtpFrom: new Date(),
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
    return this.reportPurchaseRequisitionFormGroup.controls;
  }
  initializeControls() {
    this.accountapi.RequisitionReportDropdown().subscribe((m) => {
      //supplier
      this.SupplierMasterArray = m.resultSet.suppliersMaster;
      this.SupplierMasterList = m.resultSet.suppliersMaster.map((kl) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.SupplierMasterList.unshift({
        label: '--Select Supplier--',
        value: -1,
      });
      this.SupplierMasterArry = m.resultSet.suppliersMaster.map(
        (ar) =>
          ar.suppliersMasterSupplierName.trim() +
          '|' +
          ar.suppliersMasterSupplierId
      );

      //currency
      this.currencyList = m.resultSet.currencyMasters.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = m.resultSet.currencyMasters.map((ar) =>
        ar.currencyMasterCurrencyName.trim()
      );

      //item master group
      this.ItemMasterGroupArray = m.resultSet.itemMasterGroup;
      this.ItemMasterGroupList = m.resultSet.itemMasterGroup.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterGroupArry = m.resultSet.itemMasterGroup;
      this.ItemMasterGroupList.unshift({
        label: '--Select Group--',
        value: -1,
      });

      //item master
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterArry = m.resultSet.itemMaster;
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
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
        this.reportPurchaseRequisitionFormGroup,
        'rptLocation'
      );
      this.locationArry = m.resultSet.locationMaster;
      this.locationLocked = this.utilityService.applyLocationLock(this.reportPurchaseRequisitionFormGroup, 'rptLocation');

      // job
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = m.resultSet.jobMasters;
      //unit master
      this.unitArray = m.resultSet.jobMasters;
      this.unitList = m.resultSet.jobMasters.map((kl) => ({
        label: kl.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitArry = m.resultSet.jobMasters;
      this.unitList.unshift({ label: '--Select Unit--', value: -1 });
    });

    const hiddenColumns = [2, 3, 6, 7, 8, 9, 10, 11, 12, 19, 20, 21]; // Type, Supp. Inv. #, Gross.Amt., Item.Disc., Net.Disc, Total.Disc, VAT.Amt., Round.Amt., Net.Amt, Gross.Amt., Disc Amt., Net.Amt.

    this.reportpurchaserequisition_entry = this.utilityService.getTableConfig(
      purchaseRequisitionColumnObjList(this),
      hiddenColumns
    );

    this.reportpurchaserequisition_entry.beforeChangeRender = (
      change,
      source
    ) => {
      index: Number;
      this.index = Number(change[0]);

      debitMinusCredit: Number;
      PrevRunningBal: Number;
      CurrRunningBal: Number;

      this.ColumnSum();

      // this.GetTotal();
    };
    this.reportpurchaserequisition_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };
    this.reportpurchaserequisition_entry.afterValidate = (
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
      //
      // console.log('event');

      const sum1: any = this.reportpurchaserequisition_entry.data
        ?.filter((item) =>
          item.hasOwnProperty('purchaseRequisitionDetailsNetAmt')
        )
        .reduce(
          (sum, current: any) => sum + current.purchaseRequisitionDetailsNetAmt,
          [0]
        );
      this.reportPurchaseRequisitionFormGroup.controls.rptNetAmt.setValue(sum1);

      // this.purchaserequisition_entry.data[0].netAmt = 45;
      const sum2: any = this.reportpurchaserequisition_entry.data
        ?.filter((item) =>
          item.hasOwnProperty('purchaseRequisitionDetailsDiscAmount')
        )

        .reduce(
          (sum, current: any) =>
            sum + current.purchaseRequisitionDetailsDiscAmount,
          [0]
        );
      this.reportPurchaseRequisitionFormGroup.controls.rptDiscAmt.setValue(
        sum2
      );

      const CreditDebitDiff = sum1 - sum2;

      if (Number(CreditDebitDiff) == 0) {
        this.TotRunningBalanceCreditDebit = '0 Balance';
      } else if (Number(CreditDebitDiff) < 0) {
        this.TotRunningBalanceCreditDebit =
          'Credit Balance ' + CreditDebitDiff * -1;
      } else {
        this.TotRunningBalanceCreditDebit = 'Debit Balance ' + CreditDebitDiff;
      }

      // this.reportPurchaseRequisitionFormGroup.controls.rptTotRunningBalanceCreditDebit.setValue(CreditDebitDiff);
    } else {
      //
      // console.log('event');
      const sum1: any = this.reportpurchaserequisition_entry.data
        ?.filter((item) => item.hasOwnProperty('purchaseRequisitionNetAmount'))
        .reduce(
          (sum, current: any) => sum + current.purchaseRequisitionNetAmount,
          [0]
        );
      this.reportPurchaseRequisitionFormGroup.controls.rptNetAmt.setValue(sum1);

      // this.purchaserequisition_entry.data[0].netAmt = 45;
      const sum2: any = this.reportpurchaserequisition_entry.data
        ?.filter((item) =>
          item.hasOwnProperty('purchaseRequisitionTotalDisAmount')
        )

        .reduce(
          (sum, current: any) =>
            sum + current.purchaseRequisitionTotalDisAmount,
          [0]
        );
      this.reportPurchaseRequisitionFormGroup.controls.rptDiscAmt.setValue(
        sum2
      );

      const CreditDebitDiff = sum1 - sum2;

      if (Number(CreditDebitDiff) == 0) {
        this.TotRunningBalanceCreditDebit = '0 Balance';
      } else if (Number(CreditDebitDiff) < 0) {
        this.TotRunningBalanceCreditDebit =
          'Credit Balance ' + CreditDebitDiff * -1;
      } else {
        this.TotRunningBalanceCreditDebit = 'Debit Balance ' + CreditDebitDiff;
      }

      // this.reportPurchaseRequisitionFormGroup.controls.rptTotRunningBalanceCreditDebit.setValue(CreditDebitDiff);
    }
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
    // this.f.purchaseRequisitionNo.clearValidators();
    this.reportPurchaseRequisitionFormGroup.enable();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.reportPurchaseRequisitionFormGroup,
        'rptLocation'
      );
    }
    // this.reportPurchaseRequisitionFormGroup.controls.purchaseRequisitionNo.disable();
    this.reportPurchaseRequisitionFormGroup.updateValueAndValidity();
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  new() {
    this.reportPurchaseRequisitionFormGroup.reset();
    this.reportpurchaserequisition_entry.data = [];
    this.reportpurchaserequisition_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.reportpurchaserequisition_entry);
    //  this.hotRegisterer.getInstance(this.hotid).selectAll();
    //  this.hotRegisterer.getInstance(this.hotid).destroyEditor(false, true);
    //  this.hotRegisterer.getInstance(this.hotid).clear();
    //  this.hotRegisterer.getInstance(this.hotid).selectCell(0, 0);

    //  this.accountTransactionList = [];

    this.reportPurchaseRequisitionFormGroup.get('rptSummary').setValue(false);
    this.reportPurchaseRequisitionFormGroup.get('rptDetails').setValue(true);
    this.reportPurchaseRequisitionFormGroup.get('rptDateRange').setValue(false);
    this.reportPurchaseRequisitionFormGroup.get('rptDtpFrom').setValue(null);
    this.reportPurchaseRequisitionFormGroup.get('rptDtpTo').setValue(null);
    this.reportPurchaseRequisitionFormGroup
      .get('rptPrintGroupByItem')
      .setValue(false);
    this.reportPurchaseRequisitionFormGroup.get('rptJob').setValue(-1);
    this.reportPurchaseRequisitionFormGroup.get('rptSupplier').setValue(-1);
    if (!this.locationLocked) {
      this.reportPurchaseRequisitionFormGroup.get('rptLocation').setValue(-1);
    }

    this.reportPurchaseRequisitionFormGroup.get('rptBrand').setValue(-1);
    this.reportPurchaseRequisitionFormGroup.get('rptItemGroup').setValue(-1);
    this.reportPurchaseRequisitionFormGroup.get('rptItem').setValue(-1);
    this.reportPurchaseRequisitionFormGroup.get('rptCurrency').setValue(-1);
    this.reportPurchaseRequisitionFormGroup.get('rptSalesMan').setValue(-1);
    this.reportPurchaseRequisitionFormGroup
      .get('rptInvoiceType')
      .setValue('ALL');
    this.reportPurchaseRequisitionFormGroup.get('rptNetAmt').setValue(null);
    this.reportPurchaseRequisitionFormGroup.get('rptDiscAmt').setValue(null);
    this.reportPurchaseRequisitionFormGroup.get('rptDetails').setValue(true);
    this.reportPurchaseRequisitionFormGroup.get('rptSuppInvNo').setValue('');
    this.reportPurchaseRequisitionFormGroup.patchValue({
      rptDtpFrom: new Date(),
      rptDtpTo: new Date(),
    });

    // this.reportPurchaseRequisitionFormGroup.patchValue({
    //   rptDtpTo: new Date()
    // });
    this.List_REPORT();

    //   rptBrand?: number;
    //   rptItemGroup?: number;
    //   rptItem?: number;
    // rptCurrency?: number;
    //   rptSalesMan?: number;
    //   rptInvoiceType?: string;

    //    this.reportPurchaseRequisitionFormGroup.get('rptAsOnDate').setValue(true);
    //    this.reportPurchaseRequisitionFormGroup.get('rptPrintWithRef').setValue(true);
    //    this.reportPurchaseRequisitionFormGroup.get('rptPrintWithCheq').setValue(false);
    //    this.reportPurchaseRequisitionFormGroup.get('rptPrintWithAlloc').setValue(false);
    //    this.reportPurchaseRequisitionFormGroup.get('rptPrintWithAgainstAcc').setValue(false);
    //    this.reportPurchaseRequisitionFormGroup.get('rptPrintWithRelatedAccTrans').setValue(false);

    //    this.reportPurchaseRequisitionFormGroup.get('rptCostCenter').setValue(-1);

    //    this.reportPurchaseRequisitionFormGroup.get('rptDescription').setValue('');

    //  this.reportPurchaseRequisitionFormGroup.get('rptDtpAson').setValue(null);

    //    this.reportPurchaseRequisitionFormGroup.get('rptTotRunningBalanceCreditDebit').setValue(null);
    //   // this.reportPurchaseRequisitionFormGroup.get('rptType').setValue(-1);

    //   this.reportPurchaseRequisitionFormGroup.get('rptAsOnDate').setValue(true);
    //   this.reportPurchaseRequisitionFormGroup.get('rptPrintWithRef').setValue(true);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
    this.index = 0;
    this.reportPurchaseRequisitionFormGroup.enable();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.reportPurchaseRequisitionFormGroup,
        'rptLocation'
      );
    }
    //  this.f.purchaseRequisitionNo.clearValidators();
    this.reportPurchaseRequisitionFormGroup.updateValueAndValidity();
  }
  AsOnDateDateRange() {
    //  if (this.reportPurchaseRequisitionFormGroup.value.rptDateRange ==true)
    //   {
    //     this.reportPurchaseRequisitionFormGroup.get('rptAsOnDate').setValue(true);
    // }
    // else
    //  {
    //   this.reportPurchaseRequisitionFormGroup.get('rptDateRange').setValue(false);
    // }
  }

  SummaryDetails() {
    //   if (this.reportPurchaseRequisitionFormGroup.value.rptSummary ==true)
    //   {
    //     // this.reportPurchaseRequisitionFormGroup.get('rptDetails').setValue(true);
    //     this.reportPurchaseRequisitionFormGroup.controls.rptSummary.setValue(true);
    // }
    // else
    //  {
    //   // this.reportPurchaseRequisitionFormGroup.get('rptSummary').setValue(false);
    //   this.reportPurchaseRequisitionFormGroup.controls.rptSummary.setValue(true);
    // }
  }

  PrintCheckBox() {
    //   if (this.reportPurchaseRequisitionFormGroup.value.rptPrintWithRef ==true)
    //   {
    //     this.reportPurchaseRequisitionFormGroup.get('rptPrintWithRef').setValue(true);
    //     this.reportPurchaseRequisitionFormGroup.get('rptPrintWithCheq').setValue(false);
    //     this.reportPurchaseRequisitionFormGroup.get('rptPrintWithAlloc').setValue(false);
    //     this.reportPurchaseRequisitionFormGroup.get('rptPrintWithAgainstAcc').setValue(false);
    //     this.reportPurchaseRequisitionFormGroup.get('rptPrintWithRelatedAccTrans').setValue(false);
    // }
    // else
    //  {
    //   this.reportPurchaseRequisitionFormGroup.get('rptPrintWithRef').setValue(false);
    //    this.reportPurchaseRequisitionFormGroup.get('rptPrintWithCheq').setValue(false);
    //    this.reportPurchaseRequisitionFormGroup.get('rptPrintWithAlloc').setValue(false);
    //    this.reportPurchaseRequisitionFormGroup.get('rptPrintWithAgainstAcc').setValue(false);
    //    this.reportPurchaseRequisitionFormGroup.get('rptPrintWithRelatedAccTrans').setValue(false);
    // }
  }
  cancel() {}
  saveVoucher(
    purchaseRequisitionReportParameters_Save: PurchaseRequisitionReportParameters
  ) {
    if (this.reportPurchaseRequisitionFormGroup.valid) {
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
      // this.purchaseRequisitionReportParameters_Save: CreditNote.markAllAsTouched();
      this.reportPurchaseRequisitionFormGroup.markAsDirty();
    }
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
    //  this.DateRange == true;
    //   this.AsOnDate = false;
  }
  makeDateRangeTrue() {
    if (this.DateRange == true) {
      this.DateRange = false;
    } else {
      this.DateRange = true;
    }
    //  this.DateRange == true;
    //   this.AsOnDate = false;
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
        this.reportPurchaseRequisitionFormGroup.getRawValue().rptDtpFrom == null
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No From Date',
        });
        return false;
      }
      if (
        this.reportPurchaseRequisitionFormGroup.getRawValue().rptDtpTo == null
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No To Date',
        });
        return false;
      }
      if (
        this.reportPurchaseRequisitionFormGroup.getRawValue().rptDtpTo <
        this.reportPurchaseRequisitionFormGroup.getRawValue().rptDtpFrom
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
    //   if(  this.reportPurchaseRequisitionFormGroup.getRawValue().rptDtpAson==null){
    //   this.messageService.add({severity: 'error', summary: 'Alert', detail: 'No As On Date'});
    //   return false;
    // }

    // }

    return true;
  }
  Print_API_CALL() {
    const purchaseRequisitionReportParameters_Save: PurchaseRequisitionReportParameters =
      this.reportPurchaseRequisitionFormGroup
        .value as PurchaseRequisitionReportParameters;

    purchaseRequisitionReportParameters_Save.rptSummary = this.Summary;
    purchaseRequisitionReportParameters_Save.rptDetails = this.Details;
    purchaseRequisitionReportParameters_Save.rptDateRange = this.DateRange;
    purchaseRequisitionReportParameters_Save.rptDtpFrom =
      this.reportPurchaseRequisitionFormGroup.value.rptDtpFrom;
    purchaseRequisitionReportParameters_Save.rptDtpTo =
      this.reportPurchaseRequisitionFormGroup.value.rptDtpTo;
    purchaseRequisitionReportParameters_Save.rptPrintGroupByItem =
      this.PrintGroupByItem;
    purchaseRequisitionReportParameters_Save.rptJob =
      this.reportPurchaseRequisitionFormGroup.value.rptJob;
    purchaseRequisitionReportParameters_Save.rptSupplier =
      this.reportPurchaseRequisitionFormGroup.value.rptSupplier;
    purchaseRequisitionReportParameters_Save.rptLocation =
      this.reportPurchaseRequisitionFormGroup.get('rptLocation')?.value;

    purchaseRequisitionReportParameters_Save.rptBrand = -1; //this.reportPurchaseRequisitionFormGroup.value.rptBrand;
    purchaseRequisitionReportParameters_Save.rptItemGroup =
      this.reportPurchaseRequisitionFormGroup.value.rptItemGroup;
    purchaseRequisitionReportParameters_Save.rptItem =
      this.reportPurchaseRequisitionFormGroup.value.rptItem;
    // purchaseRequisitionReportParameters_Save.rptInvoiceType = this.reportPurchaseRequisitionFormGroup.value.rptInvoiceType;
    purchaseRequisitionReportParameters_Save.rptInvoiceType = 'ALL';
    purchaseRequisitionReportParameters_Save.rptSalesMan = -1; //this.reportPurchaseRequisitionFormGroup.value.rptSalesMan;
    purchaseRequisitionReportParameters_Save.rptDpt = -1; //this.reportPurchaseRequisitionFormGroup.value.rptDpt;
    purchaseRequisitionReportParameters_Save.rptCurrency =
      this.reportPurchaseRequisitionFormGroup.value.rptCurrency;
    purchaseRequisitionReportParameters_Save.rptSuppInvNo =
      this.reportPurchaseRequisitionFormGroup.value.rptSuppInvNo;
    // purchaseRequisitionReportParameters_Save.rptNetAmt = this.reportPurchaseRequisitionFormGroup.value.rptNetAmt;
    // purchaseRequisitionReportParameters_Save.rptDiscAmt = this.reportPurchaseRequisitionFormGroup.value.rptDiscAmt;

    //   purchaseRequisitionReportParameters_Save.rptAsOnDate = this.AsOnDate;

    // // purchaseRequisitionReportParameters_Save.rptPrintWithRef = this.reportPurchaseRequisitionFormGroup.value.rptPrintWithRef;
    // // purchaseRequisitionReportParameters_Save.rptPrintWithCheq = this.reportPurchaseRequisitionFormGroup.value.rptPrintWithCheq;
    // // purchaseRequisitionReportParameters_Save.rptPrintWithAlloc = this.reportPurchaseRequisitionFormGroup.value.rptPrintWithAlloc;
    // // purchaseRequisitionReportParameters_Save.rptPrintWithAgainstAcc = this.reportPurchaseRequisitionFormGroup.value.rptPrintWithAgainstAcc;
    // // purchaseRequisitionReportParameters_Save.rptPrintWithRelatedAccTrans = this.reportPurchaseRequisitionFormGroup.value.rptPrintWithRelatedAccTrans;

    // purchaseRequisitionReportParameters_Save.rptPrintWithRef = this.PrintWithRef;
    // purchaseRequisitionReportParameters_Save.rptPrintWithCheq = this.PrintWithCheq;
    // purchaseRequisitionReportParameters_Save.rptPrintWithAlloc = this.PrintWithAlloc;
    // purchaseRequisitionReportParameters_Save.rptPrintWithAgainstAcc = this.PrintWithAgainstAcc;
    // purchaseRequisitionReportParameters_Save.rptPrintWithRelatedAccTrans = this.PrintWithRelatedAccTrans;

    // // purchaseRequisitionReportParameters_Save.rptPrintGroupByItem = this.reportPurchaseRequisitionFormGroup.value.rptPrintGroupByItem;

    // purchaseRequisitionReportParameters_Save.rptCostCenter = this.reportPurchaseRequisitionFormGroup.value.rptCostCenter;

    // purchaseRequisitionReportParameters_Save.rptDescription = this.reportPurchaseRequisitionFormGroup.value.rptDescription;
    //
    // purchaseRequisitionReportParameters_Save.rptDtpAson = this.reportPurchaseRequisitionFormGroup.value.rptDtpAson;

    // purchaseRequisitionReportParameters_Save.rptTotRunningBalanceCreditDebit = this.reportPurchaseRequisitionFormGroup.value.rptTotRunningBalanceCreditDebit;

    purchaseRequisitionReportParameters_Save.viewStockTransferType = [];

    this.messageService.add({
      severity: 'error',
      summary: 'Alert',
      detail: 'Print API CALL',
    });
  }
  Print_REPORT() {
    //   if (this.reportSalesVoucherFormGroup.valid  ) {
    //     if(this.validateDate()){
    //       this.List_REPORT();
    //       this.Print_API_CALL();
    //   }
    // }
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
      this.reportPurchaseRequisitionFormGroup.markAllAsTouched();
      this.reportPurchaseRequisitionFormGroup.markAsDirty();
    }
  }

  List_REPORT() {
    //if (this.reportPurchaseRequisitionFormGroup.valid  ) {
    //if(this.validateDate()){
    if (true) {
      if (this.validateDate()) {
        const purchaseRequisitionReportParameters_Save: PurchaseRequisitionReportParameters =
          this.reportPurchaseRequisitionFormGroup
            .value as PurchaseRequisitionReportParameters;

        purchaseRequisitionReportParameters_Save.rptSummary = this.Summary;
        purchaseRequisitionReportParameters_Save.rptDetails = this.Details;
        purchaseRequisitionReportParameters_Save.rptDateRange = this.DateRange;
        purchaseRequisitionReportParameters_Save.rptDtpFrom =
          this.reportPurchaseRequisitionFormGroup.value.rptDtpFrom;
        purchaseRequisitionReportParameters_Save.rptDtpTo =
          this.reportPurchaseRequisitionFormGroup.value.rptDtpTo;
        purchaseRequisitionReportParameters_Save.rptPrintGroupByItem =
          this.PrintGroupByItem;
        purchaseRequisitionReportParameters_Save.rptJob =
          this.reportPurchaseRequisitionFormGroup.value.rptJob;
        purchaseRequisitionReportParameters_Save.rptSupplier =
          this.reportPurchaseRequisitionFormGroup.value.rptSupplier;
        purchaseRequisitionReportParameters_Save.rptLocation =
          this.reportPurchaseRequisitionFormGroup.get('rptLocation')?.value;

        purchaseRequisitionReportParameters_Save.rptBrand = -1; // this.reportPurchaseRequisitionFormGroup.value.rptBrand;
        purchaseRequisitionReportParameters_Save.rptItemGroup =
          this.reportPurchaseRequisitionFormGroup.value.rptItemGroup;
        purchaseRequisitionReportParameters_Save.rptItem =
          this.reportPurchaseRequisitionFormGroup.value.rptItem;
        purchaseRequisitionReportParameters_Save.rptCurrency =
          this.reportPurchaseRequisitionFormGroup.value.rptCurrency;
        purchaseRequisitionReportParameters_Save.rptSalesMan = -1; //this.reportPurchaseRequisitionFormGroup.value.rptSalesMan;
        purchaseRequisitionReportParameters_Save.rptDpt = -1; //this.reportPurchaseRequisitionFormGroup.value.rptDpt;
        //  purchaseRequisitionReportParameters_Save.rptInvoiceType = this.reportSalesVoucherFormGroup.value.rptInvoiceType;
        purchaseRequisitionReportParameters_Save.rptInvoiceType = 'ALL';
        purchaseRequisitionReportParameters_Save.rptSuppInvNo =
          this.reportPurchaseRequisitionFormGroup.value.rptSuppInvNo;

        // purchaseRequisitionReportParameters_Save.rptNetAmt = this.reportSalesVoucherFormGroup.value.rptNetAmt;
        // purchaseRequisitionReportParameters_Save.rptDiscAmt = this.reportSalesVoucherFormGroup.value.rptDiscAmt;

        // purchaseRequisitionReportParameters_Save.rptAsOnDate = this.AsOnDate;
        // purchaseRequisitionReportParameters_Save.rptPrintWithRef = this.PrintWithRef;
        // purchaseRequisitionReportParameters_Save.rptPrintWithCheq = this.PrintWithCheq;
        // purchaseRequisitionReportParameters_Save.rptPrintWithAlloc = this.PrintWithAlloc;
        // purchaseRequisitionReportParameters_Save.rptPrintWithAgainstAcc = this.PrintWithAgainstAcc;
        // purchaseRequisitionReportParameters_Save.rptPrintWithRelatedAccTrans = this.PrintWithRelatedAccTrans;

        // purchaseRequisitionReportParameters_Save.rptCostCenter = this.reportPurchaseRequisitionFormGroup.value.rptCostCenter;

        // purchaseRequisitionReportParameters_Save.rptDescription = this.reportPurchaseRequisitionFormGroup.value.rptDescription;
        //
        // purchaseRequisitionReportParameters_Save.rptDtpAson = this.reportPurchaseRequisitionFormGroup.value.rptDtpAson;

        // purchaseRequisitionReportParameters_Save.rptTotRunningBalanceCreditDebit = this.reportPurchaseRequisitionFormGroup.value.rptTotRunningBalanceCreditDebit;

        purchaseRequisitionReportParameters_Save.viewStockTransferType = [];

        this.accountapi
          .MainReport_GetReportPurchaseRequisition_PARAM_CLASS(
            purchaseRequisitionReportParameters_Save
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
      this.reportPurchaseRequisitionFormGroup.markAllAsTouched();
      this.reportPurchaseRequisitionFormGroup.markAsDirty();
    }
  }

  RunningBal: number;
  CalcRunningBal(DiffAmt: number) {
    this.RunningBal = this.RunningBal + DiffAmt;
    return this.RunningBal;
  }
  updateHot_Report(reportSalesVoucher_update: REPORTPurchaseRequisition[]) {
    this.RunningBal = 0;
    // this.updateHot_Report(data.result);
    const gridData: GridData[] = reportSalesVoucher_update.map((k) => {
      return {
        // salesVoucherEnqNo: k.salesVoucherEnqNo,

        purchaseRequisitionId: k.purchaseRequisitionId,
        purchaseRequisitionRefNo: k.purchaseRequisitionRefNo,
        //  salesVoucherContPerson: k.salesVoucherContPerson,
        // salesVoucherDlvNo: k.salesVoucherDlvNo,
        //    salesVoucherShippinAddress :k.salesVoucherShippinAddress ,

        purchaseRequisitionDate: this.datepipes.transform(
          k.purchaseRequisitionDate,
          'dd/MM/yyyy'
        ),
        purchaseRequisitionType: k.purchaseRequisitionType,
        purchaseRequisitionNo: k.purchaseRequisitionNo,

        purchaseRequisitionTotalGrossAmount:
          k.purchaseRequisitionTotalGrossAmount,
        purchaseRequisitionTotalDisAmount: k.purchaseRequisitionTotalDisAmount,

        // salesVoucherDescription:  k.salesVoucherDescription,
        suppliersMasterSupplierVatNo: k.suppliersMasterSupplierVatNo,

        purchaseRequisitionVatAmt: k.purchaseRequisitionVatAmt,
        purchaseRequisitionVatRountAmt: k.purchaseRequisitionVatRountAmt,
        //  salesVoucherQtnNo:k.salesVoucherQtnNo,

        purchaseRequisitionNetAmount: k.purchaseRequisitionNetAmount,
        purchaseRequisitionTotalItemDisAmount:
          k.purchaseRequisitionTotalItemDisAmount,
        purchaseRequisitionNetDisAmount: k.purchaseRequisitionNetDisAmount,
        purchaseRequisitionDetailsMatId: k.purchaseRequisitionDetailsMatId,
        purchaseRequisitionDetailsGrossAmount:
          k.purchaseRequisitionDetailsGrossAmount,
        purchaseRequisitionDetailsDiscAmount:
          k.purchaseRequisitionDetailsDiscAmount,

        suppliersMasterSupplierName: k.suppliersMasterSupplierName,
        purchaseRequisitionPartyName: k.purchaseRequisitionPartyName,
        purchaseRequisitionPartyAddress: k.purchaseRequisitionPartyAddress,

        // itemBrandName: k.itemBrandName,
        purchaseRequisitionDetailsQuantity:
          k.purchaseRequisitionDetailsQuantity,
        // itemGroupName: k.itemGroupName,
        // salesVoucherExcludeVat: k.salesVoucherExcludeVat,
        //  departmentMasterDepartmentName: k.departmentMasterDepartmentName,
        locationMasterLocationName: k.locationMasterLocationName,
        itemMasterItemName: k.itemMasterItemName,
        unitMasterUnitShortName: k.unitMasterUnitShortName,
        currencyMasterCurrencyName: k.currencyMasterCurrencyName,
        purchaseRequisitionDetailsRemarks: k.purchaseRequisitionDetailsRemarks,
        //  salesManMasterSalesManName: k.salesManMasterSalesManName,
        itemMasterPartNo: k.itemMasterPartNo,
        purchaseRequisitionSupInvNo: k.purchaseRequisitionSupInvNo,

        purchaseRequisitionPono: k.purchaseRequisitionPono,
        purchaseRequisitionPartyVatNo: k.purchaseRequisitionPartyVatNo,

        purchaseRequisitionDetailsVatPer: k.purchaseRequisitionDetailsVatPer,
        purchaseRequisitionDetailsVatAmt: k.purchaseRequisitionDetailsVatAmt,

        purchaseRequisitionFsno: k.purchaseRequisitionFsno,
        //  accountsTransactionsUserId: k.itemGroupId,
        //  itemGroupId: k.itemGroupId,
        //  itemBrandId: k.itemBrandId,
        salesVoucherLocationId: k.purchaseRequisitionDetailsVatAmt,
        //  salesVoucherJobId: k.salesVoucherJobId,
        //   salesVoucherUserId: k.salesVoucherUserId,
        //   salesVoucherCompanyId: k.salesVoucherCompanyId,
        //   salesVoucherDptId: k.salesVoucherDptId,
        purchaseRequisitionDelStatus: k.purchaseRequisitionDelStatus,

        purchaseRequisitionDetailsNetAmt: k.purchaseRequisitionDetailsNetAmt,
      };
    });
    this.reportpurchaserequisition_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.reportPurchaseRequisitionFormGroup.disable();
    // this.f.purchaseRequisitionNo.clearValidators();
    this.reportPurchaseRequisitionFormGroup.updateValueAndValidity();

    this.edit();
    this.ColumnSum();
    if (this.Details) {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [
            //  0,     this.translate.instant('VoucherNo'),
            //  1,     this.translate.instant('Date'),
            2, //   this.translate.instant( 'Type'),

            3, //       this.translate.instant('Supp. Inv. #'),
            //4,       this.translate.instant( 'Location'),

            5, //5,       this.translate.instant('Supplier'),
            6, //       this.translate.instant('Gross.Amt.'),
            7, //       this.translate.instant('Item.Disc.'),
            8, //      this.translate.instant('Net.Disc'),
            9, //       this.translate.instant('Total.Disc'),
            10, //     this.translate.instant('VAT.Amt.'),
            11, //   this.translate.instant('Round.Amt.'),
            12, //       this.translate.instant('Net.Amt'),
            13, // 13, this.translate.instant( 'Item.Id'),
            14, //  14,     this.translate.instant( 'Part No.'),
            //  15,     this.translate.instant('Item'),
            // 16,      this.translate.instant('Unit'),
            // 17, this.translate.instant( 'Qty'),
            // 18,    this.translate.instant('Remarks'),
            19, //       this.translate.instant('Gross.Amt.'),
            20, //  this.translate.instant('Disc Amt.'),
            21, //       this.translate.instant('Net.Amt.'),
          ],
          indicators: false,
        },
      });
    } else {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [
            //  0,     this.translate.instant('VoucherNo'),
            //  1,     this.translate.instant('Date'),
            2, //   this.translate.instant( 'Type'),

            3, //       this.translate.instant('Supp. Inv. #'),
            //4,       this.translate.instant( 'Location'),

            5, //5,       this.translate.instant('Supplier'),
            6, //       this.translate.instant('Gross.Amt.'),
            7, //       this.translate.instant('Item.Disc.'),
            8, //      this.translate.instant('Net.Disc'),
            9, //       this.translate.instant('Total.Disc'),
            10, //     this.translate.instant('VAT.Amt.'),
            11, //   this.translate.instant('Round.Amt.'),
            12, //       this.translate.instant('Net.Amt'),
            13, //this.translate.instant( 'Item.Id'),
            14, //    this.translate.instant( 'Part No.'),
            15, //     this.translate.instant('Item'),
            16, //     this.translate.instant('Unit'),
            17, // this.translate.instant( 'Qty'),
            18, //   this.translate.instant('Remarks'),
            19, //       this.translate.instant('Gross.Amt.'),
            20, //  this.translate.instant('Disc Amt.'),
            21, //       this.translate.instant('Net.Amt.'),
          ],
          indicators: false,
        },
      });
    }
  }
}

interface GridData {
  purchaseRequisitionDetailsNetAmt?: number;
  salesVoucherEnqNo?: string;
  salesVoucherQtnNo?: string;
  purchaseRequisitionId?: number;
  purchaseRequisitionRefNo?: string;
  salesVoucherContPerson?: string;
  salesVoucherDlvNo?: string;
  salesVoucherShippinAddress?: string;
  purchaseRequisitionDate?: string;
  purchaseRequisitionType?: string;
  purchaseRequisitionNo?: string;
  purchaseRequisitionTotalGrossAmount?: number;
  purchaseRequisitionTotalDisAmount?: number;
  salesVoucherDescription?: string;
  suppliersMasterSupplierVatNo?: string;
  purchaseRequisitionVatAmt?: number;
  purchaseRequisitionVatRountAmt?: number;
  purchaseRequisitionNetAmount?: number;
  purchaseRequisitionTotalItemDisAmount?: number;
  purchaseRequisitionNetDisAmount?: number;
  purchaseRequisitionDetailsMatId?: number;
  purchaseRequisitionDetailsGrossAmount?: number;
  purchaseRequisitionDetailsDiscAmount?: number;
  suppliersMasterSupplierName?: string;
  purchaseRequisitionPartyName?: string;
  purchaseRequisitionPartyAddress?: string;
  itemBrandName?: string;
  purchaseRequisitionDetailsQuantity?: number;
  itemGroupName?: string;
  salesVoucherExcludeVat?: boolean;
  departmentMasterDepartmentName?: string;
  locationMasterLocationName?: string;
  itemMasterItemName?: string;
  unitMasterUnitShortName?: string;
  currencyMasterCurrencyName?: string;
  purchaseRequisitionDetailsRemarks?: string;
  salesManMasterSalesManName?: string;
  itemMasterPartNo?: string;
  purchaseRequisitionPono?: string;
  purchaseRequisitionPartyVatNo?: string;
  purchaseRequisitionDetailsVatPer?: number;
  purchaseRequisitionDetailsVatAmt?: number;
  purchaseRequisitionFsno?: number;
  accountsTransactionsUserId?: number;
  itemGroupId?: number;
  itemBrandId?: number;
  salesVoucherLocationId?: number;
  salesVoucherJobId?: number;
  salesVoucherUserId?: number;
  salesVoucherCompanyId?: number;
  salesVoucherDptId?: number;
  purchaseRequisitionDelStatus?: boolean;
  salesVoucherStatus?: string;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
export const purchaseRequisitionColumnObjList = (
  component: ReportpurchaserequisitionComponent
) => [
  {
    data: 'purchaseRequisitionNo',
    type: 'text',
    label: 'VoucherNo',
    toolTip: 'Purchase Requisition Number',
  },
  {
    data: 'purchaseRequisitionDate',
    type: 'date',
    label: 'Date',
    toolTip: 'Requisition Date',
    dateFormat: 'DD-MMM-YYYY',
  },
  {
    data: 'purchaseRequisitionType',
    type: 'text',
    label: 'Type',
    toolTip: 'Requisition Type',
  },
  {
    data: 'purchaseRequisitionSupInvNo',
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
    data: 'purchaseRequisitionTotalGrossAmount',
    type: 'numeric',
    label: 'Gross.Amt.',
    toolTip: 'Total Gross Amount',
  },
  {
    data: 'purchaseRequisitionTotalItemDisAmount',
    type: 'numeric',
    label: 'Item.Disc.',
    toolTip: 'Item Discount Amount',
  },
  {
    data: 'purchaseRequisitionTotalDisAmount',
    type: 'numeric',
    label: 'Net.Disc',
    toolTip: 'Net Discount',
  },
  {
    data: 'purchaseRequisitionNetDisAmount',
    type: 'numeric',
    label: 'Total.Disc',
    toolTip: 'Total Discount',
  },
  {
    data: 'purchaseRequisitionVatAmt',
    type: 'numeric',
    label: 'VAT.Amt.',
    toolTip: 'VAT Amount',
  },
  {
    data: 'purchaseRequisitionVatRountAmt',
    type: 'numeric',
    label: 'Round.Amt.',
    toolTip: 'Round Amount',
  },
  {
    data: 'purchaseRequisitionNetAmount',
    type: 'numeric',
    label: 'Net.Amt',
    toolTip: 'Net Amount',
  },
  {
    data: 'purchaseRequisitionDetailsMatId',
    type: 'numeric',
    label: 'Item.Id',
    toolTip: 'Item ID',
  },
  {
    data: 'itemMasterPartNo',
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
    data: 'purchaseRequisitionDetailsQuantity',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
  },
  {
    data: 'purchaseRequisitionDetailsRemarks',
    type: 'text',
    label: 'Remarks',
    toolTip: 'Remarks',
  },
  {
    data: 'purchaseRequisitionDetailsGrossAmount',
    type: 'numeric',
    label: 'Gross.Amt.',
    toolTip: 'Gross Amount',
  },
  {
    data: 'purchaseRequisitionDetailsDiscAmount',
    type: 'numeric',
    label: 'Disc Amt.',
    toolTip: 'Discount Amount',
  },
  {
    data: 'purchaseRequisitionDetailsNetAmt',
    type: 'numeric',
    label: 'Net.Amt.',
    toolTip: 'Net Amount',
  },
];
