import { IssueReturn} from './IssueReturn';
import { IssueReturnDetails } from './IssueReturnDetails';


export interface IssueReturnCompositeView
{
    issueReturnViewModel?: IssueReturn;
    issueReturnDetails?: IssueVoucherDetails[];
}


