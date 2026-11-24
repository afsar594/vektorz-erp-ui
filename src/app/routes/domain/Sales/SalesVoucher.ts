import { AccountsTransactions } from '../Accounts/AccountsTransactions';
import { SalesVoucherDetails } from './SalesVoucherDetails';
// import {  StockRegister } from './StockRegister';

export interface SalesVoucher {
  salesVoucherId?: number;
  salesVoucherNo?: string;
  salesVoucherDate?: Date;
  salesVoucherType?: string;
  salesVoucherPartyId?: number;
  salesVoucherPartyName?: string;
  salesVoucherPartyAddress?: string;
  salesVoucherPartyVatNo?: string;
  salesVoucherRefNo?: string;
  salesVoucherContPerson?: string;
  salesVoucherDescription?: string;
  salesVoucherDlvNo?: string;
  salesVoucherDlvDate?: Date;
  salesVoucherSono?: string;
  salesVoucherSodate?: Date;
  salesVoucherQtnNo?: string;
  salesVoucherQtnDate?: Date;

  salesVoucherExcludeVat?: boolean;
  salesVoucherSalesManId?: number;
  salesVoucherDptId?: number;
  salesVoucherEnqNo?: string;
  salesVoucherEnqDate?: Date;
  salesVoucherCostCenterId?: number;
  salesVoucherLocationId?: number;
  salesVoucherUserId?: number;
  salesVoucherCurrencyId?: number;
  salesVoucherCompanyId?: number;
  salesVoucherJobId?: number;
  salesVoucherFsno?: number;
  salesVoucherFcRate?: number;
  salesVoucherStatus?: string;
  salesVoucherTotalGrossAmount?: number;
  salesVoucherTotalItemDisAmount?: number;
  salesVoucherTotalActualAmount?: number;
  salesVoucherTotalDisPer?: number;
  salesVoucherTotalDisAmount?: number;
  salesVoucherVatAmt?: number;
  salesVoucherVatPer?: number;
  salesVoucherVatRoundSign?: string;
  salesVoucherVatRountAmt?: number;
  salesVoucherNetDisAmount?: number;
  salesVoucherNetAmount?: number;

  salesVoucherHeader?: string;
  salesVoucherDelivery?: string;
  salesVoucherNotes?: string;
  salesVoucherFooter?: string;

  salesVoucherPaymentTerms?: string;
  salesVoucherSubject?: string;
  salesVoucherContent?: string;
  salesVoucherRemarks1?: string;

  salesVoucherRemarks2?: string;
  salesVoucherTermsAndCondition?: string;
  salesVoucherShippinAddress?: string;

  salesVoucherDelStatus?: boolean;
  currencyMasterCurrencyName: string;
  deliveryRequriedOn: string;

  termsofDelivery: string;
  item: string;
  projectRefNo: string;
  accountsTransactions?: AccountsTransactions[];
  salesVoucherDetails?: SalesVoucherDetails[];
  salesChargesList?: ISalesChargesList[];
  // stockRegister?:  StockRegister[];
}
export interface ISalesChargesList {
  chargesId?: number;
  voucherno: string;
  serviceID: number;
  amount: number;
  taxIncAmount: number;
  remarks: string;
}
export interface PagedRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: string;
  supplier?: number;
}
