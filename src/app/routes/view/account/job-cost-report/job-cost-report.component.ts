import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MessageService, SelectItem } from 'primeng';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-job-cost-report',
  templateUrl: './job-cost-report.component.html',
  styleUrls: ['./job-cost-report.component.scss'],
})
export class JobCostReportComponent implements OnInit {
  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];
  jobList: SelectItem[] = [];
  jobArray: any[] = [];
  jobArry: string[] = [];
  title: string;
  subtitle: string;
  dataset: any;
  dataset1: any;
  licensekey: any;
  gridHeader: string;
  index: number = 0;
  data: any;

  handleChange(e) {
    this.index = e.index;
  }
  showTable = 'detail';

  hotid = 'JCSummary';
  private hotRegisterer = new HotTableRegisterer();
  JCSummary: Handsontable.GridSettings;
  initializeControls() {
    this.JCSummary = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [60, 60, 60, 90, 60, 60, 60, 60],
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
          data: 'jobNo',
          type: 'text',
        },
        {
          data: 'jobValue',
          type: 'numeric',
        },
        {
          data: 'material',
          type: 'numeric',
        },
        {
          data: 'labour',
          type: 'numeric',
        },
        {
          data: 'overHead',
          type: 'numeric',
        },
        {
          data: 'miscellaneous',
          type: 'numeric',
        },
        {
          data: 'totCost',
          type: 'numeric',
        },
        {
          data: 'profit',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Job No'),
        this.translate.instant('Job Value'),
        this.translate.instant('Material Cost'),
        this.translate.instant('Labour Cost'),
        this.translate.instant('Over Head'),
        this.translate.instant('Miscellaneous'),
        this.translate.instant('Total Cost'),
        this.translate.instant('Profit'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    this.getAllJobs();
    this.getAllCostCenter();
  }

  hotid1 = 'JCDetail';
  JCDetail: Handsontable.GridSettings;
  initializeControls1() {
    this.JCDetail = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [60, 60, 60, 90, 60, 60, 60, 60, 60],
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
          data: 'acNo',
          type: 'text',
        },
        {
          data: 'acHead',
          type: 'text',
        },
        {
          data: 'date',
          type: 'date',
          renderer: this.dateRenderer.bind(this),
          readOnly: true,
        },
        {
          data: 'vNo',
          type: 'text',
        },
        {
          data: 'vType',
          type: 'text',
        },
        {
          data: 'particular',
          type: 'text',
        },
        {
          data: 'costCenter',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('A/C No'),
        this.translate.instant('A/C Head'),
        this.translate.instant('Date'),
        this.translate.instant('V.No '),
        this.translate.instant('V.Type '),
        this.translate.instant('Particulars'),
        this.translate.instant('Cost Center'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    this.getAllJobs();
    this.getAllCostCenter();
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

  JCRform: FormGroup;

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private datePipe: DatePipe,
    private router: Router,
    private masterapi: MasterApiService,
    private messageService: MessageService,
    private formatDateService: ReportDateFormatService,

  ) {

  }

  ngOnInit(): void {
    this.JCRform = new FormGroup({
      jobNo: new FormControl(),
      costCenterId: new FormControl(),
      isdateSelected: new FormControl(),
      dateTO: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      ),
      dateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear()))
      ),
      viewType: new FormControl('detail'),
    });
    this.initializeControls();
    this.initializeControls1();
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.showDetail();
  }

  cancel() {
    this.JCRform.reset();
    this.dataset1 = [];

  }

  getAllJobs() {
    this.masterapi.GetAllJobMaster().subscribe((k) => {
      this.jobArray = k.result;
      this.jobList = k.result.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select--', value: 0 });

      this.jobArry = k.result.map((ar) => ar.jobMasterJobName?.trim());
    });
  }
  getAllCostCenter() {
    this.masterapi.GetAllCostCenter().subscribe((k) => {
      this.costcenterArray = k;
      this.costcenterList = k.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterList.unshift({ label: '--Select--', value: 0 });

      this.costcenterArry = k.map((ar) =>
        ar.costCenterMasterCostCenterName.trim()
      );
    });
  }

  showDetail() {
    this.data = {
      jobNo: this.JCRform.value.jobNo ? this.JCRform.value.jobNo : 0,
      costCenterId: this.JCRform.value.costCenterId
        ? this.JCRform.value.costCenterId
        : 0,
      isdateSelected: this.JCRform.get('isdateSelected').value,
      IsSummaryChecked: this.JCRform.value.viewType,
      fromDate:
        this.JCRform.get('isdateSelected').value === true
          ? this.formatDateService.formatDatetime(this.JCRform.value.dateFrom, true)
          : null,
      toDate:
        this.JCRform.get('isdateSelected').value === true
          ? this.formatDateService.formatDatetime(this.JCRform.value.dateFrom, false)
          : null,
    };

    this.masterapi.GetjobCastDetials(this.data).subscribe((response: any) => {
      if (response.valid) {
        if (response.result && response.result.length > 0) {

          if (this.JCRform.get('viewType')?.value === 'summary') {

            this.dataset = response.result;
            // const hotInstance = this.hotRegisterer1.getInstance(this.hotid1);
            // hotInstance.updateSettings({
            //   data: response.result,
            //   readOnly: true,
            // });
          } else {
            this.dataset1 = response.result;
          }
        } else {

          this.messageService.add({
            severity: 'warn',
            summary: 'Alert',
            detail: 'Data not found',
          });
        }
      } else {
        // API error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong',
        });
      }
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
}
