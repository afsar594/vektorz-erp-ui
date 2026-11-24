import { CustomerEnquiryDetails } from './CustomerEnquiryDetails';

export interface CustomerEnquiry {
    enquiryMasterEnquiryId?: number;
    enquiryMasterEnquiryNo?: string;
    enquiryMasterEnquiryDate?: Date;
    enquiryMasterEnquiryAboutId?: number;
    enquiryMasterRemarks?: string;
    enquiryMasterSalesManId?: number;
    enquiryMasterCurrencyId?: number;
    enquiryMasterLocationId?: number;
    enquiryMasterCustomerReference?: string;
    enquiryMasterEnquiryStatusId?: number;
    enquiryMasterConsultingEngineer?: string;
    enquiryMasterJobNo?: number;
    enquiryMasterBusineesTypeId?: number;
    enquiryMasterEnquiryVoucherNo?: number;
    enquiryMasterVesselId?: number;
    enquiryMasterBuilder?: string;
    enquiryMasterSerialNo?: string;
    enquiryMasterVendorId?: number;
    enquiryMasterTypeId?: number;
    enquiryMasterModelId?: number;
    enquiryMasterContactId?: number;
    enquiryMasterContactName?: string;
    enquiryMasterContactEmail?: string;
    enquiryMasterDelStatus?: Boolean;
    customerEnquiryDetails: CustomerEnquiryDetails[];
}