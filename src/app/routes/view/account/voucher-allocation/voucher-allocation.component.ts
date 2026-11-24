import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  DialogService,
  DynamicDialogRef,
  ConfirmationService,
  MessageService,
} from 'primeng';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { AllocationSourceType } from 'src/app/routes/domain/Accounts/allocation-source-type.enum';
import { Allocations } from 'src/app/routes/Enums/Allocation';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import Swal from 'sweetalert2';
import { VoucherAllocationListComponent } from './voucher-allocation-list/voucher-allocation-list.component';

@Component({
  selector: 'app-voucher-allocation',
  templateUrl: './voucher-allocation.component.html',
  styleUrls: ['./voucher-allocation.component.scss'],
})
export class VoucherAllocationComponent implements OnInit {
  btnFlag: ButtonFlag = {
    new: true,
    edit: false,
    cancel: false,
    save: true,
    update: false,
    delete: false,
    print: false,
    printPreview: false,
  };

  submitted: boolean = false;
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  Date: Date;
  totalRecords: number = 0;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  VAForm: FormGroup;
  index: number = 0;
  radioType: string = 'Suppliers';
  customerDropdown: any[] = [];
  voucherDate: Date = new Date();
  selectedCustomerDropdown: any[] = [];
  isReleasing: boolean = false;
  loadedVoucherHasActiveAllocations: boolean = false;
  supplierDropdown: any[] = [];
  selectedsupplierDropdown: any[] = [];
  state: {
    Dir: string;
    Field: any;
    Skip: any;
    Take: any;
    Search: any;
    Filter: any;
  };
  search: any;
  filter: any;
  DataList: any;
  CheckAllSelected: any;
  IdsArray: any[] = [];
  totalDebit: any = 0;
  totalCredit: any = 0;
  totalBalance: any = 0;
  AV_Total_Debit: any = 0;
  AV_Total_Credit: any = 0;

  selectedRows: any[] = [];

  allocatedRows: any[] = [];
  ScreenId: number;
  Permission: any;
  datasetVoucher: any[] = [];
  netAllocated: number = null;
  DC: string = '';
  voucherFirst: boolean = false;
  debit: number = 0;
  value: number = 0;

  handleChange(e) {
    this.index = e.index;
  }

  hotid = 'VoucherAllocation';
  private hotRegisterer = new HotTableRegisterer();
  VoucherAllocation: Handsontable.GridSettings;
  initializeControls() {
    this.VoucherAllocation = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,

      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'ID',
          type: 'checkbox',
          checkedTemplate: 'yes',
          uncheckedTemplate: 'no',
          width: 80,
        },
        {
          data: 'accountsTransactionsTransDate',
          type: 'text',
          width: 80,
        },
        {
          data: 'accountsTransactionsVoucherNo',
          type: 'text',
          width: 80,
        },
        {
          data: 'accountsTransactionsVoucherType',
          type: 'text',
          width: 80,
        },
        {
          data: 'accountsTransactionsDebit',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'accountsTransactionsCredit',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'accountsTransactionsAllocCredit',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'accountsTransactionsAllocBalance',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'accountsTransactionsAllocationbalance',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'NetAllocation',
          type: 'numeric',
          width: 80,
        },
      ],
      colHeaders: [
        this.translate.instant('ID'),
        this.translate.instant('Date'),
        this.translate.instant('V No'),
        this.translate.instant('Type'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('Allocation Amt'),
        this.translate.instant('Balance'),
        this.translate.instant('Net Allocation'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private accService: AccountstatementService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private permission: PermissionsService
  ) { }
  ngOnInit(): void {
    console.log("cjeck aaaa");
    
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      if (rights) {
        var res = rights[0];
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

    this.cols = [
      { field: 'accountsTransactionsTransSno', header: 'ID' },
      { field: 'accountsTransactionsTransDateString', header: 'Date' },
      { field: 'accountsTransactionsVoucherNo', header: 'V No' },
      { field: 'accountsTransactionsVoucherType', header: 'Type' },
      { field: 'accountsTransactionsDebit', header: 'Debit' },
      { field: 'accountsTransactionsCredit', header: 'Credit' },
      { field: 'accountsTransactionsAllocDebit', header: 'Allocation Amt' },
      { field: 'accountsTransactionsAllocationbalance', header: 'Balance' },
      { field: 'netAllocation', header: 'Net Allocation' },
    ];
    this.VAForm = this.fb.group({
      allocationVoucherVoucherNo: new FormControl('', Validators.required),
      allocationVoucherId: new FormControl(0, Validators.required),
      allocationVoucherVoucherDate: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      allocationVoucherVcreation: new FormControl(
        AllocationSourceType.CommonAllocation,
        Validators.required
      ),
      SelectCustomerAC: new FormControl(''),
      SelectSupplierAC: new FormControl(''),
      allocationVoucherDescription: new FormControl('', Validators.required),
      AllocationVoucherTotalDebit: new FormControl(''),
      AllocationVoucherTotalCredit: new FormControl(''),
      AllocationVoucherTotal: new FormControl(''),
      allocationVoucherVoucherAccNo: new FormControl('', Validators.required),
      allocationVoucherVoucherAccType: new FormControl(''),
      RadioType: new FormControl('Suppliers'),
      VoucherAllocationDetails: this.fb.array([]),
    });
    this.VAForm.disable();
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
    this.GetCustomerMasterDropdown();
    this.GetSupplierMasterDropdown();
  }

  get f() {
    return this.VAForm.controls;
  }

  cancel() {
    this.loadedVoucherHasActiveAllocations = false;
    this.VAForm.reset();
    this.dataset = [];
    this.datasetVoucher = [];
  }

  onCheckboxChange(event, rowData) {
    if (event.checked) {
      this.selectedRows.push(rowData);
    } else {
      this.selectedRows = this.selectedRows?.filter((row) => row !== rowData);
    }
  }

  GetCustomerMasterDropdown() {
    this.accService
      .GetCustomerMasterDropdown()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.customerDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.value,
          }));
          this.customerDropdown.unshift({ label: '--Select--', value: -1 });

        }
      });
  }

  GetSupplierMasterDropdown() {
    this.accService
      .GetSupplierMasterDropdown()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.supplierDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.value,
          }));
          this.supplierDropdown.unshift({ label: '--Select--', value: -1 });
        }
      });
  }

  IsSelectedInArray(data: any) {
    data.map((obj: any) => {
      obj.IsSelected = false;
      obj.netAllocation = Number(obj.netAllocation || 0);
      obj.openBalance = this.getRowOpenBalance(obj);
      obj.remainingSourceAmount = obj.openBalance;
      return obj;
    });
    return data;
  }

  SelectionRatio() {
    this.totalCredit = 0;
    this.totalBalance = 0;
    this.totalDebit = 0;
    this.dataset = [];
    this.datasetVoucher = [];
    this.VAForm.controls['SelectSupplierAC'].setValue(-1);
  }

  private isVoucherRow(row: any): boolean {
    return Object.values(Allocations).includes(
      row?.accountsTransactionsVoucherType
    );
  }

  private isSourceRow(row: any): boolean {
    return !!row && !this.isVoucherRow(row);
  }

  private isTargetRow(row: any): boolean {
    return !!row && this.isVoucherRow(row);
  }

  private getRowOpenBalance(row: any): number {
    if (row?.openBalance != null && !isNaN(Number(row.openBalance))) {
      return Number(row.openBalance);
    }

    const remainingBalance = Number(
      row?.accountsTransactionsAllocationbalance ??
        row?.accountsTransactionsAllocBalance ??
        0
    );
    const netAllocation = Number(row?.netAllocation || 0);

    return Number((remainingBalance + netAllocation).toFixed(2));
  }

  private assignSelectionOrder(row: any) {
    if (!row) {
      return;
    }

    row.selectionOrder = (row.selectionOrder || 0) + 1;
    row.selectionStamp = Date.now() + Math.random();
  }

  private sortSelectedRows(rows: any[]): any[] {
    return [...rows].sort(
      (a, b) => Number(a.selectionStamp || 0) - Number(b.selectionStamp || 0)
    );
  }

  private resetSourceRows() {
    (this.dataset || []).forEach((row: any) => {
      row.remainingSourceAmount = Number(this.getRowOpenBalance(row).toFixed(2));
      row.netAllocation =
        row.IsSelected && this.isRowSelectable(row)
          ? Number(this.getRowOpenBalance(row).toFixed(2))
          : 0;
    });
  }

  private resetTargetRows(resetUnselectedOnly = false) {
    (this.datasetVoucher || []).forEach((row: any) => {
      if (!resetUnselectedOnly || !row.IsSelected) {
        row.netAllocation = 0;
      }
    });
  }

  private recalculateManualAllocations() {
    const sourceRows = this.sortSelectedRows(
      (this.dataset || []).filter(
        (row: any) => row.IsSelected && this.isRowSelectable(row)
      )
    );

    this.resetSourceRows();
    this.resetTargetRows(true);

    if (!sourceRows.length) {
      (this.datasetVoucher || []).forEach((row: any) => {
        if (row.IsSelected) {
          row.netAllocation = 0;
        }
      });
      this.recalculateTotals();
      this.refreshAllocationState();
      return;
    }

    let totalAllocated = 0;
    let sourceExceeded = false;

    const targetRows = this.sortSelectedRows(
      (this.datasetVoucher || []).filter(
        (row: any) => row.IsSelected && this.isRowSelectable(row)
      )
    );

    for (const target of targetRows) {
      const openBalance = this.getRowOpenBalance(target);
      const requestedAllocation = Math.max(
        0,
        Math.min(Number(target.netAllocation || 0), openBalance)
      );

      let pendingAllocation = requestedAllocation;
      let actualAllocation = 0;

      for (const source of sourceRows) {
        const available = Number(source.remainingSourceAmount || 0);
        if (available <= 0 || pendingAllocation <= 0) {
          continue;
        }

        const allocateNow = Math.min(available, pendingAllocation);
        source.remainingSourceAmount = Number(
          (available - allocateNow).toFixed(2)
        );
        pendingAllocation = Number((pendingAllocation - allocateNow).toFixed(2));
        actualAllocation = Number((actualAllocation + allocateNow).toFixed(2));
      }

      if (pendingAllocation > 0) {
        sourceExceeded = true;
      }

      target.netAllocation = actualAllocation;
      totalAllocated = Number((totalAllocated + actualAllocation).toFixed(2));
    }

    this.netAllocated = totalAllocated;
    this.recalculateTotals();
    this.refreshAllocationState();

    if (sourceExceeded) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Entered amount exceeds available account balance.',
      });
    }
  }

  private recalculateSelectedVoucherAllocations() {
    const sourceRows = this.sortSelectedRows(
      (this.dataset || []).filter(
        (row: any) => row.IsSelected && this.isRowSelectable(row)
      )
    );

    this.resetSourceRows();
    this.resetTargetRows();

    if (!sourceRows.length) {
      this.recalculateTotals();
      this.refreshAllocationState();
      return;
    }

    let totalAllocated = 0;

    const targetRows = this.sortSelectedRows(
      (this.datasetVoucher || []).filter(
        (row: any) => row.IsSelected && this.isRowSelectable(row)
      )
    );

    for (const target of targetRows) {
      let remainingTargetBalance = this.getRowOpenBalance(target);
      if (remainingTargetBalance <= 0) {
        target.netAllocation = 0;
        continue;
      }

      for (const source of sourceRows) {
        const available = Number(source.remainingSourceAmount || 0);
        if (available <= 0 || remainingTargetBalance <= 0) {
          continue;
        }

        const allocateNow = Math.min(available, remainingTargetBalance);
        source.remainingSourceAmount = Number(
          (available - allocateNow).toFixed(2)
        );
        target.netAllocation = Number(
          ((target.netAllocation || 0) + allocateNow).toFixed(2)
        );
        remainingTargetBalance = Number(
          (remainingTargetBalance - allocateNow).toFixed(2)
        );
        totalAllocated = Number((totalAllocated + allocateNow).toFixed(2));
      }
    }

    this.netAllocated = totalAllocated;
    this.recalculateTotals();
    this.refreshAllocationState();
  }

  // Function to automatically allocate credits and debits
  autoAllocate() {
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.netAllocated = 0;
    if (this.VAForm.controls['RadioType'].value == 'Suppliers') {
      var debit = 0;
      var credit = 0;
      this.dataset.forEach((x: any) => {
        if (!this.isRowSelectable(x)) return;
        debit += x.accountsTransactionsAllocBalance ?? 0;
      });
      this.datasetVoucher.forEach((x: any) => {
        if (!this.isRowSelectable(x)) return;
        credit += x.accountsTransactionsAllocBalance ?? 0;
      });

      if (debit > credit) {
        this.netAllocated = credit;
        this.datasetVoucher.forEach((x: any) => {
          if (!this.isRowSelectable(x)) return;
          if (this.netAllocated > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            this.netAllocated -= x.netAllocation;
          } else {
            x.netAllocation = this.netAllocated;
            this.totalCredit += x.netAllocation;
            this.netAllocated = 0;
            x.isSelected = true;
          }
        });
        this.dataset.forEach((x: any) => {
          if (!this.isRowSelectable(x)) return;
          if (credit > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            debit -= x.netAllocation;
          } else {
            x.netAllocation = debit;
            x.isSelected = true;
          }
        });
      } else {
        this.netAllocated = debit;
        this.dataset.forEach((x: any) => {
          if (!this.isRowSelectable(x)) return;
          if (this.netAllocated > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            this.netAllocated -= x.netAllocation;
          } else {
            x.netAllocation = this.netAllocated;
            this.totalCredit += x.netAllocation;
            this.netAllocated = 0;
            x.isSelected = true;
          }
        });
        this.datasetVoucher.forEach((x: any) => {
          if (!this.isRowSelectable(x)) return;
          if (credit > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            credit -= x.netAllocation;
          } else {
            x.netAllocation = credit;
            x.isSelected = true;
          }
        });
      }
    } else {
      var debit = 0;
      var credit = 0;
      this.dataset.forEach((x: any) => {
        if (!this.isRowSelectable(x)) return;
        credit += x.accountsTransactionsAllocBalance ?? 0;
      });
      this.datasetVoucher.forEach((x: any) => {
        if (!this.isRowSelectable(x)) return;
        debit += x.accountsTransactionsAllocBalance ?? 0;
      });

      if (debit > credit) {
        this.netAllocated = credit;
        this.dataset.forEach((x: any) => {
          if (!this.isRowSelectable(x)) return;
          if (this.netAllocated > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            this.netAllocated -= x.netAllocation;
          } else {
            x.netAllocation = this.netAllocated;
            this.totalCredit += x.netAllocation;
            this.netAllocated = 0;
            x.isSelected = true;
          }
        });
        this.datasetVoucher.forEach((x: any) => {
          if (!this.isRowSelectable(x)) return;
          if (credit > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            credit -= x.netAllocation;
          } else {
            x.netAllocation = credit;
            x.isSelected = true;
          }
        });
      } else {
        this.netAllocated = debit;
        this.datasetVoucher.forEach((x: any) => {
          if (!this.isRowSelectable(x)) return;
          if (this.netAllocated > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            this.netAllocated -= x.netAllocation;
          } else {
            x.netAllocation = this.netAllocated;
            this.totalCredit += x.netAllocation;
            this.netAllocated = 0;
            x.isSelected = true;
          }
        });
        this.dataset.forEach((x: any) => {
          if (debit > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            debit -= x.netAllocation;
          } else {
            x.netAllocation = credit;
            x.isSelected = true;
          }
        });
      }
    }

    this.synchronizeVoucherAllocationsBasedOnReceipts();
    this.recalculateTotals();
    this.refreshAllocationState();
  }

  CheckEachCheckBox(event: any, id: number, from: string) {
    const isChecked = !!event?.target?.checked;
    const sourceList = from === 'account' ? this.dataset : this.datasetVoucher;
    const row = (sourceList || []).find(
      (x: any) => x.accountsTransactionsTransSno === id
    );

    if (!row) {
      return;
    }

    if (!this.isRowSelectable(row) && isChecked) {
      row.IsSelected = false;
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'This voucher is already allocated and cannot be selected again.',
      });
      return;
    }

    if (from === 'vouchers' && isChecked) {
      const hasSelectedSource = (this.dataset || []).some(
        (item: any) => item.IsSelected && this.isRowSelectable(item)
      );

      if (!hasSelectedSource) {
        row.IsSelected = false;
        row.netAllocation = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Select at least one account row first.',
        });
        return;
      }
    }

    row.IsSelected = isChecked;
    if (!isChecked) {
      row.netAllocation = 0;
      delete row.selectionStamp;
      delete row.selectionOrder;
    } else {
      if (from === 'account') {
        row.netAllocation = Number(this.getRowOpenBalance(row).toFixed(2));
      }
      this.assignSelectionOrder(row);
    }

    this.recalculateSelectedVoucherAllocations();
  }

getRemainingBalance(rowData: any): number {
  const balance = this.getRowOpenBalance(rowData);

  const allocation =
    Number(rowData.netAllocation) || 0;

  return Number((balance - allocation).toFixed(2));
}
  // private handleDebitForVoucher(event: any, x: any, id: number) {
  //   if (x.accountsTransactionsTransSno === id) {
  //     if (event.target.checked) {
  //       if (this.netAllocated > x.accountsTransactionsAllocBalance) {
  //         x.netAllocation = x.accountsTransactionsAllocBalance;

  //         this.netAllocated -= x.netAllocation;
  //         this.totalDebit += x.netAllocation;
  //       } else if (this.netAllocated == null) {
  //         x.netAllocation = x.accountsTransactionsAllocBalance;

  //         this.totalDebit += x.netAllocation ?? 0;
  //         this.voucherFirst = true;
  //       } else if (this.netAllocated > 0) {
  //         x.netAllocation = this.netAllocated;

  //         this.netAllocated = 0;
  //         this.totalDebit += x.netAllocation ?? 0;
  //       }
  //       x.IsSelected = true;
  //     } else {
  //       this.totalDebit -= x.netAllocation ?? 0;
  //       this.resetAllocation(x);
  //     }
  //   }
  // }

  // Recalculate totals for the current selected rows
  private recalculateTotals() {
    let totalCredit = 0;
    let totalDebit = 0;

    (this.dataset || []).forEach((x: any) => {
      if (!x.IsSelected || !this.isRowSelectable(x)) {
        return;
      }

      const sourceAmount = Number(this.getRowOpenBalance(x)) || 0;
      if (sourceAmount <= 0) {
        return;
      }

      if (Number(x.accountsTransactionsDebit) > 0) {
        totalDebit += sourceAmount;
      } else {
        totalCredit += sourceAmount;
      }
    });

    (this.datasetVoucher || []).forEach((x: any) => {
      if (!x.IsSelected || !this.isRowSelectable(x)) {
        return;
      }

      const allocation = Number(x.netAllocation) || 0;
      if (allocation <= 0) {
        return;
      }

      if (Number(x.accountsTransactionsDebit) > 0) {
        totalDebit += allocation;
      } else {
        totalCredit += allocation;
      }
    });

    this.totalDebit = totalDebit;
    this.totalCredit = totalCredit;
    this.updateTotalBalance();
  }

  private getSelectedReceiptAmount(): number {
    return (this.dataset || [])
      .filter((x: any) => x.IsSelected && this.isRowSelectable(x))
      .reduce((sum: number, x: any) => sum + (Number(x.netAllocation) || 0), 0);
  }

  private synchronizeVoucherAllocationsBasedOnReceipts() {
    let remaining = this.getSelectedReceiptAmount();

    (this.datasetVoucher || []).forEach((x: any) => {
      if (!this.isRowSelectable(x)) {
        return;
      }
      if (!x.IsSelected) {
        x.netAllocation = 0;
        return;
      }

      const maxBalance =
        Number(x.accountsTransactionsAllocationbalance || x.accountsTransactionsAllocBalance) || 0;
      x.netAllocation = Math.min(maxBalance, remaining);
      remaining -= x.netAllocation;
    });
  }

  // Update the total balance
  private updateTotalBalance() {
    const isSupplierFlow =
      this.VAForm?.controls['RadioType']?.value === 'Suppliers';

    const balance = isSupplierFlow
      ? this.totalDebit - this.totalCredit
      : this.totalCredit - this.totalDebit;

    this.totalBalance = Number(balance || 0).toFixed(2);
  }

  onNetAllocationChange(event, selectrow, netallco: any, id) {
    const row = (this.datasetVoucher || []).find(
      (x: any) => x.accountsTransactionsTransSno === id
    );

    if (!row) {
      const sourceRow = (this.dataset || []).find(
        (x: any) => x.accountsTransactionsTransSno === id
      );
      if (sourceRow) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Net allocation can only be entered on voucher rows.',
        });
      }
      return;
    }

    const enteredValue = Number(netallco) || 0;
    const selectedSourceRows = (this.dataset || []).filter(
      (x: any) => x.IsSelected && this.isRowSelectable(x)
    );

    if (!selectedSourceRows.length) {
      row.netAllocation = 0;
      row.IsSelected = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Select at least one account row first.',
      });
      this.recalculateTotals();
      this.refreshAllocationState();
      return;
    }

    const maxBalance = this.getRowOpenBalance(row);
    if (enteredValue > maxBalance) {
      row.netAllocation = 0;
      row.IsSelected = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Entered amount exceeds voucher balance.',
      });
      this.recalculateManualAllocations();
      return;
    }

    row.netAllocation = enteredValue;
    row.IsSelected = enteredValue > 0;
    if (row.IsSelected) {
      this.assignSelectionOrder(row);
    }

    this.recalculateManualAllocations();
  }

  CheckAllCheckBox(event: any) {
    this.dataset.forEach((c: any) => {
      // skip non-selectable rows when checking all
      if (!this.isRowSelectable(c)) {
        c.netAllocation = c.netAllocation ?? 0;
        return;
      }
      if (event.target.checked) {
        c.IsSelected = event.target.checked;
        c.netAllocation = Number(this.getRowOpenBalance(c).toFixed(2));
        this.assignSelectionOrder(c);
      } else {
        c.IsSelected = event.target.checked;
        c.netAllocation = 0;
      }
    });
    this.recalculateSelectedVoucherAllocations();
  }
  CheckAllCheckBoxVoucher(event: any) {
    const hasSelectedSource = (this.dataset || []).some(
      (row: any) => row.IsSelected && this.isRowSelectable(row)
    );

    if (event.target.checked && !hasSelectedSource) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Select at least one account row first.',
      });
      return;
    }

    this.datasetVoucher.forEach((c: any) => {
      // skip non-selectable rows when checking all
      if (!this.isRowSelectable(c)) {
        c.netAllocation = c.netAllocation ?? 0;
        return;
      }
      if (event.target.checked) {
        c.IsSelected = event.target.checked;
        this.assignSelectionOrder(c);
      } else {
        c.IsSelected = event.target.checked;
        c.netAllocation = 0;
      }
    });
    this.recalculateSelectedVoucherAllocations();
  }

  // auto alocation

  AutoAllocate() {
    this.resetAllAllocations();

    (this.dataset || []).forEach((row: any) => {
      if (this.isRowSelectable(row)) {
        row.IsSelected = true;
        this.assignSelectionOrder(row);
      }
    });

    (this.datasetVoucher || []).forEach((row: any) => {
      if (this.isRowSelectable(row)) {
        row.IsSelected = true;
        this.assignSelectionOrder(row);
      }
    });

    this.recalculateSelectedVoucherAllocations();
  }

  private autoAllocates(allocate, other) {
    let A = allocate;
    let O = other;
    this.dataset.forEach((x: any) => {
      if (!this.isRowSelectable(x)) {
        x.netAllocation = x.netAllocation ?? 0;
        x.IsSelected = x.isAllocated;
        return;
      }
      if (A > x.accountsTransactionsAllocBalance) {
        x.netAllocation = x.accountsTransactionsAllocBalance;
        A -= x.netAllocation ?? 0;
      } else {
        x.netAllocation = A;
        A = 0;
      }
      x.IsSelected = true;
      if (A == 0 && !x.netAllocation) {
        x.IsSelected = false;
      }

      if (x.accountsTransactionsDebit > 0) {
        this.totalDebit += x.netAllocation ?? 0;
      } else {
        this.totalCredit += x.netAllocation ?? 0;
      }
    });

    this.datasetVoucher.forEach((x: any) => {
      if (!this.isRowSelectable(x)) {
        x.netAllocation = x.netAllocation ?? 0;
        x.IsSelected = x.isAllocated;
        return;
      }
      if (O > x.accountsTransactionsAllocBalance) {
        x.netAllocation = x.accountsTransactionsAllocBalance;
        O -= x.netAllocation ?? 0;
      } else {
        x.netAllocation = O;
        O = 0;
      }
      x.IsSelected = true;
      if (O == 0 && !x.netAllocation) {
        x.IsSelected = false;
      }
      if (x.accountsTransactionsDebit > 0) {
        this.totalDebit += x.netAllocation ?? 0;
      } else {
        this.totalCredit += x.netAllocation ?? 0;
      }
    });
  }

  // Reset all allocations
  private resetAllAllocations() {
    this.dataset.forEach((x: any) => {
      x.netAllocation = 0;
      x.IsSelected = false;
      x.remainingSourceAmount = this.getRowOpenBalance(x);
    });

    this.datasetVoucher.forEach((x: any) => {
      x.netAllocation = 0;
      x.IsSelected = false;
    });

    this.totalCredit = 0;
    this.totalDebit = 0;
    this.netAllocated = 0;
    this.refreshAllocationState();
  }

  // auto allocation ----------------------

  GetGridListData(event: any) {
    this.state = {
      Dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
      Field:
        event != null
          ? event.sortField != null && event.sortField != ''
            ? event.sortField
            : 'AccountsTransactions_TransSno'
          : 'AccountsTransactions_TransSno',
      Skip: event != null ? (event.first != null ? event.first : 0) : 0,
      Take: event != null ? (event.rows != null ? event.rows : 0) : 10000,
      Search: this.search,
      Filter: this.filter,
    };
    this.accService
      .GetAccountTransactionsVoucherAllocation(this.state)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.data.length > 0) {
          var data = response.result.data;
          var voucherList = response.result.data?.filter((transaction) =>
            Object.values(Allocations).includes(
              transaction.accountsTransactionsVoucherType
            )
          );
          var accountVList = data?.filter(
            (transaction) =>
              !Object.values(Allocations).includes(
                transaction.accountsTransactionsVoucherType
              )
          );

          this.dataset = this.IsSelectedInArray(accountVList);
          this.datasetVoucher = this.IsSelectedInArray(voucherList);

          // mark rows that are already fully allocated so UI and logic can disable them
          this.refreshAllocationState(this.dataset);
          this.refreshAllocationState(this.datasetVoucher);
        }

      });
  }

  private reloadCurrentAccountTransactions() {
    const rawForm = this.VAForm.getRawValue();
    const radioType = rawForm?.RadioType || 'Suppliers';
    const supplierAccount = rawForm?.SelectSupplierAC;
    const customerAccount = rawForm?.SelectCustomerAC;
    const voucherDate = rawForm?.allocationVoucherVoucherDate;

    this.loadedVoucherHasActiveAllocations = false;
    this.VAForm.controls['allocationVoucherId'].setValue(0);
    this.VAForm.controls['allocationVoucherVoucherNo'].setValue('');
    this.VAForm.controls['allocationVoucherDescription'].setValue('');
    this.VAForm.controls['AllocationVoucherTotalDebit'].setValue(0);
    this.VAForm.controls['AllocationVoucherTotalCredit'].setValue(0);
    this.VAForm.controls['AllocationVoucherTotal'].setValue(0);
    this.VAForm.controls['allocationVoucherVcreation'].setValue(
      AllocationSourceType.CommonAllocation
    );

    this.totalBalance = 0;
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.netAllocated = 0;
    this.dataset = [];
    this.datasetVoucher = [];

    this.btnFlag = {
      ...this.btnFlag,
      new: true,
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      print: false,
      printPreview: false,
    };

    this.VAForm.enable();
    this.VAForm.controls['RadioType'].setValue(radioType);
    this.VAForm.controls['SelectSupplierAC'].setValue(supplierAccount || '');
    this.VAForm.controls['SelectCustomerAC'].setValue(customerAccount || '');
    this.VAForm.controls['allocationVoucherVoucherDate'].setValue(
      voucherDate || new Date()
    );

    const hasValidSupplier =
      radioType === 'Suppliers' &&
      supplierAccount != null &&
      supplierAccount !== '' &&
      supplierAccount !== -1;
    const hasValidCustomer =
      radioType === 'Customers' &&
      customerAccount != null &&
      customerAccount !== '' &&
      customerAccount !== -1;

    if (hasValidSupplier || hasValidCustomer) {
      this.LoadAccountTransaction();
    }
  }

  patchValues(e: any) {
    const allocationAccountNo =
      this.VAForm.controls['allocationVoucherVoucherAccNo'].value;

    return this.fb.group({
      AccountsTransactionsTransSno:
        e.accountsTransactionsTransSno != null
          ? Number(e.accountsTransactionsTransSno)
          : null,
      AccountsTransactionsAllocBalance:
        e.accountsTransactionsAllocBalance != null
          ? Number(e.accountsTransactionsAllocBalance)
          : 0,
      AllocationVoucherDetailsVno: e.accountsTransactionsVoucherNo,
      AllocationVoucherDetailsAllocDebit:
        e.accountsTransactionsDebit != null
          ? Number(e.accountsTransactionsDebit)
          : 0,
      AllocationVoucherDetailsAllocCredit:
        e.accountsTransactionsCredit != null
          ? Number(e.accountsTransactionsCredit)
          : 0,
      AllocationVoucherDetailsRefVType: e.accountsTransactionsVoucherType,
      AllocationVoucherDetailsNetAllocation:
        Number(e?.netAllocation) || 0,
      AllocationVoucherDetailsAccNo: allocationAccountNo,
      RefSPAccountNo: allocationAccountNo,
    });
  }

  VoucherAllocationFormSubmit() {
    const currentVoucherNo =
      this.VAForm.controls['allocationVoucherVoucherNo'].value || 'this voucher';

    const currentAllocationId = Number(
      this.VAForm.getRawValue()?.allocationVoucherId ||
        this.VAForm.controls['allocationVoucherId']?.value ||
        0
    );

    if (
      currentAllocationId > 0 &&
      this.loadedVoucherHasActiveAllocations
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `This voucher is already allocated with ${currentVoucherNo}. To edit, release it first!`,
      });
      return;
    }

    if (this.totalBalance == 0) {
      const allocationAccountNo =
        this.VAForm.controls['RadioType'].value == 'Suppliers'
        ? this.VAForm.controls['SelectSupplierAC'].value
        : this.VAForm.controls['SelectCustomerAC'].value;

      this.VAForm.controls['allocationVoucherVoucherAccNo'].setValue(
        allocationAccountNo ||
          this.VAForm.controls['allocationVoucherVoucherAccNo'].value ||
          ''
      );

      if (
        this.VAForm.value.allocationVoucherId == null ||
        this.VAForm.value.allocationVoucherId == undefined
      ) {
        this.VAForm.patchValue({
          allocationVoucherId: 0,
        });
      }

      console.log('Payload =>', this.VAForm.getRawValue());

      // validate allocations before building payload
      if (!this.validateAllocationsBeforeSubmit()) {
        return;
      }

      const control = <FormArray>this.VAForm.get('VoucherAllocationDetails');
      while (control.length > 0) {
        control.removeAt(0);
      }
      const data = [...this.dataset, ...this.datasetVoucher];
      const selectedRows = data.filter(
        (x) =>
          x.IsSelected &&
          this.isRowSelectable(x) &&
          Number(x.netAllocation) > 0
      );
      const validRows = selectedRows.filter(
        (x) => x.accountsTransactionsTransSno != null
      );
      const invalidRows = selectedRows.filter(
        (x) => x.accountsTransactionsTransSno == null
      );

      if (invalidRows.length > 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail:
            'Some selected voucher allocations were ignored because the transaction ID is missing.',
        });
      }

      if (validRows.length === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No valid voucher allocations available to save.',
        });
        return;
      }

      validRows.forEach((x) => control.push(this.patchValues(x)));
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Save?',
        accept: () => {
          this.accService
            .AddEditVoucherAllocation(this.VAForm.value)
            .subscribe((response: ApiResponse<any>) => {
              if (response.valid && response.result) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: response.message,
                });
                this.reloadCurrentAccountTransactions();
              }
            });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Balance ammount must be 0',
      });
    }
  }

  // Frontend validation to prevent over-allocation and duplicates
  private validateAllocationsBeforeSubmit(): boolean {
    const selectedRows = [] as any[];
    const ids = new Set<number>();
    const data = [...this.dataset, ...this.datasetVoucher];
    let invalidSelectedRows = 0;
    for (const x of data) {
      if (!x.IsSelected) continue;
      if (x.accountsTransactionsTransSno == null) {
        invalidSelectedRows++;
        continue;
      }
      const allocBalance = this.getRowOpenBalance(x);
      const netAlloc = Number(x.netAllocation) || 0;
      if (!this.isRowSelectable(x)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Voucher ${x.accountsTransactionsVoucherNo} cannot be allocated.` });
        return false;
      }
      if (netAlloc <= 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Allocation amount must be greater than zero for voucher ${x.accountsTransactionsVoucherNo}.` });
        return false;
      }
      if (netAlloc > allocBalance) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Allocation for voucher ${x.accountsTransactionsVoucherNo} exceeds remaining balance.` });
        return false;
      }
      if (ids.has(x.accountsTransactionsTransSno)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Duplicate allocation detected for voucher ${x.accountsTransactionsVoucherNo}.` });
        return false;
      }
      ids.add(x.accountsTransactionsTransSno);
      selectedRows.push(x);
    }

    if (invalidSelectedRows > 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Some selected allocations were ignored because they do not have a valid transaction ID.' });
    }
    if (selectedRows.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'No allocations selected.' });
      return false;
    }
    return true;
  }

  LoadAccountTransaction() {
    if (
      this.f.SelectCustomerAC.value == '' &&
      this.f.SelectSupplierAC.value == ''
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Select the Customer /Supplier',
      });
      return;
    }
    let query = this.GetCustomerSupplierFilter();
    this.filter = query;
    this.loadedVoucherHasActiveAllocations = false;
    this.dataset = [];
    this.datasetVoucher = [];
    this.voucherFirst = false;
    this.totalBalance = 0;
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.debit = 0;
    this.netAllocated = null;
    this.voucherFirst = false;
    this.btnFlag = {
      ...this.btnFlag,
      delete: false,
    };
    this.GetGridListData(null);
  }

  GetCustomerSupplierFilter() {
    let queryString = '';
    if (this.VAForm.controls['RadioType'].value == 'Suppliers') {
      if (this.VAForm.controls['SelectSupplierAC'].valid) {
        this.VAForm.controls['allocationVoucherVoucherAccNo'].setValue(
          this.VAForm.controls['SelectSupplierAC'].value
        );
        queryString +=
          ` &&  AccountsTransactionsAllocBalance > 0 && (AccountsTransactionsAccNo.Contains("` +
          this.VAForm.controls['SelectSupplierAC'].value +
          `"))`;
      }
    } else {
      if (this.VAForm.controls['SelectCustomerAC'].valid) {
        this.VAForm.controls['allocationVoucherVoucherAccNo'].setValue(
          this.VAForm.controls['SelectCustomerAC'].value
        );
        queryString +=
          `  && AccountsTransactionsAllocBalance > 0  && (AccountsTransactionsAccNo.Contains("` +
          this.VAForm.controls['SelectCustomerAC'].value +
          `"))`;
      }
    }

    return queryString;
  }

  LoadVoucherAllocationList() {
    const ref = this.dialogService.open(VoucherAllocationListComponent, {
      data: {
        id: '51gF3',
      },
      header: 'Voucher Allocation List',
      width: '70%',
    });
    ref.onClose.subscribe((data) => {
      if (!data) {
        return;
      }
      this.btnFlag = {
        new: true,
        edit: true,
        cancel: true,
        save: false,
        update: false,
        delete: true,
        print: true,
        printPreview: true,
      };
      this.GetSpecificVoucherAllocation(data);
    });
  }

  // ReleaseAllocations() {
  //   console.log('Release Allocations',this.VAForm.value,);
  //   let voucherNo = 'yascbakbc';
  //   if (voucherNo === '' || voucherNo === null || voucherNo === undefined) {
  //     Swal.fire({
  //       title: 'Error',
  //       text: 'You must have a selected Voucher to Delete.',
  //       icon: 'error',
  //     });
  //     return;
  //   } else {
  //     this.confirmation.confirm({
  //       key: 'confirm-key',
  //       message: 'Do you want to Deleted?',
  //       accept: () => {
  //         this.accService
  //           .DeleteAllocationVoucher(
  //             this.VAForm.value.allocationVoucherVoucherNo,
  //             'Allocation'
  //           )
  //           .subscribe((res: ApiResponse<any>) => {
  //             if (res.valid) {
  //               Swal.fire({
  //                 title: 'Success',
  //                 text: 'Selected Voucher Allocation were Deleted Successfully.',
  //                 icon: 'success',
  //               });
  //             } else {
  //               Swal.fire({
  //                 title: 'Error',
  //                 text: 'Selected Voucher Allocation were not Deleted Successfully.',
  //                 icon: 'error',
  //               });
  //             }
  //           });
  //       },
  //     });
  //     this.new()
  //   }
  // }
ReleaseAllocations() {
  const rawForm = this.VAForm.getRawValue();
  const allocationId = Number(
    rawForm?.allocationVoucherId ||
      this.VAForm.controls['allocationVoucherId']?.value ||
      0
  );

  console.log('Release Allocations', rawForm);

  if (allocationId <= 0) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Load the allocation voucher from the list before release.',
    });
    return;
  }

  this.accService.GetSpecificVoucherAllocation(allocationId).subscribe(
    (allocationResponse: ApiResponse<any>) => {
      const sourceForm = (
        allocationResponse?.result?.allocationVoucherVcreation || ''
      ).trim();

      if (!this.canReleaseFromCommonAllocationPage(sourceForm)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: `This allocation was created from ${this.getReleaseSourceLabel(
            sourceForm
          )}. Please release it from that page.`,
        });
        return;
      }

      // Confirmation dialog
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to release this allocation?',
        accept: () => {
          const releasePayload = {
            allocationVoucherId: allocationId,
          };

          this.isReleasing = true;
          this.accService
            .ReleaseVoucherAllocation(releasePayload)
            .subscribe(
              (response: ApiResponse<any>) => {
                this.isReleasing = false;

                if (response?.valid) {
                  const successMessage =
                    response.result ||
                    response.message ||
                    'Voucher allocation released successfully.';

                  this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: successMessage,
                  });

                  this.reloadCurrentAccountTransactions();
                  return;
                }

                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail:
                    response?.message ||
                    'Unable to release voucher allocation.',
                });
              },
              () => {
                this.isReleasing = false;
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Unable to release voucher allocation.',
                });
              }
            );
        },
      });
    },
    () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to verify the allocation source before release.',
      });
    }
  );
}

  private canReleaseFromCommonAllocationPage(sourceForm: string): boolean {
    if (!sourceForm || sourceForm.toUpperCase() === 'ACCFORM') {
      return true;
    }

    return Object.values(AllocationSourceType).includes(
      sourceForm as AllocationSourceType
    );
  }

  private getReleaseSourceLabel(sourceForm: string): string {
    switch (sourceForm) {
      case AllocationSourceType.CommonAllocation:
        return 'Allocation Voucher page';
      case AllocationSourceType.PaymentVoucher:
        return 'Payment Voucher Allocation Details page';
      case AllocationSourceType.ReceiptVoucher:
        return 'Receipt Voucher Allocation Details page';
      case AllocationSourceType.BankPaymentVoucher:
        return 'Bank Payment Voucher Allocation Details page';
      case AllocationSourceType.BankReceiptVoucher:
        return 'Bank Receipt Voucher Allocation Details page';
      default:
        return 'the original allocation page';
    }
  }

  private hasActiveAllocationDetails(details: any[]): boolean {
    if (!Array.isArray(details) || !details.length) {
      return false;
    }

    return details.some(
      (detail: any) =>
        Number(detail?.allocationVoucherDetailsAllocDebit || 0) > 0 ||
        Number(detail?.allocationVoucherDetailsAllocCredit || 0) > 0
    );
  }

  GetSpecificVoucherAllocation(id) {
    if (!id) {
      return;
    }

    this.accService
      .GetSpecificVoucherAllocation(id)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result) {
          const result = response.result;
          const accNo = (result.allocationVoucherVoucherAccNo || '')
            .toString()
            .trim();
          const details: any[] = Array.isArray(result.voucherAllocationDetails)
            ? result.voucherAllocationDetails
            : [];
          const allTransactions: any[] = Array.isArray(
            result.accountsTransactions
          )
            ? result.accountsTransactions
            : [];

          const linkedTransIds = new Set<number>(
            details
              .map((d: any) => Number(d?.allocationVoucherDetailsTransSno || 0))
              .filter((transSno: number) => transSno > 0)
          );
          const linkedVoucherNos = new Set<string>(
            details
              .map((d: any) =>
                (d?.allocationVoucherDetailsVno || '').toString().trim().toUpperCase()
              )
              .filter((vno: string) => !!vno)
          );

          const filteredTransactions = details.length
            ? allTransactions.filter((t: any) => {
                const transSno = Number(t?.accountsTransactionsTransSno || 0);
                const vno = (t?.accountsTransactionsVoucherNo || '')
                  .toString()
                  .trim()
                  .toUpperCase();
                if (linkedTransIds.size > 0 && linkedTransIds.has(transSno)) {
                  return true;
                }
                if (linkedTransIds.size === 0 && vno && linkedVoucherNos.has(vno)) {
                  return true;
                }
                return details.some((d: any) => {
                  const detailTransSno = Number(
                    d?.allocationVoucherDetailsTransSno || 0
                  );
                  const detailVno = (d?.allocationVoucherDetailsVno || '')
                    .toString()
                    .trim()
                    .toUpperCase();
                  return detailTransSno <= 0 && !!detailVno && detailVno === vno;
                });
              })
            : [];

          const mappedTransactions = filteredTransactions.map((t: any) => {
            const transSno = Number(t?.accountsTransactionsTransSno || 0);
            const vno = (t?.accountsTransactionsVoucherNo || '')
              .toString()
              .trim()
              .toUpperCase();
            const matchedDetail = details.find((d: any) => {
              const detailTransSno = Number(
                d?.allocationVoucherDetailsTransSno || 0
              );
              const detailVno = (d?.allocationVoucherDetailsVno || '')
                .toString()
                .trim()
                .toUpperCase();
              return (
                (detailTransSno > 0 && detailTransSno === transSno) ||
                (!!detailVno && detailVno === vno)
              );
            });
            const detailAllocAmount = Number(
              matchedDetail?.allocationVoucherDetailsAllocDebit ||
                matchedDetail?.allocationVoucherDetailsAllocCredit ||
                0
            );

            return {
              ...t,
              netAllocation: detailAllocAmount,
            };
          });

          const isCustomerAccount =
            (this.customerDropdown || []).some(
              (c: any) => c?.value && String(c.value).trim() === accNo
            ) ||
            mappedTransactions.some(
              (t: any) =>
                t?.accountsTransactionsVoucherType === Allocations.SALESVOUCHER ||
                t?.accountsTransactionsVoucherType === Allocations.ISSUEVOUCHER
            );
          const radioType = isCustomerAccount ? 'Customers' : 'Suppliers';

          this.VAForm.reset();
          this.VAForm.controls['RadioType'].setValue(radioType);
          this.VAForm.controls['SelectCustomerAC'].setValue(
            isCustomerAccount ? accNo : ''
          );
          this.VAForm.controls['SelectSupplierAC'].setValue(
            !isCustomerAccount ? accNo : ''
          );
          this.VAForm.controls['allocationVoucherVcreation'].setValue(
            result.allocationVoucherVcreation
          );
          this.VAForm.controls['allocationVoucherVoucherNo'].setValue(
            result.allocationVoucherVoucherNo
          );
          this.VAForm.controls['allocationVoucherId'].setValue(
            result.allocationVoucherId ?? 0
          );
          this.VAForm.controls['allocationVoucherVoucherAccNo'].setValue(accNo);
          this.VAForm.controls['allocationVoucherVoucherAccType'].setValue(
            result.allocationVoucherVoucherAccType
          );
          this.VAForm.controls['allocationVoucherDescription'].setValue(
            result.allocationVoucherDescription || ''
          );
          this.VAForm.controls['allocationVoucherVoucherDate'].setValue(
            result.allocationVoucherVoucherDate
              ? new Date(result.allocationVoucherVoucherDate)
              : new Date()
          );

          this.loadedVoucherHasActiveAllocations =
            this.hasActiveAllocationDetails(details);

          const voucherList = mappedTransactions.filter((transaction) =>
            Object.values(Allocations).includes(
              transaction.accountsTransactionsVoucherType
            )
          );
          const accountVList = mappedTransactions.filter(
            (transaction) =>
              !Object.values(Allocations).includes(
                transaction.accountsTransactionsVoucherType
              )
          );

          this.dataset = this.IsSelectedInArray(accountVList);
          this.datasetVoucher = this.IsSelectedInArray(voucherList);
          // mark fully allocated rows when loading a saved allocation (read-only reference)
          this.refreshAllocationState(this.dataset);
          this.refreshAllocationState(this.datasetVoucher);

          const totalAllocDebit = details.reduce(
            (sum: number, d: any) =>
              sum + Number(d?.allocationVoucherDetailsAllocDebit || 0),
            0
          );
          const totalAllocCredit = details.reduce(
            (sum: number, d: any) =>
              sum + Number(d?.allocationVoucherDetailsAllocCredit || 0),
            0
          );
          this.totalDebit = Number(totalAllocDebit.toFixed(2));
          this.totalCredit = Number(totalAllocCredit.toFixed(2));
          this.updateTotalBalance();
        }
      });
  }

  // Refresh allocation state for rows so allocation controls and selection reflect current status
  private refreshAllocationState(list?: any[]) {
    const rows = list ?? [...(this.dataset || []), ...(this.datasetVoucher || [])];
    if (!rows || !Array.isArray(rows)) return;

    rows.forEach((x: any) => {
      if (x.openBalance == null || isNaN(Number(x.openBalance))) {
        const remainingBalance = Number(
          x.accountsTransactionsAllocationbalance ??
            x.accountsTransactionsAllocBalance ??
            0
        );
        const netAlloc = Number(x.netAllocation || 0);
        x.openBalance = Number((remainingBalance + netAlloc).toFixed(2));
      }
      const remainingBalance = this.getRemainingBalance(x);
      const netAlloc = Number(x.netAllocation) || 0;
      const currentlySelected = x.IsSelected === true;

      x.isAllocated = x.openBalance <= 0;
      x.isFullyAllocated = x.openBalance <= 0;
      x.isSelectable = x.openBalance > 0;
      x.allocationStatus = x.isAllocated ? 'Allocated' : 'Unallocated';
      x.IsSelected = currentlySelected || netAlloc > 0;
    });
  }

  isRowSelectable(row: any): boolean {
    if (this.loadedVoucherHasActiveAllocations) {
      return false;
    }
    return !!row && row.isSelectable === true;
  }

  new() {
    this.VAForm.reset();
    this.VAForm.enable();
    this.loadedVoucherHasActiveAllocations = false;
    this.dataset = [];
    this.datasetVoucher = [];
    this.totalBalance = 0;
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.btnFlag = {
      new: true,
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      print: false,
      printPreview: false,
    };
    this.VAForm.controls['RadioType'].setValue('Suppliers');
    this.VAForm.controls['allocationVoucherVoucherDate'].setValue(new Date());
    this.VAForm.controls['allocationVoucherVcreation'].setValue(
      AllocationSourceType.CommonAllocation
    );
  }
  edit() {
    const voucherNo =
      this.VAForm.controls['allocationVoucherVoucherNo'].value || 'this voucher';

    if (this.loadedVoucherHasActiveAllocations) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `This voucher is already allocated with ${voucherNo}. To edit, release it first!`,
      });
      return;
    }

    this.VAForm.enable();
  }
}
interface ButtonFlag {
  new?: boolean;
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  print?: boolean;
  printPreview?: boolean;
}
