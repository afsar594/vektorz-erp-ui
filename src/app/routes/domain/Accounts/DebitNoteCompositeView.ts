import { DebitNote } from './DebitNote';
import { DebitNoteDetails } from './DebitNoteDetails';


export interface DebitNoteCompositeView
{
    debitNoteViewModel?: DebitNote;
    debitNoteDetails?: DebitNoteDetails[];
}