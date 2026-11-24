import { AccountsTransactions } from './AccountsTransactions';
import { PurchaseJournalDetails } from './PurchaseJournalDetails';



export interface PurchaseJournal { 
    purchaseJournalId?: number;
    purchaseJournalVno?: string;
    purchaseJournalDate?: Date;
    purchaseJournalRefNo?: string;
     
    purchaseJournalDrAmount?: number;
    purchaseJournalFcDrAmount?: number;
    purchaseJournalCrAmount?: number;
    purchaseJournalFcCrAmount?: number;
    purchaseJournalFcRate?: number;
    purchaseJournalNarration?: string;
    purchaseJournalCurrencyId?: number;
    purchaseJournalFsno?: number;
    purchaseJournalUserId?: number;
    purchaseJournalAllocId?: string;
    purchaseJournalLocationId?: number;
    purchaseJournalDelStatus?: boolean;
    purchaseJournalVoucherType: string;



    accountsTransactions?: AccountsTransactions[];
    purchaseJournalDetails?: PurchaseJournalDetails[];


}