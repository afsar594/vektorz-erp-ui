import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MenuItem, SelectItem } from 'primeng';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { EnquiryStatus } from 'src/app/routes/domain/Sales/EnquiryStatus';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-customer-qutation-detail',
  templateUrl: './customer-qutation-detail.component.html',
  styleUrls: ['./customer-qutation-detail.component.scss'],
})
export class CustomerQutationDetailComponent implements OnInit {
  title: string;
  subtitle: string;
  licensekey: any;
  breadcumbmodel: MenuItem[];
  CustomerQuotationDetail: FormGroup;
  dataset: any;
  gridHeader: string;
  index: number = 0;
  ScreenId: number;
  Permission: any;
  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];
  enquiryStatusArray: EnquiryStatus[] = [];
  enquiryStatusList: SelectItem[];
  enquiryStatusArry: string[] = [];
  invoiceList = [
    { label: '  -- Select --', value: null },
    { label: ' CASH', value: 0 },
    { label: ' CREDIT', value: 1 },
  ];
  status = [
    { label: '  -- Select --', value: null },
    { label: 'Open', value: true },
    { label: 'Close', value: false },
  ];
  defaultValue: any;
  handleChange(e) {
    this.index = e.index;
  }
  hotid = 'customarquotation';
  private hotRegisterer = new HotTableRegisterer();
  customarquotation: Handsontable.GridSettings;
  selectedView: string = 'Summary';
  initializeControls() {
    this.customarquotation = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [60, 30, 30, 30, 30],
      minRows: 13,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      // allowInsertColumn: false,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'quotationId',
          type: 'text',
          className: 'htCenter',
        },
        {
          data: 'voucherNo',
          type: 'text',
          className: 'htCenter',
        },
        {
          data: 'voucherType',
          type: 'text',
          className: 'htCenter',
        },
        {
          data: 'quotationDate',
          type: 'text', // Use text type to display formatted date
          renderer: this.dateRenderer.bind(this),
          readOnly: true,
          className: 'htCenter',
        },
        {
          data: 'customerName',
          type: 'text',
          className: 'htCenter',
        },
        {
          data: 'netAmount',
          type: 'numeric',
          className: 'htCenter',
        },
        {
          data: 'status',
          type: 'text',
          className: 'htCenter',
        },
      ],

      colHeaders: [
        this.translate.instant('Qtn No'),
        this.translate.instant('Voucher.No'),
        this.translate.instant('Voucher Type'),
        this.translate.instant('Date'),
        this.translate.instant('Customer'),
        this.translate.instant('Amount'),
        this.translate.instant('Status'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    this.show();
    this.getAllCustomerMaster();
    this.getAllEnquiryStatus();
  }
  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private router: Router,
    private permission: PermissionsService,
    private masterapi: MasterApiService,
    private formatDateService: ReportDateFormatService,
    private crystalReportService: CrystalReportService,
    private salesapi: SalesApiService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.CustomerQuotationDetail = new FormGroup({
      CustomerID: new FormControl(null),
      customerstatus: new FormControl(null),
      fromDate: new FormControl(new Date()),
      toDate: new FormControl(new Date()),
      isDate: new FormControl(),
    });
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      if (rights) {
        var res = rights[0];
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
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
  }

  rptFilter: ReportFilterModel;
  pdfSource: any;
  getPOReport() {
    const f = this.CustomerQuotationDetail.value;

    let where = `where 1=1`;

    if (f.CustomerID) {
      where += ` and Customer_ID = ${f.CustomerID}`;
    }

    // if (f.customerstatus) {
    //   where += ` and Status = '${f.customerstatus}'`;
    // }

    if (f.isDate && f.fromDate && f.toDate) {
      const from = this.formatDateService.yyyymmdd(f.fromDate);
      const to = this.formatDateService.yyyymmdd(f.toDate);
      where += ` and Customer_Quotation_Quotation_Date between '${from}' and '${to}'`;
    }

    this.rptFilter = {
      ReportName: 'rptQuotationDetails',
      SelectionFormula: '',
      Parameters: [],
      Queries: [`select * from vr_CustomerQuotation ${where}`],
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

  get f() {
    return this.CustomerQuotationDetail.controls;
  }
  GetVtype(id) {
    const foundItem = this.invoiceList?.find((res) => res.value === id);
    if (foundItem) {
      return foundItem.label;
    }
  }

  getAllCustomerMaster() {
    this.masterapi.GetAllCustomer().subscribe((k) => {
      this.CustomerMasterArray = k;
      this.CustomerMasterList = k.map((kl) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
              ' -- ' +
              kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({
        label: '--Select Customer--',
        value: -1,
      });
      this.CustomerMasterArry = k.map(
        (ar) =>
          ar.customerMasterCustomerName?.trim() +
          '|' +
          ar.customerMasterCustomerNo
      );
    });
  }
  getAllEnquiryStatus() {
    this.masterapi.GetAllEnquiryStatus().subscribe((k) => {
      this.enquiryStatusArray = k;
      this.enquiryStatusList = k.map((kl) => ({
        label: kl.enquiryStatusEnquiryStatus,
        value: kl.enquiryStatusEnquiryStatusId,
      }));
      this.enquiryStatusList.unshift({ label: '--Select--', value: -1 });
      this.enquiryStatusArry = k.map((ar) =>
        ar.enquiryStatusEnquiryStatus.trim()
      );
    });
  }
  show() {
    if (this.CustomerQuotationDetail.get('isDate').value === true) {
      this.defaultValue = {
        isDateChecked: true,
        customerId:
          this.CustomerQuotationDetail.value.CustomerID === -1
            ? null
            : this.CustomerQuotationDetail.value.CustomerID,
        status: this.CustomerQuotationDetail.value.customerstatus
          ? this.CustomerQuotationDetail.value.customerstatus
          : null,
        fromDate: this.CustomerQuotationDetail.value.fromDate
          ? this.CustomerQuotationDetail.value.fromDate
          : null,
        toDate: this.CustomerQuotationDetail.value.toDate
          ? this.CustomerQuotationDetail.value.toDate
          : null,
      };
    } else {
      this.defaultValue = {
        isDateChecked: false,
        customerId:
          this.CustomerQuotationDetail.value.CustomerID === -1
            ? null
            : this.CustomerQuotationDetail.value.CustomerID,
        status: this.CustomerQuotationDetail.value.customerstatus
          ? this.CustomerQuotationDetail.value.customerstatus
          : null,
        fromDate: this.CustomerQuotationDetail.value.fromDate
          ? this.CustomerQuotationDetail.value.fromDate
          : null,
        toDate: this.CustomerQuotationDetail.value.toDate
          ? this.CustomerQuotationDetail.value.toDate
          : null,
      };
    }
    this.salesapi
      .GetCustomerQuotationDetail(this.defaultValue)
      .subscribe((response: any) => {
        this.dataset = response.result;
      });
  }
  clearfilter() {
    this.CustomerQuotationDetail.get('CustomerID').setValue(null);
    this.CustomerQuotationDetail.get('customerstatus').setValue(null);
    this.CustomerQuotationDetail.get('fromDate').setValue(new Date());
    this.CustomerQuotationDetail.get('toDate').setValue(new Date());
    // this.enquiries=[];
  }
  onChange(event: any, control: any) {
    const selectedValue = event.value;
    if (selectedValue != null && control === 'customer') {
      this.CustomerQuotationDetail.get('CustomerID').setValue(selectedValue);
      this.show();
    }
    if (selectedValue != null && control === 'status') {
      this.CustomerQuotationDetail.get('customerstatus').setValue(
        selectedValue
      );
      this.show();
    }
  }
  ViewDetail(id) {
    window.sessionStorage.setItem('id', id);
    this.router.navigate(['/sale/customerquotation'], {
      queryParams: { menu: 153 },
    });
  }
  dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      td.innerText = formattedDate ? formattedDate : '';
    } else {
      td.innerText = '';
    }
  }
}
