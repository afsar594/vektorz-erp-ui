import { StockLedgerReport } from './StockLedgerReport';
import { StockLedgerReportDetails } from './StockLedgerReportDetails';





export interface StockLedgerReportCompositeView
{
    stockLedgerReport?: StockLedgerReport;
    StockLedgerReportDetails?: StockLedgerReportDetails[];
}
