import { demageMasterDetails } from "./DamageMasterDetails";

export interface DamageMaster{
    damageMasterId: number,
    damageMasterVdate: Date,
    damageMasterNarration: string,
    damageMasterLocationId: number,
    damageMasterDelStatus: boolean,
    damageMasterVoucherNumber: string,

    damageDetails : demageMasterDetails [];

}