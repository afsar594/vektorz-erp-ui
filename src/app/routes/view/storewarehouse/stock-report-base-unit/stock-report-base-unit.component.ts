import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { CurrencyMaster, ItemMaster } from 'src/app/routes/domain';
import { MenuItem } from 'primeng/api/menuitem';
import { map } from 'rxjs/operators';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { StockReportBaseUnitResponse } from 'src/app/routes/domain/Masters/StockReportBaseUnitResponse';
import { stat } from 'fs';
import { SelectItem } from 'primeng';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { StorewarehousesApiService } from 'src/app/routes/service/storewarehouse.api.services';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-stock-report-base-unit',
  templateUrl: './stock-report-base-unit.component.html',
  styleUrls: ['./stock-report-base-unit.component.scss'],
})
export class StockReportBaseUnitComponent implements OnInit {
  selectedItem: any = null;
  selectedGroup: any = null;

  itemGroup: SelectItem[] = [];
  state: any;
  ScreenId: number;
  Permission: any;
  user: any;
  stock: number;
  avgrate: number;
  totalAMT: number;
  constructor(
    private activatedroute: ActivatedRoute,
    private masterapi: MasterApiService,
    private stockapi: StockApiService,
    private fb: FormBuilder,
    private storewarehouseapi: StorewarehousesApiService,
    private router: Router,
    private api: MasterApiService,
    private permission: PermissionsService,
    private utilityService: UtilityService
  ) {}

  locations: any;
  group: any;
  partNo: any;
  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  MainItemMasterList: any[] = [];
  lookupColumns = ['Item', 'Item ID'];
  lookupGridColumns = ['Account No', 'Item', 'Part No', 'Item ID'];

  activeRowCustomerlookUp: { row: number; column: number };
  activeRow: { row: number; column: number };
  selectItem: any;
  subjectDatSet: any[] = [];

  title: string;
  breadcumbmodel: MenuItem[];
  currencyFormGroup: FormGroup;
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

  currencyList: CurrencyMaster[] = [];
  itemCols: Array<any> = [
    { header: 'Item Code', field: 'itemMasterItemId' },
    { header: 'Item Name', field: 'itemMasterItemName' },
  ];
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

    this.operation.insert = true;
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.currencyFormGroup = this.fb.group({
      stockRepostGroupId: [null],
      stockRepostLocationId: [null],
      stockRepostGroupPartNo: [null],
      stockRepostmatrialId: [null],
      stockRepostvalueType: ['WithoutValue'],
      HideZero: [false],
    });
    this.storewarehouseapi.StockLedger_LoadDropdown().subscribe((m) => {
      // itemgroup
      this.itemGroup = m.resultSet.itemMasterGroup;
      this.itemGroup = m.resultSet.itemMasterGroup.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.itemGroup.unshift({
        label: '--Select Item Group--',
        value: -1,
      });

      // item
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
        partNo: kl.itemMasterPartNo,
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
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
    });
  }

  public get f() {
    return this.currencyFormGroup.controls;
  }

  public reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.currencyFormGroup.reset();
  }
  displayMaximizableItems: boolean = false;
  displayItemList() {
    this.displayMaximizableItems = true;
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

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  Cancel() {
    this.selectedItem = null;
    this.currencyFormGroup.reset();
  }

  selectItems(val) {
    this.selectedItem = val?.value;
    this.currencyFormGroup.get('stockRepostmatrialId').setValue(val?.label);
    this.displayMaximizableItems = false;
  }

  exit(evt) {
    this.displayMaximizableItems = false;
  }

  clear(evt) {
    this.displayMaximizableItems = false;
  }

  hide(evt) {
    this.displayMaximizableItems = false;
  }

  stockReportList: Array<StockReportBaseUnitResponse> = [];

  getStockReportBaseUnit() {
    this.selectedGroup = this.currencyFormGroup.get('stockRepostGroupId').value;
    this.stock = 0;
    this.totalAMT = 0;
    this.avgrate = 0;
    this.state = {
      ItemId: this.selectedItem ?? -1,
      ItemGroupId: this.selectedGroup ?? -1,
      LocationId: this.currencyFormGroup.value.stockRepostLocationId ?? -1,
      ExcludeZeroBalance: this.currencyFormGroup.value.HideZero,
    };

    this.stockapi
      .getStockReportBaseUnitWithValue(this.state)
      .subscribe((response) => {
        response.result?.forEach((i) => {
          this.stock += i.stock;
          this.avgrate += i.avgrate;
          this.totalAMT += i.amount;
        });

        this.subjectDatSet = response.result;
      });
  }
}
