import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TreeNode,
  MenuItem,
  MessageService,
  SelectItem,
  ConfirmationService,
} from 'primeng';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ProcurementService } from 'src/app/routes/service/procurement/procurement.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import {
  ApprovalFilterModel,
  EnumApprovalStatus,
  POPRApprovaApiResponse,
} from '../apprval/ApprovalFilterModel';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ApprovalService } from 'src/app/routes/service/procurement/approval.service';
import { ImportApiService } from 'src/app/routes/service/import-api.service';
import * as XLSX from 'xlsx';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-approval-status-report',
  templateUrl: './approval-status-report.component.html',
  styleUrls: ['./approval-status-report.component.scss'],
})
export class ApprovalStatusReportComponent implements OnInit {
  title: string;
  subtitle: String;
  index: number = 0;
  dataset: any;
  licensekey: any;
  gridHeader: string;
  Approval: any;
  approvalDropdown: any;
  payloadReq: ApprovalFilterModel;
  approvalList: POPRApprovaApiResponse[];
  selectedFile: TreeNode;
  user: any;
  confirmDropDatabaseDialogVisible: any;
  userList: any;
  allSelected: boolean = true;
  cols: any;
  approvalStatus: any;
  poAppovalSubList: any[] = [];
  pdfSource: string;
  vNo: any = null;
  showtest: boolean = false;
  selectedItems: any;
  remarks: any;
  approveReq: any;
  Approvalstatus: number;
  approvalType: any;
  printVtype: any;
  printVId: any;
  reporttype: any = 1;
  handleChange(e) {
    this.index = e.index;
  }
  FilterForm: FormGroup;
  activeRow: { row: number; column: number };
  selectedApproval: any[] = [];
  printbtn: MenuItem[];
  items: MenuItem[];
  constructor(
    private activatedroute: ActivatedRoute,
    private accountapi: AccountApiService,
    private procurementApi: ProcurementService,
    private permission: PermissionsService,
    private api: ImportApiService,
    private approvalService: ApprovalService,
    private router: Router,
    private datePipe: DatePipe,
    private formatDateService: ReportDateFormatService,
    public crystalReportService: CrystalReportService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.items = [
      {
        label: 'Update',
        command: () => {
          // this.update();
        },
      },
    ];

    this.printbtn = [
      {
        label: 'PDF',
        command: () => {
          this.Report('pdf');
        },
      },
      {
        label: 'Excel',
        command: () => {
          this.Report('excel');
        },
      },
    ];
  }

  printType(type, id) {
    this.printVtype = type;
    this.printVId = id;
  }

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
    });
    this.activatedroute.queryParams.subscribe((params) => {
      this.vNo = params['vNo'];
      this.approvalType = params['type'];
    });
    this.LoadJobDDL();
    this.LoadLocationDDL();
    this.POApprovalDropdown();
    this.FilterForm = this.fb.group({
      isDate: [false],
      fromDate: [new Date()],
      toDate: [new Date()],
      type: [],
      JobId: [0],
      status: [''],
    });

    this.POApprovalList();

    this.user = this.permission.getUser();
    this.Approval = [
      {
        label: 'All',
        value: 'None',
        id: 0,
      },
      {
        label: 'Pending',
        value: 'Pending',
        id: 1,
      },
      {
        label: 'Approved',
        value: 'Approved',
        id: 2,
      },
      {
        label: 'Rejected',
        value: 'Rejected',
        id: 3,
      },
    ];
    this.approvalDropdown = [
      {
        label: 'PurchaseOrder',
        value: 1,
      },
      {
        label: 'PurchaseRequisition',
        value: 2,
      },
      {
        label: 'PaymentRequest',
        value: 8,
      },
      {
        label: 'BillOfQuantity',
        value: 3
      },
      // {
      //   label: "BillOfQuantity", value: 2
      // },
      //  {
      //   label: "CustomerQuotation ", value :5
      // },
      {
        label: 'GeneralPurchaseOrder',
        value: 6,
      },
    ];
    this.cols = [
      { field: 'voucherType', header: 'Vch Type.' },
      { field: 'voucherNO', header: 'Vch Id.' },

      { field: 'voucherDate', header: 'Date' },
      { field: 'supplier', header: 'Supplier' },
      { field: 'jobname', header: 'Job' },
      { field: 'amount', header: 'Amount' },
      // { field: 'modifiedDate', header: 'Approval Date' },
      // { field: 'approvedBy', header: 'Approved By' },
      { field: 'status', header: 'Status' },
      { field: 'View', header: 'View' },
    ];
  }

  POApprovalDropdown() {
    this.procurementApi.POApprovalDropdown().subscribe((res: any) => {
      this.userList = res.resultSet.userList;
      const type = window.sessionStorage.getItem('type');
      this.selectedApproval = [];
      this.selectedApproval.push(type);
      window.sessionStorage.removeItem('type');
      window.sessionStorage.removeItem('status');

      this.POApprovalList();
    });
  }

  POApprovalList() {
    const formDetails = this.FilterForm.value;
    this.payloadReq = {
      // type: [EnumOrderForm.PurchaseOrder],
      type: this.selectedApproval,
      userId: this.user?.userId,
      isDate: formDetails.isDate,
      fromDate: formDetails.isDate ? formDetails.fromDate : null,
      toDate: formDetails.isDate ? formDetails.toDate : null,
      status:
        formDetails.status === ''
          ? EnumApprovalStatus.None
          : EnumApprovalStatus[
          formDetails.status as keyof typeof EnumApprovalStatus
          ],
      jobId: formDetails.JobId === 0 ? -1 : formDetails.JobId,
      isUserRequired: false,
    };
    this.approvalService
      .GetPOPRForApproval(this.payloadReq)
      .subscribe((res: ApiResponse<POPRApprovaApiResponse[]>) => {
        this.approvalList = res.result?.map((i) => {
          i.jobname = this.getJobName(i?.jobId);
          i.type = this.approvalDropdown?.find(
            (k) => k.value == i.voucherType
          )?.label;
          //   i.locationName = this.locationList?.find(k => k.value == i.locationId)?.label
          return i;
        });
      });
  }

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  LoadJobDDL() {
    this.accountapi.LoadDropdowjobMasters().subscribe((r) => {
      this.jobArray = r.resultSet.jobMasters;
      this.jobList = r.resultSet.jobMasters.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,

        // label: kl.jobMasterJobName + " -- " +  kl.jobMasterJobNumber,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: 0 });
    });
    // this.POApprovalList()
  }

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];
  LoadLocationDDL() {
    this.accountapi.LoadDropdownLocationMaster().subscribe((r) => {
      this.locationArray = r.resultSet.locationMaster.locationMaster;
      this.locationList = r.resultSet.locationMaster.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = r.resultSet.locationMaster.map((ar) =>
        ar.locationMasterLocationName.trim()
      );
    });
  }

  public getJobName(Id: number): string {
    return this.jobArray?.find((j) => j.jobMasterJobId === Id)
      ?.jobMasterJobName;
  }
  public getstatus(Id: number): string {
    return this.Approval?.find((j) => j.id === Id)?.label;
  }

  public getuser(Id: number): string {
    return this.userList?.find((j) => j.userId === Id)?.userName;
  }

  onCancel() {
    this.showtest = false;
    this.remarks = '';
    this.Approvalstatus = null;
    this.approveReq = null;
  }

  viewAction(type, id, status) {
    if (type == 1) {
      this.router.navigate(['/procurement/purchaseorder'], {
        queryParams: {
          menu: 177,
          vNo: id,
          s: status,
        },
      });
    } else if (type == 2) {
      this.router.navigate(['/procurement/purchaserequisition'], {
        queryParams: {
          menu: 179,
          vNo: id,
          s: status,
        },
      });
    }
  }

  downloadAllDocuments(no, id, type) {
    this.api
      .downloadAllFilesAsOnePdf(id, type == 1 ? 'PO' : 'PR', {
        responseType: 'blob',
        observe: 'response' as 'body',
      })
      .subscribe((response: any) => {
        if (response == null) {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: `Document Not Fount`,
          });
          return;
        }
        const blob = new Blob([response.body], { type: response.body.type });

        // Extract filename from content-disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${no}`;

        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
            contentDisposition
          );
          if (matches && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  rptFilter: ReportFilterModel;

  crystalReport(type, id) {
    this.rptFilter = {
      ReportName: this.getReportNameByType(type),
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from ${this.getTableNameByType(
          type
        )} where ${this.getKeyByType(type)}='${id}'`,
      ],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        console.log('reponse', response);
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  Report(type) {
    const formDetails = this.FilterForm.value;
    const job = formDetails.JobId;

    let fromDateControl = this.formatDateService.mmddyyyy(
      formDetails.isDate ? formDetails.fromDate : null
    );
    let toDateControl = this.formatDateService.mmddyyyy(
      formDetails.isDate ? formDetails.toDate : null
    );
    const status = formDetails.status;
    const name = this.reporttype == 1 ? 'vw_postatus' : 'vw_prstatus';
    let query = `select * from ${name} where 1 =1 `;

    if (job) {
      query += ` AND job_id = ${job}`;
    }
    if (formDetails.isDate && fromDateControl && toDateControl) {
      query += ` AND PRdate BETWEEN '${fromDateControl} ' AND '${toDateControl} '`;
    }
    if (status) {
      query += ` AND status1 ='${status} '`;
    }
    this.rptFilter = {
      ReportName:
        this.reporttype == 1
          ? 'POStatus'
          : this.reporttype == 2
            ? 'PRStatus'
            : '',
      SelectionFormula: '',
      Parameters: [
        // {
        //   Key: "Period",
        //   Value: formDetails.isDate ? `for the period from  ${fromDate} to ${toDate}` : ''
        // }
      ],
      Queries: [query],
      SP_Queries: [],
      ExportType:
        type === 'pdf'
          ? ExportFormatType.PortableDocFormat
          : ExportFormatType.ExcelWorkbook,
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
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

            const previewWindow = window.open('', '_blank');
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

  getKeyByType(type: number): string {
    if (type === 1) {
      return 'purchaseorderid';
    } else if (type === 2) {
      return 'purchaserequisitionid';
    } else if (type === 6) {
      // Assuming 6 is for General Purchase Order
      return 'General_Purchase_Order_ID';
    } else {
      return '';
    }
  }
  //
  getReportNameByType(type: number): string {
    if (type === 1) {
      return 'PurchaseOrder';
    } else if (type === 2) {
      return 'PurchaseRequisition';
    } else if (type === 6) {
      // Assuming 6 is for General Purchase Order
      return 'GeneralPurchaseOrder';
    } else {
      return '';
    }
  }

  getTableNameByType(type: number): string {
    if (type === 1) {
      return 'VR_PurchaseOrder';
    } else if (type === 2) {
      return 'vw_PurchaseRequisition';
    } else if (type === 6) {
      // Assuming 6 is for General Purchase Order
      return 'VW_GeneralPurchaseOrder';
    } else {
      return '';
    }
  }

  onSelectionChange(event: any): void {
    this.selectedApproval = event.value;
  }

  isButtonEnabled(order: any, detail: any): boolean {
    if (!order?.voucherApprovers?.length) return false;

    const approvers = order.voucherApprovers;

    const idx = approvers.findIndex(
      (x: any) => x.approverId === detail.approverId
    );
    if (idx === -1) return false;

    // Rule 1: Approved record → disabled
    if (detail.status === EnumApprovalStatus.Approved) {
      return false;
    }

    // Find if any Approved exists
    const approvedIdx = approvers.findIndex(
      (x: any) => x.status === EnumApprovalStatus.Approved
    );

    if (approvedIdx !== -1) {
      // Rule 2: Adjacent Pending after Approved → enabled
      if (
        idx === approvedIdx + 1 &&
        detail.status === EnumApprovalStatus.Pending
      ) {
        return true;
      }
      return false; // all other pending disabled
    } else {
      // Rule 3: No Approved → first Pending enabled
      const firstPendingIdx = approvers.findIndex(
        (x: any) => x.status === EnumApprovalStatus.Pending
      );
      if (idx === firstPendingIdx) {
        return true;
      }
      return false;
    }
  }

  resendEmail(orderType: any, orderId: any, approver: any) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to resend an email?',
      accept: () => {
        this.approvalService
          .ResendEmail(
            orderType,
            approver.approverLevel,
            orderId,
            approver.approverId
          )
          .subscribe((res: any) => {
            if (res.valid) {
              this.messageService.add({
                severity: 'success',
                summary: 'success',
                detail: res.message,
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: res.message,
              });
            }
          });
      },
    });
  }
}
