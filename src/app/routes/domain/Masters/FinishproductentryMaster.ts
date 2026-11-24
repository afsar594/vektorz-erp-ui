import { demageMasterDetails } from "./DamageMasterDetails";
import { FinishproductentryDetail } from "./FinishproductentryDetail";

export interface FinishproductentryMaster{
    MasterId: number,
    Date: Date,
    Narration: string,
    Location: number,
    DelStatus: boolean,
    VoucherNo: string,

    FinishproductentryDetail : FinishproductentryDetail [];

}