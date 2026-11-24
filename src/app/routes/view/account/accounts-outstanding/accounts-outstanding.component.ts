import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-accounts-outstanding',
  templateUrl: './accounts-outstanding.component.html',
  styleUrls: ['./accounts-outstanding.component.scss']
})
export class AccountsOutstandingComponent implements OnInit {
  title: string;
  subtitle: string;
  index: number = 0;
  show:boolean;
  displayPrintPreview: boolean = false; 

  handleChange(e) {
    this.index = e.index;
  }
  constructor(    private activatedroute: ActivatedRoute,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
    }); 
     this.show=true;
  }
  displayPrint() {
    this.displayPrintPreview = true;
   }
  

  userTrackingLog(type) {
    let req = {
      page: 'Account Outstanding Printing',
       isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: '',
      vpType: ''
    }
    this.utilityService.AddUserTrackingLog(req).subscribe(
      (res) => {
        console.log('Response:', res);
      });
  }


  printAsPDF() { 

  
    const fileName = String(new Date().valueOf());
    var css: string = `
    .mainhead{
      color: rgb(0, 0, 0);
      text-align: center;
       margin-bottom: -5px;
       margin-top: 15px;

   }
  .subhead{
  text-align: center;
  color: rgb(0, 0, 0);
   margin-bottom: -5px;
  }
  .head{
      color: rgb(0, 0, 0);
       text-align: center;
       margin-bottom: 5px;     
  }
  .Account {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
     }
    
    .Account td, .Account th {
      border: 1px solid #aca8a8;
      padding: 8px;
    }
    
    .Account tr:nth-child(even){background-color: #f2f2f2;}
    
    .Account tr:hover {background-color: #ddd;}
    
    .Account th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: rgb(81, 173, 209);
      color: black;
      font-weight: lighter;
   
    }
   
    `
    this.printService.PrintPDF('print', css)
    this.userTrackingLog('PDF')
  }

}
