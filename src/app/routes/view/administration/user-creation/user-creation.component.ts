import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ConfirmationService, MessageService, SelectItem } from 'primeng';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { AdministrationService } from 'src/app/routes/service/Administrations/administration.service';
import { DesignationService } from 'src/app/routes/service/designation.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-user-creation',
  templateUrl: './user-creation.component.html',
  styleUrls: ['./user-creation.component.scss'],
})
export class UserCreationComponent implements OnInit {
  title: string;
  subtitle: string;
  loading = false;
  matchPass: boolean = false;
  confirmDropDatabaseDialogVisible = false;
  btnFlag: ButtonFlag;
  url: string | ArrayBuffer;
  index: number = 0;
  groupList: any;
  groupArry: any;
  groupArray: any;
  files: any[] = [];
  user: any;
  fileEntry: any;
  handleChange(e) {
    this.index = e.index;
  }
  dataset: any;
  licensekey: any;
  gridHeader: string;
  ScreenId: number;
  hotid = 'usercreation';
  private hotRegisterer = new HotTableRegisterer();
  usercreation: Handsontable.GridSettings;
  selectedView: string = 'Summary';
  UserCreationForm: FormGroup;
  initializeControls() {
    this.usercreation = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [50, 100, 80, 50],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      // allowInsertColumn: false,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'Login ID',
          type: 'text',
        },
        {
          data: 'User Name',
          type: 'numeric',
        },
        {
          data: 'Group Name',
          type: 'numeric',
        },
        {
          data: 'Fa',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Login ID'),
        this.translate.instant('User Name'),
        this.translate.instant('Group Name'),
        this.translate.instant('Fa'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[] = [];
  locationArry: string[] = [];

  constructor(
    private router: Router,
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private permission: PermissionsService,
    private AdministrationService: AdministrationService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private _MasterApiService: MasterApiService,
    private accountapi: AccountApiService,
    private DesignationService: DesignationService
  ) {}

  isPasswordVisible: boolean = false;
  isPassword: boolean = false;
  togglePasswordVisibility(user) {
    if (user) {
      this.isPasswordVisible = !this.isPasswordVisible;
    } else {
      this.isPassword = !this.isPassword;
    }
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      //console.log(rights);
    });
    (this.UserCreationForm = new FormGroup({
      loginId: new FormControl(''),
      UserNAme: new FormControl('', Validators.required),
      WorkGroupId: new FormControl('', Validators.required),
      LocationId: new FormControl(-1),

      Isfreeze: new FormControl(),
      userImage: new FormControl(),
      UserPassword: new FormControl('', Validators.required),
      ConfirmPassword: new FormControl('', Validators.required),
      emailId: new FormControl(''),
      signImg: new FormControl(),
      departmentId: new FormControl(-1),
      designationId: new FormControl(-1),
      employeeName: new FormControl(''),
    })),
      this.UserCreationForm?.disable();
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.GetAllWorkGroup();
    this.initializeControls();
    this.GetAllUserFile();
    this.getAllLOC();
    this.LoadDepartmentDD();
    this.LoadDesignationDD();
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
    });
  }

  password() {
    if (
      this.UserCreationForm.controls['UserPassword'].value ===
      this.UserCreationForm.controls['ConfirmPassword'].value
    ) {
      this.matchPass = false;
    } else {
      this.matchPass = true;
    }
  }

  onSelectFile($event, img) {
    if ($event.target.files && $event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL($event.target.files[0]); // read file as data url
      reader.onload = (event) => {
        this.url = event.target.result;
        if (img == 'Profile') {
          this.UserCreationForm.controls.userImage.setValue(
            event.target.result
          );
        } else {
          this.UserCreationForm.controls.signImg.setValue(event.target.result);
        }
      };
    }
  }

  new() {
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.UserCreationForm.enable();
    this.UserCreationForm.reset();
  }

  save() {
    this.UserCreationForm.markAllAsTouched();
    this.fileEntry = {
      userId:
        this.btnFlag.save == true
          ? 0
          : Number(this.UserCreationForm.get('loginId').value), // Assuming this is a placeholder for a real user ID
      logInId: this.UserCreationForm.get('loginId').value,
      userName: this.UserCreationForm.get('UserNAme').value,
      workGroupId: this.UserCreationForm.get('WorkGroupId').value,
      password: this.UserCreationForm.get('UserPassword').value,
      deleted: false,
      system: true,
      userImageBase64: this.UserCreationForm.value.userImage?.split(',')[1],
      signImageBase64: this.UserCreationForm.value.signImg?.split(',')[1],
      LocationId: this.UserCreationForm.get('LocationId').value,
      freeze: this.UserCreationForm.get('Isfreeze').value,
      emailId: this.UserCreationForm.get('emailId').value,
      departmentId: this.UserCreationForm.get('departmentId').value,
      designationId: this.UserCreationForm.get('designationId').value,
      employeeName: this.UserCreationForm.get('employeeName').value,
    };
    if (this.btnFlag.save) {
      this.SaveUser(this.fileEntry);
    } else {
      this.UpdateUser(this.fileEntry);
    }
  }

  SaveUser(data: any) {
    if (this.UserCreationForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Create User....?',
        accept: () => {
          this.AdministrationService.InsertUser(data).subscribe({
            next: (data) => {
              if (data.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.view(data.result);
                this.UserCreationForm.disable();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Record Saved Succesfully',
                });
                this.GetAllUserFile();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: data.message,
                });
              }
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Operation Failed!',
              });
            },
          });
        },
        reject: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Operation Cancelled!',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.UserCreationForm.markAllAsTouched();
      this.UserCreationForm.markAsDirty();
    }
  }

  UpdateUser(user: any) {
    if (this.UserCreationForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Update User....?',
        accept: () => {
          this.AdministrationService.UpdateUser(user).subscribe({
            next: (data) => {
              if (data.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.view(data.result);
                this.UserCreationForm.disable();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Record Updated Succesfully',
                });
                this.GetAllUserFile();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: data.message,
                });
              }
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Operation Failed!',
              });
            },
          });
        },
        reject: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Operation Cancelled!',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.UserCreationForm.markAllAsTouched();
      this.UserCreationForm.markAsDirty();
    }
  }

  delete() {
    let data = {
      userId:
        this.btnFlag.save == true
          ? 0
          : Number(this.UserCreationForm.get('loginId').value), // Assuming this is a placeholder for a real user ID
      logInId: this.UserCreationForm.get('loginId').value,
      userName: this.UserCreationForm.get('UserNAme').value,
      workGroupId: this.UserCreationForm.get('WorkGroupId').value,
      password: this.UserCreationForm.get('UserPassword').value,
      deleted: true,
      system: true,
      freeze: this.UserCreationForm.get('Isfreeze').value,
    };

    if (this.UserCreationForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Delete User....?',
        accept: () => {
          this.AdministrationService.DeleteUser(data).subscribe({
            next: (data) => {
              if (data.valid) {
                this.btnFlag = {
                  edit: false,
                  cancel: false,
                  save: true,
                  update: false,
                  delete: false,
                };
                this.UserCreationForm.disable();
                this.UserCreationForm.reset();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
                this.GetAllUserFile();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: data.message,
                });
              }
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Operation Failed!',
              });
            },
          });
        },
        reject: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Operation Cancelled!',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.UserCreationForm.markAllAsTouched();
      this.UserCreationForm.markAsDirty();
    }
  }

  view(item: any) {
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: true,
      delete: true,
    };
    // const Location =this.locationArray?.find(j => j.locationMasterLocationId === item?.LocationId)?.locationMasterLocationName;
    this.UserCreationForm.patchValue({
      loginId: item.logInId,
      UserNAme: item.userName,
      UserPassword: item.password,
      ConfirmPassword: item.password,
      WorkGroupId: item.workGroupId,
      Isfreeze: item.freeze,
      LocationId: item?.locationId,
      userImage: 'data:image/png;base64,' + item?.userImageBase64,
      signImg: 'data:image/png;base64,' + item?.signImageBase64,
      emailId: item.emailId,
      departmentId: item.departmentId,
      designationId: item.designationId,
      employeeName: item.employeeName,
    });
  }

  GetAllUserFile() {
    this.AdministrationService.GetAllUserFile().subscribe((res) => {
      this.files = res.result;
      // console.log("get all",res);
    });
  }
  DepartmentMasterArray: any[] = [];
  DepartmentMasterArry: string[] = [];
  DepartmentMasterList: SelectItem[];

  LoadDepartmentDD() {
    this.accountapi.LoadDepartmentDropdown().subscribe((m) => {
      this.DepartmentMasterArray = m.resultSet.departmentsList;
      this.DepartmentMasterList = m.resultSet.departmentsList?.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentId,
      }));
      this.DepartmentMasterList.unshift({
        label: '--Select Department--',
        value: -1,
      });
    });
  }
  DesignationMasterArray: any[] = [];
  DesignationMasterArry: string[] = [];
  DesignationMasterList: SelectItem[];

  LoadDesignationDD() {
    this.DesignationService.getAllDesignation().subscribe((r: any) => {
      this.DesignationMasterArray = r;
      this.DesignationMasterList = r?.map((kl) => ({
        label: kl.designation,
        value: kl.designationId,
      }));
      this.DesignationMasterList.unshift({
        label: '--Select Designation--',
        value: -1,
      });
    });
  }

  GetAllWorkGroup() {
    this.AdministrationService.GetAllWorkGroup().subscribe((res) => {
      this.groupArray = res;
      this.groupList = res.map((kl) => ({
        label: kl.workGroupMasterWorkGroupName,
        value: kl.workGroupMasterWorkGroupId,
      }));
      this.groupList.unshift({ label: '--Select WorkGroup--', value: -1 });
      this.groupArry = res?.map((ar) =>
        ar.workGroupMasterWorkGroupName?.trim()
      );
    });
  }

  IsPasswordStrong(password: string) {
    // Minimum length requirement
    const minLength = 8;
    if (password.length < minLength) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Password must be at least 8 characters long.',
      });
    } else if (!/[A-Z]/.test(password)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Password must contain at least one uppercase letter.',
      });
    } else if (!/[a-z]/.test(password)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Password must contain at least one lowercase letter.',
      });
    } else if (!/\d/.test(password)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Password must contain at least one number.',
      });
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Password must contain at least one special character.',
      });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Alert',
        detail: 'Password is strong.',
      });
    }
  }

  getGroupName(id) {
    let group = this.groupList?.find((k) => k?.value == id);
    return group?.label;
  }
  Edit() {
    this.UserCreationForm.enable();
    this.UserCreationForm.updateValueAndValidity();
  }
  exit() {
    this.router.navigate(['/dashboard']);
  }
}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
