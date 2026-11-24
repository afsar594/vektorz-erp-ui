import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemMasterRoutingModule } from './item-master-routing.module';
import { EntryComponent } from './entry/entry.component';
import { ListComponent } from './list/list.component';
import { ItemMergeComponent } from './merge/item-merge.component';
import { QRCodeModule } from 'angularx-qrcode';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxBarcodeModule } from 'ngx-barcode';
import { NgxPrintModule } from 'ngx-print';
import { ContextMenuModule, TreeModule, FileUploadModule } from 'primeng';
@NgModule({
  declarations: [EntryComponent, ListComponent, ItemMergeComponent],
  imports: [
    CommonModule,
    ItemMasterRoutingModule,
    SharedModule,
    NgxBarcodeModule,
    ContextMenuModule,
    TreeModule,
    FileUploadModule,
    QRCodeModule,
    NgxPrintModule
  ],
})
export class ItemMasterModule {}
