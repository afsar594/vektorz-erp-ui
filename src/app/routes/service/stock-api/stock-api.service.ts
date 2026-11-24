import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ItemMaster } from '../../domain';
import { ApiResponse } from '../../domain/ApiResponse';
import { DamageEntryResponseModel } from '../../domain/Masters/DamageEntryResponse';
import { StockReportBaseUnitResponse } from '../../domain/Masters/StockReportBaseUnitResponse';
import { StockTransferResponse } from '../../domain/Masters/StockTransferResponse';
import { StockTransfer } from '../../domain/Store/StockTransfer';
import { ItemsManufactureEntry } from '../../domain/Store/ItemsManufactureEntry';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StockApiService {
  baseUrl: string = environment.apiRootURL;
  POForGRNList: any[] = [];
  constructor(private http: HttpClient) {}

  getStockLedgerReport() {
    return this.http.post(this.baseUrl + 'Stock/getStockLedgerReport', '');
  }

  getFilteredStockLedgerRpt(payload: any) {
    return this.http.post(
      this.baseUrl + 'Stock/getFilteredStockLedgerRpt',
      payload
    );
  }

  InsertStockTransfer(payload: any) {
    return this.http.post<ApiResponse<StockTransfer>>(
      this.baseUrl + 'StockTransfer/InsertStockTransfer',
      payload
    );
  }

  UpdateStockTransfer(payload: any) {
    return this.http.post<ApiResponse<StockTransfer>>(
      this.baseUrl + 'StockTransfer/UpdateStockTransfer',
      payload
    );
  }

  InsertStockTransferReport(payload: any) {
    return this.http.post(
      this.baseUrl + 'StockTransfer/submitTransferReport',
      payload
    );
  }

  public GetStockTransferDetails(id: string) {
    return this.http.get<ApiResponse<StockTransfer>>(
      this.baseUrl + 'StockTransfer/GetSavedStockTransferDetails' + '/' + id
    );
  }

  getStockMovementDetailsRpt(payload: any) {
    return this.http.post(
      this.baseUrl + 'Stock/getStockMovementDetailsRpt',
      payload
    );
  }

  getDetailsByItem(payload: any) {
    return this.http.post(this.baseUrl + 'Stock/getItemDetailsById', payload);
  }

  getStockVchDetails(payload: any) {
    console.log(payload);
    return this.http.post(this.baseUrl + 'Stock/getStockVchDetails', payload);
  }

  getAllItemsList() {
    return this.http.get<ApiResponse<ItemMaster>>(
      this.baseUrl + 'Stock/getAllItems'
    );
  }

  getAllJobs() {
    return this.http.get(this.baseUrl + 'GetAllJob');
  }
  getItemsByJobId(jobId: number) {
    return this.http.get(this.baseUrl + 'GetItemsByJobId?jobId=' + jobId);
  }

  loadDropdownCustomerQuotation(customerId?: number) {
    const queryParam = customerId ? '?customerId=' + customerId : '';
    return this.http.get(this.baseUrl + 'LoadDropdownCustomerQuotation' + queryParam);
  }

  getCostEstDescByItemId(qtnItemId: number, qtnId?: number) {
    let url = this.baseUrl + 'GetCostEstDescByItemId?qtnItemId=' + qtnItemId;
    if (qtnId !== undefined && qtnId !== null) {
      url += '&qtnId=' + qtnId;
    }
    return this.http.get(url);
  }

  getAllDepartments() {
    return this.http.get(this.baseUrl + 'GetAllDepartment');
  }

  customerEnquiryReport(payload: any) {
    return this.http.post(
      this.baseUrl + 'CustomerEnqirySearch/getCustomerEnquirySearch',
      payload
    );
  }

  getEnquiryStatusReportSearch(payload: any) {
  return this.http.post(
    this.baseUrl + 'CustomerEnqirySearch/GetEnquiryStatusReportSearch',
    payload
  );
}

  getAllEnqueryNo() {
    return this.http.get(this.baseUrl + 'CustomerEnqirySearch/getEnquiryNo');
  }

  getVoucherNumber() {
    return this.http.get(this.baseUrl + 'Stock/getVoucherNumber');
  }

  GenerateVoucherNo() {
    return this.http.get(this.baseUrl + 'JobInvoice/getVoucherNumber');
  }

  submitDamageEntry(payload: any) {
    return this.http.post<ApiResponse<DamageEntryResponseModel>>(
      this.baseUrl + 'DamageEntry/InsertDamageEntry',
      payload
    );
  }

  deleteDamageEntry(id: string) {
    const url: string = `${this.baseUrl}DamageEntry/DeleteDamageEntry?Id=${id}`;
    return this.http.delete(url);
  }

  getDamageEntry() {
    return this.http.get<ApiResponse<DamageEntryResponseModel>>(
      this.baseUrl + 'DamageEntry/GetDamageEntry'
    );
  }
  GetDamageById(id: number) {
    const url = `${this.baseUrl}DamageEntry/GetDamageById?id=${id}`;
    return this.http.get<ApiResponse<DamageEntryResponseModel>>(url);
  }

  UpdateDamageEntry(payload) {
    return this.http.post(
      this.baseUrl + 'DamageEntry/UpdateDamageEntry',
      payload
    );
  }

  getStockItemsList() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'StockTransfer/getStockItemsList'
    );
  }
  getStockTransferDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl + 'StockTransfer/TransferLoadDropdown'
    );
  }

  getStockTransferReport(data: any): Observable<any> {
    return this.http.post<any[]>(
      this.baseUrl + 'StockTransfer/getStockTransferReport',
      data
    );
  }
  getStockTransferList() {
    return this.http.get<ApiResponse<StockTransfer>>(
      this.baseUrl + 'StockTransfer/GetAllStockTransfer'
    );
  }

  getStockitembyId(id: any) {
    return this.http.get(
      this.baseUrl + `StockTransfer/getStockitembyIds?Id=${id}`
    );
  }
  public deleteStockTransferEntry(id: any): any {
    return this.http.delete<ApiResponse<number>>(
      `${this.baseUrl}StockTransfer/DeleteStockTransfers?Id=${id}`
    );
  }
  changePassword(payload: any) {
    return this.http.post(
      this.baseUrl + 'ChangPassword/ChangePasswordResponse',
      payload
    );
  }

  getSalesAccountListing() {
    //<ApiResponse<MasterAccountsTable>>
    return this.http.get(this.baseUrl + 'JobInvoice/GetSalesAccount');
  }

  DamageEntryPrefix() {
    //<ApiResponse<MasterAccountsTable>>
    return this.http.get(this.baseUrl + 'DamageEntry/DamageEntryPrefix');
  }

  saveGRNVoucher(payload: any) {
    return this.http.post(this.baseUrl + 'GRN/saveGRNVoucher', payload);
  }

  GetAllPOForGRN(id) {
    return this.http.get<Array<any>>(
      this.baseUrl + `PurchaseOrder/GetAllPOForGRN/${id}`
    );
  }

  GetGRMPOs(id) {
    return this.http.get<Array<any>>(
      this.baseUrl + `PurchaseOrder/GetGRMPOs/${id}`
    );
  }
  getStockReportBaseUnit() {
    return this.http.get<Array<StockReportBaseUnitResponse>>(
      this.baseUrl + 'StockReport/getStockReportBaseUnitList'
    );
  }

  getStockReportBaseUnitWithValue(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'StockReport/getStockReportBaseUnitWithValue',
      data
    );
  }

  getDeliveryNoteReportDetails(payload: any) {
    return this.http.post(
      this.baseUrl + 'DeliveryNoteReport/getDeliveryNoteReportDetails',
      payload
    );
  }

  getSelesOrderStatus(payload: any) {
    return this.http.post(
      this.baseUrl + 'SalesOrder/GetPurchaseOrderStatuses',
      payload
    );
  }
  StockAdjustmentReport(payload: any) {
    return this.http.post(
      this.baseUrl + 'StockAdjustment/StockAdjustmentReport',
      payload
    );
  }

  GetCustomerQuotationStatuses(payload: any) {
    return this.http.post(
      this.baseUrl + 'SalesOrder/GetCustomerQuotationStatuses',
      payload
    );
  }
  GetPurchaseOrderStatuses(payload: any) {
    return this.http.post(this.baseUrl + 'SalesOrder/GetGRSOs', payload);
  }

  GetPurchaseReqJobId(payload: any) {
    return this.http.post(
      this.baseUrl + 'PurchaseRequisition/GetPurchaseReqJobId',
      payload
    );
  }
  // StockAdjustment
  GetAllStockAdjustment() {
    return this.http.get<Array<StockReportBaseUnitResponse>>(
      this.baseUrl + 'StockAdjustment/GetAllStockAdjustment'
    );
  }
  StockAdjustmentDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl + 'StockAdjustment/StockAdjustmentDropdown'
    );
  }
  StockAdjustmentDropdownByLocation(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl + 'StockAdjustment/StockAdjustmentDropdownByLocation'
    );
  }
  InsertStockAdjustment(payload) {
    return this.http.post(
      this.baseUrl + 'StockAdjustment/InsertStockAdjustment',
      payload
    );
  }
  UpdateStockAdjustment(payload) {
    return this.http.post(
      this.baseUrl + 'StockAdjustment/UpdateStockAdjustment',
      payload
    );
  }
  GetSavedStockAdjustmentDetailsById(id) {
    const url = `${this.baseUrl}StockAdjustment/GetSavedStockAdjustmentDetails/${id}`;
    return this.http.get(url);
  }

  GetStockByLocation(id, date) {
    return this.http.get(
      `${this.baseUrl}StockAdjustment/GetStockByLocation?id=${id}&asOnDate=${date}`
    );
  }
  DeleteStockAdjustmentVoucher(payload) {
    return this.http.post(
      this.baseUrl + 'StockAdjustment/DeleteStockAdjustmentVoucher',
      payload
    );
  }
  getStockMovementWithValue(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'StockReport/getStockReportBaseUnitWithValue',
      data
    );
  }
  getStockMovement(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'StockReport/GetStockMovement',
      data
    );
  }
  /// menufacture Entry componet
 GetManufactureItems() {
    return this.http.get<ApiResponse<ItemsManufactureEntry[]>>(
      this.baseUrl + 'ItemsManufactureEntry/GetItemsManufactureEntries'
    );
  }
    GetItemsManufactureEntryById(id: number) {
    const url = `${this.baseUrl}ItemsManufactureEntry/GetItemsManufactureEntryById?id=${id}`;
    return this.http.get<ApiResponse<ItemsManufactureEntry>>(url);
  }
    InsertItemsManufactureEntry(payload) {
    return this.http.post<any>(
      this.baseUrl + 'ItemsManufactureEntry/InsertItemsManufactureEntry',
      payload
    );
  }
   UpdateItemsManufactureEntry(payload) {
    return this.http.post<any>(
      this.baseUrl + 'ItemsManufactureEntry/UpdateItemsManufactureEntry',
      payload
    );
  }
   DeleteItemsManufactureEntry(id) {
    return this.http.delete(
      this.baseUrl + `ItemsManufactureEntry/DeleteItemsManufactureEntry?Id=${id}`
    );}
  /// menufacture list componet
  GetAllmenufacture() {
    return this.http.get<Array<StockReportBaseUnitResponse>>(
      this.baseUrl + 'ManufactureItems/GetManufactureItems'
    );
  }
  Insertmenufacture(payload) {
    return this.http.post(
      this.baseUrl + 'ManufactureItems/InsertManufactureItems',
      payload
    );
  }
  Updatemenufacture(payload) {
    return this.http.post(
      this.baseUrl + 'ManufactureItems/UpdateManufactureItems',
      payload
    );
  }

  GetSavedmenufacture(id) {
    const url = `${this.baseUrl}ManufactureItems/GetManufactureItemsById?id=${id}`;
    return this.http.get(url);
  }

  Deletemenufacture(id) {
    return this.http.delete(
      this.baseUrl + `ManufactureItems/DeleteManufactureItems?Id=${id}`
    );
  }
}
