import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { NewDashboardComponent } from './new-dashboard/new-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: MainDashboardComponent,
    data: { title: 'Dashboard', titleI18n: 'dashboard' },
  },
  {
    path: 'sales-inventory',
    component: NewDashboardComponent,
    data: { title: 'Sales & Inventory Dashboard', titleI18n: 'sales_inventory_dashboard' },
  },
  {
    path: 'new',
    component: NewDashboardComponent,
    data: { title: 'Sales & Inventory Dashboard', titleI18n: 'sales_inventory_dashboard' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule,]
})
export class DashboardRoutingModule { }
