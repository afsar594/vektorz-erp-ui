import { NgModule } from '@angular/core';
import { AccountRoutingModule } from './account-routing.module';
import { PaymentvoucherComponent } from './paymentvoucher/paymentvoucher.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReceiptvoucherComponent } from './receiptvoucher/receiptvoucher.component';
import { JournalinvoiceComponent } from './journalinvoice/journalinvoice.component';
import { BankPaymentvoucherComponent } from './bankpaymentvoucher/bankpaymentvoucher.component';
import { BankReceiptvoucherComponent } from './bankreceiptvoucher/bankreceiptvoucher.component';
import { CreditnoteComponent } from './creditnote/creditnote.component';
import { DebitnoteComponent } from './debitnote/debitnote.component';
import { SalesjournalComponent } from './salesjournal/salesjournal.component';
import { PurchasejournalComponent } from './purchasejournal/purchasejournal.component';
import { OpeningbalancevoucherComponent } from './openingbalancevoucher/openingbalancevoucher.component';
import { ContravoucherComponent } from './contravoucher/contravoucher.component';
import { AccountstransactionsreportComponent } from './accountstransactionsreport/accountstransactionsreport.component';
import { AccountstatementComponent } from './Reports/accountstatement/accountstatement.component';
import { MultiaccountComponent } from './Reports/multiaccount/multiaccount.component';
import { AgeingreportComponent } from './ageingreport/ageingreport.component';
import { AssetPurchaseComponent } from './asset-purchase/asset-purchase.component';
import { AssetMasterListComponent } from './assetopening/asset-master-list/asset-master-list.component';
import { AssetOpeningListComponent } from './assetopening/asset-opening-list/asset-opening-list.component';
import { AssetopeningComponent } from './assetopening/assetopening.component';
import { BankReconcilationComponent } from './bank-reconcilation/bank-reconcilation.component';
import { BankstatementComponent } from './bankstatement/bankstatement.component';
import { CustomerstatementComponent } from './customerstatement/customerstatement.component';
import { DaybookComponent } from './daybook/daybook.component';
import { JobInvoiceComponent } from './job-invoice/job-invoice.component';
import { OutstandingstatementComponent } from './outstandingstatement/outstandingstatement.component';
import { PdcalertComponent } from './pdcalert/pdcalert.component';
import { PDCPostingComponent } from './pdcposting/pdcposting.component';
import { AccountMasterListComponent } from './previous-balancesheet/account-master-list/account-master-list.component';
import { PreviousBalancesheetComponent } from './previous-balancesheet/previous-balancesheet.component';
import { VatstatementComponent } from './vatstatement/vatstatement.component';
import { VoucherAllocationListComponent } from './voucher-allocation/voucher-allocation-list/voucher-allocation-list.component';
import { VoucherAllocationComponent } from './voucher-allocation/voucher-allocation.component';
import { VoucherPrintingComponent } from './voucher-printing/voucher-printing.component';
import {
  ContextMenuModule,
  DynamicDialogRef,
  ListboxModule,
  PickListModule,
  SplitButtonModule,
  TreeModule,
} from 'primeng';
import { CommonModule } from '@angular/common';
import { AccountsOutstandingComponent } from './accounts-outstanding/accounts-outstanding.component';
import { JournalVoucherComponent } from './journal-voucher/journal-voucher.component';
import { DepreciationJournalVoucherComponent } from './depreciation-journal-voucher/depreciation-journal-voucher.component';
import { JobCostReportComponent } from './job-cost-report/job-cost-report.component';
import { FcStatementAccountComponent } from './fc-statement-account/fc-statement-account.component';
import { ProgressiveInvoiceComponent } from './progressive-invoice/progressive-invoice.component';
import { AssetSubListComponent } from './asset-sub-list/asset-sub-list.component';
import { AssetConsumptionReturnComponent } from './asset-consumption-return/asset-consumption-return.component';
import { AssetConsumptionComponent } from './asset-consumption/asset-consumption.component';
import { ProjectStatusReportComponent } from './project-status-report/project-status-report.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { AllocationsComponent } from './allocations/allocations.component';
import { PaymentRequestComponent } from './payment-request/payment-request.component';
import { BorwsePRComponent } from './borwse-pr/borwse-pr.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';

@NgModule({
  declarations: [
    PaymentvoucherComponent,
    JobCostReportComponent,
    FcStatementAccountComponent,
    DepreciationJournalVoucherComponent,
    ReceiptvoucherComponent,
    JournalinvoiceComponent,
    BankPaymentvoucherComponent,
    BankReceiptvoucherComponent,
    CreditnoteComponent,
    DebitnoteComponent,
    PurchasejournalComponent,
    SalesjournalComponent,
    OpeningbalancevoucherComponent,
    ContravoucherComponent,
    AccountstransactionsreportComponent,
    AccountstatementComponent,
    MultiaccountComponent,
    AgeingreportComponent,
    CustomerstatementComponent,
    AssetOpeningListComponent,
    AssetMasterListComponent,
    BankstatementComponent,
    PdcalertComponent,
    DaybookComponent,
    VoucherPrintingComponent,
    AssetPurchaseComponent,
    JobInvoiceComponent,
    PDCPostingComponent,
    BankReconcilationComponent,
    VoucherAllocationComponent,
    VoucherAllocationListComponent,
    AssetopeningComponent,
    OutstandingstatementComponent,
    PreviousBalancesheetComponent,
    AccountMasterListComponent,
    VatstatementComponent,
    AccountsOutstandingComponent,
    JournalVoucherComponent,
    ProgressiveInvoiceComponent,
    AssetSubListComponent,
    AssetConsumptionReturnComponent,
    AssetConsumptionComponent,
    ProjectStatusReportComponent,
    AllocationsComponent,
    PaymentRequestComponent,
    BorwsePRComponent,
    PurchaseListComponent,
    // translate
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    SharedModule,
    TreeModule,
    ContextMenuModule,
    ListboxModule,
    PickListModule,
    AutoCompleteModule,
    DropdownModule,
    SplitButtonModule,
  ],
  providers: [DynamicDialogRef],
})
export class AccountModule {}
