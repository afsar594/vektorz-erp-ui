import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { DepartmentMaster } from 'src/app/routes/domain/Masters/DepartmentMaster';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { timer, Observable } from 'rxjs';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { IssueVoucher } from 'src/app/routes/domain/Sales/IssueVoucher';
import { IssueVoucherDetails } from 'src/app/routes/domain/Sales/IssueVoucherDetails';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { TranslateService } from '@ngx-translate/core';
import { PurchaseRequisitionStatusComponent } from '../purchase-requisition-status/purchase-requisition-status.component';
import { DialogService } from 'primeng';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ExportFormatType, ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';

@Component({
  selector: 'app-issuevoucher',
  templateUrl: './issuevoucher.component.html',
  styleUrls: ['./issuevoucher.component.scss'],
})
export class IssuevoucherComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('hotTable') hotTable: ElementRef;
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
  displayVoucherlist: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  brandArry: VendorMaster[] = [];
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

  ItemMasterArrayByName: any = null;
  funitid: number;

  DefCurrency: string;
  DefCurCheck: string;

  DefLocCheck: string;
  DefLocid: string;
  DefCostCenterCheck: String;
  DrAccNo: string;
  CrAccNo: string;

  unitAry: any;
  unitListt: any;
  units: any;

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

  departmentArray: DepartmentMaster[] = [];
  departmentList: SelectItem[] = [];
  departmentArry: string[] = [];

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  accountTransactionList: AccountsTransactions[] = [];
  issueVoucherarry: IssueVoucher[] = [];
  // savedIssueVoucherGridData: GridData[] = [];
  savedIssueVoucher: IssueVoucher;
  issueVoucher: any;

  pagedRequest: PagedRequest;

  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  displayPrintPreview: boolean = false;
  JOBCOST: Boolean = false;
  DefCostCenterId: any;
  ScreenId: number;
  width = `50%`;
  Permission: any;
  purchasevoucherarry: any;
  colsPV: any;
  filterArray: any;
  voucherId: any;
  user: any;
  unitDetailID: any;
  selestedReq: any = [];
  pvslue: any = 0;
  browsebutton: boolean = true;
  costcenterSetting: any;
  loadList: any;
  isServerSearch = false;
  pdfSource: string | URL | undefined;
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
  hotid2 = 'voucherlist';
  // private hotRegisterer = new HotTableRegisterer();
  voucherlist: Handsontable.GridSettings;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    public dialogService: DialogService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private Procurementapi: ProcurementApiService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private salesapi: SalesApiService,
    private permission: PermissionsService,
    private procurement: ProcurementApiService,
    private accSettingApi: AccountApiService,
        public crystalReportService: CrystalReportService,

  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'issuevoucher_HotEntry';
  issuevoucher_entry: Handsontable.GridSettings;
  issueVoucherFormGroup: FormGroup;
  locationLocked = false;
  issuevoucher_entryDataset = [];
  cols;
  issueVoucherFilterForm: FormGroup;
  ngAfterViewInit() {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
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
        this.GetSavedIssueVoucherDetails(this.voucherId);
      }
    });
    this.activeRow = { row: 0, column: 0 };
    this.FILL_COMBO();
    this.colsPV = [
      { field: 'purchaseVoucherVoucherNo', header: 'Voucher No' },
      { field: 'purchaseVoucherPurchaseDate', header: 'Date' },
      { field: 'purchaseVoucherPartyID', header: 'Party' },
      { field: 'purchaseVoucherCurrencyID', header: 'Currency' },
      // { field: 'purchaseVoucherDescription', header: 'Narration' },
      { field: 'purchaseVoucherTotalGrossAmt', header: 'Gross.Amt' },
      { field: 'purchaseVoucherTotalDisAmount', header: 'Disc.Amt' },
      { field: 'purchaseVoucherVATAmount', header: 'Vat.Amt' },
      { field: 'purchaseVoucherVatRoundSign', header: 'Round.Sign' },
      { field: 'purchaseVoucherVatRoundAmount', header: 'Round.Amt' },
      { field: 'purchaseVoucherNetAmount', header: 'Net.Amt' },
      { field: 'view', header: 'View' },
    ];
    this.issueVoucherFilterForm = this.fb.group({
      filterissueVoucherCurrency: [null],
      filterissueVoucherjob: [null],
      filterissueVoucherNo: [null],
      isDate: [false],
      fromDate: [new Date()],
      toDate: [new Date()],
    });

    this.cols = [
      { field: 'issueVoucherNo', header: 'Voucher No' },
      { field: 'issueVoucherDate', header: 'Date' },
      { field: 'issueVoucherJobId', header: 'Job' },
      { field: 'issueVoucherCurrencyId', header: 'Currency' },
      { field: 'issueVoucherDescription', header: 'Narration' },
      { field: 'issueVoucherTotalGrossAmount', header: 'Gross.Amt' },
      // { field: 'issueVoucherTotalDisAmount', header: 'Disc.Amt' },
      // { field: 'issueVoucherVatAmt', header: 'Vat.Amt' },
      // { field: 'issueVoucherVatRoundSign', header: 'Round.Sign' },
      // { field: 'issueVoucherVatRountAmt', header: 'Round.Amt' },
      { field: 'issueVoucherNetAmount', header: 'Net.Amt' },
      { field: 'View', header: 'View' },
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
    this.browsebutton = true;
    this.issueVoucherFormGroup = this.fb.group({
      issueVoucherId: [0],
      issueVoucherNo: [{ value: '', disabled: true }],
      issueVoucherDate: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      issueVoucherRefNo: [{ value: '', disabled: true }],
      issueVoucherIvNoForRet: [{ value: '', disabled: true }],
      issueVoucherCurrencyId: [-1],
      issueVoucherIvDateForRet: [{ value: false, disabled: true }],
      issueVoucherCreditAccNo: [-1, []],
      issueVoucherDepartmentId: [-1, []],
      issueVoucherBufferRemark1: [{ value: '', disabled: true }],
      issueVoucherCostCenterId: [-1, []],
      issueVoucherDebitAccNo: [-1, []],
      issueVoucherDescription: [{ value: '', disabled: true }],
      issueVoucherGrno: [{ value: null, disabled: true }],
      issueVoucherGrdate: [{ value: null, disabled: true }],
      issueVoucherLpono: [{ value: null, disabled: true }],
      issueVoucherLpodate: [{ value: null, disabled: true }],
      issueVoucherQtnNo: [{ value: null, disabled: true }],
      issueVoucherQtnDate: [{ value: null, disabled: true }],
      issueVoucherReqNo: [{ value: null, disabled: true }],
      issueVoucherReqDate: [{ value: null, disabled: true }],
      issueVoucherDayBookNo: [{ value: null, disabled: true }],
      issueVoucherJobId: [-1],
      issueVoucherLocationId: [-1],
      issueVoucherTotalGrossAmount: [{ value: [0], disabled: true }],
      issueVoucherTotalItemDisAmount: [{ value: [0], disabled: true }],
      issueVoucherTotalDisPer: [{ value: [0], disabled: true }],
      issueVoucherTotalDisAmount: [{ value: [0], disabled: true }],
      issueVoucherVatPer: [{ value: [5], disabled: true }],
      issueVoucherVatAmt: [{ value: [0], disabled: true }],
      issueVoucherTotalActualAmount: [{ value: [0], disabled: true }],
      issueVoucherVatRoundSign: [{ value: '-', disabled: true }],
      issueVoucherVatRountAmt: [{ value: [0], disabled: true }],
      issueVoucherNetAmount: [{ value: [0], disabled: true }],
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
    return this.issueVoucherFormGroup.controls;
  }

  getDefaultAcc() {
    this.accSettingApi.getDefaultAcc().subscribe((res: any) => {
      const list = res.resultSet;
      const stock = list?.find(
        (i) => i?.accountSettingsAccountKeyValue.trim() == 'STOCK_AC_NO'
      )?.accountSettingsAccountTextValue;

      const splitText = stock?.split('::');
      this.f.issueVoucherDebitAccNo.setValue(splitText[1].trim());
      const COFG = list?.find(
        (i) =>
          i?.accountSettingsAccountKeyValue.trim() ==
          'COSTOF_FINISHEDGOODS_AC_NO'
      )?.accountSettingsAccountTextValue;

      const splitTextCOFG = COFG?.split('::');
      this.f.issueVoucherCreditAccNo.setValue(splitTextCOFG[1].trim());
      this.accountList?.unshift({
        label: splitTextCOFG[0]?.trim(),
        value: splitTextCOFG[1]?.trim(),
      });
    });
  }

  filter() {
    let filteredArray = this.filterArray;
    if (this.issueVoucherFilterForm.value.filterissueVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.issueVoucherNo ===
          this.issueVoucherFilterForm.value.filterissueVoucherNo
      );
    }

    if (
      this.issueVoucherFilterForm.value.filterissueVoucherjob != null &&
      this.issueVoucherFilterForm.value.filterissueVoucherjob !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.issueVoucherJobId ===
          this.issueVoucherFilterForm.value.filterissueVoucherjob
      );
    }

    if (this.issueVoucherFilterForm.value.isDate) {
      const fromDateStr = this.issueVoucherFilterForm.value.fromDate;
      const toDateStr = this.issueVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.issueVoucherDate);
        // Parse the fromDate and toDate strings as Date objects
        const fromDate = new Date(fromDateStr); // Ensure fromDateStr is in a valid date format
        const toDate = new Date(toDateStr); // Ensure toDateStr is in a valid date format
        // Set time to midnight for all date comparisons
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        // Compare the dates directly, not as formatted strings
        return voucherDate >= fromDate && voucherDate <= toDate;
      });
    }
    this.issueVoucherarry = filteredArray;
  }

  ClearFilter() {
    this.issueVoucherFilterForm.reset();
    this.issueVoucherarry = this.filterArray;
    this.issueVoucherFilterForm.get('fromDate').setValue(new Date());
    this.issueVoucherFilterForm.get('toDate').setValue(new Date());
  }

  isCallDDLs: boolean = false;
  callDropdowns(reload: any) {
    if (!this.isCallDDLs || reload) {
      this.LoadJobDDL();
      this.LoadItemDDL();
      this.LoadUnitDDL();
      this.LoadCurrancyDDL();
      this.LoadLocationDDL();
      this.LoadDepartmentDD();
      this.LoadCostCentreDDL();
      this.getAllAccount();
      this.isCallDDLs = true;
    }
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
  LoadCostCentreDDL() {
    this.accountapi.LoadDropdowncostcenterMasters().subscribe((m) => {
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
    });
  }

  LoadLocationDDL() {
    this.accountapi.LoadDropdownLocationMaster().subscribe((r) => {
      const list = r?.resultSet?.locationMaster ?? [];
      this.loadList = r?.resultSet;
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = list.map((ar) =>
        ar.locationMasterLocationName?.trim()
      );
      this.locationLocked = this.utilityService.applyLocationLock(
        this.issueVoucherFormGroup,
        'issueVoucherLocationId'
      );
    });
  }
  LoadCurrancyDDL() {
    this.accountapi.LoadDropdowCurrencyMaster().subscribe((r) => {
      this.loadList = r.resultSet;
      if (this.loadList.currencyMasters) {
        // this.currency = this.loadList.currencyMasters;
        this.currencyList = this.loadList.currencyMasters.map((kl) => ({
          label: kl.currencyMasterCurrencyName,
          value: kl.currencyMasterCurrencyId,
        }));
        this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
        this.currArry = this.loadList.currencyMasters.map((ar) =>
          ar.currencyMasterCurrencyName.trim()
        );
      }
    });
  }
  LoadJobDDL() {
    this.accountapi.LoadDropdowjobMasters().subscribe((r) => {
      this.loadList = r.resultSet;
      if (this.loadList.jobMasters) {
        this.jobArray = this.loadList.jobMasters;
        this.jobList = this.loadList.jobMasters.map((kl) => ({
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

  LoadUnitDDL() {
    this.accountapi.LoadDropdownunitMasters().subscribe((r) => {
      this.loadList = r.resultSet;
      if (this.loadList.unitMasters) {
        this.units = this.loadList.unitMasters;
        this.unitList = this.loadList.unitMasters;
        this.unitListt = this.loadList.unitMasters.map((kl) => ({
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

  initializeControls() {
    const hiddenColumns = [0,1, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18];
    this.issuevoucher_entry = this.utilityService.getTableConfig(
      issueVoucherColumnObjList(this),
      hiddenColumns
    );

    this.issuevoucher_entry.afterSelection = (row, column) => {
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      if (column === 2 && this.issuevoucher_entry.readOnly === false) {
        // this.lookupGridColumns = ['BarCode', 'Brand', 'Item', 'ItemID', 'Size']
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item', 'ItemID'];

        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.onSearch('');
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.issuevoucher_entry.readOnly === false) {
        this.isServerSearch = false;
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.getUnitByItemId(data[0]);
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 12 && this.issuevoucher_entry.readOnly === false) {
        this.isServerSearch = false;
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else {
        this.showSalesLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.storeandwarehouses == x);
      } else {
        this.selectItem = {};
      }
    };

    this.issuevoucher_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showSalesLookUp = false;
      if (change[0][1] === 0) {
        this.showSalesLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.issuevoucher_entry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);
        // if (data[0] && data[4] != null) {

        //   if (change[0][1] && this.pvslue !=data[4]) {

        //     this.GetAveragePurchasePriceGPC(data[0], data[4]);
        //   }
        // }
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

    this.issuevoucher_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum();
      this.GetTotal();
    };

    this.issuevoucher_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  GetAveragePurchasePriceGPC(id, qty) {
    this.pvslue = qty;
    var unitDetailId = this.unitDetailID;
    let req = {
      itemId: id ? id : 0,
      unitDetailId: unitDetailId ? unitDetailId : 0,
      quantity: qty ? qty : 0,
    };
    this.masterapi.GetAveragePurchasePriceGPC(req).subscribe((res: any) => {
      // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 5, res.result);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 18, res.result);
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'IssueVoucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.issueVoucherFormGroup.get('issueVoucherNo').value,
      vpType: 'IssueVoucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  printAsPDF() {
    const fileName = String(new Date().valueOf());
    var css: string = `
.inputGroup {
      margin: 2px 0;
    }

    .date {
      width: 32%;
    }
    .address{
      padding-top: 10px;
      padding-bottom: 10px;
      padding-left: 20px;
    }
    .w-100 {
      width: 100%;
    }
    .flex {
      display: flex;
      margin-bottom: 5px;
      gap: 4px; /* Adjusted the gap value here */
     }
     h2{
      margin: 0;
     }
     h3{
      margin: 0;
     }
    .contain1{
     width: 25%;
    border-radius: 1px;
    padding-bottom: 0%;
    padding: 8px;
    text-align: end;
    }
      .contain2{
        width: 74%;
        border-radius: 1px;
        padding-bottom: 0%;
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
      width: 220px;
    }
    .bank1 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49%;
      margin-bottom: 5px;
      border-radius: 1px;
      padding: 8px;
      margin-top: 5px;
       padding-bottom: 0%;
        box-shadow: 5px 5px rgb(201, 204, 204);
    }
    .p-0 {
      padding: 0;
    }

    .grid {
      max-height: 500px;
      overflow: auto;
    }

    .f-r {
      float: right;
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


    .end {
      text-align: end;
    }
.center {
  text-align: center !important;
}
    .print {
      height: 100vh;
      width: 90%;
      margin: auto !important;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .borderP {
      border: .5px solid rgb(201, 204, 204);
      border-radius: 2px;
      margin-bottom: 10px;
      padding: 20px;
      margin-top: -17px;;
      box-shadow: 5px 5px rgb(201, 204, 204);
    }
    #customers {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 5px;
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
    .SvTotal{
      justify-content: end;
      margin: 5px;
      padding: 5px;
      display: flex;
      background-color: #fff;
      gap: 30px;
      width: 84%;
    }
    .SvTotalC{
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      text-align: start;
      gap: 10px;
    }
      .flexcol{
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
    }
    .signature-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .customer-signature {
        order: 1;
        /* Specifies the order of the flex items */
      }

    .authorized-signature {
        order: 2;
        /* Specifies the order of the flex items */
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

    @media print {
      thead {display: table-header-group;}
      tfoot {display: table-footer-group;}
      table { page-break-inside:auto ;
        font-size: 11px;}
      tr { page-break-inside:avoid; page-break-after:auto }

      body {margin: 0;}

      // img {
      //     width: 140px;
      //     height: 100px;
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
      .print.page {
        page-break-after: always; /* Force page break after content */
        font-size: 12px;
      }

      @page :last {
        .page-footer {
           position: fixed;
          bottom: 0;
          width: 100%;
        }
      }
.conditions {
  margin-left: 0%;
  margin-top: 10px;
}
  .row {
  display: flex;
  margin-left: 0%;
  gap: 0px;
}
  .col1 {
  border: 1px solid #ccc;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  width: 49.5%;
  padding-left: 10px;
}
  .col2 {
  border: 1px solid #ccc;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  width: 50.5%;
  padding-left: 10px;
}



    }

    `;
    this.printService.PrintPDF('printPDF', css);
    this.userTrackingLog('PDF'); // this.fileSaverService.saveAsPDF(data, 'GRN_Report_' + String(this.dateToday));
  }

  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
    // this.dataset
  }

  ColumnSum() {
    var disc = 0;
    this.issuevoucher_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.disc) {
        disc += elemt.disc;
      }
    });
    disc = parseFloat(disc.toFixed(2));
    this.issueVoucherFormGroup.controls.issueVoucherTotalItemDisAmount.setValue(
      disc
    );

    var value = 0;
    this.issuevoucher_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.netAmt) {
        value += elemt.netAmt;
      }
    });
    value = parseFloat(value.toFixed(2));
    this.issueVoucherFormGroup.controls.issueVoucherTotalGrossAmount.setValue(
      value
    );

    this.GetTotal();
  }

  CalcDiscFromPer() {
    this.issueVoucherFormGroup.controls.issueVoucherTotalDisAmount.setValue(
      (Number(this.issueVoucherFormGroup.value.issueVoucherTotalGrossAmount) *
        Number(this.issueVoucherFormGroup.value.issueVoucherTotalDisPer)) /
        100
    );
    this.GetTotal();
  }

  CalcDiscFromAmt() {
    this.issueVoucherFormGroup.controls.issueVoucherTotalDisPer.setValue(
      (Number(this.issueVoucherFormGroup.value.issueVoucherTotalDisAmount) *
        100) /
        Number(this.issueVoucherFormGroup.value.issueVoucherTotalGrossAmount)
    );
    this.GetTotal();
  }
  onSearch(term: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
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
  LoadItemDDL() {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: '',
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
    });
  }

  GetTotal($event = null) {
    if (this.issueVoucherFormGroup.value.issueVoucherIvDateForRet == true) {
      this.issueVoucherFormGroup.value.issueVoucherVatPer = 0;
    } else {
      this.issueVoucherFormGroup.value.issueVoucherVatPer = 5;
    }

    this.issueVoucherFormGroup.controls.issueVoucherTotalActualAmount.setValue(
      Number(this.issueVoucherFormGroup.value.issueVoucherTotalGrossAmount) -
        Number(this.issueVoucherFormGroup.value.issueVoucherTotalDisAmount)
    );

    this.issueVoucherFormGroup.controls.issueVoucherVatAmt.setValue(
      (Number(this.issueVoucherFormGroup.value.issueVoucherTotalActualAmount) *
        Number(this.issueVoucherFormGroup.value.issueVoucherVatPer)) /
        100
    );
    if (this.issueVoucherFormGroup.value.issueVoucherVatRoundSign == '+') {
      this.issueVoucherFormGroup.controls.issueVoucherNetAmount.setValue(
        Number(this.issueVoucherFormGroup.value.issueVoucherTotalActualAmount) +
          Number(this.issueVoucherFormGroup.value.issueVoucherVatAmt) +
          Number(this.issueVoucherFormGroup.value.issueVoucherVatRountAmt)
      );
    } else if (
      this.issueVoucherFormGroup.value.issueVoucherVatRoundSign == '-'
    ) {
      this.issueVoucherFormGroup.controls.issueVoucherNetAmount.setValue(
        Number(this.issueVoucherFormGroup.value.issueVoucherTotalActualAmount) +
          Number(this.issueVoucherFormGroup.value.issueVoucherVatAmt) -
          Number(this.issueVoucherFormGroup.value.issueVoucherVatRountAmt)
      );
    } else {
      this.issueVoucherFormGroup.value.issueVoucherVatRoundSign = '-';
    }
  }
  GetCurrency(id) {
    const currency = this.currencyList?.find((res) => res.value === id);
    return currency ? currency.label : null;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      storeandwarehouses: kl.itemMasterItemName,
      storeandwarehousesid: kl?.itemMasterItemId,
      barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
      // size: kl?.itemMasterItemSize,
      // brand: this.brandArry?.find(
      //   (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
      // )?.vendorMasterVendorName
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      storeandwarehouses: kl.unitMasterUnitShortName,
      storeandwarehousesid: kl.unitMasterUnitId,
    }));
  }

  saveIssueVoucher() {
    const savedData: any = this.issuevoucher_entry.data?.filter((k) =>
      k.hasOwnProperty('itemname')
    );

    const issueVoucher_Save: IssueVoucher = this.issueVoucherFormGroup
      .value as IssueVoucher;

    issueVoucher_Save.issueVoucherId = Number(
      this.issueVoucherFormGroup.value.issueVoucherId
    );

    issueVoucher_Save.issueVoucherNo =
      this.issueVoucherFormGroup.getRawValue().issueVoucherNo;
    issueVoucher_Save.issueVoucherDate =
      this.issueVoucherFormGroup.value.issueVoucherDate;
    issueVoucher_Save.issueVoucherRefNo =
      this.issueVoucherFormGroup.value.issueVoucherRefNo;
    issueVoucher_Save.issueVoucherIvNoForRet =
      this.issueVoucherFormGroup.value.issueVoucherIvNoForRet;
    issueVoucher_Save.issueVoucherCurrencyId =
      this.issueVoucherFormGroup.value.issueVoucherCurrencyId;
    issueVoucher_Save.issueVoucherIvDateForRet =
      this.issueVoucherFormGroup.value.issueVoucherIvDateForRet;

    issueVoucher_Save.issueVoucherCreditAccNo =
      this.issueVoucherFormGroup.value.issueVoucherCreditAccNo;

    issueVoucher_Save.issueVoucherDepartmentId =
      this.issueVoucherFormGroup.value.issueVoucherDepartmentId;
    issueVoucher_Save.issueVoucherBufferRemark1 =
      this.issueVoucherFormGroup.value.issueVoucherBufferRemark1;
    // issueVoucher_Save.issueVoucherBufferRemark1 = 'PARTY NAME';
    issueVoucher_Save.issueVoucherCostCenterId =
      this.issueVoucherFormGroup.value.issueVoucherCostCenterId;
    issueVoucher_Save.issueVoucherDebitAccNo =
      this.issueVoucherFormGroup.value.issueVoucherDebitAccNo;
    issueVoucher_Save.issueVoucherDescription =
      this.issueVoucherFormGroup.value.issueVoucherDescription;

    issueVoucher_Save.issueVoucherGrno =
      this.issueVoucherFormGroup.value.issueVoucherGrno;
    issueVoucher_Save.issueVoucherGrdate =
      this.issueVoucherFormGroup.value.issueVoucherGrdate;
    issueVoucher_Save.issueVoucherLpono =
      this.issueVoucherFormGroup.value.issueVoucherLpono;
    issueVoucher_Save.issueVoucherLpodate =
      this.issueVoucherFormGroup.value.issueVoucherLpodate;
    issueVoucher_Save.issueVoucherQtnNo =
      this.issueVoucherFormGroup.value.issueVoucherQtnNo;
    issueVoucher_Save.issueVoucherQtnDate =
      this.issueVoucherFormGroup.value.issueVoucherQtnDate;

    issueVoucher_Save.issueVoucherReqNo =
      this.issueVoucherFormGroup.value.issueVoucherReqNo;
    issueVoucher_Save.issueVoucherReqDate =
      this.issueVoucherFormGroup.value.issueVoucherReqDate;
    issueVoucher_Save.issueVoucherDayBookNo =
      this.issueVoucherFormGroup.value.issueVoucherDayBookNo;
    issueVoucher_Save.issueVoucherLocationId =
      this.issueVoucherFormGroup.get('issueVoucherLocationId')?.value;
    issueVoucher_Save.issueVoucherJobId =
      this.issueVoucherFormGroup.value.issueVoucherJobId;

    issueVoucher_Save.issueVoucherTotalGrossAmount = Number(
      this.issueVoucherFormGroup.value.issueVoucherTotalGrossAmount
    );
    issueVoucher_Save.issueVoucherTotalItemDisAmount = Number(
      this.issueVoucherFormGroup.value.issueVoucherTotalItemDisAmount
    );
    issueVoucher_Save.issueVoucherTotalDisPer = Number(
      this.issueVoucherFormGroup.value.issueVoucherTotalDisPer
    );
    issueVoucher_Save.issueVoucherTotalDisAmount = Number(
      this.issueVoucherFormGroup.value.issueVoucherTotalDisAmount
    );
    issueVoucher_Save.issueVoucherVatPer = Number(
      this.issueVoucherFormGroup.value.issueVoucherVatPer
    );
    issueVoucher_Save.issueVoucherVatAmt = Number(
      this.issueVoucherFormGroup.value.issueVoucherVatAmt
    );
    issueVoucher_Save.issueVoucherTotalActualAmount = Number(
      this.issueVoucherFormGroup.value.issueVoucherTotalActualAmount
    );
    // issueVoucher_Save.issueVoucherVatRoundSign = this.issueVoucherFormGroup.value.issueVoucherVatRoundSign.name;
    issueVoucher_Save.issueVoucherVatRoundSign =
      this.issueVoucherFormGroup.value.issueVoucherVatRoundSign;
    issueVoucher_Save.issueVoucherVatRountAmt = Number(
      this.issueVoucherFormGroup.value.issueVoucherVatRountAmt
    );
    issueVoucher_Save.issueVoucherNetAmount = Number(
      this.issueVoucherFormGroup.value.issueVoucherNetAmount
    );
      debugger;

    issueVoucher_Save.accountsTransactions = [];
    issueVoucher_Save.issueVoucherDetails = savedData
      ?.filter((k) => k.itemname != null && k.netAmt != null)
      .map((k: any) => {
        console.log('Mapping item:', k); // Debug log to check the item being mapped
        return {
          issueVoucherDetailsId: k.id != null ? k.id : 0,
          issueVoucherDetailsNo:
            this.issueVoucherFormGroup.getRawValue().issueVoucherNo,

          // issueVoucherId: 0,
          issueVoucherDetailsMatId:Number( k.itemId)??0,
            // k.itemname != null && k.itemname !== ''
            //   ? this.ItemMasterArray?.find(
            //       (j) => j.itemMasterItemName?.trim() === k.itemname?.trim()
            //     )?.itemMasterItemId
            //   : null,
           issueVoucherDetailsItemName: k.itemname,
          issueVoucherDetailsQuantity: k.qty,
          issueVoucherDetailsDiscAmount: k.disc,
          issueVoucherDetailsRate: k.rate,
          issueVoucherDetailsNetAmt: k.netAmt,
          issueVoucherDetailsGrossAmount: 0,
          issueVoucherDetailsRemarks: k.narration,
          issueVoucherDetailsSno: 0,
          issueVoucherDetailsSalesPrice: k.Costprice ? k.Costprice : 0,
          issueVoucherDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                  (j) => j.unitMasterUnitShortName?.trim() === k.unit?.trim()
                )?.unitMasterUnitId
              : null,
          issueVoucherDetailsDelStatus: false,
          IssueVoucherDetailsReqDId: k.srdid,
          IssueVoucherDetailsReqId: k.srid,
          issueVoucherDetailsJobID:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                  ?.value
              : null,
        };
      });

    // });

    if (this.btnFlag.save) {
      debugger;
      this.saveVoucher(issueVoucher_Save);
    } else {
      issueVoucher_Save.accountsTransactions
        ?.filter((x) => x.accountsTransactionsTransSno != 0)
        .forEach((element, index, arry) => {
          arry[index].accountstransactionsDelStatus = true;
        });

      this.updateVoucher(issueVoucher_Save);
    }
  }

  validateTotalDrCrAmounts(): boolean {
    if (
      this.issueVoucherFormGroup.getRawValue().issueVoucherTotalGrossAmount ==
        0 &&
      this.issueVoucherFormGroup.getRawValue().issueVoucherTotalItemDisAmount ==
        0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Gross Amount Is Zero',
      });
      return false;
    }

    //  if(this.issueVoucherFormGroup.getRawValue().issueVoucherTotalGrossAmount==0){
    //   this.messageService.add({severity: 'error', summary: 'Alert', detail: 'Total Gross Amount Is Zero'});
    //   return false;
    // }

    return true;
  }

  saveVoucher(issueVoucher_Save: IssueVoucher) {
    if (this.issueVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.salesapi.InsertIssueVoucher(issueVoucher_Save).subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: false,
                  delete: true,
                  new: true,
                };
                this.savedIssueVoucher = data.result;

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
                  detail: ' Save Failed',
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
      this.issueVoucherFormGroup.markAllAsTouched();
      this.issueVoucherFormGroup.markAsDirty();
    }
  }
  get jobSetLookup() {
    return this.jobList.map((kl) => ({
      job: kl.label,
      jobId: kl.value,
    }));
  }
  public getjobName(unit: number): string {
    return this.jobArray?.find((j) => j.jobMasterJobId === unit)
      ?.jobMasterJobName;
  }
  updateVoucher(issueVoucher_Save: IssueVoucher) {
    if (this.issueVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.salesapi.UpdateIssueVoucher(issueVoucher_Save).subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: false,
                  delete: true,
                  new: true,
                };
                this.updateFormGrid(data.result);
                this.userTrackingLog('Update');

                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Issue Voucher Updated Succesfully',
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Issue Voucher Update Failed',
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
      this.issueVoucherFormGroup.markAllAsTouched();
      this.issueVoucherFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllIssueVoucher() {
    this.salesapi.GetIssueVoucher().subscribe((data) => {
      this.issueVoucherarry = data.result;
      this.issueVoucher = data.result;
      this.filterArray = data.result;
    });
  }

  getDefaultCostCenter() {
    this.masterapi
      .GetGeneralSettingbyKey('COSTCENTER_AGAINST_BOQ')
      .subscribe((data) => {
        if (data !== null) {
          this.DefCostCenterCheck = data.result[0]?.generalSettingsTextValue;
          if (
            this.DefCostCenterCheck !== null &&
            this.DefCostCenterCheck !== undefined
          ) {
            const splitText = this.DefCostCenterCheck.split('::');
            this.DefCostCenterId = Number(splitText[1]?.trim());
            this.f.issueVoucherCostCenterId.setValue(
              Number(this.DefCostCenterId)
            );
          }
        }
      });
  }

  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.issueVoucherCurrencyId.setValue(Number(this.DefCurrency));
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
            this.f.issueVoucherLocationId.setValue(Number(this.DefLocid));
          }
        }
      }

      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;

      this.JOBCOST = jobcal == true ? true : false;
    });
  }
  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j?.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  public getItemMasterName(itemMasterItemId: number): string {
    const item = this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    );
    if (item) {
      return item.itemMasterItemName;
    } else {
      return ''; // or handle the case when item is not found
    }
  }
  public getUnitName(unit: number): string {
    const foundUnit = this.unitListt?.find((j) => j.value === unit);
    if (foundUnit) {
      return foundUnit.label;
    } else {
      return ''; // or handle the case when the unit is not found
    }
  }
  public getLocationName(Loc: number): string {
    const foundLoc = this.locationArray?.find(
      (j) => j.locationMasterLocationId === Loc
    );
    if (foundLoc) {
      return foundLoc.locationMasterLocationName;
    } else {
      return ''; // or handle the case when the unit is not found
    }
  }
  public getDepartmentName(id: number): string {
    const foundLoc = this.departmentList?.find((j) => j?.value === id);
    if (foundLoc) {
      return foundLoc?.label == '--Select Department--' ? '' : foundLoc?.label;
    } else {
      return ''; // or handle the case when the unit is not found
    }
  }
  public getJobName(job: number): string {
    const foundLoc = this.jobArray?.find((j) => j.jobMasterJobId === job);
    if (foundLoc) {
      return foundLoc.jobMasterJobName;
    } else {
      return ''; // or handle the case when the unit is not found
    }
  }
  public getJobNamebyid(job: number): string {
    const foundLoc = this.jobList?.find((j) => j.value === job);
    if (foundLoc) {
      return foundLoc.label;
    } else {
      return ''; // or handle the case when the unit is not found
    }
  }

  new() {
    this.browsebutton = false;
    this.selestedReq = [];
    this.activeRow.row = 0;
    this.issueVoucherFormGroup.reset();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.issueVoucherFormGroup,
        'issueVoucherLocationId'
      );
    }
    this.issueVoucherFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.issueVoucherFormGroup,
      'issueVoucherLocationId',
      this.locationLocked
    );
    this.issuevoucher_entry.data = [];
    this.issuevoucher_entry.readOnly = false;
    this.issueVoucherFormGroup.controls.issueVoucherVatRoundSign.setValue('-');
    this.accountTransactionList = [];
    this.selestedReq = [];
    this.issueVoucherFormGroup.get('issueVoucherId').setValue(null);
    this.issueVoucherFormGroup.get('issueVoucherDepartmentId').setValue(-1);
    this.issueVoucherFormGroup.get('issueVoucherJobId').setValue(-1);
    this.issueVoucherFormGroup.get('issueVoucherCurrencyId').setValue(-1);
    if (!this.locationLocked) {
      this.issueVoucherFormGroup.get('issueVoucherLocationId').setValue(-1);
    }
    this.issueVoucherFormGroup.get('issueVoucherDate').setValue(new Date());
    this.issueVoucherFormGroup.get('issueVoucherReqDate').setValue(new Date());
    this.issueVoucherFormGroup.get('issueVoucherGrdate').setValue(new Date());
    this.issueVoucherFormGroup.get('issueVoucherLpodate').setValue(new Date());
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.callDropdowns(false);
    this.index = 0;
    this.GetDefaultSettings();
    this.getDefaultAcc();
    this.f.issueVoucherNo.clearValidators();
    this.issueVoucherFormGroup.updateValueAndValidity();
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.issuevoucher_entry);
    this.getDefaultCostCenter();
  }

  showMaximizableDialog() {
    this.callDropdowns(false);
    this.getAllIssueVoucher();
    this.displayMaximizable = true;
  }

  updateFormGrid(issuevoucher_update: IssueVoucher) {
    this.browsebutton = true;
    this.issueVoucherFormGroup.patchValue({
      issueVoucherId: issuevoucher_update.issueVoucherId,
      issueVoucherNo: issuevoucher_update.issueVoucherNo,
      issueVoucherDate: new Date(issuevoucher_update.issueVoucherDate),
      issueVoucherRefNo: issuevoucher_update.issueVoucherRefNo,
      issueVoucherIvNoForRet: issuevoucher_update.issueVoucherIvNoForRet,
      issueVoucherCurrencyId: issuevoucher_update.issueVoucherCurrencyId,
      issueVoucherIvDateForRet: new Date(
        issuevoucher_update.issueVoucherIvDateForRet
      ),

      issueVoucherCreditAccNo: issuevoucher_update.issueVoucherCreditAccNo,
      issueVoucherDepartmentId: issuevoucher_update.issueVoucherDepartmentId,
      issueVoucherBufferRemark1: issuevoucher_update.issueVoucherBufferRemark1,
      issueVoucherCostCenterId: issuevoucher_update.issueVoucherCostCenterId,
      issueVoucherDebitAccNo: issuevoucher_update.issueVoucherDebitAccNo,
      issueVoucherDescription: issuevoucher_update.issueVoucherDescription,

      issueVoucherGrno: issuevoucher_update.issueVoucherGrno,
      issueVoucherGrdate:
        issuevoucher_update.issueVoucherGrdate != null
          ? new Date(issuevoucher_update.issueVoucherGrdate)
          : null,
      issueVoucherLpono: issuevoucher_update.issueVoucherLpono,
      issueVoucherLpodate:
        issuevoucher_update.issueVoucherLpodate != null
          ? new Date(issuevoucher_update.issueVoucherLpodate)
          : null,
      issueVoucherQtnNo: issuevoucher_update.issueVoucherQtnNo,
      issueVoucherQtnDate:
        issuevoucher_update.issueVoucherQtnDate != null
          ? new Date(issuevoucher_update.issueVoucherQtnDate)
          : null,

      issueVoucherReqNo: issuevoucher_update.issueVoucherReqNo,
      issueVoucherReqDate:
        issuevoucher_update.issueVoucherReqDate != null
          ? new Date(issuevoucher_update.issueVoucherReqDate)
          : null,
      issueVoucherDayBookNo: issuevoucher_update.issueVoucherDayBookNo,
      issueVoucherLocationId: issuevoucher_update.issueVoucherLocationId,
      issueVoucherJobId: issuevoucher_update.issueVoucherJobId,

      issueVoucherTotalGrossAmount:
        issuevoucher_update.issueVoucherTotalGrossAmount,
      issueVoucherTotalItemDisAmount:
        issuevoucher_update.issueVoucherTotalItemDisAmount,
      issueVoucherTotalDisPer: issuevoucher_update.issueVoucherTotalDisPer,
      issueVoucherTotalDisAmount:
        issuevoucher_update.issueVoucherTotalDisAmount,
      issueVoucherVatPer: issuevoucher_update.issueVoucherVatPer,
      issueVoucherVatAmt: issuevoucher_update.issueVoucherVatAmt,
      issueVoucherTotalActualAmount:
        issuevoucher_update.issueVoucherTotalActualAmount,
      issueVoucherVatRoundSign: issuevoucher_update.issueVoucherVatRoundSign,
      issueVoucherVatRountAmt: issuevoucher_update.issueVoucherVatRountAmt,
      issueVoucherNetAmount: issuevoucher_update.issueVoucherNetAmount,
    });

    this.accountTransactionList = issuevoucher_update.accountsTransactions;
    const gridData: GridData[] = issuevoucher_update.issueVoucherDetails.map(
      (k) => {
  //     const ItemId: string | null =
  // k?.issueVoucherDetailsMatId != null
  //   ? (
  //       this.ItemMasterList?.find(
  //         l => l.value == k.issueVoucherDetailsMatId
  //       )?.label || k.issueVoucherDetailsItemName
  //     )
  //   : k.issueVoucherDetailsItemName;

        const UnitId: string | null =
          k?.issueVoucherDetailsUnitId != null
            ? this.unitListt?.find(
                (l) => l.value == k?.issueVoucherDetailsUnitId
              )?.label
            : null;
        return {
          itemId: Number(k.issueVoucherDetailsMatId),
          itemname: k.issueVoucherDetailsItemName,
          unit: UnitId,
           //itemname: k.issueVoucherDetailsItemName,

          // unit: k.issueVoucherDetailsUnitName,
          qty: k.issueVoucherDetailsQuantity,
          rate: k.issueVoucherDetailsRate,
          disc: k.issueVoucherDetailsDiscAmount,
          netAmt: k.issueVoucherDetailsNetAmt,
          Costprice: k.issueVoucherDetailsSalesPrice,
          // jobname: null,
          // costcenter: null,
          narration: k.issueVoucherDetailsRemarks,
          id: k.issueVoucherDetailsId,
          srdid: k.IssueVoucherDetailsReqDId,
          srid: k.IssueVoucherDetailsReqId,
          jobname:
            k.issueVoucherDetailsJobID != null
              ? this.jobList?.find(
                  (l) => l.value == k?.issueVoucherDetailsJobID
                )?.label
              : null,
        };
      }
    );

    this.issuevoucher_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.issueVoucherFormGroup.disable();
    this.f.issueVoucherNo.clearValidators();
    this.issueVoucherFormGroup.updateValueAndValidity();
  }

  updateFormGrid1(issuevoucher_update: any) {
    this.issuevoucher_entry.data = [];
    this.issueVoucherFormGroup.patchValue({
      issueVoucherId: 0,
      issueVoucherNo: null,
      issueVoucherDate: new Date(
        issuevoucher_update?.purchaseVoucherPurchaseDate
      ),
      issueVoucherRefNo: issuevoucher_update?.purchaseVoucherPurchaseRef,
      issueVoucherIvNoForRet: issuevoucher_update?.issueVoucherIvNoForRet,
      issueVoucherCurrencyId: issuevoucher_update?.purchaseVoucherCurrencyID,
      issueVoucherIvDateForRet: new Date(
        issuevoucher_update.issueVoucherIvDateForRet
      ),

      issueVoucherCreditAccNo: issuevoucher_update?.purchaseVoucherDisACNo,
      issueVoucherDepartmentId: issuevoucher_update.issueVoucherDepartmentId,
      issueVoucherBufferRemark1: issuevoucher_update.issueVoucherBufferRemark1,
      issueVoucherCostCenterId: issuevoucher_update.issueVoucherCostCenterId,
      issueVoucherDebitAccNo: issuevoucher_update.issueVoucherDebitAccNo,
      issueVoucherDescription: issuevoucher_update.purchaseVoucherDescription,

      // issueVoucherGrno: issuevoucher_update.issueVoucherGrno,
      // issueVoucherGrdate:
      //   issuevoucher_update.issueVoucherGrdate != null
      //     ? new Date(issuevoucher_update.issueVoucherGrdate)
      //     : null,
      // issueVoucherLpono: issuevoucher_update.issueVoucherLpono,
      // issueVoucherLpodate:
      //   issuevoucher_update.issueVoucherLpodate != null
      //     ? new Date(issuevoucher_update.issueVoucherLpodate)
      //     : null,
      // issueVoucherQtnNo: issuevoucher_update.issueVoucherQtnNo,
      // issueVoucherQtnDate:
      //   issuevoucher_update.issueVoucherQtnDate != null
      //     ? new Date(issuevoucher_update.issueVoucherQtnDate)
      //     : null,

      // issueVoucherReqNo: issuevoucher_update.issueVoucherReqNo,
      // issueVoucherReqDate:
      //   issuevoucher_update.issueVoucherReqDate != null
      //     ? new Date(issuevoucher_update.issueVoucherReqDate)
      //     : null,
      // issueVoucherDayBookNo: issuevoucher_update.issueVoucherDayBookNo,
      issueVoucherLocationId: issuevoucher_update.purchaseVoucherLocationID,
      // issueVoucherJobId: issuevoucher_update.issueVoucherJobId,

      // issueVoucherTotalGrossAmount:
      //   issuevoucher_update.issueVoucherTotalGrossAmount,
      // issueVoucherTotalItemDisAmount:
      //   issuevoucher_update.issueVoucherTotalItemDisAmount,
      // issueVoucherTotalDisPer: issuevoucher_update.issueVoucherTotalDisPer,
      // issueVoucherTotalDisAmount:
      //   issuevoucher_update.issueVoucherTotalDisAmount,
      // issueVoucherVatPer: issuevoucher_update.issueVoucherVatPer,
      // issueVoucherVatAmt: issuevoucher_update.issueVoucherVatAmt,
      // issueVoucherTotalActualAmount:
      //   issuevoucher_update.issueVoucherTotalActualAmount,
      // issueVoucherVatRoundSign: issuevoucher_update.issueVoucherVatRoundSign,
      // issueVoucherVatRountAmt: issuevoucher_update.issueVoucherVatRountAmt,
      // issueVoucherNetAmount: issuevoucher_update.issueVoucherNetAmount,
    });
    this.accountTransactionList = issuevoucher_update.accountsTransactions;
    const gridData: GridData[] = issuevoucher_update.purchaseVoucherDetails.map(
      (k) => {
        const ItemId: string | null = k?.purchaseVoucherDetailsMaterialId
          ? this.ItemMasterList?.find(
              (l) => l.value === k.purchaseVoucherDetailsMaterialId
            )?.label || null
          : null;

        const UnitId: string | null =
          k?.purchaseVoucherDetailsUnitId != null
            ? this.unitListt?.find(
                (l) => l.value == k?.purchaseVoucherDetailsUnitId
              )?.label
            : null;
        return {
          itemname: ItemId,
          unit: UnitId,
          // itemname: k.issueVoucherDetailsItemName,
          // unit: k.issueVoucherDetailsUnitName,
          qty: k.purchaseVoucherDetailsQuantity,
          rate: k.purchaseVoucherDetailsRate,
          disc: k.issueVoucherDetailsDiscAmount,
          netAmt: k.purchaseVoucherDetailsAmount,
          jobname: null,
          costcenter: null,
          narration: k.issueVoucherDetailsRemarks,
          id: k.purchaseVoucherDetailsPurcahseDetailsId,
        };
      }
    );

    this.issuevoucher_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.issueVoucherFormGroup.disable();
    this.f.issueVoucherNo.clearValidators();
    this.issueVoucherFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  GetSavedIssueVoucherDetails(id: string) {
    this.index = 0;

    this.salesapi.GetSavedIssueVoucherDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: false,
            delete: true,
            new: true,
          };
          this.accountTransactionList = data.result.accountsTransactions;
          this.savedIssueVoucher = data.result;
          this.updateFormGrid(data.result);
          this.issueVoucherFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Issue Voucher not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.issueVoucherFormGroup.updateValueAndValidity();
      }
    );
  }

  GetSavedPurchaseVoucherDetails(id: string) {
    this.index = 0;

    this.Procurementapi.GetSavedPurchaseVoucherDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: true,
            update: false,
            delete: true,
            new: true,
          };
          this.accountTransactionList = data.result.accountsTransactions;
          this.savedIssueVoucher = data.result;
          this.updateFormGrid1(data.result);
          this.issueVoucherFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Issue Voucher not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.issueVoucherFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.userTrackingLog('Delete');
        this.salesapi.DeleteIssueVoucher(this.savedIssueVoucher).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Issue Voucher Deleted Succesfully',
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

  getEmptyRowCount(length): number {
    const DetailsLength = length || 0;
    if (length < 12) {
      return Math.max(0, 12 - DetailsLength);
    } else {
      return;
    }
  }

  edit() {
    this.browsebutton = false;
    this.issuevoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.issueVoucherNo.clearValidators();
    this.selestedReq = [];
    this.issueVoucherFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.issueVoucherFormGroup,
      'issueVoucherLocationId',
      this.locationLocked
    );
    this.issueVoucherFormGroup.controls.issueVoucherNo.disable();
    this.issueVoucherFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
  }

  PurchaseVoucher() {
    this.procurement.GetPurchaseVoucher().subscribe((data: any) => {
      this.purchasevoucherarry = data.result;
      this.filterArray = data.result;
      this.displayVoucherlist = true;
    });
  }

  PurchaseVoucherDetail(pv: string) {
    this.procurement
      .GetSavedPurchaseVoucherDetails(pv)
      .subscribe((data: any) => {
        // this.purchasevoucherarry = data.result;
        // this.filterArray= data.result;
        // this.displayPurchaseOrder = true;
      });
  }

  public get IsValidGrid(): boolean {
    if (this.issuevoucher_entry.data.length > 0) {
      return Object.values(this.issuevoucher_entry.data).some(
        (k: GridData) =>
          k.itemname != null && k.netAmt != null && !(k.rate == null)
      );
      // });
    }
    return false;
  }
  LoadDepartmentDD() {
    this.accountapi.LoadDepartmentDropdown().subscribe((m) => {
      this.departmentArray = m.resultSet.departmentsList;
      this.departmentList = m.resultSet.departmentsList?.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentId,
      }));
      this.departmentList.unshift({
        label: '--Select Department--',
        value: -1,
      });
    });
  }

  selectsales(evt) {
    debugger;
    if (evt.job) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 12, evt.job);
    } else {
      let trimmedSales = evt.storeandwarehouses.trim();
      const includesPcs = this.units.some((unit) =>
        unit.unitMasterUnitShortName.trim().includes(trimmedSales)
      );
      if (includesPcs && this.unitArray.length != 0) {
        const UnitId: string = this.unitArray?.find(
          (l) => l.unitMasterUnitId == evt.storeandwarehousesid
        )?.unitMasterUnitShortName;
        const rate: any = this.unitArray?.find(
          (l) => l.unitMasterUnitId == evt.storeandwarehousesid
        );
        this.unitDetailID = rate?.unitDetailsId;
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 3, UnitId);
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 5, rate.unitDetailsRate);
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        const data = hotinstance.getDataAtRow(this.activeRow.row);
        this.GetAveragePurchasePriceGPC(data[0], data[4]);
      } else {
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            this.activeRow.column,
            evt.storeandwarehouses
          );
        this.masterapi
          .GetItemMasterById({ id: evt.storeandwarehousesid })
          .subscribe((k) => {
            this.ItemMasterArrayByName = k.resultSet?.itemMaster;
            this.unitDetailID =
              this.ItemMasterArrayByName.unitDetails?.unitDetailsId;

            const hotInstance = this.hotRegisterer.getInstance(this.hotid);
            hotInstance.setDataAtCell(
              this.activeRow.row,
              0,
              evt.storeandwarehousesid.toString()
            );
            // Setting PartNo
            hotInstance.setDataAtCell(
              this.activeRow.row,
              1,
              this.ItemMasterArrayByName.itemMasterPartNo
            );

            // // Setting MaterialName
            hotInstance.setDataAtCell(
              this.activeRow.row,
              2,
              this.ItemMasterArrayByName.itemMasterItemName
            );

            if (this.ItemMasterArrayByName.unitDetails) {
              const unitId =
                this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
              const UnitId: string = this.units?.find(
                (l) => l.unitMasterUnitId == unitId
              ).unitMasterUnitShortName;
              //  const UnitId = this.unitArray[0]?.unitMasterUnitShortName;
              hotInstance.setDataAtCell(this.activeRow.row, 3, UnitId);
              hotInstance.setDataAtCell(
                this.activeRow.row,
                5,
                this.ItemMasterArrayByName.unitDetails?.unitDetailsRate
              );
            }
            const data = hotInstance.getDataAtRow(this.activeRow.row);
            this.GetAveragePurchasePriceGPC(data[0], data[4]);
          });
      }
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
    this.control.setValue(evt.storeandwarehousesId);
    this.elementReference.nativeElement.value = evt.storeandwarehouses;
    this.formControlLookUp = false;
  }

  hide(evt: boolean) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  PurchaseRequisitionStatus() {
    const ref = this.dialogService.open(PurchaseRequisitionStatusComponent, {
      header: 'Purchase Requisition Status',
      width: '90%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {
        selectedJob: this.issueVoucherFormGroup.get('issueVoucherJobId').value,
        selectedReq: this.selestedReq,
      },
      baseZIndex: 1,
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.selestedReq.push(res);
        this.selectValue(res);
      }
    });
  }

  selectValue(evt: any[]) {
    evt.forEach((k) => {
      let job = this.jobList?.find((l) => l.value == k?.jobid)?.label;
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      hotInstance.setDataAtCell(this.activeRow.row, 0, k?.matId);
      hotInstance.setDataAtCell(this.activeRow.row, 2, k?.item_Name);
      hotInstance.setDataAtCell(this.activeRow.row, 3, k?.unit);
      hotInstance.setDataAtCell(this.activeRow.row, 4, k?.balQty);
      hotInstance.setDataAtCell(this.activeRow.row, 5, k?.rate);
      hotInstance.setDataAtCell(this.activeRow.row, 16, k?.srdid);
      hotInstance.setDataAtCell(this.activeRow.row, 17, k?.srid);
      hotInstance.setDataAtCell(this.activeRow.row, 19, job);

      this.activeRow.row += 1;
    });
  }

  rptFilter: ReportFilterModel;
 showPrint() {
  this.rptFilter = {
    ReportName:'IssueVoucher',
    SelectionFormula: '',
    Parameters: [],
    Queries: [
      `select * from vw_issuevoucher where issuevoucherid=${this.issueVoucherFormGroup.getRawValue().issueVoucherId}`
    ],
    SP_Queries: [],
    ExportType: ExportFormatType.PortableDocFormat,
  };

  this.crystalReportService
    .getReportPrint(this.rptFilter, true)
    .subscribe({
      next: (response: BlobPart) => {

        const blob = new Blob([response], {
          type: 'application/pdf',
        });

        const pdfUrl = URL.createObjectURL(blob);

        window.open(pdfUrl, '_blank');
      },

      error: (err) => {

        console.error(err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate report',
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

interface GridData {
  Costprice?: any;
  srid?: any;
  srdid?: any;
  itemId?: any;
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
export const issueVoucherColumnObjList = (component: IssuevoucherComponent) => [
  {
    data: 'itemId',
    type: 'text',
    label: 'Item Id',
    toolTip: 'Item ID',
    readOnly: false,
    width: 80,
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
    readOnly: false,
    width: 100,
  },
  {
    data: 'itemname',
    type: 'autocomplete',
    label: 'Item',
    toolTip: 'Item Name',
    source: component.ItemMasterArry,
    readOnly: false,
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    toolTip: 'Unit of Measurement',
    source: component.unitArry,
    readOnly: false,
    width: 80,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
    readOnly: false,
    width: 80,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Unit Rate',
    readOnly: false,
    width: 80,
  },
  {
    data: 'amt',
    type: 'numeric',
    label: 'Amt',
    toolTip: 'Amount',
    width: 100,
  },
  {
    data: 'disc',
    type: 'numeric',
    label: 'Disc.',
    toolTip: 'Discount Amount',
    readOnly: false,
    width: 100,
  },
  {
    data: 'grossAmt',
    type: 'numeric',
    label: 'Gross Amt',
    toolTip: 'Gross Amount',
    width: 100,
  },
  {
    data: 'vatPer',
    type: 'numeric',
    label: 'VAT%.',
    toolTip: 'VAT Percentage',
    width: 80,
  },
  {
    data: 'vatAmt',
    type: 'numeric',
    label: 'VAT.Amt',
    toolTip: 'VAT Amount',
    width: 100,
  },
  {
    data: 'netAmt',
    type: 'numeric',
    label: 'Net.Amt',
    toolTip: 'Net Amount',
    width: 100,
  },
  {
    data: 'jobname',
    type: 'text',
    label: 'Job Name',
    toolTip: 'Job Name',
    readOnly: false,
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    toolTip: 'Remarks',
    readOnly: false,
  },
  {
    data: 'costcenter',
    type: 'dropdown',
    label: 'Cost Center',
    toolTip: 'Cost Center',
    source: component.costcenterArry,
    readOnly: false,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
    toolTip: 'Record ID',
    width: 80,
  },
  {
    data: 'srdid',
    type: 'numeric',
    label: 'SRD ID',
    toolTip: 'Stock Requisition Detail ID',
  },
  {
    data: 'srid',
    type: 'numeric',
    label: 'SR ID',
    toolTip: 'Stock Requisition ID',
  },
  {
    data: 'Costprice',
    type: 'numeric',
    label: 'Cost Price',
    toolTip: 'Item Cost Price',
  },
];
