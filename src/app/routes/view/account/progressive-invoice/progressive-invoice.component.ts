import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
// import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ConfirmationService, MenuItem, MessageService, SelectItem } from 'primeng';
import { ProgressiveInvoice } from 'src/app/routes/domain/Accounts/ProgressiveInvice';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { ExportFormatType, ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ProgrssiveInvoiceService } from 'src/app/routes/service/progrssive-invoice.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-progressive-invoice',
  templateUrl: './progressive-invoice.component.html',
  styleUrls: ['./progressive-invoice.component.scss'],
})
export class ProgressiveInvoiceComponent implements OnInit {
  title: string = 'Progressive Invoice';
  subtitle: string = 'Progressive Invoice';
  dataset: any;
  licensekey: any;
  gridHeader: string;
  progressiveinvoiceFormGroup: FormGroup;
  hotid = 'progressiveinvoice';
  private hotRegisterer = new HotTableRegisterer();
  progressiveinvoice_entry: Handsontable.GridSettings;
  selectedView: string = 'Summary';
  Permission: any;
  ScreenId: number;
  user: any;
  stationmasterObj: StationMaster;
  btnFlag: ButtonFlag;
  callDDLs: boolean = false;
  progressiveInvoice: ProgressiveInvoice[] = [];
  selectedRecord: any = null;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  v_ModeList: SelectItem[];
  typeList: SelectItem[];
  custJobList: any;
  PIFilterForm: FormGroup;
  filterArray: any;
  cols: { field: string; header: string }[];
  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.v_ModeList = [
      { label: 'Select', value: '' },
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
      // { label: 'CARD', value: 'CARD' },
    ];
    this.typeList = [
      { label: 'Select', value: '' },
      { label: 'ADVANCE', value: 'ADVANCE' },
      { label: 'INTERIM', value: 'INTERIM' },
      { label: 'FINAL', value: 'FINAL' },
    ];
  }
  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];

  displayMaximizable: boolean = false;
  rptFilter: ReportFilterModel;
  pdfSource: string;


  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private permission: PermissionsService,
    private activatedroute: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private PIService: ProgrssiveInvoiceService,
    private messageService: MessageService,
    private accountapi: AccountApiService,
    private utilityService: UtilityService,
    private confirmation: ConfirmationService,
    private crystalReportService: CrystalReportService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  ngOnInit(): void {


    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
      this.stationmasterObj = this.permission.getStation();

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
      } else {
        this.router.navigate(['/login']);
      }
    });
    this.cols = [
      { field: 'PIVoucherNo', header: 'Invoice No' },
      { field: 'PIPurchaseDate', header: 'Date' },
      { field: 'jobname', header: 'Job' },
      { field: 'Customer', header: 'Customer' },
      { field: 'progressiveInvoiceCurComplVal', header: 'Completed Value' },
      { field: 'progressiveInvoiceCurComplPer', header: 'Completed Per' },
      { field: 'actions', header: 'Actions' },
    ];
    this.PIFilterForm = this.fb.group({
      isDate: [],
      PINo: [null],
      purchaseGRNNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.FILL_COMBO();
    this.progressiveinvoiceFormGroup = this.fb.group({
      progressiveInvoiceId: [0],
      progressiveInvoiceInvNo: [''],
      progressiveInvoiceCustId: [0, Validators.required],
      progressiveInvoiceJobId: [-1, Validators.required],
      progressiveInvoiceInvDate: ['', Validators.required],
      progressiveInvoiceIsVariation: [false],
      progressiveInvoiceInvoiceType: ['', Validators.required],
      progressiveInvoiceReference: [''],
      progressiveInvoiceTotAmount: [0],
      progressiveInvoiceStatus: [''],
      progressiveInvoiceDiscPercentage: [0],
      progressiveInvoiceDiscount: [0],
      progressiveInvoicePrintInv: [''],
      progressiveInvoiceLocationId: [-1],
      progressiveInvoicePayAppNo: [''],
      progressiveInvoiceDescription: [''],
      progressiveInvoiceProgress: [''],
      progressiveInvoiceCurComplVal: [0],
      progressiveInvoiceCurComplPer: [0],
      progressiveInvoicePrevComplVal: [0],
      progressiveInvoicePrevComplPer: [0],
      progressiveInvoiceCumilativeVal: [0],
      progressiveInvoiceCumilativePer: [0],
      progressiveInvoiceAmountDue: [0],
      progressiveInvoiceTotal: [0],
      progressiveInvoiceFsno: [0],
      progressiveInvoiceUserId: [0],
      progressiveInvoiceDescriptionId: [0],
      progressiveInvoicePlRetention: [0],
      progressiveInvoicePlTotalAmount: [0],
      jobValue: [0],
      VariationAmt: [0],
      totalJobValue: [0],
      VariationAmountDue: [0],
      lessAdvance: [0],
      Variance: [0],
      advanceAmount: [0],
      PreRetentionAmount: [0],
      variationInvoiced: [0],
      preAdvanceAmtDed: [0],
      cumRetentionAmt: [0],
      cumVariationAmt: [0],
      cumAdvAmtDed: [0],
      PIadvanceAmt: [0],
      grossAmt: [0],
      PIvatAmt: [0],
      PIvatPer: [0],
      currentRetentionAmt: [0],
      retentionRelease: [0],
    });
    this.setupCalculations();
    this.progressiveinvoiceFormGroup.disable();
    this.initializeControls();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
  }

  get f() {
    return this.progressiveinvoiceFormGroup.controls;
  }

  callDropdowns() {
    if (!this.callDDLs) {
      this.LoadCustomerDDL();
      this.LoadJobDDL();
      this.callDDLs = true;
    }
  }




  isValid(): boolean {

    return true;
  }

  private exportReport(format: ExportFormatType, mimeType: string, fileName: string, reportName: string, preview: boolean = false) {

    if (!this.isValid()) {
      return;
    }

    this.crystalReportService
      .downloadReport(this.payload(format, reportName))
      .subscribe({
        next: (response) => {

          const blob = new Blob([response], { type: mimeType });

          if (preview) {
            this.pdfSource = URL.createObjectURL(blob);
            window.open(this.pdfSource);
          }
          else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(link.href);
          }

        },
        error: () => {
          
        }
      });
  }


  payload(type: ExportFormatType, reportName: string): ReportFilterModel {
    const progressiveInvoiceNo = this.progressiveinvoiceFormGroup.value.progressiveInvoiceInvNo;
    const selectionFormula = `{Progressive_Invoice.Progressive_Invoice_InvNo} = '${progressiveInvoiceNo}'`;

    return {
      ReportName: reportName,
      SelectionFormula: selectionFormula,
      Parameters: [],
      Queries: [],
      SP_Queries: [],
      ExportType: type
    };
  }

  LoadCustomerDDL() {
    this.utilityService.LoadCustomerDropdown().subscribe((m: any) => {
      this.CustomerMasterArray = m.resultSet.customerMasters;
      this.CustomerMasterList = m.resultSet.customerMasters?.map((kl) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
            ' -- ' +
            kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({
        label: '--Select Customer--',
        value: -1,
      });
    });
  }

  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((m: any) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
    });
  }

  GetJOb(event: any) {
    this.PIService.JobBYCUSTID(event.value).subscribe((data: any) => {
      this.custJobList = data.resultSet;
      this.jobList = data.resultSet?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
    });
  }

  onjobSelect(event: any) {
    let job = this.custJobList?.find((i) => i.jobMasterJobId == event.value);
    this.f.VariationAmt.setValue(job.jobMasterJobVariationAmount);
    this.f.jobValue.setValue(job.jobMasterJobValue);
    this.f.advanceAmount.setValue(job.jobMasterJobAdvanceAmount);
    this.loadPreviousSummaryIfInterim();
  }

  private loadPreviousSummaryIfInterim() {
    const invoiceType = this.f.progressiveInvoiceInvoiceType.value;
    const customerId = this.f.progressiveInvoiceCustId.value;
    const jobId = this.f.progressiveInvoiceJobId.value;

    // Always reset previous completion fields first
    this.f.progressiveInvoicePrevComplVal.setValue(0, { emitEvent: false });
    this.f.progressiveInvoicePrevComplPer.setValue(0, { emitEvent: false });
    this.f.PreRetentionAmount.setValue(0, { emitEvent: false });
    this.f.variationInvoiced.setValue(0, { emitEvent: false });
    this.f.preAdvanceAmtDed.setValue(0, { emitEvent: false });

    // ADVANCE invoices do not use previous completion data
    if (invoiceType === 'ADVANCE' || !invoiceType) {
      this.recalculate();
      return;
    }

    if (!customerId || customerId <= 0 || !jobId || jobId <= 0) {
      this.recalculate();
      return;
    }

    const isVariation = !!this.f.progressiveInvoiceIsVariation.value;
    this.PIService.GetPreviousSummaryByJob(customerId, jobId, isVariation).subscribe(
      (data: any) => {
        if (data?.valid && data?.result) {
          const summary = data.result;
          this.f.progressiveInvoicePrevComplVal.setValue(summary.totalCompletedValue || 0, { emitEvent: false });
          this.f.progressiveInvoicePrevComplPer.setValue(summary.totalCompletedPer || 0, { emitEvent: false });
          this.f.PreRetentionAmount.setValue(summary.totalRetentionAmount || 0, { emitEvent: false });
          this.f.variationInvoiced.setValue(summary.totalVariationAmount || 0, { emitEvent: false });
          this.f.preAdvanceAmtDed.setValue(summary.totalAdvanceAmount || 0, { emitEvent: false });
        }
        this.recalculate();
      },
      () => {
        // On error leave fields at zero and continue
        this.recalculate();
      }
    );
  }

  GetSavedSalesVoucherDetails(id: string) {
    this.callDropdowns();
    this.PIService.GetById(id).subscribe(
      (data) => {
        if (data.valid) {
          this.updateFormGrid(data.result);
          this.selectedRecord = data.result;
          this.btnFlag = { edit: true, cancel: true, save: false, update: true, delete: true, new: true };
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Progressive Invoice not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed'),
        });
      }
    );
  }

  updateFormGrid(result: any) {
    this.progressiveinvoiceFormGroup.patchValue({
      progressiveInvoiceId: result?.progressiveInvoiceId,
      progressiveInvoiceInvNo: result?.progressiveInvoiceInvNo,
      progressiveInvoiceCustId: result?.progressiveInvoiceCustId,
      progressiveInvoiceJobId: result?.progressiveInvoiceJobId,
      progressiveInvoiceInvDate: result?.progressiveInvoiceInvDate ? new Date(result.progressiveInvoiceInvDate) : null,
      progressiveInvoiceIsVariation: result?.progressiveInvoiceIsVariation,
      progressiveInvoiceInvoiceType: result?.progressiveInvoiceInvoiceType,
      progressiveInvoiceReference: result?.progressiveInvoiceReference,
      progressiveInvoiceTotAmount: result?.progressiveInvoiceTotAmount,
      progressiveInvoiceStatus: result?.progressiveInvoiceStatus,
      progressiveInvoiceDiscPercentage:
        result?.progressiveInvoiceDiscPercentage,
      progressiveInvoiceDiscount: result?.progressiveInvoiceDiscount,
      progressiveInvoicePrintInv: result?.progressiveInvoicePrintInv,
      progressiveInvoiceLocationId: result?.progressiveInvoiceLocationId,
      progressiveInvoicePayAppNo: result?.progressiveInvoicePayAppNo,
      progressiveInvoiceDescription: result?.progressiveInvoiceDescription,
      progressiveInvoiceProgress: result?.progressiveInvoiceProgress,
      progressiveInvoiceCurComplVal: result?.progressiveInvoiceCurComplVal,
      progressiveInvoiceCurComplPer: result?.progressiveInvoiceCurComplPer,
      progressiveInvoicePrevComplVal:
        result?.previousSummary?.totalCompletedValue,
      progressiveInvoicePrevComplPer:
        result?.previousSummary?.totalCompletedPer,
      progressiveInvoiceCumilativeVal: result?.progressiveInvoiceCumilativeVal,
      progressiveInvoiceCumilativePer: result?.progressiveInvoiceCumilativePer,
      progressiveInvoiceAmountDue: result?.progressiveInvoiceAmountDue,
      progressiveInvoiceTotal: result?.progressiveInvoiceTotal,
      progressiveInvoiceFsno: result?.progressiveInvoiceFsno,
      progressiveInvoiceUserId: result?.progressiveInvoiceUserId,
      progressiveInvoiceDescriptionId: result?.progressiveInvoiceDescriptionId,
      progressiveInvoicePlRetention: result?.progressiveInvoicePlRetention,
      progressiveInvoicePlTotalAmount: result?.progressiveInvoicePlTotalAmount,
      jobValue: result?.variaAmount?.jobAmount || 0,
      VariationAmt: result?.variaAmount?.varAmount || 0,
      totalJobValue: (result?.variaAmount?.jobAmount || 0) + (result?.variaAmount?.varAmount || 0),
      advanceAmount: result?.variaAmount?.advAmount || 0,
      PreRetentionAmount: result?.previousSummary?.totalRetentionAmount || 0,
      variationInvoiced: result?.previousSummary?.totalVariationAmount || 0,
      preAdvanceAmtDed: result?.previousSummary?.totalAdvanceAmount || 0,
      currentRetentionAmt: result?.progressiveInvoiceRetAmount || 0,
      // For ADVANCE invoices, progressiveInvoiceAdvanceDeduction holds PIadvanceAmt (not lessAdvance).
      lessAdvance: result?.progressiveInvoiceInvoiceType === 'ADVANCE' ? 0 : (result?.progressiveInvoiceAdvanceDeduction || 0),
      PIadvanceAmt: result?.progressiveInvoiceInvoiceType === 'ADVANCE' ? (result?.progressiveInvoiceAdvanceDeduction || 0) : 0,
      VariationAmountDue: result?.progressiveInvoiceVariationAmount || 0,
    });
    this.applyInvoiceTypeRules(result?.progressiveInvoiceInvoiceType);
    this.recalculate();
    // Restore advance deduction from saved record — recalculate() overwrites lessAdvance
    // with an auto-formula value, so we must set both fields back to what the backend returned.
    // For ADVANCE invoices, progressiveInvoiceAdvanceDeduction stores PIadvanceAmt, not lessAdvance.
    const isAdvanceType = result?.progressiveInvoiceInvoiceType === 'ADVANCE';
    const savedLessAdvance = isAdvanceType ? 0 : (result?.progressiveInvoiceAdvanceDeduction || 0);
    const savedPreAdvanceDed = result?.previousSummary?.totalAdvanceAmount || 0;
    this.f.lessAdvance.setValue(this.round(savedLessAdvance), { emitEvent: false });
    this.f.cumAdvAmtDed.setValue(this.round(savedPreAdvanceDed + savedLessAdvance), { emitEvent: false });
    const gridData: any[] = (result?.prgInvoiceDetails ?? []).map((k) => ({
      InvNo: k.progressiveInvoiceInvNo,
      Progress: k.progressiveInvoiceProgress,
      CurValue: k.progressiveInvoiceCurComplVal,
      Currentper: k.progressiveInvoiceCurComplPer,
      PreValue: k.progressiveInvoicePrevComplVal,
      Preper: k.progressiveInvoicePrevComplPer,
      CumValue: k.progressiveInvoiceCumilativeVal,
      Cumper: k.progressiveInvoiceCumilativePer,
      VarationInvoice: k.variationInvoice,
      RetAmount: k.progressiveInvoiceVariationAmount,
      id: null,
    }));
    this.progressiveinvoice_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.progressiveinvoiceFormGroup.disable();
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.PIService.DeleteProgressInvoice(this.selectedRecord).subscribe(
          (data) => {
            this.userTrackingLog('Delete');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: this.translate.instant(
                'Progressive Invoice Deleted Succesfully'
              ),
            });
            this.new();
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: this.translate.instant('Failed'),
            });
          }
        );
      },
    });
  }

  getList() {
    this.callDropdowns();
    this.PIService.GetProgressInvoiceReport().subscribe((res: any) => {
      this.progressiveInvoice = res.map((i) => {
        i.jobname =
          i.progressiveInvoiceJobId == -1
            ? ''
            : this.getJobName(i.progressiveInvoiceJobId);
        i.Customer =
          i.progressiveInvoiceCustId == -1
            ? ''
            : this.getcustName(i.progressiveInvoiceCustId);
        return i;
      });
      this.filterArray = res;
      this.displayMaximizable = true;
    });
  }

  public getJobName(unit: number): string {
    return this.jobList?.find((j) => j?.value === unit)?.label;
  }

  public getcustName(id: number): string {
    return this.CustomerMasterList?.find((j) => j?.value === id)?.label;
  }
  save() {
    const raw = this.progressiveinvoiceFormGroup.getRawValue();
    const n = (v: any): number | undefined =>
      (v === '' || v === null || v === undefined) ? undefined : +v;

    const PIVoucher_Save: ProgressiveInvoice = {
      progressiveInvoiceId: raw.progressiveInvoiceId,
      progressiveInvoiceInvNo: raw.progressiveInvoiceInvNo,
      progressiveInvoiceCustId: raw.progressiveInvoiceCustId,
      progressiveInvoiceJobId: raw.progressiveInvoiceJobId,
      progressiveInvoiceInvDate: raw.progressiveInvoiceInvDate,
      progressiveInvoiceIsVariation: !!raw.progressiveInvoiceIsVariation,
      progressiveInvoiceInvoiceType: raw.progressiveInvoiceInvoiceType,
      progressiveInvoiceReference: raw.progressiveInvoiceReference,
      // GROSS billing (ex-deductions, ex-VAT) — used as CR Sales Revenue in GL
      progressiveInvoiceTotAmount: raw.progressiveInvoiceInvoiceType === 'ADVANCE'
        ? n(raw.PIadvanceAmt)
        : n(raw.progressiveInvoiceCurComplVal),
      progressiveInvoiceStatus: raw.progressiveInvoiceStatus,
      progressiveInvoiceDiscPercentage: n(raw.progressiveInvoiceDiscPercentage),
      progressiveInvoiceDiscount: n(raw.progressiveInvoiceDiscount),
      progressiveInvoicePrintInv: raw.progressiveInvoicePrintInv,
      progressiveInvoiceLocationId: raw.progressiveInvoiceLocationId,
      progressiveInvoicePayAppNo: raw.progressiveInvoicePayAppNo,
      progressiveInvoiceDescription: raw.progressiveInvoiceDescription,
      progressiveInvoiceProgress: raw.progressiveInvoiceProgress,
      progressiveInvoiceCurComplVal: n(raw.progressiveInvoiceCurComplVal),
      progressiveInvoiceCurComplPer: n(raw.progressiveInvoiceCurComplPer),
      progressiveInvoicePrevComplVal: n(raw.progressiveInvoicePrevComplVal),
      progressiveInvoicePrevComplPer: n(raw.progressiveInvoicePrevComplPer),
      progressiveInvoiceCumilativeVal: n(raw.progressiveInvoiceCumilativeVal),
      progressiveInvoiceCumilativePer: n(raw.progressiveInvoiceCumilativePer),
      progressiveInvoiceAmountDue: n(raw.progressiveInvoiceAmountDue),
      progressiveInvoiceTotal: n(raw.progressiveInvoiceTotal),
      progressiveInvoiceFsno: raw.progressiveInvoiceFsno,
      progressiveInvoiceUserId: this.user.userId,
      progressiveInvoicePlRetention: n(raw.progressiveInvoicePlRetention),
      progressiveInvoicePlTotalAmount: n(raw.progressiveInvoicePlTotalAmount),
      // FINAL releases ALL accumulated retention (prev + current); INTERIM only current period
      progressiveInvoiceRetAmount: raw.progressiveInvoiceInvoiceType === 'FINAL'
        ? n(raw.retentionRelease)
        : n(raw.currentRetentionAmt),
      // For ADVANCE invoices, PIadvanceAmt is the billed amount; lessAdvance is always 0.
      // Reuse the same DB column to store whichever is relevant for the invoice type.
      progressiveInvoiceAdvanceDeduction: raw.progressiveInvoiceInvoiceType === 'ADVANCE'
        ? n(raw.PIadvanceAmt)
        : n(raw.lessAdvance),
      progressiveInvoiceVariationAmount: n(raw.VariationAmountDue),
      accountsTransactions: [],
      progressiveInvoiceDetails: [],
    };

    if (this.btnFlag.save) {
      this.saveVoucher(PIVoucher_Save);
    } else {
      this.updateVoucher(PIVoucher_Save);
    }
  }

  public get IsValidGrid(): boolean {
    if (this.progressiveinvoice_entry.data.length > 0) {
      // this.salesvoucher_entry.data.forEach((value: GridData, index, arry) => {
      return Object.values(this.progressiveinvoice_entry.data).some(
        (k: any) => k.InvNo != null
      );
      // });
    }
    return false;
  }

  saveVoucher(Voucher_Save: ProgressiveInvoice) {
    if (this.progressiveinvoiceFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to Save Progressive Invoice?'
        ),
        accept: () => {
          this.PIService.InsertProgressInvoice(Voucher_Save).subscribe(
            (data) => {
              if (data.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: true,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.selectedRecord = data.result;
                this.GetSavedSalesVoucherDetails(data.result.progressiveInvoiceId);
                this.userTrackingLog('Insert');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: this.translate.instant(data.message),
                });
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: data.message?.trim() ? data.message : (data.exception || 'Progressive Invoice Save Failed'),
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant(
                  'Progressive Invoice Save Failed'
                ),
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
      this.progressiveinvoiceFormGroup.markAllAsTouched();
    }
  }

  updateVoucher(Voucher_Save: ProgressiveInvoice) {
    if (this.progressiveinvoiceFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to Update Progressive Invoice?'
        ),
        accept: () => {
          this.PIService.UpdateProgressInvoice(Voucher_Save).subscribe(
            (data) => {
              if (data.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: true,
                  save: false,
                  update: true,
                  delete: true,
                  new: true,
                };
                this.selectedRecord = data.result;
                this.GetSavedSalesVoucherDetails(data.result.progressiveInvoiceId);
                this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: this.translate.instant(data.message),
                });
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: data.message?.trim() ? data.message : (data.exception || 'Progressive Invoice Update Failed'),
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant(
                  'Progressive Invoice Update Failed'
                ),
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
      this.progressiveinvoiceFormGroup.markAllAsTouched();
    }
  }

  userTrackingLog(type) {
    let req = {
      page: 'ProgressiveInvoice',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: String(this.progressiveinvoiceFormGroup.value.progressiveInvoiceId),
      vpType: 'ProgressiveInvoice',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  // ─────────────────────────────────────────────
  // CALCULATION ENGINE
  // ─────────────────────────────────────────────

  private round(val: number): number {
    return Math.round((val || 0) * 100) / 100;
  }

  setupCalculations() {
    // CurComplPer → CurComplVal
    this.f.progressiveInvoiceCurComplPer.valueChanges.subscribe(per => {
      const total = +(this.f.totalJobValue.value) || 0;
      if (total > 0) {
        this.f.progressiveInvoiceCurComplVal.setValue(
          this.round((+per / 100) * total), { emitEvent: false }
        );
      }
      this.recalculate();
    });

    // CurComplVal → CurComplPer
    this.f.progressiveInvoiceCurComplVal.valueChanges.subscribe(val => {
      const total = +(this.f.totalJobValue.value) || 0;
      if (total > 0) {
        this.f.progressiveInvoiceCurComplPer.setValue(
          this.round((+val / total) * 100), { emitEvent: false }
        );
      }
      this.recalculate();
    });

    // All other triggers
    ['progressiveInvoicePlRetention', 'Variance', 'PIvatPer', 'PIadvanceAmt']
      .forEach(ctrl => this.f[ctrl].valueChanges.subscribe(() => this.recalculate()));

    // Invoice type change: apply field rules then fetch previous summary if INTERIM
    this.f.progressiveInvoiceInvoiceType.valueChanges.subscribe(type => {
      this.applyInvoiceTypeRules(type);
      this.loadPreviousSummaryIfInterim();
    });
  }

  applyInvoiceTypeRules(invoiceType: string) {
    if (!invoiceType) return;

    const completionControls = [
      'progressiveInvoiceCurComplPer', 'progressiveInvoiceCurComplVal',
      'progressiveInvoicePlRetention', 'lessAdvance', 'Variance',
    ];

    if (invoiceType === 'ADVANCE') {
      // Disable all completion & retention fields — only advance amount matters
      completionControls.forEach(c => this.f[c].disable({ emitEvent: false }));
      this.f.PIadvanceAmt.enable({ emitEvent: false });
      this.f.PIadvanceAmt.setValidators([Validators.required, Validators.min(0.01)]);
      this.f.PIadvanceAmt.updateValueAndValidity({ emitEvent: false });
      // Clear completion values
      completionControls.forEach(c => this.f[c].setValue(0, { emitEvent: false }));

    } else if (invoiceType === 'INTERIM') {
      // Enable all completion fields, lock advance amount
      completionControls.forEach(c => this.f[c].enable({ emitEvent: false }));
      this.f.PIadvanceAmt.clearValidators();
      this.f.PIadvanceAmt.updateValueAndValidity({ emitEvent: false });
      this.f.PIadvanceAmt.disable({ emitEvent: false });
      this.f.PIadvanceAmt.setValue(0, { emitEvent: false });

    } else if (invoiceType === 'FINAL') {
      // Current % is auto-calculated (100 - prev%) — disable those two inputs
      this.f.progressiveInvoiceCurComplPer.disable({ emitEvent: false });
      this.f.progressiveInvoiceCurComplVal.disable({ emitEvent: false });
      // Retention % and deductions remain editable
      ['progressiveInvoicePlRetention', 'lessAdvance', 'Variance'].forEach(c => this.f[c].enable({ emitEvent: false }));
      this.f.PIadvanceAmt.clearValidators();
      this.f.PIadvanceAmt.updateValueAndValidity({ emitEvent: false });
      this.f.PIadvanceAmt.disable({ emitEvent: false });
      this.f.PIadvanceAmt.setValue(0, { emitEvent: false });
    }
  }

  recalculate() {
    const v = this.progressiveinvoiceFormGroup.getRawValue();
    const invoiceType = v.progressiveInvoiceInvoiceType;
    const jobValue = +(v.jobValue) || 0;
    const variationAmt = +(v.VariationAmt) || 0;
    const totalJobValue = jobValue + variationAmt;
    let curComplVal = +(v.progressiveInvoiceCurComplVal) || 0;
    let curComplPer = +(v.progressiveInvoiceCurComplPer) || 0;
    const prevComplVal = +(v.progressiveInvoicePrevComplVal) || 0;
    const prevComplPer = +(v.progressiveInvoicePrevComplPer) || 0;
    const retentionPer = +(v.progressiveInvoicePlRetention) || 0;
    const lessAdvance = +(v.lessAdvance) || 0;
    const variance = +(v.Variance) || 0;
    const vatPer = +(v.PIvatPer) || 0;
    const advanceAmount = +(v.advanceAmount) || 0;
    const prevRetention = +(v.PreRetentionAmount) || 0;
    const prevVariation = +(v.variationInvoiced) || 0;
    const prevAdvanceDed = +(v.preAdvanceAmtDed) || 0;

    this.f.totalJobValue.setValue(this.round(totalJobValue), { emitEvent: false });

    // ── ADVANCE: zero out all completion, bill advance amount only ──
    if (invoiceType === 'ADVANCE') {
      const advAmt = +(v.PIadvanceAmt) || 0;
      this.f.progressiveInvoiceCumilativePer.setValue(0, { emitEvent: false });
      this.f.progressiveInvoiceCumilativeVal.setValue(0, { emitEvent: false });
      this.f.currentRetentionAmt.setValue(0, { emitEvent: false });
      this.f.cumRetentionAmt.setValue(this.round(prevRetention), { emitEvent: false });
      this.f.cumAdvAmtDed.setValue(this.round(prevAdvanceDed), { emitEvent: false });
      this.f.VariationAmountDue.setValue(0, { emitEvent: false });
      this.f.cumVariationAmt.setValue(this.round(prevVariation), { emitEvent: false });
      this.f.retentionRelease.setValue(0, { emitEvent: false });
      this.f.progressiveInvoiceAmountDue.setValue(advAmt, { emitEvent: false });
      this.f.grossAmt.setValue(advAmt, { emitEvent: false });
      const vatAmt = this.round((vatPer / 100) * advAmt);
      this.f.PIvatAmt.setValue(vatAmt, { emitEvent: false });
      this.f.progressiveInvoiceTotal.setValue(this.round(advAmt + vatAmt), { emitEvent: false });
      return;
    }

    // ── FINAL: auto-calculate current % as remaining to reach 100% ──
    if (invoiceType === 'FINAL' && totalJobValue > 0) {
      curComplPer = this.round(Math.max(0, 100 - prevComplPer));
      curComplVal = this.round((curComplPer / 100) * totalJobValue);
      this.f.progressiveInvoiceCurComplPer.setValue(curComplPer, { emitEvent: false });
      this.f.progressiveInvoiceCurComplVal.setValue(curComplVal, { emitEvent: false });
    }

    // ── INTERIM: validate cumulative does not exceed 100% ──
    if (invoiceType === 'INTERIM') {
      const projectedCumPer = prevComplPer + curComplPer;
      if (projectedCumPer > 100) {
        this.messageService.add({
          severity: 'warn', summary: 'Validation',
          detail: `Total completion ${projectedCumPer.toFixed(2)}% exceeds 100%. Max allowed current % is ${(100 - prevComplPer).toFixed(2)}%.`
        });
      }
    }

    // ── Cumulative Completion ─────────────────────────
    const cumComplPer = this.round(prevComplPer + curComplPer);
    const cumComplVal = this.round(prevComplVal + curComplVal);
    this.f.progressiveInvoiceCumilativePer.setValue(cumComplPer, { emitEvent: false });
    this.f.progressiveInvoiceCumilativeVal.setValue(cumComplVal, { emitEvent: false });

    // ── Current Retention ─────────────────────────────
    const currentRetentionAmt = this.round((retentionPer / 100) * curComplVal);
    this.f.currentRetentionAmt.setValue(currentRetentionAmt, { emitEvent: false });

    // ── Cumulative Retention ──────────────────────────
    this.f.cumRetentionAmt.setValue(this.round(prevRetention + currentRetentionAmt), { emitEvent: false });

    // ── Cumulative Advance Deduction ──────────────────
    // Always auto-calculate proportionally so it stays in sync when % changes
    const autoAdvance = (advanceAmount > 0 && totalJobValue > 0)
      ? this.round((advanceAmount / totalJobValue) * curComplVal) : 0;
    this.f.lessAdvance.setValue(autoAdvance, { emitEvent: false });
    const effectiveLessAdvance = autoAdvance;
    this.f.cumAdvAmtDed.setValue(this.round(prevAdvanceDed + effectiveLessAdvance), { emitEvent: false });

    // ── Variation Amount Due ──────────────────────────
    const variationAmountDue = totalJobValue > 0
      ? this.round((variationAmt / totalJobValue) * curComplVal) : 0;
    this.f.VariationAmountDue.setValue(variationAmountDue, { emitEvent: false });
    this.f.cumVariationAmt.setValue(this.round(prevVariation + variationAmountDue), { emitEvent: false });

    // ── FINAL: release all retained amounts ───────────
    let retentionRelease = 0;
    let amountDue = 0;

    if (invoiceType === 'FINAL') {
      // Release = all previously retained + current period retention
      retentionRelease = this.round(prevRetention + currentRetentionAmt);
      // Amount Due: current value + all retention released - advance deduction
      amountDue = this.round(curComplVal + retentionRelease - effectiveLessAdvance + variance);
    } else {
      // INTERIM: current value - retention - advance deduction
      amountDue = this.round(curComplVal - currentRetentionAmt - effectiveLessAdvance + variance);
    }

    this.f.retentionRelease.setValue(retentionRelease, { emitEvent: false });
    this.f.progressiveInvoiceAmountDue.setValue(amountDue, { emitEvent: false });
    this.f.grossAmt.setValue(amountDue, { emitEvent: false });

    // ── VAT & Net Total ───────────────────────────────
    const vatAmt = this.round((vatPer / 100) * amountDue);
    this.f.PIvatAmt.setValue(vatAmt, { emitEvent: false });
    this.f.progressiveInvoiceTotal.setValue(this.round(amountDue + vatAmt), { emitEvent: false });
  }

  showPrintPreview() {

    const invType = this.f.progressiveInvoiceInvoiceType.value;
    const reportName =
      invType === 'ADVANCE' ? 'Progressive_Inv_Advance' :
        invType === 'INTERIM' ? 'Progressive_Inv_Interim' :
          'Progressive_Inv_Tax';

    this.exportReport(
      ExportFormatType.PortableDocFormat,
      'application/pdf',
      `${reportName}.pdf`,
      reportName,
      true
    );
  }

  cancel() {
    if (this.selectedRecord) {
      this.progressiveinvoiceFormGroup.disable();
      this.btnFlag = { edit: true, cancel: false, save: false, update: false, delete: true, new: true };
    } else {
      this.new();
    }
  }

  edit() {
    this.progressiveinvoiceFormGroup.enable();
    this.applyInvoiceTypeRules(this.f.progressiveInvoiceInvoiceType.value);
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
    // this.progressiveinvoice_entry.readOnly = false;
    // this.hotRegisterer
    //   .getInstance(this.hotid)
    //   .updateSettings(this.progressiveinvoice_entry);
  }

  new() {
    this.progressiveinvoiceFormGroup.reset();
    this.progressiveinvoiceFormGroup.enable();
    this.progressiveinvoice_entry.data = [];
    this.hotRegisterer.getInstance(this.hotid)?.updateSettings({ data: [], readOnly: false });
    this.selectedRecord = null;

    // Set default invoice date
    this.f.progressiveInvoiceInvDate.setValue(new Date());

    // Clear Previous % Completion section
    this.f.progressiveInvoicePrevComplPer.setValue(0, { emitEvent: false });
    this.f.progressiveInvoicePrevComplVal.setValue(0, { emitEvent: false });
    this.f.PreRetentionAmount.setValue(0, { emitEvent: false });
    this.f.variationInvoiced.setValue(0, { emitEvent: false });
    this.f.preAdvanceAmtDed.setValue(0, { emitEvent: false });

    // Clear Cumulative % Completion section
    this.f.progressiveInvoiceCumilativePer.setValue(0, { emitEvent: false });
    this.f.progressiveInvoiceCumilativeVal.setValue(0, { emitEvent: false });
    this.f.cumRetentionAmt.setValue(0, { emitEvent: false });
    this.f.cumVariationAmt.setValue(0, { emitEvent: false });
    this.f.cumAdvAmtDed.setValue(0, { emitEvent: false });

    // Clear Retention Amount section
    this.f.currentRetentionAmt.setValue(0, { emitEvent: false });
    this.f.retentionRelease.setValue(0, { emitEvent: false });

    // Reset all calculation fields to ensure clean state
    this.f.progressiveInvoiceCurComplVal.setValue(0, { emitEvent: false });
    this.f.progressiveInvoiceCurComplPer.setValue(0, { emitEvent: false });
    this.f.progressiveInvoiceAmountDue.setValue(0, { emitEvent: false });
    this.f.grossAmt.setValue(0, { emitEvent: false });
    this.f.PIvatAmt.setValue(0, { emitEvent: false });
    this.f.progressiveInvoiceTotal.setValue(0, { emitEvent: false });
    this.f.lessAdvance.setValue(0, { emitEvent: false });
    this.f.VariationAmountDue.setValue(0, { emitEvent: false });

    // Recalculate to ensure all derived fields are properly initialized
    this.recalculate();

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.callDropdowns();
  }

  initializeControls() {
    this.progressiveinvoice_entry = {
      ...this.utilityService.getTableConfig(ColumnsGrid(this), [10], {
        height: '300px',
      }),

    }
  }

  filter() {
    let filteredArray = this.filterArray;
    if (
      this.PIFilterForm.value.purchaseGRNNo != null &&
      this.PIFilterForm.value.purchaseGRNNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) => res.PIPurID === Number(this.PIFilterForm.value.purchaseGRNNo)
      );
    }

    if (
      this.PIFilterForm.value.PINo != null &&
      this.PIFilterForm.value.PINo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) => res.PIVoucherNo === this.PIFilterForm.value.PINo
      );
    }

    if (this.PIFilterForm.value.isDate) {
      const fromDateStr = this.PIFilterForm.value.fromDate;
      const toDateStr = this.PIFilterForm.value.toDate;

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.PIPurchaseDate);
        const fromDate = new Date(fromDateStr);
        const toDate = new Date(toDateStr);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.progressiveInvoice = filteredArray;
    }
    this.progressiveInvoice = filteredArray;
  }

  ClearFilter() {
    this.PIFilterForm.reset();
    this.progressiveInvoice = this.filterArray;
    this.PIFilterForm.get('fromDate').setValue(new Date());
    this.PIFilterForm.get('toDate').setValue(new Date());
  }
}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
export const ColumnsGrid = (component: ProgressiveInvoiceComponent) => [
  { data: 'InvNo', type: 'text', label: 'Inv.No', toolTip: 'Invoice Number' },
  { data: 'Progress', type: 'numeric', label: 'Progress', toolTip: 'Progress' },
  { data: 'CurValue', type: 'numeric', label: 'Cur.Value', toolTip: 'Current Value' },
  { data: 'Currentper', type: 'numeric', label: 'Current%', toolTip: 'Current Percentage' },
  { data: 'PreValue', type: 'numeric', label: 'Pre.Value', toolTip: 'Previous Value' },
  { data: 'Preper', type: 'numeric', label: 'Pre.%', toolTip: 'Previous Percentage' },
  { data: 'CumValue', type: 'numeric', label: 'Cum.Value', toolTip: 'Cumulative Value' },
  { data: 'Cumper', type: 'numeric', label: 'Cum.%', toolTip: 'Cumulative Percentage' },
  { data: 'VarationInvoice', type: 'text', label: 'Variation Invoice', toolTip: 'Variation Invoice' },
  { data: 'RetAmount', type: 'numeric', label: 'Ret.Amount', toolTip: 'Retention Amount' },
  { data: 'id', type: 'numeric', label: 'Id', toolTip: 'Identifier' },
];
