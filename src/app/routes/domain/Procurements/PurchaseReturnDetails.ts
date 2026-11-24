export interface  PurchaseReturnDetails { 
     
    purchaseReturnDetailsId?: number;
          purchaseReturnId?: number;
          purchaseReturnDetailsNo?: string;
          purchaseReturnDetailsSno?: number;
          purchaseReturnDetailsMatId?: number;
          purchaseReturnDetailsItemName?: string;
          purchaseReturnDetailsUnitId?: number;
          purchaseReturnDetailsUnitName?: string;
          purchaseReturnDetailsBatchCode?: string;
          purchaseReturnDetailsManfDate?: Date;
          purchaseReturnDetailsExpDate?: Date;
          purchaseReturnDetailsQuantity?: number;
          purchaseReturnDetailsRate?: number;
          purchaseReturnDetailsGrossAmount?: number;
          purchaseReturnDetailsDiscAmount?: number;
          purchaseReturnDetailsActualAmount?: number;
          purchaseReturnDetailsVatPer?: number;
          purchaseReturnDetailsVatAmt?: number;
          purchaseReturnDetailsNetAmt?: number;
          purchaseReturnDetailsRemarks?: string;
          purchaseReturnDetailsIsEdit?: boolean;
          purchaseReturnDetailsRfqId?: number;
          purchaseReturnDetailsRfqdId?: number;
          purchaseReturnDetailsPrId?: number;
          purchaseReturnDetailsPrdId?: number;
          purchaseReturnDetailsPoId?: number;
          purchaseReturnDetailsPodId?: number;
          purchaseReturnDetailsQtnId?: number;
          purchaseReturnDetailsQtndId?: number;
          
          purchaseReturnDetailsPurId?: number;
          purchaseReturnDetailsPurdId?: number;

           
          purchaseReturnDetailsSalesPrice?: number;
          purchaseReturnDetailsDelStatus?: boolean;

          purchaseReturnNetStock?:number;
          purchaseOrderPurchaseQTY?:number;
          purchaseReturnQtyTill?:number;
}