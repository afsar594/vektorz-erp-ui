import { StockMovementReport } from './StockMovementReport';
import { StockMovementReportDetails } from './StockMovementReportDetails';





export interface StockMovementReportCompositeView{
    stockMovementReport?: StockMovementReport;
    stockMovementReportDetails?: StockMovementReportDetails[];
}