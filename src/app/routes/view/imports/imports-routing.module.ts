import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExcelImportComponent } from './excel-import/excel-import.component';

const routes: Routes = [
  {
    path: '',
    component: ExcelImportComponent,
    data: { title: 'Import', titleI18n: 'Import' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportsRoutingModule { }
