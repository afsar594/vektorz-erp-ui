export interface ItemsManufactureEntry {
  ME_Id_N: number;
  ME_RF_V: string;
  ME_Date_D: Date | string | null;
  ME_Item_ID: number;
  ME_UNIT_ID: number;
  ME_QTY_N: number | null;
  ME_UNITCOST_N: number | null;
  ME_Remarks_V: string;
  ME_Total_N: number | null;
  ItemsManufactureEntryDtls: ItemsManufactureEntryDtls[];
}

export interface ItemsManufactureEntryDtls {
  MED_Id_N: number;
  ME_Id_N: number | null;
  MED_ItemId_N: number | null;
  MED_Description_V: string;
  MED_UnitId_N: number | null;
  MED_QTY_N: number | null;
  MED_Price_N: number | null;
  MED_Amt_N: number | null;
  MED_Remarks_V: string;
  ManItemID: number | null;
  SNO: number | null;
}
