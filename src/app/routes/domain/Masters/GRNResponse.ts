export interface GRNReponse {
    purchase_Order_PO_NO?: string,
    purchase_Order_PO_Date?: Date,
    strpurchase_Order_PO_Date?: string,
    suppliers_INS_Name?: string,
    purchase_Order_Details_Quantity?: number,
    purchase_Order_Details_Material_Description?: string,
    purchase_Order_Details_Rate?: number,
    purchase_Order_Details_POD_ID?: number,
    purchase_Order_Details_Material_ID?: number,
    issueQty?: number,
    balanceQty?: number
}