import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { EntityResponse } from 'src/app/routes/domain/Masters/EntityResponse';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { SalesService } from 'src/app/routes/service/sales/sales.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-salesmanwise',
  templateUrl: './salesmanwise.component.html',
  styleUrls: ['./salesmanwise.component.scss'],
})
export class SalesmanwiseComponent implements OnInit {
  selectedSalesMan: any = '';
  selectedCustomers: any = '';
  Salesman: any[] = [];
  Customers: any[] = [];
  title: string;
  subtitle: string;
  dataset: any;
  dataset2: any;
  dataset3: any;
  display = true;
  is;
  displayDetailed = false;
  displaySummary = false;
  DetailOrSummary = 'Summary';
  index: number = 0;
  licensekey: any;
  gridHeader: string;
  SWForm: FormGroup;
  filter: any;
  search: any;
  state: {
    Dir: string;
    Field: any;
    Skip: any;
    Take: any;
    Search: any;
    Filter: any;
  };
  startDate: Date = new Date();
  endDate: Date = new Date();
  ScreenId: number;
  Permission: {
    Allow: any;
    Add: any;
    Delete: any;
    Edit: any;
    Print: any;
    View: any;
  };
  toggle() {
    this.display = !this.display;
  }
  handleChange(e) {
    this.index = e.index;
  }

  hotid = 'salesman';
  private hotRegisterer = new HotTableRegisterer();
  salesman: Handsontable.GridSettings;

  hotid2 = 'detailed';
  //private hotRegisterer = new HotTableRegisterer();
  detailed: Handsontable.GridSettings;

  hotid3 = 'summary';
  //private hotRegisterer = new HotTableRegisterer();
  summary: Handsontable.GridSettings;

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private accService: AccountstatementService,
    private saleService: SalesService,
    private permission: PermissionsService,
    private utilityService: UtilityService
  ) {}
  ngOnInit(): void {
    this.SWForm = new FormGroup({
      Customer: new FormControl('', Validators.required),
      Date: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      SalesMan: new FormControl('', Validators.required),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      if (rights) {
        var res = rights[0];
        this.Permission = {
          Allow: res?.workGroupPermissionsUallow,
          Add: res?.workGroupPermissionsUadd,
          Delete: res?.workGroupPermissionsUdelete,
          Edit: res?.workGroupPermissionsUedit,
          Print: res?.workGroupPermissionsUprint,
          View: res?.workGroupPermissionsUview,
        };
      }
    });
    this.initializeControls();
    this.initializeControls2();
    this.initializeControls3();
    this.GetSalesmanMasterGroup();
  }
  initializeControls() {
    this.salesman = this.utilityService.getTableConfig(
      columnDetailList(this),
      []
    );
  }
  initializeControls2() {
    this.detailed = this.utilityService.getTableConfig(
      columnDetailList2(this),
      []
    );
  }
  initializeControls3() {
    this.summary = this.utilityService.getTableConfig(
      columnDetailList3(this),
      []
    );
  }
  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }
  DateRangeSelect() {
    let queryString: string = '';
    let min = this.GetDate(this.startDate);
    let max = this.GetDate(this.endDate);
    if (this.startDate) {
      queryString +=
        ` (AccountsTransactionsTransDate >= Convert.ToDateTime("` + min + `"))`;
    }
    if (this.endDate) {
      queryString +=
        ` && (AccountsTransactionsTransDate <= Convert.ToDateTime("` +
        max +
        `"))`;
    }

    return queryString;
  }
  SalesmanDropdownChange(event) {
    let queryString = '';

    queryString += `(CustomerMasterCustomerSaleManId == "` + event.value + `")`;
    this.saleService
      .GetCustomerFromSaleMan(queryString)
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid) {
          this.Customers = response.result.map((data) => ({
            label: data.name,
            value: data.value,
          }));
        }
      });
  }
  GetSalesmanMasterGroup() {
    this.saleService
      .GetSalesManMaster()
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.Salesman = response.result.map((data) => ({
            label: data.name,
            value: data.id,
          }));
        }
      });
  }
  CustomerDropdownChange() {
    let queryString = '';
    if (this.selectedCustomers?.length > 0) {
      this.selectedCustomers?.forEach((element) => {
        queryString +=
          `AccountsTransactionsAccNo == "` + this.selectedCustomers + `") ||`;
      });
      queryString = ' && (' + queryString.slice(0, -2) + ' )';
    }
    return queryString;
  }
  ApplyAllFilter() {
    let query = '';
    query += this.DateRangeSelect();
    query += this.CustomerDropdownChange();
    this.filter = query;
    this.GetGridListData(null);
  }
  GetGridListData(event: any) {
    this.state = {
      Dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
      Field:
        event != null
          ? event.sortField != null && event.sortField != ''
            ? event.sortField
            : 'AccountsTransactions_TransSno'
          : 'AccountsTransactions_TransSno',
      Skip: event != null ? (event.first != null ? event.first : 0) : 0,
      Take: event != null ? (event.rows != null ? event.rows : 0) : 10000,
      Search: this.search,
      Filter: this.filter,
    };
    if (this.DetailOrSummary == 'Summary') {
      this.saleService
        .AccountTransactionsSalesmanWiseOutstandingReportSummary(this.state)
        .subscribe((response: EntityResponse<any>) => {
          if (response.valid && response.result.details.length > 0) {
            this.dataset3 = response.result.details;
            this.hotRegisterer.getInstance(this.hotid3).updateSettings({
              data: response.result.details,
            });
          }
        });
    } else {
      this.saleService
        .AccountTransactionsSalesmanWiseOutstandingReportDetail(this.state)
        .subscribe((response: EntityResponse<any>) => {
          if (response.valid && response.result.details.length > 0) {
            this.dataset2 = response.result.details;
            this.hotRegisterer.getInstance(this.hotid2).updateSettings({
              data: response.result.details,
            });
          }
        });
    }
  }
}
export const columnDetailList = (component: SalesmanwiseComponent) => [
  {
    data: 'Sales Man',
    type: 'numeric',
    label: 'Sales Man',
    toolTip: 'Salesman ID',
  },
  {
    data: 'Customer',
    type: 'autocomplete',
    label: 'Customer',
    toolTip: 'Customer Name',
    source: component.Customers.map((c) => c.label),
  },
  {
    data: 'Voucher No',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Voucher Number',
  },
  {
    data: 'Voucher Type',
    type: 'numeric',
    label: 'Voucher Type',
    toolTip: 'Type of Voucher',
  },
  {
    data: 'Date',
    type: 'date',
    label: 'Date',
    toolTip: 'Transaction Date',
  },
  {
    data: 'Description',
    type: 'text',
    label: 'Description',
    toolTip: 'Transaction Description',
  },
  {
    data: 'Debit',
    type: 'numeric',
    label: 'Debit',
    toolTip: 'Debit Amount',
  },
  {
    data: 'Credit',
    type: 'numeric',
    label: 'Credit',
    toolTip: 'Credit Amount',
  },
  {
    data: 'Settled',
    type: 'numeric',
    label: 'Settled',
    toolTip: 'Settled Amount',
  },
  {
    data: 'Balance',
    type: 'numeric',
    label: 'Balance',
    toolTip: 'Outstanding Balance',
  },
  {
    data: 'RunningB',
    type: 'numeric',
    label: 'RunningB',
    toolTip: 'Running Balance',
  },
  {
    data: 'Days',
    type: 'numeric',
    label: 'Days',
    toolTip: 'Days Outstanding',
  },
];

export const columnDetailList2 = (component: SalesmanwiseComponent) => [
  {
    data: 'Sales Man',
    type: 'numeric',
    label: 'Sales Man',
    toolTip: 'Salesman ID',
  },
  {
    data: 'Customer',
    type: 'autocomplete',
    label: 'Customer',
    toolTip: 'Customer Name',
    source: component.Customers.map((c) => c.label),
  },
  {
    data: 'Voucher No',
    type: 'text',
    label: 'Voucher No',
    toolTip: 'Voucher Number',
  },
  {
    data: 'Voucher Type',
    type: 'numeric',
    label: 'Voucher Type',
    toolTip: 'Type of Voucher',
  },
  {
    data: 'Date',
    type: 'date',
    label: 'Date',
    toolTip: 'Transaction Date',
  },
  {
    data: 'Description',
    type: 'text',
    label: 'Description',
    toolTip: 'Transaction Description',
  },
  {
    data: 'Debit',
    type: 'numeric',
    label: 'Debit',
    toolTip: 'Debit Amount',
  },
  {
    data: 'Credit',
    type: 'numeric',
    label: 'Credit',
    toolTip: 'Credit Amount',
  },
  {
    data: 'Settled',
    type: 'numeric',
    label: 'Settled',
    toolTip: 'Settled Amount',
  },
  {
    data: 'Balance',
    type: 'numeric',
    label: 'Balance',
    toolTip: 'Outstanding Balance',
  },
  {
    data: 'RunningB',
    type: 'numeric',
    label: 'RunningB',
    toolTip: 'Running Balance',
  },
  {
    data: 'Days',
    type: 'numeric',
    label: 'Days',
    toolTip: 'Days Outstanding',
  },
];

export const columnDetailList3 = (component: SalesmanwiseComponent) => [
  {
    data: 'Customer',
    type: 'text',
    label: 'Customer',
    toolTip: 'Customer Name',
  },
  {
    data: 'Balance',
    type: 'numeric',
    label: 'Balance',
    toolTip: 'Total Outstanding Balance',
  },
];
