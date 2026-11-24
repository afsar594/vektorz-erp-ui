import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StorewarehouseRoutingModule } from './storewarehouse-routing.module';
import { IssuevoucherComponent } from './issuevoucher/issuevoucher.component';
import { IssuereturnComponent } from './issuereturn/issuereturn.component';
import { AccountRoutingModule } from '../account/account-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportstockregisterComponent } from './reportstockregister/reportstockregister.component';
import { OpeningStockComponent } from './opening-stock/opening-stock.component';
import { ReportstockledgerComponent } from './reportstockledger/reportstockledger.component';
import { IssueReportComponent } from './issue-report/issue-report.component';
import { DamageEntryComponent } from './damage-entry/damage-entry.component';
import { StockmovementreportComponent } from './StockMovementReport/stockmovementreport.component';
import { AlternativeItemComponent } from './alternative-item/alternative-item.component';
import { ItemSearchComponent } from './alternative-item/item-search/item-search.component';
import { BOMStatusComponent } from './bomstatus/bomstatus.component';
import { FinishedProductEntryComponent } from './finished-product-entry/finished-product-entry.component';
import { GRNComponent } from './grn/grn.component';
import { ItemWiseProfitReportComponent } from './item-wise-profit-report/item-wise-profit-report.component';
import { RecorderLevelReportComponent } from './recorder-level-report/recorder-level-report.component';
import { StockAdjustmentReportComponent } from './stock-adjustment-report/stock-adjustment-report.component';
import { StockAgeingReportComponent } from './stock-ageing-report/stock-ageing-report.component';
import { StockLedgerReportComponent } from './stock-ledger-report/stock-ledger-report.component';
import { StockLedgerComponent } from './stock-ledger/stock-ledger.component';
import { StockMovementComponent } from './stock-movement/stock-movement.component';
import { StockReportBaseUnitComponent } from './stock-report-base-unit/stock-report-base-unit.component';
import { StockReportComponent } from './stock-report/stock-report.component';
import { StockTransferComponent } from './stock-transfer/stock-transfer.component';
import { MenufacturingEntryComponent } from './menufacturing-entry/menufacturing-entry.component';
import { ManufactureListComponent } from './manufacture-list/manufacture-list.component';
import { StockAdjustmentComponent } from './StockAdjustment/stock-adjustment/stock-adjustment.component';
import { ListMasterComponent } from '../master/list-master/list-master.component';
import { PurchaseRequisitionStatusComponent } from './purchase-requisition-status/purchase-requisition-status.component';
import { GrnPendingListComponent } from './grn-pending-list/grn-pending-list.component';
import { StockTransferReportComponent } from './stock-transfer-report/stock-transfer-report.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { SearchItemComponent } from './search-item/search-item.component';
import { SplitButtonModule } from 'primeng';

@NgModule({
  declarations: [
    IssuevoucherComponent,
    IssuereturnComponent,
    ReportstockregisterComponent,
    ReportstockledgerComponent,
    OpeningStockComponent,
    IssueReportComponent,

    StockLedgerReportComponent,
    StockLedgerReportComponent,
    StockmovementreportComponent,
    StockLedgerComponent,
    StockReportComponent,
    StockReportBaseUnitComponent,
    StockMovementComponent,
    StockAdjustmentReportComponent,
    RecorderLevelReportComponent,
    BOMStatusComponent,
    IssueReportComponent,
    StockAgeingReportComponent,
    ItemWiseProfitReportComponent,
    StockTransferComponent,
    DamageEntryComponent,
    GRNComponent,
    FinishedProductEntryComponent,
    AlternativeItemComponent,
    ItemSearchComponent,
    MenufacturingEntryComponent,
    StockAdjustmentComponent,
    ManufactureListComponent,
    ListMasterComponent,
    PurchaseRequisitionStatusComponent,
    GrnPendingListComponent,
    StockTransferReportComponent,
    ItemDetailsComponent,
    SearchItemComponent,
  ],
  imports: [
    CommonModule,
    StorewarehouseRoutingModule,
    AccountRoutingModule,
    SharedModule,
    TranslateModule,
    SplitButtonModule,
  ],
})
export class StorewarehouseModule {}
