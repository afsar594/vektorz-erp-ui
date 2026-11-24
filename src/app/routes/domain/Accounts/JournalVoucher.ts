import { AccountsTransactions } from './AccountsTransactions';
import { JournalVoucherDetails } from './JournalVoucherDetails';

 


export interface JournalVoucher {
    journalVoucherDepreciationFrom: any;
    journalVoucherDepreciationTo: any; 
    journalVoucherId?: number;
    journalVoucherVrefNo:string;
    journalVoucherDate?: Date;
    journalVoucherRefNo?: string;
    journalVoucherAcNo?: string;
    journalVoucherDrAmount?: number;
    journalVoucherFcDrAmount?: number;
    journalVoucherCrAmount?: number;
    journalVoucherFcCrAmount?: number;
    journalVoucherFcRate?: number;
    journalVoucherNarration?: string;
    journalVoucherCurrencyId?: number;
    journalVoucherFsno?: number;
    journalVoucherUserId?: number;
    journalVoucherAllocId?: string;
    journalVoucherLocationId?: number;
    journalVoucherDelStatus?: boolean;
    journalVoucherVoucherType: string;

    accountsTransactions?: AccountsTransactions[];
    journalVoucherDetails?: JournalVoucherDetails[];


}