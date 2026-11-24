import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MessageService, SelectItem } from 'primeng';
import { FinancialPeriods } from 'src/app/routes/domain/FinancialPeriods';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-customerstatement',
  templateUrl: './customerstatement.component.html',
  styleUrls: ['./customerstatement.component.scss'],
})
export class CustomerstatementComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  Date: Date;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  CSform: FormGroup;
  totalform: FormGroup;
  index: number = 0;
  ScreenId: number;
  Permission: any;
  stationmasterObj: StationMaster;
  displayPrintPreview: boolean = false;

  accountArray: any;
  acctArry: string[] = [];
  accountList: SelectItem[];
  defaultValue: any;
  today: Date = new Date();
  pdfSource: string;
  handleChange(e) {
    this.index = e.index;
  }

  hotid = 'CustomerStatement';

  hotid1 = 'CustomerStatementSummery';
  private hotRegisterer = new HotTableRegisterer();
  CustomerStatement: Handsontable.GridSettings;
  CustomerStatementSummery: Handsontable.GridSettings;
  initializeControls() {
    this.CustomerStatement = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [100, 50, 50, 50, 50, 50],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,

      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'VoucherNo',
          type: 'text',
        },
        {
          data: 'Date',
          type: 'text',
          renderer: this.dateRenderer.bind(this),
          readOnly: true,
        },
        {
          data: 'VoucherType',
          type: 'text',
        },
        {
          data: 'Particulars',
          type: 'text',
        },
        {
          data: 'Debit',
          type: 'numeric',
          readOnly: true,
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'Credit',
          type: 'numeric',
          readOnly: true,
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'RunningBalance',
          type: 'numeric',
          readOnly: true,
          numericFormat: {
            pattern: '0,0.00',
          },
        },
      ],
      colHeaders: [
        this.translate.instant('VoucherNo'),
        this.translate.instant('Date'),
        this.translate.instant('Voucher Type'),
        this.translate.instant('Particulars'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('RunningBalance'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }
  initializeControls1() {
    this.CustomerStatementSummery = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [100, 50, 50, 50, 50, 50],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,

      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'AccountNo',
          type: 'text',
        },
        {
          data: 'AccountName',
          type: 'text',
        },
        {
          data: 'Particulars',
          type: 'text',
        },
        {
          data: 'Debit',
          type: 'text',
        },
        {
          data: 'Credit',
          type: 'text',
        },
        {
          data: 'TotalDebit',
          type: 'text',
        },
        {
          data: 'TotalCredit',
          type: 'text',
        },
        {
          data: 'RunningBalance',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('Account No'),
        this.translate.instant('Account Name'),
        this.translate.instant('Particulars'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('Total Debit'),
        this.translate.instant('Total Credit'),
        this.translate.instant('RunningBalance'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private messageService: MessageService,
    private permission: PermissionsService,
    private accountapi: AccountApiService,
    private crystalReportService: CrystalReportService,
    private masterapi: MasterApiService,
    private formatDateService: ReportDateFormatService,
    private printService: FileSaverService,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Customer Statement') {
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

    this.CSform = new FormGroup({
      selectAccount: new FormControl(null, Validators.required),
      Description: new FormControl(),
      LPONO: new FormControl(),
      DateTO: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear()))
      ),
      DateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear()))
      ),
      isDate: new FormControl(false),
      type: new FormControl('Detailed'),
    });
    this.totalform = new FormGroup({
      totalCredit: new FormControl(0),
      totalDebit: new FormControl(0),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
    this.initializeControls1();

    this.getAllAccount();
  }
  get f() {
    return this.CSform.controls;
  }

  getAllAccount(): void {
    this.accountapi.GetCustomerMasterDropdown().subscribe({
      next: (response) => {
        if (response && response.result) {
          this.accountArray = response.result;
          this.accountList = response.result.map((kl) => ({
            label: kl.name,
            value: kl.value,
          }));
          this.accountList.unshift({ label: '--Select--', value: '' });
        } else {
          //console.error('Unexpected response structure:', response);
        }
      },
      error: (err) => {
        //console.error('Failed to fetch accounts:', err);
      },
    });
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  ReportShow() {
    if (this.CSform.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.CSform.markAllAsTouched();
      this.CSform.markAsDirty();
      return true;
    } else {
      const type = this.CSform.get('type').value;
      const isDateSelected = this.CSform.get('isDate').value === true;
      const selectedAccount = this.CSform.value.selectAccount || '';
      if (type === 'Summary') {
        this.defaultValue = {
          rptSummary: true,
          rptDetails: false,
          rptDateRange: isDateSelected,
          rptAsOnDate: isDateSelected == true ? false : true,
          rptPrintWithRef: false,
          rptPrintWithCheq: false,
          rptPrintWithAlloc: !isDateSelected,
          rptPrintWithAgainstAcc: false,
          rptPrintWithRelatedAccTrans: false,
          rptHideOpeningBalance: false,
          rptCostCenter: -1,
          rptJob: -1,
          rptAccount: selectedAccount,
          rptLocation: -1,
          rptDescription: '',
          rptNarration: '',
          rptDtpAson: isDateSelected == false ? new Date().toISOString() : null,
          rptDtpFrom:
            isDateSelected == true ? this.CSform.value.DateFrom : null,
          rptDtpTo: isDateSelected ? this.CSform.value.DateTO : null,
          rptTotDebit: null,
          rptTotCredit: null,
          rptTotRunningBalanceCreditDebit: null,
          viewAccountsTransactionsVoucherType: [],
        };

        this.accountapi
          .CustomerStattemnetbySummery(this.defaultValue)
          .subscribe((response: any) => {
            let runningBalance = 0;
            this.dataset = response.result
              ?.filter(
                (item) =>
                  (item.accountsTransactionsDebit > 0 ||
                    item.accountsTransactionsCredit > 0) &&
                  item.accountsTransactionsVoucherType !== 'OPENING BALANCE'
              )
              .map((item) => {
                runningBalance +=
                  item.accountsTransactionsDebit -
                  item.accountsTransactionsCredit;
                return {
                  AccountNo: item.accountsTransactionsAccNo ?? selectedAccount,
                  AccountName:
                    item.accName ??
                    this.accountArray?.find(
                      (j) => j.value.trim() === selectedAccount.trim()
                    )?.name,
                  TotalCredit: Math.max(
                    0,
                    -1 *
                      (item.accountsTransactionsDebit -
                        item.accountsTransactionsCredit)
                  ),
                  TotalDebit: Math.max(
                    0,
                    item.accountsTransactionsDebit -
                      item.accountsTransactionsCredit
                  ),
                  Particulars: item.accountsTransactionsParticulars,
                  Debit: item.accountsTransactionsDebit,
                  Credit: item.accountsTransactionsCredit,
                  RunningBalance: runningBalance,
                };
              });
            this.totalform.get('totalCredit').setValue(this.getTotalCredit());
            this.totalform.get('totalDebit').setValue(this.getTotalDebit());
          });
      } else if (type === 'Detailed') {
        this.defaultValue = {
          rptSummary: false,
          rptDetails: true,
          rptDateRange: isDateSelected,
          rptAsOnDate: isDateSelected == true ? false : true,
          rptPrintWithRef: true,
          rptPrintWithCheq: false,
          rptPrintWithAlloc: false,
          rptPrintWithAgainstAcc: false,
          rptPrintWithRelatedAccTrans: false,
          rptHideOpeningBalance: false,
          rptCostCenter: -1,
          rptJob: -1,
          rptAccount: selectedAccount,
          rptLocation: -1,
          rptDescription: '',
          rptNarration: '',
          rptDtpAson: isDateSelected == false ? new Date().toISOString() : null,
          rptDtpFrom: isDateSelected ? this.CSform.value.DateFrom : null,
          rptDtpTo: isDateSelected ? this.CSform.value.DateTO : null,
          rptTotDebit: null,
          rptTotCredit: null,
          rptTotRunningBalanceCreditDebit: null,
          viewAccountsTransactionsVoucherType: [],
        };

        this.accountapi
          .MainReport_GetReportAccountsTransactions_PARAM_CLASS(
            this.defaultValue
          )
          .subscribe((response: any) => {
            let runningBalance = 0;
            this.dataset = response.result
              ?.filter(
                (res) =>
                  (res.accountsTransactionsDebit > 0 ||
                    res.accountsTransactionsCredit > 0) &&
                  res.accountsTransactionsVoucherType !== 'OPENING BALANCE'
              )
              .map((res) => {
                runningBalance +=
                  res.accountsTransactionsDebit -
                  res.accountsTransactionsCredit;
                return {
                  VoucherNo: res.accountsTransactionsVoucherNo,
                  Date: res.accountsTransactionsTransDate,
                  VoucherType: res.accountsTransactionsVoucherType,
                  Particulars: res.accountsTransactionsParticulars,
                  Debit: res.accountsTransactionsDebit,
                  Credit: res.accountsTransactionsCredit,
                  RunningBalance: runningBalance.toFixed(2),
                };
              });
            this.totalform.get('totalCredit').setValue(this.getTotalCredit());
            this.totalform.get('totalDebit').setValue(this.getTotalDebit());
          });
      }
    }
  }

  getTotalCredit() {
    let totalCr = this.dataset?.reduce((sum, res) => {
      return sum + (res.Credit || 0);
    }, 0);
    return totalCr?.toFixed(2);
  }

  getTotalDebit() {
    let totalDr = this.dataset?.reduce((sum, res) => {
      return sum + (res.Debit || 0);
    }, 0);
    return totalDr?.toFixed(2);
  }
  displayPrint() {
    this.displayPrintPreview = true;
  }
  GetAccountName(data: any): string | undefined {
    const account = this.accountList?.find((res) => res.value === data);
    return account ? account.label : undefined;
  }
  printAsPDF() {
    var css: string = `
  .flexcol{
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
}
.flexrow{
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: start;
}
    
.spac1{
margin-top:20px;
}
.rowgap{
    gap: 111px;
}
.flex {
display: flex;
margin-bottom: 5px;
gap: 4px; /* Adjusted the gap value here */
}
}


.contain1{
width: 50%;
 border-radius: 1px;
   padding-bottom: 0%;
padding: 8px;
}
.center{
margin-top:9%; 
 margin-left:35px;

}
.contain2{
width: 50%;
 border-radius: 1px;
margin-top: 5px;
font-size: 18px;
 padding-bottom: 0%;
padding: 8px;
margin-left: 100px;
}
.namefont{
font-size: 16px;
}
.ab {
font-size: 18px;
text-align: center;
margin-top: 25px;
margin-bottom: 5px;
}

.ac {

text-align: center;

font-size: 1.3rem;

font-weight: 500;

color: rgb(185, 13, 13);

margin-bottom: 3%;

}

.second {
width: 100%;
background-color: #f5f6f8;
border: 1px solid #c7baba;
border-right: 7px solid #c7baba;
border-bottom: 7px solid #c7baba;
justify-content: center;
margin: auto;
margin-bottom: 8px;
}

.ad {

margin-top: .5rem;
margin-left: 3%;

}

.ae {

margin-top: .5rem;
margin-left: 3%;

}

.customers {

font-family: Arial, Helvetica, sans-serif;
border-collapse: collapse;
width: 100%;
margin: auto;

}
.customers td,
.customers th {

border: 1px solid #ddd;
padding: 8px;

}
.customers tr:nth-child(even) {
background-color: #f2f2f2;
}
.customers tr:hover {
background-color: #ddd;
}
.customers th {

padding-top: 12px;
padding-bottom: 12px;
text-align: left;
background-color: rgb(247, 240, 240);
color: black;


}

.total {
justify-content: end;
display: flex;
gap: 64px;
width: 88%;

}

.af {
margin-top: 1%;
text-align: center;
}

.ag {

margin-top: 2%;
text-align: center;
font-size: 1.4rem;
font-weight: 700;

}

.double-underline {
border-bottom: 2px solid;
text-decoration: underline;
width: 30%;

}

.ah {
text-align: center;
margin-left: 150px;
}
.second {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.ad {
  margin: 0;
  padding: 5px;
  flex: 1;
  text-align: left; /* Ensures Acc. Name is left-aligned */
}

.ae {
  margin: 0;
  padding: 5px;
  text-align: center; /* Centers the "As on Date" */
  flex: 1;
}

  .end {
text-align: end;
}
        .rectImg {
height: 140px;
  width: 217px;
}

.squreImg {
height: 145px;
width: 145px;
}
`;
    let html: any = document.getElementById('print');
    this.printService.PrintPDF('print', css);
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
  onReportTypeChange(event: any) {
    this.totalform.get('totalCredit').setValue(0);
    this.totalform.get('totalDebit').setValue(0);
    console.log('Selected value:', event);
    if (event == 'Summary') {
      this.dataset = [];
      this.ReportShow();
    } else if (event == 'Detailed') {
      this.dataset = [];
      this.ReportShow();
    }
  }

  rptFilter: ReportFilterModel;
  FinacialPeriodArry: FinancialPeriods[];
  getReport1() {
    if (this.f.isDate.value == false) {
      this.masterapi.LoadDropdown().subscribe((m) => {
        this.FinacialPeriodArry = m.resultSet.financialPeriods;

        if (this.FinacialPeriodArry.length > 0) {
          var req = {
            accountNumber: this.f.selectAccount.value,
            dateFrom: this.formatDateService.yyyymmdd(
              this.FinacialPeriodArry[0]?.financialPeriodsStartDate
            ),
            dateTo: this.formatDateService.yyyymmdd(this.f.DateTO.value),
          };

          this.getReport(req);
        } else {
          console.error('Financial periods array is empty.');
        }
      });
    } else {
      var req = {
        accountNumber: this.f.selectAccount.value,
        dateFrom: this.formatDateService.yyyymmdd(this.f.DateFrom.value),
        dateTo: this.formatDateService.yyyymmdd(this.f.DateTO.value),
      };

      this.getReport(req);
    }
  }
  getReport(req) {
    this.accountapi.AccountTransactionsHistory(req).subscribe((res: any) => {
      this.rptFilter = {
        ReportName:
          this.f.type.value == 'Summary'
            ? 'CustomerStatementSummary'
            : 'CustomerStatementDetail',
        SelectionFormula: '',
        Parameters: [],
        SP_Queries: [],
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
}
