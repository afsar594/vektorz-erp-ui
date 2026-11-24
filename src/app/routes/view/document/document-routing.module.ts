import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentsComponent } from './documents/documents.component';
import { DocumenttypeComponent } from './documenttype/documenttype.component';
import { DocumentReportComponent } from './document-report/document-report.component';

const routes: Routes = [
  {
    path: 'documents',
    component: DocumentsComponent,
    data: { title: 'Documents', titleI18n: 'documents' }
  },

  {
    path: 'documentType',
    component: DocumenttypeComponent,
    data: { title: 'Document Type', titleI18n: 'Document Type' }
  },
  {
    path: 'documentReport',
    component: DocumentReportComponent,
    data: { title: 'Document Report', titleI18n: 'Document Report' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentRoutingModule { }
