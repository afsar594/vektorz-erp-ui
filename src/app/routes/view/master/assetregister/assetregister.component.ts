import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-assetregister',
  templateUrl: './assetregister.component.html',
  styleUrls: ['./assetregister.component.scss']
})
export class AssetregisterComponent implements OnInit {
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

  hotid = 'assetregister';
  private hotRegisterer = new HotTableRegisterer();
  assetregister: Handsontable.GridSettings;

  assetForm: FormGroup;
  constructor(private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private assetservice : MasterApiService
  ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";

    });
    this.assetForm = this.fb.group({
      searchText: [''],
      fromDate: [new Date()],
      toDate: [new Date()],
      depDate: [new Date()],
    });
    this.initializeControls();

  }

  showAll() {
    
    this.assetservice.AssetRegister(this.assetForm.value).subscribe((res:any)=>{
      // this.assetregister.data = res
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        data: res
      });
    })

  }
  initializeControls() {
    this.assetregister = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [80, 80, 80, 150, 80, 120, 80, 80, 80, 80, 80, 80],
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
          data: 'purchaseNo',
          type: 'numeric',

        },
        {
          data: 'purchaseDate',
          type: 'text',

        },
        {
          data: 'assetId',
          type: 'numeric',

        },
        {
          data: 'description',
          type: 'text',

        },
        {
          data: 'depreciationPercentage',
          type: 'numeric',

        },
        {
          data: 'supplier',
          type: 'text',

        },
        {
          data: 'amount',
          type: 'numeric',

        },
        {
          data: 'accumulatedDepreciation',
          type: 'text',

        },

        {
          data: 'accumulatedDepreciationPercentage',
          type: 'numeric',

        },
        {
          data: 'balanceDepreciationPercentage',
          type: 'numeric',

        },

        {
          data: 'bookValue',
          type: 'text',

        },
      ],
      colHeaders: [

        this.translate.instant('Purchase No'),
        this.translate.instant('Puchase Date'),
        this.translate.instant('Asset ID'),
        this.translate.instant('Asset Desc.'),
        this.translate.instant('Dep. Perc '),
        this.translate.instant('Supplier'),
        this.translate.instant('Amount'),
        this.translate.instant('Acc. Dep'),
        this.translate.instant('Acc. Dep%'),
        this.translate.instant('Bal. Dep%'),
        this.translate.instant('Book Value'),

      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

}
