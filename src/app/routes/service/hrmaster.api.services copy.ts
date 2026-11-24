import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { MasterUrls } from './hrurl.api';
import { StaffMaster } from '../domain/document/StaffMaster';
import { Subject } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};
@Injectable({
  providedIn: 'root'
})
export class MasterApiService {
  HrDocumentStatusArray: any[];
  HrDocumentTypesArray:any[];
  staffMasterArray:any[];
  staffMasterArrayDuplicate:any[]=[];
  StaffDocumentsArray: any[] = [];
  isStaffApiCall = new Subject<boolean>()
  baseUrl: string = environment.apiRootURL;
  AllHrVehicleMasterArray: any[] =[];
  DocumentIMagesArray: any[];
  constructor(private httpClient: HttpClient, private messageService: MessageService) { }

  GetAllHrDocumentStatus() {
    if (this.HrDocumentStatusArray && this.HrDocumentStatusArray.length > 0) {
      return
    }
    this.httpClient.get<Array<any>>(this.baseUrl + MasterUrls.GetAllHrDocumentStatus).subscribe((res: any[]) => {
      this.HrDocumentStatusArray = res as any[]
    }, (error: any) => {
      this.messageService.add({ severity: 'error', summary: 'Api response error', detail: error });
    });
  }
  GetDocumentMasterByVehicleID(vehicleId: any) {
    return this.httpClient.get(this.baseUrl + MasterUrls.GetDocumentMasterByVehicleID + "?vehicleId=" + vehicleId);
  }


  GetAllHrDocumentImages() {
    if (this.DocumentIMagesArray && this.DocumentIMagesArray.length > 0) {
      return
    }
    this.httpClient.get<Array<any>>(this.baseUrl + MasterUrls.GetAllHrDocumentImages).subscribe((res: any[]) => {
      this.DocumentIMagesArray = res as any[]
    }, (error: any) => {
      this.messageService.add({ severity: 'error', summary: 'Api response error', detail: error });
    });
  }

  GetAllDocumentTypes() {
    if (this.HrDocumentTypesArray && this.HrDocumentTypesArray.length > 0) {
      return
    }
    this.httpClient.get<Array<any>>(this.baseUrl + MasterUrls.HrGetAllDocumentTypes).subscribe((res: any[]) => {
      this.HrDocumentTypesArray = res as any[]
    }, (error: any) => {
      this.messageService.add({ severity: 'error', summary: 'Api response error', detail: error });
    });
  }

  GetAllHrVehicleMaster() {
    if (this.AllHrVehicleMasterArray && this.AllHrVehicleMasterArray.length > 0) {
      return
    }
    this.httpClient.get<Array<any>>(this.baseUrl + MasterUrls.GetAllHrVehicleMaster).subscribe((res: any[]) => {
      this.AllHrVehicleMasterArray = res as any[]
    }, (error: any) => {
      this.messageService.add({ severity: 'error', summary: 'Api response error', detail: error });
    });
  }
  getAllStaffMasterWithSubscribe() {
    if (this.staffMasterArray && this.staffMasterArray.length > 0) {
      return
    }
    this.httpClient.get<Array<StaffMaster>>(this.baseUrl + MasterUrls.GetAllStaffMaster).subscribe((res: StaffMaster[]) => {
      this.staffMasterArray = res
      this.staffMasterArrayDuplicate = res
      this.isStaffApiCall.next(true)
    }, (error: any) => {
      this.messageService.add({ severity: 'error', summary: 'Api response error', detail: error });
    });
  }

  GetAllDocumentsStaff() {
    this.httpClient.get<Array<any>>(this.baseUrl + "GetAllDocumentsStaff").subscribe((res: any[]) => {
      this.StaffDocumentsArray = res as any[]
    }, (error: any) => {
      this.messageService.add({ severity: 'error', summary: 'Api response error', detail: error });
    });
  }

}
