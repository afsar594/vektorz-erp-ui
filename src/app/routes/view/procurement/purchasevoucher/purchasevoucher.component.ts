import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  MenuItem,
  SelectItem,
  MessageService,
  ConfirmationService,
} from 'primeng';
import { Subject, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import {
  ChartofAccounts,
  CurrencyMaster,
  ItemMaster,
} from 'src/app/routes/domain';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { defaults } from 'src/app/shared/service/settings';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PurchaseVoucher } from 'src/app/routes/domain/Procurements/PurchaseVoucher';
import { PurchaseVoucherDetails } from 'src/app/routes/domain/Procurements/PurchaseVoucherDetails';
import { LoginService } from 'src/app/routes/service/login.service';
import { ToWords } from 'to-words';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { ChargesService } from 'src/app/routes/service/charges.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { DecimalConfigService } from 'src/app/routes/service/decimal-config.service';

@Component({
  selector: 'app-purchasevoucher',
  templateUrl: './purchasevoucher.component.html',
  styleUrls: ['./purchasevoucher.component.scss'],
})
export class PurchasevoucherComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('suppCtrl', { static: false }) supplierCtrol: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;

  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  date = new Date();
  lookupGridColumns = [];
  dataList: Array<any> = [];
  showProcurementsLookUp: boolean = false;
  formControlLookUp: boolean = false;
  btnFlag: ButtonFlag = {
    edit: false,
    cancel: false,
    save: true,
    update: false,
    delete: false,
  };
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;

  //btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];
  unitAry: any;
  unitListt: any;
  units: any;
  pagedRequest: PagedRequest;

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;
  SupplierMasterArrayById: SuppliersMaster = null;
  brandArry: VendorMaster[] = [];
  Permission: any;
  ScreenId: number;
  VatCalculation: Boolean = false;
  JOBCOST: Boolean = false;
  ItemMasterArrayByName: any = null;
  funitid: number;

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  locationLocked = false;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  chargeMasterLookUp: boolean = false;
  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  purchaseVoucherarry: any;
  // savedPurchaseVoucherGridData: GridData[] = [];
  savedPurchaseVoucher: PurchaseVoucher;

  width = `50%`;
  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  displayPrintPreview: boolean = false;
  userId: number;
  purchaseAccount: string;
  VatAccount: string;
  stockAccount: string;
  currency: CurrencyMaster[] = [];
  wordamt: string;
  currentRow: number;
  filterArray: any;
  voucherId: string;
  voucherNo: string;
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  cashAccount: any;
  RoundOffAccount: any;
  vatPer: number;
  selectedjob: any;
  selectedjobiD: any;
  isTemplate: boolean = false;
  loadList: any;
  defaultLocationID = -1;
  // locationLocked: boolean = false;
  isServerSearch = false;
  purchasevoucherChargesTotalAmount: any;
  purchasevoucherCharges_entryDataset: any;
  pdfSource: string;
  DECIMAL_VALUE: any;
  decimals: number = 2;
  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.v_typeList = [
      { label: 'Select Type', value: '' },
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
    ];
    this.v_RoundoffList = [
      { label: '+', value: '+' },
      { label: '-', value: '-' },
    ];
  }
  itemList = [];
  clickedRowColumn = { row: -1, column: -1 };
  initializepurchasevoucherChargesControls() {
    // this.getAllAccountTransaction();
    const hiddenColumns = [0, 4, 5, 6];
    this.purchasevoucherCharges_entry = this.utilityService.getTableConfig(
      columnServiceDetailList(this),
      hiddenColumns,
      { height: '150px', minRows: 3 }
    );
    this.purchasevoucherCharges_entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      const hotInstance = this.hotRegisterer.getInstance(this.hotCid);
      if (
        this.purchasevoucher_entry.readOnly === false &&
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
      if (
        column === 1 &&
        this.purchasevoucherCharges_entry.readOnly === false
      ) {
        this.isServerSearch = false;
        this.lookupGridColumns = ['Service Name', 'Account No'];
        //this.lookupGridColumns = ['Brand', 'Item', 'ItemID', 'Size'];
        this.dataList = this.chargeSetLookup;
        hotInstance.deselectCell();
        this.chargeMasterLookUp = true;
        this.activeRow = { row, column };
      }
    };

    this.purchasevoucherCharges_entry.beforeChangeRender = (change, source) => {
      this.getpurchasevoucherChargesTotal();
    };
  }

  selectChargeControl(evt) {
    const item: any = this.chargeList?.find(
      (i: any) => i.serviceName == evt.purchase
    );
    const instance = this.hotRegisterer.getInstance(this.hotCid);
    instance.setDataAtCell(this.activeRow.row, 0, item.serviceID);
    instance.setDataAtCell(this.activeRow.row, 1, item.serviceName);
    instance.setDataAtCell(this.activeRow.row, 3, item.accountNo);
    instance.setDataAtCell(this.activeRow.row, 4, item.vatPer);
    this.chargeMasterLookUp = false;
  }

  getpurchasevoucherChargesTotal() {
    this.purchasevoucherChargesTotalAmount =
      this.purchasevoucherCharges_entryDataset
        ?.filter((d) => d.serviceID != undefined)
        .reduce((total, item) => total + (item.amount || 0), 0);
    this.GetTotal();
  }
  chargeArray: any[] = [];
  chargeList: any[] = [];
  chargeArry: string[] = [];
  get chargeSetLookup() {
    return this.chargeArray?.map((kl: any) => ({
      purchase: kl?.serviceName,
      purchaseId: kl?.accountNo,
    }));
  }

  GetAllChargeMaster() {
    this.chargesService
      .GetAllOtherChargesMasterByType('Purchase')
      .subscribe((res: any) => {
        this.chargeArray = res;
        this.chargeList = res;
      });
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private Procurementapi: ProcurementApiService,
    private accountapi: AccountApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private loginser: LoginService,
    private permission: PermissionsService,
    private storage: LocalStorageService,
    private chargesService: ChargesService,
    private crystalReportService: CrystalReportService,
    private decimalConfig: DecimalConfigService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.defaultLocationID = this.utilityService.getLockedLocationId();
    this.locationLocked = this.defaultLocationID > 0;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'purchasevoucher_HotEntry';
  hotCid = 'purchasevoucherCharges_HotEntry';
  purchasevoucherCharges_entry: Handsontable.GridSettings;
  purchasevoucher_entry: Handsontable.GridSettings;
  purchaseVoucherFormGroup: FormGroup;
  purchaseVoucherFilterForm: FormGroup;
  purchasevoucher_entryDataset = [];
  // accountTransactionDataset = [];
  cols;
  ngAfterViewInit() { }

  ngOnInit(): void {
    this.decimals = this.decimalConfig.getDecimal();
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
    this.activatedroute.queryParams.subscribe((params) => {
      this.voucherId = params['id'];
      this.voucherNo = params['pvNo'];
      if (this.voucherId) {
        this.GetSavedPurchaseVoucherDetails(this.voucherId);
      }
      if (this.voucherNo) {
        this.GetSavedPurchaseVoucherDetailsByPurchaseVoucher(this.voucherNo);
      }
      this.getReportType();
    });

    this.FILL_COMBO();

    this.cols = [
      { field: 'purchaseVoucherVoucherNo', header: 'Voucher No' },
      { field: 'purchaseVoucherPurchaseDate', header: 'Date' },
      { field: 'purchaseVoucherPartyName', header: 'Party' },
      { field: 'currencyMasterCurrencyName', header: 'Currency' },
      { field: 'jobname', header: 'Job' },

      { field: 'purchaseVoucherDescription', header: 'Narration' },
      { field: 'purchaseVoucherTotalGrossAmt', header: 'Gross.Amt' },
      { field: 'purchaseVoucherTotalDisAmount', header: 'Disc.Amt' },
      { field: 'purchaseVoucherVATAmount', header: 'Vat.Amt' },
      // { field: 'purchaseVoucherVatRoundSign', header: 'Round.Sign' },
      // { field: 'purchaseVoucherVatRoundAmount', header: 'Round.Amt' },
      { field: 'purchaseVoucherNetAmount', header: 'Net.Amt' },
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
    this.initializepurchasevoucherChargesControls();
    this.purchaseVoucherFormGroup = this.fb.group({
      purchaseVoucherPurID: [0],
      purchaseVoucherVoucherNo: [{ value: '', disabled: true }],
      purchaseVoucherPurchaseDate: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      purchaseVoucherPurchaseRef: [{ value: '', disabled: true }],
      purchaseVoucherSupplyInvoiceNo: [{ value: '', disabled: true }],
      purchaseVoucherCurrencyID: [-1, [DropDownValidator]],
      purchaseVoucherExcludeVat: [{ value: false, disabled: true }],

      purchaseVoucherPurchaseType: [-1],
      purchaseVoucherPartyID: [-1, [DropDownValidator]],
      purchaseVoucherPartyName: [{ value: '', disabled: true }],
      purchaseVoucherPartyAddress: [{ value: '', disabled: true }],
      purchaseVoucherPartyVatNo: [{ value: '', disabled: true }],
      purchaseVoucherDescription: [{ value: '', disabled: true }],

      purchaseVoucherGrNo: [{ value: null, disabled: true }],
      purchaseVoucherGrDate: [{ value: null, disabled: true }],
      purchaseVoucherLpoNo: [{ value: null, disabled: true }],
      purchaseVoucherLpoDate: [{ value: null, disabled: true }],
      purchaseVoucherQuatationNo: [{ value: null, disabled: true }],
      purchaseVoucherQuatationDate: [{ value: null, disabled: true }],
      purchaseVoucherPoNo: [{ value: null, disabled: true }],
      purchaseVoucherBatchCode: [{ value: null, disabled: true }],
      purchaseVoucherDayBookNo: [{ value: null, disabled: true }],
      purchaseVoucherJobId: [-1],
      purchaseVoucherLocationID: [this.defaultLocationID],

      purchaseVoucherTotalGrossAmt: [{ value: [0], disabled: true }],
      purchaseVoucherTotalItemDisAmount: [{ value: [0], disabled: true }],
      purchaseVoucherDiscountPercentage: [{ value: [0], disabled: true }],
      purchaseVoucherTotalDiscountAmt: [{ value: [0], disabled: true }],
      purchaseVoucherVatPercentage: [{ value: [0], disabled: true }],
      purchaseVoucherVATAmount: [{ value: [0], disabled: true }],
      purchaseVoucherActualAmount: [{ value: [0], disabled: true }],
      purchaseVoucherVatRoundSign: [{ value: '-', disabled: true }],
      purchaseVoucherVatRoundAmount: [{ value: [0], disabled: true }],
      purchaseVoucherNetAmount: [{ value: [0], disabled: true }],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });

    this.purchaseVoucherFilterForm = this.fb.group({
      purchaseVoucherPartyID: [null],
      purchaseVoucherType: [null],
      isDate: [],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.userId = this.loginser.GetCredentialData().userId;
    this.purchaseVoucherFormGroup.disable();
    this.LoadLocationDDL();
    this.bykeys();
  }
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
  private destroy$ = new Subject<void>();
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
    const hiddenColumns = [0, 1, 6, 9, 10, 12, 15, 16, 17]; // Hide itemId, partNo, amt, vatPer, costcenter, id, conversionType, jobid
    if (this.hideJobDetail) {
      hiddenColumns.push(13);
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

  get f() {
    return this.purchaseVoucherFormGroup.controls;
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    return Math.max(0, 10 - salesVoucherDetailsLength);
  }

  initializeControls() {
    this.LoadAccountSettingDDL();
    this.LoadBrandDDL();
    const hiddenColumns = [0, 1, 6, 9, 10, 12, 13, 14, 15, 16, 17];

    this.purchasevoucher_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns
    );

    this.purchasevoucher_entry.afterSelection = (
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
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      this.currentRow = row;
      if (column === 2 && this.purchasevoucher_entry.readOnly === false) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item', 'ItemID'];
        this.dataList = this.itemSetLookup;
        hotInstance.deselectCell();
        this.onSearch('');
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 3 &&
        this.purchasevoucher_entry.readOnly === false
      ) {
        this.isServerSearch = false;
        var data = hotInstance.getDataAtRow(row);
        hotInstance.deselectCell();
        this.getUnitByItemId(data[0]);
        this.lookupGridColumns = ['Unit', 'Unit ID'];

        this.activeRow = { row, column };
      } else if (
        column === 13 &&
        this.purchasevoucher_entry.readOnly === false
      ) {
        this.isServerSearch = false;
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        hotInstance.deselectCell();
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      } else {
        this.showProcurementsLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.procurements == x);
      } else {
        this.selectItem = {};
      }
    };

    this.purchasevoucher_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showProcurementsLookUp = false;
      if (change[0][1] === 0) {
        this.showProcurementsLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.purchasevoucher_entry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);

        if (data[4] != null && data[5] != null && change[0][1] != 'netAmt') {
          //&& data[7] != null
          // data[4]=data[4]  * ( data[16]? data[16]:1)
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
            // var vatAmount =
            //   this.purchaseVoucherFormGroup.value.purchaseVoucherVatPercentage >
            //   0
            //     ? (result *
            //         this.purchaseVoucherFormGroup.value
            //           .purchaseVoucherVatPercentage) /
            //       100
            //     : 0;
            // var sum = result + (this.VatCalculation ? vatAmount : 0);
            if (this.currentRow >= 0 && data[0] != null) {
              if (
                this.purchasevoucher_entryDataset[this.currentRow].itemId ===
                undefined
              ) {
                return;
              }
              this.purchasevoucher_entryDataset[this.currentRow].grossAmt =
                totalSum;
              // this.purchasevoucher_entryDataset[this.currentRow].vatAmt =
              //   vatAmount;
              this.purchasevoucher_entryDataset[this.currentRow].netAmt =
                result;

              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data: this.purchasevoucher_entryDataset });
            }
          }
        }
      }

      this.ColumnSum();
    };

    this.purchasevoucher_entry.afterChange = (r, c) => { };
    this.purchasevoucher_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.itemList.splice(index, 1);
      this.ColumnSum();
    };

    this.purchasevoucher_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }
  LoadAccountSettingDDL() {
    this.utilityService.LoadDropdownaccountsSettings().subscribe((r: any) => {
      var res = r.resultSet.accountsSettings;
      const splitText = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Purchase Account'
      )?.accountSettingsAccountTextValue;
      const parts = splitText.split('::');
      this.purchaseAccount = parts[1]?.trim();

      const splitText1 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Vat Input'
      )?.accountSettingsAccountTextValue;
      const parts1 = splitText1.split('::');
      this.VatAccount = parts1[1]?.trim();
      const splitText2 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Stock Account'
      )?.accountSettingsAccountTextValue;
      const parts2 = splitText2.split('::');
      this.stockAccount = parts2[1]?.trim();
      const splitText12 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Cash Account'
      )?.accountSettingsAccountTextValue;
      const parts12 = splitText12.split('::');
      this.cashAccount = parts12[1]?.trim();

      const splitText5 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Round Off'
      )?.accountSettingsAccountTextValue;
      const parts5 = splitText5.split('::');
      this.RoundOffAccount = parts5[1]?.trim();
    });
  }
  LoadBrandDDL() {
    this.utilityService.LoadDropdownBrandMasters().subscribe((r: any) => {
      this.brandArry = r.resultSet.brandMasters;
    });
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  userTrackingLog(type, vno?: any) {
    let req = {
      page: 'Purchase Voucher ',
      // section: this.savedPurchaseVoucher,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: vno,
      vpType: 'Purchase Voucher ',
      vpUserId: this.permission.getUser()?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  openSupplier() {
    this.control = this.f.purchaseVoucherPartyID;
    this.elementReference = this.supplierCtrol;
    this.lookupGridColumns = ['Supplier', 'Supplier ID'];
    this.formControlLookUp = true;
    this.selectItem = {
      procurements: this.supplierCtrol.nativeElement.value,
      procurementsId: this.f.purchaseVoucherPartyID.value,
    };
    this.dataList = this.supplierLookup;

    // this.purchaseOrderFormGroup.controls.purchaseOrderContPerson = this.dataList
  }

  ColumnSum() {
    var discountTotal = 0;
    var disc = 0;
    this.purchasevoucher_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.disc && elemt && elemt.qty) {
        discountTotal += elemt.disc * elemt.qty;
      }
    });
    disc += discountTotal;
    this.purchaseVoucherFormGroup.controls.purchaseVoucherTotalItemDisAmount.setValue(
      parseFloat(disc.toFixed(this.decimals))
    );
    var netAmt = 0;
    this.purchasevoucher_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.netAmt) {
        netAmt += elemt.netAmt;
      }
    });
    this.purchaseVoucherFormGroup.controls.purchaseVoucherNetAmount.setValue(
      parseFloat(netAmt.toFixed(this.decimals))
    );
    var value = 0;
    this.purchasevoucher_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.grossAmt) {
        value += elemt.grossAmt;
      }
    });
    this.purchaseVoucherFormGroup.controls.purchaseVoucherTotalGrossAmt.setValue(
      parseFloat(value.toFixed(this.decimals))
    );

    this.GetTotal();
  }

  CalcDiscFromPer() {
    this.purchaseVoucherFormGroup.controls.purchaseVoucherTotalDiscountAmt.setValue(
      parseFloat(
        (
          (Number(
            this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt
          ) *
            Number(
              this.purchaseVoucherFormGroup.value
                .purchaseVoucherDiscountPercentage
            )) /
          100
        ).toFixed(this.decimals)
      )
    );
    this.GetTotal();
  }

  CalcDiscFromAmt() {
    this.purchaseVoucherFormGroup.controls.purchaseVoucherDiscountPercentage.setValue(
      parseFloat(
        (
          Number(
            this.purchaseVoucherFormGroup.value
              .purchaseVoucherTotalDiscountAmt * 100
          ) /
          Number(
            this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt
          )
        ).toFixed(this.decimals)
      )
    );
    this.GetTotal();
  }

  public getCurrencyName(id: number): string {
    return this.currency?.find((j) => j?.currencyMasterCurrencyId === id)
      ?.currencyMasterCurrencyName;
  }

  GetTotal($event = null) {

    const form = this.purchaseVoucherFormGroup;
    const val = form.value;

    // VAT percentage
    val.purchaseVoucherVatPercentage = val.purchaseVoucherExcludeVat
      ? 0
      : val.purchaseVoucherVatPercentage || 5;

    const grossAmt = Number(val.purchaseVoucherTotalGrossAmt) || 0;
    const discountAmt = Number(val.purchaseVoucherTotalDiscountAmt) || 0;
    const itemDiscountAmt = Number(val.purchaseVoucherTotalItemDisAmount) || 0;
    const vatPerc = Number(val.purchaseVoucherVatPercentage) || 0;
    const vatRoundAmt = Number(val.purchaseVoucherVatRoundAmount) || 0;
    const roundSign = val.purchaseVoucherVatRoundSign || '-';

    if (this.VatCalculation) {
      const actualAmt = grossAmt.toFixed(this.decimals);
      const vatAmt = ((grossAmt * vatPerc) / 100).toFixed(this.decimals);

      form.controls.purchaseVoucherActualAmount.setValue(actualAmt);
      form.controls.purchaseVoucherVATAmount.setValue(vatAmt);

      const netAmt =
        roundSign === '+'
          ? Number(actualAmt) + Number(vatAmt) - discountAmt + vatRoundAmt
          : Number(actualAmt) + Number(vatAmt) - discountAmt - vatRoundAmt;

      form.controls.purchaseVoucherNetAmount.setValue(
        netAmt.toFixed(this.decimals)
      );
    }

    // Actual amount after discount
    form.controls.purchaseVoucherActualAmount.setValue(grossAmt - discountAmt);

    // Net amount calculation
    const netAmtFinal =
      roundSign === '+'
        ? grossAmt -
        discountAmt +
        Number(form.value.purchaseVoucherVATAmount) +
        vatRoundAmt -
        itemDiscountAmt
        : grossAmt -
        discountAmt +
        Number(form.value.purchaseVoucherVATAmount) -
        vatRoundAmt -
        itemDiscountAmt;

    form.controls.purchaseVoucherNetAmount.setValue(
      netAmtFinal.toFixed(this.decimals)
    );

    // Ensure round sign defaults to '-'
    val.purchaseVoucherVatRoundSign = roundSign;
  }

  ngOnDestroy(): void {
    // Crucial for memory leak prevention: unsubscribe from all observables
    // this.destroy$.next();
    // this.destroy$.complete();
  }

  // Helper function to calculate VAT Amount from Percentage
  calculateVatAmount(vatPer: any) {
    const actual = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount || 0
    );
    vatPer = Number(vatPer);

    if (vatPer != null && !isNaN(vatPer)) {
      const vatAmount = (actual * vatPer) / 100;
      // Mark the other control as dirty before setting value to prevent its valueChanges from triggering immediately
      this.purchaseVoucherFormGroup
        .get('purchaseVoucherVATAmount')
        ?.markAsDirty();
      this.purchaseVoucherFormGroup
        .get('purchaseVoucherVATAmount')
        ?.setValue(vatAmount.toFixed(this.decimals), { emitEvent: false }); // Use { emitEvent: false } to prevent an immediate loop
      this.GetTotal();
    }
  }

  // Helper function to calculate VAT Percentage from Amount
  calculateVatPercentage(vatAmt: any) {
    const actual = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount || 0
    );
    vatAmt = Number(vatAmt);

    // avoid divide by zero & keep clean
    if (actual > 0 && vatAmt != null && !isNaN(vatAmt)) {
      const vatPer = (vatAmt / actual) * 100;
      // Mark the other control as dirty before setting value to prevent its valueChanges from triggering immediately
      this.purchaseVoucherFormGroup
        .get('purchaseVoucherVatPercentage')
        ?.markAsDirty();
      this.purchaseVoucherFormGroup
        .get('purchaseVoucherVatPercentage')
        ?.setValue(vatPer.toFixed(this.decimals), { emitEvent: false }); // Use { emitEvent: false } to prevent an immediate loop
      this.GetTotal();
    }
  }
  // onVatPercentageChange() {
  //   this.purchaseVoucherFormGroup
  //     .get('purchaseVoucherVatPercentage')
  //     ?.valueChanges.subscribe((vatPer) => {
  //       const actual = Number(
  //         this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount
  //       );

  //       if (vatPer != null && vatPer !== '' && !isNaN(vatPer)) {
  //         const vatAmount = (actual * vatPer) / 100;

  //         this.purchaseVoucherFormGroup
  //           .get('purchaseVoucherVATAmount')
  //           ?.setValue(vatAmount.toFixed(this.decimals));

  //         this.updateVatInTable();
  //       }
  //     });
  // }
  // onVatAmountChange() {
  //   this.purchaseVoucherFormGroup
  //     .get('purchaseVoucherVATAmount')
  //     ?.valueChanges.subscribe((vatAmt) => {
  //       const actual = Number(
  //         this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount
  //       );

  //       // avoid divide by zero & keep clean
  //       if (actual > 0 && vatAmt != null && vatAmt !== '' && !isNaN(vatAmt)) {
  //         const vatPer = (vatAmt / actual) * 100;

  //         this.purchaseVoucherFormGroup
  //           .get('purchaseVoucherVatPercentage')
  //           ?.setValue(vatPer.toFixed(this.decimals));

  //         this.updateVatInTable();
  //       }
  //     });
  // }
  updateVatInTable() {
    const vatPer = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherVatPercentage
    );

    const hot = this.hotRegisterer.getInstance(this.hotid);

    for (let i = 0; i < this.purchasevoucher_entryDataset.length; i++) {
      const row = this.purchasevoucher_entryDataset[i];

      const qty = Number(row.qty || row[4]);
      const rate = Number(row.rate || row[5]);
      const disc = Number(row.discount || row[7]) ?? 0;

      if (qty > 0 && rate > 0) {
        const gross = qty * rate;
        const discValue = disc * qty;
        const result = gross - discValue;

        const vatAmount = this.VatCalculation ? (result * vatPer) / 100 : 0;

        const net = result + vatAmount;

        row.grossAmt = gross;
        row.vatAmt = vatAmount;
        row.netAmt = net;
      }
    }

    hot.updateSettings({ data: this.purchasevoucher_entryDataset });

    this.ColumnSum();
  }

  public getPartyAddress(id): string {
    return this.SupplierMasterArray?.find(
      (j) => j.suppliersMasterSupplierId === id
    )?.suppliersMasterSupplierAddress;
    // return this.locationArray?.find(j => j.locationMasterLocationId === id)?.locationMasterLocationName;
  }

  get supplierLookup() {
    return this.SupplierMasterList.map((kl) => ({
      procurements: kl.label,
      procurementsId: kl.value,
    }));
  }
  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl?.itemMasterItemName,
      procurementsId: kl?.itemMasterItemId,
      barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
      // size: kl?.itemMasterItemSize,
      // brand: this.brandArry?.find(
      //   (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
      // )?.vendorMasterVendorName,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      procurements: kl.unitMasterUnitShortName,
      procurementsId: kl.unitMasterUnitId,
    }));
  }

  private parseDateOnly(value: any): Date | null {
    if (!value) return null;

    if (value instanceof Date && !isNaN(value.getTime())) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    const dateOnlyText = String(value).split('T')[0];
    const parts = dateOnlyText.split('-');
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }

    const parsedDate = new Date(value);
    if (isNaN(parsedDate.getTime())) return null;
    return new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate()
    );
  }

  private toDateOnlyString(value: any): string | null {
    const date = this.parseDateOnly(value);
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  savePurchaseVoucher() {
    this.purchaseVoucherFormGroup.markAllAsTouched();

    const savedData: any = this.purchasevoucher_entryDataset?.filter((k) =>
      k.hasOwnProperty('itemname')
    );
    const purchaseVoucher_Save: PurchaseVoucher = this.purchaseVoucherFormGroup
      .value as PurchaseVoucher;

    purchaseVoucher_Save.purchaseVoucherPurID = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherPurID
    );
    purchaseVoucher_Save.purchaseChargesList = this.purchaseChargesList(
      this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherVoucherNo
    );
    purchaseVoucher_Save.purchaseVoucherVoucherNo =
      this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherVoucherNo;
    const purchaseVoucherDate = this.toDateOnlyString(
      this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseDate
    );
    purchaseVoucher_Save.purchaseVoucherPurchaseDate =
      purchaseVoucherDate as any;
    purchaseVoucher_Save.purchaseVoucherPurchaseRef =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef;
    purchaseVoucher_Save.purchaseVoucherSupplyInvoiceNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherSupplyInvoiceNo;
    purchaseVoucher_Save.purchaseVoucherCurrencyID =
      this.purchaseVoucherFormGroup.value.purchaseVoucherCurrencyID;
    purchaseVoucher_Save.purchaseVoucherExcludeVat =
      this.purchaseVoucherFormGroup.value.purchaseVoucherExcludeVat;
    //purchaseVoucher_Save.purchaseVoucherExcludeVat = true;

    purchaseVoucher_Save.purchaseVoucherPurchaseType =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseType;
    //purchaseVoucher_Save.purchaseVoucherType = 'CASH';

    purchaseVoucher_Save.purchaseVoucherPartyID =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPartyID;
    purchaseVoucher_Save.purchaseVoucherPartyName =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPartyName;
    // purchaseVoucher_Save.purchaseVoucherPartyName = 'PARTY NAME';
    purchaseVoucher_Save.purchaseVoucherPartyAddress =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPartyAddress;
    purchaseVoucher_Save.purchaseVoucherPartyVatNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherPartyVatNo;
    purchaseVoucher_Save.purchaseVoucherDescription =
      this.purchaseVoucherFormGroup.value.purchaseVoucherDescription;

    purchaseVoucher_Save.purchaseVoucherGrNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherGrNo;
    purchaseVoucher_Save.purchaseVoucherGrDate =
      this.purchaseVoucherFormGroup.value.purchaseVoucherGrDate;
    purchaseVoucher_Save.purchaseVoucherLpoNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherLpoNo;
    purchaseVoucher_Save.purchaseVoucherLpoDate =
      this.purchaseVoucherFormGroup.value.purchaseVoucherLpoDate;
    purchaseVoucher_Save.purchaseVoucherQuatationNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherQuatationNo;
    purchaseVoucher_Save.purchaseVoucherQuatationDate =
      this.purchaseVoucherFormGroup.value.purchaseVoucherQuatationDate;

    purchaseVoucher_Save.purchaseVoucherPoNo = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherPoNo
    );
    purchaseVoucher_Save.purchaseVoucherBatchCode =
      this.purchaseVoucherFormGroup.value.purchaseVoucherBatchCode;
    purchaseVoucher_Save.purchaseVoucherDayBookNo =
      this.purchaseVoucherFormGroup.value.purchaseVoucherDayBookNo;
    purchaseVoucher_Save.purchaseVoucherLocationID =
      this.purchaseVoucherFormGroup.get('purchaseVoucherLocationID')?.value;
    purchaseVoucher_Save.purchaseVoucherJobId =
      this.purchaseVoucherFormGroup.value.purchaseVoucherJobId;

    purchaseVoucher_Save.purchaseVoucherTotalGrossAmt = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt
    );
    purchaseVoucher_Save.purchaseVoucherTotalItemDisAmount = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherTotalItemDisAmount
    );
    purchaseVoucher_Save.purchaseVoucherDiscountPercentage = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherDiscountPercentage
    );
    purchaseVoucher_Save.purchaseVoucherTotalDiscountAmt = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherTotalDiscountAmt
    );
    purchaseVoucher_Save.purchaseVoucherVatPercentage = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherVatPercentage
    );
    purchaseVoucher_Save.purchaseVoucherVATAmount = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherVATAmount
    );
    purchaseVoucher_Save.purchaseVoucherActualAmount = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherActualAmount
    );
    purchaseVoucher_Save.purchaseVoucherVatRoundSign =
      this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundSign;
    //purchaseVoucher_Save.purchaseVoucherVatRoundSign = '-';
    purchaseVoucher_Save.purchaseVoucherVatRoundAmount = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherVatRoundAmount
    );
    purchaseVoucher_Save.purchaseVoucherNetAmount = Number(
      this.purchaseVoucherFormGroup.value.purchaseVoucherNetAmount
    );

    purchaseVoucher_Save.purchaseVoucherDetails = savedData
      ?.filter((k) => k.itemname != null && k.netAmt != null)
      .map((k: GridData) => {
        return {
          purchaseVoucherDetailsId: k.id != null ? k.id : 0,
          purchaseVoucherDetailsNo: this.isTemplate
            ? ''
            : this.purchaseVoucherFormGroup.getRawValue()
              .purchaseVoucherVoucherNo,

          purchaseVoucherId: this.isTemplate
            ? 0
            : this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherPurID,
          purchaseVoucherDetailsMaterialId:
            k.itemId ??
            (k.itemname != null && k.itemname !== ''
              ? this.ItemMasterArray?.find(
                (j) => j.itemMasterItemName?.trim() === k.itemname?.trim()
              ).itemMasterItemId
              : null),
          purchaseVoucherDetailsItemName: k.itemname,
          purchaseVoucherDetailsQuantity: k.qty,
          purchaseVoucherDetailsDiscountAmoutPurchase: k.disc ? k.disc : 0,
          purchaseVoucherDetailsRate: k.rate,
          purchaseVoucherDetailsNetAmount: k.netAmt,
          purchaseVoucherDetailsGrossAmount: k.grossAmt,
          purchaseVoucherDetailsVatAmount: k.vatAmt, // 0,
          purchaseVoucherDetailsRemarks: k.narration,
          purchaseVoucherDetailsSno: k.id, // 0,

          purchaseVoucherDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                (x) => x.unitMasterUnitShortName?.trim() === k.unit?.trim()
              )?.unitMasterUnitId
              : null,
          purchaseVoucherDetailsFsno: 1,
          purchaseVoucherDetailsLoacationId:
            this.purchaseVoucherFormGroup.get('purchaseVoucherLocationID')
              ?.value,
          purchaseVoucherDetailsAmount: k.qty * k.rate,
          purchaseVoucherDetailsFcAmount: k.qty * k.rate,
          purchaseVoucherDetailsJobID: k.jobid,
          purchaseVoucherDetailsDelStatus: false,
        };
      });

    purchaseVoucher_Save.accountsTransactions = [];
    /// supplier
    const creditData: AccountsTransactions = {
      accountsTransactionsAccNo:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseType ==
          'CASH'
          ? this.cashAccount
          : this.SupplierMasterArray?.find(
            (o) =>
              o.suppliersMasterSupplierId ==
              this.purchaseVoucherFormGroup.value.purchaseVoucherPartyID
          )?.suppliersMasterSupplierReffAcNo,
      accountsTransactionsTransDate: purchaseVoucherDate as any,
      accountsTransactionsParticulars:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsCredit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherNetAmount
      ),
      accountsTransactionsFcCredit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherNetAmount
      ),
      accountsTransactionsAllocBalance:
        this.purchaseVoucherFormGroup.value.purchaseVoucherNetAmount,
      accountsTransactionsFcAllocBalance: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherNetAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherVoucherNo,
      accountsTransactionsDescription:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsCurrencyId:
        this.purchaseVoucherFormGroup.value.purchaseVoucherCurrencyID,
    };
    purchaseVoucher_Save.accountsTransactions.push(creditData);
    ///vat
    const receivableVat: AccountsTransactions = {
      accountsTransactionsAccNo: this.VatAccount,
      accountsTransactionsTransDate: purchaseVoucherDate as any,
      accountsTransactionsParticulars:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsDebit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherVATAmount
          ? this.purchaseVoucherFormGroup.value.purchaseVoucherVATAmount
          : 0
      ),
      accountsTransactionsFcDebit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherVATAmount
          ? this.purchaseVoucherFormGroup.value.purchaseVoucherVATAmount
          : 0
      ),
      accountsTransactionsAllocBalance:
        this.purchaseVoucherFormGroup.value.purchaseVoucherVATAmount,
      accountsTransactionsFcAllocBalance: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherVATAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherVoucherNo,
      accountsTransactionsDescription:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsCurrencyId:
        this.purchaseVoucherFormGroup.value.purchaseVoucherCurrencyID,
    };
    purchaseVoucher_Save.accountsTransactions.push(receivableVat);
    /// purchse
    const debitData: AccountsTransactions = {
      accountsTransactionsAccNo: this.stockAccount,
      accountsTransactionsTransDate: purchaseVoucherDate as any,
      accountsTransactionsParticulars:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsDebit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt
      ),
      accountsTransactionsFcDebit: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt
      ),
      accountsTransactionsAllocBalance:
        this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt,
      accountsTransactionsFcAllocBalance: Number(
        this.purchaseVoucherFormGroup.value.purchaseVoucherTotalGrossAmt
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.purchaseVoucherFormGroup.getRawValue().purchaseVoucherVoucherNo,
      accountsTransactionsDescription:
        this.purchaseVoucherFormGroup.value.purchaseVoucherPurchaseRef,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.userId,
      accountsTransactionsCurrencyId:
        this.purchaseVoucherFormGroup.value.purchaseVoucherCurrencyID,
    };
    purchaseVoucher_Save.accountsTransactions.push(debitData);

    if (this.btnFlag.save) {
      this.saveVoucher(purchaseVoucher_Save);
    } else {
      purchaseVoucher_Save.accountsTransactions
        ?.filter((x) => x.accountsTransactionsTransSno != 0)
        .forEach((element, index, arry) => {
          arry[index].accountstransactionsDelStatus = true;
        });

      this.updateVoucher(purchaseVoucher_Save);
    }
  }

  zerovat() {
    if (this.f.purchaseVoucherExcludeVat.value) {
      this.purchaseVoucherFormGroup.controls.purchaseVoucherVatPercentage.setValue(
        0
      );
      this.GetTotal();
    } else {
      this.purchaseVoucherFormGroup.controls.purchaseVoucherVatPercentage.setValue(
        this.vatPer
      );
      this.GetTotal();
    }
  }

  validateTotalDrCrAmounts(): boolean {
    if (
      this.purchaseVoucherFormGroup.getRawValue()
        .purchaseVoucherTotalGrossAmt == 0 &&
      this.purchaseVoucherFormGroup.getRawValue()
        .purchaseVoucherTotalItemDisAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant(
          'Total Credit and Debit Amounts are Zero'
        ),
      });
      return false;
    }

    if (
      this.purchaseVoucherFormGroup.getRawValue()
        .purchaseVoucherTotalGrossAmt == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Total  Gross Amount Is Zero'),
      });
      return false;
    }

    return true;
  }

  saveVoucher(purchaseVoucher_Save: PurchaseVoucher) {
    if (this.purchaseVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.Procurementapi.InsertPurchaseVoucher(
              purchaseVoucher_Save
            ).subscribe(
              (data: any) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.isTemplate = false;
                this.userTrackingLog(
                  'Insert',
                  data.result?.purchaseVoucherVoucherNo
                );
                this.savedPurchaseVoucher = data.result;
                this.updateFormGrid(data.result);
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
                  detail: this.translate.instant('Payment Voucher Save Failed'),
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
      this.purchaseVoucherFormGroup.markAllAsTouched();
      this.purchaseVoucherFormGroup.markAsDirty();
    }
  }
  purchaseChargesList(voucherNo: any) {
    return this.purchasevoucherCharges_entryDataset
      ?.filter((d) => d !== null && d.serviceID > 0)
      .map((d) => {
        return {
          voucherno: voucherNo,
          serviceID: d.serviceID,
          amount: d.amount,
          taxIncAmount: d.netAmount,
          remarks: d.remarks,
          fromSupplier: d.fromSupplier,
        };
      });
  }
  updateVoucher(purchaseVoucher_Save: PurchaseVoucher) {
    console.log('updateVoucher called with:', purchaseVoucher_Save);
    if (this.purchaseVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to update existing voucher?'
        ),
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.Procurementapi.UpdatePurchaseVoucher(
              purchaseVoucher_Save
            ).subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.savedPurchaseVoucher = data.result;
                this.userTrackingLog(
                  'Insert',
                  data.result?.purchaseVoucherVoucherNo
                );

                this.updateFormGrid(data.result);
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: this.translate.instant(
                    'Purchase Voucher Updated Succesfully'
                  ),
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: this.translate.instant(
                    'Purchase Voucher Update Failed'
                  ),
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
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.purchaseVoucherFormGroup.markAllAsTouched();
      this.purchaseVoucherFormGroup.markAsDirty();
    }
  }

  getAccountSetting() {
    this.masterapi.getAccountSetting().subscribe((res: any) => {
      const splitText = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Purchase Account'
      )?.accountSettingsAccountTextValue;
      const parts = splitText.split('::');
      this.purchaseAccount = parts[1]?.trim();

      const splitText1 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Vat Output'
      )?.accountSettingsAccountTextValue;
      const parts1 = splitText1.split('::');
      this.VatAccount = parts1[1]?.trim();
    });
  }

  getAllPurchaseVoucher() {
    this.Procurementapi.GetPurchaseVoucher().subscribe((data: any) => {
      data.result.map((i) => {
        i.jobname =
          i.purchaseVoucherJobId == -1
            ? ''
            : this.getJobName(i.purchaseVoucherJobId);
        return i;
      });
      this.purchaseVoucherarry = data.result;
      this.filterArray = data.result;
    });
  }
  printbtn: MenuItem[];
  getReportType() {
    this.masterapi.General('GRN').subscribe((res: any) => {
      this.printbtn = res.map((r: any) => ({
        label: r.reportTypeDescription,
        command: () => this.showPrint(r.reportTypeFileName),
      }));
    });
  }
  rptFilter: ReportFilterModel;

  showPrint(report) {
    this.rptFilter = {
      ReportName: report,
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_grn  where purchase_voucher_pur_id=${this.savedPurchaseVoucher.purchaseVoucherPurID}`,
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

  getUnitBarcode(unit: number, item) {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === item
    )?.unitDetails?.find((j) => j.unitDetailsUnitId === unit)
      ?.unitDetailsBarcode;
  }
  getItemMasterPacking(id: any) {
    return this.ItemMasterArray?.find((j) => j.itemMasterItemId === id)
      ?.itemMasterPacking;
  }

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  new() {
    this.itemList = [];
    this.purchaseVoucherFormGroup.reset();
    this.purchasevoucher_entry.data = [];
    this.purchasevoucher_entryDataset = [];
    this.purchasevoucherCharges_entry.readOnly = false;
    this.purchasevoucher_entry.readOnly = false;
    this.purchaseVoucherFormGroup.controls.purchaseVoucherVatRoundSign.setValue(
      '-'
    );
    this.purchaseVoucherFormGroup.controls.purchaseVoucherPurchaseType.setValue(
      'CREDIT'
    );

    (this.supplierCtrol.nativeElement.value = ''),
      this.hotRegisterer
        .getInstance(this.hotid)
        .updateSettings(this.purchasevoucher_entry);

    this.accountTransactionList = [];
    this.purchaseVoucherFormGroup.get('purchaseVoucherPurID').setValue(null);
    this.purchaseVoucherFormGroup.get('purchaseVoucherPartyID').setValue(-1);
    this.purchaseVoucherFormGroup.get('purchaseVoucherJobId').setValue(-1);
    this.purchaseVoucherFormGroup.get('purchaseVoucherCurrencyID').setValue(-1);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.index = 0;
    this.purchaseVoucherFormGroup.enable();
    this.purchaseVoucherFormGroup
      .get('purchaseVoucherLocationID')
      .setValue(this.defaultLocationID);
    this.utilityService.reapplyLocationLock(
      this.purchaseVoucherFormGroup,
      'purchaseVoucherLocationID',
      this.locationLocked
    );
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.purchaseVoucherFormGroup,
        'purchaseVoucherLocationID'
      );
    }

    this.f.purchaseVoucherPurchaseDate.setValue(new Date());
    this.f.purchaseVoucherLpoDate.setValue(new Date());
    this.f.purchaseVoucherQuatationDate.setValue(new Date());
    this.f.purchaseVoucherGrDate.setValue(new Date());
    this.f.purchaseVoucherVoucherNo.clearValidators();
    this.purchaseVoucherFormGroup.updateValueAndValidity();

    this.purchaseVoucherFormGroup.get('purchaseVoucherVoucherNo').disable();
    this.updateTableConfiguration();
    this.callDropdowns(false);
  }
  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.LoadJobDDL();
    this.LoadUnitDDL();
    this.GetAllChargeMaster();
    this.LoadCurrancyDDL();
    this.LoadLocationDDL();
    this.LoadSupplierDDL();
    this.GetDefaultSettings();
  }

  LoadLocationDDL() {
    this.utilityService.LoadDropdownLocationMaster().subscribe((r: any) => {
      this.loadList = r?.resultSet ?? {};
      const list = r?.resultSet?.locationMaster ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x: any) => x.locationMasterLocationStatus != false)
        .map((kl: any) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({
        label: '--Select Location--',
        value: -1,
      });
      this.locationArry = list.map((ar) =>
        ar.locationMasterLocationName?.trim()
      );
      this.locationLocked = this.utilityService.applyLocationLock(
        this.purchaseVoucherFormGroup,
        'purchaseVoucherLocationID'
      );
    });
  }

  LoadCurrancyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.currencyMasters) {
        this.currency = this.loadList.currencyMasters;
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
        this.unitArry = this.loadList.unitMasters.map((ar) =>
          ar?.unitMasterUnitShortName?.trim()
        );
      }
    });
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
          this.f.purchaseVoucherCurrencyID.setValue(Number(this.DefCurrency));
        }
      }
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );

      if (DEFAULT_LOCATION != null && !this.locationLocked) {
        this.DefLocCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocCheck !== null) {
          const splitText = this.DefLocCheck.split('::');
          this.DefLocid = splitText[1]?.trim();
          // this.f.purchaseVoucherLocationID.setValue(Number(this.DefLocid));
          this.f.purchaseVoucherLocationID.setValue(this.defaultLocationID);
        }
      }

      var VAT_Calculation = list?.find(
        (a) => a.generalSettingsKeyValue == 'VAT_Calculation'
      );
      var vatcal = VAT_Calculation?.generalSettingsBoolValue;

      this.VatCalculation = vatcal ?? false;

      const regex = /([a-zA-Z\s]+)(\d+)%?/; // Matches letters and numbers

      const match = m.resultSet.optionSettings.optionsMasterType.match(regex);

      const textPart = match[1]?.trim(); // "VAT"
      const numericPart = parseInt(match[2], 10);
      this.vatPer = numericPart;

      this.purchaseVoucherFormGroup.controls.purchaseVoucherVatPercentage.setValue(
        this.VatCalculation ? this.vatPer : 0
      );

      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      this.JOBCOST = HIDE_JOBCOST[0]?.generalSettingsBoolValue ?? false;
    });
  }

  showMaximizableDialog(istem) {
    this.isTemplate = istem;
    this.callDropdowns(false);
    this.getAllPurchaseVoucher();
    this.displayMaximizable = true;
  }

  updateFormGrid(purchasevoucher_update: PurchaseVoucher) {
    this.purchaseVoucherFormGroup.patchValue({
      purchaseVoucherPurID: this.isTemplate
        ? 0
        : purchasevoucher_update.purchaseVoucherPurID,
      purchaseVoucherVoucherNo: this.isTemplate
        ? ''
        : purchasevoucher_update.purchaseVoucherVoucherNo,
      purchaseVoucherPurchaseDate: this.isTemplate
        ? new Date()
        : this.parseDateOnly(purchasevoucher_update.purchaseVoucherPurchaseDate),
      purchaseVoucherPurchaseRef:
        purchasevoucher_update.purchaseVoucherPurchaseRef,
      purchaseVoucherSupplyInvoiceNo:
        purchasevoucher_update.purchaseVoucherSupplyInvoiceNo,
      purchaseVoucherCurrencyID:
        purchasevoucher_update.purchaseVoucherCurrencyID,
      purchaseVoucherExcludeVat:
        purchasevoucher_update.purchaseVoucherExcludeVat,

      purchaseVoucherPurchaseType:
        purchasevoucher_update.purchaseVoucherPurchaseType,
      purchaseVoucherPartyID: purchasevoucher_update.purchaseVoucherPartyID,
      purchaseVoucherPartyName: purchasevoucher_update.purchaseVoucherPartyName,
      purchaseVoucherPartyAddress:
        purchasevoucher_update.purchaseVoucherPartyAddress,
      purchaseVoucherPartyVatNo:
        purchasevoucher_update.purchaseVoucherPartyVatNo,
      purchaseVoucherDescription:
        purchasevoucher_update.purchaseVoucherDescription,

      purchaseVoucherGrNo: purchasevoucher_update.purchaseVoucherGrNo,
      purchaseVoucherGrDate:
        purchasevoucher_update.purchaseVoucherGrDate != null
          ? new Date(purchasevoucher_update.purchaseVoucherGrDate)
          : null,
      purchaseVoucherLpoNo: purchasevoucher_update.purchaseVoucherLpoNo,
      purchaseVoucherLpoDate:
        purchasevoucher_update.purchaseVoucherLpoDate != null
          ? new Date(purchasevoucher_update.purchaseVoucherLpoDate)
          : null,
      purchaseVoucherQuatationNo:
        purchasevoucher_update.purchaseVoucherQuatationNo,
      purchaseVoucherQuatationDate:
        purchasevoucher_update.purchaseVoucherQuatationDate != null
          ? new Date(purchasevoucher_update.purchaseVoucherQuatationDate)
          : null,

      purchaseVoucherPoNo: purchasevoucher_update.purchaseVoucherPoNo,
      purchaseVoucherBatchCode: purchasevoucher_update.purchaseVoucherBatchCode,
      purchaseVoucherDayBookNo: purchasevoucher_update.purchaseVoucherDayBookNo,
      purchaseVoucherLocationID: this.defaultLocationID,
      purchaseVoucherJobId: purchasevoucher_update.purchaseVoucherJobId,

      purchaseVoucherTotalGrossAmt:
        purchasevoucher_update.purchaseVoucherTotalGrossAmt,
      purchaseVoucherTotalItemDisAmount:
        purchasevoucher_update.purchaseVoucherTotalItemDisAmount,
      purchaseVoucherDiscountPercentage:
        purchasevoucher_update.purchaseVoucherDiscountPercentage,
      purchaseVoucherTotalDiscountAmt:
        purchasevoucher_update.purchaseVoucherTotalDiscountAmt,
      purchaseVoucherVatPercentage:
        purchasevoucher_update.purchaseVoucherVATPercentage,
      purchaseVoucherVATAmount: purchasevoucher_update.purchaseVoucherVATAmount,

      purchaseVoucherActualAmount:
        purchasevoucher_update.purchaseVoucherActualAmount,
      purchaseVoucherVatRoundSign:
        purchasevoucher_update.purchaseVoucherVatRoundSign,
      purchaseVoucherVatRoundAmount:
        purchasevoucher_update.purchaseVoucherVatRoundAmount,
      purchaseVoucherNetAmount: purchasevoucher_update.purchaseVoucherNetAmount,
    });
    this.supplierCtrol.nativeElement.value = this.SupplierMasterList?.find(
      (k) => k?.value === purchasevoucher_update?.purchaseVoucherPartyID
    )?.label;

    if (this.locationCtrol && this.locationCtrol.nativeElement) {
      this.locationCtrol.nativeElement.value = this.locationList?.find(
        (k) => k?.value === purchasevoucher_update?.purchaseVoucherLocationID
      )?.label;
    }
    this.accountTransactionList = purchasevoucher_update.accountsTransactions;
    const gridData: GridData[] =
      purchasevoucher_update.purchaseVoucherDetails.map((k) => {
        const ItemId: string =
          k.purchaseVoucherDetailsMaterialId != null
            ? this.ItemMasterList?.find(
              (l) => l.value == k.purchaseVoucherDetailsMaterialId
            ) != undefined &&
              this.ItemMasterList?.find(
                (l) => l.value == k.purchaseVoucherDetailsMaterialId
              ) != null
              ? this.ItemMasterList?.find(
                (l) => l.value == k.purchaseVoucherDetailsMaterialId
              ).label
              : null
            : null;
        const UnitId: string =
          k.purchaseVoucherDetailsUnitId != null
            ? this.unitListt?.find(
              (l) => l.value == k.purchaseVoucherDetailsUnitId
            ).label
            : null;
        let jobname =
          k.purchaseVoucherDetailsJobID != null
            ? this.jobList?.find(
              (l) => l.value == k?.purchaseVoucherDetailsJobID
            )?.label
            : null;

        const qty = Number(k.purchaseVoucherDetailsQuantity) || 0;
        const rate = Number(k.purchaseVoucherDetailsRate) || 0;
        const disc = Number(k.purchaseVoucherDetailsDiscountAmoutPurchase) || 0;
        const grossAmt =
          k.purchaseVoucherDetailsGrossAmount != null
            ? Number(k.purchaseVoucherDetailsGrossAmount)
            : parseFloat((qty * rate).toFixed(this.decimals || 2));
        const netAmt =
          k.purchaseVoucherDetailsNetAmount != null
            ? Number(k.purchaseVoucherDetailsNetAmount)
            : parseFloat((grossAmt - disc * qty).toFixed(this.decimals || 2));

        return {
          itemId: k.purchaseVoucherDetailsMaterialId,
          itemname: k.purchaseVoucherDetailsItemName ?? ItemId,
          unit: UnitId,
          qty: k.purchaseVoucherDetailsQuantity,
          rate: k.purchaseVoucherDetailsRate,
          disc: k.purchaseVoucherDetailsDiscountAmoutPurchase,
          netAmt: netAmt,
          vatAmt: k.purchaseVoucherDetailsVatAmount,
          grossAmt: grossAmt,
          jobname: jobname,
          jobid: k.purchaseVoucherDetailsJobID,
          costcenter: null,

          narration: k.purchaseVoucherDetailsRemarks,
          id: this.isTemplate ? 0 : k.purchaseVoucherDetailsPurcahseDetailsId,
        };
      });

    const salesVoucherNetAmount: number =
      purchasevoucher_update.purchaseVoucherTotalGrossAmt;
    this.wordamt = this.convertNumberToWordsWithDecimal(salesVoucherNetAmount);

    this.purchasevoucher_entryDataset = gridData;
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    hotInstance.updateSettings({
      data: gridData,
      readOnly: this.isTemplate ? false : true,
    });
    this.purchasevoucher_entry.readOnly = true;
    hotInstance.selectCell(0, 4);
    this.f.purchaseVoucherVoucherNo.clearValidators();
    this.purchaseVoucherFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  convertNumberToWordsWithDecimal(number: number): string {
    const toWords = new ToWords();

    const [integerPart, decimalPart] = number.toFixed(this.decimals).split('.');

    const integerWords = toWords.convert(parseInt(integerPart, 10));
    const decimalWords = toWords.convert(parseInt(decimalPart || '0', 10));

    let result = `${integerWords} `;

    if (decimalWords !== 'zero') {
      result += ` point ${decimalWords} `;
    }

    return result;
  }

  GetSavedPurchaseVoucherDetails(id: string) {
    this.index = 0;
    this.itemList = [];

    this.Procurementapi.GetSavedPurchaseVoucherDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          if (this.isTemplate) {
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
            this.purchaseVoucherFormGroup.disable();
          }
          this.accountTransactionList = data.result.accountsTransactions;

          this.updateFormGrid(data.result);
          this.savedPurchaseVoucher = data.result;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Purchase Voucher not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.purchaseVoucherFormGroup.updateValueAndValidity();
      }
    );
  }
  GetSavedPurchaseVoucherDetailsByPurchaseVoucher(pvNo: string) {
    this.index = 0;
    this.itemList = [];

    this.Procurementapi.GetSavedPurchaseVoucherDetailsByPurchaseVoucher(
      pvNo
    ).subscribe(
      (data) => {
        if (data !== null) {
          if (this.isTemplate) {
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
            this.purchaseVoucherFormGroup.disable();
          }
          this.accountTransactionList = data.result.accountsTransactions;

          this.updateFormGrid(data.result);
          this.savedPurchaseVoucher = data.result;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Purchase Voucher not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.purchaseVoucherFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to delete voucher?'),
      accept: () => {
        this.Procurementapi.DeletePurchaseVoucher(
          this.savedPurchaseVoucher
        ).subscribe(
          (data: any) => {
            this.userTrackingLog(
              'Insert',
              data.result?.purchaseVoucherVoucherNo
            );

            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: this.translate.instant(
                'Purchase Voucher Deleted Succesfully'
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
  }

  edit() {
    this.purchasevoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.purchaseVoucherVoucherNo.clearValidators();
    this.purchaseVoucherFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseVoucherFormGroup,
      'purchaseVoucherLocationID',
      this.locationLocked
    );
    this.purchaseVoucherFormGroup.controls.purchaseVoucherVoucherNo.disable();
    this.purchaseVoucherFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
    this.updateTableConfiguration();
    // this.GetDefaultSettings();
  }

  public get IsValidGrid(): boolean {
    if (this.purchasevoucher_entryDataset.length > 0) {
      return Object.values(this.purchasevoucher_entryDataset).some(
        (k: GridData) =>
          k.itemname != null && k.netAmt != null && !(k.rate == null)
      );
      // });
    }
    return false;
  }

  selectprocurements(evt) {
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);

    if (evt.job) {
      this.selectedjob = evt.job;
      this.selectedjobiD = evt.jobId;

      hotInstance.setDataAtCell(this.activeRow.row, 13, evt?.job);
      hotInstance.setDataAtCell(this.activeRow.row, 17, evt?.jobId);
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
          evt.procurements
        );
        this.masterapi
          .GetItemMasterByIdAndLocation({
            id: evt.procurementsId,
            locationId: this.defaultLocationID,
            customerId:
              this.purchaseVoucherFormGroup.value.purchaseVoucherPartyID,
          })
          .subscribe((k) => {
            this.ItemMasterArrayByName = k.resultSet?.itemMaster;

            hotInstance.setDataAtCell(
              this.activeRow.row,
              2,
              this.ItemMasterArrayByName.itemMasterItemName
            );

            if (this.ItemMasterArrayByName.unitDetails) {
              const unitId =
                this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
              // hotInstance.setDataAtCell(
              //   this.activeRow.row,
              //   3,
              //   this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType
              // );
              const UnitId: string =
                unitId != null
                  ? this.unitListt?.find((l) => l.value == unitId).label
                  : null;
              hotInstance.setDataAtCell(
                this.activeRow.row,
                0,
                this.ItemMasterArrayByName.itemMasterItemId
              );
              hotInstance.setDataAtCell(this.activeRow.row, 3, UnitId);
              hotInstance.setDataAtCell(
                this.activeRow.row,
                5,
                this.ItemMasterArrayByName.unitDetails?.unitDetailsRate
              );
              hotInstance.setDataAtCell(
                this.activeRow.row,
                16,
                this.ItemMasterArrayByName.unitDetails
                  ?.unitDetailsConversionType
              );
              if (this.selectedjobiD) {
                hotInstance.setDataAtCell(
                  this.activeRow.row,
                  13,
                  this.selectedjob
                );
                hotInstance.setDataAtCell(
                  this.activeRow.row,
                  17,
                  this.selectedjobiD
                );
              }
            }
          });
      }
    }
    this.showProcurementsLookUp = false;
  }

  getUnitByItemId(id) {
    this.unitArray = [];
    this.masterapi.GetUnitDetails(id).subscribe((res) => {
      this.unitArray = res.result;
      this.dataList = this.unitSetLookup;
      this.unitArry = res.result.map((ar) =>
        ar.unitMasterUnitShortName?.trim()
      );
      this.showProcurementsLookUp = true;
    });
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

    this.masterapi.GetAllSupplierById(evt.procurementsId).subscribe((k) => {
      this.SupplierMasterArrayById = k.result;
      this.purchaseVoucherFormGroup.controls.purchaseVoucherPartyName.setValue(
        this.SupplierMasterArrayById.suppliersMasterSupplierName
      );
      this.purchaseVoucherFormGroup.controls.purchaseVoucherPartyAddress.setValue(
        this.SupplierMasterArrayById?.suppliersMasterSupplierAddress
          ? this.SupplierMasterArrayById?.suppliersMasterSupplierAddress
          : ''
        // (
        //   this.SupplierMasterArrayById.suppliersMasterSupplierPoBox +
        //   ' ,' +
        //   this.SupplierMasterArrayById?.suppliersMasterSupplierTel1 +
        //   ',' +
        //   this.SupplierMasterArrayById.suppliersMasterSupplierMobile
        // ).toString()
      );
      this.purchaseVoucherFormGroup.controls.purchaseVoucherPartyVatNo.setValue(
        this.SupplierMasterArrayById.suppliersMasterSupplierVatNo
      );
    });
  }

  hide(evt: boolean) {
    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
    this.chargeMasterLookUp = false;
  }
  filter() {
    let filteredArray = this.filterArray;
    if (this.purchaseVoucherFilterForm.value.purchaseVoucherPartyID != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.purchaseVoucherPartyId ===
          this.purchaseVoucherFilterForm.value.purchaseVoucherPartyID
      );
    }

    if (
      this.purchaseVoucherFilterForm.value.purchaseVoucherType != null &&
      this.purchaseVoucherFilterForm.value.purchaseVoucherType !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.purchaseVoucherPurchaseType ===
          this.purchaseVoucherFilterForm.value.purchaseVoucherType
      );
    }
    if (this.purchaseVoucherFilterForm.value.isDate) {
      const fromDateStr = this.purchaseVoucherFilterForm.value.fromDate;
      const toDateStr = this.purchaseVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      // filteredArray = filteredArray?.filter((res) => {
      //   const voucherDate = new Date(res.purchaseVoucherPurchaseDate);

      //   voucherDate.setHours(0, 0, 0, 0);
      //   fromDate.setHours(0, 0, 0, 0);

      //   return voucherDate.getTime() >= fromDate.getTime() && voucherDate.getTime() <= toDate.getTime() || voucherDate.getTime() === fromDate.getTime();;
      // });

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.purchaseVoucherPurchaseDate);
        const fromDate = new Date(fromDateStr); // Ensure fromDateStr is in a valid date format
        const toDate = new Date(toDateStr); // Ensure toDateStr is in a valid date format
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);

        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.purchaseVoucherarry = filteredArray;
    }
    this.purchaseVoucherarry = filteredArray;
  }
  ClearFilter() {
    this.purchaseVoucherFilterForm.reset();
    this.purchaseVoucherarry = this.filterArray;
    this.purchaseVoucherFilterForm.get('fromDate').setValue(new Date());
    this.purchaseVoucherFilterForm.get('toDate').setValue(new Date());
  }

  get jobSetLookup() {
    return this.jobList.map((kl) => ({
      job: kl.label,
      jobId: kl.value,
    }));
  }

  public getJobName(unit: number): string {
    return this.jobList?.find((j) => j?.value === unit)?.label;
  }

  onSearch(term: string) {
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
        this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
          label: kl?.itemMasterItemName,
          value: kl.itemMasterItemId,
        }));
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

interface GridData {
  itemId?: any;
  partNo?: any;
  itemname?: string;
  unit?: string;
  qty?: number;
  rate?: number;
  amt?: number;
  disc?: number;

  grossAmt?: number;
  vatPer?: number;
  vatAmt?: number;
  netAmt?: number;
  narration?: string;
  jobname?: string;
  costcenter?: string;
  jobid?: number;
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
export const columnDetailList = (component: PurchasevoucherComponent) => [
  {
    data: 'itemId',
    type: 'text',
    label: 'Item Id',
    toolTip: 'Item Id',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
  },
  {
    data: 'itemname',
    type: 'text',
    label: 'Item',
    toolTip: 'Item Name',
    source: component.ItemMasterArry,
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
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Rate',
    readOnly: false,
  },
  {
    data: 'amt',
    type: 'numeric',
    label: 'Amt',
    toolTip: 'Amount',
  },
  {
    data: 'disc',
    type: 'numeric',
    label: 'Disc.',
    toolTip: 'Discount',
    readOnly: false,
  },
  {
    data: 'grossAmt',
    type: 'numeric',
    label: 'Gross Amt',
    toolTip: 'Gross Amount',
    readOnly: true,
  },
  {
    data: 'vatPer',
    type: 'numeric',
    label: 'VAT%.',
    toolTip: 'VAT Percentage',
  },
  {
    data: 'vatAmt',
    type: 'numeric',
    label: 'VAT.Amt',
    readOnly: false,
    toolTip: 'VAT Amount',
  },
  {
    data: 'netAmt',
    type: 'numeric',
    label: 'Net.Amt',
    toolTip: 'Net Amount',
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    readOnly: false,
    toolTip: 'Narration',
  },
  {
    data: 'jobname',
    type: 'text',
    label: 'Job Name',
    toolTip: 'Job Name',
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
    toolTip: 'Purchase Voucher Detail ID',
  },
  {
    data: 'conversionType',
    type: 'numeric',
    label: 'Conversion Type',
    toolTip: 'Conversion Type',
  },
  {
    data: 'jobid',
    type: 'numeric',
    label: 'Job ID',
    toolTip: 'Job ID',
  },
];
export const columnServiceDetailList = (
  component: PurchasevoucherComponent
) => [
    {
      data: 'serviceID',
      type: 'text',
      label: 'Service Id',
      toolTip: 'Service Id',
      readOnly: false,
      width: 40,
    },
    {
      data: 'serviceName',
      type: 'text',
      label: 'Service',
      width: 85,
    },
    {
      data: 'fromSupplier',
      type: 'checkbox',
      label: 'Supplier',
      toolTip: 'Account Number',
      width: 30,
    },
    {
      data: 'accountNo',
      type: 'numeric',
      label: 'Account No',
      toolTip: 'Account Number',
      width: 65,
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
      width: 50,
    },
  ];
