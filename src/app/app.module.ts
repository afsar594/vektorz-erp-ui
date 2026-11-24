import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
// Application Components
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { RoutesModule } from './routes/routes.module';
import { RouterModule } from '@angular/router';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ThemeModule } from './layout/theme.module';
import { AuthGuard } from './core/Guards/auth.guard';
// import { AppConfigService } from './routes/service/configuration.service';
import { AccordionModule, DialogService, DynamicDialogConfig, DynamicDialogRef, TooltipModule } from 'primeng';
import { MasterApiService } from './routes/service/master.api.services';
import { DatashareService } from './datashare.service';
import { LoadingService } from './shared/service/loading.service';
// Application services
export function TranslateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CoreModule,
    RouterModule,
    ThemeModule,
    RoutesModule,
    TooltipModule,
    AccordionModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
 
    AuthGuard,
    DialogService,
    DynamicDialogConfig,
    MasterApiService,
    DatashareService,
    DynamicDialogRef,
    LoadingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
