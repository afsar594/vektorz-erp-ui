import { Component, OnInit } from '@angular/core';
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
import { ReportPurchaseReturn } from 'src/app/routes/domain/Procurements/ReportPurchaseReturn';
import { PurchaseReturn } from 'src/app/routes/domain/Procurements/PurchaseReturn';
import { PurchaseReturnDetails } from 'src/app/routes/domain/Procurements/PurchaseReturnDetails';
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
import { DatePipe } from '@angular/common';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-reportpurchasereturn',
  templateUrl: './reportpurchasereturn.component.html',
  styleUrls: ['./reportpurchasereturn.component.scss'],
})
export class ReportpurchasereturnComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  Permission: any;
  ScreenId: number;
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
  reportPurchaseReturnarry: ReportPurchaseReturn[] = [];
  // savedPurchaseReturnGridData: GridData[] = [];
  savedPurchaseReturn: PurchaseReturn;

  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];

  FILL_COMBO() {
    //SelectItem API with label-value pairs
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
    private utilityService: UtilityService,
    private router: Router,
    private datepipes: DatePipe,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    private procurentapi: ProcurementApiService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'purchasereturn_HotEntry';
  purchasereturn_entry: Handsontable.GridSettings;
  purchaseReturnFormGroup: FormGroup;
  purchasereturn_entryDataset = [];
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
      { field: 'purchaseReturnNo', header: 'Voucher No' },
      { field: 'purchaseReturnDate', header: 'Date' },
      { field: 'purchaseReturnType', header: 'Type' },
      { field: 'suppliersMasterSupplierName', header: 'Supplier' },
      { field: 'purchaseReturnPartyName', header: 'Party Name' },
      { field: 'purchaseReturnPartyVatNo', header: 'VAT#' },
      { field: 'purchaseReturnSupInvNo', header: 'Supp INV#' },
      { field: 'purchaseReturnExcludeVat', header: '0 VAT' },
      { field: 'currencyMasterCurrencyName', header: 'Currency' },
      { field: 'jobMasterJobName', header: 'JOB' },
      { field: 'locationMasterLocationName', header: 'Location' },

      { field: 'purchaseReturnTotalGrossAmount', header: 'Gross' },
      { field: 'purchaseReturnTotalItemDisAmount', header: 'Item Disc' },
      { field: 'purchaseReturnTotalDisPer', header: 'Disc %' },
      { field: 'purchaseReturnTotalDisAmount', header: 'Disc Amt' },
      { field: 'purchaseReturnTotalActualAmount', header: 'VatableAmt' },
      { field: 'purchaseReturnVatPer', header: 'VAT %' },

      { field: 'purchaseReturnVatAmt', header: 'Vat Amt' },
      { field: 'purchaseReturnVatRountAmt', header: 'Round.Amt' },
      { field: 'purchaseReturnNetAmount', header: 'Net.Amt' },

      { field: 'purchaseReturnDetailsMatId', header: 'Item Id' },
      { field: 'itemMasterPartNo', header: 'Part No' },
      { field: 'itemMasterItemName', header: 'Item Name' },
      { field: 'purchaseReturnDetailsItemName', header: 'Item Desc' },
      { field: 'purchaseReturnDetailsUnitName', header: 'Unit' },

      { field: 'purchaseReturnDetailsQuantity', header: 'Qty' },
      { field: 'purchaseReturnDetailsRate', header: 'Rate' },
      { field: 'purchaseReturnDetailsDiscAmount', header: 'Disc' },
      { field: 'purchaseReturnDetailsNetAmt', header: 'Net' },
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.purchaseReturnFormGroup = this.fb.group({
      purchaseReturnId: [0],
      purchaseReturnNo: [{ value: '', disabled: true }],
      purchaseReturnDate: [null, [Validators.required]],
      purchaseReturnRefNo: ['', [Validators.required]],
      purchaseReturnSupInvNo: [''],
      purchaseReturnCurrencyId: [-1, [DropDownValidator]],
      purchaseReturnExcludeVat: [false],

      purchaseReturnType: ['CASH'],
      purchaseReturnPartyId: [-1, [DropDownValidator]],
      purchaseReturnPartyName: [''],
      purchaseReturnPartyAddress: [''],
      purchaseReturnPartyVatNo: '',
      purchaseReturnDescription: ['', [Validators.required]],

      purchaseReturnGrno: [null],
      purchaseReturnGrdate: [null],
      purchaseReturnLpono: [null],
      purchaseReturnLpodate: [null],
      purchaseReturnQtnNo: [null],
      purchaseReturnQtnDate: [null],
      purchaseReturnPono: [null],
      purchaseReturnBatchCode: [null],
      purchaseReturnDayBookNo: [null],
      purchaseReturnJobId: [null],
      purchaseReturnLocationId: [-1, [DropDownValidator]],

      purchaseReturnTotalGrossAmount: [{ value: [0], disabled: true }],
      purchaseReturnTotalItemDisAmount: [{ value: [0], disabled: true }],
      purchaseReturnTotalDisPer: [0],
      purchaseReturnTotalDisAmount: [0],
      purchaseReturnVatPer: [5],
      purchaseReturnVatAmt: [0],
      purchaseReturnTotalActualAmount: [0],
      purchaseReturnVatRoundSign: ['-'],
      purchaseReturnVatRountAmt: [0],
      purchaseReturnNetAmount: [0],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.bykeys();
  }

  get f() {
    return this.purchaseReturnFormGroup.controls;
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
    const hiddenColumns = [9];

    if (this.hideJobDetail) {
      hiddenColumns.push(5);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
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

    this.getAllPurchaseReturn();
    const hiddenColumns = [5, 9];
    this.purchasereturn_entry = this.utilityService.getTableConfig(
      ColumnList(this),
      hiddenColumns
    );

    this.purchasereturn_entry.beforeChangeRender = (change, source) => {
      this.ColumnSum();

      this.GetTotal();
    };
    this.purchasereturn_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
      this.GetTotal();
    };

    this.purchasereturn_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }
  ColumnSum() {
    var sum01 = 0;
    this.purchasereturn_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.disc) {
        sum01 += elemt.disc;
      }
    });
    this.purchaseReturnFormGroup.controls.purchaseReturnTotalItemDisAmount.setValue(
      sum01
    );

    var sum02 = 0;
    this.purchasereturn_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.netAmt) {
        sum02 += elemt.netAmt;
      }
    });
    this.purchaseReturnFormGroup.controls.purchaseReturnTotalGrossAmount.setValue(
      sum01
    );

    const CreditDebitDiff = sum01 - sum02;

    // const sum1 = this..data?.filter(item => item.hasOwnProperty('disc'))
    // .reduce((sum, current) => sum + current.disc, 0);
    // this.purchaseReturnFormGroup.controls.purchaseReturnTotalItemDisAmount.setValue(sum1);

    // const sum2 = this.purchasereturn_entry.data?.filter(item => item.hasOwnProperty('netAmt'))
    // .reduce((sum, current) => sum + current.netAmt, 0);
    // this.purchaseReturnFormGroup.controls.purchaseReturnTotalGrossAmount.setValue(sum2);

    this.GetTotal();
  }
  CalcDiscFromPer() {
    this.purchaseReturnFormGroup.controls.purchaseReturnTotalDisAmount.setValue(
      (this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount *
        this.purchaseReturnFormGroup.value.purchaseReturnTotalDisPer) /
        100
    );
    this.GetTotal();
  }
  CalcDiscFromAmt() {
    this.purchaseReturnFormGroup.controls.purchaseReturnTotalDisPer.setValue(
      (this.purchaseReturnFormGroup.value.purchaseReturnTotalDisAmount * 100) /
        this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount
    );
    this.GetTotal();
  }
  GetTotal($event = null) {
    console.log('change', $event);

    this.purchaseReturnFormGroup.controls.purchaseReturnTotalActualAmount.setValue(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount -
        this.purchaseReturnFormGroup.value.purchaseReturnTotalDisAmount
    );

    // console.log(this.purchaseReturnFormGroup.value.purchaseReturnVatRoundSign)
    this.purchaseReturnFormGroup.controls.purchaseReturnVatAmt.setValue(
      (this.purchaseReturnFormGroup.value.purchaseReturnTotalActualAmount *
        this.purchaseReturnFormGroup.value.purchaseReturnVatPer) /
        100
    );

    if (
      this.purchaseReturnFormGroup.value.purchaseReturnVatRoundSign.name == '+'
    ) {
      this.purchaseReturnFormGroup.controls.purchaseReturnNetAmount.setValue(
        this.purchaseReturnFormGroup.value.purchaseReturnTotalActualAmount +
          this.purchaseReturnFormGroup.value.purchaseReturnVatAmt +
          Number(this.purchaseReturnFormGroup.value.purchaseReturnVatRountAmt)
      );
    } else {
      this.purchaseReturnFormGroup.controls.purchaseReturnNetAmount.setValue(
        this.purchaseReturnFormGroup.value.purchaseReturnTotalActualAmount +
          this.purchaseReturnFormGroup.value.purchaseReturnVatAmt -
          this.purchaseReturnFormGroup.value.purchaseReturnVatRountAmt
      );
    }
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
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
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
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

  savePurchaseReturn() {
    this.purchaseReturnFormGroup.markAllAsTouched();

    const savedData: Array<any> = this.purchasereturn_entry.data?.filter((k) =>
      k.hasOwnProperty('itemname')
    );
    const purchaseReturn_Save: PurchaseReturn = this.purchaseReturnFormGroup
      .value as PurchaseReturn;

    purchaseReturn_Save.purchaseReturnId = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnId
    );

    purchaseReturn_Save.purchaseReturnNo =
      this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo;
    purchaseReturn_Save.purchaseReturnDate =
      this.purchaseReturnFormGroup.value.purchaseReturnDate;
    purchaseReturn_Save.purchaseReturnRefNo =
      this.purchaseReturnFormGroup.value.purchaseReturnRefNo;
    purchaseReturn_Save.purchaseReturnSupInvNo =
      this.purchaseReturnFormGroup.value.purchaseReturnSupInvNo;
    purchaseReturn_Save.purchaseReturnCurrencyId =
      this.purchaseReturnFormGroup.value.purchaseReturnCurrencyId;
    //  purchaseReturn_Save.purchaseReturnExcludeVat = this.purchaseReturnFormGroup.value.purchaseReturnExcludeVat;
    purchaseReturn_Save.purchaseReturnExcludeVat = true;

    // purchaseReturn_Save.purchaseReturnType = this.purchaseReturnFormGroup.value.purchaseReturnType.name;
    purchaseReturn_Save.purchaseReturnType = 'CASH';

    purchaseReturn_Save.purchaseReturnPartyId =
      this.purchaseReturnFormGroup.value.purchaseReturnPartyId;
    //  purchaseReturn_Save.purchaseReturnPartyName = this.purchaseReturnFormGroup.value.purchaseReturnPartyName;
    purchaseReturn_Save.purchaseReturnPartyName = 'PARTY NAME';
    purchaseReturn_Save.purchaseReturnPartyAddress =
      this.purchaseReturnFormGroup.value.purchaseReturnPartyAddress;
    purchaseReturn_Save.purchaseReturnPartyVatNo =
      this.purchaseReturnFormGroup.value.purchaseReturnPartyVatNo;
    purchaseReturn_Save.purchaseReturnDescription =
      this.purchaseReturnFormGroup.value.purchaseReturnDescription;

    purchaseReturn_Save.purchaseReturnGrno =
      this.purchaseReturnFormGroup.value.purchaseReturnGrno;
    purchaseReturn_Save.purchaseReturnGrdate =
      this.purchaseReturnFormGroup.value.purchaseReturnGrdate;
    purchaseReturn_Save.purchaseReturnLpono =
      this.purchaseReturnFormGroup.value.purchaseReturnLpono;
    purchaseReturn_Save.purchaseReturnLpodate =
      this.purchaseReturnFormGroup.value.purchaseReturnLpodate;
    purchaseReturn_Save.purchaseReturnQtnNo =
      this.purchaseReturnFormGroup.value.purchaseReturnQtnNo;
    purchaseReturn_Save.purchaseReturnQtnDate =
      this.purchaseReturnFormGroup.value.purchaseReturnQtnDate;

    purchaseReturn_Save.purchaseReturnPono =
      this.purchaseReturnFormGroup.value.purchaseReturnPono;
    purchaseReturn_Save.purchaseReturnBatchCode =
      this.purchaseReturnFormGroup.value.purchaseReturnBatchCode;
    purchaseReturn_Save.purchaseReturnDayBookNo =
      this.purchaseReturnFormGroup.value.purchaseReturnDayBookNo;
    purchaseReturn_Save.purchaseReturnLocationId =
      this.purchaseReturnFormGroup.value.purchaseReturnLocationId;
    purchaseReturn_Save.purchaseReturnJobId =
      this.purchaseReturnFormGroup.value.purchaseReturnJobId;

    purchaseReturn_Save.purchaseReturnTotalGrossAmount = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalGrossAmount
    );
    purchaseReturn_Save.purchaseReturnTotalItemDisAmount = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalItemDisAmount
    );
    purchaseReturn_Save.purchaseReturnTotalDisPer = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalDisPer
    );
    purchaseReturn_Save.purchaseReturnTotalDisAmount = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalDisAmount
    );
    purchaseReturn_Save.purchaseReturnVatPer = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnVatPer
    );
    purchaseReturn_Save.purchaseReturnVatAmt = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnVatAmt
    );
    purchaseReturn_Save.purchaseReturnTotalActualAmount = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnTotalActualAmount
    );
    // purchaseReturn_Save.purchaseReturnVatRoundSign = this.purchaseReturnFormGroup.value.purchaseReturnVatRoundSign.name;
    purchaseReturn_Save.purchaseReturnVatRoundSign = '-';
    purchaseReturn_Save.purchaseReturnVatRountAmt = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnVatRountAmt
    );
    purchaseReturn_Save.purchaseReturnNetAmount = Number(
      this.purchaseReturnFormGroup.value.purchaseReturnNetAmount
    );

    purchaseReturn_Save.accountsTransactions = [];
    purchaseReturn_Save.purchaseReturnDetails = savedData
      ?.filter((k) => k.itemname != null && k.netAmt != null)
      .map((k: GridData) => {
        return {
          purchaseReturnDetailsId: k.id != null ? k.id : 0,
          purchaseReturnDetailsNo:
            this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo,

          purchaseReturnId: 0,
          purchaseReturnDetailsMatId: Number(k.itemname.trim().split('|')[1]),
          purchaseReturnDetailsQuantity: k.qty,
          purchaseReturnDetailsDiscAmount: k.disc,
          purchaseReturnDetailsRate: k.rate,
          purchaseReturnDetailsNetAmt: k.netAmt,
          purchaseReturnDetailsGrossAmount: 0,
          // purchaseReturnDetailsJobNo: k.jobname != null && k.jobname !== '' ? this.jobArray
          // ?.find(j => j.jobMasterJobName.trim()  === k.jobname.trim()).jobMasterId : null,
          // purchaseReturnDetailsCostCenterId: k.costcenter != null && k.costcenter !== '' ? this.costcenterArray
          // ?.find(j => j.costCenterMasterCostCenterName.trim()  === k.costcenter.trim()).costCenterMasterCostCenterId : null,
          purchaseReturnDetailsRemarks: k.address,
          purchaseReturnDetailsSno: 0,
          purchaseReturnDetailsUnitId: Number(k.unit.trim().split('|')[1]),
          purchaseReturnDetailsDelStatus: false,
        };
      });

    purchaseReturn_Save.purchaseReturnDetails
      ?.filter((x) => x.purchaseReturnDetailsDelStatus === false)
      .forEach((element) => {
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: 'AS11',
          accountsTransactionsTransDate: this.f.purchaseReturnDate.value,
          accountsTransactionsParticulars: element.purchaseReturnDetailsRemarks,
          // accountsTransactionsDebit: element.purchaseReturnDetailsDiscAmount,
          // accountsTransactionsFcDebit: element.purchaseReturnDetailsDiscAmount,
          accountsTransactionsDebit: 0,
          accountsTransactionsFcDebit: 0,
          accountsTransactionsCredit: 0,
          accountsTransactionsFcCredit: 0,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo: element.purchaseReturnDetailsNo,
          accountsTransactionsDescription: element.purchaseReturnDetailsRemarks,
          accountsTransactionsStatus: null,
          accountstransactionsDelStatus: false,
          accountsTransactionsTransSno: 0,
        };
        purchaseReturn_Save.accountsTransactions.push(debitData);

        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: 'AS11',
          accountsTransactionsTransDate: this.f.purchaseReturnDate.value,
          accountsTransactionsParticulars: element.purchaseReturnDetailsRemarks,
          accountsTransactionsDebit: 0,
          accountsTransactionsFcDebit: 0,
          // accountsTransactionsCredit: element.purchaseReturnDetailsDiscAmount,
          // accountsTransactionsFcCredit: element.purchaseReturnDetailsDiscAmount,
          accountsTransactionsCredit: 0,
          accountsTransactionsFcCredit: 0,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo,
          accountsTransactionsDescription:
            this.f.purchaseReturnDescription.value,
          accountsTransactionsStatus: null,
          accountstransactionsDelStatus: false,
          accountsTransactionsTransSno: 0,
        };
        purchaseReturn_Save.accountsTransactions.push(creditData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(purchaseReturn_Save);
    } else {
      purchaseReturn_Save.accountsTransactions
        ?.filter((x) => x.accountsTransactionsTransSno != 0)
        .forEach((element, index, arry) => {
          arry[index].accountstransactionsDelStatus = true;
        });

      this.updateVoucher(purchaseReturn_Save);
    }
  }

  validateTotalDrCrAmounts(): boolean {
    if (
      this.purchaseReturnFormGroup.getRawValue()
        .purchaseReturnTotalGrossAmount == 0 &&
      this.purchaseReturnFormGroup.getRawValue()
        .purchaseReturnTotalItemDisAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    if (
      this.purchaseReturnFormGroup.getRawValue()
        .purchaseReturnTotalItemDisAmount == 0
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

  saveVoucher(purchaseReturn_Save: PurchaseReturn) {
    if (this.purchaseReturnFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.procurentapi
              .InsertPurchaseReturn(purchaseReturn_Save)
              .subscribe(
                (data) => {
                  this.btnFlag = {
                    edit: true,
                    cancel: false,
                    save: false,
                    update: true,
                    delete: true,
                  };
                  this.savedPurchaseReturn = data.result;
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
                        data.message != null && data.message.trim() !== ''
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
      this.purchaseReturnFormGroup.markAllAsTouched();
      this.purchaseReturnFormGroup.markAsDirty();
    }
  }

  updateVoucher(purchaseReturn_Save: PurchaseReturn) {
    if (this.purchaseReturnFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.procurentapi
              .UpdatePurchaseReturn(purchaseReturn_Save)
              .subscribe(
                (data) => {
                  this.btnFlag = {
                    edit: true,
                    cancel: false,
                    save: false,
                    update: true,
                    delete: true,
                  };
                  this.updateFormGrid(data.result);
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Alert',
                    detail: 'Purchase Return Updated Succesfully',
                  });
                },
                (err) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail: 'Purchase Return Update Failed',
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
      this.purchaseReturnFormGroup.markAllAsTouched();
      this.purchaseReturnFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllPurchaseReturn() {
    this.procurentapi
      .PurchaseReturn_GetReportPurchaseReturn()
      .subscribe((data) => {
        this.reportPurchaseReturnarry = data.result;
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
    this.purchaseReturnFormGroup.reset();
    this.purchasereturn_entry.data = [];
    this.purchasereturn_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.purchasereturn_entry);
    //  this.hotRegisterer.getInstance(this.hotid).selectAll();
    //  this.hotRegisterer.getInstance(this.hotid).destroyEditor(false, true);
    //  this.hotRegisterer.getInstance(this.hotid).clear();
    //  this.hotRegisterer.getInstance(this.hotid).selectCell(0, 0);

    this.accountTransactionList = [];
    this.purchaseReturnFormGroup.get('purchaseReturnId').setValue(null);
    this.purchaseReturnFormGroup.get('purchaseReturnPartyId').setValue(-1);
    this.purchaseReturnFormGroup.get('purchaseReturnJobId').setValue(-1);
    this.purchaseReturnFormGroup.get('purchaseReturnCurrencyId').setValue(-1);
    this.purchaseReturnFormGroup.get('purchaseReturnLocationId').setValue(-1);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.purchaseReturnFormGroup.enable();
    this.f.purchaseReturnNo.clearValidators();
    this.purchaseReturnFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  showMaximizableDialog() {
    this.getAllPurchaseReturn();
    // this.displayMaximizable = true;
  }

  updateFormGrid(purchasereturn_update: PurchaseReturn) {
    this.purchaseReturnFormGroup.patchValue({
      purchaseReturnId: purchasereturn_update.purchaseReturnId,
      purchaseReturnNo: purchasereturn_update.purchaseReturnNo,
      purchaseReturnDate: new Date(purchasereturn_update.purchaseReturnDate),
      purchaseReturnRefNo: purchasereturn_update.purchaseReturnRefNo,
      purchaseReturnSupInvNo: purchasereturn_update.purchaseReturnSupInvNo,
      purchaseReturnCurrencyId: purchasereturn_update.purchaseReturnCurrencyId,
      purchaseReturnExcludeVat: purchasereturn_update.purchaseReturnExcludeVat,

      purchaseReturnType: purchasereturn_update.purchaseReturnType,
      purchaseReturnPartyId: purchasereturn_update.purchaseReturnPartyId,
      purchaseReturnPartyName: purchasereturn_update.purchaseReturnPartyName,
      purchaseReturnPartyAddress:
        purchasereturn_update.purchaseReturnPartyAddress,
      purchaseReturnPartyVatNo: purchasereturn_update.purchaseReturnPartyVatNo,
      purchaseReturnDescription:
        purchasereturn_update.purchaseReturnDescription,

      purchaseReturnGrno: purchasereturn_update.purchaseReturnGrno,
      purchaseReturnGrdate: new Date(
        purchasereturn_update.purchaseReturnGrdate
      ),
      purchaseReturnLpono: purchasereturn_update.purchaseReturnLpono,
      purchaseReturnLpodate: new Date(
        purchasereturn_update.purchaseReturnLpodate
      ),
      purchaseReturnQtnNo: purchasereturn_update.purchaseReturnQtnNo,
      purchaseReturnQtnDate: new Date(
        purchasereturn_update.purchaseReturnQtnDate
      ),

      purchaseReturnPono: purchasereturn_update.purchaseReturnPono,
      purchaseReturnBatchCode: purchasereturn_update.purchaseReturnBatchCode,
      purchaseReturnDayBookNo: purchasereturn_update.purchaseReturnDayBookNo,
      purchaseReturnLocationId: purchasereturn_update.purchaseReturnLocationId,
      purchaseReturnJobId: purchasereturn_update.purchaseReturnJobId,

      purchaseReturnTotalGrossAmount:
        purchasereturn_update.purchaseReturnTotalGrossAmount,
      purchaseReturnTotalItemDisAmount:
        purchasereturn_update.purchaseReturnTotalItemDisAmount,
      purchaseReturnTotalDisPer:
        purchasereturn_update.purchaseReturnTotalDisPer,
      purchaseReturnTotalDisAmount:
        purchasereturn_update.purchaseReturnTotalDisAmount,
      purchaseReturnVatPer: purchasereturn_update.purchaseReturnVatPer,
      purchaseReturnVatAmt: purchasereturn_update.purchaseReturnVatAmt,
      purchaseReturnTotalActualAmount:
        purchasereturn_update.purchaseReturnTotalActualAmount,
      purchaseReturnVatRoundSign:
        purchasereturn_update.purchaseReturnVatRoundSign,
      purchaseReturnVatRountAmt:
        purchasereturn_update.purchaseReturnVatRountAmt,
      purchaseReturnNetAmount: purchasereturn_update.purchaseReturnNetAmount,
    });
    this.accountTransactionList = purchasereturn_update.accountsTransactions;
    // this.jobArray?.find(j => j.jobMasterJobName.trim()  === k.jobname.trim()).jobMasterId,
    const gridData: GridData[] =
      purchasereturn_update.purchaseReturnDetails.map((k) => {
        let ItemId: string =
          k.purchaseReturnDetailsMatId != null
            ? this.ItemMasterArry?.find((l) =>
                l.match(k.purchaseReturnDetailsMatId.toString())
              )
            : null;
        let UnitId: string =
          k.purchaseReturnDetailsUnitId != null
            ? this.unitArry?.find((l) =>
                l.match(k.purchaseReturnDetailsUnitId.toString())
              )
            : null;
        // let  jobId: string = (k.purchaseReturnDetailsJobNo != null ) ? this.jobArry?.find(l =>
        //                      l.match(k.purchaseReturnDetailsJobNo.toString())) : null;
        // let  costCenterId: string = (k.purchaseReturnDetailsCostCenterId != null ) ? this.costcenterArry?.find(l =>
        //                       l.match(k.purchaseReturnDetailsCostCenterId.toString())) : null;

        return {
          // itemname: ItemId,
          // unit: UnitId,
          qty: k.purchaseReturnDetailsQuantity,
          rate: k.purchaseReturnDetailsRate,
          disc: k.purchaseReturnDetailsDiscAmount,
          netAmt: k.purchaseReturnDetailsNetAmt,

          // jobname: jobId,
          // costcenter: costCenterId,

          jobname: null,
          location: null,

          address: k.purchaseReturnDetailsRemarks,
          id: k.purchaseReturnDetailsId,
        };
      });

    this.purchasereturn_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.purchaseReturnFormGroup.disable();
    this.f.purchaseReturnNo.clearValidators();
    this.purchaseReturnFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  GetSavedPurchaseReturnDetails(id: string) {
    this.index = 0;

    this.procurentapi.GetSavedPurchaseReturnDetails(id).subscribe(
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
          this.savedPurchaseReturn = data.result;
          this.purchaseReturnFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Purchase Return not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.purchaseReturnFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.procurentapi
          .DeletePurchaseReturn(this.savedPurchaseReturn)
          .subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Purchase Return Deleted Succesfully',
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
    this.GetSavedPurchaseReturnDetails(
      this.purchaseReturnFormGroup.getRawValue().purchaseReturnNo
    );
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.purchaseReturnNo.clearValidators();
    this.purchaseReturnFormGroup.enable();
    this.purchaseReturnFormGroup.controls.purchaseReturnNo.disable();
    this.purchaseReturnFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.purchasereturn_entry.data.length > 0) {
      // this.purchasereturn_entry.data.forEach((value: GridData, index, arry) => {
      console.log(Object.values(this.purchasereturn_entry.data));
      return Object.values(this.purchasereturn_entry.data).some(
        (k: GridData) =>
          k.itemname != null && k.netAmt != null && !(k.rate == null)
      );
      // });
    }
    return false;
  }

  updateHot_Report(purchasereturn_update: ReportPurchaseReturn[]) {
    // this.updateHot_Report(data.result);

    const gridData: GridData[] = purchasereturn_update.map((k) => {
      return {
        id: k.purchaseReturnId,
        vNO: k.purchaseReturnNo,
        vDate: this.datepipes.transform(k.purchaseReturnDate, 'dd/MM/yyyy'),
        suppInv: k.purchaseReturnSupInvNo,
        vtype: k.purchaseReturnType,
        vparty: k.suppliersMasterSupplierName,
        vpartyName: k.purchaseReturnPartyName,
        address: k.purchaseReturnPartyAddress,
        vatNo: k.purchaseReturnPartyVatNo,
        currency: k.currencyMasterCurrencyName,
        jobname: k.jobMasterJobName,
        location: k.locationMasterLocationName,
        grossTot: k.purchaseReturnTotalGrossAmount,
        discitemTot: k.purchaseReturnTotalItemDisAmount,
        DiscPer: k.purchaseReturnTotalDisPer,
        DiscAmt: k.purchaseReturnTotalDisAmount,
        vatPerTot: k.purchaseReturnVatPer,
        vatAmtTot: k.purchaseReturnVatAmt,
        vatableTot: k.purchaseReturnTotalActualAmount,
        RoundTot: k.purchaseReturnVatRountAmt,
        netTot: k.purchaseReturnNetAmount,
        partNo: k.itemMasterPartNo,
        itemId: k.purchaseReturnDetailsMatId,
        itemname: k.itemMasterItemName,
        unit: k.unitMasterUnitShortName,
        qty: k.purchaseReturnDetailsQuantity,
        rate: k.purchaseReturnDetailsRate,
        disc: k.purchaseReturnDetailsDiscAmount,
        netAmt: k.purchaseReturnDetailsNetAmt,
      };
    });

    this.purchasereturn_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.purchaseReturnFormGroup.disable();
    this.f.purchaseReturnNo.clearValidators();
    this.purchaseReturnFormGroup.updateValueAndValidity();
  }
}

export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value.trim() !== '') {
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
  id?: number;
  vNO?: string;
  vDate?: string;
  suppInv?: string;

  currency?: string;
  jobname?: string;
  location?: string;
  exVat?: string;

  vtype?: string;
  vparty?: string;
  vpartyName?: string;
  address?: string;
  vatNo?: string;

  grossTot?: number;
  discitemTot?: number;
  DiscPer?: number;
  DiscAmt?: number;
  vatPerTot?: number;
  vatAmtTot?: number;
  vatableTot?: number;
  RoundTot?: number;
  netTot?: number;

  itemId?: number;
  partNo?: string;
  itemname?: string;
  unit?: string;
  qty?: number;
  rate?: number;
  // amt?: number;
  disc?: number;

  // grossAmt?: number;
  // vatPer?: number;
  // vatAmt?: number;
  netAmt?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const ColumnList = (component: ReportpurchasereturnComponent) => [
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
    toolTip: 'Record ID',
    width: 100,
  },
  {
    data: 'vNO',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Voucher Number',
    width: 100,
  },
  {
    data: 'vDate',
    type: 'date',
    label: 'Voucher Date',
    toolTip: 'Voucher Date',
    width: 100,
  },
  {
    data: 'suppInv',
    type: 'text',
    label: 'Supplier Invoice',
    toolTip: 'Supplier Invoice No',
    width: 100,
  },
  {
    data: 'currency',
    type: 'text',
    label: 'Currency',
    toolTip: 'Currency Type',
    width: 100,
  },
  {
    data: 'jobname',
    type: 'text',
    label: 'Job Name',
    toolTip: 'Job Name',
    width: 100,
  },
  {
    data: 'location',
    type: 'text',
    label: 'Location',
    toolTip: 'Location',
    width: 100,
  },
  {
    data: 'exVat',
    type: 'checkbox',
    label: 'Ex VAT',
    toolTip: 'Excluding VAT',
    width: 100,
  },
  {
    data: 'vtype',
    type: 'text',
    label: 'Voucher Type',
    toolTip: 'Voucher Type',
    width: 100,
  },
  {
    data: 'vparty',
    type: 'text',
    label: 'Party Code',
    toolTip: 'Party Code',
    width: 200,
  },
  {
    data: 'vpartyName',
    type: 'text',
    label: 'Party Name',
    toolTip: 'Party Name',
    width: 200,
  },
  {
    data: 'address',
    type: 'text',
    label: 'Address',
    toolTip: 'Address',
    width: 200,
  },
  {
    data: 'vatNo',
    type: 'text',
    label: 'VAT No',
    toolTip: 'VAT Number',
    width: 100,
  },

  {
    data: 'grossTot',
    type: 'numeric',
    label: 'Gross Total',
    toolTip: 'Gross Total',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'discitemTot',
    type: 'numeric',
    label: 'Item Discount Total',
    toolTip: 'Item-wise Discount Total',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'DiscPer',
    type: 'numeric',
    label: 'Discount %',
    toolTip: 'Overall Discount Percentage',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'DiscAmt',
    type: 'numeric',
    label: 'Discount Amt',
    toolTip: 'Overall Discount Amount',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'vatPerTot',
    type: 'numeric',
    label: 'VAT %',
    toolTip: 'Total VAT Percentage',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'vatAmtTot',
    type: 'numeric',
    label: 'VAT Amount',
    toolTip: 'Total VAT Amount',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'vatableTot',
    type: 'numeric',
    label: 'Vatable Total',
    toolTip: 'Vatable Total',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'RoundTot',
    type: 'numeric',
    label: 'Round Total',
    toolTip: 'Rounded Total',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'netTot',
    type: 'numeric',
    label: 'Net Total',
    toolTip: 'Net Total',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },

  {
    data: 'itemId',
    type: 'numeric',
    label: 'Item ID',
    toolTip: 'Item ID',
    width: 100,
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
    width: 100,
  },
  {
    data: 'itemname',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
    width: 200,
  },
  {
    data: 'unit',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit of Measure',
    width: 100,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Quantity',
    toolTip: 'Item Quantity',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Item Rate',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'disc',
    type: 'numeric',
    label: 'Discount',
    toolTip: 'Item Discount',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
  {
    data: 'netAmt',
    type: 'numeric',
    label: 'Net Amount',
    toolTip: 'Net Amount',
    width: 100,
    numericFormat: { pattern: '0,0.00' },
  },
];
