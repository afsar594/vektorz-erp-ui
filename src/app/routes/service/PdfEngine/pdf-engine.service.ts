import { Injectable } from '@angular/core';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfEngineService {

  constructor() { }

  /** Opens the generated PDF in a new browser tab. */
  openInNewTab(docDefinition: any): void {
    (pdfMake as any).createPdf(docDefinition).open();
  }

  /** Downloads the generated PDF. */
  download(docDefinition: any, filename: string = 'report.pdf'): void {
    (pdfMake as any).createPdf(docDefinition).download(filename);
  }
}
