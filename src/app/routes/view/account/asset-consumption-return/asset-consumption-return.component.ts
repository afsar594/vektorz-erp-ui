import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
  
@Component({
  selector: 'app-asset-consumption-return',
  templateUrl: './asset-consumption-return.component.html',
  styleUrls: ['./asset-consumption-return.component.scss']
})
export class AssetConsumptionReturnComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  cols
  index: number = 0;
  licensekey: any;
  gridHeader: string;
  handleChange(e) {
    this.index = e.index;
  }
 
 hotid = 'assetconsumption';
 private hotRegisterer = new HotTableRegisterer();
 assetconsumption: Handsontable.GridSettings;

 initializeControls() {
   this.assetconsumption = {
     rowHeaders: true,
     viewportColumnRenderingOffset: 27,
     viewportRowRenderingOffset: 'auto',
     colWidths: 150,
     minRows: 3,
     width: '100%',
     height: 500,
     rowHeights: 23,
     fillHandle: {
       direction: 'vertical',
       autoInsertRow: true,
     },
     data: [],
     minSpareRows: 1,
     allowInsertRow: true,
     stretchH: 'all',
     manualRowResize: true,
     manualColumnResize: true,
     columns: [
      {
        data: 'Voucher No.',
        type: 'numeric',
       width: 80,  
      },
       {
         data: 'Code',
         type: 'numeric',
        width: 80,  
       },
       {
         data: 'Asset Name',
         type: 'numeric',
        width: 150,   
       },
       {
         data: 'Asset Code',
         type: 'numeric',
        width: 80,   
       },
       {
         data: 'SubAsset Name',
         type: 'numeric',
        width: 150,  
       },
       {
        data: 'From Date',
        type: 'numeric',
       width: 80,  
      }, 
      {
        data: 'To Date',
        type: 'numeric',
       width: 80,  
      }, 
      {
        data: 'Days',
        type: 'numeric',
       width: 80,  
      }, 
     
      {
        data: 'Remark',
        type: 'numeric',
       width: 150,  
      },
     ],
     colHeaders: [

       this.translate.instant('Voucher No.'),
       this.translate.instant('Code'),
       this.translate.instant('Asset Name'),
       this.translate.instant('Asset Code'),
       this.translate.instant('Sub Asset Name'),
       this.translate.instant('From Date'),
       this.translate.instant('To Date'),
       this.translate.instant('Days'),
        this.translate.instant('Remarks'),

     ],
     manualRowMove: true,
     manualColumnMove: true,
     contextMenu: true,
     filters: true,
     dropdownMenu: true,
   };
 }
  constructor(  private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
 ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";
      
    });
        this.initializeControls();

  }

}
