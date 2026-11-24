import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/shared/service/settings.service';
import { AppComponent } from 'src/app/app.component';
import { Direction } from '@angular/cdk/bidi';

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  dir: Direction;
}

@Component({
  selector: 'app-translater',
  templateUrl: './translater.component.html',
  styleUrls: ['./translater.component.scss'],
})
export class TranslaterComponent implements OnInit {
  languages: LanguageOption[] = [
    { code: 'en-US', label: 'English', nativeLabel: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'ar-SA', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'ru-RU', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  ];

  constructor(
    public translate: TranslateService,
    private settings: SettingsService,
    public app: AppComponent
  ) {}

  ngOnInit(): void {
    const savedLang = this.settings.getSavedLanguage();
    this.translate.use(savedLang);
  }

  getCurrentLang(): LanguageOption {
    const currentCode = this.settings.getOptions().language || this.settings.getSavedLanguage();
    return this.languages.find((l) => l.code === currentCode) || this.languages[0];
  }

  useLanguage(langOption: LanguageOption) {
    this.translate.use(langOption.code);
    this.settings.setLanguage(langOption.code, langOption.dir);
    this.app.topbarlangActive = false;
  }
}

