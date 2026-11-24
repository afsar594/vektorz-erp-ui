import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

@Component({
  selector: 'app-cost-estimation-item-master',
  templateUrl: './cost-estimation-item-master.component.html',
  styleUrls: ['./cost-estimation-item-master.component.scss'],
})
export class CostEstimationItemMasterComponent implements OnInit {
  index: number = 0;
  displayMaximizable: boolean = false;
  confirmDropDatabaseDialogVisible: boolean = false;
  
  title: string = 'Cost Estimation Item Master';
  breadcumbmodel: any[] = [];
  costEstimationItemFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  
  operation: { insert: boolean; update: boolean; delete: boolean } = {
    insert: true,
    update: false,
    delete: false,
  };

  cols: any[];
  itemList: any[] = []; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private masterApi: MasterApiService
  ) {}

  ngOnInit(): void {
    this.breadcumbmodel = [{ label: 'Master' }, { label: 'Cost Estimation Item' }];

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'itemName', header: 'Item Name' },
      { field: 'action', header: 'Action' },
    ];

    this.costEstimationItemFormGroup = this.fb.group({
      id: [0],
      itemName: [null, [Validators.required]],
    });

    this.costEstimationItemFormGroup.disable();
  }

  public get f() {
    return this.costEstimationItemFormGroup.controls;
  }

  private isSuccessfulResponse(response: any): boolean {
    return (
      response?.valid ??
      response?.isSuccess ??
      response?.success ??
      !response?.error
    );
  }

  new() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.costEstimationItemFormGroup.reset({ id: 0 });
    this.costEstimationItemFormGroup.enable();
  }

  edit() {
    this.costEstimationItemFormGroup.enable();
  }

  showMaximizableDialog() {
    this.masterApi.GetCostEstimationItems().subscribe(
      (response: any) => {
        if (this.isSuccessfulResponse(response)) {
          this.itemList = response.result;
          this.displayMaximizable = true;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Alert', detail: response.message || 'Failed to fetch items' });
        }
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'API call failed' });
      }
    );
  }

  save() {
    this.costEstimationItemFormGroup.markAllAsTouched();
    if (this.costEstimationItemFormGroup.valid) {
      const payload = this.costEstimationItemFormGroup.value;

      if (this.operation.insert) {
        this.masterApi.CostEstimationInsert(payload).subscribe(
          (response: any) => {
            if (this.isSuccessfulResponse(response)) {
              this.messageService.add({ severity: 'success', summary: 'Alert', detail: response.message || 'Item saved successfully' });
              this.reset();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Alert', detail: response.message || 'Failed to save item' });
            }
          },
          (error) => {
            this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'API call failed' });
          }
        );
      } else if (this.operation.update) {
        this.masterApi.CostEstimationUpdate(payload).subscribe(
          (response: any) => {
            if (this.isSuccessfulResponse(response)) {
              this.messageService.add({ severity: 'success', summary: 'Alert', detail: response.message || 'Item updated successfully' });
              this.reset();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Alert', detail: response.message || 'Failed to update item' });
            }
          },
          (error) => {
            this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'API call failed' });
          }
        );
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill mandatory fields' });
    }
  }

  reset() {
    this.operation = { insert: true, update: false, delete: false };
    this.btnlabel = 'Submit';
    this.costEstimationItemFormGroup.reset({ id: 0 });
    this.costEstimationItemFormGroup.disable();
  }

  updateValues(item: any) {
    this.operation = { insert: false, update: true, delete: false };
    this.btnlabel = 'Update';
    this.costEstimationItemFormGroup.patchValue(item);
    this.costEstimationItemFormGroup.disable();
    this.displayMaximizable = false;
  }

  remove() {
    const id = this.costEstimationItemFormGroup.get('id')?.value;
    
    if (!id || id === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Alert', detail: 'Please select an item from the list to delete' });
      return;
    }

    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete this Item?',
      accept: () => {
        this.masterApi.CostEstimationDelete(id).subscribe(
          (response: any) => {
            if (this.isSuccessfulResponse(response)) {
              this.messageService.add({ severity: 'success', summary: 'Alert', detail: response.message || 'Item deleted successfully' });
              this.reset();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Alert', detail: response.message || 'Failed to delete item' });
            }
          },
          (error) => {
            this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'API call failed' });
          }
        );
      }
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
}