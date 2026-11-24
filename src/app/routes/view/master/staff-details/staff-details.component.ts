import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { MenuItem } from 'primeng';
import { defaults } from 'src/app/shared/service/settings';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.scss']
})
export class StaffDetailsComponent implements OnInit {

  title:string = '';
  subtitle:string = '';
  database:any;
  licensekey:any;
  gridHeader:string = '';
  index: number = 0;
  ScreenId: number;
  Permission: any;
handleChange(e) {
  this.index = e.index;
  this.initializeControls();
}
hotid = 'detail';
private hotRegisterer = new HotTableRegisterer();
detail: Handsontable.GridSettings;
initializeControls() {
  this.detail= {
    rowHeaders: true,
    viewportColumnRenderingOffset: 27,
    viewportRowRenderingOffset: 'auto',
    colWidths: [70],
    minRows: 3,
    width: '100%',
    height: 300,
    rowHeights: 23,
    fillHandle: {
    direction: 'vertical',
    autoInsertRow: true
    },
    data: [],
    minSpareRows: 1,
    allowInsertRow: true,
    // allowInsertColumn: false,
    // allowRemoveColumn: false,
    // allowRemoveRow: false,
    // autoWrapRow: false,
    // autoWrapCol: false,
    //  autoWrapRow: true,
    // height: 487,
    // maxRows: 22,
    stretchH: "all",
    manualRowResize: true,
    manualColumnResize: true,
    columns: [
      {
        data: 'Skill',
        type: 'text',
      }


    ],
    colHeaders: [
      this.translate.instant('Skill'),

    ],
    manualRowMove: true,
    manualColumnMove: true,
    contextMenu: true,
    filters: true,
    dropdownMenu: true,
  }
}


  constructor(
    private activatedroute: ActivatedRoute,
    private router: Router,
    private translate:TranslateService,
    private permission: PermissionsService,

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
    })
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";
    });
    this.initializeControls();
  }
}
