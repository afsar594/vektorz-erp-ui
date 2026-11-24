import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HrStaffMasterService {

  baseUrl: string = environment.apiRootURL;
  SalesVoucherWithDetails: any[] = [];
  constructor(private http: HttpClient) { }

  getAllStaff() {
    return this.http.get(this.baseUrl + `HrStaffMaster/GetAllHrStaff`)
  }
}
