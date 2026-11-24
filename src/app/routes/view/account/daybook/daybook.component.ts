import { HttpResponse } from '@angular/common/http';
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
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { defaults } from 'src/app/shared/service/settings';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import * as XLSX from 'xlsx';
import { MenuItem } from 'primeng';
@Component({
  selector: 'app-daybook',
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.scss'],
})
export class DaybookComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  totalRecords: number = 0;
  cols: any[] = [];
  Date: Date;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  DBform: FormGroup;
  index: number = 0;
  startDate: any = this.GetLastYearDate(new Date());
  endDate: Date = new Date();
  state: any;
  search: any;
  filter: any;
  timer: any;
  typeDate: string = 'Date';
  displayPrintPreview: boolean = false;
  dateFormat: string = 'dd/mm/yy';
  ScreenId: number;
  Permission: any;
  isByDate: boolean = false;
  handleChange(e) {
    this.index = e.index;
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private utilityService: UtilityService,
    private accService: AccountstatementService,
    private masterApi: MasterApiService,
    private permission: PermissionsService,

    private crystalReportService: CrystalReportService
  ) {}

  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 1);
    return new Date(date.toDateString());
  }

  changeDateFormat(format: string) {
    this.startDate = new Date();
    this.endDate = new Date();
    this.dateFormat = format;
  }
  printbtn: MenuItem[];
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Day Book') {
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
    this.printbtn = [
      {
        label: 'PDF',
        command: () => {
          this.displayPrint('pdf');
        },
      },
      {
        label: 'Excel',
        command: () => {
          this.displayPrint('excel');
        },
      },
    ];
    this.cols = [
      { field: 'accountsTransactionsTransDateString', header: 'Date' },
      { field: 'accountsTransactionsVoucherNo', header: 'Voucher No' },
      { field: 'accountsTransactionsVoucherType', header: 'Voucher Type' },
      { field: 'accountsTransactionsDescription', header: 'Description' },
      { field: 'costCenterName', header: 'Cost Center' },
      { field: 'jobName', header: 'Job' },
      { field: 'accountsTransactionsParticulars', header: 'Particulars' },
      { field: 'accountsTransactionsDebit', header: 'Debit' },
      { field: 'accountsTransactionsCredit', header: 'Credit' },
    ];
    this.DBform = new FormGroup({
      DateTO: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      DateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
  }
  get f() {
    return this.DBform.controls;
  }

  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    // Use a standard date format "dd-MM-yyyy"
    let returnDate = `${dd}-${mm}-${yyyy}`;
    return returnDate;
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

  ApplyAllFilter() {
    let query = '';
    query += this.DateRangeFilter();
    this.filter = query;
    this.GetGridListData(null);
  }

  DateRangeFilter() {
    let queryString: string = '&& (';
    let min = this.GetDate(this.startDate);
    let max = this.GetDate(this.endDate);
    if (this.startDate) {
      queryString +=
        ` (AccountsTransactionsTransDate >= DateTime.ParseExact("` +
        min +
        `", "dd-MM-yyyy", null))`;
    }
    if (this.endDate) {
      queryString +=
        ` && (AccountsTransactionsTransDate <= DateTime.ParseExact("` +
        max +
        `", "dd-MM-yyyy", null))`;
    }

    return queryString + ' )';
  }

  GetGridListData(event: any) {
    const field =
      event != null
        ? event.sortField != null && event.sortField != ''
          ? event.sortField
          : 'AccountsTransactions_TransSno'
        : 'AccountsTransactions_TransSno';
    const dir =
      event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc';
    const skip = event != null ? (event.first != null ? event.first : 0) : 0;
    const take = event != null ? (event.rows != null ? event.rows : 10) : 10;

    // Build payload with lowercase keys to match API expectation
    const payload = {
      skip: skip,
      take: take,
      field: field,
      dir: dir,
      search: this.search ?? '',
      filter: this.filter ?? '',
      total: 0,
      extension: null,
      formatType: null,
      isDate: this.isByDate,
      fromDate: this.startDate ? new Date(this.startDate).toISOString() : null,
      toDate: this.endDate ? new Date(this.endDate).toISOString() : null,
      voucherType: [],
      accounts: [],
      showUnallocated: true,
    };

    // reset totals before calculating
    this.totaldebit = 0;
    this.totalcredit = 0;
    this.dataset = [];
    this.accService.GetDaybookAccountTransactions(payload).subscribe(
      (response: ApiResponse<any>) => {
        if (response.valid && response.result?.data?.details?.length > 0) {
          this.dataset = response.result?.data.details;
          this.totalRecords = response.result?.total;
          this.dataset.forEach((element) => {
            element.accountsTransactionsTransDateString = this.GetDate(
              new Date(element?.accountsTransactionsTransDateString)
            );
            this.totaldebit += Number(element?.accountsTransactionsDebit) || 0;
            this.totalcredit +=
              Number(element?.accountsTransactionsCredit) || 0;
          });
          this.totalcredit = Number(this.totalcredit.toFixed(2));
          this.totaldebit = Number(this.totaldebit.toFixed(2));
        } else {
          // ensure UI clears when no data
          this.dataset = [];
          this.totalRecords = 0;
          this.totaldebit = 0;
          this.totalcredit = 0;
        }
      },
      () => {
        // on error, clear dataset and totals
        this.dataset = [];
        this.totalRecords = 0;
        this.totaldebit = 0;
        this.totalcredit = 0;
      }
    );
  }

  DownloadDaybook(event, type) {
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
    }; //"wwwroot/SiteDocument/SiteDemo1/FileDocument.doc" static file path
    this.accService.DownloadDaybookAccount(this.state).subscribe((event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      console.log('ddd', downloadedFile);
      if (downloadedFile.type != '') {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = 'Daybook';
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }
  currentDate: Date = new Date();
  //////////////  Printing Starts Here  ////////////
  totaldebit: number = 0;
  totalcredit: number = 0;

  rptFilter: ReportFilterModel;
  pdfSource: any;

  displayPrint(type) {
    this.rptFilter = {
      ReportName: 'DayBook',
      SelectionFormula: '',
      Parameters: [],
      Queries: [`select * from vw_daybook`],
      SP_Queries: [],
      ExportType:
        type === 'pdf'
          ? ExportFormatType.PortableDocFormat
          : ExportFormatType.ExcelWorkbook,
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response: BlobPart) => {
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
  }

  userTrackingLog(type) {
    let req = {
      page: 'Day Book Printing',
      section: this.dataset,
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

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  getAllStationMaster() {
    this.masterApi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
      console.log(this.stationmasterObj);
    });
  }
}
