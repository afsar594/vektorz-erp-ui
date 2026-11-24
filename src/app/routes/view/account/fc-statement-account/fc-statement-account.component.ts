import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MessageService, SelectItem } from 'primeng';
import { ChartofAccounts } from 'src/app/routes/domain';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-fc-statement-account',
  templateUrl: './fc-statement-account.component.html',
  styleUrls: ['./fc-statement-account.component.scss']
})
export class FcStatementAccountComponent implements OnInit {


  title: string;
  subtitle: string;
  dataset: any;
  dataset1: any[] = [];
  cols: Array<any>;
  Date: Date;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  FCform: FormGroup;
  index: number = 0;
  state: { field: any; dir: string; search: any; filter: any; fromDate: any; toDate: any; };
  search: any;
  filter: any;
  datedFrom: Date;
  datedTo: Date;
  totalCredit = 0;
  totalDebit = 0;
  selectedAccount: any;
  totalrunningBalance: any;
  ScreenId: number;
  Permission: any;
  stationmasterObj: any;
  handleChange(e) {
    this.index = e.index;
  }
  tableData: Array<any> = [];
  displayPrintPreview: boolean = false;
  hotid = 'FCSummary';
  private hotRegisterer = new HotTableRegisterer();
  FCSummary: Handsontable.GridSettings;


  financialStartDate:any = this.GetLastYearDate(new Date());
  financialEndDate: any = new Date();


  selectedValue: string = "summary";
  hotid1 = 'FCDetaile';
  // private hotRegisterer = new HotTableRegisterer();
  FCDetaile: Handsontable.GridSettings;


  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];


  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private accountApi: AccountApiService,
    private translate: TranslateService,
    private utilityService: UtilityService,
    private printService: FileSaverService,
    private permission: PermissionsService,
    private formatDateService: ReportDateFormatService,

  ) {

  }
  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 7);
    return new Date(date.toDateString())
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
      if (rights) {
        var res = rights[0]
        this.Permission = {
          Allow: res?.workGroupPermissionsUallow,
          Add: res?.workGroupPermissionsUadd,
          Delete: res?.workGroupPermissionsUdelete,
          Edit: res?.workGroupPermissionsUedit,
          Print: res?.workGroupPermissionsUprint,
          View: res?.workGroupPermissionsUview
        };
      }
    });
    this.datedFrom = new Date(new Date().setFullYear(new Date().getFullYear() - 5));
    this.datedTo = new Date();
    this.FCform = new FormGroup({
      selectAccount: new FormControl('', Validators.required),
      DateTO: new FormControl(new Date(new Date().setFullYear(new Date().getFullYear())), Validators.required),
      DateFrom: new FormControl(new Date(new Date().setFullYear(new Date().getFullYear())), Validators.required),

    });

    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";

    });
    this.getAllAccount()

    this.initializeControls()

    this.initializeControls1()


  }
  initializeControls() {
    this.FCSummary = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
      },
      data: [],

      minSpareRows: 1,
      allowInsertRow: true,


      stretchH: "all",
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'accountName',
          type: 'text',
        },
        {
          data: 'accNo',
          type: 'numeric'
        },
        {
          data: 'totalDebit',
          type: 'numeric',
        },
        {
          data: 'totalCredit',
          type: 'numeric'
        },
        {
          data: 'debitBalance',
          type: 'numeric',
        },
        {
          data: 'creditBalance',
          type: 'numeric'
        },
        // {
        //   data: 'FC Debit',
        //   type: 'numeric',
        // },
        // {
        //   data: 'FC Credit',
        //   type: 'numeric'
        // }
      ],
      colHeaders: [
        this.translate.instant('Account Name'),
        this.translate.instant('Account Code'),
        this.translate.instant('Total Debit'),
        this.translate.instant('Total Credit'),
        this.translate.instant('Debit Balance'),
        this.translate.instant('Credit Balance'),
        // this.translate.instant('Debit(FC) '),
        // this.translate.instant('Credit(FC)'),

      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
      afterChange: (r, c) => {
        this.ColumnSum()
      }
    }
  }
  initializeControls1() {
    this.FCDetaile = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [60, 60, 60, 90, 60, 60, 60, 60, 60],
      minRows: 10,
      width: '100%',
      height: 350,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,

      stretchH: "all",
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'voucherNo',
          type: 'date',
          dateFormat: 'DD/MM/YYYY',
         width: 100,
        },
        {
          data: 'transDate',
          type: 'numeric',
         width: 100,
        },
        {
          data: 'voucherType',
          type: 'numeric',
         width: 100,
        },
        {
          data: 'description',
          type: 'numeric',
         width: 180,
        },
        {
          data: 'debit',
          type: 'numeric',
         width: 100,
        },
        {
          data: 'credit',
          type: 'numeric',
         width: 100,
        },
        {
          data: 'runningBalance',
          type: 'numeric',
         width: 100,
        },

        {
          data: 'refNo',
          type: 'numeric',
         width: 100,
        },
        {
          data: 'Days',
          type: 'numeric',
          width: 100,
        }
      ],
      colHeaders: [
        this.translate.instant('Voucher'),
        this.translate.instant('Date'),
        this.translate.instant('V.Type'),
        this.translate.instant('Description'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('Running Balance'),
        this.translate.instant('Ref.No'),
        this.translate.instant('Days'),

      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
      afterChange: (r, c) => {
        this.ColumnSum1()
      }

    }

  }

  ApplyFilter() {
    let queryString = '';
    queryString += this.DateRangeSelect();
    let stringQuery = this.VoucherTypeDropdownFilter();
    queryString += stringQuery;
    this.filter = queryString;
    this.GetGridListData(null);
  }

  VoucherTypeDropdownFilter() {
    let queryString = '';
    if (this.selectedAccount == '' || this.selectedAccount == null) {

      return "";
    }
    if (this.selectedAccount != '') {
      queryString += ` && (AccountsTransactionsAccNo="` + this.selectedAccount + `")`;
    }
    return queryString;
  }

  ColumnSum() {

    var totalDebit = 0;
    this.FCDetaile.data.forEach((elemt: any) => {
      if (elemt && elemt.totalDebit) {
        totalDebit += elemt.totalDebit;
      }
    })
    this.totalDebit = totalDebit
    // this..FCDetaile.data.controls.salesVoucherTotalItemDisAmount.setValue(disc);
    var value = 0

    this.FCDetaile.data.forEach((elemt: any) => {
      if (elemt && elemt.totalCredit) {
        value += elemt.totalCredit
      }
    })
    this.totalCredit = value
  }
  ColumnSum1() {

    var totalDebit = 0;
    this.dataset1.forEach((elemt: any) => {
      if (elemt && elemt.debit) {
        totalDebit += elemt.debit;
      }
    })
    this.totalDebit = totalDebit
    // this..FCDetaile.data.controls.salesVoucherTotalItemDisAmount.setValue(disc);
    var value = 0

    this.dataset1.forEach((elemt: any) => {
      if (elemt && elemt.credit) {
        value += elemt.credit
      }
    })
    this.totalCredit = value
    var value1 = 0

    this.dataset1.forEach((elemt: any) => {
      if (elemt && elemt.credit) {
        value1 += elemt.runningBalance
      }
    })
    this.totalrunningBalance = value1
  }

  DateRangeSelect() {

    let queryString: string = '';
    let min = this.GetDate(new Date(this.financialStartDate));
    let max = this.GetDate(new Date(this.financialEndDate));
    if (min) {
      queryString += ` and (act.AccountsTransactions_TransDate >= cast('` + min + `'as Date))`;
    }
    if (max) {
      queryString += ` and (act.AccountsTransactions_TransDate <= cast('` + max + `'as Date))`;
    }

    return queryString;
  }

  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }
  getAllAccount() {

    this.accountApi.GetAllAcounts().subscribe(k => {
      this.accountArray = k.result;
      this.accountList = k.result.map((kl) => ({ label: kl.maAccName, value: kl.maAccNo }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
      this.acctArry = k.result.map(ar => ar.maAccName?.trim());
    });
  }
  GetGridListData(event: any) {
    if (this.selectedAccount == undefined) {
      this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Select account' });
      return
    }
    this.state = {
      field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactionsAccNo' : 'AccountsTransactionsAccNo',
      dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      search: this.selectedAccount,
      filter: this.filter,
      fromDate: this.formatDateService.yyyymmdd(this.financialStartDate),
      toDate: this.formatDateService.yyyymmdd(this.financialEndDate)
    }
    if (this.selectedValue == 'summary') {

      this.accountApi.GetAccountTransactionsForeignCurrencySummary(this.state).subscribe((response: any) => {
        // if (response?.result?.length > 0) {
        this.dataset = response?.result;
        // }
      })
    }
    else {

      this.accountApi.GetAccountTransactionsForeignCurrencyDetail(this.state).subscribe((response: any) => {
        this.dataset1 = []
        if (response?.result?.length > 0) {
          this.dataset1 = response?.result;

        }
      })
    }


  }


  displayPrint() {
    this.displayPrintPreview = true;
  }

  printAsPDF() {
    var css: string = `

.ab {

  text-align: center;
  margin-top: 25px;
  margin-bottom: 5px;
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
  gap: 28px;
  width: 90%;
  margin-top: 10px;
}

}
.end{
  text-align: end;
}
.center {
  text-align: center;
}

.af {
  margin-top: 1%;
  text-align: center;
}
@media print {
  thead {display: table-header-group;}
  tfoot {display: table-footer-group;}
  table { page-break-inside:auto ;
    font-size: 12px;}
  tr { page-break-inside:avoid; page-break-after:auto }

  body {margin: 0;}
  }
        .rectImg {
height: 140px;
    width: 217px;
}

.squreImg {
  height: 145px;
  width: 145px;
}
    `
    let html: any = document.getElementById('print');
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF')
  }

  userTrackingLog(type) {
    let req = {
      page: 'Account Statement Print',
      section: this.tableData,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: ''
    }
    this.utilityService.AddUserTrackingLog(req).subscribe(
      (res) => {
      });
  }
  get f() {
    return this.FCform.controls;
  }
}
