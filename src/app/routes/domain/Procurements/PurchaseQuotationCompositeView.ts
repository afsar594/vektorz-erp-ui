import { PurchaseQuotation} from './PurchaseQuotation';
import { PurchaseQuotationDetails } from './PurchaseQuotationDetails';


export interface PurchaseQuotationCompositeView
{
    purchaseQuotationViewModel?: PurchaseQuotation;
    purchaseQuotationDetails?: PurchaseQuotationDetails[];
}