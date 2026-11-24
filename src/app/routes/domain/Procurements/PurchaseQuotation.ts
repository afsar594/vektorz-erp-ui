import { AccountsTransactions } from '../Accounts/AccountsTransactions';
import {  PurchaseQuotationDetails } from './PurchaseQuotationDetails';
// import {  StockRegister } from './StockRegister';
 


export interface  PurchaseQuotation{ 
     
 purchaseQuotationId?: number;
       purchaseQuotationNo?: string;
       purchaseQuotationDate?: Date;
       purchaseQuotationType?: string;
       purchaseQuotationPartyId?: number;
       purchaseQuotationPartyName?: string;
       purchaseQuotationPartyAddress?: string;
       purchaseQuotationPartyVatNo?: string;
       purchaseQuotationRefNo?: string;
       purchaseQuotationSupInvNo?: string;


       purchaseQuotationDescription?: string;

       purchaseQuotationGrno?: string;
       purchaseQuotationGrdate?: Date;
       purchaseQuotationLpono?: string;
       purchaseQuotationLpodate?: Date;
       purchaseQuotationQtnNo?: string;
       purchaseQuotationQtnDate?: Date;
    
       purchaseQuotationExcludeVat?: boolean;
       purchaseQuotationPono?: string;
       purchaseQuotationBatchCode?: string;
       purchaseQuotationDayBookNo?: string;
       purchaseQuotationLocationId?: number;
       purchaseQuotationUserId?: number;
       purchaseQuotationCurrencyId?: number;
       purchaseQuotationCompanyId?: number;
       purchaseQuotationJobId?: number;
       purchaseQuotationFsno?: number;
       purchaseQuotationFcRate?: number;
       purchaseQuotationStatus?: string;
       purchaseQuotationTotalGrossAmount?: number;
       purchaseQuotationTotalItemDisAmount?: number;
       purchaseQuotationTotalActualAmount?: number;
       purchaseQuotationTotalDisPer?: number;
       purchaseQuotationTotalDisAmount?: number;
       purchaseQuotationVatAmt?: number;
       purchaseQuotationVatPer?: number;
       purchaseQuotationVatRoundSign?: string;
       purchaseQuotationVatRountAmt?: number;
       purchaseQuotationNetDisAmount?: number;
       purchaseQuotationNetAmount?: number;
       purchaseQuotationTransportCost?: number;
       purchaseQuotationHandlingcharges?: number;
       purchaseQuotationIssueId?: string;
       purchaseQuotationJobDirectPur?: boolean;
       purchaseQuotationDelStatus?: boolean;


       accountsTransactions?: AccountsTransactions[];
       purchaseQuotationDetails?:  PurchaseQuotationDetails[];
       // stockRegister?:  StockRegister[];

       
}