import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DialogService } from 'primeng';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { AdministrationService } from 'src/app/routes/service/Administrations/administration.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss']
})
export class UserActivityComponent implements OnInit {
  title: string;
  subtitle: string;
  index: number = 0;
  UserTrackingReport: FormGroup;
  defaultValue: any
  vouchertype: any;
  ActionType: any;
  UserName: any;
  ActionTypelist: any;
  vouchertypelist: any;
  UserNamelist: any;
  displayPrintPreview: boolean = false;
  columns = [1, 2, 3, 4]; // Represents the columns in each row
  emptyRows = Array(15).fill(null); // Array of 4 empty rows
  reportList: any[] = [];
  handleChange(e) {
    this.index = e.index;
  }
  dataset: any;
  licensekey: any;
  gridHeader: string;
  hotid = 'usertrack';
  private hotRegisterer = new HotTableRegisterer();
  usertrack: Handsontable.GridSettings;
  selectedView: string = 'Summary';
  initializeControls() {
    this.usertrack = {
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
          data: 'UserName',
          type: 'text',
          renderer: 'centeredText'
        },
        {
          data: 'InvoiceType',
          type: 'numeric',
          renderer: 'centeredText'
        },
        {
          data: 'Date',
          type: 'numeric',
          renderer: this.dateCenteredTextRenderer.bind(this)
        },
        {
          data: 'Time',
          type: 'numeric',
          renderer: this.timeCenteredTextRenderer.bind(this)
        },
        {
          data: 'VNo_AccNo',
          type: 'numeric',
          renderer: 'centeredText'
        },
        {
          data: 'Actions',
          type: 'text',
          renderer: 'centeredText'
        },
      ],
      colHeaders: [
        this.translate.instant('User Name'),
        this.translate.instant('Invoice Type'),
        this.translate.instant('Date'),
        this.translate.instant('Time'),
        this.translate.instant('VNo/AccNo'),
        this.translate.instant('Actions'),

      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }
  stationmasterObj: StationMaster;
  constructor(private router: Router,
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private AdministrationService: AdministrationService,
    private datePipe: DatePipe,
    private printService: FileSaverService,

    public dialogService: DialogService,
    private permission: PermissionsService,

    private utilityService: UtilityService,

  ) {
    Handsontable.renderers.registerRenderer('centeredText', this.centeredTextRenderer);
      this.licensekey = defaults.hotlicensekey;
  }

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;


    });
    this.stationmasterObj = this.permission.getStation();
    this.UserTrackingReport = new FormGroup({
      UserNameId: new FormControl(''),
      ActionId: new FormControl(''),
      VocherTypeId: new FormControl(''),
      DateFrom: new FormControl(new Date()),
      DateTo: new FormControl(new Date()),
      isDate: new FormControl(),
    });

    this.initializeControls()
    this.GetTrackingUserVPType()
    this.GetTrackingUserVPAction()
    this.GetTrackingUserUserFile()
  }
  GetTrackingUserVPType() {
    this.AdministrationService.GetTrackingUserVPType().subscribe((res) => {
      this.vouchertype = res.resultSet.response
      this.vouchertypelist = res.resultSet.response
        .map((kl) => ({ label: kl?.vpType, value: kl.vpType }));
      this.vouchertypelist.unshift({ label: '--Select--', value: -1 });
    })
  }
  GetTrackingUserVPAction() {
    this.AdministrationService.GetTrackingUserVPAction().subscribe((res) => {
      this.ActionType = res.resultSet.response
      this.ActionTypelist = res.resultSet.response
        .map((kl) => ({ label: kl?.userTrackingUserVpAction, value: kl.userTrackingUserVpAction }));
      this.ActionTypelist.unshift({ label: '--Select--', value: -1 });
    })
  }
  GetTrackingUserUserFile() {
    this.AdministrationService.getTrackingUserFile().subscribe((res) => {
      this.UserName = res.resultSet.response

      this.UserNamelist = res.resultSet.response
        .map((kl) => ({ label: kl?.username, value: kl.logInId }));
      this.UserNamelist.unshift({ label: '--Select--', value: -1 });
    })
  }


  show() {
    if (this.UserTrackingReport.get('isDate').value === true) {
      this.defaultValue = {
        isCheck: true,
        userid: this.UserTrackingReport.value.UserNameId ? this.UserTrackingReport.value.UserNameId : 0,
        vpAction: this.UserTrackingReport.value.ActionId ? this.UserTrackingReport.value.ActionId : null,
        vpType: this.UserTrackingReport.value.VocherTypeId ? this.UserTrackingReport.value.VocherTypeId : null,
        fromDate: this.UserTrackingReport.get('isDate').value === true ? this.UserTrackingReport.value.DateFrom : null,
        toDate: this.UserTrackingReport.get('isDate').value === true ? this.UserTrackingReport.value.DateTo : null,
      }
    } else {
      this.defaultValue = {
        isCheck: false,
        userid: this.UserTrackingReport.value.UserNameId ? this.UserTrackingReport.value.UserNameId : 0,
        vpAction: this.UserTrackingReport.value.ActionId ? this.UserTrackingReport.value.ActionId : null,
        vpType: this.UserTrackingReport.value.VocherTypeId ? this.UserTrackingReport.value.VocherTypeId : null,
        fromDate: this.UserTrackingReport.get('isDate').value === true ? this.UserTrackingReport.value.DateFrom : null,
        toDate: this.UserTrackingReport.get('isDate').value === true ? this.UserTrackingReport.value.DateTo : null,
      }
    }
    this.AdministrationService.GetUserTrackingDetails(this.defaultValue).subscribe((response: any) => {
      this.reportList = response.result
      this.dataset = response.result?.map((item: any) => ({
        UserName: item.userName,
        InvoiceType: item.vP_Type,
        Date: item.change_Dt,
        Time: item.change_Time,
        VNo_AccNo: item.user_VP_NO,
        Actions: item.vP_Action,
      })) || [];

    });
  }
  centeredTextRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.style.textAlign = 'center';
  }
  dateCenteredTextRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      td.innerText = formattedDate ? formattedDate : '';
    } else {
      td.innerText = '';
    }
    td.style.textAlign = 'center';
  }

  timeCenteredTextRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    if (value) {
      const formattedTime = this.datePipe.transform(value, 'HH:mm:ss');
      td.innerText = formattedTime ? formattedTime : '';
    } else {
      td.innerText = '';
    }
    td.style.textAlign = 'center';
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  clear() {
    this.UserTrackingReport.get('UserNameId').setValue('')
    this.UserTrackingReport.get('ActionId').setValue('')
    this.UserTrackingReport.get('VocherTypeId').setValue('')
    this.UserTrackingReport.get('DateFrom').setValue(new Date())
    this.UserTrackingReport.get('DateTo').setValue(new Date())

  }

  getSalesVoucherreport() {
    const fileName = String(new Date().valueOf());
    var css: string = `
 .heading{
    margin-top: 15px;
    margin-bottom: 15px; 
    text-align: center;
  }
#customers {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}
.rectImg {
height: 140px;
    width: 217px;
}

.squreImg {
  height: 145px;
  width: 145px;
}
#customers td,
#customers th {
  border: 1px solid #ddd;
  padding: 8px;

}

#customers tr:nth-child(even) {
  background-color: #f2f2f2;
}

#customers tr:hover {
  background-color: #ddd;
}

#customers th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #bcc0bf;
  color: rgb(0, 0, 0);
  text-align: center;
}
  .flex {
      display: flex;
      margin-bottom: 5px;
      gap: 2px; /* Adjusted the gap value here */
     }

    .contain1{
      width: 43.5%;
       border-radius: 1px;
      margin-top: 6%;
       padding-bottom: 0%;
      padding: 8px;
     }

    .contain2{
      width: 43.5%;
       border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
      padding: 8px;
      margin-left: 65px;
     }

     .bank2 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49.5%;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
      padding: 8px;
      box-shadow: 5px 5px rgb(201, 204, 204);
     }

   .w70{
    width:280px;
   }

    .bank1 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49%;
      padding: 8px;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
        box-shadow: 5px 5px rgb(201, 204, 204);
    }

  .min-panel {
      min-height: 106px !important;
  }

  :host ::ng-deep .ui-table .ui-table-thead>tr>th {
      position: -webkit-sticky;
      position: sticky;
      top: -8px;
      box-shadow: 1px 3px 6px 0 rgba(32, 33, 36, 0.10);
  }

  @media screen and (max-width: 64em) {
      :host ::ng-deep .ui-table .ui-table-thead>tr>th {
          top: -8px;
      }
  }

  .ui-dropdown {
      min-width: 50% !important;
  }

  .signature-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
  }

  .customer-signature {
      order: 1; /* Specifies the order of the flex items */
  }

  .authorized-signature {
      order: 2; /* Specifies the order of the flex items */
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

    .border{
        border: 1px #b1aeae solid;
        border-radius: 5px ;
        margin-bottom: 5px;
        padding: 15px;
    }
    .bR{
      border-right: 1px solid #ddd ;
      margin-right:10px ;
    }

    .rowgap{
        gap: 111px;
    }
    .w-80 {
      width: 70% !important;
    }
    .w-20 {
      width: 30% !important;
    }
    .flexSpaceBetween{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-bottom: 20px;
    }

    .center {
      text-align: center;
    }

    .alignEnd{
      align-items: end;
  }

  .end{
    text-align: end;
  }

  .w-100 {
    width: 100% !important;
  }
  h2{
    margin: 0 0 8px 0;
  }

  .wp-50{
    width: 50% !important;
  }

  .alignstart{
    text-align: start;
  }
  .w-80 {
    width: 75% !important;
  }
  .w-20{
    width: 25% !important;
  }
  .page {
    page-break-after: always;
  }
  h2{
    margin: 0 0 8px 0;
  }
  h1{
    margin: 0 0 8px 0;
  }
  h1{
    margin: 0 0 8px 0;
  }
  .w0 {
    width: 40px !important;
  }
  .w50 {
    width: 35px !important;
  }

  @page {
    margin: 5mm 10mm;

  }
  @media print {
    thead {display: table-header-group;}
    tfoot {display: table-footer-group;}
    table { page-break-inside:auto ;
      font-size: 11px;}
    tr { page-break-inside:avoid; page-break-after:auto }

    body {margin: 0;}

    .gaprow{
      gap: 50px;
    }
    .container {
      position: relative;
      min-height: 100vh;
    }
    .print.page {
      page-break-after: always; /* Force page break after content */
      font-size: 12px;
    }
    .page-footer {
      // position: running(footer); /* Use "fixed" for sticking on the last page */
      position: absolute;
  bottom: 0;
  width: 100%;
  height: 2.5rem;            /* Footer height */
}

    }

    @page :last {  /* Target the last page */

    }

  }
  #page-container {
    position: relative;
    min-height: 100vh;
  }

  #content-wrap {
    padding-bottom: 2.5rem;    /* Footer height */
  }

  #footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 2.5rem;            /* Footer height */
  }

 `;
    this.printService.PrintPDF('contentToConvertSv', css);
    this.userTrackingLog('PDF');
  }
  displayPrint() {
    this.displayPrintPreview = true;
    // this.calculateNumberOfPages()
  }

  userTrackingLog(type) {
    let req = {
      page: 'User Activity Print',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: '',
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  printAsPDF() {
    this.getSalesVoucherreport();

    this.displayPrintPreview = false;
  }
}
