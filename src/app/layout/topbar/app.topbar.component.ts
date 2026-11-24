import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  MessageService,
  MegaMenuItem,
  MenuItem,
  Menu,
  TreeNode,
} from 'primeng';
import { AppComponent } from 'src/app/app.component';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { LoginService } from 'src/app/routes/service/login.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { TranslateService } from '@ngx-translate/core';

export interface SearchMenuItem {
  label: string;
  translatedLabel: string;
  url: string;
  breadcrumb: string;
  translatedBreadcrumb: string;
  icon: string;
  id: number;
}

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrls: ['./app.topbar.component.scss']
})

export class AppTopBarComponent implements OnInit, AfterViewInit {
  model: Menu[] = [];
  items: MegaMenuItem[] = [];
  workGroupId: any;
  tree: TreeNode[] = [];
  user: any;
  companyDetails: StationMaster;
  @Output() menuToggle = new EventEmitter<void>();

  // --- Menu Search ---
  @ViewChild('searchContainer') searchContainer: ElementRef;
  searchTerm: string = '';
  showSearchResults: boolean = false;
  flattenedMenuItems: SearchMenuItem[] = [];
  filteredMenuItems: SearchMenuItem[] = [];

  toggleMenu() {
    this.menuToggle.emit();
  }
  userData: any;
  constructor(
    public app: AppComponent,
    private loginser: LoginService,

    private permission: PermissionsService,
    private masterApi: MasterApiService,
    private _local: LocalStorageService,
    public router: Router,
    public notificationService: NotificationService,
    private translate: TranslateService
  ) {
    this.workGroupId = this.loginser.GetCredentialData().workGroupId;
  }
  ngOnInit() {
    this.userData = this.loginser.GetCredentialData();
    this.notificationService.getNotifications();
    this.loadMenuItems();

    this.translate.onLangChange.subscribe(() => {
      this.loadMenuItems();
      if (this.showSearchResults && this.searchTerm) {
        this.onSearchInput();
      }
    });
  }

 

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.companyDetails = this.permission.getStation();
      this.user = this._local.get('Login').userName;
      this.userData = this.loginser.GetCredentialData();
    }, 2000);
  }
  // getMenuByGroup(id: number) {
  //   this.masterApi.getMenuByGroup(id).subscribe((response: any) => {
  //     const result = response.result;
  //     this.items = this.mapMenuItems(result);
  //   });

  // }

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

  mapMenuItems(result: any[]): MegaMenuItem[] {
    const megaMenuItems: MegaMenuItem[] = [];

    for (const item of result) {
      const megaMenuItem: MegaMenuItem = {
        label: this.getTranslatedLabel(item.label),
        icon: item.icon,
        url: item.url ? `#${item.url}` : undefined,
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
        url: item.url ? `#${item.url}` : undefined,
        items: this.mapSubsubItems(item.items),
        target: '_self',
      };
      return menusubItem;
    });
  }

  // --- Menu Search Methods ---

  loadMenuItems() {
    try {
      const menuData = JSON.parse(localStorage.getItem('MenuById'));
      if (menuData && menuData.items && menuData.items.length > 0) {
        this.flattenedMenuItems = [];
        this.flattenMenuTree(menuData.items, [], []);
        return;
      }
    } catch (e) {
      this.flattenedMenuItems = [];
    }

    if (this.workGroupId) {
      this.masterApi.getMenuByGroup(this.workGroupId).subscribe((response: any) => {
        if (response && response.result) {
          const result = {
            groupId: this.workGroupId,
            items: response.result,
          };
          try {
            localStorage.setItem('MenuById', JSON.stringify(result));
          } catch (e) {}
          this.flattenedMenuItems = [];
          this.flattenMenuTree(response.result, [], []);
        }
      });
    }
  }

  flattenMenuTree(items: any[], parentSegments: string[], translatedParentSegments: string[]) {
    if (!items) return;
    for (const item of items) {
      const seg = (item.label || '').trim();
      const cleanSeg = seg.replace(/\u00A0/g, ' ').trim();
      let translatedSeg = seg ? this.translate.instant(seg) : '';
      if ((!translatedSeg || translatedSeg === seg) && cleanSeg !== seg) {
        translatedSeg = this.translate.instant(cleanSeg);
      }
      if (!translatedSeg) {
        translatedSeg = cleanSeg || seg;
      }
      const currentSegments = [...parentSegments, cleanSeg || seg];
      const currentTranslatedSegments = [...translatedParentSegments, translatedSeg];

      // Only add leaf items that have a valid navigable URL
      if (item.url && item.url.trim() !== '' && (!item.items || item.items.length === 0)) {
        this.flattenedMenuItems.push({
          label: seg,
          translatedLabel: translatedSeg,
          url: item.url,
          breadcrumb: currentSegments.join(' > '),
          translatedBreadcrumb: currentTranslatedSegments.join(' > '),
          icon: item.icon || 'fa fa-fw fa-file-o',
          id: item.id
        });
      }
      if (item.items && item.items.length > 0) {
        this.flattenMenuTree(item.items, currentSegments, currentTranslatedSegments);
      }
    }
  }

  onSearchInput() {
    if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      this.filteredMenuItems = [];
      this.showSearchResults = false;
      return;
    }
    // Reload menu items in case they were updated
    if (this.flattenedMenuItems.length === 0) {
      this.loadMenuItems();
    }
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredMenuItems = this.flattenedMenuItems.filter(item =>
      (item.label && item.label.toLowerCase().includes(term)) ||
      (item.translatedLabel && item.translatedLabel.toLowerCase().includes(term)) ||
      (item.breadcrumb && item.breadcrumb.toLowerCase().includes(term)) ||
      (item.translatedBreadcrumb && item.translatedBreadcrumb.toLowerCase().includes(term))
    );
    this.showSearchResults = true;
  }

  onSearchFocus() {
    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      this.onSearchInput();
    }
  }

  selectSearchResult(item: { label: string; url: string; id: number }) {
    this.searchTerm = '';
    this.showSearchResults = false;
    this.filteredMenuItems = [];
    let url = item.url;
    // Ensure url starts with /
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    this.router.navigateByUrl(url + '?menu=' + item.id);
  }

  @HostListener('document:click', ['$event'])
  onDocClickSearch(event: MouseEvent) {
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target)) {
      this.showSearchResults = false;
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.showSearchResults = false;
    this.filteredMenuItems = [];
  }
}
