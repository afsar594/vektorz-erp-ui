import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { SelectItem } from 'primeng/api';
import { InvoiceProfitAnalysisFilter } from 'src/app/routes/domain/MIS/InvoiceProfitAnalysisFilter';
import { FormGroup } from '@angular/forms';
import { defaults } from 'src/app/shared/service/settings';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { DatePipe } from '@angular/common';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { DecimalConfigService } from 'src/app/routes/service/decimal-config.service';

@Component({
  selector: 'app-invoice-profit-analysis',
  templateUrl: './invoice-profit-analysis.component.html',
  styleUrls: ['./invoice-profit-analysis.component.scss'],
})
export class InvoiceProfitAnalysisComponent implements OnInit {
  title: string;
  subtitle: string;
  filterForm: FormGroup;
  dataset: any;
  index: number = 0;
  rptDateRange: boolean = false;
  customerId: any;
  salemanId: any;
  isChecked: boolean = false;
  SalesManMasterList: SelectItem[];
  CustomerMasterList: SelectItem[];
  DateRange: boolean = false;
  startDate: any = this.GetLastYearDate(new Date());
  endDate: Date = new Date();
  totalcost: number;
  totalprofit: number;
  totalprofitPercentage: number;
  pdfSource: string;
  salesAmount: number;
  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 1);
    return new Date(date.toDateString());
  }
  handleChange(e) {
    this.index = e.index;
  }
  //licensekey: any;
  licensekey: string;
  gridHeader: string;
  hotid = 'invoiceprofit';
  private hotRegisterer = new HotTableRegisterer();
  invoiceprofit: Handsontable.GridSettings;

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private decimalsetting: DecimalConfigService,
    private fb: FormBuilder,
    private crystalReportService: CrystalReportService,
    private formatDateService: ReportDateFormatService,
    private datePipe: DatePipe,
    private accservice: AccountstatementService,
    private utilityService: UtilityService,
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.initializeControls();
    this.filterForm = this.fb.group({
      PartyId: [null], // Default value is null (no selection),
      rptDateRange: [{ value: false, disabled: true }],
    });
  }

  rptFilter: ReportFilterModel;
  showPrint() {
    let isDate = this.isChecked;

    let fromDateControl = this.formatDateService.mmddyyyy(this.startDate);
    let toDateControl = this.formatDateService.mmddyyyy(this.endDate);
    const fromDate = this.datePipe.transform(fromDateControl, 'dd/MM/yyyy');
    const toDate = this.datePipe.transform(toDateControl, 'dd/MM/yyyy');
    let query = 'select * from view_invoice_profit';

    if (this.customerId && this.customerId != -1) {
      query += ` AND SalesVoucherPartyId = ${this.customerId}`;
    }
    if (this.salemanId && this.salemanId != -1) {
      query += ` AND SalesmanId = ${this.salemanId}`;
    }
    if (isDate && fromDateControl && toDateControl) {
      query += ` AND SalesVoucherDate BETWEEN '${fromDateControl} ' AND '${toDateControl} '`;
    }
    this.rptFilter = {
      ReportName: 'Invoice_vs_Profit',
      SelectionFormula: '',
      Parameters: [
        // {
        //   Key: "Period",
        //   Value: isDate ? `for the period from  ${fromDate} to ${toDate}` : ''
        // }
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

  initializeControls() {
    this.invoiceprofit = this.utilityService.getTableConfig(
      columnDetailList(this),
      [],
    );

    this.accservice.ProfitAnalysisLoadDropdown().subscribe((m) => {
      this.CustomerMasterList = m.resultSet.customerMasters?.map((k) => ({
        label: k.customerMasterCustomerName,
        value: k.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({
        label: '-- select customer --',
        value: -1,
      });
      this.SalesManMasterList = m.resultSet.saleManList?.map((k) => ({
        label: k.salesManMasterSalesManName,
        value: k.salesManMasterSalesManId,
      }));
      this.SalesManMasterList.unshift({
        label: '--select saleman --',
        value: -1,
      });
    });
  }
  onSalesManChange(event: any): void {
    this.customerId = event.value;
    //console.log('Selected SalesManId:', this.selectedSalesManId);
    // Your logic to handle the change
  }
  onSalesManChange1(event: any): void {
    this.salemanId = event.value;
    //console.log('Selected SalesManId:', this.selectedSalesManId);
    // Your logic to handle the change
  }

  show() {
    const customerId =
      this.customerId === undefined ||
      this.customerId === null ||
      this.customerId === -1
        ? 0
        : this.customerId;
    const salemanId =
      this.salemanId === undefined ||
      this.salemanId === null ||
      this.salemanId === -1
        ? 0
        : this.salemanId;
    const fromDate =
      this.filterForm.value.fromate?.value === undefined ||
      this.filterForm.value.fromdate?.value === null
        ? this.GetDate(this.startDate)
        : this.filterForm.value.fromDate?.value;

    const toDate =
      this.filterForm.value.todate?.value === undefined ||
      this.filterForm.value.todate?.value === null
        ? this.GetDate(this.endDate)
        : this.filterForm.value.todate?.value;

    let req: InvoiceProfitAnalysisFilter = {
      customerId: customerId,
      salemanId: salemanId,
      isDate: this.isChecked,
      fromdate: fromDate,
      todate: toDate,
    };
    this.accservice.InvoiceProfitAnalysis(req).subscribe((m) => {
      this.dataset = m.resultSet.result;
      this.totalcost = 0;
      this.totalprofit = 0;
      this.totalprofitPercentage = 0;
      this.salesAmount = 0;
      m.resultSet.result.forEach((e: any) => {
        this.totalcost += parseFloat(e.costPrice) || 0;
        this.totalprofit += parseFloat(e.profit) || 0;
        this.totalprofitPercentage += parseFloat(e.profitPercent) || 0;
        this.salesAmount += parseFloat(e.salesAmount) || 0;
      });
      // Round to two decimal places
      this.totalcost = parseFloat(
        this.totalcost.toFixed(this.decimalsetting.getDecimal()),
      );
      this.totalprofit = parseFloat(
        this.totalprofit.toFixed(this.decimalsetting.getDecimal()),
      );
      this.totalprofitPercentage = parseFloat(
        this.totalprofitPercentage.toFixed(this.decimalsetting.getDecimal()),
      );
      this.salesAmount = parseFloat(
        this.salesAmount.toFixed(this.decimalsetting.getDecimal()),
      );
    });
  }

  makeDateRangeTrue() {
    if (this.DateRange == true) {
      this.DateRange = false;
    } else {
      this.DateRange = true;
    }
  }

  GetDate(date: Date) {
    var dd = String(date?.getDate()).padStart(2, '0');
    var mm = String(date?.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date?.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate == 'undefined-NaN-undefined' ? null : returnDate;
  }

  toggleDate() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      this.startDate = new Date();
      this.endDate = new Date();
    } else {
      this.isChecked = false;
      this.startDate = null;
      this.endDate = null;
    }
  }
  clear() {
    this.customerId = -1;
    this.salemanId = -1;
    this.isChecked = false;
    this.startDate = new Date();
    this.endDate = new Date();
  }
}

export const columnDetailList = (component: InvoiceProfitAnalysisComponent) => [
  {
    data: 'invoiceNo',
    type: 'text',
    label: 'Inv No.',
    toolTip: 'Invoice Number',
  },
  {
    data: 'date',
    type: 'text',
    label: 'Inv Date',
    toolTip: 'Invoice Date',
  },

  {
    data: 'customerName',
    type: 'text',
    label: 'Customer Name',
    toolTip: 'Customer Name',
  },
  {
    data: 'salesAmount',
    type: 'numeric',
    label: 'Inv Amount',
    toolTip: 'Total Invoice Amount',
  },
  {
    data: 'costPrice',
    type: 'numeric',
    label: 'Cost',
    toolTip: 'Total Cost of Goods',
  },
  {
    data: 'profit',
    type: 'numeric',
    label: 'Profit',
    toolTip: 'Calculated Profit',
  },
  {
    data: 'profitPercent',
    type: 'numeric',
    label: 'Profit %',
    toolTip: 'Profit Percentage',
  },
];
