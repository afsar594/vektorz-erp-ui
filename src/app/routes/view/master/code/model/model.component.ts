// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-model',
//   templateUrl: './model.component.html',
//   styleUrls: ['./model.component.scss']
// })
// export class ModelComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ModelMaster } from 'src/app/routes/domain/Masters/ModelMaster';
import { MenuItem } from 'primeng/api/menuitem';
import { map } from 'rxjs/operators';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import { TypeMaster } from 'src/app/routes/domain/Masters/TypeMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss']
})
export class ModelComponent implements OnInit {
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
                this.getModelList();
               }
 title: string;
 breadcumbmodel: MenuItem[];
 modelFormGroup: FormGroup;
 btnlabel: string = 'Submit';
 dataForDelete: any;
 btnFlag: ButtonFlag;
 operation: {insert: boolean, update: boolean, delete: boolean} = {insert: false, update: false, delete: false};
 displayedColumns: string[] = ['code', 'name', 'action'];
 modelList: ModelMaster[] = [];
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId); 
      
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Model') {
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
  });
    this.modelFormGroup = this.fb.group({
      modelMasterId: [0],
      modelMasterTypeId: [{ value: null, disabled: true, },[Validators.required]],
      modelMasterName: [{ value: null, disabled: true, },[Validators.required]],
      modelMasterUserId:  [0],
      modelMasterDeleted: [null],
      modelMasterStatus: [{ value: false, disabled: true, }],

  });
  this.btnFlag = {
    edit: false,
    cancel: false,
    save: false,
    update: false,
    delete: false,
  };
  }

   public getModelList() {
    this.api.GetAllModel().subscribe((data) => {
      this.modelList = data;
      this.getTypeList();
    });
    }


//kkkkkkkkkkkkkkkkkkkk
typeListNew: SelectItem[];
  typeList: TypeMaster[] = [];
 
  // public getVendorList() {
  //   this.api.GetAllVendor().subscribe((data) => {
  //     this.vendorList = data;
  //   });
  //   }


    public getTypeList() {
      this.api.GetAllTypeMast().subscribe((data) => {
      this.typeList = data;
  
      this.typeListNew = data.map(item =>
        ({
         label: item.typeMasterTypeName,
         value: item.typeMasterTypeId
       }));
       this.typeListNew.push({label: 'Select',value:-1})
      });
  
  
      }

  
//kkkkkkkkkkkkkkkkkkkkkkkkkkkk


    saveModel() {
      this.modelFormGroup.markAsDirty();
      this.modelFormGroup.markAllAsTouched();
      if (this.modelFormGroup.valid) {
           if (this.operation.insert) {
        this.insertModel(this.modelFormGroup.value);
      } else if (this.operation.update) {
        this.updateModel(this.modelFormGroup.value);
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
        this.modelFormGroup.reset();
        this.modelFormGroup.disable();
    }
     updateValues(data: ModelMaster) {
      this.dataForDelete=data
      this.operation = {insert: false, update: true, delete: false};
      this.btnlabel = 'Update';
      this.modelFormGroup.patchValue(data);
      this.btnFlag = {
        edit: true,
        cancel: false,
        save: false,
        update: false,
        delete: true,
      };
      this.modelFormGroup.disable();
     }
    // removeModel(data: ModelMaster) {
    //   this.operation = {insert: true, update: false, delete: false};
    //   this.btnlabel = 'Submit';
    //   this.deleteModel(data);
    // }
    public get f() {
      return this.modelFormGroup.controls;
    }
    public  reset() {
      this.operation = {insert: true, update: false, delete: false};
      this.btnlabel = 'Submit';
      this.modelFormGroup.reset();
    }

    // public insertModel(model: ModelMaster) {
    //   this.api.InsertModel(model).subscribe((data) => {
    //     this.modelList = data;
    //     this.reset();
    //   });
    // }

public insertModel(model: ModelMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Save?'),
      accept: () => {
        this.api.InsertModel(model).subscribe((data) => {
          this.modelList = data;
          this.modelFormGroup.reset();
          this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Model Saved Succesfully' });

          this.reset();
        }, (err) => {
          this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Save Failed') });
        });
      }
    });

  }


    // public updateModel(model: ModelMaster) {
    //   this.api.UpdateModel(model).subscribe((data) => {
    //     this.modelList = data;
    //     this.reset();
    //   });
    // }

    public updateModel(model: ModelMaster) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to Save?'),
        accept: () => {
          this.api.UpdateModel(model).subscribe((data) => {
            this.modelList = data;
            this.modelFormGroup.reset();
            this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Model Updated Succesfully' });
  
            this.reset();
          }, (err) => {
            this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Update Failed') });
          });
        }
      });
  
    }

    // public deleteModel(model: ModelMaster) {
    //   this.btnlabel = 'Submit';
    //   this.api.DeleteModel(model).subscribe((data) => {
    //     this.modelList = data;
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
            .DeleteModel(this.dataForDelete)
            .subscribe(
              (data) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Model Deleted Succesfully',
                  
                });
                //this.new();
                this.modelList = data;
                this.modelFormGroup.disable();
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
        this.modelFormGroup.reset();
    }
    edit() {
      this.modelFormGroup.enable();
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
  
      this.modelFormGroup.reset();
      this.modelFormGroup.enable();
      this.modelFormGroup.updateValueAndValidity();
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
