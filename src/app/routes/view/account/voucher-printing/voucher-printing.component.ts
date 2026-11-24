import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-voucher-printing',
  templateUrl: './voucher-printing.component.html',
  styleUrls: ['./voucher-printing.component.scss'],
})
export class VoucherPrintingComponent implements OnInit, OnDestroy {
  title: string;
  subtitle: string;
  Submitted = false;
  dataset: any;
  state: any;
  Form: FormGroup;
  cols: Array<any>;
  voucherType = [];
  selectedVoucherType: any;
  particularVoucher: any;
  selectedParticularVoucher: any;
  voucherStart: any;
  selectedVoucherStart: any;
  voucherEnd: any;
  selectedVoucherEnd: any;
  displayPrintPreview: boolean = false;
  radioBtnType: string = 'particularVoucher';
  timer: any;
  filter: string = '';
  search: string = '';
  startDate: any = this.GetLastYearDate(new Date());
  endDate: Date = new Date();
  ScreenId: number;
  Permission: any;
  private searchSubject = new Subject<{ searchText; type }>();
  private destroy$ = new Subject<void>();

  currentPage = this.utilityService.defaultPagination.currentPage;
  pageSize = this.utilityService.defaultPagination.pageSize;
  pageOption = this.utilityService.defaultPagination.pageOption;
  totalRecords: number = 0;
  totalPages = 0;
  pageDataSet = [];

  index: number = 0;
  licensekey: string;
  gridHeader: string;
  handleChange(e) {
    this.index = e.index;
  }
  hotid = 'VoucherPrinting';
  private hotRegisterer = new HotTableRegisterer();
  VoucherPrinting: Handsontable.GridSettings;
  sortColumn = 'accountsTransactionsVoucherType';
  sortOrder: { [key: string]: 'asc' | 'desc' } = {};

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private accService: AccountstatementService,
    private printService: FileSaverService,
    private masterApi: MasterApiService,
    private utilityService: UtilityService,
    private permission: PermissionsService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
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

    this.Form = new FormGroup({
      ChequeNo: new FormControl('', Validators.required),
      narration: new FormControl('', Validators.required),
      VoucherType: new FormControl('', Validators.required),
      FormVoucher: new FormControl('', Validators.required),
      ToVoucher: new FormControl('', Validators.required),
      DateFrom: new FormControl('', Validators.required),
      DateTo: new FormControl('', Validators.required),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
    this.setupSearchDebounce();
  }
  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 1);
    return new Date(date.toDateString());
  }

  initializeControls() {
    const hiddenColumns = [2, 3];
    this.VoucherPrinting = {
      ...this.utilityService.getTableConfig(
        columnDetailList(this),
        hiddenColumns
      ),
      beforeColumnSort: (
        currentSortConfig: any[],
        destinationSortConfigs: any[]
      ) => {
        if (destinationSortConfigs.length > 0) {
          const sortConfig = destinationSortConfigs[0]; // first sorted column
          const colIndex = sortConfig.column;
          // this.sortOrder = sortConfig.sortOrder; // 'asc' | 'desc' | undefined

          const columnName = columnDetailList(this)[colIndex]?.data; // or .label depending on your setup

          console.log('Sorted column:', columnName);
          // console.log('Sort direction:', this.sortOrder);
          this.sortColumn = columnName;

          if (!this.sortOrder[columnName]) {
            this.sortOrder[columnName] = 'desc';
          } else {
            this.sortOrder[columnName] =
              this.sortOrder[columnName] === 'asc' ? 'desc' : 'asc';
          }
          console.log(
            'this.sortOrder[columnName] = ',
            this.sortOrder[columnName]
          );

          this.ApplyAllFilter();
          // 🔹 Call your server API with column + direction
          // this.fetchSortedDataFromServer(columnName, sortOrder);
          return false;
        }
      },
    };
  }

  formSubmit() {
    this.Submitted = true;
  }

  VoucherTypeDropdownFilter() {
    let queryString = '';
    if (this.selectedVoucherType == '' || this.selectedVoucherType == null) {
      return '';
    }
    if (this.selectedVoucherType != '') {
      queryString +=
        ` && (AccountsTransactionsVoucherType="` +
        this.selectedVoucherType +
        `")`;
    }
    return queryString;
  }

  GetVoucherTypeDropdown() {
    if (this.voucherType.length > 0) return;
    this.accService
      .GetVoucherTypeDropdown()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.voucherType = response.result.map((data) => ({
            label: data.name,
            value: data.value,
          }));
        }
      });
  }

  ParticularVoucherDropdownFilter() {
    if (
      this.selectedParticularVoucher == '' ||
      this.selectedParticularVoucher == null
    ) {
      return '';
    }
    let queryString = '';
    if (this.selectedParticularVoucher != '') {
      queryString +=
        ` && (AccountsTransactionsVoucherNo == "` +
        this.selectedParticularVoucher.value +
        `")`;
    }
    return queryString;
  }

  VoucherRangeDropdownFilter() {
    if (
      this.selectedVoucherStart == '' ||
      this.selectedVoucherStart == null ||
      this.selectedVoucherEnd == '' ||
      this.selectedVoucherEnd == null
    ) {
      return '';
    }
    let queryString = '';
    if (
      this.selectedVoucherStart != 'all' &&
      this.selectedVoucherEnd != 'all'
    ) {
      queryString = '&& (';
      if (
        this.selectedVoucherStart != '' &&
        this.selectedVoucherStart != null
      ) {
        queryString +=
          ` (AccountsTransactionsVoucherNo >= ("` +
          this.selectedVoucherStart.value +
          `"))`;
      }
      if (this.selectedVoucherEnd != '' && this.selectedVoucherEnd != null) {
        queryString +=
          ` && (AccountsTransactionsVoucherNo <=("` +
          this.selectedVoucherEnd.value +
          `"))`;
      }
    }

    return queryString + ' )';
  }

  GetVoucherNoDropdown() {
    this.accService
      .GetVoucherNoDropdown()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.particularVoucher = response.result.map((data) => ({
            label: data.name,
            value: data.value,
          }));
          this.voucherStart = response.result.map((data) => ({
            label: data.name,
            value: data.value,
          }));
          this.voucherEnd = response.result.map((data) => ({
            label: data.name,
            value: data.value,
          }));
        }
      });
  }

  setupSearchDebounce() {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => {
          this.particularVoucher = [...this.voucherStart];
          this.voucherStart = [...this.voucherStart];
          this.voucherEnd = [...this.voucherEnd];
          return prev.searchText === curr.searchText && prev.type === curr.type;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {
        if (res.type == 'voucherNumber')
          this.GetVoucherNoAutoComplete(res.searchText);
      });
  }

  searchVouchers(event: any, type: string) {
    const searchText = event.query.toLowerCase().trim();
    const config = {
      searchText,
      type,
    };

    this.searchSubject.next(config);
  }

  GetVoucherNoAutoComplete(text) {
    const params = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: text,
    };
    this.accService
      .GetVoucherNoAutoComplete(params)
      .subscribe((response: ApiResponse<any>) => {
        this.particularVoucher = response.result.items.map((data) => ({
          label: data.name,
          value: data.value,
        }));
        this.voucherStart = response.result.items.map((data) => ({
          label: data.name,
          value: data.value,
        }));
        this.voucherEnd = response.result.items.map((data) => ({
          label: data.name,
          value: data.value,
        }));
      });
  }

  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }

  DateRangeFilter() {
    let queryString: string = '&& (';
    let min = this.GetDate(this.startDate);
    let max = this.GetDate(this.endDate);
    if (this.startDate) {
      queryString +=
        ` (AccountsTransactionsTransDate.Value.Date >= Convert.ToDateTime("` +
        min +
        `"))`;
    }
    if (this.endDate) {
      queryString +=
        ` && (AccountsTransactionsTransDate.Value.Date <= Convert.ToDateTime("` +
        max +
        `"))`;
    }

    return queryString + ' )';
  }

  ApplyAllFilter() {
    let query = '';
    if (this.radioBtnType == 'particularVoucher') {
      query += this.ParticularVoucherDropdownFilter();
    } else if (this.radioBtnType == 'dateRange') {
      query += this.DateRangeFilter();
    } else {
      query += this.VoucherRangeDropdownFilter();
    }

    let stringQuery = this.VoucherTypeDropdownFilter();

    query += stringQuery;
    this.filter = query;
    this.GetGridListData(null);
  }

  SearchData(event: any) {
    let that = this;
    clearTimeout(this.timer);
    var ms = 500; // milliseconds
    var val = event.target.value;
    this.timer = setTimeout(function () {
      that.search = val;
      that.GetGridListData(null);
    }, ms);
  }

  GetGridListData(event: any) {
    this.state = {
      Dir: this.sortOrder[this.sortColumn] || 'desc',
      Field: this.sortColumn,

      Skip: this.pageSize * (this.currentPage - 1),
      Take: this.pageSize,
      Search: this.search,
      Filter: this.filter,
    };
    this.accService
      .GetAccountTransactionsVoucherPrint(this.state)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid) {
          this.dataset = response.result.details;
          if (this.dataset.length > 0) {
            this.totalRecords = response.result.total;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            this.pageDataSet[this.currentPage] = this.dataset;
          } else {
            this.totalRecords = response.result.total;
          }
        }
      });
  }

  DownloadVoucherPrint(event, type) {
    if (!this.dataset) {
      return;
    }
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
      Extension: type,
    }; //"wwwroot/SiteDocument/SiteDemo1/FileDocument.doc" static file path
    this.accService.DownloadVoucherPrint(this.state).subscribe((event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type,
      });
      console.log('ddd', downloadedFile);
      if (downloadedFile.type != '') {
        // if(type =="PDF"){
        //   window.open(URL.createObjectURL(downloadedF;,ile));
        // }
        // else{
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = 'VoucherPrint';
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
        //   }
      }
    });
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  currentDate: Date = new Date();
  //////////////  Printing Starts Here  ////////////
  displayPrint() {
    this.displayPrintPreview = true;
  }

  printAsPDF() {
    var css: string = `
    .flexcol{
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
  }
  .flexrow{
      display: flex;
      flex-direction: row;
      justify-content: start;
      align-items: start;
  }

  .rowgap{
      gap: 111px;
  }
.flex {
  display: flex;
  margin-bottom: 5px;
  gap: 4px; /* Adjusted the gap value here */
 }
 h1{
  color: rgb(126, 12, 12);
}
h2{
text-align: center;
color: rgb(101, 33, 165);
}
h3{
  color: rgb(12, 150, 150);
  margin-left: 5%;
}
.Acc {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;

}

.Acc td, .Acc th {
  border: 1px solid #aca8a8;
  padding: 8px;
}

.Acc tr:nth-child(even){background-color: #f2f2f2;}

.Acc tr:hover {background-color: #ddd;}

.Acc th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: rgb(247, 240, 240);
}

.flex {
display: flex;
margin-bottom: 5px;
gap: 4px; /* Adjusted the gap value here */
}
.contain1{
width: 49.5%;
 border-radius: 1px;
margin-top: 6%;
  padding-bottom: 0%;
padding: 8px;
}
.contain2{
width: 49.5%;
 border-radius: 1px;
margin-top: 5px;
  padding-bottom: 0%;
padding: 8px;
margin-left: 5px;
}
     .rectImg {
height: 140px;
    width: 217px;
}

.squreImg {
  height: 145px;
  width: 145px;
}
`;
    let html: any = document.getElementById('print');
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
  }

  userTrackingLog(type) {
    let req = {
      page: 'Voucher Printing',
      section: this.dataset,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: '',
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      console.log('Response:', res);
    });
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageSizeChange() {
    this.pageDataSet = [];
    this.currentPage = 1;
    this.ApplyAllFilter();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.pageDataSet[this.currentPage]) {
        this.dataset = this.pageDataSet[this.currentPage];
      } else {
        this.ApplyAllFilter();
      }
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.pageDataSet[this.currentPage]) {
        this.dataset = this.pageDataSet[this.currentPage];
      } else {
        this.ApplyAllFilter();
      }
    }
  }
}
export const columnDetailList = (component: VoucherPrintingComponent) => [
  {
    data: 'accountsTransactionsVoucherType',
    type: 'autocomplete',
    label: 'Voucher Type',
    toolTip: 'Voucher Type',
  },
  {
    data: 'accountsTransactionsVoucherNo',
    type: 'text',
    label: 'Voucher No.',
    toolTip: 'Voucher Number',
  },
  {
    data: 'accountsTransactionsAccNo',
    type: 'text',
    label: 'Acc No',
    toolTip: 'Account Number',
  },
  {
    data: 'accountsTransactionsAccName',
    type: 'text',
    label: 'Acc Name',
    toolTip: 'Account Name',
  },
  {
    data: 'accountsTransactionsParticulars',
    type: 'text',
    label: 'Particulars',
    toolTip: 'Particulars',
  },
  {
    data: 'accountsTransactionsTransDateString',
    type: 'text',
    label: 'Date',
    toolTip: 'Transaction Date',
  },
  {
    data: 'accountsTransactionsDebit',
    type: 'numeric',
    label: 'Debit',
    toolTip: 'Debit Amount',
  },
  {
    data: 'accountsTransactionsCredit',
    type: 'numeric',
    label: 'Credit',
    toolTip: 'Credit Amount',
  },
];
