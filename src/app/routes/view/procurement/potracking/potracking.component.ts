import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { SelectItem } from 'primeng';
import { ItemMaster, SupplierMaster } from 'src/app/routes/domain';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ProcurementService } from 'src/app/routes/service/procurement/procurement.service';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { LocalStorageService } from 'src/app/shared/service/storage.service';

@Component({
  selector: 'app-potracking',
  templateUrl: './potracking.component.html',
  styleUrls: ['./potracking.component.scss'],
})
export class PotrackingComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  locationLocked: boolean = false;

  supplierArray: SupplierMaster[] = [];
  supplierList: SelectItem[];
  supplierArry: string[] = [];
  jobList: Array<any>;
  jobarray: Array<any>;
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  licensekey: any;
  gridHeader: string;
  assetsArray: Array<string>;
  invoiceType: Array<{ value: string }>;
  PTForm: FormGroup;
  index: number = 0;
  hotid = 'PoTracking';
  private hotRegisterer = new HotTableRegisterer();
  PoTracking: Handsontable.GridSettings;
  POType: string = 'GetPurchaseOrderTrackingSummary';

  allowDate: boolean = false;
  poTrackingList: Array<any> = [];
  pOrderList: SelectItem[] = [];
  ScreenId: number;
  Permission: any;
  defaultData: any;
  constructor(
    private activatedroute: ActivatedRoute,
    private masterApi: MasterApiService,
    private procurementApi: ProcurementService,
    private translate: TranslateService,
    private permission: PermissionsService,
  private datePipe: DatePipe,
  private utilityService: UtilityService,
  private storage: LocalStorageService
) {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Purchase Order Tracking') {
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

    this.procurementApi.POTrackingDropdown().subscribe((m) => {
      //item
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: 0 });

      // location
      // this.locationList = m.resultSet.locationMaster?.filter((x) => x.locationMasterLocationStatus != false)
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: 0 });
      const defaultLocationId = this.utilityService.getLockedLocationId();
      if (defaultLocationId) {
        this.PTForm.get('Location').setValue(defaultLocationId);
        this.locationLocked = true;
      }

      //supplier
      this.supplierArray = m.resultSet.suppliersMasterr;
      this.supplierList = m.resultSet.suppliersMaster.map((kl) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.supplierList.unshift({ label: '--Select Supplier--', value: 0 });

      //job
      this.jobarray = m.resultSet.itemMaster;
      this.jobList = m.resultSet.jobMasters.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: 0 });

      //PO
      this.pOrderList = m.resultSet.purchaseOrder.map((k) => ({
        label: k.purchaseOrderNo,
        value: k.purchaseOrderNo,
      }));
      this.pOrderList.unshift({ label: '--Select Po--', value: 0 });
    });
    this.initializeControls();
    this.PTForm = new FormGroup({
      DateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear()))
      ),
      DateTo: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear()))
      ),
      Job: new FormControl(''),
      Supplier: new FormControl(''),
      Item: new FormControl(''),
      Location: new FormControl(''),
      PONumber: new FormControl(''),
      POtype: new FormControl('summary'), // Default value for POtype
      StatusType: new FormControl(''), // Default value for StatusType
      isDate: new FormControl(),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.bykeys();
  }
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail,Hide_CostCenter_Detail')
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        const costCenterSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;
        setTimeout(() => {
          this.updateTableConfiguration();
        }, 1000);
      });
  }
  updateTableConfiguration() {
    this.applyGridConfiguration();
  }

  showView(type) {
    this.POType =
      type == 'summary'
        ? 'GetPurchaseOrderTrackingSummary'
        : 'GetPurchaseOrderTrackingDetails';
    this.initializeControls();
    this.applyTableConfiguration();
  }

  initializeControls() {
    const hiddenColumns = this.getHiddenColumns();
    this.PoTracking = this.utilityService.getTableConfig(
      poTrackingColumnObjList(this),
      hiddenColumns
    );
    this.PoTracking.stretchH = 'none';
  }

  private getHiddenColumns(): number[] {
    const hiddenColumns: number[] = [];
    const columns = poTrackingColumnObjList(this);

    const purchaseOrderIdIndex = columns.findIndex(
      (column) => column.data === 'purchaseorderId'
    );
    if (purchaseOrderIdIndex > -1) {
      hiddenColumns.push(purchaseOrderIdIndex);
    }

    const jobIdIndex = columns.findIndex(
      (column) => column.data === 'job_Master_Job_ID'
    );
    if (jobIdIndex > -1) {
      hiddenColumns.push(jobIdIndex);
    }

    if (this.hideJobDetail) {
      ['job_Master_Job_ID', 'job_Master_Job_number', 'job_Master_Job_Name'].forEach(
        (fieldName) => {
          const columnIndex = columns.findIndex((column) => column.data === fieldName);
          if (columnIndex > -1) {
            hiddenColumns.push(columnIndex);
          }
        }
      );
    }

    return hiddenColumns;
  }

  private applyGridConfiguration() {
    const instance = this.hotRegisterer.getInstance(this.hotid);
    if (instance) {
      instance.updateSettings({
        hiddenColumns: {
          columns: this.getHiddenColumns(),
          indicators: true,
        },
      });
    }
  }

  private applyTableConfiguration() {
    const instance = this.hotRegisterer.getInstance(this.hotid);
    if (instance) {
      instance.updateSettings({
        ...this.PoTracking,
        data: this.poTrackingList,
      });
      instance.render();
    }
  }

  private normalizeTrackingResponse(response: any): Array<any> {
    const rows = Array.isArray(response)
      ? response
      : response?.result ?? response?.resultSet ?? response?.data ?? [];

    return rows.map((row) => this.normalizeTrackingRow(row));
  }

  private normalizeTrackingRow(row: any): any {
    const purchaseOrderDate =
      row?.purchaseorderdate ??
      row?.purchaseOrderDate ??
      row?.purchase_Order_PO_Date ??
      '';

    // vw_POTracking computes OrderedQty = SUM(GRN qty via POD_ID) and PendingQty = Requested - Ordered.
    // Null OrderedQty (no GRN) is normalized to 0 so pending stays correct.
    const requested = row?.requestedQty ?? row?.purchaseOrderDetailsQuantity ?? row?.purchase_Order_Details_Quantity ?? row?.RequestedQty ?? '';
    const ordered = row?.orderedQty ?? row?.deliveredQty ?? row?.OrderedQty ?? row?.purchaseOrderTillNowQTY ?? '';
    const pending = row?.pendingQty ?? row?.balanceQty ?? row?.purchaseOrderDetailsBalQty ?? row?.PendingQty ?? '';
    return {
      purchaseorderId:
        row?.purchaseorderId ?? row?.purchaseOrderId ?? row?.purchase_Order_PO_ID ?? '',
      purchaseorderno:
        row?.purchaseorderno ?? row?.purchaseOrderNo ?? row?.purchase_Order_PO_NO ?? '',
      purchaseorderdate:
        typeof purchaseOrderDate === 'string' && purchaseOrderDate.includes('T')
          ? purchaseOrderDate.split('T')[0]
          : purchaseOrderDate,
      job_Master_Job_ID:
        row?.job_Master_Job_ID ?? row?.jobMasterJobId ?? row?.Job_Master_Job_ID ?? '',
      job_Master_Job_number:
        row?.job_Master_Job_number ?? row?.jobMasterJobNumber ?? row?.Job_Master_Job_Number ?? '',
      job_Master_Job_Name:
        row?.job_Master_Job_Name ?? row?.jobMasterJobName ?? row?.Job_Master_Job_Name ?? '',
      suppliers_Master_Supplier_Name:
        row?.suppliers_Master_Supplier_Name ??
        row?.supplierName ??
        row?.suppliersMasterSupplierName ??
        '',
      purchaseOrderDetailsItemName:
        row?.purchaseOrderDetailsItemName ??
        row?.itemName ??
        row?.purchase_Order_Details_Material_Description ??
        '',
      unit_Master_Unit_Short_Name:
        row?.unit_Master_Unit_Short_Name ?? row?.unitName ?? row?.purchaseOrderDetailsUnitName ?? '',
      requestedQty: requested,
      purchaseOrderDetailsRate:
        row?.purchaseOrderDetailsRate ?? row?.rate ?? row?.purchase_Order_Details_Rate ?? '',
      purchaseOrderDetailsNetAmt:
        row?.purchaseOrderDetailsNetAmt ?? row?.amount ?? row?.purchase_Order_Details_Amount ?? '',
      orderedQty: ordered !== '' && ordered !== null ? ordered : 0,
      pendingQty: pending !== '' && pending !== null ? pending : (requested !== '' ? requested : ''),
      poStatus: row?.poStatus ?? row?.poStatus ?? row?.Deliverystatus ?? row?.status ?? row?.POStatus ?? '',
    };
  }

  getPoTracking() {
    if (
      this.PTForm.controls['PONumber'].value.purchaseOrderNo != null ||
      this.PTForm.controls['PONumber'].value.purchaseOrderNo == ''
    ) {
      var x = this.PTForm.controls['PONumber'].value.purchaseOrderNo;
      this.procurementApi
        .POTrackingBynumber({ purchaseOrderNo: x })
        .subscribe((response: any) => {
          this.poTrackingList = this.normalizeTrackingResponse(response);
          this.dataset = this.poTrackingList;
          console.log('poTrackingList', this.poTrackingList);
          this.hotRegisterer.getInstance(this.hotid).updateSettings({
            data: this.poTrackingList,
          });
        });
    } else {
      this.procurementApi.getPOTracking().subscribe((response: any) => {
        this.poTrackingList = this.normalizeTrackingResponse(response);
        this.dataset = this.poTrackingList;
        this.hotRegisterer.getInstance(this.hotid).updateSettings({
          data: this.poTrackingList,
        });
      });
    }
  }
  getPOTrackingNew() {
    // Normalize dropdown values: some controls hold object {label,value} or entity, others hold primitive.
    const supplierVal: any = this.PTForm.value.Supplier;
    const supplierId = Number(supplierVal?.suppliersMasterSupplierId ?? supplierVal?.value ?? supplierVal) || 0;
    const jobVal: any = this.PTForm.value.Job;
    const jobId = Number(jobVal?.jobMasterJobId ?? jobVal?.value ?? jobVal) || 0;
    const locationVal: any = this.PTForm.value?.Location;
    const locationId = Number(locationVal?.locationMasterLocationId ?? locationVal?.value ?? locationVal) || 0;
    const itemVal: any = this.PTForm.value?.Item;
    const itemId = Number(itemVal?.itemMasterItemId ?? itemVal?.value ?? itemVal) || 0;
    const ponoVal: any = this.PTForm.value.PONumber;
    const pono = ponoVal?.value ?? ponoVal ?? '';
    // hideZeroTransactions true means fully received (Pending 0) rows are hidden - remaining qty only for pending.
    // Backend now honors this for both Detail and Summary (pre-grouping).
    if (this.PTForm.get('isDate').value === true) {
      this.defaultData = {
        fromDate: this.PTForm.value.DateFrom,
        toDate: this.PTForm.value.DateTo,
        format: 'string',
        totalCount: 0,
        query: 'string',
        search: 'string',
        costCenter: 'string',
        hideZeroTransactions: true,
        printGroupWise: 'string',
        financialMindate: 'string',
        supplierId,
        jobId,
        status: this.PTForm.value.StatusType || '',
        locationId,
        itemId,
        pono: pono && pono !== 0 ? pono : '',
        isDateCheck: true,
      };
    } else {
      this.defaultData = {
        fromDate: null,
        toDate: null,
        format: 'string',
        totalCount: 0,
        query: 'string',
        search: 'string',
        costCenter: 'string',
        hideZeroTransactions: true,
        printGroupWise: 'string',
        financialMindate: 'string',
        supplierId,
        jobId,
        status: this.PTForm.value?.StatusType || '',
        locationId,
        itemId,
        pono: pono && pono !== 0 ? pono : '',
        isDateCheck: false,
      };
    }
    this.procurementApi
      .getPOTrackingNew(this.defaultData, this.POType)
      .subscribe((response: any) => {
        this.poTrackingList = this.normalizeTrackingResponse(response);
        this.dataset = this.poTrackingList;
        this.hotRegisterer.getInstance(this.hotid).updateSettings({
          data: this.poTrackingList,
        });
      });
  }
  // Afsar 3/8/2024 end
  poNumbers: any = [];
  // getAllPONumber() {
  //   this.procurementApi.getAllPONumber().subscribe((response: any) => {
  //     this.poNumbers = response;
  //     console.table(response);
  //   });
  // }

  getAllPONumber() {
    this.procurementApi.GetPurchaseOrder().subscribe((data) => {
      this.pOrderList = data.result.map((k) => ({
        label: k.purchaseOrderNo,
        value: k.purchaseOrderNo,
      }));
    });
  }
  handleChange(e) {
    this.index = e.index;
  }

  get f() {
    return this.PTForm.controls;
  }

  dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      td.innerText = formattedDate ? formattedDate : '';
    } else {
      td.innerText = '';
    }
  }
}
const poTrackingSummaryColumnObjList = () => [
  {
    data: 'purchaseorderId',
    type: 'text',
    label: 'purchaseorderId',
    toolTip: 'purchaseorderId',
  },
  {
    data: 'purchaseorderno',
    type: 'text',
    label: 'PurchaseOrderNo',
    toolTip: 'PurchaseOrderNo',
    width: 140,
  },
  {
    data: 'purchaseorderdate',
    type: 'date',
    label: 'PurchaseDate',
    toolTip: 'PurchaseDate',
    width: 120,
  },
  {
    data: 'job_Master_Job_ID',
    type: 'text',
    label: 'JobMasterJobID',
    toolTip: 'JobMasterJobID',
  },
  {
    data: 'job_Master_Job_number',
    type: 'text',
    label: 'JobMasterJobNumber',
    toolTip: 'JobMasterJobNumber',
    width: 140,
  },
  {
    data: 'job_Master_Job_Name',
    type: 'text',
    label: 'JobMasterJobName',
    toolTip: 'JobMasterJobName',
    width: 280,
  },
  {
    data: 'suppliers_Master_Supplier_Name',
    type: 'text',
    label: 'SuppliersMasterSupplierName',
    toolTip: 'SuppliersMasterSupplierName',
    width: 260,
  },
  {
    data: 'requestedQty',
    type: 'numeric',
    label: 'RequestedQty',
    toolTip: 'RequestedQty',
    width: 110,
  },
  {
    data: 'orderedQty',
    type: 'numeric',
    label: 'OrderedQty',
    toolTip: 'OrderedQty - SUM GRN qty via POD_ID',
    width: 110,
  },
  {
    data: 'pendingQty',
    type: 'numeric',
    label: 'PendingQty',
    toolTip: 'PendingQty = Requested - Ordered',
    width: 110,
  },
  {
    data: 'poStatus',
    type: 'text',
    label: 'POStatus',
    toolTip: 'POStatus',
    width: 110,
  },
];

const poTrackingDetailColumnObjList = () => [
  {
    data: 'purchaseorderId',
    type: 'text',
    label: 'purchaseorderId',
    toolTip: 'purchaseorderId',
  },
  {
    data: 'purchaseorderno',
    type: 'text',
    label: 'PurchaseOrderNo',
    toolTip: 'PurchaseOrderNo',
    width: 140,

  },
  {
    data: 'purchaseorderdate',
    type: 'date',
    label: 'PurchaseDate',
    toolTip: 'PurchaseDate',
    width: 120,

  },
  {
    data: 'job_Master_Job_ID',
    type: 'text',
    label: 'JobMasterJobID',
    toolTip: 'JobMasterJobID',
  },
  {
    data: 'job_Master_Job_number',
    type: 'text',
    label: 'JobMasterJobNumber',
    toolTip: 'JobMasterJobNumber',
    width: 140,
  },
  {
    data: 'job_Master_Job_Name',
    type: 'text',
    label: 'JobMasterJobName',
    toolTip: 'JobMasterJobName',
    width: 280,
  },
  {
    data: 'suppliers_Master_Supplier_Name',
    type: 'text',
    label: 'SuppliersMasterSupplierName',
    toolTip: 'SuppliersMasterSupplierName',
    width: 260,
  },
  {
    data: 'purchaseOrderDetailsItemName',
    type: 'text',
    label: 'purchaseOrderDetailsItemName',
    toolTip: 'purchaseOrderDetailsItemName',
    width: 320,
  },
  {
    data: 'unit_Master_Unit_Short_Name',
    type: 'text',
    label: 'UnitMasterUnitShortName',
    toolTip: 'UnitMasterUnitShortName',
    width: 90,
  },
  {
    data: 'requestedQty',
    type: 'numeric',
    label: 'RequestedQty',
    toolTip: 'RequestedQty',
    width: 110,
  },
  {
    data: 'purchaseOrderDetailsRate',
    type: 'numeric',
    label: 'PurchaseOrderDetailsRate',
    toolTip: 'PurchaseOrderDetailsRate',
    width: 110,
  },
  {
    data: 'purchaseOrderDetailsNetAmt',
    type: 'numeric',
    label: 'PurchaseOrderDetailsNetAmt',
    toolTip: 'PurchaseOrderDetailsNetAmt',
    width: 130,
  },
  {
    data: 'orderedQty',
    type: 'numeric',
    label: 'OrderedQty',
    toolTip: 'OrderedQty',
    width: 105,
  },
  {
    data: 'pendingQty',
    type: 'numeric',
    label: 'PendingQty',
    toolTip: 'PendingQty',
    width: 105,
  },
];

export const poTrackingColumnObjList = (component: PotrackingComponent) =>
  component.POType === 'GetPurchaseOrderTrackingDetails'
    ? poTrackingDetailColumnObjList()
    : poTrackingSummaryColumnObjList();
