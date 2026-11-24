import { JournalVoucher } from './JournalVoucher';
import { JournalVoucherDetails } from './JournalVoucherDetails';


export interface JournalVoucherCompositeView
{
    journalVoucherViewModel?: JournalVoucher;
    journalVoucherDetails?: JournalVoucherDetails[];
}