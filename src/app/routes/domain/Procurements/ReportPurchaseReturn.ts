 

export interface ReportPurchaseReturn {




    purchaseReturnId?:number;
    purchaseReturnNo?:string;
   purchaseReturnDate?:Date;
    purchaseReturnType?:string;
   purchaseReturnPartyId?:number;
    purchaseReturnPartyName?:string;
    purchaseReturnPartyAddress?:string;
    purchaseReturnPartyVatNo?:string;
    purchaseReturnRefNo?:string;
    purchaseReturnSupInvNo?:string;
    purchaseReturnGrno?:string;
   purchaseReturnGrdate?:Date;
    purchaseReturnLpono?:string;
   purchaseReturnLpodate?:Date;
    purchaseReturnQtnNo?:string;
   purchaseReturnQtnDate?:Date;
    purchaseReturnDescription?:string;
   purchaseReturnExcludeVat?:boolean;
    purchaseReturnPono?:string;
    purchaseReturnBatchCode?:string;
    purchaseReturnDayBookNo?:string;
   purchaseReturnLocationId?:number;
   purchaseReturnUserId?:number;
   purchaseReturnCurrencyId?:number;
   purchaseReturnCompanyId?:number;
   purchaseReturnJobId?:number;
   purchaseReturnFsno?:number;
   purchaseReturnFcRate?:number;
    purchaseReturnStatus?:string;
   purchaseReturnTotalGrossAmount?:number;
   purchaseReturnTotalItemDisAmount?:number;
   purchaseReturnTotalActualAmount?:number;
   purchaseReturnTotalDisPer?:number;
   purchaseReturnTotalDisAmount?:number;
   purchaseReturnVatAmt?:number;
   purchaseReturnVatPer?:number;
    purchaseReturnVatRoundSign?:string;
   purchaseReturnVatRountAmt?:number;
   purchaseReturnNetDisAmount?:number;
   purchaseReturnNetAmount?:number;
   purchaseReturnTransportCost?:number;
   purchaseReturnHandlingcharges?:number;
    purchaseReturnIssueId?:number;
   purchaseReturnJobDirectPur?:boolean;
  purchaseReturnDelStatus?:boolean;
    suppliersMasterSupplierName?:string;
    suppliersMasterSupplierContactPerson?:string;
   suppliersMasterSupplierCountryId?:number;
   suppliersMasterSupplierCityId?:number;
    suppliersMasterSupplierMobile?:string;
    suppliersMasterSupplierRemarks?:string;
    suppliersMasterSupplierVatNo?:string;
    countryMasterCountryName?:string;
   cityMasterCityId?:number;
    unitMasterUnitShortName?:string;
    itemMasterPartNo?:string;
    itemMasterItemName?:string;
   expr1?:string;
    purchaseReturnDetailsNo?:string;
   purchaseReturnDetailsSno?:number;
   purchaseReturnDetailsMatId?:number;
    purchaseReturnDetailsItemName?:string;
   purchaseReturnDetailsUnitId?:number;
    purchaseReturnDetailsUnitName?:string;
    purchaseReturnDetailsBatchCode?:string;
   purchaseReturnDetailsDelStatus?:string;
   purchaseReturnDetailsSalesPrice?:number;
   purchaseReturnDetailsQtndId?:number;
   purchaseReturnDetailsQtnId?:number;
   purchaseReturnDetailsPodId?:number;
   purchaseReturnDetailsPoId?:number;
   purchaseReturnDetailsPrdId?:number;
   purchaseReturnDetailsPrId?:number;
   purchaseReturnDetailsRfqdId?:number;
   purchaseReturnDetailsRfqId?:number;

   purchaseReturnDetailsPurId?: number;
   purchaseReturnDetailsPurdId?: number;


   purchaseReturnDetailsIsEdit?:boolean;
    purchaseReturnDetailsRemarks?:string;
   purchaseReturnDetailsNetAmt?:number;
   purchaseReturnDetailsVatAmt?:number;
   purchaseReturnDetailsVatPer?:number;
   purchaseReturnDetailsActualAmount?:number;
   purchaseReturnDetailsDiscAmount?:number;
   purchaseReturnDetailsGrossAmount?:number;
   purchaseReturnDetailsRate?:number;
   purchaseReturnDetailsQuantity?:number;
   purchaseReturnDetailsExpDate?:Date;
   purchaseReturnDetailsManfDate?:Date;
    suppliersMasterSupplierTel1?:string;
    suppliersMasterSupplierFax?:string;
  
    jobMasterJobName?:string;
    locationMasterLocationName?:string;
    currencyMasterCurrencyName?:string;
    purchaseReturnDetailsId?:number;
  }