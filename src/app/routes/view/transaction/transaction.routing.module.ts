import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeaveDetailComponent } from './leave-detail/leave-detail.component';
const routes: Routes = [
   {
    path: 'leave-detail',
    component: LeaveDetailComponent,
    data: { title: 'Leave Details', titleI18n: 'Leave Details' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionRoutingModule { }
