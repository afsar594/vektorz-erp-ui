import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { CityMaster, CountryMaster } from 'src/app/routes/domain';
import { ConfirmationService, MessageService, SelectItem } from 'primeng';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-station-master',
  templateUrl: './station-master.component.html',
  styleUrls: ['./station-master.component.scss'],
})
export class StationMasterComponent implements OnInit {
  title: string = 'Station Master ';
  subtitle: string;
  index: number = 0;
  url: string | ArrayBuffer;
  handleChange(e) {
    this.index = e.index;
  }
  countryArray: CountryMaster[] = [];
  countryList: SelectItem[];
  countryArry: string[] = [];

  cityArray: CityMaster[] = [];
  citylistNew: SelectItem[] = [];
  cityList: CityMaster[];
  cityarry: string[] = [];

  elementReference: ElementRef;
  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  btnFlag: ButtonFlag;

  stationMasterForm: FormGroup;
  logo: File;
  logoUrl: string;
  logoimageUrl: string;
  logoTypes: SelectItem[];
  sign: File;
  signUrl: string;
  signimageUrl: string;

  seal: File;
  sealUrl: string;
  sealimageUrl: string;
  constructor(
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private masterapi: MasterApiService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.getAllCity();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.getAllCountry();
    this.logoTypes = [
      { label: '---Select---', value: '' },
      { label: 'Square', value: 'Square' },
      { label: 'Rectangular', value: 'Rectangular' },
    ];
    this.getAllStationMaster();
  }

  initForm(): void {
    this.stationMasterForm = new FormGroup({
      stationMasterCode: new FormControl(null),
      stationMasterStationName: new FormControl(null, Validators.required),
      stationMasterAddress: new FormControl(null, Validators.required),
      stationMasterCity: new FormControl(null, Validators.required),
      stationMasterPostOffice: new FormControl(null, Validators.required),
      stationMasterTele1: new FormControl(null, Validators.required),
      stationMasterTele2: new FormControl(null),
      stationMasterFax: new FormControl(null),
      stationMasterEmail: new FormControl(null, Validators.email),
      stationMasterWebSite: new FormControl(null),
      stationMasterCountry: new FormControl(null, Validators.required),
      stationMasterLogoPath: new FormControl(null),
      stationMasterSignPath: new FormControl(null),
      stationMasterLogoImg: new FormControl(null),
      logotype: new FormControl(null),
      stationMasterSignImg: new FormControl(null),
      stationMasterSealImg: new FormControl(null),
      stationMasterVatNo: new FormControl(null),
      stationMasterDelStatus: new FormControl(null),
      bankName: new FormControl(null),
      accountName: new FormControl(null),
      accountNo: new FormControl(null),
      iban: new FormControl(null),
      swiftCode: new FormControl(null),
      bankBranch: new FormControl(null),
      bankCurrency: new FormControl(null),
    });
  }

  onSubmit(): void {
    let data = {
      stationMasterCode: this.stationMasterForm.value.stationMasterCode,
      stationMasterStationName:
        this.stationMasterForm.value.stationMasterStationName,
      stationMasterAddress: this.stationMasterForm.value.stationMasterAddress,
      stationMasterCity: `${this.stationMasterForm.value.stationMasterCity}`,
      stationMasterPostOffice:
        this.stationMasterForm.value.stationMasterPostOffice,
      stationMasterTele1: this.stationMasterForm.value.stationMasterTele1,
      stationMasterTele2: this.stationMasterForm.value.stationMasterTele2,
      stationMasterFax: this.stationMasterForm.value.stationMasterFax,
      stationMasterEmail: this.stationMasterForm.value.stationMasterEmail,
      stationMasterWebSite: this.stationMasterForm.value.stationMasterWebSite,
      stationMasterCountry: `${this.stationMasterForm.value.stationMasterCountry}`,
      stationMasterLogoPath: this.stationMasterForm.value.stationMasterLogoPath,
      stationMasterSignPath: this.stationMasterForm.value.stationMasterSignPath,
      logotype: this.stationMasterForm.value.logotype,
      stationMasterLogoImg:
        this.stationMasterForm.value.stationMasterLogoImg?.split(',')[1],

      stationMasterSignImg: this.stationMasterForm.value.stationMasterSignImg,
      stationMasterSealImg: this.stationMasterForm.value.stationMasterSealImg,
      stationMasterVatNo: this.stationMasterForm.value.stationMasterVatNo,
      stationMasterDelStatus:
        this.stationMasterForm.value.stationMasterDelStatus,
      bankName: this.stationMasterForm.value.bankName,
      accountName: this.stationMasterForm.value.accountName,
      accountNo: this.stationMasterForm.value.accountNo,
      iban: this.stationMasterForm.value.iban,
      swiftCode: this.stationMasterForm.value.swiftCode,
      bankBranch: this.stationMasterForm.value.bankBranch,
      bankCurrency: this.stationMasterForm.value.bankCurrency,
    };

    const formData: StationMaster = data;

    const set = this.btnFlag.save ? 'save' : 'update existing';
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant(`Do you want to ${set} Record?`),
      accept: () => {
        if (this.btnFlag.save) {
          this.save(formData);
        } else {
          this.update(formData);
        }
      },
    });
  }
  update(formData: any) {
    this.masterapi.UpdateStationMaster(formData).subscribe(
      (res) => {
        // this.updateValue(res)
        this.getAllStationMaster();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Updated Successfully',
        });
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Update Failed'),
        });
      },
    );
  }
  save(formData: any) {
    this.masterapi.InsterStationMaster(formData).subscribe(
      (res) => {
        // this.updateValue(res)
        this.getAllStationMaster();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Updated Successfully',
        });
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Update Failed'),
        });
      },
    );
  }
  updateValue(stationMaster) {
    const sampleData = {
      stationMasterCode: stationMaster?.stationMasterCode,
      stationMasterStationName: stationMaster?.stationMasterStationName,
      stationMasterAddress: stationMaster?.stationMasterAddress,
      logotype: stationMaster?.logotype,
      stationMasterPostOffice: stationMaster?.stationMasterPostOffice,
      stationMasterTele1: stationMaster?.stationMasterTele1,
      stationMasterTele2: stationMaster?.stationMasterTele2,
      stationMasterFax: stationMaster?.stationMasterFax,
      stationMasterEmail: stationMaster?.stationMasterEmail,
      stationMasterWebSite: stationMaster?.stationMasterWebSite,
      stationMasterCountry: Number(stationMaster?.stationMasterCountry),
      stationMasterCity: Number(stationMaster?.stationMasterCity),
      stationMasterLogoPath: stationMaster?.stationMasterLogoPath,
      stationMasterSignPath: stationMaster?.stationMasterSignPath,
      stationMasterLogoImg:
        'data:image/png;base64,' + stationMaster?.stationMasterLogoImg,
      stationMasterSignImg: stationMaster?.stationMasterSignImg,
      stationMasterSealImg: stationMaster?.stationMasterSealImg,
      stationMasterVatNo: stationMaster?.stationMasterVatNo,
      stationMasterDelStatus: stationMaster?.stationMasterDelStatus,
      bankName: stationMaster?.bankName,
      accountName: stationMaster?.accountName,
      accountNo: stationMaster?.accountNo,
      iban: stationMaster?.iban,
      swiftCode: stationMaster?.swiftCode,
      bankBranch: stationMaster?.bankBranch,
      bankCurrency: stationMaster?.bankCurrency,
    };

    // Patch values into the form

    this.stationMasterForm.patchValue(sampleData);
    this.stationMasterForm.disable();
  }

  edit() {
    this.stationMasterForm.enable();
  }

  cancel() {
    this.stationMasterForm.reset();
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  getAllCountry() {
    this.masterapi.GetAllCountry().subscribe((k) => {
      this.countryList = k?.map((kl) => ({
        label: kl.countryMasterCountryName,
        value: kl.countryMasterCountryId,
      }));
      this.countryList.unshift({ label: '--Select--', value: -1 });
      this.countryArry = k?.map((ar) => ar.countryMasterCountryName.trim());
      const matchingCountry = this.countryList?.find(
        (country) =>
          country?.label === this.stationmasterObj?.stationMasterCountry,
      );
      if (matchingCountry) {
        this.stationMasterForm
          .get('stationMasterCountry')
          .setValue(matchingCountry.value);
      } else {
      }
    });
  }

  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
      if (response.length == 0) {
        this.btnFlag = {
          edit: false,
          cancel: false,
          save: true,
          update: false,
          delete: false,
        };
      } else {
        this.btnFlag = {
          edit: true,
          cancel: false,
          save: false,
          update: true,
          delete: true,
        };
      }
      this.updateValue(this.stationmasterObj);
    });
  }

  public getAllCity() {
    this.masterapi.GetAllCity().subscribe((data) => {
      this.cityList = data;
      this.citylistNew = data?.map((item) => ({
        label: item.cityMasterCityName,
        value: item.cityMasterCityId,
      }));
      this.citylistNew.unshift({ label: '--Select--', value: -1 });

      const matchingCity = this.citylistNew?.find(
        (city) => city?.label === this.stationmasterObj?.stationMasterCountry,
      );
      if (matchingCity) {
        this.stationMasterForm
          .get('StationMasterCity')
          .setValue(matchingCity.value);
      } else {
        console.log('No matching city found');
      }
    });
  }

  onCountryChange(event) {
    console.log(event);
    this.citylistNew = this.cityList
      .filter((k) => k.cityMasterCityCountryId == Number(event.value))
      ?.map((item) => ({
        label: item.cityMasterCityName,
        value: item.cityMasterCityId,
      }));
    this.citylistNew.unshift({ label: 'Select', value: -1 });
  }

  onLogoSelected(event: any) {
    this.logo = event.target.files[0];
    this.logoUrl = this.logo ? URL.createObjectURL(this.logo) : null; // Get temporary URL for preview
    this.displaySelectedImage(this.logo, 'logo');
    this.stationMasterForm.get('stationMasterLogoPath').setValue(this.logoUrl);
  }

  onSignSelected(event: any) {
    this.sign = event.target.files[0];
    this.signUrl = this.sign ? URL.createObjectURL(this.sign) : null; // Get temporary URL for preview
    this.displaySelectedImage(this.sign, 'sign');
    this.stationMasterForm.get('stationMasterSignPath').setValue(this.signUrl);
  }

  onSealSelected(event: any) {
    this.seal = event.target.files[0];
    this.sealUrl = this.seal ? URL.createObjectURL(this.seal) : null; // Get temporary URL for preview
    this.displaySelectedImage(this.seal, 'seal');
    this.stationMasterForm.get('stationMasterSignPath').setValue(this.sealUrl);
  }
  onSelectFile($event) {
    if ($event.target.files && $event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL($event.target.files[0]); // read file as data url
      reader.onload = (event) => {
        this.url = event.target.result;
        this.stationMasterForm.controls.stationMasterLogoImg.setValue(
          event.target.result,
        );
      };
    }
  }

  displaySelectedImage(file: File, type: string) {
    if (file) {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        switch (type) {
          case 'logo':
            this.logoUrl = event.target.result;
            break;
          case 'sign':
            this.signUrl = event.target.result;
            break;
          case 'seal':
            this.sealUrl = event.target.result;
            break;
          default:
            break;
        }
      };

      reader.readAsDataURL(file);
    }
  }
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
