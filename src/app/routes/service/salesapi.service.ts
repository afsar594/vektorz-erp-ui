import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../domain/ApiResponse';
import { SalesUrls } from './url.api';
import { CustomerQuotation } from '../domain/Masters/CustomerQuotation';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};
@Injectable({
  providedIn: 'root'
})
export class SalesApiService {

  baseUrl: string = environment.apiRootURL;
  constructor(private httpClient: HttpClient) { }

  public InsertCustomerQuotation(data1: CustomerQuotation) {
    return this.httpClient.post<ApiResponse<CustomerQuotation>>(this.baseUrl + SalesUrls.InsertCustomerQuotation, data1, httpOptions);
  }

  public UpdateCustomerQuotation(data1: CustomerQuotation) {
    return this.httpClient.post<ApiResponse<CustomerQuotation>>(this.baseUrl + SalesUrls.UpdateCustomerQuotation, data1, httpOptions);
  }

  public DeleteCustomerQuotation(data1: CustomerQuotation) {
    return this.httpClient.post<ApiResponse<CustomerQuotation>>(this.baseUrl + SalesUrls.DeleteCustomerQuotation, data1, httpOptions);
  }

  public GetCustomerQuotation() {
    return this.httpClient.get<ApiResponse<CustomerQuotation[]>>(this.baseUrl + SalesUrls.GetCustomerQuotation);
  }

  public GetSavedCustQuotationDetails(id: string) {
    return this.httpClient.get<ApiResponse<CustomerQuotation>>(this.baseUrl + SalesUrls.GetSavedCustQuotationDetails + '/' + id);
  }
  

  public InsertCustomerEnquiry(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.InsertCustomerEnquiry, data1, httpOptions);
  }

  public UpdateCustomerEnquiry(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.UpdateCustomerEnquiry, data1, httpOptions);
  }

  public DeleteCustomerEnquiry(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.DeleteCustomerEnquiry, data1, httpOptions);
  }

  public GetCustomerEnquiry() {
    return this.httpClient.get<ApiResponse<any[]>>(this.baseUrl + SalesUrls.GetCustomerEnquiry);
  }

  public GetSavedCustEnquiryDetails(id: string) {
    return this.httpClient.get<ApiResponse<any>>(this.baseUrl + SalesUrls.GetSavedCustEnquiryDetails + '/' + id);
  }

// =========================== Sales Voucher 
  public InsertSalesVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.InsertSalesVoucher, data1, httpOptions);
  }

  public DeleteSalesVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<number>>(this.baseUrl + SalesUrls.DeleteSalesVoucher, data1, httpOptions);
  }
  public UpdateSalesVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.UpdateSalesVoucher, data1, httpOptions);
  }
  public GetSalesVoucher() {
    return this.httpClient.get<ApiResponse<any[]>>(this.baseUrl + SalesUrls.GetSalesVoucher);
  }
  public GetSavedSalesVoucherDetails(id: string) {
    return this.httpClient.get<ApiResponse<any>>(this.baseUrl + SalesUrls.GetSavedSalesVoucherDetails + '/' + id);
  }

  public CheckVnoExistSalesVoucher(vno: string) {
    return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + SalesUrls.CheckVnoExistSalesVoucher + '/' + vno).pipe(delay(400));
  }
  
  // public SalesVoucher_GetReportSalesVoucher() {
  //   return this.httpClient.get<ApiResponse<ReportSalesVoucher[]>>(this.baseUrl + AccountsUrls.SalesVoucher_GetReportSalesVoucher);
  // }


//================================== Sales Return

public InsertSalesReturn(data1: any) {
  return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.InsertSalesReturn, data1, httpOptions);
}

public DeleteSalesReturn(data1: any) {
  return this.httpClient.post<ApiResponse<number>>(this.baseUrl + SalesUrls.DeleteSalesReturn, data1, httpOptions);
}
public UpdateSalesReturn(data1: any) {
  return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.UpdateSalesReturn, data1, httpOptions);
}


public GetSalesReturn() {
  return this.httpClient.get<ApiResponse<any[]>>(this.baseUrl + SalesUrls.GetSalesReturn);
}

public GetSavedSalesReturnDetails(id: string) {
  return this.httpClient.get<ApiResponse<any>>(this.baseUrl + SalesUrls.GetSavedSalesReturnDetails + '/' + id);
}

// public CheckVnoExistSalesReturn(vno: string) {
//   return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + SalesUrls.CheckVnoExistSalesReturn + '/' + vno).pipe(delay(400));
// }

 
// public SalesReturn_GetReportSalesReturn() {
//   return this.httpClient.get<ApiResponse<ReportSalesReturn[]>>(this.baseUrl + SalesUrls.SalesReturn_GetReportSalesReturn);
// }

///================================Issue Voucher

public InsertIssueVoucher(data1: any) {
  return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.InsertIssueVoucher, data1, httpOptions);
}

public DeleteIssueVoucher(data1: any) {
  return this.httpClient.post<ApiResponse<number>>(this.baseUrl + SalesUrls.DeleteIssueVoucher, data1, httpOptions);
}
public UpdateIssueVoucher(data1: any) {
  return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.UpdateIssueVoucher, data1, httpOptions);
}

public GetIssueVoucher() {
  return this.httpClient.get<ApiResponse<any[]>>(this.baseUrl + SalesUrls.GetIssueVoucher);
}

public GetSavedIssueVoucherDetails(id: string) {
  return this.httpClient.get<ApiResponse<any>>(this.baseUrl + SalesUrls.GetSavedIssueVoucherDetails + '/' + id);
}

public CheckVnoExistIssueVoucher(vno: string) {
  return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + SalesUrls.CheckVnoExistIssueVoucher + '/' + vno).pipe(delay(400));
}

// public IssueVoucher_GetReportIssueVoucher() {
//  return this.httpClient.get<ApiResponse<ReportIssueVoucher[]>>(this.baseUrl + SalesUrls.IssueVoucher_GetReportIssueVoucher);
// }


//========================  Issue Return

public InsertIssueReturn(data1: any) {
  return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.InsertIssueReturn, data1, httpOptions);
}

public DeleteIssueReturn(data1: any) {
  return this.httpClient.post<ApiResponse<number>>(this.baseUrl + SalesUrls.DeleteIssueReturn, data1, httpOptions);
}
public UpdateIssueReturn(data1: any) {
  return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.UpdateIssueReturn, data1, httpOptions);
}


public GetIssueReturn() {
  return this.httpClient.get<ApiResponse<any[]>>(this.baseUrl + SalesUrls.GetIssueReturn);
}

public GetSavedIssueReturnDetails(id: string) {
  return this.httpClient.get<ApiResponse<any>>(this.baseUrl + SalesUrls.GetSavedIssueReturnDetails + '/' + id);
}

public CheckVnoExistIssueReturn(vno: string) {
  return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + SalesUrls.CheckVnoExistIssueReturn + '/' + vno).pipe(delay(400));
}
 
// public IssueReturn_GetReportIssueReturn() {
//  return this.httpClient.get<ApiResponse<ReportIssueRetur[]>>(this.baseUrl + AccountsUrls.IssueReturn_GetReportIssueReturn);
// }

///========================================== Delivery Note

public InsertDeliveryNote(data1: any) {
  return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.InsertDeliveryNote, data1, httpOptions);
}

public DeleteDeliveryNote(data1: any) {
  return this.httpClient.post<ApiResponse<number>>(this.baseUrl + SalesUrls.DeleteDeliveryNote, data1, httpOptions);
}
public UpdateDeliveryNote(data1: any) {
  return this.httpClient.post<ApiResponse<any>>(this.baseUrl + SalesUrls.UpdateDeliveryNote, data1, httpOptions);
}


public GetDeliveryNote() {
  return this.httpClient.get<ApiResponse<any[]>>(this.baseUrl + SalesUrls.GetDeliveryNote);
}

public GetSavedDeliveryNoteDetails(id: number) {
  return this.httpClient.get<ApiResponse<any>>(this.baseUrl + SalesUrls.GetSavedDeliveryNoteDetails + '/' + id);
}

public CheckVnoExistDeliveryNote(vno: string) {
  return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + SalesUrls.CheckVnoExistDeliveryNote + '/' + vno).pipe(delay(400));
}

///==========================================

}
