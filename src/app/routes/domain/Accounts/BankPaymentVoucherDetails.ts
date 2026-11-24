export interface BankPaymentVoucherDetails { 
    bankPaymentVoucherSno?: number;
    bankPaymentVoucherDetailsId?: number;
    bankPaymentVoucherDetailsVoucherNo?: string;
    bankPaymentVoucherDetailsSno?: number;
    bankPaymentVoucherDetailsAcNo?: string;
    bankPaymentVoucherDetailsDrAmount?: number;
    bankPaymentVoucherDetailsDrFcAmount?: number;
    bankPaymentVoucherDetailsCrAmount?: number;
    bankPaymentVoucherDetailsCrFcAmount?: number;
    bankPaymentVoucherDetailsJobNo?: number;
    bankPaymentVoucherDetailsCostCenterId?: number;
    bankPaymentVoucherDetailsNarration?: string;
    bankPaymentVoucherDetailsFsno?: number;
    bankPaymentVoucherDetailsChequeDate?: Date;
    bankPaymentVoucherDetailsChequeNo?:number;
    bankPaymentVoucherDetailsPdc:boolean;
    bankPaymentVoucherDetailsDelStatus?: boolean;

}
