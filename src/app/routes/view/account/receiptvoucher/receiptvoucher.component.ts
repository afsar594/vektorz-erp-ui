import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { ReceiptVoucher } from 'src/app/routes/domain/Accounts/ReceiptVoucher';
import { ReceiptVoucherDetails } from 'src/app/routes/domain/Accounts/ReceiptVoucherDetails';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { ChartofAccounts } from 'src/app/routes/domain/Masters/ChartofAccounts';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { LoginService } from 'src/app/routes/service/login.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ToWords } from 'to-words';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { debuglog } from 'util';
import { debug } from 'console';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { isValidDate } from '@fullcalendar/common';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { AllocationSourceType } from 'src/app/routes/domain/Accounts/allocation-source-type.enum';

@Component({
  selector: 'app-receiptvoucher',
  templateUrl: './receiptvoucher.component.html',
  styleUrls: ['./receiptvoucher.component.scss'],
})
export class ReceiptvoucherComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('accountDropdown', { static: false }) accountDropdown: any;
  CurrentselectedAccount: any;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  dataList: Array<any> = [];
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  lookupGridColumns = [];
  //btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: any[] = [];
  CramtChk: number = 0;
  sum: number = 0;

  rptFilter: ReportFilterModel;
  pdfSource: any;
  pipe = new DatePipe('en-US');

  vNo: string = '';
  showAccountLookUp: boolean = false;
  formControlLookUp: boolean = false;
  receiptVoucherFormGroup: FormGroup;
  receiptVoucherFilterForm: FormGroup;
  btnFlag: ButtonFlag = {
    edit: false,
    cancel: false,
    save: true,
    update: false,
    delete: false,
  };
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  accountArraydropdown: ChartofAccounts[] = [];
  acctArrydropdown: string[] = [];
  accountListdropdown: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  DefAcc: string;
  DefAccCheck: string;

  usrid: number;
  fsno: number;
  locId: number;
  date = new Date();
  printWithAllocation: boolean = false;
  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  receiptVoucherarry: ReceiptVoucher[] = [];
  // savedPaymentVoucherGridData: GridData[] = [];
  savedReceiptVoucher: ReceiptVoucher;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'receiptVouchrEntry';
  displayPrintPreview: boolean = false;
  craditword: string = '';
  receivedAllocationData: any[] = [];
  ScreenId: number;
  Permission: any;
  filterArray: any;
  selectedAccount: boolean = false;
  allowEditAfterRelease: boolean = false;
  receiptHasActiveAllocation: boolean = false;
  user: any;
  allocationPrint: any;
  JOBCOST: boolean = true;
  itemList = [];
  clickedRowColumn = { row: -1, column: -1 };
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
  contraSettings: boolean = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private loginser: LoginService,
    private router: Router,
    private masterapi: MasterApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,
    private accountstatement: AccountstatementService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.CramtChk = 0;
  }

  receiptvoucherentry: Handsontable.GridSettings;
  // accountTransactionDataset = [];

  cols;
  ngAfterViewInit() {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
      this.stationmasterObj = this.permission.getStation();
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
      { field: 'receiptVoucherMasterVoucherNo', header: 'Voucher No' },
      { field: 'receiptVoucherMasterVoucherDate', header: 'Date' },
      { field: 'receiptVoucherMasterDrAcNo', header: 'Account' },
      { field: 'receiptVoucherMasterCurrencyId', header: 'Currency' },
      { field: 'receiptVoucherMasterDrAmount', header: 'Vchr.Debit' },
      { field: 'receiptVoucherMasterCrAmount', header: 'Vchr.Credit' },
      { field: 'receiptVoucherMasterNarration', header: 'Particulars' },
      { field: 'receiptVoucherMasterDrAmount', header: 'Dtls.Debit' },
      { field: 'receiptVoucherMasterCrAmount', header: 'Dtls.Credit' },
    ];
    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedReceiptDetails(this.vNo);
    }
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.receiptVoucherFormGroup = this.fb.group({
      receiptVoucherMasterSno: 0,
      receiptVoucherMasterVoucherNo: [{ value: null, disabled: true }],
      receiptVoucherMasterVoucherDate: [null, [Validators.required]],
      receiptVoucherMasterRefNo: [''],
      receiptVoucherMasterDrAcNo: [-1, [DropDownValidator]],
      receiptVoucherMasterDrAmount: [null],
      receiptVoucherMasterNarration: ['', [Validators.required]],
      receiptVoucherMasterCurrencyId: [-1, [DropDownValidator]],
    });
    this.receiptVoucherFilterForm = this.fb.group({
      receiptVoucherAcNo: [null],
      isDate: [],
      receiptVoucherNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    var user = this.loginser.GetCredentialData();
    this.usrid = user?.userId;
    this.fsno = user?.financialPeriodsFsno;
    this.locId = user?.locId;
    this.callDropdowns();
    this.bykeys();
    document.addEventListener(
      'scroll',
      () => {
        if (this.accountDropdown && this.accountDropdown.overlayVisible) {
          this.accountDropdown.hide();
        }
      },
      true
    );
  }

  bykeys() {
    this.utilityService
      .getProgramSettings(
        'Hide_Job_Detail,Hide_CostCenter_Detail,Add_JOB_IN_CONTRA'
      )
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        const costCenterSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        );
        const contraSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Add_JOB_IN_CONTRA'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;
        this.contraSettings = contraSetting?.programSettingsBoolValue ?? false;
        setTimeout(() => {
          this.updateTableConfiguration();
        }, 1000);
      });
  }

  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
  }

  get f() {
    return this.receiptVoucherFormGroup.controls;
  }
  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.utilityService.getPaymentDropdown().subscribe((m: any) => {
      //currency
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
        value1: kl.currencyMasterCurrencyRate,
      }));
      this.currencyList.unshift({ label: '--Select--', value: -1 });

      //job
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      // this.jobList.unshift({ label: '--Select--', value: -1 });

      //cost
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterList.unshift({ label: '--Select--', value: -1 });

      //account
      this.accountArraydropdown = m.resultSet.cashAccountList;
      this.accountListdropdown = m.resultSet.cashAccountList?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountListdropdown.unshift({ label: '--Select--', value: -1 });

      this.accountArray = m.resultSet.masterAccountsTables;
      this.accountList = m.resultSet.masterAccountsTables?.map((kl) => ({
        label: kl.maAccNo ? `${kl.maAccNo} - ${kl.maAccName}` : kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });

      if (this.filterArray?.length) {
        this.filterArray.forEach((v: any) => {
          if (!v.accountName) {
            v.accountName = this.getAccountName(v.receiptVoucherMasterDrAcNo) || '';
          }
        });
      }
    });
  }
  initializeControls() {
    this.receiptvoucherentry = this.utilityService.getTableConfig(
      receiptVoucherColumnList(this),
      [2, 3, 5]
    );

    this.receiptvoucherentry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      this.clickedRowColumn = { row, column };
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      if (this.utilityService.isRowDisabled(row, hotInstance)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Notice',
          detail: 'Please fill the previous row first',
        });
        return;
      }
      // setting if prevent scrolling after selection
      var x = hotInstance.getDataAtCell(row, column);

      if (column === 0 && this.receiptvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        hotInstance.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 2 && this.receiptvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        hotInstance.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.receiptvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Cost Center', 'Cost Center ID'];
        this.dataList = this.costSetLookup;
        hotInstance.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else {
        this.showAccountLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.account == x);
      } else {
        this.selectItem = {};
      }
    };

    this.receiptvoucherentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.receiptvoucherentry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.receiptvoucherentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.itemList.splice(index, 1);
      this.ColumnSum();
    };

    this.receiptvoucherentry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  receiveData(data: any) {
    this.receivedAllocationData = [];
    data.forEach((e) => {
      if ((e?.isSelected === true || e?.IsSelected === true) && e?.netAllocation > 0) {
        this.receivedAllocationData.push(e);
      }
    });
    //console.log('receivedAllocationData : ', this.receivedAllocationData);
  }

  ColumnSum() {
    if (this.receiptvoucherentry.readOnly) {
      return;
    }

    if (this.receiptvoucherentry.data.length > 0) {
      var sum1 = 0;
      this.receiptvoucherentry.data.forEach((elemt: any) => {
        if (elemt && elemt.credit > 0) {
          sum1 += elemt.credit;
        }
      });
      sum1 = parseFloat(sum1.toFixed(2));
      this.receiptVoucherFormGroup.controls.receiptVoucherMasterDrAmount.setValue(
        sum1
      );
    }
  }

  get accountSetLookup() {
    return this.accountArray.map((kl) => ({
      account: kl.maAccName,
      accountId: kl.maAccNo,
    }));
  }

  get jobSetLookup() {
    return this.jobList.map((kl) => ({
      account: kl.label,
      accountId: kl.value,
    }));
  }

  get costSetLookup() {
    return this.costcenterArray.map((kl) => ({
      account: kl.costCenterMasterCostCenterName,
      accountId: kl.costCenterMasterCostCenterId,
    }));
  }

  isAllocationCreditDebitEqual(credit: any, debit: any): boolean {
    if (credit != debit) {
      return false;
    } else {
      return true;
    }
  }

  saveReceiptVoucher() {
    if (this.isAllocationCreditDebitEqual(0, 0) === false) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Credit or Debit values are not equal for allocation details.',
      });
      return;
    }

    const savedData: any = this.receiptvoucherentry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    const RcptVoucher: ReceiptVoucher = this.receiptVoucherFormGroup
      .value as ReceiptVoucher;

    RcptVoucher.rvAllocationDetails = this.receivedAllocationData;

    RcptVoucher.receiptVoucherMasterVoucherNo =
      this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterVoucherNo;
    RcptVoucher.receiptVoucherMasterSno =
      this.receiptVoucherFormGroup.value.receiptVoucherMasterSno != null
        ? parseInt(this.receiptVoucherFormGroup.value.receiptVoucherMasterSno)
        : 0;
    RcptVoucher.receiptVoucherMasterDrAmount =
      this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterDrAmount;
    RcptVoucher.receiptVoucherMasterFcDrAmount =
      this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterDrAmount;
    RcptVoucher.receiptVoucherMasterFsno = this.fsno;
    RcptVoucher.receiptVoucherMasterUserId = this.usrid;
    RcptVoucher.receiptVoucherMasterAllocId =
      this.savedReceiptVoucher?.receiptVoucherMasterAllocId || 0;
    RcptVoucher.receiptVoucherMasterVoucherDate =
      this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterVoucherDate;
    RcptVoucher.receiptVoucherMasterVoucherType = '';
    RcptVoucher.receiptVoucherMasterDrAcNo =
      this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterDrAcNo;
    RcptVoucher.receiptVoucherMasterCrAmount = 0;
    RcptVoucher.receiptVoucherMasterFcCrAmount = 0;
    RcptVoucher.receiptVoucherMasterNarration =
      this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterNarration;
    RcptVoucher.receiptVoucherMasterRefNo =
      this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterRefNo;
    RcptVoucher.receiptVoucherMasterCurrencyId =
      this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterCurrencyId;

    RcptVoucher.receiptVoucherDetails = savedData
      ?.filter((k) => k.account != null && k.credit != null)
      .map((k: GridData) => {
        return {
          receiptVoucherDetailsId: k.id != null ? k.id : 0,
          receiptVoucherDetailsVoucherNo:
            this.receiptVoucherFormGroup.getRawValue()
              .receiptVoucherMasterVoucherNo,
          receiptVoucherDetailsSlNo:
            this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterSno,
          receiptVoucherDetailsCrAcNo: k.accountNo || this.accountArray?.find(
            (x) => x.maAccName?.trim() === k.account?.trim()
          )?.maAccNo,
          receiptVoucherDetailsCrAmount: k.credit,
          receiptVoucherDetailsFcCrAmount: k.credit,
          receiptVoucherDetailsDbAmount: 0,
          receiptVoucherDetailsJobId:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                  .value
              : -1,
          receiptVoucherDetailsDepId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                  (j) =>
                    j.costCenterMasterCostCenterName?.trim() ===
                    k.costcenter?.trim()
                ).costCenterMasterCostCenterId
              : null,
          // receiptVoucherDetailsDepId: 0,
          receiptVoucherDetailsNarration: k.narration,
          receiptVoucherDetailsFsno: this.fsno,
          receiptVoucherDetailsDelStatus: false,
        };
      });

    RcptVoucher.accountsTransactions = [];

    // console.log('RcpVcher Details',RcptVoucher.receiptVoucherDetails)
    // console.log('RcptVoucher-receiptVoucherDetails',RcptVoucher.receiptVoucherDetails.
    // filter(x => x.ReceiptVoucherDetailsDelStatus === false));
    RcptVoucher.receiptVoucherDetails
      ?.filter((x) => x.receiptVoucherDetailsDelStatus === false)
      .forEach((element) => {
        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: element.receiptVoucherDetailsCrAcNo,
          accountsTransactionsTransDate:
            this.f.receiptVoucherMasterVoucherDate.value,
          accountsTransactionsParticulars:
            element.receiptVoucherDetailsNarration,
          accountsTransactionsCredit: element.receiptVoucherDetailsCrAmount,
          accountsTransactionsFcCredit: element.receiptVoucherDetailsCrAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo: element.receiptVoucherDetailsVoucherNo,
          accountsTransactionsDescription:
            element.receiptVoucherDetailsNarration,
          accountsTransactionsStatus: null,
          accountstransactionsDelStatus: false,
          accountsTransactionsJobNo: element.receiptVoucherDetailsJobId,
          accountsTransactionsCostCenterId: element.receiptVoucherDetailsDepId,
        };
        RcptVoucher.accountsTransactions.push(creditData);
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: this.f.receiptVoucherMasterDrAcNo.value,
          accountsTransactionsTransDate:
            this.f.receiptVoucherMasterVoucherDate.value,
          accountsTransactionsParticulars:
            this.f.receiptVoucherMasterNarration.value,
          accountsTransactionsDebit: element.receiptVoucherDetailsCrAmount,
          accountsTransactionsFcDebit:element.receiptVoucherDetailsCrAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.receiptVoucherFormGroup.getRawValue()
              .receiptVoucherMasterVoucherNo,
          accountsTransactionsDescription:
            this.f.receiptVoucherMasterNarration.value,
          accountsTransactionsStatus: null,
          accountstransactionsDelStatus: false,

          accountsTransactionsJobNo: this.contraSettings
            ? element.receiptVoucherDetailsJobId
            : -1,
          accountsTransactionsCostCenterId: element.receiptVoucherDetailsDepId,
        };
        RcptVoucher.accountsTransactions.push(debitData);
      });
    // console.log('RcptVoucher',RcptVoucher);
    if (this.btnFlag.save) {
      this.saveVoucher(RcptVoucher);
    } else {
     

      this.updateVoucher(RcptVoucher);
    }
  }

  saveVoucher(RcptVoucher: ReceiptVoucher) {
    this.receiptVoucherFormGroup.markAllAsTouched();
    if (this.receiptVoucherFormGroup.invalid && this.IsValidGrid) {
      this.messageService.add({
        severity: 'success',
        summary: 'Alert',
        detail: 'fill the Required fields',
      });
      return;
    }
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to save voucher?',
      accept: () => {
        this.accountapi.InsertReceiptVoucher(RcptVoucher).subscribe(
          (data: any) => {
            if (data.valid) {
              const isFullyAllocated = this.isReceiptVoucherFullyAllocated(
                data.result
              );
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              data.result = this.ensureReceiptVoucherDetails(
                data.result,
                RcptVoucher.receiptVoucherDetails
              );
              this.savedReceiptVoucher = data.result;
              this.updateFormGrid(data.result);
              this.CurrentselectedAccount =
                this.buildAllocationContext(data.result);
              this.selectedAccount = !!this.CurrentselectedAccount;
              this.userTrackingLog('Insert');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Receipt Voucher Saved Succesfully',
              });
            } else {
              const errorMsg =
                data.errorMessage ||
                data.message ||
                data.exception ||
                'An error occurred';
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('Alert'),
                detail: errorMsg,
              });
            }
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Receipt Voucher Save Failed',
            });
          }
        );
      },
    });
  }

  updateVoucher(RcptVoucher: ReceiptVoucher) {
    if (
      !this.allowEditAfterRelease &&
      this.shouldBlockReceiptVoucherEdit(this.savedReceiptVoucher)
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'To edit this voucher, please release its allocation first.',
      });
      return;
    }

    if (this.receiptVoucherFormGroup.invalid && this.IsValidGrid) {
      this.messageService.add({
        severity: 'success',
        summary: 'Alert',
        detail: 'fill the Required fields',
      });
      return;
    }
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to update existing voucher?',
      accept: () => {
        this.accountapi.UpdateReceiptVoucher(RcptVoucher).subscribe(
          (data: any) => {
            if (data.valid) {
              const isFullyAllocated = this.isReceiptVoucherFullyAllocated(
                data.result
              );
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              data.result = this.ensureReceiptVoucherDetails(
                data.result,
                RcptVoucher.receiptVoucherDetails
              );
              this.savedReceiptVoucher = data.result;
              this.updateFormGrid(data.result);
              this.CurrentselectedAccount =
                this.buildAllocationContext(data.result);
              this.selectedAccount = !!this.CurrentselectedAccount;
              this.userTrackingLog('Update');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Receipt Voucher Updated Succesfully',
              });
            } else {
              const errorMsg =
                data.errorMessage ||
                data.message ||
                data.exception ||
                'An error occurred';
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('Alert'),
                detail: errorMsg,
              });
            }
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Receipt Voucher Update Failed',
            });
          }
        );
      },
    });
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  getAllReceiptVouchrs() {
    this.accountapi.GetReceiptVouchers().subscribe((data) => {
      this.receiptVoucherarry =
        data.result?.map((v: any) => ({
          ...v,
          accountName: this.getAccountName(v.receiptVoucherMasterDrAcNo) || '',
        })) || [];
      this.displayMaximizable = true;
      this.filterArray = this.receiptVoucherarry;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j?.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  new() {
    this.itemList = [];
    this.CurrentselectedAccount = null;
    this.selectedAccount = false;
    this.receivedAllocationData = [];
    this.receiptVoucherFormGroup.reset();
    this.receiptVoucherFormGroup.enable();
    this.receiptvoucherentry.data = [];
    this.receiptvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.receiptvoucherentry);
    this.callDropdowns();

    this.accountTransactionList = [];
    this.receiptVoucherFormGroup.get('receiptVoucherMasterSno').setValue(null);
    this.receiptVoucherFormGroup.get('receiptVoucherMasterDrAcNo').setValue(-1);
    this.receiptVoucherFormGroup
      .get('receiptVoucherMasterCurrencyId')
      .setValue(-1);
    this.receiptVoucherFormGroup
      .get('receiptVoucherMasterVoucherDate')
      .setValue(new Date());
    // this.accountapi.GenerateReciptVoucherNo().subscribe((res: any) => {
    //   this.receiptVoucherFormGroup.get('ReceiptVoucherMasterVoucherNo').setValue(res.vouchersNumbersVNo)
    // });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.updateTableConfiguration();
    this.GetDefaultSettings();
    this.refreshCreditAccountGrid();
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m: any) => {
      let list = m.resultSet.generalSettings;
      // currency

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.receiptVoucherMasterCurrencyId.setValue(
            Number(this.DefCurrency)
          );
        }
      }
      //initial account
      this.getACValue();

      // var HIDE_JOBCOST = list?.filter(
      //   (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      // );
      // if (HIDE_JOBCOST !== null) {
      //   var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      //   if (jobcal == true) {
      //     this.JOBCOST = false;
      if (this.hideJobDetail) {
        this.updateTableConfiguration();
      }
    });
  }
  getACValue() {
    this.utilityService
      .GetAllAccountsbyKey('CASH_AC_NO')
      .subscribe((res: any) => {
        const value = res.result[0].accountSettingsAccountTextValue.split('::');

        this.f.receiptVoucherMasterDrAcNo.setValue(value[1]?.trim());
      });
  }

  updateTableConfiguration() {
    const hiddenColumns = [5];

    if (this.hideJobDetail) {
      hiddenColumns.push(2);
    }
    if (this.hideCostCenterDetail) {
      hiddenColumns.push(3);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }

  initializeHandsontable(columns, colHeaders) {
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      columns: columns,
      colHeaders: colHeaders,
    });
  }

  showMaximizableDialog() {
    this.callDropdowns();
    this.getAllReceiptVouchrs();
  }

  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  GetAllocationforPrint() {
    this.accountapi
      .GetAllocationforPrint(
        this.savedReceiptVoucher?.receiptVoucherMasterAllocId
      )
      .subscribe((res) => {
        this.allocationPrint = res?.resultSet?.details;
        console.log('response', this.allocationPrint);
      });
  }

  showPrintPreview() {
    this.printWithAllocation = this.printWithAllocation || false;
    const receiptVoucherSno =
      this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterSno || 0;

    this.rptFilter = {
      ReportName:this.printWithAllocation ? 'RecieptVoucherwithAllocation' : 'RecieptVoucher',
      SelectionFormula:`{vw_recieptvoucher.Receipt_Voucher_Master_SNO}=${receiptVoucherSno}`,
        // '{Receipt_Voucher_Master.Receipt_Voucher_Master_Voucher_No}  = "' +
        // this.receiptVoucherFormGroup.getRawValue()
        //   .receiptVoucherMasterVoucherNo +
        // '"'
       // '',
      Parameters: [
        // { Key: 'StationName', Value: 'StationName' },
        // { Key: 'Address', Value: 'Address' },
        // { Key: 'Tel', Value: 'Tele' },
        // { Key: 'Fax', Value: 'fax' },
        // { Key: 'Email', Value: 'Email@exmaple.com' },
      ],
      Queries: [
        // `select * from vw_recieptvoucher where Receipt_Voucher_Master_SNO =${
        //   this.receiptVoucherFormGroup.getRawValue().receiptVoucherMasterSno
        // } `,
        // `
        //   select
        //     av.Allocation_Voucher_Voucher_No as AllocationVoucherNo,
        //     avd.Allocation_Voucher_Details_VNO as VoucherNo,
        //     avd.Allocation_Voucher_Details_Vtype as VoucherType,
        //     cast(isnull(avd.Allocation_Voucher_Details_Alloc_Debit, 0) as decimal(18, 2)) as AllocDebit,
        //     cast(isnull(avd.Allocation_Voucher_Details_Alloc_Credit, 0) as decimal(18, 2)) as AllocCredit,
        //     cast(isnull(avd.Allocation_Voucher_Details_FC_Alloc_Debit, 0) as decimal(18, 2)) as FcAllocDebit,
        //     cast(isnull(avd.Allocation_Voucher_Details_FC_Alloc_Credit, 0) as decimal(18, 2)) as FcAllocCredit,
        //     at.AccountsTransactions_TransDate as VoucherDate,
        //     cast(isnull(at.AccountsTransactions_Alloc_Balance, 0) as decimal(18, 2)) as RemainingBalance
        //   from Receipt_Voucher_Master rv
        //   inner join Allocation_Voucher av
        //     on av.Allocation_Voucher_ID = rv.Receipt_Voucher_Master_Alloc_ID
        //   inner join Allocation_Voucher_Details avd
        //     on avd.Allocation_Voucher_Details_SNO = av.Allocation_Voucher_ID
        //   left join AccountsTransactions at
        //     on at.AccountsTransactions_TransSno = avd.Allocation_Voucher_Details_TransSno
        //   where rv.Receipt_Voucher_Master_SNO = ${receiptVoucherSno}
        //     and isnull(avd.Allocation_Voucher_Details_DelStatus, 0) = 0
        //     and isnull(avd.Allocation_Voucher_Details_VNO, '') <> isnull(rv.Receipt_Voucher_Master_Voucher_No, '')
        //   order by at.AccountsTransactions_TransDate, avd.Allocation_Voucher_Details_VNO
        // `,
      ],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, false)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  userTrackingLog(type) {
    let req = {
      page: 'Receipt Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.receiptVoucherFormGroup.get('receiptVoucherMasterVoucherNo')
        .value,
      vpType: 'Receipt Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  updateFormGrid(Rcpt: ReceiptVoucher) {
    Rcpt = this.ensureReceiptVoucherDetails(
      Rcpt,
      this.savedReceiptVoucher?.receiptVoucherDetails
    );
    this.search = null;
    this.receiptVoucherFormGroup.patchValue({
      receiptVoucherMasterVoucherNo: Rcpt.receiptVoucherMasterVoucherNo,
      receiptVoucherMasterSno: Rcpt.receiptVoucherMasterSno,
      receiptVoucherMasterVoucherDate: new Date(
        Rcpt.receiptVoucherMasterVoucherDate
      ),
      receiptVoucherMasterRefNo: Rcpt.receiptVoucherMasterRefNo,
      receiptVoucherMasterDrAcNo: Rcpt.receiptVoucherMasterDrAcNo,
      receiptVoucherMasterDrAmount: Rcpt.receiptVoucherMasterDrAmount,
      receiptVoucherMasterNarration: Rcpt.receiptVoucherMasterNarration,
      receiptVoucherMasterCurrencyId: Rcpt.receiptVoucherMasterCurrencyId,
    });
    const toWords = new ToWords();
    this.craditword = toWords.convert(Rcpt?.receiptVoucherMasterDrAmount);
    this.accountTransactionList = Rcpt.accountsTransactions;
    const gridData: GridData[] = Rcpt.receiptVoucherDetails.map((k) => {
      const accountId: string =
        k.receiptVoucherDetailsCrAcNo != null
          ? this.accountArray?.find((l) =>
              l.maAccNo?.trim() === k.receiptVoucherDetailsCrAcNo?.trim() || l.maAccNo?.match(k.receiptVoucherDetailsCrAcNo)
            )?.maAccName
          : null;

      const jobId: string =
        k.receiptVoucherDetailsJobId != null
          ? this.jobList?.find((l) => l.value == k.receiptVoucherDetailsJobId)
              ?.label
          : null;

      const Costcenterid: string =
        k.receiptVoucherDetailsDepId != null
          ? this.costcenterList?.find(
              (l) => l.value == k.receiptVoucherDetailsDepId
            )?.label
          : null;
      return {
        account: accountId,
        credit: k?.receiptVoucherDetailsCrAmount,
        jobname: jobId,
        costcenter: Costcenterid,
        narration: k?.receiptVoucherDetailsNarration,
        id: k?.receiptVoucherDetailsId,
        accountNo: k?.receiptVoucherDetailsCrAcNo,
      };
    });
    this.receiptvoucherentry.data = gridData;
    this.receiptvoucherentry.readOnly = true;

    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.receiptVoucherFormGroup.disable();
    this.f.receiptVoucherMasterVoucherNo.clearValidators();
    this.receiptVoucherFormGroup.updateValueAndValidity();
    this.refreshCreditAccountGrid();
  }

  handleChange(e) {
    this.index = e.index;
    if (this.index == 0) {
      this.refreshCreditAccountGrid();
    }
    if (this.index == 2) {
      if (this.savedReceiptVoucher?.receiptVoucherMasterVoucherNo) {
        this.CurrentselectedAccount = this.buildAllocationContext(
          this.savedReceiptVoucher
        );
        this.selectedAccount = !!this.CurrentselectedAccount;
      }
    }
  }

  refreshCurrentVoucherFromAllocation(action?: string) {
    if (!this.savedReceiptVoucher?.receiptVoucherMasterSno) {
      return;
    }

    const currentTab = this.index;
    this.accountapi
      .GetSavedReceiptDetails(
        String(this.savedReceiptVoucher.receiptVoucherMasterSno)
      )
      .subscribe(
        (data) => {
          if (data?.result) {
            this.allowEditAfterRelease = action === 'released';
            const normalizedVoucher = {
              ...data.result,
              receiptVoucherDetails:
                this.allowEditAfterRelease &&
                (!Array.isArray(data.result.receiptVoucherDetails) ||
                  !data.result.receiptVoucherDetails.length)
                  ? this.savedReceiptVoucher?.receiptVoucherDetails || []
                  : data.result.receiptVoucherDetails,
              receiptVoucherMasterDrAmount:
                this.allowEditAfterRelease &&
                !Number(data.result.receiptVoucherMasterDrAmount || 0)
                  ? this.savedReceiptVoucher?.receiptVoucherMasterDrAmount ||
                    data.result.receiptVoucherMasterDrAmount
                  : data.result.receiptVoucherMasterDrAmount,
            };

            if (this.allowEditAfterRelease) {
              const releasedSourceTransaction = this.getReceiptSourceTransaction(
                normalizedVoucher
              );
              if (releasedSourceTransaction) {
                releasedSourceTransaction.accountsTransactionsAllocCredit = 0;
                releasedSourceTransaction.accountsTransactionsFcAllocCredit = 0;
                releasedSourceTransaction.accountsTransactionsAllocBalance =
                  Number(
                    releasedSourceTransaction.accountsTransactionsCredit || 0
                  );
              }
            }

            this.reconcileReceiptVoucherAllocationState(
              normalizedVoucher,
              (finalVoucher) => {
                this.accountTransactionList = finalVoucher.accountsTransactions;
                this.updateFormGrid(finalVoucher);
                this.savedReceiptVoucher = finalVoucher;
                this.CurrentselectedAccount = this.buildAllocationContext(
                  finalVoucher
                );
                this.selectedAccount = !!this.CurrentselectedAccount;
                this.btnFlag = {
                  edit: true,
                  cancel: true,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.receiptVoucherFormGroup.disable();
                this.index = currentTab;
                this.refreshCreditAccountGrid();
                if (action === 'released') {
                  this.getAllReceiptVouchrs();
                }
              }
            );
          }
        },
        () => { }
      );
  }

  GetSavedReceiptDetails(id: string) {
    if (id != null && isNaN(Number(id))) {
      const normalizedVno = String(id).trim().toUpperCase();
      const cachedMatch = (this.filterArray || this.receiptVoucherarry || []).find(
        (v: any) =>
          (v?.receiptVoucherMasterVoucherNo || '').trim().toUpperCase() ===
          normalizedVno
      );
      if (cachedMatch?.receiptVoucherMasterSno != null) {
        this.GetSavedReceiptDetails(String(cachedMatch.receiptVoucherMasterSno));
        return;
      }
      this.accountapi.GetReceiptVouchers().subscribe(
        (listRes: any) => {
          const matched = (listRes?.result || []).find(
            (v: any) =>
              (v?.receiptVoucherMasterVoucherNo || '').trim().toUpperCase() ===
              normalizedVno
          );
          if (matched?.receiptVoucherMasterSno != null) {
            this.GetSavedReceiptDetails(String(matched.receiptVoucherMasterSno));
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Receipt voucher not found',
            });
          }
        },
        () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Failed',
          });
        }
      );
      return;
    }
    this.index = 0;
    this.allowEditAfterRelease = false;
    this.receiptHasActiveAllocation = false;
    this.accountapi.GetSavedReceiptDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.reconcileReceiptVoucherAllocationState(
            data.result,
            (finalVoucher) => {
              this.btnFlag = {
                edit: true,
                cancel: true,
                save: false,
                update: true,
                delete: true,
              };
              this.accountTransactionList = finalVoucher.accountsTransactions;
              this.updateFormGrid(finalVoucher);
              this.savedReceiptVoucher = finalVoucher;
              this.CurrentselectedAccount = this.buildAllocationContext(
                finalVoucher
              );
              this.selectedAccount = !!this.CurrentselectedAccount;
              this.receiptVoucherFormGroup.disable();
            }
          );
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Receipt voucher not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
      }
    );
  }
  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.accountapi
          .DeleteReceiptVoucher(this.savedReceiptVoucher)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Receipt Voucher Deleted Succesfully',
              });
              this.new();
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

  cancel() {
    this.new();
  }

  edit() {
    if (
      !this.allowEditAfterRelease &&
      this.shouldBlockReceiptVoucherEdit(this.savedReceiptVoucher)
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail:
          'To edit this voucher, please release its allocation first.',
      });
      return;
    }

    //this.hotRegisterer.getInstance(this.hotid).updateSettings({ readOnly: false });
    this.receiptvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.receiptvoucherentry);
    this.f.receiptVoucherMasterVoucherNo.clearValidators();
    this.receiptVoucherFormGroup.enable();
    this.receiptVoucherFormGroup.controls.receiptVoucherMasterVoucherNo.disable();
    this.receiptVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
    this.refreshCreditAccountGrid();
  }

  public get IsValidGrid(): boolean {
    if (this.receiptvoucherentry.data.length > 0) {
      return Object.values(this.receiptvoucherentry.data).some(
        (k: GridData) => k.account != null && k.credit != null
      );
      // });
    }
    return false;
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 10) {
      return Math.max(0, 10 - salesVoucherDetailsLength);
    } else {
      return;
    }
  }

  selectaccount(evt) {
    this.selectedAccount = false;
    if (this.clickedRowColumn.column == 0) {
      if (this.itemList.includes(evt.accountId)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Duplicate Entry',
          detail: `${evt.account} is already exists in this table`,
        });
        return;
      }

      this.itemList[this.clickedRowColumn.row] = evt.accountId;
    }

    const hot = this.hotRegisterer.getInstance(this.hotid);
    if (this.activeRow.column !== 1) {
      hot.setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
      if (this.activeRow.column === 0) {
        hot.setSourceDataAtCell(
          hot.toPhysicalRow(this.activeRow.row),
          'accountNo',
          evt.accountId
        );
      }
    }
    hot.selectCell(this.activeRow.row, 1);

    let u = { receiptVoucherDetailsCrAcNo: evt.accountId };
    this.selectedAccount = !!this.CurrentselectedAccount;
    //this.CurrentselectedAccount = u;
    // this.selectedAccount = true;
    this.showAccountLookUp = false;
  }
  exit(evt) {
    this.showAccountLookUp = false;
    this.formControlLookUp = false;
  }
  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      // this.elementReference.nativeElement.value ="";
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(evt.cell.row, evt.cell.column, null);
    }
    this.showAccountLookUp = false;
    this.formControlLookUp = false;
  }
  selectControl(evt) {
    this.control.setValue(evt.accountId);
    this.elementReference.nativeElement.value = evt.account;
    this.formControlLookUp = false;
  }
  hide(evt: boolean) {
    this.showAccountLookUp = false;
    this.formControlLookUp = false;
  }
  filter() {
    let filteredArray = this.filterArray;
    if (
      this.receiptVoucherFilterForm.value.receiptVoucherNo != null &&
      this.receiptVoucherFilterForm.value.receiptVoucherNo.trim() !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.receiptVoucherMasterVoucherNo?.toUpperCase() ===
          this.receiptVoucherFilterForm.value.receiptVoucherNo.trim().toUpperCase()
      );
    }

    const selectedAcNo = this.receiptVoucherFilterForm.value.receiptVoucherAcNo;
    if (
      selectedAcNo != null &&
      selectedAcNo !== '' &&
      selectedAcNo !== -1 &&
      selectedAcNo !== '-1'
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.receiptVoucherMasterDrAcNo?.trim() === selectedAcNo?.toString().trim() ||
          res.receiptVoucherDetails?.some(
            (d) =>
              d.receiptVoucherDetailsCrAcNo?.trim() ===
              selectedAcNo?.toString().trim()
          ) ||
          res.accountsTransactions?.some(
            (t) =>
              t.accountsTransactionsAccNo?.trim() ===
              selectedAcNo?.toString().trim()
          )
      );
    }

    if (this.receiptVoucherFilterForm.value.isDate) {
      const fromDateStr = this.receiptVoucherFilterForm.value.fromDate;
      const toDateStr = this.receiptVoucherFilterForm.value.toDate;

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.receiptVoucherMasterVoucherDate);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });
    }
    this.receiptVoucherarry = filteredArray;
  }
  ClearFilter(table?: any, searchInput?: any) {
    this.receiptVoucherFilterForm.reset();
    this.receiptVoucherFilterForm.get('receiptVoucherAcNo').setValue(null);
    this.receiptVoucherFilterForm.get('fromDate').setValue(new Date());
    this.receiptVoucherFilterForm.get('toDate').setValue(new Date());
    this.receiptVoucherarry = this.filterArray;
    if (table) {
      table.filterGlobal('', 'contains');
    }
    if (searchInput) {
      searchInput.value = '';
    }
  }

  private ensureReceiptVoucherDetails(
    voucher: ReceiptVoucher,
    fallbackDetails?: ReceiptVoucherDetails[]
  ): ReceiptVoucher {
    if (!voucher) {
      return voucher;
    }

    const existingDetails = Array.isArray(voucher.receiptVoucherDetails)
      ? voucher.receiptVoucherDetails.filter(
          (detail) => detail?.receiptVoucherDetailsDelStatus !== true
        )
      : [];

    if (existingDetails.length > 0) {
      return voucher;
    }

    const voucherNo = (voucher.receiptVoucherMasterVoucherNo || '').trim();
    const matchingFallback = Array.isArray(fallbackDetails)
      ? fallbackDetails.filter(
          (detail) =>
            detail?.receiptVoucherDetailsDelStatus !== true &&
            (!detail?.receiptVoucherDetailsVoucherNo ||
              !voucherNo ||
              detail.receiptVoucherDetailsVoucherNo.trim().toUpperCase() ===
                voucherNo.toUpperCase())
        )
      : [];

    if (matchingFallback.length > 0) {
      return {
        ...voucher,
        receiptVoucherDetails: matchingFallback,
      };
    }

    const synthesizedDetails: ReceiptVoucherDetails[] = (
      voucher.accountsTransactions || []
    )
      .filter(
        (t) =>
          t?.accountstransactionsDelStatus !== true &&
          Number(t?.accountsTransactionsCredit || 0) > 0 &&
          (!voucherNo ||
            !t?.accountsTransactionsVoucherNo ||
            t.accountsTransactionsVoucherNo.trim().toUpperCase() ===
              voucherNo.toUpperCase())
      )
      .map((t) => ({
        receiptVoucherDetailsId: 0,
        receiptVoucherDetailsVoucherNo: voucher.receiptVoucherMasterVoucherNo,
        receiptVoucherDetailsSlNo: voucher.receiptVoucherMasterSno,
        receiptVoucherDetailsCrAcNo: t.accountsTransactionsAccNo,
        receiptVoucherDetailsCrAmount: Number(t.accountsTransactionsCredit || 0),
        receiptVoucherDetailsFcCrAmount: Number(
          t.accountsTransactionsFcCredit || t.accountsTransactionsCredit || 0
        ),
        receiptVoucherDetailsDbAmount: 0,
        receiptVoucherDetailsJobId: t.accountsTransactionsJobNo ?? -1,
        receiptVoucherDetailsDepId: t.accountsTransactionsCostCenterId ?? null,
        receiptVoucherDetailsNarration:
          t.accountsTransactionsParticulars ||
          t.accountsTransactionsDescription ||
          voucher.receiptVoucherMasterNarration,
        receiptVoucherDetailsFsno: t.accountsTransactionsFsno ?? this.fsno,
        receiptVoucherDetailsDelStatus: false,
      }));

    if (synthesizedDetails.length > 0) {
      return {
        ...voucher,
        receiptVoucherDetails: synthesizedDetails,
      };
    }

    return voucher;
  }

  private getPrimaryReceiptDetail(voucher: ReceiptVoucher): ReceiptVoucherDetails {
    const hydrated = this.ensureReceiptVoucherDetails(voucher);
    return (
      hydrated?.receiptVoucherDetails?.find(
        (detail) => detail?.receiptVoucherDetailsDelStatus !== true
      ) || null
    );
  }

  private buildAllocationContext(voucher: ReceiptVoucher) {
    voucher = this.ensureReceiptVoucherDetails(voucher);
    const firstDetail = voucher?.receiptVoucherDetails?.find(
      (detail) => detail?.receiptVoucherDetailsDelStatus !== true
    );
    const sourceTransaction = this.getReceiptSourceTransaction(
      voucher,
      firstDetail
    );
    const accNo = (
      firstDetail?.receiptVoucherDetailsCrAcNo ||
      sourceTransaction?.accountsTransactionsAccNo ||
      ''
    ).trim();
    const refNo = (
      voucher?.receiptVoucherMasterVoucherNo ||
      sourceTransaction?.accountsTransactionsVoucherNo ||
      ''
    ).trim();
    if (!refNo || !accNo) {
      return null;
    }

    return {
      ...sourceTransaction,
      vType: 'RECEIPT',
      refNO: voucher.receiptVoucherMasterVoucherNo,
      accountsTransactionsVoucherNo: refNo,
      accountsTransactionsAccNo: accNo,
      accountsTransactionsCredit: Number(
        sourceTransaction?.accountsTransactionsCredit ??
          firstDetail?.receiptVoucherDetailsCrAmount ??
          voucher?.receiptVoucherMasterDrAmount ??
          0
      ),
      accountsTransactionsAllocBalance: Number(
        sourceTransaction?.accountsTransactionsAllocBalance ??
          sourceTransaction?.accountsTransactionsCredit ??
          firstDetail?.receiptVoucherDetailsCrAmount ??
          voucher?.receiptVoucherMasterDrAmount ??
          0
      ),
      accNO: accNo,
      allocationId: voucher.receiptVoucherMasterAllocId,
      allocationVoucherVcreation: AllocationSourceType.ReceiptVoucher,
    };
  }

  private getReceiptSourceTransaction(
    voucher: ReceiptVoucher,
    firstDetail = voucher?.receiptVoucherDetails?.find(
      (detail) => detail?.receiptVoucherDetailsDelStatus !== true
    )
  ) {
    const voucherNo = (voucher?.receiptVoucherMasterVoucherNo || '').trim().toUpperCase();
    const detailAccNo = (firstDetail?.receiptVoucherDetailsCrAcNo || '').trim().toUpperCase();
    const matchedTransaction =
      voucher?.accountsTransactions?.find(
        (transaction) =>
          (transaction?.accountsTransactionsVoucherNo || '').trim().toUpperCase() ===
            voucherNo &&
          detailAccNo &&
          (transaction?.accountsTransactionsAccNo || '').trim().toUpperCase() ===
            detailAccNo &&
          Number(transaction?.accountsTransactionsCredit || 0) > 0
      ) ||
      voucher?.accountsTransactions?.find(
        (transaction) =>
          (transaction?.accountsTransactionsVoucherNo || '').trim().toUpperCase() ===
            voucherNo &&
          Number(transaction?.accountsTransactionsCredit || 0) > 0
      ) ||
      voucher?.accountsTransactions?.find(
        (transaction) => Number(transaction?.accountsTransactionsCredit || 0) > 0
      ) ||
      null;
    if (matchedTransaction) {
      return matchedTransaction;
    }
    if (!firstDetail) {
      return null;
    }

    return (
      voucher?.accountsTransactions?.find(
        (transaction) =>
          transaction?.accountsTransactionsVoucherNo ===
            voucher?.receiptVoucherMasterVoucherNo &&
          transaction?.accountsTransactionsAccNo ===
            firstDetail?.receiptVoucherDetailsCrAcNo &&
          Number(transaction?.accountsTransactionsCredit || 0) > 0
      ) ||
      voucher?.accountsTransactions?.find(
        (transaction) =>
          transaction?.accountsTransactionsVoucherNo ===
            voucher?.receiptVoucherMasterVoucherNo &&
          Number(transaction?.accountsTransactionsCredit || 0) > 0
      ) ||
      null
    );
  }

  private hasReceiptLinkedAllocations(voucher: ReceiptVoucher): boolean {
    const rows =
      (voucher as any)?.allocationDetails || voucher?.rvAllocationDetails || [];
    if (!Array.isArray(rows) || !rows.length) {
      return false;
    }

    return rows.some(
      (row) =>
        Number(row?.Debit ?? row?.debit ?? 0) > 0 ||
        Number(row?.Credit ?? row?.credit ?? 0) > 0 ||
        Number(row?.AllocAmount ?? row?.allocAmount ?? 0) > 0 ||
        Number(row?.NetAllocation ?? row?.netAllocation ?? 0) > 0 ||
        Number(row?.Debit || 0) > 0 ||
        Number(row?.Credit || 0) > 0 ||
        Number(row?.NetAllocation || 0) > 0
    );
  }

  private reconcileReceiptVoucherAllocationState(
    voucher: ReceiptVoucher,
    callback: (voucher: ReceiptVoucher) => void
  ) {
    const firstDetail = voucher?.receiptVoucherDetails?.find(
      (detail) => detail?.receiptVoucherDetailsDelStatus !== true
    );
    voucher = this.ensureReceiptVoucherDetails(
      voucher,
      this.savedReceiptVoucher?.receiptVoucherDetails
    );
    const resolvedDetail = this.getPrimaryReceiptDetail(voucher);
    const resolvedSourceTx = this.getReceiptSourceTransaction(voucher, resolvedDetail);
    const accNo = (
      resolvedDetail?.receiptVoucherDetailsCrAcNo ||
      resolvedSourceTx?.accountsTransactionsAccNo ||
      ''
    ).trim();
    const voucherNo = voucher?.receiptVoucherMasterVoucherNo;

    if (!accNo && voucherNo) {
      this.accountstatement
        .GetAccountTransactions({
          Dir: 'asc',
          Field: 'AccountsTransactions_TransSno',
          Filter: ` && (AccountsTransactionsVoucherNo == "${voucherNo.trim()}")`,
          Skip: 0,
          Take: 50,
        })
        .subscribe(
          (txRes: any) => {
            const fetchedTx = Array.isArray(txRes?.result?.data)
              ? txRes.result.data
              : Array.isArray(txRes?.result)
              ? txRes.result
              : [];
            if (fetchedTx.length > 0) {
              const hydratedVoucher = this.ensureReceiptVoucherDetails({
                ...voucher,
                accountsTransactions: fetchedTx,
              });
              const hydratedDetail = this.getPrimaryReceiptDetail(hydratedVoucher);
              const hydratedAccNo = (
                hydratedDetail?.receiptVoucherDetailsCrAcNo || ''
              ).trim();
              if (hydratedAccNo) {
                this.reconcileReceiptVoucherAllocationState(
                  hydratedVoucher,
                  callback
                );
                return;
              }
            }
            this.receiptHasActiveAllocation = false;
            callback(this.normalizeReleasedReceiptVoucher(voucher));
          },
          () => {
            this.receiptHasActiveAllocation = false;
            callback(this.normalizeReleasedReceiptVoucher(voucher));
          }
        );
      return;
    }

    if (!accNo || !voucherNo) {
      this.receiptHasActiveAllocation = false;
      callback(this.normalizeReleasedReceiptVoucher(voucher));
      return;
    }

    this.accountstatement
      .getAllocationVoucherDetails(accNo, voucherNo, 'RECEIPT')
      .subscribe(
        (response: any) => {
          const rows = Array.isArray(response?.result) ? response.result : [];
          const sourceVoucherNo = (voucherNo || '').trim().toUpperCase();
          const sourceRow = rows.find(
            (row) =>
              (row?.voucherNo || '').trim().toUpperCase() === sourceVoucherNo &&
              (row?.type || '').trim().toUpperCase() === 'RECEIPT'
          );
          if (sourceRow) {
            if (
              !Array.isArray(voucher.accountsTransactions) ||
              !this.getReceiptSourceTransaction(voucher, resolvedDetail)
            ) {
              const hydratedTx: AccountsTransactions = {
                accountsTransactionsTransSno: Number(sourceRow.transNo || 0),
                accountsTransactionsAccNo: sourceRow.accountNo || accNo,
                accountsTransactionsTransDate:
                  sourceRow.transDate || voucher.receiptVoucherMasterVoucherDate,
                accountsTransactionsVoucherNo:
                  sourceRow.voucherNo || voucher.receiptVoucherMasterVoucherNo,
                accountsTransactionsVoucherType: sourceRow.type || 'RECEIPT',
                accountsTransactionsCredit: Number(sourceRow.credit || 0),
                accountsTransactionsFcCredit: Number(sourceRow.credit || 0),
                accountsTransactionsDebit: 0,
                accountsTransactionsFcDebit: 0,
                accountsTransactionsAllocCredit: Number(sourceRow.allocAmount || 0),
                accountsTransactionsFcAllocCredit: Number(sourceRow.allocAmount || 0),
                accountsTransactionsAllocBalance: Number(
                  sourceRow.balance ?? sourceRow.credit ?? 0
                ),
                accountstransactionsDelStatus: false,
              } as AccountsTransactions;
              voucher = {
                ...voucher,
                receiptVoucherMasterAllocId:
                  Number(
                    sourceRow.allocationId ?? voucher.receiptVoucherMasterAllocId ?? 0
                  ) || 0,
                accountsTransactions: [
                  ...(voucher.accountsTransactions || []),
                  hydratedTx,
                ],
              };
            }
            voucher = this.ensureReceiptVoucherDetails(voucher);
          }
          voucher = {
            ...voucher,
            rvAllocationDetails: rows,
          };
          const hasTargetRows = rows.some((row) => {
            const rowVoucherNo = (row?.voucherNo || '').toUpperCase();
            const rowType = (row?.type || '').toUpperCase();
            const allocationStatus = (row?.allocationStatus || '').toUpperCase();
            const allocAmount = Number(row?.allocAmount || 0);

            return (
              rowVoucherNo !== sourceVoucherNo &&
              rowType === 'SALESVOUCHER' &&
              (allocAmount > 0 ||
                allocationStatus === 'PARTIAL' ||
                allocationStatus === 'FULL')
            );
          });

          this.receiptHasActiveAllocation = hasTargetRows;
          callback(
            hasTargetRows ? voucher : this.normalizeReleasedReceiptVoucher(voucher)
          );
        },
        () => {
          this.receiptHasActiveAllocation =
            this.hasReceiptLinkedAllocations(voucher);
          callback(voucher);
        }
      );
  }

  private normalizeReleasedReceiptVoucher(
    voucher: ReceiptVoucher
  ): ReceiptVoucher {
    const normalizedVoucher: ReceiptVoucher = {
      ...voucher,
      receiptVoucherMasterAllocId: 0,
      rvAllocationDetails: [],
    };

    const sourceTransaction = this.getReceiptSourceTransaction(normalizedVoucher);
    if (sourceTransaction) {
      sourceTransaction.accountsTransactionsAllocCredit = 0;
      sourceTransaction.accountsTransactionsFcAllocCredit = 0;
      sourceTransaction.accountsTransactionsAllocBalance = Number(
        sourceTransaction.accountsTransactionsCredit || 0
      );
    }

    return normalizedVoucher;
  }

  private isReceiptVoucherFullyAllocated(voucher: ReceiptVoucher): boolean {
    if (
      Number(voucher?.receiptVoucherMasterAllocId || 0) <= 0 ||
      !this.hasReceiptLinkedAllocations(voucher)
    ) {
      return false;
    }

    const sourceTransactions =
      voucher?.accountsTransactions?.filter(
        (transaction) =>
          transaction?.accountsTransactionsVoucherNo ===
            voucher?.receiptVoucherMasterVoucherNo &&
          Number(transaction?.accountsTransactionsCredit || 0) > 0
      ) || [];

    if (!sourceTransactions.length) {
      return false;
    }

    return !sourceTransactions.some(
      (transaction) =>
        Number(transaction?.accountsTransactionsAllocBalance || 0) > 0
    );
  }

  private shouldBlockReceiptVoucherEdit(voucher: ReceiptVoucher): boolean {
    const sourceTransaction = this.getReceiptSourceTransaction(voucher);
    if (!sourceTransaction) {
      return false;
    }

    return (
      this.receiptHasActiveAllocation &&
      Number(sourceTransaction.accountsTransactionsAllocBalance || 0) <= 0
    );
  }

  private refreshCreditAccountGrid() {
    setTimeout(() => {
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      if (!hotInstance) {
        return;
      }

      hotInstance.render();
      hotInstance.refreshDimensions();
    });
  }

  GetTotal(): number {
    let totalAllowBalance = this.allocationPrint?.reduce((sum, k) => {
      return sum + k.allocationVoucherDetailsAllocDebit;
    }, 0);

    return totalAllowBalance;
  }
}

interface GridData {
  accountNo?: string;
  account?: string;
  credit?: number;
  jobname?: string;
  costcenter?: string;
  narration?: string;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const receiptVoucherColumnList = (
  component: ReceiptvoucherComponent
) => [
  {
    data: 'account',
    type: 'autocomplete',
    label: 'Account',
    toolTip: 'Account',
    source: component.acctArry,
  },
  {
    data: 'credit',
    type: 'numeric',
    label: 'Credit',
    toolTip: 'Credit',
    readOnly: false,
    width: 80,
  },
  {
    data: 'jobname',
    type: 'autocomplete',
    label: 'Job Name',
    toolTip: 'Job Name',
    source: component.jobArry,
  },
  {
    data: 'costcenter',
    type: 'autocomplete',
    label: 'Cost Center',
    toolTip: 'Cost Center',
    source: component.costcenterArry,
    width: 80,
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    toolTip: 'Narration',
    readOnly: false,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'Id',
    toolTip: 'Id',
    width: 50,
  },
];
