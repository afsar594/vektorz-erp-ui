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
import { CreditNote } from 'src/app/routes/domain/Accounts/CreditNote';
import { CreditNoteDetails } from 'src/app/routes/domain/Accounts/CreditNoteDetails';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { timer, Observable } from 'rxjs';
import { LoginService } from 'src/app/routes/service/login.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ToWords } from 'to-words';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
@Component({
  selector: 'app-creditnote',
  templateUrl: './creditnote.component.html',
  styleUrls: ['./creditnote.component.scss'],
})
export class CreditnoteComponent implements OnInit, AfterViewInit {
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

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  DefAcc: string;
  DefAccCheck: string;
  usrid: number;
  fsno: number;
  locId: number;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  displayPrintPreview: boolean = false;
  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  creditNotearry: CreditNote[] = [];
  // savedCreditNoteGridData: GridData[] = [];
  savedCreditNote: CreditNote;
  wordamt: string;
  vNo: string = '';
  ScreenId: number;
  Permission: any;
  user: any;
  rptFilter: ReportFilterModel;
  pdfSource: any;

  constructor(
    private activatedroute: ActivatedRoute,
    private printService: FileSaverService,

    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private utilityService: UtilityService,

    private translate: TranslateService,
    private router: Router,
    private loginser: LoginService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  private hotRegisterer = new HotTableRegisterer();
  hotid = 'creditnote_HotEntry';
  creditnote_entry: Handsontable.GridSettings;
  creditNoteFormGroup: FormGroup;
  creditnote_entryDataset = [];
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
    this.getAllStationMaster();
    this.displayPrintPreview = true;
  }

  userTrackingLog(type) {
    let req = {
      page: 'Credit Note',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.creditNoteFormGroup.get('creditNoteVno').value,
      vpType: 'Credit Note',
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
        if (res.workGroupPermissionsMenuName === 'Credit Note') {
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
    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedCreditNoteDetails(this.vNo);
    }

    this.cols = [
      { field: 'creditNoteVno', header: 'Voucher No' },
      { field: 'creditNoteDate', header: 'Date' },
      { field: 'creditNoteAcNo', header: 'Account' },
      { field: 'creditNoteCurrencyId', header: 'Currency' },
      { field: 'creditNoteDrAmount', header: 'Vchr.Debit' },
      { field: 'creditNoteCrAmount', header: 'Vchr.Credit' },
      { field: 'creditNoteNarration', header: 'Narration' },
      { field: 'creditNoteDrAmount', header: 'Dtls.Debit' },
      { field: 'creditNoteCrAmount', header: 'Dtls.Credit' },
    ];

    this.initializeControls();
    this.creditNoteFormGroup = this.fb.group({
      creditNoteId: 0,
      creditNoteVno: [{ value: '', disabled: true }],
      creditNoteDate: [null, [Validators.required]],
      creditNoteRefNo: ['', [Validators.required]],
      creditNoteAcNo: [-1, [DropDownValidator]],
      creditNoteCrAmount: 0,
      creditNoteDrAmount: 0,
      creditNoteNarration: ['', [Validators.required]],
      creditNoteCurrencyId: [-1, [DropDownValidator]],
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

  get f() {
    return this.creditNoteFormGroup.controls;
  }
  updateTableConfiguration() {
    const hiddenColumns = [1, 2, 7, 8, 9];

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
    this.getIntialAccounts();
    this.getAllCostCenter();
    this.getAllAccount();
    this.getAllCurrency();
    this.getAllCreditNote();
    this.getDefaultCurrency();
    this.getDefaultLocation();

    // this.getAllAccountTransaction();
    const hiddenColumns = [1, 2, 7, 4, 5, 8, 9];
    this.creditnote_entry = this.utilityService.getTableConfig(
      ColumnList(this),
      hiddenColumns
    );

    this.creditnote_entry.afterSelection = (
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

      if (column === 0 && this.creditnote_entry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 4 && this.creditnote_entry.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 5 && this.creditnote_entry.readOnly === false) {
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

    this.creditnote_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.creditnote_entry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.creditnote_entry.afterRemoveRow = (index: number, amount: number) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.creditnote_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };

    // this.creditnote_entry.afterChange = (r, c) => {
    //   // const  hotinstance = this.hotRegisterer.getInstance(this.hotid);
    //   // var data = hotinstance.getDataAtRow(r);
    //   console.log(r, c);

    // };
  }

  //  openAccount() {
  //   this.control = this.f.creditNoteAcNo;
  //   this.elementReference = this.accountCtrol;
  //   this.lookupGridColumns = ['Account', 'Account ID'];
  //   this.formControlLookUp = true;
  //   this.selectItem = { account: this.accountCtrol.nativeElement.value,
  //     accountId: this.f.creditNoteAcNo.value };
  //   this.dataList = this.accountCreditSetLookup;
  // }

  // openCurrency() {
  //   this.control = this.f.creditNoteCurrencyId;
  //   this.elementReference = this.currencyCtrol;
  //   this.lookupGridColumns = ['Currency', 'Currency ID'];
  //   this.formControlLookUp = true;
  //   this.selectItem = { account: this.currencyCtrol.nativeElement.value,
  //     accountId: this.f.creditNoteCurrencyId.value };
  //   this.dataList = this.currencyLookup;
  // }

  ColumnSum() {
    // const sum1 = this.creditnote_entry.data?.filter(item => item.hasOwnProperty('debit'))
    // .reduce((sum, current:any) => sum + current.debit, [0]);
    // this.creditNoteFormGroup.controls.creditNoteDrAmount.setValue(sum1);

    // const sum2 = this.creditnote_entry.data?.filter(item => item.hasOwnProperty('credit'))
    // .reduce((sum, current:any) => sum + current.credit, [0]);
    // this.creditNoteFormGroup.controls.creditNoteCrAmount.setValue(sum2);

    var value = 0;

    this.creditnote_entry.data.forEach((ele: any) => {
      if (ele && ele.debit) value += ele.debit;
    });
    this.creditNoteFormGroup.controls.creditNoteDrAmount.setValue(value);
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = k.map((ar) => ar.currencyMasterCurrencyName?.trim());
    });
  }
  getAllJobs() {
    this.masterapi.GetJobMaster().subscribe((k) => {
      this.jobArray = k.result;
      this.jobList = k.result.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobArry = k.result.map((ar) => ar.jobMasterJobName?.trim());
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
        ar.costCenterMasterCostCenterName?.trim()
      );
    });
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result?.map((kl) => ({ label: kl.maAccName, value: kl.maAccNo }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
      this.acctArry = k.result.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
    });
  }

  get accountSetLookup() {
    return this.accountArray.map((kl) => ({
      account: kl.maAccName,
      accountId: kl.maAccNo,
    }));
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
            this.f.creditNoteCurrencyId.setValue(Number(this.DefCurrency));
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
            this.DefLocation = splitText[1]?.trim();
            // this.f.paymentVoucherLocationId.setValue(Number(this.DefLocation));
          }
        }
      });
  }

  getIntialAccounts() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULTINTIALACCOUNT')
      .subscribe((data) => {
        if (data !== null) {
          // console.log(data,'Please Check');
          this.DefAccCheck = data.result[0].generalSettingsTextValue;
          if (this.DefAccCheck !== null) {
            const splitText = this.DefAccCheck.split('::');
            this.DefAcc = splitText[1]?.trim();
            // this.f.paymentVoucherCrAcNo.setValue(Number(this.DefAcc));
          }
        }
      });
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

  saveCreditNote() {
    const savedData: any = this.creditnote_entry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    const creditNote_Save: CreditNote = this.creditNoteFormGroup
      .value as CreditNote;
    creditNote_Save.creditNoteVno =
      this.creditNoteFormGroup.getRawValue().creditNoteVno;
    creditNote_Save.creditNoteId =
      this.creditNoteFormGroup.value.creditNoteId != null
        ? this.creditNoteFormGroup.value.creditNoteId
        : 0;
    creditNote_Save.creditNoteCrAmount =
      this.creditNoteFormGroup.value.creditNoteCrAmount;
    creditNote_Save.creditNoteFcCrAmount =
      this.creditNoteFormGroup.value.creditNoteCrAmount;
    creditNote_Save.creditNoteDrAmount =
      this.creditNoteFormGroup.value.creditNoteDrAmount;
    creditNote_Save.creditNoteFcDrAmount =
      this.creditNoteFormGroup.value.creditNoteDrAmount;
    creditNote_Save.creditNoteFsno = this.fsno;
    creditNote_Save.creditNoteUserId = this.usrid;
    creditNote_Save.creditNoteLocationId = this.locId;
    creditNote_Save.creditNoteAllocId = '';
    creditNote_Save.accountsTransactions = [];
    creditNote_Save.creditNoteDetails = savedData
      ?.filter((k) => k.account != null && k.debit != null)
      .map((k: GridData) => {
        return {
          creditNoteDetailsId: k.id != null ? k.id : 0,
          creditNoteDetailsVno:
            this.creditNoteFormGroup.getRawValue().creditNoteVno,
          creditNoteId:
            this.creditNoteFormGroup.getRawValue().creditNoteId != null
              ? this.creditNoteFormGroup.getRawValue().creditNoteId
              : 0,
          creditNoteDetailsAccNo: this.accountArray?.find(
            (x) => x.maAccName?.trim() === k.account?.trim()
          ).maAccNo,
          creditNoteDetailsVatableAmount: k.vat,
          creditNoteDetailsDrAmount: k.debit,
          creditNoteDetailsFcDrAmount: k.debit,
          creditNoteDetailsCrAmount: 0,
          creditNoteDetailsFcCrAmount: 0,
          creditNoteDetailsJobNo:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                .value
              : -1,
          creditNoteDetailsCostCenterId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                (j) =>
                  j.costCenterMasterCostCenterName?.trim() ===
                  k.costcenter?.trim()
              ).costCenterMasterCostCenterId
              : null,
          creditNoteDetailsNarration: k.narration,
          creditNoteDetailsFsno: this.fsno,
          creditNoteDetailsLocationId: this.locId,
          creditNoteDetailsDelStatus: false,
        };
      });

    creditNote_Save.creditNoteDetails
      ?.filter((x) => x.creditNoteDetailsDelStatus === false)
      .forEach((element) => {
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: element.creditNoteDetailsAccNo,
          accountsTransactionsTransDate: this.f.creditNoteDate.value,
          accountsTransactionsParticulars: element.creditNoteDetailsNarration,
          accountsTransactionsDebit: element.creditNoteDetailsDrAmount,
          accountsTransactionsFcDebit: element.creditNoteDetailsDrAmount,
          accountsTransactionsCredit: 0,
          accountsTransactionsFcCredit: 0,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo: element.creditNoteDetailsVno,
          accountsTransactionsDescription: element.creditNoteDetailsNarration,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsTransSno: 0,
          accountsTransactionsJobNo: element.creditNoteDetailsJobNo,
        };
        creditNote_Save.accountsTransactions.push(debitData);

        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: this.f.creditNoteAcNo.value,
          accountsTransactionsTransDate: this.f.creditNoteDate.value,
          accountsTransactionsParticulars: element.creditNoteDetailsNarration,
          accountsTransactionsDebit: 0,
          accountsTransactionsFcDebit: 0,
          accountsTransactionsCredit: element.creditNoteDetailsDrAmount,
          accountsTransactionsFcCredit: element.creditNoteDetailsDrAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.creditNoteFormGroup.getRawValue().creditNoteVno,
          accountsTransactionsDescription: this.f.creditNoteNarration.value,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsTransSno: 0,
        };
        creditNote_Save.accountsTransactions.push(creditData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(creditNote_Save);
    } else {
      // creditNote_Save.accountsTransactions
      //   ?.filter((x) => x.accountsTransactionsTransSno != 0)
      //   .forEach((element, index, arry) => {
      //     arry[index].accountstransactionsDelStatus = true;
      //   });

      this.updateVoucher(creditNote_Save);
    }
  }
  validateTotalDrCrAmounts(): boolean {
    if (
      this.creditNoteFormGroup.getRawValue().creditNoteCrAmount == 0 &&
      this.creditNoteFormGroup.getRawValue().creditNoteDrAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    //    if(this.creditNoteFormGroup.getRawValue().creditNoteCrAmount ==0 ){
    //  this.messageService.add({severity: 'error', summary: 'Alert', detail: 'Total Credit is Zero'});
    //     return false;
    //   }

    if (this.creditNoteFormGroup.getRawValue().creditNoteDrAmount == 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total  Debit Amounts are Zero',
      });
      return false;
    }

    return true;
  }

  saveVoucher(creditNote_Save: CreditNote) {
    if (this.creditNoteFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.accountapi.InsertCreditNote(creditNote_Save).subscribe(
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
                this.savedCreditNote = data.result;
                this.creditNoteFormGroup.disable();
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
      this.creditNoteFormGroup.markAllAsTouched();
      this.creditNoteFormGroup.markAsDirty();
    }
  }

  updateVoucher(creditNote_Save: CreditNote) {
    if (this.creditNoteFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.accountapi.UpdateCreditNote(creditNote_Save).subscribe(
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
                this.creditNoteFormGroup.disable();
                this.updateFormGrid(data.result);
                this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Credit Note Updated Succesfully',
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Credit Note Update Failed',
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
      this.creditNoteFormGroup.markAllAsTouched();
      this.creditNoteFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllCreditNote() {
    this.accountapi.GetCreditNote().subscribe((data) => {
      this.creditNotearry = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  new() {
    this.creditNoteFormGroup.reset();
    this.creditnote_entry.data = [];
    this.creditnote_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.creditnote_entry);

    this.accountTransactionList = [];
    //this.creditNoteFormGroup.get('creditNoteId').setValue(null);
    this.creditNoteFormGroup.get('creditNoteAcNo').setValue(-1);
    this.creditNoteFormGroup.get('creditNoteCurrencyId').setValue(-1);
    this.creditNoteFormGroup.get('creditNoteDate').setValue(new Date());
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
    this.getDefaultCurrency();
    this.defalutSetting();
    this.creditNoteFormGroup.enable();
    this.f.creditNoteDetailsVno.clearValidators();
    this.creditNoteFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  defalutSetting() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;
      this.accountList = this.accountArray
        ?.map((filteredAccount) => ({
          label: filteredAccount.maAccName,
          value: filteredAccount.maAccNo,
        }));
      this.f.creditNoteAcNo.setValue(this.DefAcc);

      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      // if (HIDE_JOBCOST !== null) {
      //   var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      //   if (jobcal == true) {
      //     this.JOBCOST = false;
      //     this.updateTableConfiguration();
      //   }
      // }
    });
  }

  initializeHandsontable(columns, colHeaders) {
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      columns: columns,
      colHeaders: colHeaders,
    });
  }

  showMaximizableDialog() {
    this.getAllCreditNote();
    this.displayMaximizable = true;
  }

  updateFormGrid(creditnote_update: CreditNote) {
    this.creditNoteFormGroup.patchValue({
      creditNoteId: creditnote_update.creditNoteId,
      creditNoteVno: creditnote_update.creditNoteVno,
      creditNoteDate: new Date(creditnote_update.creditNoteDate),
      creditNoteRefNo: creditnote_update.creditNoteRefNo,
      creditNoteAcNo: creditnote_update.creditNoteAcNo,
      creditNoteCrAmount: creditnote_update.creditNoteCrAmount,
      creditNoteFcCrAmount: creditnote_update.creditNoteCrAmount,
      creditNoteDrAmount: creditnote_update.creditNoteDrAmount,
      creditNoteFcDrAmount: creditnote_update.creditNoteDrAmount,
      creditNoteNarration: creditnote_update.creditNoteNarration,
      creditNoteCurrencyId: creditnote_update.creditNoteCurrencyId,
    });
    const salesVoucherNetAmount: number = creditnote_update.creditNoteDrAmount;
    this.wordamt = this.convertNumberToWordsWithDecimal(salesVoucherNetAmount);
    // this.currencyCtrol.nativeElement.value = this.currencyList?.find(k => k.value === creditnote_update.creditNoteCurrencyId).label;
    // this.accountCtrol.nativeElement.value = this.accountArray
    //                                         ?.find(k => k.masterAccountsTableAccNo === creditnote_update.creditNoteAcNo)maAccNo;

    this.accountTransactionList = creditnote_update?.accountsTransactions;
    // this.jobArray?.find(j => j.jobMasterJobName?.trim()  === k.jobname?.trim()).jobMasterId,
    const gridData: GridData[] = creditnote_update?.creditNoteDetails.map(
      (k) => {
        // let  accountId: string = k.creditNoteDetailsAccNo != null ? this.acctArry?.find(l => l.match(k.creditNoteDetailsAccNo)) : null;
        // let  jobId: string = (k.creditNoteDetailsJobNo != null ) ? this.jobArry?.find(l =>
        //                      l.match(k.creditNoteDetailsJobNo.toString())) : null;
        // let  costCenterId: string = (k.creditNoteDetailsCostCenterId != null ) ? this.costcenterArry?.find(l =>
        //                       l.match(k.creditNoteDetailsCostCenterId.toString())) : null;
        const accountId: string =
          k.creditNoteDetailsAccNo != null
            ? this.accountArray?.find((l) =>
              l.maAccNo.match(k.creditNoteDetailsAccNo)
            )?.maAccName
            : null;

        const jobId: string =
          k.creditNoteDetailsJobNo != null
            ? this.jobList?.find((l) => l.value == k.creditNoteDetailsJobNo)
              ?.label
            : null;

        const costCenterId: string =
          k.creditNoteDetailsCostCenterId != null
            ? this.costcenterList?.find(
              (l) => l.value == k.creditNoteDetailsCostCenterId
            ).label
            : null;

        return {
          account: accountId,
          vat: k.creditNoteDetailsVatableAmount,
          debit: k.creditNoteDetailsDrAmount,
          credit: k.creditNoteDetailsCrAmount,
          jobname: jobId,
          costcenter: costCenterId,
          narration: k.creditNoteDetailsNarration,
          id: k.creditNoteDetailsId,
        };
      }
    );
    // this.creditnote_entry.data = gridData;
    // this.hotRegisterer.getInstance(this.hotid).updateSettings({data: gridData, readOnly: true});

    this.creditnote_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.creditnote_entry.readOnly = true;
    this.creditNoteFormGroup.disable();
    this.f.creditNoteVno.clearValidators();
    this.creditNoteFormGroup.updateValueAndValidity();
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
  }

  GetSavedCreditNoteDetails(id: string) {
    this.index = 0;
    this.accountapi.GetSavedCreditNoteDetails(id).subscribe(
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
          this.savedCreditNote = data.result;
          this.creditNoteFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Credit Note not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.creditNoteFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.accountapi.DeleteCreditNote(this.savedCreditNote).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Credit Note Deleted Succesfully',
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
    this.new();
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
    // this.dataset
  }

  edit() {
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
    this.creditnote_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.creditnote_entry);
    this.f.creditNoteVno.clearValidators();
    this.creditNoteFormGroup.enable();
    this.creditNoteFormGroup.controls.creditNoteVno.disable();
    this.creditNoteFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.creditnote_entry.data.length > 0) {
      // this.creditnote_entry.data.forEach((value: GridData, index, arry) => {
      console.log(Object.values(this.creditnote_entry.data));
      return Object.values(this.creditnote_entry.data).some(
        (k: GridData) =>
          k.account != null && k.debit != null && k.narration != null
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

  getCurrency(id): string {
    return this.currencyList?.find((x) => x.value === id).label;
  }

   getPOReport() {
    this.rptFilter = {
      ReportName: 'CreditNote',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_CreditNote where CreditNote_ID ='${this.creditNoteFormGroup.getRawValue().creditNoteId
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
        switchMap(() => acctService.CheckVnoExistCreditNote(input.value)),
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
export const ColumnList = (component: CreditnoteComponent) => [
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
