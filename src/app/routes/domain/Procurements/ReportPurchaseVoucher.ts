 

export interface ReportPurchaseVoucher {




  purchaseVoucherPurId?:number;
  purchaseVoucherVoucherNo?:string;
  purchaseVoucherPurchaseDate?:Date;
  purchaseVoucherPurchaseType?:string;
  purchaseVoucherPartyId?:number;
  purchaseVoucherPartyName?:string;
  purchaseVoucherPartyAddress?:string;
  purchaseVoucherPartyVatNo?:string;
  purchaseVoucherRefNo?:string;
  purchaseVoucherSupplyInvoiceNo?:string;
  purchaseVoucherGrNo?:string;
  purchaseVoucherGrDate?:Date;
  purchaseVoucherLpoNo?:string;
  purchaseVoucherLpoDate?:Date;
  purchaseVoucherQtnNo?:string;
  purchaseVoucherQtnDate?:Date;
  purchaseVoucherDescription?:string;
  purchaseVoucherExcludeVat?:boolean;
  purchaseVoucherPono?:string;
  purchaseVoucherBatchCode?:string;
  purchaseVoucherDayBookNo?:string;
  purchaseVoucherLocationId?:number;
  purchaseVoucherUserId?:number;
  purchaseVoucherCurrencyId?:number;
  purchaseVoucherCompanyId?:number;
  purchaseVoucherJobId?:number;
  purchaseVoucherFsno?:number;
  purchaseVoucherFcRate?:number;
  purchaseVoucherStatus?:string;
  purchaseVoucherTotalGrossAmt?:number;
  purchaseVoucherTotalItemDisAmount?:number;
  purchaseVoucherActualAmount?:number;
  purchaseVoucherDiscountPercentage?:number;
  purchaseVoucherTotalDiscountAmt?:number;
  purchaseVoucherVatAmt?:number;
  purchaseVoucherVatPer?:number;
  purchaseVoucherVatRoundSign?:string;
  purchaseVoucherVatRountAmt?:number;
  purchaseVoucherNetDisAmount?:number;
  purchaseVoucherNetAmount?:number;
  purchaseVoucherTransportCost?:number;
  purchaseVoucherHandlingcharges?:number;
  purchaseVoucherIssuedId?:number;
  purchaseVoucherJobDirectPurchase?:boolean;
  purchaseVoucherDelStatus?:boolean;  
  purchaseVoucherDetailsSummery:boolean,
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


  
  itemGroupId?:number;
  itemGroupName?:string;
  itemBrandId?:number;
  itemBrandName?:string;

  itemMasterPartNo?:string;
  itemMasterItemName?:string;
  expr1?:string;
  purchaseVoucherDetailsNo?:string;
  purchaseVoucherDetailsSno?:number;
  purchaseVoucherDetailsMaterialId?:number;
  purchaseVoucherDetailsItemName?:string;
  purchaseVoucherDetailsUnitId?:number;
  purchaseVoucherDetailsUnitName?:string;
  purchaseVoucherDetailsBatchCode?:string;
  purchaseVoucherDetailsDelStatus?:string;
  purchaseVoucherDetailsSalesPrice1?:number;
  purchaseVoucherDetailsQtndId?:number;
  purchaseVoucherDetailsQtnId?:number;
  purchaseVoucherDetailsPodId?:number;
  purchaseVoucherDetailsPoId?:number;
  purchaseVoucherDetailsPrdId?:number;
  purchaseVoucherDetailsPrId?:number;
  purchaseVoucherDetailsRfqdId?:number;
  purchaseVoucherDetailsRfqId?:number;
  purchaseVoucherDetailsIsEdit?:boolean;
  purchaseVoucherDetailsRemarks?:string;
  purchaseVoucherDetailsNetAmount?:number;
  purchaseVoucherDetailsVatAmt?:number;
  purchaseVoucherDetailsVatPer?:number;
  purchaseVoucherDetailsActualAmount?:number;
  purchaseVoucherDetailsDiscAmount?:number;
  purchaseVoucherDetailsGrossAmount?:number;
  purchaseVoucherDetailsRate?:number;
  purchaseVoucherDetailsQuantity?:number;
  purchaseVoucherDetailsExpDate?:Date;
  purchaseVoucherDetailsManfDate?:Date;
  suppliersMasterSupplierTel1?:string;
  suppliersMasterSupplierFax?:string;
  jobMasterJobName?:string;
  locationMasterLocationName?:string;
  currencyMasterCurrencyName?:string;
  purchaseVoucherDetailsId?:number;
}