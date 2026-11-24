import { CustomerMaster } from './../domain/Masters/CustomerMaster';
import { SalesManMaster } from './../domain/Masters/SalesManMaster';
import { LocationMaster } from './../domain/Masters/LocationMaster';
import { BusinessTypeMaster } from './../domain/Masters/BusinessTypeMaster';
import { ProjectDescriptionMaster } from './../domain/Masters/ProjectDescriptionMaster';
import {
  BudgetMaster,
  CityMaster,
  CountryMaster,
  SupplierMaster,
  DepartmentMaster,
  User,
  WorkGroup,
  ChartofAccounts,
} from 'src/app/routes/domain';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CurrencyMaster, ItemMaster } from '../domain';
import {
  auth,
  AccountsUrls,
  MasterUrls,
  PurchaseVoucherURL,
  TaxMasterUrls,
  UserUrls,
  WorkGroupUrls,
} from './url.api';
import { environment } from 'src/environments/environment';
import { TreeNode } from 'primeng/api/treenode';
import { JobMaster, JobStatusReportFilter } from '../domain/Masters/JobMaster';
import { CostCenterMaster } from '../domain/Masters/CostCenterMaster';
import { ApiResponse } from '../domain/ApiResponse';
import { VendorMaster } from '../domain/Masters/VendorMaster';
import { ItemStockType } from '../domain/ItemStockType';
import { ItemSupplierDetails } from '../domain/ItemSupplierDetails';
import { UnitMaster } from '../domain/Masters/UnitMaster';
import { PriceLevelMaster } from '../domain/Masters/PriceLevelMaster';
import { EnquiryAbount } from '../domain/Sales/EnquiryAbout';
import { EnquiryStatus } from '../domain/Sales/EnquiryStatus';
import { FinancialPeriods } from '../domain/FinancialPeriods';
import { TermsandCondition } from '../domain/Masters/TermsandCondition';

import { WorkGroupMaster } from '../domain/Masters/WorkGroupMaster';
import { TypeMaster } from '../domain/Masters/TypeMaster';
import { ModelMaster } from '../domain/Masters/ModelMaster';

import { ItemFilter } from '../domain/Masters/ItemFilter';
import { CustomerTypeMaster } from '../domain/Masters/CustomerTypeMaster';
import { NewCustomerMaster } from '../domain/Masters/NewCustomerMaster';
import { BankGuaranteeMaster } from '../domain/Masters/BankGuaranteeMaster';
import { ProgramSettings } from '../domain/Settings/program';
import { GeneralSettings } from '../domain/Settings/general';
import { StationMaster } from '../domain/Administration/StationMaster';
import { TaxMaster } from '../domain/Masters/TaxMaster';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { ReportFilterModel } from '../domain/Masters/ReportFilterModel';
import { TemplateMaster } from '../domain/Masters/TemplateMaster';
import { optionsettings } from '../domain/Settings/optionsettings';
import { accountSetting } from '../domain/Settings/accountSettings';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { CredentialKeys } from '../Enums/loginInfo';
import { catchError, tap } from 'rxjs/operators';
import { debug } from 'console';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root',
})
export class MasterApiService {



  private cache: { [key: string]: ApiResponse<any[]> } = {};
  private cacheForItemMaster: ApiResponse<ItemMaster[]> | null = null;
  baseUrl: string = environment.apiRootURL;
  reportBasUrl: string = environment.reportApiUrl;
  TaxMasterArray: TaxMaster[]= [];
  ItemMasterArray: ItemMaster[] = [];
  DepartmentMasterArray: DepartmentMaster[] = [];
  JobMasterArray: JobMaster[] = [];
  CostCentreArray: CostCenterMaster[] = [];
  OptionsMasterArray: any[] = [];
  PurchaseVoucherDetailsArray: any[] = [];
  PurchaseVoucherArray: any[] = [];
  private dataSubject = new Subject<any>(); // Using Subject for communication

  constructor(
    private httpClient: HttpClient,
    private storage: LocalStorageService
  ) { }
  data$ = this.dataSubject.asObservable(); // Observable to subscribe to

  sendData(data: any) {
    this.dataSubject.next(data); // Send data to subscribers
  }
  SaveNewAssetGroup(reqG: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + 'Account/SaveNewAssetGroup',
      reqG,
      httpOptions
    );
  }
  General(type: string) {
    return this.httpClient.get<any>(
      this.baseUrl + `General?type=${type}`
    );
  }
  GetLastItemsThreePrices(reqG: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + 'master/item/GetLastItemsThreePrices',
      reqG,
      httpOptions
    );
  }

  GererateRetentionAndAdvanceAcc(customerNO: any) {
    return this.httpClient.post<any>(
      this.baseUrl + `Account/GenerateRetentionAndAdvanceAcc/${customerNO}`, null
    );
  }
  GetRetentionAndAdvanceAcc(customerNO: any) {
    return this.httpClient.get<any>(
      this.baseUrl + `Customer/GetCustomerAccounts?customerId=${customerNO}`
    );
  }

  EditAssetGroup(reqG: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + 'Account/EditAssetGroup',
      reqG,
      httpOptions
    );
  }
  SaveNewAssetHead(reqG: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + 'Account/SaveNewAssetHead',
      reqG,
      httpOptions
    );
  }

  EditAssetHead(reqG: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + 'Account/EditAssetHead',
      reqG,
      httpOptions
    );
  }

  getNotifications(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseUrl}notifications`);
  }

  markNotificationAsReaded(data: any): Observable<any[]> {
    return this.httpClient.post<any>(
      `${this.baseUrl}Notifications/${data.notificationId}`,
      data,
      httpOptions
    );
  }

  markAllNotificationAsReaded(data: any): Observable<any> {
    return this.httpClient.post<any>(
      `${this.baseUrl}Notifications/MarkAllAsReaded`,
      data,
      httpOptions
    );
  }


  public GetAllCurrency() {
    return this.httpClient.get<CurrencyMaster[]>(
      this.baseUrl + MasterUrls.GetAllCurrency
    );
  }

  public AssetRegister(data: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + '/master/AssetRegister',
      data
    );
  }
  public CheckVoucherExists(voucherType: string, voucherNumber: string) {
    return this.httpClient.get<any[]>(
      this.baseUrl +
      `/JobInvoice/CheckVoucherExists?voucherType=${voucherType}&voucherNumber=${voucherNumber}`
    );
  }

  GetAveragePurchasePriceGPC(data: any) {
    return this.httpClient.post<any>(
      this.baseUrl +
      `StockReport/GetAveragePurchasePriceGPC?itemId=${data.itemId}&unitDetailId=${data.unitDetailId}&quantity=${data.quantity}`,
      httpOptions
    );
  }

  public GetAllCustomerById(id: string) {
    return this.httpClient.get<ApiResponse<NewCustomerMaster>>(
      this.baseUrl + MasterUrls.GetAllCustomerById + '/' + id
    );
  }

  public GetCustomers() {
    return this.httpClient.get<ApiResponse<NewCustomerMaster[]>>(
      this.baseUrl + MasterUrls.GetCustomer
    );
  }

  public GetAllJob(): Observable<any> {
    return this.httpClient.get<any[]>(this.baseUrl + MasterUrls.GetAllJob);
  }
  public GetJobDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(this.baseUrl + MasterUrls.JobDropdown);
  }

  getItemBarcode(barcode:any) {
    return this.httpClient.get<ItemMaster[]>(
      this.baseUrl + MasterUrls.GetAllItemMasterByBarCode + '/' + barcode
    );
  }

  public GetAllJobMaster() {
    return this.httpClient.get<ApiResponse<JobMaster[]>>(
      this.baseUrl + MasterUrls.GetJobMaster
    );
  }

  public GetAllCostCenter() {
    return this.httpClient.get<CostCenterMaster[]>(
      this.baseUrl + MasterUrls.GetAllCostCenter
    );
  }

  public InsertCostCenter(data: CostCenterMaster) {
    return this.httpClient.post<CostCenterMaster[]>(
      this.baseUrl + MasterUrls.InsertCostCenter,
      data,
      httpOptions
    );
  }
  public UpdateCostCenter(data: CostCenterMaster) {
    return this.httpClient.post<CostCenterMaster[]>(
      this.baseUrl + MasterUrls.UpdateCostCenter,
      data,
      httpOptions
    );
  }
  public DeleteCostCenter(data: CostCenterMaster) {
    return this.httpClient.post<CostCenterMaster[]>(
      this.baseUrl + MasterUrls.DeleteCostCenter,
      data,
      httpOptions
    );
  }

  public GetAllWorkGroup() {
    return this.httpClient.get<WorkGroupMaster[]>(
      this.baseUrl + WorkGroupUrls.GetAllWorkGroup
    );
  }

  public InsertWorkGroup(data: WorkGroupMaster) {
    return this.httpClient.post<WorkGroupMaster[]>(
      this.baseUrl + MasterUrls.InsertWorkGroup,
      data,
      httpOptions
    );
  }
  public UpdateWorkGroup(data: WorkGroupMaster) {
    return this.httpClient.post<WorkGroupMaster[]>(
      this.baseUrl + MasterUrls.UpdateWorkGroup,
      data,
      httpOptions
    );
  }
  public DeleteWorkGroup(data: WorkGroupMaster) {
    return this.httpClient.post<WorkGroupMaster[]>(
      this.baseUrl + MasterUrls.DeleteWorkGroup,
      data,
      httpOptions
    );
  }

  public GetAllTypeMast() {
    return this.httpClient.get<TypeMaster[]>(
      this.baseUrl + MasterUrls.GetAllTypeMast
    );
  }

  public InsertTypeMast(data: TypeMaster) {
    return this.httpClient.post<TypeMaster[]>(
      this.baseUrl + MasterUrls.InsertTypeMast,
      data,
      httpOptions
    );
  }
  public UpdateTypeMast(data: TypeMaster) {
    return this.httpClient.post<TypeMaster[]>(
      this.baseUrl + MasterUrls.UpdateTypeMast,
      data,
      httpOptions
    );
  }
  public DeleteTypeMast(data: TypeMaster) {
    return this.httpClient.post<TypeMaster[]>(
      this.baseUrl + MasterUrls.DeleteTypeMast,
      data,
      httpOptions
    );
  }
  // Asset Master
  public getassetmaster() {
    return this.httpClient.get<any[]>(this.baseUrl + 'Account/GetAssetMaster');
  }

  AddEditAssetMaster(data: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + 'Account/AddEditAssetMaster',
      data
    );
  }
  GetFixedAccountForAssetMaster(data: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + 'Account/GetFixedAccountForAssetMaster',
      data
    );
  }
  GetFixedAssets(no: string) {
    return this.httpClient.get<any[]>(
      this.baseUrl + `Assets/GetFixedAssets?relativeNo=${no}`
    );
  }
  // templates

  GetRelativeAccountAssetMaster(id: number) {
    return this.httpClient.get<any[]>(
      this.baseUrl + `Account/GetRelativeAccountAssetMaster?accNo=${id}`
    );
  }

  getAllActiveTemplates() {
    return this.httpClient.get<TemplateMaster[]>(
      this.baseUrl + 'Templates/GetAllActiveTemplates'
    );
  }
  getAllTemplates() {
    return this.httpClient.get<TemplateMaster[]>(
      this.baseUrl + 'Templates/GetAllTemplates'
    );
  }

  GetTemplateById(id: number) {
    return this.httpClient.get<TemplateMaster[]>(
      this.baseUrl + `Templates/GetTemplateById/${id}`
    );
  }
  GetTemplateBytype(type: string) {
    return this.httpClient.get<TemplateMaster[]>(
      this.baseUrl + `Templates/GetTemplateBytype/${type}`
    );
  }
  DeleteTemplate(id: number) {
    return this.httpClient.post<TemplateMaster[]>(
      this.baseUrl + `Templates/DeleteTemplate/${id}`,
      null
    );
  }

  InsterTemplate(template: TemplateMaster) {
    return this.httpClient.post<TemplateMaster[]>(
      this.baseUrl + 'Templates/InsterTemplate',
      template
    );
  }
  UpdateTemplate(template: TemplateMaster) {
    return this.httpClient.post<TemplateMaster[]>(
      this.baseUrl + 'Templates/UpdateTemplate',
      template
    );
  }

  // get Menu
  getMenuByGroup(id: number) {
    return this.httpClient.post<ApiResponse<any[]>>(
      this.baseUrl + `Setting/GetMenusByWorkgroupId?id=${id}`,
      null
    );
  }

  // Save general Consent pdf  Data
  public InsertCurrency(data: CurrencyMaster) {
    return this.httpClient.post<CurrencyMaster[]>(
      this.baseUrl + MasterUrls.InsertCurrency,
      data,
      httpOptions
    );
  }

  public UpdateCurrency(data: CurrencyMaster) {
    return this.httpClient.post<CurrencyMaster[]>(
      this.baseUrl + MasterUrls.UpdateCurrency,
      data,
      httpOptions
    );
  }

  public DeleteCurrency(data: CurrencyMaster) {
    return this.httpClient.post<CurrencyMaster[]>(
      this.baseUrl + MasterUrls.DeleteCurrency,
      data,
      httpOptions
    );
  }

  public getItemTreeNode() {
    return this.httpClient
      .get('assets/demo/data/files.json')
      .toPromise()
      .then((res: any & { data: any }) => res.data as TreeNode[]);
  }

  public getItemsParentTreeNode() {
    return this.httpClient.get<ApiResponse<ItemMaster[]>>(
      this.baseUrl + MasterUrls.GetAllItem
    );
  }

  public getItemmasterMax() {
    return this.httpClient.get<ApiResponse<number>>(
      this.baseUrl + MasterUrls.itemmax
    );
  }

  public GetAllItemByName(data: any) {
    return this.httpClient.get<ApiResponse<ItemMaster[]>>(
      this.baseUrl + MasterUrls.GetAllItemByName + '/' + data
    );
  }

  public GetMatchingItemsByName(name: string) {
    const term = (name != null ? name : '').toString().trim();
    return this.httpClient.get<ApiResponse<ItemMaster[]>>(
      this.baseUrl + MasterUrls.GetMatchingItemsByName + '/' + encodeURIComponent(term)
    );
  }

  public GetAllItemSearchFilter(data: ItemFilter) {
    return this.httpClient.post<ApiResponse<ItemMaster[]>>(
      this.baseUrl + MasterUrls.GetAllItemSearchFilter,
      data,
      httpOptions
    );
  }

  public getItemsChildrenByParentTreeNode(id: number) {
    return this.httpClient.get<ApiResponse<ItemMaster[]>>(
      this.baseUrl + MasterUrls.GetAllItemById + '/' + id
    );
  }

  public InsertItem(data: ItemMaster) {
    return this.httpClient.post<ApiResponse<ItemMaster[]>>(
      this.baseUrl + MasterUrls.InsertItem,
      data,
      httpOptions
    );
  }

  public NewItem(data: ItemMaster) {
    return this.httpClient.post<ApiResponse<ItemMaster>>(
      this.baseUrl + MasterUrls.NewItem,
      data,
      httpOptions
    );
  }

  public DeleteItem(data: ItemMaster) {
    return this.httpClient.post<ApiResponse<ItemMaster[]>>(
      this.baseUrl + MasterUrls.DeleteItem,
      data,
      httpOptions
    );
  }

  public DeleteNewItem(data: ItemMaster) {
    return this.httpClient.post<ApiResponse<ItemMaster>>(
      this.baseUrl + MasterUrls.DeleteNewItem,
      data,
      httpOptions
    );
  }

  public GetAllItemMasterById(data: any) {
    return this.httpClient.get<ApiResponse<ItemMaster>>(
      this.baseUrl + MasterUrls.GetAllItemMasterById + '/' + data
    );
  }

  public GetItemMasterById(data: {
    id: number;
    customerId?: number;
  }): Observable<any> {
    let url = `${this.baseUrl}${MasterUrls.GetItemMasterById}/${data.id}`;

    if (data.customerId != null) {
      url += `/${data.customerId}`;
    }

    return this.httpClient.get<ApiResponse<any>>(url);
  }
  public GetItemMasterByIdAndLocation(data: {
    id: number;
    locationId: number;
    customerId?: number;
  }): Observable<any> {
    let url = `${this.baseUrl}${MasterUrls.GetItemMasterByIdAndLocation}/${data.id}/${data.locationId}`;

    if (data.customerId != null) {
      url += `/${data.customerId}`;
    }

    return this.httpClient.get<ApiResponse<any>>(url);
  }

  getStockReportBaseUnit(data: any) {
    return this.httpClient.get<ApiResponse<any>>(
      this.baseUrl + MasterUrls.GetAvgItemValue + data
    );
  }

  public GetUnitDetails(data: any) {
    return this.httpClient.get<any>(
      this.baseUrl + `master/GetUnitDetails?itemId=${data}`
    );
  }

  public getItemStockByUnit(
    itemId: number,
    unitId: number,
    locationId: number
  ) {
    return this.httpClient.get<{ isSuccess: boolean; data: number }>(
      `${this.baseUrl}master/item/getItemStockByUnit?itemId=${itemId}&unitId=${unitId}&locationId=${locationId}`
    );
  }

  public UpdateItemUnitId(fromItemId: number, toItemId: number): Observable<any> {
    const url = `${this.baseUrl}master/item/UpdateItemUnitId?fromItemId=${fromItemId}&toItemId=${toItemId}`;
    return this.httpClient.post<any>(url, { fromItemId, toItemId });
  }

  public GetAllItem() {
    return this.httpClient.get<ApiResponse<ItemMaster[]>>(
      this.baseUrl + MasterUrls.GetAllItem
    );
  }

  public GetAllItemNotGroup() {
    return this.httpClient.get<ApiResponse<ItemMaster[]>>(
      this.baseUrl + MasterUrls.GetAllItemNotGroup
    );
  }
  // public async GetAllItemNotGroup() {
  //   try {
  //     const response = await this.httpClient.get<ApiResponse<ItemMaster[]>>(this.baseUrl + MasterUrls.GetAllItemNotGroup).toPromise();
  //     return response;
  //   } catch (error) {
  //     console.error('Error fetching data', error);
  //   }
  // }

  public GetAllItemNotGroupForItemMaster() {
    if (this.cacheForItemMaster) {
      return new Observable((observer) => {
        observer.next(this.cacheForItemMaster);
        observer.complete();
      });
    }

    return this.httpClient
      .get<ApiResponse<ItemMaster[]>>(
        this.baseUrl + MasterUrls.GetAllItemNotGroup
      )
      .pipe(
        tap((response) => {
          this.cacheForItemMaster = response;
        })
      );
  }

  public GetAllItemListSearch(data: any) {
    return this.httpClient.post(
      this.baseUrl + '/ItemList/GetAllItemListSearch',
      data,
      httpOptions
    );
  }
  GetAllItemListSearchPaginated(data: any) {
    return this.httpClient.post<ApiResponse<any>>(
      this.baseUrl + 'ItemList/GetAllItemListSearchPaginated',
      data
    );
  }
  public UpdatetemListSearch(data: any, state: any) {
    const itemData = {
      itemlistData: data,
      paginationData: state,
    };
    return this.httpClient.post(
      this.baseUrl + 'ItemList/UpdateRateItemList',
      itemData,
      httpOptions
    );
  }
  ////================================ Chart of Accounts

  public getAccountTreeNode() {
    return this.httpClient
      .get('assets/demo/data/files.json')
      .toPromise()
      .then((res: any & { data: any }) => res.data as TreeNode[]);
  }

  public getAccountParentTreeNode() {
    return this.httpClient.get<ApiResponse<ChartofAccounts[]>>(
      this.baseUrl + MasterUrls.GetAllAccount
    );
    // return this.httpClient.get<ApiResponse<ChartofAccounts[]>>(this.baseUrl + AccountsUrls.GetAllAccounts);
  }

  public getAllGroup() {
    return this.httpClient.get<ApiResponse<ChartofAccounts[]>>(
      this.baseUrl + MasterUrls.GetAllGroup
    );
  }

  public GetAllAccountByName(data: any) {
    return this.httpClient.get<ApiResponse<ChartofAccounts[]>>(
      this.baseUrl + MasterUrls.GetAllAccountByName + '/' + data
    );
  }

  public getAccountChildrenByParentTreeNode(id: string) {
    return this.httpClient.get<ApiResponse<ChartofAccounts[]>>(
      this.baseUrl + MasterUrls.GetAllAccountById + '/' + id
    );
  }

  public GetAccountMastersByName(name: string) {
    return this.httpClient.get<ApiResponse<ChartofAccounts[]>>(
      this.baseUrl + MasterUrls.GetAccountMastersByName + '/' + name
    );
  }

  public InsertAccount(data: ChartofAccounts) {
    return this.httpClient.post<ApiResponse<ChartofAccounts[]>>(
      this.baseUrl + MasterUrls.InsertAccount,
      data,
      httpOptions
    );
  }

  public NewAccount(data: ChartofAccounts) {
    return this.httpClient.post<ApiResponse<ChartofAccounts>>(
      this.baseUrl + MasterUrls.NewAccount,
      data,
      httpOptions
    );
  }

  public DeleteAccount(data: ChartofAccounts) {
    return this.httpClient.post<ApiResponse<ChartofAccounts[]>>(
      this.baseUrl + MasterUrls.DeleteAccount,
      data,
      httpOptions
    );
  }

  public DeleteNewAccount(data: ChartofAccounts) {
    return this.httpClient.post<ApiResponse<ChartofAccounts>>(
      this.baseUrl + MasterUrls.DeleteNewAccount,
      data,
      httpOptions
    );
  }

  public GetAllAccountMasterById(data: any) {
    return this.httpClient.get<ApiResponse<ChartofAccounts>>(
      this.baseUrl + MasterUrls.GetAllAccountMasterById + '/' + data
    );
  }

  //================================= End

  public GetAllBankGuarantee() {
    return this.httpClient.get<BankGuaranteeMaster[]>(
      this.baseUrl + MasterUrls.GetAllBankGuarantee
    );
  }

  public InsertBankGuarantee(data: BankGuaranteeMaster) {
    return this.httpClient.post<BankGuaranteeMaster[]>(
      this.baseUrl + MasterUrls.InsertBankGuarantee,
      data,
      httpOptions
    );
  }
  public UpdateBankGuarantee(data: BankGuaranteeMaster) {
    return this.httpClient.post<BankGuaranteeMaster[]>(
      this.baseUrl + MasterUrls.UpdateBankGuarantee,
      data,
      httpOptions
    );
  }
  public DeleteBankGuarantee(data: BankGuaranteeMaster) {
    return this.httpClient.post<BankGuaranteeMaster[]>(
      this.baseUrl + MasterUrls.DeleteBankGuarantee,
      data,
      httpOptions
    );
  }

  public GetAllUnit() {
    return this.httpClient.get<UnitMaster[]>(
      this.baseUrl + MasterUrls.GetAllUnit
    );
  }
  public InsertUnit(data: UnitMaster) {
    return this.httpClient.post<UnitMaster[]>(
      this.baseUrl + MasterUrls.InsertUnit,
      data,
      httpOptions
    );
  }
  public UpdateUnit(data: UnitMaster) {
    return this.httpClient.post<UnitMaster[]>(
      this.baseUrl + MasterUrls.UpdateUnit,
      data,
      httpOptions
    );
  }
  public DeleteUnit(data: UnitMaster) {
    return this.httpClient.post<UnitMaster[]>(
      this.baseUrl + MasterUrls.DeleteUnit,
      data,
      httpOptions
    );
  }

  public GetAllModel() {
    return this.httpClient.get<ModelMaster[]>(
      this.baseUrl + MasterUrls.GetAllModel
    );
  }
  public InsertModel(data: ModelMaster) {
    return this.httpClient.post<ModelMaster[]>(
      this.baseUrl + MasterUrls.InsertModel,
      data,
      httpOptions
    );
  }
  public UpdateModel(data: ModelMaster) {
    return this.httpClient.post<ModelMaster[]>(
      this.baseUrl + MasterUrls.UpdateModel,
      data,
      httpOptions
    );
  }
  public DeleteModel(data: ModelMaster) {
    return this.httpClient.post<ModelMaster[]>(
      this.baseUrl + MasterUrls.DeleteModel,
      data,
      httpOptions
    );
  }

  public GetAllPriceLevel() {
    return this.httpClient.get<PriceLevelMaster[]>(
      this.baseUrl + MasterUrls.GetAllPriceLevel
    );
  }

  public InsertPriceLevel(data: PriceLevelMaster) {
    return this.httpClient.post<PriceLevelMaster[]>(
      this.baseUrl + MasterUrls.InsertPriceLevel,
      data,
      httpOptions
    );
  }
  public UpdatePriceLevel(data: PriceLevelMaster) {
    return this.httpClient.post<PriceLevelMaster[]>(
      this.baseUrl + MasterUrls.UpdatePriceLevel,
      data,
      httpOptions
    );
  }
  public DeletePriceLevel(data: PriceLevelMaster) {
    return this.httpClient.post<PriceLevelMaster[]>(
      this.baseUrl + MasterUrls.DeletePriceLevel,
      data,
      httpOptions
    );
  }

  public GetAllBrand() {
    return this.httpClient.get<VendorMaster[]>(
      this.baseUrl + MasterUrls.GetAllBrand
    );
  }

  public InsertBrand(data: VendorMaster) {
    return this.httpClient.post<VendorMaster[]>(
      this.baseUrl + MasterUrls.InsertBrand,
      data,
      httpOptions
    );
  }
  public UpdateBrand(data: VendorMaster) {
    return this.httpClient.post<VendorMaster[]>(
      this.baseUrl + MasterUrls.UpdateBrand,
      data,
      httpOptions
    );
  }
  public DeleteBrand(data: VendorMaster) {
    return this.httpClient.post<VendorMaster[]>(
      this.baseUrl + MasterUrls.DeleteBrand,
      data,
      httpOptions
    );
  }

  public GetAllItemStock() {
    return this.httpClient.get<ApiResponse<ItemStockType[]>>(
      this.baseUrl + MasterUrls.GetAllItemStockType
    );
  }

  public GetAllBudget() {
    // let params = new HttpParams();  MasterUrls
    // params = params.append('PatFinEncounterID', encouter.PatFinEncounterID.toString());
    // { params: params }

    return this.httpClient.get<BudgetMaster[]>(
      this.baseUrl + MasterUrls.GetAllBudget
    );
  }
  // Save general Consent pdf  Data
  public InsertBudget(data: BudgetMaster) {
    return this.httpClient.post<BudgetMaster[]>(
      this.baseUrl + MasterUrls.InsertBudget,
      data,
      httpOptions
    );
  }

  public UpdateBudget(data: BudgetMaster) {
    return this.httpClient.post<BudgetMaster[]>(
      this.baseUrl + MasterUrls.UpdateBudget,
      data,
      httpOptions
    );
  }

  public DeleteBudget(data: BudgetMaster) {
    return this.httpClient.post<BudgetMaster[]>(
      this.baseUrl + MasterUrls.DeleteBudget,
      data,
      httpOptions
    );
  }

  public GetAllTax() {
    return this.httpClient.get<TaxMaster[]>(
      this.baseUrl + MasterUrls.GetAllTax
    );
  }

  public GetAllCity() {
    // let params = new HttpParams();  MasterUrls
    // params = params.append('PatFinEncounterID', encouter.PatFinEncounterID.toString());
    // { params: params }

    return this.httpClient.get<CityMaster[]>(
      this.baseUrl + MasterUrls.GetAllCity
    );
  }
  // Save general Consent pdf  Data
  public InsertCity(data: CityMaster) {
    return this.httpClient.post<CityMaster[]>(
      this.baseUrl + MasterUrls.InsertCity,
      data,
      httpOptions
    );
  }

  public UpdateCity(data: CityMaster) {
    return this.httpClient.post<CityMaster[]>(
      this.baseUrl + MasterUrls.UpdateCity,
      data,
      httpOptions
    );
  }

  public DeleteCity(data: CityMaster) {
    return this.httpClient.post<CityMaster[]>(
      this.baseUrl + MasterUrls.DeleteCity,
      data,
      httpOptions
    );
  }

  public GetAllCountry() {
    // let params = new HttpParams();  MasterUrls
    // params = params.append('PatFinEncounterID', encouter.PatFinEncounterID.toString());
    // { params: params }

    return this.httpClient.get<CountryMaster[]>(
      this.baseUrl + MasterUrls.GetAllCountry
    );
  }
  // Save general Consent pdf  Data
  public InsertCountry(data: CountryMaster) {
    return this.httpClient.post<CountryMaster[]>(
      this.baseUrl + MasterUrls.InsertCountry,
      data,
      httpOptions
    );
  }

  public UpdateCountry(data: CountryMaster) {
    return this.httpClient.post<CountryMaster[]>(
      this.baseUrl + MasterUrls.UpdateCountry,
      data,
      httpOptions
    );
  }

  public DeleteCountry(data: CountryMaster) {
    return this.httpClient.post<CountryMaster[]>(
      this.baseUrl + MasterUrls.DeleteCountry,
      data,
      httpOptions
    );
  }

  public GetAllLocation() {
    // let params = new HttpParams();  MasterUrls
    // params = params.append('PatFinEncounterID', encouter.PatFinEncounterID.toString());
    // { params: params }

    return this.httpClient.get<LocationMaster[]>(
      this.baseUrl + MasterUrls.GetAllLocation
    );
  }
  // Save general Consent pdf  Data
  public InsertLocation(data: LocationMaster) {
    return this.httpClient.post<LocationMaster[]>(
      this.baseUrl + MasterUrls.InsertLocation,
      data,
      httpOptions
    );
  }

  public UpdateLocation(data: LocationMaster) {
    return this.httpClient.post<LocationMaster[]>(
      this.baseUrl + MasterUrls.UpdateLocation,
      data,
      httpOptions
    );
  }

  public DeleteLocation(data: LocationMaster) {
    return this.httpClient.post<LocationMaster[]>(
      this.baseUrl + MasterUrls.DeleteLocation,
      data,
      httpOptions
    );
  }

  public GetAllSalesman() {
    // let params = new HttpParams();  MasterUrls
    // params = params.append('PatFinEncounterID', encouter.PatFinEncounterID.toString());
    // { params: params }

    return this.httpClient.get<SalesManMaster[]>(
      this.baseUrl + MasterUrls.GetAllSalesman
    );
  }
  // Save general Consent pdf  Data
  public InsertSalesman(data: SalesManMaster) {
    return this.httpClient.post<SalesManMaster[]>(
      this.baseUrl + MasterUrls.InsertSalesman,
      data,
      httpOptions
    );
  }

  public UpdateSalesman(data: SalesManMaster) {
    return this.httpClient.post<SalesManMaster[]>(
      this.baseUrl + MasterUrls.UpdateSalesman,
      data,
      httpOptions
    );
  }

  public DeleteSalesman(data: SalesManMaster) {
    return this.httpClient.post<SalesManMaster[]>(
      this.baseUrl + MasterUrls.DeleteSalesman,
      data,
      httpOptions
    );
  }

  public GetCustomerDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + MasterUrls.GetCustomerDropdown
    );
  }
  public GetAllCustomer() {
    // let params = new HttpParams();  MasterUrls
    // params = params.append('PatFinEncounterID', encouter.PatFinEncounterID.toString());
    // { params: params }

    return this.httpClient.get<CustomerMaster[]>(
      this.baseUrl + MasterUrls.GetAllCustomer
    );
    // return this.httpClient.get<CustomerMaster[]>(this.baseUrl + MasterUrls.GetCustomer);
  }
  public getCustomerlocation(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'SalesOrder/getCustomerlocation'
    );
  }
  // Save general Consent pdf  Data
  public InsertCustomer(data: CustomerMaster) {
    return this.httpClient.post<any>(
      this.baseUrl + MasterUrls.InsertNewsCustomer,
      data,
      httpOptions
    );
  }

  public UpdateCustomer(data: CustomerMaster) {
    return this.httpClient.post<CustomerMaster[]>(
      this.baseUrl + MasterUrls.UpdateCustomer,
      data,
      httpOptions
    );
  }

  public DeleteCustomer(data: CustomerMaster) {
    return this.httpClient.post<CustomerMaster[]>(
      this.baseUrl + MasterUrls.DeleteCustomer,
      data,
      httpOptions
    );
  }

  //----------------------------------------------------------------------------------------------------
  // public GetAllNewCustomer() {
  //   // let params = new HttpParams();  MasterUrls
  //   // params = params.append('PatFinEncounterID', encouter.PatFinEncounterID.toString());
  //   // { params: params }

  //   return this.httpClient.get<NewCustomerMaster>(this.baseUrl + MasterUrls.GetAllNewCustomer);
  // }
  // Save general Consent pdf  Data
  // public InsertNewCustomer(data: NewCustomerMaster) {
  //   return this.httpClient.post<NewCustomerMaster>(this.baseUrl + MasterUrls.InsertNewCustomer, data, httpOptions);
  // }

  // public UpdateNewCustomer(data: NewCustomerMaster) {
  //   return this.httpClient.post<NewCustomerMaster>(this.baseUrl + MasterUrls.UpdateNewCustomer, data, httpOptions);
  // }

  // public DeleteNewCustomer(data: NewCustomerMaster) {
  //   return this.httpClient.post<NewCustomerMaster>(this.baseUrl + MasterUrls.DeleteNewCustomer, data, httpOptions);
  // }

  public InsertNewCustomer(data1: NewCustomerMaster) {
    return this.httpClient.post<ApiResponse<NewCustomerMaster>>(
      this.baseUrl + MasterUrls.InsertNewsCustomer,
      data1,
      httpOptions
    );
  }

  public DeleteNewCustomer(data1: NewCustomerMaster) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + MasterUrls.DeleteNewCustomer,
      data1,
      httpOptions
    );
  }

  public UpdateNewCustomer(data1: NewCustomerMaster) {
    return this.httpClient.post<ApiResponse<NewCustomerMaster>>(
      this.baseUrl + MasterUrls.UpdateNewCustomer,
      data1,
      httpOptions
    );
  }

  public GetAllCustomers() {
    return this.httpClient.get<ApiResponse<NewCustomerMaster[]>>(
      this.baseUrl + MasterUrls.GetAllCustomers
    );
  }

  public GetSavedCustomers(id: string) {
    return this.httpClient.get<ApiResponse<NewCustomerMaster>>(
      this.baseUrl + MasterUrls.GetSavedCustomers + '/' + id
    );
  }

  //-------------------------------------------------------------Job Master
  public InsertJobMaster(data1: JobMaster) {
    return this.httpClient.post<ApiResponse<JobMaster>>(
      this.baseUrl + MasterUrls.InsertJobMaster,
      data1,
      httpOptions
    );
  }

  public DeleteJobMaster(data1: JobMaster) {
    return this.httpClient.post<ApiResponse<number>>(
      this.baseUrl + MasterUrls.DeleteJobMaster,
      data1,
      httpOptions
    );
  }
  public UpdateJobMaster(data1: JobMaster) {
    return this.httpClient.post<ApiResponse<JobMaster>>(
      this.baseUrl + MasterUrls.UpdateJobMaster,
      data1,
      httpOptions
    );
  }

  public GetJobMaster() {
    return this.httpClient.get<ApiResponse<JobMaster[]>>(
      this.baseUrl + MasterUrls.GetJobMaster
    );
  }

  public GetUserLevelForJob(userId: any, jobId: any) {
    return this.httpClient.get<ApiResponse<JobMaster[]>>(
      this.baseUrl + `GetUserLevelForJob/${userId}/${jobId}`
    );
  }
  public GetSavedJobMasterDetails(id: string) {
    return this.httpClient.get<ApiResponse<JobMaster>>(
      this.baseUrl + MasterUrls.GetSavedJobMasterDetails + '/' + id
    );
  }

  public JobMaster_GetAllBankGuaranteeMaster() {
    return this.httpClient.get<BankGuaranteeMaster[]>(
      this.baseUrl + MasterUrls.JobMaster_GetAllBankGuaranteeMaster
    );
  }


  public getJobStatusReport(model: JobStatusReportFilter) {
  return this.httpClient.post<ApiResponse<any>>(
    this.baseUrl + 'GetJobStatusReport', 
    model
  );
}
  //====================================================================================================

  //-----------------------------------------------------------------------------------------------
  public GetAllCustType() {
    // let params = new HttpParams();  MasterUrls
    // params = params.append('PatFinEncounterID', encouter.PatFinEncounterID.toString());
    // { params: params }

    return this.httpClient.get<CustomerTypeMaster[]>(
      this.baseUrl + MasterUrls.GetAllCustType
    );
  }
  // Save general Consent pdf  Data
  public InsertCustType(data: CustomerTypeMaster) {
    return this.httpClient.post<CustomerTypeMaster[]>(
      this.baseUrl + MasterUrls.InsertCustType,
      data,
      httpOptions
    );
  }

  public UpdateCustType(data: CustomerTypeMaster) {
    return this.httpClient.post<CustomerTypeMaster[]>(
      this.baseUrl + MasterUrls.UpdateCustType,
      data,
      httpOptions
    );
  }

  public DeleteCustType(data: CustomerTypeMaster) {
    return this.httpClient.post<CustomerTypeMaster[]>(
      this.baseUrl + MasterUrls.DeleteCustType,
      data,
      httpOptions
    );
  }

  //===============================================================================================

  public GetAllStation() {
    return this.httpClient.get<StationMaster[]>(
      this.baseUrl + MasterUrls.GetAllStation
    );
  }
  public DeleteStationMaster() {
    return this.httpClient.get<StationMaster[]>(
      this.baseUrl + MasterUrls.DeleteStationMaster
    );
  }
  public InsterStationMaster(data: any) {
    return this.httpClient.post(
      this.baseUrl + MasterUrls.InsterStationMaster,
      data,
      httpOptions
    );
  }

  public UpdateStationMaster(data: any) {
    return this.httpClient.post(
      this.baseUrl + MasterUrls.UpdateStationMaster,
      data,
      httpOptions
    );
  }

  //====================================================== Station Details End ====================
  public GetAllSupplier() {
    return this.httpClient.get<SupplierMaster[]>(
      this.baseUrl + MasterUrls.GetAllSupplier
    );
  }
  public GetSupplierLoadDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + MasterUrls.GetSupplierLoadDropdown
    );
  }

  public InsertSupplier(data: SupplierMaster) {
    return this.httpClient.post<SupplierMaster[]>(
      this.baseUrl + MasterUrls.InsertSupplier,
      data,
      httpOptions
    );
  }

  public UpdateSupplier(data: SupplierMaster) {
    return this.httpClient.post<SupplierMaster[]>(
      this.baseUrl + MasterUrls.UpdateSupplier,
      data,
      httpOptions
    );
  }

  public DeleteSupplier(data: SupplierMaster) {
    return this.httpClient.post<SupplierMaster[]>(
      this.baseUrl + MasterUrls.DeleteSupplier,
      data,
      httpOptions
    );
  }
  public GetSupplierDetailsByItemId(id: number) {
    return this.httpClient.get<ApiResponse<ItemSupplierDetails[]>>(
      this.baseUrl + MasterUrls.GetSupplierDetailsByItemId + '/' + id
    );
  }

  public GetAllSupplierById(id: number) {
    return this.httpClient.get<ApiResponse<SupplierMaster>>(
      this.baseUrl + MasterUrls.GetAllSupplierById + '/' + id
    );
  }

  public GetAllProjectDesc() {
    return this.httpClient.get<ProjectDescriptionMaster[]>(
      this.baseUrl + MasterUrls.GetAllProjectDesc
    );
  }
  public InsertProjectDesc(data: ProjectDescriptionMaster) {
    return this.httpClient.post<ProjectDescriptionMaster[]>(
      this.baseUrl + MasterUrls.InsertProjectDesc,
      data,
      httpOptions
    );
  }

  public UpdateProjectDesc(data: ProjectDescriptionMaster) {
    return this.httpClient.post<ProjectDescriptionMaster[]>(
      this.baseUrl + MasterUrls.UpdateProjectDesc,
      data,
      httpOptions
    );
  }

  public DeleteProjectDesc(data: ProjectDescriptionMaster) {
    return this.httpClient.post<ProjectDescriptionMaster[]>(
      this.baseUrl + MasterUrls.DeleteProjectDesc,
      data,
      httpOptions
    );
  }

  public GetAllBusinessType() {
    return this.httpClient.get<BusinessTypeMaster[]>(
      this.baseUrl + MasterUrls.GetAllBusinessType
    );
  }

  public InsertBusinessType(data: BusinessTypeMaster) {
    return this.httpClient.post<BusinessTypeMaster[]>(
      this.baseUrl + MasterUrls.InsertBusinessType,
      data,
      httpOptions
    );
  }

  public UpdateBusinessType(data: BusinessTypeMaster) {
    return this.httpClient.post<BusinessTypeMaster[]>(
      this.baseUrl + MasterUrls.UpdateBusinessType,
      data,
      httpOptions
    );
  }

  public DeleteBusinessType(data: BusinessTypeMaster) {
    return this.httpClient.post<BusinessTypeMaster[]>(
      this.baseUrl + MasterUrls.DeleteBusinessType,
      data,
      httpOptions
    );
  }

  public GetAllUser() {
    return this.httpClient.get<User[]>(this.baseUrl + UserUrls.GetAllUser);
  }
  GetAllUsers() {
    return this.httpClient.get<any[]>(this.baseUrl + 'GetAllUser');
  }

  public InsertUser(data: User) {
    return this.httpClient.post<User[]>(
      this.baseUrl + UserUrls.InsertUser,
      data,
      httpOptions
    );
  }

  public UpdateUser(data: User) {
    return this.httpClient.post<User[]>(
      this.baseUrl + UserUrls.UpdateUser,
      data,
      httpOptions
    );
  }

  public DeleteUser(data: User) {
    return this.httpClient.post<User[]>(
      this.baseUrl + UserUrls.DeleteUser,
      data,
      httpOptions
    );
  }

  public GetAllDepartment() {
    return this.httpClient.get<DepartmentMaster[]>(
      this.baseUrl + MasterUrls.GetAllDepartment
    );
  }

  public GetAllDepartmentById(id: string) {
    return this.httpClient.get<ApiResponse<DepartmentMaster>>(
      this.baseUrl + MasterUrls.GetAllDepartmentById + '/' + id
    );
  }

  public InsertDepartment(data: DepartmentMaster) {
    return this.httpClient.post<DepartmentMaster[]>(
      this.baseUrl + MasterUrls.InsertDepartment,
      data,
      httpOptions
    );
  }

  public UpdateDepartment(data: DepartmentMaster) {
    return this.httpClient.post<DepartmentMaster[]>(
      this.baseUrl + MasterUrls.UpdateDepartment,
      data,
      httpOptions
    );
  }

  public DeleteDepartment(data: DepartmentMaster) {
    return this.httpClient.post<DepartmentMaster[]>(
      this.baseUrl + MasterUrls.DeleteDepartment,
      data,
      httpOptions
    );
  }

  public GetAllEnquiryAbout() {
    return this.httpClient.get<EnquiryAbount[]>(
      this.baseUrl + MasterUrls.GetAllEnquiryAbout
    );
  }
  public InsertEnquiryAbout(data: EnquiryAbount) {
    return this.httpClient.post<EnquiryAbount[]>(
      this.baseUrl + MasterUrls.InsertEnquiryAbout,
      data,
      httpOptions
    );
  }

  public UpdateEnquiryAbout(data: EnquiryAbount) {
    return this.httpClient.post<EnquiryAbount[]>(
      this.baseUrl + MasterUrls.UpdateEnquiryAbout,
      data,
      httpOptions
    );
  }

  public DeleteEnquiryAbout(data: EnquiryAbount) {
    return this.httpClient.post<EnquiryAbount[]>(
      this.baseUrl + MasterUrls.DeleteEnquiryAbout,
      data,
      httpOptions
    );
  }

  public GetAllTerms() {
    return this.httpClient.get<TermsandCondition[]>(
      this.baseUrl + MasterUrls.GetAllTerms
    );
  }
  public InsertTerms(data: TermsandCondition) {
    return this.httpClient.post<TermsandCondition[]>(
      this.baseUrl + MasterUrls.InsertTerms,
      data,
      httpOptions
    );
  }

  public UpdateTerms(data: TermsandCondition) {
    return this.httpClient.post<TermsandCondition[]>(
      this.baseUrl + MasterUrls.UpdateTerms,
      data,
      httpOptions
    );
  }

  public DeleteTerms(data: TermsandCondition) {
    return this.httpClient.post<TermsandCondition[]>(
      this.baseUrl + MasterUrls.DeleteTerms,
      data,
      httpOptions
    );
  }

  public GetAllEnquiryStatus() {
    return this.httpClient.get<EnquiryStatus[]>(
      this.baseUrl + MasterUrls.GetAllEnquiryStatus
    );
  }
  public InsertEnquiryStatus(data: EnquiryStatus) {
    return this.httpClient.post<EnquiryStatus[]>(
      this.baseUrl + MasterUrls.InsertEnquiryStatus,
      data,
      httpOptions
    );
  }

  public UpdateEnquiryStatus(data: EnquiryStatus) {
    return this.httpClient.post<EnquiryStatus[]>(
      this.baseUrl + MasterUrls.UpdateEnquiryStatus,
      data,
      httpOptions
    );
  }

  public DeleteEnquiryStatus(data: EnquiryStatus) {
    return this.httpClient.post<EnquiryStatus[]>(
      this.baseUrl + MasterUrls.DeleteEnquiryStatus,
      data,
      httpOptions
    );
  }
  //  public GetAllLocation() {
  //   return this.httpClient.get<LocationMaster[]>(this.baseUrl + MasterUrls.GetAllLocation);
  // }
  public GetAllFinancialPeriod() {
    return this.httpClient.get<FinancialPeriods[]>(
      this.baseUrl + MasterUrls.GetAllFinancialPeriod
    );
  }

  //===================== General Settings and Program Settings
  public GetProgramSettings() {
    return this.httpClient.get<ProgramSettings[]>(
      this.baseUrl + MasterUrls.GetProgramSettings
    );
  }

  public GetProgramSettingsDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + MasterUrls.GetProgramSettingsDropdown
    );
  }
  public GetProgramSettingbyKey(defvalue: string) {
    return this.httpClient.get<ApiResponse<ProgramSettings[]>>(
      this.baseUrl + MasterUrls.GetProgramSettingbyKey + '/' + defvalue
    );
  }
  public bykeys(defvalue: string) {
    return this.httpClient.get<ApiResponse<ProgramSettings[]>>(
      this.baseUrl + 'settings/bykeys?keys=' + defvalue
    );
  }
  // /settings/GetOptionsSettingbyKey/DEFAULT_VAT
  public GetGeneralSettingbyKey(defvalue: string) {
    return this.httpClient.get<ApiResponse<GeneralSettings[]>>(
      this.baseUrl + MasterUrls.GetGeneralSettingbyKey + '/' + defvalue
    );
  }

  public GetAllAccountsbyKey(defvalue: string) {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl + 'accountssettings/GetAllAccountsbyKey/' + defvalue
    );
  }

  public UpdateProgramSettings(data: ProgramSettings[]) {
    return this.httpClient.post<ApiResponse<ProgramSettings[]>>(
      this.baseUrl + MasterUrls.UpdateProgramSettings,
      data
    );
  }

  public UpdateGeneralSettings(data: GeneralSettings[]) {
    return this.httpClient.post<ApiResponse<GeneralSettings[]>>(
      this.baseUrl + MasterUrls.UpdateGeneralSettings,
      data
    );
  }

  public GetGeneralSettings() {
    return this.httpClient.get<GeneralSettings[]>(
      this.baseUrl + MasterUrls.GetGeneralSettings
    );
  }
  //=====================================================================

  // ===============================================account setting=========
  public getAccountSetting() {
    return this.httpClient.get<any>(
      this.baseUrl + 'accountssettings/GetAllAccounts'
    );
  }

  public updateAccountSetting(setting: accountSetting[]) {
    return this.httpClient.post<ApiResponse<accountSetting[]>>(
      this.baseUrl + 'accountssettings/updateAccountsSettings',
      setting
    );
  }

  // ---------------------------

  // ===============================================premission setting=========================

  // /PermissionSetting/getPermissionSetting?groupId=1
  public PermissionSetting(groupId: any) {
    return this.httpClient.post<any>(
      this.baseUrl +
      `PermissionSetting/getPermissionSetting?groupId=${groupId}`,
      null
    );
  }
  // /PermissionSetting/updatePermissionSetting
  public updatePermissionSetting(data: any) {
    return this.httpClient.post<any>(
      this.baseUrl + `PermissionSetting/updatePermissionSetting`,
      data
    );
  }
  // ========================================

  JobMasterList: JobMaster[] = [];
  CostCentreList: CostCenterMaster[] = [];
  currencyList: CurrencyMaster[] = [];
  GetAllItemMaster() {
    if (this.ItemMasterArray && this.ItemMasterArray.length > 0) {
      return this.ItemMasterArray;
    }
    this.httpClient
      .get<ItemMaster[]>(this.baseUrl + MasterUrls.GetAllItem)
      .subscribe((res: any) => {
        this.ItemMasterArray = res ? res.result : [];
      });
  }

  LoadDropdown(): Observable<any> {
    return this.httpClient.get<any[]>(this.baseUrl + MasterUrls.LoadDropdown);
  }

  LoadDropdownitem(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + MasterUrls.LoadDropdownitem
    );
  }

  LoadDropdownTaxMaster(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + MasterUrls.LoadDropdownTaxMaster
    );
  }
  LoadDropdownStockType(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + MasterUrls.LoadDropdownStockType
    );
  }
  LoadDropdownPriceleverMaster(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + MasterUrls.LoadDropdownPriceleverMaster
    );
  }
  LoadDropdownVendorMaster(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + MasterUrls.LoadDropdownVendorMaster
    );
  }

  public GetAllCurrencyWithSubs() {
    this.httpClient
      .get<CurrencyMaster[]>(this.baseUrl + MasterUrls.GetAllCurrency)
      .subscribe((k) => {
        this.currencyList = k;
      });
  }

  public GetAllJobWithSubscribe() {
    this.httpClient
      .get<JobMaster[]>(this.baseUrl + MasterUrls.GetAllJob)
      .subscribe((res) => {
        this.JobMasterList = res as JobMaster[];
      });
  }
  public GetAllJobmasterData() {
    if (this.JobMasterArray && this.JobMasterArray.length > 0) {
      return this.JobMasterArray;
    }
    this.httpClient
      .get<JobMaster[]>(this.baseUrl + MasterUrls.GetAllJob)
      .subscribe((res: JobMaster[]) => {
        this.JobMasterArray = res;
      });
  }

  public GetAllCostCenterWithSubs() {
    this.httpClient
      .get<CostCenterMaster[]>(this.baseUrl + MasterUrls.GetAllCostCenter)
      .subscribe((res) => {
        this.CostCentreList = res as CostCenterMaster[];
      });
  }
  public GetAllCostCenterData() {
    if (this.CostCentreArray && this.CostCentreArray.length > 0) {
      return this.CostCentreArray;
    }
    this.httpClient
      .get<CostCenterMaster[]>(this.baseUrl + MasterUrls.GetAllCostCenter)
      .subscribe((res: CostCenterMaster[]) => {
        this.CostCentreArray = res;
      });
  }

  public GetAllCustomerForGrid(data: any) {
    return this.httpClient.post<CustomerMaster[]>(
      this.baseUrl + MasterUrls.GetCustomer,
      data
    );
  }

  public GetSupplierById(id: number) {
    return this.httpClient.get<ApiResponse<SupplierMaster[]>>(
      this.baseUrl + MasterUrls.GetAllSupplierById + '/' + id
    );
  }

  public GetAllDepartmentData() {
    if (this.DepartmentMasterArray && this.DepartmentMasterArray.length > 0) {
      return this.DepartmentMasterArray;
    }
    this.httpClient
      .get<DepartmentMaster[]>(this.baseUrl + MasterUrls.GetAllDepartment)
      .subscribe((res: DepartmentMaster[]) => {
        this.DepartmentMasterArray = res;
      });
  }

  GetOptionsSettings(search: any) {
    return this.httpClient.get<any>(
      this.baseUrl + MasterUrls.GetOptionSettings + '?search=' + search
    );
  }
  public GetOptionsSettingbyKey(defvalue: string) {
    return this.httpClient.get<ApiResponse<any[]>>(
      this.baseUrl + MasterUrls.GetOptionSettingbyKey + '/' + defvalue
    );
  }
  public UpdateOptionsSettings(data: optionsettings[]) {
    return this.httpClient.post<ApiResponse<optionsettings[]>>(
      this.baseUrl + MasterUrls.UpdateOptionSettings,
      data
    );
  }
  //===============================================================

  getAllStationMaster() {
    return this.httpClient.get<Array<StationMaster>>(
      this.baseUrl + 'Stationmaster/GetAllStationmaster'
    );
  }

  // --------------------- Tax Master
  public GetAllTaxMaster() {
    if (this.TaxMasterArray && this.TaxMasterArray.length > 0) {
      return;
    }
    this.httpClient
      .get<TaxMaster[]>(this.baseUrl + TaxMasterUrls.GetAll)
      .subscribe(
        (res: TaxMaster[]) => {
          this.TaxMasterArray = res as TaxMaster[];
        },
        (error) => { }
      );
  }
  public InsertTaxMaster(data: TaxMaster) {
    return this.httpClient.post<TaxMaster[]>(
      this.baseUrl + TaxMasterUrls.Insert,
      data,
      httpOptions
    );
  }

  public UpdateTaxMaster(data: TaxMaster) {
    return this.httpClient.post<TaxMaster[]>(
      this.baseUrl + TaxMasterUrls.Update,
      data,
      httpOptions
    );
  }

  public DeleteTaxMaster(data: TaxMaster) {
    return this.httpClient.post<TaxMaster[]>(
      this.baseUrl + TaxMasterUrls.Delete,
      data,
      httpOptions
    );
  }

  GetOptionsMaster(formName: string) {
    this.httpClient
      .get<any[]>(
        this.baseUrl +
        // OptionMasterURL.GetOptionsMaster +
        formName
      )
      .subscribe(
        (res: any[]) => {
          this.OptionsMasterArray = res as any[];
        },
        (error) => { }
      );
  }

  getCompanyDetails() {
    return this.httpClient.get<Array<StationMaster>>(
      this.baseUrl + 'StationMaster/GetAllStation'
    );
  }

  public InsertPurchaseVoucher(data: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + PurchaseVoucherURL.InsertPurchaseVoucher,
      data,
      httpOptions
    );
  }

  public UpdatePurchaseVoucher(data: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + PurchaseVoucherURL.UpdatePurchaseVoucher,
      data,
      httpOptions
    );
  }

  public DeletePurchaseVoucher(data: any) {
    return this.httpClient.post<any[]>(
      this.baseUrl + PurchaseVoucherURL.DeletePurchaseVoucher,
      data,
      httpOptions
    );
  }

  GetPurchaseVoucherDetails() {
    if (
      this.PurchaseVoucherDetailsArray &&
      this.PurchaseVoucherDetailsArray.length > 0
    ) {
      return;
    }
    this.httpClient
      .get<any[]>(this.baseUrl + PurchaseVoucherURL.GetPurchaseVoucherDetails)
      .subscribe((res: any[]) => {
        this.PurchaseVoucherDetailsArray = res as any[];
      });
  }

  GetPurchaseVoucher() {
    if (this.PurchaseVoucherArray && this.PurchaseVoucherArray.length > 0) {
      return;
    }
    this.httpClient
      .get<any[]>(this.baseUrl + PurchaseVoucherURL.GetPurchaseVoucher)
      .subscribe((res: any[]) => {
        this.PurchaseVoucherArray = res as any[];
      });
  }

  getSalesInvoicePrintView(data: ReportFilterModel): Observable<any> {
    const data2 = this.storage.get(CredentialKeys.Login);
    const rptOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'blob' as 'blob',
      Authorization: 'Bearer ' + data2.token,
    };

    return this.httpClient.put(
      this.reportBasUrl + 'reports/getReportPrint',
      data,
      rptOptions
    );
  }
  // JobCostReport/getJobCostReportDetails
  public GetjobCastDetials(data: any) {
    // return this.httpClient.post<any[]>(this.baseUrl + 'JobCostReport/getJobCostReportDetails', data, httpOptions);
    return this.httpClient.post<any[]>(
      this.baseUrl + 'JobCastReport/GetjobCastDetials',
      data,
      httpOptions
    );
  }
  public getAllCustomertype() {
    return this.httpClient.get<any>(this.baseUrl + '/GetAllCustType');
  }
  public SaveCustomertype(data: any) {
    return this.httpClient.post<any>(
      this.baseUrl + '/InsertCustType',
      data,
      httpOptions
    );
  }
  public UpdateCustomertype(data: any) {
    return this.httpClient.post<any>(
      this.baseUrl + '/UpdateCustType',
      data,
      httpOptions
    );
  }
  public DeleteCustomertype(data: any) {
    return this.httpClient.post<any>(
      this.baseUrl + '/DeleteCustType',
      data,
      httpOptions
    );
  }
  public GetDocumentTree(jobId: number, type: string) {
    return this.httpClient.get<any>(
      this.baseUrl + `DocumentAttachments/GetDocuments?id=${jobId}&type=${type}`
    );
  }
  public importSelectedPRDocumentsToPO(
    prId: number,
    poId: number,
    prFileIds: number[]
  ) {
    return this.httpClient.post<any>(
      this.baseUrl + 'DocumentAttachments/import-selected-pr-documents-to-po',
      { prId, poId, prFileIds }
    );
  }
  public GetExcludedDocuments(
    sourceVoucherId: number,
    sourceType: string,
    excludeVoucherId: number,
    excludeType: string
  ) {
    const params = new HttpParams()
      .set('sourceVoucherId', sourceVoucherId.toString())
      .set('sourceType', sourceType)
      .set('excludeVoucherId', excludeVoucherId.toString())
      .set('excludeType', excludeType);

    return this.httpClient.get<any>(
      `${this.baseUrl}DocumentAttachments/GetExcludedDocumentForTransfer`,
      { params }
    );
  }


  saveItemQrCode(payload: any) {
    return this.httpClient.post(`${this.baseUrl}master/item/save-item-qr-code`, payload);
  }

  getItemQrCodeByItemId(itemId: number) {
    return this.httpClient.get(`${this.baseUrl}master/item/qr-code-by-item/${itemId}`);
  }

  deleteItemQrCode(id: number) {
    return this.httpClient.delete(`${this.baseUrl}master/item/delete-qr-code/${id}`);
  }
   GetCostEstimationItems(){
    return this.httpClient.get<any>(this.baseUrl + 'master/item/cost-estimation-items');
  }

  CostEstimationInsert(costEstimation: any) {
  return this.httpClient.post<any>(this.baseUrl + 'master/item/cost-estimation-insert', costEstimation);
}

CostEstimationUpdate(costEstimation: any) {
  return this.httpClient.post<any>(this.baseUrl + 'master/item/cost-estimation-update', costEstimation);
}

CostEstimationDelete(id: number) {
  return this.httpClient.post<any>(this.baseUrl + `master/item/cost-estimation-delete?id=${id}`, null);
}
}
