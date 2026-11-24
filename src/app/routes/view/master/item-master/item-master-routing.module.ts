import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntryComponent } from './entry/entry.component';
import { ListComponent } from './list/list.component';
import { ItemMergeComponent } from './merge/item-merge.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
  },
  {
    path: 'entry/:id',
    component: EntryComponent,
    data: { title: 'Item Master Entry', titleI18n: 'Item Master Entry' },
  },
  {
    path: 'entry',
    component: EntryComponent,
    data: { title: 'Item Master Entry', titleI18n: 'Item Master Entry' },
  },
  {
    path: 'edit/:id',
    component: EntryComponent,
    data: { title: 'Item Master Entry', titleI18n: 'Item Master Updation' },
  },
  {
    path: 'list',
    component: ListComponent,
    data: { title: 'Item Master List', titleI18n: 'Item Master List' },
  },
  {
    path: 'merge',
    component: ItemMergeComponent,
    data: { title: 'Item Merge', titleI18n: 'Item Merge' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemMasterRoutingModule {}
