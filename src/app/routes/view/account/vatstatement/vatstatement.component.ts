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
import { MessageService } from 'primeng';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { VATTYPE } from 'src/app/routes/Enums/Allocation';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-vatstatement',
  templateUrl: './vatstatement.component.html',
  styleUrls: ['./vatstatement.component.scss'],
})
export class VatstatementComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  index: number = 0;
  licensekey: any;
  gridHeader: string;
  display = true;
  displayDetailed = false;
  displaySummary = false;
  VSForm: FormGroup;
  voucherTypes: any[] = [];
  selectedVoucherTypes: any[] = [];
  displayPrintPreview: boolean = false;
  asOnAndDateRange = 'asOndate';
  startDate: Date = new Date();
  endDate: Date = new Date();
  selectedAsOnDate: Date = new Date();
  detailedOrSummary: string = 'Detailed';
  filter: string;
  state: any;
  dataset2: any;
  search: any;
  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  dataFormat: string = 'mm/dd/yy';
  ScreenId: number;
  Permission: any;
  view: any = '';
  selectedVouchers: any[] = [];
  VatRecievable: any;
  VatPayable: any;

  handleChange(e) {
    this.index = e.index;
  }

  toggle() {
    this.display = !this.display;
  }

  ResetFormat(format: any, view: any) {
    this.dataFormat = format;
    this.view = view;
    this.startDate = new Date();
    this.endDate = new Date();
    this.selectedAsOnDate = new Date();
  }

  DetailedOrSummary(type: string) {
    this.detailedOrSummary = type;
    this.GetGridListData();
  }

  Summary() {
    this.displaySummary = !this.displaySummary;
    this.displayDetailed = false;
  }

  hotid = 'detailed';
  private hotRegisterer = new HotTableRegisterer();
  detailed: Handsontable.GridSettings;
  isVatAccountsChecked: boolean = false;
  isVatPayableChecked: boolean = false;
  isVatReceivableChecked: boolean = false;

  initializeControls() {
    this.detailed = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [70, 70, 70, 70, 70, 70, 100, 70, 70, 100, 70],
      minRows: 3,
      width: '100%',
      height: 300,
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
          data: 'voucherNo',
          type: 'text',
        },
        {
          data: 'date',
          type: 'text',
        },
        {
          data: 'voucherType',
          type: 'text',
        },
        {
          data: 'accountName',
          type: 'text',
        },
        {
          data: 'vatNo',
          type: 'text',
        },
        {
          data: 'description',
          type: 'text',
        },
        {
          data: 'vatAmount',
          type: 'text',
        },
        {
          data: 'debit',
          type: 'text',
        },
        {
          data: 'credit',
          type: 'text',
        },
        {
          data: 'runningBalance',
          type: 'text',
        },
        {
          data: 'refNo',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('V NO'),
        this.translate.instant('Date'),
        this.translate.instant('V Type'),
        this.translate.instant('Party Name'),
        this.translate.instant('VAT No'),
        this.translate.instant('Description'),
        this.translate.instant('Variable Amount'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('Running Balance'),
        this.translate.instant('Ref. No'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }
  hotid1 = 'summary';
  //private hotRegisterer = new HotTableRegisterer();
  summary: Handsontable.GridSettings;

  initializeControls1() {
    this.summary = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [70, 70, 70, 70, 70],
      minRows: 3,
      width: '100%',
      height: 300,
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
          data: 'accountName',
          type: 'text',
        },
        {
          data: 'accountNo',
          type: 'text',
        },
        {
          data: 'debit',
          type: 'text',
        },
        {
          data: 'credit',
          type: 'text',
        },
        {
          data: 'runningBalance',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('Account Name'),
        this.translate.instant('Account Code'),
        this.translate.instant('Total Debit'),
        this.translate.instant('Total Credit'),
        this.translate.instant('Running Balance'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private accservice: AccountstatementService,
    private permission: PermissionsService,
    private messageService: MessageService,
    private printService: FileSaverService
  ) {}

  GetDistinctVoucherType() {
    this.accservice.GetDistinctVoucherType().subscribe((response: any) => {
      if (response?.result?.length > 0) {
        const voucherTypes: any[] = response.result.filter(
          (e) => e.name && !Object.values(VATTYPE).includes(e.name)
        );

        this.voucherTypes = voucherTypes.map((data) => ({
          label: data.name,
          value: data.value,
        }));
        const otherRecords = response.result.filter((e) =>
          Object.values(VATTYPE).includes(e.name)
        );
        const parseAccountNo = (val?: string) => {
          if (!val) return undefined;
          const parts = val.split('::');
          return (parts.length > 1 ? parts[1] : parts[0])?.trim() || undefined;
        };
        const P = otherRecords.find((n) => n.name == VATTYPE.VATOUTPUT)?.value;
        const R = otherRecords.find((n) => n.name == VATTYPE.VATINPUT)?.value;
        this.VatPayable = parseAccountNo(P);
        this.VatRecievable = parseAccountNo(R);
      }
    });
  }

  // GetAllAcounts() {
  //   this.accountapi.GetAllAcounts().subscribe((k: any) => {
  //     if (k && k.result) {

  //     };
  //   })
  // }

  onVTypeChange(selectedOption: any) {
    // Handle the selected option change here
    this.selectedVouchers = [];
    selectedOption?.forEach((value, index) => {
      this.selectedVouchers?.push(value.value);
    });
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'VAT Statementt') {
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
    });

    this.GetDistinctVoucherType();
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
    this.initializeControls1();
  }

  // GetDate(date: Date) {
  //   var dd = String(date.getDate()).padStart(2, '0');
  //   var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  //   var yyyy = date.getFullYear();

  //   let returnDate = yyyy + '-' + mm + '-' + dd;
  //   return returnDate;
  // }

  // DateRangeFilter() {
  //   let queryString: string = '&& (';
  //   let min = this.GetDate(this.startDate);
  //   let max = this.GetDate(this.endDate);
  //   if (this.startDate) {
  //     queryString += ` (AccountsTransactionsTransDate >= Convert.ToDateTime("` + min + `"))`;
  //   }
  //   if (this.endDate) {
  //     queryString += ` && (AccountsTransactionsTransDate <= Convert.ToDateTime("` + max + `"))`;
  //   }

  //   return queryString + ' )';
  // }

  // ASOnDateChange() {
  //   let queryString = '';
  //   let max = this.GetDate(this.selectedAsOnDate);
  //   if (this.selectedAsOnDate) {
  //     queryString += ` && (AccountsTransactionsTransDate <= Convert.ToDateTime("` + max + `"))`;
  //   }
  //   return queryString;
  // }

  // SelectVoucherTypes() {
  //   let queryString = '';
  //   if (this.selectedVoucherTypes.length > 0) {
  //     let value: string = " ";
  //     this.selectedVoucherTypes.forEach((x) => {

  //       value += '(AccountsTransactionsVoucherType == "' + x + '") ||'
  //     })
  //     queryString += " && (" + value.slice(0, -2) + ")"
  //   }
  //   return queryString;
  // }

  // ShowData() {
  //   let query = '';
  //   if (this.asOnAndDateRange == "asOndate") {
  //     query += this.ASOnDateChange();
  //   }
  //   else {
  //     query += this.DateRangeFilter();
  //   }

  //   query += this.SelectVoucherTypes();
  //   this.filter = query;

  //   this.GetGridListData(null);
  // }

  GetGridListData() {
    const account: any[] = [];
    if (this.isVatAccountsChecked) {
      if (this.isVatPayableChecked && this.VatPayable) {
        account.push(this.VatPayable);
      }
      if (this.isVatReceivableChecked && this.VatRecievable) {
        account.push(this.VatRecievable);
      }
    }
    if (account.length === 0) {
      if (this.VatPayable) account.push(this.VatPayable);
      if (this.VatRecievable) account.push(this.VatRecievable);
    }

    const isDateRange = this.asOnAndDateRange !== 'asOndate';
    this.state = {
      fromDate: isDateRange ? this.startDate : this.selectedAsOnDate,
      toDate: isDateRange ? this.endDate : this.selectedAsOnDate,
      isDate: isDateRange,
      voucherType: this.selectedVouchers ?? [],
      accounts: account,
    };

    if (this.detailedOrSummary === 'Summary') {
      this.accservice.GetVatStatementSummary(this.state).subscribe(
        (response: ApiResponse<any>) => {
          if (response?.valid) {
            this.dataset = response.result?.details ?? [];
          } else {
            this.dataset = [];
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: response?.message,
            });
          }
        },
        () => {
          this.dataset = [];
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Unable to load VAT statement summary.',
          });
        }
      );
    } else {
      this.accservice.GetVatStatementDetail(this.state).subscribe(
        (response: ApiResponse<any>) => {
          if (response?.valid) {
            this.dataset2 = response.result?.details ?? [];
          } else {
            this.dataset2 = [];
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: response?.message,
            });
          }
        },
        () => {
          this.dataset2 = [];
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Unable to load VAT statement detail.',
          });
        }
      );
    }
  }

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
    }
    .contain1{
      width: 47%;
       border-radius: 1px;
      margin-top: 6%;
        padding-bottom: 0%;
      padding: 8px;
     } 
     .center{
      margin-top:5%;
     }
    .contain2{ 
      width: 53%;
       border-radius: 1px;
      margin-top: 5px;
      font-size: 18px;
       padding-bottom: 0%;
      padding: 8px;
      margin-left: 5px;
     }
    .ab {
    
      text-align: center;
      margin-top: 25px;
      margin-bottom: 5px;
    }
    
    .ac {
    
      text-align: center;
    
      font-size: 1.3rem;
    
      font-weight: 500;
    
      color: rgb(185, 13, 13);
    
      margin-bottom: 3%;
    
    }
    
    .second {
      width: 100%;
      background-color: #f5f6f8;
      border: 1px solid #c7baba;
      border-right: 7px solid #c7baba;
      border-bottom: 7px solid #c7baba;
      justify-content: center;
      margin: auto;
    margin-bottom: 8px;
    }
    
    .ad {
    
      margin-top: .5rem;
      margin-left: 3%;
     
    }
    
    .ae {
    
      margin-top: .5rem;
      margin-left: 3%;
     
    }
    
    .customers {
    
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
      margin: auto;
    
    }
    .customers td,
    .customers th {
    
      border: 1px solid #ddd;
      padding: 8px;
    
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
      text-align: left;
      background-color: rgb(247, 240, 240);
      color: black;
    
    
    }
    
    .total {
      justify-content: end;
      display: flex;
      gap: 64px;
      width: 88%;
    
    }
    
    .af {
      margin-top: 1%;
      text-align: center;
    }
    
    .ag {
    
      margin-top: 2%;
      text-align: center;
      font-size: 1.4rem;
      font-weight: 700;
    
    }
    
    .double-underline {
      border-bottom: 2px solid;
      text-decoration: underline;
      width: 30%;
    
    }
    
    .ah {
      text-align: center;
      margin-left: 150px;
    }
    .row {
    
      display: inline-flex;
    
      margin-left: 680px;
    
      margin-top: 2%;
        }
        .end {
      text-align: end;
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
  }
}
