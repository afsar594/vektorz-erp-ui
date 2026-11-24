import { CustomerquotationComponent } from './customerquotation/customerquotation.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerenquiryComponent } from './customerenquiry/customerenquiry.component';
import { SalesvoucherComponent } from './salesvoucher/salesvoucher.component';
import { DeliveryNoteComponent } from './deliverynote/delivery-note/delivery-note.component';
import { ReportSalesVoucherComponent } from './report-sales-voucher/report-sales-voucher.component';
import { CustomerEnquirySearchComponent } from './customer-enquiry-search/customer-enquiry-search.component';
import { CutomerSalesDetailsComponent } from './cutomer-sales-details/cutomer-sales-details.component';
import { ProformainvoiceComponent } from './proformainvoice/proformainvoice.component';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { SalesmanwiseComponent } from './salesmanwise/salesmanwise.component';
import { DeliveryNoteStatusComponent } from './delivery-note-status/delivery-note-status.component';
import { SalesreturnComponent } from './salesreturn/salesreturn.component';
import { CustomerQutationDetailComponent } from './customer-qutation-detail/customer-qutation-detail.component';
import { CustomerSalesDetailComponent } from './customer-sales-detail/customer-sales-detail.component';
import { DeliveryOrderReportComponent } from './delivery-order-report/delivery-order-report.component';
import { GraphicalReportsComponent } from './graphical-reports/graphical-reports.component';
import { CustomerSalesOrderComponent } from './customer-sales-order/customer-sales-order.component';
import { InvoiceProfitAnalysisComponent } from './invoice-profit-analysis/invoice-profit-analysis.component';
import { CustomerOrderTrackingComponent } from './customer-order-tracking/customer-order-tracking.component';
import { BoquantityComponent } from './boquantity/boquantity.component';
import { BillOfMaterialsComponent } from './bill-of-materials/bill-of-materials.component';
import { CustomerQutationDetaisComponent } from './customer-qutation-detais/customer-qutation-detais.component';
import { JobInvoiceReportComponent } from './job-invoice-report/job-invoice-report.component';
import { SaleSummaryByDateComponent } from './sale-summary-by-date/sale-summary-by-date.component';
import { CustomerquotatonAceComponent } from './customerquotaton-ace/customerquotaton-ace.component';
 

const routes: Routes = [
  {
    path: 'customerquotation',
    component: CustomerquotationComponent,
    data: { title: 'Customer Quotation', titleI18n: 'Customer Quotation' }
  },
   {
    path: 'customerquotation-ace',
    component: CustomerquotatonAceComponent,
    data: { title: 'Customer Quotation Ace', titleI18n: 'Customer Quotation Ace' }
  },
  {
    path: 'customer-qutation-detail',
    component: CustomerQutationDetailComponent,
    data: { title: 'Customer Quotation Detail', titleI18n: 'Customer Quotation Detail' }
  },
  
  {
    path: 'customerenquiry',
    component: CustomerenquiryComponent,
    data: { title: 'Customer Enquiry', titleI18n: 'Customer Enquiry' }
  },
  {
    path: 'salesvoucher',
    component: SalesvoucherComponent,
    data: { title: 'Sales Voucher', titleI18n: 'Sales Voucher' }
  },
  {
    path: 'salesreturn',
    component: SalesreturnComponent,
    data: { title: 'Sales Return', titleI18n: 'Sales Return' }
  },
  {
    path: 'customer-sales-order',
    component: CustomerSalesOrderComponent,
    data: { title: 'Customer Sales Order', titleI18n: 'Customer Sales Order' }
  },
  {
    path: 'customer-order-tracking',
    component: CustomerOrderTrackingComponent,
    data: { title: 'Customer Order Tracking', titleI18n: 'Customer Order Tracking' }
  },
  {
    path: 'customer-sales-detail',
    component: CustomerSalesDetailComponent,
    data: { title: 'Customer Sales Details', titleI18n: 'Customer Sales Details' }
  },

  {
    path: 'deliverynote',
    component: DeliveryNoteComponent,
    data: { title: 'Delivery Note', titleI18n: 'Delivery Note' }
  },
  {
    path: 'delivery-note-status',
    component: DeliveryNoteStatusComponent,
    data: { title: 'Delivery Note Status', titleI18n: 'Delivery Note Status' }
  },
  {
    path: 'delivery-order-report',
    component: DeliveryOrderReportComponent,
    data: { title: 'Delivery Order Report', titleI18n: 'Delivery Order Report' }
  },
  {
    path: 'sales-voucher-report',
    component: ReportSalesVoucherComponent,
    data: { title: 'Report Sales Voucher', titleI18n: 'Report Sales Voucher' }
  },

  {
    path: 'report-sales-voucher',
    component: SalesReportComponent,
    data: { title: 'Report Sales Voucher', titleI18n: 'Report Sales Voucher' }
  },
  {
    path: 'customer-enquiry-search',
    component: CustomerEnquirySearchComponent,
    data: { title: 'Cusotmer Enquiry Search', titleI18n: 'Cusotmer Enquiry Search' }
  },
  {
    path: 'proformainvoice',
    component: ProformainvoiceComponent,
    data: { title: 'Proforma Invoice', titleI18n: 'Proforma Invoice' }
  },
  {
    path: 'customer-sales-report-wise',
    component: CutomerSalesDetailsComponent,
    data: { title: 'Customer Sales Wise Report', titleI18n: 'Customer Sales Wise Report' }
  },
  {
  path: 'invoice-profit-analysis',
  component: InvoiceProfitAnalysisComponent,
  data: { title: 'Invoice Profit Analysis', titleI18n: 'Invoice Profit Analysis' }
},
{
  path: 'salesmanwise-sales-report',
    component: SalesmanwiseComponent,
      data: { title: 'Salesman Wise Report', titleI18n: 'Salesman Wise Report' }
},
// {
//   path: 'invoice-profit-report',
//     component: InvoiceProfitReportComponent,
//       data: { title: 'Invoice Profit Report', titleI18n: 'Invoice Profit Report' }
// },
{
  path: 'graphical-reports',
    component: GraphicalReportsComponent,
      data: { title: 'Graphical Reports', titleI18n: 'Graphical Reports' }
},
{
  path: 'boquantity',
    component:BoquantityComponent,
      data: { title: 'Bill Of Quantity', titleI18n: 'Bill Of Quantity' }
},
{
  path: 'bill-of-materials',
    component: BillOfMaterialsComponent,
      data: { title: 'Bill of Materials', titleI18n: 'Bill of Materials' }
},
{
  path: 'billofmaterials',
    component: BillOfMaterialsComponent,
      data: { title: 'Bill of Materials', titleI18n: 'Bill of Materials' }
},

{
  path: 'job-invoice-report',
    component: JobInvoiceReportComponent,
      data: { title: 'job Invoice Report', titleI18n: 'job Invoice Report' }
},
{
  path: 'sale-summary-by-date',
    component: SaleSummaryByDateComponent,
      data: { title: 'Sale Summary By Date', titleI18n: 'Sale Summary By Date' }
},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaleRoutingModule { }
