import { StockTransfer } from './StockTransfer';
import { StockTransferDetails } from './StockTransferDetails';



export interface StockTransferCompositeView
{
    stockTransfer?: StockTransfer;
    StockTransferDetails?: StockTransferDetails[];
}
