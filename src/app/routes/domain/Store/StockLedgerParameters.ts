import { ViewStockTransferType } from './ViewStockTransferType';
export interface StockLedgerParameters { 


    rptSummary?: boolean;
    rptDetails?: boolean;
    rptDateRange?: boolean;
    rptAsOnDate?: boolean;
    rptPrintWithRef?: boolean;
    rptPrintWithCheq?: boolean;
    rptPrintWithAlloc?: boolean;
    rptPrintWithAgainstAcc?: boolean;
    rptPrintWithRelatedAccTrans?: boolean;
    rptHideZero?: boolean;
    rptIncludeZero?: boolean;
    rptItemGroup?: number;
    rptJob?: number;
    rptItem?: number;
    rptLocation?: number;
    rptPartNo?: string;
    rptNarration?: string;
    rptDtpAson?: Date;
    rptDtpFrom?: Date;
    rptDtpTo?: Date;
    rptTotDebit?: number;
    rptTotCredit?: number;
    rptTotRunningBalanceCreditDebit?: number;
    // rptType: [{ value: [null], disabled: true }],
    viewStockTransferType?: ViewStockTransferType[];
 
}