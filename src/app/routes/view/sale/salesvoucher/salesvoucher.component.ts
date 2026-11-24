  import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { ProformaInvoiceStatusComponent } from 'src/app/proforma-invoice-status/proforma-invoice-status.component';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { ChartofAccounts, CurrencyMaster } from 'src/app/routes/domain';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';

import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map } from 'rxjs/operators';
import { timer } from 'rxjs';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import {
  PagedRequest,
  SalesVoucher,
} from 'src/app/routes/domain/Sales/SalesVoucher';
import { SalesVoucherDetails } from 'src/app/routes/domain/Sales/SalesVoucherDetails';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { ToWords } from 'to-words';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { DatePipe } from '@angular/common';
import { LoginService } from 'src/app/routes/service/login.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ItemModifyComponent } from '../item-modify/item-modify.component';
import { DialogService } from 'primeng';
import { SalesOrderStatusComponent } from '../deliverynote/delivery-note/sales-order-status/sales-order-status.component';
import { TranslateService } from '@ngx-translate/core';
import { DelivertNoteComponent } from './delivery-note/delivert-note.component';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { debug } from 'console';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { ProgramSettings } from 'src/app/routes/domain/Settings/program';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';
import { ChargesService } from 'src/app/routes/service/charges.service';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { ProcurementService } from 'src/app/routes/service/procurement/procurement.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { ProformaInvoiceService } from 'src/app/routes/service/proformaInvoice/proforma-invoice.service';



@Component({
  selector: 'app-salesvoucher',
  templateUrl: './salesvoucher.component.html',
  styleUrls: ['./salesvoucher.component.scss'],
})
export class SalesvoucherComponent implements OnInit, AfterViewInit {
  lastPurchasePrices: any;
  lastSalesPrices: any;
  priceItemName: any;
  optionlist: any;
  optionlist2: any;
  optionlist3: any;
  Itemratevalue: boolean = false;
  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  PR: any[] = [];
  isDate: boolean = false;
  panelHeight: number = 8000;
  elementReference: ElementRef;
  @ViewChild('saleCtrl', { static: false }) salesmanCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('custCtrl', { static: false }) customerCtrol: ElementRef;
  @ViewChild('depaCtrl', { static: false }) departmentCtrol: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;

  confirmDropDatabaseDialogVisible = false;
  displayMaximizable2: boolean = false;

  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  sum: number = 0;
  browseBTN: boolean = false;
  rptFilter: ReportFilterModel;
  pdfSource: any;
  lookupGridColumns = [];
  dataList: Array<any> = [];
  showSalesLookUp: boolean = false;
  chargeMasterLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;
  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];
  currency: CurrencyMaster[] = [];
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];
  isTemplate: boolean = false;
  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;
  DefCostCenterCheck: String;
  DefCostCenterId: any;
  pagedRequest: PagedRequest;
  unitAry: any;
  unitListt: any;
  units: any;

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];
  CustomerMasterFilter: SelectItem[];
  DepartmentMasterArray: any[] = [];
  DepartmentMasterArry: string[] = [];
  DepartmentMasterList: SelectItem[];

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];

  ItemMasterArrayByName: any = null;
  funitid: number;

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  chargeArray: any[] = [];
  chargeList: any[] = [];
  chargeArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];

  salesVoucherarry: SalesVoucher[] = [];
  // savedSalesVoucherGridData: GridData[] = [];
  savedSalesVoucher: SalesVoucher;
  brandArry: VendorMaster[] = [];

  v_typeList: SelectItem[];
  v_vattypeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  displayPrintPreview: boolean = false;

  unitDetailsConversionTypeNumber: number = 1;
  unitDetailsUnitPrice: number = 1;
  wordamt: string;

  avgCostItemAmount: number = 0;
  displayProformaInvoiceStatus: boolean = false;
  isProformaModalOpen: boolean = false

  date: Date;
  maxVisibleRows: number = 10;
  userId: number;
  cashAccount: string;
  saleAccount: string;
  DiscountPaidAccount: string;
  stockLedgerAccount: string;
  goodsSoldAccount: string;
  vatPayableAccount: string;
  CostOfFinishedGoods: string;
  RoundOffAccount: string;
  currentRow: number = 0;
  displaybarCode: boolean = false;
  width = `40%`;
  partyDetails: any;
  vNo: string = '';
  cardAcc: any;
  matId: any;
  filterArray: any;
  Obj: any;
  UpdateItem: ItemMaster;
  dataset: any;
  defaultValue: any;
  user: any;
  pvslue: any = 0;
  unitDetailID: any;
  totalcostPrice: number = 0;
  voucherId: any;
  voucherNo: any;
  displayDialog: boolean = false;
  VATEXLUDE: boolean = false;
  vatvalue: number = 0;
  displayDialogPrice: boolean = false;
  itemList = [];
  PriceListData: any = [];
  salesChargesTotalAmount = 0;
  proformaInvoiceData: any;

  showDialog() {
    this.displayDialog = true;
  }
  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.v_typeList = [
      { label: '---Select---', value: '' },
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
      { label: 'CARD', value: 'CARD' },
    ];
    this.v_vattypeList = [
      { label: 'Local', value: 'Local' },
      { label: 'Export', value: 'Export' },
    ];

    this.v_RoundoffList = [
      { label: '+', value: '+' },
      { label: '-', value: '-' },
    ];
  }


  
  Permission: any;
  ScreenId: number;
  VatCalculation: Boolean = false;
  JOBCOST: Boolean = false;
  defaultLocationID = -1;
  profitNotApplicableLocationId = -1;
  isServerSearch = false;
  clickedRowColumn = { row: -1, column: -1 };
  printbtn: MenuItem[];
  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private crystalReportService: CrystalReportService,
    private chargesService: ChargesService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    public dialogService: DialogService,
    private printService: FileSaverService,
    private masterapi: MasterApiService,
    private utilityService: UtilityService,
    private accountapi: AccountApiService,
    public salesapi: SalesApiService,
    private permission: PermissionsService,
    private loginser: LoginService,
    private storage: LocalStorageService,
    private dateformat: ReportDateFormatService,
    private ngZone: NgZone,
    private procurementapi: ProcurementApiService,
    private proformainvoiceService: ProformaInvoiceService
  ) {
    this.licensekey = defaults.hotlicensekey;

    this.defaultLocationID = this.utilityService.getLockedLocationId();
    this.locationLocked = this.defaultLocationID > 0;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'salesvoucher_HotEntry';
  hotCid = 'salesCharges_HotEntry';
  salesvoucher_entry: Handsontable.GridSettings;
  salesCharges_entry: Handsontable.GridSettings;
  salesVoucherFormGroup: FormGroup;
  salesVoucherFilterForm: FormGroup;
  salesvoucher_entryDataset = [];
  salesCharges_entryDataset = [];
  locationLocked = false;
  // accountTransactionDataset = [];
  cols;
  ngAfterViewInit() {
    //this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
      this.stationmasterObj = this.permission.getStation();
console.log("stationmasterObj",this.stationmasterObj)
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
      } else {
        this.router.navigate(['/login']);
      }
    });

    this.FILL_COMBO();
    this.getReportType();
    this.cols = [
      { field: 'salesVoucherNo', header: 'Voucher No' },
      { field: 'salesVoucherDate', header: 'Date' },
      { field: 'salesVoucherPartyId', header: 'Party' },
      { field: 'salesVoucherCurrencyId', header: 'Currency' },
      // { field: 'salesVoucherDescription', header: 'Narration' },
      { field: 'salesVoucherTotalGrossAmount', header: 'Gross.Amt' },
      { field: 'salesVoucherTotalDisAmount', header: 'Disc.Amt' },
      { field: 'salesVoucherVatAmt', header: 'Vat.Amt' },
      // { field: 'salesVoucherVatRoundSign', header: 'Round.Sign' },
      { field: 'salesVoucherVatRountAmt', header: 'Round.Amt' },
      { field: 'salesVoucherNetAmount', header: 'Net.Amt' },
      { field: '', header: 'Action' },
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
    this.initializeSalesChargesControls();
    this.salesVoucherFormGroup = this.fb.group({
      salesVoucherId: [0],
      salesVoucherNo: [{ value: '', disabled: true }],
      salesVoucherDate: [
        { value: new Date(), disabled: true },
        [Validators.required],
      ],
      salesVoucherRefNo: [{ value: '', disabled: true }],
      salesVoucherContPerson: [{ value: '', disabled: true }],
      salesVoucherCurrencyId: [-1],
      salesVoucherExcludeVat: [{ value: false, disabled: true }],
      salesVoucherCostCenterId: [-1],
      salesVoucherType: [-1],
      salesVoucherVatType: [-1],
      salesVoucherPartyId: [-1, [DropDownValidator]],
      salesVoucherPartyName: [{ value: '', disabled: true }],
      salesVoucherPartyAddress: [{ value: '', disabled: true }],
      salesVoucherPartyVatNo: [{ value: '', disabled: true }],
      // salesVoucherDescription: [{ value: '', disabled: true }, [Validators.required]],
      salesVoucherDescription: [{ value: '', disabled: true }],

      salesVoucherDlvNo: [{ value: null, disabled: true }],
      salesVoucherDlvDate: [{ value: null, disabled: true }],
      salesVoucherSono: [{ value: null, disabled: true }],
      salesVoucherSodate: [{ value: null, disabled: true }],
      salesVoucherQtnNo: [{ value: null, disabled: true }],
      salesVoucherQtnDate: [{ value: null, disabled: true }],
      salesVoucherSalesManId: [-1],
      salesVoucherDptId: [-1],
      salesVoucherEnqNo: [{ value: null, disabled: true }],

      salesVoucherHeader: [{ value: null, disabled: true }],
      salesVoucherDelivery: [{ value: null, disabled: true }],
      salesVoucherNotes: [{ value: null, disabled: true }],
      salesVoucherFooter: [{ value: null, disabled: true }],
      salesVoucherPaymentTerms: [{ value: null, disabled: true }],
      salesVoucherSubject: [{ value: null, disabled: true }],
      salesVoucherContent: [{ value: null, disabled: true }],
      salesVoucherRemarks1: [{ value: null, disabled: true }],
      salesVoucherRemarks2: [{ value: null, disabled: true }],

      salesVoucherTermsAndCondition: [{ value: null, disabled: true }],
      salesVoucherShippinAddress: [{ value: null, disabled: true }],

      salesVoucherEnqDate: [{ value: null, disabled: true }],
      salesVoucherJobId: [-1],
      salesVoucherLocationId: [this.defaultLocationID > 0 ? this.defaultLocationID : -1],
      item: [{ value: null, disabled: true }],
      salesVoucherTotalGrossAmount: [{ value: [0], disabled: true }],
      salesVoucherTotalItemDisAmount: [{ value: [0], disabled: true }],
      salesVoucherTotalDisPer: [{ value: [0], disabled: true }],
      salesVoucherTotalDisAmount: [{ value: [0], disabled: true }],
      salesVoucherVatPer: [{ value: [0], disabled: true }],
      salesVoucherVatAmt: [{ value: [0], disabled: true }],
      salesVoucherTotalActualAmount: [{ value: [0], disabled: true }],
      salesVoucherVatRoundSign: [{ value: '-', disabled: true }],
      salesVoucherVatRountAmt: [{ value: [0], disabled: true }],
      salesVoucherNetAmount: [{ value: [0], disabled: true }],
      deliveryRequriedOn: [{ value: null, disabled: true }],
      termsofDelivery: [{ value: null, disabled: true }],
      projectRefNo: [{ value: null, disabled: true }],
    });
    this.salesVoucherFormGroup.disable();
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.salesVoucherFilterForm = this.fb.group({
      salesVoucherPartyId: [null],
      isDate: [],
      salesVoucherType: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });

    this.userId = this.loginser.GetCredentialData()?.userId;

    this.activatedroute.queryParams.subscribe((params) => {
      this.voucherId = params['id'];
      this.voucherNo = params['svNo'];
      if (this.voucherId) {
        this.GetSavedSalesVoucherDetails(this.voucherId);
      }
      if (this.voucherNo) {
        this.GetSavedSalesVoucherDetailsBySaleVoucher(this.voucherNo);
      }
    });
    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedSalesVoucherDetails(this.vNo);
    }
    this.bykeys();
    this.LoadLocationDDL();
  }

  getReportType() {
    this.masterapi.General('salesVoucher').subscribe((res: any) => {
      this.printbtn = res.map((r: any) => ({
        label: r.reportTypeDescription,
        command: () => this.showPrint(null, r.reportTypeFileName),
      }));
    });
  }

  get f() {
    return this.salesVoucherFormGroup.controls;
  }

  loadCardAcc(event: any) {
    const type = event.value;

    if (type == 'CARD') {
      this.getcardValue();
    }
    // else if (type == 'CASH') {
    //   this.getcashacc();
    // }
    // if (type != 'CASH') {
    //   this.CustomerMasterFilter = [...this.CustomerMasterList];
    // }
  }
  getcashacc() {
    this.utilityService
      .GetAllAccountsbyKey('CASH_AC_NO')
      .subscribe((res: any) => {
        const value = res.result[0].accountSettingsAccountTextValue.split('::');

        this.CustomerMasterFilter = res.result?.map((kl) => ({
          label: kl.accountSettingsAccountTextValue,
          value: kl.accountSettingsAccountTextValue.split('::')[1],
        }));

        this.salesVoucherFormGroup
          .get('salesVoucherPartyId')
          .setValue(Number(value[1]));
      });
  }

  updateTableConfiguration() {
    const hiddenColumns = [1, 6, 9, 12, 15, 17, 18, 20];
    if (this.hideJobDetail) {
      hiddenColumns.push(13);
    }
    if (this.hideCostCenterDetail) {
      hiddenColumns.push(14);
    }
    if (this.hideCostPriceDetail) {
      hiddenColumns.push(16);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }




  initializeControls() {
    this.avgCostItemAmount = 0;

    // this.getAllAccountTransaction();
    const hiddenColumns = [1, 6, 9, 12, 13, 14, 15, 16, 17, 18, 20];
    this.salesvoucher_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns,
      { height: '250px', minRows: 6 }
    );

    this.salesvoucher_entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      this.clickedRowColumn = { row, column };
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      if (
        this.salesvoucher_entry.readOnly === false &&
        this.utilityService.isRowDisabled(row, hotInstance)
      ) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Notice',
          detail: 'Please fill the previous row first',
        });
        return;
      }
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      this.currentRow = row;
      if (column === 0 && this.salesvoucher_entry.readOnly === false) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item', 'ItemID'];
        //this.lookupGridColumns = ['Brand', 'Item', 'ItemID', 'Size'];
        this.dataList = this.itemSetLookup;
        hotInstance.deselectCell();
        this.onSearch('');
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 2 && this.salesvoucher_entry.readOnly === false) {
        var data = hotInstance.getDataAtRow(row);
        this.EditItem(data[2], data[0]);
      } else if (column === 3 && this.salesvoucher_entry.readOnly === false) {
        this.isServerSearch = false;
        var data = hotInstance.getDataAtRow(row);
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.unitArray = [];
        this.masterapi.GetUnitDetails(data[0]).subscribe((res) => {
          this.unitArray = res.result;
          this.dataList = this.unitSetLookup;
          hotInstance.deselectCell();
          this.unitArry = res.result.map((ar) =>
            ar.unitMasterUnitShortName?.trim()
          );
          this.showSalesLookUp = true;
        });
        // this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else {
        this.showSalesLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.sales == x);
      } else {
        this.selectItem = {};
      }
    };

    this.salesvoucher_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showSalesLookUp = false;

      if (change[0][1] === 0) {
        this.showSalesLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.salesvoucher_entry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);
        if (data[4] != null && data[5] != null && change[0][1] != 'netAmt') {
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
            var _undefined: undefined;
            var totalSum = data[4] * data[5];
            var discValue = data[7] * data[4];
            var result = totalSum - discValue;
            var vatAmount =
              (result *
                this.salesVoucherFormGroup.controls.salesVoucherVatPer.value) /
              100;
            var sum = result + vatAmount;
            if (this.currentRow >= 0 && data[0] != null) {
              if (
                this.salesvoucher_entryDataset[this.currentRow].itemId ===
                undefined
              ) {
                return;
              }
              this.salesvoucher_entryDataset[this.currentRow].grossAmt =
                totalSum;
              this.salesvoucher_entryDataset[this.currentRow].vatAmt =
                vatAmount;
              // this.salesvoucher_entryDataset[index].vatPer = vatPer
              this.salesvoucher_entryDataset[this.currentRow].netAmt = sum;
              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data: this.salesvoucher_entryDataset });
              this.ColumnSum();
            }
          }
        }
      }

      this.ColumnSum();
    };

    this.salesvoucher_entry.afterChange = (r, c) => { };

    this.salesvoucher_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.itemList.splice(index, 1);
      this.ColumnSum();
    };

    this.salesvoucher_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }
  initializeSalesChargesControls() {
    // this.getAllAccountTransaction();
    const hiddenColumns = [0, 2, 3, 5];
    this.salesCharges_entry = this.utilityService.getTableConfig(
      columnServiceDetailList(this),
      hiddenColumns,
      { height: '150px', minRows: 3 }
    );
    this.salesCharges_entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      const hotInstance = this.hotRegisterer.getInstance(this.hotCid);
      if (
        this.salesvoucher_entry.readOnly === false &&
        this.utilityService.isRowDisabled(row, hotInstance)
      ) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Notice',
          detail: 'Please fill the previous row first',
        });
        return;
      }
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      this.currentRow = row;
      if (column === 1 && this.salesCharges_entry.readOnly === false) {
        this.isServerSearch = false;
        this.lookupGridColumns = ['Service Name', 'Account No'];
        //this.lookupGridColumns = ['Brand', 'Item', 'ItemID', 'Size'];
        this.dataList = this.chargeSetLookup;
        hotInstance.deselectCell();
        this.chargeMasterLookUp = true;
        this.activeRow = { row, column };
      }
    };

    this.salesCharges_entry.beforeChangeRender = (change, source) => {
      this.getSalesChargesTotal();
    };
  }
  getSalesChargesTotal() {
    this.salesChargesTotalAmount = this.salesCharges_entryDataset
      ?.filter((d) => d.serviceID != undefined)
      .reduce((total, item) => total + (item.amount || 0), 0);
    this.GetTotal();
  }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.itemId != null) {
      const button = document.createElement('a');
      button.className = 'iconbton';
      button.innerHTML = '<i class="pi pi-eye" style="font-size: 15px;"></i>';
      button.addEventListener('click', () => {
        this.ngZone.run(() => {
          const rowData = instance.getSourceDataAtRow(row);
          // this.displayDialogPrice = true;
          this.showview([rowData.itemId]);
        });
      });
      td.appendChild(button);
    }

    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }

  showview(data: any) {
    this.lastPurchasePrices = [];
    this.lastSalesPrices = [];

    this.masterapi.GetLastItemsThreePrices(data).subscribe((r: any) => {
      this.displayDialogPrice = true;
      this.PriceListData = r?.result;
      this.priceItemName = this.PriceListData[0]?.itemName;
      this.lastPurchasePrices = this.PriceListData[0]?.lastPurchasePrices;
      this.lastSalesPrices = this.PriceListData[0]?.lastSalesPrices;
    });
  }

  zerovat() {
    if (this.f.salesVoucherExcludeVat.value) {
      this.salesVoucherFormGroup.controls.salesVoucherVatPer.setValue(0);
      this.GetTotal();
    } else {
      this.salesVoucherFormGroup.controls.salesVoucherVatPer.setValue(
        this.vatvalue
      );
      this.GetTotal();
    }
  }

  LoadAccountSettingDDL() {
    this.utilityService.LoadDropdownaccountsSettings().subscribe((m: any) => {
      var res = m.resultSet.accountsSettings;
      const splitText12 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Cash Account'
      )?.accountSettingsAccountTextValue;
      const parts12 = splitText12.split('::');
      this.cashAccount = parts12[1]?.trim();

      var res = m.resultSet.accountsSettings;
      const splitText0 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Discount Paid Account'
      )?.accountSettingsAccountTextValue;
      const parts0 = splitText0.split('::');
      this.DiscountPaidAccount = parts0[1]?.trim();

      const splitText = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Sales Account'
      )?.accountSettingsAccountTextValue;
      const parts = splitText.split('::');
      this.saleAccount = parts[1]?.trim();

      const splitText1 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Stock Account'
      )?.accountSettingsAccountTextValue;
      const parts1 = splitText1.split('::');
      this.stockLedgerAccount = parts1[1]?.trim();

      const splitText2 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Expenses Account'
      )?.accountSettingsAccountTextValue;
      const parts2 = splitText2.split('::');
      this.goodsSoldAccount = parts2[1]?.trim();

      const splitText3 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Vat Output'
      )?.accountSettingsAccountTextValue;
      const parts3 = splitText3.split('::');
      this.vatPayableAccount = parts3[1]?.trim();

      const splitText4 = res?.find(
        (x) =>
          x.accountSettingsAccountDescription == 'Cost Of Finished Goods A/C'
      )?.accountSettingsAccountTextValue;
      const parts4 = splitText4.split('::');
      this.CostOfFinishedGoods = parts4[1]?.trim();

      const splitText5 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Round Off'
      )?.accountSettingsAccountTextValue;
      const parts5 = splitText5.split('::');
      this.RoundOffAccount = parts5[1]?.trim();
    });
  }
  LoadDepartmentDD() {
    this.utilityService.LoadDepartmentDropdown().subscribe((m: any) => {
      this.DepartmentMasterArray = m.resultSet.departmentsList;
      this.DepartmentMasterList = m.resultSet.departmentsList?.map(
        (kl: any) => ({
          label: kl.departmentMasterDepartmentName,
          value: kl.departmentMasterDepartmentId,
        })
      );
      this.DepartmentMasterList.unshift({
        label: '--Select Department--',
        value: -1,
      });
    });
  }
  LoadSaleManDDL() {
    this.utilityService.LoadSaleManDropdown().subscribe((m: any) => {
      this.SalesManMasterArray = m.resultSet.saleManList;
      this.SalesManMasterList = m.resultSet.saleManList?.map((kl: any) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.SalesManMasterList.unshift({
        label: '--Select Sales Man--',
        value: -1,
      });
    });
  }
  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((m: any) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl: any) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
    });
  }
  GetAllChargeMaster() {
    this.chargesService
      .GetAllOtherChargesMasterByType('sales')
      .subscribe((res: any) => {
        this.chargeArray = res;
        this.chargeList = res;
      });
  }
  LoadChartofAccountDDL() {
    this.utilityService.LoadDropdowchartofAccounts().subscribe((m: any) => {
      this.accountArray = m.resultSet.masterAccountsTables;
    });
  }
  LoadCostCenterDDL() {
    this.utilityService.LoadDropdowncostcenterMasters().subscribe((m: any) => {
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl: any) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterList.unshift({
        label: '--Select Cost Center--',
        value: -1,
      });
    });
  }
  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((m: any) => {
      this.units = m.resultSet.unitMasters;
      this.unitListt = m.resultSet.unitMasters?.map((kl: any) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
    });
  }

  LoadBrandDDL() {
    this.utilityService.LoadDropdownBrandMasters().subscribe((m: any) => {
      this.brandArry = m.resultSet.brandMasters;
    });
  }

  onSearch(term: string) {
    this.dataList = [];
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi
      .LoadFilteredItemMaster(this.pagedRequest)
      .subscribe((m: any) => {
        this.ItemMasterArray = m.resultSet.itemMaster;
        this.ItemMasterList = m.resultSet.itemMaster?.map((kl: any) => ({
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

  LoadItemDDL() {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: '',
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi
      .LoadFilteredItemMaster(this.pagedRequest)
      .subscribe((m: any) => {
        this.ItemMasterArray = m.resultSet.itemMaster;
        this.ItemMasterList = m.resultSet.itemMaster?.map((kl: any) => ({
          label: kl?.itemMasterItemName,
          value: kl.itemMasterItemId,
        }));
      });
  }
  LoadCustomerDDL() {
    this.utilityService.LoadCustomerDropdown().subscribe((m: any) => {
      this.CustomerMasterArray = m.resultSet.customerMasters;

      this.CustomerMasterList = m.resultSet.customerMasters?.map((kl: any) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
            ' -- ' +
            kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterFilter = m.resultSet.customerMasters?.map(
        (kl: any) => ({
          label:
            kl.customerMasterCustomerReffAcNo != null
              ? kl.customerMasterCustomerName +
              ' -- ' +
              kl.customerMasterCustomerReffAcNo
              : kl.customerMasterCustomerName,
          value: kl.customerMasterCustomerNo,
        })
      );
      this.CustomerMasterList.unshift({
        label: '--Select Customer--',
        value: -1,
      });
      this.CustomerMasterFilter.unshift({
        label: '--Select Customer--',
        value: -1,
      });
    });
  }
  clearFilters() {
    this.dateFrom = null;
    this.dateTo = null;
    this.LoadPR();
  }

  LoadPR() {
    const payload = {
      dateFrom: this.dateformat.formatDatetime(this.dateFrom, true),
      dateTo: this.dateformat.formatDatetime(this.dateTo, true),
      isdate: this.isDate,
    };

    this.procurementapi.GetAllPReq(payload).subscribe((m: any) => {
      this.PR = m.resultSet;
    });
  }

  LoadCurrencyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((m: any) => {
      this.currency = m.resultSet.currencyMasters;
      this.currencyList = m.resultSet.currencyMasters?.map((kl: any) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
    });
  }

  LoadLocationDDL() {
    this.utilityService.LoadDropdownLocationMaster().subscribe((m: any) => {
      const list = m?.resultSet?.locationMaster ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationLocked = this.utilityService.applyLocationLock(
        this.salesVoucherFormGroup,
        'salesVoucherLocationId'
      );
    });
  }

  getItemrate() {
    this.utilityService
      .GetProgramSettingbyKey('Item_Rate_From_ItemMaster')
      .subscribe((k: any) => {
        this.Itemratevalue = k.result[0].programSettingsBoolValue ?? false;
      });
  }

  GetAveragePurchasePriceGPC(
    id,
    qty,
    loadCurrentStock = false,
    stockRow?: number,
    stockUnitId?: number
  ) {
    this.pvslue = qty;
    const unitDetailId = this.unitDetailID;

    const req = {
      itemId: id ?? 0,
      unitDetailId: unitDetailId ?? 0,
      quantity: qty ?? 0,
    };

    this.masterapi.GetAveragePurchasePriceGPC(req).subscribe((res: any) => {
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      const row = this.activeRow.row;

      let avgPrice = res.result ?? 0;
      let sellingPrice = avgPrice;
      let profitPerUnit = 0;

      this.masterapi.GetUnitDetails(id).subscribe((unitRes) => {
        this.unitArray = unitRes.result;
        this.dataList = this.unitSetLookup;
        this.unitArry = unitRes.result.map((ar) =>
          ar.unitMasterUnitShortName?.trim()
        );

        if (loadCurrentStock) {
          this.updateCurrentItemStock(
            stockRow,
            id,
            stockUnitId
          );
        }

        const selectedUnit = (this.unitArray as any[])?.find(
          (u) => u.unitDetailsId === this.unitDetailID
        );

        const conversion = selectedUnit?.unitDetailsConversionType ?? 1;

        const currentLocationId = Number(
          this.salesVoucherFormGroup.get('salesVoucherLocationId')?.value ??
            this.defaultLocationID
        );
        const isProfitNotApplicable =
          this.profitNotApplicableLocationId !== -1 &&
          currentLocationId === this.profitNotApplicableLocationId;

        const profitPercentage = isProfitNotApplicable
          ? 0
          : Number(this.ItemMasterArrayByName?.unitDetails?.unitDetailsProfitPer ?? 0);

        avgPrice = avgPrice * conversion;
        sellingPrice = avgPrice + (avgPrice * profitPercentage) / 100;
        profitPerUnit = sellingPrice - avgPrice;



        if (this.Itemratevalue && sellingPrice > 0) {
          hotInstance.setDataAtCell(row, 16, avgPrice);
          hotInstance.setDataAtCell(row, 5, sellingPrice);
        } else {
          hotInstance.setDataAtCell(row, 16, selectedUnit.unitDetailsRate);
          hotInstance.setDataAtCell(row, 5, selectedUnit.unitDetailsRate + (selectedUnit.unitDetailsRate * profitPercentage) / 100);
        }
      });
    });
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.LoadJobDDL();
    this.GetAllChargeMaster();
    this.LoadUnitDDL();
    this.LoadSaleManDDL();
    this.LoadDepartmentDD();
    this.LoadBrandDDL();
    this.LoadCurrencyDDL();
    this.LoadCustomerDDL();
    this.LoadLocationDDL();
    this.LoadCostCenterDDL();
    this.LoadAccountSettingDDL();
    this.LoadChartofAccountDDL();
    this.getItemrate();
  }

  new() {
    this.itemList = [];
    this.callDropdowns();
    this.salesVoucherFormGroup.reset();
    this.salesvoucher_entry.data = [];
    this.salesvoucher_entryDataset = [];
    this.salesCharges_entryDataset = [];
    this.salesvoucher_entry.readOnly = false;
    this.salesCharges_entry.readOnly = false;
    this.salesVoucherFormGroup.controls.salesVoucherVatRoundSign.setValue('-');
    this.salesVoucherFormGroup.controls.salesVoucherType.setValue('CREDIT');
    this.browseBTN = true;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.salesvoucher_entry);
    this.accountTransactionList = [];
    this.salesVoucherFormGroup.get('salesVoucherId').setValue(null);
    this.salesVoucherFormGroup.get('salesVoucherPartyId').setValue(-1);
    this.salesVoucherFormGroup.get('salesVoucherJobId').setValue(-1);
    this.salesVoucherFormGroup.get('salesVoucherCurrencyId').setValue(-1);
    this.salesVoucherFormGroup
      .get('salesVoucherLocationId')
      .setValue(this.defaultLocationID);

    this.salesVoucherFormGroup.get('salesVoucherSalesManId').setValue(-1);
    this.salesVoucherFormGroup.get('salesVoucherDptId').setValue(-1);

    this.salesVoucherFormGroup.get('salesVoucherDate').setValue(new Date());
    this.salesVoucherFormGroup.get('salesVoucherDlvDate').setValue(new Date());
    this.salesVoucherFormGroup.get('salesVoucherQtnDate').setValue(new Date());
    this.salesVoucherFormGroup.get('salesVoucherSodate').setValue(new Date());
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.index = 0;
    this.salesVoucherFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.salesVoucherFormGroup,
      'salesVoucherLocationId',
      this.locationLocked
    );
    this.GetDefaultSettings();
    this.loadProfitNotApplicableLocation();
    this.f.salesVoucherNo.clearValidators();
    this.salesVoucherFormGroup.updateValueAndValidity();
    this.f.salesVoucherNo.clearValidators();
    this.salesVoucherFormGroup.updateValueAndValidity();
    this.salesVoucherFormGroup.controls.salesVoucherNo.disable();
    if (this.locationLocked) {
      this.salesVoucherFormGroup.get('salesVoucherLocationId')?.disable();
    }
    this.updateTableConfiguration();
  }

  getcardValue() {
    this.utilityService
      .GetAllAccountsbyKey('CREDITCARD_AC_NO')
      .subscribe((res: any) => {
        const value = res.result[0].accountSettingsAccountTextValue.split('::');

        this.cardAcc = value[1]?.trim();
      });
  }

  defalutCustomer(even) {
    if (
      even.value == 'CREDIT' &&
      this.CustomerMasterArray?.filter(
        (res) => (res.customerMasterCustomerGroupAccNo = '')
      )
    )
      this.salesVoucherFormGroup.get('salesVoucherPartyId').setValue(-1);
  }

  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
  hideCostPriceDetail: boolean = false;
  bykeys() {
    this.utilityService
      .getProgramSettings(
        'Hide_Job_Detail,Hide_CostCenter_Detail,Hide_CostPrice_SalesGrid'
      )
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        const costCenterSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        );
        const costPriceSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostPrice_SalesGrid'
        );
        this.hideCostPriceDetail =
          costPriceSetting?.programSettingsBoolValue ?? false;
        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;

        this.updateTableConfiguration();
      });
  }

  loadProfitNotApplicableLocation() {
    this.masterapi.GetGeneralSettings().subscribe((generalList: any[]) => {
      const profitSetting = generalList?.find(
        (a) => a.generalSettingsKeyValue?.trim() === 'PROFIT_APPLICABILITY_BY_LOCATION'
      );
      if (profitSetting?.generalSettingsTextValue) {
        const rawValue = profitSetting.generalSettingsTextValue;
        const strValue = typeof rawValue === 'string' ? rawValue : (rawValue?.keyValue ?? '');
        const splitText = strValue.split('::');
        this.profitNotApplicableLocationId = Number(splitText[1]?.trim()) || -1;
      } else {
        this.profitNotApplicableLocationId = -1;
      }
    });
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown(true).subscribe((m: any) => {
      let list = m.resultSet.generalSettings;
      //cost ceenter
      var DEFAULT_COSTCENTER = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_COST_CENTER'
      );
      if (DEFAULT_COSTCENTER != null) {
        this.DefCostCenterCheck =
          DEFAULT_COSTCENTER[0]?.generalSettingsTextValue;
        if (this.DefCostCenterCheck != null) {
          const splitText = this.DefCostCenterCheck.split('::');
          this.DefCostCenterId = splitText[1]?.trim();
          // this.f.issueVoucherCostCenterId.setValue(
          //   Number(this.DefCostCenterId)
          // );
        }
      }

      // currency

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();

          this.f.salesVoucherCurrencyId.setValue(Number(this.DefCurrency));
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
            this.f.salesVoucherLocationId.setValue(this.defaultLocationID);
          }
        }
      }
      var VAT_Calculation = list?.filter(
        (a) => a.generalSettingsKeyValue == 'VAT_Calculation'
      );
      var vatcal1 = VAT_Calculation[0]?.generalSettingsBoolValue;

      this.VatCalculation = vatcal1 == true ? true : false;

      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;

      this.JOBCOST = jobcal == true ? true : false;

      var VAT_EXLUDE_IN_SALES = list?.filter(
        (a) => a.generalSettingsKeyValue == 'VAT_EXLUDE_IN_SALES'
      );
      var vatcal = VAT_EXLUDE_IN_SALES[0]?.generalSettingsBoolValue;

      this.VATEXLUDE = vatcal ?? false;


      const match = m.resultSet.optionSettings.optionsMasterType.match(/(\d+)/);
      if (match) {
        this.vatvalue = parseInt(match[0], 10);

        this.salesVoucherFormGroup
          .get('salesVoucherVatPer')
          .setValue(this.VATEXLUDE ? 0 : this.vatvalue);
      }
    });
  }

  ColumnSum() {
    let discountTotal = 0;
    let vatTotal = 0;
    let grossTotal = 0;
    let costTotal = 0;

    this.salesvoucher_entryDataset.forEach((element: any) => {
      if (element) {
        if (element.disc && element.qty) {
          discountTotal += element.disc * element.qty;
        }
        if (element.vatAmt) {
          vatTotal += element.vatAmt;
        }
        if (element.grossAmt) {
          grossTotal += element.grossAmt;
        }
        if (element.Costprice && element.qty) {
          costTotal += element.Costprice * element.qty;
        }
      }
    });

    // Set values in the form group
    this.salesVoucherFormGroup.controls.salesVoucherTotalItemDisAmount.setValue(
      discountTotal
    );
    this.salesVoucherFormGroup.controls.salesVoucherVatAmt.setValue(vatTotal);
    this.salesVoucherFormGroup.controls.salesVoucherTotalGrossAmount.setValue(
      grossTotal
    );

    this.totalcostPrice = costTotal;

    this.GetTotal();
  }
  CalcDiscFromPer() {
    this.salesVoucherFormGroup.controls.salesVoucherTotalDisAmount.setValue(
      parseFloat(
        (
          (Number(
            this.salesVoucherFormGroup.value.salesVoucherTotalGrossAmount
          ) *
            Number(this.salesVoucherFormGroup.value.salesVoucherTotalDisPer)) /
          100
        ).toFixed(2)
      )
    );

    this.GetTotal();
  }

  CalcDiscFromAmt() {
    this.salesVoucherFormGroup.controls.salesVoucherTotalDisPer.setValue(
      (Number(this.salesVoucherFormGroup.value.salesVoucherTotalDisAmount) *
        100) /
      Number(this.salesVoucherFormGroup.value.salesVoucherTotalGrossAmount)
    );
    this.GetTotal();
  }

  GetTotal() {
    const grossAmount = Number(
      this.salesVoucherFormGroup.value.salesVoucherTotalGrossAmount
    );
    const discountitem = Number(
      this.salesVoucherFormGroup.value.salesVoucherTotalItemDisAmount
    );

    const discountAmount = Number(
      this.salesVoucherFormGroup.value.salesVoucherTotalDisAmount
    );
    const vatPer = Number(this.salesVoucherFormGroup.value.salesVoucherVatPer);
    const vatRoundSign =
      this.salesVoucherFormGroup.value.salesVoucherVatRoundSign;
    const vatRountAmt = Number(
      this.salesVoucherFormGroup.value.salesVoucherVatRountAmt
    );

    // Calculate total actual amount based on VAT exclusion
    let totalActualAmount =
      grossAmount - (discountAmount + (discountitem ? discountitem : 0));
    this.salesVoucherFormGroup.controls.salesVoucherTotalActualAmount.setValue(
      totalActualAmount.toFixed(2)
    );

    // Calculate VAT amount
    const vatAmt = !this.VATEXLUDE ? totalActualAmount * (vatPer / 100) : 0;
    this.salesVoucherFormGroup.controls.salesVoucherVatAmt.setValue(
      vatAmt.toFixed(2)
    );

    // Calculate net amount based on VAT round sign
    let netAmount = totalActualAmount + vatAmt;

    if (vatRoundSign === '+') {
      netAmount += vatRountAmt;
    } else if (vatRoundSign === '-') {
      netAmount -= vatRountAmt;
    } else {
      this.salesVoucherFormGroup.value.salesVoucherVatRoundSign = '-';
    }
    this.salesVoucherFormGroup.controls.salesVoucherNetAmount.setValue(
      (netAmount + this.salesChargesTotalAmount).toFixed(2)
    );
    this.recalculateVatAndNetForAllRows();
  }
  recalculateVatAndNetForAllRows() {
    const vatPer = this.salesVoucherFormGroup.controls.salesVoucherVatPer.value;
    const hot = this.hotRegisterer.getInstance(this.hotid);

    this.salesvoucher_entryDataset.forEach((row, index) => {
      const qty = row.qty;
      const rate = row.rate;
      const discountPer = row.discountPer;

      if (qty != null && rate != null) {
        const total = qty * rate;
        const discountValue = (discountPer ?? 0) * qty;
        const result = total - discountValue;

        const vatAmt = (result * vatPer) / 100;
        const netAmt = result + vatAmt;

        row.grossAmt = total;
        row.vatAmt = vatAmt;
        row.netAmt = netAmt;
      }
    });

    hot.updateSettings({ data: this.salesvoucher_entryDataset });
    // this.ColumnSum();
  }

  getItemBarcode() {
    this.masterapi.getItemBarcode(123456789).subscribe((res: any) => {
      const item = res.result;
      let evt = {
        sales: item.itemMasterItemName,
        salesId: item.itemMasterItemId,
      };
      this.selectsales(evt);
    });
  }

  onSelectionChange(event: any) {
    if (
      this.salesVoucherFormGroup.controls.salesVoucherType.value === 'CREDIT'
    ) {
      const selectedCustomer = this.CustomerMasterArray?.find(
        (o) => o.customerMasterCustomerNo === event.value
      );

      if (
        !selectedCustomer ||
        !selectedCustomer.customerMasterCustomerReffAcNo
      ) {
        this.salesVoucherFormGroup.controls.salesVoucherPartyId.setValue(-1);

        this.messageService.add({
          severity: 'warn',
          summary: 'Alert',
          detail: `Selected Customer didn't have an Account No.`,
        });
        return;
      }
    }
    const custDetails = this.CustomerMasterArray?.find(
      (j) => j.customerMasterCustomerNo === event.value
    );
    this.salesVoucherFormGroup.controls.salesVoucherPartyVatNo.setValue(
      custDetails.customerMasterCustomerVatNo
    );
    this.salesVoucherFormGroup.controls.salesVoucherContPerson.setValue(
      custDetails.customerMasterCustomerContactPerson
    );
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
      this.acctArry = k.result.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
    });
  }

  public getSalesManName(id: number): string {
    return this.SalesManMasterArray?.find(
      (j) => j?.salesManMasterSalesManId === id
    )?.salesManMasterSalesManName;
  }


  getSalesVoucherreport() {
    const fileName = String(new Date().valueOf());
    var css: string = `

#customers {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
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

  .rectImg {
height: 140px;
    width: 217px;
}

.squreImg {
    height: 145px;
    width: 145px;
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

  // .page-footer {
  //   position: fixed;
  //   bottom: 0;
  //   // visibility: hidden;
  //   width: 100%;
  // }
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
  // .page-footer {
  //   position: fixed;
  //   bottom: 0;
  //   // display: none;
  //   width: 100%;
  //   display: block;
  // }
  @media print {
    thead {display: table-header-group;}
    tfoot {display: table-footer-group;}
    table { page-break-inside:auto ;
      font-size: 11px;}
    tr { page-break-inside:avoid; page-break-after:auto }

    body {margin: 0;}

    // img {
    //     width: 100px;
    //     height: 80px;
    // }
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

 `;
    this.printService.PrintPDF('contentToConvertSv', css);
    this.userTrackingLog('PDF');
  }

  calculateNumberOfPages() {
    const totalNumPages =
      document.querySelectorAll('contentToConvertSv').length;
    const footer = document.querySelector('.page-footer');

    // if (footer && totalNumPages > 0) {
    const pageNumberText = document.createTextNode(
      `Printed - Page ${totalNumPages}`
    );
    footer.appendChild(pageNumberText);
    // }
    // }, 1000); // Adjust the delay if needed
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 12) {
      return Math.max(0, 12 - salesVoucherDetailsLength);
    } else {
      return;
    }
  }

  displayPrint() {
    this.displayPrintPreview = true;
    // this.calculateNumberOfPages()
  }

  printAsPDF() {
    this.getSalesVoucherreport();

    this.displayPrintPreview = false;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  get itemSetLookup() {
    return this.ItemMasterArray?.map((kl) => ({
      sales: kl?.itemMasterItemName,
      salesId: kl?.itemMasterItemId,
      barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
      // size: kl?.itemMasterItemSize,
      // brand: this.brandArry?.find(
      //   (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
      // )?.vendorMasterVendorName,
    }));
  }
  get chargeSetLookup() {
    return this.chargeArray?.map((kl: any) => ({
      sales: kl?.serviceName,
      salesId: kl?.accountNo,
      //barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
      // size: kl?.itemMasterItemSize,
      // brand: this.brandArry?.find(
      //   (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
      // )?.vendorMasterVendorName,
    }));
  }

  getBrand() {
    this.masterapi.GetAllBrand().subscribe((data) => {
      this.brandArry = data;
    });
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      sales: kl?.unitMasterUnitShortName,
      salesId: kl.unitMasterUnitId,
    }));
  }

  saveSalesVoucher() {
    const savedData: any = this.salesvoucher_entryDataset?.filter((k) =>
      k.hasOwnProperty('itemname')
    );
    const salesVoucher_Save: SalesVoucher = this.salesVoucherFormGroup
      .value as SalesVoucher;
    salesVoucher_Save.salesVoucherId = Number(
      this.salesVoucherFormGroup.value.salesVoucherId
    );
    salesVoucher_Save.salesVoucherNo =
      this.salesVoucherFormGroup.getRawValue().salesVoucherNo;
    salesVoucher_Save.salesVoucherDate =
      this.salesVoucherFormGroup.value.salesVoucherDate;
    salesVoucher_Save.salesVoucherRefNo =
      this.salesVoucherFormGroup.value.salesVoucherRefNo;
    salesVoucher_Save.salesVoucherCostCenterId =
      this.salesVoucherFormGroup.value.salesVoucherCostCenterId;
    salesVoucher_Save.salesVoucherContPerson =
      this.salesVoucherFormGroup.value.salesVoucherContPerson;
    salesVoucher_Save.salesVoucherCurrencyId =
      this.salesVoucherFormGroup.value.salesVoucherCurrencyId;
    salesVoucher_Save.salesVoucherExcludeVat =
      this.salesVoucherFormGroup.value.salesVoucherExcludeVat;
    salesVoucher_Save.salesVoucherType =
      this.salesVoucherFormGroup.value.salesVoucherType;
    salesVoucher_Save.salesVoucherPartyId =
      this.salesVoucherFormGroup.value.salesVoucherPartyId;
    salesVoucher_Save.salesVoucherPartyName =
      this.salesVoucherFormGroup.value.salesVoucherPartyName;
    salesVoucher_Save.salesVoucherPartyAddress =
      this.salesVoucherFormGroup.value.salesVoucherPartyAddress;
    salesVoucher_Save.salesVoucherPartyVatNo =
      this.salesVoucherFormGroup.value.salesVoucherPartyVatNo;
    salesVoucher_Save.salesVoucherDescription =
      this.salesVoucherFormGroup.value.salesVoucherDescription;

    salesVoucher_Save.salesVoucherDlvNo =
      this.salesVoucherFormGroup.value.salesVoucherDlvNo;
    salesVoucher_Save.salesVoucherDlvDate =
      this.salesVoucherFormGroup.value.salesVoucherDlvDate;
    salesVoucher_Save.salesVoucherSono =
      this.salesVoucherFormGroup.value.salesVoucherSono;
    salesVoucher_Save.salesVoucherSodate =
      this.salesVoucherFormGroup.value.salesVoucherSodate;
    salesVoucher_Save.salesVoucherQtnNo =
      this.salesVoucherFormGroup.value.salesVoucherQtnNo;
    salesVoucher_Save.salesVoucherQtnDate =
      this.salesVoucherFormGroup.value.salesVoucherQtnDate;

    salesVoucher_Save.salesVoucherSalesManId =
      this.salesVoucherFormGroup.value.salesVoucherSalesManId;
    salesVoucher_Save.salesVoucherDptId =
      this.salesVoucherFormGroup.value.salesVoucherDptId;
    salesVoucher_Save.salesVoucherEnqNo =
      this.salesVoucherFormGroup.value.salesVoucherEnqNo;

    salesVoucher_Save.salesVoucherHeader =
      this.salesVoucherFormGroup.value.salesVoucherHeader;
    salesVoucher_Save.salesVoucherDelivery =
      this.salesVoucherFormGroup.value.salesVoucherDelivery;
    salesVoucher_Save.salesVoucherNotes =
      this.salesVoucherFormGroup.value.salesVoucherNotes;
    salesVoucher_Save.salesVoucherFooter =
      this.salesVoucherFormGroup.value.salesVoucherFooter;
    salesVoucher_Save.salesVoucherPaymentTerms =
      this.salesVoucherFormGroup.value.salesVoucherPaymentTerms;
    salesVoucher_Save.salesVoucherSubject =
      this.salesVoucherFormGroup.value.salesVoucherSubject;

    salesVoucher_Save.salesVoucherContent =
      this.salesVoucherFormGroup.value.salesVoucherContent;
    salesVoucher_Save.salesVoucherRemarks1 =
      this.salesVoucherFormGroup.value.salesVoucherRemarks1;
    salesVoucher_Save.salesVoucherRemarks2 =
      this.salesVoucherFormGroup.value.salesVoucherRemarks2;

    salesVoucher_Save.salesVoucherTermsAndCondition =
      this.salesVoucherFormGroup.value.salesVoucherTermsAndCondition;
    salesVoucher_Save.salesVoucherShippinAddress =
      this.salesVoucherFormGroup.value.salesVoucherShippinAddress;

    salesVoucher_Save.salesVoucherEnqDate =
      this.salesVoucherFormGroup.value.salesVoucherEnqDate;
    salesVoucher_Save.salesVoucherLocationId = Number(
      this.salesVoucherFormGroup.getRawValue()?.salesVoucherLocationId ??
        this.defaultLocationID
    );
    salesVoucher_Save.salesVoucherJobId =
      this.salesVoucherFormGroup.value.salesVoucherJobId;

    salesVoucher_Save.salesVoucherTotalGrossAmount = Number(
      this.salesVoucherFormGroup.value.salesVoucherTotalGrossAmount
    );
    salesVoucher_Save.salesVoucherTotalItemDisAmount = Number(
      this.salesVoucherFormGroup.value.salesVoucherTotalItemDisAmount
    );
    salesVoucher_Save.salesVoucherTotalDisPer = Number(
      this.salesVoucherFormGroup.value.salesVoucherTotalDisPer
    );
    salesVoucher_Save.salesVoucherTotalDisAmount = Number(
      this.salesVoucherFormGroup.value.salesVoucherTotalDisAmount
    );
    salesVoucher_Save.salesVoucherVatPer = Number(
      this.salesVoucherFormGroup.value.salesVoucherVatPer
    );
    salesVoucher_Save.salesVoucherVatAmt = Number(
      this.salesVoucherFormGroup.value.salesVoucherVatAmt
    );
    salesVoucher_Save.salesVoucherTotalActualAmount = Number(
      this.salesVoucherFormGroup.value.salesVoucherTotalActualAmount
    );
    salesVoucher_Save.salesVoucherVatRoundSign =
      this.salesVoucherFormGroup.value.salesVoucherVatRoundSign;
    //salesVoucher_Save.salesVoucherVatRoundSign = '-';
    salesVoucher_Save.salesVoucherVatRountAmt = Number(
      this.salesVoucherFormGroup.value.salesVoucherVatRountAmt
    );
    salesVoucher_Save.salesVoucherNetAmount = Number(
      this.salesVoucherFormGroup.value.salesVoucherNetAmount
    );
    salesVoucher_Save.deliveryRequriedOn = this.salesVoucherFormGroup.value.deliveryRequriedOn;
    salesVoucher_Save.termsofDelivery = this.salesVoucherFormGroup.value.termsofDelivery;
    salesVoucher_Save.projectRefNo = this.salesVoucherFormGroup.value.projectRefNo;
    salesVoucher_Save.item = this.salesVoucherFormGroup.value.item;
    salesVoucher_Save.salesVoucherUserId=this.userId
    salesVoucher_Save.accountsTransactions = [];
    salesVoucher_Save.salesChargesList = this.setSalesChargesList(
      this.salesVoucherFormGroup.getRawValue().salesVoucherNo
    );
    salesVoucher_Save.salesVoucherDetails = savedData
      ?.filter((k) => k.itemname != null && k.netAmt != null)
      .map((k: GridData) => {
        return {
          salesVoucherDetailsId: 0,
          salesVoucherDetailsNo:
            this.salesVoucherFormGroup.getRawValue().salesVoucherNo,
          salesVoucherId:
            this.salesVoucherFormGroup.getRawValue().salesVoucherId,

          salesVoucherDetailsMatId: k.itemId,
          salesVoucherDetailsItemName: k.itemname,
          salesVoucherDetailsQuantity: k.qty,
          salesVoucherDetailsDiscAmount: Number(k.disc),
          salesVoucherDetailsRate: k.rate,
          salesVoucherDetailsNetAmt: k.netAmt,
          salesVoucherDetailsGrossAmount: k.grossAmt,
          salesVoucherDetailsVatAmt: k.vatAmt,
          salesVoucherDetailsVatPer: 5,
          salesVoucherDetailsCostPrice: k.Costprice,
          salesVoucherDetailsRemarks: k.narration,
          salesVoucherDetailsSno: 0,
          salesVoucherDetailsSoId: k.SoId,
          salesVoucherDetailsSodId: k.SodId,

          salesVoucherDetailsUnitId: this.units?.find(
            (x) => x?.unitMasterUnitShortName?.trim() === k.unit?.trim()
          ).unitMasterUnitId,
          purchaseRequisitionId: k.purchaseRequisitionId
            ? k.purchaseRequisitionId
            : null,
          salesVoucherDetailsDelStatus: false,
        };
      });

    const currencyRate = this.currency?.find(
      (c) =>
        c?.currencyMasterCurrencyId ==
        this.salesVoucherFormGroup.getRawValue().salesVoucherCurrencyId
    )?.currencyMasterCurrencyRate;
    //stockledger
    const stockLegder: AccountsTransactions = {
      accountsTransactionsAccNo: this.stockLedgerAccount,
      accountsTransactionsTransDate: this.f.salesVoucherDate.value,
      accountsTransactionsParticulars:
        this.salesVoucherFormGroup.value.salesVoucherRemarks1,
      accountsTransactionsCredit: Number(this.totalcostPrice),
      accountsTransactionsFcCredit: Number(this.totalcostPrice),
      accountsTransactionsAllocBalance: this.totalcostPrice,
      accountsTransactionsFcAllocBalance: Number(this.totalcostPrice),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.salesVoucherFormGroup.getRawValue().salesVoucherNo,
      accountsTransactionsDescription:
        this.salesVoucherFormGroup.value.salesVoucherRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsCurrencyId:
        this.salesVoucherFormGroup.value.salesVoucherCurrencyId,
    };
    salesVoucher_Save.accountsTransactions.push(stockLegder);

    const creditData: AccountsTransactions = {
      accountsTransactionsAccNo:
        this.salesVoucherFormGroup.getRawValue().salesVoucherType == 'CASH'
          ? this.cashAccount
          : this.salesVoucherFormGroup.getRawValue().salesVoucherType == 'CARD'
            ? this.cardAcc
            : this.CustomerMasterArray?.find(
              (o) =>
                o.customerMasterCustomerNo ==
                this.salesVoucherFormGroup.value.salesVoucherPartyId
            )?.customerMasterCustomerReffAcNo,

      accountsTransactionsTransDate: this.f.salesVoucherDate.value,
      accountsTransactionsParticulars:
        this.salesVoucherFormGroup.value.salesVoucherRemarks1,
      accountsTransactionsDebit: Number(
        this.salesVoucherFormGroup.value.salesVoucherNetAmount
      ),
      accountsTransactionsFcDebit: Number(
        this.salesVoucherFormGroup.value.salesVoucherNetAmount
      ),
      accountsTransactionsAllocBalance:
        this.salesVoucherFormGroup.value.salesVoucherNetAmount,
      accountsTransactionsFcAllocBalance: Number(
        this.salesVoucherFormGroup.value.salesVoucherNetAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.salesVoucherFormGroup.getRawValue().salesVoucherNo,
      accountsTransactionsDescription:
        this.salesVoucherFormGroup.value.salesVoucherRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsCurrencyId:
        this.salesVoucherFormGroup.value.salesVoucherCurrencyId,
    };

    salesVoucher_Save.accountsTransactions.push(creditData);

    
    ////discount accout

const totalDiscount =
  Number(this.salesVoucherFormGroup.value.salesVoucherTotalDisAmount || 0) +
  Number(this.salesVoucherFormGroup.value.salesVoucherTotalItemDisAmount || 0);


  debugger;
    const creditData1: AccountsTransactions = {
  
      accountsTransactionsAccNo: this.DiscountPaidAccount,

      accountsTransactionsTransDate: this.f.salesVoucherDate.value,
      accountsTransactionsParticulars:
        this.salesVoucherFormGroup.value.salesVoucherRemarks1,
      accountsTransactionsDebit: totalDiscount,
      accountsTransactionsFcDebit: totalDiscount,
      accountsTransactionsAllocBalance: totalDiscount,
      accountsTransactionsFcAllocBalance: totalDiscount,
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.salesVoucherFormGroup.getRawValue().salesVoucherNo,
      accountsTransactionsDescription:
        this.salesVoucherFormGroup.value.salesVoucherRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsCurrencyId:
        this.salesVoucherFormGroup.value.salesVoucherCurrencyId,
    };

    if (totalDiscount > 0) {
      salesVoucher_Save.accountsTransactions.push(creditData1);
    } //finishing goods
    const saleData: AccountsTransactions = {
      accountsTransactionsAccNo: this.CostOfFinishedGoods,
      accountsTransactionsTransDate: this.f.salesVoucherDate.value,
      accountsTransactionsParticulars:
        this.salesVoucherFormGroup.value.salesVoucherRemarks1,

      accountsTransactionsDebit: Number(this.totalcostPrice),
      accountsTransactionsFcDebit: Number(this.totalcostPrice),
      accountsTransactionsAllocBalance: this.totalcostPrice,
      accountsTransactionsFcAllocBalance: Number(this.totalcostPrice),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.salesVoucherFormGroup.getRawValue().salesVoucherNo,
      accountsTransactionsDescription:
        this.salesVoucherFormGroup.value.salesVoucherRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsCurrencyId:
        this.salesVoucherFormGroup.value.salesVoucherCurrencyId,
    };

    salesVoucher_Save.accountsTransactions.push(saleData);
    const saleAccount: AccountsTransactions = {
      accountsTransactionsAccNo: this.saleAccount,
      accountsTransactionsTransDate: this.f.salesVoucherDate.value,
      accountsTransactionsParticulars:
        this.salesVoucherFormGroup.value.salesVoucherRemarks1,
      accountsTransactionsCredit: Number(
        this.salesVoucherFormGroup.value.salesVoucherTotalGrossAmount
      ),
      accountsTransactionsFcCredit: Number(
        this.salesVoucherFormGroup.value.salesVoucherTotalGrossAmount
      ),
      accountsTransactionsAllocBalance:
        this.salesVoucherFormGroup.value.salesVoucherTotalGrossAmount,
      accountsTransactionsFcAllocBalance: Number(
        this.salesVoucherFormGroup.value.salesVoucherTotalGrossAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.salesVoucherFormGroup.getRawValue().salesVoucherNo,
      accountsTransactionsDescription:
        this.salesVoucherFormGroup.value.salesVoucherRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsCurrencyId:
        this.salesVoucherFormGroup.value.salesVoucherCurrencyId,
    };

    salesVoucher_Save.accountsTransactions.push(saleAccount);
    if (!this.VATEXLUDE) {
      const vatData: AccountsTransactions = {
        accountsTransactionsAccNo: this.vatPayableAccount,
        accountsTransactionsTransDate: this.f.salesVoucherDate.value,
        accountsTransactionsParticulars:
          this.salesVoucherFormGroup.value.salesVoucherRemarks1,
        accountsTransactionsCredit: Number(
          this.salesVoucherFormGroup.value.salesVoucherVatAmt
        ),
        accountsTransactionsFcCredit: Number(
          this.salesVoucherFormGroup.value.salesVoucherVatAmt
        ),
        accountsTransactionsAllocBalance:
          this.salesVoucherFormGroup.value.salesVoucherVatAmt,
        accountsTransactionsFcAllocBalance: Number(
          this.salesVoucherFormGroup.value.salesVoucherVatAmt
        ),
        accountsTransactionsVoucherType: null,
        accountsTransactionsTstamp: new Date(),
        accountsTransactionsVoucherNo:
          this.salesVoucherFormGroup.getRawValue().salesVoucherNo,
        accountsTransactionsDescription:
          this.salesVoucherFormGroup.value.salesVoucherRemarks1,
        accountsTransactionsStatus: null,
        accountstransactionsDelStatus: false,
        accountsTransactionsTransSno: 0,
      };
      salesVoucher_Save.accountsTransactions.push(vatData);
    }

    if (this.btnFlag.save) {
      this.saveVoucher(salesVoucher_Save);
    } else {
      salesVoucher_Save.accountsTransactions
        ?.filter((x) => x.accountsTransactionsTransSno != 0)
        .forEach((element, index, arry) => {
          arry[index].accountstransactionsDelStatus = true;
        });

      this.updateVoucher(salesVoucher_Save);
    }
  }
  setSalesChargesList(voucherNo: any) {
    return this.salesCharges_entryDataset
      ?.filter((d) => d !== null && d.serviceID > 0)
      .map((d) => {
        return {
          voucherno: voucherNo,
          serviceID: d.serviceID,
          amount: d.amount,
          taxIncAmount: d.netAmount,
          remarks: d.remarks,
        };
      });
  }

  validateTotalDrCrAmounts(): boolean {
    if (
      this.salesVoucherFormGroup.getRawValue().salesVoucherTotalGrossAmount ==
      0 &&
      this.salesVoucherFormGroup.getRawValue().salesVoucherTotalItemDisAmount ==
      0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    if (
      this.salesVoucherFormGroup.getRawValue().salesVoucherTotalGrossAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total  Gross Amount Is Zero',
      });
      return false;
    }

    return true;
  }

  saveVoucher(salesVoucher_Save: SalesVoucher) {
    if (this.salesVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.salesapi.InsertSalesVoucher(salesVoucher_Save).subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.isTemplate = false;
                this.savedSalesVoucher = data.result;
                this.updateFormGrid(data.result);
                this.userTrackingLog('Insert');
                if (data.valid) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Alert',
                    detail: this.translate.instant(data.message),
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
                  detail: this.translate.instant('Sales Voucher Save Failed'),
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
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.salesVoucherFormGroup.markAllAsTouched();
      this.salesVoucherFormGroup.markAsDirty();
    }
  }

  updateVoucher(salesVoucher_Save: SalesVoucher) {
    if (this.salesVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to update existing voucher?'
        ),
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.salesapi.UpdateSalesVoucher(salesVoucher_Save).subscribe(
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
                this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: this.translate.instant(
                    'Sales Voucher Updated Succesfully'
                  ),
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: this.translate.instant('Sales Voucher Update Failed'),
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
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.salesVoucherFormGroup.markAllAsTouched();
      this.salesVoucherFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllSalesVoucher() {
    this.salesapi.GetSalesVoucher().subscribe((data) => {
      this.salesVoucherarry = data.result;
      this.displayMaximizable = true;
      this.filterArray = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j?.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    )?.itemMasterItemName;
  }

  public getCurrencyName(id: number): string {
    return this.currency?.find((j) => j?.currencyMasterCurrencyId === id)
      ?.currencyMasterCurrencyName;
  }

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }
  public getBarCode(itemid, unit: number): string {
    // return this.units?.find(j => j.unitMasterUnitId === unit)?.unitDetailsBarcode;
    const item: any = this.ItemMasterArray?.filter(
      (j) => j.itemMasterItemId === itemid
    );
    return null;
    //item[0]?.unitDetails?.find((j) => j?.unitDetailsUnitId === unit)
    //   ?.unitDetailsBarcode;
  }
  public getPartyDetails(id) {
    this.partyDetails = this.CustomerMasterArray?.find(
      (j) => j.customerMasterCustomerNo === id
    );
  }

  public getPartyAddress(id): string {
    return this.locationArray?.find((j) => j.locationMasterLocationId === id)
      ?.locationMasterLocationName;
  }

  showMaximizableDialog(isTemplate: boolean) {
    this.callDropdowns(false);
    this.isTemplate = isTemplate;
    this.getAllSalesVoucher();
  }

  public getItemMasterPacking(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    )?.itemMasterPacking;
  }

  updateFormGrid(salesvoucher_update: SalesVoucher) {
    this.salesVoucherFormGroup.patchValue({
      salesVoucherId: this.isTemplate ? 0 : salesvoucher_update.salesVoucherId,
      salesVoucherNo: this.isTemplate ? '' : salesvoucher_update.salesVoucherNo,
      salesVoucherDate: this.isTemplate
        ? new Date()
        : new Date(salesvoucher_update.salesVoucherDate),
      salesVoucherRefNo: salesvoucher_update.salesVoucherRefNo,
      salesVoucherContPerson: salesvoucher_update.salesVoucherContPerson,
      salesVoucherCurrencyId: salesvoucher_update.salesVoucherCurrencyId,
      salesVoucherExcludeVat: salesvoucher_update.salesVoucherExcludeVat,
      salesVoucherCostCenterId: salesvoucher_update.salesVoucherCostCenterId,
      salesVoucherType: salesvoucher_update.salesVoucherType,
      salesVoucherPartyId: salesvoucher_update.salesVoucherPartyId,
      salesVoucherPartyName: salesvoucher_update.salesVoucherPartyName,
      salesVoucherPartyAddress: salesvoucher_update.salesVoucherPartyAddress,
      salesVoucherPartyVatNo: salesvoucher_update.salesVoucherPartyVatNo,
      salesVoucherDescription: salesvoucher_update.salesVoucherDescription,

      salesVoucherDlvNo: salesvoucher_update.salesVoucherDlvNo,
      salesVoucherDlvDate:
        salesvoucher_update.salesVoucherDlvDate != null
          ? new Date(salesvoucher_update.salesVoucherDlvDate)
          : null,
      salesVoucherSono: salesvoucher_update.salesVoucherSono,
      salesVoucherSodate:
        salesvoucher_update.salesVoucherSodate != null
          ? new Date(salesvoucher_update.salesVoucherSodate)
          : null,
      salesVoucherQtnNo: salesvoucher_update.salesVoucherQtnNo,
      salesVoucherQtnDate:
        salesvoucher_update.salesVoucherQtnDate != null
          ? new Date(salesvoucher_update.salesVoucherQtnDate)
          : null,

      salesVoucherSalesManId: salesvoucher_update.salesVoucherSalesManId,
      salesVoucherDptId: salesvoucher_update.salesVoucherDptId,
      salesVoucherEnqNo: salesvoucher_update.salesVoucherEnqNo,
      salesVoucherEnqDate:
        salesvoucher_update.salesVoucherEnqDate != null
          ? new Date(salesvoucher_update.salesVoucherEnqDate)
          : null,

      salesVoucherHeader: salesvoucher_update.salesVoucherHeader,
      salesVoucherDelivery: salesvoucher_update.salesVoucherDelivery,
      salesVoucherNotes: salesvoucher_update.salesVoucherNotes,
      salesVoucherFooter: salesvoucher_update.salesVoucherFooter,
      salesVoucherPaymentTerms: salesvoucher_update.salesVoucherPaymentTerms,
      salesVoucherSubject: salesvoucher_update.salesVoucherSubject,

      salesVoucherContent: salesvoucher_update.salesVoucherContent,
      salesVoucherRemarks1: salesvoucher_update.salesVoucherRemarks1,
      salesVoucherRemarks2: salesvoucher_update.salesVoucherRemarks2,
      salesVoucherTermsAndCondition:
        salesvoucher_update.salesVoucherTermsAndCondition,
      salesVoucherShippinAddress:
        salesvoucher_update.salesVoucherShippinAddress,

      salesVoucherLocationId: this.defaultLocationID,
      salesVoucherJobId: salesvoucher_update.salesVoucherJobId,

      salesVoucherTotalGrossAmount:
        salesvoucher_update.salesVoucherTotalGrossAmount,
      salesVoucherTotalItemDisAmount:
        salesvoucher_update.salesVoucherTotalItemDisAmount,
      salesVoucherTotalDisPer: salesvoucher_update.salesVoucherTotalDisPer,
      salesVoucherTotalDisAmount:
        salesvoucher_update.salesVoucherTotalDisAmount,
      salesVoucherVatPer: salesvoucher_update.salesVoucherVatPer,
      salesVoucherVatAmt: salesvoucher_update.salesVoucherVatAmt,
      salesVoucherTotalActualAmount:
        salesvoucher_update.salesVoucherTotalActualAmount,
      salesVoucherVatRoundSign: salesvoucher_update.salesVoucherVatRoundSign,
      salesVoucherVatRountAmt: salesvoucher_update.salesVoucherVatRountAmt,
      salesVoucherNetAmount: salesvoucher_update.salesVoucherNetAmount,
      deliveryRequriedOn: salesvoucher_update.deliveryRequriedOn,
      termsofDelivery: salesvoucher_update.termsofDelivery,
      projectRefNo: salesvoucher_update.projectRefNo,
      item: salesvoucher_update.item
    });

    this.getPartyDetails(salesvoucher_update.salesVoucherPartyId);

    const salesVoucherNetAmount: number =
      salesvoucher_update.salesVoucherNetAmount;
    this.wordamt = this.convertNumberToWordsWithDecimal(salesVoucherNetAmount);
    this.accountTransactionList = salesvoucher_update.accountsTransactions;
    const gridData: any[] = salesvoucher_update.salesVoucherDetails.map((k) => {
      const ItemId: string =
        k.salesVoucherDetailsMatId != null
          ? this.ItemMasterList?.find(
            (l) => l.value == k?.salesVoucherDetailsMatId
          )?.label
          : null;

      const UnitId: string =
        k.salesVoucherDetailsUnitId != null
          ? this.unitListt?.find((l) => l.value == k?.salesVoucherDetailsUnitId)
            ?.label
          : null;

      const avgPrice = k.avgPrice ?? 0; // ← if present in API; else keep 0
      const sellingPrice = k.salesVoucherDetailsRate ?? 0;
      const quantity = k.salesVoucherDetailsQuantity ?? 0;
      const profitPerUnit = sellingPrice - avgPrice;
      const totalProfit = profitPerUnit * quantity;

      return {
        itemId: k.salesVoucherDetailsMatId,
        itemname: k.salesVoucherDetailsItemName
          ? k.salesVoucherDetailsItemName
          : ItemId,
        unit: UnitId,
        Costprice: k?.salesVoucherDetailsCostPrice,
        qty: quantity,
        rate: sellingPrice,
        disc: k.salesVoucherDetailsDiscAmount,
        netAmt: k.salesVoucherDetailsNetAmt,
        vatAmt: k.salesVoucherDetailsVatAmt,
        grossAmt: k.salesVoucherDetailsGrossAmount,
        jobname: null,
        costcenter: null,
        narration: k.salesVoucherDetailsRemarks,
        SoId: k.salesVoucherDetailsSoId,
        SodId: k.salesVoucherDetailsSodId,
        avgPrice: avgPrice,
        profitPerUnit: profitPerUnit,
        totalProfit: totalProfit,
        purchaseRequisitionId: k.purchaseRequisitionId,
        id: this.isTemplate ? 0 : k.salesVoucherDetailsId,
      };
    });
    this.browseBTN = this.isTemplate ? true : false;
    this.salesvoucher_entryDataset = gridData;
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    hotInstance.updateSettings({
      data: gridData,
      readOnly: this.isTemplate ? false : true,
    });
    hotInstance.selectCell(0, 4);
    this.salesCharges_entry.readOnly = true;
    const ChargesGridData: any[] = salesvoucher_update.salesChargesList.map(
      (k) => {
        const data = this.chargeList?.find(
          (i: any) => i.serviceID == k.serviceID
        );
        return {
          voucherno: k.voucherno,
          serviceID: k.serviceID,
          serviceName: data.serviceName,
          amount: k.amount,
          taxIncAmount: k.taxIncAmount,
          remarks: k.remarks,
        };
      }
    );
    this.salesCharges_entryDataset = ChargesGridData;
    const hotInstanceCharges = this.hotRegisterer.getInstance(this.hotCid);
    hotInstanceCharges.updateSettings({
      data: ChargesGridData,
      readOnly: this.isTemplate ? false : true,
    });
    this.getSalesChargesTotal();
    this.salesVoucherFormGroup.disable();
    this.f.salesVoucherNo.clearValidators();
    this.salesVoucherFormGroup.updateValueAndValidity();
  }

  convertNumberToWordsWithDecimal(number: number): string {
    const toWords = new ToWords();

    const [integerPart, decimalPart] = number.toFixed(2).split('.');

    const integerWords = toWords.convert(parseInt(integerPart, 10));
    const decimalWords = toWords.convert(parseInt(decimalPart || '0', 10));

    let result = `${integerWords} `;

    if (decimalWords !== 'zero') {
      result += ` point ${decimalWords} `;
    }

    return result;
  }

  handleChange(e) {
    this.index = e.index;
    if (this.index == 2) {
      // this.showUserTracking();
    }
  }

  GetSavedSalesVoucherDetails(id: string) {
    this.index = 0;
    this.itemList = [];

    this.salesapi.GetSavedSalesVoucherDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          if (!this.isTemplate) {
            this.btnFlag = {
              edit: true,
              cancel: true,
              save: false,
              update: true,
              delete: true,
              new: true,
            };
          } else this.new();
          this.updateFormGrid(data.result);
          this.savedSalesVoucher = data.result;
          this.isTemplate
            ? this.salesVoucherFormGroup.enable()
            : this.salesVoucherFormGroup.disable();
          this.utilityService.reapplyLocationLock(
            this.salesVoucherFormGroup,
            'salesVoucherLocationId',
            this.locationLocked
          );
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Sales Voucher not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed'),
        });
        this.salesVoucherFormGroup.updateValueAndValidity();
      }
    );
  }
  GetSavedSalesVoucherDetailsBySaleVoucher(svNo: string) {
    this.index = 0;
    this.itemList = [];

    this.salesapi.GetSavedSalesVoucherDetailsBySaleVoucher(svNo).subscribe(
      (data) => {
        if (data !== null) {
          if (!this.isTemplate) {
            this.btnFlag = {
              edit: true,
              cancel: true,
              save: false,
              update: true,
              delete: true,
              new: true,
            };
          } else this.new();
          this.updateFormGrid(data.result);
          this.savedSalesVoucher = data.result;
          this.isTemplate
            ? this.salesVoucherFormGroup.enable()
            : this.salesVoucherFormGroup.disable();
          this.utilityService.reapplyLocationLock(
            this.salesVoucherFormGroup,
            'salesVoucherLocationId',
            this.locationLocked
          );
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Sales Voucher not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed'),
        });
        this.salesVoucherFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.salesapi.DeleteSalesVoucher(this.savedSalesVoucher).subscribe(
          (data) => {
            this.userTrackingLog('Delete');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: this.translate.instant(
                'Sales Voucher Deleted Succesfully'
              ),
            });
            this.new();
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: this.translate.instant('Failed'),
            });
          }
        );
      },
    });
  }

  cancel() {
    this.new();
    this.isTemplate = false;
    this.browseBTN = false;
  }

  edit() {
    this.salesvoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.salesVoucherNo.clearValidators();
    this.salesVoucherFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.salesVoucherFormGroup,
      'salesVoucherLocationId',
      this.locationLocked
    );

    if (this.locationLocked) {
      this.salesVoucherFormGroup.controls.salesVoucherLocationId?.disable();
    }
    this.salesVoucherFormGroup.controls.salesVoucherNo.disable();
    this.salesVoucherFormGroup.updateValueAndValidity();
    // if (this.salesVoucherFormGroup.controls.salesVoucherType.value == 'CARD') {
    //   this.getcardValue();
    // }
    // if (this.salesVoucherFormGroup.controls.salesVoucherType.value == 'CASH') {
    //   this.getcashacc();
    // }
    this.browseBTN = true;
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.salesvoucher_entryDataset.length > 0) {
      // this.salesvoucher_entry.data.forEach((value: GridData, index, arry) => {
      return Object.values(this.salesvoucher_entryDataset).some(
        (k: GridData) =>
          k.itemname != null && k.netAmt != null && !(k.rate == null)
      );
      // });
    }
    return false;
  }
  pipe = new DatePipe('en-US');

  showPrint(Vid: any, type) {
    const id = Vid
      ? Vid
      : this.salesVoucherFormGroup.getRawValue().salesVoucherId;
    this.rptFilter = {
      ReportName: type,
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        // `select * from vw_SalesInvoice where salesvoucherid=${this.salesVoucherFormGroup.getRawValue().salesVoucherId}`,
        `select * from vw_SalesInvoice where salesvoucherid=${id}`,
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

  selectsales(evt) {
    let trimmedSales = evt.sales?.trim();
    const includesPcs = this.units?.some((unit) =>
      unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
    );
    if (includesPcs && this.unitArray.length != 0) {
      var UnitId: any = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.salesId
      );
      this.unitDetailID = UnitId?.unitDetailsId;
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      const data = hotInstance.getDataAtRow(this.activeRow.row);

      hotInstance.setDataAtCell(
        this.activeRow.row,
        3,
        UnitId?.unitMasterUnitShortName
      );
      hotInstance.setDataAtCell(this.activeRow.row, 5, UnitId?.unitDetailsRate);

      this.updateCurrentItemStock(
        this.activeRow.row,
        data[0],
        UnitId?.unitMasterUnitId
      );

      this.GetAveragePurchasePriceGPC(data[0], data[4]);
    } else {
      if (this.clickedRowColumn.column == 0) {
        if (this.itemList.includes(evt.salesId)) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Duplicate Entry',
            detail: `${evt.salesId} is already exists in this table`,
          });
          return;
        }
        this.itemList[this.clickedRowColumn.row] = evt.procurementsId;
      }

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(
          this.activeRow.row,
          this.activeRow.column,
          evt.procurements
        );
      const locationId = Number(
        this.salesVoucherFormGroup.getRawValue()?.salesVoucherLocationId ??
          this.defaultLocationID
      );
      const customerId = Number(
        this.salesVoucherFormGroup.value?.salesVoucherPartyId ?? -1
      );

      const itemMaster$ =
        locationId && locationId > 0
          ? this.masterapi.GetItemMasterByIdAndLocation({
              id: evt.salesId,
              locationId: locationId,
              customerId: customerId > 0 ? customerId : undefined,
            })
          : this.masterapi.GetItemMasterById({
              id: evt.salesId,
              customerId: customerId > 0 ? customerId : undefined,
            });

      itemMaster$.subscribe((k) => {
        this.ItemMasterArrayByName = k.resultSet?.itemMaster;
        if (!this.ItemMasterArrayByName) {
          return;
        }
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        const row = this.activeRow.row;

        const unitDetails = this.ItemMasterArrayByName.unitDetails;
        this.unitDetailID = unitDetails?.unitDetailsId;
        if (unitDetails) {
          const unitId = unitDetails.unitDetailsUnitId;
          const unitLabel =
            unitId != null
              ? this.unitListt?.find((l) => l.value == unitId)?.label
              : null;

          hotInstance.setDataAtCell(
            row,
            0,
            this.ItemMasterArrayByName.itemMasterItemId
          );
          hotInstance.setDataAtCell(
            row,
            2,
            this.ItemMasterArrayByName.itemMasterItemName
          );
          hotInstance.setDataAtCell(row, 3, unitLabel);
          hotInstance.setDataAtCell(
            row,
            5,
            this.ItemMasterArrayByName.itemMasterUnitPrice ??
            unitDetails.unitDetailsRate
          );
          hotInstance.setDataAtCell(
            row,
            19,
            this.ItemMasterArrayByName.currentItemStock ?? 0
          ); // Stock
          const data = hotInstance.getDataAtRow(row);
          this.GetAveragePurchasePriceGPC(
            data[0],
            data[4],
            true,
            row,
            unitId
          ); // id, qty

          hotInstance.setDataAtCell(
            row,
            17,
            unitDetails.unitDetailsProfitPer ?? 0
          );
          this.hotRegisterer.getInstance(this.hotid).selectCell(row, 4);
        }
      });
    }
    if (evt.procurementsId) {
      this.masterapi
        .getStockReportBaseUnit(evt.salesId)
        .subscribe((response) => {
          this.avgCostItemAmount += response.result[0].amount;
        });
    }
    this.showSalesLookUp = false;
  }

  private updateCurrentItemStock(row: number, itemId: number, unitId: number) {
    const locationId = Number(
      this.salesVoucherFormGroup.getRawValue()?.salesVoucherLocationId ??
        this.defaultLocationID
    );
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);

    if (!itemId || !unitId || !locationId || locationId < 0) {
      hotInstance.setDataAtCell(row, 19, 0);
      return;
    }

    const selectedUnitName = this.unitArray?.find(
      (unit) => unit.unitMasterUnitId == unitId
    )?.unitMasterUnitShortName;

    this.masterapi.getItemStockByUnit(itemId, unitId, locationId).subscribe(
      (response) => {
        const currentRow = hotInstance.getDataAtRow(row);
        const currentUnit = currentRow?.[3]?.toString().trim();
        const expectedUnit = selectedUnitName?.toString().trim();
        if (
          currentRow?.[0] == itemId &&
          (!expectedUnit || !currentUnit || currentUnit === expectedUnit)
        ) {
          hotInstance.setDataAtCell(
            row,
            19,
            response?.isSuccess === true ? response.data : 0
          );
        }
      },
      () => {
        const currentRow = hotInstance.getDataAtRow(row);
        const currentUnit = currentRow?.[3]?.toString().trim();
        const expectedUnit = selectedUnitName?.toString().trim();
        if (
          currentRow?.[0] == itemId &&
          (!expectedUnit || !currentUnit || currentUnit === expectedUnit)
        ) {
          hotInstance.setDataAtCell(row, 19, 0);
        }
      }
    );
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
    this.chargeMasterLookUp = false;
  }
  selectChargeControl(evt) {
    const item: any = this.chargeList?.find(
      (i: any) => i.serviceName == evt.sales
    );
    const instance = this.hotRegisterer.getInstance(this.hotCid);
    instance.setDataAtCell(this.activeRow.row, 0, item.serviceID);
    instance.setDataAtCell(this.activeRow.row, 1, item.serviceName);
    instance.setDataAtCell(this.activeRow.row, 2, item.accountNo);
    instance.setDataAtCell(this.activeRow.row, 3, item.vatPer);
  }

  selectControl(evt) {
    this.control.setValue(evt.salesId);
    this.elementReference.nativeElement.value = evt.sales;
    this.formControlLookUp = false;
  }

  hide(evt: boolean) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
    this.chargeMasterLookUp = false;
  }

  filter() {
    let filteredArray = this.filterArray;

    if (this.salesVoucherFilterForm.value.salesVoucherPartyId != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.salesVoucherPartyId ===
          this.salesVoucherFilterForm.value.salesVoucherPartyId
      );
    }

    if (
      this.salesVoucherFilterForm.value.salesVoucherType != null &&
      this.salesVoucherFilterForm.value.salesVoucherType !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.salesVoucherType ===
          this.salesVoucherFilterForm.value.salesVoucherType
      );
    }

    if (this.salesVoucherFilterForm.value.isDate) {
      const fromDateStr = this.salesVoucherFilterForm.value.fromDate;
      const toDateStr = this.salesVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.salesVoucherDate);

        const fromDate = new Date(fromDateStr); // Ensure fromDateStr is in a valid date format
        const toDate = new Date(toDateStr); // Ensure toDateStr is in a valid date format

        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);

        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.salesVoucherarry = filteredArray;
    }
    this.salesVoucherarry = filteredArray;
  }

  ClearFilter() {
    this.salesVoucherFilterForm.reset();
    this.salesVoucherarry = this.filterArray;
    this.salesVoucherFilterForm.get('fromDate').setValue(new Date());
    this.salesVoucherFilterForm.get('toDate').setValue(new Date());
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

  BrowsPurchaseForm() {
      const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  this.dateFrom = today;
  this.dateTo = tomorrow; 
  this.isDate = true;
     this.LoadPR();
    this.displayMaximizable2 = true;
  }

  BrowsSalesOrder() {
    const ref = this.dialogService.open(SalesOrderStatusComponent, {
      header: 'Sales Order Status',
      width: '90%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {
        selectedLocation: this.defaultLocationID,
        selectedCustomer: this.salesVoucherFormGroup.get('salesVoucherPartyId')
          .value,
      },
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.selectValue(res);
      }
    });
  }

  BrowsDelivery() {
    const ref = this.dialogService.open(DelivertNoteComponent, {
      header: 'Delivery Note',
      width: '90%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {
        selectedCustomer: this.salesVoucherFormGroup.get('salesVoucherPartyId')
          .value,
      },
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.selectDELValue(res);
      }
    });
  }

  selectDELValue(evt: any[]) {
    let data: any = evt.map((value) => ({ dndId: value }));
    this.salesapi.DeliveryNoteByFilterById(data).subscribe((res: any) => {
      let activeRow = { row: 0, column: 0 };
      res.result.forEach((k) => {
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        hotInstance.setDataAtCell(activeRow.row, 0, k?.detailsItemId);
        hotInstance.setDataAtCell(
          activeRow.row,
          3,
          this.unitListt?.find((l) => l.value === k.detailsUnitId)?.label
        );
        hotInstance.setDataAtCell(activeRow.row, 2, k?.remarks);
        let amt = 0;
        amt = k?.detailsQTY * k?.detailsRate;
        hotInstance.setDataAtCell(activeRow.row, 4, k?.detailsQTY);
        hotInstance.setDataAtCell(activeRow.row, 5, k?.detailsRate);
        hotInstance.setDataAtCell(activeRow.row, 8, amt);
        hotInstance.setDataAtCell(activeRow.row, 11, amt);
        // customerDeliveryNoteDetailsRate
        activeRow.row += 1;
      });
      this.ColumnSum();
    });
  }

  selectValue(evt: any[]) {
    let activeRow = { row: 0, column: 0 };

    evt.forEach((k) => {
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      hotInstance.setDataAtCell(activeRow.row, activeRow.column, k?.itemId);
      hotInstance.setDataAtCell(
        activeRow.row,
        3,
        this.unitListt?.find((l) => l.value === k.unitId)?.label
      );
      hotInstance.setDataAtCell(activeRow.row, 5, k?.unitPrice);
      hotInstance.setDataAtCell(activeRow.row, 4, k?.quantity);
      hotInstance.setDataAtCell(
        activeRow.row,
        6,
        Number(k.quantity) * Number(k.unitPrice)
      );
      hotInstance.setDataAtCell(activeRow.row, 2, k?.matDes);
      hotInstance.setDataAtCell(activeRow.row, 1, '');
      hotInstance.setDataAtCell(activeRow.row, 17, k?.cpodId);
      hotInstance.setDataAtCell(activeRow.row, 18, k?.cpoId);
      activeRow.row += 1;
    });
  }
  selectPR(id: any[]) {
    let activeRow = this.activeRow
      ? { ...this.activeRow }
      : { row: 0, column: 0 };
    this.procurementapi
      .GetPurchaseRequisitionByFilterById(id)
      .subscribe((res: any) => {
        let evt = res.result;
        this.displayMaximizable2 = false;
        evt.forEach((k) => {
          const hotInstance = this.hotRegisterer.getInstance(this.hotid);
          hotInstance.setDataAtCell(activeRow.row, 0, k?.matId);
          hotInstance.setDataAtCell(activeRow.row, 2, k?.item_Name);
          hotInstance.setDataAtCell(activeRow.row, 3, k?.unit);
          hotInstance.setDataAtCell(activeRow.row, 5, k?.rate);
          hotInstance.setDataAtCell(activeRow.row, 4, k?.srq);
          hotInstance.setDataAtCell(
            activeRow.row,
            6,
            Number(k.srq) * Number(k.rate)
          );
          hotInstance.setDataAtCell(
            activeRow.row,
            8,
            Number(k.srq) * Number(k.rate)
          );
          hotInstance.setDataAtCell(
            activeRow.row,
            11,
            Number(k.srq) * Number(k.rate)
          );
          hotInstance.setDataAtCell(activeRow.row, 1, '');
          hotInstance.setDataAtCell(activeRow.row, 20, k?.srid);
          activeRow.row += 1;
        });
      });
  }

  userTrackingLog(type) {
    let req = {
      page: 'SalesVoucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.salesVoucherFormGroup.get('salesVoucherNo').value,
      vpType: 'SalesVoucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }
  openProformaInvoice() {
    // const ref = this.dialogService.open(ProformaInvoiceStatusComponent, {
    //   data: {
    //     selectedCustomer: this.salesVoucherFormGroup.value.Customer || 0,
    //     selectedLocation: this.salesVoucherFormGroup.value.Location || 0,
    //   },
    //   header: 'Proforma Invoice Status',
    //   width: '70%',
    //   styleClass: 'dynamicDialog',
    // });

    // ref.onClose.subscribe((res) => {
    //   if (res) {
    //     // Replicates the exact working pattern from your reference method
    //     this.selectValue(res);
    //   }
    // });
    this.isProformaModalOpen = true;
  }
  // GetAllProformaInvoicesData(){
  //   this.GetAllProformaInvoicesData().subscribe((data:any) => {
  //     this.proformaInvoiceData = data.result;
  //   });
  // }
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
  Costprice?: number;
  itemId?: number;
  partNo?: string;
  itemname?: string;
  unit?: string;
  qty?: number;
  rate?: number;
  amt?: number;
  disc?: number;
  purchaseRequisitionId?: number;
  grossAmt?: number;
  vatPer?: number;
  vatAmt?: number;
  netAmt?: number;
  narration?: string;
  jobname?: string;
  costcenter?: string;
  SoId?: number;
  SodId?: number;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
export const columnServiceDetailList = (component: SalesvoucherComponent) => [
  {
    data: 'serviceID',
    type: 'text',
    label: 'Service Id',
    toolTip: 'Service Id',
    width: 40,
  },
  {
    data: 'serviceName',
    type: 'text',
    label: 'Service Name',
    width: 85,
  },
  {
    data: 'accountNo',
    type: 'numeric',
    label: 'Account No',
    toolTip: 'Account Number',
  },
  {
    data: 'vatPer',
    type: 'numeric',
    label: 'Vat Per',
    readOnly: false,
  },
  {
    data: 'amount',
    type: 'numeric',
    label: 'Amount',
    readOnly: false,
    width: 50,
  },
  {
    data: 'netAmount',
    type: 'numeric',
    label: 'Net Amount',
    readOnly: false,
    width: 50,
  },
  {
    data: 'remarks',
    type: 'text',
    label: 'Remarks',
    readOnly: false,
    width: 70,
  },
];

export const columnDetailList = (component: SalesvoucherComponent) => [
  {
    data: 'itemId',
    type: 'text',
    label: 'Item Id',
    toolTip: 'Item Id',
    width: 40,
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
    width: 40,
  },
  {
    data: 'itemname',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
    width: 100,
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    toolTip: 'Unit Name',
    width: 50,
    source: component.unitArry,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
    readOnly: false,
    width: 50,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Rate',
    readOnly: false,
    width: 50,
  },
  {
    data: 'amt',
    type: 'numeric',
    label: 'Amt',
    toolTip: 'Amount',
    width: 80,
  },
  {
    data: 'disc',
    type: 'numeric',
    label: 'Disc.',
    toolTip: 'Discount',
    readOnly: false,
    width: 50,
  },
  {
    data: 'grossAmt',
    type: 'numeric',
    label: 'Gross Amt',
    toolTip: 'Gross Amount',
    width: 60,
  },
  {
    data: 'vatPer',
    type: 'numeric',
    label: 'VAT%.',
    toolTip: 'VAT Percentage',
    width: 60,
  },
  {
    data: 'vatAmt',
    type: 'numeric',
    label: 'VAT.Amt',
    toolTip: 'VAT Amount',
    width: 60,
  },
  {
    data: 'netAmt',
    type: 'numeric',
    label: 'Net.Amt',
    toolTip: 'Net Amount',
    readOnly: true,
    width: 60,
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    toolTip: 'Narration',
    readOnly: false,
    width: 80,
  },
  {
    data: 'jobname',
    type: 'dropdown',
    label: 'Job Name',
    toolTip: 'Job Name',
    source: component.jobArry,
    width: 60,
  },
  {
    data: 'costcenter',
    type: 'dropdown',
    label: 'Cost Center',
    toolTip: 'Cost Center',
    source: component.costcenterArry,
    width: 60,
  },
  {
    data: 'id',
    type: 'numeric',
    label: '-',
    toolTip: 'Sales Voucher Detail ID',
    width: 80,
  },
  {
    data: 'Costprice',
    type: 'numeric',
    label: 'Cost Price',
    toolTip: 'Cost Price',
    width: 60,
    readOnly: false,
  },
  {
    data: 'SodId',
    type: 'numeric',
    label: '-',
    toolTip: 'Sales Order Detail ID',
    width: 80,
  },
  {
    data: 'SoId',
    type: 'numeric',
    label: '-',
    toolTip: 'Sales Order ID',
    width: 80,
  },
  {
    data: 'currentItemStock',
    type: 'numeric',
    label: 'Current Stock',
    toolTip: 'Current Stock',
    width: 60,
  },
  {
    data: 'purchaseRequisitionId',
    type: 'numeric',
    label: '-',
    toolTip: 'Current Stock',
    width: 60,
  },
  {
    data: null,
    renderer: component.buttonRenderer.bind(component),
    label: 'View',
    toolTip: 'View',
    width: 40,
  },
];
