import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  MessageService,
  ConfirmationService,
  MenuItem,
  SelectItem,
} from 'primeng';
import { ChartofAccounts } from 'src/app/routes/domain';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { JournalVoucher } from 'src/app/routes/domain/Accounts/JournalVoucher';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { LoginService } from 'src/app/routes/service/login.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import Swal from 'sweetalert2';
import { JournalVoucherDetails } from 'src/app/routes/domain/Accounts/JournalVoucherDetails';
import { defaults } from 'src/app/shared/service/settings';
import { CredentialKeys } from 'src/app/routes/Enums/loginInfo';
import { style } from '@angular/animations';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-journal-voucher',
  templateUrl: './journal-voucher.component.html',
  styleUrls: ['./journal-voucher.component.scss'],
})
export class JournalVoucherComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  JournalVoucherFilterForm: FormGroup;

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;
  callDDLs: boolean = false;
  DefAcc: string;
  DefAccCheck: string;

  usrid: number;
  fsno: number;
  locId: number;

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

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  journalVoucherarry: JournalVoucher[] = [];
  // savedJournalVoucherGridData: GridData[] = [];
  savedJournalVoucher: JournalVoucher;
  displayPrintPreview: boolean = false;
  companyDetails: StationMaster;
  journalVoucher: any;
  journalVoucherDetails: any[] = [];

  private hotRegisterer = new HotTableRegisterer();
  hotid = 'journalvoucher_HotEntry';
  journalvoucher_entry: Handsontable.GridSettings;
  journalVoucherFormGroup: FormGroup;
  journalvoucher_entryDataset = [];
  difference: number = null;
  cols: any;
  jvTemplateSelected: boolean = false;
  vNo: string = '';
  ScreenId: number;
  Permission: any;
  filterArray: any;
  user: any;
  stationmasterObj: StationMaster;
  JOBCOST: boolean = true;
  itemList = [];
  clickedRowColumn = { row: -1, column: -1 };
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,

    private loginser: LoginService,
    private storage: LocalStorageService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private utilityService: UtilityService,
    private printService: FileSaverService,
    private permission: PermissionsService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.companyDetails = this.permission.getStation();
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
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
    //console.log('this.Permission', this.Permission);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedJournalVoucherDetails(this.vNo);
    }
    this.journalVoucherFormGroup = this.fb.group({
      journalVoucherId: [0],
      journalVoucherVno: [{ value: null, disabled: true }],
      journalVoucherDate: [null],
      journalVoucherRefNo: [''],
      journalVoucherCrAmount: [null],
      journalVoucherDrAmount: [null],
      journalVoucherNarration: ['', Validators.required],
      journalVoucherCurrencyId: [-1],
    });
    this.JournalVoucherFilterForm = this.fb.group({
      journalVoucherNarration: [null],
      isDate: [],
      journalVoucherNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.cols = [
      { field: 'journalVoucherVrefNo', header: 'Voucher No' },
      { field: 'journalVoucherDate', header: 'Date' },
      // { field: 'journalVoucherAcNo', header: 'Account' },
      { field: 'journalVoucherCurrencyId', header: 'Currency' },
      { field: 'journalVoucherDrAmount', header: 'Vchr.Debit' },
      { field: 'journalVoucherCrAmount', header: 'Vchr.Credit' },
      { field: 'journalVoucherNarration', header: 'Narration' },
      { field: 'action', header: 'Action' },
      // { field: 'journalVoucherDrAmount', header: 'Dtls.Debit' },
      // { field: 'purchaseReturnNetAmount', header: 'Dtls.Credit' }
    ];
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data?.subscribe((data) => {
      this.title = data?.title;
    });
    this.journalVoucherFormGroup.disable();
    this.storage.get(CredentialKeys.Login);
    var user = this.loginser.GetCredentialData();
    this.usrid = user?.userId;
    this.fsno = user?.financialPeriodsFsno;
    this.locId = user?.locId;

    this.initializeControls();
    this.bykeys();
  }

  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail,Hide_CostCenter_Detail')
      .subscribe((res: any) => {
        console.log(' res = ', res);
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
  handleChange(e) {
    this.index = e.index;
  }

  initializeControls() {
    this.journalvoucher_entry = this.utilityService.getTableConfig(
      paymentVoucherColumnList(this),
      [3, 4, 6, 7]
    );
    this.journalvoucher_entry.afterSelection = (
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

      if (column === 0 && this.journalvoucher_entry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        hotInstance.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.journalvoucher_entry.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 4 && this.journalvoucher_entry.readOnly === false) {
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

    this.journalvoucher_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.journalvoucher_entry.beforeChangeRender = (change, source) => {
      const [rowIndex, colName, newValue] = change[0]; // Destructure the change array
      this.ColumnSum();
    };

    this.journalvoucher_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.itemList.splice(index, amount);
      this.ColumnSum();
    };

    this.journalvoucher_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
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

    this.journalvoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.journalvoucher_entry);
    // this.f.paymentVoucherVoucherNo.clearValidators();
    this.journalVoucherFormGroup.enable();
    this.journalVoucherFormGroup.controls.journalVoucherVno.disable();

    this.journalVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  cancel() {
    this.jvTemplateSelected = false;
    this.journalVoucherFormGroup.reset();
    this.journalvoucher_entry.data = [];
    this.journalvoucher_entryDataset = [];
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.journalvoucher_entry);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
  }

  callDropdowns() {
    if (!this.callDDLs) {
      this.LoadJobDDL();
      this.LoadCurruncyDDL();
      this.LoadCostCenterDDL();
      this.LoadChartOfAccountDDL();
      this.GetDefaultSettings();

      this.callDDLs = true;
    }
  }

  GetSavedJournalVoucherDetails(id: string, item?: any) {
    this.index = 0;
    this.callDropdowns();
    this.accountapi.GetSavedJournalVoucherDetails(id).subscribe(
      (data) => {
        if (this.jvTemplateSelected) {
          this.new();
        } else {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.journalVoucherFormGroup.disable;
        }
        this.accountTransactionList = data?.result.accountsTransactions;
        this.savedJournalVoucher = data?.result;
        this.updateFormGrid(data?.result);
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
  LoadCurruncyDDL() {
    this.accountapi.LoadDropdowCurrencyMaster().subscribe((m) => {
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
        value1: kl.currencyMasterCurrencyRate,
      }));
      this.currencyList.unshift({ label: '--Select--', value: -1 });
    });
  }

  LoadJobDDL() {
    this.accountapi.LoadDropdowjobMasters().subscribe((m) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select--', value: -1 });
    });
  }

  LoadCostCenterDDL() {
    this.accountapi.LoadDropdowncostcenterMasters().subscribe((m) => {
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterList?.unshift({ label: '--Select--', value: -1 });
    });
  }

  LoadChartOfAccountDDL() {
    this.accountapi.LoadDropdowchartofAccounts().subscribe((m) => {
      this.accountArray = m.resultSet.masterAccountsTables;
      this.accountList = m.resultSet.masterAccountsTables?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
    });
  }
  new() {
    this.itemList = [];
    this.callDropdowns();
    this.journalVoucherFormGroup.reset();
    this.journalvoucher_entry.data = [];
    this.journalvoucher_entryDataset = [];
    this.journalvoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.journalvoucher_entry);

    this.accountTransactionList = [];
    // this.journalVoucherFormGroup.get('journalVoucherId').setValue(null);
    this.journalVoucherFormGroup.get('journalVoucherCurrencyId').setValue(-1);
    this.journalVoucherFormGroup.get('journalVoucherDate').setValue(new Date());
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.journalVoucherFormGroup.enable();
    this.updateTableConfiguration();
    this.GetDefaultSettings();
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
      //hide job
      // var HIDE_JOBCOST = list?.filter(
      //   (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      // );
      // if (HIDE_JOBCOST !== null) {
      //   var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      //   if (jobcal == true) {
      //     this.JOBCOST = false;
      //     this.updateTableConfiguration();
      //   }
      // }
      if (this.hideJobDetail) {
        this.updateTableConfiguration();
      }
    });
  }
  updateTableConfiguration() {
    const hiddenColumns = [6, 7];
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

  initializeHandsontable(columns, colHeaders) {
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      columns: columns,
      colHeaders: colHeaders,
    });
  }
  showMaximizableDialog() {
    this.getAllJournalVoucher();

    this.displayMaximizable = true;
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to delete voucher?'),
      accept: () => {
        this.accountapi
          .DeleteJournalVoucher(this.savedJournalVoucher)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: this.translate.instant('Voucher Deleted Succesfully'),
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

  getCD() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.companyDetails = response[0];
    });
  }

  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
  }

  get f() {
    return this.journalVoucherFormGroup.controls;
  }

  ColumnSum() {
    var value1 = 0;
    var value = 0;
    this.journalvoucher_entryDataset?.forEach((elemt: any) => {
      if (elemt.credit > 0) {
        value += elemt.credit;
        value = parseFloat(value.toFixed(2));
      }
      if (elemt.debit > 0) {
        value1 += elemt.debit;
        value1 = parseFloat(value1.toFixed(2));
      }
    });

    this.journalVoucherFormGroup.controls.journalVoucherCrAmount.setValue(
      value
    );
    this.journalVoucherFormGroup.controls.journalVoucherDrAmount.setValue(
      value1
    );
    this.difference = value1 - value;
    this.difference = parseFloat(this.difference.toFixed(2));
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

  public get IsValidGrid(): boolean {
    if (this.journalvoucher_entry.data?.length > 0) {
      return Object.values(this.journalvoucher_entry.data).some(
        (k: GridData) => k.account != null
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
      const hot = this.hotRegisterer.getInstance(this.hotid);
      hot.setDataAtCell(evt.cell.row, evt.cell.column, null);
      if (evt.cell.column === 0) {
        hot.setSourceDataAtCell(
          hot.toPhysicalRow(evt.cell.row),
          'accountNo',
          null
        );
        this.itemList[evt.cell.row] = null;
      }
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
      account: kl.costCenterMasterCostCenterName,
      accountId: kl.costCenterMasterCostCenterId,
    }));
  }

  saveJournalVoucher() {
    this.journalVoucherFormGroup.markAllAsTouched();
    if (this.difference == 0) {
      const savedData: any =
        this.journalvoucher_entryDataset?.filter((k) =>
          k.hasOwnProperty('account')
        ) || [];
      this.journalVoucherFormGroup.controls['journalVoucherDrAmount'].setValue(
        parseFloat(this.f.journalVoucherDrAmount.value)
      );
      const journalVoucher_Save: JournalVoucher = this.journalVoucherFormGroup
        .value as JournalVoucher;
      journalVoucher_Save.journalVoucherVrefNo =
        this.journalVoucherFormGroup.getRawValue().journalVoucherVno;
      journalVoucher_Save.journalVoucherId = Number(
        this.journalVoucherFormGroup.value.journalVoucherId
      );
      journalVoucher_Save.journalVoucherCrAmount =
        this.journalVoucherFormGroup.value.journalVoucherCrAmount;
      journalVoucher_Save.journalVoucherFcCrAmount =
        this.journalVoucherFormGroup.value.journalVoucherCrAmount;
      journalVoucher_Save.journalVoucherDrAmount =
        this.journalVoucherFormGroup.value.journalVoucherDrAmount;
      journalVoucher_Save.journalVoucherFcDrAmount =
        this.journalVoucherFormGroup.value.journalVoucherDrAmount;
      journalVoucher_Save.journalVoucherFsno = this.fsno;
      journalVoucher_Save.journalVoucherUserId = this.usrid;
      journalVoucher_Save.journalVoucherLocationId = this.locId;
      journalVoucher_Save.journalVoucherAllocId = '';
      journalVoucher_Save.accountsTransactions = [];
      journalVoucher_Save.journalVoucherDetails = savedData
        ?.filter((k) => k.account != null)
        .map((k: GridData) => {
          return {
            journalVoucherDetailsId: 0,
            JournalVoucherDetailVrefNo: this.jvTemplateSelected
              ? ''
              : this.journalVoucherFormGroup.getRawValue().journalVoucherVno,
            journalVoucherId: this.jvTemplateSelected
              ? 0
              : Number(this.journalVoucherFormGroup.value.journalVoucherId),
            journalVoucherDetailsAccNo: this.resolveRowAccountNo(k),
            journalVoucherDetailsVatableAmount: k.vat,
            journalVoucherDetailsDrAmount: k.debit ? k.debit : 0,
            journalVoucherDetailsFcDrAmount: k.debit ? k.debit : 0,
            journalVoucherDetailsCrAmount: k.credit ? k.credit : 0,
            journalVoucherDetailsFcCrAmount: k.credit ? k.credit : 0,
            journalVoucherDetailsJobId:
              k.jobname != null && k.jobname !== ''
                ? this.jobList?.find(
                  (j) => j.label?.trim() === k.jobname?.trim()
                ).value
                : -1,
            journalVoucherDetailsCostCenterId:
              k.costcenter != null && k.costcenter !== ''
                ? this.costcenterArray?.find(
                  (j) =>
                    j.costCenterMasterCostCenterName?.trim() ===
                    k.costcenter?.trim()
                ).costCenterMasterCostCenterId
                : null,
            journalVoucherDetailsNarration: k.narration,
            journalVoucherDetailsReferenceNo: k.refno,
            journalVoucherDetailsFsno: this.fsno,
            journalVoucherDetailsLocationId: this.locId,
            journalVoucherDetailsDelStatus: k.isdeleted,
          };
        });

      journalVoucher_Save.journalVoucherDetails
        ?.filter(
          (x) =>
            x.journalVoucherDetailsDelStatus === false ||
            x.journalVoucherDetailsDelStatus == undefined
        )
        .forEach((element) => {
          const debitData: AccountsTransactions = {
            accountsTransactionsAccNo: element.journalVoucherDetailsAccNo,
            accountsTransactionsTransDate: this.f.journalVoucherDate.value,
            accountsTransactionsParticulars:
              element.journalVoucherDetailsNarration,
            accountsTransactionsDebit: element.journalVoucherDetailsDrAmount
              ? element.journalVoucherDetailsDrAmount
              : 0,
            accountsTransactionsCredit: element.journalVoucherDetailsCrAmount
              ? element.journalVoucherDetailsCrAmount
              : 0,
            accountsTransactionsFcDebit: element.journalVoucherDetailsDrAmount,
            accountsTransactionsFcCredit: element.journalVoucherDetailsCrAmount,
            accountsTransactionsVoucherType: null,
            accountsTransactionsJobNo: element.journalVoucherDetailsJobId,
            accountsTransactionsTstamp: new Date(),
            accountsTransactionsVoucherNo: element?.JournalVoucherDetailVrefNo,
            accountsTransactionsDescription:
              element.journalVoucherDetailsNarration,
            accountsTransactionsStatus: null,
            accountsTransactionsUserId: this.usrid,
            accountsTransactionsFsno: this.fsno,
            accountstransactionsDelStatus: false,
            accountsTransactionsCostCenterId:
              element.journalVoucherDetailsCostCenterId,
            accountsTransactionsAllocBalance:
              element.journalVoucherDetailsDrAmount
                ? element.journalVoucherDetailsDrAmount
                : element.journalVoucherDetailsCrAmount,
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
        detail: 'Credit - Debit must be 0',
      });
      return;
    }
  }

  jvTemplate() {
    this.jvTemplateSelected = true;
    this.showMaximizableDialog();
  }

  saveVoucher(journalVoucher_Save: JournalVoucher) {
    if (this.journalVoucherFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to Save Journal voucher?'),
        accept: () => {
          this.accountapi.InsertJournalVoucher(journalVoucher_Save).subscribe(
            (data: any) => {
              if (data?.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.jvTemplateSelected = false;

                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Journal Voucher Updated Succesfully',
                });

                this.updateFormGrid(data?.result);
                this.userTrackingLog('Insert');
              } else {
                const errorMsg =
                  data?.errorMessage ||
                  data?.message ||
                  data?.exception ||
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
                detail: this.translate.instant('Journal Voucher Update Failed'),
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.journalVoucherFormGroup.markAllAsTouched();
      this.journalVoucherFormGroup.markAsDirty();
    }
  }

  updateVoucher(journalVoucher_Save: JournalVoucher) {
    if (this.journalVoucherFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to update existing voucher?'
        ),
        accept: () => {
          this.accountapi.UpdateJournalVoucher(journalVoucher_Save).subscribe(
            (data: any) => {
              if (data?.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.updateFormGrid(data?.result);
                this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Journal Voucher Updated Succesfully',
                });
              } else {
                const errorMsg =
                  data?.errorMessage ||
                  data?.message ||
                  data?.exception ||
                  'An error occurred';
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('Alert'),
                  detail: errorMsg,
                });
              }
              // (err) => {
              //   this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Journal Voucher Update Failed' });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Journal Voucher Update Failed'),
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
      this.journalVoucherFormGroup.markAllAsTouched();
      this.journalVoucherFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data?.result;
    });
  }

  getAllJournalVoucher() {
    this.callDropdowns();
    this.accountapi.GetJournalVoucher().subscribe((data: any) => {
      this.journalVoucherarry = data?.result;
      this.filterArray = data?.result;
    });
  }

  /**
   * Duplicate-account check based on the live grid rows (not a separate array),
   * so it stays accurate after row deletion, clearing a cell, loading a voucher, or Excel import.
   */
  private isAccountUsedInOtherRow(accountNo: string, visualRow: number): boolean {
    const hot = this.hotRegisterer.getInstance(this.hotid);
    const currentRow = hot ? hot.toPhysicalRow(visualRow) : visualRow;
    const target = accountNo?.trim();
    const rows: GridData[] =
      this.journalvoucher_entryDataset?.length > 0
        ? this.journalvoucher_entryDataset
        : this.journalvoucher_entry?.data || [];
    return rows.some((r: GridData, i: number) => {
      if (i === currentRow || !r || !r.account || r.isdeleted) {
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

  /**
   * Resolves the account number for a grid row.
   * Prefers the account number captured when the account was picked or imported (row.accountNo),
   * as long as the row still shows that account's name. Falls back to the original
   * name-based lookup otherwise.
   */
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
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  updateFormGrid(journalvoucher_update: JournalVoucher) {
    //this.getCD();
    this.journalVoucherFormGroup.patchValue({
      journalVoucherId: this.jvTemplateSelected
        ? 0
        : journalvoucher_update.journalVoucherId,
      journalVoucherVno: this.jvTemplateSelected
        ? null
        : journalvoucher_update.journalVoucherVrefNo,
      journalVoucherDate: this.jvTemplateSelected
        ? new Date()
        : new Date(journalvoucher_update.journalVoucherDate),
      journalVoucherRefNo: journalvoucher_update.journalVoucherRefNo,
      journalVoucherCrAmount: journalvoucher_update.journalVoucherCrAmount,
      journalVoucherFcCrAmount: journalvoucher_update.journalVoucherCrAmount,
      journalVoucherDrAmount: journalvoucher_update.journalVoucherDrAmount,
      journalVoucherFcDrAmount: journalvoucher_update.journalVoucherDrAmount,
      journalVoucherNarration: journalvoucher_update.journalVoucherNarration,
      journalVoucherCurrencyId: journalvoucher_update.journalVoucherCurrencyId,
    });
    this.accountTransactionList = journalvoucher_update.accountsTransactions;
    const gridData: GridData[] =
      journalvoucher_update.journalVoucherDetails.map((k) => {
        const accountId: string =
          k.journalVoucherDetailsAccNo != null
            ? this.accountArray?.find(
              (l) => l.maAccNo?.trim() === k.journalVoucherDetailsAccNo?.trim()
            )?.maAccName
            : null;

        return {
          account: accountId,
          vat: k.journalVoucherDetailsVatableAmount,
          debit: k.journalVoucherDetailsDrAmount,
          credit: k.journalVoucherDetailsCrAmount,
          jobname:
            k.journalVoucherDetailsJobId != null
              ? this.jobList.find(
                (l) => l.value === k.journalVoucherDetailsJobId
              )?.label
              : '',
          costcenter:
            k.journalVoucherDetailsCostCenterId != null
              ? this.costcenterArray?.find(
                (j) =>
                  j.costCenterMasterCostCenterId ===
                  k.journalVoucherDetailsCostCenterId
              ).costCenterMasterCostCenterName
              : null,
          narration: k.journalVoucherDetailsNarration,
          refno: k.journalVoucherDetailsReferenceNo,
          id: this.jvTemplateSelected ? 0 : k.journalVoucherDetailsId,
          accountNo: k.journalVoucherDetailsAccNo,
        };
      });
    this.journalvoucher_entry.data = gridData;
    this.journalvoucher_entryDataset = gridData;
    this.difference = 0;
    this.journalvoucher_entry.readOnly = true;
    this.journalVoucherFormGroup.disable();

    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      data: gridData,
      readOnly: this.jvTemplateSelected ? false : true,
    });
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
  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 9) {
      return Math.max(0, 9 - salesVoucherDetailsLength);
    } else {
      return;
    }
  }

  userTrackingLog(type) {
    let req = {
      page: 'Journal Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.journalVoucherFormGroup.get('journalVoucherVno').value,
      vpType: 'Journal Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }
  filter() {
    let filteredArray = this.filterArray;
    if (this.JournalVoucherFilterForm.value.journalVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.journalVoucherVrefNo ===
          this.JournalVoucherFilterForm.value.journalVoucherNo.toUpperCase()
      );
    }

    if (
      this.JournalVoucherFilterForm.value.journalVoucherNarration != null &&
      this.JournalVoucherFilterForm.value.journalVoucherNarration !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.journalVoucherNarration ===
          this.JournalVoucherFilterForm.value.journalVoucherNarration
      );
    }

    if (this.JournalVoucherFilterForm.value.isDate) {
      const fromDateStr = this.JournalVoucherFilterForm.value.fromDate;
      const toDateStr = this.JournalVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      // filteredArray = filteredArray?.filter((res) => {
      //   const voucherDate = new Date(res.journalVoucherDate);

      //   voucherDate.setHours(0, 0, 0, 0);
      //   fromDate.setHours(0, 0, 0, 0);

      //   return voucherDate.getTime() >= fromDate.getTime() && voucherDate.getTime() <= toDate.getTime() || voucherDate.getTime() === fromDate.getTime();;
      // });

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.journalVoucherDate);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.journalVoucherarry = filteredArray;
    }
    this.journalVoucherarry = filteredArray;
  }
  ClearFilter() {
    this.JournalVoucherFilterForm.reset();
    this.journalVoucherarry = this.filterArray;
    this.JournalVoucherFilterForm.get('fromDate').setValue(new Date());
    this.JournalVoucherFilterForm.get('toDate').setValue(new Date());
  }
  @ViewChild('excelFileInput', { static: false })
  excelFileInput!: ElementRef<HTMLInputElement>;
  triggerExcelImport(): void {
    if (this.journalvoucher_entry?.readOnly) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Notice',
        detail: 'Enable New or Edit mode before importing.',
      });
      return;
    }

    if (!this.callDDLs) {
      this.callDropdowns();
    }

    this.excelFileInput?.nativeElement?.click();
  }

  onExcelImport(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input?.files || input.files.length === 0) {
      return;
    }

    if (this.journalvoucher_entry?.readOnly) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Notice',
        detail: 'Import is not allowed in read-only mode.',
      });
      this.resetExcelInput();
      return;
    }

    const file = input.files[0];
    const fileName = file?.name?.toLowerCase() || '';

    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File',
        detail: 'Please select a valid Excel file (.xlsx or .xls).',
      });
      this.resetExcelInput();
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const binaryString = e.target?.result;
        if (!binaryString) {
          throw new Error('Unable to read the selected file.');
        }

        const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
          type: 'binary',
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('The Excel file does not contain any worksheet.');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: '',
            raw: false,
          }
        );

        if (!rawRows || rawRows.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Empty File',
            detail: 'The selected Excel file is empty.',
          });
          this.resetExcelInput();
          return;
        }

        const importedRows = this.mapExcelRowsToGridData(rawRows);

        if (importedRows.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Data',
            detail: 'No valid rows were found to import.',
          });
          this.resetExcelInput();
          return;
        }

        this.journalvoucher_entryDataset = importedRows;
        this.journalvoucher_entry.data = importedRows;
        this.itemList = importedRows.map((x) => x.accountNo).filter(Boolean);

        const hot = this.hotRegisterer.getInstance(this.hotid);
        if (hot) {
          hot.loadData(importedRows);
          hot.render();
        }

        this.ColumnSum();

        this.messageService.add({
          severity: 'success',
          summary: 'Imported',
          detail: `Accounts imported successfully.`,
        });
      } catch (error: any) {
        this.messageService.add({
          severity: 'error',
          summary: 'Import Failed',
          detail: error?.message || 'Failed to import Excel file.',
        });
      } finally {
        this.resetExcelInput();
      }
    };

    reader.onerror = () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Import Failed',
        detail: 'Unable to read the selected file.',
      });
      this.resetExcelInput();
    };

    reader.readAsBinaryString(file);
  }

  private mapExcelRowsToGridData(rows: Record<string, any>[]): GridData[] {
    const normalizedRows = rows.map((row) => this.normalizeExcelRowKeys(row));

    const requiredColumns = ['accountNo', 'debit', 'credit', 'narration'];
    const firstRowKeys = Object.keys(normalizedRows[0] || {});

    const missingColumns = requiredColumns.filter(
      (column) => !firstRowKeys.includes(column)
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing required column(s): ${missingColumns.join(', ')}`);
    }

    const result: GridData[] = [];
    const duplicateCheck = new Set<string>();

    for (const row of normalizedRows) {
      const rawAccountNo = this.normalizeString(row.accountNo);
      const rawAccountName = this.normalizeString(row.accountName);
      const debit = this.parseExcelNumber(row.debit);
      const credit = this.parseExcelNumber(row.credit);
      const narration = this.normalizeString(row.narration);

      const isCompletelyEmpty =
        !rawAccountNo &&
        !rawAccountName &&
        debit === 0 &&
        credit === 0 &&
        !narration;

      if (isCompletelyEmpty) {
        continue;
      }

      if (!rawAccountNo) {
        throw new Error('Account No is required for every imported row.');
      }

      const matchedAccount = this.accountArray?.find(
        (x) => this.normalizeAccountNumber(x.maAccNo) === this.normalizeAccountNumber(rawAccountNo)
      );

      if (!matchedAccount) {
        throw new Error(`Account not found: ${rawAccountNo}`);
      }

      if (rawAccountName) {
        const importedName = this.normalizeString(rawAccountName).toLowerCase();
        const actualName = this.normalizeString(matchedAccount.maAccName).toLowerCase();

        if (importedName !== actualName) {
          throw new Error(
            `Account name mismatch for account ${rawAccountNo}. Excel has "${rawAccountName}" but system has "${matchedAccount.maAccName}".`
          );
        }
      }

      if (debit < 0 || credit < 0) {
        throw new Error(`Negative values are not allowed for account: ${rawAccountNo}`);
      }

      if (debit > 0 && credit > 0) {
        throw new Error(
          `Both Debit and Credit cannot have value in the same row for account: ${rawAccountNo}`
        );
      }

      if (debit === 0 && credit === 0) {
        throw new Error(
          `Either Debit or Credit must have a value for account: ${rawAccountNo}`
        );
      }

      const duplicateKey = this.normalizeAccountNumber(rawAccountNo);

      if (duplicateCheck.has(duplicateKey)) {
        throw new Error(`Duplicate account found in Excel file: ${rawAccountNo}`);
      }

      duplicateCheck.add(duplicateKey);

      result.push({
        account: matchedAccount.maAccName, // display account name in grid
        accountNo: matchedAccount.maAccNo,
        debit,
        credit,
        narration,
        vat: 0,
        jobname: '',
        costcenter: '',
        refno: '',
        id: 0,
        isdeleted: false,
      });
    }

    return result;
  }

  private normalizeExcelRowKeys(row: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};

    Object.keys(row || {}).forEach((key) => {
      const normalizedKey = key
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');

      switch (normalizedKey) {
        case 'accountno':
        case 'accountnumber':
        case 'accno':
        case 'acno':
        case 'ledgerno':
          normalized.accountNo = row[key];
          break;

        case 'accountname':
        case 'account':
        case 'accname':
        case 'ledgername':
          normalized.accountName = row[key];
          break;

        case 'debit':
        case 'dr':
        case 'dramount':
          normalized.debit = row[key];
          break;

        case 'credit':
        case 'cr':
        case 'cramount':
          normalized.credit = row[key];
          break;

        case 'narration':
        case 'description':
        case 'particulars':
          normalized.narration = row[key];
          break;

        default:
          break;
      }
    });

    return normalized;
  }
  private parseExcelNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const normalizedValue = value.toString().replace(/,/g, '').trim();
    const parsed = Number(normalizedValue);

    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid numeric value found: ${value}`);
    }

    return parseFloat(parsed.toFixed(2));
  }

  private normalizeString(value: any): string {
    return value === null || value === undefined ? '' : value.toString().trim();
  }
  private normalizeAccountNumber(value: any): string {
    const normalized = this.normalizeString(value).replace(/\s+/g, '');
    return normalized.replace(/^0+/, '');
  }

  private resetExcelInput(): void {
    if (this.excelFileInput?.nativeElement) {
      this.excelFileInput.nativeElement.value = '';
    }
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
  isdeleted?: boolean;
  /** UI-only: exact account number picked or imported for this row. */
  accountNo?: string;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const paymentVoucherColumnList = (
  component: JournalVoucherComponent
) => [
    {
      data: 'account',
      type: 'autocomplete',
      label: 'Account',
      toolTip: 'Account',
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
      type: 'text',
      label: 'Job Name',
      toolTip: 'Job Name',
    },
    {
      data: 'costcenter',
      type: 'autocomplete',
      label: 'Cost Center',
      toolTip: 'Cost Center',
      readOnly: false,
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
    {
      data: 'isdeleted',
      type: 'checkbox',
      label: 'Is Deleted',
      toolTip: 'Is Deleted',
      readOnly: false,
      width: 50,
    },
  ];
