import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BankMaster } from 'src/app/routes/domain/BankMaster';
// import { BankMaster } from 'src/app/routes/domain/BankMaster';
import { PDCList, PDCPostedList } from 'src/app/routes/domain/PDCList';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-pdcposting',
  templateUrl: './pdcposting.component.html',
  styleUrls: ['./pdcposting.component.scss']
})
export class PDCPostingComponent implements OnInit {
  title: string = '';
  subtitle: string = '';
  licensekey: string = '';
  gridHeader: string = '';
  hotid: string = 'PDCList';
  hotidPdcPosted: string = 'PDCPostedList';
  PDCList: Array<PDCList> = [];
  PDCPostList: Array<PDCList> = [];
  PDCListConfirm: boolean = false;
  useDateFilter: boolean = false;

  private hotRegisterer = new HotTableRegisterer();
  pdcFilterForm: FormGroup;
  ScreenId: number;
  Permission: any;
  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private messageService: MessageService,
    private accountApi: AccountApiService,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,
  ) {
    this.pdcFilterForm = new FormGroup({
      pdcType: new FormControl('', Validators.required),
      postingDate: new FormControl(new Date(new Date().setFullYear(new Date().getFullYear())), Validators.required),
      dateFrom: new FormControl({value: new Date(new Date().setFullYear(new Date().getFullYear())), disabled: true}, Validators.required),
      dateTo: new FormControl({value: new Date(new Date().setFullYear(new Date().getFullYear())), disabled: true}, Validators.required),
      searchWord: new FormControl('', Validators.required),
      srchType: new FormControl('', Validators.required),
    });
  }

  onDateFilterChange() {
    if (this.useDateFilter) {
      this.pdcFilterForm.controls['dateFrom'].enable();
      this.pdcFilterForm.controls['dateTo'].enable();
    } else {
      this.pdcFilterForm.controls['dateFrom'].disable();
      this.pdcFilterForm.controls['dateTo'].disable();
    }
  }

  ngOnInit(): void {
    console.log("pdc compo");
    
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'PDC Posting') {
          this.Permission = {
            Allow: res?.workGroupPermissionsUallow,
            Add: res?.workGroupPermissionsUadd,
            Delete: res?.workGroupPermissionsUdelete,
            Edit: res?.workGroupPermissionsUedit,
            Print: res?.workGroupPermissionsUprint,
            View: res?.workGroupPermissionsUview
          };
        }
      });
    });

    this.initializeControlsPDCList();
    this.initializeControlsPDCPostedList();
    this.initializeControls();
    // this.getFilteredReturnPDCList("RECEIVED")
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";
    });
    setTimeout(() => {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: this.gridData });
    }, 100);
    this.getBankNames();
  }

  gridData: any = {
    value: '<input type="checkbox"/>'
  }
  PDCListGrid: Handsontable.GridSettings;
  PDCPostedListGrid: Handsontable.GridSettings;

  tabIndex: number = 0;
  activeTab: number = 0;

  switchHeaders(tabNumber: any) {
    if (tabNumber.index == 0) {
      setTimeout(() => {
        this.initializeControlsPDCList();
      }, 500);
    }
    else if (tabNumber.index == 1) {
      setTimeout(() => {
        this.initializeControlsPDCPostedList();
      }, 500);
    }
    else if (tabNumber.index == 2) {
      setTimeout(() => {
        this.initializeControls();

      }, 500);
    }
    this.activeTab = tabNumber.index;
  }
  initializeControlsPDCList() {
    this.PDCListGrid = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      height: 'auto',
      rowHeights: 23,
      autoColumnSize: {
        useHeaders: true
      },
      activeHeaderClassName: 'ht__active_highlight',
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
      },
      afterChange: (changes, source) => {
        // if (this.x != null && this.x[0][1] === "Qty") {

        // }
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords.col.valueOf() === 0) {

        }
      },
      data: [],
      //minSpareRows: 1,
      allowInsertRow: true,
      stretchH: "all",
      columns: [
        {
          data: 'pdc',
          type: 'checkbox',
          width: 100,
        },
        {
          readOnly: true,
          data: 'vno',
          type: 'text',
          width: 100,
        },
        {
          data: 'vType',
          type: 'text',
          width: 100,
        },
        {
          data: 'tran_Type',
          type: 'text',
          width: 100,
        },
        {
          data: 'stringtDate',
          type: 'text',
          width: 100,
        },
        {
          data: 'stringpDate',
          type: 'text',
          width: 100,
        },
        {
          data: 'cno',
          type: 'text',
          width: 100,
        },
        {
          data: 'cAmount',
          type: 'text',
          width: 100,
        },
        {
          data: 'cbName',
          type: 'text',
          width: 180,
        },
        {
          data: 'postingBank',
          type: 'autocomplete',
          source: (query, callback) => {
            callback(this.BankNames);
          },
          width: 100,
        },
        {
          data: 'accName',
          type: 'text',
          width: 180,
        },

       {
          data: 'narration',
          type: 'text',
          width: 180,
        }

      ],
      colHeaders: [
        this.translate.instant('PDC'),
        this.translate.instant('V No'),
        this.translate.instant('V Type'),
        this.translate.instant('Trans Type'),
        this.translate.instant('V Date'),
        this.translate.instant('PDC Date'),
        this.translate.instant('Cheque No.'),
        this.translate.instant('Amount'),
        this.translate.instant('Cheque Bank'),
        this.translate.instant('Posting Bank.'),
        this.translate.instant('Party Acc. Name'),
        this.translate.instant('Narration')
      ],
      manualRowResize: true,
      manualColumnResize: true,
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.PDCListGrid.afterRemoveRow = (index: number, amount: number) => {
      //this.ColumnSum();
    };
    this.PDCListGrid.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Invalid entry' });
      }
    };
  }


  initializeControlsPDCPostedList() {
    this.PDCPostedListGrid = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [6, 6, 12, 10, 10, 10, 8, 10, 10, 10, 10, 18],
      minRows: 3,
      height: 'auto',
      rowHeights: 23,
      autoColumnSize: {
        useHeaders: true
      },
      activeHeaderClassName: 'ht__active_highlight',
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
      },
      afterChange: (changes, source) => {
        // if (this.x != null && this.x[0][1] === "Qty") {

        // }
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords.col.valueOf() === 0) {

        }
      },
      data: [],
      //minSpareRows: 1,
      allowInsertRow: true,
      stretchH: "all",
      columns: [
        {
          data: 'pdc',
          type: 'checkbox'
        },
        {
          readOnly: true,
          data: 'vno',
          type: 'text',
        },
        {
          data: 'vType',
          type: 'text',
        },
        {
          data: 'stringtDate',
          type: 'text',
        },
        {
          data: 'stringpDate',
          type: 'text',
        },
        {
          data: 'cno',
          type: 'text',
        },
        {
          data: 'cAmount',
          type: 'text',
        },
        {
          data: 'cbName',
          type: 'text',
        },
        {
          data: 'bAccNo',
          type: 'text',
        },
        {
          data: 'pdcvno',
          type: 'text',
        },
        {
          data: 'stringpostDt',
          type: 'text',
        },
        {
          data: 'accName',
          type: 'text',
        },
        {
          data: 'narration',
          type: 'text',
        },

      ],
      colHeaders: [
        this.translate.instant('PDC'),
        this.translate.instant('V No'),
        this.translate.instant('V Type'),
        this.translate.instant('V Date'),
        this.translate.instant('PDC Date'),
        this.translate.instant('Cheque No.'),
        this.translate.instant('Amount'),
        this.translate.instant('Cheque Bank'),
        this.translate.instant('Posted Bank.'),
        this.translate.instant('PDC Vch No.'),
        this.translate.instant('Posted Date'),
        this.translate.instant('Party Acc. Name'),
        this.translate.instant('Narration')
      ],
      manualRowResize: true,
      manualColumnResize: true,
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.PDCListGrid.afterRemoveRow = (index: number, amount: number) => {
      //this.ColumnSum();
    };
    this.PDCListGrid.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Invalid entry' });
      }
    };
  }
  hotidPdcRL = 'returnlist';
  // private hotRegisterer = new HotTableRegisterer();
  returnlist: Handsontable.GridSettings;
  initializeControls() {
    this.returnlist = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [80, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
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
      stretchH: "all",
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          readOnly: true,
          data: 'vno',
          type: 'text',
        },
        {
          data: 'vType',
          type: 'text',
        },
        {
          data: 'stringtDate',
          type: 'text',
        },
        {
          data: 'stringpDate',
          type: 'text',
        },
        {
          data: 'cno',
          type: 'text',
        },
        {
          data: 'cAmount',
          type: 'text',
        },
        {
          data: 'cbName',
          type: 'text',
        },
        {
          data: 'bAccNo',
          type: 'text',
        },
        {
          data: 'pdcvno',
          type: 'text',
        },
        {
          data: 'stringpostDt',
          type: 'text',
        },
        {
          data: 'accName',
          type: 'text',
        },

        {
          data: 'narration',
          type: 'text',
        },

      ],
      colHeaders: [
        this.translate.instant('V No'),
        this.translate.instant('V Type'),
        this.translate.instant('V Date'),
        this.translate.instant('PDC Date'),
        this.translate.instant('Cheque No.'),
        this.translate.instant('Amount'),
        this.translate.instant('Cheque Bank'),
        this.translate.instant('Posted Bank.'),
        this.translate.instant('PDC Vch No.'),
        this.translate.instant('Posted Date'),
        this.translate.instant('Party Acc. Name'),
        this.translate.instant('Narration')
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }
  getPDCList() {
    this.accountApi.getPdcList().subscribe((response: any) => {
      this.PDCList = response;
      this.PDCList.forEach(element => {
        // element.PDC = '<input type="checkbox">';
        element.stringpDate = String(element.pDate).split('T')[0];
        element.stringtDate = String(element.tDate).split('T')[0];
      });
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        data: this.PDCList
      });
    });
  }
  pdcPostedlist: Array<PDCPostedList>;
  pdcRlist: Array<PDCPostedList>;


  getPDCPostReturnList(chequeStatus) {
    this.accountApi.getPdcPostedReturnList(chequeStatus).subscribe((response: any) => {
      console.log(response)
      this.pdcPostedlist = response;
      this.pdcPostedlist.forEach(element => {
        element.stringpDate = String(element.pDate).split('T')[0];
        element.stringtDate = String(element.tDate).split('T')[0];
        element.stringpostDt = String(element.postDt).split('T')[0];
      });

      if (chequeStatus == 'C')
        this.hotRegisterer.getInstance(this.hotidPdcPosted).updateSettings({ data: this.pdcPostedlist });
      else
        this.hotRegisterer.getInstance(this.hotidPdcRL).updateSettings({ data: this.pdcPostedlist });
    });
  }

  getFilteredPDCList(pdcType: string) {
    let filter: filters = {
      pdcType: pdcType,//this.pdcFilterForm.controls['pdcType'].value,
      postDate: this.pdcFilterForm.controls['postingDate'].value,
      // dateFrom : this.pdcFilterForm.controls['dateFrom'].value,
      // dateTo : this.pdcFilterForm.controls['dateTo'].value,
      // dateFrom: new Date(this.pdcFilterForm.controls['dateFrom'].value).setHours(0, 0, 0, 0),
      // dateTo: new Date(this.pdcFilterForm.controls['dateTo'].value).setHours(0, 0, 0, 0),
      dateFrom: this.useDateFilter && this.pdcFilterForm.controls['dateFrom'].value ? this.pdcFilterForm.controls['dateFrom'].value.toISOString().split('T')[0] : null,
      dateTo: this.useDateFilter && this.pdcFilterForm.controls['dateTo'].value ? this.pdcFilterForm.controls['dateTo'].value.toISOString().split('T')[0] : null,
      isDate: this.useDateFilter,
      keyWords: String(this.pdcFilterForm.controls['searchWord'].value).split(','),
      searchType: this.pdcFilterForm.controls['srchType'].value,
    }
    console.log('Selected Filters : ', filter);
    this.accountApi.getPdcFilteredList(filter).subscribe((apiResponse: any) => {
      console.log(apiResponse);
      this.PDCList = apiResponse;
      console.log('List vars : ', this.PDCList);
      this.PDCList.forEach(element => {
        // element.pdc = '<input type="checkbox">'
        element.stringpDate = String(element.pDate).split('T')[0];
        element.stringtDate = String(element.tDate).split('T')[0];
      });

      this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: this.PDCList });
    });
  }
  getFilteredPDCPostedList(pdcType: string) {
    let filter: filters = {
      pdcType: pdcType,//this.pdcFilterForm.controls['pdcType'].value,
      postDate: this.pdcFilterForm.controls['postingDate'].value,
      dateFrom: this.useDateFilter ? this.pdcFilterForm.controls['dateFrom'].value : null,
      dateTo: this.useDateFilter ? this.pdcFilterForm.controls['dateTo'].value : null,
      isDate: this.useDateFilter,
      keyWords: String(this.pdcFilterForm.controls['searchWord'].value).split(','),
      searchType: this.pdcFilterForm.controls['srchType'].value,
    }
    console.log('Selected Filters : ', filter);
  }
  pdcReturnlist: Array<PDCPostedList>;
  ReturnPdclist: Array<PDCPostedList>;

  getFilteredReturnPDCList() {
    let filter: filters = {
      pdcType: "",//this.pdcFilterForm.controls['pdcType'].value,
      postDate: this.pdcFilterForm.controls['postingDate'].value,
      dateFrom: this.useDateFilter ? this.pdcFilterForm.controls['dateFrom'].value : null,
      dateTo: this.useDateFilter ? this.pdcFilterForm.controls['dateTo'].value : null,
      isDate: this.useDateFilter,
      keyWords: String(this.pdcFilterForm.controls['searchWord'].value).split(','),
      searchType: this.pdcFilterForm.controls['srchType'].value,
    }
    console.log('Selected Filters : ', filter);
    this.accountApi.getPdcFilteredReturnList(filter).subscribe((apiResponse: any) => {
      this.pdcReturnlist = apiResponse;
      this.pdcReturnlist.forEach(element => {
        // element.PDC = '<input type="checkbox">'
        element.stringpDate = String(element.pDate).split('T')[0];
        element.stringtDate = String(element.tDate).split('T')[0];
      });

      this.hotRegisterer.getInstance(this.hotidPdcRL).updateSettings({ data: this.pdcReturnlist });
    });
  }

  BankListNames: Array<BankMaster> = [];
  BankNames: Array<string> = [];
  getBankNames() {
    this.accountApi.getBankNamesList().subscribe((response: any) => {
      this.BankListNames = response;
      this.BankListNames.forEach(element => {
        this.BankNames.push(element.accName);
      });
    });
  }

  getRetrunList() {
    this.accountApi.getReturnList().subscribe((response: any) => {
      this.pdcReturnlist = response;
      console.log(response);
      this.pdcReturnlist.forEach(element => {
        // element.PDC = '<input type="checkbox">';
        element.stringpDate = String(element.pDate).split('T')[0];
        element.stringtDate = String(element.tDate).split('T')[0];
      });
      this.hotRegisterer.getInstance(this.hotidPdcRL).updateSettings({
        data: this.pdcReturnlist
      });
    });
  }

  postPdc() {

    this.PDCPostList = [];
    const postingDate = this.pdcFilterForm.controls['postingDate'].value;
    this.PDCList.forEach((c) => {
      if (c.pdc && c.postingBank != null) {
        c.type = "Post";
        c.pDate = postingDate;
        this.PDCPostList.push(c);
      }
    });
    if (this.PDCPostList.length > 0) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.accountApi.PostPdcList(this.PDCPostList).subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('Alert'),
                detail: this.translate.instant("Posted Successfully"),
              });
              this.getPDCList();
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Payment Voucher Save Failed'),
              });
            }
          );
        },
      });
    }


  }

  returnPdc() {
    //   this.pdcRlist = [];
    //   this.pdcPostedlist.forEach((c) =>{
    //     if(c.pdc){
    //       this.pdcRlist.push(c);
    //     }
    // });

    this.PDCPostList = [];
    this.PDCList.forEach((c) => {
      if (c.pdc) {
        c.type = "Return";
        this.PDCPostList.push(c);
      }
    });
    if (this.PDCPostList.length > 0) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.accountApi.PostPdcList(this.PDCPostList).subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('Alert'),
                detail: this.translate.instant("Saved"),
              });
              this.getPDCList();
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Payment Voucher Save Failed'),
              });
            }
          );
        },
      });
    }
  }

  releasePdc() {
    this.pdcRlist = [];
    this.pdcPostedlist.forEach((c) => {
      if (c.pdc) {
        this.pdcRlist.push(c);
      }
    });

    if (this.pdcRlist.length > 0) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.accountApi.ReleasePostedPdcList(this.pdcRlist).subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('Alert'),
                detail: this.translate.instant("Release Successfully"),
              });
              this.getPDCPostReturnList('C')
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Payment Voucher Save Failed'),
              });
            }
          );
        },
      });
    }

  }
}

interface filters {
  postDate?: Date,
  dateFrom?: Date,
  dateTo?: Date,
  isDate?: boolean,
  pdcType?: string,
  keyWords?: Array<string>,
  searchType?: string,
}
