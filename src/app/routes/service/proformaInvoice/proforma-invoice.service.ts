import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../domain/Masters/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class ProformaInvoiceService {
  baseUrl: string = environment.apiRootURL;
  constructor(private http: HttpClient) { }

  addProformInvice(data) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'ProformaInvoice/InsertProformaInvoice', data)
  }

  editProformInvice(data) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'ProformaInvoice/UpdateProformaInvoice', data)
  }

  getAllPI() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'ProformaInvoice/GetAllProformaInvoices')
  }
    GetAllProformaInvoicesData() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'ProformaInvoice/GetAllProformaInvoicesData')
  }

  getPIById(id) {
    return this.http.get<ApiResponse<any>>(this.baseUrl + `ProformaInvoice/GetProformaInvoiceById?id=`+ id)
  }

  deletePI(id) {
    return this.http.delete<ApiResponse<any>>(this.baseUrl + `ProformaInvoice/DeleteProformaInvoice?id=`+ id)

  }

}
