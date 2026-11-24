import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng';
import { MenuItem } from 'primeng/api/menuitem';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';

@Component({
  selector: 'app-stock-adjustment-report',
  templateUrl: './stock-adjustment-report.component.html',
  styleUrls: ['./stock-adjustment-report.component.scss'],
})
export class StockAdjustmentReportComponent implements OnInit {
  displayPrintPreview: boolean = false;
  StockAdjustmentReportFrom: FormGroup;
  reportData: any;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  totalsdk: any = 0;
  totalCost: any = 0;
  totalQTY: any = 0;
  totalValue: number = 0;
  ScreenId: number;
  Permission: any;
  user: any;
  hideJobDetail: boolean = false;
  span: any;
  constructor(
    private router: Router,
    private activatedroute: ActivatedRoute,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private stockApi: StockApiService,
    private masterapi: MasterApiService,
    private formatDateService: ReportDateFormatService,

    private permission: PermissionsService
  ) {}

  title: string;
  breadcumbmodel: MenuItem[];

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
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

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.StockAdjustmentReportFrom = new FormGroup({
      jobId: new FormControl(''),
      DateTO: new FormControl(new Date()),
      DateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear() - 5))
      ),
      isDate: new FormControl(true),
      total: new FormControl(),
    });
    this.getAlljob();
    this.bykeys();
    // this.getAllStationMaster()
  }
  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail')
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.span = this.hideJobDetail ? 3 : 4;
      });
  }
  printAsPDF() {
    const fileName = String(new Date().valueOf());
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

    .payment1 {

      border-radius: 1px;
      padding: 10px;
      border: 2.5px solid rgb(201, 204, 204);
      box-shadow: 5px 5px rgb(201, 204, 204);

    }
    .w60{
    width: 60px;
    }
    .w80{
    width: 130px;
    text-align: left;
    }


    .stock{
       margin-top: 10px;    border-radius:5px;
       border: 2.5px solid rgb(211, 214, 214);
       width: 100%;
    }
    #report {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
      font-size: 12px;
    }

    #report td, #report th {
      border: 1px solid #ddd;
      padding: 8px;

    }

    #report tr:nth-child(even){background-color: #f2f2f2;}

    #report tr:hover {background-color: #ddd;}

    #report th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #dfe4e3;
      color: rgb(0, 0, 0);
      text-align: center;
    }

    .header {
      display: flex;
      align-items: center;
      margin-top: -20px;
      margin-bottom: -20px;
    }

    .end {
      text-align: end;
    }

    .center {
      text-align: center !important;
    }

    `;
    this.printService.PrintPDF('contentToConvert', css);
    this.userTrackingLog('PDF');
  }
  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  show() {
    let defaultValue = {
      jobId: this.StockAdjustmentReportFrom.value.jobId
        ? this.StockAdjustmentReportFrom.value.jobId
        : null,
      fromDate:
        this.StockAdjustmentReportFrom.get('isDate').value === true
          ? this.formatDateService.formatDatetime(
              this.StockAdjustmentReportFrom.value.DateFrom,
              true
            )
          : null,
      toDate:
        this.StockAdjustmentReportFrom.get('isDate').value === true
          ? this.formatDateService.formatDatetime(
              this.StockAdjustmentReportFrom.value.DateTO,
              false
            )
          : null,
    };
    this.stockApi
      .StockAdjustmentReport(defaultValue)
      .subscribe((response: any) => {
        this.reportData = response.result;

        this.reportData.forEach((e) => {
          this.totalsdk += e?.manualQuantity + e?.adjustedQuantity;
          this.totalCost += e?.costPrice;
          this.totalQTY += e?.adjustedQuantity;
          this.totalValue = +e?.adjustedValue;
        });
      });
    this.displayPrint();
  }

  getAlljob() {
    this.masterapi.GetAllJobMaster().subscribe((k) => {
      this.jobArray = k.result;
      this.jobList = k.result?.map((kl) => ({
        label: kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = k.result?.map((ar) => ar.jobMasterJobName?.trim());
    });
  }
  displayPrint() {
    this.displayPrintPreview = true;
  }

  userTrackingLog(type) {
    let req = {
      page: 'Stock Adjustment Report Printing',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: 'Stock Adjustment Report Printing',
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      console.log('Response:', res);
    });
  }
}
