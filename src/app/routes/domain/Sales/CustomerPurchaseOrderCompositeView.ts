import { CustomerPurchaseOrder } from './customerpurchaseorder';
import { CustomerPurchaseOrderDetails } from './CustomerPurchaseOrderDetails';




export interface PaymentVoucherCompositeView
{
    CustomerPurchaseOrder?: CustomerPurchaseOrder;
    CustomerPurchaseOrderrDetails?: CustomerPurchaseOrderDetails [];
}
