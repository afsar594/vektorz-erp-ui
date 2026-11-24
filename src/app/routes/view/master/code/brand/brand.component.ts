import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

import { MenuItem } from 'primeng/api/menuitem';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ConfirmationService, MessageService } from 'primeng';
import { TranslateService } from '@ngx-translate/core';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss'],
})
export class BrandComponent implements OnInit {
  title: string;

  breadcumbmodel: MenuItem[];
  vendorFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  dataForDelete: any;
  ScreenId: number;
  btnFlag: ButtonFlag;
  Permission: any;
  operation: { insert: boolean; update: boolean; delete: boolean } = {
    insert: false,
    update: false,
    delete: false,
  };
  displayedColumns: string[] = ['code', 'name', 'short_name', 'action'];
  vendorList: VendorMaster[] = [];
  displayDialog = false;
  hotid = 'brand_HotEntry';
  licensekey: string;
  brand_entryDataset = [];
  brand_entry: Handsontable.GridSettings;
  private hotRegisterer = new HotTableRegisterer();
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private permission: PermissionsService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private api: MasterApiService,
    private utilityService: UtilityService,
    private ngZone: NgZone
  ) {
    this.getVendorList();
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Brand') {
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

    this.vendorFormGroup = this.fb.group({
      vendorMasterVendorId: [0],
      vendorMasterVendorName: [
        { value: '', disabled: false },
        [Validators.required],
      ],
      vendorMasterVendorAddress: [null],
      vendorMasterVendorPhone: [null],
      vendorMasterVendorFax: [null],
      vendorMasterVendorEmail: [null],
      vendorMasterVendorStatus: [false],
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: false,
      delete: false,
    };
    this.initilizeControlBrand();
  }
  initilizeControlBrand() {
    this.brand_entry = this.utilityService.getTableConfig(columnList(this), [
      0,
    ]);

    this.getVendorList();
  }

  public getVendorList() {
    this.api.GetAllBrand().subscribe((data) => {
      this.vendorList = data;
      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
    });
  }
  edit() {
    this.vendorFormGroup.enable();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: true,
      delete: false,
    };
  }
  new() {
    //this.vendorFormGroup.reset();
    this.displayDialog = true;
    this.vendorFormGroup.enable();
    this.vendorFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
  }

  saveVendor() {
    this.vendorFormGroup.markAsDirty();
    this.vendorFormGroup.markAllAsTouched();
    if (this.vendorFormGroup.valid) {
      if (this.operation.insert) {
        this.insertVendor(this.vendorFormGroup.value);
      } else if (this.operation.update) {
        this.updateVendor(this.vendorFormGroup.value);
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
    this.vendorFormGroup.disable();
  }
  updateValues(data: VendorMaster) {
    this.dataForDelete = data;
    this.operation = { insert: false, update: true, delete: false };
    this.btnlabel = 'Update';
    this.vendorFormGroup.patchValue(data);
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: false,
      delete: true,
    };
    this.displayDialog = true;
    this.vendorFormGroup.enable();
  }
  //  removeVendora() {
  //   this.operation = {insert: true, update: false, delete: false};
  //   this.btnlabel = 'Submit';
  //   this.deleteVendor(this.dataForDelete);
  // }
  delete(data) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete Brand?',
      accept: () => {
        this.api.DeleteBrand(data).subscribe(
          (data) => {
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.utilityService
              .LoadDropdownBrandMasters(true)
              .subscribe((res) => {});
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Brand Deleted Succesfully',
            });
            this.vendorList = data;
            this.vendorFormGroup.disable();
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

  // removeVendor(data: VendorMaster) {
  //   this.operation = {insert: true, update: false, delete: false};
  //   this.btnlabel = 'Submit';
  //   this.deleteVendor(data);
  // }
  public get f() {
    return this.vendorFormGroup.controls;
  }
  public reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.vendorFormGroup.reset();
    this.f.vendorMasterVendorStatus.setValue(false);
    this.f.vendorMasterVendorId.setValue(0);
  }

  public insertVendor(vendor: VendorMaster) {
    //
    // this.api.InsertBrand(vendor).subscribe((data) => {
    //   this.vendorList = data;
    //   this.reset();
    // });

    if (this.vendorFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to Save?'),
        accept: () => {
          this.displayDialog = false;
          this.api.InsertBrand(vendor).subscribe(
            (data: any) => {
              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data });
              this.utilityService
                .LoadDropdownBrandMasters(true)
                .subscribe((res) => {});
              this.vendorList = data;
              this.reset();
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Brand Saved Succesfully',
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
      this.vendorFormGroup.markAllAsTouched();
      this.vendorFormGroup.markAsDirty();
    }
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  public updateVendor(vendor: VendorMaster) {
    // this.api.UpdateBrand(vendor).subscribe((data) => {
    //   this.vendorList = data;
    //   this.reset();
    // });

    if (this.vendorFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to Update?'),
        accept: () => {
          this.displayDialog = false;
          this.api.UpdateBrand(vendor).subscribe(
            (data: any) => {
              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data });
              this.utilityService
                .LoadDropdownBrandMasters(true)
                .subscribe((res) => {});
              this.vendorList = data;
              this.reset();
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Brand Saved Succesfully',
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
      this.vendorFormGroup.markAllAsTouched();
      this.vendorFormGroup.markAsDirty();
    }
  }

  // public deleteVendor(vendor: VendorMaster) {
  //   this.btnlabel = 'Submit';
  //   this.api.DeleteBrand(vendor).subscribe((data) => {
  //     this.vendorList = data;
  //     this.reset();
  //   });
  // }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.vendorMasterVendorId != null) {
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
          this.delete(rowData);
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
export const columnList = (component: BrandComponent) => [
  {
    data: 'vendorMasterVendorId',
    type: 'text',
    label: 'Country code',
  },
  {
    data: 'vendorMasterVendorName',
    type: 'text',
    label: 'Brand Name',
  },
  {
    data: 'vendorMasterVendorStatus',
    type: 'checkbox',
    label: 'In Active',
  },

  {
    data: null,
    label: 'Action',
    toolTip: 'Action',
    renderer: component.buttonRenderer?.bind(component),
  },
];
