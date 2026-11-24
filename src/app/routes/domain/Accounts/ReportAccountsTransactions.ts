
export interface ReportAccountsTransactions {
    accountsTransactionsTransSno?:number;
    accGroupNo?:string;
     accGroup?:string;
    accountsTransactionsAccNo?:string;
       accName?:string;
    
    
     
     
       accountsTransactionsTransDate?:Date;
       accountsTransactionsVoucherType?:string;
       accountsTransactionsVoucherNo?:string;

   
      accountsTransactionsDebit?:number;
      accountsTransactionsCredit?:number;
      accountsTransactionsFcDebit?:number;
      accountsTransactionsFcCredit?:number;
   

      accountsTransactionsAllocDebit?:number;
      accountsTransactionsAllocCredit?:number;
        accountsTransactionsAllocBalance?:number;
      accountsTransactionsFcAllocDebit?:number;
      accountsTransactionsFcAllocCredit?:number;
      accountsTransactionsFcAllocBalance?:number;
    

        accountsTransactionsParticulars?:string;
        accountsTransactionsDescription?:string;
        accountsTransactionsOpposEntryDesc?:string;



      accountsTransactionsVatno?:string;
      accountsTransactionsVatableAmount?:number;
      accountsTransactionsCheqNo?:string;
      accountsTransactionsCheqDate?:Date;
     departmentMasterDepartmentName?:string;
     locationMasterLocationName?:string;
     jobMasterJobName?:string;
     costCenterMasterCostCenterName?:string;
     currencyMasterCurrencyName?:string;
     accountsTransactionsFcRate?:number;
     refNo?:string;
     accountsTransactionsLpoNo?:string;
     accountsTransactionsApprovalDt?:Date;






     accountsTransactionsStatus?:string;
     accountsTransactionsTstamp?:Date;
 
        accountsTransactionsDrGram?:number;
      accountsTransactionsCrGram?:number;

     accountsTransactionsFsno?:number;
     accountsTransactionsUserId?:number;
     accountsTransactionsCompanyId?:number;
     accountsTransactionsCurrencyId?:number;
     accountsTransactionsLocation?:number;
     accountsTransactionsJobNo?:number;
      accountsTransactionsCostCenterId?:number;
      accountsTransactionsDepartment?:number;
      accountsTransactionsDeptId?:number;
      accountstransactionsDelStatus?:boolean;
      daysDiff:number;
  }