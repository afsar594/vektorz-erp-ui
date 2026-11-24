import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodeRoutingModule } from './code-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UnitComponent } from './unit/unit.component';
import { TypeComponent } from './type/type.component';
import { BrandComponent } from './brand/brand.component';
import { ModelComponent } from './model/model.component';


@NgModule({
  declarations: [UnitComponent, TypeComponent, BrandComponent, ModelComponent],
//  declarations: [ BrandComponent],
  imports: [
    CommonModule,
    SharedModule,
    CodeRoutingModule
  ]
})
export class CodeModule { }
