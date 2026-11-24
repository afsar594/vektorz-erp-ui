import { Direction } from '@angular/cdk/bidi';
import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { defaults, AppSettings } from './settings';

export const APP_LANG_KEY = 'app_language';
export const APP_DIR_KEY = 'app_direction';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private notice$ = new Subject<any>();

  private options = defaults;

  public _notify$ = new BehaviorSubject<any>({
    lang: this.getSavedLanguage(),
    dir: this.getSavedDirection()
  });

  constructor() {
    const savedLang = this.getSavedLanguage();
    const savedDir = this.getSavedDirection();
    this.options.language = savedLang;
    this.options.dir = savedDir;
    this.applyDirectionToDom(savedDir, savedLang);
  }

  getSavedLanguage(): string {
    try {
      const val = localStorage.getItem(APP_LANG_KEY);
      if (val && ['en-US', 'ar-SA', 'ru-RU', 'ml-MA'].includes(val)) {
        return val;
      }
    } catch (e) {}
    return 'en-US';
  }

  getSavedDirection(): Direction {
    const lang = this.getSavedLanguage();
    return lang === 'ar-SA' ? 'rtl' : 'ltr';
  }

  get notice(): Observable<any> {
    return this.notice$.asObservable();
  }

  public notify(): Observable<any> {
    return this._notify$.asObservable();
  }

  setLayout(options?: AppSettings): AppSettings {
    this.options = Object.assign(defaults, options);
    return this.options;
  }

  setNavState(type: string, value: boolean) {
    this.notice$.next({ type, value } as any);
  }

  getOptions(): AppSettings {
    return this.options;
  }

  setLanguage(lang: string, dir?: Direction) {
    const effectiveDir: Direction = dir || (lang === 'ar-SA' ? 'rtl' : 'ltr');
    this.options.language = lang;
    this.options.dir = effectiveDir;

    try {
      localStorage.setItem(APP_LANG_KEY, lang);
      localStorage.setItem(APP_DIR_KEY, effectiveDir);
    } catch (e) {}

    this.applyDirectionToDom(effectiveDir, lang);
    this._notify$.next({ lang, dir: effectiveDir });
  }

  private applyDirectionToDom(dir: Direction, lang: string) {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', lang ? lang.split('-')[0] : 'en');
      if (document.body) {
        document.body.setAttribute('dir', dir);
        if (dir === 'rtl') {
          document.body.classList.add('rtl');
        } else {
          document.body.classList.remove('rtl');
        }
      }
    }
  }
}
