
   export interface BankReceiptVoucherDetails { 
    bankReceiptVoucherDetailsId?: number;
    bankReceiptVoucherDetailsVoucherNo?: string;
    bankReceiptVoucherDetailsSno?: number;
    bankReceiptVoucherDetailsAcNo?: string;
    bankReceiptVoucherDetailsDrAmount?: number;
    bankReceiptVoucherDetailsDrFcAmount?: number;
    bankReceiptVoucherDetailsCrAmount?: number;
    bankReceiptVoucherDetailsCrFcAmount?: number;
    bankReceiptVoucherDetailsJobNo?: number;
    bankReceiptVoucherDetailsCostCenterId?: number;
    bankReceiptVoucherDetailsNarration?: string;
    bankReceiptVoucherDetailsFsno?: number;
    bankReceiptVoucherDetailsChequeDate?: Date;
    bankReceiptVoucherDetailsChequeNo?:number;
    bankReceiptVoucherDetailsDelStatus?: boolean;
    bankReceiptVoucherDetailsPdc:boolean;
}
