import { AccountsTransactions } from '../Accounts/AccountsTransactions';
import { RfqEntryDetails } from './RFQDetails';
// import {  StockRegister } from './StockRegister';

export interface RFQ {
  RFQEntryID :number
  RfqEntryRfqId:string
   RfqEntryRfqDate :Date
  RfqEntryRfqEnqId:number
  RfqEntrySupplierId :number
  RfqEntrySupplierAddress :string
   RfqEntryStatus :boolean
  RfqEntrySalesManId :number
  RfqEntryDeliveryStatus :boolean
 RfqEntryDelStatus:boolean

   RFQ_EntryvouchaseNo:string
   Remarks:string
  RfqEntryDetails: RfqEntryDetails[];
  // stockRegister?:  StockRegister[];
}
