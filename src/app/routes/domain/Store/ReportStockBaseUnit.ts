export interface ReportStockBaseUnit {
    stockRegisterMaterialId: any;

  

    itemGroupNo?: number;
    itemGroupName?: string;
 
    stockRegisterMatId?: number;
  
 
    itemMasterPartNo?: string;
    itemMasterItemName?: string;

    stockRegisterLocationId?: number;
    locationMasterLocationName?: string;
 
    stockRegisterUnitId?: number;
    unitMasterUnitShortName?: string;
 
    stock?: number;


    stockRegisterRate?: number;
    stockRegisterAmount?: number;
   }