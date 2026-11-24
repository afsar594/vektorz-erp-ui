import { ViewAccountsTransactionsVoucherType } from './ViewAccountsTransactionsVoucherType';
export interface AccountStatementParameters {
  rptSummary?: boolean;
  rptDetails?: boolean;
  rptDateRange?: boolean;
  rptAsOnDate?: boolean;
  rptPrintWithRef?: boolean;
  rptPrintWithCheq?: boolean;
  rptPrintWithAlloc?: boolean;
  rptPrintWithAgainstAcc?: boolean;
  rptPrintWithRelatedAccTrans?: boolean;
  rptHideOpeningBalance?: boolean;
  rptCostCenter?: number;
  rptJob?: number;
  rptAccount?: string;
  rptLocation?: number;
  rptDescription?: string;
  rptNarration?: string;
  rptDtpAson?: string;
  rptDtpFrom?: string;
  rptDtpTo?: string;
  rptTotDebit?: number;
  rptTotCredit?: number;
  rptTotRunningBalanceCreditDebit?: number;
  // rptType: [{ value: [null], disabled: true }],
  viewAccountsTransactionsVoucherType?: ViewAccountsTransactionsVoucherType[];
}
