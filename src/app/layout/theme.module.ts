import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppMenuComponent } from './menu/component/app.menu.component';
import { AppMenuitemComponent } from './menu/component/app.menuitem.component';
import { AppTopBarComponent } from './topbar/app.topbar.component';
import { AppFooterComponent } from './footer/app.footer.component';
import { MenuService } from './menu/service/app.menu.service';
import { TranslaterComponent } from './topbar/translater/translater.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ListboxModule, MegaMenuModule, OrderListModule } from 'primeng';




@NgModule({
  declarations: [
    AppMenuComponent,
    AppMenuitemComponent,
    AppTopBarComponent,
    TranslaterComponent,
    AppFooterComponent,
   
    MainComponent],
  imports: [
    CommonModule, SharedModule,  CommonModule,
    RouterModule ,MegaMenuModule,OrderListModule,ListboxModule 
  ],
  providers: [MenuService,
    MessageService,
    ConfirmationService],
    exports: [MainComponent]
})
export class ThemeModule { }
