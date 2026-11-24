import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuItem } from 'primeng';
import Swal from 'sweetalert2';
import { SalesServiceService } from 'src/app/routes/service/sales-services/sales-service.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

export interface MergeRecord {
  id: number;
  sourceItemId: number;
  sourceItemName: string;
  targetItemId: number;
  targetItemName: string;
  transferStock: boolean;
  updateSalesOrders: boolean;
  updatePurchaseOrders: boolean;
  updateVouchers: boolean;
  deactivateSource: boolean;
  remarks: string;
  mergedAt: string;
  status: string;
}

@Component({
  selector: 'app-item-merge',
  templateUrl: './item-merge.component.html',
  styleUrls: ['./item-merge.component.scss']
})
export class ItemMergeComponent implements OnInit {
  title: string = 'Item Merge';
  breadcumbmodel: MenuItem[] = [];

  // Merge items
  fromItem: any = null; // Source Item (to be merged & archived)
  toItem: any = null;   // Destination / Target Item (master to keep)

  // Full item dataset
  dataset: any[] = [];
  itemDropdownOptions: any[] = [];
  isLoadingItems: boolean = false;
  isMerging: boolean = false;

  // Form & Options
  mergeForm: FormGroup;

  // Dialog picker state
  showPickerModal: boolean = false;
  pickerTarget: 'from' | 'to' = 'from';
  pickerSearchQuery: string = '';
  filteredPickerItems: any[] = [];

  // Recent simulated merges in current session
  mergeHistory: MergeRecord[] = [];

  constructor(
    private fb: FormBuilder,
    private saleService: SalesServiceService,
    private masterApi: MasterApiService,
    private translate: TranslateService,
    private dialogService: DialogService,
    @Optional() public config: DynamicDialogConfig,
    @Optional() public ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.breadcumbmodel = [
      { label: this.translate.instant('Master'), routerLink: '/master' },
      { label: this.translate.instant('Item Master'), routerLink: '/master/item/list' },
      { label: this.translate.instant('Item Merge') }
    ];

    this.initForm();
    this.loadItemMasterList();
  }

  private initForm(): void {
    this.mergeForm = this.fb.group({
      transferStock: [true],
      updateSalesOrders: [true],
      updatePurchaseOrders: [true],
      updateVouchers: [true],
      deactivateSource: [true],
      remarks: ['']
    });
  }

  loadItemMasterList(): void {
    this.isLoadingItems = true;
    this.saleService.GetItemMasterList().subscribe(
      (response: any) => {
        this.isLoadingItems = false;
        if (response && response.valid && response.result && response.result.data) {
          this.dataset = response.result.data;
        } else if (response && response.result && Array.isArray(response.result)) {
          this.dataset = response.result;
        } else if (Array.isArray(response)) {
          this.dataset = response;
        } else {
          this.dataset = [];
        }

        this.setupDropdownOptions();
        this.filteredPickerItems = [...this.dataset];
      },
      (error) => {
        this.isLoadingItems = false;
        console.warn('Could not load item master list from backend, using local state.', error);
        this.dataset = [];
        this.setupDropdownOptions();
      }
    );
  }

  setupDropdownOptions(): void {
    this.itemDropdownOptions = this.dataset.map((item) => ({
      label: `${item.itemMasterItemName || 'Unnamed'} (ID: ${item.itemMasterItemId} | Code: ${item.itemMasterMaterialCode || '-'})`,
      value: item
    }));
  }

  // --- Item Selection via Modal Picker ---
  openItemPicker(target: 'from' | 'to'): void {
    this.pickerTarget = target;
    this.pickerSearchQuery = '';
    this.filterPickerItems();
    this.showPickerModal = true;
  }

  closeItemPicker(): void {
    this.showPickerModal = false;
  }

  filterPickerItems(): void {
    if (!this.pickerSearchQuery || !this.pickerSearchQuery.trim()) {
      this.filteredPickerItems = [...this.dataset];
      return;
    }

    const query = this.pickerSearchQuery.toLowerCase().trim();
    this.filteredPickerItems = this.dataset.filter((item) => {
      const name = (item.itemMasterItemName || '').toLowerCase();
      const id = String(item.itemMasterItemId || '');
      const code = (item.itemMasterMaterialCode || '').toLowerCase();
      const part = String(item.itemMasterPartNo || '').toLowerCase();
      const batch = (item.itemMasterBatchCode || '').toLowerCase();
      return (
        name.includes(query) ||
        id.includes(query) ||
        code.includes(query) ||
        part.includes(query) ||
        batch.includes(query)
      );
    });
  }

  selectItemFromPicker(item: any): void {
    this.assignItem(item, this.pickerTarget);
    this.closeItemPicker();
  }

  // --- Assign item with validation ---
  assignItem(item: any, target: 'from' | 'to'): boolean {
    if (!item) return false;

    if (target === 'from') {
      if (this.toItem && this.toItem.itemMasterItemId === item.itemMasterItemId) {
        Swal.fire({
          icon: 'warning',
          title: 'Identical Items Selected',
          text: 'Merge From and Merge To cannot be the same item. Please select a different item.',
          confirmButtonColor: '#3085d6'
        });
        return false;
      }
      this.fromItem = item;
    } else {
      if (this.fromItem && this.fromItem.itemMasterItemId === item.itemMasterItemId) {
        Swal.fire({
          icon: 'warning',
          title: 'Identical Items Selected',
          text: 'Merge To and Merge From cannot be the same item. Please select a different item.',
          confirmButtonColor: '#3085d6'
        });
        return false;
      }
      this.toItem = item;
    }
    return true;
  }

  onDropdownChange(event: any, target: 'from' | 'to'): void {
    if (event && event.value) {
      const success = this.assignItem(event.value, target);
      if (!success) {
        if (target === 'from') this.fromItem = null;
        else this.toItem = null;
      }
    }
  }

  clearItem(target: 'from' | 'to'): void {
    if (target === 'from') {
      this.fromItem = null;
    } else {
      this.toItem = null;
    }
  }

  swapItems(): void {
    if (!this.fromItem && !this.toItem) {
      return;
    }
    const temp = this.fromItem;
    this.fromItem = this.toItem;
    this.toItem = temp;
  }

  resetAll(): void {
    this.fromItem = null;
    this.toItem = null;
    this.mergeForm.reset({
      transferStock: true,
      updateSalesOrders: true,
      updatePurchaseOrders: true,
      updateVouchers: true,
      deactivateSource: true,
      remarks: ''
    });
  }

  get canExecuteMerge(): boolean {
    return (
      !!this.fromItem &&
      !!this.toItem &&
      this.fromItem.itemMasterItemId !== this.toItem.itemMasterItemId &&
      !this.isMerging
    );
  }

  confirmAndExecuteMerge(): void {
    if (!this.canExecuteMerge) {
      if (!this.fromItem || !this.toItem) {
        Swal.fire({
          icon: 'info',
          title: 'Incomplete Selection',
          text: 'Please select both "Merge From" (Source) and "Merge To" (Target) items before proceeding.',
          confirmButtonColor: '#3085d6'
        });
      }
      return;
    }

    const fromName = this.fromItem.itemMasterItemName || 'Source Item';
    const fromId = this.fromItem.itemMasterItemId;
    const toName = this.toItem.itemMasterItemName || 'Target Item';
    const toId = this.toItem.itemMasterItemId;

    Swal.fire({
      title: 'Confirm Item Merge',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p style="margin-bottom: 12px; color: #334155;">
            Are you sure you want to merge these two items?
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; width: 120px; font-weight: 600; color: #dc2626;">Source (From):</span>
              <strong>${fromName}</strong> <span style="color: #64748b;">(#${fromId})</span>
            </div>
            <div>
              <span style="display: inline-block; width: 120px; font-weight: 600; color: #16a34a;">Target (To):</span>
              <strong>${toName}</strong> <span style="color: #64748b;">(#${toId})</span>
            </div>
          </div>
          <div style="font-size: 12px; color: #dc2626; font-weight: 500;">
            ⚠️ Notice: Transactions, sales history, and inventory will be consolidated into the target item.
            The source item will be deactivated. This action cannot be automatically reversed.
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: '<i class="fa fa-compress"></i> Execute Merge',
      cancelButtonText: 'Cancel',
      focusCancel: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performMerge();
      }
    });
  }

  private performMerge(): void {
    if (!this.fromItem || !this.toItem) {
      return;
    }

    const fromItemId = Number(this.fromItem.itemMasterItemId);
    const toItemId = Number(this.toItem.itemMasterItemId);

    if (!fromItemId || !toItemId || fromItemId <= 0 || toItemId <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Selection',
        text: 'Both source and target items must have valid IDs.',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    this.isMerging = true;

    const payload = {
      fromItemId: fromItemId,
      toItemId: toItemId,
      sourceItemId: fromItemId,
      sourceItemName: this.fromItem.itemMasterItemName,
      targetItemId: toItemId,
      targetItemName: this.toItem.itemMasterItemName,
      transferStock: this.mergeForm.value.transferStock,
      updateSalesOrders: this.mergeForm.value.updateSalesOrders,
      updatePurchaseOrders: this.mergeForm.value.updatePurchaseOrders,
      updateVouchers: this.mergeForm.value.updateVouchers,
      deactivateSource: this.mergeForm.value.deactivateSource,
      remarks: this.mergeForm.value.remarks || '',
      mergedAt: new Date().toISOString(),
    };

    console.log('[ItemMerge] Calling UpdateItemUnitId with payload:', { fromItemId, toItemId });

    this.masterApi.UpdateItemUnitId(fromItemId, toItemId).subscribe(
      (response: any) => {
        this.isMerging = false;
        if (response && (response.valid || response.status === 'Success' || response.result === true || response.success)) {
          this.handleMergeSuccess(payload, response.message || 'Item unit updated successfully');
          // Reload item list to refresh updated items
          this.loadItemMasterList();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Merge Failed',
            text: response?.message || 'Failed to merge items in backend.',
            confirmButtonColor: '#dc2626'
          });
        }
      },
      (error) => {
        this.isMerging = false;
        console.error('[ItemMerge] UpdateItemUnitId error:', error);
        const errMsg = error?.error?.message || error?.message || 'Server error occurred during item merge.';
        Swal.fire({
          icon: 'error',
          title: 'Merge Error',
          text: errMsg,
          confirmButtonColor: '#dc2626'
        });
      }
    );
  }

  private handleMergeSuccess(payload: any, serverMessage?: string): void {
    const newRecord: MergeRecord = {
      id: Date.now(),
      ...payload,
      status: 'Completed'
    };

    this.mergeHistory.unshift(newRecord);

    Swal.fire({
      icon: 'success',
      title: 'Items Merged Successfully!',
      html: `
        <p>Item <strong>${payload.sourceItemName}</strong> (#${payload.sourceItemId}) has been merged into <strong>${payload.targetItemName}</strong> (#${payload.targetItemId}).</p>
        <p style="font-size: 12px; color: #64748b;">${serverMessage || 'Item unit and associated records updated successfully.'}</p>
      `,
      confirmButtonColor: '#16a34a'
    });

    // Clear source item and remarks so user can merge another or review
    this.fromItem = null;
    this.mergeForm.get('remarks').reset('');
  }

  close(): void {
    if (this.ref) {
      this.ref.close();
    }
  }
}
