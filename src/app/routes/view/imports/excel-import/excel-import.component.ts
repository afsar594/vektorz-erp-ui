import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng';
import { ImportApiService } from 'src/app/routes/service/import-api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-excel-import',
  templateUrl: './excel-import.component.html',
  styleUrls: ['./excel-import.component.scss']
})
export class ExcelImportComponent implements OnInit {

  uploadedFiles: any[] = [];
  fileurl: string = 'http://localhost:53447/weatherforecast/readexcelfile';
  constructor(private messageService: MessageService, private api: ImportApiService) {}

  onUpload(event) {
      for(let file of event.files) {
          this.uploadedFiles.push(file);
      }
      const formData =  new  FormData();
      for  (var i =  0; i <  this.uploadedFiles.length; i++)  {  
          formData.append("files",  this.uploadedFiles[i]);
      } 

      // this.api.upload(formData).subscribe((k) => {
      //   if(k == true) {
      //     this.messageService.add({severity: 'info', summary: 'Success', detail: 'File Uploaded'});
      //   }else {
      //     this.messageService.add({severity: 'info', summary: 'Success', detail: k.toString()});
      //   }
        
      // },err => {this.messageService.add({severity: 'error', summary: 'Error', detail: 'File Upload Failed'});})
      
      
  }

  
  ngOnInit(): void {
  }

}
