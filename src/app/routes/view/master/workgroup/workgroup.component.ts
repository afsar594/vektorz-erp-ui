
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { WorkGroupMaster } from 'src/app/routes/domain/Masters/WorkGroupMaster';
import { MenuItem } from 'primeng/api/menuitem';
import { map } from 'rxjs/operators';
import { ConfirmationService, MessageService, SelectItem } from 'primeng';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService } from 'src/app/shared/service/permissions.service';


@Component({
  selector: 'app-workgroup',
  templateUrl: './workgroup.component.html',
  styleUrls: ['./workgroup.component.scss']
})
export class WorkgroupComponent implements OnInit {
  ScreenId: number;
  Permission: any;
  constructor(private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private api: MasterApiService,
    private messageService: MessageService,
    private permission: PermissionsService,
    private confirmation: ConfirmationService,) {

  }
  v_dashboardList: SelectItem[];


  confirmDropDatabaseDialogVisible: false;
  title: string;
  breadcumbmodel: MenuItem[];
  workGroupFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  dataForDelete: any;
  btnFlag: ButtonFlag;
  operation: { insert: boolean, update: boolean, delete: boolean } = { insert: false, update: false, delete: false };
  displayedColumns: string[] = ['code', 'name', 'action'];
  workGroupList: WorkGroupMaster[] = [];

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Work Group Master') {
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
    this.workGroupFormGroup = this.fb.group({
      workGroupMasterWorkGroupId: [0],
      workGroupMasterWorkGroupName: [{ value: null, disabled: true, }, [Validators.required]],
      workGroupMasterWorkGroupdashboardType: [{ value: null, disabled: true, }]
    });
    this.getWorkGroupList();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: false,
      delete: false,
    };
    this.v_dashboardList = [
      { label: 'Main Dashboard', value: 'dashboard' },
      { label: 'Clock Dashboard', value: 'clockdashboard' },
      // { label: 'Sales Dashboard', value: 'salesdashboard' },
      // { label: 'Inventory Dashboard', value: 'inventorydashboard' },
      // { label: 'Accounts Dashboard', value: 'accountsdashboard' }
    ];
  }

  public getWorkGroupList() {
    this.api.GetAllWorkGroup().subscribe((data) => {
      this.workGroupList = data;
    });
  }

  saveWorkGroup() {
    this.workGroupFormGroup.markAsDirty();
    this.workGroupFormGroup.markAllAsTouched();
    if (this.workGroupFormGroup.valid) {
      if (this.operation.insert) {
        this.insertWorkGroup(this.workGroupFormGroup.value);
      } else if (this.operation.update) {
        this.updateWorkGroup(this.workGroupFormGroup.value);
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
    this.workGroupFormGroup.reset();
    this.workGroupFormGroup.disable();

  }

  updateValues(data: WorkGroupMaster) {
    this.dataForDelete = data;
    this.operation = { insert: false, update: true, delete: false };
    this.btnlabel = 'Update';
    this.workGroupFormGroup.patchValue(data);
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: false,
      delete: true,
    };
    this.workGroupFormGroup.disable();
  }

  // removeWorkGroup(data: WorkGroupMaster) {
  //   this.operation = { insert: true, update: false, delete: false };
  //   this.btnlabel = 'Submit';
  //   this.deleteWorkGroup(data);
  // }

  public get f() {
    return this.workGroupFormGroup.controls;
  }

  public reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.workGroupFormGroup.reset();
  }

  public insertWorkGroup(workGroup: WorkGroupMaster) {

    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to save Work Group?'),
      accept: () => {
        this.api.InsertWorkGroup(workGroup).subscribe((data: any) => {
          if (data) {

            this.reset();
            this.getWorkGroupList();
            this.messageService.add({
              severity: 'success', summary: 'Alert',
              detail: "Saved"
            });

          } else if (data.error) {
            this.messageService.add({
              severity: 'error', summary: 'Alert',
              detail: (data.message != null && data.message?.trim() !== '' ? data.message : data.exception)
            });
          }
        }, (err) => {
          this.messageService.add({ severity: 'error', summary: 'Alert', detail: ' Work Group Save Failed' });
        });
      }
    });

  }


  public updateWorkGroup(workGroup: WorkGroupMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Update Work Group?'),
      accept: () => {
        this.api.UpdateWorkGroup(workGroup).subscribe((data: any) => {
          if (data) {
            this.reset();
            this.getWorkGroupList();
            this.messageService.add({
              severity: 'success', summary: 'Alert',
              detail: "Work Group Updated Succesfully"
            });
          } else if (data.error) {
            this.messageService.add({
              severity: 'error', summary: 'Alert',
              detail: (data.message != null && data.message?.trim() !== '' ? data.message : data.exception)
            });
          }
        }, (err) => {
          this.messageService.add({ severity: 'error', summary: 'Alert', detail: ' Work Group Update Failed' });
        });
      }
    });
  }

  // public deleteWorkGroup(workGroup: WorkGroupMaster) {
  //   this.btnlabel = 'Submit';

  //   this.confirmation.confirm({
  //     key: 'confirm-key',
  //     message: this.translate.instant('Do you want to Delete Work Group?'),
  //     accept: () => {
  //       this.api.DeleteWorkGroup(workGroup).subscribe((data: any) => {
  //         if (data) {

  //           this.reset();
  //           this.getWorkGroupList();
  //           this.messageService.add({
  //             severity: 'success', summary: 'Alert',
  //             detail: this.translate.instant(data.message)
  //           });
  //         } else if (data.error) {
  //           this.messageService.add({
  //             severity: 'error', summary: 'Alert',
  //             detail: (data.message != null && data.message?.trim() !== '' ? data.message : data.exception)
  //           });
  //         }
  //       }, (err) => {
  //         this.messageService.add({ severity: 'error', summary: 'Alert', detail: ' Work Group Delete Failed' });
  //       });
  //     }
  //   });

  // }
  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      //message: 'Do you want to delete Location?',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.api
          .DeleteWorkGroup(this.dataForDelete)
          .subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Work Group Deleted Succesfully',

              });
              //this.new();
              this.workGroupList = data;
              this.workGroupFormGroup.disable();
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
    this.workGroupFormGroup.reset();

  }
  edit() {
    this.workGroupFormGroup.enable();
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

    this.workGroupFormGroup.reset();
    this.workGroupFormGroup.enable();
    this.workGroupFormGroup.updateValueAndValidity();
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
  new?: boolean;
}
