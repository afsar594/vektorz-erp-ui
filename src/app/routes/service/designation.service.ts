import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DesignationService {
  baseUrl: string = environment.apiRootURL;
  constructor(private httpClient: HttpClient,) { }

  public insertDesignstion(payload: any) {
    return this.httpClient.post(this.baseUrl + 'HrDesignation/InsertDesignation', payload);

  }
  public getAllDesignation() {
    return this.httpClient.get<Array<any>>(this.baseUrl + 'HrDesignation/GetAllDesignation')
  }
  public updateDesignation(payload: any) {
    return this.httpClient.post(this.baseUrl + 'HrDesignation/UpdateDesignation', payload);
  }
  public deleteDesignation(id: number) {
    return this.httpClient.post(`${this.baseUrl}HrDesignation/DeleteDesignation/${id}`, {});
  }

  public getDesignationid(id) {
    return this.httpClient.get(this.baseUrl + `HrDesignation/GetDHrDesignationById/${id}`);
  }

  // public getAllDesignationWithSubscribe() {
  //   if (this.designatinMasterArray && this.designatinMasterArray.length > 0) {
  //     return
  //   }
  //   this.httpClient.get<Array<DesignationMaster>>(this.baseUrl + 'HrDesignation/GetAllDesignation').subscribe((res: DesignationMaster[]) => {
  //     this.designatinMasterArray = res
  //     this.designatinMasterArrayDuplicate = res
  //   }, (error: any) => {
  //     this.messageService.add({ severity: 'error', summary: 'Api response error', detail: error });
  //   });
  // }

}
