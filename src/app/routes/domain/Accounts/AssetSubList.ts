export interface AssetSubListHeader {
    voucherNo: string;
    voucherDate: Date
    refNo: string;
    description: string;
    grandTotal: number;
    assetSubMasterDetails: AssetSubMasterDetails[];
}

export interface AssetSubMasterDetails {
    groupID: number;
    subAssetID: number;
    slNo: number;
    assetDescription: string;
    assetCode: string;
    purchDate: Date;
    purchPrice: number;
    depPerc: number;
    depDate: Date;
    days: number;
    perDay: number;
    accDep: number;
    bookVaue: number;
    voucherNo: string;
    isEdit: true,
    remarks: string;
}
