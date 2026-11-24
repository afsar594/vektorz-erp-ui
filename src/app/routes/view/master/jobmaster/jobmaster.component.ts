import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';
// import { FormBuilder, FormGroup } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

import { MenuItem } from 'primeng/api/menuitem';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import {
  SelectItem,
  MessageService,
  ConfirmationService,
  TreeNode,
} from 'primeng/api';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { timer } from 'rxjs';
import {
  ChartofAccounts,
  ItemMaster,
  ProjectDescriptionMaster,
} from 'src/app/routes/domain';
import { BankGuaranteeMaster } from 'src/app/routes/domain/Masters/BankGuaranteeMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import {
  JobMaster,
  JobTimesheetDesc,
  JobTimeSheetStaff,
} from 'src/app/routes/domain/Masters/JobMaster';
import { JobMasterBudgetDetails } from 'src/app/routes/domain/Masters/JobMasterBudgetDetails';
import { JobMasterJobDetails } from 'src/app/routes/domain/Masters/JobMasterJobDetails';
import { JobMasterJobWiseBankGuarantees } from 'src/app/routes/domain/Masters/JobMasterJobWiseBankGuarantees';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';

import { ImportApiService } from 'src/app/routes/service/import-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { HrStaffMasterService } from 'src/app/routes/service/hr-staff-master.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { DatePipe } from '@angular/common';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import * as XLSX from 'xlsx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
@Component({
  selector: 'app-jobmaster',
  templateUrl: './jobmaster.component.html',
  styleUrls: ['./jobmaster.component.scss'],
})
export class JobmasterComponent implements OnInit {
  userLevel2Enabled: boolean = false;
  downloadAllDocuments() {
    const jobId = this.jobMasterFormGroup.value.jobMasterId;
    this.api
      .downloadAllFilesAsOnePdf(jobId, 'JobMaster', {
        responseType: 'blob',
        observe: 'response' as 'body',
      })
      .subscribe((response: any) => {
        const blob = new Blob([response.body], { type: response.body.type });

        // Extract filename from content-disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${this.jobMasterFormGroup.value.jobMasterJobNumber}_${this.jobMasterFormGroup.value.jobMasterJobName}`;

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

  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;

  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];
  stationmasterObj: StationMaster;
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  BankGuaranteeMasterArray: BankGuaranteeMaster[] = [];
  BankGuaranteeMasterArry: string[] = [];
  BankGuaranteeMasterList: SelectItem[];

  ProjectDescriptionMasterArray: ProjectDescriptionMaster[] = [];
  ProjectDescriptionMasterArry: string[] = [];
  ProjectDescriptionMasterList: SelectItem[];

  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];

  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];
  CustomerQuotationList: SelectItem[] = [];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterListt: any;
  costcenterArry: string[] = [];

  jobMasterBudgetDetailsList: JobMasterBudgetDetails[] = [];
  jobMasterJobDetailsList: JobMasterJobDetails[] = [];
  accountsTransactions: AccountsTransactions[] = [];
  jobMasterJobWiseBankGuaranteesList: JobMasterJobWiseBankGuarantees[] = [];

  jobMasterarry: JobMaster[] = [];
  // savedJobMasterJobScopeGridData: JobScopeGridData[] = [];
  savedJobMaster: JobMaster;

  JobScope_StatusArry: string[] = [];
  JobScope_StatusList: SelectItem[];
  displayPrintPreview: boolean = false;
  displayReportPreview: boolean = false;

  selectItem: any;
  Job_StatusArray: ItemMaster[] = [];
  Job_StatusArry: string[] = [];
  Job_StatusList: SelectItem[];
  uploadedFiles: any[] = [];
  activeRow: { row: number; column: number };
  activeRowDT: { row: number; column: number };
  ScreenId: number;
  Permission: any;
  showcostCenterLookUp: boolean = false;
  lookupGridColumns = [];
  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;
  user: any;
  isdSheet: boolean = false;
  dataList: Array<any> = [];
  staffArray: any;
  Isstaff: boolean = false;
  activeRowS: { row: number; column: number };
  pdfSource: string;
  commonGridSettings: any;
  totalExpC: any = 0;
  totalExpd: any = 0;
  totalReciptD: number = 0;
  totalReciptC: number = 0;
  totalPAyD: number = 0;
  totalPaytC: number = 0;
  Payment_list: AccountTransactionGrid[];
  Receipt_list: AccountTransactionGrid[];
  expenceDiff: any = 0;
  jobProfit: any = 0;
  jobProfitper: any = 0;
  staffEX: any;
  staffTS: any;
  staffindex: number = 0;
  printbtn: MenuItem[];
  currencys: any[] = [];
  equipmentDatasetDetails: any[] = [];
  HIDERETENTION: boolean;
  files: TreeNode[] = [];
  selectedFile: TreeNode | null = null;
  previewUrl: SafeResourceUrl | null = null;
  fileAttachmentDialogVisibility: boolean = false;
  attachmentsToUploaded: any[] = [];

  showFileAttachmentDialog() {
    this.fileAttachmentDialogVisibility = true;
  }

  onUpload(event: UploadEvent) {
    for (let file of event.files) {
      this.attachmentsToUploaded.push(file);
    }

    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: '',
    });
  }

  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.JobScope_StatusList = [
      { label: 'Pending', value: 0 },
      { label: 'Cancel', value: 1 },
      { label: 'Finish', value: 2 },
      { label: 'In Progress', value: 3 },
    ];
    this.Job_StatusList = [
      { label: 'Active', value: 1 },
      { label: 'Passive', value: 2 },
    ];
    // this.JobScope_StatusArry = ['Pending', 'Cancel', 'Finish'];
  }
  uploadedjobDocs: any;
  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private staffmasterService: HrStaffMasterService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private crystalReportService: CrystalReportService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private api: ImportApiService,
    private datePipe: DatePipe,
    private permission: PermissionsService,
    private formatDateService: ReportDateFormatService,
    private utilityservice: UtilityService,
    private sanitizer: DomSanitizer,
    private stockApi : StockApiService,
    
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.printbtn = [
      {
        label: 'PDF',
        command: () => {
          this.printCReport('pdf');
        },
      },
      {
        label: 'Excel',
        command: () => {
          this.printCReport('excel');
        },
      },
    ];
  }

  private BankGuaranteeshotRegisterer = new HotTableRegisterer();
  BankGuaranteeshotid = 'BankGuarantees_HotEntry';
  BankGuarantees_entry: Handsontable.GridSettings;
  BankGuarantees_entryDataset = [];

  private BudjethotRegisterer = new HotTableRegisterer();
  Budjethotid = 'Budjet_HotEntry';
  Budjet_entry: Handsontable.GridSettings;
  Budjet_entryDataset = [];

  private VariationhotRegisterer = new HotTableRegisterer();
  Variationhotid = 'Variation_HotEntry';
  Variation_entry: Handsontable.GridSettings;
  Variation_entryDataset = [];

  private JobScopehotRegisterer = new HotTableRegisterer();
  JobScopehotid = 'jobScope_HotEntry';
  jobScope_entry: Handsontable.GridSettings;
  jobScope_entryDataset = [];

  private PaymentVoucherhotRegisterer = new HotTableRegisterer();
  Paymenthotid = 'payment_HotEntry';
  Payment_entry: Handsontable.GridSettings;
  Payment_entryDataset = [];

  private ReceiptVoucherhotRegisterer = new HotTableRegisterer();
  Receipthotid = 'receipt_HotEntry';
  Receipt_entry: Handsontable.GridSettings;
  Receipt_entryDataset = [];
  displaystaffList: boolean = false;
  private ExpensehotRegisterer = new HotTableRegisterer();
  Expensehotid = 'Expense_HotEntry';
  Expense_entry: Handsontable.GridSettings;
  Expense_entryDataset = [];

  private StaffhotRegisterer = new HotTableRegisterer();
  Staffhotid = 'Staff';
  Staff: Handsontable.GridSettings;
  StaffDataset: any[] = [];

  private StaffhotRegistererDT = new HotTableRegisterer();
  StaffhotidDT = 'StaffDT';
  StaffDT: Handsontable.GridSettings;
  staffId: any[] = [];

  private EquipmenthotRegisterer = new HotTableRegisterer();
  Equipmenthotid = 'Equipment';
  Equipment: Handsontable.GridSettings;
  EquipmentDataset: any[] = [];

  private EquipmenthotRegistererDT = new HotTableRegisterer();
  EquipmenthotidDT = 'EquipmentDT';
  EquipmentDT: Handsontable.GridSettings;

  private DetailhotRegisterer = new HotTableRegisterer();
  Detailhotid = 'Detail';
  Detail: Handsontable.GridSettings;
  DetailDataset: any[] = [];

  private DetailhotRegistererDT = new HotTableRegisterer();
  DetailhotiDDT = 'DetailDT';
  DetailDT: Handsontable.GridSettings;
  DetailDatasetDT: JobTimesheetDesc[] = [];

  private JobfilesRegisterer = new HotTableRegisterer();
  JobfileshotiD = 'jobHOtid';
  Jobfiles: Handsontable.GridSettings;

  private costcenterRegisterer = new HotTableRegisterer();

  costcenterhotiD = 'costcenterHOtid';

  costcenter: Handsontable.GridSettings;
  costcenterDataset: any[] = [];
  JobfilesDataset: any[] = [];

  SubJobhotid = 'SubJob';

  private hotRegisterer = new HotTableRegisterer();
  SubJob: Handsontable.GridSettings;
  jobMasterFormGroup: FormGroup;
  cols;
  hideAccounts: boolean = false;

  ngOnInit(): void {
    this.commonGridSettings = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      width: '100%',
      height: 120,
      rowHeights: 23,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      minSpareRows: 1,
      allowInsertRow: true,
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
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
    this.initializeAllList();
    this.initializeExpenseList();
    this.initializePaymentAndReceiptList();
    this.initializedVariationList();
    this.executioninitializeControls();
    this.timesheetinitializeControls();
    this.FILL_COMBO();
    this.loadCustomerQuotation();

    this.cols = [
      { field: 'jobMasterJobNo', header: 'Job No' },
      { field: 'jobMasterJobNumber', header: 'Job Code' },
      { field: 'jobMasterJobDate', header: 'Job Date' },
      { field: 'jobMasterJobName', header: 'Name' },
      { field: 'jobMasterRemarks', header: 'Narration' },
      { field: 'jobMasterRelativeNo', header: 'Relative #' },
      { field: 'jobMasterJobConsultantReff', header: 'Conf.Reff' },
      { field: 'jobMasterConsultant', header: 'Consultant' },
      { field: 'jobMasterStatus', header: 'Status' },
      { field: 'jobMasterJobType', header: 'Job.Type' },
      { field: 'jobMasterContractorName', header: 'Contractor' },
      { field: 'jobMasterContractorView', header: 'View' },
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };

    this.jobMasterFormGroup = this.fb.group({
      jobMasterSupplierId: [{ value: -1, disabled: true }],
      jobMasterSalesManId: [{ value: -1, disabled: true }],
      jobMasterJobNumber: [{ value: '', disabled: true }],
      jobMasterOverHeadCost: [{ value: null, disabled: true }],
      jobMasterOverHeadCostVar: [{ value: null, disabled: true }],
      jobMasterMiscCost: [{ value: null, disabled: true }],
      jobMasterTotCost: [{ value: null, disabled: true }],
      jobMasterProfit: [{ value: null, disabled: true }],
      jobMasterTotPayValue: [{ value: null, disabled: true }],
      jobMasterIsSubJob: [{ value: null, disabled: true }],
      jobMasterNoCostCenter: [{ value: null, disabled: true }],
      jobMasterPendingPo: [{ value: null, disabled: true }],
      jobMasterHrjobId: [{ value: null, disabled: true }],
      jobMasterContractorName: [{ value: '', disabled: true }],
      jobMasterCommenceDate: [{ value: null, disabled: true }],
      timesheetDate: [{ value: null, disabled: true }],
      jobMasterContractType: [{ value: '', disabled: true }],
      jobMasterWorkDays: [{ value: null, disabled: true }],
      jobMasterOrgCompDate: [{ value: null, disabled: true }],
      jobMasterPayTermDays: [{ value: '', disabled: true }],
      jobMasterVariationAmount: [{ value: null, disabled: true }],

      jobMasterAdvPercOnVar: [{ value: null, disabled: true }],
      jobMasterAdvAmountOnVar: [{ value: null, disabled: true }],
      jobMasterRetAccNo: [{ value: '', disabled: true }],
      jobMasterRetAccName: [{ value: '', disabled: true }],
      jobMasterAdvAccNo: [{ value: '', disabled: true }],
      jobMasterAdvAccName: [{ value: '', disabled: true }],
      jobMasterCumValue: [{ value: null, disabled: true }],
      jobMasterDirectCost: [{ value: null, disabled: true }],
      jobMasterRetAmount: [{ value: null, disabled: true }],
      jobMasterAdvInvoice: [{ value: null, disabled: true }],

      jobMasterAdvRecovery: [{ value: null, disabled: true }],
      jobMasterDeduction: [{ value: null, disabled: true }],
      jobMasterReceivable: [{ value: null, disabled: true }],
      jobMasterVatamount: [{ value: null, disabled: true }],
      jobMasterReceived: [{ value: null, disabled: true }],

      jobMasterJobBuildId: [{ value: null, disabled: true }],
      jobMasterJobFlatId: [{ value: null, disabled: true }],
      jobMasterJobContractId: [{ value: null, disabled: true }],
      jobMasterJobComplientId: [{ value: null, disabled: true }],
      jobMasterJobCustQtnId: [{ value: null, disabled: true }],
      jobMasterDelStatus: [{ value: null, disabled: true }],

      jobMasterId: [0],
      jobMasterNo: [{ value: '', disabled: true }],
      jobMasterJobDate: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      // jobMasterCurVal: [{ value: '', disabled: true }, [Validators.required]],
      jobMasterCurVal: [{ value: null, disabled: true }],
      jobMasterCurrency: [{ value: -1, disabled: true }, [DropDownValidator]],
      jobMasterStatusVal: [{ value: false, disabled: true }],

      jobMasterConsultant: [{ value: null, disabled: true }],
      jobMasterCustomerId: [{ value: -1, disabled: true }, [DropDownValidator]],
      jobMasterJobCode: [{ value: '', disabled: true }],
      jobMasterJobConfReff: [{ value: '', disabled: true }],
      jobMasterJobName: [{ value: '', disabled: true }, [Validators.required]],
      jobMasterRemarks: [{ value: '', disabled: true }],

      jobMasterBudOverHeadCost: [{ value: null, disabled: true }],
      jobMasterLabourCostVar: [{ value: null, disabled: true }],
      jobMasterBalance: [{ value: null, disabled: true }],
      jobMasterStatus: [{ value: null, disabled: true }],
      jobMasterOpenInv: [{ value: null, disabled: true }],
      jobMasterPerInv: [{ value: null, disabled: true }],
      jobMasterMatCostVar: [{ value: null, disabled: true }],
      jobMasterTotInvValue: [{ value: null, disabled: true }],
      jobMasterMatCost: [{ value: null, disabled: true }],
      jobMasterAdvPerc: [{ value: 0, disabled: true }],
      jobMasterLabourCost: [{ value: null, disabled: true }],

      jobMasterRetensionPer: [{ value: null, disabled: true }],

      jobMasterRelativeNo: [{ value: null, disabled: true }],
      jobMasterAdvAmountTotal: [{ value: null, disabled: true }],
      jobMasterRetention: [{ value: null, disabled: true }],
      jobMasterTotRecValue: [{ value: null, disabled: true }],
      jobMasterJobAdvanceAmount: [{ value: 0, disabled: true }],
      jobMasterTotExpValue: [{ value: null, disabled: true }],
      jobMasterJobValue: [{ value: null, disabled: true }],
      jobMasterJobType: [{ value: null, disabled: true }],
      jobMasterBudLabourCost: [{ value: null, disabled: true }],
      jobMasterBudMatCost: [{ value: null, disabled: true }],

      jobMasterTotVariation: [{ value: null, disabled: true }],
      jobMasterGridTotScope: [{ value: null, disabled: true }],
      jobMasterGridTotBank: [{ value: null, disabled: true }],
      jobMasterGridTotVariation: [{ value: null, disabled: true }],
      jobMasterGridTotBudject: [{ value: null, disabled: true }],
      remarks: [{ value: '', disabled: true }],
      clientRemarks: [{ value: '', disabled: true }],
      vesselName: [{ value: '', disabled: true }],
      jobId: [{ value: -1, disabled: true }],
      timesheetId: [{ value: null, disabled: true }],
      jobMasterUpdateStatus: [{ value: null, disabled: true }],
      jobMasterUpdateDate: [{ value: null, disabled: true }],
      jobMasterUpdateBtn: [{ value: null, disabled: true }],

      jobMasterUpdateAccBtn: [{ value: null, disabled: true }],
      jobMasterDepartmentId: [{ value: null, disabled: true }],
      jobMasterSiteLocation: [{ value: null, disabled: true }],
      jobMasterMEPContractor: [{ value: null, disabled: true }],
      jobMasterPlantType: [{ value: null, disabled: true }],
      jobMasterCapacity: [{ value: null, disabled: true }],
      jobMasterScheme: [{ value: null, disabled: true }],
      jobMasterPaymentTerms: [{ value: null, disabled: true }],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.getAllStaff();
    this.LoadDepartmentDD();
    this.HIDE_RETENTION_JOB();
  }

  HIDE_RETENTION_JOB() {
    this.masterapi
      .GetProgramSettingbyKey('HIDE_RETENTION_JOB')
      .subscribe((res) => {
        const value = res.result[0].programSettingsBoolValue;

        this.HIDERETENTION = value;
      });
  }

  loadCustomerQuotation(customerId?: number) {
    this.stockApi.loadDropdownCustomerQuotation(customerId).subscribe((res: any) => {
      if (res.isSuccess) {
        this.CustomerQuotationList = res.resultSet.customerQuotation.map((item: any) => ({
          label: item.customerQuotationVoucherNo,
          value: item.customerQuotationQid
        }));
        this.CustomerQuotationList.unshift({
          label: '--Select Customer Quotation--',
          value: null
        });
      }
    });
  }

  onCustomerChange(event: any) {
    const customerId = event.value === -1 ? undefined : event.value;
    this.loadCustomerQuotation(customerId);
  }

  private getGridSettings(
    customSettings: Partial<Handsontable.GridSettings> = {}
  ): Handsontable.GridSettings {
    return {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      width: '100%',
      height: 'auto',
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      enterMoves: { row: 0, col: 1 },
      // data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
      ...customSettings,
    };
  }

  @ViewChild('dt') dt: Table;
  onGlobalFilter(value: string) {
    this.dt.filterGlobal(value, 'contains');
  }

  initializeExpenseList() {
    this.Expense_entry = this.getGridSettings({
      data: [],
      height: 320,
      hiddenColumns: {
        columns: [7],
        indicators: false,
      },
      columns: [
        {
          data: 'accNo',
          type: 'text',
        },
        {
          data: 'accName',
          type: 'text',
        },
        {
          data: 'voucherNo',
          type: 'text',
        },
        {
          data: 'tranDate',
          type: 'text',
        },
        {
          data: 'voucherType',
          type: 'text',
        },
        {
          data: 'chqDate',
          type: 'text',
        },
        {
          data: 'chqNo',
          type: 'text',
        },
        {
          data: 'description',
          type: 'text',
        },
        {
          data: 'costName',
          type: 'text',
        },
        {
          data: 'drAmt',
          type: 'numeric',
        },
        {
          data: 'crAmt',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Acc No'),
        this.translate.instant('Acc Name'),
        this.translate.instant('Vch No'),
        this.translate.instant('Date'),
        this.translate.instant('Type'),
        this.translate.instant('Chq Date'),
        this.translate.instant('Chq No'),
        this.translate.instant('Description'),
        this.translate.instant('Cost Center Name'),
        this.translate.instant('DrAmt'),
        this.translate.instant('CrAmt'),
      ],
    });
  }

  initializePaymentAndReceiptList() {
    this.Receipt_entry = this.getGridSettings({
      data: [],
      columns: [
        {
          data: 'accountTransactionAccNo',
          type: 'text',
        },
        {
          data: 'accountTransactionAccName',
          type: 'text',
        },
        {
          data: 'accountTransactionPaymentVoucher',
          type: 'text',
        },
        {
          data: 'accountTransactionDateTime',
          type: 'text',
        },
        {
          data: 'accountTransactionPaymentType',
          type: 'text',
        },
        {
          data: 'accountsTransactionsChqDate',
          type: 'text',
        },
        {
          data: 'accountsTransactionsChqNo',
          type: 'text',
        },
        {
          data: 'accountTransactionDescription',
          type: 'text',
        },
        {
          data: 'accountTransactionCredit',
          type: 'numeric',
        },
        {
          data: 'accountTransactionDebit',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Acc. No'),
        this.translate.instant('Acc Name'),
        this.translate.instant('Vch No'),
        this.translate.instant('Date'),
        this.translate.instant('Type'),
        this.translate.instant('Chq Date'),
        this.translate.instant('Chq No'),
        this.translate.instant('Description'),
        this.translate.instant('DrAmt'),
        this.translate.instant('Cr. Amt'),
      ],
    });
    this.Payment_entry = this.getGridSettings({
      columns: [
        {
          data: 'accountTransactionAccNo',
          type: 'text',
        },
        {
          data: 'accountTransactionAccName',
          type: 'text',
        },
        {
          data: 'accountTransactionPaymentVoucher',
          type: 'text',
        },
        {
          data: 'accountTransactionDateTime',
          type: 'text',
        },
        {
          data: 'accountTransactionPaymentType',
          type: 'text',
        },
        {
          data: 'accountsTransactionsChqDate',
          type: 'text',
        },
        {
          data: 'accountsTransactionsChqNo',
          type: 'text',
        },
        {
          data: 'accountTransactionDescription',
          type: 'text',
        },
        {
          data: 'accountTransactionCredit',
          type: 'numeric',
        },
        {
          data: 'accountTransactionDebit',
          type: 'numeric',
        },
      ],

      colHeaders: [
        this.translate.instant('Acc No'),
        this.translate.instant('Acc Name'),
        this.translate.instant('Vch No'),
        this.translate.instant('Date'),
        this.translate.instant('Type'),
        this.translate.instant('Chq Date'),
        this.translate.instant('Chq No'),
        this.translate.instant('Description'),
        this.translate.instant('DrAmt'),
        this.translate.instant('CrAmt'),
      ],
    });

    this.SubJob = this.getGridSettings({
      data: [],

      columns: [
        {
          data: 'SubJobNo',
          type: 'text',
        },
        {
          data: 'SubJob',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('Sub Job No'),
        this.translate.instant('Sub Job'),
      ],
    });
  }

  initializedVariationList() {
    this.Variation_entry = this.getGridSettings({
      data: [],

      hiddenColumns: {
        columns: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        indicators: false,
      },
      columns: [
        {
          data: 'xitemId',
          type: 'text',
        },

        {
          data: 'xpartNo',
          type: 'text',
          width: 50,
        },

        {
          data: 'xitemname',
          type: 'numeric',

          width: 50,
        },

        {
          data: 'xunit',
          type: 'text',
          width: 50,
        },

        {
          data: 'xjobMasterJobDetailsQtyN',
          type: 'date',
          dateFormat: 'DD/MM/YYYY',
          correctFormat: true,
          defaultDate: '01/01/1900',
          width: 50,
        },
        {
          data: 'xjobMasterJobDetailsStatusDate',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'amt',
          type: 'numeric',

          width: 50,
        },

        {
          data: 'xjobMasterJobDetailsJdAmt',
          type: 'numeric',
          width: 50,
        },
        {
          data: 'xgrossAmt',
          type: 'date',
          dateFormat: 'DD/MM/YYYY',
          correctFormat: true,
          defaultDate: '01/01/1900',
          width: 70,
        },

        {
          data: 'xvatPer',
          type: 'numeric',
          width: 60,
        },
        {
          data: 'xvatAmt',
          type: 'numeric',
          width: 60,
        },

        {
          data: 'xjobMasterJobDetailsStatus',
          type: 'numeric',
          width: 60,
        },

        {
          data: 'xjobMasterJobDetailsDescription',
          type: 'text',
        },
        {
          data: 'xjobname',
          type: 'dropdown',
          source: (query, callback) => {
            callback(this.jobArry);
          },
        },
        {
          data: 'xcostcenter',
          type: 'dropdown',
          source: (query, callback) => {
            callback(this.costcenterArry);
          },
        },

        {
          data: 'xid',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Progress'),
        this.translate.instant('Type'),
        this.translate.instant('Amt'),
        this.translate.instant('Ref#'),
        this.translate.instant('Date'),
        this.translate.instant('Invcd Amt'),
        this.translate.instant('Invcd %'),
        this.translate.instant('Ref #.'),
        this.translate.instant('Date'),
      ],
    });
  }

  initializeAllList() {
    this.costcenter = this.getGridSettings({
      data: [],

      hiddenColumns: {
        columns: [5, 7, 9, 10],
        indicators: false,
      },
      // rowHeaders: true,

      columns: [
        {
          data: 'jobMasterControlCostCenerName',
          type: 'text',
          // width: 30,
          readOnly: true,
        },
        {
          data: 'jobMasterControlAmount',
          type: 'numeric',
          className: 'htRight',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 60,
          readOnly: true,
        },
        {
          data: 'prAmount',
          type: 'numeric',
          className: 'htRight',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 60,
          readOnly: true,
        },
        {
          data: 'jobMasterControlActual',
          type: 'numeric',
          className: 'htRight',
          numericFormat: {
            pattern: '0,0.00',
          },
          // readOnly: true,
          width: 60,
        },
        {
          data: 'jobMasterControlVariance',
          type: 'numeric',
          className: 'htRight',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 60,
          readOnly: true,
        },
        {
          data: 'jobMasterControlLevel1',
          type: 'numeric',
          className: 'htRight',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 60,
        },
        {
          data: 'jobMasterControlLevel2',
          type: 'numeric',
          className: 'htRight',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 60,
          readOnly: true,
        },
        {
          data: 'jobMasterControlLevel3',
          type: 'numeric',
          className: 'htRight',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 60,
        },
        {
          data: 'jobMasterBudgetDetailsEmail',
          type: 'checkbox',
          className: 'htCenter',
          width: 60,
          checkedTemplate: true,
          uncheckedTemplate: false,
        },
        {
          data: 'jobMasterControlDtlId',
          type: 'numeric',
          width: 30,
        },
        {
          data: 'jobMasterControlCostCenerID',
          type: 'text',
          // width: 30,
          readOnly: true,
        },
        {
          data: 'emailClose',
          type: 'checkbox',
          width: 30,
        },
      ],

      cells: (row, col, prop) => {
        const cellProperties = {} as Partial<Handsontable.CellProperties>;

        if (prop === 'jobMasterControlLevel2') {
          if (this.userLevel2Enabled && this.btnFlag?.edit === true) {
            cellProperties.readOnly = false;
          }
        }

        return cellProperties;
      },
      colHeaders: [
        this.translate.instant('Cost Center'),
        this.translate.instant('BOQ Amt'),
        this.translate.instant('PR Amt'),
        this.translate.instant('Budget'),
        this.translate.instant('Variance'),
        this.translate.instant('Level 1'),
        this.translate.instant('Notif Amt.'),

        this.translate.instant('Level 3'),
        this.translate.instant('Email'),
        this.translate.instant('id'),
        this.translate.instant('id'),
        this.translate.instant('Close'),
      ],
    });
    this.costcenter.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.costcenterhotiD);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);
        if (
          data[2] != null &&
          data[3] != null &&
          change[0][1] != 'jobMasterControlVariance'
        ) {
          const value = data[2] - data[3];
          this.hotRegisterer
            .getInstance(this.costcenterhotiD)
            .setDataAtCell(change[0][0], 4, value);
        }
      }

      this.Bud_ColumnSum();
    };

    this.Jobfiles = this.getGridSettings({
      data: [],

      hiddenColumns: {
        columns: [2, 3],
        indicators: false,
      },
      // rowHeaders: true,

      columns: [
        {
          data: 'job_filename',
          type: 'text',
          // width: 30,
        },
        {
          data: 'job_fileStatus',
          type: 'checkbox', // Change type to checkbox
          width: 30,
          checkedTemplate: true, // Value to show when checked
          uncheckedTemplate: false,
        },

        {
          data: 'id',
          type: 'numeric',
          width: 30,
        },
        {
          data: 'jobMasterJobId',
          type: 'numeric',
          width: 30,
        },
      ],
      colHeaders: [
        this.translate.instant('File Name'),
        this.translate.instant('Status'),
        this.translate.instant('jod_id'),
      ],
    });

    this.jobScope_entry = this.getGridSettings({
      data: [],

      hiddenColumns: {
        columns: [0, 1, 5, 6, 9, 10, 11, 12],
        indicators: false,
      },
      // rowHeaders: true,

      columns: [
        {
          data: 'jobMasterJobDetailsPlusMinus',
          type: 'text',
          width: 30,
        },

        {
          data: 'jobMasterJobDetailsCheckBox',
          type: 'checkbox',
          width: 30,
        },

        {
          data: 'jobMasterJobDetailsDescription',

          type: 'text',
          // source: (query, callback) => {
          //   callback(this.ProjectDescriptionMasterArry);
          // },
          allowInvalid: false,
          strict: false,
        },

        {
          data: 'jobMasterJobDetailsStatus',

          type: 'text',
          width: 50,
        },

        {
          data: 'jobMasterJobDetailsJdAmt',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'jobMasterJobDetailsInvoicedAmt',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'jobMasterJobDetailsInvoicedAmtPer',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'jobMasterJobDetailsRefNo',
          type: 'text',
          width: 50,
        },

        {
          data: 'jobMasterJobDetailsStatusDate',
          type: 'date',
          dateFormat: 'DD/MM/YYYY',
          correctFormat: true,
          // defaultDate: '01/01/1900',
          width: 70,
        },

        {
          data: 'jobMasterJobDetailsJobId',
          type: 'numeric',
          width: 60,
        },
        {
          data: 'jobMasterNo',
          type: 'text',
          width: 60,
        },

        {
          data: 'jobMasterJobDetailsJobDetId',
          type: 'numeric',
        },
        {
          data: 'jobMasterJobDetailsDescriptionId',
          type: 'numeric',
        },
        {
          data: 'emailClose',
          type: 'checkbox',
          width: 60,
        },
      ],
      colHeaders: [
        this.translate.instant('+/-'),
        this.translate.instant('☑'),
        this.translate.instant('Description'),
        this.translate.instant('Status'),
        this.translate.instant('Job Amt'),
        this.translate.instant('Invcd Amt'),
        this.translate.instant('Invcd %'),
        this.translate.instant('PO NO /Qoute No'),
        this.translate.instant('Date'),
        this.translate.instant('jobMasterJobDetailsJobId'),
        this.translate.instant('jobMasterNo'),
        this.translate.instant('jobMasterJobDetailsJobDetId'),
        this.translate.instant('jobMasterJobDetailsDescriptionId'),
        this.translate.instant('Close'),
      ],
    });

    this.jobScope_entry.afterSelection = (row, column) => {
      // setting if prevent scrolling after selection
      var x = this.JobScopehotRegisterer.getInstance(
        this.JobScopehotid
      ).getDataAtCell(row, column);

      if (column === 2) {
        this.lookupGridColumns = ['Name', 'ID'];
        this.dataList = this.ScopeSetLookup;
        const hot = this.hotRegisterer.getInstance(this.JobScopehotid);
        hot.deselectCell();
        this.showcostCenterLookUp = true;
        this.activeRow = { row, column };
      }
      if (column === 3) {
        this.lookupGridColumns = ['Name', 'ID'];
        this.dataList = this.JobScope_StatuSetLookup;
        const hot = this.hotRegisterer.getInstance(this.JobScopehotid);
        hot.deselectCell();
        this.showcostCenterLookUp = true;
        this.activeRow = { row, column };
      }
    };
    this.jobScope_entry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
      this.GetTotal();
    };

    this.jobScope_entry.afterRemoveRow = (index: number, amount: number) => {
      this.ColumnSum();
      this.GetTotal();
    };

    this.jobScope_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Job Scope-Invalid entry',
        });
      }
    };

    this.BankGuarantees_entry = this.getGridSettings({
      data: [],

      hiddenColumns: {
        columns: [0, 1, 7, 8, 9, 10],
        indicators: false,
      },
      columns: [
        {
          data: 'jobMasterJobWiseBankGuaranteesCheckBox',
          type: 'checkbox',
          width: 30,
          // validator: function (value, callback) {
          //   if (value.length > 500) {
          //       alert('Must be 500 character or less. Extra characters will be removed');
          //       this.instance.setDataAtCell(this.row, this.col, value.substring(0, 500), null);
          //   }
          //   callback(true);
        },

        {
          data: 'jobMasterJobWiseBankGuaranteesBgid',
          type: 'numeric',
          width: 30,
        },

        {
          data: 'jobMasterJobWiseBankGuaranteesDesc',
          type: 'text',

          // source: (query, callback) => {
          //   callback(this.BankGuaranteeMasterArry);
          // },
          allowInvalid: false,
          // strict: false
        },
        {
          data: 'job_Master_JobWiseBankGuarantees_Valid_From_Date',
          width: 120,
          type: 'date',
          dateFormat: 'DD/MM/YYYY',
          correctFormat: true,
          readOnly: false,
        },
        {
          data: 'job_Master_JobWiseBankGuarantees_Valid_To_Date',
          width: 120,
          type: 'date',
          dateFormat: 'DD/MM/YYYY',
          correctFormat: true,
          readOnly: false,
        },

        {
          data: 'jobMasterJobWiseBankGuaranteesAmount',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'job_Master_JobWiseBankGuarantees_Remarks',
          type: 'text',
          width: 50,
        },
        {
          data: 'jobMasterJobWiseBankGuaranteesDelStatus',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'jobMasterjobMasterJobWiseBankGuaranteesSlNo',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'jobMasterJobWiseBankGuaranteesJobId',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'jobMasterJobWiseBankGuaranteesDtlId',
          type: 'numeric',

          width: 50,
        },
        {
          data: 'emailClose',
          type: 'checkbox',

          width: 50,
        },
      ],
      colHeaders: [
        this.translate.instant('☑'),
        this.translate.instant('ID'),
        this.translate.instant('Guarantee Description'),

        this.translate.instant('From Date'),
        this.translate.instant('To Date'),
        this.translate.instant('Amount'),
        this.translate.instant('Remark'),
        this.translate.instant('-'),
        this.translate.instant('-'),
        this.translate.instant('-'),
        this.translate.instant('-'),
        this.translate.instant('Close'),
      ],
    });
    this.BankGuarantees_entry.afterSelection = (row, column) => {
      // setting if prevent scrolling after selection
      var x = this.BankGuaranteeshotRegisterer.getInstance(
        this.BankGuaranteeshotid
      ).getDataAtCell(row, column);

      if (column === 2) {
        this.lookupGridColumns = ['Name', 'ID'];
        this.dataList = this.bankGSetLookup;
        const hot = this.hotRegisterer.getInstance(this.BankGuaranteeshotid);
        hot.deselectCell();
        this.showcostCenterLookUp = true;
        this.activeRow = { row, column };
      }
    };

    this.Budjet_entry = this.getGridSettings({
      data: [],
      hiddenColumns: {
        columns: [0, 3, 4, 5, 6, 7, 10],
        indicators: false,
      },

      columns: [
        {
          data: 'jobMasterBudgetDetailsBudId',
          type: 'numeric',

          width: 50,
        },
        {
          data: 'jobMasterBudgetDetailsBudDesc',
          type: 'text',
        },

        {
          data: 'jobMasterBudgetDetailsBudAmount',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'jobMasterBudgetDetailsDelStatus',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'jobMasterBudgetDetailsJobId',
          type: 'numeric',
          width: 50,
        },

        {
          data: 'jobMasterNo',
          type: 'text',
          width: 60,
        },
        {
          data: 'jobMasterBudgetDetailsSno',
          type: 'numeric',
          width: 60,
        },
        {
          data: 'jobMasterBudgetDetailsDtlId',
          type: 'numeric',
          width: 60,
        },
        {
          data: 'jobMasterBudgetDetailsActual',
          type: 'numeric',
          width: 60,
          readOnly: true,
        },
        {
          data: 'jobMasterBudgetDetailsVariance',
          type: 'numeric',
          readOnly: true,
          width: 60,
        },
        {
          data: 'Id',
          type: 'numeric',
          width: 60,
        },
      ],
      colHeaders: [
        this.translate.instant('ID'),
        this.translate.instant('Budget'),
        this.translate.instant('Amount Received'),
        this.translate.instant('DelStatus'),
        this.translate.instant('JobId'),
        this.translate.instant('jobMasterNo'),
        this.translate.instant('Sno'),
        this.translate.instant('DtlId'),
        this.translate.instant('Amount Spent'),
        this.translate.instant('Variance'),
      ],
    });

    this.Budjet_entry.afterSelection = (row, column) => {
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.Budjethotid)
        .getDataAtCell(row, column);

      if (column === 1) {
        this.lookupGridColumns = ['Name', 'ID'];
        const hot = this.hotRegisterer.getInstance(this.Budjethotid);
        hot.deselectCell();
        this.dataList = this.CostCenterSetLookup;
        this.showcostCenterLookUp = true;
        this.activeRow = { row, column };
      }
    };

    this.Budjet_entry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.Budjethotid);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);
        if (
          data[2] != null &&
          data[8] != null &&
          change[0][1] != 'jobMasterBudgetDetailsVariance'
        ) {
          const value = data[2] - data[8];
          this.hotRegisterer
            .getInstance(this.Budjethotid)
            .setDataAtCell(change[0][0], 9, value);
        }
      }

      this.Bud_ColumnSum();
    };

    this.BankGuarantees_entry.beforeChangeRender = (change, source) => {
      this.Bank_ColumnSum();
    };
    this.Budjet_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Budjet-Invalid entry',
        });
      }
    };

    this.Budjet_entry.afterRemoveRow = (index: number, amount: number) => {
      this.Bud_ColumnSum();
    };

    this.BankGuarantees_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.Bank_ColumnSum();
    };

    this.BankGuarantees_entry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Bank Guarantees-Invalid entry',
        });
      }
    };
  }

  executioninitializeControls() {
    this.Equipment = this.getGridSettings({
      data: [],
      height: 300,
      hiddenColumns: {
        columns: [0, 1, 2],
        indicators: false,
      },
      columns: [
        {
          data: 'id',
          type: 'numeric',
        },
        {
          data: 'jobMasterJobId',
          type: 'numeric',
        },
        {
          data: 'jobMasterEquipId',
          type: 'numeric',
        },
        {
          data: 'jobMasterEquipName',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('code'),
        this.translate.instant('JobId'),
        this.translate.instant('EqId'),
        this.translate.instant('Equipment'),
        // this.translate.instant('Is Checked'),
      ],

      afterRemoveRow: (index: number, amount: number) => {
        // Handle row removal logic
      },

      beforeChange: (change: Handsontable.CellChange[]) => {
        // Handle before change logic
      },

      afterSelection: (row, column) => {
        // setting if prevent scrolling after selection
        var x = this.hotRegisterer
          .getInstance(this.Equipmenthotid)
          .getDataAtCell(row, column);

        if (column === 3) {
          this.lookupGridColumns = ['Name', 'ID'];
          this.dataList = this.equipmentSetLookup;
          this.showcostCenterLookUp = true;
          this.activeRow = { row, column };
        }
      },
    });

    this.Detail = this.getGridSettings({
      data: [],

      hiddenColumns: {
        columns: [0, 1],
        indicators: false,
      },
      columns: [
        {
          data: 'id',
          type: 'numeric',
        },
        {
          data: 'jobMasterJobId',
          type: 'numeric',
        },
        {
          data: 'jobMasterExecDate',
          // type: 'date', // Use text type to display formatted date
          width: 120,
          // renderer: this.dateRenderer.bind(this),
          type: 'date',
          dateFormat: 'DD/MM/YYYY',
          correctFormat: true,
          readOnly: false,
        },
        {
          data: 'jobMasterExecDescription',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('code'),
        this.translate.instant('JobId'),
        this.translate.instant('Date'),
        this.translate.instant('Description'),
      ],

      afterRemoveRow: (index: number, amount: number) => { },
      beforeChange: (change: Handsontable.CellChange[]) => { },
    });
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

  timesheetinitializeControls() {
    this.DetailDT = this.getGridSettings({
      data: [],

      hiddenColumns: {
        columns: [0, 1, 2, 6],
        indicators: false,
      },
      columns: [
        {
          data: 'id',
          type: 'numeric',
        },
        {
          data: 'timeSheetId',
          type: 'numeric',
        },
        {
          data: 'jobId',
          type: 'numeric',
        },
        {
          data: 'timeIn', // Use text type to display formatted date
          type: 'text', // Use text type to display formatted date
          width: 120,
          renderer: this.dateRenderer.bind(this),
          readOnly: true,
        },
        {
          data: 'timeOut',
          type: 'text', // Use text type to display formatted date
          width: 120,
          renderer: this.dateRenderer.bind(this),
          readOnly: true,
        },
        // {
        //   data: 'timeIn', // Use text type to display formatted date
        //   type: 'date',
        //   dateFormat: 'DD/MM/YYYY',
        //   correctFormat: true,
        //   // defaultDate: '01/01/1900',
        //   width: 70,

        // },
        // {
        //   type: 'date',
        //   dateFormat: 'DD/MM/YYYY',
        //   correctFormat: true,
        //   // defaultDate: '01/01/1900',
        //   width: 70,
        // },
        {
          data: 'description',
          type: 'text',
        },
        {
          data: 'remarks',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('id'),
        this.translate.instant('timesheetid'),
        this.translate.instant('JobId'),
        this.translate.instant('From'),
        this.translate.instant('To'),
        this.translate.instant('Description'),
      ],

      afterRemoveRow: (index: number, amount: number) => { },
      beforeChange: (change: Handsontable.CellChange[]) => { },
    });
    this.EquipmentDT = {
      ...this.commonGridSettings,
      enterMoves: { row: 0, col: 1 },
      data: [],

      hiddenColumns: {
        columns: [0, 1, 2],
        indicators: false,
      },
      columns: [
        {
          data: 'id',
          type: 'numeric',
        },
        {
          data: 'jobId',
          type: 'numeric',
        },
        {
          data: 'equipmentId',
          type: 'numeric',
        },
        {
          data: 'equipmentDesc',
          type: 'text',
        },
      ],
      colHeaders: [
        this.translate.instant('code'),
        this.translate.instant('JobId'),
        this.translate.instant('EqId'),
        this.translate.instant('Equipment'),
      ],

      afterRemoveRow: (index: number, amount: number) => { },
      beforeChange: (change: Handsontable.CellChange[]) => { },
    };
  }

  selectStaffEX(i) {
    this.displaystaffList = true;
    this.Isstaff = true;
    this.staffindex = i;
  }
  selectStaffts(i) {
    this.displaystaffList = true;
    this.Isstaff = false;
    this.staffindex = i;
  }

  selectStaff(staff: any) {
    if (this.Isstaff) {
      if (this.staffEX?.find((i) => i.jobMasterStaffId == staff.staffId)) {
        this.messageService.add({
          severity: 'info',
          summary: 'Alert',
          detail: 'Staff Already Exist',
        });
        //  if (this.staffindex == index) {
        //   i.jobMasterStaffId = null, i.jobMasterStaffName = null, i.id = null, i.jobMasterJobId = 0

        //  }

        return;
      } else {
        this.staffEX.map((i, index) => {
          if (this.staffindex == index) {
            (i.jobMasterStaffId = staff.staffId),
              (i.jobMasterStaffName = staff.firstName + staff.lastName);
            this.pushEmptyDatastaffEXs();
          }
        });
      }
    } else {
      if (this.staffTS?.find((i) => i.staffId == staff.staffId)) {
        this.messageService.add({
          severity: 'info',
          summary: 'Alert',
          detail: 'Staff Already Exist',
        });
        return;
      } else {
        this.staffTS.map((i, index) => {
          if (this.staffindex == index) {
            (i.staffId = staff.staffId),
              (i.jobMasterStaffName = staff.firstName + staff.lastName);
            this.pushEmptyDatastaffTS();
          }
        });
      }
    }
    this.displaystaffList = false;
  }

  pushEmptyDataInDetails(isSave?: boolean) {
    this.DetailDatasetDT?.push({
      id: null,
      timeSheetId: null,
      jobId: 0,
      timeOut: null,
      timeIn: null,
      description: '',
      remarks: '',
    });
  }
  pushEmptyDatastaffEXs(isSave?: boolean) {
    this.staffEX?.push({
      jobMasterStaffId: null,
      jobMasterStaffName: null,
      id: null,
      jobMasterJobId: 0,
    });
  }

  pushEmptyDatastaffTS(isSave?: boolean) {
    this.staffTS?.push({
      id: null,
      jobId: 0,
      staffId: null,
      jobMasterStaffName: null,
      remarks: '',
    });
  }

  handleChange(e) {
    this.commonGridSettings = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      width: '100%',
      height: 120,
      rowHeights: 23,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      minSpareRows: 1,
      allowInsertRow: true,
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    if (e.index == 0) {
      setTimeout(() => {
        this.initializeAllList();
      }, 100);
    } else if (e.index == 1) {
      setTimeout(() => {
        this.initializedVariationList();
      }, 100);
    } else if (e.index == 2) {
      setTimeout(() => {
        this.initializePaymentAndReceiptList();
      }, 100);
    } else if (e.index == 3) {
      setTimeout(() => {
        this.initializeExpenseList();
      }, 100);
    } else if (e.index == 4) {
      setTimeout(() => {
        //this.GETuploadEDPdf(this.jobMasterFormGroup.value.jobMasterId)
        this.fetchDocumentTree(this.jobMasterFormGroup.value.jobMasterId);
      }, 100);
    } else if (e.index == 5) {
      setTimeout(() => {
        this.executioninitializeControls();
        this.LoadDefaultEquipments();
      }, 100);
    } else if (e.index == 6) {
      setTimeout(() => {
        this.isdSheet = true;
        this.timesheetinitializeControls();
      }, 100);
    }

    this.index = e.index;
  }

  get f() {
    return this.jobMasterFormGroup.controls;
  }

  rptFilter: ReportFilterModel;
  showPrint() {
    this.rptFilter = {
      ReportName: 'ProjectCompletionReport',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vJobCompletion where vJobCompletion.job_id='${this.jobMasterFormGroup.getRawValue().jobMasterId
        }'`,
      ],
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

  printCReport(type) {
    this.rptFilter = {
      ReportName: 'JobReport',
      SelectionFormula: `{vw_JobMaster.Job_Master_Job_ID}=${this.jobMasterFormGroup.getRawValue().jobMasterId
        }`,
      Parameters: [],
      Queries: [],
      SP_Queries: [
        {
          SP_Name: 'SP_InsertTmpCostingPrint',
          Parameters: [
            {
              Key: '@JobNo',
              Value: this.jobMasterFormGroup.getRawValue().jobMasterId,
            },
          ],
        },
        {
          SP_Name: 'SP_InsertCCDetails',
          Parameters: [
            {
              Key: '@JobCode',
              Value: this.jobMasterFormGroup.getRawValue().jobMasterId,
            },
          ],
        },
      ],
      ExportType:
        type === 'pdf'
          ? ExportFormatType.PortableDocFormat
          : ExportFormatType.ExcelWorkbook,
    };
    this.crystalReportService
      .getReportPrint(this.rptFilter, false)
      .subscribe((response) => {
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
  DepartmentMasterArray: any[] = [];
  DepartmentMasterArry: string[] = [];
  DepartmentMasterList: SelectItem[];

  LoadDepartmentDD() {
    this.accountapi.LoadDepartmentDropdown().subscribe((m) => {
      this.DepartmentMasterArray = m.resultSet.departmentsList;
      this.DepartmentMasterList = m.resultSet.departmentsList?.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentId,
      }));
      this.DepartmentMasterList.unshift({
        label: '--Select Department--',
        value: -1,
      });
    });
  }
  LoadDefaultEquipments() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.equipmentDatasetDetails =
        k.result?.map((item) => {
          return {
            jobMasterEquipId: item?.itemMasterItemId,
            jobMasterEquipName: item?.itemMasterItemName,
          };
        }) || [];
    });
  }

  get equipmentSetLookup() {
    return this.equipmentDatasetDetails.map((kl) => ({
      labelequip: kl.jobMasterEquipName,
      valueequip: kl.jobMasterEquipId,
    }));
  }

  getAllStaff() {
    this.staffmasterService.getAllStaff().subscribe((res: any) => {
      this.staffArray = res;
      // this.staffEX = res;
      // this.staffTS = res;
    });
  }

  callDDLs: boolean = false;
  getAllList(from: any) {
    if (!this.callDDLs) {
      this.masterapi.GetJobDropdown().subscribe((m) => {
        //account
        this.accountArray = m.resultSet.masterAccountsTables;
        this.accountList = m.resultSet.masterAccountsTables?.map((kl) => ({
          label: kl.maAccName,
          value: kl.maAccNo,
        }));
        this.accountList.unshift({ label: '--Select Account--', value: -1 });
        this.acctArry = m.resultSet.masterAccountsTables?.map(
          (ar) => ar.maAccName.trim() + '|' + ar.maAccNo
        );

        //project description
        this.ProjectDescriptionMasterArray =
          m.resultSet.projectDescriptionMaster;
        this.ProjectDescriptionMasterList =
          m.resultSet.projectDescriptionMaster?.map((kl) => ({
            label: kl.projectDescriptionMasterProjectDescriptionName,
            value: kl.projectDescriptionMasterProjectDescriptionId,
          }));
        this.ProjectDescriptionMasterList.unshift({
          label: '--Select Project Description--',
          value: -1,
        });
        this.ProjectDescriptionMasterArry =
          m.resultSet.projectDescriptionMaster?.map(
            (ar) =>
              ar.projectDescriptionMasterProjectDescriptionName.trim() +
              '|' +
              ar.projectDescriptionMasterProjectDescriptionId
          );
        // Bank Guarantee
        this.BankGuaranteeMasterArray = m.resultSet.bankGuaranteeMasters;
        this.BankGuaranteeMasterList = m.resultSet.bankGuaranteeMasters?.map(
          (kl) => ({
            label: kl.bankGuaranteeMasterBgname,
            value: kl.bankGuaranteeMasterBgid,
          })
        );
        this.BankGuaranteeMasterList.unshift({
          label: '--Select Project Description--',
          value: -1,
        });
        this.BankGuaranteeMasterArry = m.resultSet.bankGuaranteeMasters?.map(
          (ar) =>
            ar.bankGuaranteeMasterBgname.trim() +
            '|' +
            ar.bankGuaranteeMasterBgid
        );
        //customer
        this.CustomerMasterArray = m.resultSet.customerMasters;
        this.CustomerMasterList = m.resultSet.customerMasters?.map((kl) => ({
          label: kl.customerMasterCustomerName,
          value: kl.customerMasterCustomerNo,
        }));
        this.CustomerMasterList.unshift({
          label: '--Select Customer --',
          value: -1,
        });
        this.CustomerMasterArry = m.resultSet.customerMasters?.map(
          (ar) =>
            ar.customerMasterCustomerName.trim() +
            '|' +
            ar.customerMasterCustomerNo
        );
        //currency
        this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
          label: kl.currencyMasterCurrencyName,
          value: kl.currencyMasterCurrencyId,
        }));
        this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
        this.currArry = m.resultSet.currencyMasters?.map((ar) =>
          ar.currencyMasterCurrencyName.trim()
        );
        this.currencys = m.resultSet.currencyMasters;
        //sale man
        this.SalesManMasterArray = m.resultSet.saleManList;
        this.SalesManMasterList = m.resultSet.saleManList?.map((kl) => ({
          label: kl.salesManMasterSalesManName,
          value: kl.salesManMasterSalesManId,
        }));
        this.SalesManMasterList.unshift({
          label: '--Select SalesMan--',
          value: -1,
        });
        this.SalesManMasterArry = m.resultSet.saleManList?.map(
          (ar) =>
            ar.salesManMasterSalesManName.trim() +
            '|' +
            ar.salesManMasterSalesManId
        );

        this.costcenterArray = m.resultSet.costCenterMaster;
        this.costcenterList = m.resultSet.costCenterMaster.map((kl) => ({
          label: kl.costCenterMasterCostCenterName,
          value: kl.costCenterMasterCostCenterId,
        }));
        this.costcenterArry = m.resultSet.costCenterMaster.map(
          (ar) =>
            ar.costCenterMasterCostCenterName.trim() +
            '|' +
            ar.costCenterMasterCostCenterId
        );

        //
        this.jobList = m.resultSet.jobmaster?.map((kl) => ({
          label: kl.jobMasterJobName,
          value: kl.jobMasterJobId,
        }));
        this.jobList.unshift({ label: '--Select Job--', value: -1 });
        if (from === 'new') {
          this.populateCostCenterGrid(this.costcenterList);
          this.setbudgetcoulumn(this.costcenterList);
        }

        this.callDDLs = true;
      });
    } else {
      if (from === 'new') {
        this.populateCostCenterGrid(this.costcenterList);
        this.setbudgetcoulumn(this.costcenterList);
      }
    }
  }

  ColumnSum() {
    if (this.jobScope_entry.data.length > 0) {
      var value = 0;
      this.jobScope_entry.data.forEach((elemt: any) => {
        if (elemt && elemt.jobMasterJobDetailsJdAmt > 0) {
          value += elemt.jobMasterJobDetailsJdAmt;
        }
      });
      value = parseFloat(value.toFixed(2));
      this.jobMasterFormGroup.controls.jobMasterGridTotScope.setValue(value);
    }
  }

  onNodeSelect(event: any): void {
    const fileUrl = event.node.data;
    if (fileUrl && event.node.key !== 0 && event.node.key !== '0') {
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        fileUrl + '#navpanes=0&scrollbar=0'
      );
    }
  }

  fetchDocumentTree(jobId: any): void {
    this.previewUrl = '';
    this.masterapi.GetDocumentTree(jobId, 'JobMaster').subscribe((res) => {
      if (res?.valid && res?.result) {
        this.files = [];
        const ports = environment.apiRootURL?.replace('api', 'pdfs');
        const documentNodes: TreeNode[] = res?.result?.map(
          (doc: any, index: number) => {
            return {
              key: `0-${doc.fileId}`,
              label: doc.fileName,
              data: `${ports}${doc.filePath}`,
              icon: 'pi pi-file-pdf',
            };
          }
        );

        this.files = [
          {
            key: '0',
            label: 'Documents',
            data: 'Documents Folder',
            icon: 'pi pi-fw pi-folder',
            children: documentNodes,
          },
        ];
      }
    });
  }

  isChildNode(node: TreeNode): boolean {
    return this.files.some((parent) =>
      parent.children?.some((child) => child === node)
    );
  }

  onDeleteNode(node: TreeNode) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete existing Document?',
      accept: () => {
        const id: number = Number(node.key?.split('-')[1]);
        this.api.DeleteDocument(id).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Deleted Succesfully',
            });
            this.fetchDocumentTree(this.jobMasterFormGroup.value.jobMasterId);
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: ' Failed',
            });
          }
        );
      },
    });
  }

  Bud_ColumnSum() {
    if (this.Budjet_entry.data.length > 0) {
      var value = 0;
      this.Budjet_entry.data.forEach((elemt: any) => {
        if (elemt && elemt.jobMasterBudgetDetailsBudAmount != null) {
          value += Number(elemt.jobMasterBudgetDetailsBudAmount);
        }
      });
      value = parseFloat(value.toFixed(2));
      this.jobMasterFormGroup.controls.jobMasterGridTotBudject.setValue(value);
    }
  }

  Bank_ColumnSum() {
    var sum: any = 0;
    this.BankGuarantees_entry.data.forEach((e: any) => {
      if (e.jobMasterJobWiseBankGuaranteesAmount) {
        sum += e.jobMasterJobWiseBankGuaranteesAmount;
      }
    });
    // const sum1 = this.BankGuarantees_entry.data?.filter(item => item.hasOwnProperty('jobMasterJobWiseBankGuaranteesAmount'))
    //   .reduce((sum, current: any) => sum + current.jobMasterJobWiseBankGuaranteesAmount, [0]);
    this.jobMasterFormGroup.controls.jobMasterGridTotBank.setValue(sum);
  }

  CalcAdvanceAmuntTotal(type: any) {
    if (
      this.jobMasterFormGroup.value.jobMasterJobValue == 0 ||
      this.jobMasterFormGroup.value.jobMasterJobValue == 0
    ) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Insert Value.',
      });
      return;
    }
    if (type == 'per') {
      this.jobMasterFormGroup.controls.jobMasterJobAdvanceAmount.setValue(
        (
          (Number(this.jobMasterFormGroup.value.jobMasterJobValue) *
            Number(this.jobMasterFormGroup.value.jobMasterAdvPerc)) /
          100
        ).toFixed(2)
      );
    } else {
      this.jobMasterFormGroup.controls.jobMasterAdvPerc.setValue(
        (
          (Number(this.jobMasterFormGroup.value.jobMasterJobAdvanceAmount) /
            Number(this.jobMasterFormGroup.value.jobMasterJobValue)) *
          100
        ).toFixed(2)
      );
    }

    this.GetTotal();
  }

  totalValue() {
    let value =
      this.jobMasterFormGroup.value.jobMasterCurVal *
      this.jobMasterFormGroup.value.jobMasterJobValue;
    this.jobMasterFormGroup.controls.jobMasterTotVariation.setValue(value ?? 0);
  }

  CalcRetention(type) {
    if (this.jobMasterFormGroup.value.jobMasterJobValue == 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Variation Amount.',
      });
      return;
    }

    if (type == 'per') {
      this.jobMasterFormGroup.controls.jobMasterRetention.setValue(
        (
          (Number(this.jobMasterFormGroup.value.jobMasterJobValue) *
            Number(this.jobMasterFormGroup.value.jobMasterRetensionPer)) /
          100
        ).toFixed(2)
      );
    } else {
      this.jobMasterFormGroup.controls.jobMasterRetensionPer.setValue(
        (
          (Number(this.jobMasterFormGroup.value.jobMasterRetention) /
            Number(this.jobMasterFormGroup.value.jobMasterJobValue)) *
          100
        ).toFixed(2)
      );
    }

    // this.GetTotal()
  }

  CalcjobMasterTotVariation(type) {
    if (this.jobMasterFormGroup.value.jobMasterVariationAmount == 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Variation Amount.',
      });
      return;
    }

    this.jobMasterFormGroup.controls.jobMasterTotRecValue.setValue(
      Number(this.jobMasterFormGroup.value.jobMasterAdvAmountOnVar) +
      Number(this.jobMasterFormGroup.value.jobMasterAdvPercOnVar)
    );
    if (type == 'per') {
      this.jobMasterFormGroup.controls.jobMasterAdvAmountOnVar.setValue(
        (
          (Number(this.jobMasterFormGroup.value.jobMasterVariationAmount) *
            Number(this.jobMasterFormGroup.value.jobMasterAdvPercOnVar)) /
          100
        ).toFixed(2)
      );
    } else {
      this.jobMasterFormGroup.controls.jobMasterAdvPercOnVar.setValue(
        (
          (Number(this.jobMasterFormGroup.value.jobMasterAdvAmountOnVar) /
            Number(this.jobMasterFormGroup.value.jobMasterVariationAmount)) *
          100
        ).toFixed(2)
      );
    }

    this.GetTotal();
  }
  CalcDiscFromPer() {
    this.jobMasterFormGroup.controls.jobMasterTotRecValue.setValue(
      (Number(this.jobMasterFormGroup.value.jobMasterRelativeNo) *
        Number(this.jobMasterFormGroup.value.jobMasterRetensionPer)) /
      100
    );
    this.GetTotal();
  }

  CalcDiscFromAmt() {
    this.jobMasterFormGroup.controls.jobMasterRetensionPer.setValue(
      (Number(this.jobMasterFormGroup.value.jobMasterTotRecValue) * 100) /
      Number(this.jobMasterFormGroup.value.jobMasterRelativeNo)
    );
    this.GetTotal();
  }
  GetTotal($event = null) {
    const sum =
      Number(this.jobMasterFormGroup.value.jobMasterAdvAmountOnVar) +
      Number(this.jobMasterFormGroup.value.jobMasterJobAdvanceAmount);

    this.jobMasterFormGroup.controls.jobMasterAdvAmountTotal.setValue(
      sum.toFixed(2)
    );
    // if (this.jobMasterFormGroup.value.jobMasterStatusVal == true) {
    //   this.jobMasterFormGroup.value.jobMasterJobAdvanceAmount = 0;
    // }
    // else {

    //   this.jobMasterFormGroup.value.jobMasterJobAdvanceAmount = 5;
    // }
    // this.jobMasterFormGroup.controls.jobMasterJobValue.setValue(
    //   Number(this.jobMasterFormGroup.value.jobMasterRelativeNo)
    //   -
    //   Number(this.jobMasterFormGroup.value.jobMasterTotRecValue)
    // );

    // this.jobMasterFormGroup.controls.jobMasterTotExpValue.setValue(
    //   (
    //     Number(this.jobMasterFormGroup.value.jobMasterJobValue)
    //     *
    //     Number(this.jobMasterFormGroup.value.jobMasterJobAdvanceAmount)
    //   ) / 100);

    // console.log(this.jobMasterFormGroup.value.jobMasterJobType);

    // if (this.jobMasterFormGroup.value.jobMasterJobType == '+') {
    //   this.jobMasterFormGroup.controls.jobMasterBudMatCost.setValue(
    //     (
    //       Number(this.jobMasterFormGroup.value.jobMasterJobValue)
    //       +
    //       Number(this.jobMasterFormGroup.value.jobMasterTotExpValue)
    //     )

    //     + Number(this.jobMasterFormGroup.value.jobMasterBudLabourCost)
    //   );
    // }

    // else if (this.jobMasterFormGroup.value.jobMasterJobType == '-') {
    //   this.jobMasterFormGroup.controls.jobMasterBudMatCost.setValue(
    //     (
    //       Number(this.jobMasterFormGroup.value.jobMasterJobValue)
    //       +
    //       Number(this.jobMasterFormGroup.value.jobMasterTotExpValue)
    //     )

    //     - Number(this.jobMasterFormGroup.value.jobMasterBudLabourCost)
    //   );
    // }
    // else {
    //   this.jobMasterFormGroup.value.jobMasterJobType = '-';
    // }
  }

  getdata(table, hotid) {
    const hotInstance = this.StaffhotRegisterer.getInstance(hotid);
    const datas = hotInstance.getData();

    const columns = table.columns;

    const columnArray = Array.isArray(columns)
      ? columns
      : Object.keys(columns).map((key) => columns[key]);

    return datas?.map((row) => {
      const obj = {};
      columnArray.forEach((column, index) => {
        obj[column.data] = row[index];
      });
      return obj;
    });
  }

  saveJobMaster() {
    const datad: any = this.getdata(this.Detail, this.Detailhotid);
    const datae: any = this.getdata(this.Equipment, this.Equipmenthotid);
    const dataeTS: any = this.getdata(this.EquipmentDT, this.EquipmenthotidDT);
    const jobExeDetail: any = datad?.filter(
      (k) => k.jobMasterExecDescription != null
    );
    const jobEquipment: any = datae?.filter(
      (k) => k.jobMasterEquipName != null
    );
    const jobEquipmentDT: any = dataeTS?.filter((k) => k.equipmentDesc != null);

    const ScopesavedData: any = this.jobScope_entry?.data?.filter((k) =>
      k.hasOwnProperty('jobMasterJobDetailsDescription')
    );
    const jobfilesavedData: any = this.JobfilesDataset?.filter((k) =>
      k.hasOwnProperty('job_filename')
    );

    const constCenteravedData: any = this.costcenter?.data?.filter((k) =>
      k.hasOwnProperty('jobMasterControlCostCenerID')
    );

    const BudjetsavedData: any = this.Budjet_entry?.data?.filter((k) =>
      k.hasOwnProperty('jobMasterBudgetDetailsBudDesc')
    );
    const BankGuaranteessavedData: any =
      this.BankGuarantees_entry?.data?.filter((k) =>
        k.hasOwnProperty('jobMasterJobWiseBankGuaranteesBgid')
      );
    const jobMaster_Save: JobMaster = this.jobMasterFormGroup
      .value as JobMaster;

    let req = {
      id: 0,
      timesheetId:
        this.jobMasterFormGroup.value.timesheetId == null
          ? ''
          : this.jobMasterFormGroup.value.timesheetId,
      jobId: this.jobMasterFormGroup.value.jobId
        ? this.jobMasterFormGroup.value.jobId
        : 0,
      timesheetDate: new Date(
        this.jobMasterFormGroup.value.timesheetDate
      ).toISOString(), // Convert Date to string
      remarks: this.jobMasterFormGroup.value.remarks,
      clientRemarks: this.jobMasterFormGroup.value.clientRemarks,
      vesselName: '',
    };

    if (this.isdSheet) {
      jobMaster_Save.jobTimesheetMaster = [];
      jobMaster_Save.jobTimesheetMaster.push(req);
    }
    jobMaster_Save.jobMasterJobId = Number(
      this.jobMasterFormGroup.value.jobMasterId
    );

    jobMaster_Save.jobMasterJobNo =
      this.jobMasterFormGroup.getRawValue().jobMasterNo;
    jobMaster_Save.jobMasterJobDate =
      this.jobMasterFormGroup.value.jobMasterJobDate;
    jobMaster_Save.jobMasterJobCurVal = Number(
      this.jobMasterFormGroup.value.jobMasterCurVal
    );
    jobMaster_Save.jobMasterJobCurrencyId =
      this.jobMasterFormGroup.value.jobMasterCurrency;
    jobMaster_Save.jobMasterJobStatusVal =
      this.jobMasterFormGroup.value.jobMasterStatusVal;

    jobMaster_Save.jobMasterJobConsultant =
      this.jobMasterFormGroup.value.jobMasterConsultant;

    jobMaster_Save.jobMasterJobCustomerId =
      this.jobMasterFormGroup.value.jobMasterCustomerId;
    jobMaster_Save.jobMasterJobCode =
      this.jobMasterFormGroup.value.jobMasterJobCode;

    jobMaster_Save.jobMasterJobConsultantReff =
      this.jobMasterFormGroup.value.jobMasterJobConfReff;
    jobMaster_Save.jobMasterJobName =
      this.jobMasterFormGroup.value.jobMasterJobName;
    jobMaster_Save.jobMasterJobRemarks =
      this.jobMasterFormGroup.value.jobMasterRemarks;

    jobMaster_Save.jobMasterJobBudgetOverHeadCost = Number(
      this.jobMasterFormGroup.value.jobMasterBudOverHeadCost
    );
    jobMaster_Save.jobMasterJobLabourCostVar = Number(
      this.jobMasterFormGroup.value.jobMasterLabourCostVar
    );
    jobMaster_Save.jobMasterJobBalance = Number(
      this.jobMasterFormGroup.value.jobMasterBalance
    );
    jobMaster_Save.jobMasterJobStatus =
      this.jobMasterFormGroup.value.jobMasterStatus;
    jobMaster_Save.jobMasterJobOpenInv = Number(
      this.jobMasterFormGroup.value.jobMasterOpenInv
    );
    jobMaster_Save.jobMasterJobPerInv = Number(
      this.jobMasterFormGroup.value.jobMasterPerInv
    );

    jobMaster_Save.jobMasterJobMaterialCostVar = Number(
      this.jobMasterFormGroup.value.jobMasterMatCostVar
    );
    jobMaster_Save.jobMasterJobTotalInvValue = Number(
      this.jobMasterFormGroup.value.jobMasterTotInvValue
    );
    jobMaster_Save.jobMasterJobMaterialCost = Number(
      this.jobMasterFormGroup.value.jobMasterMatCost
    );
    jobMaster_Save.jobMasterJobLabourCost = Number(
      this.jobMasterFormGroup.value.jobMasterLabourCost
    );
    jobMaster_Save.jobMasterJobAdvPerc = Number(
      this.jobMasterFormGroup.value.jobMasterAdvPerc
    );

    jobMaster_Save.jobMasterJobRelativeNo = Number(
      this.jobMasterFormGroup.value.jobMasterRelativeNo
    );
    jobMaster_Save.jobMasterJobAdvAmountTotal = Number(
      this.jobMasterFormGroup.value.jobMasterAdvAmountTotal
    );
    jobMaster_Save.jobMasterJobRetentionPercentage = Number(
      this.jobMasterFormGroup.value.jobMasterRetensionPer
    );
    jobMaster_Save.jobMasterJobTotalRecValue = Number(
      this.jobMasterFormGroup.value.jobMasterTotRecValue
    );
    jobMaster_Save.jobMasterJobRetention = Number(
      this.jobMasterFormGroup.value.jobMasterRetention
    );

    jobMaster_Save.jobMasterJobAdvanceAmount = Number(
      this.jobMasterFormGroup.value.jobMasterJobAdvanceAmount
    );
    jobMaster_Save.jobMasterJobTotalExpValue = Number(
      this.jobMasterFormGroup.value.jobMasterTotExpValue
    );
    jobMaster_Save.jobMasterJobValue = Number(
      this.jobMasterFormGroup.value.jobMasterJobValue
    );
    jobMaster_Save.jobMasterJobType =
      this.jobMasterFormGroup.value.jobMasterJobType;
    //jobMaster_Save.jobMasterJobType = '-';
    jobMaster_Save.jobMasterJobLabourCost = Number(
      this.jobMasterFormGroup.value.jobMasterBudLabourCost
    );
    jobMaster_Save.jobMasterJobBudgetMaterialCost = Number(
      this.jobMasterFormGroup.value.jobMasterBudMatCost
    );

    jobMaster_Save.jobMasterJobSupplierId =
      this.jobMasterFormGroup.value.jobMasterSupplierId;
    jobMaster_Save.jobMasterJobSalesManId =
      this.jobMasterFormGroup.value.jobMasterSalesManId;
    jobMaster_Save.jobMasterJobNumber =
      this.jobMasterFormGroup.value.jobMasterJobNumber;
    jobMaster_Save.jobMasterJobOverHeadCost = Number(
      this.jobMasterFormGroup.value.jobMasterOverHeadCost
    );
    jobMaster_Save.jobMasterJobOverHeadCostVar = Number(
      this.jobMasterFormGroup.value.jobMasterOverHeadCostVar
    );
    jobMaster_Save.jobMasterJobMiscCost = Number(
      this.jobMasterFormGroup.value.jobMasterMiscCost
    );
    jobMaster_Save.jobMasterJobTotalCost = Number(
      this.jobMasterFormGroup.value.jobMasterTotCost
    );
    jobMaster_Save.jobMasterJobProfit = Number(
      this.jobMasterFormGroup.value.jobMasterProfit
    );
    jobMaster_Save.jobMasterJobTotalPayValue = Number(
      this.jobMasterFormGroup.value.jobMasterTotPayValue
    );
    jobMaster_Save.jobMasterJobIsSubJob =
      this.jobMasterFormGroup.value.jobMasterIsSubJob;
    jobMaster_Save.jobMasterJobNoCostCenter =
      this.jobMasterFormGroup.value.jobMasterNoCostCenter;
    jobMaster_Save.jobMasterJobPendingPo =
      this.jobMasterFormGroup.value.jobMasterPendingPo;
    jobMaster_Save.jobMasterJobHrjobId =
      this.jobMasterFormGroup.value.jobMasterHrjobId;
    jobMaster_Save.jobMasterJobContractorName =
      this.jobMasterFormGroup.value.jobMasterContractorName;
    jobMaster_Save.jobMasterJobContractType =
      this.jobMasterFormGroup.value.jobMasterContractType;
    jobMaster_Save.jobMasterJobCommenceDate =
      this.jobMasterFormGroup.value.jobMasterCommenceDate;
    jobMaster_Save.jobMasterJobWorkingDays = Number(
      this.jobMasterFormGroup.value.jobMasterWorkDays
    );
    jobMaster_Save.jobMasterJobOrgCompleteDate =
      this.jobMasterFormGroup.value.jobMasterOrgCompDate;
    jobMaster_Save.jobMasterJobPayTermDays = Number(
      this.jobMasterFormGroup.value.jobMasterPayTermDays
    );
    jobMaster_Save.jobMasterJobVariationAmount = Number(
      this.jobMasterFormGroup.value.jobMasterVariationAmount
    );
    jobMaster_Save.jobMasterJobAdvPercOnVar = Number(
      this.jobMasterFormGroup.value.jobMasterAdvPercOnVar
    );
    jobMaster_Save.jobMasterJobAdvAmountOnVar = Number(
      this.jobMasterFormGroup.value.jobMasterAdvAmountOnVar
    );
    jobMaster_Save.jobMasterJobRetAccNo =
      this.jobMasterFormGroup.value.jobMasterRetAccNo;
    jobMaster_Save.jobMasterJobRetAccName =
      this.jobMasterFormGroup.value.jobMasterRetAccName;
    jobMaster_Save.jobMasterJobAdvAccNo =
      this.jobMasterFormGroup.value.jobMasterAdvAccNo;
    jobMaster_Save.jobMasterJobAdvAccName =
      this.jobMasterFormGroup.value.jobMasterAdvAccName;
    jobMaster_Save.jobMasterJobCumValue =
      this.jobMasterFormGroup.value.jobMasterCumValue;
    jobMaster_Save.jobMasterJobDirectCost = Number(
      this.jobMasterFormGroup.value.jobMasterDirectCost
    );
    jobMaster_Save.jobMasterJobRetAmount = Number(
      this.jobMasterFormGroup.value.jobMasterRetAmount
    );
    jobMaster_Save.jobMasterJobAdvInvoice = Number(
      this.jobMasterFormGroup.value.jobMasterAdvInvoice
    );
    jobMaster_Save.jobMasterJobAdvRecovery = Number(
      this.jobMasterFormGroup.value.jobMasterAdvRecovery
    );
    jobMaster_Save.jobMasterJobDeduction = Number(
      this.jobMasterFormGroup.value.jobMasterDeduction
    );
    jobMaster_Save.jobMasterJobReceivable = Number(
      this.jobMasterFormGroup.value.jobMasterReceivable
    );
    jobMaster_Save.jobMasterJobVatamount = Number(
      this.jobMasterFormGroup.value.jobMasterVatamount
    );
    jobMaster_Save.jobMasterJobReceived = Number(
      this.jobMasterFormGroup.value.jobMasterReceived
    );
    jobMaster_Save.jobMasterJobBuildId =
      this.jobMasterFormGroup.value.jobMasterJobBuildId;
    jobMaster_Save.jobMasterJobFlatId =
      this.jobMasterFormGroup.value.jobMasterJobFlatId;
    jobMaster_Save.jobMasterJobContractId =
      this.jobMasterFormGroup.value.jobMasterJobContractId;
    jobMaster_Save.jobMasterJobComplientId =
      this.jobMasterFormGroup.value.jobMasterJobComplientId;
    jobMaster_Save.jobMasterJobCustQtnId =
      this.jobMasterFormGroup.value.jobMasterJobCustQtnId;
    jobMaster_Save.customerQuotationId =
      this.jobMasterFormGroup.value.jobMasterJobCustQtnId;

    jobMaster_Save.jobMasterJobDelStatus =
      this.jobMasterFormGroup.value.jobMasterDelStatus;
    jobMaster_Save.jobMasterDepartmentId =
      this.jobMasterFormGroup.value.jobMasterDepartmentId;
    jobMaster_Save.jobMasterSiteLocation =
      this.jobMasterFormGroup.value.jobMasterSiteLocation;
    jobMaster_Save.jobMasterMEPContractor =
      this.jobMasterFormGroup.value.jobMasterMEPContractor;
    jobMaster_Save.jobMasterPlantType =
      this.jobMasterFormGroup.value.jobMasterPlantType;
    jobMaster_Save.jobMasterCapacity =
      this.jobMasterFormGroup.value.jobMasterCapacity;
    jobMaster_Save.jobMasterScheme =
      this.jobMasterFormGroup.value.jobMasterScheme;
    jobMaster_Save.jobMasterPaymentTerms =
      this.jobMasterFormGroup.value.jobMasterPaymentTerms;
    jobMaster_Save.jobfilesStatus = jobfilesavedData
      ?.filter((k) => k.job_filename != null)
      .map((k: any) => {
        return {
          id: k.id != null ? k.id : 0,
          jobMasterJobId:
            k.jobMasterJobId != null
              ? Number(this.jobMasterFormGroup.value.jobMasterId)
              : 0,
          job_filename: k.job_filename,
          job_fileStatus: k.job_fileStatus,
        };
      });
    //consCenter
    jobMaster_Save.jobMasterControl = constCenteravedData.map((k: any) => {
      return {
        jobMasterControlDtlId: k.jobMasterControlDtlId
          ? k.jobMasterControlDtlId
          : 0,
        jobMasterControlJobID: Number(this.jobMasterFormGroup.value.jobMasterId)
          ? Number(this.jobMasterFormGroup.value.jobMasterId)
          : 0,
        jobMasterNo: String(this.jobMasterFormGroup.getRawValue().jobMasterNo)
          ? String(this.jobMasterFormGroup.getRawValue().jobMasterNo)
          : '',
        jobMasterControlCostCenerID: k.jobMasterControlCostCenerID,
        jobMasterControlActual: k.jobMasterControlActual ?? 0,
        jobMasterControlAmount: Number(k.jobMasterControlAmount)
          ? Number(k.jobMasterControlAmount)
          : 0,
        jobMasterControlLevel1: Number(k.jobMasterControlLevel1)
          ? Number(k.jobMasterControlLevel1)
          : 0,
        jobMasterControlLevel2: Number(k.jobMasterControlLevel2)
          ? Number(k.jobMasterControlLevel2)
          : 0,
        jobMasterControlLevel3: Number(k.jobMasterControlLevel3)
          ? Number(k.jobMasterControlLevel3)
          : 0,
        jobMasterBudgetDetailsEmail:
          k.jobMasterBudgetDetailsEmail == true ? true : false,
        jobMasterControlVariance: k.jobMasterControlVariance ?? 0,
        emailClose: k.emailClose ?? false,
      };
    });

    jobMaster_Save.jobMasterJobDetails = ScopesavedData?.filter(
      (k) =>
        k.jobMasterJobDetailsDescription != null &&
        k.jobMasterJobDetailsJdAmt != null
    ).map((k: JobScopeGridData) => {
      return {
        jobMasterJobDetailsJobDetId:
          k.jobMasterJobDetailsJobDetId != null
            ? k.jobMasterJobDetailsJobDetId
            : 0,
        jobMasterNo: this.jobMasterFormGroup.getRawValue().jobMasterNo,

        jobMasterJobDetailsUnitIdN: Number(
          k.jobMasterJobDetailsDescription.trim().split('|')[1]
        ),
        jobMasterJobDetailsQtyN: Number(k.jobMasterJobDetailsQtyN),
        jobMasterJobDetailsJdAmt: Number(k.jobMasterJobDetailsJdAmt),
        jobMasterJobDetailsStatusDate: k.jobMasterJobDetailsStatusDate
          ? new Date(
            +k.jobMasterJobDetailsStatusDate.toString().split('/')[2],
            +k.jobMasterJobDetailsStatusDate.toString().split('/')[1] - 1,
            +k.jobMasterJobDetailsStatusDate.toString().split('/')[0]
          )
          : null,
        jobMasterJobDetailsStatus: k.jobMasterJobDetailsStatus,
        jobMasterJobDetailsRefNo: k.jobMasterJobDetailsRefNo,
        JobMasterJobDetailsJobId:
          k.jobMasterJobDetailsJobId != null ? k.jobMasterJobDetailsJobId : 0,
        jobMasterJobDetailsDescription: k.jobMasterJobDetailsDescription,
        jobMasterJobDetailsDescriptionId: Number(
          k.jobMasterJobDetailsDescriptionId
        ),
        jobMasterJobDetailsDelStatus: false,
        emailClose: k.emailClose ?? false,
      };
    });
    //===========================
    jobMaster_Save.jobMasterBudgetDetails = BudjetsavedData
      // ?.filter(k =>
      //   k.jobMasterBudgetDetailsBudAmount > 0)
      .map((k: BudjetGridData) => {
        return {
          jobMasterBudgetDetailsDtlId:
            k.jobMasterBudgetDetailsDtlId != null
              ? k.jobMasterBudgetDetailsDtlId
              : 0,
          jobMasterBudgetDetailsDelStatus: false,
          jobMasterNo: this.jobMasterFormGroup.getRawValue().jobMasterNo,
          jobMasterBudgetDetailsJobId:
            k.jobMasterBudgetDetailsJobId != null
              ? k.jobMasterBudgetDetailsJobId
              : 0,
          JobMasterBudgetDetailsActual:
            k.jobMasterBudgetDetailsActual != null
              ? k.jobMasterBudgetDetailsActual
              : 0,
          JobMasterBudgetDetailsVariance:
            k.jobMasterBudgetDetailsVariance != null
              ? k.jobMasterBudgetDetailsVariance
              : 0,
          jobMasterBudgetDetailsBudDesc: k.jobMasterBudgetDetailsBudDesc,
          jobMasterBudgetDetailsBudId: Number(k.jobMasterBudgetDetailsBudId),
          jobMasterBudgetDetailsBudAmount: Number(
            k.jobMasterBudgetDetailsBudAmount
          ),
        };
      });

    jobMaster_Save.jobMasterJobWiseBankGuarantees =
      BankGuaranteessavedData?.filter(
        (k) =>
          k.jobMasterJobWiseBankGuaranteesDesc != null &&
          k.jobMasterJobWiseBankGuaranteesAmount != null
      ).map((k: BankGuaranteesGridData) => {
        return {
          jobMasterJobWiseBankGuaranteesDtlId:
            k.jobMasterJobWiseBankGuaranteesDtlId != null
              ? k.jobMasterJobWiseBankGuaranteesDtlId
              : 0,
          jobMasterJobWiseBankGuaranteesDelStatus: false,
          jobMasterNo: this.jobMasterFormGroup.getRawValue().jobMasterNo,
          jobMasterBudgetDetailsJobId:
            k.jobMasterJobWiseBankGuaranteesJobId != null
              ? k.jobMasterJobWiseBankGuaranteesJobId
              : 0,
          job_Master_JobWiseBankGuarantees_Valid_From_Date:
            k.job_Master_JobWiseBankGuarantees_Valid_From_Date
              ? new Date(
                +k.job_Master_JobWiseBankGuarantees_Valid_From_Date
                  .toString()
                  .split('/')[2],
                +k.job_Master_JobWiseBankGuarantees_Valid_From_Date
                  .toString()
                  .split('/')[1] - 1,
                +k.job_Master_JobWiseBankGuarantees_Valid_From_Date
                  .toString()
                  .split('/')[0]
              )
              : null,
          job_Master_JobWiseBankGuarantees_Valid_To_Date:
            k.job_Master_JobWiseBankGuarantees_Valid_To_Date
              ? new Date(
                +k.job_Master_JobWiseBankGuarantees_Valid_To_Date
                  .toString()
                  .split('/')[2],
                +k.job_Master_JobWiseBankGuarantees_Valid_To_Date
                  .toString()
                  .split('/')[1] - 1,
                +k.job_Master_JobWiseBankGuarantees_Valid_To_Date
                  .toString()
                  .split('/')[0]
              )
              : null,
          job_Master_JobWiseBankGuarantees_Remarks:
            k.job_Master_JobWiseBankGuarantees_Remarks,
          jobMasterJobWiseBankGuaranteesBgid: Number(
            k.jobMasterJobWiseBankGuaranteesBgid
          ),
          jobMasterJobWiseBankGuaranteesDesc:
            k.jobMasterJobWiseBankGuaranteesDesc,
          jobMasterJobWiseBankGuaranteesAmount: Number(
            k.jobMasterJobWiseBankGuaranteesAmount
          ),
          jobMasterjobMasterJobWiseBankGuaranteesSlNo:
            k.jobMasterjobMasterJobWiseBankGuaranteesSlNo,
          emailClose: k.emailClose ?? false,
        };
      });

    this.staffEX.forEach((i: any) => {
      if (i.id == null || !i.id) {
        i.id = 0;
      }
      if (i.jobMasterJobId == null || !i.id) {
        i.jobMasterJobId = 0;
      }
    });

    jobExeDetail.forEach((i: any) => {
      if (i.id == null) {
        i.id = 0;
      }
      if (i.jobMasterJobId == null) {
        i.jobMasterJobId = 0;
      }

      i.jobMasterExecDate = new Date(i.jobMasterExecDate);
    });

    jobEquipment.forEach((i: any) => {
      if (i.id == null) {
        i.id = 0;
      }
      if (i.jobMasterJobId == null) {
        i.jobMasterJobId = 0;
      }
    });

    this.staffTS.forEach((i: any) => {
      if (i.id == null || !i.id) {
        i.id = 0;
      }
      i.jobId = this.jobMasterFormGroup.value.jobId
        ? this.jobMasterFormGroup.value.jobId
        : 0;
      // if (i.jobId == null || i.jobId == -1) {
      //   this.messageService.add({ severity: 'warn', summary: 'Alert', detail: 'Select the time sheet JOd' });
      //   return

      // }
    });

    jobEquipmentDT.forEach((i: any) => {
      if (i.id == null) {
        i.id = 0;
      }
      i.jobId = this.jobMasterFormGroup.value.jobId;
    });

    jobMaster_Save.jobStaff = this.staffEX?.filter(
      (i) => i.jobMasterStaffId != null
    );
    jobMaster_Save.jobExcutionDetails = jobExeDetail;
    jobMaster_Save.jobEquipment = jobEquipment;

    jobMaster_Save.jobTimeSheetStaff = this.staffTS?.filter(
      (i) => i.staffId != null
    );
    this.DetailDatasetDT?.map((i: any) => {
      i.jobId = this.jobMasterFormGroup.value.jobId
        ? this.jobMasterFormGroup.value.jobId
        : 0;

      i.id = i.id ? i.id : 0;
      i.timeSheetId = Number(
        this.jobMasterFormGroup.value.timesheetId == null
          ? 0
          : this.jobMasterFormGroup.value.timesheetId
      );
      // i.timeIn = i.timeIn ? new Date(i.timeIn).toISOString() : null;
      // i.timeOut = i.timeOut ? new Date(i.timeOut).toISOString() : null;
      i.timeIn =
        i.timeIn && !isNaN(new Date(i.timeIn).getTime())
          ? new Date(i.timeIn).toISOString()
          : null;
      i.timeOut =
        i.timeOut && !isNaN(new Date(i.timeOut).getTime())
          ? new Date(i.timeOut).toISOString()
          : null;
    });
    jobMaster_Save.jobTimesheetDesc = this.DetailDatasetDT?.filter(
      (i) => i.timeOut != null
    );
    jobMaster_Save.jobTimeSheetEquip = jobEquipmentDT;

    if (this.btnFlag.save) {
      this.saveVoucher(jobMaster_Save);
    } else {
      this.updateVoucher(jobMaster_Save);
    }
  }

  //==============================================================================================

  validateTotalDrCrAmounts(): boolean {
    // if(this.jobMasterFormGroup.getRawValue().jobMasterRelativeNo ==0 && this.jobMasterFormGroup.getRawValue().jobMasterAdvAmountTotal==0){
    //   this.messageService.add({severity: 'error', summary: 'Alert', detail: 'Total Credit and Debit Amounts are Zero'});
    //   return false;
    // }

    //  if(this.jobMasterFormGroup.getRawValue().jobMasterRelativeNo==0){
    //   this.messageService.add({severity: 'error', summary: 'Alert', detail: 'Total  Debit Amounts are Zero'});
    //   return false;
    // }

    return true;
  }

  saveVoucher(jobMaster_Save: JobMaster) {
    if (this.jobMasterFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save Job?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.masterapi.InsertJobMaster(jobMaster_Save).subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.utilityService
                  .LoadDropdowjobMasters(true)
                  .subscribe((res) => { });
                this.savedJobMaster = data.result;
                this.updateFormGrid(data.result);
                this.userTrackingLog('Insert');
                if (data.valid) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Alert',
                    detail: data.message,
                  });
                } else if (data.error) {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail:
                      data.message != null && data.message.trim() !== ''
                        ? data.message
                        : data.exception,
                  });
                }
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Job Master Save Failed',
                });
              }
            );
          }
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.jobMasterFormGroup.markAllAsTouched();
      this.jobMasterFormGroup.markAsDirty();
    }
  }

  createRetentionAndAdvanceAcc() {
    if (this.btnFlag.save) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Please save the Job Master to generate Retention and Advance Account.',
      });
      return;
    }
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to generate Retention and Advance Account?',
      accept: () => {
        this.masterapi.GererateRetentionAndAdvanceAcc(this.jobMasterFormGroup.value.jobMasterCustomerId).subscribe((data) => {
          if (data.valid) {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: data.message,
            });

            this.jobMasterFormGroup.controls.jobMasterJobRetAccNo.setValue(data.result.retAccNo);
            this.jobMasterFormGroup.controls.jobMasterJobRetAccName.setValue(data.result.retAccName);
            this.jobMasterFormGroup.controls.jobMasterJobAdvAccNo.setValue(data.result.advAccNo);
            this.jobMasterFormGroup.controls.jobMasterJobAdvAccName.setValue(data.result.advAccName);
          }
        });

      }
    });
  }

  updateVoucher(jobMaster_Save: JobMaster) {
    if (this.jobMasterFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing Job?',
        accept: () => {
          if (this.validateTotalDrCrAmounts()) {
            this.masterapi.UpdateJobMaster(jobMaster_Save).subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.utilityService
                  .LoadDropdowjobMasters(true)
                  .subscribe((res) => { });
                this.updateFormGrid(data.result);
                this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Job Master Updated Succesfully',
                });
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Job Master Update Failed',
                });
              }
            );
          }
        },
      });
    } else {
      // const msg1 = 'Please fill mandatory fields';
      // const msg2 = 'Please fill Empyt Debit account details';
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.jobMasterFormGroup.markAllAsTouched();
      this.jobMasterFormGroup.markAsDirty();
    }
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      // this.jobMasterBudgetDetailsList = data.result; live
    });
  }

  getAllJobMaster() {
    this.masterapi.GetJobMaster().subscribe((data) => {
      this.jobMasterarry = data.result;
    });
  }
  get CostCenterSetLookup() {
    return this.costcenterList.map((kl) => ({
      label: kl.label,
      value: kl.value,
    }));
  }
  get bankGSetLookup() {
    return this.BankGuaranteeMasterList.map((kl) => ({
      labelb: kl.label,
      valueb: kl.value,
    }));
  }
  get ScopeSetLookup() {
    return this.ProjectDescriptionMasterList.map((kl) => ({
      labelScope: kl.label,
      valueScope: kl.value,
    }));
  }
  get JobScope_StatuSetLookup() {
    return this.JobScope_StatusList.map((kl) => ({
      labelScope_Statu: kl.label,
      valueScope_Statu: kl.value,
    }));
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo.trim() === acctnumber.trim()
    ).maAccName;
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    ).itemMasterItemName;
  }

  public getUnitName(unit: number): string {
    return this.unitArray?.find((j) => j.unitMasterUnitId === unit)
      .unitMasterUnitShortName;
  }

  new() {
    this.jobMasterFormGroup.reset();
    this.jobMasterFormGroup.enable();
    this.jobScope_entry.data = [];
    this.jobScope_entry.readOnly = false;
    this.Budjet_entry.data = [];
    this.Budjet_entry.readOnly = false;
    this.uploadedjobDocs = [];
    this.Jobfiles.data = [];
    this.Jobfiles.readOnly = false;
    this.JobfilesDataset = [];
    this.BankGuarantees_entry.data = [];
    this.BankGuarantees_entry.readOnly = false;
    this.DetailDatasetDT = [];
    this.files = [];
    this.Variation_entry.data = [];
    this.Variation_entry.readOnly = false;

    this.Detail.data = [];
    this.Detail.readOnly = false;

    this.Equipment.data = [];
    this.Equipment.readOnly = false;
    this.costcenter.data = [];
    this.VariationhotRegisterer.getInstance(this.Variationhotid).updateSettings(
      this.Variation_entry
    );
    this.JobScopehotRegisterer.getInstance(this.JobScopehotid).updateSettings(
      this.jobScope_entry
    );
    this.DetailhotRegisterer.getInstance(this.Detailhotid).updateSettings(
      this.Detail
    );
    this.EquipmenthotRegistererDT.getInstance(
      this.EquipmenthotidDT
    ).updateSettings(this.EquipmentDT);
    this.BudjethotRegisterer.getInstance(this.Budjethotid).updateSettings(
      this.Budjet_entry
    );
    this.BankGuaranteeshotRegisterer.getInstance(
      this.BankGuaranteeshotid
    ).updateSettings(this.BankGuarantees_entry);
    this.PaymentVoucherhotRegisterer.getInstance(
      this.Paymenthotid
    ).updateSettings(this.Payment_entry);
    this.JobfilesRegisterer.getInstance(this.JobfileshotiD).updateSettings({
      readOnly: false,
    });
    this.costcenterRegisterer
      .getInstance(this.costcenterhotiD)
      .updateSettings(this.costcenter);
    this.staffEX = [];
    this.staffTS = [];
    this.getAllList('new');
    this.pushEmptyDatastaffEXs();
    this.pushEmptyDataInDetails();
    this.pushEmptyDatastaffTS();

    this.jobMasterBudgetDetailsList = [];
    this.jobMasterJobDetailsList = [];
    this.jobMasterJobWiseBankGuaranteesList = [];

    this.jobMasterFormGroup.get('jobMasterId').setValue(null);
    this.jobMasterFormGroup.get('jobMasterJobDate').setValue(new Date());
    this.jobMasterFormGroup.get('timesheetDate').setValue(new Date());
    this.jobMasterFormGroup.get('jobMasterCustomerId').setValue(-1);
    this.jobMasterFormGroup.get('jobMasterSalesManId').setValue(-1);
    this.jobMasterFormGroup.get('jobMasterCurrency').setValue(-1);
    this.jobMasterFormGroup.get('jobMasterSupplierId').setValue(-1);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.GetDefaultSettings();
    this.f.jobMasterNo.clearValidators();
    this.jobMasterFormGroup.updateValueAndValidity();
  }

  getcurRate() {
    const rate = this.currencys?.find(
      (j) =>
        j.currencyMasterCurrencyId ===
        this.jobMasterFormGroup.get('jobMasterCurrency').value
    )?.currencyMasterCurrencyRate;
    this.jobMasterFormGroup.get('jobMasterCurVal').setValue(rate);
    this.totalValue();
  }

  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;
      // currency

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.jobMasterCurrency.setValue(Number(this.DefCurrency));
          this.getcurRate();
        }
      }
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );

      if (DEFAULT_LOCATION != null) {
        this.DefLocCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocCheck !== null) {
          const splitText = this.DefLocCheck.split('::');
          this.DefLocid = splitText[1]?.trim();
          // this.f.purchaseVoucherLocationId.setValue(Number(this.DefLocid));
        }
      }
    });
  }

  showMaximizableDialog() {
    this.getAllList('');
    this.getAllJobMaster();
    this.displayMaximizable = true;
  }

  validateTime(rowIndex: number) {
    const item = this.DetailDatasetDT[rowIndex];
    if (item.timeIn && item.timeOut) {
      if (new Date(item.timeOut) <= new Date(item.timeIn)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Time Out must be greater than Time In',
        });

        // this.errorMessages[rowIndex] = 'Time Out must be greater than Time In';
      }
    }
  }

  updateFormGrid(jobmaster_update: JobMaster) {
    this.costcenter.data = [];
    this.costcenterRegisterer
      .getInstance(this.costcenterhotiD)
      .updateSettings({ data: [] });

    this.jobMasterFormGroup.patchValue({
      jobMasterId: jobmaster_update.jobMasterJobId,
      jobMasterNo: jobmaster_update.jobMasterJobNo,
      jobMasterJobDate:
        jobmaster_update.jobMasterJobDate != null
          ? new Date(jobmaster_update.jobMasterJobDate)
          : null,
      jobMasterCurVal: jobmaster_update.jobMasterJobCurVal,

      jobMasterCurrency: jobmaster_update.jobMasterJobCurrencyId,
      jobMasterStatusVal: jobmaster_update.jobMasterJobStatusVal,

      jobMasterConsultant: jobmaster_update.jobMasterJobConsultant,
      jobMasterCustomerId: jobmaster_update.jobMasterJobCustomerId,
      jobMasterJobCode: jobmaster_update.jobMasterJobCode,
      jobMasterJobConfReff: jobmaster_update.jobMasterJobConsultantReff,
      jobMasterJobName: jobmaster_update.jobMasterJobName,
      jobMasterRemarks: jobmaster_update.jobMasterJobRemarks,

      jobMasterBudOverHeadCost: jobmaster_update.jobMasterJobBudgetOverHeadCost,
      jobMasterLabourCostVar: jobmaster_update.jobMasterJobLabourCostVar,
      jobMasterBalance: jobmaster_update.jobMasterJobBalance,
      jobMasterStatus: jobmaster_update.jobMasterJobStatus,
      jobMasterOpenInv: jobmaster_update.jobMasterJobOpenInv,
      jobMasterPerInv: jobmaster_update.jobMasterJobPerInv,

      jobMasterMatCostVar: jobmaster_update.jobMasterJobMaterialCostVar,
      jobMasterTotInvValue: jobmaster_update.jobMasterJobTotalInvValue,
      jobMasterMatCost: jobmaster_update.jobMasterJobMaterialCost,
      jobMasterLabourCost: jobmaster_update.jobMasterJobLabourCost,
      jobMasterAdvPerc: jobmaster_update.jobMasterJobAdvPerc,

      jobMasterRelativeNo: jobmaster_update.jobMasterJobRelativeNo,
      jobMasterAdvAmountTotal: jobmaster_update.jobMasterJobAdvAmountTotal,
      jobMasterRetensionPer: jobmaster_update.jobMasterJobRetentionPercentage,
      jobMasterTotRecValue: jobmaster_update.jobMasterJobTotalRecValue,
      jobMasterRetention: jobmaster_update.jobMasterJobRetention,
      jobMasterJobAdvanceAmount: jobmaster_update.jobMasterJobAdvanceAmount,
      jobMasterTotExpValue: jobmaster_update.jobMasterJobTotalExpValue,
      jobMasterJobValue: jobmaster_update.jobMasterJobValue,
      jobMasterJobType: jobmaster_update.jobMasterJobType,
      jobMasterBudLabourCost: jobmaster_update.jobMasterJobLabourCost,
      jobMasterBudMatCost: jobmaster_update.jobMasterJobBudgetMaterialCost,

      jobMasterSupplierId: jobmaster_update.jobMasterJobSupplierId,
      jobMasterSalesManId: jobmaster_update.jobMasterJobSalesManId,
      jobMasterJobNumber: jobmaster_update.jobMasterJobNumber,
      jobMasterOverHeadCost: jobmaster_update.jobMasterJobOverHeadCost,
      jobMasterOverHeadCostVar: jobmaster_update.jobMasterJobOverHeadCostVar,

      jobMasterMiscCost: jobmaster_update.jobMasterJobMiscCost,
      jobMasterTotCost: jobmaster_update.jobMasterJobTotalCost,
      jobMasterProfit: jobmaster_update.jobMasterJobProfit,
      jobMasterTotPayValue: jobmaster_update.jobMasterJobTotalPayValue,
      jobMasterIsSubJob: jobmaster_update.jobMasterJobIsSubJob,
      jobMasterNoCostCenter: jobmaster_update.jobMasterJobNoCostCenter,
      jobMasterPendingPo: jobmaster_update.jobMasterJobPendingPo,
      jobMasterHrjobId: jobmaster_update.jobMasterJobHrjobId,
      jobMasterContractorName: jobmaster_update.jobMasterJobContractorName,
      jobMasterContractType: jobmaster_update.jobMasterJobContractType,

      jobMasterCommenceDate:
        jobmaster_update.jobMasterJobCommenceDate != null
          ? new Date(jobmaster_update.jobMasterJobCommenceDate)
          : null,
      jobMasterWorkDays: jobmaster_update.jobMasterJobWorkingDays,
      jobMasterOrgCompDate:
        jobmaster_update.jobMasterJobOrgCompleteDate != null
          ? new Date(jobmaster_update.jobMasterJobOrgCompleteDate)
          : null,
      jobMasterPayTermDays: jobmaster_update.jobMasterJobPayTermDays,
      jobMasterVariationAmount: jobmaster_update.jobMasterJobVariationAmount,

      jobMasterAdvPercOnVar: jobmaster_update.jobMasterJobAdvPercOnVar,
      jobMasterAdvAmountOnVar: jobmaster_update.jobMasterJobAdvAmountOnVar,
      jobMasterRetAccNo: jobmaster_update.jobMasterJobRetAccNo,
      jobMasterRetAccName: jobmaster_update.jobMasterJobRetAccName,
      jobMasterAdvAccNo: jobmaster_update.jobMasterJobAdvAccNo,
      jobMasterAdvAccName: jobmaster_update.jobMasterJobAdvAccName,
      jobMasterCumValue: jobmaster_update.jobMasterJobCumValue,
      jobMasterDirectCost: jobmaster_update.jobMasterJobDirectCost,
      jobMasterRetAmount: jobmaster_update.jobMasterJobRetAmount,
      jobMasterAdvInvoice: jobmaster_update.jobMasterJobAdvInvoice,

      jobMasterAdvRecovery: jobmaster_update.jobMasterJobAdvRecovery,
      jobMasterDeduction: jobmaster_update.jobMasterJobDeduction,
      jobMasterReceivable: jobmaster_update.jobMasterJobReceivable,
      jobMasterVatamount: jobmaster_update.jobMasterJobVatamount,
      jobMasterReceived: jobmaster_update.jobMasterJobReceived,
      jobMasterJobBuildId: jobmaster_update.jobMasterJobBuildId,
      jobMasterJobFlatId: jobmaster_update.jobMasterJobFlatId,
      jobMasterJobContractId: jobmaster_update.jobMasterJobContractId,
      jobMasterJobComplientId: jobmaster_update.jobMasterJobComplientId,
      jobMasterJobCustQtnId: jobmaster_update.jobMasterJobCustQtnId,

      jobMasterDelStatus: jobmaster_update.jobMasterJobDelStatus,

      remarks: jobmaster_update?.jobTimesheetMaster[0]?.remarks,
      clientRemarks: jobmaster_update?.jobTimesheetMaster[0]?.clientRemarks,
      vesselName: jobmaster_update?.jobTimesheetMaster[0]?.vesselName,
      jobId: jobmaster_update?.jobTimesheetMaster[0]?.jobId,
      timesheetId: jobmaster_update?.jobTimesheetMaster[0]?.timesheetId,

      jobMasterDepartmentId: jobmaster_update.jobMasterDepartmentId,
      jobMasterSiteLocation: jobmaster_update.jobMasterSiteLocation,
      jobMasterMEPContractor: jobmaster_update.jobMasterMEPContractor,
      jobMasterPlantType: jobmaster_update.jobMasterPlantType,
      jobMasterCapacity: jobmaster_update.jobMasterCapacity,
      jobMasterScheme: jobmaster_update.jobMasterScheme,
      jobMasterPaymentTerms: jobmaster_update.jobMasterPaymentTerms,
    });

    this.jobMasterBudgetDetailsList = jobmaster_update.jobMasterBudgetDetails;
    this.jobMasterJobDetailsList = jobmaster_update.jobMasterJobDetails;
    this.jobMasterJobWiseBankGuaranteesList =
      jobmaster_update.jobMasterJobWiseBankGuarantees;
    this.DetailhotRegisterer.getInstance(this.Detailhotid).updateSettings({
      data: jobmaster_update.jobExcutionDetails,
      readOnly: true,
    });
    const detaildata = jobmaster_update?.jobTimesheetDesc.map((item) => {
      return {
        id: item.id,
        timeSheetId: item.timeSheetId,
        jobId: item.jobId,
        timeIn: new Date(item.timeIn),
        timeOut: new Date(item.timeOut),
        description: item.description,
        remarks: item.remarks,
      };
    });

    this.DetailDatasetDT = detaildata;
    this.staffEX = jobmaster_update.jobStaff;
    this.EquipmenthotRegisterer.getInstance(this.Equipmenthotid).updateSettings(
      {
        data: jobmaster_update?.jobEquipment,
        readOnly: true,
      }
    );

    this.EquipmenthotRegistererDT.getInstance(
      this.EquipmenthotidDT
    ).updateSettings({
      data: jobmaster_update.jobTimeSheetEquip,
      readOnly: true,
    });

    const staffdatetime: JobTimeSheetStaff[] =
      jobmaster_update.jobTimeSheetStaff.map((k) => {
        const staffMember = this.staffArray?.find(
          (i) => i.staffId == k.staffId
        );
        const staffName = staffMember
          ? `${staffMember.firstName} ${staffMember.lastName}`
          : null;
        return {
          id: k.id,
          staffId: k.staffId,
          jobId: k.jobId,
          remarks: k.remarks,
          timesheetId: k.timesheetId,
          jobMasterStaffName: staffName,
        };
      });
    // this.StaffhotRegistererDT.getInstance(this.StaffhotidDT).updateSettings({
    //   data: staffdatetime, readOnly: true
    // });
    this.staffTS = staffdatetime;

    const accTransactionReceiptGridData: AccountTransactionGrid[] =
      jobmaster_update.accountsTransactions?.map((k) => {
        let formateTransDate = this.formatDateService.ddmmyyyy(
          k.accountsTransactionsTransDate
        );
        let formateChqDate = this.formatDateService.ddmmyyyy(
          k.accountsTransactionsCheqDate
        );
        this.totalReciptC += Number(k.accountsTransactionsCredit);
        this.totalReciptD += Number(k.accountsTransactionsDebit);
        this.totalReciptC = +this.totalReciptC.toFixed(2);
        this.totalReciptD = +this.totalReciptD.toFixed(2);
        return {
          accountTransactionAccNo: k.accountsTransactionsAccNo,
          accountTransactionPaymentVoucher: k.accountsTransactionsVoucherNo,
          accountTransactionDateTime: formateTransDate,
          accountTransactionPaymentType: k.accountsTransactionsVoucherType,
          accountsTransactionsChqDate: formateChqDate,
          accountsTransactionsChqNo: k.accountsTransactionsCheqNo,
          accountTransactionDescription: k.accountsTransactionsDescription,
          accountTransactionDebit: k.accountsTransactionsDebit,
          accountTransactionCredit: k.accountsTransactionsCredit,
          accountTransactionAccName: this.getAccountName(
            k.accountsTransactionsAccNo
          ),
        };
      });

    this.Receipt_entry.data = accTransactionReceiptGridData;
    this.Receipt_list = accTransactionReceiptGridData;
    this.ReceiptVoucherhotRegisterer.getInstance(
      this.Receipthotid
    ).updateSettings({ data: accTransactionReceiptGridData, readOnly: true });

    const accTransactionGridData: any[] =
      jobmaster_update.PaymentTransactions?.map((k) => {
        let formateTransDate = this.formatDateService.ddmmyyyy(
          k.accountsTransactionsTransDate
        );
        let formateChqDate = this.formatDateService.ddmmyyyy(
          k.accountsTransactionsCheqDate
        );
        this.totalPaytC += Number(k.accountsTransactionsCredit);
        this.totalPAyD += Number(k.accountsTransactionsDebit);
        this.totalPaytC = +this.totalPaytC.toFixed(2);
        this.totalPAyD = +this.totalPAyD.toFixed(2);
        return {
          accountTransactionAccNo: k.accountsTransactionsAccNo,
          accountTransactionPaymentVoucher: k.accountsTransactionsVoucherNo,
          accountTransactionDateTime: formateTransDate,
          accountTransactionPaymentType: k.accountsTransactionsVoucherType,
          accountsTransactionsChqDate: formateChqDate,
          accountsTransactionsChqNo: k.accountsTransactionsCheqNo,
          accountTransactionDescription: k.accountsTransactionsDescription,
          accountTransactionDebit: k.accountsTransactionsDebit,
          accountTransactionCredit: k.accountsTransactionsCredit,
          accountTransactionAccName: this.getAccountName(
            k.accountsTransactionsAccNo
          ),
        };
      });
    this.Payment_entry.data = accTransactionGridData;
    this.Payment_list = accTransactionGridData;
    this.PaymentVoucherhotRegisterer.getInstance(
      this.Paymenthotid
    ).updateSettings({ data: accTransactionGridData, readOnly: true });

    const jobScopeGridData: JobScopeGridData[] =
      jobmaster_update.jobMasterJobDetails.map((k) => {
        let formateDate = this.formatDateService.ddmmyyyy(
          k.jobMasterJobDetailsStatusDate
        );
        return {
          jobMasterJobDetailsQtyN: k.jobMasterJobDetailsQtyN,
          jobMasterJobDetailsStatusDate: formateDate,
          jobMasterJobDetailsJdAmt: k.jobMasterJobDetailsJdAmt,
          jobMasterJobDetailsStatus: k.jobMasterJobDetailsStatus,
          jobMasterJobDetailsRefNo: k.jobMasterJobDetailsRefNo,
          jobMasterJobDetailsDescription: k.jobMasterJobDetailsDescription,
          jobMasterJobDetailsJobDetId: k.jobMasterJobDetailsJobDetId,
          emailClose: k.emailClose,
        };
      });

    //this.VariationhotRegisterer.getInstance(this.Variationhotid).updateSettings({ data: VariationGridData, readOnly: true });
    this.jobScope_entry.data = jobScopeGridData;

    this.JobScopehotRegisterer.getInstance(this.JobScopehotid).updateSettings({
      data: jobScopeGridData,
      readOnly: true,
    });

    const budjetGridData: any = jobmaster_update.jobMasterBudgetDetails.map(
      (k) => {
        let jobMasterBudgetDetailsBudDesc: string =
          k.jobMasterBudgetDetailsBudId != null
            ? this.costcenterArry?.find((l) =>
              l.match(k.jobMasterBudgetDetailsBudId.toString())
            )
            : null;
        let totalAmount = jobmaster_update.jobMasterBudgetDetails.reduce(
          (total, res) => {
            return total + res.jobMasterBudgetDetailsBudAmount;
          },
          0
        );

        this.jobMasterFormGroup
          .get('jobMasterGridTotBudject')
          .setValue(totalAmount);

        return {
          jobMasterBudgetDetailsBudId: k.jobMasterBudgetDetailsBudId,
          jobMasterBudgetDetailsBudDesc: jobMasterBudgetDetailsBudDesc,
          jobMasterBudgetDetailsBudAmount: k.jobMasterBudgetDetailsBudAmount,
          jobMasterBudgetDetailsDelStatus: k.jobMasterBudgetDetailsDelStatus,
          jobMasterBudgetDetailsDtlId: k.jobMasterBudgetDetailsDtlId,
          jobMasterBudgetDetailsJobId: k.jobMasterBudgetDetailsJobId,
          jobMasterNo: k.jobMasterNo,
          jobMasterBudgetDetailsSno: k.jobMasterBudgetDetailsSno,
          jobMasterBudgetDetailsVariance:
            k.jobMasterBudgetDetailsBudAmount - k.jobMasterBudgetDetailsActual,
          jobMasterBudgetDetailsActual: k.jobMasterBudgetDetailsActual,
        };
      }
    );
    this.Budjet_entry.data = budjetGridData;
    this.Budjet_entryDataset = budjetGridData;
    this.BudjethotRegisterer.getInstance(this.Budjethotid).updateSettings({
      data: budjetGridData,
      readOnly: true,
    });
    this.Jobfiles.data = jobmaster_update.jobfilesStatus;
    this.JobfilesDataset = jobmaster_update.jobfilesStatus;
    // this.costcenterDataset= jobmaster_update.jobMasterControl;
    this.costcenterDataset = this.costcenterList.map((costCenter: any) => {
      const matched = jobmaster_update.jobMasterControl?.find(
        (k: any) => k.jobMasterControlCostCenerID === costCenter.value
      );
      return {
        jobMasterControlCostCenerName: costCenter.label,
        jobMasterControlCostCenerID: costCenter.value,
        jobMasterControlAmount: matched
          ? Number(matched.jobMasterControlAmount)
          : null,
        prAmount: matched ? Number(matched.prAmount) : null,
        jobMasterControlLevel1: matched
          ? Number(matched.jobMasterControlLevel1)
          : null,
        jobMasterControlLevel2: matched
          ? Number(matched.jobMasterControlLevel2)
          : null,
        jobMasterControlLevel3: matched
          ? Number(matched.jobMasterControlLevel3)
          : null,
        jobMasterBudgetDetailsEmail: matched
          ? !!matched.jobMasterBudgetDetailsEmail
          : false,
        jobMasterControlDtlId: matched ? matched.jobMasterControlDtlId : 0,
        jobMasterControlJobID:
          Number(this.jobMasterFormGroup.value.jobMasterId) || 0,
        jobMasterControlVariance: matched
          ? Number(matched.jobMasterControlVariance)
          : null,
        jobMasterControlActual: matched
          ? Number(matched.jobMasterControlActual)
          : null,
        jobMasterNo:
          this.jobMasterFormGroup.getRawValue().jobMasterNo?.toString() || '',
        emailClose: matched?.emailClose ?? false,
      };
    });

    this.costcenter.data = this.costcenterDataset;
    this.costcenterRegisterer
      .getInstance(this.costcenterhotiD)
      .updateSettings({ data: this.costcenterDataset, readOnly: true });
    const bankGuaranteesGridData: BankGuaranteesGridData[] =
      jobmaster_update.jobMasterJobWiseBankGuarantees.map((k) => {
        let jobMasterJobWiseBankGuaranteesDesc: string =
          k.jobMasterJobWiseBankGuaranteesBgid != null
            ? this.BankGuaranteeMasterArry?.find((l) =>
              l.match(k.jobMasterJobWiseBankGuaranteesBgid.toString())
            )
            : null;
        // let formateDate = new Date(k.job_Master_JobWiseBankGuarantees_Valid_From_Date);
        // let formatetoDate = new Date(k.job_Master_JobWiseBankGuarantees_Valid_To_Date);
        let formateDate = this.formatDateService.ddmmyyyy(
          k.job_Master_JobWiseBankGuarantees_Valid_From_Date
        );
        let formatetoDate = this.formatDateService.ddmmyyyy(
          k.job_Master_JobWiseBankGuarantees_Valid_To_Date
        );
        return {
          jobMasterJobWiseBankGuaranteesDesc:
            jobMasterJobWiseBankGuaranteesDesc,
          jobMasterJobWiseBankGuaranteesBgid:
            k.jobMasterJobWiseBankGuaranteesBgid,
          jobMasterJobWiseBankGuaranteesAmount:
            k.jobMasterJobWiseBankGuaranteesAmount,
          jobMasterJobWiseBankGuaranteesDelStatus:
            k.jobMasterJobWiseBankGuaranteesDelStatus,
          jobMasterjobMasterJobWiseBankGuaranteesSlNo:
            k.jobMasterjobMasterJobWiseBankGuaranteesSlNo,
          jobMasterJobWiseBankGuaranteesJobId:
            k.jobMasterJobWiseBankGuaranteesJobId,
          jobMasterNo: k.jobMasterNo,
          jobMasterJobWiseBankGuaranteesDtlId:
            k.jobMasterJobWiseBankGuaranteesDtlId,
          job_Master_JobWiseBankGuarantees_Valid_From_Date: formateDate,
          job_Master_JobWiseBankGuarantees_Valid_To_Date: formatetoDate,
          job_Master_JobWiseBankGuarantees_Remarks:
            k.job_Master_JobWiseBankGuarantees_Remarks,
          emailClose: k.emailClose,
        };
      });

    this.BankGuarantees_entry.data = bankGuaranteesGridData;
    this.BankGuarantees_entryDataset = bankGuaranteesGridData;
    this.BankGuaranteeshotRegisterer.getInstance(
      this.BankGuaranteeshotid
    ).updateSettings({ data: bankGuaranteesGridData, readOnly: true });
    this.jobMasterFormGroup.disable();
    this.f.jobMasterNo.clearValidators();
    this.jobMasterFormGroup.updateValueAndValidity();

    const JobMasterExpenseGridData: JobMasterExpenseGrid[] =
      jobmaster_update.jobMasterExpenses.map((k) => {
        this.totalExpC = Number(this.totalExpC + k.crAmt);
        this.totalExpd = Number(this.totalExpd + k.drAmt);
        let tranDate = this.formatDateService.ddmmyyyy(k.transDate);
        let chqDate = this.formatDateService.ddmmyyyy(k.chq_Date);
        return {
          accNo: k.accNo,
          accName: k.accName,
          voucherNo: k.voucherNo,
          tranDate: tranDate,
          voucherType: k.voucherType,
          chqDate: chqDate,
          chqNo: k.chq_No,
          description: k.description,
          costName: k.costName,
          drAmt: k.drAmt,
          crAmt: k.crAmt,
        };
      });
    this.expenceDiff = Math.abs(this.totalExpd - this.totalExpC).toFixed(2);
    this.jobProfit = (
      jobmaster_update?.jobMasterJobValue - this.expenceDiff
    ).toFixed(2);
    if (this.jobProfit != 0 && this.expenceDiff != 0) {
      this.jobProfitper = (
        (this.jobProfit / jobmaster_update?.jobMasterJobValue) *
        100
      ).toFixed(2);
    }
    this.Expense_entry.data = JobMasterExpenseGridData;
    this.ExpensehotRegisterer.getInstance(this.Expensehotid).updateSettings({
      data: JobMasterExpenseGridData,
      readOnly: true,
    });
    //================
    this.totalValue();
  }

  setupAutoCalculation() {
    const commencementControl =
      this.jobMasterFormGroup.value.jobMasterCommenceDate;
    const workDaysControl = this.jobMasterFormGroup.value.jobMasterWorkDays;
    if (commencementControl && workDaysControl) {
      const completionDate = new Date(commencementControl);
      completionDate.setDate(
        completionDate.getDate() + Number(workDaysControl)
      );
      this.jobMasterFormGroup
        .get('jobMasterOrgCompDate')
        .setValue(completionDate);
    }
  }

  setupAutoCalculationday() {
    const commencementControl =
      this.jobMasterFormGroup.value.jobMasterCommenceDate;
    const jobMasterOrgCompDate =
      this.jobMasterFormGroup.value.jobMasterOrgCompDate;
    if (commencementControl && jobMasterOrgCompDate) {
      const start = new Date(commencementControl);
      const end = new Date(jobMasterOrgCompDate);

      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
      this.jobMasterFormGroup.get('jobMasterWorkDays').setValue(diffDays);
    }
  }

  GetSavedJobMasterJobDetailsString(id: string) {
    this.GetSavedJobMasterJobDetails(id);
  }

  GetSavedJobMasterJobDetails(id: string) {
    this.index = 0;
    this.masterapi.GetSavedJobMasterDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.jobMasterBudgetDetailsList =
            data?.result?.jobMasterBudgetDetails;
          this.jobMasterJobDetailsList = data.result.jobMasterJobDetails;
          this.jobMasterJobWiseBankGuaranteesList =
            data.result.jobMasterJobWiseBankGuarantees;

          //this.accountsTransactions = data.result.accountsTransactions;
          this.updateFormGrid(data.result);
          this.savedJobMaster = data.result;
          this.jobMasterFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Job Master not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.jobMasterFormGroup.updateValueAndValidity();
      }
    );
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  printAsPDF() {
    const fileName = String(new Date().valueOf());
    var css: string = `
.inputGroup {
    margin: 4px 0;
}

.w-100 {
    width: 100%;
}

.p-0 {
    padding: 0;
}

.grid {
    max-height: 500px;
    overflow: auto;
}
 
.f-r {
    float: right;
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


table.border-table {
    border-collapse: collapse;
    border: .5px solid rgb(201, 204, 204);

    th {
        border: .5px solid rgb(201, 204, 204);
        background-color: #d9cece;
    }

    td {
        border: .5px solid rgb(201, 204, 204);
        // padding: 8px;
    }

}

#customers {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
    border: 1px solid;
}

#customers td {
    // border-bottom: 1px solid;
    padding: 8px;
    text-align: start;
}

#customers th {
    border-bottom: 1px solid;
    padding: 8px;
    text-align: start;
}

.info {
    margin: 13px;
    border-bottom: 2px solid;
    display: flex;
    justify-content: center;
    gap: 5px;
}

.header {

    margin: auto;
    display: block;
    text-align: center;
}

.report {
    text-align: center;
    border-top: 3px dotted;
    border-bottom: 3px dotted;
}

.border {
    border: .5px solid rgb(201, 204, 204);
    margin-bottom: 5px;

}

.tableLR {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.disclaimer,
.address p {
    font-size: 10pt;
}

.signature-field {
    padding-bottom: 24pt;
    border-bottom: solid black 1pt;
}

.border {
    border: .5px solid rgb(201, 204, 204);
    margin-bottom: 5px;

}
////////print////
// /* job-report.component.css */
// .job-report-container {
//     width: 100%;
//     font-family: Arial, sans-serif;
//     border: .5px solid rgb(201, 204, 204);
//     /* padding: 10px; */
//     background-color: #f9f9f9;
//   }
  
  .job-report-row {
    display: flex;
    flex-wrap: wrap;
    /* margin-bottom: 5px; */
    margin: 12px;
  }
  
  .job-report-label {
    flex: 0 0 15%;
    font-weight: bold;
    padding-right: 10px;
  }
  
  .job-report-value {
    flex: 0 0 35%;
    padding-right: 20px;
  }
  
  @media (max-width: 768px) {
    .job-report-label, .job-report-value {
      flex: 0 0 100%;
      margin-bottom: 5px;
    }
  }
 
 .summary, .cost-center, .job-cost-analysis {
    margin-bottom: 20px;  
    border: 0.5px solid #c9cccc;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    border: .5px solid rgb(201, 204, 204);
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  h2, h3 {
    margin-bottom: 10px;
  }
/* expenses-report.component.css */
.expenses-report-container {
    width: 100%;
    font-family: Arial, sans-serif;
    border:.5px solid rgb(201, 204, 204);
    padding: 10px;
    background-color: #f9f9f9;
    margin-top: 20px;
  }
  h2{
    text-align: center;
  }
  h3 {
    background-color: #ccc;
    padding: 10px;
    margin: 0;
  }
  
  .expenses-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  .expenses-table th, .expenses-table td {
    border: .5px solid rgb(201, 204, 204);
    padding: 8px;
    text-align: left;
    font-size: 12px;
  }
  
  .expenses-table th {
    background-color: #d3d3d3;
  }
  
  .total-expenses-container {
    width: 100%;
    border-top: .5px solid rgb(201, 204, 204);
    border-bottom: .5px solid rgb(201, 204, 204);
    margin-top: 10px;
    padding-top: 5px;
  }
  
  .expenses-summary {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 5px 0;
  }
  
  .total-label {
    background-color: #d3d3d3;
    padding: 5px 10px;
    font-weight: bold;
    margin-right: 20px;
    text-align: center;
  }
  
  .amount span {
    margin-left: 10px;
    font-weight: bold;
  }
  .flex-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between; /* Adjust this according to your layout needs */
    /* Add any other necessary styling */
}
// .payment1{
//   border: .5px solid rgb(201, 204, 204);
//   width: 100%;
//    margin-bottom:20px ;
//   margin-top: 20px;
//    font-size: 18px;
//    padding-top: 10px;
//    padding-bottom: 10px;
//     }
.payment1{
  border: 2.5px solid rgb(220, 224, 224);
  width: 100%;
   margin-bottom:2% ;
   margin-top: 2%;
  padding-left:3%;
  font-size: 16px; 
    padding-top: 10px;
   padding-bottom: 10px;
    }
    .flex-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between; /* Adjust this according to your layout needs */
      /* Add any other necessary styling */
  }
  .flexcol {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
    }
    
    .flexrow {
      display: flex;
      flex-direction: row;
      justify-content: start;
      align-items: start;
      margin-right: 258px;
    }
    
    `;
    this.printService.PrintPDF('contentToConvert', css);
    this.userTrackingLog('PDF');
  }
  customUploadHandler(event: any): void {
    const id = this.savedJobMaster?.jobMasterJobId;
    if (!id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing ID',
        detail: 'Job ID is required.',
      });
      return;
    }

    const formData = new FormData();

    for (const file of event.files) {
      formData.append('files', file); // Matches .NET controller's List<IFormFile> parameter
    }

    this.api.uploadDOCs(formData, id, 'JobMaster').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Job document saved successfully.',
        });
        this.fetchDocumentTree(this.jobMasterFormGroup.value.jobMasterId);
        this.fileAttachmentDialogVisibility = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'An error occurred while uploading.',
        });
      },
    });
  }
  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.masterapi.DeleteJobMaster(this.savedJobMaster).subscribe(
          (data) => {
            this.utilityService
              .LoadDropdowjobMasters(true)
              .subscribe((res) => { });
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Job Master Deleted Succesfully',
            });
            this.userTrackingLog('Delete');
            this.new();
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Failed',
            });
          }
        );
      },
    });
  }
  cancel() {
    this.new();
  }

  edit() {
    this.Jobfiles.readOnly = false;
    this.VariationhotRegisterer.getInstance(this.Variationhotid).updateSettings(
      { readOnly: false }
    );
    this.JobScopehotRegisterer.getInstance(this.JobScopehotid).updateSettings({
      readOnly: false,
    });
    this.BankGuaranteeshotRegisterer.getInstance(
      this.BankGuaranteeshotid
    ).updateSettings({ readOnly: false });
    this.BudjethotRegisterer.getInstance(this.Budjethotid).updateSettings({
      readOnly: false,
    });
    // this.StaffhotRegisterer.getInstance(this.Staffhotid).updateSettings({ readOnly: false });
    // this.StaffhotRegistererDT.getInstance(this.StaffhotidDT).updateSettings({ readOnly: false });
    this.DetailhotRegisterer.getInstance(this.Detailhotid).updateSettings({
      readOnly: false,
    });
    // this.DetailhotRegistererDT.getInstance(this.DetailhotiDDT).updateSettings({ readOnly: false });
    this.EquipmenthotRegisterer.getInstance(this.Equipmenthotid).updateSettings(
      { readOnly: false }
    );
    this.EquipmenthotRegistererDT.getInstance(
      this.EquipmenthotidDT
    ).updateSettings({ readOnly: false });
    this.JobfilesRegisterer.getInstance(this.JobfileshotiD).updateSettings({
      readOnly: false,
    });
    this.costcenterRegisterer
      .getInstance(this.costcenterhotiD)
      .updateSettings({ readOnly: false });

    this.pushEmptyDatastaffEXs();
    this.pushEmptyDataInDetails();
    this.pushEmptyDatastaffTS();
    this.f.jobMasterNo.clearValidators();
    this.jobMasterFormGroup.enable();
    this.jobMasterFormGroup.controls.jobMasterNo.disable();
    this.jobMasterFormGroup.updateValueAndValidity();
    this.btnFlag.edit = true;

    const hotinstance = this.costcenterRegisterer.getInstance(
      this.costcenterhotiD
    );
    if (hotinstance) {
      hotinstance.render();
    }
    this.GetUserLevelForJob();
  }

  GetUserLevelForJob() {
    this.masterapi
      .GetUserLevelForJob(
        this.user?.userId,
        this.jobMasterFormGroup.value.jobMasterId
      )
      .subscribe((r: any) => {
        this.userLevel2Enabled =
          r.result == 'Level2' || r.result == 'Level2' ? true : false;
      });
  }

  public get IsValidGrid(): boolean {
    if (this.jobScope_entry.data.length > 0) {
      // this.jobScope_entry.data.forEach((value: JobScopeGridData, index, arry) => {
      // console.log(Object.values(this.jobScope_entry.data));
      return Object.values(this.jobScope_entry.data).some(
        (k: JobScopeGridData) =>
          k.jobMasterJobDetailsDescription != null &&
          k.jobMasterJobDetailsStatus != null
      );
      // });
    }
    return false;
  }

  getStatus(id): string {
    return this.Job_StatusList?.find((x) => x.value == id)?.label;
  }

  selectFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      if (filesAmount <= 5) {
        for (let i = 0; i < filesAmount; i++) {
          this.uploadedFiles.push(event.target.files[i]);
        }
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Failed',
        detail: 'Document can not be greater than five',
        life: 2000,
      });
    }
  }

  upload() {
    if (this.uploadedFiles) {
      const formData = new FormData();
      this.uploadedFiles.forEach((ele) => {
        formData.append('files', ele);
      });
      var id: number = this.savedJobMaster?.jobMasterJobId;
      formData.append('jobDocumentJobId', `${id}`);
      this.api.uploadPdf(formData, id).subscribe(
        (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Alert',
            detail: 'Job Documnet Save Succesfully',
          });
          this.GETuploadEDPdf(this.jobMasterFormGroup.value.jobMasterId);
        },
        (error) => {
          //console.error('Error uploading files', error);
        }
      );
    }
  }

  GETuploadEDPdf(id) {
    this.api.GETuploadEDPdf(id).subscribe((res: any) => {
      this.uploadedjobDocs = res;
    });
  }

  download(name: any) {
    const jobDocumentJobId = Number(this.jobMasterFormGroup.value.jobMasterId);

    // const jobDocumentId = id;
    let data = name.split('/');
    const id = data[3];

    const match = id.match(/^(\d+)\s*(.*)/);

    const number = match ? match[1] : null; // "114"
    const text = match ? match[2] : null;
    this.api.downloadPdf(jobDocumentJobId, Number(number)).subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${text}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Download failed', error);
      }
    );
  }

  deletDoc(id) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete existing Document?',
      accept: () => {
        if (this.validateTotalDrCrAmounts()) {
          this.api.DeleteJobDocument(id).subscribe(
            (data) => {
              this.uploadedjobDocs = data;
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Deleted Succesfully',
              });
              this.GETuploadEDPdf(this.jobMasterFormGroup.value.jobMasterId);
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: ' Failed',
              });
            }
          );
        }
      },
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'Job Master',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.jobMasterFormGroup.get('jobMasterNo').value,
      vpType: 'Job Master',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }

  print() {
    this.displayPrintPreview = true;
  }
  exit(evt) {
    this.showcostCenterLookUp = false;
  }
  clear(evt) {
    this.showcostCenterLookUp = false;
  }
  hide(evt) {
    this.showcostCenterLookUp = false;
  }

  selectCostCenter(evt) {
    if (evt.labelScope) {
      this.JobScopehotRegisterer.getInstance(this.JobScopehotid).setDataAtCell(
        this.activeRow.row,
        12,
        evt?.valueScope
      );

      this.JobScopehotRegisterer.getInstance(this.JobScopehotid).setDataAtCell(
        this.activeRow.row,
        2,
        evt?.labelScope
      );
      this.showcostCenterLookUp = false;
    }
    if (evt.labelScope_Statu) {
      this.JobScopehotRegisterer.getInstance(this.JobScopehotid).setDataAtCell(
        this.activeRow.row,
        3,
        evt?.labelScope_Statu
      );
      this.showcostCenterLookUp = false;
    }
    if (evt?.value) {
      this.hotRegisterer
        .getInstance(this.Budjethotid)
        .setDataAtCell(this.activeRow.row, 0, evt?.value);

      this.hotRegisterer
        .getInstance(this.Budjethotid)
        .setDataAtCell(this.activeRow.row, 1, evt?.label);
    }
    if (evt?.labelb) {
      this.BankGuaranteeshotRegisterer.getInstance(
        this.BankGuaranteeshotid
      ).setDataAtCell(this.activeRow.row, 2, evt?.labelb);

      this.BankGuaranteeshotRegisterer.getInstance(
        this.BankGuaranteeshotid
      ).setDataAtCell(this.activeRow.row, 1, evt?.valueb);
    }
    if (evt?.labelequip) {
      this.EquipmenthotRegisterer.getInstance(
        this.Equipmenthotid
      ).setDataAtCell(this.activeRow.row, 2, evt?.valueequip);

      this.BankGuaranteeshotRegisterer.getInstance(
        this.Equipmenthotid
      ).setDataAtCell(this.activeRow.row, 3, evt?.labelequip);
    }

    this.showcostCenterLookUp = false;
  }

  ShowReport() {
    this.displayReportPreview = true;
  }

  gerName(id) {
    let data = this.CustomerMasterList?.find((res) => res?.value === id);
    return data?.label;
  }

  setbudgetcoulumn(res) {
    const hotInstancebudget = this.hotRegisterer.getInstance(this.Budjethotid);
    let budetRow = 0;
    res.forEach((item) => {
      hotInstancebudget.setDataAtCell(budetRow, 1, item.label);
      hotInstancebudget.setDataAtCell(budetRow, 0, item.value);
      budetRow++;
    });
  }

  populateCostCenterGrid(res) {
    const hotInstance = this.hotRegisterer.getInstance(this.costcenterhotiD);

    let activeRow = 0;

    const materialCost = res?.find(
      (item) => item.label.toLowerCase() === 'material cost'
    );
    const otherCosts = res?.filter(
      (item) => item.label.toLowerCase() !== 'material cost'
    );

    if (materialCost) {
      hotInstance.setDataAtCell(activeRow, 0, materialCost.label);

      hotInstance.setDataAtCell(activeRow, 9, materialCost.value);

      activeRow++;
    }

    otherCosts.forEach((item) => {
      hotInstance.setDataAtCell(activeRow, 0, item.label);
      hotInstance.setDataAtCell(activeRow, 9, item.value);
      activeRow++;
    });
  }
}

export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value.trim() !== '') {
      return timer(time).pipe(
        switchMap(() => acctService.CheckVnoExist(input.value)),
        map((res) => {
          return res.result === false ? null : { Exist: true };
        })
      );
    }
  };
};

interface JobScopeGridData {
  jobMasterJobDetailsPlusMinus?: string;
  jobMasterJobDetailsCheckBox?: boolean;
  jobMasterJobDetailsInvoicedAmt?: number;
  jobMasterJobDetailsInvoicedAmtPer?: number;

  jobMasterJobDetailsDescription?: string;
  jobMasterJobDetailsStatus?: string;
  jobMasterJobDetailsRefNo?: string;
  jobMasterJobDetailsStatusDate?: string;
  jobMasterJobDetailsIsEdit?: boolean;

  jobMasterJobDetailsUnitIdN?: number;
  jobMasterJobDetailsQtyN?: number;
  jobMasterJobDetailsDescriptionId?: number;
  jobMasterJobDetailsJdAmt?: number;

  jobMasterJobDetailsDelStatus?: boolean;
  jobMasterJobDetailsJobId?: number;
  jobMasterNo?: string;
  jobMasterJobDetailsJobDetId?: number;
  emailClose?: boolean;
}

interface BankGuaranteesGridData {
  jobMasterJobWiseBankGuaranteesCheckBox?: boolean;
  jobMasterJobWiseBankGuaranteesBgid?: number;
  jobMasterJobWiseBankGuaranteesAmount?: number;
  jobMasterJobWiseBankGuaranteesDesc?: String;
  job_Master_JobWiseBankGuarantees_Valid_From_Date?: any;
  job_Master_JobWiseBankGuarantees_Valid_To_Date?: any;
  job_Master_JobWiseBankGuarantees_Remarks?: string;
  jobMasterJobWiseBankGuaranteesDelStatus?: boolean;
  jobMasterjobMasterJobWiseBankGuaranteesSlNo?: number;
  jobMasterJobWiseBankGuaranteesJobId?: number;
  jobMasterNo?: string;
  jobMasterJobWiseBankGuaranteesDtlId?: number;
  emailClose?: boolean;
}

interface BudjetGridData {
  jobMasterBudgetDetailsBudDesc?: string;
  jobMasterBudgetDetailsBudId?: number;
  jobMasterBudgetDetailsBudAmount?: number;
  JobMasterBudgetDetailsActual: number;
  JobMasterBudgetDetailsVariance: number;
  jobMasterBudgetDetailsDelStatus?: boolean;

  jobMasterBudgetDetailsDtlId?: number;
  jobMasterBudgetDetailsJobId?: number;
  jobMasterNo?: string;
  jobMasterBudgetDetailsSno?: number;
  jobMasterBudgetDetailsActual?: number;
  jobMasterBudgetDetailsVariance?: number;
}
interface AccountTransactionGrid {
  accountTransactionAccNo?: string;
  accountTransactionAccName?: string;
  accountTransactionPaymentVoucher?: string;
  accountTransactionDateTime?: string;
  accountTransactionPaymentType?: string;
  accountsTransactionsChqDate?: string;
  accountsTransactionsChqNo?: string;
  accountTransactionDescription?: string;
  accountTransactionCredit?: number;
  accountTransactionDebit?: number;
}
interface JobMasterExpenseGrid {
  accNo?: string;
  accName?: string;
  voucherNo?: string;
  tranDate?: string;
  voucherType?: string;
  chqDate?: string;
  chqNo?: string;
  description?: string;
  costName?: string;
  drAmt?: number;
  crAmt?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}
