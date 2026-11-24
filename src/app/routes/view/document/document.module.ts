import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentRoutingModule } from './document-routing.module';
import { DocumentReportComponent } from './document-report/document-report.component';
import { DocumenttypeComponent } from './documenttype/documenttype.component';
import { DocumentsComponent } from './documents/documents.component';
import { ListboxModule } from 'primeng';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    DocumentReportComponent,
    DocumenttypeComponent,
    DocumentsComponent
  ],
  imports: [
    CommonModule,
    DocumentRoutingModule,
    ListboxModule,
    SharedModule,
  ]
})
export class DocumentModule { }
