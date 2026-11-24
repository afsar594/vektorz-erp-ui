import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  ConfirmationService,
  DialogService,
  MessageService,
  SelectItem,
} from 'primeng';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { manufactureListDetails } from 'src/app/routes/domain/Store/manufactureListDetails';
import { manufactureList } from 'src/app/routes/domain/Store/ManufactureList';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-manufacture-list',
  templateUrl: './manufacture-list.component.html',
  styleUrls: ['./manufacture-list.component.scss'],
})
export class ManufactureListComponent implements OnInit {
  title: string;
  subtitle: string;
  activeRow: { row: number; column: number };
  dataList: any = [];
  dataset: any;
  btnFlag: any;
  confirmDropDatabaseDialogVisible = false;

  selectItem: any;
  lookupGridColumns = [];
  showSalesLookUp: boolean = false;
  index: number = 0;
  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  licensekey: any;
  currentRow: number = 0;
  gridHeader: string;
  cols: any;
  search: string = null;
  menufacture: any;
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  displayMaximizable: boolean = false;
  menufacturlistGroup: FormGroup;
  hotid = 'menufactur';
  private hotRegisterer = new HotTableRegisterer();
  menufactur_entry: Handsontable.GridSettings;
  ScreenId: number;
  Permission: any;
  units: UnitMaster[];
  ItemMasterArrayByName: any;
  menufactureArray: any;
  user: any;
  initializeControls() {
    this.menufactur_entry = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [70, 70, 70, 70, 70, 70, 100, 70, 70, 100, 70],
      minRows: 12,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
     hiddenColumns: {
    columns: [5], // Hide id
    indicators: false
      },  
       minSpareRows: 1,
      allowInsertRow: true,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
      
        {
          data: 'itemId',
          type: 'numeric',
        },
        // {
        //   data: 'code',
        //   type: 'numeric'
        // },
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
          data: 'remarks',
          type: 'text',
        },
           {
          data: 'id',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Item Id'),
        // this.translate.instant('Code'),
        this.translate.instant('Description'),
        this.translate.instant('Quantity'),
        this.translate.instant('Unit'),
        this.translate.instant('Remarks'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    this.menufactur_entry.afterSelection = (
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
      if (column === 0 && this.menufactur_entry.readOnly === false) {
        this.lookupGridColumns = ['Item', 'Item ID'];
        this.dataList = this.itemLookup;
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.menufactur_entry.readOnly === false) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.getUnitByItemId(data[0]);
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      }
    };
    this.Units();
    this.getAllItemMaster();
  }
  get itemLookup() {
    return this.ItemMasterList.map((kl) => ({
      sales: kl.label,
      salesId: kl.value,
    }));
  }
  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      sales: kl.unitMasterUnitShortName,
      salesId: kl.unitMasterUnitId,
    }));
  }
  constructor(
    private router: Router,
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private permission: PermissionsService,
    private masterapi: MasterApiService,
    private messageService: MessageService,
    public dialogService: DialogService,
    private confirmation: ConfirmationService,
    private stockApi: StockApiService,
    private utilityService: UtilityService
  ) {}

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
    this.menufacturlistGroup = new FormGroup({
      menufacturlistNo: new FormControl(''),
      item: new FormControl('', Validators.required),
      mI_Id_N: new FormControl(null),
      remarks: new FormControl('', Validators.required),
    });
    this.menufacturlistGroup.disable();
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.cols = [
      { field: 'ManufactureList', header: 'MI_Id' },
      { field: 'ManufactureList', header: 'Ref#' },
      { field: 'ManufactureList', header: 'Item Id' },
      { field: 'ManufactureList', header: 'Item Name' },
      {
        field: 'ManufactureList',
        header: 'Remarks',
      },

      { field: 'ManufactureList', header: 'View' },
    ];
    this.initializeControls();
  }
  get f() {
    return this.menufacturlistGroup.controls;
  }

  savemanufacture() {
    const savedData: any = this.menufactur_entry.data;
    const manufactureList: manufactureList = this.menufacturlistGroup
      .value as manufactureList;
    (manufactureList.mI_Id_N = this.menufacturlistGroup.getRawValue().mI_Id_N
      ? this.menufacturlistGroup.getRawValue().mI_Id_N
      : 0),
      (manufactureList.mI_VocherNo = this.menufacturlistGroup.getRawValue()
        .menufacturlistNo
        ? this.menufacturlistGroup.getRawValue().menufacturlistNo
        : null),
      (manufactureList.mI_RF_V = ''),
      (manufactureList.mI_Item_ID =
        this.menufacturlistGroup.getRawValue().item),
      (manufactureList.mI_Remarks_V =
        this.menufacturlistGroup.getRawValue().remarks),
      (manufactureList.manufactureItemsMasterStatus = true),
      (manufactureList.manufactureItemsMasterDeleted = false),
      (manufactureList.manufactureItemsMasterDetails = savedData
        ?.filter((k) => k.itemId != null)
        .map((k: any) => {
          const unitid = this.units?.find((l) => {
            return l.unitMasterUnitShortName?.trim() === k.unit?.trim();
          });
          return {
            mI_Details_VocherNo: '',
            miD_Id_N: k.id? Number(k.id):0,
            mI_Id_N: 0,
            miD_ItemId_N: k.itemId,
            miD_Description_V: k.des,
            miD_UnitId_N: unitid?.unitMasterUnitId,
            miD_QTY_N: k.quantity,
            miD_Price_N: 0,
            miD_DelQty_N: 0,
            miD_Amt_N: 0,
            miD_Remarks_V: k.remarks,
          };
        }));
    if (this.btnFlag.update) {
      // deletedGridData = this.savedDeliveryNote.customerDeliveryNoteDetails?.filter((k) => {
      //   if (!(deliveryNote.customerDeliveryNoteDetails
      //     .some(l => l.customerDeliveryNoteDetailsDetId === k.customerDeliveryNoteDetailsDeliveryDetailId))) {
      //     k.customerDeliveryNoteDetailsDelStatus = true;
      //     return k;
      //  }
      //});
      // if (deletedGridData.length > 0) {
      // deliveryNote.customerDeliveryNoteDetails.push(...deletedGridData);
      // }
    }
    if (this.btnFlag.save) {
      this.save(manufactureList);
    } else {
      this.update(manufactureList);
    }
  }
  public get IsValidGrid(): boolean {
    if (this.menufactur_entry.data.length > 0) {
      return Object.values(this.menufactur_entry.data).some(
        (k: any) => k.itemId != null && k.unit != null
      );
    }

    return false;
  }
  save(manufactureList: any) {
    if (this.menufacturlistGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.stockApi.Insertmenufacture(manufactureList).subscribe(
            (data: any) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.menufacture = data.result;
              this.updateFormGrid(data.result);
              this.userTrackingLog('Insert');
              this.menufacturlistGroup.disable();
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
                detail: 'Manufacture (Component List) Save Failed',
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
      this.menufacturlistGroup.markAllAsTouched();
      this.menufacturlistGroup.markAsDirty();
    }
  }

  update(manufactureList: any) {
    if (this.menufacturlistGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.stockApi.Updatemenufacture(manufactureList).subscribe(
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
              this.menufacturlistGroup.disable();
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Manufacture (Component List) Updated Succesfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Manufacture (Component List) Update Failed',
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
      this.menufacturlistGroup.markAllAsTouched();
      this.menufacturlistGroup.markAsDirty();
    }
  }
  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.userTrackingLog('Delete');
        this.stockApi.Deletemenufacture(this.menufacture.mI_VocherNo).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Manufacture (Component List) Deleted Succesfully',
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

  GetSavedmenufactureDetails(id) {
    this.index = 0;
    this.stockApi.GetSavedmenufacture(id).subscribe(
      (data: any) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.updateFormGrid(data);
          this.menufacture = data;
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
        this.menufacturlistGroup.updateValueAndValidity();
      }
    );
  }
  async updateFormGrid(manufactureList: any) {
    this.search = null;

    this.menufacturlistGroup.patchValue({
      menufacturlistNo: manufactureList.mI_VocherNo,
      item: manufactureList?.mI_Item_ID,
      mI_Id_N: manufactureList?.mI_Id_N,
      remarks: manufactureList?.mI_Remarks_V,
    });

    const gridData = manufactureList.manufactureItemsMasterDetails.map((k) => {
      const unitid = this.units?.find((l) => {
        return l.unitMasterUnitId === k.miD_UnitId_N;
      });
      return {
         id:k.miD_Id_N,
        itemId: k.miD_ItemId_N,
        des: k.miD_Description_V,
        unit: unitid?.unitMasterUnitShortName,
        quantity: k.miD_QTY_N,
        miD_Price_N: 0,
        miD_DelQty_N: 0,
        miD_Amt_N: 0,
        remarks: k.miD_Remarks_V,
      };
    });

    this.menufactur_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.menufacturlistGroup.disable();
    // this.f.customerDeliveryNoteDeliveryId.clearValidators();
    this.menufacturlistGroup.updateValueAndValidity();
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    // this.f.customerDeliveryNoteDeliveryId.clearValidators();
    this.menufacturlistGroup.enable();
    this.menufacturlistGroup.controls.menufacturlistNo.disable();
    this.menufacturlistGroup.updateValueAndValidity();
  }
  new() {
    this.menufacturlistGroup.reset();
    this.menufactur_entry.data = [];
    this.menufactur_entry.readOnly = false;

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.menufactur_entry);

    this.search = null;
    this.index = 0;
    this.menufacturlistGroup.enable();
    this.menufacturlistGroup.updateValueAndValidity();
  }
  getAllmanufacture() {
    this.stockApi.GetAllmenufacture().subscribe((data: any) => {
      this.menufactureArray = data.result;
    });
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
  exit(evt) {
    this.showSalesLookUp = false;
  }
  clear(evt) {
    this.showSalesLookUp = false;
  }
  hide(evt) {
    this.showSalesLookUp = false;
  }
  selectedItem(evt) {
    let trimmedSales = evt.sales;
    const includesPcs = this.units.some((unit) =>
      unit.unitMasterUnitFullName.includes(trimmedSales)
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
      this.masterapi.GetAllItemMasterById(evt.salesId).subscribe((k) => {
        this.ItemMasterArrayByName = k.result;
        // this.conversion_Type = this.ItemMasterArrayByName.unitDetails[0].unitDetailsConversionType;

        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        // Setting the 'code' in the table
        hotInstance.setDataAtCell(
          this.activeRow.row,
          0,
          evt.salesId.toString()
        );
        // Setting PartNo
        // hotInstance.setDataAtCell(this.activeRow.row,1,this.ItemMasterArrayByName.itemMasterPartNo);

        // // Setting MaterialName
        hotInstance.setDataAtCell(
          this.activeRow.row,
          1,
          this.ItemMasterArrayByName.itemMasterItemName
        );

        if (
          this.ItemMasterArrayByName.unitDetails &&
          this.ItemMasterArrayByName.unitDetails.length > 0
        ) {
          const unitId =
            this.ItemMasterArrayByName.unitDetails[0].unitDetailsUnitId;
          const UnitId: string = this.units?.find(
            (l) => l.unitMasterUnitId == unitId
          ).unitMasterUnitShortName;
          //  const UnitId = this.unitArray[0]?.unitMasterUnitShortName;
          hotInstance.setDataAtCell(this.activeRow.row, 3, UnitId);
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
  Units() {
    this.masterapi.GetAllUnit().subscribe((k) => {
      this.units = k;
    });
  }
  showMaximizableDialog() {
    this.getAllmanufacture();
    this.displayMaximizable = true;
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  public getItemName(id) {
    return this.ItemMasterList?.find((k) => k.value === id)?.label;
  }
  userTrackingLog(type) {
    let req = {
      page: 'ManufactureList',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.menufacturlistGroup.get('menufacturlistNo').value,
      vpType: 'ManufactureList',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

}
