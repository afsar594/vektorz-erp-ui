import { Component, OnInit } from '@angular/core';
import { FormBuilder ,FormGroup} from '@angular/forms';
import { ActivatedRoute,Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { ProgrssiveInvoiceService } from 'src/app/routes/service/progrssive-invoice.service';
import { defaults } from 'src/app/shared/service/settings';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { JobMaster, JobStatusReportFilter } from 'src/app/routes/domain/Masters/JobMaster';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import moment from 'moment';
import { MasterApiService } from 'src/app/routes/service/master.api.services';


@Component({
  selector: 'app-project-status-report',
  templateUrl: './project-status-report.component.html',
  styleUrls: ['./project-status-report.component.scss']
})
export class ProjectStatusReportComponent implements OnInit {
  title: string;
  subtitle: string;
  ScreenId: number;
  Permission: any;
  index: number = 0;
  dataset: any;
    jobArray: JobMaster[] = [];
    jobListByCustomer: JobMaster[] = [];   // jobs loaded for the selected customer via API
    jobList: SelectItem[] = [];
    customerArray: CustomerMaster[] = [];
      customerArry: string[] = [];
      customerList: SelectItem[];
      reportProjectStatus: REPORTProjectStatus[] = [];
      
  licensekey: any;
  customerFilterId: any;
  jobFilterId: any;
  gridHeader: string;
  reportData: any[] = [];
  selectedJobDetail: JobMaster = null;
  statusList: SelectItem[] = [
    { label: '--Select--', value: -1 },
    { label: 'Active',     value: 1 },
    { label: 'Passive',    value: 2 },
  ];
 handleChange(e) {
     this.index = e.index;
   }
   
 
   hotid = 'projectstatusreport';
   private hotRegisterer = new HotTableRegisterer();
   projectstatusreport: Handsontable.GridSettings;
   //private accountapi: AccountApiService
   initializeControls() {

    this.LoadJobDDL();
    this.LoadCustomerDDL();
     this.projectstatusreport = {
       rowHeaders: true,
       viewportColumnRenderingOffset: 27,
       viewportRowRenderingOffset: 'auto',
       colWidths: '150px',
 
       // colWidths: ['90px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '70px'],
       minRows: 3,
       width: 'auto',
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
        //  {
        //    data: 'a',
        //    type: 'text'
        //  },
        //  {
        //    data: 'Code',
        //    type: 'text',
        //  },
         {
           data: 'customerMasterCustomerName',
           type: 'text'
         },
         {
           data: 'jobMasterJobName',
           type: 'text'
         },
        //  {
        //    data: 'startDate',
        //    type: 'date',
        //    dateFormat: 'DD-MMM-YYYY',
        //  },

         {
          data: 'startDate',
          type: 'date',
          dateFormat: 'DD/MMM/YYYY',
          correctFormat: true,
          renderer: function (instance, td, row, col, prop, value, cellProperties) {
            td.innerText = value ? moment(value).format('DD/MM/YYYY') : '';
          }
        },


        {
          data: 'endDate',
          type: 'date',
          dateFormat: 'DD/MMM/YYYY',
          correctFormat: true,
          renderer: function (instance, td, row, col, prop, value, cellProperties) {
            td.innerText = value ? moment(value).format('DD/MM/YYYY') : '';
          }
        },
         
        //  {
        //    data: 'revisedValue',
        //    type: 'numeric',
        //  },
         {
           data: 'jobMasterJobVariationAmount',
           type: 'numeric'
         },
        //  {
        //    data: 'Comissions',
        //    type: 'text',
        //  },
        //  {
        //    data: 'revisedValue',
        //    type: 'numeric'
        //  },
        //  {
        //    data: 'ComolativeInvoice',
        //    type: 'text',
        //  },
        //  {
        //    data: 'directCost',
        //    type: 'numeric'
        //  },
         {
           data: 'grossProfit',
           type: 'numeric'
         },
         {
           data: 'retAmount',
           type: 'numeric'
         },
         {
           data: 'receivable',
           type: 'text'
         },
         {
           data: 'advRecovery',
           type: 'numeric'
         },
         {
           data: 'advInvoice',
           type: 'numeric'
         },
         
       ],
       colHeaders: [
        
        //  this.translate.instant('Sr.No'),
         //this.translate.instant('Code'),
         this.translate.instant('Client'),
         this.translate.instant('Project Name'),
         this.translate.instant('Start Date'),
         this.translate.instant('End Date'),
         // this.translate.instant('Value'),
          this.translate.instant('Variation'),
          //  this.translate.instant('Comissions'),
          // this.translate.instant('Revised Value'),
          // this.translate.instant('Comolative Invoice'),
          // this.translate.instant('Direct Cost'),
          this.translate.instant('Gross Profit'),
          this.translate.instant('Retention'),
          this.translate.instant('Ce Receiv'),
          this.translate.instant('Advance Recovery'),
          this.translate.instant('Adv Invoice'),
 
 
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
         private accountapi: AccountApiService,
         private PIService: ProgrssiveInvoiceService,
         private router: Router,
         private permission: PermissionsService,
         private masterApiService:MasterApiService,

      ) {

   }
   reportProjectStatusFormGroup: FormGroup;
 reportProjectStatus_entry: Handsontable.GridSettings;
  ngOnInit(): void {

    this.fetchJobStatusReport();
   // this.new();
   //this.reportProjectStatusFormGroup.reset();
  // this.reportProjectStatusFormGroup.enable();
   //this.reportProjectStatusFormGroup.updateValueAndValidity();
     this.activatedroute.data.subscribe(data => {
          this.title = data.title;
          this.subtitle = data.title;
            this.licensekey = defaults.hotlicensekey;
             this.gridHeader = "No Data";
        });


      // this.activatedroute.queryParams.subscribe((params) => {
      //     this.ScreenId = +params['menu'];
      //     var rights = this.permission.getById(this.ScreenId);
      //     //this.stationmasterObj = this.permission.getStation();
      //     rights.forEach((res) => {
      //       
      //       console.log("para", res.workGroupPermissionsMenuName)
      //       if (res.workGroupPermissionsMenuName === 'Project Status Report') {
             
      //         this.Permission = {
      //           Allow: res?.workGroupPermissionsUallow,
      //           Add: res?.workGroupPermissionsUadd,
      //           Delete: res?.workGroupPermissionsUdelete,
      //           Edit: res?.workGroupPermissionsUedit,
      //           Print: res?.workGroupPermissionsUprint,
      //           View: res?.workGroupPermissionsUview
      //         };
      //       }
      //     });
      //   });
    


        
        this.initializeControls()

        this.reportProjectStatusFormGroup = this.fb.group({

          rptJob: [-1],
          rptCustomerId: [-1],
          rptStatus: [-1],
          isdateSelected: [false],
          dateFrom: [moment().startOf('month').toDate()],
          dateTo: [moment().toDate()],

        });
        this.new();

        // Filter jobs when customer changes — also clear stale grid data
        this.reportProjectStatusFormGroup.get('rptCustomerId').valueChanges.subscribe(customerId => {
          this.filterJobsByCustomer(customerId);
          this.reportProjectStatusFormGroup.get('rptJob').setValue(-1, { emitEvent: false });
          this.selectedJobDetail = null;
          this.clearGrid();
        });

        // Show job details when job changes — also clear stale grid data
        this.reportProjectStatusFormGroup.get('rptJob').valueChanges.subscribe(jobId => {
          this.clearGrid();
          if (!jobId || jobId === -1) {
            this.selectedJobDetail = null;
            return;
          }
          // Look up in the API-loaded customer-specific list first, then fall back to all jobs
          const sourceArray = this.jobListByCustomer.length > 0 ? this.jobListByCustomer : this.jobArray;
          this.selectedJobDetail = sourceArray.find(j => j.jobMasterJobId === jobId) || null;
        });
  }

  // onCustomerChange(event: any) {
    
  //   console.log("Selected Customer:", event.value);
  //  // 
  //   this.customerFilterId=event.value;
  //   // Call your function here
  //   //this.getCustomer(event.value);
  // }
  // onJobChange(event: any) {
    
  //   console.log("Selected Job:", event.value);
  //  // 
  //   this.jobFilterId=event.value;
  //   // Call your function here
  //   //this.getCustomer(event.value);
  // }
  LoadJobDDL()
  {
    this.accountapi.LoadDropdowjobMasters().subscribe((m) => {
      this.jobArray = m.resultSet.jobMasters;
        this.jobList = m.resultSet.jobMasters?.map((kl) => ({
          label: kl.jobMasterJobName,
          value: kl.jobMasterJobId,
        }));
        this.jobList.unshift({ label: '--Select--', value: -1 });

  });
  }
  LoadCustomerDDL() {
    this.accountapi.LoadCustomerDropdown().subscribe((m) => {
      //customer
      this.customerArray = m.resultSet.customerMasters;
      this.customerList = m.resultSet.customerMasters?.map((kl) => ({
        label: kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
       this.customerList.unshift({ label: '--Select--', value: -1 });
       this.customerArry = m.resultSet.customerMasters?.map((ar) => ar.customerMasterCustomerName?.trim());
    });
  }
  vsvs: any;

   List_REPORT() {
      const fv = this.reportProjectStatusFormGroup.value;
      const reportProjectStatusParameters_Save: ProjectStatusReportParameters = {
        jobId:          fv.rptJob         && fv.rptJob       !== -1 ? fv.rptJob       : null,
        customerId:     fv.rptCustomerId  && fv.rptCustomerId !== -1 ? fv.rptCustomerId : null,
        status:         fv.rptStatus      && fv.rptStatus     !== -1 ? fv.rptStatus     : null,
        isdateSelected: fv.isdateSelected || false,
        dateFrom:       fv.isdateSelected ? fv.dateFrom : null,
        dateTo:         fv.isdateSelected ? fv.dateTo   : null,
      };

      this.accountapi.MainReport_GetReportProjectStatus_PARAM_CLASS(reportProjectStatusParameters_Save).subscribe((data) => {
        this.reportProjectStatus = data.result;
        this.updateHot_Report(data.result || []);
      });
    }
    new() {
      this.reportProjectStatusFormGroup.reset();
      this.reportProjectStatusFormGroup.get('rptJob').setValue(-1);
      this.reportProjectStatusFormGroup.get('rptCustomerId').setValue(-1);
      this.reportProjectStatusFormGroup.get('rptStatus').setValue(-1);
      this.reportProjectStatusFormGroup.get('isdateSelected').setValue(false);
      this.reportProjectStatusFormGroup.get('dateFrom').setValue(moment().startOf('month').toDate());
      this.reportProjectStatusFormGroup.get('dateTo').setValue(moment().toDate());
      this.selectedJobDetail = null;
      this.jobListByCustomer = [];
      this.filterJobsByCustomer(-1);
      this.clearGrid();
      this.reportProjectStatusFormGroup.enable();
      this.reportProjectStatusFormGroup.updateValueAndValidity();
    }

    clearGrid() {
      this.dataset = [];
      this.reportProjectStatus = [];
      const hot = this.hotRegisterer.getInstance(this.hotid);
      if (hot) {
        hot.updateSettings({ data: [] });
      }
    }

    filterJobsByCustomer(customerId: number) {
      if (!customerId || customerId === -1) {
        // No customer selected — reset to all jobs
        this.jobListByCustomer = [];
        this.jobList = this.jobArray.map(kl => ({
          label: kl.jobMasterJobName,
          value: kl.jobMasterJobId,
        }));
        this.jobList.unshift({ label: '--Select--', value: -1 });
        return;
      }

      // Load jobs for the selected customer from the API (same as Progressive Invoice)
      this.PIService.JobBYCUSTID(customerId).subscribe((data: any) => {
        const jobs: JobMaster[] = data?.resultSet || [];
        this.jobListByCustomer = jobs;
        this.jobList = jobs.map(kl => ({
          label: kl.jobMasterJobName,
          value: kl.jobMasterJobId,
        }));
        this.jobList.unshift({ label: '--Select--', value: -1 });
      });
    }

    getStatusLabel(status: number): string {
      const found = this.statusList.find(s => s.value === status);
      return found ? found.label : '--';
    }

    getCustomerName(customerId: number): string {
      const found = this.customerArray.find(c => c.customerMasterCustomerNo === customerId);
      return found ? found.customerMasterCustomerName : '--';
    }
    ExitNew() {
      this.router.navigate(['/dashboard']);
    }
 updateHot_Report(reportSalesVoucher_update: REPORTProjectStatus[]) {
    const gridData: GridData[] = reportSalesVoucher_update.map(k => {
      return {
        advInvoice: k.advInvoice,
        advRecovery: k.advRecovery,
        balance: k.balance,
        cumValue: k.cumValue,
        customerMasterCustomerId: k.customerMasterCustomerId,
        customerMasterCustomerName: k.customerMasterCustomerName,
        directCost: k.directCost,
        endDate: k.endDate,
        grossProfit: k.grossProfit,
        jobMasterJobId: k.jobMasterJobId,
        jobMasterJobName: k.jobMasterJobName,
        jobMasterJobNo: k.jobMasterJobNo,
        jobMasterJobValue: k.jobMasterJobValue,
        jobMasterJobVariationAmount: k.jobMasterJobVariationAmount,
        receivable: k.receivable,
        vatAmount: k.vatAmount,
        startDate: k.startDate,
        revisedValue: k.revisedValue,
        retAmount: k.retAmount,
      };
    });
    this.projectstatusreport.data = gridData;
    this.dataset = gridData;
    this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: gridData, readOnly: true });
    }

    fetchJobStatusReport(): void {
    // Construct the filter object payload
    const filterParams: JobStatusReportFilter = {
      customerNo: 12345, // Use null or optional number
      jobID: 67890,      // Use null or optional number
      startDate: '2026-01-01', // DateOnly maps to YYYY-MM-DD string format
      endDate: '2026-06-25'
    };

    this.masterApiService.getJobStatusReport(filterParams).subscribe({
      next: (response) => {
        // Accessing data assuming standard ApiResponse wrapper (e.g., response.data)
        this.reportData = response.result
        console.log(this.reportData);
        ; 
      },
      error: (err) => {
        console.error('Error fetching job status report:', err);
      }
    });
  }
   
  }


  interface GridData {
    a?: number;
    customerMasterCustomerId?: number;
    jobMasterJobId?: number;
    jobMasterJobNo?: string;
    customerMasterCustomerName?: string;
    jobMasterJobName?: string;
    startDate?: Date;
    endDate?: Date;
    jobMasterJobValue?: number;
    jobMasterJobVariationAmount?: number;
    revisedValue?: number;
    cumValue?: number;
    directCost?: number;
    grossProfit?: number;
    retAmount?: number;
    advInvoice?: number;
    advRecovery?: number;
    receivable?: number;
    vatAmount?: number;
    received?: number;
    balance?: number;
  }


export interface ProjectStatusReportParameters {

  jobId?: number;
  customerId?: number;
  status?: number;
  dateFrom?: Date;
  dateTo?: Date;
  isdateSelected?: boolean;

}

export interface REPORTProjectStatus {
  a?: number;
  customerMasterCustomerId?: number;
  jobMasterJobId?: number;
  jobMasterJobNo?: string;
  customerMasterCustomerName?: string;
  jobMasterJobName?: string;
  startDate?: Date;
  endDate?: Date;
  jobMasterJobValue?: number;
  jobMasterJobVariationAmount?: number;
  revisedValue?: number;
  cumValue?: number;
  directCost?: number;
  grossProfit?: number;
  retAmount?: number;
  advInvoice?: number;
  advRecovery?: number;
  receivable?: number;
  vatAmount?: number;
  received?: number;
  balance?: number;
}