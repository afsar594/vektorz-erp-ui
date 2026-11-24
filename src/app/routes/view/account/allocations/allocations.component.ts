import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import {
  ConfirmationService,
  DialogService,
  DynamicDialogRef,
  MessageService,
} from 'primeng';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { AllocationSourceType } from 'src/app/routes/domain/Accounts/allocation-source-type.enum';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';

@Component({
  selector: 'app-allocations',
  templateUrl: './allocations.component.html',
  styleUrls: ['./allocations.component.scss'],
})
export class AllocationsComponent implements OnInit {
  @Input() data: any;
  submitted: boolean = false;
  severity: string;
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
  totalDebit: number = 0;
  totalCredit: number = 0;
  totalBalance: number = 0;
  total_Debit: number = 0;
  total_Credit: number = 0;
  voucherNo: any;
  @Output() dataEvent = new EventEmitter<any>();
  @Output() allocationChanged = new EventEmitter<string>();
  fromVoucher: any;
  refNO: any;
  accNO: any;
  totalAllocated: number = 0;
  remainingBalance: number = 0;
  confirmDropDatabaseDialogVisible: boolean = false;
  voucherID: number;
  isReleasing: boolean = false;
  constructor(
    private fb: FormBuilder,

    private messageService: MessageService,
    private accService: AccountstatementService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    private confirmationService: ConfirmationService
  ) { }

  ngOnChanges() {
    this.fromVoucher = this.data.vType;
    this.accNO = this.data.accNO;
    this.refNO = this.data.refNO;
    this.total_Debit = Number(
      this.data.accountsTransactionsAllocBalance || this.data.debit || 0
    );
    this.totalDebit = this.total_Debit;
    this.voucherNo = this.data.accountsTransactionsVoucherNo;
    if (this.VAForm) {
      this.VAForm
        .get('allocationVoucherVcreation')
        .setValue(this.getAllocationSourceForm());
    }
    if (this.data) this.getAllocationDetails();
    this.total_Credit = 0;
    console.log(this.data,'Total Credit initialized to 0');
  }

  ngOnInit(): void {
    this.cols = [
      { field: 'isSelected', header: 'Select' },
      { field: 'transNo', header: 'ID' },
      { field: 'transDate', header: 'Date' },
      { field: 'voucherNo', header: 'V No' },
      { field: 'type', header: 'Type' },
      { field: 'debit', header: 'Debit' },
      { field: 'credit', header: 'Credit' },
      { field: 'allocAmount', header: 'Allocation Amt' },
      { field: 'balance', header: 'Balance' },
      { field: 'netAllocation', header: 'Net Allocation' },
      { field: 'remainingBalance', header: 'Remaining Balance' },
      { field: 'allocationStatus', header: 'Allo. Status' },
    ];
    this.loadVAForm();
  }

  get isPaymentFlow(): boolean {
    return ['PAYMENT', 'BANK PAYMENT'].includes(
      (this.fromVoucher || '').toUpperCase()
    );
  }

  get isReceiptFlow(): boolean {
    return ['RECEIPT', 'BANK RECEIPT'].includes(
      (this.fromVoucher || '').toUpperCase()
    );
  }

  get isSourceVoucherFlow(): boolean {
    return this.isPaymentFlow || this.isReceiptFlow;
  }

  get currentAllocationId(): number {
    return Number(this.data?.allocationId || 0);
  }

  get displayedDataset(): any[] {
    if (!Array.isArray(this.dataset)) {
      return [];
    }

    return this.dataset;
  }

  get displayDebitTotal(): number {
    if (this.currentAllocationId > 0 && this.isPaymentFlow) {
      return Number(this.remainingBalance || 0);
    }

    return this.total_Debit;
  }

  get displayCreditTotal(): number {
    if (this.currentAllocationId > 0 && this.isReceiptFlow) {
      return Number(this.remainingBalance || 0);
    }

    return this.total_Credit;
  }

  get canReleaseAllocation(): boolean {
    if (!Array.isArray(this.dataset) || !this.dataset.length) {
      return false;
    }

    return this.dataset.some((row) => {
      if (this.isSourceVoucherRow(row)) {
        return false;
      }

      const allocatedAmount = Number(
        row?.allocAmount ?? row?.netAllocation ?? 0
      );
      const allocationStatus = (row?.allocationStatus || '').toUpperCase();

      return allocatedAmount > 0 || ['FULL', 'PARTIAL'].includes(allocationStatus);
    });
  }

  get tableDebitTotal(): number {
    return this.displayedDataset.reduce(
      (sum, row) => sum + Number(row?.debit || 0),
      0
    );
  }

  get tableCreditTotal(): number {
    return this.displayedDataset.reduce(
      (sum, row) => sum + Number(row?.credit || 0),
      0
    );
  }

  get currentVoucherNo(): string {
    return (
      this.VAForm?.get('allocationVoucherVoucherNo')?.value ||
      this.data?.allocationVoucherVoucherNo ||
      ''
    )
      .toString()
      .trim();
  }

  private setAllocationVoucherNo(allocationResponse: any) {
    this.VAForm
      ?.get('allocationVoucherVoucherNo')
      ?.setValue(
        allocationResponse?.allocationVoucherVoucherNo ||
          allocationResponse?.allocationVoucherNo ||
          ''
      );
  }

  loadVAForm() {
    this.VAForm = this.fb.group({
      allocationVoucherVoucherNo: new FormControl(''),
      allocationVoucherId: new FormControl(0),
      allocationVoucherVoucherDate: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      allocationVoucherVcreation: new FormControl(this.getAllocationSourceForm()),
      SelectCustomerAC: new FormControl(
        this.isPaymentFlow ? '' : this.accNO
      ),
      SelectSupplierAC: new FormControl( 
        this.isPaymentFlow ? this.accNO : ''
      ),
      AllocationVoucherTotalDebit: new FormControl(''),
      AllocationVoucherTotalCredit: new FormControl(''),
      AllocationVoucherTotal: new FormControl(''),
      allocationVoucherVoucherAccNo: new FormControl(this.accNO || ''),
      allocationVoucherVoucherAccType: new FormControl(''),
      allocationVoucherDescription: new FormControl(''),
      VoucherAllocationDetails: this.fb.array([]),
    });
  }

  private getAllocationSourceForm(): string {
    const sourceForm = (this.data?.allocationVoucherVcreation || '').trim();

    return Object.values(AllocationSourceType).includes(
      sourceForm as AllocationSourceType
    )
      ? sourceForm
      : '';
  }

  private getExpectedReleaseSourceForm(): string {
    switch ((this.fromVoucher || '').toUpperCase()) {
      case 'PAYMENT':
        return AllocationSourceType.PaymentVoucher;
      case 'RECEIPT':
        return AllocationSourceType.ReceiptVoucher;
      case 'BANK PAYMENT':
        return AllocationSourceType.BankPaymentVoucher;
      case 'BANK RECEIPT':
        return AllocationSourceType.BankReceiptVoucher;
      default:
        return '';
    }
  }

  private canReleaseFromCurrentPage(sourceForm: string): boolean {
    if (!sourceForm || sourceForm.toUpperCase() === 'ACCFORM') {
      return true;
    }

    return sourceForm === this.getExpectedReleaseSourceForm();
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

  private isSourceVoucherRow(row: any): boolean {
    return (
      (row?.voucherNo || '').toUpperCase() ===
        (this.refNO || '').toUpperCase() &&
      (row?.type || '').toUpperCase() ===
        (this.fromVoucher || '').toUpperCase()
    );
  }

  private isFullyAllocatedTargetRow(row: any): boolean {
    const rowType = (row?.type || '').toUpperCase();
    const remainingBalance = Number(row?.remainingBalance ?? row?.balance ?? 0);
    const allocationStatus = (row?.allocationStatus || '').toUpperCase();

    return (
      ((this.isPaymentFlow && rowType === 'PURCHASEVOUCHER') ||
        (this.isReceiptFlow && rowType === 'SALESVOUCHER')) &&
      remainingBalance <= 0 &&
      allocationStatus === 'FULL'
    );
  }

  private syncRowRemainingBalance(row: any) {
    const rowType = (row?.type || '').toUpperCase();
    const openBalance = Number(
      row?.openBalance ?? row?.tempbalance ?? row?.balance ?? 0
    );
    const netAllocation = Number(row?.netAllocation || 0);

    if (['PAYMENT', 'BANK PAYMENT'].includes(rowType)) {
      row.remainingBalance = Number(
        row?.remainingDebit ?? row?.balance ?? row?.debit ?? 0
      );
      return;
    }

    if (['RECEIPT', 'BANK RECEIPT'].includes(rowType)) {
      row.remainingBalance = Number(
        row?.remainingCredit ?? row?.balance ?? row?.credit ?? 0
      );
      return;
    }

    if (['PURCHASEVOUCHER', 'SALESVOUCHER'].includes(rowType)) {
      row.remainingBalance = Number(
        Math.max(openBalance - netAllocation, 0).toFixed(2)
      );
      return;
    }

    row.remainingBalance = Number(row?.balance ?? openBalance);
  }

  isSelectedInArray(data: any) {
    const sourceVoucherNo = (this.refNO || '').toUpperCase();
    const sourceVoucherType = (this.fromVoucher || '').toUpperCase();

    return data
      .map((obj: any) => {
        const rowType = (obj.type || '').toUpperCase();
        const rowVoucherNo = (obj.voucherNo || '').toUpperCase();
        const allocationAmount = Number(
          obj.allocAmount || obj.netAllocation || 0
        );

        obj.isSelected =
          rowVoucherNo === sourceVoucherNo && rowType === sourceVoucherType;

        obj.allocAmount = Number(obj.allocAmount || 0);
        obj.debit = Number(obj.debit || 0);
        obj.credit = Number(obj.credit || 0);
        obj.isDisabled = !!obj.isDisabled;
        obj.allocationStatus = obj.allocationStatus || '';
        obj.openBalance = Number(obj.balance || 0);
        obj.tempbalance = obj.openBalance;
        obj.balance = obj.openBalance;
        obj.netAllocation = Number(obj.netAllocation || 0);
        obj.originalDebit = Number(obj.debit || 0);
        obj.originalCredit = Number(obj.credit || 0);

        if (rowType === 'PURCHASEVOUCHER') {
          obj.originalCredit = Number(
            (Number(obj.balance || 0) + allocationAmount).toFixed(2)
          );
          obj.credit = obj.originalCredit;
        } else if (rowType === 'SALESVOUCHER') {
          obj.originalDebit = Number(
            (Number(obj.balance || 0) + allocationAmount).toFixed(2)
          );
          obj.debit = obj.originalDebit;
        }

        if (['PAYMENT', 'BANK PAYMENT'].includes(rowType)) {
          obj.remainingDebit = Number(
            obj.balance ?? obj.originalDebit ?? obj.debit ?? 0
          );
        } else if (['RECEIPT', 'BANK RECEIPT'].includes(rowType)) {
          obj.remainingCredit = Number(
            obj.balance ?? obj.originalCredit ?? obj.credit ?? 0
          );
        }

        this.syncRowRemainingBalance(obj);

        if (obj.isSelected) {
          obj.selectionOrder = ++this.selectionCounter;
        }

        return obj;
      })
      .sort((a: any, b: any) => Number(b.isSelected) - Number(a.isSelected));
  }

  isDisabled(row: any): boolean {
    if (
      (row.type.toUpperCase() === 'PURCHASEVOUCHER' ||
        row.type.toUpperCase() === 'SalesVoucher') &&
      Number(row.allocAmount || 0) > 0
    ) {
      return true;
    }
    // if (
    //   row.type.toUpperCase() === 'PAYMENT' &&
    //   Number(row.remainingDebit || 0) === 0
    // ) {
      //   return true;
      // }
      return false;
    }

  shouldHighlightRow(row: any): boolean {
    const rowType = (row?.type || '').toUpperCase();
    if (
      ['PAYMENT', 'BANK PAYMENT', 'RECEIPT', 'BANK RECEIPT'].includes(rowType)
    ) {
      return false;
    }

    const remainingBalance = Number(row?.remainingBalance ?? row?.balance ?? 0);
    const allocationStatus = (row?.allocationStatus || '').toUpperCase();

    return allocationStatus === 'FULL' && remainingBalance <= 0;
  }

  CheckAllCheckBox(event: any) {
    this.dataset.forEach((c: any) => {
      c.isSelected = event.target.checked;
      if (event.target.checked) {
        if (!this.IdsArray.includes(c.transNo)) {
          this.IdsArray.push(c.transNo);
        }
      } else {
        this.IdsArray = [];
      }
    });
  }

  onNetAllocationChange(
    event: any,
    isSelected: boolean,
    newValue: number,
    transNo: number
  ) {
    const enteredValue = Number(newValue) || 0;

    const upperVoucher = this.fromVoucher?.toUpperCase();
    const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);

    const fromTypes = isPaymentFlow
      ? ['PAYMENT', 'BANK PAYMENT']
      : ['RECEIPT', 'BANK RECEIPT'];

    const currentRow = this.dataset?.find((r) => r.transNo === transNo);
    if (!currentRow) return;

    const rowType = (currentRow.type || '').toUpperCase();

    if (fromTypes.includes(rowType)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Allocation can only be entered on target vouchers.',
      });
      return;
    }

    const fromVouchers = this.dataset.filter(
      (v) => fromTypes.includes(v.type?.toUpperCase()) && v.isSelected
    );

    if (!fromVouchers.length) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Select at least one source voucher first.',
      });
      currentRow.netAllocation = 0;
      currentRow.isSelected = false;
      return;
    }

    const baseTargetBalance = isPaymentFlow
      ? Number(currentRow.openBalance ?? currentRow.tempbalance ?? currentRow.balance ?? 0)
      : Number(currentRow.openBalance ?? currentRow.tempbalance ?? currentRow.balance ?? 0);

    if (enteredValue > baseTargetBalance) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Entered amount exceeds target voucher balance.',
      });

      currentRow.netAllocation = 0;
      currentRow.isSelected = false;
      currentRow.balance = Number(
        currentRow.openBalance ?? currentRow.tempbalance ?? currentRow.balance ?? 0
      );
      this.syncRowRemainingBalance(currentRow);
      this.recalculateTotals();
      return;
    }

    currentRow.netAllocation = enteredValue;
    currentRow.balance = Number(baseTargetBalance.toFixed(2));
    currentRow.isSelected = enteredValue > 0;
    this.syncRowRemainingBalance(currentRow);

    this.recalculateManualSelections(currentRow);

    this.dataEvent.emit(this.dataset);
  }

  private recalculateManualSelections(changedRow?: any) {
    const upperVoucher = this.fromVoucher?.toUpperCase();
    const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);
    const fromTypes = isPaymentFlow
      ? ['PAYMENT', 'BANK PAYMENT']
      : ['RECEIPT', 'BANK RECEIPT'];
    const toType = isPaymentFlow ? 'PURCHASEVOUCHER' : 'SALESVOUCHER';
    const remainingKey = isPaymentFlow ? 'remainingDebit' : 'remainingCredit';

    const fromVouchers = (this.dataset || [])
      .filter((v) => fromTypes.includes(v.type?.toUpperCase()) && v.isSelected)
      .sort((a, b) => (a.selectionOrder || 0) - (b.selectionOrder || 0));

    if (!fromVouchers.length) {
      this.totalAllocated = 0;
      this.remainingBalance = 0;
      this.recalculateTotals();
      return;
    }

    (this.dataset || []).forEach((v) => {
      const t = (v.type || '').toUpperCase();
      if (fromTypes.includes(t)) {
        v[remainingKey] = Number(
          Number(
            v.openBalance ??
              v.balance ??
              (isPaymentFlow
                ? v.originalDebit ?? v.debit ?? 0
                : v.originalCredit ?? v.credit ?? 0)
          ).toFixed(2)
        );
      } else if (t === toType) {
        v.balance = Number(Number(v.openBalance ?? v.tempbalance ?? 0).toFixed(2));
        if (!v.isSelected) {
          v.netAllocation = 0;
        }
      }
      this.syncRowRemainingBalance(v);
    });

    let totalAllocated = 0;
    let sourceExceeded = false;
    const targetRows = (this.dataset || [])
      .filter((v) => v.type?.toUpperCase() === toType && v.isSelected)
      .sort((a, b) => (a.selectionOrder || 0) - (b.selectionOrder || 0));

    for (const target of targetRows) {
      const baseTargetBalance = Number(
        target.openBalance ?? target.tempbalance ?? target.balance ?? 0
      );
      const requestedAllocation = Math.max(
        0,
        Math.min(Number(target.netAllocation || 0), baseTargetBalance)
      );

      let pendingAllocation = requestedAllocation;
      let actualAllocation = 0;

      for (const source of fromVouchers) {
        const available = Number(source[remainingKey] || 0);
        if (available <= 0 || pendingAllocation <= 0) {
          continue;
        }

        const allocateNow = Math.min(available, pendingAllocation);
        source[remainingKey] = Number((available - allocateNow).toFixed(2));
        pendingAllocation = Number((pendingAllocation - allocateNow).toFixed(2));
        actualAllocation = Number((actualAllocation + allocateNow).toFixed(2));
      }

      if (pendingAllocation > 0) {
        sourceExceeded = true;
      }

      target.netAllocation = actualAllocation;
      target.balance = Number(baseTargetBalance.toFixed(2));
      this.syncRowRemainingBalance(target);
      totalAllocated = Number((totalAllocated + actualAllocation).toFixed(2));
    }

    this.totalAllocated = totalAllocated;
    this.remainingBalance = Number(
      fromVouchers
        .reduce((sum, source) => sum + Number(source[remainingKey] || 0), 0)
        .toFixed(2)
    );

    if (sourceExceeded) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Entered amount exceeds available source voucher balance.',
      });
    }

    this.recalculateTotals();
  }

  patchValues(e: any) {
    return this.fb.group({
      AccountsTransactionsTransSno: e.transNo,
      AccountsTransactionsAllocBalance: e.balance,
      AllocationVoucherDetailsVno: e.voucherNo,
      AllocationVoucherDetailsAllocDebit: e.debit,
      AllocationVoucherDetailsAllocCredit: e.credit,
      AllocationVoucherDetailsRefVType: e.type,
      AllocationVoucherDetailsNetAllocation: parseFloat(e?.netAllocation) || 0,
      RefSPDate: e.transDate,
      AllocationVoucherDetailsAccNo: this.accNO,
      RefSPAccountNo: this.accNO,
    });
  }

  ReleaseVoucherAllocation() {
    const data = (this.dataset || []).filter((row) => {
      if (this.isSourceVoucherRow(row)) {
        return false;
      }

      const allocatedAmount = Number(row?.allocAmount ?? row?.netAllocation ?? 0);
      const allocationStatus = (row?.allocationStatus || '').toUpperCase();

      return allocatedAmount > 0 || ['FULL', 'PARTIAL'].includes(allocationStatus);
    });

    if (!data.length) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No allocated vouchers are available to release.',
      });
      return;
    }

    const sourceRow = this.dataset?.find((row) => this.isSourceVoucherRow(row));
    const allocationId = Number(
      sourceRow?.allocationId || this.currentAllocationId || 0
    );

    if (allocationId <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Allocation id was not found for this voucher.',
      });
      return;
    }

    const control = <FormArray>this.VAForm.get('VoucherAllocationDetails');
    control.clear();
    this.VAForm.get('allocationVoucherId').setValue(allocationId);
    this.accService.GetSpecificVoucherAllocation(allocationId).subscribe(
      (allocationResponse: ApiResponse<any>) => {
        this.setAllocationVoucherNo(allocationResponse?.result);

        const sourceForm = (
          allocationResponse?.result?.allocationVoucherVcreation || ''
        ).trim();

        if (!this.canReleaseFromCurrentPage(sourceForm)) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: `This allocation was created from ${this.getReleaseSourceLabel(
              sourceForm
            )}. Please release it from that page.`,
          });
          return;
        }

        this.confirmationService.confirm({
          key: 'confirm-key',
          message: `Do you want to release ${this.currentVoucherNo || 'this voucher'} allocation?`,
          accept: () => {
            this.isReleasing = true;
            this.accService
              .ReleaseVoucherAllocation(this.VAForm.value)
              .subscribe(
                (response: ApiResponse<any>) => {
                  this.isReleasing = false;

                  if (response.valid) {
                    const successMessage =
                      response.result ||
                      response.message ||
                      'Voucher allocation released successfully.';

                    this.totalDebit = 0;
                    this.totalCredit = 0;
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Success',
                      detail: successMessage,
                    });
                    this.allocationChanged.emit('released');
                    this.getAllocationDetails();
                    return;
                  }

                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail:
                      response.message || 'Unable to release voucher allocation.',
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

  isValidVouchers(): boolean {
    return true;
  }

  VoucherAllocationFormSubmit() {
    if (this.remainingBalance > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Remaining balance is not zero.',
      });
      return;
    }
    this.VAForm.get('allocationVoucherId').setValue(0);
    if (
      this.total_Credit > 0 &&
      this.total_Debit > 0 &&
      this.total_Credit === this.total_Debit
    ) {
      this.VAForm.get('allocationVoucherVoucherAccNo').setValue(
        this.accNO || ''
      );

      const data = this.dataset?.filter((x) => x.isSelected == true);
      const control = <FormArray>this.VAForm.get('VoucherAllocationDetails');
      control.clear();
      data.forEach((x) => {
        if (x.isSelected) {
          const isPaymentOrReceipt = [
            'PAYMENT',
            'BANK PAYMENT',
            'RECEIPT',
            'BANK RECEIPT',
          ].includes(x.type?.toUpperCase());

          x.netAllocation = isPaymentOrReceipt
            ? this.totalAllocated
            : x.netAllocation;
          control.push(this.patchValues(x));
        }
      });

      this.confirmationService.confirm({
        key: 'confirm-key',
        message: 'Do you want to Save the selected voucher?',
        accept: () => {
          this.accService
            .AddEditVoucherAllocation(this.VAForm.value)
            .subscribe((response: ApiResponse<any>) => {
              if (response.valid && response.result) {
                this.totalDebit = 0;
                this.totalCredit = 0;
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message,
                });
                this.allocationChanged.emit('saved');
                this.getAllocationDetails();
              }
            });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Sorry! Debit and Credit do not match.',
      });
    }
  }

  getAllocationDetails() {
    this.VAForm
      .get('allocationVoucherVoucherNo')
      .setValue('');
    const allocationRequest = this.isPaymentFlow
      ? this.accService.getPaymentAllocationVoucherDetails(
          this.accNO,
          this.refNO,
          this.fromVoucher
        )
      : this.accService.getAllocationVoucherDetails(
          this.accNO,
          this.refNO,
          this.fromVoucher
        );

    allocationRequest
      .subscribe((response: ApiResponse<any>) => {
        const result = Array.isArray(response?.result) ? response.result : [];
        this.totalCredit = 0;
        this.totalDebit = 0;
        this.total_Credit = 0;
        this.total_Debit = 0;
        this.totalAllocated = 0;
        this.totalBalance = 0;
        this.selectionCounter = 0;
        this.dataset = this.isSelectedInArray(result);
        this.recalculateAllocation();
        if (this.currentAllocationId > 0) {
          this.accService
            .GetSpecificVoucherAllocation(this.currentAllocationId)
            .subscribe((allocationResponse: ApiResponse<any>) => {
              this.setAllocationVoucherNo(allocationResponse?.result);
            });
        }
      });
  }

  AutoAllocateVouchers() {
    // --- Auto Allocate Logic (follow VoucherAllocationFormSubmit logic) ---
    const upperVoucher = this.fromVoucher?.toUpperCase();
    const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);
    const fromTypes = isPaymentFlow
      ? ['PAYMENT', 'BANK PAYMENT']
      : ['RECEIPT', 'BANK RECEIPT'];
    const toType = isPaymentFlow ? 'PURCHASEVOUCHER' : 'SALESVOUCHER';

    // Reset all allocations and selections
    (this.dataset || []).forEach((v) => {
      v.isSelected = false;
      v.netAllocation = 0;
      if (['PAYMENT', 'BANK PAYMENT'].includes((v.type || '').toUpperCase())) {
        v.remainingDebit = Number(
          Number(
            v.openBalance ?? v.balance ?? v.originalDebit ?? v.debit ?? 0
          ).toFixed(2)
        );
      } else if (
        ['RECEIPT', 'BANK RECEIPT'].includes((v.type || '').toUpperCase())
      ) {
        v.remainingCredit = Number(
          Number(
            v.openBalance ?? v.balance ?? v.originalCredit ?? v.credit ?? 0
          ).toFixed(2)
        );
      } else if ((v.type || '').toUpperCase() === 'PURCHASEVOUCHER') {
        v.balance = Number(Number(v.openBalance ?? v.tempbalance ?? 0).toFixed(2));
      } else if ((v.type || '').toUpperCase() === 'SALESVOUCHER') {
        v.balance = Number(Number(v.openBalance ?? v.tempbalance ?? 0).toFixed(2));
      }
      this.syncRowRemainingBalance(v);
    });

    // Select all from vouchers
    const fromVouchers = (this.dataset || []).filter((v) =>
      fromTypes.includes(v.type?.toUpperCase())
    );
    fromVouchers.forEach((v) => (v.isSelected = true));

    // Select all to vouchers
    const toVouchers = (this.dataset || []).filter(
      (v) => v.type?.toUpperCase() === toType
    );
    toVouchers.forEach((v) => (v.isSelected = false)); // will be set true if allocated

    let totalAllocated = 0;
    for (const to of toVouchers) {
      const baseTargetBalance = Number(
        to.openBalance ?? to.tempbalance ?? to.balance ?? 0
      );
      let balance = Number(baseTargetBalance || 0);
      if (balance <= 0) {
        to.balance = 0;
        to.netAllocation = 0;
        this.syncRowRemainingBalance(to);
        continue;
      }
      for (const from of fromVouchers) {
        const remainingKey = isPaymentFlow
          ? 'remainingDebit'
          : 'remainingCredit';
        let remaining = Number(from[remainingKey] || 0);
        if (remaining <= 0) continue;
        const allocateNow = Math.min(balance, remaining);
        from[remainingKey] = Number((remaining - allocateNow).toFixed(2));
        balance = Number((balance - allocateNow).toFixed(2));
        to.netAllocation = Number(
          ((to.netAllocation || 0) + allocateNow).toFixed(2)
        );
        totalAllocated += allocateNow;
        if (balance <= 0) break;
      }
      to.isSelected = to.netAllocation > 0;
      to.balance = Number(baseTargetBalance.toFixed(2));
      this.syncRowRemainingBalance(to);
    }

    // --- After allocation, subtract netAllocation from balance for each to voucher ---
    // for (const to of toVouchers) {
    //   if (to.isSelected && to.netAllocation > 0) {
    //     to.balance = Number(
    //       // ((Number(to.balance) || 0) - Number(to.netAllocation)).toFixed(2)
    //     );
    //   }
    // }

    this.totalAllocated = Number(totalAllocated.toFixed(2));
    this.recalculateTotals();
    this.dataEvent.emit(this.dataset);
  }

  private selectionCounter = 0;
  onVoucherSelectionChange(row: any) {
    const upperType = row.type?.toUpperCase();
    const upperVoucher = this.fromVoucher?.toUpperCase();
    const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);
    const sourceTypes = isPaymentFlow
      ? ['PAYMENT', 'BANK PAYMENT']
      : ['RECEIPT', 'BANK RECEIPT'];
    const targetTypes = isPaymentFlow
      ? ['PURCHASEVOUCHER']
      : ['SALESVOUCHER'];

    // Assign order when selected
    if (row.isSelected) {
      row.selectionOrder = ++this.selectionCounter;
    } else {
      delete row.selectionOrder;
    }

    if (
      row.isSelected &&
      targetTypes.includes(upperType) &&
      !this.dataset?.some(
        (voucher: any) =>
          sourceTypes.includes(voucher.type?.toUpperCase()) && voucher.isSelected
      )
    ) {
      this.selectSourceVoucher();
    }

    // --- Your existing code continues below ---
    const isSelected = row.isSelected;

    const voucherConfig: any = {
      PAYMENT: {
        pair: 'PURCHASEVOUCHER',
        balanceKey: 'remainingDebit',
        amountKey: 'debit',
      },
      BANK_PAYMENT: {
        pair: 'PURCHASEVOUCHER',
        balanceKey: 'remainingDebit',
        amountKey: 'debit',
      },
      RECEIPT: {
        pair: 'SALESVOUCHER',
        balanceKey: 'remainingCredit',
        amountKey: 'credit',
      },
      BANK_RECEIPT: {
        pair: 'SALESVOUCHER',
        balanceKey: 'remainingCredit',
        amountKey: 'credit',
      },
      PURCHASEVOUCHER: { balanceKey: 'credit' },
      SALESVOUCHER: { balanceKey: 'debit' },
    };

    const config = voucherConfig[upperType];
    if (!config) return;

    if (
      ['PAYMENT', 'BANK PAYMENT', 'RECEIPT', 'BANK RECEIPT'].includes(
        upperType
      ) &&
      !isSelected
    ) {
      row[config.balanceKey] = Number(row[config.amountKey] || 0);

      const anySelected = this.dataset.some(
        (v) => v.type?.toUpperCase() === upperType && v.isSelected
      );

      if (!anySelected) {
        this.resetVoucherAllocations(config.pair);
      }

      this.recalculateAllocation();
      return;
    }

    if (
      !isSelected &&
      ['PURCHASEVOUCHER', 'SALESVOUCHER'].includes(upperType)
    ) {
      row.netAllocation = 0;
      row.balance = Number(
        row.openBalance ?? row.tempbalance ?? row[config.balanceKey] ?? 0
      );
      this.syncRowRemainingBalance(row);
      this.recalculateAllocation();
      return;
    }

    this.recalculateAllocation();
  }

  private resetVoucherAllocations(type: string) {
    this.dataset.forEach((v) => {
      if (v.type.toUpperCase() === type) {
        v.isSelected = false;
        v.netAllocation = 0;
        v.balance =
          type === 'PURCHASEVOUCHER'
            ? Number(v.openBalance ?? v.tempbalance ?? 0)
            : Number(v.openBalance ?? v.tempbalance ?? 0);
        this.syncRowRemainingBalance(v);
      }
    });
  }

  private selectSourceVoucher() {
    const sourceRow = this.dataset?.find(
      (voucher: any) =>
        (voucher.voucherNo || '').toUpperCase() ===
          (this.refNO || '').toUpperCase() &&
        (voucher.type || '').toUpperCase() ===
          (this.fromVoucher || '').toUpperCase()
    );

    if (sourceRow && !sourceRow.isSelected) {
      sourceRow.isSelected = true;
      sourceRow.selectionOrder = ++this.selectionCounter;
    }
  }

  private recalculateAllocation() {
    const upperVoucher = this.fromVoucher?.toUpperCase();
    const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);

    const fromTypes = isPaymentFlow
      ? ['PAYMENT', 'BANK PAYMENT']
      : ['RECEIPT', 'BANK RECEIPT'];

    const toType = isPaymentFlow ? 'PURCHASEVOUCHER' : 'SALESVOUCHER';

    const fromVouchers = (this.dataset || [])
      .filter((v) => fromTypes.includes(v.type?.toUpperCase()) && v.isSelected)
      .sort((a, b) => (a.selectionOrder || 0) - (b.selectionOrder || 0));

    if (!fromVouchers.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selection Required',
        detail: 'Select at least one source voucher first.',
      });

      this.resetVoucherAllocations(toType);

      this.totalAllocated = 0;
      this.remainingBalance = 0;

      this.recalculateTotals();
      return;
    }

    const toVouchers = (this.dataset || [])
      .filter((v) => v.type?.toUpperCase() === toType && v.isSelected)
      .sort((a, b) => (a.selectionOrder || 0) - (b.selectionOrder || 0));

    // --- Reset allocation values ---
    (this.dataset || []).forEach((v) => {
      const t = (v.type || '').toUpperCase();

      v.netAllocation = 0;

      if (['PAYMENT', 'BANK PAYMENT'].includes(t)) {
        v.remainingDebit = Number(
          Number(
            v.openBalance ?? v.balance ?? v.originalDebit ?? v.debit ?? 0
          ).toFixed(2)
        );
      } else if (['RECEIPT', 'BANK RECEIPT'].includes(t)) {
        v.remainingCredit = Number(
          Number(
            v.openBalance ?? v.balance ?? v.originalCredit ?? v.credit ?? 0
          ).toFixed(2)
        );
      } else if (t === 'PURCHASEVOUCHER') {
        v.balance = Number(Number(v.openBalance ?? v.tempbalance ?? 0).toFixed(2));
      } else if (t === 'SALESVOUCHER') {
        v.balance = Number(Number(v.openBalance ?? v.tempbalance ?? 0).toFixed(2));
      }
      this.syncRowRemainingBalance(v);
    });

    // Nothing selected on target side
    if (!toVouchers.length) {
      this.totalAllocated = 0;
      this.remainingBalance = fromVouchers.reduce((sum, f) => {
        const key = isPaymentFlow ? 'remainingDebit' : 'remainingCredit';
        return sum + Number(f[key] || 0);
      }, 0);

      this.recalculateTotals();
      return;
    }

    let totalAllocated = 0;

    // --- Allocation logic ---
    for (const to of toVouchers) {
      const baseTargetBalance = Number(
        to.openBalance ?? to.tempbalance ?? to.balance ?? 0
      );
      let balance = Number(baseTargetBalance || 0);

      for (const from of fromVouchers) {
        const remainingKey = isPaymentFlow
          ? 'remainingDebit'
          : 'remainingCredit';

        const remaining = Number(from[remainingKey] || 0);
        if (remaining <= 0 || balance <= 0) continue;

        const allocateNow = Math.min(balance, remaining);

        from[remainingKey] = Number((remaining - allocateNow).toFixed(2));
        balance = Number((balance - allocateNow).toFixed(2));

        to.netAllocation = Number(
          ((to.netAllocation || 0) + allocateNow).toFixed(2)
        );

        totalAllocated += allocateNow;
      }

      to.balance = Number(baseTargetBalance.toFixed(2));
      this.syncRowRemainingBalance(to);
    }

    const remainingBalance = fromVouchers.reduce((sum, f) => {
      const key = isPaymentFlow ? 'remainingDebit' : 'remainingCredit';
      return sum + Number(f[key] || 0);
    }, 0);

    this.totalAllocated = Number(totalAllocated.toFixed(2));
    this.remainingBalance = Number(remainingBalance.toFixed(2));

    this.recalculateTotals();
  }

  private recalculateTotals() {
    const upperVoucher = this.fromVoucher?.toUpperCase();
    const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);

    const fromTypes = isPaymentFlow
      ? ['PAYMENT', 'BANK PAYMENT']
      : ['RECEIPT', 'BANK RECEIPT'];

    const toType = isPaymentFlow ? 'PURCHASEVOUCHER' : 'SALESVOUCHER';

    // --- Filter selected vouchers ---
    const fromList =
      this.dataset?.filter(
        (v) => fromTypes.includes(v.type?.toUpperCase()) && v.isSelected
      ) || [];

    const toList =
      this.dataset?.filter(
        (v) => v.type?.toUpperCase() === toType && v.isSelected
      ) || [];

    // --- Safe numeric extractor ---
    const num = (v: any, field: string) => Number(v?.[field] || 0);

    // --- Calculate debit and credit totals based on flow ---
    const totalDebitSource = isPaymentFlow ? fromList : toList;
    const totalCreditSource = isPaymentFlow ? toList : fromList;

    this.totalDebit = totalDebitSource.reduce(
      (sum, v) => sum + num(v, 'debit'),
      0
    );
    this.totalCredit = totalCreditSource.reduce(
      (sum, v) => sum + num(v, 'credit'),
      0
    );

    // --- Allocation total ---
    this.totalAllocated = toList.reduce(
      (sum, v) => sum + num(v, 'netAllocation'),
      0
    );

    // --- Compute remaining balance for each 'from' record ---
    this.remainingBalance = fromList.reduce((sum, v) => {
      const baseBalance = num(
        v,
        isPaymentFlow ? 'remainingDebit' : 'remainingCredit'
      );
      return sum + baseBalance;
    }, 0);

    // --- Compute capped balance ---
    // --- Assign final Debit/Credit totals ---
    if (isPaymentFlow) {
      this.total_Debit = this.totalDebit;
      this.total_Credit = this.totalAllocated;
    } else {
      this.total_Debit = this.totalAllocated;
      this.total_Credit = this.totalCredit;
    }

    // --- Update form controls ---
    const controls = this.VAForm.controls;
    controls['AllocationVoucherTotalDebit'].setValue(this.total_Debit);
    controls['AllocationVoucherTotalCredit'].setValue(this.total_Credit);
  }
}
