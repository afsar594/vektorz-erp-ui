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
import { PurchaseJournal } from 'src/app/routes/domain/Accounts/PurchaseJournal';
import { PurchaseJournalDetails } from 'src/app/routes/domain/Accounts/PurchaseJournalDetails';
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
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { JournalVoucherComponent } from '../journal-voucher/journal-voucher.component';
import { columnList } from '../../master/salesman/salesman.component';
import { ExportFormatType, ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
@Component({
  selector: 'app-purchasejournal',
  templateUrl: './purchasejournal.component.html',
  styleUrls: ['./purchasejournal.component.scss'],
})
export class PurchasejournalComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;

  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  date = new Date();
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

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  usrid: number;
  fsno: number;
  locId: number;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  purchaseJournalarry: PurchaseJournal[] = [];
  // savedPurchaseJournalGridData: GridData[] = [];
  savedPurchaseJournal: PurchaseJournal;
  displayPrintPreview: boolean = false;
  ScreenId: number;
  Permission: any;
  user: any;
  JOBCOST: boolean = true;
  difference: number = null;
  pdfSource: string;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private crystalReportService: CrystalReportService,
    private router: Router,
    private loginser: LoginService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private permission: PermissionsService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'purchasejournal_HotEntry';
  purchasejournal_entry: Handsontable.GridSettings;
  purchaseJournalFormGroup: FormGroup;
  purchasejournal_entryDataset = [];
  // accountTransactionDataset = [];
  cols;

  ngAfterViewInit() { }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
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

    this.cols = [
      { field: 'purchaseJournalVno', header: 'Voucher No' },
      { field: 'purchaseJournalDate', header: 'Date' },
      // { field: 'purchaseJournalAcNo', header: 'Account' },
      { field: 'purchaseJournalCurrencyId', header: 'Currency' },
      { field: 'purchaseJournalDrAmount', header: 'Vchr.Debit' },
      { field: 'purchaseJournalCrAmount', header: 'Vchr.Credit' },
      { field: 'purchaseJournalNarration', header: 'Narration' },
      { field: 'purchaseJournalDrAmount', header: 'Dtls.Debit' },
      { field: 'purchaseJournalCrAmount', header: 'Dtls.Credit' },
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.purchaseJournalFormGroup = this.fb.group({
      purchaseJournalId: [0],
      purchaseJournalVno: [{ value: '', disabled: true }],
      purchaseJournalDate: [null, [Validators.required]],
      purchaseJournalRefNo: [''],
      // purchaseJournalAcNo: [-1, [DropDownValidator]],
      purchaseJournalCrAmount: [{ value: null, disabled: true }],
      purchaseJournalDrAmount: [{ value: null, disabled: true }],
      purchaseJournalNarration: ['', [Validators.required]],
      purchaseJournalCurrencyId: [-1, [DropDownValidator]],
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
    return this.purchaseJournalFormGroup.controls;
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

  initializeControls() {
    this.accountapi.GetPurchaseJournalDropdown().subscribe((m: any) => {
      //job
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobArry = m.resultSet.jobMasters; //?.map(ar => ar.jobMasterJobName.trim());
      //cost center
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterArry = m.resultSet.costcenterMasters; //?.map(ar => ar.costCenterMasterCostCenterName.trim());
      // accounts
      this.accountArray = m.resultSet.masterAccountsTables;
      this.accountList = m.resultSet.masterAccountsTables?.map((kl) => ({
        label: kl.maAccName,
        value: kl?.maAccNo,
      }));
      this.acctArry = m.resultSet.masterAccountsTables; //?.map(ar => ar.maAccName.trim() + '|' + ar.maAccNo);
      //currency
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currArry = m.resultSet.currencyMasters; //?.map(ar => ar.currencyMasterCurrencyName.trim());
    });
    const hiddenColumns = [4, 5, 9];
    this.purchasejournal_entry = this.utilityService.getTableConfig(
      ColumnList(this),
      hiddenColumns
    );
    this.purchasejournal_entry.afterSelection = (
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

      if (column === 0 && this.purchasejournal_entry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 4 &&
        this.purchasejournal_entry.readOnly === false
      ) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 5 &&
        this.purchasejournal_entry.readOnly === false
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

    this.purchasejournal_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.purchasejournal_entry.beforeChangeRender = (change, source) => {
      const [rowIndex, colName, , newValue] = change[0]; // Destructure the change array
      this.ColumnSum(rowIndex, colName, newValue);
    };

    this.purchasejournal_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum(index, '', amount);
    };

    this.purchasejournal_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  ColumnSum(rowIndex: number, colName: any, newValue: any) {
    var value = 0;
    var value1 = 0;

    this.purchasejournal_entry.data.forEach((elemt: any, index: number) => {
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
    this.purchaseJournalFormGroup.controls.purchaseJournalDrAmount.setValue(
      value
    );
    this.purchaseJournalFormGroup.controls.purchaseJournalCrAmount.setValue(
      value1
    );
    this.difference = value1 - value;
    this.difference = parseFloat(this.difference.toFixed(2));
  }

  // ColumnSum1() {

  //   var value1 = 0
  //   this.purchasejournal_entry.data.forEach((elemt: any) => {
  //     if (elemt && elemt.debit) {
  //       value1 += elemt.debit
  //     }
  //   });
  //   this.purchaseJournalFormGroup.controls.purchaseJournalDrAmount.setValue(value1);
  //   var value = 0
  //   this.purchasejournal_entry.data.forEach((elemt: any) => {
  //     if (elemt && elemt.credit) {
  //       value += elemt.credit
  //     }
  //   });
  //   this.purchaseJournalFormGroup.controls.purchaseJournalCrAmount.setValue(value);
  // }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  get accountSetLookup() {
    return this.accountArray.map((kl) => ({
      account: kl.maAccName,
      accountId: kl?.maAccNo,
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
  displayPrint() {
    this.displayPrintPreview = true;
  }

  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  userTrackingLog(type) {
    let req = {
      page: 'Purchase Journal',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.purchaseJournalFormGroup.get('purchaseJournalVno').value,
      vpType: 'Purchase Journal',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }


  rptFilter: ReportFilterModel;
  showPrint() {
    this.rptFilter = {
      ReportName: 'Purchase_Journal_Voucher',
      SelectionFormula: `{PurchaseJournal_Voucher.PurchaseJournal_VNO} ='${this.savedPurchaseJournal.purchaseJournalVno}'`,
      Parameters: [],
      Queries: [],
      SP_Queries: [],
      ExportType: ExportFormatType.PortableDocFormat,
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, false)
      .subscribe((response: BlobPart) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);

      });
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
    .main {
      flex: 1;
      width: 80%;
      margin: auto;
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
      width: 49.5%;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 15px;
      padding-bottom: 30px;
      padding: 8px;
    }

    .payment2 {
      width: 49.5%;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 30px;
      padding-bottom: 30px;
      padding-left: 8px;
      margin-left: 10px;

    }
    .center{
      text-align: center;
    }
    #customers {
      font-family: Arial, Helvetica, sans-serif;
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

    .row {
      display: flex;
      flex-direction: row;
      gap: 120px;
      margin-left: 5px;
      align-items: center;
      /* Adjust alignment as needed */
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

    .page-footer {
      position: fixed;
      bottom: 0;
      width: 100%;
      visibility: hidden;
      border-top: 1px solid black;
    }

    .alignEnd {
      align-items: end;
    }

    .page {
      page-break-after: always;
    }

    @page {
      margin: 20mm
    }

    @media print {
      thead {
        display: table-header-group;
      }

      tfoot {
        display: table-footer-group;
      }

      button {
        display: none;
      }

      body {
        margin: 0;
      }

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
      padding-right: 18%;
    }

    .date b {
      margin-right: -24px; /* Adjust as needed */
    }
    .inflex{
       display: flex;
        justify-content: space-between;
        margin-bottom: 3px;
    }
    .space{
      margin-left: 3px;
      margin-right: 63px;  }
    .space1{
      margin-left: 57px;
      margin-right: 61px;
    }
    .main1{
      margin-left: 13%;
    }
        .rectImg {
height: 140px;
    width: 217px;
}

.squreImg {
  height: 145px;
  width: 145px;
}



    `;
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
  }
  savePurchaseJournal() {
    const savedData: Array<any> = this.purchasejournal_entry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    const purchaseJournal_Save: PurchaseJournal = this.purchaseJournalFormGroup
      .value as PurchaseJournal;
    purchaseJournal_Save.purchaseJournalVno =
      this.purchaseJournalFormGroup.getRawValue().purchaseJournalVno;
    purchaseJournal_Save.purchaseJournalId = Number(
      this.purchaseJournalFormGroup.value.purchaseJournalId
    );
    purchaseJournal_Save.purchaseJournalCrAmount =
      this.purchaseJournalFormGroup.value.purchaseJournalCrAmount;
    purchaseJournal_Save.purchaseJournalFcCrAmount =
      this.purchaseJournalFormGroup.value.purchaseJournalCrAmount;
    purchaseJournal_Save.purchaseJournalDrAmount =
      this.purchaseJournalFormGroup.value.purchaseJournalDrAmount;
    purchaseJournal_Save.purchaseJournalFcDrAmount =
      this.purchaseJournalFormGroup.value.purchaseJournalDrAmount;
    purchaseJournal_Save.purchaseJournalFsno = this.fsno;
    purchaseJournal_Save.purchaseJournalUserId = this.usrid;
    purchaseJournal_Save.purchaseJournalLocationId = this.locId;
    purchaseJournal_Save.purchaseJournalAllocId = '';
    purchaseJournal_Save.accountsTransactions = [];
    purchaseJournal_Save.purchaseJournalDetails = savedData
      ?.filter((k) => k.account != null && k.debit != null)
      .map((k: GridData) => {
        return {
          purchaseJournalDetailsId: k.id != null ? k.id : 0,
          purchaseJournalDetailsVno:
            this.purchaseJournalFormGroup.getRawValue().purchaseJournalVno,
          purchaseJournalId: 0,
          purchaseJournalDetailsAccNo: this.accountArray?.find(
            (x) => x.maAccName.trim() === k.account.trim()
          )?.maAccNo,
          purchaseJournalDetailsVatableAmount: k.vat,
          purchaseJournalDetailsDrAmount: k.debit,
          purchaseJournalDetailsFcDrAmount: k.debit,
          purchaseJournalDetailsCrAmount: k.credit,
          purchaseJournalDetailsFcCrAmount: k.credit,
          purchaseJournalDetailsJobNo:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label.trim() === k.jobname.trim())
                .value
              : -1,
          purchaseJournalDetailsCostCenterId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                (j) =>
                  j.costCenterMasterCostCenterName.trim() ===
                  k.costcenter.trim()
              ).costCenterMasterCostCenterId
              : null,
          purchaseJournalDetailsNarration: k.narration,
          purchaseJournalDetailsFsno: this.fsno,
          purchaseJournalDetailsLocationId: this.locId,
          purchaseJournalDetailsReferNo: k.refno,
          purchaseJournalDetailsDelStatus: false,
        };
      });

    purchaseJournal_Save.purchaseJournalDetails
      ?.filter((x) => x.purchaseJournalDetailsDelStatus === false)
      .forEach((element) => {
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: element.purchaseJournalDetailsAccNo,
          accountsTransactionsTransDate: this.f.purchaseJournalDate.value,
          accountsTransactionsParticulars:
            element.purchaseJournalDetailsNarration,
          accountsTransactionsDebit: element.purchaseJournalDetailsDrAmount,
          accountsTransactionsFcDebit: element.purchaseJournalDetailsDrAmount,
          accountsTransactionsCredit: element.purchaseJournalDetailsCrAmount,
          accountsTransactionsFcCredit: element.purchaseJournalDetailsCrAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo: element.purchaseJournalDetailsVno,
          accountsTransactionsDescription:
            element.purchaseJournalDetailsNarration,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsTransSno: 0,
          accountsTransactionsVatableAmount:
            element.purchaseJournalDetailsVatableAmount,
        };
        purchaseJournal_Save.accountsTransactions.push(debitData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(purchaseJournal_Save);
    } else {

      this.updateVoucher(purchaseJournal_Save);
    }
  }

  validateTotalDrCrAmounts(): boolean {
    if (
      this.purchaseJournalFormGroup.getRawValue().purchaseJournalCrAmount ==
      0 &&
      this.purchaseJournalFormGroup.getRawValue().purchaseJournalDrAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total Credit and Debit Amounts are Zero',
      });
      return false;
    }

    if (
      this.purchaseJournalFormGroup.getRawValue().purchaseJournalDrAmount == 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Total  Debit Amounts are Zero',
      });
      return false;
    }
    return true;
  }
  saveVoucher(purchaseJournal_Save: PurchaseJournal) {
    if (this.purchaseJournalFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.accountapi
              .InsertPurchaseJournal(purchaseJournal_Save)
              .subscribe(
                (data) => {
                  this.btnFlag = {
                    edit: true,
                    cancel: false,
                    save: false,
                    update: true,
                    delete: true,
                  };
                  this.savedPurchaseJournal = data.result;
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
      this.purchaseJournalFormGroup.markAllAsTouched();
      this.purchaseJournalFormGroup.markAsDirty();
    }
  }
  updateVoucher(purchaseJournal_Save: PurchaseJournal) {
    if (this.purchaseJournalFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.accountapi
              .UpdatePurchaseJournal(purchaseJournal_Save)
              .subscribe(
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
                    detail: 'Purchase Journal Updated Succesfully',
                  });
                },
                (err) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail: 'Purchase Journal Update Failed',
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
      this.purchaseJournalFormGroup.markAllAsTouched();
      this.purchaseJournalFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllPurchaseJournal() {
    this.accountapi.GetPurchaseJournal().subscribe((data) => {
      this.purchaseJournalarry = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo.trim() === acctnumber.trim()
    )?.maAccName;
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
            this.f.purchaseJournalCurrencyId.setValue(Number(this.DefCurrency));
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
    this.purchaseJournalFormGroup.reset();
    this.purchasejournal_entry.data = [];
    this.purchasejournal_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.purchasejournal_entry);
    this.accountTransactionList = [];
    this.purchaseJournalFormGroup.get('purchaseJournalId').setValue(null);
    //  this.purchaseJournalFormGroup.get('purchaseJournalAcNo').setValue(-1);
    this.purchaseJournalFormGroup.get('purchaseJournalCurrencyId').setValue(-1);
    this.purchaseJournalFormGroup
      .get('purchaseJournalDate')
      .setValue(new Date());
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    //this.getDefaultCurrency();
    this.defalutSetting();
    this.purchaseJournalFormGroup.enable();
    // this.f.purchaseJournalDetailsVno.clearValidators();
    this.purchaseJournalFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }
  defalutSetting() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m: any) => {
      let list = m.resultSet.generalSettings;
      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      if (HIDE_JOBCOST !== null) {
        var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
        if (jobcal == true) {
          this.JOBCOST = false;
          this.updateTableConfiguration();
        }
      }
      // currency

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.purchaseJournalCurrencyId.setValue(Number(this.DefCurrency));
        }
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
    this.getAllPurchaseJournal();
    this.displayMaximizable = true;
  }

  updateFormGrid(purchasejournal_update: PurchaseJournal) {
    this.savedPurchaseJournal = purchasejournal_update;
    this.purchaseJournalFormGroup.patchValue({
      purchaseJournalId: purchasejournal_update.purchaseJournalId,
      purchaseJournalVno: purchasejournal_update.purchaseJournalVno,
      purchaseJournalDate: new Date(purchasejournal_update.purchaseJournalDate),
      purchaseJournalRefNo: purchasejournal_update.purchaseJournalRefNo,
      // purchaseJournalAcNo: purchasejournal_update.purchaseJournalAcNo,
      purchaseJournalCrAmount: purchasejournal_update.purchaseJournalCrAmount,
      purchaseJournalFcCrAmount: purchasejournal_update.purchaseJournalCrAmount,
      purchaseJournalDrAmount: purchasejournal_update.purchaseJournalDrAmount,
      purchaseJournalFcDrAmount: purchasejournal_update.purchaseJournalDrAmount,
      purchaseJournalNarration: purchasejournal_update.purchaseJournalNarration,
      purchaseJournalCurrencyId:
        purchasejournal_update.purchaseJournalCurrencyId,
    });
    // this.currencyCtrol.nativeElement.value = this.currencyList?.find(k => k.value === purchasejournal_update.purchaseJournalCurrencyId).label;

    this.accountTransactionList = purchasejournal_update.accountsTransactions;
    const gridData: GridData[] =
      purchasejournal_update?.purchaseJournalDetails.map((k) => {
        const accountId: string | null =
          k.purchaseJournalDetailsAccNo != null
            ? this.accountArray?.find((l) =>
              l?.maAccNo.match(k.purchaseJournalDetailsAccNo)
            )?.maAccName
            : null;

        const jobId: string | null =
          k.purchaseJournalDetailsJobNo != null
            ? this.jobList?.find(
              (l) => l.value === k.purchaseJournalDetailsJobNo
            )?.label
            : null;

        const costCenterId: string | null =
          k.purchaseJournalDetailsCostCenterId != null
            ? this.costcenterArray?.find(
              (l) =>
                l.costCenterMasterCostCenterId ===
                k.purchaseJournalDetailsCostCenterId
            )?.costCenterMasterCostCenterName
            : null;

        return {
          account: accountId,
          vat: k.purchaseJournalDetailsVatableAmount,
          debit: k.purchaseJournalDetailsDrAmount,
          credit: k.purchaseJournalDetailsCrAmount,
          jobname: jobId,
          costcenter: costCenterId,
          narration: k.purchaseJournalDetailsNarration,
          refno: k.purchaseJournalDetailsReferNo,
          id: k.purchaseJournalDetailsId,
        };
      });
    this.purchasejournal_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.purchaseJournalFormGroup.disable();
    this.f.purchaseJournalVno.clearValidators();
    this.purchaseJournalFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }
  GetSavedPurchaseJournalDetails(id: string) {
    this.index = 0;
    this.accountapi.GetSavedPurchaseJournalDetails(id).subscribe(
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
          this.savedPurchaseJournal = data.result;
          this.purchaseJournalFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Purchase Journal not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.purchaseJournalFormGroup.updateValueAndValidity();
      }
    );
  }
  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.accountapi
          .DeletePurchaseJournal(this.savedPurchaseJournal)
          .subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Purchase Journal Deleted Succesfully',
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
    this.GetSavedPurchaseJournalDetails(
      this.purchaseJournalFormGroup.getRawValue().purchaseJournalVno
    );
  }
  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.purchaseJournalVno.clearValidators();
    this.purchaseJournalFormGroup.enable();
    this.purchaseJournalFormGroup.controls.purchaseJournalVno.disable();
    this.purchaseJournalFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.purchasejournal_entry.data.length > 0) {
      // this.purchasejournal_entry.data.forEach((value: GridData, index, arry) => {
      return Object.values(this.purchasejournal_entry.data).some(
        (k: GridData) =>
          k.account != null &&
          (k.debit != null || k.credit != null) &&
          !(k.debit == null && k.credit == null)
      );
      // });
    }
    return false;
  }

  selectaccount(evt) {
    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);

    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
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
}

export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value.trim() !== '') {
      return timer(time).pipe(
        switchMap(() => acctService.CheckVnoExistPurchaseJournal(input.value)),
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
export const ColumnList = (component: PurchasejournalComponent) => [
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
    readOnly: false,
    numericFormat: {
      pattern: '0,0.00',
    },
    width: 60,
  },
  {
    data: 'credit',
    type: 'numeric',
    label: 'Credit',
    toolTip: 'Credit Amount',
    readOnly: false,
    numericFormat: {
      pattern: '0,0.00',
    },
    width: 60,
  },
  {
    data: 'debit',
    type: 'numeric',
    label: 'Debit',
    toolTip: 'Debit Amount',
    readOnly: false,
    numericFormat: {
      pattern: '0,0.00',
    },
    width: 60,
  },
  {
    data: 'jobname',
    type: 'autocomplete',
    label: 'Job Name',
    toolTip: 'Job Name',
    source: component.jobArry,
    width: 150,
  },
  {
    data: 'costcenter',
    type: 'autocomplete',
    label: 'Cost Center',
    toolTip: 'Cost Center',
    source: component.costcenterArry,
    width: 60,
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    toolTip: 'Narration',
    readOnly: false,
    width: 180,
  },
  {
    data: 'vatno',
    type: 'text',
    label: 'VAT No',
    toolTip: 'VAT Number',
    readOnly: false,
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
    width: 60,
  },
];
