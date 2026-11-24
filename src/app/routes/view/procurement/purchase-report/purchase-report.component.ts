import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MessageService, ConfirmationService, MenuItem } from 'primeng';
import { SupplierMaster } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { PurchaseReportResponseModel } from 'src/app/routes/domain/Masters/PurchaseReportResponseModel';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ProcurementService } from 'src/app/routes/service/procurement/procurement.service';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { LocalStorageService } from 'src/app/shared/service/storage.service';

@Component({
  selector: 'app-purchase-report',
  templateUrl: './purchase-report.component.html',
  styleUrls: ['./purchase-report.component.scss'],
})
export class PurchaseReportComponent implements OnInit {
  dataArray: any = [];

  constructor(
    private activatedroute: ActivatedRoute,
    private stockApi: StockApiService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private fileSaverService: FileSaverService,
    private utilityService: UtilityService,
    private permission: PermissionsService,
    private procurementApi: ProcurementService,
    private storage: LocalStorageService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  calenderView = 'date';
  calenderViewFormat = 'dd/mm/yy';
  breadcumbmodel: MenuItem[];
  title: string;
  licensekey: string;
  currencyList: any;
  Permission: any;
  ScreenId: number;
  invoiceTlist: any[] = [
    { label: 'All', value: 'all' },
    { label: 'Cash', value: 'cash' },
    { label: 'Credit', value: 'credit' },
  ];
  enableDate: boolean = false;
  confirmDialog: boolean = false;
  displayMaximizable: boolean = false;
  btnFlag: BtnFlag;
  locationList: Array<LocationMaster> = [];
  locationLocked = false;
  supplierList: Array<SupplierMaster> = [];
  jobList: Array<JobMaster> = [];
  frmSalesReport: FormGroup;
  //
  location: any = '';

  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  currency: string = '';
  supplier: string = '';
  job: string = '';
  invoiceType: string = '';
  // //////
  cols: Array<any> = [
    { header: 'Vch No.', field: 'voucherNo' },
    { header: 'Vch Date', field: 'purchaseDate' },
    { header: 'Supplier', field: 'supplierName' },
    { header: 'Ref No', field: 'supplierRefNo' },
    { header: 'Job No', field: 'jobNo' },
    { header: 'Gross Amt', field: 'grossNo' },
    { header: 'Disc Amt', field: 'discount' },
    { header: 'Vat Amt', field: 'vatAmount' },
    { header: 'Net Amt', field: 'netAmount' },
    { header: 'Location', field: 'location' },
  ];

  ngOnInit(): void {
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
    this.btnFlag = {
      new: false,
      edit: true,
      cancel: true,
      save: true,
      delete: true,
      list: false,
    };
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.frmSalesReport = new FormGroup({
      supplier: new FormControl('', Validators.required),
      job: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
      invoiceType: new FormControl('', Validators.required),
      invoiceStatus: new FormControl('', Validators.required),
      currency: new FormControl('', Validators.required),
      dateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      dateTo: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
    });
    // this.initializeControls();
    this.getAllCurrency();
    this.getAllJobs();
    this.getAllLocation();
    this.getAllSuppliers();
    this.disableFields();
    this.getCompanyDetails();
    // this.getAllPurchaseReport()
  }

  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((response: any) => {
      this.locationList = response;
      const id = this.utilityService.getLockedLocationId();
      if (id > 0) {
        const match = (response || []).find(
          (l) => l.locationMasterLocationId == id
        );
        if (match) {
          this.location = match;
          this.locationLocked = true;
        }
      }
    });
  }

  changedate(type) {
    this.calenderView = type;
    this.calenderViewFormat =
      type == 'date' ? 'dd/mm/yy' : type == 'month' ? 'mm/yy' : 'yy';
  }

  getAllJobs() {
    this.masterapi.GetAllJob().subscribe((response: any) => {
      this.jobList = response;
    });
  }

  getAllSuppliers() {
    this.masterapi.GetAllSupplier().subscribe((response: any) => {
      this.supplierList = response;
    });
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((response: any) => {
      this.currencyList = response;
    });
  }

  toggleDate() {
    this.enableDate = !this.enableDate;
    if (this.enableDate) {
      this.frmSalesReport.controls['dateTo'].enable();
      this.frmSalesReport.controls['dateFrom'].enable();
    } else {
      this.frmSalesReport.controls['dateTo'].disable();
      this.frmSalesReport.controls['dateFrom'].disable();
    }
  }

  disableFields() {
    this.frmSalesReport.controls['invoiceStatus'].disable();
  }

  newEntry() {
    this.frmSalesReport.controls['invoiceStatus'].enable();
    this.btnFlag.cancel = false;
    this.temp();
  }

  cancelAll() {
    if (this.locationLocked) {
      const id = this.utilityService.getLockedLocationId();
      const match = this.locationList?.find(
        (l) => l.locationMasterLocationId == id
      );
      if (match) this.location = match;
    } else {
      this.location = '';
    }

    this.dateFrom;
    this.dateTo;
    this.currency = '';
    this.supplier = '';
    this.job = '';
    this.invoiceType = '';
    const defaultLocationId = this.utilityService.getLockedLocationId();
    this.location = this.locationList.find(l => l.locationMasterLocationId === defaultLocationId) as any || '';
    this.btnFlag.cancel = true;
    this.btnFlag.new = false;
    this.btnFlag.list = false;
    this.btnFlag.delete = true;
    this.btnFlag.save = true;
    this.btnFlag.edit = true;
    this.disableFields();
  }

  temp() {
    this.messageService.add({
      severity: 'success',
      summary: 'Alert',
      detail: 'Receipt Voucher Updated Succesfully',
    });
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to save voucher?',
      accept: () => {
        alert('Working');
      },
    });
  }

  girdDataArray: Array<GridData> = [];
  purchaseReportList: Array<PurchaseReportResponseModel> = [];
  getAllPurchaseReport() {
    this.girdDataArray = new Array<GridData>();
    this.procurementApi.GetPurchaseReport().subscribe((response: any) => {
      this.dataArray = response;

      if (
        this.location ||
        this.dateFrom ||
        this.dateTo ||
        this.currency ||
        this.supplier ||
        this.job ||
        this.invoiceType
      ) {
        this.filterData(
          this.location,
          this.dateFrom,
          this.dateTo,
          this.currency,
          this.supplier,
          this.job,
          this.invoiceType
        );
      } else {
        this.purchaseReportList = this.dataArray; // Show all data if no filters applied
      }
    });
  }

  filterData(
    location: string,
    dateFrom: Date,
    dateTo: Date,
    currency: string,
    supplier: string,
    job: string,
    invoiceType: string
  ) {
    this.purchaseReportList = this.dataArray?.filter((item: any) => {
      // Apply location filter
      if (location && item?.locationName !== location) {
        return false;
      }

      // Apply date filter
      const purchaseDate = new Date(item?.date?.substring(2, 10));
      if (dateFrom && purchaseDate < dateFrom) {
        return false;
      }
      if (dateTo && purchaseDate > dateTo) {
        return false;
      }

      // Apply currency filter
      // Assuming the currency information is in item?.currencyId
      if (currency && item?.currency !== currency) {
        return false;
      }

      // Apply supplier filter
      if (supplier && item?.supplierName !== supplier) {
        return false;
      }

      // Apply job filter
      // Assuming the job information is in item?.jobId
      if (job && item?.job !== job) {
        return false;
      }

      // Apply invoiceType filter
      // Assuming the invoiceType information is in item?.purchaseType
      if (invoiceType && item?.purchaseType !== invoiceType) {
        return false;
      }

      // All filters passed, keep the item in the list
      return true;
    });
  }

  showAllData() {
    this.purchaseReportList = this.dataArray;
    // The showAllData() function should simply update the grid with the filtered data
    // this.hotRegisterer.getInstance(this.hotid).updateSettings({
    //   data: this.purchaseReportListng
    // });
  }

  displayPrintPreview() {
    this.displayMaximizable = true;
  }
  companyDetails: StationMaster;
  getCompanyDetails() {
    this.masterapi.getCompanyDetails().subscribe((response) => {
      this.companyDetails = response[0];
    });
  }

  dateToday: Date = new Date();

  userTrackingLog(type) {
    let req = {
      page: '',
      // section: this.purchaseReportList,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: '',
      vpUserId: this.permission.getUser(),
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  printAsPDF() {
    var data = document.getElementById('printPDF');
    this.fileSaverService.saveAsPDF(
      data,
      'Purchase_Report_' + String(this.dateToday)
    );
    this.userTrackingLog('PDF');
  }
}

interface GridData {
  purchaseId?: string;
  voucherNo?: string;
  purchaseDate?: string;
  purchaseType?: string;
  supplierName?: string;
  supplierRefNo?: string;
  itemName?: string;
  unit?: string;
  qty?: string;
  rate?: string;
  discount?: string;
  vatAmount?: string;
  netAmount?: string;
  grossAmt?: string;
  location?: string;
}

interface BtnFlag {
  new?: boolean;
  edit?: boolean;
  cancel?: boolean;
  delete?: boolean;
  save?: boolean;
  list?: boolean;
}
