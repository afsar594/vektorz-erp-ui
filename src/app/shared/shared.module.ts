import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingComponent } from './component/loading/loading.component';
import { LoadingService } from './service/loading.service';
import { SettingsService } from './service/settings.service';
import { LocalStorageService } from './service/storage.service';
import { PageHeaderComponent } from './component/page-header/page-header.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PAddRowDirective } from './directive/p-add-row.directive';
import { TranslateModule } from '@ngx-translate/core';
import { UseUtcDirective } from './directive/use-utc.directive';
import { LookupComponent } from './component/lookup/lookup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TemplateComponent } from './component/template/template.component';
import { AutofocusDirective } from './directive/autofocus.directive';
import { ItemSerachComponent } from './component/item-serach/item-serach.component';
import { AllowOnlyAlphabetsDirective } from './directive/allow-only-alphabets.directive';
import { PermissionsService } from './service/permissions.service';
import {
  ButtonModule,
  CalendarModule,
  CardModule,
  CheckboxModule,
  ConfirmDialogModule,
  DialogModule,
  DropdownModule,
  InputNumberModule,
  InputTextareaModule,
  InputTextModule,
  MessageModule,
  PanelMenuModule,
  PanelModule,
  RadioButton,
  RadioButtonModule,
  TableModule,
  TabViewModule,
  ToastModule,
  ToolbarModule,
} from 'primeng';
import { HotTableModule } from '@handsontable/angular';
import { ExcelPreviewDialogComponent } from './component/excel-preview-dialog/excel-preview-dialog.component';
import { DatefilterComponent } from './component/datefilter/datefilter.component';
import { DecimalInputDirective } from './directive/decimal-input.directive';
import { AutoTranslateButtonDirective } from './directive/auto-translate-button.directive';
import { DropdownOptionTitleDirective } from './directive/dropdown-option-title.directive';

const COMPONENTS = [
  LoadingComponent,
  PageHeaderComponent,
  LookupComponent,
  TemplateComponent,
  ItemSerachComponent,
  DatefilterComponent,
];
@NgModule({
  declarations: [
    ...COMPONENTS,
    PageHeaderComponent,
    PAddRowDirective,
    UseUtcDirective,
    AutofocusDirective,
    AllowOnlyAlphabetsDirective,
    ExcelPreviewDialogComponent,
    DecimalInputDirective,
    AutoTranslateButtonDirective,
    DropdownOptionTitleDirective,
  ],
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    // FormsModule,
    TranslateModule,
    OverlayPanelModule,
    // PrimeModuleModule,
    ReactiveFormsModule,
    TabViewModule,
    ToastModule,
    ToolbarModule,
    TableModule,
    ConfirmDialogModule,
    DropdownModule,
    HotTableModule,
    DialogModule,
    FormsModule,
    CalendarModule,
    CardModule,
    PanelModule,
    ButtonModule,
    CheckboxModule,
    RadioButtonModule,
    MessageModule,
    InputTextareaModule,
    InputTextModule,
    InputNumberModule,
  ],
  providers: [
    LoadingService,
    SettingsService,
    LocalStorageService,
    PermissionsService,
  ],
  exports: [
    ...COMPONENTS,
    PAddRowDirective,
    UseUtcDirective,
    ProgressSpinnerModule,
    FormsModule,
    TranslateModule,
    OverlayPanelModule,
    AutofocusDirective,
    TabViewModule,
    ToastModule,
    ToolbarModule,
    TableModule,
    ConfirmDialogModule,
    ReactiveFormsModule,
    DropdownModule,
    HotTableModule,
    DialogModule,
    FormsModule,
    CalendarModule,
    CardModule,
    ButtonModule,
    PanelModule,
    CheckboxModule,
    RadioButtonModule,
    MessageModule,
    InputTextareaModule,
    InputTextModule,
    InputNumberModule,
    ExcelPreviewDialogComponent,
    DecimalInputDirective,
    AutoTranslateButtonDirective,
    DropdownOptionTitleDirective,
  ],
})
export class SharedModule {}
