import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng';
import { TaxMaster } from 'src/app/routes/domain/Masters/TaxMaster';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-taxmaster',
  templateUrl: './taxmaster.component.html',
  styleUrls: ['./taxmaster.component.scss']
})
export class TaxmasterComponent implements OnInit {
  title: string;
  breadcumbmodel: MenuItem[];
  TaxMasterForm: FormGroup
  submitted: boolean = false
  editForm: boolean = false;
  ScreenId: number;
  Permission: any;
  constructor(private activatedroute: ActivatedRoute,
     private fb: FormBuilder, private router: Router,
     private permission: PermissionsService,
     public apiService: MasterApiService) { }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId); 
      
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Tax') {
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
    this.apiService.GetAllTaxMaster()
    this.initForm()
    this.breadcumbmodel = this.router.url.slice(1).split('/').map((k) => ({ label: k }));
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
    });
  }

  initForm() {
    this.TaxMasterForm = this.fb.group({
      tM_ID: [0],
      tM_Type: [null, Validators.required],
      tM_Name: [null, Validators.required],
      tM_Percentage: [null, Validators.required],
      tM_CGST: [null, Validators.required],
      tM_SGST: [null, Validators.required],
      tM_DelStatus: [false],
    })
  }

  get f() {
    return this.TaxMasterForm.controls
  }

  onSave() {
    this.submitted = true
    if (this.TaxMasterForm.invalid) {
      return
    }
    this.apiService.InsertTaxMaster(this.createDataObj()).subscribe(res => {
      this.apiService.TaxMasterArray = res
      this.initForm()
      this.editForm = false
      this.submitted = false
    }, error => {

    })
  }

  onPatchValue(item: TaxMaster) {
    this.editForm = true
    this.TaxMasterForm.patchValue({
      tM_ID: item?.tmId,
      tM_Type: item?.tmType,
      tM_Name: item?.tmName,
      tM_Percentage: item?.tmPercentage,
      tM_CGST: item?.tmCgst,
      tM_SGST: item?.tmSgst,
      tM_DelStatus:item?.tmDelStatus,
    })
  }

  createDataObj() {
    var data: TaxMaster = {
      tmId: this.TaxMasterForm.controls.tM_ID.value,
      tmType: this.TaxMasterForm.controls.tM_Type.value,
      tmName: this.TaxMasterForm.controls.tM_Name.value,
      tmPercentage: this.TaxMasterForm.controls.tM_Percentage.value,
      tmCgst: this.TaxMasterForm.controls.tM_CGST.value,
      tmSgst: this.TaxMasterForm.controls.tM_SGST.value,
      tmDelStatus: this.TaxMasterForm.controls.tM_DelStatus.value,
    }
    return data
  }

  onEdit() {
    this.submitted = true
    if (this.TaxMasterForm.invalid) {
      return
    }
    this.apiService.UpdateTaxMaster(this.createDataObj()).subscribe(res => {
      this.apiService.TaxMasterArray = res
      this.editForm = false
      this.initForm()
      this.submitted = false
    })
  }

  onDelete(item: TaxMaster) {
    this.apiService.DeleteTaxMaster(item).subscribe(res => {
      this.apiService.TaxMasterArray = res
    });
  }

  onCancel() {
    this.editForm = false
    this.submitted = false
    this.initForm()
  }
}