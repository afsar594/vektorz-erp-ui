import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem, MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { DatefilterComponent } from 'src/app/shared/component/datefilter/datefilter.component';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { ActivatedRoute } from '@angular/router';
import { SalesAnalysisMeasure, SalesVoucherMonthlyAnalysisRow } from 'src/app/routes/domain/Sales/SalesVoucherMonthlyAnalysis';

@Component({
  selector: 'app-sales-voucher-analysis',
  templateUrl: './sales-voucher-analysis.component.html',
  styleUrls: ['./sales-voucher-analysis.component.scss']
})
export class SalesVoucherAnalysisComponent implements OnInit {
  @ViewChild(DatefilterComponent) datefilterComponent!: DatefilterComponent;

  Permission: any;
  ScreenId: number;
  stationmasterObj: StationMaster;

  analysisForm: FormGroup;
  enableDate = false;
  selectedMeasure: SalesAnalysisMeasure = 'net';
  measureOptions: SelectItem[] = [
    { label: 'Invoice Count', value: 'invoiceCount' },
    { label: 'Gross Amount', value: 'gross' },
    { label: 'VAT Amount', value: 'vat' },
    { label: 'Net Amount', value: 'net' },
    { label: 'Quantity', value: 'quantity' }
  ];
  baseCurrencyName = 'Base Currency';
  baseCurrencyId: number | null = null;
  isLoading = false;
  lastError = '';
  trendData: any = null;
  trendOptions: any;
  customerShareData: any = null;
  customerShareOptions: any;
  customerShareLegend: { label: string; value: number; percent: number; color: string }[] = [];
  private readonly chartPalette: string[] = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#ec4899', '#64748b'];

  customerList: SelectItem[] = [];
  locationList: SelectItem[] = [];
  jobList: SelectItem[] = [];
  itemList: SelectItem[] = [];
  itemGroupList: SelectItem[] = [];
  salesmanList: SelectItem[] = [];
  vTypeList: SelectItem[] = [];

  private flatRows: SalesVoucherMonthlyAnalysisRow[] = [];
  private rangeStart: Date | null = null;
  private rangeEnd: Date | null = null;
  monthKeys: string[] = [];
  monthColumns: { key: string; label: string }[] = [];
  measureLabelText = 'Net';
  dataset: any[] = [];

  constructor(
    private fb: FormBuilder,
    private accountApi: AccountApiService,
    private utilityService: UtilityService,
    private crystalReportService: CrystalReportService,
    private permission: PermissionsService,
    private activatedroute: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe(params => {
      this.ScreenId = +params['menu'];
      const rights = this.permission.getById(this.ScreenId);
      if (rights) {
        const res = rights[0];
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
    this.stationmasterObj = this.permission.getStation();
    this.analysisForm = this.fb.group({
      rptCustomer: [-1],
      rptLocation: [-1],
      rptJob: [-1],
      rptItem: [-1],
      rptItemGroup: [-1],
      rptSalesMan: [-1],
      rptVoucherType: ['ALL'],
      measure: ['net']
    });
    this.selectedMeasure = 'net';
    this.trendOptions = {
      maintainAspectRatio: false,
      legend: { display: false },
      scales: {
        yAxes: [{ type: 'linear', ticks: { beginAtZero: true, callback: (value) => this.formatCompact(value) }, gridLines: { color: 'rgba(0,0,0,0.08)' } }],
        xAxes: [{ gridLines: { display: false } }]
      },
      plugins: [{
        afterDatasetsDraw: (chart: any) => {
          const context = chart.ctx;
          chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((element: any, index: number) => {
              const value = dataset.data[index];
              if (value === null || value === undefined) return;
              const position = element._model;
              context.save();
              context.fillStyle = '#334155';
              context.font = '11px sans-serif';
              context.textAlign = 'center';
              context.fillText(this.formatCompact(value), position.x, Math.max(position.y - 6, 12));
              context.restore();
            });
          });
        }
      }]
    };
    this.customerShareOptions = {
      maintainAspectRatio: false,
      legend: { display: false },
      cutoutPercentage: 55,
      tooltips: {
        callbacks: {
          label: (item: any, data: any) => {
            const values: number[] = data.datasets[0].data;
            const value = Number(values[item.index]) || 0;
            const total = (values || []).reduce((sum: number, entry: any) => sum + (Number(entry) || 0), 0);
            const percent = total > 0 ? (value / total) * 100 : 0;
            return `${data.labels[item.index]}: ${this.formatExact(value)} (${percent.toFixed(2)}%)`;
          }
        }
      }
    };
    this.loadDropdowns();
    this.listAnalysis();
  }

  private loadDropdowns(): void {
    this.accountApi.LoadCustomerDropdown().subscribe({
      next: (m: any) => {
        const rs = m?.resultSet || m?.ResultSet || {};
        this.customerList = (rs.customerMasters || []).map((k: any) => ({
          label: k.customerMasterCustomerName,
          value: k.customerMasterCustomerNo
        }));
        this.customerList.unshift({ label: '--Select Customer--', value: -1 });
      },
      error: (err) => {
        this.lastError = err?.error?.message || 'Unable to load customers.';
        this.messageService.add({ severity: 'error', summary: 'Filters unavailable', detail: this.lastError });
      }
    });
    this.accountApi.LoadDropdownLocationMaster().subscribe((m: any) => {
      const rs = m?.resultSet || {};
      this.locationList = (rs.locationMaster || []).filter((x: any) => x.locationMasterLocationStatus !== false).map((k: any) => ({ label: k.locationMasterLocationName, value: k.locationMasterLocationId }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
    });
    this.accountApi.LoadDropdownItemMaster().subscribe((m: any) => {
      const rs = m?.resultSet || {};
      this.itemList = (rs.itemMaster || []).map((k: any) => ({ label: k.itemMasterItemName, value: k.itemMasterItemId }));
      this.itemList.unshift({ label: '--Select Item--', value: -1 });
    });
    this.accountApi.LoadDropdownItemGroupMaster().subscribe((m: any) => {
      const rs = m?.resultSet || {};
      this.itemGroupList = (rs.itemGroup || []).map((k: any) => ({ label: k.itemMasterItemName, value: k.itemMasterItemId }));
      this.itemGroupList.unshift({ label: '--Select Item Group--', value: -1 });
    });
    this.utilityService.LoadSaleManDropdown().subscribe((m: any) => {
      const rs = m?.resultSet || {};
      this.salesmanList = (rs.saleManList || []).map((k: any) => ({ label: k.salesManMasterSalesManName, value: k.salesManMasterSalesManId }));
      this.salesmanList.unshift({ label: '--Select Sales Man--', value: -1 });
    });
    this.vTypeList = [
      { label: 'ALL', value: 'ALL' },
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' }
    ];
  }

  onMeasureChange(ev: any): void {
    this.selectedMeasure = ev.value || ev;
    this.rebuildMatrix(this.rangeStart, this.rangeEnd);
  }

  makeDateRangeTrue(): void {
    this.enableDate = !this.enableDate;
  }

  private parseDate(value: any): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  private getMonthKeys(fromDate: Date | null, toDate: Date | null): string[] {
    if (!fromDate || !toDate) return [];
    const keys: string[] = [];
    const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    const end = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
    while (cursor <= end) {
      keys.push(`${cursor.getFullYear()}-${(cursor.getMonth() + 1).toString().padStart(2, '0')}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return keys;
  }

  listAnalysis(): void {
    if (this.enableDate && !this.datefilterComponent) {
      this.lastError = 'Select a valid date range before showing the report.';
      this.messageService.add({ severity: 'warn', summary: 'Date range', detail: this.lastError });
      return;
    }
    const { fromDate, toDate } = this.datefilterComponent ? this.datefilterComponent.onApplyDateFilter() : { fromDate: null, toDate: null };
    const rangeStart = this.enableDate ? this.parseDate(fromDate) : null;
    const rangeEnd = this.enableDate ? this.parseDate(toDate) : null;
    if (this.enableDate && (!rangeStart || !rangeEnd || rangeStart > rangeEnd)) {
      this.lastError = 'Select a valid From and To date range.';
      this.messageService.add({ severity: 'warn', summary: 'Date range', detail: this.lastError });
      return;
    }
    this.rangeStart = rangeStart;
    this.rangeEnd = rangeEnd;
    const payload: any = {
      CustomerId: this.analysisForm.value.rptCustomer,
      LocationId: this.analysisForm.value.rptLocation,
      SalemanId: this.analysisForm.value.rptSalesMan,
      ItemId: this.analysisForm.value.rptItem,
      itemGroupId: this.analysisForm.value.rptItemGroup,
      VType: this.analysisForm.value.rptVoucherType,
      IsDate: this.enableDate,
      Fromdate: fromDate,
      Todate: toDate
    };
    this.isLoading = true;
    this.lastError = '';
    this.accountApi.getSalesVoucherMonthlyAnalysis(payload)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (resp: any) => {
          const result = resp?.result ?? resp?.Result;
          if (!result) {
            this.lastError = resp?.message || resp?.Message || 'The analysis service returned no data.';
            this.messageService.add({ severity: 'error', summary: 'Analysis unavailable', detail: this.lastError });
            this.flatRows = [];
            this.rebuildMatrix(this.rangeStart, this.rangeEnd);
            return;
          }
          const rows: SalesVoucherMonthlyAnalysisRow[] = (result.rows || result.Rows || []).map((r: any) => ({
            year: r.year ?? r.Year,
            month: r.month ?? r.Month,
            monthKey: r.monthKey ?? r.MonthKey,
            monthLabel: r.monthLabel ?? r.MonthLabel,
            customerId: r.customerId ?? r.CustomerId,
            customerName: r.customerName ?? r.CustomerName,
            invoiceCount: r.invoiceCount ?? r.InvoiceCount ?? 0,
            grossBase: r.grossBase ?? r.GrossBase ?? 0,
            vatBase: r.vatBase ?? r.VatBase ?? 0,
            netBase: r.netBase ?? r.NetBase ?? 0,
            quantity: r.quantity ?? r.Quantity ?? 0,
            baseCurrencyId: r.baseCurrencyId ?? result.baseCurrencyId ?? result.BaseCurrencyId,
            baseCurrencyName: r.baseCurrencyName ?? result.baseCurrencyName ?? result.BaseCurrencyName
          }));
          this.flatRows = rows;
          this.baseCurrencyName = result.baseCurrencyName || result.BaseCurrencyName || 'Base Currency';
          this.baseCurrencyId = result.baseCurrencyId ?? result.BaseCurrencyId ?? null;
          this.rebuildMatrix(this.rangeStart, this.rangeEnd);
          if (!rows.length) {
            this.messageService.add({ severity: 'info', summary: 'Info', detail: 'No record found for selected filters' });
          }
        },
        error: (err) => {
          this.lastError = err?.error?.message || err?.message || 'Failed to load analysis. Check that the API is running and restart it after backend updates.';
          this.messageService.add({ severity: 'error', summary: 'Analysis unavailable', detail: this.lastError });
          this.flatRows = [];
          this.rebuildMatrix(this.rangeStart, this.rangeEnd);
        }
      });
  }

  private rebuildMatrix(rangeStart: Date | null = null, rangeEnd: Date | null = null): void {
    const selectedMonthKeys = this.getMonthKeys(rangeStart, rangeEnd);
    const responseMonthKeys = Array.from(new Set<string>(this.flatRows.map(r => r.monthKey))).sort();
    this.monthKeys = selectedMonthKeys.length > 0 ? selectedMonthKeys : responseMonthKeys;
    this.monthColumns = this.monthKeys.map(k => ({ key: k, label: this.monthLabelFor(k) }));

    const customerMap = new Map<string, { id: any; name: string }>();
    this.flatRows.forEach(r => {
      const key = `${r.customerId ?? ''}|${r.customerName}`;
      if (!customerMap.has(key)) customerMap.set(key, { id: r.customerId, name: r.customerName });
    });

    const getMeasure = (row: SalesVoucherMonthlyAnalysisRow): number => {
      switch (this.selectedMeasure) {
        case 'invoiceCount': return row.invoiceCount || 0;
        case 'gross': return row.grossBase || 0;
        case 'vat': return row.vatBase || 0;
        case 'quantity': return row.quantity || 0;
        default: return row.netBase || 0;
      }
    };

    const measureLabel = this.selectedMeasure === 'invoiceCount' ? 'Invoice Count'
      : this.selectedMeasure === 'gross' ? `Gross (${this.baseCurrencyName})`
      : this.selectedMeasure === 'vat' ? `VAT (${this.baseCurrencyName})`
      : this.selectedMeasure === 'quantity' ? 'Quantity'
      : `Net (${this.baseCurrencyName})`;

    const matrix: any[] = [];
    customerMap.forEach((cust) => {
      const rec: any = { customerName: cust.name, customerId: cust.id };
      let total = 0;
      this.monthKeys.forEach(mk => {
        const found = this.flatRows.find(fr => (fr.customerId ?? '') === (cust.id ?? '') && fr.monthKey === mk && fr.customerName === cust.name);
        const val = found ? getMeasure(found) : 0;
        rec[mk] = val;
        total += Number(val) || 0;
      });
      rec['total'] = total;
      matrix.push(rec);
    });

    if (matrix.length > 1) {
      const grand: any = { customerName: 'Grand Total' };
      this.monthKeys.forEach(mk => {
        grand[mk] = matrix.reduce((s, r) => s + (Number(r[mk]) || 0), 0);
      });
      grand['total'] = matrix.reduce((s, r) => s + (Number(r['total']) || 0), 0);
      matrix.push(grand);
    }

    this.dataset = matrix;
    this.buildCharts(matrix);
    this.measureLabelText = measureLabel;
  }

  private monthLabelFor(key: string): string {
    const row = this.flatRows.find(r => r.monthKey === key);
    const year = Number(key.substring(0, 4));
    const month = Number(key.substring(5, 7));
    return row?.monthLabel || new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  private buildCharts(matrix: any[]): void {
    const dataRows = matrix.filter(r => r.customerName !== 'Grand Total');
    if (!dataRows.length) {
      this.trendData = null;
      this.customerShareData = null;
      this.customerShareLegend = [];
      return;
    }

    const trendValues = this.monthKeys.map(k => dataRows.reduce((sum, r) => sum + (Number(r[k]) || 0), 0));
    this.trendData = {
      labels: this.monthKeys.map(k => this.monthLabelFor(k)),
      datasets: [{
        label: this.measureLabelText,
        data: trendValues,
        backgroundColor: '#0ea5e9',
        hoverBackgroundColor: '#0284c7',
        borderSkipped: false,
        maxBarThickness: 60
      }]
    };

    const customerTotals = dataRows
      .map(r => ({ label: r.customerName, value: Number(r.total) || 0 }))
      .filter(r => r.value !== 0)
      .sort((a, b) => b.value - a.value);
    const chartCustomers = customerTotals.slice(0, 3);
    const remaining = customerTotals.slice(3);
    const remainingTotal = remaining.reduce((sum, r) => sum + r.value, 0);
    if (remainingTotal !== 0) {
      chartCustomers.push({ label: 'Other Customers', value: remainingTotal });
    }

    const totalCustomerValue = customerTotals.reduce((sum, r) => sum + r.value, 0);
    this.customerShareLegend = chartCustomers.map((cust, index) => ({
      label: cust.label,
      value: cust.value,
      percent: totalCustomerValue > 0 ? (cust.value / totalCustomerValue) * 100 : 0,
      color: this.chartPalette[index % this.chartPalette.length]
    }));

    this.customerShareData = chartCustomers.length ? {
      labels: chartCustomers.map(r => r.label),
      datasets: [{
        data: chartCustomers.map(r => r.value),
        backgroundColor: chartCustomers.map((_, index) => this.chartPalette[index % this.chartPalette.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }]
    } : null;
  }

  formatCompact(value: number): string {
    const number = Number(value) || 0;
    const absolute = Math.abs(number);
    if (absolute >= 1000000000) return `${(number / 1000000000).toFixed(2)}B`;
    if (absolute >= 1000000) return `${(number / 1000000).toFixed(2)}M`;
    if (absolute >= 1000) return `${(number / 1000).toFixed(2)}K`;
    return number.toFixed(2);
  }

  formatExact(value: number): string {
    return (Number(value) || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  get customerChartTitle(): string {
    const labels: any = { invoiceCount: 'Invoice Count', gross: 'Gross', vat: 'VAT', net: 'Net', quantity: 'Quantity' };
    return `Customer Contribution - Top 3 (${labels[this.selectedMeasure] || this.selectedMeasure})`;
  }

  showPrint(): void {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Crystal report SalesVoucherMonthlyAnalysis will be enabled after the RPT is deployed. Web matrix shows the same data.' });
  }

  clear(): void {
    this.analysisForm.reset({ rptCustomer: -1, rptLocation: -1, rptJob: -1, rptItem: -1, rptItemGroup: -1, rptSalesMan: -1, rptVoucherType: 'ALL', measure: 'net' });
    this.selectedMeasure = 'net';
    this.enableDate = false;
    this.rangeStart = null;
    this.rangeEnd = null;
    this.lastError = '';
    this.flatRows = [];
    this.trendData = null;
    this.customerShareData = null;
    this.customerShareLegend = [];
    this.dataset = [];
    this.monthKeys = [];
    this.monthColumns = [];
  }
}
