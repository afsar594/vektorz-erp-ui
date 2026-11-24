import { LocationMaster } from "./Masters/LocationMaster";


export interface PDCList{
    pdc?:string;
    vno?:string,
    partyName?:string,
    vType?:string,
    tDate?:Date,
    stringtDate?:string,
    pDate?:Date,
    stringpDate?:string,
    cno?:string,
    cAmount?:string,
    cbName?:string,
    bAccNo?:string,
    accName?:string,
    pid?:number,
    type:string;
    postingBank:string;
    trans_Type:string;
    locationList?:Array<LocationMaster>
}
export interface PDCPostedList{
    pdc?:string;
    bAccNo?:string,
    cAmount?:number,
    cbName?:string,
    cno?:Date,
    pDate?:Date,
    stringpDate?:string,
    partyName?:string,
    pdcvno?:string,
    pid?:string,
    postDt?:Date,
    stringpostDt?:string,
    tDate?:Date,
    stringtDate?:string,
    vType?:string,
    vno?:string
    trans_Type:string;
    postingBank:string;
}
