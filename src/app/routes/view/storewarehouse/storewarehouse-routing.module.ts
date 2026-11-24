import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IssuereturnComponent } from './issuereturn/issuereturn.component';
import { IssuevoucherComponent } from './issuevoucher/issuevoucher.component';
import { OpeningStockComponent } from './opening-stock/opening-stock.component';
import { ReportstockledgerComponent } from './reportstockledger/reportstockledger.component';
import { ReportstockregisterComponent } from './reportstockregister/reportstockregister.component';
import { IssueReportComponent } from './issue-report/issue-report.component';
import { StockmovementreportComponent } from './StockMovementReport/stockmovementreport.component';
import { AlternativeItemComponent } from './alternative-item/alternative-item.component';
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
import { DamageEntryComponent } from './damage-entry/damage-entry.component';
import { AlternativitemComponent } from './alternativitem/alternativitem.component';
import { GrnPendingListComponent } from './grn-pending-list/grn-pending-list.component';
import { StockTransferReportComponent } from './stock-transfer-report/stock-transfer-report.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { SearchItemComponent } from './search-item/search-item.component';


const routes: Routes = [
  {
    path: 'issuevoucher',
    component: IssuevoucherComponent,
    data: { title: 'Issue to Production', titleI18n: 'Issue to Production' }
  },

  {
    path: 'issuereturn',
    component: IssuereturnComponent,
    data: { title: 'Issue Return', titleI18n: 'Issue Return' }
  },
  {
    path: 'reportstockregister',
    component: ReportstockregisterComponent,
    data: { title: 'Stock Report', titleI18n: 'Stock Report' }
  },
  {
    path: 'reportstockLedger',
    component: ReportstockledgerComponent,
    data: { title: 'Stock Ledger', titleI18n: 'Stock Ledger' }
  },
  {
    path: 'openingstock',
    component: OpeningStockComponent,
    data: { title: 'Opening Stock', titleI18n: 'Opening Stock' }
  },
  {
    path: 'menufacturingEntry',
    component: MenufacturingEntryComponent,
    data: { title: 'Menufacturing Entry', titleI18n: 'Menufacturing Entry' }
  },

  {
    path: 'issue-report',
    component: IssueReportComponent,
    data: { title: 'Opening Stock', titleI18n: 'Issue Report' }

  },
  {
    path: 'stockledgerreport',
    component: StockLedgerReportComponent,
    data: { title: 'Stock Ledger Report', titleI18n: 'Stock Ledger Report' },
  },
  {
    path: 'grnPendingList',
    component: GrnPendingListComponent,
    data: { title: 'GRN Pending List', titleI18n: 'GRN Pending List' },

  },
  {
    path: 'stockmovementreport',
    component: StockmovementreportComponent,
    // component:StockMovementReportComponent,
    data: { title: 'Stock Movement Report', titleI18n: 'Stock Movement Report' },
  },
  {
    path: 'alternative-item',
    component: AlternativeItemComponent,
    data: { title: 'Alternative Item', titleI18n: 'Alternative Item' },
  },
  {
    path: 'finished-product-entry',
    component: FinishedProductEntryComponent,
    data: { title: 'Finished Product Entry', titleI18n: 'Finished Product Entry' },
  },
  {
    path: 'stockledger',
    component: StockLedgerComponent,
    data: { title: 'Stock Ledger', titleI18n: 'Stock Ledger' },
  },
  {
    path: 'stockreport',
    component: StockReportComponent,
    data: { title: 'Stock Report', titleI18n: 'Stock Report' },
  },
  {
    path: 'stockreportbaseunit',
    component: StockReportBaseUnitComponent,
    data: { title: 'Stock Report (Base Unit)', titleI18n: 'Stock Report (Base Unit)' },
  },
  {
    path: 'stockmovement',
    component: StockMovementComponent,
    data: { title: 'Stock Movement', titleI18n: 'Stock Movement' },
  },
  {
    path: 'stockadjustment',
    component: StockAdjustmentComponent,
    data: { title: 'Stock Adjustment', titleI18n: 'Stock Adjustment' },
  },
  {
    path: 'stockadjustmentreport',
    component: StockAdjustmentReportComponent,
    data: { title: 'Stock Adjustment Report', titleI18n: 'Stock Adjustment Report' },
  },
  
 
  {
    path: 'recorderlevelreport',
    component: RecorderLevelReportComponent,
    data: { title: 'Recorder Level Report', titleI18n: 'Recorder Level Report' },
  },
  {
    path: 'bomstatus',
    component: BOMStatusComponent,
    data: { title: 'BOM Status', titleI18n: 'BOM Status' },
  },
  {
    path: 'issuereport',
    component: IssueReportComponent,
    data: { title: 'Issue Report', titleI18n: 'Issue Report' },
  },
  // {
  //   path: 'invoiceprofitreport',
  //   component: InvoiceProfitReportComponent,
  //   data: { title: 'Invoice Profit Report', titleI18n: 'Invoice Profit Report' },
  // },
  {
    path: 'stockageingreport',
    component: StockAgeingReportComponent,
    data: { title: 'Stock Ageing Report', titleI18n: 'Stock Ageing Report' },
  },
  {
    path: 'itemwiseprofitreport',
    component: ItemWiseProfitReportComponent,
    data: { title: 'Item Wise Profit Report', titleI18n: 'Item Wise Profit Report' },
  },
  {
    path: 'stocktransfer',
    component: StockTransferComponent,
    data: { title: 'Stock Transfer', titleI18n: 'Stock Transfer' },
  },
  {
    path: 'GRN',
    component: GRNComponent,
    data: { title: 'GRN (Good Receipt Notes)', titleI18n: 'GRN (Good Receipt Number)' },
  },
  {
    path: 'manufacture-list',
    component: ManufactureListComponent,
    data: { title: 'Manufacture (Component List)', titleI18n: 'Manufacture (Component List)' },
  },
  {
    path: 'damageentry',
    component: DamageEntryComponent,
    data: { title: 'Damage Entry', titleI18n: 'Damage Entry' },
  },
  {
    path: 'item-list',
    component: ListMasterComponent,
    data: { title: 'Item List', titleI18n: 'Item List' },
  },
  {
    path: 'alternativitem',
    component: AlternativitemComponent,
    data: { title: 'Alternative', titleI18n: 'Alternative' },
  },
  {
    path: 'stockTransferReport',
    component: StockTransferReportComponent,
    data: { title: 'Stock Transfer Report', titleI18n: 'Stock Transfer Report' },
  },
  {
    path: 'itemdetails',
    component: ItemDetailsComponent,
    data: { title: 'Item Details', titleI18n: 'Item Details' },
  },
  {
    path: 'searchitem',
    component: SearchItemComponent,
    data: { title: 'Search Item', titleI18n: 'Search Item' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StorewarehouseRoutingModule { }
