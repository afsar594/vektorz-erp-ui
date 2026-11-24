import { AccountsTransactions } from '../Accounts/AccountsTransactions';
import { PurchaseReturnDetails } from './PurchaseReturnDetails';
// import {  StockRegister } from './StockRegister';



export interface PurchaseReturn {
      purchaseVoucherPONo: number;

      purchaseReturnId?: number;
      purchaseReturnNo?: string;
      purchaseReturnDate?: Date;
      purchaseReturnType?: string;
      purchaseReturnPartyId?: number;
      purchaseReturnPartyName?: string;
      purchaseReturnPartyAddress?: string;
      purchaseReturnPartyVatNo?: string;
      purchaseReturnRefNo?: string;
      purchaseReturnSupInvNo?: string;


      purchaseReturnDescription?: string;

      purchaseReturnGrno?: string;
      purchaseReturnGrdate?: Date;
      purchaseReturnLpono?: string;
      purchaseReturnLpodate?: Date;
      purchaseReturnQtnNo?: string;
      purchaseReturnQtnDate?: Date;

      purchaseReturnExcludeVat?: boolean;
      purchaseReturnPono?: string;
      purchaseReturnBatchCode?: string;
      purchaseReturnDayBookNo?: string;
      purchaseReturnLocationId?: number;
      purchaseReturnUserId?: number;
      purchaseReturnCurrencyId?: number;
      purchaseReturnCompanyId?: number;
      purchaseReturnJobId?: number;
      purchaseReturnFsno?: number;
      purchaseReturnFcRate?: number;
      purchaseReturnStatus?: string;
      purchaseReturnTotalGrossAmount?: number;
      purchaseReturnTotalItemDisAmount?: number;
      purchaseReturnTotalActualAmount?: number;
      purchaseReturnTotalDisPer?: number;
      purchaseReturnTotalDisAmount?: number;
      purchaseReturnVatAmt?: number;
      purchaseReturnVatPer?: number;
      purchaseReturnVatRoundSign?: string;
      purchaseReturnVatRountAmt?: number;
      purchaseReturnNetDisAmount?: number;
      purchaseReturnNetAmount?: number;
      purchaseReturnTransportCost?: number;
      purchaseReturnHandlingcharges?: number;
      purchaseReturnIssueId?: string;
      purchaseReturnJobDirectPur?: boolean;
      purchaseReturnDelStatus?: boolean;


      accountsTransactions?: AccountsTransactions[];
      purchaseReturnDetails?: PurchaseReturnDetails[];
      // stockRegister?:  StockRegister[];

      currencyMasterCurrencyName: string;


}