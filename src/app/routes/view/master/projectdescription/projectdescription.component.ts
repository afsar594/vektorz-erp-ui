import { ProjectDescriptionMaster } from '../../../domain/Masters/ProjectDescriptionMaster';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import { map } from 'rxjs/operators';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ConfirmationService, MessageService } from 'primeng';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-projectdescription',
  templateUrl: './projectdescription.component.html',
  styleUrls: ['./projectdescription.component.scss']
})
export class ProjectdescriptionComponent implements OnInit {
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
                this.getAllProjectDescription();
               }
 title: string;
 breadcumbmodel: MenuItem[];
 projectdescriptionFormGroup: FormGroup;
 btnlabel: string = 'Submit';
 dataForDelete: any;
 btnFlag: ButtonFlag;
 operation: {insert: boolean, update: boolean, delete: boolean} = {insert: false, update: false, delete: false};
 displayedColumns: string[] = ['code', 'name', 'rate', 'symbol', 'denomination', 'short_name', 'action'];
 projectdescriptionList: ProjectDescriptionMaster[] = [];
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId); 
      
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Project Description') {
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
    })
    this.operation.insert = true;
    this.breadcumbmodel = this.router.url.slice(1).split('/').map((k) => ({label: k }));
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
  });
    this.projectdescriptionFormGroup = this.fb.group({
      projectDescriptionMasterProjectDescriptionId: [0],
      projectDescriptionMasterProjectDescriptionName: [{ value: null, disabled: true, },[Validators.required]],
      projectDescriptionMasterProjectDescriptionSortOrder: [{ value: null, disabled: true, }],
      projectDescriptionMasterProjectDescriptionStatus:  [{ value: false, disabled: true, }],
      ProjectDescriptionMasterProjectDescriptionDelStatus: [{ value: false, disabled: true, }],
    });

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: false,
      delete: false,
    };
  }

   public getAllProjectDescription() {
    this.api.GetAllProjectDesc().subscribe((data) => {
      this.projectdescriptionList = data;
    });
    }

    saveprojectdescription() {
      this.projectdescriptionFormGroup.markAsDirty();
      this.projectdescriptionFormGroup.markAllAsTouched();
      if (this.projectdescriptionFormGroup.valid) {
           if (this.operation.insert) {
             this.insertProjectDescription
             this.insertProjectDescription(this.projectdescriptionFormGroup.value);
      } else if (this.operation.update) {
        this.updateProjectDescription(this.projectdescriptionFormGroup.value);
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
        this.projectdescriptionFormGroup.reset();
        this.projectdescriptionFormGroup.disable();

    }
     updateValues(data: ProjectDescriptionMaster) {
      this.dataForDelete=data;
      this.operation = {insert: false, update: true, delete: false};
      this.btnlabel = 'Update';
      this.projectdescriptionFormGroup.patchValue(data);
      this.btnFlag = {
        edit: true,
        cancel: false,
        save: false,
        update: false,
        delete: true,
      };
      this.projectdescriptionFormGroup.disable();
     }
    //  removeprojectdescription(data: ProjectDescriptionMaster) {
    //   this.operation = {insert: true, update: false, delete: false};
    //   this.btnlabel = 'Submit';
    //   this.deleteProjectDescription(data);
    // }
    public get f() {
      return this.projectdescriptionFormGroup.controls;
    }
    public  reset() {
      this.operation = {insert: true, update: false, delete: false};
      this.btnlabel = 'Submit';
      this.projectdescriptionFormGroup.reset();
    }

    // public insertProjectDescription(projectdescription: ProjectDescriptionMaster ) {
    //   this.api.InsertProjectDesc(projectdescription).subscribe((data) => {
    //     this.projectdescriptionList = data;
    //     this.reset();
    //   });
    // }

public insertProjectDescription(projectdescription: ProjectDescriptionMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Save?'),
      accept: () => {
        this.api.InsertProjectDesc(projectdescription).subscribe((data) => {
          this.projectdescriptionList = data;
          this.projectdescriptionFormGroup.reset();
          this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Project Description Saved Succesfully' });

          this.reset();
        }, (err) => {
          this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Save Failed') });
        });
      }
    });

  }

    //  public updateProjectDescription(projectdescription: ProjectDescriptionMaster ) {
    //   this.api.UpdateProjectDesc(projectdescription).subscribe((data) => {
    //     this.projectdescriptionList = data;
    //     this.reset();
    //   });
    // }

    public updateProjectDescription(projectdescription: ProjectDescriptionMaster) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to Save?'),
        accept: () => {
          this.api.UpdateProjectDesc(projectdescription).subscribe((data) => {
            this.projectdescriptionList = data;
            this.projectdescriptionFormGroup.reset();
            this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Project Description Updated Succesfully' });
  
            this.reset();
          }, (err) => {
            this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Update Failed') });
          });
        }
      });
  
    }

    // public deleteProjectDescription(projectdescription: ProjectDescriptionMaster ) {
    //   this.btnlabel = 'Submit';
    //   this.api.DeleteProjectDesc(projectdescription).subscribe((data) => {
    //     this.projectdescriptionList = data;
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
            .DeleteProjectDesc(this.dataForDelete)
            .subscribe(
              (data) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Project Description Deleted Succesfully',
                  
                });
                //this.new();
                this.projectdescriptionList = data;
                this.projectdescriptionFormGroup.disable();
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
        this.projectdescriptionFormGroup.reset();
    }
    edit() {
      this.projectdescriptionFormGroup.enable();
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
  
      this.projectdescriptionFormGroup.reset();
      this.projectdescriptionFormGroup.enable();
      this.projectdescriptionFormGroup.updateValueAndValidity();
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
