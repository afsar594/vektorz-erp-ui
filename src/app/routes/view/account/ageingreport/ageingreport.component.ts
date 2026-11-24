import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MenuItem } from 'primeng';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { ExportFormatType } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { PdfExportService } from 'src/app/shared/service/pdf-export.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-ageingreport',
  templateUrl: './ageingreport.component.html',
  styleUrls: ['./ageingreport.component.scss']
})
export class AgeingreportComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  keyword: string = "";
  location: Array<string>;
  supplier: Array<string>;
  licensekey: any;
  gridHeader: string;
  assetsArray: Array<string>;
  invoiceType: Array<{ value: string }>;
  ARform: FormGroup;
  index: number = 0;
  state: {
    Dir?: string;
    Field?: any;
    Skip?: any;
    Take?: any;
    Search?: any;
    Filter?: any;
    ToDate?: any;
    ShowUnallocated?: boolean;
    ASONDate?: Date;
    ReportType?: string;
    NameLike?: string;
  };
  // filter: any;
  selectedcustomer: string = `Receivable`; // Default to Customers
  customer: any[] = [{ label: "Customers", value: `Receivable` }, { label: "Suppliers", value: `Payable` }];
  showUnallocated: boolean = false;
  selectedAsOnDate: Date = new Date();
  pdfSource: string;
  ScreenId: number;
  Permission: any;
  companyDetails: any;
  handleChange(e) {
    this.index = e.index;
  }


  loading: boolean = false;
  ZeroToThirty: number = 0;
  ThirtyOneToSixty: number = 0;
  SixtyOneToNinety: number = 0;
  NinetyOneToOneEighty: number = 0;
  OneEightyToThreeSixty: number = 0;
  aboveThreeSixty: number = 0;

  get totalZeroThirty(): number {
    return (this.dataset || []).reduce((acc, row) => acc + this.toAmount(row.zeroThirty), 0);
  }

  get totalThirtyOneSixty(): number {
    return (this.dataset || []).reduce((acc, row) => acc + this.toAmount(row.thirtyOneSixty), 0);
  }

  get totalSixtyOneNinety(): number {
    return (this.dataset || []).reduce((acc, row) => acc + this.toAmount(row.sixtyOneNinety), 0);
  }

  get totalNinetyOneToOneEighty(): number {
    return (this.dataset || []).reduce((acc, row) => acc + this.toAmount(row.ninetyOneToOneEighty), 0);
  }

  get totalOneEightOneToThreeSixty(): number {
    return (this.dataset || []).reduce(
      (acc, row) => acc + this.toAmount(row.oneEightyOneToThreeSixty ?? row.oneEightOneToThreeSixty ?? row.oneEightOneToTwoSeventy),
      0
    );
  }

  get totalOverThreeSixty(): number {
    return (this.dataset || []).reduce((acc, row) => acc + this.toAmount(row.overThreeSixty), 0);
  }

  get totalOutBalance(): number {
    return (this.dataset || []).reduce((acc, row) => acc + this.toAmount(row.outBalance ?? row.outBal), 0);
  }

  get totalCrBal(): number {
    return (this.dataset || []).reduce((acc, row) => acc + this.toAmount(row.crBal), 0);
  }

  get totalUnallocated(): number {
    return (this.dataset || []).reduce((acc, row) => acc + this.toAmount(row.unAllocatedBal ?? row.unAllocated), 0);
  }

  get totalCrLimit(): number {
    return (this.dataset || []).reduce((acc, row) => acc + this.toAmount(row.crLimit), 0);
  }

  private toAmount(value: any): number {
    if (value == null || value === '') return 0;
    const parsed = typeof value === 'number' ? value : Number(String(value).replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private normalizeReportRow(row: any): any {
    const normalized = { ...row };
    const amountFields = [
      'crLimit', 'zeroThirty', 'thirtyOneSixty', 'sixtyOneNinety',
      'ninetyOneToOneEighty', 'oneEightyOneToThreeSixty', 'oneEightOneToThreeSixty',
      'oneEightOneToTwoSeventy', 'twoSeventyOneToThreeSixty', 'twoSevenOneToThreeSixty',
      'overThreeSixty', 'crBal', 'unAllocated', 'unAllocatedBal', 'outBalance', 'outBal', 'allBal'
    ];

    if (normalized.outBalance == null) normalized.outBalance = normalized.outBal;
    if (normalized.outBal == null) normalized.outBal = normalized.outBalance;
    if (normalized.unAllocated == null) normalized.unAllocated = normalized.unAllocatedBal;
    if (normalized.unAllocatedBal == null) normalized.unAllocatedBal = normalized.unAllocated;
    if (normalized.oneEightyOneToThreeSixty == null) {
      normalized.oneEightyOneToThreeSixty =
        normalized.oneEightOneToThreeSixty ?? normalized.oneEightOneToTwoSeventy;
    }
    amountFields.forEach((field) => normalized[field] = this.toAmount(normalized[field]));
    return normalized;
  }

  getBalanceBadgeClass(balance: any): string {
    const b = Number(balance) || 0;
    if (b > 5000) return 'badge-balance-high';
    if (b > 1000) return 'badge-balance-mid';
    return '';
  }

  onRowDoubleClick(event: any, rowData: any) {
    if (rowData && (rowData.accNo || rowData.name)) {
      this.viewStatement(rowData);
    }
  }

  viewStatement(rowData: any) {
    if (!rowData) return;
    this.router.navigate(['/account/outstandingstatement'], {
      queryParams: {
        menu: 128,
        accNo: rowData.accNo,
        type: this.selectedcustomer === 'Payable' ? 'Supplier' : 'Customer',
      },
    });
  }

  updateAgingCards(resResult?: any) {
    if (resResult) {
      const backendTotal =
        this.toAmount(resResult.zeroThirty ?? resResult.zeroToThirty) +
        this.toAmount(resResult.thirtyOneSixty ?? resResult.thirtyOneToSixty) +
        this.toAmount(resResult.sixtyOneNinety) +
        this.toAmount(resResult.ninetyOneToOneEighty) +
        this.toAmount(resResult.oneEightyOneToThreeSixty ?? resResult.oneEightyToThreeSixty) +
        this.toAmount(resResult.overThreeSixty ?? resResult.aboveThreeSixty);

      if (backendTotal > 0) {
        this.ZeroToThirty = this.toAmount(resResult.zeroThirty ?? resResult.zeroToThirty);
        this.ThirtyOneToSixty = this.toAmount(resResult.thirtyOneSixty ?? resResult.thirtyOneToSixty);
        this.SixtyOneToNinety = this.toAmount(resResult.sixtyOneNinety);
        this.NinetyOneToOneEighty = this.toAmount(resResult.ninetyOneToOneEighty);
        this.OneEightyToThreeSixty = this.toAmount(resResult.oneEightyOneToThreeSixty ?? resResult.oneEightyToThreeSixty);
        this.aboveThreeSixty = this.toAmount(resResult.overThreeSixty ?? resResult.aboveThreeSixty);
        return;
      }
    }

    this.ZeroToThirty = this.totalZeroThirty;
    this.ThirtyOneToSixty = this.totalThirtyOneSixty;
    this.SixtyOneToNinety = this.totalSixtyOneNinety;
    this.NinetyOneToOneEighty = this.totalNinetyOneToOneEighty;
    this.OneEightyToThreeSixty = this.totalOneEightOneToThreeSixty;
    this.aboveThreeSixty = this.totalOverThreeSixty;
  }

  hotid = 'AgeingReport';
  private hotRegisterer = new HotTableRegisterer();
  AgeingReport: Handsontable.GridSettings;
  initializeControls() {
    this.cols = [
      { field: 'name', header: 'Account Name', width: '180px', sortable: true },
      { field: 'accNo', header: 'Acc No', width: '90px', sortable: true },
      { field: 'crLimit', header: 'Cr Limit', width: '95px', sortable: true, align: 'right' },
      { field: 'crDys', header: 'Cr Days', width: '75px', sortable: true, align: 'center' },
      { field: 'zeroThirty', header: '0 - 30', width: '95px', sortable: true, align: 'right' },
      { field: 'thirtyOneSixty', header: '31 - 60', width: '95px', sortable: true, align: 'right' },
      { field: 'sixtyOneNinety', header: '61 - 90', width: '95px', sortable: true, align: 'right' },
      { field: 'ninetyOneToOneEighty', header: '91 - 180', width: '95px', sortable: true, align: 'right' },
      { field: 'oneEightyOneToThreeSixty', header: '181 - 360', width: '95px', sortable: true, align: 'right' },
      { field: 'overThreeSixty', header: '> 360', width: '95px', sortable: true, align: 'right' },
      { field: 'crBal', header: 'Cr Bal', width: '95px', sortable: true, align: 'right' },
      { field: 'unAllocated', header: 'Unallocated', width: '105px', sortable: true, align: 'right' },
      { field: 'outBalance', header: 'Outstanding Bal', width: '130px', sortable: true, align: 'right' },
      { field: 'contact_Person', header: 'Contact Person', width: '130px', sortable: true },
      { field: 'tel1', header: 'Phone', width: '105px', sortable: true },
    ];
    this.AgeingReport = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
     // colWidths: '150px',

       colWidths: ['230px', '120px', '120px', '120px', '120px', '120px', '120px', '120px', '120px', '120px', '120px', '120px','120px','120px','120px','120px','120px','120px','120px','120px'],
      minRows: 3,
      width: 'auto',
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
          data: 'name',
          type: 'text'
        },
        {
          data: 'crLimit',
          type: 'text',
        },
        {
          data: 'crDys',
          type: 'text'
        },
        {
          data: 'zeroThirty',
          type: 'text'
        },
        {
          data: 'thirtyOneSixty',
          type: 'text',
        },
        {
          data: 'sixtyOneNinety',
          type: 'text'
        },
        {
          data: 'ninetyOneToOneEighty',
          type: 'text',
        },
        {
          data: 'oneEightOneToThreeSixty',
          type: 'text'
        },
        {
          data: 'overThreeSixty',
          type: 'text'
        },
        {
          data: 'crBal',
          type: 'text',
        },
        {
          data: 'unAllocated',
          type: 'text'
        },
        {
          data: 'outBalance',
          type: 'text'
        },
        {
          data: 'accNo',
          type: 'text'
        },
        {
          data: 'contact_Person',
          type: 'text'
        },
        {
          data: 'cT_Name',
          type: 'text'
        },
        {
          data: 'tel1',
          type: 'text'
        },
        {
          data: 'mobile',
          type: 'text'
        },
        {
          data: 'remarks',
          type: 'text'
        },
      ],
      colHeaders: [
        this.translate.instant('Name'),
        this.translate.instant('CrLimit'),
        this.translate.instant('CrDys'),
        this.translate.instant('0-30'),
        this.translate.instant('31-60'),
        this.translate.instant('61-90'),
        this.translate.instant('91-180'),
        this.translate.instant('181-360'),
        this.translate.instant('OV360'),
        this.translate.instant('CrBal'),
        this.translate.instant('UnAllocated'),
        this.translate.instant('outBalance'),
        this.translate.instant('accNo'),
        this.translate.instant('contact_Person'),
        this.translate.instant('cT_Name'),
        this.translate.instant('tel1'),
        this.translate.instant('mobile'),
        this.translate.instant('remarks'),


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
    private accService: AccountstatementService,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,
    private datePipe: DatePipe,
    private pdf: PdfExportService,
    private router: Router,
  ) {

  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
   this.companyDetails = this.permission.getStation();
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Ageing Report') {
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
    });
    this.ARform = new FormGroup({
      Customer: new FormControl('', Validators.required),
      Date: new FormControl(new Date(new Date().setFullYear(new Date().getFullYear())), Validators.required),
      KeyWord: new FormControl('', Validators.required),
    });
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";
    });

    this.customer = [
      { label: this.translate.instant('Customers'), value: 'Receivable' },
      { label: this.translate.instant('Suppliers'), value: 'Payable' },
    ];
    this.translate.onLangChange.subscribe(() => {
      this.customer = [
        { label: this.translate.instant('Customers'), value: 'Receivable' },
        { label: this.translate.instant('Suppliers'), value: 'Payable' },
      ];
    });
    this.initializeControls();
  }


  showPrint(event: any) {

    this.state = {
      Dir: event ? (event.sortOrder === -1 ? 'desc' : 'asc') : 'asc',
      Field: event && event.sortField ? event.sortField : 'Name',
      Skip: event?.first ?? 0,
      Take: event?.rows ?? 100,
      Search: this.keyword ?? '',
      Filter: this.selectedcustomer ? String(this.selectedcustomer) : '',   // ✅ always string
      ToDate: this.selectedAsOnDate ?? new Date(),
      ShowUnallocated: this.showUnallocated ?? false
    };
    this.accService.AgeingReportPrint(this.state).subscribe((response: any) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      this.pdfSource = URL.createObjectURL(blob);
      window.open(this.pdfSource);
    })

  }

  GetGridListData(event: any, isPrint: boolean = false) {
    this.state = {
      Dir: event ? (event.sortOrder === -1 ? 'desc' : 'asc') : 'asc',
      Field: event && event.sortField ? event.sortField : '',
      Skip: event?.first ?? 0,
      Take: event?.rows ?? 10000,
      Search: this.keyword=='' ? 'All' : this.keyword,
      Filter: this.selectedcustomer ? String(this.selectedcustomer) : '',   // ✅ always string
      ToDate: this.selectedAsOnDate
  ? new Date(this.selectedAsOnDate).toISOString().split('T')[0]
  : new Date().toISOString().split('T')[0],
      ShowUnallocated: this.showUnallocated ?? false,
    };
    this.loading = true;
    this.accService.GetAgeingReport(this.state).subscribe(
      (response: ApiResponse<any>) => {
        this.loading = false;
        this.dataset = [];
        if (Array.isArray(response?.result?.details) && response.result.details.length > 0) {
          this.dataset = response.result.details.map((row: any) => this.normalizeReportRow(row));
          this.updateAgingCards(response.result);
        } else {
          this.updateAgingCards(null);
        }
        if (isPrint) {
          this.pdf.generateAgeingReport(this.dataset);
        }
      },
      (err) => {
        this.loading = false;
      }
    );
  }
// GetGridListData(event: any, isPrint: boolean = false) {
//   this.state = {
//     ASONDate:  this.selectedAsOnDate ?? new Date(),
//     ReportType: this.selectedcustomer
//       ? String(this.selectedcustomer)
//       : 'Payable',
//     NameLike: this.keyword ?? ''
//   };

//   this.loading = true;

//   this.accService.GetAgeingReport(this.state).subscribe(
//     (response: ApiResponse<any>) => {
//       this.loading = false;
//       this.dataset = [];

//       if (response?.valid && response.result?.details?.length > 0) {
//         this.dataset = response.result.details;
//         this.updateAgingCards(response.result);
//       } else {
//         this.updateAgingCards(null);
//       }

//       if (isPrint) {
//         this.pdf.generateAgeingReport(this.dataset);
//       }
//     },
//     (err) => {
//       this.loading = false;
//       console.error('Aging report error:', err);
//     }
//   );
// }
  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }

  ASOnDateFilter() {
    let queryString = '';
    let max = this.GetDate(this.selectedAsOnDate);
    if (this.selectedAsOnDate) {
      // queryString += ` and (act.AccountsTransactions_TransDate <= cast('` + max + `'as Date))`;

      queryString += `and  CONVERT(DATE, act.AccountsTransactions_TransDate) <= '${max}'`;
      return queryString;
    }
  }

  ApplyFilters(type) {
    const isPrint = type == 'print' ? true : false;
    this.GetGridListData(null, isPrint);
  }
  get f() {
    return this.ARform.controls;
  }

  printbtns: MenuItem[] = [
    {
      label: 'Print as PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.printAsPdf()
    },
    {
      label: 'Export as Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportAsExcel()
    }
  ];

  printAsPdf() {
    this.printSimpleReport('rptAgeing', ExportFormatType.PortableDocFormat);
  }

  exportAsExcel() {
    this.printSimpleReport('rptAgeing', ExportFormatType.Excel);
  }

  printSimpleReport(type: string, exportType: ExportFormatType = ExportFormatType.PortableDocFormat) {

    const rptFilter = {
      ReportName: type,
      SelectionFormula: '',
      Parameters: [ {
              Key: '@ASONDate',
              Value: this.datePipe.transform(
                this.selectedAsOnDate ?? new Date(),
                'yyyy-MM-dd'
              ),
            },
            {
              Key: '@ReportType',
              Value: this.selectedcustomer ? String(this.selectedcustomer) : '',
            },
            {
              Key: '@NameLike',
              Value: `${this.keyword ? this.keyword : 'All'}`,
            },
              {
              Key: 'CompanyName',
              Value:   this.companyDetails?.stationMasterStationName,
            }
          ],
      Queries: [],
      SP_Queries: [
        {
          SP_Name: 'GetAgingPROCE',
          Parameters: [
            {
              Key: '@ASONDate',
              Value: this.datePipe.transform(
                this.selectedAsOnDate ?? new Date(),
                'yyyy-MM-dd'
              ),
            },
            {
              Key: '@ReportType',
              Value: this.selectedcustomer ? String(this.selectedcustomer) : '',
            },
            {
              Key: '@NameLike',
              Value: `${this.keyword ? this.keyword : 'All'}`,
            },
          ],
        },
      ],
      ExportType: exportType,
    };

    this.crystalReportService
      .getReportPrint(rptFilter,false)
      .subscribe((response) => {
        const fileBlob =
          exportType === ExportFormatType.Excel
            ? new Blob([response], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })
            : new Blob([response], { type: 'application/pdf' });

        const fileURL = URL.createObjectURL(fileBlob);

        if (exportType === ExportFormatType.Excel) {
          const link = document.createElement('a');
          link.href = fileURL;
          link.download = `${type}.xlsx`;
          link.click();
        } else {
          window.open(fileURL);
        }
      });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
} 
