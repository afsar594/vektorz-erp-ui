import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { MenuItem } from 'primeng/api/menuitem';
import {
  CustomersGraphData,
  PDCGraphData,
  SuppliersGraphData,
} from '../../domain/Administration/dashboard';
import { FormControl, FormBuilder } from '@angular/forms';
import { DashboardDataService } from '../../service/dashboard/dashboard.service';
import { MISService } from '../../service/mis/mis.service';
import { ApiResponse } from '../../domain/Masters/ApiResponse';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  // Recompile trigger for TranslatePipe scope
  styles: [
    `
      .count {
        background-color: #69a74aee;
        position: relative;
        font-size: 12px;
        border-radius: 12px;
        padding: 3px;
        margin: -27px;
        color: white;
        font-weight: 700;
        top: -14px;
        left: -19px;
      }

      .progress-circle {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-bottom: 10px;
        background-color: white;
        position: relative;
        overflow: hidden;
      }

      .progress-circle::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border: 10px solid #007bff; /* Set the border size and color */
        border-radius: 50%;
        box-sizing: border-box; /* Include the border in the total size */
        transform: rotate(
          calc(360 * var(--progress) / 100)
        ); /* Rotate based on progress */
      }

      .quick-shortcuts-panel {
        background: #ffffff;
        border-radius: 12px;
        padding: 0.9rem 1.25rem 1rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 4px 18px rgba(15, 23, 42, 0.06);
        border: 1px solid #e2e8f0;
      }

      .shortcuts-header {
        margin-bottom: 0.75rem;
      }

      .shortcuts-title-group {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .shortcuts-badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #0b192c 0%, #1e3a8a 100%);
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.6px;
      }

      .shortcuts-hint {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
      }

      .shortcuts-grid {
        margin: 0 -0.5rem;
      }

      .shortcut-action-card {
        display: flex;
        align-items: center;
        padding: 0.9rem 1.15rem;
        border-radius: 10px;
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
      }

      .product-inquiry-card {
        border-color: #bfdbfe;
        background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
      }

      .product-inquiry-card:hover {
        border-color: #2563eb;
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(37, 99, 235, 0.16);
      }

      .sales-issue-card {
        border-color: #bbf7d0;
        background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
      }

      .sales-issue-card:hover {
        border-color: #059669;
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(5, 150, 105, 0.16);
      }

      .card-icon-wrapper {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 19px;
        color: #ffffff;
        flex-shrink: 0;
        margin-right: 0.95rem;
      }

      .blue-gradient {
        background: linear-gradient(135deg, #1d4ed8, #3b82f6);
        box-shadow: 0 4px 10px rgba(59, 130, 246, 0.35);
      }

      .emerald-gradient {
        background: linear-gradient(135deg, #047857, #10b981);
        box-shadow: 0 4px 10px rgba(16, 185, 129, 0.35);
      }

      .card-content {
        flex: 1;
        min-width: 0;
      }

      .card-top-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 3px;
      }

      .card-name {
        font-size: 14.5px;
        font-weight: 700;
        color: #0f172a;
      }

      .card-description {
        font-size: 12px;
        color: #64748b;
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .kbd-badge kbd {
        display: inline-block;
        background: #0f172a;
        color: #38bdf8;
        padding: 3px 8px;
        border-radius: 5px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        font-weight: 800;
        border: 1px solid #334155;
        box-shadow: 0 2px 0 #020617;
      }

      .sales-issue-card .kbd-badge kbd {
        color: #4ade80;
      }

      .card-arrow {
        margin-left: 0.75rem;
        font-size: 13px;
        color: #94a3b8;
        transition: transform 0.2s ease, color 0.2s ease;
      }

      .shortcut-action-card:hover .card-arrow {
        transform: translateX(4px);
        color: #0f172a;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private langSub: Subscription;
  suppliercols: any[];
  supplierData: SuppliersGraphData[];

  customercols: any[];
  customerData: CustomersGraphData[];

  pdcIssuecols: any[];
  pdcIssueData: PDCGraphData[];

  pdcReceivecols: any[];
  pdcReceiveData: PDCGraphData[];

  chartData: any;
  chartData2: any;
  chartData3: any;
  chartData4: any;

  items1: MenuItem[];
  label1: string = 'Current Month';

  items3: MenuItem[];
  label3: string = 'Current Month';

  items4: MenuItem[];
  label4: string = 'Current Month';

  Form = this.fb.group({
    Type: new FormControl(''),
    StartDate: [null],
    EndDate: [null],
  });
  summary1: any[] = [];
  summary2: any[] = [];

  financialStartpDate: Date = new Date();
  financialEndpDate: Date = new Date();
  BankBalance: any;
  mainCash: any;
  pdcIssue: any;
  pdcReceive: any;
  pdcIssuePer: any = 0;
  pdcReceiveper: any = 0;
  pdcIssueCount: any;
  pdcReceiveCount: any;
  pdcTotal: number;
  incomingPdcIssue: any;
  incomingPdcReceived: any;
  CurrentMonthPurchase: any;
  CurrentMonthSales: any;
  PrevMonthSales: any;
  PrevMonthPurchase: any;
  CurrMonthExpense: any;
  PrevMonthExpense: any;
  PurchaseOrderCount: any;
  PurchaseRequisitionCount: any;
  ApprovedOrdersCount: any;
  chartOptions: {
    responsive: boolean;
    maintainAspectRatio: boolean;
    interaction: { mode: string; intersect: boolean };
    stacked: boolean;
    scales: {
      y: {
        type: string;
        position: string;
        ticks: { color: string };
        grid: { color: string };
      };
      y1: {
        type: string;
        position: string;
        ticks: { color: string };
        grid: { drawOnChartArea: boolean };
      };
    };
    plugins: {
      legend: { labels: { color: string } };
      title: { display: boolean; text: string };
    };
  };
  selectedChart: any = 'SALES,PURCHASE';
  selectedPeriod: string = 'CURRENT_MONTH';

  constructor(
    private misService: MISService,
    private dashbaordServce: DashboardDataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    console.log("Dashboard check");
    
    this.GetFinancialYear();
    this.getPDC('TOTAL');
    this.initMenuItems();

    this.suppliercols = [
      { field: 'MA_AccName', header: 'Supplier' },
      { field: 'Amount', header: 'Amount' },
    ];

    this.customercols = [
      { field: 'MA_AccName', header: 'Customer' },
      { field: 'Amount', header: 'Amount' },
    ];

    this.pdcIssuecols = [
      { field: 'PartyName', header: 'Party' },
      { field: 'PDate', header: 'Date' },
      { field: 'CAmount', header: 'Amount' },
    ];

    this.pdcReceivecols = [
      { field: 'PartyName', header: 'Party' },
      { field: 'PDate', header: 'Date' },
      { field: 'CAmount', header: 'Amount' },
    ];

    this.initChartData();
    this.LoadTabs(0);
    this.GetDasboardSalesPurchaseLineChart('CURRENT_MONTH');

    window.addEventListener('keydown', this.handleGlobalKeyDown, true);

    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.initMenuItems();
      this.initChartData();
      if (this.selectedPeriod) {
        this.GetDasboardSalesPurchaseLineChart(this.selectedPeriod);
      }
      this.cdr.markForCheck();
    });
  }

  initChartData() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
    ].map((m) => this.translate.instant(m) || m);

    this.chartData4 = {
      labels: months,
      datasets: [
        {
          label: this.translate.instant('Purchase') || 'Purchase',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          borderColor: '#03A9F4',
        },
      ],
    };

    this.chartData2 = {
      labels: months,
      datasets: [
        {
          label: this.translate.instant('Income') || 'Income',
          backgroundColor: '#42A5F5',
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: this.translate.instant('Profit') || 'Profit',
          backgroundColor: '#FFA726',
          data: [28, 48, 40, 19, 86, 27, 90],
        },
        {
          label: this.translate.instant('Expense') || 'Expense',
          backgroundColor: '#D13A1A',
          data: [34, 12, 20, 10, 50, 90, -27],
        },
      ],
    };

    this.chartData3 = {
      labels: ['Assets', 'Equity', 'Expenses', 'Income', 'Liabalities'].map(
        (l) => this.translate.instant(l) || l
      ),
      datasets: [
        {
          label: this.translate.instant('AccountGroup') || 'AccountGroup',
          backgroundColor: '#42A5F5',
          data: [65, 59, 80, 81, 56],
        },
      ],
    };
  }

  initMenuItems() {
    this.items1 = [
      {
        label: this.translate.instant('Current Month') || 'Current Month',
        icon: 'pi pi-calendar',
        command: () => {
          this.selectedPeriod = 'CURRENT_MONTH';
          this.onPeriodChange('CURRENT_MONTH');
          this.GetTabsChart();
        },
      },
      {
        label: this.translate.instant('Previous Month') || 'Previous Month',
        icon: 'pi pi-calendar',
        command: () => {
          this.selectedPeriod = 'PREVIOUS_MONTH';
          this.onPeriodChange('PREVIOUS_MONTH');
          this.GetTabsChart();
        },
      },
      {
        label: this.translate.instant('Current Week') || 'Current Week',
        icon: 'pi pi-calendar',
        command: () => {
          this.selectedPeriod = 'CURRENT_WEEK';
          this.onPeriodChange('CURRENT_WEEK');
          this.GetTabsChart();
        },
      },
      {
        label: this.translate.instant('Previous Week') || 'Previous Week',
        icon: 'pi pi-calendar',
        command: () => {
          this.selectedPeriod = 'PREVIOUS_WEEK';
          this.onPeriodChange('PREVIOUS_WEEK');
          this.GetTabsChart();
        },
      },
      {
        label: this.translate.instant('Financial Year') || 'Financial Year',
        icon: 'pi pi-calendar',
        command: () => {
          this.selectedPeriod = 'FINANCIAL_YEAR';
          this.onPeriodChange('FINANCIAL_YEAR');
          this.GetTabsChart();
        },
      },
    ];
  }

  onPeriodChange(label: string) {
    this.label1 = label;
    this.GetDasboardSalesPurchaseLineChart(label);
  }

  GetDasboardSalesPurchaseLineChart(periodType: string) {
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date = new Date(currentDate);

    switch (periodType) {
      case 'CURRENT_MONTH':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        break;

      case 'PREVIOUS_MONTH':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0
        );
        break;

      case 'CURRENT_WEEK':
        const day = currentDate.getDay(); // Sunday = 0
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - day);
        break;

      case 'PREVIOUS_WEEK':
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 7);
        const prevStart = new Date(prev);
        prevStart.setDate(prevStart.getDate() - prevStart.getDay());
        startDate = prevStart;
        endDate = new Date(prevStart);
        endDate.setDate(prevStart.getDate() + 6);
        break;

      case 'Financial Year':
        const fyStartMonth = 6; // July (0-based index)
        if (currentDate.getMonth() < fyStartMonth) {
          startDate = new Date(currentDate.getFullYear() - 1, fyStartMonth, 1);
          endDate = new Date(currentDate.getFullYear(), fyStartMonth, 0);
        } else {
          startDate = new Date(currentDate.getFullYear(), fyStartMonth, 1);
          endDate = new Date(currentDate.getFullYear() + 1, fyStartMonth, 0);
        }
        break;

      default:
        startDate = new Date(currentDate);
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
    }

    const req = {
      choice: this.selectedChart,
      periodType,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    this.dashbaordServce
      .GetDasboardSalesPurchaseLineChart(req)
      .subscribe((res: any) => {
        if (!res || !res.result) return;
        this.chartData = {};
        this.chartData4 = {};
        const response = res.result;

        const labels = response.labels
          .split(',')
          .map((x: string) => this.translate.instant(x.trim()) || x);
        const salesData = response.salesData
          .split(',')
          .map((x) => parseFloat(x));
        const purchaseData = response.purchaseData
          .split(',')
          .map((x) => parseFloat(x));

        const documentStyle = getComputedStyle(document.documentElement);
        const blueColor =
          documentStyle.getPropertyValue('--blue-500') || '#42A5F5';
        const greenColor =
          documentStyle.getPropertyValue('--green-500') || '#66BB6A';

        this.chartData = {
          labels,
          datasets: [
            {
              label: this.translate.instant('Sales') || 'Sales',
              data: salesData,
              borderColor: blueColor.trim(),
              fill: false,
            },
          ],
        };

        this.chartData4 = {
          labels,
          datasets: [
            {
              label: this.translate.instant('Purchase') || 'Purchase',
              data: purchaseData,
              borderColor: greenColor.trim(),
              fill: false,
            },
          ],
        };

        this.chartData = { ...this.chartData };
        this.chartData4 = { ...this.chartData4 };
      });
  }
  selectedChoice = 0;
  GetTabsChart() {
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date = new Date(currentDate);

    switch (this.selectedPeriod) {
      case 'CURRENT_MONTH':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        break;

      case 'PREVIOUS_MONTH':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0
        );
        break;

      case 'CURRENT_WEEK':
        const day = currentDate.getDay(); // Sunday = 0
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - day);
        break;

      case 'PREVIOUS_WEEK':
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 7);
        const prevStart = new Date(prev);
        prevStart.setDate(prevStart.getDate() - prevStart.getDay());
        startDate = prevStart;
        endDate = new Date(prevStart);
        endDate.setDate(prevStart.getDate() + 6);
        break;

      case 'Financial Year':
        const fyStartMonth = 6; // July (0-based index)
        if (currentDate.getMonth() < fyStartMonth) {
          startDate = new Date(currentDate.getFullYear() - 1, fyStartMonth, 1);
          endDate = new Date(currentDate.getFullYear(), fyStartMonth, 0);
        } else {
          startDate = new Date(currentDate.getFullYear(), fyStartMonth, 1);
          endDate = new Date(currentDate.getFullYear() + 1, fyStartMonth, 0);
        }
        break;

      default:
        startDate = new Date(currentDate);
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
    }
    const choice = this.selectedChoice;
    const req = {
      // choice: this.selectedChart,
      // periodType,
      Type: this.Form.controls['Type'].value,
      StartDate: startDate.toISOString().split('T')[0],
      EndDate: endDate.toISOString().split('T')[0],
    };
    this.dashbaordServce.GetTabsChart(req).subscribe((response) => {
      // Never wipe loaded tables on an empty response.
      if (!response || !Array.isArray(response.resultSet) || response.resultSet.length === 0) {
        this.cdr.detectChanges();
        return;
      }
      if (choice == 1) {
        this.customerData = response.resultSet;
      } else if (choice == 0) {
        this.supplierData = response.resultSet;
      } else if (choice == 2) {
        this.pdcIssueData = response.resultSet;
      } else if (choice == 3) {
        this.pdcReceiveData = response.resultSet;
      }
      this.cdr.detectChanges();
    });
  }

  LoadTabs(choice) {
    var type =
      choice == 0
        ? 'SUPPLIER'
        : choice == 1
        ? 'CUSTOMER'
        : choice == 2
        ? 'PDC_ISSUED'
        : 'PDC_RECEIVED';
    this.Form.controls['Type'].setValue(type);
    this.selectedChoice = choice;
    this.GetTabsChart();
  }

  getPDC(type) {
    this.Form.controls['Type'].setValue(type);

    this.dashbaordServce.getPDC().subscribe((response: any) => {
      this.pdcTotal = 0;
      let list = response.resultSet.data;
      let vouchers = response.resultSet.groupedData;

      //total summary
      let data = list?.filter((a) => a.type == 'TOTAL');
      //pdc issue
      const pdcIssueRecord = data?.filter(
        (a) => a.discription == 'Total Amount of PDC Issued'
      );
      this.pdcIssue = pdcIssueRecord[0]?.value ?? 0;
      this.pdcTotal += this.pdcIssue;

      const pdcIssueCountRecord = data?.filter(
        (a) => a.discription == 'Total No. of PDC Issued'
      );
      this.pdcIssueCount = pdcIssueCountRecord[0]?.value ?? 0;

      // pdc received
      const pdcReceiveRecord = data?.filter(
        (a) => a.discription == 'Total Amount of PDC Received'
      );
      this.pdcReceive = pdcReceiveRecord[0]?.value ?? 0;
      this.pdcTotal += this.pdcReceive;
      const pdcReceiveCountRecord = data?.filter(
        (a) => a.discription == 'Total No. of PDC Received'
      );
      this.pdcReceiveCount = pdcReceiveCountRecord[0]?.value ?? 0;

      this.pdcIssuePer =
        this.pdcTotal > 0 ? ((this.pdcIssue / this.pdcTotal) * 100).toFixed(2) : '0.00';
      this.pdcReceiveper =
        this.pdcTotal > 0 ? ((this.pdcReceive / this.pdcTotal) * 100).toFixed(2) : '0.00';

      //cash balance and bank bakance
      const bankbalance = data?.filter(
        (a) => a.discription == 'Total Bank Balance'
      );
      this.BankBalance = bankbalance[0]?.value?.toFixed(2) ?? 0.0;

      const cashbalance = data?.filter(
        (a) => a.discription == 'Total Cash Balance'
      );
      this.mainCash = cashbalance[0]?.value?.toFixed(2) ?? 0.0;

      //split summary
      let query = list?.filter((a) => a.type == 'SPLIT');
      //incoming pdc in 5 days
      const incomingdaypdcIssue = query?.filter(
        (a) => a.discription == 'Incoming PDC Amt. (Issued) In 5 Days'
      );
      this.incomingPdcIssue = incomingdaypdcIssue[0]?.value?.toFixed(2) ?? 0.0;

      //incoming pdc in 5 days
      const incomingdaypdcReceived = query?.filter(
        (a) => a.discription == 'Incoming PDC Amt. (Received) In 5 Days'
      );
      this.incomingPdcReceived =
        incomingdaypdcReceived[0]?.value?.toFixed(2) ?? 0.0;

      //Current Month Purchase
      const currMonthPurchase = query?.filter(
        (a) => a.discription == 'Current Month Purchase'
      );
      this.CurrentMonthPurchase =
        currMonthPurchase[0]?.value?.toFixed(2) ?? 0.0;

      //Current Month Sales
      const currMonthSales = query?.filter(
        (a) => a.discription == 'Current Month Sales'
      );
      this.CurrentMonthSales = currMonthSales[0]?.value?.toFixed(2) ?? 0.0;

      // Prev. Month Sales
      const PreviousMonthSales = query?.filter(
        (a) => a.discription == 'Prev. Month Sales'
      );
      this.PrevMonthSales = PreviousMonthSales[0]?.value?.toFixed(2) ?? 0.0;

      // Prev. Month Purchase
      const PreviousMonthPurchase = query?.filter(
        (a) => a.discription == 'Prev. Month Purchase'
      );
      this.PrevMonthPurchase =
        PreviousMonthPurchase[0]?.value?.toFixed(2) ?? 0.0;

      //Current Month Expenses
      const CurrentMonthExpense = query?.filter(
        (a) => a.discription == 'Current Month Expenses'
      );
      this.CurrMonthExpense = CurrentMonthExpense[0]?.value?.toFixed(2) ?? 0.0;

      //Prev. Month Expenses
      const PreviousMonthExpense = query?.filter(
        (a) => a.discription == 'Prev. Month Expenses'
      );
      this.PrevMonthExpense = PreviousMonthExpense[0]?.value?.toFixed(2) ?? 0.0;

      // voucher section

      const PendingOrders = vouchers?.filter(
        (a) => a.voucherType == 'Purchase Order' && a.status == 'Pending'
      );
      this.PurchaseOrderCount = PendingOrders?.length;

      const PendingRequisition = vouchers?.filter(
        (a) => a.voucherType == 'Purchase Requisition' && a.status == 'Pending'
      );
      this.PurchaseRequisitionCount = PendingRequisition?.length;

      const ApprovedOrders = vouchers?.filter(
        (a) => a.voucherType == 'Purchase Order' && a.status == 'Approved'
      );
      this.ApprovedOrdersCount = ApprovedOrders?.length;

      this.cdr.detectChanges();
    });
  }

  getBankDetail(type) {
    this.Form.controls['Type'].setValue(type);

    this.dashbaordServce
      .GetDashboardBankBalance(this.Form.value)
      .subscribe((response: ApiResponse<any>) => {
        if (type == 'Bank_Balance') {
          this.BankBalance = response.result;
        } else if (type == 'Main_Cash') {
          this.mainCash = response.result;
        }
      });
  }
  OnChartChangeEvent(event, choice) {
    //
    let startpDate: any;
    let endpDate: any;
    const date = new Date();

    if (event == null || event.currentTarget.textContent == 'Current Month') {
      const firstDay = this.GetFirstDayOfMonth(
        date.getFullYear(),
        date.getMonth()
      );
      const lastDay = this.GetLastDayOfMonth(
        date.getFullYear(),
        date.getMonth()
      );
      startpDate = this.GetDate(firstDay);
      endpDate = this.GetDate(lastDay);
    } else if (event.currentTarget.textContent == 'Financial Year') {
      startpDate = this.GetDate(this.financialStartpDate);
      endpDate = this.GetDate(this.financialEndpDate);
    } else if (event.currentTarget.textContent == 'Previous Week') {
      var beforeOneWeek = new Date(date.getTime() - 60 * 60 * 24 * 7 * 1000);
      var beforeOneWeek2 = new Date(beforeOneWeek);
      let day = beforeOneWeek.getDay();
      let diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1);
      let firstDay = new Date(beforeOneWeek.setDate(diffToMonday));
      let lastDay = new Date(beforeOneWeek2.setDate(diffToMonday + 6));
      startpDate = this.GetDate(firstDay);
      endpDate = this.GetDate(lastDay);
    } else if (event.currentTarget.textContent == 'Current Week') {
      // ✅ Get the first day of the current week (Sunday)
      const firstDay = new Date(date.setDate(date.getDate() - date.getDay()));

      // ✅ Get the last day of the current week (Saturday)
      const lastDay = new Date(
        date.setDate(date.getDate() - date.getDay() + 6)
      );
      startpDate = this.GetDate(firstDay);
      endpDate = this.GetDate(lastDay);
    } else if (event.currentTarget.textContent == 'Previous Month') {
      const firstDay = this.GetFirstDayOfMonth(
        date.getFullYear(),
        date.getMonth() - 1
      );
      const lastDay = this.GetLastDayOfMonth(
        date.getFullYear(),
        date.getMonth() - 1
      );
      startpDate = this.GetDate(firstDay);
      endpDate = this.GetDate(lastDay);
    }
    this.Form.controls['Type'].setValue(choice);
    this.Form.controls['StartDate'].setValue(null);
    this.Form.controls['EndDate'].setValue(null);
    this.dashbaordServce
      .GetDashboardChart(this.Form.value)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid) {
          if ((choice = 'INC_EXP')) {
          } else if ((choice = 'SALES')) {
          } else if ((choice = 'ACCOUNT_GRP')) {
          } else if ((choice = 'PURCHASE')) {
          }
        }
      });
  }

  GetLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0);
  }

  GetFirstDayOfMonth(year, month) {
    return new Date(year, month, 1);
  }

  GetDate(Date: Date) {
    var dd = String(Date.getDate()).padStart(2, '0');
    var mm = String(Date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = Date.getFullYear();

    let returnpDate = yyyy + '-' + mm + '-' + dd;
    return returnpDate;
  }

  GetFinancialYear() {
    this.misService
      .GetFinancialYearResponse()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result != null) {
          this.financialStartpDate = response.result.financialPeriodsStartpDate;
          this.financialEndpDate = response.result.financialPeriodsEndpDate;
        }
      });
  }

  RouterNavigate(type, status) {
    window.sessionStorage.setItem('type', type);
    window.sessionStorage.setItem('status', status);
    this.router.navigate([`/procurement/po-approval`], {
      queryParams: {
        menu: 184,
      },
    });
  }

  private handleGlobalKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'F1' || event.code === 'F1') {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.openProductInquiry();
    } else if (event.key === 'F2' || event.code === 'F2') {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.openSalesIssue();
    }
  };

  @HostListener('window:keydown', ['$event'])
  onWindowKeyDown(event: KeyboardEvent) {
    if (event.key === 'F1' || event.code === 'F1') {
      event.preventDefault();
      this.openProductInquiry();
    } else if (event.key === 'F2' || event.code === 'F2') {
      event.preventDefault();
      this.openSalesIssue();
    }
  }

  openProductInquiry(): void {
    this.router.navigate(['/master/product-inquiry']);
  }

  openSalesIssue(): void {
    this.router.navigate(['/master/sales-issue']);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.handleGlobalKeyDown, true);
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }
}
