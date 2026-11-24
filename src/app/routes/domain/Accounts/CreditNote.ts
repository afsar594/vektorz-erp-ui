
import { AccountsTransactions } from './AccountsTransactions';
import { CreditNoteDetails } from './CreditNoteDetails';

 


export interface CreditNote { 
    creditNoteId?: number;
    creditNoteVno?: string;
    creditNoteDate?: Date;
    creditNoteRefNo?: string;
    creditNoteAcNo?: string;
    creditNoteDrAmount?: number;
    creditNoteFcDrAmount?: number;
    creditNoteCrAmount?: number;
    creditNoteFcCrAmount?: number;
    creditNoteFcRate?: number;
    creditNoteNarration?: string;
    creditNoteCurrencyId?: number;
    creditNoteFsno?: number;
    creditNoteUserId?: number;
    creditNoteAllocId?: string;
    creditNoteLocationId?: number;
    creditNoteDelStatus?: boolean;
    creditNoteVoucherType: string;

    accountsTransactions?: AccountsTransactions[];
    creditNoteDetails?: CreditNoteDetails[];


}