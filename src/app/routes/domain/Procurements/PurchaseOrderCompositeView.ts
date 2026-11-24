import { PurchaseOrder } from './PurchaseOrder';
import { PurchaseOrderDetails } from './PurchaseOrderDetails';


export interface PurchaseOrderCompositeView
{
    purchaseOrderViewModel?: PurchaseOrder;
    purchaseOrderDetails?: PurchaseOrderDetails[];
}