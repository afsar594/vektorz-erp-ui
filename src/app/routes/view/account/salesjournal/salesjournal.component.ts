import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { FormBuilder, FormGroup } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { SalesJournal } from 'src/app/routes/domain/Accounts/SalesJournal';
import { SalesJournalDetails } from 'src/app/routes/domain/Accounts/SalesJournalDetails';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { timer, Observable } from 'rxjs';
import { LoginService } from 'src/app/routes/service/login.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
@Component({
  selector: 'app-salesjournal',
  templateUrl: './salesjournal.component.html',
  styleUrls: ['./salesjournal.component.scss'],
})
export class SalesjournalComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;

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

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  usrid: number;
  fsno: number;
  locId: number;

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  salesJournalarry: SalesJournal[] = [];
  // savedSalesJournalGridData: GridData[] = [];
  savedSalesJournal: SalesJournal;
  ScreenId: number;
  Permission: any;
  user: any;
  JOBCOST: boolean = true;

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
    private permission: PermissionsService,
    private utilityService: UtilityService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'salesjournal_HotEntry';
  salesjournal_entry: Handsontable.GridSettings;
  salesJournalFormGroup: FormGroup;
  salesjournal_entryDataset = [];
  // accountTransactionDataset = [];
  cols;
  ngAfterViewInit() {}
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Sales Journal') {
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

    this.cols = [
      { field: 'salesJournalVno', header: 'Voucher No' },
      { field: 'salesJournalDate', header: 'Date' },
      // { field: 'salesJournalAcNo', header: 'Account' },
      { field: 'salesJournalCurrencyId', header: 'Currency' },
      { field: 'salesJournalDrAmount', header: 'Vchr.Debit' },
      { field: 'salesJournalCrAmount', header: 'Vchr.Credit' },
      { field: 'salesJournalNarration', header: 'Narration' },
      { field: 'salesJournalDrAmount', header: 'Dtls.Debit' },
      { field: 'salesJournalCrAmount', header: 'Dtls.Credit' },
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.salesJournalFormGroup = this.fb.group({
      salesJournalId: [0],
      salesJournalVno: [{ value: '', disabled: true }],
      salesJournalDate: [null, [Validators.required]],
      salesJournalRefNo: ['', [Validators.required]],
      // salesJournalAcNo: [-1, [DropDownValidator]],
      salesJournalCrAmount: [{ value: null, disabled: true }],
      salesJournalDrAmount: [{ value: null, disabled: true }],
      salesJournalNarration: ['', [Validators.required]],
      salesJournalCurrencyId: [-1, [DropDownValidator]],
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
    this.bykeys();
  }
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
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
  updateTableConfiguration() {
    const hiddenColumns = [9];
    // if (this.JOBCOST) {
    //   hiddenColumns.push(3);
    // }
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

  get f() {
    return this.salesJournalFormGroup.controls;
  }

  initializeControls() {
    this.getAllJobs();
    this.getAllCostCenter();
    this.getAllAccount();
    this.getAllCurrency();
    this.getAllSalesJournal();
    this.getDefaultCurrency();
    this.getDefaultLocation();

    const hiddenColumns = [4, 5, 9];
    this.salesjournal_entry = this.utilityService.getTableConfig(
      ColumnList(this),
      hiddenColumns
    );
    this.salesjournal_entry.afterSelection = (
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

      if (column === 0 && this.salesjournal_entry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 4 && this.salesjournal_entry.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 5 && this.salesjournal_entry.readOnly === false) {
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

    this.salesjournal_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.salesjournal_entry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.salesjournal_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.salesjournal_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };

    // this.salesjournal_entry.afterChange = (r, c) => {
    //   // const  hotinstance = this.hotRegisterer.getInstance(this.hotid);
    //   // var data = hotinstance.getDataAtRow(r);
    //   console.log(r, c);

    // };
  }

  //  openCurrency() {
  //   this.control = this.f.salesJournalCurrencyId;
  //   this.elementReference = this.currencyCtrol;
  //   this.lookupGridColumns = ['Currency', 'Currency ID'];
  //   this.formControlLookUp = true;
  //   this.selectItem = { account: this.currencyCtrol.nativeElement.value,
  //     accountId: this.f.salesJournalCurrencyId.value };
  //   this.dataList = this.currencyLookup;
  // }

  ColumnSum() {
    const sum1 = this.salesjournal_entry.data
      .filter((item) => item.hasOwnProperty('debit'))
      .reduce((sum, current: any) => sum + current.debit, [0]);
    this.salesJournalFormGroup.controls.salesJournalDrAmount.setValue(sum1);

    const sum2 = this.salesjournal_entry.data
      .filter((item) => item.hasOwnProperty('credit'))
      .reduce((sum, current: any) => sum + current.credit, [0]);
    this.salesJournalFormGroup.controls.salesJournalCrAmount.setValue(sum2);
  }
  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = k.map((ar) => ar.currencyMasterCurrencyName.trim());
    });
  }
  getAllJobs() {
    this.masterapi.GetAllJobMaster().subscribe((k) => {
      this.jobArray = k.result;
      this.jobList = k.result.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobArry = k.result.map((ar) => ar.jobMasterJobName.trim());
      this.jobList.unshift({ label: '--Select job--', value: -1 });
    });
  }

  getAllCostCenter() {
    this.masterapi.GetAllCostCenter().subscribe((k) => {
      this.costcenterArray = k;
      this.costcenterList = k.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterArry = k.map((ar) =>
        ar.costCenterMasterCostCenterName.trim()
      );
    });
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      // this.accountList.unshift({label : '--Select Account--', value: -1});
      //this.acctArry = k.result.map(ar => ar.maAccName.trim() + '|' + ar.maAccNo);
      this.acctArry = k.result.map((ar) => ar.maAccName.trim());
    });
  }

  get accountSetLookup() {
    return this.accountArray.map((kl) => ({
      account: kl.maAccName,
      accountId: kl.maAccNo,
    }));
  }

  // get currencyLookup() {
  //   return this.currencyList.map((kl) => ({ account: kl.label,
  //   accountId: kl.value}));
  // }

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

  saveSalesJournal() {
    this.salesJournalFormGroup.markAllAsTouched();
    const savedData: Array<any> = this.salesjournal_entry.data.filter((k) =>
      k.hasOwnProperty('account')
    );
    const salesJournal_Save: SalesJournal = this.salesJournalFormGroup
      .value as SalesJournal;
    salesJournal_Save.salesJournalVno =
      this.salesJournalFormGroup.getRawValue().salesJournalVno;
    salesJournal_Save.salesJournalId = Number(
      this.salesJournalFormGroup.value.salesJournalId
    );
    salesJournal_Save.salesJournalCrAmount = Number(
      this.salesJournalFormGroup.value.salesJournalCrAmount
    );
    salesJournal_Save.salesJournalFcCrAmount =
      this.salesJournalFormGroup.value.salesJournalCrAmount;
    salesJournal_Save.salesJournalDrAmount = Number(
      this.salesJournalFormGroup.value.salesJournalDrAmount
    );
    salesJournal_Save.salesJournalFcDrAmount =
      this.salesJournalFormGroup.value.salesJournalDrAmount;
    salesJournal_Save.salesJournalFsno = this.fsno;
    salesJournal_Save.salesJournalUserId = this.usrid;
    salesJournal_Save.salesJournalLocationId = this.locId;
    salesJournal_Save.salesJournalAllocId = null;
    //  salesJournal_Save.salesJournalAllocId = '';
    salesJournal_Save.accountsTransactions = [];
    salesJournal_Save.salesJournalDetails = savedData
      .filter(
        (k) => k.account != null && k.debit != null && k.narration != null
      )
      .map((k: GridData) => {
        return {
          // salesJournalDetailsId: k.id != null ? k.id : 0,
          salesJournalDetailsId: k.id,
          salesJournalDetailsVno:
            this.salesJournalFormGroup.getRawValue().salesJournalVno,
          salesJournalId: 0,
          salesJournalDetailsAccNo: this.accountArray?.find(
            (x) => x.maAccName.trim() === k.account.trim()
          ).maAccNo,
          salesJournalDetailsVatableAmount: k.vat,
          salesJournalDetailsDrAmount: k.debit,
          salesJournalDetailsFcDrAmount: k.debit,
          salesJournalDetailsCrAmount: 0,
          salesJournalDetailsFcCrAmount: 0,
          salesJournalDetailsJobNo:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label.trim() === k.jobname.trim())
                  .value
              : -1,
          salesJournalDetailsCostCenterId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                  (j) =>
                    j.costCenterMasterCostCenterName.trim() ===
                    k.costcenter.trim()
                ).costCenterMasterCostCenterId
              : null,
          salesJournalDetailsNarration: k.narration,
          salesJournalDetailsFsno: this.fsno,
          salesJournalDetailsLocationId: this.locId,
          salesJournalDetailsDelStatus: false,
        };
      });

    salesJournal_Save.salesJournalDetails
      .filter((x) => x.salesJournalDetailsDelStatus === false)
      .forEach((element) => {
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: element.salesJournalDetailsAccNo,
          accountsTransactionsTransDate: this.f.salesJournalDate.value,
          accountsTransactionsParticulars: element.salesJournalDetailsNarration,
          accountsTransactionsDebit: element.salesJournalDetailsDrAmount,
          accountsTransactionsFcDebit: element.salesJournalDetailsDrAmount,
          accountsTransactionsCredit: 0,
          accountsTransactionsFcCredit: 0,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo: element.salesJournalDetailsVno,
          accountsTransactionsDescription: element.salesJournalDetailsNarration,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsTransSno: 0,
        };
        salesJournal_Save.accountsTransactions.push(debitData);

        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: element.salesJournalDetailsAccNo,
          accountsTransactionsTransDate: this.f.salesJournalDate.value,
          accountsTransactionsParticulars: element.salesJournalDetailsNarration,
          accountsTransactionsDebit: 0,
          accountsTransactionsFcDebit: 0,
          accountsTransactionsCredit: element.salesJournalDetailsDrAmount,
          accountsTransactionsFcCredit: element.salesJournalDetailsDrAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.salesJournalFormGroup.getRawValue().salesJournalVno,
          accountsTransactionsDescription: this.f.salesJournalNarration.value,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsTransSno: 0,
        };
        salesJournal_Save.accountsTransactions.push(creditData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(salesJournal_Save);
    } else {
      salesJournal_Save.accountsTransactions
        .filter((x) => x.accountsTransactionsTransSno != 0)
        .forEach((element, index, arry) => {
          arry[index].accountstransactionsDelStatus = true;
        });

      this.updateVoucher(salesJournal_Save);
    }
  }

  validateTotalDrCrAmounts(): boolean {
    if (
      this.salesJournalFormGroup.getRawValue().salesJournalCrAmount == 0 &&
      this.salesJournalFormGroup.getRawValue().salesJournalDrAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    //    if(this.salesJournalFormGroup.getRawValue().salesJournalCrAmount ==0 ){
    //  this.messageService.add({severity: 'error', summary: 'Alert', detail: 'Total Credit is Zero'});
    //     return false;
    //   }

    if (this.salesJournalFormGroup.getRawValue().salesJournalDrAmount == 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total  Debit Amounts are Zero',
      });
      return false;
    }

    return true;
  }

  saveVoucher(salesJournal_Save: SalesJournal) {
    if (this.salesJournalFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.accountapi.InsertSalesJournal(salesJournal_Save).subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedSalesJournal = data.result;
                this.updateFormGrid(data.result);
                this.userTrackingLog('Insert');
                if (data.valid) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Alert',
                    detail: data.message,
                  });
                } else if (data.error) {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail:
                      data.message != null && data.message.trim() !== ''
                        ? data.message
                        : data.exception,
                  });
                }
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Payment Voucher Save Failed',
                });
              }
            );
          }
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.salesJournalFormGroup.markAllAsTouched();
      this.salesJournalFormGroup.markAsDirty();
    }
  }

  // updateVoucher(salesJournal_Save: ) {
  //   this.confirmation.confirm({
  //     key: 'confirm-key',
  //     message: 'Do you want to update existing voucher?',
  //     accept: () => {
  //       this.accountapi.UpdateSalesJournal().subscribe((data) => {
  //         this.btnFlag = {edit: true, cancel: false, save: false, update: true, delete: true};
  //         this.updateFormGrid(data);
  //         this.messageService.add({severity: 'success', summary: 'Alert', detail: 'Sales Journal Updated Succesfully'});
  //         }, (err) => {
  //         this.messageService.add({severity: 'error', summary: 'Alert', detail: 'Sales Journal Update Failed'});
  //     });
  //      }
  //   });
  // }

  updateVoucher(salesJournal_Save: SalesJournal) {
    if (this.salesJournalFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.accountapi.UpdateSalesJournal(salesJournal_Save).subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.updateFormGrid(data.result);
                this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Sales Journal Updated Succesfully',
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Sales Journal Update Failed',
                });
              }
            );
          }
        },
      });
    } else {
      // const msg1 = 'Please fill mandatory fields';
      // const msg2 = 'Please fill Empyt Debit account details';
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.salesJournalFormGroup.markAllAsTouched();
      this.salesJournalFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllSalesJournal() {
    this.accountapi.GetSalesJournal().subscribe((data) => {
      this.salesJournalarry = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo.trim() === acctnumber.trim()
    )?.maAccName;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  initializeHandsontable(columns, colHeaders) {
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      columns: columns,
      colHeaders: colHeaders,
    });
  }

  getDefaultCurrency() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULTCURRENCY')
      .subscribe((data) => {
        if (data !== null) {
          // console.log(data,'Please Check');
          this.DefCurCheck = data.result[0].generalSettingsTextValue;
          if (this.DefCurCheck !== null) {
            const splitText = this.DefCurCheck.split('::');
            this.DefCurrency = splitText[1].trim();
            this.f.salesJournalCurrencyId.setValue(Number(this.DefCurrency));
          }
        }
      });
  }

  getDefaultLocation() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULT_LOCATION')
      .subscribe((data) => {
        if (data !== null) {
          // console.log(data,'Please Check');
          this.DefLocationCheck = data.result[0].generalSettingsTextValue;
          if (this.DefLocationCheck !== null) {
            const splitText = this.DefLocationCheck.split('::');
            this.DefLocation = splitText[1].trim();
            // this.f.paymentVoucherLocationId.setValue(Number(this.DefLocation));
          }
        }
      });
  }

  new() {
    this.salesJournalFormGroup.reset();
    this.salesjournal_entry.data = [];
    this.salesjournal_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.salesjournal_entry);
    //  this.hotRegisterer.getInstance(this.hotid).selectAll();
    //  this.hotRegisterer.getInstance(this.hotid).destroyEditor(false, true);
    //  this.hotRegisterer.getInstance(this.hotid).clear();
    //  this.hotRegisterer.getInstance(this.hotid).selectCell(0, 0);

    this.accountTransactionList = [];
    this.salesJournalFormGroup.get('salesJournalId').setValue(null);
    //  this.salesJournalFormGroup.get('salesJournalAcNo').setValue(-1);
    this.salesJournalFormGroup.get('salesJournalCurrencyId').setValue(-1);
    this.salesJournalFormGroup.get('salesJournalDate').setValue(new Date());
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.getDefaultCurrency();
    this.salesJournalFormGroup.enable();
    this.updateTableConfiguration();
    this.salesJournalFormGroup.updateValueAndValidity();
  }

  showMaximizableDialog() {
    this.getAllSalesJournal();
    this.displayMaximizable = true;
  }

  updateFormGrid(salesjournal_update: SalesJournal) {
    this.salesJournalFormGroup.patchValue({
      salesJournalId: salesjournal_update.salesJournalId,
      salesJournalVno: salesjournal_update.salesJournalVno,
      salesJournalDate: new Date(salesjournal_update.salesJournalDate),
      salesJournalRefNo: salesjournal_update.salesJournalRefNo,
      // salesJournalAcNo: salesjournal_update.salesJournalAcNo,
      salesJournalCrAmount: salesjournal_update.salesJournalCrAmount,
      salesJournalFcCrAmount: salesjournal_update.salesJournalCrAmount,
      salesJournalDrAmount: salesjournal_update.salesJournalDrAmount,
      salesJournalFcDrAmount: salesjournal_update.salesJournalDrAmount,
      salesJournalNarration: salesjournal_update.salesJournalNarration,
      salesJournalCurrencyId: salesjournal_update.salesJournalCurrencyId,
    });
    // this.currencyCtrol.nativeElement.value = this.currencyList?.find(k => k.value === salesjournal_update.salesJournalCurrencyId).label;

    this.accountTransactionList = salesjournal_update.accountsTransactions;
    // this.jobArray?.find(j => j.jobMasterJobName.trim()  === k.jobname.trim()).jobMasterId,
    const gridData: GridData[] = salesjournal_update.salesJournalDetails.map(
      (k) => {
        //console.log(k.salesJournalDetailsJobNo,'s1',k.salesJournalDetailsCostCenterId);

        // let  accountId: string = k.salesJournalDetailsAccNo != null ? this.acctArry?.find(l => l.match(k.salesJournalDetailsAccNo)) : null;
        const accountId: string =
          k.salesJournalDetailsAccNo != null
            ? this.accountArray?.find((l) =>
                l.maAccNo.match(k.salesJournalDetailsAccNo)
              )?.maAccName
            : null;
        //console.log(this.jobArry,this.costcenterArry);
        const jobId: string =
          k.salesJournalDetailsJobNo != null
            ? this.jobList?.find((l) => l.value === k.salesJournalDetailsJobNo)
                ?.label
            : null;
        const costCenterId: string =
          k.salesJournalDetailsCostCenterId != null
            ? this.costcenterArray?.find(
                (l) =>
                  l.costCenterMasterCostCenterId ===
                  k.salesJournalDetailsCostCenterId
              ).costCenterMasterCostCenterName
            : null;

        return {
          account: accountId,
          vat: k.salesJournalDetailsVatableAmount,
          debit: k.salesJournalDetailsDrAmount,
          credit: k.salesJournalDetailsCrAmount,
          jobname: jobId,
          costcenter: costCenterId,
          narration: k.salesJournalDetailsNarration,
          id: k.salesJournalDetailsId,
        };
      }
    );
    // this.salesjournal_entry.data = gridData;
    // this.hotRegisterer.getInstance(this.hotid).updateSettings({data: gridData, readOnly: true});

    this.salesjournal_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.salesJournalFormGroup.disable();
    this.f.salesJournalVno.clearValidators();
    this.salesJournalFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  GetSavedSalesJournalDetails(id: string) {
    this.index = 0;
    // this.accountapi.GetSavedSalesJournalDetails(id).subscribe((data) => {
    //   this.btnFlag = {edit: true, cancel: true, save: false, update: true, delete: true};
    //   this.accountTransactionList = data.result.accountsTransactions;
    //   this.updateFormGrid(data.result);
    //   this.savedSalesJournal = data.result;
    //   }, (err) => {
    //   this.messageService.add({severity: 'error', summary: 'Alert', detail: 'Failed'});

    this.accountapi.GetSavedSalesJournalDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.accountTransactionList = data.result.accountsTransactions;
          this.updateFormGrid(data.result);
          this.savedSalesJournal = data.result;
          this.salesJournalFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Sales Journal not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.salesJournalFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.accountapi.DeleteSalesJournal(this.savedSalesJournal).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Sales Journal Deleted Succesfully',
            });
            this.userTrackingLog('Delete');
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
    this.GetSavedSalesJournalDetails(
      this.salesJournalFormGroup.getRawValue().salesJournalVno
    );
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.salesJournalVno.clearValidators();
    this.salesJournalFormGroup.enable();
    this.salesJournalFormGroup.controls.salesJournalVno.disable();
    this.salesJournalFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.salesjournal_entry.data.length > 0) {
      // this.salesjournal_entry.data.forEach((value: GridData, index, arry) => {
      console.log(Object.values(this.salesjournal_entry.data));
      return Object.values(this.salesjournal_entry.data).some(
        (k: GridData) =>
          k.account != null &&
          (k.debit != null || k.credit != null) &&
          !(k.debit == null && k.credit == null)
      );
      // });
    }
    return false;
  }

  //  selectaccount(evt) {
  //   //<<<<<<< HEAD
  //     this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
  //   // =======
  //   //    this.hotRegisterer.getInstance(this.hotid)
  //   //    .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
  //   // >>>>>>> 5803b420e45051299a855e1305a83c66de26ba1c
  //     this.showAccountLookUp = false;

  //   }
  //   exit(evt) {
  //    this.showAccountLookUp = false;
  //    this.formControlLookUp = false;
  //   }
  //   clear(evt) {

  //    if(evt.elementRef!= null) {
  //      (evt.elementRef as ElementRef).nativeElement.value = "";
  //      // this.elementReference.nativeElement.value ="";
  //      evt.formControl.setValue(null)
  //    }else{
  //      this.hotRegisterer.getInstance(this.hotid)
  //      .setDataAtCell(evt.cell.row, evt.cell.column, null);
  //    }
  //    this.showAccountLookUp = false;
  //    this.formControlLookUp = false;
  //   }
  //   selectControl(evt) {
  //    this.control.setValue(evt.accountId);
  //    this.elementReference.nativeElement.value = evt.account;
  //    this.formControlLookUp = false;
  //   }
  //   hide(evt: boolean) {
  //    this.showAccountLookUp = false;
  //    this.formControlLookUp = false;
  //   }

  // }

  selectaccount(evt) {
    //<<<<<<< HEAD
    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
    // =======
    //    this.hotRegisterer.getInstance(this.hotid)
    //    .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
    // >>>>>>> 5803b420e45051299a855e1305a83c66de26ba1c
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
  userTrackingLog(type) {
    let req = {
      page: 'Sales Journal',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.salesJournalFormGroup.get('salesJournalVno').value,
      vpType: 'Sales Journal',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }
}

export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value.trim() !== '') {
      return timer(time).pipe(
        switchMap(() => acctService.CheckVnoExistSalesJournal(input.value)),
        map((res) => {
          return res.result === false ? null : { Exist: true };
        })
      );
    }
  };
};

interface GridData {
  account?: string;
  vat?: number;
  credit?: number;
  debit?: number;
  jobname?: string;
  costcenter?: string;
  narration?: string;
  vatno?: string;
  refno?: string;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const ColumnList = (component: SalesjournalComponent) => [
  {
    data: 'account',
    type: 'autocomplete',
    label: 'Account',
    toolTip: 'Account',
    source: component.acctArry,
    allowInvalid: false,
    strict: false,
    width: 60,
  },
  {
    data: 'vat',
    type: 'numeric',
    label: 'VAT',
    toolTip: 'VAT Amount',
    width: 60,
  },
  {
    data: 'credit',
    type: 'numeric',
    label: 'Credit',
    toolTip: 'Credit Amount',
    width: 60,
  },
  {
    data: 'debit',
    type: 'numeric',
    label: 'Debit',
    toolTip: 'Debit Amount',
    width: 60,
  },
  {
    data: 'jobname',
    type: 'dropdown',
    label: 'Job Name',
    toolTip: 'Job Name',
    source: component.jobArry,
    width: 120,
  },
  {
    data: 'costcenter',
    type: 'dropdown',
    label: 'Cost Center',
    toolTip: 'Cost Center',
    source: component.costcenterArry,
    width: 60,
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    toolTip: 'Narration (Max 500 chars)',
    width: 180,
  },
  {
    data: 'vatno',
    type: 'text',
    label: 'VAT No',
    toolTip: 'VAT Number',
    width: 60,
  },
  {
    data: 'refno',
    type: 'text',
    label: 'Ref No',
    toolTip: 'Reference Number',
    width: 60,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
    toolTip: 'Record ID',
    width: 60,
  },
];
