import { ViewStockTransferType } from '../Store/ViewStockTransferType';

export interface PurchaseOrderReportParameters {
  rptPrintGroupByItem?: boolean;
  rptSummary?: boolean;
  rptDetails?: boolean;
  rptDateRange?: boolean;
  rptDtpFrom?: any;
  rptDtpTo?: any;
  rptZeroVat?: boolean;
  rptLocation?: number;
  rptJob?: number;
  rptSupplier?: number;
  0;

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

  viewStockTransferType?: ViewStockTransferType[];
}
