import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';
import { ItemMaster } from 'src/app/routes/domain';
import { HotTableRegisterer } from '@handsontable/angular';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { _isNumberValue } from '@angular/cdk/coercion';
import { FileSaverService } from '../../../service/FileSaverService/file-saver.service';
import { UtilityService } from '../../../service/common/utility.service';
import { DamageDetails } from '../../../domain/Masters/DamageDetails';
import { DamageMaster } from '../../../domain/Masters/DemageMaster';
import { LocationMaster } from '../../../domain/Masters/LocationMaster';
import { StockRegister } from '../../../domain/Masters/StockRegister';
import { UnitMaster } from '../../../domain/Masters/UnitMaster';
import { VouchersNumbers } from '../../../domain/Masters/VouchersNumbers';
import { StationMaster } from '../../../domain/StationMaster';
import { demageMasterDetails } from 'src/app/routes/domain/Masters/DamageMasterDetails';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
@Component({
  selector: 'app-damage-entry',
  templateUrl: './damage-entry.component.html',
  styleUrls: ['./damage-entry.component.scss'],
})
export class DamageEntryComponent implements OnInit {
  dataset: any;
  list: any;
  damageEntryList: Array<ItemList>;
  itemList: any;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  btnFlag: ButtonFlag;
  quantity: string;
  amount: number;
  remarks: string;
  srNo: Array<number>;
  units: UnitMaster[];
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  ItemMasterArrayByName: any;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'damageEntry';
  hotidAccounts = 'accDetails';
  damageEntry: Handsontable.GridSettings;
  accountDetails: Handsontable.GridSettings;
  damageEntryFormGroup: FormGroup;
  locationLocked = false;
  cols: Array<any>;
  currentRow: number = 0;
  lookupGridColumns = [];
  dataList: any = [];
  listingCols: Array<any>;
  x: any;
  tempItem: ItemList;
  totalAmount: number = 0;
  ItemName: Array<any> = [];
  // voucherDate: Date;
  checkNull: boolean;
  VoucherNumber: string;
  damageEntryResponse: any;
  ItemList: Array<ItemMaster> = new Array<ItemMaster>();
  tempIterator: number = 0;
  gridData: Array<any> = new Array<ItemList>();
  beingEdited: ItemList;
  displayListing: boolean = false;
  showingList: boolean = false;
  newEntryListing: boolean = false;
  unitListing: boolean = false;
  priceListing: boolean = false;
  editable: boolean = false;
  unitList: Array<UnitMaster>;
  unitNamesList: Array<UnitMaster>;
  vouchersNumbers: Array<VouchersNumbers> = [];
  unitNames: Array<string>;
  unitCols: Array<any>;
  user: any;
  selectedUnit: UnitMaster;
  unitArry: string[] = [];
  priceArray: Array<any> = [];
  showSalesLookUp: boolean = false;

  priceArrayList: Array<number> = new Array<number>();
  priceCols: Array<string> = [];
  prefix: any;
  credi;
  activeRow: { row: number; column: number };
  unitArray: any[];
  conversion_Type: number;
  savedDamegeEnter: any;
  ScreenId: number;
  Permission: any;
  voucherId: any;
  stationmasterObj: StationMaster;
  constructor(
    private activatedroute: ActivatedRoute,
    private service: StockApiService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private permission: PermissionsService,
    private masterapi: MasterApiService,
    private utilityService: UtilityService,
    private fileSaverService: FileSaverService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
      var rights = this.permission.getById(this.ScreenId);
      this.companyDetails = this.permission.getStation();
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
        this.GetSaveddamageMasterDetails(this.voucherId);
      }
    });
    this.vouchersNumbers = new Array<VouchersNumbers>();
    this.selectedUnit = {
      unitMasterUnitFullName: '',
      unitMasterUnitShortName: '',
      unitDetails: [{}],
      unitMasterUnitDelStatus: false,
      unitMasterUnitDescription: '',
      unitMasterUnitId: 0,
      unitMasterUnitStatus: false,
    };
    this.srNo = new Array<number>();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.getAllUnit();

    this.getAllItemMaster();
    this.checkNull = false;
    this.cols = [
      { field: 'itemMasterItemId', header: 'Code' },
      { field: 'itemMasterItemName', header: 'Item Name' },
      { field: 'itemMasterUnitPrice', header: 'Price' },
      { field: 'itemMasterDefaultLocationName', header: 'Location' },
    ];

    this.unitCols = [
      { field: 'unitMasterUnitShortName', header: 'Unit Code' },
      { field: 'unitMasterUnitFullName', header: 'Unit Name' },
    ];

    this.listingCols = [
      // { field: 'ItemId', header: 'Item Code' },
      { field: 'damage_Details_Voucher_Number', header: 'Voucher Number' },
      { field: 'damage_Master_Vdate', header: 'Voucher Date' },
      { field: 'damage_Details_Remarks', header: 'Narration' },
      { field: 'Action', header: 'Actions' },
      // { field: 'item_Master_Item_Name', header: 'Item Name' },
      // { field: 'location_Master_Location_Name', header: 'Location' },
      // { field: 'damage_Details_Unit_ID', header: 'Unit' },
      // { field: 'damage_Details_Price', header: 'Price' },
      // { field: 'damage_Details_Amount', header: 'Amount' },
      // { field: 'damage_Details_QTY', header: 'Quantity' },
    ];

    this.priceCols = ['Title', 'Price'];
    this.initializeControls();
    this.initializeAccountDetails();

    this.damageEntryFormGroup = new FormGroup({
      voucherNo: new FormControl(''),
      voucherDate: new FormControl(new Date()),
      location: new FormControl(''),
      Narration: new FormControl('', Validators.required),
      totalAmount: new FormControl(),
      damageMasterId: new FormControl(),
    });
    this.damageEntryFormGroup.disable();
    //this.getVoucherNumber();
    // this.DamageEntryPrefix();
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.getAllLocations();
  }

  DefLocCheck: string;
  DefLocid: string;
  getDefaultLocation() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULT_LOCATION')
      .subscribe((data) => {
        if (data !== null) {
          this.DefLocCheck = data.result[0].generalSettingsTextValue;
          if (this.DefLocCheck !== null) {
            const splitText = this.DefLocCheck.split('::');
            this.DefLocid = splitText[1]?.trim();
            this.f.location.setValue(Number(this.DefLocid));
          }
        }
      });
  }

  displayDamageEntryListing() {
    this.service.getDamageEntry().subscribe((response) => {
      this.damageEntryResponse = response.result;
    });
    this.displayListing = true;
  }

  GetSaveddamageMasterDetails(id) {
    this.index = 0;
    this.service.GetDamageById(id).subscribe(
      (data: any) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.savedDamegeEnter = data;
          this.totalAmount = this.savedDamegeEnter?.damageDetails?.reduce(
            (acc, res) => acc + res?.damageDetailsAmount,
            0
          );
          this.updateFormGrid(data);
          this.damageEntryFormGroup.disable();
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
        this.damageEntryFormGroup.updateValueAndValidity();
      }
    );
  }

  public get IsValidGrid(): boolean {
    if (this.damageEntry.data.length > 0) {
      return this.damageEntry.data.some(
        (k: any) => k.ItemName != null && k.Amount != null
      );
    }
    return false;
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.service
          .deleteDamageEntry(this.savedDamegeEnter.damageMasterVoucherNumber)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Damage Entry Deleted Succesfully',
              });
              this.newEntry();
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

  submitDamageEntry() {
    const savedData: any = this.damageEntry.data;
    const damageMaster: DamageMaster =
      this.damageEntryFormGroup.getRawValue() as DamageMaster;

    damageMaster.damageMasterId =
      this.damageEntryFormGroup.getRawValue().damageMasterId;
    damageMaster.damageMasterVdate =
      this.damageEntryFormGroup.getRawValue().voucherDate;
    damageMaster.damageMasterNarration =
      this.damageEntryFormGroup.getRawValue().Narration;
    damageMaster.damageMasterLocationId =
      this.damageEntryFormGroup.get('location')?.value;
    damageMaster.damageMasterDelStatus = false;
    damageMaster.damageMasterVoucherNumber =
      this.damageEntryFormGroup.getRawValue().voucherNo
        ? this.damageEntryFormGroup.getRawValue().voucherNo
        : 'a';
    damageMaster.damageDetails = savedData
      ?.filter((k) => k.ItemId != null && k.Unit != null)
      .map((k: any) => {
        const unit = this.unitList?.find(
          (unit) => unit.unitMasterUnitShortName === k.Unit
        );
        return {
          damageDetailsDelStatus: false,
          damageDetailsMaterialId: k.ItemId,
          damageDetailsUnitId: unit?.unitMasterUnitId,
          damageDetailsVoucherNumber: this.damageEntryFormGroup.getRawValue()
            .voucherNo
            ? this.damageEntryFormGroup.getRawValue().voucherNo
            : '',
          damageDetailsRemarks: k.Remarks,
          damageDetailsAmount: k.Amount,
          damageDetailsPrice: k.Price,
          damageDetailsQty: k.Qty,
          damageDetailsId: k.damageDetailsId,
        };
      });

    if (this.btnFlag.save) {
      this.save(damageMaster);
    } else {
      this.update(damageMaster);
    }
  }

  save(damageMaster: DamageMaster) {
    if (this.damageEntryFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.service.submitDamageEntry(damageMaster).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.savedDamegeEnter = data.result;
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
                detail: 'Damage Entry Save Failed',
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
      this.damageEntryFormGroup.markAllAsTouched();

      this.damageEntryFormGroup.markAsDirty();
    }
  }
  update(damageMaster: DamageMaster) {
    if (this.damageEntryFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.service.UpdateDamageEntry(damageMaster).subscribe(
            (data: any) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.updateFormGrid(data.result);
              this.userTrackingLog('Update');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Damage Entry Updated Succesfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Damage Entry Update Failed',
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
      this.damageEntryFormGroup.markAllAsTouched();
      this.damageEntryFormGroup.markAsDirty();
    }
  }

  updateFormGrid(damage) {
    this.damageEntryFormGroup.patchValue({
      voucherNo: damage?.damageMasterVoucherNumber,
      location: damage?.damageMasterLocationId,
      Narration: damage?.damageMasterNarration,
      totalAmount: damage?.damageMasterTotalAmount,
      voucherDate: new Date(damage?.damageMasterVdate),
      damageMasterId: damage.damageMasterId,
    });

    const gridData = damage.damageDetails.map((detail) => {
      const unit = this.unitList?.find(
        (unit) => unit.unitMasterUnitId === detail.damageDetailsUnitId
      );
      const itemid = this.ItemMasterList?.find(
        (item) => item.value === detail?.damageDetailsMaterialId
      );

      let val = this.damageEntryFormGroup.get('totalAmount')?.value || 0; // Initialize val with the current value or 0
      val += detail.damageDetailsAmount;
      this.damageEntryFormGroup.get('totalAmount')?.setValue(val);

      return {
        ItemId: detail.damageDetailsMaterialId,
        ItemName: itemid?.label,
        Unit: unit.unitMasterUnitShortName,
        VoucherNo: detail.damageDetailsVoucherNumber,
        Remarks: detail.damageDetailsRemarks,
        Amount: detail?.damageDetailsAmount,
        Price: detail.damageDetailsPrice,
        Qty: detail.damageDetailsQty,
        damageDetailsId: detail.damageDetailsId,
      };
    });

    this.damageEntry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.damageEntryFormGroup.disable();
    this.damageEntryFormGroup.controls.voucherNo.clearValidators();
    this.damageEntryFormGroup.updateValueAndValidity();
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.damageEntryFormGroup.controls.voucherNo.clearValidators();
    this.damageEntryFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.damageEntryFormGroup,
      'location',
      this.locationLocked
    );
    this.damageEntryFormGroup.controls.voucherNo.disable();
    this.damageEntryFormGroup.updateValueAndValidity();
  }

  getAllLocations() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      const list = k ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = list.map((ar) => ar.locationMasterLocationName?.trim());
      this.locationLocked = this.utilityService.applyLocationLock(
        this.damageEntryFormGroup,
        'location'
      );
    });
  }

  selectUnit(unit: UnitMaster) {
    this.selectedUnit = unit;
    if (this.beingEdited != null) {
      this.beingEdited.Unit = this.selectedUnit.unitMasterUnitFullName;
      // this.gridData = new Array<any>();
      this.gridData[0] = this.beingEdited;
      this.hotRegisterer
        .getInstance(this.hotid)
        .updateSettings({ data: this.gridData });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Operation failed',
        detail: 'Select Item to Edit',
      });
    }
    if (
      this.selectedUnit.unitMasterUnitId == null ||
      this.VoucherNumber == null ||
      this.damageEntryFormGroup.value.narration == null ||
      this.damageEntryFormGroup.get('location')?.value ==
        null ||
      this.beingEdited.ItemId == null ||
      this.beingEdited.Price == null ||
      this.quantity == null ||
      this.remarks == null
    )
      this.checkNull = true;
    else this.checkNull = false;
    this.unitListing = false;
  }

  selectPrice(price: any) {
    if (this.beingEdited != null) {
      this.beingEdited.Price = parseFloat(price + '.000');
      this.gridData = new Array<any>();
      this.gridData[0] = this.beingEdited;
      this.hotRegisterer
        .getInstance(this.hotid)
        .updateSettings({ data: this.gridData });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Operation failed',
        detail: 'Select Item to Edit',
      });
    }
    if (
      this.selectedUnit.unitMasterUnitId == null ||
      this.VoucherNumber == null ||
      this.damageEntryFormGroup.value.narration == null ||
      this.damageEntryFormGroup.get('location')?.value ==
        null ||
      this.beingEdited.ItemId == null ||
      this.beingEdited.Price == null ||
      this.quantity == null ||
      this.remarks == null
    )
      this.checkNull = true;
    else this.checkNull = false;
    this.priceListing = false;
  }

  initializeAccountDetails() {
    this.accountDetails = this.utilityService.getTableConfig(
      accountDetailsColumnObjList(this),
      []
    );

    this.accountDetails.afterRemoveRow = (index: number, amount: number) => {
      this.ColumnSum();
    };
    this.accountDetails.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid entry : ' + value + 'at row/prop : ' + row + prop,
        });
      }
    };
  }

  initializeControls() {
    this.damageEntry = this.utilityService.getTableConfig(
      damageEntryColumnObjList(this),
      [0, 8]
    );
    this.damageEntry.afterChange = this.handleAfterChange.bind(this);

    this.damageEntry.afterSelection = (
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
      this.currentRow = row;
      if (column === 1 && this.damageEntry.readOnly === false) {
        this.lookupGridColumns = ['Item', 'Item ID'];
        this.dataList = this.itemLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.damageEntry.readOnly === false) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.unitArray = [];
        this.masterapi.GetUnitDetails(data[0]).subscribe((res) => {
          this.unitArray = res.result;
          this.dataList = this.unitSetLookup;
          const hot = this.hotRegisterer.getInstance(this.hotid);
          hot.deselectCell();
          this.unitArry = res.result.map((ar) =>
            ar.unitMasterUnitShortName?.trim()
          );
          this.showSalesLookUp = true;
        });
        // this.showSalesLookUp = true;
        this.activeRow = { row, column };
      }
    };
    this.damageEntry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      var data = hotinstance.getDataAtRow(change[0][0]);

      if (change[0][1] == 'Price') {
        var sum = data[4] * data[5];
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 6, sum.toFixed(2));
        var total = this.damageEntryFormGroup.get('totalAmount').value || 0;
        total += sum;
        this.damageEntryFormGroup.get('totalAmount').setValue(total);
      }
      // this.ColumnSum();
    };
    this.damageEntry.afterRemoveRow = (index: number, amount: number) => {
      this.ColumnSum();
    };
    this.damageEntry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }
  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      sales: kl?.unitMasterUnitShortName,
      salesId: kl.unitMasterUnitId,
    }));
  }

  ColumnSum() {
    if (this.damageEntry.data?.length > 0) {
      const sum1 = this.damageEntry.data?.filter((item) => item);
      this.damageEntryFormGroup.controls.ReceiptVoucherMasterDrAmount?.setValue(
        sum1
      );
    }
  }

  gridListIterator: number = 0;

  selectItem(item: any) {
    this.tempIterator = 0;
    this.quantity = '0.000';
    this.btnFlag.cancel = true;
    this.btnFlag.save = false;
    this.btnFlag.update = true;
    this.priceArray = new Array<Array<number>>();
    this.priceArray[0] = new Array<number>();

    this.priceArray[0].push(item.itemMasterUnitPrice);
    this.priceArray[0].push(item.itemMasterUnitPrice1);
    this.priceArray[0].push(item.itemMasterUnitPrice2);
    this.beingEdited = {
      VoucherNo: String(this.gridListIterator + 1),
      ItemId: item.itemMasterItemId,
      ItemName: item.itemMasterItemName,
      ItemBarcode: item.itemMasterBarcode,
      Price:
        item.itemMasterUnitPrice != null
          ? parseFloat(item.itemMasterUnitPrice + '.000')
          : 0,
      Amount:
        item.itemMasterUnitPrice != null
          ? String(
              parseFloat(String(this.quantity)) *
                parseFloat(item.itemMasterUnitPrice)
            )
          : '0',
      Qty: parseFloat(this.quantity),
      Unit: item.unitDetails[0].unitDetailsUnitId,
    };
    if (
      this.selectedUnit.unitMasterUnitId == null ||
      this.VoucherNumber == null ||
      this.damageEntryFormGroup.value.narration == null ||
      this.damageEntryFormGroup.get('location')?.value ==
        null ||
      this.beingEdited.ItemId == null ||
      this.beingEdited.Price == null ||
      this.quantity == null ||
      this.remarks == null
    )
      this.checkNull = true;
    else this.checkNull = false;
    //this.gridData.unshift(this.beingEdited);
    //this.gridData.push(this.beingEdited);
    this.gridData[this.gridListIterator] = this.beingEdited;
    this.gridListIterator++;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: this.gridData });
    //this.tempIterator++;
    this.displayMaximizable = false;
  }

  get itemLookup() {
    return this.ItemMasterArray.map((kl) => ({
      sales: kl.itemMasterItemName,
      salesId: kl.itemMasterItemId,
    }));
  }

  newEntry() {
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.damageEntryFormGroup.reset();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(this.damageEntryFormGroup, 'location');
    }
    this.damageEntryFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.damageEntryFormGroup,
      'location',
      this.locationLocked
    );
    this.damageEntry.data = [];
    this.damageEntry.readOnly = false;
    this.hotRegisterer.getInstance(this.hotid).updateSettings(this.damageEntry);
    // this.f.voucherDate.setValue(new Date());
    this.damageEntryFormGroup.get('voucherDate').setValue(new Date());

    if (!this.locationLocked) {
      this.getDefaultLocation();
    }
    this.search = null;
    this.index = 0;
    this.damageEntryFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.damageEntryFormGroup,
      'location',
      this.locationLocked
    );
    this.damageEntryFormGroup.updateValueAndValidity();
  }

  updateValue(x: string, event: string) {
    if (!this.editable || event.trim() === 'cancel') {
      this.itemList.forEach((element) => {
        if (element.ItemId === x) {
          element.editable = !element.editable;
          this.editable = !this.editable;
          if (element.editable) {
            this.beingEdited = element;
          } else {
            this.beingEdited = null;
          }
        }
      });
    } else
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'You can edit one item at a time ',
      });
  }

  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
    // this.dataset
  }

  cancelAll() {
    this.gridData = [];
    this.btnFlag.cancel = false;
    this.btnFlag.update = true;
    this.btnFlag.save = true;
    this.damageEntryFormGroup.controls['narration'].setValue('');
    this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: [] });
  }
  handleAfterChange(change, source) {
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);

    if (change != null) {
      const data = hotInstance.getDataAtRow(change[0][0]);

      if (data[4] != null && data[5] != null && change[0][1] !== 'Amount') {
        const sum1 = data[4] * data[5];
        hotInstance.setDataAtCell(change[0][0], 6, sum1);

        let val = this.damageEntryFormGroup.get('totalAmount')?.value || 0;
        val += sum1;
        this.damageEntryFormGroup.get('totalAmount')?.setValue(val);
      }
    } else if (this.x != null && this.x[0][1] === 'Remarks') {
      this.remarks = String(this.x[0][3]);
    }
  }

  handleChange(e) {
    this.index = e.index;
    if (e.index == 0) {
      setTimeout(() => {
        this.hotRegisterer
          .getInstance(this.hotid)
          .updateSettings(this.damageEntry);
      }, 100);
    } else {
      setTimeout(() => {
        this.hotRegisterer
          .getInstance(this.hotidAccounts)
          .updateSettings(this.accountDetails);
      }, 100);
    }
  }
  get f() {
    return this.damageEntryFormGroup.controls;
  }

  showPrintPreview: boolean = false;
  currentDate: Date = new Date();
  displayPrint() {
    // this.getCompanyDetails();
    this.showPrintPreview = true;
  }
  companyDetails: StationMaster = {};

  getCompanyDetails() {
    this.masterapi.getCompanyDetails().subscribe((response) => {
      this.companyDetails = response[0];
      console.table(response);
    });
  }

  exit(evt) {
    this.showSalesLookUp = false;
  }

  clear(evt) {
    this.showSalesLookUp = false;
  }

  hide(evt) {
    this.showSalesLookUp = false;
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

  selectedItem(evt) {
    let trimmedSales = evt.sales?.trim();
    const includesPcs = this.units?.some((unit) =>
      unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
    );
    if (includesPcs && this.unitArray.length != 0) {
      var UnitId: any = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.salesId
      );
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);

      hotInstance.setDataAtCell(
        this.activeRow.row,
        3,
        UnitId?.unitMasterUnitShortName
      );
      hotInstance.setDataAtCell(this.activeRow.row, 5, UnitId?.unitDetailsRate);
    } else {
      this.masterapi.GetAllItemMasterById(evt.salesId).subscribe((k) => {
        this.ItemMasterArrayByName = k.result;
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        hotInstance.setDataAtCell(
          this.activeRow.row,
          1,
          this.ItemMasterArrayByName.itemMasterItemId
        );
        hotInstance.setDataAtCell(
          this.activeRow.row,
          2,
          this.ItemMasterArrayByName.itemMasterItemName
        );

        if (
          this.ItemMasterArrayByName.unitDetails &&
          this.ItemMasterArrayByName.unitDetails.length > 0
        ) {
          const unitId =
            this.ItemMasterArrayByName.unitDetails[0].unitDetailsUnitId;
          const UnitId: string =
            unitId != null
              ? this.unitList?.find((l) => l.unitMasterUnitId == unitId)
                  .unitMasterUnitShortName
              : null;

          hotInstance.setDataAtCell(this.activeRow.row, 3, UnitId);
          hotInstance.setDataAtCell(
            this.activeRow.row,
            5,
            this.ItemMasterArrayByName.unitDetails[0]?.unitDetailsRate
          );
          // hotInstance.setDataAtCell(this.activeRow.row, 16, this.ItemMasterArrayByName.unitDetails[0]?.unitDetailsConversionType);
        }
      });
    }
    this.showSalesLookUp = false;
  }

  getUnitByItemId(id) {
    this.unitArray = [];
    this.masterapi.GetUnitDetails(id).subscribe((res) => {
      this.unitArray = res.result;
      // this.dataList = this.unitSetLookup;
      this.unitArry = res.result.map((ar) =>
        ar.unitMasterUnitShortName?.trim()
      );
      this.showSalesLookUp = true;
    });
  }

  getAllUnit() {
    this.masterapi.GetAllUnit().subscribe((response) => {
      this.unitList = response;
      this.unitNames = new Array<string>();
      this.unitList.forEach((element) => {
        this.unitNames.push(element.unitMasterUnitFullName.trim());
      });
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'Damage Entry',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.damageEntryFormGroup.get('voucherNo').value,
      vpType: 'Damage Entry',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      console.log('Response:', res);
    });
  }

  printAsPDF() {
    let htmlDesign: any = document.getElementById('print');
    this.fileSaverService.saveAsPDF(htmlDesign, 'Damage_Entry_' + new Date());
    this.userTrackingLog('pdf');
  }
  getUnitsById(id) {
    const unit = this.unitList?.find((unit) => unit.unitMasterUnitId === id);
    return unit?.unitMasterUnitShortName;
  }
  getItemById(id) {
    const itemid = this.ItemMasterList?.find((item) => item.value === id);
    return itemid?.label;
  }
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}

interface ItemList {
  VoucherNo?: string;
  ItemId?: string;
  ItemName?: string;
  Unit?: string;
  Price?: number;
  Amount?: string;
  Qty?: number;
  ItemBarcode?: string;
  Remarks?: string;
  editable?: boolean;
}
export const accountDetailsColumnObjList = (
  component: DamageEntryComponent
) => [
  {
    data: 'AccNo',
    type: 'text',
    label: 'Account No',
    toolTip: 'Account Number',
  },
  {
    data: 'AccName',
    type: 'text',
    label: 'Account Name',
    toolTip: 'Account Name',
  },
  {
    data: 'Particulars',
    type: 'text',
    label: 'Particulars',
    toolTip: 'Transaction Details',
  },
  {
    data: 'Debit',
    type: 'numeric',
    label: 'Debit',
    toolTip: 'Debit Amount',
    readOnly: false,
  },
  {
    data: 'Credit',
    type: 'numeric',
    label: 'Credit',
    toolTip: 'Credit Amount',
    readOnly: false,
  },
];
export const damageEntryColumnObjList = (component: DamageEntryComponent) => [
  {
    data: 'VoucherNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Voucher Number',
  },
  {
    data: 'ItemId',
    type: 'text',
    label: 'Item Code',
    toolTip: 'Item Code',
  },
  {
    data: 'ItemName',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
  },
  {
    data: 'Unit',
    type: 'autocomplete',
    label: 'Unit',
    toolTip: 'Unit of Measurement',
    readOnly: false,
    source: component.unitArry,
  },
  {
    data: 'Qty',
    type: 'numeric',
    label: 'Quantity',
    toolTip: 'Item Quantity',
    readOnly: false,
  },
  {
    data: 'Price',
    type: 'numeric',
    label: 'Price',
    toolTip: 'Item Price',
    readOnly: false,
  },
  {
    data: 'Amount',
    type: 'numeric',
    label: 'Amount',
    toolTip: 'Calculated Amount',
  },
  {
    data: 'Remarks',
    type: 'text',
    label: 'Remarks',
    toolTip: 'Additional Remarks',
    readOnly: false,
  },
  {
    data: 'damageDetailsId',
    type: 'numeric',
    label: 'ID',
    toolTip: 'Damage Detail ID',
  },
];
