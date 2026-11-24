import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { CurrencyMaster } from 'src/app/routes/domain/Masters/CurrencyMaster';
import { MenuItem } from 'primeng/api/menuitem';
import { map } from 'rxjs/operators';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';

// for thermal printing
// import { PrintService, UsbDriver, WebPrintDriver } from 'ngx-print';
// import { PrintDriver } from 'ngx-print';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
})
export class CurrencyComponent implements OnInit {
  ScreenId: number;
  Permission: any;

  title: string;
  breadcumbmodel: MenuItem[];
  currencyFormGroup: FormGroup;
  btnFlag: ButtonFlag;
  dataForDelete: any;
  // operation: { insert: boolean, update: boolean, delete: boolean } = { insert: false, update: false, delete: false };
  displayedColumns: string[] = [
    'code',
    'name',
    'rate',
    'symbol',
    'denomination',
    'short_name',
    'action',
  ];
  currencyList: CurrencyMaster[] = [];
  displayDialog = false;
  hotid = 'salesMan_HotEntry';
  licensekey: string;
  currency_entryDataset = [];
  currency_entry: Handsontable.GridSettings;
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
    this.getCurrencyList();
    // Thermal printing
  }
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Currency') {
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
    this.currencyFormGroup = this.fb.group({
      currencyMasterCurrencyId: [0],
      currencyMasterCurrencyName: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      currencyMasterCurrencySymbol: [{ value: '', disabled: true }],
      currencyMasterCurrencyRate: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      currencyMasterCurrencyRemarks: [{ value: '', disabled: true }],
      currencyMasterCurrencyType: [{ value: '', disabled: true }],
      currencyMasterCurrencyUserId: [{ value: '', disabled: true }],
      currencyMasterCurrencyStatus: [{ value: '', disabled: true }],
      currencyMasterCurrencyShortName: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      currencyMasterCurrencyDenomination: [
        { value: '', disabled: true },
        [Validators.required],
      ],
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
    this.initilizeControlCurrency();
  }
  initilizeControlCurrency() {
    this.currency_entry = this.utilityService.getTableConfig(columnList(this), [
      0,
    ]);

    this.getCurrencyList();
  }

  public getCurrencyList() {
    this.api.GetAllCurrency().subscribe((data) => {
      this.currencyList = data;

      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
    });
  }

  edit() {
    this.currencyFormGroup.enable();
    this.displayDialog = true;
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
    this.currencyFormGroup.reset();
    this.currencyFormGroup.enable();
    this.displayDialog = true;
    //this.f.purchaseQuotationNo.clearValidators();
    //this.f.purchaseQuotationDate.setValue(new Date());
    this.currencyFormGroup.updateValueAndValidity();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
  }
  saveCurrency() {
    this.currencyFormGroup.markAsDirty();
    this.currencyFormGroup.markAllAsTouched();
    if (this.currencyFormGroup.valid) {
      if (this.btnFlag.save) {
        this.insertCurrency(this.currencyFormGroup.value);
      } else {
        this.updateCurrency(this.currencyFormGroup.value);
      }
    }
  }
  updateValues(data: CurrencyMaster) {
    this.currencyFormGroup.patchValue(data);
    this.displayDialog = true;
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: true,
    };
    this.currencyFormGroup.enable();
  }
  removeCurrency(data: CurrencyMaster) {
    this.deleteCurrency(data);
  }
  public get f() {
    return this.currencyFormGroup.controls;
  }
  public reset() {
    this.currencyFormGroup.reset();
  }

  public insertCurrency(currency: CurrencyMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Save?'),
      accept: () => {
        this.displayDialog = false;
        this.api.InsertCurrency(currency).subscribe(
          (data) => {
            this.currencyList = data;
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
              new: true,
            };
            this.utilityService
              .LoadDropdowCurrencyMaster(true)
              .subscribe((res) => {});
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Saved Succesfully',
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

  public updateCurrency(currency: CurrencyMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Update?'),
      accept: () => {
        this.displayDialog = false;
        this.api.UpdateCurrency(currency).subscribe(
          (data) => {
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.currencyList = data;
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
              new: true,
            };
            this.utilityService
              .LoadDropdowCurrencyMaster(true)
              .subscribe((res) => {});
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: ' Updated Succesfully',
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

  public deleteCurrency(currency: CurrencyMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.displayDialog = false;
        this.api.DeleteCurrency(currency).subscribe(
          (data) => {
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.currencyList = data;
            this.utilityService
              .LoadDropdowCurrencyMaster(true)
              .subscribe((res) => {});
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
              detail: this.translate.instant('Delete Failed'),
            });
          }
        );
      },
    });
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      //message: 'Do you want to delete Location?',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.displayDialog = false;
        this.api.DeleteCurrency(this.currencyFormGroup.value).subscribe(
          (data) => {
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.utilityService
              .LoadDropdowCurrencyMaster(true)
              .subscribe((res) => {});
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Currency Deleted Succesfully',
            });
            this.new();
            this.currencyList = data;
            this.currencyFormGroup.disable();
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
  }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.currencyMasterCurrencyId != null) {
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
          this.deleteCurrency(rowData);
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
export const columnList = (component: CurrencyComponent) => [
  {
    data: 'currencyMasterCurrencyId',
    type: 'text',
    label: 'Code',
    toolTip: 'Currency Code',
  },
  {
    data: 'currencyMasterCurrencyName',
    type: 'text',
    label: 'Currency Name',
    toolTip: 'Currency Name',
  },
  {
    data: 'currencyMasterCurrencyRate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Currency Rate',
  },
  {
    data: 'currencyMasterCurrencySymbol',
    type: 'text',
    label: 'Symbol',
    toolTip: 'Currency Symbol',
  },
  {
    data: 'currencyMasterCurrencyDenomination',
    type: 'text',
    label: 'Denomination',
    toolTip: 'Currency Denomination',
  },
  {
    data: 'currencyMasterCurrencyShortName',
    type: 'text',
    label: 'Short Name',
    toolTip: 'Currency Short Name',
  },
  {
    data: null,
    label: 'Action',
    toolTip: 'Action',
    renderer: component.buttonRenderer?.bind(component),
  },
];
