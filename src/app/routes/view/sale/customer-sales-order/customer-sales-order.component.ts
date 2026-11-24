import { Component, ElementRef, OnInit } from '@angular/core';
import {
  FormGroup,
  AbstractControl,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  SelectItem,
  MenuItem,
  MessageService,
  ConfirmationService,
  DialogService,
} from 'primeng';
import { DepartmentMaster, ItemMaster } from 'src/app/routes/domain';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { CustomerPurchaseOrderDetails } from 'src/app/routes/domain/Sales/CustomerPurchaseOrderDetails';
import { CustomerPurchaseOrder } from 'src/app/routes/domain/Sales/customerpurchaseorder';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { defaults } from 'src/app/shared/service/settings';
import { CustomerQutationDetaisComponent } from '../customer-qutation-detais/customer-qutation-detais.component';
import { ItemModifyComponent } from '../item-modify/item-modify.component';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { ToWords } from 'to-words';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';

@Component({
  selector: 'app-customer-sales-order',
  templateUrl: './customer-sales-order.component.html',
  styleUrls: ['./customer-sales-order.component.scss'],
})
export class CustomerSalesOrderComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;
  customerPurchase: CustomerPurchaseOrder[] = [];
  savedCustomerPurchase: CustomerPurchaseOrder;
  customerSellOrderFormGroup: FormGroup;
  locationLocked = false;
  pagedRequest: PagedRequest;
  title: string;
  CustomerSalesOrder: FormGroup;
  salesOrderList: Array<any> = [];
  Obj: any;
  UpdateItem: any;
  currencyList: SelectItem[];
  currArry: string[] = [];
  isCallDDLs: boolean = false;
  DefCurrency: string;
  DefCurCheck: string;
  displayPrintPreview: boolean = false;
  PIList: any;
  width = `40%`;
  DefLocation: string;
  DefLocationCheck: string;

  breadcumbmodel: MenuItem[];
  licensekey: string;
  btnFlag: ButtonFlag;

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[];
  jobArry: string[] = [];

  customerArray: CustomerMaster[] = [];
  customerArry: string[] = [];
  customerList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];

  stationmasterObj: StationMaster;

  DepartmentMasterArray: DepartmentMaster[] = [];
  departmentList: SelectItem[] = [];
  departmentArry: string[] = [];

  itemArray: ItemMaster[] = [];
  itemArry: string[] = [];
  itemList: SelectItem[];

  unitAry: any;
  unitListt: any;
  units: any;

  unitArray: UnitMaster[] = [];
  unitList: SelectItem[];
  unitArry: string[] = [];

  displayMaximizable: boolean;
  cols: any;
  index: number = 0;
  ScreenId: number;
  lookupGridColumns = [];
  dataList: Array<any> = [];
  showSalesLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;
  elementReference: ElementRef;
  ItemMasterArrayByName: any = null;
  funitid: number;
  conversion_Type: number;
  Permission: any;
  customerPurchaseDetails: Handsontable.GridSettings;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'customerPurchaseDetails';
  user: any;
  JOBCOST: Boolean = false;
  pdfSource: string;
  isServerSearch = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private router: Router,
    private permission: PermissionsService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private masterapi: MasterApiService,
    private salesapi: SalesApiService,
    public dialogService: DialogService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private accountapi: AccountApiService,
    private crystalReportService: CrystalReportService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;

      this.activatedroute.queryParams.subscribe((params) => {
        this.ScreenId = +params['menu'];
        this.stationmasterObj = this.permission.getStation();
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
    });
    this.initializeControls();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
    this.loadForm();
    this.LoadCurrancyDDL();
    this.loadDropDownData();
    this.loadCol();
    this.getReportType();
    this.LoadLocationDDL();
  }
  printbtn: MenuItem[];
  getReportType() {
    this.masterapi.General('SalesOrder').subscribe((res: any) => {
      this.printbtn = res.map((r: any) => ({
        label: r.reportTypeDescription,
        command: () => this.showPrint(r.reportTypeFileName),
      }));
    });
  }

  rptFilter: ReportFilterModel;
  showPrint(type) {
    this.rptFilter = {
      ReportName: type,
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        ` select * from VW_CustomerSalesOrder where CustomerPurchaseOrderId=${
          this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderId
        }`,
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

  loadDropDownData() {
    // this.salesapi.GetSalesDropdown().subscribe((m) => {
    //   //sale man
    //   this.SalesManMasterArray = m.resultSet.saleManList;
    //   this.SalesManMasterList = m.resultSet.saleManList?.map((kl) => ({
    //     label: kl.salesManMasterSalesManName,
    //     value: kl.salesManMasterSalesManId,
    //   }));
    //   this.SalesManMasterList.unshift({ label: '--Select--', value: -1 });
    //   this.SalesManMasterArry = m.resultSet.saleManList?.map((ar) =>
    //     ar.salesManMasterSalesManName?.trim() + '|' + ar.salesManMasterSalesManId);
    //   //job
    //   this.jobArray = m.resultSet.jobMasters;
    //   this.jobList = m.resultSet.jobMasters?.map((kl) => ({
    //     label: kl.jobMasterJobNumber + " -- " +kl.jobMasterJobName ,
    //     value: kl.jobMasterJobId,
    //   }));
    //   this.jobList.unshift({ label: '--Select--', value: -1 });
    //   this.jobArry = m?.resultSet?.jobMasters?.map((ar) => ar.jobMasterJobName?.trim());
    //   //customer
    //   this.customerArray = m.resultSet.customerMasters;
    //   this.customerList = m.resultSet.customerMasters?.map((kl) => ({
    //     label: kl.customerMasterCustomerName,
    //     value: kl.customerMasterCustomerNo,
    //   }));
    //   this.customerList.unshift({ label: '--Select--', value: -1 });
    //   this.customerArry = m.resultSet.customerMasters?.map((ar) => ar.customerMasterCustomerName?.trim());
    //   //currency
    //   this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
    //     label: kl.currencyMasterCurrencyName,
    //     value: kl.currencyMasterCurrencyId,
    //   }));
    //   this.currencyList.unshift({ label: '--Select--', value: -1 });
    //   this.currArry = m.resultSet.currencyMasters.map((ar) => ar.currencyMasterCurrencyName?.trim());
    //   //location
    //   this.locationArray = m.resultSet.locationMaster;
    //   this.locationList = m.resultSet.locationMaster
    //     ?.filter((x) => x.locationMasterLocationStatus != false)
    //     .map((kl) => ({
    //       label: kl.locationMasterLocationName,
    //       value: kl.locationMasterLocationId,
    //     }));
    //   this.locationList.unshift({ label: '--Select--', value: -1 });
    //   this.locationArry = m.resultSet.locationMaster?.map((ar) => ar.locationMasterLocationName?.trim());
    //   //department
    //   this.DepartmentMasterArray = m.resultSet.departmentsList;
    //   this.departmentList = m.resultSet.departmentsList?.map((kl) => ({
    //     label: kl.departmentMasterDepartmentName,
    //     value: kl.departmentMasterDepartmentId,
    //   }));
    //   this.departmentList.unshift({ label: '--Select--', value: -1 });
    //   this.departmentArry = m.resultSet.departmentsList?.map((ar) =>
    //     ar.departmentMasterDepartmentName?.trim());
    //   //item
    //   this.itemArray = m.resultSet.itemMaster;
    //   this.itemList = m.resultSet.itemMaster?.map((kl) => ({
    //     label: kl.itemMasterItemName,
    //     value: kl.itemMasterItemId,
    //   }));
    //   this.itemList.unshift({ label: '--Select--', value: -1 });
    //   this.itemArry = m.resultSet.itemMaster?.map((ar) =>
    //     ar.itemMasterItemName ? ar.itemMasterItemName?.trim() : '');
    //   //units
    //   this.units = m.resultSet.unitMasters;
    //   this.unitListt = m.resultSet.unitMasters?.map((kl) => ({
    //     label: kl?.unitMasterUnitShortName,
    //     value: kl.unitMasterUnitId,
    //   }));
    //   this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
    //   this.unitArry = m.resultSet.unitMasters?.map((ar) => ar?.unitMasterUnitShortName?.trim());
    // });
    //this.getAllSalesManMaster();
    //this.getAllJobs();
    //this.getAllCustomer();
    // this.getAllCurrency();
    // this.getAllLocation();
    // this.getAllDepartment();
    //this.getAllItems();
    // this.getAllStationMaster();
    //this.getAllUnit();
  }
  loadForm() {
    this.customerSellOrderFormGroup = this.fb.group({
      customerPurchaseOrderId: new FormControl(''),
      customerPurchaseOrderVoucherNo: new FormControl(''),
      customerPurchaseOrderSONo: new FormControl(''),
      customerPurchaseOrderDate: new FormControl('', Validators.required),
      customerPurchaseOrderLPONo: new FormControl(''),
      customerPurchaseOrderLPODate: new FormControl('', Validators.required),
      customerPurchaseOrderDelSch: new FormControl(''),
      customerPurchaseOrderLocationId: new FormControl('', Validators.required),
      customerPurchaseOrderDepartmentId: new FormControl(
        ''
        // Validators.required
      ),
      customerPurchaseOrderSalesManId: new FormControl(''),
      customerPurchaseOrderJobId: new FormControl(''),
      customerPurchaseOrderCustomerId: new FormControl('', Validators.required),
      customerPurchaseOrderCurrencyId: new FormControl('', Validators.required),
      customerPurchaseOrderRemarks: new FormControl(''),
      customerPurchaseOrderAmount: new FormControl(''),
      customerPurchaseOrderDiscAmount: new FormControl(''),
      customerPurchaseOrderVatPercentage: new FormControl(''),
      customerPurchaseOrderVatAmount: new FormControl(''),
      customerPurchaseOrderNetAmount: new FormControl(''),
      customerPurchaseOrderQuotationDetailsItemId: new FormControl(''),
    });
    this.customerSellOrderFormGroup.disable();
  }

  loadCol() {
    this.cols = [
      { field: 'customerPurchaseOrderVoucherNo', header: 'Customer Order No' },
      { field: 'customerPurchaseOrderDate', header: 'Date' },
      { field: 'customerPurchaseOrderCustomerId', header: 'Customer Name' },
      { field: 'customerPurchaseOrderLocationId', header: 'Location' },
      { field: 'customerPurchaseOrderSalesManId', header: 'Sales Man' },
      { field: 'customerPurchaseOrderCurrencyId', header: 'Currency' },
      { field: 'customerPurchaseOrderRemarks', header: 'Narration' },
      { field: 'action', header: '' },
    ];
  }
  initializeControls() {
    this.customerPurchaseDetails = this.utilityService.getTableConfig(
      columnDetailList(this),
      [8]
    );

    this.customerPurchaseDetails.afterSelection = (
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

      if (column === 0 && this.customerPurchaseDetails.readOnly === false) {
        // this.lookupGridColumns = ['BarCode', 'Part No', 'Item', 'Item Id'];
        this.isServerSearch = true;
        this.lookupGridColumns = ['Item', 'Item Id'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.onSearch('');
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 2 &&
        this.customerPurchaseDetails.readOnly === false
      ) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.activeRow = { row, column };
        this.EditItem(data[2], data[0]);
      } else if (
        column === 3 &&
        this.customerPurchaseDetails.readOnly === false
      ) {
        this.isServerSearch = false;
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.getUnitByItemId(data[0]);
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      }
      // else if (column === 5) {
      //   this.lookupGridColumns = ['Cost Center', 'Cost Center ID'];
      //   this.dataList = this.costSetLookup;
      //   this.showAccountLookUp = true;
      //   this.activeRow = {row, column};
      // }
      else {
        this.showSalesLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.sales == x);
      } else {
        this.selectItem = {};
      }
      this.ColumnSum();
    };

    this.customerPurchaseDetails.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      var data = hotinstance.getDataAtRow(change[0][0]);
      //console.log(change, '11222', data);
      if (change[0][1] == 'qty') {
        if (this.conversion_Type) {
          var sum = data[4] * data[5] * this.conversion_Type;
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(this.activeRow.row, 6, sum.toFixed(2));
        }
      }
      if (change[0][1] == 'price') {
        if (this.conversion_Type) {
          var sum = data[4] * data[5] * this.conversion_Type;
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(this.activeRow.row, 6, sum.toFixed(2));
        }
      }
      this.ColumnSum();
    };
    this.customerPurchaseDetails.afterValidate = (
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
  ColumnSum() {
    if (this.customerPurchaseDetails.data.length > 0) {
      var netAmt = 0;
      this.customerPurchaseDetails.data.forEach((elemt: any) => {
        if (elemt && elemt.amount) {
          netAmt += elemt.amount;
        }
      });
      netAmt = parseFloat(netAmt.toFixed(2));
      this.customerSellOrderFormGroup.controls.customerPurchaseOrderAmount.setValue(
        netAmt
      );

      const netAmountTotal =
        this.customerSellOrderFormGroup.controls.customerPurchaseOrderAmount
          .value -
        (this.customerSellOrderFormGroup.controls
          .customerPurchaseOrderDiscAmount.value ?? 0);
      let vatAmount = netAmountTotal * 0.05;
      vatAmount = parseFloat(vatAmount.toFixed(2));
      let vatAppliedAmount = netAmountTotal + vatAmount;
      vatAppliedAmount = parseFloat(vatAppliedAmount.toFixed(2));
      this.customerSellOrderFormGroup.controls.customerPurchaseOrderVatPercentage.setValue(
        5
      );
      this.customerSellOrderFormGroup.controls.customerPurchaseOrderVatAmount.setValue(
        vatAmount
      );
      this.customerSellOrderFormGroup.controls.customerPurchaseOrderNetAmount.setValue(
        vatAppliedAmount
      );
    }
  }

  onDiscountChange(discount: any) {
    this.customerSellOrderFormGroup.controls.customerPurchaseOrderDiscAmount.setValue(
      discount
    );

    this.ColumnSum();
  }

  QutationList() {
    const ref = this.dialogService.open(CustomerQutationDetaisComponent, {
      header: 'Customer Quotation Details',
      width: '90%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {
        selectedLocation: this.customerSellOrderFormGroup.get(
          'customerPurchaseOrderLocationId'
        ).value,
        selectedCustomer: this.customerSellOrderFormGroup.get(
          'customerPurchaseOrderCustomerId'
        ).value,
        // locationList: this.locationList,
        // customerList: this.customerList
      },
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.selectValue(res);
      }
    });
  }

  //sale man
  LoadSalesManDDL() {
    this.utilityService.LoadSaleManDropdown().subscribe((m: any) => {
      this.SalesManMasterArray = m.resultSet.saleManList;
      this.SalesManMasterList = m.resultSet.saleManList?.map((kl: any) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.SalesManMasterList.unshift({ label: '--Select--', value: -1 });
      this.SalesManMasterArry = m.resultSet.saleManList?.map(
        (ar) =>
          ar.salesManMasterSalesManName?.trim() +
          '|' +
          ar.salesManMasterSalesManId
      );
    });
  }
  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((m: any) => {
      //job
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl: any) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select--', value: -1 });
      this.jobArry = m?.resultSet?.jobMasters?.map((ar: any) =>
        ar.jobMasterJobName?.trim()
      );
    });
  }
  LoadCustomerDDL() {
    this.utilityService.LoadCustomerDropdown().subscribe((m: any) => {
      //customer
      this.customerArray = m.resultSet.customerMasters;
      this.customerList = m.resultSet.customerMasters?.map((kl: any) => ({
        label: kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.customerList.unshift({ label: '--Select--', value: -1 });
      this.customerArry = m.resultSet.customerMasters?.map((ar: any) =>
        ar.customerMasterCustomerName?.trim()
      );
    });
  }
  LoadCurrancyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((m: any) => {
      //currency
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select--', value: -1 });
      this.currArry = m.resultSet.currencyMasters.map((ar) =>
        ar.currencyMasterCurrencyName?.trim()
      );
    });
  }
  LoadLocationDDL() {
    this.utilityService.LoadDropdownLocationMaster().subscribe((m: any) => {
      //location
      const list = m?.resultSet?.locationMaster ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select--', value: -1 });
      this.locationLocked = this.utilityService.applyLocationLock(
        this.customerSellOrderFormGroup,
        'customerPurchaseOrderLocationId'
      );
      this.locationArry = list.map((ar) =>
        ar.locationMasterLocationName?.trim()
      );
    });
  }
  LoadDepartmentDDL() {
    this.utilityService.LoadDepartmentDropdown().subscribe((m: any) => {
      //department
      this.DepartmentMasterArray = m.resultSet.departmentsList;
      this.departmentList = m.resultSet.departmentsList?.map((kl: any) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentId,
      }));
      this.departmentList.unshift({ label: '--Select--', value: -1 });
      this.departmentArry = m.resultSet.departmentsList?.map((ar: any) =>
        ar.departmentMasterDepartmentName?.trim()
      );
    });
  }
  onSearch(term: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi
      .LoadFilteredItemMaster(this.pagedRequest)
      .subscribe((m: any) => {
        this.itemArray = m.resultSet.itemMaster;
        this.itemList = m.resultSet.itemMaster?.map((kl: any) => ({
          sales: kl?.itemMasterItemName,
          salesId: kl?.itemMasterItemId,
          barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
          size: kl?.itemMasterItemSize,
          //brand: this.brandArry?.find((x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId)?.vendorMasterVendorName,
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
    this.accountapi
      .LoadFilteredItemMaster(this.pagedRequest)
      .subscribe((m: any) => {
        //item
        this.itemArray = m.resultSet.itemMaster;
        this.itemList = m.resultSet.itemMaster?.map((kl: any) => ({
          label: kl.itemMasterItemName,
          value: kl?.itemMasterItemId,
        }));
        this.itemList.unshift({ label: '--Select--', value: -1 });
        this.itemArry = m.resultSet.itemMaster?.map((ar: any) =>
          ar.itemMasterItemName ? ar.itemMasterItemName?.trim() : ''
        );
      });
  }
  LoadUnitDDL() {
    //units
    this.utilityService.LoadDropdownunitMasters().subscribe((m: any) => {
      this.units = m.resultSet.unitMasters;
      this.unitListt = m.resultSet.unitMasters?.map((kl: any) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = m.resultSet.unitMasters?.map((ar: any) =>
        ar?.unitMasterUnitShortName?.trim()
      );
    });
  }
  selectValue(evt: any) {
    this.customerSellOrderFormGroup.controls[
      'customerPurchaseOrderCustomerId'
    ].setValue(evt?.customer);
    let activeRow = { row: 0, column: 0 };
    evt?.selectedCustomers.map((k) => {
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      hotInstance.setDataAtCell(
        activeRow.row,
        activeRow.column,
        k?.customerQuotationDetailsItemId
      );
      hotInstance.setDataAtCell(
        activeRow.row,
        3,
        this.unitListt?.find((l) => l.value == k.customerQuotationDetailsUnits)
          ?.label
      );
      hotInstance.setDataAtCell(
        activeRow.row,
        5,
        k?.customerQuotationDetailsUnitPrice
      );
      hotInstance.setDataAtCell(
        activeRow.row,
        4,
        k?.customerQuotationDetailsQty
      );
      hotInstance.setDataAtCell(
        activeRow.row,
        6,
        k?.customerQuotationDetailsAmount
      );
      hotInstance.setDataAtCell(activeRow.row, 8, k?.customerQuotationQid);
      hotInstance.setDataAtCell(
        activeRow.row,
        2,
        k?.customerQuotationDetailsDesription
      );
      hotInstance.setDataAtCell(activeRow.row, 1, '');
      activeRow.row += 1;
    });
  }

  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.LoadJobDDL();
    this.LoadDepartmentDDL();
    this.LoadUnitDDL();
    this.LoadCurrancyDDL();
    this.LoadCustomerDDL();
    this.LoadSalesManDDL();
    this.LoadLocationDDL();
  }

  new() {
    this.callDropdowns(false);

    this.customerSellOrderFormGroup.reset();
    this.customerPurchaseDetails.data = [];
    this.customerPurchaseDetails.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.customerPurchaseDetails);
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
    this.customerSellOrderFormGroup.enable();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.customerSellOrderFormGroup,
        'customerPurchaseOrderLocationId'
      );
    }
    this.customerSellOrderFormGroup.updateValueAndValidity();
    this.customerSellOrderFormGroup
      .get('customerPurchaseOrderLPODate')
      .setValue(new Date());
    this.customerSellOrderFormGroup
      .get('customerPurchaseOrderDate')
      .setValue(new Date());
    this.GetDefaultSettings();
    // this.getDefaultCurrency();
    //this.getDefaultLocation();
    // this.f./.clearValidators();
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
          this.f.customerPurchaseOrderCurrencyId.setValue(
            Number(this.DefCurrency)
          );
        }
      }
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );

      if (DEFAULT_LOCATION != null) {
        this.DefLocationCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocationCheck !== null) {
          const splitText = this.DefLocationCheck.split('::');
          this.DefLocation = splitText[1]?.trim();
          if (!this.locationLocked) {
            this.f.customerPurchaseOrderLocationId.setValue(
              Number(this.DefLocation)
            );
          }
        }
      }

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
  getDefaultCurrency() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULTCURRENCY')
      .subscribe((data: any) => {
        if (data !== null) {
          this.DefCurCheck = data.result[0].generalSettingsTextValue;
          if (this.DefCurCheck !== null) {
            const splitText = this.DefCurCheck.split('::');
            this.DefCurrency = splitText[1]?.trim();
            this.f.customerPurchaseOrderCurrencyId.setValue(
              Number(this.DefCurrency)
            );
          }
        }
      });
  }

  getDefaultLocation() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULT_LOCATION')
      .subscribe((data) => {
        if (data !== null) {
          this.DefLocationCheck = data.result[0].generalSettingsTextValue;
          if (this.DefLocationCheck !== null) {
            const splitText = this.DefLocationCheck.split('::');
            this.DefLocation = splitText[1]?.trim();
            if (!this.locationLocked) {
              this.f.customerPurchaseOrderLocationId.setValue(
                Number(this.DefLocation)
              );
            }
          }
        }
      });
  }
  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.customerPurchaseDetails.readOnly = false;
    this.customerSellOrderFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.customerSellOrderFormGroup,
      'customerPurchaseOrderLocationId',
      this.locationLocked
    );
    this.customerSellOrderFormGroup.controls.customerSellOrderID?.disable();
    this.customerSellOrderFormGroup.updateValueAndValidity();
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
        this.salesapi
          .DeleteCustomerPurchase(this.savedCustomerPurchase)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Customer Sales Order Deleted Succesfully',
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
  cancel() {
    this.GetSavedCustomerPurchaseDetails(
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseVoucherNo
    );
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  saveCustomerSellOrder() {
    const savedData: Array<any> = this.customerPurchaseDetails.data?.filter(
      (k) => k.hasOwnProperty('item')
    );
    const customerPurchase: CustomerPurchaseOrder = this
      .customerSellOrderFormGroup.value as CustomerPurchaseOrder;

    customerPurchase.customerPurchaseOrderId =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderId !=
      null
        ? this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderId
        : 0;
    customerPurchase.customerPurchaseOrderVoucherNo =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderVoucherNo;
    customerPurchase.customerPurchaseOrderSONo =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderSONo;
    customerPurchase.customerPurchaseOrderDate =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderDate;
    customerPurchase.customerPurchaseOrderLpoNo =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderLPONo;
    customerPurchase.customerPurchaseOrderLpoDate =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderLPODate;
    customerPurchase.customerPurchaseOrderLocationId =
      this.customerSellOrderFormGroup.get('customerPurchaseOrderLocationId')
        ?.value;
    customerPurchase.customerPurchaseOrderCurrencyId =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderCurrencyId;
    customerPurchase.customerPurchaseOrderJobId =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderJobId;
    customerPurchase.customerPurchaseOrderSalesManId =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderSalesManId;
    customerPurchase.customerPurchaseOrderCustomerId =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderCustomerId;
    customerPurchase.customerPurchaseOrderDepartmentId =
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderDepartmentId;
    customerPurchase.customerPurchaseOrderGrandTotal = Number(
      this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderAmount
    );
    customerPurchase.customerPurchaseOrderDiscountAmount = Number(
      this.customerSellOrderFormGroup.getRawValue()
        .customerPurchaseOrderDiscAmount
    );
    customerPurchase.customerPurchaseOrderDiscountPercentage = Number(
      this.customerSellOrderFormGroup.getRawValue()
        .customerPurchaseOrderVatPercentage
    );
    customerPurchase.customerPurchaseOrderVatAmount = Number(
      this.customerSellOrderFormGroup.getRawValue()
        .customerPurchaseOrderVatAmount
    );
    customerPurchase.customerPurchaseOrderTotal = Number(
      this.customerSellOrderFormGroup.getRawValue()
        .customerPurchaseOrderNetAmount
    );
    customerPurchase.customerPurchaseOrderVat = Number(
      this.customerSellOrderFormGroup.getRawValue()
        .customerPurchaseOrderDiscAmount
    );
    customerPurchase.customerPurchaseOrderVAT_Percen = Number(
      this.customerSellOrderFormGroup.getRawValue()
        .customerPurchaseOrderVatPercentage
    );

    //customerPurchase.customerPurchaseOrderDelSch = this.customerSellOrderFormGroup.getRawValue().customerPurchaseOrderDelSch;
    customerPurchase.customerPurchaseOrderDetails = savedData
      ?.filter((k) => k.item != null)
      .map((k: GridData) => {
        return {
          customerPurchaseOrderDetailsId: k.id != null ? k.id : 0,
          customerPurchaseOrderDetailsItemId: k.item ?? null,
          // k.item != null && k.item !== ''
          //   ? this.itemArray?.find(
          //     (j) => j?.itemMasterItemName?.trim() === k?.materialname?.trim()
          //   )?.itemMasterItemId
          //   : null,
          //customerPurchaseOrderDetailsDescription: k.item?.trim().split('|')[0],
          customerPurchaseOrderDetailsDescription: k.materialname,
          customerPurchaseOrderDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                  (j) => j.unitMasterUnitShortName?.trim() === k.unit?.trim()
                ).unitMasterUnitId
              : null,
          customerPurchaseOrderDetailsQty: k.qty,
          customerPurchaseOrderDetailsUnitPrice: k.price,
          customerPurchaseOrderDetailsAmount: k.amount,
          customerPurchaseOrderDetailsRemarks: k.remarks,
          customerQuotationDetailsIsEdited: null,
          customerPurchaseOrderDelStatus: false,
          customerPurchaseOrderDetailsPartNo: k.partno,
          customerPurchaseOrderDetailsQuotationID: k.customerQuotationQid ?? 55,
        };
      });

    if (this.btnFlag.save) {
      this.saveCustomerPurchase(customerPurchase);
    } else {
      this.updateCustomerPurchase(customerPurchase);
    }
  }
  saveCustomerPurchase(customerPurchase: CustomerPurchaseOrder) {
    if (this.customerSellOrderFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.salesapi.InsertCustomerPurchase(customerPurchase).subscribe(
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
                this.savedCustomerPurchase = data.result;
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
      this.customerSellOrderFormGroup.markAllAsTouched();
      this.customerSellOrderFormGroup.markAsDirty();
    }
  }
  updateCustomerPurchase(customerPurchase: CustomerPurchaseOrder) {
    if (this.customerSellOrderFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.salesapi.UpdateCustomerPurchase(customerPurchase).subscribe(
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
      this.customerSellOrderFormGroup.markAllAsTouched();
      this.customerSellOrderFormGroup.markAsDirty();
    }
  }

  public get IsValidGrid(): boolean {
    if (this.customerPurchaseDetails.data.length > 0) {
      return Object.values(this.customerPurchaseDetails.data).some(
        (k: GridData) => k.item != null
      );
    }
    return false;
  }
  updateFormGrid(custPurchase: CustomerPurchaseOrder) {
    this.customerSellOrderFormGroup.patchValue({
      customerPurchaseOrderId:
        custPurchase.customerPurchaseOrderId != null
          ? custPurchase.customerPurchaseOrderId
          : 0,
      customerPurchaseOrderVoucherNo:
        custPurchase.customerPurchaseOrderVoucherNo,
      customerPurchaseOrderSONo: custPurchase.customerPurchaseOrderVoucherNo,
      customerPurchaseOrderDate:
        custPurchase.customerPurchaseOrderDate != null
          ? new Date(custPurchase.customerPurchaseOrderDate)
          : null,
      customerPurchaseOrderLPONo: custPurchase.customerPurchaseOrderLpoNo,
      customerPurchaseOrderLPODate:
        custPurchase.customerPurchaseOrderLpoDate != null
          ? new Date(custPurchase.customerPurchaseOrderLpoDate)
          : null,
      customerPurchaseOrderDelSch: custPurchase.customerPurchaseOrderDelSch,
      customerPurchaseOrderLocationId: this.locationLocked
        ? this.customerSellOrderFormGroup.get('customerPurchaseOrderLocationId')
            ?.value
        : custPurchase.customerPurchaseOrderLocationId,
      customerPurchaseOrderCustomerId:
        custPurchase.customerPurchaseOrderCustomerId,
      customerPurchaseOrderDepartmentId:
        custPurchase.customerPurchaseOrderDepartmentId,
      customerPurchaseOrderSalesManId:
        custPurchase.customerPurchaseOrderSalesManId,
      customerPurchaseOrderCurrencyId:
        custPurchase.customerPurchaseOrderCurrencyId,
      customerPurchaseOrderJobId: custPurchase.customerPurchaseOrderJobId,
      customerPurchaseOrderRemarks: custPurchase.customerPurchaseOrderRemarks,
      customerPurchaseOrderAmount: custPurchase.customerPurchaseOrderGrandTotal,
      customerPurchaseOrderDiscAmount:
        custPurchase.customerPurchaseOrderDiscountAmount,
      customerPurchaseOrderVatPercentage:
        custPurchase.customerPurchaseOrderVAT_Percen,
      customerPurchaseOrderVatAmount: custPurchase.customerPurchaseOrderVat,
      customerPurchaseOrderNetAmount: custPurchase.customerPurchaseOrderTotal,
    });
    const gridData: GridData[] = custPurchase.customerPurchaseOrderDetails.map(
      (k) => {
        // const itemName: string = k.customerPurchaseOrderDetailsItemId != null ? this.itemList?.find(l => l.value == k.customerPurchaseOrderDetailsItemId)?.label : null;
        const unitName: string =
          k.customerPurchaseOrderDetailsUnitId != null
            ? this.unitListt?.find(
                (l) => l.value == k.customerPurchaseOrderDetailsUnitId
              )?.label
            : null;

        return {
          item: k.customerPurchaseOrderDetailsItemId,
          partno: k.customerPurchaseOrderDetailsPartNo,
          materialname: k.customerPurchaseOrderDetailsDescription,
          unit: unitName,
          qty: k.customerPurchaseOrderDetailsQty,
          price: k.customerPurchaseOrderDetailsUnitPrice,
          amount: k.customerPurchaseOrderDetailsAmount,
          remarks: k.customerPurchaseOrderDetailsRemarks,
          id: k.customerPurchaseOrderDetailsId,
        };
      }
    );
    this.customerPurchaseDetails.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.customerSellOrderFormGroup.disable();
    this.customerSellOrderFormGroup.updateValueAndValidity();
  }
  getAllCustomerSellOrders() {
    this.salesapi.GetCustomerPurchaseOrder().subscribe((data) => {
      this.customerPurchase = data.result;
    });
  }
  showMaximizableDialog() {
    this.getAllCustomerSellOrders();
    this.displayMaximizable = true;
  }

  GetSavedCustomerPurchaseDetails(id) {
    this.index = 0;
    this.callDropdowns(false);
    this.salesapi.GetSavedCustomerPurchaseDetails(id).subscribe(
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
          this.savedCustomerPurchase = data.result;
          this.customerSellOrderFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Customer Quotation not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.customerSellOrderFormGroup.updateValueAndValidity();
      }
    );
  }
  public getCurrency(id): string {
    return this.currencyList?.find((k) => k?.value === id)?.label;
  }

  public getLocation(id): string {
    return this.locationList?.find((k) => k?.value === id)?.label;
  }

  public getJob(id): string {
    return this.jobList?.find((k) => k?.value === id)?.label;
  }

  public getCustomer(id): string {
    return this.customerList?.find((k) => k?.value === id)?.label;
  }
  public getSalesMan(id): string {
    return this.SalesManMasterList?.find((k) => k?.value === id)?.label;
  }
  public getUnitName(unit: number): string {
    return this.units?.find((j) => j?.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }

  public GetTotal() {
    var totalAmount = 0;
    if (
      this.savedCustomerPurchase &&
      this.savedCustomerPurchase.customerPurchaseOrderDetails
    ) {
      this.savedCustomerPurchase.customerPurchaseOrderDetails.forEach(
        (element: any) => {
          if (element && element.customerPurchaseOrderDetailsAmount) {
            totalAmount += element.customerPurchaseOrderDetailsAmount;
          }
        }
      );
    }
    return totalAmount;
  }
  GetCustomer(id) {
    let cutomerId = Number(id);
    const cust = this.customerArray?.find(
      (l) => l.customerMasterCustomerNo == cutomerId
    );
    if (cust) {
      return cust.customerMasterCustomerName;
    }
  }

  get f() {
    return this.customerSellOrderFormGroup.controls;
  }
  handleChange(e) {}

  // get itemSetLookup() {
  //   return this.itemArray.map((kl) => ({
  //     partNo: kl.itemMasterPartNo,
  //     sales: kl.itemMasterItemName,
  //     salesId: kl.itemMasterItemId,
  //     barcode: kl?.unitDetails[0]?.unitDetailsBarcode,
  //   }));
  // }
  get itemSetLookup() {
    return this.itemArray.map((kl) => ({
      procurements: kl.itemMasterItemName,
      procurementsId: kl?.itemMasterItemId,
    }));
  }
  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      procurements: kl.unitMasterUnitShortName,
      procurementsId: kl.unitMasterUnitId,
    }));
  }
  displayPrint() {
    this.displayPrintPreview = true;
  }
  getPIReport() {
    const fileName = String(new Date().valueOf());
    var css: string = `
    .contain{
      width: 85%;
      margin-left: 8%;
      margin-bottom:2% ;
      border-radius: 10px;
      margin-top: 1%;
    }
    h1{
      padding-left: 4%;
      padding-top: .5%;
      font-family:"Sans-serif";
      font-size: 1.5rem;
      margin-bottom: 2%;
      color: black;
    }
    h2{
      padding-top: 25px;
      text-align: center;
      margin-top: 1%;
      font-family:"Sans-serif";
      font-size: 1.5rem;
      margin-bottom: 0%;
    }
    h3{
      text-align: center;
     margin-top: 0%;
      font-family:"Sans-serif";
      font-size: 1rem;
    }
    h4{
    margin-top: 5px;
    padding-left: 0%;
    margin-bottom: 0%;
    font-size: 18px;
    }
    h5{
      margin-top: 0%;
    }
    .w60{
    width: 60px;
    }
    .w80{
    width: 130px;
    text-align: left;
    }
    .spacer{
    height: 200px;
    }
    .page-footer {
    position: running(footer);
    bottom: 0;
    width: 100%;
    visibility: visible;
   /* margin-top: 100%; */
    /* clear: both;
    position: relative;
    height: 200px;
    margin-top: -200px; */
    }
    .payment1{
      border: 2.5px solid rgb(86, 87, 87);
      width: 85.2%;
      margin-left: 8%;
      margin-bottom:2% ;
      border-radius: 10px;
      margin-top: 2%;
      padding-left:3%;
      font-size: 18px;
       margin-bottom: 0%;
       padding-top: 10px;
       padding-bottom: 10px;
        }

    .header {
      display: flex;
      justify-content: space-between;
     margin-right: 35%;
     margin-top: 0px;
    }

    .left {
      font-size: 16px;
      text-align: left;
    }

    .right {
      font-size: 16px;
      text-align: right;

    }
    #Voucher {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;


    }

    #Voucher td, #Voucher th {
      border: 1px solid #ddd;
      padding: 8px;

    }

    #Voucher tr:nth-child(even){background-color: #f2f2f2;}

    #Voucher tr:hover {background-color: #ddd;}

    #Voucher th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #dfe4e3;
      color: rgb(0, 0, 0);
      text-align: center;

    }


    #payment {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;

    }

    #payment td, #payment th {
      border: 1px solid #ddd;
      padding: 8px;

    }

    #payment tr:nth-child(even){background-color: #f2f2f2;}

    #payment tr:hover {background-color: #ddd;}

    #payment th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #dfe4e3;
      color: rgb(0, 0, 0);
      text-align: center;
    }
    .page{
      padding-left: 15px;
      text-align: center;
    }
    .container {
    display: flex; /* Use flexbox layout */
     padding-top: 1%;
     padding-left: 68%;
     flex-direction: row;
     justify-content: start;
     align-items: start;

    }

    .column1 {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
    }
    .column2{
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
  margin-left: 100px;
    }

    .rup{
      font-size: 16px;
      font-weight: bold;
      padding-left: 11%;
    }
    h4{
      padding-left: 8%;
    }

    .header {
      display: flex;
      align-items: center;
      margin-top: -20px;
      margin-bottom: -20px;
    }

    .logo {
      margin-right: 90px; /* Adjust margin as needed */
      width: 20%;
      height: 7%;
      padding-top: 5%;
    }
    .adj{
      display: flex;
     padding-left: 13%;
     padding-top: 3%;
    }

    .pre{
    padding-left: 45%;
    }
    .flex-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between; /* Adjust this according to your layout needs */
      /* Add any other necessary styling */
  }
  .flexcol {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
    }
    .flexrow {
      display: flex;
      flex-direction: row;
      justify-content: start;
      align-items: start;
      margin-right: 250px;
    }
    .rounded-table{
       border: 2.5px solid rgb(86, 87, 87);
    border-collapse:separate;
     border-radius:6px;
    width: 88%;
    margin-left: 8%;
    margin-top: 5px;
    border-radius: 10px;
    }
  `;
    var data = document.getElementById('print');
    // let html: any = document.getElementById('print');
    // this.printService.saveAsPDF(data, 'saleVoucherPDF');
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
  }

  userTrackingLog(type) {
    let req = {
      page: 'Customer Sales Order',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.customerSellOrderFormGroup.get('customerPurchaseOrderSONo')
        .value,
      vpType: 'Customer Sales Order',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  convertNumberToWordsWithDecimal(number: number): string {
    if (number == null) {
      return 'Invalid number';
    }

    const toWords = new ToWords();

    const [integerPart, decimalPart] = number.toFixed(2).split('.');

    const integerWords = toWords.convert(parseInt(integerPart, 10));
    const decimalWords = toWords.convert(parseInt(decimalPart || '0', 10));

    let result = `${integerWords}`;

    if (decimalWords !== 'zero') {
      result += ` point ${decimalWords}`;
    }

    return result;
  }

  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
    // this.dataset
  }
  selectsales(evt) {
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
        .setDataAtCell(this.activeRow.row, 3, UnitId?.unitMasterUnitShortName);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(
          this.activeRow.row,
          16,
          UnitId?.unitDetailsConversionType
        );
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
          this.ItemMasterArrayByName = k.resultSet.itemMaster;
          this.conversion_Type =
            this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType;

          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(
              this.activeRow.row,
              5,
              this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitPrice
            );
          this.funitid =
            this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
          const UnitId: string =
            this.funitid != null
              ? this.unitListt?.find((l) => l.value == this.funitid).label
              : null;
          // const UnitId = this.unitArray[0]?.unitMasterUnitShortName;

          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(this.activeRow.row, 3, UnitId);

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
  // selectsales(evt) {
  //   let trimmedSales = evt.sales?.trim();
  //   const includesPcs = this.units.some(unit =>unit.unitMasterUnitShortName?.trim().includes(trimmedSales));
  //   if (includesPcs && this.unitArray.length !=0 ) {
  //     const UnitId: string =  this.unitArray?.find(l =>l.unitMasterUnitId==evt.salesId)?.unitMasterUnitShortName;
  //     this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 3, UnitId);
  //   }
  //   else {
  //     this.masterapi.GetUnitDetails(evt.salesId).subscribe(res => {
  //       this.unitArray = res.result;
  //       this.unitArry = res.result.map(ar => ar.unitMasterUnitShortName?.trim());
  //     });

  //     this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, this.activeRow.column, evt.salesId);
  //     this.masterapi.GetAllItemMasterById(evt.salesId).subscribe(k => {
  //       this.ItemMasterArrayByName = k.result;
  //       this.conversion_Type = this.ItemMasterArrayByName.unitDetails[0].unitDetailsConversionType;

  //       this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 5, this.ItemMasterArrayByName.unitDetails[0].unitDetailsUnitPrice);
  //       this.funitid = this.ItemMasterArrayByName.unitDetails[0].unitDetailsUnitId;
  //       const UnitId: string = this.funitid != null ? this.unitListt?.find(l => l.value == this.funitid).label : null;
  //       // const UnitId = this.unitArray[0]?.unitMasterUnitShortName;

  //       this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 3, UnitId);

  //       this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 2, this.ItemMasterArrayByName.itemMasterItemName);
  //       this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 1, this.ItemMasterArrayByName.itemMasterPartNo);

  //     });
  //   }
  //   this.showSalesLookUp = false;

  // }

  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(evt.cell.row, evt.cell.column, null);
    }
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }
  hide(evt: boolean) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  EditItem(name, id) {
    const ref = this.dialogService.open(ItemModifyComponent, {
      header: 'Edit Item',
      width: '50%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {
        itemName: name,
        itemId: id,
      },
    });

    ref.onClose.subscribe((res) => {
      if (res && !res.isSave) {
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 2, res.Itemname);
      } else if (res && res.isSave) {
        this.masterapi.GetAllItemMasterById(res.ItemId).subscribe((data) => {
          if (data.result != null) {
            this.Obj = {
              itemMasterAccountNo: data.result.itemMasterAccountNo,
              itemMasterItemId: 0,
              itemMasterMaterialCode: data.result.itemMasterMaterialCode,
              itemMasterItemName: res.Itemname,
              itemMasterStockType: data.result.itemMasterStockType,
              itemMasterItemType: data.result.itemMasterItemType,
              itemMasterSupplierId: data.result.itemMasterSupplierId,
              itemMasterVenderId: data.result.itemMasterVenderId,
              itemMasterSupplierCode: data.result.itemMasterSupplierCode,
              itemMasterPartNo: data.result.itemMasterPartNo,
              itemMasterReOrderLevel: data.result.itemMasterReOrderLevel,
              itemMasterItemSize: data.result.itemMasterItemSize,
              itemMasterColor: data.result.itemMasterColor,
              itemMasterShape: data.result.itemMasterShape,
              itemMasterPacking: data.result.itemMasterPacking,
              itemMasterRef2: data.result.itemMasterRef2,
              itemMasterRef1: data.result.itemMasterRef1,
              itemMasterUserId: data.result.itemMasterUserId,
              itemMasterLandingCost: data.result.itemMasterLandingCost,
              itemMasterVat: data.result.itemMasterVat,
              unitDetails: data.result.unitDetails.map((res) => ({
                unitDetailsBarcode: res.unitDetailsBarcode,
                unitDetailsConversionType: res.unitDetailsConversionType,
                unitDetailsDefUnit: res.unitDetailsDefUnit,
                unitDetailsDefWunit: res.unitDetailsDefWunit,
                unitDetailsDelStatus: res.unitDetailsDelStatus,
                unitDetailsDescrption: res.unitDetailsDescrption,
                unitDetailsHeight: res.unitDetailsHeight,
                unitDetailsId: 0,
                unitDetailsItemId: 0,
                unitDetailsOverhdPer: res.unitDetailsOverhdPer,
                unitDetailsPacking: res.unitDetailsPacking,
                unitDetailsProfitPer: res.unitDetailsProfitPer,
                unitDetailsRate: res.unitDetailsRate,
                unitDetailsReorder: res.unitDetailsReorder,
                unitDetailsUnitCost: res.unitDetailsUnitCost,
                unitDetailsUnitId: res.unitDetailsUnitId,
                unitDetailsUnitPrice: res.unitDetailsUnitPrice,
                unitDetailsWidth: res.unitDetailsWidth,
                unitDetailsWrate: res.unitDetailsWrate,
              })),
            };
          }
          if (this.Obj != null) {
            this.masterapi.NewItem(this.Obj).subscribe((res) => {
              if (res.valid) {
                this.UpdateItem = res.result;

                this.funitid =
                  this.UpdateItem?.unitDetails[0]?.unitDetailsUnitId;
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
                    0,
                    this.UpdateItem?.itemMasterItemId
                  );
                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(
                    this.activeRow.row,
                    2,
                    this.UpdateItem?.itemMasterItemName
                  );
              }
            });
          }
        });
      }
    });
  }
  exit(evt) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }
  selectControl(evt) {
    this.control.setValue(evt.procurements);
    this.elementReference.nativeElement.value = evt.procurementsId;
    this.formControlLookUp = false;
  }
  wrapTextRenderer = (instance, td, row, col, prop, value, cellProperties) => {
    if (!td) {
      td = document.createElement('td');
    }
    Handsontable.renderers.TextRenderer.call(
      this,
      instance,
      td,
      row,
      col,
      prop,
      value,
      cellProperties
    );
    const isNumeric = cellProperties.type === 'numeric';
    td.className = isNumeric ? 'htRight' : 'htLeft';
    if (cellProperties.isHeader) {
      td.classList.add(isNumeric ? 'header-numeric' : 'header-text');
    }

    if (td && typeof value === 'string') {
      const cleanValue = value.trim();

      const chunks = [];
      let currentLine = '';

      cleanValue.split(/\s+/).forEach((word) => {
        if (currentLine.length + word.length <= 80) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) chunks.push(currentLine);
          currentLine = word;
        }
      });

      if (currentLine) chunks.push(currentLine);
      td.textContent = chunks.join('\n');

      td.style.whiteSpace = 'pre-wrap';
      td.style.wordBreak = 'break-word';
      td.style.fontSize = '15px';
      td.style.padding = '5px';
    }

    return td;
  };
}

interface GridData {
  item?: any;
  partno?: any;
  materialname?: any;
  unit?: any;
  qty?: any;
  price?: any;
  amount?: any;
  id?: any;
  remarks?: any;
  customerQuotationQid?: any;
}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
export const columnDetailList = (component: CustomerSalesOrderComponent) => [
  {
    data: 'item',
    type: 'text',
    label: 'Code',
    toolTip: 'Item Id',
    source: component.itemArry,
  },
  {
    data: 'partno',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
  },
  {
    data: 'materialname',
    type: 'text',
    label: 'Material Name',
    toolTip: 'Material Name',
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    toolTip: 'Unit Name',
    source: component.unitArry,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Quantity',
    toolTip: 'Quantity',
    readOnly: false,
  },
  {
    data: 'price',
    type: 'numeric',
    label: 'Price',
    toolTip: 'Price',
    readOnly: false,
  },
  {
    data: 'amount',
    type: 'numeric',
    label: 'Amount',
    toolTip: 'Amount',
  },
  {
    data: 'remarks',
    type: 'text',
    label: 'Remarks',
    toolTip: 'Remarks',
    readOnly: false,
  },
  {
    data: 'customerQuotationQid',
    type: 'numeric',
    label: '-',
    toolTip: 'Quotation Id',
  },
];
