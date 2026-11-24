import { AccountsTransactions } from './AccountsTransactions';
import { AllocationDetails } from './AllocationDetails';
import { BankReceiptVoucherDetails } from './BankReceiptVoucherDetails';

 
export interface BankReceiptVoucher {
    bankReceiptVoucherSno: any; 
        
    bankReceiptVoucherVoucherNo?: string;
    bankReceiptVoucherVDate?: Date;
    bankReceiptVoucherRefNo?: string;
    bankReceiptVoucherDrAcNo?: string;
    bankReceiptVoucherCrAmount?: number;
    bankReceiptVoucherFrCrAmount?: number;
    bankReceiptVoucherDrAmount?: number;
    bankReceiptVoucherFrDrAmount?: number;
    bankReceiptVoucherNarration?: string;
    bankReceiptVoucherFsno?: number;
    bankReceiptVoucherUserId?: number;
    bankReceiptVoucherCurrencyId?: number;
    bankReceiptVoucherLocationId?: number;
    bankReceiptVoucherAllocId?: number;
    accountsTransactions?: AccountsTransactions[];
    bankReceiptVoucherDetails?: BankReceiptVoucherDetails[];
    bankReceiptVoucherDelStatus?: boolean;
    AllocationDetails?:AllocationDetails[];

    }