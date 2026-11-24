import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntryComponent } from './entry/entry.component';
import { ListComponent } from './list/list.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'list'
  }, {
    path: 'entry/:id',
    component: EntryComponent,
    data: { title: 'Chart of Account Entry', titleI18n: 'Chart of Account Entry' }
  }, {
    path: 'edit/:id',
    component: EntryComponent,
    data: { title: 'Chart of Account Entry', titleI18n: 'Chart of Account Updation' }
  }, {
    path: 'list',
    component: ListComponent,
    data: { title: 'Chart of Account List', titleI18n: 'Chart of Account List' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChartOfAccountsRoutingModule { }
