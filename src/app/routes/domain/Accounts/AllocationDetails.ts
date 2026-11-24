export interface AllocationDetails {
    TransNo: number;
    TransDate: Date ;
    VoucherNo: string;
    Type: string;
    Debit: number ;
    Credit: number ;
    Balance: number ;
    AllocAmount: number ;
    NetAllocation: number ;
    Status: string;
    RefLocation: string;
}