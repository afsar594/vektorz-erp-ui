import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MessageService, ConfirmationService, SelectItem } from 'primeng';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
@Component({
  selector: 'app-delivery-order-report',
  templateUrl: './delivery-order-report.component.html',
  styleUrls: ['./delivery-order-report.component.scss'],
})
export class DeliveryOrderReportComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  licensekey: any;
  gridHeader: string;
  index: number = 0;
  invoiceStatus: any;
  files: any;
  cols: any;
  ScreenId: number;
  Permission: any;
  handleChange(e) {
    this.index = e.index;
  }
  hotid = 'deliveryorderreport';
  private hotRegisterer = new HotTableRegisterer();
  deliveryorderreport: Handsontable.GridSettings;

  customerArray: CustomerMaster[] = [];
  customerArry: string[] = [];
  customerList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];
  locationLocked = false;

  DORform: FormGroup;
  invoiceStatusList: any[] = [
    { label: 'Transit', value: 'transit' },
    { label: 'Emailed', value: 'emailed' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Not Submitted', value: 'not_submitted' },
  ];

  initializeControls() {
    this.getAllCustomer();
    this.getAllLocation();
    this.deliveryorderreport = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [60, 60, 90, 60, 60],
      minRows: 5,
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

      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'DelId',
          type: 'numeric',
        },
        {
          data: 'DelDate',
          type: 'numeric',
        },

        {
          data: 'Customer Name',
          type: 'numeric',
        },
        {
          data: 'Location',
          type: 'numeric',
        },
        {
          data: 'Status',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Del. ID'),
        this.translate.instant('Del. Date'),
        this.translate.instant('Customer Name'),
        this.translate.instant('Location'),
        this.translate.instant('Status'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private router: Router,
    private masterapi: MasterApiService,
    private translate: TranslateService,
    private stockApi: StockApiService,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,
    private utilityService: UtilityService,

    private formatDateService: ReportDateFormatService
  ) { }

  ngOnInit(): void {
    this.DORform = new FormGroup({
      Customer: new FormControl(''),
      Location: new FormControl(''),
      invoiceStatus: new FormControl(''),
      DateTO: new FormControl(new Date()),
      DateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear() - 5))
      ),
      isDate: new FormControl(false),
      isRadioBtn: new FormControl('Date'),
      PrintType: new FormControl('Summary'),
    });

    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
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
    this.initializeControls();
  }

  printType() {
    this.DORform.get('PrintType').valueChanges.subscribe((value) => {
      if (value === 'Summary') {
        this.DORform.get('PrintType').setValue('Summary');
      } else if (value === 'Details') {
        this.DORform.get('PrintType').setValue('Details');
      }
    });
  }
  rptFilter: ReportFilterModel;
  pdfSource: any;
  getPOReport() {

    const f = this.DORform.value;

    let where = `where 1=1`;

    if (f.Customer) {
      where += ` and Customer_Master_Customer_No = ${f.Customer}`;
    }

    if (f.Location) {
      where += ` and Location_Master_Location_ID = '${f.Location}'`;
    }

    if (f.isDate && f.DateFrom && f.DateTO) {
      const from = this.formatDateService.yyyymmdd(f.DateFrom);
      const to = this.formatDateService.yyyymmdd(f.DateTO);
      where += ` and Customer_Delivery_Note_Delivery_Date between '${from}' and '${to}'`;
    }
    const print =
      f.PrintType == 'Summary'
        ? 'rptDeliveryNoteSummary'
        : 'rptDeliveryNoteDetails';

    this.rptFilter = {
      ReportName: print,
      SelectionFormula: '',
      Parameters: [],
      Queries: [`select * from vw_DeliveryNote ${where}`],
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

  getReport() {
    const DateObj = new Date(this.DORform.value.DateFrom);
    DateObj.setDate(DateObj.getDate() - 1);
    var defaultData = {
      locationId: this.DORform.value.Location ? this.DORform.value.Location : 0,
      customerId: this.DORform.value.Customer ? this.DORform.value.Customer : 0,
      invioceStatus: this.DORform.value.invoiceStatus
        ? this.DORform.value.invoiceStatus
        : '',
      fromDate: DateObj,
      ssDateCheck: this.DORform.value.isDate,
      toDate: this.DORform.value.DateTO,
      formate: this.DORform.value.isRadioBtn
        ? this.DORform.value.isRadioBtn
        : '',
    };
    this.stockApi
      .getDeliveryNoteReportDetails(defaultData)
      .subscribe((response: any) => {
        this.files = response.result;
      });
  }

  getAllCustomer() {
    this.masterapi.GetAllCustomer().subscribe((k) => {
      this.customerArray = k;
      this.customerList = k.map((kl) => ({
        label: kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.customerList.unshift({ label: '--Select--', value: -1 });
      this.customerArry = k.map((ar) => ar.customerMasterCustomerName.trim());
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
      this.locationList.unshift({ label: '--Select--', value: -1 });
      this.locationArry = k.map((ar) => ar.locationMasterLocationName.trim());
      this.locationLocked = this.utilityService.applyLocationLock(
        this.DORform,
        'Location'
      );
    });
  }

  resetForm() {
    this.DORform.controls['Customer'].setValue('');
    this.DORform.controls['invoiceStatus'].setValue('');
    this.DORform.controls['DateTO'].setValue(new Date());
    this.DORform.controls['DateFrom'].setValue(new Date());
    this.DORform.controls['isDate'].setValue(false);
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(this.DORform, 'Location');
    } else {
      this.DORform.controls['Location'].setValue('');
    }
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
}
