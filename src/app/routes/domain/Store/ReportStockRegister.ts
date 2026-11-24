export interface ReportStockRegister {



   separtmentMasterDepartmentName?: string;
   locationMasterLocationName?: string;
   jobMasterJobName?: string;
   itemMasterItemName?: string;
   itemMasterPartNo?: string;
   unitMasterUnitShortName?: string;
      stockRegisterId?: number;
   stockRegisterTransType?: string;
   stockRegisterVoucherNo?: string;
      stockRegisterVoucherDate?: Date;
   stockRegisterRemarks?: string;
     stockRegisterSno?: number;
   stockRegisterBatchCode?: string;
     stockRegisterExpDate?: Date;
     stockRegisterMatId?: number;
     stockRegisterQuantity?: number;
     stockRegisterUnitId?: number;
     stockRegisterSin?: number;
     stockRegisterSout?: number;
     stockRegisterRate?: number;
     stockRegisterAmount?: number;
     stockRegisterFcAmount?: number;
   stockRegisterStatus?: string;
     stockRegisterDepId?: number;
     stockRegisterFcRate?: number;
     stockRegisterLocationId?: number;
     stockRegisterJobId?: number;
     stockRegisterFsno?: number;
    stockRegisterNetStkBal?: number;
    stockRegisterLandingCost?: number;
     stockRegisterDelStatus?: boolean;

 
  }