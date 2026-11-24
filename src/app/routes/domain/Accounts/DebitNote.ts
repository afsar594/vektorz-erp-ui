import { AccountsTransactions } from './AccountsTransactions';
import { DebitNoteDetails } from './DebitNoteDetails';




export interface DebitNote { 
    debitNoteId?: number;
    debitNoteVno?: string;
    debitNoteDate?: Date;
    debitNoteRefNo?: string;
    debitNoteAcNo?: string;
    debitNoteDrAmount?: number;
    debitNoteFcDrAmount?: number;
    debitNoteCrAmount?: number;
    debitNoteFcCrAmount?: number;
    debitNoteFcRate?: number;
    debitNoteNarration?: string;
    debitNoteCurrencyId?: number;
    debitNoteFsno?: number;
    debitNoteUserId?: number;
    debitNoteAllocId?: string;
    debitNoteLocationId?: number;
    debitNoteDelStatus?: boolean;
    debitNoteVoucherType: string;


    accountsTransactions?: AccountsTransactions[];
    debitNoteDetails?: DebitNoteDetails[];


 }