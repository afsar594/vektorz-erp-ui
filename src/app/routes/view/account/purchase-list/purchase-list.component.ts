import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss']
})
export class PurchaseListComponent implements OnInit {
 title: string | undefined;
  subtitle: string | undefined;
  index: number = 0;
   defaultValue: any
    purchaseReport: FormGroup;

  handleChange(e: { index: number; }) {
    this.index = e.index;
  }
  dataset: any;
  licensekey: any;
  gridHeader: string | undefined;
  hotid = 'purchaseListSettings';
  private hotRegisterer = new HotTableRegisterer();
  purchaseListSettings: Handsontable.GridSettings | undefined;
   initializeControls() {
    this.purchaseListSettings = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [30, 30, 30, 30, 30, 30],
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
          data: 'AccountName',
          type: 'text',
         },
        {
          data: 'Date',
          type: 'numeric',
         },
        {
          data: 'CheckoutAmt',
          type: 'numeric',
         },
        {
          data: 'VatAmt',
          type: 'numeric',
         },
          {
          data: 'TotalAmt',
          type: 'numeric',
         },
        {
          data: 'Narration',
          type: 'text',
         },
      ],
      colHeaders: [
        this.translate.instant('Account Name'),
        this.translate.instant('Date'),
        this.translate.instant('Checkout Amount'),
        this.translate.instant('VAT Amount'),
        this.translate.instant('Total Amount'),
        this.translate.instant('Narration'),

      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }
  constructor(private router: Router,
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,) {}
ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;


    });  
     this.purchaseReport = new FormGroup({
      AccName: new FormControl(''),
      DateFrom: new FormControl(new Date()),
      DateTo: new FormControl(new Date()),
      isDate: new FormControl(),
    });
    this.initializeControls();
  }
}
