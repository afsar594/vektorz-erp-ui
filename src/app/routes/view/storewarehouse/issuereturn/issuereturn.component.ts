import {
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
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
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { DepartmentMaster } from 'src/app/routes/domain/Masters/DepartmentMaster';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { timer, Observable } from 'rxjs';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { IssueReturn } from 'src/app/routes/domain/Sales/IssueReturn';
import { IssueReturnDetails } from 'src/app/routes/domain/Sales/IssueReturnDetails';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-issuereturn',
  templateUrl: './issuereturn.component.html',
  styleUrls: ['./issuereturn.component.scss'],
})
export class IssuereturnComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('costcCtrl', { static: false }) costcenterCtrol: ElementRef;
  @ViewChild('depaCtrl', { static: false }) departmentCtrol: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;

  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  jobID: number;

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

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;

  ItemMasterArrayByName: any = null;
  funitid: number;

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
  locationLocked = false;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  departmentArray: DepartmentMaster[] = [];
  departmentList: SelectItem[] = [];
  departmentArry: string[] = [];

  issueVoucherList: any[] = [];
  accountTransactionList: AccountsTransactions[] = [];
  issueReturnarry: IssueReturn[] = [];
  // savedIssueReturnGridData: GridData[] = [];
  savedIssueReturn: IssueReturn;
  JOBCOST: Boolean = false;
  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  ScreenId: number;
  Permission: any;
  user: any;

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
    private salesapi: SalesApiService,
    private permission: PermissionsService,
    private utilityService: UtilityService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'issuereturn_HotEntry';
  issuereturn_entry: Handsontable.GridSettings;
  issueReturnFormGroup: FormGroup;
  issuereturn_entryDataset = [];
  // accountTransactionDataset = [];
  cols;
  ngAfterViewInit() {}
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
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
      { field: 'issueReturnNo', header: 'Voucher No' },
      { field: 'issueReturnDate', header: 'Date' },
      { field: 'issueReturnDepartmentId', header: 'Party' },
      { field: 'issueReturnCurrencyId', header: 'Currency' },
      { field: 'issueReturnDescription', header: 'Narration' },
      { field: 'issueReturnTotalGrossAmount', header: 'Gross.Amt' },
      { field: 'issueReturnTotalDisAmount', header: 'Disc.Amt' },
      { field: 'issueReturnVatAmt', header: 'Vat.Amt' },
      { field: 'issueReturnVatRoundSign', header: 'Round.Sign' },
      { field: 'issueReturnVatRountAmt', header: 'Round.Amt' },
      { field: 'issueReturnNetAmount', header: 'Net.Amt' },
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
    this.issueReturnFormGroup = this.fb.group({
      issueReturnId: [0],
      issueReturnNo: [{ value: '', disabled: true }],
      issueReturnDate: [{ value: null, disabled: true }, [Validators.required]],
      issueReturnRefNo: [{ value: '', disabled: true }, [Validators.required]],
      issueReturnIvNoForRet: [{ value: '', disabled: true }],
      issueReturnCurrencyId: [-1, [DropDownValidator]],
      issueReturnIvDateForRet: [{ value: false, disabled: true }],
      issueReturnCreditAccNo: [-1, [DropDownValidator]],
      issueReturnDepartmentId: [-1],
      issueReturnBufferRemark1: [{ value: '', disabled: true }],
      issueReturnCostCenterId: [{ value: -1, disabled: true }],
      issueReturnDebitAccNo: [-1, [DropDownValidator]],
      issueReturnDescription: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      issueReturnGrno: [{ value: null, disabled: true }],
      issueReturnGrdate: [{ value: null, disabled: true }],
      issueReturnLpono: [{ value: null, disabled: true }],
      issueReturnLpodate: [{ value: null, disabled: true }],
      issueReturnQtnNo: [{ value: null, disabled: true }],
      issueReturnQtnDate: [{ value: null, disabled: true }],
      issueReturnReqNo: [{ value: null, disabled: true }],
      issueReturnReqDate: [
        { valissueReturnCreditAccNoue: null, disabled: true },
      ],
      issueReturnDayBookNo: [{ value: null, disabled: true }],
      issueReturnJobId: [-1],
      issueReturnLocationId: [-1, [DropDownValidator]],
      issueReturnTotalGrossAmount: [{ value: [0], disabled: true }],
      issueReturnTotalItemDisAmount: [{ value: [0], disabled: true }],
      issueReturnTotalDisPer: [{ value: [0], disabled: true }],
      issueReturnTotalDisAmount: [{ value: [0], disabled: true }],
      issueReturnVatPer: [{ value: [5], disabled: true }],
      issueReturnVatAmt: [{ value: [0], disabled: true }],
      issueReturnTotalActualAmount: [{ value: [0], disabled: true }],
      issueReturnVatRoundSign: [{ value: '-', disabled: true }],
      issueReturnVatRountAmt: [{ value: [0], disabled: true }],
      issueReturnNetAmount: [{ value: [0], disabled: true }],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.bykeys();
    this.getAllLocation();
  }

  get f() {
    return this.issueReturnFormGroup.controls;
  }

  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      const list = k ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = list.map((ar) => ar.locationMasterLocationName?.trim());
      this.locationLocked = this.utilityService.applyLocationLock(
        this.issueReturnFormGroup,
        'issueReturnLocationId'
      );
    });
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
    const hiddenColumns = [0, 1, 6, 7, 8, 9, 10, 15];
    // if (this.JOBCOST) {
    //   hiddenColumns.push(3);
    // }
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
    this.salesapi.GetIssueVoucherDropdown().subscribe((m) => {
      //job
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = m.resultSet.jobMasters; //?.map(ar => ar.jobMasterJobName?.trim());
      //cost center
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterList.unshift({
        label: '--Select CostCenter--',
        value: -1,
      });
      this.costcenterArry = m.resultSet.costcenterMasters?.map((ar) =>
        ar.costCenterMasterCostCenterName?.trim()
      );
      //department
      this.departmentArray = m.resultSet.departmentsList;
      this.departmentList = m.resultSet.departmentsList?.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentId,
      }));
      this.departmentList.unshift({
        label: '--Select Department--',
        value: -1,
      });
      this.departmentArry = m.resultSet.departmentsList?.map((ar) =>
        ar.departmentMasterDepartmentName?.trim()
      );
      //unit
      this.unitArray = m.resultSet.unitMasters;
      this.unitList = m.resultSet.unitMasters?.map((kl) => ({
        label: kl.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitList.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = m.resultSet.unitMasters?.map((ar) =>
        ar.unitMasterUnitShortName?.trim()
      );
      //item
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = m.resultSet.itemMaster?.map((ar) =>
        ar.itemMasterItemName?.trim()
      );
      //currency
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = m.resultSet.currencyMasters?.map((ar) =>
        ar.currencyMasterCurrencyName?.trim()
      );
      //master Account
      this.accountArray = m.resultSet.masterAccountsTables;

      this.accountList = m.resultSet.masterAccountsTables.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
      this.acctArry = m.resultSet.masterAccountsTables.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
      //issue voucher
      this.issueVoucherList = m.resultSet.issueVoucher;
    });

    const hiddenColumns = [0, 1, 6, 7, 8, 9, 10, 13, 14, 15];
    this.issuereturn_entry = this.utilityService.getTableConfig(
      issueReturnColumnObjList(this),
      hiddenColumns
    );

    this.issuereturn_entry.afterSelection = (
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

      if (column === 2 && this.issuereturn_entry.readOnly === false) {
        this.lookupGridColumns = ['Item', 'Item ID'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.issuereturn_entry.readOnly === false) {
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      }
      if (column === 13 && this.issuereturn_entry.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
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
        this.selectItem = this.dataList?.find((k) => k.storeandwarehouses == x);
      } else {
        this.selectItem = {};
      }
    };
    this.issuereturn_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showSalesLookUp = false;
      if (change[0][1] === 0) {
        this.showSalesLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };
    this.issuereturn_entry.beforeChangeRender = (change, source) => {
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
    this.issuereturn_entry.afterChange = (r, c) => {};
    this.issuereturn_entry.afterRemoveRow = (index: number, amount: number) => {
      this.ColumnSum();
      this.GetTotal();
    };
    this.issuereturn_entry.afterValidate = (isValid, value, row, prop) => {
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
    // const sum1 = this.issuereturn_entry.data?.filter(item => item.hasOwnProperty('disc'))
    //   .reduce((sum, current: any) => sum + current.disc, [0]);
    // this.issueReturnFormGroup.controls.issueReturnTotalItemDisAmount.setValue(sum1);

    // // this.issuereturn_entry.data[0].netAmt = 45;
    // const sum2 = this.issuereturn_entry.data?.filter(item => item.hasOwnProperty('netAmt'))

    //   .reduce((sum, current: any) => sum + current.netAmt, [0]);
    // this.issueReturnFormGroup.controls.issueReturnTotalGrossAmount.setValue(sum2);
    var disc = 0;
    this.issuereturn_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.disc) {
        disc += elemt.disc;
      }
    });
    disc = parseFloat(disc.toFixed(2));
    this.issueReturnFormGroup.controls.issueReturnTotalItemDisAmount.setValue(
      disc
    );

    var value = 0;
    this.issuereturn_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.netAmt) {
        value += elemt.netAmt;
      }
    });
    value = parseFloat(value.toFixed(2));
    this.issueReturnFormGroup.controls.issueReturnTotalGrossAmount.setValue(
      value
    );
    this.GetTotal();
  }

  CalcDiscFromPer() {
    this.issueReturnFormGroup.controls.issueReturnTotalDisAmount.setValue(
      (Number(this.issueReturnFormGroup.value.issueReturnTotalGrossAmount) *
        Number(this.issueReturnFormGroup.value.issueReturnTotalDisPer)) /
        100
    );
    this.GetTotal();
  }
  CalcDiscFromAmt() {
    this.issueReturnFormGroup.controls.issueReturnTotalDisPer.setValue(
      (Number(this.issueReturnFormGroup.value.issueReturnTotalDisAmount) *
        100) /
        Number(this.issueReturnFormGroup.value.issueReturnTotalGrossAmount)
    );
    this.GetTotal();
  }
  GetTotal($event = null) {
    if (this.issueReturnFormGroup.value.issueReturnIvDateForRet == true) {
      this.issueReturnFormGroup.value.issueReturnVatPer = 0;
    } else {
      this.issueReturnFormGroup.value.issueReturnVatPer = 5;
    }

    this.issueReturnFormGroup.controls.issueReturnTotalActualAmount.setValue(
      Number(this.issueReturnFormGroup.value.issueReturnTotalGrossAmount) -
        Number(this.issueReturnFormGroup.value.issueReturnTotalDisAmount)
    );
    this.issueReturnFormGroup.controls.issueReturnVatAmt.setValue(
      (Number(this.issueReturnFormGroup.value.issueReturnTotalActualAmount) *
        Number(this.issueReturnFormGroup.value.issueReturnVatPer)) /
        100
    );

    if (this.issueReturnFormGroup.value.issueReturnVatRoundSign == '+') {
      this.issueReturnFormGroup.controls.issueReturnNetAmount.setValue(
        Number(this.issueReturnFormGroup.value.issueReturnTotalActualAmount) +
          Number(this.issueReturnFormGroup.value.issueReturnVatAmt) +
          Number(this.issueReturnFormGroup.value.issueReturnVatRountAmt)
      );
    } else if (this.issueReturnFormGroup.value.issueReturnVatRoundSign == '-') {
      this.issueReturnFormGroup.controls.issueReturnNetAmount.setValue(
        Number(this.issueReturnFormGroup.value.issueReturnTotalActualAmount) +
          Number(this.issueReturnFormGroup.value.issueReturnVatAmt) -
          Number(this.issueReturnFormGroup.value.issueReturnVatRountAmt)
      );
    } else {
      this.issueReturnFormGroup.value.issueReturnVatRoundSign = '-';
    }
  }

  get jobSetLookup() {
    return this.jobList.map((kl) => ({
      job: kl.label,
      jobId: kl.value,
    }));
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      storeandwarehouses: kl.itemMasterItemName,
      storeandwarehousesId: kl.itemMasterItemId,
    }));
  }
  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      storeandwarehouses: kl.unitMasterUnitShortName,
      storeandwarehousesId: kl.unitMasterUnitId,
    }));
  }
  saveIssueReturn() {
    const savedData: any = this.issuereturn_entry.data?.filter((k) =>
      k.hasOwnProperty('itemname')
    );
    const issueReturn_Save: IssueReturn = this.issueReturnFormGroup
      .value as IssueReturn;

    issueReturn_Save.issueReturnId = Number(
      this.issueReturnFormGroup.value.issueReturnId
    );

    issueReturn_Save.issueReturnNo =
      this.issueReturnFormGroup.getRawValue().issueReturnNo;
    issueReturn_Save.issueReturnDate =
      this.issueReturnFormGroup.value.issueReturnDate;
    issueReturn_Save.issueReturnRefNo =
      this.issueReturnFormGroup.value.issueReturnRefNo;
    issueReturn_Save.issueReturnIvNoForRet =
      this.issueReturnFormGroup.value.issueReturnIvNoForRet;
    issueReturn_Save.issueReturnCurrencyId =
      this.issueReturnFormGroup.value.issueReturnCurrencyId;
    issueReturn_Save.issueReturnIvDateForRet =
      this.issueReturnFormGroup.value.issueReturnIvDateForRet;
    //issueReturn_Save.issueReturnIvDateForRet = true;

    // issueReturn_Save.issueReturnCreditAccNo = this.issueReturnFormGroup.value.issueReturnCreditAccNo.name;
    issueReturn_Save.issueReturnCreditAccNo =
      this.issueReturnFormGroup.value.issueReturnCreditAccNo;

    issueReturn_Save.issueReturnDepartmentId =
      this.issueReturnFormGroup.value.issueReturnDepartmentId;
    //  issueReturn_Save.issueReturnBufferRemark1 = this.issueReturnFormGroup.value.issueReturnBufferRemark1;
    issueReturn_Save.issueReturnBufferRemark1 = 'PARTY NAME';
    issueReturn_Save.issueReturnCostCenterId =
      this.issueReturnFormGroup.value.issueReturnCostCenterId;
    issueReturn_Save.issueReturnDebitAccNo =
      this.issueReturnFormGroup.value.issueReturnDebitAccNo;
    issueReturn_Save.issueReturnDescription =
      this.issueReturnFormGroup.value.issueReturnDescription;

    issueReturn_Save.issueReturnGrno =
      this.issueReturnFormGroup.value.issueReturnGrno;
    issueReturn_Save.issueReturnGrdate =
      this.issueReturnFormGroup.value.issueReturnGrdate;
    issueReturn_Save.issueReturnLpono =
      this.issueReturnFormGroup.value.issueReturnLpono;
    issueReturn_Save.issueReturnLpodate =
      this.issueReturnFormGroup.value.issueReturnLpodate;
    issueReturn_Save.issueReturnQtnNo =
      this.issueReturnFormGroup.value.issueReturnQtnNo;
    issueReturn_Save.issueReturnQtnDate =
      this.issueReturnFormGroup.value.issueReturnQtnDate;

    issueReturn_Save.issueReturnReqNo =
      this.issueReturnFormGroup.value.issueReturnReqNo;
    issueReturn_Save.issueReturnReqDate =
      this.issueReturnFormGroup.value.issueReturnReqDate;
    issueReturn_Save.issueReturnDayBookNo =
      this.issueReturnFormGroup.value.issueReturnDayBookNo;
    issueReturn_Save.issueReturnLocationId =
      this.issueReturnFormGroup.get('issueReturnLocationId')?.value;
    issueReturn_Save.issueReturnJobId =
      this.issueReturnFormGroup.value.issueReturnJobId;

    issueReturn_Save.issueReturnTotalGrossAmount = Number(
      this.issueReturnFormGroup.value.issueReturnTotalGrossAmount
    );
    issueReturn_Save.issueReturnTotalItemDisAmount = Number(
      this.issueReturnFormGroup.value.issueReturnTotalItemDisAmount
    );
    issueReturn_Save.issueReturnTotalDisPer = Number(
      this.issueReturnFormGroup.value.issueReturnTotalDisPer
    );
    issueReturn_Save.issueReturnTotalDisAmount = Number(
      this.issueReturnFormGroup.value.issueReturnTotalDisAmount
    );
    issueReturn_Save.issueReturnVatPer = Number(
      this.issueReturnFormGroup.value.issueReturnVatPer
    );
    issueReturn_Save.issueReturnVatAmt = Number(
      this.issueReturnFormGroup.value.issueReturnVatAmt
    );
    issueReturn_Save.issueReturnTotalActualAmount = Number(
      this.issueReturnFormGroup.value.issueReturnTotalActualAmount
    );
    // issueReturn_Save.issueReturnVatRoundSign = this.issueReturnFormGroup.value.issueReturnVatRoundSign.name;
    issueReturn_Save.issueReturnVatRoundSign =
      this.issueReturnFormGroup.value.issueReturnVatRoundSign;
    issueReturn_Save.issueReturnVatRountAmt = Number(
      this.issueReturnFormGroup.value.issueReturnVatRountAmt
    );
    issueReturn_Save.issueReturnNetAmount = Number(
      this.issueReturnFormGroup.value.issueReturnNetAmount
    );

    issueReturn_Save.accountsTransactions = [];
    issueReturn_Save.issueReturnDetails = savedData
      ?.filter((k) => k.itemname != null && k.netAmt != null)
      //.map((k: GridData) => {
      .map((k: any) => {
        return {
          issueReturnDetailsId: k.id != null ? k.id : 0,
          issueReturnDetailsNo:
            this.issueReturnFormGroup.getRawValue().issueReturnNo,

          issueReturnId: 0,
          issueReturnDetailsMatId:
            k.itemname != null && k.itemname !== ''
              ? this.ItemMasterArray?.find(
                  (j) => j.itemMasterItemName?.trim() === k.itemname?.trim()
                ).itemMasterItemId
              : null,
          issueReturnDetailsQuantity: k.qty,
          issueReturnDetailsDiscAmount: k.disc,
          issueReturnDetailsRate: k.rate,
          issueReturnDetailsNetAmt: k.netAmt,
          issueReturnDetailsGrossAmount: 0,
          // issueReturnDetailsJobNo: k.jobname != null && k.jobname !== '' ? this.jobArray
          // ?.find(j => j.jobMasterJobName?.trim()  === k.jobname?.trim()).jobMasterId : null,
          // issueReturnDetailsCostCenterId: k.costcenter != null && k.costcenter !== '' ? this.costcenterArray
          // ?.find(j => j.costCenterMasterCostCenterName?.trim()  === k.costcenter?.trim()).costCenterMasterCostCenterId : null,
          issueReturnDetailsRemarks: k.narration,
          issueReturnDetailsSno: 0,
          issueReturnDetailsJobID:
            k.job != null && k.job !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.job?.trim())
                  ?.value
              : null,

          issueReturnDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.unitArray?.find(
                  (j) => j.unitMasterUnitShortName?.trim() === k.unit?.trim()
                )?.unitMasterUnitId
              : null,
          issueReturnDetailsDelStatus: false,
        };
      });

    if (this.btnFlag.save) {
      this.saveVoucher(issueReturn_Save);
    } else {
      issueReturn_Save.accountsTransactions
        ?.filter((x) => x.accountsTransactionsTransSno != 0)
        .forEach((element, index, arry) => {
          arry[index].accountstransactionsDelStatus = true;
        });

      this.updateVoucher(issueReturn_Save);
    }
  }
  validateTotalDrCrAmounts(): boolean {
    if (
      this.issueReturnFormGroup.getRawValue().issueReturnTotalGrossAmount ==
        0 &&
      this.issueReturnFormGroup.getRawValue().issueReturnTotalItemDisAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Gross Amount Is Zero',
      });
      return false;
    }

    //  if(this.issueReturnFormGroup.getRawValue().issueReturnTotalGrossAmount==0){
    //   this.messageService.add({severity: 'error', summary: 'Alert', detail: 'issueVoucherTotalGrossAmount'});
    //   return false;
    // }

    return true;
  }
  saveVoucher(issueReturn_Save: IssueReturn) {
    if (this.issueReturnFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.salesapi.InsertIssueReturn(issueReturn_Save).subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.savedIssueReturn = data.result;
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
      this.issueReturnFormGroup.markAllAsTouched();
      this.issueReturnFormGroup.markAsDirty();
    }
  }
  updateVoucher(issueReturn_Save: IssueReturn) {
    if (this.issueReturnFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.salesapi.UpdateIssueReturn(issueReturn_Save).subscribe(
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
                  detail: 'Issue Return Updated Succesfully',
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Issue Return Update Failed',
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
      this.issueReturnFormGroup.markAllAsTouched();
      this.issueReturnFormGroup.markAsDirty();
    }
  }
  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }
  getAllIssueReturn() {
    this.salesapi.GetIssueReturn().subscribe((data) => {
      this.issueReturnarry = data.result;
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
  public getUnitName(unit: number): string {
    return this.unitArray?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }
  new() {
    this.issueReturnFormGroup.reset();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.issueReturnFormGroup,
        'issueReturnLocationId'
      );
    }
    this.issuereturn_entry.data = [];
    this.issuereturn_entry.readOnly = false;
    this.issueReturnFormGroup.controls.issueReturnVatRoundSign.setValue('-');
    // this.hotRegisterer.getInstance(this.hotid).updateS/ettings(this.issuereturn_entry);
    this.accountTransactionList = [];
    this.issueReturnFormGroup.get('issueReturnDate').setValue(new Date());
    this.issueReturnFormGroup.get('issueReturnId').setValue(null);
    this.issueReturnFormGroup.get('issueReturnDepartmentId').setValue(-1);
    this.issueReturnFormGroup.get('issueReturnJobId').setValue(-1);
    this.issueReturnFormGroup.get('issueReturnCurrencyId').setValue(-1);
    if (!this.locationLocked) {
      this.issueReturnFormGroup.get('issueReturnLocationId').setValue(-1);
    }
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.index = 0;
    this.issueReturnFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.issueReturnFormGroup,
      'issueReturnLocationId',
      this.locationLocked
    );
    this.f.issueReturnNo.clearValidators();
    this.issueReturnFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
    this.GetDefaultSettings();
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
          this.f.issueReturnCurrencyId.setValue(Number(this.DefCurrency));
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
            this.f.issueReturnLocationId.setValue(Number(this.DefLocid));
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
    });
  }
  showMaximizableDialog() {
    this.getAllIssueReturn();
    this.displayMaximizable = true;
  }
  updateFormGrid(issuereturn_update: IssueReturn) {
    this.issueReturnFormGroup.patchValue({
      issueReturnId: issuereturn_update.issueReturnId,
      issueReturnNo: issuereturn_update.issueReturnNo,
      issueReturnDate: new Date(issuereturn_update.issueReturnDate),
      issueReturnRefNo: issuereturn_update.issueReturnRefNo,
      issueReturnIvNoForRet: issuereturn_update.issueReturnIvNoForRet,
      issueReturnCurrencyId: issuereturn_update.issueReturnCurrencyId,
      issueReturnIvDateForRet:
        issuereturn_update.issueReturnIvDateForRet != null
          ? new Date(issuereturn_update.issueReturnIvDateForRet)
          : null,

      issueReturnCreditAccNo: issuereturn_update.issueReturnCreditAccNo,
      issueReturnDepartmentId: issuereturn_update.issueReturnDepartmentId,
      issueReturnBufferRemark1: issuereturn_update.issueReturnBufferRemark1,
      issueReturnCostCenterId: issuereturn_update.issueReturnCostCenterId,
      issueReturnDebitAccNo: issuereturn_update.issueReturnDebitAccNo,
      issueReturnDescription: issuereturn_update.issueReturnDescription,

      issueReturnGrno: issuereturn_update.issueReturnGrno,
      issueReturnGrdate:
        issuereturn_update.issueReturnGrdate != null
          ? new Date(issuereturn_update.issueReturnGrdate)
          : null,
      issueReturnLpono: issuereturn_update.issueReturnLpono,
      issueReturnLpodate:
        issuereturn_update.issueReturnLpodate != null
          ? new Date(issuereturn_update.issueReturnLpodate)
          : null,
      issueReturnQtnNo: issuereturn_update.issueReturnQtnNo,
      issueReturnQtnDate:
        issuereturn_update.issueReturnQtnDate != null
          ? new Date(issuereturn_update.issueReturnQtnDate)
          : null,

      issueReturnReqNo: issuereturn_update.issueReturnReqNo,
      issueReturnReqDate:
        issuereturn_update.issueReturnReqDate != null
          ? new Date(issuereturn_update.issueReturnReqDate)
          : null,
      issueReturnDayBookNo: issuereturn_update.issueReturnDayBookNo,
      issueReturnLocationId: issuereturn_update.issueReturnLocationId,
      issueReturnJobId: issuereturn_update.issueReturnJobId,

      issueReturnTotalGrossAmount:
        issuereturn_update.issueReturnTotalGrossAmount,
      issueReturnTotalItemDisAmount:
        issuereturn_update.issueReturnTotalItemDisAmount,
      issueReturnTotalDisPer: issuereturn_update.issueReturnTotalDisPer,
      issueReturnTotalDisAmount: issuereturn_update.issueReturnTotalDisAmount,
      issueReturnVatPer: issuereturn_update.issueReturnVatPer,
      issueReturnVatAmt: issuereturn_update.issueReturnVatAmt,
      issueReturnTotalActualAmount:
        issuereturn_update.issueReturnTotalActualAmount,
      issueReturnVatRoundSign: issuereturn_update.issueReturnVatRoundSign,
      issueReturnVatRountAmt: issuereturn_update.issueReturnVatRountAmt,
      issueReturnNetAmount: issuereturn_update.issueReturnNetAmount,
    });
    // this.currencyCtrol.nativeElement.value = this.currencyList?.find(k => k.value === issuereturn_update.issueReturnCurrencyId).label;
    // this.costcenterCtrol.nativeElement.value = this.costcenterList?.find(k => k.value === issuereturn_update.issueReturnCostCenterId).label;
    // this.departmentCtrol.nativeElement.value = this.departmentList?.find(k => k.value === issuereturn_update.issueReturnDepartmentId).label;
    // this.jobCtrol.nativeElement.value = this.jobList?.find(k => k.value === issuereturn_update.issueReturnJobId).label;
    // this.locationCtrol.nativeElement.value = this.locationList?.find(k => k.value === issuereturn_update.issueReturnLocationId).label;

    this.accountTransactionList = issuereturn_update.accountsTransactions;
    // this.jobArray?.find(j => j.jobMasterJobName?.trim()  === k.jobname?.trim()).jobMasterId,
    const gridData: GridData[] = issuereturn_update.issueReturnDetails.map(
      (k) => {
        // const ItemId: string = k.issueReturnDetailsMatId != null ? this.ItemMasterArry?.find(l => l.match(k.issueReturnDetailsMatId.toString())) : null;
        // const  UnitId: string = k.issueReturnDetailsUnitId != null ? this.unitArry?.find(l => l.match(k.issueReturnDetailsUnitId.toString())) : null;

        const ItemId: string =
          k.issueReturnDetailsMatId != null
            ? this.ItemMasterList?.find(
                (l) => l.value == k.issueReturnDetailsMatId
              )?.label
            : null;
        const UnitId: string =
          k.issueReturnDetailsUnitId != null
            ? this.unitList?.find((l) => l.value == k.issueReturnDetailsUnitId)
                ?.label
            : null;

        // let  jobId: string = (k.issueReturnDetailsJobNo != null ) ? this.jobArry?.find(l =>
        //                      l.match(k.issueReturnDetailsJobNo.toString())) : null;
        // let  costCenterId: string = (k.issueReturnDetailsCostCenterId != null ) ? this.costcenterArry?.find(l =>
        //                       l.match(k.issueReturnDetailsCostCenterId.toString())) : null;

        return {
          itemname: ItemId,
          unit: UnitId,
          qty: k.issueReturnDetailsQuantity,
          rate: k.issueReturnDetailsRate,
          disc: k.issueReturnDetailsDiscAmount,
          netAmt: k.issueReturnDetailsNetAmt,

          // jobname: jobId,
          // costcenter: costCenterId,

          jobname: null,
          costcenter: null,

          narration: k.issueReturnDetailsRemarks,
          job:
            k.issueReturnDetailsJobID != null
              ? this.jobList?.find((l) => l.value == k?.issueReturnDetailsJobID)
                  ?.label
              : null,
          id: k.issueReturnDetailsId,
        };
      }
    );

    this.issuereturn_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.issueReturnFormGroup.disable();
    this.f.issueReturnNo.clearValidators();
    this.issueReturnFormGroup.updateValueAndValidity();
  }
  handleChange(e) {
    this.index = e.index;
  }
  GetSavedIssueReturnDetails(id: string) {
    this.index = 0;

    this.salesapi.GetSavedIssueReturnDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
            new: true,
          };
          this.accountTransactionList = data.result.accountsTransactions;
          this.updateFormGrid(data.result);
          this.savedIssueReturn = data.result;
          this.issueReturnFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Issue Return not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.issueReturnFormGroup.updateValueAndValidity();
      }
    );
  }
  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.userTrackingLog('Delete');
        this.salesapi.DeleteIssueReturn(this.savedIssueReturn).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Issue Return Deleted Succesfully',
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
    this.GetSavedIssueReturnDetails(
      this.issueReturnFormGroup.getRawValue().issueReturnNo
    );
  }
  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.issueReturnNo.clearValidators();
    this.issueReturnFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.issueReturnFormGroup,
      'issueReturnLocationId',
      this.locationLocked
    );
    this.issueReturnFormGroup.controls.issueReturnNo.disable();
    this.issueReturnFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: true,
      delete: false,
      new: false,
    };
    this.updateTableConfiguration();
  }
  public get IsValidGrid(): boolean {
    if (this.issuereturn_entry.data.length > 0) {
      // this.issuereturn_entry.data.forEach((value: GridData, index, arry) => {
      return Object.values(this.issuereturn_entry.data).some(
        (k: GridData) =>
          k.itemname != null && k.netAmt != null && !(k.rate == null)
      );
      // });
    }
    return false;
  }
  selectsales(evt) {
    if (evt.job) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 13, evt.job);
    }

    if (this.unitArray.length > 0) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, evt.storeandwarehouses);
    }
    if (this.unitArray.length === 0) {
      this.masterapi
        .GetUnitDetails(evt.storeandwarehousesId)
        .subscribe((res) => {
          this.unitArray = res.result;
          this.unitArry = res.result.map((ar) =>
            ar.unitMasterUnitShortName?.trim()
          );
        });
    }
    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(
        this.activeRow.row,
        this.activeRow.column,
        evt.storeandwarehouses
      );
    if (this.unitArray.length === 0) {
      this.masterapi
        .GetItemMasterById({ id: evt.storeandwarehousesId })
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
    this.showSalesLookUp = false;
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
    this.control.setValue(evt.storeandwarehousesId);
    this.elementReference.nativeElement.value = evt.storeandwarehouses;
    this.formControlLookUp = false;
  }
  hide(evt: boolean) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }
  userTrackingLog(type) {
    let req = {
      page: 'IssueReturn',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.issueReturnFormGroup.get('issueReturnNo').value,
      vpType: 'IssueReturn',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
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
  new?: boolean;
}
export const issueReturnColumnObjList = (component: IssuereturnComponent) => [
  {
    data: 'itemId',
    type: 'text',
    label: 'Item Id',
    toolTip: 'Item ID',
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
    source: component.ItemMasterArry,
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    toolTip: 'Unit of Measurement',
    source: component.unitArry,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Unit Rate',
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
    toolTip: 'Discount Amount',
  },
  {
    data: 'grossAmt',
    type: 'numeric',
    label: 'Gross Amt',
    toolTip: 'Gross Amount',
  },
  {
    data: 'vatPer',
    type: 'numeric',
    label: 'VAT%',
    toolTip: 'VAT Percentage',
  },
  {
    data: 'vatAmt',
    type: 'numeric',
    label: 'VAT.Amt',
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
    toolTip: 'Remarks',
  },
  {
    data: 'jobname',
    type: 'dropdown',
    label: 'Job Name',
    toolTip: 'Job Name',
    source: component.jobArry,
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
    toolTip: 'Record ID',
  },
];
