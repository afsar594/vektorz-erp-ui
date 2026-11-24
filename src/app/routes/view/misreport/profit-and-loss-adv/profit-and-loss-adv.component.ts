import { Component, OnInit } from '@angular/core';
import { MISService } from 'src/app/routes/service/mis/mis.service';
import { PdfExportService } from 'src/app/shared/service/pdf-export.service';
import { MisReportParams } from '../balance-sheet-adv/balance-sheet-adv.component';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng';
import { ExportFormatType } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';

@Component({
  selector: 'app-profit-and-loss-adv',
  templateUrl: './profit-and-loss-adv.component.html',
  styleUrls: ['./profit-and-loss-adv.component.scss']
})
export class ProfitAndLossAdvComponent implements OnInit {

  index = 0;
  fromDate: Date = new Date();
  toDate: Date = new Date();
  byDate = false;
  isSummaryView = true;
  includeZero = false;
  profitLossData: any[] = [];
  profitLossSummary: any;
  locationId: any;
  costCenterId: any;
  mode: any;
  isGroupWise: boolean;
  modes: any[] = [];
  rptFilter: any;

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

  locations: Array<LocationMaster>;
  costCenters: Array<CostCenterMaster>;

  constructor(private misService: MISService,
    private masterApi: MasterApiService, private crystalReportService: CrystalReportService,
    private pdf: PdfExportService) { }

  ngOnInit(): void {
    this.loadModes();
    this.getAllLocation();
    this.getAllCostCenter();
  }

  printAsPdf() {
    this.printSimpleReport('Profitnloss', ExportFormatType.PortableDocFormat);
  }

  exportAsExcel() {
    this.printSimpleReport('Profitnloss', ExportFormatType.Excel);
  }

  loadModes() {
    this.modes = [
      { label: 'By Date', value: 'DATE' },
      { label: 'Monthly', value: 'MONTH' },
      { label: 'Yearly', value: 'YEAR' },
    ];

    if (this.modes.length > 0) {
      this.mode = this.modes[0];
    }
  }

  getAllLocation() {
    this.masterApi.GetAllLocation().subscribe((response: any) => {
      this.locations = response;
      console.log('Locations:', this.locations);
    });
  }

  getAllCostCenter() {
    this.masterApi.GetAllCostCenter().subscribe((response) => {
      this.costCenters = response;
      console.log('Cost Centers:', this.costCenters);
    });
  }

  loadProfitAndLoss() {

    const params: MisReportParams = {
      includeZero: !this.includeZero,
      isSummaryView: this.isSummaryView,
      fromDate: this.byDate ? this.fromDate : null,
      toDate: this.byDate ? this.toDate : null,
      locationId: this.locationId?.locationMasterLocationId || null,
      costCenterId: this.costCenterId?.costCenterMasterCostCenterId || null,
      mode: this.mode?.value || 'DATE',
      isMonthly: this.mode?.value === 'MONTH',
      isFullYear: this.mode?.value === 'YEAR',
      isGroupWise: this.isGroupWise
    };


    this.misService.getProfitAndLoss(params).subscribe(
      (res) => {
        console.log('Profit and Loss Response:', res);
        if (res.valid) {
          this.profitLossData = res?.result.details;
          this.profitLossSummary = res?.result.summary;
        }
      },
      (err) => {
        console.error('Error fetching Profit and Loss:', err);
      }
    );
  }
  handleChange(event: any) {
    this.index = event.index;
  }

  exportToPdf() {

    const headers =
      this.mode.value === 'MONTH'
        ? this.isSummaryView
          ? ['Month', 'Head Type', 'Sub Head', 'Debit', 'Credit', 'Total Amount']
          : ['Month', 'Head Type', 'Sub Head', 'Account Name', 'Debit', 'Credit', 'Net Amount']
        : this.isSummaryView
          ? ['Head Type', 'Sub Head', 'Debit', 'Credit', 'Total Amount']
          : ['Head Type', 'Sub Head', 'Account Name', 'Debit', 'Credit', 'Net Amount'];

    const body = this.profitLossData.map((row) => {
      // handle monthly view
      if (this.mode.value === 'MONTH') {
        if (this.isSummaryView) {
          return [
            row.monthName || this.getMonthName(row.monthKey),
            row.headType,
            row.subHead,
            this.formatAmount(row.debit),
            this.formatAmount(row.credit),
            this.formatAmount(row.totalAmount)
          ];
        } else {
          return [
            row.monthName || this.getMonthName(row.monthKey),
            row.headType,
            row.subHead,
            row.accountName,
            this.formatAmount(row.debit),
            this.formatAmount(row.credit),
            this.formatAmount(row.totalAmount)
          ];
        }
      }

      // default (DATE or YEAR view)
      if (this.isSummaryView) {
        return [row.headType, row.subHead, this.formatAmount(row.debit),
        this.formatAmount(row.credit), this.formatAmount(row.totalAmount)];
      } else {
        return [
          row.headType,
          row.subHead,
          row.accountName,
          this.formatAmount(row.debit),
          this.formatAmount(row.credit),
          this.formatAmount(row.totalAmount)
        ];
      }
    });


    const summaryData = [
      { label: 'Total Income', value: this.formatAmount(this.profitLossSummary?.totalIncome) },
      { label: 'Total COGS', value: this.formatAmount(this.profitLossSummary?.totalCOGS) },
      { label: 'Gross Profit', value: this.formatAmount(this.profitLossSummary?.grossProfit) },
      { label: 'Total Expenses', value: this.formatAmount(this.profitLossSummary?.totalExpenses) },
      { label: 'Total Other Income', value: this.formatAmount(this.profitLossSummary?.totalOtherIncome) },
      { label: 'Total Other Expense', value: this.formatAmount(this.profitLossSummary?.totalOtherExpense) },
      { label: 'Net Profit', value: this.formatAmount(this.profitLossSummary?.netProfit) },
      { label: 'Result', value: this.profitLossSummary?.finalResult }
    ];

    const periodText = `Period: ${this.fromDate.toLocaleDateString()} - ${this.toDate.toLocaleDateString()}`;

    this.pdf.generateFinancialReport('Profit and Loss Report', headers, body, summaryData, periodText);
  }
  getMonthName(monthKey: string): string {
    const monthNumber = parseInt(monthKey, 10);
    return isNaN(monthNumber)
      ? ''
      : new Date(2000, monthNumber - 1, 1).toLocaleString('default', { month: 'long' });
  }

  private formatAmount(val: number): string {
    return (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }


  printSimpleReport(type: string, exportType: ExportFormatType = ExportFormatType.PortableDocFormat) {

    this.rptFilter = {
      ReportName: type,
      SelectionFormula: '',
      Parameters: [],
      Queries: [],
      SP_Queries: [
        {
          SP_Name: 'usp_GetProfitAndLoss_Advanced',
          Parameters: [
            {
              Key: '@FromDate',
              Value: this.byDate && this.fromDate
                ? this.fromDate.toISOString().split('T')[0]
                : null,
            },
            {
              Key: '@ToDate',
              Value: this.byDate && this.toDate
                ? this.toDate.toISOString().split('T')[0]
                : null,
            },
            {
              Key: '@LocationId',
              Value: this.locationId ?? null,
            },
            {
              Key: '@CostCenterId',
              Value: this.costCenterId ?? null,
            },
            {
              Key: '@Mode',
              Value: 'DATE',
            },
            {
              Key: '@IsMonthly',
              Value: 0,
            },
            {
              Key: '@IsFullYear',
              Value: 0,
            },
            {
              Key: '@IncludeZero',
              Value: this.includeZero ? 0 : 1,
            },
            {
              Key: '@IsGroupWise',
              Value: !this.isGroupWise ? 0 : 1,
            }
          ]
        },
      ],
      ExportType: exportType,
    };
    this.crystalReportService
      .getReportPrintBySp(this.rptFilter)
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





}
