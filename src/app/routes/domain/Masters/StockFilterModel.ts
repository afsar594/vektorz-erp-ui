export class StockFilterModel {
  isDateChecked: boolean = false;
  fromDate: any;
  toDate: any;
  itemId?: number;
  itemGroupId?: number;
  itemName?: string;
  partNo: string = '';
  jobId?: number;
  locationId?: number;
  salemanId?: number;
  orderByGroup: boolean = false;
  excludeZeroOpeningBalance: boolean = false;
  excludeZeroBalance: boolean = false;
  printReceivedQtyReport: boolean = false;
}
