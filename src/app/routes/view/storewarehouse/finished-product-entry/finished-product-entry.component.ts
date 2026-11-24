import { Component, ElementRef, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ConfirmationService, MessageService, SelectItem } from 'primeng';
import { ItemMaster } from 'src/app/routes/domain';
import { FinishproductentryDetail } from 'src/app/routes/domain/Masters/FinishproductentryDetail';
import { FinishproductentryMaster } from 'src/app/routes/domain/Masters/FinishproductentryMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-finished-product-entry',
  templateUrl: './finished-product-entry.component.html',
  styleUrls: ['./finished-product-entry.component.scss'],
})
export class FinishedProductEntryComponent implements OnInit {
  btnFlag: ButtonFlag;
  title: string;
  Permission: any;
  subtitle: string;
  dataset: any;
  dataList: Array<any> = [];
  cols: Array<any>;
  Date: Date;
  unitAry: any;
  activeRow: { row: number; column: number };
  unitListt: any;
  units: any;
  showSalesLookUp: boolean = false;
  itemArray: ItemMaster[] = [];
  itemArry: string[] = [];
  itemList: SelectItem[];
  ItemMasterArrayByName: any = null;
  // unitArray: UnitMaster[] = [];
  // unitList: SelectItem[];
  unitArry: string[] = [];
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  FPEForm: FormGroup;
  locationLocked = false;
  index: number = 0;
  search: null;
  stationmasterObj: StationMaster;
  ScreenId: number;
  user: any;
  currentRow: number = 0;
  funitid: any;
  savedValue: any;
  handleChange(e) {
    this.index = e.index;
  }
  confirmDropDatabaseDialogVisible: boolean = false;
  lookupGridColumns = [];
  selectItem: any;
  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];

  hotid = 'Productentry';
  private hotRegisterer = new HotTableRegisterer();
  Productentry: Handsontable.GridSettings;
  initializeControls() {
    this.Productentry = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [20, 20, 40, 20, 20, 20, 20, 20, 20, 20, 20, 20],
      minRows: 7,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,

      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'Code',
          type: 'numeric',
        },
        {
          data: 'Part No',
          type: 'numeric',
        },
        {
          data: 'MaterialName',
          type: 'text',
        },
        {
          data: 'Unit',
          type: 'text',
        },
        {
          data: 'Qty',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        // {
        //   data: 'CPO ID',
        //   type: 'numeric'
        // },
        {
          data: 'Rate',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'Amount',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          readOnly: true,
        },
      ],
      colHeaders: [
        this.translate.instant('Code'),
        this.translate.instant('Part No'),
        this.translate.instant('Material  Name'),
        this.translate.instant('Unit'),
        this.translate.instant('Qty'),
        // this.translate.instant('CPO ID'),
        this.translate.instant('Rate'),
        this.translate.instant('Amount'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    this.Productentry = this.utilityService.getTableConfig(
      finishedProductEntryColumnObjList(this),
      [5]
    );

    this.Productentry.afterSelection = (
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
      if (column === 0 && this.Productentry.readOnly === false) {
        this.lookupGridColumns = ['Part No', 'Item', 'Item Id'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.Productentry.readOnly === false) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        // this.getUnitByItemId(data[0]);
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 2 && this.Productentry.readOnly === false) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        // this.QutationList(data[2], data[0]);
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
    this.Productentry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      var data = hotinstance.getDataAtRow(change[0][0]);
      //console.log(change, '11222', data);
      if (change[0][1] == 'Qty') {
        var sum = data[4] * data[5];
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 6, sum.toFixed(2));
      }
      if (change[0][1] == 'Rate') {
        var sum = data[4] * data[5];
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 6, sum.toFixed(2));
      }
      // this.ColumnSum();
    };
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private permission: PermissionsService,
    private masterapi: MasterApiService,
    private router: Router,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
      this.stationmasterObj = this.permission.getStation();
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

    this.FPEForm = new FormGroup({
      VoucherNo: new FormControl(''),
      Date: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      Location: new FormControl('', Validators.required),
      Narration: new FormControl('', Validators.required),
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
      new: true,
    };
    this.initializeControls();
    this.getAllLocation();
    this.getAllUnit();
    this.getAllItems();
  }
  get f() {
    return this.FPEForm.controls;
  }
  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      const list = k ?? [];
      this.locationArray = list;
      this.locationList = list.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select--', value: -1 });
      this.locationArry = list.map((ar) => ar.locationMasterLocationName?.trim());
      this.locationLocked = this.utilityService.applyLocationLock(
        this.FPEForm,
        'Location'
      );
    });
  }
  getAllUnit() {
    this.masterapi.GetAllUnit().subscribe((k) => {
      this.units = k;
      this.unitListt = k.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = k.map((ar) => ar?.unitMasterUnitShortName?.trim());
    });
  }
  get itemSetLookup() {
    return this.itemArray.map((kl) => ({
      partNo: kl.itemMasterPartNo,
      sales: kl.itemMasterItemName,
      salesId: kl.itemMasterItemId,
    }));
  }

  get unitSetLookup() {
    return this.units.map((kl) => ({
      sales: kl.unitMasterUnitShortName,
      salesId: kl.unitMasterUnitId,
    }));
  }
  getAllItems() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.itemArray = k.result;
      this.itemList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.itemList.unshift({ label: '--Select--', value: -1 });
      this.itemArry = k.result.map((ar) =>
        ar.itemMasterItemName ? ar.itemMasterItemName?.trim() : ''
      );
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  submitFinshedProduct() {
    const savedData: any = this.Productentry.data;
    const finshedProduct: FinishproductentryMaster =
      this.FPEForm.getRawValue() as FinishproductentryMaster;
    finshedProduct.MasterId = this.FPEForm.getRawValue().finshedProductId;
    finshedProduct.VoucherNo = this.FPEForm.getRawValue().voucherNo
      ? this.FPEForm.getRawValue().voucherNo
      : '';
    finshedProduct.Date = this.FPEForm.getRawValue().Date;
    finshedProduct.Narration = this.FPEForm.getRawValue().Narration;
    finshedProduct.Location = this.FPEForm.get('Location')?.value;
    finshedProduct.DelStatus = false;
    finshedProduct.FinishproductentryDetail = savedData
      ?.filter((k) => k.Code != null && k.Unit != null)
      .map((k: any) => {
        console.log('k', k);
        const unit = this.unitListt?.find(
          (unit) => unit.label === k.Unit
        ).value;
        return {
          finishedProductDetailsDelStatus: false,
          finishedProductDetailsMaterialId: k.Code,
          finishedProductDetailsUnitId: unit,
          finishedProductDetailsVoucherNumber: this.FPEForm.getRawValue()
            .voucherNo
            ? this.FPEForm.getRawValue().voucherNo
            : '',
          finishedProductDetailsAmount: k.Amount,
          finishedProductDetailsPrice: k.Rate,
          finishedProductDetailsQty: k.Qty,
          finishedProductMasterId: k.damageDetailsId,
        };
      });

    if (this.btnFlag.save) {
      this.save(finshedProduct);
    } else {
      this.update(finshedProduct);
    }
  }

  save(finshedProduct: any) {
    if (this.FPEForm.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          console.log('finshedProduct', finshedProduct);
          // this.service.submitDamageEntry(damageMaster).subscribe((data) => {
          //   this.btnFlag = {
          //     edit: true,
          //     cancel: false,
          //     save: false,
          //     update: true,
          //     delete: true,
          //   };
          //   this.savedValue = data.result;
          //   this.updateFormGrid(data.result);
          //   // this.userTrackingLog('Insert');
          //   if (data.valid) {
          //     this.messageService.add({
          //       severity: 'success',
          //       summary: 'Alert',
          //       detail: data.message,
          //     });
          //   } else if (data.error) {
          //     this.messageService.add({
          //       severity: 'error',
          //       summary: 'Alert',
          //       detail:
          //         data.message != null && data.message?.trim() !== ''
          //           ? data.message
          //           : data.exception,
          //     });
          //   }
          // },
          //   (err) => {
          //     this.messageService.add({
          //       severity: 'error',
          //       summary: 'Alert',
          //       detail: 'Damage Entry Save Failed',
          //     });
          // }
          //);
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.FPEForm.markAllAsTouched();

      this.FPEForm.markAsDirty();
    }
  }
  update(finshedProduct: any) {
    if (this.FPEForm.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          console.log('finshedProduct', finshedProduct);

          //   return
          //   this.service.UpdateDamageEntry(damageMaster).subscribe(
          //     (data: any) => {
          //       this.btnFlag = {
          //         edit: true,
          //         cancel: false,
          //         save: false,
          //         update: true,
          //         delete: true,
          //       };
          //       this.updateFormGrid(data.result);
          //       this.userTrackingLog('Update');
          //       this.messageService.add({
          //         severity: 'success',
          //         summary: 'Alert',
          //         detail: 'Damage Entry Updated Succesfully',
          //       });
          //     },
          //     (err) => {
          //       this.messageService.add({
          //         severity: 'error',
          //         summary: 'Alert',
          //         detail: 'Damage Entry Update Failed',
          //       });
          //     }
          //   );
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
      this.FPEForm.markAllAsTouched();
      this.FPEForm.markAsDirty();
    }
  }

  // updateFormGrid(damage) {

  //   this.FPEForm.patchValue({
  //     voucherNo: damage?.damageMasterVoucherNumber,
  //     location: damage?.damageMasterLocationId,
  //     Narration: damage?.damageMasterNarration,
  //     totalAmount: damage?.damageMasterTotalAmount,
  //     voucherDate: new Date(damage?.damageMasterVdate),
  //     damageMasterId: damage.damageMasterId
  //   });

  //   const gridData = damage.damageDetails.map((detail) => {
  //     const unit = this.unitListt?.find((unit) => unit.unitMasterUnitId === detail.damageDetailsUnitId);
  //     const itemid = this.ItemMasterList?.find((item) => item.value === detail?.damageDetailsMaterialId)

  //     let val = this.FPEForm.get('totalAmount')?.value || 0; // Initialize val with the current value or 0
  //     val += detail.damageDetailsAmount;
  //     this.FPEForm.get('totalAmount')?.setValue(val);

  //     return {
  //       ItemId: detail.damageDetailsMaterialId,
  //       ItemName: itemid?.label,
  //       Unit: unit.unitMasterUnitShortName,
  //       VoucherNo: detail.damageDetailsVoucherNumber,
  //       Remarks: detail.damageDetailsRemarks,
  //       Amount: detail?.damageDetailsAmount,
  //       Price: detail.damageDetailsPrice,
  //       Qty: detail.damageDetailsQty,
  //       damageDetailsId: detail.damageDetailsId
  //     };
  //   });

  //   this.damageEntry.data = gridData;
  //   this.hotRegisterer
  //     .getInstance(this.hotid)
  //     .updateSettings({ data: gridData, readOnly: true });
  //   this.FPEForm.disable();
  //   this.FPEForm.controls.voucherNo.clearValidators();
  //   this.FPEForm.updateValueAndValidity();
  // }
  public get IsValidGrid(): boolean {
    if (this.Productentry.data.length > 0) {
      return this.Productentry.data.some(
        (k: any) => k.MaterialName != null && k.Amount != null
      );
    }
    return false;
  }
  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.FPEForm.controls.VoucherNo.clearValidators();
    this.FPEForm.enable();
    this.utilityService.reapplyLocationLock(
      this.FPEForm,
      'Location',
      this.locationLocked
    );
    this.FPEForm.controls.VoucherNo.disable();
    this.FPEForm.updateValueAndValidity();
  }

  selectsales(evt) {
    let trimmedSales = evt.sales?.trim();
    const includesPcs = this.units.some((unit) =>
      unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
    );
    if (includesPcs && this.units.length != 0) {
      const UnitId: string = this.units?.find(
        (l) => l.unitMasterUnitId == evt.salesId
      )?.unitMasterUnitShortName;
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, UnitId);
    } else {
      this.masterapi.GetUnitDetails(evt.salesId).subscribe((res) => {
        this.units = res.result;
        this.unitArry = res.result.map((ar) =>
          ar.unitMasterUnitShortName?.trim()
        );
      });

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.salesId);
      this.masterapi.GetItemMasterById({ id: evt.salesId }).subscribe((k) => {
        this.ItemMasterArrayByName = k.resultSet?.itemMaster;
        // this.conversion_Type = this.ItemMasterArrayByName.unitDetails[0].unitDetailsConversionType;

        const UnitId =
          this.ItemMasterArrayByName?.unitDetails?.unitDetailsUnitId;
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            5,
            this.ItemMasterArrayByName?.unitDetails?.unitDetailsUnitPrice
          );
        this.funitid =
          this.ItemMasterArrayByName?.unitDetails?.unitDetailsUnitId;
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
            9,
            this.ItemMasterArrayByName?.unitDetails?.unitDetailsUnitCost
          );

        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            5,
            this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitPrice
          );
        this.funitid =
          this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;

        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            9,
            this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitCost
          );

        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            2,
            this.ItemMasterArrayByName.itemMasterItemName
          );
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            1,
            this.ItemMasterArrayByName.itemMasterPartNo
          );
      });
    }
    this.showSalesLookUp = false;
  }
  new() {
    this.FPEForm.reset();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(this.FPEForm, 'Location');
    }
    this.FPEForm.enable();
    this.utilityService.reapplyLocationLock(
      this.FPEForm,
      'Location',
      this.locationLocked
    );
    this.Productentry.data = [];
    // this.customerQuotationentryDataset = [];
    this.Productentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.Productentry);
    this.FPEForm.reset();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(this.FPEForm, 'Location');
    }

    this.FPEForm.get('Date').setValue(new Date());
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
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
    //this.getDefaultCurrency();
    //this.getDefaultLocation();
    this.FPEForm.enable();
    this.utilityService.reapplyLocationLock(
      this.FPEForm,
      'Location',
      this.locationLocked
    );
    this.f.customerQuotationVoucherNo.clearValidators();
    this.FPEForm.updateValueAndValidity();
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.FPEForm.controls.VoucherNo?.disable();
  }
  exit(evt) {
    this.showSalesLookUp = false;
  }
  hide(evt: boolean) {
    this.showSalesLookUp = false;
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
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(this.FPEForm, 'Location');
    }
    this.showSalesLookUp = false;
  }
}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
export const finishedProductEntryColumnObjList = (
  component: FinishedProductEntryComponent
) => [
  {
    data: 'Code',
    type: 'numeric',
    label: 'Code',
    toolTip: 'Item Code',
  },
  {
    data: 'Part No',
    type: 'numeric',
    label: 'Part No',
    toolTip: 'Part Number',
  },
  {
    data: 'MaterialName',
    type: 'text',
    label: 'Material Name',
    toolTip: 'Material Description',
  },
  {
    data: 'Unit',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit of Measurement',
  },
  {
    data: 'Qty',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
    readOnly: false,
  },
  {
    data: 'Rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Unit Rate',
    readOnly: false,
  },
  {
    data: 'Amount',
    type: 'numeric',
    label: 'Amount',
    toolTip: 'Total Amount',
  },
];
