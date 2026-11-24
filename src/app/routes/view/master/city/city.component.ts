import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { CityMaster } from 'src/app/routes/domain/Masters/CityMaster';
import { CountryMaster } from 'src/app/routes/domain/Masters/CountryMaster';
import { MenuItem } from 'primeng/api/menuitem';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
})
export class CityComponent implements OnInit {
  ScreenId: number;
  Permission: any;

  selectedCountry: any;

  title: string;
  breadcumbmodel: MenuItem[];
  cityFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  dataForDelete: any;
  btnFlag: ButtonFlag;
  operation: { insert: boolean; update: boolean; delete: boolean } = {
    insert: false,
    update: false,
    delete: false,
  };
  displayedColumns: string[] = ['code', 'CountryName', 'CityName', 'action'];
  cityList: CityMaster[] = [];
  countryListNew: SelectItem[];
  countryList: CountryMaster[] = [];
  displayDialog = false;
  hotid = 'city_HotEntry';
  licensekey: string;
  city_entryDataset = [];
  city_entry: Handsontable.GridSettings;
  private hotRegisterer = new HotTableRegisterer();

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private api: MasterApiService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private ngZone: NgZone,

    private translate: TranslateService
  ) {}
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'City') {
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
      // this.getCountryList();
    });
    this.cityFormGroup = this.fb.group({
      cityMasterCityId: [0],
      cityMasterCityCountryId: [
        { value: -1, disabled: true },
        [Validators.required],
      ],
      cityMasterCityName: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      cityMasterCityDeleted: [null],
      cityMasterCityStatus: [null],
      cityCountryID: [0],
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: false,
      delete: false,
    };
    this.initilizeControlBudget();
  }
  initilizeControlBudget() {
    this.city_entry = this.utilityService.getTableConfig(
      columnList(this),
      [0, 2]
    );

    this.getCountryList();
  }

  public getCountryList() {
    this.api.GetAllCountry().subscribe((data) => {
      this.countryList = data;

      this.countryListNew = data.map((item) => ({
        label: item.countryMasterCountryName,
        value: item.countryMasterCountryId,
      }));
      this.countryListNew.push({ label: 'Select', value: -1 });

      this.getCityList();
    });
  }

  public getCityList() {
    this.api.GetAllCity().subscribe((data) => {
      this.cityList = data;
      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
    });
  }

  saveCity() {
    this.cityFormGroup.markAllAsTouched();
    if (this.operation.insert) {
      this.insertCity(this.cityFormGroup.value);
    } else if (this.operation.update) {
      this.updateCity(this.cityFormGroup.value);
    } else {
      //this.toast.error('Country Master Save Failed');
    }
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: false,
      delete: false,
    };
    this.cityFormGroup.reset();
  }
  updateValues(data: CityMaster) {
    this.dataForDelete = data;
    this.displayDialog = true;
    this.operation = { insert: false, update: true, delete: false };
    this.cityFormGroup.patchValue(data);
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: false,
      delete: true,
    };
    this.cityFormGroup.enable();
  }
  removeCity(data: CityMaster) {
    this.operation = { insert: true, update: false, delete: false };
    this.deleteCity(data);
  }
  public get f() {
    return this.cityFormGroup.controls;
  }
  public reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.cityFormGroup.reset();
    this.f.cityMasterCityCountryId.setValue(-1);
  }

  public insertCity(city: CityMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Save?'),
      accept: () => {
        this.displayDialog = false;
        this.api.InsertCity(city).subscribe(
          (data) => {
            this.cityList = data;
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.reset();
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: ' Saved Succesfully',
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

  public updateCity(city: CityMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Update?'),
      accept: () => {
        this.displayDialog = false;
        this.api.UpdateCity(city).subscribe(
          (data) => {
            this.cityList = data;
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.reset();
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Updated Succesfully',
            });
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
  }

  public deleteCity(city: CityMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.api.DeleteCity(city).subscribe(
          (data) => {
            this.cityList = data;
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.reset();
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Deleted Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: this.translate.instant('Failed'),
            });
          }
        );
      },
    });
  }
  edit() {
    this.cityFormGroup.enable();
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
    this.cityFormGroup.reset();
    this.cityFormGroup.enable();
    this.displayDialog = true;

    this.cityFormGroup.updateValueAndValidity();

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
  }
  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      //message: 'Do you want to delete Location?',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.api.DeleteCity(this.dataForDelete).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'City Deleted Succesfully',
            });
            //this.new();
            this.cityList = data;
            this.cityFormGroup.disable();
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
    this.cityFormGroup.reset();
  }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.cityMasterCityId != null) {
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
          this.deleteCity(rowData);
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
export const columnList = (component: CityComponent) => [
  {
    data: 'cityMasterCityCountryId',
    type: 'text',
    label: 'Country code',
  },
  {
    data: 'countryName',
    type: 'text',
    label: 'Country Name',
  },
  {
    data: 'cityMasterCityId',
    type: 'text',
    label: 'City Code',
  },
  {
    data: 'cityMasterCityName',
    type: 'text',
    label: 'City Name',
  },
  {
    data: null,
    label: 'Action',
    toolTip: 'Action',
    renderer: component.buttonRenderer?.bind(component),
  },
];
