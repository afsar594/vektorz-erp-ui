import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../domain/Masters/ApiResponse';
import { SalesVoucherURL } from '../url.api';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  baseUrl: string = environment.apiRootURL;
  SalesVoucherWithDetails: any[] = [];
  constructor(private http: HttpClient) { }

  getSalesReportTypeWise(type,data) {
    return this.http.post(this.baseUrl + `SalesVoucher/${type}`,data)
  }
  
  getCustomerWiseSalesReport(type:string, customerId?: number, fromDate?: string, toDate?: string) {
  let params: any = {};

  if (customerId) {
    params.customerId = customerId;
  }
  if (fromDate) {
    params.fromDate = fromDate;
  }
  if (toDate) {
    params.toDate = toDate;
  }

  return this.http.get(`${this.baseUrl}SalesVoucher/${type}`, { params });
}

  getSalesReport() {
    return this.http.get(this.baseUrl + 'Sales/GetSalesReport');
  }


  GetSalesManMaster() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetSalesManMaster');
  }

  GetCustomerFromSaleMan(query: string) {
    
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetCustomerFromSaleMan?query=' + query);
  }

  AccountTransactionsSalesmanWiseOutstandingReportDetail(data: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Sales/AccountTransactionsSalesmanWiseOutstandingReportDetail', data);
  }

  AccountTransactionsSalesmanWiseOutstandingReportSummary(data: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Sales/AccountTransactionsSalesmanWiseOutstandingReportSummary', data);
  }

  GetSalesVoucherWithDetails() {
    if (this.SalesVoucherWithDetails && this.SalesVoucherWithDetails.length > 0) {
      return
    }
    this.http.get<any>(this.baseUrl + SalesVoucherURL.GetSalesVoucherWithDetails).subscribe(res => {
      this.SalesVoucherWithDetails = res as any[]
    });
  }

  GenerateSaleReturnVoucherNo() {
    return this.http.get<any>(this.baseUrl + 'SalesReturn/GenerateVoucherNo');
  }
  
}
