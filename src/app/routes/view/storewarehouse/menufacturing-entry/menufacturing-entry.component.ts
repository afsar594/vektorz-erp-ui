import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  MessageService,
  ConfirmationService,
  MenuItem,
  SelectItem,
} from 'primeng';
import {
  DepartmentMaster,
  ChartofAccounts,
  ItemMaster,
} from 'src/app/routes/domain';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { defaults } from 'src/app/shared/service/settings';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import {
  ManufactureItemDetail,
  menufacturingEntry,
} from 'src/app/routes/domain/Store/menufacturingEntry';
import { manufactureListDetails } from 'src/app/routes/domain/Store/manufactureListDetails';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-menufacturing-entry',
  templateUrl: './menufacturing-entry.component.html',
  styleUrls: ['./menufacturing-entry.component.scss'],
})
export class MenufacturingEntryComponent implements OnInit {
  displayPrintPreview: boolean = false;
  currentIndex: number = 0;
  ScreenId: number;
  Permission: any;
  // savedmenufacturingEntry: menufacturingEntry;
  // departmentList: any;

  constructor(
    private router: Router,
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,
    private masterApi: MasterApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private stockApi: StockApiService,
    
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.showCustomerList = false;
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
  }

  confirmDropDatabaseDialogVisible = false;
  btnFlag: ButtonFlag;
  breadcumbmodel: MenuItem[];

  customerList: Array<CustomerMaster>;
  customerArry: any[] = [];
  dataset: any;
  selectedJob: string;
  showCustomerList: boolean;
  cols: Array<any> = [];
  licensekey: string;
  response: any;
  subtitle: string;
  menufacturingEntryGroup: FormGroup;
  menufacturingEntry?: menufacturingEntry;
  menufacturingEntryarry: menufacturingEntry[] = [];

  menufacturingEntry_Entry: Handsontable.GridSettings;
  title: string;
  selectedCustomer: any;
  customerDesc: boolean;
  voucherNumber: any;
  hotid = 'menufacturingEntry';

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[] = [];
  locationArry: string[] = [];
  departmentList: Array<DepartmentMaster>;
  departmentArray: DepartmentMaster[] = [];
  departmentLists: SelectItem[] = [];
  departmentArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  ///////   New Vars   /////////
  itemList: Array<any> = [];
  itemListcols: Array<any> = [];
  menufacturingEntryListcols: Array<any> = [];
  menufacturingEntryList: Array<any> = [];
  showmenufacturingEntryList: boolean = false;
  showEditListing: boolean = false;
  showItemList: boolean = false;
  showUnitList: boolean = false;
  hotRegisterer: HotTableRegisterer = new HotTableRegisterer();

  unitListcols: Array<any> = [];
  stockEditListcols: Array<any> = [];
  selectedUnit: UnitMaster;
  selectedItem: any;
  user: any;
  updatedQuantity: number = 0;
  quantity = 1;
  totalAmount = 0;
  private savedManufacture: any = null;

  ngOnInit(): void {
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
    });
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

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.getAllItemMaster();
    this.menufacturingEntryGroup = new FormGroup({
      menufacturingEntryNo: new FormControl({ value: '', disabled: true }),
      menufacturingEntryStDate: new FormControl({ value: '', disabled: true }),
      menufacturingEntryCustomer: new FormControl({
        value: '',
        disabled: true,
      }),
      menufacturingEntryJobId: new FormControl({ value: '', disabled: true }),
      menufacturingEntryLocationIdFrom: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      menufacturingEntryLocationIdTo: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      menufacturingEntryUserId: new FormControl({ value: '', disabled: true }),
      menufacturingEntryApprovedBy: new FormControl({
        value: '',
        disabled: true,
      }),
      menufacturingEntryNarration: new FormControl({
        value: '',
        disabled: true,
      }),
      quantity: new FormControl(1, [Validators.required, Validators.min(0.000001)]),
      menufacturingEntryDetailsTotal: new FormControl({ value: 0, disabled: true }),
    });
    this.customerDesc = true;
    this.cols = [
      { field: 'customerTitle', header: 'Title' },
      { field: 'customerName', header: 'Name' },
      { field: 'customerEmail', header: 'Email Address' },
      { field: 'customerContact', header: 'Contact No.' },
    ];
    this.itemListcols = [
      { field: 'item_Master_Batch_Code', header: 'Item Code' },
      { field: 'item_Master_Part_No', header: 'Part No' },
      { field: 'item_Master_Barcode', header: 'Bar Code' },
      { field: 'item_Master_Item_Name', header: 'Item Name' },
      { field: 'stock', header: 'Stock' },
    ];
    this.unitListcols = [
      { field: 'unitMasterUnitId', header: 'Unit Code' },
      { field: 'unitMasterUnitFullName', header: 'Unit Name' },
    ];
    this.stockEditListcols = [
      { field: 'menufacturingEntryId', header: 'ID' },
      { field: 'menufacturingEntryVoucherNo', header: 'Voucher No' },
      { field: 'menufacturingEntryStDate', header: 'Date' },
      { field: 'menufacturingEntryLocationIdFrom', header: 'Location From' },
      { field: 'menufacturingEntryLocationIdTo', header: 'Location To' },
      { field: 'menufacturingEntryUserId', header: 'User' },
      { field: '', header: 'Actions' },
    ];
    this.menufacturingEntryListcols = [
      { field: 'mI_Id_N', header: 'ID' },
      { field: 'mI_VocherNo', header: 'Voucher No' },
      { field: 'mI_Item_ID', header: 'Item' },
      { field: 'mE_Remarks_V', header: 'Remarks' },
      // { field: 'manufactureItemsMasterDetails', header: 'Details' },
      { field: '', header: 'Actions' },
    ];
    this.initializeControls();
    this.getAllUnit();
  }

  selectCustomer(customer: any) {
    this.selectedCustomer = customer;
    //console.log("customer##", this.selectedCustomer)
    // this.customerList?.find(j => j.customerMasterCustomerNo === customer.customerMasterCustomerNo)?.customerMasterCustomerName;
    // .map(ar => ar.customerMasterCustomerName?.trim() + '|' + ar.customerMasterCustomerNo);
    // this.menufacturingEntry.customer = customer.customerMasterCustomerName;
    this.menufacturingEntryGroup.controls[
      'menufacturingEntryCustomer'
    ].setValue(customer.customerMasterCustomerName);

    this.menufacturingEntryGroup.controls['menufacturingEntryUserId'].setValue(
      customer.customerMasterCustomerNo
    );
    this.showCustomerList = false;
    this.customerDesc = false;
  }

  initializeControls() {
    this.menufacturingEntry_Entry = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: undefined,
      minRows: 5,
      width: '100%',
      height: 150,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      afterChange: (changes, source) => {
        if (changes && source !== 'loadData') {
          changes.forEach(([rowIndex, prop, _oldValue, newValue]) => {
            const row = (this.menufacturingEntry_Entry.data as any[])[rowIndex];
            if (!row) return;
            if (prop === 'quantity') {
              row.originalQuantity = Number(newValue) / (Number(this.quantity) || 1);
            } else if (prop === 'Price') {
              row.originalPrice = Number(newValue) || 0;
            }
          });
          this.calculateGridAmounts();
        }
      },
      afterCreateRow: () => {
        this.calculateGridAmounts();
      },
      afterRemoveRow: () => {
        this.calculateGridAmounts();
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords.col.valueOf() === 0) {
          // this.createNew();
         // this.showItemList = true;
        } else if (coords.col.valueOf() === 3) {
         // this.showUnitList = true;
        }
      },
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      hiddenColumns: {
        columns: [],
        indicators: false,
      },
      columns: [
        {
          data: 'itemId',
          type: 'numeric',
        },
        {
          data: 'code',
          type: 'numeric',
        },
        {
          data: 'des',
          type: 'text',
        },
        {
          data: 'quantity',
          type: 'numeric',
        },
        {
          data: 'unit',
          type: 'text',
        },

        {
          data: 'Price',
          type: 'numeric',
        },
        {
          data: 'ammount',
          type: 'numeric',
        },
        {
          data: 'remarks',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Item Id'),
        this.translate.instant('Code'),
        this.translate.instant('Description'),
        this.translate.instant('Quantity'),
        this.translate.instant('Unit'),
        this.translate.instant('Price'),
        this.translate.instant('Amount'),
        this.translate.instant('Remarks'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.menufacturingEntry_Entry.afterValidate = (
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
    this.menufacturingEntry_Entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      // setting if prevent scrolling after selection
      this.currentIndex = row;
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
    };

    // this.menufacturingEntry_Entry.data = this.hotRegisterer.getInstance(this.hotid).getData();
  }
  getVoucherNumber() {
    this.stockApi.getVoucherNumber().subscribe((response: any) => {
      this.voucherNumber = response?.result ?? response?.data ?? response;
      const currentNumber = Number(this.voucherNumber?.[0]?.vouchersNumbersVNoNu);
      if (Number.isFinite(currentNumber)) {
        this.menufacturingEntryGroup.get('menufacturingEntryNo').setValue(String(currentNumber + 1));
      }
    });
  }

  /////done/////
  createNew() {
    this.menufacturingEntryGroup.reset();
    this.quantity = 1;
    this.menufacturingEntryGroup.enable();
    this.menufacturingEntryGroup
      .get('menufacturingEntryStDate')
      .setValue(new Date());

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.menufacturingEntry_Entry.data = [];
    this.totalAmount = 0;
    this.savedManufacture = null;
    this.menufacturingEntryGroup.patchValue({ quantity: 1, menufacturingEntryDetailsTotal: 0 });
    this.getVoucherNumber();
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.menufacturingEntry_Entry);
    // this.hotRegisterer.getInstance(this.hotid).clear();
    // this.hotRegisterer.getInstance(this.hotid).updateSettings(this.salesvoucher_entry);
  }

  onQuantityChange(value: any): void {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0) return;
    this.quantity = next;
    this.menufacturingEntryGroup.patchValue({ quantity: next });
    this.calculateGridAmounts();
  }

  calculateGridAmounts(): void {
    const multiplier = Number(this.quantity);
    const rows = (this.menufacturingEntry_Entry?.data as any[]) || [];
    rows.forEach((row) => {
      if (!row || !Number(row.itemId)) return;
      const originalQty = Number(row.originalQuantity ?? row.quantity) || 0;
      const price = Number(row.originalPrice ?? row.Price) || 0;
      row.originalQuantity = originalQty;
      row.originalPrice = price;
      row.quantity = originalQty * multiplier;
      row.Price = price;
      row.ammount = row.quantity * price;
    });
    this.totalAmount = rows.reduce((total, row) => {
      const amount = Number(row?.ammount);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);
    this.menufacturingEntryGroup?.patchValue({ menufacturingEntryDetailsTotal: this.totalAmount });
    const hot = this.hotRegisterer.getInstance(this.hotid);
    if (hot) hot.render();
  }

  edit(): void {
    if (!this.savedManufacture) return;
    this.btnFlag = { ...this.btnFlag, edit: false, cancel: false, save: false, update: true };
    this.menufacturingEntryGroup.enable();
    this.menufacturingEntryGroup.get('menufacturingEntryNo').disable();
    this.menufacturingEntryGroup.get('menufacturingEntryDetailsTotal').disable();
    this.hotRegisterer.getInstance(this.hotid).updateSettings({ readOnly: false });
  }

  showEntryList(): void {
    this.getAllmanufacture();
    this.showmenufacturingEntryList = true;
  }

  getAllmanufacture(): void {
    this.stockApi.GetManufactureItems().subscribe(
      (response: any) => {
        this.menufacturingEntryList = Array.isArray(response) ? response : response?.result ?? response?.data ?? [];
      },
      () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to load manufacturing entries' })
    );
  }

  deleteEntry(): void {
    if (!this.savedManufacture?.mE_Id_N) {
      this.messageService.add({ severity: 'error', summary: 'Validation', detail: 'Select an entry first' });
      return;
    }
    this.confirmation.confirm({
      key: 'confirm-key', message: 'Do you want to delete this manufacturing entry?',
      accept: () => this.stockApi.DeleteItemsManufactureEntry(this.savedManufacture.mE_Id_N).subscribe(
        () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Manufacturing entry deleted' });
          this.getAllmanufacture();
          this.createNew();
        },
        () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to delete manufacturing entry' })
      ),
    });
  }

  selectItem(item: any) {
    //console.log('Select Item : ', item);
    this.selectedItem = item;

    const hot = this.hotRegisterer.getInstance(this.hotid);
    hot.setDataAtCell(this.currentIndex, 0, item.item_Master_Item_Id);
    hot.setDataAtCell(this.currentIndex, 1, item.item_Master_Part_No);
    hot.setDataAtCell(this.currentIndex, 2, item.item_Master_Item_Name);
    hot.setDataAtCell(this.currentIndex, 5, item.itemMasterLastPurchasePrice);
    const row = (this.menufacturingEntry_Entry.data as any[])[this.currentIndex];
    if (row) {
      row.originalQuantity = Number(row.quantity) || 1;
      row.quantity = row.originalQuantity;
      row.originalPrice = Number(item.itemMasterLastPurchasePrice) || 0;
      row.Price = row.originalPrice;
      row.ammount = row.quantity * row.Price;
      this.calculateGridAmounts();
    }
    this.showItemList = false;
    if (this.currentIndex > 1) {
      hot.alter('insert_row', this.currentIndex + 1, 1);
    }
    // this.selectedItem = x;
    // this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: [x] });
  }

  getAllJobs() {
    this.masterApi.GetJobMaster().subscribe((k) => {
      this.jobArray = k?.result;
      //console.log(k);
      this.jobList = k?.result.map((kl) => ({
        label: kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobArry = k?.result.map((ar) => ar.jobMasterJobName?.trim());
      //console.log(this.jobArray);
    });
  }

  getAllLocation() {
    this.masterApi.GetAllLocation().subscribe((k) => {
      this.locationArray = k;
      //console.log(k);

      this.locationList = k?.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationArry = k?.map((ar) => ar.locationMasterLocationName);
    });
  }

  // getAllAccount() {

  //   this.accountapi.GetAllAcounts().subscribe(k => {
  //     this.accountArray = k?.result;
  //     this.accountList = k?.result?.filter(v => v.maRelativeNo?.trim())
  //       .map((kl) => ({ label: kl.maAccName, value: kl.maAccNo }));
  //     this.accountList.unshift({ label: '--Select--', value: -1 });
  //     this.acctArry = k?.result.map(ar => ar.maAccName?.trim());
  //   });
  // }

  getAllItemMaster() {
    this.masterApi.GetAllItemNotGroup().subscribe((k: any) => {
      this.ItemMasterArray = k?.result || [];
      this.ItemMasterList = this.ItemMasterArray.map((kl: any) => ({
        label: kl?.itemMasterItemName,
        value: kl?.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = this.ItemMasterArray.map(
        (ar: any) => ar?.itemMasterItemName?.trim() + '|' + ar?.itemMasterItemId
      );
    });
  }

  getAllUnit() {
    this.masterApi.GetAllUnit().subscribe((data: any) => {
      this.unitArray = Array.isArray(data) ? data : data?.result || [];
      this.unitList = this.unitArray.map((unit) => ({
        label: unit.unitMasterUnitShortName,
        value: unit.unitMasterUnitId,
      }));
    });
  }

  getAllDepartments() {
    this.masterApi.GetAllDepartment().subscribe((k) => {
      this.departmentArray = k;
      this.departmentLists = k.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentName,
      }));
      this.departmentLists.unshift({
        label: '--Select department--',
        value: -1,
      });
      this.departmentArry = k?.map(
        (ar) =>
          ar.departmentMasterDepartmentName?.trim() +
          '|' +
          ar.departmentMasterDepartmentId
      );
    });
  }

  selectUnit(item) {
    const hot = this.hotRegisterer.getInstance(this.hotid);
    hot.setDataAtCell(this.currentIndex, 3, item.unitMasterUnitShortName);
    this.selectedUnit = item;
    // this.selectedItem.unit = this.selectedUnit.unitMasterUnitFullName
    // this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: this.selectedItem });
    this.showUnitList = false;
    // }
  }

  /////done/////
  showAllCustomers() {
    this.masterApi.GetAllCustomer().subscribe((data) => {
      this.customerList = data;
    });
    this.showCustomerList = true;
  }
  menufacturingEntryStDate: any;

  onSave() {
    const raw = this.menufacturingEntryGroup.getRawValue();
    const itemId = Number(raw.menufacturingEntryLocationIdTo);
    const quantity = Number(raw.quantity);
    const details = (this.menufacturingEntry_Entry.data as any[] || []).filter(
      (row) => row && Number(row.itemId) > 0
    );
    if (!Number.isFinite(itemId) || itemId <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Validation', detail: 'Item is required' });
      this.menufacturingEntryGroup.get('menufacturingEntryLocationIdTo').markAsTouched();
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Validation', detail: 'Quantity must be greater than 0' });
      this.menufacturingEntryGroup.get('quantity').markAsTouched();
      return;
    }
    if (!details.length) {
      this.messageService.add({ severity: 'error', summary: 'Validation', detail: 'Item details are required' });
      return;
    }

    const payload = {




  mE_Id_N: Number( this.menufacturingEntryGroup.getRawValue()?.mE_Id_N) || 0,

  mE_RF_V:  this.menufacturingEntryGroup.getRawValue().mE_RF_V || '',

  mE_Date_D: this.menufacturingEntryGroup.getRawValue()?.mE_Date_D? this.menufacturingEntryGroup.getRawValue()?.mE_Date_D : new Date().toISOString(),

  mE_Item_ID: Number(itemId) || 0,

  mE_UNIT_ID: Number(this.menufacturingEntryGroup.getRawValue()?.mE_UNIT_ID) || Number(   this.unitArray.find( (unit) => unit.unitMasterUnitShortName?.trim() === raw?.unit?.trim()  )?.unitMasterUnitId   ) ||0,

  mE_QTY_N: Number( this.menufacturingEntryGroup.getRawValue().quantity) || 1,

  mE_UNITCOST_N: Number( this.menufacturingEntryGroup.getRawValue().menufacturingEntryUnitCost) || 0,

  mE_Remarks_V: this.menufacturingEntryGroup.getRawValue().menufacturingEntryNarration ||this.savedManufacture?.mE_Remarks_V || '',

  mE_Total_N: Number( this.menufacturingEntryGroup.getRawValue().menufacturingEntryTotal) || 0,

  itemsManufactureEntryDtls: details.map((row) => ({
    meD_Id_N: Number(row?.id) || 0,

    mE_Id_N: Number(this.savedManufacture?.mE_Id_N) || 0,

    meD_ItemId_N: Number(row?.itemId) || 0,

    meD_Description_V:
      row?.des ||
      row?.description ||
      '',

    meD_UnitId_N:
      Number(row?.unitId) ||
      Number(
        this.unitArray.find(
          (unit) =>
            unit.unitMasterUnitShortName?.trim() ===
            row?.unit?.trim()
        )?.unitMasterUnitId
      ) ||
      0,

    meD_QTY_N: Number(row?.quantity) || 0,

    meD_Price_N: Number(row?.Price) || 0,

    meD_Amt_N: Number(row?.ammount) || 0,

    meD_Remarks_V: row?.remarks || '',

    manItemID: Number(row?.manItemID) || 0,

    sno: Number(row?.sno) || 0
  }))
};
debugger
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.btnFlag.save ? 'Do you want to save this entry?' : 'Do you want to update this entry?',
      accept: () => {
        const request = this.btnFlag.save
          ? this.stockApi.InsertItemsManufactureEntry(payload)
          : this.stockApi.UpdateItemsManufactureEntry(payload);
        request.subscribe(
          (response: any) => {
            const record = response?.result ?? response?.data ??
              (response?.mI_Id_N ? response : payload);
            if (response?.valid === false || response?.error) {
              this.messageService.add({ severity: 'error', summary: 'Save failed', detail: response?.message || response?.exception || 'Unable to save entry' });
              return;
            }
            this.savedManufacture = record;
            this.btnFlag = { edit: true, cancel: true, save: false, update: true, delete: true };
            this.updateFormGrid(record);
            this.getAllmanufacture();
            this.messageService.add({ severity: 'success', summary: 'Success', detail: response?.message || 'Manufacturing entry saved successfully' });
          },
          () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to save manufacturing entry' })
        );
      },
    });
  }

  // savemenufacturingEntry(menufacturingEntry: menufacturingEntry) {
  //   if (this.menufacturingEntryGroup.valid) {
  //     this.confirmation.confirm({
  //       key: 'confirm-key',
  //       message: 'Do you want to update existing voucher?',
  //       accept: () => {
  //         this.stockApi.sa(menufacturingEntry).subscribe((data) => {
  //           this.btnFlag = { edit: true, cancel: false, save: false, update: true, delete: true };
  //           this.updateFormGrid(data.result);
  //           this.messageService.add({ severity: 'success', summary: 'Alert', detail: ' Updated Succesfully' });
  //         }, (err) => {
  //           this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Update Failed' });
  //         });
  //       }
  //     });
  //   } else {
  //     // const msg1 = 'Please fill mandatory fields';
  //     // const msg2 = 'Please fill Empyt Debit account details';
  //     this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill mandatory fields' });
  //     this.menufacturingEntryGroup.markAllAsTouched();
  //     this.menufacturingEntryGroup.markAsDirty();
  //   }
  // }

  // updatemenufacturingEntry(menufacturingEntry: menufacturingEntry) {
  //   if (this.menufacturingEntryGroup.valid) {
  //     this.confirmation.confirm({
  //       key: 'confirm-key',
  //       message: 'Do you want to update existing voucher?',
  //       accept: () => {
  //         this.stockApi.UpdatemenufacturingEntry(menufacturingEntry).subscribe((data) => {
  //           this.btnFlag = { edit: true, cancel: false, save: false, update: true, delete: true };
  //           this.updateFormGrid(data.result);
  //           this.messageService.add({ severity: 'success', summary: 'Alert', detail: ' Updated Succesfully' });
  //         }, (err) => {
  //           this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Update Failed' });
  //         });
  //       }
  //     });
  //   } else {
  //     // const msg1 = 'Please fill mandatory fields';
  //     // const msg2 = 'Please fill Empyt Debit account details';
  //     this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill mandatory fields' });
  //     this.menufacturingEntryGroup.markAllAsTouched();
  //     this.menufacturingEntryGroup.markAsDirty();
  //   }
  // }

updateFormGrid(menufacturingEntry_update: any) {

  const record =
    menufacturingEntry_update?.result ??
    menufacturingEntry_update?.data ??
    menufacturingEntry_update;

  this.savedManufacture = record;

  this.menufacturingEntryGroup.patchValue({

    menufacturingEntryNo:
      record?.mI_VocherNo ??
      record?.mE_RF_V ??
      '',

    menufacturingEntryLocationIdTo:
      Number(
        record?.mI_Item_ID ??
        record?.mE_Item_ID
      ) || null,

    menufacturingEntryNarration:
      record?.mI_Remarks_V ??
      record?.mE_Remarks_V ??
      '',

    quantity:
      Number(
        record?.mI_QTY_N ??
        record?.mE_QTY_N ??
        1
      ) || 1,

  });

  const details =
    record?.manufactureItemsMasterDetails ??
    record?.itemsManufactureEntryDtls ??
    [];




  const gridData: any[] = details.map(
    (k: any, index: number) => {

      const unit = this.unitArray?.find(
        (u) =>
          u.unitMasterUnitId ===
          Number(
            k?.miD_UnitId_N ??
            k?.meD_UnitId_N
          )
      );

      const itemId = Number(
        k?.miD_ItemId_N ??
        k?.meD_ItemId_N
      ) || 0;

      const description =
        k?.miD_Description_V ??
        k?.meD_Description_V ??
        '';

      const unitId = Number(
        k?.miD_UnitId_N ??
        k?.meD_UnitId_N
      ) || 0;

      const quantity = Number(
        k?.miD_QTY_N ??
        k?.meD_QTY_N
      ) || 0;

      const price = Number(
        k?.miD_Price_N ??
        k?.meD_Price_N
      ) || 0;

      const amount = Number(
        k?.miD_Amt_N ??
        k?.meD_Amt_N
      ) || (quantity * price);

      return {

        id:
          Number(
            k?.miD_Id_N ??
            k?.meD_Id_N
          ) || 0,

        itemId: itemId,

        code: itemId,

        des: description,

        description: description,

        unit:
          unit?.unitMasterUnitShortName ||
          '',

        unitId: unitId,

        quantity: quantity,

        originalQuantity: quantity,

        Price: price,

        originalPrice: price,

        ammount: amount,

        remarks:
          k?.miD_Remarks_V ??
          k?.meD_Remarks_V ??
          '',

        deliveredQty:
          Number(k?.miD_DelQty_N) || 0,

        voucherNo:
          k?.mI_Details_VocherNo ??
          '',

      };

    }
  );



  this.quantity = 1;

  this.menufacturingEntry_Entry.data = gridData;

  this.calculateGridAmounts();

  this.hotRegisterer
    .getInstance(this.hotid)
    .updateSettings({
      data: gridData,
      readOnly: true
    });

  this.menufacturingEntryGroup.disable();
}
  cancelAll() {
    this.createNew();
  }

  get f() {
    return this.menufacturingEntryGroup.controls;
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  userTrackingLog(type) {
    let req = {
      page: 'MenufacturingEntry',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.menufacturingEntryGroup.get('menufacturingEntryNo').value,
      vpType: 'MenufacturingEntry',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  getItemName(id: number): string {
    return this.ItemMasterList?.find((item) => Number(item.value) === Number(id))?.label || '';
  }

onItemChange(event: any) {
  const itemId = Number(event?.value);
  if (!Number.isFinite(itemId) || itemId <= 0) {
    this.menufacturingEntry_Entry.data = [];
    this.totalAmount = 0;
    this.menufacturingEntryGroup.patchValue({ menufacturingEntryDetailsTotal: 0 });
    this.hotRegisterer.getInstance(this.hotid).render();
    return;
  }
  this.stockApi.GetAllmenufacture().subscribe(
    (response: any) => {
      const records = Array.isArray(response) ? response : response?.result ?? response?.data ?? [];
      const recipe = records.find((entry: any) => Number(entry?.mI_Item_ID) === itemId);
      if (recipe) {
        this.stockApi.GetSavedmenufacture(Number(recipe.mI_Id_N)).subscribe(
          (saved: any) => {
            const record = saved?.result ?? saved?.data ?? saved;
            const currentDetails = this.savedManufacture?.manufactureItemsMasterDetails || [];
            this.menufacturingEntry_Entry.data = (record?.manufactureItemsMasterDetails || []).map((detail: any) => {
              const unit = this.unitArray.find((u) => u.unitMasterUnitId === Number(detail.miD_UnitId_N));
              const originalQuantity = Number(detail.miD_QTY_N) || 0;
              const price = Number(detail.miD_Price_N) || 1;
              return {
                id: Number(currentDetails.find((existing: any) => Number(existing.miD_ItemId_N) === Number(detail.miD_ItemId_N))?.miD_Id_N) || 0,
                itemId: Number(detail.miD_ItemId_N) || 0,
                code: Number(detail.miD_ItemId_N) || 0,
                des: detail.miD_Description_V || '',
                unit: unit?.unitMasterUnitShortName || '',
                unitId: Number(detail.miD_UnitId_N) || 0,
                quantity: originalQuantity,
                originalQuantity,
                Price: price,
                originalPrice: price,
                ammount: originalQuantity * price,
                remarks: detail.miD_Remarks_V || '',
                voucherNo: detail.mI_Details_VocherNo || '',
              };
            });
            this.calculateGridAmounts();
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: this.menufacturingEntry_Entry.data, readOnly: false });
          },
          () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to load item details' })
        );
        return;
      }
      this.masterApi.GetAllItemMasterById(itemId).subscribe(
        (itemResponse: any) => {
          const item = itemResponse?.result ?? itemResponse?.data ?? itemResponse;
          const apiDetails = item?.manufactureItemsMasterDetails ?? item?.itemDetails ?? item?.details;
          if (Array.isArray(apiDetails)) {
            this.menufacturingEntry_Entry.data = apiDetails.map((detail: any) => {
              const originalQuantity = Number(detail.miD_QTY_N ?? detail.quantity) || 0;
              const price = Number(detail.miD_Price_N ?? detail.price) || 0;
              return {
                id: 0,
                itemId: Number(detail.miD_ItemId_N ?? detail.itemId) || 0,
                code: detail.code ?? detail.itemCode ?? detail.miD_ItemId_N ?? detail.itemId,
                des: detail.miD_Description_V ?? detail.description ?? detail.itemName ?? '',
                unit: detail.unit ?? this.unitArray.find((u) => u.unitMasterUnitId === Number(detail.miD_UnitId_N ?? detail.unitId))?.unitMasterUnitShortName ?? '',
                unitId: Number(detail.miD_UnitId_N ?? detail.unitId) || 0,
                quantity: originalQuantity,
                originalQuantity,
                Price: price,
                originalPrice: price,
                ammount: originalQuantity * price,
                remarks: detail.miD_Remarks_V ?? detail.remarks ?? '',
              };
            });
            this.calculateGridAmounts();
            this.hotRegisterer.getInstance(this.hotid).render();
          } else {
            this.menufacturingEntry_Entry.data = [];
            this.calculateGridAmounts();
            this.messageService.add({ severity: 'warn', summary: 'Details unavailable', detail: 'No manufacturing details are configured for this item' });
          }
        },
        () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to load selected item details' })
      );
    },
    () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to load manufacturing item details' })
  );
}
  GetSavedmenufactureDetails(id) {
    this.stockApi.GetItemsManufactureEntryById(id).subscribe(
      (data: any) => {
        const record = data;
        if (record !== null) {
          this.updateFormGrid(record);
          this.savedManufacture = record;
          this.btnFlag = { edit: true, cancel: true, save: false, update: true, delete: true };
          // this.menufacturlistGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Manufacture (Component List) not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
      }
    );
  }
  
  printAsPDF() {
    let html: any = document.getElementById('print');
    this.printService.saveAsPDF(html);
    this.userTrackingLog('PDF');
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  getAllStationMaster() {
    this.masterApi.getAllStationMaster().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
  }
    print() {
  Swal.fire({
    icon: 'warning',
    title: 'Warning',
    text: 'Print functionality is not available yet.',
    confirmButtonText: 'OK'
  });
}
}
interface GridData {
  code?: string;
  partno?: number;
  materialName?: string;
  unit?: string;
  quantity?: number;
  costPrice?: number;
  amount?: number;
  remark?: string;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
