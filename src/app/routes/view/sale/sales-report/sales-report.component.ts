import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MessageService, ConfirmationService, SelectItem } from 'primeng';
import { MenuItem } from 'primeng/api/menuitem';
import { ItemMaster } from 'src/app/routes/domain';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { salesReportReponseModel } from 'src/app/routes/domain/Masters/salesReportResponse';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { SalesService } from 'src/app/routes/service/sales/sales.service';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { DatefilterComponent } from 'src/app/shared/component/datefilter/datefilter.component';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { defaults } from 'src/app/shared/service/settings';
import { PagedRequest } from '../../storewarehouse/opening-stock/opening-stock.component';
import { EntityResponse } from 'src/app/routes/domain/Masters/EntityResponse';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss'],
})
export class SalesReportComponent implements OnInit, AfterViewInit {
  @ViewChild(DatefilterComponent) datefilterComponent!: DatefilterComponent;
  ScreenId: number;
  Permission: any;

  rptFilter: ReportFilterModel;
  pdfSource: any;
  // Add these variables in your component class
  currentPage: number = 1;
  itemsPerPage: number = 10; // You can set the number of items per page as per your requirement
  totalItems: number;
  totalGrossAmount: any = 0;
  totalDiscount: any = 0;
  totalVatAmount: any = 0;
  totalRoundoff: any = 0;
  totalNetAmount: any = 0;

  currentDate: Date = new Date();
  breadcumbmodel: MenuItem[];
  title: string;
  licensekey: string;
  currencyList: any;
  itemGrouplist: any;
  location: any;
  customer: any;
  department: string;
  brand: string;
  itemId: any;
  itemName: any;
  itemGroup: any;
  customerFilter: any;
  locationFilter: any;
  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  invoiceType: any;
  invoiceStatus: boolean;
  enableDate: boolean = false;
  ItemMasterGroupArray: ItemMaster[] = [];
  ItemMasterGroupArry: string[] = [];
  ItemMasterGroupList: SelectItem[] = [];
  confirmDialog: boolean = false;
  displayPrintPreview: boolean = false;
  invoiceTlist: any[] = [
    { label: 'All', value: 'all' },
    { label: 'Cash', value: 'cash' },
    { label: 'Credit', value: 'credit' },
  ];
  invoiceStatusList: any[] = [
    { label: 'Transit', value: 'transit' },
    { label: 'Emailed', value: 'emailed' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Not Submitted', value: 'not_submitted' },
  ];
  pageSize = 10;
  btnFlag: BtnFlag;
  salesReportList: Array<salesReportReponseModel> = [];
  locationList: SelectItem[] = [];
  itemList: Array<any> = [];
  brandList: Array<any> = [];
  departmentList: any[] = [];

  DepartmentMasterArry: string[] = [];
  DepartmentMasterList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  customerList: Array<CustomerMaster> = [];
  // frmSalesReport: FormGroup;
  salesReportType = 'GetSalesReportDetailWise';
  reportSaleReportGroup: FormGroup;
  hotidD = 'salesReportD';
  hotidS = 'salesReportS';
  salesReportDetail: Handsontable.GridSettings;
  salesReportSummary: Handsontable.GridSettings;
  private hotRegisterer = new HotTableRegisterer();
  // private hotRegisterer = new HotTableRegisterer();

  selectItem: any;
  activeRow: { row: number; column: number };
  dataList: Array<any> = [];
  pagedRequest: PagedRequest;
  isServerSearch = false;
  lookupColumns = [];
  showItemMasterLookUp: boolean = false;
  selectedSalesMan: any;
  Salesman: any[] = [];

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private accountapi: AccountApiService,
    private router: Router,
    private formatDateService: ReportDateFormatService,
    private salesApi: SalesService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private crystalReportService: CrystalReportService,

    private permission: PermissionsService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  ngOnInit(): void {
    this.btnFlag = {
      new: false,
      edit: true,
      cancel: true,
      save: true,
      delete: true,
      list: false,
    };
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      // alert(this.title)
    });

    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];

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

    if (this.salesReportType == 'GetSalesReportDetailWise') {
      this.initializeControlsDetail();
    } else {
      this.initailizeControlSummary();
    }
  }

  ngAfterViewInit(): void {
    this.getSalesReport();
  }

  initializeControlsDetail() {
    this.customer = undefined;
    this.location = undefined;
    this.itemGroup = undefined;
    this.itemId = undefined;
    this.itemName = undefined;
    this.invoiceType = undefined;
    this.totalGrossAmount = 0;
    this.totalDiscount = 0;
    this.totalVatAmount = 0;
    this.totalRoundoff = 0;
    this.totalNetAmount = 0;
    this.salesReportDetail = this.utilityService.getTableConfig(
      detailColumnObjList(this),
      [6, 7]
    );
  }

  initailizeControlSummary() {
    this.customer = undefined;
    this.location = undefined;
    this.itemGroup = undefined;
    this.itemId = undefined;
    this.itemName = undefined;
    this.invoiceType = undefined;
    this.totalGrossAmount = 0;
    this.totalDiscount = 0;
    this.totalVatAmount = 0;
    this.totalRoundoff = 0;
    this.totalNetAmount = 0;
    this.salesReportSummary = this.utilityService.getTableConfig(
      summaryColumnObjList(this),
      [8]
    );
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  showPrint() {
    let isDate = this.enableDate;
    let item = this.itemId;

    let customer = this.customer?.customerMasterCustomerNo;
    let location = this.location?.locationMasterLocationId;
    let invoiceType = this.invoiceType;
    const { fromDate, toDate } = this.datefilterComponent.onApplyDateFilter();

    let query = 'SELECT * FROM vw_SalesVoucher WHERE 1 = 1';

    if (isDate) {
      query += ` AND SalesVoucherDate BETWEEN '${fromDate}' AND '${toDate}'`;
    }

    if (customer && customer != 0) {
      query += ` AND Customer_Master_Customer_No = ${customer}`;
    }

    if (this.selectedSalesMan) {
      query += ` AND Sales_Man_Master_Sales_Man_ID = ${this.selectedSalesMan}`;
    }
    if (item && item != 0) {
      query += ` AND ItemId = ${item}`;
    }

    if (location && location != 0) {
      query += ` AND salesvoucherlocationid = ${location}`;
    }

    if (invoiceType && invoiceType != 0) {
      query += ` AND salesvouchertype = '${invoiceType}'`;
    }

    this.rptFilter = {
      ReportName:
        this.salesReportType == 'GetSalesReportDetailWise'
          ? 'SalesDetail'
          : 'SalesSummary',
      SelectionFormula: '',
      Parameters: [],
      Queries: [query],
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

  userTrackingLog(type) {
    let req = {
      page: '',
      section: this.salesReportList,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: '',
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  displayExcel() {
    if (this.salesReportType == 'GetSalesReportDetailWise') {
      this.printService.exportExcel(
        'GetSalesReportDetailWise',
        'SalesReportDetailWise.xlsx'
      );
    } else {
      this.printService.exportExcel(
        'GetSalesReportSummaryWise',
        'SalesReportSummaryWise.xlsx'
      );
    }
  }

  getAllLocation() {
    if (this.locationList.length > 0) return;
    this.accountapi.LoadDropdownLocationMaster().subscribe((m) => {
      this.locationList = m.resultSet.locationMaster;
    });
  }

  LoadItemDDL() {
    if (this.itemList.length > 0) return;
    this.accountapi.LoadDropdownItemMaster().subscribe((m) => {
      this.itemList = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      // this.ItemMasterList.unshift({ label: '--Select item--', value: -1 });
    });
  }
  LoadDropdownItemGroupMaster() {
    if (this.ItemMasterGroupList.length > 0) return;
    this.accountapi.LoadDropdownItemGroupMaster().subscribe((m) => {
      this.ItemMasterGroupList = m.resultSet.itemGroup.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
    });
  }

  getAllDepartment() {
    this.accountapi.LoadDepartmentDropdown().subscribe((m) => {
      this.departmentList = m.resultSet.departmentsList;
      this.DepartmentMasterList = m.resultSet.departmentsList?.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentId,
      }));
      this.DepartmentMasterList.unshift({
        label: '--Select Department--',
        value: -1,
      });
      this.DepartmentMasterArry = m.resultSet.departmentsList.map(
        (ar) =>
          ar.departmentMasterDepartmentName?.trim() +
          '|' +
          ar.departmentMasterDepartmentId
      );
    });
  }

  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];
  getAllCustomers() {
    if (this.customerList.length > 0) return;
    this.accountapi.LoadCustomerDropdown().subscribe((m) => {
      this.customerList = m.resultSet.customerMasters;
      this.CustomerMasterList = m.resultSet.customerMasters?.map((kl) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
            ' -- ' +
            kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({
        label: '--Select Customer--',
        value: -1,
      });
    });
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.getSalesReport();
  }

  getAllBrands() {
    this.accountapi.LoadDropdownBrandMasters().subscribe((m) => {
      this.brandList = m.resultSet.brandMasters;
    });
  }

  calculateTotals() {
    this.totalGrossAmount = 0;
    this.totalDiscount = 0;
    this.totalVatAmount = 0;
    this.totalRoundoff = 0;
    this.totalNetAmount = 0;
    var amt = 0;
    var disc = 0;
    var vatamt = 0;
    var roff = 0;
    var netamt = 0;
    console.log('this.salesReportList = ', this.salesReportList);
    this.salesReportList.forEach((e) => {
      if (e.grossAmt) {
        amt += e.grossAmt;
      }
      if (e.discount) {
        disc += e.discount;
      }
      if (e.vatAmount) {
        vatamt += e.vatAmount;
      }
      if (e.salRetAmt) {
        roff += e.salRetAmt;
      }
      if (e.netAmount) {
        netamt += e.netAmount;
      }
    });
    this.totalGrossAmount = amt.toFixed(2);
    this.totalDiscount = disc.toFixed(2);
    this.totalVatAmount = vatamt.toFixed(2);
    this.totalRoundoff = roff.toFixed(2);
    this.totalNetAmount = netamt.toFixed(2);
  }

  getSalesReport() {
    const { fromDate, toDate } = this.datefilterComponent.onApplyDateFilter();
    this.dateFrom = new Date(fromDate);
    this.dateTo = new Date(toDate);

    this.salesReportList = [];
    let req = {
      customerId: this.customer?.customerMasterCustomerNo,
      itemId: this.itemId,
      itemGroupId: this.itemGroup,
      locationId: this.location?.locationMasterLocationId,
      isDate: this.enableDate,
      fromdate: fromDate,
      todate: toDate,
      vType: this.invoiceType,
      salemanId: this.selectedSalesMan,
    };
    this.salesApi
      .getSalesReportTypeWise(this.salesReportType, req)
      .subscribe((res: any) => {
        this.salesReportList = res;
        this.calculateTotals();
        if (this.salesReportType == 'GetSalesReportDetailWise') {
          this.hotRegisterer.getInstance(this.hotidD).updateSettings({
            data: res,
          });
        } else {
          this.hotRegisterer.getInstance(this.hotidS).updateSettings({
            data: res,
          });
        }
      });
  }
  clearItem() {
    this.itemId = undefined;
    this.itemName = undefined;
  }
  showAllData() {
    if (this.salesReportType == 'GetSalesReportDetailWise') {
      this.hotRegisterer.getInstance(this.hotidD).updateSettings({
        data: this.salesReportList,
      });
    } else {
      this.hotRegisterer.getInstance(this.hotidS).updateSettings({
        data: this.salesReportList,
      });
    }
  }
  openItemMasterLookUp() {
    this.isServerSearch = true;
    this.lookupColumns = ['Item', 'Item ID'];
    // this.dataList = this.itemLookup;
    this.showItemMasterLookUp = true;
    this.onSearchItemMaster('');
  }

  GetSalesmanMasterGroup() {

    if (this.Salesman.length > 0) return;
    this.utilityService.LoadSaleManDropdown().subscribe((m: any) => {
      this.Salesman = m.resultSet.saleManList?.map((kl: any) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.Salesman.unshift({
        label: '--Select Sales Man--',
        value: -1,
      });
    });
  }

  onSearchItemMaster(term: string) {
    this.dataList = [];
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
        this.ItemMasterArray = m.resultSet.itemMaster;
        this.ItemMasterList = m.resultSet.itemMaster?.map((kl: any) => ({
          sales: kl?.itemMasterItemName,
          salesId: kl?.itemMasterItemId,
        }));
        this.dataList = this.itemSetLookup;
      });
  }

  get itemSetLookup() {
    return this.ItemMasterArray?.map((kl) => ({
      sales: kl?.itemMasterItemName,
      salesId: kl?.itemMasterItemId,
    }));
  }

  selectedItem(evt) {
    this.itemId = evt?.salesId;
    this.itemName = evt?.sales;
    this.showItemMasterLookUp = false;
  }

  hide(evt: boolean) {
    this.showItemMasterLookUp = false;
  }

  newEntry() {
    this.btnFlag.cancel = false;
    this.temp();
  }

  cancelAll() {
    this.invoiceType = '';
    this.invoiceType = null;
    this.dateFrom = null;
    this.dateTo = null;
    this.enableDate = false;
    this.department = '';
    this.brand = '';
    this.customer = null;
    this.itemId = null;
    this.itemName = null;
    this.itemGroup = null;
    this.selectedSalesMan = null;
    this.location = null;
    this.hotRegisterer.getInstance(this.hotidD).updateSettings({
      data: [],
    });
    this.hotRegisterer.getInstance(this.hotidS).updateSettings({
      data: [],
    });
  }

  temp() {
    this.messageService.add({
      severity: 'success',
      summary: 'Alert',
      detail: 'Receipt Voucher Updated Succesfully',
    });
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to save voucher?',
      accept: () => {
        alert('Working');
      },
    });
  }
}

interface BtnFlag {
  new?: boolean;
  edit?: boolean;
  cancel?: boolean;
  delete?: boolean;
  save?: boolean;
  list?: boolean;
}

// For Detail Report
export const detailColumnObjList = (component: SalesReportComponent) => [
  {
    data: 'voucherNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Sales Voucher Number',
  },
  {
    data: 'voucherDate',
    type: 'date',
    label: 'Voucher Date',
    toolTip: 'Transaction Date',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'PartNo',
    toolTip: 'Item Part Number',
    width: 80,
  },
  {
    data: 'saleman',
    type: 'text',
    label: 'Sales Man',
    toolTip: 'Salesperson Name',
  },
  {
    data: 'matDes',
    type: 'text',
    label: 'Item Description',
    toolTip: 'Item Description',
  },
  {
    data: 'unitDes',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit of Measurement',
  },
  {
    data: 'QuantitySold',
    type: 'numeric',
    label: 'Quantiy Sold',
    toolTip: 'Quantity Sold',
    readOnly: false,
  },
  {
    data: 'baseUnit',
    type: 'text',
    label: 'QTY (Base Unit)',
    toolTip: 'Quantity in Base Unit',
  },
  {
    data: 'unitPrice',
    type: 'numeric',
    label: 'Unit Price',
    toolTip: 'Unit Price',
    readOnly: false,
  },
  {
    data: 'grossAmt',
    type: 'numeric',
    label: 'Gross Amount',
    toolTip: 'Gross Amount',
    width: 80,
  },
  {
    data: 'discount',
    type: 'numeric',
    label: 'Discount',
    toolTip: 'Discount Amount',
    width: 80,
    readOnly: false,
  },
  {
    data: 'netAmount',
    type: 'numeric',
    label: 'Net Amount',
    toolTip: 'Net Amount',
    width: 80,
  },
];

// For Summary Report
export const summaryColumnObjList = (component: SalesReportComponent) => [
  {
    data: 'voucherNo',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Sales Voucher Number',
  },
  {
    data: 'voucherDate',
    type: 'date',
    label: 'Voucher Date',
    toolTip: 'Transaction Date',
  },
  {
    data: 'voucherType',
    type: 'text',
    label: 'Voucher Type',
    toolTip: 'Type of Voucher',
  },
  {
    data: 'customerName',
    type: 'text',
    label: 'Customer',
    toolTip: 'Customer Name',
  },
  {
    data: 'saleman',
    type: 'text',
    label: 'Sales Man',
    toolTip: 'Salesperson Name',
  },
  {
    data: 'grossAmount',
    type: 'numeric',
    label: 'Gross Amount',
    toolTip: 'Total Gross Amount',
    width: 80,
  },
  {
    data: 'discount',
    type: 'numeric',
    label: 'Discount',
    toolTip: 'Total Discount',
    width: 80,
    readOnly: false,
  },
  {
    data: 'vatAmount',
    type: 'numeric',
    label: 'VAT Amount',
    toolTip: 'VAT Amount',
    width: 80,
  },
  {
    data: 'salRetAmt',
    type: 'numeric',
    label: 'Round Off',
    toolTip: 'Round Off Amount',
    width: 80,
  },
  {
    data: 'netAmount',
    type: 'numeric',
    label: 'Net Amount',
    toolTip: 'Net Amount',
    width: 80,
  },
];
