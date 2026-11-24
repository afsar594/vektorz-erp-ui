import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ItemMaster } from 'src/app/routes/domain';
// import { JobMaster } from 'src/app/routes/domain/JobMaster';
import { HotTableRegisterer } from '@handsontable/angular';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { _isNumberValue } from '@angular/cdk/coercion';
import { ToWords } from 'to-words';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { SalesService } from 'src/app/routes/service/sales/sales.service';
import { salesReportReponseModel } from 'src/app/routes/domain/Masters/salesReportResponse';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { DatePipe } from '@angular/common';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { DatefilterComponent } from 'src/app/shared/component/datefilter/datefilter.component';

@Component({
  selector: 'app-cutomer-sales-details',
  templateUrl: './cutomer-sales-details.component.html',
  styleUrls: ['./cutomer-sales-details.component.scss'],
})
export class CutomerSalesDetailsComponent implements OnInit {
  @ViewChild(DatefilterComponent) datefilterComponent!: DatefilterComponent;
  show: any;
  dateFrom: Date = null;
  dateTo: Date = null;
  title: string = 'Customer Wise Sales Report';

  customerList: Array<CustomerMaster> = [];
  customer: any;
  customerFilter: any;
  enableDate: boolean = false;
  hotidD = 'customerReportD';
  hotidM = 'customerReportM';
  hotidS = 'customerReportS';
  type: string = 'GetCustomerDetailWiseSalesReport';
  customerReportDetail: Handsontable.GridSettings;
  customerReportMaterial: Handsontable.GridSettings;
  customerReportSummary: Handsontable.GridSettings;

  customerReportList: Array<salesReportReponseModel> = [];
  licensekey: string;
  showCSalesDetails: boolean = false;
  showMaterialWise: boolean = false;

  dataListCSalesDetails: Array<CSalesDetails>;

  colsMaterialWise: Array<string>;
  dataListMaterialWise: Array<MaterialWise>;
  pdfSource: string;
  totalamount: any;
  nettotal: number;

  constructor(
    private crystalReportService: CrystalReportService,
    private utilityService: UtilityService,
    private datePipe: DatePipe,
    private salesApi: SalesService,
    private formatDateService: ReportDateFormatService,
    private cd: ChangeDetectorRef,
    private masterapi: MasterApiService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.show = false;
  }

  private hotRegisterer = new HotTableRegisterer();

  getCustomerWiseSalesReport() {
    this.customerReportList = [];
    this.totalamount = 0;
    this.nettotal = 0;

    const { fromDate, toDate } = this.datefilterComponent.onApplyDateFilter();
    // this.dateFrom = new Date(fromDate);
    // this.dateTo = new Date(toDate);

    this.salesApi
      .getCustomerWiseSalesReport(
        this.type,
        this.customerFilter,
        fromDate,
        toDate
      )
      .subscribe((res: any) => {
        this.customerReportList = res;
        res?.forEach((i) => {
          this.totalamount += i?.grossAmount;
          this.nettotal += i?.netAmount;
        });
        this.showAllData();
      });
  }

  showAllData() {
    if (this.type == 'GetCustomerDetailWiseSalesReport') {
      this.hotRegisterer.getInstance(this.hotidD).updateSettings({
        data: this.customerReportList,
      });
    } else if (this.type == 'GetCustomerMaterialWiseSalesReport') {
      this.hotRegisterer.getInstance(this.hotidM).updateSettings({
        data: this.customerReportList,
      });
    } else if (this.type == 'GetCustomerSummaryWiseSalesReport') {
      this.hotRegisterer.getInstance(this.hotidS).updateSettings({
        data: this.customerReportList,
      });
    }
  }

  getAllCustomers() {
    this.masterapi.GetAllCustomer().subscribe((response: any) => {
      console.log('Customer List:', response);
      this.customerList = response;
    });
  }

  ngOnInit(): void {
    this.initializeControlsDetail();
    this.initailizeControlMaterial();
    this.initailizeControlSummary();
    this.getAllCustomers();
  }

  showDetails() {
    this.show = false;
  }

  cancelAll() {
    this.enableDate = false;
    this.dateFrom = null;
    this.dateTo = null;
    this.customerFilter = null;
    this.customer = null;
  }

  rptFilter: ReportFilterModel;

  showPrint() {
    let isDate = this.enableDate;

    let customer = this.customerFilter;
    const { fromDate, toDate } = this.datefilterComponent.onApplyDateFilter();
    const fromDateDisplay = fromDate ? this.formatDate(fromDate) : '';
    const toDateDisplay = toDate ? this.formatDate(toDate) : '';

    let query = 'SELECT * FROM vw_Sales WHERE 1 = 1';

    if (customer) {
      query += ` AND SalesVoucherPartyId = ${customer}`;
    }
    if (isDate) {
      query += ` AND SalesVoucherDate BETWEEN '${fromDate}' AND '${toDate}'`;
    }
    this.rptFilter = {
      ReportName:
        this.type == 'GetCustomerDetailWiseSalesReport'
          ? 'CustomerSalesDetails'
          : this.type == 'GetCustomerMaterialWiseSalesReport'
          ? 'CustomerSalesDetailsMaterialWise'
          : this.type == 'GetmonthWiseSalesReport'
          ? 'CustomerMonthlySales'
          : this.type == 'All'
          ? 'SalesAll'
          : 'CustomerSalesSummary',
      SelectionFormula: '',
      Parameters: [
        {
          Key: 'Period',
          Value: isDate ? `Between ${fromDateDisplay} And ${toDateDisplay}` : '',
        },
      ],
      Queries: [query],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  initializeControlsDetail() {
    this.customerReportDetail = this.utilityService.getTableConfig(
      detailColumnObjList(this),
      [8]
    );
    this.cd.detectChanges();
  }

  initailizeControlMaterial() {
    this.customerReportMaterial = this.utilityService.getTableConfig(
      materialColumnObjList(this),
      []
    );
    this.cd.detectChanges();
  }

  initailizeControlSummary() {
    this.customerReportSummary = this.utilityService.getTableConfig(
      summaryColumnObjList(this),
      [9]
    );
    this.cd.detectChanges();
  }

  onCustomerChange(event: any) {
    this.customerFilter = event.value?.customerMasterCustomerNo
      ? event.value.customerMasterCustomerNo
      : null;
    this.getCustomerWiseSalesReport();
  }


formatDate(date: string | Date): string {
  const d = new Date(date);

  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();

  return `${day}/${month}/${year}`;
}
}

interface CSalesDetails {
  voucherNo?: string;
  voucherDate?: string;
  grossAmount?: string;
  discount?: string;
  vatAmount?: string;
  amount?: string;
  retAmount?: string;
  net?: string;
}
interface MaterialWise {
  voucherNo?: string;
  voucherDate?: string;
  itemName?: string;
  soldQty?: string;
  discount?: string;
  grossAmount?: string;
  netAmount?: string;
}

// For Detail Report
export const summaryColumnObjList = (
  component: CutomerSalesDetailsComponent
) => [
  {
    data: 'voucherNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Sales Voucher Number',
  },
  {
    data: 'voucherDate',
    type: 'date',
    label: 'Voucher Date',
    toolTip: 'Voucher Date',
  },
  {
    data: 'customerName',
    type: 'text',
    label: 'Customer',
    toolTip: 'Customer',
  },
  {
    data: 'grossAmount',
    type: 'numeric',
    label: 'Gross Amount',
    toolTip: 'Gross Amount',
  },
  {
    data: 'discount',
    type: 'numeric',
    label: 'Discount',
    toolTip: 'Discount Amount',
  },
  {
    data: 'vatAmount',
    type: 'numeric',
    label: 'VAT Amount',
    toolTip: 'VAT Amount',
  },
  {
    data: 'grossAmount',
    type: 'numeric',
    label: 'Gross Amount',
    toolTip: 'Gross Amount',
  },
  {
    data: 'retAmount',
    type: 'numeric',
    label: 'Ret Amount',
    toolTip: 'Ret Amount',
  },
  {
    data: 'net',
    type: 'numeric',
    label: 'Net',
    toolTip: 'Net',
  },
];

export const materialColumnObjList = (
  component: CutomerSalesDetailsComponent
) => [
  {
    data: 'voucherNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Sales Voucher Number',
  },
  {
    data: 'voucherDate',
    type: 'date',
    label: 'Voucher Date',
    toolTip: 'Voucher Date',
  },
  // {
  //   data: 'customerName',
  //   type: 'text',
  //   label: 'Customer',
  //   toolTip: 'Customer',
  // },
  {
    data: 'itemName',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
  },
  {
    data: 'soldQty',
    type: 'text',
    label: 'Sold Qty',
    toolTip: 'Sold Qty',
  },
  {
    data: 'price',
    type: 'text',
    label: 'Rate',
    toolTip: 'Rate',
  },
  {
    data: 'discount',
    type: 'numeric',
    label: 'Discount',
    toolTip: 'Discount Amount',
  },
  {
    data: 'vatamount',
    type: 'numeric',
    label: 'VAT Amount',
    toolTip: 'VAT Amount',
  },
  {
    data: 'grossAmount',
    type: 'numeric',
    label: 'Gross Amount',
    toolTip: 'Gross Amount',
  },
  // {
  //   data: 'retAmount',
  //   type: 'numeric',
  //   label: 'Ret Amount',
  //   toolTip: 'Ret Amount',
  // },
  {
    data: 'netAmount',
    type: 'numeric',
    label: 'Net',
    toolTip: 'Net',
  },
];

export const detailColumnObjList = (
  component: CutomerSalesDetailsComponent
) => [
  {
    data: 'voucherNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Voucher Number',
  },
  {
    data: 'voucherDate',
    type: 'date',
    label: 'Voucher Date',
    toolTip: 'Voucher Date',
  },
  {
    data: 'customerName',
    type: 'text',
    label: 'Customer',
    toolTip: 'Customer',
  },
  {
    data: 'itemName',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
  },
  {
    data: 'soldQty',
    type: 'numeric',
    label: 'Sold Qty',
    toolTip: 'Sold Qty',
  },

  {
    data: 'discount',
    type: 'numeric',
    label: 'Discount',
    toolTip: 'Discount Amount',
  },
  {
    data: 'grossAmount',
    type: 'numeric',
    label: 'Gross Amount',
    toolTip: 'Gross Amount',
  },
  {
    data: 'netAmount',
    type: 'numeric',
    label: 'Net Amount',
    toolTip: 'Net Amount',
  },
];
