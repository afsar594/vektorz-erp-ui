import { AccountsTransactions } from "../Accounts/AccountsTransactions";
import { openingStockVoucherDetails } from "./OpeningStockDetails";

export interface OpeningStock {
  //  openingStockOsId??:number;
  openingStockVoucherId?: number;
  openingStockVoucherNo?: string;
  openingStockVoucherDate?: string;
  openingStockVoucherLocationId?: number;
  openingStockVoucherRemarks?: string;
  openingStockVoucherFSNO?: number;
  openingStockVoucherVNO?: string;
  openingStockVoucherDetailsTotal?:number
  accountsTransactions?: AccountsTransactions[];
  openingStockVoucherDetails?: openingStockVoucherDetails[];
}

