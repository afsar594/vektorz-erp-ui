import { CreditNote } from './CreditNote';
import { CreditNoteDetails } from './CreditNoteDetails';


export interface CreditNoteCompositeView
{
    creditNoteViewModel?: CreditNote;
    creditNoteDetails?: CreditNoteDetails[];
}