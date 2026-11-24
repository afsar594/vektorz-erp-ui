import { BusinessTypeComponent } from './businesstype/businesstype.component';
import { ProjectdescriptionComponent } from './projectdescription/projectdescription.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterRoutingModule } from './master-routing.module';
import { CurrencyComponent } from './currency/currency.component';
import { CountryComponent } from './country/country.component';
import { SupplierComponent } from './supplier/supplier.component';
import { LocationComponent } from './location/location.component';
import { CityComponent } from './city/city.component';
import { TermsandconditionComponent } from './termsandcondition/termsandcondition.component';
import { BudgetComponent } from './budget/budget.component';
import { CostcenterComponent } from './costcenter/costcenter.component';
import { JobtypeComponent } from './jobtype/jobtype.component';
import { SalesmanComponent } from './salesman/salesman.component';
import { PricelevelComponent } from './pricelevel/pricelevel.component';
import { EmailsettingsComponent } from './emailsettings/emailsettings.component';
import { LoyaltyComponent } from './loyalty/loyalty.component';
import { OffersComponent } from './offers/offers.component';
import { SalesprocessingComponent } from './salesprocessing/salesprocessing.component';
import { PaymentmodeComponent } from './paymentmode/paymentmode.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AccountmanualcodeentryComponent } from './accountmanualcodeentry/accountmanualcodeentry.component';
import { AssetchartComponent } from './assetchart/assetchart.component';
import { AssetregisterComponent } from './assetregister/assetregister.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { DepreciationregisterComponent } from './depreciationregister/depreciationregister.component';
import { WorkgroupComponent } from './workgroup/workgroup.component';

import { DepartmentComponent } from './department/department.component';
import { JobmasterComponent } from './jobmaster/jobmaster.component';
import { BankGuaranteeComponent } from './bankguarantee/bankguarantee.component';
import { ChartofaccountComponent } from './ca/chartofaccount.component';
import { StaffDetailsComponent } from './staff-details/staff-details.component';
// import { ListMasterComponent } from './list-master/list-master.component';
import { TaxmasterComponent } from './taxmaster/taxmaster.component';
import {
  ConfirmationService,
  ContextMenuModule,
  FileUploadModule,
  SplitButtonModule,
  ToastModule,
  TooltipModule,
  TreeModule,
} from 'primeng';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { AssetManagementComponent } from './asset-management/asset-management.component';
import { CustomerTypeComponent } from './customer-type/customer-type.component';
import { DesignationmasterComponent } from './designationmaster/designationmaster.component';
import { FormsModule } from '@angular/forms';
import { JobMasterAceComponent } from './jobmaster/job-master-ace/job-master-ace.component';
import { CostEstimationItemMasterComponent } from './cost-estimation-item/cost-estimation-item-master/cost-estimation-item-master.component';
import { ProductInquiryComponent } from './product-inquiry/product-inquiry.component';
import { SalesIssueComponent } from './sales-issue/sales-issue.component';

// Master View Module with Sales Issue and Product Inquiry
@NgModule({
  declarations: [
    CurrencyComponent,
    CountryComponent,
    SupplierComponent,
    LocationComponent,
    CityComponent,
    TermsandconditionComponent,

    BudgetComponent,
    CostcenterComponent,
    BusinessTypeComponent,
    JobtypeComponent,
    ChartofaccountComponent,
    SalesmanComponent,
    PricelevelComponent,
    EmailsettingsComponent,
    LoyaltyComponent,
    OffersComponent,
    SalesprocessingComponent,
    PaymentmodeComponent,
    JobmasterComponent,
    AccountmanualcodeentryComponent,
    AssetchartComponent,
    AssetregisterComponent,
    BankGuaranteeComponent,
    ChangepasswordComponent,
    DepreciationregisterComponent,
    ProjectdescriptionComponent,
    WorkgroupComponent,
    DepartmentComponent,
    BankGuaranteeComponent,
    StaffDetailsComponent,
    TaxmasterComponent,
    SupplierListComponent,
    AssetManagementComponent,
    CustomerTypeComponent,
    DesignationmasterComponent,
    JobMasterAceComponent,
    CostEstimationItemMasterComponent,
    ProductInquiryComponent,
    SalesIssueComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ContextMenuModule,
    TreeModule,
    MasterRoutingModule,
    FileUploadModule,
    SplitButtonModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
})
export class MasterModule {}
