import { AccountsTransactions } from "./AccountsTransactions";
import { JobInvoiceDetails } from "./JobInvoiceDetails";

export interface JobInvoice {
        advance: number;
        retention: number;
        jobInvoiceRetention: number;
        jobInvoiceAdvance: number;
        accountsTransactions: AccountsTransactions[];
        invoicetype: any;
        jobInvoiceVatAmt?: number;
        jobInvoiceVat?: number;
        jobInvoiceId?: number;
        jobInvoiceVoucherNo: string;
        jobInvoiceVoucherDate: string;
        jobInvoiceJobId?: number;
        jobInvoiceCustomerName?: string;
        jobInvoiceCustomerId?: number;
        jobInvoiceLocationId?: number;
        jobInvoiceSalesManId?: number;
        jobInvoiceDiscount?: number;
        jobInvoiceGrossAmount?: number;
        jobInvoiceNetAmount?: number;
        jobInvoiceRemarks?: string;
        jobInvoiceUserId?: number;
        jobInvoiceCurrencyId?: number;
        jobInvoiceFsno?: number;
        jobInvoiceFcRate?: number;
        jobInvoiceLpoNo?: string;
        jobInvoiceLpoDate?: string;
        jobInvoiceSalesAccount?: string;
        jobInvoiceDelStatus?: boolean;
        jobInvoiceDetails?: JobInvoiceDetails[]

}