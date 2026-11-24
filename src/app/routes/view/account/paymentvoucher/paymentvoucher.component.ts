import {
  Component,
  ElementRef,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { PaymentVoucher } from 'src/app/routes/domain/Accounts/PaymentVoucher';
import { PaymentVoucherDetails } from 'src/app/routes/domain/Accounts/PaymentVoucherDetails';
import { ChartofAccounts } from 'src/app/routes/domain/Masters/ChartofAccounts';
import { JobMaster } from 'src/app/routes/domain//Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain//Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { ToWords } from 'to-words';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { CredentialKeys } from 'src/app/routes/Enums/loginInfo';
import { LoginService } from 'src/app/routes/service/login.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { AllocationSourceType } from 'src/app/routes/domain/Accounts/allocation-source-type.enum';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { BorwsePRComponent } from '../borwse-pr/borwse-pr.component';
import { DialogService } from 'primeng';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
@Component({
  selector: 'app-paymentvoucher',
  templateUrl: './paymentvoucher.component.html',
  styleUrls: ['./paymentvoucher.component.scss'],
})
export class PaymentvoucherComponent implements OnInit {
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('accountDropdown', { static: false }) accountDropdown: any;
  rptFilter: ReportFilterModel;
  pdfSource: any;
  pipe = new DatePipe('en-US');
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string = null;
  index: number = 0;
  dataList: Array<any> = [];
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  CramtChk: number = 0;
  selectItem: any;
  CurrentselectedAccount: any;
  lookupGridColumns = [];
  sum: any = 0;
  sumwordsnew: string;
  fcrate: number = 0;
  rptPassstring: string;
  rptHeadstring: string;
  rptReportHead: string;
  date1: string;
  activeRow: { row: number; column: number } = { row: 0, column: 0 };
  rptVrno: string;
  rptVrdt: string;
  rptAddess: string;
  showAccountLookUp: boolean = false;
  formControlLookUp: boolean = false;
  printWithAllocation: boolean = false;
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
  currencyList: SelectItem[];
  currArry: string[] = [];
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

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  DefCostCenterCheck: String;
  DefCostCenterId: string;

  DefLocCheck: string;
  DefLocid: string;

  DefAcc: string;
  DefAccCheck: string;

  usrid: number;
  fsno: number;
  locId: number;
  callDDLs: boolean = false;

  receivedAllocationData: any[] = [];
  allowEditAfterRelease: boolean = false;
  paymentHasActiveAllocation: boolean = false;
  accountTransactionList: AccountsTransactions[] = [];
  paymentVoucherarry: PaymentVoucher[] = [];
  _paymentVoucherDetails: PaymentVoucherDetails;
  savedPaymentVoucher: PaymentVoucher;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'paymtVouchrEntry';
  displayPrintPreview: boolean = false;
  Permission: any;
  ScreenId: number;
  filterArray: any;
  user: any;
  JOBCOST: boolean = true;
  defaultMasterAccount: any;

  itemList = [];
  clickedRowColumn = { row: -1, column: -1 };
  contraSettings: boolean = false;
  browsebtn: boolean = false;
  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,
    public dialogService: DialogService,
    private loginser: LoginService,
    private storage: LocalStorageService,
    private accountapi: AccountApiService,
    private utilityService: UtilityService,
    private accountstatement: AccountstatementService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.CramtChk = 0;
  }

  vNo: string = '';
  paymentvoucherentry: Handsontable.GridSettings;
  paymentVoucherFormGroup: FormGroup;
  PaymentVoucherFilterForm: FormGroup;
  cols;
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.vNo = params['vNo'];

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
      } else {
        this.router.navigate(['/login']);
      }
      if (this.vNo) {
        this.GetSavedPaymentDetails(this.vNo);
      }
    });

    this.cols = [
      { field: 'paymentVoucherVoucherNo', header: 'Voucher No' },
      { field: 'paymentVoucherDate', header: 'Date' },
      { field: 'paymentVoucherCrAcNo', header: 'Account' },
      { field: 'paymentVoucherCurrencyId', header: 'Currency' },
      { field: 'paymentVoucherDbAmount', header: 'Vchr.Debit' },
      { field: 'paymentVoucherCrAmount', header: 'Vchr.Credit' },
      { field: 'paymentVoucherNarration', header: 'Particulars' },
      { field: 'paymentVoucherDbAmount', header: 'Dtls.Debit' },
      { field: 'paymentVoucherCrAmount', header: 'Dtls.Credit' },
      { field: '', header: 'Action' },
    ];

    // let today = new Date();
    // this.date1 = today.getMonth() + '/' + today.getDate() + '/' + today.getFullYear();
    this.date1 = new Date().toLocaleDateString();

    this.initializeControls();
    this.callDropdowns();
    this.paymentVoucherFormGroup = this.fb.group({
      paymentVoucherSno: 0,
      paymentVoucherVoucherNo: [{ value: null, disabled: true }],
      paymentVoucherDate: [null, [Validators.required]],
      paymentVoucherVoucherRef: [''],
      paymentVoucherCrAcNo: [-1, [DropDownValidator]],
      paymentVoucherCrAmount: 0,
      paymentvoucherCrAmt: 0,
      paymentVoucherDbAmount: 0,
      paymentVoucherNarration: [''],
      paymentVoucherCurrencyId: [-1, [DropDownValidator]],
    });
    this.paymentVoucherFormGroup.disable();
    this.PaymentVoucherFilterForm = this.fb.group({
      paymentVoucherAcNo: [null],
      isDate: [],
      paymentVoucherNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.storage.get(CredentialKeys.Login);

    var user = this.loginser.GetCredentialData();
    this.usrid = user?.userId;
    this.fsno = user?.financialPeriodsFsno;
    this.locId = user?.locId;
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.paymentVoucherFormGroup.disable();
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

  receiveData(data: any) {
    this.receivedAllocationData = [];
    data.forEach((e) => {
      if (e.IsSelected === true) {
        this.receivedAllocationData.push(e);
      }
    });
    // console.log('receivedAllocationData : ', this.receivedAllocationData);
  }

  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
  }

  get f() {
    return this.paymentVoucherFormGroup.controls;
  }

  initializeControls() {
    let cols = paymentVoucherColumnList(this);

    let hiddenColumn = [2, 3, 4, 6];

    this.paymentvoucherentry = this.utilityService.getTableConfig(
      cols,
      hiddenColumn
    );

    this.paymentvoucherentry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);

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

      if (column === 0 && this.paymentvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        hotInstance.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.paymentvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        this.showAccountLookUp = true;
        hotInstance.deselectCell();
        this.activeRow = { row, column };
      } else if (column === 4 && this.paymentvoucherentry.readOnly === false) {
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

    this.paymentvoucherentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };


    this.paymentvoucherentry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.paymentvoucherentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.itemList.splice(index, amount);
      this.ColumnSum();
    };

    this.paymentvoucherentry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Invalid entry'),
        });
      }
    };

    // this.paymentvoucherentry.afterChange = (r, c) => {
    //   // const  hotinstance = this.hotRegisterer.getInstance(this.hotid);
    //   // var data = hotinstance.getDataAtRow(r);
    //   console.log(r, c);

    // };
  }
  PurchaseRequisitionStatus() {
    this.activeRow = { row: 0, column: 0 };
    this.paymentvoucherentry.data = [];
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
            this.paymentVoucherFormGroup.patchValue({
              paymentVoucherNarration: res.paymentRequestNarration,
              paymentVoucherCrAmount: res.paymentRequestDbAmount,
              paymentvoucherCrAmt: res.paymentRequestDbAmount,
              // paymentVoucherCurrencyId: res.paymentRequestCurrencyId,
              paymentVoucherVoucherRef: res.paymentRequestVoucherNo,
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
        ? this.accountArray?.find(
          (l) => l.maAccNo?.trim() === k.paymentRequestDetailsAcNo?.trim()
        )?.maAccName
        : null);
      hotInstance.setSourceDataAtCell(
        hotInstance.toPhysicalRow(this.activeRow.row),
        'accountNo',
        k.paymentRequestDetailsAcNo ?? null
      );
      hotInstance.setDataAtCell(this.activeRow.row, 1, k?.paymentRequestDetailsDbAmount);
      hotInstance.setDataAtCell(this.activeRow.row, 2, 0);
      hotInstance.setDataAtCell(this.activeRow.row, 5, k?.paymentRequestDetailsNarration);
      // hotInstance.setDataAtCell(this.activeRow.row, 5, k?.price);
      this.hotRegisterer
        .getInstance(this.hotid)
        .updateSettings({ data: this.paymentvoucherentry.data });
      this.activeRow.row += 1;
      //  });
    });


    this.ColumnSum();
  }
  ColumnSum() {
    if (this.paymentvoucherentry.readOnly) {
      return;
    }

    if (this.paymentvoucherentry.data.length > 0) {
      var value = 0;
      this.paymentvoucherentry.data.forEach((elemt: any) => {
        if (elemt && elemt.debit > 0) {
          value += elemt.debit;
        }
      });
      value = parseFloat(value.toFixed(2));
      this.paymentVoucherFormGroup.controls.paymentVoucherDbAmount.setValue(
        value
      );
      //  this.sumwordsnew =  converter.toWords(this.sum);
    }
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
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
    //console.log("this.costcenterArray", this.costcenterArray)
    return this.costcenterArray.map((kl) => ({
      account: kl.costCenterMasterCostCenterName,
      accountId: kl.costCenterMasterCostCenterId,
    }));
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
            v.accountName = this.getAccountName(v.paymentVoucherCrAcNo) || '';
          }
        });
      }
    });
  }

  savePaymentVoucher() {
    this.paymentVoucherFormGroup.markAllAsTouched();
    this.paymentVoucherFormGroup.controls['paymentVoucherDbAmount'].setValue(
      parseFloat(this.paymentVoucherFormGroup.value.paymentVoucherDbAmount)
    );

    const savedData: any = this.paymentvoucherentry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    const paymtVoucher: PaymentVoucher = this.paymentVoucherFormGroup
      .value as PaymentVoucher;
    paymtVoucher.paymentVoucherVoucherNo =
      this.paymentVoucherFormGroup.getRawValue().paymentVoucherVoucherNo;
    paymtVoucher.paymentVoucherSno =
      this.paymentVoucherFormGroup.value.paymentVoucherSno != null
        ? parseInt(this.paymentVoucherFormGroup.value.paymentVoucherSno)
        : 0;
    paymtVoucher.paymentVoucherCrAmount =
      this.paymentVoucherFormGroup.value.paymentvoucherCrAmt;
    paymtVoucher.paymentVoucherFcCrAmount =
      this.paymentVoucherFormGroup.value.paymentvoucherCrAmt;
    paymtVoucher.paymentVoucherFsno = this.fsno;
    paymtVoucher.paymentVoucherUserId = this.usrid;
    paymtVoucher.paymentVoucherLocationId = this.locId;
    paymtVoucher.paymentVoucherAllocationId =
      this.savedPaymentVoucher?.paymentVoucherAllocationId || 0;
    paymtVoucher.accountsTransactions = [];
    paymtVoucher.allocationDetails = this.receivedAllocationData;
    paymtVoucher.paymentVoucherDetails = savedData
      ?.filter((k) => k.account != null && k.debit != null)
      .map((k: GridData) => {
        return {
          paymentVoucherDetailsId: k.id != null ? k.id : 0,
          // paymentVoucherDetailsId: k.id,
          paymentVoucherDetailsVoucherNo:
            this.paymentVoucherFormGroup.getRawValue().paymentVoucherVoucherNo,
          paymentVoucherDetailsSno:
            this.paymentVoucherFormGroup.getRawValue().paymentVoucherSno,
          paymentVoucherDetailsAcNo: this.resolveRowAccountNo(k),
          paymentVoucherDetailsDbAmount: k.debit,
          paymentVoucherDetailsDbFcAmount: k.debit,
          paymentVoucherDetailsCrAmount: k.credit,
          paymentVoucherDetailsCrFcAmount: k.credit,
          paymentVoucherDetailsJobId:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                ?.value
              : -1,
          paymentVoucherDetailsDepartmentId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                (j) =>
                  j.costCenterMasterCostCenterName?.trim() ===
                  k.costcenter?.trim()
              )?.costCenterMasterCostCenterId
              : null,

          // paymentVoucherDetailsDepartmentId: 0,
          paymentVoucherDetailsNarration: k.narration,
          paymentVoucherDetailsFsno: this.fsno,
          paymentVoucherDetailsLocationId: this.locId,
          paymentVocherDetailsDelStatus: false,
        };
      });

    paymtVoucher.paymentVoucherDetails
      ?.filter((x) => x.paymentVocherDetailsDelStatus === false)
      .forEach((element) => {
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: element.paymentVoucherDetailsAcNo,
          accountsTransactionsTransDate: this.f.paymentVoucherDate.value,
          accountsTransactionsParticulars:
            element.paymentVoucherDetailsNarration,
          accountsTransactionsDebit: element.paymentVoucherDetailsDbAmount,
          accountsTransactionsFcDebit: element.paymentVoucherDetailsDbAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo: element.paymentVoucherDetailsVoucherNo,
          accountsTransactionsDescription:
            element.paymentVoucherDetailsNarration,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountsTransactionsFcRate: 1,
          accountsTransactionsCompanyId: 1,
          accountsTransactionsCurrencyId: this.f.paymentVoucherCurrencyId.value,
          accountsTransactionsFcAllocBalance: Number(
            this.f.paymentVoucherDbAmount.value
          ),
          accountsTransactionsAllocBalance: this.f.paymentVoucherDbAmount.value,
          accountstransactionsDelStatus: false,
          accountsTransactionsJobNo: element.paymentVoucherDetailsJobId,
          accountsTransactionsCostCenterId:
            element.paymentVoucherDetailsDepartmentId,
        };
        paymtVoucher.accountsTransactions.push(debitData);
        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: this.f.paymentVoucherCrAcNo.value,
          accountsTransactionsTransDate: this.f.paymentVoucherDate.value,
          accountsTransactionsParticulars: this.f.paymentVoucherNarration.value,
          accountsTransactionsCredit: element.paymentVoucherDetailsDbAmount,
          accountsTransactionsFcCredit: element.paymentVoucherDetailsDbAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.paymentVoucherFormGroup.getRawValue().paymentVoucherVoucherNo,
          accountsTransactionsDescription: this.f.paymentVoucherNarration.value,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountsTransactionsFcRate: 1,
          accountsTransactionsCompanyId: 1,
          accountsTransactionsCurrencyId: this.f.paymentVoucherCurrencyId.value,
          accountsTransactionsFcAllocBalance: Number(
            this.f.paymentVoucherDbAmount.value
          ),
          accountsTransactionsAllocBalance: this.f.paymentVoucherDbAmount.value,
          accountstransactionsDelStatus: false,

          accountsTransactionsJobNo: this.contraSettings
            ? element.paymentVoucherDetailsJobId
            : -1,
          accountsTransactionsCostCenterId:
            element.paymentVoucherDetailsDepartmentId,
        };
        paymtVoucher.accountsTransactions.push(creditData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(paymtVoucher);
    } else {



      this.updateVoucher(paymtVoucher);
    }
  }

  saveVoucher(paymtVoucher: PaymentVoucher) {
    if (this.paymentVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.accountapi.InsertPaymentVoucher(paymtVoucher).subscribe(
            (data: any) => {
              if (data.valid) {
                this.savedPaymentVoucher = data.result;
                this.CurrentselectedAccount =
                  this.buildAllocationContext(data.result);
                this.updateFormGrid(data.result);
                this.userTrackingLog('Insert');
                this.btnFlag = {
                  new: true,
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  print: true,
                  printPreview: true,
                };
                this.messageService.add({
                  severity: 'success',
                  summary: this.translate.instant('Alert'),
                  detail: this.translate.instant(data.message),
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
                summary: this.translate.instant('Alert'),
                detail: this.translate.instant('Payment Voucher Save Failed'),
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('Alert'),
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.paymentVoucherFormGroup.markAllAsTouched();
      this.paymentVoucherFormGroup.markAsDirty();
    }
  }

  updateVoucher(paymtVoucher: PaymentVoucher) {
    if (
      !this.allowEditAfterRelease &&
      this.shouldBlockPaymentVoucherEdit(this.savedPaymentVoucher)
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: this.translate.instant(
          'To edit this voucher, please release its allocation first.'
        ),
      });
      return;
    }

    if (this.paymentVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to update existing voucher?'
        ),
        accept: () => {
          this.accountapi.UpdatePaymentVoucher(paymtVoucher).subscribe(
            (data: any) => {
              if (data.valid) {
                this.savedPaymentVoucher = data.result;
                this.CurrentselectedAccount =
                  this.buildAllocationContext(data.result);
                this.btnFlag = {
                  new: true,
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  print: true,
                  printPreview: true,
                };
                this.updateFormGrid(data.result);
                this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: this.translate.instant(
                    'Payment Voucher Updated Succesfully'
                  ),
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
                detail: this.translate.instant('Payment Voucher Update Failed'),
              });
            }
          );
        },
      });
    } else {
      // const msg1 = 'Please fill mandatory fields';
      // const msg2 = 'Please fill Empyt Debit account details';
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.paymentVoucherFormGroup.markAllAsTouched();
      this.paymentVoucherFormGroup.markAsDirty();
    }
  }

  getAllPaymentVouchrs() {
    this.accountapi.GetPaymentVouchers().subscribe((data) => {
      this.paymentVoucherarry =
        data.result?.map((v: any) => ({
          ...v,
          accountName: this.getAccountName(v.paymentVoucherCrAcNo) || '',
        })) || [];
      this.filterArray = this.paymentVoucherarry;
    });
  }

  /**
   * Resolves the account number for a grid row.
   * Prefers the account number captured when the account was picked (row.accountNo),
   * as long as the row still shows that account's name. Falls back to the original
   * name-based lookup otherwise (e.g. typed/pasted names), so behaviour is never worse
   * than before. Account names are not unique, so name lookup alone can pick the wrong account.
   */
  /**
   * Duplicate-account check based on the grid rows themselves (not a parallel list),
   * so it stays correct after row deletes, loading a saved voucher, or Payment Request fill.
   */
  private isAccountUsedInOtherRow(accountNo: string, visualRow: number): boolean {
    const hot = this.hotRegisterer.getInstance(this.hotid);
    const currentRow = hot ? hot.toPhysicalRow(visualRow) : visualRow;
    const target = accountNo?.trim();
    return (this.paymentvoucherentry.data || []).some((r: GridData, i: number) => {
      if (i === currentRow || !r || !r.account) {
        return false;
      }
      const rowName = r.account.trim();
      let rowNo: string;
      if (r.accountNo) {
        const picked = this.accountArray?.find(
          (x) => x.maAccNo?.trim() === r.accountNo?.trim()
        );
        if (picked && picked.maAccName?.trim() === rowName) {
          rowNo = picked.maAccNo;
        }
      }
      if (rowNo == null) {
        rowNo = this.accountArray?.find(
          (x) => x.maAccName?.trim() === rowName
        )?.maAccNo;
      }
      return rowNo?.trim() === target;
    });
  }

  private resolveRowAccountNo(k: GridData): string {
    const rowName = k.account?.trim();
    if (k.accountNo) {
      const picked = this.accountArray?.find(
        (x) => x.maAccNo?.trim() === k.accountNo?.trim()
      );
      if (picked && picked.maAccName?.trim() === rowName) {
        return picked.maAccNo;
      }
    }
    return this.accountArray?.find((x) => x.maAccName?.trim() === rowName)
      .maAccNo;
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j?.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  new() {
    this.itemList = [];
    this.CurrentselectedAccount = null;
    this.paymentVoucherFormGroup.reset();
    this.paymentVoucherFormGroup.enable();
    this.paymentvoucherentry.data = [];
    this.browsebtn = true,
      this.paymentvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.paymentvoucherentry);
    this.accountTransactionList = [];
    this.paymentVoucherFormGroup.get('paymentVoucherSno').setValue(0);
    this.paymentVoucherFormGroup.get('paymentVoucherCurrencyId').setValue(-1);
    this.paymentVoucherFormGroup.get('paymentVoucherDate').setValue(new Date());
    this.GetDefaultSettings();
    this.callDropdowns(true);
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
    this.search = null;
    this.index = 0;
    this.f.paymentVoucherVoucherNo.clearValidators();
    this.paymentVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
    this.activeRow = { row: 0, column: 0 };
    this.refreshDebitAccountGrid();
  }

  showMaximizableDialog() {
    this.callDropdowns();
    this.getAllPaymentVouchrs();
    this.displayMaximizable = true;
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
          this.f.paymentVoucherCurrencyId.setValue(Number(this.DefCurrency));
        }
      }
      this.getACValue();
    });
  }
  getACValue() {
    this.utilityService
      .GetAllAccountsbyKey('CASH_AC_NO')
      .subscribe((res: any) => {
        const value = res.result[0].accountSettingsAccountTextValue.split('::');

        this.defaultMasterAccount = value[1]?.trim();
        this.f.paymentVoucherCrAcNo.setValue(this.defaultMasterAccount);
      });
  }

  updateFormGrid(pymt: PaymentVoucher) {
    this.search = null;
    this.paymentVoucherFormGroup.patchValue({
      paymentVoucherSno: pymt.paymentVoucherSno,
      paymentVoucherVoucherNo: pymt.paymentVoucherVoucherNo,
      paymentVoucherDate: new Date(pymt.paymentVoucherDate),
      paymentVoucherVoucherRef: pymt.paymentVoucherVoucherRef,
      paymentVoucherCrAcNo: pymt.paymentVoucherCrAcNo,
      paymentVoucherCrAmount: pymt.paymentVoucherDbAmount,
      paymentVoucherCrAmt: pymt.paymentVoucherCrAmount,
      paymentVoucherDbAmount: pymt.paymentVoucherDbAmount,
      paymentVoucherNarration: pymt.paymentVoucherNarration,
      paymentVoucherCurrencyId: pymt.paymentVoucherCurrencyId,
    });
    this.sum = pymt.accountsTransactions
      .map((k) => k.accountsTransactionsDebit)
      .reduce((num, curr) => num + curr, 0)
      .toFixed(2);
    const toWords = new ToWords();
    this.sumwordsnew = toWords.convert(this.sum, { currency: true });
    this.accountTransactionList = pymt.accountsTransactions;

    const gridData: GridData[] = pymt.paymentVoucherDetails.map((k) => {
      const accountId: string =
        k.paymentVoucherDetailsAcNo != null
          ? this.accountArray?.find(
            (l) => l.maAccNo?.trim() === k.paymentVoucherDetailsAcNo?.trim()
          )?.maAccName
          : null;

      const jobId: string =
        k.paymentVoucherDetailsJobId != null
          ? this.jobList?.find((l) => l.value == k.paymentVoucherDetailsJobId)
            ?.label
          : null;

      const costcenterId: string =
        k.paymentVoucherDetailsDepartmentId != null
          ? this.costcenterList?.find(
            (l) => l.value == k.paymentVoucherDetailsDepartmentId
          ).label
          : null;
      return {
        account: accountId,
        debit: k.paymentVoucherDetailsDbAmount,
        credit: k.paymentVoucherDetailsCrAmount,
        jobname: jobId,
        costcenter: costcenterId,
        narration: k.paymentVoucherDetailsNarration,
        id: k.paymentVoucherDetailsId,
        accountNo: k.paymentVoucherDetailsAcNo,
      };
    });
    this.paymentvoucherentry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.paymentvoucherentry.readOnly = true;
    this.paymentVoucherFormGroup.disable();
    this.f.paymentVoucherVoucherNo.clearValidators();
    this.paymentVoucherFormGroup.updateValueAndValidity();
    this.refreshDebitAccountGrid();
  }

  displayPrint() {
    this.displayPrintPreview = true;
    // this.getAllStationMaster();
  }

  private getPaymentVoucherAllocationPrintQuery(): string {
    const paymentVoucherSno =
      this.paymentVoucherFormGroup.getRawValue().paymentVoucherSno || 0;

    return ` 
      select
        av.Allocation_Voucher_Voucher_No as AllocationVoucherNo,
        avd.Allocation_Voucher_Details_VNO as VoucherNo,
        avd.Allocation_Voucher_Details_Vtype as VoucherType,
        cast(isnull(avd.Allocation_Voucher_Details_Alloc_Debit, 0) as decimal(18, 2)) as AllocDebit,
        cast(isnull(avd.Allocation_Voucher_Details_Alloc_Credit, 0) as decimal(18, 2)) as AllocCredit,
        cast(isnull(avd.Allocation_Voucher_Details_FC_Alloc_Debit, 0) as decimal(18, 2)) as FcAllocDebit,
        cast(isnull(avd.Allocation_Voucher_Details_FC_Alloc_Credit, 0) as decimal(18, 2)) as FcAllocCredit,
        at.AccountsTransactions_TransDate as VoucherDate,
        cast(isnull(at.AccountsTransactions_Alloc_Balance, 0) as decimal(18, 2)) as RemainingBalance
      from Payment_Voucher pv
      inner join Allocation_Voucher av
        on av.Allocation_Voucher_ID = pv.Payment_Voucher_Allocation_ID
      inner join Allocation_Voucher_Details avd
        on avd.Allocation_Voucher_Details_SNO = av.Allocation_Voucher_ID
      left join AccountsTransactions at
        on at.AccountsTransactions_TransSno = avd.Allocation_Voucher_Details_TransSno
      where pv.Payment_Voucher_Sno = ${paymentVoucherSno}
        and isnull(avd.Allocation_Voucher_Details_DelStatus, 0) = 0
        and isnull(avd.Allocation_Voucher_Details_VNO, '') <> isnull(pv.Payment_Voucher_Voucher_No, '')
      order by at.AccountsTransactions_TransDate, avd.Allocation_Voucher_Details_VNO
    `;
  }

  showPrint() {
    this.rptFilter = {
      ReportName: this.printWithAllocation ? 'PaymentVoucherwithAllocation' : 'PaymentVoucher',
      SelectionFormula: `{vw_paymentvoucher.Payment_Voucher_Sno}= ${this.paymentVoucherFormGroup.getRawValue().paymentVoucherSno}`,
        // '{SalesVoucher.SalesVoucherNo} = "' +
        // this.paymentVoucherFormGroup.getRawValue().paymentVoucherVoucherNo +
        // '"'
        // '',
      Parameters: [
        // { Key: 'Head1', Value: 'Head1' },
        // { Key: 'Address', Value: 'Address' },
        // { Key: 'Tele', Value: 'Tele' },
        // { Key: 'InvDes', Value: 'InvDes' },
        // { Key: 'fax', Value: 'fax' },
        // { Key: 'Email', Value: 'Email@exmaple.com' },
      ],
      Queries: [
        // `select * from vw_paymentvoucher where Payment_Voucher_Sno =${this.paymentVoucherFormGroup.getRawValue().paymentVoucherSno
        // }`,
        this.getPaymentVoucherAllocationPrintQuery(),
      ],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter,false)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  getEmptyRowCount(length): number {
    const DetailsLength = length || 0;
    if (length < 12) {
      return Math.max(0, 12 - DetailsLength);
    } else {
      return;
    }
  }

  userTrackingLog(type) {
    let req = {
      page: 'Payment Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.paymentVoucherFormGroup.get('paymentVoucherVoucherNo').value,
      vpType: 'Payment Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  handleChange(e) {
    this.index = e.index;
    if (this.index == 0) {
      this.refreshDebitAccountGrid();
    }
    if (this.index == 2) {
      if (this.savedPaymentVoucher?.paymentVoucherVoucherNo) {
        this.CurrentselectedAccount = this.buildAllocationContext(
          this.savedPaymentVoucher
        );
      }
    }
  }

  refreshCurrentVoucherFromAllocation(action?: string) {
    if (!this.savedPaymentVoucher?.paymentVoucherSno) {
      return;
    }

    const currentTab = this.index;
    this.accountapi
      .GetSavedPaymentDetails(
        String(this.savedPaymentVoucher.paymentVoucherSno)
      )
      .subscribe(
      (data) => {
        if (data?.result) {
          this.allowEditAfterRelease = action === 'released';
          const normalizedVoucher = {
            ...data.result,
            paymentVoucherDetails:
              this.allowEditAfterRelease &&
              (!Array.isArray(data.result.paymentVoucherDetails) ||
                !data.result.paymentVoucherDetails.length)
                ? this.savedPaymentVoucher?.paymentVoucherDetails || []
                : data.result.paymentVoucherDetails,
            paymentVoucherDbAmount:
              this.allowEditAfterRelease &&
              !Number(data.result.paymentVoucherDbAmount || 0)
                ? this.savedPaymentVoucher?.paymentVoucherDbAmount ||
                  data.result.paymentVoucherDbAmount
                : data.result.paymentVoucherDbAmount,
            paymentVoucherCrAmount:
              this.allowEditAfterRelease &&
              !Number(data.result.paymentVoucherCrAmount || 0)
                ? this.savedPaymentVoucher?.paymentVoucherCrAmount ||
                  data.result.paymentVoucherCrAmount
                : data.result.paymentVoucherCrAmount,
          };

          if (this.allowEditAfterRelease) {
            const releasedSourceTransaction = this.getPaymentSourceTransaction(
              normalizedVoucher
            );
            if (releasedSourceTransaction) {
              releasedSourceTransaction.accountsTransactionsAllocDebit = 0;
              releasedSourceTransaction.accountsTransactionsFcAllocDebit = 0;
              releasedSourceTransaction.accountsTransactionsAllocBalance =
                Number(releasedSourceTransaction.accountsTransactionsDebit || 0);
            }
          }
          const isFullyAllocated = this.isPaymentVoucherFullyAllocated(
            normalizedVoucher
          );

          this.reconcilePaymentVoucherAllocationState(
            normalizedVoucher,
            (finalVoucher) => {
              const finalFullyAllocated =
                this.isPaymentVoucherFullyAllocated(finalVoucher);

              this.accountTransactionList = finalVoucher.accountsTransactions;
              this.updateFormGrid(finalVoucher);
              this.savedPaymentVoucher = finalVoucher;
              this.CurrentselectedAccount = this.buildAllocationContext(
                finalVoucher
              );
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
              this.paymentVoucherFormGroup.disable();
              this.index = currentTab;
              this.refreshDebitAccountGrid();
              if (action === 'released') {
                this.getAllPaymentVouchrs();
              }
            }
          );
        }
      },
      () => { }
    );
  }

  GetSavedPaymentDetails(id: string) {
    this.index = 0;
    this.allowEditAfterRelease = false;
    this.paymentHasActiveAllocation = false;

    this.accountapi.GetSavedPaymentDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.reconcilePaymentVoucherAllocationState(
            data.result,
            (finalVoucher) => {
              const isFullyAllocated = this.isPaymentVoucherFullyAllocated(
                finalVoucher
              );
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
              this.accountTransactionList = finalVoucher.accountsTransactions;
              this.updateFormGrid(finalVoucher);
              this.savedPaymentVoucher = finalVoucher;
              this.CurrentselectedAccount = this.buildAllocationContext(
                finalVoucher
              );
              this.paymentVoucherFormGroup.disable();
            }
          );
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Payment voucher not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed'),
        });
        this.paymentVoucherFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to delete voucher?'),
      accept: () => {
        this.accountapi
          .DeletePaymentVoucher(this.savedPaymentVoucher)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: this.translate.instant(
                  'Payment Voucher Deleted Succesfully'
                ),
              });
              this.new();
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Failed'),
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
      this.shouldBlockPaymentVoucherEdit(this.savedPaymentVoucher)
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: this.translate.instant(
          'To edit this voucher, please release its allocation first.'
        ),
      });
      return;
    }

    //  this.hotRegisterer.getInstance(this.hotid).updateSettings({ readOnly: false });
    this.btnFlag = {
      new: false,
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      print: true,
      printPreview: true,
    };
    this.browsebtn = true;
    this.paymentvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.paymentvoucherentry);
    this.f.paymentVoucherVoucherNo.clearValidators();
    this.paymentVoucherFormGroup.enable();
    this.paymentVoucherFormGroup.controls.paymentVoucherVoucherNo.disable();

    this.paymentVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
    this.refreshDebitAccountGrid();
  }

  public get IsValidGrid(): boolean {
    if (this.paymentvoucherentry.data.length > 0) {
      // this.paymentvoucherentry.data.forEach((value: GridData, index, arry) => {
      //console.log(Object.values(this.paymentvoucherentry.data));
      return Object.values(this.paymentvoucherentry.data).some(
        (k: GridData) => k.account != null && k.debit != null
      );
      // });
    }
    return false;
  }

  selectaccount(evt) {
    if (this.clickedRowColumn.column == 0) {
      if (this.isAccountUsedInOtherRow(evt.accountId, this.clickedRowColumn.row)) {
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
        // Remember the exact account picked; account names are not unique.
        hot.setSourceDataAtCell(
          hot.toPhysicalRow(this.activeRow.row),
          'accountNo',
          evt.accountId
        );
      }
    }
    hot.selectCell(this.activeRow.row, 1);

    let u = {
      paymentVoucherDetailsAcNo: evt.accountId,
    };
    // this.CurrentselectedAccount = u;
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

  private buildAllocationContext(voucher: PaymentVoucher) {
    const firstDetail = voucher?.paymentVoucherDetails?.find(
      (detail) => detail?.paymentVocherDetailsDelStatus !== true
    );
    const sourceTransaction = this.getPaymentSourceTransaction(voucher, firstDetail);
    if (!sourceTransaction) {
      return null;
    }

    return {
      ...sourceTransaction,
      vType: 'PAYMENT',
      refNO: voucher.paymentVoucherVoucherNo,
      accNO: firstDetail.paymentVoucherDetailsAcNo,
      allocationId: voucher.paymentVoucherAllocationId,
      allocationVoucherVcreation: AllocationSourceType.PaymentVoucher,
    };
  }

  private getPaymentSourceTransaction(
    voucher: PaymentVoucher,
    firstDetail = voucher?.paymentVoucherDetails?.find(
      (detail) => detail?.paymentVocherDetailsDelStatus !== true
    )
  ) {
    if (!firstDetail) {
      return null;
    }

    return (
      voucher?.accountsTransactions?.find(
        (transaction) =>
          transaction?.accountsTransactionsVoucherNo ===
            voucher?.paymentVoucherVoucherNo &&
          transaction?.accountsTransactionsAccNo ===
            firstDetail?.paymentVoucherDetailsAcNo &&
          Number(transaction?.accountsTransactionsDebit || 0) > 0
      ) ||
      voucher?.accountsTransactions?.find(
        (transaction) =>
          transaction?.accountsTransactionsVoucherNo ===
            voucher?.paymentVoucherVoucherNo &&
          Number(transaction?.accountsTransactionsDebit || 0) > 0
      ) ||
      null
    );
  }

  private hasPaymentLinkedAllocations(voucher: PaymentVoucher): boolean {
    const rows = voucher?.allocationDetails || [];
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

  private reconcilePaymentVoucherAllocationState(
    voucher: PaymentVoucher,
    callback: (voucher: PaymentVoucher) => void
  ) {
    const firstDetail = voucher?.paymentVoucherDetails?.find(
      (detail) => detail?.paymentVocherDetailsDelStatus !== true
    );
    const accNo = firstDetail?.paymentVoucherDetailsAcNo;
    const voucherNo = voucher?.paymentVoucherVoucherNo;

    if (!accNo || !voucherNo) {
      this.paymentHasActiveAllocation = false;
      callback(this.normalizeReleasedPaymentVoucher(voucher));
      return;
    }

    this.accountstatement
      .getPaymentAllocationVoucherDetails(accNo, voucherNo, 'PAYMENT')
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
            (allocAmount > 0 || allocationStatus === 'PARTIAL' || allocationStatus === 'FULL')
          );
        });

        this.paymentHasActiveAllocation = hasTargetRows;
        callback(
          hasTargetRows ? voucher : this.normalizeReleasedPaymentVoucher(voucher)
        );
      },
      () => {
        this.paymentHasActiveAllocation =
          this.hasPaymentLinkedAllocations(voucher);
        callback(voucher);
      }
    );
  }

  private normalizeReleasedPaymentVoucher(
    voucher: PaymentVoucher
  ): PaymentVoucher {
    const normalizedVoucher: PaymentVoucher = {
      ...voucher,
      paymentVoucherAllocationId: 0,
      allocationDetails: [],
    };

    const sourceTransaction = this.getPaymentSourceTransaction(normalizedVoucher);
    if (sourceTransaction) {
      sourceTransaction.accountsTransactionsAllocDebit = 0;
      sourceTransaction.accountsTransactionsFcAllocDebit = 0;
      sourceTransaction.accountsTransactionsAllocBalance = Number(
        sourceTransaction.accountsTransactionsDebit || 0
      );
    }

    return normalizedVoucher;
  }

  private isPaymentVoucherFullyAllocated(voucher: PaymentVoucher): boolean {
    if (!this.hasPaymentLinkedAllocations(voucher)) {
      return false;
    }

    const sourceTransaction = this.getPaymentSourceTransaction(voucher);
    if (!sourceTransaction || Number(voucher?.paymentVoucherAllocationId || 0) <= 0) {
      return false;
    }

    return Number(sourceTransaction.accountsTransactionsAllocBalance || 0) <= 0;
  }

  private shouldBlockPaymentVoucherEdit(voucher: PaymentVoucher): boolean {
    const sourceTransaction = this.getPaymentSourceTransaction(voucher);
    if (!sourceTransaction) {
      return false;
    }

    return (
      this.paymentHasActiveAllocation &&
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

  filter() {
    let filteredArray = this.filterArray;
    if (
      this.PaymentVoucherFilterForm.value.paymentVoucherNo != null &&
      this.PaymentVoucherFilterForm.value.paymentVoucherNo.trim() !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.paymentVoucherVoucherNo?.toUpperCase() ===
          this.PaymentVoucherFilterForm.value.paymentVoucherNo.trim().toUpperCase()
      );
    }

    const selectedAcNo = this.PaymentVoucherFilterForm.value.paymentVoucherAcNo;
    if (
      selectedAcNo != null &&
      selectedAcNo !== '' &&
      selectedAcNo !== -1 &&
      selectedAcNo !== '-1'
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.paymentVoucherCrAcNo?.trim() === selectedAcNo?.toString().trim() ||
          res.paymentVoucherDetails?.some(
            (d) =>
              d.paymentVoucherDetailsAcNo?.trim() ===
              selectedAcNo?.toString().trim()
          ) ||
          res.accountsTransactions?.some(
            (t) =>
              t.accountsTransactionsAccNo?.trim() ===
              selectedAcNo?.toString().trim()
          )
      );
    }

    if (this.PaymentVoucherFilterForm.value.isDate) {
      const fromDateStr = this.PaymentVoucherFilterForm.value.fromDate;
      const toDateStr = this.PaymentVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.paymentVoucherDate);

        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);

        return (
          (voucherDate.getTime() >= fromDate.getTime() &&
            voucherDate.getTime() <= toDate.getTime()) ||
          voucherDate.getTime() === fromDate.getTime()
        );
      });
    }
    this.paymentVoucherarry = filteredArray;
  }

  ClearFilter(table?: any, searchInput?: any) {
    this.PaymentVoucherFilterForm.reset();
    this.PaymentVoucherFilterForm.get('paymentVoucherAcNo').setValue(null);
    this.PaymentVoucherFilterForm.get('fromDate').setValue(new Date());
    this.PaymentVoucherFilterForm.get('toDate').setValue(new Date());
    this.paymentVoucherarry = this.filterArray;
    if (table) {
      table.filterGlobal('', 'contains');
    }
    if (searchInput) {
      searchInput.value = '';
    }
  }

  updateTableConfiguration() {
    const hiddenColumns = [2, 6];

    if (this.hideJobDetail) {
      hiddenColumns.push(3);
    }
    if (this.hideCostCenterDetail) {
      hiddenColumns.push(4);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }
}
export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value?.trim() !== '') {
      return timer(time).pipe(
        switchMap(() => acctService.CheckVnoExist(input.value)),
        map((res) => {
          return res.result === false ? null : { Exist: true };
        })
      );
    }
  };
};

interface GridData {
  account?: string;
  debit?: number;
  credit?: number;
  jobname?: string;
  costcenter?: string;
  narration?: string;
  id?: number;
  /** UI-only: exact account number picked for this row. */
  accountNo?: string;
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
export const paymentVoucherColumnList = (
  component: PaymentvoucherComponent
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
      width: 80,
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
