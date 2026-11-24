import { NgModule } from '@angular/core';
import { RoutesRoutingModule } from './routes-routing.module';
import { LoginComponent } from './session/login/login.component';
import { CommonModule, DatePipe } from '@angular/common';
import {
  SplitButtonModule,
  ToastModule,
  TriStateCheckboxModule,
} from 'primeng';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from '../core/Guards/auth.guard';
import { PurchaseOrderRequisitionApprovalEmailTemplateComponent } from './session/purchase-order-requisition-approval-email-template/purchase-order-requisition-approval-email-template.component';
import { SharedModule } from '../shared/shared.module';
const COMPONENTS = [];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [
    RoutesRoutingModule,
    CommonModule,
    TriStateCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    SplitButtonModule,
    SharedModule,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_DYNAMIC,
    LoginComponent,
    PurchaseOrderRequisitionApprovalEmailTemplateComponent,
  ],
  entryComponents: COMPONENTS_DYNAMIC,
  providers: [DatePipe, AuthGuard],
})
export class RoutesModule {}
