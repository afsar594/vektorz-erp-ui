import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem, MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { DatefilterComponent } from 'src/app/shared/component/datefilter/datefilter.component';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { StationMaster } from 'src/app/routes/domain/Administration/StationMaster';
import { ActivatedRoute } from '@angular/router';
import { PurchaseVoucherAnalysisMeasure, PurchaseVoucherMonthlyAnalysisRow } from 'src/app/routes/domain/Procurements/PurchaseVoucherMonthlyAnalysis';

@Component({
  selector: 'app-purchase-voucher-analysis',
  templateUrl: './purchase-voucher-analysis.component.html',
  styleUrls: ['./purchase-voucher-analysis.component.scss']
})
export class PurchaseVoucherAnalysisComponent implements OnInit {
  @ViewChild(DatefilterComponent) datefilterComponent!: DatefilterComponent;

  dataset: any[] = [];
  Permission: any;
  ScreenId: number;
  stationmasterObj: StationMaster;

  analysisForm: FormGroup;
  enableDate = false;
  selectedMeasure: PurchaseVoucherAnalysisMeasure = 'net';
  measureOptions: SelectItem[] = [
    { label: 'Voucher Count', value: 'voucherCount' },
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
  supplierShareData: any = null;
  supplierShareOptions: any;
  supplierShareLegend: { label: string; value: number; percent: number; color: string }[] = [];
  private readonly chartPalette: string[] = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#ec4899', '#64748b'];

  supplierList: SelectItem[] = [];
  locationList: SelectItem[] = [];
  jobList: SelectItem[] = [];
  itemList: SelectItem[] = [];
  itemGroupList: SelectItem[] = [];
  currencyList: SelectItem[] = [];
  vTypeList: SelectItem[] = [];

  private flatRows: PurchaseVoucherMonthlyAnalysisRow[] = [];
  private rangeStart: Date | null = null;
  private rangeEnd: Date | null = null;
  monthKeys: string[] = [];
  monthColumns: { key: string; label: string }[] = [];
  measureLabelText = 'Net';

  constructor(
    private fb: FormBuilder,
    private accountApi: AccountApiService,
    private utilityService: UtilityService,
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
      rptSupplier: [-1],
      rptLocation: [-1],
      rptJob: [-1],
      rptItem: [-1],
      rptItemGroup: [-1],
      rptCurrency: [-1],
      rptInvoiceType: ['ALL'],
      rptSuppInvNo: [''],
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
    this.supplierShareOptions = {
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
    this.accountApi.PurchaseLoadDropdown().subscribe({
      next: (m: any) => {
        const rs = m?.resultSet || m?.ResultSet || {};
        this.supplierList = (rs.suppliersMaster || []).map((k: any) => ({ label: k.suppliersMasterSupplierName, value: k.suppliersMasterSupplierId }));
        this.supplierList.unshift({ label: '--Select Supplier--', value: -1 });
        this.currencyList = (rs.currencyMasters || []).map((k: any) => ({ label: k.currencyMasterCurrencyName, value: k.currencyMasterCurrencyId }));
        this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
        this.jobList = (rs.jobMasters || []).map((k: any) => ({ label: k.jobMasterJobName, value: k.jobMasterJobId }));
        this.jobList.unshift({ label: '--Select Job--', value: -1 });
        this.locationList = (rs.locationMaster || []).filter((x: any) => x.locationMasterLocationStatus !== false).map((k: any) => ({ label: k.locationMasterLocationName, value: k.locationMasterLocationId }));
        this.locationList.unshift({ label: '--Select Location--', value: -1 });
        const itemMaster = rs.itemMaster || [];
        this.itemList = itemMaster.map((k: any) => ({ label: k.itemMasterItemName, value: k.itemMasterItemId }));
        this.itemList.unshift({ label: '--Select Item--', value: -1 });
        const itemGroups = rs.itemMasterGroup || [];
        this.itemGroupList = itemGroups.map((k: any) => ({ label: k.itemMasterItemName, value: k.itemMasterItemId }));
        this.itemGroupList.unshift({ label: '--Select Item Group--', value: -1 });
        this.vTypeList = [
          { label: 'ALL', value: 'ALL' },
          { label: 'CASH', value: 'CASH' },
          { label: 'CREDIT', value: 'CREDIT' }
        ];
      },
      error: (err) => {
        this.lastError = err?.error?.message || 'Unable to load Analysis filters.';
        this.messageService.add({ severity: 'error', summary: 'Filters unavailable', detail: this.lastError });
      }
    });
  }

  onMeasureChange(ev: any): void {
    this.selectedMeasure = ev.value || ev;
    this.rebuildMatrix(this.rangeStart, this.rangeEnd);
  }

  get supplierChartTitle(): string {
    const labels: any = { voucherCount: 'Voucher Count', gross: 'Gross', vat: 'VAT', net: 'Net', quantity: 'Quantity' };
    return `Supplier Contribution - Top 3 (${labels[this.selectedMeasure] || this.selectedMeasure})`;
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
      rptSummary: false,
      rptDetails: true,
      rptDateRange: this.enableDate,
      rptDtpFrom: fromDate,
      rptDtpTo: toDate,
      rptItem: this.analysisForm.value.rptItem,
      rptItemGroup: this.analysisForm.value.rptItemGroup,
      rptLocation: this.analysisForm.value.rptLocation,
      rptJob: this.analysisForm.value.rptJob,
      rptCurrency: this.analysisForm.value.rptCurrency,
      rptInvoiceType: this.analysisForm.value.rptInvoiceType,
      rptSupplier: this.analysisForm.value.rptSupplier,
      rptSuppInvNo: this.analysisForm.value.rptSuppInvNo || '',
      rptSupplierName: '',
      rptPrintGroupByItem: false,
      viewStockTransferType: []
    };
    this.isLoading = true;
    this.lastError = '';
    this.accountApi.GetPurchaseVoucherMonthlyAnalysis(payload)
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
          const rows: PurchaseVoucherMonthlyAnalysisRow[] = (result.rows || result.Rows || []).map((r: any) => ({
            year: r.year ?? r.Year,
            month: r.month ?? r.Month,
            monthKey: r.monthKey ?? r.MonthKey,
            monthLabel: r.monthLabel ?? r.MonthLabel,
            supplierId: r.supplierId ?? r.SupplierId,
            supplierName: r.supplierName ?? r.SupplierName,
            voucherCount: r.voucherCount ?? r.VoucherCount ?? 0,
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

    const supplierMap = new Map<string, { id: any; name: string }>();
    this.flatRows.forEach(r => {
      const key = `${r.supplierId ?? ''}|${r.supplierName}`;
      if (!supplierMap.has(key)) supplierMap.set(key, { id: r.supplierId, name: r.supplierName });
    });

    const getMeasure = (row: PurchaseVoucherMonthlyAnalysisRow): number => {
      switch (this.selectedMeasure) {
        case 'voucherCount': return row.voucherCount || 0;
        case 'gross': return row.grossBase || 0;
        case 'vat': return row.vatBase || 0;
        case 'quantity': return row.quantity || 0;
        default: return row.netBase || 0;
      }
    };

    const measureLabel = this.selectedMeasure === 'voucherCount' ? 'Voucher Count'
      : this.selectedMeasure === 'gross' ? `Gross (${this.baseCurrencyName})`
      : this.selectedMeasure === 'vat' ? `VAT (${this.baseCurrencyName})`
      : this.selectedMeasure === 'quantity' ? 'Quantity'
      : `Net (${this.baseCurrencyName})`;

    const matrix: any[] = [];
    supplierMap.forEach((sup) => {
      const rec: any = { supplierName: sup.name, supplierId: sup.id };
      let total = 0;
      this.monthKeys.forEach(mk => {
        const found = this.flatRows.find(fr => (fr.supplierId ?? '') === (sup.id ?? '') && fr.monthKey === mk && fr.supplierName === sup.name);
        const val = found ? getMeasure(found) : 0;
        rec[mk] = val;
        total += Number(val) || 0;
      });
      rec['total'] = total;
      matrix.push(rec);
    });

    if (matrix.length > 1) {
      const grand: any = { supplierName: 'Grand Total' };
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
    const dataRows = matrix.filter(r => r.supplierName !== 'Grand Total');
    if (!dataRows.length) {
      this.trendData = null;
      this.supplierShareData = null;
      this.supplierShareLegend = [];
      return;
    }

    const measureLabel = this.selectedMeasure === 'voucherCount' ? 'Voucher Count'
      : this.selectedMeasure === 'gross' ? `Gross (${this.baseCurrencyName})`
      : this.selectedMeasure === 'vat' ? `VAT (${this.baseCurrencyName})`
      : this.selectedMeasure === 'quantity' ? 'Quantity'
      : `Net (${this.baseCurrencyName})`;

    const trendValues = this.monthKeys.map(k => dataRows.reduce((sum, r) => sum + (Number(r[k]) || 0), 0));
    this.trendData = {
      labels: this.monthKeys.map(k => this.monthLabelFor(k)),
      datasets: [{
        label: measureLabel,
        data: trendValues,
        backgroundColor: '#0ea5e9',
        hoverBackgroundColor: '#0284c7',
        borderSkipped: false,
        maxBarThickness: 60
      }],
      tooltips: {
        callbacks: {
          label: (item: any, data: any) => `${data.labels[item.index]}: ${this.formatExact(item.yLabel)}`
        }
      }
    };

    const supplierTotals = dataRows
      .map(r => ({ label: r.supplierName, value: Number(r.total) || 0 }))
      .filter(r => r.value !== 0)
      .sort((a, b) => b.value - a.value);
    const totalSupplierValue = supplierTotals.reduce((sum, r) => sum + r.value, 0);
    const chartSuppliers = supplierTotals.slice(0, 3);
    const remaining = supplierTotals.slice(3);
    const remainingTotal = remaining.reduce((sum, r) => sum + r.value, 0);
    if (remainingTotal !== 0) {
      chartSuppliers.push({ label: 'Other Suppliers', value: remainingTotal });
    }

    this.supplierShareLegend = chartSuppliers.map((supplier, index) => ({
      label: supplier.label,
      value: supplier.value,
      percent: totalSupplierValue > 0 ? (supplier.value / totalSupplierValue) * 100 : 0,
      color: this.chartPalette[index % this.chartPalette.length]
    }));

    this.supplierShareData = chartSuppliers.length ? {
      labels: chartSuppliers.map(r => r.label),
      datasets: [{
        data: chartSuppliers.map(r => r.value),
        backgroundColor: chartSuppliers.map((_, index) => this.chartPalette[index % this.chartPalette.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }]
    } : null;
  }

  showPrint(): void {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Crystal report PurchaseVoucherMonthlyAnalysis will be enabled after the RPT is deployed. Web matrix shows the same data.' });
  }

  clear(): void {
    this.analysisForm.reset({ rptSupplier: -1, rptLocation: -1, rptJob: -1, rptItem: -1, rptItemGroup: -1, rptCurrency: -1, rptInvoiceType: 'ALL', rptSuppInvNo: '', measure: 'net' });
    this.selectedMeasure = 'net';
    this.enableDate = false;
    this.rangeStart = null;
    this.rangeEnd = null;
    this.lastError = '';
    this.flatRows = [];
    this.trendData = null;
    this.supplierShareData = null;
    this.supplierShareLegend = [];
    this.dataset = [];
    this.monthKeys = [];
    this.monthColumns = [];
  }
}
