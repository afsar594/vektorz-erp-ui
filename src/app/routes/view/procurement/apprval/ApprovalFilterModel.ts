export interface ApprovalFilterModel {
  status: EnumApprovalStatus;
  type: EnumOrderForm[];
  userId: number;
  jobId: Number;
  isDate: boolean;
  fromDate?: Date | null;
  toDate?: Date | null;
  isUserRequired: boolean
}

export enum EnumOrderForm {
  None,
  PurchaseOrder,
  PurchaseRequisition,
  BillOfQuantity,
  SalesOrder,
}

export enum EnumApprovalStatus {
  None,
  Pending,
  Approved,
  Rejected,
}

export enum EnumApproverLevels {
  None,
  Level1,
  Level2,
  Level3,
}


export interface POPRApprovaApiResponse {
  jobname: string;
  locationId: any;
  type: any;
  voucherId: number;
  voucherType: EnumOrderForm;
  voucherNo: string;
  voucherDate: string;
  locationName: string;
  jobId: number;
  jobName: string;
  amount: number;
  status: string;
  remarks: string;
  voucherApprovers: VoucherApprover[];
}

export interface VoucherApprover {
  approverId: number;
  approverLevel: EnumApproverLevels;
  status: EnumApprovalStatus;
  remarks: string;
}