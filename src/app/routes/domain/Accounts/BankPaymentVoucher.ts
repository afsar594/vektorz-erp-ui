import { AccountsTransactions } from './AccountsTransactions';
import { AllocationDetails } from './AllocationDetails';
import { BankPaymentVoucherDetails } from './BankPaymentVoucherDetails';


export interface BankPaymentVoucher {
    bankPaymentVoucherSno: any;

    bankPaymentVoucherVoucherNo?: string;
    bankPaymentVoucherVDt?: Date;
    bankPaymentVoucherRefNo?: string;
    bankPaymentVoucherCrAcNo?: string;
    bankPaymentVoucherCrAmount?: number;
    bankPaymentVoucherFrCrAmount?: number;
    bankPaymentVoucherDrAmount?: number;
    bankPaymentVoucherFrDrAmount?: number;
    bankPaymentVoucherNarration?: string;
    bankPaymentVoucherFsno?: number;
    bankPaymentVoucherUserId?: number;
    bankPaymentVoucherCurrencyId?: number;
    bankPaymentVoucherLocationId?: number;
    bankPaymentVoucherAllocId?: number;
    accountsTransactions?: AccountsTransactions[];
    bankPaymentVoucherDetails?: BankPaymentVoucherDetails[];
    bankPaymentVoucherDelStatus?: boolean;
    AllocationDetails?: AllocationDetails[];
    pdcDetails?: PdcDetail[];
}


export interface PdcDetail {
    pdC_Details_Cheque_Status?: string;

}
