import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { TransactionService } from 'src/app/routes/service/transaction-service.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-document-report',
  templateUrl: './document-report.component.html',
  styleUrls: ['./document-report.component.scss']
})
export class DocumentReportComponent implements OnInit {
  title: any;
  subtitle: any;
  dataset: any;
  licensekey: any;
  documentTypeList: any;
  documentTypeArray: any;
  companiesArray: any;
  companiesList: any;
  index: number = 0;
  DocumentReportFormGroup: FormGroup
  defaultValue: any
  DataList: any;
  handleChange(e) {
    this.index = e.index;
  }

  constructor(private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    public transactionService: TransactionService,
    private datePipe: DatePipe
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  hotid1 = 'document1';
  private hotRegisterer = new HotTableRegisterer();
  document1: Handsontable.GridSettings;
  initializeControls1() {
    this.document1 = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [20, 70, 30, 30, 30],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      // allowInsertColumn: false,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        // {
        //   data: 'ID',
        //   type: 'text',
        //  },
        {
          data: 'documentvoucherNo',
          type: 'text',
        },
        {
          data: 'companyname',
          type: 'text',

        },
        {
          data: 'docName',
          type: 'text',
        },
        {
          data: 'documenttype',
          type: 'text',
        },
        {
          data: 'expDate',
          type: 'text', // Use text type to display formatted date
          renderer: this.dateRenderer.bind(this),
          readOnly: true,
          className: 'htCenter',
        },

        {
          data: 'remarks',
          type: 'text',

        },

      ],
      colHeaders: [
        this.translate.instant('Voucher No'),
        this.translate.instant('Company Name'),
        this.translate.instant('Reference'),
        this.translate.instant('Type'),
        this.translate.instant('Expire Date'),
        this.translate.instant('Remarks'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }
  hotid2 = 'document2';
  // private hotRegisterer = new HotTableRegisterer();
  document2: Handsontable.GridSettings;
  initializeControls2() {
    this.document2 = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [20, 100],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      // allowInsertColumn: false,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'ID',
          type: 'text',
        },
        {
          data: 'Document Type',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('ID'),
        this.translate.instant('Document Type'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }
  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.subtitle;
    });
    this.DocumentReportFormGroup = new FormGroup({
      CompanyId: new FormControl(null),
      dateFrom: new FormControl(new Date()),
      dateTo: new FormControl(new Date()),
      DocumentTypeId: new FormControl(null),
      isDate: new FormControl(false),
    });
    this.initializeControls1();
    this.initializeControls2();
    this.GetAlldocumentTypeList()
    this.GetAllCompanies()
    this.show();
  }
  GetAllCompanies() {
    this.transactionService.GetAllCompanies().subscribe((res) => {
      this.companiesArray = res;
      this.companiesList = this.companiesArray.map((kl) => ({
        label: kl.customermasterName,
        value: kl.customermasterNo,
      }));
      this.companiesList.unshift({ label: '--Select Company--', value: -1 });
    })
  }
  GetAlldocumentTypeList() {
    this.transactionService.GetAlldocumentTypeList().subscribe((res) => {
      this.documentTypeArray = res;
      this.documentTypeList = this.documentTypeArray?.map((kl) => ({
        label: kl.documentType,
        value: kl.documentTypeId,
      }));
      this.documentTypeList.unshift({ label: '--Select DocumentType--', value: -1 });
    })
  }
  show() {
    if (this.DocumentReportFormGroup.get('isDate').value === true) {
      this.defaultValue = {
        isDateChecked: true,
        documentTypeId: this.DocumentReportFormGroup.value.DocumentTypeId ? this.DocumentReportFormGroup.value.DocumentTypeId : 0,
        companyId: this.DocumentReportFormGroup.value.CompanyId ? this.DocumentReportFormGroup.value.CompanyId : 0,
        issueDatefrom: this.DocumentReportFormGroup.get('isDate').value === true ? this.DocumentReportFormGroup.value.dateFrom : null,
        issueDateto: this.DocumentReportFormGroup.get('isDate').value === true ? this.DocumentReportFormGroup.value.dateTo : null,
      }

    } else {
      this.defaultValue = {
        isDateChecked: false,
        documentTypeId: this.DocumentReportFormGroup.value.DocumentTypeId ? this.DocumentReportFormGroup.value.DocumentTypeId : 0,
        companyId: this.DocumentReportFormGroup.value.CompanyId ? this.DocumentReportFormGroup.value.CompanyId : 0,
        issueDatefrom: this.DocumentReportFormGroup.get('isDate').value === false ? this.DocumentReportFormGroup.value.dateFrom : null,
        issueDateto: this.DocumentReportFormGroup.get('isDate').value === false ? this.DocumentReportFormGroup.value.dateTo : null,
      }
    }
    this.transactionService.GetDocumentReport(this.defaultValue).subscribe((response: any) => {
      this.DataList = response.result;
    });
  }
  clear() {
    this.DocumentReportFormGroup.get('DocumentTypeId').setValue(null);
    this.DocumentReportFormGroup.get('CompanyId').setValue(null);
    this.DocumentReportFormGroup.get('dateFrom').setValue(new Date());
    this.DocumentReportFormGroup.get('dateTo').setValue(new Date());
    this.DocumentReportFormGroup.get('isDate').setValue(false);
    this.show();
  }
  dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      td.innerText = formattedDate ? formattedDate : '';
    } else {
      td.innerText = '';
    }
  }
}
