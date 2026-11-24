import { Component, OnInit } from '@angular/core';
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
import {
  ConfirmationService,
  MessageService,
  SelectItem,
  TreeNode,
} from 'primeng/api';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { ItemMaster } from 'src/app/routes/domain/Masters';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { GeneralPurchaseOrder } from 'src/app/routes/domain/Procurements/JeneralPurchaseOrder';
import { GeneralPurchaseOrderDetails } from 'src/app/routes/domain/Procurements/JeneralPurchaseOrderDetails';
import { PurchaseOrder } from 'src/app/routes/domain/Procurements/PurchaseOrder';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { GeneralSettings } from 'src/app/routes/domain/Settings/general';
import { ProcurementApiService } from 'src/app/routes/service/Procurement.api.services';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { PreviousRouteService } from 'src/app/routes/service/common/previous-route.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { ImportApiService } from 'src/app/routes/service/import-api.service';

@Component({
  selector: 'app-general-purchase-order',
  templateUrl: './general-purchase-order.component.html',
  styleUrls: ['./general-purchase-order.component.scss'],
})
export class GeneralPurchaseOrderComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  Date: Date;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  GPOForm: FormGroup;
  index: number = 0;
  rptFilter: ReportFilterModel;
  showSalesLookUp: boolean = false;
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  ItemMasterArrayByName: any = null;
  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  locationLocked = false;
  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  currencyList: any;
  currArry: string[] = [];
  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];
  DefCurrency: string;
  DefCurCheck: string;
  DefCurArry: GeneralSettings = null;
  DefCurVariable: string;
  DefLocCheck: string;
  DefLocid: string;
  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  v_OPENCLOSE: SelectItem[];
  Ordertype: SelectItem[];
  purchaseOrderarry: any;
  displayMaximizable: boolean;
  templateTypeData: any[] = [];
  headerTemplateValue: any = 'header';
  displayMaximizabletemplate: boolean = false;
  displayMaximizabletemplateAdd: boolean = false;
  templatList: { label: string; value: string }[];
  template: boolean = false;
  unitAry: any;
  unitListt: any;
  units: any;
  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  Permission: any;
  ScreenId: number;
  btnFlag: ButtonFlag;
  pdfSource: string;
  savedPurchaseOrder: PurchaseOrder;
  selectItem: {};
  showProcurementsLookUp: boolean;
  activeRow: { row: any; column: any };
  dataList: any;
  templateType: any = 'header';
  lookupGridColumns: string[];
  PNo: any;
  width = `40%`;
  user: any;
  JOBCOST: Boolean = false;
  Generalpurchaseorder_entryDataset = [];

  VatCalculation: Boolean = false;
  brandArry: VendorMaster[] = [];
  pagedRequest: PagedRequest;
  vNo: any = '';
  handleChange(e) {
    this.index = e.index;
    if (e.index == 1 && this.btnFlag.edit) {
      const gpoId = this.GPOForm.get('GeneralPurchaseOrderId')?.value;
      this.fetchDocumentTree(gpoId);
    }
  }

  hotid = 'PurchaseOrder';
  private hotRegisterer = new HotTableRegisterer();
  GeneralPurchaseOrder_entry: Handsontable.GridSettings;
  isServerSearch = false;
  hideJobDetail: boolean = false;
  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail,Hide_CostCenter_Detail')
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
    const hiddenColumns = [9];
    if (this.hideJobDetail) {
      hiddenColumns.push(8);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }
  initializeControls() {
    this.cols = [
      { field: 'generalPurchaseOrderPono', header: 'Voucher No' },
      { field: 'generalPurchaseOrderPoDate', header: 'Date' },
      // { field: 'generalPurchaseOrderNetAmount', header: 'Total Amount' },
      { field: 'Supplier', header: 'Supplier' },
      { field: 'job', header: 'Job' },
      { field: 'generalPurchaseOrderDescription', header: 'Narration' },
      // { field: 'purchaseOrderTotalGrossAmount', header: 'Gross.Amt' },
      // { field: 'purchaseOrderTotalDisAmount', header: 'Disc.Amt' },
      // { field: 'purchaseOrderVatAmt', header: 'Vat.Amt' },
      // { field: 'purchaseOrderVatRoundSign', header: 'Round.Sign' },
      // { field: 'purchaseOrderVatRountAmt', header: 'Round.Amt' },
      { field: 'View', header: 'View' },
    ];
    if (this.vNo) {
      this.callDropdowns();
    } else {
      this.LoadLocationDDL();
    }

    const hiddenColumns = [8, 9]; // Hide code, partNo, amt, job, id, and placeholders
    this.GeneralPurchaseOrder_entry = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns
    );

    this.GeneralPurchaseOrder_entry.afterChange = (changes, source) => {
      if (changes != null) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(changes[0][0]);
        changes?.forEach(([row, prop, oldValue, newValue]) => {
          if (prop == 'qty' || prop == 'rate') {
            if (changes != null) {
              var qty = data[4];
              var price = data[5];
              var grossAmnt = qty * price;
              this.hotRegisterer
                .getInstance(this.hotid)
                .setDataAtCell(changes[0][0], 6, grossAmnt);
              // this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: this.proformaInvoiceGridData, });
              // if (this.ProformaInvoiceEntry.data && this.ProformaInvoiceEntry.data.length > 0) {
              //   var findIndex = this.GridDataList?.findIndex(o => o.itemname == data[2])
              //   if (findIndex >= 0) {
              //     this.GridDataList[findIndex].amount = grossAmnt
              //     this.GridDataList[findIndex].qty = qty
              //   }
              //   else {
              //     this.GridDataList.push({
              //       code: data[0],
              //       partNo: data[1],
              //       itemname: data[2],
              //       unit: data[3],
              //       qty: qty,
              //       rate: price,
              //       amount: grossAmnt,
              //     })
              //   }
              // }
            }
            // this.ProformaInvoiceEntry.data.map(row => [...row]);
          }
        });
      }
      this.ColumnSum();
    };

    this.GeneralPurchaseOrder_entry.afterSelection = (
      row,
      column,
      row2,
      col2
    ) => {
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);

      if (column === 0 && this.GeneralPurchaseOrder_entry.readOnly === false) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item', 'ItemID'];
        this.dataList = this.itemIDSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.onSearch('');
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 3 &&
        this.GeneralPurchaseOrder_entry.readOnly === false
      ) {
        this.isServerSearch = false;
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.getUnitByItemId(data[0]);
        this.lookupGridColumns = ['Unit ID', 'Unit'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else {
        //this.showProcurementsLookUp = false;
        this.activeRow = { row, column };
      }
      if (column === 8) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.sales == x);
      } else {
        this.selectItem = {};
      }
    };
    this.GeneralPurchaseOrder_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      this.showProcurementsLookUp = false;

      if (change[0][1] === 0) {
        this.showProcurementsLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };
    this.GeneralPurchaseOrder_entry.afterValidate = (
      isValid,
      value,
      row,
      prop
    ) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  navigateBack(): void {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  ColumnSum() {
    var valueg = 0;
    this.GeneralPurchaseOrder_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.amt) {
        valueg += elemt.amt;
      }
    });
    valueg = parseFloat(valueg.toFixed(2));
    this.GPOForm.controls.GeneralpurchaseOrderTotalGrossAmount.setValue(valueg);

    this.GetTotal();
  }
  CalcDiscFromPer() {
    this.GPOForm.controls.GeneralpurchaseOrderTotalDisAmount.setValue(
      parseFloat(
        (
          (Number(this.GPOForm.value.GeneralpurchaseOrderTotalGrossAmount) *
            Number(this.GPOForm.value.GeneralpurchaseOrderTotalDisPer)) /
          100
        ).toFixed(2)
      )
    );
    this.GetTotal();
  }
  CalcDiscFromAmt() {
    this.GPOForm.controls.GeneralpurchaseOrderTotalDisPer.setValue(
      parseFloat(
        (
          (Number(this.GPOForm.value.GeneralpurchaseOrderTotalDisAmount) *
            100) /
          Number(this.GPOForm.value.GeneralpurchaseOrderTotalGrossAmount)
        ).toFixed(2)
      )
    );
    this.GetTotal();
  }
  GetTotal($event = null) {
    const formValues = this.GPOForm.value;

    const totalGrossAmount =
      Number(formValues.GeneralpurchaseOrderTotalGrossAmount) || 0;
    const totalActualAmount = totalGrossAmount;

    this.GPOForm.controls.GeneralpurchaseOrderTotalActualAmount.setValue(
      Number(totalActualAmount).toFixed(2)
    );

    const vatPercentage = Number(formValues.GeneralpurchaseOrderVatPer) || 0;
    const vatAmount = (totalActualAmount * vatPercentage) / 100;

    this.GPOForm.controls.GeneralpurchaseOrderVatAmt.setValue(
      vatAmount.toFixed(2)
    );

    // const vatRoundSign = formValues.purchaseOrderVatRoundSign || '-';
    // const vatRoundAmount = Number(formValues.purchaseOrderVatRountAmt) || 0;
    const TotalDisAmount =
      Number(formValues.GeneralpurchaseOrderTotalDisAmount) || 0;

    let netAmount = Number(totalActualAmount - TotalDisAmount + vatAmount);

    this.GPOForm.controls.GeneralpurchaseOrderNetAmount.setValue(
      parseFloat(Number(netAmount).toFixed(2))
    );
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private masterapi: MasterApiService,
    private router: Router,
    private api: ImportApiService,
    public crystalReportService: CrystalReportService,
    private procurementapi: ProcurementApiService,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    private previousRouteService: PreviousRouteService,
    private utilityService: UtilityService,
    private sanitizer: DomSanitizer,
    private storage: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.vNo = params['vNo'];
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
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.GPOForm = new FormGroup({
      Date: new FormControl(new Date()),
      Supplier: new FormControl('', Validators.required),
      PONo: new FormControl(''),

      Location: new FormControl('', Validators.required),
      Job: new FormControl(''),
      Currency: new FormControl(''),
      Status: new FormControl(''),
      Narration: new FormControl(''),
      IndentNo: new FormControl(''),
      dDate: new FormControl(new Date()),
      aStatus: new FormControl(''),
      Approvedby: new FormControl(''),
      purchaseOrderHeader: new FormControl({ value: null, disabled: true }),
      purchaseOrderDelivery: new FormControl({ value: null, disabled: true }),
      purchaseOrderNotes: new FormControl({ value: null, disabled: true }),
      purchaseOrderFooter: new FormControl({ value: null, disabled: true }),
      purchaseOrderPaymentTerms: new FormControl({
        value: null,
        disabled: true,
      }),
      purchaseOrderPayment: new FormControl({ value: null, disabled: true }),
      isChecked: new FormControl(),
      GeneralPurchaseOrderId: new FormControl(''),
      GeneralpurchaseOrderTotalGrossAmount: new FormControl({
        value: null,
        disabled: true,
      }),
      GeneralpurchaseOrderTotalActualAmount: new FormControl({
        value: null,
        disabled: true,
      }),
      GeneralpurchaseOrderVatAmt: new FormControl({
        value: null,
        disabled: true,
      }),
      GeneralpurchaseOrderNetAmount: new FormControl({
        value: null,
        disabled: true,
      }),
      GeneralpurchaseOrderTotalDisAmount: new FormControl({
        value: null,
        disabled: true,
      }),
      GeneralpurchaseOrderVatPer: new FormControl({
        value: null,
        disabled: true,
      }),
      GeneralpurchaseOrderTotalDisPer: new FormControl({
        value: null,
        disabled: true,
      }),
      GeneralpurchaseOrderOrdertype: new FormControl({
        value: null,
        disabled: true,
      }),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.FILL_COMBO();
    this.initializeControls();
    this.bykeys();
  }

  get f() {
    return this.GPOForm.controls;
  }
  get jobSetLookup() {
    return this.jobArray.map((kl) => ({
      job: kl.jobMasterJobName,
      jobId: kl.jobMasterJobId,
    }));
  }

  LoadLocationDDL() {
    this.utilityService.LoadDropdownLocationMaster().subscribe((m: any) => {
      const list = m?.resultSet?.locationMaster ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = list.map((ar: any) =>
        ar.locationMasterLocationName?.trim()
      );
      this.locationLocked = this.utilityService.applyLocationLock(
        this.GPOForm,
        'Location'
      );
    });
  }
  LoadCurrencyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((m: any) => {
      this.currencyList = m.resultSet.currencyMasters?.map((kl: any) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = m.resultSet.currencyMasters?.map((ar: any) =>
        ar.currencyMasterCurrencyName?.trim()
      );
    });
  }
  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((m: any) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl: any) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = m.resultSet.jobMasters?.map((ar: any) =>
        ar.jobMasterJobName?.trim()
      );
    });
  }

  getjobnamebyId(id) {
    return this.jobList?.find((res) => res.value == id)?.label;
  }

  showPrint() {
    this.rptFilter = {
      ReportName: 'GeneralPurchaseOrder',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_generalpurchaseorder where general_purchase_order_id =${this.f.GeneralPurchaseOrderId.value}`,
      ],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  LoadSupplierDDL() {
    this.utilityService.LoadDropdownSuppliersMaster().subscribe((m: any) => {
      this.SupplierMasterArray = m.resultSet.suppliersMaster;
      this.SupplierMasterList = m.resultSet.suppliersMaster.map((kl: any) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.SupplierMasterList.unshift({
        label: '--Select Supplier--',
        value: -1,
      });
      this.SupplierMasterArry = m.resultSet.suppliersMaster?.map(
        (ar: any) =>
          ar.suppliersMasterSupplierName?.trim() +
          '|' +
          ar.suppliersMasterSupplierId
      );
    });
  }
  getSupplierMasterbyId(id) {
    return this.SupplierMasterList?.find((res) => res.value == id)?.label;
  }
  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((m: any) => {
      this.unitArray = m.resultSet.unitMasters;
      this.units = m.resultSet.unitMasters;
      this.unitListt = m.resultSet.unitMasters.map((kl: any) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = m.resultSet.unitMasters.map((ar: any) =>
        ar?.unitMasterUnitShortName?.trim()
      );
    });
  }
  GeneralsavePurchaseOrder() {
    const savedData: any = this.GeneralPurchaseOrder_entry.data;

    const purchaseOrder_Save: GeneralPurchaseOrder = this.GPOForm
      .value as GeneralPurchaseOrder;

    purchaseOrder_Save.generalPurchaseOrderPono = this.PNo;
    purchaseOrder_Save.generalPurchaseOrderSupplierId =
      this.GPOForm.value.Supplier;
    purchaseOrder_Save.generalPurchaseOrderPoDate = this.GPOForm.value.Date;
    purchaseOrder_Save.generalPurchaseOrderDescription =
      this.GPOForm.value.Narration;
    purchaseOrder_Save.generalPurchaseOrderStatus = this.GPOForm.value.Status;
    purchaseOrder_Save.generalPurchaseOrderLocationId =
      this.GPOForm.get('Location')?.value;
    purchaseOrder_Save.generalPurchaseOrderCurrencyId =
      this.GPOForm.value.Currency;
    purchaseOrder_Save.generalPurchaseOrderJobId = this.GPOForm.value.Job;
    purchaseOrder_Save.generalPurchaseOrderApproveDate =
      this.GPOForm.value.dDate;
    purchaseOrder_Save.generalPurchaseOrderApproveStatus =
      this.GPOForm.value.aStatus;
    purchaseOrder_Save.generalPurchaseOrderApprovedBy =
      this.GPOForm.value.Approvedby;
    purchaseOrder_Save.generalPurchaseOrderHeader =
      this.GPOForm.value.purchaseOrderHeader;
    purchaseOrder_Save.generalPurchaseOrderFooter =
      this.GPOForm.value.purchaseOrderFooter;
    purchaseOrder_Save.generalPurchaseOrderTerms =
      this.GPOForm.value.purchaseOrderPaymentTerms;
    purchaseOrder_Save.generalPurchaseOrderPaymentTerms =
      this.GPOForm.value.purchaseOrderPayment;
    purchaseOrder_Save.generalPurchaseOrderDelivery =
      this.GPOForm.value.purchaseOrderDelivery;
    purchaseOrder_Save.generalPurchaseOrderIndentNo =
      this.GPOForm.value.IndentNo;
    purchaseOrder_Save.generalPurchaseOrderDelStatus = false;
    purchaseOrder_Save.GeneralPurchaseOrderId = this.GPOForm.value
      .GeneralPurchaseOrderId
      ? this.GPOForm.value.GeneralPurchaseOrderId
      : 0;
    purchaseOrder_Save.generalPurchaseOrderTotalAmount = Number(
      this.GPOForm.value.GeneralpurchaseOrderTotalGrossAmount
    );
    purchaseOrder_Save.generalPurchaseOrderDiscount = Number(
      this.GPOForm.value.GeneralpurchaseOrderTotalDisAmount
    );
    purchaseOrder_Save.generalPurchaseOrderDiscountPercentage = Number(
      this.GPOForm.value.GeneralpurchaseOrderTotalDisPer
    );
    purchaseOrder_Save.vatper = Number(
      this.GPOForm.value.GeneralpurchaseOrderVatPer
    );
    purchaseOrder_Save.vatamt = Number(
      this.GPOForm.value.GeneralpurchaseOrderVatAmt
    );
    purchaseOrder_Save.generalPurchaseOrderNetAmount = Number(
      this.GPOForm.value.GeneralpurchaseOrderNetAmount
    );
    purchaseOrder_Save.GeneralpurchaseOrderOrdertype =
      this.GPOForm.value.GeneralpurchaseOrderOrdertype;
    purchaseOrder_Save.accountsTransactions = [];
    purchaseOrder_Save.GeneralpurchaseOrderDetails = savedData
      ?.filter((k) => k?.itemname != null)
      .map((k: any) => {
        return {
          generalPurchaseOrderDetailsPoid: k.generalPurchaseOrderDetailsPoid
            ? k.generalPurchaseOrderDetailsPoid
            : 0,
          generalPurchaseOrderDetailsSno: null,
          generalPurchaseOrderDetailsDescription: k.itemname,
          generalPurchaseOrderDetailsQuantity: k.qty,
          generalPurchaseOrderDetailsUnitId:
            k.unit != null && k.unit?.trim() !== ''
              ? this.units?.find(
                  (x) => x.unitMasterUnitShortName?.trim() === k.unit?.trim()
                )?.unitMasterUnitId
              : null,
          generalPurchaseOrderDetailsMaterialId: Number(k.code),
          generalPurchaseOrderDetailsIsEdit: false,
          generalPurchaseOrderDetailsRate: k.rate,
          generalPurchaseOrderDetailsPoStatus: '',
          generalPurchaseOrderDetailsPodId: 1,
          generalPurchaseOrderDetailsAmount: k?.amt,
          generalPurchaseOrderDetailsMaterialDescription: k.remarks,

          generalPurchaseOrderDetailsSrdId: 1,
          generalPurchaseOrderDetailsDelStatus: false,
          generalPurchaseOrderId: this.GPOForm.value.GeneralPurchaseOrderId
            ? this.GPOForm.value.GeneralPurchaseOrderId
            : 0, // This might need to be adjusted based on your logic
          generalPurchaseOrderPono: this.PNo,
        };
      });

    if (this.btnFlag.update) {
      this.updateVoucher(purchaseOrder_Save);
    }

    if (this.btnFlag.save) {
      this.saveVoucher(purchaseOrder_Save);
    }
  }

  saveVoucher(purchaseOrder_Save: any) {
    if (this.GPOForm.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.procurementapi
            .InsertGeneralPurchaseOrder(purchaseOrder_Save)
            .subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedPurchaseOrder = data.result;
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
                  detail: 'Payment Voucher Save Failed',
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
      this.GPOForm.markAllAsTouched();
      this.GPOForm.markAsDirty();
    }
  }
  userTrackingLog(type, vno?: any) {
    let req = {
      page: 'gerneral Purchase Orde',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.GPOForm.get('PONo').value,
      vpType: 'gerneral Purchase Order',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  updateVoucher(purchaseOrder_Save: any) {
    if (this.GPOForm.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.procurementapi
            .UpdateGeneralPurchaseOrder(purchaseOrder_Save)
            .subscribe(
              (data) => {
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
                  detail: 'Purchase Voucher Updated Succesfully',
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Purchase Voucher Update Failed',
                });
              }
            );
        },
      });
    } else {
      const msg1 = 'Please fill mandatory fields';
      const msg2 = 'Please fill Empyt Debit account details';
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.GPOForm.markAllAsTouched();
      this.GPOForm.markAsDirty();
    }
  }
  public get IsValidGrid(): boolean {
    if (this.GeneralPurchaseOrder_entry.data.length > 0) {
      return Object.values(this.GeneralPurchaseOrder_entry.data).some(
        (k: any) => k?.itemname != null && k.amt != null && !(k.rate == null)
      );
      // });
    }
    return false;
  }

  Selecttemplate(type) {
    if (type == 'select') {
      this.displayMaximizabletemplate = true;
    } else {
      this.displayMaximizabletemplateAdd = true;
    }
  }
  selectedTemplateValue(Item) {
    if (this.templateType == 'header') {
      this.GPOForm.controls.purchaseOrderHeader.setValue(Item);
    } else if (this.templateType == 'delivery') {
      this.GPOForm.controls.purchaseOrderDelivery.setValue(Item);
    } else if (this.templateType == 'notes') {
      this.GPOForm.controls.purchaseOrderNotes.setValue(Item);
    } else if (this.templateType == 'paymentTrems') {
      this.GPOForm.controls.purchaseOrderPaymentTerms.setValue(Item);
    } else if (this.templateType == 'subject') {
      this.GPOForm.controls.purchaseOrderSubject.setValue(Item);
    } else if (this.templateType == 'content') {
      this.GPOForm.controls.purchaseOrderContent.setValue(Item);
    } else if (this.templateType == 'remarks1') {
      this.GPOForm.controls.purchaseOrderRemarks1.setValue(Item);
    } else if (this.templateType == 'remarks2') {
      this.GPOForm.controls.purchaseOrderRemarks2.setValue(Item);
    } else if (this.templateType == 'remarks3') {
      this.GPOForm.controls.purchaseOrderRemarks3.setValue(Item);
    } else if (this.templateType == 'footer') {
      this.GPOForm.controls.purchaseOrderFooter.setValue(Item);
    }
    this.displayMaximizabletemplateAdd = false;
  }
  onTabChange(event) {
    const type =
      event.index == 0
        ? 'header'
        : event.index == 1
        ? 'delivery'
        : event.index == 2
        ? 'notes'
        : event.index == 3
        ? 'footer'
        : event.index == 4
        ? 'paymentTrems'
        : event.index == 5
        ? 'subject'
        : event.index == 6
        ? 'content'
        : event.index == 7
        ? 'remarks1'
        : event.index == 8
        ? 'remarks2'
        : event.index == 9
        ? 'remarks3'
        : 'header';

    this.headerTemplateValue = type;
    this.templateType = type;
    this.getTemplateBytype(type);
  }

  selectTypeValue() {
    this.displayMaximizabletemplateAdd = false;
  }

  selectedtem(event) {
    this.templateType = event.value;
    this.getTemplateBytype(event.value);
  }

  getTemplateBytype(type) {
    this.masterapi.GetTemplateBytype(type).subscribe((res: any) => {
      this.templateTypeData = res?.result;
    });
  }

  updateFormGrid(purchaseorder_update: any) {
    this.PNo = purchaseorder_update?.generalPurchaseOrderPono;
    this.GPOForm.patchValue({
      PONo: purchaseorder_update?.generalPurchaseOrderPono,
      GeneralPurchaseOrderId: purchaseorder_update?.generalPurchaseOrderId,
      Supplier: purchaseorder_update?.generalPurchaseOrderSupplierId,
      Date: purchaseorder_update?.generalPurchaseOrderPoDate
        ? new Date(purchaseorder_update?.generalPurchaseOrderPoDate)
        : null,
      Narration: purchaseorder_update?.generalPurchaseOrderDescription,
      Status: purchaseorder_update?.generalPurchaseOrderStatus,
      Location: purchaseorder_update?.generalPurchaseOrderLocationId,
      Currency: purchaseorder_update?.generalPurchaseOrderCurrencyId,
      Job: purchaseorder_update?.generalPurchaseOrderJobId,
      dDate: purchaseorder_update?.generalPurchaseOrderApproveDate
        ? new Date(purchaseorder_update?.generalPurchaseOrderApproveDate)
        : null,
      aStatus: purchaseorder_update?.generalPurchaseOrderApproveStatus,
      Approvedby: purchaseorder_update?.generalPurchaseOrderApprovedBy,
      purchaseOrderHeader: purchaseorder_update?.generalPurchaseOrderHeader,
      purchaseOrderFooter: purchaseorder_update?.generalPurchaseOrderFooter,
      purchaseOrderPaymentTerms:
        purchaseorder_update?.generalPurchaseOrderTerms,
      purchaseOrderPayment: '',
      purchaseOrderDelivery: '',
      IndentNo: purchaseorder_update?.generalPurchaseOrderIndentNo,
      generalPurchaseOrderDelStatus:
        purchaseorder_update?.generalPurchaseOrderStatus,
      GeneralpurchaseOrderVatPer: purchaseorder_update?.vatper,
      GeneralpurchaseOrderVatAmt: purchaseorder_update?.vatamt,
    });

    const gridData: any[] =
      purchaseorder_update?.generalPurchaseOrderDetails.map((k) => {
        const ItemId: string =
          k?.generalPurchaseOrderDetailsMaterialId != null
            ? this.ItemMasterList?.find(
                (l) => l.value == k?.generalPurchaseOrderDetailsMaterialId
              )?.label
            : null;
        const UnitId: any =
          k?.generalPurchaseOrderDetailsUnitId != null
            ? this.units?.find(
                (l) =>
                  l.unitMasterUnitId == k?.generalPurchaseOrderDetailsUnitId
              )?.unitMasterUnitShortName
            : null;

        return {
          generalPurchaseOrderDetailsPoid: k.generalPurchaseOrderDetailsPoid,
          code: k?.generalPurchaseOrderDetailsMaterialId,
          itemname: ItemId,
          partNo: 123,
          unit: UnitId,
          qty: k?.generalPurchaseOrderDetailsQuantity,
          rate: k?.generalPurchaseOrderDetailsRate,
          amt: k?.generalPurchaseOrderDetailsAmount,
          id: k?.generalPurchaseOrderId,
          remarks: k?.generalPurchaseOrderDetailsMaterialDescription,
          job:
            k.generalPurchaseOrderDetailsJobID != null
              ? this.jobList?.find(
                  (l) => l.value == k?.generalPurchaseOrderDetailsJobID
                )?.label
              : null,
        };
      });
    this.GeneralPurchaseOrder_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.GPOForm.disable();
  }

  get itemIDSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl.itemMasterItemName,
      procurementsId: kl.itemMasterItemId,
      barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      procurements: kl.unitMasterUnitShortName,
      procurementsId: kl.unitMasterUnitId,
    }));
  }

  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.v_typeList = [
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
    ];
    this.v_RoundoffList = [
      { label: '+', value: '+' },
      { label: '-', value: '-' },
    ];

    this.v_OPENCLOSE = [
      { label: '', value: '' },
      { label: 'OPEN', value: 'OPEN' },
      { label: 'CLOSE', value: 'CLOSE' },
    ];
    this.Ordertype = [
      // { label: '', value: '' },
      { label: 'LOCAL', value: 'LOCAL' },
      { label: 'FOREIGN', value: 'FOREIGN' },
    ];
  }

  new() {
    this.callDropdowns();
    this.GeneralPurchaseOrder_entry.data = [];
    this.GeneralPurchaseOrder_entry.readOnly = false;
    this.GeneralPurchaseOrder_entry.disableVisualSelection = true;
    this.GPOForm.reset();
    this.PNo = null;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.GeneralPurchaseOrder_entry);
    this.GeneralPurchaseOrder_entry.readOnly = false;
    this.GPOForm.enable();
    this.utilityService.reapplyLocationLock(
      this.GPOForm,
      'Location',
      this.locationLocked
    );
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(this.GPOForm, 'Location');
    }
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };

    this.index = 0;
    this.GPOForm.updateValueAndValidity();
    this.f.dDate.setValue(new Date());
    this.f.isChecked.setValue(false);
    this.f.Date.setValue(new Date());

    this.GeneralPurchaseOrder_entry.readOnly = false;
    this.GeneralPurchaseOrder_entry.disableVisualSelection = true;
    this.f.Status.setValue(this.v_OPENCLOSE[1].value);
    this.updateTableConfiguration();
    this.GetDefaultSettings();
  }

  edit() {
    this.GeneralPurchaseOrder_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.GeneralPurchaseOrder_entry);
    this.template = true;
    // this.f.PONo.clearValidators();
    this.GPOForm.enable();
    this.utilityService.reapplyLocationLock(
      this.GPOForm,
      'Location',
      this.locationLocked
    );
    this.GPOForm.controls.PONo.disable();
    this.GPOForm.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m: any) => {
      let list = m.resultSet.generalSettings;
      // currency

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.Currency.setValue(Number(this.DefCurrency));
        }
      }
      //location - now auto-selected from login localStorage
      // var DEFAULT_LOCATION = list?.filter(
      //   (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      // );

      // if (DEFAULT_LOCATION != null) {
      //   this.DefLocCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
      //   if (this.DefLocCheck !== null) {
      //     const splitText = this.DefLocCheck.split('::');
      //     this.DefLocid = splitText[1]?.trim();
      //     this.f.Location.setValue(Number(this.DefLocid));
      //   }
      // }
      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      if (jobcal == true) {
        this.JOBCOST = true;
      }

      var VAT_Calculation = list?.filter(
        (a) => a.generalSettingsKeyValue == 'VAT_Calculation'
      );
      var vatcal1 = VAT_Calculation[0]?.generalSettingsBoolValue;

      this.VatCalculation = vatcal1 == true ? true : false;

      const match = m.resultSet.optionSettings.optionsMasterType.match(/(\d+)/);
      if (match) {
        var value = parseInt(match[0], 10);

        this.GPOForm.get('GeneralpurchaseOrderVatPer').setValue(value);
      }
    });
  }
  showMaximizableDialog() {
    this.displayMaximizable = true;
    this.getAllPurchaseOrder();
  }
  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();

    this.LoadJobDDL();
    this.LoadLocationDDL();
    this.LoadCurrencyDDL();
    this.LoadSupplierDDL();
    this.LoadUnitDDL();
    if (this.vNo) {
      setTimeout(() => {
        this.GetSavedPurchaseOrderDetails(this.vNo);
      }, 2000);
    }
  }

  GetSavedPurchaseOrderDetails(id: string) {
    this.index = 0;
    this.callDropdowns();
    this.procurementapi.GetSavedGeneralPurchaseOrderDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.updateFormGrid(data.result);
          this.savedPurchaseOrder = data.result;
          this.GPOForm.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Purchase Voucher not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.GPOForm.updateValueAndValidity();
      }
    );
  }
  getAllPurchaseOrder() {
    this.procurementapi.GetGeneralPurchaseOrder().subscribe((data) => {
      this.purchaseOrderarry = data.result;
    });
  }
  cancel() {
    this.new();
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.procurementapi
          .DeleteGeneralPurchaseOrder(this.savedPurchaseOrder)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Purchase Voucher Deleted Succesfully',
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

  selectprocurements(evt) {
    let trimmedSales = evt.procurements?.trim();
    const includesPcs = this.units?.some((unit) =>
      unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
    );
    if (evt.job) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 8, evt.job);
    }
    if (includesPcs && this.unitArray.length != 0) {
      const UnitId: any = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.procurementsId
      );
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, UnitId.unitMasterUnitShortName);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 5, UnitId.unitDetailsRate);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(
          this.activeRow.row,
          this.activeRow.column,
          evt.procurementsId
        );
      this.masterapi
        .GetItemMasterById({ id: evt.procurementsId, customerId: 0 })
        .subscribe((k) => {
          this.ItemMasterArrayByName = k.resultSet?.itemMaster;
          const hotInstance = this.hotRegisterer.getInstance(this.hotid);
          hotInstance.setDataAtCell(this.activeRow.row, 0, evt.procurementsId);
          hotInstance.setDataAtCell(
            this.activeRow.row,
            1,
            this.ItemMasterArrayByName.itemMasterPartNo
          );
          hotInstance.setDataAtCell(
            this.activeRow.row,
            2,
            this.ItemMasterArrayByName.itemMasterItemName
          );
          if (this.ItemMasterArrayByName.unitDetails) {
            const unitId =
              this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
            const UnitId: string = this.units?.find(
              (l) => l.unitMasterUnitId == unitId
            ).unitMasterUnitShortName;
            hotInstance.setDataAtCell(this.activeRow.row, 3, UnitId);
            hotInstance.setDataAtCell(
              this.activeRow.row,
              5,
              this.ItemMasterArrayByName.unitDetails?.unitDetailsRate
            );
          }
        });
    }
    this.showProcurementsLookUp = false;
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
      // this.showProcurementsLookUp = false;
    });
  }
  exit(e) {
    this.showProcurementsLookUp = false;
  }
  clear(e) {
    this.showProcurementsLookUp = false;
  }
  hide(evt) {
    this.showProcurementsLookUp = false;
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
      this.dataList = this.itemIDSetLookup;
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

  /********************************************************** */
  fileImportDialogVisibility: boolean = false;
  attachmentsToImport: any[] = [];
  showImportFileDialog() {
    this.fileImportDialogVisibility = true;
    this.fetchFilesToImport();
  }
  documentListToImport: any[] = [];
  selectedDocumentsToTransfer: any[] = [];
  previewUrl: SafeResourceUrl | null = null;
  files: TreeNode[] = [];
  selectedFile: TreeNode | null = null;
  onNodeSelect(event: any): void {
    const fileUrl = event.node.data;
    if (fileUrl && event.node.key !== 0 && event.node.key !== '0') {
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        fileUrl + '#navpanes=0&scrollbar=0'
      );
    }
  }
  fileAttachmentDialogVisibility: boolean = false;
  attachmentsToUploaded: any[] = [];

  showFileAttachmentDialog() {
    this.fileAttachmentDialogVisibility = true;
  }

  downloadAllDocuments() {
    const gpoId = this.GPOForm.get('GeneralPurchaseOrderId')?.value;
    if (!gpoId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail:
          'Please save the general purchase order before downloading documents.',
      });
      return;
    }
    this.api
      .downloadAllFilesAsOnePdf(gpoId, 'GPO', {
        responseType: 'blob',
        observe: 'response' as 'body',
      })
      .subscribe((response: any) => {
        const blob = new Blob([response.body], { type: response.body.type });

        // Extract filename from content-disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = this.GPOForm.get('PONo')?.value;

        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
            contentDisposition
          );
          if (matches && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
  fetchFilesToImport(): void {
    this.documentListToImport = [];
    this.previewUrl = '';
    const poId = this.savedPurchaseOrder?.purchaseOrderId;
    const prId =
      this.savedPurchaseOrder?.purchaseOrderDetails?.[0]?.purchaseRequisitionId;
    this.masterapi
      .GetExcludedDocuments(prId, 'PR', poId, 'PO')
      .subscribe((res) => {
        if (res?.valid && res?.result) {
          const baseUrl = environment.apiRootURL?.replace('api', 'pdfs');

          this.documentListToImport = res.result.map((doc: any) => ({
            id: doc.fileId,
            name: doc.fileName,
            url: `${baseUrl}${doc.filePath}`,
          }));
        }
      });
  }
  isChildNode(node: TreeNode): boolean {
    return this.files.some((parent) =>
      parent.children?.some((child) => child === node)
    );
  }

  onDeleteNode(node: TreeNode) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete existing Document?',
      accept: () => {
        const id: number = Number(node.key?.split('-')[1]);
        this.api.DeleteDocument(id).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Deleted Succesfully',
            });
            const gpoId = this.GPOForm.get('GeneralPurchaseOrderId')?.value;
            this.fetchDocumentTree(gpoId);
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: ' Failed',
            });
          }
        );
      },
    });
  }
  fetchDocumentTree(gpoId: any): void {
    this.previewUrl = '';
    this.masterapi.GetDocumentTree(gpoId, 'GPO').subscribe((res) => {
      if (res?.valid && res?.result) {
        this.files = [];
        const ports = environment.apiRootURL?.replace('api', 'pdfs');
        const documentNodes: TreeNode[] = res?.result?.map(
          (doc: any, index: number) => {
            return {
              key: `0-${doc.fileId}`,
              label: doc.fileName,
              data: `${ports}${doc.filePath}`,
              icon: 'pi pi-file-pdf',
            };
          }
        );

        this.files = [
          {
            key: '0',
            label: 'Documents',
            data: 'Documents Folder',
            icon: 'pi pi-fw pi-folder',
            children: documentNodes,
          },
        ];
      }
    });
  }

  customUploadHandler(event: any): void {
    const gpoId = this.GPOForm.get('GeneralPurchaseOrderId')?.value;
    if (!gpoId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing ID',
        detail: 'ID is required.',
      });
      return;
    }

    const formData = new FormData();

    for (const file of event.files) {
      formData.append('files', file); // Matches .NET controller's List<IFormFile> parameter
    }

    this.api.uploadDOCs(formData, gpoId, 'GPO').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Document saved successfully.',
        });
        this.fetchDocumentTree(gpoId);
        this.fileAttachmentDialogVisibility = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'An error occurred while uploading.',
        });
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
}
export const columnDetailList = (component: GeneralPurchaseOrderComponent) => [
  {
    data: 'code',
    type: 'numeric',
    label: 'Code',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'PartNo',
  },
  {
    data: 'itemname',
    type: 'text',
    label: 'Item Name',
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    source: component.unitArry,
    strict: false,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Quantity',
    readOnly: false,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Price',
    readOnly: false,
  },
  {
    data: 'amt',
    type: 'numeric',
    label: 'Amount',
  },
  {
    data: 'remarks',
    type: 'text',
    label: 'Remark',
    readOnly: false,
  },
  {
    data: 'job',
    type: 'dropdown',
    label: 'Job Name',
    source: component.jobArry,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
  },
];
