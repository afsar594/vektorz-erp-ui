import { StockTransferDetails } from './StockTransferDetails';

export interface StockTransfer {
    stockTransferDepId: any;
    stockTransferCustomerId: any;
    stockTransferNo: number;
    stockTransferId: number;
    stockTransferVoucherNo: string;
    stockTransferStDate: string;
    stockTransferLocationIdFrom: number;
    stockTransferLocationIdTo: number;
    stockTransferFSNo: number;
    stockTransferStatus: string;
    stockTransferUserId: number;
    stockTransferNarration: string;
    stockTransferJobId: number;
    stockTransferApproved: boolean;
    stockTransferApprovedBy: string;
    stockTransferApprovedDate: string;
    stockTransferDelStatus: boolean;
    stockTransferCustomer?:string;
    stockTransferDetails?: StockTransferDetails[]
    }