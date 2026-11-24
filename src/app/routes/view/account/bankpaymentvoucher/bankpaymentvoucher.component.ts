import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { BankPaymentVoucher } from 'src/app/routes/domain/Accounts/BankPaymentVoucher';
import { BankPaymentVoucherDetails } from 'src/app/routes/domain/Accounts/BankPaymentVoucherDetails';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { LoginService } from 'src/app/routes/service/login.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ToWords } from 'to-words';
import { TranslateService } from '@ngx-translate/core';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { DialogService } from 'primeng';
import { BorwsePRComponent } from '../borwse-pr/borwse-pr.component';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { AllocationSourceType } from 'src/app/routes/domain/Accounts/allocation-source-type.enum';

@Component({
  selector: 'app-bankpaymentvoucher',
  templateUrl: './bankpaymentvoucher.component.html',
  styleUrls: ['./bankpaymentvoucher.component.scss'],
})
export class BankPaymentvoucherComponent implements OnInit, AfterViewInit {
  bankpaymentVoucherFilterForm: FormGroup;
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  CurrentselectedAccount: any;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  cols
  lookupGridColumns = [];
  dataList: Array<any> = [];
  showAccountLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number } = { row: 0, column: 0 };
  selectItem: any;
  control: AbstractControl;

  btnFlag: ButtonFlag;
  @ViewChild('accountDropdown', { static: false }) accountDropdown: any;
  currencyList: SelectItem[];
  currArry: any[] = [];

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  DefAcc: string = '01001002';
  DefAccCheck: string;

  usrid: number;
  fsno: number;
  locId: number;

  date = new Date();
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];
  receivedAllocationData: any[] = [];
  allowEditAfterRelease: boolean = false;
  bankPaymentHasActiveAllocation: boolean = false;
  accountTransactionList: AccountsTransactions[] = [];
  bankPaymentVoucherarry: BankPaymentVoucher[] = [];
  // savedPaymentVoucherGridData: GridData[] = [];
  savedBankPaymentVoucher: BankPaymentVoucher;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'bankPaymtVouchrEntry';
  displayPrintPreview: boolean = false;
  debitword: any = '';
  vNo: string = '';
  ScreenId: number;
  callDDLs: boolean = false;
  Permission: any;
  filterArray: any[] = [];
    printWithAllocation: boolean = false;

  user: any;
  JOBCOST: boolean = true;
  pdfSource: string;
  getbankMasterAccount: any;
  accountArraydropdown: ChartofAccounts[] = [];
  acctArrydropdown: string[] = [];
  accountListdropdown: SelectItem[];
  contraSettings: boolean = false;
  browsebtn: boolean = false;
  isChequeCleared: boolean = false;
  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private loginser: LoginService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    public dialogService: DialogService,
    private utilityService: UtilityService,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,
    private accountstatement: AccountstatementService,
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  bankPaymentvoucherentry: Handsontable.GridSettings;
  bankPaymentVoucherFormGroup: FormGroup;
  // accountTransactionDataset = [];
  ngAfterViewInit() { }
  ngOnInit(): void {
    this.getbankACValue();
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

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };

    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedBankPaymentDetails(this.vNo);
    }

    this.initializeControls();
    this.bankPaymentVoucherFormGroup = this.fb.group({
      bankPaymentVoucherVoucherNo: [{ value: null, disabled: true }],
      bankPaymentVoucherVDt: [null],
      bankPaymentVoucherRefNo: [''],
      bankPaymentVoucherCrAcNo: [-1, [DropDownValidator]],
      bankPaymentVoucherCrAmount: [null],
      bankPaymentVoucherDrAmount: 0,
      bankPaymentVoucherNarration: [''],
      bankPaymentVoucherCurrencyId: [-1],
      bankPaymentVoucherSno: [0],
    });
    this.bankPaymentVoucherFormGroup.disable();
    this.bankpaymentVoucherFilterForm = this.fb.group({
      bankPaymentVoucherAcNo: [null],
      isDate: [],
      bankPaymentVoucherNo: [null],
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

    this.cols = [
      { field: 'bankPaymentVoucherVoucherNo', header: 'Voucher No' },
      { field: 'bankPaymentVoucherVDt', header: 'Date' },
      { field: 'bankPaymentVoucherCrAcNo', header: 'Account' },
      { field: 'bankPaymentVoucherCurrencyId', header: 'Currency' },
      { field: 'bankPaymentVoucherDrAmount', header: 'Vchr.Debit' },
      { field: 'paymentVoucherCrAmount', header: 'Vchr.Credit' },
      { field: 'bankPaymentVoucherNarration', header: 'Particulars' },
      { field: 'bankPaymentVoucherDrAmount', header: 'Dtls.Debit' },
      { field: 'bankPaymentVoucherCrAmount', header: 'Dtls.Credit' },

      { field: 'action', header: '' },
    ];

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

  get f() {
    return this.bankPaymentVoucherFormGroup.controls;
  }
  getbankACValue() {
    this.masterapi.GetAllAccountsbyKey('BANK_MASTER_AC_NO').subscribe((res) => {
      const value = res.result[0].accountSettingsAccountTextValue.split('::');

      this.getbankMasterAccount = value[1]?.trim();
    });
  }

  getACValue() {
    this.masterapi.GetAllAccountsbyKey('BANK_AC_NO').subscribe((res) => {
      const value = res.result[0].accountSettingsAccountTextValue.split('::');

      this.f.bankPaymentVoucherCrAcNo.setValue(value[1]?.trim());
    });
  }

  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
  bykeys() {
    this.utilityService
      .getProgramSettings(
        'Hide_Job_Detail,Hide_CostCenter_Detail,Add_JOB_IN_CONTRA',
      )
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail',
        );
        const costCenterSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail',
        );
        const contraSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Add_JOB_IN_CONTRA',
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

  initializeControls() {
    let cols = bankPVoucherColumnList(this);

    let hiddenColumn = [4, 5];

    this.bankPaymentvoucherentry = this.utilityService.getTableConfig(
      cols,
      hiddenColumn,
    );
    this.bankPaymentvoucherentry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel,
    ) => {
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);

      if (column === 0 && this.bankPaymentvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 4 &&
        this.bankPaymentvoucherentry.readOnly === false
      ) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 5 &&
        this.bankPaymentvoucherentry.readOnly === false
      ) {
        this.lookupGridColumns = ['Cost Center', 'Cost Center ID'];
        this.dataList = this.costSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
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

    this.bankPaymentvoucherentry.beforeChange = (
      change: Handsontable.CellChange[],
    ) => {
      // setting if prevent scrolling after selection
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.bankPaymentvoucherentry.afterChange = (changes, source) => {
      if (changes && source !== 'loadData') {
        this.ColumnSum();
      }
    };
    this.bankPaymentvoucherentry.afterRemoveRow = (
      index: number,
      amount: number,
    ) => {
      this.ColumnSum();
    };

    this.bankPaymentvoucherentry.afterValidate = (
      isValid,
      value,
      row,
      prop,
    ) => {
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
      if (e.IsSelected === true) {
        this.receivedAllocationData.push(e);
      }
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  ColumnSum() {
    if (this.bankPaymentvoucherentry.readOnly) {
      return;
    }
    const rows = (this.bankPaymentvoucherentry.data as any[]) || [];
    const value = rows.reduce(
      (total, row) => total + (Number(row?.debit) || 0),
      0,
    );
    this.bankPaymentVoucherFormGroup.controls.bankPaymentVoucherDrAmount.setValue(
      Number(value.toFixed(2)),
    );
  }

  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
  }

  LoadCurruncyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((m: any) => {
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
        value1: kl.currencyMasterCurrencyRate,
      }));
      this.currArry = m.resultSet.currencyMasters?.map((kl) => kl.currencyMasterCurrencyRate);
      this.currencyList.unshift({ label: '--Select--', value: -1 });
    });
  }

  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((m: any) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
    });
  }

  LoadCostCenterDDL() {
    this.utilityService.LoadDropdowncostcenterMasters().subscribe((m: any) => {
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
    });
  }

  LoadChartOfAccountDDL() {
    this.utilityService.LoadDropdowchartofAccounts().subscribe((m: any) => {
      this.accountArray = m.resultSet.masterAccountsTables;
      this.accountList = m.resultSet.masterAccountsTables?.map((kl) => ({
        label: kl.maAccNo ? `${kl.maAccNo} - ${kl.maAccName}` : kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });

      if (this.filterArray?.length) {
        this.filterArray.forEach((v: any) => {
          if (!v.accountName) {
            v.accountName = this.getAccountName(v.bankPaymentVoucherCrAcNo) || '';
          }
        });
      }
      const acc = m.resultSet.masterAccountsTables?.filter(
        (item) => item.maRelativeNo === this.getbankMasterAccount,
      );

      this.accountArraydropdown = acc;
      this.accountListdropdown = acc?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountListdropdown.unshift({ label: '--Select--', value: -1 });
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'Bank Payment Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.bankPaymentVoucherFormGroup.get('bankPaymentVoucherVoucherNo')
        .value,
      vpType: 'Bank Payment Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 10) {
      return Math.max(0, 10 - salesVoucherDetailsLength);
    } else {
      return;
    }
  }
  PurchaseRequisitionStatus() {
    this.activeRow = { row: 0, column: 0 };
    this.bankPaymentvoucherentry.data = [];
    const ref = this.dialogService.open(BorwsePRComponent, {
      header: 'Payment Request',
      width: '90%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {

      },
      baseZIndex: 1,
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.accountapi.GetSavedPaymentRequestDetails(res.paymentRequestSno).subscribe(
          (data: any) => {
            this.selectValue(data.result?.paymentRequestDetails);
            this.bankPaymentVoucherFormGroup.patchValue({
              bankPaymentVoucherNarration: res.paymentRequestNarration,
              bankPaymentVoucherCrAmount: res.paymentRequestDbAmount,
              bankPaymentVoucherCrAmt: res.paymentRequestDbAmount,
              // bankPaymentVoucherCurrencyId: res.paymentRequestCurrencyId,
              bankPaymentVoucherRefNo: res.paymentRequestVoucherNo,
            });
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to fetch payment request details',
            });


          })
      }
    });
  }

  selectValue(evt: any[]) {
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);

    evt.forEach((k) => {
      hotInstance.setDataAtCell(this.activeRow.row, 0, k.paymentRequestDetailsAcNo != null
        ? this.accountArray?.find((l) =>
          l.maAccNo.match(k.paymentRequestDetailsAcNo)
        )?.maAccName
        : null);
      hotInstance.setDataAtCell(this.activeRow.row, 1, k?.paymentRequestDetailsDbAmount);
      hotInstance.setDataAtCell(this.activeRow.row, 2, 0);
      hotInstance.setDataAtCell(this.activeRow.row, 6, k?.paymentRequestDetailsNarration);
      // hotInstance.setDataAtCell(this.activeRow.row, 5, k?.price);
      this.hotRegisterer
        .getInstance(this.hotid)
        .updateSettings({ data: this.bankPaymentvoucherentry.data });
      this.activeRow.row += 1;
      //  });
    });


    this.ColumnSum();
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

  saveBankPaymentVoucher() {
    const savedData: any = this.bankPaymentvoucherentry.data?.filter((k) =>
      k.hasOwnProperty('account'),
    );
    if (!this.hasValidChequeNumbers(savedData)) {
      return;
    }
    const bankPaymentVoucher: BankPaymentVoucher = this
      .bankPaymentVoucherFormGroup.value as BankPaymentVoucher;
      
    if (this.f.bankPaymentVoucherVDt.value) {
      bankPaymentVoucher.bankPaymentVoucherVDt = this.toUtcDateString(this.f.bankPaymentVoucherVDt.value) as any;
    }

    bankPaymentVoucher.bankPaymentVoucherVoucherNo =
      this.bankPaymentVoucherFormGroup.getRawValue().bankPaymentVoucherVoucherNo;
    bankPaymentVoucher.bankPaymentVoucherSno =
      this.bankPaymentVoucherFormGroup.getRawValue().bankPaymentVoucherSno;
    bankPaymentVoucher.bankPaymentVoucherCrAmount = 0;
    bankPaymentVoucher.bankPaymentVoucherFrCrAmount = 0;
    bankPaymentVoucher.bankPaymentVoucherFsno = this.fsno;
    bankPaymentVoucher.bankPaymentVoucherUserId = this.usrid;
    bankPaymentVoucher.bankPaymentVoucherLocationId = this.locId;
    bankPaymentVoucher.bankPaymentVoucherAllocId =
      this.savedBankPaymentVoucher?.bankPaymentVoucherAllocId || 0;
    bankPaymentVoucher.accountsTransactions = [];
    bankPaymentVoucher.AllocationDetails = this.receivedAllocationData;
    bankPaymentVoucher.bankPaymentVoucherDetails = savedData
      ?.filter((k) => k.account != null && k.debit != null)
      .map((k: GridData) => {
        return {
          bankPaymentVoucherSno:
            this.bankPaymentVoucherFormGroup.getRawValue()
              .bankPaymentVoucherSno,
          bankPaymentVoucherDetailsId: k.id != null ? k.id : 0,
          bankPaymentVoucherDetailsVoucherNo:
            this.bankPaymentVoucherFormGroup.getRawValue()
              .bankPaymentVoucherVoucherNo,
          bankPaymentVoucherDetailsSno: 0,
          bankPaymentVoucherDetailsAcNo: this.accountArray?.find(
            (x) => x.maAccName?.trim() === k.account?.trim(),
          ).maAccNo,
          bankPaymentVoucherDetailsDrAmount: k.debit,
          bankPaymentVoucherDetailsDrFcAmount: k.debit,
          bankPaymentVoucherDetailsCrAmount: 0,
          bankPaymentVoucherDetailsCrFcAmount: 0,
          bankPaymentVoucherDetailsJobNo:
            k.jobname != null && k.jobname !== '' 
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                .value
              : -1,
          bankPaymentVoucherDetailsCostCenterId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                (j) =>
                  j.costCenterMasterCostCenterName?.trim() ===
                  k.costcenter?.trim(),
              ).costCenterMasterCostCenterId
              : null,

          // bankPaymentVoucherDetailsCostCenterId: 0,
          bankPaymentVoucherDetailsNarration: k.narration,
          bankPaymentVoucherDetailsFsno: this.fsno,
          bankPaymentVoucherDetailsChequeDate: k.chequedate
            ? this.toUtcDateString(k.chequedate)
            : null,
          bankPaymentVoucherDetailsChequeNo: this.normalizeChequeNumber(
            k.chequeno
          ),
          bankPaymentVoucherDetailsDelStatus: false,
          bankPaymentVoucherDetailsPdc: k.pdc,
        };
      });
    bankPaymentVoucher.bankPaymentVoucherDetails
      ?.filter((x) => x.bankPaymentVoucherDetailsDelStatus === false)
      .forEach((element) => {
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: element.bankPaymentVoucherDetailsAcNo,
          accountsTransactionsTransDate: bankPaymentVoucher.bankPaymentVoucherVDt,
          accountsTransactionsParticulars:
            element.bankPaymentVoucherDetailsNarration,
          accountsTransactionsDebit: element.bankPaymentVoucherDetailsDrAmount,
          accountsTransactionsFcDebit:
            element.bankPaymentVoucherDetailsDrAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            element.bankPaymentVoucherDetailsVoucherNo,
          accountsTransactionsDescription:
            element.bankPaymentVoucherDetailsNarration,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsJobNo: element.bankPaymentVoucherDetailsJobNo,
          accountsTransactionsCostCenterId:
            element.bankPaymentVoucherDetailsCostCenterId,
        };
        bankPaymentVoucher.accountsTransactions.push(debitData);
        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: element.bankPaymentVoucherDetailsPdc ? (this.pdcissuedACC) : this.f.bankPaymentVoucherCrAcNo.value,
          accountsTransactionsTransDate: bankPaymentVoucher.bankPaymentVoucherVDt,
          accountsTransactionsParticulars:
            this.f.bankPaymentVoucherNarration.value,
          accountsTransactionsCredit: element.bankPaymentVoucherDetailsDrAmount,
          accountsTransactionsFcCredit: element.bankPaymentVoucherDetailsDrAmount,  //* (this.currArry.find(x=> x.currencyMasterCurrencyId == this.f.bankPaymentVoucherCurrencyId.value)?.currencyMasterCurrencyRate ?? 1),
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.bankPaymentVoucherFormGroup.getRawValue()
              .bankPaymentVoucherVoucherNo,
          accountsTransactionsDescription:
            this.f.bankPaymentVoucherNarration.value,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,

          accountsTransactionsJobNo: element.bankPaymentVoucherDetailsJobNo,
          accountsTransactionsCostCenterId:
            element.bankPaymentVoucherDetailsCostCenterId,
        };
        bankPaymentVoucher.accountsTransactions.push(creditData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(bankPaymentVoucher);
    } else {


      this.updateVoucher(bankPaymentVoucher);
    }
  }

  saveVoucher(bankPaymentVoucher: BankPaymentVoucher) {
    this.bankPaymentVoucherFormGroup.markAllAsTouched();
    if (this.bankPaymentVoucherFormGroup.invalid) return;
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to save voucher?',
      accept: () => {
        this.accountapi.InsertBankPaymentVoucher(bankPaymentVoucher).subscribe(
          (data) => {
            const isFullyAllocated = this.isBankPaymentVoucherFullyAllocated(
              data.result
            );
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.savedBankPaymentVoucher = data.result;
            this.updateFormGrid(data.result);
            this.CurrentselectedAccount = this.buildAllocationContext(
              data.result
            );
            // this.userTrackingLog('Insert');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Bank Payment Voucher Saved Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Bank Payment Voucher Save Failed',
            });
          },
        );
      },
    });
  }

  updateVoucher(bankPaymentVoucher: BankPaymentVoucher) {
    if (
      !this.allowEditAfterRelease &&
      this.shouldBlockBankPaymentVoucherEdit(this.savedBankPaymentVoucher)
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'To edit this voucher, please release its allocation first.',
      });
      return;
    }

    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to update existing voucher?',
      accept: () => {
        this.accountapi.UpdateBankPaymentVoucher(bankPaymentVoucher).subscribe(
          (data) => {
            const isFullyAllocated = this.isBankPaymentVoucherFullyAllocated(
              data.result
            );
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.savedBankPaymentVoucher = data.result;
            this.updateFormGrid(data.result);
            this.CurrentselectedAccount = this.buildAllocationContext(
              data.result
            );
            this.userTrackingLog('Update');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Bank Payment Voucher Updated Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Bank Payment Voucher Update Failed',
            });
          },
        );
      },
    });
  }
  // getAllAccountTransaction() {
  //   this.accountapi.GetAllAcountTransactions().subscribe((data) => {
  //     this.accountTransactionList = data.result;
  //   });
  // }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllBankPaymentVouchrs() {
    this.accountapi.GetBankPaymentVouchers().subscribe((data) => {
      this.bankPaymentVoucherarry =
        data.result?.map((v: any) => ({
          ...v,
          accountName: this.getAccountName(v.bankPaymentVoucherCrAcNo) || '',
        })) || [];
      this.filterArray = this.bankPaymentVoucherarry;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim(),
    )?.maAccName;
  }

  new() {
    this.callDropdowns();
    this.browsebtn = true;
    this.CurrentselectedAccount = null;
    this.receivedAllocationData = [];
    this.bankPaymentVoucherFormGroup.reset();
    this.bankPaymentVoucherFormGroup.enable();
    this.bankPaymentvoucherentry.data = [];
    this.bankPaymentvoucherentry.readOnly = false;
    //this.bankPaymentvoucherentry.hiddenColumns['columns'].push(4);
    this.bankPaymentvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.bankPaymentvoucherentry);
    this.accountTransactionList = [];
    this.bankPaymentVoucherFormGroup.updateValueAndValidity();
    this.activeRow = { row: 0, column: 0 };
    this.bankPaymentVoucherFormGroup
      .get('bankPaymentVoucherCrAcNo')
      .setValue(-1);
    this.bankPaymentVoucherFormGroup.get('bankPaymentVoucherSno').setValue(0);
    this.bankPaymentVoucherFormGroup
      .get('bankPaymentVoucherVDt')
      .setValue(new Date());
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.GetDefaultSettings();
    this.updateTableConfiguration();
    this.refreshDebitAccountGrid();
  }
  pdcissuedACC: any = 0
  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
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
          this.f.bankPaymentVoucherCurrencyId.setValue(
            Number(this.DefCurrency)
          );
        }
      }
      this.masterapi.GetAllAccountsbyKey('PDC_ISSUED_AC_NO').subscribe((res) => {
        const value = res.result[0].accountSettingsAccountTextValue.split('::');
        this.pdcissuedACC = value[1]?.trim();
        // this.f.bankPaymentVoucherCrAcNo.setValue(value[1]?.trim());
      });

      this.getACValue();
    });
  }
  updateTableConfiguration() {
    const hiddenColumns = [];
    if (this.hideJobDetail) {
      hiddenColumns.push(4);
    }
    if (this.hideCostCenterDetail) {
      hiddenColumns.push(5);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }

  showMaximizableDialog() {
    this.callDropdowns();
    this.getAllBankPaymentVouchrs();
    this.displayMaximizable = true;
  }
  rptFilter: ReportFilterModel;

  getReport() {
    this.rptFilter = {
      ReportName:this.printWithAllocation ? 'BankPaymentVoucherwithAllocation' : 'BankPaymentVoucher',
      SelectionFormula: `{vw_bankpaymentvoucher.Bank_Payment_Voucher_SNo}= ${this.bankPaymentVoucherFormGroup.getRawValue().bankPaymentVoucherSno}`,
      Parameters: [],
      Queries: [
        // `select * from vw_bankpaymentvoucher where Bank_Payment_Voucher_SNo =${this.bankPaymentVoucherFormGroup.getRawValue().bankPaymentVoucherSno
        // }`,
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

  updateFormGrid(pymt: BankPaymentVoucher) {
    this.bankPaymentVoucherFormGroup.patchValue({
      bankPaymentVoucherVoucherNo: pymt.bankPaymentVoucherVoucherNo,
      bankPaymentVoucherVDt: new Date(pymt.bankPaymentVoucherVDt),
      bankPaymentVoucherRefNo: pymt.bankPaymentVoucherRefNo,
      bankPaymentVoucherCrAcNo: pymt.bankPaymentVoucherCrAcNo,
      bankPaymentVoucherCrAmount: pymt.bankPaymentVoucherDrAmount,
      bankPaymentVoucherDrAmount: pymt.bankPaymentVoucherDrAmount,
      bankPaymentVoucherNarration: pymt.bankPaymentVoucherNarration,
      bankPaymentVoucherCurrencyId: pymt.bankPaymentVoucherCurrencyId,
      bankPaymentVoucherSno: pymt.bankPaymentVoucherSno,
    });
    const toWords = new ToWords();
    this.debitword = this.convertNumberToWordsWithDecimal(
      pymt.bankPaymentVoucherDrAmount,
    );
    this.accountTransactionList = pymt.accountsTransactions;
    const gridData: GridData[] = pymt.bankPaymentVoucherDetails.map((k) => {
      const accountId: string =
        k.bankPaymentVoucherDetailsAcNo != null
          ? this.accountArray?.find((l) =>
            l.maAccNo.match(k.bankPaymentVoucherDetailsAcNo),
          )?.maAccName
          : null;

      const jobId: string =
        k.bankPaymentVoucherDetailsJobNo != null
          ? this.jobList?.find(
            (l) => l.value == k.bankPaymentVoucherDetailsJobNo,
          )?.label
          : null;

      const CostCentid: string =
        k.bankPaymentVoucherDetailsCostCenterId != null
          ? this.costcenterList?.find(
            (l) => l.value == k.bankPaymentVoucherDetailsCostCenterId,
          )?.label
          : null;

      return {
        account: accountId,
        debit: k.bankPaymentVoucherDetailsDrAmount,
        chequeno: k.bankPaymentVoucherDetailsChequeNo,
        chequedate: k.bankPaymentVoucherDetailsChequeDate 
          ? (k.bankPaymentVoucherDetailsChequeDate.toString().includes('T')
             ? k.bankPaymentVoucherDetailsChequeDate.toString().split('T')[0].split('-').reverse().join('/')
             : k.bankPaymentVoucherDetailsChequeDate)
          : null,
        jobname: jobId,
        costcenter: CostCentid,
        narration: k.bankPaymentVoucherDetailsNarration,
        pdc: k.bankPaymentVoucherDetailsPdc,
        id: k.bankPaymentVoucherDetailsId,
      };
    });
    this.bankPaymentvoucherentry.data = gridData;
    this.bankPaymentvoucherentry.readOnly = true;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.bankPaymentVoucherFormGroup.disable();
    this.f.bankPaymentVoucherVoucherNo.clearAsyncValidators();
    this.bankPaymentVoucherFormGroup.updateValueAndValidity();
    this.refreshDebitAccountGrid();
  }

  convertNumberToWordsWithDecimal(number: number): string {
    const toWords = new ToWords();

    const [integerPart, decimalPart] = number.toFixed(2).split('.');

    const integerWords = toWords.convert(parseInt(integerPart, 10));
    const decimalWords = toWords.convert(parseInt(decimalPart || '0', 10));

    let result = `${integerWords} `;

    if (decimalWords !== 'zero') {
      result += ` point ${decimalWords} `;
    }

    return result;
  }

  handleChange(e) {
    this.index = e.index;
    if (this.index == 0) {
      this.refreshDebitAccountGrid();
    }
    if (this.index == 2) {
      if (this.savedBankPaymentVoucher?.bankPaymentVoucherVoucherNo) {
        this.CurrentselectedAccount = this.buildAllocationContext(
          this.savedBankPaymentVoucher
        );
      }
    }
  }

  refreshCurrentVoucherFromAllocation(action?: string) {
    if (!this.savedBankPaymentVoucher?.bankPaymentVoucherSno) {
      return;
    }

    const currentTab = this.index;
    this.accountapi
      .GetSavedBankPaymentDetails(
        String(this.savedBankPaymentVoucher.bankPaymentVoucherSno)
      )
      .subscribe(
        (data) => {
          if (data?.result) {
            this.allowEditAfterRelease = action === 'released';
            const normalizedVoucher = {
              ...data.result,
              bankPaymentVoucherDetails:
                this.allowEditAfterRelease &&
                (!Array.isArray(data.result.bankPaymentVoucherDetails) ||
                  !data.result.bankPaymentVoucherDetails.length)
                  ? this.savedBankPaymentVoucher?.bankPaymentVoucherDetails || []
                  : data.result.bankPaymentVoucherDetails,
              bankPaymentVoucherDrAmount:
                this.allowEditAfterRelease &&
                !Number(data.result.bankPaymentVoucherDrAmount || 0)
                  ? this.savedBankPaymentVoucher?.bankPaymentVoucherDrAmount ||
                    data.result.bankPaymentVoucherDrAmount
                  : data.result.bankPaymentVoucherDrAmount,
              bankPaymentVoucherCrAmount:
                this.allowEditAfterRelease &&
                !Number(data.result.bankPaymentVoucherCrAmount || 0)
                  ? this.savedBankPaymentVoucher?.bankPaymentVoucherCrAmount ||
                    data.result.bankPaymentVoucherCrAmount
                  : data.result.bankPaymentVoucherCrAmount,
            };

            if (this.allowEditAfterRelease) {
              const releasedSourceTransaction =
                this.getBankPaymentSourceTransaction(normalizedVoucher);
              if (releasedSourceTransaction) {
                releasedSourceTransaction.accountsTransactionsAllocDebit = 0;
                releasedSourceTransaction.accountsTransactionsFcAllocDebit = 0;
                releasedSourceTransaction.accountsTransactionsAllocBalance =
                  Number(
                    releasedSourceTransaction.accountsTransactionsDebit || 0
                  );
              }
            }

            this.reconcileBankPaymentVoucherAllocationState(
              normalizedVoucher,
              (finalVoucher) => {
                this.isChequeCleared =
                  finalVoucher?.pdcDetails?.some(
                    (pdc) => pdc.pdC_Details_Cheque_Status === 'C'
                  ) ?? false;
                this.accountTransactionList = finalVoucher.accountsTransactions;
                this.updateFormGrid(finalVoucher);
                this.savedBankPaymentVoucher = finalVoucher;
                this.CurrentselectedAccount = this.buildAllocationContext(
                  finalVoucher
                );
                this.btnFlag = {
                  edit: true,
                  cancel: true,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.bankPaymentVoucherFormGroup.disable();
                this.index = currentTab;
                this.refreshDebitAccountGrid();
                if (action === 'released') {
                  this.getAllBankPaymentVouchrs();
                }
              }
            );
          }
        },
        () => { }
      );
  }

  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.LoadJobDDL();
    this.LoadCurruncyDDL();
    this.LoadCostCenterDDL();
    this.LoadChartOfAccountDDL();

    this.GetDefaultSettings();
  }

  GetSavedBankPaymentDetails(id: string) {
    this.index = 0;
    this.allowEditAfterRelease = false;
    this.bankPaymentHasActiveAllocation = false;
    this.accountapi.GetSavedBankPaymentDetails(id).subscribe(
      (data) => {
        this.reconcileBankPaymentVoucherAllocationState(
          data.result,
          (finalVoucher) => {
            this.btnFlag = {
              edit: true,
              cancel: true,
              save: false,
              update: true,
              delete: true,
            };

            this.isChequeCleared =
              finalVoucher?.pdcDetails?.some(
                (pdc) => pdc.pdC_Details_Cheque_Status === 'C'
              ) ?? false;
            this.accountTransactionList = finalVoucher.accountsTransactions;

            this.updateFormGrid(finalVoucher);
            this.savedBankPaymentVoucher = finalVoucher;
            this.CurrentselectedAccount =
              this.buildAllocationContext(finalVoucher);
          }
        );
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
      },
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.accountapi
          .DeleteBankPaymentVoucher(this.savedBankPaymentVoucher)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Payment Voucher Deleted Succesfully',
              });
              this.new();
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Failed',
              });
            },
          );
      },
    });
  }

  cancel() {
    this.GetSavedBankPaymentDetails(
      this.bankPaymentVoucherFormGroup.getRawValue()
        .bankPaymentVoucherVoucherNo,
    );
  }

edit() {
  // 1. Instantly check the variable you saved earlier
  if (this.isChequeCleared) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Alert',
      detail: 'PDC Posted Against This Voucher You cannot Edit'
    });
    return; // Stop here
  }

  if (
    !this.allowEditAfterRelease &&
    this.shouldBlockBankPaymentVoucherEdit(this.savedBankPaymentVoucher)
  ) {
      this.messageService.add({
      severity: 'warn',
      summary: 'Alert',
      detail:
        'To edit this voucher, please release its allocation first.'
    });
    return;
  }

  // 2. Your normal edit logic
  this.browsebtn = true;
  this.bankPaymentvoucherentry.readOnly = false;
  this.hotRegisterer.getInstance(this.hotid).updateSettings({ readOnly: false });
  this.f.bankPaymentVoucherVoucherNo.clearValidators();
  this.bankPaymentVoucherFormGroup.enable();
  this.bankPaymentVoucherFormGroup.controls.bankPaymentVoucherVoucherNo.disable();
  this.bankPaymentVoucherFormGroup.updateValueAndValidity();
  this.updateTableConfiguration();
  this.refreshDebitAccountGrid();
}

  public get IsValidGrid(): boolean {
    if (this.bankPaymentvoucherentry.data.length > 0) {
      return Object.values(this.bankPaymentvoucherentry.data).some(
        (k: GridData) => k.account != null && k.debit != null,
      );
      // });
    }
    return false;
  }

  selectaccount(evt) {
    const hot = this.hotRegisterer.getInstance(this.hotid);

    if (this.activeRow.column !== 1) {
      hot.setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
      hot.selectCell(this.activeRow.row, this.activeRow.column + 1);
    }
    hot.selectCell(this.activeRow.row, 1);

    this.showAccountLookUp = false;
  }
  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
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
      this.bankpaymentVoucherFilterForm.value.bankPaymentVoucherNo != null &&
      this.bankpaymentVoucherFilterForm.value.bankPaymentVoucherNo.trim() !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.bankPaymentVoucherVoucherNo?.toUpperCase() ===
          this.bankpaymentVoucherFilterForm.value.bankPaymentVoucherNo.trim().toUpperCase()
      );
    }

    const selectedAcNo = this.bankpaymentVoucherFilterForm.value.bankPaymentVoucherAcNo;
    if (
      selectedAcNo != null &&
      selectedAcNo !== '' &&
      selectedAcNo !== -1 &&
      selectedAcNo !== '-1'
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.bankPaymentVoucherCrAcNo?.trim() === selectedAcNo?.toString().trim() ||
          res.bankPaymentVoucherDetails?.some(
            (d) =>
              d.bankPaymentVoucherDetailsAcNo?.trim() ===
              selectedAcNo?.toString().trim()
          ) ||
          res.accountsTransactions?.some(
            (t) =>
              t.accountsTransactionsAccNo?.trim() ===
              selectedAcNo?.toString().trim()
          )
      );
    }

    if (this.bankpaymentVoucherFilterForm.value.isDate) {
      const fromDateStr = this.bankpaymentVoucherFilterForm.value.fromDate;
      const toDateStr = this.bankpaymentVoucherFilterForm.value.toDate;

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);
      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.bankPaymentVoucherVDt);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });
    }
    this.bankPaymentVoucherarry = filteredArray;
  }
  ClearFilter(table?: any, searchInput?: any) {
    this.bankpaymentVoucherFilterForm.reset();
    this.bankpaymentVoucherFilterForm.get('bankPaymentVoucherAcNo').setValue(null);
    this.bankpaymentVoucherFilterForm.get('fromDate').setValue(new Date());
    this.bankpaymentVoucherFilterForm.get('toDate').setValue(new Date());
    this.bankPaymentVoucherarry = this.filterArray;
    if (table) {
      table.filterGlobal('', 'contains');
    }
    if (searchInput) {
      searchInput.value = '';
    }
  }

  private toUtcDateString(dateVal: any): string {
    if (!dateVal) return null;
    let year, month, day;
    if (typeof dateVal === 'string') {
      if (dateVal.includes('/')) {
        const parts = dateVal.split('/');
        year = parseInt(parts[2], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[0], 10);
      } else if (dateVal.includes('T')) {
        const datePart = dateVal.split('T')[0];
        const parts = datePart.split('-');
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        const d = new Date(dateVal);
        year = d.getFullYear();
        month = d.getMonth();
        day = d.getDate();
      }
    } else {
      year = dateVal.getFullYear();
      month = dateVal.getMonth();
      day = dateVal.getDate();
    }
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00.000Z`;
  }

  private hasValidChequeNumbers(rows: any[]): boolean {
    const maxChequeNo = 2147483647;
    const hasInvalidCheque = (rows || []).some((row) => {
      if (
        row?.chequeno === null ||
        row?.chequeno === undefined ||
        row?.chequeno === ''
      ) {
        return false;
      }

      const chequeNo = Number(row.chequeno);
      return (
        !Number.isFinite(chequeNo) ||
        !Number.isInteger(chequeNo) ||
        chequeNo < 0 ||
        chequeNo > maxChequeNo
      );
    });

    if (hasInvalidCheque) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail:
          'Cheque No must be a whole number between 0 and 2147483647.',
      });
      return false;
    }

    return true;
  }

  private normalizeChequeNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return Number(value);
  }

  private buildAllocationContext(voucher: BankPaymentVoucher) {
    const firstDetail = voucher?.bankPaymentVoucherDetails?.find(
      (detail) => detail?.bankPaymentVoucherDetailsDelStatus !== true
    );
    const sourceTransaction = this.getBankPaymentSourceTransaction(
      voucher,
      firstDetail
    );
    if (!sourceTransaction || !firstDetail) {
      return null;
    }

    return {
      ...sourceTransaction,
      vType: 'BANK PAYMENT',
      refNO: voucher.bankPaymentVoucherVoucherNo,
      accNO: firstDetail.bankPaymentVoucherDetailsAcNo,
      allocationId: voucher.bankPaymentVoucherAllocId,
      allocationVoucherVcreation: AllocationSourceType.BankPaymentVoucher,
    };
  }

  private getBankPaymentSourceTransaction(
    voucher: BankPaymentVoucher,
    firstDetail = voucher?.bankPaymentVoucherDetails?.find(
      (detail) => detail?.bankPaymentVoucherDetailsDelStatus !== true
    )
  ) {
    if (!firstDetail) {
      return null;
    }

    return (
      voucher?.accountsTransactions?.find(
        (transaction) =>
          transaction?.accountsTransactionsVoucherNo ===
            voucher?.bankPaymentVoucherVoucherNo &&
          transaction?.accountsTransactionsAccNo ===
            firstDetail?.bankPaymentVoucherDetailsAcNo &&
          Number(transaction?.accountsTransactionsDebit || 0) > 0
      ) ||
      voucher?.accountsTransactions?.find(
        (transaction) =>
          transaction?.accountsTransactionsVoucherNo ===
            voucher?.bankPaymentVoucherVoucherNo &&
          Number(transaction?.accountsTransactionsDebit || 0) > 0
      ) ||
      null
    );
  }

  private hasBankPaymentLinkedAllocations(voucher: BankPaymentVoucher): boolean {
    const rows =
      (voucher as any)?.allocationDetails || voucher?.AllocationDetails || [];
    if (!Array.isArray(rows) || !rows.length) {
      return false;
    }

    return rows.some(
      (row) =>
        Number(row?.Debit || 0) > 0 ||
        Number(row?.Credit || 0) > 0 ||
        Number(row?.NetAllocation || 0) > 0
    );
  }

  private reconcileBankPaymentVoucherAllocationState(
    voucher: BankPaymentVoucher,
    callback: (voucher: BankPaymentVoucher) => void
  ) {
    const firstDetail = voucher?.bankPaymentVoucherDetails?.find(
      (detail) => detail?.bankPaymentVoucherDetailsDelStatus !== true
    );
    const accNo = firstDetail?.bankPaymentVoucherDetailsAcNo;
    const voucherNo = voucher?.bankPaymentVoucherVoucherNo;

    if (!accNo || !voucherNo) {
      this.bankPaymentHasActiveAllocation = false;
      callback(this.normalizeReleasedBankPaymentVoucher(voucher));
      return;
    }

    this.accountstatement
      .getPaymentAllocationVoucherDetails(accNo, voucherNo, 'BANK PAYMENT')
      .subscribe(
        (response: any) => {
          const rows = Array.isArray(response?.result) ? response.result : [];
          const sourceVoucherNo = (voucherNo || '').toUpperCase();
          const hasTargetRows = rows.some((row) => {
            const rowVoucherNo = (row?.voucherNo || '').toUpperCase();
            const rowType = (row?.type || '').toUpperCase();
            const allocationStatus = (row?.allocationStatus || '').toUpperCase();
            const allocAmount = Number(row?.allocAmount || 0);

            return (
              rowVoucherNo !== sourceVoucherNo &&
              rowType === 'PURCHASEVOUCHER' &&
              (allocAmount > 0 ||
                allocationStatus === 'PARTIAL' ||
                allocationStatus === 'FULL')
            );
          });

          this.bankPaymentHasActiveAllocation = hasTargetRows;
          callback(
            hasTargetRows
              ? voucher
              : this.normalizeReleasedBankPaymentVoucher(voucher)
          );
        },
        () => {
          this.bankPaymentHasActiveAllocation =
            this.hasBankPaymentLinkedAllocations(voucher);
          callback(voucher);
        }
      );
  }

  private normalizeReleasedBankPaymentVoucher(
    voucher: BankPaymentVoucher
  ): BankPaymentVoucher {
    const normalizedVoucher: BankPaymentVoucher = {
      ...voucher,
      bankPaymentVoucherAllocId: 0,
      AllocationDetails: [],
    };

    const sourceTransaction =
      this.getBankPaymentSourceTransaction(normalizedVoucher);
    if (sourceTransaction) {
      sourceTransaction.accountsTransactionsAllocDebit = 0;
      sourceTransaction.accountsTransactionsFcAllocDebit = 0;
      sourceTransaction.accountsTransactionsAllocBalance = Number(
        sourceTransaction.accountsTransactionsDebit || 0
      );
    }

    return normalizedVoucher;
  }

  private isBankPaymentVoucherFullyAllocated(voucher: BankPaymentVoucher): boolean {
    const sourceTransaction = this.getBankPaymentSourceTransaction(voucher);
    if (
      !this.hasBankPaymentLinkedAllocations(voucher) ||
      !sourceTransaction ||
      Number(voucher?.bankPaymentVoucherAllocId || 0) <= 0
    ) {
      return false;
    }

    return Number(sourceTransaction.accountsTransactionsAllocBalance || 0) <= 0;
  }

  private shouldBlockBankPaymentVoucherEdit(
    voucher: BankPaymentVoucher
  ): boolean {
    const sourceTransaction = this.getBankPaymentSourceTransaction(voucher);
    if (!sourceTransaction) {
      return false;
    }

    return (
      this.bankPaymentHasActiveAllocation &&
      Number(sourceTransaction.accountsTransactionsAllocBalance || 0) <= 0
    );
  }

  private refreshDebitAccountGrid() {
    setTimeout(() => {
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      if (!hotInstance) {
        return;
      }

      hotInstance.render();
      hotInstance.refreshDimensions();
    });
  }
}

interface GridData {
  account?: string;
  debit?: number;
  chequeno?: number;
  chequedate?: any;
  jobname?: string;
  costcenter?: string;
  narration?: string;
  pdc?: boolean;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const bankPVoucherColumnList = (
  component: BankPaymentvoucherComponent,
) => [
    {
      data: 'account',
      type: 'autocomplete',
      label: 'Account',
      toolTip: 'Account',
      source: component.acctArry,
    },
    {
      data: 'debit',
      type: 'numeric',
      label: 'Debit',
      toolTip: 'Debit',
      readOnly: false,
      numericFormat: {
        pattern: '0,0.00',
      },
      width: 80,
    },
    {
      data: 'chequeno',
      type: 'numeric',
      label: 'Cheque No',
      toolTip: 'Cheque No',
      readOnly: false,
      numericFormat: {
        pattern: '0,0',
      },
      width: 80,
    },
    {
      data: 'chequedate',
      type: 'date',
      label: 'Cheque Date',
      readOnly: false,
      toolTip: 'Cheque Date',
      width: 100,
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
      width: 100,
    },
    {
      data: 'narration',
      type: 'text',
      label: 'Narration',
      readOnly: false,
      toolTip: 'Narration',
      width: 150,
    },
    {
      data: 'pdc',
      type: 'checkbox',
      label: 'PDC',
      toolTip: 'Post Dated Cheque',
      width: 60,
    },
  ];
