import { Directive, Host, Self, HostListener, Input } from '@angular/core';
import { Calendar } from 'primeng/calendar';

@Directive({
  selector: '[useUtc]',
})
export class UseUtcDirective {
  @Input() time = false;

  constructor(@Host() @Self() private calendar: Calendar) {}

  @HostListener('onSelect')
  @HostListener('onInput')
  onValueChange() {
    this.toUtc();
  }

  private toUtc() {
    const value = this.calendar.value;
    if (!value) return;

    const d = new Date(value);

    const utcDate = this.time
      ? new Date(
          Date.UTC(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            d.getHours(),
            d.getMinutes(),
            d.getSeconds()
          )
        )
      : new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));

    // avoid unnecessary model updates
    if (+value !== +utcDate) {
      this.calendar.updateModel(utcDate);
    }
  }
}
