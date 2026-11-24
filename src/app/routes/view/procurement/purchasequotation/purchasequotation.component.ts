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
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { PurchaseQuotation } from 'src/app/routes/domain/Procurements/PurchaseQuotation';
import { PurchaseQuotationDetails } from 'src/app/routes/domain/Procurements/PurchaseQuotationDetails';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { timer, Observable } from 'rxjs';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { ToWords } from 'to-words';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
//import { Console } from 'console';
//  import { Console } from 'console';

@Component({
  selector: 'app-purchasequotation',
  templateUrl: './purchasequotation.component.html',
  styleUrls: ['./purchasequotation.component.scss'],
})
export class PurchasequotationComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('suppCtrl', { static: false }) supplierCtrol: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;
  @ViewChild('typCtrl', { static: false }) typeCtrol: ElementRef;
  PurchaseQuotationFilterForm: FormGroup;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  stationmasterObj: StationMaster;
  lookupGridColumns = [];
  showSalesLookUp: boolean = false;
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

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;
  JOBCOST: Boolean = false;
  SupplierMasterArrayById: any = null;

  unitAry: any;
  unitListt: any;
  units: any;

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  funitid: number;
  ItemMasterArrayByName: any = null;
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  showAmountInWords: boolean = true;
  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  locationLocked = false;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  purchaseQuotationarry: PurchaseQuotation[] = [];
  // savedPurchaseQuotationGridData: GridData[] = [];
  savedPurchaseQuotation: PurchaseQuotation;

  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  Permission: any;
  ScreenId: number;
  filterArray: any;
  displayPrintPreview: any;
  pdfSource: string;

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
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    private printService: FileSaverService,
    private procurementapi: ProcurementApiService,
    private utilityService: UtilityService,

    private crystalReportService: CrystalReportService,
    private storage: LocalStorageService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'purchasequotation_HotEntry';
  purchasequotation_entry: Handsontable.GridSettings;
  purchaseQuotationFormGroup: FormGroup;
  purchasequotation_entryDataset = [];
  // accountTransactionDataset = [];
  cols;
  ngAfterViewInit() {}
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
    this.stationmasterObj = this.permission.getStation();
    this.FILL_COMBO();

    this.cols = [
      { field: 'purchaseQuotationNo', header: 'Voucher No' },
      { field: 'purchaseQuotationDate', header: 'Date' },
      { field: 'purchaseQuotationPartyId', header: 'Party' },
      { field: 'purchaseQuotationCurrencyId', header: 'Currency' },
      { field: 'purchaseQuotationDescription', header: 'Narration' },
      { field: 'purchaseQuotationTotalGrossAmount', header: 'Gross.Amt' },
      { field: 'purchaseQuotationTotalDisAmount', header: 'Disc.Amt' },
      { field: 'purchaseQuotationVatAmt', header: 'Vat.Amt' },
      { field: 'purchaseQuotationVatRoundSign', header: 'Round.Sign' },
      { field: 'purchaseQuotationVatRountAmt', header: 'Round.Amt' },
      { field: 'purchaseQuotationNetAmount', header: 'Net.Amt' },
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.getReportType();
    this.purchaseQuotationFormGroup = this.fb.group({
      purchaseQuotationId: [0],
      purchaseQuotationNo: [{ value: '', disabled: true }],
      purchaseQuotationDate: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      purchaseQuotationRefNo: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      purchaseQuotationSupInvNo: [{ value: '', disabled: true }],
      purchaseQuotationCurrencyId: [-1, [DropDownValidator]],
      purchaseQuotationExcludeVat: [{ value: false, disabled: true }],

      purchaseQuotationType: [-1, [DropDownValidator]],
      purchaseQuotationPartyId: [-1, [DropDownValidator]],
      purchaseQuotationPartyName: [{ value: '', disabled: true }],
      purchaseQuotationPartyAddress: [{ value: '', disabled: true }],
      purchaseQuotationPartyVatNo: [{ value: '', disabled: true }],
      purchaseQuotationDescription: [
        { value: '', disabled: true },
        [Validators.required],
      ],

      purchaseQuotationGrno: [{ value: null, disabled: true }],
      purchaseQuotationGrdate: [{ value: null, disabled: true }],
      purchaseQuotationLpono: [{ value: null, disabled: true }],
      purchaseQuotationLpodate: [{ value: null, disabled: true }],
      purchaseQuotationQtnNo: [{ value: null, disabled: true }],
      purchaseQuotationQtnDate: [{ value: null, disabled: true }],
      purchaseQuotationPono: [{ value: null, disabled: true }],
      purchaseQuotationBatchCode: [{ value: null, disabled: true }],
      purchaseQuotationDayBookNo: [{ value: null, disabled: true }],
      purchaseQuotationJobId: [-1, [DropDownValidator]],
      purchaseQuotationLocationId: [-1, [DropDownValidator]],

      purchaseQuotationTotalGrossAmount: [{ value: [0], disabled: true }],
      purchaseQuotationTotalItemDisAmount: [{ value: [0], disabled: true }],
      purchaseQuotationTotalDisPer: [{ value: [0], disabled: true }],
      purchaseQuotationTotalDisAmount: [{ value: [0], disabled: true }],
      purchaseQuotationVatPer: [{ value: [5], disabled: true }],
      purchaseQuotationVatAmt: [{ value: [0], disabled: true }],
      purchaseQuotationTotalActualAmount: [{ value: [0], disabled: true }],
      purchaseQuotationVatRoundSign: [{ value: '-', disabled: true }],
      purchaseQuotationVatRountAmt: [{ value: [0], disabled: true }],
      purchaseQuotationNetAmount: [{ value: [0], disabled: true }],
    });
    this.PurchaseQuotationFilterForm = this.fb.group({
      paymentVoucherAcNo: [null],
      isDate: [],
      paymentVoucherNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      ?.map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.LoadLocationDDL();
  }

  get f() {
    return this.purchaseQuotationFormGroup.controls;
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

  printbtn: MenuItem[];
  getReportType() {
    this.masterapi.General('PQuotation').subscribe((res: any) => {
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
        `select * from vw_grn  where purchase_voucher_pur_id=${this.savedPurchaseQuotation.purchaseQuotationId}`,
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
  updateTableConfiguration() {
    const hiddenColumns = [0, 1, 6, 8, 9, 10, 15]; // Hide itemId, partNo, amt, grossAmt, vatPer, vatAmt, jobname, costcenter, id

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

  initializeControls() {
    const hiddenColumns = [0, 1, 6, 8, 9, 10, 13, 14, 15]; // Hide itemId, partNo, amt, grossAmt, vatPer, vatAmt, jobname, costcenter, id
    this.purchasequotation_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns
    );

    this.purchasequotation_entry.afterSelection = (
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

      if (column === 2 && this.purchasequotation_entry.readOnly === false) {
        this.lookupGridColumns = ['Item', 'Item ID'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 3 &&
        this.purchasequotation_entry.readOnly === false
      ) {
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      } else {
        this.showProcurementsLookUp = false;
        this.activeRow = { row, column };
      }

      if (column === 19 && this.purchasequotation_entry.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      }

      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.procurements == x);
      } else {
        this.selectItem = {};
      }
    };

    this.purchasequotation_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showProcurementsLookUp = false;
      if (change[0][1] === 0) {
        this.showProcurementsLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.purchasequotation_entry.beforeChangeRender = (change, source) => {
      // console.log(change)

      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);

        if (data[4] != null && data[5] != null && change[0][1] != 'netAmt') {
          //&& data[7] != null
          var sum = data[4] * data[5] - data[7] * data[4];
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 11, sum);
        }
      }

      this.ColumnSum();

      this.GetTotal();
    };

    this.purchasequotation_entry.afterChange = (r, c) => {};
    this.purchasequotation_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
      this.GetTotal();
    };

    this.purchasequotation_entry.afterValidate = (
      isValid,
      value,
      row,
      prop
    ) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }
  LoadJodDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((m: any) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
    });
  }
  LoadCostCenterDDL() {
    this.utilityService.LoadDropdowncostcenterMasters().subscribe((m: any) => {
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl: any) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
    });
  }
  LoadAccountSettingDDL() {
    this.utilityService.LoadDropdownaccountsSettings().subscribe((m: any) => {
      this.accountArray = m.resultSet.masterAccountsTables;
      this.accountList = m.resultSet.masterAccountsTables?.map((kl: any) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
    });
  }
  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((r: any) => {
      this.units = r.resultSet.unitMasters;
      this.unitListt = r.resultSet.unitMasters.map((kl: any) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
    });
  }
  LoadItemDDL() {
    this.accountapi.LoadDropdownItemMaster().subscribe((r) => {
      this.ItemMasterArray = r.resultSet.itemMaster;
      this.ItemMasterList = r.resultSet.itemMaster?.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl?.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
    });
  }
  LoadSupplierDDL() {
    this.utilityService.LoadDropdownSuppliersMaster().subscribe((r: any) => {
      this.SupplierMasterArray = r.resultSet.suppliersMaster;
      this.SupplierMasterList = r.resultSet.suppliersMaster?.map((kl: any) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.SupplierMasterList.unshift({
        label: '--Select Supplier--',
        value: -1,
      });
    });
  }
  LoadCurrencyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((r: any) => {
      this.currArry = r.resultSet.currencyMasters;
      this.currencyList = r.resultSet.currencyMasters?.map((kl: any) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
    });
  }
  LoadLocationDDL() {
    this.utilityService.LoadDropdownLocationMaster().subscribe((r: any) => {
      const list = r?.resultSet?.locationMaster ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationLocked = this.utilityService.applyLocationLock(
        this.purchaseQuotationFormGroup,
        'purchaseQuotationLocationId'
      );
    });
  }

  get jobSetLookup() {
    return this.jobList.map((kl) => ({
      job: kl.label,
      jobId: kl.value,
    }));
  }

  openSupplier() {
    this.control = this.f.purchaseQuotationPartyId;
    this.elementReference = this.supplierCtrol;
    this.lookupGridColumns = ['Supplier', 'Supplier ID'];
    this.formControlLookUp = true;
    this.selectItem = {
      procurements: this.supplierCtrol.nativeElement.value,
      procurementsId: this.f.purchaseQuotationPartyId.value,
    };
    this.dataList = this.supplierLookup;
  }

  // openType() {
  //   this.control = this.f. purchaseQuotationType;
  //   this.elementReference = this.typeCtrol;
  //   this.lookupGridColumns = ['Type'];
  //   this.formControlLookUp = true;
  //   this.selectItem = { procurements: this.typeCtrol.nativeElement.value,
  //     procurementsId: this.f. purchaseQuotationType.value };
  //   this.dataList = this.typeLookup;
  // }

  ColumnSum() {
    var disc = 0;
    this.purchasequotation_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.disc) {
        disc += elemt.disc;
      }
    });
    disc = parseFloat(disc.toFixed(2));
    this.purchaseQuotationFormGroup.controls.purchaseQuotationTotalItemDisAmount.setValue(
      disc
    );

    var amt = 0;
    this.purchasequotation_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.netAmt) {
        amt += elemt.netAmt;
      }
    });
    amt = parseFloat(amt.toFixed(2));
    this.purchaseQuotationFormGroup.controls.purchaseQuotationTotalGrossAmount.setValue(
      amt
    );

    this.GetTotal();
  }
  CalcDiscFromPer() {
    this.purchaseQuotationFormGroup.controls.purchaseQuotationTotalDisAmount.setValue(
      parseFloat(
        (
          (Number(
            this.purchaseQuotationFormGroup.value
              .purchaseQuotationTotalGrossAmount
          ) *
            Number(
              this.purchaseQuotationFormGroup.value.purchaseQuotationTotalDisPer
            )) /
          100
        ).toFixed(2)
      )
    );
    this.GetTotal();
  }
  CalcDiscFromAmt() {
    this.purchaseQuotationFormGroup.controls.purchaseQuotationTotalDisPer.setValue(
      parseFloat(
        (
          (Number(
            this.purchaseQuotationFormGroup.value
              .purchaseQuotationTotalDisAmount
          ) *
            100) /
          Number(
            this.purchaseQuotationFormGroup.value
              .purchaseQuotationTotalGrossAmount
          )
        ).toFixed(2)
      )
    );
    this.GetTotal();
  }
  GetTotal($event = null) {
    // console.log('change',$event);

    if (
      this.purchaseQuotationFormGroup.value.purchaseQuotationExcludeVat == true
    ) {
      this.purchaseQuotationFormGroup.value.purchaseQuotationVatPer = 0;
    } else {
      this.purchaseQuotationFormGroup.value.purchaseQuotationVatPer = 5;
    }

    this.purchaseQuotationFormGroup.controls.purchaseQuotationTotalActualAmount.setValue(
      parseFloat(
        (
          Number(
            this.purchaseQuotationFormGroup.value
              .purchaseQuotationTotalGrossAmount
          ) -
          Number(
            this.purchaseQuotationFormGroup.value
              .purchaseQuotationTotalDisAmount
          )
        ).toFixed(2)
      )
    );

    // console.log(this.purchaseQuotationFormGroup.value.purchaseQuotationVatRoundSign)
    this.purchaseQuotationFormGroup.controls.purchaseQuotationVatAmt.setValue(
      parseFloat(
        (
          (Number(
            this.purchaseQuotationFormGroup.value
              .purchaseQuotationTotalActualAmount
          ) *
            Number(
              this.purchaseQuotationFormGroup.value.purchaseQuotationVatPer
            )) /
          100
        ).toFixed(2)
      )
    );

    // console.log(
    //   this.purchaseQuotationFormGroup.value.purchaseQuotationVatRoundSign
    // );

    if (
      this.purchaseQuotationFormGroup.value.purchaseQuotationVatRoundSign == '+'
    ) {
      this.purchaseQuotationFormGroup.controls.purchaseQuotationNetAmount.setValue(
        parseFloat(
          (
            Number(
              this.purchaseQuotationFormGroup.value
                .purchaseQuotationTotalActualAmount
            ) +
            Number(
              this.purchaseQuotationFormGroup.value.purchaseQuotationVatAmt
            ) +
            Number(
              this.purchaseQuotationFormGroup.value.purchaseQuotationVatRountAmt
            )
          ).toFixed(2)
        )
      );
    } else if (
      this.purchaseQuotationFormGroup.value.purchaseQuotationVatRoundSign == '-'
    ) {
      this.purchaseQuotationFormGroup.controls.purchaseQuotationNetAmount.setValue(
        parseFloat(
          (
            Number(
              this.purchaseQuotationFormGroup.value
                .purchaseQuotationTotalActualAmount
            ) +
            Number(
              this.purchaseQuotationFormGroup.value.purchaseQuotationVatAmt
            ) -
            Number(
              this.purchaseQuotationFormGroup.value.purchaseQuotationVatRountAmt
            )
          ).toFixed(2)
        )
      );
    } else {
      this.purchaseQuotationFormGroup.value.purchaseQuotationVatRoundSign = '-';
    }
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = k?.map((ar) => ar.currencyMasterCurrencyName?.trim());
    });
  }

  public getSupplierName(SupplierId: number): string {
    if (SupplierId !== null) {
      return this.SupplierMasterArray?.find(
        (j) => j.suppliersMasterSupplierId === SupplierId
      )?.suppliersMasterSupplierName;
    } else {
      return null;
    }
  }
  public getSupplierContact(suppliersMasterSupplierId: number): string {
    if (suppliersMasterSupplierId !== null) {
      return this.SupplierMasterArray?.find(
        (j) => j.suppliersMasterSupplierId === suppliersMasterSupplierId
      )?.suppliersMasterSupplierContactPerson;
    }
  }
  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 12) {
      return Math.max(0, 12 - salesVoucherDetailsLength);
    } else {
      return;
    }
  }
  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
      this.acctArry = k.result?.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
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
  getAllItemMaster() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result?.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl?.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k.result?.map((ar) =>
        ar?.itemMasterItemName?.trim()
      );
    });
  }

  getAllSupplierMaster() {
    this.masterapi.GetAllSupplier().subscribe((k) => {
      this.SupplierMasterArray = k;
      this.SupplierMasterList = k?.map((kl) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.SupplierMasterList.unshift({
        label: '--Select Supplier--',
        value: -1,
      });
      this.SupplierMasterArry = k?.map(
        (ar) =>
          ar.suppliersMasterSupplierName?.trim() +
          '|' +
          ar.suppliersMasterSupplierId
      );
    });
  }

  getAllUnit() {
    this.masterapi.GetAllUnit().subscribe((k) => {
      //   this.unitArray = k;
      //   this.unitList = k
      //   ?.map((kl) => ({ label: kl?.unitMasterUnitShortName, value: kl?.unitMasterUnitId }));
      //   this.unitList.unshift({label : '--Select Unit--', value: -1});
      //   this.unitArry = k?.map(ar => ar?.unitMasterUnitShortName?.trim() + '|' + ar?.unitMasterUnitId);
      // });
      this.units = k;
      this.unitListt = k.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = k.map((ar) => ar?.unitMasterUnitShortName?.trim());
      // console.log(' this.unitListt', this.unitListt);
    });
  }

  getDefaultCurrency() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULTCURRENCY')
      .subscribe((data) => {
        if (data !== null) {
          // console.log(data,'Please Check');
          this.DefCurCheck = data.result[0].generalSettingsTextValue;
          if (this.DefCurCheck !== null) {
            const splitText = this.DefCurCheck.split('::');
            this.DefCurrency = splitText[1]?.trim();
            this.f.purchaseQuotationCurrencyId.setValue(
              Number(this.DefCurrency)
            );
          }
        }
      });
  }

  getPIReport() {
    const fileName = String(new Date().valueOf());
    var css: string = `
    .contain {

      width: 80%;
      margin-left: 10%;
      margin-bottom: 2%;
      margin-top: 4%;
    }

    .cross{
      padding-top: .5%;
      font-family: "Impact";
      font-size: 28px;
      margin-bottom: 1%;
    }
    .center img{
    height: 70px;
    }
    .proforma {
      text-align: center;
      margin-top: 5%;
      font-family: "Sans-serif";
      font-size: 1.5rem;
      margin-bottom: 0%;
    }

    h3 {
      text-align: center;
      margin-top: 0%;
      font-family: "Sans-serif";
      font-size: 1rem;
    }
    .table{
      width:80%;
    }

    .tfe {
      margin-top: 0%;
      margin-bottom: 0%;
      font-size: 18px;
      font-family: "Tahoma";
       font-weight: bold;
    }

    h5 {
      /* border: 1px solid rgb(209, 211, 212); */
      /* width: 80%; */
      /* margin-left: 8%; */
      margin-bottom: 5px;
      /* border-radius: 10px; */
      margin-top: 5px;
    }

    .tbh {
      font-family: Arial, Helvetica, sans-serif;

      border-collapse: separate;
       border-radius: 6px;
      width: 100%;
       margin-top: 2px;
        border: .5px solid rgb(201, 204, 204);
    }

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
    .contain1{
      width: 50%;
      margin-bottom: 20px;
      border-radius: 1px;
      margin-top: 5%;
      font-size: 16px;
       padding-bottom: 0%;
      padding: 8px;
     }
    .contain2{

      width: 43.5%;
      margin-bottom: 20px;
      border-radius: 1px;
      margin-top: 1%;
      font-size: 18px;
       padding-bottom: 0%;
      padding: 8px;
      margin-left: 15px;
     }
    .bank1 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 48%;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 1%;
      font-size: 18px;
       padding-bottom: 0%;
      padding: 8px;
      box-shadow: 5px 5px rgb(201, 204, 204);
     }

    .bank2 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 43.9%;
      margin-bottom: 5px;
      margin-right:2px;
      border-radius: 1px;
      margin-top: 1%;
      font-size: 18px;
       padding-bottom: 0%;
      padding: 8px;
      box-shadow: 5px 5px rgb(201, 204, 204);
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
    .flex {
      display: flex;
      margin-bottom: 5px;
      gap: 2px; /* Adjusted the gap value here */
     }

    .header {
      display: flex;
      justify-content: space-between;
      margin-right: 35%;
    }

    .left {
      font-size: 13px;
      text-align: left;
      margin-bottom: 0%;
      margin-top: 0%;
    }

    .right {
      font-size: 12px;
      text-align: right;
      margin-bottom: 0%;
      margin-top: 6px;
    }
    .lft{
      text-align: left;
      font-size: 12px;
      // padding-top: 6px;
      width: 70%;
    }
    .rit {
      font-size: 16px;
       margin-bottom: 0%;
      margin-top: 6px;
     }

    .ata {
      margin-top: 6%;
      margin-bottom: 5%;
    }
    .rup{
      font-size: 16px;
      margin-left:5px ;
    }
    .fix{
      display: flex;
      margin-bottom: 5px;
     }

    .p-20{
    padding: 0 20px;
     }
     .spacer{
      height: 150px;
     }
      .container {
  width: 80%;
  margin: 0 auto;
  border: .5px solid rgb(201, 204, 204);
  padding: 20px;
  font-family: Arial, sans-serif;
}



.notes {
  margin-top: 20px;
  width: 100%;
  margin: 0 auto;
   padding: 20px;
  font-family: Arial, sans-serif;
}
.headd{
  margin-top: 60px;
  padding-top: 10px;
  padding-left: 11%;
  font-weight: bold;
 }
.notes h3 {
  margin-bottom: 10px;
}

.notes p, .notes ol {
  margin-left: 20px;
}

.payment-delivery {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.payment-delivery div {
  width: 45%;
}

.approval-section {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.approval-section div {
  text-align: center;
  width: 30%;
}

.page-footer {
  text-align: center;
  width: 100%;
   margin-top: 55px;
   border: .5px solid rgb(201, 204, 204);
;
}
#payment {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;

}

#payment td, #payment th {
  border: 1px solid #ddd;
  padding: 8px;
}
#payment tr:nth-child(even){background-color: #f2f2f2;}
#payment tr:hover {background-color: #ddd;}
#payment th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #dfe4e3;
  color: rgb(0, 0, 0);
  text-align: center;
}`;
    var data = document.getElementById('print');
    // let html: any = document.getElementById('print');
    // this.printService.saveAsPDF(data, 'saleVoucherPDF');
    this.printService.PrintPDF('print', css);
    // this.userTrackingLog('PDF', this.savedPurchaseOrder?.purchaseOrderNo);
  }

  getDefaultLocation() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULT_LOCATION')
      .subscribe((data) => {
        if (data !== null) {
          // console.log(data,'Please Check');
          this.DefLocCheck = data.result[0].generalSettingsTextValue;
          if (this.DefLocCheck !== null) {
            const splitText = this.DefLocCheck.split('::');
            this.DefLocid = splitText[1]?.trim();
            if (!this.locationLocked) {
              this.f.purchaseQuotationLocationId.setValue(
                Number(this.DefLocid)
              );
            }
          }
        }
      });
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

  // get currencyLookup() {
  //   return this.currencyList?.map((kl) => ({ procurements: kl.label,
  //     procurementsId: kl.value}));
  // }
  // get jobsLookup() {
  //   return this.jobList?.map((kl) => ({ procurements: kl.label,
  //     procurementsId: kl.value}));
  // }
  // get locationLookup() {
  //   return this.locationList?.map((kl) => ({ procurements: kl.label,
  //     procurementsId: kl.value}));
  // }

  get supplierLookup() {
    return this.SupplierMasterList?.map((kl) => ({
      procurements: kl.label,
      procurementsId: kl.value,
    }));
  }
  // get typeLookup() {
  //   return this.v_typeList?.map((kl) => ({ procurements: kl.label,
  //     procurementsId: kl.value}));
  // }
  get itemSetLookup() {
    return this.ItemMasterArray?.map((kl) => ({
      procurements: kl?.itemMasterItemName,
      procurementsId: kl?.itemMasterItemId,
    }));
  }

  get unitSetLookup() {
    return this.unitArray?.map((kl) => ({
      procurements: kl?.unitMasterUnitShortName,
      procurementsId: kl?.unitMasterUnitId,
    }));
  }

  savePurchaseQuotation() {
    const savedData: Array<any> = this.purchasequotation_entry.data?.filter(
      (k) => k.hasOwnProperty('itemname')
    );
    const purchaseQuotation_Save: PurchaseQuotation = this
      .purchaseQuotationFormGroup.value as PurchaseQuotation;

    purchaseQuotation_Save.purchaseQuotationId = Number(
      this.purchaseQuotationFormGroup.value.purchaseQuotationId
    );

    purchaseQuotation_Save.purchaseQuotationNo =
      this.purchaseQuotationFormGroup.getRawValue().purchaseQuotationNo;
    purchaseQuotation_Save.purchaseQuotationDate =
      this.purchaseQuotationFormGroup.value.purchaseQuotationDate;
    purchaseQuotation_Save.purchaseQuotationRefNo =
      this.purchaseQuotationFormGroup.value.purchaseQuotationRefNo;
    purchaseQuotation_Save.purchaseQuotationSupInvNo =
      this.purchaseQuotationFormGroup.value.purchaseQuotationSupInvNo;
    purchaseQuotation_Save.purchaseQuotationCurrencyId =
      this.purchaseQuotationFormGroup.value.purchaseQuotationCurrencyId;
    purchaseQuotation_Save.purchaseQuotationExcludeVat =
      this.purchaseQuotationFormGroup.value.purchaseQuotationExcludeVat;
    //purchaseQuotation_Save.purchaseQuotationExcludeVat = true;

    purchaseQuotation_Save.purchaseQuotationType =
      this.purchaseQuotationFormGroup.value.purchaseQuotationType;
    //purchaseQuotation_Save.purchaseQuotationType = 'CASH';

    purchaseQuotation_Save.purchaseQuotationPartyId =
      this.purchaseQuotationFormGroup.value.purchaseQuotationPartyId;
    //  purchaseQuotation_Save.purchaseQuotationPartyName = this.purchaseQuotationFormGroup.value.purchaseQuotationPartyName;
    purchaseQuotation_Save.purchaseQuotationPartyName = 'PARTY NAME';
    purchaseQuotation_Save.purchaseQuotationPartyAddress =
      this.purchaseQuotationFormGroup.value.purchaseQuotationPartyAddress;
    purchaseQuotation_Save.purchaseQuotationPartyVatNo =
      this.purchaseQuotationFormGroup.value.purchaseQuotationPartyVatNo;
    purchaseQuotation_Save.purchaseQuotationDescription =
      this.purchaseQuotationFormGroup.value.purchaseQuotationDescription;

    purchaseQuotation_Save.purchaseQuotationGrno =
      this.purchaseQuotationFormGroup.value.purchaseQuotationGrno;
    purchaseQuotation_Save.purchaseQuotationGrdate =
      this.purchaseQuotationFormGroup.value.purchaseQuotationGrdate;
    purchaseQuotation_Save.purchaseQuotationLpono =
      this.purchaseQuotationFormGroup.value.purchaseQuotationLpono;
    purchaseQuotation_Save.purchaseQuotationLpodate =
      this.purchaseQuotationFormGroup.value.purchaseQuotationLpodate;
    purchaseQuotation_Save.purchaseQuotationQtnNo =
      this.purchaseQuotationFormGroup.value.purchaseQuotationQtnNo;
    purchaseQuotation_Save.purchaseQuotationQtnDate =
      this.purchaseQuotationFormGroup.value.purchaseQuotationQtnDate;

    purchaseQuotation_Save.purchaseQuotationPono =
      this.purchaseQuotationFormGroup.value.purchaseQuotationPono;
    purchaseQuotation_Save.purchaseQuotationBatchCode =
      this.purchaseQuotationFormGroup.value.purchaseQuotationBatchCode;
    purchaseQuotation_Save.purchaseQuotationDayBookNo =
      this.purchaseQuotationFormGroup.value.purchaseQuotationDayBookNo;
    purchaseQuotation_Save.purchaseQuotationLocationId =
      this.purchaseQuotationFormGroup.get('purchaseQuotationLocationId')?.value;
    purchaseQuotation_Save.purchaseQuotationJobId =
      this.purchaseQuotationFormGroup.value.purchaseQuotationJobId;

    purchaseQuotation_Save.purchaseQuotationTotalGrossAmount = Number(
      this.purchaseQuotationFormGroup.value.purchaseQuotationTotalGrossAmount
    );
    purchaseQuotation_Save.purchaseQuotationTotalItemDisAmount = Number(
      this.purchaseQuotationFormGroup.value.purchaseQuotationTotalItemDisAmount
    );
    purchaseQuotation_Save.purchaseQuotationTotalDisPer = Number(
      this.purchaseQuotationFormGroup.value.purchaseQuotationTotalDisPer
    );
    purchaseQuotation_Save.purchaseQuotationTotalDisAmount = Number(
      this.purchaseQuotationFormGroup.value.purchaseQuotationTotalDisAmount
    );
    purchaseQuotation_Save.purchaseQuotationVatPer = Number(
      this.purchaseQuotationFormGroup.value.purchaseQuotationVatPer
    );
    purchaseQuotation_Save.purchaseQuotationVatAmt = Number(
      this.purchaseQuotationFormGroup.value.purchaseQuotationVatAmt
    );
    purchaseQuotation_Save.purchaseQuotationTotalActualAmount = Number(
      this.purchaseQuotationFormGroup.value.purchaseQuotationTotalActualAmount
    );
    purchaseQuotation_Save.purchaseQuotationVatRoundSign =
      this.purchaseQuotationFormGroup.value.purchaseQuotationVatRoundSign;
    //purchaseQuotation_Save.purchaseQuotationVatRoundSign = '-';
    purchaseQuotation_Save.purchaseQuotationVatRountAmt = Number(
      this.purchaseQuotationFormGroup.value.purchaseQuotationVatRountAmt
    );
    purchaseQuotation_Save.purchaseQuotationNetAmount = Number(
      this.purchaseQuotationFormGroup.value.purchaseQuotationNetAmount
    );

    purchaseQuotation_Save.accountsTransactions = [];
    purchaseQuotation_Save.purchaseQuotationDetails = savedData
      ?.filter((k) => k.itemname != null && k.netAmt != null)
      //?.map((k: GridData) => {
      ?.map((k: any) => {
        return {
          purchaseQuotationDetailsId: k.id != null ? k.id : 0,
          purchaseQuotationDetailsNo:
            this.purchaseQuotationFormGroup.getRawValue().purchaseQuotationNo,

          purchaseQuotationId: 0,
          purchaseQuotationDetailsMatId:
            k.itemname != null && k.itemname !== ''
              ? this.ItemMasterArray?.find(
                  (j) => j?.itemMasterItemName?.trim() === k.itemname?.trim()
                )?.itemMasterItemId
              : null,
          purchaseQuotationDetailsQuantity: k.qty,
          purchaseQuotationDetailsDiscAmount: k.disc ? k.disc : 0,
          purchaseQuotationDetailsRate: k.rate,
          purchaseQuotationDetailsNetAmt: k.netAmt,
          purchaseQuotationDetailsGrossAmount: 0,
          // purchaseQuotationDetailsJobNo: k.jobname != null && k.jobname !== '' ? this.jobArray
          // ?.find(j => j.jobMasterJobName?.trim()  === k.jobname?.trim()).jobMasterId : null,
          // purchaseQuotationDetailsCostCenterId: k.costcenter != null && k.costcenter !== '' ? this.costcenterArray
          // ?.find(j => j.costCenterMasterCostCenterName?.trim()  === k.costcenter?.trim()).costCenterMasterCostCenterId : null,
          purchaseQuotationDetailsRemarks: k.narration,
          purchaseQuotationDetailsSno: 0,
          purchaseQuotationDetailsJobID:
            k.job != null && k.job !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.job?.trim())
                  ?.value
              : null,

          purchaseQuotationDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                  (j) => j?.unitMasterUnitShortName?.trim() === k.unit?.trim()
                )?.unitMasterUnitId
              : null,
          purchaseQuotationDetailsDelStatus: false,
        };
      });

    if (this.btnFlag.save) {
      this.saveVoucher(purchaseQuotation_Save);
    } else {
      purchaseQuotation_Save.accountsTransactions
        ?.filter((x) => x.accountsTransactionsTransSno != 0)
        .forEach((element, index, arry) => {
          arry[index].accountstransactionsDelStatus = true;
        });

      this.updateVoucher(purchaseQuotation_Save);
    }
  }

  validateTotalDrCrAmounts(): boolean {
    if (
      this.purchaseQuotationFormGroup.getRawValue()
        .purchaseQuotationTotalGrossAmount == 0 &&
      this.purchaseQuotationFormGroup.getRawValue()
        .purchaseQuotationTotalItemDisAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    if (
      this.purchaseQuotationFormGroup.getRawValue()
        .purchaseQuotationTotalGrossAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total  Debit Amounts are Zero',
      });
      return false;
    }

    return true;
  }
  saveVoucher(purchaseQuotation_Save: PurchaseQuotation) {
    if (this.purchaseQuotationFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.procurementapi
              .InsertPurchaseQuotation(purchaseQuotation_Save)
              .subscribe(
                (data) => {
                  this.btnFlag = {
                    edit: true,
                    cancel: false,
                    save: false,
                    update: true,
                    delete: true,
                  };
                  this.savedPurchaseQuotation = data.result;

                  this.updateFormGrid(data.result);
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
                    detail: 'Payment Voucher Save Failed',
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
      this.purchaseQuotationFormGroup.markAllAsTouched();
      this.purchaseQuotationFormGroup.markAsDirty();
    }
  }

  updateVoucher(purchaseQuotation_Save: PurchaseQuotation) {
    if (this.purchaseQuotationFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.procurementapi
              .UpdatePurchaseQuotation(purchaseQuotation_Save)
              .subscribe(
                (data) => {
                  this.btnFlag = {
                    edit: true,
                    cancel: false,
                    save: false,
                    update: true,
                    delete: true,
                  };
                  this.savedPurchaseQuotation = data.result;
                  this.updateFormGrid(data.result);
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Alert',
                    detail: 'Purchase Quotation Updated Succesfully',
                  });
                },
                (err) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail: 'Purchase Quotation Update Failed',
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
      this.purchaseQuotationFormGroup.markAllAsTouched();
      this.purchaseQuotationFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllPurchaseQuotation() {
    this.procurementapi.GetPurchaseQuotation().subscribe((data) => {
      this.purchaseQuotationarry = data.result;
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
      (j) => j?.itemMasterItemId === itemMasterItemId
    )?.itemMasterItemName;
  }

  public getUnitName(unit: number): string {
    return this.unitArray?.find((j) => j?.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }
  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();

    this.LoadJodDDL();
    this.LoadUnitDDL();
    this.LoadCurrencyDDL();
    this.LoadLocationDDL();
    this.LoadSupplierDDL();
    this.LoadCostCenterDDL();
    this.LoadAccountSettingDDL();
  }

  new() {
    this.callDropdowns();
    this.purchaseQuotationFormGroup.reset();
    this.purchasequotation_entry.data = [];
    this.purchasequotation_entry.readOnly = false;
    this.purchasequotation_entry.disableVisualSelection = true;
    //this.getDefaultCurrency();
    //this.getDefaultLocation();
    this.GetDefaultSettings();

    this.purchaseQuotationFormGroup.controls.purchaseQuotationVatRoundSign.setValue(
      '-'
    );
    this.purchaseQuotationFormGroup.controls.purchaseQuotationType.setValue(
      'CREDIT'
    );

    this.purchaseQuotationFormGroup.controls.purchaseQuotationVatPer.setValue(
      5
    );

    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.purchasequotation_entry);
    //  this.hotRegisterer.getInstance(this.hotid).selectAll();
    //  this.hotRegisterer.getInstance(this.hotid).destroyEditor(false, true);
    //  this.hotRegisterer.getInstance(this.hotid).clear();
    //  this.hotRegisterer.getInstance(this.hotid).selectCell(0, 0);

    this.accountTransactionList = [];
    this.purchaseQuotationFormGroup.get('purchaseQuotationId').setValue(null);
    this.purchaseQuotationFormGroup
      .get('purchaseQuotationPartyId')
      .setValue(-1);
    this.purchaseQuotationFormGroup.get('purchaseQuotationJobId').setValue(-1);
    this.purchaseQuotationFormGroup
      .get('purchaseQuotationCurrencyId')
      .setValue(-1);
    this.purchaseQuotationFormGroup
      .get('purchaseQuotationLocationId')
      .setValue(-1);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.purchaseQuotationFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseQuotationFormGroup,
      'purchaseQuotationLocationId',
      this.locationLocked
    );
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.purchaseQuotationFormGroup,
        'purchaseQuotationLocationId'
      );
    }
    this.f.purchaseQuotationNo.clearValidators();
    this.f.purchaseQuotationDate.setValue(new Date());
    this.purchaseQuotationFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
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
          this.f.purchaseQuotationCurrencyId.setValue(Number(this.DefCurrency));
        }
      }
      //locations - now auto-selected from login localStorage
      // var DEFAULT_LOCATION = list?.filter(
      //   (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      // );

      // if (DEFAULT_LOCATION != null) {
      //   this.DefLocCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
      //   if (this.DefLocCheck !== null) {
      //     const splitText = this.DefLocCheck.split('::');
      //     this.DefLocid = splitText[1]?.trim();
      //     this.f.purchaseQuotationLocationId.setValue(Number(this.DefLocid));
      //   }
      // }
      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      if (jobcal == true) {
        this.JOBCOST = true;
      }
    });
  }
  showMaximizableDialog() {
    this.getAllPurchaseQuotation();
    this.displayMaximizable = true;
  }

  updateFormGrid(purchasequotation_update: PurchaseQuotation) {
    this.purchaseQuotationFormGroup.patchValue({
      purchaseQuotationId: purchasequotation_update.purchaseQuotationId,
      purchaseQuotationNo: purchasequotation_update.purchaseQuotationNo,
      purchaseQuotationDate: new Date(
        purchasequotation_update.purchaseQuotationDate
      ),
      purchaseQuotationRefNo: purchasequotation_update.purchaseQuotationRefNo,
      purchaseQuotationSupInvNo:
        purchasequotation_update.purchaseQuotationSupInvNo,
      purchaseQuotationCurrencyId:
        purchasequotation_update.purchaseQuotationCurrencyId,
      purchaseQuotationExcludeVat:
        purchasequotation_update.purchaseQuotationExcludeVat,

      purchaseQuotationType: purchasequotation_update.purchaseQuotationType,
      purchaseQuotationPartyId:
        purchasequotation_update.purchaseQuotationPartyId,
      purchaseQuotationPartyName:
        purchasequotation_update.purchaseQuotationPartyName,
      purchaseQuotationPartyAddress:
        purchasequotation_update.purchaseQuotationPartyAddress,
      purchaseQuotationPartyVatNo:
        purchasequotation_update.purchaseQuotationPartyVatNo,
      purchaseQuotationDescription:
        purchasequotation_update.purchaseQuotationDescription,

      purchaseQuotationGrno: purchasequotation_update.purchaseQuotationGrno,
      purchaseQuotationGrdate:
        purchasequotation_update.purchaseQuotationGrdate != null
          ? new Date(purchasequotation_update.purchaseQuotationGrdate)
          : null,
      purchaseQuotationLpono: purchasequotation_update.purchaseQuotationLpono,
      purchaseQuotationLpodate:
        purchasequotation_update.purchaseQuotationLpodate != null
          ? new Date(purchasequotation_update.purchaseQuotationLpodate)
          : null,
      purchaseQuotationQtnNo: purchasequotation_update.purchaseQuotationQtnNo,
      purchaseQuotationQtnDate:
        purchasequotation_update.purchaseQuotationQtnDate != null
          ? new Date(purchasequotation_update.purchaseQuotationQtnDate)
          : null,

      purchaseQuotationPono: purchasequotation_update.purchaseQuotationPono,
      purchaseQuotationBatchCode:
        purchasequotation_update.purchaseQuotationBatchCode,
      purchaseQuotationDayBookNo:
        purchasequotation_update.purchaseQuotationDayBookNo,
      purchaseQuotationLocationId:
        purchasequotation_update.purchaseQuotationLocationId,
      purchaseQuotationJobId: purchasequotation_update.purchaseQuotationJobId,

      purchaseQuotationTotalGrossAmount:
        purchasequotation_update.purchaseQuotationTotalGrossAmount,
      purchaseQuotationTotalItemDisAmount:
        purchasequotation_update.purchaseQuotationTotalItemDisAmount,
      purchaseQuotationTotalDisPer:
        purchasequotation_update.purchaseQuotationTotalDisPer,
      purchaseQuotationTotalDisAmount:
        purchasequotation_update.purchaseQuotationTotalDisAmount,
      purchaseQuotationVatPer: purchasequotation_update.purchaseQuotationVatPer,
      purchaseQuotationVatAmt: purchasequotation_update.purchaseQuotationVatAmt,
      purchaseQuotationTotalActualAmount:
        purchasequotation_update.purchaseQuotationTotalActualAmount,
      purchaseQuotationVatRoundSign:
        purchasequotation_update.purchaseQuotationVatRoundSign,
      purchaseQuotationVatRountAmt:
        purchasequotation_update.purchaseQuotationVatRountAmt,
      purchaseQuotationNetAmount:
        purchasequotation_update.purchaseQuotationNetAmount,
    });
    this.supplierCtrol.nativeElement.value = this.SupplierMasterList?.find(
      (k) => k.value === purchasequotation_update.purchaseQuotationPartyId
    ).label;
    // this.typeCtrol.nativeElement.value = this.v_typeList?.find(k => k.value === purchasequotation_update.purchaseQuotationType).label;

    this.accountTransactionList = purchasequotation_update.accountsTransactions;
    // this.jobArray?.find(j => j.jobMasterJobName?.trim()  === k.jobname?.trim()).jobMasterId,
    const gridData: GridData[] =
      purchasequotation_update.purchaseQuotationDetails?.map((k) => {
        // const  ItemId: string = k.purchaseQuotationDetailsMatId != null ? this.ItemMasterArry?.find(l => l.match(k.purchaseQuotationDetailsMatId.toString())) : null;
        // const  UnitId: string = k.purchaseQuotationDetailsUnitId != null ? this.unitArry?.find(l => l.match(k.purchaseQuotationDetailsUnitId.toString())) : null;

        const ItemId: string =
          k.purchaseQuotationDetailsMatId != null
            ? this.ItemMasterList?.find(
                (l) => l.value == k.purchaseQuotationDetailsMatId
              ).label
            : null;
        const UnitId: string =
          k.purchaseQuotationDetailsUnitId != null
            ? this.unitListt?.find(
                (l) => l.value == k.purchaseQuotationDetailsUnitId
              ).label
            : null;

        // let  jobId: string = (k.purchaseQuotationDetailsJobNo != null ) ? this.jobArry?.find(l =>
        //                      l.match(k.purchaseQuotationDetailsJobNo.toString())) : null;
        // let  costCenterId: string = (k.purchaseQuotationDetailsCostCenterId != null ) ? this.costcenterArry?.find(l =>
        //                       l.match(k.purchaseQuotationDetailsCostCenterId.toString())) : null;

        return {
          itemname: ItemId,
          unit: UnitId,
          qty: k.purchaseQuotationDetailsQuantity,
          rate: k.purchaseQuotationDetailsRate,
          disc: k.purchaseQuotationDetailsDiscAmount,
          netAmt: k.purchaseQuotationDetailsNetAmt,

          // jobname: jobId,
          // costcenter: costCenterId,

          jobname: null,
          costcenter: null,

          narration: k.purchaseQuotationDetailsRemarks,
          id: k.purchaseQuotationDetailsId,
          job:
            k.purchaseQuotationDetailsJobID != null
              ? this.jobList?.find(
                  (l) => l.value == k?.purchaseQuotationDetailsJobID
                )?.label
              : null,
        };
      });

    this.purchasequotation_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.purchaseQuotationFormGroup.disable();
    this.f.purchaseQuotationNo.clearValidators();
    this.purchaseQuotationFormGroup.updateValueAndValidity();
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  handleChange(e) {
    this.index = e.index;
  }

  GetSavedPurchaseQuotationDetails(id: string) {
    this.index = 0;
    this.callDropdowns();
    this.procurementapi.GetSavedPurchaseQuotationDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.accountTransactionList = data.result.accountsTransactions;
          this.updateFormGrid(data.result);
          this.savedPurchaseQuotation = data.result;
          this.purchaseQuotationFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Purchase Quotation not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.purchaseQuotationFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.procurementapi
          .DeletePurchaseQuotation(this.savedPurchaseQuotation)
          .subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Purchase Quotation Deleted Succesfully',
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
    this.GetSavedPurchaseQuotationDetails(
      this.purchaseQuotationFormGroup.getRawValue().purchaseQuotationNo
    );
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.purchaseQuotationNo.clearValidators();
    this.purchaseQuotationFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.purchaseQuotationFormGroup,
      'purchaseQuotationLocationId',
      this.locationLocked
    );
    this.purchaseQuotationFormGroup.controls.purchaseQuotationNo.disable();
    this.purchaseQuotationFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.purchasequotation_entry.data.length > 0) {
      // this.purchasequotation_entry.data.forEach((value: GridData, index, arry) => {
      // console.log(Object.values(this.purchasequotation_entry.data));
      return Object.values(this.purchasequotation_entry.data).some(
        (k: GridData) =>
          k.itemname != null && k.netAmt != null && !(k.rate == null)
      );
      // });
    }
    return false;
  }

  selectprocurements(evt) {
    if (evt.job) {
      const jobname = evt.job.split(' -- ');
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 19, jobname[0]);
    }
    let trimmedSales = evt.procurements?.trim();
    const includesPcs = this.units.some((unit) =>
      unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
    );
    if (includesPcs && this.unitArray.length != 0) {
      const UnitId: string = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.procurementsId
      )?.unitMasterUnitShortName;
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, UnitId);
    } else {
      this.masterapi.GetUnitDetails(evt.procurementsId).subscribe((res) => {
        this.unitArray = res.result;
        this.unitArry = res.result.map((ar) =>
          ar.unitMasterUnitShortName?.trim()
        );
      });

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(
          this.activeRow.row,
          this.activeRow.column,
          evt.procurements
        );

      this.masterapi
        .GetItemMasterById({ id: evt.procurementsId })
        .subscribe((k) => {
          this.ItemMasterArrayByName = k.resultSet?.itemMaster;

          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(
              this.activeRow.row,
              5,
              this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitPrice
            );
          this.funitid =
            this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
          // const  UnitId: string = this.funitid != null ? this.unitList?.find(l => l.value == this.funitid).label : null;
          const UnitId = this.unitArray[0]?.unitMasterUnitShortName;

          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(this.activeRow.row, 3, UnitId);
        });
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

    this.masterapi.GetAllSupplierById(evt.procurementsId).subscribe((k) => {
      this.SupplierMasterArrayById = k.result;
      this.purchaseQuotationFormGroup.controls.purchaseQuotationPartyAddress.setValue(
        this.SupplierMasterArrayById?.suppliersMasterSupplierAddress
          ? this.SupplierMasterArrayById?.suppliersMasterSupplierAddress
          : ''
        //   (
        //     this.SupplierMasterArrayById?.suppliersMasterSupplierPoBox +
        //     ' ,' +
        //     this.SupplierMasterArrayById?.suppliersMasterSupplierTel1 +
        //     ',' +
        //     this.SupplierMasterArrayById?.suppliersMasterSupplierMobile
        //   ).toString()
      );
      this.purchaseQuotationFormGroup.controls.purchaseQuotationPartyVatNo.setValue(
        this.SupplierMasterArrayById?.suppliersMasterSupplierVatNo
      );
    });
  }
  hide(evt: boolean) {
    this.showProcurementsLookUp = false;
    this.formControlLookUp = false;
  }

  filter() {
    let filteredArray = this.filterArray;
    // console.log("this.filterArray",this.filterArray);
    if (this.PurchaseQuotationFilterForm.value.paymentVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.purchaseQuotationNo ===
          this.PurchaseQuotationFilterForm.value.paymentVoucherNo.toUpperCase()
      );
    }

    if (
      this.PurchaseQuotationFilterForm.value.paymentVoucherAcNo != null &&
      this.PurchaseQuotationFilterForm.value.paymentVoucherAcNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.paymentVoucherCrAcNo ===
          this.PurchaseQuotationFilterForm.value.paymentVoucherAcNo
      );
    }

    if (this.PurchaseQuotationFilterForm.value.isDate) {
      const fromDateStr = this.PurchaseQuotationFilterForm.value.fromDate;
      const toDateStr = this.PurchaseQuotationFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      // filteredArray = filteredArray?.filter((res) => {
      //   const voucherDate = new Date(res.purchaseQuotationDate);

      //   voucherDate.setHours(0, 0, 0, 0);
      //   fromDate.setHours(0, 0, 0, 0);

      //   return voucherDate.getTime() >= fromDate.getTime() && voucherDate.getTime() <= toDate.getTime() || voucherDate.getTime() === fromDate.getTime();;
      // });

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.purchaseQuotationDate);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.purchaseQuotationarry = filteredArray;
    }
    this.purchaseQuotationarry = filteredArray;
  }

  ClearFilter() {
    this.PurchaseQuotationFilterForm.reset();
    this.purchaseQuotationarry = this.filterArray;
    this.PurchaseQuotationFilterForm.get('fromDate').setValue(new Date());
    this.PurchaseQuotationFilterForm.get('toDate').setValue(new Date());
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
  itemId?: string;
  partNo?: string;
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

  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}

export const columnDetailList = (component: PurchasequotationComponent) => [
  {
    data: 'itemId',
    type: 'text',
    label: 'Item Id',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
  },
  {
    data: 'itemname',
    type: 'autocomplete',
    label: 'Item',
    source: component.ItemMasterArry,
    allowInvalid: false,
    strict: false,
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    source: component.unitArry,
    allowInvalid: false,
    strict: false,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Qty',
    readOnly: false,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    readOnly: false,
  },
  {
    data: 'amt',
    type: 'numeric',
    label: 'Amt',
  },
  {
    data: 'disc',
    type: 'numeric',
    label: 'Disc.',
    readOnly: false,
  },
  {
    data: 'grossAmt',
    type: 'numeric',
    label: 'Gross Amt',
  },
  {
    data: 'vatPer',
    type: 'numeric',
    label: 'VAT%.',
  },
  {
    data: 'vatAmt',
    type: 'numeric',
    label: 'VAT.Amt',
  },
  {
    data: 'netAmt',
    type: 'numeric',
    label: 'Net.Amt',
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    readOnly: false,
  },
  {
    data: 'jobname',
    type: 'dropdown',
    label: 'Job Name',
    source: component.jobArry,
  },
  {
    data: 'costcenter',
    type: 'dropdown',
    label: 'Cost Center',
    source: component.costcenterArry,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
  },
];
