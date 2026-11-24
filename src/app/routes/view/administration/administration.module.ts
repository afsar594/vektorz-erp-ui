import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrationRoutingModule } from './administration-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProgramsettingsComponent } from './programsettings/programsettings.component';
import { GeneralsetttingsComponent } from './generalsetttings/generalsetttings.component';
import { FinancialPeriodClosingComponent } from './financial-period-closing/financial-period-closing.component';
import { OptionSettingComponent } from './option-setting/option-setting.component';
import { ReportTypeMasterComponent } from './report-type-master/report-type-master.component';
import { PermissionSettingComponent } from './permission-setting/permission-setting.component';

import { AccountSettingComponent } from './account-setting/account-setting.component';
import { MenuComponent } from './menu/menu.component';
import { StationMasterComponent } from './station-master/station-master.component';
import { UserActivityComponent } from './user-activity/user-activity.component';
import { UserCreationComponent } from './user-creation/user-creation.component';
import { ContextMenuModule, InputNumberModule, SidebarModule, TreeModule,MultiSelectModule } from 'primeng';
import { ApprovalLevelComponent } from './approval-level/approval-level.component';

@NgModule({
  declarations: [ProgramsettingsComponent, GeneralsetttingsComponent, OptionSettingComponent, FinancialPeriodClosingComponent, ReportTypeMasterComponent, PermissionSettingComponent, AccountSettingComponent, MenuComponent, StationMasterComponent, UserActivityComponent, UserCreationComponent, ApprovalLevelComponent],
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    SharedModule,
    SidebarModule,
    TreeModule,
    ContextMenuModule,
    InputNumberModule,
    MultiSelectModule
  ]
})
export class AdministrationModule { }
