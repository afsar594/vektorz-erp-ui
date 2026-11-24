import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-accountstatement',
  templateUrl: './accountstatement.component.html',
  styleUrls: ['./accountstatement.component.scss'],
})
export class AccountstatementComponent implements OnInit {
  showDatePicker: boolean = false;
  selectedDatePicker: string = 'asOn';
  accountDropdown: any[] = [];
  selectedAccountDropdown: string = '';
  jobDropdown: any[] = [];
  selectedJobDropdown: any;
  state: any;
  filter: string = '';
  search: string = '';
  title: string;
  subtitle: string;
  Submitted = false;
  dataset: any;
  ASForm: FormGroup;
  cols: any;
  timer: any;
  tableData: Array<any> = [];
  displayPrintPreview: boolean = false;

  startDate: any = this.GetLastYearDate(new Date());
  endDate: Date = new Date();
  selectedAsOnDate: Date = new Date();
  ScreenId: number;
  Permission: any;

  stationmasterObj: StationMaster;
  accName: any;
  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private accService: AccountApiService,
    private printService: FileSaverService,
    private router: Router,
    private utilityService: UtilityService,
    private permission: PermissionsService
  ) {}

  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 1);
    return new Date(date.toDateString());
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
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
    this.cols = [
      // { field: 'accountsTransactionsTransSno', header: 'S.No' },
      // { field: 'accountsTransactionsAccNo', header: 'Account No' },
      { field: 'accountsTransactionsVoucherNo', header: 'Voucher No' },
      { field: 'accountsTransactionsVoucherType', header: 'Voucher Type' },
      { field: 'accountsTransactionsDescription', header: 'Description' },
      { field: 'accountsTransactionsTransDateString', header: 'Date' },
      { field: 'accountsTransactionsDebit', header: 'Debit' },
      { field: 'accountsTransactionsCredit', header: 'Credit' },
      { field: 'accountsTransactionsAllocBalance', header: 'Running Balance' },
      { field: 'refNo', header: 'Ref No' },
      { field: 'action', header: 'View Voucher' },
    ];
    this.GetJobMasterDropdown();
    this.GetAccountDropdown();

    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    // this.initializeControls()
  }

  index: number = 0;
  licensekey: string;
  gridHeader: string;
  handleChange(e) {
    this.index = e.index;
  }

  getLink(type, id) {
    if (type == 'BANK PAYMENT') {
      this.router.navigateByUrl(`/account/bankpaymentvoucher?vNo=${id}`);
    } else if (type == 'CreditNote') {
      this.router.navigateByUrl(`/account/creditnote?vNo=${id}`);
    } else if (type == 'DEPJV') {
      this.router.navigateByUrl(
        `/account/depreciation-journal-voucher?vNo=${id}`
      );
    } else if (type == 'JournalVoucher') {
      this.router.navigateByUrl(`/account/journalvoucher?vNo=${id}`);
    } else if (type == 'RECEIPT') {
      this.router.navigateByUrl(`/account/receiptvoucher?vNo=${id}`);
    } else if (type == 'PAYMENT') {
      this.router.navigateByUrl(`/account/paymentvoucher?vNo=${id}`);
    } else if (type == 'BANK RECEIPT') {
      this.router.navigateByUrl(`/account/bankreceiptvouche?vNo=${id}`);
    } else if (type == 'DebitNote') {
      this.router.navigateByUrl(`/account/debitnote?vNo=${id}`);
    } else if (type == 'ContraVoucher') {
      this.router.navigateByUrl(`/account/contravoucher?vNo=${id}`);
    } else if (type == 'SalesVoucher') {
      this.router.navigateByUrl(`/sale/salesvoucher?vNo=${id}`);
    }
  }

  GetAccountDropdown() {
    this.accService
      .GetAccountMasterDropdown()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.accountDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.value,
          }));
        }
      });
  }

  GetJobMasterDropdown() {
    this.accService
      .GetJobMasterDropdown()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.jobDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.id,
          }));
        }
      });
  }

  JobDropDownChange() {
    let queryString = '';
    if (this.selectedJobDropdown != 0 && this.selectedJobDropdown != null) {
      queryString +=
        ` and (act.AccountsTransactions_JobNo in(` +
        this.selectedJobDropdown +
        `))`;
    }
    return queryString;
  }

  // JobDropDownFilter() {
  //   this.ApplyAllFilter();
  // }

  // AccountDropdownFilter() {
  //   this.ApplyAllFilter();
  // }

  AccountDropDownChange() {
    // this.getAccountName(this.selectedAccountDropdown)
    let queryString = '';
    if (
      this.selectedAccountDropdown != '' &&
      this.selectedAccountDropdown != null
    ) {
      queryString +=
        ` and (act.AccountsTransactions_AccNo in('` +
        this.selectedAccountDropdown +
        `'))`;
    }
    return queryString;
  }

  RadioDateChange(event, type) {
    let query = '';
    if (type == 'asOn') {
      this.showDatePicker = false;
    } else {
      this.showDatePicker = true;
    }
  }

  SearchData(event: any) {
    let that = this;
    clearTimeout(this.timer);
    var ms = 500; // milliseconds
    var val = event.target.value;
    this.timer = setTimeout(function () {
      that.search = val;
      that.GetGridListData(null);
    }, ms);
  }

  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }

  DateRangeSelect() {
    let queryString: string = '';
    let min = this.GetDate(this.startDate);
    let max = this.GetDate(this.endDate);
    if (this.startDate) {
      queryString +=
        ` and (cast(act.AccountsTransactions_TransDate as Date) >= cast('` +
        min +
        `'as Date))`;
    }
    if (this.endDate) {
      queryString +=
        ` and (cast(act.AccountsTransactions_TransDate as Date) <= cast('` +
        max +
        `'as Date))`;
    }

    return queryString;
  }

  // ASOnDateChange() {
  //   let queryString = '';
  //   let max = this.GetDate(this.selectedAsOnDate);
  //   if (this.endDate) {
  //     queryString += ` and (act.AccountsTransactions_TransDate <= cast('` + max + `'as Date))`;
  //   }
  //   return queryString;
  // }

  ASOnDateChange() {
    let queryString = '';
    let max = this.GetDate(this.selectedAsOnDate);
    if (this.endDate) {
      queryString +=
        ` and (cast(act.AccountsTransactions_TransDate as Date) <= cast('` +
        max +
        `'as Date))`;
    }
    return queryString;
  }
  public getAccountName(acctnumber: string) {
    return this.accountDropdown?.find(
      (j) => j.value?.trim() === acctnumber?.trim()
    )?.label;
  }

  DateRangeFilter() {
    this.ApplyAllFilter();
  }

  AsOnDateFilter() {
    this.ApplyAllFilter();
  }

  ApplyAllFilter() {
    let query = '';
    if (this.selectedDatePicker == 'asOn') {
      query += this.ASOnDateChange();
    } else {
      query += this.DateRangeSelect();
    }
    query += this.AccountDropDownChange();
    query += this.JobDropDownChange();
    this.filter = query;
    this.GetGridListData(null);
  }

  GetGridListData(event: any) {
    this.state = {
      Dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
      Field:
        event != null
          ? event.sortField != null && event.sortField != ''
            ? event.sortField
            : 'AccountsTransactions_TransSno'
          : 'AccountsTransactions_TransSno',
      Skip: event != null ? (event.first != null ? event.first : 0) : 0,
      Take: event != null ? (event.rows != null ? event.rows : 0) : 10000,
      Search: this.search,
      Filter: this.filter,
    };
    this.accService
      .GetAccountTransactions(this.state)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.details.length > 0) {
          this.tableData = response.result.details;
          this.calculateTotal();
        }
      });
  }

  DownloadAccountStatement(event, type) {
    if (!this.tableData) {
      return;
    }
    this.state = {
      Dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
      Field:
        event != null
          ? event.sortField != null && event.sortField != ''
            ? event.sortField
            : 'AccountsTransactions_TransSno'
          : 'AccountsTransactions_TransSno',
      Skip: event != null ? (event.first != null ? event.first : 0) : 0,
      Take: event != null ? (event.rows != null ? event.rows : 0) : 10000,
      Search: this.search,
      Filter: this.filter,
      Extension: type,
      FormatType: '',
    }; //"wwwroot/SiteDocument/SiteDemo1/FileDocument.doc" static file path
    this.accService.DownloadAccountStatement(this.state).subscribe((event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });

      if (downloadedFile.type != '') {
        if (type == 'PDF') {
          window.open(URL.createObjectURL(downloadedFile));
        } else {
          const a = document.createElement('a');
          a.setAttribute('style', 'display:none;');
          document.body.appendChild(a);
          a.download = 'VoucherPrint';
          a.href = URL.createObjectURL(downloadedFile);
          a.target = '_blank';
          a.click();
          document.body.removeChild(a);
        }
      }
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  //////////////  Printing Starts Here  ////////////
  displayPrint() {
    this.displayPrintPreview = true;
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
  width: 47%;
   border-radius: 1px;
  margin-top: 6%;
    padding-bottom: 0%;
  padding: 8px;
 }
 .center{
  margin-top:5%;
 }
.contain2{
  width: 53%;
   border-radius: 1px;
  margin-top: 5px;
  font-size: 18px;
   padding-bottom: 0%;
  padding: 8px;
  margin-left: 5px;
 }
.ab {

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
.row {

  display: inline-flex;

  margin-left: 680px;

  margin-top: 2%;


    }
  .end {
  text-align: end;

}

    `;
    let html: any = document.getElementById('print');
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
  }

  userTrackingLog(type) {
    let req = {
      page: 'Account stahement Printing',
      section: this.tableData,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: '',
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  totalBalance: number = 0;
  totalCreditBalance: number = 0;
  currentDate: Date;
  totalDebit: number = 0;

  calculateTotal() {
    this.currentDate = new Date();
    this.tableData.forEach((element) => {
      this.totalBalance +=
        Number(element?.accountsTransactionsAllocBalance ?? '0') ?? 0;
      this.totalCreditBalance +=
        Number(element?.accountsTransactionsCredit ?? '0') ?? 0;
      this.totalDebit += Number(element?.accountsTransactionsDebit ?? '0') ?? 0;
    });
    this.totalBalance = Number(this.totalBalance.toFixed(2));
    this.totalCreditBalance = Number(this.totalCreditBalance.toFixed(2));
    this.totalDebit = Number(this.totalDebit.toFixed(2));
  }
  // stationmasterArray: Array<StationMaster> = [];
  // stationmasterObj: StationMaster;
  // displayMaximizeable: boolean = false;

  // getAllStationMaster() {
  //   this.masterApi.GetAllStation().subscribe(response => {
  //     this.stationmasterObj = response[0];
  //     console.log(this.stationmasterObj);
  //   },
  //   );
  // }
}
