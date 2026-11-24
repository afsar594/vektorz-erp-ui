import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChargesService {
  baseUrl: string = environment.apiRootURL;

  constructor(private httpClient: HttpClient) {}

  public GetAllOtherChargesMaster(): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + 'GetAllOtherChargesMaster'
    );
  }
  public GetAllOtherChargesMasterByType(type): Observable<any> {
    return this.httpClient.get<any[]>(
      this.baseUrl + `GetAllOtherChargesMasterByType?type=${type}`
    );
  }
}
