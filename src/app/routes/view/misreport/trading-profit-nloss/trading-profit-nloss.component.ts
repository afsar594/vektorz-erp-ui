import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ExportFormatType } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MISService } from 'src/app/routes/service/mis/mis.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-trading-profit-nloss',
  templateUrl: './trading-profit-nloss.component.html',
  styleUrls: ['./trading-profit-nloss.component.scss']
})
export class TradingProfitNLossComponent implements OnInit {
  selectedLocation: any;
  selectedCostCenter: any;

  byDate: boolean = true;
  fromDate: any;
  toDate: any;
  locations: Array<LocationMaster>;
  costCenters: Array<CostCenterMaster>;
  printbtn: MenuItem[];

  pdfUrl: SafeResourceUrl | null = null;
  rawPdfUrl: string | null = null;

  constructor(private misService: MISService,
    private crystalReportService: CrystalReportService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private masterApi: MasterApiService) { }

  ngOnInit(): void {
    this.printbtn = [
      {
        label: 'Export PDF',
        icon: 'pi pi-file-pdf',
        command: () => {
          this.exportPdf();
        }
      },
      {
        label: 'Export Excel',
        icon: 'pi pi-file-excel',
        command: () => {
          this.exportExcel();
        }
      }
    ];
    this.getAllLocation();
    this.getAllCostCenter();
  }

  exportPdf() {
    this.exportReport(
      ExportFormatType.PortableDocFormat,
      'application/pdf',
      'report.pdf',
      true
    );
  }

  exportExcel() {
    this.exportReport(
      ExportFormatType.ExcelWorkbook,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'report.xlsx'
    );
  }

  private exportReport(format: ExportFormatType, mimeType: string, fileName: string, preview: boolean = false) {

    if (!this.isValid()) {
      return;
    }

    this.crystalReportService
      .getReportPrintBySp(this.payload(format))
      .subscribe({
        next: (response) => {

          const blob = new Blob([response], { type: mimeType });

          if (preview) {
            const url = URL.createObjectURL(blob);
            this.rawPdfUrl = url;
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          }
          else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(link.href);
          }

        },
        error: () => {
          this.rawPdfUrl = null;
          this.pdfUrl = null;
        }
      });
  }

  isValid(): boolean {
    if (!this.fromDate || !this.toDate) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select both From Date and To Date.' });
      return false;
    }
    return true;
  }

  payload(type: ExportFormatType) {
    return {
      ReportName: "TradingProfitNLoss",
      SelectionFormula: "",
      Parameters: [],
      Queries: [],
      SP_Queries: [
        {
          SP_Name: "sp_IncomeStatement_v3",
          Parameters: [
            {
              Key: "@FromDate",
              Value: this.formatDate(this.fromDate)
            },
            {
              Key: "@ToDate",
              Value: this.formatDate(this.toDate)
            },
            {
              Key: "@LocationId",
              Value: this.selectedLocation?.locationMasterLocationId
            },
            {
              Key: "@CostCenterId",
              Value: this.selectedCostCenter?.costCenterMasterCostCenterId
            }

          ]
        }
      ],
      ExportType: type
    };
  }

  formatDate(date: Date) {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);

    return d.getFullYear() + '-' + month + '-' + day;
  }
  getAllLocation() {
    this.masterApi.GetAllLocation().subscribe((response: any) => {
      this.locations = response;
    });
  }

  getAllCostCenter() {
    this.masterApi.GetAllCostCenter().subscribe((response) => {
      this.costCenters = response;
    });
  }

  loadProfitAndLoss() {
    throw new Error('Method not implemented.');
  }
}
