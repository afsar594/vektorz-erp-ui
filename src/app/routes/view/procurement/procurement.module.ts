import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProcurementRoutingModule } from './procurement-routing.module';
import { PurchasevoucherComponent } from './purchasevoucher/purchasevoucher.component';
import { AccountRoutingModule } from '../account/account-routing.module';
import { PurchasereturnComponent } from './purchasereturn/purchasereturn.component';
import { ReportpurchasereturnComponent } from './reportpurchasereturn/reportpurchasereturn.component';
import { PurchaseorderComponent } from './purchaseorder/purchaseorder.component';
import { PurchaserequisitionComponent } from './purchaserequisition/purchaserequisition.component';
import { PurchasequotationComponent } from './purchasequotation/purchasequotation.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportpurchasevoucherComponent } from './reportpurchasevoucher/reportpurchasevoucher.component';
import { ReportpurchaserequisitionComponent } from './reportpurchaserequisition/reportpurchaserequisition.component';
import { ReportpurchaseorderComponent } from './reportpurchaseorder/reportpurchaseorder.component';
import { GeneralPurchaseOrderComponent } from './general-purchase-order/general-purchase-order.component';
import { PotrackingComponent } from './potracking/potracking.component';
import { PurchaseOrderListComponent } from './purchase-order-list/purchase-order-list.component';
import { StorerequisitionComponent } from './storerequisition/storerequisition.component';
import { PurchaseReportSupplierWiseComponent } from './purchase-report-supplier-wise/purchase-report-supplier-wise.component';
import { FileUploadModule, ListboxModule, MultiSelectModule, SplitButtonModule, TooltipModule, TreeModule, ChartModule, ProgressBarModule } from 'primeng';
import { PoApprovalStatusComponent } from './po-approval-status/po-approval-status.component';
import { PRstatusreportComponent } from './potracking/prstatusreport/prstatusreport.component';
import { PurchaseReportComponent } from './purchase-report/purchase-report.component';
import { RfqComponent } from './rfq/rfq/rfq.component';
import { PostToAccountGrnComponent } from './post-to-account-grn/post-to-account-grn.component';
import { BoqStatusReportComponent } from './boq-status-report/boq-status-report.component';
import { ApprvalComponent } from './apprval/apprval.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ApprovalStatusReportComponent } from './approval-status-report/approval-status-report.component';
import { POPRtrackingReportComponent } from './poprtracking-report/poprtracking-report.component';
import { PurchaseRequisitionStatusReportComponent } from './purchase-requisition-status-report/purchase-requisition-status-report.component';
import { CustQuatationComponent } from './purchaserequisition/cust-quatation/cust-quatation.component';
import { PurchaseOrderGlassComponent } from './purchase-order-glass/purchase-order-glass.component';
import { PurchaseOrderAnalysisComponent } from './reportpurchaseorder/purchase-order-analysis/purchase-order-analysis.component';
import { PurchaseVoucherAnalysisComponent } from './reportpurchasevoucher/purchase-voucher-analysis/purchase-voucher-analysis.component';


@NgModule({
  declarations: [PurchasevoucherComponent,
    PurchasereturnComponent,
    ReportpurchasereturnComponent,
    PurchaseReportComponent,
    PurchaseorderComponent,
    PurchaserequisitionComponent,
    PurchasequotationComponent,
    ReportpurchasevoucherComponent,
    ReportpurchaserequisitionComponent,
    ReportpurchaseorderComponent,
    PotrackingComponent,
    StorerequisitionComponent,
    PurchaseOrderListComponent,
    GeneralPurchaseOrderComponent,
    PurchaseReportSupplierWiseComponent,
    
    PRstatusreportComponent,
    PoApprovalStatusComponent,
    RfqComponent,
    PostToAccountGrnComponent,
    BoqStatusReportComponent,
    ApprvalComponent,
    ApprovalStatusReportComponent,
    POPRtrackingReportComponent,
    PurchaseRequisitionStatusReportComponent,
    CustQuatationComponent,
    PurchaseOrderGlassComponent,
    PurchaseOrderAnalysisComponent,
    PurchaseVoucherAnalysisComponent
  ],
  imports: [
    CommonModule,
    ProcurementRoutingModule,
    AccountRoutingModule,
    ListboxModule,
    SharedModule,
    MultiSelectModule,  
    TreeModule,
    SplitButtonModule,
    SplitButtonModule,
    ReactiveFormsModule,
    FileUploadModule,
    TooltipModule,
    ChartModule,
    ProgressBarModule
  ]
})
export class ProcurementModule { }
