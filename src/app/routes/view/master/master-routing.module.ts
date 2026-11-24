import { BusinessTypeComponent } from './businesstype/businesstype.component';
import { ProjectdescriptionComponent } from './projectdescription/projectdescription.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CurrencyComponent } from './currency/currency.component';
import { CountryComponent } from './country/country.component';
import { BudgetComponent } from './budget/budget.component';
import { CityComponent } from './city/city.component';
import { CostcenterComponent } from './costcenter/costcenter.component';
import { EmailsettingsComponent } from './emailsettings/emailsettings.component';
import { JobtypeComponent } from './jobtype/jobtype.component';
import { LocationComponent } from './location/location.component';
import { LoyaltyComponent } from './loyalty/loyalty.component';
import { OffersComponent } from './offers/offers.component';
import { PaymentmodeComponent } from './paymentmode/paymentmode.component';
import { PricelevelComponent } from './pricelevel/pricelevel.component';
import { SalesmanComponent } from './salesman/salesman.component';
import { SalesprocessingComponent } from './salesprocessing/salesprocessing.component';
import { SupplierComponent } from './supplier/supplier.component';
import { TermsandconditionComponent } from './termsandcondition/termsandcondition.component';
import { AccountmanualcodeentryComponent } from './accountmanualcodeentry/accountmanualcodeentry.component';
import { AssetchartComponent } from './assetchart/assetchart.component';
import { AssetregisterComponent } from './assetregister/assetregister.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { DepreciationregisterComponent } from './depreciationregister/depreciationregister.component';
import { WorkgroupComponent } from './workgroup/workgroup.component';
import { DepartmentComponent } from './department/department.component';
import { JobmasterComponent } from './jobmaster/jobmaster.component';
import { BankGuaranteeComponent } from './bankguarantee/bankguarantee.component';
import { StaffDetailsComponent } from './staff-details/staff-details.component';
import { TaxmasterComponent } from './taxmaster/taxmaster.component';
import { TemplateComponent } from '../../../shared/component/template/template.component';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { AssetManagementComponent } from './asset-management/asset-management.component';
import { CustomerTypeComponent } from './customer-type/customer-type.component';
import { DesignationmasterComponent } from './designationmaster/designationmaster.component';
import { JobMasterAceComponent } from './jobmaster/job-master-ace/job-master-ace.component';
import { CostEstimationItemMasterComponent } from './cost-estimation-item/cost-estimation-item-master/cost-estimation-item-master.component';
import { ProductInquiryComponent } from './product-inquiry/product-inquiry.component';
import { SalesIssueComponent } from './sales-issue/sales-issue.component';


const routes: Routes = [
  {
    path: 'customer',
    loadChildren: () => import('./customer/customer.module').then(cu => cu.CustomerModule)
  },
  {
    path: 'customertype',
    component: CustomerTypeComponent,
    data: { title: 'Customer Type', titleI18n: 'Customer Type' },

  
  },
  {
    path: 'designationmaster',
    component: DesignationmasterComponent,
    data: { title: 'Designation Master', titleI18n: 'Designation Master' },
  },
  {
    path: 'budget',
    component: BudgetComponent,
    data: { title: 'Budget', titleI18n: 'Budget' },

  
  },
  {
    path: 'businesstype',
    component: BusinessTypeComponent,
    data: { title: 'Business Type', titleI18n: 'Business Type' },

  
  },
 
  {
    path: 'chartofaccount',
    loadChildren: () => import('./chart-of-accounts/chart-of-accounts.module').then(cu => cu.ChartofAccountModule),

  },
  
  {
    path: 'city',
    component: CityComponent,
    data: { title: 'City', titleI18n: 'City' },

  
  },
  {
    path: 'code',
    loadChildren: () => import('./code/code.module').then(co => co.CodeModule),

  
  },
  {
    path: 'costcenter',
    component: CostcenterComponent,
    data: { title: 'Cost Center', titleI18n: 'Cost Center' },

  
  },
  {
    path: 'country',
    component: CountryComponent,
    data: { title: 'Country', titleI18n: 'Country' },

  
  },
  {
    path: 'currency',
    component: CurrencyComponent,
    data: { title: 'Currency Master', titleI18n: 'Currency Master' },

  
  },
  {
    path: 'customer',
    loadChildren: () => import('./customer/customer.module').then(cu => cu.CustomerModule),

  
  },
  {
    path: 'emailsettings',
    component: EmailsettingsComponent,
    data: { title: 'Email Settings', titleI18n: 'Email Settings' },

  
  },

  {
    path: 'item',
    loadChildren: () => import('./item-master/item-master.module').then(cu => cu.ItemMasterModule),

  

  },
  {
    path: 'jobtype',
    component: JobtypeComponent,
    data: { title: 'Job Type', titleI18n: 'Job Type' },
  },
  {
    path: 'jobmaster',
    component: JobmasterComponent,
    data: { title: 'Job Master', titleI18n: 'Job Master' },
  },

  {
    path: 'jobmaster-ace',
    component: JobMasterAceComponent,
    data: { title: 'Job Master', titleI18n: 'Job Master' },
  },

  {
    path: 'location',
    component: LocationComponent,
    data: { title: 'Location', titleI18n: 'Location' },

  
  },
  {
    path: 'loyalty',
    component: LoyaltyComponent,
    data: { title: 'Loyalty', titleI18n: 'Loyalty' },

  
  },
  {
    path: 'offers',
    component: OffersComponent,
    data: { title: 'Offers', titleI18n: 'Offers' },

  
  },
  {
    path: 'paymentmode',
    component: PaymentmodeComponent,
    data: { title: 'Payment Mode', titleI18n: 'Payment Mode' },
  },
  {
    path: 'pricelevel',
    component: PricelevelComponent,
    data: { title: 'Price Level', titleI18n: 'Price Level' },

  
  },
  {
    path: 'salesman',
    component: SalesmanComponent,
    data: { title: 'SalesMan', titleI18n: 'SalesMan' },

  
  },
  {
    path: 'salesprocessing',
    component: SalesprocessingComponent,
    data: { title: 'Sales Processing', titleI18n: 'Sales Processing' },

  
  },
  {
    path: 'supplier',
    component: SupplierComponent,
    data: { title: 'Supplier Master ', titleI18n: 'Supplier Master' },

  },

    {
    path: 'cost-estimation-master',
    component: CostEstimationItemMasterComponent,
    data: { title: 'Cost Estimation Item', titleI18n: 'Cost Estimation Item' },

  },
  {
    path: 'termsandcondition',
    component: TermsandconditionComponent,
    data: { title: 'Terms And Condition', titleI18n: 'Terms And Condition' },

  
  },

  {
    path: 'accountmanualcodentry',
    component: AccountmanualcodeentryComponent,
    data: { title: 'Account Manual Code Entry', titleI18n: 'Account Manual Code Entry' },

  
  },
  {
    path: 'assetchart',
    component: AssetchartComponent,
    data: { title: 'Asset Chart', titleI18n: 'Asset Chart' },

  
  },
  {
    path: 'assetregister',
    component: AssetregisterComponent,
    data: { title: 'Asset Register', titleI18n: 'Asset Register' },

  
  },
  {
    path: 'bankguarantee',
    component: BankGuaranteeComponent,
    data: { title: 'Bank Guarantee', titleI18n: 'Bank Guarantee' },

  
  },
  {
    path: 'changepassword',
    component: ChangepasswordComponent,
    data: { title: 'Change Password', titleI18n: 'Change Password' },

  
  },
  {
    path: 'depreciationregister',
    component: DepreciationregisterComponent,
    data: { title: 'Depreciation Register', titleI18n: 'Depreciation Register' },

  
  },
  {
    path: 'projectdescription',
    component: ProjectdescriptionComponent,
    data: { title: 'Project Description', titleI18n: 'Project Description' },

  
  },
  {
    path: 'workgroup',
    component: WorkgroupComponent,
    data: { title: 'Work Group', titleI18n: 'Work Group' },

  
  },
  {
    path: 'department',
    component: DepartmentComponent,
    data: { title: 'Department Master', titleI18n: 'Department Master' },

  
  },
  // {
  //   path: 'list-master',
  //   component: ListMasterComponent,
  //   data: { title: 'List Master', titleI18n: 'List Master' },
  // },
  {
    path: 'staff-details',
    component: StaffDetailsComponent,
    data: { title: 'Staff Details', titleI18n: 'Staff Details' },
  },
  {
    path: 'tax',
    component: TaxmasterComponent,
    data: { title: 'Tax', titleI18n: 'Tax' },
  },
  {
    path: 'supplier-list',
    component: SupplierListComponent,
    data: { title: 'Supplier List', titleI18n: 'Supplier List' },
  },

  {
    path: 'template',
    component: TemplateComponent,
    data: { title: 'QTemplates', titleI18n: 'QTemplates' },
  },
  {
    path: 'asset-management',
    component: AssetManagementComponent,
    data: { title: 'Asset Master', titleI18n: 'Asset Master' },
  },
  {
    path: 'product-inquiry',
    component: ProductInquiryComponent,
    data: { title: 'Product Inquiry', titleI18n: 'Product Inquiry' },
  },
  {
    path: 'sales-issue',
    component: SalesIssueComponent,
    data: { title: 'Sales / Issue', titleI18n: 'Sales / Issue' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
