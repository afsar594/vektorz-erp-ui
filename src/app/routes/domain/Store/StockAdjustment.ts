import { StockAdjustmentDetails } from "./StockAdjustmentDetails";



export interface StockAdjustment {
    stockAdjustmentVoucherSAAsOnDate: string;
    stockAdjusmentVoucherTotAmount: number;
    stockAdjusmentVoucherTotQty: number;


    stockAdjustmentVoucherSaId: number;
    stockAdjustmentVoucherSaNo: string;
    stockAdjustmentVoucherSaDate: string;
    stockAdjustmentVoucherSaRemarks: string;
    stockAdjustmentVoucherFsno: number;
    stockAdjustmentVoucherStVno: string;
    stockAdjustmentVoucherLocationId: number;
    stockAdjustmentVoucherDelStatus: boolean;
    stockAdjustmentVoucherDetails?: StockAdjustmentDetails[];



}