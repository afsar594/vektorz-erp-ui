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
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { BankReceiptVoucher } from 'src/app/routes/domain/Accounts/BankReceiptVoucher';
import { BankReceiptVoucherDetails } from 'src/app/routes/domain/Accounts/BankReceiptVoucherDetails';
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
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { AllocationSourceType } from 'src/app/routes/domain/Accounts/allocation-source-type.enum';

@Component({
  selector: 'app-bankreceiptvoucher',
  templateUrl: './bankreceiptvoucher.component.html',
  styleUrls: ['./bankreceiptvoucher.component.scss'],
})
export class BankReceiptvoucherComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  BankReceiptVoucherFilterForm: FormGroup;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  lookupGridColumns = [];
  dataList: Array<any> = [];
  showAccountLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;
  printWithAllocation: boolean = false;

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  DefAcc: string = '01001002';
  DefAccCheck: string;

  usrid: number;
  fsno: number;
  locId: number;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: any[] = [];
  CurrentselectedAccount: any;

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  getbankMasterAccount: any;
  accountArraydropdown: ChartofAccounts[] = [];
  acctArrydropdown: string[] = [];
  accountListdropdown: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  bankReceiptVoucherarry: BankReceiptVoucher[] = [];
  // savedPaymentVoucherGridData: GridData[] = [];
  savedBankReceiptVoucher: BankReceiptVoucher;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'bankRcptVouchrEntry';
  displayPrintPreview: boolean = false;
  craditword: string = '';
  date = new Date();
  receivedAllocationData: any[] = [];
  allowEditAfterRelease: boolean = false;
  bankReceiptHasActiveAllocation: boolean = false;
  ScreenId: number;
  Permission: any;
  filterArray: any;
  callDDLs: boolean = false;
  user: any;
  JOBCOST: boolean = true;
  cols;
  pdfSource: string;
  contraSettings: boolean = false;
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
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,
    private accountstatement: AccountstatementService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  bankReceiptvoucherentry: Handsontable.GridSettings;
  bankReceiptVoucherFormGroup: FormGroup;
  // accountTransactionDataset = [];
  vNo: string = '';
  ngAfterViewInit() { }

  ngOnInit(): void {
    console.log("bankreceiptvouch");
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

    this.cols = [
      { field: 'bankReceiptVoucherVoucherNo', header: 'Voucher No' },
      { field: 'bankReceiptVoucherVDate', header: 'Date' },
      { field: 'bankReceiptVoucherDrAcNo', header: 'Account' },
      { field: 'bankReceiptVoucherDrAmount', header: 'Vchr.Debit' },
      { field: 'bankReceiptVoucherCrAmount', header: 'Vchr.Credit' },
      { field: 'bankReceiptVoucherNarration', header: 'Particulars' },
      { field: 'bankReceiptVoucherDrAmount', header: 'Dtls.Debit' },
      { field: 'bankReceiptVoucherCrAmount', header: 'Dtls.Credit' },
      { field: 'action', header: '' },
    ];
    this.initializeControls();
    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedBankReceiptDetails(this.vNo);
    }

    this.bankReceiptVoucherFormGroup = this.fb.group({
      bankReceiptVoucherVoucherNo: [{ value: null, disabled: true }],
      bankReceiptVoucherVDate: [null],
      bankReceiptVoucherRefNo: [''],
      bankReceiptVoucherDrAcNo: [-1, [DropDownValidator]],
      bankReceiptVoucherCrAmount: [null],
      bankReceiptVoucherDrAmount: 0,
      bankReceiptVoucherNarration: [''],
      bankReceiptVoucherSno: [0],
    });
    this.bankReceiptVoucherFormGroup.disable();
    this.BankReceiptVoucherFilterForm = this.fb.group({
      BankReceiptVoucherAcNo: [null],
      isDate: [],
      BankReceiptVoucherNo: [null],
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
    this.bankReceiptVoucherFormGroup.disable();
    this.getbankACValue();

    this.bykeys();
  }

  get f() {
    return this.bankReceiptVoucherFormGroup.controls;
  }
  rptFilter: ReportFilterModel;
  getReport() {
    this.rptFilter = {
      ReportName: this.printWithAllocation ? 'BankRecieptVoucherwithAllocation' : 'BankRecieptVoucher',
      SelectionFormula: `{VW_BankRecieptVoucher.Bank_Receipt_Voucher_SNo}= ${this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherSno}  `,
      Parameters: [],
      Queries: [
        // `select * from VW_BankRecieptVoucher where Bank_Receipt_Voucher_SNo =${this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherSno
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

  initializeControls() {
    let cols = bankRVoucherColumnList(this);

    let hiddenColumn = [4, 5];

    this.bankReceiptvoucherentry = this.utilityService.getTableConfig(
      cols,
      hiddenColumn
    );

    this.bankReceiptvoucherentry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);

      if (column === 0 && this.bankReceiptvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 4 &&
        this.bankReceiptvoucherentry.readOnly === false
      ) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;

        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 5 &&
        this.bankReceiptvoucherentry.readOnly === false
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

    this.bankReceiptvoucherentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.bankReceiptvoucherentry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.bankReceiptvoucherentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum();
    };

    this.bankReceiptvoucherentry.afterValidate = (
      isValid,
      value,
      row,
      prop
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
  LoadCurruncyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((m: any) => {
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
        value1: kl.currencyMasterCurrencyRate,
      }));
      this.currArry = m.resultSet.currencyMasters;
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
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
      const acc = m.resultSet.masterAccountsTables?.filter(
        (item) => item.maRelativeNo === this.getbankMasterAccount
      );

      this.accountArraydropdown = acc;
      this.accountListdropdown = acc?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountListdropdown.unshift({ label: '--Select--', value: -1 });
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  receiveData(data: any) {
    this.receivedAllocationData = [];
    data.forEach((e) => {
      if (e.IsSelected === true) {
        this.receivedAllocationData.push(e);
      }
    });
  }
  ColumnSum() {
    if (this.bankReceiptvoucherentry.readOnly) {
      return;
    }

    if (this.bankReceiptvoucherentry.data.length > 0) {
      var value = 0;
      this.bankReceiptvoucherentry.data.forEach((elemt: any) => {
        if (elemt && elemt.credit > 0) {
          value += elemt.credit;
        }
      });
      value = parseFloat(value.toFixed(2));
      this.bankReceiptVoucherFormGroup.controls.bankReceiptVoucherCrAmount.setValue(
        value
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

  saveBankReceiptVoucher() {
    this.bankReceiptVoucherFormGroup.markAllAsTouched();
    const savedData: any = this.bankReceiptvoucherentry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    if (!this.hasValidChequeNumbers(savedData)) {
      return;
    }
    const bankReceiptVoucher: BankReceiptVoucher = this
      .bankReceiptVoucherFormGroup.value as BankReceiptVoucher;

    if (this.f.bankReceiptVoucherVDate.value) {
      bankReceiptVoucher.bankReceiptVoucherVDate = this.toUtcDateString(this.f.bankReceiptVoucherVDate.value) as any;
    }

    bankReceiptVoucher.bankReceiptVoucherVoucherNo =
      this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherVoucherNo;
    bankReceiptVoucher.bankReceiptVoucherCrAmount =
      this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherCrAmount;
    bankReceiptVoucher.bankReceiptVoucherFrCrAmount = 0;
    bankReceiptVoucher.bankReceiptVoucherFsno = this.fsno;
    bankReceiptVoucher.bankReceiptVoucherUserId = this.usrid;
    bankReceiptVoucher.bankReceiptVoucherLocationId = this.locId;
    bankReceiptVoucher.bankReceiptVoucherAllocId =
      this.savedBankReceiptVoucher?.bankReceiptVoucherAllocId || 0;
    bankReceiptVoucher.accountsTransactions = [];
    bankReceiptVoucher.AllocationDetails = this.receivedAllocationData;
    // bankReceiptVoucher.bankReceiptVoucherSno = this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherSno,
    bankReceiptVoucher.bankReceiptVoucherDetails = savedData
      ?.filter((k) => k.account != null && k.credit != null)
      .map((k: GridData) => {
        return {
          bankReceiptVoucherDetailsId: k.id != null ? k.id : 0,
          bankReceiptVoucherDetailsVoucherNo:
            this.bankReceiptVoucherFormGroup.getRawValue()
              .bankReceiptVoucherVoucherNo,
          bankReceiptVoucherDetailsSno: 0,
          bankReceiptVoucherSno:
            this.bankReceiptVoucherFormGroup.getRawValue()
              .bankReceiptVoucherSno,
          bankReceiptVoucherDetailsAcNo: this.accountArray?.find(
            (x) => x.maAccName?.trim() === k.account?.trim()
          ).maAccNo,
          bankReceiptVoucherDetailsDrAmount: 0,
          bankReceiptVoucherDetailsDrFcAmount: 0,
          bankReceiptVoucherDetailsCrAmount: k.credit,
          bankReceiptVoucherDetailsCrFcAmount: k.credit,
          bankReceiptVoucherDetailsJobNo:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                ?.value
              : -1,
          bankReceiptVoucherDetailsCostCenterId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                (j) =>
                  j.costCenterMasterCostCenterName?.trim() ===
                  k.costcenter?.trim()
              ).costCenterMasterCostCenterId
              : null,
          // bankReceiptVoucherDetailsCostCenterId: 0,
          bankReceiptVoucherDetailsNarration: k.narration,
          bankReceiptVoucherDetailsFsno: this.fsno,
          bankReceiptVoucherDetailsChequeDate: k.chequedate
            ? this.toUtcDateString(k.chequedate)
            : null,
          bankReceiptVoucherDetailsChequeNo: this.normalizeChequeNumber(
            k.chequeno
          ),
          bankReceiptVoucherDetailsDelStatus: false,
          bankReceiptVoucherDetailsPdc: k.pdc,
        };
      });

    bankReceiptVoucher.bankReceiptVoucherDetails
      ?.filter((x) => x.bankReceiptVoucherDetailsDelStatus === false)
      .forEach((element) => {
        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: element.bankReceiptVoucherDetailsAcNo,
          accountsTransactionsTransDate: bankReceiptVoucher.bankReceiptVoucherVDate,
          accountsTransactionsParticulars:
            element.bankReceiptVoucherDetailsNarration,
          accountsTransactionsCredit: element.bankReceiptVoucherDetailsCrAmount,
          accountsTransactionsFcCredit: element.bankReceiptVoucherDetailsCrAmount,//* (this.currArry?.find(x=> x.currencyMasterCurrencyId == this.f.bankReceiptVoucherCurrencyId.value)?.currencyMasterCurrencyRate ?? 1),
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            element.bankReceiptVoucherDetailsVoucherNo,
          accountsTransactionsDescription:
            element.bankReceiptVoucherDetailsNarration,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsJobNo: element.bankReceiptVoucherDetailsJobNo,
          accountsTransactionsCostCenterId:
            element.bankReceiptVoucherDetailsCostCenterId,
        };
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: element.bankReceiptVoucherDetailsPdc ? this.pdcRecievedACC : this.f.bankReceiptVoucherDrAcNo.value,
          accountsTransactionsTransDate: bankReceiptVoucher.bankReceiptVoucherVDate,
          accountsTransactionsParticulars:
            this.f.bankReceiptVoucherNarration.value,
          accountsTransactionsDebit: element.bankReceiptVoucherDetailsCrAmount || 0,
          accountsTransactionsFcDebit: element.bankReceiptVoucherDetailsCrAmount, // * (this.currArry?.find(x=> x.currencyMasterCurrencyId == this.f.bankReceiptVoucherCurrencyId.value)?.currencyMasterCurrencyRate ?? 1),
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.bankReceiptVoucherFormGroup.getRawValue()
              .bankReceiptVoucherVoucherNo,
          accountsTransactionsDescription:
            this.f.bankReceiptVoucherNarration.value,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsJobNo: this.contraSettings
            ? element.bankReceiptVoucherDetailsJobNo
            : -1,
          accountsTransactionsCostCenterId:
            element.bankReceiptVoucherDetailsCostCenterId,
        };
        bankReceiptVoucher.accountsTransactions.push(debitData);
        bankReceiptVoucher.accountsTransactions.push(creditData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(bankReceiptVoucher);
    } else {
      this.updateVoucher(bankReceiptVoucher);
    }
  }

  saveVoucher(bankReceiptVoucher: BankReceiptVoucher) {
    this.bankReceiptVoucherFormGroup.markAllAsTouched();
    if (this.bankReceiptVoucherFormGroup.invalid) return;

    if (this.bankReceiptVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.accountapi
            .InsertBankReceiptVoucher(bankReceiptVoucher)
            .subscribe(
              (data) => {
                const isFullyAllocated = this.isBankReceiptVoucherFullyAllocated(
                  data.result
                );
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedBankReceiptVoucher = data.result;
                this.updateFormGrid(data.result);
                this.CurrentselectedAccount = this.buildAllocationContext(
                  data.result
                );
                if (data.valid) {
                  this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('Alert'),
                    detail: this.translate.instant(data.message),
                  });
                } else if (data.error) {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail:
                      data.message != null && data.message?.trim() !== ''
                        ? data.message
                        : data.exception,
                  });
                }
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: this.translate.instant(
                    'Bank Receipt Voucher Save Failed'
                  ),
                });
              }
            );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Bank Receipt Voucher Save Failed'),
      });
      this.bankReceiptVoucherFormGroup.markAllAsTouched();
      this.bankReceiptVoucherFormGroup.markAsDirty();
    }
  }

  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'Bank Receipt Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.bankReceiptVoucherFormGroup
        .get('bankReceiptVoucherVoucherNo')
        .value?.toString(),
      vpType: 'Bank Receipt Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  updateVoucher(bankReceiptVoucher: BankReceiptVoucher) {
    if (
      !this.allowEditAfterRelease &&
      this.shouldBlockBankReceiptVoucherEdit(this.savedBankReceiptVoucher)
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
        this.accountapi.UpdateBankReceiptVoucher(bankReceiptVoucher).subscribe(
          (data) => {
            const isFullyAllocated = this.isBankReceiptVoucherFullyAllocated(
              data.result
            );
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.savedBankReceiptVoucher = data.result;
            this.updateFormGrid(data.result);
            this.CurrentselectedAccount = this.buildAllocationContext(
              data.result
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Bank Receipt Voucher Saved Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Bank Receipt Voucher Save Failed',
            });
          }
        );
      },
    });
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 12) {
      return Math.max(0, 12 - salesVoucherDetailsLength);
    } else {
      return;
    }
  }
  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllBankReceiptVouchrs() {
    this.accountapi.GetBankReceiptVouchers().subscribe((data) => {
      this.bankReceiptVoucherarry = data.result;
      this.filterArray = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }
  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.LoadJobDDL();
    this.LoadCurruncyDDL();
    this.LoadCostCenterDDL();
    this.LoadChartOfAccountDDL();

    this.GetDefaultSettings();
    this.callDDLs = true;
  }

  new() {
    this.CurrentselectedAccount = null;
    this.receivedAllocationData = [];
    this.bankReceiptVoucherFormGroup.reset();
    this.bankReceiptVoucherFormGroup.enable();
    this.bankReceiptvoucherentry.data = [];
    this.bankReceiptvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.bankReceiptvoucherentry);
    this.accountTransactionList = [];
    this.bankReceiptVoucherFormGroup.get('bankReceiptVoucherSno').setValue(0);

    this.bankReceiptVoucherFormGroup
      .get('bankReceiptVoucherVDate')
      .setValue(new Date());

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.callDropdowns();
    this.GetDefaultSettings();
    this.updateTableConfiguration();
    this.refreshCreditAccountGrid();
  }
  pdcRecievedACC: any = 0
  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
        }
      }
      this.masterapi.GetAllAccountsbyKey('PDC_RECEIVED_AC_NO').subscribe((res) => {
        const value = res.result[0].accountSettingsAccountTextValue.split('::');
        this.pdcRecievedACC = value[1]?.trim();
        // this.f.bankPaymentVoucherCrAcNo.setValue(value[1]?.trim());
      });
    });
    this.getACValue();
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

      this.f.bankReceiptVoucherDrAcNo.setValue(value[1]?.trim());
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

  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;

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

  showMaximizableDialog() {
    this.callDropdowns();
    this.getAllBankReceiptVouchrs();
    this.displayMaximizable = true;
  }

  updateFormGrid(pymt: BankReceiptVoucher) {
    this.bankReceiptVoucherFormGroup.patchValue({
      bankReceiptVoucherVoucherNo: pymt.bankReceiptVoucherVoucherNo,
      bankReceiptVoucherVDate: new Date(pymt.bankReceiptVoucherVDate),
      bankReceiptVoucherRefNo: pymt.bankReceiptVoucherRefNo,
      bankReceiptVoucherDrAcNo: pymt.bankReceiptVoucherDrAcNo,
      bankReceiptVoucherCrAmount: pymt.bankReceiptVoucherCrAmount,
      bankReceiptVoucherDrAmount: pymt.bankReceiptVoucherDrAmount,
      bankReceiptVoucherNarration: pymt.bankReceiptVoucherNarration,

      bankReceiptVoucherSno: pymt.bankReceiptVoucherSno,
    });

    this.accountTransactionList = pymt.accountsTransactions;

    this.craditword = this.convertNumberToWordsWithDecimal(
      pymt?.bankReceiptVoucherCrAmount
    );
    const gridData: GridData[] = pymt.bankReceiptVoucherDetails.map((k) => {
      const accountId: string =
        k.bankReceiptVoucherDetailsAcNo != null
          ? this.accountArray?.find((l) =>
            l.maAccNo.match(k.bankReceiptVoucherDetailsAcNo)
          )?.maAccName
          : null;
      const jobId: string =
        k.bankReceiptVoucherDetailsJobNo != null
          ? this.jobList?.find(
            (l) => l.value == k.bankReceiptVoucherDetailsJobNo
          )?.label
          : null;

      const CostCentid: string =
        k.bankReceiptVoucherDetailsCostCenterId != null
          ? this.costcenterList?.find(
            (l) => l.value == k.bankReceiptVoucherDetailsCostCenterId
          )?.label
          : null;

      return {
        account: accountId,
        credit: k.bankReceiptVoucherDetailsCrAmount,
        chequeno: k.bankReceiptVoucherDetailsChequeNo,
        chequedate: k.bankReceiptVoucherDetailsChequeDate 
          ? (k.bankReceiptVoucherDetailsChequeDate.toString().includes('T')
             ? k.bankReceiptVoucherDetailsChequeDate.toString().split('T')[0].split('-').reverse().join('/')
             : k.bankReceiptVoucherDetailsChequeDate)
          : null,

        jobname: jobId,
        costcenter: CostCentid,
        narration: k.bankReceiptVoucherDetailsNarration,
        id: k.bankReceiptVoucherDetailsId,
        pdc: k.bankReceiptVoucherDetailsPdc,
      };
    });
    this.bankReceiptvoucherentry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.refreshCreditAccountGrid();
  }

  handleChange(e) {
    this.index = e.index;
    if (this.index == 0) {
      this.initializeControls();
      this.refreshCreditAccountGrid();
    }
    if (this.index == 2) {
      if (this.savedBankReceiptVoucher?.bankReceiptVoucherVoucherNo) {
        this.CurrentselectedAccount = this.buildAllocationContext(
          this.savedBankReceiptVoucher
        );
      }
    }
  }

  refreshCurrentVoucherFromAllocation(action?: string) {
    if (!this.savedBankReceiptVoucher?.bankReceiptVoucherSno) {
      return;
    }

    const currentTab = this.index;
    this.accountapi
      .GetSavedBankReceiptDetails(
        String(this.savedBankReceiptVoucher.bankReceiptVoucherSno)
      )
      .subscribe(
        (data) => {
          if (data?.result) {
            this.allowEditAfterRelease = action === 'released';
            const normalizedVoucher = {
              ...data.result,
              bankReceiptVoucherDetails:
                this.allowEditAfterRelease &&
                (!Array.isArray(data.result.bankReceiptVoucherDetails) ||
                  !data.result.bankReceiptVoucherDetails.length)
                  ? this.savedBankReceiptVoucher?.bankReceiptVoucherDetails || []
                  : data.result.bankReceiptVoucherDetails,
              bankReceiptVoucherCrAmount:
                this.allowEditAfterRelease &&
                !Number(data.result.bankReceiptVoucherCrAmount || 0)
                  ? this.savedBankReceiptVoucher?.bankReceiptVoucherCrAmount ||
                    data.result.bankReceiptVoucherCrAmount
                  : data.result.bankReceiptVoucherCrAmount,
              bankReceiptVoucherDrAmount:
                this.allowEditAfterRelease &&
                !Number(data.result.bankReceiptVoucherDrAmount || 0)
                  ? this.savedBankReceiptVoucher?.bankReceiptVoucherDrAmount ||
                    data.result.bankReceiptVoucherDrAmount
                  : data.result.bankReceiptVoucherDrAmount,
            };

            if (this.allowEditAfterRelease) {
              const releasedSourceTransaction =
                this.getBankReceiptSourceTransaction(normalizedVoucher);
              if (releasedSourceTransaction) {
                releasedSourceTransaction.accountsTransactionsAllocCredit = 0;
                releasedSourceTransaction.accountsTransactionsFcAllocCredit = 0;
                releasedSourceTransaction.accountsTransactionsAllocBalance =
                  Number(
                    releasedSourceTransaction.accountsTransactionsCredit || 0
                  );
              }
            }

            this.reconcileBankReceiptVoucherAllocationState(
              normalizedVoucher,
              (finalVoucher) => {
                this.accountTransactionList = finalVoucher.accountsTransactions;
                this.updateFormGrid(finalVoucher);
                this.savedBankReceiptVoucher = finalVoucher;
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
                this.bankReceiptVoucherFormGroup.disable();
                this.index = currentTab;
                this.refreshCreditAccountGrid();
                if (action === 'released') {
                  this.getAllBankReceiptVouchrs();
                }
              }
            );
          }
        },
        () => { }
      );
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

  GetSavedBankReceiptDetails(id: string) {
    this.index = 0;
    this.allowEditAfterRelease = false;
    this.bankReceiptHasActiveAllocation = false;
    this.accountapi.GetSavedBankReceiptDetails(id).subscribe(
      (data) => {
        this.reconcileBankReceiptVoucherAllocationState(
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
            this.savedBankReceiptVoucher = finalVoucher;
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
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.accountapi
          .DeleteBankReceiptVoucher(this.savedBankReceiptVoucher)
          .subscribe(
            (data) => {
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
            }
          );
      },
    });
  }

  cancel() {
    this.GetSavedBankReceiptDetails(
      this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherVoucherNo
    );
  }

  edit() {
    if (
      !this.allowEditAfterRelease &&
      this.shouldBlockBankReceiptVoucherEdit(this.savedBankReceiptVoucher)
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail:
          'To edit this voucher, please release its allocation first.',
      });
      return;
    }

    this.bankReceiptvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });

    this.f.bankReceiptVoucherVoucherNo.clearValidators();
    this.bankReceiptVoucherFormGroup.enable();
    this.bankReceiptVoucherFormGroup.controls.bankReceiptVoucherVoucherNo.disable();
    this.bankReceiptVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
    this.refreshCreditAccountGrid();
  }

  public get IsValidGrid(): boolean {
    if (this.bankReceiptvoucherentry.data.length > 0) {
      return Object.values(this.bankReceiptvoucherentry.data).some(
        (k: GridData) => k.account != null && k.credit != null
      );
    }
    return false;
  }
  selectaccount(evt) {
    const hot = this.hotRegisterer.getInstance(this.hotid);

    if (this.activeRow.column !== 1) {
      hot.setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
      hot.selectCell(this.activeRow.row, this.activeRow.column + 1);
    } else {
      hot.selectCell(this.activeRow.row, 1);
    }

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
    if (this.BankReceiptVoucherFilterForm.value.BankReceiptVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.bankReceiptVoucherVoucherNo ===
          this.BankReceiptVoucherFilterForm.value.BankReceiptVoucherNo.toUpperCase()
      );
    }

    if (
      this.BankReceiptVoucherFilterForm.value.BankReceiptVoucherAcNo != null &&
      this.BankReceiptVoucherFilterForm.value.BankReceiptVoucherAcNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.bankReceiptVoucherDrAcNo ===
          this.BankReceiptVoucherFilterForm.value.BankReceiptVoucherAcNo
      );
    }

    if (this.BankReceiptVoucherFilterForm.value.isDate) {
      const fromDateStr = this.BankReceiptVoucherFilterForm.value.fromDate;
      const toDateStr = this.BankReceiptVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.bankReceiptVoucherVDate);

        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);

        return (
          (voucherDate.getTime() >= fromDate.getTime() &&
            voucherDate.getTime() <= toDate.getTime()) ||
          voucherDate.getTime() === fromDate.getTime()
        );
      });
      this.bankReceiptVoucherarry = filteredArray;
    }
    this.bankReceiptVoucherarry = filteredArray;
  }
  ClearFilter() {
    this.BankReceiptVoucherFilterForm.reset();
    this.bankReceiptVoucherarry = this.filterArray;
    this.BankReceiptVoucherFilterForm.get('fromDate').setValue(new Date());
    this.BankReceiptVoucherFilterForm.get('toDate').setValue(new Date());
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

  private buildAllocationContext(voucher: BankReceiptVoucher) {
    const firstDetail = voucher?.bankReceiptVoucherDetails?.find(
      (detail) => detail?.bankReceiptVoucherDetailsDelStatus !== true
    );
    const sourceTransaction = this.getBankReceiptSourceTransaction(
      voucher,
      firstDetail
    );
    if (!sourceTransaction || !firstDetail) {
      return null;
    }

    return {
      ...sourceTransaction,
      vType: 'BANK RECEIPT',
      refNO: voucher.bankReceiptVoucherVoucherNo,
      accNO: firstDetail.bankReceiptVoucherDetailsAcNo,
      allocationId: voucher.bankReceiptVoucherAllocId,
      allocationVoucherVcreation: AllocationSourceType.BankReceiptVoucher,
    };
  }

  private getBankReceiptSourceTransaction(
    voucher: BankReceiptVoucher,
    firstDetail = voucher?.bankReceiptVoucherDetails?.find(
      (detail) => detail?.bankReceiptVoucherDetailsDelStatus !== true
    )
  ) {
    if (!firstDetail) {
      return null;
    }

    return (
      voucher?.accountsTransactions?.find(
        (transaction) =>
          transaction?.accountsTransactionsVoucherNo ===
            voucher?.bankReceiptVoucherVoucherNo &&
          transaction?.accountsTransactionsAccNo ===
            firstDetail?.bankReceiptVoucherDetailsAcNo &&
          Number(transaction?.accountsTransactionsCredit || 0) > 0
      ) ||
      voucher?.accountsTransactions?.find(
        (transaction) =>
          transaction?.accountsTransactionsVoucherNo ===
            voucher?.bankReceiptVoucherVoucherNo &&
          Number(transaction?.accountsTransactionsCredit || 0) > 0
      ) ||
      null
    );
  }

  private hasBankReceiptLinkedAllocations(voucher: BankReceiptVoucher): boolean {
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

  private reconcileBankReceiptVoucherAllocationState(
    voucher: BankReceiptVoucher,
    callback: (voucher: BankReceiptVoucher) => void
  ) {
    const firstDetail = voucher?.bankReceiptVoucherDetails?.find(
      (detail) => detail?.bankReceiptVoucherDetailsDelStatus !== true
    );
    const accNo = firstDetail?.bankReceiptVoucherDetailsAcNo;
    const voucherNo = voucher?.bankReceiptVoucherVoucherNo;

    if (!accNo || !voucherNo) {
      this.bankReceiptHasActiveAllocation = false;
      callback(this.normalizeReleasedBankReceiptVoucher(voucher));
      return;
    }

    this.accountstatement
      .getAllocationVoucherDetails(accNo, voucherNo, 'BANK RECEIPT')
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
              rowType === 'SALESVOUCHER' &&
              (allocAmount > 0 ||
                allocationStatus === 'PARTIAL' ||
                allocationStatus === 'FULL')
            );
          });

          this.bankReceiptHasActiveAllocation = hasTargetRows;
          callback(
            hasTargetRows
              ? voucher
              : this.normalizeReleasedBankReceiptVoucher(voucher)
          );
        },
        () => {
          this.bankReceiptHasActiveAllocation =
            this.hasBankReceiptLinkedAllocations(voucher);
          callback(voucher);
        }
      );
  }

  private normalizeReleasedBankReceiptVoucher(
    voucher: BankReceiptVoucher
  ): BankReceiptVoucher {
    const normalizedVoucher: BankReceiptVoucher = {
      ...voucher,
      bankReceiptVoucherAllocId: 0,
      AllocationDetails: [],
    };

    const sourceTransaction =
      this.getBankReceiptSourceTransaction(normalizedVoucher);
    if (sourceTransaction) {
      sourceTransaction.accountsTransactionsAllocCredit = 0;
      sourceTransaction.accountsTransactionsFcAllocCredit = 0;
      sourceTransaction.accountsTransactionsAllocBalance = Number(
        sourceTransaction.accountsTransactionsCredit || 0
      );
    }

    return normalizedVoucher;
  }

  private isBankReceiptVoucherFullyAllocated(voucher: BankReceiptVoucher): boolean {
    if (
      Number(voucher?.bankReceiptVoucherAllocId || 0) <= 0 ||
      !this.hasBankReceiptLinkedAllocations(voucher)
    ) {
      return false;
    }

    const sourceTransactions =
      voucher?.accountsTransactions?.filter(
        (transaction) =>
          transaction?.accountsTransactionsVoucherNo ===
            voucher?.bankReceiptVoucherVoucherNo &&
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

  private shouldBlockBankReceiptVoucherEdit(
    voucher: BankReceiptVoucher
  ): boolean {
    const sourceTransaction = this.getBankReceiptSourceTransaction(voucher);
    if (!sourceTransaction) {
      return false;
    }

    return (
      this.bankReceiptHasActiveAllocation &&
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
}

interface GridData {
  account?: string;
  credit?: number;
  chequeno?: number;
  chequedate?: any;
  jobname?: string;
  costcenter?: string;
  narration?: string;
  pdc: boolean;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}

export const bankRVoucherColumnList = (
  component: BankReceiptvoucherComponent
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
