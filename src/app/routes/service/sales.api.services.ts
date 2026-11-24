import { PaymentVoucher } from 'src/app/routes/domain/Accounts/PaymentVoucher';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SalesUrls } from './url.api';
import { ApiResponse } from '../domain/ApiResponse';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CustomerQuotation } from '../domain/Sales/CustomerQuotation';
import { CustomerEnquiry } from '../domain/Sales/CustomerEnquiry';
import { SalesVoucher } from '../domain/Sales/SalesVoucher';
import { IssueVoucher } from '../domain/Sales/IssueVoucher';
import { IssueReturn } from '../domain/Sales/IssueReturn';
import { DeliveryNote } from '../domain/Sales/DeliveryNote';
import { SalesReturn } from '../domain/Sales/SalesReturn';
import { CustomerPurchaseOrder } from '../domain/Sales/customerpurchaseorder';
import { AnyARecord } from 'dns';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class SalesApiService {

  baseUrl: string = environment.apiRootURL;
  SalesVoucherDetailsByMasterNoArray: any[] = [];
  SalesVoucherArray: any[] = [];
  constructor(private httpClient: HttpClient) { }

  public InsertCustomerQuotation(data1: CustomerQuotation) {
    return this.httpClient.post<ApiResponse<CustomerQuotation>>(
      this.baseUrl + SalesUrls.InsertCustomerQuotation,
      data1,
      httpOptions
    );
  }

  ApproveCustomerQuotationAsync(id: number, status: number) {
    return this.httpClient.post<ApiResponse<boolean>>(
      this.baseUrl + 'ApproveCustomerQuotationAsync' + '/' + id + '/' + status,
      null
    );
  }

  BoqToCustomerQuotation(data: any) {
    const params = [];
    if (data.boqNo != null)
      params.push(`boqNo=${encodeURIComponent(data.boqNo)}`);
    if (data.fromDate != null && data.isdate)
      params.push(`fromDate=${encodeURIComponent(data.fromDate)}`);
    if (data.toDate != null && data.isdate)
      params.push(`toDate=${encodeURIComponent(data.toDate)}`);
    const queryString = params.length ? '?' + params.join('&') : '';
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + `BoqToCustomerQuotation${queryString}`
    );
  }

  public InsertCustomerQuotationwithRivise(data1: CustomerQuotation) {
    return this.httpClient.post<ApiResponse<CustomerQuotation>>(
      this.baseUrl + SalesUrls.InsertCustomerQuotationwithRevise,
      data1,
      httpOptions
    );
  }

  public UpdateCustomerQuotation(data1: CustomerQuotation) {
    return this.httpClient.post<ApiResponse<CustomerQuotation>>(
      this.baseUrl + SalesUrls.UpdateCustomerQuotation,
      data1,
      httpOptions
    );
  }

  getEnquiryDetails(enquiry_Details_Enquiry_Details_ID: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + `GetCustomerEnquiryDetailsById/${enquiry_Details_Enquiry_Details_ID}`
    );
  }

  public DeleteCustomerQuotation(data1: CustomerQuotation) {
    return this.httpClient.post<ApiResponse<CustomerQuotation>>(
      this.baseUrl + SalesUrls.DeleteCustomerQuotation,
      data1,
      httpOptions
    );
  }

  public GetCustomerQuotation() {
    return this.httpClient.get<ApiResponse<CustomerQuotation[]>>(
      this.baseUrl + SalesUrls.GetCustomerQuotation
    );
  }

  public GetQuotationDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + SalesUrls.GetQuotationDropdown
    );
  }

  public GetSavedCustQuotationDetails(id: string) {
    return this.httpClient.get<ApiResponse<CustomerQuotation>>(
      this.baseUrl + SalesUrls.GetSavedCustQuotationDetails + '/' + id
    );
  }

  public GetSalesVoucherDetailsByMasterNo(SalesVoucherNo: string) {
    return this.httpClient.get(
      this.baseUrl +
      'SalesVoucher/GetSalesVoucherDetailsByMasterNo?SalesVoucherNo=' +
      SalesVoucherNo
    );
  }

  public InsertCustomerEnquiry(data1: CustomerEnquiry) {
    return this.httpClient.post<ApiResponse<CustomerEnquiry>>(
      this.baseUrl + SalesUrls.InsertCustomerEnquiry,
      data1,
      httpOptions
    );
  }

  public UpdateCustomerEnquiry(data1: CustomerEnquiry) {
    return this.httpClient.post<ApiResponse<CustomerEnquiry>>(
      this.baseUrl + SalesUrls.UpdateCustomerEnquiry,
      data1,
      httpOptions
    );
  }

  public DeleteCustomerEnquiry(data1: CustomerEnquiry) {
    return this.httpClient.post<ApiResponse<CustomerEnquiry>>(
      this.baseUrl + SalesUrls.DeleteCustomerEnquiry,
      data1,
      httpOptions
    );
  }

  public GetCustomerEnquiry() {
    return this.httpClient.get<ApiResponse<CustomerEnquiry[]>>(
      this.baseUrl + SalesUrls.GetCustomerEnquiry
    );
  }

  public GetCustomerEnquiryDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + SalesUrls.GetCustomerEnquiryDropdown
    );
  }

  public GetSavedCustEnquiryDetails(id: string) {
    return this.httpClient.get<ApiResponse<CustomerEnquiry>>(
      this.baseUrl + SalesUrls.GetSavedCustEnquiryDetails + '/' + id
    );
  }

  public GetCustomerEnquirybyStatuss(data1: any) {
    return this.httpClient.post(
      this.baseUrl + SalesUrls.GetCustomerEnquirybyStatuss,
      data1,
      httpOptions
    );
  }

  public InsertSalesVoucher(data1: SalesVoucher) {
    return this.httpClient.post<ApiResponse<SalesVoucher>>(
      this.baseUrl + SalesUrls.InsertSalesVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteSalesVoucher(data1: SalesVoucher) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.DeleteSalesVoucher,
      data1,
      httpOptions
    );
  }

  public UpdateSalesVoucher(data1: SalesVoucher) {
    return this.httpClient.post<ApiResponse<SalesVoucher>>(
      this.baseUrl + SalesUrls.UpdateSalesVoucher,
      data1,
      httpOptions
    );
  }

  public GetSalesVoucher() {
    return this.httpClient.get<ApiResponse<SalesVoucher[]>>(
      this.baseUrl + SalesUrls.GetSalesVoucher
    );
  }
  GetSalesVoucherList(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + SalesUrls.GetSalesVoucherList,
      data
    );
  }

  public GetSalesDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + SalesUrls.GetSalesDropdown
    );
  }

  public GetSavedSalesVoucherDetails(id: string) {
    return this.httpClient.get<ApiResponse<SalesVoucher>>(
      this.baseUrl + SalesUrls.GetSavedSalesVoucherDetails + '/' + id
    );
  }
  public GetSavedSalesVoucherDetailsBySaleVoucher(svNo: string) {
    const encodedVoucherNo = encodeURIComponent(svNo);
    return this.httpClient.get<ApiResponse<SalesVoucher>>(
      `${this.baseUrl}${SalesUrls.GetSavedSalesVoucherDetailsBySaleVoucher}/${encodedVoucherNo}`
    );
  }

  public CheckVnoExistSalesVoucher(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + SalesUrls.CheckVnoExistSalesVoucher + '/' + vno
      )
      .pipe(delay(400));
  }

  public InsertSalesReturn(data1: SalesReturn) {
    return this.httpClient.post<ApiResponse<SalesReturn>>(
      this.baseUrl + SalesUrls.InsertSalesReturn,
      data1,
      httpOptions
    );
  }

  public DeleteSalesReturn(data1: SalesReturn) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.DeleteSalesReturn,
      data1,
      httpOptions
    );
  }

  public UpdateSalesReturn(data1: SalesReturn) {
    return this.httpClient.post<ApiResponse<SalesReturn>>(
      this.baseUrl + SalesUrls.UpdateSalesReturn,
      data1,
      httpOptions
    );
  }

  public GetSalesReturn() {
    return this.httpClient.get<ApiResponse<SalesReturn[]>>(
      this.baseUrl + SalesUrls.GetSalesReturn
    );
  }
  public GetSalesReturnList(data: any) {
    return this.httpClient.post<ApiResponse<SalesReturn[]>>(
      this.baseUrl + SalesUrls.GetSalesReturnList,
      data,
      httpOptions
    );
  }

  public GetSavedSalesReturnDetails(id: string) {
    return this.httpClient.get<ApiResponse<SalesReturn>>(
      this.baseUrl + SalesUrls.GetSavedSalesReturnDetails + '/' + id
    );
  }

  public InsertIssueVoucher(data1: IssueVoucher) {
    return this.httpClient.post<ApiResponse<IssueVoucher>>(
      this.baseUrl + SalesUrls.InsertIssueVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteIssueVoucher(data1: IssueVoucher) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.DeleteIssueVoucher,
      data1,
      httpOptions
    );
  }

  public UpdateIssueVoucher(data1: IssueVoucher) {
    return this.httpClient.post<ApiResponse<IssueVoucher>>(
      this.baseUrl + SalesUrls.UpdateIssueVoucher,
      data1,
      httpOptions
    );
  }

  public GetIssueVoucher() {
    return this.httpClient.get<ApiResponse<IssueVoucher[]>>(
      this.baseUrl + SalesUrls.GetIssueVoucher
    );
  }
  public GetIssueVoucherDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + SalesUrls.GetIssueVoucherDropdown
    );
  }

  public GetSavedIssueVoucherDetails(id: string) {
    return this.httpClient.get<ApiResponse<IssueVoucher>>(
      this.baseUrl + SalesUrls.GetSavedIssueVoucherDetails + '/' + id
    );
  }

  public CheckVnoExistIssueVoucher(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + SalesUrls.CheckVnoExistIssueVoucher + '/' + vno
      )
      .pipe(delay(400));
  }

  public InsertIssueReturn(data1: IssueReturn) {
    return this.httpClient.post<ApiResponse<IssueReturn>>(
      this.baseUrl + SalesUrls.InsertIssueReturn,
      data1,
      httpOptions
    );
  }

  public DeleteIssueReturn(data1: IssueReturn) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.DeleteIssueReturn,
      data1,
      httpOptions
    );
  }
  public UpdateIssueReturn(data1: IssueReturn) {
    return this.httpClient.post<ApiResponse<IssueReturn>>(
      this.baseUrl + SalesUrls.UpdateIssueReturn,
      data1,
      httpOptions
    );
  }

  public GetIssueReturn() {
    return this.httpClient.get<ApiResponse<IssueReturn[]>>(
      this.baseUrl + SalesUrls.GetIssueReturn
    );
  }

  public GetSavedIssueReturnDetails(id: string) {
    return this.httpClient.get<ApiResponse<IssueReturn>>(
      this.baseUrl + SalesUrls.GetSavedIssueReturnDetails + '/' + id
    );
  }

  public CheckVnoExistIssueReturn(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + SalesUrls.CheckVnoExistIssueReturn + '/' + vno
      )
      .pipe(delay(400));
  }

  public InsertCustomerPurchase(data: CustomerPurchaseOrder) {
    return this.httpClient.post<ApiResponse<CustomerPurchaseOrder>>(
      this.baseUrl + SalesUrls.InsertCustomerPurchase,
      data,
      httpOptions
    );
  }

  public DeleteCustomerPurchase(data: CustomerPurchaseOrder) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.DeleteCustomerPurchase,
      data,
      httpOptions
    );
  }

  public UpdateCustomerPurchase(data: CustomerPurchaseOrder) {
    return this.httpClient.post<ApiResponse<CustomerPurchaseOrder>>(
      this.baseUrl + SalesUrls.UpdateCustomerPurchase,
      data,
      httpOptions
    );
  }

  public GetCustomerPurchaseOrder() {
    return this.httpClient.get<ApiResponse<CustomerPurchaseOrder[]>>(
      this.baseUrl + SalesUrls.GetCustomerPurchase
    );
  }

  public GetSavedCustomerPurchaseDetails(id: any) {
    return this.httpClient.get<ApiResponse<CustomerPurchaseOrder>>(
      this.baseUrl + SalesUrls.GetSavedCustomerPurchaseDetails + '/' + id
    );
  }

  public InsertDeliveryNote(data1: DeliveryNote) {
    return this.httpClient.post<ApiResponse<DeliveryNote>>(
      this.baseUrl + SalesUrls.InsertDeliveryNote,
      data1,
      httpOptions
    );
  }

  public DeleteDeliveryNote(data1: DeliveryNote) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.DeleteDeliveryNote,
      data1,
      httpOptions
    );
  }
  public UpdateDeliveryNote(data1: DeliveryNote) {
    return this.httpClient.post<ApiResponse<DeliveryNote>>(
      this.baseUrl + SalesUrls.UpdateDeliveryNote,
      data1,
      httpOptions
    );
  }

  public DeliveryNoteByFilterById(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + `DeliveryNoteReport/DeliveryNoteByFilterById`,
      data1,
      httpOptions
    );
  }

  public DeliveryNoteByFilter(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + `DeliveryNoteReport/DeliveryNoteByFilter`,
      data1,
      httpOptions
    );
  }

  public GetDeliveryNote() {
    return this.httpClient.get<ApiResponse<DeliveryNote[]>>(
      this.baseUrl + SalesUrls.GetDeliveryNote
    );
  }

  public GetSavedDeliveryNoteDetails(id: number) {
    return this.httpClient.get<ApiResponse<DeliveryNote>>(
      this.baseUrl + SalesUrls.GetSavedDeliveryNoteDetails + '/' + id
    );
  }

  public CheckVnoExistDeliveryNote(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + SalesUrls.CheckVnoExistDeliveryNote + '/' + vno
      )
      .pipe(delay(400));
  }

  public GetCustomerQuotationDetail(data1: any) {
    return this.httpClient.post(
      this.baseUrl + SalesUrls.GetCustomerQuotationDetail,
      data1,
      httpOptions
    );
  }

  public GetPurchaseOrderTracking(data1: any) {
    return this.httpClient.post(
      this.baseUrl + SalesUrls.GetPurchaseOrderTracking,
      data1,
      httpOptions
    );
  }
  public GetSalesVoucherForGRN(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + `SalesVoucher/getsalesvoucherforgrnbrowse`,
      data1,
      httpOptions
    );
  }
  public GetSalesVoucherById(id: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + `SalesVoucher/GetSalesVoucherById/${id}`,
    );
  }
}
