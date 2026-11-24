import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
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
import { ChartofAccounts } from 'src/app/routes/domain/Masters/ChartofAccounts';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { OpeningVoucherMaster } from 'src/app/routes/domain/Accounts/OpeningVoucherMaster';
import { OpeningVoucherDetails } from 'src/app/routes/domain/Accounts/OpeningVoucherDetails';
import { LoginService } from 'src/app/routes/service/login.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-openingbalancevoucher',
  templateUrl: './openingbalancevoucher.component.html',
  styleUrls: ['./openingbalancevoucher.component.scss'],
})
export class OpeningbalancevoucherComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  openingVoucherFilterForm: FormGroup;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

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
  voucherNoOnSelect: any;
  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  accountTransactionList: AccountsTransactions[] = [];
  openingBalanceVoucherarry: OpeningVoucherMaster[] = [];
  // savedPaymentVoucherGridData: GridData[] = [];
  savedOBVoucher: OpeningVoucherMaster;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'openingBalanceVouchrEntry';
  ScreenId: number;
  financialPeriodMaxDate: Date | null = null;
  Permission: any;
  filterArray: any;
  user: any;
  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private utilityService: UtilityService,
    private loginser: LoginService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    private cdr: ChangeDetectorRef
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  openingBalancevoucherentry: Handsontable.GridSettings;
  openingBalanceVoucherFormGroup: FormGroup;
  // accountTransactionDataset = [];
  yellowRenderer;
  cols;
  ngAfterViewInit() {}


  ngOnInit(): void {


  this.accountapi.getFinancialPeriodDate().subscribe({
    next: (response: any) => {
      console.log('API Response:', response);
      
      let dataObj = response;
      if (response && Array.isArray(response.result)) {
        dataObj = response.result[0];
      } else if (response && response.result) {
        dataObj = response.result;
      } else if (response && Array.isArray(response.resultSet)) {
        dataObj = response.resultSet[0];
      } else if (response && response.resultSet) {
        dataObj = response.resultSet;
      } else if (Array.isArray(response)) {
        dataObj = response[0];
      }

      // Access the property directly from the extracted object
      if (dataObj && dataObj.financialPeriodsStartDate) {
        const parsedDate = new Date(dataObj.financialPeriodsStartDate);
        
        // Match the 'useUtc' attribute from your HTML template
        parsedDate.setUTCHours(23, 59, 59, 999);
        
        this.financialPeriodMaxDate = parsedDate;
        
        console.log('Max Date successfully applied:', this.financialPeriodMaxDate);
        this.cdr.detectChanges(); 
      }
    },
    error: (error) => {
      console.error('Error fetching financial period date:', error);
    },
  });

  console.log("this is the fianncil peripod max date "+ this.financialPeriodMaxDate  )


    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();
      // console.log('rights', rights);
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Opening Balance Voucher') {
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
    //console.log('this.Permission', this.Permission);
    this.cols = [
      { field: 'openingVoucherNo', header: 'Voucher No' },
      { field: 'openingVoucherMasterOpBDate', header: 'Date' },
      { field: 'openingVoucherMasterAccNo', header: 'Account' },
      { field: 'openingVoucherMasterCurrencyId', header: 'Currency' },
      { field: 'openingVoucherMasterTotalDebit', header: 'Vchr.Debit' },
      { field: 'openingVoucherMasterTotalCredit', header: 'Vchr.Credit' },
      // { field: 'openingVoucherMasterTotalDebit', header: 'Dtls.Debit' },
      // { field: 'openingVoucherMasterTotalCredit', header: 'Dtls.Credit' }
      { field: 'Action', header: 'View' },
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.openingBalanceVoucherFormGroup = this.fb.group({
      openingVoucherMasterId: [null],
      openingVoucherNo: [null],
      openingVoucherMasterOpBDate: [null, [Validators.required]],
      openingVoucherMasterAccNo: [-1, [DropDownValidator]],
      openingVoucherMasterTotalDebit: [null],
      openingVoucherMasterTotalCredit: [null],
      openingVoucherMasterCurrencyId: [-1, [DropDownValidator]],
      // openingVoucherMasterCrAmount:[null],
      // openingVoucherMasterDrAmount:[null]
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.openingVoucherFilterForm = this.fb.group({
      openingVoucherAcNo: [null],
      isDate: [],
      openingVoucherNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    var user = this.loginser.GetCredentialData();
    this.usrid = user?.userId;
    this.fsno = user?.financialPeriodsFsno;
    this.locId = user?.locId;
  }
  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
  }

  get f() {
    return this.openingBalanceVoucherFormGroup.controls;
  }

  initializeControls() {
    this.getAllCurrency();
    this.getAllAccount();

    this.yellowRenderer = (
      instance,
      td,
      row,
      col,
      prop,
      value,
      cellProperties
    ) => {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      td.style.backgroundColor = 'yellow';
    };
    this.openingBalancevoucherentry = {
      rowHeaders: true,
      readOnly: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      width: '100%',
      height: 150,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      enterMoves: { row: 0, col: 1 },
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      hiddenColumns: {
        columns: [6],
        indicators: false,
      },
      // rowHeaders: true,
      columns: [
        {
          data: 'vouchereno',
          type: 'text',
          width: 100,
        },
        {
          data: 'Refno',
          type: 'text',
          width: 100,
        },

        {
          data: 'voucherdate',
          type: 'date',
          dateFormat: 'DD/MM/YYYY',
          correctFormat: true,
          datePickerConfig: {
            firstDay: 0,
            format: 'DD/MM/YYYY',
          },
          width: 100,
        },
        {
          data: 'debit',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
        {
          data: 'credit',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
        {
          data: 'narration',
          type: 'text',
          width: 200,
        },
        {
          data: 'id',
          type: 'numeric',
          width: 100,
        },
      ],
      colHeaders: [
        this.translate.instant('Voucher No'),
        this.translate.instant('Ref No'),
        this.translate.instant('Voucher Date'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('Narration'),
        this.translate.instant('Id'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.openingBalancevoucherentry.beforeChangeRender = (change, source) => {
      const [rowIndex, colName, , newValue] = change[0];
      this.ColumnSum(rowIndex, colName, newValue);
      if (change[0][1] === 'voucherdate') {
        return;
      }

      if (change[0][1] === 'vouchereno') {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(change[0][0]);

        if (data[1] != null) {
          var Vl = 0;

          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 3, Vl);
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 4, Vl);
        }
        if (data[0] != null) {
          var Vl = 0;
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 3, Vl);
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 4, Vl);
        }
      }
    };
    this.openingBalancevoucherentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum(index, '', amount);
    };

    this.openingBalancevoucherentry.afterValidate = (
      isValid,
      value,
      row,
      prop
    ) => {
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
    this.openingBalancevoucherentry.data.forEach(
      (elemt: any, index: number) => {
        if (elemt) {
          if (rowIndex == index) {
            if (colName == 'debit') {
              elemt.credit = 0;
            } else if (colName == 'credit') {
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
        this.openingBalanceVoucherFormGroup.controls.openingVoucherMasterTotalCredit.setValue(
          value
        );
        this.openingBalanceVoucherFormGroup.controls.openingVoucherMasterTotalDebit.setValue(
          value1
        );
      }
    );
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select--', value: -1 });
      this.currArry = k.map((ar) => ar.currencyMasterCurrencyName?.trim());
    });
  }

  getAllAccount() {
    this.accountapi.getAccounts().subscribe((k) => {
      this.accountArray = k.resultSet?.details;
      this.accountList = k.resultSet?.details.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });

      this.acctArry = k.resultSet?.details.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
    });
  }

  saveOBVoucher() {
    const savedData: any = this.openingBalancevoucherentry.data?.filter((k) =>
      k.hasOwnProperty('vouchereno')
    );
    const OBVoucher: OpeningVoucherMaster = this.openingBalanceVoucherFormGroup
      .value as OpeningVoucherMaster;
    OBVoucher.openingVoucherNo =
      this.openingBalanceVoucherFormGroup.getRawValue().openingVoucherNo;
    OBVoucher.openingVoucherMasterTotalDebit =
      this.openingBalanceVoucherFormGroup.getRawValue().openingVoucherMasterTotalDebit;
    OBVoucher.openingVoucherMasterTotalCredit =
      this.openingBalanceVoucherFormGroup.getRawValue().openingVoucherMasterTotalCredit;
    OBVoucher.openingVoucherMasterFsno = this.fsno;
    OBVoucher.openingVoucherMasterUserId = this.usrid;
    OBVoucher.openingVoucherMasterOpBDate =
      this.openingBalanceVoucherFormGroup.getRawValue().openingVoucherMasterOpBDate;
    OBVoucher.openingVoucherMasterLastUpdateTime =
      this.openingBalanceVoucherFormGroup.getRawValue().openingVoucherMasterOpBDate;
    OBVoucher.openingVoucherMasterAccNo =
      this.openingBalanceVoucherFormGroup.getRawValue().openingVoucherMasterAccNo;
    OBVoucher.openingVoucherMasterCurrencyId =
      this.openingBalanceVoucherFormGroup.getRawValue().openingVoucherMasterCurrencyId;

    OBVoucher.openingVoucherDetails = savedData
      ?.filter((k) => k.vouchereno != null && k.credit != null)
      .map((k: GridData) => {
        return {
          openingVoucherDetailsId: k.id != null ? k.id : 0,
          openingVoucherDetailsOpId:
            this.openingBalanceVoucherFormGroup.getRawValue().openingVoucherNo,
          openingVoucherDetailsVoucherNo: k.vouchereno,
          openingVoucherDetailsRefNo: k.Refno,
          //openingVoucherDetailsVDate:new Date(k.voucherdate),
          openingVoucherDetailsVDate: new Date(
            +k.voucherdate.toString().split('/')[2],
            +k.voucherdate.toString().split('/')[1] - 1,
            +k.voucherdate.toString().split('/')[0]
          ),
          openingVoucherDetailsDebit: k.debit,
          openingVoucherDetailsCredit: k.credit,
          openingVoucherDetailsRemarks: k.narration,
          openingVoucherDetailsFsno: this.fsno,
          openingVoucherDetailsUserId: this.usrid,
          openingVoucherDetailsLastUpdateTime: new Date(),
          openingVoucherDetailsDrCr: 'CD',
          openingVoucherDetailsDelStatus: false,
        };
      });

    OBVoucher.accountsTransactions = [];
    OBVoucher.openingVoucherDetails
      ?.filter((x) => x.openingVoucherDetailsDelStatus === false)
      .forEach((element) => {
        // console.log (element.openingVoucherDetailsVDate)
        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: this.f.openingVoucherMasterAccNo.value,
          accountsTransactionsTransDate: element.openingVoucherDetailsVDate,
          accountsTransactionsParticulars: element.openingVoucherDetailsRemarks,
          accountsTransactionsDebit: element.openingVoucherDetailsDebit,
          accountsTransactionsFcDebit: element.openingVoucherDetailsDebit,
          accountsTransactionsCredit: element.openingVoucherDetailsCredit,
          accountsTransactionsFcCredit: element.openingVoucherDetailsCredit,
          accountsTransactionsLpoNo: element.openingVoucherDetailsOpId,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo: element.openingVoucherDetailsVoucherNo,
          accountsTransactionsDescription: null, //element.openingVoucherDetailsRemarks,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
        };
        OBVoucher.accountsTransactions.push(creditData);
      });
    // console.log('OBVoucher',OBVoucher);
    if (this.btnFlag.save) {
      this.saveVoucher(OBVoucher);
    } else {
      OBVoucher.accountsTransactions
        ?.filter((x) => x.accountsTransactionsDebit > 0)
        .forEach((element, index, arry) => {
          const acctTransEntry: AccountsTransactions =
            this.savedOBVoucher.accountsTransactions
              ?.filter((x) => x.accountsTransactionsDebit > 0)
              ?.find(
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

      OBVoucher.accountsTransactions
        ?.filter((x) => x.accountsTransactionsCredit > 0)
        .forEach((element, index, arry) => {
          const acctTransEntry: AccountsTransactions =
            this.savedOBVoucher.accountsTransactions
              ?.filter((x) => x.accountsTransactionsCredit > 0)
              ?.find(
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

      this.updateVoucher(OBVoucher);
    }
  }

  saveVoucher(OBVoucher: OpeningVoucherMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to save voucher?',
      accept: () => {
        this.accountapi.InsertOBVoucher(OBVoucher).subscribe(
          (data) => {
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.updateFormGrid(data.result);
            this.userTrackingLog('Insert');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Opening Balance Voucher Saved Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Opening Balance Voucher Save Failed',
            });
          }
        );
      },
    });
  }

  updateVoucher(OBVoucher: OpeningVoucherMaster) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to update existing voucher?',
      accept: () => {
        this.accountapi.UpdateOBVoucher(OBVoucher).subscribe(
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
              detail: 'Opening Balance Voucher Updated Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Opening Balance Voucher Update Failed',
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

  getAllOBVouchrs() {
    this.accountapi.GetOBVouchers().subscribe((data) => {
      this.openingBalanceVoucherarry = data.result;
      this.filterArray = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  new() {
    this.openingBalanceVoucherFormGroup.reset();
    this.openingBalancevoucherentry.data = [];
    this.openingBalancevoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.openingBalancevoucherentry);

    this.accountTransactionList = [];
    this.openingBalanceVoucherFormGroup
      .get('openingVoucherMasterTotalDebit')
      .setValue(null);
    this.openingBalanceVoucherFormGroup
      .get('openingVoucherMasterTotalCredit')
      .setValue(null);
    this.openingBalanceVoucherFormGroup
      .get('openingVoucherMasterAccNo')
      .setValue(-1);
    this.openingBalanceVoucherFormGroup
      .get('openingVoucherMasterCurrencyId')
      .setValue(-1);
    let defaultDate = this.financialPeriodMaxDate ? this.financialPeriodMaxDate : new Date();
    this.openingBalanceVoucherFormGroup
      .get('openingVoucherMasterOpBDate')
      .setValue(defaultDate);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.GetDefaultSettings();
    this.openingBalanceVoucherFormGroup.enable();
    this.openingBalanceVoucherFormGroup.updateValueAndValidity();
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
          this.f.openingVoucherMasterCurrencyId.setValue(
            Number(this.DefCurrency)
          );
        }
      }
    });
  }

  showMaximizableDialog() {
    this.getAllOBVouchrs();
    this.displayMaximizable = true;
  }

  updateFormGrid(OBVpt: OpeningVoucherMaster) {
    this.search = null;
    this.openingBalanceVoucherFormGroup.patchValue({
      openingVoucherMasterId: OBVpt.openingVoucherMasterId,
      openingVoucherNo: this.voucherNoOnSelect,
      // openingVoucherMasterVoucherDate:  OBVpt.openingVoucherMasterOpBDate,
      openingVoucherMasterOpBDate: new Date(OBVpt.openingVoucherMasterOpBDate),
      openingVoucherMasterAccNo: OBVpt.openingVoucherMasterAccNo,
      openingVoucherMasterDrAmount: OBVpt.openingVoucherMasterTotalDebit,
      openingVoucherMasterCrAmount: OBVpt.openingVoucherMasterTotalCredit,
      openingVoucherMasterCurrencyId: OBVpt.openingVoucherMasterCurrencyId,
    });
    this.accountTransactionList = OBVpt.accountsTransactions;
    const gridData: GridData[] = OBVpt.openingVoucherDetails.map((k) => {
      return {
        vouchereno: k.openingVoucherDetailsVoucherNo,
        Refno: k.openingVoucherDetailsRefNo,
        voucherdate: new Date(
          k.openingVoucherDetailsVDate
        ).toLocaleDateString(),
        debit: k.openingVoucherDetailsDebit,
        credit: k.openingVoucherDetailsCredit,
        narration: k.openingVoucherDetailsRemarks,
        id: k.openingVoucherDetailsId,
      };
    });
    this.openingBalancevoucherentry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
  }

  handleChange(e) {
    this.index = e.index;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  GetSavedOBDetails(id: string) {
    this.index = 0;
    this.voucherNoOnSelect = id;
    this.accountapi.GetSavedOBVoucherDetails(id).subscribe(
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
          this.savedOBVoucher = data.result;
          this.openingBalanceVoucherFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Opening Balance voucher not found',
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
        this.accountapi.DeleteOBVoucher(this.savedOBVoucher).subscribe(
          (data) => {
            this.userTrackingLog('Delete');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Opening Balance Voucher Deleted Succesfully',
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
    this.GetSavedOBDetails(
      this.openingBalanceVoucherFormGroup.getRawValue().opneingVoucherMasterId
    );
  }

  edit() {
    this.openingBalanceVoucherFormGroup.enable();
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
  }

  public get IsValidGrid(): boolean {
    if (this.openingBalancevoucherentry.data.length > 0) {
      // this.paymentvoucherentry.data.forEach((value: GridData, index, arry) => {
      //console.log(Object.values(this.openingBalancevoucherentry.data));
      return Object.values(this.openingBalancevoucherentry.data).some(
        (k: GridData) => k.vouchereno != null && k.Refno != null
      );
      // });
    }
    return false;
  }

  filter() {
    let filteredArray = this.filterArray;
    if (this.openingVoucherFilterForm.value.openingVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.openingVoucherMasterId ===
          Number(this.openingVoucherFilterForm.value.openingVoucherNo)
      );
    }

    if (
      this.openingVoucherFilterForm.value.openingVoucherAcNo != null &&
      this.openingVoucherFilterForm.value.openingVoucherAcNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.openingVoucherMasterAccNo ===
          this.openingVoucherFilterForm.value.openingVoucherAcNo
      );
    }

    if (this.openingVoucherFilterForm.value.isDate) {
      const fromDateStr = this.openingVoucherFilterForm.value.fromDate;
      const toDateStr = this.openingVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      // filteredArray = filteredArray?.filter((res) => {
      //   const voucherDate = new Date(res.openingVoucherMasterLastUpdateTime);

      //   voucherDate.setHours(0, 0, 0, 0);
      //   fromDate.setHours(0, 0, 0, 0);

      //   return voucherDate.getTime() >= fromDate.getTime() && voucherDate.getTime() <= toDate.getTime() || voucherDate.getTime() === fromDate.getTime();;
      // });

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.openingVoucherMasterLastUpdateTime);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.openingBalanceVoucherarry = filteredArray;
    }
    this.openingBalanceVoucherarry = filteredArray;
  }

  ClearFilter() {
    this.openingVoucherFilterForm.reset();
    this.openingBalanceVoucherarry = this.filterArray;
    this.openingVoucherFilterForm.get('fromDate').setValue(new Date());
    this.openingVoucherFilterForm.get('toDate').setValue(new Date());
  }

  userTrackingLog(type) {
    let req = {
      page: 'Opening Balance Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.openingBalanceVoucherFormGroup
        .get('openingVoucherMasterId')
        .value?.toString(),
      vpType: 'Opening Balance Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }
}

interface GridData {
  vouchereno?: string;
  Refno?: string;
  voucherdate?: string;
  debit?: number;
  credit?: number;
  narration?: string;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
