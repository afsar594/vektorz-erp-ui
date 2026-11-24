import { SalesManMaster } from './../../../domain/Masters/SalesManMaster';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import { ConfirmationService, MessageService } from 'primeng';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';

@Component({
  selector: 'app-salesman',
  templateUrl: './salesman.component.html',
  styleUrls: ['./salesman.component.scss'],
})
export class SalesmanComponent implements OnInit {
  ScreenId: number;
  Permission: any;
  displayDialog = false;
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private api: MasterApiService,
    private permission: PermissionsService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private utilityService: UtilityService,
    private ngZone: NgZone
  ) {}
  title: string;
  salesmanFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  dataForDelete: any;
  operation: { insert: boolean; update: boolean; delete: boolean } = {
    insert: false,
    update: false,
    delete: false,
  };
  displayedColumns: string[] = [
    'salesman_code',
    'salesman_name',
    'contact_number',
    'action',
  ];
  salesmanList: SalesManMaster[] = [];
  breadcumbmodel: MenuItem[];

  hotid = 'salesMan_HotEntry';
  licensekey: string;
  salesMan_entryDataset = [];
  salesMan_entry: Handsontable.GridSettings;
  private hotRegisterer = new HotTableRegisterer();

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Salesman') {
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
    this.salesmanFormGroup = this.fb.group({
      salesManMasterSalesManId: [0],
      salesManMasterSalesManName: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      salesManMasterSalesManDeleted: [{ value: null, disabled: true }],
      salesManMasterSalesManContactNo: [{ value: null, disabled: true }],
      salesManMasterSalesManLocationId: [{ value: null, disabled: true }],
    });
    this.initilizeControlSaleman();
  }
  initilizeControlSaleman() {
    this.salesMan_entry = this.utilityService.getTableConfig(
      columnList(this),
      [0, 3]
    );

    this.getSalesmanList();
  }
  public getSalesmanList() {
    this.api.GetAllSalesman().subscribe((data) => {
      this.salesmanList = data;
      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
    });
  }

  public get f() {
    return this.salesmanFormGroup.controls;
  }

  public reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.salesmanFormGroup.reset();
  }

  public insertSalesman() {
    if (this.salesmanFormGroup.valid) {
      this.displayDialog = false;
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Save this Record?',
        accept: () => {
          this.api.InsertSalesman(this.salesmanFormGroup.value).subscribe({
            next: (data: any) => {
              this.utilityService
                .LoadSaleManDropdown(true)
                .subscribe((res) => {});
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Added Sucessfully',
              });
              this.salesmanList = data;
              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data });
              //this.toast.success('Inserted Succesfully');
              this.salesmanFormGroup.reset();
              this.displayDialog = false;
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Unable to save your changes. Please try again.',
              });
            },
          });
        },
        reject: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Cancelled',
            detail: '',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.salesmanFormGroup.markAllAsTouched();
      this.salesmanFormGroup.markAsDirty();
    }
  }

  public updateSalesman() {
    if (this.salesmanFormGroup.valid) {
      this.displayDialog = false;
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Update this Record?',
        accept: () => {
          this.api
            .UpdateSalesman(this.salesmanFormGroup.value)
            .subscribe((data: any) => {
              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data });
              this.utilityService
                .LoadSaleManDropdown(true)
                .subscribe((res) => {});
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Updated Sucessfully',
              });
              this.salesmanList = data;
              //this.toast.success('Updated Succesfully');
            });
        },
        reject: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Cancelled',
            detail: '',
          });
        },
      });
    }
  }

  public deleteSalesman(salesman: SalesManMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete this Record?',
      accept: () => {
        this.api.DeleteSalesman(salesman).subscribe((data: any) => {
          this.utilityService.LoadSaleManDropdown(true).subscribe((res) => {});
          this.messageService.add({
            severity: 'success',
            summary: 'Alert',
            detail: 'Deleted Sucessfully',
          });
          this.salesmanList = data;
          //this.toast.success('Deleted Succesfully');
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: '',
        });
      },
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  onDisplayAddUpdateDialog(type: 'add' | 'update', rowData = null) {
    this.displayDialog = true;
    this.salesmanFormGroup.enable();
    if (type == 'add') {
      this.operation = { insert: true, update: false, delete: false };
      this.salesmanFormGroup.reset();

      this.salesmanFormGroup.updateValueAndValidity();
    } else {
      this.operation = { insert: false, update: true, delete: false };
      this.salesmanFormGroup.patchValue({
        salesManMasterSalesManId: rowData.salesManMasterSalesManId,
        salesManMasterSalesManName: rowData.salesManMasterSalesManName,
        salesManMasterSalesManDeleted: rowData.salesManMasterSalesManDeleted,
        salesManMasterSalesManContactNo:
          rowData.salesManMasterSalesManContactNo,
        salesManMasterSalesManLocationId:
          rowData.salesManMasterSalesManLocationId,
      });
    }
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      //message: 'Do you want to delete Location?',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.api.DeleteSalesman(this.dataForDelete).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Salesman Deleted Succesfully',
            });
            //this.new();
            this.salesmanList = data;
            this.salesmanFormGroup.disable();
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

    this.salesmanFormGroup.reset();
  }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.salesManMasterSalesManName != null) {
      const editButton = document.createElement('a');
      editButton.className = 'iconbton edit-btn';
      editButton.style.marginRight = '10px';
      editButton.innerHTML =
        '<i class="pi pi-pencil" style="font-size: 15px;"></i>';
      editButton.addEventListener('click', () => {
        this.ngZone.run(() => {
          this.onDisplayAddUpdateDialog('update', rowData);
        });
      });
      td.appendChild(editButton);
      const deleteButton = document.createElement('a');
      deleteButton.className = 'iconbton delete-btn';
      deleteButton.innerHTML =
        '<i class="pi pi-trash" style="font-size: 15px;"></i>';
      deleteButton.addEventListener('click', () => {
        this.ngZone.run(() => {
          this.deleteSalesman(rowData);
        });
      });
      td.appendChild(deleteButton);
    }

    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }
}
export const columnList = (component: SalesmanComponent) => [
  {
    data: 'salesManMasterSalesManId',
    type: 'text',
    label: 'Salesman Id',
    toolTip: 'Salesman Id',
  },
  {
    data: 'salesManMasterSalesManName',
    type: 'text',
    label: 'Salesman Name',
    toolTip: 'Salesman Name',
  },
  {
    data: 'salesManMasterSalesManContactNo',
    type: 'text',
    label: 'Contact Number',
    toolTip: 'Contact Number',
  },
  {
    data: 'salesManMasterSalesManLocationId',
    type: 'text',
    label: 'Location',
    toolTip: 'Location',
  },
  {
    data: null,
    label: 'Action',
    width: 80,
    renderer: component.buttonRenderer.bind(component),
  },
];
