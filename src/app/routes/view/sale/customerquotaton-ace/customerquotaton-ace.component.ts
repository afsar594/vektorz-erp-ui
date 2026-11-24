import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { ConfirmationService, DialogService, MenuItem, MessageService, SelectItem, TreeNode } from 'primeng';
import { timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CityMaster, CountryMaster, ItemMaster } from 'src/app/routes/domain';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { CustomerQuotation } from 'src/app/routes/domain/Sales/CustomerQuotation';
import { EnquiryStatus } from 'src/app/routes/domain/Sales/EnquiryStatus';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { ImportApiService } from 'src/app/routes/service/import-api.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { environment } from 'src/environments/environment';
import { ToWords } from 'to-words';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { ItemModifyComponent } from '../item-modify/item-modify.component';
import { BoqService } from 'src/app/routes/service/sales/boq.service';
import { ChangeDetectorRef } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-customerquotaton-ace',
  templateUrl: './customerquotaton-ace.component.html',
  styleUrls: ['./customerquotaton-ace.component.scss']
})
export class CustomerquotatonAceComponent implements OnInit {



  elementReference!: ElementRef;
  @ViewChild('invoCtrl', { static: false })
  invoiceCtrol!: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol!: ElementRef;
  @ViewChild('custCtrl', { static: false }) customerCtrol!: ElementRef;
  @ViewChild('saleCtrl', { static: false }) salesmanCtrol!: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol!: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol!: ElementRef;
  @ViewChild('reportTemplateUploader', { static: false }) reportTemplateUploader?: FileUpload;
  CustomerEnquiryStatusFormGroup!: FormGroup;

  confirmDropDatabaseDialogVisible = false;
  title!: string;
  search: string = `null`;
  index: number = 0;
  cityArray: CityMaster[] = [];
  citylistNew: SelectItem[] = [];
  cityList!: CityMaster[];
  cityarry: string[] = [];
  displayMaximizable!: boolean;
  breadcumbmodel!: MenuItem[];
  licensekey: string;
  displayPrintPreview: boolean = false;
  displaycustomerenquirystate: boolean = false;
  lookupGridColumns: string[] = [];
  dataList: Array<any> = [];
  showSalesLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow!: { row: number; column: number; };
  selectItem: any;
  control!: AbstractControl;
  isMainGridUnitLookup = false;

  btnFlag!: ButtonFlag;
  currencyList!: SelectItem[];
  currArry: string[] = [];

  itemArray: ItemMaster[] = [];
  itemArry: string[] = [];
  itemList!: SelectItem[];

  ItemMasterArrayByName: any = null;
  funitid!: number;

  invoiceList!: SelectItem[];

  customerArray: CustomerMaster[] = [];
  customerArry: string[] = [];
  customerList!: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationList!: SelectItem[];
  locationArry: string[] = [];

  salesManArray: SalesManMaster[] = [];
  salesManList!: SelectItem[];
  salesManArry: string[] = [];

  jobArray: JobMaster[] = [];
  jobList!: SelectItem[];
  jobArry: string[] = [];

  DefCurrency!: string;
  DefCurCheck!: string;
  DefLocCheck: string | undefined;
  DefLocid!: string;

  unitAry: any;
  unitListt: any;
  units: any;

  unitArray: UnitMaster[] = [];
  unitList!: SelectItem[];
  unitArry: string[] = [];
  JOBCOST: boolean = false;
  customerQuotationarry: CustomerQuotation[] = [];

  rptFilter!: ReportFilterModel;
  pdfSource: any;
  countryArray: CountryMaster[] = [];
  countryList!: SelectItem[];
  countryArry: string[] = [];
  savedCustomerQuotation!: CustomerQuotation;
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
  ScreenId!: number;
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
  colenqs!: { field: string; header: string; }[];
  activeCostRow: { row: number; column: number; accordionIndex: number; } | null = null;
  reportTemplate: ReportTemplateItem = {
    quotationID: 0,
    serialNo: 0,
    reportHeader: '',
    reportDescription: '',
    boqImport: false,
    templateFileBytes: null,
    templateFileImage: null
  };
  reportTemplateList: ReportTemplateItem[] = [];

  displayDescriptionDialog: boolean = false;
  selectedFullDescription: string = '';


  // ===== Report Template file import =====
  reportTemplateFileDialogVisible: boolean = false;
  reportTemplateFilesToUpload: any[] = [];
  // Snapshot of selected files, kept even after reportTemplateFilesToUpload is cleared post-upload
  reportTemplateFilesSnapshot: any[] = [];
  reportTemplateFileBytesMap: { fileKey: string; bytes: string }[] = [];
  isReportTemplateUploading: boolean = false;

  // ===== Report Template file VIEW =====
  reportTemplateViewDialogVisible: boolean = false;
  reportTemplateFiles: TreeNode[] = [];
  reportTemplateSelectedFile: TreeNode | null = null;
  reportTemplatePreviewUrl: SafeResourceUrl | null = null;
  isReportTemplateTreeLoading: boolean = false;
  reportTemplateValidationAttempted: boolean = false;


  private lastActiveCostRow: { row: number; column: number; accordionIndex: number } | null = null;
  private isCostLookupSelecting = false;
  private isUnitLookupSelecting = false;


  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private crystalReportService: CrystalReportService,
    private confirmation: ConfirmationService,
    public dialogService: DialogService,
    private permission: PermissionsService,
    private router: Router,
    private masterapi: MasterApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private salesapi: SalesApiService,
    private api: ImportApiService, private sanitizer: DomSanitizer,
    private _local: LocalStorageService,
    private procuremnetApi: ProcurementApiService,
    private boqService: BoqService,
    private cdr: ChangeDetectorRef,
  ) {
    this.licensekey = defaults.hotlicensekey || '';
  }

  displayMaximizabletemplate: boolean = false;
  displayMaximizabletemplateAdd: boolean = false;
  allTemplates: any;
  templateTypeData: any[] = [];
  templatList!: { label: string; value: string; }[];
  templateType: any = 'header';
  headerTemplateValue: any = 'header';

  customerQuotationentry!: Handsontable.GridSettings;
  customerQuotationFormGroup!: FormGroup;
  locationLocked = false;
  customerQuotationentryDataset: any[] = [];
  enquiryStatusArray: EnquiryStatus[] = [];
  enquiryStatusList!: SelectItem[];
  enquiryStatusArry: string[] = [];
  cols!: { field: string; header: string; }[];

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
      customerQuotationProjectName: [null],
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
    this.loadReportTemplates();
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
    if (this.index === 2) {
      this.syncQuotationItemsFromGrid();
    }
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
      this.BoqData = res.result.map((k: { isSelect: boolean; }) => {
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

  public getCurrency(id: any): string {
    return this.currencyList?.find((k) => k.value === id)?.label ?? '';
  }

  public getLocation(id: any): string {
    return this.locationList?.find((k) => k.value === id)?.label ?? '';
  }
  public getSalesMan(id: any): string {
    return this.salesManList?.find((k) => k.value === id)?.label ?? '';
  }

  public getItems(id: any): string {
    return this.itemList?.find((k) => k.value === id)?.label ?? '';
  }

  public getJob(id: any): string {
    return this.jobList?.find((k) => k.value === id)?.label ?? '';
  }

  public getUnit(id: any): string {
    return this.unitListt?.find((k: { value: any; }) => k.value === id)?.label ?? '';
  }

  public getCustomer(id: any): string {
    return this.customerList?.find((k) => k.value === id)?.label ?? '';
  }
  public getCustomerdetails(id: number) {
    let customer = this.customerArray?.find(
      (k) => k.customerMasterCustomerNo === id
    );
    return customer;
  }
  getCityName(id: any) {
    return this.citylistNew?.find((k) => k.value === Number(id))?.label ?? '';
  }
  getCountryName(id: any) {
    return this.countryList?.find((k) => k.value === Number(id))?.label ?? '';
  }

  itemGroupName: string | undefined;

  stationmasterObj!: StationMaster;
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
      []
    );

    this.customerQuotationentry.afterSelection = (
      row,
      column) => {
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      this.currentRow = row;
      if (column === 0 && this.customerQuotationentry.readOnly === false) {
        this.isMainGridUnitLookup = false;
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
        const hot = this.hotRegisterer.getInstance(this.hotid);
        this.activeRow = { row, column };
        this.isMainGridUnitLookup = true;
        this.lookupGridColumns = ['Code', 'Full Name', 'Short Name'];
        this.loadAllUnitsForMainGridLookup();
        hot.deselectCell();
        this.showSalesLookUp = true;
      } else if (
        column === 2 &&
        this.customerQuotationentry.readOnly === false
      ) {
        this.isMainGridUnitLookup = false;
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
        this.isMainGridUnitLookup = false;
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
      this.isMainGridUnitLookup = false;
      if (change[0][1] === 0) {
        this.showSalesLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.customerQuotationentry.beforeChangeRender = (change) => {
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
            const changedRow = change[0][0];
            if (data[0] != null && this.customerQuotationentryDataset[changedRow] !== undefined) {
              if (
                this.customerQuotationentryDataset[changedRow].item ===
                undefined
              ) {
                return;
              }
              this.customerQuotationentryDataset[changedRow].gamount =
                totalSum;
              this.customerQuotationentryDataset[changedRow].grossProfit =
                gross_Profit;
              // this.customerQuotationentryDataset[index].vatPer = vatPer
              this.customerQuotationentryDataset[changedRow].netamount =
                result;
              this.customerQuotationentryDataset[changedRow].disc =
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
    this.customerQuotationentry.afterCreateRow = () => {
      this.syncQuotationItemsFromGrid();
    };

    this.customerQuotationentry.afterRemoveRow = () => {
      this.ColumnSum();
      this.syncQuotationItemsFromGrid();
    };

    this.customerQuotationentry.afterValidate = (isValid) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };

    this.customerQuotationentry.afterChange = (changes: any, source: any) => {
      if (source !== 'loadData' && source !== 'cost-estimation-subtotal-sync') {
        this.syncQuotationItemsFromGrid();
      }
    };
  }

  ColumnSum() {
    if (this.customerQuotationentryDataset.length === 0) {
      return;
    }
    var sum2 = 0;
    this.customerQuotationentryDataset.forEach((elemt: any) => {
      if (elemt) {
        sum2 += Number(elemt.gamount) || 0;
      }
    });

    sum2 = parseFloat(sum2.toFixed(2));
    this.customerQuotationFormGroup.controls.customerQuotationAmount.setValue(
      sum2
    );

    this.validateTotals(false);

    var disc1 = 0;
    this.customerQuotationentryDataset.forEach((elemt: any) => {
      if (elemt) {
        disc1 += Number(elemt.discount) || 0;
      }
    });
    disc1 = parseFloat(disc1.toFixed(2));
    this.customerQuotationFormGroup.controls.customerQuotationDiscAmount.setValue(
      disc1
    );

    var sum3 = 0;
    this.customerQuotationentryDataset.forEach((elemt: any) => {
      if (elemt) {
        sum3 += Number(elemt.grossProfit) || 0;
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
    // Use getRawValue() instead of value: value excludes disabled controls'
    // values, and this form is disabled while viewing a fetched quotation.
    const formValues = this.customerQuotationFormGroup.getRawValue();
    const vatPercentage = Number(formValues.customerQuotationVatPercentage) || 0;

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

  getEmptyRowCount(length: number): number {
    const salesVoucherDetailsLength = length || 0;
    return Math.max(0, 10 - salesVoucherDetailsLength);
  }

  getPIReport() {
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
    // let html: any = document.getElementById('print');
    // this.printService.saveAsPDF(data, 'saleVoucherPDF');
    this.printService.PrintPDF('print', css);
    // this.userTrackingLog('PDF');
  }
  userTrackingLog(type: string) {
    let req = {
      page: 'Customer Quotation',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.customerQuotationFormGroup.get('customerQuotationVoucherNo')?.value,
      vpType: 'Customer Quotation',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe(() => { });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  displayPrint() {
    //this.getAllStationMaster();
    this.displayPrintPreview = true;
  }
  printbtn!: MenuItem[];
  getReportType() {
    this.masterapi.General('Quotation').subscribe((res: any) => {
      this.printbtn = res.map((r: any) => ({
        label: r.reportTypeDescription,
        command: () => this.showPrint(r.reportTypeFileName),
      }));
    });
  }
  showPrint(type: any) {
const quotationId = this.customerQuotationFormGroup.getRawValue().customerQuotationQId;

this.rptFilter = {
  SelectionFormula:
    type === 'crptCostEstimation'
      ? `{customer_quotation.Customer_Quotation_QID} = ${quotationId}`
      : `{vr_CustomerQuotation.Customer_Quotation_QID} = ${quotationId}`,

  Parameters: [],

  Queries: [
    type === 'crptCostEstimation'
      ? `SELECT * FROM customer_quotation customer_quotation WHERE customer_quotation.Customer_Quotation_QID = ${quotationId}`
      : `SELECT * FROM vr_CustomerQuotation vr_CustomerQuotation WHERE vr_CustomerQuotation.Customer_Quotation_QID = ${quotationId}`
  ],

  ReportName: type,
  SP_Queries: []
};
    this.crystalReportService
      .getReportPrint(this.rptFilter, false)
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
    )?.value;
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

  get() {
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

    this.syncQuotationItemsFromGrid();

    const quotationItemsPayload = this.buildQuotationItemsPayload();
    (customerQuote as any).quotationItems = JSON.parse(
      JSON.stringify(quotationItemsPayload)
    );

    if (!this.validateAllCostEstimations(true)) {
      return;
    }

    customerQuote.customerQuotationPacking = '';
    customerQuote.customerQuotationQuality = '';
    customerQuote.customerQuotationCashCustomerName = '';
     customerQuote.customerQuotationProjectName = this.customerQuotationFormGroup.getRawValue().customerQuotationProjectName;
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
            k.unitId != null
              ? Number(k.unitId)
              : k.unit != null && k.unit !== ''
                ? this.units?.find(
                  (j: any) => j.unitMasterUnitShortName?.trim() === k.unit?.trim()
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
      this.customerQuotationFormGroup.get('customerQuotationReviseQuotation')?.value?.value
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

  Selecttemplate(type: string) {
    if (type == 'select') {
      this.displayMaximizabletemplate = true;
    } else {
      this.displayMaximizabletemplateAdd = true;
    }
  }

  selectedtem(event: any) {
    this.templateType = event.value;

    this.getTemplateBytype(event.value);
  }

  onTabChange(event: any) {
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

  selectedTemplateValue(Item: any) {
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

  getTemplateBytype(type: string) {
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
            () => {
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
                this.savedCustomerQuotation = data?.result;
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
              () => {
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
            () => {
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
    this.loadCostEstimationItems();

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
        (a: { generalSettingsKeyValue: string; }) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      if (jobcal == true) {
        this.JOBCOST = true;
      }
      var VAT_Calculation = list?.filter(
        (a: { generalSettingsKeyValue: string; }) => a.generalSettingsKeyValue == 'VAT_Calculation'
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
      customerQuotationAmount: Number(CustQuote.customerQuotationGrossTotal) || 0,
      customerQuotationDiscAmount:
        Number(CustQuote.customerQuotationDiscountAmountTotal) || 0,
      customerQuotationVatAmount: Number(CustQuote.customerQuotationVatAmount) || 0,
      customerQuotationVatPercentage: Number(CustQuote.customerQuotationVatPercentage) || 0,
      customerQuotationNetAmount: Number(CustQuote.customerQuotationNetTotal) || 0,
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

    const gridData: GridData[] = CustQuote.customerQuotationDetails.map((k: { customerQuotationDetailsItemId: null; customerQuotationDetailsUnitId: null; CustomerQuotationDetailsBatchcode: any; customerQuotationDetailsDescription: any; customerQuotationDetailsQty: any; customerQuotationDetailsUnitPrice: any; customerQuotationDetailsGrossAmount: any; customerQuotationDetailsDiscount: any; customerQuotationDetailsVAT: any; customerQuotationDetailsNetAmount: any; customerQuotationDetailsCostPrice: any; customerQuotationDetailsGrossProfit: any; customerQuotationDetailsId: any; boqDetailsId: any; }) => {
      const UnitId: string =
        k.customerQuotationDetailsUnitId != null
          ? this.unitListt?.find(
            (l: { value: null; }) => l.value == k.customerQuotationDetailsUnitId
          )?.label
          : null;

      return {
        item: k.customerQuotationDetailsItemId, //String(k.customerQuotationDetailsItemId),
        partno: k.CustomerQuotationDetailsBatchcode,
        materialname: k.customerQuotationDetailsDescription,
        unit: UnitId,
        unitId: k.customerQuotationDetailsUnitId,
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
    // Ensure totals/VAT/net are calculated immediately on fetch, without waiting for a grid edit event.
    this.ColumnSum();

    // Restore saved cost estimation data back into quotationItems on edit/load
    const savedQuotationItems: any[] = (CustQuote as any).quotationItems || [];
    if (savedQuotationItems.length > 0) {
      this.quotationItems = [];
      savedQuotationItems.forEach((qtnItem: any, fallbackIdx: number) => {
        // Match by customerQuotationDetailsId; fall back to position
        let gridRow = gridData.find((row: any) => row.id === qtnItem.qtnItemId);
        if (!gridRow) {
          gridRow = gridData[fallbackIdx];
        }
        if (!gridRow) {
          return;
        }

        const key = this.ensureRowKey(gridRow);

        const costData = (qtnItem.costEstimationDetails || []).map((detail: any, idx: number) => {
          const unitName = detail.unit || (detail.unitID != null
            ? this.unitListt?.find(
              (u: any) => u.value == detail.unitID
            )?.label
            : '') ||
            '';

          return {
            slNo: idx + 1,
            itemId: detail.estItemId || null,
            description: detail.itemDescription || '',
            totalQuantity: detail.qty || 0,
            unitRate: detail.rate || 0,
            totalAmount: detail.amount || 0,
            unit: unitName,
            unitId: detail.unitID,
            remark: detail.remarks || '',
          };
        });
        if (costData.length === 0) {
          costData.push(this.getEmptyCostRow(0));
        }


        const gridTotal = costData.reduce((sum: number, row: any) => {
          return sum + (Number(row.totalAmount) || 0);
        }, 0);

        const gridQty = Number(gridRow.qty) || 0;
        const fetchedNetAmount = Number(qtnItem.netAmount) || 0;
        const providedFinalRatePerTon = Number(qtnItem.finalRatePerTon) || 0;
        const derivedFinalRatePerTon =
          providedFinalRatePerTon > 0
            ? providedFinalRatePerTon
            : (gridQty > 0 ? fetchedNetAmount / gridQty : 0);

        this.quotationItems.push({
          __quotationItemKey: key,
          itemId: gridRow.item != null ? Number(gridRow.item) : null,
          description: gridRow.materialname || '',
          qtnItemId: qtnItem.qtnItemId,
          totalCostAmount: gridTotal,
          customerQuotationContingencyPercentage: qtnItem.contingencyPer ?? 0,
          customerQuotationContingencyAmount: qtnItem.contingencyAmount ?? 0,
          costEstimationGrossTotalAmount: qtnItem.grossAmount ?? 0,
          customerQuotationOHAndProfitPercentage: qtnItem.profitPer ?? 0,
          customerQuotationOHAndProfitAmount: qtnItem.profitAmount ?? 0,
          costEstimationNetAmount: qtnItem.netAmount ?? 0,
          customerQuotationAmount: gridTotal,
          costEstimationFinalRatePerTon: derivedFinalRatePerTon,
          transport_charges: qtnItem.transport_charges ?? qtnItem.Transport_charges ?? 0,
          design_Charges: qtnItem.design_Charges ?? qtnItem.Design_Charges ?? 0,
          costEstimationData: costData,
        });
      });

      // Recalculate loaded values using the same runtime summary logic used during edits.
      this.quotationItems.forEach((item: any) => {
        this.calculateItemCost(item);
        this.calculateItemSummary(item);
      });
    }

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
  quotationItems: Array<any> = [];
  isTotalsValid: boolean = false;

  handleChange(e: any) {
    this.index = e.index;
    if (e.index == 0) {
      requestAnimationFrame(() => {
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);

        if (hotInstance) {
          hotInstance.render();
        }
      });
    } else if (e.index == 2 && this.btnFlag.edit) {
      this.fetchDocumentTree(
        this.savedCustomerQuotation?.customerQuotationQId ? this.savedCustomerQuotation?.customerQuotationQId : this.customerQuotationFormGroup.getRawValue().customerQuotationQId
      );
    }
    else if (e.index == 1) {
      this.syncQuotationItemsFromGrid();
      this.loadCostEstimationItems();
      setTimeout(() => {
        this.quotationItems.forEach((_: any, itemIndex: number) => {
          this.renderCostEstimationTable(itemIndex);
        });
      }, 200);
    } else if (e.index == 5) {
      this.syncQuotationItemsFromGrid();
      this.LoadUnitDDL();
      setTimeout(() => {
        this.quotationItems.forEach((_: any, itemIndex: number) => {
          this.renderCostEstimationTable(itemIndex);
        });
      }, 200);
    }
  }

  loadCostEstimationItems(): void {
    this.masterapi.GetCostEstimationItems().subscribe((res: any) => {
      this.dataList = res?.result.map((kl: any) => ({
        partNo: '',
        sales: kl.itemName,
        salesId: kl.id,
      }));
    });
  }

  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((m: any) => {
      this.units = m.resultSet.unitMasters;
      this.unitArray = m.resultSet.unitMasters;
      this.unitListt = m.resultSet.unitMasters?.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
    });
  }

  private ensureRowKey(row: any): string {
    if (!row) {
      return '';
    }
    if (row.__quotationItemKey) {
      return row.__quotationItemKey;
    }

    const key = `qi_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    row.__quotationItemKey = key;
    return key;
  }

private buildQuotationItemsPayload(): any[] {
    const qtnId = Number(this.customerQuotationFormGroup.getRawValue().customerQuotationQId || 0);

    return this.quotationItems
      .filter((item: any) => item.itemId != null) // Added this line to filter out empty spare rows
      .map((item: any) => {
        // Added log here
        console.log('totalCostAmount:', item.totalCostAmount);
        console.log('customerQuotationAmount:', item.customerQuotationAmount);

        const gridTotal = (item.costEstimationData || []).reduce((sum: number, row: any) => {
          return sum + this.toNumber(row.totalAmount);
        }, 0);

        console.log("new total cost according the callc "+gridTotal)

        const QtnItemName =
          String(item.description || '').trim() ||
          this.getCustomerQuotationDetailDescription(
            Number(item.qtnItemId ?? item.itemId ?? 0)
          );

        return {
          itemId: item.itemId,
          qtnItemId: Number(item.itemId ?? 0),
          QtnItemName,
          totalCost: gridTotal,
          contingencyPer: item.customerQuotationContingencyPercentage,
          contingencyAmount: item.customerQuotationContingencyAmount,
          grossAmount: item.costEstimationGrossTotalAmount,
          profitPer: item.customerQuotationOHAndProfitPercentage,
          profitAmount: item.customerQuotationOHAndProfitAmount,
          netAmount: item.costEstimationNetAmount,
          finalRatePerTon: item.costEstimationFinalRatePerTon,
          Transport_charges: item.transport_charges || 0, 
          Design_Charges: item.design_Charges || 0,
          costEstimationDetails: (item.costEstimationData || [])
            .filter((row: any) => this.hasCostEstimationRowContent(row))
            .map((row: any) => {
              const QtnItemName =
                String(row.description || '').trim() ||
                this.getCustomerQuotationDetailDescription(
                  Number(item.qtnItemId ?? item.itemId ?? 0)
                );

              return {
                qtnId: qtnId,
                qtnItemId: Number(item.qtnItemId ?? item.itemId ?? 0),
                estItemId: Number(row.itemId ?? 0),
                itemDescription: row.description,
                QtnItemName,
                qty: row.totalQuantity,
                rate: row.unitRate,
                amount: row.totalAmount,
                remarks: row.remark,
                unit: row.unit,
                unitId:
                  row.unitId ??
                  this.units?.find(
                    (u: any) =>
                      u.unitMasterUnitShortName?.trim() === row.unit?.trim()
                  )?.unitMasterUnitId ??
                  null,
              };
            }),
        };
      });
}

  private getCustomerQuotationDetailDescription(qtnItemId: number): string | null {
    const match = this.customerQuotationentryDataset?.find(
      (detail: any) => Number(detail.item) === qtnItemId
    );
    return match?.materialname?.trim() || null;
  }


  private hasCostEstimationRowContent(row: any): boolean {
    if (!row) {
      return false;
    }
    return (
      (row.description && String(row.description).trim() !== '') ||
      this.toNumber(row.totalQuantity) > 0 ||
      this.toNumber(row.unitRate) > 0 ||
      (row.itemId !== null && row.itemId !== undefined && row.itemId !== '') ||
      (row.remark && String(row.remark).trim() !== '')
    );
  }

  private syncQuotationItemsFromGrid(): void {
    const existingByKey = new Map<string, any>();
    this.quotationItems.forEach((item: any) => {
      if (item && item.__quotationItemKey) {
        existingByKey.set(item.__quotationItemKey, item);
      }
    });

    this.quotationItems = (this.customerQuotationentryDataset || [])
      .filter((k) => k && k.hasOwnProperty('item'))
      .map((row: any) => {
        const rowKey = this.ensureRowKey(row);
        const existing = existingByKey.get(rowKey);
        const item: any = existing
          ? existing
          : {
            itemId: null,
            description: '',
            costEstimationData: [],
            __quotationItemKey: rowKey,
          };

        item.__quotationItemKey = rowKey;
        item.itemId = row.item != null ? Number(row.item) : null;
        item.description = row.materialname || row.itemname || row.description || '';

        this.ensureItemCostDataset(item);
        this.initializeEmptyCostRow(item);
        this.calculateItemSummary(item);

        return item;
      });
  }

  private validateAllCostEstimations(showMessages: boolean = false): boolean {
    const accordionsValid = this.validateAllAccordions(showMessages);
    const totalsValid = this.validateTotals(showMessages);
    return accordionsValid && totalsValid;
  }

  private validateAllAccordions(showMessages: boolean = false): boolean {
    const addValidationMessage = (detail: string) => {
      if (showMessages) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation',
          detail,
        });
      }
    };

    for (let itemIndex = 0; itemIndex < this.quotationItems.length; itemIndex++) {
      const item = this.quotationItems[itemIndex];
      const header = this.getItemHeader(item, itemIndex);

      if (!item.costEstimationData || item.costEstimationData.length === 0) {
        addValidationMessage(`${header}: At least one detail row is required.`);
        return false;
      }

      let computedTotalCost = 0;
      let hasValidRow = false;

      for (let rowIndex = 0; rowIndex < item.costEstimationData.length; rowIndex++) {
        const row = item.costEstimationData[rowIndex];
        const qty = this.toNumber(row.totalQuantity);
        const rate = this.toNumber(row.unitRate);
        const amount = this.toNumber(row.totalAmount);
        const expectedAmount = this.roundAmount(qty * rate);

        if (this.hasCostEstimationRowContent(row)) {
          hasValidRow = true;

          if (!row.description || String(row.description).trim() === '') {
            addValidationMessage(`${header}: Description required at row ${rowIndex + 1}.`);
            return false;
          }

          if (qty <= 0) {
            addValidationMessage(`${header}: Quantity must be greater than zero at row ${rowIndex + 1}.`);
            return false;
          }

          if (rate <= 0) {
            addValidationMessage(`${header}: Unit Rate must be greater than zero at row ${rowIndex + 1}.`);
            return false;
          }

          if (!row.unit || String(row.unit).trim() === '') {
            addValidationMessage(`${header}: Unit is required at row ${rowIndex + 1}.`);
            return false;
          }

          if (amount <= 0) {
            addValidationMessage(`${header}: Total Amount must be greater than zero at row ${rowIndex + 1}.`);
            return false;
          }

          // if (qty > 0 && rate > 0 && amount !== expectedAmount) {
          //   addValidationMessage(`${header}: Total Amount must equal Quantity × Unit Rate (${expectedAmount}) at row ${rowIndex + 1}.`);
          //   return false;
          // }
        }

        const rowAmountForTotal = qty > 0 && rate > 0 ? expectedAmount : amount;
        computedTotalCost += rowAmountForTotal;
      }

      // if (!hasValidRow) {
      //   addValidationMessage(`${header}: At least one filled detail row is required.`);
      //   return false;
      // }

      // const totalCost = this.roundAmount(item.totalCostAmount || 0);
      // const expectedCost = this.roundAmount(computedTotalCost);
      // if (totalCost !== expectedCost) {
      //   addValidationMessage(`${header}: Total Cost must equal the sum of detail row amounts (${expectedCost}).`);
      //   return false;
      // }

      // const netAmount = this.roundAmount(item.costEstimationNetAmount || 0);
      // if (netAmount <= 0) {
      //   addValidationMessage(`${header}: Net Total must be greater than zero.`);
      //   return false;
      // }
    }

    return true;
  }

  private validateTotals(showMessages: boolean = false): boolean {
    this.isTotalsValid = true;
    return this.isTotalsValid;
  }

  GetSavedCustomerQuotationDetails(id: string) {
    this.index = 0;
    this.salesapi.GetSavedCustQuotationDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          if (this.istemplate) {
            this.new();
          } else {
            this.loaddropdown(false);
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
          this.loadReportTemplates();

          this.customerQuotationFormGroup.controls.customerQuotationReviseQuotation?.enable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Customer Quotation not found',
          });
        }
      },
      () => {
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
            () => {
              // this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Customer Quotation Deleted Succesfully',
              });
              this.new();
            },
            () => {
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
    this.loadCostEstimationItems();
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
    // Recompute totals now that the form is enabled, in case they were
    // never correctly calculated while the form was disabled (view mode).
    this.ColumnSum();
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
            () => {
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
            () => {
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
  selectsales(evt: any) {
    if (this.isMainGridUnitLookup) {
      this.selectMainGridUnit(evt);
      return;
    }

    const hotInstance = this.hotRegisterer.getInstance(this.hotid);

      const totalRows = hotInstance.countRows();
      for(let i = 0; i < totalRows ; i++){
        if(i === this.activeRow.row) continue;
        const existingId = hotInstance.getDataAtCell(i, this.activeRow.column);

      if (existingId == evt.salesId) {
       this.messageService.add({
                severity: 'warn',
                summary: 'Alert',
                detail: 'Cannot add this item as it already exists in the grid!',
              });
        this.showSalesLookUp = false;
        hotInstance.setDataAtCell(this.activeRow.row, this.activeRow.column, null); 
        return; 
      }
        
      }

    const currentQty = hotInstance?.getDataAtCell(this.activeRow.row, 4);
    if (currentQty == null || currentQty === '') {
      hotInstance.setDataAtCell(this.activeRow.row, 4, 1);
    }

    let trimmedSales = evt.sales?.trim();
    const includesPcs = this.units.some((unit: { unitMasterUnitShortName: string; }) =>
      unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
    );
    if (includesPcs && this.unitArray.length != 0) {
      const UnitId = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.salesId
      )?.unitMasterUnitShortName || '';
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, UnitId);
      this.updateMainGridUnitSelection(this.activeRow.row, evt.salesId, UnitId);
    } else {
      this.masterapi.GetUnitDetails(evt.salesId).subscribe((res) => {
        this.unitArray = res.result;
        this.unitArry = res.result.map((ar: any) =>
          ar.unitMasterUnitShortName?.trim() || ''
        );
      });

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.salesId);
      this.masterapi.GetItemMasterById({ id: evt.salesId }).subscribe((k) => {
        this.ItemMasterArrayByName = k.resultSet?.itemMaster;
        // this.conversion_Type = this.ItemMasterArrayByName.unitDetails[0].unitDetailsConversionType;

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
        this.updateMainGridUnitSelection(this.activeRow.row, this.funitid, Unit);
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
    this.isMainGridUnitLookup = false;
  }
  private loadAllUnitsForMainGridLookup(): void {
    this.masterapi.GetAllUnit().subscribe((data) => {
      this.unitArray = data || [];
      this.units = data || [];
      this.unitArry = this.unitArray.map((unit) =>
        unit.unitMasterUnitShortName?.trim() || ''
      );
      this.dataList = this.unitArray.map((unit) => {
        const lookupRow: any = {
          code: unit.unitMasterUnitId,
          fullName: unit.unitMasterUnitFullName,
          shortName: unit.unitMasterUnitShortName,
        };

        Object.defineProperties(lookupRow, {
          salesId: {
            value: unit.unitMasterUnitId,
            enumerable: false,
          },
          sales: {
            value: unit.unitMasterUnitShortName,
            enumerable: false,
          },
          unitMasterUnitId: {
            value: unit.unitMasterUnitId,
            enumerable: false,
          },
          unitMasterUnitShortName: {
            value: unit.unitMasterUnitShortName,
            enumerable: false,
          },
          unitMasterUnitFullName: {
            value: unit.unitMasterUnitFullName,
            enumerable: false,
          },
        });

        return lookupRow;
      });

      const selectedUnitName = this.customerQuotationentryDataset?.[this.activeRow?.row]?.unit;
      this.selectItem = selectedUnitName
        ? this.dataList.find((unit) => unit.shortName === selectedUnitName)
        : {};
    });
  }

  private selectMainGridUnit(evt: any): void {
    const selectedUnitId = evt?.salesId ?? evt?.unitMasterUnitId ?? evt?.value ?? null;
    const selectedUnitName = evt?.sales ?? evt?.shortName ?? evt?.unitMasterUnitShortName ?? '';

    if (this.activeRow?.row == null) {
      this.showSalesLookUp = false;
      this.isMainGridUnitLookup = false;
      return;
    }

    this.updateMainGridUnitSelection(this.activeRow.row, selectedUnitId, selectedUnitName);
    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, 3, selectedUnitName, 'main-grid-unit-lookup');

    this.showSalesLookUp = false;
    this.isMainGridUnitLookup = false;
  }

  private updateMainGridUnitSelection(rowIndex: number, unitId: any, unitName: string): void {
    if (!this.customerQuotationentryDataset?.[rowIndex]) {
      this.customerQuotationentryDataset[rowIndex] = {};
    }

    this.customerQuotationentryDataset[rowIndex].unit = unitName;
    this.customerQuotationentryDataset[rowIndex].unitId = unitId != null ? Number(unitId) : null;
  }
  getUnitByItemId(id: any) {
    this.unitArray = [];
    this.masterapi.GetUnitDetails(id).subscribe((res) => {
      this.unitArray = res.result;
      // this.dataList = this.unitSetLookup;
      this.unitArry = res.result.map((ar: any) =>
        ar.unitMasterUnitShortName?.trim()
      );
      this.showSalesLookUp = true;
    });
  }
  exit(event: any) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }
  clear(evt: any) {
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

  selectControl(evt: any) {
    this.control.setValue(evt.salesId);
    this.elementReference.nativeElement.value = evt.sales;
    this.formControlLookUp = false;
  }
  hide(event: any) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }
  QutationList(name: any, id: any) {
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
              unitDetails: data.result.unitDetails.map((res: any) => ({
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

  calculateVat() {
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

  // toggleSelection(enquiry: any) {

  //   let customerId = this.customerList.find(c => c.label == enquiry.customer_Master_Customer_Name)?.value;
  //   let locationId = this.locationList.find(l => l.label == enquiry.location_Master_Location_Name)?.value;
  //   let currencyId = this.currencyList.find(cu => cu.label == enquiry.currency_Master_Currency_Name)?.value;
  //   this.customerQuotationFormGroup.patchValue({
  //     customerQuotationEnquiryNo: enquiry.enquiry_Master_Enquiry_No,
  //     customerQuotationEnquiryId: enquiry.enquiry_Master_Enquiry_ID,
  //     customerQuotationCustomerID: customerId,
  //     customerQuotationCurrencyID: currencyId,
  //     customerQuotationLocationID: locationId,
  //     customerQuotationRemarks: enquiry.enquiry_Master_Remarks,
  //     customerQuotationSalesManID: enquiry.enquiry_Master_SaleMan_ID
  //   })
  //   this.boqService.GetSavedBillofQty(enquiry.enquiry_Master_Enquiry_ID).subscribe((res) => {
  //     const data = res.result;

  //     let mappedStatus: number = 1;
  //     if (data.status?.toUpperCase() === 'OPEN') mappedStatus = 1;
  //     else if (data.status?.toUpperCase() === 'APPROVED') mappedStatus = 2;
  //     else if (data.status?.toUpperCase() === 'REJECTED') mappedStatus = 3;

  //     this.updateStatus(mappedStatus);
  //     // 1. Patch the Reactive Form with available API data
  //     this.customerQuotationFormGroup.patchValue({
  //       customerQuotationQuotationDate: data.date ? new Date(data.date) : null,
  //       customerQuotationRemarks: data.remarks,
  //       customerQuotationEnquiryId: data.customerEnqId,
  //       customerQuotationJobId: data.boqJobID !== null ? data.boqJobID : -1,
  //       customerQuotationAmount: data.totalAmount,
  //       customerQuotationNetAmount: data.quoteAmount
  //     });

  //     // 2. Map the list items to your Handsontable dataset properties
  //     if (data.billOfQTyDetails && data.billOfQTyDetails.length > 0) {
  //       this.customerQuotationentryDataset = data.billOfQTyDetails.map((detail: any) => ({
  //         item: detail.itemCode,
  //         materialname: detail.itemName,
  //         unit: detail.unitCode,
  //         qty: detail.qty,
  //         price: detail.rate,
  //         gamount: detail.amount,
  //         netamount: detail.finalAmount
  //       }));

  //       // resolve unit display text from item code
  //       this.customerQuotationentryDataset.forEach((row, index) => {
  //         if (row.item != null) {
  //           this.masterapi.GetUnitDetails(row.item).subscribe((unitRes: any) => {
  //             const unitName = unitRes?.result?.[0]?.unitMasterUnitFullName;
  //             if (unitName) {
  //               row.unit = unitName;
  //               const hotInstance = this.hotRegisterer.getInstance(this.hotid);
  //               if (hotInstance) {
  //                 hotInstance.setDataAtCell(index, 3, unitName);
  //               }
  //             }
  //           });
  //         }
  //       });

  //       // 3. Load mapped dataset into Handsontable instance and update sums
  //       const hotInstance = this.hotRegisterer.getInstance(this.hotid);
  //       if (hotInstance) {
  //         hotInstance.loadData(this.customerQuotationentryDataset);
  //         this.ColumnSum();
  //       }
  //     }

  //     this.CloseDialog();
  //     this.cdr.detectChanges();
  //   });
  // }
  toggleSelection(enquiry: any) {
    this.salesapi.GetSavedCustEnquiryDetails(enquiry.enquiry_Master_Enquiry_ID).subscribe((res: any) => {
      if (res?.result?.customerEnquiryDetails?.length > 0) {
        this.selectValue(res.result);
      }
    })
  }


  updateStatus(newStatus: number) {
    if (!this.savedCustomerQuotation) {
      this.savedCustomerQuotation = {} as any;
    }
    this.savedCustomerQuotation.approvalStatus = newStatus;
    this.cdr.detectChanges();
  }

  selectValue(evt: any) {
    this.displaycustomerenquirystate = false;
    this.customerQuotationFormGroup.get('customerQuotationSalesManID')?.setValue(evt.enquiryMasterSalesManId);
    this.customerQuotationFormGroup.get('customerQuotationCurrencyID')?.setValue(evt.enquiryMasterCurrencyId);
    if (!this.locationLocked) {
      this.customerQuotationFormGroup.get('customerQuotationLocationID')?.setValue(evt.enquiryMasterLocationId);
    }
    this.customerQuotationFormGroup.get('customerQuotationCustomerID')?.setValue(evt.enquiryMasterContactId);
    this.customerQuotationFormGroup.get('customerQuotationContactPersonV')?.setValue(evt.enquiryMasterContactName);

    this.customerQuotationFormGroup.get('customerQuotationEnquiryNo')?.setValue(evt.enquiryMasterEnquiryNo);


    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    if (!hotInstance) {
      console.error('Handsontable instance not found');
      return;
    }

    this.customerQuotationentryDataset = [];
    hotInstance.loadData([]);

    const gridData = (evt.customerEnquiryDetails || []).map((k) => {
      const qty = Number(k?.enquiryDetailsEnquiryDetailsQty ?? 0);
      const rate = Number(k?.rate ?? k?.enquiryDetailsEnquiryDetailsRate ?? 0);
      const amount = Number(k?.enquiryDetailsEnquiryDetailsAmount ?? qty * rate);
      const unitName = this.getUnit(k?.enquiryDetailsEnquiryDetailsUnitId);

      return {
        item: k?.enquiryDetailsEnquiryDetailsItemId || null,
        partno: k?.enquiryDetailsEnquiryDetailsBatchcode || k?.partno || '',
        materialname:
          k?.enquiryDetailsEnquiryDetailsMaterialDescription ||
          k?.enquiryDetailsEnquiryDetailsDescription ||
          '',
        unit: unitName,
        unitId: k?.enquiryDetailsEnquiryDetailsUnitId || null,
        qty,
        price: rate,
        gamount: amount,
        discount: Number(k?.discount ?? 0),
        netamount: Number(k?.enquiryDetailsEnquiryDetailsNetAmount ?? amount),
        costPrice: Number(k?.costPrice ?? 0),
        grossProfit: Number(k?.grossProfit ?? 0),
        boqDetailsId: k?.boqDetailsId || null,
      };
    });

    this.customerQuotationentryDataset = gridData;
    hotInstance.loadData(gridData);
    hotInstance.render();
    this.ColumnSum();
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
          (doc: any) => {
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
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Deleted Succesfully',
            });
            this.fetchDocumentTree(
              this.savedCustomerQuotation?.customerQuotationQId ? this.savedCustomerQuotation?.customerQuotationQId : this.customerQuotationFormGroup.getRawValue().customerQuotationQId
            );
          },
          () => {
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
  /*********************** this is cost estimation code */
  costEstimationHotId = 'customerQuotationHot';
  private costEstimationSettingsCache: { [key: number]: Handsontable.GridSettings } = {};
  private readonly costEstimationRegisterer = this.hotRegisterer;

  showCostItemLookUp = false;
  showUnitLookUp = false;

  costLookupGridColumns: string[] = ['Item', 'Item Id'];
  costLookupSearchText = '';

  private readonly costDescriptionColumnIndex = 2;

  private getEmptyCostRow(rowIndex: number = 0): any {
    return {
      slNo: rowIndex + 1,
      itemId: null,
      description: '',
      totalQuantity: 0,
      unitRate: 0,
      unit: '',
      totalAmount: 0,
      remark: ''
    };
  }

  private normalizeCostLookupItem(item: any): any {
    if (!item) {
      return { partNo: '', sales: '', salesId: null };
    }

    const salesId =
      item.salesId ??
      item.itemId ??
      item.ItemId ??
      item.id ??
      item.costEstimationItemId ??
      null;

    const sales =
      item.sales ??
      item.itemName ??
      item.Itemname ??
      item.description ??
      item.itemDescription ??
      '';

    return {
      ...item,
      partNo: item.partNo ?? item.itemMasterPartNo ?? '',
      sales,
      salesId,
      unit:
        item.unit ??
        item.unitName ??
        item.UnitName ??
        item.label ??
        item.salesUnit ??
        '',
      unitId:
        item.unitId ??
        item.value ??
        item.unitMasterUnitId ??
        item.salesId ??
        null,
      unitRate: item.unitRate ?? item.rate ?? item.salesRate ?? item.price ?? 0,
      totalQuantity: item.totalQuantity ?? item.qty ?? 0,
      totalAmount: item.totalAmount ?? 0,
      remark: item.remark ?? ''
    };
  }


  openCostItemLookupFromGrid(
    row: number,
    column: number,
    accordionIndex: number,
    searchText: string = ''
  ): void {
    if (row < 0 || accordionIndex < 0) {
      return;
    }

    const rowContext = { row, column, accordionIndex };

    this.activeCostRow = rowContext;
    this.lastActiveCostRow = rowContext;

    this.costLookupSearchText = searchText || '';
    this.costLookupGridColumns = ['Part No', 'Item', 'Item Id'];
    this.lookupGridColumns = this.costLookupGridColumns;

    this.selectItem = {};
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
    this.showCostItemLookUp = true;
  }
  openUnitLookupFromGrid(
    row: number,
    column: number,
    accordionIndex: number,
    searchText: string = ''
  ): void {
    if (row < 0 || accordionIndex < 0) {
      return;
    }

    const rowContext = { row, column, accordionIndex };

    this.activeCostRow = rowContext;
    this.lastActiveCostRow = rowContext;

    this.costLookupSearchText = searchText || '';

    // ================= UNIT LOOKUP GRID COLUMNS =================
    this.costLookupGridColumns = ['Unit Name', 'Unit Id'];

    this.lookupGridColumns = this.costLookupGridColumns;

    this.selectItem = {};

    // ================= HIDE OTHER LOOKUPS =================
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
    this.showCostItemLookUp = false;

    // ================= SHOW UNIT LOOKUP =================
    this.showUnitLookUp = true;
  }
  selectCostItemFromLookup(selectedItem: any): void {

    const normalizedItem = this.normalizeCostLookupItem(selectedItem);

    if (!normalizedItem || (!normalizedItem.sales && normalizedItem.salesId == null)) {
      this.showCostItemLookUp = false;
      return;
    }

    const selectedCostRow = this.activeCostRow || this.lastActiveCostRow;

    if (!selectedCostRow) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selection Warning',
        detail: 'Please select a cost estimation row first.'
      });
      this.showCostItemLookUp = false;
      return;
    }

    const { row, accordionIndex } = selectedCostRow;
    const quotationItem = this.quotationItems?.[accordionIndex];

    if (!quotationItem) {
      this.showCostItemLookUp = false;
      this.activeCostRow = null;
      return;
    }

    const dataset = this.getCostEstimationDataset(quotationItem);

    if (!dataset[row]) {
      dataset[row] = this.getEmptyCostRow(row);
    }

    const duplicateIndex = dataset.findIndex(
      (r: any, idx: number) =>
        idx !== row && r.itemId != null && r.itemId === normalizedItem.salesId
    );

    if (duplicateIndex >= 0) {
      this.showWarning('This item is already added to the cost estimation grid.');
      this.showCostItemLookUp = false;
      this.activeCostRow = null;
      return;
    }

    dataset[row].slNo = row + 1;
    dataset[row].itemId = normalizedItem.salesId;
    dataset[row].description = normalizedItem.sales;

    if (normalizedItem.unit) {
      dataset[row].unit = normalizedItem.unit;
    }

    if (this.toNumber(normalizedItem.unitRate) > 0) {
      dataset[row].unitRate = this.toNumber(normalizedItem.unitRate);
    }

    if (this.toNumber(normalizedItem.totalQuantity) > 0 && this.toNumber(dataset[row].totalQuantity) === 0) {
      dataset[row].totalQuantity = this.toNumber(normalizedItem.totalQuantity);
    }

    if (normalizedItem.remark) {
      dataset[row].remark = normalizedItem.remark;
    }

    this.calculateRowAmount(quotationItem, row);

    const hotInstance = this.hotRegisterer.getInstance(this.getCostEstimationHotId(accordionIndex));

    if (hotInstance) {
      hotInstance.setDataAtRowProp(row, 'slNo', dataset[row].slNo, 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'itemId', dataset[row].itemId, 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'description', dataset[row].description, 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'totalQuantity', dataset[row].totalQuantity, 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'unitRate', dataset[row].unitRate, 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'unit', dataset[row].unit, 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'totalAmount', dataset[row].totalAmount, 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'remark', dataset[row].remark, 'cost-item-lookup');
      hotInstance.selectCell(row, 3);
      hotInstance.render();
      hotInstance.refreshDimensions();
    }

    this.calculateItemCost(quotationItem);
    this.calculateItemSummary(quotationItem);
    this.validateAccordionTotal(quotationItem, false);
    this.syncQuotationItem(quotationItem);

    this.showCostItemLookUp = false;
    this.activeCostRow = null;
    this.selectItem = {};
  }
  selectUnitFromLookup(selectedItem: any): void {
    ;

    const normalizedItem = this.normalizeCostLookupItem(selectedItem);

    // if (!this.isValidItem(normalizedItem)) {
    //   this.showCostItemLookUp = false;
    //   return;
    // }

    const selectedCostRow = this.activeCostRow || this.lastActiveCostRow;

    if (!selectedCostRow) {
      this.showWarning('Please select a cost estimation row first.');
      this.showUnitLookUp = false;
      return;
    }

    const { row, accordionIndex } = selectedCostRow;
    const quotationItem = this.quotationItems?.[accordionIndex];

    if (!quotationItem) {
      this.resetLookup();
      return;
    }

    const dataset = this.getCostEstimationDataset(quotationItem);

    if (!dataset[row]) {
      dataset[row] = this.getEmptyCostRow(row);
    }

    const item = dataset[row];

    // ================= UNIT BASED MAPPING =================
    this.mapUnitItem(item, normalizedItem);

    this.calculateRowAmount(quotationItem, row);
    this.updateGrid(row, accordionIndex, dataset);
    this.afterSave(quotationItem);
    this.showUnitLookUp = false;
  }

  // ================= HELPERS =================

  private mapUnitItem(item: any, normalizedItem: any): void {
    item.slNo = item.slNo || 0;
    item.unit = normalizedItem.unit || item.unit;
    item.unitId = normalizedItem.unitId ?? item.unitId ?? null;

    const unitRate = this.toNumber(normalizedItem.unitRate);
    if (unitRate > 0) {
      item.unitRate = unitRate;
    }

    const totalQty = this.toNumber(normalizedItem.totalQuantity);
    if (totalQty > 0 && this.toNumber(item.totalQuantity) === 0) {
      item.totalQuantity = totalQty;
    }

    item.remark = normalizedItem.remark || item.remark;
  }

  // ================= GRID UPDATE =================

  private updateGrid(row: number, accordionIndex: number, dataset: any[]): void {
    const hotInstance = this.hotRegisterer.getInstance(
      this.getCostEstimationHotId(accordionIndex)
    );

    if (!hotInstance) return;

    const item = dataset[row];

    const fields = [
      'slNo',
      'itemId',
      'description',
      'totalQuantity',
      'unitRate',
      'unit',
      'totalAmount',
      'remark'
    ];

    fields.forEach(field => {
      hotInstance.setDataAtRowProp(row, field, item[field], 'cost-item-lookup');
    });

    hotInstance.selectCell(row, 3);
    hotInstance.render();
    hotInstance.refreshDimensions();
  }

  // ================= CLEAN FLOW =================

  private afterSave(quotationItem: any): void {
    this.calculateItemCost(quotationItem);
    this.calculateItemSummary(quotationItem);
    this.validateAccordionTotal(quotationItem, false);
    this.syncQuotationItem(quotationItem);

    this.showCostItemLookUp = false;
    this.activeCostRow = null;
    this.selectItem = {};
  }

  // ================= UTILS =================

  private isValidItem(item: any): boolean {
    return !!item && (!!item.sales || item.salesId != null);
  }

  private showWarning(msg: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Selection Warning',
      detail: msg
    });
  }

  private resetLookup(): void {
    this.showCostItemLookUp = false;
    this.showUnitLookUp = false;
    this.activeCostRow = null;
  }
  handleCostLookupSelection(event: any): void {
    this.isCostLookupSelecting = true;

    try {
      this.selectCostItemFromLookup(event);
    } finally {
      setTimeout(() => {
        this.isCostLookupSelecting = false;
      }, 0);
    }
  }
  handleUnitLookupSelection(event: any): void {
    this.isUnitLookupSelecting = true;

    try {
      this.selectUnitFromLookup(event);
    } finally {
      setTimeout(() => {
        this.isUnitLookupSelecting = false;
      }, 0);
    }
  }
  exitCostItemLookup(event?: any): void {
    this.showCostItemLookUp = false;
    this.showUnitLookUp = false;
    this.selectItem = {};
  }

  clearCostItemLookup(event?: any): void {
    if (!this.activeCostRow) {
      this.showCostItemLookUp = false;
      this.showUnitLookUp = false;
      return;
    }

    const { row, accordionIndex } = this.activeCostRow;
    const item = this.quotationItems?.[accordionIndex];

    if (!item) {
      this.showCostItemLookUp = false;
      this.activeCostRow = null;
      return;
    }

    const dataset = this.getCostEstimationDataset(item);

    if (!dataset[row]) {
      dataset[row] = this.getEmptyCostRow(row);
    } else {
      dataset[row] = {
        ...dataset[row],
        itemId: null,
        description: '',
        unit: '',
        unitRate: 0,
        totalAmount: 0,
        remark: ''
      };
    }

    const hotInstance = this.hotRegisterer.getInstance(this.getCostEstimationHotId(accordionIndex));

    if (hotInstance) {
      hotInstance.setDataAtRowProp(row, 'itemId', null, 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'description', '', 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'unit', '', 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'unitRate', 0, 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'totalAmount', 0, 'cost-item-lookup');
      hotInstance.setDataAtRowProp(row, 'remark', '', 'cost-item-lookup');
      hotInstance.render();
      hotInstance.refreshDimensions();
    }

    this.calculateItemCost(item);
    this.calculateItemSummary(item);
    this.validateAccordionTotal(item, false);
    this.syncQuotationItem(item);

    this.showCostItemLookUp = false;
    this.showUnitLookUp = false;
    this.activeCostRow = null;
    this.selectItem = {};
  }

  private ensureItemCostDataset(item: any): any[] {
    if (!item.costEstimationData || !Array.isArray(item.costEstimationData)) {
      if (Array.isArray(item.costEstimations)) {
        item.costEstimationData = JSON.parse(JSON.stringify(item.costEstimations));
      } else if (Array.isArray(item.costEstimationDetails)) {
        item.costEstimationData = JSON.parse(JSON.stringify(item.costEstimationDetails));
      } else {
        item.costEstimationData = [];
      }
    }

    return item.costEstimationData;
  }

  private initializeEmptyCostRow(item: any): void {
    const dataset = this.ensureItemCostDataset(item);

    if (dataset.length === 0) {
      dataset.push(this.getEmptyCostRow(0));
    }
  }

  getCostEstimationHotId(index: number): string {
    return `${this.costEstimationHotId}_${index}`;
  }

  getCostEstimationDataset(item: any): any[] {
    return this.ensureItemCostDataset(item);
  }

  // getCostEstimationSettings(index: number): Handsontable.GridSettings {
  //   if (this.costEstimationSettingsCache[index]) {
  //     return this.costEstimationSettingsCache[index];
  //   }

  //   const settings: Handsontable.GridSettings = {
  //     rowHeaders: false,
  //     readOnly: false,
  //     editor: true,

  //     colHeaders: [
  //       'Sl no',
  //       'Item ID',
  //       'Description',
  //       'Total Quantity',
  //       'Unit rate',
  //       'Unit',
  //       'Total amount',
  //       'Remark'
  //     ],

  //     columns: [
  //       { data: 'slNo', type: 'numeric', width: 60, className: 'htCenter', readOnly: false },
  //       { data: 'itemId', type: 'numeric', width: 120, className: 'htCenter', readOnly: false },
  //       { data: 'description', type: 'text', width: 300, readOnly: false },
  //       { data: 'totalQuantity', type: 'numeric', numericFormat: { pattern: '0,0.00' }, width: 120, className: 'htRight', readOnly: false },
  //       { data: 'unitRate', type: 'numeric', numericFormat: { pattern: '0,0.00' }, width: 120, className: 'htRight', readOnly: false },
  //       { data: 'unit', type: 'text', width: 80, className: 'htCenter', readOnly: false },
  //       { data: 'totalAmount', type: 'numeric', numericFormat: { pattern: '0,0.00' }, width: 140, className: 'htRight', readOnly: false },
  //       { data: 'remark', type: 'text', width: 180, readOnly: false }
  //     ],

  //     width: '100%',
  //     height: 300,
  //     stretchH: 'all',
  //     autoColumnSize: false,
  //     minRows: 10,
  //     minSpareRows: 1,
  //     contextMenu: true,
  //     manualColumnResize: true,
  //     manualRowResize: true,
  //     rowHeights: 28,
  //     autoWrapRow: true,
  //     autoWrapCol: true,
  //     fillHandle: true,
  //     formulas: false,
  //     licenseKey: this.licensekey,

  //     beforeKeyDown: (event: KeyboardEvent) => {
  //       const hotInstance = this.hotRegisterer.getInstance(this.getCostEstimationHotId(index));

  //       if (!hotInstance) {
  //         return;
  //       }

  //       const selected = hotInstance.getSelectedLast();

  //       if (!selected) {
  //         return;
  //       }

  //       const row = selected[0];
  //       const col = selected[1];

  //       if (col !== this.costDescriptionColumnIndex || row < 0) {
  //         return;
  //       }

  //       this.activeCostRow = { row, column: col, accordionIndex: index };

  //       const ignoredKeys = [
  //         'Tab',
  //         'Escape',
  //         'Shift',
  //         'Control',
  //         'Alt',
  //         'Meta',
  //         'CapsLock',
  //         'ArrowUp',
  //         'ArrowDown',
  //         'ArrowLeft',
  //         'ArrowRight',
  //         'PageUp',
  //         'PageDown',
  //         'Home',
  //         'End'
  //       ];

  //       if (ignoredKeys.includes(event.key)) {
  //         return;
  //       }

  //       const shouldOpenLookup = event.key === 'Enter' || event.key === 'F2' || event.key.length === 1;

  //       if (!shouldOpenLookup) {
  //         return;
  //       }

  //       event.preventDefault();
  //       event.stopImmediatePropagation();

  //       const currentValue = hotInstance.getDataAtCell(row, col);
  //       const searchText = event.key.length === 1 ? event.key : String(currentValue || '');

  //       this.openCostItemLookupFromGrid(row, col, index, searchText);
  //     },

  //     afterOnCellMouseDown: (
  //       event: MouseEvent,
  //       coords: Handsontable.wot.CellCoords
  //     ) => {
  //       if (!coords || coords.row < 0 || coords.col < 0) {
  //         return;
  //       }

  //       if (coords.col !== this.costDescriptionColumnIndex) {
  //         return;
  //       }

  //       this.activeCostRow = {
  //         row: coords.row,
  //         column: coords.col,
  //         accordionIndex: index
  //       };

  //       if (event.detail !== 2) {
  //         return;
  //       }

  //       event.preventDefault();
  //       event.stopPropagation();

  //       const hotInstance = this.hotRegisterer.getInstance(this.getCostEstimationHotId(index));
  //       const currentValue = hotInstance ? hotInstance.getDataAtCell(coords.row, coords.col) : '';

  //       this.openCostItemLookupFromGrid(coords.row, coords.col, index, String(currentValue || ''));
  //     },

  //     afterChange: (
  //       changes: Handsontable.CellChange[] | null,
  //       source: string
  //     ) => {
  //       if (!changes || source === 'loadData' || source === 'calculation' || source === 'cost-item-lookup') {
  //         return;
  //       }

  //       const item = this.quotationItems?.[index];

  //       if (!item) {
  //         return;
  //       }

  //       changes.forEach(([row, prop]) => {
  //         const rowIndex = Number(row);

  //         if (Number.isNaN(rowIndex)) {
  //           return;
  //         }

  //         if (prop === 'totalQuantity' || prop === 'unitRate') {
  //           this.calculateRowAmount(item, rowIndex);
  //         }
  //       });

  //       this.calculateItemCost(item);
  //       this.calculateItemSummary(item);
  //       this.validateAccordionTotal(item, false);
  //       this.syncQuotationItem(item);
  //     },

  //     cells: (row: number, col: number) => {
  //       const cellProperties: Partial<Handsontable.CellProperties> = {};
  //       const item = this.quotationItems?.[index];
  //       const rowData = item ? this.getCostEstimationDataset(item)[row] : null;
  //       const classes: string[] = [];

  //       if (rowData) {
  //         const desc = String(rowData.description || '').toLowerCase().trim();
  //         const isTotalRow =
  //           desc === 'total cost' ||
  //           desc === 'total amount' ||
  //           desc === 'rate per ton' ||
  //           desc === 'final rate per ton' ||
  //           desc === 'total amount for steel structure';

  //         if (isTotalRow) {
  //           classes.push('bold-hot-row');
  //         }
  //       } else {
  //         classes.push('empty-hot-row');
  //       }

  //       if (col === 0 || col === 1 || col === 5) {
  //         classes.push('htCenter');
  //       }

  //       if (col === 3 || col === 4 || col === 6) {
  //         classes.push('htRight');
  //       }

  //       cellProperties.readOnly = false;
  //       cellProperties.className = classes.join(' ');

  //       return cellProperties;
  //     }
  //   };

  //   this.costEstimationSettingsCache[index] = settings;
  //   return settings;
  // }

  getCostEstimationSettings(index: number): Handsontable.GridSettings {
    if (this.costEstimationSettingsCache[index]) {
      return this.costEstimationSettingsCache[index];
    }

    const settings: Handsontable.GridSettings = {
      rowHeaders: false,
      readOnly: false,
      editor: true,

      colHeaders: [
        'Sl no',
        'Item ID',
        'Description',
        'Total Quantity',
        'Unit rate',
        'Unit',
        'Total amount',
        'Remark'
      ],

      columns: [
        { data: 'slNo', type: 'numeric', width: 60, className: 'htCenter', readOnly: false },
        { data: 'itemId', type: 'numeric', width: 120, className: 'htCenter', readOnly: false },
        { data: 'description', type: 'text', width: 300, readOnly: false },
        { data: 'totalQuantity', type: 'numeric', numericFormat: { pattern: '0,0.00' }, width: 120, className: 'htRight', readOnly: false },
        { data: 'unitRate', type: 'numeric', numericFormat: { pattern: '0,0.00' }, width: 120, className: 'htRight', readOnly: false },
        { data: 'unit', type: 'text', width: 80, className: 'htCenter', readOnly: false },
        { data: 'totalAmount', type: 'numeric', numericFormat: { pattern: '0,0.00' }, width: 140, className: 'htRight', readOnly: false },
        { data: 'remark', type: 'text', width: 180, readOnly: false }
      ],

      width: '100%',
      height: 300,
      stretchH: 'all',
      autoColumnSize: false,
      minRows: 10,
      minSpareRows: 1,
      contextMenu: true,
      manualColumnResize: true,
      manualRowResize: true,
      rowHeights: 28,
      autoWrapRow: true,
      autoWrapCol: true,
      fillHandle: true,
      formulas: false,
      hiddenColumns: {
        columns: [1],
        indicators: false
      },
      licenseKey: this.licensekey,

      beforeKeyDown: (event: KeyboardEvent) => {
        const hotInstance = this.hotRegisterer.getInstance(this.getCostEstimationHotId(index));

        if (!hotInstance) {
          return;
        }

        const selected = hotInstance.getSelectedLast();

        if (!selected) {
          return;
        }

        const row = selected[0];
        const col = selected[1];

        // Description = 2
        // Unit = 5
        if ((col !== 2 && col !== 5) || row < 0) {
          return;
        }

        this.activeCostRow = { row, column: col, accordionIndex: index };

        const ignoredKeys = [
          'Tab',
          'Escape',
          'Shift',
          'Control',
          'Alt',
          'Meta',
          'CapsLock',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'PageUp',
          'PageDown',
          'Home',
          'End'
        ];

        if (ignoredKeys.includes(event.key)) {
          return;
        }

        const shouldOpenLookup =
          event.key === 'Enter' ||
          event.key === 'F2' ||
          event.key.length === 1;

        if (!shouldOpenLookup) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        const currentValue = hotInstance.getDataAtCell(row, col);
        const searchText =
          event.key.length === 1
            ? event.key
            : String(currentValue || '');

        // ================= DESCRIPTION LOOKUP =================
        if (col === 2) {
          this.openCostItemLookupFromGrid(
            row,
            col,
            index,
            searchText
          );
        }

        // ================= UNIT LOOKUP =================
        if (col === 5) {
          this.openUnitLookupFromGrid(
            row,
            col,
            index,
            searchText
          );
        }
      },

      afterOnCellMouseDown: (
        event: MouseEvent,
        coords: Handsontable.wot.CellCoords
      ) => {
        if (!coords || coords.row < 0 || coords.col < 0) {
          return;
        }

        // Description = 2
        // Unit = 5
        if (coords.col !== 2 && coords.col !== 5) {
          return;
        }

        this.activeCostRow = {
          row: coords.row,
          column: coords.col,
          accordionIndex: index
        };

        if (event.detail !== 2) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const hotInstance = this.hotRegisterer.getInstance(
          this.getCostEstimationHotId(index)
        );

        const currentValue = hotInstance
          ? hotInstance.getDataAtCell(coords.row, coords.col)
          : '';

        // ================= DESCRIPTION LOOKUP =================
        if (coords.col === 2) {
          this.openCostItemLookupFromGrid(
            coords.row,
            coords.col,
            index,
            String(currentValue || '')
          );
        }

        // ================= UNIT LOOKUP =================
        if (coords.col === 5) {
          this.openUnitLookupFromGrid(
            coords.row,
            coords.col,
            index,
            String(currentValue || '')
          );
        }
      },

      afterChange: (
        changes: Handsontable.CellChange[] | null,
        source: string
      ) => {
        if (
          !changes ||
          source === 'loadData' ||
          source === 'calculation' ||
          source === 'cost-item-lookup'
        ) {
          return;
        }

        const item = this.quotationItems?.[index];

        if (!item) {
          return;
        }

        changes.forEach(([row, prop]) => {
          const rowIndex = Number(row);

          if (Number.isNaN(rowIndex)) {
            return;
          }

          if (prop === 'totalQuantity' || prop === 'unitRate') {
            this.calculateRowAmount(item, rowIndex);
          }
        });

        this.calculateItemCost(item);
        this.calculateItemSummary(item);
        this.validateAccordionTotal(item, false);
        this.syncQuotationItem(item);
      },

      cells: (row: number, col: number) => {
        const cellProperties: Partial<Handsontable.CellProperties> = {};
        const item = this.quotationItems?.[index];
        const rowData = item
          ? this.getCostEstimationDataset(item)[row]
          : null;

        const classes: string[] = [];

        if (rowData) {
          const desc = String(rowData.description || '')
            .toLowerCase()
            .trim();

          const isTotalRow =
            desc === 'total cost' ||
            desc === 'total amount' ||
            desc === 'rate per ton' ||
            desc === 'final rate per ton' ||
            desc === 'total amount for steel structure';

          if (isTotalRow) {
            classes.push('bold-hot-row');
          }
        } else {
          classes.push('empty-hot-row');
        }

        if (col === 0 || col === 1 || col === 5) {
          classes.push('htCenter');
        }

        if (col === 3 || col === 4 || col === 6) {
          classes.push('htRight');
        }

        cellProperties.readOnly = false;
        cellProperties.className = classes.join(' ');

        return cellProperties;
      }
    };

    this.costEstimationSettingsCache[index] = settings;

    return settings;
  }
  openCostDescriptionLookup(rowData: any, accordionIndex: number): void {
    this.openCostItemLookupFromGrid(
      this.getCostEstimationDataset(this.quotationItems?.[accordionIndex]).indexOf(rowData),
      this.costDescriptionColumnIndex,
      accordionIndex,
      rowData?.description || ''
    );
  }

  calculateRowAmount(item: any, rowIndex: number): void {
    const dataset = this.getCostEstimationDataset(item);
    const row = dataset?.[rowIndex];

    if (!row) {
      return;
    }

    const qty = this.toNumber(row.totalQuantity);
    const rate = this.toNumber(row.unitRate);
    row.totalAmount = this.roundAmount(qty * rate);
  }

  toNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    return Number(
      value
        .toString()
        .replace(/,/g, '')
        .replace('%', '')
        .trim()
    ) || 0;
  }

  trackByQuotationItem(index: number, item: any): any {
    return item?.customerQuotationItemId || item?.itemId || item?.customerQuotationDetailsId || index;
  }

  getItemHeader(item: any, index: number): string {
    const materialName =
      item?.materialname ||
      item?.materialName ||
      item?.itemDescription ||
      item?.description ||
      '';

    const cleanMaterialName = String(materialName).trim();

    if (!cleanMaterialName) {
      return '';
    }

    const idPart = ` (Sr # ${index + 1})`;

    return `Cost Breakdown for ${cleanMaterialName}${idPart}`;
  }

  onCostAccordionOpen(event: any): void {
    const index = event?.index;

    if (index === undefined || index === null) {
      return;
    }

    setTimeout(() => this.renderCostEstimationTable(index), 150);
  }

  private renderCostEstimationTable(index: number): void {
    const hotInstance = this.costEstimationRegisterer.getInstance(this.getCostEstimationHotId(index));

    if (hotInstance) {
      hotInstance.render();
      hotInstance.refreshDimensions();
    }
  }

  calculateItemCost(item: any): void {
    const dataset = this.getCostEstimationDataset(item);
    const finalRow = dataset.find((row: any) =>
      String(row?.description || '').toLowerCase().trim() === 'total amount for steel structure'
    );

    const grandTotal = finalRow
      ? this.toNumber(finalRow.remark || finalRow.totalAmount)
      : dataset.reduce((sum: number, row: any) => sum + this.toNumber(row?.totalAmount), 0);

    item.customerQuotationAmount = this.roundAmount(grandTotal);
    item.totalCostAmount = this.roundAmount(grandTotal);
  }

  // calculateItemSummary(item: any): void {
  //   const grandTotal = this.toNumber(item?.customerQuotationAmount || item?.totalCostAmount);
  //   const contingencyPercentage = this.toNumber(item?.customerQuotationContingencyPercentage);
  //   const ohAndProfitPercentage = this.toNumber(item?.customerQuotationOHAndProfitPercentage);
  //   const contingencyAmount = Math.max(grandTotal, 0) * contingencyPercentage / 100;
  //   const grossTotalAmount = Math.max(grandTotal, 0) + contingencyAmount;
  //   const ohAndProfitAmount = Math.max(grossTotalAmount, 0) * ohAndProfitPercentage / 100;
  //   const totalAmount = Math.max(grandTotal, 0) + contingencyAmount + ohAndProfitAmount;
  //   const ratePerTon = this.toNumber(item?.costEstimationRatePerTon);

  //   const finalRatePerTon = ratePerTon > 0 ? totalAmount / ratePerTon : 0;

  //   item.customerQuotationContingencyAmount = this.roundAmount(contingencyAmount);
  //   item.customerQuotationOHAndProfitAmount = this.roundAmount(ohAndProfitAmount);
  //   item.costEstimationGrossTotalAmount = this.roundAmount(grossTotalAmount);
  //   item.costEstimationNetAmount = this.roundAmount(totalAmount);
  //   item.costEstimationRatePerTon = this.roundAmount(ratePerTon);
  //   item.costEstimationFinalRatePerTon = this.roundAmount(finalRatePerTon);
  // }

  calculateItemSummary(item: any): void {
    const grandTotal = this.toNumber(item?.customerQuotationAmount || item?.totalCostAmount);

    const contingencyPercentage = this.toNumber(item?.customerQuotationContingencyPercentage);
    const ohAndProfitPercentage = this.toNumber(item?.customerQuotationOHAndProfitPercentage);

    // Contingency and OH & Profit are both percentages of Total Cost, not of Gross Amount
    const contingencyAmount = Math.max(grandTotal, 0) * contingencyPercentage / 100;
    const grossTotalAmount = Math.max(grandTotal, 0) + contingencyAmount;

    const ohAndProfitAmount = grossTotalAmount * (ohAndProfitPercentage / 100);

    const transportCharges = this.toNumber(item?.transport_charges);
    const designCharges = this.toNumber(item?.design_Charges);

    // Sub Total now includes transport/design charges
    const subTotal = Math.max(grandTotal, 0) + contingencyAmount + ohAndProfitAmount + transportCharges + designCharges;

    // Rate per Ton = Sub Total / quantity from the corresponding quotation details grid row
    const gridQty = this.getGridQtyForItem(item);
    const ratePerTon = gridQty > 0 ? subTotal / gridQty : 0;

    // Final Rate per Ton is entered manually by the user, not auto-calculated
    const finalRatePerTon = this.toNumber(item?.costEstimationFinalRatePerTon);

    // Net Amount = Final Rate per Ton x Quantity
    const netAmount = finalRatePerTon * gridQty;

    item.customerQuotationContingencyAmount = this.roundAmount(contingencyAmount);
    item.customerQuotationOHAndProfitAmount = this.roundAmount(ohAndProfitAmount);
    item.costEstimationGrossTotalAmount = this.roundAmount(grossTotalAmount);
    item.costEstimationSubTotal = this.roundAmount(subTotal);
    item.costEstimationNetAmount = this.roundAmount(netAmount);
    item.costEstimationRatePerTon = this.roundAmount(ratePerTon);
    item.costEstimationFinalRatePerTon = this.roundAmount(finalRatePerTon);

    this.syncQuotationItem(item);
  }

  /**
   * Looks up the quantity from the quotation details grid row
   * that corresponds to the given cost estimation item.
   */
  private getGridQtyForItem(item: any): number {
    if (!item || !Array.isArray(this.customerQuotationentryDataset)) {
      return 0;
    }

    const rowKey = item.__quotationItemKey;
    let rowIndex = rowKey
      ? this.customerQuotationentryDataset.findIndex(
        (row: any) => row?.__quotationItemKey === rowKey
      )
      : -1;

    if (rowIndex < 0 && item.itemId != null) {
      rowIndex = this.customerQuotationentryDataset.findIndex(
        (row: any) => Number(row?.item) === Number(item.itemId)
      );
    }

    if (rowIndex < 0) {
      return 0;
    }

    return this.toNumber(this.customerQuotationentryDataset[rowIndex]?.qty);
  }

  roundAmount(value: any): number {
    const numberValue = this.toNumber(value);
    return Number(numberValue.toFixed(2));
  }

  addCostRow(item: any): void {
    const dataset = this.getCostEstimationDataset(item);
    dataset.push(this.getEmptyCostRow(dataset.length));
    this.calculateItemCost(item);
    this.calculateItemSummary(item);
    this.validateAccordionTotal(item, false);
    this.syncQuotationItem(item);
  }

  removeCostRow(item: any, index: number): void {
    const dataset = this.getCostEstimationDataset(item);

    if (dataset.length > 1) {
      dataset.splice(index, 1);
      dataset.forEach((row: any, rowIndex: number) => row.slNo = rowIndex + 1);
    } else {
      dataset[0] = this.getEmptyCostRow(0);
    }

    this.calculateItemCost(item);
    this.calculateItemSummary(item);
    this.validateAccordionTotal(item, false);
    this.syncQuotationItem(item);
  }

  private syncQuotationItem(item: any): void {
    if (!item || !Array.isArray(this.quotationItems)) {
      return;
    }

    let index = this.quotationItems.indexOf(item);

    if (index === -1 && item) {
      const rowKey = item.__quotationItemKey;
      index = this.quotationItems.findIndex(
        (i: any) =>
          (rowKey && i?.__quotationItemKey === rowKey) ||
          (item.itemId != null && Number(i?.itemId) === Number(item.itemId))
      );
    }

    if (index === -1) {
      return;
    }

    this.quotationItems[index] = {
      ...this.quotationItems[index],
      ...item,
      totalQuantity: item.totalQuantity ?? 1,
      costEstimationQty: item.costEstimationQty ?? 1,
      customerQuotationAmount: this.roundAmount(item.customerQuotationAmount),
      totalCostAmount: this.roundAmount(item.totalCostAmount),
      costEstimationSubTotal: this.roundAmount(item.costEstimationSubTotal),
      costEstimationNetAmount: this.roundAmount(item.costEstimationNetAmount),
      costEstimationFinalRatePerTon: this.roundAmount(item.costEstimationFinalRatePerTon),
      costEstimationData: JSON.parse(JSON.stringify(item.costEstimationData || []))
    };

    this.updateQuotationGridPriceFromCostSubTotal(item);
  }

  private updateQuotationGridPriceFromCostSubTotal(item: any): void {
    if (!item || !Array.isArray(this.customerQuotationentryDataset)) {
      return;
    }

    const rowKey = item.__quotationItemKey;
    let rowIndex = rowKey
      ? this.customerQuotationentryDataset.findIndex(
        (row: any) => row?.__quotationItemKey === rowKey
      )
      : -1;

    if (rowIndex < 0 && item.itemId != null) {
      rowIndex = this.customerQuotationentryDataset.findIndex(
        (row: any) => Number(row?.item) === Number(item.itemId)
      );
    }

    if (rowIndex < 0) {
      return;
    }

    const finalRatePerTon = this.roundAmount(item?.costEstimationFinalRatePerTon || 0);
    this.customerQuotationentryDataset[rowIndex].price = finalRatePerTon;

    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    if (hotInstance) {
      hotInstance.setDataAtCell(rowIndex, 5, finalRatePerTon, 'cost-estimation-subtotal-sync');
    }

    this.ColumnSum();
  }

  validateAccordionTotal(item: any, showMessages: boolean = false): boolean {
    const dataset = this.getCostEstimationDataset(item);

    if (!item || dataset.length === 0) {
      return false;
    }

    const expectedTotal = dataset.reduce((sum: number, row: any) => {
      return sum + this.toNumber(row.totalAmount);
    }, 0);

    const summaryTotal = item.customerQuotationAmount != null
      ? this.toNumber(item.customerQuotationAmount)
      : this.toNumber(item.totalCostAmount || 0);

    const roundedExpected = this.roundAmount(expectedTotal);
    const roundedSummary = this.roundAmount(summaryTotal);

    if (roundedExpected > roundedSummary) {

      const itemIndex = this.quotationItems.indexOf(item);
      const header = this.getItemHeader(item, itemIndex);

      if (showMessages) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation',
          detail: `${header}: Detail row total cannot exceed the accordion summary total (${roundedSummary}).`
        });
      }

      return false;
    }

    if (roundedExpected !== roundedSummary) {

      const itemIndex = this.quotationItems.indexOf(item);
      const header = this.getItemHeader(item, itemIndex);

      if (showMessages) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation',
          detail: `${header}: Total Cost must equal the sum of row Total Amount values (${roundedExpected}).`
        });
      }

      return false;
    }

    return true;
  }

  selectedCostItemRow: any = null;
  selectedCostRowIndex: number = -1;
  selectedCostParentItem: any = null;

  openCostLookup(row: any, rowIndex: number, item: any): void {


    const accordionIndex = this.quotationItems?.indexOf(item) ?? -1;

    if (accordionIndex < 0) {
      return;
    }

    this.selectedCostItemRow = row;
    this.selectedCostRowIndex = rowIndex;
    this.selectedCostParentItem = item;
    this.openCostItemLookupFromGrid(rowIndex, this.costDescriptionColumnIndex, accordionIndex, row?.description || '');
  }

  focusNext(event: any): void {
    event.preventDefault();

    const inputs = Array.from(
      document.querySelectorAll('input:not([readonly]):not([disabled])')
    ) as HTMLElement[];

    const index = inputs.indexOf(event.target);

    if (index > -1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  }

  focusAddButton(event: any, rowIndex: number): void {
    event.preventDefault();

    const addButtons = document.querySelectorAll('.add-btn');

    if (addButtons[rowIndex]) {
      (addButtons[rowIndex] as HTMLElement).focus();
    }
  }

  setItemNetAmountValue(item: any): void {
    const netAmount = this.toNumber(item.costEstimationNetAmount);
    item.customerQuotationAmount = this.roundAmount(netAmount);
    item.totalCostAmount = this.roundAmount(netAmount);
    this.calculateItemSummary(item);
    this.syncQuotationItem(item);
  }



  resetReportTemplate() {
    this.reportTemplateValidationAttempted = false;
    this.reportTemplate = {
      quotationID: 0,
      serialNo: 0,
      reportHeader: '',
      reportDescription: '',
      boqImport: false,
      templateFileBytes: null,
      templateFileImage: null
    };
    this.resetReportTemplateFileState();
  }
  get currentQuotationId(): number {
    const id = this.customerQuotationFormGroup?.get('customerQuotationQId')?.value;
    return id ? parseInt(id, 10) : 0;
  }





  //report temp
  loadReportTemplates() {
    if (this.currentQuotationId === 0) return;

    this.procuremnetApi.getQuotationTemplateByQtnId(this.currentQuotationId).subscribe((res: any) => {
      if (res && res.valid) {
        this.reportTemplateList = res.result;
      }
    });
  }

  // saveReportTemplate() {
  //   if (this.currentQuotationId === 0) return;

  //   this.reportTemplateValidationAttempted = true;

  //   if (!this.validateReportTemplate()) {
  //     return;
  //   }

  //   const payload = {
  //     reportTempelateID: this.reportTemplate.reportTempelateID || 0,
  //     quotationID: this.currentQuotationId,
  //     serialNo: Number(this.reportTemplate.serialNo) || 0,
  //     reportHeader: this.reportTemplate.reportHeader,
  //     reportDescription: this.reportTemplate.boqImport ? '' : this.reportTemplate.reportDescription,
  //     boqImport: this.reportTemplate.boqImport,
  //     templateFileBytes: this.reportTemplate.templateFileBytes || null,
  //     templateFileImage: this.reportTemplate.templateFileImage || null,
  //     // TODO: modify this later - raw File objects added as-is, uploaded via onReportTemplateSelect
  //     files: this.reportTemplateFilesSnapshot
  //   };

  //   if (this.reportTemplate.reportTempelateID) {
  //     this.procuremnetApi.updateQuotationTemplate(payload).subscribe((res: any) => {
  //       if (res.valid) {
  //         this.loadReportTemplates();
  //         this.resetReportTemplate();
  //       } else {
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Validation',
  //           detail: res?.message || 'Unable to update report template. Please verify the entered values.',
  //         });
  //       }
  //     });
  //   } else {
  //     this.procuremnetApi.insertQuotationTemplate(payload).subscribe((res: any) => {
  //       if (res.valid) {
  //         this.loadReportTemplates();
  //         this.resetReportTemplate();
  //       } else {
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Validation',
  //           detail: res?.message || 'Unable to add report template. Please verify the entered values.',
  //         });
  //       }
  //     });
  //   }
  // }
saveReportTemplate(): void {
  if (this.currentQuotationId === 0) {
    return;
  }

  this.reportTemplateValidationAttempted = true;

  if (!this.validateReportTemplate()) {
    return;
  }


  // =====================================================
  // Existing payload - SAME PAYLOAD
  // =====================================================
  const payload = {
    reportTempelateID:
      this.reportTemplate.reportTempelateID || 0,

    quotationID:
      this.currentQuotationId,

    serialNo:
      Number(this.reportTemplate.serialNo) || 0,

    reportHeader:
      this.reportTemplate.reportHeader,

    reportDescription:
      this.reportTemplate.boqImport
        ? ''
        : this.reportTemplate.reportDescription,

    boqImport:
      this.reportTemplate.boqImport,

    templateFileBytes:
      this.reportTemplate.templateFileBytes || null,

    templateFileImage:
      this.reportTemplate.templateFileImage || null,
      VoucherNo:
        this.customerQuotationFormGroup.get('customerQuotationVoucherNo')?.value || '',
  };


  // =====================================================
  // Create FormData
  // =====================================================
  const formData = new FormData();


  // =====================================================
  // Add existing payload as JSON
  // =====================================================
  formData.append(
    'payload',
    JSON.stringify(payload)
  );


  // =====================================================
  // Add actual files separately
  // =====================================================
  const selectedTemplateFiles = this.getSingleReportTemplateFiles(
    (this.reportTemplateFilesSnapshot || [])
      .map((item) => item?.file)
      .filter((file): file is File => !!file)
  );

  if (selectedTemplateFiles.length > 0) {
    for (const file of selectedTemplateFiles) {
      formData.append(
        'files',
        file,
        file.name
      );
    }
  }
  // =====================================================
  // UPDATE
  // =====================================================
  if (this.reportTemplate.reportTempelateID) {

    this.procuremnetApi
      .updateQuotationTemplate(formData)
      .subscribe((res: any) => {

        if (res.valid) {

          this.loadReportTemplates();

          this.resetReportTemplate();

        }
        else {

          this.messageService.add({
            severity: 'error',
            summary: 'Validation',
            detail:
              res?.message ||
              'Unable to update report template. Please verify the entered values.'
          });

        }

      });

  }


  // =====================================================
  // INSERT
  // =====================================================
  else {

    this.procuremnetApi
      .insertQuotationTemplate(formData)
      .subscribe((res: any) => {

        if (res.valid) {

          this.loadReportTemplates();

          this.resetReportTemplate();

        }
        else {

          this.messageService.add({
            severity: 'error',
            summary: 'Validation',
            detail:
              res?.message ||
              'Unable to add report template. Please verify the entered values.'
          });

        }

      });
// this.procuremnetApi
//   .insertQuotationTemplate(formData)
//   .subscribe((res: any) => {
//     if (res.valid) {

//       // Get PDF Base64 string from API response
//     const base64String = res?.result?.templateFileImage;

// if (base64String) {

//   // Check if Base64 has data URI prefix
//   let mimeType = 'application/pdf';
//   let base64 = base64String;

//   if (base64String.includes(',')) {

//     const parts = base64String.split(',');

//     // Example:
//     // data:application/pdf;base64,JVBERi0...
//     // data:image/png;base64,iVBORw0KG...
//     const header = parts[0];
//     base64 = parts[1];

//     const mimeMatch = header.match(/data:(.*?);base64/);

//     if (mimeMatch) {
//       mimeType = mimeMatch[1];
//     }
//   }
//   else {

//     // No data URI prefix
//     // Detect file type from Base64 signature

//     if (base64String.startsWith('JVBERi0')) {
//       // PDF
//       mimeType = 'application/pdf';
//     }
//     else if (base64String.startsWith('iVBORw0KGgo')) {
//       // PNG
//       mimeType = 'image/png';
//     }
//     else if (base64String.startsWith('/9j/')) {
//       // JPG / JPEG
//       mimeType = 'image/jpeg';
//     }
//     else if (base64String.startsWith('R0lGOD')) {
//       // GIF
//       mimeType = 'image/gif';
//     }
//   }

//   // Convert Base64 to bytes
//   const byteCharacters = atob(base64);
//   const byteNumbers = new Array(byteCharacters.length);

//   for (let i = 0; i < byteCharacters.length; i++) {
//     byteNumbers[i] = byteCharacters.charCodeAt(i);
//   }

//   const byteArray = new Uint8Array(byteNumbers);

//   // Create Blob according to detected type
//   const blob = new Blob(
//     [byteArray],
//     { type: mimeType }
//   );

//   // Create URL
//   const url = window.URL.createObjectURL(blob);

//   // Create download link
//   const link = document.createElement('a');

//   link.href = url;

//   // Set file name according to type
//   if (mimeType === 'application/pdf') {
//     link.download = 'QuotationTemplate.pdf';
//   }
//   else if (mimeType === 'image/png') {
//     link.download = 'QuotationTemplate.png';
//   }
//   else if (mimeType === 'image/jpeg') {
//     link.download = 'QuotationTemplate.jpg';
//   }
//   else if (mimeType === 'image/gif') {
//     link.download = 'QuotationTemplate.gif';
//   }
//   else {
//     link.download = 'QuotationTemplate';
//   }

//   document.body.appendChild(link);
//   link.click();

//   document.body.removeChild(link);

//   // Cleanup
//   window.URL.revokeObjectURL(url);
// }

// // Reload templates
// this.loadReportTemplates();

// // Reset template form/tab
// this.resetReportTemplate();

//     }
//     else {

//       this.messageService.add({
//         severity: 'error',
//         summary: 'Validation',
//         detail:
//           res?.message ||
//           'Unable to add report template. Please verify the entered values.'
//       });

//     }

//   });
   }
}
  isSectionSerialNoEmpty(): boolean {
    const serialNo = Number(this.reportTemplate?.serialNo);
    return !Number.isFinite(serialNo) || serialNo <= 0;
  }

  private validateReportTemplate(): boolean {
    const sectionName = String(this.reportTemplate.reportHeader || '').trim();
    this.reportTemplate.reportHeader = sectionName;

    if (!sectionName) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Section Name is required.',
      });
      return false;
    }

    if (this.isSectionSerialNoEmpty()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Section Sr# is required.',
      });
      return false;
    }

    const currentTemplateId = Number(this.reportTemplate.reportTempelateID || 0);
    const currentSerialNo = Number(this.reportTemplate.serialNo);
    const duplicateSerialNoExists = (this.reportTemplateList || []).some(
      (item) =>
        Number(item?.serialNo) === currentSerialNo &&
        Number(item?.reportTempelateID || 0) !== currentTemplateId
    );

    if (duplicateSerialNoExists) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Section Sr# already exists. Please enter a unique serial number.',
      });
      return false;
    }

    return true;
  }

  editReportTemplate(item: ReportTemplateItem) {
    this.reportTemplate = { ...item };
  }
  onBoqImportChange() {
    if (this.reportTemplate.boqImport) {
      this.reportTemplate.reportDescription = '';
    }
  }

  deleteReportTemplate(templateId: number) {
    if (!templateId) return;

    // this.procuremnetApi.deleteQuotationTemplate(templateId).subscribe((res: any) => {
    //   if (res.valid) {
    //     this.loadReportTemplates();
    //   }
    // });
  }



  viewDescriptionFull(description: string) {
    if (!description) return;
    this.selectedFullDescription = description;
    this.displayDescriptionDialog = true;
  }

  addBoqReport(): void {
    // File storage is keyed on the saved quotation id (same rule as the Document tab).
    if (this.currentQuotationId === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Quotation',
        detail: 'Please save the Customer Quotation before importing a file.',
      });
      return;
    }

    // Import only applies when the section is in "description" mode.
    // if (this.reportTemplate.boqImport) {
    //   this.messageService.add({
    //     severity: 'warn',
    //     summary: 'Import Disabled',
    //     detail: 'Uncheck "Import" to attach a file to this section.',
    //   });
    //   return;
    // }

    this.resetReportTemplateFileState();
    this.reportTemplateFileDialogVisible = true;
  }

  reportTemplateUploadHandler(event: any): void {
    const quotationId = this.currentQuotationId;
    if (quotationId === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Quotation',
        detail: 'Please save the Customer Quotation before importing a file.',
      });
      return;
    }

    const files = this.getSingleReportTemplateFiles(
      this.reportTemplateFilesToUpload as File[]
    );
    if (!files.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No File',
        detail: 'Please choose at least one file to import.',
      });
      return;
    }

    for (const file of files) {
      this.processFileForTemplateBytes(file);
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file); // matches the .NET List<IFormFile> param, same as Document tab
    }

    this.isReportTemplateUploading = true;

    // NOTE: 'CQRT' = Customer Quotation Report Template module tag.
    // Confirm your backend accepts this value; otherwise fall back to 'CQ'.
    this.api.uploadDOCs(formData, quotationId, 'CQRT').subscribe({
      next: () => {
        this.isReportTemplateUploading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'File imported successfully.',
        });
        this.reportTemplateFilesToUpload = [];
        this.reportTemplateFileDialogVisible = false;
        this.loadReportTemplates();
      },
      error: () => {
        this.isReportTemplateUploading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Import Failed',
          detail: 'An error occurred while importing the file.',
        });
      },
    });
  }

  onReportTemplateSelect(event: any): void {
    const selectedFiles: File[] = event?.files || [];
    if (!selectedFiles.length) {
      return;
    }

    if (selectedFiles.length > 1 || this.reportTemplateFilesToUpload.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Only one template file can be uploaded.',
      });
    }

    if (this.reportTemplateFilesToUpload.length > 0) {
      return;
    }

    const file = selectedFiles[0];
    this.reportTemplateFilesToUpload = [file];
    // File's props (name, size, type, etc.) live on the prototype, so raw File objects serialize to {} - capture them explicitly instead
    this.reportTemplateFilesSnapshot = [{
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      lastModifiedDate: (file as any).lastModifiedDate,
      webkitRelativePath: (file as any).webkitRelativePath,
      file: file
    }];
    this.reportTemplateFileBytesMap = [];
    this.reportTemplate.templateFileBytes = null;
    this.reportTemplate.templateFileImage = null;
    this.processFileForTemplateBytes(file);
  }

  onReportTemplateRemove(event: any): void {
    const fileKey = this.getReportTemplateFileKey(event.file);
    this.reportTemplateFilesToUpload = this.reportTemplateFilesToUpload.filter(
      (f) => f !== event.file
    );
    this.reportTemplateFilesSnapshot = this.reportTemplateFilesSnapshot.filter(
      (snapshot) => this.getReportTemplateFileKey(snapshot.file) !== fileKey
    );
    this.reportTemplateFileBytesMap = this.reportTemplateFileBytesMap.filter(
      (entry) => entry.fileKey !== fileKey
    );
    this.syncReportTemplateFileBytes();
    if (this.reportTemplateFilesToUpload.length === 0) {
      this.reportTemplate.templateFileBytes = null;
      this.reportTemplate.templateFileImage = null;
    }
  }

  onReportTemplateClearFiles(): void {
    this.resetReportTemplateFileState(false);
  }

  // Wired to the "Clear" button next to "Import File"
  clearReportTemplateFile(): void {
    this.resetReportTemplateFileState();
    this.reportTemplateFileDialogVisible = false;
    // If you later persist a file reference on the template, also clear it here, e.g.:
    // this.reportTemplate.reportFilePath = '';
    // this.reportTemplate.reportFileName = '';
  }

  processFileForTemplateBytes(file: File): void {
    if (!file) return;
    const fileKey = this.getReportTemplateFileKey(file);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const result = e.target.result as string;
      if (result) {
        // Strip data:application/pdf;base64, prefix
        const base64Index = result.indexOf(';base64,');
        let base64String = result;
        if (base64Index !== -1) {
          base64String = result.substring(base64Index + 8);
        }
        const existingIndex = this.reportTemplateFileBytesMap.findIndex(
          (entry) => entry.fileKey === fileKey
        );
        if (existingIndex > -1) {
          this.reportTemplateFileBytesMap[existingIndex].bytes = base64String;
        } else {
          this.reportTemplateFileBytesMap.push({
            fileKey,
            bytes: base64String
          });
        }
        this.syncReportTemplateFileBytes();
      }
    };
    reader.readAsDataURL(file);

    this.convertPdfToImage(file).then((base64Image) => {
      this.reportTemplate.templateFileImage = base64Image;
    }).catch((err) => {
      console.error('Error converting PDF to image:', err);
    });
  }

  private getReportTemplateFileKey(file: File): string {
    if (!file) return '';
    return `${file.name}__${file.size}__${file.lastModified}`;
  }

  private getSingleReportTemplateFiles(files: File[]): File[] {
    const uniqueFiles = (files || []).filter((file, index, currentFiles) => {
      const fileKey = this.getReportTemplateFileKey(file);
      return !!fileKey && currentFiles.findIndex(
        (currentFile) => this.getReportTemplateFileKey(currentFile) === fileKey
      ) === index;
    });

    return uniqueFiles.slice(0, 1);
  }

  private resetReportTemplateFileState(clearUploaderControl: boolean = true): void {
    this.reportTemplateFilesToUpload = [];
    this.reportTemplateFilesSnapshot = [];
    this.reportTemplateFileBytesMap = [];
    this.reportTemplate.templateFileBytes = null;
    this.reportTemplate.templateFileImage = null;

    if (clearUploaderControl) {
      this.reportTemplateUploader?.clear();
    }
  }

  private syncReportTemplateFileBytes(): void {
    const bytesList = this.reportTemplateFileBytesMap
      .map((entry) => entry.bytes)
      .filter((bytes) => !!bytes);

    if (bytesList.length === 0) {
      this.reportTemplate.templateFileBytes = null;
      return;
    }

    this.reportTemplate.templateFileBytes =
      bytesList.length === 1 ? bytesList[0] : JSON.stringify(bytesList);
  }

  loadPdfJs(): Promise<any> {
    if ((window as any).pdfjsLib) {
      return Promise.resolve((window as any).pdfjsLib);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  convertPdfToImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file || (file.type !== 'application/pdf' && !file.name.endsWith('.pdf'))) {
        resolve(null);
        return;
      }
      this.loadPdfJs().then((pdfjsLib) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const typedarray = new Uint8Array(e.target.result);
          pdfjsLib.getDocument({ data: typedarray }).promise.then((pdf: any) => {
            pdf.getPage(1).then((page: any) => {
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              const renderContext = {
                canvasContext: context,
                viewport: viewport
              };

              page.render(renderContext).promise.then(() => {
                const imgDataUrl = canvas.toDataURL('image/png');
                const base64Index = imgDataUrl.indexOf(';base64,');
                let base64String = imgDataUrl;
                if (base64Index !== -1) {
                  base64String = imgDataUrl.substring(base64Index + 8);
                }
                resolve(base64String);
              }).catch((err: any) => reject(err));
            }).catch((err: any) => reject(err));
          }).catch((err: any) => reject(err));
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
      }).catch((err) => reject(err));
    });
  }

  viewReportTemplateFiles(): void {
    if (this.currentQuotationId === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Quotation',
        detail: 'Please save the Customer Quotation before viewing imported files.',
      });
      return;
    }

    this.reportTemplatePreviewUrl = null;
    this.reportTemplateSelectedFile = null;
    this.reportTemplateViewDialogVisible = true;
    this.fetchReportTemplateTree(this.currentQuotationId);
  }

  private fetchReportTemplateTree(quotationId: number): void {
    this.isReportTemplateTreeLoading = true;
    this.reportTemplateFiles = [];

    // NOTE: 'CQRT' must match the module tag used when importing (see upload handler).
    // If your backend stores under 'CQ', change both places to 'CQ'.
    this.masterapi.GetDocumentTree(quotationId, 'CQRT').subscribe(
      (res) => {
        this.isReportTemplateTreeLoading = false;

        if (res?.valid && res?.result) {
          const ports = environment.apiRootURL?.replace('api', 'pdfs');
          const documentNodes: TreeNode[] = res.result.map((doc: any) => ({
            key: `0-${doc.fileId}`,
            label: doc.fileName,
            data: `${ports}${doc.filePath}`,
            icon: 'pi pi-file-pdf',
          }));

          this.reportTemplateFiles = [
            {
              key: '0',
              label: 'Imported Files',
              data: 'Imported Files Folder',
              icon: 'pi pi-fw pi-folder',
              expanded: true,
              children: documentNodes,
            },
          ];
        }
      },
      () => {
        this.isReportTemplateTreeLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed to load imported files.',
        });
      }
    );
  }

  onReportTemplateNodeSelect(event: any): void {
    const fileUrl = event?.node?.data;
    // Skip the folder node (key '0'); only preview actual file leaves.
    if (fileUrl && event.node.key !== 0 && event.node.key !== '0') {
      this.reportTemplatePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        fileUrl + '#navpanes=0&scrollbar=0'
      );
    }
  }

  isReportTemplateChildNode(node: TreeNode): boolean {
    return this.reportTemplateFiles.some((parent) =>
      parent.children?.some((child) => child === node)
    );
  }

  onReportTemplateDeleteNode(node: TreeNode): void {

    this.reportTemplateViewDialogVisible = false;
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete this imported file?',
      accept: () => {
        const id: number = Number(node.key?.split('-')[1]);
        this.api.DeleteDocument(id).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Deleted Successfully',
            });
            // If the deleted file was being previewed, clear the preview.
            if (this.reportTemplateSelectedFile === node) {
              this.reportTemplatePreviewUrl = null;
              this.reportTemplateSelectedFile = null;
            }
            this.fetchReportTemplateTree(this.currentQuotationId);
          },
          () => {
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
  unitId?: number;
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

export interface ReportTemplateItem {
  reportTempelateID?: number;
  quotationID: number;
  serialNo: number;
  reportHeader: string;
  reportDescription: string;
  boqImport: boolean;
  templateFileBytes?: string | null;
  templateFileImage?: string | null;
}
export const columnDetailList = (component: CustomerquotatonAceComponent) => [
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
