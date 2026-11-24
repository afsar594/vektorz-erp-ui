import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeneralsetttingsComponent } from './generalsetttings/generalsetttings.component';
import { ProgramsettingsComponent } from './programsettings/programsettings.component';
import { FinancialPeriodClosingComponent } from './financial-period-closing/financial-period-closing.component';
import { OptionSettingComponent } from './option-setting/option-setting.component';
import { ReportTypeMasterComponent } from './report-type-master/report-type-master.component';
import { PermissionSettingComponent } from './permission-setting/permission-setting.component';
import { AccountSettingComponent } from './account-setting/account-setting.component';
import { MenuComponent } from './menu/menu.component';
import { StationMasterComponent } from './station-master/station-master.component';
import { UserActivityComponent } from './user-activity/user-activity.component';
import { UserCreationComponent } from './user-creation/user-creation.component';
import { ApprovalLevelComponent } from './approval-level/approval-level.component';



const routes: Routes = [
  {
    path: 'generalsettings',
    component: GeneralsetttingsComponent
  },
  {
    path: 'programsettings',
    component: ProgramsettingsComponent,

  },
  {
    path: 'optionsettings',
    component: OptionSettingComponent,
    data: { title: 'Opetion Setting', titleI18n: 'Opetion Setting' }
  },
  {
    path: 'financial-period-closing',
    component: FinancialPeriodClosingComponent,
    data: { title: 'Financial Period Closing', titleI18n: 'Financial Period Closing' }
  },
  {
    path: 'report-type-master',
    component: ReportTypeMasterComponent,
    data: { title: 'Report Type Master', titleI18n: 'Report Type Master' }
  },
  {
    path: 'permissionsetting',
    component: PermissionSettingComponent,
    data: { title: 'Permission Setting', titleI18n: 'Permission Setting' }
  },
  {
    path: 'permission-approval',
    component: ApprovalLevelComponent,
    data: { title: 'Permission Approval', titleI18n: 'Permission Approval' }
  },
  {
    path: 'account-setting',
    component: AccountSettingComponent,
    data: { title: 'Account Setting', titleI18n: 'Account Setting' }
  },
  {
    path: 'menu',
    component: MenuComponent,
    data: { title: 'Menu', titleI18n: 'Menu' }
  },
  {
    path: 'station-master',
    component: StationMasterComponent,
    data: { title: 'Station Master', titleI18n: 'Station Master' }
  },
  {
    path: 'user-activity',
    component: UserActivityComponent,
    data: { title: 'User Track Report', titleI18n: 'User Track Report' }
  },
  {
    path: 'user-creation',
    component: UserCreationComponent,
    data: { title: 'User Creation', titleI18n: 'User Creation' }
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
