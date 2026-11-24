import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { LocalStorageService } from 'src/app/shared/service/storage.service';

@Component({
  selector: 'app-purchase-requisition-status-report',
  templateUrl: './purchase-requisition-status-report.component.html',
  styleUrls: ['./purchase-requisition-status-report.component.scss']
})
export class PurchaseRequisitionStatusReportComponent implements OnInit {

  title: string;
   subtitle: string;
   dataset: any;
   cols: Array<any>;
   Date: Date;
   location: Array<string>;
   licensekey: any;
   gridHeader: string;
   PRSRForm: FormGroup;
   index: number = 0;
   jobArray: JobMaster[] = [];
   jobList: SelectItem[] = [];
   jobArry: string[] = [];
   handleChange(e) {
     this.index = e.index;
   }
   Permission: any;
   ScreenId: number;
 
   constructor(
     private activatedroute: ActivatedRoute,
     private fb: FormBuilder,
     private translate: TranslateService,
     private permission: PermissionsService,
  private accountapi: AccountApiService,
  public _MasterApiService: MasterApiService,
  private utilityService: UtilityService,
  private storage: LocalStorageService
) {}
 
   locationArray: LocationMaster[] = [];
   locationList: SelectItem[] = [];
   locationArry: string[] = [];
   locationLocked: boolean = false;
   ngOnInit(): void {
     this.activatedroute.queryParams.subscribe((params) => {
       this.ScreenId = +params['menu'];
 
       var rights = this.permission.getById(this.ScreenId);
       rights.forEach((res) => {
         if (
           res.workGroupPermissionsMenuName ===
           'Purchase Requisition Status Report'
         ) {
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
     this.PRSRForm = new FormGroup({
       location: new FormControl(''),
       FromDate: new FormControl(new Date(new Date())),
       ToDate: new FormControl(new Date(new Date())),
       isdate: new FormControl(false),
       // status: new FormControl(''),
       // jobNo: new FormControl(''),
     });
     this.activatedroute.data.subscribe((data) => {
       this.title = data.title;
       this.subtitle = data.title;
       this.licensekey = defaults.hotlicensekey;
       this.gridHeader = 'No Data';
     });
     this.getAllLOC();
     this.LoadJobDDL();
   }
 
clear() {
    this.dataset = [];
    this.PRSRForm.reset();
    const defaultLocationId = this.utilityService.getLockedLocationId();
    this.PRSRForm.controls.location.setValue(defaultLocationId || 0);
}
 
getAllLOC() {
  this._MasterApiService.GetAllLocation().subscribe((k: any) => {
    this.locationArray = k;
    this.locationList = k.map((kl) => ({
      label: kl.locationMasterLocationName,
      value: kl.locationMasterLocationId,
    }));
    this.locationList.unshift({ label: '--Select --', value: 0 });
    this.locationArry = k;
    const defaultLocationId = this.utilityService.getLockedLocationId();
    if (defaultLocationId) {
      this.PRSRForm.controls.location.setValue(defaultLocationId);
      this.locationLocked = true;
    }
  });
}
   LoadJobDDL() {
     this.accountapi.LoadDropdowjobMasters().subscribe((r) => {
       this.jobArray = r.resultSet.jobMasters;
       this.jobList = r.resultSet.jobMasters.map((kl) => ({
         label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
 
         // label: kl.jobMasterJobName + " -- " +  kl.jobMasterJobNumber,
         value: kl.jobMasterJobId,
       }));
       this.jobList.unshift({ label: '--Select Job--', value: -1 });
     });
   }
   get f() {
     return this.PRSRForm.controls;
   }
 
   getreport() {
     const isdate = this.PRSRForm.controls.isdate.value;
     const fromDate = this.utilityService.fromAndToDateformater(
       this.PRSRForm.controls.FromDate.value,
       'from'
     );
     const toDate = this.utilityService.fromAndToDateformater(
       this.PRSRForm.controls.ToDate.value,
       'to'
     );
     let req = {
       locationId: this.PRSRForm.controls.location.value
         ? this.PRSRForm.controls.location.value
         : 0,
       dateFrom: isdate ? fromDate : null,
       dateTo: isdate ? toDate : null,
     };
 
     this.accountapi.GetReportPurchaseRequisition(req).subscribe((data: any) => {
       this.dataset = data;
       // this.puchaserequsitionreport.data=data
     });
   }
 }
 