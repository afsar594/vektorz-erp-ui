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
  MenuItem,
  MessageService,
  SelectItem,
} from 'primeng/api';
import {
  ChartofAccounts,
  DepartmentMaster,
  ItemMaster,
} from 'src/app/routes/domain';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { defaults } from 'src/app/shared/service/settings';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { StockTransfer } from 'src/app/routes/domain/Store/StockTransfer';
import { StockTransferDetails } from 'src/app/routes/domain/Store/StockTransferDetails';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { PurchaseRequisitionStatusComponent } from '../purchase-requisition-status/purchase-requisition-status.component';
import { DialogService } from 'primeng';

@Component({
  selector: 'app-stock-transfer',
  templateUrl: './stock-transfer.component.html',
  styleUrls: ['./stock-transfer.component.scss'],
  providers: [MessageService],
})
export class StockTransferComponent implements OnInit {
  displayPrintPreview: boolean = false;
  currentIndex: number = 0;
  savedstockTransfer: StockTransfer;
  ScreenId: number;
  Permission: {
    Allow: any;
    Add: any;
    Delete: any;
    Edit: any;
    Print: any;
    View: any;
  };
  unitDetailID: any = 0;
  // departmentList: any;
  activeRow: { row: number; column: number };
  ItemMasterArrayByName: any;
  units: any;
  jobs: any;
  unitdata: any[] = [];
  constructor(
    private router: Router,
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private masterApi: MasterApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private masterapi: MasterApiService,
    private permission: PermissionsService,
    public dialogService: DialogService,
    private stockApi: StockApiService
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
  StockTransferGroup: FormGroup;
  stockTransfer?: StockTransfer;
  stockTransferarry: StockTransfer[] = [];

  stockTransfer_Entry: Handsontable.GridSettings;
  title: string;
  selectedCustomer: any;
  customerDesc: boolean;
  voucherNumber: any;
  hotid = 'stockTransfer';

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  JOBCOST: Boolean = false;
  lookupGridColumns = [];
  selestedReq: any = [];
  locationArray: LocationMaster[] = [];
  locationList: SelectItem[] = [];
  locationArry: string[] = [];
  departmentList: Array<DepartmentMaster>;
  departmentArray: DepartmentMaster[] = [];
  departmentLists: SelectItem[] = [];
  departmentArry: string[] = [];
  dataList: Array<any> = [];

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
  jobListcols: Array<any> = [];
  stockTransferListcols: Array<any> = [];
  stockTransferList: Array<StockTransfer> = [];
  showStockTransferList: boolean = false;
  showEditListing: boolean = false;
  showItemList: boolean = false;
  showJobList: boolean = false;
  showUnitList: boolean = false;
  hotRegisterer: HotTableRegisterer = new HotTableRegisterer();
  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  unitListcols: Array<any> = [];
  stockEditListcols: Array<any> = [];
  selectedUnit: UnitMaster;
  selectedItem: any;
  user: any;
  updatedQuantity: number = 0;
  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;

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

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };

    this.StockTransferGroup = new FormGroup({
      // stockTransferNo: new FormControl({ value: '', disabled: true }),
      stockTransferStDate: new FormControl(new Date()),
      stockTransferCustomer: new FormControl({ value: '', disabled: true }),
      stockTransferJobId: new FormControl({ value: '', disabled: true }),
      stockTransferLocationIdFrom: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      stockTransferLocationIdTo: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      stockTransferUserId: new FormControl({ value: '', disabled: true }),
      stockTransferApprovedBy: new FormControl({ value: '', disabled: true }),
      stockTransferNarration: new FormControl({ value: '', disabled: true }),
      stockTransferVoucherNo: new FormControl({ value: '', disabled: true }),
      stockTransferId: new FormControl(null),
      stockTransferCustomerId: new FormControl(null),
      stockTransferDepId: new FormControl(null),
      total: new FormControl(null),
    });
    this.customerDesc = true;
    this.cols = [
      { field: 'Id', header: 'Id' },
      { field: 'customerName', header: 'Name' },
    ];
    this.itemListcols = [
      { field: 'itemMasterItemId', header: 'Bar Code' },
      { field: 'itemMasterItemName', header: 'Item Name' },
      // { field: "stock", header: "Stock" },
    ];
    this.unitListcols = [
      { field: 'unitMasterUnitId', header: 'Unit Code' },
      { field: 'unitMasterUnitFullName', header: 'Unit Name' },
    ];
    this.stockEditListcols = [
      { field: 'stockTransferId', header: 'ID' },
      { field: 'stockTransferVoucherNo', header: 'Voucher No' },
      { field: 'stockTransferStDate', header: 'Date' },
      { field: 'stockTransferLocationIdFrom', header: 'Location From' },
      { field: 'stockTransferLocationIdTo', header: 'Location To' },
      { field: 'stockTransferUserId', header: 'User' },
      { field: '', header: 'Actions' },
    ];
    this.stockTransferListcols = [
      { field: 'stockTransferId', header: 'ID' },
      { field: 'stockTransferVoucherNo', header: 'Voucher No' },
      { field: 'stockTransferStDate', header: 'Date' },
      { field: 'stockTransferLocationIdFrom', header: 'Location From' },
      { field: 'stockTransferLocationIdTo', header: 'Location To' },
      { field: 'stockTransferUserId', header: 'User' },
    ];
    this.initializeControls();
  }

  selectCustomer(customer: any) {
    this.selectedCustomer = customer;
    this.StockTransferGroup.controls['stockTransferCustomer'].setValue(
      customer.customerMasterCustomerName
    );
    this.StockTransferGroup.controls['stockTransferCustomerId'].setValue(
      customer.customerMasterCustomerNo
    );
    this.showCustomerList = false;
    this.customerDesc = false;
  }

  initializeControls() {
    this.stockApi.getStockTransferDropdown().subscribe((m) => {
      //unit
      this.unitArray = m.resultSet.unitMasters;
      this.units = m.resultSet.unitMasters;
      this.unitList = m.resultSet.unitMasters?.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitList.unshift({ label: '--Select Unit--', value: -1 });
      //item
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.itemList = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl?.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      //customer
      this.customerList = m.resultSet.customerMasters;
      //job
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobArry = m.resultSet.jobMasters?.map((ar) =>
        ar.jobMasterJobName?.trim()
      );
      //location
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationArry = m.resultSet.locationMaster?.map(
        (ar) => ar.locationMasterLocationName
      );
      //department
      this.departmentArray = m.resultSet.departmentMasters;
      this.departmentLists = m.resultSet.departmentMasters?.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentId,
      }));
      this.departmentLists.unshift({
        label: '--Select department--',
        value: -1,
      });
    });
    this.stockTransfer_Entry = {
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
      enterMoves: { row: 0, col: 1 },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,

      afterOnCellMouseDown: (event, coords, TD) => {
        if (coords.col === 0) {
          this.showItemList = true;
        } else if (coords.col === 3) {
          this.unitList = [];
          const hotinstance = this.hotRegisterer.getInstance(this.hotid);
          var data = hotinstance.getDataAtRow(coords.row);
          this.masterapi.GetUnitDetails(data[0]).subscribe((res) => {
            this.units = res.result;
            this.unitList = res.result?.map((kl) => ({
              label: kl?.unitMasterUnitShortName,
              value: kl.unitMasterUnitId,
            }));
            this.showUnitList = true;
          });
        } else if (coords.col === 8) {
          this.jobList = [];
          const hotinstance = this.hotRegisterer.getInstance(this.hotid);
          var data = hotinstance.getDataAtRow(coords.row);

          this.masterapi.GetJobMaster().subscribe((k) => {
            this.jobs = k.result;
            this.jobList = k.result.map((kl) => ({
              label: kl.jobMasterJobName,
              value: kl.jobMasterJobId,
            }));
            this.showJobList = true;
          });
        }
      },

      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      hiddenColumns: {
        columns: [9, 10, 11, 8, 12, 13],
        indicators: false,
      },
      columns: [
        {
          data: 'code',
          type: 'numeric',
          readOnly: true,
        },
        {
          data: 'partNo',
          type: 'text',
          readOnly: true,
        },
        {
          data: 'materialName',
          type: 'text',
          readOnly: true,
        },
        {
          data: 'unit',
          type: 'text',
          readOnly: true,
        },
        {
          data: 'quantity',
          type: 'numeric',
          // readOnly: true,
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'costPrice',
          type: 'numeric',
          // readOnly: true,
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'amount',
          type: 'numeric',
          readOnly: true,
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'remarks',
          type: 'text',
          // readOnly: true
        },
        {
          data: 'jobname',
          type: 'text',
          width: 50,
        },
        {
          data: 'avgPrice',
          type: 'numeric',
          readOnly: true,
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'unitId',
          type: 'numeric',
          readOnly: true,
        },
        {
          data: 'JobID',
          type: 'numeric',
          readOnly: true,
        },
        {
          data: 'availableQTY',
          type: 'numeric',
          readOnly: true,
        },
        {
          data: 'purchaseRequisitionId',
          type: 'numeric',
          readOnly: true,
        },
      ],
      colHeaders: [
        this.translate.instant('Code'),
        this.translate.instant('Part No'),
        this.translate.instant('Material Name'),
        this.translate.instant('Unit'),
        this.translate.instant('Quantity'),
        this.translate.instant('Cost Price'),
        this.translate.instant('Amount'),
        this.translate.instant('Remarks'),
        this.translate.instant('Job Name'),
        this.translate.instant('avgPrice'),
        this.translate.instant('unitId'),
        this.translate.instant('jobId'),
        this.translate.instant('availableQTY'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.stockTransfer_Entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };

    this.stockTransfer_Entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      this.currentIndex = row;
      this.activeRow = { row, column };
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
    };

    this.stockTransfer_Entry.beforeChangeRender = (
      change: Handsontable.CellChange[]
    ) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      var data = hotinstance.getDataAtRow(change[0][0]);

      if (change != null) {
        if (data[4] != null && data[5] != null && change[0][1] != 'amount') {
          // if (data[4] < data[12]) {
          //   this.messageService.add({
          //     severity: 'error',
          //     summary: 'Alert',
          //     detail: `Qunatity must be less than StockQTY(${data[12]})`,
          //   });
          //   this.hotRegisterer
          //     .getInstance(this.hotid)
          //     .setDataAtCell(change[0][0], 4, 0);
          // } else {
          var totalSum = data[4] * data[5];
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 6, totalSum);
          // }
          this.columnSum();
        }
        this.columnSum();
      }
    };
  }

  columnSum() {
    let Total = 0;
    this.stockTransfer_Entry.data.forEach((element: any) => {
      if (element) {
        if (element.amount) {
          Total += element.amount;
        }
      }
    });

    this.StockTransferGroup.controls.total.setValue(Total.toFixed(2));
  }

  get jobSetLookup() {
    return this.jobList.map((kl) => ({
      job: kl.label,
      jobId: kl.value,
    }));
  }

  getVoucherNumber() {
    this.stockApi.getVoucherNumber().subscribe((response: any) => {
      this.voucherNumber = response; //vouchersNumbersVNoNu
      //console.log(this.voucherNumber);
      this.StockTransferGroup.controls['VoucherNo'].setValue(
        this.voucherNumber[0].vouchersNumbersVNoNu + 1
      );
    });
  }

  getStockItemsList() {
    this.stockApi.getStockItemsList().subscribe((data: any) => {
      this.itemList = data.result;
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  getshowStockTransferList() {
    this.getStockTransferList();
    this.showStockTransferList = true;
  }

  getStockTransferList() {
    this.stockApi.getStockTransferList().subscribe((response: any) => {
      this.stockTransferList = response.result;
      this.btnFlag.cancel = false;
      this.btnFlag.edit = false;
      this.btnFlag.save = false;
    });
  }
  getEmptyRowCount(length): number {
    const DetailsLength = length || 0;
    if (length < 12) {
      return Math.max(0, 12 - DetailsLength);
    } else {
      return;
    }
  }

  GetSavedStockTransferDetails(id) {
    this.showStockTransferList = false;
    this.stockApi.GetStockTransferDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
            new: true,
          };
          this.updateFormGrid(data.result);
          this.savedstockTransfer = data.result;
          this.StockTransferGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Sales Voucher not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed'),
        });
        this.StockTransferGroup.updateValueAndValidity();
      }
    );
  }

  displayEditListing() {
    this.stockApi.getStockTransferList().subscribe((response: any) => {
      this.stockTransferList = response.result;
      this.showEditListing = true;
      this.stockTransferList.forEach((element) => {
        element.stockTransferStDate = element.stockTransferStDate.split('T')[0];
      });
    });
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false }, true);
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.stockTransfer_Entry);
    this.StockTransferGroup.enable();
    this.StockTransferGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
  }

  deleteStockTransferEntry(item: any) {
    //console.log("voucher", item.stockTransferVoucherNo);
    this.showEditListing = false;

    this.confirmation.confirm({
      key: 'confirm-key',
      message:
        'Do you want to delete the stockTransfer No : ' +
        item.stockTransferVoucherNo +
        ' ?',
      accept: () => {
        this.userTrackingLog('Delete');
        this.stockApi
          .deleteStockTransferEntry(item.stockTransferVoucherNo)
          .subscribe(
            () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Record deleted : ' + item.stock_Transfer_STVNo,
              });
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Operation Failed!',
              });
            }
          );
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Operation Cancelled!',
        });
      },
    });
  }
  beingEdited: any;
  /////done/////
  createNew() {
    this.StockTransferGroup.reset();
    this.stockTransfer_Entry.readOnly = false;
    this.stockTransfer_Entry.data = [];
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.stockTransfer_Entry);
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false }, true);
    this.GetDefaultSettings();
    this.StockTransferGroup.enable();
    this.StockTransferGroup.get('stockTransferStDate').setValue(new Date());

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
  }

  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;
      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      if (jobcal == true) {
        this.JOBCOST = true;
      }
    });
  }

  selectJOb(job) {
    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, 8, job.jobMasterJobName);

    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, 11, job.jobMasterJobId);
    this.showJobList = false;
  }

  selectItem(item) {
    this.masterapi
      .GetItemMasterById({ id: item.itemMasterItemId })
      .subscribe((k) => {
        this.ItemMasterArrayByName = k.resultSet?.itemMaster;

        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        hotInstance.setDataAtCell(
          this.activeRow.row,
          2,
          this.ItemMasterArrayByName.itemMasterItemName
        );
        this.unitDetailID =
          this.ItemMasterArrayByName.unitDetails?.unitDetailsId;
        const UnitId: string = this.unitList?.find(
          (l) =>
            l.value == this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId
        )?.label;

        if (this.ItemMasterArrayByName.unitDetails) {
          hotInstance.setDataAtCell(
            this.currentIndex,
            0,
            this.ItemMasterArrayByName.itemMasterItemId
          );
          hotInstance.setDataAtCell(
            this.currentIndex,
            1,
            this.ItemMasterArrayByName.itemMasterPartNo
          );
          hotInstance.setDataAtCell(this.currentIndex, 3, UnitId);
          hotInstance.setDataAtCell(
            this.currentIndex,
            5,
            this.ItemMasterArrayByName.unitDetails?.unitDetailsRate
          );

          this.GetAveragePurchasePriceGPC(
            this.ItemMasterArrayByName.itemMasterItemId,
            0
          );
        }
        hotInstance.setDataAtCell(
          this.currentIndex,
          5,
          this.ItemMasterArrayByName.unitDetails?.unitDetailsRate
        );
      });
    this.showItemList = false;
  }

  selectItem1(item) {
    this.stockApi
      .getStockitembyId(item.itemMasterItemId)
      .subscribe((k: any) => {
        this.ItemMasterArrayByName = k.resultSet;
        const UnitId: string = this.unitList?.find(
          (l) =>
            l.value == this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId
        )?.label;
        const item: any = this.ItemMasterArray?.find(
          (l) =>
            l.itemMasterItemId ==
            this.ItemMasterArrayByName.stockRegisterMaterialID
        );
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);
        hotInstance.setDataAtCell(
          this.activeRow.row,
          2,
          item.itemMasterItemName
        );
        this.unitDetailID =
          this.ItemMasterArrayByName.unitDetails?.unitDetailsId;

        if (this.ItemMasterArrayByName.unitDetails) {
          hotInstance.setDataAtCell(
            this.currentIndex,
            0,
            this.ItemMasterArrayByName.stockRegisterMaterialID
          );
          hotInstance.setDataAtCell(
            this.currentIndex,
            1,
            item.itemMasterPartNo
          );
          hotInstance.setDataAtCell(this.currentIndex, 3, UnitId);
          hotInstance.setDataAtCell(
            this.currentIndex,
            5,
            this.ItemMasterArrayByName.stockRegisterRate
          );
          hotInstance.setDataAtCell(
            this.currentIndex,
            12,
            this.ItemMasterArrayByName.stockRegisterQuantity
          );
          this.GetAveragePurchasePriceGPC(
            this.ItemMasterArrayByName.itemMasterItemId,
            0
          );
        }
        hotInstance.setDataAtCell(
          this.currentIndex,
          5,
          this.ItemMasterArrayByName.stockRegisterRate
        );
      });
    this.showItemList = false;
  }

  selectUnit(item) {
    this.unitDetailID = item?.unitDetailsId;

    const hotInstance = this.hotRegisterer.getInstance(this.hotid);

    hotInstance.setDataAtCell(
      this.activeRow.row,
      3,
      item?.unitMasterUnitShortName
    );
    hotInstance.setDataAtCell(this.activeRow.row, 6, item?.unitDetailsRate);
    hotInstance.setDataAtCell(this.activeRow.row, 18, item?.unitMasterUnitId);

    const data = hotInstance.getDataAtRow(this.activeRow.row);

    this.GetAveragePurchasePriceGPC(data[0], data[4]);
    this.showUnitList = false;
  }

  showAllCustomers() {
    this.masterApi.GetAllCustomer().subscribe((data) => {
      this.customerList = data;
      // console.log("customer",this.customerList)
    });
  }

  showCustomerListt() {
    this.showCustomerList = true;
  }
  stockTransferStDate: any;

  savestockTransfer() {
    if (
      this.StockTransferGroup.controls['stockTransferLocationIdFrom'].value ==
      this.StockTransferGroup.controls['stockTransferLocationIdTo'].value
    ) {
      return this.messageService.add({
        severity: 'error',
        summary: 'Success',
        detail: '"Location From" must be different from "Location TO"',
      });
    }
    const savedData: any = this.stockTransfer_Entry.data?.filter((k) =>
      k?.hasOwnProperty('materialName')
    );
    const stockTransfer: StockTransfer = this.StockTransferGroup
      .value as StockTransfer;

    stockTransfer.stockTransferDetails = savedData
      ?.filter(
        (k) =>
          k.hasOwnProperty('materialName') &&
          k.code !== null &&
          k.quantity !== null &&
          k.costPrice !== null
      )
      .map((k: any) => {
        return {
          stockTransferDetailsMaterialId: k?.code,
          stockTransferDetailsQty: k?.quantity,
          stockTransferDetailsRate: k?.costPrice,
          stockTransferDetailsRemarks: k?.remarks,
          stockTransferDetailsCostPrice: k?.avgPrice,
          stockTransferDetailsStid: k?.stockTransferDetailsStid,
          stockTransferDetailsUnitId:
            this.unitArray?.find(
              (x) =>
                x?.unitMasterUnitShortName?.trim() === (k?.unit?.trim() || '')
            )?.unitMasterUnitId || null,
          stockTransferDetailsJobID:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                  ?.value
              : null,
          purchaseRequisitionId: k?.purchaseRequisitionId,
        };
      });

    if (this.btnFlag.save) {
      this.saveStockTransfer(stockTransfer);
    } else {
      this.updateStockTransfer(stockTransfer);
    }
  }

  saveStockTransfer(stockTransfer: StockTransfer) {
    if (this.StockTransferGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save?',
        accept: () => {
          //console.log(JSON.stringify(stockTransfer));
          this.stockApi.InsertStockTransfer(stockTransfer).subscribe(
            (data) => {
              if (data.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.stockTransfer = data.result;
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Stock Transfer Saved SuccessFully',
                });
                this.updateFormGrid(data.result);
                this.userTrackingLog('Insert');
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
                detail: 'Stock Transfer Save Failed',
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
      this.StockTransferGroup.markAllAsTouched();
      this.StockTransferGroup.markAsDirty();
    }
  }

  public get IsValidGrid(): boolean {
    if (this.stockTransfer_Entry.data.length > 0) {
      return Object.values(this.stockTransfer_Entry.data).some(
        (k: GridData) => k?.materialName != null
      );
    }
    return false;
  }

  updateStockTransfer(stockTransfer: StockTransfer) {
    if (this.StockTransferGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.stockApi.UpdateStockTransfer(stockTransfer).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.updateFormGrid(data.result);
              this.userTrackingLog('Update');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: ' Updated Succesfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Update Failed',
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
      this.StockTransferGroup.markAllAsTouched();
      this.StockTransferGroup.markAsDirty();
    }
  }

  GetAveragePurchasePriceGPC(id, qty) {
    var unitDetailId = this.unitDetailID;
    let req = {
      itemId: id ? id : 0,
      unitDetailId: unitDetailId ? unitDetailId : 0,
      quantity: qty ? qty : 0,
    };
    this.masterapi.GetAveragePurchasePriceGPC(req).subscribe((res: any) => {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 5, res.result);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 9, res.result);
    });
  }

  updateFormGrid(stockTransfer_update: StockTransfer) {
    const hot = this.hotRegisterer.getInstance(this.hotid);
    this.StockTransferGroup.patchValue({
      stockTransferId: stockTransfer_update?.stockTransferId,
      // stockTransferNo: stockTransfer_update?.stockTransferVoucherNo,
      stockTransferJobId: stockTransfer_update?.stockTransferJobId,
      stockTransferVoucherNo: stockTransfer_update?.stockTransferVoucherNo,
      stockTransferLocationIdFrom:
        stockTransfer_update?.stockTransferLocationIdFrom,
      stockTransferLocationIdTo:
        stockTransfer_update?.stockTransferLocationIdTo,
      stockTransferApprovedBy: stockTransfer_update?.stockTransferApprovedBy,
      stockTransferStDate: new Date(stockTransfer_update?.stockTransferStDate),
      stockTransferNarration: stockTransfer_update?.stockTransferNarration,
      stockTransferCustomerId: stockTransfer_update?.stockTransferCustomerId,
      stockTransferDepId: stockTransfer_update?.stockTransferDepId,
      // stockTransferCustomer: stockTransfer_update && this.customerList,
      stockTransferCustomer: this.customerList?.find(
        (j) =>
          j.customerMasterCustomerNo ===
          stockTransfer_update.stockTransferUserId
      )?.customerMasterCustomerName,
    });

    const gridData: any = stockTransfer_update.stockTransferDetails.map((k) => {
      const ItemId =
        k?.stockTransferDetailsMaterialId != null
          ? this.ItemMasterList?.find(
              (l) => l.value == k?.stockTransferDetailsMaterialId
            )?.label
          : null;
      const UnitId =
        k?.stockTransferDetailsUnitId != null
          ? this.unitList?.find((l) => l.value == k?.stockTransferDetailsUnitId)
              ?.label
          : null;
      const amount = k?.stockTransferDetailsRate * k?.stockTransferDetailsQty; // Calculating amount here
      return {
        materialName: ItemId,
        unit: UnitId,
        id: k?.stockTransferDetailsStid,
        code: k?.stockTransferDetailsMaterialId,
        quantity: k?.stockTransferDetailsQty,
        costPrice: k?.stockTransferDetailsRate,
        avgPrice: k?.stockTransferDetailsCostPrice,
        amount: amount,
        remarks: k?.stockTransferDetailsRemarks,
        job:
          k.stockTransferDetailsJobID != null
            ? this.jobList?.find((l) => l.value == k?.stockTransferDetailsJobID)
                ?.label
            : null,
        purchaseRequisitionId: k?.purchaseRequisitionId,
      };
    });

    this.stockTransfer_Entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.StockTransferGroup.disable();
    // this.f?.stockTransferNo.clearValidators();
    // this.stockTransferFormGroup.updateValueAndValidity();
  }

  cancelAll() {
    this.StockTransferGroup.reset();
    this.btnFlag.cancel = true;
    this.btnFlag.edit = true;
    this.btnFlag.save = true;
    this.StockTransferGroup.controls['VoucherDate'].setValue(
      new Date(new Date().setFullYear(new Date().getFullYear()))
    );
  }
  get f() {
    return this.StockTransferGroup.controls;
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  userTrackingLog(type) {
    let req = {
      page: 'StockTransfer',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.StockTransferGroup.get('stockTransferVoucherNo').value,
      vpType: 'StockTransfer',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  // printAsPDF() {
  //   let html: any = document.getElementById('print');
  //   this.printService.saveAsPDF(html);
  //   this.userTrackingLog('PDF')
  // }
  printAsPDF() {
    const fileName = String(new Date().valueOf());
    var css: string = `
.inputGroup {
      margin: 2px 0;
    }

    .date {
      width: 32%;
    }
    .address{
      padding-top: 10px;
      padding-bottom: 10px;
      padding-left: 20px;
    }
    .w-100 {
      width: 100%;
    }
    .flex {
      display: flex;
      margin-bottom: 5px;
      gap: 4px; /* Adjusted the gap value here */
     }
     h2{
      margin: 0;
     }
     h3{
      margin: 0;
     }
    .contain1{
     width: 25%;
    border-radius: 1px;
    padding-bottom: 0%;
    padding: 8px;
    text-align: end;
    }
      .contain2{
        width: 74%;
        border-radius: 1px;
        padding-bottom: 0%;
      }
     .bank2 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49.5%;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
      padding: 8px;
      box-shadow: 5px 5px rgb(201, 204, 204);
     }
    .w70{
      width: 220px;
    }
    .bank1 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49%;
      margin-bottom: 5px;
      border-radius: 1px;
      padding: 8px;
      margin-top: 5px;
       padding-bottom: 0%;
        box-shadow: 5px 5px rgb(201, 204, 204);
    }
    .p-0 {
      padding: 0;
    }

    .grid {
      max-height: 500px;
      overflow: auto;
    }

    .f-r {
      float: right;
    }

    .min-panel {
      min-height: 106px !important;
    }

    :host ::ng-deep .ui-table .ui-table-thead>tr>th {
      position: -webkit-sticky;
      position: sticky;
      top: -8px;
      box-shadow: 1px 3px 6px 0 rgba(32, 33, 36, 0.10);
    }

    @media screen and (max-width: 64em) {
      :host ::ng-deep .ui-table .ui-table-thead>tr>th {
        top: -8px;
      }
    }

    .ui-dropdown {
      min-width: 50% !important;
    }


    .end {
      text-align: end;
    }
.center {
  text-align: center !important;
}
    .print {
      height: 100vh;
      width: 90%;
      margin: auto !important;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .borderP {
      border: .5px solid rgb(201, 204, 204);
      border-radius: 2px;
      margin-bottom: 10px;
      padding: 20px;
      margin-top: -17px;;
      box-shadow: 5px 5px rgb(201, 204, 204);
    }
    #customers {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 5px;
    }
    #customers td,
    #customers th {
      border: 1px solid #ddd;
      padding: 8px;

    }
    #customers tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    #customers tr:hover {
      background-color: #ddd;
    }
    #customers th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #bcc0bf;
      color: rgb(0, 0, 0);
      text-align: center;
    }
    .SvTotal{
      justify-content: end;
      margin: 5px;
      padding: 5px;
      display: flex;
      background-color: #fff;
      gap: 30px;
      width: 84%;
    }
    .SvTotalC{
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      text-align: start;
      gap: 10px;
    }
      .flexcol{
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
    }
    .signature-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .customer-signature {
        order: 1;
        /* Specifies the order of the flex items */
      }

    .authorized-signature {
        order: 2;
        /* Specifies the order of the flex items */
      }
    .flexrow{
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: start;
    }
    .border{
        border: 1px #b1aeae solid;
        border-radius: 5px ;
        margin-bottom: 5px;
        padding: 15px;
    }
    .rowgap{
        gap: 111px;
    }
    .flexSpaceBetween{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-bottom: 20px;

    }

    @media print {
      thead {display: table-header-group;}
      tfoot {display: table-footer-group;}
      table { page-break-inside:auto ;
        font-size: 11px;}
      tr { page-break-inside:avoid; page-break-after:auto }

      body {margin: 0;}

      // img {
      //     width: 140px;
      //     height: 100px;
      // }
      .rectImg {
height: 140px;
    width: 217px;
}

.squreImg {
  height: 145px;
  width: 145px;
}
      .gaprow{
        gap: 50px;
      }
      .print.page {
        page-break-after: always; /* Force page break after content */
        font-size: 12px;
      }

      @page :last {
        .page-footer {
           position: fixed;
          bottom: 0;
          width: 100%;
        }
      }
.conditions {
  margin-left: 0%;
  margin-top: 10px;
}
  .row {
  display: flex;
  margin-left: 0%;
  gap: 0px;
}
  .col1 {
  border: 1px solid #ccc;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  width: 49.5%;
  padding-left: 10px;
}
  .col2 {
  border: 1px solid #ccc;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  width: 50.5%;
  padding-left: 10px;
}



    }

    `;
    this.printService.PrintPDF('printPDF', css);
    this.userTrackingLog('PDF'); // this.fileSaverService.saveAsPDF(data, 'GRN_Report_' + String(this.dateToday));
  }

  PurchaseRequisitionStatus() {
    const ref = this.dialogService.open(PurchaseRequisitionStatusComponent, {
      header: 'Purchase Requisition Status',
      width: '90%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {
        selectedJob: this.StockTransferGroup.get('stockTransferJobId').value,
        location: this.StockTransferGroup.get('stockTransferLocationIdTo').value
          ? this.StockTransferGroup.get('stockTransferLocationIdTo').value
          : -1,
        selectedReq: this.selestedReq,
      },
      baseZIndex: 1,
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.selestedReq.push(res.selectedCustomers);
        this.selectValue(res.selectedCustomers);
        this.StockTransferGroup.get('stockTransferLocationIdTo').setValue(
          res.location
        );
      }
    });
  }

  public getLocName(unit: number): string {
    return this.locationArray?.find((j) => j.locationMasterLocationId === unit)
      ?.locationMasterLocationName;
  }

  selectValue(evt: any[]) {
    let activeRow = { row: 0, column: 0 };

    evt.forEach((k) => {
      let job = this.jobList?.find((l) => l.value == k?.jobid)?.label;
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      hotInstance.setDataAtCell(activeRow.row, 0, k?.matId);
      hotInstance.setDataAtCell(activeRow.row, 2, k?.item_Name);
      hotInstance.setDataAtCell(activeRow.row, 3, k?.unit);
      hotInstance.setDataAtCell(activeRow.row, 4, k?.balQty);
      hotInstance.setDataAtCell(activeRow.row, 5, k?.rate);
      hotInstance.setDataAtCell(activeRow.row, 13, k?.srid);
      activeRow.row += 1;
    });
    this.columnSum();
  }
  getItemNameById(id) {
    return this.ItemMasterList?.find((res) => res.value == Number(id))?.label;
  }
  getIUnitNameById(id) {
    return this.unitList?.find((res) => res.value == Number(id))?.label;
  }
  getILocationNameById(id) {
    return this.locationList?.find((res) => res.value == Number(id))?.label;
  }
  getTotalAmount(): number {
    return (
      this.savedstockTransfer?.stockTransferDetails?.reduce((sum, item) => {
        return (
          sum +
          (item.stockTransferDetailsRate || 0) *
            (item.stockTransferDetailsQty || 0)
        );
      }, 0) || 0
    );
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
  remarks?: string;
  purchaseRequisitionId?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
