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
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { StockRequisition } from 'src/app/routes/domain/Procurements/StockRequisition';
import { StockRequisitionDetails } from 'src/app/routes/domain/Procurements/StockRequisitionDetails';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-storerequisition',
  templateUrl: './storerequisition.component.html',
  styleUrls: ['./storerequisition.component.scss'],
})
export class StorerequisitionComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  confirmDropDatabaseDialogVisible: boolean = false;
  Date: Date;
  showSalesLookUp: boolean = false;
  JOBCOST: Boolean = false;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  SRForm: FormGroup;
  ItemMasterArrayByName: any = null;
  index: number = 0;
  dataList: Array<any> = [];
  selectItem: any;
  lookupGridColumns = [];
  btnFlag: ButtonFlag;
  funitid: number;
  width = `40%`;
  unitAry: any;
  unitListt: any;
  units: any;
  // btnFlag: ButtonFlag;
  StockRequisitionarry: any;
  displayMaximizable: boolean = false;
  savedStockRequisition: any;
  Permission: any;
  hotid = 'StoreRequisition_datail';
  private hotRegisterer = new HotTableRegisterer();
  StoreRequisition_datail: Handsontable.GridSettings;
  activeRow: { row: number; column: number };
  ScreenId: number;
  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  savedStoreReguisaton: any;
  user: any;
  brandArry: VendorMaster[] = [];
  pagedRequest: PagedRequest;
  isServerSearch = false;

  handleChange(e) {
    this.index = e.index;
  }

  initializeControls() {
    const hiddenColumns = [5, 8, 9, 10];
    this.StoreRequisition_datail = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns
    );

    this.StoreRequisition_datail.afterSelection = (
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
      if (column === 0 && this.StoreRequisition_datail.readOnly === false) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item', 'ItemID'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.onSearch('');
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 3 &&
        this.StoreRequisition_datail.readOnly === false
      ) {
        this.isServerSearch = false;
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
    this.getAllJobs();
    //  this.getAllItemMaster()
    this.getAllUnit();
    this.LoadItemDDL();
    this.bykeys();
  }
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private Procurementapi: ProcurementApiService,
    private masterapi: MasterApiService,
    private permission: PermissionsService,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private utilityService: UtilityService,
    private accountapi: AccountApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();
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
    this.cols = [
      { field: 'stockRequisitionNo', header: 'Requisition No' },
      { field: 'stockRequisitionDate', header: 'Date' },
      { field: 'stockRequisitionJobId', header: 'Job' },
      { field: 'stockRequisitionRemarks', header: 'Remarks' },
      { field: 'stockRequisitionRequestedBy', header: 'Requested By' },
      { field: 'action', header: '' },
    ];
    this.SRForm = new FormGroup({
      Requisitionid: new FormControl(''),
      RequisitionNo: new FormControl(''),
      Date: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      Requestedby: new FormControl(''),
      Job: new FormControl(''),
      Remarks: new FormControl('', Validators.required),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
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
    const hiddenColumns = [5, 9, 10];

    if (this.hideJobDetail) {
      hiddenColumns.push(8);
    }
    // if (this.hideCostCenterDetail) {
    //   hiddenColumns.push(5);
    // }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }

  new() {
    this.SRForm.reset();
    this.SRForm.get('Date').setValue(new Date());
    this.hotRegisterer.getInstance(this.hotid);
    this.StoreRequisition_datail.data = [];
    this.StoreRequisition_datail.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.StoreRequisition_datail);
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
    this.updateTableConfiguration();
    this.GetDefaultSettings();
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
  get f() {
    return this.SRForm.controls;
  }
  showMaximizableDialog() {
    this.getAllPurchaseVoucher();
    this.displayMaximizable = true;
  }
  getAllPurchaseVoucher() {
    this.Procurementapi.GetStockRequisition().subscribe((data: any) => {
      this.StockRequisitionarry = data.result;
    });
  }
  GetSavedStockRequisitionDetails(id: any) {
    this.Procurementapi.GetSavedStockRequisitionDetails(id).subscribe(
      (data: any) => {
        this.savedStockRequisition = data.result;
        this.updateFormGrid(data.result);
        this.btnFlag = {
          edit: true,
          cancel: true,
          save: false,
          update: true,
          delete: true,
          new: true,
        };
      }
    );
  }
  hide(evt: boolean) {
    this.showSalesLookUp = false;
  }
  getAllJobs() {
    this.masterapi.GetAllJobMaster().subscribe((k) => {
      this.jobArray = k.result;
      this.jobList = k.result.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = k.result.map((ar) => ar.jobMasterJobName?.trim());
    });
  }
  getJobNameById(id) {
    let job = this.jobList?.find((res) => res.value == id);
    return job?.label;
  }
  selectprocurements(evt) {
    if (evt.job) {
      // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 13, evt.job);
    } else {
      let trimmedSales = evt.procurements?.trim();
      const includesPcs = this.units?.some((unit) =>
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
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(
            this.activeRow.row,
            17,
            UnitId?.unitDetailsConversionType
          );
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 5, UnitId?.unitDetailsRate);
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
              2,
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
              hotInstance.setDataAtCell(
                this.activeRow.row,
                5,
                this.ItemMasterArrayByName.unitDetails?.unitDetailsRate
              );
              hotInstance.setDataAtCell(
                this.activeRow.row,
                17,
                this.ItemMasterArrayByName.unitDetails
                  ?.unitDetailsConversionType
              );
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

  exit(evt) {
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
  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl.itemMasterItemName,
      procurementsId: kl.itemMasterItemId,
      barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
      // size: kl?.itemMasterItemSize,
      // brand: this.brandArry?.find(
      //   (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
      // )?.vendorMasterVendorName,
    }));
  }
  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      procurements: kl.unitMasterUnitShortName,
      procurementsId: kl.unitMasterUnitId,
    }));
  }
  // getAllItemMaster() {
  //   this.masterapi.GetAllItemNotGroup().subscribe((k) => {
  //     this.ItemMasterArray = k.result;
  //     this.ItemMasterList = k.result.map((kl) => ({
  //       label: kl.itemMasterItemName,
  //       value: kl.itemMasterItemId,
  //     }));
  //     this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
  //     this.ItemMasterArry = k.result.map(
  //       (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
  //     );
  //   });
  // }
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

  saveStoreRequisition() {
    const savedData: any = this.StoreRequisition_datail.data;

    const storeRequisition_Save: StockRequisition = this.SRForm
      .value as StockRequisition;
    storeRequisition_Save.StockRequisitionId = this.SRForm.getRawValue()
      .Requisitionid
      ? this.SRForm.getRawValue().Requisitionid
      : 0;
    storeRequisition_Save.StockRequisitionNo = this.SRForm.value.RequisitionNo
      ? this.SRForm.value.RequisitionNo
      : '';
    storeRequisition_Save.StockRequisitionRequestedBy = Number(
      this.SRForm.getRawValue().Requestedby
    );
    storeRequisition_Save.StockRequisitionDate = this.SRForm.value.Date;
    storeRequisition_Save.StockRequisitionJobId = this.SRForm.value.Job;
    storeRequisition_Save.StockRequisitionRemarks = this.SRForm.value.Remarks;
    storeRequisition_Save.StockRequisitionDetails = savedData
      ?.filter((k) => k.ItemName != null)
      .map((k: any) => {
        let unit = this.units?.find(
          (j) => j.unitMasterUnitShortName?.trim() === k.Unit?.trim()
        ).unitMasterUnitId;
        return {
          StockRequisitionId: storeRequisition_Save.StockRequisitionId, // Parent ID
          // StockRequisitionDetailsNo: k.stockRequisitionDetailsNo || null,
          StockRequisitionDetailsSno: null,
          StockRequisitionDetailsMatId: k.ItemCode || null,
          StockRequisitionDetailsItemName: k.ItemName || null,
          StockRequisitionDetailsUnitId: unit || null,
          StockRequisitionDetailsUnitName: k.Unit || null,
          StockRequisitionDetailsQuantity: k.Quantity || 0,
          StockRequisitionDetailsRemarks: k.Remarks || null,
          StockRequisitionDetailsReqStatus: k.Status || null,
          StockRequisitionDetailsDelStatus:
            k.StockRequisitionDetailsDelStatus || null,
          stockRequisitionDetailsId: k.stockRequisitionDetailsId,
        };
      });

    if (this.btnFlag.save) {
      this.StoreRequisition(storeRequisition_Save);
    } else {
      this.updateStoreRequisition(storeRequisition_Save);
    }
  }

  StoreRequisition(customerPurchase: any) {
    if (this.SRForm.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.Procurementapi.InsertStockRequisition(
            customerPurchase
          ).subscribe(
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
                this.savedStoreReguisaton = data.result;
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
      this.SRForm.markAllAsTouched();
      this.SRForm.markAsDirty();
    }
  }
  updateStoreRequisition(customerPurchase: any) {
    if (this.SRForm.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.Procurementapi.UpdateStockRequisition(
            customerPurchase
          ).subscribe(
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
                this.updateFormGrid(data.result);
                this.savedStoreReguisaton = data.result;
                this.userTrackingLog('Update');
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
      this.SRForm.markAllAsTouched();
      this.SRForm.markAsDirty();
    }
  }
  updateFormGrid(custPurchase: any) {
    this.SRForm.patchValue({
      Requisitionid: custPurchase.stockRequisitionId,
      RequisitionNo:
        custPurchase.stockRequisitionNo != null
          ? custPurchase.stockRequisitionNo
          : 0,
      Requestedby: custPurchase.stockRequisitionRequestedBy,
      customerPurchaseOrderSONo: custPurchase.customerPurchaseOrderVoucherNo,
      Date:
        custPurchase.stockRequisitionDate != null
          ? new Date(custPurchase.stockRequisitionDate)
          : null,
      Job: custPurchase.stockRequisitionJobId,
      Remarks: custPurchase.stockRequisitionRemarks,
    });
    const gridData = custPurchase.stockRequisitionDetails.map((k) => {
      return {
        ItemCode: k.stockRequisitionDetailsMatId,
        partno: k.customerPurchaseOrderDetailsPartNo,
        ItemName: k.stockRequisitionDetailsItemName,
        Unit: k.stockRequisitionDetailsUnitName,
        Quantity: k.stockRequisitionDetailsQuantity,
        amount: k.customerPurchaseOrderDetailsAmount,
        Remarks: k.stockRequisitionDetailsRemarks,
        Status: k.stockRequisitionDetailsReqStatus,
        stockRequisitionDetailsNo: custPurchase.stockRequisitionNo,

        stockRequisitionDetailsId: k.stockRequisitionDetailsId,
      };
    });
    this.StoreRequisition_datail.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.SRForm.disable();
    this.SRForm.updateValueAndValidity();
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.StoreRequisition_datail.readOnly = false;
    this.SRForm.enable();
    this.SRForm.controls.Requisitionid?.disable();
    this.SRForm.updateValueAndValidity();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
    this.updateTableConfiguration();
  }
  public get IsValidGrid(): boolean {
    if (this.StoreRequisition_datail.data.length > 0) {
      return Object.values(this.StoreRequisition_datail.data).some(
        (k: any) => k.ItemCode != null
      );
    }
    return false;
  }
  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.Procurementapi.DeleteStockRequisition(
          this.savedStockRequisition
        ).subscribe(
          (data) => {
            this.userTrackingLog('Delete');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'StockRequisition Deleted Succesfully',
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
  userTrackingLog(type) {
    let req = {
      page: 'StoreRequisition',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.SRForm.get('RequisitionNo').value,
      vpType: 'StoreRequisition',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  onSearch(term: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
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
  LoadItemDDL() {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: '',
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
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
export const columnDetailList = (component: StorerequisitionComponent) => [
  {
    data: 'ItemCode',
    type: 'numeric',
    label: 'Item Code',
  },
  {
    data: 'Part No',
    type: 'numeric',
    label: 'Part No',
  },
  {
    data: 'ItemName',
    type: 'autocomplete',
    label: 'Item Name',
    source: component.ItemMasterArry,
  },
  {
    data: 'Unit',
    type: 'autocomplete',
    label: 'Unit',
    source: component.unitArry,
  },
  {
    data: 'Quantity',
    type: 'numeric',
    label: 'Quantity',
    readOnly: false,
  },
  {
    data: 'Required Date',
    type: 'numeric',
    label: 'Required Date',
  },
  {
    data: 'Remarks',
    type: 'text',
    label: 'Remarks',
    readOnly: false,
  },
  {
    data: 'Status',
    type: 'text',
    label: 'Status',
  },
  {
    data: 'job',
    type: 'dropdown',
    label: 'Job Name',
    source: component.jobArry,
  },
  {
    data: 'stockRequisitionDetailsNo',
    type: 'text',
    label: 'Stock Requisition Details No',
  },
  {
    data: 'stockRequisitionDetailsId',
    type: 'text',
    label: 'Stock Requisition Details Id',
  },
];
