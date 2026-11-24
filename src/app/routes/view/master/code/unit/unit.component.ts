import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { MenuItem } from 'primeng/api/menuitem';
import { map } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss'],
})
export class UnitComponent implements OnInit {
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private api: MasterApiService,
    private messageService: MessageService,
    private permission: PermissionsService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private utilityService: UtilityService
  ) {
    this.getUnitList();
  }
  ScreenId: number;
  Permission: any;
  title: string;
  breadcumbmodel: MenuItem[];
  unitFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  btnFlag: ButtonFlag;
  displayedColumns: string[] = [
    'code',
    'short name',
    'full name',
    'description',
    'status',
    'action',
  ];
  unitList: UnitMaster[] = [];
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Unit') {
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
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.unitFormGroup = this.fb.group({
      unitMasterUnitId: [0],
      unitMasterUnitShortName: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      unitMasterUnitFullName: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      unitMasterUnitDescription: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      unitMasterUnitStatus: [{ value: false, disabled: true }],
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
  }

  public getUnitList() {
    this.api.GetAllUnit().subscribe((data) => {
      this.unitList = data;
    });
  }

  saveUnit() {
    this.unitFormGroup.markAsDirty();
    this.unitFormGroup.markAllAsTouched();
    if (this.unitFormGroup.valid) {
      if (this.btnFlag.save) {
        this.insertUnit(this.unitFormGroup.value);
      } else {
        this.updateUnit(this.unitFormGroup.value);
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Fill the Mendatory Fields',
      });
    }
  }
  updateValues(data: UnitMaster) {
    this.unitFormGroup.patchValue(data);
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: false,
      delete: false,
    };
    this.unitFormGroup.disable();
  }
  removeUnit(data: UnitMaster) {
    this.deleteUnit(data);
  }
  public get f() {
    return this.unitFormGroup.controls;
  }

  public reset() {
    this.unitFormGroup.reset();
  }
  public insertUnit(unit: UnitMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Save?'),
      accept: () => {
        this.api.InsertUnit(unit).subscribe(
          (data) => {
            this.utilityService
              .LoadDropdownunitMasters(true)
              .subscribe((res) => {});
            this.unitList = data;
            this.unitFormGroup.reset();
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Unit Saved Succesfully',
            });

            this.reset();
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: this.translate.instant('Save Failed'),
            });
          }
        );
      },
    });
  }
  public updateUnit(unit: UnitMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Update?'),
      accept: () => {
        this.api.UpdateUnit(unit).subscribe(
          (data) => {
            this.utilityService
              .LoadDropdownunitMasters(true)
              .subscribe((res) => {});
            this.unitList = data;
            this.unitFormGroup.reset();
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Unit Update Succesfully',
            });

            this.reset();
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: this.translate.instant('Update Failed'),
            });
          }
        );
      },
    });
  }

  public deleteUnit(unit: UnitMaster) {
    this.btnlabel = 'Submit';
    this.api.DeleteUnit(unit).subscribe((data: any) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Alert',
        detail: 'Updated Sucessfully',
      });
      this.unitList = data;
      this.reset();
    });
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.api.DeleteUnit(this.unitFormGroup.value).subscribe(
          (data) => {
            this.utilityService
              .LoadDropdownunitMasters(true)
              .subscribe((res) => {});
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Unit Deleted Succesfully',
            });
            this.new();
            this.getUnitList();
            this.unitFormGroup.disable();
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
  edit() {
    this.unitFormGroup.enable();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  new() {
    this.unitFormGroup.reset();
    this.unitFormGroup.enable();
    this.unitFormGroup.updateValueAndValidity();
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
