import { Component, ElementRef, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { BoqService } from 'src/app/routes/service/sales/boq.service';
import {
  ConfirmationService,
  DialogService,
  MenuItem,
  MessageService,
  SelectItem,
} from 'primeng';
import { ItemMaster } from 'src/app/routes/domain';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { boQuantity } from 'src/app/routes/domain/Sales/boqModel';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { defaults } from 'src/app/shared/service/settings';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import * as XLSX from 'xlsx';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';

@Component({
  selector: 'app-bill-of-materials',
  templateUrl: './bill-of-materials.component.html',
  styleUrls: ['./bill-of-materials.component.scss'],
})
export class BillOfMaterialsComponent implements OnInit {
  selectedEnquires: any[] = [];
  EnquiryData: any[] = [];
  cals: any;
  grossAmt: any = 0;

  clearfilter() {
    this.enquiryNo = '';
    this.isDate = false;
    this.DateFrom = new Date();
    this.DateTO = new Date();
  }
  displayMaximizableEnquiry: any;
  colenquiry: any;
  enquiryNo: any;
  isDate: boolean = false;
  DateFrom: Date = new Date();
  DateTO: Date = new Date();

  savedboQuantity: any;
  brandArry: VendorMaster[] = [];

  printbtn: MenuItem[];
  elementReference: ElementRef;
  title: string;
  subtitle: string;
  index: number = 0;
  ScreenId: number;
  Permission: any;
  loadList: any;
  units: any;
  currentRow: number = 0;
  activeRow: { row: number; column: number } = { row: 0, column: 0 };
  showSalesLookUp: boolean;
  showSalesLookUpCost: boolean;
  currencyList: SelectItem[];
  currencyArray: any[];
  showLBoqlookUp: boolean;
  selectItem: any;
  formControlLookUp: boolean;
  ItemMasterArrayByName: any;
  avgCostItemAmount: any;
  jobID: number;
  user: any;
  sum2 = 0;
  pagedRequest: PagedRequest;
  confirmDropDatabaseDialogVisible: any;
  displayMaximizable: boolean = false;
  cols: any;
  stationmasterObj: any;
  displayPrintPreview: boolean = false;
  savedboQuantitylist: any;
  JOBCOST: Boolean = false;
  pdfSource: string;
  ESTIMATION: boolean = false;
  excelBlob: Blob | null = null;
  excelPreview: string = '';

  handleChange(e) {
    this.index = e.index;
  }

  control: AbstractControl;
  licensekey: any;
  width = `20%`;
  widthitem = `30%`;
  gridHeader: string;
  dataset: any = [];
  dataset2: any = [];

  hotid = 'billofmaterials';
  hotid2 = 'billofmaterials2';

  private hotRegisterer = new HotTableRegisterer();
  billofmaterials: Handsontable.GridSettings;
  billofmaterials2: Handsontable.GridSettings;
  btnFlag: ButtonFlag;
  boQuantity: boQuantity;
  lookupGridColumns = [];
  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];
  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  dataList: Array<any> = [];
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  total = 0;
  totalSum = 0;
  totalSumall = 0;
  boqForm: FormGroup;
  v_OPENCLOSE: SelectItem[];
  estimationPrint: boolean = false;
  isServerSearch = false;
  itemList = [];
  clickedRowColumn = { row: -1, column: -1 };

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private messageService: MessageService,
    private masterapi: MasterApiService,
    private confirmation: ConfirmationService,
    private boqapi: BoqService,
    private permission: PermissionsService,
    private fb: FormBuilder,
    private utilityService: UtilityService,
    private printService: FileSaverService,
    public crystalReportService: CrystalReportService,
    private accountapi: AccountApiService,
    private router: Router,
    public dialogService: DialogService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.printbtn = [
      {
        label: 'PDF',
        command: () => {
          this.showPrint('pdf');
        },
      },
      {
        label: 'Excel',
        command: () => {
          this.showPrint('excel');
        },
      },
    ];
  }

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      print: false,
      new: false,
    };

    this.stationmasterObj = this.permission.getStation();
    this.cols = [
      { field: 'billofqtyNo', header: 'BOM No' },
      { field: 'date', header: 'Date' },
      { field: 'jobname', header: 'Job' },
      { field: 'remarks', header: 'Remarks' },
      { field: 'action', header: 'Action' },
    ];
    this.colenquiry = [
      { field: 'isSelected', header: 'Select' },
      { field: 'enquiryId', header: 'Id' },
      { field: 'itemName', header: 'Item' },
      { field: 'itemQty', header: 'QTY' },
      { field: 'itemRate', header: 'Rate' },
      { field: 'unitName', header: 'Unit' },
    ];
    this.user = this.permission.getUser();
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      if (rights) {
        var res = rights[0];
        this.Permission = {
          Allow: res?.workGroupPermissionsUallow,
          Add: res?.workGroupPermissionsUadd,
          Delete: res?.workGroupPermissionsUdelete,
          Edit: res?.workGroupPermissionsUedit,
          Print: res?.workGroupPermissionsUprint,
          View: res?.workGroupPermissionsUview,
        };
      }
    });
    this.GetGeneralSettingbyKey('HIDE_ESTIMATION_REPORT');

    this.v_OPENCLOSE = [
      { label: '', value: '' },
      { label: 'OPEN', value: 'OPEN' },
      { label: 'CLOSE', value: 'CLOSE' },
    ];

    this.boqForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      date: [{ value: '', disabled: true }],
      billofqtyNo: [{ value: '', disabled: true }],
      customerEnqId: [-1, [DropDownValidator]],
      remarks: [{ value: '', disabled: true }],
      status: [{ value: '', disabled: true }],
      costantsAmount: [{ value: '', disabled: true }],
      boqAmount: [{ value: '', disabled: true }],
      totalAmount: [{ value: '', disabled: true }],
      proftPercentage: [{ value: '', disabled: true }],
      profitAmount: [{ value: '', disabled: true }],
      quoteAmount: [{ value: '', disabled: true }],
    });
    this.boqForm.disable();
    this.initializeControls();
    this.GetDefaultSettings();
  }

  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.getAllCostCenter();
    this.LoadJobDDL();
    this.LoadUnitDDL();
    this.LoadCurrancyDDL();
  }

  rptFilter: ReportFilterModel;
  showPrint(type) {
    const Estimation = this.estimationPrint;
    this.rptFilter = {
      ReportName:  'crptBillOfMaterial',
      SelectionFormula: `{BillofQty_Master.BillofqtyNo}='${this.boqForm.getRawValue().billofqtyNo}'`,
      Parameters: [
         {
              Key: 'CompanyName',
              Value:   this.stationmasterObj?.stationMasterStationName,
            }
      ],
      Queries: [
        // Estimation
        //   ? `select * from vw_estimation where id='${this.boqForm.getRawValue().id}'`
        //   : `select * from vw_billofqty where id=${this.boqForm.getRawValue().id}`,
      ],
      SP_Queries: [],
      ExportType:
        type === 'pdf'
          ? ExportFormatType.PortableDocFormat
          : ExportFormatType.ExcelWorkbook,
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, false)
      .subscribe((response: BlobPart) => {
        if (type === 'pdf') {
          const blob = new Blob([response], { type: 'application/pdf' });
          this.pdfSource = URL.createObjectURL(blob);
          window.open(this.pdfSource);
        } else {
          const excelBlob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const reader = new FileReader();

          reader.onload = (e: ProgressEvent<FileReader>) => {
            const data = new Uint8Array(e.target!.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const htmlContent = XLSX.utils.sheet_to_html(worksheet);

            const fileUrl = URL.createObjectURL(excelBlob);
            const filename = `${this.rptFilter.ReportName}.xlsx`;

            const previewWindow = window.open('', '_plank');
            if (previewWindow) {
              previewWindow.document.write(`
                <html>
                  <head>
                    <title>Excel Preview - ${filename}</title>
                    <style>
                      body { font-family: Arial, sans-serif; padding: 20px; }
                      button {
                        padding: 10px 20px;
                        margin-bottom: 20px;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                      }
                      button:hover {
                        background-color: #0056b3;
                      }
                      table { border-collapse: collapse; width: 100%; }
                      td, th { border: 1px solid #ccc; padding: 8px; }
                    </style>
                  </head>
                  <body>
                    <button onclick="downloadExcel()">Download Excel</button>
                    ${htmlContent}
                    <script>
                      function downloadExcel() {
                        const link = document.createElement('a');
                        link.href = '${fileUrl}';
                        link.download = '${filename}';
                        link.click();
                      }
                    </script>
                  </body>
                </html>
              `);
              previewWindow.document.close();
            } else {
              console.error('Failed to open preview window (popup blocker?)');
            }
          };

          reader.readAsArrayBuffer(excelBlob);
        }
      });
  }

  printAsPDF() {
    var css: string = `
#customers {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

#customers td,
#customers th {
  border: 1px solid #ddd;
  padding: 8px;
}

#customers tr:nth-child(even) {
  background-color: #f2f2f2;
}

#customers tr:hover {
  background-color: #ddd;
}

#customers th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #bcc0bf;
  color: rgb(0, 0, 0);
  text-align: center;
}
  .flex {
      display: flex;
      margin-bottom: 5px;
      gap: 2px;
     }

    .contain1{
      width: 43.5%;
       border-radius: 1px;
      margin-top: 6%;
       padding-bottom: 0%;
      padding: 8px;
     }

    .contain2{
      width: 43.5%;
       border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
      padding: 8px;
      margin-left: 65px;
     }

     .bank2 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49.5%;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
      padding: 8px;
      box-shadow: 5px 5px rgb(201, 204, 204);
     }

   .w70{
    width:280px;
   }

    .bank1 {
      border: 2.5px solid rgb(201, 204, 204);
      width: 49%;
      padding: 8px;
      margin-bottom: 5px;
      border-radius: 1px;
      margin-top: 5px;
       padding-bottom: 0%;
        box-shadow: 5px 5px rgb(201, 204, 204);
    }

  .min-panel {
      min-height: 106px !important;
  }

  :host ::ng-deep .ui-table .ui-table-thead>tr>th {
      position: -webkit-sticky;
      position: sticky;
      top: -8px;
      box-shadow: 1px 3px 6px 0 rgba(32, 33, 36, 0.10);
  }

  @media screen and (max-width: 64em) {
      :host ::ng-deep .ui-table .ui-table-thead>tr>th {
          top: -8px;
      }
  }

  .ui-dropdown {
      min-width: 50% !important;
  }

  .signature-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
  }

  .customer-signature {
      order: 1;
  }

  .authorized-signature {
      order: 2;
  }

    .flexcol{
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
    }

    .flexrow{
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: start;
    }

    .border{
        border: 1px #b1aeae solid;
        border-radius: 5px ;
        margin-bottom: 5px;
        padding: 15px;
    }
    .bR{
      border-right: 1px solid #ddd ;
      margin-right:10px ;
    }

    .rowgap{
        gap: 111px;
    }
    .w-80 {
      width: 80% !important;
    }
    .w-20 {
      width: 20% !important;
    }
    .flexSpaceBetween{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-bottom: 20px;
    }

    .center {
      text-align: center;
    }

    .alignEnd{
      align-items: end;
  }

  .end{
    text-align: end;
  }

  .w-100 {
    width: 100% !important;
  }
  h2{
    margin: 0 0 8px 0;
  }

  .wp-50{
    width: 50% !important;
  }

  .alignstart{
    text-align: start;
  }
  .w-80 {
    width: 75% !important;
  }
  .w-20{
    width: 25% !important;
  }
  .page {
    page-break-after: always;
  }
  h2{
    margin: 0 0 8px 0;
  }
  h1{
    margin: 0 0 8px 0;
  }

  .w0 {
    width: 40px !important;
  }
  .w50 {
    width: 35px !important;
  }

  @page {
    margin: 5mm 10mm;
  }
  @media print {
    thead {display: table-header-group;}
    tfoot {display: table-footer-group;}
    table { page-break-inside:auto ;
      font-size: 11px;}
    tr { page-break-inside:avoid; page-break-after:auto }

    body {margin: 0;}
      .rectImg {
           height: 140px;
          width: 217px;
        }

.squreImg {
    height: 145px;
    width: 145px;
}
 .end{
    text-align: end;
  }
    .gaprow{
      gap: 50px;
    }
    .container {
      position: relative;
      min-height: 100vh;
    }
    .print.page {
      page-break-after: always;
      font-size: 12px;
    }
    .page-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 2.5rem;
    }
  }
  #page-container {
    position: relative;
    min-height: 100vh;
  }

  #content-wrap {
    padding-bottom: 2.5rem;
  }

  #footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 2.5rem;
  }
  `;
    this.printService.PrintPDF('contentToConvertSv', css);
    this.userTrackingLog('PDF');
  }

  GetSavedboqDetails(arg0: any) {
    this.itemList = [];
    this.boqapi.GetSavedBillofQty(arg0).subscribe(
      (data) => {
        if (data) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
            print: true,
            new: false,
          };
          if (data.result != null) {
            this.updateFormGrid(data.result);
            this.savedboQuantity = data.result;
          }
          this.boqForm.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed'),
        });
        this.boqForm.updateValueAndValidity();
      }
    );
  }

  edit() {
    this.boqForm.enable();
    this.billofmaterials.readOnly = false;
    if (this.billofmaterials2) {
      this.billofmaterials2.readOnly = false;
      this.hotRegisterer
        .getInstance(this.hotid2)
        ?.updateSettings(this.billofmaterials2);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings(this.billofmaterials);
    this.GetDefaultSettings();

    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: true,
    };
  }

  cancel() {
    this.new();
  }

  Save() {
    const savedDetail: any = this.dataset?.filter((k) =>
      k.hasOwnProperty('itemId')
    );

    const savedDetailCost: any = this.dataset2?.filter((k) =>
      k.hasOwnProperty('costcenter')
    );
    const saveBoqData: boQuantity = this.boqForm.value as boQuantity;
    saveBoqData.id = this.boqForm.getRawValue().id
      ? this.boqForm.getRawValue().id
      : 0;
    saveBoqData.billofqtyNo = this.boqForm.getRawValue().billofqtyNo;
    saveBoqData.customerEnqId = this.boqForm.getRawValue().customerEnqId;
    saveBoqData.remarks = this.boqForm.getRawValue().remarks;
    saveBoqData.date = this.boqForm.getRawValue().date;
    saveBoqData.status = this.boqForm.getRawValue().status;

    saveBoqData.totalAmount = Number(this.boqForm.getRawValue().totalAmount);
    saveBoqData.boqAmount = Number(this.boqForm.getRawValue().boqAmount);
    saveBoqData.costantsAmount = Number(
      this.boqForm.getRawValue().costantsAmount
    );
    saveBoqData.profitAmount = Number(this.boqForm.getRawValue().profitAmount);
    saveBoqData.proftPercentage = 0;
    saveBoqData.quoteAmount = Number(this.boqForm.getRawValue().quoteAmount);

    saveBoqData.billOfQTyDetails = savedDetail
      ?.filter((k) => k.itemId != null)
      .map((k: any) => {
        let currany = this.currencyList?.find(
          (res) => res.label?.trim() == k.Currancy?.trim()
        )?.value;
        return {
          id: k.id ? k.id : 0,
          billQtyId: this.boqForm.getRawValue().id,
          itemCode: k.itemId,
          unitCode: k.unitId,
          length: k.length,
          qty: k.qty,
          wm: k.wm,
          totalWeight: k.totalWeight,
          rate: k.rate,
          amount: k.amount,
          remarks: k.remarks,
          freight_Charges: k.Freight,
          packing_Charges: k.Packing,
          clearance_Charges: k.Clearance,
          duty: k.Duty,
          mofa: k.Mofa,
          others: k.Other,
          currency_TypeId: currany,
          currencyRate: k.CurrancyRate,
          finalAmount: k.FinalAmount,
          isEdit: true,
          enquiryDetailId: k.enquiryDetailId,
        };
      });
    saveBoqData.estimationCostCenter = savedDetailCost
      ?.filter((k) => k.costcenter != null)
      .map((k: any) => {
        let costCenterIdd = this.costcenterList?.find(
          (res) => res.label?.trim() == k.costcenter?.trim()
        )?.value;
        return {
          id: k.id ? k.id : 0,
          billQtyId: k.billQtyId ? k.billQtyId : 0,
          costcenter: costCenterIdd,
          amount: k.Amount,
          remarks: k.Remarks,
          isEdit: true,
        };
      });
    this.boqForm.markAllAsTouched();
    if (this.btnFlag.save) {
      this.saveboq(saveBoqData);
    } else {
      this.updateboq(saveBoqData);
    }
  }

  public get IsValidGrid(): boolean {
    if (this.billofmaterials?.data?.length > 0) {
      return Object.values(this.dataset).some(
        (k: GridData) => k.itemname != null
      );
    }
    return false;
  }

  updateboq(saveBoqData: boQuantity) {
    if (this.boqForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to update existing voucher?'
        ),
        accept: () => {
          this.boqapi.UpdateBillofQty(saveBoqData).subscribe(
            (data) => {
              if (data.result == null && !data.valid) {
                this.messageService.add({
                  severity: 'info',
                  summary: 'Alert',
                  detail: data.message,
                });
                return;
              }

              if (data.valid) {
                this.savedboQuantity = data.result;
                this.updateFormGrid(data.result);
                this.boqForm.disable();
                this.billofmaterials.readOnly = true;
                this.userTrackingLog('updated');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: this.translate.instant(data.message),
                });
              } else if (data.error) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail:
                    data.message != null && data.message?.trim() !== ''
                      ? data.message
                      : data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant(' Save Failed'),
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Please fill mandatory fields'),
      });
    }
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  Delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to delete?'),
      accept: () => {
        if (!this.savedboQuantity?.id) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Alert',
            detail: this.translate.instant('Invalid record selected'),
          });
          return;
        }

        this.boqapi.DeleteBillofQty(this.savedboQuantity.id).subscribe({
          next: (data: any) => {
            if (data?.valid) {
              this.btnFlag = {
                edit: false,
                cancel: false,
                save: true,
                update: false,
                delete: false,
                print: false,
                new: true,
              };

              this.new();
              this.userTrackingLog('delete');
              this.boqForm.disable();

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: this.translate.instant('Delete Successful'),
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail:
                  data?.message?.trim()
                    ? data.message
                    : data?.exception || this.translate.instant('Delete Failed'),
              });
            }
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translate.instant('Delete Failed'),
            });
          },
        });
      },
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'Bill of Materials',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.boqForm.get('billofqtyNo').value,
      vpType: 'Bill of Materials',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  saveboq(saveBoqData: boQuantity) {
    if (this.boqForm.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.boqapi.InsertBillofQty(saveBoqData).subscribe(
            (data) => {
              if (data.result == null && !data.valid) {
                this.messageService.add({
                  severity: 'info',
                  summary: 'Alert',
                  detail: data.message,
                });
                return;
              }
              if (data.valid) {
                this.savedboQuantity = data.result;
                this.updateFormGrid(data.result);
                this.billofmaterials.readOnly = true;
                this.boqForm.disable();
                this.userTrackingLog('Insert');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: this.translate.instant(data.message),
                });
              } else if (data.error) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail:
                    data.message != null && data.message?.trim() !== ''
                      ? data.message
                      : data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant(' Save Failed'),
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.boqForm.markAllAsTouched();
      this.boqForm.markAsDirty();
    }
  }

  list() {
    this.callDropdowns();
    this.boqapi.GetBillofQty().subscribe((res: any) => {
      this.savedboQuantitylist = res.result.map((b) => {
        b.jobname = this.getjobName(b.customerEnqId);
        return b;
      });
      this.displayMaximizable = true;
    });
  }

  new() {
    this.itemList = [];
    this.boqForm.reset();
    this.boqForm.enable();
    this.boqForm.controls.date.setValue(new Date());
    this.boqForm.controls.status.setValue('OPEN');
    this.sum2 = 0;
    this.grossAmt = 0;
    this.billofmaterials.data = [];
    this.dataset = [];
    this.billofmaterials.readOnly = false;
    this.activeRow = { row: 0, column: 0 };
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      print: false,
      new: true,
    };
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.billofmaterials);

    this.callDropdowns();
    this.selectedEnquires = [];
    this.GetDefaultSettings();
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m: any) => {
      let list = m.resultSet.generalSettings;
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      if (jobcal == true) {
        this.JOBCOST = true;
      }
      var HIDE_COLUMNS = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_BOQ'
      );
      this.cals = HIDE_COLUMNS[0]?.generalSettingsBoolValue;
      if (this.cals == true) {
        this.updateTableConfiguration();
        this.initializeControls2();
      }
    });
  }

  costcenterSetting: any;
  GetGeneralSettingbyKey(key) {
    this.utilityService.GetGeneralSettingbyKey(key).subscribe((res: any) => {
      if (key == 'HIDE_ESTIMATION_REPORT') {
        this.ESTIMATION = res.result[0].generalSettingsBoolValue;
      } else {
        const splitText = res.result[0].generalSettingsTextValue?.split('::');
        this.costcenterSetting = Number(splitText[1]?.trim());
        this.populateCostCenterGrid(this.costcenterList);
      }
    });
  }

  updateTableConfiguration() {
    const hiddenColumns = [4, 14, 15, 23, 24];
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: false,
      },
    });
  }

  initializeHandsontable(columns, colHeaders) {
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      columns: columns,
      colHeaders: colHeaders,
    });
  }

  initializeControls() {
    const hiddenColumns = [
      4, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    ];
    this.billofmaterials = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns
    );

    this.billofmaterials.afterSelection = (row, column) => {
      this.clickedRowColumn = { row, column };
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      if (this.utilityService.isRowDisabled(row, hotInstance)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Notice',
          detail: 'Please fill the previous row first',
        });
        return;
      }
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      this.currentRow = row;
      if (column === 12 && this.billofmaterials.readOnly === false) {
        this.lookupGridColumns = ['Currancy', 'Currancy ID'];
        this.dataList = this.currenySetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.formControlLookUp = true;
        this.activeRow = { row, column };
      }
      if (column === 0 && this.billofmaterials.readOnly === false) {
        this.isServerSearch = true;
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.onSearch('');
        this.lookupGridColumns = ['Item', 'Item ID'];
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.billofmaterials.readOnly === false) {
        this.isServerSearch = false;
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);

        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.getUnitByItemId(data[0]);
        this.activeRow = { row, column };
      } else {
        this.showLBoqlookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.procurements == x);
      } else {
        this.selectItem = {};
      }
    };

    this.billofmaterials.beforeChange = (change: Handsontable.CellChange[]) => {
      this.showLBoqlookUp = false;
      if (change[0][1] === 0) {
        this.showLBoqlookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.billofmaterials.afterChange = (changes, source) => {
      if (!changes || (source as string) === 'autoCalculate' || source === 'loadData') {
        return;
      }
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (!hotinstance) return;

      const src = source as string;
      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (
          (prop === 'itemId' || prop === 0) &&
          newValue &&
          newValue !== oldValue &&
          src !== 'selectsales' &&
          src !== 'exportEnquiry' &&
          src !== 'autoCalculate' &&
          src !== 'loadData' &&
          src !== 'populateWM'
        ) {
          this.populateItemWM(row, newValue);
        }

        if (
          prop === 'length' ||
          prop === 'qty' ||
          prop === 'wm' ||
          prop === 'rate' ||
          prop === 'totalWeight' ||
          prop === 5 ||
          prop === 6 ||
          prop === 7 ||
          prop === 8 ||
          prop === 9
        ) {
          const data = hotinstance.getDataAtRow(row);
          if (!data || data[0] == null) return;

          const length = parseFloat(data[5]) || 0;
          const qty = parseFloat(data[6]) || 0;
          const wm = parseFloat(data[7]) || 0;
          let totalWeight = parseFloat(data[8]) || 0;
          const rate = parseFloat(data[9]) || 0;

          // Auto calculate Total W/kg once user has length, qty, w/m entered
          if (
            prop === 'length' ||
            prop === 'qty' ||
            prop === 'wm' ||
            prop === 5 ||
            prop === 6 ||
            prop === 7
          ) {
            if (length > 0 && qty > 0 && wm > 0) {
              totalWeight = parseFloat((length * qty * wm).toFixed(3));
              hotinstance.setDataAtCell(row, 8, totalWeight, 'autoCalculate');
            }
          }

          // Calculate amount = total w/kg x rate (or qty x rate if no weight)
          let amount = 0;
          if (totalWeight > 0 && rate > 0) {
            amount = parseFloat((totalWeight * rate).toFixed(2));
          } else if (qty > 0 && rate > 0) {
            amount = parseFloat((qty * rate).toFixed(2));
          }
          hotinstance.setDataAtCell(row, 10, amount, 'autoCalculate');

          if (this.dataset) {
            if (!this.dataset[row]) {
              this.dataset[row] = {};
            }
            this.dataset[row].length = length;
            this.dataset[row].qty = qty;
            this.dataset[row].wm = wm;
            this.dataset[row].totalWeight = totalWeight;
            this.dataset[row].rate = rate;
            this.dataset[row].amount = amount;
            this.dataset[row].FinalAmount = amount;
          }
        }
      });
      this.ColumnSum();
    };

    this.billofmaterials.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (change && change.length > 0) {
        const rowIndex = change[0][0];
        const changedColumn = change[0][1];

        const data = hotinstance.getDataAtRow(rowIndex);
        if (data && data[0] != null && changedColumn !== 'amount') {
          let length = parseFloat(data[5]) || 0;
          let qty = parseFloat(data[6]) || 0;
          let wm = parseFloat(data[7]) || 0;
          let totalWeight = parseFloat(data[8]) || 0;
          let rate = parseFloat(data[9]) || 0;
          const ratSum = parseFloat(data[13]) || 0;
          const frAmount = parseFloat(data[16]) || 0;
          const pkgAmount = parseFloat(data[17]) || 0;
          const clgAmount = parseFloat(data[18]) || 0;
          const dutyAmount = parseFloat(data[19]) || 0;
          const mofaAmount = parseFloat(data[20]) || 0;
          const otherAmount = parseFloat(data[21]) || 0;

          if (changedColumn === 'length' || changedColumn === 5) {
            length = parseFloat(change[0][3]) || 0;
          } else if (changedColumn === 'qty' || changedColumn === 6) {
            qty = parseFloat(change[0][3]) || 0;
          } else if (changedColumn === 'wm' || changedColumn === 7) {
            wm = parseFloat(change[0][3]) || 0;
          } else if (changedColumn === 'totalWeight' || changedColumn === 8) {
            totalWeight = parseFloat(change[0][3]) || 0;
          } else if (changedColumn === 'rate' || changedColumn === 9) {
            rate = parseFloat(change[0][3]) || 0;
          }

          // Auto-calculate Total Weight once length, qty, w/m are entered
          if (
            changedColumn === 'length' ||
            changedColumn === 'qty' ||
            changedColumn === 'wm' ||
            changedColumn === 5 ||
            changedColumn === 6 ||
            changedColumn === 7
          ) {
            if (length > 0 && qty > 0 && wm > 0) {
              totalWeight = parseFloat((length * qty * wm).toFixed(3));
              hotinstance.setDataAtCell(rowIndex, 8, totalWeight, 'autoCalculate');
            }
          }

          // Calculate Amount (Total Weight * Rate, or Qty * Rate if no weight)
          let sum1 = 0;
          if (totalWeight > 0) {
            sum1 = parseFloat((totalWeight * rate).toFixed(2));
          } else {
            sum1 = parseFloat((qty * rate).toFixed(2));
          }

          const currRateVal = ratSum > 0 ? ratSum : 1;
          const total = sum1 * currRateVal;
          const allAmount =
            frAmount +
            pkgAmount +
            clgAmount +
            dutyAmount +
            mofaAmount +
            otherAmount;
          const final = allAmount + total;

          // Use the edited row (rowIndex), not the last-selected row (currentRow),
          // otherwise values leak into whichever row was selected last.
          const targetRow = this.dataset[rowIndex];
          if (data[0] != null && targetRow) {
            if (targetRow.itemId !== undefined) {
              targetRow.length = length;
              targetRow.qty = qty;
              targetRow.wm = wm;
              targetRow.totalWeight = totalWeight;
              targetRow.rate = rate;
              targetRow.amount = sum1;
              targetRow.FinalAmount = final;
              hotinstance.updateSettings({ data: this.dataset });
            }
          }
        }
      }
      this.ColumnSum();
    };

    this.billofmaterials.afterRemoveRow = (index: number, amount: number) => {
      this.ColumnSum();
    };

    this.billofmaterials.afterValidate = (isValid, value, row, prop) => {};
  }

  ColumnSum() {
    let Total = 0;
    let amount = 0;
    this.dataset.forEach((element: any) => {
      if (element) {
        if (element.FinalAmount) {
          Total += element.FinalAmount;
          this.sum2 += element.FinalAmount;
        }
        if (element.amount) {
          amount += element.amount;
          this.grossAmt = amount?.toFixed(2);
        }
      }
    });

    this.boqForm.controls.totalAmount.setValue(Total.toFixed(2));
    const hotInstance = this.hotRegisterer.getInstance(this.hotid2);
    if (hotInstance && this.costcenterSetting != null) {
      hotInstance.setDataAtCell(Number(this.costcenterSetting), 1, Total);
    }

    this.CountAll();
  }

  isSelected(data: any): boolean {
    return this.selectedEnquires.includes(data);
  }

  toggleSelection(data: any) {
    const index = this.selectedEnquires.indexOf(data);
    if (index === -1) {
      this.selectedEnquires.push(data);
      data.isSelect = true;
    } else {
      this.selectedEnquires.splice(index, 1);
      data.isSelect = false;
    }
  }

  getSelectedData() {
    let req = {
      isdate: this.isDate ? true : false,
      fromDate: this.isDate ? this.DateFrom : null,
      toDate: this.isDate ? this.DateTO : null,
      enquiryIds: this.enquiryNo,
    };

    this.boqapi.getenquirylist(req).subscribe((res: any) => {
      this.EnquiryData = res.result.map((k) => {
        k.isSelect = false;
        return k;
      });
    });
  }

  export() {
    this.displayMaximizableEnquiry = false;
    const tempExported: any[] = [];
    const data = this.selectedEnquires;
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    data.forEach((k) => {
      if (k.isSelect) {
        const idx = this.EnquiryData.indexOf(k);
        if (idx !== -1) {
          tempExported.push(k);
          this.EnquiryData.splice(idx, 1);
        }
      }
      const targetRow = this.activeRow.row;
      hotInstance.setDataAtCell(targetRow, 0, k.itemId, 'exportEnquiry');
      hotInstance.setDataAtCell(targetRow, 2, k.itemName);
      hotInstance.setDataAtCell(targetRow, 3, k.unitName);
      hotInstance.setDataAtCell(targetRow, 4, k.unitId);
      hotInstance.setDataAtCell(targetRow, 6, k.itemQty);
      hotInstance.setDataAtCell(targetRow, 9, k.itemRate);
      hotInstance.setDataAtCell(targetRow, 23, k.enquiryDetailId);
      hotInstance.setDataAtCell(targetRow, 24, k.enquiryId);

      if (k.itemId) {
        this.populateItemWM(targetRow, k.itemId);
      }

      this.activeRow.row += 1;
    });
    this.selectedEnquires = [];
    this.ColumnSum();
  }

  addToSum(v) {
    this.total = 0;
    this.dataset2.forEach((res) => {
      if (res.Amount != null) {
        this.total += Number(res.Amount);
      }
    });
    if (this.boqForm?.get('costantsAmount')) {
      this.boqForm.get('costantsAmount').setValue(this.total.toFixed(2));
    } else {
      console.warn('boqForm or costantsAmount is not defined.');
    }
  }

  initializeControls2() {
    const hiddenColumns = [3];
    this.billofmaterials2 = this.utilityService.getTableConfig(
      columnDetailList2(this),
      hiddenColumns
    );
    this.billofmaterials2.afterSelection = (row, column) => {
      var x = this.hotRegisterer
        .getInstance(this.hotid2)
        .getDataAtCell(row, column);
      this.currentRow = row;
      if (column === 0) {
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.procurements == x);
      } else {
        this.selectItem = {};
      }
    };

    this.billofmaterials2.beforeChange = (change: Handsontable.CellChange[]) => {
      this.showLBoqlookUp = false;
      if (change[0][1] === 0) {
        this.showLBoqlookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.billofmaterials2.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid2);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);
        if (data[1] != null && change[0][1] == 'Amount') {
          this.addToSum(data[1]);
        }
        this.CountAll();
      }
    };
    this.billofmaterials.afterRemoveRow = (index: number, amount: number) => {
      this.itemList.splice(index, 1);
      this.ColumnSum();
    };

    this.billofmaterials.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  get currenySetLookup() {
    return this.currencyList.map((k1) => ({
      currency: k1.label,
      currencyId: k1.value,
    }));
  }
  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurements: kl.itemMasterItemName,
      procurementsId: kl.itemMasterItemId,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      procurements: kl.unitMasterUnitShortName?.trim(),
      procurementsId: kl.unitMasterUnitId,
    }));
  }
  get costSetLookup() {
    return this.costcenterArray.map((kl) => ({
      account: kl.costCenterMasterCostCenterName,
      accountId: kl.costCenterMasterCostCenterId,
    }));
  }

  updateFormGrid(boq_update: boQuantity) {
    this.boqForm.patchValue({
      id: boq_update.id,
      billofqtyNo: boq_update.billofqtyNo,
      date: new Date(boq_update.date),
      customerEnqId: boq_update.customerEnqId,
      remarks: boq_update.remarks,
      status: boq_update.status,
      totalAmount: boq_update?.totalAmount,
      boqAmount: boq_update?.boqAmount,
      costantsAmount: boq_update?.costantsAmount,
      profitAmount: boq_update?.profitAmount,
      quoteAmount: boq_update?.quoteAmount,
    });

    const gridData: any[] = boq_update.billOfQTyDetails.map((k: any) => {
      const UnitId: string =
        k.unitCode != null
          ? this.unitList?.find((l) => l.value == k?.unitCode)?.label
          : null;
      return {
        itemId: k.itemCode,
        itemname: k.itemName,
        unit: UnitId,
        unitId: k.unitCode,
        length: k.length || 0,
        qty: k.qty,
        wm: k.wm || 0,
        totalWeight: k.totalWeight || 0,
        rate: k.rate,
        amount: k.amount,
        billofqtyNo: k.billQtyId,
        remarks: k.remarks,
        id: k.id,
        job:
          k.jobID != null
            ? this.jobArray?.find((l) => l.jobMasterJobId == k?.jobID)
                ?.jobMasterJobName
            : null,

        Freight: k.freight_Charges,
        Packing: k.packing_Charges,
        Clearance: k.clearance_Charges,
        Duty: k.duty,
        Mofa: k.mofa,
        Other: k.others,
        Currancy:
          k.currency_TypeId != null
            ? this.currencyList?.find((res) => res.value == k.currency_TypeId)
                ?.label
            : null,
        CurrancyRate: k.currencyRate,
        FinalAmount: k.finalAmount,
        enquiryDetailId: k.enquiryDetailId,
        orderedQty: k.orderedQty ?? 0,
        balanceQty: k.balanceQty ?? 0,
      };
    });
    this.billofmaterials.readOnly = true;
    this.billofmaterials.data = gridData;
    this.dataset = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.ColumnSum();

    const gridData2: any[] = boq_update?.estimationCostCenter?.map((k) => {
      const cosntCenter =
        k.costcenter != null
          ? this.costcenterList?.find((l) => l.value == k?.costcenter)?.label
          : null;
      return {
        Amount: k.amount,
        billofqtyNo: k.billQtyId,
        Remarks: k.remarks,
        id: k.id,
        costcenter: cosntCenter,
      };
    });
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: true,
      delete: true,
      print: true,
      new: false,
    };
  }

  get jobSetLookup() {
    return this.jobArray.map((kl) => ({
      job: kl.jobMasterJobName,
      jobId: kl.jobMasterJobId,
    }));
  }

  selectsales(evt) {
    if (evt.currency) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 12, evt.currency);
      let rat = this.currencyArray?.find(
        (res) => res.currencyMasterCurrencyId == evt.currencyId
      )?.currencyMasterCurrencyRate;
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 13, rat);

      this.formControlLookUp = false;
      return;
    }
    if (evt.job) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 8, evt.job);
    }
    let trimmedSales = evt.sales?.trim();
    const includesPcs = this.units?.some((unit) =>
      unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
    );
    if (includesPcs && this.unitArray.length != 0) {
      var UnitId: any = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.salesId
      );
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);

      hotInstance.setDataAtCell(
        this.activeRow.row,
        3,
        UnitId?.unitMasterUnitShortName
      );
      hotInstance.setDataAtCell(
        this.activeRow.row,
        4,
        UnitId?.unitMasterUnitId
      );
      hotInstance.setDataAtCell(this.activeRow.row, 9, UnitId?.unitDetailsRate);
    } else {
      if (this.clickedRowColumn.column == 0) {
        if (this.itemList.includes(evt.procurementsId)) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Duplicate Entry',
            detail: `${evt.procurements} is already exists in this table`,
          });
          return;
        }

        this.itemList[this.clickedRowColumn.row] = evt.procurementsId;
      }

      const targetRow = this.activeRow.row;
      const itemId = evt.procurementsId;

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(targetRow, 0, itemId, 'selectsales');

      this.populateItemWM(targetRow, itemId);

      this.masterapi
        .GetItemMasterById({ id: itemId, customerId: 0 })
        .subscribe((k) => {
          this.ItemMasterArrayByName = k.resultSet?.itemMaster;
          const hotInstance = this.hotRegisterer.getInstance(this.hotid);
          hotInstance.setDataAtCell(
            targetRow,
            2,
            this.ItemMasterArrayByName?.itemMasterItemName
          );

          if (this.ItemMasterArrayByName?.unitDetails) {
            const unitId =
              this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
            const UnitId: string =
              unitId != null
                ? this.unitList?.find((l) => l.value == unitId)?.label
                : null;
            hotInstance.setDataAtCell(
              targetRow,
              0,
              this.ItemMasterArrayByName.itemMasterItemId,
              'selectsales'
            );
            hotInstance.setDataAtCell(targetRow, 3, UnitId);
            hotInstance.setDataAtCell(targetRow, 4, unitId);
            hotInstance.setDataAtCell(
              targetRow,
              9,
              this.ItemMasterArrayByName?.unitDetails?.unitDetailsRate
            );
            this.hotRegisterer
              .getInstance(this.hotid)
              .selectCell(targetRow, 5);
          }
        });
    }
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  selectCostCenter(evt) {
    const hotInstance = this.hotRegisterer.getInstance(this.hotid2);
    hotInstance?.setDataAtCell(this.activeRow.row, 0, evt?.account);
    this.showSalesLookUpCost = false;
    this.formControlLookUp = false;
  }

  exit(evt) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
    this.showSalesLookUpCost = false;
  }

  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(evt.cell.row, evt.cell.column, null);
    }
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
    this.showSalesLookUpCost = false;
  }

  selectControl(evt) {
    this.control.setValue(evt.salesId);
    this.elementReference.nativeElement.value = evt.sales;
    this.formControlLookUp = false;
  }

  hide(evt: boolean) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
    this.showSalesLookUpCost = false;
  }

  CountAll() {
    let amount = Number(this.boqForm.get('totalAmount')?.value) || 0;
    let costAmount = Number(this.boqForm.get('costantsAmount')?.value) || 0;
    let profitAmount = costAmount - amount;
    this.boqForm.get('profitAmount')?.setValue(profitAmount);
    this.boqForm.get('quoteAmount')?.setValue(costAmount + profitAmount);
  }

  getUnitByItemId(id) {
    this.masterapi.GetUnitDetails(id).subscribe((res) => {
      this.unitArray = res.result;
      this.dataList = this.unitSetLookup;
      this.unitArry = res.result.map((ar) =>
        ar.unitMasterUnitShortName?.trim()
      );
      this.formControlLookUp = true;
    });
  }

  getAllCostCenter() {
    this.utilityService.GetAllCostCenter().subscribe((k: any) => {
      this.costcenterArray = k;
      this.costcenterList = k.map((kl: any) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterArry = k.map((ar) =>
        ar.costCenterMasterCostCenterName?.trim()
      );
      this.GetGeneralSettingbyKey('COSTCENTER_AGAINST_BOQ');
    });
  }

  populateCostCenterGrid(evt) {
    let activeRow = { row: 0, column: 0 };
    const hotInstance = this.hotRegisterer.getInstance(this.hotid2);
    if (!hotInstance) return;

    let materialCost = evt?.find((res) => res.label === 'material cost');
    let otherCosts = evt?.filter((res) => res.label !== 'material cost');

    otherCosts?.forEach((res) => {
      hotInstance.setDataAtCell(activeRow.row, 0, res.label);
      activeRow.row += 1;

      if (activeRow.row === Number(this.costcenterSetting)) {
        hotInstance.setDataAtCell(activeRow.row, 0, materialCost?.label);
        activeRow.row += 1;
      }
    });

    if (activeRow.row <= 1 && materialCost) {
      hotInstance.setDataAtCell(1, 0, materialCost.label);
    }
  }

  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((m: any) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl: any) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
    });
  }

  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((m: any) => {
      this.units = m.resultSet.unitMasters;
      this.unitList = m.resultSet.unitMasters?.map((kl: any) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitList.unshift({ label: '--Select Unit--', value: -1 });
    });
  }

  getEmptyRowCount(length): number {
    const DetailsLength = length || 0;
    if (length < 15) {
      return Math.max(0, 15 - DetailsLength);
    } else {
      return 0;
    }
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    )?.itemMasterItemName;
  }

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }

  public getjobName(unit: number): string {
    return this.jobList?.find((j) => j.value === unit)?.label;
  }

  LoadCurrancyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((m: any) => {
      this.currencyArray = m.resultSet.currencyMasters;
      this.currencyList = m.resultSet.currencyMasters?.map((kl: any) => ({
        label: kl?.currencyMasterCurrencyName,
        value: kl?.currencyMasterCurrencyId,
      }));
    });
  }

  onSearch(term: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.ItemMasterArray = m.resultSet?.itemMaster;
      this.ItemMasterList = m.resultSet?.itemMaster?.map((kl) => ({
        sales: kl?.itemMasterItemName,
        salesId: kl?.itemMasterItemId,
        barcode: kl?.itemMasterBarcode,
        size: kl?.itemMasterItemSize,
        brand: this.brandArry?.find(
          (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
        )?.vendorMasterVendorName,
      }));
      this.dataList = this.itemSetLookup;
    });
  }

  populateItemWM(row: number, itemId: any) {
    if (!itemId) return;
    this.masterapi.GetAllItemMasterById(itemId).subscribe({
      next: (res: any) => {
        if (res?.result && res.result.itemMasterItemSize != null) {
          const itemSize = parseFloat(res.result.itemMasterItemSize) || 0;
          const hotInstance = this.hotRegisterer.getInstance(this.hotid);
          if (hotInstance && hotInstance.getDataAtCell(row, 0) == itemId) {
            hotInstance.setDataAtCell(row, 7, itemSize, 'populateWM');
          }
          if (this.dataset && this.dataset[row]?.itemId == itemId) {
            this.dataset[row].wm = itemSize;
          }
        }
      },
      error: (err: any) => {
        console.error(
          `Failed to fetch item details for item ID ${itemId}:`,
          err
        );
      },
    });
  }
}

interface GridData {
  remarks?: string;
  itemId?: number;
  partNo?: string;
  itemname?: string;
  unit?: string;
  unitId?: string;
  length?: number;
  qty?: number;
  wm?: number;
  totalWeight?: number;
  billofqtyNo?: number;
  id?: number;
  rate?: number;
  amount?: number;
  Freight?: number;
  Packing?: number;
  Clearance?: number;
  Duty?: number;
  Mofa?: number;
  Other?: number;
  Currancy?: number;
  CurrancyRate?: number;
  FinalAmount?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  print?: boolean;
  new?: boolean;
}

export const columnDetailList = (component: BillOfMaterialsComponent) => [
  {
    data: 'itemId',
    type: 'text',
    label: 'Item.Code',
  },
  {
    data: 'partNo',
    type: 'numeric',
    label: 'Part.No',
  },
  {
    data: 'itemname',
    type: 'text',
    label: 'Item.Name',
    source: component.ItemMasterArry,
  },
  {
    data: 'unit',
    type: 'text',
    label: 'Unit',
    source: component.unitArry,
  },
  {
    data: 'unitId',
    type: 'text',
    label: 'UnitId',
  },
  {
    data: 'length',
    type: 'numeric',
    label: 'Length',
    readOnly: false,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Qty',
    readOnly: false,
  },
  {
    data: 'wm',
    type: 'numeric',
    label: 'W/m',
    readOnly: false,
  },
  {
    data: 'totalWeight',
    type: 'numeric',
    label: 'Total W/kg',
    readOnly: false,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    readOnly: false,
  },
  {
    data: 'amount',
    type: 'numeric',
    label: 'Amount',
    readOnly: true,
  },
  {
    data: 'remarks',
    type: 'text',
    label: 'Remarks',
    readOnly: false,
  },
  {
    data: 'Currancy',
    type: 'text',
    label: 'Currency',
  },
  {
    data: 'CurrancyRate',
    type: 'numeric',
    label: 'Curr.Rate',
    readOnly: false,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
  },
  {
    data: 'billofqtyNo',
    type: 'numeric',
    label: 'BOM No',
  },
  {
    data: 'Freight',
    type: 'numeric',
    label: 'Fr.Ch',
    readOnly: false,
  },
  {
    data: 'Packing',
    type: 'numeric',
    label: 'Pkg.Chg',
    readOnly: false,
  },
  {
    data: 'Clearance',
    type: 'numeric',
    label: 'Clg.Chg',
    readOnly: false,
  },
  {
    data: 'Duty',
    type: 'numeric',
    label: 'Duty',
    readOnly: false,
  },
  {
    data: 'Mofa',
    type: 'numeric',
    label: 'Mofa',
    readOnly: false,
  },
  {
    data: 'Other',
    type: 'numeric',
    label: 'Other',
    readOnly: false,
  },
  {
    data: 'FinalAmount',
    type: 'numeric',
    label: 'Final.Amt',
  },
  {
    data: 'enquiryDetailId',
    type: 'numeric',
    label: 'enquiryDetailId',
  },
  {
    data: 'enquiryId',
    type: 'text',
    label: 'enquiryId',
  },
  {
    data: 'orderedQty',
    type: 'numeric',
    label: 'Ordered',
    readOnly: true,
  },
  {
    data: 'balanceQty',
    type: 'numeric',
    label: 'Balance',
    readOnly: true,
  },
];

export const columnDetailList2 = (component: BillOfMaterialsComponent) => [
  {
    data: 'costcenter',
    type: 'text',
    label: 'Cost Center',
    source: component.costcenterArry,
  },
  {
    data: 'Amount',
    type: 'numeric',
    label: 'Amount',
    readOnly: false,
  },
  {
    data: 'Remarks',
    type: 'text',
    label: 'Remarks',
    readOnly: false,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'ID',
  },
];
