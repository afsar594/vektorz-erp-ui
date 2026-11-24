import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../domain/ApiResponse';
import { ProcurementUrls } from './url.api';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};
@Injectable({
  providedIn: 'root'
})

export class ProgrssiveInvoiceService {

  baseUrl: string = environment.apiRootURL;
  constructor(private httpClient: HttpClient) {

  }
  public InsertProgressInvoice(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(this.baseUrl + 'ProgressInvoice/InsertProgressInvoice', data1, httpOptions);
  }

  public DeleteProgressInvoice(data1: any) {
    return this.httpClient.post<ApiResponse<number>>(this.baseUrl + 'ProgressInvoice/DeleteProgressInvoice', data1, httpOptions);
  }

  public UpdateProgressInvoice(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(this.baseUrl + 'ProgressInvoice/UpdateProgressInvoice', data1, httpOptions);
  }

  public GetProgressInvoiceReport() {
    return this.httpClient.get<ApiResponse<any[]>>(this.baseUrl + 'ProgressInvoice/GetProgressInvoiceReport');
  }

  public GetSavedProgressiveInoices(id: string) {
    return this.httpClient.get<ApiResponse<any>>(this.baseUrl + 'ProgressInvoice/GetSavedProgressiveInoices' + '/' + id);
  }

  public GetById(id: string) {
    return this.httpClient.get<ApiResponse<any>>(this.baseUrl + `ProgressInvoice/GetById?Id=${id}`);
  }

  public JobBYCUSTID(id: any) {
    return this.httpClient.get<ApiResponse<any>>(this.baseUrl + `ProgressInvoice/JobBYCUSTID?id=${id}`);
  }

  public GetPreviousSummaryByJob(customerId: any, jobId: any, isVariation: boolean = false) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + `ProgressInvoice/GetPreviousSummaryByJob?customerId=${customerId}&jobId=${jobId}&isVariation=${isVariation}`
    );
  }
}
