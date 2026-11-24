import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { ProfitAndLossComponent } from './profit-and-loss/profit-and-loss.component';
import { TrialBalanceComponent } from './trial-balance/trial-balance.component'
import { BalanceSheetAdvComponent } from './balance-sheet-adv/balance-sheet-adv.component';
import { ProfitAndLossAdvComponent } from './profit-and-loss-adv/profit-and-loss-adv.component';
import { TradingProfitNLossComponent } from './trading-profit-nloss/trading-profit-nloss.component';

const routes: Routes = [
  {
    path: 'trialbalance',
    component: TrialBalanceComponent,
    data: { title: 'Trial Balance', titleI18n: 'Trial Balance' },
  },
  {
    path: 'profit-and-loss/format-1',
    component: ProfitAndLossComponent,
    data: { title: 'Profit and Loss (Format 1)', titleI18n: 'Profit and Loss' },
  },
  {
    path: 'profit-and-loss/format-2',
    component: ProfitAndLossAdvComponent,
    data: { title: 'Profit and Loss (Format 2)', titleI18n: 'Profit and Loss' },
  },
  {
    path: 'profit-and-loss/trading',
    component: TradingProfitNLossComponent,
    data: { title: 'Trading Profit and Loss', titleI18n: 'Profit and Loss' },
  },
  {
    path: 'balance-sheet/format-1',
    component: BalanceSheetComponent,
    data: { title: 'Balance Sheet (Format 1)', titleI18n: 'Balance Sheet' },
  },
  {
    path: 'balance-sheet/format-2',
    component: BalanceSheetAdvComponent,
    data: { title: 'Balance Sheet (Format 2)', titleI18n: 'Balance Sheet' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MisreportRoutingModule { }
