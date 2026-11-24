import { ItemImages } from './ItemImages';
import { ItemPriceLevelDetails } from './ItemPriceLevelDetails';
import { UnitDetails } from './UnitDetails';

export interface ItemMaster {
    itemMasterItemId?: number;
    itemMasterMaterialCode?: string;
    itemMasterAccountNo?: number;
    itemMasterItemName?: string;
    itemMasterItemType?: string;
    itemMasterBatchCode?: string;
    itemMasterVenderId?: number;
    itemMasterLocationId?: number;
    itemMasterReOrderLevel?: number;
    itemMasterUnitPrice?: number;
    itemMasterUnitPrice1?: number;
    itemMasterUnitPrice2?: number;
    itemMasterItemSize?: string;
    itemMasterPartNo?: string;
    itemMasterColor?: string;
    itemMasterPacking?: string;
    itemMasterWeight?: string;
    itemMasterShape?: string;
    itemMasterRef1?: string;
    itemMasterRef2?: string;
    itemMasterStockType?: number;
    itemMasterUnitId?: number;
    itemMasterAssetAcc?: string;
    itemMasterExpenseAcc?: string;
    itemMasterImage?: number[];
    itemMasterActive?: boolean;
    itemMasterLastPurchasePrice?: number;
    itemMasterServices?: boolean;
    itemMasterSupplierCode?: string;
    itemMasterBarcode?: string;
    itemMasterAliasName?: string;
    itemMasterUserId?: number;
    itemMasterGroupDebitAcc?: string;
    itemMasterGroupCreditAcc?: string;
    itemMasterLandingCost?: number;
    itemMasterBaseValue?: number;
    itemMasterHeightN?: number;
    itemMasterWeightN?: number;
    itemMasterRackId?: number;
    itemMasterCurrentStock?: number;
    itemMasterStatus?: boolean;
    itemMasterAvgCostYel?: string;
    itemMasterVat?: number;
    itemMasterTypeId?: string;
    itemMasterModelId?: number;
    itemMasterVatPercentage?: number;
    itemMasterVatInclues?: boolean;
    itemMasterReorderCheck?: boolean;
    itemMasterDefaultLocationName?: string;
    itemMasterDefaultLocation?: number;
    itemMasterCountryId?: number;
    itemMasterPackageId?: string;
    itemMasterGenericName?: string;
    itemMasterSupplierId?: number;
    itemMasterManufactureName?: string;
    itemMasterRedeemRewardPoint?: number;
    itemMasterProPurchaseRate?: number;
    itemMasterProSaleRate?: number;
    itemMasterProMrp?: number;
    ItemMasterVat?: number;
    itemMasterVATID?:number;
    itemMasterDelStatus?: boolean;
    itemImages?: ItemImages[];
    itemPriceLevelDetails?: ItemPriceLevelDetails[];
    unitDetails?: UnitDetails[];
    itemSupplierDetails?: ItemSuppliers[];
}

export interface ItemSuppliers{
      supplierName: string;
      itemSupplierDetailsItemSupplierDetailsId?:number;
      itemSupplierDetailsItemId?:number,
      itemSupplierDetailsSupplierId?:number;
      itemSupplierDetailsRate:number,
    //   itemSupplierDetailsBatchId:null,
      itemSupplierDetailsDelStatus?:boolean;

}

