import { AccountsTransactions } from '../Accounts/AccountsTransactions';
import { StockRequisitionDetails } from './StockRequisitionDetails';
// import {  StockRegister } from './StockRegister';

export interface StockRequisition {
  StockRequisitionId?: number;
  StockRequisitionNo?: string;
  StockRequisitionDate?: Date;
  StockRequisitionType?: string;
  StockRequisitionJobId?: number;
  StockRequisitionFsno?: number;
  StockRequisitionFcRate?: number;
  StockRequisitionStatus?: string;
  StockRequisitionDelStatus?: boolean;
  StockRequisitionDetailsReqDate?: Date;
  StockRequisitionDetailsReqStatus?: string;
  StockRequisitionApprovedBy?: number;
  StockRequisitionApprovedDate?: Date;
  StockRequisitionRemarks?: string;
  StockRequisitionRequestedBy?: number;
  accountsTransactions?: AccountsTransactions[];
  StockRequisitionDetails?: StockRequisitionDetails[];
  // stockRegister?:  StockRegister[];
}
