export interface PurchaseOrderDetails {
    PurchaseOrderDetailsId?: number;
    PurchaseOrderId?: number;
    PurchaseOrderDetailsNo?: string;
    PurchaseOrderDetailsSno?: number;
    PurchaseOrderDetailsMatId?: number;
    PurchaseOrderDetailsItemName?: string;
    PurchaseOrderDetailsUnitId?: number;
    PurchaseOrderDetailsUnitName?: string;
    PurchaseOrderDetailsBatchCode?: string;
    PurchaseOrderDetailsManfDate?: Date;
    PurchaseOrderDetailsExpDate?: Date;
    PurchaseOrderDetailsQuantity?: number;
    PurchaseOrderDetailsRate?: number;
    PurchaseOrderDetailsGrossAmount?: number;
    PurchaseOrderDetailsDiscAmount?: number;
    PurchaseOrderDetailsActualAmount?: number;
    PurchaseOrderDetailsVatPer?: number;
    PurchaseOrderDetailsVatAmt?: number;
    PurchaseOrderDetailsNetAmt?: number;
    PurchaseOrderDetailsRemarks?: string;
    PurchaseOrderDetailsIsEdit?: boolean;
    PurchaseOrderDetailsRfqId?: number;
    PurchaseOrderDetailsRfqdId?: number;
    PurchaseOrderDetailsPrId?: number;
    PurchaseOrderDetailsPrdId?: number;
    PurchaseOrderDetailsPoId?: number;
    PurchaseOrderDetailsPodId?: number;
    PurchaseOrderDetailsQtnId?: number;
    PurchaseOrderDetailsQtndId?: number;
    PurchaseOrderDetailsSalesPrice?: number;
    PurchaseOrderDetailsDelStatus?: boolean;

    ////public virtual PurchaseOrder PurchaseOrder { get; set; }
    //public virtual PurchaseOrder PurchaseOrderDetailsNoNavigation { get; set; }
}