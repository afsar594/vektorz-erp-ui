import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportDateFormatService {

  constructor() { }
  mmddyyyy(date: string | Date, shortYear: boolean = false): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      throw new Error("Invalid date");
    }

    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = shortYear
      ? String(d.getFullYear()).slice(-2)
      : String(d.getFullYear());

    return `${month}/${day}/${year}`;
  }
  yyyymmdd(date: string | Date): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      throw new Error("Invalid date");
    }

    const month: string = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day: string = String(d.getDate()).padStart(2, '0');
    const year: string = String(d.getFullYear()); // Get last two digits of the year

    return `${year}-${month}-${day}`;
  }
   public ddmmyyyy(dateString: string | Date): string {
    if (!dateString) return '';
    let date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };
    formatDatetime(dateString: any, fromDate: boolean): string {
    const time = fromDate ? 'T00:00:00' : 'T23:59:59';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}${time}`;
  }
}