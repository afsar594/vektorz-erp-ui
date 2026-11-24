export interface StockMovementReportDetails{
    stockMovementReportDetailsId?:number;
    stockMovementReportDetailsSno?:number;
    stockMovementReportDetailsOpenQty?:number;
    stockMovementReportDetailsOpenAmt?:number;
    stockMovementReportDetailsOpenSr?:number;
    stockMovementReportDetailsVchType?:String;
    stockMovementReportDetailsVchNo?:number;
    stockMovementReportDetailsVchDate?:Date;
    stockMovementReportDetailsUnit?:number;
    stockMovementReportDetailsRate?:number;
    stockMovementReportDetailsQty?:number;
    stockMovementReportDetailsAmt?:number;
    stockMovementReportDetailsStockInQty?:number;
    stockMovementReportDetailsStockInAmt?:number;
    stockMovementReportDetailsCloseQty?:number;
    stockMovementReportDetailsCloseAmt?:number;
    stockMovementReportDetailsAmount?:number;
    stockMovementReportDetailsItemGroup?:number;
    stockMovementReportDetailsJob?:String;
    stockMovementReportDetailsLoction?:String;
    stockMovementReportDetailsStockOutQty?:number;
    stockMovementReportDetailsStockOutAmt?:number;
    stockMovementReportDetailsDelStatus?: boolean;
}