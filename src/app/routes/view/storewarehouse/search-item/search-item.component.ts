import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent implements OnInit {
 title: string;
   subtitle: string;
   dataset: any;
  licensekey: any;
  gridHeader: string;
   index: number = 0;
   handleChange(e) {
    this.index = e.index;
  }
  hotid = 'itemdetails';
  private hotRegisterer = new HotTableRegisterer();
  itemdetails: Handsontable.GridSettings;
  initializeControls() {
    this.itemdetails = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [100],
      minRows: 5,
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
          data: 'MatID',
          type: 'numeric',
        },
        {
          data: 'Partno',
          type: 'numeric',
        },
        {
          data: 'Materials',
          type: 'numeric',
        },
        {
          data: 'Vender',
          type: 'numeric',
        },
        {
          data: 'Barcode',
          type: 'numeric',
        },
        {
          data: 'Reference',
          type: 'numeric',
        },
        {
          data: 'Stock',
          type: 'numeric',
        },
        {
          data: 'UnitPrice',
          type: 'numeric',
        },
        {
          data: 'Last PurPrice',
          type: 'numeric',
        },
        {
          data: 'Last SalesPrice',
          type: 'numeric',
        },
        {
          data: 'LC',
          type: 'numeric',
        },
        

      ],
      colHeaders: [
        this.translate.instant('MatID'),
        this.translate.instant('Partno'),
        this.translate.instant('Materials'),
        this.translate.instant('Vender'),
        this.translate.instant('Barcode'),
        this.translate.instant('Reference'),
        this.translate.instant('Stock'),
        this.translate.instant('UnitPrice'),
        this.translate.instant('Last PurPrice'),
        this.translate.instant('Last SalesPrice'),
        this.translate.instant('LC'),

      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }
  constructor(    private activatedroute: ActivatedRoute,
    private translate: TranslateService,

  ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
         
    });
    this.initializeControls()
  }
  

}
