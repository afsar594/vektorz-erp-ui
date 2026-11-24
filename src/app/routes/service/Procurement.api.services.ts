import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ChartofAccounts, ReceiptVoucher } from '../domain';
import { AccountsUrls, ProcurementUrls, SalesUrls } from './url.api';
import { PaymentVoucherCompositeView } from '../domain/Accounts/PaymentVoucherCompositeView';
import { AccountsTransactions } from '../domain/Accounts/AccountsTransactions';
import { ReceiptVoucherCompositeView } from '../domain/Accounts/ReceiptVoucherCompositeView';
import { ApiResponse } from '../domain/ApiResponse';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PurchaseVoucher } from '../domain/Procurements/PurchaseVoucher';
import { PurchaseReturn } from '../domain/Procurements/PurchaseReturn';
import { ReportPurchaseReturn } from '../domain/Procurements/ReportPurchaseReturn';
import { PurchaseOrder } from '../domain/Procurements/PurchaseOrder';
import { UserFile } from '../domain/UserFile';
import { PurchaseRequisition } from '../domain/Procurements/PurchaseRequisition';
import { PurchaseQuotation } from '../domain/Procurements/PurchaseQuotation';
import { StockRequisition } from '../domain/Procurements/StockRequisition';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class ProcurementApiService {
  baseUrl: string = environment.apiRootURL;
  constructor(private httpClient: HttpClient) {}

  public InsertPurchaseVoucher(data1: PurchaseVoucher) {
    return this.httpClient.post<ApiResponse<PurchaseVoucher>>(
      this.baseUrl + ProcurementUrls.InsertPurchaseVoucher,
      data1,
      httpOptions
    );
  }

  public GetCustomerQuotationItemToPr(data: any) {
    const params = [];
    if (data.quotaionNo != null)
      params.push(`quotaionNo=${encodeURIComponent(data.quotaionNo)}`);
    if (data.fromDate != null && data.isdate)
      params.push(`fromDate=${encodeURIComponent(data.fromDate)}`);
    if (data.toDate != null && data.isdate)
      params.push(`toDate=${encodeURIComponent(data.toDate)}`);
    const queryString = params.length ? '?' + params.join('&') : '';
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + `GetCustomerQuotationItemToPr${queryString}`
    );
  }
  public DeletePurchaseVoucher(data1: PurchaseVoucher) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + ProcurementUrls.DeletePurchaseVoucher,
      data1,
      httpOptions
    );
  }
  public UpdatePurchaseVoucher(data1: PurchaseVoucher) {
    return this.httpClient.post<ApiResponse<PurchaseVoucher>>(
      this.baseUrl + ProcurementUrls.UpdatePurchaseVoucher,
      data1,
      httpOptions
    );
  }

  public GetPurchaseVoucher() {
    return this.httpClient.get<ApiResponse<PurchaseVoucher[]>>(
      this.baseUrl + ProcurementUrls.GetPurchaseVoucher
    );
  }
  public GetPurchaseVoucherList(data1: any) {
    return this.httpClient.post<ApiResponse<PurchaseReturn>>(
      this.baseUrl + ProcurementUrls.GetPurchaseVoucherList,
      data1,
      httpOptions
    );
  }

  public GetSavedPurchaseVoucherDetails(id: string) {
    return this.httpClient.get<ApiResponse<PurchaseVoucher>>(
      this.baseUrl + ProcurementUrls.GetSavedPurchaseVoucherDetails + '/' + id
    );
  }

  public LoadPurchaseCharges() {
    return this.httpClient.get<ApiResponse<PurchaseVoucher>>(
      this.baseUrl + 'PurchaseVoucher/LoadPurchaseCharges'
    );
  }

  public GetSavedPurchaseVoucherDetailsByPurchaseVoucher(pvNo: string) {
    const encodedVoucherNo = encodeURIComponent(pvNo);
    return this.httpClient.get<ApiResponse<PurchaseVoucher>>(
      `${this.baseUrl}${ProcurementUrls.GetSavedPurchaseVoucherDetailsByPurchaseVoucher}/${encodedVoucherNo}`
    );
  }

  //   public CheckVnoExistPurchaseVoucher(vno: string) {
  //     return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + ProcurementUrls.CheckVnoExistPurchaseVoucher + '/' + vno).pipe(delay(400));
  // }
  //=================================== Purchase Return========================================================

  public InsertPurchaseReturn(data1: PurchaseReturn) {
    return this.httpClient.post<ApiResponse<PurchaseReturn>>(
      this.baseUrl + ProcurementUrls.InsertPurchaseReturn,
      data1,
      httpOptions
    );
  }

  public DeletePurchaseReturn(data1: PurchaseReturn) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + ProcurementUrls.DeletePurchaseReturn,
      data1,
      httpOptions
    );
  }
  public UpdatePurchaseReturn(data1: PurchaseReturn) {
    return this.httpClient.post<ApiResponse<PurchaseReturn>>(
      this.baseUrl + ProcurementUrls.UpdatePurchaseReturn,
      data1,
      httpOptions
    );
  }

  public GetPurchaseReturn() {
    return this.httpClient.get<ApiResponse<PurchaseReturn[]>>(
      this.baseUrl + ProcurementUrls.GetPurchaseReturn
    );
  }
  public GetPurchaseReturnListModel(data1: PurchaseOrder) {
    return this.httpClient.post<ApiResponse<PurchaseOrder>>(
      this.baseUrl + ProcurementUrls.GetPurchaseReturnListModel,
      data1,
      httpOptions
    );
  }

  public GetSavedPurchaseReturnDetails(id: string) {
    return this.httpClient.get<ApiResponse<PurchaseReturn>>(
      this.baseUrl + ProcurementUrls.GetSavedPurchaseReturnDetails + '/' + id
    );
  }

  // public CheckVnoExistPurchaseReturn(vno: string) {
  //   return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + AccountsUrls.CheckVnoExistPurchaseReturn + '/' + vno).pipe(delay(400));
  // }

  public PurchaseReturn_GetReportPurchaseReturn() {
    return this.httpClient.get<ApiResponse<ReportPurchaseReturn[]>>(
      this.baseUrl + ProcurementUrls.PurchaseReturn_GetReportPurchaseReturn
    );
  }

  ////=========================== Purchase Order

  public InsertPurchaseOrder(data1: PurchaseOrder) {
    return this.httpClient.post<ApiResponse<PurchaseOrder>>(
      this.baseUrl + ProcurementUrls.InsertPurchaseOrder,
      data1,
      httpOptions
    );
  }
  public DeletePurchaseOrder(data1: PurchaseOrder) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + ProcurementUrls.DeletePurchaseOrder,
      data1,
      httpOptions
    );
  }
  public UpdatePurchaseOrder(data1: PurchaseOrder) {
    return this.httpClient.post<ApiResponse<PurchaseOrder>>(
      this.baseUrl + ProcurementUrls.UpdatePurchaseOrder,
      data1,
      httpOptions
    );
  }
  public GetPurchaseOrder() {
    return this.httpClient.get<ApiResponse<PurchaseOrder[]>>(
      this.baseUrl + ProcurementUrls.GetPurchaseOrder
    );
  }
  public GetSavedPurchaseOrderDetails(id: any) {
    return this.httpClient.get<ApiResponse<PurchaseOrder>>(
      this.baseUrl + ProcurementUrls.GetSavedPurchaseOrderDetails + '/' + id
    );
  }
  // public CheckVnoExistPurchaseOrder(vno: string) {
  //   return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + AccountsUrls.CheckVnoExistPurchaseOrder + '/' + vno).pipe(delay(400));
  // }

  // public PurchaseOrder_GetReportPurchaseOrder() {
  //  return this.httpClient.get<ApiResponse<ReportPurchaseOrder[]>>(this.baseUrl + AccountsUrls.PurchaseOrder_GetReportPurchaseOrder);
  // }

  public GetAllUserFile() {
    return this.httpClient.get<UserFile[]>(
      this.baseUrl + ProcurementUrls.GetAllUserFile
    );
  }

  //=========================================== Purchase Requisition
  public InsertPurchaseRequisition(data1: PurchaseRequisition) {
    return this.httpClient.post<ApiResponse<PurchaseRequisition>>(
      this.baseUrl + ProcurementUrls.InsertPurchaseRequisition,
      data1,
      httpOptions
    );
  }

  public DeletePurchaseRequisition(data1: PurchaseRequisition) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + ProcurementUrls.DeletePurchaseRequisition,
      data1,
      httpOptions
    );
  }
  public UpdatePurchaseRequisition(data1: PurchaseRequisition) {
    return this.httpClient.post<ApiResponse<PurchaseRequisition>>(
      this.baseUrl + ProcurementUrls.UpdatePurchaseRequisition,
      data1,
      httpOptions
    );
  }
  public GetBalanceAmount(id) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + `PurchaseRequisition/GetBalanceAmount?jobId=${id}`
    );
  }
  public GetAllPReq(data: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl +
        `PurchaseRequisition/GetAllPReq?fromDate=${data.dateFrom}&toDate=${data.dateTo}&isDate=${data.isdate}`
    );
  }
  GetPurchaseRequisitionByFilterById(id: any[]) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + `PurchaseRequisition/GetPurchaseReqSales?prId=${id}`,
      id
    );
  }

  public GetPurchaseRequisition() {
    return this.httpClient.get<ApiResponse<PurchaseRequisition[]>>(
      this.baseUrl + ProcurementUrls.GetPurchaseRequisition
    );
  }

  public GetSavedPurchaseRequisitionDetails(id: string) {
    return this.httpClient.get<ApiResponse<PurchaseRequisition>>(
      this.baseUrl +
        ProcurementUrls.GetSavedPurchaseRequisitionDetails +
        '/' +
        id
    );
  }

  // public PurchaseRequisition_GetReportPurchaseRequisition() {
  //   return this.httpClient.get<ApiResponse<REPORTPurchaseRequisition[]>>(this.baseUrl + AccountsUrls.PurchaseRequisition_GetReportPurchaseRequisition);
  // }

  ///================================================ Purchase Quotation

  public InsertPurchaseQuotation(data1: PurchaseQuotation) {
    return this.httpClient.post<ApiResponse<PurchaseQuotation>>(
      this.baseUrl + ProcurementUrls.InsertPurchaseQuotation,
      data1,
      httpOptions
    );
  }

  public DeletePurchaseQuotation(data1: PurchaseQuotation) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + ProcurementUrls.DeletePurchaseQuotation,
      data1,
      httpOptions
    );
  }
  public UpdatePurchaseQuotation(data1: PurchaseQuotation) {
    return this.httpClient.post<ApiResponse<PurchaseQuotation>>(
      this.baseUrl + ProcurementUrls.UpdatePurchaseQuotation,
      data1,
      httpOptions
    );
  }

  public GetPurchaseQuotation() {
    return this.httpClient.get<ApiResponse<PurchaseQuotation[]>>(
      this.baseUrl + ProcurementUrls.GetPurchaseQuotation
    );
  }

  public GetSavedPurchaseQuotationDetails(id: string) {
    return this.httpClient.get<ApiResponse<PurchaseQuotation>>(
      this.baseUrl + ProcurementUrls.GetSavedPurchaseQuotationDetails + '/' + id
    );
  }

  // public CheckVnoExistPurchaseQuotation(vno: string) {
  //   return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + ProcurementUrls.CheckVnoExistPurchaseQuotation + '/' + vno).pipe(delay(400));
  // }

  // public PurchaseQuotation_GetReportPurchaseQuotation() {
  //   return this.httpClient.get<ApiResponse<ReportPurchaseQuotation[]>>(this.baseUrl + ProcurementUrls.PurchaseQuotation_GetReportPurchaseQuotation);
  // }

  ///===========================General Purchase Order

  public InsertGeneralPurchaseOrder(data1: PurchaseOrder) {
    return this.httpClient.post<ApiResponse<PurchaseOrder>>(
      this.baseUrl + ProcurementUrls.InsertGeneralPurchaseOrder,
      data1,
      httpOptions
    );
  }
  public DeleteGeneralPurchaseOrder(data1: PurchaseOrder) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + ProcurementUrls.DeleteGeneralPurchaseOrder,
      data1,
      httpOptions
    );
  }
  public UpdateGeneralPurchaseOrder(data1: PurchaseOrder) {
    return this.httpClient.post<ApiResponse<PurchaseOrder>>(
      this.baseUrl + ProcurementUrls.UpdateGeneralPurchaseOrder,
      data1,
      httpOptions
    );
  }
  public GetGeneralPurchaseOrder() {
    return this.httpClient.get<ApiResponse<PurchaseOrder[]>>(
      this.baseUrl + ProcurementUrls.GetGeneralPurchaseOrder
    );
  }
  public GetSavedGeneralPurchaseOrderDetails(id: string) {
    return this.httpClient.get<ApiResponse<PurchaseOrder>>(
      this.baseUrl +
        ProcurementUrls.GetSavedGeneralPurchaseOrderDetails +
        '/' +
        id
    );
  }

  ///===========================Stock Requisition

  public InsertStockRequisition(data1: StockRequisition) {
    return this.httpClient.post<ApiResponse<PurchaseOrder>>(
      this.baseUrl + ProcurementUrls.InsertStockRequisition,
      data1,
      httpOptions
    );
  }
  public DeleteStockRequisition(data1: StockRequisition) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + ProcurementUrls.DeleteStockRequisition,
      data1,
      httpOptions
    );
  }
  public UpdateStockRequisition(data1: StockRequisition) {
    return this.httpClient.post<ApiResponse<PurchaseOrder>>(
      this.baseUrl + ProcurementUrls.UpdateStockRequisition,
      data1,
      httpOptions
    );
  }
  public GetStockRequisition() {
    return this.httpClient.get<ApiResponse<StockRequisition[]>>(
      this.baseUrl + ProcurementUrls.GetStockRequisition
    );
  }
  public GetSavedStockRequisitionDetails(id: string) {
    return this.httpClient.get<ApiResponse<StockRequisition>>(
      this.baseUrl + ProcurementUrls.GetSavedStockRequisitionDetails + '/' + id
    );
  }
  getBoqlist(id: number) {
    return this.httpClient.get(`${this.baseUrl}LoadBOQ?customerEnqId=${id}`);
  }
  public GetAllRFQ() {
    return this.httpClient.get(this.baseUrl + ProcurementUrls.GetRFQ);
  }

  public InsertRfq(data1: any) {
    return this.httpClient.post(
      this.baseUrl + ProcurementUrls.InsertRFQ,
      data1,
      httpOptions
    );
  }
  public DeleteRfq(vouchaseNo: string) {
    const url = `${this.baseUrl}${ProcurementUrls.DeleteRFQ}?vouchaseNo=${vouchaseNo}`;
    return this.httpClient.get(url, httpOptions);
  }

  public UpdateRfq(data1: any) {
    return this.httpClient.post(
      this.baseUrl + ProcurementUrls.UpdateRFQ,
      data1,
      httpOptions
    );
  }

  public GetSavedRfqDetails(id: any) {
    return this.httpClient.get(
      `${this.baseUrl}${ProcurementUrls.GetSavedRFQDetails}?id=${id}`
    );
  }
   public getQuotationTemplateByQtnId(qtnId: number) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + `GetQuotationTemplateByQtnId/${qtnId}`
    );
  }
  //  public insertQuotationTemplate(data: any) {
  //   return this.httpClient.post<ApiResponse<any>>(
  //     this.baseUrl + `InsertQuotationTemplate`, 
  //     data
  //   );
  // }

  // public updateQuotationTemplate(data: any) {
  //   return this.httpClient.post<ApiResponse<any>>(
  //     this.baseUrl + `UpdateQuotationTemplate`, 
  //     data
  //   );
  // }
public insertQuotationTemplate(formData: FormData) {
  return this.httpClient.post(
    this.baseUrl + 'InsertQuotationTemplate',
    formData
  );
}

public updateQuotationTemplate(formData: FormData) {
  return this.httpClient.post(
    this.baseUrl + 'UpdateQuotationTemplate',
    formData
  );
}
  public deleteQuotationTemplate(reportTemplateID: number) {
    return this.httpClient.delete<ApiResponse<any>>(
      this.baseUrl + `DeleteQuotationTemplate/${reportTemplateID}`
    );
  }
}
