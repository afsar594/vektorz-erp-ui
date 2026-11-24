import { SalesReturn} from './SalesReturn';
import { SalesReturnDetails } from './SalesReturnDetails';


export interface SalesReturnCompositeView
{
    salesReturnViewModel?: SalesReturn;
    salesReturnDetails?: SalesReturnDetails[];
}


