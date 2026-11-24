import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TrialBalanceReportFilter } from '../../domain/MIS/TrialBalanceReportFilter';
import { ApiResponse } from '../../domain/Masters/ApiResponse';
import { MisReportParams } from '../../view/misreport/balance-sheet-adv/balance-sheet-adv.component';

@Injectable({
  providedIn: 'root'
})
export class MISService {
 
  baseUrl: string = environment.apiRootURL;
  constructor(private http: HttpClient) { }

  //Profit Loss Work Started
  GetFinancialYearResponse() {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'MIS/GetFinancialYearResponse');
  }
  GetAccountTransactionsProfitLoss(data:any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'MIS/GetAccountTransactionsProfitLoss', data);
  }
  GetAccountTransactionsMonthProfitLoss(data:any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'MIS/GetAccountTransactionsProfitLossPrintMonthWise', data);
  }
  GetAccountTransactionsProfitLossPrintMonthly(data:any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'MIS/GetAccountTransactionsProfitLossPrintMonthWise', data);
  }

  GetAccountTransactionsProfitLossPrintSimple(data:any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'MIS/GetAccountTransactionsProfitLossPrintSimple', data);
  }

  GetAccountTransactionsProfitLossPrintSummary(data:any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'MIS/GetAccountTransactionsProfitLossPrintSummary', data);
  }

  //END
    //Balance Sheet Work Started
    GetAccountTransactionsBalanceSheetSummary(data:any) {
      return this.http.post<ApiResponse<any>>(this.baseUrl + 'MIS/GetAccountTransactionsBalanceSheetSummary', data);
    }
    GetAccountTransactionsBalanceSheetDetail(data:any) {
      return this.http.post<ApiResponse<any>>(this.baseUrl + 'MIS/GetAccountTransactionsBalanceSheetDetail', data);
    }
    printAsExcel(data:any) {
      return this.http.post(this.baseUrl + 'MIS/BalanceSheetPrint', data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob'
    });
    }
    printAsExcelSummary(data:any) {
      return this.http.post(this.baseUrl + 'MIS/BalanceSheetPrintSummary', data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob'
    });
    }

    //END

      //Profit Loss Work Started
  GetAccountTransactionsTrialBalance(data:any, type) {
    return this.http.post<ApiResponse<any>>(this.baseUrl +  `TrialBalanceReport/${type}`, data);
  }
  //END




   //MIS trailBalance Report
   GetReportGroupSummary(payLoad:TrialBalanceReportFilter){
    
    return this.http.post<ApiResponse<any>>(this.baseUrl + "TrialBalanceReport/GetReportGroupSummary",payLoad);
  }
  GetReportGroupDetails(payLoad:TrialBalanceReportFilter){
    return this.http.post<ApiResponse<any>>(this.baseUrl + "TrialBalanceReport/GetReportGroupDetails",payLoad);
  }
  GetReportGroupHeadSummary(payLoad:TrialBalanceReportFilter){
    return this.http.post<ApiResponse<any>>(this.baseUrl + "TrialBalanceReport/GetReportGroupHeadSummary",payLoad);
  }
  GetReportGroupSummaryWithZeroBalance(payLoad:TrialBalanceReportFilter){
    return this.http.post<ApiResponse<any>>(this.baseUrl + "TrialBalanceReport/GetReportGroupSummaryWithZeroBalance",payLoad);
  }
  GetReportGroupHeadSummaryWithZeroBalance(payLoad:TrialBalanceReportFilter){
    return this.http.post<ApiResponse<any>>(this.baseUrl + "TrialBalanceReport/GetReportGroupHeadSummaryWithZeroBalance",payLoad);
  }
  GetTrialBalanceSummary(payLoad:TrialBalanceReportFilter){
    return this.http.post<ApiResponse<any>>(this.baseUrl + "TrialBalanceReport/TrailBalanceSummary",payLoad);
  }
  GetTrialBalanceDetailedView(payLoad:TrialBalanceReportFilter){
    return this.http.post<ApiResponse<any>>(this.baseUrl + "TrialBalanceReport/TrailBalanceDetailedView",payLoad);
  }
  GetTrialBalanceGroupView(payLoad:TrialBalanceReportFilter){
    return this.http.post<ApiResponse<any>>(this.baseUrl + "TrialBalanceReport/TrailBalanceGroupView",payLoad);
  }
  
   getBalanceSheetAdv(params: MisReportParams) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'MisReports/balance-sheet', params);
  }
  getProfitAndLoss(params: MisReportParams) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'MisReports/profit-and-loss', params);
  }
  getTrialBalance(params: MisReportParams) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'MisReports/trial-balance', params);
  }
  GetAllFinancialPeriod(){
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'GetAllFinancialPeriod');
  }
}
