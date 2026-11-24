import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import { DepartmentMaster } from 'src/app/routes/domain/Masters/DepartmentMaster';
import { ConfirmationService, MessageService } from 'primeng';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
})
export class DepartmentComponent implements OnInit {
  ScreenId: number;
  Permission: any;
  confirmDropDatabaseDialogVisible: boolean = false;

  title: string;

  breadcumbmodel: MenuItem[];
  departmentFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  btnFlag: ButtonFlag;
  dataForDelete: any;
  SavedDepartment: Object;
  operation: { insert: boolean; update: boolean; delete: boolean } = {
    insert: false,
    update: false,
    delete: false,
  };
  displayedColumns: string[] = ['code', 'name', 'Status', 'action'];
  departmentList: DepartmentMaster[] = [];
  displayDialog = false;
  hotid = 'salesMan_HotEntry';
  licensekey: string;
  department_entryDataset = [];
  department_entry: Handsontable.GridSettings;
  private hotRegisterer = new HotTableRegisterer();

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private api: MasterApiService,
    private permission: PermissionsService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private utilityService: UtilityService,
    private ngZone: NgZone
  ) {}
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Department Master') {
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
    this.operation.insert = true;
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.departmentFormGroup = this.fb.group({
      departmentMasterDepartmentId: [0],
      departmentMasterDepartmentCode: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      departmentMasterDepartmentName: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      departmentMasterDepartmentStatus: [{ value: false, disabled: true }],
      departmentMasterDepartmentDelStatus: [null],
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: false,
      delete: false,
    };
    this.initilizeControlDepartment();
  }
  initilizeControlDepartment() {
    this.department_entry = this.utilityService.getTableConfig(
      columnList(this),
      [0]
    );

    this.getDepartmentList();
  }
  edit() {
    this.departmentFormGroup.enable();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: true,
      delete: false,
    };
    this.displayDialog = true;
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  new() {
    this.operation = { insert: true, update: false, delete: false };
    this.departmentFormGroup.reset();
    this.departmentFormGroup.enable();
    this.displayDialog = true;
    //this.f.purchaseQuotationNo.clearValidators();
    //this.f.purchaseQuotationDate.setValue(new Date());
    this.departmentFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
  }
  public getDepartmentList() {
    this.api.GetAllDepartment().subscribe((data) => {
      this.departmentList = data;
      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
    });
  }

  saveDepartment() {
    this.departmentFormGroup.markAllAsTouched();
    this.departmentFormGroup.markAsDirty();
    if (this.departmentFormGroup.valid) {
      if (this.operation.insert) {
        this.insertDepartment(this.departmentFormGroup.value);
      } else if (this.operation.update) {
        this.updateDepartment(this.departmentFormGroup.value);
      } else {
      }
    }
    // this.btnFlag = {
    //   edit: false,
    //   cancel: false,
    //   save: false,
    //   update: false,
    //   delete: false,
    // }; //this.departmentFormGroup.reset();
  }

  updateFormGrid(OBVpt: any) {
    this.departmentFormGroup.patchValue({
      departmentMasterDepartmentId: OBVpt.departmentMasterDepartmentId,
      departmentMasterDepartmentCode: OBVpt.departmentMasterDepartmentCode,
      departmentMasterDepartmentName: OBVpt.departmentMasterDepartmentName,
      departmentMasterDepartmentStatus: OBVpt.departmentMasterDepartmentStatus,
      departmentMasterDepartmentDelStatus:
        OBVpt.departmentMasterDepartmentDelStatus,
    });
  }

  updateValues(data: DepartmentMaster) {
    this.dataForDelete = data;
    this.operation = { insert: false, update: true, delete: false };
    this.btnlabel = 'Update';
    this.displayDialog = true;
    this.departmentFormGroup.patchValue(data);
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: false,
      delete: true,
    };
    this.departmentFormGroup.enable();
  }
  // removeDepartment(data: DepartmentMaster) {
  //   this.operation = { insert: true, update: false, delete: false };
  //   this.btnlabel = 'Submit';
  //   this.deleteDepartment(data);
  // }
  public get f() {
    return this.departmentFormGroup.controls;
  }
  public reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    //this.departmentFormGroup.reset();
  }

  public insertDepartment(department: DepartmentMaster) {
    if (this.departmentFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to Save?'),
        accept: () => {
          this.displayDialog = false;
          this.api.InsertDepartment(department).subscribe(
            (data: any) => {
              this.departmentList = data;

              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data });
              // this.getDepartmentList();

              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.utilityService
                .LoadDepartmentDropdown(true)
                .subscribe((res) => {});
              if (data.valid) {
                this.updateFormGrid(data.result);
                this.SavedDepartment = data.result;
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: data.message,
                });
              }
              // else {
              //   this.messageService.add({
              //     severity: 'error',
              //     summary: 'Error',
              //     detail: data.message || data.exception,
              //   });
              // }

              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Department Saved Succesfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Save Operation Failed'),
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.departmentFormGroup.markAllAsTouched();
      this.departmentFormGroup.markAsDirty();
    }
  }

  public updateDepartment(department: DepartmentMaster) {
    if (this.departmentFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to Update?'),
        accept: () => {
          this.displayDialog = false;
          this.api.UpdateDepartment(department).subscribe(
            (data: any) => {
              this.departmentList = data;
              // this.getDepartmentList();

              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data });
              // this.reset();
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.utilityService
                .LoadDepartmentDropdown(true)
                .subscribe((res) => {});
              if (data.valid) {
                this.updateFormGrid(data.result);
                this.SavedDepartment = data.result;
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: data.message,
                });
              }

              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Department Updated Succesfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Save Operation Failed'),
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.departmentFormGroup.markAllAsTouched();
      this.departmentFormGroup.markAsDirty();
    }
  }

  GetSavedDetails(id: any) {
    this.api.GetAllDepartmentById(id).subscribe((data: any) => {
      this.btnFlag = {
        edit: true,
        cancel: true,
        save: false,
        update: true,
        delete: true,
      };
      this.SavedDepartment = data;
      this.updateFormGrid(data.result);
    });
  }

  deleteDepartment(rowData: any) {
    this.confirmation.confirm({
      key: 'confirm-key',
      //message: 'Do you want to delete Location?',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.displayDialog = false;
        this.api.DeleteDepartment(rowData).subscribe(
          (data) => {
            this.utilityService
              .LoadDepartmentDropdown(true)
              .subscribe((res) => {});
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Department Deleted Succesfully',
            });
            this.new();
            this.getDepartmentList();
            this.departmentList = data;
            this.departmentFormGroup.disable();
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
  }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.departmentMasterDepartmentId != null) {
      const editButton = document.createElement('a');
      editButton.className = 'iconbton edit-btn';
      editButton.style.marginRight = '10px';
      editButton.innerHTML =
        '<i class="pi pi-pencil" style="font-size: 15px;"></i>';
      editButton.addEventListener('click', () => {
        this.ngZone.run(() => {
          this.updateValues(rowData);
        });
      });
      td.appendChild(editButton);
      const deleteButton = document.createElement('a');
      deleteButton.className = 'iconbton delete-btn';
      deleteButton.innerHTML =
        '<i class="pi pi-trash" style="font-size: 15px;"></i>';
      deleteButton.addEventListener('click', () => {
        this.ngZone.run(() => {
          this.deleteDepartment(rowData);
        });
      });
      td.appendChild(deleteButton);
    }

    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
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
export const columnList = (component: DepartmentComponent) => [
  {
    data: 'departmentMasterDepartmentId',
    type: 'numeric',
    label: 'Id',
    toolTip: 'Department Id',
    width: 80,
    alignment: 'left',
  },
  {
    data: 'departmentMasterDepartmentCode',
    type: 'text',
    label: 'Code',
    toolTip: 'Department Code',
    width: 100,
    alignment: 'left',
  },
  {
    data: 'departmentMasterDepartmentName',
    type: 'text',
    label: 'Department Name',
    toolTip: 'Department Name',
    width: 200,
  },
  {
    data: 'departmentMasterDepartmentStatus',
    type: 'checkbox',
    label: 'Status',
    toolTip: 'Department Status',
    width: 80,
  },
  {
    data: null,
    label: 'Action',
    width: 120,
    renderer: component.buttonRenderer?.bind(component),
  },
];
