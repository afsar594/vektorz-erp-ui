import { ViewStockTransferType } from "../Store/ViewStockTransferType";

export interface SalesVoucherReportParameters { 

   
    rptSummary?: boolean;
    rptDetails?: boolean;
    rptDateRange?: boolean;
    rptDtpFrom?: Date;
    rptDtpTo?: Date;
    rptZeroVat?: boolean;
    rptLocation?: number;
    rptJob?: number;
    rptCustomer?: number;

    rptBrand?: number;
    rptItemGroup?: number;
    rptItem?: number;
  rptDpt?: number;
    rptSalesMan?: number;
    rptInvoiceType?: string;



    rptCurrency?: number;



   
    rptNarration?: string;
    rptCustomerName?: string;
  
    rptPartNo?: string;

 
    // rptType: [{ value: [null], disabled: true }],
    viewStockTransferType?: ViewStockTransferType[];
 
}