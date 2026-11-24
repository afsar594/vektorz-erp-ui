import { LocationMaster } from './../../../domain/Masters/LocationMaster';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import { ConfirmationService, MessageService, SelectItem } from 'primeng';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit {
  ScreenId: number;
  Permission: any;
  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  title: string;
  breadcumbmodel: MenuItem[];
  locationFormGroup: FormGroup;
  btnFlag: ButtonFlag;
  dataForDelete: any;
  displayedColumns: string[] = ['code', 'name', 'action'];
  locationList: LocationMaster[] = [];

  displayDialog = false;
  hotid = 'salesMan_HotEntry';
  licensekey: string;
  location_entryDataset = [];
  location_entry: Handsontable.GridSettings;
  private hotRegisterer = new HotTableRegisterer();

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private api: MasterApiService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,
    private translate: TranslateService,
    private utilityService: UtilityService,
    private ngZone: NgZone
  ) {}
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Location') {
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
    // this.operation.insert = true;
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.initiolizeForm();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
    this.getAllCostCenter();
    this.initilizeControlLocation();
  }
  initilizeControlLocation() {
    this.location_entry = this.utilityService.getTableConfig(columnList(this), [
      0,
    ]);

    this.getLocationList();
  }

  getAllCostCenter() {
    this.api.GetAllCostCenter().subscribe((k) => {
      this.costcenterArray = k;
      this.costcenterList = k.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterName,
      }));
      this.costcenterList.unshift({ label: '--Select--', value: 0 });

      this.costcenterArry = k.map((ar) =>
        ar.costCenterMasterCostCenterName.trim()
      );
    });
  }

  initiolizeForm() {
    this.locationFormGroup = this.fb.group({
      locationMasterLocationId: [0],
      locationMasterLocationName: [
        { value: '', disabled: true },
        [Validators.required],
      ], // [null, [Validators.required]],
      locationMasterLocationAddress: [{ value: '', disabled: true }],
      locationMasterLocationDeleted: [null],
      locationMasterLocationStatus: [false],
      locationMasterLocationTelephone: [{ value: '', disabled: true }],
      locationMasterLocationFax: [{ value: '', disabled: true }],
      locationMasterLocationEmail: [null],
      locationMasterLocationCashAccount: [null],
      locationMasterLocationCostCenter: [{ value: '', disabled: true }],
    });
  }

  edit() {
    this.locationFormGroup.enable();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
  }

  public get f() {
    return this.locationFormGroup.controls;
  }

  public getLocationList() {
    this.api.GetAllLocation().subscribe((data: any) => {
      data.map((i) => {
        i.locationMasterLocationCostCenterName = this.costcenterList?.find(
          (k) => k.value == i.locationMasterLocationCostCenter
        )?.label;
      });
      this.locationList = data;
      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  new() {
    this.displayDialog = true;
    this.locationFormGroup.reset();
    this.locationFormGroup.enable();
    this.locationFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
  }

  saveLocation() {
    this.locationFormGroup.markAllAsTouched();
    if (this.btnFlag.save) {
      this.insertLocation(this.locationFormGroup.value);
    } else {
      this.updateLocation(this.locationFormGroup.value);
    }
  }

  updateValues(data: LocationMaster) {
    this.dataForDelete = data;
    this.locationFormGroup.patchValue(data);
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: false,
      delete: true,
    };
    this.displayDialog = true;
    this.locationFormGroup.enable();
  }

  deleteRecord() {
    this.locationFormGroup.patchValue(this.dataForDelete);
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: true,
      delete: true,
    };
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete Location?',
      accept: () => {
        this.displayDialog = false;
        this.api.DeleteLocation(this.dataForDelete).subscribe(
          (data) => {
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.utilityService
              .LoadDropdownLocationMaster(true)
              .subscribe((res) => {});
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Location Deleted Succesfully',
            });
            this.new();
            this.locationList = data;
            this.locationFormGroup.disable();
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

  removeLocation(data: LocationMaster) {
    this.deleteLocation(data);
  }
  public get() {
    return this.locationFormGroup.controls;
  }
  public reset() {
    this.locationFormGroup.reset();
    this.f.locationMasterLocationStatus.setValue(false);
  }

  public insertLocation(location: LocationMaster) {
    if (this.locationFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save?'),
        accept: () => {
          this.displayDialog = false;
          this.api.InsertLocation(location).subscribe(
            (data: any) => {
              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data });
              this.utilityService
                .LoadDropdownLocationMaster(true)
                .subscribe((res) => {});
              this.locationList = data;
              this.reset();
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'New Location Saved Succesfully',
              });
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
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
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.locationFormGroup.markAllAsTouched();
      this.locationFormGroup.markAsDirty();
    }
  }

  public updateLocation(location: LocationMaster) {
    if (this.locationFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to Update?'),
        accept: () => {
          this.displayDialog = false;
          this.api.UpdateLocation(location).subscribe(
            (data: any) => {
              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data });
              this.utilityService
                .LoadDropdownLocationMaster(true)
                .subscribe((res) => {});
              this.locationList = data;
              this.reset();
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Location Updated Succesfully',
              });
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Updated Failed'),
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
      this.locationFormGroup.markAllAsTouched();
      this.locationFormGroup.markAsDirty();
    }
  }

  public deleteLocation(location: LocationMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.api.DeleteLocation(location).subscribe((data: any) => {
          this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
          this.messageService.add({
            severity: 'success',
            summary: 'Alert',
            detail: 'Deleted Sucessfully',
          });
          this.locationList = data;
        });
      },
    });
  }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.locationMasterLocationId != null) {
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
          this.deleteLocation(rowData);
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
export const columnList = (component: LocationComponent) => [
  {
    data: 'locationMasterLocationId',
    type: 'text',
    label: 'Code',
    toolTip: 'Location Code',
  },
  {
    data: 'locationMasterLocationName',
    type: 'text',
    label: 'Name',
    toolTip: 'Location Name',
  },
  {
    data: 'locationMasterLocationAddress',
    type: 'text',
    label: 'Address',
    toolTip: 'Location Address',
  },
  {
    data: 'locationMasterLocationCostCenter',
    type: 'text',
    label: 'Cost Center',
    toolTip: 'Cost Center',
  },
  {
    data: 'locationMasterLocationTelephone',
    type: 'text',
    label: 'Telephone',
    toolTip: 'Telephone Number',
  },
  {
    data: 'locationMasterLocationFax',
    type: 'text',
    label: 'Fax',
    toolTip: 'Fax Number',
  },
  {
    data: 'locationMasterLocationStatus',
    type: 'checkbox',
    label: 'In-Active',
    toolTip: 'Location Status',
  },
  {
    data: null,
    label: 'Action',
    toolTip: 'Action',
    renderer: component.buttonRenderer?.bind(component),
  },
];
