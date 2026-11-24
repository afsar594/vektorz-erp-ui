import { AccountsTransactions } from '../Accounts/AccountsTransactions';
import { SalesReturnDetails } from './SalesReturnDetails';
// import {  StockRegister } from './StockRegister';



export interface SalesReturn {
      salesReturnDptID?: any;
      salesReturnSalesManID?: any;
      salesReturnSVNo?: any;
      salesReturnSVDate?: null;

      salesReturnId?: number;
      salesReturnNo?: string;
      salesReturnDate?: Date;
      salesReturnType?: string;
      salesReturnPartyId?: number;
      salesReturnPartyName?: string;
      salesReturnPartyAddress?: string;
      salesReturnPartyVatNo?: string;
      salesReturnRefNo?: string;
      salesReturnContPerson?: string;


      salesReturnDescription?: string;

      salesReturnDlvNo?: string;
      salesReturnDlvDate?: Date;
      salesReturnSono?: string;
      salesReturnSodate?: Date;
      salesReturnQtnNo?: string;
      salesReturnQtnDate?: Date;

      salesReturnExcludeVat?: boolean;
      salesReturnSalesManId?: number;
      salesReturnDptId?: number;
      salesReturnEnqNo?: string;
      salesReturnEnqDate?: Date;

      salesReturnLocationId?: number;
      salesReturnUserId?: number;
      salesReturnCurrencyId?: number;
      salesReturnCompanyId?: number;
      salesReturnJobId?: number;
      salesReturnFsno?: number;
      salesReturnFcRate?: number;
      salesReturnStatus?: string;
      salesReturnTotalGrossAmount?: number;
      salesReturnTotalItemDisAmount?: number;
      salesReturnTotalActualAmount?: number;
      salesReturnTotalDisPer?: number;
      salesReturnTotalDisAmount?: number;
      salesReturnVatAmt?: number;
      salesReturnVatPer?: number;
      salesReturnVatRoundSign?: string;
      salesReturnVatRountAmt?: number;
      salesReturnNetDisAmount?: number;
      salesReturnNetAmount?: number;

      salesReturnHeader?: string;
      salesReturnDelivery?: string;
      salesReturnNotes?: string;
      salesReturnFooter?: string;


      salesReturnPaymentTerms?: string;
      salesReturnSubject?: string;
      salesReturnContent?: string;
      salesReturnRemarks1?: string;

      salesReturnRemarks2?: string;
      salesReturnTermsAndCondition?: string;
      salesReturnShippinAddress?: string;


      salesReturnSvno?: string;
      salesReturnSvdate?: Date;


      salesReturnDelStatus?: boolean;





      accountsTransactions?: AccountsTransactions[];
      salesReturnDetails?: SalesReturnDetails[];
      // stockRegister?:  StockRegister[];


}