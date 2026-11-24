import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import {
  SelectItem,
  MessageService,
  ConfirmationService,
  DialogService,
} from 'primeng';
import { timer } from 'rxjs';
import { map, switchMap, timeout } from 'rxjs/operators';
import {
  DepartmentMaster,
  CurrencyMaster,
  ChartofAccounts,
  ItemMaster,
} from 'src/app/routes/domain';
import { JobInvoice } from 'src/app/routes/domain/Accounts/JobInvoice';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { MasterAccountsTable } from 'src/app/routes/domain/Masters/MasterAccountsTable';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { ToWords } from 'to-words';
import { ItemModifyComponent } from '../../sale/item-modify/item-modify.component';
import { AccountsTransactions } from 'src/app/routes/domain/Masters/AccountsTransactions';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { TranslateService } from '@ngx-translate/core';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';

@Component({
  selector: 'app-job-invoice',
  templateUrl: './job-invoice.component.html',
  styleUrls: ['./job-invoice.component.scss'],
})
export class JobInvoiceComponent implements OnInit {
  rptFilter: ReportFilterModel;
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  showItemList: boolean = false;
  ItemList: Array<any>;
  items: any;
  location: Array<string>;
  supplier: Array<string>;
  licensekey: any;
  gridHeader: string;
  assetsArray: Array<string>;
  invoiceType: Array<string>;
  customerCols: Array<any>;
  jobInvoiceCols: Array<any>;
  jobInvoiceEditCols: Array<any>;
  jobCols: Array<any>;
  // locationList: Array<LocationMaster> = [];
  // currencyList: Array<CurrencyMaster> = [];
  departmentList: Array<DepartmentMaster> = [];
  jobInvoiceList: any;
  salesAccountList: Array<MasterAccountsTable> = [];
  showCustomerList: boolean = false;
  showJobList: boolean = false;
  showJobInvoiceList: boolean = false;
  showJobInvoiceEditList: boolean = false;
  SaveConfirm: boolean = false;
  unitList: Array<UnitMaster> = [];
  selectedItem: any;
  selectedUnit: UnitMaster;
  accountTransactionList: AccountsTransactions[] = [];
  urrencyList: SelectItem[];
  currArry: string[] = [];
  currency: CurrencyMaster[] = [];
  currencyList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  // unitList: SelectItem[];

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];

  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  unitsArray: Array<string> = [];
  // invoiceGroup: FormGroup;
  index: number = 0;
  gAmount: number = 0;
  selectedCustomer: any;
  hotid = 'JobInvoice';

  jobInvoicearry: JobInvoice[] = [];
  savedJobInvoice: JobInvoice;

  private hotRegisterer = new HotTableRegisterer();
  JobInvoice_Entry: Handsontable.GridSettings;
  x: any;
  selectedJob: any;

  JobInvoiceFormGroup: FormGroup;

  btnFlag: ButtonFlag;

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;
  locationLocked = false;
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  unitListing: boolean = false;
  unitCols: Array<any>;
  currentRow: number = 0;
  currentIndex: number;
  unitDetailsConversionTypeNumber: number = 1;
  unitDetailsUnitPrice: number = 1;
  funitid: number;
  unitListt: any;
  activeRow: { row: number; column: number };
  ItemMasterArrayByName: any;
  units: any;
  ItemMasterArray: ItemMaster[] = [];
  ScreenId: number;
  Permission: any;
  user: any;
  JOBCOST: boolean = false;
  JobInvoice_EntryDataset = [];
  VatCalculation: Boolean = false;
  stationmasterObj: StationMaster;
  displayPrintPreview: any;
  partyDetails: CustomerMaster;
  wordamt: any;
  UpdateItem: ItemMaster;
  Obj: any;
  DefAccCheck: any;
  DefAcc: string;
  v_typeList: SelectItem[];
  cashAccount: any;
  saleAccount: any;
  DiscountPaidAccount: any;
  vatPayableAccount: any;
  displayPrintPreview1: any;
  pdfSource: string;
  staffList: any;
  staffArray: any;
  ProgramSetting: any;
  enableVNo: boolean = false;
  vatvalue: number;
  dataList: any;
  selectItem: any;
  advanceACC: any;
  retensionACC: any;
  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,

    private stockapiService: StockApiService,
    private masterApi: MasterApiService,
    private accountApi: AccountApiService,
    private messageService: MessageService,
    private fb: FormBuilder,
    public dialogService: DialogService,
    private router: Router,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private crystalReportService: CrystalReportService
  ) {
    event: KeyboardEvent;
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();
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
    this.v_typeList = [
      { label: 'Select', value: '' },
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
      { label: 'CARD', value: 'CARD' },
    ];
    this.JobInvoiceFormGroup = this.fb.group({
      jobInvoiceVoucherNo: [{ value: null, disabled: true }],
      jobInvoiceVoucherDate: [{ value: null, disabled: true }],
      jobInvoiceJobId: [{ value: '', disabled: true }],
      jobInvoiceCustomerId: [
        { value: '', disabled: true },
        [DropDownValidator],
      ],
      jobInvoiceCustomerName: [{ value: '', disabled: true }],
      jobInvoiceCustomerAddress: [{ value: '', disabled: true }],
      jobInvoiceLpoNo: [{ value: '', disabled: true }],
      jobInvoiceLpoDate: [{ value: null, disabled: true }],
      jobInvoiceSalesManId: [{ value: [0], disabled: true }],
      jobInvoiceLocationId: [{ value: [0], disabled: true }],
      jobInvoiceCurrencyId: [{ value: [0], disabled: true }],
      jobInvoiceSalesAccount: [
        { value: [0], disabled: true },
        [DropDownValidator],
      ],
      jobInvoiceRemarks: [{ value: '', disabled: true }],
      jobInvoiceDiscount: [{ value: [0], disabled: true }],
      jobInvoiceGrossAmount: [{ value: [0], disabled: true }],
      jobInvoiceNetAmount: [{ value: [0], disabled: true }],
      jobInvoiceId: new FormControl(null),
      jobInvoiceVat: [{ value: [0], disabled: true }],
      invoicetype: [{ value: [0], disabled: true }],
      jobInvoiceVatAmt: [{ value: [0], disabled: true }],
      jobInvoiceRetention: [{ value: [0], disabled: true }],
      jobInvoiceAdvance: [{ value: [0], disabled: true }],
    });

    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });


    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.GetDefaultSettings()
    this.items = [
      { field: 'itemMasterItemId', header: 'Code' },
      { field: 'itemMasterItemName', header: 'Item Name' },
    ];
    this.unitCols = [
      { field: 'unitMasterUnitShortName', header: 'Unit Code' },
      { field: 'unitMasterUnitFullName', header: 'Unit Name' },
    ];

    this.jobInvoiceCols = [
      { field: 'jobInvoiceVoucherNo', header: 'Voucher#' },
      { field: 'jobInvoiceVoucherDate', header: 'Date' },
      { field: 'jobInvoiceCustomerName', header: 'Customer' },
      { field: 'jobInvoiceLocationId', header: 'Location' },
      { field: 'jobInvoiceGrossAmount', header: 'Gross Amount' },
      { field: 'jobInvoiceDiscount', header: 'Discount' },
      { field: 'jobInvoiceNetAmount', header: 'Net Amount' },
      { field: 'action', header: 'Action' }
    ];

    this.jobInvoiceEditCols = [
      { field: 'job_Invoice_Voucher_No', header: 'Voucher#' },
      { field: 'job_Invoice_Voucher_Date', header: 'Date' },
      { field: 'job_Invoice_Customer_Name', header: 'Customer' },
      { field: 'location', header: 'Location' },
      { field: 'job_Invoice_Gross_Amount', header: 'Gross Amount' },
      { field: 'job_Invoice_Discount', header: 'Discount' },
      { field: 'job_Invoice_Net_Amount', header: 'Net Amount' },
      { field: 'job_Invoice_Net_Amount', header: 'Net Amount' },
      { field: 'Actions', header: 'Actions' },
    ];
    this.initializeControls();
    this.LoadLocationDDL();
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
      this.locationArry = list.map((ar) =>
        ar.locationMasterLocationName?.trim()
      );
      this.locationLocked = this.utilityService.applyLocationLock(
        this.JobInvoiceFormGroup,
        'jobInvoiceLocationId'
      );
    });
  }

  GetGeneralSettingbyKey() {
    this.masterApi.GetGeneralSettingbyKey('Allow_Manual_VoucherNo').subscribe(
      (res) => {
        this.ProgramSetting = res.result;
        this.enableVNo = this.ProgramSetting[0].generalSettingsBoolValue;
      }
    );
  }

  crystalReport() {
    this.rptFilter = {
      ReportName: 'JobInvoiceGeoMak',
      SelectionFormula: '',
      Parameters: [],
      SP_Queries: [],
      Queries: [
        `select * from vr_JobInvoice where VR_JobInvoice.Job_Invoice_ID='${this.JobInvoiceFormGroup.getRawValue().jobInvoiceId}'`,
      ],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        console.log('reponse', response);
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  getRetentionAndAdvanceAccount(event) {
    const customerId = event.value;
    this.masterApi.GetRetentionAndAdvanceAcc(customerId).subscribe((data: any) => {
      if (data.valid) {
        this.retensionACC = data.result.retentionAccount.maAccNo;
        this.advanceACC = data.result.advanceAccount.maAccNo;
      }
    })
  }

  cindex: number;
  clickEvent(index) {
    this.cindex = index;
  }

  pagedRequest: PagedRequest;
  onSearch(term: string) {
    this.dataList = [];
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountApi
      .LoadFilteredItemMaster(this.pagedRequest)
      .subscribe((m: any) => {
        this.ItemMasterArray = m.resultSet.itemMaster;
        this.ItemList = m.resultSet.itemMaster

        // this.dataList = this.itemSetLookup;
      });
  }

  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();

    this.utilityService.getJobinvoiceDropdown().subscribe((m: any) => {
      //item
      this.ItemList = m.resultSet?.itemMaster;
      this.ItemMasterArray = m.resultSet?.itemMaster;
      // unit
      this.unitList = m.resultSet?.unitMasters;
      this.units = m.resultSet?.unitMasters;
      this.unitList.forEach((element) => {
        this.unitsArray.push(element.unitMasterUnitFullName);
      });
      this.unitListt = m.resultSet?.unitMasters.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = m.resultSet?.unitMasters.map((ar) =>
        ar?.unitMasterUnitShortName?.trim()
      );
      // job
      this.jobArray = m.resultSet?.jobMasters;
      this.jobList = m.resultSet?.jobMasters.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = m.resultSet?.jobMasters.map((ar) =>
        ar.jobMasterJobName?.trim()
      );
      //customer
      this.CustomerMasterArray = m.resultSet?.customerMasters;
      this.CustomerMasterList = m.resultSet?.customerMasters.map((kl) => ({
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
      this.CustomerMasterArry = m.resultSet?.customerMasters.map(
        (ar) =>
          ar.customerMasterCustomerName?.trim() +
          '|' +
          ar.customerMasterCustomerNo
      );
      // sale man
      this.SalesManMasterArray = m.resultSet?.saleManList;
      this.SalesManMasterList = m.resultSet?.saleManList.map((kl) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.SalesManMasterList.unshift({
        label: '--Select Sales Man--',
        value: -1,
      });
      this.SalesManMasterArry = m.resultSet?.saleManList.map(
        (ar) =>
          ar.salesManMasterSalesManName?.trim() +
          '|' +
          ar.salesManMasterSalesManId
      );
      //currency
      this.currency = m.resultSet?.currencyMasters;
      this.currencyList = m.resultSet?.currencyMasters.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = m.resultSet?.currencyMasters.map((ar) =>
        ar.currencyMasterCurrencyName?.trim()
      );
      //location
      this.locationArray = m.resultSet?.locationMaster;
      this.locationList = m.resultSet?.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationLocked = this.utilityService.applyLocationLock(
        this.JobInvoiceFormGroup,
        'jobInvoiceLocationId'
      );
      this.locationArry = m.resultSet?.locationMaster.map((ar) =>
        ar.locationMasterLocationName?.trim()
      );
      //accounts
      this.accountArray = m.resultSet?.masterAccountsTables;
      this.accountList = m.resultSet?.masterAccountsTables.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
      this.acctArry = m.resultSet?.masterAccountsTables.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
      this.DefAccCheck = m.resultSet?.accountsSettings?.find(
        (i) => i.accountSettingsAccountDescription == 'Sales Account'
      )?.accountSettingsAccountTextValue;
      this.JobInvoiceFormGroup.get('jobInvoiceSalesAccount').setValue(
        this.DefAccCheck?.split('::')[1]?.trim()
      );
      var res = m.resultSet.accountsSettings;
      const splitText12 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Cash Account'
      )?.accountSettingsAccountTextValue;
      const parts12 = splitText12.split('::');
      this.cashAccount = parts12[1]?.trim();
      const splitText = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Sales Account'
      )?.accountSettingsAccountTextValue;
      const parts = splitText.split('::');
      this.saleAccount = parts[1]?.trim();

      var res = m.resultSet.accountsSettings;
      const splitText0 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Discount Paid Account'
      )?.accountSettingsAccountTextValue;
      const parts0 = splitText0.split('::');
      this.DiscountPaidAccount = parts0[1]?.trim();

      const splitText3 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Vat Output'
      )?.accountSettingsAccountTextValue;
      const parts3 = splitText3.split('::');
      this.vatPayableAccount = parts3[1]?.trim();
    });
    this.GetGeneralSettingbyKey();
    this.GetDefaultSettings();
  }

  initializeControls() {
    const hiddenColumns = [8, 9]

    this.JobInvoice_Entry = this.utilityService.getTableConfig(
      ColumnList(this),
      hiddenColumns,
      { height: '250px', minRows: 6 }
    );
    this.JobInvoice_Entry.beforeOnCellMouseUp = (event, coords, TD) => {

    }

    this.JobInvoice_Entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      this.currentRow = row;
      this.activeRow = { row, column };
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      if (column === 0) {
        this.onSearch('');
        this.showItemList = true;

      } else if (column === 2) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.masterApi.GetUnitDetails(data[0]).subscribe((res) => {
          this.unitArray = res.result;
          this.unitArry = res.result.map((ar) =>
            ar.unitMasterUnitShortName?.trim()
          );
        });
        this.unitListing = true;
      } else if (column === 1 &&
        this.JobInvoice_Entry.readOnly === false
      ) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.EditItem(data[1], data[0]);
      }

    }
    this.JobInvoice_Entry.afterChange = (changes, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (changes != null) {
        var data = hotinstance.getDataAtRow(changes[0][0]);

        if (
          data[3] != null &&
          data[4] != null &&
          changes[0][1] != 'NetAmount' &&
          changes[0][1] != 'GAmount'
        ) {
          //&& data[7] != null
          var sum1 = data[3] * data[4];
          if (data[6]) {
            var discPer = (data[6] / 100) * sum1;
          } else {
            var discPer = 0;
          }

          if (discPer > sum1) {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Discount must be less than net amount',
            });
            this.hotRegisterer
              .getInstance(this.hotid)
              .setDataAtCell(changes[0][0], 7, 0);
          } else {
            var totalSum = data[3] * data[4];
            var result = totalSum - discPer;
            if (this.currentRow >= 0 && data[0] != null) {
              this.JobInvoice_EntryDataset[this.currentRow].GAmount =
                totalSum;
              this.JobInvoice_EntryDataset[this.currentRow].NetAmount =
                result;
              this.JobInvoice_EntryDataset[this.currentRow].Discountvalue =
                discPer;
              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data: this.JobInvoice_EntryDataset });
            }
            this.ColumnSum();
          }
        }
        // this.ColumnSum();
      }
    }
    this.JobInvoice_Entry.beforeChange = (change: Handsontable.CellChange[]) => {
      // setting if prevent scrolling after selection
      if (change[0][1] === 0) {
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    }
    this.JobInvoice_Entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    }
    this.JobInvoice_Entry.afterRemoveRow = (index: number, amount: number) => {
      this.ColumnSum();
    };


  };


  public getCustomerdetails(id: number) {
    let customer = this.CustomerMasterArray?.find(
      (k) => k.customerMasterCustomerNo === id
    )?.customerMasterCustomerName;
    return customer;
  }
  public getlocationName(id: number): string {
    let name = this.locationArray?.find((j) => j.locationMasterLocationId === id)
      ?.locationMasterLocationName;
    return name;
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
          .setDataAtCell(this.activeRow.row, 1, res.Itemname);
      } else {
        this.masterApi.GetAllItemMasterById(res.ItemId).subscribe((data) => {
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
            this.masterApi.NewItem(this.Obj).subscribe((res) => {
              if (res.valid) {
                this.UpdateItem = res.result;

                this.funitid =
                  this.UpdateItem?.unitDetails[0]?.unitDetailsUnitId;
                const Unit: string = this.unitListt?.find(
                  (l) => l.value == this.funitid
                )?.label;

                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(this.activeRow.row, 2, Unit);

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
                    this.UpdateItem?.itemMasterItemName
                  );
                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(
                    this.activeRow.row,
                    4,
                    this.UpdateItem?.unitDetails[0]?.unitDetailsUnitPrice
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

  ColumnSum() {
    const calculateSum = (key: string): number => {
      return this.JobInvoice_EntryDataset.reduce((sum, item) => {
        return sum + (item && item[key] ? Number(item[key]) : 0);
      }, 0);
    };

    const discountTotal = calculateSum('Discountvalue');
    const netAmount = calculateSum('NetAmount');
    const grossAmount = calculateSum('GAmount');

    this.JobInvoiceFormGroup.get('jobInvoiceDiscount').setValue(discountTotal.toFixed(2));
    this.JobInvoiceFormGroup.get('jobInvoiceNetAmount').setValue(netAmount.toFixed(2));
    this.JobInvoiceFormGroup.get('jobInvoiceGrossAmount').setValue(grossAmount.toFixed(2));

    this.GetTotal();
  }

  GetTotal() {
    const grossAmount = Number(this.JobInvoiceFormGroup.value.jobInvoiceGrossAmount) || 0;
    const discount = Number(this.JobInvoiceFormGroup.value.jobInvoiceDiscount) || 0;
    const vatPercentage = Number(this.JobInvoiceFormGroup.value.jobInvoiceVat) || 0;
    const advance = Number(this.JobInvoiceFormGroup.value.jobInvoiceAdvance) || 0;
    const retention = Number(this.JobInvoiceFormGroup.value.jobInvoiceRetention) || 0;

    if (advance > grossAmount) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Advance cannot be greater than gross amount',
      });
      this.JobInvoiceFormGroup.get('jobInvoiceAdvance').setValue(0);
      return;
    }

    // if (retention > grossAmount) {
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Alert',
    //     detail: 'Retention cannot be greater than gross amount',
    //   });
    //   this.JobInvoiceFormGroup.get('jobInvoiceRetention').setValue(0);
    //   return;
    // }

    const netAmount = grossAmount - discount - advance - retention;
    const vatAmount = this.VatCalculation ? netAmount * (vatPercentage / 100) : 0;
    const total = netAmount + vatAmount;

    this.JobInvoiceFormGroup.get('jobInvoiceVatAmt').setValue(vatAmount.toFixed(2));
    this.JobInvoiceFormGroup.get('jobInvoiceNetAmount').setValue(total.toFixed(2));
  }

  savejobInvoice() {
    if (this.enableVNo) {
      this.masterApi
        .CheckVoucherExists(
          'JobInoviceVoucher',
          this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo
        )
        .subscribe((res: any) => {
          if (res.exists) {
            this.messageService.add({
              severity: 'info',
              summary: 'Alert',
              detail: 'Voucher No already exists',
            });
            this.JobInvoiceFormGroup.controls.jobInvoiceVoucherNo.setValue('');
            return;
          }
        });
    }
    this.JobInvoiceFormGroup.markAllAsTouched();

    const savedData: any[] = (
      this.JobInvoice_EntryDataset as GridData[]
    )?.filter((k) => k.hasOwnProperty('itemName'));
    const jobInvoice: JobInvoice = this.JobInvoiceFormGroup.value as JobInvoice;
    jobInvoice.accountsTransactions = [];
    jobInvoice.jobInvoiceVoucherNo =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo;
    jobInvoice.jobInvoiceVoucherDate =
      this.JobInvoiceFormGroup.value.jobInvoiceVoucherDate;
    jobInvoice.jobInvoiceJobId =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceJobId;
    jobInvoice.jobInvoiceCustomerId =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceCustomerId;
    jobInvoice.jobInvoiceLpoNo =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceLpoNo;
    jobInvoice.jobInvoiceLpoDate =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceLpoDate;
    jobInvoice.jobInvoiceSalesManId =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceSalesManId;
    jobInvoice.jobInvoiceLocationId =
      this.JobInvoiceFormGroup.get('jobInvoiceLocationId')?.value;
    jobInvoice.jobInvoiceSalesAccount =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceSalesAccount;
    jobInvoice.jobInvoiceNetAmount = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceNetAmount
    );
    jobInvoice.jobInvoiceDiscount = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceDiscount
    );
    jobInvoice.jobInvoiceGrossAmount = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceGrossAmount
    );
    jobInvoice.jobInvoiceVat = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceVat
    );
    jobInvoice.jobInvoiceVatAmt = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceVatAmt
    );
    jobInvoice.jobInvoiceRetention = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceRetention
    );
    jobInvoice.jobInvoiceAdvance = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceAdvance
    );
    jobInvoice.jobInvoiceRemarks =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceRemarks;
    jobInvoice.invoicetype = this.JobInvoiceFormGroup.getRawValue().invoicetype;
    jobInvoice.jobInvoiceUserId = this.user.userId;
    jobInvoice.retention = Number(this.JobInvoiceFormGroup.getRawValue().jobInvoiceRetention);
    jobInvoice.advance = Number(this.JobInvoiceFormGroup.getRawValue().jobInvoiceAdvance);

    const creditData: AccountsTransactions = {
      // accountsTransactionsAccNo: this.cashAccount,
      accountsTransactionsAccNo:
        this.JobInvoiceFormGroup.getRawValue().invoicetype == 'CASH'
          ? this.cashAccount
          : this.CustomerMasterArray?.find(
            (o) =>
              o.customerMasterCustomerNo ==
              this.JobInvoiceFormGroup.value.jobInvoiceCustomerId
          )?.customerMasterCustomerReffAcNo,

      accountsTransactionsTransDate:
        this.JobInvoiceFormGroup.value.jobInvoiceDate,
      accountsTransactionsParticulars:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsDebit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceNetAmount
      ),
      accountsTransactionsFcDebit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceNetAmount
      ),
      accountsTransactionsAllocBalance:
        this.JobInvoiceFormGroup.value.jobInvoiceNetAmount,
      accountsTransactionsFcAllocBalance: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceNetAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
      accountsTransactionsDescription:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.user.userId,
      accountsTransactionsCurrencyId:
        this.JobInvoiceFormGroup.value.jobInvoiceCurrencyId,
    };

    jobInvoice.accountsTransactions.push(creditData);

    //saleAccount
    const saleAccount: AccountsTransactions = {
      // accountsTransactionsAccNo: this.goodsSoldAccount,
      accountsTransactionsAccNo: this.saleAccount,
      accountsTransactionsTransDate:
        this.JobInvoiceFormGroup.value.jobInvoiceDate,
      accountsTransactionsParticulars:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsCredit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceGrossAmount
      ),
      accountsTransactionsFcCredit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceGrossAmount
      ),
      accountsTransactionsAllocBalance:
        this.JobInvoiceFormGroup.value.jobInvoiceGrossAmount,
      accountsTransactionsFcAllocBalance: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceGrossAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
      accountsTransactionsDescription:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.user.userId,
      accountsTransactionsCurrencyId:
        this.JobInvoiceFormGroup.value.jobInvoiceCurrencyId,
    };

    jobInvoice.accountsTransactions.push(saleAccount);

    const creditData1: AccountsTransactions = {
      accountsTransactionsAccNo: this.DiscountPaidAccount,
      accountsTransactionsTransDate:
        this.JobInvoiceFormGroup.value.jobInvoiceDate,
      accountsTransactionsParticulars:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsDebit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceDiscount
      ),
      accountsTransactionsFcDebit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceDiscount
      ),
      accountsTransactionsAllocBalance:
        this.JobInvoiceFormGroup.value.jobInvoiceDiscount,
      accountsTransactionsFcAllocBalance: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceDiscount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
      accountsTransactionsDescription:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.user.userId,
      accountsTransactionsCurrencyId:
        this.JobInvoiceFormGroup.value.JobInvoiceCurrencyId,
    };

    ///vat
    const vatData: AccountsTransactions = {
      accountsTransactionsAccNo: this.vatPayableAccount,
      accountsTransactionsTransDate:
        this.JobInvoiceFormGroup.value.jobInvoiceDate,
      accountsTransactionsParticulars:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsCredit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceVatAmt
      ),
      accountsTransactionsFcCredit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceVatAmt
      ),
      accountsTransactionsAllocBalance:
        this.JobInvoiceFormGroup.value.jobInvoiceVatAmt,
      accountsTransactionsFcAllocBalance: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceVatAmt
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
      accountsTransactionsDescription:
        this.JobInvoiceFormGroup.value.JobInvoiceRemarks,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
    };
    const retentionData: AccountsTransactions = {
      accountsTransactionsAccNo: this.retensionACC,
      accountsTransactionsTransDate:
        this.JobInvoiceFormGroup.value.jobInvoiceDate,
      accountsTransactionsParticulars:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsDebit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceRetention
      ),
      accountsTransactionsFcDebit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceRetention
      ),
      accountsTransactionsAllocBalance:
        this.JobInvoiceFormGroup.value.jobInvoiceRetentionAmt,
      accountsTransactionsFcAllocBalance: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceRetentionAmt
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
      accountsTransactionsDescription:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
    };

    const advanceData: AccountsTransactions = {
      accountsTransactionsAccNo: this.advanceACC,
      accountsTransactionsTransDate:
        this.JobInvoiceFormGroup.value.jobInvoiceDate,
      accountsTransactionsParticulars:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsCredit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceAdvance
      ),
      accountsTransactionsFcCredit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceAdvance
      ),
      accountsTransactionsAllocBalance:
        this.JobInvoiceFormGroup.value.jobInvoiceAdvanceAmt,
      accountsTransactionsFcAllocBalance: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceAdvanceAmt
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
      accountsTransactionsDescription:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
    };

    if (

      this.JobInvoiceFormGroup.value.jobInvoiceVatAmt > 0 &&
      this.VatCalculation
    ) {
      jobInvoice.accountsTransactions.push(vatData);
    }
    if (this.JobInvoiceFormGroup.value.jobInvoiceRetention > 0) {
      jobInvoice.accountsTransactions.push(retentionData);
    }
    if (this.JobInvoiceFormGroup.value.jobInvoiceAdvance > 0) {
      jobInvoice.accountsTransactions.push(advanceData);
    }
    if (this.JobInvoiceFormGroup.value.jobInvoiceDiscount > 0) {
      jobInvoice.accountsTransactions.push(creditData1);
    }

    jobInvoice.jobInvoiceDetails = savedData
      ?.filter((k) => k.itemName != null && k.NetAmount != null)
      .map((k: any) => {
        return {
          jobInvoiceDetailsDetailsId: k.id != null ? k.id : 0,
          jobInvoiceDetailsVoucherNo:
            this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
          jobInvoiceDetailsItemId: k.itemId,
          jobInvoiceDetailsItemName: k.itemName,
          jobInvoiceDetailsDescription: '',
          jobInvoiceDetailsUnitId: k.unitId,
          jobInvoiceDetailsSoldQty: k.Qty,
          jobInvoiceDetailsUnitPrice: k.Price,
          jobInvoiceDetailsUnit: k.Unit,
          jobInvoiceDetailsGrossAmount: k.GAmount,
          jobInvoiceDetailsDiscount: k.Discount,
          jobInvoiceDetailsNetAmount: k.NetAmount,
          jobInvoiceDetailsFsno: null,
          jobInvoiceDetailsSno: null,
          jobInvoiceDetailsLocationId: null,
          jobInvoiceDetailsDelStatus: null,
        };
      });

    if (this.btnFlag.save) {
      this.saveJobInvo(jobInvoice);
    } else {
      this.updateJobInvo(jobInvoice);
    }
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemList?.find((j) => j.itemMasterItemId === itemMasterItemId)
      ?.itemMasterItemName;
  }

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }



  getEmptyRowCount(length): number {
    const jobInvoiceDetailsLength = length || 0;
    if (length < 13) {
      return Math.max(0, 13 - jobInvoiceDetailsLength);
    } else {
      return;
    }
  }

  public getCurrencyName(id: number): string {
    return this.currency?.find((j) => j?.currencyMasterCurrencyId === id)
      ?.currencyMasterCurrencyName;
  }

  new() {



    this.JobInvoiceFormGroup.reset();
    this.callDropdowns();
    this.JobInvoice_Entry.data = [];
    this.accountTransactionList = [];
    this.JobInvoice_EntryDataset = [];
    this.JobInvoice_Entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.JobInvoice_Entry);
    this.JobInvoiceFormGroup.patchValue({
      jobInvoiceVoucherNo: null,
      jobInvoiceCurrencyId: Number(this.DefCurrency),
      jobInvoiceSalesAccount: -1,
      invoicetype: 'CASH',
      jobInvoiceLpoDate: new Date(),
      jobInvoiceVoucherDate: new Date()
    });
    if (!this.locationLocked) {
      this.JobInvoiceFormGroup.get('jobInvoiceLocationId')?.setValue(
        Number(this.DefLocid)
      );
    }
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;


    this.JobInvoiceFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.JobInvoiceFormGroup,
      'jobInvoiceLocationId',
      this.locationLocked
    );
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.JobInvoiceFormGroup,
        'jobInvoiceLocationId'
      );
    }
    this.f.jobInvoiceVoucherNo.clearValidators();
    this.JobInvoiceFormGroup.updateValueAndValidity();

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
        }
      }
      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;

      this.JOBCOST = jobcal == true ? true : false;

      var VAT_Calculation = list?.filter(
        (a) => a.generalSettingsKeyValue == 'VAT_Calculation'
      );
      this.VatCalculation = VAT_Calculation[0]?.generalSettingsBoolValue ?? false;

      const match = m.resultSet?.optionSettings?.optionsMasterType.match(/(\d+)/);
      if (match) {
        this.vatvalue = parseInt(match[0], 10);

        this.JobInvoiceFormGroup
          .get('jobInvoiceVat')
          .setValue(!this.VatCalculation ? 0 : this.vatvalue);
      }
    });
  }

  getVoucherNumber() {
    this.stockapiService.GenerateVoucherNo().subscribe((response: any) => {
      this.JobInvoiceFormGroup.get('jobInvoiceVoucherNo').setValue(
        response.vouchersNumbersVNo
      );
    });
  }

  updateFormGrid(JobInvo: JobInvoice) {
    this.JobInvoiceFormGroup.patchValue({
      jobInvoiceVoucherNo: JobInvo?.jobInvoiceVoucherNo,
      jobInvoiceVoucherDate: new Date(JobInvo?.jobInvoiceVoucherDate),
      jobInvoiceJobId: Number(JobInvo?.jobInvoiceJobId),
      jobInvoiceCustomerId: JobInvo?.jobInvoiceCustomerId,
      jobInvoiceCustomerName: JobInvo?.jobInvoiceCustomerName,
      jobInvoiceCurrencyId: JobInvo?.jobInvoiceCurrencyId,
      jobInvoiceLpoNo: JobInvo?.jobInvoiceLpoNo,
      jobInvoiceLpoDate: new Date(JobInvo?.jobInvoiceLpoDate),
      jobInvoiceSalesManId: JobInvo?.jobInvoiceSalesManId,
      jobInvoiceLocationId: JobInvo?.jobInvoiceLocationId,
      jobInvoiceSalesAccount: JobInvo?.jobInvoiceSalesAccount,
      jobInvoiceRemarks: JobInvo?.jobInvoiceRemarks,
      jobInvoiceDiscount: JobInvo?.jobInvoiceDiscount,
      jobInvoiceGrossAmount: JobInvo?.jobInvoiceGrossAmount,
      jobInvoiceNetAmount: JobInvo?.jobInvoiceNetAmount,
      jobInvoiceId: JobInvo?.jobInvoiceId,
      invoicetype: JobInvo?.invoicetype,
      jobInvoiceVat: JobInvo?.jobInvoiceVat,
      jobInvoiceVatAmt: JobInvo?.jobInvoiceVatAmt,
      jobInvoiceAdvance: JobInvo?.advance,
      jobInvoiceRetention: JobInvo?.retention,
    });
    this.accountTransactionList = JobInvo.accountsTransactions;


    this.getPartyDetails(JobInvo.jobInvoiceCustomerId);
    const gridData: any[] = JobInvo?.jobInvoiceDetails.map((k) => {

      return {
        itemId: k.jobInvoiceDetailsItemId,
        itemName: k.jobInvoiceDetailsItemName,
        unitId: k.jobInvoiceDetailsUnitId,
        Unit: k?.jobInvoiceDetailsUnit,
        Qty: k?.jobInvoiceDetailsSoldQty,
        Price: k?.jobInvoiceDetailsUnitPrice,
        GAmount: k?.jobInvoiceDetailsGrossAmount,
        Discount: k?.jobInvoiceDetailsDiscount,
        NetAmount: k?.jobInvoiceDetailsNetAmount,
        id: k?.jobInvoiceDetailsDetailsId,
      };
    });
    this.JobInvoice_EntryDataset = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.JobInvoiceFormGroup.disable();
    this.f.jobInvoiceVoucherNo.clearValidators();
    this.JobInvoiceFormGroup.updateValueAndValidity();
  }

  public getPartyDetails(id) {
    this.partyDetails = this.CustomerMasterArray?.find(
      (j) => j.customerMasterCustomerNo === id
    );
  }

  edit() {
    this.JobInvoice_Entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    // this.f.vou.clearValidators();
    this.JobInvoiceFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.JobInvoiceFormGroup,
      'jobInvoiceLocationId',
      this.locationLocked
    );
    this.JobInvoiceFormGroup.updateValueAndValidity();
  }

  GetSavedJobInvoiceDetails(id: any) {
    this.index = 0;
    this.accountApi.GetJobInvoiceVoucherNo(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.savedJobInvoice = data?.result;
          this.JobInvoiceFormGroup.disable();
          this.updateFormGrid(data?.result);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Job Invoice not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.JobInvoiceFormGroup.updateValueAndValidity();
      }
    );
  }

  getJobInvoiceListing() {
    this.callDropdowns();
    setTimeout(() => {
      this.accountApi.getJobinvoice().subscribe((res) => {
        this.jobInvoiceList = res.result;
      });
    }, 500);

    this.showJobInvoiceList = true;
  }

  public getSalesManName(id: number): string {
    return this.SalesManMasterArray?.find(
      (j) => j?.salesManMasterSalesManId === id
    )?.salesManMasterSalesManName;
  }

  getSalesAccountList() {
    this.accountApi.GetAllAcounts().subscribe((k) => {
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

  getItemList() {
    this.masterApi.GetAllItemNotGroup().subscribe((response: any) => {
      this.ItemList = response?.result;
      this.ItemMasterArray = response?.result;
    });
  }

  getUnitList() {
    this.masterApi.GetAllUnit().subscribe((response: any) => {
      this.unitList = response;
      this.units = response;
      this.unitList.forEach((element) => {
        this.unitsArray.push(element.unitMasterUnitFullName);
      });
      this.unitListt = response.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = response.map((ar) => ar?.unitMasterUnitShortName?.trim());
    });
  }



  delete() {
    this.deleteJobInvoiceItem(this.savedJobInvoice);
  }

  deleteJobInvoiceItem(item: any) {
    this.showJobInvoiceEditList = false;
    if (
      item.jobInvoiceVoucherNo != null &&
      item.jobInvoiceVoucherNo != undefined
    ) {
      this.SaveConfirm = true;
      this.confirmation.confirm({
        key: 'confirm-key',
        message:
          'Do you want to delete Job Invoice No : ' +
          item.jobInvoiceVoucherNo +
          '?',
        accept: () => {
          this.accountApi
            .DeleteJobInvoice(item.jobInvoiceVoucherNo)
            .subscribe((response) => {
              if (response) {
                this.userTrackingLog('Delete');
                this.JobInvoiceFormGroup.reset();
                this.JobInvoice_Entry.data = [];
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Job Invoice is Deleted ',
                });
                this.new();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Job Invoice Delete Failed',
                });
              }
            });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Null',
        detail: 'No Voucher Number',
      });
      return;
    }
  }

  get f() {
    return this.JobInvoiceFormGroup.controls;
  }

  SetItemValue(item) {
    this.masterApi
      .GetItemMasterById({ id: item.itemMasterItemId })
      .subscribe((k) => {
        this.ItemMasterArrayByName = k.resultSet?.itemMaster;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.setDataAtCell(
          this.activeRow.row,
          0,
          this.ItemMasterArrayByName.itemMasterItemId
        );
        hot.setDataAtCell(
          this.activeRow.row,
          1,
          this.ItemMasterArrayByName.itemMasterItemName
        );
        hot.setDataAtCell(
          this.activeRow.row,
          8,
          this.ItemMasterArrayByName.itemMasterItemId
        );
        this.unitDetailsConversionTypeNumber =
          this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType;
        this.unitDetailsUnitPrice =
          this.ItemMasterArrayByName.unitDetails?.unitDetailsRate;
        hot.setDataAtCell(
          this.activeRow.row,
          4,
          this.unitDetailsUnitPrice ? this.unitDetailsUnitPrice : null
        );
        // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 5, this.ItemMasterArrayByName.unitDetails[0].unitDetailsUnitPrice);
        this.funitid =
          this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
        const UnitId: any = this.unitListt?.find(
          (l) => l.value == this.funitid
        );
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 2, UnitId.label);
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 9, UnitId.value);
      });
    this.selectedItem = item;
    this.showItemList = false;
  }

  selectUnit(unit: UnitMaster) {
    if (this.unitArray.length != 0) {
      // const UnitId: string = this.unitArray?.find(
      //   (l) => l.unitMasterUnitId == unit.unitMasterUnitId
      // )?.unitMasterUnitShortName;
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 2, unit.unitMasterUnitShortName);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 9, unit.unitMasterUnitId);
    }
    this.unitListing = false;
  }

  handleChange(e) {
    this.index = e.index;
  }

  public get IsValidGrid(): boolean {
    if (this.JobInvoice_EntryDataset.length > 0) {
      return Object.values(this.JobInvoice_EntryDataset).some(
        (k: GridData) => k.itemName != null
      );
      // });
    }
    return false;
  }

  saveJobInvo(jobInvoice: JobInvoice) {
    if (this.JobInvoiceFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.accountApi.saveJobInvoice(jobInvoice).subscribe(
            (data: any) => {
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedJobInvoice = data.result;
                this.updateFormGrid(data.result);
                this.userTrackingLog('Insert');
              } else if (!data.isSuccess) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail:
                    data.errorMessage != null && data.errorMessage.trim() !== ''
                      ? data.errorMessage
                      : data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Job Invoice Save Failed',
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.JobInvoiceFormGroup.markAllAsTouched();
      this.JobInvoiceFormGroup.markAsDirty();
    }
  }

  updateJobInvo(jobInvoice: JobInvoice) {
    if (this.JobInvoiceFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.accountApi.UpdateJobInvoice(jobInvoice).subscribe(
            (data: any) => {
              if (data.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedJobInvoice = data.result;
                this.updateFormGrid(data.result);
                this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Job Invoice Updated Succesfully',
                });
              } else if (!data.isSuccess) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: data.errorMessage,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Job Invoice Update Failed',
              });
            }
          );
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
      this.JobInvoiceFormGroup.markAllAsTouched();
      this.JobInvoiceFormGroup.markAsDirty();
    }
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  userTrackingLog(type) {
    let req = {
      page: 'Job Invoice',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.JobInvoiceFormGroup.get('jobInvoiceVoucherNo').value,
      vpType: 'Job Invoice',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j?.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
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
  code?: string;
  itemName?: string;
  brand?: string;
  packing?: string;
  origin?: string;
  Unit?: string;
  Qty?: number;
  Price?: number;
  GAmount?: number;
  Discount?: number;
  NetAmount?: number;
  id?: number;
  itemId?: number;
  unitId?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const ColumnList = (
  component: JobInvoiceComponent
) => [
    {
      data: 'itemId',
      type: 'numeric',
      label: 'Item Id',
      toolTip: 'Item Id',
    },
    {
      data: 'itemName',
      type: 'text',
      label: 'Material Name',
      toolTip: 'Material Name',
      readOnly: true,
      width: 180,
    },
    {
      data: 'Unit',
      type: 'autocomplete',
      label: 'Unit',
      toolTip: 'Unit',
      readOnly: false,
      width: 100,
      source: component.unitsArray,
    },
    {
      data: 'Qty',
      type: 'numeric',
      label: 'Qty',
      readOnly: false,
      toolTip: 'Quantity',
      width: 100,
    },
    {
      data: 'Price',
      type: 'numeric',
      label: 'Price',
      toolTip: 'Unit Price',
      readOnly: false,
      width: 100,
    },
    {
      data: 'GAmount',
      type: 'numeric',
      label: 'Gross Amount',
      toolTip: 'Gross Amount',
      readOnly: true,
      width: 100,
    },
    {
      data: 'Discount',
      type: 'numeric',
      label: 'Disc. (%)',
      toolTip: 'Discount Percentage',
      readOnly: false,
      width: 100,
    },
    {
      data: 'NetAmount',
      type: 'numeric',
      label: 'Net Amount',
      toolTip: 'Net Amount',
      readOnly: true,
      width: 100,
    },
    {
      data: 'unitId',
      type: 'numeric',
      label: 'Unit Id',
      toolTip: 'Unit Id',
      readOnly: true,
      width: 100,
    },
    {
      data: 'Discountvalue',
      type: 'numeric',
      label: 'Discount Value',
      toolTip: 'Discount Value',
      readOnly: true,
      width: 100,
    },
  ];
