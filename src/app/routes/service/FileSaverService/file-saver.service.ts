import { Injectable } from '@angular/core';
import jspdf from 'jspdf';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class FileSaverService {

  constructor() { }


  // saveAsPDF(data) {
  //   html2canvas(data).then(async canvas => {
  //     var imgWidth = 208;
  //     var imgHeight = canvas.height * imgWidth / canvas.width;
  //     const contentDataURL = canvas.toDataURL('image/png')
  //     let pdf = new jspdf('p', 'mm', 'a4');
  //     var position = 0;
  //     pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
  //     let y = 500 // Height position of new content
  //     if (y >= window.innerHeight) {
  //       pdf.addPage();
  //       y = 0 // Restart height position
  //     }
  //     pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
  //     // pdf.save('PDF.pdf');
  //     pdf.save('MultiAccountTrans_'+new Date() + '.pdf')
  //   });
  // }


  // window.jsPDF = window.jspdf.jsPDF;
  // saveAsPDF(data,fileName="") {
  //   let jsPdf = new jspdf('p', 'mm', 'a4');
  //   var htmlElement = data;
  //   //document.getElementById('doc-target');
  //   // you need to load html2canvas (and dompurify if you pass a string to html)
  //   const opt = {
  //     callback: function (jsPdf) {
  //       jsPdf.save('BalanceSheet_Summary_'+new Date() + '.pdf');
  //       // to open the generated PDF in browser window
  //       // window.open(jsPdf.output('bloburl'));
  //     },
  //     margin: [0, 0, 0, 0],
  //     autoPaging: 'text',
  //     html2canvas: {
  //       allowTaint: true,
  //       dpi: 1,
  //       letterRendering: true,
  //       logging: false,
  //       scale: .175
  //     }
  //   };
  //   //@ts-ignore
  //   jsPdf.html(htmlElement, opt);
  // }
  saveAsPDF(data, fileName?: any) {
    let jsPdf = new jspdf('p', 'mm', 'a4');
    var htmlElement = data;//document.getElementById('doc-target');
    // you need to load html2canvas (and dompurify if you pass a string to html)
    const opt = {
      callback: function (jsPdf) {
        jsPdf.save(fileName + '.pdf');
        // to open the generated PDF in browser window
        window.open(jsPdf.output('bloburl'));
      },
      margin: [0, 0, 0, 0],
      autoPaging: 'text',
      html2canvas: {
        allowTaint: true,
        dpi: 1,
        letterRendering: true,
        logging: false,
        scale: .175
      }
    };
    //@ts-ignore
    jsPdf.html(htmlElement, opt);
  }

  saveAsWord(html: any, filename: string) {
    var blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });

    // Specify link url
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

    // Specify file name
    filename = filename ? filename + '.doc' : 'document.doc';

    // Create download link element
    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);
    //@ts-ignore
    if (navigator.msSaveOrOpenBlob) {
      //@ts-ignore
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // Create a link to the file
      downloadLink.href = url;

      // Setting the file name
      downloadLink.download = filename;

      //triggering the function
      downloadLink.click();
    }

    document.body.removeChild(downloadLink);
  }
  saveAsDocx(html: any) {
    var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    var footer = "</body></html>";
    var sourceHTML = header + html + footer;

    var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    var fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'document.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  PrintPDF(elementId: string, css: string) {
    try {
      let printContents, popupWin;
      // document.getElementById(elementId).hidden = false
      printContents = document.getElementById(elementId);
      popupWin = window.open('', '_blank');
      popupWin.document.open();
      popupWin.document.write(`<html>
      <style> ${css} </style>
      <body > ${printContents.outerHTML} </body>
      </html>`);
      // document.getElementById(elementId).hidden = true
      popupWin.print();
      popupWin.close();
    } catch (error) {
      console.log("error in PrintPDF = " + error)
    }
  }
  // saveExcel(data: any) {
  //   const fileName = 'download';
  //   const exportType = exportFromJSON.types.xls;
  //   exportFromJSON({ data, fileName, exportType })
  // }

  exportExcel(tableId: string, fileName: string): void {
    let element = document.getElementById(tableId);
    if (!element) {
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);
  }
}
