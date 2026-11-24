import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApprovalFilterModel, POPRApprovaApiResponse } from '../../view/procurement/apprval/ApprovalFilterModel';
import { ApiResponse } from '../../domain/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {


  baseUrl: string = environment.apiRootURL;
  constructor(private http: HttpClient) { }

  GetDefaultPOPR(orderId, orderType): Observable<any> {
    return this.http.get<any[]>(this.baseUrl + `PurchaseOrder/GetDefaultPOPR?orderId=${orderId}&orderType=${orderType}`);
  }

  GetPOPRForApproval(data: ApprovalFilterModel) {
    return this.http.post<ApiResponse<POPRApprovaApiResponse[]>>(this.baseUrl + `PurchaseOrder/GetPOPRForApproval`, data);
  }

  ApprovePOPR(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}PurchaseOrder/ApprovePOPR`, data);
  }

  ResendEmail(type: any, level: any, orderId: any, approverId: any): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.baseUrl}Notifications/resend-email?type=${type}&level=${level}&orderId=${orderId}&approverId=${approverId}`,
      null
    );
  }
}
