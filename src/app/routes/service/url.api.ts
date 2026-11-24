export const MasterUrls = {
  // Currency Master Api

  InsertCurrency: 'master/InsertCurrency',
  UpdateCurrency: 'master/UpdateCurrency',
  DeleteCurrency: 'master/DeleteCurrency',
  GetAllCurrency: 'master/GetAllCurrency',

  InsertTerms: 'InsertTerms',
  UpdateTerms: 'UpdateTerms',
  DeleteTerms: 'DeleteTerms',
  GetAllTerms: 'GetAllTerms',
  GetCustomer: 'Customer/GetAllCustomer',

  //  Item Master Api

  // GetAllItem: 'master/GetAllItem',
  // GetAllItemNotGroup: 'master/GetAllItemNotGroup',    ///  check and remove later
  // GetAllItemById: 'master/GetAllItemById',
  // GetAllItemMasterById: 'master/GetAllItemMasterById',
  // InsertItem: 'master/InsertItem',
  // NewItem: 'master/NewItem',
  // DeleteNewItem: 'master/DeleteNewItem',
  // DeleteItem: 'master/DeleteItem',

  // GetAllItemStockType: 'master/GetAllItemStockType',
  // GetAllItemByName: 'master/GetAllItemByName',

  GetAllItem: 'master/item/GetAllItem',
  GetAllItemMasterByBarCode: 'master/item/GetAllItemMasterByBarCode',
  GetAllItemNotGroup: 'master/item/GetAllItemNotGroup', ///  check and remove later
  GetAllItemById: 'master/item/GetAllItemById',
  GetAllItemMasterById: 'master/item/GetAllItemMasterById',
  GetItemMasterById: 'master/item/GetItemMasterById',
  GetItemMasterByIdAndLocation: 'master/item/GetItemMasterByIdAndLocation',
  GetUnitDetails: 'master/GetUnitDetails',
  InsertItem: 'master/item/InsertItem',
  NewItem: 'master/item/NewItem',
  DeleteNewItem: 'master/item/DeleteNewItem',
  DeleteItem: 'master/item/DeleteItem',
  // GetAllBrand: 'master/GetAllBrand',
  GetAllItemStockType: 'master/item/GetAllItemStockType',
  GetAllItemByName: 'master/item/GetAllItemByName',
  GetMatchingItemsByName: 'master/item/GetMatchingItemsByName',
  GetAllItemSearchFilter: 'master/item/GetAllItemSearchFilter',
  itemmax: 'master/item/itemmax',
  LoadDropdownitem: 'master/item/LoadDropdown',
  LoadDropdownTaxMaster: 'master/item/LoadDropdownTaxMaster',
  LoadDropdownStockType: 'master/item/LoadDropdownStockType',
  LoadDropdownPriceleverMaster: 'master/item/LoadDropdownPriceleverMaster',
  LoadDropdownVendorMaster: 'master/item/LoadDropdownVendorMaster',
  LoadDropdown: 'LoadDropdown',
  GetAvgItemValue: 'StockReport/GetStockReportBaseUnitByItemId/',

  GetAllGroup: 'master/account/GetAllGroup',
  GetAllAccount: 'master/account/GetAllAccount',
  GetAllAccountNotGroup: 'master/account/GetAllAccountNotGroup', ///  check and remove later
  GetAllAccountById: 'master/account/GetAllAccountById',
  GetAllAccountMasterById: 'master/account/GetAllAccountMasterById',
  InsertAccount: 'master/account/InsertAccount',
  NewAccount: 'master/account/NewAccount',
  DeleteNewAccount: 'master/account/DeleteNewAccount',
  DeleteAccount: 'master/account/DeleteAccount',
  GetAllAccountByName: 'master/account/GetAllAccountByName',
  GetAllAccountSearchFilter: 'master/account/GetAllAccountSearchFilter',
  GetAccountMastersByName: 'master/account/GetAllAccountByName',
  // Station Master
  GetAllStation: 'master/GetAllStation',
  DeleteStationMaster: 'master/DeleteStationMaster',
  InsterStationMaster: 'master/InsterStationMaster',
  UpdateStationMaster: 'master/UpdateStationMaster',

  // Unit
  GetAllUnit: 'master/GetAllUnit',
  InsertUnit: 'master/InsertUnit',
  UpdateUnit: 'master/UpdateUnit',
  DeleteUnit: 'master/DeleteUnit',

  // Unit
  GetAllModel: 'GetAllModel',
  InsertModel: 'InsertModel',
  UpdateModel: 'UpdateModel',
  DeleteModel: 'DeleteModel',

  // Tax Master

  GetAllTax: 'GetAllTax',

  // Brand/Vendors

  GetAllBrand: 'master/GetAllBrand',
  InsertBrand: 'master/InsertBrand',
  UpdateBrand: 'master/UpdateBrand',
  DeleteBrand: 'master/DeleteBrand',

  //    Bankguarantee
  GetAllBankGuarantee: 'GetAllBankGuarantee',
  InsertBankGuarantee: 'InsertBankGuarantee',
  UpdateBankGuarantee: 'UpdateBankGuarantee',
  DeleteBankGuarantee: 'DeleteBankGuarantee',

  // PriceLevel
  GetAllPriceLevel: 'master/GetAllPriceLevel',
  InsertPriceLevel: 'master/InsertPriceLevel',
  UpdatePriceLevel: 'master/UpdatePriceLevel',
  DeletePriceLevel: 'master/DeletePriceLevel',

  // Job Master Api
  GetAllJob: 'GetJobMaster',
  GetAllCostCenter: 'GetAllCostCenter',
  InsertCostCenter: 'InsertCostCenter',
  UpdateCostCenter: 'UpdateCostCenter',
  DeleteCostCenter: 'DeleteCostCenter',
  JobDropdown: 'jobLoadDropdown',

  // New Job Master
  InsertJobMaster: 'InsertJobMaster',
  UpdateJobMaster: 'UpdateJobMaster',
  GetJobMaster: 'GetJobMaster',
  GetSavedJobMasterDetails: 'GetAllMasterById',
  DeleteJobMaster: 'DeleteJob',
  JobMaster_GetAllBankGuaranteeMaster: 'GetAllBankGuarantee',

  // Budget Master
  GetAllBudget: 'GetAllBudget',
  InsertBudget: 'InsertBudget',
  UpdateBudget: 'UpdateBudget',
  DeleteBudget: 'DeleteBudget',
  // City Master
  GetAllCity: 'GetAllCity',
  InsertCity: 'InsertCity',
  UpdateCity: 'UpdateCity',
  DeleteCity: 'DeleteCity',
  // WorkGroup

  GetAllWorkGroup: 'GetAllWorkGroup',
  InsertWorkGroup: 'InsertWorkGroup',
  UpdateWorkGroup: 'UpdateWorkGroup',
  DeleteWorkGroup: 'DeleteWorkGroup',
  // Type Master

  GetAllTypeMast: 'GetAllTypeMast',
  InsertTypeMast: 'InsertTypeMast',
  UpdateTypeMast: 'UpdateTypeMast',
  DeleteTypeMast: 'DeleteTypeMast',

  // Country Master
  GetAllCountry: 'GetAllCountry',
  InsertCountry: 'InsertCountry',
  UpdateCountry: 'UpdateCountry',
  DeleteCountry: 'DeleteCountry',
  //<<<<<<< HEAD
  //Location Master
  GetAllLocation: 'GetAllLocation',
  InsertLocation: 'InsertLocation',
  UpdateLocation: 'UpdateLocation',
  DeleteLocation: 'DeleteLocation',
  //Supplier Master
  //=======
  // Supplier Master
  ///>>>>>>> 1377bc3ff827a65a45b091cb1bacfbfebae677bf
  GetSupplierLoadDropdown: 'Supplier/LoadDropdown',
  GetAllSupplier: 'GetAllSupplier',
  InsertSupplier: 'InsertSupplier',
  UpdateSupplier: 'UpdateSupplier',
  DeleteSupplier: 'DeleteSupplier',
  GetSupplierDetailsByItemId: 'GetSupplierDetailsByItemId',
  GetAllSupplierById: 'GetAllSupplierById',

  // Project Description
  GetAllProjectDesc: 'GetAllProjectDesc',
  InsertProjectDesc: 'InsertProjectDesc',
  UpdateProjectDesc: 'UpdateProjectDesc',
  DeleteProjectDesc: 'DeleteProjectDesc',
  // Business Type
  GetAllBusinessType: 'GetAllBusinessType',
  InsertBusinessType: 'InsertBusinessType',
  UpdateBusinessType: 'UpdateBusinessType',
  DeleteBusinessType: 'DeleteBusinessType',
  // Department Master
  InsertDepartment: 'InsertDepartment',
  UpdateDepartment: 'UpdateDepartment',
  DeleteDepartment: 'DeleteDepartment',
  GetAllDepartment: 'GetAllDepartment',
  GetAllDepartmentById: 'GetAllDepartmentById',

  //Customer Master
  InsertNewsCustomer: 'InsertNewCustomer',
  UpdateCustomer: 'Customer/UpdateCustomer',
  DeleteCustomer: 'Customer/DeleteCustomer',
  GetAllCustomer: 'Customer/GetAllCustomer',
  GetCustomerDropdown: 'Customer/LoadDropdown',

  //Customer Master
  InsertNewCustomer: 'InsertCustomer',
  UpdateNewCustomer: 'UpdateNewCustomer',
  DeleteNewCustomer: 'DeleteNewCustomers',
  GetAllCustomers: 'GetAllCustomers',
  GetSavedCustomers: 'GetSavedCustomers',
  GetAllCustomerById: 'GetAllCustomerById',
  //CustomerType Master
  InsertCustType: 'InsertCustType',
  UpdateCustType: 'UpdateCustType',
  DeleteCustType: 'DeleteCustType',
  GetAllCustType: 'GetAllCustType',

  //Salesman Master
  InsertSalesman: 'InsertSalesman',
  UpdateSalesman: 'UpdateSalesman',
  DeleteSalesman: 'DeleteSalesman',
  GetAllSalesman: 'GetAllSalesman',

  //EnquiryAbout
  InsertEnquiryAbout: 'InsertEnquiryAbout',
  UpdateEnquiryAbout: 'UpdateEnquiryAbout',
  DeleteEnquiryAbout: 'DeleteEnquiryAbout',
  GetAllEnquiryAbout: 'GetAllEnquiryAbout',

  //EnquiryStatus
  InsertEnquiryStatus: 'InsertEnquiryStatus',
  UpdateEnquiryStatus: 'UpdateEnquiryStatus',
  DeleteEnquiryStatus: 'DeleteEnquiryStatus',
  GetAllEnquiryStatus: 'GetAllEnquiryStatus',

  // Location

  //GetAllLocation: 'GetAllLocation',
  GetAllFinancialPeriod: 'GetAllFinancialPeriod',

  //Settings
  GetProgramSettings: 'settings/program',
  GetProgramSettingbyKey: 'settings/GetProgramSettingbyKey',
  GetGeneralSettings: 'settings/general',
  GetGeneralSettingbyKey: 'settings/GetGeneralSettingbyKey',
  UpdateProgramSettings: 'settings/updateProgram',
  UpdateGeneralSettings: 'settings/updateGeneral',
  GetProgramSettingsDropdown: 'settings/LoadDropdown',
  //Settings Urls
  GetOptionSettings: 'settings/GetOptionSetting',
  GetOptionSettingbyKey: 'settings/GetOptionsSettingbyKey',
  UpdateOptionSettings: 'optionsMaster/updateOptions',
};

export const ReportURL = {
  GetDetailWiseIssueVoucherReport: 'AvIssueVoucher/GetDetailWiseReport',
  GetJobWiseIssueVoucherReport: 'AvIssueVoucher/GetJobWiseReport',
  GetSummaryWiseIssueReport: 'AvIssueVoucher/GetSummaryWiseReport',
};

export const UserUrls = {
  InsertUser: 'InsertUser',
  UpdateUser: 'UpdateUser',
  DeleteUser: 'DeleteUser',
  GetAllUser: 'GetAllUser',
};
export const WorkGroupUrls = {
  GetAllWorkGroup: 'GetAllWorkGroup',
};

export const SalesUrls = {
  //================ customer quotation
  InsertCustomerQuotation: 'InsertCustomerQuotation',
  InsertCustomerQuotationwithRevise: 'IsRevisedCustomerQuotation',

  UpdateCustomerQuotation: 'UpdateCustomerQuotation',
  DeleteCustomerQuotation: 'DeleteCustomerQuotation',
  GetCustomerQuotation: 'GetCustomerQuotation',
  GetSavedCustQuotationDetails: 'GetSavedCustQuotationDetails',
  GetCustomerQuotationDetail: 'GetCustomerQuotationDetail',
  GetPurchaseOrderTracking: 'SalesOrder/GetPurchaseOrderTracking',
  GetQuotationDropdown: 'QuotationLoadDropdown',

  //================ Bill Of Quantity
  InsertBOQ: 'InsertBillofQty',
  UpdateBOQ: 'UpdateBillofQty',
  DeleteBOQ: 'DeleteBillofQty',
  GetBOQ: 'GetBillofQty',
  GetSavedBOQ: 'GetSavedBillofQty',
  GetBOQDropdown: 'BOQLoadDropdown',
  //================ customer enquiry
  InsertCustomerEnquiry: 'InsertCustomerEnquiry',
  UpdateCustomerEnquiry: 'UpdateCustomerEnquiry',
  DeleteCustomerEnquiry: 'DeleteCustomerEnquiry',
  GetCustomerEnquiry: 'GetCustomerEnquiry',
  GetCustomerEnquiryDropdown: 'CustomerEnquiry/LoadDropdown',
  GetSavedCustEnquiryDetails: 'GetSavedCustEnquiryDetails',
  GetCustomerEnquirybyStatuss:
    'CustomerEnqirySearch/GetCustomerEnquirybyStatuss',
  //========================= Sales Voucher
  InsertSalesVoucher: 'SalesVoucher/InsertSalesVoucher',
  UpdateSalesVoucher: 'SalesVoucher/UpdateSalesVoucher',
  GetSalesVoucher: 'SalesVoucher/GetSalesVoucher',
  GetSalesVoucherList: 'SalesVoucher/GetSalesVoucherList',
  GetSalesDropdown: 'SalesVoucher/LoadDropdown',
  GetSavedSalesVoucherDetails: 'SalesVoucher/GetSavedSalesVoucherDetails',
  GetSavedSalesVoucherDetailsBySaleVoucher:
    'SalesVoucher/GetSavedSalesVoucherDetailsBySaleVoucher',
  DeleteSalesVoucher: 'SalesVoucher/DeleteSalesVoucher',
  CheckVnoExistSalesVoucher: 'SalesVoucher/CheckVnoExistSalesVoucher',
  GetSalesVoucherForGRN: 'SalesVoucher/getsalesvoucherforgrnbrowse',

  ///  ====================  Sales Return

  InsertSalesReturn: 'SalesReturn/InsertSalesReturn',
  UpdateSalesReturn: 'SalesReturn/UpdateSalesReturn',
  GetSalesReturn: 'SalesReturn/GetSalesReturn',
  GetSalesReturnList: 'SalesReturn/GetSalesReturnList',
  GetSavedSalesReturnDetails: 'SalesReturn/GetSavedSalesReturnDetails',
  DeleteSalesReturn: 'SalesReturn/DeleteSalesReturn',
  //  SalesReturn_GetReportSalesReturn: 'SalesReturn/SalesReturn_GetReportSalesReturn',

  ///==================== Issue Voucher
  InsertIssueVoucher: 'IssueVoucher/InsertIssueVoucher',
  UpdateIssueVoucher: 'IssueVoucher/UpdateIssueVoucher',
  GetIssueVoucher: 'IssueVoucher/GetIssueVoucher',
  GetIssueVoucherDropdown: 'IssueVoucher/LoadDropdown',
  GetSavedIssueVoucherDetails: 'IssueVoucher/GetSavedIssueVoucherDetails',
  DeleteIssueVoucher: 'IssueVoucher/DeleteIssueVoucher',
  CheckVnoExistIssueVoucher: 'IssueVoucher/CheckVnoExistIssueVoucher',
  IssueVoucher_GetReportIssueVoucher:
    'IssueVoucher/IssueVoucher_GetReportIssueVoucher',
  //===============
  //============ Issue Return
  InsertIssueReturn: 'IssueReturn/InsertIssueReturn',
  UpdateIssueReturn: 'IssueReturn/UpdateIssueReturn',
  GetIssueReturn: 'IssueReturn/GetIssueReturn',
  GetSavedIssueReturnDetails: 'IssueReturn/GetSavedIssueReturnDetails',
  DeleteIssueReturn: 'IssueReturn/DeleteIssueReturn',
  CheckVnoExistIssueReturn: 'IssueReturn/CheckVnoExistIssueReturn',
  IssueReturn_GetReportIssueReturn:
    'IssueReturn/IssueReturn_GetReportIssueReturn',

  ///==================== Delivery Note

  InsertDeliveryNote: 'DeliveryNote/InsertDeliveryNote',
  UpdateDeliveryNote: 'DeliveryNote/UpdateDeliveryNote',
  GetDeliveryNote: 'DeliveryNote/GetDeliveryNote',
  GetSavedDeliveryNoteDetails: 'DeliveryNote/GetSavedDeliveryNoteDetails',
  DeleteDeliveryNote: 'DeliveryNote/DeleteDeliveryNote',
  CheckVnoExistDeliveryNote: 'DeliveryNote/CheckVnoExistDeliveryNote',
  DeliveryNote_GetReportDeliveryNote:
    'DeliveryNote/DeliveryNote_GetReportDeliveryNote',

  ///  ====================   Customer Sales Order

  InsertCustomerPurchase: 'SalesOrder/InsertSalesOrder',
  UpdateCustomerPurchase: 'SalesOrder/UpdateSalesOrder',
  GetCustomerPurchase: 'SalesOrder/GetAllSalesOrder',
  GetSavedCustomerPurchaseDetails: 'SalesOrder/GetSavedSalesOrderDetails',
  DeleteCustomerPurchase: 'SalesOrder/DeleteSalesOrder',
  ///====================
};
export const TaxMasterUrls = {
  GetAll: 'GetAllTax',
  Insert: 'InsertTaxMaster',
  Update: 'UpdateTaxMaster',
  Delete: 'DeleteTaxMaster',
};
export const SalesVoucherURL = {
  GetSalesVoucherWithDetails: 'SalesVoucher/GetSalesVoucherWithDetails',
};
export const PurchaseVoucherURL = {
  GetPurchaseVoucher: 'PurchaseVoucher/GetPurchaseVoucher',
  GetPurchaseVoucherDetails: 'PurchaseVoucher/GetPurchaseVoucherDetails',
  InsertPurchaseVoucher: 'PurchaseVoucher/InsertPurchaseVoucher',
  UpdatePurchaseVoucher: 'PurchaseVoucher/UpdatePurchaseVoucher',
  DeletePurchaseVoucher: 'PurchaseVoucher/DeletePurchaseVoucher',
};

export const ProcurementUrls = {
  //=============  Purchase Voucher
  InsertPurchaseVoucher: 'PurchaseVoucher/InsertPurchaseVoucher',
  UpdatePurchaseVoucher: 'PurchaseVoucher/UpdatePurchaseVoucher',
  GetPurchaseVoucher: 'PurchaseVoucher/GetPurchaseVoucher',
  GetPurchaseVoucherList: 'PurchaseVoucher/GetPurchaseVoucherList',
  GetSavedPurchaseVoucherDetails:
    'PurchaseVoucher/GetSavedPurchaseVoucherDetails',
  GetSavedPurchaseVoucherDetailsByPurchaseVoucher:
    'PurchaseVoucher/GetSavedPurchaseVoucherDetailsByPurchaseVoucher',
  DeletePurchaseVoucher: 'PurchaseVoucher/DeletePurchaseVoucher',
  GetPOTracking: 'POTracking/GetPoTracking',
  GetPoNumber: 'POTracking/GetPoTrackingNumber',
  GetPoTrackingByNumber: 'POTracking/POTrackingBynumber',
  POTrackingDropdown: 'PurchassOrderTracking/LoadDropdown',

  // new
  GetPurchaseOrderTrackingDetails:
    'PurchassOrderTracking/GetPurchaseOrderTrackingDetails',
  GetPurchaseOrderTrackingSummary:
    'PurchassOrderTracking/GetPurchaseOrderTrackingSummary',
  // CheckVnoExistPurchaseVoucher: 'PurchaseVoucher/CheckVnoExistPurchaseVoucher',
  // PurchaseVoucher_GetReportPurchaseVoucher: 'PurchaseVoucher/PurchaseVoucher_GetReportPurchaseVoucher',
  //=========
  //===================== Purchase Return
  InsertPurchaseReturn: 'PurchaseReturn/InsertPurchaseReturn',
  UpdatePurchaseReturn: 'PurchaseReturn/UpdatePurchaseReturn',
  GetPurchaseReturn: 'PurchaseReturn/GetPurchaseReturn',
  GetPurchaseReturnListModel: 'PurchaseReturn/GetPurchaseReturnListModel',
  GetSavedPurchaseReturnDetails: 'PurchaseReturn/GetSavedPurchaseReturnDetails',
  DeletePurchaseReturn: 'PurchaseReturn/DeletePurchaseReturn',
  PurchaseReturn_GetReportPurchaseReturn:
    'PurchaseReturn/PurchaseReturn_GetReportPurchaseReturn',
  //=====================

  //==================== Purchase Order
  InsertPurchaseOrder: 'PurchaseOrder/InsertPurchaseOrder',
  UpdatePurchaseOrder: 'PurchaseOrder/UpdatePurchaseOrder',
  GetPurchaseOrder: 'PurchaseOrder/GetPurchaseOrder',
  GetSavedPurchaseOrderDetails: 'PurchaseOrder/GetSavedPurchaseOrderDetails',
  DeletePurchaseOrder: 'PurchaseOrder/DeletePurchaseOrder',
  GetPurchaseOrderDetailsByMasterNo:
    'PurchaseOrder/GetPurchaseOrderDetailsByMasterNo',
  // CheckVnoExistPurchaseOrder: 'PurchaseOrder/CheckVnoExistPurchaseOrder',
  //PurchaseOrder_GetReportPurchaseOrder: 'PurchaseOrder/PurchaseOrder_GetReportPurchaseOrder',
  GetAllUserFile: 'GetAllUserFile',

  //====================

  //=================== Purchase Requisition
  InsertPurchaseRequisition: 'PurchaseRequisition/InsertPurchaseRequisition',
  UpdatePurchaseRequisition: 'PurchaseRequisition/UpdatePurchaseRequisition',
  GetPurchaseRequisition: 'PurchaseRequisition/GetPurchaseRequisition',
  GetSavedPurchaseRequisitionDetails:
    'PurchaseRequisition/GetSavedPurchaseRequisitionDetails',
  DeletePurchaseRequisition: 'PurchaseRequisition/DeletePurchaseRequisition',
  CheckVnoExistPurchaseRequisition:
    'PurchaseRequisition/CheckVnoExistPurchaseRequisition',
  PurchaseRequisition_GetReportPurchaseRequisition:
    'PurchaseRequisition/PurchaseRequisition_GetReportPurchaseRequisition',

  //=======================

  //=======================  Purchase Quotation

  InsertPurchaseQuotation: 'PurchaseQuotation/InsertPurchaseQuotation',
  UpdatePurchaseQuotation: 'PurchaseQuotation/UpdatePurchaseQuotation',
  GetPurchaseQuotation: 'PurchaseQuotation/GetPurchaseQuotation',
  GetSavedPurchaseQuotationDetails:
    'PurchaseQuotation/GetSavedPurchaseQuotationDetails',
  DeletePurchaseQuotation: 'PurchaseQuotation/DeletePurchaseQuotation',
  CheckVnoExistPurchaseQuotation:
    'PurchaseQuotation/CheckVnoExistPurchaseQuotation',
  PurchaseQuotation_GetReportPurchaseQuotation:
    'PurchaseQuotation/PurchaseQuotation_GetReportPurchaseQuotation',
  //=======================

  //==================== General Purchase   Order

  InsertGeneralPurchaseOrder: 'GeneralPurchaseOrder/InsertGeneralPurchaseOrder',
  UpdateGeneralPurchaseOrder: 'GeneralPurchaseOrder/UpdateGeneralPurchaseOrder',
  GetGeneralPurchaseOrder: 'GeneralPurchaseOrder/GetGeneralPurchaseOrder',
  GetSavedGeneralPurchaseOrderDetails:
    'GeneralPurchaseOrder/GetSavedGeneralPurchaseOrderDetails',
  DeleteGeneralPurchaseOrder: 'GeneralPurchaseOrder/DeleteGeneralPurchaseOrder',

  //==================== Stock Requisition
  InsertStockRequisition: 'StockRequisition/InsertStockRequisition',
  UpdateStockRequisition: 'StockRequisition/UpdateStockRequisition',
  GetStockRequisition: 'StockRequisition/GetStockRequisition',
  GetSavedStockRequisitionDetails:
    'StockRequisition/GetSavedStockRequisitionDetails',
  DeleteStockRequisition: 'StockRequisition/DeleteStockRequisition',

  //==================== RFQ
  InsertRFQ: 'InsertRfq',
  UpdateRFQ: 'UpdatetRfq',
  GetRFQ: 'GetRfq',
  GetSavedRFQDetails: 'GetRfqById',
  DeleteRFQ: 'DeleteRfq',
};
export const AccountsUrls = {
  GetAllAccounts: 'account/GetAllAccounts',
  GetAllBankAccounts: 'account/GetAllBankAccounts',
  InsertPaymentVoucher: 'payment/InsertPaymentVoucher',
  UpdatePaymentVoucher: 'payment/UpdatePaymentVoucher',
  GetAllAccountTransaction: 'account/GetAllAccountTransaction',
  GetPaymentVouchers: 'payment/GetPaymentVouchers',
  GetPaymentDropdown: 'payment/LoadDropdown',
  GetSavedPaymentDetails: 'payment/GetSavedPaymentDetails',
  BrowsePayments: 'paymentrequest/BrowsePayments',
  GetPaymentAllocationDetails: 'payment/GetAllocationDetails',
  DeletePaymentVoucher: 'payment/DeletePaymentVoucher',
  InsertReceiptVoucher: 'receipt/InsertReceiptVoucher',
  UpdateReceiptVoucher: 'receipt/UpdateReceiptVoucher',
  GetReceiptVouchers: 'receipt/GetReceiptVouchers',
  GetSavedReceiptDetails: 'receipt/GetSavedReceiptDetails',
  DeleteReceiptVoucher: 'receipt/DeleteReceiptVoucher',
  CheckVnoExist: 'payment/CheckVnoExist',
  GetVno: 'payment/GetVno',

  ////========== payment voucher
  accountTransactionList: 'accountTransactionList',
  GetDefaultCreditDebitAccounts: 'account/GetDefaultCreditDebitAccounts',

  InsertBankPaymentVoucher: 'bankpayment/InsertBankPaymentVoucher',
  UpdateBankPaymentVoucher: 'bankpayment/UpdateBankPaymentVoucher',
  GetBankPaymentVouchers: 'bankpayment/GetBankPaymentVouchers',
  GetSavedBankPaymentDetails: 'bankpayment/GetSavedBankPaymentDetails',
  DeleteBankPaymentVoucher: 'bankpayment/DeleteBankPaymentVoucher',
  ////=============== Bank Receipt Voucher
  InsertBankReceiptVoucher: 'bankreceipt/InsertBankReceiptVoucher',
  UpdateBankReceiptVoucher: 'bankreceipt/UpdateBankReceiptVoucher',
  GetBankReceiptVouchers: 'bankreceipt/GetBankReceiptVouchers',
  GetSavedBankReceiptDetails: 'bankreceipt/GetSavedBankReceiptDetails',
  DeleteBankReceiptVoucher: 'bankreceipt/DeleteBankReceiptVoucher',
  ////===============  Credit Note
  InsertCreditNote: 'CreditNote/InsertCreditNote',
  UpdateCreditNote: 'CreditNote/UpdateCreditNote',
  GetCreditNote: 'CreditNote/GetCreditNote',
  GetSavedCreditNoteDetails: 'CreditNote/GetSavedCreditNoteDetails',
  DeleteCreditNote: 'CreditNote/DeleteCreditNote',
  CheckVnoExistCreditNote: 'CreditNote/CheckVnoExistCreditNote',
  ////================ Debit Note
  InsertDebitNote: 'DebitNote/InsertDebitNote',
  UpdateDebitNote: 'DebitNote/UpdateDebitNote',
  GetDebitNote: 'DebitNote/GetDebitNote',
  GetSavedDebitNoteDetails: 'DebitNote/GetSavedDebitNoteDetails',
  DeleteDebitNote: 'DebitNote/DeleteDebitNote',
  CheckVnoExistDebitNote: 'DebitNote/CheckVnoExistDebitNote',
  ////================= Purchase Journal
  InsertPurchaseJournal: 'PurchaseJournal/InsertPurchaseJournal',
  UpdatePurchaseJournal: 'PurchaseJournal/UpdatePurchaseJournal',
  GetPurchaseJournal: 'PurchaseJournal/GetPurchaseJournal',
  GenerateVoucherNo: 'JournalVoucher/GenerateVoucherNo',
  GetSavedPurchaseJournalDetails:
    'PurchaseJournal/GetSavedPurchaseJournalDetails',
  DeletePurchaseJournal: 'PurchaseJournal/DeletePurchaseJournal',
  CheckVnoExistPurchaseJournal: 'PurchaseJournal/CheckVnoExistPurchaseJournal',
  ////================ Sales Journal
  InsertSalesJournal: 'SalesJournal/InsertSalesJournal',
  UpdateSalesJournal: 'SalesJournal/UpdateSalesJournal',
  GetSalesJournal: 'SalesJournal/GetSalesJournal',
  GetSavedSalesJournalDetails: 'SalesJournal/GetSavedSalesJournalDetails',
  DeleteSalesJournal: 'SalesJournal/DeleteSalesJournal',
  CheckVnoExistSalesJournal: 'SalesJournal/CheckVnoExistSalesJournal',
  ////===============Opening Balance Voucher
  InsertOBVoucher: 'InsertOBVoucher',
  UpdateOBVoucher: 'UpdateOBVoucher',
  getAccounts: 'getAccounts',
  GetOBVouchers: 'GetOBVouchers',
  GetSavedOBVoucherDetails: 'GetSavedOBVoucherDetails',
  DeleteOBVoucher: 'DeleteOBVoucher',

  ////===================== Journal Voucher
  InsertJournalVoucher: 'JournalVoucher/InsertJournalVoucher',
  UpdateJournalVoucher: 'JournalVoucher/UpdateJournalVoucher',
  GetJVTRacking: 'JournalVoucher/GetJVTRacking?JournalVoucher_VNO=',
  GetPurchaseJVTRacking:
    'PurchaseJournal/GetPurchaseJVTRacking?JournalVoucher_VNO=',
  GetJournalVoucher: 'JournalVoucher/GetAllJournalVoucher',
  GetSavedJournalVoucherDetails: 'JournalVoucher/GetSavedJournalVoucherDetails',
  DeleteJournalVoucher: 'JournalVoucher/DeleteJournalVoucher',
  CheckVnoExistJournalVoucher: 'JournalVoucher/CheckVnoExistJournalVoucher',

  //=======DJvoucher
  InsertDJVoucher: 'JournalVoucher/InsertDepJournalVoucher',
  UpdateDJVoucher: 'JournalVoucher/UpdateDepJournalVoucher',
  GetDJVTRacking: 'JournalVoucher/GetJVTRacking?DepJournalVoucher_VNO=',
  GetDJVoucher: 'JournalVoucher/GetAllDepJournalVoucher',
  GetSavedDJVoucherDetails: 'JournalVoucher/GetSavedDepJournalVoucherDetails',
  DeleteDJVoucher: 'JournalVoucher/DeleteDepJournalVoucher',
  CheckVnoExistDJVoucher: 'JournalVoucher/CheckVnoExistDepJournalVoucher',

  ///====================== Contra voucher

  InsertContraVoucher: 'ContraVoucher/InsertContraVoucher',
  UpdateContraVoucher: 'ContraVoucher/UpdateContraVoucher',
  GetContraVoucher: 'ContraVoucher/GetContraVoucher',
  GetSavedContraVoucherDetails: 'ContraVoucher/GetSavedContraVoucherDetails',
  DeleteContraVoucher: 'ContraVoucher/DeleteContraVoucher',
  CheckVnoExistContraVoucher: 'ContraVoucher/CheckVnoExistContraVoucher',

  //=====================  Statements of Accounts
  MainReport_GetAccountsTransactionsLoadDropdown:
    'MainReport/AccountsTransactionsLoadDropdown',
  MainReport_GetAccountsTransactions_VoucherType:
    'MainReport/MainReport_GetAccountsTransactions_VoucherType',
  MainReport_GetReportAccountsTransactions:
    'MainReport/MainReport_GetReportAccountsTransactions',
  MainReport_GetReportAccountsTransactions_PARAM_CLASS:
    'MainReport/MainReport_GetReportAccountsTransactions_PARAM_CLASS',

  CustomerStattemnetbySummery: 'MainReport/CustomerStattemnetbySummery',
  AccountTransactionsHistory: 'Account/AccountTransactionsHistory',
  MainReport_GetReportStockRegister:
    'MainReport/MainReport_GetReportStockRegister',
  MainReport_GetReportSalesVoucher_PARAM_CLASS:
    'MainReport/MainReport_GetReportSalesVoucher_PARAM_CLASS',
  MainReport_GetReportPurchaseVoucher_PARAM_CLASS:
    'MainReport/MainReport_GetReportPurchaseVoucher_PARAM_CLASS',
  MainReport_GetReportPurchaseRequisition_PARAM_CLASS:
    'MainReport/MainReport_GetReportPurchaseRequisition_PARAM_CLASS',
  MainReport_GetReportProjectStatus_PARAM_CLASS:
    'MainReport/MainReport_GetReportProjectStatus_PARAM_CLASS',
  MainReport_GetReportPurchaseOrder_PARAM_CLASS:
    'MainReport/MainReport_GetReportPurchaseOrder_PARAM_CLASS',
  ReportPurchaseOrderSummary: 'MainReport/ReportPurchaseOrderSummary',
  GetReportPurchaseRequisition: 'MainReport/GetReportPurchaseRequisition',

  // ====================  Accounts statements By Others
  StatementOfAccountSummaryResponse:
    'StatementOfAccountSummary/StatementOfAccountSummaryResponse',
  GetAccountMasterDropdown: 'Account/GetAccountMasterDropdown',
  GetJobMasterDropdown: 'Account/GetJobMasterDropdown',
  GetAccountTransactions: 'Account/GetAccountTransactions',
  DownloadAccountStatement: 'Account/DownloadAccountStatement',
  GetVoucherTypeDropdown: 'Account/GetVoucherTypeDropdown',
  GetVoucherNoDropdown: 'Account/GetVoucherNoDropdown',
  GetAccountTransactionsVoucherPrint:
    'Account/GetAccountTransactionsVoucherPrint',
  DownloadVoucherPrint: 'Account/DownloadVoucherPrint',
  GetAccountMaster: 'Account/GetAccountMaster?filter=',
  GetAccountMasterGroup: 'Account/GetAccountMasterGroup',
  GetAccountTransactionsMultiAccountSummary:
    'Account/GetAccountTransactionsMultiAccountSummary',
  DownloadMultiAccountSummary: 'Account/DownloadMultiAccountSummary',
  GetAccountTransactionsMultiAccountDetail:
    'Account/GetAccountTransactionsMultiAccountDetail',
  DownloadMultiAccountDetail: 'Account/DownloadMultiAccountDetail',
  GetDaybookAccountTransactions: 'Account/GetDaybookAccountTransactions',
  GetCustomerMasterDropdown: 'Account/GetCustomerMasterDropdown',
  GetSupplierMasterDropdown: 'Account/GetSupplierMasterDropdown',
  GetAccountTransactionsVoucherAllocation:
    'Account/GetAccountTransactionsVoucherAllocation',
  GetCustomerSupplierMasterGroup: 'Account/GetCustomerSupplierMasterGroup',
  GetOutstandingStatementAccountTransactions:
    'Account/GetOutstandingStatementAccountTransactions',
  OutstandingStatementPrint: 'Account/OutstandingStatementPrint',
  AddEditRecordsInBalanceSheet: 'Account/AddEditRecordsInBalanceSheet',
  GetBalanceSheetList: 'Account/GetBalanceSheetList',
  DownloadOldBalanceSheetAccount: 'Account/DownloadOldBalanceSheetAccount',
  GetAgeingReport: 'Account/GetAgeingReport',
  AgeingReportPrint: 'Account/AgeingReportPrint',
  GetAssetMaster: 'Account/GetAssetMaster',
  AddEditAssetOpening: 'Account/AddEditAssetOpening',
  GetAssetOpening: 'Account/GetAssetOpening?id=',
  GetAssetOpeningList: 'Account/GetAssetOpeningList',

  //================================= AssetPurchase
  InsertAssetPurchase: 'AssetPurchase/InsertAssetPurchase',
  GetAllAssetPurchase: 'AssetPurchase/GetAllAssetPurchase',
  GetAssetVoucherDetails: 'AssetPurchase/GetAssetVoucherDetails',
  UpdateAssetPurchase: 'AssetPurchase/UpdateAssetPurchase',
  DeleteAssetPurchase: 'AssetPurchase/DeleteAssetPurchase',
  // getAllocationforPrint: 'Account/getAllocationforPrint',

  // End
  AddEditVoucherAllocation: 'Sales/AddEditVoucherAllocation',
  GetSpecificVoucherAllocation: 'Sales/GetSpecificVoucherAllocation?id=',
  GetVoucherAllocationsGridList: 'Sales/GetVoucherAllocationsGridList',
  GetAllocationDetails: 'payment/GetAllocationDetails',
};
export const JournalVoucherURL = {
  InsertJuornalVoucher: 'JournalVoucher/InsertJuornalVoucher',
  GetAllJournalVoucher: 'JournalVoucher/GetAllJournalVoucher',
  GenerateVoucherNo: 'JournalVoucher/GenerateVoucherNo',
  DeleteJournalVoucher: 'JournalVoucher/DeleteJournalVoucher?voucherId=',
  GetJVTRacking: 'JournalVoucher/GetJVTRacking?JournalVoucher_VNO=',
};

export const StoreUrls = {
  //================ Stock Transfer
  InsertStockTransfer: 'InsertStockTransfer',
  UpdateStockTransfer: 'UpdateStockTransfer',
  DeleteStockTransfer: 'DeleteStockTransfer',
  GetStockTransfer: 'GetStockTransfer',
  GetSavedStockTransferDetails: 'GetSavedStockTransferDetails',

  //================ Opening Stock
  InsertOpeningStock: 'OpeningStock/InsertOpeningStock',
  UpdateOpeningStock: 'OpeningStock/UpdateOpeningStock',
  DeleteOpeningStock: 'OpeningStock/DeleteOpeningStock',
  GetOpeningStock: 'OpeningStock/GetOpeningStock',
  GetSavedOpeningStockDetails: 'OpeningStock/GetSavedOpeningStockDetails',
  DeleteOpeningStockVoucher: 'OpeningStock/DeleteOpeningStockVoucher',
  GetSavedOpeningStockVoucherDetails:
    'OpeningStock/GetSavedOpeningStockVoucherDetails',

  InsertOpeningStockVoucher: 'OpeningStock/InsertOpeningStockVoucher',
  UpdateOpeningStockVoucher: 'OpeningStock/UpdateOpeningStockVoucher',
  GetOpeningStockVOucher: 'OpeningStock/GetOpeningStockVouchers',

  //====================== Purchase voucher report
  MainReport_GetReportStockRegister:
    'MainReport/MainReport_GetReportStockRegister',
  MainReport_GetReportStockLedger_PARAM_CLASS:
    'MainReport/MainReport_GetReportStockLedger_PARAM_CLASS',
  MainReport_GetAccountsTransactions_VoucherType:
    'MainReport/MainReport_GetAccountsTransactions_VoucherType',
  MainReport_GetReportAccountsTransactions:
    'MainReport/MainReport_GetReportAccountsTransactions',
  MainReport_GetReportAccountsTransactions_PARAM_CLASS:
    'MainReport/MainReport_GetReportAccountsTransactions_PARAM_CLASS',

  //========================================== Stock Ledger
  GetAllAccountSearchFilter: 'master/account/GetAllAccountSearchFilter',

  // ===========GetAllITems======
  GetAllItemListSearch: '/ItemList/GetAllItemListSearch',

  //========================================== Stock Ledger
  StockLedger_GetStockLedger: 'StockLedger/GetStockLedger',
  StockLedger_GetStockAgeingReport: 'StockLedger/GetStockAgeingReport',
  StockLedger_LoadDropdown: 'StockLedger/LoadDropdown',

  // =============================hr?
  GetAllHrSalaryHeads: 'HrSalaryHead/GetAllHrSalaryHeads',
  InsertHrSalaryHead: 'HrSalaryHead/InsertHrSalaryHead',
  UpdateHrSalaryHead: 'HrSalaryHead/UpdateHrSalaryHead',
  DeleteHrSalaryHead: 'HrSalaryHead/DeleteHrSalaryHead',

  GetAllHrOtherExpProperties: 'HrOtherExpProperties/GetAllHrOtherExpProperties',
  InsertHrOtherExpProperties: 'HrOtherExpProperties/InsertHrOtherExpProperties',
  UpdateHrOtherExpProperties: 'HrOtherExpProperties/UpdateHrOtherExpProperties',
  DeleteHrOtherExpProperties: 'HrOtherExpProperties/DeleteHrOtherExpProperties',
  GetExpensePropertiesByMasterID:
    'HrOtherExpProperties/GetExpensePropertiesByMasterID',
};

export const AccountsTransactionsURL = {
  GetAccountsTransactions: 'AccountsTransactions/GetAccountsTransactions',
  GetCashOrBankAccount: 'AccountsTransactions/GetCashOrBankAccount',
  GetBankStatementSummary: 'AccountsTransactions/GetBankStatementSummary',
};
export const auth = {
  login: 'login',
  authenticate: 'authenticate',
  refreshtoken: 'refresh-token',
  revoketoken: 'revoke-token',
};

export const PVUrl = {
  GenerateVoucherNo: 'payment/GenerateVoucherNo?VoucherGenDate=',
  GetUserTracking: 'payment/GetUserTracking?voucherNo=',
};

export const RVUrl = {
  GenerateVoucherNo: 'receipt/GenerateVoucherNo',
  // GetUserTracking: 'payment/GetUserTracking?voucherNo=',
};

export const JVUrl = {
  GenerateVoucherNo: 'JournalVoucher/GenerateVoucherNo',
  // GetUserTracking: 'payment/GetUserTracking?voucherNo=',
};

export const PurchaseJournalUrl = {
  GenerateVoucherNo: 'PurchaseJournal/GenerateVoucherNo',
  // GetUserTracking: 'payment/GetUserTracking?voucherNo=',
};
export const PDCURL = {
  PDCissuedLists: 'PDC/PDCissuedLists',
  GetPDCGetList: 'PDC/PDCGetList',
};

export const DebitUrl = {
  GenerateVoucherNo: 'DebitNote/GenerateVoucherNo',
  // GetUserTracking: 'payment/GetUserTracking?voucherNo=',
};
