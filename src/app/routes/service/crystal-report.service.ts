import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReportFilterModel } from '../domain/Masters/ReportFilterModel';
import { MasterApiService } from './master.api.services';

@Injectable({
  providedIn: 'root',
})
export class CrystalReportService {

  private reportUrl = environment.reportApiUrl;
  private baseUrl = environment.apiRootURL;

  constructor(
    private http: HttpClient,
    private masterApi: MasterApiService
  ) { }

  /* ---------------------------------- */
  /* Generic Helpers                    */
  /* ---------------------------------- */

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'blob' as const
    };
  }

  private resolveClient(): string {

    const url = new URL(this.baseUrl);
    const host = url.hostname;
    const port = url.port;

    const clients =
      host === '194.233.95.37'
        ? this.getClientMapping1()
        : this.getClientMapping();

    return clients[host] ?? clients[port] ?? clients['default'];
  }

  private requestReport(endpoint: string, data: any): Observable<Blob> {

    const client = this.resolveClient();

    return this.http.put(
      `${this.reportUrl}${endpoint}/${client}`,
      data,
      this.getHttpOptions()
    );
  }

  /* ---------------------------------- */
  /* API Calls                          */
  /* ---------------------------------- */

  GetReportName(id: number) {
    return this.http.get(`${this.baseUrl}/master/GetReportName/${id}`);
  }

  getDynamicReport(data: any): Observable<Blob> {
    return this.http.post(
      `${this.reportUrl}cr/DynamicReportCall`,
      data,
      this.getHttpOptions()
    );
  }

  getReportPrint(data: any, isByQuery: boolean) {

    const endpoint = isByQuery
      ? 'Reports/getPrintByQuery'
      : 'Reports/getReportPrint';

    return this.requestReport(endpoint, data);
  }

  getReportPrintBySp(data: any) {
    return this.requestReport('Reports/getPrintBySp', data);
  }

  downloadReport(data: ReportFilterModel) {
    return this.requestReport('reports/getReportPrint', data);
  }

  /* ---------------------------------- */
  /* Client Mapping                     */
  /* ---------------------------------- */

  private getClientMapping(): Record<string, string> {
    return {
      '192.168.1.249': 'WaterBird',
      '8088': 'Hubco',
      '8094': 'InspireNc',
      '8096': 'Geomak',
      '8111': 'mexcio',
      '8302': 'Horizon',
      '8207': 'Demo',
      '8318': 'Technomak',
      // '8326': 'Technomak',
      '8018': 'SilverStar',
      '8015': 'AceVision',
      '8002': 'green',
      '8064': 'NGB',
      '8086': 'WaterBird',
      '811': 'Laundry',
      '8036': 'Theory',
      '8189': 'AlQasimiGroup',
      '8101': 'Ramz_Aletqan',
      '8103': 'AlHammadi',
      '8045': 'Demo2',
      default: 'Demo',
    };
  }

  private getClientMapping1(): Record<string, string> {
    return {
      '8002': 'green',
      '8064': 'NGB',
      '8088': 'Hubco',
      '8111': 'mexcio',
      '8302': 'Horizon',
      // '8207': 'Demo',
      // '8318': 'Springer',
      // '8326': 'Technomak',
      '8018': 'SilverStar',
      '8015': 'AceVision',
      '802': 'BetterBathware',
      '803': 'Universal',
      '806': 'Cosmo',
      // '809': 'DemoNew',
      // '811': 'Laundry',
      '885': 'AlRaedroad',
      '811': 'Laundry',
      '8036': 'Theory',
      '8189': 'AlQasimiGroup',
      '8101': 'Ramz_Aletqan',
      '8103': 'AlHammadi',
      '8318': 'Technomak',
      '8045': 'Demo2',
      default: 'Demo',
    };
  }
}