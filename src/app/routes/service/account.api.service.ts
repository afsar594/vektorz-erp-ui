import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ChartofAccounts, ReceiptVoucher } from '../domain';
import { ApiResponse } from '../domain/ApiResponse';
import { catchError, delay, finalize, tap } from 'rxjs/operators';
import { PDCList, PDCPostedList } from '../domain/PDCList';
import {
  AccountsTransactionsURL,
  AccountsUrls,
  DebitUrl,
  JVUrl,
  JournalVoucherURL,
  MasterUrls,
  PDCURL,
  PVUrl,
  PurchaseJournalUrl,
  RVUrl,
} from './url.api';
import { AccountsTransactions } from '../domain/Accounts/AccountsTransactions';
import { PaymentVoucher } from '../domain/Accounts/PaymentVoucher';
import { MasterAccountsTable } from '../domain/Masters/MasterAccountsTable';
import { BankPaymentVoucher } from '../domain/Accounts/BankPaymentVoucher';
import { BankReceiptVoucher } from '../domain/Accounts/BankReceiptVoucher';
import { JobInvoice } from '../domain/Accounts/JobInvoice';
import { Observable } from 'rxjs';
import { PaymentRequest } from '../domain/Accounts/PaymentRequest';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class AccountApiService {
  // LoadDesignationDropdown() {
  //   throw new Error('Method not implemented.');
  // }

  baseUrl: string = environment.apiRootURL;

  AccountsTransactionsArray: any[] = [];
  AccountsTransactionsDuplicateArray: any[] = [];
  CashOrBankAccountArray: any[] = [];
  BankStatementSummary: any[] = [];
  PDCPostedList: any[] = [];
  PDCPostedListDuplicate: any[] = [];
  PDCList: any[] = [];
  PDCListDuplicate: any[] = [];
  AccountsList: ChartofAccounts[];
  JournalVoucherList: Object;
  JVTRackingList: Object;
  PurchaseJVTRackingList: Object;

  constructor(private httpClient: HttpClient) { }
  public GetAllAcountsWithSubs() {
    this.httpClient
      .get<ApiResponse<ChartofAccounts[]>>(
        this.baseUrl + AccountsUrls.GetAllAccounts
      )
      .subscribe((k) => {
        this.AccountsList = k.result;
      });
  }
  public getVno() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetVno
    );
  }
  GetPaymentRequests(): Observable<PaymentRequest[]> {
    return this.httpClient.get<PaymentRequest[]>(
      `${this.baseUrl}paymentrequest/GetPaymentRequests`
    );
  }

  InsertPaymentRequest(
    paymentRequest: PaymentRequest
  ): Observable<PaymentRequest> {
    return this.httpClient.post<PaymentRequest>(
      `${this.baseUrl}paymentrequest/InsertPaymentRequest`,
      paymentRequest
    );
  }

  UpdatePaymentRequest(
    paymentRequest: PaymentRequest
  ): Observable<PaymentRequest> {
    return this.httpClient.put<PaymentRequest>(
      `${this.baseUrl}paymentrequest/UpdatePaymentRequest`,
      paymentRequest
    );
  }

  DeletePaymentRequest(paymentRequest: PaymentRequest): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseUrl}paymentrequest/DeletePaymentRequest`,
      paymentRequest
    );
  }

  GetSavedPaymentRequestDetails(prNo: number): Observable<PaymentRequest> {
    return this.httpClient.get<PaymentRequest>(
      `${this.baseUrl}paymentrequest/GetSavedPaymentRequestDetails/${prNo}`
    );
  }
  public saveJobInvoice(payload) {
    return this.httpClient.post<ApiResponse<JobInvoice>>(
      this.baseUrl + 'JobInvoice/InsertJobInvoice',
      payload
    );
  }

  public updateJobInvoiceItem(payload) {
    return this.httpClient.post(
      this.baseUrl + 'JobInvoice/UpdateJobInvoice',
      payload
    );
  }
  public getJobinvoice() {
    return this.httpClient.get<ApiResponse<JobInvoice>>(
      this.baseUrl + 'JobInvoice/GetJobInvoice'
    );
  }
  public getJobinvoiceDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'JobInvoice/JobInvoiceLoadDropdown'
    );
  }
  public getPdcList() {
    return this.httpClient.get<Array<PDCList>>(this.baseUrl + 'PDC/PDCGetList');
  }
  public getReturnList() {
    return this.httpClient.get<Array<PDCPostedList>>(
      this.baseUrl + 'PDC/PDCReturnList'
    );
  }
  public getPdcPostedReturnList(chequeStatus: any) {
    return this.httpClient.get<Array<PDCPostedList>>(
      `${this.baseUrl}PDC/PDCPostedReturnList/${chequeStatus}`
    );
  }
  public getPdcReturnedList() {
    return this.httpClient.get(this.baseUrl + 'PDC/GetPDCReturnedList');
  }
  public getPdcFilteredList(payload: any) {
    return this.httpClient.post<Array<PDCList>>(
      this.baseUrl + 'PDC/getFilteredPDCList',
      payload
    );
  }
  public getPdcFilteredReturnList(payload: any) {
    return this.httpClient.post<Array<PDCList>>(
      this.baseUrl + 'PDC/PDCGetReturnList',
      payload
    );
  }

  public PostPdcList(payload: any[]) {
    return this.httpClient.post<Array<PDCList>>(
      this.baseUrl + 'PDC/PostPDC',
      payload
    );
  }
  public ReleasePostedPdcList(payload: any[]) {
    return this.httpClient.post<Array<PDCList>>(
      this.baseUrl + 'PDC/ReleasePostPDC',
      payload
    );
  }
  public getBankNamesList() {
    return this.httpClient.get(this.baseUrl + 'PDC/GetBankNames');
  }

  public GetAccountListForDropdown() {
    return this.httpClient.get<Array<MasterAccountsTable>>(
      this.baseUrl + 'BankReconcilation/GetAccountListForDropdown'
    );
  }

  public BankReconcilationGetByVNo(data: any) {
    return this.httpClient.get(
      this.baseUrl + 'BankReconcilation/BankLedger/' + data
    );
  }

  public BankLedger() {
    return this.httpClient.get(this.baseUrl + 'BankReconcilation/BankLedger');
  }
  saveBankReconciliation(data) {
    return this.httpClient.post(
      this.baseUrl + 'BankReconcilation/SaveBankReconciliation',
      data
    );
  }
  getDefaultAcc() {
    return this.httpClient.get(this.baseUrl + 'accountssettings/DEFAULTACC');
  }

  updateBankReconciliation(data) {
    return this.httpClient.post(
      this.baseUrl + 'BankReconcilation/UpdateBankReconciliation',
      data
    );
  }

  public BankReconcilationList() {
    return this.httpClient.get(this.baseUrl + 'BankReconcilation/List');
  }

  public bRById(id) {
    return this.httpClient.get(this.baseUrl + `BankReconcilation/List/${id}`);
  }

  public GetAccountsTransactions() {
    this.httpClient
      .get(this.baseUrl + AccountsTransactionsURL.GetAccountsTransactions)
      .subscribe((res) => {
        this.AccountsTransactionsArray = res as any;
        this.AccountsTransactionsDuplicateArray = res as any;
      });
    this.httpClient
      .get(this.baseUrl + AccountsTransactionsURL.GetAccountsTransactions)
      .subscribe((res) => {
        this.AccountsTransactionsArray = res as any;
        this.AccountsTransactionsDuplicateArray = res as any;
      });
  }

  public GetCashOrBankAccount() {
    this.httpClient
      .get(this.baseUrl + AccountsTransactionsURL.GetCashOrBankAccount)
      .subscribe((res) => {
        this.CashOrBankAccountArray = res as any;
      });
  }

  public GetBankStatementSummary() {
    this.httpClient
      .get(this.baseUrl + AccountsTransactionsURL.GetBankStatementSummary)
      .subscribe((res) => {
        this.BankStatementSummary = res as any;
      });
  }

  GetAccountTransactionsForeignCurrencyDetail(state) {
    return this.httpClient.post(
      this.baseUrl + 'Account/GetAccountTransactionsForeignCurrencyDetail',
      state
    );
  }
  GetAccountTransactionsForeignCurrencySummary(state) {
    return this.httpClient.post(
      this.baseUrl + 'Account/GetAccountTransactionsForeignCurrencySummary',
      state
    );
  }

  public GetAllJournalVoucher() {
    this.httpClient
      .get(this.baseUrl + JournalVoucherURL.GetAllJournalVoucher)
      .subscribe((res) => {
        this.JournalVoucherList = res;
      });
  }

  // asset  AssetsSubMaster/GetAllAssetMasterList

  GetAllAssetMasterList() {
    return this.httpClient.get(
      this.baseUrl + `AssetsSubMaster/GetAllAssetMasterList`
    );
  }

  // asset

  public GenerateGRNNo() {
    return this.httpClient.get(this.baseUrl + `GRN/GenerateVoucherNo`);
  }
  public GetAllGRN() {
    return this.httpClient.get(this.baseUrl + 'GRN/GetAllGRN');
  }

  public LoadDropdownItemGroupMaster(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdownItemGroupMaster'
    );
  }
  public LoadDropdownItemMaster(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdownItemMaster'
    );
  }

  public LoadFilteredItemMaster(data: any): Observable<any> {
    return this.httpClient.post<any[]>(
      this.baseUrl + 'master/item/GetFilteredItems',
      data,
      httpOptions
    );
  }

  public LoadDropdownSuppliersMaster(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdownSuppliersMaster'
    );
  }
  public LoadDropdownunitMasters(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdownunitMasters'
    );
  }
  public LoadDropdowjobMasters(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdowjobMasters'
    );
  }

  public LoadDropdowCurrencyMaster(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdowCurrencyMaster'
    );
  }
  public LoadDropdowchartofAccounts(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdowchartofAccounts'
    );
  }
  public LoadDropdowncostcenterMasters(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdowncostcenterMasters'
    );
  }
  public LoadDropdownLocationMaster(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdownLocationMaster'
    );
  }
  public LoadDropdownBrandMasters(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdownBrandMasters'
    );
  }
  public LoadDropdownaccountsSettings(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GRN/LoadDropdownaccountsSettings'
    );
  }

  public LoadDropdownFinantionPeriod(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'Login/LoadDropdownFPeriod'
    );
  }
  // Sale voucher Dropdown

  public LoadSaleManDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'SalesVoucher/LoadSaleManDropdown'
    );
  }

  public LoadDepartmentDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'SalesVoucher/LoadDepartmentDropdown'
    );
  }
  public LoadCustomerDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'SalesVoucher/LoadCustomerDropdown'
    );
  }

  public getSalesVoucherMonthlyAnalysis(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + 'SalesVoucher/GetSalesVoucherMonthlyAnalysis',
      data
    );
  }

  public LoadDropdownGRN(): Observable<any> {
    return this.httpClient.get<any[]>(this.baseUrl + 'GRN/LoadDropdown');
  }

  public PurchaseLoadDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'PurchaseOrder/PurchaseLoadDropdown'
    );
  }
  public GetGRNByID(voucherNo: any) {
    return this.httpClient.get(this.baseUrl + 'GRN/GetByID?id=' + voucherNo);
  }
  public LoadDropdownDefaultSettings(): Observable<any> {
    return this.httpClient.get<any[]>(this.baseUrl + 'settings/LoadDropdown');
  }

  public GetAllAcounts() {
    return this.httpClient.get<ApiResponse<ChartofAccounts[]>>(
      this.baseUrl + AccountsUrls.GetAllAccounts
    );
  }
  public GetAllBankAcounts() {
    return this.httpClient.get<ApiResponse<ChartofAccounts[]>>(
      this.baseUrl + AccountsUrls.GetAllBankAccounts
    );
  }
  public GetDefaultCreditDebitAccounts() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetDefaultCreditDebitAccounts
    );
  }
  ////===================== receipt voucher
  public InsertReceiptVoucher(data1: ReceiptVoucher) {
    return this.httpClient.post<ApiResponse<ReceiptVoucher>>(
      this.baseUrl + AccountsUrls.InsertReceiptVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteReceiptVoucher(data1: any) {
    delete data1.trackingData;
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + AccountsUrls.DeleteReceiptVoucher,
      data1,
      httpOptions
    );
  }
  public UpdateReceiptVoucher(data1: ReceiptVoucher) {
    return this.httpClient.post<ApiResponse<ReceiptVoucher>>(
      this.baseUrl + AccountsUrls.UpdateReceiptVoucher,
      data1,
      httpOptions
    );
  }

  public GetReceiptVouchers() {
    return this.httpClient.get<ApiResponse<ReceiptVoucher[]>>(
      this.baseUrl + AccountsUrls.GetReceiptVouchers
    );
  }

  public GetSavedReceiptDetails(id: string) {
    return this.httpClient.get<ApiResponse<ReceiptVoucher>>(
      this.baseUrl + AccountsUrls.GetSavedReceiptDetails + '/' + id
    );
  }

  ////====================== Payment Voucher
  public InsertPaymentVoucher(data1: PaymentVoucher) {
    return this.httpClient.post<ApiResponse<PaymentVoucher>>(
      this.baseUrl + AccountsUrls.InsertPaymentVoucher,
      data1,
      httpOptions
    );
  }

  public DeletePaymentVoucher(data1: PaymentVoucher) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + AccountsUrls.DeletePaymentVoucher,
      data1,
      httpOptions
    );
  }
  public UpdatePaymentVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<PaymentVoucher>>(
      this.baseUrl + AccountsUrls.UpdatePaymentVoucher,
      data1,
      httpOptions
    );
  }

  public GetAllAcountTransactions() {
    return this.httpClient.get<ApiResponse<AccountsTransactions[]>>(
      this.baseUrl + AccountsUrls.GetAllAccountTransaction
    );
  }

  public GetPaymentVouchers() {
    return this.httpClient.get<ApiResponse<PaymentVoucher[]>>(
      this.baseUrl + AccountsUrls.GetPaymentVouchers
    );
  }
  public GetPaymentDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + AccountsUrls.GetPaymentDropdown
    );
  }

  public getbrowsePR(data: any) {
    return this.httpClient.post<ApiResponse<PaymentVoucher>>(
      this.baseUrl + AccountsUrls.BrowsePayments, data
    );
  }

  public GetSavedPaymentDetails(id: string) {
    return this.httpClient.get<ApiResponse<PaymentVoucher>>(
      this.baseUrl + AccountsUrls.GetSavedPaymentDetails + '/' + id
    );
  }
  public GetPaymentAllocationDetails(accNo: string, vType: string) {
    return this.httpClient.get<any>(
      this.baseUrl +
      AccountsUrls.GetPaymentAllocationDetails +
      '?accountNo=' +
      accNo +
      '&voucherNo=' +
      vType +
      ''
    );
  }
  public CheckVnoExist(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + AccountsUrls.CheckVnoExist + '/' + vno
      )
      .pipe(delay(400));
  }
  public GenerateVoucherNo() {
    return this.httpClient.get(this.baseUrl + 'payment/GenerateVoucherNo');
  }

  ////================  Bank Payment Voucher
  public InsertBankPaymentVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.InsertBankPaymentVoucher,
      data1,
      httpOptions
    );
  }

  public UpdateBankPaymentVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.UpdateBankPaymentVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteBankPaymentVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.DeleteBankPaymentVoucher,
      data1,
      httpOptions
    );
  }

  public GetBankPaymentVouchers() {
    return this.httpClient.get<ApiResponse<BankPaymentVoucher[]>>(
      this.baseUrl + AccountsUrls.GetBankPaymentVouchers
    );
  }

  public GetSavedBankPaymentDetails(id: string) {
    return this.httpClient.get<ApiResponse<BankPaymentVoucher>>(
      this.baseUrl + AccountsUrls.GetSavedBankPaymentDetails + '/' + id
    );
  }

  ////=============== Bank receipt voucher

  public InsertBankReceiptVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<BankReceiptVoucher>>(
      this.baseUrl + AccountsUrls.InsertBankReceiptVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteBankReceiptVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + AccountsUrls.DeleteBankReceiptVoucher,
      data1,
      httpOptions
    );
  }
  public UpdateBankReceiptVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<BankReceiptVoucher>>(
      this.baseUrl + AccountsUrls.UpdateBankReceiptVoucher,
      data1,
      httpOptions
    );
  }

  public GetBankReceiptVouchers() {
    return this.httpClient.get<ApiResponse<BankReceiptVoucher[]>>(
      this.baseUrl + AccountsUrls.GetBankReceiptVouchers
    );
  }

  public GetSavedBankReceiptDetails(id: string) {
    return this.httpClient.get<ApiResponse<BankReceiptVoucher>>(
      this.baseUrl + AccountsUrls.GetSavedBankReceiptDetails + '/' + id
    );
  }
  ////========================== Credit Note

  public InsertCreditNote(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.InsertCreditNote,
      data1,
      httpOptions
    );
  }

  public DeleteCreditNote(data1: any) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + AccountsUrls.DeleteCreditNote,
      data1,
      httpOptions
    );
  }
  public UpdateCreditNote(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.UpdateCreditNote,
      data1,
      httpOptions
    );
  }

  public GetCreditNote() {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.GetCreditNote
    );
  }

  public GetSavedCreditNoteDetails(id: string) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetSavedCreditNoteDetails + '/' + id
    );
  }

  public CheckVnoExistCreditNote(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + AccountsUrls.CheckVnoExistCreditNote + '/' + vno
      )
      .pipe(delay(400));
  }

  //================================Debit Note

  public InsertDebitNote(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.InsertDebitNote,
      data1,
      httpOptions
    );
  }

  public DeleteDebitNote(data1: any) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + AccountsUrls.DeleteDebitNote,
      data1,
      httpOptions
    );
  }
  public UpdateDebitNote(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.UpdateDebitNote,
      data1,
      httpOptions
    );
  }

  public GetDebitNote() {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.GetDebitNote
    );
  }

  public GetSavedDebitNoteDetails(id: string) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetSavedDebitNoteDetails + '/' + id
    );
  }
  public CheckVnoExistDebitNote(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + AccountsUrls.CheckVnoExistDebitNote + '/' + vno
      )
      .pipe(delay(400));
  }

  ////==================================== Purchase Journal

  public InsertPurchaseJournal(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.InsertPurchaseJournal,
      data1,
      httpOptions
    );
  }

  public DeletePurchaseJournal(data1: any) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + AccountsUrls.DeletePurchaseJournal,
      data1,
      httpOptions
    );
  }
  public UpdatePurchaseJournal(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.UpdatePurchaseJournal,
      data1,
      httpOptions
    );
  }
  public GenerateJVVoucherNo() {
    return this.httpClient.get<any>(
      this.baseUrl + AccountsUrls.GenerateVoucherNo
    );
  }

  public GetPurchaseJournal() {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.GetPurchaseJournal
    );
  }
  public GetPurchaseJournalDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'PurchaseJournal/LoadDropdown'
    );
  }

  public GetSavedPurchaseJournalDetails(id: string) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetSavedPurchaseJournalDetails + '/' + id
    );
  }

  public CheckVnoExistPurchaseJournal(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + AccountsUrls.CheckVnoExistPurchaseJournal + '/' + vno
      )
      .pipe(delay(400));
  }

  ////============================ sales Journal

  public InsertSalesJournal(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.InsertSalesJournal,
      data1,
      httpOptions
    );
  }

  public DeleteSalesJournal(data1: any) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + AccountsUrls.DeleteSalesJournal,
      data1,
      httpOptions
    );
  }
  public UpdateSalesJournal(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.UpdateSalesJournal,
      data1,
      httpOptions
    );
  }

  public GetSalesJournal() {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.GetSalesJournal
    );
  }

  public GetSavedSalesJournalDetails(id: string) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetSavedSalesJournalDetails + '/' + id
    );
  }
  public CheckVnoExistSalesJournal(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + AccountsUrls.CheckVnoExistSalesJournal + '/' + vno
      )
      .pipe(delay(400));
  }

  //// ==================================== Opening Balance Voucher
  public InsertOBVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.InsertOBVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteOBVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + AccountsUrls.DeleteOBVoucher,
      data1,
      httpOptions
    );
  }
  public UpdateOBVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.UpdateOBVoucher,
      data1,
      httpOptions
    );
  }

  public getFinancialPeriodDate()
  {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + 'getFinancialPeriodDate') 
    
  }

  public getAccounts() {
    return this.httpClient.get<any>(this.baseUrl + AccountsUrls.getAccounts);
  }

  public GetOBVouchers() {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.GetOBVouchers
    );
  }

  public GetSavedOBVoucherDetails(id: string) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetSavedOBVoucherDetails + '/' + id
    );
  }

  public InsertJournalVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.InsertJournalVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteJournalVoucher(data1: any) {
    return this.httpClient.post<any>(
      this.baseUrl + AccountsUrls.DeleteJournalVoucher,
      data1,
      httpOptions
    );
  }

  public UpdateJournalVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.UpdateJournalVoucher,
      data1,
      httpOptions
    );
  }

    public UpdateJournalVoucherOs(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + 'JournalVoucher/UpdateJournalVoucherOs',
      data1,
      httpOptions
    );
  }

  public GetJournalVoucher() {
    return this.httpClient.get<any[]>(
      this.baseUrl + AccountsUrls.GetJournalVoucher
    );
  }

  public GetSavedJournalVoucherDetails(id: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetSavedJournalVoucherDetails + '/' + id
    );
  }

  public CheckVnoExistJournalVoucher(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + AccountsUrls.CheckVnoExistJournalVoucher + '/' + vno
      )
      .pipe(delay(400));
  }

  // /\|
  public InsertDJVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.InsertDJVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteDJVoucher(data1: any) {
    return this.httpClient.post<number>(
      this.baseUrl + AccountsUrls.DeleteDJVoucher,
      data1,
      httpOptions
    );
  }

  public UpdateDJVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.UpdateDJVoucher,
      data1,
      httpOptions
    );
  }

  public GetDJVoucher() {
    return this.httpClient.get<any[]>(this.baseUrl + AccountsUrls.GetDJVoucher);
  }

  public GetSavedDJVoucherDetails(id: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetSavedDJVoucherDetails + '/' + id
    );
  }

  public CheckVnoExistVJournalVoucher(vno: string) {
    return this.httpClient
      .get<ApiResponse<boolean>>(
        this.baseUrl + AccountsUrls.CheckVnoExistDJVoucher + '/' + vno
      )
      .pipe(delay(400));
  }
  //

  public InsertContraVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.InsertContraVoucher,
      data1,
      httpOptions
    );
  }

  public DeleteContraVoucher(data1: any) {
    return this.httpClient.post<number>(
      this.baseUrl + AccountsUrls.DeleteContraVoucher,
      data1,
      httpOptions
    );
  }
  public UpdateContraVoucher(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.UpdateContraVoucher,
      data1,
      httpOptions
    );
  }

  public GetContraVoucher() {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.GetContraVoucher
    );
  }

  public GetSavedContraVoucherDetails(id: string) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetSavedContraVoucherDetails + '/' + id
    );
  }
  public CheckVnoExistContraVoucher(vno: string) {
    return this.httpClient.get<ApiResponse<boolean>>(
      this.baseUrl + AccountsUrls.CheckVnoExistContraVoucher + '/' + vno
    );
  }

  ////============================ Job Invoice

  public InsertJobInvoice(data1: any): any {
    // return this.httpClient.post<ApiResponse<JobInvoice>>(this.baseUrl + AccountsUrls.InsertJobInvoice, data1, httpOptions);
  }

  public DeleteJobInvoice(id: any): any {
    return this.httpClient.get<ApiResponse<number>>(
      this.baseUrl + `JobInvoice/DeleteJobInvoice?Id=${id}`
    );
  }
  public UpdateJobInvoice(data1: any): any {
    return this.httpClient.post<ApiResponse<JobInvoice>>(
      this.baseUrl + `JobInvoice/UpdateJobInvoice`,
      data1,
      httpOptions
    );
  }

  public GetJobInvoice(): any {
    // return this.httpClient.get<ApiResponse<JobInvoice[]>>(this.baseUrl + AccountsUrls.GetJobInvoice);
  }

  GetJobInvoiceVoucherNo(id: string): any {
    return this.httpClient.get<ApiResponse<JobInvoice>>(
      this.baseUrl + `JobInvoice/GetJobInvoiceVoucherNo/${id}`
    );
  }
  public GetSavedJobInvoiceDetails(id: string): any {
    return this.httpClient.get<ApiResponse<JobInvoice>>(
      this.baseUrl + `JobInvoice/GetJobInvoiceById?id=${id}`
    );
  }
  public CheckVnoExistJobInvoice(vno: string): any {
    // return this.httpClient.get<ApiResponse<boolean>>(this.baseUrl + AccountsUrls.CheckVnoExistJobInvoice + '/' + vno).pipe(delay(400));
  }

  //============================================ Statement of Accounts
  public MainReport_GetReportAccountsTransactions(
    AccNo: string,
    Location: number,
    Job: number,
    CostCenter: number
  ) {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl +
      AccountsUrls.MainReport_GetReportAccountsTransactions +
      '/' +
      AccNo +
      '/' +
      Location +
      '/' +
      Job +
      '/' +
      CostCenter
    );
  }

  public MainReport_GetReportAccountsTransactions_PARAM_CLASS(data1: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl +
      AccountsUrls.MainReport_GetReportAccountsTransactions_PARAM_CLASS,
      data1
    );
  }
  public GetAccountIdByVoucherNo(data1: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl +
      `MainReport/GetAccountIdByVoucherNo?type=${data1.type}&voucherNo=${data1.voucherNo}`,
      data1
    );
  }

  public getvoucherIdbyNo(data: any) {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl + `MainReport/getvoucherIdbyNo`
    );
  }
  public CustomerStattemnetbySummery(data1: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.CustomerStattemnetbySummery,
      data1
    );
  }

  public AccountTransactionsHistory(data1: any) {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl +
      AccountsUrls.AccountTransactionsHistory +
      `?accountNumber=${data1.accountNumber}&dateFrom=${data1.dateFrom}&dateTo=${data1.dateTo}&location=${data1.location??0}&costcenterId=${data1.costcenterId??0}&jobId=${data1.jobId??0}`
    );
  }

  public MainReport_GetAccountsTransactions_VoucherType() {
    return this.httpClient.get<any[]>(
      this.baseUrl + AccountsUrls.MainReport_GetAccountsTransactions_VoucherType
    );
  }
  public MainReport_GetAccountsTransactionsLoadDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + AccountsUrls.MainReport_GetAccountsTransactionsLoadDropdown
    );
  }

  public MainReport_GetReportSalesVoucher_PARAM_CLASS(data1: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.MainReport_GetReportSalesVoucher_PARAM_CLASS,
      data1
    );
  }

  public MainReport_GetReportPurchaseVoucher_PARAM_CLASS(data1: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl +
      AccountsUrls.MainReport_GetReportPurchaseVoucher_PARAM_CLASS,
      data1
    );
  }
  public MainReport_GetReportPurchaseOrder_PARAM_CLASS(data1: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl +
      AccountsUrls.MainReport_GetReportPurchaseOrder_PARAM_CLASS,
      data1
    );
  }

  public GetPurchaseOrderMonthlyAnalysis(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + 'MainReport/PurchaseOrderMonthlyAnalysis',
      data1
    );
  }

  public GetPurchaseVoucherMonthlyAnalysis(data1: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + 'MainReport/PurchaseVoucherMonthlyAnalysis',
      data1
    );
  }

  public ReportPurchaseOrderSummary(data1: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.ReportPurchaseOrderSummary,
      data1
    );
  }
  public RequisitionReportDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'PurchaseRequisitionReports/RequisitionReportDropdown'
    );
  }
  public MainReport_GetReportPurchaseRequisition_PARAM_CLASS(data1: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl +
      AccountsUrls.MainReport_GetReportPurchaseRequisition_PARAM_CLASS,
      data1
    );
  }

  public MainReport_GetReportProjectStatus_PARAM_CLASS(data1: any) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.MainReport_GetReportProjectStatus_PARAM_CLASS,
      data1
    );
  }

  public GetReportPurchaseRequisition(data) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl + AccountsUrls.GetReportPurchaseRequisition,
      data
    );
  }

  GetStatementOfAccountSummary(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.StatementOfAccountSummaryResponse,
      data
    );
  }
  //Account Statement Work Started
  GetAccountMasterDropdown() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAccountMasterDropdown
    );
  }
  GetJobMasterDropdown() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetJobMasterDropdown
    );
  }
  GetAccountTransactions(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAccountTransactions,
      data
    );
  }
  DownloadAccountStatement(data: any) {
    return this.httpClient.post(
      this.baseUrl + AccountsUrls.DownloadAccountStatement,
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
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetVoucherTypeDropdown
    );
  }
  GetVoucherNoDropdown() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetVoucherNoDropdown
    );
  }
  GetAccountTransactionsVoucherPrint(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAccountTransactionsVoucherPrint,
      data
    );
  }
  DownloadVoucherPrint(data: any) {
    return this.httpClient.post(
      this.baseUrl + AccountsUrls.DownloadVoucherPrint,
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
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAccountMaster + filter
    );
  }
  GetAccountMasterGroup() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAccountMasterGroup
    );
  }
  GetAccountTransactionsMultiAccountSummary(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAccountTransactionsMultiAccountSummary,
      data
    );
  }
  DownloadMultiAccountSummary(data: any) {
    return this.httpClient.post(
      this.baseUrl + AccountsUrls.DownloadMultiAccountSummary,
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  GetAccountTransactionsMultiAccountDetail(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAccountTransactionsMultiAccountDetail,
      data
    );
  }
  DownloadMultiAccountDetail(data: any) {
    return this.httpClient.post(
      this.baseUrl + AccountsUrls.DownloadMultiAccountDetail,
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
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetDaybookAccountTransactions,
      data
    );
  }
  DownloadDaybookAccount(data: any) {
    return this.httpClient.post(
      this.baseUrl + AccountsUrls.DownloadVoucherPrint,
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  //END

  //Voucher Allocation Start
  GetCustomerMasterDropdown() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetCustomerMasterDropdown
    );
  }
  GetSupplierMasterDropdown() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetSupplierMasterDropdown
    );
  }
  GetAccountTransactionsVoucherAllocation(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAccountTransactionsVoucherAllocation,
      data
    );
  }
  DownloadVoucherAllocation(data: any) {
    return this.httpClient.post(
      this.baseUrl + AccountsUrls.DownloadVoucherPrint,
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  AddEditVoucherAllocation(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.AddEditVoucherAllocation,
      data
    );
  }
  GetSpecificVoucherAllocation(id: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetSpecificVoucherAllocation + id
    );
  }
  GetVoucherAllocationsGridList(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetVoucherAllocationsGridList,
      data
    );
  }
  //END

  //Start Outstanding Statement
  GetCustomerSupplierMasterGroup() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetCustomerSupplierMasterGroup
    );
  }
  GetOutstandingStatementAccountTransactions(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetOutstandingStatementAccountTransactions,
      data
    );
  }
  OutstandingStatementPrint(data: any) {
    return this.httpClient.post(
      this.baseUrl + AccountsUrls.OutstandingStatementPrint,
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
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.AddEditRecordsInBalanceSheet,
      data
    );
  }
  GetBalanceSheetList(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetBalanceSheetList,
      data
    );
  }
  DownloadOldBalanceSheetAccount(data: any) {
    return this.httpClient.post(
      this.baseUrl + AccountsUrls.DownloadOldBalanceSheetAccount,
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  //END

  //Ageing Report

  GetAgeingReport(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAgeingReport,
      data
    );
  }
  AgeingReportPrint(data: any) {
    return this.httpClient.post(
      this.baseUrl + AccountsUrls.AgeingReportPrint,
      data,
      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }
  //END

  //Asset Opening Start
  GetCurrencyMaster() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + MasterUrls.GetAllCurrency
    );
  }
  GetAssetMaster() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAssetMaster
    );
  }

  AddEditAssetOpening(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.AddEditAssetOpening,
      data
    );
  }
  GetAssetOpening(id: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAssetOpening + id
    );
  }
  GetAssetOpeningList(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAssetOpeningList,
      data
    );
  }

  public PDCissuedLists() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + PDCURL.PDCissuedLists
    );
    // this.httpClient.get(this.baseUrl + PDCURL.GetPDCPostedList).subscribe(res => {
    //   this.PDCPostedList = res as any
    //   this.PDCPostedListDuplicate = res as any
    // });
  }

  public GetPDCGetList() {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + PDCURL.GetPDCGetList
    );
  }
  public GetJVTRacking(JournalVoucher_VNO) {
    this.httpClient
      .get(this.baseUrl + AccountsUrls.GetJVTRacking + JournalVoucher_VNO)
      .subscribe((res) => {
        this.JVTRackingList = res;
      });
  }

  public GetPurchaseJVTRacking(JournalVoucher_VNO) {
    this.httpClient
      .get(
        this.baseUrl + AccountsUrls.GetPurchaseJVTRacking + JournalVoucher_VNO
      )
      .subscribe((res) => {
        this.PurchaseJVTRackingList = res;
      });
  }

  public GeneratePVNo(date?: any) {
    return this.httpClient.get(this.baseUrl + PVUrl.GenerateVoucherNo + null);
  }

  public GenerateJVNo() {
    return this.httpClient.get(this.baseUrl + JVUrl.GenerateVoucherNo);
  }

  public GeneratePJNo() {
    return this.httpClient.get(
      this.baseUrl + PurchaseJournalUrl.GenerateVoucherNo
    );
  }

  public GenerateCNNo() {
    return this.httpClient.get(this.baseUrl + 'CreditNote/GenerateVoucherNo');
  }

  public GenerateContraNo() {
    return this.httpClient.get(
      this.baseUrl + 'ContraVoucher/GenerateVoucherNo'
    );
  }

  public GenerateBankReceiptNo() {
    return this.httpClient.get(this.baseUrl + 'bankreceipt/GenerateVoucherNo');
  }

  public GenerateBankPaymentNo() {
    return this.httpClient.get(this.baseUrl + 'bankPayment/GenerateVoucherNo');
  }

  public GetAllocationDetails(accountNo: string, voucherNo: string) {
    return this.httpClient.get(
      this.baseUrl +
      AccountsUrls.GetAllocationDetails +
      'accountNo?=' +
      accountNo +
      '&voucherNo=' +
      voucherNo
    );
  }

  public GenerateRVNo() {
    return this.httpClient.get(this.baseUrl + RVUrl.GenerateVoucherNo);
  }

  public GenerateDebitNo() {
    return this.httpClient.get(this.baseUrl + DebitUrl.GenerateVoucherNo);
  }

  public GetUserTracking(voucherNo: any) {
    return this.httpClient.get(
      this.baseUrl + PVUrl.GetUserTracking + voucherNo
    );
  }

  //END
  public GenerateSalesVoucherNo() {
    return this.httpClient.get(this.baseUrl + 'SalesVoucher/GenerateVoucherNo');
  }
  public GenerateReciptVoucherNo() {
    return this.httpClient.get(this.baseUrl + 'receipt/GenerateVoucherNo');
  }
  public GenerateSalesReturnNo() {
    return this.httpClient.get(this.baseUrl + 'SalesReturn/GenerateVoucherNo');
  }
  ///-------------------------------------------------------  END

  public addAssetPurchase(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.InsertAssetPurchase,
      data
    );
  }
  public GetAllAssetPurchase() {
    return this.httpClient.get(this.baseUrl + AccountsUrls.GetAllAssetPurchase);
  }
  public GetSavedAssetPurchaseDetails(id: string) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + AccountsUrls.GetAssetVoucherDetails + '/' + id
    );
  }
  public UpdateAssetPurchase(payload) {
    return this.httpClient.post(
      this.baseUrl + 'AssetPurchase/UpdateAssetPurchase',
      payload
    );
  }
  public DeleteAssetPurchase(data1) {
    return this.httpClient.post<any>(
      this.baseUrl + AccountsUrls.DeleteAssetPurchase,
      data1,
      httpOptions
    );
  }
  GetAllocationforPrint(id: number) {
    const url = `${this.baseUrl}Account/getAllocationforPrint?Id=${id}`;
    return this.httpClient.get<any>(url);
  }
  public getJobInvoice(payload) {
    return this.httpClient.post(
      this.baseUrl + 'JobInvoice/JobInvoiceReport',
      payload
    );
  }
  public LoaAccountsforcash(): Observable<any> {
    return this.httpClient.get<any[]>(this.baseUrl + 'GRN/LoaAccountsforcash');
  }
  public LoaAccountsforbank(): Observable<any> {
    return this.httpClient.get<any[]>(this.baseUrl + 'GRN/LoaAccountsforbank');
  }

  public GetBillofQtyTracking(jobNo: any, fromdate: any, toDate: any) {
    let params = [];

    if (jobNo) {
      params.push(`jobNo=${jobNo}`);
    }
    if (fromdate && toDate) {
      params.push(`fromDate=${fromdate}`);
      params.push(`toDate=${toDate}`);
    }

    const queryString = params.length ? `?${params.join('&')}` : '';
    return this.httpClient.get<any[]>(
      `${this.baseUrl}GetBillofQtyTracking${queryString}`
    );
  }
}
