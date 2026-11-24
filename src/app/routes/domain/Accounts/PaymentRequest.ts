import { PaymentRequestDetails } from './PaymentRequestDetail';

export interface PaymentRequest {
  paymentRequestSno?: number;
  paymentRequestVoucherNo?: string;
  paymentRequestDate?: Date;
  paymentRequestVoucherRef?: string;
  paymentRequestCrAcNo?: string;
  paymentRequestCrAmount?: number;
  paymentRequestFcCrAmount?: number;
  paymentRequestDbAmount?: number;
  paymentRequestFcDbAmount?: number;
  paymentRequestNarration?: string;
  paymentRequestFsno?: number;
  paymentRequestUserId?: number;
  paymentRequestCurrencyId?: number;
  paymentRequestCurrencyName?: string;
  paymentRequestLocationId?: number;
  paymentRequestAllocationId?: number;
  paymentRequestDetails?: PaymentRequestDetails[];
  paymentRequestDelStatus?: boolean;
}
