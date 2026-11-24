import { Component, Input, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng';

@Component({
  selector: 'app-excel-preview-dialog',
  templateUrl: './excel-preview-dialog.component.html',
  styleUrls: ['./excel-preview-dialog.component.scss']
})
export class ExcelPreviewDialogComponent implements OnInit {
 
  receivedData: any;

  constructor(

    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit(): void {
    
    this.receivedData = this.config.data;
  }


  downloadExcel() {
    const link = document.createElement('a');
    link.href = this.receivedData.blobUrl;
    link.download = this.receivedData.filename;
    link.click();
  }
}
