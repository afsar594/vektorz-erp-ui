import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-depreciationregister',
  templateUrl: './depreciationregister.component.html',
  styleUrls: ['./depreciationregister.component.scss']
})
export class DepreciationregisterComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  index: number = 0;
  ScreenId: number;
  Permission: any;
  handleChange(e) {
    this.index = e.index;
  }
  licensekey: any;
  gridHeader: string;
  hotid = 'depreciationregister';
  private hotRegisterer = new HotTableRegisterer();
  depreciationregister: Handsontable.GridSettings;
  initializeControls() {
    this.depreciationregister = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [40, 60, 60, 60, 60, 60, 60, 60, 60, 60],
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
          data: 'JV NO.',
          type: 'text'
        },
        {
          data: 'Dep. JV Date',
          type: 'numeric',
        },
        {
          data: 'Dep. From',
          type: 'numeric'
        },
        {
          data: 'Dep. To',
          type: 'numeric'
        },
        {
          data: 'Amount',
          type: 'numeric'
        },
        {
          data: 'Dep. Perc',
          type: 'numeric'
        },
        {
          data: 'Acc Dep',
          type: 'numeric'
        },
        {
          data: 'Dep. Amount',
          type: 'numeric'
        },
        {
          data: 'Total Dep.',
          type: 'numeric'
        },
        {
          data: 'Book Value',
          type: 'numeric'
        }
      ],
      colHeaders: [
        this.translate.instant('JV NO.'),
        this.translate.instant('Dep. JV Date'),
        this.translate.instant('Dep. From'),
        this.translate.instant('Dep. To'),
        this.translate.instant('Amount'),
        this.translate.instant('Dep. Perc'),
        this.translate.instant('Acc Dep'),
        this.translate.instant('Dep. Amount'),
        this.translate.instant('Total Dep.'),
        this.translate.instant('Book Value'),
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
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router,
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
    });
    this.initializeControls();
  }
}


