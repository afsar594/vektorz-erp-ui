import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng';
import { TaxMaster } from 'src/app/routes/domain/Masters/TaxMaster';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-loyalty',
  templateUrl: './loyalty.component.html',
  styleUrls: ['./loyalty.component.scss']
})
export class LoyaltyComponent implements OnInit {

  title: string;
  breadcumbmodel: MenuItem[];
  loyalityForm: FormGroup
  submitted: boolean = false
  editForm: boolean = false; 
  index :number=0;
  ScreenId: number;
  Permission: any;
  handleChange(e){
     this.index=e.index;
  }

  constructor(private activatedroute: ActivatedRoute, 
    private permission: PermissionsService,
    private fb: FormBuilder, private router: Router, public apiService: MasterApiService) { }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId); 
      
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Loyalty Master') {
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
    this.loyalityForm = this.fb.group({
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
    return this.loyalityForm.controls
  }

  onSave() {
    this.submitted = true
    if (this.loyalityForm.invalid) {
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
    // this.editForm = true
    // this.loyalityForm.patchValue(item)
  }

  createDataObj() {
    var data: TaxMaster = {
      tmId: this.loyalityForm.controls.tM_ID.value,
      tmType: this.loyalityForm.controls.tM_Type.value,
      tmName: this.loyalityForm.controls.tM_Name.value,
      tmPercentage: this.loyalityForm.controls.tM_Percentage.value,
      tmCgst: this.loyalityForm.controls.tM_CGST.value,
      tmSgst: this.loyalityForm.controls.tM_SGST.value,
      tmDelStatus: this.loyalityForm.controls.tM_DelStatus.value,
    }
    return data
  }

  onEdit() {
    this.submitted = true
    if (this.loyalityForm.invalid) {
      return
    }
    // this.apiService.UpdateTaxMaster(this.createDataObj()).subscribe(res => {
    //   // this.apiService.TaxMasterArray = res
    //   // this.editForm = false
    //   // this.initForm()
    //   // this.submitted = false
    // })
  }

  onDelete(item: TaxMaster) {
    // this.apiService.DeleteTaxMaster(item).subscribe(res => {
    //   this.apiService.TaxMasterArray = res
    // });
  }

  onCancel() {
    this.editForm = false
    this.submitted = false
    this.initForm()
  }


}
