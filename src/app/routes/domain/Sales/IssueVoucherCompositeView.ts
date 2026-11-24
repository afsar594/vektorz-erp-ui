import { IssueVoucher} from './IssueVoucher';
import { IssueVoucherDetails } from './IssueVoucherDetails';


export interface IssueVoucherCompositeView
{
    issueVoucherViewModel?: IssueVoucher;
    issueVoucherDetails?: IssueVoucherDetails[];
}


