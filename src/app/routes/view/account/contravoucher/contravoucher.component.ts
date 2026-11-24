import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
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
import { ContraVoucher } from 'src/app/routes/domain/Accounts/ContraVoucher';
import { ContraVoucherDetails } from 'src/app/routes/domain/Accounts/ContraVoucherDetails';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { LoginService } from 'src/app/routes/service/login.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-contravoucher',
  templateUrl: './contravoucher.component.html',
  styleUrls: ['./contravoucher.component.scss'],
})
export class ContravoucherComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;

  confirmDropDatabaseDialogVisible = false;
  contraVoucherFilterForm: FormGroup;

  title: string;
  search: string;
  callDDLs: boolean = false;
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

  DefCurrency: string;
  DefCurCheck: string;
  date = new Date();

  DefLocation: string;
  DefLocationCheck: string;

  DefAcc: string;
  DefAccCheck: string;

  usrid: number;
  fsno: number;
  locId: number;

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

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  contraVoucherarry: ContraVoucher[] = [];
  // savedContraVoucherGridData: GridData[] = [];
  savedContraVoucher: ContraVoucher;
  displayPrintPreview: boolean = false;
  difference: number = null;
  ScreenId: number;
  Permission: any;
  filterArray: any;
  user: any;
  itemList = [];
  clickedRowColumn = { row: -1, column: -1 };

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private loginser: LoginService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private permission: PermissionsService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'contravoucher_HotEntry';
  contravoucher_entry: Handsontable.GridSettings;
  contraVoucherFormGroup: FormGroup;
  contravoucher_entryDataset = [];
  // accountTransactionDataset = [];
  ngAfterViewInit() {}
  vNo: string = '';

  ngOnInit(): void {
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

    this.initializeControls();
    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedContraVoucherDetails(this.vNo);
    }
    this.contraVoucherFormGroup = this.fb.group({
      contraVoucherId: [0],
      contraVoucherVno: [{ value: '', disabled: true }],
      contraVoucherDate: [null],
      contraVoucherRefNo: [''],
      contraVoucherAcNo: [-1],
      contraVoucherCrAmount: [null],
      contraVoucherDrAmount: [null],
      contraVoucherNarration: [''],
      contraVoucherCurrencyId: [-1],
    });
    this.contraVoucherFilterForm = this.fb.group({
      contraVoucherRefNo: [null],
      isDate: [],
      contraVoucherNo: [null],
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
    this.bykeys();
  }

  get f() {
    return this.contraVoucherFormGroup.controls;
  }
  updateTableConfiguration() {
    const hiddenColumns = [1, 7, 8, 9];
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
        const jobSetting = res.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        const costCenterSetting = res.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;
        setTimeout(() => {
          this.updateTableConfiguration();
        });
      });
  }
  initializeControls() {
    const hiddenColumns = [1, 4, 5, 7, 8, 9];

    this.contravoucher_entry = this.utilityService.getTableConfig(
      contraVoucherColumnList(this),
      hiddenColumns
    );
    this.contravoucher_entry.afterSelection = (row, column) => {
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

      if (column === 0 && this.contravoucher_entry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        hotInstance.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 4 && this.contravoucher_entry.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        hotInstance.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 5 && this.contravoucher_entry.readOnly === false) {
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
        this.selectItem = this.dataList.find((k) => k.account == x);
      } else {
        this.selectItem = {};
      }
    };

    this.contravoucher_entry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.contravoucher_entry.beforeChangeRender = (change, source) => {
      // const hotinstance = this.hotRegisterer.getInstance(this.hotid);

      // var data = hotinstance.getDataAtRow(change[0][0]);
      // if(data[4]){
      //   hotinstance.selectCell(5,0)
      // }
      const [rowIndex, colName, , newValue] = change[0]; // Destructure the change array
      this.ColumnSum(rowIndex, colName, newValue);
    };
    this.contravoucher_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.itemList.splice(index, 1);
      this.ColumnSum(index, '', amount);
      //this.ColumnSum();
    };

    this.contravoucher_entry.afterValidate = (isValid, value, row, prop) => {
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

    this.contravoucher_entry.data.forEach((elemt: any, index: number) => {
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
    this.contraVoucherFormGroup.controls.contraVoucherDrAmount.setValue(value);
    this.contraVoucherFormGroup.controls.contraVoucherCrAmount.setValue(value1);
    this.difference = value1 - value;
    this.difference = parseFloat(this.difference.toFixed(2));
  }

  displayPrint() {
    this.displayPrintPreview = true;
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
  LoadCurruncyDDL() {
    this.accountapi.LoadDropdowCurrencyMaster().subscribe((m) => {
      //currency
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
        value1: kl.currencyMasterCurrencyRate,
      }));
      this.currencyList.unshift({ label: '--Select--', value: -1 });
      this.currArry = m.resultSet.currencyMasters?.map((ar) =>
        ar.currencyMasterCurrencyName.trim()
      );
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
      this.acctArry = m.resultSet.masterAccountsTables.map(
        (ar) => ar.maAccName.trim() + '|' + ar.maAccNo
      );
    });
  }
  userTrackingLog(type) {
    let req = {
      page: 'Contra Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.contraVoucherFormGroup.get('contraVoucherVno').value,
      vpType: 'Contra Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
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
  padding-top:10px;
margin-top:10px;
  position:fixed  ;
  bottom: 0;
  width: 100%;
  visibility: visible;
  border-top: 1px solid black;
}
.space{
  margin-left: 111px;
  margin-right: 30px;;
  }
.space1{
  margin-left: 76px;
  margin-right: 30px;
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
    this.printService.PrintPDF('print', css);
    this.userTrackingLog('PDF');
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
    return this.jobArray.map((kl) => ({
      account: kl.jobMasterJobName,
      accountId: kl.jobMasterJobId,
    }));
  }

  get costSetLookup() {
    return this.costcenterArray.map((kl) => ({
      account: kl.costCenterMasterCostCenterName,
      accountId: kl.costCenterMasterCostCenterId,
    }));
  }

  saveContraVoucher() {
    if (this.difference == 0) {
      const savedData: any = this.contravoucher_entry.data?.filter((k) =>
        k.hasOwnProperty('account')
      );
      const contraVoucher_Save: ContraVoucher = this.contraVoucherFormGroup
        .value as ContraVoucher;
      contraVoucher_Save.contraVoucherVno =
        this.contraVoucherFormGroup.getRawValue().contraVoucherVno;
      contraVoucher_Save.contraVoucherId =
        this.contraVoucherFormGroup.value.contraVoucherId != null
          ? parseInt(this.contraVoucherFormGroup.value.contraVoucherId)
          : 0;
      contraVoucher_Save.contraVoucherCrAmount =
        this.contraVoucherFormGroup.value.contraVoucherCrAmount;
      contraVoucher_Save.contraVoucherFcCrAmount =
        this.contraVoucherFormGroup.value.contraVoucherCrAmount;
      contraVoucher_Save.contraVoucherDrAmount =
        this.contraVoucherFormGroup.value.contraVoucherDrAmount;
      contraVoucher_Save.contraVoucherFcDrAmount =
        this.contraVoucherFormGroup.value.contraVoucherDrAmount;
      contraVoucher_Save.contraVoucherFsno = this.fsno;
      contraVoucher_Save.contraVoucherUserId = this.usrid;
      contraVoucher_Save.contraVoucherLocationId = this.locId;
      contraVoucher_Save.contraVoucherAllocId = '';

      contraVoucher_Save.contraVoucherDetails = savedData
        ?.filter((k) => k.account != null)
        .map((k: GridData) => {
          return {
            contraVoucherDetailsId: k.id != null ? k.id : 0,
            contraVoucherDetailsVno:
              this.contraVoucherFormGroup.getRawValue().contraVoucherVno,
            contraVoucherId:
              this.contraVoucherFormGroup.getRawValue().contraVoucherId != null
                ? this.contraVoucherFormGroup.getRawValue().contraVoucherId
                : 0,
            contraVoucherDetailsAccNo: this.accountArray.find(
              (x) => x.maAccName.trim() === k.account.trim()
            )?.maAccNo,
            // contraVoucherDetailsAccNo :  k.account.trim().split('|')[1] ,
            contraVoucherDetailsVatableAmount: k.vat,
            contraVoucherDetailsDrAmount: k.debit != null ? k.debit : 0,
            contraVoucherDetailsFcDrAmount: k.debit != null ? k.debit : 0,
            contraVoucherDetailsCrAmount: k.credit != null ? k.credit : 0,
            contraVoucherDetailsFcCrAmount: k.credit != null ? k.credit : 0,
            contraVoucherDetailsJobNo:
              k.jobname != null && k.jobname !== ''
                ? this.jobArray.find(
                    (j) => j.jobMasterJobName.trim() === k.jobname.trim()
                  ).jobMasterJobId
                : null,
            contraVoucherDetailsCostCenterId:
              k.costcenter != null && k.costcenter !== ''
                ? this.costcenterArray.find(
                    (j) =>
                      j.costCenterMasterCostCenterName.trim() ===
                      k.costcenter.trim()
                  ).costCenterMasterCostCenterId
                : null,
            contraVoucherDetailsNarration: k.narration,
            contraVoucherDetailsFsno: this.fsno,
            contraVoucherDetailsLocationId: this.locId,
            contraVoucherDetailsDelStatus: false,
          };
        });

      contraVoucher_Save.accountsTransactions = [];
      // const creditData: AccountsTransactions = {
      //   accountsTransactionsAccNo: this.f.contraVoucherAcNo.value,
      //   accountsTransactionsTransDate: this.f.contraVoucherDate.value,
      //   accountsTransactionsParticulars: this.f.contraVoucherNarration.value,
      //   accountsTransactionsCredit: this.f.contraVoucherDrAmount.value,
      //   accountsTransactionsFcCredit: this.f.contraVoucherDrAmount.value,
      //   accountsTransactionsVoucherType: null,
      //   accountsTransactionsUserId: this.usrid,
      //   accountsTransactionsFsno: this.fsno,
      //   accountsTransactionsTstamp: new Date(),
      //   accountsTransactionsVoucherNo: this.contraVoucherFormGroup.getRawValue().contraVoucherVno,
      //   accountsTransactionsDescription: this.f.contraVoucherNarration.value,
      //   accountsTransactionsStatus: null,
      //   accountstransactionsDelStatus: false
      // };
      // contraVoucher_Save.accountsTransactions.push(creditData);
      contraVoucher_Save.contraVoucherDetails
        ?.filter((x) => x.contraVoucherDetailsDelStatus === false)
        .forEach((element) => {
          const debitData: AccountsTransactions = {
            accountsTransactionsAccNo: element.contraVoucherDetailsAccNo,
            accountsTransactionsTransDate: this.f.contraVoucherDate.value,
            accountsTransactionsParticulars:
              element.contraVoucherDetailsNarration,
            accountsTransactionsDebit: element.contraVoucherDetailsDrAmount
              ? element.contraVoucherDetailsDrAmount
              : 0,
            accountsTransactionsFcDebit: element.contraVoucherDetailsDrAmount,
            accountsTransactionsCredit: element.contraVoucherDetailsCrAmount
              ? element.contraVoucherDetailsCrAmount
              : 0,
            accountsTransactionsFcCredit: element.contraVoucherDetailsCrAmount,
            accountsTransactionsVoucherType: null,
            accountsTransactionsTstamp: new Date(),
            accountsTransactionsUserId: this.usrid,
            accountsTransactionsFsno: this.fsno,
            accountsTransactionsVoucherNo: element.contraVoucherDetailsVno,
            accountsTransactionsDescription:
              element.contraVoucherDetailsNarration,
            accountsTransactionsStatus: null,
            accountstransactionsDelStatus: false,
            accountsTransactionsJobNo: element.contraVoucherDetailsJobNo,
          };
          contraVoucher_Save.accountsTransactions.push(debitData);
        });

      if (this.btnFlag.save) {
        this.saveVoucher(contraVoucher_Save);
      } else {
        contraVoucher_Save.accountsTransactions
          ?.filter((x) => x.accountsTransactionsDebit > 0)
          .forEach((element, index, arry) => {
            const acctTransEntry: AccountsTransactions =
              this.savedContraVoucher.accountsTransactions
                ?.filter((x) => x.accountsTransactionsDebit > 0)
                .find(
                  (kl) =>
                    kl.accountsTransactionsVoucherNo ===
                      arry[index].accountsTransactionsVoucherNo &&
                    kl.accountsTransactionsAccNo ===
                      arry[index].accountsTransactionsAccNo
                );
            if (acctTransEntry) {
              arry[index].accountsTransactionsTransSno =
                acctTransEntry.accountsTransactionsTransSno;
              arry[index].accountsTransactionsStatus =
                acctTransEntry.accountsTransactionsStatus;
              arry[index].accountsTransactionsVoucherType =
                acctTransEntry.accountsTransactionsVoucherType;
            }
          });

        contraVoucher_Save.accountsTransactions
          ?.filter((x) => x.accountsTransactionsCredit > 0)
          .forEach((element, index, arry) => {
            const acctTransEntry: AccountsTransactions =
              this.savedContraVoucher.accountsTransactions
                ?.filter((x) => x.accountsTransactionsCredit > 0)
                .find(
                  (kl) =>
                    kl.accountsTransactionsVoucherNo ===
                      arry[index].accountsTransactionsVoucherNo &&
                    kl.accountsTransactionsAccNo ===
                      arry[index].accountsTransactionsAccNo
                );
            if (acctTransEntry) {
              arry[index].accountsTransactionsTransSno =
                acctTransEntry.accountsTransactionsTransSno;
              arry[index].accountsTransactionsStatus =
                acctTransEntry.accountsTransactionsStatus;
              arry[index].accountsTransactionsVoucherType =
                acctTransEntry.accountsTransactionsVoucherType;
            }
          });

        this.updateVoucher(contraVoucher_Save);
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

  saveVoucher(contraVoucher_Save: ContraVoucher) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to save voucher?',
      accept: () => {
        this.accountapi.InsertContraVoucher(contraVoucher_Save).subscribe(
          (data: any) => {
            if (data.valid) {
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
              this.savedContraVoucher = data.result;
              this.updateFormGrid(data.result);
              this.userTrackingLog('Insert');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Contra Voucher Saved Succesfully',
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
              detail: 'Contra Voucher Save Failed',
            });
          }
        );
      },
    });
  }

  updateVoucher(contraVoucher_Save: ContraVoucher) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to update existing voucher?',
      accept: () => {
        this.accountapi.UpdateContraVoucher(contraVoucher_Save).subscribe(
          (data: any) => {
            if (data.valid) {
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
              this.savedContraVoucher = data.result;

              this.updateFormGrid(data.result);
              this.userTrackingLog('Update');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Contra Voucher Updated Succesfully',
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
              detail: 'Contra Voucher Update Failed',
            });
          }
        );
      },
    });
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllContraVoucher() {
    this.accountapi.GetContraVoucher().subscribe((data) => {
      this.contraVoucherarry = data.result;
      this.filterArray = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray.find((j) => j.maAccNo.trim() === acctnumber.trim())
      ?.maAccName;
  }

  new() {
    this.itemList = [];
    this.callDropdowns();
    this.contraVoucherFormGroup.reset();
    this.contravoucher_entry.data = [];
    //  this.hotRegisterer.getInstance(this.hotid).updateSettings({readOnly: false});
    this.contravoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.contravoucher_entry);
    //  this.contravoucher_entry.data.splice(0 , this.contravoucher_entry.data.length);
    //  this.hotRegisterer.getInstance(this.hotid).clear();
    //  this.hotRegisterer.getInstance(this.hotid).selectCell(0, 0);
    this.accountTransactionList = [];
    this.contraVoucherFormGroup.get('contraVoucherId').setValue(null);

    this.contraVoucherFormGroup.get('contraVoucherDate').setValue(new Date());
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
          this.f.contraVoucherCurrencyId.setValue(Number(this.DefCurrency));
        }
      }
    });
  }

  showMaximizableDialog() {
    this.getAllContraVoucher();
    this.displayMaximizable = true;
  }

  updateFormGrid(contravoucher_update: ContraVoucher) {
    this.contraVoucherFormGroup.patchValue({
      contraVoucherId: contravoucher_update.contraVoucherId,
      contraVoucherVno: contravoucher_update.contraVoucherVno,
      contraVoucherDate: new Date(contravoucher_update.contraVoucherDate),
      contraVoucherRefNo: contravoucher_update.contraVoucherRefNo,
      contraVoucherAcNo: contravoucher_update.contraVoucherAcNo,
      contraVoucherCrAmount: contravoucher_update.contraVoucherCrAmount,
      contraVoucherFcCrAmount: contravoucher_update.contraVoucherCrAmount,
      contraVoucherDrAmount: contravoucher_update.contraVoucherDrAmount,
      contraVoucherFcDrAmount: contravoucher_update.contraVoucherDrAmount,
      contraVoucherNarration: contravoucher_update.contraVoucherNarration,
      contraVoucherCurrencyId: contravoucher_update.contraVoucherCurrencyId,
    });
    // this.currencyCtrol.nativeElement.value = this.currencyList.find(k => k.value === contravoucher_update.contraVoucherCurrencyId).label;
    // this.accountCtrol.nativeElement.value = this.accountArray
    //                                         .find(k => k.masterAccountsTableAccNo === contravoucher_update.contraVoucherAcNo)maAccNo;

    this.accountTransactionList = contravoucher_update.accountsTransactions;
    // this.jobArray.find(j => j.jobMasterJobName.trim()  === k.jobname.trim()).jobMasterId,
    const gridData: GridData[] = contravoucher_update.contraVoucherDetails.map(
      (k) => {
        // const  accountId: string = k.contraVoucherDetailsAccNo != null ? this.acctArry.find(l => l.match(k.contraVoucherDetailsAccNo)) : null;
        const accountId: string =
          k.contraVoucherDetailsAccNo != null
            ? this.accountArray.find((l) =>
                l.maAccNo.match(k.contraVoucherDetailsAccNo)
              )?.maAccName
            : null;

        // const jobId: string = (k.contraVoucherDetailsJobNo != null) ? this.jobArry.find(l =>
        //   l.match(k.contraVoucherDetailsJobNo.toString())) : null;

        const costCenterId: string =
          k.contraVoucherDetailsCostCenterId != null
            ? this.costcenterArry.find((l) =>
                l.match(k.contraVoucherDetailsCostCenterId.toString())
              )
            : null;

        const jobId: string =
          k.contraVoucherDetailsJobNo != null
            ? this.jobList.find((l) => l.value == k.contraVoucherDetailsJobNo)
                .label
            : null;

        return {
          account: accountId,
          vat: k.contraVoucherDetailsVatableAmount,
          debit: k.contraVoucherDetailsDrAmount,
          credit: k.contraVoucherDetailsCrAmount,
          jobname: jobId,
          costcenter: costCenterId,
          narration: k.contraVoucherDetailsNarration,
          id: k.contraVoucherDetailsId,
        };
      }
    );
    this.contravoucher_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.contravoucher_entry.readOnly = true;
    this.difference = 0;
    this.contraVoucherFormGroup.disable();
    this.f.contraVoucherVno.clearValidators();
    this.contraVoucherFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }
  callDropdowns() {
    if (!this.callDDLs) {
      this.LoadJobDDL();
      this.LoadCurruncyDDL();
      this.LoadCostCenterDDL();
      this.LoadChartOfAccountDDL();
      this.callDDLs = true;
    }
  }
  LoadJobDDL() {
    this.accountapi.LoadDropdowjobMasters().subscribe((m) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
    });
  }

  LoadCostCenterDDL() {
    this.accountapi.LoadDropdowncostcenterMasters().subscribe((m) => {
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
    });
  }
  GetSavedContraVoucherDetails(id: string) {
    this.index = 0;
    this.callDropdowns();
    this.accountapi.GetSavedContraVoucherDetails(id).subscribe(
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
          this.savedContraVoucher = data.result;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Contra not found',
          });
        }
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
        this.accountapi.DeleteContraVoucher(this.savedContraVoucher).subscribe(
          (data) => {
            this.userTrackingLog('Delete');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Contra Voucher Deleted Succesfully',
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
    this.contraVoucherFormGroup.reset();
    this.new();
    // this.GetSavedContraVoucherDetails(
    //   this.contraVoucherFormGroup.getRawValue().contraVoucherVno
    // );
  }

  edit() {
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
    this.contravoucher_entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.contravoucher_entry);
    this.f.contraVoucherVno.clearValidators();
    this.contraVoucherFormGroup.enable();
    this.contraVoucherFormGroup.controls.contraVoucherVno.disable();
    this.contraVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.contravoucher_entry.data.length > 0) {
      // this.paymentvoucherentry.data.forEach((value: GridData, index, arry) => {
      // console.log(Object.values(this.contravoucher_entry.data));
      return Object.values(this.contravoucher_entry.data).some(
        (k: GridData) => k.account != null && k.vat != null
      );
      // });
    }
    return false;
  }

  selectaccount(evt) {
    if (this.itemList.includes(evt.accountId)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Duplicate Entry',
        detail: `${evt.account} is already exists in this table`,
      });
      return;
    }

    if (this.clickedRowColumn.column == 0)
      this.itemList[this.clickedRowColumn.row] = evt.accountId;

    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
    this.hotRegisterer
      .getInstance(this.hotid)
      .selectCell(this.activeRow.row, 2);
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
    return this.currencyList?.find((k) => k.value === id).label;
  }

  filter() {
    let filteredArray = this.filterArray;
    if (this.contraVoucherFilterForm.value.contraVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.contraVoucherVno ===
          this.contraVoucherFilterForm.value.contraVoucherNo.toUpperCase()
      );
    }

    if (
      this.contraVoucherFilterForm.value.contraVoucherRefNo != null &&
      this.contraVoucherFilterForm.value.contraVoucherRefNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.contraVoucherRefNo ===
          this.contraVoucherFilterForm.value.contraVoucherRefNo
      );
    }

    if (this.contraVoucherFilterForm.value.isDate) {
      const fromDateStr = this.contraVoucherFilterForm.value.fromDate;
      const toDateStr = this.contraVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.contraVoucherDate);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });
      this.contraVoucherarry = filteredArray;
    }
    this.contraVoucherarry = filteredArray;
  }

  ClearFilter() {
    this.contraVoucherFilterForm.reset();
    this.contraVoucherarry = this.filterArray;
    this.contraVoucherFilterForm.get('fromDate').setValue(new Date());
    this.contraVoucherFilterForm.get('toDate').setValue(new Date());
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
export const contraVoucherColumnList = (component: any) => [
  {
    data: 'account',
    type: 'autocomplete',
    label: 'Account',
    toolTip: 'Account',
  },
  {
    data: 'vat',
    type: 'numeric',
    label: 'Vat',
    toolTip: 'Vat',
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
    data: 'debit',
    type: 'numeric',
    label: 'Debit',
    readOnly: false,
    toolTip: 'Debit',
    width: 80,
  },
  {
    data: 'jobname',
    type: 'autocomplete',
    label: 'Job Name',
    toolTip: 'Job Name',
  },
  {
    data: 'costcenter',
    type: 'autocomplete',
    label: 'Cost Center',
    toolTip: 'Cost Center',
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
    data: 'vatno',
    type: 'text',
    label: 'Vat No',
    toolTip: 'Vat No',
  },
  {
    data: 'refno',
    type: 'text',
    label: 'Ref No',
    toolTip: 'Ref No',
    width: 80,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'Id',
    toolTip: 'Id',
    width: 80,
  },
];
