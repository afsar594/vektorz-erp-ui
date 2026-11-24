import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImportsRoutingModule } from './imports-routing.module';
import { ExcelImportComponent } from './excel-import/excel-import.component';
import { FileUploadModule, ToastModule } from 'primeng';


@NgModule({
  declarations: [ExcelImportComponent],
  imports: [
    CommonModule,
    ImportsRoutingModule,
    FileUploadModule,
    ToastModule
  ]
})
export class ImportsModule { }
