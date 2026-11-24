export interface PurchaseJournalDetails { 
    purchaseJournalDetailsId?: number;
     purchaseJournalId?: number;
    purchaseJournalDetailsVno?: string;
    purchaseJournalDetailsAccNo?: string;
    purchaseJournalDetailsVatableAmount?: number;
    purchaseJournalDetailsDrAmount?: number;
    purchaseJournalDetailsFcDrAmount?: number;
    purchaseJournalDetailsCrAmount?: number;
    purchaseJournalDetailsFcCrAmount?: number;
    purchaseJournalDetailsJobNo?: number;
    purchaseJournalDetailsCostCenterId?: number;
    purchaseJournalDetailsNarration?: string;
    purchaseJournalDetailsVatNo?: string;
        purchaseJournalDetailsReferNo?: string;
        purchaseJournalDetailsDelStatus?: boolean;
}