import { BusinessTypeMaster } from './../../../domain/Masters/BusinessTypeMaster';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import { map } from 'rxjs/operators';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng';


@Component({
  selector: 'app-BusinessType',
  templateUrl: './businesstype.component.html',
  styleUrls: ['./businesstype.component.scss']
})
export class BusinessTypeComponent implements OnInit {
  ScreenId: number;
  Permission: any;
  constructor(private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,

    private translate: TranslateService,
  
    private api: MasterApiService) {
    this.getAllBusinessType();
  }
  title: string;
  checked: boolean = true;
  breadcumbmodel: MenuItem[];
  businesstypeFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  operation: { insert: boolean, update: boolean, delete: boolean } = { insert: false, update: false, delete: false };
  displayedColumns: string[] = ['code', 'name', 'status', 'action'];
  businesstypeList: BusinessTypeMaster[] = [];
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Business Type') {
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
    this.operation.insert = true;
    this.breadcumbmodel = this.router.url.slice(1).split('/').map((k) => ({ label: k }));
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
    });
    this.businesstypeFormGroup = this.fb.group({

      businessTypeMasterBusinessTypeId: [0],
      businessTypeMasterBusinessTypeName: [null, [Validators.required]],
      businessTypeMasterBusinessTypeStatus: [false]
    });
  }

  public getAllBusinessType() {
    this.api.GetAllBusinessType().subscribe((data) => {
      this.businesstypeList = data;
    });
  }

  savebusinesstype() {
    this.businesstypeFormGroup.markAsDirty();
    this.businesstypeFormGroup.markAllAsTouched();
    if (this.businesstypeFormGroup.valid) {
      if (this.operation.insert) {
        this.insertbusinesstype
        this.insertbusinesstype(this.businesstypeFormGroup.value);
      } else if (this.operation.update) {
        this.updateBusinessType(this.businesstypeFormGroup.value);
      } else {
      }
    }

  }
  updateValues(data: BusinessTypeMaster) {
    this.operation = { insert: false, update: true, delete: false };
    this.btnlabel = 'Update';
    this.businesstypeFormGroup.patchValue(data);
  }
  removebusinesstype(data: BusinessTypeMaster) {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.deleteBusinessType(data);
  }
  public get f() {
    return this.businesstypeFormGroup.controls;
  }
  public reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.businesstypeFormGroup.reset();
    this.f.businessTypeMasterBusinessTypeStatus.setValue(false);
    this.f.checked.setValue(true);
  }



  public insertbusinesstype(businesstype: BusinessTypeMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Save?'),
      accept: () => {
        this.api.InsertBusinessType(businesstype).subscribe((data) => {
          this.businesstypeList = data;
          this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Saved Succesfully' });

          this.reset();
        }, (err) => {
          this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Save Failed') });
        });
      }
    });

  }


  public updateBusinessType(businesstype: BusinessTypeMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Update?'),
      accept: () => {
        this.api.UpdateBusinessType(businesstype).subscribe((data) => {
          this.businesstypeList = data;
          this.reset();
          this.messageService.add({ severity: 'success', summary: 'Alert', detail: ' Updated Succesfully' });

        }, (err) => {
          this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Save Failed') });
        });
      }
    });
  }

  public deleteBusinessType(businesstype: BusinessTypeMaster) {
    this.btnlabel = 'Submit';
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.api.DeleteBusinessType(businesstype).subscribe((data) => {
          this.businesstypeList = data;
          this.reset();
          this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Deleted Succesfully' });

        }, (err) => {
          this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Delete Failed') });
        });
      }
    });

  }






  // public insertbusinesstype(businesstype: BusinessTypeMaster) {
  //   this.api.InsertBusinessType(businesstype).subscribe((data) => {
  //     this.businesstypeList = data;
  //     this.reset();
  //   });
  // }


  // public updateBusinessType(businesstype: BusinessTypeMaster) {
  //   this.api.UpdateBusinessType(businesstype).subscribe((data) => {
  //     this.businesstypeList = data;
  //     this.reset();
  //   });
  // }

  // public deleteBusinessType(businesstype: BusinessTypeMaster) {
  //   this.btnlabel = 'Submit';
  //   this.api.DeleteBusinessType(businesstype).subscribe((data) => {
  //     this.businesstypeList = data; businesstype
  //     this.reset();
  //   });
  // }

}
