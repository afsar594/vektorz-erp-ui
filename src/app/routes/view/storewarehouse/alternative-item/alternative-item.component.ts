import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DialogService } from 'primeng';
import { defaults } from 'src/app/shared/service/settings';
import { ItemSearchComponent } from './item-search/item-search.component';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-alternative-item',
  templateUrl: './alternative-item.component.html',
  styleUrls: ['./alternative-item.component.scss']
})
export class AlternativeItemComponent implements OnInit {


  title: string;
  subtitle: string;
  dataset: any; 
  licensekey: any;
  gridHeader: string;
   index: number = 0;
   handleChange(e) {
    this.index = e.index;
  }
    hotid = 'Alternative';
  private hotRegisterer = new HotTableRegisterer();
  Alternative: Handsontable.GridSettings;
  initializeControls() {
    this.Alternative = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [100],
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

      stretchH: "all",
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'Alternative Items',
          type: 'numeric',
        },
        

      ],
      colHeaders: [
        this.translate.instant('Alternative Items'),
        
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }
  constructor( private activatedroute: ActivatedRoute,
        private translate: TranslateService,

  ){

  }
  ngOnInit(): void {
      this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
  
    });
    this.initializeControls()

  }

}
  // dataset: any;
  // cols: Array<any>;
  // Date: Date;
  // location: Array<string>;
  // licensekey: any;
  // gridHeader: string;
  // AIForm: FormGroup;
  // index: number = 0;
  // ScreenId: number;
  // Permission: any;
  // handleChange(e) {
  //   this.index = e.index;
  // }

  // hotid = 'Alternative';
  // private hotRegisterer = new HotTableRegisterer();
  // Alternative: Handsontable.GridSettings;
  // initializeControls() {
  //   this.Alternative = {
  //     rowHeaders: true,
  //     viewportColumnRenderingOffset: 27,
  //     viewportRowRenderingOffset: 'auto',
  //     colWidths: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  //     minRows: 3,
  //     width: '100%',
  //     height: 300,
  //     rowHeights: 23,
  //     fillHandle: {
  //       direction: 'vertical',
  //       autoInsertRow: true
  //     },
  //     data: [],
  //     minSpareRows: 1,
  //     allowInsertRow: true,

  //     stretchH: "all",
  //     manualRowResize: true,
  //     manualColumnResize: true,
  //     columns: [
  //       {
  //         data: 'Item Code',
  //         type: 'numeric',
  //       },
  //       {
  //         data: 'Item Name',
  //         type: 'numeric'
  //       },

  //       {
  //         data: 'Unit',
  //         type: 'numeric'
  //       },
  //       {
  //         data: 'Alt Item Code ',
  //         type: 'numeric',
  //       },
  //       {
  //         data: 'Alt Item Name',
  //         type: 'numeric'
  //       },
  //       {
  //         data: 'Alt Mat.Unit',
  //         type: 'numeric',
  //       },
  //       {
  //         data: 'Description',
  //         type: 'numeric'
  //       },

  //     ],
  //     colHeaders: [
  //       this.translate.instant('Item Code'),
  //       this.translate.instant('Item Name'),
  //       this.translate.instant('Unit'),
  //       this.translate.instant('Alt.Item Code'),
  //       this.translate.instant('Alt.Item Name'),
  //       this.translate.instant('Alt. Mat.Unit'),
  //       this.translate.instant('Description'),
  //     ],
  //     manualRowMove: true,
  //     manualColumnMove: true,
  //     contextMenu: true,
  //     filters: true,
  //     dropdownMenu: true,
  //   }
  // }

  // constructor(
  //   private activatedroute: ActivatedRoute,
  //   private fb: FormBuilder,
  //   private translate: TranslateService,
  //   public dialogService: DialogService,
  //   private permission: PermissionsService,
  // ) {

  // }


  // ngOnInit(): void {
  //   this.activatedroute.queryParams.subscribe((params) => {
  //     this.ScreenId = +params['menu'];
  //     var rights = this.permission.getById(this.ScreenId);
  //     if (rights) {
  //       var res = rights[0]
  //       this.Permission = {
  //         Allow: res?.workGroupPermissionsUallow,
  //         Add: res?.workGroupPermissionsUadd,
  //         Delete: res?.workGroupPermissionsUdelete,
  //         Edit: res?.workGroupPermissionsUedit,
  //         Print: res?.workGroupPermissionsUprint,
  //         View: res?.workGroupPermissionsUview
  //       };
  //     }
  //   });

  //   this.AIForm = new FormGroup({
  //     DecNo: new FormControl('', Validators.required),
  //     Date: new FormControl(new Date(new Date().setFullYear(new Date().getFullYear())), Validators.required),
  //     Remarks: new FormControl('', Validators.required),


  //   });

  //   this.activatedroute.data.subscribe(data => {
  //     this.title = data.title;
  //     this.subtitle = data.title;
  //     this.licensekey = defaults.hotlicensekey;
  //     this.gridHeader = "No Data";

  //   });
  //   this.initializeControls()

  // }
  // get f() {
  //   return this.AIForm.controls;
  // }
  // ItemSearch() {
  //   const ref = this.dialogService.open(ItemSearchComponent, {
  //     data: {
  //       id: '51gF3'
  //     },
  //     header: ' Item Search',
  //     width: '70%'
  //   });

  //   ref.onClose.subscribe(() => {

  //     const data = this.dialogService.dialogComponentRef.instance
  //       .componentRef.instance.passEntry;
  //   });
  // }
// }

