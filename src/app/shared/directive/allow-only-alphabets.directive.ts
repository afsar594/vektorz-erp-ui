import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appAllowOnlyAlphabets]'
})
export class AllowOnlyAlphabetsDirective {

  constructor() { }

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const initialValue = (event.target as HTMLInputElement).value;
    (event.target as HTMLInputElement).value = initialValue.replace(/[^a-zA-Z ]/g, '');
    if (initialValue !== (event.target as HTMLInputElement).value) {
      event.stopPropagation();
    }
  }
}
