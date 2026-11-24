import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MenuItem } from 'primeng/api/menuitem';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MISService } from 'src/app/routes/service/mis/mis.service';
import { defaults } from 'src/app/shared/service/settings';
import { MessageService } from 'primeng/api';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { TrialBalanceReportFilter } from 'src/app/routes/domain/MIS/TrialBalanceReportFilter';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';

@Component({
  selector: 'app-trial-balance',
  templateUrl: './trial-balance.component.html',
  styleUrls: ['./trial-balance.component.scss'],
  providers: [MessageService],
})
export class TrialBalanceComponent implements OnInit {
  ScreenId: number;
  Permission: any;
  title: string;
  subtitle: string;
  cols: Array<any>;
  isChecked: boolean = false;
  breadcumbmodel: MenuItem[];
  location: Array<string>;
  supplier: Array<string>;
  dataset: any;
  licensekey: any;
  gridHeader: string;
  trialArray: Array<string>;
  invoiceType: Array<{ value: string }>;
  index: number = 0;
  TForm: FormGroup;
  state: any;
  isDate: boolean = true;
  financialStartDate: Date = new Date();
  financialEndDate: Date = new Date();
  startDate: any = this.GetLastYearDate(new Date());
  endDate: Date = new Date();
  search: any;
  filter: any;
  displayPrintPreview: boolean = false;

  // rdSummary: boolean = false;
  // rdDetails: boolean = false;
  // rdGroup: boolean = false;
  isHideZeroTransaction: boolean = false;
  costCenterSelectedValue: any;

  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 1);
    return new Date(date.toDateString());
  }
  handleChange(e) {
    this.index = e.index;
  }
  sourceDataObject = [
    {
      head: 'Best Rock Performance',
      subHead: null,
      accName: null,
      credit: null,
      debit: null,
      amount: null,
      __children: [],
    },
  ];
  hotid = 'TrialBalance';
  private hotRegisterer = new HotTableRegisterer();
  TrialBalance: Handsontable.GridSettings;
  selectedView: string = 'Summary';
  initializeControls() {
    this.TrialBalance = {
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
          data: 'A/C Name',
          type: 'text',
          readOnly: true,
          width: 120,
        },
        {
          data: 'Open Balance',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          readOnly: true,
          width: 80,
        },
        {
          data: 'Total Debit',
          type: 'numeric',
          numericFormat: { pattern: '0.00' },
          editor: 'numeric',
          width: 80,
          readOnly: true,
        },
        {
          data: 'Total Credit',
          type: 'numeric',
          numericFormat: { pattern: '0.00' },
          editor: 'numeric',
          readOnly: true,
          width: 80,
        },
        {
          data: 'Clos. Balance',
          type: 'numeric',
          numericFormat: { pattern: '0.00' },
          editor: 'numeric',
          readOnly: true,
          width: 80,
        },
      ],
      colHeaders: [
        this.translate.instant('A/C Name'),
        this.translate.instant('Open Balance'),
        this.translate.instant('Total Debit'),
        this.translate.instant('Total Credit'),
        this.translate.instant('Clos. Balance'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  rptFilter: ReportFilterModel;
  costCenterList: Array<CostCenterMaster>;
  constructor(
    private activatedroute: ActivatedRoute,
    private masterapi: MasterApiService,
    private translate: TranslateService,
    private misService: MISService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private service: MISService,
    private messageService: MessageService,
    private masterApi: MasterApiService,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService
  ) { }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
      console.log(this.stationmasterObj);
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Trial Balance') {
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
    this.TForm = new FormGroup({
      DateFrom: new FormControl('', Validators.required),
      DateTo: new FormControl('', Validators.required),
      CostCenter: new FormControl('', Validators.required),
    });
    this.trialArray = [];
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });

    this.getAllCostCenter();
    this.GetFinancialYear();
    this.getReportType();
    this.initializeControls();
    this.showReport();
  }

  printbtn: MenuItem[];
  getReportType() {
    this.masterapi.General('trialBalance').subscribe((res: any) => {
      this.printbtn = res.map((r: any) => ({
        label: r.reportTypeDescription,
        command: () => this.printSimpleReport(r.reportTypeFileName),
      }));
    });
  }

  pdfSource: any;
 printSimpleReport(type) {
    const currentDate = new Date(); // Added to represent "as of today"

    var daterange = this.isDate
      ? 'For the Period From ' +
      this.GetDateFormatted(this.startDate) +
      ' To ' +
      this.GetDateFormatted(this.endDate)
      : 'For the Period From ' +
      this.GetDateFormatted(new Date(this.financialStartDate)) +
      ' To ' +
      this.GetDateFormatted(currentDate); // Updated

    this.rptFilter = {
      ReportName: type,
      SelectionFormula: '',
      Parameters: [
        {
          Key: 'Head1',
          Value: this.stationmasterObj.stationMasterStationName,
        },
        {
          Key: 'PeriodRange',
          Value: daterange,
        },
        {
          Key: 'InvDes',
          Value: this.selectedView,
        },
        {
          Key: 'Tele',
          Value: 'Tel: ' + this.stationmasterObj.stationMasterTele1,
        },
        {
          Key: 'Address',
          Value: this.stationmasterObj?.stationMasterAddress,
        },
      ],
      Queries: [],
      SP_Queries: [
        {
          SP_Name: 'usp_GetTrialBalance_Advanced',
          Parameters: [
            {
              Key: '@FromDate',
              Value: this.isDate
                ? this.GetDate(this.startDate)
                : this.GetDate(new Date(this.financialStartDate)),
            },
            {
              Key: '@ToDate',
              Value: this.isDate
                ? this.GetDate(this.endDate)
                : this.GetDate(currentDate), // Updated
            },
            {
              Key: '@CostCenterId',
              Value: this.costcenter?.costCenterMasterCostCenterId ?? null,
            },
            {
              Key: '@IncludeZero',
              Value: `${this.isChecked}`,
            },
            {
              Key: '@IsSummaryView',
              Value: `${this.selectedView == 'Summary' ? 1 : 0}`,
            },
            {
              Key: '@IsFullYear',
              Value: `0`,
            },
          ],
        },
      ],
      ExportType: ExportFormatType.PortableDocFormat,
    };
    this.crystalReportService
      .downloadReport(this.rptFilter)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  getAllCostCenter() {
    this.masterApi.GetAllCostCenter().subscribe((response) => {
      this.costCenterList = response;
      console.log(response);
    });
    this.initializeControls();
  }

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

  get f() {
    return this.TForm.controls;
  }

  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }

  GetDateFormatted(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const mm = monthNames[date.getMonth()]; // Get short month name
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
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
    if (this.selectedView === 'Summary') {
      this.misService
        .GetAccountTransactionsTrialBalance(this.state, 'TrailBalanceSummary')
        .subscribe((response: ApiResponse<any>) => {
          if (response.result.data.length > 0) {
            this.sourceDataObject = response.result.result.data;

            this.GetTable();
          }
        });
    } else if (this.selectedView === 'Detailed') {
      this.misService
        .GetAccountTransactionsTrialBalance(
          this.state,
          'TrailBalanceDetailedView'
        )
        .subscribe((response: ApiResponse<any>) => {
          if (response.result.data.length > 0) {
            this.sourceDataObject = response.result.result.data;

            this.GetTable();
          }
        });
    } else if (this.selectedView === 'Group') {
      this.misService
        .GetAccountTransactionsTrialBalance(this.state, 'TrailBalanceGroupView')
        .subscribe((response: ApiResponse<any>) => {
          if (response.result.data.length > 0) {
            this.sourceDataObject = response.result.result.data;

            this.GetTable();
          }
        });
    }
  }

  cancel() {
    this.sourceDataObject = [];
    this.TForm.reset();
  }

  GetTable() {
    document.getElementById('example1').innerHTML = '';

    const container = document.querySelector('#example1') as HTMLElement; // Type assertion
    container.style.width = '100%'; // Set container width

    if (this.selectedView === 'Summary') {
      const hot = new Handsontable(container, {
        data: this.sourceDataObject,
        width: '100%',
        preventOverflow: 'horizontal',
        rowHeaders: true,
        colWidths: [200, 200, 300, 200, 200, 200],
        hiddenColumns: {
          columns: [2],
          indicators: true,
        },
        nestedHeaders: [
          [
            {
              label: 'Head',
              colspan: 2,
            },
            'AccName',
            'Debit',
            'Credit',

            'Amount',
          ],
        ],
        columns: [
          { data: 'head' }, // AccName (colspan includes two columns)
          { data: 'subHead' },
          { data: 'accName' },
          // Credit column
          {
            data: 'totalDebit',
            type: 'numeric',
            numericFormat: { pattern: '0.00' },
            editor: 'numeric',
            className: 'htRight',
          },
          {
            data: 'totalCredit',
            type: 'numeric',
            numericFormat: { pattern: '0.00' },
            editor: 'numeric',
            className: 'htRight',
          }, // Debit column
          {
            data: 'openBalance',
            type: 'numeric',
            numericFormat: { pattern: '0.00' },
            editor: 'numeric',
            className: 'htRight',
          }, // Amount column
        ],
        readOnly: true,
        nestedRows: true,
        contextMenu: true,
        bindRowsWithHeaders: true,
        licenseKey: 'non-commercial-and-evaluation',
      });
    } else {
      const hot = new Handsontable(container, {
        data: this.sourceDataObject,
        width: '100%',
        preventOverflow: 'horizontal',
        rowHeaders: true,
        colWidths: [200, 200, 300, 200, 200, 200],
        readOnly: true,
        hiddenColumns: {
          columns: [],
          indicators: true,
        },
        nestedHeaders: [
          [
            {
              label: 'Head',
              colspan: 2,
            },
            'AccName',
            'Debit',
            'Credit',

            'Amount',
          ],
        ],
        columns: [
          { data: 'head' }, // AccName (colspan includes two columns)
          { data: 'subHead' },
          { data: 'accName' },
          {
            data: 'totalDebit',
            type: 'numeric',
            numericFormat: { pattern: '0.00' },
            editor: 'numeric',
            className: 'htRight',
          }, // Debit column
          {
            data: 'totalCredit',
            type: 'numeric',
            numericFormat: { pattern: '0.00' },
            editor: 'numeric',
            className: 'htRight',
          }, // Credit column

          {
            data: 'openBalance',
            type: 'numeric',
            numericFormat: { pattern: '0.00' },
            editor: 'numeric',
            className: 'htRight',
          }, // Amount column
        ],
        nestedRows: true,
        contextMenu: true,
        bindRowsWithHeaders: true,
        licenseKey: 'non-commercial-and-evaluation',
      });
    }
  }

  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  userTrackingLog(type) {
    let req = {
      page: 'Recipt Voucher Printing',
      // section: this.receiptVoucherarry,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: '',
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  costcenter: any;
  showReport() {
    let payLoad: TrialBalanceReportFilter = {
      fromDate: this.GetDate(this.startDate),
      toDate: this.GetDate(this.endDate),
      formate: '1',
      TotalCount: 0,
      Query: '',
      Serach: '',
      CostCenter: this.costcenter?.costCenterMasterCostCenterId.toString(),
      HideZeroTransactions: this.isChecked,
      PrintGroupWise: '',
    };
    if (this.selectedView === '') {
      console.log('need to show message');
      this.showMessage(
        'error',
        'Error',
        'At least one radio button should be checked'
      );
      return;
    }
    if (this.selectedView === 'Detailed') {
      this.GetReportGroupDetails(payLoad);
    } else if (this.selectedView === 'Group') {
      this.getReportByGroupSummary(payLoad);
    } else if (this.selectedView === 'Summary') {
      this.GetReportGroupHeadSummary(payLoad);
    }
  }

  getReportByGroupSummary(payLoad: TrialBalanceReportFilter) {
    this.service
      .GetTrialBalanceGroupView(payLoad)
      .subscribe((res: ApiResponse<any>) => {
        this.sourceDataObject = res.result.data;
        this.GetTable();
      });
  }

  GetReportGroupDetails(payLoad: TrialBalanceReportFilter) {
    try {
      this.service
        .GetTrialBalanceDetailedView(payLoad)
        .subscribe((res: ApiResponse<any>) => {
          console.log(res);
          this.sourceDataObject = res.result.data;
          this.GetTable();
        });
    } catch (e) {
      this.showMessage(
        'inof',
        'Information',
        'Data not found OR API services is down.'
      );
    }
  }

  GetReportGroupHeadSummary(payLoad: TrialBalanceReportFilter) {
    this.service
      .GetTrialBalanceSummary(payLoad)
      .subscribe((res: ApiResponse<any>) => {
        this.sourceDataObject = res.result.data;
        this.GetTable();
      });
  }

  GetReportGroupSummaryWithZeroBalance(payLoad: TrialBalanceReportFilter) {
    this.service
      .GetReportGroupSummary(payLoad)
      .subscribe((res: ApiResponse<any>) => {
        this.sourceDataObject = res.result.data;
        this.GetTable();
      });
  }

  GetReportGroupHeadSummaryWithZeroBalance(payLoad: TrialBalanceReportFilter) {
    this.service
      .GetReportGroupSummary(payLoad)
      .subscribe((res: ApiResponse<any>) => {
        this.sourceDataObject = res.result.data;
        this.GetTable();
      });
  }

  getFormat() {
    return '1';
  }

  // rdSummaryFocused() {
  //   this.rdSummary = true;
  //   this.rdDetails = false;
  //   this.rdGroup = false;
  //   this.sourceDataObject =[]
  // }

  // rdDetailsFocused() {
  //   this.rdSummary = false;
  //   this.rdDetails = true;
  //   this.rdGroup = false;
  //   this.sourceDataObject =[]
  // }

  // rdGroupFocused() {
  //   this.rdSummary = false;
  //   this.rdDetails = false;
  //   this.rdGroup = true;
  //   this.sourceDataObject =[]
  // }

  showMessage(_severity: string, _summary: string, _detail: string) {
    console.log('Show Message called');
    this.messageService.add({
      severity: _severity,
      summary: _summary,
      detail: _detail,
    });
  }
}
