import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { BudgetMaster } from 'src/app/routes/domain';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';

@Component({
  selector: 'app-costcenter',
  templateUrl: './costcenter.component.html',
  styleUrls: ['./costcenter.component.scss'],
})
export class CostcenterComponent implements OnInit {
  ScreenId: number;
  Permission: any;

  title: string;

  breadcumbmodel: MenuItem[];
  costCenterFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  operation: { insert: boolean; update: boolean; delete: boolean } = {
    insert: false,
    update: false,
    delete: false,
  };
  displayedColumns: string[] = ['code', 'name', 'Status', 'action'];
  costCenterList: CostCenterMaster[] = [];
  displayDialog = false;
  hotid = 'salesMan_HotEntry';
  licensekey: string;
  costCenter_entryDataset = [];
  costCenter_entry: Handsontable.GridSettings;
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
    this.getCostCenterList();
  }
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Cost Center') {
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
    this.costCenterFormGroup = this.fb.group({
      costCenterMasterCostCenterId: [0],
      costCenterMasterCostCenterName: [null, [Validators.required]],
      costCenterMasterCostCenterStatus: [null],
      costCenterMasterCostCenterIsSystem: [null],
      costCenterMasterCostCenterSortOrder: [null],
      costCenterMasterCostCenterDelStatus: [null],
    });
    this.initilizeControlCostCenter();
  }
  initilizeControlCostCenter() {
    this.costCenter_entry = this.utilityService.getTableConfig(
      columnList(this),
      [0]
    );

    this.getCostCenterList();
  }

  public getCostCenterList() {
    this.api.GetAllCostCenter().subscribe((data) => {
      this.costCenterList = data;
      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
    });
  }

  saveCostCenter() {
    this.costCenterFormGroup.markAsDirty();
    this.costCenterFormGroup.markAllAsTouched();
    if (this.costCenterFormGroup.valid) {
      if (this.operation.insert) {
        this.insertCostCenter(this.costCenterFormGroup.value);
      } else if (this.operation.update) {
        this.updateCostCenter(this.costCenterFormGroup.value);
      } else {
      }
    }
  }

  updateValues(data: CostCenterMaster) {
    this.operation = { insert: false, update: true, delete: false };
    this.displayDialog = true;
    this.btnlabel = 'Update';
    this.costCenterFormGroup.patchValue(data);
  }
  removeCostCenter(data: CostCenterMaster) {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.deleteCostCenter(data);
  }
  public get f() {
    return this.costCenterFormGroup.controls;
  }
  public reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.costCenterFormGroup.reset();
  }

  // public insertCostCenter(CostCenter: CostCenterMaster) {
  //   this.api.InsertCostCenter(CostCenter).subscribe((data) => {
  //     this.costCenterList = data;
  //     this.reset();
  //   });
  // }

  // public updateCostCenter(Costcenter: CostCenterMaster) {
  //   this.api.UpdateCostCenter(Costcenter).subscribe((data) => {
  //     this.costCenterList = data;
  //     this.reset();
  //   });
  // }

  // public deleteCostCenter(Costcenter: CostCenterMaster) {
  //   this.btnlabel = 'Submit';
  //   this.api.DeleteCostCenter(Costcenter).subscribe((data) => {
  //     this.costCenterList = data;
  //     this.reset();
  //   });
  // }

  public insertCostCenter(CostCenter: CostCenterMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Save?'),
      accept: () => {
        this.displayDialog = false;
        this.api.InsertCostCenter(CostCenter).subscribe(
          (data) => {
            this.utilityService.GetAllCostCenter(true).subscribe((res) => {});
            this.costCenterList = data;
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Saved Succesfully',
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

  public updateCostCenter(Costcenter: CostCenterMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Update?'),
      accept: () => {
        this.displayDialog = false;
        this.api.UpdateCostCenter(Costcenter).subscribe(
          (data) => {
            this.utilityService.GetAllCostCenter(true).subscribe((res) => {});
            this.costCenterList = data;
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.reset();
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

  public deleteCostCenter(Costcenter: CostCenterMaster) {
    this.btnlabel = 'Submit';
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.api.DeleteCostCenter(Costcenter).subscribe(
          (data) => {
            this.utilityService.GetAllCostCenter(true).subscribe((res) => {});
            this.costCenterList = data;
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
              detail: this.translate.instant('Delete Failed'),
            });
          }
        );
      },
    });
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  buttonRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = '';
    const rowData = instance.getSourceDataAtRow(row);
    if (rowData.costCenterMasterCostCenterId != null) {
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
          this.deleteCostCenter(rowData);
        });
      });
      td.appendChild(deleteButton);
    }

    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }
}
export const columnList = (component: CostcenterComponent) => [
  {
    data: 'costCenterMasterCostCenterId',
    type: 'text',
    label: 'Code',
    toolTip: 'Cost Center Code',
  },
  {
    data: 'costCenterMasterCostCenterName',
    type: 'text',
    label: 'Cost Center Name',
    toolTip: 'Cost Center Name',
  },
  {
    data: 'costCenterMasterCostCenterStatus',
    type: 'checkbox',
    label: 'Status',
    toolTip: 'Cost Center Status',
    width: 80,
    alignment: 'center',
  },
  {
    data: null,
    label: 'Action',
    toolTip: 'Action',
    renderer: component.buttonRenderer?.bind(component),
  },
];
