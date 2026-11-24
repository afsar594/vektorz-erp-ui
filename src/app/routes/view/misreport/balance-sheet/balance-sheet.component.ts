import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { FinancialPeriods } from 'src/app/routes/domain/FinancialPeriods';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MISService } from 'src/app/routes/service/mis/mis.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.scss'],
})
export class BalanceSheetComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  state: any;
  ScreenId: number;
  Permission: any;
  displayPrintPreview: boolean = false;
  financialStartDate: Date = this.GetLastYearDate(new Date());
  financialEndDate: Date = new Date();
  startDate: any = this.GetLastYearDate(new Date());
  endDate: Date = new Date();
  detailOrSummary: string = 'summary';
  sourceDataObject = [
    {
      head: '',
      subHead: null,
      accName: null,
      credit: null,
      debit: null,
      amount: null,
      __children: [],
    },
  ];
  index: number = 0;
  BForm: FormGroup;
  licensekey: any;
  gridHeader: string;
  filter: string;
  search: any;
  balanceSheetData: any;
  groupedData: GroupedBalanceSheetData[] = [];
  FinacialPeriodArry: FinancialPeriods[];
    financialPeriodMaxDate: Date | null = null;

  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 7);
    return new Date(date.toDateString());
  }

  getFInancialPeriod() {
    this.masterApi.GetAllFinancialPeriod().subscribe((data) => {
      this.FinacialPeriodArry = data;
    });
  }

  handleChange(e) {
    this.index = e.index;
  }
  hotid = 'BalanceSheet';
  private hotRegisterer = new HotTableRegisterer();
  BalanceSheet: Handsontable.GridSettings;

  initializeControls() {
    this.BalanceSheet = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 0,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
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
          data: 'Particulars',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 200,
        },
        {
          data: 'Amount',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 80,
        },
      ],
      colHeaders: [
        this.translate.instant('Particulars'),
        this.translate.instant('Amount'),
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
    private fb: FormBuilder,
    private misService: MISService,
    private printService: FileSaverService,
    private masterApi: MasterApiService,
    private utilityService: UtilityService,
    private permission: PermissionsService,
    private accountapi:AccountApiService,
    private cdr: ChangeDetectorRef,
  ) {}
  datedFrom: any;
  datedTo: any;

  ngOnInit(): void {
  
  this.GetFinancialYear();

    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Balance Sheet') {
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
    this.datedFrom = new Date(
      new Date().setFullYear(new Date().getFullYear() - 5),
    );
    this.datedTo = new Date();
    this.BForm = new FormGroup({
      DateFrom: new FormControl(this.datedFrom, Validators.required),
      DateTo: new FormControl(this.datedTo, Validators.required),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
  }

  printAsExcel() {
    this.state = {
      Dir: 'asc',
      Field: 'AccountsTransactions_TransSno',
      Skip: 0,
      Take: 10000,
      Search: this.search,
      Filter: this.filter,
      Extension: 'XLSX',
    };
    this.misService.printAsExcel(this.state).subscribe((event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      console.log('ddd', downloadedFile);
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = 'BalanceSheet';
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }

  printAsExcelSummary() {
    this.state = {
      Dir: 'asc',
      Field: 'AccountsTransactions_TransSno',
      Skip: 0,
      Take: 10000,
      Search: this.search,
      Filter: this.filter,
      Extension: 'XLSX',
    };
    this.misService.printAsExcelSummary(this.state).subscribe((event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      console.log('ddd', downloadedFile);
      if (downloadedFile.type != '') {
        // if(type =="PDF"){
        //   window.open(URL.createObjectURL(downloadedFile));
        // }
        // else{
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = 'BalanceSheetSummary';
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
        //   }
      }
      this.userTrackingLog('XLSX');
    });
  }
  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  GetFinancialYear() {
    this.misService
      .GetFinancialYearResponse()
      .subscribe((response: ApiResponse<any>) => {
        if (response?.result) {
          this.financialStartDate = new Date(response.result.financialPeriodsStartDate);
          this.financialEndDate = new Date(response.result.financialPeriodsEndDate);
          this.ApplyFilter();
        }
      });
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
    let min = this.GetDate(new Date(this.financialStartDate));
    let max = this.GetDate(new Date(this.financialEndDate));
    if (min) {
      queryString +=
        ` and (act.AccountsTransactions_TransDate >= cast('` +
        min +
        `'as Date))`;
    }
    if (max) {
      queryString +=
        ` and (act.AccountsTransactions_TransDate <= cast('` +
        max +
        `'as Date))`;
    }

    return queryString;
  }

  ApplyFilter() {
    let queryString = '';
    queryString += this.DateRangeSelect();
    this.filter = queryString;
    this.GetGridListData(null);
  }

  showPrintSummary: boolean = true;
  GetGridListData(event: any) {
    this.state = {
      field:
        event != null
          ? event.sortField != null && event.sortField != ''
            ? event.sortField
            : 'AccountsTransactions_TransSno'
          : 'AccountsTransactions_TransSno',
      dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
      search: this.search,
      filter: this.filter,
      fromDate: this.GetDate(this.financialStartDate),
      toDate: this.GetDate(this.financialEndDate),
    };
    if (this.detailOrSummary == 'summary') {
      this.showPrintSummary = true;
      this.misService
        .GetAccountTransactionsBalanceSheetSummary(this.state)
        .subscribe((response: any) => {
          if (response?.result?.length > 0) {
            const sourceDataObject: any[] = [];
            response?.result.forEach((item) => {
              // Find the index of the mainHead in sourceDataObject
              let mainHeadIndex = sourceDataObject?.findIndex(
                (obj) => obj.head === item.mA_MainHead,
              );

              // If mainHead not found, create a new object for it
              if (mainHeadIndex === -1) {
                sourceDataObject.push({
                  head: item.mA_MainHead,
                  subHead: null,
                  accName: null,
                  credit: null,
                  debit: null,
                  amount: null,
                  __children: [],
                });
                mainHeadIndex = sourceDataObject.length - 1;
              }

              // Find the index of subHead in mainHead's __children
              let subHeadIndex = sourceDataObject[
                mainHeadIndex
              ].__children?.findIndex((obj) => obj.subHead === item.mA_SubHead);

              // If subHead not found, create a new object for it
              if (subHeadIndex === -1) {
                sourceDataObject[mainHeadIndex].__children.push({
                  subHead: item.mA_SubHead,
                  accName: null,
                  credit: null,
                  debit: null,
                  amount: null,
                  __children: [],
                });
                subHeadIndex =
                  sourceDataObject[mainHeadIndex].__children.length - 1;
              }

              // Push the accName into the subHead's __children
              sourceDataObject[mainHeadIndex].__children[
                subHeadIndex
              ].__children.push({
                accName: item.mA_AccName,
                credit: item.credit,
                debit: item.debit,
                amount: item.credit - item.debit,
              });
            });
            this.sourceDataObject = sourceDataObject;
            this.GetTable();
          }
        });
    } else {
      this.showPrintSummary = false;
      this.misService
        .GetAccountTransactionsBalanceSheetDetail(this.state)
        .subscribe((response: any) => {
          if (response?.result?.length > 0) {
            const sourceDataObject: any[] = [];
            response?.result.forEach((item) => {
              // Find the index of the mainHead in sourceDataObject
              let mainHeadIndex = sourceDataObject?.findIndex(
                (obj) => obj.head === item.mA_MainHead,
              );
              if (mainHeadIndex === -1) {
                sourceDataObject.push({
                  head: item.mA_MainHead,
                  subHead: null,
                  accName: null,
                  credit: null,
                  debit: null,
                  amount: null,
                  __children: [],
                });
                mainHeadIndex = sourceDataObject.length - 1;
              }

              let subHeadIndex = sourceDataObject[
                mainHeadIndex
              ].__children?.findIndex((obj) => obj.subHead === item.mA_SubHead);

              if (subHeadIndex === -1) {
                sourceDataObject[mainHeadIndex].__children.push({
                  subHead: item.mA_SubHead,
                  accName: null,
                  credit: null,
                  debit: null,
                  amount: null,
                  __children: [],
                });
                subHeadIndex =
                  sourceDataObject[mainHeadIndex].__children.length - 1;
              }
              sourceDataObject[mainHeadIndex].__children[
                subHeadIndex
              ].__children.push({
                accName: item.mA_AccName,
                credit: item.credit,
                debit: item.debit,
                amount: item.credit - item.debit,
              });
            });
            this.GetTable();
          }
        });
    }
  }

  GetTable() {
    document.getElementById('example1').innerHTML = '';
    const container = document.querySelector('#example1');
    const hot = new Handsontable(container, {
      data: this.sourceDataObject,
      preventOverflow: 'horizontal',
      width: 'auto',
      colWidths: [170, 170, 170, 170, 170, 170, 170],
      // colWidths: 'auto',
      rowHeaders: true,
      nestedHeaders: [
        [
          {
            label: 'Particulars',
            colspan: 4,
          },
          {
            label: 'Amount',
            colspan: 2,
          },
        ],
      ],
      // colHeaders: ['Head', 'SubHead', 'AccName', 'Credit', 'Debit', 'Amount'],
      columns: [
        { data: 'head' },
        { data: 'subHead' },
        { data: 'accName' },
        {
          data: 'credit',
          type: 'numeric',
          numericFormat: { pattern: '0.00' },
          editor: 'numeric',
        },
        {
          data: 'debit',
          type: 'numeric',
          numericFormat: { pattern: '0.00' },
          editor: 'numeric',
        },
        {
          data: 'amount',
          type: 'numeric',
          numericFormat: { pattern: '0.00' },
          editor: 'numeric',
        },
      ],
      nestedRows: true,
      contextMenu: true,
      bindRowsWithHeaders: true,
      licenseKey: 'non-commercial-and-evaluation',
    });
  }

  currentDate: Date = new Date();
  //////////////  Printing Starts Here  ////////////
  totaldebit: number = 0;
  totalcredit: number = 0;

  displayPrint() {
    this.displayPrintPreview = true;
  }

  userTrackingLog(type) {
    let req = {
      page: '',
      section: this.sourceDataObject,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: '',
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      console.log('Response:', res);
    });
  }

  printAsPDF() {
    if (this.showPrintSummary) {
      // let html: any = document.getElementById('printdetail2');
      // this.printService.saveAsPDF(html);
      //  this.userTrackingLog('PDF')
      const fileName = String(new Date().valueOf());
      var css: string = `
      h1{
    text-align: center;
    font-family:"Sans-serif";
    font-size: 2rem;
}
h2{
    text-align: center;
    font-family:"Sans-serif";
    font-size: 1.5rem;
    margin-bottom: 0%;
}
h3{
    text-align: center;
   margin-top: 0%;
    font-family:"Sans-serif";
    font-size: 1.5rem;  
}
.Asset {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 80%;
    margin-left: 10%;
    margin-top: 3%;
  }

  .Asset td, .Asset th {
    border: .5px solid #c8cec9;
    padding: 4px;
  }

  .Asset tr:nth-child(even){background-color: #f2f2f2;}

  .Asset tr:hover {background-color: #ddd;}

  .Asset th {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 6%;
    text-align: left;
    background-color: #127e18;
    color: white;
    font-size: 20px;
    border-radius: 4%;
  }
  p{
    font-size:16px;
  }
  .gross{
font-weight: bold;
padding-left: 4%;
  }
  .opera{
text-align: center;
  }
  .net{
font-weight: bold;

  }
  .ae{
text-align:right ;
  }
 .Main{
    color: rgb(13, 13, 123);
    font-weight: bold;
    padding-left: 1%;

 }
 .abd{
padding-left: 2%;
color: #808682;
 }
 .abe{
padding-left: 6%;
 }
 .total{
text-align: center;
font-weight: bold;
text-decoration: underline;
 }
 .step{
text-decoration: underline;
text-align: right;
 }
 .stepi{
    text-decoration: double underline;
    text-align: right;
     }
      `;
      var data = document.getElementById('printdetail2');
      this.printService.PrintPDF('printdetail2', css);
      this.userTrackingLog('PDF');
    } else {
      const fileName = String(new Date().valueOf());
      var css: string = `
      h1{
    text-align: center;
    font-family:"Sans-serif";
    font-size: 2rem;
}
h2{
    text-align: center;
    font-family:"Sans-serif";
    font-size: 1.5rem;
    margin-bottom: 0%;
}
h3{
    text-align: center;
   margin-top: 0%;
    font-family:"Sans-serif";
    font-size: 1.5rem;  
}
.Asset {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 80%;
    margin-left: 10%;
    margin-top: 3%;
  }

  .Asset td, .Asset th {
    border: .5px solid #c8cec9;
    padding: 4px;
  }

  .Asset tr:nth-child(even){background-color: #f2f2f2;}

  .Asset tr:hover {background-color: #ddd;}

  .Asset th {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 6%;
    text-align: left;
    background-color: #127e18;
    color: white;
    font-size: 20px;
    border-radius: 4%;
  }
  p{
    font-size:16px;
  }
  .gross{
font-weight: bold;
padding-left: 4%;
  }
  .opera{
text-align: center;
  }
  .net{
font-weight: bold;

  }
  .ae{
text-align:right ;
  }
 .Main{
    color: rgb(13, 13, 123);
    font-weight: bold;
    padding-left: 1%;

 }
 .abd{
padding-left: 2%;
color: #808682;
 }
 .abe{
padding-left: 6%;
 }
 .total{
text-align: center;
font-weight: bold;
text-decoration: underline;
 }
 .step{
text-decoration: underline;
text-align: right;
 }
 .stepi{
    text-decoration: double underline;
    text-align: right;
     }
      `;
      var data = document.getElementById('printdetail');
      this.printService.PrintPDF('printdetail', css);
      this.userTrackingLog('PDF');
    }
  }
  getAllStationMaster() {
    this.masterApi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
      console.log(this.stationmasterObj);
      this.userTrackingLog('PDf');
    });
    // this.dataset
  }
}
interface BalanceSheetItem {
  mA_MainHead: string;
  mA_SubHead: string;
  mA_RelativeNo: string;
  mA_RelativeName: string;
  mA_AccNo: string;
  mA_AccName: string;
  debit: number;
  credit: number;
}

interface GroupedBalanceSheetData {
  mA_MainHead: string;
  children: BalanceSheetItem[];
  totalDebit: number;
  totalCredit: number;
}
