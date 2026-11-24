export interface boQuantity {
  item: any;
  enquiryId: number;
  commissionPer: number;
  commissionAmount: number;
  netAmount: number;
  boqRefVoucherNO?: number;
  id?: number;
  billofqtyNo?: string;
  date?: Date;
  customerEnqId?: number;
  remarks?: string;
  status?: string;
  boqAmount?: number;
  costantsAmount?: number;
  totalAmount?: number;
  proftPercentage?: number;
  profitAmount?: number;
  quoteAmount?: number;
  contingencyAmount?: number;
  contingencyPer?: number;
  billOfQTyDetails?: BillOfQTyDetails[];
  estimationCostCenter?: detailCostCenter[];
}

export interface BillOfQTyDetails {
  itemName?: any;
  id?: number;
  billQtyId?: number;
  itemCode?: number;
  unitCode?: number;
  rate?: number;
  amount?: number;
  qty?: number;
  length?: number;
  wm?: number;
  totalWeight?: number;
  jobID?: number;
  remarks?: string;
  freight_Charges?: number;
  packing_Charges?: number;
  clearance_Charges?: number;
  duty?: number;
  mofa?: number;
  others?: number;
  currency_TypeId?: number;
  currencyRate?: number;
  finalAmount?: number;
  isEdit?: true;
  enquiryDetailId?: number;
}
export interface detailCostCenter {
  id?: number;
  costCenterId?: number;
  amount?: number;
  remarks?: string;
  billQtyId?: number;
  costcenter?: number;
  isEdit?: true;
}
