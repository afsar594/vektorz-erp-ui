import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { SelectItem } from 'primeng';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
@Component({
  selector: 'app-customer-order-tracking',
  templateUrl: './customer-order-tracking.component.html',
  styleUrls: ['./customer-order-tracking.component.scss'],
})
export class CustomerOrderTrackingComponent implements OnInit {
  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];
  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];
  title: string;
  subtitle: string;
  index: number = 0;
  ScreenId: number;
  Permission: any;
  defaultValue: any;
  isshow: boolean = true;
  handleChange(e) {
    this.index = e.index;
  }
  CustomerOrderTrackingFormGroup: FormGroup;
  licensekey: any;
  gridHeader: string;
  dataset: any;
  hotid = 'CustomerOrderReport';
  hotidBySummary = 'CustomerOrderReportBySummary';
  filetype = 'Detail'

  private hotRegisterer = new HotTableRegisterer();
  CustomerOrderReport: Handsontable.GridSettings;
  CustomerOrderReportBySummary: Handsontable.GridSettings;


  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private permission: PermissionsService,
    private masterApi: MasterApiService,
    private salesapi: SalesApiService,
    private datePipe: DatePipe,
    private printService: FileSaverService,
    private utilityService: UtilityService
  ) { }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      if (rights) {
        var res = rights[0]
        this.Permission = {
          Allow: res?.workGroupPermissionsUallow,
          Add: res?.workGroupPermissionsUadd,
          Delete: res?.workGroupPermissionsUdelete,
          Edit: res?.workGroupPermissionsUedit,
          Print: res?.workGroupPermissionsUprint,
          View: res?.workGroupPermissionsUview
        };
      }
      this.CustomerOrderTrackingFormGroup = new FormGroup({
        LPONo: new FormControl(null),
        dateFrom: new FormControl(null),
        dateTo: new FormControl(null),
        customerName: new FormControl(null),
        Location: new FormControl(null),
        isDate: new FormControl(),
        type: new FormControl('Detail')
      });
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
    });
    this.CustomerOrderTrackingFormGroup.disable()

    this.laodDropDownList()
    this.initializeControls();
    this.initializeControlsBySummary()
  }
  initializeControls() {
    this.CustomerOrderReport = this.utilityService.getTableConfig(columnDetailList)
  }

  initializeControlsBySummary() {
    this.CustomerOrderReportBySummary = this.utilityService.getTableConfig(columnSummaryList)
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  onDateCheckboxChange(event: any) {
    if (!event.checked) {
      this.CustomerOrderTrackingFormGroup.get('dateFrom').setValue(null);
      this.CustomerOrderTrackingFormGroup.get('dateTo').setValue(null);
    }
  }

  getAllCustomerMaster() {
    this.masterApi.GetAllCustomer().subscribe((k) => {
      this.CustomerMasterArray = k;
      this.CustomerMasterList = k.map((kl) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
            ' -- ' +
            kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({ label: '--Select--', value: -1 });
      this.CustomerMasterArry = k.map(
        (ar) =>
          ar.customerMasterCustomerName?.trim() +
          '|' +
          ar.customerMasterCustomerNo
      );
    });
  }
  getAllLocation() {
    this.masterApi.GetAllLocation().subscribe((k) => {
      this.locationArray = k;
      this.locationList = k.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select--', value: -1 });
      this.locationArry = k.map((ar) => ar.locationMasterLocationName.trim());
    });
  }
  show() {
    if (this.CustomerOrderTrackingFormGroup.get('isDate').value === true) {
      this.defaultValue = {
        type: this.CustomerOrderTrackingFormGroup.value.type,
        isDataChecked: true,
        itemId: null,
        customerName: null,
        isAll: true,
        lpo: null,
        isDeliveryAgainstSales: false,
        customerId:
          this.CustomerOrderTrackingFormGroup.value.customerName === -1
            ? null
            : this.CustomerOrderTrackingFormGroup.value.customerName,
        locacationId:
          this.CustomerOrderTrackingFormGroup.value.Location === -1
            ? null
            : this.CustomerOrderTrackingFormGroup.value.Location,
        dateFrom: this.CustomerOrderTrackingFormGroup.value.dateFrom
          ? this.CustomerOrderTrackingFormGroup.value.dateFrom
          : null,
        dateTo: this.CustomerOrderTrackingFormGroup.value.dateTo
          ? this.CustomerOrderTrackingFormGroup.value.dateTo
          : null,
      };
    } else {
      this.defaultValue = {
        isDataChecked: false,
        type: this.CustomerOrderTrackingFormGroup.value.type,
        itemId: null,
        customerName: null,
        isAll: true,
        lpo: null,
        isDeliveryAgainstSales: false,
        customerId:
          this.CustomerOrderTrackingFormGroup.value.customerName === -1
            ? null
            : this.CustomerOrderTrackingFormGroup.value.customerName,
        locacationId:
          this.CustomerOrderTrackingFormGroup.value.Location === -1
            ? null
            : this.CustomerOrderTrackingFormGroup.value.Location,
        dateFrom: this.CustomerOrderTrackingFormGroup.value.dateFrom
          ? this.CustomerOrderTrackingFormGroup.value.dateFrom
          : null,
        dateTo: this.CustomerOrderTrackingFormGroup.value.dateTo
          ? this.CustomerOrderTrackingFormGroup.value.dateTo
          : null,
      };
    }
    this.salesapi
      .GetPurchaseOrderTracking(this.defaultValue)
      .subscribe((response: any) => {
        this.dataset = response.result;
      });
  }
  clearfilter() {
    this.CustomerOrderTrackingFormGroup.get('customerName').setValue(null);
    this.CustomerOrderTrackingFormGroup.get('Location').setValue(null);
    this.CustomerOrderTrackingFormGroup.get('dateFrom').setValue(null);
    this.CustomerOrderTrackingFormGroup.get('dateTo').setValue(null);
    this.CustomerOrderTrackingFormGroup.get('isDate').setValue(false);
    this.CustomerOrderTrackingFormGroup.enable()
    this.CustomerOrderTrackingFormGroup.controls.dateFrom.disable();
    this.CustomerOrderTrackingFormGroup.controls.dateTo.disable();
    this.dataset = []

    // this.enquiries=[];
  }
  onChange(event: any, control: any) {
    const selectedValue = event.value;
    if (selectedValue != null && control === 'customer') {
      this.CustomerOrderTrackingFormGroup.get('customerName').setValue(
        selectedValue
      );
      //this.show();
    }
    if (selectedValue != null && control === 'location') {
      this.CustomerOrderTrackingFormGroup.get('Location').setValue(
        selectedValue
      );
      //this.show();
    }
  }
  CheckedType(value) {
    this.filetype = value
    if (value == 'Detail') {
      this.initializeControls();
    } else {
      this.initializeControlsBySummary()
    }
  }

  laodDropDownList() {
    this.masterApi.getCustomerlocation().subscribe((m) => {
      this.CustomerMasterList = m.resultSet.customer?.map((kl) => ({
        label: kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({ label: '--Select--', value: -1 });
      this.CustomerMasterArray = m.resultSet.customer;
      this.CustomerMasterArry = m.resultSet.customer;

      this.locationList = m.resultSet.location?.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select--', value: -1 });
      this.locationArry = m.resultSet.location;
      this.locationArray = m.resultSet.location;
    })
  }


  ExportExcel() {

    if (this.filetype == 'Detail') {

      this.printService.exportExcel("CustomerOrderReport", 'CustomerOrderReport.xlsx')

    } else {

      this.printService.exportExcel("CustomerOrderReportBySummary", 'CustomerOrderReportBySummary.xlsx')
    }

  }
}
const columnDetailList = [
  {
    data: 'cpoId',
    type: 'numeric',
    label: 'Order No',
    toolTip: 'Order Number',
  },
  {
    data: 'lpoNo',
    type: 'numeric',
    label: 'LPO No',
    toolTip: 'LPO Number',
  },
  {
    data: 'cpoDate',
    type: 'text',
    label: 'Date',
    toolTip: 'CPO Date',
  },
  {
    data: 'customerName',
    type: 'text',
    label: 'Customer',
    toolTip: 'Customer Name',
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
  },
  {
    data: 'matDes',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
  },
  {
    data: 'unitName',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit Name',
  },
  {
    data: 'quantity',
    type: 'numeric',
    label: 'Odr Qty',
    toolTip: 'Order Quantity',
  },
  {
    data: 'unitPrice',
    type: 'numeric',
    label: 'Price',
  },
  {
    data: 'deliveredQuantity',
    type: 'numeric',
    label: 'Dlv. Qty',
    toolTip: 'Delivered Quantity',
  },
  {
    data: 'balancedQuantity',
    type: 'numeric',
    label: 'Bal. Qty',
    toolTip: 'Balance Quantity',
  }
];

const columnSummaryList = [
  {
    data: 'cpoId',
    type: 'numeric',
    label: 'Order No',
    toolTip: 'Order Number',
  },
  {
    data: 'lpoNo',
    type: 'numeric',
    label: 'LPO No',
    toolTip: 'LPO Number',
  },
  {
    data: 'cpoDate',
    type: 'text',
    label: 'Date',
    toolTip: 'CPO Date',
  },
  {
    data: 'customerName',
    type: 'text',
    label: 'Customer',
    toolTip: 'Customer Name',
  },
  {
    data: 'unitPrice',
    type: 'numeric',
    label: 'Price',
    toolTip: 'Unit Price',
  },
  {
    data: 'deliveredQuantity',
    type: 'numeric',
    label: 'Dlv. Qty',
    toolTip: 'Delivered Quantity',
  },
  {
    data: 'balancedQuantity',
    type: 'numeric',
    label: 'Bal. Qty',
    toolTip: 'Balance Quantity',
  }
];