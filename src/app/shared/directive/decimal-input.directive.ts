import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DecimalConfigService } from 'src/app/routes/service/decimal-config.service';

@Directive({
  selector: '[appDecimalInput]',
})
export class DecimalInputDirective {
  private decimal = 2;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private decimalConfig: DecimalConfigService,
    private ngControl: NgControl
  ) {
    this.decimal = this.decimalConfig.getDecimal();
  }

  @HostListener('blur')
  format() {
    const value = Number(this.ngControl?.control?.value || 0);
    const fixed = value.toFixed(this.decimal);
    this.ngControl?.control?.setValue(fixed, { emitEvent: false });
    this.el.nativeElement.value = fixed;
  }

  @HostListener('input', ['$event'])
  validate(e: any) {
    const regex = new RegExp(`^\\d*(\\.\\d{0,${this.decimal}})?$`);
    if (!regex.test(e.target.value)) {
      e.target.value = e.target.value.slice(0, -1);
    }
  }
}
