
import { AccountsTransactions } from './AccountsTransactions';
import {  PurchaseVoucherDetails } from './PurchaseVoucherDetails';
// import {  StockRegister } from './StockRegister';
 


export interface  PurchaseVoucher {
  purchaseVoucherPurID: number; 
      
      purchaseVoucherPurId?:number;
      purchaseVoucherVoucherNo?:string;
      purchaseVoucherPurchaseIdNum?:number;
      purchaseVoucherPurchaseRef?:string;
      purchaseVoucherPurchaseType?:string;
      purchaseVoucherGrNo?:string;
      purchaseVoucherGrDate?:Date;
      purchaseVoucherSpId?:number;
      purchaseVoucherSpAccNo?:string;
      purchaseVoucherSpAmount?:number;
      purchaseVoucherFcSpAmount?:number;
      purchaseVoucherPurchaseDate?:Date;
      purchaseVoucherLpoNo?:string;
      purchaseVoucherLpoDate?:Date;
      purchaseVoucherQuatationNo?:string;
      purchaseVoucherQuatationDate?:Date;
      purchaseVoucherActualAmount?:number;
      purchaseVoucherNetAmount?:number;
      purchaseVoucherTransportCost?:number;
      purchaseVoucherHandlingCharges?:number;
      purchaseVoucherFcActualAmount?:number;
      purchaseVoucherFcNetAmount?:number;
      purchaseVoucherDescription?:string;
      purchaseVoucherDrAccNo?:number;
      purchaseVoucherDrAmount?:number;
      purchaseVoucherFcDrAmount?:number;
      purchaseVoucherDisYn?:string;
      purchaseVoucherDisAcNo?:string;
      purchaseVoucherDisAmount?:number;
      purchaseVoucherFcDisAmount?:number;
      purchaseVoucherStatus?:string;
      purchaseVoucherFsno?:number;
      purchaseVoucherUserId?:number;
      purchaseVoucherFcRate?:number;
      purchaseVoucherLocationId?:number;
      purchaseVoucherSupplyInvoiceNo?:string;
      purchaseVoucherDiscountPercentage?:number;
      purchaseVoucherPoNo?:number;
      purchaseVoucherCurrencyId?:number;
      purchaseVoucherCompanyId?:number;
      purchaseVoucherJobId?:number;
      purchaseVoucherBatchCode?:string;
      purchaseVoucherCashSupplierName?:string;
      purchaseVoucherDayBookNo?:string;
      purchaseVoucherVatAmount?:number;
      purchaseVoucherVatPercentage?:number;
      purchaseVoucherVatRoundSign?:string;
      purchaseVoucherVatRoundAmount?:number;
      purchaseVoucherVatNo?:string;
      purchaseVoucherExcludeVat?:Boolean;
      purchaseVoucherIssuedId?:number;
      purchaseVoucherJobDirectPurchase?:Boolean;
      purchaseVoucherGrnoTmp?:string;
      purchaseVoucherPartyId?:number;
      purchaseVoucherPartyName?:string;
      purchaseVoucherPartyAddress?:string;
      purchaseVoucherPartyVatNo?:string;
      purchaseVoucherTotalGrossAmt?:number;
      purchaseVoucherTotalItemDisAmount?:number;
      purchaseVoucherTotalDiscountAmt?:number;
      purchaseVoucherDelStatus?:Boolean;
      

       accountsTransactions?: AccountsTransactions [];
       purchaseVoucherDetails?:  PurchaseVoucherDetails[];
       // stockRegister?:  StockRegister[];

       
}