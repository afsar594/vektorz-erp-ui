import { HttpResponse } from '@angular/common/http';
import { AfterContentInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { defaults } from 'src/app/shared/service/settings';
import { ExportdocumentService } from 'src/app/routes/service/ExportDocument/exportdocument.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { MenuItem } from 'primeng/api/menuitem';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { debug } from 'console';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ExportFormatType } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-outstandingstatement',
  templateUrl: './outstandingstatement.component.html',
  styleUrls: ['./outstandingstatement.component.scss']
})
export class OutstandingstatementComponent implements OnInit, AfterContentInit {
  @ViewChild('print') table: ElementRef
  title: string;
  subtitle: string;
  breadcumbmodel: MenuItem[];
  dataset: any = [];
  cols: Array<any>;
  index: number = 0;
  location: Array<string>;
  supplier: Array<string>;
  licensekey: any;
  gridHeader: string;
  radioType: string = "Supplier";
  radioTypee: string = "AsOn";
  assetsArray: Array<string>;
  OSForm: FormGroup;
  startDate: Date = new Date();
  endDate: Date = new Date();
  ZeroToThirty = 0;
  ThirtyOneToSixty = 0;
  NinetyOneToOneEighty = 0;
  SixtyOneToNinety = 0;
  formatType: string = "FormatOne";
  OneEightyToThreeSixty = 0;
  aboveThreeSixty = 0;
  customers: any[] = [];
  suppliers: any[] = [];
  CustomerSuppliers: any[] = [];
  selectedCustomerSuppliers: any;
  selectedCustomer: any;
  selectedSupplier: any;
  selectedAsOnDate: Date = new Date();
  state: any;
  filter: any;
  search: any;
  timer: any;
  isDateRange: boolean = false;
  displayPrintPreview: boolean = false;
  ScreenId: number;
  Permission: any;
  selectedName: any;
  handleChange(e) {
    this.index = e.index;
  }
  LogForm: FormGroup = this.fb.group({
    Page: new FormControl('Oustanding Statement'),
    VpNo: new FormControl(''),
    VpType: new FormControl(''),
    Entity: new FormControl('Account Statement'),
    OtherType: new FormControl('Print'),
    Section: new FormControl(''),
  });
  loading: boolean = false;
  outstandingstatement: any;
  hotid: string = 'outstandingstatement';

  initializeControls() {
    this.cols = [
      { field: 'accountsTransactionsVoucherNo', header: 'Voucher No', width: '120px', sortable: true },
      { field: 'accountsTransactionsVoucherType', header: 'Voucher Type', width: '135px', sortable: true },
      { field: 'accountsTransactionsTransDate', header: 'Date', width: '105px', sortable: true },
      { field: 'accountsTransactionsDescription', header: 'Description', width: '130px', sortable: true },
      { field: 'refNo', header: 'Ref No', width: '95px', sortable: true },
      { field: 'accountsTransactionsDebit', header: 'Debit', width: '110px', sortable: true, align: 'right' },
      { field: 'accountsTransactionsCredit', header: 'Credit', width: '110px', sortable: true, align: 'right' },
      { field: 'settled', header: 'Settled', width: '120px', sortable: true, align: 'right' },
      { field: 'accountsTransactionsAllocBalance', header: 'Balance', width: '120px', sortable: true, align: 'right' },
      { field: 'accountstransactionsRunningBalance', header: 'Running Bal', width: '125px', sortable: true, align: 'right' },
      { field: 'accountstransactionsTotalDays', header: 'Days', width: '80px', sortable: true, align: 'center' },
    ];

    this.outstandingstatement = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 13,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
      },
      data: [],
      allowInsertRow: true,
      stretchH: "all",
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        { data: 'accountsTransactionsVoucherNo', type: 'text', width: 100 },
        { data: 'accountsTransactionsVoucherType', type: 'text', width: 120 },
        { data: 'accountsTransactionsTransDateString', type: 'text', width: 100 },
        { data: 'accountsTransactionsDescription', type: 'text', width: 180 },
        { data: 'refNo', type: 'text', width: 100 },
        { data: 'accountsTransactionsDebit', type: 'text', width: 100 },
        { data: 'accountsTransactionsCredit', type: 'text', width: 100 },
        { data: 'settled', type: 'text', width: 100 },
        { data: 'accountsTransactionsAllocBalance', type: 'text', width: 100 },
        { data: 'accountstransactionsRunningBalance', type: 'text', width: 100 },
        { data: 'accountstransactionsTotalDays', type: 'text', width: 100 },
      ],
      colHeaders: [
        this.translate.instant('Voucher No'),
        this.translate.instant('Voucher Type'),
        this.translate.instant('Date'),
        this.translate.instant('Description'),
        this.translate.instant('RefNo.'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('Settled'),
        this.translate.instant('Balance'),
        this.translate.instant('Running Bal'),
        this.translate.instant('Days'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  get totalDebit(): number {
    return (this.dataset || []).reduce((acc, row) => acc + (Number(row.accountsTransactionsDebit) || 0), 0);
  }

  get totalCredit(): number {
    return (this.dataset || []).reduce((acc, row) => acc + (Number(row.accountsTransactionsCredit) || 0), 0);
  }

  get totalSettled(): number {
    return (this.dataset || []).reduce((acc, row) => acc + (Number(row.settled) || 0), 0);
  }

  get totalAllocBalance(): number {
    return (this.dataset || []).reduce((acc, row) => acc + (Number(row.accountsTransactionsAllocBalance) || 0), 0);
  }

  get finalRunningBalance(): number {
    if (!this.dataset || this.dataset.length === 0) return 0;
    const lastRow = this.dataset[this.dataset.length - 1];
    return Number(lastRow?.accountstransactionsRunningBalance) || 0;
  }

  getDaysBadgeClass(days: any): string {
    const d = Number(days) || 0;
    if (d <= 30) return 'badge-days-current';
    if (d <= 60) return 'badge-days-30';
    if (d <= 90) return 'badge-days-60';
    if (d <= 180) return 'badge-days-90';
    if (d <= 360) return 'badge-days-180';
    return 'badge-days-critical';
  }

  getRunningBalClass(val: any): string {
    const num = Number(val) || 0;
    return num >= 0 ? 'running-positive' : 'running-negative';
  }

  viewAction(type: string, vno: string) {
    if (!type || !vno) return;
    let route = '';
    let menu = 0;
    let req = {
      voucherNo: vno,
      type: type,
    };
    this.accountapi.GetAccountIdByVoucherNo(req).subscribe((res: any) => {
      const id = res?.id != null ? res.id : vno;
      switch (type) {
        case 'PurchaseVoucher':
          route = '/procurement/purchasevoucher';
          menu = 175;
          break;
        case 'BANK PAYMENT':
          route = '/account/bankpaymentvoucher';
          menu = 68;
          break;
        case 'CreditNote':
          route = '/account/creditnote';
          menu = 86;
          break;
        case 'DEPJV':
          route = '/account/depreciation-journal-voucher';
          menu = 69;
          break;
        case 'JournalVoucher':
          route = '/account/journalvoucher';
          menu = 62;
          break;
        case 'RECEIPT':
          route = '/account/receiptvoucher';
          menu = 61;
          break;
        case 'PAYMENT':
          route = '/account/paymentvoucher';
          menu = 60;
          break;
        case 'BANK RECEIPT':
          route = '/account/bankreceiptvoucher';
          menu = 67;
          break;
        case 'DebitNote':
          route = '/account/debitnote';
          menu = 85;
          break;
        case 'ContraVoucher':
          route = '/account/contravoucher';
          menu = 63;
          break;
        case 'SalesVoucher':
          route = '/sale/salesvoucher';
          menu = 9;
          break;
        default:
          return;
      }
      this.router.navigate([route], {
        queryParams: {
          menu: menu,
          vNo: id,
        },
      });
    });
  }

  onRowDoubleClick(event: any, rowData: any) {
    if (rowData && rowData.accountsTransactionsVoucherType && rowData.accountsTransactionsVoucherNo) {
      this.viewAction(rowData.accountsTransactionsVoucherType, rowData.accountsTransactionsVoucherNo);
    }
  }
  stationmasterObj: StationMaster;
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private accService: AccountstatementService,
    private accountapi: AccountApiService,
    private translate: TranslateService, private exportDocumentService: ExportdocumentService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private utiltiy: UtilityService,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,
    private router: Router,

  ) {

  }

  ngAfterContentInit(): void {
    //document.getElementById('print').hidden = true
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Outstanding Statement') {
          this.Permission = {
            Allow: res?.workGroupPermissionsUallow,
            Add: res?.workGroupPermissionsUadd,
            Delete: res?.workGroupPermissionsUdelete,
            Edit: res?.workGroupPermissionsUedit,
            Print: res?.workGroupPermissionsUprint,
            View: res?.workGroupPermissionsUview
          };
        }
      });
    });

    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";

    });
    this.initializeControls();
    // this.GetCustomerMasterGroup();
    this.GetAllMasterGroup();
    // this.GetSupplierMasterGroup();
    this.LoadCustomerDDL()
    this.LoadSupplierDDL()
  }

  GetLastYearDate(date) {
    date.setFullYear(date.getFullYear() - 1);
    return new Date(date.toDateString())
  }


  DateRangeSelect() {
    let queryString: string = '';

    const min = this.startDate ? this.GetDate(this.startDate, 'yyyy-MM-dd') : null;
    const max = this.endDate ? this.GetDate(this.endDate, 'yyyy-MM-dd') : null;

    if (min) {
      queryString += ` && DateTime(AccountsTransactionsTransDate).Date >= DateTime(${min}).Date`;
    }
    if (max) {
      if (queryString) queryString += ` && `;
      queryString += `DateTime(AccountsTransactionsTransDate).Date <= DateTime(${max}).Date`;
    }

    return queryString;
  }

  GetDate(date: Date, format: string = 'yyyy-MM-dd'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year},${month},${day}`;
  }

  ASOnDateChange() {
    let queryString = '';
    let max = this.GetDate(this.selectedAsOnDate);
    if (this.endDate) {
      // queryString += ` && (AccountsTransactionsTransDate <= DateTime.ParseExact("` + max + `", "dd-MM-yyyy", null))`;
      queryString += `DateTime(AccountsTransactionsTransDate).Date <= DateTime(${max}).Date`;
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
        this.suppliers.unshift({ label: '-- Select Supplier --', value: -1 });

      }
    })
  }
  LoadCustomerDDL() {
    this.accountapi.LoadCustomerDropdown().subscribe((m) => {
      // this.CustomerMasterArray = m.resultSet.customerMasters;
      this.customers = m.resultSet.customerMasters?.map((kl) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
            ' -- ' +
            kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerReffAcNo,
      }));
      this.customers.unshift({
        label: '--Select Customer--',
        value: -1,
      });
    });
  }

  LoadSupplierDDL() {
    this.accountapi.LoadDropdownSuppliersMaster().subscribe((r) => {
      this.suppliers = r.resultSet.suppliersMaster?.map((kl) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierReffAcNo,
      }));
    });
  }

  SupplierDropDownChange() {
    let queryString = '';
    if (this.selectedSupplier != '') {
      queryString += ` && AccountsTransactionsAccNo == "` + this.selectedSupplier + `"`;
    }
    return queryString;
  }

  GetCustomerMasterGroup() {
    this.accService.GetCustomerMasterDropdown().subscribe((response: ApiResponse<any>) => {
      if (response.valid && response.result.length > 0) {
        this.customers = []
        this.customers = response.result.map((data) => ({
          label: data.name,
          value: data.value
        }))
        this.customers.unshift({ label: '-- Select Customer --', value: -1 });

      }
    })
  }

  CustomerDropDownChange() {
    let queryString = '';
    if (this.selectedCustomer != '') {
      queryString += ` && AccountsTransactionsAccNo == "` + this.selectedCustomer + `"`;
    }
    return queryString;
  }

  GetAllMasterGroup() {
    this.accService.GetCustomerSupplierMasterGroup().subscribe((response: ApiResponse<any>) => {
      if (response.valid && response.result.length > 0) {
        this.CustomerSuppliers = response.result.map((data) => ({
          label: data.name,
          value: data.value
        }))
      }
    })
  }

  AllSupplierDropDownChange() {
    let queryString = '';
    if (this.selectedCustomerSuppliers != '') {
      queryString += `"${this.selectedCustomerSuppliers}"`;
    }

    return queryString;
  }

  resetCustomerSelection() {
    this.selectedSupplier = null;
  }

  resetSuppliersSelection() {
    this.selectedCustomer = null;
  }

  ApplyAllFilter() {


    let query = '';
    let message = "Please select voucher range!";
    if (this.radioType == "Customer") {
      query += this.CustomerDropDownChange();

    }
    else if (this.radioType == "Supplier") {
      query += this.SupplierDropDownChange();
    }
    else {
      query += this.AllSupplierDropDownChange();
    }

    if (this.radioTypee == 'DateRange') {
      query += this.DateRangeSelect()
    }
    else {
      //query += this.ASOnDateChange()
    }
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
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter
    }
    this.loading = true;
    this.dataset = [];
    this.accService.GetOutstandingStatementAccountTransactions(this.state).subscribe(
      (response: ApiResponse<any>) => {
        this.loading = false;
        this.listResponse = response?.result;
        console.log(response);
        if (response.valid) {
          this.dataset = response.result.details;
          let zeroToThirty = 0;
          let thirtyOneToSixty = 0;
          let sixtyOneToNinety = 0;
          let ninetyOneToOneEighty = 0;
          let oneEightyToThreeSixty = 0;
          let aboveThreeSixty = 0;
          const now = new Date();

          this.dataset.forEach(element => {
            element.accountsTransactionsTransDateString = this.GetDate(new Date(element?.accountsTransactionsTransDateString));
            if (element.settled === undefined || element.settled === null) {
              element.settled = (Number(element.accountsTransactionsDebit) > Number(element.accountsTransactionsCredit) || Number(element.accountsTransactionsDebit) > 0)
                ? (element.accountsTransactionsAllocDebit || 0)
                : (element.accountsTransactionsAllocCredit || 0);
            }

            const bal = Number(element.accountsTransactionsAllocBalance) || 0;
            if (bal > 0 && element.accountsTransactionsTransDate) {
              const transDate = new Date(element.accountsTransactionsTransDate);
              const diffTime = now.getTime() - transDate.getTime();
              const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              if (days <= 30) {
                zeroToThirty += bal;
              } else if (days <= 60) {
                thirtyOneToSixty += bal;
              } else if (days <= 90) {
                sixtyOneToNinety += bal;
              } else if (days <= 180) {
                ninetyOneToOneEighty += bal;
              } else if (days <= 360) {
                oneEightyToThreeSixty += bal;
              } else {
                aboveThreeSixty += bal;
              }
            }
          });

          const backendTotalAging = (Number(response.result.zeroToThirty) || 0) +
            (Number(response.result.thirtyOneToSixty) || 0) +
            (Number(response.result.sixtyOneToNinety) || 0) +
            (Number(response.result.ninetyOneToOneEighty) || 0) +
            (Number(response.result.oneEightyToThreeSixty) || 0) +
            (Number(response.result.aboveThreeSixty) || 0);

          if (backendTotalAging > 0) {
            this.ZeroToThirty = Number(response.result.zeroToThirty) || 0;
            this.ThirtyOneToSixty = Number(response.result.thirtyOneToSixty) || 0;
            this.SixtyOneToNinety = Number(response.result.sixtyOneToNinety) || 0;
            this.NinetyOneToOneEighty = Number(response.result.ninetyOneToOneEighty) || 0;
            this.OneEightyToThreeSixty = Number(response.result.oneEightyToThreeSixty) || 0;
            this.aboveThreeSixty = Number(response.result.aboveThreeSixty) || 0;
          } else {
            this.ZeroToThirty = zeroToThirty;
            this.ThirtyOneToSixty = thirtyOneToSixty;
            this.SixtyOneToNinety = sixtyOneToNinety;
            this.NinetyOneToOneEighty = ninetyOneToOneEighty;
            this.OneEightyToThreeSixty = oneEightyToThreeSixty;
            this.aboveThreeSixty = aboveThreeSixty;
          }
        }
      },
      (err) => {
        this.loading = false;
      }
    );
  }



  listResponse: any;
  DownloadOutstandingStatementPrint(event, type) {
    if (!this.dataset) {
      return;
    }
    this.state = {
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter,
      Extension: type
    } //"wwwroot/SiteDocument/SiteDemo1/FileDocument.doc" static file path
    this.accService.DownloadVoucherPrint(this.state).subscribe((event) => {
      let data = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type
      });
      console.log("ddd", downloadedFile)
      if (downloadedFile.type != "") {
        // if(type =="PDF"){
        //   window.open(URL.createObjectURL(downloadedFile));
        // }
        // else{
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = "VoucherPrint";
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
        //   }
      }
    });
  }
  AddLog(Entity, type, section, VpNo = '', VpType = '') {
    this.LogForm.controls["OtherType"].setValue(type);
    this.LogForm.controls["Entity"].setValue(Entity);
    this.LogForm.controls["Section"].setValue(section);
    this.LogForm.controls["VpNo"].setValue(VpNo);
    this.LogForm.controls["VpType"].setValue(VpType);
    this.utiltiy.AddUserTrackingLog(this.LogForm.value).subscribe((response: ApiResponse<any>) => {
      if (!response.valid) {
        Swal.fire({
          text: "Something went wrong. Logs not Saved",
          title: "Oops!",
          icon: "error"
        });
      }
    });
  }
  Print() {
    var css: string = `
    .customers1 {
      // font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width:100%;
    }
    
    .customers1 td,
    .customers1 th {
      border: 1px solid #ddd;
      padding: 8px;
      // text-align: center;
    }
    
    .customers1 tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    
    .customers1 tr:hover {
      background-color: #ddd;
    }
    
    .customers1 th {
      padding-top: 12px;
      padding-bottom: 12px;
      background-color: #bcc0bf;
      color: rgb(0, 0, 0);
      text-align: left;
    
    }
    .flex {
      display: flex;
      margin-bottom: 5px;
      gap: 4px; /* Adjusted the gap value here */
     }
    .contain1{
      width: 49.5%;
       border-radius: 1px;
      margin-top: 2%;
        padding-bottom: 0%;
      padding: 8px;
     }
    .contain2{
      width: 49.5%;
       border-radius: 1px;
      margin-top: 5%;
        padding-bottom: 0%;
      padding: 8px;
      margin-left: 5px;
     }
     .center{
      margin-top:9%; 
       margin-left:35px;
    
     }
 
  .namefont{
  font-size: 16px;
  }
.ab {
 font-size: 18px;
  text-align: center;
  margin-top: 25px;
  margin-bottom: 5px;
}
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
      
.spac1{
margin-top:20px;
}
  .rowgap{
      gap: 111px;
  }
.squreImg {
  height: 100px;
  width: 100px;
}
            .rectImg {
height: 140px;
    width: 217px;
}
    .customers {
  // font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width:100%;
}

.customers td,
.customers th {
  border: 1px solid #ddd;
  padding: 8px;
  // text-align: center;
}

.customers tr:nth-child(even) {
  background-color: #f2f2f2;
}

.customers tr:hover {
  background-color: #ddd;
}

.customers th {
  padding-top: 12px;
  padding-bottom: 12px;
  background-color: #bcc0bf;
  color: rgb(0, 0, 0);
  text-align: left;

}
    `
    //this.AddLog("Account Transaction","Print","Outstanding Statement Grid Table")
    this.exportDocumentService.PrintPDF('print', css)
  }

  Export2Word() {
    let printPayload = {
      Skip: 0,
      Take: 10000,
      Field: "",
      Dir: "",
      Search: "",
      Filter: "",
      Total: 0,
      Extension: "DOC",
      FormatType: this.formatType
    }
    this.accService.DownloadOutstandingPrint(printPayload).subscribe((event) => {
      let data: any = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type
      });
      console.log("ddd", downloadedFile)
      if (downloadedFile.type != "") {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = "OutstandingPrint";
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }

  Export2Excel() {
    let printPayload = {
      Skip: 0,
      Take: 10000,
      Field: "",
      Dir: "",
      Search: "",
      Filter: "",
      Total: 0,
      Extension: "XLSX",
      FormatType: this.formatType
    }
    this.accService.DownloadOutstandingPrint(printPayload).subscribe((event) => {
      let data: any = event as HttpResponse<Blob>;
      const downloadedFile = new Blob([data.body as BlobPart], {
        type: data.body?.type
      });
      console.log("ddd", downloadedFile)
      if (downloadedFile.type != "") {
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = "OutstandingPrint";
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
      }
    });
  }


  currentDate: Date = new Date();
  //////////////  Printing Starts Here  //////////////
  changeFormatType(format: string) {
    this.formatType = format;
  }
  totaldebit: number = 0;
  totalcredit: number = 0;

  displayPrint() {
    this.printAsPdf();
    //  this.displayPrintPreview = true;
  }
  printAsPDF() {
    var css: string = `
.customers {
  // font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
   width:100%;
}

.customers td,
.customers th {
  border: 1px solid #ddd;
  padding: 8px;
  // text-align: center;
}

.customers tr:nth-child(even) {
  background-color: #f2f2f2;
}

.customers tr:hover {
  background-color: #ddd;
}

.customers th {
  padding-top: 12px;
  padding-bottom: 12px;
  background-color: #bcc0bf;
  color: rgb(0, 0, 0);
  text-align: left;

}
    .customers1 {
      // font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
       width:100%;
    }
    
    .customers1 td,
    .customers1 th {
      border: 1px solid #ddd;
      padding: 8px;
      // text-align: center;
    }
    
    .customers1 tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    
    .customers1 tr:hover {
      background-color: #ddd;
    }
    
    .customers1 th {
      padding-top: 12px;
      padding-bottom: 12px;
  background-color: #bcc0bf;
      color: rgb(0, 0, 0);
      text-align: left;
    
    }
    .flex {
      display: flex;
      margin-bottom: 5px;
      gap: 4px; /* Adjusted the gap value here */
     }
    .contain1{
      width: 49.5%;
       border-radius: 1px;
      margin-top: 2%;
        padding-bottom: 0%;
      padding: 8px;
     }
    .contain2{
      width: 49.5%;
       border-radius: 1px;
      margin-top: 5%;
        padding-bottom: 0%;
      padding: 8px;
      margin-left: 5px;
     }
     .center{
      margin-top:9%; 
       margin-left:35px;
    
     }
 
  .namefont{
  font-size: 16px;
  }
.ab {
 font-size: 18px;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 5px;
}
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
      
.spac1{
margin-top:20px;
}
  .rowgap{
      gap: 111px;
  }
.squreImg {
  height: 100px;
  width: 100px;
}
            .rectImg {
height: 140px;
    width: 217px;
}  
    
.second {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #f5f6f8;
  border: 1px solid #c7baba;
  border-right: 7px solid #c7baba;
  border-bottom: 7px solid #c7baba;
  justify-content: center;
  margin: auto;
margin-bottom: 8px;

}
.row {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.ad {
    margin: 0;
    padding: 5px;
    flex: 1;
    text-align: left; /* Ensures Acc. Name is left-aligned */
        margin-left: 10px;

}

.ae {
    margin: 0;
    padding: 5px;
    text-align: center; /* Centers the "As on Date" */
    flex: 1;
}
`;
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
    // let html: any = document.getElementById('print');
    // this.printService.saveAsPDF(html);
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  userTrackingLog(type, vno?: any) {
    let req = {
      page: 'OutStanding Statement ',
      // section: this.savedPurchaseVoucher,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: vno,
      vpType: 'OutStanding Statement',
      vpUserId: this.permission.getUser()?.userId
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }


  // stationmasterArray: Array<StationMaster> = [];
  // stationmasterObj: StationMaster;
  // displayMaximizeable: boolean = false;
  // getAllStationMaster() {
  //   this.masterApi.GetAllStation().subscribe(response => {

  //     this.stationmasterObj = response[0];
  //     console.log(this.stationmasterObj);
  //   },
  //   );
  // }

  printAsPdf() {
    this.printSimpleReport('crptAccountOutstandingStatement', ExportFormatType.PortableDocFormat);
  }
  printSimpleReport(
    type: string,
    exportType: ExportFormatType = ExportFormatType.PortableDocFormat
  ): void {


    let selection = this.selectedSupplier != null ? String(this.selectedSupplier) : this.selectedCustomer;
    if (this.radioType == 'Supplier') {
      this.selectedName = this.suppliers.find((res) => res.value == selection)?.label
    } else {
      this.selectedName = this.customers.find((res) => res.value == selection)?.label
    }
    const rptFilter = {
      ReportName: 'crptOutstandingDetails',
      SelectionFormula: '',
      Parameters: [
      // {
      
      //   Key: '@DateCriteria',
      //         Value: `from ${this.datePipe.transform(
      //           this.selectedAsOnDate ?? new Date(),
      //           'dd-MM-yyyy'
      //         )} to ${this.datePipe.transform(
      //           this.selectedAsOnDate ?? new Date(),
      //           'dd-MM-yyyy'
      //         )}`,
      // },
      // {
      //   Key: '@CompanyName',
      //   Value: this.stationmasterObj?.stationMasterStationName,
      // },
    ],
      Queries: [],
      SP_Queries: [
        {
          SP_Name: 'GetOutStandingDetails',
          Parameters: [
            {
              Key: '@ASONDate',
              Value: `${this.datePipe.transform(
                this.selectedAsOnDate ?? new Date(),
                'yyyy-MM-dd'
              )} 00:00:00`,
            },
            {
              Key: '@AccNo',
              Value: selection,
            },
            {
              Key: 'CompanyName',
              Value: this.stationmasterObj?.stationMasterStationName,
            },
            {
              Key: 'DateCriteria',
              Value: `from ${this.datePipe.transform(
                this.selectedAsOnDate ?? new Date(),
                'dd-MM-yyyy'
              )} to ${this.datePipe.transform(
                this.selectedAsOnDate ?? new Date(),
                'dd-MM-yyyy'
              )}`,
            },
             {
              Key: '0To30',
              Value: this.ZeroToThirty,
            },
            {
              Key: '31To60',
              Value: this.ThirtyOneToSixty,
            },
            {
              Key: '61To90',
              Value: this.SixtyOneToNinety,
            },
            {
              Key: '91To180',
              Value: this.NinetyOneToOneEighty,
            },
            {
              Key: '181To360',
              Value: this.OneEightyToThreeSixty,
            },
            {
              Key: 'Above360',
              Value: this.aboveThreeSixty,
            },
            {
              Key: 'CustomerName',
              Value: this.selectedName,
            },
          ],
        },
      ],
      ExportType: exportType,
    };

    this.crystalReportService
      .getReportPrintBySp(rptFilter)
      .subscribe({
        next: (response: BlobPart) => {

          const isExcel =
            exportType === ExportFormatType.Excel;

          const fileBlob = new Blob(
            [response],
            {
              type: isExcel
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/pdf',
            }
          );

          const fileURL = URL.createObjectURL(fileBlob);

          if (isExcel) {
            const link = document.createElement('a');

            link.href = fileURL;
            link.download = `${type}.xlsx`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(fileURL);
          } else {
            window.open(fileURL, '_blank');

            // Give the browser time to open the PDF before revoking the URL.
            setTimeout(() => {
              URL.revokeObjectURL(fileURL);
            }, 1000);
          }
        },

        error: (error) => {
          console.error('Report generation failed:', error);
        },
      });
  }
} 
