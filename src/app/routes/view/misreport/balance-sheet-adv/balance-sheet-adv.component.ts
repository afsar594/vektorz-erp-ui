import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MISService } from 'src/app/routes/service/mis/mis.service';
import { PdfExportService } from 'src/app/shared/service/pdf-export.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-balance-sheet-adv',
  templateUrl: './balance-sheet-adv.component.html',
  styleUrls: ['./balance-sheet-adv.component.scss'],
})
export class BalanceSheetAdvComponent implements OnInit {
  title: string;
  financialPeriodsStartDate: Date = new Date();
  financialPeriodsEndDate: Date = new Date();
  financialStartDate: Date = new Date();
  financialEndDate: Date = new Date();
  byDate = false;
  isSummaryView = true;
  includeZero = false; // "Hide Zero Balance" checkbox state (see loadBalanceSheet note)
  balanceSheetData: BalanceSheetDto[] = [];
  index = 0;
  subtitle: any;
  licensekey: string;
  gridHeader: string;

  rptFilter: ReportFilterModel;
  constructor(
    private misService: MISService,
    private pdf: PdfExportService,

    private masterApi: MasterApiService,
    private crystalReportService: CrystalReportService,
    private activatedroute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.GetAllFinancialPeriod();
  }

  onByDateChange(checked: boolean) {
    
    this.byDate = checked;
    this.financialStartDate = checked
      ? new Date()
      : new Date(this.financialPeriodsStartDate);

    if (!checked) {
      this.financialEndDate = new Date(this.financialPeriodsEndDate);
    }
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
    this.printSimpleReport('BalanceSheet', ExportFormatType.PortableDocFormat);
  }

  exportAsExcel() {
    this.printSimpleReport('BalanceSheet', ExportFormatType.Excel);
  }

  pdfSource: any;
  printSimpleReport(type: string, exportType: ExportFormatType = ExportFormatType.PortableDocFormat) {

    this.rptFilter = {
      ReportName: type,
      SelectionFormula: '',
      Parameters: [],
      Queries: [],
      SP_Queries: [
        {
          SP_Name: 'usp_GetBalanceSheet_Advanced',
          Parameters: [
            {
              Key: '@FromDate',
              Value: this.getFromDate().toISOString().split('T')[0],
            },
            {
              Key: '@ToDate',
              Value: this.getToDate().toISOString().split('T')[0],
            },
            {
              Key: '@IncludeZero',
              Value: `${this.includeZero ? 1 : 0}`,
            },
            {
              Key: '@IsSummaryView',
              Value: '0',
            }
          ],
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

  loadBalanceSheet() {
    const params: MisReportParams = {
      fromDate: this.getFromDate(),
      toDate: this.getToDate(),
      // this.includeZero is the "Hide Zero Balance" checkbox: checked (true)
      // means the user wants zeros HIDDEN, so the API's @IncludeZero flag
      // (1 = show zero lines) must be the opposite of the checkbox state.
      includeZero: this.includeZero === true ? false : true,
      isSummaryView: this.isSummaryView,
      locationId: null,
      costCenterId: null,
      mode: '',
      isMonthly: false,
      isFullYear: false,
      isGroupWise: false,
    };
    this.misService.getBalanceSheetAdv(params).subscribe(
      (res) => {
        if (res.valid) {
          // result is a flat, pre-ordered array of statement rows
          this.balanceSheetData = (res?.result ?? [])
            .slice()
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        }
      },
      (err) => {
        console.error('Error fetching Balance Sheet:', err);
      }
    );
  }

  handleChange(event: any) {
    this.index = event.index;
  }

  // --- Grid rendering helpers -------------------------------------------

  /**
   * Maps the API rows straight into printable statement rows.
   *
   * The stored procedure returns the statement fully laid out, in order,
   * with the hierarchy encoded in rowType:
   *   MAINHEAD       -> Head row        (e.g. "Assets")
   *   SUBHEAD        -> Sub Head row    (e.g. "Current Asset")
   *   RELATIVEHEAD   -> Group row       (e.g. "Debtors", "Suppliers")
   *   DETAIL         -> account line with Debit / Credit / Balance
   *   RELATIVE_TOTAL -> group total     (e.g. "Debtors Total")
   *   MAIN_TOTAL     -> section total   (e.g. "Assets Total")
   *   GRAND_TOTAL    -> "Total Liabilities & Equity"
   *   CHECK          -> balance check row
   * Summary vs Detailed is resolved server-side, so no client filtering.
   */
  get displayRows(): BalanceSheetDisplayRow[] {
    return (this.balanceSheetData ?? []).map((r) => {
      switch (r.rowType) {
        case 'MAINHEAD':
          return { kind: 'HEAD', label: r.accName, rowType: r.rowType };
        case 'SUBHEAD':
          return { kind: 'SUBHEAD', label: r.accName, rowType: r.rowType };
        case 'RELATIVEHEAD':
          return {
            kind: 'GROUP',
            // some groups come back unnamed (blank relativeName/accName)
            label: r.accName || r.relativeName || '(Unnamed Group)',
            rowType: r.rowType,
          };
        default:
          // DETAIL, RELATIVE_TOTAL, MAIN_TOTAL, GRAND_TOTAL, CHECK
          return {
            kind: 'LINE',
            label: r.accName,
            accNo: r.accNo,
            totalDebit: r.totalDebit,
            totalCredit: r.totalCredit,
            balance: r.balance,
            rowType: r.rowType,
          };
      }
    });
  }

  /** CSS class per row so totals and the check row are visually distinct. */
  rowClass(row: BalanceSheetDisplayRow): string {
    switch (row.rowType) {
      case 'RELATIVE_TOTAL':
        return 'row-level2-total';
      case 'MAIN_TOTAL':
        return 'row-section-total';
      case 'GRAND_TOTAL':
        return 'row-grand-total';
      case 'CHECK':
        return Math.abs(row.balance || 0) < 0.01 ? 'row-check-ok' : 'row-check-fail';
      default:
        return '';
    }
  }

  // ------------------------------------------------------------------------

  exportToPdf() {
    const headers = ['Head', 'Sub Head', 'Group', 'Acc No', 'Account', 'Debit', 'Credit', 'Balance'];
    const body = this.displayRows.map((r) => [
      r.kind === 'HEAD' ? r.label : '',
      r.kind === 'SUBHEAD' ? r.label : '',
      r.kind === 'GROUP' ? r.label : '',
      r.kind === 'LINE' ? r.accNo || '' : '',
      r.kind === 'LINE' ? r.label : '',
      r.kind === 'LINE' ? this.formatAmount(r.totalDebit) : '',
      r.kind === 'LINE' ? this.formatAmount(r.totalCredit) : '',
      r.kind === 'LINE' ? this.formatAmount(r.balance) : '',
    ]);

    const grand = this.balanceSheetData.find((r) => r.rowType === 'GRAND_TOTAL');
    const check = this.balanceSheetData.find((r) => r.rowType === 'CHECK');
    const summary = [
      ...this.balanceSheetData
        .filter((r) => r.rowType === 'MAIN_TOTAL')
        .map((r) => ({ label: r.accName, value: this.formatAmount(r.balance) })),
      { label: grand?.accName || 'Total Liabilities & Equity', value: this.formatAmount(grand?.balance) },
      { label: 'Check (must be 0)', value: this.formatAmount(check?.balance) },
    ];

    const periodText = `Period: ${this.formatDisplayDate(this.getFromDate())} - ${this.formatDisplayDate(this.getToDate())}`;

    this.pdf.generateFinancialReport(
      'Balance Sheet Report',
      headers,
      body,
      summary,
      periodText
    );
  }

  private formatAmount(val: number): string {
    return (val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  GetAllFinancialPeriod(){
    this.misService.GetAllFinancialPeriod().subscribe((res: any) => {
        if (res) {
          this.financialPeriodsStartDate = res[0].financialPeriodsStartDate;
          // this.financialPeriodsEndDate = this.parseApiDate(res.result.financialPeriodsEndDate);
          this.financialStartDate = this.byDate
            ? new Date()
            : new Date(this.financialPeriodsStartDate);
          this.financialEndDate = new Date(this.financialPeriodsEndDate);
        }
        this.loadBalanceSheet();
    });
  }

  private getFromDate(): Date {
    return this.byDate ? this.financialStartDate : this.financialPeriodsStartDate;
  }

  private getToDate(): Date {
    return this.byDate ? this.financialEndDate : this.financialPeriodsEndDate;
  }

  private parseApiDate(value: string | Date): Date {
    if (!value) {
      return new Date();
    }

    if (value instanceof Date) {
      return new Date(value.getTime());
    }

    const normalizedValue = value.includes('T') ? value : `${value}T00:00:00`;
    return new Date(normalizedValue);
  }

  private formatDisplayDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}

export interface MisReportParams {
  fromDate?: Date | null;
  toDate?: Date | null;
  includeZero: boolean;
  isSummaryView: boolean;
  locationId: number | null;
  costCenterId: number | null;
  mode: string;
  isMonthly: boolean;
  isFullYear: boolean;
  isGroupWise: boolean;
}

/**
 * Matches the actual API shape:
 * rowType/mainHead/subHead/relativeNo/relativeName/accNo/accName/
 * totalDebit/totalCredit/balance/sortOrder
 */
export interface BalanceSheetDto {
  rowType:
    | 'MAINHEAD'
    | 'SUBHEAD'
    | 'RELATIVEHEAD'
    | 'DETAIL'
    | 'RELATIVE_TOTAL'
    | 'MAIN_TOTAL'
    | 'GRAND_TOTAL'
    | 'CHECK';
  mainHead: string;
  subHead: string;
  relativeNo: string;
  relativeName: string;
  accNo: string;
  accName: string;
  totalDebit: number | null;
  totalCredit: number | null;
  balance: number | null;
  sortOrder: number;
}

/**
 * One printed line in the statement grid:
 * a Head row, a Sub Head row, a Group (relative) row, or an account/total line.
 */
export interface BalanceSheetDisplayRow {
  kind: 'HEAD' | 'SUBHEAD' | 'GROUP' | 'LINE';
  label: string;
  accNo?: string;
  totalDebit?: number | null;
  totalCredit?: number | null;
  balance?: number | null;
  rowType?: BalanceSheetDto['rowType'];
}