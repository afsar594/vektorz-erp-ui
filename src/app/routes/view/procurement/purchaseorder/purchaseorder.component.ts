import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { FormBuilder, FormGroup } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import {
  SelectItem,
  MessageService,
  ConfirmationService,
  TreeNode,
} from 'primeng/api';
import { ChartofAccounts, CurrencyMaster } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { UserFile } from 'src/app/routes/domain/UserFile';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map, debounceTime, timeout } from 'rxjs/operators';
import { timer, Observable } from 'rxjs';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { ToWords } from 'to-words';
import * as CompanyData from 'src/assets/i18n/company.json';
import { GeneralSettings } from 'src/app/routes/domain/Settings/general';
import { VALID_FIELDS } from 'src/assets/i18n/pOFields';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { PurchaseOrder } from 'src/app/routes/domain/Procurements/PurchaseOrder';
import { PurchaseOrderDetails } from 'src/app/routes/domain/Procurements/PurchaseOrderDetails';
import { TranslateService } from '@ngx-translate/core';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ItemModifyComponent } from '../../sale/item-modify/item-modify.component';
import { DialogService } from 'primeng';
import { PurchaseRequisitionStatusComponent } from '../../storewarehouse/purchase-requisition-status/purchase-requisition-status.component';
import { PreviousRouteService } from 'src/app/routes/service/common/previous-route.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ImportApiService } from 'src/app/routes/service/import-api.service';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { DecimalConfigService } from 'src/app/routes/service/decimal-config.service';

@Component({
  selector: 'app-purchaseorder',
  templateUrl: './purchaseorder.component.html',
  styleUrls: ['./purchaseorder.component.scss'],
})
export class PurchaseorderComponent implements OnInit, AfterViewInit {
  @ViewChild('hotTable') hotTable: ElementRef;
  elementReference: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('suppCtrl', { static: false }) supplierCtrol: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;
  PurchaseorderFilterForm: FormGroup;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  isTemplate: boolean = false;
  private routeOrderLoadTimeout: any;
  private purchaseOrderLoadRequestId = 0;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  template: boolean = false;
  JOBCOST: Boolean = false;
  sum: number = 0;
  sumwordsnew: string;
  cName: string;
  cAddr: string;
  cTel: string;
  width = `100%`;
  cFax: string;
  isButtonDisabled: boolean = false;
  cEmail: string;
  displayPrintPreview: boolean = false;
  DefCurrency: string;
  DefCurCheck: string;
  DefCurArry: GeneralSettings = null;
  DefCurVariable: string;
  DefLocCheck: string;
  DefLocid: string;
  rptFilter: ReportFilterModel;
  pdfSource: any;
  pOVD: number = 0;
  pORefno: number = 0;
  pOCur: number = 0;
  poType: number = 0;
  pOSuply: number = 0;
  poNarr: number = 0;
  poJob: number = 0;
  polocation: number = 0;
  lookupGridColumns = [];
  dataList: Array<any> = [];
  showProcurementsLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;
  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];
  UserFileArray: UserFile[] = [];
  UserFileArry: string[] = [];
  UserFileList: SelectItem[];
  unitAry: any;
  unitListt: any;
  units: any;
  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  ItemMasterArrayByName: any = null;
  SupplierMasterArrayById: any = null;
  funitid: number;
  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];
  locationArray: LocationMaster[] = [];
  locationLocked = false;
  locationArry: string[] = [];
  locationList: SelectItem[];
  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];
  accountTransactionList: AccountsTransactions[] = [];
  purchaseOrderarry: PurchaseOrder[] = [];
  savedPurchaseOrder: PurchaseOrder;
  showAmountInWords: boolean = true;
  stationmasterObj: StationMaster;
  proformaInvoice: any;
  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  v_OPENCLOSE: SelectItem[];
  Ordertype: SelectItem[];
  currency: CurrencyMaster[] = [];
  displayMaximizabletemplate: boolean = false;
  displayMaximizabletemplateAdd: boolean = false;
  selectedCity: any;
  cities: any;
  allTemplates: any;
  templateTypeData: any[] = [];
  templatList: { label: string; value: string }[];
  templateType: any = 'header';
  headerTemplateValue: any = 'header';
  PIList: any;
  Permission: any;
  ScreenId: number;
  UpdateItem: any;
  Obj: ItemMaster;
  filterArray: any;
  POVoucherarry: any;
  loadList: any;
  brandArry: VendorMaster[] = [];

  currencyArray: any;
  voucherNo: any;
  selestedReq: any = [];
  approveStatus: any = '';
  user: any;
  vNo: any = '';
  VatCalculation: boolean = false;
  currentRow: number;
  selectedjob: any;
  pagedRequest: PagedRequest;
  uploadedDocs: any;
  vatvalue: number = 0;
  proRef = [];
  decimals: number = 2;
  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.v_typeList = [
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
    ];
    this.v_RoundoffList = [
      { label: '+', value: '+' },
      { label: '-', value: '-' },
    ];

    this.v_OPENCLOSE = [
      { label: '', value: '' },
      { label: 'OPEN', value: 'OPEN' },
      { label: 'CLOSE', value: 'CLOSE' },
    ];
    this.Ordertype = [
      { label: '', value: '' },
      { label: 'LOCAL', value: 'LOCAL' },
      { label: 'FOREIGN', value: 'FOREIGN' },
    ];
  }
  fromPO: boolean = true;
  uploadedFiles: any[] = [];

  files: TreeNode[] = [];
  selectedFile: TreeNode | null = null;
  itemList = [];
  clickedRowColumn = { row: -1, column: -1 };
  supplerwiseItem: boolean = false;
  // locationLocked: boolean = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private api: ImportApiService,
    private crystalReportService: CrystalReportService,
    public dialogService: DialogService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    private previousRouteService: PreviousRouteService,
    private procurementapi: ProcurementApiService,
    private sanitizer: DomSanitizer,
    private decimalConfig: DecimalConfigService,
    private storage: LocalStorageService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'purchaseorder_HotEntry';
  purchaseorder_entry: Handsontable.GridSettings;
  purchaseOrderFormGroup: FormGroup;
  purchaseorder_entryDataset = [];
  // accountTransactionDataset = [];
  isServerSearch = false;
  cols;
  ngAfterViewInit() { }

  ngOnInit(): void {
    this.decimals = this.decimalConfig.getDecimal();

    this.activeRow = { row: 0, column: 0 };
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.vNo = params['vNo'];
      this.approveStatus = params['s'];
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
      { label: 'Delivery', value: 'delivery' },
      { label: 'Notes', value: 'notes' },
      { label: 'Footer', value: 'footer' },
      { label: 'Payment Trems', value: 'paymentTrems' },
      { label: 'Subject', value: 'subject' },
      { label: 'Content', value: 'content' },
      { label: 'Remarks 1', value: 'remarks1' },
      { label: 'Remarks 2', value: 'remarks2' },
      { label: 'Remarks 3', value: 'remarks3' },
    ];
    this.FILL_COMBO();
    this.DefCurVariable = 'DEFAULTCURRENCY';

    this.cName = CompanyData?.companyName;
    this.cAddr = CompanyData?.companyAddress;
    this.cTel = CompanyData?.companyTele;
    this.cFax = CompanyData?.companyFax;
    this.cEmail = CompanyData?.companyEmail;

    this.cols = [
      { field: 'purchaseOrderNo', header: 'Voucher No' },
      { field: 'purchaseOrderDate', header: 'Date' },
      { field: 'purchaseOrderPartyId', header: 'Party' },
      { field: 'purchaseOrderCurrencyId', header: 'Currency' },
      {
        field: 'purchaseOrderDescription',
        header: 'Narration',
      },
      {
        field: 'purchaseOrderTotalGrossAmount',
        header: 'Gross.Amt',
        class: 'amount-col',
      },
      {
        field: 'purchaseOrderTotalDisAmount',
        header: 'Disc.Amt',
        class: 'amount-col',
      },
      { field: 'purchaseOrderVatAmt', header: 'Vat.Amt', class: 'amount-col' },
      // {
      //   field: 'purchaseOrderVatRoundSign',
      //   header: 'Round.Sign',

      // },
      // { field: 'purchaseOrderVatRountAmt', header: 'Round.Amt' },
      {
        field: 'purchaseOrderNetAmount',
        header: 'Net.Amt',
        class: 'amount-col',
      },
    ];
    this.isButtonDisabled = true;
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };

    this.initializeControls();
    this.purchaseOrderFormGroup = this.fb.group({
      purchaseOrderId: [0],
      purchaseOrderNo: [{ value: '', disabled: true }],

      purchaseOrderDate: [
        { value: null, disabled: true },
        [
          VALID_FIELDS.pOVoucherDate === 0
            ? Validators.required
            : Validators.nullValidator,
        ],
      ],
      purchaseOrderRefNo: [{ value: '', disabled: true }],
      purchaseOrderSupInvNo: [{ value: '', disabled: true }],
      purchaseOrderCurrencyId: [
        -1,
        [
          VALID_FIELDS.poCurrency === 0
            ? Validators.required
            : Validators.nullValidator,
        ],
      ],
      purchaseOrderExcludeVat: [{ value: false, disabled: true }],
      purchaseOrderType: [-1],
      purchaseOrderPartyId: ['', [DropDownValidator]],
      purchaseOrderPartyName: [{ value: '', disabled: true }],
      purchaseOrderPartyAddress: [{ value: '', disabled: true }],
      purchaseOrderPartyVatNo: [{ value: '', disabled: true }],
      purchaseOrderDescription: [{ value: '', disabled: true }], //[ VALID_FIELDS.poNarration === 0? Validators.required: Validators.nullValidator,  ], ],
      purchaseOrderGrno: [{ value: null, disabled: true }],
      purchaseOrderGrdate: [{ value: null, disabled: true }],
      purchaseOrderLpono: [{ value: null, disabled: true }],
      purchaseOrderLpodate: [{ value: null, disabled: true }],
      purchaseOrderQtnNo: [{ value: null, disabled: true }],
      purchaseOrderQtnDate: [{ value: null, disabled: true }],
      purchaseOrderPono: [{ value: null, disabled: true }],
      purchaseOrderBatchCode: [{ value: null, disabled: true }],
      purchaseOrderDayBookNo: [{ value: null, disabled: true }],
      purchaseOrderJobId: [-1],
      purchaseOrderLocationId: [-1],
      purchaseOrderStatus: [{ value: 'OPEN', disabled: true }],
      purchaseOrderOrdertype: [{ value: 'LOCAL', disabled: true }],
      purchaseOrderTotalGrossAmount: [{ value: [0], disabled: true }],
      purchaseOrderTotalItemDisAmount: [{ value: [0], disabled: true }],
      purchaseOrderTotalDisPer: [{ value: [0], disabled: true }],
      purchaseOrderTotalDisAmount: [{ value: [0], disabled: true }],
      purchaseOrderVatPer: [{ value: [0], disabled: true }],
      purchaseOrderVatAmt: [{ value: [0], disabled: true }],
      purchaseOrderTotalActualAmount: [{ value: [0], disabled: true }],
      purchaseOrderVatRoundSign: [{ value: '-', disabled: true }],
      purchaseOrderVatRountAmt: [{ value: [0], disabled: true }],
      purchaseOrderNetAmount: [{ value: [0], disabled: true }],
      purchaseOrderIndentNo: [{ value: null, disabled: true }],
      purchaseOrderContPerson: [{ value: null, disabled: true }],
      purchaseOrderPreparedBy: [{ value: null, disabled: true }],
      purchaseOrderRecommendedBy: [{ value: null, disabled: true }],

      // purchaseOrderApproveEnable: [-1, [DropDownValidator]],
      purchaseOrderApproveEnable: [{ value: null, disabled: true }], // change later
      purchaseOrderApproveDate: [{ value: null, disabled: true }],
      purchaseOrderApproveStatus: [-1],
      //  purchaseOrderApproveUserId: [-1, [DropDownValidator]],
      purchaseOrderApproveUserId: [{ value: null, disabled: true }], /// change later
      purchaseOrderHeader: [{ value: null, disabled: true }],
      purchaseOrderDelivery: [{ value: null, disabled: true }],
      purchaseOrderNotes: [{ value: null, disabled: true }],
      purchaseOrderFooter: [{ value: null, disabled: true }],
      purchaseOrderPaymentTerms: [{ value: null, disabled: true }],
      purchaseOrderSubject: [{ value: null, disabled: true }],
      purchaseOrderContent: [{ value: null, disabled: true }],
      purchaseOrderRemarks1: [{ value: null, disabled: true }],
      purchaseOrderRemarks2: [{ value: null, disabled: true }],
      purchaseOrderRemarks3: [{ value: null, disabled: true }],
      purchaseOrderDelivFromDate: [{ value: null, disabled: true }],
      purchaseOrderDelivToDate: [{ value: null, disabled: true }],
      purchaseOrderDelivStatus: [{ value: 'OPEN', disabled: true }],
      purchaseOrderDelivPlace: [{ value: null, disabled: true }],
      item: [{ value: null, disabled: true }],
      quoterefno: [{ value: null, disabled: true }],
    });
    this.PurchaseorderFilterForm = this.fb.group({
      purchaseorderjob: [null],
      isDate: [false],
      purchaseorderNo: [''],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.purchaseOrderFormGroup.disable();
    this.masterapi
      .GetGeneralSettingbyKey('LOAD_SUPPLIER_WISE_ITEM')
      .subscribe((data) => {
        if (data !== null) {
          var show = data.result[0]?.generalSettingsBoolValue;
          if (show == true) {
            this.supplerwiseItem = true;
          }
        }
      });
    if (!this.vNo) {
      this.LoadLocationDDL();
    }
    this.bykeys();
  }

  get f() {
    return this.purchaseOrderFormGroup.controls;
  }

  navigateBack(): void {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
    } else {
      // If there's no previous URL, navigate to a default route
      this.router.navigate(['/dashboard']);
    }
  }
  private parseFilterDate(rawDate: any): Date | null {
    if (!rawDate) return null;
    if (rawDate instanceof Date) {
      return isNaN(rawDate.getTime()) ? null : rawDate;
    }
    if (typeof rawDate === 'string') {
      const match = rawDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        const parsed = new Date(year, month, day);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }
    const d = new Date(rawDate);
    return isNaN(d.getTime()) ? null : d;
  }

  getCellValue(row: any, field: string): any {
    if (field === 'purchaseOrderPartyId') {
      return this.getSupplierName(row[field]);
    }
    if (field === 'purchaseOrderCurrencyId') {
      return this.getCurrencyName(row[field]);
    }
    if (field === 'purchaseOrderDate') {
      const rawDate =
        row.purchaseOrderDate ??
        row.purchaseorderdate ??
        row.PurchaseOrderDate ??
        row[field];
      const parsed = this.parseFilterDate(rawDate);
      return parsed ? parsed.toLocaleDateString() : (rawDate || '');
    }
    return row[field];
  }
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;

  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail,Hide_CostCenter_Detail')
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        const costCenterSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;
        setTimeout(() => {
          this.updateTableConfiguration();
        }, 1000);
      });
  }

  updateTableConfiguration() {
    const hiddenColumns = [1, 6, 8, 9, 10, 15, 16, 17, 18]; // Hide partNo, amt, grossAmt, vatPer, vatAmt, costcenter, id, conversionType, purchaseRequisitionId, BalQty
    if (this.hideJobDetail) {
      hiddenColumns.push(12);
    }
    if (this.hideCostCenterDetail) {
      hiddenColumns.push(14);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }
  initializeControls() {
    if (this.vNo) {
      this.callDropdowns(false);
    }

    const hiddenColumns = [1, 6, 8, 9, 10, 12, 14, 15, 16, 17, 18]; // Hide partNo, amt, grossAmt, vatPer, vatAmt, costcenter, id, conversionType, purchaseRequisitionId, BalQty

    this.purchaseorder_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns
    );

    // this.purchaseorder_entry.colHeaders = columnDetailList(this).map(col => this.translate.instant(col.label));

    this.purchaseorder_entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      this.clickedRowColumn = { row, column };
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      if (this.utilityService.isRowDisabled(row, hotInstance)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Notice',
          detail: 'Please fill the previous row first',
        });
        return;
      }
      // setting if prevent scrolling after selection
      this.currentRow = row;
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      if (column === 0 && this.purchaseorder_entry.readOnly === false) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item', 'ItemID'];
        this.dataList = this.itemSetLookup;
        hotInstance.deselectCell();
        this.onSearch('');
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 2 && this.purchaseorder_entry.readOnly === false) {
        var data = hotInstance.getDataAtRow(row);
        this.activeRow = { row, column };
        this.EditItem(data[2], data[0]);
      } else if (column === 3 && this.purchaseorder_entry.readOnly === false) {
        this.isServerSearch = false;
        this.lookupGridColumns = ['Unit', 'Unit ID'];

        var data = hotInstance.getDataAtRow(row);
        this.masterapi.GetUnitDetails(data[0]).subscribe((res) => {
          this.unitArray = res.result;
          this.dataList = this.unitSetLookup;
          const hot = this.hotRegisterer.getInstance(this.hotid);
          hot.deselectCell();
          this.showProcurementsLookUp = true;
          this.unitArry = res.result.map((ar) =>
            ar.unitMasterUnitShortName?.trim()
          );
        });

        this.activeRow = { row, column };
      } else if (column === 12 && this.purchaseorder_entry.readOnly === false) {
        this.isServerSearch = false;
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobsLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      } else {
        this.showProcurementsLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k?.procurements == x);
      } else {
        this.selectItem = {};
      }
    };
    this.purchaseorder_entry.afterChange = (changes, source) => {
      if (!changes || source === 'loadData' || (source as string) === 'scriptUpdate') {
        return;
      }
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (!hotinstance) return;

      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (prop === 'qty') {
          const prId = hotinstance.getDataAtRowProp(row, 'purchaseRequisitionId');
          const balQty = Number(hotinstance.getDataAtRowProp(row, 'BalQty')) || 0;
          const qty = Number(newValue) || 0;

          if (prId != null && prId != 0 && balQty > 0 && qty > balQty) {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: `PO Quantity Cannot Exceeds PR Quantity (${balQty})`,
            });
            hotinstance.setDataAtRowProp(row, 'qty', 0, 'scriptUpdate');
            hotinstance.setDataAtRowProp(row, 'grossAmt', 0, 'scriptUpdate');
            hotinstance.setDataAtRowProp(row, 'amt', 0, 'scriptUpdate');
            hotinstance.setDataAtRowProp(row, 'netAmt', 0, 'scriptUpdate');
            if (this.purchaseorder_entryDataset?.[row]) {
              this.purchaseorder_entryDataset[row].qty = 0;
              this.purchaseorder_entryDataset[row].grossAmt = 0;
              this.purchaseorder_entryDataset[row].amt = 0;
              this.purchaseorder_entryDataset[row].netAmt = 0;
            }
            this.ColumnSum();
          }
        }
      });
    };

    this.purchaseorder_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showProcurementsLookUp = false;
      if (change[0][1] === 0) {
        this.showProcurementsLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };
    this.purchaseorder_entry.beforeChangeRender = (changes, source) => {
      if (!changes || source === 'loadData' || (source as string) === 'scriptUpdate') {
        return;
      }

      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (!hotinstance) return;

      let hasCalculationChanges = false;

      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (prop === 'netAmt' || prop === 'grossAmt' || prop === 'amt') {
          return;
        }

        const itemId = hotinstance.getDataAtRowProp(row, 'itemId');
        const itemname = hotinstance.getDataAtRowProp(row, 'itemname');

        const isNumericInput =
          (prop === 'qty' || prop === 'rate' || prop === 'disc') &&
          newValue !== null &&
          newValue !== '' &&
          !isNaN(Number(newValue));

        // If the row has no item and this isn't a valid numeric edit, skip it completely
        if (!itemId && !itemname && !isNumericInput) {
          return;
        }

        let qty = parseFloat(hotinstance.getDataAtRowProp(row, 'qty')) || 0;
        let rate = parseFloat(hotinstance.getDataAtRowProp(row, 'rate')) || 0;
        let disc = parseFloat(hotinstance.getDataAtRowProp(row, 'disc')) || 0;

        if (prop === 'qty') qty = parseFloat(newValue) || 0;
        if (prop === 'rate') rate = parseFloat(newValue) || 0;
        if (prop === 'disc') disc = parseFloat(newValue) || 0;

        // If row is empty and quantities are 0, do not create or populate dataset row
        if (!itemId && !itemname && qty === 0 && rate === 0) {
          return;
        }

        const totalSum = qty * rate;
        const discValue = disc * qty;

        if (discValue > totalSum && totalSum > 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Discount must be less than net amount',
          });
          hotinstance.setDataAtRowProp(row, 'disc', 0, 'scriptUpdate');
          disc = 0;
        }

        const result = totalSum - (disc * qty);
        const gross = parseFloat(totalSum.toFixed(this.decimals));
        const net = parseFloat(result.toFixed(this.decimals));

        if (!this.purchaseorder_entryDataset) {
          this.purchaseorder_entryDataset = [];
        }
        if (!this.purchaseorder_entryDataset[row]) {
          this.purchaseorder_entryDataset[row] = {} as any;
        }

        this.purchaseorder_entryDataset[row].qty = qty;
        this.purchaseorder_entryDataset[row].rate = rate;
        this.purchaseorder_entryDataset[row].disc = disc;
        this.purchaseorder_entryDataset[row].grossAmt = gross;
        this.purchaseorder_entryDataset[row].amt = gross;
        this.purchaseorder_entryDataset[row].netAmt = net;

        hotinstance.setDataAtRowProp(row, 'grossAmt', gross, 'scriptUpdate');
        hotinstance.setDataAtRowProp(row, 'amt', gross, 'scriptUpdate');
        hotinstance.setDataAtRowProp(row, 'netAmt', net, 'scriptUpdate');
        hasCalculationChanges = true;
      });

      if (hasCalculationChanges) {
        this.ColumnSum();
      }
    };
    this.purchaseorder_entry.afterCreateRow = (
      index: number,
      amount: number
    ) => {};
    this.purchaseorder_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.itemList.splice(index, amount || 1);
      // Note: purchaseorder_entryDataset is bound by reference to HOT,
      // so HOT already spliced it before firing afterRemoveRow.
      this.ColumnSum();
    };

    this.purchaseorder_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  openSupplier() {
    this.control = this.f.purchaseOrderPartyId;
    this.elementReference = this.supplierCtrol;
    this.lookupGridColumns = ['Supplier', 'Supplier ID'];
    this.formControlLookUp = true;
    this.selectItem = {
      procurements: this.supplierCtrol.nativeElement.value,
      procurementsId: this.f.purchaseOrderPartyId.value,
    };
    this.dataList = this.supplierLookup;

    // this.purchaseOrderFormGroup.controls.purchaseOrderContPerson = this.dataList
  }
  ColumnSum() {
    let totalItemDisc = 0;
    let totalGrossAmt = 0;

    const hotInstance = this.hotRegisterer?.getInstance(this.hotid);
    const sourceData: any[] = hotInstance
      ? hotInstance.getSourceData()
      : this.purchaseorder_entryDataset;

    if (sourceData && Array.isArray(sourceData)) {
      sourceData.forEach((elemt: any) => {
        if (!elemt) return;

        const qty = Number(elemt.qty) || 0;
        const rate = Number(elemt.rate) || 0;
        const disc = Number(elemt.disc) || 0;

        if (
          elemt.itemId != null ||
          (elemt.itemname != null && elemt.itemname !== '') ||
          qty > 0
        ) {
          const lineGross = parseFloat((qty * rate).toFixed(this.decimals));
          const lineDisc = parseFloat((disc * qty).toFixed(this.decimals));
          const lineNet = parseFloat(
            (lineGross - lineDisc).toFixed(this.decimals)
          );

          elemt.grossAmt = lineGross;
          elemt.amt = lineGross;
          elemt.disc = disc;
          elemt.netAmt = lineNet;

          totalGrossAmt += lineGross;
          totalItemDisc += lineDisc;
        }
      });
    }

    totalItemDisc = parseFloat(totalItemDisc.toFixed(this.decimals));
    this.purchaseOrderFormGroup.controls.purchaseOrderTotalItemDisAmount.setValue(
      totalItemDisc
    );

    totalGrossAmt = parseFloat(totalGrossAmt.toFixed(this.decimals));
    this.purchaseOrderFormGroup.controls.purchaseOrderTotalGrossAmount.setValue(
      totalGrossAmt
    );

    this.GetTotal();
  }

  CalcDiscFromPer() {
    const rawValue = this.purchaseOrderFormGroup.getRawValue();
    const gross = Number(rawValue.purchaseOrderTotalGrossAmount) || 0;
    const disPer = Number(rawValue.purchaseOrderTotalDisPer) || 0;
    const disAmt = (gross * disPer) / 100;
    this.purchaseOrderFormGroup.controls.purchaseOrderTotalDisAmount.setValue(
      parseFloat(disAmt.toFixed(this.decimals))
    );
    this.GetTotal();
  }

  PurchaseRequisitionStatus() {

    const ref = this.dialogService.open(PurchaseRequisitionStatusComponent, {
      header: 'Purchase Requisition Status',
      width: '90%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {
        selectedJob: this.purchaseOrderFormGroup.value.purchaseOrderJobId,
        selectedReq: this.selestedReq,
        supplierlist: this.SupplierMasterList,
      },
      baseZIndex: 1,
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        const jobname = res[0].jobname;
        const jobNo = jobname?.split('--')[0]?.trim();
        this.purchaseOrderFormGroup.controls.purchaseOrderRefNo.setValue(jobNo);

        this.selestedReq.push(res);
        this.selectValue(res);
      }
    });
  }

  selectValue(evt: any[]) {
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    evt.forEach((k) => {
      const gross = (Number(k?.balQty) || 0) * (Number(k?.rate) || 0);
      const rowItem: any = {
        itemId: k?.matId,
        itemname: k?.item_Name,
        unit: k?.unit,
        qty: k?.balQty,
        rate: k?.rate,
        amt: parseFloat(gross.toFixed(this.decimals)),
        disc: 0,
        grossAmt: parseFloat(gross.toFixed(this.decimals)),
        netAmt: parseFloat(gross.toFixed(this.decimals)),
        purchaseRequisitionId: k.srid,
        BalQty: k.balQty,
      };

      if (!this.purchaseorder_entryDataset) {
        this.purchaseorder_entryDataset = [];
      }

      if (this.purchaseorder_entryDataset[this.activeRow.row]) {
        Object.assign(
          this.purchaseorder_entryDataset[this.activeRow.row],
          rowItem
        );
      } else {
        this.purchaseorder_entryDataset[this.activeRow.row] = rowItem;
      }
      this.activeRow.row += 1;
    });

    if (hotInstance) {
      hotInstance.updateSettings({ data: this.purchaseorder_entryDataset });
    }

    this.purchaseOrderFormGroup.controls.purchaseOrderCurrencyId.setValue(
      evt[0]?.prCurrId
    );
    const supplierId = evt[0]?.prSupplierId;

    this.purchaseOrderFormGroup.controls.purchaseOrderDelivery.setValue(
      evt[0]?.confirmationEmailDetails
    );
    this.purchaseOrderFormGroup.controls.purchaseOrderPaymentTerms.setValue(
      evt[0]?.paymentTerms
    );
    this.purchaseOrderFormGroup.controls.purchaseOrderDelivPlace.setValue(
      evt[0]?.deliveryTerms
    );
    this.purchaseOrderFormGroup.controls.purchaseOrderNotes.setValue(
      evt[0]?.deliverySite
    );
    this.purchaseOrderFormGroup.controls.purchaseOrderDescription.setValue(
      evt[0]?.notes
    );

    if (supplierId !== null && supplierId !== undefined) {
      const selectedSupplier = this.SupplierMasterList?.find(
        (k) => k?.value === supplierId
      );
      const supplierLabel = selectedSupplier?.label ?? '';
      if (this.supplierCtrol?.nativeElement) {
        this.supplierCtrol.nativeElement.value = supplierLabel;
      }
      this.purchaseOrderFormGroup.controls.purchaseOrderPartyId.setValue(
        supplierId
      );
    }

    this.purchaseOrderFormGroup.controls.purchaseOrderJobId.setValue(
      evt[0]?.jobid
    );

    this.ColumnSum();
  }

  CalcDiscFromAmt() {
    const rawValue = this.purchaseOrderFormGroup.getRawValue();
    const gross = Number(rawValue.purchaseOrderTotalGrossAmount) || 0;
    const disAmt = Number(rawValue.purchaseOrderTotalDisAmount) || 0;
    const disPer = gross > 0 ? (disAmt * 100) / gross : 0;
    this.purchaseOrderFormGroup.controls.purchaseOrderTotalDisPer.setValue(
      parseFloat(disPer.toFixed(this.decimals))
    );
    this.GetTotal();
  }

  CalcVatFromAmt() {
    const rawValue = this.purchaseOrderFormGroup.getRawValue();
    const actualAmt = Number(rawValue.purchaseOrderTotalActualAmount) || 0;
    const vatAmt = Number(rawValue.purchaseOrderVatAmt) || 0;
    const vatPer = actualAmt > 0 ? (vatAmt * 100) / actualAmt : 0;
    this.purchaseOrderFormGroup.controls.purchaseOrderVatPer.setValue(
      parseFloat(vatPer.toFixed(this.decimals))
    );
    this.GetTotal();
  }

  zerovat() {
    if (this.f.purchaseOrderExcludeVat.value) {
      this.purchaseOrderFormGroup.controls.purchaseOrderVatPer.setValue(0);
      this.GetTotal();
    } else {
      this.purchaseOrderFormGroup.controls.purchaseOrderVatPer.setValue(
        this.vatvalue
      );
      this.GetTotal();
    }
  }

  GetTotal($event = null) {
    const formValues = this.purchaseOrderFormGroup.getRawValue();

    const totalGrossAmount =
      parseFloat((Number(formValues.purchaseOrderTotalGrossAmount) || 0).toFixed(this.decimals));
    const totalitemDisAmount =
      parseFloat((Number(formValues.purchaseOrderTotalItemDisAmount) || 0).toFixed(this.decimals));

    // 1. Resolve bill discount amount from percentage (if set)
    let TotalDisAmount = parseFloat((Number(formValues.purchaseOrderTotalDisAmount) || 0).toFixed(this.decimals));
    const totalDisPer = Number(formValues.purchaseOrderTotalDisPer) || 0;

    if (totalDisPer > 0) {
      TotalDisAmount = totalGrossAmount === 0
        ? 0
        : parseFloat(((totalGrossAmount * totalDisPer) / 100).toFixed(this.decimals));
      this.purchaseOrderFormGroup.controls.purchaseOrderTotalDisAmount.setValue(
        TotalDisAmount
      );
    }

    // 2. VATable amount = gross - item discounts - bill discount
    const totalActualAmount = parseFloat(
      Math.max(0, totalGrossAmount - totalitemDisAmount - TotalDisAmount).toFixed(this.decimals)
    );

    this.purchaseOrderFormGroup.controls.purchaseOrderTotalActualAmount.setValue(
      totalActualAmount.toFixed(this.decimals)
    );

    // 3. VAT on the reduced base
    const isExcludeVat = !!formValues.purchaseOrderExcludeVat;
    const vatPercentage = isExcludeVat
      ? 0
      : Number(formValues.purchaseOrderVatPer) || 0;
    const vatAmount = parseFloat(
      ((totalActualAmount * vatPercentage) / 100).toFixed(this.decimals)
    );

    this.purchaseOrderFormGroup.controls.purchaseOrderVatAmt.setValue(
      vatAmount.toFixed(this.decimals)
    );

    // 4. Net = actualAmount + vat ± round (bill discount already deducted)
    const vatRoundSign = formValues.purchaseOrderVatRoundSign || '-';
    const vatRoundAmount = parseFloat((Number(formValues.purchaseOrderVatRountAmt) || 0).toFixed(this.decimals));

    let netAmount = totalActualAmount + vatAmount;
    if (vatRoundSign === '+') {
      netAmount += vatRoundAmount;
    } else if (vatRoundSign === '-') {
      netAmount -= vatRoundAmount;
    } else {
      this.purchaseOrderFormGroup.controls.purchaseOrderVatRoundSign.setValue('-');
    }

    netAmount = parseFloat(netAmount.toFixed(this.decimals));

    this.purchaseOrderFormGroup.controls.purchaseOrderNetAmount.setValue(
      netAmount.toFixed(this.decimals)
    );

    // Convert net amount to words safely
    try {
      if (netAmount > 0) {
        const toWords = new ToWords();
        this.sumwordsnew = toWords.convert(netAmount, { currency: true });
      } else {
        this.sumwordsnew = '';
      }
    } catch (e) {
      this.sumwordsnew = '';
    }
  }

  public getCurrencyName(id: number): string {
    return this.currencyList?.find((j) => j?.value === id)?.label;
  }

  LoadSupplierDDL() {
    this.utilityService.LoadDropdownSuppliersMaster().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.suppliersMaster) {
        this.SupplierMasterArray = this.loadList.suppliersMaster;

        this.SupplierMasterList = this.loadList.suppliersMaster.map(
          (kl: any) => ({
            label: kl.suppliersMasterSupplierName,
            value: kl.suppliersMasterSupplierId,
          })
        );
        this.SupplierMasterList.unshift({
          label: '--Select Supplier--',
          value: -1,
        });
        this.SupplierMasterArry = this.loadList.suppliersMaster.map(
          (ar: any) =>
            ar.suppliersMasterSupplierName?.trim() +
            '|' +
            ar.suppliersMasterSupplierId
        );
      }
    });
  }

  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.unitMasters) {
        this.units = this.loadList.unitMasters;
        this.unitList = this.loadList.unitMasters;
        this.unitListt = this.loadList.unitMasters.map((kl: any) => ({
          label: kl?.unitMasterUnitShortName,
          value: kl.unitMasterUnitId,
        }));
        this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
        this.unitArry = this.loadList.unitMasters.map((ar: any) =>
          ar?.unitMasterUnitShortName?.trim()
        );
      }
    });
  }

  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.jobMasters) {
        this.jobArray = this.loadList.jobMasters;
        this.jobList = this.loadList.jobMasters.map((kl: any) => ({
          label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
          value: kl.jobMasterJobId,
        }));
        this.jobList.unshift({ label: '--Select Job--', value: -1 });
        this.jobArry = this.loadList.jobMasters.map((ar) =>
          ar.jobMasterJobName?.trim()
        );
      }
    });
  }

  LoadCurrencyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.currencyMasters) {
        this.currencyArray = this.loadList.currencyMasters;
        this.currencyList = this.loadList.currencyMasters.map((kl: any) => ({
          label: kl.currencyMasterCurrencyName,
          value: kl.currencyMasterCurrencyId,
        }));
        this.currencyList.unshift({
          label: '--Select Currency--',
          value: -1,
        });
        this.currArry = this.loadList.currencyMasters.map((ar: any) =>
          ar.currencyMasterCurrencyName?.trim()
        );
      }
    });
  }

  LoadLocationDDL() {
    this.utilityService.LoadDropdownLocationMaster().subscribe((r: any) => {
      this.loadList = r?.resultSet ?? {};
      const list = r?.resultSet?.locationMaster ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({
        label: '--Select Location--',
        value: -1,
      });
      this.locationArry = list.map((ar: any) =>
        ar.locationMasterLocationName?.trim()
      );
      this.locationLocked = this.utilityService.applyLocationLock(
        this.purchaseOrderFormGroup,
        'purchaseOrderLocationId'
      );
    });
  }

  LoadAccountSettingDDL() {
    this.utilityService.LoadDropdownaccountsSettings().subscribe((r: any) => {
      if (this.loadList.masterAccountsTables) {
        this.accountArray = this.loadList.masterAccountsTables;
      }
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  public getSupplierMasterName(Id: number): string {
    return this.SupplierMasterArray?.find(
      (j) => j.suppliersMasterSupplierId === Id
    )?.suppliersMasterSupplierName;
  }

  getAllUnit() {
    this.masterapi.GetAllUnit().subscribe((k) => {
      this.units = k;
      this.unitListt = k.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = k.map((ar) => ar?.unitMasterUnitShortName?.trim());
    });
  }

  get supplierLookup() {
    return this.SupplierMasterList?.map((kl) => ({
      procurements: kl.label,
      procurementsId: kl.value,
    }));
  }

  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl.itemMasterItemName,
      procurementsId: kl.itemMasterItemId,
      barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
      // size: kl?.itemMasterItemSize,
      // brand: this.brandArry?.find(
      //   (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
      // )?.vendorMasterVendorName,
    }));
  }

  get itemIDSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl.itemMasterItemId,
      procurementsId: kl.itemMasterItemName,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      procurements: kl.unitMasterUnitShortName,
      procurementsId: kl.unitMasterUnitId,
    }));
  }

  savePurchaseOrder() {
    this.ColumnSum();
    this.purchaseOrderFormGroup.markAllAsTouched();

    const savedData: any = this.purchaseorder_entryDataset?.filter((k) =>
      k?.hasOwnProperty('itemname')
    );
    const purchaseOrder_Save: PurchaseOrder = this.purchaseOrderFormGroup
      .value as PurchaseOrder;

    purchaseOrder_Save.purchaseOrderId = Number(
      this.purchaseOrderFormGroup.value.purchaseOrderId
    );

    purchaseOrder_Save.purchaseOrderNo =
      this.purchaseOrderFormGroup.getRawValue().purchaseOrderNo;
    purchaseOrder_Save.purchaseOrderDate =
      this.purchaseOrderFormGroup.value.purchaseOrderDate;
    purchaseOrder_Save.purchaseOrderRefNo =
      this.purchaseOrderFormGroup.value.purchaseOrderRefNo;
    purchaseOrder_Save.purchaseOrderSupInvNo =
      this.purchaseOrderFormGroup.value.purchaseOrderSupInvNo;
    purchaseOrder_Save.purchaseOrderCurrencyId =
      this.purchaseOrderFormGroup.value.purchaseOrderCurrencyId;
    purchaseOrder_Save.purchaseOrderExcludeVat =
      this.purchaseOrderFormGroup.value.purchaseOrderExcludeVat;
    purchaseOrder_Save.purchaseOrderStatus =
      this.purchaseOrderFormGroup.value.purchaseOrderStatus;

    purchaseOrder_Save.purchaseOrderType =
      this.purchaseOrderFormGroup.value.purchaseOrderType;
    //purchaseOrder_Save.purchaseOrderType = 'CASH';

    purchaseOrder_Save.purchaseOrderPartyId =
      this.purchaseOrderFormGroup.value.purchaseOrderPartyId;
    purchaseOrder_Save.purchaseOrderPartyName =
      this.purchaseOrderFormGroup.value.purchaseOrderPartyName;
    purchaseOrder_Save.purchaseOrderPartyName = this.getSupplierName(
      this.purchaseOrderFormGroup.value.purchaseOrderPartyId
    );
    purchaseOrder_Save.purchaseOrderPartyAddress =
      this.purchaseOrderFormGroup.value.purchaseOrderPartyAddress;
    purchaseOrder_Save.purchaseOrderPartyVatNo =
      this.purchaseOrderFormGroup.value.purchaseOrderPartyVatNo;
    purchaseOrder_Save.purchaseOrderDescription =
      this.purchaseOrderFormGroup.value.purchaseOrderDescription;

    purchaseOrder_Save.purchaseOrderGrno =
      this.purchaseOrderFormGroup.value.purchaseOrderGrno;
    purchaseOrder_Save.purchaseOrderGrdate =
      this.purchaseOrderFormGroup.value.purchaseOrderGrdate;
    purchaseOrder_Save.purchaseOrderLpono =
      this.purchaseOrderFormGroup.value.purchaseOrderLpono;
    purchaseOrder_Save.purchaseOrderLpodate =
      this.purchaseOrderFormGroup.value.purchaseOrderLpodate;
    purchaseOrder_Save.purchaseOrderQtnNo =
      this.purchaseOrderFormGroup.value.purchaseOrderQtnNo;
    purchaseOrder_Save.purchaseOrderQtnDate =
      this.purchaseOrderFormGroup.value.purchaseOrderQtnDate;

    purchaseOrder_Save.purchaseOrderPono =
      this.purchaseOrderFormGroup.value.purchaseOrderPono;
    purchaseOrder_Save.purchaseOrderBatchCode =
      this.purchaseOrderFormGroup.value.purchaseOrderBatchCode;
    purchaseOrder_Save.purchaseOrderDayBookNo =
      this.purchaseOrderFormGroup.value.purchaseOrderDayBookNo;

    purchaseOrder_Save.purchaseOrderLocationId =
      this.purchaseOrderFormGroup.get('purchaseOrderLocationId')?.value;
    purchaseOrder_Save.purchaseOrderJobId =
      this.purchaseOrderFormGroup.value.purchaseOrderJobId ?? -1;

    purchaseOrder_Save.purchaseOrderTotalGrossAmount = Number(
      this.purchaseOrderFormGroup.value.purchaseOrderTotalGrossAmount
    );
    purchaseOrder_Save.purchaseOrderTotalItemDisAmount = Number(
      this.purchaseOrderFormGroup.value.purchaseOrderTotalItemDisAmount
    );
    purchaseOrder_Save.purchaseOrderTotalDisPer = Number(
      this.purchaseOrderFormGroup.value.purchaseOrderTotalDisPer
    );
    purchaseOrder_Save.purchaseOrderTotalDisAmount = Number(
      this.purchaseOrderFormGroup.value.purchaseOrderTotalDisAmount
    );
    purchaseOrder_Save.purchaseOrderVatPer = Number(
      this.purchaseOrderFormGroup.value.purchaseOrderVatPer
    );
    purchaseOrder_Save.purchaseOrderVatAmt = Number(
      this.purchaseOrderFormGroup.value.purchaseOrderVatAmt
    );
    purchaseOrder_Save.purchaseOrderTotalActualAmount = Number(
      this.purchaseOrderFormGroup.value.purchaseOrderTotalActualAmount
    );
    purchaseOrder_Save.purchaseOrderVatRoundSign =
      this.purchaseOrderFormGroup.value.purchaseOrderVatRoundSign;
    //purchaseOrder_Save.purchaseOrderVatRoundSign = '-';
    purchaseOrder_Save.purchaseOrderVatRountAmt = Number(
      this.purchaseOrderFormGroup.value.purchaseOrderVatRountAmt
    );
    purchaseOrder_Save.purchaseOrderNetAmount = Number(
      this.purchaseOrderFormGroup.value.purchaseOrderNetAmount
    );

    purchaseOrder_Save.purchaseOrderIndentNo =
      this.purchaseOrderFormGroup.value.purchaseOrderIndentNo;
    purchaseOrder_Save.purchaseOrderContPerson =
      this.purchaseOrderFormGroup.value.purchaseOrderContPerson;
    purchaseOrder_Save.purchaseOrderPreparedBy =
      this.purchaseOrderFormGroup.value.purchaseOrderPreparedBy;
    purchaseOrder_Save.purchaseOrderRecommendedBy =
      this.purchaseOrderFormGroup.value.purchaseOrderRecommendedBy;
    purchaseOrder_Save.purchaseOrderApproveEnable =
      this.purchaseOrderFormGroup.value.purchaseOrderApproveEnable;
    purchaseOrder_Save.purchaseOrderApproveDate =
      this.purchaseOrderFormGroup.value.purchaseOrderApproveDate;
    purchaseOrder_Save.purchaseOrderApproveStatus =
      this.purchaseOrderFormGroup.value.purchaseOrderApproveStatus;
    purchaseOrder_Save.purchaseOrderApproveUserId =
      this.purchaseOrderFormGroup.value.purchaseOrderApproveUserId;
    purchaseOrder_Save.purchaseOrderHeader =
      this.purchaseOrderFormGroup.value.purchaseOrderHeader;
    purchaseOrder_Save.purchaseOrderDelivery =
      this.purchaseOrderFormGroup.value.purchaseOrderDelivery;
    purchaseOrder_Save.purchaseOrderNotes =
      this.purchaseOrderFormGroup.value.purchaseOrderNotes;
    purchaseOrder_Save.purchaseOrderFooter =
      this.purchaseOrderFormGroup.value.purchaseOrderFooter;
    purchaseOrder_Save.purchaseOrderPaymentTerms =
      this.purchaseOrderFormGroup.value.purchaseOrderPaymentTerms;
    purchaseOrder_Save.purchaseOrderSubject =
      this.purchaseOrderFormGroup.value.purchaseOrderSubject;
    purchaseOrder_Save.purchaseOrderContent =
      this.purchaseOrderFormGroup.value.purchaseOrderContent;
    purchaseOrder_Save.purchaseOrderRemarks1 =
      this.purchaseOrderFormGroup.value.purchaseOrderRemarks1;
    purchaseOrder_Save.purchaseOrderRemarks2 =
      this.purchaseOrderFormGroup.value.purchaseOrderRemarks2;
    purchaseOrder_Save.purchaseOrderRemarks3 =
      this.purchaseOrderFormGroup.value.purchaseOrderRemarks3;
    purchaseOrder_Save.purchaseOrderDelivFromDate =
      this.purchaseOrderFormGroup.value.purchaseOrderDelivFromDate;
    purchaseOrder_Save.purchaseOrderDelivToDate =
      this.purchaseOrderFormGroup.value.purchaseOrderDelivToDate;
    purchaseOrder_Save.purchaseOrderDelivStatus =
      this.purchaseOrderFormGroup.value.purchaseOrderDelivStatus;
    purchaseOrder_Save.purchaseOrderDelivPlace =
      this.purchaseOrderFormGroup.value.purchaseOrderDelivPlace;

    purchaseOrder_Save.purchaseOrderOrdertype =
      this.purchaseOrderFormGroup.value.purchaseOrderOrdertype;
    purchaseOrder_Save.quoterefno =
      this.purchaseOrderFormGroup.value.quoterefno;
    purchaseOrder_Save.item = this.purchaseOrderFormGroup.value.item;
    purchaseOrder_Save.accountsTransactions = [];
    purchaseOrder_Save.purchaseOrderDetails = savedData
      ?.filter((k) => k?.itemname != null && k?.netAmt != null)
      .map((k: GridData) => {
        return {
          purchaseOrderDetailsId: k?.id != null ? k?.id : 0,
          purchaseOrderDetailsNo:
            this.purchaseOrderFormGroup.getRawValue().purchaseOrderNo,

          PurchaseOrderId: Number(
            this.purchaseOrderFormGroup.value.purchaseOrderId
          ),
          purchaseOrderDetailsMatId: k.itemId,
          purchaseOrderDetailsQuantity: k?.qty,
          purchaseOrderDetailsDiscAmount: k?.disc ? k.disc : null,
          purchaseOrderDetailsRate: k?.rate,
          purchaseOrderDetailsItemName: k.itemname,
          purchaseOrderDetailsNetAmt: k?.netAmt,
          purchaseOrderDetailsGrossAmount:
            k?.grossAmt != null
              ? Number(k.grossAmt)
              : (Number(k?.qty || 0) * Number(k?.rate || 0)),
          purchaseOrderDetailsRemarks: k?.narration,
          purchaseOrderDetailsSno: 0,
          purchaseOrderDetailsUnitId:
            k?.unit != null && k?.unit !== ''
              ? this.units?.find(
                (j) => j.unitMasterUnitShortName?.trim() === k?.unit?.trim()
              ).unitMasterUnitId
              : null,
          purchaseOrderDetailsJobId:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                ?.value
              : null,
          purchaseOrderDetailsDelStatus: false,
          purchaseRequisitionId: k.purchaseRequisitionId ?? 0,
          purchaseOrderDetailsBalQty: k.qty <= k.BalQty ? k.BalQty - k.qty : 0,
        };
      });

    if (this.btnFlag.save) {
      this.saveVoucher(purchaseOrder_Save);
    } else {
      purchaseOrder_Save.accountsTransactions
        ?.filter((x) => x.accountsTransactionsTransSno != 0)
        .forEach((element, index, arry) => {
          arry[index].accountstransactionsDelStatus = true;
        });

      this.updateVoucher(purchaseOrder_Save);
    }
  }

  validateTotalDrCrAmounts(): boolean {
    const rawValue = this.purchaseOrderFormGroup.getRawValue();
    const gross = Number(rawValue?.purchaseOrderTotalGrossAmount) || 0;
    const itemDisc = Number(rawValue?.purchaseOrderTotalItemDisAmount) || 0;

    if (gross <= 0 && itemDisc <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    if (gross <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Gross Amount Is Zero',
      });
      return false;
    }

    return true;
  }

  saveVoucher(purchaseOrder_Save: PurchaseOrder) {
    if (this.purchaseOrderFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.procurementapi
              .InsertPurchaseOrder(purchaseOrder_Save)
              .subscribe(
                (data) => {
                  if (
                    data.message ==
                    'Approver Or Job not found for PurchaseOrder'
                  ) {
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Alert',
                      detail: data.message,
                    });
                    return;
                  }
                  if (data.error) {
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Alert',
                      detail:
                        data.message != null && data.message?.trim() !== ''
                          ? data.message
                          : data.exception,
                    });
                    return;
                  }
                  this.btnFlag = {
                    edit: true,
                    cancel: true,
                    save: false,
                    update: true,
                    delete: true,
                    new: true,
                  };
                  this.isPrintEnabled = false;
                  this.isEditEnabled = false;
                  this.savedPurchaseOrder = data.result;
                  this.userTrackingLog(
                    'Insert',
                    this.savedPurchaseOrder?.purchaseOrderNo
                  );
                  const poId =
                    data?.result?.purchaseOrderId ??
                    this.savedPurchaseOrder?.purchaseOrderId ??
                    purchaseOrder_Save.purchaseOrderId;
                  if (poId) {
                    this.GetSavedPurchaseOrderDetails(poId);
                  } else {
                    this.updateFormGrid(data.result);
                  }
                  if (data.valid) {
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Alert',
                      detail: data.message,
                    });
                  }
                },
                (err) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail: 'Purchase Order Save Failed',
                  });
                }
              );
          }
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.purchaseOrderFormGroup.markAllAsTouched();
      this.purchaseOrderFormGroup.markAsDirty();
    }
  }

  updateVoucher(purchaseOrder_Save: PurchaseOrder) {
    if (this.purchaseOrderFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.procurementapi
              .UpdatePurchaseOrder(purchaseOrder_Save)
              .subscribe(
                (data) => {
                  this.btnFlag = {
                    edit: true,
                    cancel: true,
                    save: false,
                    update: true,
                    delete: true,
                    new: true,
                  };
                  this.isPrintEnabled = false;
                  this.isEditEnabled = false;
                  this.savedPurchaseOrder = data?.result;
                  this.userTrackingLog(
                    'Updated',
                    this.savedPurchaseOrder?.purchaseOrderNo
                  );

                  const orderId =
                    data?.result?.purchaseOrderId ??
                    this.savedPurchaseOrder?.purchaseOrderId ??
                    purchaseOrder_Save.purchaseOrderId;
                  if (orderId) {
                    this.GetSavedPurchaseOrderDetails(orderId);
                  } else {
                    this.updateFormGrid(data.result);
                  }
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Alert',
                    detail: 'Purchase Order Updated Succesfully',
                  });
                },
                (err) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail: 'Purchase Order Update Failed',
                  });
                }
              );
          }
        },
      });
    } else {
      // const msg1 = 'Please fill mandatory fields';
      // const msg2 = 'Please fill Empyt Debit account details';
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.purchaseOrderFormGroup.markAllAsTouched();
      this.purchaseOrderFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  // getAllPurchaseOrder() {
  //   this.procurementapi.GetPurchaseOrder().subscribe((data) => {
  //     this.purchaseOrderarry = data.result;
  //     this.filterArray = data.result;
  //   });
  // }
  getAllPurchaseOrder() {
  this.procurementapi.GetPurchaseOrder().subscribe((data) => {
    const sorted = [...data.result].sort(
      (a: any, b: any) =>
        new Date(b.purchaseOrderDate).getTime() -
        new Date(a.purchaseOrderDate).getTime()
    );

    this.purchaseOrderarry = sorted;
    this.filterArray = sorted;
  });
}

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    ).maAccName;
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    )?.itemMasterItemName;
  }
  //====================
  public getSupplierName(SupplierId: any): string {
    if (SupplierId !== null) {
      return this.SupplierMasterArray?.find(
        (j) => j.suppliersMasterSupplierId === SupplierId
      )?.suppliersMasterSupplierName;
    } else {
      return null;
    }
  }
  public getSupplierVatNo(SupplierId: number): string {
    if (SupplierId !== null) {
      return this.SupplierMasterArray?.find(
        (j) => j.suppliersMasterSupplierId === SupplierId
      )?.suppliersMasterSupplierVatNo;
    } else {
      return null;
    }
  }

  public getSupplierContact(suppliersMasterSupplierId: number): string {
    if (suppliersMasterSupplierId !== null) {
      return this.SupplierMasterArray?.find(
        (j) => j.suppliersMasterSupplierId === suppliersMasterSupplierId
      )?.suppliersMasterSupplierContactPerson;
    } else {
      return null;
    }
  }

  public getSupplierTele(suppliersMasterSupplierId: number): string {
    if (suppliersMasterSupplierId !== null) {
      return this.SupplierMasterArray?.find(
        (j) => j.suppliersMasterSupplierId === suppliersMasterSupplierId
      )?.suppliersMasterSupplierTel1;
    } else {
      return null;
    }
  }
  public getSupplierAddress(suppliersMasterSupplierId: number): string {
    if (suppliersMasterSupplierId !== null) {
      return this.SupplierMasterArray?.find(
        (j) => j.suppliersMasterSupplierId === suppliersMasterSupplierId
      )?.suppliersMasterSupplierAddress;
    } else {
      return null;
    }
  }

  public getSupplierMobile(suppliersMasterSupplierId: number): string {
    if (suppliersMasterSupplierId !== null) {
      return this.SupplierMasterArray?.find(
        (j) => j.suppliersMasterSupplierId === suppliersMasterSupplierId
      )?.suppliersMasterSupplierMobile;
    } else {
      return null;
    }
  }
  public getSupplierEmail(suppliersMasterSupplierId: number): string {
    if (suppliersMasterSupplierId !== null) {
      return this.SupplierMasterArray?.find(
        (j) => j.suppliersMasterSupplierId === suppliersMasterSupplierId
      )?.suppliersMasterSupplierEmail;
    } else {
      return null;
    }
  }

  public getSupplierFax(suppliersMasterSupplierId: number): string {
    if (suppliersMasterSupplierId !== null) {
      return this.SupplierMasterArray?.find(
        (j) => j.suppliersMasterSupplierId === suppliersMasterSupplierId
      )?.suppliersMasterSupplierFax;
    } else {
      return null;
    }
  }
  //=============

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }
  public getJobName(unit: number): string {
    return this.jobList?.find((j) => j.value === unit)?.label;
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 12) {
      return Math.max(0, 12 - salesVoucherDetailsLength);
    } else {
      return;
    }
  }

  convertNumberToWordsWithDecimal(number: number): string {
    if (number == null) {
      return 'Invalid number';
    }

    const toWords = new ToWords();

    const [integerPart, decimalPart] = number.toFixed(this.decimals).split('.');

    const integerWords = toWords.convert(parseInt(integerPart, 10));
    const decimalWords = toWords.convert(parseInt(decimalPart || '0', 10));

    let result = `${integerWords}`;

    if (decimalWords !== 'zero') {
      result += ` point ${decimalWords}`;
    }

    return result;
  }

  new(loadDropdowns = true) {
    this.isTemplate = false;
    this.itemList = [];
    this.template = true;
    this.isPrintEnabled = true;
    this.isEditEnabled = true;
    this.isButtonDisabled = false;
    this.purchaseOrderFormGroup.reset();
    this.purchaseorder_entryDataset = [];
    this.activeRow = { row: 0, column: 0 };
    this.purchaseorder_entry.readOnly = false;
    this.selestedReq = [];
    this.purchaseorder_entry.disableVisualSelection = true;
    this.purchaseOrderFormGroup.controls.purchaseOrderVatRoundSign.setValue(
      '-'
    );
    this.files = [];
    this.purchaseOrderFormGroup.controls.purchaseOrderType.setValue('CREDIT');
    // this.purchaseOrderFormGroup.controls.purchaseOrderDelivStatus.setValue(
    //   'OPEN'
    // );
    this.purchaseOrderFormGroup.controls.purchaseOrderStatus.setValue('OPEN');
    this.purchaseOrderFormGroup.controls.purchaseOrderOrdertype.setValue(
      'LOCAL'
    );
    this.purchaseOrderFormGroup.controls.purchaseOrderApproveStatus.setValue(
      'OPEN'
    );

    this.purchaseOrderFormGroup.controls.purchaseOrderTotalGrossAmount.setValue(0);
    this.purchaseOrderFormGroup.controls.purchaseOrderTotalItemDisAmount.setValue(0);
    this.purchaseOrderFormGroup.controls.purchaseOrderTotalDisPer.setValue(0);
    this.purchaseOrderFormGroup.controls.purchaseOrderTotalDisAmount.setValue(0);
    this.purchaseOrderFormGroup.controls.purchaseOrderTotalActualAmount.setValue(0);
    this.purchaseOrderFormGroup.controls.purchaseOrderVatPer.setValue(
      this.VatCalculation ? this.vatvalue : 0
    );
    this.purchaseOrderFormGroup.controls.purchaseOrderVatAmt.setValue(0);
    this.purchaseOrderFormGroup.controls.purchaseOrderVatRoundSign.setValue('-');
    this.purchaseOrderFormGroup.controls.purchaseOrderVatRountAmt.setValue(0);
    this.purchaseOrderFormGroup.controls.purchaseOrderNetAmount.setValue(0);
    this.purchaseOrderFormGroup.controls.purchaseOrderExcludeVat.setValue(false);
    this.sumwordsnew = '';

    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ ...this.purchaseorder_entry, data: this.purchaseorder_entryDataset });
    //  this.hotRegisterer.getInstance(this.hotid).selectAll();
    //  this.hotRegisterer.getInstance(this.hotid).destroyEditor(false, true);
    //  this.hotRegisterer.getInstance(this.hotid).clear();
    //  this.hotRegisterer.getInstance(this.hotid).selectCell(0, 0);
    this.accountTransactionList = [];
    this.purchaseOrderFormGroup.get('purchaseOrderId').setValue(null);
    this.purchaseOrderFormGroup.get('purchaseOrderPartyId').setValue(-1);
    this.purchaseOrderFormGroup.get('purchaseOrderJobId').setValue(-1);
    this.purchaseOrderFormGroup.get('purchaseOrderCurrencyId').setValue(-1);
    this.purchaseOrderFormGroup.get('purchaseOrderLocationId').setValue(-1);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.updateTableConfiguration();
    if (loadDropdowns) {
      this.callDropdowns(false);
    }
    this.index = 0;
    this.purchaseOrderFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseOrderFormGroup,
      'purchaseOrderLocationId',
      this.locationLocked
    );
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.purchaseOrderFormGroup,
        'purchaseOrderLocationId'
      );
    }
    this.f.purchaseOrderNo.clearValidators();
    this.purchaseOrderFormGroup.updateValueAndValidity();

    this.f.purchaseOrderDate.setValue(new Date());
    this.elementReference.nativeElement.value = '';
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m: any) => {
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
          this.f.purchaseOrderCurrencyId.setValue(Number(this.DefCurrency));
        }
      }
      //location - now auto-selected from login localStorage
      // var DEFAULT_LOCATION = list?.filter(
      //   (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      // );

      // if (DEFAULT_LOCATION != null) {
      //   this.DefLocCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
      //   if (this.DefLocCheck !== null) {
      //     const splitText = this.DefLocCheck.split('::');
      //     this.DefLocid = splitText[1]?.trim();
      //     this.f.purchaseOrderLocationId.setValue(Number(this.DefLocid));
      //   }
      // }
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;

      this.JOBCOST = jobcal == true ? true : false;

      var VAT_Calculation = list?.filter(
        (a) => a.generalSettingsKeyValue == 'VAT_Calculation'
      );
      var vatcal = VAT_Calculation[0]?.generalSettingsBoolValue;
      if (vatcal == true) {
        this.VatCalculation = vatcal == true ? true : false;
      }

      const match = m.resultSet.optionSettings.optionsMasterType.match(/(\d+)/);
      if (match) {
        this.vatvalue = parseInt(match[0], 10);

        this.purchaseOrderFormGroup.controls.purchaseOrderVatPer.setValue(
          this.VatCalculation ? this.vatvalue : 0
        );
      }
    });
  }

  showMaximizableDialog(isTemplate = false) {
    this.isTemplate = isTemplate;
    if (isTemplate) {
      this.purchaseOrderLoadRequestId++;
    }
    this.callDropdowns(false, !isTemplate);
    this.displayMaximizable = true;
    this.getAllPurchaseOrder();
  }

  isPrintEnabled = true;
  isEditEnabled = false;
  updateFormGrid(purchaseorder_update: PurchaseOrder) {
    this.isPrintEnabled = purchaseorder_update?.isPrintEnabled ?? false;
    this.isEditEnabled = purchaseorder_update?.isEditEnabled ?? false;
    this.isButtonDisabled = true;
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: true,
    };
    this.purchaseOrderFormGroup.patchValue({
      purchaseOrderId: this.isTemplate
        ? null
        : purchaseorder_update?.purchaseOrderId,
      purchaseOrderNo: this.isTemplate
        ? ''
        : purchaseorder_update?.purchaseOrderNo,
      purchaseOrderDate: this.isTemplate
        ? new Date()
        : new Date(purchaseorder_update?.purchaseOrderDate),
      purchaseOrderRefNo: purchaseorder_update?.purchaseOrderRefNo,
      purchaseOrderSupInvNo: purchaseorder_update?.purchaseOrderSupInvNo,
      purchaseOrderCurrencyId: purchaseorder_update?.purchaseOrderCurrencyId,
      purchaseOrderExcludeVat: purchaseorder_update?.purchaseOrderExcludeVat,

      purchaseOrderType: purchaseorder_update?.purchaseOrderType,
      purchaseOrderPartyId: purchaseorder_update?.purchaseOrderPartyId,
      purchaseOrderPartyName: purchaseorder_update?.purchaseOrderPartyName,
      purchaseOrderPartyAddress:
        purchaseorder_update?.purchaseOrderPartyAddress,
      purchaseOrderPartyVatNo: purchaseorder_update?.purchaseOrderPartyVatNo,
      purchaseOrderDescription: purchaseorder_update?.purchaseOrderDescription,

      purchaseOrderGrno: purchaseorder_update?.purchaseOrderGrno,
      purchaseOrderGrdate: new Date(purchaseorder_update?.purchaseOrderGrdate),
      purchaseOrderLpono: purchaseorder_update?.purchaseOrderLpono,
      purchaseOrderLpodate: new Date(
        purchaseorder_update?.purchaseOrderLpodate
      ),
      purchaseOrderQtnNo: purchaseorder_update?.purchaseOrderQtnNo,
      purchaseOrderQtnDate: new Date(
        purchaseorder_update?.purchaseOrderQtnDate
      ),
      purchaseOrderOrdertype: purchaseorder_update?.purchaseOrderOrdertype,

      purchaseOrderPono: purchaseorder_update?.purchaseOrderPono,
      purchaseOrderBatchCode: purchaseorder_update?.purchaseOrderBatchCode,
      purchaseOrderDayBookNo: purchaseorder_update?.purchaseOrderDayBookNo,
      purchaseOrderLocationId: purchaseorder_update?.purchaseOrderLocationId,
      purchaseOrderJobId: purchaseorder_update?.purchaseOrderJobId,

      purchaseOrderTotalGrossAmount:
        purchaseorder_update?.purchaseOrderTotalGrossAmount != null
          ? purchaseorder_update?.purchaseOrderTotalGrossAmount.toFixed(
            this.decimals
          )
          : 0,
      purchaseOrderTotalItemDisAmount:
        purchaseorder_update?.purchaseOrderTotalItemDisAmount,
      purchaseOrderTotalDisPer: purchaseorder_update?.purchaseOrderTotalDisPer,
      purchaseOrderTotalDisAmount:
        purchaseorder_update?.purchaseOrderTotalDisAmount != null
          ? purchaseorder_update?.purchaseOrderTotalDisAmount
          : 0,
      purchaseOrderVatPer: purchaseorder_update?.purchaseOrderVatPer,
      purchaseOrderVatAmt:
        purchaseorder_update?.purchaseOrderVatAmt != null
          ? purchaseorder_update?.purchaseOrderVatAmt.toFixed(this.decimals)
          : 0,
      purchaseOrderTotalActualAmount:
        purchaseorder_update?.purchaseOrderTotalActualAmount != null
          ? purchaseorder_update?.purchaseOrderTotalActualAmount.toFixed(
            this.decimals
          )
          : 0,
      purchaseOrderVatRoundSign:
        purchaseorder_update?.purchaseOrderVatRoundSign,
      purchaseOrderVatRountAmt:
        purchaseorder_update?.purchaseOrderVatRountAmt != null
          ? purchaseorder_update?.purchaseOrderVatRountAmt
          : 0,
      purchaseOrderNetAmount:
        purchaseorder_update?.purchaseOrderNetAmount != null
          ? purchaseorder_update?.purchaseOrderNetAmount.toFixed(this.decimals)
          : 0,

      purchaseOrderIndentNo: purchaseorder_update?.purchaseOrderIndentNo,
      purchaseOrderContPerson: purchaseorder_update?.purchaseOrderContPerson,
      purchaseOrderPreparedBy: purchaseorder_update?.purchaseOrderPreparedBy,
      purchaseOrderRecommendedBy:
        purchaseorder_update?.purchaseOrderRecommendedBy,
      purchaseOrderApproveEnable:
        purchaseorder_update?.purchaseOrderApproveEnable,
      purchaseOrderApproveDate: new Date(
        purchaseorder_update?.purchaseOrderApproveDate
      ),
      purchaseOrderApproveStatus:
        purchaseorder_update?.purchaseOrderApproveStatus,
      purchaseOrderStatus: purchaseorder_update?.purchaseOrderStatus,

      purchaseOrderApproveUserId:
        purchaseorder_update?.purchaseOrderApproveUserId,
      purchaseOrderHeader: purchaseorder_update?.purchaseOrderHeader,
      purchaseOrderDelivery: purchaseorder_update?.purchaseOrderDelivery,
      purchaseOrderNotes: purchaseorder_update?.purchaseOrderNotes,
      purchaseOrderFooter: purchaseorder_update?.purchaseOrderFooter,
      purchaseOrderPaymentTerms:
        purchaseorder_update?.purchaseOrderPaymentTerms,
      purchaseOrderSubject: purchaseorder_update?.purchaseOrderSubject,
      purchaseOrderContent: purchaseorder_update?.purchaseOrderContent,
      purchaseOrderRemarks1: purchaseorder_update?.purchaseOrderRemarks1,
      purchaseOrderRemarks2: purchaseorder_update?.purchaseOrderRemarks2,
      purchaseOrderRemarks3: purchaseorder_update?.purchaseOrderRemarks3,
      purchaseOrderDelivFromDate: new Date(
        purchaseorder_update?.purchaseOrderDelivFromDate
      ),
      purchaseOrderDelivToDate: new Date(
        purchaseorder_update?.purchaseOrderDelivToDate
      ),
      purchaseOrderDelivStatus: purchaseorder_update?.purchaseOrderDelivStatus,
      purchaseOrderDelivPlace: purchaseorder_update?.purchaseOrderDelivPlace,
      quoterefno: purchaseorder_update?.quoterefno,
      item: purchaseorder_update?.item,
    });
    if (this.approveStatus == 'Approved') {
      this.purchaseOrderFormGroup.controls.purchaseOrderApproveEnable.setValue(
        true
      );
      this.purchaseOrderFormGroup.controls.purchaseOrderApproveUserId.setValue(
        this.user.userName
      );
    }
    if (this.supplierCtrol && this.supplierCtrol.nativeElement) {
      this.supplierCtrol.nativeElement.value = this.SupplierMasterList?.find(
        (k) => k?.value === purchaseorder_update?.purchaseOrderPartyId
      )?.label;
    }

    if (this.locationCtrol && this.locationCtrol.nativeElement) {
      this.locationCtrol.nativeElement.value = this.locationList?.find(
        (k) => k?.value === purchaseorder_update?.purchaseOrderLocationId
      )?.label;
    }

    this.accountTransactionList = purchaseorder_update?.accountsTransactions;
    const gridData: GridData[] = purchaseorder_update?.purchaseOrderDetails.map(
      (k) => {
        var UnitId: any = this.units?.find(
          (l) => l.unitMasterUnitId == k.purchaseOrderDetailsUnitId
        );
        let jobname =
          k.purchaseOrderDetailsJobId != null
            ? this.jobList?.find((l) => l.value == k?.purchaseOrderDetailsJobId)
              ?.label
            : null;
        const qty = Number(k?.purchaseOrderDetailsQuantity) || 0;
        const rate = Number(k?.purchaseOrderDetailsRate) || 0;
        const disc = Number(k?.purchaseOrderDetailsDiscAmount) || 0;
        const grossAmt =
          k?.purchaseOrderDetailsGrossAmount != null &&
          Number(k.purchaseOrderDetailsGrossAmount) > 0
            ? Number(k.purchaseOrderDetailsGrossAmount)
            : qty * rate;
        const itemDiscTotal = disc * qty;
        const netAmt =
          k?.purchaseOrderDetailsNetAmt != null
            ? Number(k.purchaseOrderDetailsNetAmt)
            : grossAmt - itemDiscTotal;

        return {
          itemId: k?.purchaseOrderDetailsMatId,
          // itemname: ItemId,
          itemname: k?.purchaseOrderDetailsItemName,
          unit: UnitId?.unitMasterUnitShortName,
          conversionType: UnitId?.unitDetailsConversionType,
          qty: qty,
          rate: rate,
          amt: parseFloat(grossAmt.toFixed(this.decimals)),
          disc: disc,
          grossAmt: parseFloat(grossAmt.toFixed(this.decimals)),
          netAmt: parseFloat(netAmt.toFixed(this.decimals)),
          costcenter: null,
          narration: k?.purchaseOrderDetailsRemarks,
          id: this.isTemplate ? 0 : k?.purchaseOrderDetailsId,
          jobname: jobname,
          purchaseRequisitionId: this.isTemplate
            ? 0
            : (k?.purchaseRequisitionId ?? 0),
          BalQty: this.isTemplate
            ? 0
            : (k?.purchaseOrderDetailsBalQty ?? 0) + qty,
        };
      }
    );

    this.purchaseorder_entryDataset = gridData;
    this.purchaseorder_entry.readOnly = !this.isTemplate;

    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    hotInstance.updateSettings({ data: gridData, readOnly: !this.isTemplate });
    hotInstance.selectCell(0, 4);

    this.ColumnSum();

    if (this.isTemplate) {
      this.purchaseOrderFormGroup.enable();
      this.purchaseOrderFormGroup.get('purchaseOrderStatus')?.setValue('OPEN');
      this.purchaseOrderFormGroup.get('purchaseOrderApproveStatus')?.setValue('OPEN');
      this.btnFlag = {
        edit: false,
        cancel: true,
        save: true,
        update: false,
        delete: false,
        new: false,
      };
      this.isPrintEnabled = true;
      this.isEditEnabled = true;
      this.isButtonDisabled = false;
    } else {
      this.purchaseOrderFormGroup.disable();
    }
    this.f.purchaseOrderNo.clearValidators();
    this.purchaseOrderFormGroup.updateValueAndValidity();
    this.cName = CompanyData?.companyName;
    this.cAddr = CompanyData?.companyAddress;
    this.cTel = CompanyData?.companyTele;
    this.cFax = CompanyData?.companyFax;
    this.cEmail = CompanyData?.companyEmail;

    // this.masterapi.GetAllStation().subscribe((data) => {
    //   if (data !== null) {
    this.cName = this.stationmasterObj.stationMasterStationName;
    this.cAddr = this.stationmasterObj.stationMasterAddress;
    this.cTel = this.stationmasterObj.stationMasterTele1;
    this.cEmail = this.stationmasterObj.stationMasterEmail;
    this.cFax = this.stationmasterObj.stationMasterFax;
    //   }
    // });
  }

  customUploadHandler(event: any): void {
    const id = this.savedPurchaseOrder.purchaseOrderId;
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

    this.api.uploadDOCs(formData, id, 'PO').subscribe({
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

  handleChange(e) {
    if (e.index == 0) {
      const isPurchaseOrderTab = e?.index === 0;

      if (isPurchaseOrderTab) {
        requestAnimationFrame(() => {
          const hotInstance = this.hotRegisterer.getInstance(this.hotid);

          if (hotInstance) {
            hotInstance.render();
          }
        });
      }
      // setTimeout(() => {
      //   const hot = this.hotRegisterer.getInstance(this.hotid);
      //   hot?.refreshDimensions();
      // }, 500);
    } else if (e.index == 2) {
      const poId = this.savedPurchaseOrder?.purchaseOrderId ?? this.purchaseOrderFormGroup.getRawValue().purchaseOrderId;
      if (poId) {
        this.fetchDocumentTree(poId);
      }
    }
  }

  callDropdowns(isRefresh = false, loadCurrentOrder = true) {
    if (isRefresh) this.utilityService.initializeAllStorage();

    clearTimeout(this.routeOrderLoadTimeout);

    this.GetDefaultSettings();
    this.LoadJobDDL();
    this.LoadUnitDDL();
    this.LoadLocationDDL();
    this.LoadSupplierDDL();
    this.LoadAccountSettingDDL();
    this.LoadCurrencyDDL();
    if (this.vNo && loadCurrentOrder) {
      this.routeOrderLoadTimeout = setTimeout(() => {
        this.GetSavedPurchaseOrderDetails(this.vNo);
      }, 2000);
    }
  }

  GetSavedPurchaseOrderDetails(id) {
    this.itemList = [];
    this.index = 0;
    const requestId = ++this.purchaseOrderLoadRequestId;
    // this.callDropdowns(faiuknklhihfyu lse);
    this.procurementapi.GetSavedPurchaseOrderDetails(id).subscribe(
      (data) => {
        if (requestId !== this.purchaseOrderLoadRequestId) {
          return;
        }
        if (data !== null) {
          const applyingTemplate = this.isTemplate;
          if (applyingTemplate) {
            this.new(false);
            this.isTemplate = true;
            this.displayMaximizable = false;
          }
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
            new: true,
          };
          this.isPrintEnabled = false;
          this.isEditEnabled = false;
          this.isButtonDisabled = true;
          this.accountTransactionList = data.result.accountsTransactions;
          this.updateFormGrid(data.result);
          this.isTemplate = false;
          this.savedPurchaseOrder = data.result;
          if (!applyingTemplate) {
            this.purchaseOrderFormGroup.disable();
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Purchase Order not found',
          });
        }
      },
      (err) => {
        if (requestId !== this.purchaseOrderLoadRequestId) {
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.purchaseOrderFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.procurementapi
          .DeletePurchaseOrder(this.savedPurchaseOrder)
          .subscribe(
            (data: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Purchase Order Deleted Succesfully',
              });
              this.userTrackingLog('Delete', data.result?.purchaseOrderNo);
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
    const rawVal = this.purchaseOrderFormGroup.getRawValue();
    const poId =
      this.savedPurchaseOrder?.purchaseOrderId ??
      rawVal.purchaseOrderId ??
      rawVal.purchaseOrderNo;
    if (poId) {
      this.GetSavedPurchaseOrderDetails(poId);
    } else {
      this.new();
    }
  }

  edit() {
    this.purchaseorder_entry.readOnly = false;
    this.isButtonDisabled = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.template = true;
    this.selestedReq = [];
    this.f.purchaseOrderNo.clearValidators();
    this.purchaseOrderFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseOrderFormGroup,
      'purchaseOrderLocationId',
      this.locationLocked
    );
    this.purchaseOrderFormGroup.controls.purchaseOrderNo.disable();
    this.purchaseOrderFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: false,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
    this.updateTableConfiguration();
    this.ColumnSum();
  }

  // HIDEPrintOnApproval() {
  //   this.masterapi.GetGeneralSettingbyKey('HIDE_DOCUMENT_PRINT_ON_APPROVAL').subscribe((res) => {
  //     const value = res.result[0].generalSettingsBoolValue
  //     if (value) {
  //       this.isPrintEnabled = true
  //     }
  //   }
  //   )

  // }
  Selecttemplate(type) {
    if (type == 'select') {
      this.displayMaximizabletemplate = true;
    } else {
      this.displayMaximizabletemplateAdd = true;
    }
    this.getTemplateBytype(this.templateType);
  }

  selectedtem(event) {
    this.templateType = event.value;

    this.getTemplateBytype(event.value);
  }

  getAllTemplates() {
    this.masterapi.getAllTemplates().subscribe((res: any) => {
      // this.allTemplates = res.result;
      this.allTemplates = res?.result;
      // .map((kl) => ({ label: kl.qtemplatesDescription, value: kl.qtemplatesDescription }));
    });
  }

  onTabChange(event) {
    // alert(event.value)
    // this.messageService.add({ severity: 'info', summary: 'Tab Expanded', detail: 'Index: ' + event.index });
    const type =
      event.index == 0
        ? 'header'
        : event.index == 1
          ? 'delivery'
          : event.index == 2
            ? 'notes'
            : event.index == 3
              ? 'footer'
              : event.index == 4
                ? 'paymentTrems'
                : event.index == 5
                  ? 'subject'
                  : event.index == 6
                    ? 'content'
                    : event.index == 7
                      ? 'remarks1'
                      : event.index == 8
                        ? 'remarks2'
                        : event.index == 9
                          ? 'remarks3'
                          : 'header';

    this.headerTemplateValue = type;
    this.templateType = type;
  }

  selectTypeValue() {
    this.displayMaximizabletemplateAdd = false;
  }
  items: any[] = [];
  selectedTemplateValue(Item) {
    if (this.templateType == 'header') {
      this.purchaseOrderFormGroup.controls.purchaseOrderHeader.setValue(Item);
    } else if (this.templateType == 'delivery') {
      this.purchaseOrderFormGroup.controls.purchaseOrderDelivery.setValue(Item);
    } else if (this.templateType == 'notes') {
      this.purchaseOrderFormGroup.controls.purchaseOrderNotes.setValue(Item);
    } else if (this.templateType == 'paymentTrems') {
      if (Array.isArray(Item)) {
        this.items.push(...Item);
      } else {
        this.items.push(Item);
      }
      this.purchaseOrderFormGroup.controls.purchaseOrderPaymentTerms.setValue(
        this.items.join('\n')
      );
    } else if (this.templateType == 'subject') {
      this.purchaseOrderFormGroup.controls.purchaseOrderSubject.setValue(Item);
    } else if (this.templateType == 'content') {
      this.purchaseOrderFormGroup.controls.purchaseOrderContent.setValue(Item);
    } else if (this.templateType == 'remarks1') {
      this.purchaseOrderFormGroup.controls.purchaseOrderRemarks1.setValue(Item);
    } else if (this.templateType == 'remarks2') {
      this.purchaseOrderFormGroup.controls.purchaseOrderRemarks2.setValue(Item);
    } else if (this.templateType == 'remarks3') {
      this.purchaseOrderFormGroup.controls.purchaseOrderRemarks3.setValue(Item);
    } else if (this.templateType == 'footer') {
      this.purchaseOrderFormGroup.controls.purchaseOrderFooter.setValue(Item);
    }
    this.displayMaximizabletemplateAdd = false;
  }

  getTemplateBytype(type) {
    this.masterapi.GetTemplateBytype(type).subscribe((res: any) => {
      this.templateTypeData = res?.result;
      // .map((kl) => ({ label: kl.qtemplatesDescription, value: kl.qtemplatesDescription }));
    });
  }
  public get IsValidGrid(): boolean {
    if (this.purchaseorder_entryDataset.length > 0) {
      // this.purchaseorder_entryDataset.forEach((value: GridData, index, arry) => {
      return Object.values(this.purchaseorder_entryDataset).some(
        (k: GridData) =>
          k?.itemname != null && k.netAmt != null && !(k.rate == null)
      );
      // });
    }
    return false;
  }

  //==============================HTML

  getPOReport() {
    this.rptFilter = {
      ReportName: 'PurchaseOrder',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from VR_PurchaseOrder where VR_PurchaseOrder.purchaseorderno ='${this.purchaseOrderFormGroup.getRawValue().purchaseOrderNo
        }'`,
      ],
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

  displayPrint() {
    this.displayPrintPreview = true;
  }

  getPIReport() {
    const fileName = String(new Date().valueOf());
    var css: string = `
  #customers {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
  border:  2px solid #85898ee0;

}

#customers td,
#customers th {
  border: 0px solid #ddd;
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

    // img {
    //     width: 120px;
    //     height: 120px;
    // }
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
    .page-footer {
      // position: running(footer); /* Use "fixed" for sticking on the last page */
      position: absolute;
  bottom: 0;
  width: 100%;
  height: 2.5rem;            /* Footer height */
}

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
  // border-top: 4px solid rgb(201, 204, 204);
  
}
.sp{
  margin-top: 10px;
}
`;
    var data = document.getElementById('print');
    // let html: any = document.getElementById('print');
    // this.printService.saveAsPDF(data, 'saleVoucherPDF');
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF', this.savedPurchaseOrder?.purchaseOrderNo);
  }

  userTrackingLog(type, Vno?: any) {
    let req = {
      page: 'Purchase Order Vouncher',
      // section: this.savedPurchaseOrder,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: Vno,
      vpType: 'Purchase Order Vouncher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  selectprocurements(evt) {
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    if (evt.job) {
      this.selectedjob = evt.job;

      if (this.activeRow.column !== 3) {
        hotInstance.setDataAtCell(this.activeRow.row, 12, evt.job);
      }
    } else {
      if (this.clickedRowColumn.column == 0) {
        if (this.itemList.includes(evt.procurementsId)) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Duplicate Entry',
            detail: `${evt.procurements} is already exists in this table`,
          });
          return;
        }

        this.itemList[this.clickedRowColumn.row] = evt.procurementsId;
      }

      let trimmedSales = evt.procurements?.trim();
      const includesPcs = this.units.some((unit) =>
        unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
      );
      if (includesPcs && this.unitArray.length != 0) {
        var UnitId: any = this.unitArray?.find(
          (l) => l.unitMasterUnitId == evt.procurementsId
        );
        hotInstance.setDataAtCell(
          this.activeRow.row,
          3,
          UnitId?.unitMasterUnitShortName
        );
        hotInstance.setDataAtCell(
          this.activeRow.row,
          5,
          UnitId?.unitDetailsRate
        );
      } else {
        hotInstance.setDataAtCell(
          this.activeRow.row,
          this.activeRow.column,
          evt.procurementsId
        );
        this.masterapi
          .GetItemMasterById({
            id: evt.procurementsId,
            customerId: this.purchaseOrderFormGroup.value.purchaseOrderPartyId,
          })
          .subscribe((k) => {
            this.ItemMasterArrayByName = k.resultSet?.itemMaster;
            const rowIdx = this.activeRow.row;
            const itemMaster = this.ItemMasterArrayByName;

            // Populate the dataset row so save filter finds 'itemname'
            if (!this.purchaseorder_entryDataset) {
              this.purchaseorder_entryDataset = [];
            }
            if (!this.purchaseorder_entryDataset[rowIdx]) {
              this.purchaseorder_entryDataset[rowIdx] = {} as any;
            }
            const dsRow = this.purchaseorder_entryDataset[rowIdx];
            dsRow.itemId = itemMaster?.itemMasterItemId;
            dsRow.itemname = itemMaster?.itemMasterItemName;

            hotInstance.setDataAtRowProp(rowIdx, 'itemname', itemMaster?.itemMasterItemName, 'scriptUpdate');

            if (itemMaster?.unitDetails) {
              const unitId = itemMaster.unitDetails?.unitDetailsUnitId;
              const unitLabel: string =
                unitId != null
                  ? this.unitListt?.find((l) => l.value == unitId)?.label
                  : null;
              const rate = itemMaster.unitDetails?.unitDetailsRate ?? 0;
              const conversionType = itemMaster.unitDetails?.unitDetailsConversionType;

              dsRow.unit = unitLabel;
              dsRow.rate = rate;
              dsRow.conversionType = conversionType;
              dsRow.qty = 0;
              dsRow.grossAmt = 0;
              dsRow.amt = 0;
              dsRow.netAmt = 0;

              hotInstance.setDataAtRowProp(rowIdx, 'itemId', itemMaster.itemMasterItemId, 'scriptUpdate');
              hotInstance.setDataAtRowProp(rowIdx, 'unit', unitLabel, 'scriptUpdate');
              hotInstance.setDataAtRowProp(rowIdx, 'rate', rate, 'scriptUpdate');
              hotInstance.setDataAtRowProp(rowIdx, 'conversionType', conversionType, 'scriptUpdate');
              hotInstance.selectCell(rowIdx, 4);
            }
            if (this.selectedjob) {
              hotInstance.setDataAtRowProp(rowIdx, 'jobname', this.selectedjob, 'scriptUpdate');
              dsRow.jobname = this.selectedjob;
            }
            // Reset numeric cells on HOT and recalculate totals
            hotInstance.setDataAtRowProp(rowIdx, 'qty', 0, 'scriptUpdate');
            hotInstance.setDataAtRowProp(rowIdx, 'grossAmt', 0, 'scriptUpdate');
            hotInstance.setDataAtRowProp(rowIdx, 'amt', 0, 'scriptUpdate');
            hotInstance.setDataAtRowProp(rowIdx, 'netAmt', 0, 'scriptUpdate');
            this.ColumnSum();
          });
      }
    }
    this.showProcurementsLookUp = false;
  }

  exit(evt) {
    this.showProcurementsLookUp = false;
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
    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
  }

  selectControl(evt) {
    this.control.setValue(evt.procurementsId);
    this.elementReference.nativeElement.value = evt.procurements;
    this.formControlLookUp = false;
    if (this.supplerwiseItem) {
      this.onSearch('');
    }
    this.masterapi.GetAllSupplierById(evt.procurementsId).subscribe((k) => {
      this.SupplierMasterArrayById = k.result;
      this.purchaseOrderFormGroup.controls.purchaseOrderContPerson.setValue(
        this.SupplierMasterArrayById?.suppliersMasterSupplierContactPerson
      );
      this.purchaseOrderFormGroup.controls.purchaseOrderPartyAddress.setValue(
        this.SupplierMasterArrayById?.suppliersMasterSupplierAddress
          ? this.SupplierMasterArrayById?.suppliersMasterSupplierAddress
          : ''
      );
      this.purchaseOrderFormGroup.controls.purchaseOrderPaymentTerms.setValue(
        this.SupplierMasterArrayById?.suppliersMasterSupplierPaymentTerms
          ? this.SupplierMasterArrayById?.suppliersMasterSupplierPaymentTerms
          : ''
      );

      this.purchaseOrderFormGroup.controls.purchaseOrderPartyVatNo.setValue(
        this.SupplierMasterArrayById?.suppliersMasterSupplierVatNo
      );
    });
  }

  hide(evt: boolean) {
    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
  }

  EditItem(name, id) {
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
          .setDataAtCell(this.activeRow.row, 2, res.Itemname);
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
                unitDetailsDescrption: res.unitDetailsDescrption,
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

  filter() {
    let filteredArray = this.filterArray;
    const poNo = this.PurchaseorderFilterForm.value.purchaseorderNo?.trim();
    if (poNo) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.purchaseOrderNo?.toUpperCase() === poNo.toUpperCase()
      );
    }

    const job = this.PurchaseorderFilterForm.value.purchaseorderjob;
    if (job != null && job !== '') {
      filteredArray = filteredArray?.filter(
        (res) => res.purchaseOrderJobId === job
      );
    }

    if (this.PurchaseorderFilterForm.value.isDate) {
      const fromDateVal = this.PurchaseorderFilterForm.value.fromDate;
      const toDateVal = this.PurchaseorderFilterForm.value.toDate;

      if (fromDateVal && toDateVal) {
        const fromDate = this.parseFilterDate(fromDateVal);
        const toDate = this.parseFilterDate(toDateVal);

        if (fromDate && toDate) {
          const fromTime = new Date(fromDate).setHours(0, 0, 0, 0);
          const toTime = new Date(toDate).setHours(23, 59, 59, 999);

          filteredArray = filteredArray?.filter((res) => {
            const rawDate =
              res.purchaseOrderDate ??
              res.purchaseorderdate ??
              res.PurchaseOrderDate;
            const vDate = this.parseFilterDate(rawDate);
            if (!vDate) return false;
            const vTime = vDate.getTime();
            return vTime >= fromTime && vTime <= toTime;
          });
        }
      }
    }
    this.purchaseOrderarry = filteredArray;
  }

  ClearFilter() {
    this.PurchaseorderFilterForm.reset();
    this.PurchaseorderFilterForm.patchValue({
      fromDate: new Date(),
      toDate: new Date(),
      isDate: false,
      purchaseorderNo: '',
      purchaseorderjob: null,
    });
    this.purchaseOrderarry = this.filterArray;
  }

  get jobsLookup() {
    return this.jobList.map((kl) => ({
      job: kl.label,
      jobId: kl.value,
    }));
  }

  fileAttachmentDialogVisibility: boolean = false;
  attachmentsToUploaded: any[] = [];

  showFileAttachmentDialog() {
    this.fileAttachmentDialogVisibility = true;
  }

  isChildNode(node: TreeNode): boolean {
    return this.files.some((parent) =>
      parent.children?.some((child) => child === node)
    );
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

            this.fetchDocumentTree(this.savedPurchaseOrder.purchaseOrderId);
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

  onSearch(term?: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
      supplier: this.supplerwiseItem
        ? this.purchaseOrderFormGroup.value.purchaseOrderPartyId
        : null,
    };
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        sales: kl?.itemMasterItemName,
        salesId: kl?.itemMasterItemId,
        barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
        size: kl?.itemMasterItemSize,
        brand: this.brandArry?.find(
          (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
        )?.vendorMasterVendorName,
      }));
      this.dataList = this.itemSetLookup;
    });
  }

  previewUrl: SafeResourceUrl | null = null;
  onNodeSelect(event: any): void {
    const fileUrl = event.node.data;
    if (fileUrl && event.node.key !== 0 && event.node.key !== '0') {
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        fileUrl + '#navpanes=0&scrollbar=0'
      );
    }
  }

  downloadAllDocuments() {
    const jobId = this.purchaseOrderFormGroup.value.purchaseOrderId;
    this.api
      .downloadAllFilesAsOnePdf(jobId, 'PO', {
        responseType: 'blob',
        observe: 'response' as 'body',
      })
      .subscribe((response: any) => {
        const blob = new Blob([response.body], { type: response.body.type });

        // Extract filename from content-disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${this.purchaseOrderFormGroup.value.purchaseOrderNo}`;

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

  fetchDocumentTree(jobId: any): void {
    this.previewUrl = '';
    this.masterapi.GetDocumentTree(jobId, 'PO').subscribe((res) => {
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

  fileImportDialogVisibility: boolean = false;
  attachmentsToImport: any[] = [];
  showImportFileDialog() {
    this.fileImportDialogVisibility = true;
    this.fetchFilesToImport();
  }

  documentListToImport: any[] = [];
  selectedDocumentsToTransfer: any[] = [];

  fetchFilesToImport(): void {
    this.documentListToImport = [];
    this.previewUrl = '';
    const poId = this.savedPurchaseOrder?.purchaseOrderId;
    const prId =
      this.savedPurchaseOrder?.purchaseOrderDetails?.[0]?.purchaseRequisitionId;
    this.masterapi
      .GetExcludedDocuments(prId, 'PR', poId, 'PO')
      .subscribe((res) => {
        if (res?.valid && res?.result) {
          const baseUrl = environment.apiRootURL?.replace('api', 'pdfs');

          this.documentListToImport = res.result.map((doc: any) => ({
            id: doc.fileId,
            name: doc.fileName,
            url: `${baseUrl}${doc.filePath}`,
          }));
        }
      });
  }

  onUploadSelectedFiles(): void {
    if (
      !this.selectedDocumentsToTransfer ||
      this.selectedDocumentsToTransfer.length === 0
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Selection',
        detail: 'Please select documents to upload.',
      });
      return;
    }

    const poId = this.savedPurchaseOrder?.purchaseOrderId;
    const prId =
      this.savedPurchaseOrder?.purchaseOrderDetails?.[0]?.purchaseRequisitionId;
    const prFileIds = this.selectedDocumentsToTransfer.map((doc) => doc.id);
    this.masterapi
      .importSelectedPRDocumentsToPO(prId, poId, prFileIds)
      .subscribe(
        (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Documents imported successfully.',
            });
            this.fileImportDialogVisibility = false;
            this.fetchDocumentTree(poId);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to import documents.',
            });
          }
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to import documents.',
          });
        }
      );
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

interface GridData {
  itemId?: any;
  partNo?: string;
  itemname?: string;
  unit?: string;
  qty?: any;
  rate?: number;
  amt?: number;
  disc?: number;
  BalQty?: number;
  grossAmt?: number;
  vatPer?: number;
  vatAmt?: number;
  netAmt?: number;
  narration?: string;
  jobname?: string;
  costcenter?: string;
  conversionType?: string;
  id?: number;
  purchaseRequisitionId: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}
export const columnDetailList = (component: PurchaseorderComponent) => [
  {
    data: 'itemId',
    type: 'numeric',
    label: 'Item Id',
    toolTip: 'Item Id',
    width: '59%;',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
  },
  {
    data: 'itemname',
    type: 'autocomplete',
    label: 'Item',
    toolTip: 'Item Name',
    source: (query, callback) => {
      callback(component.ItemMasterArry || []);
    },
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    toolTip: 'Unit Name',
    source: (query, callback) => {
      callback(component.unitArry || []);
    },
  },
  {
    data: 'qty',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'Qty',
    toolTip: 'Quantity',
    readOnly: false,
  },
  {
    data: 'rate',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'Rate',
    toolTip: 'Rate',
    readOnly: false,
  },
  {
    data: 'amt',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'Amt',
    toolTip: 'Amount',
    readOnly: false,
  },
  {
    data: 'disc',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'Disc.',
    toolTip: 'Discount',
    readOnly: false,
  },
  {
    data: 'grossAmt',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'Gross Amt',
    toolTip: 'Gross Amount',
  },
  {
    data: 'vatPer',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'VAT%.',
    toolTip: 'VAT Percentage',
  },
  {
    data: 'vatAmt',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'VAT.Amt',
    toolTip: 'VAT Amount',
  },
  {
    data: 'netAmt',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'Net.Amt',
    toolTip: 'Net Amount',
    readOnly: false,
  },
  {
    data: 'jobname',
    type: 'text',
    label: 'Job Name',
    toolTip: 'Job Name',
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    toolTip: 'Narration',
    readOnly: false,
  },
  {
    data: 'costcenter',
    type: 'dropdown',
    label: 'Cost Center',
    toolTip: 'Cost Center',
    source: component.costcenterArry,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
    toolTip: 'Purchase Order Detail ID',
  },
  {
    data: 'conversionType',
    type: 'numeric',
    label: 'Conversion Type',
    toolTip: 'Conversion Type',
  },
  {
    data: 'purchaseRequisitionId',
    type: 'numeric',
    label: 'PR ID',
    toolTip: 'Purchase Requisition ID',
  },
  {
    data: 'BalQty',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'Balance Qty',
    toolTip: 'Balance Quantity',
  },
];
