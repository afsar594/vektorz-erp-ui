import { CustomerMaster } from './../../../domain/Masters/CustomerMaster';
import { UnitComponent } from './../../master/code/unit/unit.component';
import { CustomerQuotationDetails } from './../../../domain/Sales/CustomerQuotationDetails';
import { LocationMaster } from './../../../domain/Masters/LocationMaster';
import { SalesManMaster } from './../../../domain/Masters/SalesManMaster';
import { CustomerQuotation } from './../../../domain/Sales/CustomerQuotation';
import { ItemMaster } from './../../../domain/Masters/ItemMaster';
import { ImportApiService } from 'src/app/routes/service/import-api.service';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';



import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService, TreeNode } from 'primeng/api';
import { HotTableRegisterer } from '@handsontable/angular';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { timer, Observable } from 'rxjs';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { DialogService } from 'primeng';
import { ItemModifyComponent } from '../item-modify/item-modify.component';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { EnquiryStatus } from 'src/app/routes/domain/Sales/EnquiryStatus';
import { ReturnTypeTransform } from '@angular/compiler-cli/src/ngtsc/transform';
import { CityMaster, CountryMaster } from 'src/app/routes/domain';
import { ToWords } from 'to-words';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { debug, log } from 'console';

@Component({
  selector: 'app-customerquotation',
  templateUrl: './customerquotation.component.html',
  styleUrls: ['./customerquotation.component.scss'],
})
export class CustomerquotationComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('invoCtrl', { static: false }) invoiceCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('custCtrl', { static: false }) customerCtrol: ElementRef;
  @ViewChild('saleCtrl', { static: false }) salesmanCtrol: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;
  CustomerEnquiryStatusFormGroup: FormGroup;

  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string = null;
  index: number = 0;
  cityArray: CityMaster[] = [];
  citylistNew: SelectItem[] = [];
  cityList: CityMaster[];
  cityarry: string[] = [];
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  displayPrintPreview: boolean = false;
  displaycustomerenquirystate: boolean = false;
  lookupGridColumns = [];
  dataList: Array<any> = [];
  showSalesLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  itemArray: ItemMaster[] = [];
  itemArry: string[] = [];
  itemList: SelectItem[];

  ItemMasterArrayByName: any = null;
  funitid: number;

  invoiceList: SelectItem[];

  customerArray: CustomerMaster[] = [];
  customerArry: string[] = [];
  customerList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];

  salesManArray: SalesManMaster[] = [];
  salesManList: SelectItem[];
  salesManArry: string[] = [];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[];
  jobArry: string[] = [];

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;

  unitAry: any;
  unitListt: any;
  units: any;

  unitArray: UnitMaster[] = [];
  unitList: SelectItem[];
  unitArry: string[] = [];
  JOBCOST: boolean = false;
  customerQuotationarry: CustomerQuotation[] = [];

  rptFilter: ReportFilterModel;
  pdfSource: any;
  countryArray: CountryMaster[] = [];
  countryList: SelectItem[];
  countryArry: string[] = [];
  savedCustomerQuotation: CustomerQuotation;
  conversion_Type: number = 0;
  showAmountInWords: boolean = true;
  selectedEnquiries = [];
  loading = false;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'customerQuotationEntry';
  currentRow: number = 0;
  partyDetails: any;
  Obj: any;
  UpdateItem: any;
  ScreenId: number;
  Permission: any;
  enquiries: any;
  defaultValue: any;
  id: any;
  user: any;
  selectedCustomers: any;
  reportname: any;
  VatCalculation: boolean = false;
  istemplate: boolean = false;
  displayMaximizableBOQ: boolean = false;
  BoqData: any;
  selectedBoq: any[] = [];
  boqNo: any;
  isDate: boolean = false;
  fromDate: Date = new Date();
  toDate: Date = new Date();
  colboq: any;
  colenqs: { field: string; header: string; }[];

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private crystalReportService: CrystalReportService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    public dialogService: DialogService,
    private permission: PermissionsService,
    private router: Router,
    private masterapi: MasterApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private salesapi: SalesApiService,
    private api: ImportApiService, private sanitizer: DomSanitizer,

  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  displayMaximizabletemplate: boolean = false;
  displayMaximizabletemplateAdd: boolean = false;
  allTemplates: any;
  templateTypeData: any[] = [];
  templatList: { label: string; value: string }[];
  templateType: any = 'header';
  headerTemplateValue: any = 'header';

  customerQuotationentry: Handsontable.GridSettings;
  customerQuotationFormGroup: FormGroup;
  customerQuotationentryDataset = [];
  locationLocked = false;
  enquiryStatusArray: EnquiryStatus[] = [];
  enquiryStatusList: SelectItem[];
  enquiryStatusArry: string[] = [];
  cols;

  forCQ: boolean = true;
  ngAfterViewInit() { }

  ngOnInit(): void {
    this.id = window.sessionStorage.getItem('id');
    window.sessionStorage.removeItem('id');
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
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
    this.templatList = [
      { label: 'Header', value: 'header' },
      { label: 'Notes', value: 'notes' },
      { label: 'Footer', value: 'footer' },
      { label: 'Payment Trems', value: 'paymentTrems' },
      { label: 'Subject', value: 'subject' },
      { label: 'Warrenty', value: 'warranty' },
      { label: 'Training', value: 'training' },
      { label: 'Technical Details', value: 'technicalDetails' },
    ];
    this.cols = [
      { field: 'customerQuotationVoucherNo', header: 'Quotaiton No' },
      { field: 'customerQuotationQuotationDate', header: 'Quotation Date' },
      { field: 'customerQuotationCustomerId', header: 'Customer Name' },
      { field: 'customerQuotationLocationId', header: 'Location' },
      { field: 'customerQuotationSalesManId', header: 'Sales Man' },
      { field: 'customerQuotationCurrencyId', header: 'Currency' },
      { field: 'customerQuotationRemarks', header: 'Remarks' },
      { field: 'action', header: 'action' },
    ];
    this.colenqs = [
      { field: 'enquiry_Master_Enquiry_No', header: 'Enquiry No' },
      { field: 'enquiry_Master_Enquiry_Date', header: 'Enquiry Date' },
      { field: 'customerQuotationCustomerId', header: 'Customer Name' },
      { field: 'enquiry_Status_Enquiry_Status', header: 'Enquiry Status' },

    ];
    this.invoiceList = [
      { label: '  -- Select --', value: null },
      { label: ' CASH', value: 0 },
      { label: ' CREDIT', value: 1 },
    ];
    this.colboq = [
      { field: 'isSelected', header: 'Select' },
      { field: 'billofQtyId', header: 'Id' },
      { field: 'itemName', header: 'Item' },
      { field: 'qty', header: 'QTY' },
      { field: 'rate', header: 'Rate' },
      { field: 'unitName', header: 'Unit' },
      { field: 'currencyName', header: 'Currency' },

      { field: 'currencyRate', header: 'Cur-Rate' },

      { field: 'finalAmount', header: 'Amount' },
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
    this.initializeControls();
    this.getReportType();
    this.customerQuotationFormGroup = this.fb.group({
      customerQuotationQId: 0,
      customerQuotationVoucherNo: [null],
      // customerQuotationQuotationId: [null],
      customerQuotationQuotationDate: [null, [Validators.required]],
      customerQuotationCustomerID: [null, Validators.required],
      customerQuotationLocationID: [null, Validators.required],
      customerQuotationSalesManID: [null, Validators.required],
      customerQuotationCurrencyID: [-1, [DropDownValidator]],
      customerQuotationDeliveryTimeDate: [null],
      customerQuotationQuotationValidDate: [null],
      customerQuotationVoucherType: [-1, [DropDownValidator]],
      customerQuotationContactPersonV: [null],
      customerQuotationJobId: [-1],
      customerQuotationEnquiryId: [null],
      customerQuotationRemarks: [null],
      customerQuotationDetailsDiscount: [null],
      customerQuotationSubject: [null],
      customerQuotationNote: [null],
      customerQuotationWarranty: [null],
      customerQuotationTraining: [null],
      customerQuotationTechnicalDetails: [null],
      customerQuotationHeader: [null],
      customerQuotationFooter: [null],
      customerQuotationTerms: [null],
      customerQuotationAmount: [null],
      customerQuotationDiscAmount: [null],
      customerQuotationVatAmount: [null],
      customerQuotationVatPercentage: [null],
      customerQuotationNetAmount: [null],
      customerQuotationEnquiryNo: [null],
      customerQuotationIsClose: [null],
      customerQuotationProjectRef: [null],
      customerQuotationProjectN: [null],
      customerQuotationReviseQuotation: [null],
      customerQuotationGrossProfitTotal: [null],
      approvalStatus: [1],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.CustomerEnquiryStatusFormGroup = new FormGroup({
      dateFrom: new FormControl(new Date()),
      dateTo: new FormControl(new Date()),
      CustomerID: new FormControl(null),
      EnquiryStatusId: new FormControl(null),
      isDate: new FormControl(false),
    });
    this.getAllCity();
    this.customerQuotationFormGroup.disable();
    if (this.id) {
      this.GetSavedCustomerQuotationDetails(this.id);
    }
    this.loaddropdown(false);
  }

  clearfilterboq() {
    this.boqNo = null;
    this.isDate = false;
    this.fromDate = new Date();
    this.toDate = new Date();
  }
  exportboq() {
    this.displayMaximizableBOQ = false;
    const hotinstance = this.hotRegisterer.getInstance(this.hotid);
    // Loop through selectedBoq and set values in the grid
    let activeRow = this.activeRow
      ? { ...this.activeRow }
      : { row: 0, column: 0 };
    const tempRemoved: any[] = [];
    this.selectedBoq.forEach((k) => {
      if (k.isSelect) {
        const idx = this.BoqData.indexOf(k);
        if (idx !== -1) {
          tempRemoved.push(k);
          this.BoqData.splice(idx, 1);
        }
      }

      hotinstance.setDataAtCell(activeRow.row, 0, k.itemId); // item
      hotinstance.setDataAtCell(activeRow.row, 2, k.itemName); // materialname
      hotinstance.setDataAtCell(activeRow.row, 3, k.unitName); // unit
      hotinstance.setDataAtCell(activeRow.row, 4, k.qty); // qty
      hotinstance.setDataAtCell(activeRow.row, 5, k.rate); // price
      hotinstance.setDataAtCell(activeRow.row, 6, k.finalAmount); // gamount
      hotinstance.setDataAtCell(activeRow.row, 8, k.qty * k.rate);
      hotinstance.setDataAtCell(activeRow.row, 11, k.boqDetailsId); // discount
      activeRow.row += 1;
    });
    this.selectedBoq = [];
    this.ColumnSum();
    // this.tempRemovedBoq = tempRemoved;
  }

  getData() {
    let req = {
      boqNo: this.boqNo,
      isDate: this.isDate,
      fromDate: this.fromDate,
      toDate: this.toDate,
    };
    this.salesapi.BoqToCustomerQuotation(req).subscribe((res) => {
      this.BoqData = res.result.map((k) => {
        k.isSelect = false;
        return k;
      });
      this.displayMaximizableBOQ = true;
    });
  }

  toggleSelectionBoq(data: any) {
    const index = this.selectedBoq.indexOf(data);
    if (index === -1) {
      this.selectedBoq.push(data);
      data.isSelect = true;
    } else {
      this.selectedBoq.splice(index, 1);
      data.isSelect = false;
    }
  }

  selectedBoqs(data: any): boolean {
    return this.selectedBoq.includes(data);
  }

  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
  }

  public getLocation(id): string {
    return this.locationList?.find((k) => k.value === id)?.label;
  }
  public getSalesMan(id): string {
    return this.salesManList?.find((k) => k.value === id)?.label;
  }

  public getItems(id): string {
    return this.itemList?.find((k) => k.value === id)?.label;
  }

  public getJob(id): string {
    return this.jobList?.find((k) => k.value === id)?.label;
  }

  public getUnit(id): string {
    return this.unitListt?.find((k) => k.value === id)?.label;
  }

  public getCustomer(id): string {
    return this.customerList?.find((k) => k.value === id)?.label;
  }
  public getCustomerdetails(id: number) {
    let customer = this.customerArray?.find(
      (k) => k.customerMasterCustomerNo === id
    );
    return customer;
  }
  getCityName(id) {
    return this.citylistNew?.find((k) => k.value === Number(id))?.label;
  }
  getCountryName(id) {
    this.countryList?.find((k) => k.value === Number(id))?.label;
  }

  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
  }

  getTemplate() { }

  get f() {
    return this.customerQuotationFormGroup.controls;
  }

  initializeControls() {
    this.customerQuotationentry = this.utilityService.getTableConfig(
      columnDetailList(this),
      [10, 11]
    );

    this.customerQuotationentry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      this.currentRow = row;
      if (column === 0 && this.customerQuotationentry.readOnly === false) {
        this.lookupGridColumns = ['Part No', 'Item', 'Item Id'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 3 &&
        this.customerQuotationentry.readOnly === false
      ) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.getUnitByItemId(data[0]);
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 2 &&
        this.customerQuotationentry.readOnly === false
      ) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.QutationList(data[2], data[0]);
      }
      // else if (column === 5) {
      //   this.lookupGridColumns = ['Cost Center', 'Cost Center ID'];
      //   this.dataList = this.costSetLookup;
      //   this.showAccountLookUp = true;
      //   this.activeRow = {row, column};
      // }
      else {
        this.showSalesLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.sales == x);
      } else {
        this.selectItem = {};
      }
    };

    this.customerQuotationentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showSalesLookUp = false;
      if (change[0][1] === 0) {
        this.showSalesLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.customerQuotationentry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);

      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);

        if (data[4] != null && data[5] != null && change[0][1] != 'netamount') {
          //&& data[7] != null
          var sum1 = data[4] * data[5];
          var discountValue = data[7] * data[4];
          if (discountValue > sum1) {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Discount must be less than net amount',
            });
            this.hotRegisterer
              .getInstance(this.hotid)
              .setDataAtCell(change[0][0], 7, 0);
          } else {
            var totalSum = data[4] * data[5];
            var discValue = data[7] * data[4];
            var result = totalSum - discValue;
            // var vatAmount = result * 5 / 100;
            // var sum = result + vatAmount;
            var gross_Profit = data[5] * data[4] - (data[9] ?? 1 * data[4]);
            if (this.currentRow >= 0 && data[0] != null) {
              if (
                this.customerQuotationentryDataset[this.currentRow].item ===
                undefined
              ) {
                return;
              }
              this.customerQuotationentryDataset[this.currentRow].gamount =
                totalSum;
              this.customerQuotationentryDataset[this.currentRow].grossProfit =
                gross_Profit;
              // this.customerQuotationentryDataset[index].vatPer = vatPer
              this.customerQuotationentryDataset[this.currentRow].netamount =
                result;
              this.customerQuotationentryDataset[this.currentRow].disc =
                discValue;
              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data: this.customerQuotationentryDataset });
            }
          }
        }
      }
      this.ColumnSum();
    };
    this.customerQuotationentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum();
    };

    this.customerQuotationentry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };

    this.customerQuotationentry.afterChange = (r, c) => { };
  }

  ColumnSum() {
    if (this.customerQuotationentryDataset.length === 0) {
      return;
    }
    var sum2 = 0;
    this.customerQuotationentryDataset.forEach((elemt: any) => {
      if (elemt && elemt.gamount) {
        sum2 += elemt.gamount;
      }
    });

    sum2 = parseFloat(sum2.toFixed(2));
    this.customerQuotationFormGroup.controls.customerQuotationAmount.setValue(
      sum2
    );

    var disc1 = 0;
    this.customerQuotationentryDataset.forEach((elemt: any) => {
      if (elemt && elemt.discount) {
        disc1 += elemt.discount;
      }
    });
    disc1 = parseFloat(disc1.toFixed(2));
    this.customerQuotationFormGroup.controls.customerQuotationDiscAmount.setValue(
      disc1
    );

    var sum3 = 0;
    this.customerQuotationentryDataset.forEach((elemt: any) => {
      if (elemt && elemt.grossProfit) {
        sum3 += elemt.grossProfit;
      }
    });
    sum3 = parseFloat(sum3.toFixed(2));
    this.customerQuotationFormGroup.controls.customerQuotationGrossProfitTotal.setValue(
      sum3
    );
    this.GetTotal();
  }

  get getStatus() {
    if (
      !this.savedCustomerQuotation ||
      this.savedCustomerQuotation.approvalStatus == null
    ) {
      return 'Pending';
    } else {
      return this.savedCustomerQuotation.approvalStatus === 1
        ? 'Pending'
        : this.savedCustomerQuotation.approvalStatus === 2
          ? 'Approved'
          : 'Rejected';
    }
  }

  GetTotal($event = null) {
    const formValues = this.customerQuotationFormGroup.value;
    const vatPercentage = formValues.customerQuotationVatPercentage;

    const totalGrossAmount = Number(formValues.customerQuotationAmount) || 0;
    const totalDisAmount = Number(formValues.customerQuotationDiscAmount) || 0;
    const vatAmount = totalGrossAmount * (vatPercentage / 100);

    const totalActualAmount = totalGrossAmount - totalDisAmount;
    const netAmt = totalActualAmount + vatAmount;

    this.customerQuotationFormGroup.controls.customerQuotationVatAmount.setValue(
      vatAmount.toFixed(2)
    );
    this.customerQuotationFormGroup.controls.customerQuotationNetAmount.setValue(
      netAmt.toFixed(2)
    );
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    return Math.max(0, 10 - salesVoucherDetailsLength);
  }

  getPIReport() {
    const fileName = String(new Date().valueOf());
    var css: string = `

#customers {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
    // border:  2px solid #85898ee0;
}

#customers td,
#customers th {
  border: 1px solid #ddd;
  padding: 8px;

}

#customers tr:nth-child(even) {
  background-color: #f2f2f2;
}

#customers tr:hover {
  background-color: #ddd;
}

#customers th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #bcc0bf;
  color: rgb(0, 0, 0);
  text-align: center;
}
  .flex {
      display: flex;
      margin-bottom: 5px;
      gap: 2px; /* Adjusted the gap value here */
     }

    .contain1{
      width: 43.5%;
       border-radius: 1px;
      margin-top: 6%;
       padding-bottom: 0%;
      padding: 8px;
     }

    .contain2{
      width: 43.5%;
       border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
      padding: 8px;
      margin-left: 65px;
     }

     .bank2 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49.5%;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
      padding: 8px;
      box-shadow: 5px 5px rgb(201, 204, 204);
     }

   .w70{
    width:280px;
   }

    .bank1 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49%;
      padding: 8px;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
        box-shadow: 5px 5px rgb(201, 204, 204);
    }

  .min-panel {
      min-height: 106px !important;
  }

  :host ::ng-deep .ui-table .ui-table-thead>tr>th {
      position: -webkit-sticky;
      position: sticky;
      top: -8px;
      box-shadow: 1px 3px 6px 0 rgba(32, 33, 36, 0.10);
  }

  @media screen and (max-width: 64em) {
      :host ::ng-deep .ui-table .ui-table-thead>tr>th {
          top: -8px;
      }
  }

  .ui-dropdown {
      min-width: 50% !important;
  }

  .signature-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
  }

  .customer-signature {
      order: 1; /* Specifies the order of the flex items */
  }

  .authorized-signature {
      order: 2; /* Specifies the order of the flex items */
  }


    .flexcol{
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
    }

    .flexrow{
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: start;
    }

    .border{
        border: 1px #b1aeae solid;
        border-radius: 5px ;
        margin-bottom: 5px;
        padding: 15px;
    }
    .bR{
      border-right: 1px solid #ddd ;
      margin-right:10px ;
    }

    .rowgap{
        gap: 111px;
    }
    .w-80 {
      width: 80% !important;
    }
    .w-20 {
      width: 20% !important;
    }
    .flexSpaceBetween{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-bottom: 20px;
    }

    .center {
      text-align: center;
    }

    .alignEnd{
      align-items: end;
  }

  .end{
    text-align: end;
  }

  .w-100 {
    width: 100% !important;
  }
  h2{
    margin: 0 0 8px 0;
  }

  .wp-50{
    width: 50% !important;
  }

  .alignstart{
    text-align: start;
  }
  .w-80 {
    width: 75% !important;
  }
  .w-20{
    width: 25% !important;
  }
  .page {
    page-break-after: always;
  }
  h2{
    margin: 0 0 8px 0;
  }
  h1{
    margin: 0 0 8px 0;
  }
  h1{
    margin: 0 0 8px 0;
  }
  .w0 {
    width: 40px !important;
  }
  .w50 {
    width: 35px !important;
  }

  @page {
    margin: 5mm 10mm;

  }
  @media print {
    thead {display: table-header-group;}
    tfoot {display: table-footer-group;}
    table { page-break-inside:auto ;
      font-size: 11px;}
    tr { page-break-inside:avoid; page-break-after:auto }

    body {margin: 0;}

  .rectImg {
height: 140px;
    width: 217px;
}

.squreImg {
  height: 145px;
  width: 145px;
}
    .gaprow{
      gap: 50px;
    }
    .container {
      position: relative;
      min-height: 100vh;
    }
    .print.page {
      page-break-after: always; /* Force page break after content */
      font-size: 12px;
    }
//     .page-footer {
//       // position: running(footer); /* Use "fixed" for sticking on the last page */
//       position: absolute;
//   bottom: 0;
//   width: 100%;
//   height: 2.5rem;            /* Footer height */
// }

    }

    @page :last {  /* Target the last page */

    }

  }
  #page-container {
    position: relative;
    min-height: 100vh;
  }

  #content-wrap {
    padding-bottom: 2.5rem;    /* Footer height */
  }

  #footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 2.5rem;            /* Footer height */
  }
.page-footer {
  text-align: center;

  margin-left: 10%;
  margin-top: -3px;
   border-top: 0px solid rgb(201, 204, 204);
  
}
.sp{
  margin-top: 100px;
}
  `;
    var data = document.getElementById('print');
    // let html: any = document.getElementById('print');
    // this.printService.saveAsPDF(data, 'saleVoucherPDF');
    this.printService.PrintPDF('print', css);
    // this.userTrackingLog('PDF');
  }
  userTrackingLog(type) {
    let req = {
      page: 'Customer Quotation',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.customerQuotationFormGroup.get('customerQuotationVoucherNo')
        .value,
      vpType: 'Customer Quotation',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  displayPrint() {
    //this.getAllStationMaster();
    this.displayPrintPreview = true;
  }
  printbtn: MenuItem[];
  getReportType() {
    this.masterapi.General('Quotation').subscribe((res: any) => {
      this.printbtn = res.map((r: any) => ({
        label: r.reportTypeDescription,
        command: () => this.showPrint(r.reportTypeFileName),
      }));
    });
  }
  showPrint(type) {
    this.rptFilter = {
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `SELECT * FROM vr_CustomerQuotation vr_CustomerQuotation  WHERE  vr_CustomerQuotation.Customer_Quotation_VoucherNo='${this.customerQuotationFormGroup.getRawValue()
          .customerQuotationVoucherNo
        }' `,
      ],
      ReportName: type,
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        console.log('reponse', response);
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  ItemId() {
    let selectedValue = this.customerQuotationFormGroup.get(
      'customerQuotationCustomerID'
    ).value;
    const selectedCustomer = this.customerArray?.find(
      (customer) => customer.customerMasterCustomerNo == selectedValue
    );

    if (selectedCustomer) {
      this.customerQuotationFormGroup.controls[
        'customerQuotationContactPersonV'
      ].setValue(selectedCustomer.customerMasterCustomerMobile);
    }
  }

  get itemSetLookup() {
    return this.itemArray.map((kl) => ({
      partNo: kl.itemMasterPartNo,
      sales: kl.itemMasterItemName,
      salesId: kl.itemMasterItemId,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      sales: kl.unitMasterUnitShortName,
      salesId: kl.unitMasterUnitId,
    }));
  }

  savecustomerQuotation() {
    this.customerQuotationentry;

    const savedData: Array<any> = this.customerQuotationentryDataset?.filter(
      (k) => k.hasOwnProperty('item')
    );
    const customerQuote: CustomerQuotation = this.customerQuotationFormGroup
      .value as CustomerQuotation;
    customerQuote.customerQuotationQId =
      this.customerQuotationFormGroup.value.customerQuotationQId != null
        ? parseInt(this.customerQuotationFormGroup.value.customerQuotationQId)
        : 0;
    customerQuote.customerQuotationVoucherNo =
      this.customerQuotationFormGroup.getRawValue().customerQuotationVoucherNo;
    //customerQuote.customerQuotationQuotationId = this.customerQuotationFormGroup.getRawValue().customerQuotationQuotationId;
    customerQuote.customerQuotationQuotationDate =
      this.customerQuotationFormGroup.getRawValue().customerQuotationQuotationDate;
    customerQuote.customerQuotationDeliveryTimeDate =
      this.customerQuotationFormGroup.getRawValue().customerQuotationDeliveryTimeDate;
    customerQuote.customerQuotationQuotationValidDate =
      this.customerQuotationFormGroup.getRawValue().customerQuotationQuotationValidDate;
    customerQuote.customerQuotationVoucherType = Number(
      this.customerQuotationFormGroup.getRawValue().customerQuotationVoucherType
    );
    customerQuote.customerQuotationLocationId =
      this.customerQuotationFormGroup.get('customerQuotationLocationID')?.value;
    customerQuote.customerQuotationCustomerId =
      this.customerQuotationFormGroup.getRawValue().customerQuotationCustomerID;
    customerQuote.customerQuotationContactPersonV =
      this.customerQuotationFormGroup.getRawValue().customerQuotationContactPersonV;
    customerQuote.customerQuotationSalesManId =
      this.customerQuotationFormGroup.getRawValue().customerQuotationSalesManID;
    customerQuote.customerQuotationCurrencyId =
      this.customerQuotationFormGroup.getRawValue().customerQuotationCurrencyID;
    customerQuote.customerQuotationJobId =
      this.customerQuotationFormGroup.getRawValue().customerQuotationJobId;
    customerQuote.customerQuotationRemarks =
      this.customerQuotationFormGroup.getRawValue().customerQuotationRemarks;
    customerQuote.customerQuotationSubject =
      this.customerQuotationFormGroup.getRawValue().customerQuotationSubject;
    customerQuote.customerQuotationNote =
      this.customerQuotationFormGroup.getRawValue().customerQuotationNote;
    customerQuote.customerQuotationWarranty =
      this.customerQuotationFormGroup.getRawValue().customerQuotationWarranty;
    customerQuote.customerQuotationTraining =
      this.customerQuotationFormGroup.getRawValue().customerQuotationTraining;
    customerQuote.customerQuotationTechnicalDetails =
      this.customerQuotationFormGroup.getRawValue().customerQuotationTechnicalDetails;
    customerQuote.customerQuotationHeader =
      this.customerQuotationFormGroup.getRawValue().customerQuotationHeader;
    customerQuote.customerQuotationFooter =
      this.customerQuotationFormGroup.getRawValue().customerQuotationFooter;
    customerQuote.customerQuotationTerms =
      this.customerQuotationFormGroup.getRawValue().customerQuotationTerms;
    customerQuote.customerQuotationDiscountAmountTotal = Number(
      this.customerQuotationFormGroup.getRawValue().customerQuotationDiscAmount
    );
    customerQuote.customerQuotationGrossTotal = Number(
      this.customerQuotationFormGroup.getRawValue().customerQuotationAmount
    );

    customerQuote.customerQuotationNetTotal = Number(
      this.customerQuotationFormGroup.getRawValue().customerQuotationNetAmount
    );
    customerQuote.customerQuotationVatAmount = Number(
      this.customerQuotationFormGroup.getRawValue().customerQuotationVatAmount
    );
    customerQuote.customerQuotationVatPercentage = Number(
      this.customerQuotationFormGroup.getRawValue()
        .customerQuotationVatPercentage
    );
    customerQuote.customerQuotationEnquiryNo =
      this.customerQuotationFormGroup.getRawValue().customerQuotationEnquiryNo;
    customerQuote.customerQuotationIsClose =
      this.customerQuotationFormGroup.getRawValue().customerQuotationIsClose
        ? this.customerQuotationFormGroup.getRawValue().customerQuotationIsClose
        : false;
    customerQuote.customerQuotationEnquiryId =
      this.customerQuotationFormGroup.getRawValue().customerQuotationEnquiryId;

    customerQuote.customerQuotationProjectRef =
      this.customerQuotationFormGroup.getRawValue().customerQuotationProjectRef;
    customerQuote.customerQuotationProjectName =
      this.customerQuotationFormGroup.getRawValue().customerQuotationProjectName;
    // customerQuote.customerQuotationReviseQuotation =
    //   this.customerQuotationFormGroup.getRawValue()
    //     .customerQuotationReviseQuotation
    //     ? this.customerQuotationFormGroup.getRawValue()
    //       .customerQuotationReviseQuotation
    //     : false;
    customerQuote.customerQuotationGrossProfitTotal = Number(
      this.customerQuotationFormGroup.getRawValue()
        .customerQuotationGrossProfitTotal
    );
    customerQuote.approvalStatus =
      this.customerQuotationFormGroup.getRawValue().approvalStatus == true
        ? 2
        : 1;

    customerQuote.customerQuotationPacking = null;
    customerQuote.customerQuotationQuality = null;
    customerQuote.customerQuotationCashCustomerName = null;
    customerQuote.customerQuotationProjectName = null;
    customerQuote.customerQuotationDetails = savedData
      ?.filter((k) => k.item != null && k.gamount != null)
      .map((k: GridData) => {
        return {
          customerQuotationDetailsId: 0,

          customerQuotationDetailsQuotationId: this.istemplate
            ? 0
            : this.customerQuotationFormGroup.getRawValue()
              .customerQuotationQuotationID,
          customerQuotationDetailsSlno: 0,
          customerQuotationDetailsItemId:
            k.item != null && k.item !== '' ? Number(k.item) : null,
          // this.itemArray?.find(j => j.itemMasterItemName?.trim() === k?.materialname?.trim())?.itemMasterItemId : null,
          customerQuotationDetailsDescription: k?.materialname
            ?.trim()
            .split('|')[0],
          customerQuotationDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                (j) => j.unitMasterUnitShortName?.trim() === k.unit?.trim()
              )?.unitMasterUnitId
              : null,
          customerQuotationDetailsQty: k.qty,
          customerQuotationDetailsUnitPrice: k.price,
          customerQuotationDetailsGrossAmount: k.gamount,
          customerQuotationDetailsDiscount: k.discount,
          customerQuotationDetailsVAT: k.vat,
          customerQuotationDetailsNetAmount: k.netamount,
          customerQuotationDetailsFsno: 0,
          customerQuotationDetailsIsEdited: null,
          customerQuotationDetailsPurchasePrice: k.costPrice,
          customerQuotationDetailsPriceType: 'Last Purchase Price',
          customerQuotationDetailsVoucherType:
            this.customerQuotationFormGroup.getRawValue()
              .customerQuotationVoucherType,
          customerQuotationDetailsBatchcode: k.partno,
          customerQuotationDetailsEnquiryDetailsId: 0,
          customerQuotationDetailsDelStatus: false,
          customerQuotationDetailsGrossProfit: k.grossProfit,
          boqDetailsId: k.boqDetailsId ? k.boqDetailsId : null,
        };
      });

    if (this.btnFlag.save) {
      this.saveQuotation(customerQuote);
    } else if (
      this.customerQuotationFormGroup.get('customerQuotationReviseQuotation')
        .value
    ) {
      this.saveQuotationWitRivise(customerQuote);
    } else {
      this.updateQuotation(customerQuote);
    }
  }

  customerQState() {
    this.selectedEnquiries = [];
    this.show();
    this.displaycustomerenquirystate = true;
  }

  Selecttemplate(type) {
    if (type == 'select') {
      this.displayMaximizabletemplate = true;
    } else {
      this.displayMaximizabletemplateAdd = true;
    }
  }

  selectedtem(event) {
    this.templateType = event.value;

    this.getTemplateBytype(event.value);
  }

  onTabChange(event) {
    const type =
      event.index == 0
        ? 'header'
        : event.index == 1
          ? 'notes'
          : event.index == 2
            ? 'footer'
            : event.index == 3
              ? 'paymentTrems'
              : event.index == 4
                ? 'subject'
                : event.index == 5
                  ? 'warranty'
                  : event.index == 6
                    ? 'training'
                    : event.index == 7
                      ? 'technicalDetails'
                      : 'header';

    this.headerTemplateValue = type;
    this.templateType = type;
    this.getTemplateBytype(type);
  }

  selectTypeValue() {
    this.displayMaximizabletemplateAdd = false;
  }

  selectedTemplateValue(Item) {
    if (this.templateType == 'header') {
      this.customerQuotationFormGroup.controls.customerQuotationHeader.setValue(
        Item
      );
    } else if (this.templateType == 'notes') {
      this.customerQuotationFormGroup.controls.customerQuotationNote.setValue(
        Item
      );
    } else if (this.templateType == 'paymentTrems') {
      this.customerQuotationFormGroup.controls.customerQuotationTerms.setValue(
        Item
      );
    } else if (this.templateType == 'subject') {
      this.customerQuotationFormGroup.controls.customerQuotationSubject.setValue(
        Item
      );
    } else if (this.templateType == 'warrenty') {
      this.customerQuotationFormGroup.controls.customerQuotationWarranty.setValue(
        Item
      );
    } else if (this.templateType == 'training') {
      this.customerQuotationFormGroup.controls.customerQuotationTraining.setValue(
        Item
      );
    } else if (this.templateType == 'technicalDetails') {
      this.customerQuotationFormGroup.controls.customerQuotationTechnicalDetails.setValue(
        Item
      );
    } else if (this.templateType == 'footer') {
      this.customerQuotationFormGroup.controls.customerQuotationFooter.setValue(
        Item
      );
    }
    this.displayMaximizabletemplateAdd = false;
  }

  getTemplateBytype(type) {
    this.masterapi.GetTemplateBytype(type).subscribe((res: any) => {
      this.templateTypeData = res?.result;
      // .map((kl) => ({ label: kl.qtemplatesDescription, value: kl.qtemplatesDescription }));
    });
  }

  saveQuotation(customerQuote: CustomerQuotation) {
    if (this.customerQuotationFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.salesapi.InsertCustomerQuotation(customerQuote).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.savedCustomerQuotation = data.result;
              this.updateFormGrid(data.result);
              this.userTrackingLog('Insert');

              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
              } else if (data.error) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail:
                    data.message != null && data.message?.trim() !== ''
                      ? data.message
                      : data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Quotation Save Failed',
              });
            }
          );
        },
      });
    } else if (this.customerQuotationFormGroup.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.customerQuotationFormGroup.markAllAsTouched();
      this.customerQuotationFormGroup.markAsDirty();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Item & G.Amount mandatory fields in Grid',
      });
      this.customerQuotationFormGroup.markAllAsTouched();
      this.customerQuotationFormGroup.markAsDirty();
    }
  }

  saveQuotationWitRivise(customerQuote: CustomerQuotation) {
    if (this.customerQuotationFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.salesapi
            .InsertCustomerQuotationwithRivise(customerQuote)
            .subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.istemplate = false;
                this.savedCustomerQuotation = data.result;
                this.updateFormGrid(data.result);
                // this.userTrackingLog('Insert');

                if (data.valid) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Alert',
                    detail: data.message,
                  });
                } else if (data.error) {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail:
                      data.message != null && data.message?.trim() !== ''
                        ? data.message
                        : data.exception,
                  });
                }
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Customer Quotation Save Failed',
                });
              }
            );
        },
      });
    } else if (this.customerQuotationFormGroup.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.customerQuotationFormGroup.markAllAsTouched();
      this.customerQuotationFormGroup.markAsDirty();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Item & G.Amount mandatory fields in Grid',
      });
      this.customerQuotationFormGroup.markAllAsTouched();
      this.customerQuotationFormGroup.markAsDirty();
    }
  }

  updateQuotation(customerQuote: CustomerQuotation) {
    if (this.customerQuotationFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.salesapi.UpdateCustomerQuotation(customerQuote).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.updateFormGrid(data.result);
              // this.userTrackingLog('Update');

              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Customer Quotation Updated Succesfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Quotation Update Failed',
              });
            }
          );
        },
      });
    } else if (this.customerQuotationFormGroup.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.customerQuotationFormGroup.markAllAsTouched();
      this.customerQuotationFormGroup.markAsDirty();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Item & G.Amount mandatory fields in Grid',
      });
      this.customerQuotationFormGroup.markAllAsTouched();
      this.customerQuotationFormGroup.markAsDirty();
    }
  }

  getAllCustomerQuotations() {
    this.loaddropdown(false);
    this.salesapi.GetCustomerQuotation().subscribe((data) => {
      this.customerQuotationarry = data.result;
    });
  }
  isCallDDLs: boolean = false;

  loaddropdown(reload: any) {
    if (!this.isCallDDLs || reload) {
      this.salesapi.GetQuotationDropdown().subscribe((m) => {
        //status
        this.enquiryStatusArray = m.resultSet.enquiryStatus;
        this.enquiryStatusList = m.resultSet.enquiryStatus?.map((kl) => ({
          label: kl.enquiryStatusEnquiryStatus,
          value: kl.enquiryStatusEnquiryStatusId,
        }));
        this.enquiryStatusList.unshift({ label: '--Select--', value: -1 });
        //job
        this.jobArray = m.resultSet.jobMasters;
        this.jobList = m.resultSet.jobMasters?.map((kl) => ({
          label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
          value: kl.jobMasterJobId,
        }));
        this.jobList.unshift({ label: '--Select--', value: -1 });
        //location
        const list = m?.resultSet?.locationMaster ?? [];
        this.locationArray = list;
        this.locationList = list
          .filter((x) => x.locationMasterLocationStatus != false)
          .map((kl) => ({
            label: kl.locationMasterLocationName,
            value: kl.locationMasterLocationId,
          }));
        this.locationList.unshift({ label: '--Select--', value: -1 });
        this.locationLocked = this.utilityService.applyLocationLock(
          this.customerQuotationFormGroup,
          'customerQuotationLocationID'
        );
        //sale man
        this.salesManArray = m.resultSet.saleManList;
        this.salesManList = m.resultSet.saleManList?.map((kl) => ({
          label: kl.salesManMasterSalesManName,
          value: kl.salesManMasterSalesManId,
        }));
        this.salesManList.unshift({ label: '--Select--', value: -1 });
        //currency
        this.currArry = m.resultSet.currencyMasters;
        this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
          label: kl.currencyMasterCurrencyName,
          value: kl.currencyMasterCurrencyId,
        }));
        this.currencyList.unshift({ label: '--Select--', value: -1 });
        //customer
        this.customerArray = m.resultSet.customerMasters;
        this.customerList = m.resultSet.customerMasters?.map((kl) => ({
          label: kl.customerMasterCustomerName,
          value: kl.customerMasterCustomerNo,
        }));
        this.customerList.unshift({ label: '--Select--', value: -1 });
        //unit
        this.units = m.resultSet.unitMasters;
        this.unitListt = m.resultSet.unitMasters?.map((kl) => ({
          label: kl?.unitMasterUnitShortName,
          value: kl.unitMasterUnitId,
        }));
        this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
        //item
        this.itemArray = m.resultSet.itemMaster;
        this.itemList = m.resultSet.itemMaster?.map((kl) => ({
          label: kl.itemMasterItemName,
          value: kl.itemMasterItemId,
        }));
        this.itemList.unshift({ label: '--Select--', value: -1 });
      });
      this.isCallDDLs = true;
    }
  }

  new() {
    this.loaddropdown(false);
    this.customerQuotationFormGroup.reset();
    this.customerQuotationFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.customerQuotationFormGroup,
      'customerQuotationLocationID',
      this.locationLocked
    );
    this.customerQuotationentry.data = [];
    this.customerQuotationentryDataset = [];
    this.customerQuotationentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.customerQuotationentry);
    this.customerQuotationFormGroup.reset();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.customerQuotationFormGroup,
        'customerQuotationLocationID'
      );
    } else {
      this.customerQuotationFormGroup
        .get('customerQuotationLocationID')
        .setValue(-1);
    }
    this.customerQuotationFormGroup
      .get('customerQuotationSalesManID')
      .setValue(-1);
    this.customerQuotationFormGroup
      .get('customerQuotationCurrencyID')
      .setValue(-1);
    this.customerQuotationFormGroup.get('customerQuotationJobId').setValue(-1);
    this.customerQuotationFormGroup.get('customerQuotationQId').setValue(0);

    this.customerQuotationFormGroup
      .get('customerQuotationQuotationDate')
      .setValue(new Date());
    this.customerQuotationFormGroup
      .get('customerQuotationVoucherType')
      .setValue(this.invoiceList[2].value);
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.savedCustomerQuotation = null;
    this.search = null;
    this.index = 0;
    this.GetDefaultSettings();
    this.customerQuotationFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.customerQuotationFormGroup,
      'customerQuotationLocationID',
      this.locationLocked
    );
    this.f.customerQuotationVoucherNo.clearValidators();
    this.customerQuotationFormGroup.updateValueAndValidity();
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.customerQuotationFormGroup.controls.customerQuotationReviseQuotation?.disable();
    this.selectedBoq = [];
    this.activeRow = { row: 0, column: 0 };
  }

  showMaximizableDialog(istem) {
    this.istemplate = istem;
    this.getAllCustomerQuotations();
    this.displayMaximizable = true;
  }

  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;
      // currency
      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.customerQuotationCurrencyID.setValue(Number(this.DefCurrency));
        }
      }
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );
      if (DEFAULT_LOCATION != null) {
        this.DefLocCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocCheck !== null) {
          const splitText = this.DefLocCheck.split('::');
          this.DefLocid = splitText[1]?.trim();
          if (!this.locationLocked) {
            this.f.customerQuotationLocationID.setValue(Number(this.DefLocid));
          }
        }
      }
      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      if (jobcal == true) {
        this.JOBCOST = true;
      }
      var VAT_Calculation = list?.filter(
        (a) => a.generalSettingsKeyValue == 'VAT_Calculation'
      );
      var vatcal = VAT_Calculation[0]?.generalSettingsBoolValue;
      if (vatcal == true) {
        this.VatCalculation = vatcal == true ? true : false;
      }

      const match = m.resultSet.optionSettings.optionsMasterType.match(/(\d+)/);
      if (match) {
        var value = parseInt(match[0], 10);
        this.customerQuotationFormGroup
          .get('customerQuotationVatPercentage')
          .setValue(this.VatCalculation ? value : 0);
      }
    });
  }

  updateFormGrid(CustQuote: any) {
    this.search = null;
    this.customerQuotationFormGroup.patchValue({
      customerQuotationVoucherNo: this.istemplate
        ? ''
        : CustQuote.customerQuotationVoucherNo,
      customerQuotationQId: this.istemplate
        ? 0
        : CustQuote?.customerQuotationQid,
      customerQuotationQuotationDate: this.istemplate
        ? new Date()
        : new Date(CustQuote.customerQuotationQuotationDate),
      customerQuotationDeliveryTimeDate: this.istemplate
        ? new Date()
        : new Date(CustQuote.customerQuotationDeliveryTimeDate),
      customerQuotationQuotationValidDate: this.istemplate
        ? new Date()
        : new Date(CustQuote.customerQuotationQuotationValidDate),
      customerQuotationVoucherType: CustQuote.customerQuotationVoucherType,
      customerQuotationLocationID: CustQuote.customerQuotationLocationId,
      customerQuotationCustomerID: CustQuote.customerQuotationCustomerId,
      customerQuotationContactPersonV:
        CustQuote.customerQuotationContactPersonV,
      customerQuotationSalesManID: CustQuote.customerQuotationSalesManId,
      customerQuotationCurrencyID: CustQuote.customerQuotationCurrencyId,
      customerQuotationJobId: CustQuote.customerQuotationJobId,
      customerQuotationRemarks: CustQuote.customerQuotationRemarks,
      customerQuotationSubject: CustQuote.customerQuotationSubject,
      customerQuotationNote: CustQuote.customerQuotationNote,
      customerQuotationWarranty: CustQuote.customerQuotationWarranty,
      customerQuotationTraining: CustQuote.customerQuotationTraining,
      customerQuotationTechnicalDetails:
        CustQuote.customerQuotationTechnicalDetails,
      customerQuotationHeader: CustQuote.customerQuotationHeader,
      customerQuotationFooter: CustQuote.customerQuotationFooter,
      customerQuotationTerms: CustQuote.customerQuotationTerms,
      customerQuotationAmount: CustQuote.customerQuotationGrossTotal,
      customerQuotationDiscAmount:
        CustQuote.customerQuotationDiscountAmountTotal,
      customerQuotationVatAmount: CustQuote.customerQuotationVatAmount,
      customerQuotationVatPercentage: CustQuote.customerQuotationVatPercentage,
      customerQuotationNetAmount: CustQuote.customerQuotationNetTotal,
      customerQuotationEnquiryNo: CustQuote.customerQuotationEnquiryNo,
      customerQuotationIsClose: CustQuote.customerQuotationIsClose,
      customerQuotationReviseQuotation: false,
      customerQuotationProjectName: CustQuote.customerQuotationProjectName,
      customerQuotationProjectRef: CustQuote.customerQuotationProjectRef,
      customerQuotationGrossProfitTotal:
        CustQuote.customerQuotationGrossProfitTotal,
      approvalStatus: CustQuote.approvalStatus,
      customerQuotationEnquiryId: CustQuote.customerQuotationEnquiryId,
    });

    const gridData: GridData[] = CustQuote.customerQuotationDetails.map((k) => {
      const ItemId: string =
        k.customerQuotationDetailsItemId != null
          ? this.itemList?.find(
            (l) => l.value == k.customerQuotationDetailsItemId
          )?.label
          : null;
      const UnitId: string =
        k.customerQuotationDetailsUnitId != null
          ? this.unitListt?.find(
            (l) => l.value == k.customerQuotationDetailsUnitId
          )?.label
          : null;

      return {
        item: k.customerQuotationDetailsItemId, //String(k.customerQuotationDetailsItemId),
        partno: k.CustomerQuotationDetailsBatchcode,
        materialname: k.customerQuotationDetailsDescription,
        unit: UnitId,
        qty: k.customerQuotationDetailsQty,
        price: k.customerQuotationDetailsUnitPrice,
        gamount: k.customerQuotationDetailsGrossAmount,
        discount: k.customerQuotationDetailsDiscount,
        vat: k.customerQuotationDetailsVAT,
        netamount: k.customerQuotationDetailsNetAmount,
        costPrice: k.customerQuotationDetailsCostPrice,
        grossProfit: k.customerQuotationDetailsGrossProfit,
        id: this.istemplate ? 0 : k.customerQuotationDetailsId,
        boqDetailsId: k.boqDetailsId,
      };
    });
    this.getPartyDetails(CustQuote.customerQuotationCustomerId);

    this.customerQuotationentryDataset = gridData;
    this.customerQuotationentry.readOnly = this.istemplate ? false : true;
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      data: gridData,
      readOnly: this.istemplate ? false : true,
    });
    this.customerQuotationFormGroup.disable();
    this.f.customerQuotationVoucherNo.clearValidators();
    this.customerQuotationFormGroup.updateValueAndValidity();
  }
  public getPartyDetails(id) {
    this.partyDetails = this.customerArray?.find(
      (j) => j.customerMasterCustomerNo === id
    );
  }

  handleChange(e) {
    this.index = e.index;
    if (e.index == 0) {
      requestAnimationFrame(() => {
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);

        if (hotInstance) {
          hotInstance.render();
        }
      });
    } else if (e.index == 1 && this.btnFlag.edit) {
      debugger;
      this.fetchDocumentTree(
        this.savedCustomerQuotation?.customerQuotationQId ? this.savedCustomerQuotation?.customerQuotationQId : this.customerQuotationFormGroup.getRawValue().customerQuotationQId
      );
    }
  }


  GetSavedCustomerQuotationDetails(id: string) {
    this.index = 0;
    this.salesapi.GetSavedCustQuotationDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          if (this.istemplate) {
            this.new();
          } else {
            this.btnFlag = {
              edit: true,
              cancel: true,
              save: false,
              update: true,
              delete: true,
              new: true,
            };
            this.customerQuotationFormGroup.disable();
          }
          this.updateFormGrid(data.result);
          this.savedCustomerQuotation = data.result;

          this.customerQuotationFormGroup.controls.customerQuotationReviseQuotation?.enable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Customer Quotation not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.customerQuotationFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.salesapi
          .DeleteCustomerQuotation(this.savedCustomerQuotation)
          .subscribe(
            (data) => {
              // this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Customer Quotation Deleted Succesfully',
              });
              this.new();
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Failed',
              });
            }
          );
      },
    });
  }
  cancel() {
    this.new();
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.customerQuotationentry.readOnly = false;
    // this.f.customerQuotationQuotationID.clearValidators();
    this.customerQuotationFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.customerQuotationFormGroup,
      'customerQuotationLocationID',
      this.locationLocked
    );
    this.customerQuotationFormGroup.controls.customerQuotationVoucherNo?.disable();
    this.customerQuotationFormGroup.controls.customerQuotationReviseQuotation?.enable();
    this.customerQuotationFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
  }

  public get IsValidGrid(): boolean {
    if (this.customerQuotationentryDataset.length > 0) {
      // this.paymentvoucherentry.data.forEach((value: GridData, index, arry) => {
      return Object.values(this.customerQuotationentryDataset).some(
        (k: GridData) => k.item != null && k.gamount != null
      );
      // });
    }
    return false;
  }
  getSplitButtonItems() {
    return [
      {
        label: 'Approve',
        icon: 'pi pi-check',
        command: () => this.Update(2),
      },
      {
        label: 'Reject',
        icon: 'pi pi-times',
        command: () => this.Update(3),
      },
    ];
  }

  Update(status: number) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to proceed?',
      accept: () => {
        this.salesapi
          .ApproveCustomerQuotationAsync(
            this.customerQuotationFormGroup.getRawValue().customerQuotationQId,
            status
          )
          .subscribe(
            (data: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Status Updated Successfully',
              });
              this.GetSavedCustomerQuotationDetails(
                this.customerQuotationFormGroup.getRawValue()
                  .customerQuotationQId
              );
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Failed to Update Status',
              });
            }
          );
      },
    });
  }
  selectsales(evt) {
    let trimmedSales = evt.sales?.trim();
    const includesPcs = this.units.some((unit) =>
      unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
    );
    if (includesPcs && this.unitArray.length != 0) {
      const UnitId: string = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.salesId
      )?.unitMasterUnitShortName;
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, UnitId);
    } else {
      this.masterapi.GetUnitDetails(evt.salesId).subscribe((res) => {
        this.unitArray = res.result;
        this.unitArry = res.result.map((ar) =>
          ar.unitMasterUnitShortName?.trim()
        );
      });

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.salesId);
      this.masterapi.GetItemMasterById({ id: evt.salesId }).subscribe((k) => {
        this.ItemMasterArrayByName = k.resultSet?.itemMaster;
        // this.conversion_Type = this.ItemMasterArrayByName.unitDetails[0].unitDetailsConversionType;

        const UnitId =
          this.ItemMasterArrayByName?.unitDetails?.unitDetailsUnitId;
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            5,
            this.ItemMasterArrayByName?.unitDetails?.unitDetailsUnitPrice
          );
        this.funitid =
          this.ItemMasterArrayByName?.unitDetails?.unitDetailsUnitId;
        const Unit: string = this.unitListt?.find(
          (l) => l.value == this.funitid
        )?.label;
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 3, Unit);
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            9,
            this.ItemMasterArrayByName?.unitDetails?.unitDetailsUnitCost
          );

        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            5,
            this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitPrice
          );
        this.funitid =
          this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;

        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            9,
            this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitCost
          );

        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            2,
            this.ItemMasterArrayByName.itemMasterItemName
          );
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            1,
            this.ItemMasterArrayByName.itemMasterPartNo
          );
      });
    }
    this.showSalesLookUp = false;
  }
  getUnitByItemId(id) {
    this.unitArray = [];
    this.masterapi.GetUnitDetails(id).subscribe((res) => {
      this.unitArray = res.result;
      this.dataList = this.unitSetLookup;
      this.unitArry = res.result.map((ar) =>
        ar.unitMasterUnitShortName?.trim()
      );
      this.showSalesLookUp = true;
    });
  }
  exit(evt) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }
  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      // this.elementReference.nativeElement.value ="";
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(evt.cell.row, evt.cell.column, null);
    }
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  selectControl(evt) {
    this.control.setValue(evt.salesId);
    this.elementReference.nativeElement.value = evt.sales;
    this.formControlLookUp = false;
  }
  hide(evt: boolean) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }
  QutationList(name, id) {
    const ref = this.dialogService.open(ItemModifyComponent, {
      header: 'Edit Item',
      width: '50%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {
        itemName: name,
        itemId: id,
      },
    });

    ref.onClose.subscribe((res) => {
      if (res && !res.isSave) {
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow?.row, 2, res?.Itemname);
      } else {
        this.masterapi.GetAllItemMasterById(res.ItemId).subscribe((data) => {
          // Assuming updatedValue is properly defined as a FormGroup or a FormControl
          if (data.result != null) {
            this.Obj = {
              itemMasterAccountNo: data.result.itemMasterAccountNo,
              itemMasterItemId: 0,
              itemMasterMaterialCode: data.result.itemMasterMaterialCode,
              itemMasterItemName: res.Itemname,
              itemMasterStockType: data.result.itemMasterStockType,
              itemMasterItemType: data.result.itemMasterItemType,
              itemMasterSupplierId: data.result.itemMasterSupplierId,
              itemMasterVenderId: data.result.itemMasterVenderId,
              itemMasterSupplierCode: data.result.itemMasterSupplierCode,
              itemMasterPartNo: data.result.itemMasterPartNo,
              itemMasterReOrderLevel: data.result.itemMasterReOrderLevel,
              itemMasterItemSize: data.result.itemMasterItemSize,
              itemMasterColor: data.result.itemMasterColor,
              itemMasterShape: data.result.itemMasterShape,
              itemMasterPacking: data.result.itemMasterPacking,
              itemMasterRef2: data.result.itemMasterRef2,
              itemMasterRef1: data.result.itemMasterRef1,
              itemMasterUserId: data.result.itemMasterUserId,
              itemMasterLandingCost: data.result.itemMasterLandingCost,
              itemMasterVat: data.result.itemMasterVat,
              unitDetails: data.result.unitDetails.map((res) => ({
                unitDetailsBarcode: res.unitDetailsBarcode,
                unitDetailsConversionType: res.unitDetailsConversionType,
                unitDetailsDefUnit: res.unitDetailsDefUnit,
                unitDetailsDefWunit: res.unitDetailsDefWunit,
                unitDetailsDelStatus: res.unitDetailsDelStatus,
                unitDetailsDescrption: res.unitDetailsDelStatus,
                unitDetailsHeight: res.unitDetailsHeight,
                unitDetailsId: 0,
                unitDetailsItemId: 0,
                unitDetailsOverhdPer: res.unitDetailsOverhdPer,
                unitDetailsPacking: res.unitDetailsPacking,
                unitDetailsProfitPer: res.unitDetailsProfitPer,
                unitDetailsRate: res.unitDetailsRate,
                unitDetailsReorder: res.unitDetailsReorder,
                unitDetailsUnitCost: res.unitDetailsUnitCost,
                unitDetailsUnitId: res.unitDetailsUnitId,
                unitDetailsUnitPrice: res.unitDetailsUnitPrice,
                unitDetailsWidth: res.unitDetailsWidth,
                unitDetailsWrate: res.unitDetailsWrate,
              })),
            };
          }
          if (this.Obj != null) {
            this.masterapi.NewItem(this.Obj).subscribe((res) => {
              if (res.valid) {
                this.UpdateItem = res.result;

                this.funitid =
                  this.UpdateItem?.unitDetails[0]?.unitDetailsUnitId;
                const Unit: string = this.unitListt?.find(
                  (l) => l.value == this.funitid
                )?.label;

                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(this.activeRow.row, 3, Unit);

                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(
                    this.activeRow.row,
                    0,
                    this.UpdateItem?.itemMasterMaterialCode
                  );
                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(
                    this.activeRow.row,
                    1,
                    this.UpdateItem?.itemMasterPartNo
                  );
                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(
                    this.activeRow.row,
                    2,
                    this.UpdateItem?.itemMasterItemName
                  );
                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(
                    this.activeRow.row,
                    5,
                    this.UpdateItem?.unitDetails[0]?.unitDetailsUnitPrice
                  );
                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(
                    this.activeRow.row,
                    9,
                    this.UpdateItem?.unitDetails[0]?.unitDetailsUnitCost
                  );

                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: res.message,
                });
              }
            });
          }
        });
      }
    });
  }

  show() {
    if (this.CustomerEnquiryStatusFormGroup.get('isDate').value === true) {
      this.defaultValue = {
        isDateChecked: true,
        customerId:
          this.CustomerEnquiryStatusFormGroup.value.CustomerID === -1
            ? null
            : this.CustomerEnquiryStatusFormGroup.value.CustomerID,
        statusId:
          this.CustomerEnquiryStatusFormGroup.value.EnquiryStatusId === -1
            ? null
            : this.CustomerEnquiryStatusFormGroup.value.EnquiryStatusId,
        fromDate: this.CustomerEnquiryStatusFormGroup.value.dateFrom
          ? new Date(
            this.CustomerEnquiryStatusFormGroup.value.dateFrom
          ).getFullYear() +
          '-' +
          (
            new Date(
              this.CustomerEnquiryStatusFormGroup.value.dateFrom
            ).getMonth() + 1
          )
            .toString()
            .padStart(2, '0') +
          '-' +
          new Date(this.CustomerEnquiryStatusFormGroup.value.dateFrom)
            .getDate()
            .toString()
            .padStart(2, '0')
          : null,
        toDate: this.CustomerEnquiryStatusFormGroup.value.dateTo
          ? new Date(
            this.CustomerEnquiryStatusFormGroup.value.dateTo
          ).getFullYear() +
          '-' +
          (
            new Date(
              this.CustomerEnquiryStatusFormGroup.value.dateTo
            ).getMonth() + 1
          )
            .toString()
            .padStart(2, '0') +
          '-' +
          new Date(this.CustomerEnquiryStatusFormGroup.value.dateTo)
            .getDate()
            .toString()
            .padStart(2, '0')
          : null,
      };
    } else {
      this.defaultValue = {
        isDateChecked: false,
        customerId:
          this.CustomerEnquiryStatusFormGroup.value.CustomerID === -1
            ? null
            : this.CustomerEnquiryStatusFormGroup.value.CustomerID,
        statusId:
          this.CustomerEnquiryStatusFormGroup.value.EnquiryStatusId === -1
            ? null
            : this.CustomerEnquiryStatusFormGroup.value.EnquiryStatusId,
        fromDate: this.CustomerEnquiryStatusFormGroup.value.dateFrom
          ? this.CustomerEnquiryStatusFormGroup.value.dateFrom
          : null,
        toDate: this.CustomerEnquiryStatusFormGroup.value.dateTo
          ? this.CustomerEnquiryStatusFormGroup.value.dateTo
          : null,
      };
    }
    this.salesapi
      .GetCustomerEnquirybyStatuss(this.defaultValue)
      .subscribe((response: any) => {
        this.enquiries = response.result;
      });
  }
  clearfilter() {
    this.CustomerEnquiryStatusFormGroup.get('CustomerID').setValue(null);
    this.CustomerEnquiryStatusFormGroup.get('EnquiryStatusId').setValue(null);
    this.CustomerEnquiryStatusFormGroup.get('dateFrom').setValue(new Date());
    this.CustomerEnquiryStatusFormGroup.get('dateTo').setValue(new Date());
    this.CustomerEnquiryStatusFormGroup.get('isDate').setValue(false);
    this.show();
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
        ar.enquiryStatusEnquiryStatus?.trim()
      );
    });
  }
  CloseDialog() {
    this.displaycustomerenquirystate = false;
  }

  calculateVat(gProfitPercentage: HTMLInputElement) {
    // Access the value of the input field using the template reference variable
    //  const percentageValue = parseFloat(gProfitPercentage.value);
    //  // Perform calculations based on the value
    //  const vatpercentage = percentageValue/100; // Example VAT calculation
    //  const getGrossProfitTotal = this.customerQuotationFormGroup.controls.customerQuotationGrossProfitTotal.value
    //  const calculatedAmount =  getGrossProfitTotal  + (getGrossProfitTotal* vatpercentage);
    //  // Set the calculated value to the form control
    //  this.customerQuotationFormGroup.controls.customerQuotationGrossProfitTotal.setValue(calculatedAmount);
  }

  getCheckboxValue() {
    const isChecked = this.customerQuotationFormGroup.get(
      'customerQuotationReviseQuotation'
    )?.value;
    let currentValue = this.customerQuotationFormGroup.get(
      'customerQuotationVoucherNo'
    )?.value;

    if (typeof currentValue === 'string') {
      let baseValue: string;
      let revisionValue: number;

      const match = currentValue.match(/^(.+?-\d{3})(?:-(\d+))?$/);

      if (match) {
        baseValue = match[1];
        revisionValue = match[2] ? parseInt(match[2], 10) : 0;
      } else {
        console.error('Invalid voucher number format');
        return;
      }

      if (isChecked) {
        revisionValue++;
      } else {
        revisionValue = Math.max(1, revisionValue - 1);
      }

      const newValue = `${baseValue}-${revisionValue}`;
      this.customerQuotationFormGroup
        .get('customerQuotationVoucherNo')
        ?.setValue(newValue);
    } else {
      console.error('Invalid voucher number format');
    }
  }

  public getAllCity() {
    this.masterapi.GetAllCity().subscribe((data) => {
      this.cityList = data;
      this.citylistNew = data?.map((item) => ({
        label: item.cityMasterCityName,
        value: item.cityMasterCityId,
      }));
      this.citylistNew.unshift({ label: '--Select--', value: -1 });
    });
  }
  getAllCountry() {
    this.masterapi.GetAllCountry().subscribe((k) => {
      this.countryList = k?.map((kl) => ({
        label: kl.countryMasterCountryName,
        value: kl.countryMasterCountryId,
      }));
      this.countryList.unshift({ label: '--Select--', value: -1 });
      this.countryArry = k?.map((ar) => ar.countryMasterCountryName?.trim());
    });
  }
  convertNumberToWordsWithDecimal(number: number): string {
    if (number == null) {
      return 'Invalid number';
    }

    const toWords = new ToWords();

    const [integerPart, decimalPart] = number.toFixed(2).split('.');

    const integerWords = toWords.convert(parseInt(integerPart, 10));
    const decimalWords = toWords.convert(parseInt(decimalPart || '0', 10));

    let result = `${integerWords}`;

    if (decimalWords !== 'zero') {
      result += ` point ${decimalWords}`;
    }

    return result;
  }

  onCustomerChange(event: any) {
    this.CustomerEnquiryStatusFormGroup.get('CustomerID').setValue(event.value);
  }

  toggleSelection(enquiry: any) {
  
    let customerId = this.customerList.find(c => c.label == enquiry.customer_Master_Customer_Name)?.value;
    let locationId = this.locationList.find(l => l.label == enquiry.location_Master_Location_Name)?.value;
    let currencyId = this.currencyList.find(cu => cu.label == enquiry.currency_Master_Currency_Name)?.value;
    this.customerQuotationFormGroup.patchValue({
      customerQuotationEnquiryNo: enquiry.enquiryMasterEnquiryNo,
      customerQuotationEnquiryId: enquiry.enquiry_Master_Enquiry_No,
      customerQuotationCustomerID: customerId,
      customerQuotationCurrencyID: currencyId,
      customerQuotationLocationID: this.locationLocked
        ? this.customerQuotationFormGroup.get('customerQuotationLocationID')?.value
        : locationId,
      customerQuotationRemarks: enquiry.enquiry_Master_Remarks,
      customerQuotationSalesManID: enquiry.enquiry_Master_SaleMan_ID
    })
    this.salesapi.getEnquiryDetails(enquiry.enquiry_Master_Enquiry_ID).subscribe((res) => {
      this.selectValue(res.result)
    });
  }

  selectValue(evt: any[]) {
    this.displaycustomerenquirystate = false
    let activeRow = { row: 0, column: 0 };
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    evt?.forEach((k) => {

      hotInstance.setDataAtCell(activeRow?.row, 0, k?.itemId);
      hotInstance.setDataAtCell(activeRow?.row, 2, k?.itemName);
      hotInstance.setDataAtCell(activeRow?.row, 1, k?.partno);
      hotInstance.setDataAtCell(activeRow?.row, 3, k?.unit);
      hotInstance.setDataAtCell(activeRow?.row, 4, k?.qty);
      hotInstance.setDataAtCell(activeRow?.row, 5, k?.rate);
      hotInstance.setDataAtCell(activeRow?.row, 6, k?.qty * k?.rate);
      // hotInstance.setDataAtCell(activeRow?.row, 7, k?.discount ?? 0);
      hotInstance.setDataAtCell(activeRow?.row, 8, k?.amount);
      activeRow.row += 1;
      //  });
    });
  }



  attachmentsToUploaded: any[] = [];
  fileAttachmentDialogVisibility: boolean = false;
  onNodeSelect(event: any): void {
    const fileUrl = event.node.data;
    if (fileUrl && event.node.key !== 0 && event.node.key !== '0') {
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        fileUrl + '#navpanes=0&scrollbar=0'
      );
    }
  }
  isChildNode(node: TreeNode): boolean {
    return this.files.some((parent) =>
      parent.children?.some((child) => child === node)
    );
  }

  files: TreeNode[] = [];
  selectedFile: TreeNode | null = null;
  previewUrl: SafeResourceUrl | null = null;

  fetchDocumentTree(jobId: any): void {
    this.previewUrl = '';
    this.masterapi.GetDocumentTree(jobId, 'CQ').subscribe((res) => {
      if (res?.valid && res?.result) {
        this.files = [];
        const ports = environment.apiRootURL?.replace('api', 'pdfs');
        const documentNodes: TreeNode[] = res?.result?.map(
          (doc: any, index: number) => {
            return {
              key: `0-${doc.fileId}`,
              label: doc.fileName,
              data: `${ports}${doc.filePath}`,
              icon: 'pi pi-file-pdf',
            };
          }
        );

        this.files = [
          {
            key: '0',
            label: 'Documents',
            data: 'Documents Folder',
            icon: 'pi pi-fw pi-folder',
            children: documentNodes,
          },
        ];
      }
    });
  }
  showFileAttachmentDialog() {
    this.fileAttachmentDialogVisibility = true;
  }

  onUpload(event: UploadEvent) {
    for (let file of event.files) {
      this.attachmentsToUploaded.push(file);
    }
    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: '',
    });
  }
  onDeleteNode(node: TreeNode) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete existing Document?',
      accept: () => {
        const id: number = Number(node.key?.split('-')[1]);
        this.api.DeleteDocument(id).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Deleted Succesfully',
            });
            this.fetchDocumentTree(
              this.savedCustomerQuotation?.customerQuotationQId ? this.savedCustomerQuotation?.customerQuotationQId : this.customerQuotationFormGroup.getRawValue().customerQuotationQId
            );
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: ' Failed',
            });
          }
        );
      },
    });
  }

  downloadAllDocuments() {
    const jobId = this.savedCustomerQuotation?.customerQuotationQId ? this.savedCustomerQuotation?.customerQuotationQId : this.customerQuotationFormGroup.getRawValue().customerQuotationQId;
    this.api
      .downloadAllFilesAsOnePdf(jobId, 'CQ', {
        responseType: 'blob',
        observe: 'response' as 'body',
      })
      .subscribe((response: any) => {
        const blob = new Blob([response.body], { type: response.body.type });

        // Extract filename from content-disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${this.customerQuotationFormGroup.value.customerQuotationQId || 'CustomerQuotation'}_Documents.pdf`;

        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
            contentDisposition
          );
          if (matches && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  customUploadHandler(event: any): void {
    const id = this.savedCustomerQuotation?.customerQuotationQId ? this.savedCustomerQuotation.customerQuotationQId
      : this.customerQuotationFormGroup.getRawValue().customerQuotationQId;
    if (!id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing ID',
        detail: 'ID is required.',
      });
      return;
    }

    const formData = new FormData();

    for (const file of event.files) {
      formData.append('files', file); // Matches .NET controller's List<IFormFile> parameter
    }

    this.api.uploadDOCs(formData, id, 'CQ').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Document saved successfully.',
        });
        this.fetchDocumentTree(id);
        this.fileAttachmentDialogVisibility = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'An error occurred while uploading.',
        });
      },
    });
  }
}
export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value?.trim() !== '') {
      return timer(time).pipe(
        switchMap(() => acctService.CheckVnoExist(input.value)),
        map((res) => {
          return res.result === false ? null : { Exist: true };
        })
      );
    }
  };
};

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

interface GridData {
  boqDetailsId?: any;
  item?: any;
  partno?: string;
  materialname?: string;
  unit?: string;
  qty?: number;
  price?: number;
  gamount?: number;
  discount?: number;
  vat?: number;
  netamount?: number;
  id?: number;
  costPrice?: number;
  grossProfit?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
export const columnDetailList = (component: CustomerquotationComponent) => [
  {
    data: 'item',
    type: 'text',
    label: 'Item Id',
    toolTip: 'Item Id',
    source: component.itemArry,
  },
  {
    data: 'partno',
    type: 'text',
    label: 'Part No.',
    toolTip: 'Part Number',
  },
  {
    data: 'materialname',
    type: 'text',
    label: 'Material Name',
    toolTip: 'Material Name',
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    toolTip: 'Unit Name',
    source: component.unitArry,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
    readOnly: false,
  },
  {
    data: 'price',
    type: 'numeric',
    label: 'Price',
    toolTip: 'Unit Price',
    readOnly: false,
  },
  {
    data: 'gamount',
    type: 'numeric',
    label: 'G.Amount',
    toolTip: 'Gross Amount',
  },
  {
    data: 'discount',
    type: 'numeric',
    label: 'Discount',
    toolTip: 'Discount',
    readOnly: false,
  },
  {
    data: 'netamount',
    type: 'numeric',
    label: 'Net Amount',
    toolTip: 'Net Amount',
  },
  {
    data: 'costPrice',
    type: 'numeric',
    label: 'Cost Price',
    toolTip: 'Cost Price',
    readOnly: false,
  },
  {
    data: 'grossProfit',
    type: 'numeric',
    label: 'Gross Profit',
    toolTip: 'Gross Profit',
  },
  {
    data: 'boqDetailsId',
    type: 'numeric',
    label: 'BOQ Details ID',
    toolTip: 'BOQ Details ID',
  }
];
