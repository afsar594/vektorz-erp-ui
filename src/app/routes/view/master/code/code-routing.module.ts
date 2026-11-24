import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TypeComponent } from './type/type.component';
import { UnitComponent } from './unit/unit.component';
import { BrandComponent } from './brand/brand.component';
import { ModelComponent } from './model/model.component';


const routes: Routes = [

  {
    path: 'brand',
    component: BrandComponent,
    data: { title: 'Brand Master', titleI18n: 'Brand Master' },
  },
  {
    path: 'model',
    component: ModelComponent,
    data: { title: 'Model Master', titleI18n: 'Model Master' },
  },
  {
    path: 'type',
    component: TypeComponent,
    data: { title: 'Type Master', titleI18n: 'Make Master' },
  },
  {
    path: 'unit',
    component: UnitComponent,
    data: { title: 'Unit Master', titleI18n: 'Make Master' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodeRoutingModule { }
