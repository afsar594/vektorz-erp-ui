import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.scss']
})
export class SupplierListComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  index: number = 0;
  handleChange(e) {
    this.index = e.index;
  }
  licensekey: any;
  gridHeader: string;
  hotid = 'supplierlist';
  private hotRegisterer = new HotTableRegisterer();
  supplierlist: Handsontable.GridSettings;
  initializeControls() {
    this.supplierlist = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [80, 60, 40, 40, 40, 40, 40],
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
          data: 'Supplier',
          type: 'text'
        },
        {
          data: 'Contact Person',
          type: 'numeric',
        },
        {
          data: 'PO Box',
          type: 'numeric'
        },
        {
          data: 'City',
          type: 'numeric'
        },
        {
          data: 'Country',
          type: 'numeric'
        },
        {
          data: 'Telephone',
          type: 'numeric'
        },
        {
          data: 'Mobile',
          type: 'numeric'
        }
      ],
      colHeaders: [
        this.translate.instant('Supplier'),
        this.translate.instant('Contact Person'),
        this.translate.instant('PO Box'),
        this.translate.instant('City'),
        this.translate.instant('Country'),
        this.translate.instant('Telephone'),
        this.translate.instant('Mobile'),
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
  ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
    });
    this.initializeControls();
  }
}
