import { ViewStockTransferType } from "../Store/ViewStockTransferType";

export interface PurchaseRequisitionReportParameters { 

   
    rptPrintGroupByItem?: boolean;
    rptSummary?: boolean;
    rptDetails?: boolean;
    rptDateRange?: boolean;
    rptDtpFrom?: Date;
    rptDtpTo?: Date;
    rptZeroVat?: boolean;
    rptLocation?: number;
    rptJob?: number;
    rptSupplier?: number;

    rptBrand?: number;
    rptItemGroup?: number;
    rptItem?: number;
    rptDpt?: number;
    rptSalesMan?: number;
    rptInvoiceType?: string;

    rptCurrency?: number;

    rptSuppInvNo?: string;
    rptSupplierName?: string;
  
    rptPartNo?: string;

 
    // rptType: [{ value: [null], disabled: true }],
    viewStockTransferType?: ViewStockTransferType[];
 
}