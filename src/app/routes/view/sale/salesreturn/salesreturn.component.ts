import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  NgZone,
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
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';

import { DepartmentMaster } from 'src/app/routes/domain/Masters/DepartmentMaster';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';

import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map } from 'rxjs/operators';
import { timer } from 'rxjs';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { SalesReturn } from 'src/app/routes/domain/Sales/SalesReturn';
import { SalesReturnDetails } from 'src/app/routes/domain/Sales/SalesReturnDetails';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { SalesVoucher } from 'src/app/routes/domain/Sales/SalesVoucher';
import { LoginService } from 'src/app/routes/service/login.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { AnyARecord } from 'dns';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';

@Component({
  selector: 'app-salesreturn',
  templateUrl: './salesreturn.component.html',
  styleUrls: ['./salesreturn.component.scss'],
})
export class SalesreturnComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('saleCtrl', { static: false }) salesmanCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('custCtrl', { static: false }) customerCtrol: ElementRef;
  @ViewChild('depaCtrl', { static: false }) departmentCtrol: ElementRef;
  @ViewChild('joCtrl', { static: false }) jobCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;
  SalesreturnFormGroup: FormGroup;
  SalesreturnFilterForm: FormGroup;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[] = [];
  licensekey: string;
  value: string | undefined;

  lookupGridColumns = ([] = []);
  dataList: Array<any> = ([] = []);
  showSalesLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;
  isCallDDLs: boolean = false;
  btnFlag: ButtonFlag;
  currencyList: SelectItem[] = [];
  currArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[] = [];

  ItemMasterArrayByName: any = null;
  funitid: number;

  unitArray: any;
  unitArry: string[] = [];
  unitList: SelectItem[] = [];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[] = [];

  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[] = [];

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;

  DepartmentMasterArray: DepartmentMaster[] = [];
  DepartmentMasterArry: string[] = [];
  DepartmentMasterList: SelectItem[] = [];

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[] = [];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[] = [];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  salesReturnarry: SalesReturn[] = [];
  savedSalesReturn: SalesReturn;

  ScreenId: number;
  v_typeList: SelectItem[] = [];
  v_RoundoffList: SelectItem[] = [];
  SalesVoucherDetailsByMasterNoArray: any[] = [];
  displayPrintPreview: boolean = false;
  salesVoucherarry: SalesVoucher[] = [];
  usrid: number;
  fsno: number;
  DefCostCenterCheck: String;
  DefCostCenterId: string;

  saleReturnAccount: string;
  vatPayableAccount: string;
  stockLedgerAccount: string;
  goodsSoldAccount: string;
  RoundOffAccount: string;
  DiscountPaidAccount: string;
  Permission: any;
  filterArray: any;
  voucherId: any;
  user: any;
  cashAccount: any;
  defaultLocationID = -1;
  globalSalesVoucherSearch = '';
  globalSalesReturnSearch = '';
  salesVoucherfilter = '';
    rptFilter!: ReportFilterModel;

  salesReturnfilter = '';
  salesVoucherToDate = null;
  salesVoucherFromDate = null;

  FILL_COMBO() {
    this.v_typeList = [
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
    ];
    this.v_RoundoffList = [
      { label: '+', value: '+' },
      { label: '-', value: '-' },
    ];
  }

  displaySalesVoucher: boolean = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private loginser: LoginService,
    private translate: TranslateService,
    private crystalReportService: CrystalReportService,
    private router: Router,
    private masterapi: MasterApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    public salesapi: SalesApiService,
    private storage: LocalStorageService,
    private ngZone: NgZone
  ) {
    this.licensekey = defaults.hotlicensekey;
    const location = JSON.parse(this.storage.get('selectedItemLocation'));
    this.defaultLocationID = Number(location.locationMasterLocationId);
  }

  private hotRegisterer = new HotTableRegisterer();
  hotid = 'salesreturn_HotEntry';
  hotidSV = 'salesVoucherHot';
  hotidSR = 'salesReturnHot';
  salesreturn_entry: Handsontable.GridSettings;
  SalesVoucherConfig: Handsontable.GridSettings;
  SalesReturnConfig: Handsontable.GridSettings;
  salesReturnFormGroup: FormGroup;
  salesreturn_entryDataset = [];
  locationLocked = false;
  cols;

  currentPage = this.utilityService.defaultPagination.currentPage;
  pageSize = this.utilityService.defaultPagination.pageSize;
  pageOption = this.utilityService.defaultPagination.pageOption;
  totalRecords: number = 0;
  totalPages = 0;
  pageDataSet = [];
  sortSalesVocuherColumn = '';
  sortSalesReturnColumn = '';
  sortOrder: { [key: string]: 'asc' | 'desc' } = {};
  state: any;

  ngAfterViewInit() { }

  getPartyName(partyId: number) {
    return this.CustomerMasterList?.find((o) => o.value == partyId)?.label;
  }
  getPartyAddress(partyId: number) {
    return this.CustomerMasterArray?.find(
      (s) => s.customerMasterCustomerNo == partyId
    ).customerMasterCustomerAddress;
  }
  getCurrency(Id: number) {
    return this.currencyList?.find((o) => o.value == Id)?.label;
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.stationmasterObj = this.permission.getStation();
      console.log('stationmasterObj', this.stationmasterObj);
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();
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
      if (this.voucherId) {
        this.GetSavedSalesReturnDetails(this.voucherId);
      }
    });

    this.salesapi.GetSalesVoucher();
    this.FILL_COMBO();

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
    this.initializeControls();
    this.initializeSalesVoucherControls();
    this.initializeSalesReturnControls();
    this.salesReturnFormGroup = this.fb.group({
      salesReturnId: [0],
      salesReturnNo: [{ value: '', disabled: true }, [Validators.required]],
      salesReturnDate: [{ value: null, disabled: true }, [Validators.required]],
      salesReturnRefNo: [{ value: '', disabled: true }],
      salesReturnContPerson: [{ value: '', disabled: true }],
      salesReturnCurrencyId: [-1],
      salesReturnExcludeVat: [{ value: false, disabled: true }],
      salesReturnPartyId: [-1],
      salesReturnPartyName: [{ value: '', disabled: true }],
      salesReturnPartyAddress: [{ value: '', disabled: true }],
      salesReturnPartyTelNo: [{ value: '', disabled: true }],
      salesReturnPartyVatNo: [{ value: '', disabled: true }],
      salesReturnGRno: [{ value: '', disabled: true }],
      salesReturnPartyNo: [{ value: '', disabled: true }],
      salesReturnDescription: [{ value: '', disabled: true }],

      salesReturnSvno: [{ value: null, disabled: true }],
      salesReturnSvdate: [{ value: null, disabled: true }],

      salesReturnDlvNo: [{ value: null, disabled: true }],
      salesReturnDlvDate: [{ value: null, disabled: true }],
      salesReturnSono: [{ value: null, disabled: true }],
      salesReturnSodate: [{ value: null, disabled: true }],
      salesReturnQtnNo: [{ value: null, disabled: true }],
      salesReturnQtnDate: [{ value: null, disabled: true }],
      salesReturnSalesManId: [-1],
      salesReturnDptId: [-1],
      salesReturnEnqNo: [{ value: null, disabled: true }],

      salesReturnHeader: [{ value: null, disabled: true }],
      salesReturnDelivery: [{ value: null, disabled: true }],
      salesReturnNotes: [{ value: null, disabled: true }],
      salesReturnFooter: [{ value: null, disabled: true }],
      salesReturnPaymentTerms: [{ value: null, disabled: true }],
      salesReturnSubject: [{ value: null, disabled: true }],
      salesReturnContent: [{ value: null, disabled: true }],
      salesReturnRemarks1: [{ value: null, disabled: true }],
      salesReturnRemarks2: [{ value: null, disabled: true }],
      salesReturnType: [''],
      salesReturnTermsAndCondition: [{ value: null, disabled: true }],
      salesReturnShippinAddress: [{ value: null, disabled: true }],

      salesReturnEnqDate: [{ value: null, disabled: true }],
      salesReturnJobId: [-1],
      salesReturnLocationId: [this.defaultLocationID],

      salesReturnTotalGrossAmount: [{ value: [0], disabled: true }],
      salesReturnTotalItemDisAmount: [{ value: [0], disabled: true }],
      salesReturnTotalDisPer: [{ value: [0], disabled: true }],
      salesReturnTotalDisAmount: [{ value: [0], disabled: true }],
      salesReturnVatPer: [{ value: [5], disabled: true }],
      salesReturnVatAmt: [{ value: [0], disabled: true }],
      salesReturnTotalActualAmount: [{ value: [0], disabled: true }],
      salesReturnVatRoundSign: [{ value: '-', disabled: true }],
      salesReturnVatRountAmt: [{ value: [0], disabled: true }],
      salesReturnNetAmount: [{ value: [0], disabled: true }],
    });

    this.SalesreturnFilterForm = this.fb.group({
      SalesreturnVoucherNo: [null],
      SalesreturnCustomer: [null],
      isDate: [],
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
    this.LoadLocationDDL();
  }

  get f() {
    return this.salesReturnFormGroup.controls;
  }

  initializeControls() {
    this.salesreturn_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      [0]
    );

    this.salesreturn_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showSalesLookUp = false;
      if (change[0][1] === 0) {
        this.showSalesLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.salesreturn_entry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);
        var retQty = data[7];
        if (retQty > data[5]) {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Return QTY must be less or equal to net Sales QTY',
          });
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 7, 0);
        } else {
          // var netAmount = (data[6] * data[7]*(data[13]?data[13]:1));
          //var discValue = (data[7]*data[4]);
          //var result = totalSum - discValue;
          // var sum =(result);//data[4]*data[5]-data[7];
          // this.hotRegisterer
          //   .getInstance(this.hotid)
          //   .setDataAtCell(change[0][0], 9, netAmount);
          // var tillQty =data[4]
          // tillQty += data[6]
          // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 4, tillQty);
        }
        var grossAmt = retQty * data[8];
        // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 8, grossAmt)
        var discAmount = data[10];
        var vatPer = 5;
        var vatAmount = (grossAmt * 5) / 100;
        // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 11, vatAmount)
        var netAmount = grossAmt + vatAmount - discAmount;

        // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 12, netAmount)

        var index = this.salesreturn_entryDataset?.findIndex(
          (o) => o.itemId == data[1]
        );
        if (index >= 0 && data[2] != null) {
          this.salesreturn_entryDataset[index].grossAmt = grossAmt;
          this.salesreturn_entryDataset[index].vatAmt = vatAmount;
          this.salesreturn_entryDataset[index].vatPer = vatPer;
          this.salesreturn_entryDataset[index].netAmt = netAmount;
          this.hotRegisterer
            .getInstance(this.hotid)
            .updateSettings({ data: this.salesreturn_entryDataset });
        }
      }
    };
    this.salesreturn_entry.afterRemoveRow = (index: number, amount: number) => {
      this.ColumnSum();
      this.displaySalesVoucher = false;
      // this.GetTotal();
    };

    this.salesreturn_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }
  initializeSalesVoucherControls() {
    this.SalesVoucherConfig = {
      ...this.utilityService.getTableConfig(salesVoucherColumns(this), [3], {
        height: '300px',
      }),
      beforeColumnSort: (currentSort: any[], destinationSort: any[]) => {
        if (destinationSort.length > 0) {
          this.pageDataSet = [];
          const sortConfig = destinationSort[0];
          const colIndex = sortConfig.column;
          const columnName = salesVoucherColumns(this)[colIndex]?.data;

          if (!this.sortOrder[columnName]) {
            this.sortOrder[columnName] = 'desc';
          } else {
            this.sortOrder[columnName] =
              this.sortOrder[columnName] === 'asc' ? 'desc' : 'asc';
          }

          this.sortSalesVocuherColumn = columnName;
          this.ApplySalesVoucherFilter();
          return false;
        }
      },
    };
  }
  initializeSalesReturnControls() {
    this.SalesReturnConfig = {
      ...this.utilityService.getTableConfig(salesReturnColumns(this), [], {
        height: '300px',
      }),
      beforeColumnSort: (currentSort: any[], destinationSort: any[]) => {
        if (destinationSort.length > 0) {
          this.pageDataSet = [];
          const sortConfig = destinationSort[0];
          const colIndex = sortConfig.column;
          const columnName = salesReturnColumns(this)[colIndex]?.data;

          if (!this.sortOrder[columnName]) {
            this.sortOrder[columnName] = 'desc';
          } else {
            this.sortOrder[columnName] =
              this.sortOrder[columnName] === 'asc' ? 'desc' : 'asc';
          }

          this.sortSalesReturnColumn = columnName;
          this.getAllSalesReturnList();
          return false;
        }
      },
    };
  }

  ColumnSum() {
    const sum1 = this.salesreturn_entry.data
      ?.filter((item) => item.hasOwnProperty('disc'))
      .reduce((sum, current: any) => sum + current.disc);

    this.salesReturnFormGroup.controls.salesReturnTotalItemDisAmount.setValue(
      sum1
    );

    // this.salesreturn_entry.data[0].netAmt = 45;
    const sum2 = this.salesreturn_entry.data
      ?.filter((item) => item.hasOwnProperty('netAmt'))

      .reduce((sum, current: any) => sum + current.netAmt);
    this.salesReturnFormGroup.controls.salesReturnTotalGrossAmount.setValue(
      sum2
    );

    this.GetTotal();
  }

  CalcDiscFromPer() {
    this.salesReturnFormGroup.controls.salesReturnTotalDisAmount.setValue(
      parseFloat(
        (
          (Number(this.salesReturnFormGroup.value.salesReturnTotalGrossAmount) *
            Number(this.salesReturnFormGroup.value.salesReturnTotalDisPer)) /
          100
        ).toFixed(2)
      )
    );
    this.GetTotal();
  }

  CalcDiscFromAmt() {
    this.salesReturnFormGroup.controls.salesReturnTotalDisPer.setValue(
      parseFloat(
        (
          (Number(this.salesReturnFormGroup.value.salesReturnTotalDisAmount) *
            100) /
          Number(this.salesReturnFormGroup.value.salesReturnTotalGrossAmount)
        ).toFixed(2)
      )
    );
    this.GetTotal();
  }

  GetTotal($event = null) {
    if (this.salesReturnFormGroup.value.salesReturnExcludeVat == true) {
      this.salesReturnFormGroup.value.salesReturnVatPer = 0;
    } else {
      this.salesReturnFormGroup.value.salesReturnVatPer = 5;
    }

    this.salesReturnFormGroup.controls.salesReturnTotalActualAmount.setValue(
      parseFloat(
        (
          Number(this.salesReturnFormGroup.value.salesReturnTotalGrossAmount) -
          Number(this.salesReturnFormGroup.value.salesReturnTotalDisAmount)
        ).toFixed(2)
      )
    );

    this.salesReturnFormGroup.controls.salesReturnVatAmt.setValue(
      parseFloat(
        (
          (Number(
            this.salesReturnFormGroup.value.salesReturnTotalActualAmount
          ) *
            Number(this.salesReturnFormGroup.value.salesReturnVatPer)) /
          100
        ).toFixed(2)
      )
    );

    if (this.salesReturnFormGroup.value.salesReturnVatRoundSign == '+') {
      this.salesReturnFormGroup.controls.salesReturnNetAmount.setValue(
        parseFloat(
          (
            Number(
              this.salesReturnFormGroup.value.salesReturnTotalActualAmount
            ) +
            Number(this.salesReturnFormGroup.value.salesReturnVatAmt) +
            Number(this.salesReturnFormGroup.value.salesReturnVatRountAmt)
          ).toFixed(2)
        )
      );
    } else if (this.salesReturnFormGroup.value.salesReturnVatRoundSign == '-') {
      this.salesReturnFormGroup.controls.salesReturnNetAmount.setValue(
        parseFloat(
          (
            Number(
              this.salesReturnFormGroup.value.salesReturnTotalActualAmount
            ) +
            Number(this.salesReturnFormGroup.value.salesReturnVatAmt) -
            Number(this.salesReturnFormGroup.value.salesReturnVatRountAmt)
          ).toFixed(2)
        )
      );
    } else {
      this.salesReturnFormGroup.value.salesReturnVatRoundSign = '-';
    }
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = k.map((ar) => ar.currencyMasterCurrencyName?.trim());
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
  LoadCostCenterDDL() {
    this.utilityService.LoadDropdowncostcenterMasters().subscribe((m: any) => {
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl: any) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
    });
  }

  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((m: any) => {
      this.unitArray = m.resultSet.unitMasters;
      this.unitList = m.resultSet.unitMasters?.map((kl: any) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
    });
  }
  LoadItemDDL() {
    this.accountapi.LoadDropdownItemMaster().subscribe((m: any) => {
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
      this.CustomerMasterList.unshift({
        label: '--Select Customer--',
        value: -1,
      });
    });
  }

  LoadDepartmentDDL() {
    if (this.DepartmentMasterArray.length > 0) return;
    this.accountapi.LoadDepartmentDropdown().subscribe((m: any) => {
      // department
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

  LoadAccountDDL() {
    this.utilityService.LoadDropdowchartofAccounts().subscribe((m: any) => {
      this.accountArray = m.resultSet.masterAccountsTables;
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

  LoadCurrencyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((m: any) => {
      this.currArry = m.resultSet.currencyMasters;
      this.currencyList = m.resultSet.currencyMasters?.map((kl: any) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      localStorage.setItem('currencyList', JSON.stringify(this.currencyList));
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
        this.salesReturnFormGroup,
        'salesReturnLocationId'
      );
    });
  }
  LoadAccountSettingDDL() {
    this.utilityService.LoadDropdownaccountsSettings().subscribe((m: any) => {
      var res = m.resultSet.accountsSettings;
      const splitText0 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Discount Paid Account'
      )?.accountSettingsAccountTextValue;
      const parts0 = splitText0.split('::');
      this.DiscountPaidAccount = parts0[1]?.trim();

      const splitText = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Sales Return Account'
      )?.accountSettingsAccountTextValue;
      const parts = splitText.split('::');
      this.saleReturnAccount = parts[1].trim();

      const splitText12 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Cash Account'
      )?.accountSettingsAccountTextValue;
      const parts12 = splitText12.split('::');
      this.cashAccount = parts12[1]?.trim();

      const splitText3 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Vat Input'
      )?.accountSettingsAccountTextValue;
      const parts3 = splitText3.split('::');
      this.vatPayableAccount = parts3[1].trim();

      const splitText1 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Stock Account'
      )?.accountSettingsAccountTextValue;
      const parts1 = splitText1.split('::');
      this.stockLedgerAccount = parts1[1].trim();

      const splitText2 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Expenses Account'
      )?.accountSettingsAccountTextValue;
      const parts2 = splitText2.split('::');
      this.goodsSoldAccount = parts2[1].trim();

      const splitText5 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Round Off'
      )?.accountSettingsAccountTextValue;
      const parts5 = splitText5.split('::');
      this.RoundOffAccount = parts5[1]?.trim();
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
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
  public getParty(id): string {
    return this.CustomerMasterArray?.find(
      (j) => j.customerMasterCustomerNo === id
    )?.customerMasterCustomerName;
  }

  saveSalesReturn() {
    const savedData: any = this.salesreturn_entryDataset?.filter(
      (o: any) => o.itemId > 0
    );
    const salesReturn_Save: SalesReturn = this.salesReturnFormGroup
      .value as SalesReturn;
    salesReturn_Save.salesReturnId = Number(
      this.salesReturnFormGroup.value.salesReturnId
    );
    salesReturn_Save.salesReturnNo =
      this.salesReturnFormGroup.getRawValue().salesReturnNo;
    salesReturn_Save.salesReturnDate =
      this.salesReturnFormGroup.value.salesReturnDate;
    salesReturn_Save.salesReturnRefNo =
      this.salesReturnFormGroup.value.salesReturnRefNo;
    salesReturn_Save.salesReturnContPerson =
      this.salesReturnFormGroup.value.salesReturnContPerson;
    salesReturn_Save.salesReturnCurrencyId =
      this.salesReturnFormGroup.value.salesReturnCurrencyId;
    salesReturn_Save.salesReturnExcludeVat = false;
    salesReturn_Save.salesReturnType =
      this.salesReturnFormGroup.value.salesReturnType;
    salesReturn_Save.salesReturnPartyId =
      this.salesReturnFormGroup.value.salesReturnPartyId;
    // salesReturn_Save.salesReturnPartyName = 'PARTY NAME';
    salesReturn_Save.salesReturnPartyAddress =
      this.salesReturnFormGroup.value.salesReturnPartyAddress;
    salesReturn_Save.salesReturnPartyVatNo =
      this.salesReturnFormGroup.value.salesReturnPartyVatNo;
    salesReturn_Save.salesReturnDescription =
      this.salesReturnFormGroup.value.salesReturnDescription;
    salesReturn_Save.salesReturnSvno =
      this.salesReturnFormGroup.value.salesReturnSvno;
    salesReturn_Save.salesReturnSvdate =
      this.salesReturnFormGroup.value.salesReturnSvdate;
    salesReturn_Save.salesReturnDlvNo =
      this.salesReturnFormGroup.value.salesReturnDlvNo;
    salesReturn_Save.salesReturnDlvDate =
      this.salesReturnFormGroup.value.salesReturnDlvDate;
    salesReturn_Save.salesReturnSono =
      this.salesReturnFormGroup.value.salesReturnSono;
    salesReturn_Save.salesReturnSodate =
      this.salesReturnFormGroup.value.salesReturnSodate;
    salesReturn_Save.salesReturnQtnNo =
      this.salesReturnFormGroup.value.salesReturnQtnNo;
    salesReturn_Save.salesReturnQtnDate =
      this.salesReturnFormGroup.value.salesReturnQtnDate;
    salesReturn_Save.salesReturnSalesManId =
      this.salesReturnFormGroup.value.salesReturnSalesManId;
    salesReturn_Save.salesReturnDptId =
      this.salesReturnFormGroup.value.salesReturnDptId;
    salesReturn_Save.salesReturnEnqNo =
      this.salesReturnFormGroup.value.salesReturnEnqNo;
    salesReturn_Save.salesReturnHeader =
      this.salesReturnFormGroup.value.salesReturnHeader;
    salesReturn_Save.salesReturnDelivery =
      this.salesReturnFormGroup.value.salesReturnDelivery;
    salesReturn_Save.salesReturnNotes =
      this.salesReturnFormGroup.value.salesReturnNotes;
    salesReturn_Save.salesReturnFooter =
      this.salesReturnFormGroup.value.salesReturnFooter;
    salesReturn_Save.salesReturnPaymentTerms =
      this.salesReturnFormGroup.value.salesReturnPaymentTerms;
    salesReturn_Save.salesReturnSubject =
      this.salesReturnFormGroup.value.salesReturnSubject;
    salesReturn_Save.salesReturnContent =
      this.salesReturnFormGroup.value.salesReturnContent;
    salesReturn_Save.salesReturnRemarks1 =
      this.salesReturnFormGroup.value.salesReturnRemarks1;
    salesReturn_Save.salesReturnRemarks2 =
      this.salesReturnFormGroup.value.salesReturnRemarks2;
    salesReturn_Save.salesReturnTermsAndCondition =
      this.salesReturnFormGroup.value.salesReturnTermsAndCondition;
    salesReturn_Save.salesReturnShippinAddress =
      this.salesReturnFormGroup.value.salesReturnShippinAddress;
    salesReturn_Save.salesReturnEnqDate =
      this.salesReturnFormGroup.value.salesReturnEnqDate;
    salesReturn_Save.salesReturnLocationId =
      this.salesReturnFormGroup.get('salesReturnLocationId')?.value ??
      this.defaultLocationID;
    salesReturn_Save.salesReturnJobId =
      this.salesReturnFormGroup.value.salesReturnJobId;
    salesReturn_Save.salesReturnTotalGrossAmount = this.getGrossTotal();
    salesReturn_Save.salesReturnTotalItemDisAmount = this.getDiscountTotal();
    salesReturn_Save.salesReturnTotalDisPer = 0;
    salesReturn_Save.salesReturnTotalDisAmount = 0;
    salesReturn_Save.salesReturnVatPer = 5;
    salesReturn_Save.salesReturnVatAmt = this.getVatTotal();
    salesReturn_Save.salesReturnTotalActualAmount = this.getNetAmount();
    salesReturn_Save.salesReturnVatRoundSign = '+';
    salesReturn_Save.salesReturnVatRountAmt = 0;
    salesReturn_Save.salesReturnNetAmount = this.getNetAmount();
    delete salesReturn_Save.accountsTransactions;
    delete salesReturn_Save.salesReturnDetails;
    // salesReturn_Save.accountsTransactions = [];
    // salesReturn_Save.salesReturnDetails = []
    var detailArray = [];
    var accountTransactions = [];
    savedData.map((k: GridData) => {
      detailArray.push({
        salesReturnId: Number(this.salesReturnFormGroup.value.salesReturnId),
        salesReturnDetailsId: k.id != null ? k.id : 0,
        salesReturnDetailsNo:
          this.salesReturnFormGroup.getRawValue().salesReturnNo,
        salesReturnDetailsMatId: k.itemId,
        salesReturnDetailsItemName: k.itemname,
        salesReturnDetailsQuantity: k.retQty,
        salesReturnDetailsQuantityTill: k.retQtyTill,
        salesReturnDetailsSalesQty: k.qty,
        salesReturnDetailsDiscAmount: Number(k.disc),
        salesReturnDetailsRate: k.rate,
        salesReturnDetailsNetAmt: k.netAmt,
        salesReturnDetailsGrossAmount: k.grossAmt,
        salesReturnDetailsRemarks: k.narration,
        salesReturnDetailsSno: 0,
        salesReturnDetailsUnitId:
          k.unit != null && k.unit !== ''
            ? this.unitArray?.find(
              (j) => j.unitMasterUnitShortName?.trim() === k.unit?.trim()
            )?.unitMasterUnitId
            : null,
        salesReturnDetailsDelStatus: false,
        salesReturnDetailsVatPer: k.vatPer,
        salesReturnDetailsVatAmt: k.vatAmt,
      });
    });
    var user = this.loginser.GetCredentialData();
    this.usrid = user?.userId;
    this.fsno = user?.financialPeriodsFsno;

    accountTransactions = [];
    /// customer
    const creditData: AccountsTransactions = {
      accountsTransactionsAccNo:
        this.salesReturnFormGroup.getRawValue().salesReturnType == 'CASH'
          ? this.cashAccount
          : this.CustomerMasterArray?.find(
            (o) =>
              o.customerMasterCustomerNo ==
              this.salesReturnFormGroup.value.salesReturnPartyId
          )?.customerMasterCustomerReffAcNo,
      accountsTransactionsTransDate: salesReturn_Save.salesReturnDate,
      accountsTransactionsParticulars: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsCredit: Number(salesReturn_Save.salesReturnNetAmount),
      accountsTransactionsFcCredit: Number(
        salesReturn_Save.salesReturnNetAmount
      ),
      accountsTransactionsAllocBalance: salesReturn_Save.salesReturnNetAmount,
      accountsTransactionsFcAllocBalance: Number(
        salesReturn_Save.salesReturnNetAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo: salesReturn_Save.salesReturnNo,
      accountsTransactionsDescription: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
    };
    accountTransactions.push(creditData);
    ///stock ledger
    const stockLegder: AccountsTransactions = {
      accountsTransactionsAccNo: this.stockLedgerAccount,
      accountsTransactionsTransDate: salesReturn_Save.salesReturnDate,
      accountsTransactionsParticulars: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsDebit: Number(
        salesReturn_Save.salesReturnTotalGrossAmount
      ),
      accountsTransactionsFcDebit: Number(
        salesReturn_Save.salesReturnTotalGrossAmount
      ),
      accountsTransactionsAllocBalance:
        salesReturn_Save.salesReturnTotalGrossAmount,
      accountsTransactionsFcAllocBalance: Number(
        salesReturn_Save.salesReturnTotalGrossAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo: salesReturn_Save.salesReturnNo,
      accountsTransactionsDescription: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
    };
    accountTransactions.push(stockLegder);

    /// cost of goodsSold
    const costGoodsSold: AccountsTransactions = {
      accountsTransactionsAccNo: this.goodsSoldAccount,
      accountsTransactionsTransDate: salesReturn_Save.salesReturnDate,
      accountsTransactionsParticulars: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsCredit: Number(
        salesReturn_Save.salesReturnTotalGrossAmount
      ),
      accountsTransactionsFcCredit: Number(
        salesReturn_Save.salesReturnTotalGrossAmount
      ),
      accountsTransactionsAllocBalance:
        salesReturn_Save.salesReturnTotalGrossAmount,
      accountsTransactionsFcAllocBalance: Number(
        salesReturn_Save.salesReturnTotalGrossAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo: salesReturn_Save.salesReturnNo,
      accountsTransactionsDescription: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
    };
    accountTransactions.push(costGoodsSold);

    ///discount
    const vatData1: AccountsTransactions = {
      accountsTransactionsAccNo: this.DiscountPaidAccount,
      accountsTransactionsTransDate: salesReturn_Save.salesReturnDate,
      accountsTransactionsParticulars: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsVatableAmount: Number(
        salesReturn_Save.salesReturnTotalDisAmount
      ),

      accountsTransactionsCredit: Number(
        salesReturn_Save.salesReturnTotalDisAmount
      ),
      accountsTransactionsFcCredit: Number(
        salesReturn_Save.salesReturnTotalDisAmount
      ),
      accountsTransactionsAllocBalance:
        salesReturn_Save.salesReturnTotalDisAmount,
      accountsTransactionsFcAllocBalance: Number(
        salesReturn_Save.salesReturnTotalDisAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo: salesReturn_Save.salesReturnNo,
      accountsTransactionsDescription: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
    };
    accountTransactions.push(vatData1);

    //// sale return
    const debitData: AccountsTransactions = {
      accountsTransactionsAccNo: this.saleReturnAccount,
      accountsTransactionsTransDate: salesReturn_Save.salesReturnDate,
      accountsTransactionsParticulars: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsDebit: Number(
        salesReturn_Save.salesReturnTotalGrossAmount
      ),
      accountsTransactionsFcDebit: Number(
        salesReturn_Save.salesReturnTotalGrossAmount
      ),
      accountsTransactionsAllocBalance:
        salesReturn_Save.salesReturnTotalGrossAmount,
      accountsTransactionsFcAllocBalance: Number(
        salesReturn_Save.salesReturnTotalGrossAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo: salesReturn_Save.salesReturnNo,
      accountsTransactionsDescription: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
    };
    accountTransactions.push(debitData);

    /// vat payable
    const vatData: AccountsTransactions = {
      accountsTransactionsAccNo: this.vatPayableAccount,
      accountsTransactionsTransDate: salesReturn_Save.salesReturnDate,
      accountsTransactionsParticulars: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsVatableAmount: Number(
        salesReturn_Save.salesReturnVatAmt
      ),
      accountsTransactionsDebit: Number(salesReturn_Save.salesReturnVatAmt),
      accountsTransactionsFcDebit: Number(salesReturn_Save.salesReturnVatAmt),
      accountsTransactionsAllocBalance: salesReturn_Save.salesReturnVatAmt,
      accountsTransactionsFcAllocBalance: Number(
        salesReturn_Save.salesReturnVatAmt
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo: salesReturn_Save.salesReturnNo,
      accountsTransactionsDescription: salesReturn_Save.salesReturnRemarks1,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
    };
    accountTransactions.push(vatData);

    if (this.btnFlag.save) {
      var data = {
        salesReturn: salesReturn_Save,
        salesReturnDetails: detailArray,
        accountsTransactions: accountTransactions,
      };
      //return
      this.saveVoucher(data);
    } else {
      var data = {
        salesReturn: salesReturn_Save,
        salesReturnDetails: detailArray,
        accountsTransactions: accountTransactions,
      };
      this.updateVoucher(data);
    }
  }

  validateTotalDrCrAmounts(): boolean {
    if (
      this.salesReturnFormGroup.getRawValue().salesReturnTotalGrossAmount ==
      0 &&
      this.salesReturnFormGroup.getRawValue().salesReturnTotalItemDisAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    if (
      this.salesReturnFormGroup.getRawValue().salesReturnTotalGrossAmount == 0
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

  saveVoucher(salesReturn_Save: SalesReturn) {
    this.accountapi.GenerateSalesReturnNo().subscribe(
      (res: any) => {
        this.salesReturnFormGroup
          .get('salesReturnNo')
          .setValue(res.vouchersNumbersVNo);

        // Step 2: Validate the form
        if (this.salesReturnFormGroup.valid) {
          this.confirmation.confirm({
            key: 'confirm-key',
            message: 'Do you want to save voucher?',
            accept: () => {
              // Step 3: Validate total debit and credit amounts
              if (this.validateTotalDrCrAmounts()) {
                // Step 4: Save the sales return
                this.salesapi.InsertSalesReturn(salesReturn_Save).subscribe(
                  (data: any) => {
                    // Step 5: Update UI and provide feedback
                    this.btnFlag = {
                      edit: true,
                      cancel: false,
                      save: false,
                      update: true,
                      delete: true,
                      new: true,
                    };
                    this.savedSalesReturn = data.salesReturn;
                    this.accountTransactionList = data.accountsTransactions;
                    this.updateFormGrid(
                      data?.salesReturn,
                      data?.salesReturnDetails
                    );
                    this.userTrackingLog('Insert');
                    if (data) {
                      this.messageService.add({
                        severity: 'success',
                        summary: 'Alert',
                        detail: 'Sales Return Save Successfully',
                      });
                    } else if (data.error) {
                      this.messageService.add({
                        severity: 'error',
                        summary: 'Alert',
                        detail:
                          data.message && data.message.trim() !== ''
                            ? data.message
                            : data.exception,
                      });
                    }
                  },
                  (err) => {
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Alert',
                      detail: 'Sales Return Save Failed',
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
          this.salesReturnFormGroup.markAllAsTouched();
          this.salesReturnFormGroup.markAsDirty();
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed to generate sales return number',
        });
      }
    );
  }

  updateVoucher(salesReturn_Save: any) {
    if (this.salesReturnFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.salesapi.UpdateSalesReturn(salesReturn_Save).subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.userTrackingLog('Update');

                // this.updateFormGrid(data.result);
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Sales Return Updated Succesfully',
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Sales Return Update Failed',
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
      this.salesReturnFormGroup.markAllAsTouched();
      this.salesReturnFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAccountSetting() {
    this.masterapi.getAccountSetting().subscribe((res: any) => {
      const splitText0 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Discount Paid Account'
      )?.accountSettingsAccountTextValue;
      const parts0 = splitText0.split('::');
      this.DiscountPaidAccount = parts0[1]?.trim();

      const splitText = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Sales Return Account'
      )?.accountSettingsAccountTextValue;
      const parts = splitText.split('::');
      this.saleReturnAccount = parts[1].trim();

      const splitText3 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Vat Input'
      )?.accountSettingsAccountTextValue;
      const parts3 = splitText3.split('::');
      this.vatPayableAccount = parts3[1].trim();

      const splitText1 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Stock Account'
      )?.accountSettingsAccountTextValue;
      const parts1 = splitText1.split('::');
      this.stockLedgerAccount = parts1[1].trim();

      const splitText2 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Expenses Account'
      )?.accountSettingsAccountTextValue;
      const parts2 = splitText2.split('::');
      this.goodsSoldAccount = parts2[1].trim();
    });
  }
  globalSearchSalesReturn() {
    this.pageDataSet = [];
    this.currentPage = 1;
    this.getAllSalesReturnList();
  }
  onClickSaleVoucherList() {
    this.clearPagination();
    this.getAllSalesReturnList();
  }
  getAllSalesReturnList() {
    this.state = {
      Dir: this.sortOrder[this.sortSalesReturnColumn] || 'desc',
      Field: this.sortSalesReturnColumn || 'salesReturnDate',
      Skip: this.pageSize * (this.currentPage - 1),
      Take: this.pageSize,
      Search: this.globalSalesReturnSearch,
      Filter: this.salesReturnfilter,
    };
    this.salesapi.GetSalesReturnList(this.state).subscribe({
      next: (res: any) => {
        this.salesReturnarry = res.result.data;
        this.filterArray = res.result.data;
        if (res.result.data.length > 0) {
          this.totalRecords = res.result.total;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
          this.pageDataSet[this.currentPage] = res.result.data;
        } else {
          this.totalRecords = res.result.total;
        }
        this.displayMaximizable = true;
      },
      error: (err) => {
        console.error('API error:', err);
        this.displaySalesVoucher = false;
        this.salesVoucherarry = [];
        this.totalRecords = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed to load sales return list. Please try again.',
        });
      },
      complete: () => {
        console.log('API call completed');
      },
    });
  }

  getDefaultCurrency() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULTCURRENCY')
      .subscribe((data) => {
        if (data !== null) {
          this.DefCurCheck = data.result[0].generalSettingsTextValue;
          if (this.DefCurCheck !== null) {
            const splitText = this.DefCurCheck.split('::');
            this.DefCurrency = splitText[1]?.trim();
            this.f.salesReturnCurrencyId.setValue(Number(this.DefCurrency));
          }
        }
      });
  }

  getDefaultLocation() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULT_LOCATION')
      .subscribe((data) => {
        if (data !== null) {
          this.DefLocCheck = data.result[0].generalSettingsTextValue;
          if (this.DefLocCheck !== null) {
            const splitText = this.DefLocCheck.split('::');
            this.DefLocid = splitText[1]?.trim();
            // this.f.salesReturnLocationId.setValue(Number(this.DefLocid));
            if (!this.locationLocked) {
              this.f.salesReturnLocationId.setValue(this.defaultLocationID);
            }
          }
        }
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
  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.LoadJobDDL();
    // this.LoadItemDDL();
    this.LoadUnitDDL();
    this.LoadAccountDDL();
    this.LoadSaleManDDL();
    this.LoadCurrencyDDL();
    this.LoadCustomerDDL();
    this.LoadLocationDDL();
    this.LoadCostCenterDDL();
    this.LoadAccountSettingDDL();
  }
  new() {
    this.callDropdowns();
    this.salesReturnFormGroup.reset();
    this.salesreturn_entry.data = [];
    this.salesreturn_entry.readOnly = false;
    this.salesReturnFormGroup.controls.salesReturnVatRoundSign.setValue('-');
    this.salesReturnFormGroup.controls.salesReturnType.setValue('CREDIT');

    this.salesReturnFormGroup.controls.salesReturnVatPer.setValue(5);

    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.salesreturn_entry);
    this.accountTransactionList = [];
    this.salesReturnFormGroup.get('salesReturnId').setValue(null);
    this.salesReturnFormGroup.get('salesReturnPartyId').setValue(-1);
    this.salesReturnFormGroup.get('salesReturnJobId').setValue(-1);
    this.salesReturnFormGroup.get('salesReturnCurrencyId').setValue(-1);
    this.salesReturnFormGroup
      .get('salesReturnLocationId')
      .setValue(this.defaultLocationID);

    this.salesReturnFormGroup.get('salesReturnSalesManId').setValue(-1);
    this.salesReturnFormGroup.get('salesReturnDptId').setValue(-1);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.index = 0;
    this.GetDefaultSettings();
    this.f.salesReturnDate.setValue(new Date());
    this.salesReturnFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.salesReturnFormGroup,
      'salesReturnLocationId',
      this.locationLocked
    );
    if (this.locationLocked) {
      this.salesReturnFormGroup.controls.salesReturnLocationId.disable();
    }
    this.f.salesReturnNo.clearValidators();
    this.salesReturnFormGroup.updateValueAndValidity();
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m: any) => {
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
          this.f.salesReturnCurrencyId.setValue(Number(this.DefCurrency));
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
          // this.f.salesReturnLocationId.setValue(Number(this.DefLocid));
          if (!this.locationLocked) {
            this.f.salesReturnLocationId.setValue(this.defaultLocationID);
          }
        }
      }
    });
  }

  updateFormGrid(salesreturn_update: SalesReturn, salesreturnDetails: any[]) {
    this.salesReturnFormGroup.patchValue({
      salesReturnId: salesreturn_update.salesReturnId,
      salesReturnNo: salesreturn_update.salesReturnNo,
      salesReturnDate: new Date(salesreturn_update.salesReturnDate),
      salesReturnRefNo: salesreturn_update.salesReturnRefNo,
      salesReturnContPerson: salesreturn_update.salesReturnContPerson,
      salesReturnCurrencyId: salesreturn_update.salesReturnCurrencyId,
      salesReturnExcludeVat: salesreturn_update.salesReturnExcludeVat,

      salesReturnType: salesreturn_update.salesReturnType,
      salesReturnPartyId: salesreturn_update.salesReturnPartyId,
      salesReturnPartyName: salesreturn_update.salesReturnPartyName,
      salesReturnPartyAddress: salesreturn_update.salesReturnPartyAddress,
      salesReturnPartyVatNo: salesreturn_update.salesReturnPartyVatNo,
      salesReturnDescription: salesreturn_update.salesReturnDescription,

      salesReturnSvno: salesreturn_update.salesReturnSVNo,
      salesReturnSvdate:
        salesreturn_update.salesReturnSVDate != null
          ? new Date(salesreturn_update.salesReturnSVDate)
          : null,

      salesReturnDlvNo: salesreturn_update.salesReturnDlvNo,
      salesReturnDlvDate:
        salesreturn_update.salesReturnSVDate != null
          ? new Date(salesreturn_update.salesReturnSVDate)
          : null,
      salesReturnSono: salesreturn_update.salesReturnSono,
      salesReturnSodate:
        salesreturn_update.salesReturnSodate != null
          ? new Date(salesreturn_update.salesReturnSodate)
          : null,
      salesReturnQtnNo: salesreturn_update.salesReturnQtnNo,
      salesReturnQtnDate:
        salesreturn_update.salesReturnQtnDate != null
          ? new Date(salesreturn_update.salesReturnQtnDate)
          : null,

      salesReturnSalesManId: salesreturn_update.salesReturnSalesManID,
      salesReturnDptId: salesreturn_update.salesReturnDptID,
      salesReturnEnqNo: salesreturn_update.salesReturnEnqNo,
      salesReturnEnqDate:
        salesreturn_update.salesReturnEnqDate != null
          ? new Date(salesreturn_update.salesReturnEnqDate)
          : null,

      salesReturnHeader: salesreturn_update.salesReturnHeader,
      salesReturnDelivery: salesreturn_update.salesReturnDelivery,
      salesReturnNotes: salesreturn_update.salesReturnNotes,
      salesReturnFooter: salesreturn_update.salesReturnFooter,
      salesReturnPaymentTerms: salesreturn_update.salesReturnPaymentTerms,
      salesReturnSubject: salesreturn_update.salesReturnSubject,

      salesReturnContent: salesreturn_update.salesReturnContent,
      salesReturnRemarks1: salesreturn_update.salesReturnRemarks1,
      salesReturnRemarks2: salesreturn_update.salesReturnRemarks2,
      salesReturnTermsAndCondition:
        salesreturn_update.salesReturnTermsAndCondition,
      salesReturnShippinAddress: salesreturn_update.salesReturnShippinAddress,

      salesReturnLocationId: this.defaultLocationID,
      salesReturnJobId: salesreturn_update.salesReturnJobId,

      salesReturnTotalGrossAmount:
        salesreturn_update.salesReturnTotalGrossAmount,
      salesReturnTotalItemDisAmount:
        salesreturn_update.salesReturnTotalItemDisAmount,
      salesReturnTotalDisPer: salesreturn_update.salesReturnTotalDisPer,
      salesReturnTotalDisAmount: salesreturn_update.salesReturnTotalDisAmount,
      salesReturnVatPer: salesreturn_update.salesReturnVatPer,
      salesReturnVatAmt: salesreturn_update.salesReturnVatAmt,
      salesReturnTotalActualAmount:
        salesreturn_update.salesReturnTotalActualAmount,
      salesReturnVatRoundSign: salesreturn_update.salesReturnVatRoundSign,
      salesReturnVatRountAmt: salesreturn_update.salesReturnVatRountAmt,
      salesReturnNetAmount: salesreturn_update.salesReturnNetAmount,
    });

    const gridData: any[] = salesreturnDetails.map((k) => {

      const UnitId: string =
        k.salesReturnDetailsUnitId != null
          ? this.unitList?.find((l) => l.value == k.salesReturnDetailsUnitId)
            ?.label
          : null;
      return {
        id: k.salesReturnDetailsId,
        itemId: k.salesReturnDetailsMatId,
        partNo: 0,
        itemname: k.salesReturnDetailsItemName,
        unit: UnitId,
        qty: k.salesReturnDetailsSalesQty,
        retQtyTill: k.salesReturnQtyTill,
        retQty: k.salesReturnDetailsQuantity,
        rate: k.salesReturnDetailsRate,
        grossAmt: k.salesReturnDetailsGrossAmount,
        disc: k.salesReturnDetailsDiscAmount,
        vatPer: k.salesReturnDetailsVatPer,
        vatAmt: k.salesReturnDetailsVatAmt,
        netAmt: k.salesReturnDetailsNetAmt,
      };
    });
    this.salesreturn_entryDataset = gridData;
    this.salesreturn_entry.data = gridData;
    // this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: gridData, readOnly: true });
    this.salesReturnFormGroup.disable();
    this.f.salesReturnNo.clearValidators();
    this.salesReturnFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  userTrackingLog(type) {
    let req = {
      page: 'SalesReturn',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.salesReturnFormGroup.get('salesReturnNo').value,
      vpType: 'SalesReturn',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  printAsPDF() {
    // let html: any = document.getElementById('print');
    var css: string = `
    #customers {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        border: 1px #b1aeae solid;
        border-radius: 5px;
        width: 100%;
    }

    #customers td {
        // border-left: 1px solid ;
        // border-right: ipx solid;
        border-right: 1px solid #b1aeae;

        padding: 8px;

    }

    .center {
        text-align: center;
    }

    #customers th {
        border: 1px solid #b1aeae;
        padding: 8px;
        text-align: start;
    }

    .w50 {
        width: 70px;
    }
    .printImg {
      width: 500px;
      height: 100px;
  }

    .SvTotal {
        justify-content: end;
        margin: 5px;
        padding: 5px;
        display: flex;
        gap: 30px;
        width: 84%;
    }

    .SvTotalC {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        text-align: start;
        gap: 17px;
    }

    .mrg {
        margin: 10px 0;
    }

    .print {

        margin: auto !important;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
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
    .rowgap{
        gap: 111px;
    }
    .flexSpaceBetween{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-bottom: 20px;
    }

    table.border-table {
      border-collapse: collapse;
      border: 1px solid black;

      th {
          border: 1px solid black;
          background-color: #d9cece;
      }

      td {
          border: 1px solid black;
          // padding: 8px;
      }

  }

  @page {
    margin: 5mm 20mm;
  }

  @media print {
    thead {display: table-header-group;}
    tfoot {display: table-footer-group;}
    table { page-break-inside:auto }
    tr { page-break-inside:avoid; page-break-after:auto }

    body {margin: 0;}
    .print.page {
      page-break-after: always; /* Force page break after content */
    }

    @page :last {
      .page-footer {
        position: absolute;
        bottom: 0;
      }
    }
  }

    `;
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
  }

  displayPrint() {
   // this.displayPrintPreview = true;
   this.printReport();
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 5) {
      return Math.max(0, 5 - salesVoucherDetailsLength);
    }
  }

  public getLocationName(id: number): string {
    return this.locationArray?.find((j) => j?.locationMasterLocationId === id)
      ?.locationMasterLocationName;
  }

  public getSalesManName(id: number): string {
    return this.SalesManMasterArray?.find(
      (j) => j?.salesManMasterSalesManId === id
    )?.salesManMasterSalesManName;
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  GetSavedSalesReturnDetails(id: string) {
    this.displayMaximizable = false;
    this.index = 0;
    this.callDropdowns();
    this.salesapi.GetSavedSalesReturnDetails(id).subscribe(
      (data: any) => {
        if (data !== null) {
          this.savedSalesReturn = data.salesReturn;
          this.savedSalesReturn.salesReturnDetails = data.salesReturnDetails;
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
            new: true,
          };
          this.accountTransactionList = data.accountsTransactions;
          this.updateFormGrid(data.salesReturn, data.salesReturnDetails);

          this.salesReturnFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Sales Return not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.salesReturnFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.salesapi.DeleteSalesReturn(this.savedSalesReturn).subscribe(
          (data) => {
            this.userTrackingLog('Delete');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Sales Return Deleted Succesfully',
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
    this.GetSavedSalesReturnDetails(
      this.salesReturnFormGroup.getRawValue().salesReturnNo
    );
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.salesReturnNo.clearValidators();
    this.salesReturnFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.salesReturnFormGroup,
      'salesReturnLocationId',
      this.locationLocked
    );
    this.salesReturnFormGroup.controls.salesReturnNo.disable();
    if (this.locationLocked) {
      this.salesReturnFormGroup.controls.salesReturnLocationId.disable();
    }
    this.salesReturnFormGroup.updateValueAndValidity();
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
    if (this.salesreturn_entry.data.length > 0) {
      return Object.values(this.salesreturn_entry.data).some(
        (k: GridData) =>
          k.itemname != null && k.netAmt != null && !(k.rate == null)
      );
    }
    return false;
  }

  selectsales(evt) {
    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.sales);

    this.masterapi.GetItemMasterById({ id: evt.salesId }).subscribe((k) => {
      this.ItemMasterArrayByName = k.resultSet?.itemMaster;

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(
          this.activeRow.row,
          5,
          this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitPrice
        );
      this.funitid = this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
      const UnitId: string =
        this.funitid != null
          ? this.unitList?.find((l) => l.value == this.funitid).label
          : null;

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, UnitId);
    });

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
    this.control.setValue(evt.salesId);
    this.elementReference.nativeElement.value = evt.sales;
    this.formControlLookUp = false;
  }

  hide(evt: boolean) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  getDiscountTotal() {
    var value = 0;
    this.salesreturn_entryDataset.forEach((elemt) => {
      value += elemt.disc > 0 ? elemt.disc : 0;
    });
    value = parseFloat(value.toFixed(2));
    return value;
  }

  getGrossTotal() {
    var value = 0;
    this.salesreturn_entryDataset.forEach((elemt) => {
      value += elemt.grossAmt > 0 ? elemt.grossAmt : 0;
    });
    value = parseFloat(value.toFixed(2));
    return value;
  }

  getVatTotal() {
    var value = 0;
    this.salesreturn_entryDataset.forEach((elemt) => {
      value += elemt.vatAmt > 0 ? elemt.vatAmt : 0;
    });
    value = parseFloat(value.toFixed(2));
    return value;
  }

  getNetAmount() {
    var value = 0;
    value = this.getGrossTotal() + this.getVatTotal() - this.getDiscountTotal();
    value = parseFloat(value.toFixed(2));
    return value;
  }

  SetSalesVoucherDetails(voucherNo: string) {
    this.displaySalesVoucher = false;

    this.salesapi
      .GetSalesVoucherDetailsByMasterNo(voucherNo)
      .subscribe((res: any) => {
        const data = res.result;

        this.salesReturnFormGroup.controls.salesReturnSvdate.setValue(
          new Date(data?.salesVoucherDate)
        );
        this.salesReturnFormGroup.controls.salesReturnCurrencyId.setValue(
          data?.salesVoucherCurrencyId
        );
        this.salesReturnFormGroup.controls.salesReturnPartyId.setValue(
          data?.salesVoucherPartyId
        );
        this.onChangeCustomer();
        this.salesReturnFormGroup.controls.salesReturnDptId.setValue(
          data?.salesVoucherDptID
        );
        this.salesReturnFormGroup.controls.salesReturnLocationId.setValue(
          this.defaultLocationID
        );
        this.salesReturnFormGroup.controls.salesReturnType.setValue(
          data?.salesVoucherType
        );
        this.salesReturnFormGroup.controls.salesReturnDptId.setValue(
          data?.salesVoucherDptID
        );

        this.salesReturnFormGroup.controls.salesReturnSvno.setValue(voucherNo);
        this.SalesVoucherDetailsByMasterNoArray = data?.salesVoucherDetails;
        this.salesreturn_entryDataset = [];

        data?.salesVoucherDetails.forEach((element) => {



          let unitName;
          if (
            this.unitArray &&
            this.unitArray?.find(
              (o) => o.unitMasterUnitId === element.salesVoucherDetailsUnitId
            )
          ) {
            unitName = this.unitArray?.find(
              (o) => o.unitMasterUnitId === element.salesVoucherDetailsUnitId
            ).unitMasterUnitFullName;
          } else {
            unitName = null;
          }

          let conversionType;
          if (
            this.unitArray &&
            this.unitArray?.find(
              (o) => o.unitMasterUnitId === element.salesVoucherDetailsUnitId
            )
          ) {
            conversionType = this.unitArray?.find(
              (o) => o.unitMasterUnitId === element.salesVoucherDetailsUnitId
            ).unitDetailsConversionType;
          } else {
            conversionType = null;
          }

          this.salesreturn_entryDataset.push({
            id: null,
            itemId: element.salesVoucherDetailsMatId,
            partNo: 0,
            itemname: element.salesVoucherDetailsItemName,
            unit: unitName,
            qty: element.salesVoucherDetailsQuantity,
            retQtyTill: element.salesReturnQtyTill || 0,
            retQty: 0,
            rate: element.salesVoucherDetailsRate,
            grossAmt: 0,
            disc: 0,
            vatPer: 0,
            vatAmt: 0,
            netAmt: 0,
          });
        });
      });
  }
  displaySalesVoucher1() {
    this.salesapi.GetSalesVoucher().subscribe((data: any) => {
      this.salesVoucherarry = data.result;
      this.filterArray = data.result;
      this.displaySalesVoucher = true;
    });
  }

  displaySalesVoucherList() {
    this.state = {
      Dir: this.sortOrder[this.sortSalesVocuherColumn] || 'desc',
      Field: this.sortSalesVocuherColumn || 'salesVoucherDate',
      Skip: this.pageSize * (this.currentPage - 1),
      Take: this.pageSize,
      Search: this.globalSalesVoucherSearch,
      Filter: this.salesVoucherfilter,
      FromDate: this.salesVoucherFromDate,
      ToDate: this.salesVoucherToDate,
    };
    this.salesapi.GetSalesVoucherList(this.state).subscribe({
      next: (res) => {
        this.salesVoucherarry = res.result.data;
        this.filterArray = res.result.data;
        if (res.result.data.length > 0) {
          this.totalRecords = res.result.total;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
          this.pageDataSet[this.currentPage] = res.result.data;
        } else {
          this.totalRecords = res.result.total;
        }
        this.displaySalesVoucher = true;
      },
      error: (err) => {
        console.error('API error:', err);
        this.displaySalesVoucher = false;
        this.salesVoucherarry = [];
        this.totalRecords = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed to load sales vouchers. Please try again.',
        });
      },
      complete: () => {
        console.log('API call completed');
      },
    });
  }

  onChangeCustomer() {
    var customeObj = this.CustomerMasterArray?.find(
      (o) =>
        o.customerMasterCustomerNo ==
        this.salesReturnFormGroup.controls.salesReturnPartyId.value
    );
    if (customeObj) {
      this.salesReturnFormGroup.controls.salesReturnPartyNo.setValue(
        customeObj.customerMasterCustomerNo
      );
      this.salesReturnFormGroup.controls.salesReturnPartyTelNo.setValue(
        customeObj.customerMasterCustomerTel1
      );
      this.salesReturnFormGroup.controls.salesReturnPartyVatNo.setValue(
        customeObj.customerMasterCustomerVatNo
      );
    }
  }
  globalSearchSalesVoucher() {
    this.pageDataSet = [];
    this.currentPage = 1;
    this.ApplySalesVoucherFilter();
  }
  GetSaleVoucherList() {
    this.clearPagination();
    this.ApplySalesVoucherFilter();
  }

  ApplySalesVoucherFilter() {
    const voucherNo =
      this.SalesreturnFilterForm.controls.SalesreturnVoucherNo.value;
    const salesCustomer =
      this.SalesreturnFilterForm.controls.SalesreturnCustomer.value;
    const isDate = this.SalesreturnFilterForm.controls.isDate.value;
    const fromDate = this.SalesreturnFilterForm.controls.fromDate.value;
    const toDate = this.SalesreturnFilterForm.controls.toDate.value;

    let filters: string[] = [];

    // Voucher filter
    if (voucherNo) {
      filters.push(`SalesVoucherNo.Contains(\"${voucherNo}\")`);
    }
    // Customer filter
    if (salesCustomer && salesCustomer > 0) {
      filters.push(`SalesVoucherPartyId == \"${salesCustomer}\"`);
    }
    if (isDate && fromDate && toDate) {
      this.salesVoucherFromDate = this.utilityService.fromAndToDateformater(
        fromDate,
        'from'
      );
      this.salesVoucherToDate = this.utilityService.fromAndToDateformater(
        toDate,
        'to'
      );
    } else {
      this.salesVoucherFromDate = null;
      this.salesVoucherToDate = null;
    }

    // Combine with AND
    this.salesVoucherfilter = filters.join(' AND ');
    this.displaySalesVoucherList();
  }

  ClearFilter() {
    this.SalesreturnFilterForm.reset();
    this.salesVoucherarry = this.filterArray;
    this.SalesreturnFilterForm.get('fromDate').setValue(new Date());
    this.SalesreturnFilterForm.get('toDate').setValue(new Date());
  }
  onPageSizeChange(type: 'voucherList' | 'returnList') {
    this.pageDataSet = [];
    this.currentPage = 1;
    if (type == 'voucherList') this.ApplySalesVoucherFilter();
    else this.getAllSalesReturnList();
  }
  nextPage(type: 'voucherList' | 'returnList') {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.pageDataSet[this.currentPage]) {
        if (type === 'voucherList') {
          this.salesVoucherarry = this.pageDataSet[this.currentPage];
        } else if (type === 'returnList') {
          this.salesReturnarry = this.pageDataSet[this.currentPage];
        }
      } else {
        if (type == 'voucherList') this.ApplySalesVoucherFilter();
        else this.getAllSalesReturnList();
      }
    }
  }

  previousPage(type: 'voucherList' | 'returnList') {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.pageDataSet[this.currentPage]) {
        if (type === 'voucherList') {
          this.salesVoucherarry = this.pageDataSet[this.currentPage];
        } else {
          this.salesReturnarry = this.pageDataSet[this.currentPage];
        }
      } else {
        if (type == 'voucherList') this.ApplySalesVoucherFilter();
        else this.getAllSalesReturnList();
      }
    }
  }
  clearPagination() {
    this.pageSize = this.utilityService.pageOption[0];
    this.sortSalesReturnColumn = '';
    this.sortSalesVocuherColumn = '';
    this.globalSalesVoucherSearch = '';
    this.globalSalesReturnSearch = '';
    this.pageDataSet = [];
    this.sortOrder = {};
    this.totalPages = 0;
    this.totalRecords = 0;
    this.currentPage = 1;
  }
  SalesVoucherBtnRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';

    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.salesVoucherId != null) {
      // Create the button element
      const button = document.createElement('a');
      button.className = 'iconbton';
      button.innerHTML = '<i class="pi pi-pencil" ></i>';
      button.addEventListener('click', () => {
        this.ngZone.run(() => {
          this.displaySalesVoucher = false; // now Angular sees this
          this.SetSalesVoucherDetails(rowData.salesVoucherNo);
          this.clearPagination();
        });
      });

      // Append the button to the cell
      td.appendChild(button);
    }
    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }
  SalesReturnBtnRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';

    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.salesReturnId != null) {
      // Create the button element
      const button = document.createElement('a');
      button.className = 'iconbton';
      button.innerHTML = '<i class="pi pi-pencil" ></i>';
      button.addEventListener('click', () => {
        this.ngZone.run(() => {
          this.displayMaximizable = false;
          this.GetSavedSalesReturnDetails(rowData.salesReturnId);
          this.clearPagination();
        });
      });

      // Append the button to the cell
      td.appendChild(button);
    }
    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }



  printReport(): void {

  const rptFilter = {
    ReportName: 'crptSaleReturnReport',
    SelectionFormula: '',
    Parameters: [
      {
        Key: '@SalesReturnId',
        Value: this.savedSalesReturn?.salesReturnId || 0
      },
    
      {
        Key: 'CompanyName',
        Value: this.stationmasterObj.stationMasterStationName
      },
      {
        Key: 'CompanyAddress',
        Value: this.stationmasterObj.stationMasterAddress
      },
      {
        Key: 'Email',
        Value: this.stationmasterObj.stationMasterEmail
      },
      {
        Key: 'Fax',
        Value: this.stationmasterObj.stationMasterFax || ''
      },
      {
        Key: 'TRN',
        Value: ''
      }
    ],
    Queries: [], // agar finalQuery class variable hai to this.finalQuery likhen
    SP_Queries: []
  };

  console.log('Report Payload:', rptFilter);

  this.crystalReportService.getReportPrint(rptFilter, false)
    .subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl);
       // this.closeDialog.emit();
      },
      (error) => {
        console.error('Report Error:', error);
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
  retQtyTill: any;
  retQty?: any;
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
export const columnDetailList = (component: SalesreturnComponent) => [
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
    toolTip: 'Sales Return Detail ID',
  },
  {
    data: 'itemId',
    type: 'text',
    label: 'Code',
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
    label: 'Item Name',
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
    label: 'Sales Qty',
    toolTip: 'Sales Quantity',
    // readOnly: false,
  },
  {
    data: 'retQtyTill',
    type: 'numeric',
    label: 'Return Qty [Till]',
    toolTip: 'Return Quantity Till',
    // readOnly: false,
  },
  {
    data: 'retQty',
    type: 'numeric',
    label: 'Return Qty',
    toolTip: 'Return Quantity',
    readOnly: false,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Price',
    toolTip: 'Rate',
    readOnly: false,
  },
  {
    data: 'grossAmt',
    type: 'numeric',
    label: 'Gross Amt',
    toolTip: 'Gross Amount',
  },
  {
    data: 'disc',
    type: 'numeric',
    label: 'Disc.',
    toolTip: 'Discount',
    readOnly: false,
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
    toolTip: 'VAT Amount',
  },
  {
    data: 'netAmt',
    type: 'numeric',
    label: 'Net.Amt',
    toolTip: 'Net Amount',
  },
];

export const salesVoucherColumns = (component: SalesreturnComponent) => [
  { data: 'salesVoucherId', type: 'numeric', label: 'ID', toolTip: 'ID' },
  {
    data: 'salesVoucherNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Voucher Number',
  },
  {
    data: 'salesVoucherType',
    type: 'text',
    label: 'Voucher Type',
    toolTip: 'Voucher Type',
  },
  {
    data: 'salesVoucherPartyId',
    type: 'text',
    label: 'Party Id',
    toolTip: 'Party Id',
  },
  {
    data: 'salesVoucherPartyName',
    type: 'text',
    label: 'Party Name',
    toolTip: 'Party Name',
  },
  {
    data: 'salesVoucherDate',
    type: 'text',
    label: 'Voucher Date',
    toolTip: 'Voucher Date',
  },
  {
    data: 'action',
    label: 'Action',
    renderer: component.SalesVoucherBtnRenderer.bind(component),
  },
];
export const salesReturnColumns = (component: SalesreturnComponent) => [
  {
    data: 'salesReturnNo',
    type: 'text',
    label: 'Return No',
    toolTip: 'Return Number',
  },
  {
    data: 'salesReturnDate',
    type: 'date',
    label: 'Return Date',
    toolTip: 'Return Date',
  },
  {
    data: 'salesReturnSVNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Voucher Number',
  },
  {
    data: 'salesReturnPartyName',
    type: 'text',
    label: 'Customer',
    toolTip: 'Customer Name',
  },
  {
    data: 'salesReturnCurrencyName',
    type: 'text',
    label: 'Currency',
    toolTip: 'Currency Type',
  },
  {
    data: 'salesReturnType',
    type: 'text',
    label: 'Invoice Type',
    toolTip: 'Invoice Type',
  },
  {
    data: 'salesReturnTotalGrossAmount',
    type: 'numeric',
    label: 'Gross Amt',
    toolTip: 'Gross Amount',
  },
  {
    data: 'salesReturnTotalItemDisAmount',
    type: 'numeric',
    label: 'Disc Amt',
    toolTip: 'Discount Amount',
  },
  {
    data: 'salesReturnNetAmount',
    type: 'numeric',
    label: 'Net Amt',
    toolTip: 'Net Amount',
  },
  {
    data: 'action',
    label: 'Action',
    renderer: component.SalesReturnBtnRenderer.bind(component),
  },
];
