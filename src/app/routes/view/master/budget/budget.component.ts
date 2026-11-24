import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { BudgetMaster } from 'src/app/routes/domain/Masters/BudgetMaster';

import { MenuItem } from 'primeng/api/menuitem';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
})
export class BudgetComponent implements OnInit {
  ScreenId: number;
  Permission: any;

  title: string;

  breadcumbmodel: MenuItem[];
  BudgetFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  operation: { insert: boolean; update: boolean; delete: boolean } = {
    insert: false,
    update: false,
    delete: false,
  };
  displayedColumns: string[] = ['code', 'name', 'short_name', 'action'];
  BudgetList: BudgetMaster[] = [];
  displayDialog = false;
  hotid = 'salesMan_HotEntry';
  licensekey: string;
  budget_entryDataset = [];
  budget_entry: Handsontable.GridSettings;
  private hotRegisterer = new HotTableRegisterer();
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private permission: PermissionsService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private utilityService: UtilityService,
    private ngZone: NgZone,

    private api: MasterApiService
  ) {}
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Budget') {
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
    this.BudgetFormGroup = this.fb.group({
      budgetMasterBudgetId: [0],
      budgetMasterBudgetName: [null, [Validators.required]],
    });
    this.initilizeControlBudget();
  }
  initilizeControlBudget() {
    this.budget_entry = this.utilityService.getTableConfig(columnList(this), [
      0,
    ]);

    this.getBudgetList();
  }

  public getBudgetList() {
    this.api.GetAllBudget().subscribe((data) => {
      this.BudgetList = data;
      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
    });
  }

  saveBudget() {
    this.BudgetFormGroup.markAsDirty();
    this.BudgetFormGroup.markAllAsTouched();
    if (this.BudgetFormGroup.valid) {
      if (this.operation.insert) {
        this.insertBudget(this.BudgetFormGroup.value);
      } else if (this.operation.update) {
        this.updateBudget(this.BudgetFormGroup.value);
      } else {
      }
    }
  }
  updateValues(data: BudgetMaster) {
    this.operation = { insert: false, update: true, delete: false };
    this.btnlabel = 'Update';
    this.displayDialog = true;
    this.BudgetFormGroup.patchValue(data);
  }
  removeBudget(data: BudgetMaster) {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.deleteBudget(data);
  }
  public get f() {
    return this.BudgetFormGroup.controls;
  }
  public reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.BudgetFormGroup.reset();
  }

  public insertBudget(Budget: BudgetMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Save?'),
      accept: () => {
        this.displayDialog = false;
        this.api.InsertBudget(Budget).subscribe(
          (data) => {
            this.BudgetList = data;
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

  public updateBudget(Budget: BudgetMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Update?'),
      accept: () => {
        this.displayDialog = false;
        this.api.UpdateBudget(Budget).subscribe(
          (data) => {
            this.BudgetList = data;
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

  public deleteBudget(Budget: BudgetMaster) {
    this.btnlabel = 'Submit';
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Delete?'),
      accept: () => {
        this.api.DeleteBudget(Budget).subscribe(
          (data) => {
            this.hotRegisterer.getInstance(this.hotid).updateSettings({ data });
            this.BudgetList = data;
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Deleted Succesfully',
            });

            this.reset();
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
    if (rowData.budgetMasterBudgetId != null) {
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
          this.deleteBudget(rowData);
        });
      });
      td.appendChild(deleteButton);
    }

    td.style.textAlign = 'center';
    td.style.verticalAlign = 'middle';

    return td;
  }
}
export const columnList = (component: BudgetComponent) => [
  {
    data: 'budgetMasterBudgetId',
    type: 'text',
    label: 'Code',
    toolTip: 'Budget Code',
  },
  {
    data: 'budgetMasterBudgetName',
    type: 'text',
    label: 'Budget Name',
    toolTip: 'Budget Name',
  },
  {
    data: null,
    label: 'Action',
    toolTip: 'Action',
    renderer: component.buttonRenderer?.bind(component),
  },
];
