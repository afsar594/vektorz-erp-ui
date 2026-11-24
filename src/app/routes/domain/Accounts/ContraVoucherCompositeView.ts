import { ContraVoucher } from './ContraVoucher';
import { ContraVoucherDetails } from './ContraVoucherDetails';


export interface ContraVoucherCompositeView
{
    contraVoucherViewModel?: ContraVoucher;
    contraVoucherDetails?: ContraVoucherDetails[];
}
