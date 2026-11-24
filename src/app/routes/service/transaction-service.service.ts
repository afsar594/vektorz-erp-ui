import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Subject } from 'rxjs';
import { MasterUrls } from './hrurl.api';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
 

  baseUrl: string;
  SalaryHeadsArray: any[] = [];
  AssetsArray: any[] = [];
  OtherExpenseMasterArray: any[] = [];
  OtherExpensePropertiesArray: any[] = [];
  DocumentMasterArray: any[] = [];
  StaffDocumentMasterArray: any[] = [];
  VehicleDocumentMaster: any[] = [];
  DocumentIMagesArray: any[] = [];
  HrMotnSalarayArray: any[] = [];
  HrMotnSalarayDeductionStaffsArray: any[] = [];
  HrLeaveMasterAray: any[] = [];
  HrLeaveMasterStaffAray: any[] = [];
  CompanyCalendarArray: any[] = [];
  GenerateCalendarArray: any[] = [];
  ChangeDepartmentArray: any[] = [];
  isChangeDepartmentCall = new Subject<boolean>()
  ChangeDepartmentDetArray: any[] = [];
  MobilizationDetailArray: any[] = [];
  MobilizationArray: any[] = [];
  PassportArray: any[] = [];
  PassportStaffArray: any[] = [];
  CompanyCalendarWeekendArray: any[];
  HrDailyShiftArray: any[];
  HrDailyShiftDayoffDetailsArray: any[];
  IncremtnArray: any[];
  IncremtnDetailArray: any[];
  SalaryPckg: any[];
  HrALOpeningStaffArray: any[];
  LeaveRejoiningData: any[];
  LoanSalaryHeadsArray: any[] = [];
  StaffDocumentsArray: any[] = [];
  VehcileDocumentsArray: any[] = [];
  PayrollList: any[] = [];
  LeaveSalaryList: any[] = [];
  SaveLeaveSalary = new BehaviorSubject(false)
  EditLeaveSalary = new BehaviorSubject(false)
  RemoveLeaveSalary = new BehaviorSubject(false)
  constructor(private httpClient: HttpClient, private messageService: MessageService) {
    this.baseUrl = environment.apiRootURL;
  }
  InsertHrDocumentImage(payload: any) {
    delete payload.docImageId
    return this.httpClient.post(this.baseUrl + MasterUrls.InsertHrDocumentImage, payload);
  }

  GetAllVehicleDocumentMaster() {
    this.httpClient.get<Array<any>>(this.baseUrl + MasterUrls.GetAllVeicleDocumentMaster).subscribe((res: any[]) => {
      this.VehicleDocumentMaster = res as any[]
    }, (error: any) => {
      this.messageService.add({ severity: 'error', summary: 'Api response error', detail: error });
    });
  }

  GetAllHrDocumentMasters() {
    return this.httpClient.get(this.baseUrl + MasterUrls.GetAllHrDocumentMasters);
  }

  GetDocumentMasterByID(Id: any) {
    return this.httpClient.get(`${this.baseUrl}${MasterUrls.GetDocumentMasterByID}/${Id}`);
  }
  
  DeleteHrDocumentMaster(Id: any) {
    return this.httpClient.delete(`${this.baseUrl}${MasterUrls.DeleteHrDocumentMaster}?Id=${Id}`);
  }
  
  UpdateHrDocumentMaster(payload: any) {
    return this.httpClient.post(this.baseUrl + MasterUrls.UpdateHrDocumentMaster, payload);
  }
  InsertHrDocumentMaster(payload: any) {
    return this.httpClient.post(this.baseUrl + MasterUrls.InsertHrDocumentMaster, payload);
  }
  GetDocumentReport(payload: any) {
    return this.httpClient.post(this.baseUrl + MasterUrls.GetDocumentReports, payload);
  }
  
  GetDocumentMasterByVehicleID(vehicleId: any) {
    return this.httpClient.get(this.baseUrl + MasterUrls.GetDocumentMasterByVehicleID + "?vehicleId=" + vehicleId);
  }

  getDocumentImagesByMasterId(Id: any) {
    return this.httpClient.get<Array<any>>(this.baseUrl + "getDocumentImagesByMasterId?Id=" + Id)
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

  GetDocumentMasterByStaffID(staffId: any) {
    return this.httpClient.get(this.baseUrl + MasterUrls.GetDocumentMasterByStaffID + "?staffId=" + staffId);
  }
 
  
  GetAllDocumentsStaff() {
    this.httpClient.get<Array<any>>(this.baseUrl + "GetAllDocumentsStaff").subscribe((res: any[]) => {
      this.StaffDocumentsArray = res as any[]
    }, (error: any) => {
      this.messageService.add({ severity: 'error', summary: 'Api response error', detail: error });
    });
  }

  GetAllDocumentsVehicle() {
    this.httpClient.get<Array<any>>(this.baseUrl + "GetAllDocumentsVehicle").subscribe((res: any[]) => {
      this.VehcileDocumentsArray = res as any[]
    }, (error: any) => {
      this.messageService.add({ severity: 'error', summary: 'Api response error', detail: error });
    });
  }
  
  GetAllCompanies(){
    return this.httpClient.get(this.baseUrl + MasterUrls.HrGetAllCompanies);
  }
  GetAlldocumentTypeList(){
    return this.httpClient.get(this.baseUrl + MasterUrls.GetAlldocumentType);
  }
  
  GetAllDocumentType(){
    return this.httpClient.get(this.baseUrl + MasterUrls.HrGetAllDocumentTypes);
  }
  InsertDocumentType(payload){
    return this.httpClient.post(this.baseUrl + MasterUrls.InsertHrDocumentType, payload);
    }
  UpdateDocumentType(id,payload){
    return this.httpClient.post(this.baseUrl + MasterUrls.UpdateHrDocumentType, payload);

  }

  GetDocumentTypebyId(id: any) {
    return this.httpClient.get(this.baseUrl + MasterUrls.GetDocumenttypeByID + "/" + id);
  }

  GetByIdDocumentType(id){
    
  }
  DeleteDocumentType(id){
    return this.httpClient.delete(this.baseUrl + MasterUrls.DeleteHrDocumentType + "?Id=" + id);

  }
}



