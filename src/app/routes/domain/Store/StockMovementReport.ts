import { StockMovementReportDetails } from "./StockMovementReportDetails";

export interface StockMovementReport{
    stockMovementReportSMRId?: number;
    stockMovementReportSno?: number;
    stockMovementReportItemGroup?:String;
    stockMovementReportItem?:String;
    stockMovementReportDateFrom?:Date;
    stockMovementReportTo?:Date;
    stockMovementReportDetialsId?:String;
    stockMovementReportSummaryId?:String;
    stockMovementReportLoction?:String;
    stockMovementReportJob?:String;
    stockMovementReportBarCode?:number;
    stockMovementReportHigherUnitId?:number;
    stockMovementReportNoGrop?:String;
    stockMovementReportItemGroupId?:number;
    stockMovementReportJobId?:number;
    stockMovementReportLoctionId?:number;
    stockMovementReportSr?:number;
    stockMovementReportItemId?:number;
    stockMovementReportItemName?:String;
    stockMovementReportUnit?:number;
    stockMovementReportOpenQty?:number;
    stockMovementReportOpenAmt?:number;
    stockMovementReportBalanceQty?:number;
    stockMovementReportBalanceAmt?:number;
    StockMovementReportDetails?:StockMovementReportDetails[];
    stockMovementReportDelStatus?: boolean;
    
}