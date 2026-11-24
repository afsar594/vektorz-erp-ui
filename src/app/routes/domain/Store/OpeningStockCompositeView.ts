import { OpeningStock } from "./OpeningStock";
import { OpeningStockDetails } from "./OpeningStockDetails";





export interface OpeningStockCompositeView
{
    openingStockViewModel?: OpeningStock;
    openingStockDetails?: OpeningStockDetails[];
}