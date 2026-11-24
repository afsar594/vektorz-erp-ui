import { JournalinvoiceComponent } from './journalinvoice/journalinvoice.component';
import { ReceiptvoucherComponent } from './receiptvoucher/receiptvoucher.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentvoucherComponent } from './paymentvoucher/paymentvoucher.component';
import { BankPaymentvoucherComponent } from './bankpaymentvoucher/bankpaymentvoucher.component';
import { BankReceiptvoucherComponent } from './bankreceiptvoucher/bankreceiptvoucher.component';
import { CreditnoteComponent } from './creditnote/creditnote.component';
import { DebitnoteComponent } from './debitnote/debitnote.component';
import { PurchasejournalComponent } from './purchasejournal/purchasejournal.component';
import { SalesjournalComponent } from './salesjournal/salesjournal.component';
import { OpeningbalancevoucherComponent } from './openingbalancevoucher/openingbalancevoucher.component';
import { ContravoucherComponent } from './contravoucher/contravoucher.component';
import { AccountstransactionsreportComponent } from './accountstransactionsreport/accountstransactionsreport.component';
import { MultiaccountComponent } from './Reports/multiaccount/multiaccount.component';
import { DaybookComponent } from './daybook/daybook.component';
import { AgeingreportComponent } from './ageingreport/ageingreport.component';
import { VoucherPrintingComponent } from './voucher-printing/voucher-printing.component';
import { AssetPurchaseComponent } from './asset-purchase/asset-purchase.component';
import { PDCPostingComponent } from './pdcposting/pdcposting.component';
import { PreviousBalancesheetComponent } from './previous-balancesheet/previous-balancesheet.component';
import { AssetopeningComponent } from './assetopening/assetopening.component';
import { JobInvoiceComponent } from './job-invoice/job-invoice.component';
import { OutstandingstatementComponent } from './outstandingstatement/outstandingstatement.component';
import { PdcalertComponent } from './pdcalert/pdcalert.component';
import { BankReconcilationComponent } from './bank-reconcilation/bank-reconcilation.component';
import { VoucherAllocationComponent } from './voucher-allocation/voucher-allocation.component';
import { AccountstatementComponent } from './Reports/accountstatement/accountstatement.component';
import { BankstatementComponent } from './bankstatement/bankstatement.component';
import { VatstatementComponent } from './vatstatement/vatstatement.component';
import { AccountsOutstandingComponent } from './accounts-outstanding/accounts-outstanding.component';
import { JournalVoucherComponent } from './journal-voucher/journal-voucher.component';
import { CustomerstatementComponent } from './customerstatement/customerstatement.component';
import { DepreciationJournalVoucherComponent } from './depreciation-journal-voucher/depreciation-journal-voucher.component';
import { JobCostReportComponent } from './job-cost-report/job-cost-report.component';
import { FcStatementAccountComponent } from './fc-statement-account/fc-statement-account.component';
import { ProgressiveInvoiceComponent } from './progressive-invoice/progressive-invoice.component';
import { AssetSubListComponent } from './asset-sub-list/asset-sub-list.component';
import { AssetConsumptionReturnComponent } from './asset-consumption-return/asset-consumption-return.component';
import { AssetConsumptionComponent } from './asset-consumption/asset-consumption.component';
import { ProjectStatusReportComponent } from './project-status-report/project-status-report.component';
import { PaymentRequestComponent } from './payment-request/payment-request.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';

const routes: Routes = [
  {
    path: 'paymentRequest',
    component: PaymentRequestComponent,
    data: { title: 'Payment Request', titleI18n: 'Payment Request' },
  },
  {
    path: 'paymentvoucher',
    component: PaymentvoucherComponent,
    data: { title: 'Payment Voucher', titleI18n: 'Payment Voucher' },
  },
  {
    path: 'daybook',
    component: DaybookComponent,
    data: { title: 'Day Book', titleI18n: 'Day Book' },
  },
  {
    path: 'customerStatement',
    component: CustomerstatementComponent,
    data: { title: 'Customer Statement', titleI18n: 'Customer Statement' },
  },
  {
    path: 'bankstatement',
    component: BankstatementComponent,
    data: { title: 'Bank Statement', titleI18n: 'Bank Statement' },
  },
  {
    path: 'pdc-alert',
    component: PdcalertComponent,
    data: { title: 'PDC Alert', titleI18n: 'PDC Alert' },
  },
  {
    path: 'ageingreport',
    component: AgeingreportComponent,
    data: { title: 'Ageing Report', titleI18n: 'Ageing Report' },
  },
  {
    path: 'vatstatement',
    component: VatstatementComponent,
    data: { title: 'Vat Statement', titleI18n: 'Vat Statement' },
  },
  {
    path: 'receiptvoucher',
    component: ReceiptvoucherComponent,
    data: { title: 'Receipt Voucher', titleI18n: 'Receipt Voucher' },
  },
  {
    path: 'journalinvoice',
    component: JournalinvoiceComponent,
    data: { title: 'Journal Invoice', titleI18n: 'Journal Invoice' },
  },
  {
    path: 'VoucherPrinting',
    component: VoucherPrintingComponent,
    data: { title: 'Voucher Printing', titleI18n: 'Voucher Printing' },
  },
  {
    path: 'assetPurchase',
    component: AssetPurchaseComponent,
    data: { title: 'Asset Purchase', titleI18n: 'Asset Purchase' },
  },
  {
    path: 'bankpaymentvoucher',
    component: BankPaymentvoucherComponent,
    data: { title: 'Bank Payment Voucher', titleI18n: 'Bank Payment Voucher' },
  },
  {
    path: 'PDCPosting',
    component: PDCPostingComponent,
    data: { title: 'PDC Posting', titleI18n: 'PDC Posting' },
  },
  {
    path: 'jobInvoice',
    component: JobInvoiceComponent,
    data: { title: 'Job Invoice', titleI18n: 'Job Invoice' },
  },

  {
    path: 'assetOpening',
    component: AssetopeningComponent,
    data: { title: 'Asset Opening', titleI18n: 'Asset Opening' },
  },
  {
    path: 'outstandingstatement',
    component: OutstandingstatementComponent,
    data: {
      title: 'Outstanding Statement',
      titleI18n: 'Outstanding Statement',
    },
  },
  {
    path: 'previous-balancesheet',
    component: PreviousBalancesheetComponent,
    data: {
      title: 'Previous Balance Sheet Entry',
      titleI18n: 'PreviousBalance Sheet Entry',
    },
  },

  {
    path: 'assetOpening',
    component: AssetopeningComponent,
    data: { title: 'Asset Opening', titleI18n: 'Asset Opening' },
  },
  {
    path: 'outstandingstatement',
    component: OutstandingstatementComponent,
    data: {
      title: 'Outstanding Statement',
      titleI18n: 'Outstanding Statement',
    },
  },
  {
    path: 'accounts-outstanding',
    component: AccountsOutstandingComponent,
    data: { title: 'Accounts Outstanding', titleI18n: 'Accounts Outstanding' },
  },
  {
    path: 'previous-balancesheet',
    component: PreviousBalancesheetComponent,
    data: {
      title: 'Previous Balance Sheet Entry',
      titleI18n: 'PreviousBalance Sheet Entry',
    },
  },

  {
    path: 'bankreceiptvoucher',
    component: BankReceiptvoucherComponent,
    data: { title: 'Bank Receipt Voucher', titleI18n: 'Bank Receipt Voucher' },
  },
  {
    path: 'creditnote',
    component: CreditnoteComponent,
    data: { title: 'Credit Note', titleI18n: 'Credit Note' },
  },
  {
    path: 'BankReconcilation',
    component: BankReconcilationComponent,
    data: {
      title: 'Bank Reconcilation',
      titleI18n: 'Bank ReconcilationComponent',
    },
  },

  {
    path: 'debitnote',
    component: DebitnoteComponent,
    data: { title: 'Debit Note', titleI18n: 'Debit Note' },
  },
  {
    path: 'purchasejournal',
    component: PurchasejournalComponent,
    data: { title: 'Purchase Journal', titleI18n: 'Purchase Journal' },
  },
  {
    path: 'salesjournal',
    component: SalesjournalComponent,
    data: { title: 'Sales Journal', titleI18n: 'Sales Journal' },
  },
  {
    path: 'openingbalancevoucher',
    component: OpeningbalancevoucherComponent,
    data: {
      title: ' Opening Balance Voucher',
      titleI18n: 'Opening Balance Voucher',
    },
  },

  {
    path: 'journalvoucher',
    component: JournalVoucherComponent,
    data: { title: ' Journal Voucher', titleI18n: 'Journal Voucher' },
  },
  {
    path: 'contravoucher',
    component: ContravoucherComponent,
    data: { title: ' Contra Voucher', titleI18n: 'Contra Voucher' },
  },
  {
    path: 'accountstransactionsreport',
    component: AccountstransactionsreportComponent,
    data: {
      title: 'Accounts Transactions Report',
      titleI18n: 'Accounts Transactions Report',
    },
  },

  {
    path: 'account-statement',
    component: AccountstatementComponent,
    data: { title: 'Accounts Statements', titleI18n: 'Accounts Statements' },
  },

  {
    path: 'MultiAccount',
    component: MultiaccountComponent,
    data: { title: 'Multi Account', titleI18n: 'Multi Account' },
  },
  {
    path: 'voucher-allocation',
    component: VoucherAllocationComponent,
    data: { title: 'Voucher Allocation', titleI18n: 'Voucher Allocation' },
  },
  {
    path: 'depreciation-journal-voucher',
    component: DepreciationJournalVoucherComponent,
    data: {
      title: ' Depreciation Journal Voucher',
      titleI18n: ' Depreciation Journal Voucher',
    },
  },
  {
    path: 'job-cost-report',
    component: JobCostReportComponent,
    data: { title: 'Job Cost Report', titleI18n: 'Job Cost Report' },
  },
  {
    path: 'fc-statement-account',
    component: FcStatementAccountComponent,
    data: {
      title: 'FC Statement Of Account',
      titleI18n: 'FC Statement Of Account',
    },
  },
  {
    path: 'progressiveInvoice',
    component: ProgressiveInvoiceComponent,
    data: { title: 'Progressive Invoice', titleI18n: 'Progressive Invoice' },
  },
  {
    path: 'asset-sub-list',
    component: AssetSubListComponent,
    data: { title: 'Asset Sub List', titleI18n: 'Asset Sub List' },
  },
  {
    path: 'asset-consumption-return',
    component: AssetConsumptionReturnComponent,
    data: {
      title: 'asset-consumption-return',
      titleI18n: 'asset-consumption-return',
    },
  },
  {
    path: 'asset-consumption',
    component: AssetConsumptionComponent,
    data: { title: 'Asset Consumption', titleI18n: 'Asset Consumption' },
  },
   {
    path: 'purchase-list',
    component:  PurchaseListComponent,
    data: { title: 'Purchase List', titleI18n: 'Purchase List' },
  },
  {
    path: 'projectstatusreport',
    component: ProjectStatusReportComponent,
    data: {
      title: 'Project Status Report',
      titleI18n: 'Project Status Report',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
