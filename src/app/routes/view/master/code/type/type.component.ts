import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { TypeMaster} from 'src/app/routes/domain/Masters/TypeMaster';
import { MenuItem } from 'primeng/api/menuitem';
import { map } from 'rxjs/operators';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html',
  styleUrls: ['./type.component.scss']
})
export class TypeComponent implements OnInit {
  ScreenId: number;
  Permission: any;
  constructor(private activatedroute: ActivatedRoute,
              private fb: FormBuilder,
              private router: Router,
              private permission: PermissionsService,
              private confirmation: ConfirmationService,
              private translate: TranslateService,
              private messageService: MessageService,
              private api: MasterApiService) {
                this.getTypeList();
               
               }
 title: string;
 breadcumbmodel: MenuItem[];
 typeFormGroup: FormGroup;
 btnlabel: string = 'Submit';
 dataForDelete: any;
 btnFlag: ButtonFlag;
 operation: {insert: boolean, update: boolean, delete: boolean} = {insert: false, update: false, delete: false};
 displayedColumns: string[] = ['code', 'name',   'action'];
 typeList: TypeMaster[] = [];

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId); 
      
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Type') {
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
    this.breadcumbmodel = this.router.url.slice(1).split('/').map((k) => ({label: k }));
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.getVendorList();
  });

    this.typeFormGroup = this.fb.group({
      typeMasterTypeId: [0],
      typeMasterVendorId: [{ value: null, disabled: true, },[Validators.required]],
      typeMasterTypeName: [{ value: null, disabled: true, },[Validators.required]],
      typeMasterUserId: [0],
      typeMasterDeleted: [0],
      typeMasterStatus: [{ value: false, disabled: true, }], 
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: false,
      delete: false,
    };
  }

vendorListNew: SelectItem[];
  vendorList: VendorMaster[] = [];
 


    public getVendorList() {
      this.api.GetAllBrand().subscribe((data) => {
      this.vendorList = data;
  
      this.vendorListNew = data.map(item =>
        ({
         label: item.vendorMasterVendorName,
         value: item.vendorMasterVendorId
       }));
       this.vendorListNew.push({label: 'Select',value:-1})
      });
  
  
      }
  
   public getTypeList() {
    this.api.GetAllTypeMast().subscribe((data) => {
      this.typeList = data;
    });
    }

    saveType() {
      this.typeFormGroup.markAsDirty();
      this.typeFormGroup.markAllAsTouched();
      if (this.typeFormGroup.valid) {
           if (this.operation.insert) {
        this.insertType(this.typeFormGroup.value);
      } else if (this.operation.update) {
        this.updateType(this.typeFormGroup.value);
      } else {
      }
      }
      this.btnFlag = {
        edit: false,
        cancel: false,
        save: false,
        update: false,
        delete: false,
        };    
        this.typeFormGroup.reset();
        this.typeFormGroup.disable();

    }
     updateValues(data: TypeMaster) {
      this.dataForDelete=data;
      this.operation = {insert: false, update: true, delete: false};
      this.btnlabel = 'Update';
      this.typeFormGroup.patchValue(data);
      this.btnFlag = {
        edit: true,
        cancel: false,
        save: false,
        update: false,
        delete: true,
      };
      this.typeFormGroup.disable();
     }
    // removeType(data: TypeMaster) {
    //   this.operation = {insert: true, update: false, delete: false};
    //   this.btnlabel = 'Submit';
    //   this.deleteType(data);
    // }
    public get f() {
      return this.typeFormGroup.controls;
    }
    public  reset() {
      this.operation = {insert: true, update: false, delete: false};
      this.btnlabel = 'Submit';
      this.typeFormGroup.reset();
    }

    // public insertType(type: TypeMaster) {
    //   this.api.InsertTypeMast(type).subscribe((data) => {
    //     this.typeList = data;
    //     this.reset();
    //   });
    // }

    public insertType(type: TypeMaster) {
        this.confirmation.confirm({
          key: 'confirm-key',
          message: this.translate.instant('Do you want to Save?'),
          accept: () => {
            this.api.InsertTypeMast(type).subscribe((data) => {
              this.typeList = data;
              this.typeFormGroup.reset();
              this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Type Saved Succesfully' });
    
              this.reset();
            }, (err) => {
              this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Save Failed') });
            });
          }
        });
    
      }

    // public updateType(type: TypeMaster) {
    //   this.api.UpdateTypeMast(type).subscribe((data) => {
    //     this.typeList = data;
    //     this.reset();
    //   });
    // }
    public updateType(type: TypeMaster) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to Save?'),
        accept: () => {
          this.api.UpdateTypeMast(type).subscribe((data) => {
            this.typeList = data;
            this.typeFormGroup.reset();
            this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Type Updated Succesfully' });
  
            this.reset();
          }, (err) => {
            this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Update Failed') });
          });
        }
      });
  
    }
    // public deleteType(type: TypeMaster) {
    //   this.btnlabel = 'Submit';
    //   this.api.DeleteTypeMast(type).subscribe((data) => {
    //     this.typeList = data;
    //     this.reset();
    //   });
    // }

    delete() {
      this.confirmation.confirm({
        key: 'confirm-key',
        //message: 'Do you want to delete Location?',
        message: this.translate.instant('Do you want to Delete?'),
        accept: () => {
          this.api
            .DeleteTypeMast(this.dataForDelete)
            .subscribe(
              (data) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Type Deleted Succesfully',
                  
                });
                //this.new();
                this.typeList = data;
                this.typeFormGroup.disable();
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Failed',
                });
              }
            );
        },
      });
      this.btnFlag = {
        edit: false,
        cancel: false,
        save: false,
        update: false,
        delete: false,
        };    
        this.typeFormGroup.reset();
    }
    edit() {
      this.typeFormGroup.enable();
      this.btnFlag = {
        edit: false,
        cancel: false,
        save: false,
        update: true,
        delete: false,
      };    
    }
  
    ExitNew() {
      this.router.navigate(['/dashboard']);
    }
    new() {
  
      this.typeFormGroup.reset();
      this.typeFormGroup.enable();
      this.typeFormGroup.updateValueAndValidity();
      this.btnFlag = {
        edit: false,
        cancel: false,
        save: true,
        update: false,
        delete: false,
      };
    }

}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?:boolean;
}

