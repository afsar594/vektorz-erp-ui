import { Directive, ElementRef, HostListener, OnDestroy } from '@angular/core';

/**
 * Adds a native `title` tooltip to every option of a PrimeNG dropdown so a
 * truncated (ellipsized) option can still be read on hover.
 *
 * Usage: <p-dropdown appDropdownOptionTitle ...></p-dropdown>
 */
@Directive({
  selector: '[appDropdownOptionTitle]',
})
export class DropdownOptionTitleDirective implements OnDestroy {
  private observer: MutationObserver | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('onShow')
  onShow(): void {
    setTimeout(() => this.applyTitles(), 0);
    this.observe();
  }

  @HostListener('onHide')
  onHide(): void {
    this.disconnect();
  }

  private applyTitles(): void {
    const items = this.el.nativeElement.querySelectorAll(
      '.ui-dropdown-item, .ui-dropdown-item-group'
    );
    items.forEach((item) => {
      const text = (item.textContent || '').trim();
      if (text && !item.getAttribute('title')) {
        item.setAttribute('title', text);
      }
    });
  }

  private observe(): void {
    this.disconnect();
    this.observer = new MutationObserver(() => this.applyTitles());
    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
    });
  }

  private disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
