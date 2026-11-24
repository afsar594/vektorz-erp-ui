
export interface menufacturingEntry {
    mI_Id_N: number;
    mI_VocherNo: string;
    mI_RF_V: string;
    mI_Item_ID: number;
    mI_Remarks_V: string;
    manufactureItemsMasterStatus: boolean;
    manufactureItemsMasterDeleted: boolean;
    manufactureItemsMasterDetails: ManufactureItemDetail[];
}

export interface ManufactureItemDetail {
    mI_Details_VocherNo: string;
    miD_Id_N: number;
    mI_Id_N: number;
    miD_ItemId_N: number;
    miD_Description_V: string;
    miD_UnitId_N: number;
    miD_QTY_N: number;
    miD_Price_N: number;
    miD_DelQty_N: number;
    miD_Amt_N: number;
    miD_Remarks_V: string;
}
