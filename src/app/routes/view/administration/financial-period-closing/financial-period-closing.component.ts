import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { EntityResponse } from 'src/app/routes/domain/Masters/EntityResponse';
import { AdministrationService } from 'src/app/routes/service/Administrations/administration.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-financial-period-closing',
  templateUrl: './financial-period-closing.component.html',
  styleUrls: ['./financial-period-closing.component.scss']
})
export class FinancialPeriodClosingComponent implements OnInit {

  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  Date: Date;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  totalAsset:string='';
  retainedEarnings:string='';
  periodProfit:string="";
  equity:string="";
  liabilities:string="";
  netLiabilities:string=""
  UserName:string="";
  password:string="";
  liabilitiesEquity:string="";
  currentAccount:string="";
  closingPeriodCapital:string="";
  startDate: any = this.GetLastYearDate(new Date());
  endDate: Date = new Date();
  index: number = 0;
  state: { Dir: string; Field: any; Skip: any; Take: any; Search: any; Filter: any; };
  search: any;
  filter: any;
  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 1);
    return new Date(date.toDateString())
  }
  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }
  handleChange(e) {
    this.index = e.index;
    if (e.index == 0) {
      setTimeout(() => {
        this.hotRegisterer.getInstance(this.hotid).updateSettings(this.FinancialPeriodClosing);
      }, 100);
    }
    else if (e.index == 1) {
      setTimeout(() => {
        this.hotRegisterer.getInstance(this.hotid2).updateSettings(this.LiabilitiesData);
      }, 100);
    }
    else if (e.index == 2) {
      setTimeout(() => {
        this.hotRegisterer.getInstance(this.hotid3).updateSettings(this.EquityData);
      }, 100);
    }
  }
  hotid = 'FinancialPeriodClosing';
  private hotRegisterer = new HotTableRegisterer();
  FinancialPeriodClosing: Handsontable.GridSettings;
  initializeControls() {
    this.FinancialPeriodClosing = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [50, 30, 80, 30, 30, 30],
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
          data: 'Main Head',
          type: 'numeric',
        },
        {
          data: 'SubHead',
          type: 'numeric'
        },
        {
          data: 'A/C Name',
          type: 'text',
        },
        {
          data: 'A/C No',
          type: 'numeric'
        },
        {
          data: 'Total Debit',
          type: 'numeric',
        },
        {
          data: 'Total Credit',
          type: 'numeric'
        },

      ],
      colHeaders: [
        this.translate.instant('Main Head'),
        this.translate.instant('Sub Head'),
        this.translate.instant('Account Name'),
        this.translate.instant('Account No'),
        this.translate.instant('Total Debit'),
        this.translate.instant('Total Credit'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }
  hotid2 = 'Liabilities';
  //private hotRegisterer = new HotTableRegisterer();
  LiabilitiesData: Handsontable.GridSettings;
  initializeControls2() {
    this.LiabilitiesData = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [50, 30, 80, 30, 30, 30],
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
          data: 'Main Head',
          type: 'numeric',
        },
        {
          data: 'SubHead',
          type: 'numeric'
        },
        {
          data: 'A/C Name',
          type: 'text',
        },
        {
          data: 'A/C No',
          type: 'numeric'
        },
        {
          data: 'Total Debit',
          type: 'numeric',
        },
        {
          data: 'Total Credit',
          type: 'numeric'
        },

      ],
      colHeaders: [
        this.translate.instant('Main Head'),
        this.translate.instant('Sub Head'),
        this.translate.instant('Account Name'),
        this.translate.instant('Account No'),
        this.translate.instant('Total Debit'),
        this.translate.instant('Total Credit'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }

  hotid3 = 'Equity';
  //private hotRegisterer = new HotTableRegisterer();
  EquityData: Handsontable.GridSettings;
  initializeControls3() {
    this.EquityData = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [50, 30, 80, 30, 30, 30],
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
          data: 'Main Head',
          type: 'numeric',
        },
        {
          data: 'SubHead',
          type: 'numeric'
        },
        {
          data: 'A/C Name',
          type: 'text',
        },
        {
          data: 'A/C No',
          type: 'numeric'
        },
        {
          data: 'Total Debit',
          type: 'numeric',
        },
        {
          data: 'Total Credit',
          type: 'numeric'
        },

      ],
      colHeaders: [
        this.translate.instant('Main Head'),
        this.translate.instant('Sub Head'),
        this.translate.instant('Account Name'),
        this.translate.instant('Account No'),
        this.translate.instant('Total Debit'),
        this.translate.instant('Total Credit'),
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
    private adminService: AdministrationService,
  ) {

  }

  DateRangeSelect() {
    let queryString: string = '';
    let min = this.GetDate(this.startDate);
    let max = this.GetDate(this.endDate);
    if (this.startDate) {
      queryString += ` and (act.AccountsTransactions_TransDate >= cast('` + min + `'as Date))`;
    }
    if (this.endDate) {
      queryString += ` and (act.AccountsTransactions_TransDate <= cast('` + max + `'as Date))`;
    }

    return queryString;
  }
  ngOnInit(): void {

    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";

    });
    this.initializeControls()
    this.initializeControls2()
    this.initializeControls3()

    this.GetGridListDataAsset(null);
    //this.GetGridListDataEquity(null);
   // this.GetGridListDataLiability(null);

  }

  GetGridListDataAsset(event: any) {
    
    this.state = {
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter
    }
    this.adminService.GetFinancialClosingAsset(this.state).subscribe((response: EntityResponse<any>) => {
      if (response.valid && response.result.data?.length > 0) {
        this.FinancialPeriodClosing = response.result.details;
      }
    })
  }
  GetGridListDataEquity(event: any) {
    this.state = {
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter
    }
    this.adminService.GetFinancialClosingEquity(this.state).subscribe((response: EntityResponse<any>) => {
      if (response.valid && response.result.data?.length > 0) {
        this.EquityData = response.result.details;
      }
    })
  }
  GetGridListDataLiability(event: any) {
    this.state = {
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter
    }
    this.adminService.GetFinancialClosingLiability(this.state).subscribe((response: EntityResponse<any>) => {
      if (response.valid && response.result.data?.length > 0) {
        this.LiabilitiesData = response.result.details;
      }
    })
  }
} 

