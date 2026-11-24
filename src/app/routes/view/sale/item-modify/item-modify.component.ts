import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DynamicDialogConfig, DynamicDialogRef, MenuItem } from 'primeng';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-item-modify',
  templateUrl: './item-modify.component.html',
  styleUrls: ['./item-modify.component.scss']
})
export class ItemModifyComponent implements OnInit {
  index: number = 0;

  title:string;
subtitle:string;
licensekey: any;
breadcumbmodel: MenuItem[];
ItemModifyFormGroup: FormGroup;
  dataset: any;
  gridHeader: string;
handleChange(e) {
  this.index = e.index;
}
hotid = 'customarquotation';
private hotRegisterer = new HotTableRegisterer();
customarquotation: Handsontable.GridSettings;
selectedView: string = 'Summary';
initializeControls() {
  this.customarquotation = {
    rowHeaders: true,
    viewportColumnRenderingOffset: 27,
    viewportRowRenderingOffset: 'auto',
    colWidths: [60, 30, 30, 30, 30],
    minRows: 13,
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
        data: 'Qtn No',
        type: 'text'
      },
      {
        data: 'Date',
        type: 'numeric',
      },
      {
        data: 'Customer',
        type: 'numeric'
      },
      {
        data: 'Amount',
        type: 'numeric'
      },
      {
        data: 'Status',
        type: 'numeric'
      }
    ],
    colHeaders: [
      this.translate.instant('Qtn No'),
      this.translate.instant('Date'),
      this.translate.instant('Customer'),
      this.translate.instant('Amount'),
      this.translate.instant('Status'),
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
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,


    private router: Router,
private fb:FormBuilder

    ) { }

  ngOnInit(): void {

    this.ItemModifyFormGroup = new FormGroup({
      Itemname: new FormControl(this.config.data.itemName),
      ItemId: new FormControl(this.config.data.itemId),

      isSave: new FormControl(''),

    });
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";

    });
    this.initializeControls()

  }
  // save(){
  //  console.log(this.ItemModifyFormGroup.value,"this.ItemModifyFormGroup.value")
  // }
  save() {
    this.ref.close(this.ItemModifyFormGroup.value)
  }
  close() {
    this.ref.close()
  }
}
