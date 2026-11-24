import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ItemMaster } from 'src/app/routes/domain';
import { MenuItem } from 'primeng/api/menuitem';
import { StorewarehousesApiService } from 'src/app/routes/service/storewarehouse.api.services';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { MessageService, SelectItem } from 'primeng';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { query } from '@angular/animations';
import { ExportExcelService } from 'src/app/routes/service/export-excel.service';

@Component({
  selector: 'app-stock-ledger',
  templateUrl: './stock-ledger.component.html',
  styleUrls: ['./stock-ledger.component.scss'],
})
export class StockLedgerComponent implements OnInit {
  stockLegerData: any;
  ScreenId: number;
  Permission: any;
  displayPrintPreview: any;
  user: any;

  stationmasterObj: StationMaster;
  totalOpenQty = 0;
  totalOpenValue = 0;
  totalRecdQty = 0;
  totalRecdValue = 0;
  totalSoldQty = 0;
  totalSoldValue = 0;
  totalCloseQty = 0;
  totalCloseValue = 0;
  totalIssueValue = 0;
  totalIssueQty = 0;
  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private printService: FileSaverService,
    private router: Router,
    private StorewarehousesApiService: StorewarehousesApiService,
    private masterapi: MasterApiService,
    public translate: TranslateService,
    private utilityService: UtilityService,
    private permission: PermissionsService,
    private excelService: ExportExcelService
  ) {}
  /////////////// Changes //////////////////////

  selectedLocation: string = 'Main::1';
  btnFlag: any;
  ////////////// OLD CODE  ////////////////
  title: string;
  breadcumbmodel: MenuItem[];
  stockLedgerFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  operation: { insert: boolean; update: boolean; delete: boolean } = {
    insert: false,
    update: false,
    delete: false,
  };
  displayedColumns: string[] = [
    'code',
    'name',
    'rate',
    'symbol',
    'denomination',
    'short_name',
    'action',
  ];

  customerArray: CustomerMaster[] = [];
  customerArry: string[] = [];
  customerList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];

  ItemMasterGroupArray: ItemMaster[] = [];
  ItemMasterGroupArry: string[] = [];
  ItemMasterGroupList: SelectItem[];

  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  MainItemMasterList: any[];
  ItemMasterArray: ItemMaster[] = [];

  lookupGridColumns = ['Account No', 'Item', 'Part No', 'Item ID'];
  activeRow: { row: number; column: number };
  showSalesLookUp: boolean = false;
  formControlLookUp: boolean = false;
  selectItem: any;

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
    this.user = this.permission.getUser();
    this.btnFlag = { find: false, print: true, cancel: true };
    this.stationmasterObj = this.permission.getStation();
    this.operation.insert = true;
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k })); /////    Setting breadcrumb
    this.activatedroute.data.subscribe((data) => {
      /////    Setting Title and Subtitle
      this.title = data.title;
    });
    this.stockLedgerFormGroup = new FormGroup({
      isDateChecked: new FormControl(''),
      zeroOpenBalanceCheck: new FormControl(''),
      zeroBalanceCheck: new FormControl(''),
      orderByGroupCheck: new FormControl(''),
      printReceivedQtyCheck: new FormControl(''),
      dateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      dateTo: new FormControl(new Date(), Validators.required),
      materialName: new FormControl(''),
      partNo: new FormControl(''),
      location: new FormControl(-1),
      itemGroup: new FormControl(''),
      itemId: new FormControl(null),
    });
    this.StorewarehousesApiService.StockLedger_LoadDropdown().subscribe((m) => {
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
        //stock: kl.itemMasterStockType,
        //barcode: kl.itemMasterBarcode,
        AccNo: kl.itemMasterAccountNo,
      }));
      this.MainItemMasterList = this.ItemMasterList;

      // location
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select--', value: -1 });
    });
    // this?.findItem();
  }

  get f() {
    return this.stockLedgerFormGroup.controls;
  }
  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 15) {
      return Math.max(0, 15 - salesVoucherDetailsLength);
    }
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
    // Perform your logic here based on the selected value
  }

  cancel() {
    this.stockLedgerFormGroup.reset();
    this.stockLedgerFormGroup.get('dateFrom').setValue(new Date());
    this.stockLedgerFormGroup.get('dateTo').setValue(new Date());
  }

  findItem() {
    let defaultValue = {
      isDateChecked: this.stockLedgerFormGroup.value.isDateChecked
        ? this.stockLedgerFormGroup.value.isDateChecked
        : false,
      fromDate: this.formatDate(this.stockLedgerFormGroup.value.dateFrom, true),
      toDate: this.formatDate(this.stockLedgerFormGroup.value.dateTo, false),
      itemId: this.stockLedgerFormGroup.value.itemId
        ? this.stockLedgerFormGroup.value.itemId
        : null,
      itemGroupId: this.stockLedgerFormGroup.value.itemGroup
        ? this.stockLedgerFormGroup.value.itemGroup
        : null,
      itemName: this.stockLedgerFormGroup.value.materialName,
      partNo: this.stockLedgerFormGroup.value.partNo
        ? this.stockLedgerFormGroup.value.partNo
        : null,
      locationId: this.stockLedgerFormGroup.value.location
        ? this.stockLedgerFormGroup.value.location
        : null,
      orderByGroup: this.stockLedgerFormGroup.value.orderByGroupCheck
        ? this.stockLedgerFormGroup.value.orderByGroupCheck
        : false,
      excludeZeroOpeningBalance: this.stockLedgerFormGroup.value
        .zeroOpenBalanceCheck
        ? this.stockLedgerFormGroup.value.zeroOpenBalanceCheck
        : false,
      excludeZeroBalance: this.stockLedgerFormGroup.value.zeroBalanceCheck
        ? this.stockLedgerFormGroup.value.zeroBalanceCheck
        : false,
      printReceivedQtyReport: this.stockLedgerFormGroup.value
        .printReceivedQtyCheck
        ? this.stockLedgerFormGroup.value.printReceivedQtyCheck
        : false,
    };

    this.StorewarehousesApiService.StockLedger(defaultValue).subscribe(
      (res: any) => {
        this.stockLegerData = res.result;
        this.totalsum(res.result);
      }
    );
  }
  formatDate(dateString: string, fromDate: boolean): string {
    const time = fromDate ? 'T00:00:00' : 'T23:59:59';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}${time}`;
  }

  totalsum(data: any[]) {
    // Calculate total for each property
    this.totalOpenQty = data.reduce(
      (sum, item) => sum + (item.openQuantity || 0),
      0
    );
    this.totalOpenValue = data.reduce(
      (sum, item) => sum + (item.openValue || 0),
      0
    );
    this.totalRecdQty = data.reduce(
      (sum, item) => sum + (item.receivedQuantity || 0),
      0
    );
    this.totalRecdValue = data.reduce(
      (sum, item) => sum + (item.receivedValue || 0),
      0
    );
    this.totalSoldQty = data.reduce(
      (sum, item) => sum + (item.saledQuantity || 0),
      0
    );
    this.totalSoldValue = data.reduce(
      (sum, item) => sum + (item.saledValue || 0),
      0
    );
    this.totalIssueQty = data.reduce(
      (sum, item) => sum + (item.issueQuantity || 0),
      0
    );
    this.totalIssueValue = data.reduce(
      (sum, item) => sum + (item.issueValue || 0),
      0
    );
    this.totalCloseQty = data.reduce(
      (sum, item) => sum + (item.closingQuantity || 0),
      0
    );
    this.totalCloseValue = data.reduce(
      (sum, item) => sum + (item.closingValue || 0),
      0
    );
  }

  showLookupDialog() {
    this.showSalesLookUp = true;
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
  
    .end {
      text-align: end;
    }
.center {
  text-align: center !important;
}
    `;
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
  }

  displayPrint() {
    this.displayPrintPreview = true;
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

  selectsales(event) {
    this.stockLedgerFormGroup.controls.materialName.setValue(event.label);
    this.stockLedgerFormGroup.controls.partNo.setValue(event.partNo);
    this.stockLedgerFormGroup.controls.itemId.setValue(event.value);
    this.showSalesLookUp = false;
  }

  exit(evt) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  hide(evt: boolean) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.stockLedgerFormGroup.reset();
  }

  GotoStock(id: any) {
    window.sessionStorage.setItem('StockItemId', id);
    window.sessionStorage.setItem(
      'StockFromDate',
      this.stockLedgerFormGroup.get('dateFrom').value
    );
    window.sessionStorage.setItem(
      'StockToDate',
      this.stockLedgerFormGroup.get('dateTo').value
    );
    window.sessionStorage.setItem(
      'Stocklocation',
      this.stockLedgerFormGroup.get('location').value
    );
    window.sessionStorage.setItem(
      'StockitemGroup',
      this.stockLedgerFormGroup.get('itemGroup').value
    );

    this.router.navigate([`/storewarehouse/stockmovement`], {
      queryParams: {
        menu: 124,
      },
    });
  }

  exportToExcel(): void {
    if (this.stockLegerData.length > 0) {
      const data = this.stockLegerData.map((res) => ({
        ItemID: res.itemId,
        PortNo: res.partNo,
        Item_Name: res.itemName,
        Open_Qty: res.openQuantity,
        Open_Value: res.openValue,
        Recd_Qty: res.receivedQuantity,
        Recd_Value: res.receivedValue,
        Sold_Qty: res.saledQuantity,
        Sold_Value: res.saledValue,
        Closing_Qty: res.closingQuantity,
        Closing_Value: res.closingValue,
      }));

      this.excelService.stockLedgerexportAsExcelFile(
        [
          'ItemID',
          'PortNo',
          'Item_Name',
          'Open_Qty',
          'Open_Value',
          'Recd_Qty',
          'Recd_Value',
          'Sold_Qty',
          'Sold_Value',
          'Closing_Qty',
          'Closing_Value',
        ],
        data,
        'Stock-Ledger'
      );
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Data Not Exist',
      });
    }
  }
}
export const stockLedgerColumnList = (component: any) => [
  {
    data: 'itemId',
    type: 'text',
    label: 'ItemID',
    toolTip: 'Item ID',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'PartNo',
    toolTip: 'Part Number',
  },
  {
    data: 'itemName',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
  },
  {
    data: 'unitName',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit Name',
  },
  {
    data: 'openQuantity',
    type: 'numeric',
    label: 'Open Qty',
    toolTip: 'Opening Quantity',
  },
  {
    data: 'openValue',
    type: 'numeric',
    label: 'Open Value',
    toolTip: 'Opening Value',
  },
  {
    data: 'receivedQuantity',
    type: 'numeric',
    label: 'Recd.Qty',
    toolTip: 'Received Quantity',
  },
  {
    data: 'receivedValue',
    type: 'numeric',
    label: 'Recd.Value',
    toolTip: 'Received Value',
  },
  {
    data: 'saledQuantity',
    type: 'numeric',
    label: 'Sold.Qty',
    toolTip: 'Sold Quantity',
  },
  {
    data: 'saledValue',
    type: 'numeric',
    label: 'Sold.Value',
    toolTip: 'Sold Value',
  },
  {
    data: 'closingQuantity',
    type: 'numeric',
    label: 'Closing Qty',
    toolTip: 'Closing Quantity',
  },
  {
    data: 'closingValue',
    type: 'numeric',
    label: 'Closing Value',
    toolTip: 'Closing Value',
  },
  {
    data: null,
    renderer: component.viewRenderer
      ? component.viewRenderer.bind(component)
      : component.buttonRenderer?.bind(component),
    label: 'View',
    toolTip: 'View Details',
  },
];
