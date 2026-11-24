import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import {
  ChartofAccounts,
  ReceiptVoucher,
  ReceiptVoucherDetails,
} from 'src/app/routes/domain';
import { HotTableRegisterer } from '@handsontable/angular';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
// import * as $ from 'jquery';

import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
@Component({
  selector: 'app-stockmovementreport',
  templateUrl: './stockmovementreport.component.html',
  styleUrls: ['./stockmovementreport.component.scss'],
})
export class StockmovementreportComponent implements OnInit {
  dataset: any;
  list: any;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  vchDetailsResponse: any;
  vchDetailsResponseTemp: any;
  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  receiptVoucherarry: ReceiptVoucher[] = [];
  savedReceiptVoucher: ReceiptVoucher;

  datedFrom: any = '';
  datedTo: any = '';

  private hotRegisterer = new HotTableRegisterer();
  hotid = 'receiptVouchrEntry';
  ScreenId: number;
  Permission: any;
  user: any;

  constructor(
    private activatedroute: ActivatedRoute,
    private stockApi: StockApiService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    private utilityService: UtilityService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  stockmovementrpt: Handsontable.GridSettings;
  stockmovementrptDtls: Handsontable.GridSettings;
  stockMovementRptFormGroup: FormGroup;
  stockMovementRptFormGroupGeneral: FormGroup;

  cols: any;
  submitButtons: boolean;
  enableFields: boolean;
  ItemFromStockLedger: any;
  receivedItem: any;
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
    this.submitButtons = false;
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k })); /////    Setting BreadCrumbs
    this.activatedroute.data.subscribe((data) => {
      /////    Setting Title and Subtitle
      this.title = data.title;
    });
    this.cols = [
      //////    Setting Table cols
      { field: 'Item_Master_Item_ID', header: 'Item Id' },
      { field: 'Item_Master_Item_Name', header: 'Item Name' },
      { field: 'Item_Master_Part_No', header: 'Item Part No' },
      { field: 'Item_Master_Barcode', header: 'Item Barcode' },
    ];
    this.enableFields = false;
    this.btnFlag = {
      new: false,
      edit: true,
      cancel: true,
      save: true,
      update: true,
      delete: true,
      print: true,
    }; ///// Setting Buttons
    this.initializeControls();
    this.stockMovementRptFormGroupGeneral = new FormGroup({
      stockMovementRptItemGroup: new FormControl('', Validators.required),
      stockMovementRptDetailType: new FormControl('', Validators.required),
      stockMovementRptDetails: new FormControl('Details', Validators.required),
      stockMovementRptSalesMan: new FormControl('', Validators.required),
      stockMovementRptItemName: new FormControl('', Validators.required),
      stockMovementRptLocation: new FormControl('', Validators.required),
      stockMovementRptJob: new FormControl('', Validators.required),
      stockMovementRptDateFrom: new FormControl('', Validators.required),
      stockMovementRptDateTo: new FormControl('', Validators.required),
    });
    this.stockMovementRptFormGroup = this.fb.group({
      stockMovementRptOpenQty: new FormControl(''),
      stockMovementRptOpenAmount: new FormControl(''),
      stockMovementRptCloseQty: new FormControl(''),
      stockMovementRptCloseAmount: new FormControl(''),
    });
    this.receivedItem = localStorage.getItem('itemList');
    if (this.receivedItem != null) {
      this.btnFlag.edit = false;
      this.btnFlag.cancel = false;
      this.btnFlag.save = false;
      this.btnFlag.delete = false;
      this.btnFlag.print = false;
      this.ItemFromStockLedger = JSON.parse(localStorage.getItem('itemList'));
      if (this.ItemFromStockLedger.length > 0) {
        this.getStockVchDetails(
          this.ItemFromStockLedger[0].item_Master_Item_ID
        ); ////////Changes Needed
        setTimeout(() => {
          // $("#itemGroup").val(this.ItemFromStockLedger[0].item_Master_Item_ID);
          // $("#itemName").val(this.ItemFromStockLedger[0].item_Master_Item_Name);
        }, 300);
      }
    }
    this.datedFrom = new Date(
      new Date().setFullYear(new Date().getFullYear() - 5)
    ); /////   Setting Defaults for Date
    this.datedTo = new Date();
  }
  //// Check for the new API
  getStockVchDetails(itemId: any) {
    this.stockApi
      .getStockVchDetails({ itemGroup: new String(itemId) })
      .subscribe((data) => {
        // this.vchDetailsResponseTemp = data;
        this.vchDetailsResponse = data[0];
        setTimeout(() => {
          this.ItemFromStockLedger = data[0];
          let itemDetails = JSON.parse(localStorage.getItem('itemList'));
          this.ItemFromStockLedger.item_Name =
            itemDetails[0]?.item_Master_Item_Name;
          this.ItemFromStockLedger.totalBal =
            this.ItemFromStockLedger?.stockIn -
            this.ItemFromStockLedger?.stockOut;
          this.ItemFromStockLedger.totalBalAmount =
            this.ItemFromStockLedger?.stockInAmt -
            this.ItemFromStockLedger?.stockOutAmt;

          this.vchDetailsResponse.forEach((element) => {
            element.stock_Register_Voucher_Date =
              element.stock_Register_Voucher_Date.split('T')[0];
          });
        }, 500);
        setTimeout(() => {
          this.hotRegisterer
            .getInstance(this.hotid)
            .updateSettings({ data: this.vchDetailsResponse });
        }, 800);

        // this.vchDetailsResponse = this.vchDetailsResponseTemp.Stock_Register;
      });
  }
  //// Check for the new API
  GetItemList() {
    this.stockApi.getAllItemsList().subscribe(
      (response) => {
        this.dataset = response;
        this.displayMaximizable = true;
      },
      (error) => {}
    );
  }
  //// Check for the new API
  GetItemDetails(id) {
    if (id === null || id.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please provide with a valid id.!',
      });
      return;
    }
    this.displayMaximizable = false;
    this.stockApi
      .getStockMovementDetailsRpt({ ItemMasterItemId: id })
      .subscribe(
        (respose) => {
          this.list = respose;
          this.dataset = this.list.ItemDetails;
          //console.error(this.dataset);
        },
        (error) => {}
      );
  }
  submitStockMovementReport() {
    if (
      this.f1.stockMovementRptItemGroup.invalid ||
      this.f1.stockMovementRptDetailType.invalid ||
      this.f1.stockMovementRptDetails.invalid ||
      this.f1.stockMovementRptSalesMan.invalid ||
      this.f1.stockMovementRptItemName.invalid ||
      this.f1.stockMovementRptLocation.invalid ||
      this.f1.stockMovementRptJob.invalid ||
      this.f1.stockMovementRptDateFrom.invalid ||
      this.f1.stockMovementRptDateTo.invalid
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill all the required feilds.!',
      });
      return;
    }

    ////// Remainig code for saving report
  }
  clearFormGeneral() {
    this.stockMovementRptFormGroupGeneral.controls[
      'stockMovementRptItemGroup'
    ].setValue('');
    this.stockMovementRptFormGroupGeneral.controls[
      'stockMovementRptItemName'
    ].setValue('');
    this.stockMovementRptFormGroupGeneral.controls[
      'stockMovementRptDetailType'
    ].setValue('');
    this.stockMovementRptFormGroupGeneral.controls[
      'stockMovementRptDetails'
    ].setValue('');
    this.stockMovementRptFormGroupGeneral.controls[
      'stockMovementRptSalesMan'
    ].setValue('');
    this.stockMovementRptFormGroupGeneral.controls[
      'stockMovementRptLocation'
    ].setValue('');
    this.stockMovementRptFormGroupGeneral.controls[
      'stockMovementRptJob'
    ].setValue('');
    this.stockMovementRptFormGroupGeneral.controls[
      'stockMovementRptDateFrom'
    ].setValue('');
    this.stockMovementRptFormGroupGeneral.controls[
      'stockMovementRptDateTo'
    ].setValue('');
  }
  handleChange(e) {
    this.index = e.index;
  }
  get f1() {
    return this.stockMovementRptFormGroupGeneral.controls;
  }
  get f() {
    return this.stockMovementRptFormGroup.controls;
  }
  initializeControls() {
    this.stockmovementrpt = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [40, 100, 40, 50],
      minRows: 2,
      width: '100%',
      height: 150,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      // allowInsertColumn: false,
      allowInsertRow: true,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      stretchH: 'all',
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      manualRowResize: true,
      manualColumnResize: true,
      // rowHeaders: true,
      columns: [
        {
          data: 'stock_Register_Material_ID',
          type: 'text',
          readOnly: true,
        },
        {
          data: 'item_Name',
          type: 'text',
        },
        {
          data: 'stock_Register_Unit_ID',
          type: 'text',
          readOnly: true,
        },
        {
          data: 'openQty',
          type: 'numeric',
        },
        {
          data: 'openQtyAmount',
          type: 'numeric',
        },
        {
          data: 'stockIn',
          type: 'numeric',
        },
        {
          data: 'stockInAmt',
          type: 'numeric',
        },
        {
          data: 'stockOut',
          type: 'numeric',
        },
        {
          data: 'stockOutAmt',
          type: 'numeric',
        },
        {
          data: 'totalBal',
          type: 'numeric',
        },
        {
          data: 'totalBalAmount',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Item Id'),
        this.translate.instant('Item Name'),
        this.translate.instant('Unit'),
        this.translate.instant('Open Qty'),
        this.translate.instant('Open Amount'),
        this.translate.instant('SIN Qty'),
        this.translate.instant('SIN Amt'),
        this.translate.instant('Sout Qty'),
        this.translate.instant('Sout Amt'),
        this.translate.instant('Total Bal'),
        this.translate.instant('Total Amt'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.stockmovementrpt.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.stockmovementrpt.afterRemoveRow = (index: number, amount: number) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.stockmovementrpt.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
    this.initializeControlsDtls();
  }
  initializeControlsDtls() {
    this.stockmovementrptDtls = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [100, 100, 150, 100, 100, 100, 100, 120, 120],
      minRows: 2,
      width: '100%',
      height: 150,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      // allowInsertColumn: false,
      allowInsertRow: true,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      stretchH: 'all',
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      manualRowResize: true,
      manualColumnResize: true,
      // rowHeaders: true,
      columns: [
        {
          data: 'stock_Register_Trans_Type',
          type: 'text',
        },
        {
          data: 'stock_Register_Ref_Voucher_No',
          type: 'text',
        },
        {
          data: 'stock_Register_Voucher_Date',
          type: 'text',
        },
        {
          data: 'stock_Register_Unit_ID',
          type: 'text',
        },
        {
          data: 'stock_Register_Rate',
          type: 'text',
        },
        {
          data: 'stockIn',
          type: 'text',
        },
        {
          data: 'stockInAmt',
          type: 'text',
        },
        {
          data: 'stock_Register_Material_ID',
          type: 'text',
        },
        {
          data: 'job',
          type: 'text',
        },
        {
          data: 'stockLocation',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('Vch. Type'),
        this.translate.instant('Vch. No.'),
        this.translate.instant('Vch. Date'),
        this.translate.instant('Unit'),
        this.translate.instant('Rate'),
        this.translate.instant('Qty'),
        this.translate.instant('Amount'),
        this.translate.instant('Itm Group'),
        this.translate.instant('Job'),
        this.translate.instant('Location'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.stockmovementrpt.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.stockmovementrpt.afterRemoveRow = (index: number, amount: number) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.stockmovementrpt.afterValidate = (isValid, value, row, prop) => {
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
    if (this.stockmovementrpt.data.length > 0) {
      const sum1 = this.stockmovementrpt.data?.filter((item) =>
        item.hasOwnProperty('credit')
      );
      //.reduce((sum, current) => sum + current.credit, 0);
      this.stockMovementRptFormGroup.controls.ReceiptVoucherMasterDrAmount.setValue(
        sum1
      );
    }
  }
  newStockMovementReport() {
    this.btnFlag.edit = false;
    this.btnFlag.cancel = false;
    this.btnFlag.save = false;
    this.btnFlag.delete = false;
    this.btnFlag.print = false;
    this.submitButtons = true;
  }
  userTrackingLog(type) {
    let req = {
      page: 'Stockmovement',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.stockMovementRptFormGroupGeneral.get('StockmovementNo').value,
      vpType: 'Stockmovement',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }
}
interface ButtonFlag {
  new?: boolean;
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  print?: boolean;
}
