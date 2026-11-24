import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {
 exportAsExcelFile(columnKeys: string[], json: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json, { header: columnKeys });

    // Set column widths (adjust as needed)
    worksheet['!cols'] = [
      { wch: 10 },  // Id
      { wch: 20 },  // PortNo
      { wch: 30 },  // Item_Name
      { wch: 10 },  // Unit
      { wch: 10 },  // Stock
      { wch: 10 },  // Rate
      { wch: 15 }   // Amount
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }

///stockLedgerReport/////////
 stockLedgerexportAsExcelFile(columnKeys: string[], json: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json, { header: columnKeys });

    // Set column widths (adjust as needed)
    worksheet['!cols'] = [
      { wch: 10 },  // Id
      { wch: 20 },  // PortNo
      { wch: 30 },  // Item_Name
      { wch: 10 },  // Unit
      { wch: 10 },  // Stock
      { wch: 10 },  // Rate
      { wch: 15 } ,  // Amount
      { wch: 15 } ,  // Amount
      { wch: 15 } ,  // Amount
      { wch: 15 } ,  // Amount
      { wch: 15 }  , // Amount
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    FileSaver.saveAs(data, `${fileName}_export.xlsx`);
  }
}
