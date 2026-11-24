import { JobInvoice } from "./JobInvoice";
import { JobInvoiceDetails } from "./JobInvoiceDetails";






export interface JobInvoiceCompositeView
{
    jobInvoiceViewModel?: JobInvoice;
    JobInvoiceDetails?: JobInvoiceDetails[];
}
