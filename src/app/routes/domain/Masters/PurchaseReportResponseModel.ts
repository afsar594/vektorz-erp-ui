export interface PurchaseReportResponseModel{
	// locationId:number;
	// currencyId:number;
	// supplierId: number;
	// purchaseID:number;
	// purchaseType: string;
	// purchaseDate:number;
	// supplierName:string;
	// supplierInvoice: string;
	// supplierRefNo:number;
	// gross:number;
	// discount: number;
	// vatAmount: number;
	// netAmount:number;
	// locationName:number;

    purchase_Voucher_Details_Rate?:number,
	purchase_Voucher_PO_No?:number,
	purchase_Voucher_Details_Quantity?:number,
	purchase_Voucher_Details_NetAmount?:number,
	purchase_Voucher_Dis_Amount?:number,
	purchase_Voucher_VAT_Amount?:number,
	purchase_Voucher_Pur_ID?:number,
	purchase_Voucher_Purchase_Date?:Date,
	purchase_Voucher_Cash_Supplier_Name?:string,
	item_Master_Item_Name?:string,
	unit_Master_Unit_Full_Name?:string,
	purchase_Voucher_Purchase_Type?:string,
	purchase_Voucher_Supply_Invoice_No?:string,
	purchase_Voucher_Location_Name?:string
}