import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MenuService } from './layout/menu/service/app.menu.service';
import { SettingsService } from './shared/service/settings.service';
import { Router } from '@angular/router';
import { LoginService } from './routes/service/login.service';
import { ItemSerachComponent } from './shared/component/item-serach/item-serach.component';
import { DialogService, DynamicDialogRef } from 'primeng';
import { DecimalConfigService } from './routes/service/decimal-config.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public menuMode;

  public menuActive;

  public topbarMenuActive;

  public topbarlangActive;

  activeTopbarItem: Element;
  menuClick: boolean;

  menuButtonClick: boolean;

  topbarMenuButtonClick: boolean;

  topbarlangButtonClick: boolean;

  menuHoverActive: boolean;
  ref: DynamicDialogRef | undefined;

  constructor(
    private menuService: MenuService,
    public settings: SettingsService,
    public dialogService: DialogService,
    private auth: LoginService,
    private decimalConfig: DecimalConfigService,
    private router: Router,
    private translate: TranslateService
  ) {
    // this.decimalConfig.load().subscribe();
    this.menuMode = settings.getOptions().menuMode;
    this.menuActive = settings.getOptions().menuActive;
    this.topbarMenuActive = settings.getOptions().topbarMenuActive;

    this.translate.addLangs(['en-US', 'ar-SA', 'ru-RU', 'ml-MA']);
    this.translate.setDefaultLang('en-US');
    const savedLang = this.settings.getSavedLanguage();
    const savedDir = this.settings.getSavedDirection();
    this.translate.use(savedLang);
    this.settings.setLanguage(savedLang, savedDir);
  }

  ngOnInit() {
    this.decimalConfig.load().subscribe();
  }
  @HostListener('window:keydown.F1', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.router.url && (this.router.url.includes('dashboard') || this.router.url === '/' || this.router.url === '')) {
      return;
    }
    event.preventDefault();
    // if (event.key == 'F1') {
    this.openDialog();
    // }
  }

  openDialog(): void {
    this.ref = this.dialogService.open(ItemSerachComponent, {
      header: 'Search a Product',
      footer: 'Inspire Solutions',
      width: '85%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: {},
    });
  }

  onMenuButtonClick(event: Event) {
    this.menuButtonClick = true;
    this.menuActive = !this.menuActive;
    event.preventDefault();
  }

  onTopbarMenuButtonClick(event: Event) {
    this.topbarMenuButtonClick = true;
    this.topbarMenuActive = !this.topbarMenuActive;
    event.preventDefault();
  }

  onTopbarLangButtonClick(event: Event) {
    this.topbarlangButtonClick = true;
    this.topbarlangActive = !this.topbarlangActive;
    event.preventDefault();
  }

  onTopbarItemClick(event: Event, item: Element) {
    this.topbarMenuButtonClick = true;

    if (this.activeTopbarItem === item) {
      this.activeTopbarItem = null;
    } else {
      this.activeTopbarItem = item;
    }
    event.preventDefault();
  }

  onTopbarSubItemClick(event) {
    event.preventDefault();
  }

  onLayoutClick() {
    if (!this.menuButtonClick && !this.menuClick) {
      if (this.menuMode === 'horizontal') {
        this.menuService.reset();
      }

      if (
        this.isMobile() ||
        this.menuMode === 'overlay' ||
        this.menuMode === 'popup'
      ) {
        this.menuActive = false;
      }

      this.menuHoverActive = false;
    }

    if (!this.topbarMenuButtonClick) {
      this.activeTopbarItem = null;
      this.topbarMenuActive = false;
    }

    if (!this.topbarlangButtonClick) {
      this.topbarlangActive = false;
    }

    this.menuButtonClick = false;
    this.menuClick = false;
    this.topbarMenuButtonClick = false;
    this.topbarlangButtonClick = false;
  }
  logout($event) {
    this.auth.logout();
    this.topbarMenuActive = !this.topbarMenuActive;
    this.topbarlangActive = !this.topbarlangActive;
    this.router.navigate(['/login']);
    $event.preventDefault();
  }
  onMenuClick() {
    this.menuClick = true;
  }

  isMobile() {
    return window.innerWidth < 1025;
  }

  isHorizontal() {
    return this.menuMode === 'horizontal';
  }

  isTablet() {
    const width = window.innerWidth;
    return width <= 1024 && width > 640;
  }
}
