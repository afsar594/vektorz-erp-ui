import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

import { defaults } from 'src/app/shared/service/settings';
//import { Customer, CustomerService } from './customer.service';
interface CompanyProfile {
  name: String;
  sector: String;
  thisYearSales: String;
  lastYearSales: String;
  thisYearGrowth: String;
  lastYearGrowth: String;
}
@Component({
  selector: 'app-multiaccount',
  templateUrl: './multiaccount.component.html',
  styleUrls: ['./multiaccount.component.scss']
})


export class MultiaccountComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset2: any;
  display = true;
  status: string[] = ['OUTOFSTOCK', 'INSTOCK', 'LOWSTOCK'];
  targetProducts: any[] = [];
  sourceProducts: any[] = [];
  selectedAccounts: any[] = [];
  radioType = "Detail";
  cols: Array<any>;
  Date: Date;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  MAForm: FormGroup;
  index: number = 0;
  customersList: any;
  startDate: Date = this.GetLastYearDate(new Date());
  endDate: Date = new Date();
  selectedAsOnDate: Date = new Date();
  isDateChecked: boolean = false;
  sourceDataObject: any;
  displayPrintPreview: boolean = false;
  ScreenId: number;
  Permission: any
    ;
  filter: string;
  search: any;
  state: any;
  handleChange(e) {
    this.index = e.index;
  }

  hotid2 = 'MASummary';
  private hotRegistererSummary = new HotTableRegisterer();
  MASummary: Handsontable.GridSettings;
  initializeControls2() {
    this.MASummary = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [90, 30, 30, 30, 30, 30],
      //minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
      },
      data: [],
      //minSpareRows: 1,
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
          data: 'accountNo',
          type: 'text'
        },
        {
          data: 'totalDebit',
          type: 'text',
        },
        {
          data: 'totalCredit',
          type: 'text'
        },
        {
          data: 'debitBalance',
          type: 'text',
        },
        {
          data: 'creditBalance',
          type: 'text'
        }
      ],
      colHeaders: [

        this.translate.instant('Account Name'),
        this.translate.instant('Account Code'),
        this.translate.instant('Total Debit'),
        this.translate.instant('Total Credit'),
        this.translate.instant('Debit Balance'),
        this.translate.instant('Credit Balance'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }
  hotid1 = 'MADetail';
  private hotRegistererDetail = new HotTableRegisterer();
  MADetail: Handsontable.GridSettings;
  initializeControls() {
    this.MADetail = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [90, 30, 30, 30, 30, 30],
      //minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
      },
      data: [],
      //minSpareRows: 1,
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
          data: 'voucherNo',
          type: 'text'
        },
        {
          data: 'date',
          type: 'text',
        },
        {
          data: 'voucherType',
          type: 'text'
        },
        {
          data: 'description',
          type: 'text'
        },
        {
          data: 'debit',
          type: 'text'
        },
        {
          data: 'credit',
          type: 'text'
        },
        {
          data: 'runningBalance',
          type: 'text',
        },
        {
          data: 'refNo',
          type: 'text',
        },
      ],
      colHeaders: [

        this.translate.instant('Account Name'),
        this.translate.instant('V No'),
        this.translate.instant('Date'),
        this.translate.instant('V Type'),
        this.translate.instant('Description'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('Running Balance'),
        this.translate.instant('Ref No'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private accservice: AccountApiService,
    private printService: FileSaverService,
    private masterApi: MasterApiService,
    private permission: PermissionsService,
  ) {
  }

  OnGroupSelect(event) {
    this.targetProducts = [];
    this.GetSourceAccounts(event.value);
  }
  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 1);
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

    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";

    });
    this.initializeControls2()
    this.GetSourceAccounts(" 1 == 1 ")
    this.initializeControls()
    this.GetAccountMasterGroup();
    //this.getAllStationMaster();

  }

  GetSourceAccounts(filter) {
    this.accservice.GetAccountMaster(filter).subscribe((response: ApiResponse<any>) => {
      if (response.valid && response.result != null) {
        this.sourceProducts = response.result;
      }
    })
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
      queryString += ` and (act.AccountsTransactions_TransDate >= cast('` + min + `'as Date))`;
    }
    if (this.endDate) {
      queryString += ` and (act.AccountsTransactions_TransDate <= cast('` + max + `'as Date))`;
    }

    return queryString;
  }
  ASOnDateChange() {
    let queryString = '';
    let max = this.GetDate(this.selectedAsOnDate);
    if (this.endDate) {
      queryString += ` and (act.AccountsTransactions_TransDate <= cast('` + max + `'as Date))`;
    }
    return queryString;
  }
  GetAccountMasterGroup() {
    this.accservice.GetAccountMasterGroup().subscribe((response: ApiResponse<any>) => {
      if (response.valid && response.result.length > 0) {
        this.customersList = response.result.map((data) => ({
          label: data.name,
          value: data.value
        }))
      }
    })
  }
  AccountDropDownChange() {
    let queryString = '';
    var a = this.targetProducts;
    if (this.targetProducts.length > 0) {
      let value: string = "";
      this.targetProducts.forEach((x) => {
        value += `'` + x.value + `',`;
      })
      queryString += ` and (act.AccountsTransactions_AccNo in(` + value.slice(0, -1) + `))`
    }
    return queryString;
  }
  OnTargetSelect(args: any) {
    if (args.items.length > 0) {
      this.selectedAccounts = args.items
    }
  }
  EmptySelectedValue(event) {
    this.selectedAccounts = [];
  }
  ShowData() {
    let query = '';
    if (this.isDateChecked == false) {
      query += this.ASOnDateChange();
    }
    else {
      query += this.DateRangeSelect();
    }
    query += this.AccountDropDownChange();
    this.filter = query;
    this.GetGridListData(null);
  }
  GetGridListData(event: any) {

    this.state = {
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter
    }
    this.dataset2 = [];
    this.sourceDataObject = [];
    if (this.radioType == 'Summary') {
      this.accservice.GetAccountTransactionsMultiAccountSummary(this.state).subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.data.length > 0) {
          this.dataset2 = response.result.data;
          this.calculateTotal2();
        }
      })
    }
    else {
      
      this.accservice.GetAccountTransactionsMultiAccountDetail(this.state).subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.details.length > 0) {
          this.sourceDataObject = response.result.details;

          console.table(" sourceDataObject", this.sourceDataObject);
          // this.GetTable()
          this.calculateTotal();
        }
      });
    }

  }

  totalCredit: number = 0;
  totalDebit: number = 0;
  totalBalance: number = 0;
  calculateTotal() {
    this.sourceDataObject.forEach(element => {
      this.totalBalance += Number(element.runningBalance ?? '0');
      this.totalCredit += Number(element.credit ?? '0');
      this.totalDebit += Number(element.debit ?? '0');
    });
  }
  calculateTotal2() {
    this.dataset2.forEach(element => {
      this.totalBalance += Number(element.runningBalance ?? '0');
      this.totalCredit += Number(element.credit ?? '0');
      this.totalDebit += Number(element.debit ?? '0');
    });
  }



  DownloadAccountStatementMultiAccountSummary(event, type) {
    if (!this.dataset2) {
      return;
    }
    this.state = {
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter,
      Extension: type
    } //"wwwroot/SiteDocument/SiteDemo1/FileDocument.doc" static file path
    this.accservice.DownloadMultiAccountSummary(this.state).subscribe((event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type
      });
      if (downloadedFile.type != "") {
        if (type == "PDF") {
          window.open(URL.createObjectURL(downloadedFile));
        }
        else {
          const a = document.createElement('a');
          a.setAttribute('style', 'display:none;');
          document.body.appendChild(a);
          a.download = "VoucherPrint";
          a.href = URL.createObjectURL(downloadedFile);
          a.target = '_blank';
          a.click();
          document.body.removeChild(a);
        }

      }
    });
  }

  GetTable() {
    document.getElementById('example1').innerHTML = "";
    const container = document.querySelector('#example1');
    const hot = new Handsontable(container, {
      data: this.sourceDataObject,
      preventOverflow: 'horizontal',
      width: '100%',
      colWidths: [170, 170, 170, 170, 170, 170, 170],
      rowHeaders: true,
      nestedHeaders: [
        [{
          label: 'Particulars',
          colspan: 4
        }, {
          label: 'Amount',
          colspan: 1
        },],
      ],
      // colHeaders: ['Head', 'SubHead','AccName', 'Credit', 'Debit','Amount' ],
      nestedRows: true,
      contextMenu: true,
      bindRowsWithHeaders: true,
      licenseKey: 'non-commercial-and-evaluation'
    });
  }
  //////////////  Printing Starts Here  ////////////
  displayPrint() {
    this.displayPrintPreview = true;
  }

  printAsPDF() {
    let html: any = document.getElementById('print');
    this.printService.saveAsPDF(html);
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  getAllStationMaster() {
    this.masterApi.GetAllStation().subscribe(response => {

      this.stationmasterObj = response[0];
    },
    );
  }

}
