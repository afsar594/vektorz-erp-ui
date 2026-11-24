import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  generateFinancialReport(
    title: string,
    headers: string[],
    body: any[][],
    summary: { label: string; value: any }[] = [],
    periodText?: string,
    logoPath: string = '',
  ) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    //--------------------------------------------------
    // 🏷️ HEADER
    //--------------------------------------------------
    try {

      doc.addImage(logoPath, 'PNG', pageWidth - 150, 20, 100, 40);
    } catch {
      // logo optional, skip if missing
    }

    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Inspire Systems', 40, 40);

    doc.setFontSize(13);
    doc.text(title, 40, 65);

    doc.setFontSize(10);
    doc.setTextColor(80);
    if (periodText) doc.text(periodText, 40, 80);

    //--------------------------------------------------
    // 📊 TABLE DATA PREPROCESSING (Hide Duplicates)
    //--------------------------------------------------
    const processedBody = body.map((row, i) => {
      const prev = body[i - 1];
      if (i === 0) return row;

      const newRow = [...row];
      if (prev && prev[0] === row[0]) newRow[0] = ''; // Hide duplicate HeadType
      if (prev && prev[1] === row[1] && prev[0] === row[0]) newRow[1] = ''; // Hide duplicate SubHead
      return newRow;
    });

    //--------------------------------------------------
    // 📊 TABLE
    //--------------------------------------------------
    autoTable(doc, {
      startY: 100,
      head: [headers],
      body: processedBody,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        halign: 'center',
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        [headers.length - 1]: { halign: 'right' },
      },
    } as UserOptions);

    //--------------------------------------------------
    // 🧾 SUMMARY
    //--------------------------------------------------
    let finalY = (doc as any).lastAutoTable.finalY + 20;

    if (summary && summary.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text('Summary Totals:', 40, finalY);
      finalY += 15;

      summary.forEach((s) => {
        doc.text(`${s.label}:`, 60, finalY);
        doc.text(String(s.value ?? ''), pageWidth - 60, finalY, {
          align: 'right',
        });
        finalY += 14;
      });
    }

    //--------------------------------------------------
    // 📅 FOOTER
    //--------------------------------------------------
    finalY += 20;
    doc.setDrawColor(150);
    doc.line(40, finalY, pageWidth - 40, finalY);

    doc.setFontSize(9);
    doc.setTextColor(100);
    const generated = `Generated on: ${new Date().toLocaleString()}`;
    const powered = 'Powered by Inspire Systems';
    doc.text(generated, 40, finalY + 15);
    doc.text(powered, pageWidth - 40, finalY + 15, { align: 'right' });

    //--------------------------------------------------
    // 💾 SAVE
    //--------------------------------------------------
    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  }

  generateAgeingReport(data: any[], logoPath: string = '') {
    // 🧭 Landscape orientation (notice the 'l' parameter)
    const doc = new jsPDF('l', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    //--------------------------------------------------
    // 🏷️ HEADER
    //--------------------------------------------------
    try {
      doc.addImage(logoPath, 'PNG', pageWidth - 150, 20, 100, 40);
    } catch { }
    doc.setFontSize(16);
    doc.text('Inspire Systems', 40, 40);
    doc.setFontSize(13);
    doc.text('Ageing Report', 40, 65);
    doc.setFontSize(10);
    doc.text(`As On: ${new Date().toLocaleDateString()}`, 40, 80);

    //--------------------------------------------------
    // 📊 TABLE
    //--------------------------------------------------
    const headers = [
      'Name',
      'Acc No',
      '0-30',
      '31-60',
      '61-90',
      '91-180',
      '181-270',
      '271-360',
      '360+',
      'Balance',
      'UnAllocated',
    ];

    const body = data.map((x) => [
      x.name,
      x.accNo,
      x.zeroThirty,
      x.thirtyOneSixty,
      x.sixtyOneNinety,
      x.ninetyOneToOneEighty,
      x.oneEightOneToTwoSeventy,
      x.twoSevenOneToThreeSixty,
      x.overThreeSixty,
      x.outBalance,
      x.unAllocated,
    ]);

    autoTable(doc, {
      startY: 100,
      head: [headers],
      body,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [33, 150, 243], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 120 }, // Name
        1: { cellWidth: 70 }, // Acc No
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' },
        10: { halign: 'right' },
      },
    } as UserOptions);

    //--------------------------------------------------
    // 🧾 TOTALS
    //--------------------------------------------------
    const totalY = (doc as any).lastAutoTable.finalY + 20;
    const totalOutBalance = data
      .reduce((sum, x) => sum + Number(x.outBalance || 0), 0)
      .toFixed(2);

    doc.setFontSize(11);
    doc.text('Grand Total:', pageWidth - 180, totalY);
    doc.text(totalOutBalance.toString(), pageWidth - 60, totalY, {
      align: 'right',
    });

    //--------------------------------------------------
    // 📅 FOOTER
    //--------------------------------------------------
    const footerY = totalY + 25;
    doc.setDrawColor(150);
    doc.line(40, footerY, pageWidth - 40, footerY);
    doc.setFontSize(9);
    const generated = `Generated on: ${new Date().toLocaleString()}`;
    const powered = 'Powered by Inspire Systems';
    doc.text(generated, 40, footerY + 15);
    doc.text(powered, pageWidth - 40, footerY + 15, { align: 'right' });

    //--------------------------------------------------
    // 💾 SAVE
    //--------------------------------------------------
    doc.save(`Ageing_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
