import { Component, ElementRef, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ConfirmationService, MessageService, SelectItem } from 'primeng';
import { ItemMaster } from 'src/app/routes/domain';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { RFQ } from 'src/app/routes/domain/Procurements/RFQ';
import { RfqEntryDetails } from 'src/app/routes/domain/Procurements/RFQDetails';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-rfq',
  templateUrl: './rfq.component.html',
  styleUrls: ['./rfq.component.scss'],
})
export class RfqComponent implements OnInit {
  title: string;
  displayMaximizable: boolean;
  subtitle: string;
  dataset: any;
  index: number = 0;
  RQForm: FormGroup;
  cols;
  licensekey: any;
  gridHeader: string;
  filter: string;
  confirmDropDatabaseDialogVisible: boolean = false;
  search: any;
  RfqList: any;
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  unitAry: any;
  unitListt: any;
  units: any;
  activeRow: { row: number; column: number };
  dataList: Array<any> = [];
  selectItem: any;
  lookupGridColumns = [];
  showSalesLookUp: boolean = false;
  ItemMasterArrayByName: any = null;
  supplierList: Array<any>;

  btnFlag: ButtonFlag;
  funitid: any;
  supplierArray: any;
  savedRfq: any;
  pdfSource: string;
  stationmasterObj: any;
  handleChange(e) {
    this.index = e.index;
  }
  display: boolean = false;

  showDialog() {
    this.display = true;
  }
  hotid = 'RFtab';
  private hotRegisterer = new HotTableRegisterer();
  RFtab: Handsontable.GridSettings;

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private fb: FormBuilder,
    private Procurementapi: ProcurementApiService,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private masterapi: MasterApiService,
    private utilityService: UtilityService,
    private crystalReportService: CrystalReportService,
    private permission: PermissionsService,

  ) {}

  ngOnInit(): void {
   this.stationmasterObj = this.permission.getStation();
    this.RQForm = new FormGroup({
      rfqNo: new FormControl(''),
      rfqEntryID: new FormControl(null),
      rfqDate: new FormControl(new Date()),
      purchaserequisition: new FormControl(''),
      suppliersMasterSupplierId: new FormControl('', Validators.required),
      address: new FormControl(''),
      remarks: new FormControl(''),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.RQForm.disable();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.loadCol();
    this.getAllItemMaster();
    this.getAllUnit();
    this.getAllSuppliers();
  }
  initializeControls() {
    this.RFtab = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 0,
      viewportRowRenderingOffset: 'auto',
      colWidths: [50, 120, 80, 80, 120],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      hiddenColumns: {
        columns: [5],
        indicators: false,
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
          data: 'Description',
          type: 'text',
        },
        {
          data: 'Qty',
          type: 'numeric',
        },
        {
          data: 'Unit',
          type: 'text',
        },
        {
          data: 'Remarks',
          type: 'text',
        },
        {
          data: 'rfqEntryDetailsDetID',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Code'),
        this.translate.instant('Description'),
        this.translate.instant('Qty'),
        this.translate.instant('Unit'),
        this.translate.instant('Remarks'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.RFtab = this.utilityService.getTableConfig(rfqColumnObjList(this), [
      5,
    ]);

    rfqColumnObjList;
    this.RFtab.afterSelection = (
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
      if (column === 0 && this.RFtab.readOnly === false) {
        this.lookupGridColumns = ['Item', 'Item ID'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.RFtab.readOnly === false) {
        this.lookupGridColumns = ['Unit', 'Unit ID'];

        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.masterapi.GetUnitDetails(data[0]).subscribe((res) => {
          this.unitArray = res.result;
          this.dataList = this.unitSetLookup;
          const hot = this.hotRegisterer.getInstance(this.hotid);
          hot.deselectCell();
          this.showSalesLookUp = true;
          this.unitArry = res.result.map((ar) =>
            ar.unitMasterUnitShortName?.trim()
          );
        });
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      }
    };
  }
  get f() {
    return this.RQForm.controls;
  }
  loadCol() {
    this.cols = [
      { field: 'customerSellOrderVoucherNo', header: 'Customer Order No' },
      { field: 'customerSellOrderDate', header: 'Date' },
      { field: 'customerSellOrderCustomerID', header: 'Customer Name' },
      { field: 'customerSellOrderLocationID', header: 'Location' },
      { field: 'customerSellOrderSalesManID', header: 'Sales Man' },
      // { field: 'customerSellOrderCurrencyID', header: 'Currency' },
      // { field: 'customerSellOrderNarration', header: 'Narration' },
      { field: 'action', header: '' },
    ];
  }
  showMaximizableDialog() {
    this.GetAllRFQ();
    this.displayMaximizable = true;
  }
  GetAllRFQ() {
    this.Procurementapi.GetAllRFQ().subscribe((res: any) => {
      this.RfqList = res.result;
    });
  }

  GetSavedStockRequisitionDetails(id: any) {
    this.Procurementapi.GetSavedRfqDetails(id).subscribe((data: any) => {
      this.savedRfq = data;
      this.updateFormGrid(data);
      this.btnFlag = {
        edit: true,
        cancel: true,
        save: false,
        update: true,
        delete: true,
        new: true,
      };
    });
  }

  saveRfq() {
    const savedData: any = this.RFtab.data;
    const rfq_Save: RFQ = this.RQForm.value as RFQ;
    rfq_Save.RFQEntryID = this.RQForm.getRawValue().Requisitionid
      ? this.RQForm.getRawValue().Requisitionid
      : 0;
    rfq_Save.RFQ_EntryvouchaseNo = this.RQForm.value.rfqNo
      ? this.RQForm.value.rfqNo
      : '';
    rfq_Save.RfqEntryRfqDate = this.RQForm.value.rfqDate;
    rfq_Save.RfqEntrySupplierId = this.RQForm.value.suppliersMasterSupplierId;
    rfq_Save.RfqEntrySupplierAddress = this.RQForm.value.address;
    rfq_Save.Remarks = this.RQForm.value.remarks;
    rfq_Save.RfqEntryDetails = savedData
      .filter((k) => k.Code != null)
      .map((k: any) => {
        let unit = this.units?.find(
          (j) => j.unitMasterUnitShortName.trim() === k.Unit.trim()
        ).unitMasterUnitId;
        return {
          RFQEntryDetailsDetID: 0,
          RFQEntryDetailsItemID: k.Code,
          RFQEntryDetailsDescription: k.Description,
          RFQEntryDetailsUnitID: unit,
          RFQEntryDetailsQuantity: k.Qty,
          RFQEntryDetailsPrice: null,
          RFQEntryDetailsDelqty: null,
          RFQEntryDetailsRFQAmt: null,
          RFQEntryDetailsRemarks: k.Remarks,
          RFQEntryDetailsDelStatus: null,
          RFQ_EntryvouchaseNo: k.RFQ_EntryvouchaseNo,
          rfqEntryDetailsDetID: k.rfqEntryDetailsDetID,
        };
      });

    if (this.btnFlag.save) {
      this.StoreRFQ(rfq_Save);
    } else {
      this.updateRFQ(rfq_Save);
    }
  }
  StoreRFQ(rfq: any) {
    if (this.RQForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.Procurementapi.InsertRfq(rfq).subscribe(
            (data: any) => {
              if (data.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.savedRfq = data;
                this.updateFormGrid(data);
                // this.userTrackingLog('Insert');
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
                      data.message != null && data.message.trim() !== ''
                        ? data.message
                        : data.exception,
                  });
                }
              } else {
                const errorMsg =
                  data.errorMessage ||
                  data.message ||
                  data.exception ||
                  'An error occurred';
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('Alert'),
                  detail: errorMsg,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Quotation Save Failed',
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
      this.RQForm.markAllAsTouched();
      this.RQForm.markAsDirty();
    }
  }
  updateRFQ(customerPurchase: any) {
    if (this.RQForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.Procurementapi.UpdateRfq(customerPurchase).subscribe(
            (data: any) => {
              if (data.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.updateFormGrid(data);
                this.savedRfq = data;
                //  this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Customer Quotation Updated Succesfully',
                });
              } else {
                const errorMsg =
                  data.errorMessage ||
                  data.message ||
                  data.exception ||
                  'An error occurred';
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('Alert'),
                  detail: errorMsg,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Quotation Update Failed',
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
      this.RQForm.markAllAsTouched();
      this.RQForm.markAsDirty();
    }
  }
  updateFormGrid(rfq: any) {
    this.RQForm.patchValue({
     rfqEntryID: rfq.rfqEntryID,
      Requisitionid: rfq.rfqEntryID,
      rfqNo: rfq.rfQ_EntryvouchaseNo,
      rfqDate: new Date(rfq.rfqEntryRfqDate),
      suppliersMasterSupplierId: rfq.rfqEntrySupplierId,
      address: rfq.rfqEntrySupplierAddress,
      remarks: rfq.Remarks,
    });
    const gridData = rfq.rfqEntryDetails.map((k) => {
      let unit = this.unitListt?.find(
        (j) => j.value === k.rfqEntryDetailsUnitID
      )?.label;

      return {
        Code: k.rfqEntryDetailsItemID,
        Description: k.rfqEntryDetailsDescription,
        Unit: unit,
        Qty: k.rfqEntryDetailsQuantity,

        Remarks: k.rfqEntryDetailsRemarks,
        RFQEntryDetailsDelStatus: false,
        RFQ_EntryvouchaseNo: k.rfQ_EntryvouchaseNo,
        rfqEntryDetailsDetID: k.rfqEntryDetailsDetID,
      };
    });
    this.RFtab.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.RQForm.disable();
    this.RQForm.updateValueAndValidity();
  }

  new() {
    this.RQForm.reset();
    this.RQForm.enable();
    this.RQForm.controls.rfqNo?.disable();
    this.RQForm.get('rfqDate').setValue(new Date());
    this.hotRegisterer.getInstance(this.hotid);
    this.RFtab.data = [];
    this.RFtab.readOnly = false;
    this.hotRegisterer.getInstance(this.hotid).updateSettings(this.RFtab);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    //  this.GetDefaultSettings();
  }
  getAllItemMaster() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k.result.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
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
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl.itemMasterItemName,
      procurementsId: kl.itemMasterItemId,
    }));
  }
  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      procurements: kl.unitMasterUnitShortName,
      procurementsId: kl.unitMasterUnitId,
    }));
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
    this.showSalesLookUp = false;
  }
  selectprocurements(evt) {
    if (evt.job) {
      // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 13, evt.job);
    } else {
      let trimmedSales = evt.procurements?.trim();
      const includesPcs = this.units.some((unit) =>
        unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
      );
      if (includesPcs && this.unitArray.length != 0) {
        var UnitId: any = this.unitArray?.find(
          (l) => l.unitMasterUnitId == evt.procurementsId
        );
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            3,
            UnitId?.unitMasterUnitShortName
          );
        // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 17, UnitId?.unitDetailsConversionType);
        // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 5, UnitId?.unitDetailsRate );
      } else {
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            this.activeRow.column,
            evt.procurementsId
          );
        this.masterapi
          .GetItemMasterById({ id: evt.procurementsId })
          .subscribe((k) => {
            this.ItemMasterArrayByName = k.resultSet?.itemMaster;
            const hotInstance = this.hotRegisterer.getInstance(this.hotid);
            hotInstance.setDataAtCell(
              this.activeRow.row,
              1,
              this.ItemMasterArrayByName?.itemMasterItemName
            );
            if (this.ItemMasterArrayByName.unitDetails) {
              const unitId =
                this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
              // hotInstance.setDataAtCell( this.activeRow.row, 3, this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType);
              const UnitId: string =
                unitId != null
                  ? this.unitListt?.find((l) => l.value == unitId)?.label
                  : null;
              hotInstance.setDataAtCell(
                this.activeRow.row,
                0,
                this.ItemMasterArrayByName.itemMasterItemId
              );
              hotInstance.setDataAtCell(this.activeRow.row, 3, UnitId);
              // hotInstance.setDataAtCell(this.activeRow.row, 5, this.ItemMasterArrayByName.unitDetails?.unitDetailsRate);
              // hotInstance.setDataAtCell(this.activeRow.row, 17, this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType  );
            }

            this.funitid =
              this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
            // const UnitId: string = this.funitid != null ? this.unitList?.find(l => l.value == this.funitid).label : null;
            const UnitId = this.unitArray[0]?.unitMasterUnitShortName;
            this.hotRegisterer
              .getInstance(this.hotid)
              .setDataAtCell(this.activeRow.row, 3, UnitId);
          });
      }
    }

    this.showSalesLookUp = false;
  }

  getAllSuppliers() {
    this.masterapi.GetAllSupplier().subscribe((response: any) => {
      this.supplierArray = response;

      this.supplierList = response.map((kl) => ({
        label: kl?.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.supplierList.unshift({ label: '--Select--', value: -1 });
      this.supplierArray = response.map((ar) =>
        ar?.suppliersMasterSupplierName?.trim()
      );
    });
  }
  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.RFtab.readOnly = false;
    this.RQForm.enable();
    this.RQForm.controls.rfqNo?.disable();
    this.RQForm.updateValueAndValidity();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
  }
  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.Procurementapi.DeleteRfq(
          this.RQForm.controls.rfqNo.value
        ).subscribe(
          (data) => {
            //  this.userTrackingLog('Delete');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'RFQ Deleted Succesfully',
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

printSimpleReport() {
  const rfqNo = this.RQForm.controls.rfqEntryID.value;

  const rptFilter = {
    ReportName: 'crptRFQ',

    SelectionFormula: `{RFQ_Entry.RFQ_Entry_ID} = ${rfqNo}`,

    Parameters: [
      {
        Key: 'CompanyAddress',
        Value: this.stationmasterObj?.stationMasterAddress,
      },
      {
        Key: 'CompanyName',
        Value: this.stationmasterObj?.stationMasterStationName,
      },
    ],

    Queries: [],

    SP_Queries: [],
  };

  console.log('RFQ Report Payload:', rptFilter);

  this.crystalReportService
    .getReportPrint(rptFilter, false)
    .subscribe({
      next: (response) => {
        const blob = new Blob([response], {
          type: 'application/pdf',
        });

        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource, '_blank');
      },

      error: (error) => {
        console.error('Report generation failed:', error);
      },
    });
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

// Complete column configuration with widths and hidden columns
export const rfqColumnObjList = (compnent: RfqComponent) => [
  {
    data: 'Code',
    type: 'numeric',
    label: 'Code',
    toolTip: 'Item Code',
  },
  {
    data: 'Description',
    type: 'text',
    label: 'Description',
    toolTip: 'Item Description',
  },
  {
    data: 'Qty',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
    readOnly: false,
  },
  {
    data: 'Unit',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit of Measurement',
  },
  {
    data: 'Remarks',
    type: 'text',
    label: 'Remarks',
    toolTip: 'Additional Remarks',
    readOnly: false,
  },
  {
    data: 'rfqEntryDetailsDetID',
    type: 'numeric',
    label: 'Detail ID',
    toolTip: 'RFQ Detail ID',
  },
];
