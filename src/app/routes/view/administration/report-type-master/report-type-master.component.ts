import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { AdministrationService } from 'src/app/routes/service/Administrations/administration.service';
import { defaults } from 'src/app/shared/service/settings';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-report-type-master',
  templateUrl: './report-type-master.component.html',
  styleUrls: ['./report-type-master.component.scss']
})
export class ReportTypeMasterComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  dataset2: any;
  dataset3: any;
  display = true;
  displayDetailed = false;
  displaySummary = false;
  index: number = 0;
  licensekey: any;
  gridHeader: string;
  idsArray:number[]=[];
  RTForm: FormGroup;
  state: { Dir: string; Field: any; Skip: any; Take: any; Search: any; Filter: any; };
  search: any;
  filter: any;
  handleChange(e) {
    this.index = e.index;
  }

  hotid = 'reporttype';
  private hotRegisterer = new HotTableRegisterer();
  reporttype: Handsontable.GridSettings;
  initializeControls() {
    this.reporttype = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [40, 40, 50, 50, 40, 40, 40, 40, 40, 40, 40, 40],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
      },
      beforeOnCellMouseUp: (event, coords, TD) => {

        if (coords.col.valueOf() === 0) {
          const hot = this.hotRegisterer.getInstance(this.hotid);
          var data = hot.getDataAtRow(coords.row);
          if(data[0] != null){
            this.cificReportType(data[0]);
          }
          
          // hot.alter('insert_row', 2);
          // hot.alter("remove_row", [[0, 1]]);
          //  hot.setDataAtCell(0, 3,   'g');
          //this.newEntry();
        }
        else if (coords.col.valueOf() === 3) {
          // this.unitListing = true;
        }
        else if (coords.col.valueOf() === 5) {
        }
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      stretchH: "all",
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'reportTypeId',
          type: 'numeric'
        },
        {
          data: 'reportTypeVoucherName',
          type: 'text'
        },
        {
          data: 'reportTypeFileName',
          type: 'text',
        },
        {
          data: 'reportTypeDescription',
          type: 'text'
        },
        {
          data: 'reportTypeIsDefault',
          type: 'text'
        },
        {
          data: 'reportTypeIsVisible',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('Id'),
        this.translate.instant('Voucher Name'),
        this.translate.instant('Report FileName'),
        this.translate.instant('Description'),
        this.translate.instant('Is Default'),
        this.translate.instant('Is Visible'),

      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private adminService: AdministrationService,
  ) {

  }

  ngOnInit(): void {
    this.RTForm = new FormGroup({
      ReportTypeId: new FormControl(0),
      ReportTypeDescription: new FormControl('', Validators.required),
      ReportTypeFileName: new FormControl('', Validators.required),
      ReportTypeVoucherName: new FormControl('', Validators.required),
      ReportTypeIsVisible: new FormControl(false),
      ReportTypeIsDefault: new FormControl(false),

    });
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";

    });
    this.initializeControls()
    this.GetGridListData(null);
  }
  get f() {
    return this.RTForm.controls;
  }
  GetSpe
  cificReportType(id: number) {
    this.adminService.GetSpecificReportType(id).subscribe((response: ApiResponse<any>) => {
      this.RTForm.controls['ReportTypeId'].setValue(response.result.reportTypeId);
    //  this.RTForm.controls['ReportTypeIsImage'].setValue(response.result.reportTypeIsImage);
      this.RTForm.controls['ReportTypeDescription'].setValue(response.result.reportTypeDescription);
      this.RTForm.controls['ReportTypeFileName'].setValue(response.result.reportTypeFileName);
      this.RTForm.controls['ReportTypeIsDefault'].setValue(response.result.reportTypeIsDefault);
      this.RTForm.controls['ReportTypeIsVisible'].setValue(response.result.reportTypeIsVisible);
      this.RTForm.controls['ReportTypeVoucherName'].setValue(response.result.reportTypeVoucherName);
    });
  }
  ReportTypeFormSubmit() {
    if (this.RTForm.invalid) {
      return;
    }

    this.adminService.AddEditReportType(this.RTForm.value).subscribe((response: ApiResponse<any>) => {
      if (response.valid && response.result) {
        this.GetGridListData(null);
        Swal.fire({
          title: 'Success',
          text: response.message,
          icon: 'success'
        })
      }
    })
  }
  DeleteReportType(id) {
    let ids:number[]=id==0?this.idsArray:[id];
    this.adminService.DeleteReportType(ids).subscribe((response: ApiResponse<any>) => {
      if (response.valid && response.result) {
        this.GetGridListData(null);
        Swal.fire({
          title: 'Success',
          text: response.message,
          icon: 'success'
        })
      }
    })
  }
  GetGridListData(event: any) {
    this.state = {
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter
    }
    this.adminService.GetReportTypes(this.state).subscribe((response: ApiResponse<any>) => {
      if (response.valid && response.result.data.length > 0) {
        this.dataset = response.result.data;
      }
    })
  }
} 