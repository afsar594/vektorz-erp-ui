import { AccountsTransactions } from '../Accounts/AccountsTransactions';
import {  IssueVoucherDetails } from './IssueVoucherDetails';
// import {  StockRegister } from './StockRegister';
 


export interface  IssueVoucher{ 
      

      issueVoucherId?: number;
      issueVoucherNo?: string;
      issueVoucherDate?: Date;
      issueVoucherCreditAccNo?: string;
      issueVoucherDepartmentId?: number;
      issueVoucherBufferRemark1?: string;
      issueVoucherCostCenterId?: string;
      issueVoucherDebitAccNo?: string;
      issueVoucherRefNo?: string;
      issueVoucherIvNoForRet?: string;


      issueVoucherDescription?: string;

      issueVoucherGrno?: string;
      issueVoucherGrdate?: Date;
      issueVoucherLpono?: string;
      issueVoucherLpodate?: Date;
      issueVoucherQtnNo?: string;
      issueVoucherQtnDate?: Date;
   
      issueVoucherIvDateForRet?: Date;
      issueVoucherReqNo?: string;
      issueVoucherReqDate?: Date;
      issueVoucherDayBookNo?: string;
      issueVoucherLocationId?: number;
      issueVoucherUserId?: number;
      issueVoucherCurrencyId?: number;
      issueVoucherCompanyId?: number;
      issueVoucherJobId?: number;
      issueVoucherFsno?: number;
      issueVoucherFcRate?: number;
      issueVoucherStatus?: string;
      issueVoucherTotalGrossAmount?: number;
      issueVoucherTotalItemDisAmount?: number;
      issueVoucherTotalActualAmount?: number;
      issueVoucherTotalDisPer?: number;
      issueVoucherTotalDisAmount?: number;
      issueVoucherVatAmt?: number;
      issueVoucherVatPer?: number;
      issueVoucherVatRoundSign?: string;
      issueVoucherVatRountAmt?: number;
      issueVoucherNetDisAmount?: number;
      issueVoucherNetAmount?: number;
      issueVoucherBufferRemark12?: string;
      issueVoucherBufferRemark13?: string;
      issueVoucherBufferPurNo?: string;
      issueVoucherBufferReqNo?: string;
      issueVoucherDelStatus?: boolean;



       accountsTransactions?: AccountsTransactions[];
       issueVoucherDetails?:  IssueVoucherDetails[];
       // stockRegister?:  StockRegister[];

       
}