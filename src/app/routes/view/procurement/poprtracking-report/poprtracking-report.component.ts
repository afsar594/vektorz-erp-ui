import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, SelectItem } from 'primeng';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-poprtracking-report',
  templateUrl: './poprtracking-report.component.html',
  styleUrls: ['./poprtracking-report.component.scss'],
})
export class POPRtrackingReportComponent implements OnInit {
  pdfSource: string;
  loadList: any;

  title: string;

  printbtn: MenuItem[];

  cols: any;
  List: any;
  job: any;
  enableDate: boolean = false;
  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  calenderView = 'date';
  calenderViewFormat = 'dd/mm/yy';
  frmSalesReport: FormGroup;
  rptFilter: ReportFilterModel;
  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  constructor(
    private activatedroute: ActivatedRoute,
    private accountapi: AccountApiService,

    private crystalReportService: CrystalReportService
  ) {
    this.printbtn = [
      {
        label: 'PDF',
        command: () => {
          this.printCReport('pdf');
        },
      },
      {
        label: 'Excel',
        command: () => {
          this.printCReport('excel');
        },
      },
    ];
  }

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.frmSalesReport = new FormGroup({
      report: new FormControl('PO'),
      job: new FormControl(null),

      dateFrom: new FormControl(new Date()),
      dateTo: new FormControl(new Date()),
    });

    this.LoadJobDDL();
  }

  toggleDate() {
    this.enableDate = !this.enableDate;
    if (this.enableDate) {
      this.frmSalesReport.controls['dateTo'].enable();
      this.frmSalesReport.controls['dateFrom'].enable();
    } else {
      this.frmSalesReport.controls['dateTo'].disable();
      this.frmSalesReport.controls['dateFrom'].disable();
    }
  }
  change(data: string) {
    this.frmSalesReport.controls['report'].setValue(data);
  }
  changess($event: any) {
    this.frmSalesReport.controls['job'].setValue($event);
  }

  LoadJobDDL() {
    this.accountapi.LoadDropdowjobMasters().subscribe((r) => {
      this.loadList = r.resultSet;
      if (this.loadList.jobMasters) {
        this.jobArray = this.loadList.jobMasters;
        this.jobList = this.loadList.jobMasters.map((kl) => ({
          label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
          value: kl.jobMasterJobId,
        }));
        this.jobList.unshift({ label: '--Select Job--', value: -1 });
        this.jobArry = this.loadList.jobMasters.map((ar) =>
          ar.jobMasterJobName?.trim()
        );
      }
    });
  }

  clear() {
    this.frmSalesReport.reset();
    this.enableDate = false;
    this.change('PO');
  }

  Show() {
    throw new Error('Method not implemented.');
  }

  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }

  printCReport(type) {
    const reportType =
      this.frmSalesReport.controls['report'].value === 'PO'
        ? 'POTracking'
        : 'PRTracking';
    const queryTable =
      reportType === 'POTracking' ? 'vw_POTracking' : 'vw_PRTracking';
    const queryvalue =
      reportType === 'POTracking'
        ? 'PurchaseOrderDate'
        : 'PurchaseRequisitionDate';

    const jobId = this.frmSalesReport.controls['job']?.value; // Assume you have a control named jobId
    const fromDate = this.frmSalesReport.controls['dateFrom']?.value; // Assume you have controls for dates
    const toDate = this.frmSalesReport.controls['dateTo']?.value;

    const conditions: string[] = [];

    // Add condition for Job if selected
    if (jobId) {
      conditions.push(`${queryTable}.Job_Master_Job_ID = ${jobId}`);
    }

    if (this.enableDate) {
      conditions.push(
        `${queryTable}.${queryvalue} between '${this.GetDate(
          fromDate
        )}' and '${this.GetDate(toDate)}'`
      );
    }

    // Build final query
    const whereClause =
      conditions.length > 0 ? ` where ${conditions.join(' and ')}` : '';
    const finalQuery = `select * from ${queryTable}${whereClause}`;

    this.rptFilter = {
      ReportName: reportType,
      SelectionFormula: '',
      Parameters: [],
      Queries: [finalQuery],
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
}
