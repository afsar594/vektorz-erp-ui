import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../domain/ApiResponse';
import { Observable } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class AccountstatementService {
  baseUrl: string = environment.apiRootURL;
  constructor(private http: HttpClient) { }
  GetStatementOfAccountSummary(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl +
      'StatementOfAccountSummary/StatementOfAccountSummaryResponse',
      data
    );
  }
  //Account Statement Work Started
  GetAccountMasterDropdown() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAccountMasterDropdown'
    );
  }
  GetJobMasterDropdown() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetJobMasterDropdown'
    );
  }
  GetAccountTransactions(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAccountTransactions',
      data
    );
  }
  DownloadAccountStatement(data: any) {
    return this.http.post(
      this.baseUrl + 'Account/DownloadAccountStatement',
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  //END

  //Voucher Printing Start
  GetVoucherTypeDropdown() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetVoucherTypeDropdown'
    );
  }
  GetVoucherNoDropdown() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetVoucherNoDropdown'
    );
  }
  GetVoucherNoAutoComplete(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetVoucherNoAutoComplete',
      data
    );
  }
  GetAccountTransactionsVoucherPrint(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAccountTransactionsVoucherPrint',
      data
    );
  }
  DownloadVoucherPrint(data: any) {
    return this.http.post(this.baseUrl + 'Account/DownloadVoucherPrint', data, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }
  DownloadOutstandingPrint(data: any) {
    return this.http.post(
      this.baseUrl + 'Account/OutstandingStatementPrint',
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  //END

  //Account Statement Multi Work Started
  GetAccountMaster(filter) {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAccountMaster?filter=' + filter
    );
  }
  GetAccountMasterGroup() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAccountMasterGroup'
    );
  }
  GetAccountTransactionsMultiAccountSummary(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAccountTransactionsMultiAccountSummary',
      data
    );
  }
  DownloadMultiAccountSummary(data: any) {
    return this.http.post(
      this.baseUrl + 'Account/DownloadMultiAccountSummary',
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  GetAccountTransactionsMultiAccountDetail(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAccountTransactionsMultiAccountDetail',
      data
    );
  }

  GetAccountTransactionsMultiAccountDetailPrint(data: any) {
    return this.http.post(
      this.baseUrl + 'Account/DownloadMultiAccountPrint',
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  DownloadMultiAccountDetail(data: any) {
    return this.http.post(
      this.baseUrl + 'Account/DownloadMultiAccountDetail',
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  //END

  //Voucher Printing Start

  GetDaybookAccountTransactions(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetDaybookAccountTransactions',
      data
    );
  }
  DownloadDaybookAccount(data: any) {
    return this.http.post(this.baseUrl + 'Account/DownloadVoucherPrint', data, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }
  //END

  //Voucher Allocation Start
  GetCustomerMasterDropdown() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetCustomerMasterDropdown'
    );
  }
  GetSupplierMasterDropdown() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetSupplierMasterDropdown'
    );
  }
  GetAccountTransactionsVoucherAllocation(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAccountTransactionsVoucherAllocation',
      data
    );
  }
  getAllocationVoucherDetails(accNo: any, refNO: any, vType: any) {
    const body = { accNo, refNO };
    return this.http.post<any>(
      this.baseUrl +
      'Account/GetAllocationDetailsByAccNoRefNo?accNo=' +
      accNo +
      '&refNO=' +
      refNO +
      '&vType=' +
      vType +
      '',
      httpOptions
    );
  }

  getPaymentAllocationVoucherDetails(accNo: any, refNO: any, vType: any) {
    const body = { accNo, refNO };
    return this.http.post<any>(
      this.baseUrl +
      'Account/GetAllocationDetailsByAccNoRefNoPayment?accNo=' +
      accNo +
      '&refNO=' +
      refNO +
      '&vType=' +
      vType +
      '',
      httpOptions
    );
  }

  DownloadVoucherAllocation(data: any) {
    return this.http.post(this.baseUrl + 'Account/DownloadVoucherPrint', data, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }

  AddEditVoucherAllocation(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/AddEditVoucherAllocation',
      data
    );
  }

  ReleaseVoucherAllocation(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/release-allocations',
      data
    );
  }

  GetSpecificVoucherAllocation(id: any) {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetSpecificVoucherAllocation?id=' + id
    );
  }
  GetVoucherAllocationsGridList(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetVoucherAllocationsList',
      data
    );
  }
  DeleteAllocationVoucher(Id, type) {
    // return this.http.delete<ApiResponse<any>>(this.baseUrl + 'Account/DeleteAllocationVoucher?id='+Id,type);
    const url = `${this.baseUrl}Account/DeleteAllocationVoucher?id=${Id}&type=${type}`;
    return this.http.delete<ApiResponse<any>>(url);
  }
  //END

  //Start Outstanding Statement
  GetCustomerSupplierMasterGroup() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetCustomerSupplierMasterGroup'
    );
  }
  GetOutstandingStatementAccountTransactions(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetOutstandingStatementAccountTransactions',
      data
    );
    //return this.http.post<ApiResponse<any>>(this.baseUrl + 'Account/GetOutstandingReportGrid', data);
  }
  OutstandingStatementPrint(data: any) {
    return this.http.post(
      this.baseUrl + 'Account/OutstandingStatementPrint',
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  //END

  //Start OLD Balance SHeet

  AddEditRecordsInBalanceSheet(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/AddEditRecordsInBalanceSheet',
      data
    );
  }



  GetBalanceSheetList(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetBalanceSheetList',
      data
    );
  }
  DownloadOldBalanceSheetAccount(data: any) {
    return this.http.post(
      this.baseUrl + 'Account/DownloadOldBalanceSheetAccount',
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  //END
  //Start OLD Balance SHeet

  GetDistinctVoucherType() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetDistinctVoucherType'
    );
  }
  GetVatStatementDetail(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetVatStatementDetail',
      data
    );
  }
  GetVatStatementSummary(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetVatStatementSummary',
      data
    );
  }
  DownloadVatStatementAccount(data: any) {
    return this.http.post(
      this.baseUrl + 'Account/DownloadOldBalanceSheetAccount',
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  //END

  public ProfitAnalysisLoadDropdown(): Observable<any> {
    return this.http.get<any[]>(
      this.baseUrl + 'Account/ProfitAnalysisLoadDropdown'
    );
  }
  public InvoiceProfitAnalysis(data: any): Observable<any> {
    return this.http.post<any[]>(
      this.baseUrl + 'Account/InvoiceProfitAnalysis',
      data
    );
  }

  //

  GetAgeingReport(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAgeingReport',
      data
    );
  }
  AgeingReportPrint(data: any) {
    return this.http.post(this.baseUrl + 'Account/AgeingReportPrint', data, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }
  //END

  //Asset Opening Start
  GetCurrencyMaster() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetCurrencyMaster'
    );
  }
  GetAssetMaster() {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAssetMaster'
    );
  }

  AddEditAssetOpening(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/AddEditAssetOpening',
      data
    );
  }
  GetAssetOpening(id: any) {
    return this.http.get<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAssetOpening?id=' + id
    );
  }
  GetAssetOpeningList(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/GetAssetOpeningList',
      data
    );
  }
  GetCustomerSummeryStatement(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/ASSummReport',
      data
    );
  }
  GetCustomerDetailsStatement(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Account/ASDetailReport',
      data
    );
  }
  //END
}
