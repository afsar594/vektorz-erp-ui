import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-sale-summary-by-date',
  templateUrl: './sale-summary-by-date.component.html',
  styleUrls: ['./sale-summary-by-date.component.scss']
})
export class SaleSummaryByDateComponent implements OnInit {
 title: string;
  subtitle: string;
  index: number = 0;
  dataset: any;
  licensekey: any;
  gridHeader: string;
 handleChange(e) {
     this.index = e.index;
   }
   
 
   hotid = 'salesummarybydate';
   private hotRegisterer = new HotTableRegisterer();
   salesummarybydate: Handsontable.GridSettings;
   initializeControls() {
     this.salesummarybydate = {
       rowHeaders: true,
       viewportColumnRenderingOffset: 27,
       viewportRowRenderingOffset: 'auto',
       colWidths: '150px',
 
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
           data: 'Cash',
           type: 'text',
         },
         {
           data: 'Checkout',
           type: 'text'
         },
         {
           data: 'Card',
           type: 'text'
         },
         {
           data: 'Transfer',
           type: 'text',
         },
         {
          data: 'Total',
          type: 'text',
        },
       ],
       colHeaders: [
        
         this.translate.instant('Date'),
         this.translate.instant('Cash'),
         this.translate.instant('Checkout'),
         this.translate.instant('Card'),
         this.translate.instant('Transfer'),
         this.translate.instant('Total'),
         
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