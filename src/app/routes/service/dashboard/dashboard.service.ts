import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../domain/Masters/ApiResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardDataService {
  baseUrl: string = environment.apiRootURL;
  constructor(private http: HttpClient) {}

  GetDashboardChart(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + '/Dashboard/GetSummaryChart1',
      data
    );
  }

  GetTabsChart(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + 'Dashboard/GetSummaryChart1',
      data
    );
  }

  GetSummaryChart(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Dashboard/GetSummaryChart',
      data
    );
  }

  getPDC(): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'Dashboard/GetPdcTotal');
    // return this.http.post<ApiResponse<any>>(this.baseUrl + '/Dashboard/GetDashboardPDCIssueRecieved', data);
  }

  GetDashboardBankBalance(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Dashboard/GetDashboardBankBalance',
      data
    );
  }

  GetDasboardSalesPurchaseLineChart(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Dashboard/GetDasboardSalesPurchaseLineChart',
      data
    );
  }

  GetMainDashboard(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Dashboard/GetMainDashboard',
      data
    );
  }
}
