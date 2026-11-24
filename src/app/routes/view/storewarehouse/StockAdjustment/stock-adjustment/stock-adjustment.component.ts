import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MenuItem } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { StockAdjustment } from 'src/app/routes/domain/Store/StockAdjustment';
import { StockAdjustmentDetails } from 'src/app/routes/domain/Store/StockAdjustmentDetails';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-stock-adjustment',
  templateUrl: './stock-adjustment.component.html',
  styleUrls: ['./stock-adjustment.component.scss'],
})
export class StockAdjustmentComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;
  btnFlag: ButtonFlag;
  search: string = null;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  dataset: any;

  showItemList: boolean = false;
  showUnitList: boolean = false;
  locationArray: LocationMaster[] = [];
  locationList: SelectItem[] = [];
  locationArry: string[] = [];

  conversion_Type: number = 0;

  unitAry: any;
  unitListt: any;
  units: any;
  JOBCOST: boolean = true;
  licensekey: string;
  itemListcols: Array<any> = [];
  itemList: Array<any> = [];
  unitListcols: Array<any> = [];
  DefLocation: string;
  DefLocationCheck: string;
  selectedItem: any;
  currentIndex: number = 0;
  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  stockAdjustmentarry: any;
  ItemMasterGroupList: SelectItem[];
  // stockAdjustmentarry: StockAdjustment[] = [];
  savedStockAdjustment: any;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'stockAdjustmentEntry';
  lookupGridColumns: any;
  activeRow: { row: number; column: number };
  ScreenId: number;
  Permission: any;
  user: any;
  showJobList: boolean = false;
  ItemMasterArrayByName: any;
  unitDetailID: any;
  selectedMatIdForUnits: any;

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private confirmation: ConfirmationService,
    private masterApi: MasterApiService,
    private translate: TranslateService,
    private masterapi: MasterApiService,
    private stockApi: StockApiService,
    private utilityService: UtilityService,

    private permission: PermissionsService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  title: string;
  stockAdjustmententry: Handsontable.GridSettings;
  StockAdjustmentFormGroup: FormGroup;
  locationLocked = false;
  originalData: any;

  cols;

  ngOnInit(): void {
    this.StockAdjustmentFormGroup = this.fb.group({
      stockAdjustmentVoucherSaId: [''],
      stockAdjustmentVoucherSaNo: [''],
      stockAdjustmentVoucherSaDate: [new Date(), [Validators.required]],
      stockAdjustmentVoucherSAAsOnDate: [new Date(), [Validators.required]],

      stockAdjustmentVoucherLocationId: [null],
      stockAdjustmentGroupId: [null],
      stockAdjustmentVoucherSaRemarks: [''],
      stockAdjustmentVoucherFsno: [null],
      stockAdjustmentVoucherStVno: [{ value: null, disabled: true }],
      stockAdjustmentVoucherDelStatus: [null],
      stockAdjustmentVoucherTotAmount: [0],
      stockAdjustmentVoucherTotQty: [0],
    });
    this.StockAdjustmentFormGroup.disable();
    this.cols = [
      // { field: 'stockAdjustmentBarCode', header: 'BarCode'},
      { field: 'stockAdjustmentVoucherSaNo', header: 'VoucherNo' },
      { field: 'stockAdjustmentVoucherSaDate', header: 'Date' },
      // { field: 'locationMasterLocationId', header: 'LoctionId'},
      { field: 'stockAdjustmentVoucherSaRemarks', header: 'Remarks' },
      { field: 'action', header: 'Action' },
    ];
    this.initializeControls()

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      list: true,
    };
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

    this.itemListcols = [
      { field: 'itemMasterItemId', header: 'Item Code' },
      { field: 'itemMasterBarcode', header: 'Bar Code' },
      { field: 'itemMasterItemName', header: 'Item Name' },

      // { field: "item_Master_Part_No", header: "Part No" },
      { field: 'itemMasterCurrentStock', header: 'Stock' },
    ];
    this.unitListcols = [
      { field: 'unitMasterUnitId', header: 'Unit Code' },
      { field: 'unitMasterUnitShortName', header: 'Unit Short Name' },
      { field: 'unitMasterUnitFullName', header: 'Unit Name' },
      { field: 'unitDetailsConversionType', header: 'Conversion' },
    ];
    // this.initializeControls();

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.bykeys();
  }

  get f() {
    return this.StockAdjustmentFormGroup.controls;
  }

  GetStockByLocation() {
    const id = this.f.stockAdjustmentVoucherLocationId.value;
    const groupId = this.f.stockAdjustmentGroupId.value;

    const date = new Date(this.f.stockAdjustmentVoucherSAAsOnDate.value);
    const formattedDate = date.toISOString().split('T')[0];

    this.stockApi.GetStockByLocation(id, formattedDate).subscribe((m: any) => {

      const gridData = m.resultSet.map((k) => {

        const item = this.itemList?.find(
          i => i.itemMasterItemId === k.stockRegisterMaterialID
        );

        // ✅ pick first valid job id
        const jobIdValue = k.stockRegisterJobID?.find(
          j => j !== -1 && j !== null
        );

        const jobName = this.jobList?.find(
          j => j.value === jobIdValue
        )?.label ?? '';

        // ✅ pick first valid unit id
        const unitIdValue = k.stockRegisterUnitID?.[0];

        const unitName = this.unitListt?.find(
          u => u.unitMasterUnitId === unitIdValue
        )?.unitMasterUnitShortName ?? '';

        const qty = Number(k.stockRegisterQuantity ?? 0);
        const rate = Number(k.stockRegisterRate ?? 0);

        return {
          MatId: k.stockRegisterMaterialID,
          MaterialName: item?.itemMasterItemName ?? '',
          BaseUnit: unitName,
          Job: jobName,
          Jobid: jobIdValue ?? -1,

          OrignalStock: qty,
          Adjustment: 0,
          CurrentStock: 0,
          rate: rate,
          amt: 0,

          groupId: item?.itemMasterAccountNo ?? null,
          selectedUnitId: unitIdValue,
        };
      });

      this.stockAdjustmententry.data = gridData;
      this.originalData = [...gridData];

      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      hotInstance.updateSettings({
        data: gridData,
        readOnly: false
      });

      this.onItemGroupChange({ value: groupId });
    });
  }

  hideJobDetail: boolean = false;
  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail')
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;

        setTimeout(() => {
          this.updateTableConfiguration();
        }, 1000);
      });
  }
  updateTableConfiguration() {
    const hiddenColumns = [10];
    if (this.hideJobDetail) {
      hiddenColumns.push(4);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }

  initializeControls() {
    this.stockApi.StockAdjustmentDropdownByLocation().subscribe((m: any) => {
      //job
      this.jobArray = m.resultSet.jobMasters;
      this.jobArry = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobArry = m.resultSet.jobMasters.map((ar) =>
        ar.jobMasterJobName?.trim()
      );

      //item
      this.itemList = m.resultSet.itemMaster;
      //location
      const locationMaster = m?.resultSet?.locationMaster ?? [];
      this.locationArray = locationMaster;
      this.locationArry = locationMaster;
      this.locationList = locationMaster
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationLocked = this.utilityService.applyLocationLock(
        this.StockAdjustmentFormGroup,
        'stockAdjustmentVoucherLocationId'
      );
      if (this.locationLocked) {
        this.LOCKlOCATION = true;
      }
      //unit
      this.unitArray = m.resultSet.unitMasters;
      this.unitArry = m.resultSet.unitMasters;
      this.unitList = m.resultSet.unitMasters;
      this.unitListt = m.resultSet.unitMasters;
      this.units = m.resultSet.unitMasters;
    this.ItemMasterGroupList = [
        { label: '--Select--', value: '' },
        ...m.resultSet.itemGroup.map((kl) => ({
          label: kl.itemMasterItemName,
          value: kl.itemMasterItemId,
        }))
];
    });

    let cols = stockAdjustmentColumnList(this);
    let hiddenColumn = [4, 10];

    this.stockAdjustmententry = this.utilityService.getTableConfig(
      cols,
      hiddenColumn
    );
    (this.stockAdjustmententry.beforeOnCellMouseUp = (event, coords, TD) => {
      this.currentIndex = coords.row;
      if (coords.col.valueOf() === 0) {
        this.showItemList = true;
      } else if (coords.col.valueOf() === 3) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(coords.row);
        const matId = data[0];
        if (matId) {
          this.selectedMatIdForUnits = matId;
          this.masterapi.GetUnitDetails(matId).subscribe((res: any) => {
            let units = res?.result || [];
            if (!units || units.length === 0) {
              this.masterapi.GetAllItemMasterById(matId).subscribe((itemRes: any) => {
                const itemData = itemRes?.result ?? itemRes?.resultSet?.itemMaster;
                if (itemData?.unitDetails && itemData.unitDetails.length > 0) {
                  units = itemData.unitDetails.map((ud: any) => {
                    const matchedMaster = this.units?.find(
                      (u: any) => u.unitMasterUnitId === (ud.unitDetailsUnitId ?? ud.UnitDetailsUnitId)
                    );
                    return {
                      unitMasterUnitId: ud.unitDetailsUnitId ?? ud.UnitDetailsUnitId,
                      unitMasterUnitShortName: matchedMaster?.unitMasterUnitShortName ?? ud.unitDetailsPacking ?? '',
                      unitMasterUnitFullName: matchedMaster?.unitMasterUnitFullName ?? '',
                      unitDetailsConversionType: ud.unitDetailsConversionType ?? ud.UnitDetailsConversionType ?? 1,
                      unitDetailsRate: ud.unitDetailsRate ?? ud.UnitDetailsRate ?? 0,
                    };
                  });
                }
                this.unitArray = units;
                this.unitList = units;
                this.unitArry = units.map((ar: any) =>
                  (ar.unitMasterUnitShortName ?? ar.UnitMasterUnitShortName)?.trim()
                );
                this.showUnitList = true;
              });
            } else {
              this.unitArray = units;
              this.unitList = units;
              this.unitArry = units.map((ar: any) =>
                (ar.unitMasterUnitShortName ?? ar.UnitMasterUnitShortName)?.trim()
              );
              this.showUnitList = true;
            }
          });
        }
      } else if (coords.col.valueOf() === 4) {
        this.showJobList = true;
      }
    }),
      (this.stockAdjustmententry.afterSelection = (
        row,
        column,
        row2,
        column2,
        preventScrolling,
        selectionLayerLevel
      ) => {
        this.currentIndex = row;
        this.ColumnSum();
      });
    this.stockAdjustmententry.beforeChangeRender = (changes, source) => {
      if (!changes || (source as any) === 'unitChange' || (source as any) === 'calc') {
        return;
      }
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      const batchUpdates: [number, number, any][] = [];

      changes.forEach(([row, prop, oldValue, newValue]) => {
        const rowSource: any = hotinstance.getSourceDataAtRow(row);

        if (prop === 'CurrentStock') {
          const data = hotinstance.getDataAtRow(row);
          const origStock = parseFloat(data[5]) || 0;
          const currentStock = parseFloat(newValue) || 0;
          const adj = parseFloat((currentStock - origStock).toFixed(4));
          const rate = parseFloat(data[8]) || 0;
          const amt = parseFloat((adj * rate).toFixed(2));

          if (rowSource) {
            rowSource.CurrentStock = currentStock;
            rowSource.Adjustment = adj;
            rowSource.amt = amt;
          }

          batchUpdates.push([row, 7, adj], [row, 9, amt]);
        } else if (prop === 'Adjustment') {
          const data = hotinstance.getDataAtRow(row);
          const origStock = parseFloat(data[5]) || 0;
          const adj = parseFloat(newValue) || 0;
          const currentStock = parseFloat((origStock + adj).toFixed(4));
          const rate = parseFloat(data[8]) || 0;
          const amt = parseFloat((adj * rate).toFixed(2));

          if (rowSource) {
            rowSource.CurrentStock = currentStock;
            rowSource.Adjustment = adj;
            rowSource.amt = amt;
          }

          batchUpdates.push([row, 6, currentStock], [row, 9, amt]);
        } else if (prop === 'rate') {
          const data = hotinstance.getDataAtRow(row);
          const adj = parseFloat(data[7]) || 0;
          const newRate = parseFloat(newValue) || 0;
          const amt = parseFloat((adj * newRate).toFixed(2));

          if (rowSource) {
            rowSource.rate = newRate;
            rowSource.amt = amt;
          }

          batchUpdates.push([row, 9, amt]);
        }
      });

      if (batchUpdates.length > 0) {
        hotinstance.setDataAtCell(batchUpdates, 'calc');
      }
      this.ColumnSum();
    };

    this.stockAdjustmententry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum();
    };
  }
  selectJOb(job) {
    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.currentIndex, 4, job.jobMasterJobName);

    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.currentIndex, 10, job.jobMasterJobId);
    this.showJobList = false;
  }

  ColumnSum() {
    //
    var amt = 0;
    this.stockAdjustmententry.data.forEach((elemt: any) => {
      if (elemt.rate && elemt.Adjustment) {
        amt += elemt.rate ? elemt.Adjustment * elemt.rate : 0;
      }
    });
    amt = parseFloat(amt.toFixed(2));
    this.StockAdjustmentFormGroup.controls.stockAdjustmentVoucherTotAmount.setValue(
      amt
    );

    var value = 0;
    this.stockAdjustmententry.data.forEach((elemt: any) => {
      if (elemt && elemt.Adjustment) {
        value += elemt.Adjustment;
      }
    });
    value = parseFloat(value.toFixed(2));
    this.StockAdjustmentFormGroup.controls.stockAdjustmentVoucherTotQty.setValue(
      value
    );

    // this.GetTotal();
  }
  getStockItemsList() {
    this.stockApi.getStockItemsList().subscribe((data: any) => {
      this.itemList = data.result;
    });
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

  cancelAll() {
    this.StockAdjustmentFormGroup.reset();
    this.btnFlag.cancel = true;
    this.btnFlag.edit = true;
    this.btnFlag.save = true;
    // this.StockAdjustmentFormGroup.controls["VoucherDate"].setValue(new Date(new Date().setFullYear(new Date().getFullYear())));
  }

  onItemGroupChange(event: any): void {
    const filterData = this.originalData?.filter(
      (i) => i.groupId == event.value
    );
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: filterData });
  }

  saveStockAdjustment() {
    this.StockAdjustmentFormGroup.markAllAsTouched();

    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    const tableData: any[] = hotInstance ? hotInstance.getSourceData() : [];
    const savedData: GridData[] = tableData.filter(
      (k) => k.hasOwnProperty('MatId') && k.hasOwnProperty('CurrentStock')
    );
    const stockAdjustment: StockAdjustment = this.StockAdjustmentFormGroup
      .value as StockAdjustment;
    (stockAdjustment.stockAdjustmentVoucherSaId =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherSaId),
      (stockAdjustment.stockAdjustmentVoucherSaNo =
        this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherSaNo);
    stockAdjustment.stockAdjustmentVoucherSaDate =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherSaDate;
    stockAdjustment.stockAdjustmentVoucherSAAsOnDate =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherSAAsOnDate;

    stockAdjustment.stockAdjustmentVoucherSaRemarks =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherSaRemarks;
    (stockAdjustment.stockAdjustmentVoucherFsno = 456),
      (stockAdjustment.stockAdjustmentVoucherStVno =
        this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherStVno);
    stockAdjustment.stockAdjustmentVoucherLocationId =
      this.StockAdjustmentFormGroup.get('stockAdjustmentVoucherLocationId')
        ?.value;
    (stockAdjustment.stockAdjustmentVoucherDelStatus = false),
      (stockAdjustment.stockAdjusmentVoucherTotQty =
        this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherTotQty);
    stockAdjustment.stockAdjusmentVoucherTotAmount =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherTotAmount;
    stockAdjustment.stockAdjustmentVoucherDetails = savedData
      ?.filter((k) => k.MatId != null)
      .map((k: any) => {
        const UnitId =
          k.selectedUnitId ??
          this.unitListt?.find(
            (l) =>
              l.unitMasterUnitShortName?.trim() == k?.BaseUnit?.trim() ||
              l.label?.trim() == k?.BaseUnit?.trim()
          )?.unitMasterUnitId ??
          this.unitListt?.find(
            (l) =>
              l.unitMasterUnitShortName?.trim() == k?.BaseUnit?.trim() ||
              l.label?.trim() == k?.BaseUnit?.trim()
          )?.value;
        return {
          stockAdjustmentVoucherDetailsDetId: 0,
          stockAdjustmentVoucherDetailsSaNo: null,
          stockAdjustmentVoucherDetailsMaterialId: k?.MatId,
          stockAdjustmentVoucherDetailsManualQty: k.OrignalStock,
          stockAdjustmentVoucherDetailsAdjQty: k?.Adjustment,
          stockAdjustmentVoucherDetailsLocationId:
            this.StockAdjustmentFormGroup.get(
              'stockAdjustmentVoucherLocationId'
            )?.value,
          stockAdjustmentVoucherDetailsJobId: k.Jobid ?? -1,

          stockAdjustmentVoucherDetailsSaId: null,
          stockAdjustmentVoucherDetailsCosePrice: k?.rate,
          stockAdjustmentVoucherDetailsIsEdit: false,
          stockAdjustmentVoucherDetailsUnitId: UnitId,
          stockAdjustmentVoucherDetailsBatchCode: null,
          stockAdjustmentVoucherDetailsExpDate: null,
          stockAdjustmentVoucherDetailsDelStatus: false,
        };
      });

    if (this.btnFlag.save) {
      this.saveAdjustment(stockAdjustment);
    } else {
      this.updateAdjustment(stockAdjustment);
    }
  }

  saveAdjustment(StockAdjustment: StockAdjustment) {

    if (this.StockAdjustmentFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.stockApi.InsertStockAdjustment(StockAdjustment).subscribe(
            (data: any) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.savedStockAdjustment = data.result;
              this.updateFormGrid(data.result);
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
                detail: 'Stock Adjustment Save Failed',
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
      this.StockAdjustmentFormGroup.markAllAsTouched();
      this.StockAdjustmentFormGroup.markAsDirty();
    }
  }

  updateAdjustment(stockAdjustment: any) {
    if (this.StockAdjustmentFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.stockApi.UpdateStockAdjustment(stockAdjustment).subscribe(
            (data: any) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.updateFormGrid(data.result);
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Stock Adjustment Updated Succesfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Stock Adjustment Update Failed',
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
      this.StockAdjustmentFormGroup.markAllAsTouched();
      this.StockAdjustmentFormGroup.markAsDirty();
    }
  }

  getAllStockAdjustment() {
    this.stockApi.GetAllStockAdjustment().subscribe((data: any) => {
      this.stockAdjustmentarry = data.result;
    });
  }

  selectItem(item: any) {
    const hot = this.hotRegisterer.getInstance(this.hotid);
    this.selectedItem = item;

    this.masterapi
      .GetItemMasterById({ id: item?.itemMasterItemId })
      .subscribe((k) => {
        this.ItemMasterArrayByName = k.resultSet?.itemMaster || k.result;
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);

        const rawUnitDetails = this.ItemMasterArrayByName?.unitDetails;
        let unitDetails: any = null;
        if (Array.isArray(rawUnitDetails) && rawUnitDetails.length > 0) {
          unitDetails =
            rawUnitDetails.find(
              (u: any) =>
                Number(u.unitDetailsConversionType || u.UnitDetailsConversionType || 1) === 1
            ) || rawUnitDetails[0];
        } else {
          unitDetails = rawUnitDetails;
        }

        this.unitDetailID = unitDetails?.unitDetailsId;
        if (unitDetails) {
          const unitId = unitDetails.unitDetailsUnitId;
          const unitLabel =
            unitId != null
              ? (this.unitListt?.find((l) => l.unitMasterUnitId == unitId || l.value == unitId)?.unitMasterUnitShortName ||
                 this.unitListt?.find((l) => l.unitMasterUnitId == unitId || l.value == unitId)?.label)
              : null;
          const conv = Number(unitDetails.unitDetailsConversionType || 1) || 1;
          const currentItemStock = Number(this.ItemMasterArrayByName.currentItemStock || 0);
          const stock = parseFloat((currentItemStock / conv).toFixed(4));
          const rate = Number(unitDetails.unitDetailsRate || this.ItemMasterArrayByName.itemMasterUnitPrice || 0);

          hotInstance.setDataAtCell([
            [this.currentIndex, 0, this.ItemMasterArrayByName.itemMasterItemId],
            [this.currentIndex, 2, this.ItemMasterArrayByName.itemMasterItemName],
            [this.currentIndex, 3, unitLabel],
            [this.currentIndex, 5, stock],
            [this.currentIndex, 8, rate],
          ], 'loadItem');

          const rowSource: any = hotInstance.getSourceDataAtRow(this.currentIndex);
          if (rowSource) {
            rowSource.MatId = this.ItemMasterArrayByName.itemMasterItemId;
            rowSource.MaterialName = this.ItemMasterArrayByName.itemMasterItemName;
            rowSource.BaseUnit = unitLabel;
            rowSource.OrignalStock = stock;
            rowSource.rate = rate;
            rowSource.currentConversion = conv;
            rowSource.conversionType = conv;
            rowSource.selectedUnitId = unitId;
          }

          this.hotRegisterer
            .getInstance(this.hotid)
            .selectCell(this.currentIndex, 6);
        }
      });

    this.showItemList = false;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  newForm() {
    this.StockAdjustmentFormGroup.reset();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.StockAdjustmentFormGroup,
        'stockAdjustmentVoucherLocationId'
      );
    }
    this.stockAdjustmententry.data = [];
    this.stockAdjustmententry.readOnly = false;
    this.StockAdjustmentFormGroup.get(
      'stockAdjustmentVoucherSAAsOnDate'
    ).setValue(new Date());
    this.StockAdjustmentFormGroup.get('stockAdjustmentVoucherSaDate').setValue(
      new Date()
    );
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      list: true,
    };
    this.GetDefaultSettings();
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.stockAdjustmententry);

    this.search = null;
    this.index = 0;
    this.StockAdjustmentFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.StockAdjustmentFormGroup,
      'stockAdjustmentVoucherLocationId',
      this.locationLocked
    );
    // this.f.stockTransferVoucherNo.clearValidators();
    this.updateTableConfiguration();
    this.StockAdjustmentFormGroup.updateValueAndValidity();
  }

  LOCKlOCATION: boolean = false;
  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );

      if (DEFAULT_LOCATION != null) {
        this.DefLocationCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocationCheck !== null) {
          const splitText = this.DefLocationCheck.split('::');
          this.DefLocation = splitText[1]?.trim();
          var userLocation = list?.filter(
            (a) => a.generalSettingsKeyValue == 'USER_LOCK_LOCATION'
          );
          if (!this.locationLocked) {
            this.LOCKlOCATION = userLocation[0]?.generalSettingsBoolValue;
            this.f.stockAdjustmentVoucherLocationId.setValue(
              Number(this.LOCKlOCATION ? this.user.locationId : this.DefLocation)
            );
          }
          // this.f.stockAdjustmentGroupId.setValue(
          //   this.ItemMasterGroupList[0].value
          // );

          // this.GetStockByLocation();
        }
      }
    });
  }

  showMaximizableDialog() {
    this.getAllStockAdjustment();
    this.displayMaximizable = true;
  }

  updateFormGrid(StockAdju: StockAdjustment) {
    this.search = null;
    this.StockAdjustmentFormGroup.patchValue({
      stockAdjustmentVoucherSaId: StockAdju.stockAdjustmentVoucherSaId,
      stockAdjustmentVoucherSaNo: StockAdju.stockAdjustmentVoucherSaNo,
      stockAdjustmentVoucherSaDate: new Date(
        StockAdju.stockAdjustmentVoucherSaDate
      ),
      stockAdjustmentVoucherSAAsOnDate: new Date(
        StockAdju.stockAdjustmentVoucherSAAsOnDate
      ),

      stockAdjustmentVoucherSaRemarks:
        StockAdju.stockAdjustmentVoucherSaRemarks,
      stockAdjustmentVoucherFsno: StockAdju.stockAdjustmentVoucherFsno,
      stockAdjustmentVoucherStVno: StockAdju.stockAdjustmentVoucherStVno,
      stockAdjustmentVoucherLocationId:
        StockAdju.stockAdjustmentVoucherLocationId,
      stockAdjustmentVoucherDelStatus:
        StockAdju.stockAdjustmentVoucherDelStatus,
      stockAdjustmentVoucherTotAmount: StockAdju.stockAdjusmentVoucherTotAmount,
      stockAdjustmentVoucherTotQty: StockAdju.stockAdjusmentVoucherTotQty,
    });

    const gridData: any = StockAdju.stockAdjustmentVoucherDetails.map((k) => {
      const item = this.itemList?.find(
        (l) => l.itemMasterItemId == k?.stockAdjustmentVoucherDetailsMaterialId
      );
      const ItemId = item?.itemMasterItemName;

      const jobId = this.jobArray?.find(
        (j) => j.jobMasterJobId == k.stockAdjustmentVoucherDetailsJobId
      )?.jobMasterJobName;
      const UnitId =
        this.unitListt?.find(
          (l) =>
            l.unitMasterUnitId == k?.stockAdjustmentVoucherDetailsUnitId ||
            l.value == k?.stockAdjustmentVoucherDetailsUnitId
        )?.unitMasterUnitShortName ||
        this.unitListt?.find(
          (l) =>
            l.unitMasterUnitId == k?.stockAdjustmentVoucherDetailsUnitId ||
            l.value == k?.stockAdjustmentVoucherDetailsUnitId
        )?.label;

      const manualQty = Number(k.stockAdjustmentVoucherDetailsManualQty || 0);
      const adjQty = Number(k?.stockAdjustmentVoucherDetailsAdjQty || 0);
      const rate = Number(k.stockAdjustmentVoucherDetailsCosePrice || 0);

      return {
        stockAdjustmentVoucherDetailsDetId:
          k?.stockAdjustmentVoucherDetailsDetId,
        stockAdjustmentVoucherDetailsSaNo: k?.stockAdjustmentVoucherDetailsSaNo,
        MatId: k?.stockAdjustmentVoucherDetailsMaterialId,
        BaseUnit: UnitId,
        MaterialName: ItemId,
        Adjustment: adjQty,
        Job: jobId,
        Jobid: k.stockAdjustmentVoucherDetailsJobId,
        OrignalStock: manualQty,
        stockAdjustmentVoucherDetailsBatchCode: null,
        stockAdjustmentVoucherDetailsExpDate: null,
        CurrentStock: manualQty + adjQty,
        rate: rate,
        stockAdjustmentVoucherDetailsDelStatus:
          k?.stockAdjustmentVoucherDetailsDelStatus,
        amt: rate * adjQty,
        selectedUnitId: k?.stockAdjustmentVoucherDetailsUnitId,
        groupId: item?.itemMasterAccountNo ?? null,
      };
    });

    this.stockAdjustmententry.data = gridData;
    this.originalData = [...gridData];
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.StockAdjustmentFormGroup.disable();
    this.StockAdjustmentFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  GetSavedStockAdjustmentDetails(id: string) {
    this.index = 0;
    this.stockApi.GetSavedStockAdjustmentDetailsById(id).subscribe(
      (data: any) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.updateFormGrid(data.result);
          this.savedStockAdjustment = data.result;
          this.StockAdjustmentFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Stock Adjustment not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.StockAdjustmentFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.stockApi
          .DeleteStockAdjustmentVoucher(this.savedStockAdjustment)
          .subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Stock Adjustment Deleted Succesfully',
              });
              this.newForm();
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
    this.GetSavedStockAdjustmentDetails(
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentSAId
    );
  }

  edit() {
    this.StockAdjustmentFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.StockAdjustmentFormGroup,
      'stockAdjustmentVoucherLocationId',
      this.locationLocked
    );
    this.stockAdjustmententry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.stockAdjustmentSAId.clearValidators();
    this.updateTableConfiguration();
    this.StockAdjustmentFormGroup.updateValueAndValidity();
  }

  public get IsValidGrid(): boolean {
    if (this.stockAdjustmententry.data.length > 0) {
      return Object.values(this.stockAdjustmententry.data).some(
        (k: any) => k.MatId != null
      );
    }
    return false;
  }

  applyUnitConversion(row: number, unitItem: any) {
    if (!unitItem) return;
    const hot = this.hotRegisterer.getInstance(this.hotid);
    if (!hot) return;

    const rowSource: any = hot.getSourceDataAtRow(row);
    const rowData = hot.getDataAtRow(row);
    if (!rowData || !rowSource) return;

    const unitName = (
      unitItem?.unitMasterUnitShortName ||
      unitItem?.UnitMasterUnitShortName ||
      unitItem?.unitMasterUnitFullName ||
      ''
    ).trim();

    const newConvType = Number(
      unitItem?.unitDetailsConversionType ||
      unitItem?.UnitDetailsConversionType ||
      1
    );
    const newConversion = newConvType > 0 ? newConvType : 1;

    // Previous conversion factor from rowSource or found in this.unitArray
    let prevConversion = Number(rowSource.currentConversion);
    if (!prevConversion || prevConversion <= 0) {
      const prevUnitName = (rowData[3] || '').toString().trim().toLowerCase();
      const prevUnit = this.unitArray?.find(
        (u: any) =>
          (u.unitMasterUnitShortName || u.UnitMasterUnitShortName)?.trim().toLowerCase() === prevUnitName ||
          (u.unitMasterUnitFullName || u.UnitMasterUnitFullName)?.trim().toLowerCase() === prevUnitName ||
          (u.unitMasterUnitId || u.UnitMasterUnitId)?.toString() === (rowSource.selectedUnitId || '').toString()
      );
      prevConversion = Number((prevUnit as any)?.unitDetailsConversionType || (prevUnit as any)?.UnitDetailsConversionType || 1) || 1;
    }

    const ratio = prevConversion / newConversion;

    // Current values from row
    const currentOrig = parseFloat(rowData[5]) || 0;
    const currentStock = parseFloat(rowData[6]) || 0;
    const currentAdj = parseFloat(rowData[7]) || 0;
    const currentRate = parseFloat(rowData[8]) || 0;

    // Calculate new Original Stock based on conversion ratio
    const newOriginalStock = parseFloat((currentOrig * ratio).toFixed(4));

    // Calculate new rate
    let newRate = Number(unitItem?.unitDetailsRate || unitItem?.UnitDetailsRate || 0);
    if (!newRate || newRate <= 0) {
      newRate = parseFloat((currentRate / ratio).toFixed(4));
    }

    // Handle CurrentStock and Adjustment recalculation:
    // If user has physical count (currentStock != 0): scale currentStock by ratio, recalculate adjustment
    // If user has total loss count (currentStock == 0 && currentAdj != 0): currentStock remains 0, scale adjustment by ratio
    // If user has not entered physical count yet (currentStock == 0 && currentAdj == 0): remain 0 / 0
    let newCurrentStock = 0;
    let newAdjustment = 0;
    let newAmt = 0;

    if (currentStock !== 0) {
      newCurrentStock = parseFloat((currentStock * ratio).toFixed(4));
      newAdjustment = parseFloat((newCurrentStock - newOriginalStock).toFixed(4));
      newAmt = parseFloat((newAdjustment * newRate).toFixed(2));
    } else if (currentAdj !== 0) {
      newCurrentStock = 0;
      newAdjustment = parseFloat((currentAdj * ratio).toFixed(4));
      newAmt = parseFloat((newAdjustment * newRate).toFixed(2));
    }

    rowSource.currentConversion = newConversion;
    rowSource.conversionType = newConversion;
    rowSource.selectedUnitId = unitItem?.unitMasterUnitId || unitItem?.UnitMasterUnitId;
    rowSource.BaseUnit = unitName;
    rowSource.OrignalStock = newOriginalStock;
    rowSource.rate = newRate;
    rowSource.CurrentStock = newCurrentStock;
    rowSource.Adjustment = newAdjustment;
    rowSource.amt = newAmt;

    // Update matching row in originalData
    if (this.originalData) {
      const origItem = this.originalData.find((d: any) => d.MatId === rowSource.MatId);
      if (origItem) {
        origItem.BaseUnit = unitName;
        origItem.OrignalStock = newOriginalStock;
        origItem.rate = newRate;
        origItem.CurrentStock = newCurrentStock;
        origItem.Adjustment = newAdjustment;
        origItem.amt = newAmt;
        origItem.currentConversion = newConversion;
        origItem.conversionType = newConversion;
        origItem.selectedUnitId = rowSource.selectedUnitId;
      }
    }

    const cellsToUpdate: [number, number, any][] = [
      [row, 3, unitName],
      [row, 5, newOriginalStock],
      [row, 6, newCurrentStock],
      [row, 7, newAdjustment],
      [row, 8, newRate],
      [row, 9, newAmt],
    ];

    hot.setDataAtCell(cellsToUpdate, 'unitChange');
    this.ColumnSum();
  }

  selectUnit(item: any) {
    this.applyUnitConversion(this.currentIndex, item);
    this.showUnitList = false;
  }

  private updateCurrentStockByUnit(
    row: number,
    itemId: number,
    unitId: number,
    selectedUnitName: string
  ) {
    const locationId = Number(
      this.StockAdjustmentFormGroup.get('stockAdjustmentVoucherLocationId')
        ?.value
    );
    const hot = this.hotRegisterer.getInstance(this.hotid);

    if (!itemId || !unitId || !locationId || locationId < 0) {
      hot.setDataAtCell(row, 6, 0);
      return;
    }

    this.masterapi.getItemStockByUnit(itemId, unitId, locationId).subscribe(
      (response) => {
        const currentRow = hot.getDataAtRow(row);
        if (
          currentRow?.[0] == itemId &&
          currentRow?.[3] == selectedUnitName
        ) {
          hot.setDataAtCell(
            row,
            6,
            response?.isSuccess === true ? response.data : 0
          );
        }
      },
      () => {
        const currentRow = hot.getDataAtRow(row);
        if (
          currentRow?.[0] == itemId &&
          currentRow?.[3] == selectedUnitName
        ) {
          hot.setDataAtCell(row, 6, 0);
        }
      }
    );
  }

  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(evt.cell.row, evt.cell.column, null);
    }
    this.showUnitList = false;
  }

  exit(evt) {
    this.showUnitList = false;
  }

  hide(evt: boolean) {
    this.showUnitList = false;
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

  userTrackingLog(type) {
    let req = {
      page: 'StockAdjustment',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.StockAdjustmentFormGroup.get('stockAdjustmentVoucherNo').value,
      vpType: 'StockAdjustment',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
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

  rate?: any;
  amt?: any;
  Jobid?: any;

  MatId?: any;
  PartNo?: any;
  MaterialName?: any;
  brand?: any;
  BaseUnit?: any;
  packing?: any;
  origin?: any;
  Job?: any;
  baseunit?: any;
  origstock?: any;
  CurrentStock?: any;
  Adjustment?: any;

  id?: any;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  list?: boolean;
}
export const stockAdjustmentColumnList = (
  component: StockAdjustmentComponent
) => [
    {
      data: 'MatId',
      type: 'text',
      label: 'Mat Id',
      toolTip: 'Material ID',
      width: 50,
      readOnly: true,
    },
    {
      data: 'PartNo',
      type: 'text',
      label: 'Part No',
      toolTip: 'Part Number',
      width: 80,
    },
    {
      data: 'MaterialName',
      type: 'text',
      label: 'Material Name',
      toolTip: 'Material Name',
      width: 150,
      readOnly: true,
    },
    {
      data: 'BaseUnit',
      type: 'autocomplete',
      label: 'Base Unit',
      toolTip: 'Base Unit of Material',
      source: component.unitArry,
      width: 80,
    },
    {
      data: 'Job',
      type: 'dropdown',
      label: 'Job Name',
      toolTip: 'Related Job Name',
      source: component.jobArry,
      width: 100,
    },
    {
      data: 'OrignalStock',
      type: 'numeric',
      label: 'Original Stock',
      toolTip: 'Original Stock Quantity',
      readOnly: true,
      width: 90,
      numericFormat: {
        pattern: '0,0.00',
      },
    },
    {
      data: 'CurrentStock',
      type: 'numeric',
      label: 'Current Stock',
      toolTip: 'Current Stock Quantity',
      width: 90,
      numericFormat: {
        pattern: '0,0.00',
      },
      readOnly: false,
    },
    {
      data: 'Adjustment',
      type: 'numeric',
      label: 'Adjustment',
      toolTip: 'Stock Adjustment Quantity',
      width: 90,
      numericFormat: {
        pattern: '0,0.00',
      },
    },
    {
      data: 'rate',
      type: 'numeric',
      label: 'Rate',
      toolTip: 'Item Rate',
      width: 80,
      numericFormat: {
        pattern: '0,0.00',
      },
      readOnly: false,
    },
    {
      data: 'amt',
      type: 'numeric',
      label: 'Amount',
      toolTip: 'Calculated Amount',
      readOnly: true,
      width: 90,
      numericFormat: {
        pattern: '0,0.00',
      },
    },
    {
      data: 'Jobid',
      type: 'numeric',
      label: 'Job Id',
      toolTip: 'Job Identifier',
      readOnly: true,
      width: 60,
    },
  ];
