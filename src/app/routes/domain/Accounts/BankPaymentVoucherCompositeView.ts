import { BankPaymentVoucher } from './BankPaymentVoucher';
import { BankPaymentVoucherDetails } from './BankPaymentVoucherDetails';


export interface BankPaymentVoucherCompositeView
{
    bankPaymentVoucher?: BankPaymentVoucher;
    bankPaymentVoucherDetails?: BankPaymentVoucherDetails[];
}
