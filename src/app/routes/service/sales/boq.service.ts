import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../domain/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class BoqService {

  baseUrl: string = environment.apiRootURL;

  constructor(private httpClient: HttpClient) { }

  public InsertBillofQty(data) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + 'InsertBillofQty',
      data
    );
  }

  public UpdateBillofQty(data) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + 'UpdateBillofQty',
      data
    );
  }

  public DeleteBillofQty(id: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + `DeleteBillofQty/${id}`
    );
  }

  public GetSavedBillofQty(id: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + 'GetSavedBillofQty' + '/' + id
    );
  }

  public BOQLoadDropdown() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + 'BOQLoadDropdown'
    );
  }

  public GetBillofQty() {
    return this.httpClient.get<ApiResponse<any>>(this.baseUrl + 'GetBillofQty');
  }

  public getenquirylist(data: any) {
    const params = [];
    if (data.enquiryIds != null)
      params.push(`enquiryNo=${encodeURIComponent(data.enquiryIds)}`);
    if (data.fromDate != null && data.isdate)
      params.push(`fromDate=${encodeURIComponent(data.fromDate)}`);
    if (data.toDate != null && data.isdate)
      params.push(`toDate=${encodeURIComponent(data.toDate)}`);
    const queryString = params.length ? '?' + params.join('&') : '';
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + `CustomerEnqirySearch/EnquiryDetailsForBoq${queryString}`
    );

  }
  getenquirybyID(id: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + `CustomerEnqirySearch/EnquiryDetailsForBoqByID/${id}`
    );
  }
}
