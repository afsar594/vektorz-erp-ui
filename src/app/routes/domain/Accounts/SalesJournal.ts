import { AccountsTransactions } from './AccountsTransactions';
import { SalesJournalDetails } from './SalesJournalDetails';


export interface SalesJournal { 
    salesJournalId?: number;
    salesJournalVno?: string;
    salesJournalDate?: Date;
    salesJournalRefNo?: string;
     
    salesJournalDrAmount?: number;
    salesJournalFcDrAmount?: number;
    salesJournalCrAmount?: number;
    salesJournalFcCrAmount?: number;
    salesJournalFcRate?: number;
    salesJournalNarration?: string;
    salesJournalCurrencyId?: number;
    salesJournalFsno?: number;
    salesJournalUserId?: number;
    salesJournalAllocId?: string;
    salesJournalLocationId?: number;
    salesJournalDelStatus?: boolean;
    salesJournalVoucherType?: string;


    accountsTransactions?: AccountsTransactions[];
    salesJournalDetails?: SalesJournalDetails[];


}