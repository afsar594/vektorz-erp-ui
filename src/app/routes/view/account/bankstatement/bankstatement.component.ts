import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MessageService, SelectItem } from 'primeng';
import { ChartofAccounts } from 'src/app/routes/domain';
import { AccountStatementParameters } from 'src/app/routes/domain/Accounts/AccountStatementParameters';
import { ReportAccountsTransactions } from 'src/app/routes/domain/Accounts/ReportAccountsTransactions';
import { FinancialPeriods } from 'src/app/routes/domain/FinancialPeriods';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { ExportdocumentService } from 'src/app/routes/service/ExportDocument/exportdocument.service';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { defaults } from 'src/app/shared/service/settings';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';

@Component({
  selector: 'app-bankstatement',
  templateUrl: './bankstatement.component.html',
  styleUrls: ['./bankstatement.component.scss'],
})
export class BankstatementComponent implements OnInit {
  title: string;
  subtitle: string;
  Date: Date;
  index: number = 0;
  dateType: any;
  reportType: string = 'Detailed';
  SummaryDataArray: any[] = [];
  ScreenId: number;
  Permission: any;
  getbankMasterAccount: any;
  totalCredit: number;
  TotRunningBalanceCreditDebit: string;
  totalDebit: number;
  Details: boolean = true;
  Summary: boolean = false;

  AsOnDate: boolean = true;
  DateRange: boolean = false;
  reportAccountsTransactionsarry: any[];
  Data_result: any[];
  filteredData: any[];
  RunningBal: number;
  dataset: any;
  licensekey: string;
  pdfSource: string | URL;

  handleChange(e) {
    this.index = e.index;
  }

  private hotRegisterer = new HotTableRegisterer();
  hotid = 'reportaccountstransactions_HotEntry';
  reportaccountstransactions_entry: Handsontable.GridSettings;
  reportAccountsTransactionsFormGroup: FormGroup;
  reportaccountstransactions_entryDataset = [];

  accountArraydropdown: ChartofAccounts[] = [];
  acctArrydropdown: string[] = [];
  accountListdropdown: SelectItem[];

  dataArray: any[] = [];
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    public accountService: AccountApiService,
    private crystalReportService: CrystalReportService,
    private exportDocument: ExportdocumentService,
    private permission: PermissionsService,
    private masterapi: MasterApiService,
    private utilityService: UtilityService,
    private messageService: MessageService,

    private formatDateService: ReportDateFormatService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

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
    this.getbankACValue();
    this.initializeControls();
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
    });
  }

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];
  LoadChartOfAccountDDL() {
    this.accountService.LoadDropdowchartofAccounts().subscribe((m) => {
      this.accountArray = m.resultSet.masterAccountsTables;
      this.accountList = m.resultSet.masterAccountsTables?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
      const acc = m.resultSet.masterAccountsTables?.filter(
        (item) => item.maRelativeNo === this.getbankMasterAccount
      );

      this.accountArraydropdown = acc;
      this.accountListdropdown = acc?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountListdropdown.unshift({ label: '--Select--', value: -1 });
    });
  }
  getbankACValue() {
    this.masterapi.GetAllAccountsbyKey('BANK_MASTER_AC_NO').subscribe((res) => {
      const value = res.result[0].accountSettingsAccountTextValue.split('::');

      this.getbankMasterAccount = value[1]?.trim();
      this.LoadChartOfAccountDDL();
    });
  }

  get f() {
    return this.reportAccountsTransactionsFormGroup.controls;
  }

  getTotalDebit() {
    return this.filteredData
      ?.filter((o) => o.accountsTransactionsDebit != null)
      .reduce((sum, current) => sum + current.accountsTransactionsDebit, 0);
  }

  getTotalCredit() {
    return this.filteredData
      ?.filter((o) => o.accountsTransactionsCredit != null)
      .reduce((sum, current) => sum + current.accountsTransactionsCredit, 0);
  }

  rptFilter: ReportFilterModel;
  FinacialPeriodArry: FinancialPeriods[];

  getReport1() {
    if (this.AsOnDate == true) {
      this.masterapi.LoadDropdown().subscribe((m) => {
        this.FinacialPeriodArry = m.resultSet.financialPeriods;

        if (this.FinacialPeriodArry.length > 0) {
          var req = {
            accountNumber: this.f.rptAccount.value,
            dateFrom: this.formatDateService.formatDatetime(
              this.FinacialPeriodArry[0]?.financialPeriodsStartDate,
              true
            ),
            dateTo: this.formatDateService.formatDatetime(
              this.f.rptDtpAson.value,
              false
            ),
          };

          this.getReport(req);
        } else {
          console.error('Financial periods array is empty.');
        }
      });
    } else {
      var req = {
        accountNumber: this.f.rptAccount.value,
        dateFrom: this.formatDateService.formatDatetime(
          this.f.rptDtpFrom.value,
          true
        ),
        dateTo: this.formatDateService.formatDatetime(
          this.f.rptDtpTo.value,
          false
        ),
      };

      // Call the function to get the report or handle the req object as needed
      this.getReport(req);
    }
  }

  getReport(req) {
    this.accountService
      .AccountTransactionsHistory(req)
      .subscribe((res: any) => {
        this.rptFilter = {
          ReportName: this.Summary
            ? 'BankStatementSummary'
            : 'BankStatementDetail',
          SelectionFormula: '',
          SP_Queries: [],
          Parameters: [],
          Queries: [`SELECT * FROM vw_AccountTransactionsHistory`],
        };

        this.crystalReportService
          .getReportPrint(this.rptFilter, true)
          .subscribe((response) => {
            const blob = new Blob([response], { type: 'application/pdf' });
            this.pdfSource = URL.createObjectURL(blob);
            window.open(this.pdfSource);
          });
      });
  }
  makeDateRangeTrue() {
    this.DateRange = true;
    this.AsOnDate = false;
  }
  onSearchDesc(value: string) {
    this.accountService.AccountsTransactionsArray =
      this.accountService.AccountsTransactionsDuplicateArray?.filter((o) =>
        o.accountsTransactionsDescription == null
          ? true
          : o.accountsTransactionsDescription
              .toLowerCase()
              .includes(value.toLowerCase())
      );
  }

  makeDetailsTrue() {
    this.Details = true;
    this.Summary = false;
  }

  makeSummaryTrue() {
    this.Summary = true;
    this.Details = false;
  }

  initializeControls() {
    const hiddenColumns = [
      0, 1, 2, 3, 4, 9, 10, 11, 12, 13, 16, 17, 31, 32, 33, 34, 35, 36, 37, 38,
      39,
    ];
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
  new() {
    this.reportAccountsTransactionsFormGroup.reset();
    this.reportaccountstransactions_entry.data = [];
    this.reportaccountstransactions_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.reportaccountstransactions_entry);

    this.reportAccountsTransactionsFormGroup.get('rptSummary').setValue(false);
    this.reportAccountsTransactionsFormGroup.get('rptDetails').setValue(true);
    this.reportAccountsTransactionsFormGroup
      .get('rptDateRange')
      .setValue(false);
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

    this.index = 0;
    this.reportAccountsTransactionsFormGroup.enable();
    //  this.f.purchaseVoucherNo.clearValidators();
    this.reportAccountsTransactionsFormGroup.updateValueAndValidity();
  }
  List_REPORT() {
    if (this.reportAccountsTransactionsFormGroup.valid) {
      if (this.validateDate()) {
        // const savedData: Array<GridData> = this.purchaseorder_entry.data?.filter( k => k.hasOwnProperty('itemname'));
        const accountStatementParameters_Save: any = this
          .reportAccountsTransactionsFormGroup
          .value as AccountStatementParameters;
        accountStatementParameters_Save.rptSummary = this.Summary;
        accountStatementParameters_Save.rptDetails = this.Details;
        accountStatementParameters_Save.rptDateRange = this.DateRange;
        accountStatementParameters_Save.rptAsOnDate = this.AsOnDate;
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
        accountStatementParameters_Save.viewAccountsTransactionsVoucherType = [
          'BANK PAYMENT',
          'BANK RECEIPT',
          'PDCVoucher'
        ];

        this.accountService
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
                  res.accountsTransactionsDebit > 0 ||
                  (res.accountsTransactionsCredit > 0 &&
                    res.accountsTransactionsVoucherType != 'OPENING BALANCE')
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
  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    // this.f.purchaseVoucherNo.clearValidators();
    this.reportAccountsTransactionsFormGroup.enable();
    // this.reportAccountsTransactionsFormGroup.controls.purchaseVoucherNo.disable();
    this.reportAccountsTransactionsFormGroup.updateValueAndValidity();
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
        accountsTransactionsJobNo: k.accountsTransactionsJobNo??null,
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
          columns: [
            0,
            1,
            2,
            3, //  this.translate.instant('Acc #'),
            4, //  this.translate.instant( 'Acc Name'),

            //  5, // this.translate.instant('VoucherNo'),
            //  6,  // this.translate.instant('Date'),
            //  7, // this.translate.instant( 'VoucherType'),

            //     this.translate.instant('Particulars'),
            9,
            10,

            11,
            12,
            13,

            // this.translate.instant('Debit'),
            //     this.translate.instant('Credit'),

            16, // this.translate.instant('Total Debit'),
            17, // this.translate.instant('Total Credit'),

            //     this.translate.instant('Running Bal.'),
            // 19,//     this.translate.instant('Days'),

            //   20,//     this.translate.instant('Against'),
            //   21,//     this.translate.instant( 'VAT #'),
            //   22,//     this.translate.instant( 'VAT Amt'),
            //   23,//     this.translate.instant('Cheq #'),
            //   24,//     this.translate.instant('Cheq Date'),
            //   25,//     this.translate.instant('Ref #'),
            //   26, //     this.translate.instant('LPO #'),

            27, // this.translate.instant('CostCenter'),
            28, //      this.translate.instant( 'Job'),
            //   29,    //      this.translate.instant('Department'),
            30, //      this.translate.instant( 'Location'),

            31,
            32,
            33,
            34,
            35,
            36,
            37,
            38,
            39,
          ],
          indicators: false,
        },
      });
    } else {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [
            0,
            1,
            2,
            //     3,//  this.translate.instant('Acc #'),
            // 4,//  this.translate.instant( 'Acc Name'),

            5, // this.translate.instant('VoucherNo'),
            6, // this.translate.instant('Date'),
            7, // this.translate.instant( 'VoucherType'),

            //     this.translate.instant('Particulars'),
            9,
            10,

            11,
            12,
            13,

            // this.translate.instant('Debit'),
            //     this.translate.instant('Credit'),

            16, // this.translate.instant('Total Debit'),
            17, // this.translate.instant('Total Credit'),

            //     this.translate.instant('Running Bal.'),
            19, //     this.translate.instant('Days'),

            20, //     this.translate.instant('Against'),
            21, //     this.translate.instant( 'VAT #'),
            22, //     this.translate.instant( 'VAT Amt'),
            23, //     this.translate.instant('Cheq #'),
            24, //     this.translate.instant('Cheq Date'),
            25, //     this.translate.instant('Ref #'),
            26, //     this.translate.instant('LPO #'),

            27, // this.translate.instant('CostCenter'),
            28, //      this.translate.instant( 'Job'),
            29, //      this.translate.instant('Department'),
            30, //      this.translate.instant( 'Location'),

            31,
            32,
            33,
            34,
            35,
            36,
            37,
            38,
            39,
          ],
          indicators: false,
        },
      });
    }
  }
  dateRendererr(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.innerText = value ? new Date(value).toLocaleDateString('en-GB') : '';
  }

  makeAsOnDateTrue() {
    this.AsOnDate = true;
    this.DateRange = false;
  }

  CalcRunningBal(DiffAmt: number) {
    this.RunningBal = this.RunningBal + DiffAmt;
    return parseFloat(this.RunningBal.toFixed(2));
  }

  Print() {
    this.exportDocument.PrintPDF('print', '');
  }

  calculateDays(transDate) {
    let currentDate = new Date();
    transDate = new Date(transDate);
    return Math.floor(
      (Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ) -
        Date.UTC(
          transDate.getFullYear(),
          transDate.getMonth(),
          transDate.getDate()
        )) /
        (1000 * 60 * 60 * 24)
    );
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

  Export2Excel() {
    this.exportDocument.ExportToDocument('print', 'Bank Statement', '.xlsx');
  }
}
export const accountTransactionsColumnList = (
  component: BankstatementComponent
) => [
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
    // renderer: component.dateRenderer.bind(component),
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
];
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
