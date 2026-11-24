import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data',
  })
};
@Injectable({
  providedIn: 'root'
})
export class ImportApiService {

  baseUrl: string = environment.apiRootURL;
  constructor(private httpClient: HttpClient) { }
  public upload(file) {
    return this.httpClient.post(this.baseUrl + ImportFile.excel, file, httpOptions);
  }
  public uploadDOCs(file: FormData, id: number, type: string) {
    return this.httpClient.post(this.baseUrl + `DocumentAttachments/readpdffile?Id=${id}&type=${type}`, file);
  }

  public uploadPdf(file: FormData, id: number) {
    return this.httpClient.post(this.baseUrl + `readpdffile/${id}`, file);
  }
  public downloadAllFilesAsOnePdf(id: number,type: string, p0: { responseType: string; observe: "body"; }): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(this.baseUrl + `DocumentAttachments/DownloadAllFilesAsOnePdf/${id}/${type}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }


  public GETuploadEDPdf(id: number) {
    return this.httpClient.get(this.baseUrl + `GetAllJobDocumentById?id=${id}`);
  }

  public uploadedPdf(id: number, type: string) {
    return this.httpClient.get(this.baseUrl + `DocumentAttachments/GetAllDocumentById?id=${id}&type=${type}`);
  }

  public DeleteJobDocument(id: number) {
    return this.httpClient.get(this.baseUrl + `DeleteJobDocument?id=${id}`);
  }
  public DeleteDocument(id: number) {
    return this.httpClient.get(this.baseUrl + `DocumentAttachments/DeleteDocument?id=${id}`);
  }

  public docsdownloadPdf(id: number): Observable<Blob> {
    return this.httpClient.get(this.baseUrl + `DocumentAttachments/GetPdfById/${id}`, {
      responseType: 'blob',
    });
  }

  public downloadPdf(jobDocumentJobId: number, jobDocumentId: number): Observable<Blob> {
    return this.httpClient.get(this.baseUrl + `GetJobPdfById/${jobDocumentId}`, {
      responseType: 'blob',
    });
  }
   
}

enum ImportFile {
  excel = "weatherforecast/readexcelfile",
  pdf = "readpdffile"
}

