import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { SelectItem } from 'primeng';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

@Component({
  selector: 'app-job-invoice-report',
  templateUrl: './job-invoice-report.component.html',
  styleUrls: ['./job-invoice-report.component.scss'],
})
export class JobInvoiceReportComponent implements OnInit {
  title: string;
  index: number = 0;
  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];
  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];
  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  JobInvoiceReportFormGroup: FormGroup;
  payload: any;
  DataList: any;
  handleChange(e) {
    this.index = e.index;
  }
  dataset: any;
  licensekey: any;
  hotid1 = 'invoicereport';
  private hotRegisterer = new HotTableRegisterer();
  invoicereport: Handsontable.GridSettings;
  initializeControls1() {
    this.invoicereport = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [30, 50],
      minRows: 3,
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
      hiddenColumns: {
        columns: [0],
        indicators: false,
      },
      columns: [
        {
          data: 'Sr No',
          type: 'numeric',
          className: 'htCenter',
        },
        {
          data: 'jobInvoiceVoucherNo',
          type: 'text',
          className: 'htCenter',
        },
        {
          data: 'jobInvoiceCustomerId',
          type: 'text',
          renderer: this.CustomerIdRenderer.bind(this),
          className: 'htCenter',
        },
        {
          data: 'jobInvoiceDetailsGrossAmount',
          type: 'numeric',
          className: 'htCenter',
        },
        {
          data: 'jobInvoiceDetailsDiscount',
          type: 'text',
          className: 'htCenter',
        },
        {
          data: 'jobInvoiceDetailsNetAmount',
          type: 'numeric',
          className: 'htCenter',
        },
      ],
      colHeaders: [
        this.translate.instant('Sr No'),
        this.translate.instant('Voucher No'),
        this.translate.instant('Customer Name'),
        this.translate.instant('Gross Amount'),
        this.translate.instant('Discount'),
        this.translate.instant('Net Amount'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    this.getAllLocation();
    this.getAllSalesManMaster();
    this.getAllCustomerMaster();
  }
  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private masterapi: MasterApiService,
    private accountApi: AccountApiService
  ) {}

  ngOnInit(): void {
    this.JobInvoiceReportFormGroup = new FormGroup({
      CustomerId: new FormControl(null),
      SalesmanId: new FormControl(null),
      locationId: new FormControl(null),
      DateTO: new FormControl(new Date()),
      DateFrom: new FormControl(new Date()),
      isDateChecked: new FormControl(),
    });

    this.initializeControls1();
  }
  getAllCustomerMaster() {
    this.masterapi.GetAllCustomer().subscribe((k) => {
      this.CustomerMasterArray = k;
      this.CustomerMasterList = k.map((kl) => ({
        label: kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({
        label: '--Select Customer --',
        value: -1,
      });
      this.CustomerMasterArry = k.map(
        (ar) =>
          ar.customerMasterCustomerName.trim() +
          '|' +
          ar.customerMasterCustomerNo
      );
    });
  }
  getAllSalesManMaster() {
    this.masterapi.GetAllSalesman().subscribe((k) => {
      this.SalesManMasterArray = k;
      this.SalesManMasterList = k.map((kl) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.SalesManMasterList.unshift({
        label: '--Select SalesMan--',
        value: -1,
      });
      this.SalesManMasterArry = k.map(
        (ar) =>
          ar.salesManMasterSalesManName.trim() +
          '|' +
          ar.salesManMasterSalesManId
      );
    });
  }

  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      this.locationArray = k;
      this.locationList = k
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = k.map((ar) => ar.locationMasterLocationName?.trim());
    });
  }
  ClearContrll() {
    this.JobInvoiceReportFormGroup.reset();
    this.JobInvoiceReportFormGroup.get('DateTO').setValue(new Date());
    this.JobInvoiceReportFormGroup.get('DateFrom').setValue(new Date());
  }
  show() {
    if (this.JobInvoiceReportFormGroup.get('isDateChecked').value === true) {
      this.payload = {
        isDateChecked: true,
        locationid:
          this.JobInvoiceReportFormGroup.value.locationId != -1
            ? this.JobInvoiceReportFormGroup.value.locationId
            : 0,
        salemanId:
          this.JobInvoiceReportFormGroup.value.SalesmanId != -1
            ? this.JobInvoiceReportFormGroup.value.SalesmanId
            : 0,
        customerId:
          this.JobInvoiceReportFormGroup.value.CustomerId != -1
            ? this.JobInvoiceReportFormGroup.value.CustomerId
            : 0,
        fromdate:
          this.JobInvoiceReportFormGroup.get('isDateChecked').value === true
            ? this.JobInvoiceReportFormGroup.value.DateFrom
            : null,
        todate:
          this.JobInvoiceReportFormGroup.get('isDateChecked').value === true
            ? this.JobInvoiceReportFormGroup.value.DateTO
            : null,
      };
    } else {
      this.payload = {
        isDateChecked: false,
        locationid:
          this.JobInvoiceReportFormGroup.value.locationId != -1
            ? this.JobInvoiceReportFormGroup.value.locationId
            : 0,
        salemanId:
          this.JobInvoiceReportFormGroup.value.SalesmanId != -1
            ? this.JobInvoiceReportFormGroup.value.SalesmanId
            : 0,
        customerId:
          this.JobInvoiceReportFormGroup.value.CustomerId != -1
            ? this.JobInvoiceReportFormGroup.value.CustomerId
            : 0,
        fromdate:
          this.JobInvoiceReportFormGroup.get('isDateChecked').value === true
            ? this.JobInvoiceReportFormGroup.value.DateFrom
            : null,
        todate:
          this.JobInvoiceReportFormGroup.get('isDateChecked').value === true
            ? this.JobInvoiceReportFormGroup.value.DateTO
            : null,
      };
    }
    this.accountApi.getJobInvoice(this.payload).subscribe((response: any) => {
      this.DataList = response.resultSet;
    });
  }
  CustomerIdRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      const customer = this.CustomerMasterList?.find((c) => c.value === value); // Replace 'id' with the correct key
      const customerName = customer ? customer.label : ''; // Replace 'name' with the correct key
      td.innerText = customerName;
    } else {
      td.innerText = '';
    }
  }
}
