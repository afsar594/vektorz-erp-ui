import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HotTableRegisterer } from "@handsontable/angular";
import { TranslateService } from "@ngx-translate/core";
import Handsontable from "handsontable";
import { SelectItem } from "primeng";
import { LocationMaster } from "src/app/routes/domain/Masters/LocationMaster";
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { AccountApiService } from "src/app/routes/service/account.api.service";
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from "src/app/routes/service/master.api.services";
import { PermissionsService } from "src/app/shared/service/permissions.service";
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { defaults } from "src/app/shared/service/settings";

@Component({
  selector: 'app-boq-status-report',
  templateUrl: './boq-status-report.component.html',
  styleUrls: ['./boq-status-report.component.scss']
})
export class BoqStatusReportComponent implements OnInit {

  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  Date: Date;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  index: number = 0;
  jobArray: any;
  jobList: any;
  BoqstatusForm: FormGroup;
  pdfSource: string;
  handleChange(e) {
    this.index = e.index;
  }
  Permission: any;
  ScreenId: number;

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
        private formatDateService: ReportDateFormatService,

    private permission: PermissionsService,
    private accountapi: AccountApiService,
    public _MasterApiService: MasterApiService,
    private router: Router,
    public crystalReportService: CrystalReportService,
  ) { }
  locationArray: LocationMaster[] = [];
  locationList: SelectItem[] = [];
  locationArry: string[] = [];

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];

      var rights = this.permission.getById(this.ScreenId);
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'BOQ Status Report') {
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
    })
    this.BoqstatusForm = new FormGroup({
      job: new FormControl(0),
      FromDate: new FormControl(new Date(new Date().setFullYear(new Date().getFullYear() - 2))),
      ToDate: new FormControl(new Date(new Date().setFullYear(new Date().getFullYear()))),
      isdate: new FormControl(false),
    });
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";

    });
    this.LoadJobDDL()
  }

  clear() {
    this.dataset = [];
    //this.BoqstatusForm.reset();
    this.BoqstatusForm.controls.job.setValue(0);
    this.BoqstatusForm.controls.isdate.setValue(false);
   // this.BoqstatusForm.controls.FromDate.setValue(new Date().setFullYear(new Date().getFullYear() - 2));
   // this.BoqstatusForm.controls.ToDate.setValue(new Date().getFullYear());
  }

 
  rptFilter: ReportFilterModel;
  crystalReport() {
    let isdate = this.BoqstatusForm.controls.isdate.value;
    let job = this.BoqstatusForm.controls.job.value;
    let fromDateControl = this.formatDateService.mmddyyyy(this.BoqstatusForm.controls.FromDate.value);
    let toDateControl = this.formatDateService.mmddyyyy(this.BoqstatusForm.controls.ToDate.value);
    let querry = ''
    if (isdate === false && job === 0) {
      querry = `select * from vw_BoqTracking`
    } else if (isdate == false && job != 0) {
      querry = `select * from vw_BoqTracking where job_master_job_no = '${this.BoqstatusForm.controls.job.value}'`
    } else if (isdate == true && job == 0) {
      querry = `select * from vw_BoqTracking  where boqdate >= '${fromDateControl}' and boqdate <='${toDateControl}'`
    } else {
      querry = `select * from vw_BoqTracking  where job_master_job_no =  '${this.BoqstatusForm.controls.job.value}' and   boqdate  >= '${fromDateControl}' and boqdate <= '${toDateControl}'`

    }
    this.rptFilter = {
      ReportName: 'BOQTracking',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        querry
      ],
      SP_Queries: [],
    };

    this.crystalReportService.getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        console.log('reponse', response);
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  LoadJobDDL() {
    this.accountapi.LoadDropdowjobMasters().subscribe((r) => {
      this.jobArray = r.resultSet.jobMasters;
      this.jobList = r.resultSet.jobMasters.map((kl) => ({
        label: kl.jobMasterJobNumber + " -- " + kl.jobMasterJobName,

        // label: kl.jobMasterJobName + " -- " +  kl.jobMasterJobNumber,
        value: kl.jobMasterJobNumber,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: 0 });
    });
  }

  get f() {
    return this.BoqstatusForm.controls;
  }

  getreport() {
    const isdate = this.BoqstatusForm.controls.isdate.value;
    const fromDateControl = this.BoqstatusForm.controls.FromDate.value;
    const toDateControl = this.BoqstatusForm.controls.ToDate.value;

    const req = {
      job: this.BoqstatusForm.controls.job.value || 0,
      dateFrom: isdate && fromDateControl ? new Date(fromDateControl).toISOString() : null,
      dateTo: isdate && toDateControl ? new Date(toDateControl).toISOString() : null,
    };

    this.accountapi.GetBillofQtyTracking(req.job, req.dateFrom, req.dateTo).subscribe((data: any) => {
      this.dataset = data.result;
    });
  }



  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

}
