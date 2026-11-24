import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SalesUrls } from './url.api';
import { StoreUrls } from './url.api';
import { ApiResponse } from '../domain/ApiResponse';
import { delay } from 'rxjs/operators';
import { CustomerEnquiry } from '../domain/Sales/CustomerEnquiry';
import { SalesVoucher } from '../domain/Sales/SalesVoucher';
import { SalesReturn } from '../domain/Sales/SalesReturn';
import { IssueVoucher } from '../domain/Sales/IssueVoucher';
import { IssueReturn } from '../domain/Sales/IssueReturn';
import { StockTransfer } from '../domain/Store/StockTransfer';
import { ReportPurchaseVoucher } from '../domain/Store/ReportPurchaseVoucher';
import { OpeningStock } from '../domain/Store/OpeningStock';
import { StockLedgerParameters } from '../domain/Store/StockLedgerParameters';
import { ViewStockTransferType } from '../domain/Store/ViewStockTransferType';
import { ReportStockBaseUnit } from '../domain/Store/ReportStockBaseUnit';
import { Observable } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class StorewarehousesApiService {
  baseUrl: string = environment.apiRootURL;
  constructor(private httpClient: HttpClient) {}

  public InsertStockTransfer(data1: StockTransfer) {
    return this.httpClient.post<ApiResponse<StockTransfer>>(
      this.baseUrl + StoreUrls.InsertStockTransfer,
      data1,
      httpOptions
    );
  }

  public UpdateStockTransfer(data1: StockTransfer) {
    return this.httpClient.post<ApiResponse<StockTransfer>>(
      this.baseUrl + StoreUrls.UpdateStockTransfer,
      data1,
      httpOptions
    );
  }

  public GetSavedStockAdjustmentDetails(id: any) {}

  public DeleteStockTransfer(data1: StockTransfer) {
    return this.httpClient.post<ApiResponse<StockTransfer>>(
      this.baseUrl + StoreUrls.DeleteStockTransfer,
      data1,
      httpOptions
    );
  }

  public GetStockTransfer() {
    return this.httpClient.get<ApiResponse<StockTransfer[]>>(
      this.baseUrl + StoreUrls.GetStockTransfer
    );
  }

  public GetSavedStockTransferDetails(id: string) {
    return this.httpClient.get<ApiResponse<StockTransfer>>(
      this.baseUrl + StoreUrls.GetSavedStockTransferDetails + '/' + id
    );
  }

  public InsertCustomerEnquiry(data1: CustomerEnquiry) {
    return this.httpClient.post<ApiResponse<CustomerEnquiry>>(
      this.baseUrl + SalesUrls.InsertCustomerEnquiry,
      data1,
      httpOptions
    );
  }

  public UpdateCustomerEnquiry(data1: CustomerEnquiry) {
    return this.httpClient.post<ApiResponse<CustomerEnquiry>>(
      this.baseUrl + SalesUrls.UpdateCustomerEnquiry,
      data1,
      httpOptions
    );
  }

  public DeleteCustomerEnquiry(data1: CustomerEnquiry) {
    return this.httpClient.post<ApiResponse<CustomerEnquiry>>(
      this.baseUrl + SalesUrls.DeleteCustomerEnquiry,
      data1,
      httpOptions
    );
  }

  public GetCustomerEnquiry() {
    return this.httpClient.get<ApiResponse<CustomerEnquiry[]>>(
      this.baseUrl + SalesUrls.GetCustomerEnquiry
    );
  }

  public GetSavedCustEnquiryDetails(id: string) {
    return this.httpClient.get<ApiResponse<CustomerEnquiry>>(
      this.baseUrl + SalesUrls.GetSavedCustEnquiryDetails + '/' + id
    );
  }

  // =========================== Sales Voucher
  public InsertSalesVoucher(data1: SalesVoucher) {
    return this.httpClient.post<ApiResponse<SalesVoucher>>(
      this.baseUrl + SalesUrls.InsertSalesVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteSalesVoucher(data1: SalesVoucher) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.DeleteSalesVoucher,
      data1,
      httpOptions
    );
  }
  public UpdateSalesVoucher(data1: SalesVoucher) {
    return this.httpClient.post<ApiResponse<SalesVoucher>>(
      this.baseUrl + SalesUrls.UpdateSalesVoucher,
      data1,
      httpOptions
    );
  }
  public GetSalesVoucher() {
    return this.httpClient.get<ApiResponse<SalesVoucher[]>>(
      this.baseUrl + SalesUrls.GetSalesVoucher
    );
  }
  public GetSavedSalesVoucherDetails(id: string) {
    return this.httpClient.get<ApiResponse<SalesVoucher>>(
      this.baseUrl + SalesUrls.GetSavedSalesVoucherDetails + '/' + id
    );
  }

  public CheckVnoExistSalesVoucher(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + SalesUrls.CheckVnoExistSalesVoucher + '/' + vno
      )
      .pipe(delay(400));
  }
  public GetSalesVoucherForGRN(data: any) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.GetSalesVoucherForGRN,
      data,
      httpOptions
    );
  }

  // public SalesVoucher_GetReportSalesVoucher() {
  //   return this.httpClient.get<ApiResponse<ReportSalesVoucher[]>>(this.baseUrl + AccountsUrls.SalesVoucher_GetReportSalesVoucher);
  // }

  //================================== Sales Return

  public InsertSalesReturn(data1: SalesReturn) {
    return this.httpClient.post<ApiResponse<SalesReturn>>(
      this.baseUrl + SalesUrls.InsertSalesReturn,
      data1,
      httpOptions
    );
  }

  public DeleteSalesReturn(data1: SalesReturn) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.DeleteSalesReturn,
      data1,
      httpOptions
    );
  }
  public UpdateSalesReturn(data1: SalesReturn) {
    return this.httpClient.post<ApiResponse<SalesReturn>>(
      this.baseUrl + SalesUrls.UpdateSalesReturn,
      data1,
      httpOptions
    );
  }

  public GetSalesReturn() {
    return this.httpClient.get<ApiResponse<SalesReturn[]>>(
      this.baseUrl + SalesUrls.GetSalesReturn
    );
  }

  public GetSavedSalesReturnDetails(id: string) {
    return this.httpClient.get<ApiResponse<SalesReturn>>(
      this.baseUrl + SalesUrls.GetSavedSalesReturnDetails + '/' + id
    );
  }

  // public CheckVnoExistSalesReturn(vno: string) {
  //   return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + SalesUrls.CheckVnoExistSalesReturn + '/' + vno).pipe(delay(400));
  // }

  // public SalesReturn_GetReportSalesReturn() {
  //   return this.httpClient.get<ApiResponse<ReportSalesReturn[]>>(this.baseUrl + SalesUrls.SalesReturn_GetReportSalesReturn);
  // }

  ///================================Issue Voucher

  public InsertIssueVoucher(data1: IssueVoucher) {
    return this.httpClient.post<ApiResponse<IssueVoucher>>(
      this.baseUrl + SalesUrls.InsertIssueVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteIssueVoucher(data1: IssueVoucher) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.DeleteIssueVoucher,
      data1,
      httpOptions
    );
  }
  public UpdateIssueVoucher(data1: IssueVoucher) {
    return this.httpClient.post<ApiResponse<IssueVoucher>>(
      this.baseUrl + SalesUrls.UpdateIssueVoucher,
      data1,
      httpOptions
    );
  }

  public GetIssueVoucher() {
    return this.httpClient.get<ApiResponse<IssueVoucher[]>>(
      this.baseUrl + SalesUrls.GetIssueVoucher
    );
  }

  public GetSavedIssueVoucherDetails(id: string) {
    return this.httpClient.get<ApiResponse<IssueVoucher>>(
      this.baseUrl + SalesUrls.GetSavedIssueVoucherDetails + '/' + id
    );
  }

  public CheckVnoExistIssueVoucher(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + SalesUrls.CheckVnoExistIssueVoucher + '/' + vno
      )
      .pipe(delay(400));
  }

  // public IssueVoucher_GetReportIssueVoucher() {
  //  return this.httpClient.get<ApiResponse<ReportIssueVoucher[]>>(this.baseUrl + SalesUrls.IssueVoucher_GetReportIssueVoucher);
  // }

  //========================  Issue Return

  public InsertIssueReturn(data1: IssueReturn) {
    return this.httpClient.post<ApiResponse<IssueReturn>>(
      this.baseUrl + SalesUrls.InsertIssueReturn,
      data1,
      httpOptions
    );
  }

  public DeleteIssueReturn(data1: IssueReturn) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + SalesUrls.DeleteIssueReturn,
      data1,
      httpOptions
    );
  }
  public UpdateIssueReturn(data1: IssueReturn) {
    return this.httpClient.post<ApiResponse<IssueReturn>>(
      this.baseUrl + SalesUrls.UpdateIssueReturn,
      data1,
      httpOptions
    );
  }

  public GetIssueReturn() {
    return this.httpClient.get<ApiResponse<IssueReturn[]>>(
      this.baseUrl + SalesUrls.GetIssueReturn
    );
  }

  public GetSavedIssueReturnDetails(id: string) {
    return this.httpClient.get<ApiResponse<IssueReturn>>(
      this.baseUrl + SalesUrls.GetSavedIssueReturnDetails + '/' + id
    );
  }

  public CheckVnoExistIssueReturn(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + SalesUrls.CheckVnoExistIssueReturn + '/' + vno
      )
      .pipe(delay(400));
  }

  // public IssueReturn_GetReportIssueReturn() {
  //  return this.httpClient.get<ApiResponse<ReportIssueRetur[]>>(this.baseUrl + AccountsUrls.IssueReturn_GetReportIssueReturn);
  // }

  ///==========================================

  /////=========================== Stock

  public MainReport_GetReportStockRegister() {
    return this.httpClient.get<ApiResponse<ReportPurchaseVoucher[]>>(
      this.baseUrl + StoreUrls.MainReport_GetReportStockRegister
    );
  }

  //========================================== Opening Stock

  public InsertOpeningStock(data1: OpeningStock) {
    return this.httpClient.post<ApiResponse<OpeningStock>>(
      this.baseUrl + StoreUrls.InsertOpeningStock,
      data1,
      httpOptions
    );
  }
  public InsertOpeningStockVoucher(data1: OpeningStock) {
    return this.httpClient.post<ApiResponse<OpeningStock>>(
      this.baseUrl + StoreUrls.InsertOpeningStockVoucher,
      data1,
      httpOptions
    );
  }

  public UpdateOpeningStockVoucher(data1: OpeningStock) {
    return this.httpClient.post<ApiResponse<OpeningStock>>(
      this.baseUrl + StoreUrls.UpdateOpeningStockVoucher,
      data1,
      httpOptions
    );
  }

  public GetOpeningStockVoucherDetails(vn: any) {
    return this.httpClient.get<ApiResponse<OpeningStock>>(
      this.baseUrl + StoreUrls.GetSavedOpeningStockVoucherDetails + '/' + vn
    );
  }
  public GetOpeningStockVoucher() {
    return this.httpClient.get<ApiResponse<OpeningStock[]>>(
      this.baseUrl + StoreUrls.GetOpeningStockVOucher
    );
  }
  public UpdateOpeningStock(data1: OpeningStock) {
    return this.httpClient.post<ApiResponse<OpeningStock>>(
      this.baseUrl + StoreUrls.UpdateOpeningStock,
      data1,
      httpOptions
    );
  }

  public DeleteOpeningStock(data1: OpeningStock) {
    return this.httpClient.post<ApiResponse<OpeningStock>>(
      this.baseUrl + StoreUrls.DeleteOpeningStockVoucher,
      data1,
      httpOptions
    );
  }

  public GetOpeningStock() {
    return this.httpClient.get<ApiResponse<OpeningStock[]>>(
      this.baseUrl + StoreUrls.GetOpeningStock
    );
  }

  public GetSavedOpeningStockDetails(id: string) {
    return this.httpClient.get<ApiResponse<OpeningStock>>(
      this.baseUrl + StoreUrls.GetSavedOpeningStockDetails + '/' + id
    );
  }

  public MainReport_GetReportStockLedger_PARAM_CLASS(
    data1: StockLedgerParameters
  ) {
    return this.httpClient.post<ApiResponse<ReportStockBaseUnit[]>>(
      this.baseUrl + StoreUrls.MainReport_GetReportStockLedger_PARAM_CLASS,
      data1
    );
  }
  public MainReport_GetViewStockTransferType() {
    return this.httpClient.get<ViewStockTransferType[]>(
      this.baseUrl + StoreUrls.MainReport_GetAccountsTransactions_VoucherType
    );
  }

  //========================================== Stock Ledger
  public StockLedger(data: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl + StoreUrls.StockLedger_GetStockLedger,
      data
    );

    // return this.httpClient.post<ApiResponse<any[]>(this.baseUrl + StoreUrls.StockLedger_GetStockLedger, data);
  }
  public StockAgeingReport(data: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl + StoreUrls.StockLedger_GetStockAgeingReport,
      data
    );
  }
  public StockLedger_LoadDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + StoreUrls.StockLedger_LoadDropdown
    );
  }
}
