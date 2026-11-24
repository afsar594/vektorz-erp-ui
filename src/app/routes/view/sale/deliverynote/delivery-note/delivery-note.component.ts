import { Component, ElementRef, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { SelectItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { Observable, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ItemMaster } from 'src/app/routes/domain';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { DeliveryNote } from 'src/app/routes/domain/Sales/DeliveryNote';
import { DeliveryNoteDetails } from 'src/app/routes/domain/Sales/DeliveryNoteDetails';
import { CredentialKeys } from 'src/app/routes/Enums/loginInfo';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { defaults } from 'src/app/shared/service/settings';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { StationMaster } from '../../../../domain/Administration/StationMaster';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SalesOrderStatusComponent } from './sales-order-status/sales-order-status.component';
import { ItemModifyComponent } from '../../item-modify/item-modify.component';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ExportFormatType, ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';

@Component({
  selector: 'app-delivery-note',
  templateUrl: './delivery-note.component.html',
  styleUrls: ['./delivery-note.component.scss'],
})
export class DeliveryNoteComponent implements OnInit {
  activeRowCustomerlookUp: { row: number; column: number };
  showCustomerLookUp: boolean = false;
  selectCustomer: any;
  lookupGridCustomerColumns = ['Customer Name', 'Customer ID'];
  confirmDropDatabaseDialogVisible = false;
  btnFlag: ButtonFlag;
  search: string = null;
  index: number = 0;
  displayMaximizable: boolean;
  stationmasterObj: StationMaster;
  breadcumbmodel: MenuItem[];
  control: AbstractControl;
  Obj: any;
  UpdateItem: any;

  currencyList: SelectItem[];
  currArry: string[] = [];

  CodeArry: string[] = [];

  ItemMasterArrayByName: any = null;
  funitid: number;

  lookupGridColumns = [];
  dataList: Array<any> = [];
  showSalesLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  ScreenId: number;
  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  conversion_Type: number;

  licensekey: string;
  elementReference: ElementRef;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  deliveryNotearry: DeliveryNote[] = [];
  savedDeliveryNote: DeliveryNote;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'deliveryNoteEntry';
  displayPrintPreview: boolean = false;
  selectedLocation: any;
  selectedLocationId: any;
  selectedCustomerId: any;
  units: any;

  Permission: any;
  selectedITem: SelectItem[];
  saleOrder: any;
  user: any;
  pdfSource: string;
  // Permission_add:any
  // Permission_delete:any
  // Permission_edit:any
  // Permission_print:any
  // Permission_view:any
  isServerSearch = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private permission: PermissionsService,
    private printService: FileSaverService,
    public dialogService: DialogService,
    private utilityService: UtilityService,
    private salesapi: SalesApiService,
    private accountapi: AccountApiService,
    public crystalReportService: CrystalReportService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  ref: DynamicDialogRef;
  title: string;
  deliverynoteentry: Handsontable.GridSettings;
  DeliveryNoteFormGroup: FormGroup;
  locationLocked = false;
  cols;
  hideRateAndAmount: boolean = false;
  ngOnInit(): void {
    console.log("Del note");


    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
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
    this.cols = [
      { field: 'customerDeliveryNoteDeliveryId', header: 'DeliveryNo' },
      { field: 'customerDeliveryNoteLocationId', header: 'LocationId' },
      { field: 'customerDeliveryNoteCustomerName', header: 'Customer' },
      { field: 'customerDeliveryNoteAttention', header: 'Attention' },

      { field: 'customerDeliveryNoteDeliveryDate', header: 'DeliveryDate' },
      { field: 'customerDeliveryNoteCpoId', header: 'PONo' },
      { field: 'customerDeliveryNoteCpoDate', header: 'PODate' },
      { field: 'Action', header: 'View' },
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

    this.DeliveryNoteFormGroup = this.fb.group({
      customerDeliveryNoteLocationId: [null],
      customerDeliveryNoteCustomerName: [null, Validators.required],
      customerDeliveryNoteCustomerCode: [null],
      customerDeliveryNoteSalesManId: [null],
      customerDeliveryNoteAttention: [null],
      customerDeliveryNoteDeliveryAddress: [null],
      customerDeliveryNoteDeliveryId: [null],
      customerDeliveryNoteDriver: [null],
      customerDeliveryNoteVehicleNo: [null],
      customerDeliveryNoteDeliveryDate: [new Date()],
      customerDeliveryNoteCpoId: [null],
      customerDeliveryNoteCpoDate: [new Date()],
      customerDeliveryNoteRemarks: [null],
      customerDeliveryNoteUserId: [null],
      customerDeliveryNoteCurrencyId: [null],
      customerDeliveryNoteJobID: [null],
      customerDeliveryNoteNo: [null],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.DeliveryNoteFormGroup.disable();
    this.loadHideRateAmountSetting();
    this.LoadLocationDDL();
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
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        sales: kl?.itemMasterItemName,
        salesId: kl?.itemMasterItemId,
      }));
      this.dataList = this.itemSetLookup;
    });
  }
  printbtn: MenuItem[];
  getReportType() {
    this.masterapi.General('DeliveryNote').subscribe((res: any) => {
      this.printbtn = res.map((r: any) => ({
        label: r.reportTypeDescription,
        command: () => this.showPrint(r.reportTypeFileName),
      }));
    });
  }

  rptFilter: ReportFilterModel;
  showPrint(type) {
    if (type === 'DeliveryNote') {
      this.rptFilter = {
        ReportName: type,
        SelectionFormula:  `{Customer_Delivery_Note.Customer_Delivery_Note_Delivery_ID} = ${this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteDeliveryId}`,
        Parameters: [],
        Queries: [
          // `select * from vw_DeliveryNote where Customer_Delivery_Note_Delivery_ID ='${this.DeliveryNoteFormGroup.getRawValue()
          //   .customerDeliveryNoteDeliveryId
          // }'`,
        ],
        SP_Queries: [],
        ExportType: ExportFormatType.PortableDocFormat,

      }
    } else {

      this.rptFilter = {
        ReportName: type,
        SelectionFormula: '',
        Parameters: [],
        Queries: [
          `select * from vw_DeliveryNote where Customer_Delivery_Note_Delivery_ID ='${this.DeliveryNoteFormGroup.getRawValue()
            .customerDeliveryNoteDeliveryId
          }'`,
        ],
        SP_Queries: [],
      };
    }
    this.crystalReportService
      .getReportPrint(this.rptFilter, type === 'DeliveryNote' ? false : true)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  openModal() {
    const ref = this.dialogService.open(SalesOrderStatusComponent, {
      header: 'Sales Order Status',
      width: '90%',
      contentStyle: { height: '90%', overflow: 'auto' },
      data: {
        selectedLocation: this.DeliveryNoteFormGroup.get(
          'customerDeliveryNoteLocationId'
        ).value,
        selectedCustomer: this.selectedCustomerId,
        label: 'DeliveryNote',
      },
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.saleOrder = res;
        const itemIds = res.map((item) => item.customerQuotationDetailsItemId);
        this.saleOrder.push(res.map((item) => item.customerQuotationQid));

        const firstItem = res[0];
        if (firstItem) {
          this.setCustomerFromBrowse(firstItem);
        }

        this.BrowsValue(res);
      }
    });
  }

  BrowsValue(item) {
    let activeRow = { row: 0, column: 0 };

    item.forEach((k) => {
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      hotInstance.setDataAtCell(activeRow.row, activeRow.column, k?.itemId);
      hotInstance.setDataAtCell(activeRow.row, 1, k?.partNo);
      hotInstance.setDataAtCell(activeRow.row, 2, k?.matDes);
      hotInstance.setDataAtCell(
        activeRow.row,
        4,
        k?.balancedQuantity == null ? k.quantity : k?.balancedQuantity
      );
      const unit = this.units?.find((l) => l.unitMasterUnitId === k.unitId);
      hotInstance.setDataAtCell(
        activeRow.row,
        3,
        unit ? unit.unitMasterUnitShortName : ''
      );
      hotInstance.setDataAtCell(activeRow.row, 5, k?.cpodId);
      hotInstance.setDataAtCell(activeRow.row, 6, k?.cpoId);
      hotInstance.setDataAtCell(activeRow.row, 7, k?.unitPrice);

      hotInstance.setDataAtCell(activeRow.row, 8, k?.remarks);

      activeRow.row += 1;
    });
  }

  setCustomerFromBrowse(item: any) {
    const name: string = item?.customerName;
    if (!name) return;

    const record = this.CustomerMasterArray?.find(
      (k) => k.customerMasterCustomerName?.trim() === name.trim()
    );

    if (record) {
      this.selectedCustomerId = record.customerMasterCustomerNo;
      const label =
        record.customerMasterCustomerReffAcNo != null
          ? record.customerMasterCustomerName + ' -- ' + record.customerMasterCustomerReffAcNo
          : record.customerMasterCustomerName;
      this.DeliveryNoteFormGroup.get('customerDeliveryNoteCustomerName').setValue(label);
    } else {
      // CustomerMasterArray not loaded yet — load it then retry
      this.accountapi.LoadCustomerDropdown().subscribe((m) => {
        this.CustomerMasterArray = m.resultSet.customerMasters;
        this.CustomerMasterList = m.resultSet.customerMasters?.map((kl) => ({
          label:
            kl.customerMasterCustomerReffAcNo != null
              ? kl.customerMasterCustomerName + ' -- ' + kl.customerMasterCustomerReffAcNo
              : kl.customerMasterCustomerName,
          value: kl.customerMasterCustomerNo,
        }));
        const found = this.CustomerMasterArray?.find(
          (k) => k.customerMasterCustomerName?.trim() === name.trim()
        );
        if (found) {
          this.selectedCustomerId = found.customerMasterCustomerNo;
          const label =
            found.customerMasterCustomerReffAcNo != null
              ? found.customerMasterCustomerName + ' -- ' + found.customerMasterCustomerReffAcNo
              : found.customerMasterCustomerName;
          this.DeliveryNoteFormGroup.get('customerDeliveryNoteCustomerName').setValue(label);
        } else {
          this.DeliveryNoteFormGroup.get('customerDeliveryNoteCustomerName').setValue(name);
        }
      });
    }
  }

  get f() {
    return this.DeliveryNoteFormGroup.controls;
  }

  callDDLs: boolean = false;
  callDropdowns(reload: any) {
    if (!this.callDDLs || reload) {
      this.LoadJobDDL();
      this.LoadItemDDL();
      this.LoadUnitDDL();
      this.LoadSaleManDDL();
      this.LoadCurrencyDDL();
      this.LoadCustomerDDL();
      this.LoadLocationDDL();
      this.callDDLs = true;
    }
  }

  initializeControls() {
    this.deliverynoteentry = this.utilityService.getTableConfig(
      columnDetailList(this),
      [5, 6]
    );

    this.deliverynoteentry.afterChange = (changes, source) => {
      if (changes != null) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(changes[0][0]);
        changes?.forEach(([row, prop, oldValue, newValue]) => {
          if (prop == 'qty' || prop == 'rate') {
            if (changes != null) {
              var qty = data[4];
              var price = data[7];
              var grossAmnt = qty * price;
              this.hotRegisterer
                .getInstance(this.hotid)
                .setDataAtCell(changes[0][0], 8, grossAmnt);
            }
            // this.ProformaInvoiceEntry.data.map(row => [...row]);
          }
          if (prop == 'qty') {
            this.ColumnSum();
          }
        });
      }
    };
    this.deliverynoteentry.afterSelection = (
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

      if (column === 0 && this.deliverynoteentry.readOnly === false) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item Name', 'Item ID'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.onSearch('');
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 2 && this.deliverynoteentry.readOnly === false) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.activeRow = { row, column };
        this.EditItem(data[2], data[0]);
      } else if (column === 3 && this.deliverynoteentry.readOnly === false) {
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
      } else {
        this.showSalesLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.sales == x);
      } else {
        this.selectItem = {};
      }
    };

    this.deliverynoteentry.afterRemoveRow = (index: number, Code: number) => {
      this.ColumnSum();
    };

    this.deliverynoteentry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }
  LoadUnitDDL() {
    this.accountapi.LoadDropdownunitMasters().subscribe((m) => {
      this.units = m.resultSet.unitMasters;
      this.unitArray = m.resultSet.unitMasters;
      this.unitList = m.resultSet.unitMasters?.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
    });
  }
  LoadSaleManDDL() {
    this.accountapi.LoadSaleManDropdown().subscribe((m) => {
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
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
    });
  }
  LoadCustomerDDL() {
    this.accountapi.LoadCustomerDropdown().subscribe((m) => {
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
    this.accountapi.LoadDropdowCurrencyMaster().subscribe((m) => {
      this.currArry = m.resultSet.currencyMasters;
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
    });
  }

  LoadLocationDDL() {
    this.accountapi.LoadDropdownLocationMaster().subscribe((m) => {
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
        this.DeliveryNoteFormGroup,
        'customerDeliveryNoteLocationId'
      );
    });
  }
  public getSalesManName(id: number): string {
    return this.SalesManMasterArray?.find(
      (j) => j?.salesManMasterSalesManId === id
    )?.salesManMasterSalesManName;
  }

  public getItemMasterName(itemMasterItemId) {
    return this.ItemMasterList?.find((j) => j.value === itemMasterItemId)
      ?.label;
  }

  public getUnitName(unit: number): string {
    return this.unitArray?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }

  totalQty: number = 0;

  ColumnSum() {
    const data = this.deliverynoteentry.data as GridData[];
    this.totalQty = data
      ?.filter((item) => item.hasOwnProperty('code') && item.qty != null)
      .reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  }

  loadHideRateAmountSetting() {
    this.utilityService
      .getProgramSettings('Hide_RateAndAmount_in_DN')
      .subscribe((res: any) => {
        const setting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_RateAndAmount_in_DN'
        );
        this.hideRateAndAmount = setting?.programSettingsBoolValue ?? false;
        this.applyHiddenColumns();
      });
  }

  applyHiddenColumns() {
    const hiddenCols = [5, 6, ...(this.hideRateAndAmount ? [7, 8] : [])];
    this.deliverynoteentry.hiddenColumns = { columns: hiddenCols, indicators: false };
    setTimeout(() => {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: { columns: hiddenCols, indicators: false },
      });
    }, 300);
  }

  locationDropdownChange(event: any) {
    this.selectedLocation = event.value;
  }

  public getLocation(id): string {
    return this.locationList?.find((k) => k?.value === id)?.label;
  }

  public getSalesMan(id): string {
    return this.SalesManMasterList?.find((k) => k.value === id).label;
  }

  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      sales: kl.itemMasterItemName,
      salesId: kl.itemMasterItemId,
      barcode: kl?.itemMasterBarcode,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      sales: kl.unitMasterUnitShortName,
      salesId: kl.unitMasterUnitId,
    }));
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  savedelivery() {
    const savedData: any = this.deliverynoteentry.data?.filter((k) =>
      k.hasOwnProperty('code')
    );
    const deliveryNote: DeliveryNote = this.DeliveryNoteFormGroup
      .value as DeliveryNote;
    deliveryNote.customerDeliveryNoteDeliveryId = Number(
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteDeliveryId
    );
    deliveryNote.customerDeliveryNoteVehicleNo =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteVehicleNo;
    deliveryNote.customerDeliveryNoteDriver =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteDriver;
    deliveryNote.customerDeliveryNoteLocationId =
      this.DeliveryNoteFormGroup.get('customerDeliveryNoteLocationId')?.value;
    deliveryNote.customerDeliveryNoteCustomerName =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteCustomerName;
    deliveryNote.customerDeliveryNoteSalesManId =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteSalesManId;
    deliveryNote.customerDeliveryNoteAttention =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteAttention;
    deliveryNote.customerDeliveryNoteDeliveryAddress =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteDeliveryAddress;
    deliveryNote.customerDeliveryNoteDelDetId =
      this.DeliveryNoteFormGroup.getRawValue().deliveryNoteDeliveryNo;
    deliveryNote.customerDeliveryNoteDeliveryDate =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteDeliveryDate;
    deliveryNote.customerDeliveryNoteCpoId = Number(
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteCpoId
    );
    deliveryNote.customerDeliveryNoteCpoDate =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteCpoDate;
    deliveryNote.customerDeliveryNoteRemarks =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteRemarks;
    deliveryNote.customerDeliveryNoteUserId = this.user.userId;
    deliveryNote.customerDeliveryNoteCurrencyId =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteCurrencyId;
    deliveryNote.customerDeliveryNoteJobID =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteJobID;
    deliveryNote.customerDeliveryNoteNo =
      this.DeliveryNoteFormGroup.getRawValue().customerDeliveryNoteNo;
    deliveryNote.customerDeliveryNoteCustomerCode =
      this.CustomerMasterList?.find(
        (l) =>
          l.label ==
          this.DeliveryNoteFormGroup.getRawValue()
            .customerDeliveryNoteCustomerName
      )?.value;
    deliveryNote.customerDeliveryNoteDetails = savedData
      ?.filter((k) => k.code != null && k.unit != null)
      .map((k: GridData) => {
        return {
          customerDeliveryNoteDetailsDetId: k.id != null ? k.id : 0,
          customerDeliveryNoteDetailsDeliveryNo:
            this.DeliveryNoteFormGroup.getRawValue()
              .customerDeliveryNoteDeliveryId
              ? this.DeliveryNoteFormGroup.getRawValue()
                .customerDeliveryNoteDeliveryId
              : 0,
          customerDeliveryNoteDetailsSlno: 0,
          customerDeliveryNoteDetailsItemId: Number(k.code),
          customerDeliveryNoteDetailsDescription: k.MaterialName,
          customerDeliveryNoteDetailsRemarks: k.customerDeliveryNoteDetailsRemarks,
          customerDeliveryNoteDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                (x) => x.unitMasterUnitShortName?.trim() === k.unit?.trim()
              )?.unitMasterUnitId
              : null,
          customerDeliveryNoteDetailsQty: k.qty,
          customerDeliveryNoteDetailsCustomerPoNo: k.PoNo,
          customerDeliveryNoteDetailsPodId: k.PodId,
          customerDeliveryNoteDetailsDelStatus: false,
          customerDeliveryNoteDetailsRate: k.rate,
          customerDeliveryNoteDetailsAmount: k.amt,
        };
      });

    if (this.btnFlag.save) {
      this.saveDelivery(deliveryNote);
    } else {
      this.updateStock(deliveryNote);
    }
  }

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;

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
            this.f.customerDeliveryNoteCurrencyId.setValue(
              Number(this.DefCurrency)
            );
          }
        }
      });
  }

  saveDelivery(deliveryNote: DeliveryNote) {
    this.DeliveryNoteFormGroup.markAllAsTouched();
    if (this.DeliveryNoteFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.salesapi.InsertDeliveryNote(deliveryNote).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.savedDeliveryNote = data.result;
              this.updateFormGrid(data.result);
              this.userTrackingLog('Insert');
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Delivery Note Saved Successfully',
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
                detail: 'Delivery Note Save Failed',
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
      this.DeliveryNoteFormGroup.markAllAsTouched();
      this.DeliveryNoteFormGroup.markAsDirty();
    }
  }

  updateStock(deliveryNote: DeliveryNote) {
    if (this.DeliveryNoteFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.salesapi.UpdateDeliveryNote(deliveryNote).subscribe(
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
                detail: 'Delivery Note Updated Succesfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Delivery Note Update Failed',
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
      this.DeliveryNoteFormGroup.markAllAsTouched();
      this.DeliveryNoteFormGroup.markAsDirty();
    }
  }
  getAllDeliveryNote() {
    this.salesapi.GetDeliveryNote().subscribe((data) => {
      this.deliveryNotearry = data.result;
    });
  }

  new() {
    this.callDropdowns(false);
    this.DeliveryNoteFormGroup.reset();
    this.deliverynoteentry.data = [];
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.totalQty = 0;
    this.deliverynoteentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.deliverynoteentry);
    this.applyHiddenColumns();

    // this.accountTransactionList = [];
    this.DeliveryNoteFormGroup.get('customerDeliveryNoteDeliveryId').setValue(
      null
    );
    this.DeliveryNoteFormGroup.get('customerDeliveryNoteLocationId').setValue(
      -1
    );
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.DeliveryNoteFormGroup,
        'customerDeliveryNoteLocationId'
      );
    }
    this.DeliveryNoteFormGroup.get('customerDeliveryNoteSalesManId').setValue(
      -1
    );
    this.DeliveryNoteFormGroup.get('customerDeliveryNoteCurrencyId').setValue(
      -1
    );
    this.DeliveryNoteFormGroup.get('customerDeliveryNoteDeliveryDate').setValue(
      new Date()
    );
    this.DeliveryNoteFormGroup.get('customerDeliveryNoteCpoDate').setValue(
      new Date()
    );

    this.search = null;
    this.index = 0;
    this.DeliveryNoteFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.DeliveryNoteFormGroup,
      'customerDeliveryNoteLocationId',
      this.locationLocked
    );
    this.f.customerDeliveryNoteDeliveryId.clearValidators();
    this.DeliveryNoteFormGroup.updateValueAndValidity();
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
          this.f.customerDeliveryNoteCurrencyId.setValue(
            Number(this.DefCurrency)
          );
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
            this.f.customerDeliveryNoteLocationId.setValue(Number(this.DefLocid));
          }
        }
      }

    });
  }

  showMaximizableDialog() {
    this.callDropdowns(false);
    this.getAllDeliveryNote();
    this.displayMaximizable = true;
  }

  async updateFormGrid(DelivNote: DeliveryNote) {
    this.search = null;

    this.DeliveryNoteFormGroup.patchValue({
      customerDeliveryNoteLocationId: this.locationLocked
        ? this.DeliveryNoteFormGroup.get('customerDeliveryNoteLocationId')?.value
        : DelivNote?.customerDeliveryNoteLocationId,
      customerDeliveryNoteCustomerName:
        DelivNote.customerDeliveryNoteCustomerName,
      customerDeliveryNoteSalesManId: DelivNote.customerDeliveryNoteSalesManId,
      customerDeliveryNoteAttention: DelivNote.customerDeliveryNoteAttention,
      customerDeliveryNoteDeliveryAddress:
        DelivNote.customerDeliveryNoteDeliveryAddress,
      customerDeliveryNoteDeliveryId: DelivNote.customerDeliveryNoteDeliveryId,
      customerDeliveryNoteNo: DelivNote.customerDeliveryNoteNo,
      customerDeliveryNoteDeliveryDate: new Date(
        DelivNote.customerDeliveryNoteDeliveryDate
      ),
      customerDeliveryNoteCpoId: DelivNote.customerDeliveryNoteCpoId,
      customerDeliveryNoteCpoDate: new Date(
        DelivNote.customerDeliveryNoteCpoDate
      ),
      customerDeliveryNoteCustomerCode:
        DelivNote.customerDeliveryNoteCustomerCode,
      customerDeliveryNoteRemarks: DelivNote.customerDeliveryNoteRemarks,
      customerDeliveryNoteUserId: DelivNote.customerDeliveryNoteUserId,
      customerDeliveryNoteCurrencyId: DelivNote.customerDeliveryNoteCurrencyId,
      customerDeliveryNoteVehicleNo: DelivNote?.customerDeliveryNoteVehicleNo,
      customerDeliveryNoteDriver: DelivNote?.customerDeliveryNoteDriver,
      customerDeliveryNoteJobID: DelivNote?.customerDeliveryNoteJobID,
    });

    const gridData = DelivNote.customerDeliveryNoteDetails.map((k) => {
      // const ItemId: any = k.customerDeliveryNoteDetailsItemId != null ? this.ItemMasterList?.find(l => l.value == k.customerDeliveryNoteDetailsItemId).label : null;
      const unitid = this.units?.find((l) => {
        return l.unitMasterUnitId === k.customerDeliveryNoteDetailsUnitId;
      });
      return {
        code: k.customerDeliveryNoteDetailsItemId,
        MaterialName: k.customerDeliveryNoteDetailsDescription,
        PartNo: 0,
        unit: unitid?.unitMasterUnitShortName,
        qty: k.customerDeliveryNoteDetailsQty,
        id: k.customerDeliveryNoteDetailsDetId,
        PoNo: k.customerDeliveryNoteDetailsCustomerPoNo,
        PodId: k.customerDeliveryNoteDetailsPodId,
        rate: k.customerDeliveryNoteDetailsRate,
        amt: k.customerDeliveryNoteDetailsAmount,
        customerDeliveryNoteDetailsRemarks: k.customerDeliveryNoteDetailsRemarks
      };
    });

    this.deliverynoteentry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.ColumnSum();
    this.DeliveryNoteFormGroup.disable();
    this.f.customerDeliveryNoteDeliveryId.clearValidators();
    this.DeliveryNoteFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  GetSavedDeliveryNoteDetails(id: number) {
    this.index = 0;
    this.salesapi.GetSavedDeliveryNoteDetails(id).subscribe(
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
          this.updateFormGrid(data.result);
          this.savedDeliveryNote = data.result;
          this.DeliveryNoteFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Delivery Note not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.DeliveryNoteFormGroup.updateValueAndValidity();
      }
    );
  }

  selectCutomer(event) {
    this.selectItem = event;
    this.DeliveryNoteFormGroup.controls[
      'customerDeliveryNoteCustomerName'
    ].setValue(this.selectItem.label);
    this.showCustomerLookUp = false;
    this.selectedCustomerId = event.value;
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.salesapi.DeleteDeliveryNote(this.savedDeliveryNote).subscribe(
          (data) => {
            this.userTrackingLog('Delete');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Delivery Note Deleted Succesfully',
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
    this.GetSavedDeliveryNoteDetails(
      this.DeliveryNoteFormGroup.getRawValue().deliveryNoteDNId
    );
  }

  edit() {
    this.deliverynoteentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.callDropdowns(false);
    this.f.customerDeliveryNoteDeliveryId.clearValidators();
    this.DeliveryNoteFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.DeliveryNoteFormGroup,
      'customerDeliveryNoteLocationId',
      this.locationLocked
    );
    this.DeliveryNoteFormGroup.controls.customerDeliveryNoteDeliveryId.disable();
    this.DeliveryNoteFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
  }

  public get IsValidGrid(): boolean {
    if (this.deliverynoteentry.data.length > 0) {
      // this.paymentvoucherentry.data.forEach((value: GridData, index, arry) => {
      return Object.values(this.deliverynoteentry.data).some(
        (k: GridData) => k.code != null && k.unit != null
      );
      // });
    }

    return false;
  }

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
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.salesId);
      this.masterapi
        .GetItemMasterById({
          id: evt.salesId,
          customerId:
            this.DeliveryNoteFormGroup.value.customerDeliveryNoteCustomerCode,
        })
        .subscribe((k) => {
          this.ItemMasterArrayByName = k.resultSet?.itemMaster;
          this.conversion_Type =
            this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType;

          const hotInstance = this.hotRegisterer.getInstance(this.hotid);
          // Setting the 'code' in the table
          hotInstance.setDataAtCell(
            this.activeRow.row,
            0,
            evt.salesId.toString()
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
              7,
              this.ItemMasterArrayByName.unitDetails?.unitDetailsRate
            );
            this.hotRegisterer
              .getInstance(this.hotid)
              .selectCell(this.activeRow.row, 4);
          }
        });
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

  exitCustomerlookUp(evt) {
    this.showCustomerLookUp = false;
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
      } else if (res && res.isSave) {
        this.masterapi.GetAllItemMasterById(res.ItemId).subscribe((data) => {
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
                const Unit: string = this.unitList?.find(
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
                    2,
                    this.UpdateItem?.itemMasterItemName
                  );
              }
            });
          }
        });
      }
    });
  }

  hideCustomerlookUp(evt: boolean) {
    this.showCustomerLookUp = false;
  }

  handleCustomerClick() {
    this.showCustomerLookUp = true;
  }

  clearCutomerlookUp(evt) {
    this.showCustomerLookUp = false;
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  userTrackingLog(type) {
    let req = {
      page: 'Delivery Note',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.DeliveryNoteFormGroup.get(
        'customerDeliveryNoteDeliveryId'
      ).value?.toString(),
      vpType: 'Delivery Note',
      vpUserId: this.user?.userId,
    };

    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      // console.log('Response:', res);
    });
  }

  getEmptyRowCount(length): number {
    const jobInvoiceDetailsLength = length || 0;
    if (length < 13) {
      return Math.max(0, 13 - jobInvoiceDetailsLength);
    } else {
      return;
    }
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
  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((m: any) => {
      this.jobArray = m.resultSet.jobMasters;
      this.hasNoAndNameValueType().subscribe((isValid) => {
        this.jobList = m.resultSet.jobMasters?.map((kl: any) => ({
          label: isValid
            ? kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName
            : kl.jobMasterJobNumber,
          value: kl.jobMasterJobId,
        })) || [];
        this.jobList.unshift({ label: '--Select Job--', value: -1 });
      });
    });
  }

  hasNoAndNameValueType(): Observable<boolean> {
    return this.masterapi.GetProgramSettingbyKey('Job_Value_Type').pipe(
      map(response => {
        // Accessing the 'result' array from the response wrapper
        const settings = response?.result;

        if (Array.isArray(settings) && settings.length > 0) {
          return settings[0].programSettingsTextValue === 'No&Name';
        }

        return false;
      })
    );
  }
  onJobChange(event: any) {
    const selectedJobId = event.value;
    if (!selectedJobId || selectedJobId === -1) return;

    // 1. Find the selected job object
    const selectedJob = this.jobArray?.find(
      (job: any) => job.jobMasterJobId === selectedJobId
    );

    if (selectedJob) {
      // 2. Auto-select Salesman 
      // (Directly sets the ID since the salesman form control holds the ID)
      if (selectedJob.jobMasterJobSalesManId) {
        this.DeliveryNoteFormGroup.get('customerDeliveryNoteSalesManId')?.setValue(
          selectedJob.jobMasterJobSalesManId
        );
      }

      // 3. Auto-select Customer
      if (selectedJob.jobMasterJobCustomerId) {
        const matchingCustomer = this.CustomerMasterArray?.find(
          (cust: any) => cust.customerMasterCustomerNo === selectedJob.jobMasterJobCustomerId
        );

        if (matchingCustomer) {
          // Set the raw ID variable
          this.selectedCustomerId = matchingCustomer.customerMasterCustomerNo;

          // Recreate the exact label string your component uses for form binding
          const label = matchingCustomer.customerMasterCustomerReffAcNo != null
            ? matchingCustomer.customerMasterCustomerName + ' -- ' + matchingCustomer.customerMasterCustomerReffAcNo
            : matchingCustomer.customerMasterCustomerName;

          this.DeliveryNoteFormGroup.get('customerDeliveryNoteCustomerName')?.setValue(label);
        }
      }
    }
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
  code?: any;
  partno?: any;
  MaterialName?: any;
  brand?: string;
  packing?: any;
  Origin?: any;
  unit?: any;
  qty?: any;
  id?: number;
  customerDeliveryNoteDetailsPodId: number;
  PoNo: number;
  PodId: number;
  rate: number;
  amt: number;
  customerDeliveryNoteDetailsRemarks?: string;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
export const columnDetailList = (component: DeliveryNoteComponent) => [
  {
    data: 'code',
    type: 'autocomplete',
    label: 'Code',
    toolTip: 'Item Code',
    source: component.ItemMasterArry,
  },
  {
    data: 'PartNo',
    type: 'text',
    label: 'PartNo',
    toolTip: 'Part Number',
  },
  {
    data: 'MaterialName',
    type: 'text',
    label: 'Material Name',
    toolTip: 'Item Description',
  },
  {
    data: 'unit',
    type: 'text',
    label: 'Unit',
    toolTip: 'Measurement Unit',
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Quantity',
    numericFormat: {
      pattern: '0,0.00',
    },
    toolTip: 'Delivery Quantity',
    readOnly: false,
  },
  {
    data: 'PodId',
    type: 'numeric',
    label: 'POD ID',
    toolTip: 'Purchase Order Detail ID',
  },
  {
    data: 'PoNo',
    type: 'numeric',
    label: 'PO No',
    toolTip: 'Purchase Order Number',
  },
  {
    data: 'rate',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'Rate',
    toolTip: 'Unit Price',
    readOnly: false,
  },
  {
    data: 'amt',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
    },
    label: 'Amount',
    toolTip: 'Line Total Amount',
  },
  {
    data: 'customerDeliveryNoteDetailsRemarks',
    type: 'text',
    label: 'Remarks',
    toolTip: 'Line item remarks',
    readOnly: false
  }
];
