import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  SelectItem,
} from 'primeng';
import { CredentialKeys } from 'src/app/routes/Enums/loginInfo';
import { ChartofAccounts } from 'src/app/routes/domain';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { JournalVoucher } from 'src/app/routes/domain/Accounts/JournalVoucher';
import { JournalVoucherDetails } from 'src/app/routes/domain/Accounts/JournalVoucherDetails';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { LoginService } from 'src/app/routes/service/login.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { defaults } from 'src/app/shared/service/settings';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-depreciation-journal-voucher',
  templateUrl: './depreciation-journal-voucher.component.html',
  styleUrls: ['./depreciation-journal-voucher.component.scss'],
})
export class DepreciationJournalVoucherComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  licensekey: any;
  gridHeader: string;
  DJVForm: FormGroup;
  index: number = 0;
  breadcumbmodel: MenuItem[];
  confirmDropDatabaseDialogVisible: false;
  ScreenId: number;
  Permission: any;
  user: any;
  cols: any;
  handleChange(e) {
    this.index = e.index;
  }
  lookupGridColumns = [];
  dataList: Array<any> = [];
  showAccountLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;

  displayPrintPreview: boolean = false;
  accountTransactionList: AccountsTransactions[] = [];
  journalVoucherarry: JournalVoucher[] = [];
  // savedJournalVoucherGridData: GridData[] = [];
  savedJournalVoucher: JournalVoucher;
  vNo: string = '';

  journalVoucherDetails: any[] = [];
  btnFlag: ButtonFlag;
  journalVoucher: any;
  currencyList: SelectItem[];
  currArry: string[] = [];
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  displayMaximizable: boolean = false;

  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  DefAcc: string;
  DefAccCheck: string;

  usrid: number;
  fsno: number;
  locId: number;

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];
  hotid = 'depreciationJV';
  private hotRegisterer = new HotTableRegisterer();
  depreciationJV: Handsontable.GridSettings;

  difference: number = null;
  companyDetails: StationMaster;

  constructor(
    private activatedroute: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private storage: LocalStorageService,
    private loginser: LoginService,
    private confirmation: ConfirmationService,

    private utilityService: UtilityService,
    private printService: FileSaverService,
    private permission: PermissionsService
  ) {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.companyDetails = this.permission.getStation();
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();
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
    //this.getCD();

    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedDepJournalVoucherDetails(this.vNo);
    }
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.DJVForm = this.fb.group({
      journalVoucherId: [0],
      journalVoucherVno: [{ value: null, disabled: true }],
      journalVoucherDate: [{ value: null, disabled: true }],
      journalVoucherRefNo: [{ value: '', disabled: true }],
      journalVoucherCrAmount: [{ value: null, disabled: true }],
      journalVoucherDrAmount: [{ value: null, disabled: true }],
      journalVoucherNarration: [{ value: '', disabled: true }],
      journalVoucherCurrencyId: [{ value: -1, disabled: true }],
      journalVoucherDepreciationTo: [{ value: '', disabled: true }],
      journalVoucherDepreciationFrom: [{ value: '', disabled: true }],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.cols = [
      { field: 'journalVoucherVrefNo', header: 'Voucher No' },
      { field: 'journalVoucherDate', header: 'Date' },
      { field: 'accName', header: 'Account' },
      { field: 'currName', header: 'Currency' },
      { field: 'journalVoucherDrAmount', header: 'Vchr.Debit' },
      { field: 'journalVoucherCrAmount', header: 'Vchr.Credit' },
      { field: 'journalVoucherNarration', header: 'Remarks' },
      { field: 'Action', header: 'Action' },
    ];
    this.initializeControls();
    this.storage.get(CredentialKeys.Login);
    var user = this.loginser.GetCredentialData();
    this.usrid = user?.userId;
    this.fsno = user?.financialPeriodsFsno;
    this.locId = user?.locId;
    this.bykeys();
  }
  updateTableConfiguration() {
    const hiddenColumns = [6, 7, 8];
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

  edit() {
    //  this.hotRegisterer.getInstance(this.hotid).updateSettings({ readOnly: false });
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
    };

    this.depreciationJV.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.depreciationJV);
    // this.f.paymentVoucherVoucherNo.clearValidators();
    this.DJVForm.enable();
    this.DJVForm.controls.journalVoucherVno.disable();
    this.updateTableConfiguration();
    this.DJVForm.updateValueAndValidity();
  }

  initializeControls() {
    this.accountapi.GetPaymentDropdown().subscribe((m) => {
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

      //cost
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));

      //account
      this.accountArray = m.resultSet.masterAccountsTables;
      this.accountList = m.resultSet.masterAccountsTables?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
    });
    const hiddenColumns = [3, 4, 6, 7, 8];
    this.depreciationJV = this.utilityService.getTableConfig(
      ColumnList(this),
      hiddenColumns
    );

    this.depreciationJV.afterSelection = (
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

      if (column === 0 && this.depreciationJV.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.depreciationJV.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 4 && this.depreciationJV.readOnly === false) {
        this.lookupGridColumns = ['Cost Center', 'Cost Center ID'];
        this.dataList = this.costSetLookup;
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

    this.depreciationJV.beforeChange = (change: Handsontable.CellChange[]) => {
      // setting if prevent scrolling after selection
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.depreciationJV.beforeChangeRender = (change, source) => {
      const [rowIndex, colName, , newValue] = change[0];
      this.ColumnSum(rowIndex, colName, newValue);
    };
    this.depreciationJV.afterRemoveRow = (index: number, amount: number) => {
      this.ColumnSum(index, '', amount);
    };

    this.depreciationJV.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  showMaximizableDialog() {
    this.getAllJournalVoucher();
    this.displayMaximizable = true;
  }

  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
  }

  getAllJournalVoucher() {
    this.accountapi.GetDJVoucher().subscribe((data: any) => {
      this.journalVoucherarry = data.result.map((j) => {
        j.accName = this.getAccountName(j.journalVoucherAcNo);
        j.currName = this.getCurrency(j.journalVoucherCurrencyId);
        return j;
      });
      // console.log(data.result);
    });
  }

  GetSavedDepJournalVoucherDetails(id: string, item?: any) {
    this.index = 0;
    // this.journalVoucher = item?.journalVoucher
    // this?.journalVoucherDetails = item??.journalVoucherDetails;
    // this.accountapi.GetJVTRacking(id)
    this.accountapi.GetSavedDJVoucherDetails(id).subscribe(
      (data) => {
        this.accountTransactionList = data.result.accountsTransactions;
        this.savedJournalVoucher = data.result;
        this.journalVoucher = data.result;
        this.updateFormGrid(data.result);
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

  ColumnSum(rowIndex: number, colName: any, newValue: any) {
    var value1 = 0;
    var value = 0;
    this.depreciationJV.data.forEach((elemt: any, index: number) => {
      if (elemt && rowIndex === index) {
        if (colName === 'debit') {
          if (elemt.debit && elemt.debit > 0) {
            elemt.credit = 0;
          }
        } else if (colName === 'credit') {
          if (elemt.credit && elemt.credit > 0) {
            elemt.debit = 0;
          }
        }
      }
      if (elemt.credit > 0) {
        value += elemt.credit;
        value = parseFloat(value.toFixed(2));
      }
      if (elemt.debit > 0) {
        value1 += elemt.debit;
        value1 = parseFloat(value1.toFixed(2));
      }
    });
    this.DJVForm.controls.journalVoucherDrAmount.setValue(value1);
    this.DJVForm.controls.journalVoucherCrAmount.setValue(value);

    this.difference = value1 - value;
    this.difference = parseFloat(this.difference.toFixed(2));
  }

  public getAccountName(acctnumber: string): string {
    return this.accountList?.find((j) => j.value === acctnumber?.trim())?.label;
  }

  patchAODetailsValues(account, debit, credit, jobname, costcenter, narration) {
    return this.fb.group({
      account: [account],
      debit: [debit],
      credit: [credit],
      jobname: [jobname],
      costcenter: [costcenter],
      narration: [narration],
    });
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
      joblabel: kl.label,
      jobId: kl.value,
    }));
  }

  public get IsValidGrid(): boolean {
    if (this.depreciationJV.data.length > 0) {
      // this.depreciationJV..data.forEach((value: GridData, index, arry) => {
      // console.log(Object.values(this.depreciationJV.data));
      return Object.values(this.depreciationJV.data).some(
        (k: GridData) => k.account != null && k.vat != null
      );
      // });
    }
    return false;
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  selectaccount(evt) {
    if (evt.jobId) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, evt.joblabel);

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 7, evt.jobId);
    } else if (evt.costcenter) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 4, evt.costcenter);

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 8, evt.costcenterId);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
    }
    this.showAccountLookUp = false;
  }

  saveDepJournalVoucher() {
    if (this.difference == 0) {
      const savedData: any =
        this.depreciationJV.data?.filter((k) => k.hasOwnProperty('account')) ||
        [];
      this.DJVForm.controls['journalVoucherDrAmount'].setValue(
        parseFloat(this.f.journalVoucherDrAmount.value)
      );
      const journalVoucher_Save: JournalVoucher = this.DJVForm
        .value as JournalVoucher;
      journalVoucher_Save.journalVoucherVrefNo =
        this.DJVForm.getRawValue().journalVoucherVno;
      journalVoucher_Save.journalVoucherId =
        this.DJVForm.value.journalVoucherId > 0
          ? this.DJVForm.value.journalVoucherId
          : 0;
      journalVoucher_Save.journalVoucherCrAmount =
        this.DJVForm.value.journalVoucherCrAmount;
      journalVoucher_Save.journalVoucherFcCrAmount =
        this.DJVForm.value.journalVoucherCrAmount;
      journalVoucher_Save.journalVoucherDrAmount =
        this.DJVForm.value.journalVoucherDrAmount;
      journalVoucher_Save.journalVoucherFcDrAmount =
        this.DJVForm.value.journalVoucherDrAmount;
      journalVoucher_Save.journalVoucherDepreciationTo =
        this.DJVForm.value.journalVoucherDepreciationTo;
      journalVoucher_Save.journalVoucherDepreciationFrom =
        this.DJVForm.value.journalVoucherDepreciationFrom;
      journalVoucher_Save.journalVoucherFsno = this.fsno;
      journalVoucher_Save.journalVoucherUserId = this.usrid;
      journalVoucher_Save.journalVoucherLocationId = this.locId;
      journalVoucher_Save.journalVoucherAllocId = '';
      (journalVoucher_Save.journalVoucherVoucherType = 'DEPJV'),
        (journalVoucher_Save.accountsTransactions = []);

      journalVoucher_Save.journalVoucherDetails = savedData
        ?.filter(
          (k) => k.account != null && k.debit != null && k.credit != null
        )
        .map((k: GridData) => {
          return {
            journalVoucherDetailsId: k.id != null ? k.id : 0,
            journalVoucherDetailsVno:
              this.DJVForm.getRawValue().journalVoucherVno,
            // journalVoucherId: 0,
            journalVoucherDetailsAccNo: this.accountArray?.find(
              (x) => x.maAccName?.trim() === k.account?.trim()
            ).maAccNo,
            journalVoucherDetailsVatableAmount: k.vat,
            journalVoucherDetailsDrAmount: k.debit,
            journalVoucherDetailsFcDrAmount: k.debit,
            journalVoucherDetailsCrAmount: k.credit,
            journalVoucherDetailsFcCrAmount: k.credit,
            journalVoucherDetailsJobId: k.jobid,
            journalVoucherDetailsCostCenterId: k.costcenterId,
            journalVoucherDetailsNarration: k.narration,
            journalVoucherDetailsReferenceNo: k.refno,
            journalVoucherDetailsFsno: this.fsno,
            journalVoucherDetailsLocationId: this.locId,
            journalVoucherDetailsDelStatus: false,
          };
        });

      journalVoucher_Save?.journalVoucherDetails
        ?.filter((x) => x?.journalVoucherDetailsDelStatus === false)
        .forEach((element) => {
          const debitData: AccountsTransactions = {
            accountsTransactionsAccNo: element?.journalVoucherDetailsAccNo,
            accountsTransactionsTransDate: this.f.journalVoucherDate.value,
            accountsTransactionsParticulars:
              element?.journalVoucherDetailsNarration,
            accountsTransactionsDebit: Number(
              element?.journalVoucherDetailsDrAmount
            ),
            accountsTransactionsFcDebit: element?.journalVoucherDetailsDrAmount,
            accountsTransactionsVoucherType: null,
            accountsTransactionsCredit: element?.journalVoucherDetailsCrAmount
              ? element.journalVoucherDetailsCrAmount
              : 0,
            accountsTransactionsFcCredit:
              element?.journalVoucherDetailsCrAmount,
            accountsTransactionsTstamp: new Date(),
            accountsTransactionsVoucherNo: element?.journalVoucherDetailsVno,
            accountsTransactionsDescription:
              element?.journalVoucherDetailsNarration,
            accountsTransactionsStatus: null,
            accountsTransactionsUserId: this.usrid,
            accountsTransactionsFsno: this.fsno,
            accountstransactionsDelStatus: false,
          };
          journalVoucher_Save.accountsTransactions.push(debitData);
        });

      if (this.btnFlag.save) {
        this.saveVoucher(journalVoucher_Save);
      } else {
        this.updateVoucher(journalVoucher_Save);
      }
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Alert',
        detail: 'Credit $ Debit must be 0',
      });
      return;
    }
  }

  saveVoucher(journalVoucher_Save: JournalVoucher) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to save ?'),
      accept: () => {
        this.accountapi.InsertDJVoucher(journalVoucher_Save).subscribe(
          (response: any) => {
            this.updateFormGrid(response.result);
            this.userTrackingLog('Insert');
            this.journalVoucher = response.result;
            if (response) {
              // this?.journalVoucherDetails= response.result.j
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: this.translate.instant(response.message),
              });
            } else if (response.error) {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: response.message,
              });

              // this.messageService.add({
              //   severity: 'error', summary: 'Alert',
              //   detail: (response.message != null && response.message??.trim() !== '' ? response.message : response.exception)
              // });
            }
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Save Failed',
            });
          }
        );
      },
    });
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 9) {
      return Math.max(0, 9 - salesVoucherDetailsLength);
    } else {
      return;
    }
  }

  updateFormGrid(journalvoucher_update: JournalVoucher) {
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
    };
    this.DJVForm.patchValue({
      journalVoucherId: journalvoucher_update.journalVoucherId,
      journalVoucherVno: journalvoucher_update.journalVoucherVrefNo,
      journalVoucherDate: new Date(journalvoucher_update.journalVoucherDate),
      journalVoucherRefNo: journalvoucher_update.journalVoucherRefNo,
      journalVoucherCrAmount: journalvoucher_update.journalVoucherCrAmount,
      journalVoucherFcCrAmount: journalvoucher_update.journalVoucherCrAmount,
      journalVoucherDrAmount: journalvoucher_update.journalVoucherDrAmount,
      journalVoucherFcDrAmount: journalvoucher_update.journalVoucherDrAmount,
      journalVoucherNarration: journalvoucher_update.journalVoucherNarration,
      journalVoucherCurrencyId: journalvoucher_update.journalVoucherCurrencyId,
      journalVoucherDepreciationFrom: new Date(
        journalvoucher_update.journalVoucherDepreciationFrom
      ),
      journalVoucherDepreciationTo: new Date(
        journalvoucher_update.journalVoucherDepreciationTo
      ),
    });

    const gridData = journalvoucher_update?.journalVoucherDetails.map((k) => {
      const accountId: string =
        k?.journalVoucherDetailsAccNo != null
          ? this.accountArray?.find((l) =>
              l.maAccNo.match(k?.journalVoucherDetailsAccNo)
            )?.maAccName
          : null;

      const jobId: string =
        k?.journalVoucherDetailsJobId != null
          ? this.jobList?.find((l) => l.value == k.journalVoucherDetailsJobId)
              ?.label
          : null;
      const costCenterId: string =
        k?.journalVoucherDetailsCostCenterId != null
          ? this.costcenterList?.find(
              (l) => l?.value == k.journalVoucherDetailsCostCenterId
            )?.label
          : null;

      return {
        account: accountId,
        vat: k?.journalVoucherDetailsVatableAmount,
        debit: k?.journalVoucherDetailsDrAmount,
        credit: k?.journalVoucherDetailsCrAmount,
        jobname: jobId,
        costcenter: costCenterId,
        narration: k?.journalVoucherDetailsNarration,
        refno: k?.journalVoucherDetailsReferenceNo,
        id: k?.journalVoucherDetailsId,
        jobid: k?.journalVoucherDetailsJobId,
        costcenterId: k?.journalVoucherDetailsCostCenterId,
      };
    });
    this.depreciationJV.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.difference = 0;
    this.DJVForm.disable();
    this.f.journalVoucherVrefNo.clearValidators();
    this.DJVForm.updateValueAndValidity();
  }

  updateVoucher(journalVoucher_Save: JournalVoucher) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to save ?'),
      accept: () => {
        this.accountapi.UpdateDJVoucher(journalVoucher_Save).subscribe(
          (response: ApiResponse<any>) => {
            if (response.valid) {
              this.journalVoucher = response.result;

              this.updateFormGrid(response.result);
              this.userTrackingLog('Update');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: this.translate.instant(response.message),
              });
            } else if (response.error) {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: response.message,
              });
            }
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Save Failed',
            });
          }
        );
      },
    });
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Delete ?'),
      accept: () => {
        this.accountapi.DeleteDJVoucher(this.journalVoucher).subscribe(
          (response: any) => {
            if (response.valid) {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.userTrackingLog('Delete');
              this.new();
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: response.message,
              });
            } else if (response.error) {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: response.message,
              });
            }
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Deletion Failed',
            });
          }
        );
      },
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
            this.DefCurrency = splitText[1]?.trim();
            this.f.journalVoucherCurrencyId.setValue(Number(this.DefCurrency));
          }
        }
      });
  }

  new() {
    this.DJVForm.reset();
    this.DJVForm.enable();
    this.depreciationJV.data = [];
    this.depreciationJV.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.depreciationJV);

    this.accountTransactionList = [];
    // this.DJVForm.get('journalVoucherId').setValue(null);
    this.DJVForm.get('journalVoucherCurrencyId').setValue(-1);
    this.DJVForm.get('journalVoucherDate').setValue(new Date());
    this.DJVForm.get('journalVoucherDepreciationTo').setValue(new Date());
    this.DJVForm.get('journalVoucherDepreciationFrom').setValue(new Date());
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    //this.getDefaultCurrency();
    this.GetDefaultSettings();
    this.updateTableConfiguration();
  }

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
          this.f.journalVoucherCurrencyId.setValue(Number(this.DefCurrency));
        }
      }
    });
  }
  cancel() {
    this.new();
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

  get costSetLookup() {
    return this.costcenterArray.map((kl) => ({
      costcenter: kl.costCenterMasterCostCenterName,
      costcenterId: kl.costCenterMasterCostCenterId,
    }));
  }

  get f() {
    return this.DJVForm.controls;
  }

  date() {
    return new Date();
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
    margin-top: 35px;
    padding-bottom: 40px;
    padding: 8px;
  }
  .payment2 {
    width: 45%;
    margin-bottom: 5px;
    border-radius: 1px;
    margin-top: 38px;
    padding-bottom: 40px;
    padding-left: 8px;
    margin-left: 10px;

  }
  .main1{
    font-size:20px;
    margin-left:0%;
 padding-left:0%;
  }
  .center{
    text-align: center;
  }
  .inputGroup {
    margin: 4px 0;
  }

  .w-100 {
    width: 100%;
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
    margin-right: -50px; /* Adjust as needed */
  }
  .date {
    display: flex;
    align-items: center;
    padding-left: -5%;

  }

  .date b {
    margin-right: -25px; /* Adjust as needed */
  }
  .inflex{
     display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
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

@page {
margin: 20mm
}
.page-footer {
  // position: fixed;
  bottom: 0;
  width: 100%;
  visibility: visible;
  border-top: 1px solid black;
}
.space{
  margin-left: 3px;
  margin-right: 30px;;
  }
.space1{
  margin-left: 76px;
  margin-right: 30px;
}

    `;
    this.printService.PrintPDF('contentToConvert', css);
    this.userTrackingLog('PDF');
  }
  getCD() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.companyDetails = response[0];
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'Depreciation Journal Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.DJVForm.get('journalVoucherVno').value,
      vpType: 'Depreciation Journal Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }
}

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
  jobid?: number;
  costcenterId?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const ColumnList = (component: DepreciationJournalVoucherComponent) => [
  {
    data: 'account',
    type: 'autocomplete',
    label: 'Account',
    toolTip: 'Account',
    source: component.acctArry,
    editor: false,
    width: 100,
  },
  {
    data: 'debit',
    type: 'numeric',
    label: 'Debit',
    toolTip: 'Debit Amount',
    numericFormat: {
      pattern: '0,0.00',
    },
    readOnly: false,
    width: 100,
  },
  {
    data: 'credit',
    type: 'numeric',
    label: 'Credit',
    readOnly: false,
    toolTip: 'Credit Amount',
    numericFormat: {
      pattern: '0,0.00',
    },
    width: 100,
  },
  {
    data: 'jobname',
    type: 'autocomplete',
    label: 'Job Name',
    toolTip: 'Job Name',
    source: component.jobArry,
    width: 180,
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
    toolTip: 'Narration',
    width: 180,
    readOnly: false,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
    toolTip: 'Record ID',
    width: 0,
  },
  {
    data: 'jobid',
    type: 'numeric',
    label: 'Job ID',
    toolTip: 'Job Identifier',
    width: 0,
    readOnly: false,
  },
  {
    data: 'costcenterId',
    type: 'numeric',
    label: 'Cost Center ID',
    toolTip: 'Cost Center Identifier',
    width: 0,
    readOnly: false,
  },
];
