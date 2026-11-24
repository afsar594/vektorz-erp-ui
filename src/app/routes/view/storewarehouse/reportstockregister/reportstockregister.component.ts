import { Component, OnInit } from '@angular/core';
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
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { ReportStockRegister } from 'src/app/routes/domain/Store/ReportStockRegister';
import { PurchaseVoucher } from 'src/app/routes/domain/PurchaseVoucher';
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
import { StorewarehousesApiService } from 'src/app/routes/service/storewarehouse.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-reportstockregister',
  templateUrl: './reportstockregister.component.html',
  styleUrls: ['./reportstockregister.component.scss'],
})
export class ReportstockregisterComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  reportStockRegisterarry: ReportStockRegister[] = [];
  savedPurchaseVoucher: PurchaseVoucher;

  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  ScreenId: number;
  Permission: any;

  FILL_COMBO() {
    this.v_typeList = [
      { label: 'CASH', value: { name: 'CASH' } },
      { label: 'CREDIT', value: { name: 'CREDIT' } },
    ];
    this.v_RoundoffList = [
      { label: '+', value: { name: '+' } },
      { label: '-', value: { name: '-' } },
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
    private StoresApi: StorewarehousesApiService,
    private permission: PermissionsService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'purchasevoucher_HotEntry';
  purchasevoucher_entry: Handsontable.GridSettings;
  purchaseVoucherFormGroup: FormGroup;
  purchasevoucher_entryDataset = [];
  // accountTransactionDataset = [];
  cols;
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

    this.FILL_COMBO();

    this.cols = [
      { field: 'purchaseVoucherNo', header: 'Voucher No' },
      { field: 'purchaseVoucherDate', header: 'Date' },
      { field: 'purchaseVoucherType', header: 'Type' },
      { field: 'suppliersMasterSupplierName', header: 'Supplier' },
      { field: 'purchaseVoucherPartyName', header: 'Party Name' },
      { field: 'purchaseVoucherPartyVatNo', header: 'VAT#' },
      { field: 'purchaseVoucherSupInvNo', header: 'Supp INV#' },
      { field: 'purchaseVoucherExcludeVat', header: '0 VAT' },
      { field: 'currencyMasterCurrencyName', header: 'Currency' },
      { field: 'jobMasterJobName', header: 'JOB' },
      { field: 'locationMasterLocationName', header: 'Location' },

      { field: 'purchaseVoucherTotalGrossAmount', header: 'Gross' },
      { field: 'purchaseVoucherTotalItemDisAmount', header: 'Item Disc' },
      { field: 'purchaseVoucherTotalDisPer', header: 'Disc %' },
      { field: 'purchaseVoucherTotalDisAmount', header: 'Disc Amt' },
      { field: 'purchaseVoucherTotalActualAmount', header: 'VatableAmt' },
      { field: 'purchaseVoucherVatPer', header: 'VAT %' },

      { field: 'purchaseVoucherVatAmt', header: 'Vat Amt' },
      { field: 'purchaseVoucherVatRountAmt', header: 'Round.Amt' },
      { field: 'purchaseVoucherNetAmount', header: 'Net.Amt' },

      { field: 'purchaseVoucherDetailsMatId', header: 'Item Id' },
      { field: 'itemMasterPartNo', header: 'Part No' },
      { field: 'itemMasterItemName', header: 'Item Name' },
      { field: 'purchaseVoucherDetailsItemName', header: 'Item Desc' },
      { field: 'purchaseVoucherDetailsUnitName', header: 'Unit' },

      { field: 'purchaseVoucherDetailsQuantity', header: 'Qty' },
      { field: 'purchaseVoucherDetailsRate', header: 'Rate' },
      { field: 'purchaseVoucherDetailsDiscAmount', header: 'Disc' },
      { field: 'purchaseVoucherDetailsNetAmt', header: 'Net' },
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.purchaseVoucherFormGroup = this.fb.group({
      purchaseVoucherId: [0],
      purchaseVoucherNo: [{ value: '', disabled: true }],
      purchaseVoucherDate: [null, [Validators.required]],
      purchaseVoucherRefNo: ['', [Validators.required]],
      purchaseVoucherSupInvNo: [''],
      purchaseVoucherCurrencyId: [-1, [DropDownValidator]],
      purchaseVoucherExcludeVat: [false],
      purchaseVoucherType: ['CASH'],
      purchaseVoucherPartyId: [-1, [DropDownValidator]],
      purchaseVoucherPartyName: [''],
      purchaseVoucherPartyAddress: [''],
      purchaseVoucherPartyVatNo: '',
      purchaseVoucherDescription: ['', [Validators.required]],
      purchaseVoucherGrno: [null],
      purchaseVoucherGrdate: [null],
      purchaseVoucherLpono: [null],
      purchaseVoucherLpodate: [null],
      purchaseVoucherQtnNo: [null],
      purchaseVoucherQtnDate: [null],
      purchaseVoucherPono: [null],
      purchaseVoucherBatchCode: [null],
      purchaseVoucherDayBookNo: [null],
      purchaseVoucherJobId: [null],
      purchaseVoucherLocationId: [-1, [DropDownValidator]],
      purchaseVoucherTotalGrossAmount: [{ value: [0], disabled: true }],
      purchaseVoucherTotalItemDisAmount: [{ value: [0], disabled: true }],
      purchaseVoucherTotalDisPer: [0],
      purchaseVoucherTotalDisAmount: [0],
      purchaseVoucherVatPer: [5],
      purchaseVoucherVatAmt: [0],
      purchaseVoucherTotalActualAmount: [0],
      purchaseVoucherVatRoundSign: ['-'],
      purchaseVoucherVatRountAmt: [0],
      purchaseVoucherNetAmount: [0],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
  }

  get f() {
    return this.purchaseVoucherFormGroup.controls;
  }

  initializeControls() {
    this.getAllJobs();
    this.getAllCostCenter();
    this.getAllAccount();
    this.getAllUnit();

    this.getAllItemMaster();
    this.getAllSupplierMaster();

    this.getAllCurrency();

    this.getAllLocation();

    this.getAllPurchaseVoucher();
    this.purchasevoucher_entry = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 10,
      width: '100%',
      height: 280,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      enterMoves: { row: 0, col: 1 },
      data: [],
      minSpareRows: 1,
      // allowInsertColumn: false,
      allowInsertRow: true,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      stretchH: 'all',
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      manualRowResize: true,
      manualColumnResize: true,
      hiddenColumns: {
        columns: [0, 1, 2],
        indicators: false,
      },
      // rowHeaders: true,

      columns: [
        {
          data: 'stockRegisterId',
          type: 'numeric',
          width: 100,
        },
        {
          data: 'stockRegisterMatId',
          type: 'text',
          width: 100,
        },

        {
          data: 'itemMasterPartNo',
          type: 'text',
          width: 100,
        },

        {
          data: 'itemMasterItemName',
          type: 'text',
          width: 100,
        },

        {
          data: 'stockRegisterVoucherDate',
          type: 'date',
          width: 100,
        },

        {
          data: 'stockRegisterVoucherNo',
          type: 'text',
          width: 100,
        },

        {
          data: 'stockRegisterTransType',
          type: 'text',
          width: 100,
        },

        {
          data: 'stockRegisterExpDate',
          type: 'date',
          width: 100,
        },

        {
          data: 'stockRegisterBatchCode',
          type: 'text',
          width: 100,
        },
        {
          data: 'locationMasterLocationName',
          type: 'text',
          width: 100,
        },

        {
          data: 'stockRegisterRemarks',
          type: 'text',
          width: 100,
        },

        {
          data: 'jobMasterJobName',
          type: 'text',
          width: 100,
        },

        {
          data: 'stockRegisterSno',
          type: 'text',
          width: 200,
        },

        {
          data: 'unitMasterUnitShortName',
          type: 'text',
          width: 100,
        },

        {
          data: 'stockRegisterQuantity',
          type: 'numeric',
          width: 100,
        },

        {
          data: 'stockRegisterSin',
          type: 'numeric',
          width: 200,
        },

        {
          data: 'stockRegisterSout',
          type: 'numeric',
          width: 100,
        },

        {
          data: 'stockRegisterRate',
          type: 'numeric',
          width: 100,
        },

        {
          data: 'stockRegisterAmount',
          type: 'numeric',
          width: 100,
        },

        {
          data: 'stockRegisterFcRate',
          type: 'numeric',
          width: 100,
        },

        {
          data: 'stockRegisterFcAmount',
          type: 'numeric',
          width: 100,
        },

        {
          data: 'stockRegisterNetStkBal',
          type: 'numeric',
          width: 200,
        },

        //  {
        //     data: 'stockRegisterUnitId',
        //     type: 'text'  ,
        //     width:100,
        //   },

        //     {
        //       data: 'departmentMasterDepartmentName',
        //       type: 'text'  ,
        //       width:100,
        //     },
        //     {
        //        data: 'costCenterMasterCostCenterName',
        //        type: 'text'  ,
        //        width:100,
        //      },

        //          {
        //            data: 'currencyMasterCurrencyName',
        //            type: 'text'  ,
        //            width:100,
        //          },

        //          {
        //              data: 'stockRegisterLandingCost',
        //              type: 'numeric'  ,
        //              width:100,
        //           },

        //           {
        //               data: 'stockRegisterStatus',
        //               type: 'text' ,
        //               width:100,
        //           },

        //           {
        //              data: 'accountsTransactionsLpoNo',
        //              type: 'text'  ,
        //              width:100,
        //           },
        //           {
        //               data: 'accountsTransactionsApprovalDt',
        //               type: 'date'  ,
        //               width:100,

        //             },

        //   {
        //     data: 'stockRegisterDepId',
        //     type: 'numeric'  ,
        //     width:100,

        //   },

        //   {
        //     data: 'stockRegisterLocationId',
        //     type: 'numeric'  ,
        //     width:100,

        //   },
        //   {
        //     data: 'stockRegisterJobId',
        //     type: 'numeric'  ,
        //     width:100,

        //   },

        //   {
        //     data: 'accountsTransactionsTstamp',
        //      type: 'date'  ,
        //     width:100,

        //   },
      ],
      colHeaders: [
        this.translate.instant('ID'),
        this.translate.instant('Item Id'),
        this.translate.instant('Part No'),
        this.translate.instant('Item'),

        this.translate.instant('Date'),
        this.translate.instant('VoucherNo'),
        this.translate.instant('VoucherType'),
        this.translate.instant('ExpDate'),
        this.translate.instant('BatchCode'),
        this.translate.instant('Location'),
        this.translate.instant('Remarks'),
        this.translate.instant('Job'),
        this.translate.instant('Sl #'),
        this.translate.instant('Unit'),
        this.translate.instant('Qty'),
        this.translate.instant('SIN'),
        this.translate.instant('SOT'),
        this.translate.instant('Rate'),
        this.translate.instant('Amt'),
        this.translate.instant('Fc Rate'),
        this.translate.instant('Fc Amt'),
        this.translate.instant('Net Bal'),
        //     this.translate.instant('Approval Date'),
        //   this.translate.instant('Debit'),
        //       this.translate.instant('Credit'),
        //  this.translate.instant('FcDebit'),
        //     this.translate.instant('FcCredit'),
        //     this.translate.instant('AllocDebit'),
        //     this.translate.instant('AllocCredit'),
        //     this.translate.instant('AllocBalance'),
        //     this.translate.instant('FcAllocDebit'),
        //     this.translate.instant( 'FcAllocCredit'),
        //     this.translate.instant( 'FcAllocBalance'),
        //     this.translate.instant( 'TimeStamp'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.purchasevoucher_entry.beforeChangeRender = (change, source) => {};
    this.purchasevoucher_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
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

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = k.map((ar) => ar.currencyMasterCurrencyName.trim());
    });
  }
  getAllJobs() {
    this.masterapi.GetAllJob().subscribe((k) => {
      this.jobArray = k;
      this.jobList = k.map((kl) => ({
        label: kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = k.map((ar) => ar.jobMasterJobName.trim());
    });
  }

  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      this.locationArray = k;
      this.locationList = k.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = k.map((ar) => ar.locationMasterLocationName.trim());
    });
  }

  getAllCostCenter() {
    this.masterapi.GetAllCostCenter().subscribe((k) => {
      this.costcenterArray = k;
      this.costcenterList = k.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterArry = k.map((ar) =>
        ar.costCenterMasterCostCenterName.trim()
      );
    });
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
        (ar) => ar.maAccName.trim() + '|' + ar.maAccNo
      );
    });
  }
  getAllItemMaster() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k.result.map(
        (ar) => ar.itemMasterItemName.trim() + '|' + ar.itemMasterItemId
      );
    });
  }
  getAllSupplierMaster() {
    this.masterapi.GetAllSupplier().subscribe((k) => {
      this.SupplierMasterArray = k;
      this.SupplierMasterList = k.map((kl) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.SupplierMasterList.unshift({
        label: '--Select Supplier--',
        value: -1,
      });
      this.SupplierMasterArry = k.map(
        (ar) =>
          ar.suppliersMasterSupplierName.trim() +
          '|' +
          ar.suppliersMasterSupplierId
      );
    });
  }

  getAllUnit() {
    this.masterapi.GetAllUnit().subscribe((k) => {
      this.unitArray = k;
      this.unitList = k.map((kl) => ({
        label: kl.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitList.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = k.map(
        (ar) => ar.unitMasterUnitShortName.trim() + '|' + ar.unitMasterUnitId
      );
    });
  }

  validateTotalDrCrAmounts(): boolean {
    if (
      this.purchaseVoucherFormGroup.getRawValue()
        .purchaseVoucherTotalGrossAmount == 0 &&
      this.purchaseVoucherFormGroup.getRawValue()
        .purchaseVoucherTotalItemDisAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    if (
      this.purchaseVoucherFormGroup.getRawValue()
        .purchaseVoucherTotalItemDisAmount == 0
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

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllPurchaseVoucher() {
    this.StoresApi.MainReport_GetReportStockRegister().subscribe((data) => {
      this.reportStockRegisterarry = data.result;
      this.updateHot_Report(data.result);
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo.trim() === acctnumber.trim()
    ).maAccName;
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    ).itemMasterItemName;
  }

  public getUnitName(unit: number): string {
    return this.unitArray?.find((j) => j.unitMasterUnitId === unit)
      .unitMasterUnitShortName;
  }

  new() {
    this.purchaseVoucherFormGroup.reset();
    this.purchasevoucher_entry.data = [];
    this.purchasevoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.purchasevoucher_entry);
    //  this.hotRegisterer.getInstance(this.hotid).selectAll();
    //  this.hotRegisterer.getInstance(this.hotid).destroyEditor(false, true);
    //  this.hotRegisterer.getInstance(this.hotid).clear();
    //  this.hotRegisterer.getInstance(this.hotid).selectCell(0, 0);

    this.accountTransactionList = [];
    this.purchaseVoucherFormGroup.get('purchaseVoucherId').setValue(null);
    this.purchaseVoucherFormGroup.get('purchaseVoucherPartyId').setValue(-1);
    this.purchaseVoucherFormGroup.get('purchaseVoucherJobId').setValue(-1);
    this.purchaseVoucherFormGroup.get('purchaseVoucherCurrencyId').setValue(-1);
    this.purchaseVoucherFormGroup.get('purchaseVoucherLocationId').setValue(-1);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.purchaseVoucherFormGroup.enable();
    this.f.purchaseVoucherNo.clearValidators();
    this.purchaseVoucherFormGroup.updateValueAndValidity();
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  cancel() {}

  updateHot_Report(ReportStockRegister_update: ReportStockRegister[]) {
    // this.updateHot_Report(data.result);

    const gridData: GridData[] = ReportStockRegister_update.map((k) => {
      return {
        stockRegisterId: k.stockRegisterId,
        itemMasterPartNo: k.itemMasterPartNo,
        unitMasterUnitShortName: k.unitMasterUnitShortName,
        stockRegisterMatId: k.stockRegisterMatId,
        itemMasterItemName: k.itemMasterItemName,

        stockRegisterVoucherDate: k.stockRegisterVoucherDate,
        stockRegisterTransType: k.stockRegisterTransType,
        stockRegisterVoucherNo: k.stockRegisterVoucherNo,

        stockRegisterQuantity: k.stockRegisterQuantity,
        stockRegisterSin: k.stockRegisterSin,
        stockRegisterSout: k.stockRegisterSout,
        stockRegisterAmount: k.stockRegisterAmount,

        stockRegisterFcAmount: k.stockRegisterFcAmount,
        stockRegisterFcRate: k.stockRegisterFcRate,
        stockRegisterRate: k.stockRegisterRate,
        stockRegisterDepId: k.stockRegisterDepId,
        stockRegisterLocationId: k.stockRegisterLocationId,
        stockRegisterJobId: k.stockRegisterJobId,

        stockRegisterRemarks: k.stockRegisterRemarks,
        stockRegisterBatchCode: k.stockRegisterBatchCode,
        stockRegisterSno: k.stockRegisterSno,

        stockRegisterFsno: k.stockRegisterFsno,
        stockRegisterNetStkBal: k.stockRegisterNetStkBal,
        stockRegisterUnitId: k.stockRegisterUnitId,
        stockRegisterExpDate: k.stockRegisterExpDate,
        //  departmentMasterDepartmentName: k.departmentMasterDepartmentName,
        locationMasterLocationName: k.locationMasterLocationName,
        jobMasterJobName: k.jobMasterJobName,
        //  costCenterMasterCostCenterName: k.costCenterMasterCostCenterName,
        //  currencyMasterCurrencyName: k.currencyMasterCurrencyName,
        stockRegisterLandingCost: k.stockRegisterLandingCost,
        stockRegisterStatus: k.stockRegisterStatus,
        //  accountsTransactionsLpoNo: k.accountsTransactionsLpoNo,
        //  accountsTransactionsApprovalDt: k.accountsTransactionsApprovalDt,

        //  accountsTransactionsStatus: k.accountsTransactionsStatus,
        //  accountsTransactionsTstamp: k.accountsTransactionsTstamp,

        //     accountsTransactionsDrGram: k.accountsTransactionsDrGram,
        //   accountsTransactionsCrGram: k.accountsTransactionsCrGram,

        //  accountsTransactionsFsno: k.accountsTransactionsFsno,
        //  accountsTransactionsUserId: k.accountsTransactionsCompanyId,
        //  accountsTransactionsCompanyId: k.accountsTransactionsCompanyId,
        //  accountsTransactionsCurrencyId: k.accountsTransactionsCurrencyId,
        //  accountsTransactionsLocation: k.accountsTransactionsLocation,
        //  accountsTransactionsJobNo: k.accountsTransactionsJobNo,
        //   accountsTransactionsCostCenterId: k.accountsTransactionsCostCenterId,
        //   accountsTransactionsDepartment: k.accountsTransactionsDepartment,
        //   accountsTransactionsDeptId: k.accountsTransactionsDeptId,
        //   accountstransactionsDelStatus: k.accountstransactionsDelStatus,
      };
    });

    this.purchasevoucher_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.purchaseVoucherFormGroup.disable();
    this.f.purchaseVoucherNo.clearValidators();
    this.purchaseVoucherFormGroup.updateValueAndValidity();
  }
}

interface GridData {
  stockRegisterId?: number;
  itemMasterPartNo?: string;
  unitMasterUnitShortName?: string;
  stockRegisterMatId?: number;
  itemMasterItemName?: string;

  stockRegisterVoucherDate?: Date;
  stockRegisterTransType?: string;
  stockRegisterVoucherNo?: string;

  stockRegisterQuantity?: number;
  stockRegisterSin?: number;
  stockRegisterSout?: number;
  stockRegisterAmount?: number;

  stockRegisterFcAmount?: number;
  stockRegisterFcRate?: number;
  stockRegisterRate?: number;
  stockRegisterDepId?: number;
  stockRegisterLocationId?: number;
  stockRegisterJobId?: number;

  stockRegisterRemarks?: string;
  stockRegisterBatchCode?: string;
  stockRegisterSno?: number;

  stockRegisterFsno?: number;
  stockRegisterNetStkBal?: number;
  stockRegisterUnitId?: number;
  stockRegisterExpDate?: Date;
  departmentMasterDepartmentName?: string;
  locationMasterLocationName?: string;
  jobMasterJobName?: string;
  costCenterMasterCostCenterName?: string;
  currencyMasterCurrencyName?: string;
  stockRegisterLandingCost?: number;
  stockRegisterStatus?: string;
  accountsTransactionsLpoNo?: string;
  accountsTransactionsApprovalDt?: Date;
  accountsTransactionsStatus?: string;
  accountsTransactionsTstamp?: Date;
  accountsTransactionsDrGram?: number;
  accountsTransactionsCrGram?: number;
  accountsTransactionsFsno?: number;
  accountsTransactionsUserId?: number;
  accountsTransactionsCompanyId?: number;
  accountsTransactionsCurrencyId?: number;
  accountsTransactionsLocation?: number;
  accountsTransactionsJobNo?: number;
  accountsTransactionsCostCenterId?: number;
  accountsTransactionsDepartment?: number;
  accountsTransactionsDeptId?: number;
  accountstransactionsDelStatus?: boolean;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
