import { StockLedgerReportDetails } from './StockLedgerReportDetails';

export interface StockLedgerReport{
    stockLedgerReportSLRId?: number;
    stockLedgerReportSno?: number;
    stockLedgerReportItemGroup?:String;
    stockLedgerReportItem?:String;
    stockLedgerReportDateFrom?:Date;
    stockLedgerReportTo?:Date;
    stockLedgerReportDetialsId?:String;
    stockLedgerReportSummaryId?:String;
    stockLedgerReportSupplierCode?:number;
    stockLedgerReportLoction?:String;
    stockLedgerReportJob?:String;
    stockLedgerReportBarCode?:number;
    stockLedgerReportHigherUnitId?:number;
    stockLedgerReportNoGrop?:String;
    stockLedgerReportItemGroupId?:number;
    stockLedgerReportJobId?:number;
    stockLedgerReportLoctionId?:number;
    StockLedgerReportDetails?:StockLedgerReportDetails[];
    stockLedgerReportDelStatus?: boolean;
}