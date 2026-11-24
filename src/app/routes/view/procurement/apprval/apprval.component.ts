import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  TreeNode,
  MenuItem,
  ConfirmationService,
  MessageService,
  SelectItem,
} from 'primeng';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ApprovalService } from 'src/app/routes/service/procurement/approval.service';
import { ProcurementService } from 'src/app/routes/service/procurement/procurement.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import {
  ApprovalFilterModel,
  EnumApprovalStatus,
  EnumApproverLevels,
  EnumOrderForm,
  POPRApprovaApiResponse,
} from './ApprovalFilterModel';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ImportApiService } from 'src/app/routes/service/import-api.service';

@Component({
  selector: 'app-apprval',
  templateUrl: './apprval.component.html',
  styleUrls: ['./apprval.component.scss'],
})
export class ApprvalComponent implements OnInit {
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
  savedPayload: any;
  handleChange(e) {
    this.index = e.index;
  }
  FilterForm: FormGroup;
  activeRow: { row: number; column: number };
  selectedApproval: any[] = [];
  printbtn: MenuItem[];
  hotid = 'PoApproval';
  private hotRegisterer = new HotTableRegisterer();
  PoApproval: Handsontable.GridSettings;
  items: MenuItem[];
  constructor(
    private activatedroute: ActivatedRoute,
    private accountapi: AccountApiService,
    private procurementApi: ProcurementService,
    private permission: PermissionsService,
    private approvalService: ApprovalService,
    private router: Router,
    public crystalReportService: CrystalReportService,
    private api: ImportApiService,
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
          // this.crystalReport(this.printVtype, this.printVId, 'pdf');
        },
      },
      {
        label: 'Excel',
        command: () => {
          // this.crystalReport(this.printVtype, this.printVId, 'excel');
        },
      },
    ];
  }

  printType(type, id) {
    this.printVtype = type;
    this.printVId = id;
  }

  ngOnInit(): void {
    this.user = this.permission.getUser();

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
      type: [0],
      JobId: [0],
      status: [''],
    });
    this.savedPayload = localStorage.getItem('approvalPayload');

    if (this.vNo) {
      this.POApprovalByVno();
    } else {
      this.POApprovalList(false);
    }
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
        label: 'ALL ',
        value: 0,
      },
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
        value: 3,
      },
      // {
      //   label: "CustomerQuotation ", value: 5
      // },
      {
        label: 'GeneralPurchaseOrder ',
        value: 6,
      },
    ];

    // this.approvalDropdown.unshift({ label: 'All', value: 0 })
    this.cols = [
      { field: 'voucherType', header: 'Vch Type.' },
      { field: 'voucherNO', header: 'Vch Id.' },

      { field: 'voucherDate', header: 'Date' },
      { field: 'supplier', header: 'Supplier' },
      { field: 'jobName', header: 'Job' },
      { field: 'amount', header: 'Amount' },
      // { field: 'modifiedDate', header: 'Approval Date' },
      // { field: 'approvedBy', header: 'Approved By' },
      // { field: 'levelId', header: 'Level' },
      { field: 'status', header: 'Status' },
      // { field: 'rejectionRemarks', header: 'Remarks' },
      { field: 'AprvStatus', header: 'Action' },
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

      this.POApprovalList(false);
    });
  }

  POApprovalByVno() {
    this.approvalService
      .GetDefaultPOPR(this.vNo, this.approvalType)
      .subscribe((res: any) => {
        this.approvalList = res.result?.map((i) => {
          i.type = this.approvalDropdown?.find(
            (k) => k.value == i.voucherType
          )?.label;
          return i;
        });
      });
  }

  POApprovalList(isselect) {
    this.approvalList = [];
    const formDetails = this.FilterForm.value;

    if (this.savedPayload && !isselect) {
      this.payloadReq = JSON.parse(this.savedPayload);
    } else {

      this.payloadReq = {
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
        isUserRequired: true,
      };
    }
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

  getApprovalStatusLabel(value: EnumApprovalStatus): string {
    return EnumApprovalStatus[value];
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

  onConfirm() {
    if (!this.remarks && this.Approvalstatus == 3) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Enter Remarks',
      });
      return;
    }
    this.showtest = false;
    let req = {
      orderId: this.approveReq.voucherId,
      orderType: this.approveReq.voucherType,
      jobId: this.approveReq.jobId,
      approvalStatus: this.Approvalstatus,
      remarks: this.remarks,
    };

    this.approvalService.ApprovePOPR(req).subscribe((res: any) => {
      if (res.valid) {
        this.messageService.add({
          severity: 'success',
          summary: 'Alert',
          detail:
            this.Approvalstatus == 2 ? `Record Approved` : `Record Rejected`,
        });
        this.POApprovalList(true);
        this.remarks = '';
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: res.message,
        });
      }
    });
  }

  Update(list: any, status: string) {
    this.Approvalstatus = status == 'Approved' ? 2 : 3;
    this.approveReq = list;
    this.showtest = true;
  }

  POApprovalById(id) {
    this.poAppovalSubList = [];
    this.procurementApi.POApprovalById(id).subscribe((res: any) => {
      this.poAppovalSubList = res.resultSet;
    });
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

  getSplitButtonItems(list: any) {
    return [
      {
        label: 'Approve',
        icon: 'pi pi-check',
        command: () => this.Update(list, 'Approved'),
      },
      {
        label: 'Reject',
        icon: 'pi pi-times',
        command: () => this.Update(list, 'Rejected'),
      },
    ];
  }

  viewAction1(type: number, id: any, status: any, vno: any) {
    // Save payload for new tab access
    localStorage.setItem('approvalPayload', JSON.stringify(this.payloadReq));

    let urlTree: any;

    if (type === 1) {
      urlTree = this.router.createUrlTree(['/procurement/purchaseorder'], {
        queryParams: { menu: 177, vNo: id, s: status },
      });
    } else if (type === 2) {
      urlTree = this.router.createUrlTree(
        ['/procurement/purchaserequisition'],
        {
          queryParams: { menu: 179, vNo: id, s: status },
        }
      );
    } else if (type === 6) {
      urlTree = this.router.createUrlTree(
        ['/procurement/general-purchase-order'],
        {
          queryParams: { menu: 199, vNo: vno, s: status },
        }
      );
    } else if (type === 3) {
      urlTree = this.router.createUrlTree(['/sale/boquantity'], {
        queryParams: { menu: 157, vNo: vno, s: status },
      });
    }

    if (urlTree) {
      const url = this.router.serializeUrl(urlTree);

      // ✅ Always prepend base href to avoid wrong origin
      const baseHref =
        document.getElementsByTagName('base')[0].getAttribute('href') || '';
      const fullUrl =
        window.location.origin + baseHref + url.replace(/^\//, '');

      window.open(fullUrl, '_blank'); // open in new tab
    }
  }

  viewAction(type, id, status, vno) {
    localStorage.setItem('approvalPayload', JSON.stringify(this.payloadReq));
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
    } else if (type == 6) {
      this.router.navigate(['procurement/general-purchase-order'], {
        queryParams: {
          menu: 199,
          vNo: vno,
          s: status,
        },
      });
    }
  }

  rptFilter: ReportFilterModel;

  crystalReport(type, id) {
    var name =
      type == 1 ? 'PurchaseOrder' : type == 2 ? 'PurchaseRequisition' : '';
    var table =
      type == 1
        ? 'VR_PurchaseOrder'
        : type == 2
          ? 'vw_PurchaseRequisition'
          : '';
    var key =
      type == 1
        ? 'VR_PurchaseOrder.purchaseorderno'
        : type == 2
          ? 'purchaserequisitionid '
          : '';
    this.rptFilter = {
      ReportName: name,
      SelectionFormula: '',
      Parameters: [],
      Queries: [`select * from ${table} where ${key}='${id}'`],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  onSelectionChange(event: any): void {
    this.selectedApproval = event.value;
  }

  isLevel3AndApproved(order: any): boolean {
    if (!order?.voucherApprovers?.length) return true;

    const level3Exists = order.voucherApprovers.some(
      (x: any) => x.approverLevel === EnumApproverLevels.Level3
    );

    if (!level3Exists) return true;

    const allPreviousApproved = order.voucherApprovers
      .filter((x: any) => x.approverLevel < EnumApproverLevels.Level3)
      .every((x: any) => x.status === EnumApprovalStatus.Approved);

    return !allPreviousApproved;
  }
  isButtonEnabled(order: any, detail: any): boolean {
    if (!order?.voucherApprovers?.length) return false;

    const approvers = order.voucherApprovers;

    // Find index of current record
    const idx = approvers.findIndex(
      (x: any) => x.approverId === detail.approverId
    );
    if (idx === -1) return false;

    // Approved record → always disabled
    if (detail.status === EnumApprovalStatus.Approved) {
      return false;
    }

    // Find the last Approved index
    const lastApprovedIdx = approvers
      .map((x: any, i: number) => ({ ...x, i }))
      .filter((x: any) => x.status === EnumApprovalStatus.Approved)
      .map((x: any) => x.i)
      .sort((a, b) => a - b) // ensure ascending
      .pop(); // get last one

    if (lastApprovedIdx !== undefined) {
      // Enable only the Pending record immediately after the last Approved
      return (
        idx === lastApprovedIdx + 1 &&
        detail.status === EnumApprovalStatus.Pending
      );
    } else {
      // No Approved → enable only the first Pending
      const firstPendingIdx = approvers.findIndex(
        (x: any) => x.status === EnumApprovalStatus.Pending
      );
      return idx === firstPendingIdx;
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
