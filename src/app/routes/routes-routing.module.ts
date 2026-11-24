import { NgModule } from '@angular/core';
import { Routes, RouterModule, NoPreloading } from '@angular/router';
import { MainComponent } from '../layout/main/main.component';
import { LoginComponent } from './session/login/login.component';
import { AuthGuard } from '../core/Guards/auth.guard';
import { PurchaseOrderRequisitionApprovalEmailTemplateComponent } from './session/purchase-order-requisition-approval-email-template/purchase-order-requisition-approval-email-template.component';


const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'purchase-order/approve-email-template',
    component: PurchaseOrderRequisitionApprovalEmailTemplateComponent,
  },
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/login', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadChildren: () =>
          import('./view/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'import/excel',
        loadChildren: () =>
          import('./view/imports/imports.module').then(m => m.ImportsModule),
      },
      {
        path: 'master',
        loadChildren: () =>
          import('./view/master/master.module').then(m => m.MasterModule),
      },
      {
        path: 'document',
        loadChildren: () =>
          import('./view/document/document.module').then(m => m.DocumentModule),
      },
      {
        path: 'account',
        loadChildren: () =>
          import('./view/account/account.module').then(m => m.AccountModule),
      },
      {
        path: 'administration',
        loadChildren: () =>
          import('./view/administration/administration.module').then(m => m.AdministrationModule),
      },
      {
        path: 'misreport',
        loadChildren: () =>
          import('./view/misreport/misreport.module').then(m => m.MisreportModule),
      },
      {
        path: 'procurement',
        loadChildren: () =>
          import('./view/procurement/procurement.module').then(m => m.ProcurementModule),
      },
      {
        path: 'sale',
        loadChildren: () =>
          import('./view/sale/sale.module').then(m => m.SaleModule),
      },
      {
        path: 'storewarehouse',
        loadChildren: () =>
          import('./view/storewarehouse/storewarehouse.module').then(m => m.StorewarehouseModule),
      },
      {
        path: 'transaction',
        loadChildren: () =>
          import('./view/transaction/transaction.module').then(m => m.TransactionModule),
      },
      // wildcard must be last
      {
        path: '**',
        redirectTo: '/dashboard',
      },
    ],
  },
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading }),
  ],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class RoutesRoutingModule { }
