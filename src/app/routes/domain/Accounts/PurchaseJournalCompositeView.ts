import { PurchaseJournal } from './PurchaseJournal';
import { PurchaseJournalDetails } from './PurchaseJournalDetails';


export interface PurchaseJournalCompositeView
{
    purchaseJournalViewModel?: PurchaseJournal;
    purchaseJournalDetails?: PurchaseJournalDetails[];
}