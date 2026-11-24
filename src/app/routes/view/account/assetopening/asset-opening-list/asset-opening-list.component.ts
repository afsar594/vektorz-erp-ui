import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DynamicDialogRef } from 'primeng';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-asset-opening-list',
  templateUrl: './asset-opening-list.component.html',
  styleUrls: ['./asset-opening-list.component.scss']
})
export class AssetOpeningListComponent implements OnInit {

  passEntry: any = 1;
  dataset: any;
  licensekey: any;
  state: { Dir: string; Field: any; Skip: any; Take: any; Search: any; Filter: any; };
  search: any;
  filter: any;
  startDate: any = this.GetLastYearDate(new Date());
  endDate: Date = new Date();
  selectedAsOnDate: Date = new Date();
  showDatePicker: boolean = false;

  suppliers: any[] = [];
  selectedSupplier: string;

  constructor(private accService: AccountstatementService,
    private translate: TranslateService,
    private ref: DynamicDialogRef,
    private datePipe: DatePipe,
  ) { }

  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 1);
    return new Date(date.toDateString())
  }



  ngOnInit(): void {
    this.licensekey = defaults.hotlicensekey;
    this.GetGridListData(null);
    this.GetSupplierMasterGroup()
    this.initializeControls();
  }
  hotid: any = 'CustomerSalesOrderList';

  private hotRegisterer = new HotTableRegisterer();
  CustomerSalesOrder: Handsontable.GridSettings;
  selectedDatePicker: string = "asOn";
  initializeControls() {
    this.CustomerSalesOrder = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [30, 90, 30, 30, 30, 30, 20],
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
          data: 'astPurID',
          type: 'text'
        },

        {
          data: 'description',
          type: 'text',
        },
        {
          data: 'astPurDt',
          type: 'text',
          renderer: this.dateRenderer.bind(this),
          readOnly: true,
        },
        {
          data: 'actualAmount',
          type: 'numeric',
        },
        {
          data: 'netAmount',
          type: 'numeric',
        },
        {
          data: 'disAmount',
          type: 'numeric',
        },
        { data: null, renderer: this.buttonRenderer.bind(this), className: 'htCenter' }
      ],
      colHeaders: [
        this.translate.instant('ID'),

        this.translate.instant('Description'),
        this.translate.instant('Date'),
        this.translate.instant('Actual Amount'),
        this.translate.instant('Net Amount'),
        this.translate.instant('Dis Amount'),
        this.translate.instant('Action'),
      ],
      beforeOnCellMouseUp: (event, coords, TD) => {

        if (coords.col.valueOf() === 6) {
          const hot = this.hotRegisterer.getInstance(this.hotid);
          var data = hot.getDataAtRow(coords.row);

          this.CloseModel(data);
        }
      
      },
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }

  CloseModel(data) {
    // this.passEntry = id;
    this.ref.close(data[0])
  }

  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';

    const button = document.createElement('a');
    button.className = 'iconbton';
    button.innerHTML = '<i class="pi pi-pencil" ></i>';
  

    td.appendChild(button);
    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }

  ApplyAllFilter() {
    let query = '';
    let message = "Please select voucher range!";

    query += this.SupplierDropDownChange();

    if (this.showDatePicker) {
      query += this.DateRangeSelect()
    }
    // else {
    //   query += this.ASOnDateChange()
    // }
    this.filter = query;
    this.GetGridListData(null);
  }
  dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      td.innerText = formattedDate ? formattedDate : '';
    } else {
      td.innerText = '';
    }
  }
  DateRangeSelect() {
    let queryString: string = '';
    let min = this.GetDate(this.startDate);
    let max = this.GetDate(this.endDate);
    if (this.startDate) {
      queryString += ` (AccountsTransactionsTransDate >= DateTime.ParseExact("` + min + `", "dd-MM-yyyy", null))`;
    }
    if (this.endDate) {
      queryString += ` && (AccountsTransactionsTransDate <= DateTime.ParseExact("` + max + `", "dd-MM-yyyy", null))`;
    }


    return queryString;
  }

  SupplierDropDownChange() {
    let queryString = '';
    if (this.selectedSupplier != '') {
      queryString += ` && (AccountsTransactionsAccNo == "` + this.selectedSupplier + `")`;
    }
    return queryString;
  }

  GetSupplierMasterGroup() {
    this.accService.GetSupplierMasterDropdown().subscribe((response: ApiResponse<any>) => {
      if (response.valid && response.result.length > 0) {
        this.suppliers = response.result.map((data) => ({
          label: data.name,
          value: data.value
        }))
      }
    })
  }


  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }

  GetGridListData(event: any) {
    this.state = {
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter
    }
    this.accService.GetAssetOpeningList(this.state).subscribe((response: ApiResponse<any>) => {
      if (response.valid && response.result.data.length > 0) {
        this.dataset = response.result.data;
      }
    })
  }

}