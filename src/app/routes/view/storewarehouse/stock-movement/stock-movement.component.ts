import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService, SelectItem } from 'primeng';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { ItemMaster } from 'src/app/routes/domain';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { StockFilterModel } from 'src/app/routes/domain/Masters/StockFilterModel';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { StorewarehousesApiService } from 'src/app/routes/service/storewarehouse.api.services';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PreviousRouteService } from 'src/app/routes/service/common/previous-route.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { StationMaster } from '../../../domain/Administration/StationMaster';

@Component({
  selector: 'app-stock-movement',
  templateUrl: './stock-movement.component.html',
  styleUrls: ['./stock-movement.component.scss'],
})
export class StockMovementComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  locations: any = [];
  // stockMovement: Handsontable.GridSettings;
  stockMovementFormGroup: FormGroup;
  stockMovementDetailFormGroup: FormGroup;
  cols: any;
  loading = false;
  btnFlag: ButtonFlag;
  selectedItem: any = null;
  selectedGroup: any = null;
  itemGroup: SelectItem[] = [];
  state: any;
  itemMasterGroup: ItemMaster[] = [];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  MainItemMasterList: any[] = [];

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  DefLocation: string;
  DefLocationCheck: string;
  // stockMovement: any;
  StockFilter: StockFilterModel = new StockFilterModel();
  subjectDatSet: any[] = [];
  stockoutDataSet: any[] = [];
  stockInDataSet: any[] = [];
  itemId: any;
  fromDate: any;
  dateTo: any;
  ScreenId: number;
  pdfSource: any;
  Permission: any;
  user: any;
  Stocklocation: string;
  StockitemGroup: any;
  originalDataSet: any[] = [];
    stationmasterObj: StationMaster;

  displayNarrationDialog: boolean = false;
  fullNarrationText: string = '';
    rptFilter: ReportFilterModel;
  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    private crystalReportService: CrystalReportService,
    private stockapi: StockApiService,
    private storewarehouseapi: StorewarehousesApiService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private masterapi: MasterApiService,
    private previousRouteService: PreviousRouteService,
    private ngZone: NgZone,
    private formatDateService: ReportDateFormatService

  ) {
    this.licensekey = defaults.hotlicensekey;
    this.locations = [];
  }
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
          this.stationmasterObj = this.permission.getStation();
    this.itemId = window.sessionStorage.getItem('StockItemId');
    window.sessionStorage.removeItem('StockItemId');
    this.fromDate = window.sessionStorage.getItem('StockFromDate');
    window.sessionStorage.removeItem('StockFromDate');
    this.dateTo = window.sessionStorage.getItem('StockToDate');
    window.sessionStorage.removeItem('StockToDate');
    this.Stocklocation = window.sessionStorage.getItem('Stocklocation');
    window.sessionStorage.removeItem('Stocklocation');
    this.StockitemGroup = window.sessionStorage.getItem('StockitemGroup');
    window.sessionStorage.removeItem('StockitemGroup');

    if (this.itemId) {
      this.StockFilter.itemId = parseInt(this.itemId);
      if (this.fromDate) {
        this.StockFilter.fromDate = new Date(this.fromDate);
      } else {
        this.StockFilter.fromDate = new Date(new Date()); //.setFullYear(new Date().getFullYear() - 5));
      }
      if (this.dateTo) {
        this.StockFilter.toDate = new Date(this.dateTo);
      } else {
        this.StockFilter.toDate = new Date();
      }
      this.getStockMovementReport();
    }

    this.stockMovementFormGroup = new FormGroup({
      //itemCode: new FormControl('',Validators.required),
      itemCodeB: new FormControl(''),
      // date: new FormControl(null,Validators.required),
      dateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      dateTo: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      itemName: new FormControl(''),
      location: new FormControl(''),
      narration: new FormControl('')
      //Salesman: new FormControl('',Validators.required),
      //Job: new FormControl('',Validators.required),
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls1();
    this.initializeControls2();
    this.storewarehouseapi.StockLedger_LoadDropdown().subscribe((m) => {
      // itemgroup
      this.itemGroup = m.resultSet.itemMasterGroup;
      this.itemGroup = m.resultSet.itemMasterGroup.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.itemGroup.unshift({
        label: '--Select Item Group--',
        value: -1,
      });
      // item
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
        partNo: kl.itemMasterPartNo,
        stock: kl.itemMasterStockType,
        barcode: kl.itemMasterBarcode,
        AccNo: kl.itemMasterAccountNo,
      }));
      this.MainItemMasterList = this.ItemMasterList;
      this.ItemMasterList.unshift({
        label: '--Select Item --',
        value: -1,
      });

      // location
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select location--', value: -1 });
    });
    this.stockMovementDetailFormGroup = new FormGroup({
      openQty: new FormControl('0'),
      openAmount: new FormControl('0.000'),
      receivedQty: new FormControl('0'),
      receivedAmount: new FormControl('0.000'),
      issueQty: new FormControl('0'),
      issueAmount: new FormControl('0.000'),
      InQty: new FormControl('0'),
      InAmount: new FormControl('0.000'),
      closeQty: new FormControl('0'),
      closeAmount: new FormControl('0.000'),
      OutQty: new FormControl('0'),
      OutAmount: new FormControl('0.000'),
      // narration: new FormControl('')
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    if (this.Stocklocation) {
      this.stockMovementFormGroup
        .get('location')
        ?.setValue(Number(this.Stocklocation));
    }
    if (this.StockitemGroup) {
      this.stockMovementFormGroup
        .get('itemCodeB')
        ?.setValue(Number(this.StockitemGroup));
    }
    if (this.itemId) {
      this.stockMovementFormGroup
        .get('itemName')
        ?.setValue(Number(this.itemId));
    }
    if (this.dateTo) {
      this.stockMovementFormGroup
        .get('dateFrom')
        ?.setValue(new Date(this.fromDate));
      this.stockMovementFormGroup
        .get('dateTo')
        ?.setValue(new Date(this.dateTo));
    } else {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      this.stockMovementFormGroup.get('dateFrom')?.setValue(firstDayOfMonth);
      this.stockMovementFormGroup.get('dateTo')?.setValue(new Date());
    }
    this.getDefaultLocation();


this.stockMovementFormGroup.get('narration')?.valueChanges.subscribe((value: string) => {
      if (value && value.length > 2) {
        const searchTerm = value.toLowerCase();
        this.subjectDatSet = this.originalDataSet.filter((item) => 
          item.narration && item.narration.toLowerCase().includes(searchTerm)
        );
      } else {
        this.subjectDatSet = [...this.originalDataSet];
      }
      this.updateSummaryTotals();
    });
  }
  get f() {
    return this.stockMovementFormGroup.controls;
  }

  hotid2 = 'stockout';
  private hotRegisterer = new HotTableRegisterer();
  stockout: Handsontable.GridSettings;
  stockoutData: any[] = [];
  initializeControls2() {
    this.stockout = this.utilityService.getTableConfig(
      stockOutColumnList(this),
      [],
      { minRows: 2, height: '150px' }
    );
  }

  hotid1 = 'stockin';
  // private hotRegisterer = new HotTableRegisterer();
  stockin: Handsontable.GridSettings;
  stockinData: any[] = [];
  initializeControls1() {
    this.stockin = this.utilityService.getTableConfig(
      stockInColumnList(this),
      [],
      { minRows: 2, height: '150px' }
    );
  }

  // ColumnSum() {
  //   if (this.stockMovement.data.length > 0) {
  //     const sum1 = this.stockMovement.data?.filter(item => item.hasOwnProperty('credit'))
  //       .reduce((sum, current:any) => sum + current.credit, [0]);
  //     this.stockMovementFormGroup.controls.ReceiptVoucherMasterDrAmount.setValue(sum1);
  //   }
  // }

  //  this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Receipt Voucher Saved Succesfully' });

  showMaximizableDialog() {
    this.displayMaximizable = true;
  }
  getDefaultLocation() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULT_LOCATION')
      .subscribe((data) => {
        if (data !== null) {
          // console.log(data,'Please Check');
          this.DefLocationCheck = data.result[0].generalSettingsTextValue;
          if (this.DefLocationCheck !== null) {
            const splitText = this.DefLocationCheck.split('::');
            this.DefLocation = splitText[1].trim();
            this.f.location.setValue(Number(this.DefLocation));
          }
        }
      });
  }
  onItemGroupChange(event: any): void {
    const selectedValue = event.value;
    if (selectedValue > 1) {
      this.ItemMasterList = this.MainItemMasterList?.filter(
        (x) => x.AccNo == selectedValue
      );
    } else {
      this.ItemMasterList = this.MainItemMasterList;
    }
    // Perform your logic here based on the selected value
  }
  handleChange(e) {
    this.index = e.index;
  }
  stockReportList: Array<StockMovementComponent> = [];
  getStockMovement() {
    //console.log("form value",this.currencyFormGroup.value)
    //this.selectedGroup = this.currencyFormGroup.get('stockRepostGroupId').value;

    // Default state object
    this.state = {
      Dir: '',
      Field: '',
      Skip: 0,
      Take: 10000,
      Search: '',
      Filter: this.getFilter(),
    };
    this.getStockMovementReport();
  }
getStockMovementReport() {
  this.stockapi.getStockMovement(this.StockFilter).subscribe((response) => {
    if (response.status == 'Success') {
      this.originalDataSet = response.result.stockRegisterResponse; 
      
      // --- ADD THIS CHECK ---
      // Get current value of narration field
      const currentNarration = this.stockMovementFormGroup.get('narration')?.value;
      
      // Apply filter immediately if there are more than 2 characters
      if (currentNarration && currentNarration.length > 2) {
        const searchTerm = currentNarration.toLowerCase();
        this.subjectDatSet = this.originalDataSet.filter((item) => 
          item.narration && item.narration.toLowerCase().includes(searchTerm)
        );
      } else {
        // Otherwise load full data
        this.subjectDatSet = [...this.originalDataSet]; 
      }
      // --- END CHECK ---

      this.stockin.data = response.result.stockMovementIn;
      this.stockout.data = response.result.stockMovementOut;

      this.updateSummaryTotals();
    } else {
      this.messageService.add({
        severity: 'Fails',
        summary: 'Alert',
        detail: response.message,
      });
    }
  });
}

  updateSummaryTotals() {
    const rows = this.subjectDatSet ?? [];
    const sum = (field: string) =>
      rows.reduce((total, item) => total + (Number(item?.[field]) || 0), 0);

    const openQty = sum('openQty');
    const openAmount = sum('openQtyAmount');
    const receivedQty = sum('stockIn');
    const receivedAmount = sum('stockInAmount');
    const issueQty = sum('stockOut');
    const issueAmount = sum('stockOutAmount');

    this.stockMovementDetailFormGroup.patchValue({
      openQty: openQty,
      openAmount: openAmount,
      receivedQty: receivedQty,
      receivedAmount: receivedAmount,
      issueQty: issueQty,
      issueAmount: issueAmount,
      closeQty: openQty + receivedQty - issueQty,
      closeAmount: openAmount + receivedAmount - issueAmount,
      InQty: receivedQty,
      InAmount: receivedAmount,
      OutQty: issueQty,
      OutAmount: issueAmount,
    });
  }

  getFilter() {
    var itemId = this.stockMovementFormGroup.get('itemName').value;
    if (itemId == '') {
      this.StockFilter.itemId = null;
    } else {
      this.StockFilter.itemId =
        this.stockMovementFormGroup.get('itemName').value;
    }
    var itemGroupId = this.stockMovementFormGroup.get('itemCodeB').value;
    if (itemGroupId == '') {
      this.StockFilter.itemGroupId = null;
    } else {
      this.StockFilter.itemGroupId =
        this.stockMovementFormGroup.get('itemCodeB').value;
    }
    this.StockFilter.fromDate = this.formatDateService.formatDatetime(
      this.stockMovementFormGroup.get('dateFrom').value,
      true
    );
    this.StockFilter.toDate = this.formatDateService.formatDatetime(
      this.stockMovementFormGroup.get('dateTo').value,
      false
    );
    var locationId = this.stockMovementFormGroup.get('location').value;
    if (locationId == '') {
      this.StockFilter.locationId = null;
    } else {
      this.StockFilter.locationId =
        this.stockMovementFormGroup.get('location').value;
    }

    // this.StockFilter.salemanId=this.stockMovementFormGroup.get('Salesman').value;
    // this.StockFilter.jobId=this.stockMovementFormGroup.get('Job').value;
    return this.StockFilter;
  }

  Cancel() {
    this.selectedItem = null;
    this.stockMovementDetailFormGroup.reset();
    this.stockMovementFormGroup.get('itemName').setValue('');
    this.stockMovementFormGroup.get('itemCodeB').setValue('');
    this.stockMovementFormGroup.get('location').setValue('');
    this.ItemMasterList = this.MainItemMasterList;
    this.subjectDatSet = [];
    this.stockin.data = null;
    this.stockout.data = null;
    this.updateSummaryTotals();
  }

  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    // Clear the cell
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.sr != null) {
      // Create the button element
      const button = document.createElement('a');
      button.className = 'iconbton';
      button.innerHTML = '<i class="pi pi-eye"></i>';
      button.addEventListener('click', () => {
        this.ngZone.run(() => {
          this.viewAction(instance.getSourceDataAtRow(row));
        });
      });

      // Append the button to the cell
      td.appendChild(button);
    }
    // Center align the cell content
    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }

  showNarration(text: string) {
  if (text && text.length > 30) {
    this.fullNarrationText = text;
    this.displayNarrationDialog = true;
  }
}

  viewAction(data) {
    if (data.transType === 'PurchaseVoucher' && data.ref_Vocher_No != null) {
      const voucherId = data.ref_Vocher_No;
      this.router.navigateByUrl(
        `/procurement/purchasevoucher?pvNo=${voucherId}&menu=175`
      );
    } else if (data.transType === 'SalesReturn' && data.ref_Vocher_No != null) {
      const voucherId = data.ref_Vocher_No;
      this.router.navigateByUrl(`/sale/salesreturn?id=${voucherId}&menu=10`);
    } else if (
      data.transType === 'IssueVoucher' &&
      data.ref_Vocher_No != null
    ) {
      const voucherId = data.ref_Vocher_No;
      this.router.navigateByUrl(
        `/storewarehouse/issuevoucher?id=${voucherId}&menu=110`
      );
    } else if (
      data.transType === 'SalesVoucher' &&
      data.ref_Vocher_No != null
    ) {
      const voucherId = data.ref_Vocher_No;
      this.router.navigateByUrl(`/sale/salesvoucher?svNo=${voucherId}&menu=9`);
    } else if (
      data.transType === 'PurchaseReturn' &&
      data.ref_Vocher_No != null
    ) {
      const voucherId = data.ref_Vocher_No;
      this.router.navigateByUrl(
        `/procurement/purchasereturn?id=${voucherId}&menu=176`
      );
    } else if (data.transType === 'DamageEntry' && data.ref_Vocher_No != null) {
      const voucherId = data.ref_Vocher_No;
      this.router.navigateByUrl(
        `/storewarehouse/damageentry?id=${voucherId}&menu=134`
      );
    }
     else if (
      data.transType === 'debitnote' &&
      data.ref_Vocher_No != null
    ) {
      const voucherId = data.ref_Vocher_No;
      this.router.navigateByUrl(`/account/debitnote?svNo=${voucherId}&menu=9`);
    }
     else if (
      data.transType === 'OpeningStockVoucher' &&
      data.ref_Vocher_No != null
    ) {
      const voucherId = data.ref_Vocher_No;
      this.router.navigateByUrl(`/storewarehouse/openingstock?OsNo=${voucherId}&menu=137`);
    }   
    else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Voucher No does not exist.',
      });
    }
  }

  navigateBack(): void {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
    } else {
      // If there's no previous URL, navigate to a default route
      this.router.navigate(['/dashboard']);
    }
  }
  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }
  userTrackingLog(type) {
    let req = {
      page: 'StockMovement',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.stockMovementFormGroup.get(' ').value,
      vpType: 'StockMovement',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }
 getPOReport() {
    this.rptFilter = {
      ReportName: 'crptStockMovementReport',
      SelectionFormula: '',
     Parameters: [
       {
    Key: '@StartDate',
    Value: this.GetDate(this.stockMovementFormGroup.get('dateFrom')?.value)
  },
  {
    Key: '@EndDate',
    Value: this.GetDate(this.stockMovementFormGroup.get('dateTo')?.value)
  },
  {
    Key: '@MaterialID',
    Value: this.stockMovementFormGroup.get('itemName')?.value
  },
  {
    Key: '@LocationID',
    Value: this.stockMovementFormGroup.get('location')?.value
  },
  {
    Key: 'CompanyName',
    Value: this.stationmasterObj?.stationMasterStationName
  },
  {
    Key: 'DateCriteria',
    Value: ` ${this.GetDateFormated(this.stockMovementFormGroup.get('dateFrom')?.value)} to ${this.GetDateFormated(this.stockMovementFormGroup.get('dateTo')?.value)}`
  },
  {
    Key: 'ItemName',
    Value: this.stockMovementFormGroup.get('itemName')?.value
  },
  {
    Key: 'Location',
    Value: ' test'
  }
],
      Queries: [
        `select * from VR_PurchaseOrder where VR_PurchaseOrder.purchaseorderno ='${
          this.stockMovementFormGroup.get('itemName').value}'`,
      ],
           SP_Queries: [{
        "SP_Name": "GetStockMovementReport",
        "Parameters": [
          {
            Key: "@StartDate",
            Value: this.GetDate(this.stockMovementFormGroup.get('dateFrom')?.value)
          },
          {
            Key: "@EndDate",
            Value: this.GetDate(this.stockMovementFormGroup.get('dateTo')?.value)
          },
     {
            Key: '@MaterialID',
            Value: this.stockMovementFormGroup.get('itemName')?.value
     },
  {
    Key: '@LocationID',
    Value: this.stockMovementFormGroup.get('location')?.value
  },      

        ]
      }],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, false)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }
GetDateFormated(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return dd + '/' + mm + '/' + yyyy;
}
}

interface GridData {
  transType?: string;
  ref_Vocher_No?: number;
  voucher_Date?: string;
  stock_Register_Unit?: string;
  location?: string;
  rate?: number;
  qty?: number;
  qtyAmount?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const stockInColumnList = (component: StockMovementComponent) => [
  // {
  //   data: 'sr',
  //   type: 'numeric',
  //   label: 'Sr.',
  //   toolTip: 'Serial Number',
  // },
  {
    data: 'transType',
    type: 'text',
    label: 'Vch.Type',
    toolTip: 'Voucher Type',
  },
  {
    data: 'ref_Vocher_No',
    type: 'text',
    label: 'Vch.No',
    toolTip: 'Voucher Number',
  },
  {
    data: 'voucher_Date',
    type: 'date',
    label: 'Vch.Date',
    toolTip: 'Voucher Date',
  },
  {
    data: 'unit',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit',
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Rate',
  },
  {
    data: 'qtyAmount',
    type: 'numeric',
    label: 'Amt',
    toolTip: 'Amount',
  },
  {
    data: 'location',
    type: 'text',
    label: 'Location',
    toolTip: 'Location',
  },
  {
    data: null,
    renderer: component.buttonRenderer.bind(component),
    label: 'View',
    toolTip: 'View',
  },
];
export const stockOutColumnList = (component: StockMovementComponent) => [
  // {
  //   data: 'sr',
  //   type: 'numeric',
  //   label: 'Sr.',
  //   toolTip: 'Serial Number',
  // },
  {
    data: 'transType',
    type: 'text',
    label: 'Vch.Type',
    toolTip: 'Voucher Type',
  },
  {
    data: 'ref_Vocher_No',
    type: 'text',
    label: 'Vch.No',
    toolTip: 'Voucher Number',
  },
  {
    data: 'voucher_Date',
    type: 'date',
    label: 'Vch.Date',
    toolTip: 'Voucher Date',
    readOnly: true,
  },
  {
    data: 'unit',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit',
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Rate',
  },
  {
    data: 'qtyAmount',
    type: 'numeric',
    label: 'Amt',
    toolTip: 'Amount',
  },
  {
    data: 'location',
    type: 'text',
    label: 'Location',
    toolTip: 'Location',
  },
  {
    data: null,
    renderer: component.buttonRenderer.bind(component),
    label: 'View',
    toolTip: 'View',
  },
];
