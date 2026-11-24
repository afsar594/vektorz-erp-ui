import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../domain/Masters/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class SalesServiceService {
  baseUrl: string = environment.apiRootURL;
  constructor(private http: HttpClient) { }

  //Customer Sales Work Started
  GetCustomerMasterDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetCustomerMasterDropdown');
  }
  GetLocationMasterDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetLocationMasterDropdown');
  }
  GetJobMasterDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetJobMasterDropdown');
  }
  GetDepartmentMasterDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetDepartmentMasterDropdown');
  }
  GetCurrencyMasterDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetCurrencyMasterDropdown');
  }
  AddEditCustomerOrder(data:any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Sales/AddEditCustomerOrder', data);
  }
  GetSalesManMasterDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetSalesManMasterDropdown');
  }
  GetUnitMasterDropdown() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetUnitMasterDropdown');
  }
  GetItemMasterList() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetItemMasterList');
  }
  GetProductInquiryDetail(itemId: any) {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetProductInquiryDetail?itemId=' + itemId);
  }
  GetSpecificOrder(id:any) {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Sales/GetSpecificOrder?id='+id);
  }
  GetCustomerOrdersGridList(data:any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Sales/GetCustomerOrdersGridList', data);
  }
  //END
}
