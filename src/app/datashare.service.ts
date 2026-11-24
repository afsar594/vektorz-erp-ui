import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatashareService {
  private selectedValuStockeSubject = new BehaviorSubject<any>(null);
  private selectedValueVatSubject = new BehaviorSubject<any>(null);

  constructor() { }

  setSelectedStockValue(value: any) {
    this.selectedValuStockeSubject.next(value);
  }

  getSelectedStockValue(): Observable<any> {
    return this.selectedValuStockeSubject.asObservable();
  }

  setSelectedVatValue(value: any) {
    this.selectedValueVatSubject.next(value);
  }

  getSelectedVatValue(): Observable<any> {
    return this.selectedValueVatSubject.asObservable();
  }
}
