import { AccountsTransactions } from './AccountsTransactions';
import { JobMasterBudgetDetails } from './JobMasterBudgetDetails';
import { JobMasterExpense } from './JobMasterExpense';
import { JobMasterJobDetails } from './JobMasterJobDetails';

import { JobMasterJobWiseBankGuarantees } from './JobMasterJobWiseBankGuarantees';

export interface JobMaster {
  jobMasterJobId: number;
  jobMasterJobNo: string;
  jobMasterJobName: string;
  jobMasterJobDate?: Date;
  jobMasterJobValue?: number;
  jobMasterJobRetention?: number;
  jobMasterJobBalance?: number;
  jobMasterJobStatus?: number;
  jobMasterJobConsultant: string;
  jobMasterJobRemarks: string;
  jobMasterJobCustomerId?: number;
  jobMasterJobCurrencyId?: number;
  jobMasterJobCurVal?: number;
  jobMasterJobOpenInv?: number;
  jobMasterJobPerInv?: number;
  jobMasterJobConsultantReff: string;
  jobMasterJobStatusVal?: boolean;
  jobMasterJobType: string;
  jobMasterJobRelativeNo?: number;
  jobMasterJobCode: string;
  jobMasterJobSupplierId?: number;
  jobMasterJobSalesManId?: number;
  jobMasterJobNumber: string;
  jobMasterJobIsSubJob?: boolean;
  jobMasterJobRetentionPercentage?: number;
  jobMasterJobSalesMan?: number;
  jobMasterJobBudgetMaterialCost?: number;
  jobMasterJobMaterialCost?: number;
  jobMasterJobMaterialCostVar?: number;
  jobMasterJobBugetLabourCost?: number;
  jobMasterJobLabourCost?: number;
  jobMasterJobLabourCostVar?: number;
  jobMasterJobBudgetOverHeadCost?: number;
  jobMasterJobOverHeadCost?: number;
  jobMasterJobOverHeadCostVar?: number;
  jobMasterJobMiscCost?: number;
  jobMasterJobTotalCost?: number;
  jobMasterJobProfit?: number;
  jobMasterJobTotalInvValue?: number;
  jobMasterJobTotalPayValue?: number;
  jobMasterJobTotalRecValue?: number;
  jobMasterJobTotalExpValue?: number;
  jobMasterJobContractorName: string;
  jobMasterJobContractType: string;
  jobMasterJobCommenceDate?: Date;
  jobMasterJobWorkingDays?: number;
  jobMasterJobOrgCompleteDate?: Date;
  jobMasterJobPayTermDays?: number;
  jobMasterJobAdvanceAmount?: number;
  jobMasterJobNoCostCenter?: number;
  jobMasterJobPendingPo?: number;
  jobMasterJobHrjobId?: number;
  jobMasterJobAdvPerc?: number;
  jobMasterJobVariationAmount?: number;
  jobMasterJobAdvPercOnVar?: number;
  jobMasterJobAdvAmountOnVar?: number;
  jobMasterJobAdvAmountTotal?: number;
  jobMasterJobRetAccNo: string;
  jobMasterJobRetAccName: string;
  jobMasterJobAdvAccNo: string;
  jobMasterJobAdvAccName: string;
  jobMasterJobCumValue?: number;
  jobMasterJobDirectCost?: number;
  jobMasterJobRetAmount?: number;
  jobMasterJobAdvInvoice?: number;
  jobMasterJobAdvRecovery?: number;
  jobMasterJobDeduction?: number;
  jobMasterJobReceivable?: number;
  jobMasterJobVatamount?: number;
  jobMasterJobReceived?: number;
  jobMasterJobBuildId?: number;
  jobMasterJobFlatId?: number;
  jobMasterJobContractId?: number;
  jobMasterJobComplientId?: number;
  jobMasterJobCustQtnId?: number;
  jobMasterJobDelStatus?: boolean;
  customerQuotationId?: number;
  jobMasterDepartmentId?: number;
  jobMasterSiteLocation: string;
  jobMasterMEPContractor: string;
  jobMasterPlantType: string;
  jobMasterCapacity: string;
  jobMasterScheme: string;
  jobMasterPaymentTerms: string;
  PaymentTransactions?: AccountsTransactions[];
  // Navigation Properties
  jobMasterBudgetDetails?: JobMasterBudgetDetails[];
  jobMasterJobDetails?: JobMasterJobDetails[];
  jobMasterJobWiseBankGuarantees?: JobMasterJobWiseBankGuarantees[];
  accountsTransactions?: AccountsTransactions[];
  jobMasterExpenses?: JobMasterExpense[];
  jobStaff?: JobStaff[];
  jobEquipment?: JobEquipment[];
  jobExcutionDetails?: JobExcutionDetails[];
  jobTimesheetDesc?: JobTimesheetDesc[];
  jobTimeSheetEquip?: JobTimeSheetEquip[];
  jobTimesheetMaster?: JobTimesheetMaster[];
  jobTimeSheetStaff?: JobTimeSheetStaff[];
  jobfilesStatus?: JobfilesStatus[];
  jobMasterControl?: ConsCenter[];
}

export interface JobfilesStatus {
  id: number;
  jobMasterJobId: number;
  job_filename: string;
  job_fileStatus: string;
  job_IsDeleted: string;
}
export interface ConsCenter {
  jobMasterControlDtlId: number;
  jobMasterControlJobID: number;
  jobMasterNo: string;
  jobMasterControlAmount: number;
  jobMasterControlCostCenerID: number;
  jobMasterControlLevel1: number;
  jobMasterControlLevel2: number;
  jobMasterControlLevel3: number;
  jobMasterBudgetDetailsEmail: boolean;
  jobMasterControlVariance: Number;
  jobMasterControlActual: Number;
  emailClose: boolean;
  prAmount: number;
}
export interface JobStaff {
  id: number;
  jobMasterJobId: number;
  jobMasterStaffId: number;
  jobMasterStaffName: string;
}
export interface JobEquipment {
  id: number;
  jobMasterJobId: number;
  jobMasterEquipId: number;
  jobMasterEquipName: string;
  isChecked: boolean;
}

export interface JobExcutionDetails {
  id: number;
  jobMasterJobId: number;
  jobMasterExecDate: Date;
  jobMasterExecDescription: string;
}

export interface JobTimesheetDesc {
  id: number;
  timeSheetId: number;
  jobId: number;
  timeIn: Date;
  timeOut: Date;
  description: string;
  remarks: string;
}

export interface JobTimeSheetEquip {
  id: number;
  timeSheetId: number;
  jobId: number;
  equipmentId: number;
  equipmentDesc: string;
}

export interface JobTimesheetMaster {
  id: number;
  timesheetId: string;
  jobId: number;
  timesheetDate: string;
  remarks: string;
  clientRemarks: string;
  vesselName: string;
}

export interface JobTimeSheetStaff {
  id: number;
  staffId: number;
  jobId: number;
  remarks: string;
  timesheetId: number;
}

export interface JobStatusReportFilter {
  customerNo?: number;
  jobID?: number;
  startDate: string; 
  endDate: string;   
}
