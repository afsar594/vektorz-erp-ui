// import { JournalInvoiceMaster } from './../../../domain/JounralInvoiceMaster';
// import { JournalInvoiceDetails } from './../../../domain/JournalInvoiceDetails';
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
//import {  JournalInvoiceMaster, JournalInvoiceDetails } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
// import { ChartofAccounts,SupplierMaster} from 'src/app/routes/domain/Masters'
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { JournalInvoiceMaster } from 'src/app/routes/domain/Accounts/JounralInvoiceMaster';
import { JournalInvoiceDetails } from 'src/app/routes/domain/Accounts/JournalInvoiceDetails';
import { ChartofAccounts } from 'src/app/routes/domain/Masters/ChartofAccounts';
import { SupplierMaster } from 'src/app/routes/domain/Masters/SupplierMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-journalinvoice',
  templateUrl: './journalinvoice.component.html',
  styleUrls: ['./journalinvoice.component.scss'],
})
export class JournalinvoiceComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('suppCtrl', { static: false }) supplierCtrol: ElementRef;

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

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  supplierArray: SupplierMaster[] = [];
  supplierList: SelectItem[];
  supplierArry: string[] = [];
  SupplierRefAcno: String;
  JOBCOST: boolean = true;
  // costcenterArray: CostCenterMaster[] = [];
  // costcenterList: SelectItem[] = [];
  // costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  journalInvoicearry: JournalInvoiceMaster[] = [];
  // savedPaymentVoucherGridData: GridData[] = [];
  savedJournalInvoice: JournalInvoiceMaster;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'journalInvoiceEntry';
  ScreenId: number;
  Permission: any;
  loadList: any;
  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    private utilityService: UtilityService,

  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  journalinvoiceentry: Handsontable.GridSettings;
  journalInvoicerMasterFormGroup: FormGroup;
  // accountTransactionDataset = [];

  cols;
  ngAfterViewInit() { }
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Journal Invoice') {
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
      { field: 'JournalInvoiceMasterNo', header: 'Invoice No' },
      { field: 'JournalInvoiceMasterDate', header: 'Date' },
      { field: 'JournalInvoiceMasterSupplierId: ', header: 'Supplier' },
      { field: 'JournalInvoiceMasterCurrencyId', header: 'Currency' },
      // { field: 'JournalInvoiceMasterDrAmount', header: 'Vchr.Debit' },
      // { field: 'JournalInvoiceMasterCrAmount', header: 'Vchr.Credit' },
      { field: 'JournalInvoiceMasterNarration', header: 'Particulars' },
      // { field: 'JournalInvoiceMasterDrAmount', header: 'Dtls.Debit' },
      // { field: 'JournalInvoiceMasterCrAmount', header: 'Dtls.Credit' }
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.journalInvoicerMasterFormGroup = this.fb.group({
      // receiptVoucherSno: [null],
      // receiptVoucherVoucherNo: [{ value: null, disabled: true }],
      // receiptVoucherDate: [null],
      // receiptVoucherVoucherRef: [''],
      // receiptVoucherCrAcNo: [-1],
      // receiptVoucherCrAmount: [null],
      // receiptVoucherDbAmount: [null],
      // receiptVoucherNarration: [''],
      // receiptVoucherCurreReceiptVoucherMasterVoucherDatencyId: [-1],

      journalInvoiceMasterID: [null],
      journalInvoiceMasterInvoiceNo: [{ value: null, disabled: true }],
      journalInvoiceMasterDate: [null, [Validators.required]],
      journalInvoiceMasterRefNo: ['', [Validators.required]],
      journalInvoiceMasterDbAmount: [null],
      journalInvoiceMasterSupplierId: [-1, [DropDownValidator]],
      journalInvoiceMasterNarration: ['', [Validators.required]],
      journalInvoiceMasterCurrencyId: [-1, [DropDownValidator]],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
  }
  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id).label;
  }

  public getSupplier(id): string {
    return this.supplierList?.find((k) => k.value === id).label;
  }

  get f() {
    return this.journalInvoicerMasterFormGroup.controls;
  }
  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.LoadJobDDL();
    this.LoadCurrancyDDL();
    this.LoadSupplierDDL();
    this.defalutSetting();
    this.getAllAccount();
  }


  LoadCurrancyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.currencyMasters) {
        this.currencyList = this.loadList.currencyMasters.map((kl: any) => ({
          label: kl.currencyMasterCurrencyName,
          value: kl.currencyMasterCurrencyId,
        }));
        this.currencyList.unshift({
          label: '--Select Currency--',
          value: -1,
        });
        this.currArry = this.loadList.currencyMasters.map((ar: any) =>
          ar.currencyMasterCurrencyName?.trim()
        );
      }
    });
  }

  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.jobMasters) {
        this.jobArray = this.loadList.jobMasters;
        this.jobList = this.loadList.jobMasters.map((kl: any) => ({
          label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
          value: kl.jobMasterJobId,
        }));
        this.jobList.unshift({ label: '--Select Job--', value: -1 });
        this.jobArry = this.loadList.jobMasters.map((ar) =>
          ar.jobMasterJobName?.trim()
        );
      }
    });
  }

  LoadSupplierDDL() {
    this.utilityService.LoadDropdownSuppliersMaster().subscribe((r: any) => {
      this.loadList = r.resultSet;
      if (this.loadList.suppliersMaster) {

        this.supplierList = this.loadList.suppliersMaster.map(
          (kl: any) => ({
            label: kl.suppliersMasterSupplierName,
            value: kl.suppliersMasterSupplierId,
          })
        );
        this.supplierList.unshift({
          label: '--Select Supplier--',
          value: -1,
        });
        this.supplierArry = this.loadList.suppliersMaster.map(
          (ar: any) =>
            ar.suppliersMasterSupplierName?.trim() +
            '|' +
            ar.suppliersMasterSupplierId
        );
      }
    });
  }




  initializeControls() {

    let cols = jounalInviceColumnList(this);

    let hiddenColumn = [5];

    this.journalinvoiceentry = this.utilityService.getTableConfig(
      cols,
      hiddenColumn
    );
    this.journalinvoiceentry.afterSelection = (
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

      if (column === 0) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 4) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      }
      // else if (column === 5) {
      //   this.lookupGridColumns = ['Cost Center', 'Cost Center ID'];
      //   this.dataList = this.costSetLookup;
      // const hot = this.hotRegisterer.getInstance(this.hotid);
      // hot.deselectCell();
      //   this.showAccountLookUp = true;
      //   this.activeRow = {row, column};
      // }
      else {
        this.showAccountLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.account == x);
      } else {
        this.selectItem = {};
      }
    };

    this.journalinvoiceentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.journalinvoiceentry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.journalinvoiceentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.journalinvoiceentry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  openSupplier() {
    this.control = this.f.journalInvoiceMasterSupplierId;
    this.elementReference = this.supplierCtrol;
    this.lookupGridColumns = ['Supplier', 'Supplier ID'];
    this.formControlLookUp = true;
    this.selectItem = {
      account: this.supplierCtrol.nativeElement.value,
      accountId: this.f.journalInvoiceMasterSupplierId.value,
    };
    this.dataList = this.supplierSetLookup;
  }

  ColumnSum() {
    let sum = 0
    if (this.journalinvoiceentry.data.length > 0) {
      this.journalinvoiceentry.data
        ?.forEach((item: any) => {
          if (item.amount != null) {
            sum += item.amount;
          }

        })

    }
    this.journalInvoicerMasterFormGroup.controls.journalInvoiceMasterDbAmount.setValue(sum);
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }




  onSupplierChange(event) {
    console.log(event);
    this.supplierArray
      ?.filter((k) => k.suppliersMasterSupplierId == Number(event.value))
      .map((item) => ({
        SupplierRefAcno: item.suppliersMasterSupplierReffAcNo,
      }));
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result
        ?.filter((v) => v.maRelativeNo?.trim() === 'AS11')
        .map((kl) => ({ label: kl.maAccName, value: kl.maAccNo }));
      // this.accountList.unshift({label : '--Select--', value: -1});
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

  get supplierSetLookup() {
    return this.supplierList.map((kl) => ({
      account: kl.label,
      supplierId: kl.value,
    }));
  }


  get jobSetLookup() {

    return this.jobArray.map((kl) => ({
      account: kl.jobMasterJobName,
      accountId: kl.jobMasterJobId,
    }));
  }

  saveJournalVoucher() {
    const savedData: any = this.journalinvoiceentry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    const JournInvoice: JournalInvoiceMaster = this
      .journalInvoicerMasterFormGroup.value as JournalInvoiceMaster;
    JournInvoice.journalInvoiceMasterNo =
      this.journalInvoicerMasterFormGroup.getRawValue().journalInvoiceMasterInvoiceNo;
    JournInvoice.journalInvoiceMasterDate =
      this.journalInvoicerMasterFormGroup.getRawValue().journalInvoiceMasterDate;
    JournInvoice.journalInvoiceMasterRefNo =
      this.journalInvoicerMasterFormGroup.getRawValue().journalInvoiceMasterRefNo;
    JournInvoice.journalInvoiceMasterSupplierId =
      this.journalInvoicerMasterFormGroup.getRawValue().journalInvoiceMasterSupplierId;
    JournInvoice.journalInvoiceMasterNarration =
      this.journalInvoicerMasterFormGroup.getRawValue().journalInvoiceMasterNarration;
    JournInvoice.journalInvoiceMasterCurrencyId =
      this.journalInvoicerMasterFormGroup.getRawValue().journalInvoiceMastercourrencyID;

    JournInvoice.journalInvoiceDetails = savedData
      ?.filter((k) => k.account != null && k.amount != null)
      .map((k: GridData) => {
        return {
          JournalInvoiceDetails: k.id != null ? k.id : 0,
          journalInvoiceDetailsNo:
            this.journalInvoicerMasterFormGroup.getRawValue()
              .journalInvoiceMasterNo,
          journalInvoiceDetailsAccNo: this.accountArray?.find(
            (x) => x.maAccName?.trim() === k.account?.trim()
          ).maAccNo,
          journalInvoiceDetailsRefNo: null,
          journalInvoiceDetailsAmount: k.amount,
          journalInvoiceDetailsRemarks: k.remarks,
          journalInvoiceDetailsSlNo: 0,
          journalInvoiceDetailsJobId:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                .value
              : -1,
          journalInvoiceDetailsIsEdit: false,
          journalInvoiceDetailsDelStatus: false,
        };
      });

    JournInvoice.accountsTransactions = [];
    const creditData: AccountsTransactions = {
      accountsTransactionsAccNo: this.SupplierRefAcno.toString(),
      accountsTransactionsTransDate: this.f.journalInvoiceMasterDate.value,
      accountsTransactionsParticulars:
        this.f.journalInvoiceMasterNarration.value,
      accountsTransactionsCredit: this.f.journalInvoiceMasterDbAmount.value,
      accountsTransactionsFcCredit: this.f.journalInvoiceMasterDbAmount.value,
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.journalInvoicerMasterFormGroup.getRawValue()
          .journalInvoiceMasterNo,
      accountsTransactionsDescription:
        this.f.ReceiptVoucherMasterNarration.value,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
    };
    JournInvoice.accountsTransactions.push(creditData);
    // console.log('RcpVcher Details',JournInvoice.receiptVoucherDetails)
    // console.log('JournInvoice-receiptVoucherDetails',JournInvoice.receiptVoucherDetails.
    // filter(x => x.ReceiptVoucherDetailsDelStatus === false));
    JournInvoice.journalInvoiceDetails
      ?.filter((x) => x.journalInvoiceDetailsDelStatus === false)
      .forEach((element) => {
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: element.journalInvoiceDetailsAccNo,
          accountsTransactionsTransDate: this.f.journalInvoiceMasterDate.value,
          accountsTransactionsParticulars: element.journalInvoiceDetailsRemarks,
          accountsTransactionsDebit: element.journalInvoiceDetailsAmount,
          accountsTransactionsFcDebit: element.journalInvoiceDetailsAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo: this.f.journalInvoiceMasterNo.value,
          accountsTransactionsDescription: element.journalInvoiceDetailsRemarks,
          accountsTransactionsStatus: null,
          accountstransactionsDelStatus: false,
        };
        JournInvoice.accountsTransactions.push(creditData);
      });
    // console.log('JournInvoice',JournInvoice);
    if (this.btnFlag.save) {
      this.saveVoucher(JournInvoice);
    } else {

      this.updateVoucher(JournInvoice);
    }
  }
  saveVoucher(JournInvoice: JournalInvoiceMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to save Journal Invoice?',
      accept: () => {
        this.accountapi.InsertReceiptVoucher(JournInvoice).subscribe(
          (data) => {
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.updateFormGrid(data.result);
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Journal Invoice Saved Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Journal Invoice Save Failed',
            });
          }
        );
      },
    });
  }
  updateVoucher(JournInvoice: JournalInvoiceMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to update existing Invoice?',
      accept: () => {
        this.accountapi.UpdatePaymentVoucher(JournInvoice).subscribe(
          (data) => {
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.updateFormGrid(data.result);
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Journal Invoice Updated Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Journal Invoice Update Failed',
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

  getAllReceiptVouchrs() {
    this.accountapi.GetJournalVoucher().subscribe((data: any) => {
      this.journalInvoicearry = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    ).maAccName;
  }

  new() {
    this.journalInvoicerMasterFormGroup.reset();
    this.journalinvoiceentry.data = [];
    this.journalinvoiceentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.journalinvoiceentry);

    this.accountTransactionList = [];
    this.journalInvoicerMasterFormGroup
      .get('JournalInvoiceMasterInvoiceNo')
      ?.setValue(null);
    this.journalInvoicerMasterFormGroup
      .get('JournalInvoiceMasterSupplierId')
      ?.setValue(-1);
    this.journalInvoicerMasterFormGroup
      .get('JournalInvoiceMasterCurrencyId')
      ?.setValue(-1);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.callDropdowns();
  }
  defalutSetting() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail,Hide_CostCenter_Detail')
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );

        this.JOBCOST = jobSetting?.programSettingsBoolValue ?? false;

        setTimeout(() => {
          this.updateTableConfiguration();
        }, 1000);
      });
  }

  updateTableConfiguration() {
    const hiddenColumns = [5]; // Hide itemId, partNo, amt, vatPer, costcenter, id, conversionType, jobid
    if (this.JOBCOST) {
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
    this.callDropdowns()
    this.getAllReceiptVouchrs();
    this.displayMaximizable = true;
  }

  updateFormGrid(Journ: JournalInvoiceMaster) {
    this.search = null;
    this.journalInvoicerMasterFormGroup.patchValue({
      JournalInvoiceMasterInvoiceNo: Journ.journalInvoiceMasterNo,
      JournalInvoiceMasterDate: Journ.journalInvoiceMasterDate,
      JournalInvoiceMasterRefNo: Journ.journalInvoiceMasterRefNo,
      JournalInvoiceMasterSupplierId: Journ.journalInvoiceMasterSupplierId,
      JournalInvoiceMasterNarration: Journ.journalInvoiceMasterNarration,
      JournalInvoiceMasterCurrencyId: Journ.journalInvoiceMasterCurrencyId,
    });
    this.supplierCtrol.nativeElement.value = this.supplierList?.find(
      (k) => k.value === Journ.journalInvoiceMasterSupplierId
    ).label;

    this.accountTransactionList = Journ.accountsTransactions;
    // this.jobArray?.find(j => j.jobMasterJobName?.trim()  === k.jobname?.trim()).jobMasterId,
    const gridData: GridData[] = Journ.journalInvoiceDetails.map((k) => {
      // let  accountId: string = k.journalInvoiceDetailsAccNo != null ? this.acctArry?.find(l => l.match(k.journalInvoiceDetailsAccNo)) : null;
      const accountId: string =
        k.journalInvoiceDetailsAccNo != null
          ? this.accountArray?.find((l) =>
            l.maAccNo.match(k.journalInvoiceDetailsAccNo)
          ).maAccName
          : null;

      const jobId: string =
        k.journalInvoiceDetailsJobId != null
          ? this.jobArry?.find((l) =>
            l.match(k.journalInvoiceDetailsJobId.toString())
          )
          : null;

      return {
        account: accountId,
        amount: k.journalInvoiceDetailsAmount,
        jobname: jobId,
        costcenter: null,
        remarks: k.journalInvoiceDetailsRemarks,
        id: k.journalInvoiceDetailsId,
      };
    });
    this.journalinvoiceentry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
  }

  handleChange(e) {
    this.index = e.index;
  }

  GetSavedJournalDetails(id: string) {
    this.index = 0;
    this.accountapi.GetSavedReceiptDetails(id).subscribe(
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
          this.savedJournalInvoice = data.result;
          this.journalInvoicerMasterFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Journal Invoice  not found',
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
      message: 'Do you want to delete Journal Invoice?',
      accept: () => {
        this.accountapi
          .DeleteReceiptVoucher(this.savedJournalInvoice)
          .subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Journal Invoice  Deleted Succesfully',
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
    this.GetSavedJournalDetails(
      this.journalInvoicerMasterFormGroup.getRawValue().journalInvoiceMasterNo
    );
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
  }

  public get IsValidGrid(): boolean {
    if (this.journalinvoiceentry.data.length > 0) {
      // this.creditnote_entry.data.forEach((value: GridData, index, arry) => {
      console.log(Object.values(this.journalinvoiceentry.data));
      return Object.values(this.journalinvoiceentry.data).some(
        (k: GridData) => k.account != null && k.refno != null
      );
      // });
    }
    return false;
  }

  selectaccount(evt) {

    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
    this.hotRegisterer.getInstance(this.hotid).selectCell(this.activeRow.row, this.activeRow.column + 1);
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

interface GridData {
  account?: string;
  refno?: string;
  amount?: number;
  remarks?: string;
  jobname?: string;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}

export const jounalInviceColumnList = (
  component: JournalinvoiceComponent
) => [
    {
      data: 'account',
      type: 'autocomplete',
      label: 'Account',
      toolTip: 'Account',
      source: component.acctArry,
    },
    {
      data: 'refno',
      type: 'text',
      label: 'Ref No',
      toolTip: 'Ref No',
      readOnly: false,
      numericFormat: {
        pattern: '0,0.00',
      },
      width: 80,
    },
    {
      data: 'amount',
      type: 'numeric',
      label: 'Amount',
      toolTip: 'Amount',
      readOnly: false,
      width: 80,
    },
    {
      data: 'remarks',
      type: 'text',
      label: 'Remarks',
      readOnly: false,
      toolTip: 'Remarks',
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
      data: 'id',
      type: 'numeric',
      label: 'id',
      toolTip: 'id',
      width: 100,
    },

  ];
