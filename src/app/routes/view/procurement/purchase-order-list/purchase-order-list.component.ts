import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MenuItem } from 'primeng';
import { element } from 'protractor';
import { PurchaseOrderListResponseModal } from 'src/app/routes/domain/Masters/PurchaseOrderListResponseModal';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ProcurementService } from 'src/app/routes/service/procurement/procurement.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.scss']
})
export class PurchaseOrderListComponent implements OnInit {
  Permission: any;
  ScreenId: number;

  constructor(
    private procurementApi: ProcurementService,
    private masterApi: MasterApiService,
    private activatedroute: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private permission: PermissionsService,
    private utilityService:UtilityService

  ) { }

  breadcumbmodel: MenuItem[];
  licensekey: string;
  title: string;
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.companyDetails = this.permission.getStation();
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
    })

    //this.getCompanyDetails();
    this.breadcumbmodel = this.router.url.slice(1).split('/').map((k) => ({ label: k }));
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
    });
    this.licensekey = defaults.hotlicensekey;
    this.initializeControls();
  }


  purchaseOrderList: Handsontable.GridSettings;
  initializeControls() {
    this.purchaseOrderList = this.utilityService.getTableConfig(purchaseOrderListColumnObjList(this), []);
  
  }



  hotid: string = 'PurchaseOrderListTable';
  purchaseOrderListArray: Array<PurchaseOrderListResponseModal> = [];
  getAllPurchaseOrderList() {
    this.procurementApi.getAllPurchaseOrderList().subscribe((response: any) => {
      this.purchaseOrderListArray = response;
      this.purchaseOrderList.data = response;
      this.purchaseOrderListArray.forEach(element => {
        element.purchase_Order_PO_Date = String(element.purchase_Order_PO_Date).split('T')[0];
      })
    });
  }

  companyDetails: any;
  getCompanyDetails() {
    this.masterApi.getCompanyDetails().subscribe((response) => {
      this.companyDetails = response[0];
      console.table(response);
    });
  }
}
export const purchaseOrderListColumnObjList = (component:PurchaseOrderListComponent)=> [
  {
    data: 'purchase_Order_PO_ID',
    type: 'text',
    label: 'PO ID',
    toolTip: 'Purchase Order ID'
  },
  {
    data: 'purchase_Order_PO_Date',
    type: 'text',
    label: 'PO Date',
    toolTip: 'Purchase Order Date'
  },
  {
    data: 'purchase_Order_PO_NO',
    type: 'text',
    label: 'PO No.',
    toolTip: 'Purchase Order Number'
  },
  {
    data: 'suppliers_Master_Supplier_Name',
    type: 'text',
    label: 'Supplier Name',
    toolTip: 'Supplier Name'
  },
  {
    data: 'job_Master_Job_Name',
    type: 'text',
    label: 'Job Name',
    toolTip: 'Associated Job Name'
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No.',
    toolTip: 'Item Part Number'
  },
  {
    data: 'purchase_Order_Details_Material_Description',
    type: 'text',
    label: 'Mat Description',
    toolTip: 'Material Description'
  },
  {
    data: 'purchase_Order_Details_Quantity',
    type: 'text',
    label: 'Qty',
    toolTip: 'Ordered Quantity'
  },
  {
    data: 'purchase_Order_Details_Rate',
    type: 'text',
    label: 'Rate',
    toolTip: 'Unit Rate'
  },
  {
    data: 'purchase_Order_Details_Amount',
    type: 'text',
    label: 'Amount',
    toolTip: 'Total Amount'
  }
];