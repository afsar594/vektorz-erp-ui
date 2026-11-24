import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-po-approval-status',
  templateUrl: './po-approval-status.component.html',
  styleUrls: ['./po-approval-status.component.scss']
})
export class PoApprovalStatusComponent implements OnInit {

  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  Date: Date;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
   index: number = 0;
  ScreenId: number;
  Permission:any;
  handleChange(e) {
   this.index = e.index;
 }

 hotid = 'poapprovalstatus';
 private hotRegisterer = new HotTableRegisterer();
 poapprovalstatus: Handsontable.GridSettings;
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private permission: PermissionsService,
    private utilityService:UtilityService
  ) { 
  
  }
  
  ngOnInit(): void { 
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Purchase Order Approval Status') {
          this.Permission = {
            Allow: res?.workGroupPermissionsUallow,
            Add: res?.workGroupPermissionsUadd,
            Delete: res?.workGroupPermissionsUdelete,
            Edit: res?.workGroupPermissionsUedit,
            Print: res?.workGroupPermissionsUprint,
            View: res?.workGroupPermissionsUview
          };
        }
      });   
    })
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";
      
    });
    this.initializeControls()
  }
  initializeControls() {
  this.poapprovalstatus = this.utilityService.getTableConfig(poApprovalStatusColumnObjList(this), []);
  
}
  

}

// Complete column configuration including all possible columns
export const poApprovalStatusColumnObjList = (component:PoApprovalStatusComponent)=>[
  {
    data: 'A.',
    type: 'numeric',
    label: 'A',
    toolTip: 'Approval Indicator'
  },
  {
    data: 'Material',
    type: 'numeric',
    label: 'Material',
    toolTip: 'Material Code/Description'
  },
  {
    data: 'Unit',
    type: 'numeric',
    label: 'Unit',
    toolTip: 'Unit of Measurement'
  },
  {
    data: 'Qty',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity Ordered'
  },
  {
    data: 'Rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Unit Rate'
  },
  {
    data: 'Amount',
    type: 'numeric',
    label: 'Amount',
    toolTip: 'Total Amount'
  },
  {
    data: 'Date',
    type: 'numeric',
    label: 'Date',
    toolTip: 'Approval/Order Date'
  },
  {
    data: 'Remarks',
    type: 'numeric',
    label: 'Remarks',
    toolTip: 'Approval Remarks'
  }
];

