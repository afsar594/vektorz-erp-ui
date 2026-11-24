import { DatePipe } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  MenuItem,
  SelectItem,
  MessageService,
  ConfirmationService,
} from 'primeng';
import { timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ChartofAccounts } from 'src/app/routes/domain';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { PaymentRequest } from 'src/app/routes/domain/Accounts/PaymentRequest';
import { PaymentRequestDetails } from 'src/app/routes/domain/Accounts/PaymentRequestDetail';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { CredentialKeys } from 'src/app/routes/Enums/loginInfo';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { LoginService } from 'src/app/routes/service/login.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';

@Component({
  selector: 'app-payment-request',
  templateUrl: './payment-request.component.html',
  styleUrls: ['./payment-request.component.scss'],
})
export class PaymentRequestComponent implements OnInit {
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
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
  activeRow: { row: number; column: number };
  rptVrno: string;
  rptVrdt: string;
  rptAddess: string;
  showAccountLookUp: boolean = false;
  formControlLookUp: boolean = false;
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
  accountTransactionList: AccountsTransactions[] = [];
  paymentRequestarry: PaymentRequest[] = [];
  _paymentRequestDetails: PaymentRequestDetails;
  savedPaymentRequest: PaymentRequest;
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
  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private printService: FileSaverService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,

    private loginser: LoginService,
    private storage: LocalStorageService,
    private accountapi: AccountApiService,
    private utilityService: UtilityService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.CramtChk = 0;
  }

  vNo: string = '';
  paymentvoucherentry: Handsontable.GridSettings;
  paymentRequestFormGroup: FormGroup;
  PaymentRequestFilterForm: FormGroup;
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
      { field: 'paymentRequestVoucherNo', header: 'Voucher No' },
      { field: 'paymentRequestDate', header: 'Date' },
      { field: 'paymentRequestCrAcNo', header: 'Account' },
      { field: 'paymentRequestCurrencyId', header: 'Currency' },
      { field: 'paymentRequestDbAmount', header: 'Vchr.Debit' },
      { field: 'paymentRequestCrAmount', header: 'Vchr.Credit' },
      { field: 'paymentRequestNarration', header: 'Particulars' },
      { field: 'paymentRequestDbAmount', header: 'Dtls.Debit' },
      { field: 'paymentRequestCrAmount', header: 'Dtls.Credit' },
      { field: '', header: 'Action' },
    ];

    // let today = new Date();
    // this.date1 = today.getMonth() + '/' + today.getDate() + '/' + today.getFullYear();
    this.date1 = new Date().toLocaleDateString();

    this.initializeControls();
    this.paymentRequestFormGroup = this.fb.group({
      paymentRequestSno: 0,
      paymentRequestVoucherNo: [{ value: null, disabled: true }],
      paymentRequestDate: [null, [Validators.required]],
      paymentRequestVoucherRef: [''],
      paymentRequestCrAmount: 0,
      paymentvoucherCrAmt: 0,
      paymentRequestDbAmount: 0,
      paymentRequestNarration: [''],
      paymentRequestCurrencyId: [-1, [DropDownValidator]],
    });
    this.paymentRequestFormGroup.disable();
    this.PaymentRequestFilterForm = this.fb.group({
      paymentRequestAcNo: [null],
      isDate: [],
      paymentRequestNo: [null],
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
    this.paymentRequestFormGroup.disable();
    this.bykeys();
  }

  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail,Hide_CostCenter_Detail')
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        const costCenterSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;
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
    return this.paymentRequestFormGroup.controls;
  }

  initializeControls() {
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
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
    });

    let cols = paymentRequestColumnList(this);

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
      this.itemList.splice(index, 1);
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

  ColumnSum() {
    if (this.paymentvoucherentry.data.length > 0) {
      var value = 0;
      this.paymentvoucherentry.data.forEach((elemt: any) => {
        if (elemt && elemt.debit > 0) {
          value += elemt.debit;
        }
      });
      value = parseFloat(value.toFixed(2));
      this.paymentRequestFormGroup.controls.paymentRequestDbAmount.setValue(
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

  savePaymentRequest() {
    this.paymentRequestFormGroup.markAllAsTouched();
    this.paymentRequestFormGroup.controls['paymentRequestDbAmount'].setValue(
      parseFloat(this.paymentRequestFormGroup.value.paymentRequestDbAmount)
    );

    const savedData: any = this.paymentvoucherentry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    const paymtVoucher: PaymentRequest = this.paymentRequestFormGroup
      .value as PaymentRequest;
    paymtVoucher.paymentRequestVoucherNo =
      this.paymentRequestFormGroup.getRawValue().paymentRequestVoucherNo;
    paymtVoucher.paymentRequestSno =
      this.paymentRequestFormGroup.value.paymentRequestSno != null
        ? parseInt(this.paymentRequestFormGroup.value.paymentRequestSno)
        : 0;
    paymtVoucher.paymentRequestCrAmount =
      this.paymentRequestFormGroup.value.paymentvoucherCrAmt;
    paymtVoucher.paymentRequestFcCrAmount =
      this.paymentRequestFormGroup.value.paymentvoucherCrAmt;
    paymtVoucher.paymentRequestFsno = this.fsno;
    paymtVoucher.paymentRequestUserId = this.usrid;
    paymtVoucher.paymentRequestLocationId = this.locId;
    paymtVoucher.paymentRequestAllocationId = 0;
    paymtVoucher.paymentRequestDetails = savedData
      ?.filter((k) => k.account != null && k.debit != null)
      .map((k: GridData) => {
        return {
          paymentRequestDetailsId: k.id != null ? k.id : 0,
          // paymentRequestDetailsId: k.id,
          paymentRequestDetailsVoucherNo:
            this.paymentRequestFormGroup.getRawValue().paymentRequestVoucherNo,
          paymentRequestDetailsSno:
            this.paymentRequestFormGroup.getRawValue().paymentRequestSno,
          paymentRequestDetailsAcNo: this.accountArray?.find(
            (x) => x.maAccName?.trim() === k.account?.trim()
          ).maAccNo,
          paymentRequestDetailsDbAmount: k.debit,
          paymentRequestDetailsDbFcAmount: k.debit,
          paymentRequestDetailsCrAmount: k.credit,
          paymentRequestDetailsCrFcAmount: k.credit,
          paymentRequestDetailsJobId:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                ?.value
              : -1,
          paymentRequestDetailsDepartmentId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                (j) =>
                  j.costCenterMasterCostCenterName?.trim() ===
                  k.costcenter?.trim()
              )?.costCenterMasterCostCenterId
              : null,

          // paymentRequestDetailsDepartmentId: 0,
          paymentRequestDetailsNarration: k.narration,
          paymentRequestDetailsFsno: this.fsno,
          paymentRequestDetailsLocationId: this.locId,
          paymentVocherDetailsDelStatus: false,
        };
      });

    if (this.btnFlag.save) {
      this.saveVoucher(paymtVoucher);
    } else {
      this.updateVoucher(paymtVoucher);
    }
  }

  saveVoucher(paymtVoucher: PaymentRequest) {
    if (this.paymentRequestFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.accountapi.InsertPaymentRequest(paymtVoucher).subscribe(
            (data: any) => {
              if (data.valid) {
                this.savedPaymentRequest = data.result;
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
                detail: this.translate.instant('Payment Request Save Failed'),
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
      this.paymentRequestFormGroup.markAllAsTouched();
      this.paymentRequestFormGroup.markAsDirty();
    }
  }

  updateVoucher(paymtVoucher: PaymentRequest) {
    if (this.paymentRequestFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to update existing voucher?'
        ),
        accept: () => {
          this.accountapi.UpdatePaymentRequest(paymtVoucher).subscribe(
            (data: any) => {
              if (data.valid) {
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
                detail: this.translate.instant('Payment Request Update Failed'),
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
      this.paymentRequestFormGroup.markAllAsTouched();
      this.paymentRequestFormGroup.markAsDirty();
    }
  }

  getAllPaymentVouchrs() {
    this.accountapi.GetPaymentRequests().subscribe((data: any) => {
      this.paymentRequestarry = data?.result;
      this.filterArray = data?.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j?.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  new() {
    this.itemList = [];
    this.paymentRequestFormGroup.reset();
    this.paymentRequestFormGroup.enable();
    this.paymentvoucherentry.data = [];

    this.paymentvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.paymentvoucherentry);
    this.accountTransactionList = [];
    this.paymentRequestFormGroup.get('paymentRequestSno').setValue(0);
    this.paymentRequestFormGroup.get('paymentRequestCurrencyId').setValue(-1);
    this.paymentRequestFormGroup.get('paymentRequestDate').setValue(new Date());
    this.GetDefaultSettings();
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
    this.f.paymentRequestVoucherNo.clearValidators();
    this.paymentRequestFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  showMaximizableDialog() {
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
          this.f.paymentRequestCurrencyId.setValue(Number(this.DefCurrency));
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
        this.f.paymentRequestCrAcNo.setValue(this.defaultMasterAccount);
      });
  }

  updateFormGrid(pymt: any) {
    this.search = null;
    this.paymentRequestFormGroup.patchValue({
      paymentRequestSno: pymt.paymentRequestSno,
      paymentRequestVoucherNo: pymt.paymentRequestVoucherNo,
      paymentRequestDate: new Date(pymt.paymentRequestDate),
      paymentRequestVoucherRef: pymt.paymentRequestVoucherRef,
      paymentRequestCrAcNo: pymt.paymentRequestCrAcNo,
      paymentRequestCrAmount: pymt.paymentRequestDbAmount,
      paymentRequestCrAmt: pymt.paymentRequestCrAmount,
      paymentRequestDbAmount: pymt.paymentRequestDbAmount,
      paymentRequestNarration: pymt.paymentRequestNarration,
      paymentRequestCurrencyId: pymt.paymentRequestCurrencyId,
    });

    const gridData: GridData[] = pymt.paymentRequestDetails.map((k) => {
      const accountId: string =
        k.paymentRequestDetailsAcNo != null
          ? this.accountArray?.find((l) =>
            l.maAccNo.match(k.paymentRequestDetailsAcNo)
          )?.maAccName
          : null;

      const jobId: string =
        k.paymentRequestDetailsJobId != null
          ? this.jobList?.find((l) => l.value == k.paymentRequestDetailsJobId)
            ?.label
          : null;

      const costcenterId: string =
        k.paymentRequestDetailsDepartmentId != null
          ? this.costcenterList?.find(
            (l) => l.value == k.paymentRequestDetailsDepartmentId
          ).label
          : null;
      return {
        account: accountId,
        debit: k.paymentRequestDetailsDbAmount,
        credit: k.paymentRequestDetailsCrAmount,
        jobname: jobId,
        costcenter: costcenterId,
        narration: k.paymentRequestDetailsNarration,
        id: k.paymentRequestDetailsId,
      };
    });
    this.paymentvoucherentry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.paymentvoucherentry.readOnly = true;
    this.paymentRequestFormGroup.disable();
    this.f.paymentRequestVoucherNo.clearValidators();
    this.paymentRequestFormGroup.updateValueAndValidity();
  }

  displayPrint() {
    this.displayPrintPreview = true;
    // this.getAllStationMaster();
  }

  printAsPDF() {
    const fileName = String(new Date().valueOf());
    var css: string = `

  .flexcol{
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
  }

  .flexrow{
      display: flex;
      flex-direction: row;
      justify-content: start;
      align-items: start;
  }

  .contain1 {
    border: 2.5px solid rgb(201, 204, 204);
    width: 100%;
    margin-bottom: 5px;
    border-radius: 1px;
    margin-top: 5px;
    padding: 16px;
    box-shadow: 5px 5px rgb(201, 204, 204);
  }

  .flex {
    display: flex;
    gap: 2px;
    /* Adjusted the gap value here */
     margin-top: -42px;
    margin-bottom: 5px;
   }
  .flex1 {
    display: flex;
    gap: 2px;
    /* Adjusted the gap value here */
     padding-top:  2px;
    margin-bottom: 5px;
  }
  .payment1 {
    width: 45%;
    margin-bottom: 5px;
    border-radius: 1px;
    margin-top: 15px;
    padding-bottom: 40px;
    padding: 8px;
  }

  .payment2 {
    width: 45%;
    margin-bottom: 5px;
    border-radius: 1px;
    margin-top: 90px;
    padding-bottom: 40px;
    padding-left: 8px;
    margin-left: 10px;

  }
  .center{
    text-align: center;
  }
  .inputGroup {
    margin: 4px 0;
  }

  .w-100 {
    width: 100% !important;
  }
  .wp-50{
    width: 50% !important;
  }

  .w-85 {
    // min-width: 82%;
    width: 100%;
  }

  .p-inputgroup {
    display: inline-flex;
  }

  .p-0 {
    padding: 0;
  }

  .grid {
    max-height: 500px;
    overflow: auto;
  }

  .f-r {
    float: right;
  }

  .min-panel {
    min-height: 106px !important;
  }

  :host ::ng-deep .ui-table .ui-table-thead>tr>th {
    position: -webkit-sticky;
    position: sticky;
    top: -8px;
    box-shadow: 1px 3px 6px 0 rgba(32, 33, 36, 0.10);
  }

  @media screen and (max-width: 64em) {
    :host ::ng-deep .ui-table .ui-table-thead>tr>th {
      top: -8px;
    }
  }

  .handsontable {
    max-width: 1500px !important;
    overflow: none !important;
    margin: 0px !important;
  }

  .main {
    flex: 1;
    width: 80%;
    margin: auto;
  }

  #customers {
    // font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width:100%;
  }

  #customers td,
  #customers th {
    border: 1px solid #ddd;
    padding: 8px;
    // text-align: center;
  }

  #customers tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  #customers tr:hover {
    background-color: #ddd;
  }

  #customers th {
    padding-top: 12px;
    padding-bottom: 12px;
    background-color: #bcc0bf;
    color: rgb(0, 0, 0);
    text-align: left;
  }

  .table {
    border: 1px solid rgb(201, 204, 204);
    border-radius: 2px;
    margin-top: 2px;
     width: 100%;


  }



  .print {

    margin: auto !important;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .voucher {
    display: flex;
    align-items: center;
  }

  .voucher b {
    margin-right: 5px; /* Adjust as needed */
  }
  .date {
    display: flex;
    align-items: center;
    padding-right: 30%;
  }

  .date b {
    margin-right: 5px; /* Adjust as needed */
  }
  .inflex{
     display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
  }
    .row {
      display: flex;
      flex-direction: row;
      gap: 120px;
      margin-left: 5px;
      margin-top:10px;
      margin-bottom:10px;
      align-items: center; /* Adjust alignment as needed */
  }

.signature-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.customer-signature {
  order: 1;
  /* Specifies the order of the flex items */
}

.authorized-signature {
  order: 2;
  /* Specifies the order of the flex items */
}

  @page {
    margin: 5mm 10mm;

  }


@media print {
  thead {display: table-header-group;}
  tfoot {display: table-footer-group;}

  button {display: none;}

  body {margin: 5px;}
}
.alignEnd{
align-items: end;
}

.page {
page-break-after: always;
}

.page-footer {
  position: running(footer);
  bottom: 0;
  width: 100%;
  visibility: visible;
  border-top: 1px solid black;
}

.space{
  margin-left: 50px
}

.space1{
  margin-left: 61px
}

.divContent
{
    min-height: 100%;
    height: auto !important; /*Cause footer to stick to bottom in IE 6*/
    height: 100%;
    margin: 0 auto -100px; /*Allow for footer height*/
    vertical-align:bottom;
}
     .rectImg {
    height: 100px;
    width: 200px;
  margin-left: 90px;
    margin-top: -30px;
}

.squreImg {
  height: 120px;
  width: 120px;
  margin-left:90px;
  margin-top: -30px;
}
    `;
    this.printService.PrintPDF('contentToConvert', css);
    this.userTrackingLog('PDF');
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
      vpNo: this.paymentRequestFormGroup.get('paymentRequestVoucherNo').value,
      vpType: 'Payment Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  GetSavedPaymentDetails(id: any) {
    this.index = 0;
    //this.callDropdowns();
    this.accountapi.GetSavedPaymentRequestDetails(id).subscribe(
      (data: any) => {
        if (data !== null) {
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
          this.accountTransactionList = data.result.accountsTransactions;
          this.updateFormGrid(data.result);

          this.paymentRequestFormGroup.disable();
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
        this.paymentRequestFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to delete voucher?'),
      accept: () => {
        this.accountapi
          .DeletePaymentRequest(this.savedPaymentRequest)
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
    //  this.hotRegisterer.getInstance(this.hotid).updateSettings({ readOnly: false });
    this.btnFlag = {
      new: false,
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      print: true,
      printPreview: false,
    };

    this.paymentvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.paymentvoucherentry);
    this.f.paymentRequestVoucherNo.clearValidators();
    this.paymentRequestFormGroup.enable();
    this.paymentRequestFormGroup.controls.paymentRequestVoucherNo.disable();

    this.paymentRequestFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.paymentvoucherentry.data.length > 0) {
      return Object.values(this.paymentvoucherentry.data).some(
        (k: GridData) => k.account != null && k.debit != null
      );
      // });
    }
    return false;
  }

  selectaccount(evt) {
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
    }
    hot.selectCell(this.activeRow.row, 1);

    let u = {
      paymentRequestDetailsAcNo: evt.accountId,
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

  filter() {
    let filteredArray = this.filterArray;
    if (this.PaymentRequestFilterForm.value.paymentRequestNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.paymentRequestVoucherNo ===
          this.PaymentRequestFilterForm.value.paymentRequestNo.toUpperCase()
      );
    }

    if (
      this.PaymentRequestFilterForm.value.paymentRequestAcNo != null &&
      this.PaymentRequestFilterForm.value.paymentRequestAcNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.paymentRequestCrAcNo ===
          this.PaymentRequestFilterForm.value.paymentRequestAcNo
      );
    }

    if (this.PaymentRequestFilterForm.value.isDate) {
      const fromDateStr = this.PaymentRequestFilterForm.value.fromDate;
      const toDateStr = this.PaymentRequestFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.paymentRequestDate);

        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);

        return (
          (voucherDate.getTime() >= fromDate.getTime() &&
            voucherDate.getTime() <= toDate.getTime()) ||
          voucherDate.getTime() === fromDate.getTime()
        );
      });

      this.paymentRequestarry = filteredArray;
    }
    this.paymentRequestarry = filteredArray;
  }

  ClearFilter() {
    this.PaymentRequestFilterForm.reset();
    this.paymentRequestarry = this.filterArray;
    this.PaymentRequestFilterForm.get('fromDate').setValue(new Date());
    this.PaymentRequestFilterForm.get('toDate').setValue(new Date());
  }

  updateTableConfiguration() {
    const hiddenColumns = [2, 6];
    // if (this.JOBCOST) {
    //   hiddenColumns.push(3);
    // }
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
export const paymentRequestColumnList = (
  component: PaymentRequestComponent
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
      label: 'Amount',
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
