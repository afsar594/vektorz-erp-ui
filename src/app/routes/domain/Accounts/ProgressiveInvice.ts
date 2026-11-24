import { AccountsTransactions } from "../Masters/AccountsTransactions";

export interface ProgressiveInvoice {
    progressiveInvoiceId?: number;
    progressiveInvoiceInvNo?: string;
    progressiveInvoiceCustId?: number;
    progressiveInvoiceJobId?: number;
    progressiveInvoiceInvDate?: Date;
    progressiveInvoiceIsVariation?: boolean;
    progressiveInvoiceInvoiceType?: string;
    progressiveInvoiceReference?: string;
    progressiveInvoiceTotAmount?: number;
    progressiveInvoiceStatus?: string;
    progressiveInvoiceDiscPercentage?: number;
    progressiveInvoiceDiscount?: number;
    progressiveInvoicePrintInv?: string;
    progressiveInvoiceLocationId?: number;
    progressiveInvoicePayAppNo?: string;
    progressiveInvoiceDescription?: string;
    progressiveInvoiceProgress?: string;
    progressiveInvoiceCurComplVal?: number;
    progressiveInvoiceCurComplPer?: number;
    progressiveInvoicePrevComplVal?: number;
    progressiveInvoicePrevComplPer?: number;
    progressiveInvoiceCumilativeVal?: number;
    progressiveInvoiceCumilativePer?: number;
    progressiveInvoiceAmountDue?: number;
    progressiveInvoiceTotal?: number;
    progressiveInvoiceFsno?: number;
    progressiveInvoiceUserId?: number;
    progressiveInvoiceDescriptionId?: number;
    progressiveInvoicePlRetention?: number;
    progressiveInvoicePlTotalAmount?: number;
    progressiveInvoiceDelStatus?: boolean;
    progressiveInvoiceRetAmount?: number;
    progressiveInvoiceVariationAmount?: number;
    progressiveInvoiceAdvanceDeduction?: number;
    accountsTransactions?: AccountsTransactions[];
    progressiveInvoiceDetails?: ProgressiveInvoiceDetail[];
  }
  
 
  
  export interface ProgressiveInvoiceDetail {
    progressiveInvoiceDetailsPrDetId: number;
    progressiveInvoiceDetailsId: number;
    progressiveInvoiceDetailsJobDecId: number;
    progressiveInvoiceDetailsDescrId: number;
    progressiveInvoiceDetailsAmount: number;
    progressiveInvoiceDetailsPerValue: number;
    progressiveInvoiceDetailsRemarks: string;
    progressiveInvoiceDetailsIsEdit: boolean;
    progressiveInvoiceDetailsDelStatus: boolean;
  }