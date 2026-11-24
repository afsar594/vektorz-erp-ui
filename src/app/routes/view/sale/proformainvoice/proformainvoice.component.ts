import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  SelectItem,
} from 'primeng';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ProformaInvoiceService } from 'src/app/routes/service/proformaInvoice/proforma-invoice.service';
import { defaults } from 'src/app/shared/service/settings';
import { ProformaListComponent } from './proforma-list/proforma-list.component';
import { DialogService } from 'primeng/dynamicdialog';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ItemMaster } from 'src/app/routes/domain';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { ToWords } from 'to-words';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { ItemModifyComponent } from '../item-modify/item-modify.component';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { pid } from 'process';

@Component({
  selector: 'app-proformainvoice',
  templateUrl: './proformainvoice.component.html',
  styleUrls: ['./proformainvoice.component.scss'],
})
export class ProformainvoiceComponent implements OnInit {
  num: number = 123423;
  amountInWords: string = 'EIGHTY FIVE DIRHAMS AND ANYTHING';
  showAmountInWords: boolean = true;
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  index: number = 0;
  location: Array<string>;
  supplier: Array<string>;
  licensekey: any;
  gridHeader: string;
  assetsArray: Array<string>;
  PIForm: FormGroup;
  locationLocked = false;
  PIList: any;
  proformaInvoice: any;
  currentIndex: number = 0;
  listingTotalAmount: number = 0;
  totalDiscount: number = 0;
  breadcumbmodel: MenuItem[];
  btnFlag: ButtonFlag = {
    edit: false,
    cancel: false,
    save: true,
    update: false,
    delete: false,
  };
  lookupGridColumns = [];

  dataList: Array<any> = [];
  showSalesLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;

  disc: number = 5;
  GridDataList: any[];
  search: null;
  displayPrintPreview: boolean = false;
  discount: number;
  ScreenId: number;
  Permission: any;
  user: any;
  // roformaInvoice: any;
  handleChange(e) {
    this.index = e.index;
  }
  displayMaximizableUnit: boolean = false;

  // itemCols: Array<any> = [
  //   { header: 'Item Code', field: 'itemMasterItemId' },
  //   { header: 'Item Name', field: 'itemMasterItemName' }
  // ];
  unitAry: any;
  unitListt: any;
  units: any;
  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  UpdateItem: ItemMaster;

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  elementReference: ElementRef;
  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;
  JOBCOST: Boolean = false;
  displayMaximizableItems: boolean = false;
  locationArray: any[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  CustomerMasterArray: any[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];
  SalesManMasterArray: any[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];
  pdfSource: string;
  currencyList: SelectItem[];
  currArry: string[] = [];
  jobArray: any[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  proformaInvoiceGridData: GridData[] = [];
  hotid = 'ProformaInvoice';
  private hotRegisterer = new HotTableRegisterer();
  ProformaInvoiceEntry: Handsontable.GridSettings;
  confirmDropDatabaseDialogVisible = false;

  quantityArray: Array<number> = [];
  rateArray: Array<number> = [];
  discArray: Array<number> = [];
  netAmountArray: Array<number> = [];
  selectedItem: Array<any> = [];
  itemIterator: number = 0;
  rptFilter: ReportFilterModel;
  Obj: any;
  selectedUnit: Array<any> = [];
  listingTotalGrossAmount: number = 0;
  listingTotalRate: number = 0;
  listingTotalDisc: number = 0;
  listingTotalDiscAmount: number = 0;
  totalDiscountPer: number = 0;
  vatAmount: number = 0;
  vatAmountPer: number = 0;
  isServerSearch = false;
  @ViewChild('saleCtrl', { static: false }) salesmanCtrol: ElementRef;
  initializeControls() {
    this.ProformaInvoiceEntry = this.utilityService.getTableConfig(
      columnDetailList(this),
      []
    );

    this.ProformaInvoiceEntry.afterChange = (changes, source) => {
      if (changes != null) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(changes[0][0]);
        changes?.forEach(([row, prop, oldValue, newValue]) => {
          if (prop == 'qty' || prop == 'rate') {
            if (changes != null) {
              var qty = data[4];
              var price = data[5];
              var grossAmnt = qty * price;
              this.hotRegisterer
                .getInstance(this.hotid)
                .setDataAtCell(changes[0][0], 6, grossAmnt);
            }
            // this.ProformaInvoiceEntry.data.map(row => [...row]);
          }
        });
      }
    };

    this.ProformaInvoiceEntry.afterSelection = (row, column, row2, col2) => {
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);

      if (column === 0 && this.ProformaInvoiceEntry.readOnly === false) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item', 'Item ID'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.onSearch('');
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 2 && this.ProformaInvoiceEntry.readOnly === false) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.EditItem(data[2], data[0]);
      } else if (column === 3 && this.ProformaInvoiceEntry.readOnly === false) {
        this.isServerSearch = false;
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.onSearch('');
        this.showSalesLookUp = true;
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
      if (column == 0) {
        this.currentIndex = row;
        this.displayMaximizableItems = true;
      }
    };
    this.ProformaInvoiceEntry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showSalesLookUp = false;

      if (change[0][1] === 0) {
        this.showSalesLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };
    this.ProformaInvoiceEntry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private crystalReportService: CrystalReportService,
    private translate: TranslateService,
    private masterapi: MasterApiService,
    private PIService: ProformaInvoiceService,
    public dialogService: DialogService,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private printService: FileSaverService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private router: Router,

    private accountapi: AccountApiService,
  ) { }

  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      sales: kl?.itemMasterItemName,
      salesId: kl.itemMasterItemId,
      barcode: kl?.itemMasterBarcode,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      sales: kl?.unitMasterUnitShortName,
      salesId: kl.unitMasterUnitId,
    }));
  }

  ngOnInit(): void {
    this.PIForm = this.fb.group({
      Location: [''],
      PINo: [''],
      ID: [''],
      Customer: ['', Validators.required],
      PIDate: [''],
      SalesMan: [''],
      LPONo: ['', Validators.required],
      SelectaJob: [''],
      Currency: [''],
      LpoDate: [''],
      Remarks: ['', Validators.required],
      pITotalDisPer: [this.totalDiscountPer.toFixed(2)],
      pITotalDisAmount: [this.listingTotalDiscAmount.toFixed(2)],
      pITotalActualAmount: [0],
      pIGrossAmount: [0],
      pIVatPer: [5],
      pIVatAmt: [0],
      pINetAmount: [0],
      pIcustomerContact: [null],
      VoucherNo: [null],
      item: [''],
      termsofDelivery: [''],
      paymentterm: [''],
      projectRefNo: [''],
      deliveryRequriedOn: [''],
      // proformaInvoiceDetails: this.fb.array([])
    });

    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.stationmasterObj = this.permission.getStation();
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
    this.getReportType();
    this.initializeControls();

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };

    this.PIForm.disable();
    this.LoadLocationDDL();
  }

  get f() {
    return this.PIForm.controls;
  }

  isCallDDLs: boolean = false;

  loaddropdown(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();

    this.LoadItemDDL();
    this.LoadUnitDDL();
    this.LoadJobDDL();
    this.LoadSaleManDDL();
    this.LoadCurrencyDDL();
    this.LoadCustomerDDL();
    this.LoadLocationDDL();

  }

  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((m: any) => {
      this.units = m.resultSet.unitMasters;
      this.unitArray = m.resultSet.unitMasters;
      this.unitListt = m.resultSet.unitMasters?.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
    });
  }

  LoadSaleManDDL() {
    this.utilityService.LoadSaleManDropdown().subscribe((m: any) => {
      this.SalesManMasterArray = m.resultSet.saleManList;
      this.SalesManMasterList = m.resultSet.saleManList?.map((kl) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.SalesManMasterList.unshift({
        label: '--Select Sales Man--',
        value: -1,
      });
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
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m: any) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
    });
  }

  LoadCustomerDDL() {
    this.utilityService.LoadCustomerDropdown().subscribe((m: any) => {
      this.CustomerMasterArray = m.resultSet.customerMasters;
      this.CustomerMasterList = m.resultSet.customerMasters?.map((kl) => ({
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

  LoadCurrencyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((m: any) => {
      this.currArry = m.resultSet.currencyMasters;
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
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
        this.PIForm,
        'Location'
      );
    });
  }

  disableFields() {
    this.PIForm.controls['Location'].disable();
    this.PIForm.controls['PINo'].disable();
    this.PIForm.controls['ID'].disable();
    this.PIForm.controls['Customer'].disable();
    this.PIForm.controls['PIDate'].disable();
    this.PIForm.controls['SalesMan'].disable();
    this.PIForm.controls['LPONo'].disable();
    this.PIForm.controls['SelectaJob'].disable();
    this.PIForm.controls['Currency'].disable();
    this.PIForm.controls['LpoDate'].disable();
    this.PIForm.controls['Remarks'].disable();
  }

  pagedRequest: PagedRequest;
  onSearch(term: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m: any) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        sales: kl?.itemMasterItemName,
        salesId: kl?.itemMasterItemId,
      }));
      this.dataList = this.itemSetLookup;
    });
  }

  newEntry() {
    this.PIForm.controls['Location'].enable();
    this.utilityService.reapplyLocationLock(
      this.PIForm,
      'Location',
      this.locationLocked
    );
    this.PIForm.controls['PINo'].enable();
    this.PIForm.controls['ID'].enable();
    this.PIForm.controls['Customer'].enable();
    this.PIForm.controls['PIDate'].enable();
    this.PIForm.controls['SalesMan'].enable();
    this.PIForm.controls['LPONo'].enable();
    this.PIForm.controls['SelectaJob'].enable();
    this.PIForm.controls['Currency'].enable();
    this.PIForm.controls['LpoDate'].enable();
    this.PIForm.controls['Remarks'].enable();
  }

  ItemMasterArrayByName: any = null;
  unitDetailsConversionTypeNumber: number = 1;
  unitDetailsUnitPrice: number = 1;
  wordamt: string;
  funitid: number;

  selectsales(evt) {
    let trimmedSales = evt.sales.trim();
    const includesPcs = this.units.some((unit) =>
      unit.unitMasterUnitShortName.trim().includes(trimmedSales)
    );
    if (includesPcs && this.unitArray.length != 0) {
      const UnitId: string = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.salesId
      )?.unitMasterUnitShortName;
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, UnitId);
    } else {
      this.masterapi.GetUnitDetails(evt.salesId).subscribe((res) => {
        this.unitArray = res.result;
        this.unitArry = res.result.map((ar) =>
          ar.unitMasterUnitShortName?.trim()
        );
      });
      this.masterapi
        .GetItemMasterById({
          id: evt.salesId,
          customerId: this.PIForm.value.Customer,
        })
        .subscribe((k) => {
          // this.masterapi.GetItemMasterById(evt.salesId).subscribe(k => {
          this.ItemMasterArrayByName = k.resultSet?.itemMaster;
          const hot = this.hotRegisterer.getInstance(this.hotid);
          hot.setDataAtCell(
            this.currentIndex,
            0,
            this.ItemMasterArrayByName.itemMasterItemId
          );
          hot.setDataAtCell(
            this.currentIndex,
            1,
            this.ItemMasterArrayByName.itemMasterPartNo
          );
          hot.setDataAtCell(
            this.currentIndex,
            2,
            this.ItemMasterArrayByName.itemMasterItemName
          );
          hot.setDataAtCell(
            this.currentIndex,
            5,
            this.ItemMasterArrayByName.itemMasterLastPurchasePrice
          );
          this.unitDetailsConversionTypeNumber =
            this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType;
          this.unitDetailsUnitPrice =
            this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitPrice;
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(
              this.activeRow.row,
              5,
              this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitPrice
            );
          this.funitid =
            this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
          const UnitId: string =
            this.funitid != null
              ? this.unitListt?.find((l) => l.value == this.funitid).label
              : null;
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(this.activeRow.row, 3, UnitId);
          this.hotRegisterer
            .getInstance(this.hotid)
            .selectCell(this.activeRow.row, 4);
        });
    }
    if (this.selectItem != null) {
      this.showSalesLookUp = false;
    }
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
  LoadJobDDL() {
    this.accountapi.LoadDropdowjobMasters().subscribe((m: any) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
    });
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

  GetGrossTotal() {
    var value = 0;
    this.ProformaInvoiceEntry.data?.forEach((element: any) => {
      if (element && element.amt) {
        value += element.amt;
      }
    });
    this.PIForm.controls.pIGrossAmount.setValue(value);
    return value;
  }
  GetSaleMan(id) {
    const salesMan = this.SalesManMasterArray?.find(
      (l) => l.salesManMasterSalesManId == id
    );
    if (salesMan) {
      return salesMan.salesManMasterSalesManName;
    }
  }

  new() {
    this.loaddropdown(false);
    this.PIForm.reset();
    this.ProformaInvoiceEntry.data = [];
    this.ProformaInvoiceEntry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.ProformaInvoiceEntry);
    this.PIForm.get('PIDate').setValue(new Date());
    this.PIForm.get('LpoDate').setValue(new Date());
    this.PIForm.get('pITotalActualAmount').setValue(0);
    this.PIForm.get('pIGrossAmount').setValue(0);
    this.PIForm.get('pIVatPer').setValue(5);
    this.PIForm.get('pIVatAmt').setValue(0);
    this.PIForm.get('pINetAmount').setValue(0);
    this.PIForm.get('pITotalDisPer').setValue(0);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.search = null;
    this.index = 0;
    this.PIForm.enable();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(this.PIForm, 'Location');
    }
    this.GetDefaultSettings();
    // this.getDefaultCurrency();
    // this.getDefaultCurrency();
    // this.getDefaultLocation();
    // this.f./.clearValidators();
    this.PIForm.updateValueAndValidity();
  }

  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m: any) => {
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
          this.f.Currency.setValue(Number(this.DefCurrency));
        }
      }
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );
      if (DEFAULT_LOCATION != null) {
        this.DefLocationCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocationCheck !== null) {
          const splitText = this.DefLocationCheck.split('::');
          this.DefLocation = splitText[1]?.trim();
          if (!this.locationLocked) {
            this.f.Location.setValue(Number(this.DefLocation));
          }
        }
      }
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      if (jobcal == true) {
        this.JOBCOST = true;
      }
    });
  }

  changeDiscountPer() {
    var value = 0;
    if (this.GetGrossTotal() > 0) {
      value = Number((this.GetGrossTotal() / 100) * this.f.pITotalDisPer.value);
      this.f.pITotalDisAmount.setValue(value);
      this.getNetTotal();
    } else {
      this.f.pITotalDisAmount.setValue(value);
      this.getNetTotal();
    }
    return value;
  }

  changeDiscountAmnt() {
    var value = 0;
    if (this.GetGrossTotal() > 0) {
      value = Number(
        (this.f.pITotalDisAmount.value / Number(this.GetGrossTotal())) * 100
      );
      this.f.pITotalDisPer.setValue(value), this.getNetTotal();
    } else {
      this.f.pITotalDisPer.setValue(value);
      this.getNetTotal();
    }
    return value;
  }

  getNetTotal() {
    var value =
      this.GetGrossTotal() +
      this.getVatAmount() -
      Number(this.f.pITotalDisAmount.value);
    this.f.pITotalActualAmount.setValue(value);
    return value;
  }

  getVatAmount() {
    let vatAmount: any = 0;
    if (this.GetGrossTotal()) {
      vatAmount = (this.GetGrossTotal() / 100) * Number(this.f.pIVatPer.value);
      this.f.pIVatAmt.setValue(vatAmount);
    } else {
      this.f.pIVatAmt.setValue(0);
    }
    return vatAmount;
  }

  GetCustomerContact(id) {
    let cutomerId = Number(id);
    const cust = this.CustomerMasterArray?.find(
      (l) => l.customerMasterCustomerNo == cutomerId
    );
    if (cust) {
      this.f.pIcustomerContact.setValue(
        cust.customerMasterCustomerContactPerson
      );

      return cust.customerMasterCustomerContactPerson;
    }
  }
  GetCustomer(id) {
    let cutomerId = Number(id);
    const cust = this.CustomerMasterArray?.find(
      (l) => l.customerMasterCustomerNo == cutomerId
    );
    if (cust) {
      return cust.customerMasterCustomerName;
    }
  }
  onCustomerSelect(event: any) {
    this.GetCustomerContact(event.value);
  }

  getAllSalesManMaster() {
    this.masterapi.GetAllSalesman().subscribe((k) => {
      this.SalesManMasterArray = k;
      this.SalesManMasterList = k.map((kl) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.SalesManMasterList.unshift({
        label: '--Select Sales Man--',
        value: -1,
      });
      this.SalesManMasterArry = k.map(
        (ar) =>
          ar.salesManMasterSalesManName?.trim() +
          '|' +
          ar.salesManMasterSalesManId
      );
    });
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = k.map((ar) => ar.currencyMasterCurrencyName?.trim());

      const uaeDarhamIndex = this.currencyList?.findIndex(
        (c) => c.label === 'UAE Darham'
      );
      this.PIForm.get('Customer').setValue(
        this.currencyList[uaeDarhamIndex]?.label
      );
      // const customer = this.CustomerMasterArray?.find(
      //   (customer) => customer.customerMasterCustomerName === customerName
      // );
      // return customer ? customer.customerMasterCustomerNo : null;
    });
  }

  displayPrint() {
    this.displayPrintPreview = true;
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
       .rectImg {
           height: 140px;
          width: 217px;
        }

    .squreImg {
    height: 145px;
    width: 145px;
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
      padding-top: 6px;
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
     }`;
    var data = document.getElementById('print');
    // let html: any = document.getElementById('print');
    // this.printService.saveAsPDF(data, 'saleVoucherPDF');
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
  }

  userTrackingLog(type) {
    let req = {
      page: 'Proforma Invoice',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.PIForm.get('PINo').value?.toString(),
      vpType: 'Proforma Invoice',
      vpUserId: this.user?.userId,
    };

    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      // console.log('Response:', res);
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

  PIreq() {
    const savedData: any = this.ProformaInvoiceEntry.data?.filter((k) =>
      k.hasOwnProperty('itemname')
    );

    const PI_Save: ProformaInvoice = this.PIForm.value as ProformaInvoice;
    (PI_Save.item = this.PIForm.controls.item?.value),
      (PI_Save.termsofDelivery = this.PIForm.controls.termsofDelivery?.value),
      (PI_Save.projectRefNo = this.PIForm.controls.projectRefNo?.value),
      (PI_Save.deliveryRequriedOn = this.PIForm.controls.deliveryRequriedOn?.value),
      (PI_Save.proformaInvoiceLocationId = this.PIForm.controls.Location?.value),
      (PI_Save.proformaInvoiceCustCode = this.PIForm.controls.Customer?.value),
      (PI_Save.proformaInvoiceDate = this.PIForm.controls.PIDate?.value),
      (PI_Save.proformaInvoiceSalesManId =
        this.PIForm.controls.SalesMan?.value),
      (PI_Save.proformaInvoiceLpoNo = this.PIForm.controls.LPONo?.value),
      (PI_Save.proformaInvoiceLpoDate = this.PIForm.controls.LpoDate?.value),
      (PI_Save.proformaInvoiceCurrencyId =
        this.PIForm.controls.Currency?.value),
      (PI_Save.proformaInvoiceJobId = this.PIForm.controls.SelectaJob?.value),
      (PI_Save.proformaInvoiceRemarks = this.PIForm.controls.Remarks?.value),
      (PI_Save.proformaInvoiceId = this.proformaInvoice
        ? this.proformaInvoice.proformaInvoiceId
        : 0),
      (PI_Save.paymentterm = this.PIForm.controls.paymentterm.value),
      (PI_Save.proformaInvoiceDiscountPercentage = this.changeDiscountAmnt()),
      (PI_Save.proformaInvoiceDiscountAmount = this.changeDiscountPer()),
      (PI_Save.proformaInvoiceTotal = this.GetGrossTotal()),
      (PI_Save.proformaInvoiceGrandTotal = this.getNetTotal()),
      (PI_Save.proformaInvoiceFsno = null),
      (PI_Save.proformaInvoiceUserId = null),
      (PI_Save.proformaInvoiceSubject = null),
      (PI_Save.proformaInvoiceNote = null),
      (PI_Save.proformaInvoiceWarranty = null),
      (PI_Save.proformaInvoiceTraining = null),
      (PI_Save.proformaInvoiceTechnicalDetails = null),
      (PI_Save.proformaInvoiceTerms = null),
      (PI_Save.proformaInvoiceCpoAboutIt = null),
      (PI_Save.proformaInvoiceCpoDeliveryTime = null),
      (PI_Save.proformaInvoicePacking = null),
      (PI_Save.proformaInvoiceQuatationId = null),
      (PI_Save.proformaInvoiceQuality = null),
      (PI_Save.proformaInvoiceIsLocalPurchase = null),
      (PI_Save.proformaInvoiceVatPer = this.PIForm.controls.pIVatPer.value),
      (PI_Save.proformaInvoiceVatAmount = this.PIForm.controls.pIVatAmt.value),
      (PI_Save.proformaInvoiceDelStatus = null),
      (PI_Save.contectPerson = this.PIForm.controls.pIcustomerContact.value),
      (PI_Save.proformaInvoiceVoucherno = this.PIForm.controls.VoucherNo.value),
      (PI_Save.proformaInvoiceDetails = savedData
        ?.filter((k) => k.itemname != null)
        .map((k: GridData) => {
          return {
            proformaInvoiceDetailsId: k.id != null ? k.id : 0,
            proformaInvoiceDetailsSlNo:
              this.PIForm.getRawValue().proformaInvoiceNo,
            proformaInvoiceDetailsItemId: k.code, //this.ItemMasterArray?.find(x => x.itemMasterItemName?.trim()== k.itemname?.trim())?.itemMasterItemId,
            proformaInvoiceDetailsQty: k.qty,
            proformaInvoiceDetailsDiscAmount: Number(k.disc),
            ProformaInvoiceDetailsUnitPrice: k.rate,
            proformaInvoiceDetailsFcAmountx: k.netAmt,
            ProformaInvoiceDetailsAmount: k.amt,
            proformaInvoiceDetailsRemarks: k.remarks,
            // ProformaInvoiceDetailsRemarks: 0,
            proformaInvoiceDetailsUnitId:
              k.unit != null && k.unit != ''
                ? this.units?.find(
                  (x) => x.unitMasterUnitShortName?.trim() === k.unit?.trim()
                ).unitMasterUnitId
                : null,
            proformaInvoiceDetailsDescription: k.itemname,
            proformaInvoiceDetailsDelStatus: false,
          };
        }));
    if (this.btnFlag.save) {
      this.addProformaInvoice(PI_Save);
    } else {
      this.updatePI(PI_Save);
    }
    // this.addProformaInvoice(PI_Save);
  }

  addProformaInvoice(PI_Save: ProformaInvoice) {
    // this.PIForm.markAllAsTouched();
    if (this.PIForm.valid) {
      this.GridDataList = PI_Save.proformaInvoiceDetails;

      this.confirmation.confirm({
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.PIService.addProformInvice(PI_Save).subscribe(
            (response: any) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };

              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: this.translate.instant(
                  'Proforma Invoice Saved Succesfully'
                ),
              });
              this.updateFormGrid(response);
              this.userTrackingLog('Insert');
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Proforma Invoice Save Failed'),
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
      this.PIForm.markAllAsTouched();
      this.PIForm.markAsDirty();
    }
  }

  updatePI(PI_Save: ProformaInvoice) {
    if (this.PIForm.valid) {
      this.confirmation.confirm({
        // key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to update existing voucher?'
        ),
        accept: () => {
          this.PIService.editProformInvice(PI_Save).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.updateFormGrid(data);
              this.userTrackingLog('Update');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: this.translate.instant(
                  'Proforma Invoice Updated Succesfully'
                ),
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant(
                  'Proforma Invoice Update Failed'
                ),
              });
            }
          );
          // }
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.PIForm.markAllAsTouched();
      this.PIForm.markAsDirty();
    }
  }

  cancelAll() {
    this.PIForm.reset();
  }

  deletePI() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete ?',
      accept: () => {
        this.PIService.deletePI(
          this.proformaInvoice.proformaInvoiceId
        ).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: this.translate.instant(
                'Proform Invoice Deleted Succesfully'
              ),
            });
            this.userTrackingLog('Delete');
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
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
  }

  updateFormGrid(proformaInvoice_update: any) {
    this.PIForm.patchValue({
      VoucherNo: proformaInvoice_update?.proformaInvoiceVoucherno,
      Location: this.locationLocked
        ? this.PIForm.get('Location')?.value
        : proformaInvoice_update?.proformaInvoiceLocationId,
      PINo: proformaInvoice_update?.proformaInvoiceId,
      ID: proformaInvoice_update?.proformaInvoiceId,
      Customer: Number(proformaInvoice_update?.proformaInvoiceCustCode),
      PIDate: new Date(proformaInvoice_update?.proformaInvoiceDate),
      SalesMan: proformaInvoice_update?.proformaInvoiceSalesManId,
      LPONo: proformaInvoice_update?.proformaInvoiceLpoNo,
      SelectaJob: proformaInvoice_update?.proformaInvoiceJobId,
      Currency: proformaInvoice_update?.proformaInvoiceCurrencyId,
      LpoDate: new Date(proformaInvoice_update?.proformaInvoiceLpoDate),
      Remarks: proformaInvoice_update?.proformaInvoiceRemarks,
      pITotalActualAmount: Number(
        proformaInvoice_update?.proformaInvoiceGrandTotal
      ),
      pITotalDisAmount: Number(
        proformaInvoice_update?.proformaInvoiceDiscountAmount
      ),
      pITotalDisPer: Number(
        proformaInvoice_update?.proformaInvoiceDiscountPercentage
      ),
      pIGrossAmount: Number(proformaInvoice_update?.proformaInvoiceTotal),
      pIcustomerContact: proformaInvoice_update.pIcustomerContact,
      pIVatPer: proformaInvoice_update?.proformaInvoiceVatPer,
      pIVatAmt: proformaInvoice_update?.proformaInvoiceVatAmount,
      termsofDelivery: proformaInvoice_update?.termsofDelivery,
      projectRefNo: proformaInvoice_update?.projectRefNo,
      deliveryRequriedOn: proformaInvoice_update?.deliveryRequriedOn,
      item: proformaInvoice_update?.item,
      paymentterm: proformaInvoice_update?.paymentterm,
    });

    const gridData: any[] = proformaInvoice_update.proformaInvoiceDetails.map(
      (k) => {
        const itemId: string =
          k.proformaInvoiceDetailsItemId != null
            ? this.ItemMasterList?.find(
              (l) => l.value == k.proformaInvoiceDetailsItemId
            )?.label
            : null;
        const UnitId: string =
          k.proformaInvoiceDetailsUnitId != null
            ? this.unitListt?.find(
              (l) => l.value == k?.proformaInvoiceDetailsUnitId
            )?.label
            : null;
        return {
          code: k.proformaInvoiceDetailsItemId,
          // itemname: itemId,
          partNo: 123,
          unit: UnitId,
          qty: k.proformaInvoiceDetailsQty,
          rate: k.proformaInvoiceDetailsUnitPrice,
          // disc: k.proformaInvoiceDetailsDiscAmount,
          amt: k.proformaInvoiceDetailsAmount,
          id: k.proformaInvoiceDetailsId,
          // grossAmt: k.proformaInvoiceDetailsGrossAmount,
          vatPer: 5,
          vatAmt: (k.proformaInvoiceDetailsFcAmount / 5) * 100,
          remarks: k.proformaInvoiceDetailsRemarks,
          itemname: k.proformaInvoiceDetailsDescription,
        };
      }
    );

    this.ProformaInvoiceEntry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.PIForm.disable();
    this.PIForm.updateValueAndValidity();
  }
  printbtn: MenuItem[];
  getReportType() {
    this.masterapi.General('Proforma').subscribe((res: any) => {
      this.printbtn = res.map((r: any) => ({
        label: r.reportTypeDescription,
        command: () => this.crystalReport(r.reportTypeFileName),
      }));
    });
  }
  crystalReport(type) {
    this.rptFilter = {
      ReportName: type,
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_Proforma where Proforma_Invoice_Id='${this.PIForm.getRawValue().ID
        }'`,
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

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    // this.f.salesVoucherNo.clearValidators();
    this.PIForm.enable();
    this.utilityService.reapplyLocationLock(
      this.PIForm,
      'Location',
      this.locationLocked
    );
    this.PIForm.updateValueAndValidity();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: true,
      delete: false,
      new: false,
    };
  }

  getByIdPI(id) {
    this.PIService.getPIById(id).subscribe((res) => {
      this.btnFlag = {
        edit: true,
        cancel: true,
        save: false,
        update: true,
        delete: true,
      };
      this.proformaInvoice = res;
      this.updateFormGrid(res);
    });
  }

  proformaList() {
    this.loaddropdown(false);
    const ref = this.dialogService.open(ProformaListComponent, {
      data: {
        PIData: this.PIList,
        custList: this.CustomerMasterArray,
      },
      header: 'Proforma Invoice',
      width: '70%',
    });
    ref.onClose.subscribe((res) => {
      if (res) {

        this.getByIdPI(res);
      }
    });
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    )?.itemMasterItemName;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
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
                    this.UpdateItem?.itemMasterItemId
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
                // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row,3, this.UpdateItem?.unitDetails[0]?.unitDetailsUnitPrice);
                // this.hotRegisterer.getInstance(this.hotid).setDataAtCell( this.activeRow.row,9,this.UpdateItem?.unitDetails[0]?.unitDetailsUnitCost);
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
}

interface GridData {
  code?: any;
  partNo?: any;
  itemname?: any;
  unit?: any;
  qty?: number;
  rate?: number;
  amt?: number;
  disc?: number;
  grossAmt?: number;
  vatPer?: number;
  vatAmt?: number;
  netAmt?: number;
  remarks?: string;
  jobname?: string;
  costcenter?: string;
  id?: number;
}

export interface ProformaInvoice {
  proformaInvoiceCpoAboutIt?: string;
  proformaInvoiceCpoDeliveryTime?: number;
  proformaInvoiceCurrencyId?: number;
  proformaInvoiceCustCode?: number;
  proformaInvoiceCustName?: any;
  proformaInvoiceDate?: number;
  contectPerson?: string;
  proformaInvoiceDelStatus?: boolean;
  // proformaInvoiceDetails?: number;
  proformaInvoiceDiscountAmount?: number;
  proformaInvoiceDiscountPercentage?: number;
  proformaInvoiceFsno?: number;
  proformaInvoiceGrandTotal?: number;
  proformaInvoiceId?: number;
  proformaInvoiceIsLocalPurchase?: boolean;
  proformaInvoiceJobId?: number;
  proformaInvoiceLocationId?: number;
  proformaInvoiceLpoDate?: Date;
  proformaInvoiceLpoNo?: string;
  proformaInvoiceNote?: string;
  proformaInvoicePacking?: string;
  proformaInvoiceQuality?: string;
  proformaInvoiceQuatationId?: string;
  proformaInvoiceRemarks?: string;
  proformaInvoiceSalesManId?: number;
  proformaInvoiceSubject?: string;
  proformaInvoiceTechnicalDetails?: string;
  proformaInvoiceTerms?: string;
  proformaInvoiceTotal?: number;
  proformaInvoiceTraining?: string;
  proformaInvoiceUserId?: number;
  proformaInvoiceWarranty?: string;
  proformaInvoiceVatPer: number;
  proformaInvoiceVatAmount: number;
  proformaInvoiceVoucherno: string;
  item: string;
  termsofDelivery: string;
  paymentterm: string;
  projectRefNo: string;
  deliveryRequriedOn: string;
  proformaInvoiceDetails?: ProformaInvoiceDetails[];
}

export interface ProformaInvoiceDetails {
  proformaInvoiceDetailsId?: number;
  proformaInvoiceDetailsSlNo?: number;
  proformaInvoiceDetailsItemId?: number;
  proformaInvoiceDetailsDescription?: string;
  proformaInvoiceDetailsUnitId?: number;
  proformaInvoiceDetailsQty?: number;
  proformaInvoiceDetailsUnitPrice?: number;
  proformaInvoiceDetailsAmount?: number;
  proformaInvoiceDetailsFcAmount?: number;
  proformaInvoiceDetailsIsEdited?: boolean;
  proformaInvoiceDetailsFsno?: number;
  proformaInvoiceDetailsDeliveryQty?: number;
  proformaInvoiceDetailsPodId?: number;
  proformaInvoiceDetailsQuotationDetId?: number;
  proformaInvoiceDetailsRemarks?: string;
  proformaInvoiceDetailsDelStatus?: boolean;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
export const columnDetailList = (component: ProformainvoiceComponent) => [
  {
    data: 'code',
    type: 'text',
    label: 'Code',
    toolTip: 'Code',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'PartNo',
    toolTip: 'Part Number',
  },
  {
    data: 'itemname',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
  },
  {
    data: 'unit',
    type: 'text',
    source: component.unitArry,
    label: 'Unit',
    toolTip: 'Unit',
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Quantity',
    toolTip: 'Quantity',
    readOnly: false,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Price',
    toolTip: 'Rates',
    readOnly: false,
  },
  {
    data: 'amt',
    type: 'numeric',
    label: 'Amount',
    toolTip: 'Amount',
  },
  {
    data: 'remarks',
    type: 'text',
    label: 'Remark',
    toolTip: 'Remarks',
    readOnly: false,
  },
];
