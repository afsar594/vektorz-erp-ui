import { stream } from 'xlsx/types';
import { CustomerPurchaseOrderDetails } from './CustomerPurchaseOrderDetails';

export interface CustomerPurchaseOrder{
   
    customerPurchaseOrderId?:Number;
    customerPurchaseOrderVoucherNo?:string;
    customerPurchaseOrderCPOID? : Number;
    customerPurchaseOrderLocationId? : String;
    customerPurchaseOrderCustomerId? : String;
    customerPurchaseOrderDepartmentId? : String;
    customerPurchaseOrderSalesManId? : String;
    customerPurchaseOrderJobId? : String;
    customerPurchaseOrderRemarks? : String;
    customerPurchaseOrderSONo? : Number;
    customerPurchaseOrderDate? : Date;
    customerPurchaseOrderLpoNo? : string;
    customerPurchaseOrderLpoDate? : Date;
    customerPurchaseOrderDelSch?:string;
    customerPurchaseOrderCurrencyId? : String;
    customerPurchaseOrderQuotationId? : String;
    customerPurchaseOrderGrandTotal?:Number;
    customerPurchaseOrderDiscountAmount?:Number;
    customerPurchaseOrderDiscountPercentage?:Number;
    customerPurchaseOrderVatAmount?:Number;
    customerPurchaseOrderTotal?:Number;
    customerPurchaseOrderVat:Number;
    customerPurchaseOrderVAT_Percen:Number;
    customerMasterCustomerContactPerson:string;
    customerMasterCustomerVatNo;

    

    customerPurchaseOrderDetails: CustomerPurchaseOrderDetails[];
    customerPurchaseOrderDelStatus?: boolean;

}