import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService, SelectItem } from 'primeng';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ProcurementService } from 'src/app/routes/service/procurement/procurement.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-approval-level',
  templateUrl: './approval-level.component.html',
  styleUrls: ['./approval-level.component.scss'],
})
export class ApprovalLevelComponent implements OnInit {
  approverLevels: any[] = [];
  title: string;
  subtitle: string;
  user: any;
  ScreenId: any;
  Permission: any;
  formList: any;
  userList: any;
  filterArray: any[];
  forms: any;
  selectedForm: any;
  Users: any;
  isdisabled: boolean = true;
  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  selectedjob = -1;
  displayMaximizable: boolean = false;
  selectedMetaData: any[] = [];
  mails: any;
  email: any;
  name: any;
  selectedIndex: number;
  approvalDropdown: { label: string; value: number }[];
  type: string;
  jobStatus: boolean = false;

  constructor(
    private activatedroute: ActivatedRoute,
    public translate: TranslateService,
    private accountapi: AccountApiService,
    private masterapi: MasterApiService,
    private permission: PermissionsService,
    private procurementApi: ProcurementService,
    private messageService: MessageService,
    private confirmation: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();
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

    this.approvalDropdown = [
      {
        label: '-- Select -- ',
        value: -1,
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
        label: 'BillOfQuantity',
        value: 3
      },

      {
        label: 'PaymentRequest',
        value: 8,
      },
      {
        label: 'GeneralPurchaseOrder',
        value: 6,
      },
    ];
    this.approvalData();
    this.LoadDropdown();
    this.LoadJobDDL();
    this.DEFAULT_APPROVAL_TYPE();
  }

  APPROVAL_TYPE: string;
  DEFAULT_APPROVAL_TYPE() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULT_APPROVAL_TYPE')
      .subscribe((res) => {
        const value = res.result[0].generalSettingsTextValue;

        this.APPROVAL_TYPE = value.split('::');
        this.jobStatus = this.APPROVAL_TYPE[0] == 'JOB_WISE' ? true : false;
      });
  }

  selectedUserOption: any[] = [];
  onSelectionChange($event: any) {
    this.selectedUserOption = $event.value;
  }

  approvalData() {
    this.approverLevels?.push(
      {
        Level: 'Level 1',
        approverLevel: 1,
        approverId: -1,
        optEmail: false,
        notificationDays: 0,
        minAmount: 0,
        maxAmount: 0,
        metaData: [{ name: '', email: '', ccEmails: [], bccEmails: [] }],
      },
      {
        Level: 'Level 2',
        approverLevel: 2,
        approverId: -1,
        optEmail: false,
        notificationDays: 0,
        minAmount: 0,
        maxAmount: 0,
        metaData: [{ name: '', email: '', ccEmails: [], bccEmails: [] }],
      },
      {
        Level: 'Level 3',
        approverLevel: 3,
        approverId: -1,
        optEmail: false,
        notificationDays: 0,
        minAmount: 0,
        maxAmount: 0,
        metaData: [{ name: '', email: '', ccEmails: [], bccEmails: [] }],
      }
    );
  }

  pustnewRow() {
    this.approverLevels?.push({
      Level: 'Level 1',
      approverLevel: 1,
      approverId: -1,
      optEmail: false,
      notificationDays: 0,
      minAmount: 0,
      maxAmount: 0,
      metaData: [{ name: '', email: '', ccEmails: [], bccEmails: [] }],
    });
  }

  validateAmounts(data: any, amt: 'min' | 'max') {
    const min = Number(data.minAmount);
    const max = Number(data.maxAmount);

    if (!isNaN(min) && !isNaN(max) && min > max) {
      if (amt === 'min') {
        data.minAmount = null;
      } else {
        data.maxAmount = null;
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Max Amount must be grater then Min Amount.',
      });

      const approver = this.approverLevels?.find(
        (i) => i.approverId === data.approverId
      );
      if (approver) {
        if (amt === 'min') {
          approver.minAmount = null;
        } else {
          approver.maxAmount = null;
        }
      }
    }
  }

  LoadDropdown() {
    this.procurementApi.ApprovalPermissionDropdown().subscribe({
      next: (m) => {
        // Initialize userList and filterArray
        this.userList = m.resultSet.users || [];
        this.filterArray = [...this.userList]; // Use spread to create a copy
        this.Users = m.resultSet.users.map((kl) => ({
          label: kl.userName,
          value: kl.userId,
        }));

        // Add default option
        this.Users.unshift({ label: '--Select--', value: -1 });
        // Initialize forms and formList
        this.forms = m.resultSet.forms || [];
        this.formList = this.forms.map((kl) => ({
          label: kl.voucher_Type,
          value: kl.id,
        }));

        // Add default option
        this.formList.unshift({ label: '--Select--', value: -1 });
      },
      error: (err) => {
        console.error('Error loading dropdown', err);
      },
    });
  }

  LoadJobDDL() {
    this.accountapi.LoadDropdowjobMasters().subscribe((r) => {
      this.jobArray = r.resultSet.jobMasters;
      this.jobList = r.resultSet.jobMasters.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = r.resultSet.jobMasters.map((ar) =>
        ar.jobMasterJobName?.trim()
      );
    });
  }

  GetApproverLevelSettings(events: any) {
    if (events.value == -1) {
      this.approvalData();
      return;
    }
    if (this.jobStatus && this.selectedjob == -1) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Select Job',
      });
      this.selectedForm = -1;
      return;
    }
    this.procurementApi
      .GetApproverLevelSettings(events.value, this.selectedjob)
      .subscribe((r) => {
        if (r.result?.approverLevels?.length > 0) {
          this.approverLevels = [];
          this.approverLevels = r.result.approverLevels.map((i) => {
            i.Level = 'Level ' + i.approverLevel;

            return i;
          });
        } else {
          this.approverLevels = [];
          this.approvalData();
        }
      });
  }

  save() {
    if (this.jobStatus && this.selectedjob == -1) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Select Job',
      });
      return;
    }
    let level = this.approverLevels.map((i) => ({
      approverLevel: i.approverLevel,
      approverIds: i.approverIds,
      optEmail: i.optEmail ?? false,
      notificationDays: Number(i.notificationDays),
      minAmount: Number(i.minAmount),
      maxAmount: Number(i.maxAmount),
      metaData: [...i?.metaData],
    }));

    const firstThreeHaveApprover = level
      .slice(0, 3)
      .every((l) => Array.isArray(l.approverIds) && l.approverIds.length > 0);

    if (!firstThreeHaveApprover) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Each of the first 3 Approver Levels must be selected',
      });
      return;
    }
    let req = {
      formType: this.selectedForm,
      jobId: this.selectedjob,
      approverLevels: [...level],
    };
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Continue?'),
      accept: () => {
        this.procurementApi.SaveApproverLevelSettings(req).subscribe({
          next: (res) => {
            if (res.valid) {
              this.userList = res;
              this.isdisabled = true;
              this.approverLevels = [];
              this.selectedForm = -1;
              this.approvalData();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Approval permissions saved successfully.',
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save approval permissions.',
              });
            }
          },
          error: (err) => {
            console.error('Error saving approval permissions', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to save approval permissions.',
            });
          },
        });
      },
    });
  }

  mapVales() {
    if (this.selectedIndex !== undefined && this.selectedIndex >= 0) {
      const currentApproverLevel = this.approverLevels[this.selectedIndex];

      if (currentApproverLevel) {
        if (
          !currentApproverLevel.metaData ||
          currentApproverLevel.metaData.length === 0
        ) {
          currentApproverLevel.metaData = [{}];
          const metaData = currentApproverLevel.metaData[0];
          metaData.name = this.name;
          metaData.email = this.email;

          if (this.mails) {
            if (this.type == 'cc') {
              metaData.ccEmails = this.mails ?? [];
            } else {
              metaData.bccEmails = this.mails ?? [];
            }
          }
        }
      }
      this.displayMaximizable = false;
    }
  }

  show(data: any[], mail: string, index: number) {
    this.mails = [];
    this.selectedIndex = index;
    this.type = mail;
    this.displayMaximizable = true;
    this.selectedMetaData = data ?? [];
    this.name = this.selectedMetaData[0]?.name ?? '';
    this.email = this.selectedMetaData[0]?.email ?? '';

    const isBcc = mail === 'bcc';
    const isCc = mail === 'cc';
    const emails = isBcc
      ? this.selectedMetaData[0]?.bccEmails
      : this.selectedMetaData[0]?.ccEmails;

    if (emails && emails.length <= 0) {
      this.mails = emails;
    } else if (isBcc || isCc) {
      this.pushEmptyDatastaffEXs();
    }
  }

  pushEmptyDatastaffEXs(isSave?: boolean) {
    this.mails?.push(
      // {"name": "","email": "","ccEmails": [],"bccEmails": []}
      { name: '', email: '' }
    );
  }
}
