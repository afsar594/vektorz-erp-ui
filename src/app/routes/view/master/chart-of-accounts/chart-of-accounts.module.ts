import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartOfAccountsRoutingModule } from './chart-of-accounts-routing.module';

import { SharedModule } from 'src/app/shared/shared.module';
import { EntryComponent } from './entry/entry.component';
import { ListComponent } from './list/list.component';
import { ContextMenuModule, TreeModule } from 'primeng';


@NgModule({
  declarations: [EntryComponent, ListComponent],
  imports: [
    CommonModule,
    ChartOfAccountsRoutingModule,
    SharedModule,
    ContextMenuModule,
    TreeModule
  ]
})
export class ChartofAccountModule { }
