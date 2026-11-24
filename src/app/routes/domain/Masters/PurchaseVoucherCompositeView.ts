import { PurchaseVoucher } from './PurchaseVoucher';
import { PurchaseVoucherDetails } from './PurchaseVoucherDetails';


export interface PurchaseVoucherCompositeView
{
    purchaseVoucherViewModel?: PurchaseVoucher;
    purchaseVoucherDetails?: PurchaseVoucherDetails[];
}