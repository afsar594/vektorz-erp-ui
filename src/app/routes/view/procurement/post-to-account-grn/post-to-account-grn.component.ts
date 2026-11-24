import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-post-to-account-grn',
  templateUrl: './post-to-account-grn.component.html',
  styleUrls: ['./post-to-account-grn.component.scss']
})
export class PostToAccountGrnComponent implements OnInit {
title: string;
  subtitle: string;
  index: number = 0;
  dataset: any;
  licensekey: any;
  gridHeader: string;
 handleChange(e) {
     this.index = e.index;
   }
   
 
   hotid = 'posttoaccountgrn';
   private hotRegisterer = new HotTableRegisterer();
   posttoaccountgrn: Handsontable.GridSettings;
   initializeControls() {
     this.posttoaccountgrn = {
       rowHeaders: true,
       viewportColumnRenderingOffset: 27,
       viewportRowRenderingOffset: 'auto',
       colWidths: '150px',
 
       // colWidths: ['90px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '70px'],
       minRows: 3,
       width: 'auto',
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
           data: 'Date',
           type: 'text'
         },
         {
           data: 'Supplier',
           type: 'text',
         },
         {
           data: 'Amount',
           type: 'text'
         },
         {
           data: 'Post To Acoounts',
           type: 'text'
         },
         
       ],
       colHeaders: [
        
         this.translate.instant('Date'),
         this.translate.instant('Supplier'),
         this.translate.instant('Amount'),
         this.translate.instant('Post To Account'),
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
     private fb: FormBuilder,
         private translate: TranslateService,
     
      ) {
 
   }

  ngOnInit(): void {
     this.activatedroute.data.subscribe(data => {
          this.title = data.title;
          this.subtitle = data.title;
            this.licensekey = defaults.hotlicensekey;
             this.gridHeader = "No Data";
        });
        this.initializeControls()
  }

}
