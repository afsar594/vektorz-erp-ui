import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../domain/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  baseUrl: string = environment.apiRootURL;
  constructor(private http: HttpClient) { }
  
  public getOptionSetting(search: string) {
    return this.http.get<ApiResponse<boolean>>(this.baseUrl + `OptionsMaster/GetOptionSetting?search=${search}`)

  }
  public getOptionSettingByKey(key: string) {
    return this.http.get<ApiResponse<boolean>>(this.baseUrl + `OptionsMaster/GetOptionSetting/${key}`)

  }

  public getOptionMasterSettings(){
    return this.http.get<ApiResponse<boolean>>(this.baseUrl + 'OptionsMaster/getAllOPtionSettings')
  }

}
