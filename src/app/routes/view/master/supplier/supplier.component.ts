import { CurrencyMaster } from './../../../domain/Masters/CurrencyMaster';
import { CityMaster } from './../../../domain/Masters/CityMaster';
import { CountryMaster } from './../../../domain/Masters/CountryMaster';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import { map } from 'rxjs/operators';
import { SupplierMaster } from 'src/app/routes/domain/Masters/SupplierMaster';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { log } from 'console';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss'],
})
export class SupplierComponent implements OnInit {
  index: number = 0;
  displayMaximizable: Boolean = false;
  confirmDropDatabaseDialogVisible: Boolean = false;
  ScreenId: number;
  Permission: any;
  handleChange(e) {
    this.index = e.index;
  }

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationarry: string[] = [];

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,
    private translate: TranslateService,
    private api: MasterApiService,
    private utilityService: UtilityService,
  ) { }
  title: string;
  breadcumbmodel: MenuItem[];
  supplierFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  operation: { insert: boolean; update: boolean; delete: boolean } = {
    insert: false,
    update: false,
    delete: false,
  };
  displayedColumns: string[] = ['code', 'name', 'Mobile', 'Status', 'action'];

  SupplierList: SupplierMaster[] = [];

  countryListNew: SelectItem[] = [];
  citylistNew: SelectItem[] = [];
  currencylistNew: SelectItem[];

  countryList: CountryMaster[];
  cityList: CityMaster[];
  currencyList: CurrencyMaster[];
  cols: any[];

  DefLocation: string;
  DefLocationCheck: string;

  DefCurrency: string;
  DefCurCheck: string;
  defType: string;
  detTypeCheck: string;

  ngOnInit(): void {


    console.log("this is the supplier component");
    

    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Supplier Master') {
          this.Permission = {
            Allow: res?.workGroupPermissionsUallow,
            Add: res?.workGroupPermissionsUadd,
            Delete: res?.workGroupPermissionsUdelete,
            Edit: res?.workGroupPermissionsUedit,
            Print: res?.workGroupPermissionsUprint,
            View: res?.workGroupPermissionsUview,
          };
        }
        console.log('rights', rights);
      });
    });
    this.operation.insert = true;
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.api.GetSupplierLoadDropdown().subscribe((m) => {
        this.countryList = m.resultSet.countryMasters;
        this.countryListNew = m.resultSet.countryMasters?.map((item) => ({
          label: item.countryMasterCountryName,
          value: item.countryMasterCountryId,
        }));
        this.countryListNew.unshift({ label: 'Select', value: -1 });
        this.cityList = m.resultSet.cityMasters;
        this.citylistNew = m.resultSet.cityMasters?.map((item) => ({
          label: item.cityMasterCityName,
          value: item.cityMasterCityId,
        }));
        this.citylistNew.unshift({ label: 'Select', value: -1 });
        this.currencyList = m.resultSet.currencyMasters;
        this.currencylistNew = m.resultSet.currencyMasters?.map((item) => ({
          label: item.currencyMasterCurrencyName,
          value: item.currencyMasterCurrencyId,
        }));
        this.currencylistNew.unshift({ label: 'Select', value: -1 });
        this.locationarry = m.resultSet.locationMaster;
        this.locationList = m.resultSet.locationMaster?.map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
        this.locationList.unshift({ label: '--Select--', value: -1 });
      });
    });
    this.cols = [
      { field: 'suppliersMasterSupplierCode', header: 'Code' },
      { field: 'suppliersMasterSupplierName', header: 'Name' },
      { field: 'suppliersMasterSupplierMobile', header: 'Mobile' },
      { field: 'suppliersMasterSupplierStatus', header: 'Status' },
      { field: 'action', header: 'Action' },
    ];

    this.supplierFormGroup = this.fb.group({
      suppliersMasterSupplierId: [0],
      suppliersMasterSupplierName: [null, [Validators.required]],
      suppliersMasterSupplierContactPerson: [null],
      suppliersMasterSupplierCountryId: [null],
      suppliersMasterSupplierCityId: [null],
      suppliersMasterSupplierPoBox: [null],
      suppliersMasterSupplierTel1: [null],
      suppliersMasterSupplierTel2: [null],
      suppliersMasterSupplierFax: [null],
      suppliersMasterSupplierMobile: [null],
      suppliersMasterSupplierEmail: [null],
      suppliersMasterSupplierWebSite: [null],
      suppliersMasterSupplierLocationId: [null, [Validators.required]],
      suppliersMasterSupplierRemarks: [null],
      suppliersMasterSupplierReffAcNo: [null],
      suppliersMasterSupplierType: [null],
      suppliersMasterSupplierUserId: [null],
      suppliersMasterSupplierCurrencyId: [null],
      suppliersMasterSupplierConsup: [null],
      suppliersMasterSupplierCrl: [null],
      suppliersMasterSupplierAddress: [null],
      suppliersMasterSupplierWhatsAppNo: [null],
      SuppliersMasterSupplierStatus: [false],
      suppliersMasterSupplierDeleteStatus: [null],
      suppliersMasterSupplierStatusValue: [null],
      suppliersMasterSupplierPaymentTerms: [null],
      suppliersMasterSupplierCreditDays: [null],
      suppliersMasterSupplierCreditLimit: [null],
      suppliersMasterSupplierVatNo: [null],
      cityMasterCityCountryId: [],
      cityMasterCityCityId: [],
      currencyMasterCurrencyId: [],
      suppliersMasterSupplierStatus: [],
    });
    this.supplierFormGroup.disable();
  }

  new() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.supplierFormGroup.reset();
    this.supplierFormGroup.enable();
    this.GetDefaultSettings();
  }
  edit() {
    // this.operation = { insert: true, update: false, delete: false };
    // this.btnlabel = 'Submit';
    // this.supplierFormGroup.reset();
    this.supplierFormGroup.enable();
  }
  GetDefaultSettings() {
    this.api.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;
      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY',
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.suppliersMasterSupplierCurrencyId.setValue(
            Number(this.DefCurrency),
          );
        }
      }
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION',
      );

      if (DEFAULT_LOCATION != null) {
        this.DefLocationCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocationCheck !== null) {
          const splitText = this.DefLocationCheck.split('::');
          this.DefLocation = splitText[1]?.trim();
          this.f.suppliersMasterSupplierLocationId.setValue(
            Number(this.DefLocation),
          );
        }
      }
    });
  }

  getDefaultCurrency() {
    this.api
      .GetGeneralSettingbyKey('DEFAULTCURRENCY')
      .subscribe((data: any) => {
        if (data !== null) {
          this.DefCurCheck = data.result[0]?.generalSettingsTextValue;
          if (this.DefCurCheck !== null) {
            const splitText = this.DefCurCheck.split('::');
            this.DefCurrency = splitText[1].trim();
            this.f.suppliersMasterSupplierCurrencyId.setValue(
              Number(this.DefCurrency),
            );
          }
        }
      });
  }
  getDefaultLocation() {
    this.api.GetGeneralSettingbyKey('DEFAULT_LOCATION').subscribe((data) => {
      if (data !== null) {
        this.DefLocationCheck = data.result[0].generalSettingsTextValue;
        if (this.DefLocationCheck !== null) {
          const splitText = this.DefLocationCheck.split('::');
          this.DefLocation = splitText[1].trim();
          this.f.suppliersMasterSupplierLocationId.setValue(
            Number(this.DefLocation),
          );
        }
      }
    });
  }
  showMaximizableDialog() {
    this.getSupplierList();
    this.displayMaximizable = true;
  }

  public getCountryList() {
    this.api.GetAllCountry().subscribe((data) => {
      this.countryList = data;

      this.countryListNew = data.map((item) => ({
        label: item.countryMasterCountryName,
        value: item.countryMasterCountryId,
      }));
      this.countryListNew.unshift({ label: 'Select', value: -1 });
    });
  }

  getAllLocation() {
    this.api.GetAllLocation().subscribe((k) => {
      this.locationList = k?.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      // this.locationList = k?.map((kl) => ({ label: kl.locationMasterLocationName, value: kl.locationMasterLocationName }));

      this.locationList.unshift({ label: '--Select--', value: -1 });
      this.locationarry = k?.map((ar) => ar.locationMasterLocationName.trim());
    });
  }

  public getCityList() {
    this.api.GetAllCity().subscribe((data) => {
      this.cityList = data;
      this.citylistNew = data.map((item) => ({
        label: item.cityMasterCityName,
        value: item.cityMasterCityId,
      }));
      this.citylistNew.unshift({ label: 'Select', value: -1 });
    });
  }

  public getCurrencyList() {
    this.api.GetAllCurrency().subscribe((data) => {
      this.currencyList = data;
      this.currencylistNew = data.map((item) => ({
        label: item.currencyMasterCurrencyName,
        value: item.currencyMasterCurrencyId,
      }));
      this.currencylistNew.unshift({ label: 'Select', value: -1 });
    });
  }

  public getSupplierList() {
    this.api.GetAllSupplier().subscribe((data) => {
      this.SupplierList = data;
    });
  }

  saveSupplier() {
    this.supplierFormGroup.markAsDirty();
    this.supplierFormGroup.markAllAsTouched();
    if (this.supplierFormGroup.valid) {
      if (this.operation.insert) {
        this.insertSupplier(this.supplierFormGroup.value);
      } else if (this.operation.update) {
        this.updateSupplier(this.supplierFormGroup.value);
      }
    } else return;
  }

  updateValues(id) {
    this.GetSavedsuppliers(id);
    this.operation = { insert: false, update: true, delete: false };
    this.btnlabel = 'Update';
    this.displayMaximizable = false;
  }

  removeSupplier() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.deleteSupplier(this.supplierFormGroup.value);
    this.displayMaximizable = false;
  }

  public get f() {
    return this.supplierFormGroup.controls;
  }

  public reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.supplierFormGroup.reset();
  }

public insertSupplier(Supplier: SupplierMaster) {
    this.supplierFormGroup.markAllAsTouched();
    if (this.supplierFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save?'),
        accept: () => {
          this.api.InsertSupplier(Supplier).subscribe(
            (data: any) => {
              if (data.valid) {
                this.utilityService
                  .LoadDropdownSuppliersMaster(true)
                  .subscribe((res) => { });
                this.supplierFormGroup.patchValue(data.result);
                this.supplierFormGroup.disable();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
              } else {
                // Changed severity from 'success' to 'error'
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: data.message,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Save Failed'),
              });
            },
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.supplierFormGroup.markAllAsTouched();
      this.supplierFormGroup.markAsDirty();
    }
  }

  GetSavedsuppliers(id) {
    this.api.GetAllSupplierById(id).subscribe(
      (data) => {
        if (data.result !== null) {
          this.supplierFormGroup.patchValue(data.result);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Supplier not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
      },
    );
  }

  public updateSupplier(Supplier: SupplierMaster) {
    if (this.supplierFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to Update?'),
        accept: () => {
          this.api.UpdateSupplier(Supplier).subscribe(
            (data: any) => {
              if (data.valid) {
                this.utilityService
                  .LoadDropdownSuppliersMaster(true)
                  .subscribe((res) => { });
                this.supplierFormGroup.patchValue(data.result);
                this.supplierFormGroup.disable();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
              } else {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Update Failed'),
              });
            },
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.supplierFormGroup.markAllAsTouched();
      this.supplierFormGroup.markAsDirty();
    }
  }

  public deleteSupplier(Supplier: SupplierMaster) {
    this.btnlabel = 'Submit';
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Delete Supplier'),
      accept: () => {
        this.api.DeleteSupplier(Supplier).subscribe(
          (data) => {
            // this.SupplierList = data;
            this.utilityService
              .LoadDropdownSuppliersMaster(true)
              .subscribe((res) => { });
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: ' Supplier Deleted Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: this.translate.instant('Deletion Failed'),
            });
          },
        );
      },
    });
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  onCountryChange(event) {
    // console.log(event);
    this.citylistNew = this.cityList
      ?.filter((k) => k.cityMasterCityCountryId == Number(event.value))
      .map((item) => ({
        label: item.cityMasterCityName,
        value: item.cityMasterCityId,
      }));
    this.citylistNew.unshift({ label: 'Select', value: -1 });
  }
}
