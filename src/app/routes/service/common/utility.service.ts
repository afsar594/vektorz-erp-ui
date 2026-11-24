import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../../domain/ApiResponse';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { BaseRenderer } from 'handsontable/renderers';
import Handsontable from 'handsontable';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MasterApiService } from '../master.api.services';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ProgramSettings } from '../../domain/Settings/program';
import { AccountApiService } from '../account.api.service';
import { ChargesService } from '../charges.service';
import { DecimalConfigService } from '../decimal-config.service';
import { get } from 'http';
import { BoqService } from '../sales/boq.service';
import { SalesApiService } from '../sales.api.services';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  baseUrl: string = environment.apiRootURL;
  pageOption = [10, 30, 50, 100, 200, 500, 1000, 3000, 5000];
  defaultPagination = {
    pageSize: 10,
    currentPage: 1,
    pageOption: this.pageOption,
  };
  private settingsCache: { [key: string]: any } = {};
  private accountSettingCache: { [key: string]: any } = {};
  private GeneralSettingbyKey: { [key: string]: any } = {};
  private programSettingByKey: { [key: string]: any } = {};
  private paymentDropdownCache: any = null;
  private programSettingsCache: any = null;
  private jobMasterDropDown: any = null;
  private chargeMasterList: any = null;
  private unitDropDown: any = null;
  private currencyMasterDropDown: any = null;
  private supplierMasterDropDown: any = null;
  private LocationMasterDropDown: any = null;
  private accountSettingDropDown: any = null;
  private chartOfAccountDropDown: any = null;
  private costCenterDropDown: any = null;
  private brandMasterDropDown: any = null;
  private salesManDropDown: any = null;
  private customerDropDown: any = null;
  private departmentDropDown: any = null;
  private costCenterData: any = null;
  boqdata: any;
  customerenquiryDropDown: any;

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    public datePipe: DatePipe,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private chargesapi: ChargesService,
    private decimalConfig: DecimalConfigService,
    private salesapi: SalesApiService,
    private storage: LocalStorageService
  ) { }

  // Reads the location selected at login (localStorage key 'selectedItemLocation').
  // Tolerates both the object and the double-stringified value that login.component stores.
  getLockedLocationId(): number {
    try {
      let value: any = this.storage.get('selectedItemLocation');
      if (typeof value === 'string') {
        value = JSON.parse(value);
      }
      return Number(value?.locationMasterLocationId) || 0;
    } catch {
      return 0;
    }
  }

  // Locks the location FormControl when a login location exists: sets its value and disables it.
  // Returns true when the control was locked. Using the FormControl disabled state (not just the
  // template [disabled] binding) keeps it locked even after formGroup.enable() is called.
  applyLocationLock(form: FormGroup, locationControl: string): boolean {
    const control = form?.get(locationControl);
    const id = this.getLockedLocationId();
    if (id > 0 && control) {
      control.setValue(id);
      control.disable();
      return true;
    }
    return false;
  }

  // Re-applies the location lock after formGroup.enable()/reset() re-enabled the control.
  reapplyLocationLock(form: FormGroup, locationControl: string, locked: boolean): void {
    if (locked) {
      form?.get(locationControl)?.disable();
    }
  }

  AddUserTrackingLog(data: any) {
    return this.http.post<ApiResponse<any>>(
      this.baseUrl + 'Utility/AddUserTrackingLog',
      data
    );
  }

  getTableConfig(
    columnData: any[],
    hiddenColumns = [],
    config: { minRows?: number; height?: string } = {
      minRows: 6,
      height: '300px',
    }
  ): Handsontable.GridSettings {
    return {
      rowHeaders: true,
      fixedColumnsLeft: 1,
      afterGetColHeader: (col, TH) => {
        TH.className = 'custom-th-header';
        const rawLabel = columnData[col]?.label || '';
        const translated = rawLabel ? (this.translate.instant(rawLabel) || rawLabel) : '';
        TH.title = columnData[col]?.toolTip || translated || rawLabel;
        const columnType = columnData[col]?.type;
        const isNumeric = columnType === 'numeric';
        const isCheckBox = columnType === 'checkbox';

        TH.className = `custom-th-header ${isNumeric
          ? 'htRight'
          : TH.title == 'Action' || isCheckBox
            ? 'htCenter'
            : 'htLeft'
          }`;

        // Ensure the header span displays the translated label
        if (translated) {
          const colHeaderSpan = TH.querySelector('.colHeader');
          if (colHeaderSpan && colHeaderSpan.textContent !== translated) {
            colHeaderSpan.textContent = translated;
          }
        }
      },
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      minRows: config.minRows,
      width: '100%',
      height: config.height,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      columnSorting: true,
      allowInsertRow: true,
      stretchH: 'all',
      manualRowResize: true,
      readOnly: true,
      manualColumnResize: true,
      columns: this.getColumns(columnData),
      colHeaders: this.getHeaders(columnData),
      manualRowMove: true,
      manualColumnMove: true,
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: false,
      },
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
      enterMoves: { row: 0, col: 1 },
      licenseKey: 'your-license-key', // Don't forget this
    };
  }

  readonly wrapTextRenderer: BaseRenderer = (
    instance: Handsontable,
    td: HTMLTableCellElement,
    row: number,
    col: number,
    prop: string,
    value: any,
    cellProperties: Handsontable.CellProperties
  ) => {
    if (!td) td = document.createElement('td');

    Handsontable.renderers.TextRenderer.call(
      this,
      instance,
      td,
      row,
      col,
      prop,
      value,
      cellProperties
    );

    const isNumeric = cellProperties.type === 'numeric';
    const isCheckBox = cellProperties.type === 'checkbox';
    td.className = isNumeric ? 'htRight' : isCheckBox ? 'htCenter' : 'htLeft';

    if (cellProperties.isHeader) {
      td.classList.add(isNumeric ? 'header-numeric' : 'header-text');
    }

    if (td && typeof value === 'string') {
      td.textContent = this.formatText(value);
    }
    Object.assign(td.style, {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      fontSize: '15px',
      padding: '5px',
    });

    return td;
  };
  private formatText(text: string): string {
    const cleaned = text.trim();
    const chunks = [];
    let currentLine = '';

    cleaned.split(/\s+/).forEach((word) => {
      if (currentLine.length + word.length <= 80) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        chunks.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) chunks.push(currentLine);
    return chunks.join('\n');
  }

  getColumns(list) {
    return list.map((col) => {
      const isNumeric = col.type === 'numeric';
      const isCheckbox = col.type === 'checkbox';

      const columnDef: any = {
        data: col.data,
        type: col.type,
        renderer: this.checkRenderOption(col),
        readOnly: col?.readOnly ?? true,
        source: (query, callback) => {
          callback(col.source);
        },
        numericFormat: isNumeric
          ? { pattern: '0,0.00', culture: 'en-US' }
          : undefined,
        width: col.width || undefined,
      };

      if (isCheckbox) {
        columnDef.editor = 'checkbox';
        columnDef.renderer = 'checkbox';
        columnDef.readOnly = col?.readOnly ?? false;
        columnDef.className = 'htCenter htMiddle';
      } else if (isNumeric) {
        columnDef.renderer = this.getNumericRenderer();
        columnDef.editor = this.getStrictNumericEditor();
      } else {
        columnDef.editor = col.type;
      }

      return columnDef;
    });
  }
  getNumericRenderer() {
    const point = this.decimalConfig.getDecimal();
    return function (
      instance: Handsontable,
      td: HTMLTableCellElement,
      row: number,
      col: number,
      prop: string,
      value: any,
      cellProperties: Handsontable.CellProperties
    ) {
      // Call the default numeric renderer
      Handsontable.renderers.NumericRenderer.apply(this, arguments);

      // Custom formatting: show decimals only when needed
      if (value !== null && value !== undefined && value !== '') {
        const num = Number(value);
        if (!isNaN(num)) {
          // Check if the number is a whole number
          if (Number.isInteger(num)) {
            // Whole number - no decimal places
            td.textContent = num.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              useGrouping: false,
            });
          } else {
            const formatted = num.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: point,
              useGrouping: false,
            });

            // Ensure we don't show trailing .0 or .00
            td.textContent = formatted.replace(/\.0+$/, '');
          }
        }
      }

      td.className = 'htRight';
      return td;
    };
  }

  private getStrictNumericEditor() {
    const num: any = this.decimalConfig.getDecimal();

    return class extends Handsontable.editors.TextEditor {
      beginEditing(initialValue, event) {
        super.beginEditing(initialValue, event);

        // Force numeric keyboard on mobile
        this.TEXTAREA.inputMode = 'decimal';

        // Only allow numbers and single decimal point
        this.TEXTAREA.addEventListener('keydown', (e) => {
          const allowedKeys = [
            'Backspace',
            'Delete',
            'ArrowLeft',
            'ArrowRight',
            'Tab',
          ];
          if (allowedKeys.includes(e.key)) {
            return;
          }

          // Allow numbers 0-9
          if (e.key >= '0' && e.key <= '9') {
            return;
          }

          // Allow single decimal point
          if (e.key === '.' && !this.TEXTAREA.value.includes('.')) {
            return;
          }

          // Prevent any other input
          e.preventDefault();
        });
      }

      getValue() {
        const value = super.getValue();
        // Ensure value has max 2 decimal places
        if (value.includes('.')) {
          const parts = value.split('.');
          return `${parts[0]}.${parts[1].slice(0, num)}`;
        }
        return value;
      }
    };
  }
  getHeaders(list) {
    return list.map((col) => {
      const label = col?.label || '';
      return label ? (this.translate.instant(label) || label) : '';
    });
  }
  dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      let dateValue;

      if (typeof value === 'string' && value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = value.split('/');
        dateValue = new Date(+year, +month - 1, +day);
      } else if (typeof value === 'string') {
        dateValue = new Date(value);
      } else {
        dateValue = value;
      }

      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        const formattedDate = this.datePipe.transform(dateValue, 'dd/MM/yyyy');
        td.innerText = formattedDate ? formattedDate : '';
      } else {
        td.innerText = value;
      }
    } else {
      td.innerText = '';
    }

    td.style.whiteSpace = 'pre-wrap';
    td.style.wordBreak = 'break-word';
    td.style.fontSize = '15px';
    td.style.padding = '5px';
  }
  fromAndToDateformater(value, type: 'from' | 'to') {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const time = type === 'from' ? 'T00:00:00' : 'T23:59:59';

    return `${year}-${month}-${day}${time}`;
  }
  isRowDisabled(rowIndex: number, hotInstance: any): boolean {
    if (rowIndex === 0) return false;

    for (let i = 0; i < rowIndex; i++) {
      const rowData = hotInstance.getDataAtRow(i);
      const isRowEmpty = !rowData || !rowData[0] || rowData[0] === '';

      if (isRowEmpty) {
        return true;
      }
    }

    return false;
  }
  checkRenderOption(col: any) {
    const isDate = col.label.toLowerCase().includes('date');
    // if (
    //   col.label == 'View' ||
    //   col.data == 'genBarcode' ||
    //   col.data == 'print'
    // ) {
    if (col.renderer) {
      return col.renderer;
    } else if (isDate) {
      return this.dateRenderer.bind(this);
    } else {
      return this.wrapTextRenderer;
    }
  }

  initializeAllStorage(): void {
    this.settingsCache = {};
    this.accountSettingCache = {};
    this.GeneralSettingbyKey = {};
    this.programSettingByKey = {};
    this.paymentDropdownCache = null;
    this.programSettingsCache = null;
    this.jobMasterDropDown = null;
    this.unitDropDown = null;
    this.currencyMasterDropDown = null;
    this.supplierMasterDropDown = null;
    this.LocationMasterDropDown = null;
    this.accountSettingDropDown = null;
    this.chartOfAccountDropDown = null;
    this.costCenterDropDown = null;
    this.brandMasterDropDown = null;
    this.salesManDropDown = null;
    this.customerDropDown = null;
    this.departmentDropDown = null;
    this.costCenterData = null;
  }
  getProgramSettings(keys: string): Observable<any[]> {
    const keyArray = keys.split(',').map((k) => k.trim());
    const missingKeys = keyArray.filter((key) => !this.settingsCache[key]);
    if (missingKeys.length === 0) {
      const cachedData = keyArray
        .map((key) => this.settingsCache[key])
        .filter((item) => item != null);
      return of(cachedData);
    }

    return new Observable((observer) => {
      this.masterapi.bykeys(missingKeys.join(',')).subscribe({
        next: (response: any) => {
          const res = (response || []).filter((item: ProgramSettings) => item != null);
          res.forEach((item: ProgramSettings) => {
            this.settingsCache[item.programSettingsKeyValue] = item;
          });

          const finalData = keyArray
            .map((key) => this.settingsCache[key])
            .filter((item) => item != null);
          observer.next(finalData);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
  getPaymentDropdown(): Observable<any> {
    if (this.paymentDropdownCache) {
      return of(this.paymentDropdownCache);
    }

    return new Observable((observer) => {
      this.accountapi.GetPaymentDropdown().subscribe({
        next: (response) => {
          this.paymentDropdownCache = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
  GetProgramSettingsDropdown(isRefresh = false): Observable<any> {
    if (this.programSettingsCache && !isRefresh) {
      return of(this.programSettingsCache);
    }
    return new Observable((observer) => {
      this.masterapi.GetProgramSettingsDropdown().subscribe({
        next: (response) => {
          this.programSettingsCache = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  GetAllAccountsbyKey(key: string): Observable<any[]> {
    if (this.accountSettingCache[key]) {
      return of(this.accountSettingCache[key]);
    }
    return new Observable((observer) => {
      this.masterapi.GetAllAccountsbyKey(key).subscribe({
        next: (response: any) => {
          this.accountSettingCache[key] = response || [];

          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  GetGeneralSettingbyKey(key: string): Observable<any[]> {
    if (this.GeneralSettingbyKey[key]) {
      return of(this.GeneralSettingbyKey[key]);
    }
    return new Observable((observer) => {
      this.masterapi.GetGeneralSettingbyKey(key).subscribe({
        next: (response: any) => {
          this.GeneralSettingbyKey[key] = response || [];

          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  GetProgramSettingbyKey(key: string, isRefresh = false): Observable<any[]> {
    if (this.programSettingByKey[key] && !isRefresh) {
      return of(this.programSettingByKey[key]);
    }
    return new Observable((observer) => {
      this.masterapi.GetProgramSettingbyKey(key).subscribe({
        next: (response: any) => {
          this.programSettingByKey[key] = response || [];

          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadDropdowjobMasters(isRefresh = false) {
    if (this.jobMasterDropDown && !isRefresh) {
      return of(this.jobMasterDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadDropdowjobMasters().subscribe({
        next: (response) => {
          this.jobMasterDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  GetAllOtherChargesMaster(isRefresh = false) {
    if (this.chargeMasterList && !isRefresh) {
      return of(this.chargeMasterList);
    }
    return new Observable((observer) => {
      this.chargesapi.GetAllOtherChargesMaster().subscribe({
        next: (response) => {
          this.chargeMasterList = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadDropdownunitMasters(isRefresh = false) {
    if (this.unitDropDown && !isRefresh) {
      return of(this.unitDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadDropdownunitMasters().subscribe({
        next: (response) => {
          this.unitDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadDropdowCurrencyMaster(isRefresh = false) {
    if (this.currencyMasterDropDown && !isRefresh) {
      return of(this.currencyMasterDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadDropdowCurrencyMaster().subscribe({
        next: (response) => {
          this.currencyMasterDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadDropdownLocationMaster(isRefresh = false) {
    if (this.LocationMasterDropDown && !isRefresh) {
      return of(this.LocationMasterDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadDropdownLocationMaster().subscribe({
        next: (response) => {
          this.LocationMasterDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadDropdownSuppliersMaster(isRefresh = false) {
    if (this.supplierMasterDropDown && !isRefresh) {
      return of(this.supplierMasterDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadDropdownSuppliersMaster().subscribe({
        next: (response) => {
          this.supplierMasterDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadDropdownaccountsSettings(isRefresh = false) {
    if (this.accountSettingDropDown && !isRefresh) {
      return of(this.accountSettingDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadDropdownaccountsSettings().subscribe({
        next: (response) => {
          this.accountSettingDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadDropdowchartofAccounts(isRefresh = false) {
    if (this.chartOfAccountDropDown && !isRefresh) {
      return of(this.chartOfAccountDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadDropdowchartofAccounts().subscribe({
        next: (response: any) => {
          this.chartOfAccountDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadDropdowncostcenterMasters(isRefresh = false) {
    if (this.costCenterDropDown && !isRefresh) {
      return of(this.costCenterDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadDropdowncostcenterMasters().subscribe({
        next: (response) => {
          this.costCenterDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadDropdownBrandMasters(isRefresh = false) {
    if (this.brandMasterDropDown && !isRefresh) {
      return of(this.brandMasterDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadDropdownBrandMasters().subscribe({
        next: (response) => {
          this.brandMasterDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadCustomerDropdown(isRefresh = false) {
    if (this.customerDropDown && !isRefresh) {
      return of(this.customerDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadCustomerDropdown().subscribe({
        next: (response) => {
          this.customerDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  LoadSaleManDropdown(isRefresh = false) {
    if (this.salesManDropDown && !isRefresh) {
      return of(this.salesManDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadSaleManDropdown().subscribe({
        next: (response) => {
          this.salesManDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
  GetCustomerEnquiryDropdown(isRefresh = false) {
    if (this.customerenquiryDropDown && !isRefresh) {
      return of(this.customerenquiryDropDown);
    }
    return new Observable((observer) => {
      this.salesapi.GetCustomerEnquiryDropdown().subscribe({
        next: (response) => {
          this.customerenquiryDropDown = response;
          observer.next(response);
          observer.complete();
        }
        , error: (err) => observer.error(err),
      });
    });
  }

  LoadDepartmentDropdown(isRefresh = false) {
    if (this.departmentDropDown && !isRefresh) {
      return of(this.departmentDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.LoadDepartmentDropdown().subscribe({
        next: (response) => {
          this.departmentDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  GetAllCostCenter(isRefresh = false) {
    if (this.costCenterData && !isRefresh) {
      return of(this.costCenterData);
    }
    return new Observable((observer) => {
      this.masterapi.GetAllCostCenter().subscribe({
        next: (response) => {
          this.costCenterData = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
  jobInvoiceDropDown: any;
  getJobinvoiceDropdown(isRefresh = false) {
    if (this.jobInvoiceDropDown && !isRefresh) {
      return of(this.jobInvoiceDropDown);
    }
    return new Observable((observer) => {
      this.accountapi.getJobinvoiceDropdown().subscribe({
        next: (response) => {
          this.jobInvoiceDropDown = response;
          observer.next(response);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
}
