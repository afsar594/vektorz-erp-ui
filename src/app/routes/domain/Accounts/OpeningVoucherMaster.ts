import { AccountsTransactions } from './AccountsTransactions';
import { OpeningVoucherDetails } from './OpeningVoucherDetails';

export interface OpeningVoucherMaster{
openingVoucherNo: string;
openingVoucherMasterId?:number;
openingVoucherMasterAccNo?:string;
openingVoucherMasterOpBDate?:Date;
openingVoucherMasterTotalDebit?:number;
openingVoucherMasterTotalCredit?:number;
openingVoucherMasterRemarks?:string;
openingVoucherMasterCurrencyId?:number;
openingVoucherMasterUserId?:number;
openingVoucherMasterLastUpdateTime?:Date;
openingVoucherMasterFsno?:number;
accountsTransactions?: AccountsTransactions[];
openingVoucherDetails?: OpeningVoucherDetails[];
openingVoucherMasterDelStatus?:Boolean;
}

