import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DialogService } from 'primeng/dynamicdialog';
import { SalesServiceService } from 'src/app/routes/service/sales-services/sales-service.service';
import { defaults } from 'src/app/shared/service/settings';
import { ItemMasterListComponent } from './item-master-list/item-master-list.component';
import { DynamicDialogRef } from 'primeng';
import { CustomerSalesOrderListComponent } from './customer-sales-order-list/customer-sales-order-list.component';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import Swal from 'sweetalert2';
import { EntityResponse } from 'src/app/routes/domain/Masters/EntityResponse';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-customer-sale-order',
  templateUrl: './customer-sale-order.component.html',
  styleUrls: ['./customer-sale-order.component.scss'],
})
export class CustomerSaleOrderComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  Date: Date;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  CSOForm: FormGroup;
  locationLocked = false;
  index: number = 0;
  jobDropdown: any[] = [];
  selectedJobDropdown: any;
  customerDropdown: any[] = [];
  selectedCustomerDropdown: any;
  departmentDropdown: any[] = [];
  selectedDepartmentDropdown: any;
  currencyDropdown: any[] = [];
  selectedCurrencyDropdown: any;
  locationDropdown: any[] = [];
  selectedLocationDropdown: any;
  salesManDropdown: any[] = [];
  selectedSalesManDropdown: any;
  unitNames: string[] = [];
  pdfSource: string;
  handleChange(e) {
    this.index = e.index;
  }

  hotid: any = 'CustomerSalesOrder';

  private hotRegisterer = new HotTableRegisterer();
  CustomerSalesOrder: Handsontable.GridSettings;

  initializeControls() {
    this.CustomerSalesOrder = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords.col.valueOf() === 0) {
          // const hot = new Handsontable(document.getElementById('CustomerSalesOrder'), this.CustomerSalesOrder);
          //  var data = hot.getDataAtRow(coords.row);
          this.LoadItemMasterList(coords);

          // hot.alter('insert_row', 2);
          // hot.alter("remove_row", [[0, 1]]);

          //this.newEntry();
        } else if (coords.col.valueOf() === 3) {
          // this.unitListing = true;
        } else if (coords.col.valueOf() === 5) {
        }
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,

      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'itemMasterBatchCode',
          type: 'numeric',
        },
        {
          data: 'PartNo',
          type: 'numeric',
        },
        {
          data: 'Material Name',
          type: 'numeric',
        },
        {
          data: 'itemMasterUnitPrice',
          type: 'autocomplete',
          source: (query, callback) => {
            callback(this.unitNames);
          },
        },
        {
          data: 'Quantity',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'Price',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'Amount',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
        },
        {
          data: 'Remark',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('CODE'),
        this.translate.instant('PartNo'),
        this.translate.instant('Material Name'),
        this.translate.instant('Unit'),
        this.translate.instant('Quantity'),
        this.translate.instant('Price'),
        this.translate.instant('Amount'),
        this.translate.instant('Remark'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private saleService: SalesServiceService,
    private crystalReportService: CrystalReportService,
    private utilityService: UtilityService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef
  ) { }

  SalesOrderFormSubmit() {
    // if(this.CSOForm.invalid){
    //   return;
    // }

    const control = <FormArray>this.CSOForm.get('CustomerOrderDetails');
    const hot = this.hotRegisterer.getInstance(this.hotid);
    const data = hot.getData();
    data.forEach((x) => {
      control.push(
        this.patchValues(x[0], x[1], x[2], x[3], x[4], x[5], x[6], x[7])
      );
    });
    this.saleService
      .AddEditCustomerOrder({
        ...this.CSOForm.value,
        CustomerOrderLocationId: this.CSOForm.get('CustomerOrderLocationId')
          ?.value,
      })
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid && response.result) {
          Swal.fire({
            title: 'Success',
            text: response.message,
            icon: 'success',
          });
        }
      });
  }

  patchValues(code, PartNo, material, unit, quantity, price, amount, remark) {
    return this.fb.group({
      CustomerOrderDetailsCode: [code],
      CustomerOrderDetailsPartNo: [PartNo],
      CustomerOrderDetailsAmount: [amount],
      CustomerOrderDetailsDescription: [remark],
      CustomerOrderDetailsRate: [price],
      CustomerOrderDetailsQuantity: [quantity],
      CustomerOrderDetailsMaterialName: [material],
      CustomerOrderDetailsUnitName: [unit],
    });
  }
  ngOnInit(): void {
    const lockedLocationId = this.utilityService.getLockedLocationId();
    this.CSOForm = this.fb.group({
      Date: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      CustomerOrderLocationId: new FormControl(
        lockedLocationId > 0 ? lockedLocationId : '',
        Validators.required
      ),
      CustomerOrderCustomerId: new FormControl('', Validators.required),
      Department: new FormControl(''),
      Salesman: new FormControl(''),
      Selectjob: new FormControl(''),
      CustomerOrderDescription: new FormControl('', Validators.required),
      CustomerOrderNo: new FormControl(''),
      CustomerOrderDate: new FormControl('', Validators.required),
      CustomerOrderLpoNo: new FormControl('', Validators.required),
      CustomerOrderLpoDate: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      CustomerOrderCurrencyId: new FormControl('', Validators.required),
      Delivery: new FormControl(''),
      CustomerOrderDiscount: new FormControl(2.2, Validators.required),
      CustomerOrderDiscountPercentage: new FormControl(20, Validators.required),
      CustomerOrderDetails: this.fb.array([]),
    });
    // this.CSOForm = new FormGroup({
    //   Date :new FormControl(new Date(new Date().setFullYear(new Date().getFullYear())),Validators.required),
    //   CustomerOrderLocationId :new FormControl('',Validators.required),
    //   CustomerOrderCustomerId :new FormControl('',Validators.required),
    //   Department :new FormControl(''),
    //   Salesman :new FormControl(''),
    //   Selectjob :new FormControl(''),
    //   CustomerOrderDescription :new FormControl('',Validators.required),
    //   CustomerOrderNo :new FormControl('',Validators.required),
    //   CustomerOrderDate :new FormControl('',Validators.required),
    //   CustomerOrderLpoNo :new FormControl('',Validators.required),
    //   CustomerOrderLpoDate :new FormControl(new Date(new Date().setFullYear(new Date().getFullYear())),Validators.required),
    //   CustomerOrderCurrencyId :new FormControl('',Validators.required),
    //   Delivery :new FormControl(''),
    //   CustomerOrderDiscount :new FormControl('',Validators.required),
    //   CustomerOrderDiscountPercentage :new FormControl('',Validators.required),
    //   CustomerOrderDetails: new FormArray([this.initFormGroup()]),
    // });

    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
    this.GetJobMasterDropdown();
    this.GetCustomerMasterDropdown();
    this.GetCurrencyMasterDropdown();
    this.GetDepartmentMasterDropdown();
    this.GetLocationMasterDropdown();
    this.GetUnitMasterDropdown();
  }
  get f() {
    return this.CSOForm.controls;
  }

  rptFilter: ReportFilterModel;
  showPrint() {

    this.rptFilter = {
      ReportName: 'SalesVoucherVAT',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        ` select * from VW_CustomerSalesOrder where CustomerPurchaseOrderId=${this.CSOForm.getRawValue().CustomerOrderDetailsCode}`,
      ],
      SP_Queries: [],

    };

    this.crystalReportService.getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      })
  }


  GetJobMasterDropdown() {
    this.saleService
      .GetJobMasterDropdown()
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.jobDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.id,
          }));
        }
      });
  }

  GetCustomerMasterDropdown() {
    this.saleService
      .GetCustomerMasterDropdown()
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.customerDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.id,
          }));
        }
      });
  }

  GetCurrencyMasterDropdown() {
    this.saleService
      .GetCurrencyMasterDropdown()
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.currencyDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.id,
          }));
        }
      });
  }

  GetDepartmentMasterDropdown() {
    this.saleService
      .GetDepartmentMasterDropdown()
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.departmentDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.id,
          }));
        }
      });
  }

  GetLocationMasterDropdown() {
    this.saleService
      .GetLocationMasterDropdown()
      .subscribe((response: EntityResponse<any>) => {
        const list = response?.result ?? [];
        this.locationDropdown = list.map((data) => ({
          label: data.name,
          value: data.id,
        }));
        this.locationLocked = this.utilityService.applyLocationLock(
          this.CSOForm,
          'CustomerOrderLocationId'
        );
        if (this.locationLocked) {
          const lockedLocationId = this.utilityService.getLockedLocationId();
          const existingLocation = this.locationDropdown?.find(
            (loc: any) => loc.value === lockedLocationId
          );
          if (!existingLocation) {
            this.locationDropdown.unshift({
              label: this.selectedLocationDropdown ?? `${lockedLocationId}`,
              value: lockedLocationId,
            });
          }
        }
      });
  }

  GetSalesManMasterDropdown() {
    this.saleService
      .GetSalesManMasterDropdown()
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.salesManDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.id,
          }));
        }
      });
  }

  GetUnitMasterDropdown() {
    this.saleService
      .GetUnitMasterDropdown()
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          response.result.forEach((element) => {
            this.unitNames.push(element.name);
          });
        }
      });
  }

  GetItemMasterList() {
    this.saleService
      .GetItemMasterList()
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.dataset = response.result;
        }
      });
  }

  LoadItemMasterList(index) {
    const ref = this.dialogService.open(ItemMasterListComponent, {
      data: {
        id: '51gF3',
      },
      header: 'Item Master',
      width: '70%',
    });

    ref.onClose.subscribe(() => {
      const hot = this.hotRegisterer.getInstance(this.hotid);
      const data =
        this.dialogService?.dialogComponentRef?.instance?.componentRef?.instance
          ?.passEntry;
      if (data && hot) {
        hot.setDataAtCell(index.row, 2, data[1]);
        hot.setDataAtCell(index.row, 0, data[2]);
        hot.setDataAtCell(index.row, 1, data[3]);
      }
    });
  }

  LoadCustomerSalesOrderList() {
    const ref = this.dialogService.open(CustomerSalesOrderListComponent, {
      data: {
        id: '51gF3',
      },
      header: 'Choose a Car',
      width: '70%',
    });

    ref.onClose.subscribe(() => {
      const data =
        this.dialogService.dialogComponentRef.instance.componentRef.instance
          .passEntry;
    });
  }

}
