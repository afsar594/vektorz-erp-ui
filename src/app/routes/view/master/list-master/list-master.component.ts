import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  MessageService,
  ConfirmationService,
  MenuItem,
  SelectItem,
  Table,
} from 'primeng';
import { ItemMaster, SupplierMaster } from 'src/app/routes/domain';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { SalesService } from 'src/app/routes/service/sales/sales.service';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { PagedRequest } from '../../storewarehouse/opening-stock/opening-stock.component';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

@Component({
  selector: 'app-list-master',
  templateUrl: './list-master.component.html',
  styleUrls: ['./list-master.component.scss'],
})
export class ListMasterComponent implements OnInit {
  @ViewChild('dt') dataTable: Table | undefined;
  Permission: any;
  activeRowCustomerlookUp: { row: number; column: number };
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  title: string;
  licensekey: string;
  brandArry: VendorMaster[] = [];

  breadcumbmodel: MenuItem[];
  btnFlag: BtnFlag;
  ItemListMasterFormGroup: FormGroup;
  lookupColumns = [];
  control: AbstractControl;
  elementReference: ElementRef;
  // @ViewChild('supplierCtrl', { static: false }) supplierCtrol: ElementRef;
  // @ViewChild('acctCtrl', { static: false }) acctCtrol: ElementRef;
  showFormControlLookUpSupplier: boolean = false;
  showFormControlLookUpGroup: boolean = false;
  showFormControlLookUpItem: boolean = false;
  showFormControlLookUpVendor: boolean = false;

  customers: any;
  selectedCustomers = []; // Array to hold selected customers
  loading = false;
  ScreenId: number;

  selectItem: any;
  dataList: Array<any> = [];
  supplierMasterListArry: SupplierMaster[] = [];
  itemGroup: SelectItem[] = [];
  items: any;
  isEditItem: boolean = false;
  PatchValue: any;
  isEdit: any;
  pagedRequest: PagedRequest;

  itemListMaster_entry: Handsontable.GridSettings;
  listMaster: Handsontable.GridSettings;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'salesReport';
  hotidIL = 'itemList';

  activeRow: { row: number; column: number };
  isServerSearch = false;

  currentPage = this.utilityService.defaultPagination.currentPage;
  pageSize = this.utilityService.defaultPagination.pageSize;
  pageOption = this.utilityService.defaultPagination.pageOption;
  totalRecords: number = 0;
  totalPages = 0;
  originalItems: any = [];
  pageDataSet: any = [];
  VoucherPrinting: Handsontable.GridSettings;
  sortColumn = '';
  sortOrder: { [key: string]: 'asc' | 'desc' } = {};
  filter: string = '';
  dataset = [];
  state: any;
  globalGridSearch = '';
  index: number = 0;
  handleChange(e) {
    this.index = e.index;
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private ngZone: NgZone,
    private accountapi: AccountApiService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Item List') {
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
    });

    this.ItemListMasterFormGroup = this.fb.group({
      itemlistbarcode: [null],
      itemlistItemName: [null],
      itemlistProductCode: [null],
      itemlistvendorId: [null],
      itemlistSuplier: [null],
      itemlistGroup: [null],
      Containing: [null],
      startWith: ['startWith'],
    });

    //this.btnFlag = {new:false, edit: true, cancel: true, save: true, delete: true, list:false};
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.initializeControls();
    this.initializControlerItemList();
  }

  initializeControls() {
    this.listMaster = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [20, 15, 15, 20, 20, 20, 20, 30, 15, 15],
      minRows: 3,
      height: 'auto',
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      afterChange: (changes, source) => {
        //   this.x = changes;
        //   if (this.x != null && this.x[0][1] === "Qty") {
        //     this.quantity = String(this.x[0][3]);
        //     // this.beingEdited.Amount = String(parseFloat(this.quantity) * this.beingEdited.Price) + '.000';
        //     this.gridData[this.x[0][0]].Amount = String(parseFloat(this.quantity) * this.gridData[this.x[0][0]].Price) + '.000';
        //     //this.gridData[this.x[0][0]] = this.beingEdited
        //     this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: this.gridData });
        //   }
        //   else if (this.x != null && this.x[0][1] === "Remarks")
        //     this.remarks = String(this.x[0][3]);
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        // if (coords.col.valueOf() === 0) {
        //   this.newEntry();
        // }
        // else if (coords.col.valueOf() === 3) {
        //   // this.unitListing = true;
        // }
        // else if (coords.col.valueOf() === 5) {
        //   this.priceArrayList = this.priceArray[coords.row.valueOf()];
        //   this.priceListing = true;
        // }
      },
      data: [],
      //minSpareRows: 1,
      allowInsertRow: true,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      activeHeaderClassName: 'ht__active_highlight',
      columns: [
        {
          readOnly: true,
          data: 'salesVoucherNo',
          type: 'text',
        },
        {
          readOnly: true,
          data: 'salesVoucherDate',
          type: 'text',
        },
        {
          readOnly: true,
          data: 'salesVoucherDescription',
          type: 'text',
        },
        {
          data: 'salesVoucherTotalActualAmount',
          type: 'autocomplete',
          source: (query, callback) => {
            // callback(this.unitNames);
          },
        },
        {
          data: 'salesVoucherTotalDisAmount',
          type: 'numeric',
        },
        {
          //readOnly: true,
          data: 'salesVoucherTotalDisPer',
          type: 'numeric',
        },
        {
          readOnly: true,
          data: 'salesVoucherTotalGrossAmount',
          type: 'text',
        },
        {
          readOnly: true,
          data: 'salesVoucherTotalGrossAmount',
          type: 'text',
        },
        {
          readOnly: true,
          data: 'salesVoucherTotalGrossAmount',
          type: 'text',
        },
        {
          readOnly: true,
          data: 'salesVoucherTotalGrossAmount',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('Vendor Name'),
        this.translate.instant('Price'),
        this.translate.instant('Unit'),
        this.translate.instant('Unit Barcode'),
        this.translate.instant('Convert'),
        this.translate.instant('Rate'),
        this.translate.instant('Packing'),
        this.translate.instant('Description'),
        this.translate.instant('Unit Cost'),
        this.translate.instant('Unit Price'),
        this.translate.instant('Supplier Name'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
      afterRemoveRow: (index: number, amount: number) => {
        // this.ColumnSum();
      },
    };

    this.getSupplierMasterList();
    this.getAllItems();
    // this.getAllItemMaster();
    this.getBrand();
    this.showRecords();
  }
  initializControlerItemList() {
    this.itemListMaster_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      [5, 6, 8, 10],
      { height: '400px', minRows: 6 }
    );
    this.itemListMaster_entry.beforeKeyDown = (event) => {
      if (this.itemListMaster_entry.readOnly) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };
  }
  onSearch(term: string) {
    this.dataList = [];
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi
      .LoadFilteredItemMaster(this.pagedRequest)
      .subscribe((m: any) => {
        this.ItemMasterArray = m.resultSet.itemMaster;
        this.ItemMasterList = m.resultSet.itemMaster?.map((kl: any) => ({
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
  get itemSetLookup() {
    return this.ItemMasterArray?.map((kl) => ({
      sales: kl?.itemMasterItemName,
      salesId: kl?.itemMasterItemId,
    }));
  }

  openSupplier() {
    this.lookupColumns = ['Supplier', 'Supplier ID'];
    this.dataList = this.supplierLookup;
    this.showFormControlLookUpSupplier = true;
  }
  get supplierLookup() {
    return this.supplierMasterListArry.map((kl) => ({
      account: kl.suppliersMasterSupplierName,
      accountId: kl.suppliersMasterSupplierId,
    }));
  }
  exit(evt) {
    this.showFormControlLookUpSupplier = false;
    this.showFormControlLookUpGroup = false;
    this.showFormControlLookUpItem = false;
    this.showFormControlLookUpVendor = false;
  }
  clear(evt) {
    this.showFormControlLookUpGroup = false;
    this.showFormControlLookUpSupplier = false;
    this.showFormControlLookUpItem = false;
    this.showFormControlLookUpVendor = false;
  }
  selectSupplier(evt) {
    this.ItemListMasterFormGroup.get('itemlistSuplier').setValue(evt.account);
    this.showFormControlLookUpSupplier = false;
  }
  getAllItemMaster() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k.result?.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
      );
    });
  }
  selectGroup(evt) {
    this.ItemListMasterFormGroup.get('itemlistGroup').setValue(evt.account);
    this.showFormControlLookUpGroup = false;
    // this.showRecords();
  }
  selectedItem(evt) {
    this.ItemListMasterFormGroup.get('itemlistItemName').setValue(evt?.sales);
    this.showFormControlLookUpItem = false;
    // this.showRecords();
  }
  selectedVendor(evt) {
    this.ItemListMasterFormGroup.get('itemlistvendorId').setValue(evt?.label);
    this.showFormControlLookUpVendor = false;
    // this.showRecords();
  }

  hide(evt: boolean) {
    this.showFormControlLookUpGroup = false;
    this.showFormControlLookUpSupplier = false;
    this.showFormControlLookUpItem = false;
    this.showFormControlLookUpVendor = false;
  }
  getSupplierMasterList() {
    this.masterapi.GetAllSupplier().subscribe((data) => {
      this.supplierMasterListArry = data;
    });
  }
  openItem() {
    this.isServerSearch = true;
    this.lookupColumns = ['Item', 'Item ID'];
    // this.dataList = this.itemLookup;
    this.showFormControlLookUpItem = true;
    this.onSearch('');
  }
  openVendor() {
    this.lookupColumns = ['Vendor', 'Vendor ID'];
    this.dataList = this.vendorLookup;
    this.showFormControlLookUpVendor = true;
  }
  openAccount() {
    this.lookupColumns = ['Account', 'Account ID'];
    this.dataList = this.accountLookup;
    this.showFormControlLookUpGroup = true;
  }
  get accountLookup() {
    return this.itemGroup.map((kl) => ({
      account: kl.label,
      accountId: kl.value,
    }));
  }
  get itemLookup() {
    return this.ItemMasterList.map((kl) => ({
      label: kl.label,
      value: kl.value,
    }));
  }
  get vendorLookup() {
    return this.brandArry.map((kl) => ({
      label: kl.vendorMasterVendorName,
      value: kl.vendorMasterVendorId,
    }));
  }
  getBrand() {
    this.masterapi.GetAllBrand().subscribe((data) => {
      this.brandArry = data;
    });
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  cancelAll() {
    this.ItemListMasterFormGroup.reset();
    // this.items=[]
  }
  getAllItems() {
    this.masterapi.getItemsParentTreeNode().subscribe((data) => {
      this.itemGroup = data.result.map((k) => ({
        label: k.itemMasterItemName,
        value: k.itemMasterItemId,
      }));
      this.itemGroup.unshift({ label: 'Item Master', value: null });
    });
  }
  onGlobalGridSearch() {
    this.pageDataSet = [];
    this.currentPage = 1;
    this.showRecords();
  }
  showRecords12() {
    const data = {
      barcode: this.ItemListMasterFormGroup.value.itemlistbarcode
        ? this.ItemListMasterFormGroup.value.itemlistbarcode
        : 'string',
      partNo: this.ItemListMasterFormGroup.value.itemlistProductCode
        ? this.ItemListMasterFormGroup.value.itemlistProductCode
        : 'string',
      itemName: this.ItemListMasterFormGroup.value.itemlistItemName
        ? this.ItemListMasterFormGroup.value.itemlistItemName
        : 'string',
      vendorName: this.ItemListMasterFormGroup.value.itemlistvendorId
        ? this.ItemListMasterFormGroup.value.itemlistvendorId
        : 'string',
      gruopName: this.ItemListMasterFormGroup.value.itemlistGroup
        ? this.ItemListMasterFormGroup.value.itemlistGroup
        : 'string',
      priceinsname: this.ItemListMasterFormGroup.value.itemlistSuplier
        ? this.ItemListMasterFormGroup.value.itemlistSuplier
        : 'string',
      isContaining:
        this.ItemListMasterFormGroup.get('startWith').value === 'startWith'
          ? true
          : false,
    };
    this.masterapi.GetAllItemListSearch(data).subscribe((res: any) => {
      this.items = res.result;
      this.dataset = res.result;
    });
  }
  buildItemListFilter() {
    const form = this.ItemListMasterFormGroup.value;
    const filters = [];

    if (form.itemlistbarcode && form.itemlistbarcode !== 'string') {
      filters.push(`Barcode == "${form.itemlistbarcode}"`);
    }

    if (form.itemlistProductCode && form.itemlistProductCode !== 'string') {
      filters.push(`PartNo == "${form.itemlistProductCode}"`);
    }

    if (form.itemlistItemName && form.itemlistItemName !== 'string') {
      filters.push(`Item_Name == "${form.itemlistItemName}"`);
    }

    if (form.itemlistvendorId && form.itemlistvendorId !== 'string') {
      filters.push(`VendorName == "${form.itemlistvendorId}"`);
    }

    if (form.itemlistGroup && form.itemlistGroup !== 'string') {
      filters.push(`GroupName == "${form.itemlistGroup}"`);
    }

    if (form.itemlistSuplier && form.itemlistSuplier !== 'string') {
      filters.push(`SupplierName == "${form.itemlistSuplier}"`);
    }

    // Return without additional quotes - let Angular/JavaScript handle the string escaping
    return filters.length > 0 ? filters.join(' && ') : '';
  }
  showRecords() {
    this.state = {
      Dir: this.sortOrder[this.sortColumn] || 'desc',
      Field: this.sortColumn,
      Skip: this.pageSize * (this.currentPage - 1),
      Take: this.pageSize,
      Search: this.globalGridSearch,
      Filter: this.buildItemListFilter(),
    };
    this.masterapi
      .GetAllItemListSearchPaginated(this.state)
      .subscribe((response: any) => {
        if (response.valid) {
          this.dataset = response.result.data;
          if (this.dataset.length > 0) {
            this.totalRecords = response.result.total;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            this.pageDataSet[this.currentPage] = this.dataset;
            this.originalItems[this.currentPage] = JSON.parse(
              JSON.stringify(this.dataset)
            );
          } else {
            this.totalRecords = response.result.total;
          }
        }
      });
  }

  edit() {
    this.isEditItem = !this.isEditItem;
    this.itemListMaster_entry.readOnly = false;
    //console.log("isEdit", this.isEditItem)
  }
  Update() {
    this.state = {
      Dir: this.sortOrder[this.sortColumn] || 'desc',
      Field: this.sortColumn,
      Skip: this.pageSize * (this.currentPage - 1),
      Take: this.pageSize,
      Search: this.globalGridSearch,
      Filter: this.buildItemListFilter(),
    };
    if (this.dataTable) {
      const dataInTable = this.dataTable.value; // Access visible or manipulated data
      const extractedData = dataInTable.map((item) => {
        return {
          id: item.unitDetailsID,
          uD_Barcode: item.uD_Barcode.toString(),
          uD_Discrption: item.uD_Discrption,
          unitPrice: item.uD_UnitPrice,
          packing: item.packing,
          itemSize: item.itemSize.toString(),
          isUpdated: false, // Initialize isUpdated to false
        };
      });

      // Compare modified data with original data to identify updated items
      extractedData.forEach((modifiedItem, index) => {
        const originalItem = this.items[index]; // Assuming this.items is the original data
        if (
          originalItem.uD_Barcode !== modifiedItem.uD_Barcode ||
          originalItem.uD_Discrption !== modifiedItem.uD_Discrption ||
          originalItem.unitPrice !== modifiedItem.unitPrice ||
          originalItem.packing !== modifiedItem.packing ||
          originalItem.itemSize !== modifiedItem.itemSize
        ) {
          modifiedItem.isUpdated = true;
        }
      });

      if (extractedData.length > 0) {
        this.masterapi
          .UpdatetemListSearch(extractedData, this.state)
          .subscribe((response: any) => {
            if (response.result.valid) {
              this.dataset = response.result.result.data;
              if (this.dataset.length > 0) {
                this.totalRecords = response.result.result.total;
                this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
                this.pageDataSet[this.currentPage] = this.dataset;
                this.originalItems[this.currentPage] = JSON.parse(
                  JSON.stringify(this.dataset)
                );
              } else {
                this.totalRecords = response.result.result.total;
              }
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Item Detail Updated Successfully',
              });
              this.isEditItem = false;
              this.itemListMaster_entry.readOnly = true;
            }
          });
      }
    }
  }

  getUpdatedValues() {
    // this.dataset = this.dataset?.filter((i) => i.itemId != null);

    const originalData = this.originalItems
      .flat()
      ?.filter((i) => i.itemId != null);
    const allItems = this.pageDataSet.flat()?.filter((i) => i.itemId != null);
    console.log('originalData = ', originalData);
    console.log(' allItems = ', allItems);

    const updatedValues = allItems.map((item, index) => {
      const originalItem = originalData[index];

      const updatedItem = {
        id: item.unitDetailsID,
        itemMasterid: item.itemId,
        item_Name: item.item_Name,
        itemSize: item.itemSize,
        uD_Barcode: item.uD_Barcode,
        packing: item.packing,
        uD_Discrption: item.uD_Discrption,
        uD_UnitPrice: item.uD_UnitPrice,
        unit_Details_Rate: item.unit_Details_Rate,
        isUpdated:
          item.item_Name !== originalItem.item_Name ||
          item.itemSize !== originalItem.itemSize ||
          item.uD_Barcode !== originalItem.uD_Barcode ||
          item.packing !== originalItem.packing ||
          item.uD_Discrption !== originalItem.uD_Discrption ||
          item.uD_UnitPrice !== originalItem.uD_UnitPrice ||
          item.unit_Details_Rate !== originalItem.unit_Details_Rate,
      };
      return updatedItem;
    });

    // Set edit mode to false after getting updated values
    this.isEditItem = false;

    let filterValue = updatedValues
      ?.filter((res) => res.id != null && res.isUpdated === true)
      .map((res: any) => {
        return {
          id: res.id,
          itemMasterid: res.itemMasterid,
          item_Name: res.item_Name,
          itemSize: res.itemSize.toString(),
          uD_Barcode: res.uD_Barcode.toString(),
          packing: res.packing,
          uD_Discrption: res.uD_Discrption,
          unitPrice: res.uD_UnitPrice,
          unit_Details_Rate: res.unit_Details_Rate,
          isUpdated: true,
        };
      });

    this.masterapi
      .UpdatetemListSearch(filterValue, this.state)
      .subscribe((response: any) => {
        if (response.result.valid) {
          this.dataset = response.result.result.data;
          if (this.dataset.length > 0) {
            this.totalRecords = response.result.result.total;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            this.pageDataSet[this.currentPage] = this.dataset;
            this.originalItems[this.currentPage] = JSON.parse(
              JSON.stringify(this.dataset)
            );
          } else {
            this.totalRecords = response.result.result.total;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Item Detail Updated Successfully',
          });
          this.isEditItem = false;
          this.itemListMaster_entry.readOnly = true;
        }
      });
  }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.itemId != null) {
      const button = document.createElement('a');
      button.className = 'iconbton';
      button.innerHTML = '<i class="pi pi-eye" style="font-size: 15px;"></i>';
      button.addEventListener('click', () => {
        this.ngZone.run(() => {
          window.sessionStorage.setItem('id', rowData.itemId);
          this.router.navigate(['/master/item/edit', rowData.itemId], {
            queryParams: { id: rowData.itemId, menu: 11 },
          });
        });
      });
      td.appendChild(button);
    }

    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }
  onPageSizeChange() {
    this.pageDataSet = [];
    this.currentPage = 1;
    this.showRecords();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.pageDataSet[this.currentPage]) {
        this.dataset = this.pageDataSet[this.currentPage];
      } else {
        this.showRecords();
      }
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.pageDataSet[this.currentPage]) {
        this.dataset = this.pageDataSet[this.currentPage];
      } else {
        this.showRecords();
      }
    }
  }
}

interface BtnFlag {
  new?: boolean;
  edit?: boolean;
  cancel?: boolean;
  delete?: boolean;
  save?: boolean;
  list?: boolean;
}
export const columnDetailList = (component: ListMasterComponent) => [
  {
    data: 'itemId',
    type: 'text',
    label: 'Item Id',
    toolTip: 'Item Id',
    width: 60,
    align: 'center',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
    width: 60,
    align: 'center',
  },
  {
    data: 'item_Name',
    type: 'text',
    label: 'Item Name',
    readOnly: false,
  },
  {
    data: 'groupName',
    type: 'text',
    label: 'Group',
    toolTip: 'Group Name',
  },
  {
    data: 'uD_UNIT',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit',
    width: 50,
  },
  {
    data: 'itemSize',
    type: 'text',
    label: 'Item Size',
    width: 50,
  },
  {
    data: 'supplierName',
    type: 'text',
    label: 'SupplierName',
    toolTip: 'Supplier Name',
    width: 150,
  },
  {
    data: 'uD_Barcode',
    type: 'text',
    label: 'Unit Barcode',
    toolTip: 'Unit Barcode',
    width: 70,
    readOnly: false,
  },
  {
    data: 'uD_UnitPrice',
    type: 'numeric',
    label: 'Unit Price',
    toolTip: 'Unit Price',
    width: 70,
    readOnly: false,
  },

  {
    data: 'unit_Details_Rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Unit Rate',
    width: 70,
    readOnly: false,
  },

  {
    data: 'packing',
    type: 'text',
    label: 'Packing',
    toolTip: 'Packing',
    width: 159,
    readOnly: false,
  },
  {
    data: 'uD_Discrption',
    type: 'text',
    label: 'Description',
    toolTip: 'Description',
    width: 130,
    readOnly: false,
  },
  {
    data: null,
    label: 'View',
    toolTip: 'View Item Detail',
    width: 60,
    renderer: component.buttonRenderer.bind(component),
  },
];
