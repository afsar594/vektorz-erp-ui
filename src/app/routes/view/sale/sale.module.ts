import { SharedModule } from 'src/app/shared/shared.module';
import { AccountRoutingModule } from './../account/account-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaleRoutingModule } from './sale-routing.module';
import { CustomerquotationComponent } from './customerquotation/customerquotation.component';
import { CustomerenquiryComponent } from './customerenquiry/customerenquiry.component';
import { SalesvoucherComponent } from './salesvoucher/salesvoucher.component';
import { DeliveryNoteComponent } from './deliverynote/delivery-note/delivery-note.component';
import { ReportSalesVoucherComponent } from './report-sales-voucher/report-sales-voucher.component';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { SalesmanwiseComponent } from './salesmanwise/salesmanwise.component';
import { CustomerEnquirySearchComponent } from './customer-enquiry-search/customer-enquiry-search.component';
import { CustomerSalesOrderListComponent } from './customer-sale-order/customer-sales-order-list/customer-sales-order-list.component';
import { ItemMasterListComponent } from './customer-sale-order/item-master-list/item-master-list.component';
import { CutomerSalesDetailsComponent } from './cutomer-sales-details/cutomer-sales-details.component';
import { ProformaListComponent } from './proformainvoice/proforma-list/proforma-list.component';
import { ProformainvoiceComponent } from './proformainvoice/proformainvoice.component';
import { DeliveryNoteStatusComponent } from './delivery-note-status/delivery-note-status.component';
import { SalesreturnComponent } from './salesreturn/salesreturn.component';
import { CustomerQutationDetailComponent } from './customer-qutation-detail/customer-qutation-detail.component';
import { CustomerSalesDetailComponent } from './customer-sales-detail/customer-sales-detail.component';
import { DeliveryOrderReportComponent } from './delivery-order-report/delivery-order-report.component';
import { GraphicalReportsComponent } from './graphical-reports/graphical-reports.component';
import { CustomerSaleOrderComponent } from './customer-sale-order/customer-sale-order.component';
import { CustomerSalesOrderComponent } from './customer-sales-order/customer-sales-order.component';
import { InvoiceProfitAnalysisComponent } from './invoice-profit-analysis/invoice-profit-analysis.component';
import { SalesOrderStatusComponent } from './deliverynote/delivery-note/sales-order-status/sales-order-status.component';
import { DialogService } from 'primeng/dynamicdialog';
import { CustomerOrderTrackingComponent } from './customer-order-tracking/customer-order-tracking.component';
import { BoquantityComponent } from './boquantity/boquantity.component';
import { BillOfMaterialsComponent } from './bill-of-materials/bill-of-materials.component';
import { CustomerQutationDetaisComponent } from './customer-qutation-detais/customer-qutation-detais.component';
import { BarcoderederComponent } from './barcodereder/barcodereder.component';
import { ItemModifyComponent } from './item-modify/item-modify.component';
import { JobInvoiceReportComponent } from './job-invoice-report/job-invoice-report.component';
import { FileUploadModule, MultiSelectModule, SplitButtonModule, TooltipModule, TreeModule, AccordionModule, ChartModule, ProgressBarModule } from 'primeng';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DelivertNoteComponent } from './salesvoucher/delivery-note/delivert-note.component';
import { SaleSummaryByDateComponent } from './sale-summary-by-date/sale-summary-by-date.component';
import { SalesVoucherAnalysisComponent } from './sales-report/sales-voucher-analysis/sales-voucher-analysis.component';
import { ProformaInvoiceStatusComponent } from '../../../proforma-invoice-status/proforma-invoice-status.component';
import { CustomerquotatonAceComponent } from './customerquotaton-ace/customerquotaton-ace.component';
// import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

@NgModule({
  declarations: [
    ItemMasterListComponent,
    CustomerSalesOrderListComponent,
    CustomerEnquirySearchComponent,
    CutomerSalesDetailsComponent,
    // InvoiceProfitReportComponent,
    ProformainvoiceComponent,
    ProformaListComponent,
    CustomerquotationComponent,
    CustomerenquiryComponent,
    SalesvoucherComponent,
    ProformaInvoiceStatusComponent,
    SalesReportComponent,
    DeliveryNoteComponent,
    ReportSalesVoucherComponent,
    SalesmanwiseComponent,
    DeliveryNoteStatusComponent,
    SalesreturnComponent,
    CustomerQutationDetailComponent,
    CustomerSalesDetailComponent,
    DeliveryOrderReportComponent,
    GraphicalReportsComponent,
    CustomerSaleOrderComponent,
    CustomerSalesOrderComponent,
    InvoiceProfitAnalysisComponent,
    SalesOrderStatusComponent,
    CustomerOrderTrackingComponent,
    BoquantityComponent,
    BillOfMaterialsComponent,
    CustomerQutationDetaisComponent,
    BarcoderederComponent,
    ItemModifyComponent,
    JobInvoiceReportComponent,
    DelivertNoteComponent,
    SaleSummaryByDateComponent,
    SalesVoucherAnalysisComponent,
    CustomerquotatonAceComponent
  ],
  imports: [
    CommonModule,
    SaleRoutingModule,
    AccountRoutingModule,
    SharedModule,
    MultiSelectModule,
    FileUploadModule, SplitButtonModule,
    TooltipModule,
    TreeModule,
    AccordionModule,
    ChartModule,
    ProgressBarModule,
    TranslateModule,
    ReactiveFormsModule
],
  providers: [DialogService],

})
export class SaleModule { }
