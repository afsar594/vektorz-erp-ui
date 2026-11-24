import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[pButton], button[pButton], p-button, p-splitButton',
})
export class AutoTranslateButtonDirective implements OnInit, OnChanges, OnDestroy {
  @Input() label: string;

  private originalKey: string = '';
  private langChangeSub: Subscription;

  constructor(
    private el: ElementRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.extractAndApply();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.applyTranslation();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.label && changes.label.currentValue) {
      const newLabel = changes.label.currentValue;
      // If originalKey is empty, or this isn't a re-application of the current translation
      if (!this.originalKey || newLabel !== this.translate.instant(this.originalKey)) {
        this.originalKey = newLabel;
      }
      setTimeout(() => this.applyTranslation(), 0);
    }
  }

  private extractAndApply(): void {
    if (this.label) {
      this.originalKey = this.label;
    }

    // Give PrimeNG a microtask to finish creating the .ui-button-text span
    setTimeout(() => {
      if (!this.originalKey) {
        const textSpan = this.el.nativeElement.querySelector('.ui-button-text');
        if (textSpan && textSpan.textContent) {
          const text = textSpan.textContent.trim();
          if (text && text !== 'ui-btn') {
            this.originalKey = text;
          }
        }
      }
      this.applyTranslation();
    }, 0);
  }

  private applyTranslation(): void {
    if (!this.originalKey) {
      return;
    }

    const translated = this.translate.instant(this.originalKey);
    if (!translated || translated === this.originalKey) {
      return;
    }

    const native = this.el.nativeElement;
    // Look for PrimeNG button text span
    const textSpan = native.querySelector('.ui-button-text');
    if (textSpan) {
      textSpan.textContent = translated;
    } else {
      // Fallback for custom or direct text nodes
      for (let i = 0; i < native.childNodes.length; i++) {
        const node = native.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim() === this.originalKey) {
          node.nodeValue = translated;
          break;
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}
