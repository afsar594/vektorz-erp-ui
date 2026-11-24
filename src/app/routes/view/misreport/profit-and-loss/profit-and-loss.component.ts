import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MISService } from 'src/app/routes/service/mis/mis.service';
import { defaults } from 'src/app/shared/service/settings';
import 'handsontable/dist/handsontable.full.min.css';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ExportFormatType, ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';

@Component({
  selector: 'app-profit-and-loss',
  templateUrl: './profit-and-loss.component.html',
  styleUrls: ['./profit-and-loss.component.scss'],
})
export class ProfitAndLossComponent implements OnInit {
  title: string = '';
  subtitle: string = '';
  database: any;
  licensekey: any;
  gridHeader: string = '';
  isDate: boolean = false;
  financialStartDate: Date = new Date();
  financialEndDate: Date = new Date();
  startDate: any = this.GetLastYearDate(new Date());
  endDate: Date = new Date();
  ScreenId: number;
  Permission: any;
  isShow: boolean = false;
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
  locationList: Array<LocationMaster>;
  costCenterList: Array<CostCenterMaster>;
  index: number = 0;
  state: {
    Dir: string;
    Field: any;
    Skip: any;
    Take: any;
    Search: any;
    Filter: any;
    fromdate: Date;
    todate: Data;
  };
  search: any;
  filter: any;
  displayPrintPreview: boolean = false;
  dataset: any;
  dataset1: any;
  printsimple: boolean = false;
  printType: string = 'print';
  incomes: number;
  dispalyMonthpreviewsimple: boolean = false;
  incomeDetail: any;
  summary: any;
  simple: any;
  stateNew: {
    field: any;
    dir: string;
    search: any;
    filter: any;
    fromDate: Date;
    toDate: Date;
  };
  sourceDataObject2: any;
  totalincomecredit: any;
  totalincomedebit: any;
  totalexpensedebit: any;
  totalexpensecredit: any;
  pdfSource: string;
  // sourceDataObject1: any;

  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 1);
    return new Date(date.toDateString());
  }

  handleChange(e) {
    this.index = e.index;
  }

  totalDebit: any;
  totalCredit: any;
  totalBalance: any;
  hotid = 'profitAndLoss';
  private hotRegisterer = new HotTableRegisterer();
  profitAndLoss: Handsontable.GridSettings;

  initializeControls() {
    this.profitAndLoss = {
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
          width: 180,
        },
        {
          data: 'Debit',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 80,
        },
        {
          data: 'Credit',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },

          width: 80,
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
        this.translate.instant('A/C Head'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
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
    private masterApi: MasterApiService,
    private translate: TranslateService,
    private misService: MISService,
    private utilityService: UtilityService,
    private printService: FileSaverService,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,
  ) { }
  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Profit and Loss') {
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
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.getAllLocation();
    this.getAllCostCenter();
    this.GetFinancialYear();

    this.ApplyFilter();
    // this.GetTable();
  }

  getAllLocation() {
    this.masterApi.GetAllLocation().subscribe((response: any) => {
      this.locationList = response;
    });
  }

  getAllCostCenter() {
    this.masterApi.GetAllCostCenter().subscribe((response) => {
      this.costCenterList = response;
    });
    // this.initializeControls();
  }
  rptFilter : ReportFilterModel;




  GetFinancialYear() {
    this.misService
      .GetFinancialYearResponse()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result != null) {
          this.financialStartDate = response.result.financialPeriodsStartDate;
          this.financialEndDate = response.result.financialPeriodsEndDate;
        }
      });
  }
  DateRangeSelect() {
    let queryString: string = '';
    let min = this.GetDate(new Date(this.financialStartDate));
    let max = this.GetDate(new Date(this.financialEndDate));
    if (this.isDate) {
      min = this.GetDate(this.startDate);
      max = this.GetDate(this.endDate);
    }

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
    this.getAllStationMaster();
    this.GetGridListData(null);
  }

  Expenses: any;
  Total: any;
  GetGridListData(event: any) {
    //this.initializeControls();
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
      fromdate: this.startDate,
      todate: this.endDate,
    };
    this.sourceDataObject2 = [];
    this.Clear();
    this.misService
      .GetAccountTransactionsProfitLoss(this.state)
      .subscribe((response: any) => {
        this.sourceDataObject2 = this.transformDataForHandsontable(
          response.result
        );
        this.Expenses = response.result?.expenseDetails;
        this.incomes = response.result?.incomeDetails;
        this.Total = response.result;

        response.result?.incomeDetails.forEach((elemt: any) => {
          this.totalincome += elemt.credit - elemt.debit;
        });
        response.result?.expenseDetails.forEach((elemt: any) => {
          this.totalexpense += elemt.credit - elemt.debit;
        });
        this.netLoss = this.totalexpense - this.totalincome;
        // this.totalincome = Number(Math.abs(this.sourceDataObject[this.sourceDataObject?.length - 1]?.amount).toFixed(2));
        // this.totalexpense = Number(Math.abs(this.Expenses[this.Expenses?.length - 1]?.amount).toFixed(2));
        // this.netLoss = Math.abs(Number((Number(this.totalincome) - Number(this.totalexpense)).toFixed(2)));

        this.isShow = false;
        const container = document.querySelector('#example1');
        const hot = new Handsontable(container, {
          data: this.sourceDataObject2,
          preventOverflow: 'horizontal',
          rowHeaders: true,
          stretchH: 'all',
          // colWidths: [100, 100, 300, 200, 200, 200],
          colHeaders: [
            'Main Head',
            'Head',
            'SubHead',
            'AccName',
            'Credit',
            'Debit',
            'Amount',
          ],
          nestedRows: true,
          contextMenu: true,
          bindRowsWithHeaders: true,
          licenseKey: 'non-commercial-and-evaluation',
        });
      });
  }

  transformDataForHandsontable(data: any['result']): any[] {
    const transformedData = [];

    data.incomeDetails.forEach((item) => {
      transformedData.push([
        'Income',
        item.head,
        item.subHead,
        item.accName,
        item.credit,
        item.debit,
        item.credit - item.debit,
      ]);
    });
    transformedData.push(['', '', '', '', '', '', '']);
    data.totalSalesCredit = 0;
    data.totalSalesDebit = 0;
    data.incomeDetails.forEach((item) => {
      (data.totalSalesCredit += item.credit),
        (data.totalSalesDebit += item.debit);
    });
    data.totalIncome = 0;
    data.totalIncome = data.totalSalesCredit - data.totalSalesDebit;

    transformedData.push([
      'Total Income',
      '',
      '',
      '',
      '',
      '',
      data.totalIncome,
    ]);

    data.totalcostCredit = 0;
    data.totalcostDebit = 0;
    transformedData.push(['', '', '', '', '', '', '']);
    data.expenseDetails.forEach((item) => {
      if (item.accName == 'Cost of Goods  Sold') {
        transformedData.push([
          'Expense',
          item.head,
          item.subHead,
          item.accName,
          item.credit,
          item.debit,
          item.debit - item.credit,
        ]);

        data.totalcostCredit += item.credit;
        data.totalcostDebit += item.debit;
      }
    });

    data.totalCostAndSold = 0;
    data.totalCostAndSold = data.totalcostDebit - data.totalcostCredit;
    transformedData.push(['', '', '', '', '', '', '']);
    transformedData.push([
      'Total Cost of Goods  Sold',
      '',
      '',
      '',
      '',
      '',
      data.totalCostAndSold,
    ]);

    transformedData.push(['', '', '', '', '', '', '']);

    data.totalExpenseCredit = 0;
    data.totalExpenseDebit = 0;
    data.expenseDetails.forEach((item) => {
      if (item.accName != 'Cost of Goods  Sold') {
        transformedData.push([
          'Expense',
          item.head,
          item.subHead,
          item.accName,
          item.credit,
          item.debit,
          item.debit - item.credit,
        ]);
        data.totalExpenseCredit += item.credit;
        data.totalExpenseDebit += item.debit;
      }
    });

    data.totalExpense = 0;
    data.totalExpense = data.totalExpenseDebit - data.totalExpenseCredit;
    transformedData.push(['', '', '', '', '', '', '']);

    transformedData.push([
      'Total Expense',
      '',
      '',
      '',
      '',
      '',
      data.totalExpense,
    ]);

    transformedData.push(['', '', '', '', '', '', '']);
    transformedData.push([
      ' Net Profit & Loss ',
      '',
      '',
      '',
      '',
      '',
      data.totalIncome - data.totalCostAndSold - data.totalExpense,
    ]);

    // transformedData.push([
    //   'Total Sales Return',
    //   '',
    //   '',
    //   '',
    //   data.totalSalesReturnCredit,
    //   data.totalSalesReturnDebit,
    //   data.totalSalesReturnCredit - data.totalSalesReturnDebit,
    // ]);

    return transformedData;
  }

  transformData(data: any[]): any[] {
    let transformedData: any[] = [];

    let currentMainHead: string | null = null;

    for (const entry of data) {
      const Head = entry.head.split(' '); // Assuming 'category' determines 'Main Head'

      if (Head[1] == 'Income') {
        // Insert an empty row with the new "Main Head"
        transformedData.push({
          'Main Head': Head[1],
          Head: '',
          SubHead: '',
          AccName: '',
          Credit: '',
          Debit: '',
          Amount: '',
        });
        // currentMainHead = Head[1];
      } else if (Head[1] == 'Expenses') {
        transformedData.push({
          'Main Head': Head[1],
          Head: '',
          SubHead: '',
          AccName: '',
          Credit: '',
          Debit: '',
          Amount: '',
        });
        // currentMainHead = Head[1];
      }

      transformedData.push({
        'Main Head': '',
        Head: entry['head'],
        SubHead: entry['subHead'],
        AccName: entry['accName'],
        Credit: entry['credit'],
        Debit: entry['debit'],
        Amount: entry['amount'],
      });
    }

    return transformedData;
  }

  GetGridListDataMonthly(event: any) {
    (this.printType = 'printMonthWise'),
      (document.getElementById('example1').innerHTML = '');
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
      fromdate: this.startDate,
      todate: this.endDate,
    };

    this.misService
      .GetAccountTransactionsProfitLossPrintMonthly(this.state)
      .subscribe((response: any) => {
        console.log('responsemonth : ', response);
        this.stationmasterObj = response.result;
        this.Expenses = response.result?.expenses;
        this.incomes = response.result?.incomes;
        // this.totalincome = Number(Math.abs(this.sourceDataObject[this.sourceDataObject?.length - 1]?.amount).toFixed(2));
        // this.totalexpense = Number(Math.abs(this.Expenses[this.Expenses?.length - 1]?.amount).toFixed(2));
        this.netLoss = Math.abs(
          Number(
            (Number(this.totalincome) - Number(this.totalexpense)).toFixed(2)
          )
        );
        this.sourceDataObject.forEach((element) => {
          // this.totalexpense+=Number(element?.totalIncome)
          // this.totalincome+=Number(element?.totalExpense)
        });
        // }
        this.dataset = response.result?.incomes;
        this.dataset1 = response.result?.expenses;
        this.displayPrintPreviewMW = true;
        let settings: Handsontable.GridSettings = {
          columns: [
            {
              data: 'accName',
              type: 'text',
            },
            {
              data: 'accNo',
              type: 'text',
            },
            {
              data: 'jan',
              type: 'text',
            },
            {
              data: 'feb',
              type: 'text',
            },
            {
              data: 'march',
              type: 'text',
            },
            {
              data: 'april',
              type: 'text',
            },
            {
              data: 'may',
              type: 'text',
            },
            {
              data: 'june',
              type: 'text',
            },
            {
              data: 'july',
              type: 'text',
            },
            {
              data: 'aug',
              type: 'text',
            },
            {
              data: 'sept',
              type: 'text',
            },
            {
              data: 'oct',
              type: 'text',
            },
            {
              data: 'nov',
              type: 'text',
            },
            {
              data: 'dec',
              type: 'text',
            },
            {
              data: 'total',
              type: 'text',
            },
          ],
          colHeaders: [
            this.translate.instant('A/C Name'),
            this.translate.instant('Acc No'),
            this.translate.instant('Jan'),
            this.translate.instant('Feb'),
            this.translate.instant('March'),
            this.translate.instant('April'),
            this.translate.instant('May'),
            this.translate.instant('June'),
            this.translate.instant('July'),
            this.translate.instant('Aug'),
            this.translate.instant('Sept'),
            this.translate.instant('Oct'),
            this.translate.instant('Nov'),
            this.translate.instant('Dec'),
            this.translate.instant('Total'),
          ],
          data: response.returnObject?.incomes,
        };
        this.hotRegisterer.getInstance(this.hotid).updateSettings(settings);
      });
  }

  GetGridListDataPrintSimple(event: any) {
    (this.printType = 'printsimple'),
      (document.getElementById('example1').innerHTML = '');
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
      fromdate: this.startDate,
      todate: this.endDate,
    };
    this.misService
      .GetAccountTransactionsProfitLossPrintSimple(this.state)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid) {
          this.simple = response.result;
          response.result?.incomeDetails.forEach((e: any) => {
            this.totalincomecredit += e.credit;
            this.totalincomedebit += e.debit;
          });
          response.result?.expenseDetails.forEach((e: any) => {
            this.totalexpensecredit += e.credit;
            this.totalexpensedebit += e.debit;
          });
          this.stationmasterArray = response.result;
          this.sourceDataObject2 = this.transformDataForHandsontable(
            response.result
          );

          this.dataset = response.result?.incomes;
        }
      });
    this.dispalyMonthpreviewsimple = true;
  }

  GetGridListDataPrintSummary(event: any) {
    (this.printType = 'printsummary'),
      (document.getElementById('example1').innerHTML = '');
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
      fromdate: this.startDate,
      todate: this.endDate,
    };
    this.misService
      .GetAccountTransactionsProfitLossPrintSummary(this.state)
      .subscribe((response: any) => {
        // if (response?.result?.incomes.length > 0) {
        this.stationmasterObj = response.result;
        this.summary = response.result;
        this.Expenses = response.result?.expenses;
        this.incomes = response.result?.incomes;
        this.dataset = response.result?.incomes;

        this.dispalyMonthpreviewsummary = true;
      });
  }

  currentDate: any;
  //////////////  Printing Starts Here  ////////////
  totalexpense: number = 0;
  totalincome: number = 0;
  netLoss: number = 0;
  displayPrintPreviewMW: boolean = false;
  dispalyMonthpreviewsummary: boolean = false;
  displayPrint() {
    // this.dispalyMonthpreviewsummary = false;
    // this.displayPrintPreview = false;
    // this.displayPrintPreviewMW = false;
    // alert(this.printType)
    this.currentDate = String(new Date()).replace('GMT+0500', ' ');
    // if (this.printType == 'printMonthWise')
    //   this.displayPrintPreviewMW = true;
    // else if (this.printType == 'printsummary')
    //   this.dispalyMonthpreviewsummary = true;
    // else
    // if (this.printType == 'printsimple')
    //   this.dispalyMonthpreviewsimple = true;
    // else
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
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  printAsPDF() {
    let html: any;
    if (this.printType == 'printMonthWise')
      html = document.getElementById('printMonth');
    else if (this.printType == 'printsummary')
      html = document.getElementById('printsummary');
    else if (this.printType == 'print') html = document.getElementById('print');
    else this.printService.saveAsPDF(html);
    html = document.getElementById('printsimple');
    {
      const fileName = String(new Date().valueOf());
      var css: string = `
      h1 {
        margin-top: 2%;
        color: rgb(10, 22, 10);
        text-align: center;
        margin-bottom: 2%;
    }

    h2 {
        font-size: 1.2rem;
        padding-left: 7%;
        margin-top: 0%;
    }

    h3 {
        text-align: center;
        padding-top: 5%;
        font-size: 1.5rem;
        text-decoration: underline rgb(187, 11, 11);
        color: rgb(187, 11, 11);
        margin-bottom: .5%;
    }

    h4 {
        text-align: center;
        color: rgb(187, 11, 11);
        margin-top: 0%;
        font-size: 1.2rem;
    }

    table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 90%;
        margin-left: 5%;
    }

    td,
    th {
        border: 4px solid white;
        text-align: left;
        padding: 8px;
    }

    tr:nth-child(even) {
        background-color: #dddddd;
    }

    .aa {
        background-color: rgb(34, 107, 107);
        color: white;

    }

    .bb {
        background-color: rgb(27, 120, 47);
        color: white;
        text-align: right;
    }

    .cc {
        background-color: rgb(163, 24, 35);
        color: white;
        text-align: right;
    }

    .dd {
        background-color: rgb(23, 7, 114);
        color: white;
        text-align: right;
        margin-bottom: 2%;
    }

    .aac {
        text-align: center;
        margin-top: .5%;
        color: rgb(255, 255, 255);
        background-color: rgb(15, 100, 100);
    }

    .abc {

        font-family: arial, sans-serif;
        border-collapse: collapse;
        color: rgb(8, 6, 6);
        background-color: rgb(244, 244, 244);
    }

    .bbc {

        font-family: arial, sans-serif;
        border-collapse: collapse;
        color: rgb(255, 255, 255);
        background-color: rgb(15, 100, 100);
    }

    .aad {
        text-align: center;
        margin-top: .5%;
        color: rgb(255, 255, 255);
        background-color: rgb(15, 100, 100);
    }

    .abe {

        font-family: arial, sans-serif;
        border-collapse: collapse;
        color: rgb(8, 6, 6);
        background-color: rgb(244, 244, 244);
    }

    .abg {

        font-family: arial, sans-serif;
        border-collapse: collapse;
        color: rgb(8, 6, 6);
        background-color: rgb(244, 244, 244);
    }

    .bbf {

        font-family: arial, sans-serif;
        border-collapse: collapse;
        color: rgb(255, 255, 255);
        background-color: rgb(15, 100, 100);
    }

    .total {
        margin-top: 2%;
        background-color: beige;
        border: 1px solid rgb(216, 207, 207);
        width: 35%;
        height: 9%;
        margin-left: 59%;
        border-right: 5px solid rgb(216, 207, 207);
        border-bottom: 5px solid rgb(216, 207, 207);

    }

    .income {
        color: green;
        padding-left: 2%;
    }

    .expanse {
        color: red;
        padding-left: 2%;
    }

    .net {
        padding-left: 2%;
        margin-top: 4%;
        background-color: rgb(7, 84, 79);
        border: 1px solid rgb(4, 51, 52);
        width: 33%;
        height: 4%;
        margin-left: 59%;
        border-right: 5px solid rgb(5, 142, 132);
        border-bottom: 5px solid rgb(5, 142, 132);
        color: white;
        font-size: 1.2rem;

    }

    .month {
        border: dotted 1px rgb(180, 176, 176);
        width: 90%;
        margin-left: 5%;

    }

    .MPL {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 90%;
        margin-left: 5%;
        margin-top: 2%;
    }

    .MPL td,
    .MPL th {
        border: 1px solid #0c0a0a;
        padding: 10px;
    }

    .MPL tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    .MPL tr:hover {
        background-color: #ddd;
    }

    .MPL th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #f0f074;
        color: rgb(7, 7, 7);
        text-align: center;
    }

    .PLM {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 60%;
        margin-left: 5%;
        margin-top: 2%;
    }

    .PLM td,
    .PLM th {
        border: 1px solid #0c0a0a;
        padding: 10px;
    }

    .PLM tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    .PLM tr:hover {
        background-color: #ddd;
    }

    .PLM th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: rgb(238, 238, 127);
        color: rgb(7, 7, 7);
        text-align: center;
    }

    .exp {
        color: #ddd;
        background-color: red;

    }

    .inc {
        color: #ddd;
        background-color: green;
    }

    .sim {
        background-color: blue;
    }
    `;
      var data = document.getElementById('printsimple');
      this.printService.PrintPDF('printsimple', css);
      var data = document.getElementById('printsummary');
      this.printService.PrintPDF('printsummary', css);
      var data = document.getElementById('printMonth');
      this.printService.PrintPDF('printMonth', css);
      var data = document.getElementById('print');
      // let html: any = document.getElementById('print');
      // this.printService.saveAsPDF(data, 'saleVoucherPDF');
      this.printService.PrintPDF('print', css);

      this.userTrackingLog('PDF');
    }
  }
  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  getAllStationMaster() {
    this.masterApi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
  }
  Clear() {
    const container = document.querySelector('#example1');
    if (container) {
      container.innerHTML = '';
    }
    this.isShow = true;
  }


  printSimpleReport() {
    var daterange  = this.isDate ? this.GetDate(this.startDate) +' To ' + this.GetDate(this.endDate) : this.GetDate(new Date(this.financialStartDate)) +' To '+ this.GetDate(new Date(this.financialEndDate))
    this.rptFilter = {
      ReportName: 'ProfitAndLoss',
      SelectionFormula: "",
      Parameters: [
        {
          Key: "PeriodRange",
          Value:  daterange
        }
      ],
      Queries: ["SELECT *  FROM temp_profitandloss","select * from CompanyMaster"],
      SP_Queries: [{
        "SP_Name": "SP_ProfitAndLoss",
        "Parameters": [
          {
            Key: "@FromDate",
            Value: this.isDate ? this.GetDate(this.startDate): this.GetDate(new Date(this.financialStartDate))
          },
          {
            Key: "@FNO",
            Value: "1"
          },
          {
            Key: "@ToDate",
            Value: this.isDate ? this.GetDate(this.endDate) :this.GetDate(new Date(this.financialEndDate))
          }

        ]
      }],
      ExportType: ExportFormatType.PortableDocFormat
    };
    this.crystalReportService.downloadReport(this.rptFilter)
    .subscribe((response) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      this.pdfSource = URL.createObjectURL(blob);
      window.open(this.pdfSource);
    });

  }
  

}