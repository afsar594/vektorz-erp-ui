import { SalesVoucher} from './SalesVoucher';
import { SalesVoucherDetails } from './SalesVoucherDetails';


export interface SalesVoucherCompositeView
{
    salesVoucherViewModel?: SalesVoucher;
    salesVoucherDetails?: SalesVoucherDetails[];
}


