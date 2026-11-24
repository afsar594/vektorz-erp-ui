import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { defaults } from 'src/app/shared/service/settings';
import Swal from 'sweetalert2';
import { AccountMasterListComponent } from './account-master-list/account-master-list.component';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MessageService, ConfirmationService } from 'primeng';
import { get } from 'https';

@Component({
  selector: 'app-previous-balancesheet',
  templateUrl: './previous-balancesheet.component.html',
  styleUrls: ['./previous-balancesheet.component.scss'],
})
export class PreviousBalancesheetComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  licensekey: any;
  dataList: Array<any> = [];
  showSalesLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;

  lookupGridCustomerColumns = ['Account Name', 'Account ID'];
  gridHeader: string;
  PBSForm: FormGroup;
  index: number = 0;
  state: any;
  search: any;
  filter: any;
  timer: any;
  indexx: any;
  accountArray: any;
  totalCredit: number;
  totalDebit: number;
  FinacialPeriodArry: any;
  TallyCheck: boolean = false;
  handleChange(e) {
    this.index = e.index;
  }
  hotid = 'balancesheet';
  private hotRegisterer = new HotTableRegisterer();
  balancesheet: Handsontable.GridSettings;
  initializeControls() {
    this.balancesheet = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 7,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords.col.valueOf() === 0) {
          this.dataList = this.itemSetLookup;
          const hot = this.hotRegisterer.getInstance(this.hotid);
          hot.deselectCell();
          this.showSalesLookUp = true;
          // this.LoadAccountMasterList(coords);
          this.getIndex(coords);
        } else if (coords.col.valueOf() === 3) {
          // this.unitListing = true;
        } else if (coords.col.valueOf() === 5) {
        }
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'oldBsMasterDetailsAccNo',
          type: 'text',
          width: 180,
        },
        {
          data: 'oldBsMasterDetailsAccName',
          type: 'text',
          width: 280,
        },
        {
          data: 'debit',
          type: 'text',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 180,
        },
        {
          data: 'credit',
          type: 'text',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 180,
        },
        {
          data: 'oldBsMasterDetailsNarration',
          type: 'text',
          width: 280,
        },
      ],
      colHeaders: [
        this.translate.instant('CODE'),
        this.translate.instant('Account Name'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('Narration'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
      beforeChangeRender: (change, source) => {
        this.ColumnSum()
      }
    };
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private masterApi: MasterApiService,
    private translate: TranslateService,
    private accService: AccountstatementService,
    private dialogService: DialogService,
    private saleService: AccountstatementService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
  ) { }

  ngOnInit(): void {


    console.log("this is pbsec");


    this.PBSForm = this.fb.group({
      OldBsMasterFsno: new FormControl(''),
      OldBsMasterRefJv: new FormControl(''),
      Status: new FormControl(''),
      TotalAssetdbt: new FormControl(''),
      TotalAssetcrd: new FormControl(''),
      OldBsMasterDetails: this.fb.array([]),
      DifferenceTotal: new FormControl(''),
      TallyCheck: new FormControl(false),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.getAllaccount();
    // this.getFInancialPeriod();
    this.initializeControls();
    this.GetGridListData(null);

  }
  get f() {
    return this.PBSForm.controls;
  }
  ColumnSum() {

    let totalcredit = 0;
    let totalDebit = 0;

    this.dataset.forEach((element: any) => {
      if (element) {
        if (element.debit && element.debit) {
          totalDebit += parseFloat(element.debit);
        }
        if (element.credit && element.credit) {
          totalcredit += parseFloat(element.credit);
        }
      }
    });

    // Set values in the form group
    this.PBSForm.controls['TotalAssetdbt'].setValue(totalDebit);
    this.PBSForm.controls['TotalAssetcrd'].setValue(totalcredit);
    this.PBSForm.controls['DifferenceTotal'].setValue(totalDebit - totalcredit);


  }

  patchValues(AccNo, debit, credit, Narration) {
    return this.fb.group({
      OldBsMasterDetailsAccNo: [AccNo],
      Debit: [debit],
      Credit: [credit],
      OldBsMasterDetailsNarration: [Narration],
    });
  }

  OldBalanceSheetFormSubmit() {

    const data = this.dataset?.filter(
      (x: any) => x.oldBsMasterDetailsAccNo != null && x.oldBsMasterDetailsAccNo !== '',
    );
    if (!data || data.length == 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'Please add data in detail before downloading.',
      });
      return;
    }
    if (this.PBSForm.value.TallyCheck && this.PBSForm.value.DifferenceTotal != 0) {

      this.messageService.add({
        severity: 'info',
        summary: 'Tally Check',
        detail: 'Difference must be zero when Tally Check is enabled.',
      });
      return
    }
    const control = <FormArray>this.PBSForm.get('OldBsMasterDetails');
    control.clear();
    data.forEach((x: any) => {
      control.push(
        this.patchValues(
          x.oldBsMasterDetailsAccNo,
          x.debit,
          x.credit,
          x.oldBsMasterDetailsNarration ?? '',
        ),
      );
    });
    this.accService
      .AddEditRecordsInBalanceSheet(this.PBSForm.value)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Data saved successfully',
          });
          this.GetGridListData(null);
        }
      });
  }

  SearchData(event: any) {
    let that = this;
    clearTimeout(this.timer);
    var ms = 500; // milliseconds
    var val = event.target.value;
    this.timer = setTimeout(function () {
      that.search = val;
      that.GetGridListData(null);
    }, ms);
  }

  GetGridListData(event: any) {
    this.state = {
      Dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
      Field:
        event != null
          ? event.sortField != null && event.sortField != ''
            ? event.sortField
            : 'AccountsTransactions_TransSno'
          : 'AccountsTransactions_TransSno',
      Skip: event != null ? (event.first != null ? event.first : 0) : 0,
      Take: event != null ? (event.rows != null ? event.rows : 0) : 10000,
      Search: this.search,
      Filter: this.filter,
    };
    this.accService
      .GetBalanceSheetList(this.state)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid) {
          this.PBSForm.controls['OldBsMasterRefJv'].setValue(
            response.result.oldBsMasterRefJv,
          );
          this.PBSForm.controls['OldBsMasterFsno'].setValue(
            response.result.oldBsMasterFsno,
          );
          const hotInstance = this.hotRegisterer.getInstance(this.hotid);
          hotInstance.updateSettings({
            data: response.result.oldBsMasterDetails,
            readOnly: false,
          }); this.dataset = response.result.oldBsMasterDetails;
          if (this.dataset && this.dataset?.length > 0) {
            this.totalCredit = this.dataset?.reduce(
              (sum, item) => sum + (item.credit || 0),
              0,
            );
            this.totalDebit = this.dataset?.reduce(
              (sum, item) => sum + (item.debit || 0),
              0,
            );
          }

          // Set the calculated values into the form controls
          this.PBSForm.controls['TotalAssetdbt']?.setValue(this.totalDebit);
          this.PBSForm.controls['TotalAssetcrd']?.setValue(this.totalCredit);

          this.PBSForm.controls['DifferenceTotal']?.setValue(this.totalDebit - this.totalCredit);

        }
      });
  }

  getFInancialPeriod() {
    this.masterApi.GetAllFinancialPeriod().subscribe((data) => {
      this.FinacialPeriodArry = data;
    });
  }
  DownloadBalanceSheetPrint(event, type) {

    const data = this.balancesheet.data.filter(
      (x: any) => x.oldBsMasterDetailsAccNo != null && x.oldBsMasterDetailsAccNo !== '',
    );
    if (!data || data.length == 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'Please add data in detail before downloading.',
      });
      return;
    }
    this.state = {
      Dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
      Field:
        event != null
          ? event.sortField != null && event.sortField != ''
            ? event.sortField
            : 'AccountsTransactions_TransSno'
          : 'AccountsTransactions_TransSno',
      Skip: event != null ? (event.first != null ? event.first : 0) : 0,
      Take: event != null ? (event.rows != null ? event.rows : 0) : 10000,
      Search: this.search,
      Filter: this.filter,
      Extension: type,
    }; //"wwwroot/SiteDocument/SiteDemo1/FileDocument.doc" static file path
    this.accService
      .DownloadOldBalanceSheetAccount(this.state)
      .subscribe((event) => {
        let data = event as HttpResponse<Blob>;
        const downloadedFile = new Blob([data.body as BlobPart], {
          type: data.body?.type,
        });
        console.log('ddd', downloadedFile);
        if (downloadedFile.type != '') {
          // if(type =="PDF"){
          //   window.open(URL.createObjectURL(downloadedFile));
          // }
          // else{
          const a = document.createElement('a');
          a.setAttribute('style', 'display:none;');
          document.body.appendChild(a);
          a.download = 'Balance Sheet';
          a.href = URL.createObjectURL(downloadedFile);
          a.target = '_blank';
          a.click();
          document.body.removeChild(a);
          //   }
        }
      });
  }

  LoadAccountMasterList(index) {
    const ref = this.dialogService.open(AccountMasterListComponent, {
      data: {
        id: '51gF3',
      },
      header: 'Choose a Car',
      width: '70%',
    });

    ref.onClose.subscribe(() => {
      const hot = this.hotRegisterer.getInstance(this.hotid);
      const data =
        this.dialogService.dialogComponentRef.instance.componentRef.instance
          .passEntry;
      hot.setDataAtCell(index.row, 0, data[0]);
      hot.setDataAtCell(index.row, 1, data[1]);
    });
  }
  getIndex(ind) {
    this.indexx = ind;
  }

  selectsales(event) {
    let activeRow = { row: 0, column: 0 };
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    hotInstance.setDataAtCell(this.indexx.row, 0, event?.salesId);
    hotInstance.setDataAtCell(this.indexx.row, 1, event?.sales);
    // activeRow.row += 1;

    this.showSalesLookUp = false;
  }
  exit(evt) {
    this.showSalesLookUp = false;
  }
  exitCustomerlookUp(evt) {
    this.showSalesLookUp = false;
  }
  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      // this.elementReference.nativeElement.value ="";
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(evt.cell.row, evt.cell.column, null);
    }
    this.showSalesLookUp = false;
  }
  hide(evt: boolean) {
    this.showSalesLookUp = false;
  }
  getAllaccount() {
    this.saleService
      .GetAccountMasterDropdown()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.accountArray = response.result?.filter((x) => x.value != '');
        }
      });
  }
  get itemSetLookup() {
    return this.accountArray.map((kl) => ({
      sales: kl.name,
      salesId: kl.value,
    }));
  }
  New() {
    // this.dataset=null
  }
}

