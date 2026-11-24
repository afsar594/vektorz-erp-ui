import { AccountsTransactions } from '../Accounts/AccountsTransactions';
import { GeneralPurchaseOrderDetails } from './JeneralPurchaseOrderDetails';
// import {  StockRegister } from './StockRegister';

export interface GeneralPurchaseOrder {
  isPrintEnabled: boolean;
  GeneralPurchaseOrderId: number;
  generalPurchaseOrderPono: string;
  generalPurchaseOrderSupplierId: number;
  generalPurchaseOrderPoDate: string;
  generalPurchaseOrderDescription: string;
  generalPurchaseOrderLpoNo: string;
  generalPurchaseOrderLpoDate: string;
  generalPurchaseOrderTotalAmount: number;
  generalPurchaseOrderStatus: string;
  generalPurchaseOrderDiscountPercentage: number;
  generalPurchaseOrderDiscount: number;
  generalPurchaseOrderLocationId: number;
  generalPurchaseOrderCurrencyId: number;
  generalPurchaseOrderNetAmount: number;
  generalPurchaseOrderFsno: number;
  generalPurchaseOrderUserId: number;
  generalPurchaseOrderTermAndCondition: string;
  generalPurchaseOrderJobId: number;
  generalPurchaseOrderApproveDate: string;
  generalPurchaseOrderApproveStatus: string;
  generalPurchaseOrderApprovedBy: number;
  generalPurchaseOrderHeader: string;
  generalPurchaseOrderFooter: string;
  generalPurchaseOrderTerms: string;
  generalPurchaseOrderPaymentTerms: string;
  generalPurchaseOrderDelivery: string;
  generalPurchaseOrderIndentNo: string;
  generalPurchaseOrderDelStatus: boolean;
  GeneralpurchaseOrderOrdertype: string;
  vatper: number;
  vatamt: number;

  accountsTransactions?: AccountsTransactions[];
  GeneralpurchaseOrderDetails?: GeneralPurchaseOrderDetails[];
  // stockRegister?:  StockRegister[];
}
