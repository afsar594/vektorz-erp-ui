import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DashboardDataService } from '../../../service/dashboard/dashboard.service';
import { MISService } from '../../../service/mis/mis.service';

export interface ProductSaleItem {
  rank: number;
  name: string;
  qty: number;
  salesAmount: number;
  profit: number;
}

export interface CustomerSummaryItem {
  rank: number;
  name: string;
  totalSales: number;
  outstanding: number;
}

export interface SupplierSummaryItem {
  rank: number;
  name: string;
  purchaseAmount: number;
  outstanding: number;
}

export interface AlertItem {
  icon: string;
  iconClass: string;
  badgeClass: string;
  title: string;
  countOrAmount: string;
  route?: string;
  queryParams?: any;
}

export interface PurchaseOverviewItem {
  icon: string;
  iconBgClass: string;
  title: string;
  amountOrCount: string;
  badgeText: string;
  badgeType: 'up' | 'down' | 'alert';
}

@Component({
  selector: 'app-new-dashboard',
  templateUrl: './new-dashboard.component.html',
  styleUrls: ['./new-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewDashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  @ViewChild('tt1') tt1: any;
  @ViewChild('tt2') tt2: any;
  @ViewChild('tt3') tt3: any;
  @ViewChild('tt4') tt4: any;
  @ViewChild('dashRangeCal') dashRangeCal: any;

  // Header State
  selectedDate: string = '13 Sep 2026';
  selectedDateRange: Date[] = [new Date(), new Date()];
  maxDashboardDate: Date = new Date();
  branches: { label: string; value: string }[] = [
    { label: 'Branch: All Branches', value: 'ALL' },
  ];
  selectedBranch: string = 'ALL';

  // Primary Metrics (Top 5 Cards) - populated from GetMainDashboard, dash until loaded
  primaryMetrics = {
    totalSalesToday: 0,
    salesComparison: '—',
    totalPurchasesToday: 0,
    purchaseComparison: '—',
    grossProfitToday: 0,
    grossProfitComparison: '—',
    totalStockValue: 0,
    stockComparison: '—',
    accountsReceivable: 0,
    arNote: '—',
  };

  // Secondary Metrics (Row 2 - 6 White Cards) - populated from GetMainDashboard, dash until loaded
  secondaryMetrics = {
    invoicesThisMonth: 0,
    invoicesGrowth: '—',
    avgInvoiceValue: 0,
    avgInvoiceGrowth: '—',
    cashSales: 0,
    cashSalesPercent: '—',
    creditSales: 0,
    creditSalesPercent: '—',
    salesReturns: 0,
    salesReturnsPercent: '—',
    netSales: 0,
    grossMarginPercent: '—',
  };

  // Split Summary Metrics - populated from GetMainDashboard, dash until loaded
  incomingPdcReceived: string = '—';
  incomingPdcIssue: string = '—';
  currentMonthPurchase: string = '—';
  currentMonthSales: string = '—';
  prevMonthPurchase: string = '—';
  prevMonthSales: string = '—';
  currMonthExpense: string = '—';
  prevMonthExpense: string = '—';

  // Approved / Pending Counts - populated from API, zero until loaded
  purchaseRequisitionCount: number = 0;
  purchaseOrderCount: number = 0;
  approvedOrdersCount: number = 0;

  // Loading state - values show em-dash until the API resolves
  dashboardLoaded: boolean = false;

  // Label for the "(Today)" cards: 'Today' when the business day is today,
  // otherwise the actual date (e.g. '17 Sep 2026') so the cards explain themselves.
  todayCardLabel: string = 'Today';

  // Interactive Data Tabs (Suppliers, Customers, PDC Issued, PDC Recieved) - API only
  selectedTabIndex: number = 0;
  tabs: string[] = ['Suppliers', 'Customers', 'PDC Issued', 'PDC Recieved'];
  isTabLoading: boolean = false;
  tabSearchText: string = '';

  supplierCols = [
    { field: 'MA_AccName', header: 'Supplier' },
    { field: 'Amount', header: 'Amount' },
  ];
  supplierData: any[] = [];

  customerCols = [
    { field: 'MA_AccName', header: 'Customer' },
    { field: 'Amount', header: 'Amount' },
  ];
  customerData: any[] = [];

  pdcIssueCols = [
    { field: 'PartyName', header: 'Party' },
    { field: 'PDate', header: 'Date' },
    { field: 'CAmount', header: 'Amount' },
  ];
  pdcIssueData: any[] = [];

  pdcReceiveCols = [
    { field: 'PartyName', header: 'Party' },
    { field: 'PDate', header: 'Date' },
    { field: 'CAmount', header: 'Amount' },
  ];
  pdcReceiveData: any[] = [];

  // Chart 1: Sales Trend (Bar + Overlaid Line)
  salesTrendData: any;
  salesTrendOptions: any;

  // Chart 2: Sales by Category (Donut) - API only, empty until loaded
  categoryDonutData: any;
  categoryDonutOptions: any;
  categoryItems: { label: string; percent: number; amount: number; color: string }[] = [];

  // Chart 2b: Sales by Branch (Donut, real data)
  branchSalesData: any;
  branchSalesItems: { label: string; percent: number; amount: number; color: string }[] = [];
  branchTotal: number = 0;
  categoryTotal: number = 0;

  private donutPalette: string[] = [
    '#0ea5e9', '#06b6d4', '#10b981', '#f59e0b',
    '#8b5cf6', '#94a3b8', '#ef4444', '#14b8a6',
  ];

  // Chart 3: Stock Status (Donut) - API only, empty until loaded
  stockStatusDonutData: any;
  stockStatusDonutOptions: any;
  totalStockItemsCount = 0;
  stockStatusItems: { label: string; count: number; percent: number; color: string }[] = [];

  // Table: Top 10 Products (by Sales) - API only, empty until loaded
  topProducts: ProductSaleItem[] = [];

  // Chart 4: Profit Analysis (Combo Multi-Bar + Line)
  profitAnalysisData: any;
  profitAnalysisOptions: any;

  // Widget: Purchase Overview - amounts from GetMainDashboard, dash until loaded
  purchaseOverviewItems: PurchaseOverviewItem[] = [
    {
      icon: 'pi pi-shopping-cart',
      iconBgClass: 'icon-bg-blue',
      title: 'Purchase Today',
      amountOrCount: '—',
      badgeText: '—',
      badgeType: 'up',
    },
    {
      icon: 'pi pi-briefcase',
      iconBgClass: 'icon-bg-cyan',
      title: 'Purchase This Month',
      amountOrCount: '—',
      badgeText: '—',
      badgeType: 'up',
    },
    {
      icon: 'pi pi-file',
      iconBgClass: 'icon-bg-amber',
      title: 'Pending Purchase Orders',
      amountOrCount: '—',
      badgeText: '—',
      badgeType: 'alert',
    },
    {
      icon: 'pi pi-file-o',
      iconBgClass: 'icon-bg-emerald',
      title: 'Goods Received (This Month)',
      amountOrCount: '—',
      badgeText: '—',
      badgeType: 'up',
    },
    {
      icon: 'pi pi-replay',
      iconBgClass: 'icon-bg-orange',
      title: 'Purchase Returns',
      amountOrCount: '—',
      badgeText: '—',
      badgeType: 'down',
    },
    {
      icon: 'pi pi-bell',
      iconBgClass: 'icon-bg-red',
      title: 'Supplier Payables',
      amountOrCount: '—',
      badgeText: '—',
      badgeType: 'alert',
    },
  ];

  // Table: Top 5 Customers - API only, empty until loaded
  topCustomers: CustomerSummaryItem[] = [];

  // Table: Top 5 Suppliers - API only, empty until loaded
  topSuppliers: SupplierSummaryItem[] = [];

  // List: Alerts & Notifications - API only, empty until loaded
  alertItems: AlertItem[] = [];

  constructor(
    private dashboardDataService: DashboardDataService,
    private misService: MISService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.setupDateDisplay();
    this.initSalesTrendChart();
    this.initCategoryDonutChart();
    this.initStockStatusDonutChart();
    this.initProfitAnalysisChart();
    this.loadBackendData();
    this.loadMainDashboard();
    this.loadTabsData(0);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private fmtDay(d: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  private setupDateDisplay(): void {
    const r = this.selectedDateRange || [];
    if (r.length === 2 && r[0] && r[1]) {
      this.selectedDate = this.toISODate(r[0]) === this.toISODate(r[1])
        ? this.fmtDay(r[0])
        : `${this.fmtDay(r[0])} - ${this.fmtDay(r[1])}`;
    } else {
      this.selectedDate = this.fmtDay(new Date());
    }
  }

  onDashboardDateRangeChange(range: Date[]): void {
    if (!range || range.length !== 2 || !range[0] || !range[1]) {
      return;
    }
    this.selectedDateRange = range;
    this.setupDateDisplay();
    if (this.dashRangeCal && typeof this.dashRangeCal.hideOverlay === 'function') {
      this.dashRangeCal.hideOverlay();
    }
    this.loadMainDashboard();
  }

  private toISODate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  private loadBackendData(): void {
    // 1. Ingest PDC & Summary Metrics from existing API
    this.subscriptions.add(
      this.dashboardDataService.getPDC().subscribe(
        (response: any) => {
          if (!response || !response.resultSet) return;

          const list: any[] = response.resultSet.data || [];
          const vouchers: any[] = response.resultSet.groupedData || [];

          // Split Summary Items
          const incomingdaypdcReceived = list.find(
            (a) => a.type === 'SPLIT' && a.discription === 'Incoming PDC Amt. (Received) In 5 Days'
          );
          if (incomingdaypdcReceived && incomingdaypdcReceived.value != null) {
            this.incomingPdcReceived = Number(incomingdaypdcReceived.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          const incomingdaypdcIssue = list.find(
            (a) => a.type === 'SPLIT' && a.discription === 'Incoming PDC Amt. (Issued) In 5 Days'
          );
          if (incomingdaypdcIssue && incomingdaypdcIssue.value != null) {
            this.incomingPdcIssue = Number(incomingdaypdcIssue.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          const currMonthPurchase = list.find(
            (a) => a.type === 'SPLIT' && a.discription === 'Current Month Purchase'
          );
          if (currMonthPurchase && currMonthPurchase.value != null) {
            this.currentMonthPurchase = Number(currMonthPurchase.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            this.purchaseOverviewItems[1].amountOrCount = `AED ${this.currentMonthPurchase}`;
          }

          const currMonthSales = list.find(
            (a) => a.type === 'SPLIT' && a.discription === 'Current Month Sales'
          );
          if (currMonthSales && currMonthSales.value != null) {
            this.currentMonthSales = Number(currMonthSales.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            this.secondaryMetrics.netSales = Number(currMonthSales.value);
          }

          const prevMonthPurchase = list.find(
            (a) => a.type === 'SPLIT' && a.discription === 'Prev. Month Purchase'
          );
          if (prevMonthPurchase && prevMonthPurchase.value != null) {
            this.prevMonthPurchase = Number(prevMonthPurchase.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          const prevMonthSales = list.find(
            (a) => a.type === 'SPLIT' && a.discription === 'Prev. Month Sales'
          );
          if (prevMonthSales && prevMonthSales.value != null) {
            this.prevMonthSales = Number(prevMonthSales.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          const currMonthExpense = list.find(
            (a) => a.type === 'SPLIT' && a.discription === 'Current Month Expenses'
          );
          if (currMonthExpense && currMonthExpense.value != null) {
            this.currMonthExpense = Number(currMonthExpense.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          const prevMonthExpense = list.find(
            (a) => a.type === 'SPLIT' && a.discription === 'Prev. Month Expenses'
          );
          if (prevMonthExpense && prevMonthExpense.value != null) {
            this.prevMonthExpense = Number(prevMonthExpense.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          // Cash & Bank balance
          const cashBalance = list.find(
            (a) => a.type === 'TOTAL' && a.discription === 'Total Cash Balance'
          );
          if (cashBalance && cashBalance.value) {
            this.secondaryMetrics.cashSales = Number(cashBalance.value);
          }

          // Approval Section Counts
          const pendingOrders = vouchers.filter(
            (a) => a.voucherType === 'Purchase Order' && a.status === 'Pending'
          );
          this.purchaseOrderCount = pendingOrders ? pendingOrders.length : 0;
          this.purchaseOverviewItems[2].amountOrCount = `${this.purchaseOrderCount}`;
          this.alertItems[5].countOrAmount = `${this.purchaseOrderCount}`;

          const pendingRequisition = vouchers.filter(
            (a) => a.voucherType === 'Purchase Requisition' && a.status === 'Pending'
          );
          this.purchaseRequisitionCount = pendingRequisition ? pendingRequisition.length : 0;

          const approvedOrders = vouchers.filter(
            (a) => a.voucherType === 'Purchase Order' && a.status === 'Approved'
          );
          this.approvedOrdersCount = approvedOrders ? approvedOrders.length : 0;

          this.cdr.markForCheck();
        },
        (error) => {
          console.warn('Dashboard PDC API call skipped or errored, using mock dataset:', error);
        }
      )
    );

    // 2. Ingest Customers & Suppliers Top Lists for the mini-tables
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const reqCustomer = {
      Type: 'CUSTOMER',
      StartDate: startDate.toISOString().split('T')[0],
      EndDate: currentDate.toISOString().split('T')[0],
    };

    this.subscriptions.add(
      this.dashboardDataService.GetTabsChart(reqCustomer).subscribe(
        (response: any) => {
          if (response && response.resultSet && response.resultSet.length > 0) {
            const mappedCustomers = response.resultSet.slice(0, 5).map((item: any, index: number) => ({
              rank: index + 1,
              name: item.MA_AccName || item.Customer || `Customer ${index + 1}`,
              totalSales: Number(item.Amount || item.TotalSales || 0),
              outstanding: Number(item.Amount || 0),
            }));
            if (mappedCustomers.length > 0) {
              this.topCustomers = mappedCustomers;
            }
          }
          this.cdr.markForCheck();
        },
        () => {}
      )
    );

    const reqSupplier = {
      Type: 'SUPPLIER',
      StartDate: startDate.toISOString().split('T')[0],
      EndDate: currentDate.toISOString().split('T')[0],
    };

    this.subscriptions.add(
      this.dashboardDataService.GetTabsChart(reqSupplier).subscribe(
        (response: any) => {
          if (response && response.resultSet && response.resultSet.length > 0) {
            const mappedSuppliers = response.resultSet.slice(0, 5).map((item: any, index: number) => ({
              rank: index + 1,
              name: item.MA_AccName || item.Supplier || `Supplier ${index + 1}`,
              purchaseAmount: Number(item.Amount || item.TotalPurchase || 0),
              outstanding: Number(item.Amount || 0),
            }));
            if (mappedSuppliers.length > 0) {
              this.topSuppliers = mappedSuppliers;
            }
          }
          this.cdr.markForCheck();
        },
        () => {}
      )
    );
  }

  // Multi-Tab Data Fetching
  selectTab(index: number): void {
    this.selectedTabIndex = index;
    this.tabSearchText = '';
    this.loadTabsData(index);
  }

  loadTabsData(choice: number): void {
    const type =
      choice === 0
        ? 'SUPPLIER'
        : choice === 1
        ? 'CUSTOMER'
        : choice === 2
        ? 'PDC_ISSUED'
        : 'PDC_RECEIVED';

    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const req = {
      Type: type,
      StartDate: startDate.toISOString().split('T')[0],
      EndDate: currentDate.toISOString().split('T')[0],
    };

    this.isTabLoading = true;
    this.subscriptions.add(
      this.dashboardDataService.GetTabsChart(req).subscribe(
        (response: any) => {
          this.isTabLoading = false;
          // Never wipe loaded tables on an empty response.
          if (response && Array.isArray(response.resultSet) && response.resultSet.length > 0) {
            if (choice === 0) {
              this.supplierData = response.resultSet;
            } else if (choice === 1) {
              this.customerData = response.resultSet;
            } else if (choice === 2) {
              this.pdcIssueData = response.resultSet;
            } else if (choice === 3) {
              this.pdcReceiveData = response.resultSet;
            }
          }
          this.cdr.markForCheck();
        },
        (err) => {
          this.isTabLoading = false;
          console.warn('Error loading tab data for choice:', choice, err);
          this.cdr.markForCheck();
        }
      )
    );
  }

  // Consolidated dashboard API (single call for all widgets)
  private loadMainDashboard(): void {
    const loc = this.selectedBranch && this.selectedBranch !== 'ALL' ? Number(this.selectedBranch) : null;
    const r = this.selectedDateRange || [];
    const req = {
      startDate: r[0] ? this.toISODate(r[0]) : null,
      endDate: r[1] ? this.toISODate(r[1]) : null,
      locationId: loc,
    };
    this.subscriptions.add(
      this.dashboardDataService.GetMainDashboard(req).subscribe(
        (res: any) => {
          const d = res && res.result ? res.result : null;
          if (!d) {
            return;
          }
          this.applyMainDashboard(d);
          this.cdr.markForCheck();
        },
        (err) => {
          console.warn('Main dashboard API unavailable, using fallback dataset.', err);
        }
      )
    );
  }

  private fmt2(v: any): string {
    return Number(v || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private applyMainDashboard(d: any): void {
    this.dashboardLoaded = true;
    // Primary KPI cards
    if (d.primary) {
      this.primaryMetrics.totalSalesToday = Number(d.primary.salesToday || 0);
      this.primaryMetrics.totalPurchasesToday = Number(d.primary.purchasesToday || 0);
      this.primaryMetrics.grossProfitToday = Number(d.primary.grossProfitToday || 0);
      this.primaryMetrics.totalStockValue = Number(d.primary.stockValue || 0);
      this.primaryMetrics.accountsReceivable = Number(d.primary.accountsReceivable || 0);
      // The "(Today)" cards show the latest business day with vouchers, which may
      // differ from calendar today - label the cards with the actual date then.
      const biz = d.primary.businessDate || '';
      this.todayCardLabel = biz && biz !== this.fmtDay(new Date()) ? biz : 'Today';
      if (d.primary.salesTodayChange) {
        this.primaryMetrics.salesComparison = d.primary.salesTodayChange;
      } else {
        this.primaryMetrics.salesComparison = '0.0% vs. yesterday';
      }
      if (d.primary.purchasesTodayChange) {
        this.primaryMetrics.purchaseComparison = d.primary.purchasesTodayChange;
      } else {
        this.primaryMetrics.purchaseComparison = '0.0% vs. yesterday';
      }
      if (d.primary.profitTodayChange) {
        this.primaryMetrics.grossProfitComparison = d.primary.profitTodayChange;
      } else {
        this.primaryMetrics.grossProfitComparison = '0.0% vs. yesterday';
      }
      if (d.primary.stockNote) {
        this.primaryMetrics.stockComparison = d.primary.stockNote;
      } else {
        this.primaryMetrics.stockComparison = '0 of 0 items in stock';
      }
      if (d.primary.arNote) {
        this.primaryMetrics.arNote = d.primary.arNote;
      } else {
        this.primaryMetrics.arNote = '0 customers outstanding';
      }
    }

    // Secondary KPI cards
    if (d.secondary) {
      const s = d.secondary;
      const cash = Number(s.cashSales || 0);
      const credit = Number(s.creditSales || 0);
      const cashCreditTotal = cash + credit;
      const net = Number(s.netSales || 0);
      this.secondaryMetrics.invoicesThisMonth = Number(s.invoicesThisMonth || 0);
      this.secondaryMetrics.avgInvoiceValue = Math.round(Number(s.avgInvoiceValue || 0));
      this.secondaryMetrics.cashSales = cash;
      this.secondaryMetrics.cashSalesPercent =
        cashCreditTotal > 0 ? `${Math.round((cash / cashCreditTotal) * 100)}% of total sales` : '0% of total sales';
      this.secondaryMetrics.creditSales = credit;
      this.secondaryMetrics.creditSalesPercent =
        cashCreditTotal > 0 ? `${Math.round((credit / cashCreditTotal) * 100)}% of total sales` : '0% of total sales';
      this.secondaryMetrics.salesReturns = Number(s.salesReturns || 0);
      this.secondaryMetrics.salesReturnsPercent =
        net > 0 ? `${((Number(s.salesReturns || 0) / net) * 100).toFixed(1)}% of net sales` : '0% of net sales';
      this.secondaryMetrics.netSales = net;
      this.secondaryMetrics.invoicesGrowth = '';
      this.secondaryMetrics.avgInvoiceGrowth = '';
    } else {
      this.secondaryMetrics.invoicesThisMonth = 0;
      this.secondaryMetrics.avgInvoiceValue = 0;
      this.secondaryMetrics.cashSales = 0;
      this.secondaryMetrics.cashSalesPercent = '0% of total sales';
      this.secondaryMetrics.creditSales = 0;
      this.secondaryMetrics.creditSalesPercent = '0% of total sales';
      this.secondaryMetrics.salesReturns = 0;
      this.secondaryMetrics.salesReturnsPercent = '0% of net sales';
      this.secondaryMetrics.netSales = 0;
      this.secondaryMetrics.grossMarginPercent = 'Gross Margin 0.0%';
      this.secondaryMetrics.invoicesGrowth = '';
      this.secondaryMetrics.avgInvoiceGrowth = '';
    }

    // Split summary (month vs prev month)
    if (d.split) {
      this.currentMonthPurchase = this.fmt2(d.split.currentMonthPurchase);
      this.currentMonthSales = this.fmt2(d.split.currentMonthSales);
      this.prevMonthPurchase = this.fmt2(d.split.prevMonthPurchase);
      this.prevMonthSales = this.fmt2(d.split.prevMonthSales);
      this.currMonthExpense = this.fmt2(d.split.currentMonthExpenses);
      this.prevMonthExpense = this.fmt2(d.split.prevMonthExpenses);
      this.secondaryMetrics.netSales = Number(d.secondary ? d.secondary.netSales || 0 : this.secondaryMetrics.netSales);
      const profit6 = Array.isArray(d.profitAnalysis)
        ? d.profitAnalysis.reduce((acc: number, m: any) => acc + Number(m.grossProfit || 0), 0)
        : 0;
      if (this.secondaryMetrics.netSales > 0) {
        this.secondaryMetrics.grossMarginPercent = `Gross Margin ${((profit6 / this.secondaryMetrics.netSales) * 100).toFixed(1)}%`;
      } else {
        this.secondaryMetrics.grossMarginPercent = 'Gross Margin 0.0%';
      }
      // PDC 5-day liquidity comes from the legacy summary feed (currently empty) - zero, not dash.
      this.incomingPdcReceived = '0.00';
      this.incomingPdcIssue = '0.00';
    }

    // Purchase overview + approval counts
    if (d.purchaseOverview) {
      const p = d.purchaseOverview;
      const prevPurch = d.split ? Number(d.split.prevMonthPurchase || 0) : 0;
      const purchMonth = Number(p.purchaseMonth || 0);
      const purchDelta = prevPurch > 0 ? Math.round(((purchMonth - prevPurch) / prevPurch) * 100) : 0;
      this.purchaseOverviewItems[0].amountOrCount = `AED ${this.formatNumber(p.purchaseToday)}`;
      this.purchaseOverviewItems[0].badgeText = '';
      this.purchaseOverviewItems[1].amountOrCount = `AED ${this.formatNumber(purchMonth)}`;
      this.purchaseOverviewItems[1].badgeText = `${purchDelta >= 0 ? '↑' : '↓'} ${Math.abs(purchDelta)}%`;
      this.purchaseOverviewItems[1].badgeType = purchDelta >= 0 ? 'up' : 'down';
      this.purchaseOverviewItems[2].amountOrCount = `${Number(p.pendingPurchaseOrders || 0)}`;
      this.purchaseOverviewItems[2].badgeText = '!';
      this.purchaseOverviewItems[3].amountOrCount = `AED ${this.formatNumber(p.goodsReceivedMonth)}`;
      this.purchaseOverviewItems[3].badgeText = '';
      this.purchaseOverviewItems[4].amountOrCount = `AED ${this.formatNumber(p.purchaseReturns)}`;
      this.purchaseOverviewItems[4].badgeText = '';
      this.purchaseOverviewItems[5].amountOrCount = `AED ${this.formatNumber(p.supplierPayables)}`;
      this.purchaseOverviewItems[5].badgeText = '!';
      this.purchaseOrderCount = Number(p.pendingPurchaseOrders || 0);
      this.approvedOrdersCount = Number(p.approvedPurchaseOrders || 0);
    } else {
      this.purchaseOverviewItems[0].amountOrCount = 'AED 0';
      this.purchaseOverviewItems[0].badgeText = '';
      this.purchaseOverviewItems[1].amountOrCount = 'AED 0';
      this.purchaseOverviewItems[1].badgeText = '0%';
      this.purchaseOverviewItems[1].badgeType = 'up';
      this.purchaseOverviewItems[2].amountOrCount = '0';
      this.purchaseOverviewItems[2].badgeText = '!';
      this.purchaseOverviewItems[3].amountOrCount = 'AED 0';
      this.purchaseOverviewItems[3].badgeText = '';
      this.purchaseOverviewItems[4].amountOrCount = 'AED 0';
      this.purchaseOverviewItems[4].badgeText = '';
      this.purchaseOverviewItems[5].amountOrCount = 'AED 0';
      this.purchaseOverviewItems[5].badgeText = '!';
      this.purchaseOrderCount = 0;
      this.approvedOrdersCount = 0;
    }

    // Alerts (no expiry entry - removed)
    if (Array.isArray(d.alerts) && d.alerts.length > 0) {
      const find = (key: string) => d.alerts.find((a: any) => a.key === key);
      const out = find('out');
      const low = find('low');
      const ar = find('ar');
      const ap = find('ap');
      const po = find('po');
      const pr = find('pr');
      this.alertItems = [
        { icon: 'pi pi-ban', iconClass: 'alert-icon-red', badgeClass: 'badge-red', title: 'Out of Stock', countOrAmount: out ? out.countOrAmount : '0 items' },
        { icon: 'pi pi-exclamation-triangle', iconClass: 'alert-icon-amber', badgeClass: 'badge-amber', title: 'Low Stock', countOrAmount: low ? low.countOrAmount : '0 items' },
        { icon: 'pi pi-user', iconClass: 'alert-icon-blue', badgeClass: 'badge-red', title: 'Customer Outstanding', countOrAmount: ar ? ar.countOrAmount : 'AED 0.00' },
        { icon: 'pi pi-building', iconClass: 'alert-icon-purple', badgeClass: 'badge-red', title: 'Supplier Payable', countOrAmount: ap ? ap.countOrAmount : 'AED 0.00' },
        { icon: 'pi pi-question-circle', iconClass: 'alert-icon-red', badgeClass: 'badge-red', title: 'Pending Purchase Orders', countOrAmount: po ? po.countOrAmount : '0', route: '/procurement/po-approval', queryParams: { menu: 184 } },
      ];
      const prCount = pr ? parseInt(String(pr.countOrAmount), 10) : NaN;
      this.purchaseRequisitionCount = isNaN(prCount) ? this.purchaseRequisitionCount : prCount;
    }

    // Top products
    if (Array.isArray(d.topProducts) && d.topProducts.length > 0) {
      this.topProducts = d.topProducts.map((t: any) => ({
        rank: Number(t.rank || 0),
        name: t.name || '',
        qty: Number(t.qty || 0),
        salesAmount: Number(t.salesAmount || 0),
        profit: Number(t.profit || 0),
      }));
    }

    // Sales trend (7 days, real)
    if (Array.isArray(d.salesTrend) && d.salesTrend.length > 0) {
      this.salesTrendData = {
        labels: d.salesTrend.map((t: any) => t.label),
        datasets: [
          {
            type: 'bar',
            label: 'Sales',
            data: d.salesTrend.map((t: any) => Number(t.sales || 0)),
            backgroundColor: '#2563eb',
            hoverBackgroundColor: '#1d4ed8',
            borderRadius: 4,
            barPercentage: 0.5,
            categoryPercentage: 0.7,
            order: 2,
          },
        ],
      };
      this.salesTrendData = { ...this.salesTrendData };
    }

    // Category donut (empty until Item_Stock_Type data exists)
    this.categoryItems = Array.isArray(d.categorySales)
      ? d.categorySales.map((c: any, i: number) => ({ label: c.name, percent: 0, amount: Number(c.amount || 0), color: this.donutPalette[i % this.donutPalette.length] }))
      : [];
    this.categoryTotal = this.categoryItems.reduce((acc, c) => acc + c.amount, 0);
    if (this.categoryTotal > 0) {
      this.categoryItems.forEach((c) => { c.percent = Math.round((c.amount / this.categoryTotal) * 1000) / 10; });
    }
    this.categoryDonutData = {
      labels: this.categoryItems.map((c) => c.label),
      datasets: [
        {
          data: this.categoryItems.map((c) => c.percent),
          backgroundColor: this.categoryItems.map((c) => c.color),
          hoverBackgroundColor: this.categoryItems.map((c) => c.color),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };

    // Branch donut (real)
    this.branchSalesItems = Array.isArray(d.branchSales)
      ? d.branchSales.map((b: any, i: number) => ({ label: b.name, percent: 0, amount: Number(b.amount || 0), color: this.donutPalette[i % this.donutPalette.length] }))
      : [];
    this.branchTotal = this.branchSalesItems.reduce((acc, b) => acc + b.amount, 0);
    if (this.branchTotal > 0) {
      this.branchSalesItems.forEach((b) => { b.percent = Math.round((b.amount / this.branchTotal) * 1000) / 10; });
    }
    this.branchSalesData = {
      labels: this.branchSalesItems.map((b) => b.label),
      datasets: [
        {
          data: this.branchSalesItems.map((b) => b.percent),
          backgroundColor: this.branchSalesItems.map((b) => b.color),
          hoverBackgroundColor: this.branchSalesItems.map((b) => b.color),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };

    // Stock status donut (real)
    if (d.stockStatus) {
      const st = d.stockStatus;
      const total = Number(st.totalItems || 0);
      const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);
      this.totalStockItemsCount = total;
      this.stockStatusItems = [
        { label: 'In Stock', count: Number(st.inStock || 0), percent: pct(Number(st.inStock || 0)), color: '#10b981' },
        { label: 'Low Stock', count: Number(st.lowStock || 0), percent: pct(Number(st.lowStock || 0)), color: '#f59e0b' },
        { label: 'Out of Stock', count: Number(st.outOfStock || 0), percent: pct(Number(st.outOfStock || 0)), color: '#ef4444' },
      ];
      this.stockStatusDonutData = {
        labels: this.stockStatusItems.map((s) => s.label),
        datasets: [
          {
            data: this.stockStatusItems.map((s) => s.count),
            backgroundColor: this.stockStatusItems.map((s) => s.color),
            hoverBackgroundColor: this.stockStatusItems.map((s) => s.color),
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      };
    }

    // Profit analysis (real, 6 months)
    if (Array.isArray(d.profitAnalysis) && d.profitAnalysis.length > 0) {
      this.profitAnalysisData = {
        labels: d.profitAnalysis.map((m: any) => m.month),
        datasets: [
          {
            type: 'line',
            label: 'Margin %',
            data: d.profitAnalysis.map((m: any) => Number(m.marginPercent || 0)),
            fill: false,
            borderColor: '#8b5cf6',
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#8b5cf6',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y-axis-margin',
            order: 1,
          },
          {
            type: 'bar',
            label: 'Sales',
            data: d.profitAnalysis.map((m: any) => Number(m.sales || 0)),
            backgroundColor: '#2563eb',
            hoverBackgroundColor: '#1d4ed8',
            yAxisID: 'y-axis-main',
            barPercentage: 0.6,
            categoryPercentage: 0.8,
            order: 2,
          },
          {
            type: 'bar',
            label: 'Cost',
            data: d.profitAnalysis.map((m: any) => Number(m.cost || 0)),
            backgroundColor: '#f59e0b',
            hoverBackgroundColor: '#d97706',
            yAxisID: 'y-axis-main',
            barPercentage: 0.6,
            categoryPercentage: 0.8,
            order: 3,
          },
          {
            type: 'bar',
            label: 'Gross Profit',
            data: d.profitAnalysis.map((m: any) => Number(m.grossProfit || 0)),
            backgroundColor: '#10b981',
            hoverBackgroundColor: '#059669',
            yAxisID: 'y-axis-main',
            barPercentage: 0.6,
            categoryPercentage: 0.8,
            order: 4,
          },
        ],
      };
      this.profitAnalysisData = { ...this.profitAnalysisData };
    }

    // Branches (populate once - rebuilding would reset the user's selection)
    if (Array.isArray(d.branches) && d.branches.length > 0 && this.branches.length <= 1) {
      this.branches = [
        { label: 'Branch: All Branches', value: 'ALL' },
        ...d.branches.map((b: any) => ({ label: b.label || b.value, value: String(b.value) })),
      ];
    }
  }

  // Router navigation for PO/PR approval workflows
  routerNavigate(type: string, status: string): void {    window.sessionStorage.setItem('type', type);
    window.sessionStorage.setItem('status', status);
    this.router.navigate([`/procurement/po-approval`], {
      queryParams: {
        menu: 184,
      },
    });
  }

  // 1. Sales Trend Chart (Bar) - data comes from GetMainDashboard, options only here
  private initSalesTrendChart(): void {
    this.salesTrendData = undefined;

    this.salesTrendOptions = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          fontSize: 11,
          fontColor: '#64748b',
          fontFamily: "'Inter', sans-serif",
          padding: 10,
        },
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0f172a',
        titleFontSize: 12,
        bodyFontSize: 11,
        xPadding: 10,
        yPadding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (tooltipItem: any, data: any) => {
            const datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
            const val = Number(tooltipItem.yLabel).toLocaleString('en-US');
            return `${datasetLabel}: AED ${val}`;
          },
        },
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
            },
            ticks: {
              fontColor: '#64748b',
              fontSize: 11,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: '#f1f5f9',
              drawBorder: false,
              zeroLineColor: '#e2e8f0',
            },
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 100000,
              stepSize: 25000,
              fontColor: '#64748b',
              fontSize: 11,
              callback: (value: number) => {
                if (value === 0) return '0';
                return value >= 1000 ? `${value / 1000}K` : value;
              },
            },
          },
        ],
      },
    };
  }

  // 2. Sales by Category Donut Chart - data comes from GetMainDashboard, options only here
  private initCategoryDonutChart(): void {
    this.categoryDonutData = undefined;

    this.categoryDonutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutoutPercentage: 72,
      legend: {
        display: false,
      },
      tooltips: {
        backgroundColor: '#0f172a',
        callbacks: {
          label: (tooltipItem: any, data: any) => {
            const label = data.labels[tooltipItem.index] || '';
            const value = data.datasets[0].data[tooltipItem.index];
            const amount = this.categoryItems[tooltipItem.index]?.amount.toLocaleString('en-US');
            return `${label}: ${value}% (AED ${amount})`;
          },
        },
      },
    };
  }

  // 3. Stock Status Donut Chart - data comes from GetMainDashboard, options only here
  private initStockStatusDonutChart(): void {
    this.stockStatusDonutData = undefined;

    this.stockStatusDonutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutoutPercentage: 72,
      legend: {
        display: false,
      },
      tooltips: {
        backgroundColor: '#0f172a',
        callbacks: {
          label: (tooltipItem: any, data: any) => {
            const label = data.labels[tooltipItem.index] || '';
            const count = data.datasets[0].data[tooltipItem.index];
            const percent = this.stockStatusItems[tooltipItem.index]?.percent;
            return `${label}: ${count} (${percent}%)`;
          },
        },
      },
    };
  }

  // 4. Profit Analysis Chart (Combo Multi-Bar + Line) - data comes from GetMainDashboard, options only here
  private initProfitAnalysisChart(): void {
    this.profitAnalysisData = undefined;

    this.profitAnalysisOptions = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          fontSize: 11,
          fontColor: '#64748b',
          fontFamily: "'Inter', sans-serif",
          padding: 8,
        },
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0f172a',
        callbacks: {
          label: (tooltipItem: any, data: any) => {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const val = tooltipItem.yLabel;
            if (dataset.yAxisID === 'y-axis-margin') {
              return `${dataset.label}: ${val}%`;
            }
            return `${dataset.label}: AED ${Number(val).toLocaleString('en-US')}`;
          },
        },
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
            },
            ticks: {
              fontColor: '#64748b',
              fontSize: 11,
            },
          },
        ],
        yAxes: [
          {
            id: 'y-axis-main',
            position: 'left',
            gridLines: {
              color: '#f1f5f9',
              drawBorder: false,
              zeroLineColor: '#e2e8f0',
            },
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 100000,
              stepSize: 20000,
              fontColor: '#64748b',
              fontSize: 11,
              callback: (value: number) => {
                if (value === 0) return '0';
                return value >= 1000 ? `${value / 1000}K` : value;
              },
            },
          },
          {
            id: 'y-axis-margin',
            position: 'right',
            gridLines: {
              drawOnChartArea: false,
              drawBorder: false,
            },
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 40,
              stepSize: 10,
              fontColor: '#8b5cf6',
              fontSize: 11,
              callback: (value: number) => `${value}%`,
            },
          },
        ],
      },
    };
  }

  onBranchChange(event: any): void {
    this.selectedBranch = event.target ? event.target.value : event;
    this.loadMainDashboard();
  }

  navigateToAlert(alert: AlertItem): void {
    if (alert.route) {
      this.router.navigate([alert.route], { queryParams: alert.queryParams || {} });
    }
  }

  formatCurrency(value: number): string {
    if (!this.dashboardLoaded) {
      return '—';
    }
    return `AED ${Number(value || 0).toLocaleString('en-US')}`;
  }

  formatNumber(value: number): string {
    if (!this.dashboardLoaded) {
      return '—';
    }
    return Number(value || 0).toLocaleString('en-US');
  }

  formatTableAmount(val: any): string {
    if (val == null || val === '') return '0.00';
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
    if (isNaN(num)) return String(val);
    const formatted = Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return num < 0 ? `- AED ${formatted}` : `AED ${formatted}`;
  }

  isNegativeAmount(val: any): boolean {
    if (val == null || val === '') return false;
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
    return !isNaN(num) && num < 0;
  }

  formatTableDate(val: any): string {
    if (!val) return '-';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return String(val);
    }
  }

  getEntityInitials(name: string): string {
    if (!name) return 'NA';
    const clean = name.trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
  }

  onTableGlobalSearch(query: string): void {
    const val = query || '';
    if (this.selectedTabIndex === 0 && this.tt1) {
      this.tt1.filterGlobal(val, 'contains');
    } else if (this.selectedTabIndex === 1 && this.tt2) {
      this.tt2.filterGlobal(val, 'contains');
    } else if (this.selectedTabIndex === 2 && this.tt3) {
      this.tt3.filterGlobal(val, 'contains');
    } else if (this.selectedTabIndex === 3 && this.tt4) {
      this.tt4.filterGlobal(val, 'contains');
    }
  }
}
