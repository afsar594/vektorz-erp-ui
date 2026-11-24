import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HotTableRegisterer } from '@handsontable/angular';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { ReportService } from 'src/app/routes/service/report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ExportdocumentService } from 'src/app/routes/service/ExportDocument/exportdocument.service';
import { PdfEngineService } from 'src/app/routes/service/PdfEngine/pdf-engine.service';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { DepartmentMaster, ItemMaster } from 'src/app/routes/domain';
import { StationMaster } from 'src/app/routes/domain/Administration/StationMaster';

type SheetData = any[][];

@Component({
  selector: 'app-issue-report',
  templateUrl: './issue-report.component.html',
  styleUrls: ['./issue-report.component.scss'],
})
export class IssueReportComponent implements OnInit {
  title: string;
  subtitle: string;
  btnlabel: string = 'Submit';
  cols: any;
  dataJson: string;
  data: SheetData;
  ItemFormGroup: FormGroup;
  JobWiseIssueReport: any;
  licensekey: string;
  DetailWiseIssueReport: any;
  stockLedgerReport: any;
  HIDEJOBCOST: boolean = false;
  currentDate: Date = new Date();
  companyDetails: StationMaster = {};

  constructor(
    private fb: FormBuilder,
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    public _MasterApiService: MasterApiService,
    public _ReportService: ReportService,
    private router: Router,
    public _ExportdocumentService: ExportdocumentService,
    private pdfEngine: PdfEngineService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  JobMasterArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  JobMasterArry: string[] = [];

  CostCentreArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  DepartmentMasterArray: DepartmentMaster[] = [];
  departmentList: SelectItem[] = [];
  departmentArry: string[] = [];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  ngOnInit(): void {
    this.getAllJobs();
    this.getAllCostCenter();
    this.getAllDepartment();
    this.getAllItemMaster();
    this.GetGeneralSettingbyKey();
    this.loadCompanyDetails();

    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
    });
    this.cols = [];
    this.initForm();
  }

  initForm() {
    this.ItemFormGroup = this.fb.group({
      ItemGroup: new FormControl(null),
      ItemName: new FormControl(null),
      DateFrom: new FormControl(new Date()),
      DateTo: new FormControl(new Date()),
      Job: new FormControl(null),
      PartNo: new FormControl(null),
      DepId: new FormControl(null),
      CostCentre: new FormControl(null),
      Type: new FormControl('details'),
      isDate: new FormControl(false),
      Description: new FormControl(null),

    });
  }

  getAllJobs() {
    this._MasterApiService.GetAllJob().subscribe((k) => {
      this.JobMasterArray = k.result;
      this.jobList = k.result.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.JobMasterArry = k.result;
    });
  }

  getAllCostCenter() {
    this._MasterApiService.GetAllCostCenter().subscribe((k) => {
      this.CostCentreArray = k;
      this.costcenterList = k.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterList.unshift({
        label: '--Select CostCenter--',
        value: -1,
      });
      this.costcenterArry = k.map((ar) =>
        ar.costCenterMasterCostCenterName.trim()
      );
    });
  }

  public getJobName(job: number): string {
    const foundLoc = this.JobMasterArray?.find((j) => j.jobMasterJobId === job);
    if (foundLoc) {
      return foundLoc.jobMasterJobName;
    } else {
      return '';
    }
  }

  getAllDepartment() {
    this._MasterApiService.GetAllDepartment().subscribe((k) => {
      this.DepartmentMasterArray = k;
      this.departmentList = k.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentId,
      }));
      this.departmentList.unshift({
        label: '--Select Department--',
        value: -1,
      });
      this.departmentArry = k.map((ar) =>
        ar.departmentMasterDepartmentName.trim()
      );
    });
  }

  getAllItemMaster() {
    this._MasterApiService.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k.result.map(
        (ar) => ar.itemMasterItemName.trim() + '|' + ar.itemMasterItemId
      );
    });
  }

  ChangeItem() {
    this.ItemFormGroup.controls.PartNo.setValue(
      this.ItemFormGroup.controls.ItemName.value?.itemMasterPartNo
    );
  }

  GenerateReport() {
    const formObj = this.ItemFormGroup.value;
    const isDateChecked = formObj.isDate ?? false;

    const req = {
      isDate: isDateChecked,
      // If unchecked, send Jan 1, 1970 to fetch everything from the beginning of time
      dateFrom: isDateChecked ? formObj.DateFrom : new Date('1970-01-01'),
      // If unchecked, send today's date to fetch everything up to right now
      toDate: isDateChecked ? formObj.DateTo : new Date(),
      costCentreId: formObj.CostCentre?.costCenterMasterCostCenterId || null,
      departmentId: formObj.DepId?.departmentMasterDepartmentId || null,
      itemId: formObj.ItemName?.itemMasterItemId || null,
      jobId: formObj.Job?.jobMasterJobId || (formObj.Job !== -1 ? formObj.Job : null),
      partNo: formObj.PartNo || null,
      type: formObj.Type,
      Description: formObj.Description || null,
    };

    switch (req.type) {
      case 'details':
        this.DetailWiseIssueReport = [];
        this._ReportService.GetDetailWiseIssueVoucherReport(req).subscribe((m) => {
          this.DetailWiseIssueReport = m.resultSet;
        });
        break;
      case 'summary':
        this._ReportService.GetSummaryWiseIssueReport(req);
        break;
      case 'jobwise':
        this.JobWiseIssueReport = [];
        this._ReportService.GetJobWiseIssueVoucherReport(req).subscribe((m) => {
          this.JobWiseIssueReport = m.resultSet;
        });
        break;
    }
  }

  GetGeneralSettingbyKey() {
    this._MasterApiService
      .GetGeneralSettingbyKey('HIDE_JOBCOST')
      .subscribe((res) => {
        this.HIDEJOBCOST = res.result[0].generalSettingsBoolValue;
      });
  }

  loadCompanyDetails() {
    this._MasterApiService.getCompanyDetails().subscribe((response) => {
      this.companyDetails = response[0] || {};
    });
  }

  get detailTotalQty(): number {
    const rows: any[] = this.DetailWiseIssueReport || [];
    return rows.reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0);
  }
  get detailTotalAmount(): number {
    const rows: any[] = this.DetailWiseIssueReport || [];
    return rows.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  }
  get jobwiseTotalQty(): number {
    const rows: any[] = this.JobWiseIssueReport || [];
    return rows.reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0);
  }
  get jobwiseTotalAmount(): number {
    const rows: any[] = this.JobWiseIssueReport || [];
    return rows.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  }
  get summaryTotalQty(): number {
    const rows: any[] = this._ReportService.SummaryWiseIssueReport || [];
    return rows.reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0);
  }
  get summaryTotalAmount(): number {
    const rows: any[] = this._ReportService.SummaryWiseIssueReport || [];
    return rows.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  }

  private readonly crystalReportCss = `
    body{font-family:'Segoe UI',Calibri,Arial,sans-serif;font-size:12px;color:#1a1a1a;background:#fff;margin:24px 32px}
    .cr-report-wrapper{background:#fff}
    .cr-report-header{display:flex;justify-content:space-between;align-items:flex-start;border-top:4px solid #1e3a5f;border-bottom:3px double #1e3a5f;padding:12px 0;margin-bottom:14px}
    .cr-header-left{flex:1}.cr-header-right{text-align:right;padding-left:24px;white-space:nowrap}
    .cr-report-title{font-size:17px;font-weight:700;color:#1e3a5f;letter-spacing:.3px;margin-bottom:6px}
    .cr-report-params{font-size:11px;color:#555;line-height:1.7}
    .cr-print-date{font-size:11px;font-weight:600;color:#333}
    .cr-record-count{font-size:11px;color:#777;margin-top:4px}
    .cr-table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px}
    .cr-th{background-color:#1e3a5f;color:#fff;padding:9px 11px;border:1px solid #15304f;font-weight:600;font-size:11.5px;white-space:nowrap}
    .cr-th-left{text-align:left}.cr-th-right{text-align:right}.cr-th-center{text-align:center}
    .cr-td{padding:6px 11px;border:1px solid #c5d4e8;vertical-align:middle;line-height:1.4}
    .cr-td-right{text-align:right}.cr-td-center{text-align:center}
    .cr-row-even{background-color:#edf3fb}
    .cr-totals-row td{background-color:#cfe0f5;border-top:2px solid #1e3a5f;border-bottom:2px solid #1e3a5f;padding:7px 11px;font-weight:700}
    .cr-tf{padding:7px 11px;border:1px solid #c5d4e8}.cr-tf-label{color:#1e3a5f;font-size:12px}
    .cr-no-data{text-align:center;padding:36px;color:#aaa;font-style:italic;font-size:13px}
    .cr-report-footer{display:flex;justify-content:space-between;margin-top:14px;padding-top:8px;border-top:1px solid #c5d4e8;font-size:10.5px;color:#999;font-style:italic}
  `;

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  onClear() {
    this.initForm();
    this.DetailWiseIssueReport = [];
  }

  private generateSegmentPdf(data: any, companyName: string): void {
    try {
      const tableData = data.data || [];
      const reportType = data.reportType || 'details';

      const fromDateStr = data.fromDate
        ? new Date(data.fromDate).toLocaleDateString('en-GB')
        : 'All';
      const toDateStr = data.toDate
        ? new Date(data.toDate).toLocaleDateString('en-GB')
        : 'All';
      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentTime = new Date()
        .toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        .toLowerCase();

      const totalQty = tableData.reduce(
        (s: number, i: any) => s + (Number(i.quantity) || 0),
        0
      );
      const totalAmount = tableData.reduce(
        (s: number, i: any) => s + (Number(i.amount) || 0),
        0
      );

      const reportTitle =
        reportType === 'jobwise'
          ? 'Issue Voucher - Job Wise'
          : reportType === 'summary'
          ? 'Issue Voucher - Summary Wise'
          : 'Issue Voucher - Detail Wise';

      const isDetail = reportType === 'details';
      const tableHeaders = isDetail
        ? [
            { text: 'Issue No', style: 'th', alignment: 'left' },
            { text: 'Issue Date', style: 'th', alignment: 'left' },
            { text: 'Part No', style: 'th', alignment: 'left' },
            { text: 'Item', style: 'th', alignment: 'left' },
            { text: 'Qty', style: 'th', alignment: 'right' },
            { text: 'Rate', style: 'th', alignment: 'right' },
            { text: 'Amount', style: 'th', alignment: 'right' },
            { text: 'Remarks', style: 'th', alignment: 'left' },
          ]
        : [
            { text: 'Job No', style: 'th', alignment: 'left' },
            { text: 'Job Name', style: 'th', alignment: 'left' },
            { text: 'Issue No', style: 'th', alignment: 'left' },
            { text: 'Issue Date', style: 'th', alignment: 'left' },
            { text: 'Part No', style: 'th', alignment: 'left' },
            { text: 'Item', style: 'th', alignment: 'left' },
            { text: 'Qty', style: 'th', alignment: 'right' },
            { text: 'Rate', style: 'th', alignment: 'right' },
            { text: 'Amount', style: 'th', alignment: 'right' },
          ];

      const tableRows = tableData.map((item: any) => {
        if (isDetail) {
          return [
            { text: item.issueNo || '-', style: 'td', alignment: 'left' },
            {
              text: item.issueDate
                ? new Date(item.issueDate).toLocaleDateString('en-GB')
                : '-',
              style: 'td',
              alignment: 'left',
            },
            { text: item.partNo || '-', style: 'td', alignment: 'left' },
            { text: item.itemName || '-', style: 'td', alignment: 'left' },
            {
              text: (Number(item.quantity) || 0).toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              }),
              style: 'td',
              alignment: 'right',
            },
            {
              text: (Number(item.rate) || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              style: 'td',
              alignment: 'right',
            },
            {
              text: (Number(item.amount) || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              style: 'td',
              alignment: 'right',
            },
            { text: item.description || '-', style: 'td', alignment: 'left' },
          ];
        }

        return [
          {
            text: this.HIDEJOBCOST ? item.detailjobId || '-' : item.jobNumber || '-',
            style: 'td',
            alignment: 'left',
          },
          { text: item.jobName || '-', style: 'td', alignment: 'left' },
          { text: item.issueNo || '-', style: 'td', alignment: 'left' },
          {
            text: item.issueDate
              ? new Date(item.issueDate).toLocaleDateString('en-GB')
              : '-',
            style: 'td',
            alignment: 'left',
          },
          { text: item.partNo || '-', style: 'td', alignment: 'left' },
          { text: item.itemName || '-', style: 'td', alignment: 'left' },
          {
            text: (Number(item.quantity) || 0).toLocaleString(undefined, {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            }),
            style: 'td',
            alignment: 'right',
          },
          {
            text: (Number(item.rate) || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            style: 'td',
            alignment: 'right',
          },
          {
            text: (Number(item.amount) || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            style: 'td',
            alignment: 'right',
          },
        ];
      });

      const totalRow = isDetail
        ? [
            { text: 'Total', style: 'totalRow', colSpan: 4, alignment: 'left' },
            {},
            {},
            {},
            {
              text: totalQty.toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              }),
              style: 'totalRow',
              alignment: 'right',
            },
            { text: '', style: 'totalRow', alignment: 'right' },
            {
              text: totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              style: 'totalRow',
              alignment: 'right',
            },
            { text: '', style: 'totalRow', alignment: 'left' },
          ]
        : [
            { text: 'Total', style: 'totalRow', colSpan: 6, alignment: 'left' },
            {},
            {},
            {},
            {},
            {},
            {
              text: totalQty.toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              }),
              style: 'totalRow',
              alignment: 'right',
            },
            { text: '', style: 'totalRow', alignment: 'right' },
            {
              text: totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              style: 'totalRow',
              alignment: 'right',
            },
          ];

      const companyAddress = this.companyDetails?.stationMasterAddress || 'UAE';
      const companyEmail = this.companyDetails?.stationMasterEmail || 'inspire@gmail.com';
      const companyPhone = this.companyDetails?.stationMasterTele1 || '00000000';

      const docDefinition: any = {
        pageMargins: [30, 30, 30, 30],
        defaultStyle: {
          fontSize: 9,
          font: 'Roboto',
        },
        content: [
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text:
                          companyName ||
                          this.companyDetails?.stationMasterStationName ||
                          'Company',
                        style: 'companyTitle',
                      },
                      {
                        text: `${companyAddress}\n${companyEmail}\n${companyPhone}`,
                        margin: [0, 5, 0, 20],
                        fontSize: 8,
                      },
                      { text: reportTitle, style: 'reportTitle' },
                      {
                        columns: [
                          { text: '', width: '*' },
                          {
                            text: `Date     ${currentDate}         Time     ${currentTime}`,
                            alignment: 'right',
                            fontSize: 8,
                            width: 'auto',
                          },
                        ],
                      },
                    ],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#a6a6a6',
              vLineColor: () => '#a6a6a6',
              paddingLeft: () => 15,
              paddingRight: () => 15,
              paddingTop: () => 15,
              paddingBottom: () => 10,
            },
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    columns: [
                      {
                        text: `Reporting Period  :  ${fromDateStr} to ${toDateStr}`,
                      },
                    ],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#a6a6a6',
              vLineColor: () => '#a6a6a6',
              paddingLeft: () => 15,
              paddingRight: () => 15,
              paddingTop: () => 10,
              paddingBottom: () => 10,
            },
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: isDetail
                ? ['auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', '*']
                : ['auto', '*', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
              body: [tableHeaders, ...tableRows, totalRow],
            },
            layout: {
              hLineWidth: (i: number, node: any) =>
                i === 0 ||
                i === 1 ||
                i === node.table.body.length - 1 ||
                i === node.table.body.length
                  ? 1
                  : 0,
              vLineWidth: (i: number, node: any) =>
                i === 0 || i === node.table.widths.length ? 1 : 0,
              hLineColor: () => '#666666',
              vLineColor: () => '#666666',
              paddingLeft: () => 10,
              paddingRight: () => 10,
              paddingTop: () => 6,
              paddingBottom: () => 6,
            },
          },
        ],
        styles: {
          companyTitle: { fontSize: 16, bold: true, color: '#8B0000' },
          reportTitle: { fontSize: 14, bold: true, alignment: 'center' },
          th: { bold: true, fontSize: 9, color: 'white', fillColor: '#959595' },
          td: { fontSize: 8 },
          totalRow: { fontSize: 8, bold: true, fillColor: '#f0f0f0' },
        },
      };

      this.pdfEngine.openInNewTab(docDefinition);
    } catch (error) {
      console.error('PDF Generation Crashed:', error);
    }
  }

  onPrint() {
    this.currentDate = new Date();
    const reportType = this.ItemFormGroup.controls.Type.value;
    const dateEnabled = this.ItemFormGroup.controls.isDate.value;

    const reportData =
      reportType === 'jobwise'
        ? this.JobWiseIssueReport || []
        : reportType === 'summary'
        ? this._ReportService.SummaryWiseIssueReport || []
        : this.DetailWiseIssueReport || [];

    this.generateSegmentPdf(
      {
        data: reportData,
        fromDate: dateEnabled ? this.ItemFormGroup.controls.DateFrom.value : null,
        toDate: dateEnabled ? this.ItemFormGroup.controls.DateTo.value : null,
        reportType,
      },
      this.companyDetails?.stationMasterStationName || ''
    );
  }
}
