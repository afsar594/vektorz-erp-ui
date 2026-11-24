import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import {
  ChartofAccounts,
  CurrencyMaster,
  ItemMaster,
  ReceiptVoucher,
  ReceiptVoucherDetails,
} from 'src/app/routes/domain';
import { MenuItem } from 'primeng/api/menuitem';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem, MessageService, ConfirmationService } from 'primeng';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { ReportStockBaseUnit } from 'src/app/routes/domain/Store/ReportStockBaseUnit';
import { StockLedgerParameters } from 'src/app/routes/domain/Store/StockLedgerParameters';
import { ViewStockTransferType } from 'src/app/routes/domain/Store/ViewStockTransferType';
import { StorewarehousesApiService } from 'src/app/routes/service/storewarehouse.api.services';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ExportExcelService } from 'src/app/routes/service/export-excel.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';

@Component({
  selector: 'app-stock-report',
  templateUrl: './stock-report.component.html',
  styleUrls: ['./stock-report.component.scss'],
})
export class StockReportComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;

  TotRunningBalanceCreditDebit: string;

  data = [
    { Name: 'John', Age: 30, Country: 'USA' },
    { Name: 'Maria', Age: 25, Country: 'Canada' },
    { Name: 'Lee', Age: 35, Country: 'Korea' },
  ];

  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean = false;
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
  MainItemMasterList: any[] = [];

  ItemMasterGroupArray: ItemMaster[] = [];
  ItemMasterGroupArry: string[] = [];
  ItemMasterGroupList: SelectItem[];

  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  // V_TYPEArray: SuppliersMaster[] = [];
  // V_TYPEArry: string[] = [];
  // V_TYPEList: SelectItem[];

  V_TYPEArray: ViewStockTransferType[] = [];
  V_TYPEArry: string[] = [];
  V_TYPEList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];
  defaultLocationID = -1;

  reportStockBaseUnitarry: ReportStockBaseUnit[] = [];
  // savedPurchaseVoucherGridData: GridData[] = [];
  // savedPurchaseVoucher: PurchaseVoucher;

  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  displayPrintPreview: boolean = false;
  ScreenId: number;
  Permission: any;
  user: any;
  totalStock: number = 0;
  averageRate: number = 0;
  totalAmount: number = 0;
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
    private router: Router,
    private masterapi: MasterApiService,
    private storewarehouseapi: StorewarehousesApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private permission: PermissionsService,
    private excelService: ExportExcelService,
    private storage: LocalStorageService
  ) {
    this.licensekey = defaults.hotlicensekey;

    const location = JSON.parse(this.storage.get('selectedItemLocation'));
    this.defaultLocationID = Number(location.locationMasterLocationId);
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'reportaccountstransactions_HotEntry';
  reportaccountstransactions_entry: Handsontable.GridSettings;
  stockLedgerReportFormGroup: FormGroup;
  reportaccountstransactions_entryDataset = [];
  // accountTransactionDataset = [];
  cols;
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      console.log(this.ScreenId);
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

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.stockLedgerReportFormGroup = this.fb.group({
      rptSummary: [{ value: false, disabled: true }],
      rptDetails: [{ value: true, disabled: true }],
      rptDateRange: [{ value: false, disabled: true }],
      rptAsOnDate: [{ value: true, disabled: true }],
      rptPrintWithRef: [{ value: true, disabled: true }],
      rptPrintWithCheq: [{ value: true, disabled: true }],
      rptPrintWithAlloc: [{ value: true, disabled: true }],
      rptPrintWithAgainstAcc: [{ value: true, disabled: true }],
      rptPrintWithRelatedAccTrans: [{ value: true, disabled: true }],
      rptHideZero: [{ value: true, disabled: true }],
      rptItemGroup: [{ value: [-1], disabled: true }],
      rptJob: [{ value: [-1], disabled: true }],
      rptItem: [{ value: [-1], disabled: true }, [DropDownValidator]],
      rptLocation: [{ value: [-1], disabled: true }],
      rptPartNo: [{ value: '', disabled: true }],
      rptNarration: [{ value: [''], disabled: true }],
      rptDtpAson: [{ value: [null], disabled: true }],
      rptDtpFrom: [{ value: [null], disabled: true }],
      rptDtpTo: [{ value: [null], disabled: true }],
      rptTotDebit: [{ value: [null], disabled: true }],
      rptTotCredit: [{ value: [null], disabled: true }],
      rptTotRunningBalanceCreditDebit: [{ value: [null], disabled: true }],
      // rptType: [{ value: [null], disabled: true }],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });

    this.new();
  }

  get f() {
    return this.stockLedgerReportFormGroup.controls;
  }

  initializeControls() {
    this.storewarehouseapi.StockLedger_LoadDropdown().subscribe((m) => {
      // itemgroup
      this.ItemMasterGroupArray = m.resultSet.itemMasterGroup;
      this.ItemMasterGroupList = m.resultSet.itemMasterGroup.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterGroupList.unshift({
        label: '--Select Item Group--',
        value: -1,
      });
      // item
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
        partNo: kl.itemMasterPartNo,
        stock: kl.itemMasterStockType,
        barcode: kl.itemMasterBarcode,
        AccNo: kl.itemMasterAccountNo,
      }));
      this.MainItemMasterList = this.ItemMasterList;
      this.ItemMasterList.unshift({
        label: '--Select Item --',
        value: -1,
      });

      // location
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select location--', value: -1 });
    });
    const hiddenColumns = [0, 1, 2, 3, 7, 10, 11];
    this.reportaccountstransactions_entry = this.utilityService.getTableConfig(
      stockReportColumnObjList(this),
      hiddenColumns
    );
    this.reportaccountstransactions_entry.beforeChangeRender = (
      change,
      source
    ) => {
      this.index = Number(change[0]);
    };

    this.reportaccountstransactions_entry.afterValidate = (
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

  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      this.locationArray = k;
      this.locationList = k.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = k.map((ar) => ar.locationMasterLocationName?.trim());
    });
  }

  onItemGroupChange(event: any): void {
    const selectedValue = event.value;
    if (selectedValue > 0) {
      this.ItemMasterList = this.MainItemMasterList?.filter(
        (x) => x.AccNo == selectedValue
      );
    } else {
      this.ItemMasterList = this.MainItemMasterList;
    }
  }
  // Method to calculate Stock, Rate, and Amount totals
  calculateStockTotals(data: any) {
    // Total Stock - sum of all stock quantities
    this.totalStock = data.reduce((sum, item) => sum + (item.stock || 0), 0);

    // Total Amount - sum of all stockRegisterAmount values
    this.totalAmount = data.reduce(
      (sum, item) => sum + (item.stockRegisterAmount || 0),
      0
    );

    // Average Rate - weighted average based on stock quantities
    this.calculateAverageRate(data);
  }

  // Method to calculate weighted average rate
  private calculateAverageRate(data: any) {
    let totalWeightedValue = 0;
    let totalStockQuantity = 0;

    data.forEach((item) => {
      const stock = item.stock || 0;
      const rate = item.stockRegisterRate || 0;

      // Only include items that have stock and valid rate
      if (stock > 0 && rate > 0) {
        totalWeightedValue += stock * rate;
        totalStockQuantity += stock;
      }
    });

    // Calculate average rate (avoid division by zero)
    this.averageRate =
      totalStockQuantity > 0 ? totalWeightedValue / totalStockQuantity : 0;
  }

  getAllItemMaster() {
    this.masterapi.GetAllItem().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({
        label: '--Select Item Group --',
        value: -1,
      });
      this.ItemMasterArry = k.result.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
      );
    });
  }

  getAllItemMaster_Group() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterGroupArray = k.result;
      this.ItemMasterGroupList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterGroupList.unshift({
        label: '--Select Item --',
        value: -1,
      });
      this.ItemMasterGroupArry = k.result.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
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
          ar.suppliersMasterSupplierName?.trim() +
          '|' +
          ar.suppliersMasterSupplierId
      );
    });
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    )?.itemMasterItemName;
  }

  new() {
    this.stockLedgerReportFormGroup.reset();
    this.itemSearchText = '';
    this.allStockData = [];
    this.reportaccountstransactions_entry.data = [];
    this.reportaccountstransactions_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      ?.updateSettings(this.reportaccountstransactions_entry);

    this.stockLedgerReportFormGroup.get('rptSummary').setValue(false);
    this.stockLedgerReportFormGroup.get('rptDetails').setValue(true);
    this.stockLedgerReportFormGroup.get('rptDateRange').setValue(false);
    this.stockLedgerReportFormGroup.get('rptAsOnDate').setValue(true);
    this.stockLedgerReportFormGroup.get('rptPrintWithRef').setValue(true);
    this.stockLedgerReportFormGroup.get('rptPrintWithCheq').setValue(false);
    this.stockLedgerReportFormGroup.get('rptPrintWithAlloc').setValue(false);
    this.stockLedgerReportFormGroup
      .get('rptPrintWithAgainstAcc')
      .setValue(false);
    this.stockLedgerReportFormGroup
      .get('rptPrintWithRelatedAccTrans')
      .setValue(false);
    this.stockLedgerReportFormGroup.get('rptHideZero').setValue(false);
    this.stockLedgerReportFormGroup.get('rptItemGroup').setValue(-1);
    this.stockLedgerReportFormGroup.get('rptJob').setValue(-1);
    this.stockLedgerReportFormGroup.get('rptItem').setValue(-1);
    this.stockLedgerReportFormGroup.get('rptLocation').setValue(-1);
    this.stockLedgerReportFormGroup.get('rptPartNo').setValue('');
    this.stockLedgerReportFormGroup.get('rptNarration').setValue('');
    this.stockLedgerReportFormGroup.get('rptDtpAson').setValue(null);
    this.stockLedgerReportFormGroup.get('rptDtpFrom').setValue(null);
    this.stockLedgerReportFormGroup.get('rptDtpTo').setValue(null);
    this.stockLedgerReportFormGroup.get('rptTotDebit').setValue(null);
    this.stockLedgerReportFormGroup.get('rptTotCredit').setValue(null);
    this.stockLedgerReportFormGroup
      .get('rptTotRunningBalanceCreditDebit')
      .setValue(null);

    this.stockLedgerReportFormGroup.get('rptDetails').setValue(true);

    this.stockLedgerReportFormGroup.get('rptAsOnDate').setValue(true);
    this.stockLedgerReportFormGroup.get('rptPrintWithRef').setValue(true);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.stockLedgerReportFormGroup.enable();
    // this.stockLedgerReportFormGroup.controls.rptLocation.disable();
    //  this.f.purchaseVoucherNo.clearValidators();
    this.stockLedgerReportFormGroup.updateValueAndValidity();
  }

  Details: boolean = true;
  Summary: boolean = false;

  makeDetailsTrue() {
    this.Details = true;
    this.Summary = false;
  }

  makeSummaryTrue() {
    this.Summary = true;
    this.Details = false;
  }

  AsOnDate: boolean = true;
  DateRange: boolean = false;

  makeAsOnDateTrue() {
    this.AsOnDate = true;
    this.DateRange = false;
  }

  includeZeroBalance: boolean = true;
  excludeZeroBalance: boolean = false;

  makeIncludeZeroBalanceTrue() {
    this.includeZeroBalance = true;
    this.excludeZeroBalance = false;
  }

  makeExcludeZeroBalanceTrue(event: any) {
    const isExcluded = event.checked;
    this.includeZeroBalance = !isExcluded;
    this.excludeZeroBalance = isExcluded;
  }

  makeDateRangeTrue() {
    this.DateRange = true;
    this.AsOnDate = false;
  }

  PrintWithRef: boolean = true;
  PrintWithCheq: boolean = false;
  PrintWithAlloc: boolean = false;
  PrintWithAgainstAcc: boolean = false;
  PrintWithRelatedAccTrans: boolean = false;

  List_REPORT() {
    if (true) {
      if (true) {
        const stockLedgerParameters_Save: StockLedgerParameters = this
          .stockLedgerReportFormGroup.value as StockLedgerParameters;
        stockLedgerParameters_Save.rptAsOnDate =
          this.stockLedgerReportFormGroup.value.rptAsOnDate;

        stockLedgerParameters_Save.rptSummary = this.Summary;
        stockLedgerParameters_Save.rptDetails = this.Details;
        stockLedgerParameters_Save.rptDateRange = this.DateRange;
        stockLedgerParameters_Save.rptAsOnDate = this.AsOnDate;
        stockLedgerParameters_Save.rptPrintWithRelatedAccTrans =
          this.stockLedgerReportFormGroup.value.rptPrintWithRelatedAccTrans;

        stockLedgerParameters_Save.rptPrintWithRef = this.PrintWithRef;
        stockLedgerParameters_Save.rptPrintWithCheq = this.PrintWithCheq;
        stockLedgerParameters_Save.rptPrintWithAlloc = this.PrintWithAlloc;
        stockLedgerParameters_Save.rptPrintWithAgainstAcc =
          this.PrintWithAgainstAcc;
        stockLedgerParameters_Save.rptPrintWithRelatedAccTrans =
          this.PrintWithRelatedAccTrans;

        stockLedgerParameters_Save.rptHideZero = this.excludeZeroBalance;
        stockLedgerParameters_Save.rptIncludeZero = this.includeZeroBalance;
        stockLedgerParameters_Save.rptItemGroup =
          this.stockLedgerReportFormGroup.value.rptItemGroup;
        stockLedgerParameters_Save.rptJob =
          this.stockLedgerReportFormGroup.value.rptJob;
        stockLedgerParameters_Save.rptItem =
          this.stockLedgerReportFormGroup.value.rptItem;
        stockLedgerParameters_Save.rptLocation =
          this.stockLedgerReportFormGroup.value.rptLocation;
        stockLedgerParameters_Save.rptPartNo =
          this.stockLedgerReportFormGroup.value.rptPartNo;
        stockLedgerParameters_Save.rptNarration =
          this.stockLedgerReportFormGroup.value.rptNarration;
        stockLedgerParameters_Save.rptDtpAson =
          this.stockLedgerReportFormGroup.value.rptDtpAson;

        stockLedgerParameters_Save.rptDtpFrom =
          this.stockLedgerReportFormGroup.value.rptDtpFrom;
        stockLedgerParameters_Save.rptDtpTo =
          this.stockLedgerReportFormGroup.value.rptDtpTo;
        stockLedgerParameters_Save.rptTotDebit =
          this.stockLedgerReportFormGroup.value.rptTotDebit;
        stockLedgerParameters_Save.rptTotCredit =
          this.stockLedgerReportFormGroup.value.rptTotCredit;
        stockLedgerParameters_Save.rptTotRunningBalanceCreditDebit =
          this.stockLedgerReportFormGroup.value.rptTotRunningBalanceCreditDebit;

        this.storewarehouseapi
          .MainReport_GetReportStockLedger_PARAM_CLASS(
            stockLedgerParameters_Save
          )
          .subscribe((data) => {
            data.result.forEach((i: any) => {
              i.locationMasterLocationName = this.locationList?.find(
                (a) => a.value == i.stockRegisterLocationId
              )?.label;
            });
            this.allStockData = data.result;
            this.applyItemSearch();
          });
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.stockLedgerReportFormGroup.markAllAsTouched();
      this.stockLedgerReportFormGroup.markAsDirty();
    }
  }

  // Quick client-side filter on loaded results by item name
  itemSearchText: string = '';
  allStockData: ReportStockBaseUnit[] = [];

  onItemSearch(value: string) {
    this.itemSearchText = value || '';
    this.applyItemSearch();
  }

  applyItemSearch() {
    const term = this.itemSearchText.trim().toLowerCase();
    const filtered = term
      ? this.allStockData.filter((x) =>
          (x.itemMasterItemName || '').toLowerCase().includes(term)
        )
      : this.allStockData;
    this.reportStockBaseUnitarry = filtered;
    this.updateHot_Report(filtered);
    this.calculateStockTotals(filtered);
  }

  RunningBal: number;
  CalcRunningBal(DiffAmt: number) {
    this.RunningBal = this.RunningBal + DiffAmt;
    return this.RunningBal;
  }

  userTrackingLog(type) {
    let req = {
      page: 'StockReport',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      // vpNo: this.stockLedgerReportFormGroup.get(' ').value,
      vpType: 'StockReport',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  printAsPDF() {
    var css: string = `



#report {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;

}

#report td,
#report th {
  border: 1px solid #ddd;
  padding: 8px;

}

#report tr:nth-child(even) {
  background-color: #f2f2f2;
}

#report tr:hover {
  background-color: #ddd;
}

#report th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #dfe4e3;
  color: rgb(0, 0, 0);
  text-align: center;
}
.report {
  text-align: center;
  border-top: 3px dotted;
  border-bottom: 3px dotted;
}
.header {

  margin: auto;
  display: block;
  text-align: center;
}
    `;
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 22) {
      return Math.max(0, 22 - salesVoucherDetailsLength);
    }
  }

  exportToExcel(): void {
    if (this.reportStockBaseUnitarry.length > 0) {
      const data = this.reportStockBaseUnitarry.map((res) => ({
        Item_Id: res.stockRegisterMaterialId,
        PortNo: res.itemMasterPartNo,
        Item_Name: res.itemMasterItemName,
        Unit: res.unitMasterUnitShortName,
        Stock: res.stock,
        Rate: res.stockRegisterRate,
        Amount: res.stockRegisterAmount,
      }));

      this.excelService.exportAsExcelFile(
        ['Item_Id', 'PortNo', 'Item_Name', 'Unit', 'Stock', 'Rate', 'Amount'],
        data,
        'Stock-report'
      );
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Data Not Exist',
      });
    }
  }

  displayPrint() {
    this.displayPrintPreview = true;
    this.getAllStationMaster();
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
      // console.log(this.stationmasterObj);
    });
  }

  updateHot_Report(reportAccountsTransactions_update: ReportStockBaseUnit[]) {
    this.RunningBal = 0;
    // this.updateHot_Report(data.result);

    const gridData: GridData[] = reportAccountsTransactions_update.map((k) => {
      return {
        stockRegisterLocationId: k.stockRegisterLocationId,
        locationMasterLocationName: k.locationMasterLocationName,
        itemGroupNo: k.itemGroupNo,
        itemGroupName: k.itemGroupName,

        stockRegisterMatId: k.stockRegisterMaterialId,
        itemMasterPartNo: k.itemMasterPartNo,
        itemMasterItemName: k.itemMasterItemName,
        stockRegisterUnitId: k.stockRegisterUnitId,
        unitMasterUnitShortName: k.unitMasterUnitShortName,
        stock: k.stock,
        stockRegisterRate: k.stockRegisterRate.toFixed(2),
        stockRegisterAmount:
          Math.round(k.stock * Number(k.stockRegisterRate) * 100) / 100,
      };
    });

    this.reportaccountstransactions_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.stockLedgerReportFormGroup.updateValueAndValidity();

    if (this.Details) {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [
            0,
            // 1, // this.translate.instant( 'Loc. Name'),
            2,
            3, //       this.translate.instant('Group.Name'),
            //  this.translate.instant( 'Item.Id'),

            //   this.translate.instant('Part.No'),
            //   this.translate.instant('Item.Name'),
            7,

            // this.translate.instant('Unit.Name'),
            // this.translate.instant('Stock'),
            // this.translate.instant('Rate'),

            // this.translate.instant('Amount')
          ],
          indicators: false,
        },
      });
    } else {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [
            0,
            // 1, // this.translate.instant( 'Loc. Name'),
            2,
            3, //       this.translate.instant('Group.Name'),
            //  this.translate.instant( 'Item.Id'),
            //   this.translate.instant('Part.No'),
            //   this.translate.instant('Item.Name'),
            7,
            // this.translate.instant('Unit.Name'),
            // this.translate.instant('Stock'),
            10,
            11,
          ],
          indicators: false,
        },
      });
    }
  }
}

interface GridData {
  itemGroupNo?: number;
  itemGroupName?: string;
  stockRegisterMatId?: number;
  itemMasterPartNo?: string;
  itemMasterItemName?: string;
  stockRegisterLocationId?: number;
  locationMasterLocationName?: string;
  stockRegisterUnitId?: number;
  unitMasterUnitShortName?: string;
  stock?: number;
  stockRegisterRate?: string;
  stockRegisterAmount?: number;
}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const stockReportColumnObjList = (component: StockReportComponent) => [
  {
    data: 'stockRegisterLocationId',
    type: 'text',
    label: 'Loc.Id',
    toolTip: 'Location ID',
  },
  {
    data: 'locationMasterLocationName',
    type: 'text',
    label: 'Loc. Name',
    toolTip: 'Location Name',
  },
  {
    data: 'itemGroupNo',
    type: 'text',
    label: 'Group.Id',
    toolTip: 'Item Group ID',
  },
  {
    data: 'itemGroupName',
    type: 'text',
    label: 'Group.Name',
    toolTip: 'Item Group Name',
  },
  {
    data: 'stockRegisterMatId',
    type: 'text',
    label: 'Item ID',
    toolTip: 'Item ID',
  },
  {
    data: 'itemMasterPartNo',
    type: 'text',
    label: 'PartNo',
    toolTip: 'Part Number',
  },
  {
    data: 'itemMasterItemName',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
  },
  {
    data: 'stockRegisterUnitId',
    type: 'text',
    label: 'Unit.Id',
    toolTip: 'Unit ID',
  },
  {
    data: 'unitMasterUnitShortName',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit Name',
  },
  {
    data: 'stock',
    type: 'numeric',
    label: 'Stock',
    toolTip: 'Stock Quantity',
  },
  {
    data: 'stockRegisterRate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Item Rate',
  },
  {
    data: 'stockRegisterAmount',
    type: 'numeric',
    label: 'Amount',
    toolTip: 'Total Amount',
  },
];
