import { StockAdjustment } from "./StockAdjustment";
import { StockAdjustmentDetails } from "./StockAdjustmentDetails";








export interface StockAdjustmentCompositeView
{
    stockAdjustment?: StockAdjustment;
    StockAdjustmentDetails?: StockAdjustmentDetails[];
}