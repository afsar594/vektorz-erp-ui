import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ChartofAccounts } from 'src/app/routes/domain/Masters';
// import { ChartofAccounts } from 'src/app/routes/domain';
// import { MasterAccountsTable } from 'src/app/routes/domain/chart';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { BankReconciliation } from 'src/app/routes/domain/Masters/BankReconciliation';
import { AccountstransactionsreportComponent } from '../accountstransactionsreport/accountstransactionsreport.component';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
@Component({
  selector: 'app-bank-reconcilation',
  templateUrl: './bank-reconcilation.component.html',
  styleUrls: ['./bank-reconcilation.component.scss'],
})
export class BankReconcilationComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  // dataset2: any;
  dataset2: any = [];
  accountStatement: AccountsTransactions[] = [];
  cols: any;
  location: Array<string>;
  supplier: Array<string>;
  licensekey: any;
  gridHeader: string;
  trialArray: Array<string>;
  invoiceType: Array<{ value: string }>;
  BRForm: FormGroup;
  index: number = 0;
  listofAccountName: Array<ChartofAccounts>;
  ScreenId: number;
  Permission: any;
  accountList: SelectItem[];
  btnFlag: ButtonFlag;
  displayMaximizable: boolean = false;
  savedBRlist: any;
  savedBR: BankReconciliation;

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private service: AccountApiService,
    private permission: PermissionsService,
    private datePipe: DatePipe,
    private confirmation: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Bank Reconcilation') {
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

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.cols = [
      { field: 'reconciliationVoucherId', header: ' No' },
      { field: 'reconciliationVoucherBankStDate', header: 'Date' },
      { field: 'reconciliationVoucherBankBalance', header: 'Balance' },
      { field: 'reconciliationVoucherNarration', header: 'Remarks' },
      { field: 'action', header: 'Action' },
    ];
    this.BRForm = new FormGroup({
      Date: new FormControl(new Date()),
      No: new FormControl(0),
      Narration: new FormControl(''),
      SelectAC: new FormControl('', Validators.required),

      Reconciliation: new FormControl(new Date()),
      ClosingBalance: new FormControl(''),
    });
    this.BRForm.disable();
    this.trialArray = [];
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });

    this.GetAccountListForDropdown();
    this.initializeControls();
  }

  save() {
    const BR_Save: BankReconciliation = this.BRForm.value as any;

    BR_Save.reconciliationVoucherBankStDate = this.BRForm.controls.Date.value;
    BR_Save.reconciliationVoucherNarration = this.BRForm.controls.Narration.value;
    BR_Save.reconciliationVoucherBankAcNo = this.BRForm.controls.SelectAC.value;
    BR_Save.reconciliationVoucherComplete = true;
    BR_Save.reconciliationVoucherClosingBalance = this.BRForm.controls.ClosingBalance.value;

    // Send the dataset exactly as checked/unchecked via your afterChange logic
    BR_Save.reconciliationVoucherDetails = this.dataset2;

    if (this.btnFlag.save) {
      // Logic for new save
      BR_Save.reconciliationVoucherSno = 0;
      this.saveVoucher(BR_Save);
    } else {
      // Logic for update
      BR_Save.reconciliationVoucherSno = this.BRForm.controls.No.value;
      // Attach the ID retrieved from GetSavedBqDetails
      BR_Save.reconciliationVoucherId = this.savedBR.reconciliationVoucherId;

      this.updateVoucher(BR_Save);
    }
  }
  saveVoucher(BR_Save: BankReconciliation) {
    if (this.BRForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          // this.userTrackingLog('Insert');
          this.service.saveBankReconciliation(BR_Save).subscribe(
            (data: any) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              // this.savedPurchaseVoucher = data.result;
              this.bankLedger.data = [];
              this.updateFormGrid(data.result);

              this.BRForm.disable();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Saved Successfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant(' Voucher Save Failed'),
              });
            }
          );
          // }
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
    }
  }

  updateVoucher(BR_Save: BankReconciliation) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant(
        'Do you want to update existing voucher?'
      ),
      accept: () => {
        this.service.updateBankReconciliation(BR_Save).subscribe(
          (data: any) => {
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.bankLedger.data = [];
            this.updateFormGrid(data.result);
            // this.userTrackingLog('Update');

            this.BRForm.disable();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Updated Successfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: this.translate.instant('GRN Voucher Update Failed'),
            });
          }
        );
      },
    });
  }

  edit() {
    this.BRForm.enable();
    this.BankReconciliation.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    // this.hotRegisterer.getInstance(this.hotid).updateSettings(this.BankReconciliation);
  }

  GetSavedBqDetails(id: any) {
    this.service.bRById(id).subscribe((res: any) => {
      this.savedBR = res;
      this.btnFlag = {
        edit: true,
        cancel: false,
        save: false,
        update: true,
        delete: true,
      };

      this.updateFormGrid(res);
    });
  }

  GetAllBR() {
    this.service.BankReconcilationList().subscribe((res: any) => {
      this.savedBRlist = res.result;
      this.displayMaximizable = true;
    });
  }

  new() {
    this.BRForm.reset();
    this.BRForm.enable();
    this.BRForm.get('Date').setValue(new Date());
    this.BRForm.get('Reconciliation').setValue(new Date());
    this.dataset2 = [];
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.BankReconciliation.data = [];
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.BankReconciliation);
  }

  bankLedger: any;
  // selectedElement: Array<BankLedger> = [];
  GetBankLedger() {
    this.service.BankLedger().subscribe((response) => {
      console.log(response);
      this.bankLedger = response;
      this.bankLedger.forEach((element) => {
        element.Selection = '<input type="checkbox" value="Add">';
        element.accountsTransactions_TransDate = String(
          element.accountsTransactions_TransDate
        ).split('T')[0];
      });
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        data: this.bankLedger,
      });
    });
  }

  updateFormGrid(br_update?: any) {
    this.BRForm.patchValue({
      No: br_update?.reconciliationVoucherSno,
      Narration: br_update?.reconciliationVoucherNarration,
      Date: new Date(br_update?.reconciliationVoucherBankStDate),
      Reconciliation: br_update?.purchaseVoucherPurchaseRef,
      ClosingBalance: br_update?.reconciliationVoucherClosingBalance,
      SelectAC: br_update?.reconciliationVoucherBankAcNo,
    });
    this.dataset2 = br_update?.reconciliationVoucherDetails;
    this.onAccountChange('id', br_update?.reconciliationVoucherBankAcNo);

    this.BRForm.disable();
  }

  GetAccountListForDropdown() {
    this.service.GetAccountListForDropdown().subscribe((response: any) => {
      this.accountList = response.map((c) => ({
        label: c.maAccName,
        value: c.maAccNo,
      }));
    });
  }

  handleChange(e) {
    this.index = e.index;
  }

  hotid = 'BankLedger';
  increment: number = 0;
  flag: boolean = true;
  private hotRegisterer = new HotTableRegisterer();
  BankReconciliation: Handsontable.GridSettings;

  initializeControls() {
    this.BankReconciliation = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      // colWidths: [30, 30, 30, 30, 30, 30, 30],
      colWidths: [150],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      //minSpareRows: 1,
      allowInsertRow: true,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      afterChange: (changes, source) => {
        if (!changes || source === 'loadData') return;

        // Verify the change happened in the Selection column
        const isSelectionChange = changes.some(([row, prop]) => prop === 'Selection' || prop === 0);

        if (isSelectionChange) {
          const hotinstance = this.hotRegisterer.getInstance(this.hotid);

          // Use getSourceData() to get the underlying objects, which contain the unrendered TransSno
          const allGridData = hotinstance.getSourceData();

          this.dataset2 = allGridData
            .filter((data: any) => data.Selection === true || data.Selection === 'true')
            .map((data: any) => ({
              ReconciliationVoucherDetailsTransSno: data.accountsTransactions_TransSno,
              reconciliationVoucherDetailsVno: data.accountsTransactions_VoucherNo,
              reconciliationVoucherDetailsTransDate: data.accountsTransactions_TransDate,
              reconciliationVoucherDetailsDebit: data.accountsTransactions_Debit,
              reconciliationVoucherDetailsCredit: data.accountsTransactions_Credit,
              reconciliationVoucherDetailsChequeNo: data.checkNo,
              reconciliationVoucherDetailsDescription: data.accountsTransactions_Description,
              reconciliationVoucherDetailsDelStatus: false,
            }));

          console.log('Current Payload to Save:', this.dataset2);
        }
      },
      columns: [
        {
          data: 'Selection',
          type: 'checkbox',
          // renderer: this.buttonRenderer.bind(this), className: 'htCenter'
          width: 160,
        },
        {
          data: 'accountsTransactions_VoucherNo',
          type: 'text',
          width: 100,
        },
        {
          data: 'accountsTransactions_TransDate',
          type: 'numeric',
          renderer: this.dateRenderer.bind(this),
          width: 80,
        },
        {
          data: 'accountsTransactions_Debit',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'accountsTransactions_Credit',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'checkNo',
          type: 'numeric',
          width: 100,
        },
        {
          data: 'accountsTransactions_Description',
          type: 'numeric',
          width: 250,
        },
      ],
      colHeaders: [
        this.translate.instant('Selection'),
        this.translate.instant('Voucher No'),
        this.translate.instant('Date'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('Check No'),
        this.translate.instant(' Description'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  get f() {
    return this.BRForm.controls;
  }

  onAccountChange(event: any, id: any) {
    this.dataset = [];
    let value = event === 'id' ? id : event.value;

    this.service.BankReconcilationGetByVNo(value).subscribe((res: any) => {
      if (!this.btnFlag.save) {
        this.dataset = res.map((i: any) => {
          // Stricter match using the unique TransSno 
          const found = this.dataset2?.find(
            (e: any) =>
              e.reconciliationVoucherDetailsTransSno === i.accountsTransactions_TransSno
          );

          return found ? { ...i, Selection: true } : { ...i, Selection: false };
        });
      } else {
        this.dataset = res;
      }
    });
  }

  dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      td.innerText = formattedDate ? formattedDate : '';
    } else {
      td.innerText = '';
    }
  }
}

// interface BankLedger {
//   id: number;
//   vno: string;
//   debit: number;
//   credit: number;
// }

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
