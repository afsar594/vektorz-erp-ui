import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProcurementUrls } from '../url.api';
import { ApiResponse } from '../../domain/Masters/ApiResponse';
import { PurchaseOrderListResponseModal } from '../../domain/Masters/PurchaseOrderListResponseModal';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcurementService {
 

  baseUrl: string = environment.apiRootURL;
  constructor(private http: HttpClient) { }

  getPOTracking() {
    return this.http.get(this.baseUrl + ProcurementUrls.GetPOTracking);
  }
  ApprovalPermissionDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl + `Approvals/GetapprovalformsDropdown`);
  }

  POApprovalById(id: any) {
    return this.http.get<any[]>(this.baseUrl + `PurchaseOrder/POApprovalById?VoucherId=${id}`);
  }

  SaveApprovalPermission(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}Approvals/InsertPermissionApproval`, payload);
  }

  SaveApproverLevelSettings(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}Approvals/SaveApproverLevelSettings`, payload);
  }

  GetApproverLevelSettings(id: number,jobId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}Approvals/GetApproverLevelSettings/${id}/${jobId}`);
  }

  ApprovalPermissionGetById(id: number,level:number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}Approvals/GetPermissionapById?id=${id}&level=${level}`);
  }
  POApprovalDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl + `PurchaseOrder/POApprovalDropdown`);
  }
  POApprovalList( data) {
    return this.http.post(this.baseUrl + `PurchaseOrder/POApprovalList`, data);
  }
  POApprovalByVno(data) {
    return this.http.post(this.baseUrl + `PurchaseOrder/POApprovalByVno?voucherId=${data}`, null);
  }

  POApprovedList(data) {
    return this.http.post(this.baseUrl + `PurchaseOrder/POApprovedList`, data);
  }

  getPOTrackingNew(data, type) {

    return this.http.post(this.baseUrl + `PurchassOrderTracking/${type}`, data);
  }
  getAllPONumber() {
    return this.http.get(this.baseUrl + ProcurementUrls.GetPoNumber);
  }
  POTrackingBynumber(number) {
    return this.http.post(this.baseUrl + ProcurementUrls.GetPoTrackingByNumber, number);
  }
  POTrackingDropdown(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl + ProcurementUrls.POTrackingDropdown);
  }



  ////   Missing Functions  //////

  GetSavedPurchaseOrderDetails(id: any) {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'PurchaseOrder/GetSavedPurchaseOrderDetails/' + id);
  }
  DeletePurchaseOrder(payload: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'PurchaseOrder/DeletePurchaseOrder', payload);
  }
  InsertPurchaseOrder(payload: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'PurchaseOrder/SavePurchaseOrder', payload);
  }
  UpdatePurchaseOrderItem(payload: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'PurchaseOrder/UpdatePurchaseOrderItem', payload);
  }
  getPurchaseOrderList() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'PurchaseOrder/GetPurchaseOrderList');
  }
  UpdatePurchaseOrder(payload: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'PurchaseOrder/UpdatePurchaseOrder', payload);
  }
  GetPurchaseOrder() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'PurchaseOrder/GetPurchaseOrder');
  }

  deletePOItem(payload: any) {
    return this.http.post(this.baseUrl + 'PurchaseOrder/DeletePurchaseOrderItem', payload);
  }


  /////////    GRN Missing Functions   ////////

  InsertPurchaseVoucher(payload: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'GRN/saveGRNVoucher', payload);
  }

  updateGRN(payload: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'GRN/updateGRN', payload);
  }

  DeleteGRN(payload: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'GRN/DeleteGRN', payload);
  }
  loadPO(supplier: any) {
    return this.http.post(this.baseUrl + 'GRN/loadPO', supplier);
  }
  GetGRNList() {
    return this.http.get(this.baseUrl + 'GRN/getGRNList');
  }


  GetPurchaseReport() {
    return this.http.get(this.baseUrl + 'PurchaseVoucher/GetPurchaseReturnReport ');

  }



  ////////////   Purchase Order list Functions ///////////////

  getAllPurchaseOrderList() {
    return this.http.get<Array<PurchaseOrderListResponseModal>>(this.baseUrl + 'PurchaseOrderList/GetPurchaseOrderList');
  }
  //END

  //Purchase Return
  GetPurchaseVoucherList(data) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Procurement/GetPurchaseVoucherList', data);
  }
  GetSpecificPurchaseVoucher(id: number) {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Procurement/GetSpecificPurchaseVoucher?id=' + id);
  }
  GetSpecificPurchaseReturn(id: string) {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Procurement/GetSpecificPurchaseReturn?id=' + id);
  }
  GetPurchaseReturnList(data: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Procurement/GetPurchaseReturnList', data);
  }
  AddEditPurchaseReturn(data: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Procurement/AddEditPurchaseReturn', data);
  }
  GetLocationMasterDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Procurement/GetLocationMasterDropdown');
  }
  GetJObMasterDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Procurement/GetJObMasterDropdown');
  }
  GetSupplierMasterDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Procurement/GetSupplierMasterDropdown');
  }
  GetVoucherTypeDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Procurement/GetVoucherTypeDropdown');
  }
  DownloadPurchaseReturn(data: any) {
    return this.http.post(this.baseUrl + 'Procurement/DownloadAccountStatement', data, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    });
  }
  //END
}
