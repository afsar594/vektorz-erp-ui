import { DeliveryNote } from "./DeliveryNote";
import { DeliveryNoteDetails } from "./DeliveryNoteDetails";



export interface DeliveryNoteCompositeView
{
    deliveryNoteViewModel?: DeliveryNote;
    deliveryNoteDetails?: DeliveryNoteDetails[];
}