import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ReportURL } from './url.api';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};
@Injectable({
  providedIn: 'root'
})
export class ReportService {

  baseUrl: string = environment.apiRootURL;
  DetailWiseIssueReport: any[] = [];
  JobWiseIssueReport: any[] = [];
  SummaryWiseIssueReport: any[] = [];;
  constructor(private httpClient: HttpClient) { }

  public GetDetailWiseIssueVoucherReport(reportObj: any): Observable<any> {
    return this.httpClient.post<any[]>(this.baseUrl + ReportURL.GetDetailWiseIssueVoucherReport, reportObj);
  }

  public GetJobWiseIssueVoucherReport(reportObj: any) : Observable<any> {
   return  this.httpClient.post<any[]>(this.baseUrl + ReportURL.GetJobWiseIssueVoucherReport, reportObj);
  }

  public GetSummaryWiseIssueReport(reportObj: any) {
    this.SummaryWiseIssueReport =[]
    this.httpClient.post<any[]>(this.baseUrl + ReportURL.GetSummaryWiseIssueReport, reportObj).subscribe((res: any[]) => {
      this.SummaryWiseIssueReport = res as any[]
    }, error => {

    });
  }
}
