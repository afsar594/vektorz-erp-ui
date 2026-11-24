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
import { DebitNote } from 'src/app/routes/domain/Accounts/DebitNote';
import { DebitNoteDetails } from 'src/app/routes/domain/Accounts/DebitNoteDetails';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { timer, Observable } from 'rxjs';
import { LoginService } from 'src/app/routes/service/login.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { ToWords } from 'to-words';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
@Component({
  selector: 'app-debitnote',
  templateUrl: './debitnote.component.html',
  styleUrls: ['./debitnote.component.scss'],
})
export class DebitnoteComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
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
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];
  JOBCOST: boolean = true;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];
  displayPrintPreview: boolean = false;

  DefCurrency: string;
  DefCurCheck: string;
  vNo: string = '';
  DefLocation: string;
  DefLocationCheck: string;

  DefAcc: string;
  DefAccCheck: string;
  usrid: number;
  fsno: number;
  locId: number;
  rptFilter: ReportFilterModel;
  pdfSource: any;
  accountTransactionList: AccountsTransactions[] = [];
  debitNotearry: DebitNote[] = [];
  // savedDebitNoteGridData: GridData[] = [];
  savedDebitNote: DebitNote;
  wordamt: string;
  ScreenId: number;
  Permission: any;
  user: any;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
   private crystalReportService: CrystalReportService,
    private utilityService: UtilityService,
    private printService: FileSaverService,
    private permission: PermissionsService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private loginser: LoginService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'debitnote_HotEntry';
  debitnote_entry: Handsontable.GridSettings;
  debitNoteFormGroup: FormGroup;
  debitnote_entryDataset = [];
  // accountTransactionDataset = [];
  cols;

  getCreditNoteport() {
    const fileName = String(new Date().valueOf());
    var css: string = `
    .contain{
      width: 85%;
      margin-left: 8%;
      margin-bottom:2% ;
      border-radius: 10px;
      margin-top: 1%;
    }
    h1{
      padding-left: 4%;
      padding-top: .5%;
      font-family:"Sans-serif";
      font-size: 1.5rem;
      margin-bottom: 2%;
      color: black;
    }
    h2{
      padding-top: 25px;
      text-align: center;
      margin-top: 1%;
      font-family:"Sans-serif";
      font-size: 1.5rem;
      margin-bottom: 0%;
    }
    h3{
      text-align: center;
     margin-top: 0%;
      font-family:"Sans-serif";
      font-size: 1rem;
    }
    h4{
    margin-top: 5px;
    padding-left: 0%;
    margin-bottom: 0%;
    font-size: 18px;
    }
    h5{
      margin-top: 0%;
    }
    .w60{
    width: 60px;
    }
    .w80{
    width: 130px;
    text-align: left;
    }
    .spacer{
    height: 250px;
    }
    .page-footer {
    position: running(footer);
    bottom: 0%;
    width: 100%;
    visibility: visible;

    }
    .payment1{
      border: 2.5px solid rgb(86, 87, 87);
      width: 85.5%;
      margin-left: 8%;
      margin-bottom: 10px;
      border-radius: 10px;
      margin-top: 1%;
      padding-left:2%;
      font-size: 18px;
       padding-bottom: 25px;
       padding-top: 37px;
    }

    .header {
      display: flex;
      justify-content: space-between;
     margin-right: 35%;
     margin-top: 0px;
    }

    .left {
      font-size: 16px;
      text-align: left;
    }

    .right {
      font-size: 16px;
      text-align: right;

    }
    .rounded-table{
      font-family: Arial, Helvetica, sans-serif;
        border: 2.5px solid rgb(86, 87, 87);
        border-collapse:separate;
         width: 88%;
        margin-left: 8%;
        margin-top: 5px;
        border-radius: 7px;
    }
    #Voucher {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
    }

    #Voucher td, #Voucher th {
      border: 1px solid #cecbcb;
      padding: 8px;

    }

    #Voucher tr:nth-child(even){background-color: #f2f2f2;}

    #Voucher tr:hover {background-color: #ddd;}

    #Voucher th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #dfe4e3;
      color: rgb(0, 0, 0);
      text-align: center;

    }


    .total{
      padding-left: 12%;
      padding-top: 2%;
      font-weight: bold;
    }
    #payment {
      font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
    }

    #payment td, #payment th {
      border: 1px solid #cecbcb ;
      padding: 8px;

    }

    #payment tr:nth-child(even){background-color: #f2f2f2;}

    #payment tr:hover {background-color: #ddd;}

    #payment th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #dfe4e3;
      color: rgb(0, 0, 0);
      text-align: center;
    }
    .page{
      padding-left: 15px;
      text-align: center;
    }
    .container {
    display: flex; /* Use flexbox layout */
     padding-top: 1%;
    }

    .column1 {
    flex-basis: 52%; /* Set equal width for both columns */
    font-size: 16px;
    font-weight: bold;
    padding-left: 14%;
    }
    .column2{
    padding-right: 7%;
    }

    .rup{
      font-size: 16px;
      font-weight: bold;
      padding-left: 14%;
    }
    h4{
      padding-left: 8%;
    }

    .header {
      display: flex;
      align-items: center;
      margin-top: -20px;
      margin-bottom: -20px;
    }

    .logo {
      margin-right: 90px; /* Adjust margin as needed */
      width: 20%;
      height: 7%;
      padding-top: 5%;
    }
    .adj{
      display: flex;
     padding-left: 13%;
     padding-top: 3%;
    }

    .pre{
    padding-left: 45%;
    }
    .flexcol {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
    }

    .flexrow {
      display: flex;
      flex-direction: row;
      justify-content: start;
      align-items: start;
    }
    .rowgap {
      gap: 50%;
    }

    `;
    this.printService.PrintPDF('contentToConvert', css);
    this.userTrackingLog('PDF');
  }

  printAsPDF() {
    this.getCreditNoteport();
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  userTrackingLog(type) {
    let req = {
      page: 'Debit Note',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.debitNoteFormGroup.get('debitNoteVno').value,
      vpType: 'Debit Note',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }
  ngAfterViewInit() { }
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Debit Note') {
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
      { field: 'debitNoteVno', header: 'Voucher No' },
      { field: 'debitNoteDate', header: 'Date' },
      { field: 'debitNoteAcNo', header: 'Account' },
      { field: 'debitNoteCurrencyId', header: 'Currency' },
      { field: 'debitNoteDrAmount', header: 'Vchr.Debit' },
      { field: 'debitNoteCrAmount', header: 'Vchr.Credit' },
      { field: 'debitNoteNarration', header: 'Narration' },
      { field: 'debitNoteDrAmount', header: 'Dtls.Debit' },
      { field: 'debitNoteCrAmount', header: 'Dtls.Credit' },
    ];
    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedDebitNoteDetails(this.vNo);
    }
    this.initializeControls();
    this.debitNoteFormGroup = this.fb.group({
      debitNoteId: 0,
      debitNoteVno: [{ value: '', disabled: true }],
      debitNoteDate: [null, [Validators.required]],
      debitNoteRefNo: ['', [Validators.required]],
      debitNoteAcNo: [-1, [DropDownValidator]],
      debitNoteCrAmount: 0,
      debitNoteDrAmount: 0,
      debitNoteNarration: ['', [Validators.required]],
      debitNoteCurrencyId: [-1, [DropDownValidator]],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      ?.map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    var user = this.loginser.GetCredentialData();
    this.usrid = user?.userId;
    this.fsno = user?.financialPeriodsFsno;
    this.locId = user?.locId;
    this.bykeys();
  }

  get f() {
    return this.debitNoteFormGroup.controls;
  }

  updateTableConfiguration() {
    const hiddenColumns = [1, 3, 7, 8, 9];
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

  initializeControls() {
    this.getAllJobs();
    this.getAllCostCenter();
    this.getAllAccount();
    this.getAllCurrency();
    this.getAllDebitNote();

    const hiddenColumns = [1, 3, 7, 4, 5, 8, 9];
    this.debitnote_entry = this.utilityService.getTableConfig(
      ColumnList(this),
      hiddenColumns
    );

    this.debitnote_entry.afterSelection = (
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

      if (column === 0 && this.debitnote_entry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 4 && this.debitnote_entry.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 5 && this.debitnote_entry.readOnly === false) {
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

    this.debitnote_entry.beforeChange = (change: Handsontable.CellChange[]) => {
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.debitnote_entry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.debitnote_entry.afterRemoveRow = (index: number, amount: number) => {
      this.ColumnSum();
    };

    this.debitnote_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  ColumnSum() {
    var value1 = 0;
    this.debitnote_entry.data.forEach((elemt: any) => {
      if (elemt && elemt.credit) {
        value1 += elemt.credit;
      }
    });
    this.debitNoteFormGroup.controls.debitNoteCrAmount.setValue(value1);
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = k?.map((ar) => ar.currencyMasterCurrencyName?.trim());
    });
  }

  getAllJobs() {
    this.masterapi.GetJobMaster().subscribe((k) => {
      this.jobArray = k.result;
      this.jobList = k.result?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobArry = k.result?.map((ar) => ar.jobMasterJobName?.trim());
    });
  }

  getAllCostCenter() {
    this.masterapi.GetAllCostCenter().subscribe((k) => {
      this.costcenterArray = k;
      this.costcenterList = k?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterArry = k?.map((ar) =>
        ar.costCenterMasterCostCenterName?.trim()
      );
    });
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result
        ?.map((kl) => ({ label: kl.maAccName, value: kl.maAccNo }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
      this.acctArry = k.result?.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
    });
  }

  get accountSetLookup() {
    return this.accountArray?.map((kl) => ({
      account: kl.maAccName,
      accountId: kl.maAccNo,
    }));
  }
  get jobSetLookup() {
    return this.jobList?.map((kl) => ({
      account: kl.label,
      accountId: kl.value,
    }));
  }

  get costSetLookup() {
    return this.costcenterArray?.map((kl) => ({
      account: kl.costCenterMasterCostCenterName,
      accountId: kl.costCenterMasterCostCenterId,
    }));
  }

  saveDebitNote() {
    const savedData: Array<any> = this.debitnote_entry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    const debitNote_Save: DebitNote = this.debitNoteFormGroup
      .value as DebitNote;
    debitNote_Save.debitNoteVno =
      this.debitNoteFormGroup.getRawValue().debitNoteVno;
    debitNote_Save.debitNoteId = this.debitNoteFormGroup.value.debitNoteId != null ? this.debitNoteFormGroup.value.debitNoteId : 0;
    debitNote_Save.debitNoteCrAmount =
      this.debitNoteFormGroup.value.debitNoteCrAmount;
    debitNote_Save.debitNoteFcCrAmount =
      this.debitNoteFormGroup.value.debitNoteCrAmount;
    debitNote_Save.debitNoteDrAmount =
      this.debitNoteFormGroup.value.debitNoteDrAmount;
    debitNote_Save.debitNoteFcDrAmount =
      this.debitNoteFormGroup.value.debitNoteDrAmount;
    debitNote_Save.debitNoteFsno = this.fsno;
    debitNote_Save.debitNoteUserId = this.usrid;
    debitNote_Save.debitNoteLocationId = this.locId;
    debitNote_Save.debitNoteAllocId = '';
    debitNote_Save.accountsTransactions = [];
    debitNote_Save.debitNoteDetails = savedData
      ?.filter((k) => k.account != null && k.credit != null)
      ?.map((k: GridData) => {
        console.log('k:', k);
        return {
          debitNoteDetailsId: k.id != null ? k.id : 0,
          debitNoteDetailsVno:k.account??'',
           // this.debitNoteFormGroup.getRawValue().debitNoteVno,
          debitNoteId: this.debitNoteFormGroup.getRawValue().debitNoteId?this.debitNoteFormGroup.getRawValue().debitNoteId:0,
          debitNoteDetailsAccNo: this.accountArray?.find(
            (x) => x.maAccName?.trim() === k.account?.trim()
          ).maAccNo,
          debitNoteDetailsVatableAmount: k.vat,
          debitNoteDetailsDrAmount: 0,
          debitNoteDetailsFcDrAmount: 0,
          debitNoteDetailsCrAmount: k.credit,
          debitNoteDetailsFcCrAmount: k.credit,
          debitNoteDetailsJobNo:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                .value
              : -1,
          debitNoteDetailsCostCenterId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                (j) =>
                  j.costCenterMasterCostCenterName?.trim() ===
                  k.costcenter?.trim()
              ).costCenterMasterCostCenterId
              : null,
          debitNoteDetailsNarration: k.narration,
          debitNoteDetailsFsno: this.fsno,
          debitNoteDetailsLocationId: this.locId,
          debitNoteDetailsDelStatus: false,
        };
      });

    debitNote_Save.debitNoteDetails
      ?.filter((x) => x.debitNoteDetailsDelStatus === false)
      .forEach((element) => {
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: element.debitNoteDetailsAccNo,
          accountsTransactionsTransDate: this.f.debitNoteDate.value,
          accountsTransactionsParticulars: element.debitNoteDetailsNarration,
          accountsTransactionsCredit: element.debitNoteDetailsCrAmount,
          accountsTransactionsFcCredit: element.debitNoteDetailsCrAmount,
          accountsTransactionsDebit: 0,
          accountsTransactionsFcDebit: 0,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo: element.debitNoteDetailsVno,
          accountsTransactionsDescription: element.debitNoteDetailsNarration,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsTransSno: 0,
        };
        debitNote_Save.accountsTransactions.push(debitData);

        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: this.f.debitNoteAcNo.value,
          accountsTransactionsTransDate: this.f.debitNoteDate.value,
          accountsTransactionsParticulars: element.debitNoteDetailsNarration,
          accountsTransactionsCredit: 0,
          accountsTransactionsFcCredit: 0,
          accountsTransactionsDebit: element.debitNoteDetailsCrAmount,
          accountsTransactionsFcDebit: element.debitNoteDetailsCrAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.debitNoteFormGroup.getRawValue().debitNoteVno,
          accountsTransactionsDescription: this.f.debitNoteNarration.value,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsTransSno: 0,
          accountsTransactionsJobNo: element.debitNoteDetailsJobNo,
        };
        debitNote_Save.accountsTransactions.push(creditData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(debitNote_Save);
    } else {
      debitNote_Save.accountsTransactions
        ?.filter((x) => x.accountsTransactionsTransSno != 0)
        .forEach((element, index, arry) => {
          arry[index].accountstransactionsDelStatus = true;
        });

      this.updateVoucher(debitNote_Save);
    }
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  validateTotalDrCrAmounts(): boolean {
    if (
      this.debitNoteFormGroup.getRawValue().debitNoteCrAmount == 0 &&
      this.debitNoteFormGroup.getRawValue().debitNoteDrAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    if (this.debitNoteFormGroup.getRawValue().debitNoteCrAmount == 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit is Zero',
      });
      return false;
    }

    return true;
  }
  saveVoucher(debitNote_Save: DebitNote) {
    if (this.debitNoteFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.accountapi.InsertDebitNote(debitNote_Save).subscribe(
              (data) => {
                this.btnFlag = {
                  new: false,
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  print: true,
                  printPreview: true,
                };
                this.savedDebitNote = data.result;
                this.updateFormGrid(data.result);
                this.debitNoteFormGroup.disable();
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
      this.debitNoteFormGroup.markAllAsTouched();
      this.debitNoteFormGroup.markAsDirty();
    }
  }

  updateVoucher(debitNote_Save: DebitNote) {
    if (this.debitNoteFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.accountapi.UpdateDebitNote(debitNote_Save).subscribe(
              (data) => {
                this.debitNoteFormGroup.disable();
                this.btnFlag = {
                  new: false,
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
                  detail: 'Debit Note Updated Succesfully',
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Debit Note Update Failed',
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
      this.debitNoteFormGroup.markAllAsTouched();
      this.debitNoteFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllDebitNote() {
    this.accountapi.GetDebitNote().subscribe((data) => {
      this.debitNotearry = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  new() {
    this.debitNoteFormGroup.reset();
    this.debitnote_entry.data = [];
    this.debitnote_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.debitnote_entry);

    this.accountTransactionList = [];
    this.debitNoteFormGroup.get('debitNoteId').setValue(null);
    this.debitNoteFormGroup.get('debitNoteAcNo').setValue(-1);
    this.debitNoteFormGroup.get('debitNoteCurrencyId').setValue(-1);
    this.debitNoteFormGroup.get('debitNoteDate').setValue(new Date());
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

    this.index = 0;
    this.GetDefaultSettings();
    this.getDefaultCurrency();
    this.debitNoteFormGroup.enable();
    this.f.debitNoteDetailsVno.clearValidators();
    this.debitNoteFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m: any) => {
      let list = m.resultSet.generalSettings;
      let optionSettings = m.resultSet.optionSettings;
      // currency

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.purchaseVoucherCurrencyId.setValue(Number(this.DefCurrency));
        }
      }

      this.DefLocationCheck = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );
      if (this.DefLocationCheck !== null) {
        const splitText = this.DefLocationCheck.split('::');
        this.DefLocation = splitText[1]?.trim();
        this.f.purchaseVoucherLocationId.setValue(this.DefLocation);
      }
      this.DefAccCheck = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTINTIALACCOUNT'
      );
      if (this.DefAccCheck !== null) {
        const splitText = this.DefAccCheck.split('::');
        this.DefAcc = splitText[1]?.trim();
      }
    });
  }

  initializeHandsontable(columns, colHeaders) {
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      columns: columns,
      colHeaders: colHeaders,
    });
  }

  showMaximizableDialog() {
    this.getAllDebitNote();
    this.displayMaximizable = true;
  }

  updateFormGrid(debitnote_update: DebitNote) {
    this.debitNoteFormGroup.patchValue({
      debitNoteId: debitnote_update.debitNoteId,
      debitNoteVno: debitnote_update.debitNoteVno,
      debitNoteDate: new Date(debitnote_update.debitNoteDate),
      debitNoteRefNo: debitnote_update.debitNoteRefNo,
      debitNoteAcNo: debitnote_update.debitNoteAcNo,
      debitNoteCrAmount: debitnote_update.debitNoteCrAmount,
      debitNoteFcCrAmount: debitnote_update.debitNoteCrAmount,
      debitNoteDrAmount: debitnote_update.debitNoteDrAmount,
      debitNoteFcDrAmount: debitnote_update.debitNoteDrAmount,
      debitNoteNarration: debitnote_update.debitNoteNarration,
      debitNoteCurrencyId: debitnote_update.debitNoteCurrencyId,
    });
    const salesVoucherNetAmount: number = debitnote_update.debitNoteCrAmount;
    this.wordamt = this.convertNumberToWordsWithDecimal(salesVoucherNetAmount);

    this.accountTransactionList = debitnote_update.accountsTransactions;
    const gridData: GridData[] = debitnote_update.debitNoteDetails?.map((k) => {
      const accountId: string = k.debitNoteDetailsAccNo != null ? this.accountArray?.find((l) =>
            l.maAccNo.match(k.debitNoteDetailsAccNo)
          )?.maAccName
          : null;

      const jobId: string =
        k.debitNoteDetailsJobNo != null
          ? this.jobList?.find((l) => l.value == k.debitNoteDetailsJobNo)?.label
          : null;

      const costCenterId: string =
        k.debitNoteDetailsCostCenterId != null
          ? this.costcenterList?.find(
            (l) => l.value == k.debitNoteDetailsCostCenterId
          ).label
          : null;
      return {
        account: accountId,
        vat: k.debitNoteDetailsVatableAmount,
        debit: k.debitNoteDetailsDrAmount,
        credit: k.debitNoteDetailsCrAmount,
        jobname: jobId,
        costcenter: costCenterId,
        narration: k.debitNoteDetailsNarration,
        id: k.debitNoteDetailsId,
      };
    });
    this.debitnote_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.debitnote_entry.readOnly = true;
    this.debitNoteFormGroup.disable();
    this.f.debitNoteVno.clearValidators();
    this.debitNoteFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  //  public getCurrencyName(id: number): string {
  //     return this.currency
  //       ?.find(j => j?.currencyMasterCurrencyId === id)?.currencyMasterCurrencyName;
  //   }

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
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  GetSavedDebitNoteDetails(id: string) {
    this.index = 0;
    this.accountapi.GetSavedDebitNoteDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            new: false,
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
          this.savedDebitNote = data.result;
          this.debitNoteFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Debit Note not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.debitNoteFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.accountapi.DeleteDebitNote(this.savedDebitNote).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Debit Note Deleted Succesfully',
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
    // this.GetSavedDebitNoteDetails(this.debitNoteFormGroup.getRawValue().debitNoteVno);
    this.debitNoteFormGroup.reset();
    this.debitnote_entry.data = [];
    this.btnFlag = {
      new: true,
      edit: false,
      cancel: true,
      save: true,
      update: false,
      delete: false,
      print: false,
      printPreview: true,
    };
  }

  edit() {
    //this.hotRegisterer.getInstance(this.hotid).updateSettings({readOnly: false});
    this.btnFlag = {
      new: false,
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      print: false,
      printPreview: false,
    };
    this.debitnote_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.debitnote_entry);
    this.f.debitNoteVno.clearValidators();
    this.debitNoteFormGroup.enable();
    this.debitNoteFormGroup.controls.debitNoteVno.disable();
    this.debitNoteFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.debitnote_entry.data.length > 0) {
      // this.debitnote_entry.data.forEach((value: GridData, index, arry) => {
      console.log(Object.values(this.debitnote_entry.data));
      return Object.values(this.debitnote_entry.data).some(
        (k: GridData) => k.account != null && k.credit != null
      );
      // });
    }
    return false;
  }
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

  public getCurrency(id): string {
    return this.currencyList?.find((x) => x.value === id).label;
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
            this.f.debitNoteCurrencyId.setValue(Number(this.DefCurrency));
          }
        }
      });
  }

     getPOReport() {
    this.rptFilter = {
      ReportName: 'DebitNote',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_debitNote where DebitNote_ID ='${this.debitNoteFormGroup.getRawValue().debitNoteId
        }'`,
      ],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
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
        switchMap(() => acctService.CheckVnoExistDebitNote(input.value)),
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
  new?: boolean;
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  print?: boolean;
  printPreview?: boolean;
}
export const ColumnList = (component: DebitnoteComponent) => [
  {
    data: 'account',
    type: 'autocomplete',
    label: 'Account',
    toolTip: 'Account',
    source: component.acctArry,
    allowInvalid: false,
    strict: false,
  },
  {
    data: 'vat',
    type: 'numeric',
    label: 'VAT',
    toolTip: 'VAT Amount',
    width: 60,
    readOnly: false,
  },
  {
    data: 'credit',
    type: 'numeric',
    label: 'Credit',
    readOnly: false,
    toolTip: 'Credit Amount',
    width: 60,
  },
  {
    data: 'debit',
    type: 'numeric',
    label: 'Debit',
    readOnly: false,
    toolTip: 'Debit Amount',
    width: 60,
    className: 'lightblue-bg',
  },
  {
    data: 'jobname',
    type: 'text',
    label: 'Job Name',
    toolTip: 'Job Name',
  },
  {
    data: 'costcenter',
    type: 'dropdown',
    label: 'Cost Center',
    toolTip: 'Cost Center',
    source: component.costcenterArry,
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    readOnly: false,
    toolTip: 'Narration (max 500 chars)',
    width: 150,
  },
  {
    data: 'vatno',
    type: 'text',
    label: 'VAT No',
    readOnly: false,
    toolTip: 'VAT Number',
    width: 60,
  },
  {
    data: 'refno',
    type: 'text',
    label: 'Ref No',
    readOnly: false,
    toolTip: 'Reference Number',
    width: 60,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
    toolTip: 'Record ID',
    width: 50,
  },
];
