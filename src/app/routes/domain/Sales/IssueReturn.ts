import { AccountsTransactions } from '../Accounts/AccountsTransactions';
import {  IssueReturnDetails } from './IssueReturnDetails';
// import {  StockRegister } from './StockRegister';
 


export interface  IssueReturn{ 
      issueReturnId?: number;
      issueReturnNo?: string;
      issueReturnDate?: Date;
      issueReturnCreditAccNo?: string;
      issueReturnDepartmentId?: number;
      issueReturnBufferRemark1?: string;
      issueReturnCostCenterId?: string;
      issueReturnDebitAccNo?: string;
      issueReturnRefNo?: string;
      issueReturnIvNoForRet?: string;


      issueReturnDescription?: string;

      issueReturnGrno?: string;
      issueReturnGrdate?: Date;
      issueReturnLpono?: string;
      issueReturnLpodate?: Date;
      issueReturnQtnNo?: string;
      issueReturnQtnDate?: Date;
   
      issueReturnIvDateForRet?: Date;
      issueReturnReqNo?: string;
      issueReturnReqDate?: Date;
      issueReturnDayBookNo?: string;
      issueReturnLocationId?: number;
      issueReturnUserId?: number;
      issueReturnCurrencyId?: number;
      issueReturnCompanyId?: number;
      issueReturnJobId?: number;
      issueReturnFsno?: number;
      issueReturnFcRate?: number;
      issueReturnStatus?: string;
      issueReturnTotalGrossAmount?: number;
      issueReturnTotalItemDisAmount?: number;
      issueReturnTotalActualAmount?: number;
      issueReturnTotalDisPer?: number;
      issueReturnTotalDisAmount?: number;
      issueReturnVatAmt?: number;
      issueReturnVatPer?: number;
      issueReturnVatRoundSign?: string;
      issueReturnVatRountAmt?: number;
      issueReturnNetDisAmount?: number;
      issueReturnNetAmount?: number;
      issueReturnBufferRemark12?: string;
      issueReturnBufferRemark13?: string;
      issueReturnBufferPurNo?: string;
      issueReturnBufferReqNo?: string;
      issueReturnDelStatus?: boolean;



       accountsTransactions?: AccountsTransactions[];
       issueReturnDetails?:  IssueReturnDetails[];
       // stockRegister?:  StockRegister[];

       
}