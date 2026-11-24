import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { defaults } from 'src/app/shared/service/settings';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { timeStamp } from 'console';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { EnquiryStatus } from 'src/app/routes/domain/Sales/EnquiryStatus';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import Handsontable from 'handsontable';
import { DatePipe } from '@angular/common';
import { DatefilterComponent } from 'src/app/shared/component/datefilter/datefilter.component';

@Component({
  selector: 'app-customer-enquiry-search',
  templateUrl: './customer-enquiry-search.component.html',
  styleUrls: ['./customer-enquiry-search.component.scss'],
})
export class CustomerEnquirySearchComponent implements OnInit {
  @ViewChild(DatefilterComponent) datefilterComponent!: DatefilterComponent;
  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[] = [];
  customerNameList: SelectItem[] = [];
  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];
  EnqueryNoArray: any;
  EnqueryNoList: any;
  EnqueryNoArry: any;
  ScreenId: number;
  Permission: any;
  CustomerEnquiry = 'CustomerEnquirySearch';
  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayPrintPreview: boolean = false;
  enquiryStatusArray: EnquiryStatus[] = [];
  enquiryStatusList: SelectItem[];
  enquiryStatusArry: string[] = [];
  defaultValue: any;
  enableDate = false;
  constructor(
    private translate: TranslateService,
    private router: Router,
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private masterApi: MasterApiService,
    private printService: FileSaverService,
    private stockApi: StockApiService,
    private masterapi: MasterApiService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private datePipe: DatePipe
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  title: string = '';
  index: number = 0;
  report: any = [];
  hotid = 'stockLedgerReport';
  licensekey: string;
  customerEnquirySearch: any;
  dataset: any = [];
  useDateRange: boolean;
  customerEnquiryFormGroup: FormGroup;
  btnFlag: {
    list?: boolean;
    save?: boolean;
    cancel?: boolean;
  };
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.stationmasterObj = this.permission.getStation();
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
    this.messageService.add({
      severity: 'error',
      summary: 'Alert',
      detail: 'Please fill all the required feilds.!',
    });
    this.useDateRange = false;
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.btnFlag = { cancel: true, save: true, list: false };
    this.initializeControls();
    this.customerEnquiryFormGroup = new FormGroup({
      enquiryNo: new FormControl(''),
      dateFrom: new FormControl(new Date()),
      dateTo: new FormControl(new Date()),
      customerName: new FormControl(''),
      salesManId: new FormControl(''),
      EnquiryStatus: new FormControl(''),
      isDate: new FormControl(),
    });
  }
  initializeControls() {
    this.customerEnquirySearch = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: undefined,
      minRows: 3,
      width: '100%',
      height: 150,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      // afterOnCellMouseDown: (event, coords, TD) => {
      //   if ((TD.innerText === null || isNaN(parseInt(TD.innerText))) && this.conditionCheck)
      //     return;
      //   this.getAllItems();
      //   this.conditionCheck = true;
      // },
      // afterChange: (changes) => {
      //   changes?.forEach(([row, prop, oldValue, newValue]) => {
      //     this.stockQuantity = newValue;
      //   });
      // },
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
        { data: 'enquiry_Master_Enquiry_ID', type: 'numeric', readOnly: true },
        { data: 'enquiry_Master_Enquiry_No', type: 'text', readOnly: true },
        { data: 'enquiry_Master_Enquiry_Date', type: 'text', readOnly: true },
        { data: 'enquiry_Master_Remarks', type: 'text', readOnly: true },
        { data: 'customer_Master_Customer_No', type: 'numeric', readOnly: true },
        { data: 'customer_Master_Customer_Name', type: 'text', readOnly: true },
        { data: 'customer_Master_Customer_Contact_Person', type: 'text', readOnly: true },
        { data: 'location_Master_Location_ID', type: 'numeric', readOnly: true },
        { data: 'location_Master_Location_Name', type: 'text', readOnly: true },
        { data: 'salesManId', type: 'numeric', readOnly: true },
        { data: 'salesname', type: 'text', readOnly: true },
        // { data: 'customer_Quotation_QID', type: 'numeric', readOnly: true },
        { data: 'customer_Quotation_VoucherNo', type: 'text', readOnly: true },
        { data: 'customer_Quotation_Quotation_Date', type: 'text', readOnly: true },
        { data: 'approvalStatus', type: 'text', readOnly: true },
        { data: 'status', type: 'text', readOnly: true }
      ],
      colHeaders: [
        this.translate.instant('Enquiry ID'),
        this.translate.instant('Enquiry No'),
        this.translate.instant('Enquiry Date'),
        this.translate.instant('Remarks'),
        this.translate.instant('Customer No'),
        this.translate.instant('Customer Name'),
        this.translate.instant('Contact Person'),
        this.translate.instant('Location ID'),
        this.translate.instant('Location Name'),
        this.translate.instant('Salesman ID'),
        this.translate.instant('Salesman Name'),
        // this.translate.instant('Quotation ID'),
        this.translate.instant('Quotation Voucher No'),
        this.translate.instant('Quotation Date'),
        this.translate.instant('Approval Status'),
        this.translate.instant('Status')
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.getAllCustomerMaster();
    this.getAllSalesManMaster();
    this.getAllEnquiryNumber();
    this.getAllEnquiryStatus();
  }
  getcustomerEnquiryReport() {
    const { fromDate, toDate } = this.datefilterComponent.onApplyDateFilter();

    if (this.enableDate) {
      const selectedSaleMan = this.customerEnquiryFormGroup.controls['salesManId'].value;
      const selectedCustomer = this.customerEnquiryFormGroup.controls['customerName'].value;
      this.defaultValue = {
        isDateChecked: true,
        enquiry_No: this.customerEnquiryFormGroup.controls['enquiryNo'].value
          ? this.customerEnquiryFormGroup.controls['enquiryNo'].value
          : null,
        saleManId: selectedSaleMan && selectedSaleMan !== -1 ? selectedSaleMan : null,
        fromDate: fromDate,
        toDate: toDate,
        statusId: this.customerEnquiryFormGroup.controls['EnquiryStatus'].value
          ? this.customerEnquiryFormGroup.controls['EnquiryStatus'].value
          : null,
        CustomerId: selectedCustomer && selectedCustomer !== -1 ? selectedCustomer : null,
      };
    } else {
      const selectedSaleMan = this.customerEnquiryFormGroup.controls['salesManId'].value;
      const selectedCustomer = this.customerEnquiryFormGroup.controls['customerName'].value;
      this.defaultValue = {
        isDateChecked: false,
        enquiry_No: this.customerEnquiryFormGroup.controls['enquiryNo'].value
          ? this.customerEnquiryFormGroup.controls['enquiryNo'].value
          : null,
        saleManId: selectedSaleMan && selectedSaleMan !== -1 ? selectedSaleMan : null,
        //fromDate: this.customerEnquiryFormGroup.controls['dateFrom'].value?this.customerEnquiryFormGroup.controls['dateFrom'].value:'',
        //toDate:this.customerEnquiryFormGroup.controls['dateTo'].value?this.customerEnquiryFormGroup.controls['dateTo'].value:'',
        statusId: this.customerEnquiryFormGroup.controls['EnquiryStatus'].value
          ? this.customerEnquiryFormGroup.controls['EnquiryStatus'].value
          : null,
        CustomerId: selectedCustomer && selectedCustomer !== -1 ? selectedCustomer : null,
      };
    }

    this.stockApi
      .getEnquiryStatusReportSearch(this.defaultValue)
      .subscribe((res: any) => {
        this.report = res.result;
        this.dataset = res.result;
      });
  }
  getAllCustomerMaster() {
    this.masterapi.GetAllCustomer().subscribe((k) => {
      this.CustomerMasterArray = k;
      const mappedCustomerList = k.map((kl) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
              ' -- ' +
              kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList = [...mappedCustomerList];
      this.customerNameList = [...mappedCustomerList];
      this.CustomerMasterList.unshift({ label: '--Select--', value: -1 });
      this.customerNameList.unshift({ label: '--Select--', value: -1 });
      this.CustomerMasterArry = k.map(
        (ar) =>
          ar.customerMasterCustomerName?.trim() +
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
        label: '--Select Sales Man--',
        value: -1,
      });
      this.SalesManMasterArry = k.map(
        (ar) =>
          ar.salesManMasterSalesManName?.trim() +
          '|' +
          ar.salesManMasterSalesManId
      );
    });
  }
  getAllEnquiryNumber() {
    this.stockApi.getAllEnqueryNo().subscribe((k: any) => {
      this.EnqueryNoArray = k;
      this.EnqueryNoList = k.map((kl) => ({
        label: kl?.enquiryNO,
        value: kl.enquiryNOId,
      }));
      this.EnqueryNoList.unshift({ label: '--Select--', value: -1 });
      this.EnqueryNoArry = k.map(
        (ar) => ar.EnquiryNO?.trim() + '|' + ar.EnquiryNOId
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
  // getFilteredcustomerEnquiryReport() {
  //   if ((this.f.enquiryNo.invalid || this.f.customerName.invalid) || (this.useDateRange && (this.f.dateFrom.invalid || this.f.dateTo.invalid))) {
  //     this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill all the required feilds.!' });
  //     console.log('callled');
  //     return;
  //   }
  //   else
  //     this.stockApi.customerEnquiryReport().subscribe(
  //       data => {
  //         console.log(data);
  //         this.report = data;
  //         this.dataset = this.report.Enquiry_Master;
  //       }
  //     );
  // }
  toggleDateRange() {
    if (this.useDateRange) {
      this.customerEnquiryFormGroup.controls['dateTo'].setValue(new Date());
      this.customerEnquiryFormGroup.controls['dateFrom'].setValue(new Date());

      // this.customerEnquiryFormGroup.controls["dateFrom"].enable();
      // this.customerEnquiryFormGroup.controls["dateTo"].enable();
    } else {
      // this.customerEnquiryFormGroup.controls["dateTo"].disable();
      // this.customerEnquiryFormGroup.controls["dateFrom"].disable();
      this.customerEnquiryFormGroup.controls['dateTo'].setValue(null);
      this.customerEnquiryFormGroup.controls['dateFrom'].setValue(null);
    }
  }
  get f() {
    return this.customerEnquiryFormGroup.controls;
  }
  displayPrint() {
    this.displayPrintPreview = true;
    // this.getAllStationMaster()
  }
  displayExcel() {
    this.printService.exportExcel(
      'CustomerEnquirySearch',
      'CustomerEnquirySearch.xlsx'
    );
  }
  clearall() {
    this.customerEnquiryFormGroup.get('enquiryNo').setValue('');
    this.customerEnquiryFormGroup.get('customerName').setValue('');
    this.customerEnquiryFormGroup.get('salesManId').setValue('');
    this.customerEnquiryFormGroup.get('EnquiryStatus').setValue('');
    this.customerEnquiryFormGroup.get('dateFrom').setValue(new Date());
    this.customerEnquiryFormGroup.get('dateTo').setValue(new Date());
    this.enableDate = false;

    // this.customerEnquiryFormGroup.reset();
    this.dataset = [];
  }
  getAllStationMaster() {
    this.masterApi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
  }
  printAsPDF() {
    const fileName = String(new Date().valueOf());
    var css: string = `h1 {
      color: rgb(126, 12, 12);
      text-align: center;
      text-decoration: underline rgb(126, 12, 12);
    }

     .rectImg {
           height: 140px;
          width: 217px;
        }

    .squreImg {
    height: 145px;
    width: 145px;
        }
    h2 {
      text-align: center;
      color: rgb(101, 33, 165);
    }

    h3 {
      color: rgb(12, 150, 150);
      margin-left: 5%;
    }

    .Acc {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 90.5%;
      font-size: 12px;
      margin-left: 5%;
    }

    .Acc td,
    .Acc th {
      border: 1px solid #aca8a8;
      padding: 8px;
    }

    .Acc tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    .Acc tr:hover {
      background-color: #ddd;
    }

    .Acc th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: rgb(247, 240, 240);
      color: black;

    }
    .table{
      width: 70%;
      margin-left: 30%;
      margin-top: 17px;
      margin-bottom: 10px;

      td {
        width: 35px;
      }
    }

 `;
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
    this.userTrackingLog('PDF');
  }
  userTrackingLog(type) {
    let req = {
      page: '',
      section: this.report,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: '',
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
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
