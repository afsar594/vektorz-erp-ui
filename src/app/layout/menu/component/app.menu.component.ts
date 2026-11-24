import { Component, Input, OnInit, AfterViewInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Menu } from 'src/app/routes/domain/Administration/menu';
import { MegaMenuItem, MenuItem, MessageService, TreeNode } from 'primeng/api';
import { MegaMenu } from 'primeng/megamenu';
import { Router } from '@angular/router';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { LoginService } from 'src/app/routes/service/login.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  styleUrls: ['./app.menu.component.scss'],
})
export class AppMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() itemMenu: MegaMenuItem[] = [];
  @ViewChild(MegaMenu) megaMenuRef: MegaMenu;

  model: Menu[] = [];

  items: MegaMenuItem[] = [];
  rawMenuItems: any[] = [];
  workGroupId: any;
  tree: TreeNode[] = [];
  private langSub: Subscription;

  constructor(
    public router: Router,
    public app: AppComponent,
    private loginser: LoginService,
    private messageService: MessageService,
    private masterApi: MasterApiService,
    private _local: LocalStorageService,
    private _permission: PermissionsService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.workGroupId = this.loginser.GetCredentialData().workGroupId;
    this.getMenuByGroup(this.workGroupId);
    this.PermissionSetting(this.workGroupId);

    this.langSub = this.translate.onLangChange.subscribe(() => {
      if (this.rawMenuItems && this.rawMenuItems.length > 0) {
        this.items = this.mapMenuItems(this.rawMenuItems);
      } else {
        this.getMenuByGroup(this.workGroupId);
      }
    });
  }

  ngAfterViewInit() {
    if (!this.megaMenuRef) { return; }

    const instance = this.megaMenuRef as any;
    const originalMouseEnter = instance.onItemMouseEnter.bind(instance);

    // Disable hover-open and hover-close
    instance.onItemMouseEnter = () => {};
    instance.onItemMouseLeave = () => {};

    // Override itemClick so root items with sub-menus toggle on click
    instance.itemClick = (event: Event, item: any) => {
      if (item.disabled) { event.preventDefault(); return; }
      if (!item.url) { event.preventDefault(); }
      if (item.command) { item.command({ originalEvent: event, item }); }

      if (item.items && item.items.length > 0) {
        // Find which root <li> element corresponds to this model item
        const el = instance.el.nativeElement as HTMLElement;
        const rootLis = el.querySelectorAll('.ui-megamenu-root-list > li.ui-menuitem');
        const model: any[] = instance.model || [];

        for (let i = 0; i < rootLis.length && i < model.length; i++) {
          if (model[i] === item) {
            if (instance.activeItem === rootLis[i]) {
              instance.activeItem = null;
            } else {
              originalMouseEnter(null, rootLis[i], item);
            }
            break;
          }
        }
      } else {
        // Regular sub-item click — close panel
        instance.activeItem = null;
      }
    };
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.megaMenuRef) { return; }
    const el = (this.megaMenuRef as any).el?.nativeElement as HTMLElement;
    if (el && !el.contains(event.target as Node)) {
      (this.megaMenuRef as any).activeItem = null;
    }
  }
  toCurrency() {
    this.router.navigateByUrl('/master/currency');
  }
  PermissionSetting(id: number) {
    this.masterApi.PermissionSetting(id).subscribe((response: any) => {
      const result = response.result;
      const encryptedData = this._permission.encryptData(result);
      this._local.remove('List');
      this._local.set('List', encryptedData);
    });
  }
  getTranslatedLabel(label: string): string {
    if (!label) return '';
    const trimmed = label.trim();
    const clean = trimmed.replace(/\u00A0/g, ' ').trim();
    let translated = this.translate.instant(trimmed);
    if ((!translated || translated === trimmed) && clean !== trimmed) {
      translated = this.translate.instant(clean);
    }
    return translated || clean || label;
  }

  getMenuByGroup(id: number) {
    let menuList = JSON.parse(localStorage.getItem('MenuById'));
    if (menuList && menuList.groupId == id) {
      this.rawMenuItems = menuList?.items || [];
      this.items = this.mapMenuItems(this.rawMenuItems);
      return;
    }
    this.masterApi.getMenuByGroup(id).subscribe((response: any) => {
      const result = {
        groupId: id,
        items: response.result,
      };
      this.rawMenuItems = result.items || [];
      this.items = this.mapMenuItems(this.rawMenuItems);
      localStorage.setItem('MenuById', JSON.stringify(result));
    });
  }

  mapMenuItems(result: any[]): MegaMenuItem[] {
    const megaMenuItems: MegaMenuItem[] = [];

    for (const item of result) {
      const isLeaf = !item.items || item.items.length === 0;
      let targetUrl = undefined;
      let navCommand = undefined;

      if (isLeaf && item.url) {
        const cleanUrl = '/' + item.url.replace(/^\/+/, '');
        targetUrl = `#${cleanUrl}`;
        navCommand = () => {
          this.router.navigateByUrl(cleanUrl);
        };
      }

      const megaMenuItem: MegaMenuItem = {
        label: this.getTranslatedLabel(item.label),
        icon: item.icon,
        url: targetUrl,
        command: navCommand,
        target: '_self',
      };
      if (item.items && item.items.length > 0) {
        megaMenuItem.items = this.mapSubItems(item.items);
      }
      megaMenuItems.push(megaMenuItem);
    }

    return megaMenuItems;
  }

  mapSubItems(items: any[]): MenuItem[][] {
    return items.map((item) => {
      const menuItem: MenuItem = {
        label: this.getTranslatedLabel(item.label),
        icon: item.icon,
        id: item.id,
        items: this.mapSubsubItems(item.items),
        target: '_self',
      };
      return [menuItem];
    });
  }

  mapSubsubItems(items: any[]): MenuItem[] {
    return items.map((item) => {
      const menusubItem: MenuItem = {
        label: this.getTranslatedLabel(item.label),
        icon: item.icon,
        id: item.id,
        url: item.url ? `#${item.url}?menu=${item.id}` : undefined,
        items: this.mapSubsubItems(item.items),
        target: '_self',
      };
      return menusubItem;
    });
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }
}
