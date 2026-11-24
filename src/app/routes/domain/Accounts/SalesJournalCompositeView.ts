import { SalesJournal } from './SalesJournal';
import { SalesJournalDetails } from './SalesJournalDetails';


export interface SalesJournalCompositeView
{
    salesJournalViewModel?: SalesJournal;
    salesJournalDetails?: SalesJournalDetails[];
}