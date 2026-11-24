export interface BankReconciliation {
    reconciliationVoucherSno: number;
    reconciliationVoucherId: string;
    reconciliationVoucherNarration: string;
    reconciliationVoucherBankAcNo: string;
    reconciliationVoucherClosingBalance: number;
    reconciliationVoucherBankBalance: number;
    reconciliationVoucherUnClearedTotal: number;
    reconciliationVoucherBankStDate: Date;
    reconciliationVoucherComplete: boolean;
    reconciliationVoucherFsno: number;
    reconciliationVoucherUserId: number;
    reconciliationVoucherLocationId: number;
    reconciliationVoucherDelStatus: boolean;
    reconciliationVoucherDetails: ReconciliationVoucherDetails
}
export interface ReconciliationVoucherDetails {
    reconciliationVoucherDetailsId: string;
    reconciliationVoucherDetailsSno: number;
    reconciliationVoucherDetailsVno: string;
    reconciliationVoucherDetailsTransSno: number;
    reconciliationVoucherDetailsDebit: number;
    reconciliationVoucherDetailsCredit: number;
    reconciliationVoucherDetailsMatched: string;
    reconciliationVoucherDetailsChequeNo: string;
    reconciliationVoucherDetailsDescription: string;
    reconciliationVoucherDetailsLocationId: number;
    reconciliationVoucherDetailsTransDate: Date;
    reconciliationVoucherDetailsDelStatus: boolean
}