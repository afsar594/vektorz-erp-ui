import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import { ToastrService } from 'ngx-toastr';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
//import { CountryMaster } from 'src/app/routes/domain';
import { CountryMaster } from 'src/app/routes/domain/Masters/CountryMaster';
import { MenuItem } from 'primeng/api/menuitem';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit {
  title: string;
  breadcumbmodel: MenuItem[];
  //title: string;
  countryFormGroup: FormGroup;
  ScreenId: number;
  Permission: any;
  dataForDelete: any;
  btnFlag: ButtonFlag;
  btnlabel: string = 'Submit';
  // operation: { insert: boolean, update: boolean, delete: boolean } = { insert: false, update: false, delete: false };
  displayedColumns: string[] = ['code', 'name', 'action'];
  countryList: CountryMaster[] = [];
  displayDialog = false;
  hotid = 'city_HotEntry';
  licensekey: string;
  country_entryDataset = [];
  country_entry: Handsontable.GridSettings;
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
  ) {}
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Country') {
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
    this.countryFormGroup = this.fb.group({
      countryMasterCountryId: [0],
      countryMasterCountryName: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      countryMasterCountryISDCode: [null],
      countryMasterCountryUserID: [null],
      countryMasterCountryStatus: [null],
      countryMasterCountryAmount: [null],
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
    this.initilizeControlCountry();
  }
  initilizeControlCountry() {
    this.country_entry = this.utilityService.getTableConfig(columnList(this), [
      0,
    ]);

    this.getCountryList();
  }

  public getCountryList() {
    this.api.GetAllCountry().subscribe((data) => {
      this.countryList = data;
      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
    });
  }

  public get f() {
    return this.countryFormGroup.controls;
  }

  saveCountry() {
    this.countryFormGroup.markAllAsTouched();
    if (this.countryFormGroup.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Fill the Mendatory Fields',
      });
      return false;
    } else {
      if (this.btnFlag.save) {
        this.insertCountry(this.countryFormGroup.value);
      } else {
        this.updateCountry(this.countryFormGroup.value);
      }
    }
  }
  updateValues(data: CountryMaster) {
    this.dataForDelete = data;
    this.countryFormGroup.patchValue(data);
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: true,
      delete: false,
      new: true,
    };
    this.displayDialog = true;
    this.countryFormGroup.enable();
  }
  // removeCountry(data: CountryMaster) {
  //   this.operation = { insert: true, update: false, delete: false };
  //   this.deleteCountry(data);
  // }
  public get() {
    return this.countryFormGroup.controls;
  }
  public reset() {
    this.countryFormGroup.reset();
  }

  public insertCountry(country: CountryMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Save?'),
      accept: () => {
        this.displayDialog = false;
        this.api.InsertCountry(country).subscribe(
          (data) => {
            this.countryList = data;
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
              new: true,
            };
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Country Saved Succesfully',
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

  public updateCountry(country: CountryMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Update?'),
      accept: () => {
        this.displayDialog = false;
        this.api.UpdateCountry(country).subscribe(
          (data) => {
            this.countryList = data;
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
              new: true,
            };
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Country Updated Succesfully',
            });
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

  // public deleteCountry(country: CountryMaster) {
  //   this.btnlabel = 'Submit';
  //   this.confirmation.confirm({
  //     key: 'confirm-key',
  //     message: this.translate.instant('Do you want to Delete?'),
  //     accept: () => {
  //       this.api.DeleteCountry(country).subscribe((data) => {
  //         this.countryList = data;
  //         this.reset();
  //         this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Deleted Succesfully' });

  //       }, (err) => {
  //         this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Delete Failed') });
  //       });
  //     }
  //   });

  // }

  edit() {
    this.countryFormGroup.enable();
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
    this.countryFormGroup.reset();
    this.countryFormGroup.enable();
    this.displayDialog = true;
    this.countryFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
  }
  deleteCountry(data) {
    this.confirmation.confirm({
      key: 'confirm-key',
      //message: 'Do you want to delete Location?',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.api.DeleteCountry(data).subscribe(
          (data) => {
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Country Deleted Succesfully',
            });
            //this.new();
            this.countryList = data;
            this.countryFormGroup.disable();
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
    this.countryFormGroup.reset();
  }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.countryMasterCountryId != null) {
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
          this.deleteCountry(rowData);
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
export const columnList = (component: CountryComponent) => [
  {
    data: 'countryMasterCountryId',
    type: 'text',
    label: 'Country code',
  },
  {
    data: 'countryMasterCountryName',
    type: 'text',
    label: 'Country Name',
  },

  {
    data: null,
    label: 'Action',
    toolTip: 'Action',
    renderer: component.buttonRenderer?.bind(component),
  },
];
