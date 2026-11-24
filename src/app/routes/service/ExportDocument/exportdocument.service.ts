import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportdocumentService {

  constructor() { }

  PrintPDF(elementId: string, css: string) {
    try {
      document.getElementById(elementId).hidden = false
      let printContents, popupWin;
      printContents = document.getElementById(elementId);
      popupWin = window.open('', '_blank');
      popupWin.document.open();
      popupWin.document.write(`<html>
      <style> ${css} </style>
      <body > ${printContents.outerHTML} </body>
      </html>`);
      document.getElementById(elementId).hidden = true
      popupWin.print();
      popupWin.close();
    } catch (error) {
      console.log("error in PrintPDF = " + error)
    }
  }

  OpenReportInNewTab(elementId: string, css: string) {
    try {
      const printContents = document.getElementById(elementId);
      if (!printContents) { console.warn('OpenReportInNewTab: element not found:', elementId); return; }
      const popupWin = window.open('', '_blank');
      popupWin.document.open();
      popupWin.document.write(`<!DOCTYPE html><html>
      <head><meta charset="UTF-8"><style> ${css} </style></head>
      <body> ${printContents.outerHTML} </body>
      </html>`);
      popupWin.document.close();
    } catch (error) {
      console.log("error in OpenReportInNewTab = " + error);
    }
  }

  ExportToDocument(elementId: string, filename: string, extension: string) {
    try {
      if (!window.Blob) {
        alert('Your legacy browser does not support this action.');
        return;
      }
      var html, link, blob, url, css;
      css = (
        '<style>'
        +
        `
   * {
   box-sizing: border-box;
}
.col-12 h1 {
   text-align: center;
   color: rgb(18, 21, 75);
   text-decoration: bold;
   font-size: 140%;
}
.col-12 h2 {
   text-align: center;
   color: rgb(6, 6, 20);
   font-size: 30px;
}
.col-12 h3 {
   color: rgb(50, 117, 68);
}
.col-12 body table {
   font-family: arial, sans-serif;
   border-collapse: collapse;
   width: 100%;
}
td, th {
   width: 15rem;
   border: 1px solid #bbb9b9;
   text-align: center;
   padding: 9px;
   text-align: center;
}
tr:nth-child(even) {
   background-color: #bebbbb;
   border: 1px solid #dddddd;
}
p {
   text-align: center;
}
.heading {
   color: white;
   background-color: rgb(8, 145, 122);
   width: 96%;
   height: 5%;
   padding-left: 5%;
   text-align: center;
   padding: 0px;
   margin: 0px;
   border: 1px solid #979393;
}
.column {
   float: left;
   padding-left: 5%;
   width: 16%;
   padding: 10px;
   height: 30px;
   text-align: center;
   color: white;
   border: 1px solid #979393;
}
.row:after {
   content: "";
   display: table;
   clear: both;
   padding: 5%;
}
   `+
        '</style>'
      );
      html = document.getElementById(elementId)?.innerHTML;
      blob = new Blob(['\ufeff', css + html], {
        type: 'application/msword'
      });
      url = URL.createObjectURL(blob);
      link = document.createElement('A');
      link.href = url;
      link.download = filename + extension
      document.body.appendChild(link);
      //@ts-ignore
      if (window.navigator.msSaveOrOpenBlob) {
        (window.navigator as any).msSaveOrOpenBlob(blob, filename);
      } // IE10-11
      else {
        link.click();
      }  // other browsers
      document.body.removeChild(link);
    } catch (error) {
      console.log("error in ExportToDocument = " + error)
    }
  }
}