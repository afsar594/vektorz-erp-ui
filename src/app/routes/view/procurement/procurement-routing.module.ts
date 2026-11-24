import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PurchaseorderComponent } from './purchaseorder/purchaseorder.component';
import { PurchasequotationComponent } from './purchasequotation/purchasequotation.component';
import { PurchaserequisitionComponent } from './purchaserequisition/purchaserequisition.component';
import { PurchasereturnComponent } from './purchasereturn/purchasereturn.component';
import { PurchasevoucherComponent } from './purchasevoucher/purchasevoucher.component';
import { ReportpurchaseorderComponent } from './reportpurchaseorder/reportpurchaseorder.component';
import { ReportpurchaserequisitionComponent } from './reportpurchaserequisition/reportpurchaserequisition.component';
import { ReportpurchasereturnComponent } from './reportpurchasereturn/reportpurchasereturn.component';
import { ReportpurchasevoucherComponent } from './reportpurchasevoucher/reportpurchasevoucher.component';
import { PotrackingComponent } from './potracking/potracking.component';
import { GeneralPurchaseOrderComponent } from './general-purchase-order/general-purchase-order.component';
import { PurchaseReportSupplierWiseComponent } from './purchase-report-supplier-wise/purchase-report-supplier-wise.component';
import { StorerequisitionComponent } from './storerequisition/storerequisition.component';
import { PurchaseOrderListComponent } from './purchase-order-list/purchase-order-list.component';
import { PoApprovalStatusComponent } from './po-approval-status/po-approval-status.component';
import { PRstatusreportComponent } from './potracking/prstatusreport/prstatusreport.component';
import { PurchaseReportComponent } from './purchase-report/purchase-report.component';
import { RfqComponent } from './rfq/rfq/rfq.component';
import { PostToAccountGrnComponent } from './post-to-account-grn/post-to-account-grn.component';
import { BoqStatusReportComponent } from './boq-status-report/boq-status-report.component';
import { ApprvalComponent } from './apprval/apprval.component';
import { ApprovalStatusReportComponent } from './approval-status-report/approval-status-report.component';
import { POPRtrackingReportComponent } from './poprtracking-report/poprtracking-report.component';
import { PurchaseRequisitionStatusReportComponent } from './purchase-requisition-status-report/purchase-requisition-status-report.component';
import { PurchaseOrderGlassComponent } from './purchase-order-glass/purchase-order-glass.component';
const routes: Routes = [
  {
    path: 'potracking',
    component: PotrackingComponent,
    data: { title: 'Purchase Order Tracking', titleI18n: 'Purchase Order Tracking' },
  },
  {
    path: 'rfq',
    component: RfqComponent,
    data: { title: 'RFQ', titleI18n: 'RFQ' },
  },
  {
    path: 'PoPrtracking',
    component: POPRtrackingReportComponent,
    data: { title: 'PO PR Tracking', titleI18n: 'PO PR' },
  },
  {
    path: 'Polist',
    component: PurchaseOrderListComponent,
    data: { title: 'Purchase Order list', titleI18n: 'Purchase Order list' },
  },

  {
    path: 'purchasevoucher',
    component: PurchasevoucherComponent,
    data: { title: 'Purchase Voucher', titleI18n: 'Purchase Voucher' }
  },

  {
    path: 'purchasereturn',
    component: PurchasereturnComponent,
    data: { title: 'Purchase Return', titleI18n: 'Purchase Return' }
  },

  // {
  //   path: 'reportpurchasereturn',
  //   component: ReportpurchasereturnComponent,
  //   data: { title: 'Purchase Return Report', titleI18n: 'Purchase Return Report' }
  // },
  {
    path: 'reportpurchasereturn',
    component: PurchaseReportComponent,
    data: { title: 'Purchase Report', titleI18n: 'Purchase Report' },
  },
  {
    path: 'posttoaccountgrn',
    component: PostToAccountGrnComponent,
    data: { title: 'Post To Account GRN', titleI18n: 'Post To Account GRN' },
  },
  {
    path: 'purchaseorder',
    component: PurchaseorderComponent,
    data: { title: 'Purchase Order', titleI18n: 'Purchase Order' }
  },

  {
    path: 'purchasequotation',
    component: PurchasequotationComponent,
    data: { title: 'Purchase Quotation', titleI18n: 'Purchase Quotation' }
  },
  {
    path: 'purchaserequisition',
    component: PurchaserequisitionComponent,
    data: { title: 'Purchase Requisition', titleI18n: 'Purchase Requisition' }
  },

  {
    path: 'reportpurchasevoucher',
    component: ReportpurchasevoucherComponent,
    data: { title: 'Purchase Voucher  Report', titleI18n: 'Purchase Voucher Report' }
  },
  {
    path: 'reportpurchaserequisition',
    component: ReportpurchaserequisitionComponent,
    data: { title: 'Purchase Requisition Report', titleI18n: 'Purchase Requisition Report' }
  },

  {
    path: 'reportpurchaseorder',
    component: ReportpurchaseorderComponent,
    data: { title: 'Purchase Order Report', titleI18n: 'Purchase Order Report' }
  },
  {
    path: 'po-approval',
    // component: PoApprovalComponent,
    component: ApprvalComponent,

    data: { title: 'PO Approval(Proved Entries Only)', titleI18n: 'P O Approval(Proved Entries Only)' },
  },
  {
    path: 'approvalStatus',
    component: ApprovalStatusReportComponent,
    data: { title: 'Approval Status Report', titleI18n: 'Approval Status Report' },
  },
  {
    path: 'general-purchase-order',
    component: GeneralPurchaseOrderComponent,
    data: { title: ' General Purchase Order', titleI18n: 'General Purchase Order' },
  },

  {
    path: 'Purchase-Report-Supplier-Wise',
    component: PurchaseReportSupplierWiseComponent,
    data: { title: 'Purchase Report Supplier Wise', titleI18n: 'Purchase Report Supplier Wise' },
  },
  {
    path: 'prstatusreport',
    component: PRstatusreportComponent,
    data: { title: 'Purchase Requisition Status Report', titleI18n: 'Purchase Requisition Status Report' }
  },
    {
    path: 'purchaserequisitionstatusreport',
    component: PurchaseRequisitionStatusReportComponent,
    data: { title: 'Purchase Requisition Status Report', titleI18n: 'Purchase Requisition Status Report' }
  },
  {
    path: 'storerequisition',
    component: StorerequisitionComponent,
    data: { title: 'Store Requisition', titleI18n: 'Store Requisition' }
  },
  {
    path: 'po-approval-status',
    component: PoApprovalStatusComponent,
    data: { title: 'Purchase Order Approval Status', titleI18n: 'Purchase Order Approval Status' },
  },
  {
    path: 'posttoaccountgrn',
    component: PostToAccountGrnComponent,
    data: { title: 'Post To Account Grn', titleI18n: 'Post To Account Grn' },
  },
  {
    path: 'boq-status-report',
    component: BoqStatusReportComponent,
    data: { title: 'boq status report', titleI18n: 'boq status report' },
  },
  {
    path: 'purchase-order-glass',
    component: PurchaseOrderGlassComponent,
    data: { title: 'Purchase Order Glass', titleI18n: 'Purchase Order Glass' },
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcurementRoutingModule { }
