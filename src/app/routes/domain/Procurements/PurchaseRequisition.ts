import { AccountsTransactions } from '../Accounts/AccountsTransactions';
import { PurchaseRequisitionDetails } from './PurchaseRequisitionDetails';
// import {  StockRegister } from './StockRegister';



export interface PurchaseRequisition {
      jobname: string;
      paymentTerms: string;
      deliveryatsite: string;
      deliveryterms: string;
      confirmationemaildetails: string;
      purchaseRequisitionApprovedBy: any;
      purchaseRequisitionApproveEnable: any;
      isPrintEnabled?: boolean;
      isEditEnabled?: boolean;
      purchaseRequisitionId?: number;
      purchaseRequisitionNo?: string;
      purchaseRequisitionDate?: Date;
      purchaseRequisitionType?: string;
      purchaseRequisitionPartyId?: number;
      purchaseRequisitionPartyName?: string;
      purchaseRequisitionPartyAddress?: string;
      purchaseRequisitionPartyVatNo?: string;
      purchaseRequisitionRefNo?: string;
      purchaseRequisitionSupInvNo?: string;


      purchaseRequisitionDescription?: string;

      purchaseRequisitionGrno?: string;
      purchaseRequisitionGrdate?: Date;
      purchaseRequisitionLpono?: string;
      purchaseRequisitionLpodate?: Date;
      purchaseRequisitionQtnNo?: string;
      purchaseRequisitionQtnDate?: Date;

      purchaseRequisitionExcludeVat?: boolean;
      purchaseRequisitionPono?: string;
      purchaseRequisitionBatchCode?: string;
      purchaseRequisitionDayBookNo?: string;
      purchaseRequisitionLocationId?: number;
      purchaseRequisitionUserId?: number;
      purchaseRequisitionCurrencyId?: number;
      purchaseRequisitionCompanyId?: number;
      purchaseRequisitionJobId?: number;
      purchaseRequisitionFsno?: number;
      purchaseRequisitionFcRate?: number;
      purchaseRequisitionStatus?: string;
      purchaseRequisitionTotalGrossAmount?: number;
      purchaseRequisitionTotalItemDisAmount?: number;
      purchaseRequisitionTotalActualAmount?: number;
      purchaseRequisitionTotalDisPer?: number;
      purchaseRequisitionTotalDisAmount?: number;
      purchaseRequisitionVatAmt?: number;
      purchaseRequisitionVatPer?: number;
      purchaseRequisitionVatRoundSign?: string;
      purchaseRequisitionVatRountAmt?: number;
      purchaseRequisitionNetDisAmount?: number;
      purchaseRequisitionNetAmount?: number;
      purchaseRequisitionTransportCost?: number;
      purchaseRequisitionHandlingcharges?: number;
      purchaseRequisitionIssueId?: string;
      purchaseRequisitionJobDirectPur?: boolean;
      purchaseRequisitionDelStatus?: boolean;


      accountsTransactions?: AccountsTransactions[];
      purchaseRequisitionDetails?: PurchaseRequisitionDetails[];
      // stockRegister?:  StockRegister[];


}