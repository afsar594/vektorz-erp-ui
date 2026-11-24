import { AccountsTransactions } from './AccountsTransactions';
import { ContraVoucherDetails } from './ContraVoucherDetails';

 


export interface ContraVoucher { 
    contraVoucherId?: number;
    contraVoucherVno?: number;
    contraVoucherDate?: Date;
    contraVoucherRefNo?: string;
    contraVoucherAcNo?: string;
    contraVoucherDrAmount?: number;
    contraVoucherFcDrAmount?: number;
    contraVoucherCrAmount?: number;
    contraVoucherFcCrAmount?: number;
    contraVoucherFcRate?: number;
    contraVoucherNarration?: string;
    contraVoucherCurrencyId?: number;
    contraVoucherFsno?: number;
    contraVoucherUserId?: number;
    contraVoucherAllocId?: string;
    contraVoucherLocationId?: number;
    contraVoucherDelStatus?: boolean;
    contraVoucherVoucherType: string;

    accountsTransactions?: AccountsTransactions[];
    contraVoucherDetails?: ContraVoucherDetails[];


}