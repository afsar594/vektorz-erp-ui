import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveDetailComponent } from './leave-detail/leave-detail.component';
 import { AccountRoutingModule } from '../account/account-routing.module';
import { TransactionRoutingModule } from './transaction.routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
  declarations: [LeaveDetailComponent],
  imports: [
    CommonModule,
    TransactionRoutingModule,
    AccountRoutingModule,
    SharedModule,
    
  ]
})
export class TransactionModule { }
