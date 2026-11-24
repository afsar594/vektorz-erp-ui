import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { FormBuilder, FormGroup } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import * as XLSX from 'xlsx';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { ReportAccountsTransactions } from 'src/app/routes/domain/Accounts/ReportAccountsTransactions';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { ViewAccountsTransactionsVoucherType } from 'src/app/routes/domain/Accounts/ViewAccountsTransactionsVoucherType';

import { AccountStatementParameters } from 'src/app/routes/domain/Accounts/AccountStatementParameters';

import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { DatePipe } from '@angular/common';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { FinancialPeriods } from 'src/app/routes/domain/FinancialPeriods';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-accountstransactionsreport',
  templateUrl: './accountstransactionsreport.component.html',
  styleUrls: ['./accountstransactionsreport.component.scss'],
})
export class AccountstransactionsreportComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;
  items: MenuItem[];
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

  types: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  V_TYPEArray: ViewAccountsTransactionsVoucherType[] = [];
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
  dataset: any;

  // Column visibility toggles for optional columns
  columnVisibility: { [key: string]: boolean } = {
    'Ref #': false,
    'Cost Center': false,
    'Against': false,
    'VAT #': false,
    'VAT Amt': false,
    'Cheq #': false,
    'Cheq Date': false,
    'LPO #': false,
    'Job': false,
    'Department': false,
    'Location': false,
    'View': false,
  };

  toggleableColumns = [
    { label: 'Ref #', colIndex: 20 },
    { label: 'Cost Center', colIndex: 21 },
    { label: 'Against', colIndex: 22 },
    { label: 'VAT #', colIndex: 23 },
    { label: 'VAT Amt', colIndex: 24 },
    { label: 'Cheq #', colIndex: 25 },
    { label: 'Cheq Date', colIndex: 26 },
    { label: 'LPO #', colIndex: 27 },
    { label: 'Job', colIndex: 28 },
    { label: 'Department', colIndex: 29 },
    { label: 'Location', colIndex: 30 },
    { label: 'View', colIndex: 40 },
  ];
  accountTransactionList: AccountsTransactions[] = [];
  reportAccountsTransactionsarry: ReportAccountsTransactions[] = [];
  // savedPurchaseVoucherGridData: GridData[] = [];
  // savedPurchaseVoucher: PurchaseVoucher;
  loading = false;
  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];

  splitButtonOptions: any[];
  position: string;
  ScreenId: number;
  Permission: any;
  Data_result: any[];
  pdfSource: string;

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
  selectedType: string;

  listboxOptions: any[] = [
    { label: 'Print With Ref#', value: 'PrintWithRef', checked: false },
    { label: 'Print With Cheq#', value: 'PrintWithCheq', checked: false },
    { label: 'Print With Alloc.', value: 'PrintWithAlloc', checked: false },
    {
      label: 'Print With Against Acc.',
      value: 'PrintWithAgainstAcc',
      checked: false,
    },
    {
      label: 'Print With Related Acc. Trans',
      value: 'PrintWithRelatedAccTrans',
      checked: false,
    },
  ];
  selectedOptions: any[] = [];
  selectedVouchers: any[] = [];
  displayOptionsDialog: boolean = false;
  totalDebit = 0;
  totalCredit = 0;
  printbtn: MenuItem[];

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private datePipe: DatePipe,
    private printService: FileSaverService,
    private crystalReportService: CrystalReportService,
    private masterapi: MasterApiService,
    private formatDateService: ReportDateFormatService,
    private utilityService: UtilityService,

    private accountapi: AccountApiService,
    private permission: PermissionsService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.types = [
      { label: 'Apartment', value: 'Apartment' },
      { label: 'House', value: 'House' },
      { label: 'Studio', value: 'Studio' },
    ];
    this.splitButtonOptions = [
      {
        label: 'Print With Ref#',
        command: () => this.makePrintOptionTrue('rptPrintWixthRef'),
      },
      {
        label: 'Print With Cheq#',
        command: () => this.makePrintOptionTrue('rptPrintWithCheq'),
      },
      {
        label: 'Print With Alloc.',
        command: () => this.makePrintOptionTrue('rptPrintWithAlloc'),
      },
      {
        label: 'Print With Against Acc.',
        command: () => this.makePrintOptionTrue('rptPrintWithAgainstAcc'),
      },
      {
        label: 'Print With Related Acc. Trans',
        command: () => this.makePrintOptionTrue('rptPrintWithRelatedAccTrans'),
      },
    ];
    this.printbtn = [
      {
        label: 'PDF',
        command: () => {
          this.getReport1('pdf');
        },
      },
      {
        label: 'Excel',
        command: () => {
          this.getReport1('excel');
        },
      },
    ];
  }

  showOptionsDialog() {
    this.displayOptionsDialog = true;
  }

  showPositionDialog(position: string) {
    this.position = position;
    this.displayOptionsDialog = true;
  }

  onOptionsDialogSubmit() {
    // Perform any additional actions when the options dialog is submitted
    this.displayOptionsDialog = false;
  }

  onOptionChange(selectedOption: string) {
    // Handle the selected option change here
    this.makePrintOptionTrue(selectedOption);
  }

  onVTypeChange(selectedOption: any) {
    this.selectedVouchers = [];
    selectedOption?.forEach((value, index) => {
      this.selectedVouchers?.push(value.value);
    });
  }

  private hotRegisterer = new HotTableRegisterer();
  hotid = 'reportaccountstransactions_HotEntry';
  reportaccountstransactions_entry: Handsontable.GridSettings;
  reportAccountsTransactionsFormGroup: FormGroup;
  reportaccountstransactions_entryDataset = [];
  test = [];

  filteredData = [];
  // accountTransactionDataset = [];
  cols;
  ngOnInit(): void {
    console.log('nigza');
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();

      rights.forEach((res) => {
        if (
          res.workGroupPermissionsMenuName === 'Accounts Transactions Report'
        ) {
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
    this.reportAccountsTransactionsFormGroup = this.fb.group({
      rptSummary: [{ value: false, disabled: true }],
      rptDetails: [{ value: true, disabled: true }],
      rptDateRange: [{ value: false, disabled: true }],
      rptAsOnDate: [{ value: true, disabled: true }],
      rptPrintWithRef: [{ value: true, disabled: true }],
      rptPrintWithCheq: [{ value: true, disabled: true }],
      rptPrintWithAlloc: [{ value: true, disabled: true }],
      rptPrintWithAgainstAcc: [{ value: true, disabled: true }],
      rptPrintWithRelatedAccTrans: [{ value: true, disabled: true }],
      rptHideOpeningBalance: [{ value: false, disabled: true }],
      rptCostCenter: [{ value: [-1], disabled: true }],
      rptJob: [{ value: [-1], disabled: true }],
      rptAccount: [{ value: [-1], disabled: true }, [DropDownValidator]],
      rptLocation: [{ value: [-1], disabled: true }],
      rptDescription: [{ value: '', disabled: true }],
      rptNarration: [{ value: [''], disabled: true }],
      rptDtpAson: [{ value: new Date(), disabled: true }],
      rptDtpFrom: [{ value: new Date(), disabled: true }],
      rptDtpTo: [{ value: new Date(), disabled: true }],
      rptTotDebit: [{ value: [null], disabled: true }],
      rptTotCredit: [{ value: [null], disabled: true }],
      rptTotRunningBalanceCreditDebit: [{ value: [null], disabled: true }],
      rptType: [{ value: [null], disabled: true }],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
  }

  get f() {
    return this.reportAccountsTransactionsFormGroup.controls;
  }
  makePrintOptionTrue(option: string) {
    // this.resetPrintOptions();
    switch (option) {
      case 'rptPrintWixthRef':
        this.PrintWithRef = true;
        break;
      case 'rptPrintWithCheq':
        this.PrintWithCheq = true;
        break;
      case 'rptPrintWithAlloc':
        this.PrintWithAlloc = true;
        break;
      case 'rptPrintWithAgainstAcc':
        this.PrintWithAgainstAcc = true;
        break;
      case 'rptPrintWithRelatedAccTrans':
        this.PrintWithRelatedAccTrans = true;
        break;
    }
  }

  initializeControls() {
    this.accountapi
      .MainReport_GetAccountsTransactionsLoadDropdown()
      .subscribe((m) => {
        //job
        this.jobArray = m.resultSet.jobMasters;
        this.jobList = m.resultSet.jobMasters?.map((kl) => ({
          label: kl.jobMasterJobName,
          value: kl.jobMasterJobId,
        }));
        this.jobList.unshift({ label: '--Select Job--', value: -1 });

        //cost center
        this.costcenterArray = m.resultSet.costcenterMasters;
        this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
          label: kl.costCenterMasterCostCenterName,
          value: kl.costCenterMasterCostCenterId,
        }));
        this.costcenterList.unshift({
          label: '--Select Cost Center--',
          value: -1,
        });
        //account
        this.accountArray = m.resultSet.masterAccountsTables;
        this.accountList = m.resultSet.masterAccountsTables?.map((kl) => ({
          label: kl.maAccName,
          value: kl.maAccNo,
        }));
        this.accountList.unshift({ label: '--Select Account--', value: -1 });
        //location
        this.locationArray = m.resultSet.locationMaster;
        this.locationList = m.resultSet.locationMaster?.map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
        this.locationList.unshift({ label: '--Select Location--', value: -1 });
        //voucher type
        this.V_TYPEArray = m.resultSet.vouchers;
        this.V_TYPEList = m.resultSet.vouchers?.map((kl) => ({
          label: kl.accountsTransactionsVoucherType,
          value: kl.accountsTransactionsVoucherType,
        }));

        //this.new();
      });
    const hiddenColumns = this.getHiddenColumnsForDetails();
    this.reportaccountstransactions_entry = this.utilityService.getTableConfig(
      accountTransactionsColumnList(this),
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
      const PrevRunningBal = Number(
        (this.reportaccountstransactions_entry.data[this.index] as any)
          ?.accountsTransactionsRunningBalance
      );
      const debitMinusCredit =
        Number(
          (this.reportaccountstransactions_entry.data[this.index] as any)
            ?.accountsTransactionsDebit
        ) -
        Number(
          (this.reportaccountstransactions_entry.data[this.index] as any)
            ?.accountsTransactionsCredit
        );
      this.ColumnSum();
    };

    this.reportaccountstransactions_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
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

    this.reportaccountstransactions_entry.afterRenderer = (
      td: HTMLTableCellElement,
      row: number,
      col: number,
      prop: string | number,
      value: any,
      cellProperties: any
    ) => {
      if (!this.highlightDebitCredit) {
        td.style.removeProperty('background-color');
        return;
      }
      try {
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        if (!hotInstance) return;
        
        const rowData = hotInstance.getSourceDataAtRow(row) as any;
        if (!rowData) {
          td.style.removeProperty('background-color');
          return;
        }
        
        const debit = Number(rowData.accountsTransactionsDebit) || 0;
        const credit = Number(rowData.accountsTransactionsCredit) || 0;
        
        if (credit > 0 && debit === 0) {
          td.style.setProperty('background-color', 'yellow', 'important'); // hard yellow for credit
        } else if (debit > 0 && credit === 0) {
          td.style.setProperty('background-color', '#00FF00', 'important'); // hard green for debit
        } else {
          td.style.removeProperty('background-color');
        }
      } catch (e) {
        // Table not initialized yet
      }
    };

    this.reportaccountstransactions_entry.afterOnCellMouseDown = (
      event: MouseEvent,
      coords: any
    ) => {
      if (coords.row >= 0 && event.button === 0 && event.detail === 2) {
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        if (!hotInstance) return;

        const physicalRow = hotInstance.toPhysicalRow
          ? hotInstance.toPhysicalRow(coords.row)
          : coords.row;

        const rowData = hotInstance.getSourceDataAtRow(physicalRow) as any;
        if (
          rowData?.accountsTransactionsVoucherNo &&
          rowData?.accountsTransactionsVoucherType
        ) {
          this.viewAction(
            rowData.accountsTransactionsVoucherType,
            rowData.accountsTransactionsVoucherNo
          );
        }
      }
    };
  }

  ColumnSum() {
    let sum1: number = 0;
    const data = this.reportaccountstransactions_entry.data.forEach(
      (item: any) => {
        if (item.accountsTransactionsDebit !== undefined) {
          sum1 += item?.accountsTransactionsDebit;
        }
      }
    );
    this.totalDebit = sum1;
    let sum2: number = 0;
    const data1 = this.reportaccountstransactions_entry.data.forEach(
      (item: any) => {
        if (item.accountsTransactionsCredit !== undefined) {
          sum2 += item?.accountsTransactionsCredit;
        }
      }
    );
    this.totalCredit = sum2;
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

  // AccNo: string,  Location : number,   Job : number,   CostCenter : number,  FromDate : Date,   ToDate : Date,
  //  HideOpeningBal : boolean,  Narration : string,   Description : string
  getGetReportAccountsTransactions() {
    this.accountapi
      .MainReport_GetReportAccountsTransactions(
        this.reportAccountsTransactionsFormGroup.value.rptAccount,
        Number(this.reportAccountsTransactionsFormGroup.value.rptLocation),
        Number(this.reportAccountsTransactionsFormGroup.value.rptJob),
        Number(this.reportAccountsTransactionsFormGroup.value.rptCostCenter)
      )
      .subscribe((data) => {
        this.reportAccountsTransactionsarry = data.result;
        this.updateHot_Report(data.result);
      });

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
    this.reportAccountsTransactionsFormGroup.enable();
    // this.reportAccountsTransactionsFormGroup.controls.purchaseVoucherNo.disable();
    this.reportAccountsTransactionsFormGroup.updateValueAndValidity();
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  new() {
    this.reportAccountsTransactionsFormGroup.reset();
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

    this.reportAccountsTransactionsFormGroup.get('rptSummary').setValue(false);
    this.reportAccountsTransactionsFormGroup.get('rptDetails').setValue(true);
    this.reportAccountsTransactionsFormGroup
      .get('rptDateRange')
      .setValue(false);
    this.dateRangeMode = null;
    this.reportAccountsTransactionsFormGroup.get('rptAsOnDate').setValue(true);
    this.reportAccountsTransactionsFormGroup
      .get('rptPrintWithRef')
      .setValue(true);
    this.reportAccountsTransactionsFormGroup
      .get('rptPrintWithCheq')
      .setValue(false);
    this.reportAccountsTransactionsFormGroup
      .get('rptPrintWithAlloc')
      .setValue(false);
    this.reportAccountsTransactionsFormGroup
      .get('rptPrintWithAgainstAcc')
      .setValue(false);
    this.reportAccountsTransactionsFormGroup
      .get('rptPrintWithRelatedAccTrans')
      .setValue(false);
    this.reportAccountsTransactionsFormGroup
      .get('rptHideOpeningBalance')
      .setValue(false);
    this.reportAccountsTransactionsFormGroup.get('rptCostCenter').setValue(-1);
    this.reportAccountsTransactionsFormGroup.get('rptJob').setValue(-1);
    this.reportAccountsTransactionsFormGroup.get('rptAccount').setValue(-1);
    this.reportAccountsTransactionsFormGroup.get('rptLocation').setValue(-1);
    this.reportAccountsTransactionsFormGroup.get('rptDescription').setValue('');
    this.reportAccountsTransactionsFormGroup.get('rptNarration').setValue('');
    this.reportAccountsTransactionsFormGroup
      .get('rptDtpAson')
      .setValue(new Date());
    this.reportAccountsTransactionsFormGroup
      .get('rptDtpFrom')
      .setValue(new Date());
    this.reportAccountsTransactionsFormGroup
      .get('rptDtpTo')
      .setValue(new Date());
    // this.reportAccountsTransactionsFormGroup.get('rptTotDebit').setValue(null);
    // this.reportAccountsTransactionsFormGroup.get('rptTotCredit').setValue(null);
    // this.reportAccountsTransactionsFormGroup.get('rptTotRunningBalanceCreditDebit').setValue(null);
    // this.reportAccountsTransactionsFormGroup.get('rptType').setValue(-1);
    this.reportAccountsTransactionsFormGroup.get('rptDetails').setValue(true);

    this.reportAccountsTransactionsFormGroup.get('rptAsOnDate').setValue(true);
    this.reportAccountsTransactionsFormGroup
      .get('rptPrintWithRef')
      .setValue(true);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.reportAccountsTransactionsFormGroup.enable();
    //  this.f.purchaseVoucherNo.clearValidators();
    this.reportAccountsTransactionsFormGroup.updateValueAndValidity();
  }

  cancel() {}

  onColumnVisibilityChange(label: string) {
    // Toggle already happened via ngModel binding, just refresh the table
    this.applyColumnVisibility();
  }

  getHiddenColumnsForDetails(): number[] {
    // Always hidden columns (internal/system columns)
    const alwaysHidden = [
      0, 1, 2, 3, 4, // TransSno, Group No, Group, Acc #, Acc Name
      9, 10,         // Description, Oppos Entry Desc
      11, 12, 13,    // Currency, Fc Rate, Approval Date
      16, 17,        // Total Debit, Total Credit
      31, 32, 33, 34, 35, 36, 37, 38, 39, // FC/Alloc fields
    ];

    // Toggleable columns - hide if checkbox is unchecked
    const toggleHidden = this.toggleableColumns
      .filter(col => !this.columnVisibility[col.label])
      .map(col => col.colIndex);

    return [...alwaysHidden, ...toggleHidden];
  }

  getHiddenColumnsForSummary(): number[] {
    // Summary mode hides more columns
    const alwaysHidden = [
      0, 1, 2,
      5, 6, 7,       // Voucher No, Date, Voucher Type
      9, 10,
      11, 12, 13,
      19,            // Days
      20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      31, 32, 33, 34, 35, 36, 37, 38, 39,
      40,            // View
    ];
    return alwaysHidden;
  }

  applyColumnVisibility() {
    try {
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      if (!hotInstance) return;

      const hiddenCols = this.Details
        ? this.getHiddenColumnsForDetails()
        : this.getHiddenColumnsForSummary();

      hotInstance.updateSettings({
        hiddenColumns: {
          columns: hiddenCols,
          indicators: false,
        },
      });
    } catch (e) {
      // Table not yet initialized, ignore
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
  dateRangeMode: string = null; // 'thisMonth' | 'lastMonth' | 'customRange' | null
  highlightDebitCredit: boolean = false;

  get isDateRangeReadonly(): boolean {
    return this.dateRangeMode !== 'customRange';
  }

  makeAsOnDateTrue() {
    this.AsOnDate = true;
    this.DateRange = false;
    this.dateRangeMode = null;
  }

  makeDateRangeThisMonth() {
    this.DateRange = true;
    this.AsOnDate = false;
    this.dateRangeMode = 'thisMonth';
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.reportAccountsTransactionsFormGroup.get('rptDtpFrom').setValue(firstDay);
    this.reportAccountsTransactionsFormGroup.get('rptDtpTo').setValue(lastDay);
  }

  makeDateRangeLastMonth() {
    this.DateRange = true;
    this.AsOnDate = false;
    this.dateRangeMode = 'lastMonth';
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    this.reportAccountsTransactionsFormGroup.get('rptDtpFrom').setValue(firstDay);
    this.reportAccountsTransactionsFormGroup.get('rptDtpTo').setValue(lastDay);
  }

  makeDateRangeCustom() {
    this.DateRange = true;
    this.AsOnDate = false;
    this.dateRangeMode = 'customRange';
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
        this.reportAccountsTransactionsFormGroup.getRawValue().rptDtpFrom ==
        null
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No From Date',
        });
        return false;
      }
      if (
        this.reportAccountsTransactionsFormGroup.getRawValue().rptDtpTo == null
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No To Date',
        });
        return false;
      }
      if (
        this.reportAccountsTransactionsFormGroup.getRawValue().rptDtpTo <
        this.reportAccountsTransactionsFormGroup.getRawValue().rptDtpFrom
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'To Date Less Than From Date',
        });
        return false;
      }
    }

    if (this.AsOnDate == true) {
      if (
        this.reportAccountsTransactionsFormGroup.getRawValue().rptDtpAson ==
        null
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No As On Date',
        });
        return false;
      }
    }

    return true;
  }

  rptFilter: ReportFilterModel;
  FinacialPeriodArry: FinancialPeriods[];

  getReport1(reportType: string) {
    const {
      rptAccount,
      rptLocation,
      rptCostCenter,
      rptJob,
      rptDtpAson,
      rptDtpFrom,
      rptDtpTo,
    } = this.f;
    const type = reportType;
    const buildRequest = (dateFrom: any, dateTo: any) => ({
      accountNumber: rptAccount.value,
      dateFrom: this.formatDateService.formatDatetime(dateFrom, true),
      dateTo: this.formatDateService.formatDatetime(dateTo, false),
      location: rptLocation.value,
      costcenterId: rptCostCenter.value,
      jobId: rptJob.value,
      voucherTypes: this.selectedVouchers,
    });

    if (this.AsOnDate) {
      this.masterapi.LoadDropdown().subscribe((m) => {
        const periods = m?.resultSet?.financialPeriods || [];

        if (!periods.length) {
          console.error('Financial periods array is empty.');
          return;
        }

        const firstPeriodStart = periods[0].financialPeriodsStartDate;

        const req = buildRequest(firstPeriodStart, rptDtpAson.value);
        this.getReport(req, type);
      });

      return;
    }

    // Case 2: Range Date Selection
    const req = buildRequest(this.GetDate(rptDtpFrom.value), this.GetDate(rptDtpTo.value));
    this.getReport(req, type);
  }
  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }
  getReport(req, type) {
    this.accountapi.AccountTransactionsHistory(req).subscribe((res: any) => {
      this.rptFilter = {
        ReportName: this.Summary
          ? 'AccountStatementSummary'
          : 'AccountStatementDetail',
        SelectionFormula: '',
        SP_Queries: [],
        Parameters: [],
        Queries: [`SELECT * FROM vw_AccountTransactionsHistory`],
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
    });
  }
  Print_API_CALL() {
    const accountStatementParameters_Save: AccountStatementParameters = this
      .reportAccountsTransactionsFormGroup.value as AccountStatementParameters;

    //   accountStatementParameters_Save.rptSummary = this.reportAccountsTransactionsFormGroup.value.rptSummary;
    //  accountStatementParameters_Save.rptDetails = this.reportAccountsTransactionsFormGroup.value.rptDetails;
    //   accountStatementParameters_Save.rptDateRange = this.reportAccountsTransactionsFormGroup.value.rptDateRange;
    //    accountStatementParameters_Save.rptAsOnDate = this.reportAccountsTransactionsFormGroup.value.rptAsOnDate;

    accountStatementParameters_Save.rptSummary = this.Summary;
    accountStatementParameters_Save.rptDetails = this.Details;
    accountStatementParameters_Save.rptDateRange = this.DateRange;
    accountStatementParameters_Save.rptAsOnDate = this.AsOnDate;

    // accountStatementParameters_Save.rptPrintWithRef = this.reportAccountsTransactionsFormGroup.value.rptPrintWithRef;
    // accountStatementParameters_Save.rptPrintWithCheq = this.reportAccountsTransactionsFormGroup.value.rptPrintWithCheq;
    // accountStatementParameters_Save.rptPrintWithAlloc = this.reportAccountsTransactionsFormGroup.value.rptPrintWithAlloc;
    // accountStatementParameters_Save.rptPrintWithAgainstAcc = this.reportAccountsTransactionsFormGroup.value.rptPrintWithAgainstAcc;
    // accountStatementParameters_Save.rptPrintWithRelatedAccTrans = this.reportAccountsTransactionsFormGroup.value.rptPrintWithRelatedAccTrans;

    accountStatementParameters_Save.rptPrintWithRef = this.PrintWithRef;
    accountStatementParameters_Save.rptPrintWithCheq = this.PrintWithCheq;
    accountStatementParameters_Save.rptPrintWithAlloc = this.PrintWithAlloc;
    accountStatementParameters_Save.rptPrintWithAgainstAcc =
      this.PrintWithAgainstAcc;
    accountStatementParameters_Save.rptPrintWithRelatedAccTrans =
      this.PrintWithRelatedAccTrans;

    // accountStatementParameters_Save.rptHideOpeningBalance = this.reportAccountsTransactionsFormGroup.value.rptHideOpeningBalance;

    accountStatementParameters_Save.rptHideOpeningBalance =
      this.reportAccountsTransactionsFormGroup.value.rptHideOpeningBalance;
    //this.HideOpeningBalance;

    accountStatementParameters_Save.rptCostCenter =
      this.reportAccountsTransactionsFormGroup.value.rptCostCenter;
    accountStatementParameters_Save.rptJob =
      this.reportAccountsTransactionsFormGroup.value.rptJob;
    accountStatementParameters_Save.rptAccount =
      this.reportAccountsTransactionsFormGroup.value.rptAccount;
    accountStatementParameters_Save.rptLocation =
      this.reportAccountsTransactionsFormGroup.value.rptLocation;
    accountStatementParameters_Save.rptDescription =
      this.reportAccountsTransactionsFormGroup.value.rptDescription;
    accountStatementParameters_Save.rptNarration =
      this.reportAccountsTransactionsFormGroup.value.rptNarration;
    accountStatementParameters_Save.rptDtpAson =
      this.formatDateService.formatDatetime(
        this.reportAccountsTransactionsFormGroup.value.rptDtpAson,
        true
      );

    accountStatementParameters_Save.rptDtpFrom =
      this.formatDateService.formatDatetime(
        this.reportAccountsTransactionsFormGroup.value.rptDtpFrom,
        true
      );
    accountStatementParameters_Save.rptDtpTo =
      this.formatDateService.formatDatetime(
        this.reportAccountsTransactionsFormGroup.value.rptDtpTo,
        false
      );
    accountStatementParameters_Save.rptTotDebit =
      this.reportAccountsTransactionsFormGroup.value.rptTotDebit;
    accountStatementParameters_Save.rptTotCredit =
      this.reportAccountsTransactionsFormGroup.value.rptTotCredit;
    accountStatementParameters_Save.rptTotRunningBalanceCreditDebit =
      this.reportAccountsTransactionsFormGroup.value.rptTotRunningBalanceCreditDebit;

    accountStatementParameters_Save.viewAccountsTransactionsVoucherType = [];

    this.messageService.add({
      severity: 'error',
      summary: 'Alert',
      detail: 'Print API CALL',
    });
  }

  Print_REPORT() {
    if (this.reportAccountsTransactionsFormGroup.valid) {
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
      this.reportAccountsTransactionsFormGroup.markAllAsTouched();
      this.reportAccountsTransactionsFormGroup.markAsDirty();
    }
  }
  getcostcenterList(id) {
    return this.costcenterList?.find((res) => res.value == id)?.label;
  }

  List_REPORT() {
    if (this.reportAccountsTransactionsFormGroup.valid) {
      if (this.validateDate()) {
        // const savedData: Array<GridData> = this.purchaseorder_entry.data?.filter( k => k.hasOwnProperty('itemname'));
        const accountStatementParameters_Save: AccountStatementParameters = this
          .reportAccountsTransactionsFormGroup
          .value as AccountStatementParameters;
        accountStatementParameters_Save.rptSummary = this.Summary;
        accountStatementParameters_Save.rptDetails = this.Details;
        accountStatementParameters_Save.rptDateRange = this.DateRange;
        accountStatementParameters_Save.rptAsOnDate = this.AsOnDate;
        accountStatementParameters_Save.rptPrintWithRef = this.PrintWithRef;
        accountStatementParameters_Save.rptPrintWithCheq = this.PrintWithCheq;
        accountStatementParameters_Save.rptPrintWithAlloc = this.PrintWithAlloc;
        accountStatementParameters_Save.rptPrintWithAgainstAcc =
          this.PrintWithAgainstAcc;
        accountStatementParameters_Save.rptPrintWithRelatedAccTrans =
          this.PrintWithRelatedAccTrans;
        accountStatementParameters_Save.rptHideOpeningBalance =
          this.reportAccountsTransactionsFormGroup.value.rptHideOpeningBalance;
        //this.HideOpeningBalance;

        accountStatementParameters_Save.rptCostCenter =
          this.reportAccountsTransactionsFormGroup.value.rptCostCenter;
        accountStatementParameters_Save.rptJob =
          this.reportAccountsTransactionsFormGroup.value.rptJob;
        accountStatementParameters_Save.rptAccount =
          this.reportAccountsTransactionsFormGroup.value.rptAccount;
        accountStatementParameters_Save.rptLocation =
          this.reportAccountsTransactionsFormGroup.value.rptLocation;
        accountStatementParameters_Save.rptDescription =
          this.reportAccountsTransactionsFormGroup.value.rptDescription;
        accountStatementParameters_Save.rptNarration =
          this.reportAccountsTransactionsFormGroup.value.rptNarration;
        (accountStatementParameters_Save.rptDtpAson =
          this.reportAccountsTransactionsFormGroup.value.rptDtpAson),
          (accountStatementParameters_Save.rptDtpFrom =
            this.formatDateService.formatDatetime(
              this.reportAccountsTransactionsFormGroup.value.rptDtpFrom,
              true
            ));
        accountStatementParameters_Save.rptDtpTo =
          this.formatDateService.formatDatetime(
            this.reportAccountsTransactionsFormGroup.value.rptDtpTo,
            false
          );
        accountStatementParameters_Save.rptTotDebit = null;
        accountStatementParameters_Save.rptTotCredit = null;
        accountStatementParameters_Save.rptTotRunningBalanceCreditDebit = null;

        accountStatementParameters_Save.viewAccountsTransactionsVoucherType =
          [];
        accountStatementParameters_Save.viewAccountsTransactionsVoucherType =
          this.selectedVouchers;

        this.accountapi
          .MainReport_GetReportAccountsTransactions_PARAM_CLASS(
            accountStatementParameters_Save
          )
          .subscribe(
            (data) => {
              let runningBalance = 0;

              this.reportAccountsTransactionsarry = data.result;
              this.Data_result = data.result;
              this.filteredData = this.Data_result?.filter(
                (res) =>
                  res.accountsTransactionsDebit != 0 ||
                  res.accountsTransactionsCredit != 0
                // && res.accountsTransactionsVoucherType != 'OPENING BALANCE')
              ).map((res: any) => {
                runningBalance +=
                  res.accountsTransactionsDebit -
                  res.accountsTransactionsCredit;

                return {
                  ...res,
                  RunningBalance: runningBalance,
                };
              });
              this.updateHot_Report(this.filteredData);
            },
            (err) => {
              // Handle error
            }
          );

        // this.ColumnSum();
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.reportAccountsTransactionsFormGroup.markAllAsTouched();
      this.reportAccountsTransactionsFormGroup.markAsDirty();
    }
  }

  dateRendererr(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.innerText = value ? new Date(value).toLocaleDateString('en-GB') : '';
  }

  buttonRendererr(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.innerHTML = '<button>View</button>';
  }

  applyGlobalFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredData = this.Data_result?.filter((row) => {
      return Object.values(row).some((cell) =>
        cell?.toString().toLowerCase().includes(filterValue)
      );
    });
    this.updateHot_Report(this.filteredData);
  }
  RunningBal: number;

  CalcRunningBal(DiffAmt: number) {
    this.RunningBal = this.RunningBal + DiffAmt;
    return parseFloat(this.RunningBal.toFixed(2));
  }

  updateHot_Report(
    reportAccountsTransactions_update: ReportAccountsTransactions[]
  ) {
    this.RunningBal = 0;
    // this.updateHot_Report(data.result);

    const gridData: GridData[] = reportAccountsTransactions_update.map((k) => {
      return {
        accountsTransactionsTransSno: k.accountsTransactionsTransSno,
        accGroupNo: k.accGroupNo,
        accGroup: k.accGroup,
        accountsTransactionsAccNo:
          k.accountsTransactionsAccNo == null
            ? this.reportAccountsTransactionsFormGroup.value.rptAccount
            : k.accountsTransactionsAccNo,
        accName:
          k.accName == null
            ? this.accountArray?.find(
                (j) =>
                  j.maAccNo.trim() ===
                  this.reportAccountsTransactionsFormGroup.value.rptAccount.trim()
              ).maAccName
            : k.accName,

        accountsTransactionsTransDate: k.accountsTransactionsTransDate,
        accountsTransactionsVoucherType: k.accountsTransactionsVoucherType,
        accountsTransactionsVoucherNo: k.accountsTransactionsVoucherNo,

        accountsTransactionsDebit: k.accountsTransactionsDebit,
        accountsTransactionsCredit: k.accountsTransactionsCredit,

        accountsTransactionsTotalDebit:
          k.accountsTransactionsDebit - k.accountsTransactionsCredit < 0
            ? 0
            : k.accountsTransactionsDebit - k.accountsTransactionsCredit,
        accountsTransactionsTotalCredit:
          k.accountsTransactionsDebit - k.accountsTransactionsCredit < 0
            ? (k.accountsTransactionsDebit - k.accountsTransactionsCredit) * -1
            : 0,

        accountsTransactionsFcDebit: k.accountsTransactionsFcDebit,
        accountsTransactionsFcCredit: k.accountsTransactionsFcCredit,
        accountsTransactionsRunningBalance: this.CalcRunningBal(
          k.accountsTransactionsDebit - k.accountsTransactionsCredit
        ),

        accountsTransactionsAllocDebit: k.accountsTransactionsAllocDebit,
        accountsTransactionsAllocCredit: k.accountsTransactionsAllocCredit,
        accountsTransactionsAllocBalance: k.accountsTransactionsAllocBalance,
        accountsTransactionsFcAllocDebit: k.accountsTransactionsFcAllocDebit,
        accountsTransactionsFcAllocCredit: k.accountsTransactionsFcAllocCredit,
        accountsTransactionsFcAllocBalance:
          k.accountsTransactionsFcAllocBalance,

        accountsTransactionsParticulars: k.accountsTransactionsParticulars,
        accountsTransactionsDescription: k.accountsTransactionsDescription,
        accountsTransactionsOpposEntryDesc:
          k.accountsTransactionsOpposEntryDesc,

        accountsTransactionsVatno: k.accountsTransactionsVatno,
        accountsTransactionsVatableAmount: k.accountsTransactionsVatableAmount,
        accountsTransactionsCheqNo: k.accountsTransactionsCheqNo,
        accountsTransactionsCheqDate: k.accountsTransactionsCheqDate,
        departmentMasterDepartmentName: k.departmentMasterDepartmentName,
        locationMasterLocationName: k.locationMasterLocationName,
        jobMasterJobName: k.jobMasterJobName,
        costCenterMasterCostCenterName: k.costCenterMasterCostCenterName,
        currencyMasterCurrencyName: k.currencyMasterCurrencyName,
        accountsTransactionsFcRate: k.accountsTransactionsFcRate,
        refNo: k.refNo,
        accountsTransactionsLpoNo: k.accountsTransactionsLpoNo,
        //  accountsTransactionsApprovalDt: k.accountsTransactionsApprovalDt,

        accountsTransactionsStatus: k.accountsTransactionsStatus,
        accountsTransactionsTstamp: k.accountsTransactionsTstamp,

        accountsTransactionsDrGram: k.accountsTransactionsDrGram,
        accountsTransactionsCrGram: k.accountsTransactionsCrGram,

        accountsTransactionsFsno: k.accountsTransactionsFsno,
        accountsTransactionsUserId: k.accountsTransactionsCompanyId,
        accountsTransactionsCompanyId: k.accountsTransactionsCompanyId,
        accountsTransactionsCurrencyId: k.accountsTransactionsCurrencyId,
        accountsTransactionsLocation: k.accountsTransactionsLocation,
        accountsTransactionsJobNo: k.accountsTransactionsJobNo,
        accountsTransactionsCostCenterId: k.accountsTransactionsCostCenterId,
        accountsTransactionsDepartment: k.accountsTransactionsDepartment,
        accountsTransactionsDeptId: k.accountsTransactionsDeptId,
        accountstransactionsDelStatus: k.accountstransactionsDelStatus,

        daysDiff: k.daysDiff,
      };
    });

    this.reportaccountstransactions_entry.data = gridData;
    this.hotRegisterer
      ?.getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.reportAccountsTransactionsFormGroup.disable();
    // this.f.purchaseVoucherNo.clearValidators();
    this.reportAccountsTransactionsFormGroup.updateValueAndValidity();

    this.edit();
    this.ColumnSum();

    if (this.Details) {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: this.getHiddenColumnsForDetails(),
          indicators: false,
        },
      });
    } else {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: this.getHiddenColumnsForSummary(),
          indicators: false,
        },
      });
    }
  }

  // Voucher type alias map: normalized key -> { route, menu }
  private static readonly VOUCHER_ROUTE_MAP: {
    [key: string]: { route: string; menu: number };
  } = {
    'payment': { route: '/account/paymentvoucher', menu: 60 },
    'payment voucher': { route: '/account/paymentvoucher', menu: 60 },
    'receipt': { route: '/account/receiptvoucher', menu: 61 },
    'receipt voucher': { route: '/account/receiptvoucher', menu: 61 },
    'journal': { route: '/account/journalvoucher', menu: 62 },
    'journalvoucher': { route: '/account/journalvoucher', menu: 62 },
    'jv': { route: '/account/journalvoucher', menu: 62 },
    'bank payment': { route: '/account/bankpaymentvoucher', menu: 68 },
    'bank payment voucher': { route: '/account/bankpaymentvoucher', menu: 68 },
    'bank receipt': { route: '/account/bankreceiptvouche', menu: 67 },
    'bank receipt voucher': { route: '/account/bankreceiptvouche', menu: 67 },
    'purchase': { route: '/procurement/purchasevoucher', menu: 175 },
    'purchasevoucher': { route: '/procurement/purchasevoucher', menu: 175 },
    'sales': { route: '/sale/salesvoucher', menu: 9 },
    'salesvoucher': { route: '/sale/salesvoucher', menu: 9 },
    'contra': { route: '/account/contravoucher', menu: 63 },
    'contravoucher': { route: '/account/contravoucher', menu: 63 },
    'credit note': { route: '/account/creditnote', menu: 86 },
    'creditnote': { route: '/account/creditnote', menu: 86 },
    'debit note': { route: '/account/debitnote', menu: 85 },
    'debitnote': { route: '/account/debitnote', menu: 85 },
    'depjv': { route: '/account/depreciation-journal-voucher', menu: 69 },
    'opening balance': { route: '/account/openingbalancevoucher', menu: 0 },
    'opb': { route: '/account/openingbalancevoucher', menu: 0 },
  };

  viewAction(type: string, vno: string) {
    const normalizedType = (type || '').trim().toLowerCase();
    const mapping =
      AccountstransactionsreportComponent.VOUCHER_ROUTE_MAP[normalizedType];

    if (!mapping) {
      console.warn(
        `[AccountTransactionsReport] Unknown voucher type: "${type}". Navigation skipped.`
      );
      this.messageService.add({
        severity: 'warn',
        summary: 'Navigation',
        detail: `No route configured for voucher type: "${type}"`,
      });
      return;
    }

    const req = {
      voucherNo: vno,
      type: type,
    };

    this.accountapi.GetAccountIdByVoucherNo(req).subscribe((res: any) => {
      const id = res.id;
      this.router.navigate([mapping.route], {
        queryParams: {
          menu: mapping.menu,
          vNo: id,
        },
      });
    });
  }

  getTotalCredit() {
    let totalCr = this.filteredData?.reduce((sum, res) => {
      return sum + (res.accountsTransactionsCredit || 0);
    }, 0);
    return totalCr?.toFixed(2);
  }

  getTotalDedit() {
    let totalDr = this.filteredData?.reduce((sum, res) => {
      return sum + (res.accountsTransactionsDebit || 0);
    }, 0);
    return totalDr?.toFixed(2);
  }

  getTotal() {
    let totalDr = this.filteredData?.reduce((sum, res) => {
      return sum + (res.RunningBalance || 0);
    }, 0);
    return totalDr?.toFixed(2);
  }
  getblance(CREDIT, DEBIT) {
    const balance = DEBIT - CREDIT;
    return balance;
  }

  dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      td.innerText = formattedDate ? formattedDate : '';
    } else {
      td.innerText = '';
    }
  }

  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';

    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.accountsTransactionsVoucherNo != null) {
      const button = document.createElement('a');
      button.className = 'iconbton';
      button.innerHTML = '<i class="pi pi-eye" style="font-size: 26px;"></i>';
      button.addEventListener('click', () => {
        this.viewAction(
          rowData.accountsTransactionsVoucherType,
          rowData.accountsTransactionsVoucherNo
        ); // Pass type and id to viewAction
      });

      td.appendChild(button);
    }
    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }

  GetAccountName(data: any): string | undefined {
    const account = this.accountList?.find((res) => res.value === data);
    return account ? account.label : undefined;
  }

  onHighlightToggle() {
    try {
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      if (hotInstance) {
        hotInstance.render();
      }
    } catch (e) {
      // Table not yet initialized
    }
  }
}

interface GridData {
  daysDiff?: number;
  accountsTransactionsAgainst?: string;
  accountsTransactionsRunningBalance?: number;

  accountsTransactionsTransSno?: number;
  accGroupNo?: string;
  accGroup?: string;
  accountsTransactionsAccNo?: string;
  accName?: string;

  accountsTransactionsTransDate?: Date;
  accountsTransactionsVoucherType?: string;
  accountsTransactionsVoucherNo?: string;

  accountsTransactionsDebit?: number;
  accountsTransactionsCredit?: number;

  accountsTransactionsTotalDebit?: number;
  accountsTransactionsTotalCredit?: number;

  accountsTransactionsFcDebit?: number;
  accountsTransactionsFcCredit?: number;

  accountsTransactionsAllocDebit?: number;
  accountsTransactionsAllocCredit?: number;
  accountsTransactionsAllocBalance?: number;
  accountsTransactionsFcAllocDebit?: number;
  accountsTransactionsFcAllocCredit?: number;
  accountsTransactionsFcAllocBalance?: number;

  accountsTransactionsParticulars?: string;
  accountsTransactionsDescription?: string;
  accountsTransactionsOpposEntryDesc?: string;

  accountsTransactionsVatno?: string;
  accountsTransactionsVatableAmount?: number;
  accountsTransactionsCheqNo?: string;
  accountsTransactionsCheqDate?: Date;
  departmentMasterDepartmentName?: string;
  locationMasterLocationName?: string;
  jobMasterJobName?: string;
  costCenterMasterCostCenterName?: string;
  currencyMasterCurrencyName?: string;
  accountsTransactionsFcRate?: number;
  refNo?: string;
  accountsTransactionsLpoNo?: string;
  accountsTransactionsApprovalDt?: Date;
  accountsTransactionsStatus?: string;
  accountsTransactionsTstamp?: Date;

  accountsTransactionsDrGram?: number;
  accountsTransactionsCrGram?: number;

  accountsTransactionsFsno?: number;
  accountsTransactionsUserId?: number;
  accountsTransactionsCompanyId?: number;
  accountsTransactionsCurrencyId?: number;
  accountsTransactionsLocation?: number;
  accountsTransactionsJobNo?: number;
  accountsTransactionsCostCenterId?: number;
  accountsTransactionsDepartment?: number;
  accountsTransactionsDeptId?: number;
  accountstransactionsDelStatus?: boolean;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const accountTransactionsColumnList = (component: any) => [
  {
    data: 'accountsTransactionsTransSno',
    type: 'numeric',
    label: 'TransSno',
    toolTip: 'Transaction Serial Number',
  },
  {
    data: 'accGroupNo',
    type: 'text',
    label: 'Group No',
    toolTip: 'Account Group Number',
  },
  {
    data: 'accGroup',
    type: 'text',
    label: 'Group',
    toolTip: 'Account Group',
  },
  {
    data: 'accountsTransactionsAccNo',
    type: 'text',
    label: 'Acc #',
    toolTip: 'Account Number',
  },
  {
    data: 'accName',
    type: 'text',
    label: 'Acc Name',
    toolTip: 'Account Name',
  },
  {
    data: 'accountsTransactionsVoucherNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Voucher Number',
  },
  {
    data: 'accountsTransactionsTransDate',
    type: 'text',
    label: 'Date',
    toolTip: 'Transaction Date',
    renderer: component.dateRenderer.bind(component),
  },
  {
    data: 'accountsTransactionsVoucherType',
    type: 'text',
    label: 'Voucher Type',
    toolTip: 'Voucher Type',
  },
  {
    data: 'accountsTransactionsParticulars',
    type: 'text',
    label: 'Particulars',
    toolTip: 'Transaction Particulars',
  },
  {
    data: 'accountsTransactionsDescription',
    type: 'text',
    label: 'Description',
    toolTip: 'Transaction Description',
  },
  {
    data: 'accountsTransactionsOpposEntryDesc',
    type: 'text',
    label: 'Oppos Entry Desc',
    toolTip: 'Opposite Entry Description',
  },
  {
    data: 'currencyMasterCurrencyName',
    type: 'text',
    label: 'Currency',
    toolTip: 'Currency Name',
  },
  {
    data: 'accountsTransactionsFcRate',
    type: 'numeric',
    label: 'Fc Rate',
    toolTip: 'Foreign Currency Rate',
  },
  {
    data: 'accountsTransactionsApprovalDt',
    type: 'date',
    label: 'Approval Date',
    toolTip: 'Approval Date',
  },
  {
    data: 'accountsTransactionsDebit',
    type: 'numeric',
    label: 'Debit',
    toolTip: 'Debit Amount',
  },
  {
    data: 'accountsTransactionsCredit',
    type: 'numeric',
    label: 'Credit',
    toolTip: 'Credit Amount',
  },
  {
    data: 'accountsTransactionsTotalDebit',
    type: 'numeric',
    label: 'Total Debit',
    toolTip: 'Total Debit',
  },
  {
    data: 'accountsTransactionsTotalCredit',
    type: 'numeric',
    label: 'Total Credit',
    toolTip: 'Total Credit',
  },
  {
    data: 'accountsTransactionsRunningBalance',
    type: 'numeric',
    label: 'Running Bal.',
    toolTip: 'Running Balance',
  },
  {
    data: 'daysDiff',
    type: 'numeric',
    label: 'Days',
    toolTip: 'Days Difference',
  },
  {
    data: 'refNo',
    type: 'text',
    label: 'Ref #',
    toolTip: 'Reference Number',
  },
  {
    data: 'costCenterMasterCostCenterName',
    type: 'text',
    label: 'Cost Center',
    toolTip: 'Cost Center Name',
  },
  {
    data: 'accountsTransactionsAgainst',
    type: 'text',
    label: 'Against',
    toolTip: 'Against',
  },
  {
    data: 'accountsTransactionsVatno',
    type: 'text',
    label: 'VAT #',
    toolTip: 'VAT Number',
  },
  {
    data: 'accountsTransactionsVatableAmount',
    type: 'numeric',
    label: 'VAT Amt',
    toolTip: 'VAT Amount',
  },
  {
    data: 'accountsTransactionsCheqNo',
    type: 'text',
    label: 'Cheq #',
    toolTip: 'Cheque Number',
  },
  {
    data: 'accountsTransactionsCheqDate',
    type: 'date',
    label: 'Cheq Date',
    toolTip: 'Cheque Date',
  },
  {
    data: 'accountsTransactionsLpoNo',
    type: 'text',
    label: 'LPO #',
    toolTip: 'LPO Number',
  },
  {
    data: 'jobMasterJobName',
    type: 'text',
    label: 'Job',
    toolTip: 'Job Name',
  },
  {
    data: 'departmentMasterDepartmentName',
    type: 'text',
    label: 'Department',
    toolTip: 'Department Name',
  },
  {
    data: 'locationMasterLocationName',
    type: 'text',
    label: 'Location',
    toolTip: 'Location Name',
  },
  {
    data: 'accountsTransactionsFcDebit',
    type: 'numeric',
    label: 'Fc Debit',
    toolTip: 'Foreign Currency Debit',
  },
  {
    data: 'accountsTransactionsFcCredit',
    type: 'numeric',
    label: 'Fc Credit',
    toolTip: 'Foreign Currency Credit',
  },
  {
    data: 'accountsTransactionsAllocDebit',
    type: 'numeric',
    label: 'Alloc Debit',
    toolTip: 'Allocated Debit',
  },
  {
    data: 'accountsTransactionsAllocCredit',
    type: 'numeric',
    label: 'Alloc Credit',
    toolTip: 'Allocated Credit',
  },
  {
    data: 'accountsTransactionsAllocBalance',
    type: 'numeric',
    label: 'Alloc Balance',
    toolTip: 'Allocated Balance',
  },
  {
    data: 'accountsTransactionsFcAllocDebit',
    type: 'numeric',
    label: 'Fc Alloc Debit',
    toolTip: 'Foreign Currency Allocated Debit',
  },
  {
    data: 'accountsTransactionsFcAllocCredit',
    type: 'numeric',
    label: 'Fc Alloc Credit',
    toolTip: 'Foreign Currency Allocated Credit',
  },
  {
    data: 'accountsTransactionsFcAllocBalance',
    type: 'numeric',
    label: 'Fc Alloc Balance',
    toolTip: 'Foreign Currency Allocated Balance',
  },
  {
    data: 'accountsTransactionsTstamp',
    type: 'date',
    label: 'TimeStamp',
    toolTip: 'Transaction Timestamp',
  },
  {
    data: null,
    renderer: component.buttonRenderer.bind(component),
    label: 'View',
    toolTip: 'View',
  },
];
