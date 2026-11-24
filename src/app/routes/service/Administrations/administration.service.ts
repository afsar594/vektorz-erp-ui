import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../domain/ApiResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  baseUrl: string = environment.apiRootURL;
  constructor(private http: HttpClient) { }
  GetFinancialClosingEquity(data: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Administration/GetFinancialClosingEquity', data);
  }
  GetFinancialClosingAsset(data: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Administration/GetFinancialClosingAsset', data);
  }
  GetFinancialClosingLiability(data: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Administration/GetFinancialClosingLiability', data);
  }
  //REPORT TYPES
  AddEditReportType(data: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Administration/AddEditReportType', data);
  }
  DeleteReportType(ids: number[]) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Administration/DeleteReportType', ids);
  }
  GetReportTypes(data: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Administration/GetReportTypes', data);
  }
  GetSpecificReportType(id: number) {
    return this.http.get<ApiResponse<any>>(this.baseUrl + 'Administration/GetSpecificVoucherType?id='+id);
  }
  //END
  // menu api
  GetMenusByWorkgroupId(id: any) {
    return this.http.post<ApiResponse<any>>(this.baseUrl + 'Setting/GetMenusByWorkgroupId' , id);
  }
  getSavedMenuById(id: number) {
    return this.http.post<any>(this.baseUrl + 'Setting/GetSavedMenuById', id);
}
SavedMenu(data:any) {
  return this.http.post<any>(this.baseUrl + 'Setting/InsertMenu', data);
}
UpdateMenu(data:any) {
  return this.http.post<any>(this.baseUrl + 'Setting/UpdateMenu', data);
}
DeleteMenu(id:any) {
  return this.http.post<any>(this.baseUrl + 'Setting/DeleteMenu', id);
}
GetUserTrackingDetails(data:any){
  return this.http.post<any>(this.baseUrl + 'PurchassOrderTracking/GetUserTrackingDetails', data);
}
GetTrackingUserVPType(){
 return this.http.get<any>(this.baseUrl + 'PurchassOrderTracking/GetTrackingUserVPType');
}
GetTrackingUserVPAction(){
  return this.http.get<any>(this.baseUrl + 'PurchassOrderTracking/GetTrackingUserVPAction');
 }
 getTrackingUserFile() {
  return this.http.get<any>(`${this.baseUrl}PurchassOrderTracking/GetTrackingUserUserFile`);
}
GetAllWorkGroup(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}GetAllWorkGroup`);
}
InsertUser(paylaod){
  return this.http.post<any>(this.baseUrl + 'InsertUser', paylaod);
}
UpdateUser(paylaod){
  return this.http.post<any>(this.baseUrl + 'UpdateUser', paylaod);
}
DeleteUser(paylaod){
  return this.http.post<any>(this.baseUrl + 'DeleteUser', paylaod);
}
GetAllUserFile(){
  return this.http.get<any>(`${this.baseUrl}GetAllUserFile`);
}
}
