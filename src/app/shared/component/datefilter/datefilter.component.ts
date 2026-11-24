import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-datefilter',
  templateUrl: './datefilter.component.html',
  styleUrls: ['./datefilter.component.scss'],
})
export class DatefilterComponent implements OnInit {
  @Input() enableDate: boolean = false;
  @Output() enableDateChange = new EventEmitter<boolean>();
  DateFilterType = {
    MONTH: 'month',
    YEAR: 'year',
    CUSTOM: 'custom',
  };
  monthFilterType = {
    ThisMonth: 'ThisMonth',
    PreviousMonth: 'PreviousMonth',
  };
  selectedMonth = this.monthFilterType.ThisMonth;

  selectedDateFilter: string = this.DateFilterType.MONTH;
  yearList: any[] = [];
  selectedYear: number;

  dateFrom = new Date();
  dateTo = new Date();

  constructor(private utilityService: UtilityService) {}

  ngOnInit(): void {
    this.selectedYear = new Date().getFullYear();
    for (let year = this.selectedYear; year >= this.selectedYear - 20; year--) {
      this.yearList.push({
        label: year.toString(),
        value: year,
      });
    }
  }
  toggleDate() {
    this.enableDate = !this.enableDate;
    this.enableDateChange.emit(this.enableDate);
  }
  onApplyDateFilter() {
    if (!this.enableDate) return { fromDate: null, toDate: null };

    const currentDate = new Date();
    let dateFrom: Date = null;
    let dateTo: Date = null;

    if (this.selectedDateFilter == 'month') {
      if (this.selectedMonth == 'ThisMonth') {
        // Current month
        const firstDay = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const lastDay = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        dateFrom = firstDay;
        dateTo = lastDay;
      } else {
        // Previous month
        const firstDayPrevMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        const lastDayPrevMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0
        );

        dateFrom = firstDayPrevMonth;
        dateTo = lastDayPrevMonth;
      }
    } else if (this.selectedDateFilter == 'year') {
      const year = this.selectedYear;
      const firstDayOfYear = new Date(year, 0, 1);
      const lastDayOfYear = new Date(year, 11, 31);

      dateFrom = firstDayOfYear;
      dateTo = lastDayOfYear;
    } else {
      dateFrom = this.dateFrom;
      dateTo = this.dateTo;
    }
    const fromDate = this.utilityService.fromAndToDateformater(
      dateFrom,
      'from'
    );
    const toDate = this.utilityService.fromAndToDateformater(dateTo, 'to');

    return { fromDate, toDate };
  }
}
